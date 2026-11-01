export type AlienId =
  | 'fourarms' | 'xlr8' | 'heatblast' | 'greymatter' | 'stinkfly'
  | 'wildmutt' | 'ripjaws' | 'diamondhead' | 'upgrade' | 'ghostfreak';

export interface Alien {
  id: AlienId;
  name: string;
  minutes: number;
  /** What kind of work this form suits. */
  role: string;
}

/** The order here is the unlock order: the first three are available from the start. */
export const ALIENS: Alien[] = [
  { id: 'fourarms', name: 'Four Arms', minutes: 25, role: 'The classic. Heavy lifting, one task at a time.' },
  { id: 'xlr8', name: 'XLR8', minutes: 15, role: 'Quick sprint. Clear the small stuff fast.' },
  { id: 'heatblast', name: 'Heatblast', minutes: 30, role: 'Burn through a hard problem.' },
  { id: 'greymatter', name: 'Grey Matter', minutes: 10, role: 'Tiny but sharp. Review, plan, tidy up.' },
  { id: 'stinkfly', name: 'Stinkfly', minutes: 20, role: 'Get a bird’s-eye view. Outlines and research.' },
  { id: 'wildmutt', name: 'Wildmutt', minutes: 35, role: 'Hunt mode. Track down every bug.' },
  { id: 'ripjaws', name: 'Ripjaws', minutes: 40, role: 'Deep dive. Go under and stay under.' },
  { id: 'diamondhead', name: 'Diamondhead', minutes: 45, role: 'Unbreakable focus for long builds.' },
  { id: 'upgrade', name: 'Upgrade', minutes: 50, role: 'Merge with the machine. Deep work.' },
  { id: 'ghostfreak', name: 'Ghostfreak', minutes: 60, role: 'Vanish for an hour. Notifications off.' },
];

export const STARTER_COUNT = 3;
/** Completed sessions needed to scan each new alien. */
export const SESSIONS_PER_SCAN = 3;
export const SHORT_BREAK_MIN = 5;
export const LONG_BREAK_MIN = 15;
export const LONG_BREAK_EVERY = 4;
export const WARNING_SEC = 60;

export const alienById = (id: AlienId) => ALIENS.find((a) => a.id === id) ?? ALIENS[0];

export const unlockedCount = (completed: number) =>
  Math.min(ALIENS.length, STARTER_COUNT + Math.floor(completed / SESSIONS_PER_SCAN));

/** Completed sessions needed before every alien is scanned and Master Control opens. */
export const MASTER_CONTROL_AT = (ALIENS.length - STARTER_COUNT) * SESSIONS_PER_SCAN;
