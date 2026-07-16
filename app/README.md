# Sprout

A cozy, mood-shifting to-do widget for Mac and Windows: a moon mascot that reacts to your progress, an AI brain-dump that sorts messy notes into tasks, a pomodoro focus timer, and a notes scratchpad. Implements the design from `../project/Sprout Widget.dc.html`.

Sprout is a real multi-user app: each person signs in with their own account and their to-dos/notes/focus history sync to the cloud (via Supabase), so the same account works across Mac and Windows installs.

## Cloud setup (one-time, do this before running the app)

Sprout needs a Supabase project to hold user accounts and data — you can't run the multi-user features without this.

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard, go to **SQL Editor → New query**, paste in the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates the `days` table with Row Level Security so each user can only ever read/write their own rows.
3. Go to **Project Settings → API** and copy the **Project URL** and the **anon / public key**.
4. In this folder, copy `.env.example` to `.env` and fill in those two values:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. (Optional) In **Authentication → Providers → Email**, you can turn off "Confirm email" while testing with a few people so accounts work immediately without waiting on a confirmation email. Supabase's built-in email sending is rate-limited on the free tier — for a real launch, connect your own SMTP under **Authentication → Email Templates / SMTP Settings**.

The anon key is meant to be public/shipped in the app — it's safe because access is enforced by the RLS policy in `schema.sql`, not by keeping the key secret.

If `.env` is left empty, Sprout runs in **local-only mode**: no sign-in, data stays in that browser/device's storage only (useful for quickly trying out the UI without setting up Supabase).

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

## Accounts & sync

- Sign in / create an account with email + password. On first sign-in, if your account has no cloud data yet, whatever was already stored locally on that device (e.g. from trying the app before signing in) is imported automatically.
- Tasks, notes, focus-session counts, and history all sync through Supabase and are available on any device you sign into.
- Theme, focus/break duration preferences, and the Anthropic API key stay **local to each device** (not synced) — they're per-installation settings, not account data.
- Log out from **⚙ Settings** at the top of the widget.
