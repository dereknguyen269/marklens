// content.js — injected floating Markdown preview (runs in page context)
(function () {
  'use strict';

  const NS = 'md-live-preview';
  if (document.getElementById(NS + '-box')) {
    // Already open — re-register the message listener so a new selection
    // re-renders into the existing box.
    var existingBox = document.getElementById(NS + '-box');
    var existingBody = existingBox.querySelector('#' + NS + '-body');
    if (chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(function (msg) {
        if (msg && msg.action === 'renderMarkdown') {
          if (msg.text && existingBody) {
            try { existingBody.innerHTML = (globalThis.marked || {}).parse(msg.text); }
            catch (e) { existingBody.innerHTML = '<pre style="color:#c00">' + e + '</pre>'; }
          }
          if (msg.mode) {
            existingBox.classList.toggle(NS + '-sidebar', msg.mode === 'sidebar');
            if (msg.mode === 'sidebar' && existingBox._enableLivePreview) existingBox._enableLivePreview();
            if (msg.mode !== 'sidebar' && existingBox._disableLivePreview) existingBox._disableLivePreview();
          }
          existingBox.style.display = 'flex';
        }
      });
    }
    return;
  }

  var DEFAULTS = {
    width: 380, height: 360, fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    theme: 'light', mode: 'popup'
  };
  var config = {};

  function loadConfig(cb) {
    try {
      chrome.storage.local.get(['mdPreviewConfig'], function (res) {
        config = Object.assign({}, DEFAULTS, res && res.mdPreviewConfig || {});
        cb();
      });
    } catch (e) {
      config = Object.assign({}, DEFAULTS);
      cb();
    }
  }
  function saveConfig() {
    try { chrome.storage.local.set({ mdPreviewConfig: config }); } catch (e) {}
  }

  var LIGHT_HL = chrome.runtime.getURL('highlight.css');
  var DARK_HL = chrome.runtime.getURL('highlight-dark.css');

  // Each theme sets CSS custom properties on the popup root + picks a hljs CSS.
  var THEMES = {
    light: {
      label: 'Light', hljs: 'light',
      vars: {
        '--md-bg': 'rgba(255,255,255,0.85)', '--md-text': '#1d1d1f', '--md-border': 'rgba(0,0,0,0.1)',
        '--md-shadow': '0 0 0 .5px rgba(0,0,0,.1), 0 12px 40px rgba(0,0,0,0.18)',
        '--md-bar-bg': 'rgba(245,245,247,0.7)', '--md-bar-text': '#1d1d1f',
        '--md-bar-btn-bg': 'rgba(0,0,0,0.08)', '--md-bar-btn-hover': 'rgba(0,0,0,0.15)',
        '--md-tools-bg': 'transparent', '--md-tools-border': 'rgba(0,0,0,0.08)',
        '--md-label': 'rgba(0,0,0,0.45)',
        '--md-select-bg': 'rgba(0,0,0,0.06)', '--md-select-text': '#1d1d1f', '--md-select-border': 'rgba(0,0,0,0.1)',
        '--md-select-hover': '#007aff',
        '--md-divider': 'rgba(0,0,0,0.1)',
        '--md-copy-bg': 'rgba(0,0,0,0.06)', '--md-copy-text': '#007aff', '--md-copy-border': 'rgba(0,0,0,0.1)',
        '--md-copy-hover-bg': '#007aff', '--md-copy-hover-text': '#fff',
        '--md-link': '#007aff',
        '--md-code-bg': '#f5f5f7', '--md-code-text': '#1d1d1f', '--md-pre-bg': '#f5f5f7',
        '--md-quote-border': '#007aff', '--md-quote-color': 'rgba(0,0,0,0.5)',
        '--md-hr': 'rgba(0,0,0,0.1)', '--md-h-border': 'rgba(0,0,0,0.1)',
        '--md-th-bg': '#f5f5f7', '--md-td-border': 'rgba(0,0,0,0.1)',
        '--md-del': 'rgba(0,0,0,0.4)',
        '--md-footnote-color': 'rgba(0,0,0,0.5)', '--md-footnote-border': 'rgba(0,0,0,0.1)',
        '--md-mark-bg': '#fff3b0',
        '--md-resize': 'rgba(0,0,0,0.15)'
      }
    },
    dark: {
      label: 'Dark', hljs: 'dark',
      vars: {
        '--md-bg': '#1e1e2e', '--md-text': '#cdd6f4', '--md-border': '#313244',
        '--md-shadow': '0 12px 40px rgba(0,0,0,0.5)',
        '--md-bar-bg': '#181825', '--md-bar-text': '#cdd6f4',
        '--md-bar-btn-bg': 'rgba(255,255,255,0.1)', '--md-bar-btn-hover': 'rgba(255,255,255,0.2)',
        '--md-tools-bg': '#181825', '--md-tools-border': '#313244',
        '--md-label': '#9399b2',
        '--md-select-bg': '#313244', '--md-select-text': '#cdd6f4', '--md-select-border': '#45475a',
        '--md-select-hover': '#89b4fa',
        '--md-divider': '#313244',
        '--md-copy-bg': '#313244', '--md-copy-text': '#89b4fa', '--md-copy-border': '#45475a',
        '--md-copy-hover-bg': '#89b4fa', '--md-copy-hover-text': '#1e1e2e',
        '--md-link': '#89b4fa',
        '--md-code-bg': '#313244', '--md-code-text': '#cdd6f4', '--md-pre-bg': '#181825',
        '--md-quote-border': '#89b4fa', '--md-quote-color': '#7f849c',
        '--md-hr': '#313244', '--md-h-border': '#313244',
        '--md-th-bg': '#313244', '--md-td-border': '#45475a',
        '--md-del': '#7f849c',
        '--md-footnote-color': '#7f849c', '--md-footnote-border': '#313244',
        '--md-mark-bg': '#7287fd',
        '--md-resize': '#45475a'
      }
    },
    sepia: {
      label: 'Sepia', hljs: 'light',
      vars: {
        '--md-bg': '#f4ecd8', '--md-text': '#5b4636', '--md-border': '#d4c5a0',
        '--md-shadow': '0 12px 40px rgba(91,70,54,0.2)',
        '--md-bar-bg': '#8b6f47', '--md-bar-text': '#f4ecd8',
        '--md-bar-btn-bg': 'rgba(244,236,216,0.2)', '--md-bar-btn-hover': 'rgba(244,236,216,0.35)',
        '--md-tools-bg': '#efe6cf', '--md-tools-border': '#d4c5a0',
        '--md-label': '#8b6f47',
        '--md-select-bg': '#f9f3e3', '--md-select-text': '#5b4636', '--md-select-border': '#d4c5a0',
        '--md-select-hover': '#8b6f47',
        '--md-divider': '#d4c5a0',
        '--md-copy-bg': '#f9f3e3', '--md-copy-text': '#8b6f47', '--md-copy-border': '#d4c5a0',
        '--md-copy-hover-bg': '#8b6f47', '--md-copy-hover-text': '#f4ecd8',
        '--md-link': '#8b6f47',
        '--md-code-bg': '#e8dcc0', '--md-code-text': '#5b4636', '--md-pre-bg': '#e8dcc0',
        '--md-quote-border': '#8b6f47', '--md-quote-color': '#7a6450',
        '--md-hr': '#d4c5a0', '--md-h-border': '#d4c5a0',
        '--md-th-bg': '#e8dcc0', '--md-td-border': '#d4c5a0',
        '--md-del': '#7a6450',
        '--md-footnote-color': '#7a6450', '--md-footnote-border': '#d4c5a0',
        '--md-mark-bg': '#f0d878',
        '--md-resize': '#b8a578'
      }
    },
    nord: {
      label: 'Nord', hljs: 'dark',
      vars: {
        '--md-bg': '#2e3440', '--md-text': '#d8dee9', '--md-border': '#3b4252',
        '--md-shadow': '0 12px 40px rgba(0,0,0,0.4)',
        '--md-bar-bg': '#3b4252', '--md-bar-text': '#eceff4',
        '--md-bar-btn-bg': 'rgba(236,239,244,0.1)', '--md-bar-btn-hover': 'rgba(236,239,244,0.2)',
        '--md-tools-bg': '#3b4252', '--md-tools-border': '#434c5e',
        '--md-label': '#81a1c1',
        '--md-select-bg': '#434c5e', '--md-select-text': '#d8dee9', '--md-select-border': '#4c566a',
        '--md-select-hover': '#88c0d0',
        '--md-divider': '#434c5e',
        '--md-copy-bg': '#434c5e', '--md-copy-text': '#88c0d0', '--md-copy-border': '#4c566a',
        '--md-copy-hover-bg': '#88c0d0', '--md-copy-hover-text': '#2e3440',
        '--md-link': '#88c0d0',
        '--md-code-bg': '#434c5e', '--md-code-text': '#d8dee9', '--md-pre-bg': '#3b4252',
        '--md-quote-border': '#88c0d0', '--md-quote-color': '#7b8a9e',
        '--md-hr': '#434c5e', '--md-h-border': '#434c5e',
        '--md-th-bg': '#434c5e', '--md-td-border': '#4c566a',
        '--md-del': '#7b8a9e',
        '--md-footnote-color': '#7b8a9e', '--md-footnote-border': '#434c5e',
        '--md-mark-bg': '#5e81ac',
        '--md-resize': '#4c566a'
      }
    },
    dracula: {
      label: 'Dracula', hljs: 'dark',
      vars: {
        '--md-bg': '#282a36', '--md-text': '#f8f8f2', '--md-border': '#44475a',
        '--md-shadow': '0 12px 40px rgba(0,0,0,0.5)',
        '--md-bar-bg': '#21222c', '--md-bar-text': '#f8f8f2',
        '--md-bar-btn-bg': 'rgba(248,248,242,0.1)', '--md-bar-btn-hover': 'rgba(248,248,242,0.2)',
        '--md-tools-bg': '#21222c', '--md-tools-border': '#44475a',
        '--md-label': '#bd93f9',
        '--md-select-bg': '#44475a', '--md-select-text': '#f8f8f2', '--md-select-border': '#6272a4',
        '--md-select-hover': '#bd93f9',
        '--md-divider': '#44475a',
        '--md-copy-bg': '#44475a', '--md-copy-text': '#bd93f9', '--md-copy-border': '#6272a4',
        '--md-copy-hover-bg': '#bd93f9', '--md-copy-hover-text': '#282a36',
        '--md-link': '#ff79c6',
        '--md-code-bg': '#44475a', '--md-code-text': '#f8f8f2', '--md-pre-bg': '#21222c',
        '--md-quote-border': '#bd93f9', '--md-quote-color': '#6272a4',
        '--md-hr': '#44475a', '--md-h-border': '#44475a',
        '--md-th-bg': '#44475a', '--md-td-border': '#6272a4',
        '--md-del': '#6272a4',
        '--md-footnote-color': '#6272a4', '--md-footnote-border': '#44475a',
        '--md-mark-bg': '#50fa7b',
        '--md-resize': '#6272a4'
      }
    },
    github: {
      label: 'GitHub Dark', hljs: 'dark',
      vars: {
        '--md-bg': '#0d1117', '--md-text': '#c9d1d9', '--md-border': '#30363d',
        '--md-shadow': '0 12px 40px rgba(0,0,0,0.5)',
        '--md-bar-bg': '#161b22', '--md-bar-text': '#c9d1d9',
        '--md-bar-btn-bg': 'rgba(201,209,217,0.1)', '--md-bar-btn-hover': 'rgba(201,209,217,0.2)',
        '--md-tools-bg': '#161b22', '--md-tools-border': '#30363d',
        '--md-label': '#8b949e',
        '--md-select-bg': '#21262d', '--md-select-text': '#c9d1d9', '--md-select-border': '#30363d',
        '--md-select-hover': '#58a6ff',
        '--md-divider': '#30363d',
        '--md-copy-bg': '#21262d', '--md-copy-text': '#58a6ff', '--md-copy-border': '#30363d',
        '--md-copy-hover-bg': '#58a6ff', '--md-copy-hover-text': '#0d1117',
        '--md-link': '#58a6ff',
        '--md-code-bg': '#161b22', '--md-code-text': '#c9d1d9', '--md-pre-bg': '#161b22',
        '--md-quote-border': '#58a6ff', '--md-quote-color': '#8b949e',
        '--md-hr': '#30363d', '--md-h-border': '#30363d',
        '--md-th-bg': '#161b22', '--md-td-border': '#30363d',
        '--md-del': '#8b949e',
        '--md-footnote-color': '#8b949e', '--md-footnote-border': '#30363d',
        '--md-mark-bg': '#bb8009',
        '--md-resize': '#484f58'
      }
    },
    solarized_light: {
      label: 'Solarized Light', hljs: 'light',
      vars: {
        '--md-bg': '#fdf6e3', '--md-text': '#657b83', '--md-border': '#eee8d5',
        '--md-shadow': '0 12px 40px rgba(101,123,131,0.15)',
        '--md-bar-bg': '#b58900', '--md-bar-text': '#fdf6e3',
        '--md-bar-btn-bg': 'rgba(253,246,227,0.2)', '--md-bar-btn-hover': 'rgba(253,246,227,0.35)',
        '--md-tools-bg': '#eee8d5', '--md-tools-border': '#e0d8c5',
        '--md-label': '#93a1a1',
        '--md-select-bg': '#f5efe0', '--md-select-text': '#657b83', '--md-select-border': '#d0c8b5',
        '--md-select-hover': '#b58900',
        '--md-divider': '#e0d8c5',
        '--md-copy-bg': '#f5efe0', '--md-copy-text': '#b58900', '--md-copy-border': '#d0c8b5',
        '--md-copy-hover-bg': '#b58900', '--md-copy-hover-text': '#fdf6e3',
        '--md-link': '#b58900',
        '--md-code-bg': '#eee8d5', '--md-code-text': '#657b83', '--md-pre-bg': '#eee8d5',
        '--md-quote-border': '#b58900', '--md-quote-color': '#93a1a1',
        '--md-hr': '#e0d8c5', '--md-h-border': '#e0d8c5',
        '--md-th-bg': '#eee8d5', '--md-td-border': '#d0c8b5',
        '--md-del': '#93a1a1',
        '--md-footnote-color': '#93a1a1', '--md-footnote-border': '#e0d8c5',
        '--md-mark-bg': '#ffe168',
        '--md-resize': '#c0b888'
      }
    },
    solarized_dark: {
      label: 'Solarized Dark', hljs: 'dark',
      vars: {
        '--md-bg': '#002b36', '--md-text': '#93a1a1', '--md-border': '#073642',
        '--md-shadow': '0 12px 40px rgba(0,0,0,0.5)',
        '--md-bar-bg': '#073642', '--md-bar-text': '#93a1a1',
        '--md-bar-btn-bg': 'rgba(147,161,161,0.1)', '--md-bar-btn-hover': 'rgba(147,161,161,0.2)',
        '--md-tools-bg': '#073642', '--md-tools-border': '#0d3b47',
        '--md-label': '#2aa198',
        '--md-select-bg': '#073642', '--md-select-text': '#93a1a1', '--md-select-border': '#1a4b56',
        '--md-select-hover': '#2aa198',
        '--md-divider': '#0d3b47',
        '--md-copy-bg': '#073642', '--md-copy-text': '#2aa198', '--md-copy-border': '#1a4b56',
        '--md-copy-hover-bg': '#2aa198', '--md-copy-hover-text': '#002b36',
        '--md-link': '#2aa198',
        '--md-code-bg': '#073642', '--md-code-text': '#93a1a1', '--md-pre-bg': '#073642',
        '--md-quote-border': '#2aa198', '--md-quote-color': '#657b83',
        '--md-hr': '#0d3b47', '--md-h-border': '#0d3b47',
        '--md-th-bg': '#073642', '--md-td-border': '#1a4b56',
        '--md-del': '#657b83',
        '--md-footnote-color': '#657b83', '--md-footnote-border': '#0d3b47',
        '--md-mark-bg': '#268bd2',
        '--md-resize': '#1a4b56'
      }
    }
  };

  var SELECT_CHEVRON = "%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 4l3 3 3-3' fill='none' stroke='%23888' stroke-width='1.5'/%3E%3C/svg%3E";

  const box = document.createElement('div');
  box.id = NS + '-box';
  box.innerHTML = `
    <style>
      @keyframes ${NS}-in { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }
      #${NS}-box {
        position: fixed !important;
        z-index: 2147483647 !important;
        background: var(--md-bg, #fff) !important;
        color: var(--md-text, #1f2328) !important;
        border: 1px solid var(--md-border, #e3e6ea) !important;
        border-radius: 12px !important;
        box-shadow: var(--md-shadow, 0 0 0 .5px rgba(0,0,0,.1), 0 12px 40px rgba(0,0,0,0.22)) !important;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, sans-serif !important;
        overflow: hidden !important;
        display: flex !important; flex-direction: column !important;
        animation: ${NS}-in .18s cubic-bezier(.16,1,.3,1);
        -webkit-backdrop-filter: saturate(180%) blur(20px);
        backdrop-filter: saturate(180%) blur(20px);
      }
      #${NS}-box.${NS}-sidebar {
        top: 0 !important; right: 0 !important; bottom: 0 !important;
        left: auto !important;
        width: var(--md-sidebar-w, 380px) !important;
        height: 100vh !important; max-height: 100vh !important;
        border-radius: 0 !important;
        border-left: 1px solid var(--md-border, rgba(0,0,0,.1)) !important;
        border-top: none; border-right: none; border-bottom: none;
        box-shadow: -8px 0 24px rgba(0,0,0,0.12) !important;
        animation: ${NS}-slide-in .2s cubic-bezier(.16,1,.3,1);
      }
      @keyframes ${NS}-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
      #${NS}-box.${NS}-sidebar #${NS}-resize {
        right: auto !important; left: 0 !important; top: 0 !important; bottom: 0 !important;
        width: 6px !important; height: 100% !important; cursor: ew-resize !important;
        background: transparent !important;
      }
      #${NS}-box.${NS}-sidebar #${NS}-resize:hover {
        background: var(--md-select-hover, rgba(0,122,255,.2)) !important;
      }
      #${NS}-box.${NS}-sidebar #${NS}-bar {
        cursor: default !important;
      }
      #${NS}-header {
        flex-shrink: 0;
        background: var(--md-bar-bg, #4f46e5) !important;
        color: var(--md-bar-text, #fff) !important;
      }
      #${NS}-bar {
        display: flex !important; align-items: center !important;
        justify-content: space-between !important;
        padding: 10px 14px 6px !important;
        background: transparent !important;
        color: inherit !important;
        font-size: 13px !important; font-weight: 600 !important;
        cursor: move !important; user-select: none !important;
        -webkit-app-region: drag;
      }
      #${NS}-traffic { display:flex; align-items:center; gap:7px; }
      #${NS}-traffic span {
        width: 12px; height: 12px; border-radius: 50%; display:inline-block;
        cursor: pointer; transition: filter .15s;
      }
      #${NS}-traffic span:hover { filter: brightness(1.2); }
      #${NS}-traffic .${NS}-tl-close { background: #ff5f57; }
      #${NS}-traffic .${NS}-tl-min { background: #febc2e; }
      #${NS}-traffic .${NS}-tl-max { background: #28c840; }
      #${NS}-title {
        font-size: 13px; font-weight: 600; opacity: .85;
        flex: 1; text-align: center;
      }
      #${NS}-bar-btns { display:flex; align-items:center; gap:4px; }
      #${NS}-bar-btns button {
        border: none !important; background: transparent !important;
        color: inherit !important; border-radius: 6px !important;
        width: 24px; height: 24px !important; cursor: pointer !important;
        font-size: 15px !important; line-height: 1 !important;
        display:flex; align-items:center; justify-content:center;
        opacity: .7; transition: opacity .15s, background .15s;
      }
      #${NS}-bar-btns button:hover { background: var(--md-bar-btn-bg, rgba(255,255,255,0.15)) !important; opacity: 1; }
      #${NS}-tools {
        display: flex !important; align-items: center !important; flex-wrap: wrap !important;
        gap: 6px 8px !important;
        padding: 6px 14px 8px !important;
        background: transparent !important;
        border-bottom: 1px solid var(--md-tools-border, rgba(0,0,0,.08)) !important;
        font-size: 11px !important;
        color: var(--md-bar-text, #fff) !important;
      }
      #${NS}-tools .${NS}-grp {
        display:flex; align-items:center; gap:5px;
        flex: 1 1 auto; min-width: 0;
      }
      #${NS}-tools .${NS}-grp label {
        color: var(--md-label, rgba(255,255,255,.6)); font-size:10px; font-weight:600;
        line-height:1; text-transform: uppercase; letter-spacing:.04em;
        white-space: nowrap; flex-shrink:0;
      }
      #${NS}-tools select {
        -webkit-appearance:none !important; appearance:none !important;
        border: 1px solid var(--md-select-border, rgba(255,255,255,.2)) !important;
        border-radius: 6px !important;
        padding: 4px 20px 4px 8px !important; font-size: 11px !important;
        line-height: 1.2 !important; height: 24px !important;
        background: var(--md-select-bg, rgba(255,255,255,.12)) url("data:image/svg+xml,${SELECT_CHEVRON}") no-repeat right 6px center !important;
        color: var(--md-select-text, var(--md-bar-text, #fff)) !important; cursor: pointer !important; outline:none !important;
        transition: border-color .15s, background .15s;
        flex: 1 1 auto; min-width: 0; max-width: 100%;
        text-overflow: ellipsis;
      }
      #${NS}-tools select:hover { border-color: var(--md-select-hover, rgba(255,255,255,.35)) !important; }
      #${NS}-tools select:focus { border-color: var(--md-select-hover, rgba(255,255,255,.5)) !important; box-shadow: 0 0 0 2px rgba(0,122,255,.15) !important; }
      #${NS}-tools select option { background: var(--md-bg, #fff) !important; color: var(--md-text, #1f2328) !important; }
      #${NS}-tools .${NS}-divider { width:1px; height:16px; background: var(--md-divider, rgba(255,255,255,.15)); flex-shrink:0; }
      #${NS}-tools .${NS}-spacer { flex: 0 0 auto; width: 4px; }
      #${NS}-copy {
        border: 1px solid var(--md-copy-border, rgba(255,255,255,.2)) !important; border-radius: 6px !important;
        padding: 4px 12px !important; font-size: 11px !important; font-weight:600;
        height: 24px !important; line-height: 1.2 !important;
        background: var(--md-copy-bg, rgba(255,255,255,.12)) !important; color: var(--md-copy-text, var(--md-bar-text, #fff)) !important;
        cursor:pointer !important; outline:none !important; transition: all .15s;
        flex-shrink: 0; white-space: nowrap;
      }
      #${NS}-copy:hover { background: var(--md-copy-hover-bg, rgba(255,255,255,.25)) !important; color: var(--md-copy-hover-text, #fff) !important; border-color: var(--md-copy-hover-bg, rgba(255,255,255,.35)) !important; }
      #${NS}-body {
        padding: 14px 18px !important; overflow: auto !important;
        line-height: 1.65 !important; flex: 1 1 auto !important; min-height: 0 !important;
      }
      #${NS}-body h1,#${NS}-body h2,#${NS}-body h3,#${NS}-body h4,#${NS}-body h5,#${NS}-body h6{
        margin:0.8em 0 0.4em; line-height:1.3; font-weight:600;
      }
      #${NS}-body h1{font-size:1.6em;border-bottom:1px solid var(--md-h-border,#e3e6ea);padding-bottom:.2em;}
      #${NS}-body h2{font-size:1.35em;border-bottom:1px solid var(--md-h-border,#e3e6ea);padding-bottom:.2em;}
      #${NS}-body h3{font-size:1.15em;}
      #${NS}-body p{margin:.5em 0;}
      #${NS}-body a{color:var(--md-link,#4f46e5);text-decoration:none;}
      #${NS}-body a:hover{text-decoration:underline;}
      #${NS}-body code{background:var(--md-code-bg,#f0f2f5);color:var(--md-code-text,#1f2328);padding:.15em .4em;border-radius:4px;font-family:Consolas,Menlo,monospace;font-size:.9em;}
      #${NS}-body pre{background:var(--md-pre-bg,#f0f2f5);padding:12px 14px;border-radius:8px;overflow:auto;}
      #${NS}-body pre code{background:none;padding:0;color:inherit;}
      #${NS}-body pre code.hljs{background:transparent;}
      #${NS}-body .hljs{background:transparent;padding:0;margin:0;}
      #${NS}-body blockquote{margin:.6em 0;padding:.2em 1em;border-left:3px solid var(--md-quote-border,#4f46e5);color:var(--md-quote-color,#656d76);}
      #${NS}-body ul,#${NS}-body ol{padding-left:1.4em;margin:.5em 0;}
      #${NS}-body li{margin:.2em 0;}
      #${NS}-body hr{border:none;border-top:1px solid var(--md-hr,#e3e6ea);margin:1em 0;}
      #${NS}-body img{max-width:100%;border-radius:6px;}
      #${NS}-body del{color:var(--md-del,#656d76);}
      #${NS}-body table{border-collapse:collapse;margin:.6em 0;width:100%;font-size:.95em;}
      #${NS}-body th,#${NS}-body td{border:1px solid var(--md-td-border,#e3e6ea);padding:.4em .7em;text-align:left;}
      #${NS}-body th{background:var(--md-th-bg,#f0f2f5);font-weight:600;}
      #${NS}-body li input[type=checkbox]{margin-right:.4em;}
      #${NS}-body input[type=checkbox]{vertical-align:middle;}
      #${NS}-body .footnotes{margin-top:2em;font-size:.9em;color:var(--md-footnote-color,#656d76);border-top:1px solid var(--md-footnote-border,#e3e6ea);padding-top:.6em;}
      #${NS}-body .footnotes .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;}
      #${NS}-body sup a[data-footnote-ref]{font-size:.75em;vertical-align:super;}
      #${NS}-body dl{margin:.6em 0;padding-left:1em;}
      #${NS}-body dt{font-weight:600;margin-top:.4em;}
      #${NS}-body dd{margin:.2em 0 .2em 1.4em;}
      #${NS}-body mark{background:var(--md-mark-bg,#ffeb3b);padding:.1em .2em;border-radius:3px;}
      #${NS}-body sub,#${NS}-body sup{font-size:.75em;}
      #${NS}-resize {
        position: absolute !important; right: 0 !important; bottom: 0 !important;
        width: 16px !important; height: 16px !important; cursor: nwse-resize !important;
        background: linear-gradient(135deg, transparent 45%, var(--md-resize, rgba(0,0,0,.15)) 48%, transparent 52%, var(--md-resize, rgba(0,0,0,.15)) 60%, transparent 64%) !important;
        z-index: 2 !important;
      }
    </style>
    <link id="${NS}-hl" rel="stylesheet" href="${LIGHT_HL}">
    <div id="${NS}-header">
      <div id="${NS}-bar">
        <div id="${NS}-traffic">
          <span class="${NS}-tl-close" title="Close"></span>
          <span class="${NS}-tl-min" title="Minimize"></span>
          <span class="${NS}-tl-max" title="Zoom"></span>
        </div>
        <span id="${NS}-title">Markdown Preview</span>
        <div id="${NS}-bar-btns">
          <button id="${NS}-mode" title="Toggle sidebar / popup">▮</button>
          <button id="${NS}-close" title="Close (Esc)">×</button>
        </div>
      </div>
      <div id="${NS}-tools">
        <div class="${NS}-grp">
          <label>Theme</label>
          <select id="${NS}-theme" title="Popup theme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="sepia">Sepia</option>
            <option value="nord">Nord</option>
            <option value="dracula">Dracula</option>
            <option value="github">GitHub Dark</option>
            <option value="solarized_light">Solarized Light</option>
            <option value="solarized_dark">Solarized Dark</option>
          </select>
        </div>
        <div class="${NS}-divider"></div>
        <div class="${NS}-grp" style="flex:0 0 auto;">
          <label>Size</label>
          <select id="${NS}-fontsize" title="Font size" style="flex:0 0 50px;">
            <option value="12">12</option><option value="13">13</option>
            <option value="14">14</option><option value="15">15</option>
            <option value="16">16</option><option value="18">18</option>
            <option value="20">20</option>
          </select>
        </div>
        <div class="${NS}-divider"></div>
        <div class="${NS}-grp">
          <label>Font</label>
          <select id="${NS}-fontfamily" title="Font family">
            <option value='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'>System</option>
            <option value='Georgia, "Times New Roman", serif'>Serif</option>
            <option value='"Helvetica Neue", Arial, sans-serif'>Arial</option>
            <option value='"Courier New", Consolas, Menlo, monospace'>Mono</option>
            <option value='"Comic Sans MS", cursive'>Comic</option>
            <option value='Palatino, "Palatino Linotype", serif'>Palatino</option>
          </select>
        </div>
        <span class="${NS}-spacer"></span>
        <button id="${NS}-copy" title="Copy rendered HTML">Copy HTML</button>
      </div>
    </div>
    <div id="${NS}-body"></div>
    <div id="${NS}-resize"></div>
  `;
  document.body.appendChild(box);

  const body = box.querySelector('#' + NS + '-body');
  const closeBtn = box.querySelector('#' + NS + '-close');
  const themeSel = box.querySelector('#' + NS + '-theme');
  const copyBtn = box.querySelector('#' + NS + '-copy');
  const fontSizeSel = box.querySelector('#' + NS + '-fontsize');
  const fontFamilySel = box.querySelector('#' + NS + '-fontfamily');
  const resizeHandle = box.querySelector('#' + NS + '-resize');
  const hlLink = box.querySelector('#' + NS + '-hl');
  const modeBtn = box.querySelector('#' + NS + '-mode');

  // Apply a named theme: set CSS vars on the box + swap highlight.js CSS.
  function applyTheme(name) {
    var t = THEMES[name] || THEMES.light;
    var vars = t.vars;
    for (var k in vars) {
      if (Object.prototype.hasOwnProperty.call(vars, k)) {
        box.style.setProperty(k, vars[k]);
      }
    }
    hlLink.href = t.hljs === 'dark' ? DARK_HL : LIGHT_HL;
    if (themeSel) themeSel.value = name;
  }

  // Apply display mode: popup (floating) or sidebar (docked right).
  function applyMode(mode) {
    var isSidebar = mode === 'sidebar';
    box.classList.toggle(NS + '-sidebar', isSidebar);
    if (modeBtn) {
      modeBtn.textContent = isSidebar ? '▣' : '▮';
      modeBtn.title = isSidebar ? 'Switch to popup' : 'Switch to sidebar';
    }
    if (isSidebar) {
      box.style.setProperty('--md-sidebar-w', config.width + 'px');
      box.style.width = '';
      box.style.height = '';
      box.style.left = '';
      box.style.top = '';
    } else {
      box.style.width = config.width + 'px';
      box.style.height = config.height + 'px';
    }
    if (isSidebar) enableLivePreview(); else disableLivePreview();
  }

  function applyConfig() {
    body.style.fontSize = config.fontSize + 'px';
    body.style.fontFamily = config.fontFamily;
    if (fontSizeSel) fontSizeSel.value = String(config.fontSize);
    if (fontFamilySel) fontFamilySel.value = config.fontFamily;
    applyTheme(config.theme || 'light');
    applyMode(config.mode || 'popup');
  }

  // marked + plugins are injected before this file, so the globals should
  // already be set. GFM + breaks so single newlines render as <br>.
  if (globalThis.marked && typeof globalThis.marked.setOptions === 'function') {
    globalThis.marked.setOptions({ gfm: true, breaks: true });
    if (globalThis.markedFootnote) globalThis.marked.use(globalThis.markedFootnote());
    if (globalThis.markedDeflist) globalThis.marked.use(globalThis.markedDeflist.markedDeflist());
    if (globalThis.markedExtras) globalThis.marked.use(globalThis.markedExtras.markedExtras());
    if (globalThis.markedEmoji && globalThis.EMOJI_SHORTCODES) {
      var me = globalThis.markedEmoji.markedEmoji || globalThis.markedEmoji;
      globalThis.marked.use(me({ emojis: globalThis.EMOJI_SHORTCODES, renderer: function (t) { return t.emoji; } }));
    }
    if (globalThis.hljs && globalThis.markedHighlight) {
      var mh = globalThis.markedHighlight.markedHighlight || globalThis.markedHighlight;
      globalThis.marked.use(mh({
        langPrefix: 'hljs language-',
        highlight: function (code, lang) {
          var L = globalThis.hljs;
          if (lang && L.getLanguage(lang)) { try { return L.highlight(code, { language: lang }).value; } catch (e) {} }
          return L.highlightAuto(code).value;
        }
      }));
    }
  }

  function render(text) {
    renderWhenReady(text, 0);
  }
  function renderWhenReady(text, tries) {
    var md = globalThis.marked;
    if (md && typeof md.parse === 'function') {
      try {
        body.innerHTML = md.parse(text || '');
      } catch (e) {
        body.innerHTML = '<pre style="color:#c00;white-space:pre-wrap">' + String(e && e.stack ? e.stack : e) + '</pre>';
        console.error('[MD] page render error:', e);
      }
      return;
    }
    if (tries < 40) {
      setTimeout(function () { renderWhenReady(text, tries + 1); }, 50);
    } else {
      body.innerHTML = '<p style="color:#c00">marked not loaded.</p>';
      console.error('[MD] marked missing in page after retries');
    }
  }

  function closeBox() { disableLivePreview(); box.remove(); }
  closeBtn.addEventListener('click', closeBox);

  // Mode toggle: popup <-> sidebar.
  modeBtn.addEventListener('click', function () {
    config.mode = config.mode === 'sidebar' ? 'popup' : 'sidebar';
    applyMode(config.mode);
    saveConfig();
  });

  // Traffic-light buttons
  var tlClose = box.querySelector('.' + NS + '-tl-close');
  if (tlClose) tlClose.addEventListener('click', closeBox);

  // Theme selector — apply + persist.
  themeSel.addEventListener('change', function () {
    config.theme = this.value;
    applyTheme(config.theme);
    saveConfig();
  });

  // Copy rendered HTML to clipboard.
  copyBtn.addEventListener('click', function () {
    var html = body.innerHTML;
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

  // Esc to close.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.getElementById(NS + '-box')) {
      closeBox();
    }
  });

  // Font size / family controls — apply immediately and persist.
  fontSizeSel.addEventListener('change', function () {
    config.fontSize = parseInt(this.value, 10) || DEFAULTS.fontSize;
    body.style.fontSize = config.fontSize + 'px';
    saveConfig();
  });
  fontFamilySel.addEventListener('change', function () {
    config.fontFamily = this.value;
    body.style.fontFamily = config.fontFamily;
    saveConfig();
  });

  // Drag-to-move
  const bar = box.querySelector('#' + NS + '-bar');
  let dragging = false, offX = 0, offY = 0;
  bar.addEventListener('mousedown', function (e) {
    if (e.target.closest('#' + NS + '-bar-btns') || e.target.closest('#' + NS + '-traffic')) return;
    if (box.classList.contains(NS + '-sidebar')) return;
    dragging = true;
    const rect = box.getBoundingClientRect();
    offX = e.clientX - rect.left;
    offY = e.clientY - rect.top;
    box.style.right = 'auto';
    box.style.left = rect.left + 'px';
    box.style.top = rect.top + 'px';
  });
  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    box.style.left = (e.clientX - offX) + 'px';
    box.style.top = (e.clientY - offY) + 'px';
  });
  document.addEventListener('mouseup', function () { dragging = false; });

  // Drag-to-resize via the handle. In popup mode: bottom-right corner
  // (width + height). In sidebar mode: left edge (width only).
  let resizing = false, rsx = 0, rsy = 0, rsw = 0, rsh = 0;
  resizeHandle.addEventListener('mousedown', function (e) {
    e.preventDefault();
    e.stopPropagation();
    resizing = true;
    rsx = e.clientX; rsy = e.clientY;
    rsw = box.offsetWidth; rsh = box.offsetHeight;
  });
  document.addEventListener('mousemove', function (e) {
    if (!resizing) return;
    if (box.classList.contains(NS + '-sidebar')) {
      // Sidebar: drag left edge to resize width.
      var nw = Math.max(280, rsw - (e.clientX - rsx));
      box.style.setProperty('--md-sidebar-w', nw + 'px');
    } else {
      // Popup: drag bottom-right corner.
      var nw = Math.max(280, rsw + (e.clientX - rsx));
      var nh = Math.max(160, rsh + (e.clientY - rsy));
      box.style.width = nw + 'px';
      box.style.height = nh + 'px';
    }
  });
  document.addEventListener('mouseup', function () {
    if (resizing) {
      resizing = false;
      config.width = box.offsetWidth;
      if (!box.classList.contains(NS + '-sidebar')) {
        config.height = box.offsetHeight;
      }
      saveConfig();
    }
  });

  // ── Live selection preview (sidebar only) ──
  var livePreviewActive = false;
  var selTimer = null;
  var titleEl = box.querySelector('#' + NS + '-title');

  function onLiveSelectionChange() {
    if (!livePreviewActive) return;
    if (selTimer) clearTimeout(selTimer);
    selTimer = setTimeout(function () {
      var sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      var text = sel.toString();
      if (!text || text.trim().length < 1) return;
      render(text);
    }, 200);
  }

  function enableLivePreview() {
    if (livePreviewActive) return;
    livePreviewActive = true;
    document.addEventListener('selectionchange', onLiveSelectionChange);
    if (titleEl) titleEl.textContent = 'Live Preview: select text on page';
  }

  function disableLivePreview() {
    if (!livePreviewActive) return;
    livePreviewActive = false;
    document.removeEventListener('selectionchange', onLiveSelectionChange);
    if (selTimer) { clearTimeout(selTimer); selTimer = null; }
    if (titleEl) titleEl.textContent = 'Markdown Preview';
  }

  box._enableLivePreview = enableLivePreview;
  box._disableLivePreview = disableLivePreview;

  // Anchor the popup near the selection rect (viewport coords). Falls back to
  // top-right when no rect is available. Clamps so it never overflows.
  // In sidebar mode, the box is CSS-pinned to the right edge — skip positioning.
  function positionBox(rect) {
    if (box.classList.contains(NS + '-sidebar')) return;
    box.style.right = 'auto';
    var w = config.width || 380, h = config.height || 360;
    var vw = window.innerWidth, vh = window.innerHeight;
    var left, top;
    if (rect && typeof rect.left === 'number') {
      left = rect.left + 8;
      if (left + w > vw) left = Math.max(8, rect.right - w);
      top = rect.bottom + 6;
      if (top + h > vh) top = Math.max(8, rect.top - h - 6);
    } else {
      left = vw - w - 16;
      top = 16;
    }
    left = Math.min(left, vw - w - 8);
    left = Math.max(left, 8);
    top = Math.min(top, vh - 40);
    top = Math.max(top, 8);
    box.style.left = left + 'px';
    box.style.top = top + 'px';
  }

  render('');

  // Self-fetch the pending selection written by background.js (no message race).
  function loadPending() {
    try {
      chrome.storage.session.get(['pendingMarkdown'], function (res) {
        const text = res && res.pendingMarkdown;
        if (text) {
          render(text);
          chrome.storage.session.remove('pendingMarkdown');
        }
      });
    } catch (e) {
      console.error('[MD] loadPending failed:', e);
    }
  }

  // Also accept direct messages (belt-and-suspenders).
  if (chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(function (msg) {
      if (msg && msg.action === 'renderMarkdown') {
        if (msg.text) render(msg.text);
        if (msg.mode) {
          config.mode = msg.mode;
          applyMode(config.mode);
          saveConfig();
        }
        positionBox(msg.rect || null);
        box.style.display = 'flex';
      }
    });
  }

  // Boot: load saved config, apply, then fetch any pending selection.
  loadConfig(function () {
    applyConfig();
    loadPending();
  });
})();
