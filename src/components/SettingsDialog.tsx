import { useEffect, useRef, useState } from 'react';
import { ALIENS, MASTER_CONTROL_AT, type AlienId } from '../data/aliens';
import type { Settings } from '../engine/types';
import { askForNotifications, notificationPermission } from '../lib/notify';
import { plural } from '../lib/format';

interface Props {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  completed: number;
  onSettings: (patch: Partial<Settings>) => void;
  onOverride: (id: AlienId, minutes: number | null) => void;
  onErase: () => void;
}

const clampMin = (v: string, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(Number(v) || lo)));

export function SettingsDialog({ open, onClose, settings, completed, onSettings, onOverride, onErase }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [permission, setPermission] = useState(notificationPermission);
  const master = completed >= MASTER_CONTROL_AT;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      setPermission(notificationPermission());
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="settings" onClose={onClose} aria-labelledby="settings-title">
      <header className="settings-head">
        <h2 id="settings-title">Settings</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close settings">
          ×
        </button>
      </header>

      <section className="settings-row">
        <div>
          <h3>Sound</h3>
          <p>Dial clicks, the transform burst and the timeout beeps.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.sound}
          className="switch"
          onClick={() => onSettings({ sound: !settings.sound })}
        >
          <span className="sr-only">Sound</span>
        </button>
      </section>

      <section className="settings-row">
        <div>
          <h3>Notifications</h3>
          <p>
            {permission === 'granted' && 'On. You’ll get an alert when a session or break ends while the app is in the background.'}
            {permission === 'default' && 'Get an alert when a session or break ends while the app is in the background.'}
            {permission === 'denied' && 'Blocked. Allow notifications for this site in your browser settings to turn them on.'}
            {permission === 'unsupported' && 'This browser doesn’t support notifications.'}
          </p>
        </div>
        {permission === 'default' && (
          <button type="button" className="btn btn-small" onClick={async () => setPermission(await askForNotifications())}>
            Turn on
          </button>
        )}
      </section>

      <section className={`master ${master ? 'is-open' : ''}`}>
        <h3>Master Control</h3>
        {master ? (
          <>
            <p>Unlocked. Set your own lengths for every form and break.</p>
            <div className="master-grid">
              <label>
                <span>Short break</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={settings.shortBreakMin}
                  onChange={(e) => onSettings({ shortBreakMin: clampMin(e.target.value, 1, 30) })}
                />
              </label>
              <label>
                <span>Long break</span>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={settings.longBreakMin}
                  onChange={(e) => onSettings({ longBreakMin: clampMin(e.target.value, 5, 60) })}
                />
              </label>
              {ALIENS.map((alien) => (
                <label key={alien.id}>
                  <span>{alien.name}</span>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={settings.overrides[alien.id] ?? alien.minutes}
                    onChange={(e) => {
                      const v = clampMin(e.target.value, 1, 120);
                      onOverride(alien.id, v === alien.minutes ? null : v);
                    }}
                  />
                </label>
              ))}
            </div>
            <p className="master-note">All values are in minutes.</p>
          </>
        ) : (
          <p>
            Locked. Scan every form to take full control of the timer: {plural(MASTER_CONTROL_AT - completed, 'more session')} to go.
          </p>
        )}
      </section>

      <section className="settings-row danger">
        <div>
          <h3>Erase history</h3>
          <p>Clears your mission log, streaks and scanned forms on this device.</p>
        </div>
        <button
          type="button"
          className="btn btn-small btn-danger"
          onClick={() => {
            if (window.confirm('Erase all history, streaks and scanned forms? This can’t be undone.')) onErase();
          }}
        >
          Erase
        </button>
      </section>
    </dialog>
  );
}
