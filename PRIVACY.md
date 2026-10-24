# Privacy Policy — MarkLens

**MarkLens — Instant Markdown Renderer & Page Converter** does not collect,
transmit, or share any personal data or user content.

## What stays on your device

- **Selected text.** When you use *Preview as Markdown* or *Convert HTML to
  Markdown*, the selected text is rendered or converted locally in your
  browser and sanitized on-device. It is never sent anywhere.
- **Editor drafts.** Drafts you write in the editor autosave to on-device
  browser storage (`chrome.storage.local`) so work survives a closed tab.
  Nothing leaves your device.
- **Preferences and custom themes.** Theme, font, display mode, and key
  bindings are stored on-device (`chrome.storage.local`). A transient
  one-shot selection bridge (`chrome.storage.session`) carries context-menu
  selections to the panel and is deleted on read.

## The one networked feature

*Preview PR as Markdown (raw)* is strictly opt-in and context-triggered: it
appears only on GitHub or Bitbucket pull-request pages, and runs only when
you right-click it. It then makes read-only requests to that page's own host
API — `api.github.com` or `api.bitbucket.org` — to fetch the pull request's
description and comments, which are rendered locally. Every other rendering,
conversion, and editing path works fully offline. Only public pull requests
can be fetched (subject to each host's anonymous rate limit); no credentials
are ever requested or stored.

## What we don't do

- No accounts, no sign-in, no analytics, no telemetry.
- No network requests beyond the opt-in PR preview described above.
- No advertising, no sale or sharing of data (there is no data to share).

## Permissions and why they exist

- `sidePanel` — docked editor and preview panel.
- `contextMenus` — the three right-click actions on selected text.
- `storage` — on-device preferences, draft autosave, and the transient
  selection bridge described above.
- `scripting` + `activeTab` — renders the floating preview or fullscreen
  overlay in the active tab only after you invoke the context-menu action.
- `host_permissions` (`api.github.com`, `api.bitbucket.org`) — used only by
  the opt-in PR preview; no other requests are made to these hosts.

## Contact

Questions: please open an issue at
<https://github.com/dereknguyen269/marklens/issues>.

## Contact

Questions: please open an issue at
<https://github.com/dereknguyen269/marklens/issues>.
