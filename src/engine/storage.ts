import { ALIENS, LONG_BREAK_MIN, SHORT_BREAK_MIN } from '../data/aliens';
import type { Store } from './types';

const KEY = 'omnitrix-focus.v1';

export const initialStore = (): Store => ({
  version: 1,
  history: [],
  selectedId: ALIENS[0].id,
  task: '',
  cycle: 0,
  run: null,
  settings: { sound: true, shortBreakMin: SHORT_BREAK_MIN, longBreakMin: LONG_BREAK_MIN, overrides: {} },
});

export function loadStore(): Store {
  const fresh = initialStore();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh;
    const saved = JSON.parse(raw) as Partial<Store>;
    if (saved.version !== 1) return fresh;
    return {
      ...fresh,
      ...saved,
      history: Array.isArray(saved.history) ? saved.history : [],
      settings: { ...fresh.settings, ...saved.settings },
    };
  } catch {
    return fresh;
  }
}

export function saveStore(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Storage can be full or blocked in private windows; the timer still works for this visit.
  }
}
