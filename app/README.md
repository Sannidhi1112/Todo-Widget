# Sprout

A cozy, mood-shifting to-do widget for Mac and Windows: a moon mascot that reacts to your progress, an AI brain-dump that sorts messy notes into tasks, a pomodoro focus timer, and a notes scratchpad. Implements the design from `../project/Sprout Widget.dc.html`.

## Develop

```
npm install
npm run electron:dev
```

This runs the Vite dev server and launches the Electron widget pointed at it, with hot reload.

To preview just the UI in a regular browser (AI features fall back to local behavior, no API key needed):

```
npm run dev
```

## Build

```
npm run electron:build
```

Produces a packaged app (`.dmg` on Mac, NSIS installer on Windows) via `electron-builder`.

## AI features

Click the ⚙ icon next to the theme swatches to add an Anthropic API key. It's stored locally on-device (via `electron-store`) and used from the Electron main process to call the Claude API for:

- Brain-dump sorting (Today tab → "Brain dump — let AI sort it")
- Mascot chat replies (❝ button)

Without a key, both features fall back to the same local behavior as the original prototype (simple line-splitting for brain dump, canned mascot lines).

## Widget behavior

- Frameless, transparent, fixed-size (420×640) window, positioned near the top-right of the screen on first launch and remembered after that.
- Draggable from any non-interactive area of the card (not just the small handle bar).
- Lives in the system tray (moon icon) — closing the window keeps it running; use the tray menu to show/hide or quit.

## Daily history

- Tasks, notes, and focus-session counts are stored per calendar day.
- Click the **Today** tab while it's already active to open a calendar. Any past date with data shows a small dot; selecting one shows a **read-only recap** of that day (tasks, notes, focus sessions) — only "Today" is ever editable. "← Back to Today" returns to the live view.
- If you leave unfinished tasks at the end of a day, the next time you open Sprout you'll get a **catch-up prompt** listing them — tick which ones to carry into today (added fresh, unchecked); anything left unticked stays archived in that day's history as missed.

## Focus timer

Presets (15/25/45/60 min) or a custom minute value, set independently for Focus and Break — pick a mode, then a duration; it resets the timer to that length.
