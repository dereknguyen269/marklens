// setupMarked.js — configure globalThis.marked with GFM + all plugins (once).
// Loaded after marked.min.js and its plugins. Safe to call repeatedly.
(function () {
  'use strict';

  var configured = false;

  globalThis.setupMarked = function setupMarked() {
    if (configured) return;
    var md = globalThis.marked;
    if (!md || typeof md.setOptions !== 'function') return;

    md.setOptions({ gfm: true, breaks: true });

    if (globalThis.markedFootnote) md.use(globalThis.markedFootnote());
    if (globalThis.markedDeflist) md.use(globalThis.markedDeflist.markedDeflist());
    if (globalThis.markedExtras) md.use(globalThis.markedExtras.markedExtras());

    if (globalThis.markedEmoji && globalThis.EMOJI_SHORTCODES) {
      var me = globalThis.markedEmoji.markedEmoji || globalThis.markedEmoji;
      md.use(me({ emojis: globalThis.EMOJI_SHORTCODES, renderer: function (t) { return t.emoji; } }));
    }

    if (globalThis.hljs && globalThis.markedHighlight) {
      var mh = globalThis.markedHighlight.markedHighlight || globalThis.markedHighlight;
      md.use(mh({
        langPrefix: 'hljs language-',
        highlight: function (code, lang) {
          var L = globalThis.hljs;
          if (lang && L.getLanguage(lang)) { try { return L.highlight(code, { language: lang }).value; } catch (e) {} }
          return L.highlightAuto(code).value;
        }
      }));
    }

    configured = true;
  };
})();
