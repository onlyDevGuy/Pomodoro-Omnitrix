import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { AlienShape } from '../art/AlienSilhouette';
import type { Alien } from '../data/aliens';
import type { Phase } from '../engine/types';

const C = 200;
/** Degrees of twist per alien. */
const STEP = 30;
const FACE_R = 118;
const TRACK_R = 130;
const CIRC = 2 * Math.PI * TRACK_R;

const mod = (n: number, m: number) => ((n % m) + m) % m;
const indexFor = (angle: number, count: number) => mod(Math.round(angle / STEP), count);

interface Props {
  phase: Phase;
  aliens: Alien[];
  selectedIndex: number;
  /** The alien on the face: the selected one when ready, the active one otherwise. */
  shown: Alien;
  /** Fraction of the current session or break still to go, 0 to 1. */
  progress: number;
  onSelect: (index: number) => void;
  onDetent: () => void;
  onSlam: () => void;
}

export function Omnitrix({ phase, aliens, selectedIndex, shown, progress, onSelect, onDetent, onSlam }: Props) {
  const ready = phase === 'ready';
  const count = aliens.length;
  const [angle, setAngle] = useState(selectedIndex * STEP);
  const [dragging, setDragging] = useState(false);
  const [slamming, setSlamming] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ pointer: number; last: number; angle: number; travel: number } | null>(null);
  /** Set when a press turned into a twist, so letting go doesn't also slam. */
  const twisted = useRef(false);

  // Keep the bezel in step when the selection changes from the keyboard or the roster.
  useEffect(() => {
    if (drag.current) return;
    setAngle((a) => {
      const current = indexFor(a, count);
      if (current === selectedIndex) return a;
      let delta = mod(selectedIndex - current, count);
      if (delta > count / 2) delta -= count;
      return Math.round(a / STEP) * STEP + delta * STEP;
    });
  }, [selectedIndex, count]);

  const pointerAngle = (e: PointerEvent) => {
    const box = svgRef.current!.getBoundingClientRect();
    const x = e.clientX - (box.left + box.width / 2);
    const y = e.clientY - (box.top + box.height / 2);
    // Near the centre the angle swings wildly, so ignore it there.
    if (Math.hypot(x, y) < box.width * 0.12) return null;
    return (Math.atan2(y, x) * 180) / Math.PI;
  };

  const startTwist = (e: PointerEvent<SVGElement>) => {
    if (!ready || e.button !== 0) return;
    twisted.current = false;
    drag.current = { pointer: e.pointerId, last: pointerAngle(e) ?? 0, angle, travel: 0 };
    if (pointerAngle(e) === null) drag.current.last = NaN;
  };

  const twist = (e: PointerEvent<SVGElement>) => {
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    const now = pointerAngle(e);
    if (now === null) return;
    if (Number.isNaN(d.last)) {
      d.last = now;
      return;
    }
    let delta = now - d.last;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    d.last = now;
    d.travel += Math.abs(delta);
    if (!twisted.current && d.travel > 6) {
      twisted.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
    }
    if (!twisted.current) return;
    const before = indexFor(d.angle, count);
    d.angle += delta;
    const after = indexFor(d.angle, count);
    setAngle(d.angle);
    if (after !== before) {
      onDetent();
      onSelect(after);
    }
  };

  const endTwist = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    setDragging(false);
    setAngle(Math.round(d.angle / STEP) * STEP);
  };

  const slam = () => {
    if (!ready) return;
    if (twisted.current) {
      twisted.current = false;
      return;
    }
    setSlamming(true);
    window.setTimeout(() => setSlamming(false), 520);
    onSlam();
  };

  // Scroll to twist. Needs a non-passive listener so the page doesn't scroll at the same time.
  // A page scroll that happens to pass over the dial must not twist it: only a wheel gesture
  // that starts after the pointer has rested on the dial counts.
  const wheel = useRef({ enteredAt: 0, lastPass: 0, acc: 0 });
  useEffect(() => {
    const el = svgRef.current;
    if (!el || !ready) return;
    const w = wheel.current;
    const onEnter = () => {
      w.enteredAt = performance.now();
    };
    const onWheel = (e: WheelEvent) => {
      const t = performance.now();
      if (t - w.enteredAt < 400 || t - w.lastPass < 400) {
        w.lastPass = t;
        return;
      }
      e.preventDefault();
      w.acc += e.deltaY;
      if (Math.abs(w.acc) < 40) return;
      const dir = w.acc > 0 ? 1 : -1;
      w.acc = 0;
      onDetent();
      onSelect(mod(selectedIndex + dir, count));
    };
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('wheel', onWheel);
    };
  }, [ready, selectedIndex, count, onSelect, onDetent]);

  const onKey = (e: KeyboardEvent) => {
    if (!ready) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      onDetent();
      onSelect(mod(selectedIndex + 1, count));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      onDetent();
      onSelect(mod(selectedIndex - 1, count));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      slam();
    }
  };

  const tabs = [45, 135, 225, 315];
  const notches = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <div
      className={`omnitrix ${slamming ? 'is-slamming' : ''}`}
      data-phase={phase}
      role="slider"
      tabIndex={ready ? 0 : -1}
      aria-label="Omnitrix dial: choose a form"
      aria-valuemin={0}
      aria-valuemax={count - 1}
      aria-valuenow={selectedIndex}
      aria-valuetext={`${shown.name}, ${shown.minutes} minutes`}
      aria-disabled={!ready}
      onKeyDown={onKey}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className={`omnitrix-svg ${dragging ? 'is-dragging' : ''}`}
        onPointerDown={startTwist}
        onPointerMove={twist}
        onPointerUp={endTwist}
        onPointerCancel={endTwist}
      >
        <defs>
          <clipPath id="face-clip">
            <circle cx={C} cy={C} r={FACE_R} />
          </clipPath>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="2" fill="#0C0A14" opacity="0.45" />
          </pattern>
        </defs>

        {/* Housing, with a hard cartoon shadow */}
        <g transform="translate(8 10)" className="ink-fill">
          {tabs.map((t) => (
            <rect key={t} x={C - 36} y={C - 196} width="72" height="60" rx="14" transform={`rotate(${t} ${C} ${C})`} />
          ))}
          <circle cx={C} cy={C} r="172" />
        </g>
        {tabs.map((t) => (
          <rect
            key={t}
            className="tab"
            x={C - 36}
            y={C - 196}
            width="72"
            height="60"
            rx="14"
            transform={`rotate(${t} ${C} ${C})`}
          />
        ))}
        <circle className="housing" cx={C} cy={C} r="172" />
        <path className="housing-shine" d="M76 120 A150 150 0 0 1 150 52" />
        <path className="pointer" d={`M${C - 9} 30 L${C + 9} 30 L${C} 44 Z`} />

        {/* Twistable bezel */}
        <g className={`bezel ${dragging ? 'is-dragging' : ''}`} style={{ transform: `rotate(${angle}deg)` }}>
          <circle className="bezel-ring" cx={C} cy={C} r="154" />
          {notches.map((n) => (
            <rect
              key={n}
              className={n === 0 ? 'notch notch-key' : 'notch'}
              x={C - 5}
              y={C - 152}
              width="10"
              height="18"
              rx="3"
              transform={`rotate(${n} ${C} ${C})`}
            />
          ))}
        </g>

        <circle className="track" cx={C} cy={C} r={TRACK_R} />
        {!ready && (
          <circle
            className="progress"
            cx={C}
            cy={C}
            r={TRACK_R}
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
            transform={`rotate(-90 ${C} ${C})`}
          />
        )}

        {/* Faceplate: press it to transform */}
        <g className="face" onClick={slam}>
          <circle className="face-bg" cx={C} cy={C} r={FACE_R} />
          <g clipPath="url(#face-clip)" className="face-glow">
            <path className={ready ? 'hourglass is-ghost' : 'hourglass'} d="M100 58 L300 58 L200 200 L300 342 L100 342 L200 200 Z" filter="url(#glow)" />
            {ready && (
              <svg key={shown.id} x="112" y="104" width="176" height="176" viewBox="0 0 100 100" fill="currentColor" className="alien hologram" filter="url(#glow)">
                <AlienShape id={shown.id} />
              </svg>
            )}
            {ready && <rect x="80" y="80" width="240" height="240" fill="url(#scanlines)" pointerEvents="none" />}
          </g>
          <circle className="face-rim" cx={C} cy={C} r={FACE_R} />
          <path className="glass" d="M122 150 A90 90 0 0 1 182 104" />
        </g>
      </svg>
    </div>
  );
}
