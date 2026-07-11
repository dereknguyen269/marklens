// marked-deflist.umd.js — GFM-style definition list extension for marked.
// Syntax: a term line followed by one or more ": definition" lines.
// MIT. Vendored (no CDN — MV3 CSP forbids remote scripts).
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.markedDeflist = {}));
})(this, (function (exports) {
  'use strict';

  function markedDeflist() {
    return {
      extensions: [{
        name: 'deflist',
        level: 'block',
        start: function (src) {
          var m = src.match(/^[^:\n].*\n:(?: |$)/m);
          return m ? m.index : undefined;
        },
        tokenizer: function (src, tokens) {
          var lines = src.split('\n');
          var i = 0;
          if (!lines[i] || lines[i].charAt(0) === ':' || lines[i].trim() === '') return;
          if (!lines[i + 1] || !/^:( |$)/.test(lines[i + 1])) return;
          var term = lines[i];
          i += 1;
          var defs = [];
          while (i < lines.length && /^:( |$)/.test(lines[i])) {
            defs.push(lines[i].replace(/^:( |$)/, ''));
            i++;
          }
          var raw = lines.slice(0, i).join('\n') + '\n';
          var lexer = this.lexer;
          return {
            type: 'deflist',
            raw: raw,
            term: lexer.inlineTokens(term),
            defs: defs.map(function (d) { return lexer.inlineTokens(d); })
          };
        },
        renderer: function (token) {
          var html = '<dl><dt>' + this.parser.parseInline(token.term) + '</dt>';
          for (var k = 0; k < token.defs.length; k++) {
            html += '<dd>' + this.parser.parseInline(token.defs[k]) + '</dd>';
          }
          return html + '</dl>\n';
        }
      }]
    };
  }

  exports.markedDeflist = markedDeflist;
}));
