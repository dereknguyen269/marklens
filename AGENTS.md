# AGENTS.md

Chrome Manifest V3 extension. No build step, no package.json, no test runner, no lint.
All source is plain JS/HTML/CSS loaded directly by the browser.

## Load / run
- Load unpacked: `chrome://extensions` → Developer mode → "Load unpacked" → repo root.
- Requires Chrome >= 116 (manifest `minimum_chrome_version`); the `sidePanel` API is the reason.
- After any edit: reload the extension; also reload the target tab for injected (`content.js`) changes.
- Render sanity check (no browser needed): `node -e "const m=require('./vendor/marked.min.js');m.setOptions({gfm:true,breaks:true});console.log(m.parse('# hi\n\n**x**'))"`

## Layout — own code in `js/`, styles in `css/`, third-party in `vendor/`
- Root: `manifest.json`, `sidepanel.html`, `popup.html`, `options.html`, `icons/`.
- `js/`: `background.js` (service worker), `content.js` (injected popup), `sidepanel.js`, `popup.js`, `options.js`, `setupMarked.js`, `themes.js`, `storage.js`.
- `css/`: `styles.css`, `highlight.css`, `highlight-dark.css`.
- `vendor/`: all third-party + generated libs (marked, highlight, turndown, dompurify, plugins, `emoji-map.js`). Do not edit.
- Paths are relative (`js/…`, `css/…`, `vendor/…`) in `manifest.json`, `js/background.js` `INJECT_FILES`, `<script>`/`<link>` tags, and `chrome.runtime.getURL('css/highlight*.css')`. `manifest.json` stays at root (unpacked load dir).

## Architecture — two render surfaces, one lib stack
- `background.js` (service worker) is the orchestrator: two context menus (`Preview as Markdown`, `Convert HTML to Markdown`), reads `mdPreviewConfig.mode` from `chrome.storage.local`, then branches:
  - `mode === 'sidebar'`: `chrome.sidePanel.open` (must run while user gesture is active), stash selection in `chrome.storage.session` (`pendingMarkdown` / `pendingHtml`). Panel picks it up via `storage.onChanged` or on first load.
  - else (popup): inject `INJECT_FILES` (libs then `content.js`), grab live selection + rect, `tabs.sendMessage` (`renderMarkdown` / `convertHtmlToMarkdown`). On restricted pages (`chrome://`, etc.) falls back to side panel / full tab.
- `content.js` — floating popup injected into the page. Inline styles + `--md-*` vars only; never uses `styles.css`. Draggable/resizable, Esc-to-close, re-injection guard (existing box → re-bind listener, re-position).
- `sidepanel.html` / `sidepanel.js` — extension-page editor (split/edit/preview, MD↔HTML toggle). Styled by `styles.css` + `--bg/--surface/...` vars.- `popup.js`, `options.js` — thin storage readers/writers, no rendering. `options.html` (`open_in_tab`) holds default mode/theme/font/size + About.

## File roles
- `manifest.json` — entrypoint: service worker, `popup.html`, `options.html`, `sidepanel.html`, icons, `web_accessible_resources`.
- `setupMarked.js` — configures `globalThis.marked` once (GFM, breaks, footnote/deflist/extras/emoji/highlight). Exposes `setupMarked()`; safe to call repeatedly.
- `themes.js` — single source of truth: `MD_THEMES` (12 popup `--md-*` themes) and `MD_SIDEPANEL_THEMES` (12 `--bg/--surface/...` themes). `content.js` / `sidepanel.js` only reference these globals.
- `storage.js` — shared bridge: `mdStorage.load(defaults, cb)` / `mdStorage.save(config)` for key `mdPreviewConfig`.
- Vendored, do not edit: `marked.min.js` (v15, `globalThis.marked`), `marked-footnote.umd.js`, `marked-deflist.umd.js` (hand-written definition lists), `marked-emoji.umd.js` + `emoji-map.js` (1913 gemoji codes → `EMOJI_SHORTCODES`), `marked-highlight.umd.js`, `marked-extras.umd.js` (heading `{#id}`, `==mark==`, `~sub~`, `^sup^`), `highlight.min.js` (v11, `globalThis.hljs`), `highlight.css` / `highlight-dark.css`, `dompurify.min.js` (v3), `turndown.min.js` + `turndown-plugin-gfm.js` (`globalThis.TurndownService`, HTML→MD).
- `styles.css` — shared by side panel, popup, and options pages only.

## Gotchas
- Injection / script order is load order — `js/background.js` `INJECT_FILES` and `<script>` tags in `sidepanel.html` must keep vendored libs before `js/setupMarked.js` / `js/themes.js` → `vendor/dompurify.min.js` → `js/storage.js` → `js/content.js`/`js/sidepanel.js`. Do not reorder: renderers call `marked.use(...)` at boot and assume globals exist. Repeat right-clicks skip libs (only `content.js` re-injected) — see `libsReady()`.
- Plugin export shapes differ: `markedFootnote` is a bare function (`marked.use(markedFootnote())`); all others are named exports (`marked.use(lib.markedX())`). Emoji needs `EMOJI_SHORTCODES` loaded first.
- Sanitize every `marked.parse` / Turndown result with `DOMPurify.sanitize()` before `innerHTML` (page selections are untrusted XSS surface). Errors surface inline (`<pre style="color:#c00">` + `status` text), never throw.
- Storage contract: `chrome.storage.local` `mdPreviewConfig` = `{ mode, theme, fontSize, fontFamily }` (popup adds `width`/`height`); `DEFAULTS` is duplicated in `content.js`, `sidepanel.js`, `options.js`, `popup.js` — keep aligned. Separate key `marklensDraft` = `{ text, inputMode, updatedAt }` holds the autosaved editor draft (side panel only; restored on boot unless a pending selection wins). `chrome.storage.session` `pendingMarkdown` / `pendingHtml` is a one-shot bridge (consumed and deleted on read). `sidePanel.open` must be called synchronously in the gesture handler or Chrome rejects it.
- Side-panel extras: export via Blob download (`↓ MD` / `↓ HTML` standalone doc) and `window.print()` + `@media print` CSS for Save-as-PDF (no new permissions); drag-drop `.md/.txt/.html` onto `.editor-pane` (`FileReader`, HTML feeds `inputMode='html'`); proportional scroll sync both directions with re-entrancy guard; Zen mode = `body.zen` hides topbar/toolsbar/statusbar (session-only, `Alt+Z`, `Esc` exits).
- Theme `<option>` lists in `sidepanel.html` / `options.html` must match the 12 keys in `themes.js`. Side panel swaps `highlight.css` ↔ `highlight-dark.css` via `<link>` href from `theme.hl`; both files must stay in `web_accessible_resources`. MV3 CSP is `script-src 'self'` — no remote scripts.
- Manifest icons (`icons/icon16/48/128.png`) must exist or Chrome rejects load. Plain ES `var`/`function` style throughout (matches vendored UMD); no modules, no bundler.
