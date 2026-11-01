# Omnitrix Focus Timer

**Live:** https://onlydevguy.github.io/Pomodoro-Omnitrix/

A fan-made pomodoro timer inspired by the 2005 Omnitrix. Every alien form is a session length: twist the dial to pick one, slam the face to transform, and stay in hero mode until it times out.

## Run it

```bash
npm install
npm run dev      # http://localhost:4395
npm run build    # production build in dist/, installable and works offline
npm run preview  # serve that build at http://localhost:4396/Pomodoro-Omnitrix/
npm run icons    # regenerate app icons from public/favicon.svg
```

## How it works

| Form | Minutes | Unlock |
|---|---|---|
| Four Arms, XLR8, Heatblast | 25, 15, 30 | From the start |
| Grey Matter → Ghostfreak | 10 – 60 | One new form every 3 completed sessions |

- **Short break** (5 min) after each session, **long break** (15 min) after every 4th.
- **Warning** for the last minute: the face blinks red and beeps through the final 10 seconds.
- **Master Control** opens after 21 completed sessions, when every form is scanned, and lets you set custom lengths in Settings.
- **Detransform** stops a session early. It's logged as stopped unless it ran less than a minute.
- The timer counts down from a stored end time, so it stays accurate in background tabs and resumes after a refresh.

### Controls

| Action | Mouse / touch | Keyboard |
|---|---|---|
| Pick a form | Twist the dial, scroll over it, or tap a roster card | ← → with the dial focused |
| Transform | Tap the face or press Transform | Space, or Enter in the task box |
| Pause / resume | Pause button | Space |
| Mute | Speaker button | M |

## Deploying

Every push to `main` builds the app and publishes it to GitHub Pages through `.github/workflows/deploy.yml`. Production builds are served from `/Pomodoro-Omnitrix/`; if the repo is renamed, update `base` in `vite.config.ts` to match.

## Stack

React 19, TypeScript and Vite, with Tailwind v4 and `vite-plugin-pwa`. All sounds are synthesised with the Web Audio API and all artwork is original SVG, so there are no external media files. History, streaks and unlocks are stored in `localStorage` on the device.

```
src/
  data/aliens.ts            roster, durations, unlock rules
  engine/                   reducer, persistence, stats, useFocusTimer hook
  components/Omnitrix.tsx   the twistable dial
  art/AlienSilhouette.tsx   original silhouettes on a 100×100 grid
  audio/synth.ts            generated sound effects
```

Not affiliated with Cartoon Network. Ben 10 and the Omnitrix are trademarks of their owners.
