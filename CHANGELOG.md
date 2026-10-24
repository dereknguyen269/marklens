# Changelog

All notable changes to MarkLens are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the store package (`marklens-<version>.zip`) is rebuilt at each release and always matches `manifest.json` `version`.

## [1.2.0] — 2026-10-24

Editor, preview, and policy work since the 1.0.0 store release.

### Added
- **Fullscreen overlay mode** — right-clicking *Preview as Markdown* / *Convert HTML to Markdown* with the Overlay default mode drops the split editor over the current page via an injected host (`js/overlay.js`) that iframes `sidepanel.html?embed=1`; `Esc` or the `×` button closes it over a one-way `postMessage` channel verified against the host frame. Pending selections land in split view instead of preview-only.
- **Preview PR as Markdown (raw)** — new right-click action, shown only on GitHub (`…/pull/N`) and Bitbucket (`…/pull-requests/N`) pages. Fetches the PR description and comments directly from `api.github.com` / `api.bitbucket.org` (the manifest's only `host_permissions`) and composes them into one Markdown document. Public repositories only; no credentials are collected or stored. Comments paginate up to 1,000 entries; fetch errors render inline as Markdown.
- **Document library** (IndexedDB) — save/open/rename/delete documents; drafts autosave locally.
- **Version snapshots** — labeled snapshots with a line-level diff view and restore.
- **Outline & table of contents** — heading rail synced to the editor cursor, insert/update TOC, preview-TOC option.
- **Mermaid diagrams** — rendered in preview with the security level set to `strict`.
- **KaTeX math** — inline/`display` LaTeX rendering, fonts vendored.
- **Markdown lint** — on-demand linting panel.
- **Templates & snippets** — insertable starter documents.
- **Custom theme builder** — name, light/dark base, seven color inputs with live hex codes and swatch preview, contrast checker that flags unreadable body/secondary/accent colors, Import/Export as JSON.
- **Modal confirm / prompt dialogs** — `mdConfirm` / `mdPrompt` (promise-based, focus-trapped, Esc-safe) replace native `confirm`/`prompt` for destructive and text-entry flows.

### Changed
- Status bar and top bar reworked into icon+label groups (`.status-group` / two-cluster topbar) with responsive label collapse; all actions carry `title` + `aria-label`.
- Filled accent/error surfaces use computed `--on-accent` / `--on-error` tokens so light accents get dark text; native `color-scheme` follows the theme background.

### Fixed
- Mermaid diagram errors no longer surface as `Uncaught (in promise)`; invalid diagrams render Mermaid's error diagram instead (`suppressErrors`).
- Tagged-HTML selections that are actually Markdown source (fenced code, task lists, table separators) render as-is instead of being mangled by Turndown.

### Policy accuracy
- `README.md`, `store/listing.md`, and `PRIVACY.md` updated: "no network requests" claims replaced with an accurate description of the opt-in PR-preview requests and the new permissions.

### Removed
- **GitHub / Bitbucket token settings.** The optional PR-preview credential fields and their `mdApiTokens` storage key were removed so the extension never handles personal access tokens. PR preview continues to work for public repositories via unauthenticated requests; any token left by an earlier build is purged from `chrome.storage.local` on install/update.

## [1.0.0] — 2026-10-10

Initial store release.

- Right-click *Preview as Markdown* — floating, draggable/resizable, themed preview popup with 22 built-in light/dark themes, GFM tables, task lists, footnotes, definition lists, emoji shortcodes, syntax highlighting, and heading IDs.
- Right-click *Convert HTML to Markdown*.
- Side-panel / full-tab editor with live split / edit / preview.
- Default mode (popup / side panel), theme, font family, and size in Settings; preferences persist via `chrome.storage`.
- Save-as-PDF via print stylesheet and Markdown/HTML export.
