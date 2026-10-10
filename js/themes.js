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
    }
  };
})();
