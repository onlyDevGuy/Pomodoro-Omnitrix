import type { ReactNode } from 'react';
import type { AlienId } from '../data/aliens';

// Each form is a hand-built silhouette on a 100×100 grid, filled with currentColor.
// `.cut` shapes punch details (eyes, teeth, circuits) back out in the face colour.

/** Draw the left half once, then mirror it for symmetric forms. */
const Mirror = ({ children }: { children: ReactNode }) => (
  <>
    {children}
    <g transform="translate(100 0) scale(-1 1)">{children}</g>
  </>
);

const shapes: Record<AlienId, ReactNode> = {
  fourarms: (
    <>
      <circle cx="50" cy="17" r="9" />
      <path d="M28 31 Q50 21 72 31 L68 62 Q50 69 32 62 Z" />
      <Mirror>
        <path d="M31 31 L15 39 L8 55 L16 58 L21 46 L33 42 Z" />
        <circle cx="11" cy="60" r="6" />
        <path d="M33 46 L20 58 L16 72 L23 74 L26 63 L35 56 Z" />
        <circle cx="18" cy="77" r="5.5" />
        <path d="M37 62 L33 93 L45 93 L48 66 Z" />
      </Mirror>
      <Mirror>
        <circle className="cut" cx="45" cy="15" r="1.6" />
        <circle className="cut" cx="45.5" cy="20" r="1.3" />
      </Mirror>
    </>
  ),
  xlr8: (
    <>
      <path d="M58 21 Q73 12 89 23 L84 31 Q70 36 58 30 Z" />
      <path className="cut" d="M69 24.5 Q77 22 83 25.5 L81.5 27.5 Q75 29 69 27.5 Z" />
      <path d="M60 28 Q49 30 39 44 Q43 57 54 53 Q62 45 65 32 Z" />
      <path d="M42 46 Q22 54 3 67 Q24 61 47 55 Z" />
      <path d="M58 39 L69 45 L74 43 L71 48 L60 47 Z" />
      <path d="M47 50 L53 66 L45 80 L51 92 L57 92 L53 80 L61 66 L55 50 Z" />
      <path d="M40 52 L42 68 L34 80 L38 92 L44 92 L41 80 L49 66 L47 52 Z" />
      <circle cx="54" cy="93" r="3.5" />
      <circle cx="41" cy="93" r="3.5" />
    </>
  ),
  heatblast: (
    <>
      <path d="M37 27 Q34 14 41 5 Q44 14 47 12 Q48 1 55 3 Q52 12 57 12 Q62 5 66 9 Q61 16 63 27 Q50 33 37 27 Z" />
      <path d="M36 34 L64 34 L67 46 L60 62 L40 62 L33 46 Z" />
      <Mirror>
        <path d="M36 36 L26 46 L21 62 L28 64 L32 50 L41 42 Z" />
        <path d="M20 63 Q18 70 24 73 Q22 68 27 66 Z" />
        <path d="M41 62 L38 94 L47 94 L49 66 Z" />
        <path d="M37 34 L33 27 L41 32 Z" />
        <path className="cut" d="M43 22 L47 21 L47 24 Z" />
      </Mirror>
      <path className="cut" d="M44 44 L50 40 L56 44 L50 50 Z" />
    </>
  ),
  greymatter: (
    <>
      <path d="M30 46 Q30 27 50 27 Q70 27 70 46 Q68 60 50 61 Q32 60 30 46 Z" />
      <path d="M41 58 Q50 55 59 58 L61 75 L39 75 Z" />
      <Mirror>
        <ellipse className="cut" cx="42" cy="43" rx="5" ry="6.5" />
        <path d="M42 62 L31 70 L33 73 L43 67 Z" />
        <path d="M42 72 L33 84 L39 90 L46 77 Z" />
        <ellipse cx="35" cy="91" rx="6" ry="2.5" />
      </Mirror>
      <path className="cut line" d="M45 53 Q50 55 55 53" fill="none" strokeWidth="1.4" />
    </>
  ),
  stinkfly: (
    <>
      <Mirror>
        <ellipse cx="27" cy="34" rx="21" ry="8" transform="rotate(-24 27 34)" opacity="0.7" />
        <ellipse cx="30" cy="53" rx="16" ry="6" transform="rotate(18 30 53)" opacity="0.7" />
        <path d="M46 23 L39 11" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="38" cy="9" r="4.5" />
        <circle className="cut" cx="38" cy="9" r="1.8" />
        <path d="M45 52 L36 64 L32 76" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </Mirror>
      <circle cx="50" cy="28" r="8" />
      <ellipse cx="50" cy="47" rx="8.5" ry="14" />
      <path d="M43 58 Q50 96 57 58 Z" />
    </>
  ),
  wildmutt: (
    <>
      <path d="M17 54 Q28 35 55 36 Q72 36 79 46 L73 61 Q50 65 25 63 Z" />
      <path d="M69 40 Q86 37 95 48 Q91 59 78 61 L71 53 Z" />
      <path className="cut" d="M80 52 L93 50 L91 54 L81 56 Z" />
      <path d="M28 41 L32 29 L37 39 Z M38 37 L43 25 L47 36 Z M49 36 L54 25 L57 36 Z M59 37 L64 28 L66 39 Z" />
      <path d="M70 57 L74 79 L83 84 L81 89 L67 89 L63 61 Z" />
      <path d="M58 60 L60 80 L66 89 L56 89 L52 62 Z" opacity="0.75" />
      <path d="M27 59 L22 80 L30 89 L37 89 L32 80 L37 61 Z" />
      <path d="M38 61 L36 81 L43 89 L47 89 L44 79 L46 62 Z" opacity="0.75" />
      <path d="M19 52 L6 46 L17 59 Z" />
    </>
  ),
  ripjaws: (
    <>
      <path d="M50 13 Q50 1 61 3 Q68 6 65 13" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="65" cy="14" r="3.8" />
      <path d="M33 28 Q33 12 50 12 Q67 12 67 28 L65 39 Q50 45 35 39 Z" />
      <path className="cut" d="M38 30 L62 30 L59 37 L56 33 L53 37 L50 33 L47 37 L44 33 L41 37 Z" />
      <path d="M37 41 Q50 47 63 41 L65 61 Q50 67 35 61 Z" />
      <Mirror>
        <circle className="cut" cx="42" cy="23" r="2" />
        <path d="M38 43 L26 55 L24 66 L31 63 L33 55 L41 50 Z" />
        <path d="M37 46 L27 41 L35 52 Z" />
      </Mirror>
      <path d="M37 60 Q35 76 46 84 L33 97 L50 91 L67 97 L54 84 Q65 76 63 60 Z" />
    </>
  ),
  diamondhead: (
    <>
      <path d="M42 27 L43 13 L50 3 L57 13 L58 27 L50 31 Z" />
      <path className="cut" d="M44 19 L48 20 L47 22 Z M56 19 L52 20 L53 22 Z" />
      <path d="M36 32 L64 32 L62 50 L56 62 L44 62 L38 50 Z" />
      <Mirror>
        <path d="M35 34 L22 13 L40 30 Z" />
        <path d="M41 32 L35 17 L45 30 Z" />
        <path d="M36 34 L24 50 L20 64 L27 66 L31 54 L41 42 Z" />
        <path d="M20 64 L27 66 L21 76 Z" />
        <path d="M44 62 L40 94 L48 94 L50 66 Z" />
      </Mirror>
      <path className="cut" d="M50 36 L55 44 L50 52 L45 44 Z" />
    </>
  ),
  upgrade: (
    <>
      <circle cx="50" cy="22" r="12.5" />
      <circle className="cut" cx="50" cy="22" r="6.5" />
      <circle cx="50" cy="22" r="2.8" />
      <path d="M38 35 Q50 31 62 35 Q67 49 62 65 L38 65 Q33 49 38 35 Z" />
      <Mirror>
        <path d="M38 37 Q25 45 25 63 Q29 66 32 61 Q32 49 41 45 Z" />
        <path d="M40 63 Q38 80 38 94 L47 94 L49 65 Z" />
      </Mirror>
      <path
        className="cut line"
        d="M50 38 V48 H44 V58 M50 48 H57 V55 M44 58 H47 M57 55 H60"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </>
  ),
  ghostfreak: (
    <>
      <path d="M40 25 Q39 9 52 9 Q65 11 63 26 Q57 33 46 33 Z" />
      <circle className="cut" cx="55" cy="20" r="3.8" />
      <path d="M40 30 Q30 50 36 67 Q42 80 29 95 Q51 87 57 72 Q65 54 62 28 Z" />
      <path d="M41 37 Q24 41 16 53 L11 61 L16 59 L14 66 L20 59 L21 64 L25 55 Q31 47 43 45 Z" />
      <path d="M60 37 Q75 43 81 55 L88 59 L81 59 L83 66 L77 59 L75 63 Q68 51 58 45 Z" />
      <path className="cut line" d="M46 44 Q52 50 50 60 M53 42 Q58 50 56 58" fill="none" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
};

interface Props {
  id: AlienId;
  className?: string;
  title?: string;
}

export function AlienSilhouette({ id, className, title }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`alien ${className ?? ''}`}
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {shapes[id]}
    </svg>
  );
}

/** Shown on the roster for forms that haven't been scanned yet. */
export function UnknownSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`alien ${className ?? ''}`} fill="currentColor" aria-hidden>
      <circle cx="50" cy="20" r="11" />
      <path d="M33 35 Q50 29 67 35 L64 64 L36 64 Z" />
      <Mirror>
        <path d="M34 37 L24 52 L22 64 L29 64 L32 53 L40 45 Z" />
        <path d="M40 63 L38 94 L47 94 L49 66 Z" />
      </Mirror>
      <text x="50" y="57" textAnchor="middle" fontSize="22" fontFamily="Bungee, sans-serif" className="cut">
        ?
      </text>
    </svg>
  );
}

/** The raw shapes, for drawing inside another SVG on the 100×100 grid. */
export const AlienShape = ({ id }: { id: AlienId }) => <>{shapes[id]}</>;
