# Agent Instructions for Jarvis FICC Cockpit

## Scope

These instructions apply to this repository root and all files below it.

## Current Architecture

- This is a static GitHub Pages app.
- `index.html` is the primary entrypoint.
- `Jarvis FICC Cockpit.html` is a local alias and should stay equivalent to `index.html` when entrypoint markup changes.
- `data.js` owns the mock data (`window.JV_DATA`).
- `cockpit.js` owns rendering, UI state, event handling, timers, and simulated demo behavior.
- `app.css` owns component and layout styles.
- `ds/colors_and_type.css` owns design-system tokens and font declarations.
- There is no package manager, bundler, transpiler, framework runtime, or backend in the deployed app.

## Important: Do Not Reintroduce a Build Step

Do not add React/Vite/Next/package tooling unless the user explicitly requests a framework migration. Earlier `.jsx` scratch files may exist locally, but they are ignored and not deployed. Treat `cockpit.js` and `app.css` as the source of truth for the current app.

## Change Guidelines

- Make focused, minimal changes; avoid broad rewrites.
- Keep UI dense, enterprise, and calm.
- Prefer existing component patterns and `render*` helpers in `cockpit.js`.
- Prefer design tokens from `ds/colors_and_type.css` over hard-coded colors.
- Keep financial semantics clear:
  - gains/losses use financial status color
  - workflow actions like buy/sell/short should not automatically use green/red
  - document/credit/feed status should use explicit badges and labels
- Avoid full-app flicker where possible. For localized Jarvis/chat/note changes, update the local panel when existing helper functions support it.
- Preserve keyboard behavior:
  - `Cmd/Ctrl+K` opens search
  - `Shift+D` opens demo controls
  - `Esc` closes modal/customize/Jarvis/popovers
  - Jarvis chat sends on `Enter`, multiline on `Shift+Enter`
- Keep mobile Safari usability in mind. Use input font sizes that avoid iOS tap zoom and do not rely on hover-only interactions.

## Rendering and State Conventions

- `state` is declared near the top of `cockpit.js`.
- Main render flow starts at `renderApp()`.
- Panel renderers are named `render*`.
- Global click/input/change/keydown handlers are delegated near the bottom of `cockpit.js`.
- Simulated backend behavior lives in helpers such as `reloadVale`, `refreshPL`, `triggerInsight`, `runVoiceDemo`, `disconnectFeeds`, and `reconnectFeeds`.
- Use `escapeHtml()` for user-visible dynamic strings.
- Use `cleanText()` before enabling save/send buttons.
- Do not insert raw user text into HTML without escaping or intentional sanitization.

## Styling Conventions

- Add new CSS near related existing sections when possible.
- If adding overrides, keep them compact and name the intent in a short comment.
- Avoid over-specific selectors unless overriding older styles requires it.
- Keep popovers above the sticky bars and main content; z-index regressions have been a recurring issue.
- Keep Jarvis chat input constrained by max width in fullscreen and compact views.

## Files to Keep in Sync

- If script/link/meta markup changes, update both:
  - `index.html`
  - `Jarvis FICC Cockpit.html`
- If mock business data changes, update `data.js` first and then adjust renderers only if required.
- If design tokens change, update `ds/colors_and_type.css` and verify downstream CSS.

## Validation Before Handoff

Run:

```powershell
node --check cockpit.js
git diff --check
```

For UI work, also take a local screenshot if Edge is available:

```powershell
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
& $edge --headless --disable-gpu --no-first-run --disable-extensions --virtual-time-budget=2500 --window-size=1440,1100 --screenshot=screenshots\agent-smoke.png "file:///C:/ProjectsAI/Jarvis/jarvis/project/index.html"
```

Do not commit screenshots unless explicitly requested; `screenshots/` is ignored.

## Publishing

Only publish when the user explicitly asks. Publishing means committing and pushing to `main`, which triggers GitHub Pages.

Useful commands:

```powershell
git status -sb
git add <explicit files>
git commit -m "Short imperative summary"
git push origin main
gh run list --repo LucasBBR/jarvis-ficc-cockpit --limit 3
```

## Known Pitfalls

- The app is static, but it has many simulated states. Do not remove state handling because it looks unused in the happy path.
- Popovers can be clipped by overflow on the KPI strip; test Coverage, P&L, Documents, Credit, and Hit Ratio after layout changes.
- Jarvis chat and Notes use local panel updates to reduce flicker. Avoid replacing those with unnecessary full `renderApp()` calls.
- `*.jsx` is ignored by `.gitignore`; do not rely on those files for deployed behavior.
- The root `C:\ProjectsAI\Jarvis` contains `Jarvis-handoff.zip`, but the active repo is `C:\ProjectsAI\Jarvis\jarvis\project`.

