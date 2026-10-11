# Privacy Policy — MarkLens

**MarkLens — Instant Markdown Renderer & Page Converter** does not collect,
transmit, or share any personal data or user content.

## What stays on your device

- **Selected text.** When you use *Preview as Markdown* or *Convert HTML to
  Markdown*, the selected text is rendered or converted locally in your
  browser and sanitized on-device. It is never sent anywhere.
- **Editor drafts.** Drafts you write in the side-panel editor autosave to
  on-device browser storage (`chrome.storage.local`) so work survives a
  closed tab. Nothing leaves your device.
- **Preferences.** Theme, font, display mode, and key bindings are stored
  on-device (`chrome.storage.local`). A transient one-shot selection bridge
  (`chrome.storage.session`) carries context-menu selections to the panel
  and is deleted on read.

## What we don't do

- No accounts, no sign-in, no analytics, no telemetry.
- No network requests — the extension works fully offline.
- No advertising, no sale or sharing of data (there is no data to share).

## Permissions and why they exist

- `sidePanel` — docked editor and preview panel.
- `contextMenus` — the two right-click actions on selected text.
- `storage` — on-device preferences, draft autosave, and the transient
  selection bridge described above.
- `scripting` + `activeTab` — renders the floating preview in the active
  tab only after you invoke the context-menu action.

## Contact

Questions: please open an issue at
<https://github.com/dereknguyen269/marklens/issues>.
