# MarkLens — Chrome Web Store listing

## Title
MarkLens — Instant Markdown Renderer & Page Converter

## Short description (≤132 chars, manifest parity)
Select Markdown on any page for a live preview — popup, side panel, or fullscreen overlay. Preview GitHub/Bitbucket PRs too.

## Category
Productivity

## Language
English

## Detailed description
MarkLens renders Markdown wherever you find it — no signup. Rendering, conversion, and the editor all run locally in your browser.

**Preview Markdown on any page**
Select Markdown text, right-click, and choose Preview as Markdown. A floating popup shows the rendered result with tables, task lists, code highlighting, footnotes, and emoji. Prefer it docked? Switch the default mode to the side panel — or open it fullscreen as an editor overlay right on the page.

**Convert HTML to Markdown**
Select formatted content, right-click, and get clean Markdown source back — perfect for grabbing docs, READMEs, and articles into your notes.

**Preview PR as raw Markdown**
On GitHub or Bitbucket pull-request pages, right-click anywhere and choose Preview PR as Markdown. The real source of the description and comments is fetched directly from the GitHub or Bitbucket API and rendered with tables, task lists, and code highlighting — no more copy-pasting rendered HTML. Public repositories are supported; no account or credentials are needed.

**Full editor with live preview**
Open the side panel or a full tab for a split/edit/preview Markdown editor with syntax highlighting, line numbers, find & replace, optional Vim bindings, and synced scrolling. The fullscreen overlay mode drops that same editor over the current page — selection prefilled, Esc to close. Drafts autosave locally so work survives a closed tab.

**Export anywhere**
Download your document as Markdown, a styled standalone HTML file, or print / save as PDF. Drag & drop .md, .txt, and .html files straight into the editor.

**Customizable appearance**
Choose from 22 built-in light and dark themes, including solid colors and gradients — with adjustable fonts, sizes, and a distraction-free Zen mode.

**Private by design**
No account. No analytics. Rendering, conversion, and the editor all run locally in your browser — selections are never sent anywhere. The only optional network feature is PR preview: when you explicitly right-click it on a pull-request page, that PR's description and comments are fetched from api.github.com or api.bitbucket.org.

## Single purpose (Privacy tab)
Render selected Markdown and convert selected HTML to Markdown via a floating preview, side-panel editor, or page overlay.

## Permission justifications
- sidePanel — docked editor and preview panel.
- contextMenus — the three right-click actions on selected text.
- storage — saves theme, font, and display preferences on-device, plus the transient one-shot selection bridge and local draft autosave. No credentials are collected or stored.
- scripting + activeTab — renders the floating preview or fullscreen overlay in the active tab only after you invoke the context-menu action.
- host_permissions (api.github.com, api.bitbucket.org) — used only when you explicitly right-click Preview PR as Markdown on a GitHub or Bitbucket pull-request page, to fetch that PR's description and comments. No other requests are made to these hosts.

## Data usage
No data is collected, transmitted, or shared by default: selections are rendered locally and sanitized on-device; settings, drafts, and custom themes stay in on-device storage. The one exception, triggered only by your explicit PR-preview right-click on a pull-request page, is a read-only request to that page's own host API (api.github.com / api.bitbucket.org) for the PR's public description and comments. No account, token, or credential is ever requested or stored.

## Test instructions for reviewers (no login needed)
1. Open any article or GitHub README.
2. Select some Markdown text → right-click → Preview as Markdown → floating popup appears.
3. In the toolbar menu, change the default mode to Side panel and repeat step 2.
4. Switch the default mode to Overlay, select text on the page, and right-click Preview as Markdown — a fullscreen split editor appears; press Esc to close.
5. Select formatted text → right-click → Convert HTML to Markdown.
6. Open a public GitHub pull request, e.g. https://github.com/octocat/Hello-World/pull/11611 (any PR in that public repo works), right-click anywhere → Preview PR as Markdown (raw) → the PR description and comments render in the floating popup. No login or token is needed.
7. Click the toolbar icon → Open as New Tab to see the full editor.

## Assets (in store/)
- screenshot-1-popup.png — hero: floating popup over a page (1280×800)
- screenshot-2-editor-light.png — split editor, light (1280×800)
- screenshot-3-editor-dark.png — split editor, dark (1280×800)
- screenshot-4-zen.png — Zen mode (1280×800)
- screenshot-5-options.png — Home/Settings/About (1280×800)
- promo-tile-440x280.png — small promo tile (440×280)
- icons/icon128.png (repo) — store icon (128×128)

## URLs
- Homepage: https://github.com/dereknguyen269/marklens
- Support: https://github.com/dereknguyen269/marklens/issues
- Privacy policy: https://github.com/dereknguyen269/marklens/blob/master/PRIVACY.md
