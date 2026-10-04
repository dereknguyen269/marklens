// sidepanel.js — wire up the editor, live preview, view toggle, and pending selection

var DEFAULTS = {
  fontSize: 14,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  theme: 'light',
  mode: 'popup',
  view: 'split',
  inputMode: 'md'
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
const settingsBtn = document.getElementById('settings-btn');
const modeMdBtn = document.getElementById('mode-md');
const modeHtmlBtn = document.getElementById('mode-html');
const toolTheme = document.getElementById('tool-theme');
const toolFontSize = document.getElementById('tool-fontsize');
const toolFontFamily = document.getElementById('tool-fontfamily');

var inputMode = 'md'; // 'md' or 'html'
var hlLink = document.querySelector('link[href*="highlight"]');

// GFM + breaks so single newlines render as <br>; enable plugins.
if (globalThis.setupMarked) globalThis.setupMarked();

function updateCounts(src) {
  if (!countsEl) return;
  var text = src || '';
  var words = text.trim() ? text.trim().split(/\s+/).length : 0;
  countsEl.textContent = words + (words === 1 ? ' word' : ' words') + ' · ' + text.length + ' chars';
}

function renderNow() {
  var src = editor ? editor.value : '';
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
      ? chrome.runtime.getURL('highlight-dark.css')
      : chrome.runtime.getURL('highlight.css');
  }
}

function applyConfig() {
  if (preview) {
    preview.style.fontSize = config.fontSize + 'px';
    preview.style.fontFamily = config.fontFamily;
  }
  if (toolFontSize) toolFontSize.value = String(config.fontSize);
  if (toolFontFamily) toolFontFamily.value = config.fontFamily;
  applyTheme(config.theme || DEFAULTS.theme);
}

function convertHtmlToMd(html) {
  var TS = globalThis.TurndownService;
  if (!TS) {
    if (status) { status.textContent = 'Converter missing'; status.classList.add('error'); }
    if (preview) preview.innerHTML = '<p style="color:#c00">TurndownService not loaded — reload the extension.</p>';
    return;
  }
  try {
    var ts = new TS({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
    if (globalThis.turndownPluginGfm) ts.use(globalThis.turndownPluginGfm.gfm);
    var md = ts.turndown(html || '').replace(/\n{3,}/g, '\n\n').trim();
    preview.innerHTML = '<pre class="md-source-output"></pre>';
    preview.firstChild.textContent = md;
    if (status) { status.textContent = 'HTML→MD'; status.classList.remove('error'); }
    copyBtn.textContent = 'Copy MD';
    copyBtn.title = 'Copy Markdown source (Ctrl+Enter / Ctrl+S)';
  } catch (e) {
    if (status) { status.textContent = 'Convert error'; status.classList.add('error'); }
    if (preview) preview.innerHTML = '<pre style="color:#c00;white-space:pre-wrap">' + safeHtml(String(e && e.stack ? e.stack : e)) + '</pre>';
    console.error('[MD] convert error:', e);
  }
}

function setInputMode(mode, silent) {
  inputMode = mode;
  config.inputMode = mode;
  modeMdBtn.classList.toggle('active', mode === 'md');
  modeHtmlBtn.classList.toggle('active', mode === 'html');
  if (editor) {
    editor.placeholder = mode === 'html'
      ? '# Paste HTML here — see Markdown output on the right'
      : '# Write or paste Markdown here…\n\nSelect text on a page → right-click → "Preview as Markdown"';
  }
  if (!silent) {
    saveConfig();
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

// Keyboard: Alt+1/2/3 switch views, Ctrl/Cmd+Enter or Ctrl/Cmd+S copies.
// Arrow keys move between layout tabs when the tablist is focused.
document.addEventListener('keydown', function (e) {
  var mod = e.ctrlKey || e.metaKey;
  if (e.altKey && !mod && (e.key === '1' || e.key === '2' || e.key === '3')) {
    e.preventDefault();
    setView(e.key === '1' ? 'split' : e.key === '2' ? 'edit' : 'preview');
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

editor.addEventListener('input', scheduleRender);

clearBtn.addEventListener('click', function () {
  editor.value = '';
  renderNow();
  editor.focus();
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

// Apply a Markdown string pushed from the context menu.
var pendingApplied = false;

function applyPending(pending) {
  if (!pending) return;
  pendingApplied = true;
  editor.value = pending;
  setInputMode('md');
  setView('preview');
  status.textContent = 'From selection';
}

function applyPendingHtml(html) {
  if (!html) return;
  pendingApplied = true;
  editor.value = html;
  setInputMode('html');
  setView('split');
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
// takes precedence over the restored view/mode.
loadConfig(function () {
  applyConfig();
  if (!pendingApplied) {
    setView(config.view || 'split', true);
    setInputMode(config.inputMode || 'md', true);
  }
  renderNow();
});
