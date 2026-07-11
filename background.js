// background.js — service worker for Markdown Live Preview

const MENU_ID = 'preview-markdown-selection';
const MENU_SIDEBAR_ID = 'preview-markdown-sidebar';

chrome.runtime.onInstalled.addListener(function () {
  console.log('[MD] onInstalled fired');

  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .then(function () { console.log('[MD] sidePanel open-on-click enabled'); })
      .catch(function (err) { console.error('[MD] sidePanel behavior error:', err); });
  } else {
    console.warn('[MD] chrome.sidePanel unavailable in this Chrome version');
  }

  chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create(
      { id: MENU_ID, title: 'Preview as Markdown', contexts: ['selection'] },
      function () { if (chrome.runtime.lastError) console.error('[MD] menu error:', chrome.runtime.lastError.message); }
    );
    chrome.contextMenus.create(
      { id: MENU_SIDEBAR_ID, title: 'Preview as Markdown (Sidebar)', contexts: ['selection'] },
      function () { if (chrome.runtime.lastError) console.error('[MD] sidebar menu error:', chrome.runtime.lastError.message); }
    );
  });
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
  if (info.menuItemId !== MENU_ID && info.menuItemId !== MENU_SIDEBAR_ID) return;

  var mode = info.menuItemId === MENU_SIDEBAR_ID ? 'sidebar' : 'popup';
  const selected = (info.selectionText || '').trim();
  if (!selected) return;

  // Always stash for the side panel as a backup (text + anchor rect).
  await chrome.storage.session.set({ pendingMarkdown: selected, pendingRect: null }).catch(function (e) {
    console.error('[MD] storage.set failed:', e);
  });

  // Primary: inject a floating preview directly into the active tab.
  // Works on any http(s) page; falls back to side panel otherwise.
  if (tab && tab.id != null) {
    try {
      // Inject renderer + all plugins + content.js in one call. Files run in
      // array order, so globals are set before content.js executes.
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [
          'marked.min.js',
          'marked-footnote.umd.js',
          'marked-deflist.umd.js',
          'marked-emoji.umd.js',
          'emoji-map.js',
          'highlight.min.js',
          'marked-highlight.umd.js',
          'marked-extras.umd.js',
          'content.js'
        ]
      });
      // Grab the live selection from the page — getSelection().toString()
      // preserves newlines, which info.selectionText can drop. Also capture
      // the rect of the first selected range so the popup can anchor to it.
      const [{ result: liveSel }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function () {
          var s = window.getSelection();
          if (!s || !s.rangeCount) return { text: '', rect: null };
          var text = s.toString();
          var r = s.getRangeAt(0).getBoundingClientRect();
          return {
            text: text,
            rect: { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
          };
        }
      });
      var text = (liveSel && typeof liveSel.text === 'string' ? liveSel.text : selected) || selected;
      var rect = liveSel && liveSel.rect ? liveSel.rect : null;
      // Pass the selected text + anchor rect to the injected preview.
      await chrome.tabs.sendMessage(tab.id, { action: 'renderMarkdown', text: text, rect: rect, mode: mode });
      console.log('[MD] injected floating preview');
      return;
    } catch (err) {
      console.warn('[MD] inject failed (likely chrome:// or restricted page):', err.message);
    }
  }

  // Fallback: side panel (or tab) for restricted pages.
  if (tab && tab.windowId != null && chrome.sidePanel && chrome.sidePanel.open) {
    try {
      await chrome.sidePanel.open({ windowId: tab.windowId });
      return;
    } catch (err) {
      console.warn('[MD] sidePanel.open failed, opening tab fallback:', err);
    }
  }
  chrome.tabs.create({ url: chrome.runtime.getURL('sidepanel.html') });
});
