// themes.js — shared theme palettes (single source of truth).
// MD_THEMES  → floating popup custom properties (--md-*)
// MD_SIDEPANEL_THEMES → side panel / options / popup custom properties (--bg/--surface/...)
// The two UIs intentionally use different accent identities, so each keeps its own token set.
(function () {
  'use strict';

  globalThis.MD_THEMES = {
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
    },
    aurora: {
      label: 'Aurora (Gradient)', hljs: 'dark',
      vars: {
        '--md-bg': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4c1d95 100%)',
        '--md-text': '#ede9fe', '--md-border': 'rgba(255,255,255,0.14)',
        '--md-shadow': '0 12px 40px rgba(30,27,75,0.55)',
        '--md-bar-bg': 'rgba(20,16,60,0.45)', '--md-bar-text': '#ede9fe',
        '--md-bar-btn-bg': 'rgba(255,255,255,0.12)', '--md-bar-btn-hover': 'rgba(255,255,255,0.22)',
        '--md-tools-bg': 'transparent', '--md-tools-border': 'rgba(255,255,255,0.14)',
        '--md-label': 'rgba(237,233,254,0.65)',
        '--md-select-bg': 'rgba(255,255,255,0.12)', '--md-select-text': '#ede9fe', '--md-select-border': 'rgba(255,255,255,0.22)',
        '--md-select-hover': '#c4b5fd',
        '--md-divider': 'rgba(255,255,255,0.18)',
        '--md-copy-bg': 'rgba(255,255,255,0.12)', '--md-copy-text': '#e9d5ff', '--md-copy-border': 'rgba(255,255,255,0.22)',
        '--md-copy-hover-bg': '#a78bfa', '--md-copy-hover-text': '#1e1b4b',
        '--md-link': '#c4b5fd',
        '--md-code-bg': 'rgba(0,0,0,0.28)', '--md-code-text': '#ede9fe', '--md-pre-bg': 'rgba(0,0,0,0.32)',
        '--md-quote-border': '#a78bfa', '--md-quote-color': 'rgba(237,233,254,0.75)',
        '--md-hr': 'rgba(255,255,255,0.16)', '--md-h-border': 'rgba(255,255,255,0.16)',
        '--md-th-bg': 'rgba(0,0,0,0.28)', '--md-td-border': 'rgba(255,255,255,0.16)',
        '--md-del': 'rgba(237,233,254,0.55)',
        '--md-footnote-color': 'rgba(237,233,254,0.6)', '--md-footnote-border': 'rgba(255,255,255,0.16)',
        '--md-mark-bg': '#7c3aed',
        '--md-resize': 'rgba(255,255,255,0.35)'
      }
    },
    sunset: {
      label: 'Sunset (Gradient)', hljs: 'dark',
      vars: {
        '--md-bg': 'linear-gradient(135deg, #7f1d1d 0%, #9d174d 50%, #831843 100%)',
        '--md-text': '#ffe4e6', '--md-border': 'rgba(255,255,255,0.14)',
        '--md-shadow': '0 12px 40px rgba(131,24,67,0.55)',
        '--md-bar-bg': 'rgba(60,10,30,0.45)', '--md-bar-text': '#ffe4e6',
        '--md-bar-btn-bg': 'rgba(255,255,255,0.12)', '--md-bar-btn-hover': 'rgba(255,255,255,0.22)',
        '--md-tools-bg': 'transparent', '--md-tools-border': 'rgba(255,255,255,0.14)',
        '--md-label': 'rgba(255,228,230,0.65)',
        '--md-select-bg': 'rgba(255,255,255,0.12)', '--md-select-text': '#ffe4e6', '--md-select-border': 'rgba(255,255,255,0.22)',
        '--md-select-hover': '#fda4af',
        '--md-divider': 'rgba(255,255,255,0.18)',
        '--md-copy-bg': 'rgba(255,255,255,0.12)', '--md-copy-text': '#fecdd3', '--md-copy-border': 'rgba(255,255,255,0.22)',
        '--md-copy-hover-bg': '#fb7185', '--md-copy-hover-text': '#7f1d1d',
        '--md-link': '#fda4af',
        '--md-code-bg': 'rgba(0,0,0,0.28)', '--md-code-text': '#ffe4e6', '--md-pre-bg': 'rgba(0,0,0,0.32)',
        '--md-quote-border': '#fb7185', '--md-quote-color': 'rgba(255,228,230,0.75)',
        '--md-hr': 'rgba(255,255,255,0.16)', '--md-h-border': 'rgba(255,255,255,0.16)',
        '--md-th-bg': 'rgba(0,0,0,0.28)', '--md-td-border': 'rgba(255,255,255,0.16)',
        '--md-del': 'rgba(255,228,230,0.55)',
        '--md-footnote-color': 'rgba(255,228,230,0.6)', '--md-footnote-border': 'rgba(255,255,255,0.16)',
        '--md-mark-bg': '#e11d48',
        '--md-resize': 'rgba(255,255,255,0.35)'
      }
    },
    ocean: {
      label: 'Ocean (Gradient)', hljs: 'dark',
      vars: {
        '--md-bg': 'linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #155e75 100%)',
        '--md-text': '#e0f2fe', '--md-border': 'rgba(255,255,255,0.14)',
        '--md-shadow': '0 12px 40px rgba(12,74,110,0.55)',
        '--md-bar-bg': 'rgba(6,40,60,0.45)', '--md-bar-text': '#e0f2fe',
        '--md-bar-btn-bg': 'rgba(255,255,255,0.12)', '--md-bar-btn-hover': 'rgba(255,255,255,0.22)',
        '--md-tools-bg': 'transparent', '--md-tools-border': 'rgba(255,255,255,0.14)',
        '--md-label': 'rgba(224,242,254,0.65)',
        '--md-select-bg': 'rgba(255,255,255,0.12)', '--md-select-text': '#e0f2fe', '--md-select-border': 'rgba(255,255,255,0.22)',
        '--md-select-hover': '#7dd3fc',
        '--md-divider': 'rgba(255,255,255,0.18)',
        '--md-copy-bg': 'rgba(255,255,255,0.12)', '--md-copy-text': '#bae6fd', '--md-copy-border': 'rgba(255,255,255,0.22)',
        '--md-copy-hover-bg': '#38bdf8', '--md-copy-hover-text': '#0c4a6e',
        '--md-link': '#7dd3fc',
        '--md-code-bg': 'rgba(0,0,0,0.28)', '--md-code-text': '#e0f2fe', '--md-pre-bg': 'rgba(0,0,0,0.32)',
        '--md-quote-border': '#38bdf8', '--md-quote-color': 'rgba(224,242,254,0.75)',
        '--md-hr': 'rgba(255,255,255,0.16)', '--md-h-border': 'rgba(255,255,255,0.16)',
        '--md-th-bg': 'rgba(0,0,0,0.28)', '--md-td-border': 'rgba(255,255,255,0.16)',
        '--md-del': 'rgba(224,242,254,0.55)',
        '--md-footnote-color': 'rgba(224,242,254,0.6)', '--md-footnote-border': 'rgba(255,255,255,0.16)',
        '--md-mark-bg': '#0284c7',
        '--md-resize': 'rgba(255,255,255,0.35)'
      }
    },
    midnight: {
      label: 'Midnight (Gradient)', hljs: 'dark',
      vars: {
        '--md-bg': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0b1120 100%)',
        '--md-text': '#e2e8f0', '--md-border': 'rgba(255,255,255,0.12)',
        '--md-shadow': '0 12px 40px rgba(2,6,23,0.6)',
        '--md-bar-bg': 'rgba(2,6,23,0.5)', '--md-bar-text': '#e2e8f0',
        '--md-bar-btn-bg': 'rgba(255,255,255,0.1)', '--md-bar-btn-hover': 'rgba(255,255,255,0.2)',
        '--md-tools-bg': 'transparent', '--md-tools-border': 'rgba(255,255,255,0.12)',
        '--md-label': 'rgba(226,232,240,0.6)',
        '--md-select-bg': 'rgba(255,255,255,0.1)', '--md-select-text': '#e2e8f0', '--md-select-border': 'rgba(255,255,255,0.2)',
        '--md-select-hover': '#38bdf8',
        '--md-divider': 'rgba(255,255,255,0.15)',
        '--md-copy-bg': 'rgba(255,255,255,0.1)', '--md-copy-text': '#7dd3fc', '--md-copy-border': 'rgba(255,255,255,0.2)',
        '--md-copy-hover-bg': '#38bdf8', '--md-copy-hover-text': '#0f172a',
        '--md-link': '#7dd3fc',
        '--md-code-bg': 'rgba(0,0,0,0.3)', '--md-code-text': '#e2e8f0', '--md-pre-bg': 'rgba(0,0,0,0.35)',
        '--md-quote-border': '#38bdf8', '--md-quote-color': 'rgba(226,232,240,0.7)',
        '--md-hr': 'rgba(255,255,255,0.14)', '--md-h-border': 'rgba(255,255,255,0.14)',
        '--md-th-bg': 'rgba(0,0,0,0.3)', '--md-td-border': 'rgba(255,255,255,0.14)',
        '--md-del': 'rgba(226,232,240,0.5)',
        '--md-footnote-color': 'rgba(226,232,240,0.6)', '--md-footnote-border': 'rgba(255,255,255,0.14)',
        '--md-mark-bg': '#0ea5e9',
        '--md-resize': 'rgba(255,255,255,0.3)'
      }
    },
    monokai: {
      label: 'Monokai', hljs: 'dark',
      vars: {
        '--md-bg': '#272822', '--md-text': '#f8f8f2', '--md-border': '#49483e',
        '--md-shadow': '0 12px 40px rgba(0,0,0,0.5)',
        '--md-bar-bg': '#1e1f1c', '--md-bar-text': '#f8f8f2',
        '--md-bar-btn-bg': 'rgba(248,248,242,0.1)', '--md-bar-btn-hover': 'rgba(248,248,242,0.2)',
        '--md-tools-bg': '#1e1f1c', '--md-tools-border': '#49483e',
        '--md-label': '#a6e22e',
        '--md-select-bg': '#49483e', '--md-select-text': '#f8f8f2', '--md-select-border': '#75715e',
        '--md-select-hover': '#a6e22e',
        '--md-divider': '#49483e',
        '--md-copy-bg': '#49483e', '--md-copy-text': '#a6e22e', '--md-copy-border': '#75715e',
        '--md-copy-hover-bg': '#a6e22e', '--md-copy-hover-text': '#272822',
        '--md-link': '#66d9ef',
        '--md-code-bg': '#49483e', '--md-code-text': '#f8f8f2', '--md-pre-bg': '#1e1f1c',
        '--md-quote-border': '#a6e22e', '--md-quote-color': '#75715e',
        '--md-hr': '#49483e', '--md-h-border': '#49483e',
        '--md-th-bg': '#49483e', '--md-td-border': '#75715e',
        '--md-del': '#75715e',
        '--md-footnote-color': '#75715e', '--md-footnote-border': '#49483e',
        '--md-mark-bg': '#e6db74',
        '--md-resize': '#75715e'
      }
    },
    onedark: {
      label: 'One Dark', hljs: 'dark',
      vars: {
        '--md-bg': '#282c34', '--md-text': '#abb2bf', '--md-border': '#3e4451',
        '--md-shadow': '0 12px 40px rgba(0,0,0,0.5)',
        '--md-bar-bg': '#21252b', '--md-bar-text': '#abb2bf',
        '--md-bar-btn-bg': 'rgba(171,178,191,0.1)', '--md-bar-btn-hover': 'rgba(171,178,191,0.2)',
        '--md-tools-bg': '#21252b', '--md-tools-border': '#3e4451',
        '--md-label': '#61afef',
        '--md-select-bg': '#3e4451', '--md-select-text': '#abb2bf', '--md-select-border': '#4b5263',
        '--md-select-hover': '#61afef',
        '--md-divider': '#3e4451',
        '--md-copy-bg': '#3e4451', '--md-copy-text': '#61afef', '--md-copy-border': '#4b5263',
        '--md-copy-hover-bg': '#61afef', '--md-copy-hover-text': '#282c34',
        '--md-link': '#61afef',
        '--md-code-bg': '#3e4451', '--md-code-text': '#abb2bf', '--md-pre-bg': '#21252b',
        '--md-quote-border': '#61afef', '--md-quote-color': '#5c6370',
        '--md-hr': '#3e4451', '--md-h-border': '#3e4451',
        '--md-th-bg': '#3e4451', '--md-td-border': '#4b5263',
        '--md-del': '#5c6370',
        '--md-footnote-color': '#5c6370', '--md-footnote-border': '#3e4451',
        '--md-mark-bg': '#e5c07b',
        '--md-resize': '#4b5263'
      }
    },
    gruvbox: {
      label: 'Gruvbox', hljs: 'dark',
      vars: {
        '--md-bg': '#282828', '--md-text': '#ebdbb2', '--md-border': '#504945',
        '--md-shadow': '0 12px 40px rgba(0,0,0,0.5)',
        '--md-bar-bg': '#1d2021', '--md-bar-text': '#ebdbb2',
        '--md-bar-btn-bg': 'rgba(235,219,178,0.1)', '--md-bar-btn-hover': 'rgba(235,219,178,0.2)',
        '--md-tools-bg': '#1d2021', '--md-tools-border': '#504945',
        '--md-label': '#fabd2f',
        '--md-select-bg': '#3c3836', '--md-select-text': '#ebdbb2', '--md-select-border': '#504945',
        '--md-select-hover': '#fabd2f',
        '--md-divider': '#504945',
        '--md-copy-bg': '#3c3836', '--md-copy-text': '#fabd2f', '--md-copy-border': '#504945',
        '--md-copy-hover-bg': '#fabd2f', '--md-copy-hover-text': '#282828',
        '--md-link': '#83a598',
        '--md-code-bg': '#3c3836', '--md-code-text': '#ebdbb2', '--md-pre-bg': '#1d2021',
        '--md-quote-border': '#fabd2f', '--md-quote-color': '#a89984',
        '--md-hr': '#504945', '--md-h-border': '#504945',
        '--md-th-bg': '#3c3836', '--md-td-border': '#504945',
        '--md-del': '#a89984',
        '--md-footnote-color': '#a89984', '--md-footnote-border': '#504945',
        '--md-mark-bg': '#fabd2f',
        '--md-resize': '#665c54'
      }
    },
    tokyo: {
      label: 'Tokyo Night', hljs: 'dark',
      vars: {
        '--md-bg': '#1a1b26', '--md-text': '#c0caf5', '--md-border': '#24283b',
        '--md-shadow': '0 12px 40px rgba(0,0,0,0.5)',
        '--md-bar-bg': '#16161e', '--md-bar-text': '#c0caf5',
        '--md-bar-btn-bg': 'rgba(192,202,245,0.1)', '--md-bar-btn-hover': 'rgba(192,202,245,0.2)',
        '--md-tools-bg': '#16161e', '--md-tools-border': '#24283b',
        '--md-label': '#7aa2f7',
        '--md-select-bg': '#24283b', '--md-select-text': '#c0caf5', '--md-select-border': '#3b4261',
        '--md-select-hover': '#7aa2f7',
        '--md-divider': '#24283b',
        '--md-copy-bg': '#24283b', '--md-copy-text': '#7aa2f7', '--md-copy-border': '#3b4261',
        '--md-copy-hover-bg': '#7aa2f7', '--md-copy-hover-text': '#1a1b26',
        '--md-link': '#7aa2f7',
        '--md-code-bg': '#24283b', '--md-code-text': '#c0caf5', '--md-pre-bg': '#16161e',
        '--md-quote-border': '#7aa2f7', '--md-quote-color': '#565f89',
        '--md-hr': '#24283b', '--md-h-border': '#24283b',
        '--md-th-bg': '#24283b', '--md-td-border': '#3b4261',
        '--md-del': '#565f89',
        '--md-footnote-color': '#565f89', '--md-footnote-border': '#24283b',
        '--md-mark-bg': '#9ece6a',
        '--md-resize': '#3b4261'
      }
    },
    everforest: {
      label: 'Everforest', hljs: 'dark',
      vars: {
        '--md-bg': '#2d353b', '--md-text': '#d3c6aa', '--md-border': '#475258',
        '--md-shadow': '0 12px 40px rgba(0,0,0,0.5)',
        '--md-bar-bg': '#232a2e', '--md-bar-text': '#d3c6aa',
        '--md-bar-btn-bg': 'rgba(211,198,170,0.1)', '--md-bar-btn-hover': 'rgba(211,198,170,0.2)',
        '--md-tools-bg': '#232a2e', '--md-tools-border': '#475258',
        '--md-label': '#a7c080',
        '--md-select-bg': '#3d484d', '--md-select-text': '#d3c6aa', '--md-select-border': '#475258',
        '--md-select-hover': '#a7c080',
        '--md-divider': '#475258',
        '--md-copy-bg': '#3d484d', '--md-copy-text': '#a7c080', '--md-copy-border': '#475258',
        '--md-copy-hover-bg': '#a7c080', '--md-copy-hover-text': '#2d353b',
        '--md-link': '#7fbbb3',
        '--md-code-bg': '#3d484d', '--md-code-text': '#d3c6aa', '--md-pre-bg': '#232a2e',
        '--md-quote-border': '#a7c080', '--md-quote-color': '#859289',
        '--md-hr': '#475258', '--md-h-border': '#475258',
        '--md-th-bg': '#3d484d', '--md-td-border': '#475258',
        '--md-del': '#859289',
        '--md-footnote-color': '#859289', '--md-footnote-border': '#475258',
        '--md-mark-bg': '#dbbc7f',
        '--md-resize': '#475258'
      }
    },
    rosepine: {
      label: 'Rosé Pine', hljs: 'dark',
      vars: {
        '--md-bg': '#191724', '--md-text': '#e0def4', '--md-border': '#403d52',
        '--md-shadow': '0 12px 40px rgba(0,0,0,0.5)',
        '--md-bar-bg': '#1f1d2e', '--md-bar-text': '#e0def4',
        '--md-bar-btn-bg': 'rgba(224,222,244,0.1)', '--md-bar-btn-hover': 'rgba(224,222,244,0.2)',
        '--md-tools-bg': '#1f1d2e', '--md-tools-border': '#403d52',
        '--md-label': '#c4a7e7',
        '--md-select-bg': '#26233a', '--md-select-text': '#e0def4', '--md-select-border': '#403d52',
        '--md-select-hover': '#c4a7e7',
        '--md-divider': '#403d52',
        '--md-copy-bg': '#26233a', '--md-copy-text': '#c4a7e7', '--md-copy-border': '#403d52',
        '--md-copy-hover-bg': '#c4a7e7', '--md-copy-hover-text': '#191724',
        '--md-link': '#9ccfd8',
        '--md-code-bg': '#26233a', '--md-code-text': '#e0def4', '--md-pre-bg': '#1f1d2e',
        '--md-quote-border': '#c4a7e7', '--md-quote-color': '#6e6a86',
        '--md-hr': '#403d52', '--md-h-border': '#403d52',
        '--md-th-bg': '#26233a', '--md-td-border': '#403d52',
        '--md-del': '#6e6a86',
        '--md-footnote-color': '#6e6a86', '--md-footnote-border': '#403d52',
        '--md-mark-bg': '#f6c177',
        '--md-resize': '#524f67'
      }
    },
    github_light: {
      label: 'GitHub Light', hljs: 'light',
      vars: {
        '--md-bg': '#ffffff', '--md-text': '#1f2328', '--md-border': '#d0d7de',
        '--md-shadow': '0 12px 40px rgba(31,35,40,0.15)',
        '--md-bar-bg': '#f6f8fa', '--md-bar-text': '#1f2328',
        '--md-bar-btn-bg': 'rgba(31,35,40,0.08)', '--md-bar-btn-hover': 'rgba(31,35,40,0.15)',
        '--md-tools-bg': '#f6f8fa', '--md-tools-border': '#d0d7de',
        '--md-label': '#59636e',
        '--md-select-bg': '#ffffff', '--md-select-text': '#1f2328', '--md-select-border': '#d0d7de',
        '--md-select-hover': '#0969da',
        '--md-divider': '#d0d7de',
        '--md-copy-bg': '#f6f8fa', '--md-copy-text': '#0969da', '--md-copy-border': '#d0d7de',
        '--md-copy-hover-bg': '#0969da', '--md-copy-hover-text': '#ffffff',
        '--md-link': '#0969da',
        '--md-code-bg': '#eff1f3', '--md-code-text': '#1f2328', '--md-pre-bg': '#f6f8fa',
        '--md-quote-border': '#0969da', '--md-quote-color': '#59636e',
        '--md-hr': '#d0d7de', '--md-h-border': '#d0d7de',
        '--md-th-bg': '#f6f8fa', '--md-td-border': '#d0d7de',
        '--md-del': '#59636e',
        '--md-footnote-color': '#59636e', '--md-footnote-border': '#d0d7de',
        '--md-mark-bg': '#fff8c5',
        '--md-resize': '#afb8c1'
      }
    },
    highcontrast: {
      label: 'High Contrast', hljs: 'dark',
      vars: {
        '--md-bg': '#000000', '--md-text': '#ffffff', '--md-border': '#8a8a8a',
        '--md-shadow': '0 12px 40px rgba(0,0,0,0.8)',
        '--md-bar-bg': '#0a0a0a', '--md-bar-text': '#ffffff',
        '--md-bar-btn-bg': 'rgba(255,255,255,0.15)', '--md-bar-btn-hover': 'rgba(255,255,255,0.3)',
        '--md-tools-bg': '#0a0a0a', '--md-tools-border': '#8a8a8a',
        '--md-label': '#ffd700',
        '--md-select-bg': '#161616', '--md-select-text': '#ffffff', '--md-select-border': '#8a8a8a',
        '--md-select-hover': '#ffd700',
        '--md-divider': '#8a8a8a',
        '--md-copy-bg': '#161616', '--md-copy-text': '#ffd700', '--md-copy-border': '#8a8a8a',
        '--md-copy-hover-bg': '#ffd700', '--md-copy-hover-text': '#000000',
        '--md-link': '#79c0ff',
        '--md-code-bg': '#161616', '--md-code-text': '#ffffff', '--md-pre-bg': '#0a0a0a',
        '--md-quote-border': '#ffd700', '--md-quote-color': '#e6e6e6',
        '--md-hr': '#8a8a8a', '--md-h-border': '#8a8a8a',
        '--md-th-bg': '#161616', '--md-td-border': '#8a8a8a',
        '--md-del': '#d6d6d6',
        '--md-footnote-color': '#d6d6d6', '--md-footnote-border': '#8a8a8a',
        '--md-mark-bg': '#8a6d00',
        '--md-resize': '#8a8a8a'
      }
    },
    forest: {
      label: 'Forest (Gradient)', hljs: 'dark',
      vars: {
        '--md-bg': 'linear-gradient(135deg, #022c22 0%, #065f46 50%, #047857 100%)',
        '--md-text': '#d1fae5', '--md-border': 'rgba(255,255,255,0.14)',
        '--md-shadow': '0 12px 40px rgba(2,44,34,0.55)',
        '--md-bar-bg': 'rgba(2,28,22,0.5)', '--md-bar-text': '#d1fae5',
        '--md-bar-btn-bg': 'rgba(255,255,255,0.12)', '--md-bar-btn-hover': 'rgba(255,255,255,0.22)',
        '--md-tools-bg': 'transparent', '--md-tools-border': 'rgba(255,255,255,0.14)',
        '--md-label': 'rgba(209,250,229,0.65)',
        '--md-select-bg': 'rgba(255,255,255,0.12)', '--md-select-text': '#d1fae5', '--md-select-border': 'rgba(255,255,255,0.22)',
        '--md-select-hover': '#6ee7b7',
        '--md-divider': 'rgba(255,255,255,0.18)',
        '--md-copy-bg': 'rgba(255,255,255,0.12)', '--md-copy-text': '#a7f3d0', '--md-copy-border': 'rgba(255,255,255,0.22)',
        '--md-copy-hover-bg': '#34d399', '--md-copy-hover-text': '#022c22',
        '--md-link': '#6ee7b7',
        '--md-code-bg': 'rgba(0,0,0,0.3)', '--md-code-text': '#d1fae5', '--md-pre-bg': 'rgba(0,0,0,0.35)',
        '--md-quote-border': '#34d399', '--md-quote-color': 'rgba(209,250,229,0.75)',
        '--md-hr': 'rgba(255,255,255,0.16)', '--md-h-border': 'rgba(255,255,255,0.16)',
        '--md-th-bg': 'rgba(0,0,0,0.3)', '--md-td-border': 'rgba(255,255,255,0.16)',
        '--md-del': 'rgba(209,250,229,0.55)',
        '--md-footnote-color': 'rgba(209,250,229,0.6)', '--md-footnote-border': 'rgba(255,255,255,0.16)',
        '--md-mark-bg': '#059669',
        '--md-resize': 'rgba(255,255,255,0.35)'
      }
    },
    candy: {
      label: 'Candy (Gradient)', hljs: 'dark',
      vars: {
        '--md-bg': 'linear-gradient(135deg, #500724 0%, #9d174d 50%, #be185d 100%)',
        '--md-text': '#fce7f3', '--md-border': 'rgba(255,255,255,0.14)',
        '--md-shadow': '0 12px 40px rgba(80,7,36,0.55)',
        '--md-bar-bg': 'rgba(50,7,36,0.5)', '--md-bar-text': '#fce7f3',
        '--md-bar-btn-bg': 'rgba(255,255,255,0.12)', '--md-bar-btn-hover': 'rgba(255,255,255,0.22)',
        '--md-tools-bg': 'transparent', '--md-tools-border': 'rgba(255,255,255,0.14)',
        '--md-label': 'rgba(252,231,243,0.65)',
        '--md-select-bg': 'rgba(255,255,255,0.12)', '--md-select-text': '#fce7f3', '--md-select-border': 'rgba(255,255,255,0.22)',
        '--md-select-hover': '#f9a8d4',
        '--md-divider': 'rgba(255,255,255,0.18)',
        '--md-copy-bg': 'rgba(255,255,255,0.12)', '--md-copy-text': '#fbcfe8', '--md-copy-border': 'rgba(255,255,255,0.22)',
        '--md-copy-hover-bg': '#ec4899', '--md-copy-hover-text': '#500724',
        '--md-link': '#f9a8d4',
        '--md-code-bg': 'rgba(0,0,0,0.3)', '--md-code-text': '#fce7f3', '--md-pre-bg': 'rgba(0,0,0,0.35)',
        '--md-quote-border': '#ec4899', '--md-quote-color': 'rgba(252,231,243,0.75)',
        '--md-hr': 'rgba(255,255,255,0.16)', '--md-h-border': 'rgba(255,255,255,0.16)',
        '--md-th-bg': 'rgba(0,0,0,0.3)', '--md-td-border': 'rgba(255,255,255,0.16)',
        '--md-del': 'rgba(252,231,243,0.55)',
        '--md-footnote-color': 'rgba(252,231,243,0.6)', '--md-footnote-border': 'rgba(255,255,255,0.16)',
        '--md-mark-bg': '#db2777',
        '--md-resize': 'rgba(255,255,255,0.35)'
      }
    }
  };

  globalThis.MD_SIDEPANEL_THEMES = {
    light: {
      hl: 'light',
      vars: { '--bg': '#ffffff', '--surface': '#f7f8fa', '--border': '#e3e6ea', '--text': '#1f2328', '--text2': '#656d76', '--accent': '#4f46e5', '--code-bg': '#f0f2f5', '--error': '#d1242f' }
    },
    dark: {
      hl: 'dark',
      vars: { '--bg': '#1e1e2e', '--surface': '#181825', '--border': '#313244', '--text': '#cdd6f4', '--text2': '#9399b2', '--accent': '#89b4fa', '--code-bg': '#313244', '--error': '#f38ba8' }
    },
    sepia: {
      hl: 'light',
      vars: { '--bg': '#f4ecd8', '--surface': '#efe6cf', '--border': '#d4c5a0', '--text': '#5b4636', '--text2': '#7a6450', '--accent': '#8b6f47', '--code-bg': '#e8dcc0', '--error': '#c04040' }
    },
    nord: {
      hl: 'dark',
      vars: { '--bg': '#2e3440', '--surface': '#3b4252', '--border': '#434c5e', '--text': '#d8dee9', '--text2': '#81a1c1', '--accent': '#88c0d0', '--code-bg': '#434c5e', '--error': '#bf616a' }
    },
    dracula: {
      hl: 'dark',
      vars: { '--bg': '#282a36', '--surface': '#21222c', '--border': '#44475a', '--text': '#f8f8f2', '--text2': '#bd93f9', '--accent': '#bd93f9', '--code-bg': '#44475a', '--error': '#ff5555' }
    },
    github: {
      hl: 'dark',
      vars: { '--bg': '#0d1117', '--surface': '#161b22', '--border': '#30363d', '--text': '#c9d1d9', '--text2': '#8b949e', '--accent': '#58a6ff', '--code-bg': '#161b22', '--error': '#f85149' }
    },
    solarized_light: {
      hl: 'light',
      vars: { '--bg': '#fdf6e3', '--surface': '#eee8d5', '--border': '#e0d8c5', '--text': '#657b83', '--text2': '#93a1a1', '--accent': '#b58900', '--code-bg': '#eee8d5', '--error': '#dc322f' }
    },
    solarized_dark: {
      hl: 'dark',
      vars: { '--bg': '#002b36', '--surface': '#073642', '--border': '#0d3b47', '--text': '#93a1a1', '--text2': '#2aa198', '--accent': '#2aa198', '--code-bg': '#073642', '--error': '#dc322f' }
    },
    aurora: {
      hl: 'dark',
      vars: { '--bg': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4c1d95 100%)', '--surface': 'rgba(20,16,60,0.45)', '--border': 'rgba(255,255,255,0.14)', '--text': '#ede9fe', '--text2': 'rgba(237,233,254,0.7)', '--accent': '#c4b5fd', '--code-bg': 'rgba(0,0,0,0.28)', '--error': '#fda4af' }
    },
    sunset: {
      hl: 'dark',
      vars: { '--bg': 'linear-gradient(135deg, #7f1d1d 0%, #9d174d 50%, #831843 100%)', '--surface': 'rgba(60,10,30,0.45)', '--border': 'rgba(255,255,255,0.14)', '--text': '#ffe4e6', '--text2': 'rgba(255,228,230,0.7)', '--accent': '#fda4af', '--code-bg': 'rgba(0,0,0,0.28)', '--error': '#fecdd3' }
    },
    ocean: {
      hl: 'dark',
      vars: { '--bg': 'linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #155e75 100%)', '--surface': 'rgba(6,40,60,0.45)', '--border': 'rgba(255,255,255,0.14)', '--text': '#e0f2fe', '--text2': 'rgba(224,242,254,0.7)', '--accent': '#7dd3fc', '--code-bg': 'rgba(0,0,0,0.28)', '--error': '#fca5a5' }
    },
    midnight: {
      hl: 'dark',
      vars: { '--bg': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0b1120 100%)', '--surface': 'rgba(2,6,23,0.5)', '--border': 'rgba(255,255,255,0.12)', '--text': '#e2e8f0', '--text2': 'rgba(226,232,240,0.65)', '--accent': '#7dd3fc', '--code-bg': 'rgba(0,0,0,0.3)', '--error': '#fca5a5' }
    },
    monokai: {
      hl: 'dark',
      vars: { '--bg': '#272822', '--surface': '#1e1f1c', '--border': '#49483e', '--text': '#f8f8f2', '--text2': '#75715e', '--accent': '#a6e22e', '--code-bg': '#49483e', '--error': '#f92672' }
    },
    onedark: {
      hl: 'dark',
      vars: { '--bg': '#282c34', '--surface': '#21252b', '--border': '#3e4451', '--text': '#abb2bf', '--text2': '#5c6370', '--accent': '#61afef', '--code-bg': '#3e4451', '--error': '#e06c75' }
    },
    gruvbox: {
      hl: 'dark',
      vars: { '--bg': '#282828', '--surface': '#1d2021', '--border': '#504945', '--text': '#ebdbb2', '--text2': '#a89984', '--accent': '#fabd2f', '--code-bg': '#3c3836', '--error': '#fb4934' }
    },
    tokyo: {
      hl: 'dark',
      vars: { '--bg': '#1a1b26', '--surface': '#16161e', '--border': '#24283b', '--text': '#c0caf5', '--text2': '#565f89', '--accent': '#7aa2f7', '--code-bg': '#24283b', '--error': '#f7768e' }
    },
    everforest: {
      hl: 'dark',
      vars: { '--bg': '#2d353b', '--surface': '#232a2e', '--border': '#475258', '--text': '#d3c6aa', '--text2': '#859289', '--accent': '#a7c080', '--code-bg': '#3d484d', '--error': '#e67e80' }
    },
    rosepine: {
      hl: 'dark',
      vars: { '--bg': '#191724', '--surface': '#1f1d2e', '--border': '#403d52', '--text': '#e0def4', '--text2': '#6e6a86', '--accent': '#c4a7e7', '--code-bg': '#26233a', '--error': '#eb6f92' }
    },
    github_light: {
      hl: 'light',
      vars: { '--bg': '#ffffff', '--surface': '#f6f8fa', '--border': '#d0d7de', '--text': '#1f2328', '--text2': '#59636e', '--accent': '#0969da', '--code-bg': '#f6f8fa', '--error': '#cf222e' }
    },
    highcontrast: {
      hl: 'dark',
      vars: { '--bg': '#000000', '--surface': '#0a0a0a', '--border': '#8a8a8a', '--text': '#ffffff', '--text2': '#d6d6d6', '--accent': '#ffd700', '--code-bg': '#161616', '--error': '#ff7b72' }
    },
    forest: {
      hl: 'dark',
      vars: { '--bg': 'linear-gradient(135deg, #022c22 0%, #065f46 50%, #047857 100%)', '--surface': 'rgba(2,28,22,0.5)', '--border': 'rgba(255,255,255,0.14)', '--text': '#d1fae5', '--text2': 'rgba(209,250,229,0.7)', '--accent': '#6ee7b7', '--code-bg': 'rgba(0,0,0,0.3)', '--error': '#fca5a5' }
    },
    candy: {
      hl: 'dark',
      vars: { '--bg': 'linear-gradient(135deg, #500724 0%, #9d174d 50%, #be185d 100%)', '--surface': 'rgba(50,7,36,0.5)', '--border': 'rgba(255,255,255,0.14)', '--text': '#fce7f3', '--text2': 'rgba(252,231,243,0.7)', '--accent': '#f9a8d4', '--code-bg': 'rgba(0,0,0,0.3)', '--error': '#fca5a5' }
    }
  };
})();
