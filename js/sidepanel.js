// sidepanel.js — wire up the editor, live preview, view toggle, and pending selection

var DEFAULTS = {
  fontSize: 14,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  theme: 'light',
  mode: 'popup',
  view: 'split',
  inputMode: 'md',
  keymap: 'default'
};

var config = {};

var SIDEPANEL_THEMES = globalThis.MD_SIDEPANEL_THEMES;

function safeHtml(html) {
  return (globalThis.DOMPurify && globalThis.DOMPurify.sanitize)
    ? globalThis.DOMPurify.sanitize(html)
    : html;
}

window.addEventListener('error', function (e) {
  if (status) { status.textContent = 'Error'; status.classList.add('error'); }
  if (preview) {
    preview.innerHTML = '<pre style="color:#c00;white-space:pre-wrap">' +
      safeHtml(String(e.message || e.error || e)) + '</pre>';
  }
  console.error('[MD] side panel error:', e.message, e.error);
});

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const workspace = document.getElementById('workspace');
const status = document.getElementById('status');
const countsEl = document.getElementById('counts');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const dlMdBtn = document.getElementById('dl-md-btn');
const dlHtmlBtn = document.getElementById('dl-html-btn');
const printBtn = document.getElementById('print-btn');
const zenBtn = document.getElementById('zen-btn');
const draftNote = document.getElementById('draft-note');
const settingsBtn = document.getElementById('settings-btn');
const modeMdBtn = document.getElementById('mode-md');
const modeHtmlBtn = document.getElementById('mode-html');
const toolTheme = document.getElementById('tool-theme');
const toolFontSize = document.getElementById('tool-fontsize');
const toolFontFamily = document.getElementById('tool-fontfamily');
const toolKeymap = document.getElementById('tool-keymap');
const previewPane = document.querySelector('.preview-pane');

var inputMode = 'md'; // 'md' or 'html'
var hlLink = document.querySelector('link[href*="highlight"]');

// CodeMirror engine — replaces the plain textarea with a Markdown-mode
// editor (line numbers, find/replace, Vim keymap). Every read/write goes
// through getText()/setText() so the hidden textarea remains a working
// fallback when the vendored scripts fail to load.
var cm = null;
var cmScroll = null;
// True while setText() drives the editor programmatically. CodeMirror fires
// 'change' synchronously from setValue(), and without this guard every
// pending-selection / draft-restore / drop would schedule a second render
// that wipes the status message the caller just set ('From selection', …).
var silentSet = false;

function getText() {
  if (cm) return cm.getValue();
  return editor ? editor.value : '';
}

function setText(v) {
  if (cm) {
    silentSet = true;
    try { cm.setValue(v || ''); } finally { silentSet = false; }
  }
  else if (editor) editor.value = v || '';
}

function focusEditor() {
  if (cm) cm.focus();
  else if (editor) editor.focus();
}

function setPlaceholder(mode) {
  var text = mode === 'html'
    ? '# Paste HTML here — see Markdown output on the right'
    : '# Write or paste Markdown here…\n\nSelect text on a page → right-click → "Preview as Markdown"';
  if (cm) cm.setOption('placeholder', text);
  else if (editor) editor.placeholder = text;
}

function setKeymap(name, silent) {
  var okVim = !!(globalThis.CodeMirror && globalThis.CodeMirror.Vim);
  config.keymap = (name === 'vim' && okVim) ? 'vim' : 'default';
  if (cm) cm.setOption('keyMap', config.keymap);
  if (toolKeymap) toolKeymap.value = config.keymap;
  if (!silent) saveConfig();
}

function initEditor() {
  var CM = globalThis.CodeMirror;
  if (cm || !CM || typeof CM.fromTextArea !== 'function') return;
  if (!CM.modes || !CM.modes.markdown) {
    console.warn('[MD] CodeMirror markdown mode missing — using textarea');
    return;
  }
  try {
    cm = CM.fromTextArea(editor, {
      mode: 'markdown',
      theme: 'marklens',
      lineNumbers: true,
      lineWrapping: true,
      tabSize: 2,
      indentWithTabs: false,
      highlightFormatting: true,
      placeholder: editor ? editor.placeholder : '',
      keyMap: config.keymap === 'vim' ? 'vim' : 'default'
    });
    cmScroll = cm.getScrollerElement();
    cm.on('change', function () {
      if (silentSet) return;
      scheduleRender();
      saveDraft(false);
    });
    if (cmScroll && previewPane) {
      cmScroll.addEventListener('scroll', function () {
        if (scrollSyncing) return;
        scrollSyncing = true;
        syncScroll(cmScroll, previewPane);
        scrollSyncing = false;
      });
    }
  } catch (e) {
    console.error('[MD] CodeMirror init failed — using textarea:', e);
    cm = null;
    cmScroll = null;
  }
}

// Document library (Phase 1, offline via IndexedDB).
// Keeps a primary `marklensDraft` fallback for environments without IDB.
var currentDocId = null;
var currentDocTitle = 'Untitled';
var currentDocCreatedAt = 0;
var docSaveTimer = null;
var docsFilter = '';

function appStateKey() { return 'marklensAppState'; }
function loadAppState(cb) {
  if (!chrome.storage || !chrome.storage.local) { cb({}); return; }
  chrome.storage.local.get([appStateKey()], function (res) {
    cb((res && res[appStateKey()]) || {});
  });
}
function saveAppState() {
  if (!chrome.storage || !chrome.storage.local) return;
  var payload = {};
  payload[appStateKey()] = { activeDocId: currentDocId };
  chrome.storage.local.set(payload);
}

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'doc_' + Date.now() + '_' + Math.random().toString(36).slice(2);
}

function ensureDoc() {
  if (currentDocId) return;
  // Create a fresh doc mirroring current editor content.
  createDoc(currentDocTitle || 'Untitled', getText(), inputMode, function (doc) {
    // handled in callback; do nothing extra
  });
}

function createDoc(title, content, mode, cb) {
  if (!globalThis.mdDB) { if (cb) cb(null); return; }
  var now = Date.now();
  var doc = {
    id: uid(),
    title: (title && String(title).trim()) ? String(title).trim() : 'Untitled',
    content: (content == null ? '' : String(content)),
    inputMode: mode === 'html' ? 'html' : 'md',
    folder: '',
    tags: [],
    createdAt: now,
    updatedAt: now
  };
  globalThis.mdDB.put('docs', doc, function (ok) {
    if (ok) {
      currentDocId = doc.id;
      currentDocTitle = doc.title;
      currentDocCreatedAt = doc.createdAt;
      saveAppState();
      renderDocList();
    }
    if (cb) cb(ok ? doc : null);
  });
}

function saveCurrentDoc(immediate) {
  if (!currentDocId || !globalThis.mdDB) return;
  if (docSaveTimer) clearTimeout(docSaveTimer);
  var write = function () {
    globalThis.mdDB.get('docs', currentDocId, function (existing) {
      var now = Date.now();
      var doc = existing || { id: currentDocId, createdAt: currentDocCreatedAt || now };
      doc.title = currentDocTitle || doc.title || 'Untitled';
      doc.content = getText();
      doc.inputMode = inputMode;
      doc.updatedAt = now;
      if (!doc.createdAt) doc.createdAt = currentDocCreatedAt || now;
      globalThis.mdDB.put('docs', doc, function () { /* silent */ });
    });
  };
  if (immediate) write();
  else docSaveTimer = setTimeout(write, 600);
}

function openDoc(id) {
  if (!id || !globalThis.mdDB) return;
  if (id === currentDocId) return;
  saveCurrentDoc(true);
  globalThis.mdDB.get('docs', id, function (doc) {
    if (!doc) return;
    currentDocId = doc.id;
    currentDocTitle = doc.title || 'Untitled';
    currentDocCreatedAt = doc.createdAt || 0;
    setText(doc.content || '');
    setInputMode(doc.inputMode === 'html' ? 'html' : 'md', true);
    setView(config.view || 'split', true);
    renderNow();
    if (status) { status.textContent = 'Opened ' + currentDocTitle; status.classList.remove('error'); }
    saveAppState();
    renderDocList();
  });
}

function renameDoc(id, newTitle) {
  if (!id || !globalThis.mdDB) return;
  var title = (newTitle || '').trim() || 'Untitled';
  globalThis.mdDB.get('docs', id, function (doc) {
    if (!doc) return;
    doc.title = title;
    doc.updatedAt = Date.now();
    globalThis.mdDB.put('docs', doc, function () {
      if (id === currentDocId) currentDocTitle = title;
      renderDocList();
    });
  });
}

function deleteDoc(id) {
  if (!id || !globalThis.mdDB) return;
  if (id === currentDocId) {
    currentDocId = null;
    currentDocTitle = 'Untitled';
    globalThis.mdDB.all('docs', function (docs) {
      var others = (docs || []).filter(function (d) { return d.id !== id; });
      globalThis.mdDB.del('docs', id, function () {
        if (!others.length) {
          createDoc('Untitled', '', 'md', function (doc) {
            setText('');
            setInputMode('md', true);
            renderNow();
            renderDocList();
          });
        } else {
          openDoc(others[0].id);
          renderDocList();
        }
      });
    });
  } else {
    globalThis.mdDB.del('docs', id, function () { renderDocList(); });
  }
}

function applyPendingToNewDoc(text) {
  pendingApplied = true;
  saveCurrentDoc(true);
  createDoc('From selection', text, 'md', function (doc) {
    if (!doc) return;
    currentDocId = doc.id;
    currentDocTitle = doc.title;
    currentDocCreatedAt = doc.createdAt;
    setText(text);
    setInputMode('md', true);
    setView('preview', true);
    renderNow();
    if (status) { status.textContent = 'From selection'; status.classList.remove('error'); }
    saveAppState();
    renderDocList();
  });
}

function applyPendingHtmlToNewDoc(html) {
  pendingApplied = true;
  saveCurrentDoc(true);
  createDoc('From HTML selection', html, 'html', function (doc) {
    if (!doc) return;
    currentDocId = doc.id;
    currentDocTitle = doc.title;
    currentDocCreatedAt = doc.createdAt;
    setText(html);
    setInputMode('html', true);
    setView('split', true);
    renderNow();
    if (status) { status.textContent = 'From HTML selection'; status.classList.remove('error'); }
    saveAppState();
    renderDocList();
  });
}

function renderDocList() {
  var list = document.getElementById('docs-list');
  if (!list || !globalThis.mdDB) return;
  globalThis.mdDB.all('docs', function (docs) {
    docs = docs || [];
    docs.sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
    var q = (docsFilter || '').toLowerCase();
    if (q) docs = docs.filter(function (d) {
      return (d.title || '').toLowerCase().indexOf(q) !== -1
        || (d.content || '').toLowerCase().indexOf(q) !== -1;
    });
    list.innerHTML = '';
    if (!docs.length) {
      var empty = document.createElement('li');
      empty.className = 'docs-empty';
      empty.textContent = 'No documents yet. Click + to create one.';
      list.appendChild(empty);
      return;
    }
    docs.forEach(function (d) {
      var li = document.createElement('li');
      li.className = 'docs-item' + (d.id === currentDocId ? ' active' : '');
      var title = document.createElement('span');
      title.className = 'title';
      title.textContent = d.title || 'Untitled';
      li.appendChild(title);
      var del = document.createElement('button');
      del.className = 'del';
      del.textContent = '×';
      del.title = 'Delete';
      del.addEventListener('click', function (e) {
        e.stopPropagation();
        if (confirm('Delete "' + (d.title || 'Untitled') + '"?')) deleteDoc(d.id);
      });
      li.appendChild(del);
      li.addEventListener('click', function () { openDoc(d.id); });
      li.addEventListener('dblclick', function () {
        var nt = prompt('Rename document:', d.title || 'Untitled');
        if (nt !== null) renameDoc(d.id, nt);
      });
      list.appendChild(li);
    });
  });
  if (typeof renderSnapList === 'function') renderSnapList();
}

// Snapshots (Phase 2)
var SNAPSHOT_MAX = 50;

function getSnapshotsForDoc(docId, cb) {
  if (!docId || !globalThis.mdDB) { if (cb) cb([]); return; }
  globalThis.mdDB.all('snapshots', function (items) {
    var out = (items || []).filter(function (s) { return s.docId === docId; });
    out.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    if (cb) cb(out);
  });
}

function pruneSnapshots(docId, cb) {
  getSnapshotsForDoc(docId, function (items) {
    if (items.length <= SNAPSHOT_MAX) { if (cb) cb(); return; }
    var extra = items.slice(SNAPSHOT_MAX);
    var left = extra.length;
    extra.forEach(function (s) {
      globalThis.mdDB.del('snapshots', s.id, function () {
        left -= 1;
        if (left <= 0 && cb) cb();
      });
    });
  });
}

function createSnapshot(label, cb) {
  if (!currentDocId || !globalThis.mdDB) { if (cb) cb(null); return; }
  saveCurrentDoc(true);
  var snap = {
    id: uid(),
    docId: currentDocId,
    label: (label && String(label).trim()) ? String(label).trim() : ('Snapshot ' + new Date().toLocaleString()),
    content: getText(),
    inputMode: inputMode,
    createdAt: Date.now()
  };
  globalThis.mdDB.put('snapshots', snap, function (ok) {
    if (ok) pruneSnapshots(currentDocId);
    renderSnapList();
    if (cb) cb(ok ? snap : null);
  });
}

function deleteSnapshot(id, cb) {
  if (!id || !globalThis.mdDB) return;
  globalThis.mdDB.del('snapshots', id, function () {
    renderSnapList();
    if (cb) cb();
  });
}

function restoreSnapshot(snap) {
  if (!snap) return;
  if (!confirm('Restore this snapshot? Unsaved changes will be overwritten.')) return;
  setText(snap.content || '');
  setInputMode(snap.inputMode === 'html' ? 'html' : 'md', true);
  renderNow();
  saveCurrentDoc(true);
  if (status) { status.textContent = 'Restored snapshot'; status.classList.remove('error'); }
}

function diffLines(oldText, newText) {
  var a = String(oldText == null ? '' : oldText).split('\n');
  var b = String(newText == null ? '' : newText).split('\n');
  var n = a.length, m = b.length;
  var dp = new Array(n + 1);
  for (var i = 0; i <= n; i++) {
    dp[i] = new Array(m + 1);
    dp[i][0] = 0;
  }
  for (var j = 0; j <= m; j++) dp[0][j] = 0;
  for (i = 1; i <= n; i++) {
    for (j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  var ops = [];
  i = n; j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.unshift({ t: 'eq', text: a[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ t: 'add', text: b[j - 1] });
      j--;
    } else {
      ops.unshift({ t: 'del', text: a[i - 1] });
      i--;
    }
  }
  return ops;
}

function showDiff(snap) {
  if (!snap || !document.getElementById('diff-modal')) return;
  var ops = diffLines(snap.content || '', getText());
  var added = 0, removed = 0;
  ops.forEach(function (o) {
    if (o.t === 'add') added++;
    else if (o.t === 'del') removed++;
  });
  var meta = document.getElementById('diff-meta');
  if (meta) meta.textContent = (snap.label || 'Snapshot') + '  →  current    +' + added + '  -' + removed;
  var title = document.getElementById('diff-title');
  if (title) title.textContent = 'Diff: ' + (snap.label || 'Snapshot');
  var body = document.getElementById('diff-body');
  if (body) {
    body.innerHTML = '';
    ops.forEach(function (o) {
      var row = document.createElement('div');
      row.className = 'diff-line ' + (o.t === 'add' ? 'diff-add' : o.t === 'del' ? 'diff-del' : 'diff-eq');
      var prefix = o.t === 'add' ? '+' : o.t === 'del' ? '-' : ' ';
      row.textContent = prefix + ' ' + o.text;
      body.appendChild(row);
    });
    if (!ops.length) {
      var empty = document.createElement('div');
      empty.className = 'diff-line diff-eq';
      empty.textContent = '(no differences)';
      body.appendChild(empty);
    }
  }
  var modal = document.getElementById('diff-modal');
  if (modal) modal.removeAttribute('hidden');
}

function hideDiff() {
  var modal = document.getElementById('diff-modal');
  if (modal) modal.setAttribute('hidden', '');
}

function renderSnapList() {
  var list = document.getElementById('snaps-list');
  var titleEl = document.getElementById('snaps-doc-title');
  if (titleEl) titleEl.textContent = currentDocId ? ('Document: ' + currentDocTitle) : 'No document open.';
  if (!list || !globalThis.mdDB || !currentDocId) {
    if (list) list.innerHTML = '<li class="docs-empty">Open a document to manage snapshots.</li>';
    return;
  }
  getSnapshotsForDoc(currentDocId, function (snaps) {
    list.innerHTML = '';
    if (!snaps.length) {
      var empty = document.createElement('li');
      empty.className = 'docs-empty';
      empty.textContent = 'No snapshots yet. Click + to save one.';
      list.appendChild(empty);
      return;
    }
    snaps.forEach(function (s) {
      var li = document.createElement('li');
      li.className = 'docs-item';
      var info = document.createElement('div');
      info.style.flex = '1';
      info.style.minWidth = '0';
      var t = document.createElement('div');
      t.className = 'title';
      t.textContent = s.label || 'Snapshot';
      info.appendChild(t);
      var sub = document.createElement('div');
      sub.style.fontSize = '11px';
      sub.style.color = 'var(--text2)';
      sub.textContent = new Date(s.createdAt || 0).toLocaleString();
      info.appendChild(sub);
      li.appendChild(info);

      var act = document.createElement('div');
      act.style.display = 'flex';
      act.style.gap = '4px';
      var diffBtn = document.createElement('button');
      diffBtn.className = 'del';
      diffBtn.style.opacity = '1';
      diffBtn.textContent = 'Diff';
      diffBtn.title = 'Compare to current';
      diffBtn.addEventListener('click', function (e) { e.stopPropagation(); showDiff(s); });
      act.appendChild(diffBtn);
      var restBtn = document.createElement('button');
      restBtn.className = 'del';
      restBtn.style.opacity = '1';
      restBtn.textContent = 'Restore';
      restBtn.title = 'Restore snapshot';
      restBtn.addEventListener('click', function (e) { e.stopPropagation(); restoreSnapshot(s); });
      act.appendChild(restBtn);
      var delBtn = document.createElement('button');
      delBtn.className = 'del';
      delBtn.textContent = '×';
      delBtn.title = 'Delete snapshot';
      delBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (confirm('Delete snapshot "' + (s.label || 'Snapshot') + '"?')) deleteSnapshot(s.id);
      });
      act.appendChild(delBtn);
      li.appendChild(act);
      list.appendChild(li);
    });
  });
}

function initDocLibrary(cb) {
  if (!globalThis.mdDB) { if (cb) cb(); return; }
  globalThis.mdDB.ready(function (ok) {
    if (!ok) { if (cb) cb(); return; }
    globalThis.mdDB.all('docs', function (docs) {
      docs = docs || [];
      if (!docs.length) {
        // migrate from draft
        restoreDraft(function (draft) {
          var content = draft && draft.text ? draft.text : '';
          var mode = (draft && draft.inputMode === 'html') ? 'html' : 'md';
          createDoc('Untitled', content, mode, function (doc) {
            if (doc) {
              currentDocCreatedAt = doc.createdAt || Date.now();
              setText(content);
              setInputMode(mode, true);
            }
            if (cb) cb();
          });
        });
        return;
      }
      loadAppState(function (state) {
        var pick = (state && state.activeDocId && docs.some(function (d) { return d.id === state.activeDocId; }))
          ? state.activeDocId : docs.slice().sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); })[0].id;
        globalThis.mdDB.get('docs', pick, function (doc) {
          if (doc) {
            currentDocId = doc.id;
            currentDocTitle = doc.title || 'Untitled';
            currentDocCreatedAt = doc.createdAt || 0;
            setText(doc.content || '');
            setInputMode(doc.inputMode === 'html' ? 'html' : 'md', true);
          }
          if (cb) cb();
        });
      });
    });
  });
}

// Save into the document library alongside the legacy draft autosave.
function saveDraft(immediate) {
  if (draftTimer) clearTimeout(draftTimer);
  var write = function () {
    if (!chrome.storage || !chrome.storage.local) return;
    var payload = {};
    payload[DRAFT_KEY] = {
      text: getText(),
      inputMode: inputMode,
      updatedAt: Date.now()
    };
    chrome.storage.local.set(payload, function () {
      if (!chrome.runtime.lastError) flashDraftNote();
    });
  };
  if (immediate) write();
  else draftTimer = setTimeout(write, 500);
  // mirror to document library when available
  if (globalThis.mdDB) saveCurrentDoc(!!immediate);
}

// Draft autosave — editor text + input mode persist in chrome.storage.local
// under a separate key (never mixed into mdPreviewConfig). Restored on boot
// unless a context-menu pending selection takes precedence.
var DRAFT_KEY = 'marklensDraft';
var draftTimer = null;
var draftNoteTimer = null;

function currentMarkdown() {
  if (inputMode === 'html') return htmlToMarkdown(getText());
  return getText();
}

function flashDraftNote() {
  if (!draftNote) return;
  draftNote.textContent = 'Draft saved ✓';
  if (draftNoteTimer) clearTimeout(draftNoteTimer);
  draftNoteTimer = setTimeout(function () { draftNote.textContent = ''; }, 2000);
}

function restoreDraft(cb) {
  if (!chrome.storage || !chrome.storage.local) { cb(null); return; }
  chrome.storage.local.get([DRAFT_KEY], function (res) {
    cb(res && res[DRAFT_KEY] ? res[DRAFT_KEY] : null);
  });
}

// GFM + breaks so single newlines render as <br>; enable plugins.
if (globalThis.setupMarked) globalThis.setupMarked();

function updateCounts(src) {
  if (!countsEl) return;
  var text = src || '';
  var words = text.trim() ? text.trim().split(/\s+/).length : 0;
  countsEl.textContent = words + (words === 1 ? ' word' : ' words') + ' · ' + text.length + ' chars';
}

function hasHtmlTags(s) {
  return /<\/?[a-zA-Z][^<>]*>/.test(s || '');
}

function renderNow() {
  var src = getText();
  updateCounts(src);
  // Auto-detect: HTML mode holding tag-less (Markdown) content renders as
  // Markdown — Turndown could only echo it back flattened. The toggle keeps
  // the user's explicit choice; this only picks the renderer per content.
  if (inputMode === 'html' && src.trim() && !hasHtmlTags(src)) {
    renderMarkdown(src);
    return;
  }
  if (inputMode === 'html') { convertHtmlToMd(src); return; }
  renderMarkdown(src);
}

function renderMarkdown(src) {
  if (!globalThis.marked || typeof globalThis.marked.parse !== 'function') {
    if (status) { status.textContent = 'Renderer missing'; status.classList.add('error'); }
    if (preview) preview.innerHTML = '<p style="color:#c00">marked not loaded — reload the extension.</p>';
    console.error('[MD] marked missing on side panel');
    return;
  }
  try {
    var html = globalThis.marked.parse(src);
    // Flattened selections (Chrome strips newlines in selectionText)
    // render tables as paragraphs — adopt the reflowed source only
    // when it parses to more <table>s than the original.
    if (globalThis.reflowFlattenedTable) {
      var fixed = globalThis.reflowFlattenedTable(src);
      if (fixed !== src) {
        var html2 = globalThis.marked.parse(fixed);
        var n1 = (html.match(/<table[\s>]/g) || []).length;
        var n2 = (html2.match(/<table[\s>]/g) || []).length;
        if (n2 > n1) html = html2;
      }
    }
    preview.innerHTML = safeHtml(html);
    if (status) { status.textContent = 'Live'; status.classList.remove('error'); }
    copyBtn.textContent = 'Copy HTML';
    copyBtn.title = 'Copy rendered HTML (Ctrl+Enter / Ctrl+S)';
  } catch (e) {
    if (status) { status.textContent = 'Render error'; status.classList.add('error'); }
    if (preview) preview.innerHTML = '<pre style="color:#c00;white-space:pre-wrap">' + safeHtml(String(e && e.stack ? e.stack : e)) + '</pre>';
    console.error('[MD] render error:', e);
  }
}

function loadConfig(cb) {
  globalThis.mdStorage.load(DEFAULTS, function (c) { config = c; cb(); });
}

function saveConfig() { globalThis.mdStorage.save(config); }

function applyTheme(name) {
  var t = SIDEPANEL_THEMES[name] || SIDEPANEL_THEMES.light;
  var root = document.documentElement;
  for (var k in t.vars) {
    if (Object.prototype.hasOwnProperty.call(t.vars, k)) {
      root.style.setProperty(k, t.vars[k]);
    }
  }
  if (toolTheme) toolTheme.value = name;
  // Swap highlight.js CSS
  if (hlLink) {
    hlLink.href = t.hl === 'dark'
      ? chrome.runtime.getURL('css/highlight-dark.css')
      : chrome.runtime.getURL('css/highlight.css');
  }
}

function applyConfig() {
  if (preview) {
    preview.style.fontSize = config.fontSize + 'px';
    preview.style.fontFamily = config.fontFamily;
  }
  if (toolFontSize) toolFontSize.value = String(config.fontSize);
  if (toolFontFamily) toolFontFamily.value = config.fontFamily;
  if (toolKeymap) toolKeymap.value = config.keymap || 'default';
  applyTheme(config.theme || DEFAULTS.theme);
}

function htmlToMarkdown(html) {
  var TS = globalThis.TurndownService;
  if (!TS) return null;
  try {
    var src = String(html || '');
    // No HTML markup: nothing to convert. Return as-is so Markdown
    // tables/fences keep their line breaks (Turndown follows HTML
    // whitespace rules and would collapse plain-text newlines into
    // spaces, flattening tables to one line).
    if (!hasHtmlTags(src)) {
      return src.replace(/\n{3,}/g, '\n\n').trim();
    }
    var ts = new TS({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
    if (globalThis.turndownPluginGfm) ts.use(globalThis.turndownPluginGfm.gfm);
    var md = ts.turndown(src).replace(/\n{3,}/g, '\n\n').trim();
    // Safety net: a text-heavy selection can still lose its row breaks;
    // restore them when the output holds a flattened table.
    if (globalThis.reflowFlattenedTable) {
      var fixed = globalThis.reflowFlattenedTable(md);
      if (fixed !== md) md = fixed;
    }
    return md;
  } catch (e) {
    console.error('[MD] convert error:', e);
    return null;
  }
}

function convertHtmlToMd(html) {
  var md = htmlToMarkdown(html);
  if (md === null) {
    var hasLib = !!globalThis.TurndownService;
    if (!hasLib) {
      if (status) { status.textContent = 'Converter missing'; status.classList.add('error'); }
      if (preview) preview.innerHTML = '<p style="color:#c00">TurndownService not loaded — reload the extension.</p>';
      console.error('[MD] TurndownService missing: vendor/turndown.min.js did not load');
      return;
    }
    if (status) { status.textContent = 'Convert error'; status.classList.add('error'); }
    if (preview) preview.innerHTML = '<pre style="color:#c00;white-space:pre-wrap">Conversion failed.</pre>';
    return;
  }
  preview.innerHTML = '<pre class="md-source-output"></pre>';
  preview.firstChild.textContent = md;
  if (status) { status.textContent = 'HTML→MD'; status.classList.remove('error'); }
  copyBtn.textContent = 'Copy MD';
  copyBtn.title = 'Copy Markdown source (Ctrl+Enter / Ctrl+S)';
}

function setInputMode(mode, silent) {
  inputMode = mode;
  config.inputMode = mode;
  modeMdBtn.classList.toggle('active', mode === 'md');
  modeHtmlBtn.classList.toggle('active', mode === 'html');
  setPlaceholder(mode);
  if (!silent) {
    saveConfig();
    saveDraft(true);
    renderNow();
  }
}

modeMdBtn.addEventListener('click', function () { setInputMode('md'); });
modeHtmlBtn.addEventListener('click', function () { setInputMode('html'); });

function setView(view, silent) {
  workspace.className = 'view-' + view;
  document.querySelectorAll('.tab').forEach(function (t) {
    var active = t.dataset.view === view;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  config.view = view;
  if (!silent) saveConfig();
}

document.querySelectorAll('.tab').forEach(function (t) {
  t.addEventListener('click', function () {
    setView(t.dataset.view);
  });
});

// Document library UI wiring.
var docsBtn = document.getElementById('docs-btn');
var docsPanel = document.getElementById('docs-panel');
var docsNewBtn = document.getElementById('docs-new-btn');
var docsCloseBtn = document.getElementById('docs-close-btn');
var docsSearch = document.getElementById('docs-search');
var snapsBtn = document.getElementById('snaps-btn');
var snapsPanel = document.getElementById('snaps-panel');
var snapsNewBtn = document.getElementById('snaps-new-btn');
var snapsCloseBtn = document.getElementById('snaps-close-btn');
var diffCloseBtn = document.getElementById('diff-close');

function setSnapsOpen(on) {
  if (!snapsPanel) return;
  if (on) snapsPanel.removeAttribute('hidden');
  else snapsPanel.setAttribute('hidden', '');
  if (on) renderSnapList();
}
if (snapsBtn) snapsBtn.addEventListener('click', function () {
  if (!snapsPanel) return;
  var opening = snapsPanel.hasAttribute('hidden');
  setSnapsOpen(opening);
});
if (snapsCloseBtn) snapsCloseBtn.addEventListener('click', function () { setSnapsOpen(false); });
if (snapsNewBtn) snapsNewBtn.addEventListener('click', function () {
  var label = prompt('Snapshot label (optional):', '');
  createSnapshot(label, function () {
    setSnapsOpen(true);
    renderSnapList();
  });
});
if (diffCloseBtn) diffCloseBtn.addEventListener('click', hideDiff);
var diffModal = document.getElementById('diff-modal');
if (diffModal) diffModal.addEventListener('click', function (e) {
  if (e.target === diffModal) hideDiff();
});
function setDocsOpen(on) {
  if (!docsPanel) return;
  if (on) docsPanel.removeAttribute('hidden');
  else docsPanel.setAttribute('hidden', '');
}
if (docsBtn) docsBtn.addEventListener('click', function () {
  if (!docsPanel) return;
  var opening = docsPanel.hasAttribute('hidden');
  setDocsOpen(opening);
  if (opening) renderDocList();
});
if (docsCloseBtn) docsCloseBtn.addEventListener('click', function () { setDocsOpen(false); });
if (docsNewBtn) docsNewBtn.addEventListener('click', function () {
  saveCurrentDoc(true);
  createDoc('Untitled', '', inputMode, function (doc) {
    if (!doc) return;
    setText('');
    setView(config.view || 'split', true);
    renderNow();
    saveDraft(true);
    focusEditor();
    setDocsOpen(true);
    renderDocList();
  });
});
if (docsSearch) docsSearch.addEventListener('input', function () {
  docsFilter = this.value || '';
  renderDocList();
});

// Keyboard: Alt+1/2/3 switch views, Alt+Z toggles zen, Esc exits zen,
// Ctrl/Cmd+Enter or Ctrl/Cmd+S copies.
// Arrow keys move between layout tabs when the tablist is focused.
document.addEventListener('keydown', function (e) {
  var mod = e.ctrlKey || e.metaKey;
  if (e.key === 'Escape' && document.body.classList.contains('zen')) {
    e.preventDefault();
    setZen(false);
    return;
  }
  if (e.key === 'Escape') {
    var dm = document.getElementById('diff-modal');
    if (dm && !dm.hasAttribute('hidden')) { e.preventDefault(); hideDiff(); return; }
  }
  if (e.altKey && !mod && (e.key === '1' || e.key === '2' || e.key === '3')) {
    e.preventDefault();
    setView(e.key === '1' ? 'split' : e.key === '2' ? 'edit' : 'preview');
    return;
  }
  if (e.altKey && !mod && (e.key === 'z' || e.key === 'Z')) {
    e.preventDefault();
    setZen(!document.body.classList.contains('zen'));
    return;
  }
  if (mod && !e.altKey && (e.key === 'Enter' || e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    copyBtn.click();
  }
});

document.querySelector('.view-toggle').addEventListener('keydown', function (e) {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  e.preventDefault();
  var order = ['split', 'edit', 'preview'];
  var active = document.querySelector('.tab.active');
  var cur = order.indexOf(active ? active.dataset.view : 'split');
  var next = (cur + (e.key === 'ArrowRight' ? 1 : order.length - 1)) % order.length;
  setView(order[next]);
  document.querySelector('.tab[data-view="' + order[next] + '"]').focus();
});

var renderTimer = null;
function scheduleRender() {
  if (renderTimer) clearTimeout(renderTimer);
  renderTimer = setTimeout(renderNow, 120);
}

// Textarea fallback path: when CodeMirror is active the textarea is hidden
// and all changes flow through cm.on('change') in initEditor().
editor.addEventListener('input', function () {
  if (cm) return;
  scheduleRender();
  saveDraft(false);
});

clearBtn.addEventListener('click', function () {
  setText('');
  renderNow();
  saveDraft(true);
  focusEditor();
});

settingsBtn.addEventListener('click', function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  }
});

copyBtn.addEventListener('click', function () {
  var copyText = inputMode === 'html'
    ? (preview.firstChild ? preview.firstChild.textContent : '')
    : preview.innerHTML;
  var done = function () {
    var old = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(function () { copyBtn.textContent = old; }, 1200);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(copyText).then(done, done);
  } else {
    var ta = document.createElement('textarea');
    ta.value = copyText; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    ta.remove();
  }
});

// Export: download the document as a Markdown or styled-HTML file (Blob,
// no new permissions), or print / save-as-PDF via the browser print engine.
function downloadFile(filename, mime, text) {
  var blob = new Blob([text], { type: mime });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 500);
}

function flashAction(btn, label) {
  var old = btn.textContent;
  btn.textContent = label;
  setTimeout(function () { btn.textContent = old; }, 1200);
}

if (dlMdBtn) dlMdBtn.addEventListener('click', function () {
  var md = currentMarkdown();
  if (md === null || !md) {
    if (status) { status.textContent = md === null ? 'Converter missing' : 'Nothing to download'; }
    return;
  }
  downloadFile('marklens-doc.md', 'text/markdown;charset=utf-8', md);
  flashAction(dlMdBtn, 'Saved!');
});

function standaloneHtml() {
  var t = SIDEPANEL_THEMES[config.theme] || SIDEPANEL_THEMES.light;
  var vars = '';
  for (var k in t.vars) {
    if (Object.prototype.hasOwnProperty.call(t.vars, k)) vars += k + ':' + t.vars[k] + ';';
  }
  var body = preview ? preview.innerHTML : '';
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
    '<title>MarkLens export</title>\n<style>\n:root{' + vars + '}\n' +
    'body{background:var(--bg);color:var(--text);font-family:' +
    (config.fontFamily || 'sans-serif') + ';font-size:' +
    (config.fontSize || 14) + 'px;line-height:1.7;max-width:820px;margin:0 auto;padding:32px 24px;}\n' +
    'pre{background:var(--surface);padding:12px 14px;border-radius:8px;overflow:auto;}\n' +
    'code{font-family:Consolas,Menlo,monospace;}\n' +
    'table{border-collapse:collapse;width:100%;}th,td{border:1px solid var(--border);padding:6px 10px;}\n' +
    'blockquote{border-left:3px solid var(--border);margin:1em 0;padding:0 1em;color:var(--text2);}\n' +
    '</style>\n</head>\n<body>\n' + body + '\n</body>\n</html>\n';
}

if (dlHtmlBtn) dlHtmlBtn.addEventListener('click', function () {
  if (inputMode === 'html') renderNow();
  downloadFile('marklens-doc.html', 'text/html;charset=utf-8', standaloneHtml());
  flashAction(dlHtmlBtn, 'Saved!');
});

if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

// Drag & drop: drop .md / .markdown / .txt / .html files onto the editor.
// HTML files feed the HTML→MD path; everything else is treated as Markdown.
var DROP_EXT = /\.(md|markdown|mdown|mkdn|txt|text|html|htm)$/i;
var editorPane = document.querySelector('.editor-pane');

function setDropArmed(on) {
  if (workspace) workspace.classList.toggle('drop-armed', !!on);
}

if (editorPane) {
  ['dragenter', 'dragover'].forEach(function (ev) {
    editorPane.addEventListener(ev, function (e) {
      e.preventDefault();
      setDropArmed(true);
    });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    editorPane.addEventListener(ev, function (e) {
      e.preventDefault();
      if (ev === 'dragleave' && e.relatedTarget && editorPane.contains(e.relatedTarget)) return;
      setDropArmed(false);
    });
  });
  editorPane.addEventListener('drop', function (e) {
    var files = (e.dataTransfer && e.dataTransfer.files) || [];
    if (!files.length) return;
    var file = files[0];
    if (file.name && !DROP_EXT.test(file.name)) {
      if (status) { status.textContent = 'Unsupported file: ' + file.name; status.classList.add('error'); }
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      var text = String(reader.result || '');
      var isHtml = /\.html?$/i.test(file.name || '') || (inputMode === 'html' && !/\.(md|markdown|mdown|mkdn|txt|text)$/i.test(file.name || ''));
      setInputMode(isHtml ? 'html' : 'md', true);
      setText(text);
      renderNow();
      saveDraft(true);
      if (status) { status.textContent = 'Opened ' + (file.name || 'file'); status.classList.remove('error'); }
    };
    reader.onerror = function () {
      if (status) { status.textContent = 'Could not read file'; status.classList.add('error'); }
    };
    reader.readAsText(file);
  });
}

// Synced scrolling: keep the editor and preview panes proportionally aligned
// in both directions. Guard flag prevents scroll-event feedback loops.
var scrollSyncing = false;

function syncScroll(from, to) {
  var fromMax = from.scrollHeight - from.clientHeight;
  var toMax = to.scrollHeight - to.clientHeight;
  if (fromMax <= 0 || toMax <= 0) return;
  to.scrollTop = (from.scrollTop / fromMax) * toMax;
}

// Scroll sync — preview → editor leg. The editor → preview leg is wired in
// initEditor (CodeMirror scroller); the textarea fallback is below and
// stays dormant while CM is active (hidden textareas don't scroll).
if (previewPane) previewPane.addEventListener('scroll', function () {
  if (scrollSyncing) return;
  var target = cmScroll || editor;
  if (!target) return;
  scrollSyncing = true;
  syncScroll(previewPane, target);
  scrollSyncing = false;
});
if (editor && previewPane) editor.addEventListener('scroll', function () {
  if (scrollSyncing || cmScroll) return;
  scrollSyncing = true;
  syncScroll(editor, previewPane);
  scrollSyncing = false;
});

// Zen mode: hide all chrome for distraction-free writing. Session-only
// (not persisted) so it can never trap a user across restarts. Esc exits.
function setZen(on) {
  document.body.classList.toggle('zen', !!on);
  if (zenBtn) zenBtn.classList.toggle('active', !!on);
  if (status) status.textContent = on ? 'Zen — Esc to exit' : 'Live';
}

if (zenBtn) zenBtn.addEventListener('click', function () {
  setZen(!document.body.classList.contains('zen'));
});

// Toolbar controls
toolTheme.addEventListener('change', function () {
  config.theme = this.value;
  applyTheme(config.theme);
  saveConfig();
});

toolFontSize.addEventListener('change', function () {
  config.fontSize = parseInt(this.value, 10) || DEFAULTS.fontSize;
  if (preview) preview.style.fontSize = config.fontSize + 'px';
  saveConfig();
});

toolFontFamily.addEventListener('change', function () {
  config.fontFamily = this.value;
  if (preview) preview.style.fontFamily = config.fontFamily;
  saveConfig();
});

if (toolKeymap) toolKeymap.addEventListener('change', function () {
  setKeymap(this.value);
});

// Apply a Markdown string pushed from the context menu.
// Silent: the auto-applied view/mode must not overwrite the user's saved
// view/mode in storage — it only changes the live session.
var pendingApplied = false;

function applyPending(pending) {
  if (!pending) return;
  pendingApplied = true;
  setText(pending);
  setInputMode('md', true);
  setView('preview', true);
  renderNow();
  status.textContent = 'From selection';
}

function applyPendingHtml(html) {
  if (!html) return;
  pendingApplied = true;
  setText(html);
  setInputMode('html', true);
  setView('split', true);
  renderNow();
  status.textContent = 'From HTML selection';
}

function clearPending() {
  chrome.storage.session.remove(['pendingMarkdown', 'pendingHtml']);
}

// Already-open panel: react when a new selection arrives via context menu.
chrome.storage.onChanged.addListener(function (changes, area) {
  if (area !== 'session') return;
  if (changes.pendingHtml && changes.pendingHtml.newValue) {
    applyPendingHtmlToNewDoc(changes.pendingHtml.newValue);
    clearPending();
  } else if (changes.pendingMarkdown && changes.pendingMarkdown.newValue) {
    applyPendingToNewDoc(changes.pendingMarkdown.newValue);
    clearPending();
  }
});

// Boot: load saved config, apply theme/font/size, silently restore saved view
// + mode (single render below), then render. A pending context-menu selection
// takes precedence over the restored view/mode; otherwise the autosaved draft
// (if any) is restored so work survives a closed panel.
loadConfig(function () {
  // Startup self-check: name any vendored global that failed to load so a
  // broken install shows a precise diagnosis instead of a blank preview.
  var need = ['marked', 'TurndownService', 'DOMPurify', 'MD_SIDEPANEL_THEMES', 'setupMarked', 'mdStorage', 'CodeMirror', 'mdDB'];
  var missing = need.filter(function (k) { return !globalThis[k]; });
  if (missing.length && status) {
    status.textContent = 'Startup: missing ' + missing.join(', ');
    status.classList.add('error');
    console.error('[MD] missing globals at boot:', missing.join(', '));
  }
  applyConfig();
  initEditor();

  // Pending context-menu selection takes precedence.
  chrome.storage.session.get(['pendingMarkdown', 'pendingHtml'], function (res) {
    if (res && res.pendingHtml) {
      applyPendingHtmlToNewDoc(res.pendingHtml);
      clearPending();
      return;
    }
    if (res && res.pendingMarkdown) {
      applyPendingToNewDoc(res.pendingMarkdown);
      clearPending();
      return;
    }
    // Normal boot: restore document library (migrating the legacy draft on
    // first run), or fall back to the old draft path when IDB is unavailable.
    initDocLibrary(function () {
      if (currentDocId) {
        renderNow();
        if (status) { status.textContent = 'Document restored'; status.classList.remove('error'); }
      } else {
        restoreDraft(function (draft) {
          if (draft && draft.text) {
            setText(draft.text);
            setInputMode(draft.inputMode === 'html' ? 'html' : 'md', true);
            setView(config.view || 'split', true);
            renderNow();
            if (status) { status.textContent = 'Draft restored'; status.classList.remove('error'); }
          } else {
            setView(config.view || 'split', true);
            setInputMode(config.inputMode || 'md', true);
            renderNow();
          }
        });
      }
      renderDocList();
    });
  });
});
