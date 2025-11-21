# Glass Journal Overlay

Cluely/Wispr-style glassmorphism journal overlay for macOS & Windows built with Electron, React, and SQLite. Hit the global shortcut to summon a minimal always-on-top journal card near your cursor, write, save, and drop right back into what you were doing.

## Features
- Global shortcut toggle (macOS: `Cmd+Shift+J`, Windows/Linux: `Ctrl+Shift+J`) works even when unfocused.
- Frameless, transparent, always-on-top overlay (420×280) positioned near the cursor; stays above fullscreen apps on macOS.
- Dismiss on `Esc`, click outside, or loss of focus (300ms grace). Focus returns to the previous app automatically.
- Glass UI with blur, gradient noise, quick show/hide animation, autofocus textarea, Enter-to-save (Shift+Enter for newline), save pulse, char counter, and Cancel.
- Persistent storage in `userData/journal.db` (SQLite via `better-sqlite3`) with JSON fallback for environments without SQLite.
- Tray/menu bar icon with “Open Journal” and “Quit”. First launch shows a small onboarding toast/notification about the shortcut.
- Secure IPC bridge with contextIsolation; `saveEntry`, `listEntries`, and `ping` exposed via `window.api`.

## Quickstart
1) Install deps (Node 18+):
```bash
npm install
```

2) Run the dev overlay (Vite + Electron + tsup watch):
```bash
npm run dev
```
This starts the renderer on port 5173, builds main/preload to `dist-electron`, and launches Electron pointing at the dev server.

3) Use it:
- Toggle overlay: `Cmd+Shift+J` on macOS, `Ctrl+Shift+J` on Windows/Linux.
- Type in the glass card, press Enter to save (Shift+Enter = newline), Esc or the ×/Cancel to hide.
- Click outside or change focus to auto-hide; the previous app regains focus.

## Build & Package
- Production build (renderer + electron bundles):
```bash
npm run build
```
- Electron bundle only:
```bash
npm run build:electron
```
- Create platform installers via electron-builder (dmg/nsis):
```bash
npm run package
```
Outputs live in `dist/` (renderer) and `dist-electron/` (main/preload). Package artifacts will be under `dist/` per electron-builder defaults.

## Architecture Notes
- `electron/main.ts`: Window creation, global shortcut toggle, tray menu, focus/blur auto-hide, onboarding notification, and IPC wiring.
- `electron/preload.ts`: Context-bridged `window.api` exposing `ping`, `saveEntry`, `listEntries`, `hideOverlay`, overlay visibility events, and onboarding.
- `electron/storage.ts`: SQLite-backed journal store with automatic JSON fallback. Entries: `{ id: string; text: string; createdAt: number; updatedAt?: number; }`.
- `src/App.tsx`: Glass overlay UI + interactions (animations, autofocusing, key handling, toast). Uses Tailwind for styling.
- `tsup.config.ts`: Builds main & preload to CommonJS (`dist-electron/*.cjs`) so Electron can load them directly.

## Default Shortcut Remapping
Change the hotkey in `electron/main.ts` (`setShortcut` helper). Rebuild/restart after updates.

## Troubleshooting
- If the shortcut doesn’t fire, ensure no other app has claimed it and that the app/tray is running.
- On first launch you should see a system notification with the shortcut. If you don’t, delete `~/Library/Application Support/glass-journal-overlay/settings.json` (mac) or the equivalent `AppData/Roaming/glass-journal-overlay` file (win) and restart.
- For renderer tweaks without restarting Electron, Vite HMR works; main/preload changes require a restart (stop `npm run dev` and rerun).
