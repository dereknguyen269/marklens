// background.js — service worker for MarkLens — Instant Markdown Renderer & Page Converter

const MENU_ID = 'preview-markdown-selection';
const MENU_HTML_TO_MD = 'convert-html-to-md';
const MENU_PR_MD = 'preview-pr-md';

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
    // Only shown on GitHub / Bitbucket pull-request pages (documentUrlPatterns).
    chrome.contextMenus.create(
      {
        id: MENU_PR_MD,
        title: 'Preview PR as Markdown (raw)',
        contexts: ['page', 'selection', 'link'],
        documentUrlPatterns: [
          'https://github.com/*/*/pull/*',
          'https://bitbucket.org/*/*/pull-requests/*'
        ]
      },
      function () { if (chrome.runtime.lastError) console.error('[MD] pr menu error:', chrome.runtime.lastError.message); }
    );
  });
});

// Stash a one-shot selection for the side panel / overlay embed. Promise-based
// so callers can chain; empty input is skipped (resolves without storing) to
// keep orphan values out of session storage.
function stashForSidePanel(isHtmlToMd, text, html) {
  var value = isHtmlToMd ? (html || text) : text;
  if (!value || !String(value).trim()) {
    // The panel only consumes non-empty pending values; stashing '' would
    // leave an orphan entry in session storage that never gets read/removed.
    console.warn('[MD] stash skipped: nothing to hand off');
    return Promise.resolve();
  }
  if (isHtmlToMd) {
    return chrome.storage.session.set({ pendingHtml: value }).catch(function (e) {
      console.error('[MD] storage.set failed:', e);
    });
  }
  return chrome.storage.session.set({ pendingMarkdown: value }).catch(function (e) {
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

// Read the live selection from the page (preserves line breaks, unlike
// info.selectionText) plus its bounding rect. Resolves to a plain object;
// never rejects the caller's chain.
function readSelection(tabId) {
  return chrome.scripting.executeScript({
    target: { tabId: tabId },
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
  }).then(function (results) {
    return (results && results[0] && results[0].result) || { text: '', html: '', rect: null };
  });
}

// Restricted pages (chrome://, Web Store, PDF viewer) reject injection. Fall
// back to the docked side panel, then to a full editor tab.
function fallbackToPanelOrTab(tab) {
  if (tab && tab.windowId != null && chrome.sidePanel && chrome.sidePanel.open) {
    chrome.sidePanel.open({ tabId: tab.id }).catch(function () {
      chrome.tabs.create({ url: chrome.runtime.getURL('sidepanel.html') });
    });
  } else {
    chrome.tabs.create({ url: chrome.runtime.getURL('sidepanel.html') });
  }
}

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

// --- Pull Request raw-markdown fetch (GitHub / Bitbucket) ------------------

// Safety cap for comment fetching — 10 full pages on either host. Beyond
// this a PR review thread is unreadable in a rendered preview anyway.
var PR_MAX_COMMENT_ITEMS = 1000;

// Parse a PR page URL into { host, parts… }. Requires exactly owner/repo/ID
// segments so suffix views like /pull/12/files or /pull-requests/12/overview
// still match, but unrelated paths (e.g. /a/b/c/pull/5) don't.
function parsePrUrl(url) {
  if (!url) return null;
  var mGitHub = /^https:\/\/github\.com\/([^\/?#]+)\/([^\/?#]+)\/pull\/(\d+)(?:\/|$|\?|#)/.exec(url);
  if (mGitHub) {
    return {
      host: 'github',
      owner: mGitHub[1],
      repo: mGitHub[2],
      number: parseInt(mGitHub[3], 10),
      displayUrl: url.replace(/[?#].*$/, '')
    };
  }
  var mBB = /^https:\/\/bitbucket\.org\/([^\/?#]+)\/([^\/?#]+)\/pull-requests\/(\d+)(?:\/|$|\?|#)/.exec(url);
  if (mBB) {
    return {
      host: 'bitbucket',
      owner: mBB[1],
      repo: mBB[2],
      number: parseInt(mBB[3], 10),
      displayUrl: url.replace(/[?#].*$/, '')
    };
  }
  return null;
}

// HTTP Basic header that survives non-ASCII usernames/passwords: btoa() only
// accepts Latin-1 code points, so map UTF-8 bytes through encodeURIComponent +
// unescape (a no-op for ASCII input, which is the common case).
function basicAuthHeader(username, password) {
  var raw = String(username) + ':' + String(password);
  try {
    return 'Basic ' + btoa(unescape(encodeURIComponent(raw)));
  } catch (e) {
    // Last resort: strip anything outside Latin-1 rather than throwing.
    return 'Basic ' + btoa(raw.replace(/[^\u0000-\u00ff]/g, '?'));
  }
}

// JSON fetch with friendly errors; never throws raw network objects.
function fetchJson(url, headers) {
  return fetch(url, { headers: headers || {} }).then(function (resp) {
    if (!resp.ok) {
      var msg = 'HTTP ' + resp.status;
      if (resp.status === 401) msg += ' (auth required for private repos — add a token in Settings)';
      else if (resp.status === 403) msg += ' (rate limit or no access — add a token in Settings)';
      else if (resp.status === 404) msg += ' (Pull Request not found)';
      return resp.json().catch(function () { return null; }).then(function (data) {
        throw new Error(msg + (data && data.message ? ' — ' + data.message : ''));
      });
    }
    return resp.json();
  });
}

// Fetch all comments across pages (per_page=100, up to PR_MAX_COMMENT_ITEMS).
// GitHub gives no total count, so walk pages until a short page comes back.
function fetchAllGitHubComments(url, headers) {
  var all = [];
  function nextPage(p) {
    return fetchJson(url + '&page=' + p, headers).then(function (list) {
      list = list || [];
      all = all.concat(list);
      if (list.length < 100 || all.length >= PR_MAX_COMMENT_ITEMS) return all;
      return nextPage(p + 1);
    });
  }
  return nextPage(1);
}

// Fetch the PR + its comments and normalize to
// { title, state, author, body, link, comments: [{ author, body, date }] }.
function fetchGitHubPr(pr, tokens) {
  var base = 'https://api.github.com/repos/' + pr.owner + '/' + pr.repo;
  var headers = { 'Accept': 'application/vnd.github+json' };
  if (tokens.githubToken) headers['Authorization'] = 'Bearer ' + tokens.githubToken;
  return fetchJson(base + '/pulls/' + pr.number, headers).then(function (d) {
    return fetchAllGitHubComments(base + '/issues/' + pr.number + '/comments?per_page=100', headers).then(function (list) {
      return {
        title: d.title,
        state: d.state || '',
        author: (d.user && d.user.login) || '',
        body: d.body || '',
        link: d.html_url || pr.displayUrl,
        comments: (list || []).slice(0, PR_MAX_COMMENT_ITEMS).map(function (c) {
          return { author: (c.user && c.user.login) || '', body: c.body || '', date: c.created_at || '' };
        })
      };
    });
  });
}

// Bitbucket Cloud: PR description is a raw-markdown string (`description`,
// also mirrored at `summary.raw`); comments carry markdown at `content.raw`.
// Auth is Basic (username + app password), not bearer.
function fetchBitbucketPr(pr, tokens) {
  var base = 'https://api.bitbucket.org/2.0/repositories/' + pr.owner + '/' + pr.repo;
  var headers = { 'Accept': 'application/json' };
  if (tokens.bbUsername && tokens.bbAppPassword) {
    headers['Authorization'] = basicAuthHeader(tokens.bbUsername, tokens.bbAppPassword);
  }
  return fetchJson(base + '/pullrequests/' + pr.number, headers).then(function (d) {
    var body = d.description;
    if (!body && d.summary && d.summary.raw) body = d.summary.raw;
    if (!body && d.rendered && d.rendered.description && d.rendered.description.raw) {
      body = d.rendered.description.raw;
    }
    // Bitbucket paginates with an absolute `next` link in the response. Track
    // the cumulative count as the cap so a pathologically endless `next`
    // chain can't loop forever (per-page length alone never reaches it).
    function bbComments(url, count) {
      return fetchJson(url, headers).then(function (page) {
        var values = (page && page.values) || [];
        count = (count || 0) + values.length;
        if (page && page.next && count < PR_MAX_COMMENT_ITEMS) {
          return bbComments(page.next, count).then(function (rest) { return values.concat(rest); });
        }
        return values;
      });
    }
    return bbComments(base + '/pullrequests/' + pr.number + '/comments?pagelen=100').then(function (values) {
      var list = (values || []).slice(0, PR_MAX_COMMENT_ITEMS);
      return {
        title: d.title || ('Pull Request #' + pr.number),
        state: (d.state || '').toLowerCase(),
        author: (d.author && (d.author.display_name || d.author.nickname)) || '',
        body: body || '',
        link: (d.links && d.links.html && d.links.html.href) || pr.displayUrl,
        comments: list.filter(function (c) {
          return !c.deleted && c.content;
        }).map(function (c) {
          return {
            author: (c.user && (c.user.display_name || c.user.nickname)) || '',
            body: String((c.content && (c.content.raw || c.content.html)) || ''),
            date: c.created_on || ''
          };
        })
      };
    });
  });
}

// Compose one markdown document: title → meta line → description → comments.
function composePrMarkdown(pr, data) {
  var parts = [];
  parts.push('# ' + (data.title || 'Pull Request #' + pr.number));
  parts.push('');
  var meta = [];
  if (data.link) meta.push(data.link);
  if (data.state) meta.push('`' + data.state + '`');
  if (data.author) meta.push(data.author);
  if (meta.length) { parts.push('> ' + meta.join(' · ')); }
  if ((data.body || '').trim()) {
    parts.push('');
    parts.push(data.body);
  } else {
    parts.push('');
    parts.push('*(no description)*');
  }
  if (data.comments && data.comments.length) {
    parts.push('');
    parts.push('---');
    parts.push('');
    parts.push('## Comments (' + data.comments.length + ')');
    data.comments.forEach(function (c) {
      parts.push('');
      parts.push('### ' + (c.author || 'Comment') + (c.date ? ' · ' + c.date : ''));
      parts.push('');
      parts.push(c.body || '');
    });
  }
  return parts.join('\n');
}

function fetchPrMarkdown(pr, tokens) {
  var fetcher = pr.host === 'github'
    ? fetchGitHubPr(pr, tokens)
    : fetchBitbucketPr(pr, tokens);
  return fetcher.then(function (data) {
    return composePrMarkdown(pr, data);
  });
}

// Route fetched markdown to the configured display mode. Popup injects the
// floating popup and sends a message; sidebar/overlay stash + open/inject.
// NOTE: sidePanel.open must happen synchronously inside the gesture —
// handlePrMenu() opens it before fetching when mode === 'sidebar'.
function routePrMarkdown(md, mode, tab) {
  var tabId = tab.id;

  if (mode === 'popup') {
    return libsReady(tabId).then(function (res) {
      var ready = res && res[0] && res[0].result;
      return chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ready ? ['js/content.js'] : INJECT_FILES
      });
    }).then(function () {
      return chrome.tabs.sendMessage(tabId, { action: 'renderMarkdown', text: md, rect: null });
    }).catch(function (err) {
      console.warn('[MD] PR popup inject failed:', err.message);
      stashForSidePanel(false, md, md);
      fallbackToPanelOrTab(tab);
    });
  }

  // Sidebar / overlay: stash first; the panel reads pendingMarkdown on boot
  // or via storage.onChanged (arrives after open(), as in the sidebar path).
  var stash = stashForSidePanel(false, md, md);
  if (mode === 'overlay') {
    return stash.then(function () {
      return chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['js/overlay.js']
      });
    }).catch(function (err) {
      console.warn('[MD] PR overlay inject failed:', err.message);
      fallbackToPanelOrTab(tab);
    });
  }
  return stash;
}

function handlePrMenu(info, tab) {
  if (!tab || tab.id == null) {
    console.warn('[MD] PR menu: no tab');
    return;
  }
  var pr = parsePrUrl(tab.url);
  if (!pr) return; // documentUrlPatterns should prevent this

  chrome.storage.local.get(['mdPreviewConfig', 'mdApiTokens'], function (res) {
    var mode = (res && res.mdPreviewConfig && res.mdPreviewConfig.mode) || 'popup';
    var tokens = (res && res.mdApiTokens) || {};

    // Must run while the context-menu gesture is still active.
    if (mode === 'sidebar' && tab.windowId != null && chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open({ tabId: tab.id }).catch(function (err) {
        console.error('[MD] sidePanel.open failed:', err.message);
      });
    }

    fetchPrMarkdown(pr, tokens).then(function (md) {
      return routePrMarkdown(md, mode, tab);
    }).catch(function (err) {
      console.warn('[MD] PR fetch failed:', (err && err.message) || err);
      // Surface the failure inline instead of throwing away the request.
      var msg = (err && err.message) || String(err);
      var md = '# Could not fetch Pull Request\n\n' + msg + '\n\n`' + pr.displayUrl + '`\n';
      return routePrMarkdown(md, mode, tab);
    });
  });
}

// ---------------------------------------------------------------------------

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === MENU_PR_MD) {
    handlePrMenu(info, tab);
    return;
  }
  if (info.menuItemId !== MENU_ID && info.menuItemId !== MENU_HTML_TO_MD) return;

  var isHtmlToMd = info.menuItemId === MENU_HTML_TO_MD;
  var selected = (info.selectionText || '').trim();
  if (!selected) return;

  // Read mode from config (default: popup).
  chrome.storage.local.get(['mdPreviewConfig'], function (res) {
    var mode = (res && res.mdPreviewConfig && res.mdPreviewConfig.mode) || 'popup';

    if (mode === 'overlay') {
      // Overlay mode: stash the live selection, then inject a fullscreen host
      // that iframes sidepanel.html?embed=1. The embedded page boots from the
      // stashed selection (or picks it up via storage.onChanged if the frame
      // is already loading).
      if (!tab || tab.id == null) return;

      readSelection(tab.id).then(function (liveSel) {
        var text = (liveSel && liveSel.text) || selected;
        var html = (liveSel && liveSel.html) || '';
        return stashForSidePanel(isHtmlToMd, text, html || text);
      }).then(function () {
        return chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['js/overlay.js']
        });
      }).catch(function (err) {
        console.warn('[MD] overlay inject failed (likely restricted page):', err.message);
        stashForSidePanel(isHtmlToMd, selected, selected);
        fallbackToPanelOrTab(tab);
      });
    } else if (mode === 'sidebar') {
      // Sidebar mode: open Chrome side panel synchronously (user gesture active).
      if (tab && tab.windowId != null && chrome.sidePanel && chrome.sidePanel.open) {
        chrome.sidePanel.open({ tabId: tab.id }).catch(function (err) {
          console.error('[MD] sidePanel.open failed:', err.message);
        });
      }

      // NOTE: info.selectionText has newlines replaced with spaces
      // (Chromium bug 40740672), which breaks tables/code blocks. Prefer
      // the live selection (preserves line breaks) and only fall back to
      // selectionText when the live read fails. The panel picks the
      // stashed value up via storage.onChanged even though it arrives
      // after open().
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
          else if (selected) stashForSidePanel(isHtmlToMd, selected, selected);
        }).catch(function (err) {
          console.warn('[MD] executeScript failed:', err.message);
          if (selected) stashForSidePanel(isHtmlToMd, selected, selected);
        });
      } else if (selected) {
        stashForSidePanel(isHtmlToMd, selected, selected);
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
