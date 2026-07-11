// sidepanel.js — wire up the editor, live preview, view toggle, and pending selection

window.addEventListener('error', function (e) {
  const status = document.getElementById('status');
  const preview = document.getElementById('preview');
  if (status) { status.textContent = 'Error'; status.classList.add('error'); }
  if (preview) {
    preview.innerHTML = '<pre style="color:#c00;white-space:pre-wrap">' +
      String(e.message || e.error || e) + '</pre>';
  }
  console.error('[MD] side panel error:', e.message, e.error);
});

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const workspace = document.getElementById('workspace');
const status = document.getElementById('status');
const copyBtn = document.getElementById('copy-btn');

// GFM + breaks so single newlines render as <br>; enable plugins.
if (globalThis.marked && typeof globalThis.marked.setOptions === 'function') {
  globalThis.marked.setOptions({ gfm: true, breaks: true });
  if (globalThis.markedFootnote) globalThis.marked.use(globalThis.markedFootnote());
  if (globalThis.markedDeflist) globalThis.marked.use(globalThis.markedDeflist.markedDeflist());
  if (globalThis.markedExtras) globalThis.marked.use(globalThis.markedExtras.markedExtras());
  if (globalThis.markedEmoji && globalThis.EMOJI_SHORTCODES) {
    const me = globalThis.markedEmoji.markedEmoji || globalThis.markedEmoji;
    globalThis.marked.use(me({ emojis: globalThis.EMOJI_SHORTCODES, renderer: function (t) { return t.emoji; } }));
  }
  if (globalThis.hljs && globalThis.markedHighlight) {
    const mh = globalThis.markedHighlight.markedHighlight || globalThis.markedHighlight;
    globalThis.marked.use(mh({
      langPrefix: 'hljs language-',
      highlight: function (code, lang) {
        const L = globalThis.hljs;
        if (lang && L.getLanguage(lang)) { try { return L.highlight(code, { language: lang }).value; } catch (e) {} }
        return L.highlightAuto(code).value;
      }
    }));
  }
}

function renderNow() {
  const md = editor ? editor.value : '';
  if (!globalThis.marked || typeof globalThis.marked.parse !== 'function') {
    if (status) { status.textContent = 'Renderer missing'; status.classList.add('error'); }
    if (preview) preview.innerHTML = '<p style="color:#c00">marked not loaded — reload the extension.</p>';
    console.error('[MD] marked missing on side panel');
    return;
  }
  try {
    preview.innerHTML = globalThis.marked.parse(md);
    if (status) { status.textContent = 'Live'; status.classList.remove('error'); }
  } catch (e) {
    if (status) { status.textContent = 'Render error'; status.classList.add('error'); }
    if (preview) preview.innerHTML = '<pre style="color:#c00;white-space:pre-wrap">' + String(e && e.stack ? e.stack : e) + '</pre>';
    console.error('[MD] render error:', e);
  }
}

function setView(view) {
  workspace.className = 'view-' + view;
  document.querySelectorAll('.tab').forEach(function (t) {
    t.classList.toggle('active', t.dataset.view === view);
  });
}

document.querySelectorAll('.tab').forEach(function (t) {
  t.addEventListener('click', function () {
    setView(t.dataset.view);
  });
});

editor.addEventListener('input', renderNow);

copyBtn.addEventListener('click', function () {
  const html = preview.innerHTML;
  var done = function () {
    var old = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(function () { copyBtn.textContent = old; }, 1200);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(html).then(done, done);
  } else {
    var ta = document.createElement('textarea');
    ta.value = html; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    ta.remove();
  }
});

// Apply a Markdown string pushed from the context menu.
function applyPending(pending) {
  if (!pending) return;
  editor.value = pending;
  renderNow();
  setView('preview');
  status.textContent = 'From selection';
}

function clearPending() {
  chrome.storage.session.remove('pendingMarkdown');
}

// First load: read any pending selection.
chrome.storage.session.get('pendingMarkdown', function (res) {
  if (res && res.pendingMarkdown) {
    applyPending(res.pendingMarkdown);
    clearPending();
  }
});

// Already-open panel: react when a new selection arrives via context menu.
chrome.storage.onChanged.addListener(function (changes, area) {
  if (area !== 'session') return;
  if (changes.pendingMarkdown && changes.pendingMarkdown.newValue) {
    applyPending(changes.pendingMarkdown.newValue);
    clearPending();
  }
});

renderNow();
