import { alienById } from '../data/aliens';
import type { Stats } from '../engine/stats';
import { plural } from '../lib/format';

export function StatsPanel({ stats }: { stats: Stats }) {
  return (
    <section className="panel stats" aria-labelledby="stats-title">
      <header className="panel-head">
        <h2 id="stats-title">Hero record</h2>
      </header>

      <dl className="stat-grid">
        <div>
          <dt>Today</dt>
          <dd>
            <b>{stats.todayMinutes}</b> min
          </dd>
          <dd className="stat-sub">{plural(stats.todayCompleted, 'session')} done</dd>
        </div>
        <div>
          <dt>Streak</dt>
          <dd>
            <b>{stats.streak}</b> {stats.streak === 1 ? 'day' : 'days'}
          </dd>
          <dd className="stat-sub">Best: {plural(stats.bestStreak, 'day')}</dd>
        </div>
        <div>
          <dt>All time</dt>
          <dd>
            <b>{stats.totalHours}</b> h
          </dd>
          <dd className="stat-sub">{plural(stats.totalCompleted, 'session')}</dd>
        </div>
        <div>
          <dt>Go-to form</dt>
          <dd className="stat-form">{stats.favourite ? alienById(stats.favourite).name : '—'}</dd>
        </div>
      </dl>

      <div className="week" aria-label="Last seven days">
        {stats.week.map((day) => (
          <div
            key={day.key}
            className={`week-day ${day.completed > 0 ? 'is-hit' : ''} ${day.isToday ? 'is-today' : ''}`}
            title={`${day.label}: ${plural(day.completed, 'session')}, ${day.minutes} min`}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="10" className="week-ring" />
              <path d="M6 4 H18 L12 12 L18 20 H6 L12 12 Z" className="week-glass" />
            </svg>
            <span className="week-label">{day.label}</span>
            <span className="sr-only">
              {plural(day.completed, 'session')}, {day.minutes} minutes
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
