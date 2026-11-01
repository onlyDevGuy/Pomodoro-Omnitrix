import { ALIENS, LONG_BREAK_EVERY, alienById, unlockedCount, type AlienId } from '../data/aliens';
import { initialStore } from './storage';
import type { Run, Session, Settings, Store } from './types';

export type Action =
  | { type: 'select'; id: AlienId }
  | { type: 'task'; text: string }
  | { type: 'start'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'stop'; now: number }
  | { type: 'complete' }
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'override'; id: AlienId; minutes: number | null }
  | { type: 'erase' };

// Clamped to the run length, so a stale `now` can never show more time than was set.
export const remainingMs = (run: Run, now: number) =>
  run.endsAt === null ? run.pausedRemainingMs : Math.min(run.durationSec * 1000, Math.max(0, run.endsAt - now));

export const completedCount = (history: Session[]) => history.filter((s) => s.completed).length;

export const sessionMinutes = (store: Store, id: AlienId) =>
  store.settings.overrides[id] ?? alienById(id).minutes;

const newId = () => Math.random().toString(36).slice(2, 10);

export function reducer(store: Store, action: Action): Store {
  const { run } = store;
  switch (action.type) {
    case 'select': {
      if (run) return store;
      const index = ALIENS.findIndex((a) => a.id === action.id);
      if (index < 0 || index >= unlockedCount(completedCount(store.history))) return store;
      return { ...store, selectedId: action.id };
    }
    case 'task':
      return { ...store, task: action.text.slice(0, 80) };
    case 'start': {
      if (run) return store;
      const durationSec = sessionMinutes(store, store.selectedId) * 60;
      return {
        ...store,
        run: {
          phase: 'focus',
          alienId: store.selectedId,
          task: store.task.trim(),
          durationSec,
          endsAt: action.now + durationSec * 1000,
          pausedRemainingMs: 0,
        },
      };
    }
    case 'pause':
      if (!run || run.endsAt === null) return store;
      return { ...store, run: { ...run, endsAt: null, pausedRemainingMs: remainingMs(run, action.now) } };
    case 'resume':
      if (!run || run.endsAt !== null) return store;
      return { ...store, run: { ...run, endsAt: action.now + run.pausedRemainingMs } };
    case 'stop': {
      if (!run) return store;
      if (run.phase === 'break') return { ...store, run: null };
      const focusedSec = Math.round(run.durationSec - remainingMs(run, action.now) / 1000);
      const session: Session = {
        id: newId(),
        alienId: run.alienId,
        task: run.task,
        endedAt: action.now,
        plannedSec: run.durationSec,
        focusedSec,
        completed: false,
      };
      // A session stopped in its first minute is a false start, not worth a log entry.
      const history = focusedSec >= 60 ? [...store.history, session] : store.history;
      return { ...store, history, run: null };
    }
    case 'complete': {
      if (!run || run.endsAt === null) return store;
      if (run.phase === 'break') return { ...store, run: null };
      // Chain from the scheduled end, so a session that ended while the app was closed
      // starts its break at the right moment too.
      const at = run.endsAt;
      const session: Session = {
        id: newId(),
        alienId: run.alienId,
        task: run.task,
        endedAt: at,
        plannedSec: run.durationSec,
        focusedSec: run.durationSec,
        completed: true,
      };
      const cycle = store.cycle + 1;
      const isLong = cycle >= LONG_BREAK_EVERY;
      const breakSec = (isLong ? store.settings.longBreakMin : store.settings.shortBreakMin) * 60;
      return {
        ...store,
        history: [...store.history, session],
        cycle: isLong ? 0 : cycle,
        run: {
          phase: 'break',
          breakKind: isLong ? 'long' : 'short',
          alienId: run.alienId,
          task: run.task,
          durationSec: breakSec,
          endsAt: at + breakSec * 1000,
          pausedRemainingMs: 0,
        },
      };
    }
    case 'settings':
      return { ...store, settings: { ...store.settings, ...action.patch } };
    case 'override': {
      const overrides = { ...store.settings.overrides };
      if (action.minutes === null) delete overrides[action.id];
      else overrides[action.id] = action.minutes;
      return { ...store, settings: { ...store.settings, overrides } };
    }
    case 'erase': {
      const fresh = initialStore();
      return { ...fresh, settings: { ...fresh.settings, sound: store.settings.sound } };
    }
  }
}
