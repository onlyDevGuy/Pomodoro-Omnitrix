import { ALIENS, type AlienId } from '../data/aliens';
import type { Session } from './types';

export const dayKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const shiftDay = (ts: number, days: number) => {
  const d = new Date(ts);
  d.setDate(d.getDate() + days);
  return d.getTime();
};

export interface DayCell {
  key: string;
  label: string;
  completed: number;
  minutes: number;
  isToday: boolean;
}

export interface Stats {
  todayMinutes: number;
  todayCompleted: number;
  streak: number;
  bestStreak: number;
  totalCompleted: number;
  totalHours: number;
  favourite: AlienId | null;
  week: DayCell[];
}

export function computeStats(history: Session[], now: number): Stats {
  const today = dayKey(now);
  const byDay = new Map<string, { completed: number; minutes: number }>();
  const perAlien = new Map<AlienId, number>();
  let totalSec = 0;

  for (const s of history) {
    const key = dayKey(s.endedAt);
    const day = byDay.get(key) ?? { completed: 0, minutes: 0 };
    day.minutes += s.focusedSec / 60;
    if (s.completed) {
      day.completed += 1;
      perAlien.set(s.alienId, (perAlien.get(s.alienId) ?? 0) + 1);
    }
    byDay.set(key, day);
    totalSec += s.focusedSec;
  }

  const active = (key: string) => (byDay.get(key)?.completed ?? 0) > 0;

  // The streak survives until the end of today, so start counting from yesterday if today is empty.
  let streak = 0;
  let cursor = active(today) ? now : shiftDay(now, -1);
  while (active(dayKey(cursor))) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }

  let bestStreak = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of [...byDay.keys()].filter(active).sort()) {
    const [y, m, d] = key.split('-').map(Number);
    const dayBefore = dayKey(shiftDay(new Date(y, m - 1, d).getTime(), -1));
    run = prev === dayBefore ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    prev = key;
  }

  const week: DayCell[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const ts = shiftDay(now, -i);
    const key = dayKey(ts);
    const day = byDay.get(key);
    week.push({
      key,
      label: new Date(ts).toLocaleDateString(undefined, { weekday: 'short' }),
      completed: day?.completed ?? 0,
      minutes: Math.round(day?.minutes ?? 0),
      isToday: key === today,
    });
  }

  let favourite: AlienId | null = null;
  let best = 0;
  for (const alien of ALIENS) {
    const n = perAlien.get(alien.id) ?? 0;
    if (n > best) {
      best = n;
      favourite = alien.id;
    }
  }

  return {
    todayMinutes: Math.round(byDay.get(today)?.minutes ?? 0),
    todayCompleted: byDay.get(today)?.completed ?? 0,
    streak,
    bestStreak,
    totalCompleted: history.filter((s) => s.completed).length,
    totalHours: Math.round((totalSec / 3600) * 10) / 10,
    favourite,
    week,
  };
}
