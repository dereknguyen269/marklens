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

  // reflowFlattenedTable — rebuild GFM table row breaks lost in transit.
  // Chrome's contextMenus info.selectionText replaces line breaks with
  // spaces (crbug 40740672), so a selected table can arrive as one line:
  //   | A | B | | --- | --- | | c | d |
  // which marked (correctly per GFM) renders as a paragraph. When a line
  // holds a multi-column delimiter row plus its header/body cells on the
  // same line, split it back into rows. Lines that already parse as tables,
  // single-column pipes, or ambiguous trailing pipes are left untouched.
  // Callers only adopt the reflowed source when it parses to MORE <table>s
  // than the original, so normal text can never change rendering.
  globalThis.reflowFlattenedTable = function reflowFlattenedTable(text) {
    if (!text || text.indexOf('|') === -1 || text.indexOf('-') === -1) return text;
    var lines = String(text).split('\n');
    var changed = false;
    for (var i = 0; i < lines.length; i++) {
      var fixed = reflowTableLine(lines[i]);
      if (fixed !== lines[i]) { lines[i] = fixed; changed = true; }
    }
    return changed ? lines.join('\n') : text;
  };

  function reflowTableLine(line) {
    var body = line.length && line.charCodeAt(line.length - 1) === 13 ? line.slice(0, -1) : line;
    var d = /\|[ \t]*:?-{3,}:?[ \t]*(\|[ \t]*:?-{3,}:?[ \t]*)+\|/.exec(body);
    if (!d) return line;
    var n = (d[0].match(/-{3,}/g) || []).length;
    if (n < 2) return line;
    var before = body.slice(0, d.index);
    var after = body.slice(d.index + d[0].length);
    // Header = trailing run of exactly n pipe-cells in `before`.
    var hm = new RegExp('((?:\\|[^|]*){' + n + '}\\|)[ \\t]*$').exec(before);
    if (!hm) return line;
    var prose = before.slice(0, before.length - hm[0].length);
    if (prose.indexOf('|') !== -1) return line;
    // Body = consecutive n-cell rows; anything else with pipes bails out.
    var rows = [];
    var rest = after;
    var rowRe = new RegExp('^[ \\t]*((?:\\|[^|]*){' + n + '}\\|)');
    var rm;
    while ((rm = rowRe.exec(rest)) !== null) {
      rows.push(rm[1]);
      rest = rest.slice(rm[0].length);
      if (rows.length > 500) return line;
    }
    if (!rows.length) return line;
    if (rest.indexOf('|') !== -1) return line;
    var out = '';
    var head = prose.replace(/[ \t]+$/, '');
    if (head) out += head + '\n\n';
    out += hm[1] + '\n' + d[0] + '\n' + rows.join('\n');
    var tail = rest.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
    if (tail) out += '\n\n' + tail;
    return out;
  }
})();
