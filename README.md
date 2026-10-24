# MarkLens — Instant Markdown Renderer & Page Converter

> Formerly *Markdown & HTML Live Preview*.

A Chrome extension (Manifest V3) that renders selected Markdown right on the page in a floating preview, converts selected HTML to Markdown, and gives you a full editor with live preview in a side panel, a full tab, or a fullscreen overlay dropped over the page.

Free. No signup. Rendering, conversion, and the editor all run locally in your browser, so Markdown drafts, prompts, and docs for any AI workflow stay on your device. (One optional feature makes network requests — see *Preview PR as Markdown* below.)

## Features

- **Preview as Markdown** — select Markdown text on any page, right-click → *Preview as Markdown*, and see it rendered in a floating popup (or the side panel / fullscreen overlay).
- **Convert HTML to Markdown** — select HTML, right-click → *Convert HTML to Markdown*, and get the Markdown source.
- **Preview PR as Markdown (raw)** — on GitHub or Bitbucket pull-request pages, right-click anywhere and get the PR description and comments as actual Markdown source, rendered in the floating popup. Optional tokens in Settings unlock private repos and raise rate limits; requests go only to `api.github.com` / `api.bitbucket.org` when you invoke the menu item.
- **Side panel editor** — write or paste Markdown/HTML with a live split / edit / preview layout.
- **Fullscreen overlay** — the same split editor, prefilled from your selection and layered over the current page; `Esc` or `×` closes it.
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

- **From a page:** select text → right-click → *Preview as Markdown* or *Convert HTML to Markdown*. The result appears in a floating popup, the side panel, or a fullscreen overlay, depending on your default mode.
- **On a pull request:** open a GitHub (`…/pull/N`) or Bitbucket (`…/pull-requests/N`) page, right-click anywhere → *Preview PR as Markdown (raw)*. The description and comments are fetched from the host's API and rendered.
- **From the toolbar icon:** open the editor as a new tab, open the side panel, jump to Settings, or view About.
- **Settings:** choose the default display mode (popup / side panel / overlay), theme, font family, and size, plus optional GitHub/Bitbucket tokens for private-repo PRs. Preferences persist via `chrome.storage`.

## Project structure

| File | Role |
|------|------|
| `manifest.json` | Extension entrypoint (MV3). |
| `js/background.js` | Service worker: context menus (selection preview / HTML conversion / PR preview), script injection, side-panel fallback, GitHub & Bitbucket API fetch. |
| `js/content.js` | Injected floating Markdown preview (self-contained, themed). |
| `js/overlay.js` | Injected fullscreen host that iframes the editor as an overlay. |
| `sidepanel.html` / `js/sidepanel.js` | Editor + live preview panel (split / edit / preview). |
| `popup.html` / `js/popup.js` | Toolbar action menu. |
| `options.html` / `js/options.js` | Settings & About page. |
| `CHANGELOG.md`, `PRIVACY.md`, `store/` | Release history, privacy policy, and Web Store listing assets. |
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

**1.2.0** — adds the fullscreen overlay display mode and GitHub/Bitbucket PR preview (see `manifest.json` `version`; popup and options pages read it at runtime). Full history in [CHANGELOG.md](CHANGELOG.md); update it (and this section) whenever `manifest.json` `version` changes.

## License

The vendored libraries retain their own licenses (marked — MIT, highlight.js — BSD, Turndown — MIT).
