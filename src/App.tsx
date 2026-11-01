import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { setSoundEnabled, sfx, unlockAudio } from './audio/synth';
import { Omnitrix } from './components/Omnitrix';
import { Roster } from './components/Roster';
import { SessionLog } from './components/SessionLog';
import { SettingsDialog } from './components/SettingsDialog';
import { StatsPanel } from './components/StatsPanel';
import { ALIENS, alienById, unlockedCount, type AlienId } from './data/aliens';
import { completedCount, sessionMinutes } from './engine/reducer';
import { computeStats } from './engine/stats';
import type { Phase } from './engine/types';
import { useFocusTimer, type TimerEvent } from './engine/useFocusTimer';
import { clock } from './lib/format';
import { askForNotifications, notify } from './lib/notify';
import { PHASE_COLOR, updateTab } from './lib/tabIndicator';

interface Toast {
  id: number;
  title: string;
  body: string;
  tone: 'green' | 'yellow' | 'red' | 'amber';
}

const EYEBROW: Record<Phase, string> = {
  ready: 'Choose a form',
  focus: 'Hero time',
  paused: 'Paused',
  warning: 'Timing out',
  break: 'Recharging',
  longbreak: 'Road trip',
};

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

export default function App() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [flash, setFlash] = useState<{ key: number; color: string } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const toastId = useRef(0);

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++toastId.current;
    setToasts((all) => [...all.slice(-2), { ...t, id }]);
    window.setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), 6000);
  }, []);

  const burst = useCallback((color: string) => setFlash({ key: Date.now(), color }), []);

  const onEvent = useCallback(
    (e: TimerEvent) => {
      switch (e.type) {
        case 'warning':
          sfx.warning();
          setAnnouncement('One minute left.');
          break;
        case 'countdown':
          sfx.countdown();
          break;
        case 'timeout': {
          const long = e.breakKind === 'long';
          if (!e.late) {
            sfx.timeout();
            burst(PHASE_COLOR.break);
          }
          const title = long ? 'Road trip break' : 'Omnitrix timed out';
          const body = long ? 'Four sessions down. Take fifteen minutes away from the screen.' : 'Session complete. Recharge for a few minutes.';
          setAnnouncement(`${title}. ${body}`);
          void notify(title, body);
          if (e.scanned) {
            if (!e.late) window.setTimeout(sfx.scan, 400);
            pushToast({ title: 'New DNA scanned', body: `${alienById(e.scanned).name} is now on your dial.`, tone: 'yellow' });
          }
          if (e.masterControl) {
            pushToast({ title: 'Master Control unlocked', body: 'Every form is yours. Set custom lengths in Settings.', tone: 'green' });
          }
          break;
        }
        case 'breakover':
          if (!e.late) sfx.breakover();
          setAnnouncement('Recharged. Pick your next form.');
          void notify('Recharged', 'The Omnitrix is ready. Pick your next form.');
          break;
      }
    },
    [burst, pushToast],
  );

  const { store, now, phase, remainingSec, act } = useFocusTimer(onEvent);
  const { run, history, settings } = store;

  useEffect(() => setSoundEnabled(settings.sound), [settings.sound]);

  const completed = completedCount(history);
  const unlocked = unlockedCount(completed);
  const dialAliens = ALIENS.slice(0, unlocked);
  const selectedIndex = Math.max(0, dialAliens.findIndex((a) => a.id === store.selectedId));
  const selected = dialAliens[selectedIndex] ?? ALIENS[0];
  const shown = run ? alienById(run.alienId) : selected;
  const minutesFor = useCallback((id: AlienId) => sessionMinutes(store, id), [store]);
  const stats = useMemo(() => computeStats(history, now), [history, now]);

  const displaySec = run ? remainingSec : minutesFor(selected.id) * 60;
  const progress = run ? remainingSec / run.durationSec : 1;
  const onBreak = phase === 'break' || phase === 'longbreak';

  useEffect(() => {
    const t = clock(displaySec);
    const title =
      phase === 'ready'
        ? 'Omnitrix Focus Timer'
        : phase === 'paused'
          ? `Paused · ${t}`
          : onBreak
            ? `Recharging · ${t}`
            : `${t} · ${shown.name}`;
    updateTab(phase, title);
  }, [phase, displaySec, shown.name, onBreak]);

  const transform = useCallback(() => {
    unlockAudio();
    void askForNotifications();
    sfx.transform();
    burst(PHASE_COLOR.focus);
    act({ type: 'start', now: Date.now() });
    setAnnouncement(`Transformed into ${selected.name}. ${minutesFor(selected.id)} minutes on the clock.`);
  }, [act, burst, selected, minutesFor]);

  const select = useCallback(
    (index: number) => {
      const alien = dialAliens[index];
      if (alien) act({ type: 'select', id: alien.id });
    },
    [act, dialAliens],
  );

  const detent = useCallback(() => {
    unlockAudio();
    sfx.detent();
  }, []);

  const surprise = () => {
    if (dialAliens.length < 2) return;
    let index = selectedIndex;
    while (index === selectedIndex) index = Math.floor(Math.random() * dialAliens.length);
    detent();
    select(index);
  };

  const togglePause = useCallback(() => {
    if (phase === 'paused') act({ type: 'resume', now: Date.now() });
    else if (phase === 'focus' || phase === 'warning') act({ type: 'pause', now: Date.now() });
  }, [act, phase]);

  const stop = () => {
    act({ type: 'stop', now: Date.now() });
    setAnnouncement(onBreak ? 'Break skipped. Pick your next form.' : 'Detransformed. Session stopped early.');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || settingsOpen || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === 'Space') {
        if (e.target instanceof HTMLButtonElement) return;
        e.preventDefault();
        if (phase === 'ready') transform();
        else togglePause();
      } else if (e.key === 'm' || e.key === 'M') {
        act({ type: 'settings', patch: { sound: !settings.sound } });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, transform, togglePause, act, settings.sound, settingsOpen]);

  let line: string;
  if (phase === 'ready') line = selected.role;
  else if (onBreak)
    line = phase === 'longbreak' ? 'Four sessions down. Get up, stretch, go outside.' : 'Step away from the screen. The dial unlocks when the recharge is done.';
  else line = run?.task ? run.task : 'No task named. Just stay on this one thing.';

  return (
    <div className="app" data-phase={phase} style={{ ['--glow' as string]: PHASE_COLOR[phase] }}>
      <header className="topbar">
        <div className="brand">
          <svg viewBox="0 0 24 24" className="brand-mark" aria-hidden>
            <circle cx="12" cy="12" r="10.5" />
            <path d="M6 3.5 H18 L12 12 L18 20.5 H6 L12 12 Z" />
          </svg>
          <span className="brand-name">Omnitrix</span>
          <span className="brand-sub">focus timer</span>
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className="icon-btn"
            aria-pressed={!settings.sound}
            aria-label={settings.sound ? 'Mute sound (M)' : 'Unmute sound (M)'}
            title={settings.sound ? 'Mute (M)' : 'Unmute (M)'}
            onClick={() => act({ type: 'settings', patch: { sound: !settings.sound } })}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" />
              {settings.sound ? <path d="M16 9 Q18.5 12 16 15 M18.5 6.5 Q23 12 18.5 17.5" className="stroke" /> : <path d="M16 9 L21 15 M21 9 L16 15" className="stroke" />}
            </svg>
          </button>
          <button type="button" className="icon-btn" aria-label="Settings" title="Settings" onClick={() => setSettingsOpen(true)}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M4 7 H20 M4 17 H20" className="stroke" />
              <circle cx="9" cy="7" r="2.6" />
              <circle cx="15" cy="17" r="2.6" />
            </svg>
          </button>
        </div>
      </header>

      <main>
        <section className="stage" aria-label="Timer">
          <div className="strap" aria-hidden />
          <Omnitrix
            phase={phase}
            aliens={dialAliens}
            selectedIndex={selectedIndex}
            shown={shown}
            progress={progress}
            onSelect={select}
            onDetent={detent}
            onSlam={transform}
          />
        </section>

        <section className="readout">
          <p className="eyebrow">{EYEBROW[phase]}</p>
          <h1 className="alien-name">{onBreak ? (phase === 'longbreak' ? 'Long break' : 'Short break') : shown.name}</h1>
          <p className="countdown" role="timer" aria-label={`${clock(displaySec)} remaining`}>
            {clock(displaySec)}
          </p>
          <p className="line">{line}</p>

          {phase === 'ready' && (
            <label className="task">
              <span className="sr-only">What are you working on?</span>
              <input
                type="text"
                value={store.task}
                maxLength={80}
                placeholder="What are you working on?"
                onChange={(e) => act({ type: 'task', text: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') transform();
                }}
              />
            </label>
          )}

          <div className="controls">
            {phase === 'ready' && (
              <>
                <button type="button" className="btn btn-primary" onClick={transform}>
                  Transform <kbd>Space</kbd>
                </button>
                <button type="button" className="btn" onClick={surprise} disabled={dialAliens.length < 2}>
                  Surprise me
                </button>
              </>
            )}
            {(phase === 'focus' || phase === 'warning' || phase === 'paused') && (
              <>
                <button type="button" className="btn btn-primary" onClick={togglePause}>
                  {phase === 'paused' ? 'Resume' : 'Pause'} <kbd>Space</kbd>
                </button>
                <button type="button" className="btn btn-danger" onClick={stop}>
                  Detransform
                </button>
              </>
            )}
            {onBreak && (
              <button type="button" className="btn" onClick={stop}>
                Skip break
              </button>
            )}
          </div>
          {phase === 'ready' && <p className="hint">Twist the dial, scroll, or use the arrow keys to pick a form. Tap the face to transform.</p>}
        </section>

        <Roster
          unlocked={unlocked}
          completed={completed}
          selectedId={store.selectedId}
          minutesFor={minutesFor}
          disabled={run !== null}
          onPick={(id) => {
            detent();
            act({ type: 'select', id });
          }}
        />

        <div className="lower">
          <StatsPanel stats={stats} />
          <SessionLog history={history} now={now} />
        </div>
      </main>

      <footer className="footer">
        <p>A fan-made focus timer. Not affiliated with Cartoon Network.</p>
      </footer>

      {flash && (
        <div
          key={flash.key}
          className="flash"
          style={{ ['--flash' as string]: flash.color }}
          onAnimationEnd={() => setFlash(null)}
          aria-hidden
        />
      )}

      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast tone-${t.tone}`}>
            <strong>{t.title}</strong>
            <span>{t.body}</span>
          </div>
        ))}
      </div>
      <p className="sr-only" aria-live="assertive">
        {announcement}
      </p>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        completed={completed}
        onSettings={(patch) => act({ type: 'settings', patch })}
        onOverride={(id, minutes) => act({ type: 'override', id, minutes })}
        onErase={() => act({ type: 'erase' })}
      />
    </div>
  );
}
