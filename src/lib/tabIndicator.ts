import type { Phase } from '../engine/types';

export const PHASE_COLOR: Record<Phase, string> = {
  ready: '#73F33A',
  focus: '#73F33A',
  paused: '#73F33A',
  warning: '#FF4A3D',
  break: '#FF4A3D',
  longbreak: '#FFB43A',
};

const icon = (color: string, dim: boolean) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><clipPath id="f"><circle cx="32" cy="32" r="19"/></clipPath></defs><circle cx="32" cy="32" r="30" fill="#E6E4DC" stroke="#0C0A14" stroke-width="3"/><circle cx="32" cy="32" r="24" fill="#8C8C99" stroke="#0C0A14" stroke-width="3"/><circle cx="32" cy="32" r="19" fill="#0C0A14"/><path clip-path="url(#f)" fill="${color}" fill-opacity="${dim ? 0.45 : 1}" d="M17 11h30L32 32 47 53H17l15-21z"/><circle cx="32" cy="32" r="19" fill="none" stroke="#0C0A14" stroke-width="3"/></svg>`;

let lastHref = '';

export function updateTab(phase: Phase, title: string) {
  document.title = title;
  const href = `data:image/svg+xml,${encodeURIComponent(icon(PHASE_COLOR[phase], phase === 'paused' || phase === 'ready'))}`;
  if (href === lastHref) return;
  lastHref = href;
  const link = document.getElementById('tab-icon') as HTMLLinkElement | null;
  if (link) link.href = href;
}
