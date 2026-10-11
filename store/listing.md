# MarkLens — Chrome Web Store listing

## Title
MarkLens — Instant Markdown Renderer & Page Converter

## Short description (≤132 chars, manifest parity)
Select Markdown on any page for a live rendered preview, or write in the side-panel editor.

## Category
Productivity

## Language
English

## Detailed description
MarkLens renders Markdown wherever you find it — no signup, no servers, everything runs locally in your browser.

**Preview Markdown on any page**
Select Markdown text, right-click, and choose Preview as Markdown. A floating popup shows the rendered result with tables, task lists, code highlighting, footnotes, and emoji. Prefer it docked? Switch the default mode to the side panel.

**Convert HTML to Markdown**
Select formatted content, right-click, and get clean Markdown source back — perfect for grabbing docs, READMEs, and articles into your notes.

**Full editor with live preview**
Open the side panel or a full tab for a split/edit/preview Markdown editor with syntax highlighting, line numbers, find & replace, optional Vim bindings, and synced scrolling. Drafts autosave locally so work survives a closed tab.

**Export anywhere**
Download your document as Markdown, a styled standalone HTML file, or print / save as PDF. Drag & drop .md, .txt, and .html files straight into the editor.

**22 themes, your type**
16 solid themes (Light, Dark, Sepia, Nord, Dracula, Monokai, One Dark, Gruvbox, Tokyo Night, Everforest, Rosé Pine, GitHub Light/Dark, Solarized, High Contrast) plus 6 gradients — with adjustable fonts, sizes, and a distraction-free Zen mode.

**Private by design**
No account. No analytics. No network requests. Your text never leaves your device.

## Single purpose (Privacy tab)
Render selected Markdown and convert selected HTML to Markdown via a floating preview or side-panel editor.

## Permission justifications
- sidePanel — docked editor and preview panel.
- contextMenus — the two right-click actions on selected text.
- storage — saves theme, font, and display preferences on-device, plus the transient one-shot selection bridge and local draft autosave.
- scripting + activeTab — renders the floating preview in the active tab only after you invoke the context-menu action.

## Data usage
No data is collected, transmitted, or shared. Selections are rendered locally and sanitized on-device; settings stay in on-device storage.

## Test instructions for reviewers (no login needed)
1. Open any article or GitHub README.
2. Select some Markdown text → right-click → Preview as Markdown → floating popup appears.
3. In the toolbar menu, change the default mode to Side panel and repeat step 2.
4. Select formatted text → right-click → Convert HTML to Markdown.
5. Click the toolbar icon → Open as New Tab to see the full editor.

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
- Privacy policy: publish PRIVACY.md in the repo (still TODO) and link it
