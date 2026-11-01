import { AlienSilhouette } from '../art/AlienSilhouette';
import { alienById } from '../data/aliens';
import { dayKey } from '../engine/stats';
import type { Session } from '../engine/types';
import { timeOfDay } from '../lib/format';

export function SessionLog({ history, now }: { history: Session[]; now: number }) {
  const recent = history.slice(-12).reverse();
  const today = dayKey(now);

  return (
    <section className="panel log" aria-labelledby="log-title">
      <header className="panel-head">
        <h2 id="log-title">Mission log</h2>
      </header>
      {recent.length === 0 ? (
        <p className="empty">No missions yet. Pick a form above and press Transform to start your first session.</p>
      ) : (
        <ol className="log-list">
          {recent.map((s) => (
            <li key={s.id} className={s.completed ? '' : 'is-stopped'}>
              <AlienSilhouette id={s.alienId} className="log-art" />
              <div className="log-main">
                <span className="log-name">{alienById(s.alienId).name}</span>
                <span className="log-task">{s.task || 'No task named'}</span>
              </div>
              <div className="log-meta">
                <span>{s.completed ? `${Math.round(s.plannedSec / 60)} min` : `Stopped at ${Math.round(s.focusedSec / 60)} min`}</span>
                <span className="log-when">
                  {dayKey(s.endedAt) === today
                    ? timeOfDay(s.endedAt)
                    : new Date(s.endedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
