// Every sound is generated on the fly, so there are no audio files to load or license.

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let enabled = true;

export const setSoundEnabled = (on: boolean) => {
  enabled = on;
};

/** Browsers only allow audio after a user gesture, so call this from a click or key press. */
export function unlockAudio() {
  if (!ctx) {
    ctx = new AudioContext();
    const comp = ctx.createDynamicsCompressor();
    out = ctx.createGain();
    out.gain.value = 0.45;
    out.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

interface ToneOpts {
  freq: number;
  to?: number;
  type?: OscillatorType;
  at?: number;
  dur: number;
  gain?: number;
  cutoff?: number;
}

function tone({ freq, to, type = 'square', at = 0, dur, gain = 0.3, cutoff }: ToneOpts) {
  if (!ctx || !out) return;
  const t = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node: AudioNode = osc;
  if (cutoff) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    node = osc.connect(filter);
  }
  node.connect(env).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise(at: number, dur: number, gain: number, from: number, to: number) {
  if (!ctx || !out) return;
  const t = ctx.currentTime + at;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 2;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  const env = ctx.createGain();
  env.gain.setValueAtTime(gain, t);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(env).connect(out);
  src.start(t);
}

const play = (fn: () => void) => () => {
  if (enabled && ctx) fn();
};

export const sfx = {
  /** One click of the dial. */
  detent: play(() => {
    tone({ freq: 2400, type: 'square', dur: 0.025, gain: 0.08 });
    noise(0, 0.03, 0.12, 4000, 2500);
  }),
  /** Faceplate pops up, then the slam and the green burst. */
  transform: play(() => {
    tone({ freq: 180, to: 1400, type: 'sawtooth', dur: 0.32, gain: 0.18, cutoff: 3200 });
    noise(0, 0.35, 0.25, 600, 6000);
    tone({ freq: 90, to: 45, type: 'sine', at: 0.3, dur: 0.35, gain: 0.6 });
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone({ freq: f, type: 'triangle', at: 0.32 + i * 0.03, dur: 0.9, gain: 0.14 }),
    );
  }),
  /** One minute left: the watch starts to complain. */
  warning: play(() => {
    [0, 0.18, 0.36].forEach((at) => tone({ freq: 1320, type: 'square', at, dur: 0.1, gain: 0.12 }));
  }),
  countdown: play(() => {
    tone({ freq: 1560, type: 'square', dur: 0.07, gain: 0.1 });
  }),
  /** Time is up: detransform. */
  timeout: play(() => {
    [0, 0.14, 0.28, 0.42].forEach((at) => tone({ freq: 1180, type: 'square', at, dur: 0.09, gain: 0.12 }));
    tone({ freq: 1100, to: 70, type: 'sawtooth', at: 0.6, dur: 0.9, gain: 0.22, cutoff: 1800 });
    noise(0.6, 0.8, 0.2, 5000, 300);
  }),
  breakover: play(() => {
    [659.25, 783.99, 987.77].forEach((f, i) => tone({ freq: f, type: 'sine', at: i * 0.12, dur: 0.6, gain: 0.2 }));
  }),
  /** New DNA scanned. */
  scan: play(() => {
    for (let i = 0; i < 10; i += 1) tone({ freq: 880 + i * 110, type: 'triangle', at: 0.9 + i * 0.05, dur: 0.12, gain: 0.1 });
    tone({ freq: 1760, type: 'sine', at: 1.45, dur: 0.8, gain: 0.16 });
  }),
};
