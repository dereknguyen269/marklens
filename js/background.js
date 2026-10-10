// background.js — service worker for MarkLens — Instant Markdown Renderer & Page Converter

const MENU_ID = 'preview-markdown-selection';
const MENU_HTML_TO_MD = 'convert-html-to-md';

chrome.runtime.onInstalled.addListener(function () {
  console.log('[MD] onInstalled fired');

  // Disable side panel auto-open on action click — popup handles that now.
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: false })
      .catch(function (err) { console.error('[MD] sidePanel behavior error:', err); });
  }

  chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create(
      { id: MENU_ID, title: 'Preview as Markdown', contexts: ['selection'] },
      function () { if (chrome.runtime.lastError) console.error('[MD] menu error:', chrome.runtime.lastError.message); }
    );
    chrome.contextMenus.create(
      { id: MENU_HTML_TO_MD, title: 'Convert HTML to Markdown', contexts: ['selection'] },
      function () { if (chrome.runtime.lastError) console.error('[MD] html2md menu error:', chrome.runtime.lastError.message); }
    );
  });
});

function stashForSidePanel(isHtmlToMd, text, html) {
  if (isHtmlToMd) {
    return chrome.storage.session.set({ pendingHtml: html || text }).catch(function (e) {
      console.error('[MD] storage.set failed:', e);
    });
  }
  return chrome.storage.session.set({ pendingMarkdown: text }).catch(function (e) {
    console.error('[MD] storage.set failed:', e);
  });
}

var INJECT_FILES = [
  'vendor/marked.min.js',
  'vendor/marked-footnote.umd.js',
  'vendor/marked-deflist.umd.js',
  'vendor/marked-emoji.umd.js',
  'vendor/emoji-map.js',
  'vendor/highlight.min.js',
  'vendor/marked-highlight.umd.js',
  'vendor/marked-extras.umd.js',
  'vendor/turndown.min.js',
  'vendor/turndown-plugin-gfm.js',
  'js/setupMarked.js',
  'js/themes.js',
  'vendor/dompurify.min.js',
  'js/storage.js',
  'js/content.js'
];

// True once the full library + content stack is already injected into the page.
function libsReady(tabId) {
  return chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: function () {
      return !!(globalThis.marked && globalThis.hljs && globalThis.TurndownService &&
                globalThis.markedFootnote && globalThis.DOMPurify &&
                globalThis.MD_THEMES && globalThis.setupMarked && globalThis.mdStorage);
    }
  });
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId !== MENU_ID && info.menuItemId !== MENU_HTML_TO_MD) return;

  var isHtmlToMd = info.menuItemId === MENU_HTML_TO_MD;
  var selected = (info.selectionText || '').trim();
  if (!selected) return;

  // Read mode from config (default: popup).
  chrome.storage.local.get(['mdPreviewConfig'], function (res) {
    var mode = (res && res.mdPreviewConfig && res.mdPreviewConfig.mode) || 'popup';

    if (mode === 'sidebar') {
      // Sidebar mode: open Chrome side panel synchronously (user gesture active).
      if (tab && tab.windowId != null && chrome.sidePanel && chrome.sidePanel.open) {
        chrome.sidePanel.open({ tabId: tab.id }).catch(function (err) {
          console.error('[MD] sidePanel.open failed:', err.message);
        });
      }

      stashForSidePanel(isHtmlToMd, selected, selected);
      if (tab && tab.id != null) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: function () {
            var s = window.getSelection();
            if (!s || !s.rangeCount) return { text: '', html: '' };
            var text = s.toString();
            var html = '';
            try { var frag = s.getRangeAt(0).cloneContents(); var d = document.createElement('div'); d.appendChild(frag); html = d.innerHTML; } catch (e) {}
            return { text: text, html: html };
          }
        }).then(function (results) {
          var liveSel = results && results[0] && results[0].result;
          if (liveSel && liveSel.text) stashForSidePanel(isHtmlToMd, liveSel.text, liveSel.html || liveSel.text);
        }).catch(function (err) {
          console.warn('[MD] executeScript failed:', err.message);
        });
      }
    } else {
      // Popup mode: inject floating preview into the page (only the libs on first use).
      if (!tab || tab.id == null) return;

      libsReady(tab.id).then(function (res) {
        var ready = res && res[0] && res[0].result;
        return chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ready ? ['js/content.js'] : INJECT_FILES
        });
      }).then(function () {
        return chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: function () {
            var s = window.getSelection();
            if (!s || !s.rangeCount) return { text: '', html: '', rect: null };
            var text = s.toString();
            var r = s.getRangeAt(0);
            var rect = r.getBoundingClientRect();
            var html = '';
            try { var frag = r.cloneContents(); var d = document.createElement('div'); d.appendChild(frag); html = d.innerHTML; } catch (e) {}
            return { text: text, html: html, rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom } };
          }
        });
      }).then(function (results) {
        var liveSel = results && results[0] && results[0].result;
        var text = (liveSel && liveSel.text) || selected;
        var html = (liveSel && liveSel.html) || '';
        var rect = (liveSel && liveSel.rect) || null;

        if (isHtmlToMd) {
          chrome.tabs.sendMessage(tab.id, { action: 'convertHtmlToMarkdown', html: html || selected, rect: rect });
        } else {
          chrome.tabs.sendMessage(tab.id, { action: 'renderMarkdown', text: text, rect: rect });
        }
      }).catch(function (err) {
        console.warn('[MD] inject failed (likely chrome:// or restricted page):', err.message);
        // Fallback: stash the selection and open the side panel (or a tab).
        stashForSidePanel(isHtmlToMd, selected, selected);
        if (tab && tab.windowId != null && chrome.sidePanel && chrome.sidePanel.open) {
          chrome.sidePanel.open({ tabId: tab.id }).catch(function () {
            chrome.tabs.create({ url: chrome.runtime.getURL('sidepanel.html') });
          });
        } else {
          chrome.tabs.create({ url: chrome.runtime.getURL('sidepanel.html') });
        }
      });
    }
  });
});

// Handle "open in side panel" request from popup content.js.
chrome.runtime.onMessage.addListener(function (msg, sender) {
  if (msg && msg.action === 'openSidePanel') {
    var tab = sender.tab;
    if (tab && tab.windowId != null && chrome.sidePanel && chrome.sidePanel.open) {
      if (msg.text) chrome.storage.session.set({ pendingMarkdown: msg.text });
      chrome.sidePanel.open({ tabId: tab.id }).catch(function (err) {
        console.error('[MD] sidePanel.open from popup failed:', err.message);
      });
    }
  }
});
