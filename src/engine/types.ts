import type { AlienId } from '../data/aliens';

export interface Session {
  id: string;
  alienId: AlienId;
  task: string;
  endedAt: number;
  plannedSec: number;
  focusedSec: number;
  completed: boolean;
}

export type BreakKind = 'short' | 'long';

export interface Run {
  phase: 'focus' | 'break';
  breakKind?: BreakKind;
  alienId: AlienId;
  task: string;
  durationSec: number;
  /** Wall-clock end time; null while paused. */
  endsAt: number | null;
  /** Time left when paused. Ignored while running. */
  pausedRemainingMs: number;
}

export interface Settings {
  sound: boolean;
  shortBreakMin: number;
  longBreakMin: number;
  /** Custom session lengths, available once Master Control is open. */
  overrides: Partial<Record<AlienId, number>>;
}

export interface Store {
  version: 1;
  history: Session[];
  selectedId: AlienId;
  task: string;
  /** Completed focus sessions since the last long break. */
  cycle: number;
  run: Run | null;
  settings: Settings;
}

export type Phase = 'ready' | 'focus' | 'warning' | 'paused' | 'break' | 'longbreak';
