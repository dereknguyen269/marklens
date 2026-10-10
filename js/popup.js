var DEFAULTS = { mode: 'popup' };

var modeSelect = document.getElementById('popup-mode-select');

// Version is injected at runtime so manifest/popup/options can't drift.
try {
  var manifestVersion = (chrome.runtime.getManifest() || {}).version;
  var versionEl = document.getElementById('popup-version');
  if (versionEl && manifestVersion) versionEl.textContent = 'v' + manifestVersion;
} catch (e) {}

globalThis.mdStorage.load(DEFAULTS, function (cfg) {
  if (modeSelect) modeSelect.value = cfg.mode || 'popup';
});

modeSelect.addEventListener('change', function () {
  globalThis.mdStorage.load(DEFAULTS, function (cfg) {
    cfg.mode = modeSelect.value;
    globalThis.mdStorage.save(cfg);
  });
});

document.getElementById('popup-open-tab').addEventListener('click', function () {
  chrome.tabs.create({ url: chrome.runtime.getURL('sidepanel.html') });
  window.close();
});

document.getElementById('popup-open-sidepanel').addEventListener('click', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0] && chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open({ tabId: tabs[0].id }).catch(function () {});
    }
    window.close();
  });
});

document.getElementById('popup-settings').addEventListener('click', function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  }
  window.close();
});

document.getElementById('popup-about').addEventListener('click', function () {
  chrome.tabs.create({ url: chrome.runtime.getURL('options.html#about') });
  window.close();
});

// Arrow-key navigation across menu items (Up/Down/Home/End).
var menuItems = Array.prototype.slice.call(document.querySelectorAll('.popup-item'));
var popupMenu = document.querySelector('.popup-menu');
if (popupMenu) {
  popupMenu.addEventListener('keydown', function (e) {
    var i = menuItems.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      menuItems[(i + 1) % menuItems.length].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      menuItems[(i - 1 + menuItems.length) % menuItems.length].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      menuItems[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      menuItems[menuItems.length - 1].focus();
    }
  });
}
