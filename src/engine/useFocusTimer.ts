import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ALIENS, LONG_BREAK_EVERY, MASTER_CONTROL_AT, WARNING_SEC, unlockedCount, type AlienId } from '../data/aliens';
import { completedCount, reducer, remainingMs, type Action } from './reducer';
import { loadStore, saveStore } from './storage';
import type { BreakKind, Phase } from './types';

export type TimerEvent =
  /** `late` means it happened while the app was closed or asleep, so skip the fanfare. */
  | { type: 'timeout'; late: boolean; breakKind: BreakKind; scanned: AlienId | null; masterControl: boolean }
  | { type: 'breakover'; late: boolean }
  | { type: 'warning' }
  | { type: 'countdown'; sec: number };

const LATE_MS = 5000;

export function useFocusTimer(onEvent: (event: TimerEvent) => void) {
  const [store, dispatch] = useReducer(reducer, undefined, loadStore);
  const [now, setNow] = useState(() => Date.now());
  const emit = useRef(onEvent);
  useEffect(() => {
    emit.current = onEvent;
  });

  useEffect(() => saveStore(store), [store]);

  const ticking = store.run !== null && store.run.endsAt !== null;
  // Fast while a timer runs; a slow tick otherwise keeps "today" correct across midnight.
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, ticking ? 250 : 30_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [ticking]);

  // Finish whatever has run out. Re-runs after each step, so a long absence catches up
  // through focus → break → ready in one go.
  useEffect(() => {
    const { run, history, cycle } = store;
    if (!run || run.endsAt === null || run.endsAt > now) return;
    const late = now - run.endsAt > LATE_MS;
    if (run.phase === 'break') {
      dispatch({ type: 'complete' });
      emit.current({ type: 'breakover', late });
      return;
    }
    const done = completedCount(history);
    const before = unlockedCount(done);
    const after = unlockedCount(done + 1);
    dispatch({ type: 'complete' });
    emit.current({
      type: 'timeout',
      late,
      breakKind: cycle + 1 >= LONG_BREAK_EVERY ? 'long' : 'short',
      scanned: after > before ? ALIENS[after - 1].id : null,
      masterControl: done + 1 === MASTER_CONTROL_AT,
    });
  }, [store, now]);

  const run = store.run;
  const remaining = run ? remainingMs(run, now) : 0;
  const remainingSec = Math.ceil(remaining / 1000);

  const lastSec = useRef<number | null>(null);
  useEffect(() => {
    const prev = lastSec.current;
    lastSec.current = run?.phase === 'focus' && run.endsAt !== null ? remainingSec : null;
    if (prev === null || lastSec.current === null || remainingSec >= prev) return;
    if (prev > WARNING_SEC && remainingSec <= WARNING_SEC) emit.current({ type: 'warning' });
    else if (remainingSec <= 10 && remainingSec > 0) emit.current({ type: 'countdown', sec: remainingSec });
  }, [remainingSec, run]);

  let phase: Phase = 'ready';
  if (run?.phase === 'break') phase = run.breakKind === 'long' ? 'longbreak' : 'break';
  else if (run?.phase === 'focus') {
    if (run.endsAt === null) phase = 'paused';
    else if (remainingSec <= WARNING_SEC) phase = 'warning';
    else phase = 'focus';
  }

  const act = useCallback((action: Action) => dispatch(action), []);

  return { store, now, phase, remainingSec, act };
}
