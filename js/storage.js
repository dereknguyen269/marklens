// storage.js — shared chrome.storage helpers for mdPreviewConfig.
// Single bridge between the options page, popup, side panel, and floating preview.
(function () {
  'use strict';

  globalThis.mdStorage = {
    KEY: 'mdPreviewConfig',

    load: function (defaults, cb) {
      try {
        chrome.storage.local.get([this.KEY], function (res) {
          var stored = (res && res[globalThis.mdStorage.KEY]) || {};
          cb(Object.assign({}, defaults, stored));
        });
      } catch (e) {
        cb(Object.assign({}, defaults));
      }
    },

    save: function (config) {
      try {
        chrome.storage.local.set({ [this.KEY]: config });
      } catch (e) {}
    }
  };
})();
