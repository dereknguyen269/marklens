// marked-extras.umd.js — small inline extensions for marked:
//  - heading IDs:  ### Heading {#custom-id}  ->  <h3 id="custom-id">
//  - highlight:    ==text==  ->  <mark>text</mark>
//  - subscript:    H~2~O  ->  H<sub>2</sub>O
//  - superscript:  X^2^  ->  X<sup>2</sup>
// MIT. Vendored (no CDN — MV3 CSP forbids remote scripts).
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.markedExtras = {}));
})(this, (function (exports) {
  'use strict';

  function markedExtras() {
    return {
      // Heading IDs: override the heading renderer to extract {#id} and set
      // the id attribute, auto-generating a slug when no explicit id is given.
      renderer: {
        heading: function (token) {
          var html = this.parser.parseInline(token.tokens || []);
          var level = token.depth;
          var m = html.match(/\s*\{#([^}]+)\}\s*$/);
          var id;
          if (m) {
            id = m[1].trim();
            html = html.replace(/\s*\{#([^}]+)\}\s*$/, '');
          } else {
            id = html.replace(/<[^>]+>/g, '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
          }
          return '<h' + level + ' id="' + id + '">' + html + '</h' + level + '>\n';
        }
      },
      extensions: [
        // Highlight: ==text== -> <mark>text</mark>
        {
          name: 'highlight',
          level: 'inline',
          start: function (src) { var i = src.indexOf('=='); return i; },
          tokenizer: function (src) {
            var m = src.match(/^==(?=\S)(.+?)==/);
            if (m) return { type: 'highlight', raw: m[0], text: m[1], tokens: this.lexer.inlineTokens(m[1]) };
          },
          renderer: function (token) { return '<mark>' + this.parser.parseInline(token.tokens) + '</mark>'; }
        },
        // Subscript: H~2~O -> H<sub>2</sub>O  (but not ~~strikethrough~~)
        {
          name: 'subscript',
          level: 'inline',
          start: function (src) { var i = src.match(/~(?!~)/); return i ? i.index : undefined; },
          tokenizer: function (src) {
            var m = src.match(/^~(?!~)(?=\S)(.+?)~/);
            if (m) return { type: 'subscript', raw: m[0], text: m[1], tokens: this.lexer.inlineTokens(m[1]) };
          },
          renderer: function (token) { return '<sub>' + this.parser.parseInline(token.tokens) + '</sub>'; }
        },
        // Superscript: X^2^ -> X<sup>2</sup>
        {
          name: 'superscript',
          level: 'inline',
          start: function (src) { var i = src.indexOf('^'); return i; },
          tokenizer: function (src) {
            var m = src.match(/^\^(?=\S)(.+?)\^/);
            if (m) return { type: 'superscript', raw: m[0], text: m[1], tokens: this.lexer.inlineTokens(m[1]) };
          },
          renderer: function (token) { return '<sup>' + this.parser.parseInline(token.tokens) + '</sup>'; }
        }
      ]
    };
  }

  exports.markedExtras = markedExtras;
}));
