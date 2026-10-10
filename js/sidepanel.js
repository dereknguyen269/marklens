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

function getText() {
  if (cm) return cm.getValue();
  return editor ? editor.value : '';
}

function setText(v) {
  if (cm) cm.setValue(v || '');
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
    cm.on('change', function () { scheduleRender(); saveDraft(false); });
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

function renderNow() {
  var src = getText();
  updateCounts(src);
  if (inputMode === 'html') { convertHtmlToMd(src); return; }
  if (!globalThis.marked || typeof globalThis.marked.parse !== 'function') {
    if (status) { status.textContent = 'Renderer missing'; status.classList.add('error'); }
    if (preview) preview.innerHTML = '<p style="color:#c00">marked not loaded — reload the extension.</p>';
    console.error('[MD] marked missing on side panel');
    return;
  }
  try {
    preview.innerHTML = safeHtml(globalThis.marked.parse(src));
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
    var ts = new TS({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
    if (globalThis.turndownPluginGfm) ts.use(globalThis.turndownPluginGfm.gfm);
    return ts.turndown(html || '').replace(/\n{3,}/g, '\n\n').trim();
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

// First load: read any pending selection.
chrome.storage.session.get(['pendingMarkdown', 'pendingHtml'], function (res) {
  if (res && res.pendingHtml) {
    applyPendingHtml(res.pendingHtml);
    clearPending();
  } else if (res && res.pendingMarkdown) {
    applyPending(res.pendingMarkdown);
    clearPending();
  }
});

// Already-open panel: react when a new selection arrives via context menu.
chrome.storage.onChanged.addListener(function (changes, area) {
  if (area !== 'session') return;
  if (changes.pendingHtml && changes.pendingHtml.newValue) {
    applyPendingHtml(changes.pendingHtml.newValue);
    clearPending();
  } else if (changes.pendingMarkdown && changes.pendingMarkdown.newValue) {
    applyPending(changes.pendingMarkdown.newValue);
    clearPending();
  }
});

// Boot: load saved config, apply theme/font/size, silently restore saved view
// + mode (single render below), then render. A pending context-menu selection
// takes precedence over the restored view/mode; otherwise the autosaved draft
// (if any) is restored so work survives a closed panel.
loadConfig(function () {
  applyConfig();
  initEditor();
  if (pendingApplied) { renderNow(); return; }
  restoreDraft(function (draft) {
    if (pendingApplied) { renderNow(); return; }
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
});
