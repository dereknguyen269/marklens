// storage.js — shared chrome.storage helpers for mdPreviewConfig.
// Single bridge between the options page, popup, side panel, and floating preview.
(function () {
  'use strict';

  globalThis.mdStorage = {
    KEY: 'mdPreviewConfig',

    // First run (no saved theme) follows the OS light/dark preference.
    merge: function (defaults, stored) {
      var cfg = Object.assign({}, defaults, stored);
      try {
        if (!stored.theme && globalThis.matchMedia && globalThis.matchMedia('(prefers-color-scheme: dark)').matches) {
          cfg.theme = 'dark';
        }
      } catch (e) {}
      return cfg;
    },

    load: function (defaults, cb) {
      try {
        chrome.storage.local.get([this.KEY], function (res) {
          var stored = (res && res[globalThis.mdStorage.KEY]) || {};
          cb(globalThis.mdStorage.merge(defaults, stored));
        });
      } catch (e) {
        cb(globalThis.mdStorage.merge(defaults, {}));
      }
    },

    save: function (config) {
      try {
        chrome.storage.local.set({ [this.KEY]: config });
      } catch (e) {}
    }
  };
})();
