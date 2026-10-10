# MarkLens — Instant Markdown Renderer & Page Converter

> Formerly *Markdown & HTML Live Preview*.

A Chrome extension (Manifest V3) that renders selected Markdown right on the page in a floating preview, converts selected HTML to Markdown, and gives you a full editor with live preview in a side panel or new tab.

Free. No signup. Works offline — everything runs locally in your browser, so Markdown drafts, prompts, and docs for any AI workflow stay on your device.

## Features

- **Preview as Markdown** — select Markdown text on any page, right-click → *Preview as Markdown*, and see it rendered in a floating popup (or the side panel).
- **Convert HTML to Markdown** — select HTML, right-click → *Convert HTML to Markdown*, and get the Markdown source.
- **Side panel editor** — write or paste Markdown/HTML with a live split / edit / preview layout.
- **Code editor** — Markdown highlighting, line numbers, find/replace (`Ctrl+F`), and optional Vim bindings (Keys selector).
- **Draft autosave** — your editor text persists locally in the browser; work survives a closed tab. No signup, no account, no servers.
- **Export anywhere** — download your document as Markdown, styled HTML, or print / save as PDF with one click.
- **Drag & drop** — drop `.md`, `.txt`, or `.html` files onto the editor to open them instantly.
- **Synced scrolling** — editor and preview panes stay aligned in both directions.
- **Zen mode** — one-click distraction-free writing (`Alt+Z`, `Esc` to exit).
- **Open as a new tab** — the same editor in a full-page view.
- **22 themes** — 16 solid (Light, Dark, Sepia, Nord, Dracula, GitHub Dark/Light, Solarized Light/Dark, Monokai, One Dark, Gruvbox, Tokyo Night, Everforest, Rosé Pine, High Contrast) plus 6 gradient themes (Aurora, Sunset, Ocean, Midnight, Forest, Candy).
- **Typography controls** — adjustable font family and size.
- **Rich Markdown** — GFM tables, task lists, footnotes, definition lists, emoji shortcodes, syntax highlighting, highlight/subscript/superscript, and heading IDs.
- **Draggable & resizable** floating popup; press <kbd>Esc</kbd> to close.
- **Accessible** — visible focus states, `prefers-reduced-motion` support, SVG icons.

## Install (unpacked)

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this repository's root folder.

Requires **Chrome 116+** (the `sidePanel` API).

## Usage

- **From a page:** select text → right-click → *Preview as Markdown* or *Convert HTML to Markdown*. The result appears in a floating popup or the side panel, depending on your default mode.
- **From the toolbar icon:** open the editor as a new tab, open the side panel, jump to Settings, or view About.
- **Settings:** choose the default display mode (popup vs. side panel), theme, font family, and size. Preferences persist via `chrome.storage`.

## Project structure

| File | Role |
|------|------|
| `manifest.json` | Extension entrypoint (MV3). |
| `js/background.js` | Service worker: context menus, script injection, side-panel fallback. |
| `js/content.js` | Injected floating Markdown preview (self-contained, themed). |
| `sidepanel.html` / `js/sidepanel.js` | Editor + live preview panel (split / edit / preview). |
| `popup.html` / `js/popup.js` | Toolbar action menu. |
| `options.html` / `js/options.js` | Settings & About page. |
| `js/setupMarked.js`, `js/themes.js`, `js/storage.js` | Shared Markdown setup, theme maps, storage bridge. |
| `css/styles.css` | Shared styles for the side panel, popup, and options pages. |
| `vendor/` (`marked*.js`, `highlight*`, `turndown*`, `emoji-map.js`, `dompurify*`) | Vendored Markdown/HTML libraries and plugins — do not edit. |

## Development

No build step, bundler, or package manager — all source is plain JS/HTML/CSS loaded directly by the browser.

- Edit a file, then reload the extension at `chrome://extensions` (and reload the tab for injected scripts).
- Quick render sanity check:
  ```bash
  node -e "const m=require('./vendor/marked.min.js');m.setOptions({gfm:true,breaks:true});console.log(m.parse('# hi\n\n**x**'))"
  ```

## Version

**1.0.3** — current release (see `manifest.json` `version`; popup and options pages read it at runtime).

## License

The vendored libraries retain their own licenses (marked — MIT, highlight.js — BSD, Turndown — MIT).
