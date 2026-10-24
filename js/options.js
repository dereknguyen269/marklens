const DEFAULTS = {
  fontSize: 14,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  theme: 'light', mode: 'popup'
};

const modeEl = document.getElementById('opt-mode');
const themeEl = document.getElementById('opt-theme');
const fontSizeEl = document.getElementById('opt-fontsize');
const fontFamilyEl = document.getElementById('opt-fontfamily');
const ghTokenEl = document.getElementById('opt-gh-token');
const bbUserEl = document.getElementById('opt-bb-user');
const bbTokenEl = document.getElementById('opt-bb-token');
const saveBtn = document.getElementById('opt-save');
const statusEl = document.getElementById('opt-status');

// Tokens live under a separate key so DEFAULTS/mdPreviewConfig stays common
// to content.js / sidepanel.js / popup.js. Optional — public PRs need none.
function loadTokens() {
  chrome.storage.local.get(['mdApiTokens'], function (res) {
    var t = (res && res.mdApiTokens) || {};
    ghTokenEl.value = t.githubToken || '';
    bbUserEl.value = t.bbUsername || '';
    bbTokenEl.value = t.bbAppPassword || '';
  });
}

function saveTokens() {
  chrome.storage.local.set({
    mdApiTokens: {
      githubToken: ghTokenEl.value.trim(),
      bbUsername: bbUserEl.value.trim(),
      bbAppPassword: bbTokenEl.value.trim()
    }
  });
}

function loadSettings() {
  globalThis.mdStorage.load(DEFAULTS, function (cfg) {
    modeEl.value = cfg.mode;
    themeEl.value = cfg.theme;
    fontSizeEl.value = String(cfg.fontSize);
    fontFamilyEl.value = cfg.fontFamily;
  });
  loadTokens();
}

function saveSettings(manual) {
  var cfg = {
    mode: modeEl.value,
    theme: themeEl.value,
    fontSize: parseInt(fontSizeEl.value, 10) || DEFAULTS.fontSize,
    fontFamily: fontFamilyEl.value
  };
  globalThis.mdStorage.save(cfg);
  saveTokens();
  statusEl.textContent = manual === false ? 'Saved ✓' : 'Saved!';
  setTimeout(function () { statusEl.textContent = ''; }, 2000);
}

saveBtn.addEventListener('click', function () { saveSettings(true); });

// Autosave on change so edits can't be lost; the Save button stays as an
// explicit confirmation for users who expect one. Token fields autosave on
// change only — attaching change + blur double-fires a write on every
// tab-out (change already fires when a modified field loses focus, and the
// Save button writes tokens itself).
[modeEl, themeEl, fontSizeEl, fontFamilyEl].forEach(function (el) {
  if (el) el.addEventListener('change', function () { saveSettings(false); });
});
[ghTokenEl, bbUserEl, bbTokenEl].forEach(function (el) {
  if (el) {
    el.addEventListener('change', saveTokens);
  }
});

// Version is injected at runtime so manifest/popup/options can't drift.
try {
  var manifestVersion = (chrome.runtime.getManifest() || {}).version;
  var versionEl = document.getElementById('opt-version');
  if (versionEl && manifestVersion) {
    versionEl.textContent = 'MarkLens — Instant Markdown Renderer & Page Converter — v' + manifestVersion;
  }
} catch (e) {}

var openEditorBtn = document.getElementById('opt-open-editor');
if (openEditorBtn) {
  openEditorBtn.addEventListener('click', function () {
    // Redirect the current tab to the editor instead of opening a new tab.
    location.href = chrome.runtime.getURL('sidepanel.html');
  });
}

function activateOptTab(name, updateHash) {
  var valid = ['home', 'settings', 'about'];
  if (valid.indexOf(name) === -1) name = 'home';
  document.querySelectorAll('.opt-tab').forEach(function (x) {
    var active = x.dataset.tab === name;
    x.classList.toggle('active', active);
    x.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  document.querySelectorAll('.opt-section').forEach(function (s) { s.classList.remove('active'); });
  document.getElementById('opt-' + name).classList.add('active');
  if (updateHash && location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
}

document.querySelectorAll('.opt-tab').forEach(function (t) {
  t.addEventListener('click', function () {
    activateOptTab(t.dataset.tab, true);
  });
});

// Arrow-key navigation across tabs.
document.querySelector('.view-toggle').addEventListener('keydown', function (e) {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  e.preventDefault();
  var order = ['home', 'settings', 'about'];
  var active = document.querySelector('.opt-tab.active');
  var cur = order.indexOf(active ? active.dataset.tab : 'home');
  var next = (cur + (e.key === 'ArrowRight' ? 1 : order.length - 1)) % order.length;
  activateOptTab(order[next], true);
  document.querySelector('.opt-tab[data-tab="' + order[next] + '"]').focus();
});

window.addEventListener('hashchange', function () {
  activateOptTab(location.hash.replace('#', ''), false);
});

// Deep-link: #home / #settings / #about (default: home).
activateOptTab(location.hash.replace('#', ''), false);

loadSettings();
