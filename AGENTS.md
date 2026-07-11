# AGENTS.md

Chrome Manifest V3 extension. No build step, no package.json, no test runner.
All source is plain JS/HTML/CSS loaded directly by the browser.

## Load / run
- Load unpacked: `chrome://extensions` → enable Developer mode → "Load unpacked" → select repo root.
- Requires Chrome >= 116 (manifest `minimum_chrome_version`); the `sidePanel` API is the reason.
- No npm install, bundler, or lint configured. Edits to JS/HTML are picked up by reloading the extension (and the tab for injected scripts).

## File roles
- `manifest.json` — entrypoint. Lists `background.js` (service worker), `sidepanel.html`, icons, `web_accessible_resources`.
- `background.js` — service worker. Creates the "Preview as Markdown" context menu, injects all scripts + `content.js` into the active tab in one `executeScript` call (files run in array order), captures the selection rect, sends `renderMarkdown` message. Falls back to side panel on restricted pages.
- `marked.min.js` — vendored [marked](https://marked.js.org/) v15 (MIT). Markdown→HTML parser. Exposes `globalThis.marked` (`marked.parse(md)`). Do not edit.
- `marked-footnote.umd.js` — vendored `marked-footnote` plugin. Exposes `globalThis.markedFootnote` (direct function export, called as `marked.use(markedFootnote())`).
- `marked-deflist.umd.js` — hand-written block extension for GFM definition lists (`term` + `: definition`). Exposes `globalThis.markedDeflist.markedDeflist`.
- `marked-emoji.umd.js` — vendored `marked-emoji` plugin. Exposes `globalThis.markedEmoji.markedEmoji`. Needs an `emojis` map.
- `emoji-map.js` — auto-generated shortcode→unicode map (1913 codes from `github/gemoji`). Exposes `globalThis.EMOJI_SHORTCODES`.
- `marked-highlight.umd.js` — vendored `marked-highlight` plugin for syntax highlighting. Exposes `globalThis.markedHighlight.markedHighlight`.
- `marked-extras.umd.js` — hand-written inline extensions: heading IDs (`{#id}`), highlight (`==text==`→`<mark>`), subscript (`~text~`→`<sub>`), superscript (`^text^`→`<sup>`). Exposes `globalThis.markedExtras.markedExtras`.
- `highlight.min.js` — vendored [highlight.js](https://highlightjs.org/) v11 (BSD). Exposes `globalThis.hljs`.
- `highlight.css` / `highlight-dark.css` — vendored highlight.js themes (GitHub light/dark). Listed in `web_accessible_resources`.
- `content.js` — injected floating preview. 8 popup themes via CSS custom properties. Theme/font/size/copy controls. Resize handle. Esc-to-close. Config persisted to `chrome.storage.local`.
- `sidepanel.html` / `sidepanel.js` — standalone editor/preview panel with split/edit/preview views. Loads all scripts then `sidepanel.js`.
- `styles.css` — side panel styles (the floating popup uses inline styles in `content.js`).

## Gotchas
- Injection order: `background.js` uses a single `executeScript` with `files: [...]` array — files run in array order, so `marked.min.js` and all plugins are loaded before `content.js`. Do not reorder.
- Plugin export styles differ: `markedFootnote` is a direct function (`marked.use(markedFootnote())`); all others are named exports on an object (`marked.use(lib.markedX())`).
- `chrome.storage.session` (`pendingMarkdown`) is the bridge for the side-panel fallback. `chrome.storage.local` (`mdPreviewConfig`) stores popup config (theme, font, size, dimensions).
- Manifest references `icons/icon16.png`, `icon48.png`, `icon128.png` — must exist or Chrome rejects load.
- `highlight.css` and `highlight-dark.css` must be in `web_accessible_resources` or the injected popup can't load them via `<link>`.
- MV3 CSP is `script-src 'self'` — no remote CDN scripts. Everything is vendored locally.
- To verify rendering: `node -e "const m=require('./marked.min.js');m.setOptions({gfm:true,breaks:true});console.log(m.parse('# hi\n\n**x**'))"`.
- When content.js is already injected (box exists), a second right-click re-registers the message listener instead of re-creating the box.
