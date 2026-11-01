import { AlienSilhouette, UnknownSilhouette } from '../art/AlienSilhouette';
import { ALIENS, SESSIONS_PER_SCAN, type AlienId } from '../data/aliens';
import { plural } from '../lib/format';

interface Props {
  unlocked: number;
  completed: number;
  selectedId: AlienId;
  minutesFor: (id: AlienId) => number;
  disabled: boolean;
  onPick: (id: AlienId) => void;
}

export function Roster({ unlocked, completed, selectedId, minutesFor, disabled, onPick }: Props) {
  const toNext = SESSIONS_PER_SCAN - (completed % SESSIONS_PER_SCAN);
  const allScanned = unlocked >= ALIENS.length;

  return (
    <section className="panel roster" aria-labelledby="roster-title">
      <header className="panel-head">
        <h2 id="roster-title">Forms</h2>
        <p className="panel-note">
          {allScanned
            ? 'All ten forms scanned.'
            : `${unlocked} of ${ALIENS.length} scanned · next DNA scan in ${plural(toNext, 'session')}`}
        </p>
      </header>
      {!allScanned && (
        <div className="scan-meter" aria-hidden>
          {Array.from({ length: SESSIONS_PER_SCAN }, (_, i) => (
            <span key={i} className={i < completed % SESSIONS_PER_SCAN ? 'is-on' : ''} />
          ))}
        </div>
      )}
      <ul className="roster-grid">
        {ALIENS.map((alien, i) => {
          const open = i < unlocked;
          const isNext = i === unlocked;
          return (
            <li key={alien.id}>
              {open ? (
                <button
                  type="button"
                  className="form-card"
                  aria-pressed={alien.id === selectedId}
                  disabled={disabled}
                  onClick={() => onPick(alien.id)}
                >
                  <AlienSilhouette id={alien.id} className="form-art" />
                  <span className="form-name">{alien.name}</span>
                  <span className="form-min">{minutesFor(alien.id)} min</span>
                </button>
              ) : (
                <div className={`form-card is-locked ${isNext ? 'is-next' : ''}`}>
                  <UnknownSilhouette className="form-art" />
                  <span className="form-name">{isNext ? 'Next scan' : 'Unknown'}</span>
                  <span className="form-min">{isNext ? `${toNext} to go` : 'Locked'}</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
