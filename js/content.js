// content.js — injected floating Markdown preview (runs in page context)
(function () {
  'use strict';

  const NS = 'md-live-preview';

  function safeHtml(html) {
    return (globalThis.DOMPurify && globalThis.DOMPurify.sanitize)
      ? globalThis.DOMPurify.sanitize(html)
      : html;
  }

  function hasHtmlTags(s) {
    return /<\/?[a-zA-Z][^<>]*>/.test(s || '');
  }

  // Box already exists: the message + key listeners from the first injection
  // are still active (same page, same DOM). Return without re-registering
  // anything — stacking another onMessage/document listener per right-click
  // caused duplicate renders and leaked handlers.
  if (document.getElementById(NS + '-box')) {
    return;
  }

  var lastSourceText = '';

  var DEFAULTS = {
    width: 380, height: 360, fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    theme: 'light'
  };
  var config = {};

  function loadConfig(cb) {
    globalThis.mdStorage.load(DEFAULTS, function (c) { config = c; cb(); });
  }
  function saveConfig() { globalThis.mdStorage.save(config); }

  var LIGHT_HL = chrome.runtime.getURL('css/highlight.css');
  var DARK_HL = chrome.runtime.getURL('css/highlight-dark.css');

  var THEMES = globalThis.MD_THEMES;

  var SELECT_CHEVRON = "%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 4l3 3 3-3' fill='none' stroke='%23888' stroke-width='1.5'/%3E%3C/svg%3E";

  const box = document.createElement('div');
  box.id = NS + '-box';
  box.innerHTML = `
    <style>
      @keyframes ${NS}-in { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }
      @media (prefers-reduced-motion: reduce) {
        #${NS}-box { animation: none !important; }
        #${NS}-box *, #${NS}-box *::before, #${NS}-box *::after { transition-duration: .01ms !important; }
      }
      #${NS}-box :focus-visible {
        outline: 2px solid var(--md-select-hover, #007aff) !important;
        outline-offset: 1px !important;
      }
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
      #${NS}-box.${NS}-min #${NS}-body, #${NS}-box.${NS}-min #${NS}-tools { display: none !important; }
      #${NS}-box.${NS}-max { width: min(90vw, 880px) !important; height: min(90vh, 760px) !important; }
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
      #${NS}-bar-btns button svg { width: 15px !important; height: 15px !important; display: block !important; }
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
        scrollbar-width: thin !important;
        scrollbar-color: var(--md-text, #656d76) transparent !important;
      }
      #${NS}-body::-webkit-scrollbar { width: 8px !important; height: 8px !important; }
      #${NS}-body::-webkit-scrollbar-track { background: transparent !important; }
      #${NS}-body::-webkit-scrollbar-corner { background: transparent !important; }
      #${NS}-body::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--md-text, #656d76) 45%, transparent) !important;
        border-radius: 999px !important;
        border: 2px solid transparent !important;
        background-clip: padding-box !important;
        min-height: 24px !important;
      }
      #${NS}-body::-webkit-scrollbar-thumb:hover {
        background: color-mix(in srgb, var(--md-text, #656d76) 75%, transparent) !important;
        background-clip: padding-box !important;
        border: 2px solid transparent !important;
      }
      #${NS}-body::-webkit-scrollbar-thumb:active {
        background: var(--md-text, #656d76) !important;
        background-clip: padding-box !important;
        border: 2px solid transparent !important;
      }
      #${NS}-body pre { scrollbar-width: thin !important; }
      #${NS}-body pre::-webkit-scrollbar { height: 6px !important; width: 6px !important; }
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
      #${NS}-body .footnotes li:target{background:color-mix(in srgb, var(--md-link,#007aff) 10%, transparent);border-radius:6px;}
      #${NS}-body sup a[data-footnote-ref]{
        display:inline-block;min-width:1.5em;box-sizing:border-box;text-align:center;
        font-size:.72em;font-weight:700;line-height:1.6;vertical-align:super;
        color:var(--md-link,#007aff);background:color-mix(in srgb, var(--md-link,#007aff) 14%, transparent);
        border-radius:999px;padding:0 .4em;text-decoration:none;
      }
      #${NS}-body sup a[data-footnote-ref]:hover{background:color-mix(in srgb, var(--md-link,#007aff) 26%, transparent);text-decoration:none;}
      #${NS}-body a[data-footnote-backref]{
        display:inline-block;margin-left:.4em;padding:0 .45em;
        font-size:.8em;font-weight:700;line-height:1.6;border-radius:999px;
        color:var(--md-link,#007aff);background:color-mix(in srgb, var(--md-link,#007aff) 14%, transparent);
        text-decoration:none;
      }
      #${NS}-body a[data-footnote-backref]:hover{background:color-mix(in srgb, var(--md-link,#007aff) 26%, transparent);text-decoration:none;}
      #${NS}-body dl{margin:.6em 0;padding-left:1em;}
      #${NS}-body dt{font-weight:600;margin-top:.4em;}
      #${NS}-body dd{margin:.2em 0 .2em 1.4em;}
      #${NS}-body mark{background:var(--md-mark-bg,#ffeb3b);padding:.1em .2em;border-radius:3px;}
      #${NS}-body sub,#${NS}-body sup{font-size:.75em;}
      #${NS}-resize {
        position: absolute !important; right: 0 !important; bottom: 0 !important;
        width: 24px !important; height: 24px !important; cursor: nwse-resize !important;
        touch-action: none !important;
        background: linear-gradient(135deg, transparent 55%, var(--md-resize, rgba(0,0,0,.15)) 58%, transparent 62%, var(--md-resize, rgba(0,0,0,.15)) 68%, transparent 72%) bottom right / 16px 16px no-repeat !important;
        z-index: 2 !important;
      }
      /* Narrow popup: hide uppercase group labels so Theme/Size/Font/Copy stay on fewer rows. */
      @media (max-width: 340px) {
        #${NS}-tools .${NS}-grp label { display: none !important; }
      }
      /* High-contrast preference: drop translucency/blur so text stays readable. */
      @media (prefers-contrast: more) {
        #${NS}-box { -webkit-backdrop-filter: none !important; backdrop-filter: none !important; }
      }
    </style>
    <link id="${NS}-hl" rel="stylesheet" href="${LIGHT_HL}">
    <div id="${NS}-header">
      <div id="${NS}-bar">
        <div id="${NS}-traffic">
          <span class="${NS}-tl-close" role="button" tabindex="0" title="Close (Esc)" aria-label="Close preview"></span>
          <span class="${NS}-tl-min" role="button" tabindex="0" title="Minimize" aria-label="Minimize preview"></span>
          <span class="${NS}-tl-max" role="button" tabindex="0" title="Zoom" aria-label="Zoom preview"></span>
        </div>
        <span id="${NS}-title">Markdown Preview</span>
        <div id="${NS}-bar-btns">
          <button id="${NS}-sidepanel" title="Open in side panel" aria-label="Open in side panel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/></svg></button>
        </div>
      </div>
      <div id="${NS}-tools">
        <div class="${NS}-grp">
          <label>Theme</label>
          <select id="${NS}-theme" title="Popup theme">
            <optgroup label="Solid">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="sepia">Sepia</option>
              <option value="nord">Nord</option>
              <option value="dracula">Dracula</option>
              <option value="github">GitHub Dark</option>
              <option value="solarized_light">Solarized Light</option>
              <option value="solarized_dark">Solarized Dark</option>
              <option value="monokai">Monokai</option>
              <option value="onedark">One Dark</option>
              <option value="gruvbox">Gruvbox</option>
              <option value="tokyo">Tokyo Night</option>
              <option value="everforest">Everforest</option>
              <option value="rosepine">Rosé Pine</option>
              <option value="github_light">GitHub Light</option>
              <option value="highcontrast">High Contrast</option>
            </optgroup>
            <optgroup label="Gradient">
              <option value="aurora">Aurora</option>
              <option value="sunset">Sunset</option>
              <option value="ocean">Ocean</option>
              <option value="midnight">Midnight</option>
              <option value="forest">Forest</option>
              <option value="candy">Candy</option>
            </optgroup>
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
        <button id="${NS}-copy" title="Copy rendered HTML (Ctrl+Enter)" aria-live="polite">Copy HTML</button>
      </div>
    </div>
    <div id="${NS}-body"></div>
    <div id="${NS}-resize" role="separator" tabindex="0" title="Resize (arrow keys)" aria-label="Resize preview" aria-orientation="horizontal"></div>
  `;
  box.style.width = DEFAULTS.width + 'px';
  box.style.height = DEFAULTS.height + 'px';
  document.body.appendChild(box);

  const body = box.querySelector('#' + NS + '-body');
  const themeSel = box.querySelector('#' + NS + '-theme');
  const copyBtn = box.querySelector('#' + NS + '-copy');
  const fontSizeSel = box.querySelector('#' + NS + '-fontsize');
  const fontFamilySel = box.querySelector('#' + NS + '-fontfamily');
  const resizeHandle = box.querySelector('#' + NS + '-resize');
  const hlLink = box.querySelector('#' + NS + '-hl');
  const sidepanelBtn = box.querySelector('#' + NS + '-sidepanel');
  const titleEl = box.querySelector('#' + NS + '-title');

  if (globalThis.setupMarked) globalThis.setupMarked();

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

  function applyConfig() {
    body.style.fontSize = config.fontSize + 'px';
    body.style.fontFamily = config.fontFamily;
    if (fontSizeSel) fontSizeSel.value = String(config.fontSize);
    if (fontFamilySel) fontFamilySel.value = config.fontFamily;
    applyTheme(config.theme || 'light');
    box.style.width = (config.width || DEFAULTS.width) + 'px';
    box.style.height = (config.height || DEFAULTS.height) + 'px';
  }

  function render(text) {
    renderWhenReady(text, 0);
  }
  function renderWhenReady(text, tries) {
    var md = globalThis.marked;
    if (md && typeof md.parse === 'function') {
      try {
        var html = md.parse(text || '');
        // Flattened selections (Chrome strips newlines in selectionText)
        // render tables as paragraphs — adopt the reflowed source only
        // when it parses to more <table>s than the original.
        if (globalThis.reflowFlattenedTable) {
          var fixed = globalThis.reflowFlattenedTable(text || '');
          if (fixed !== (text || '')) {
            var html2 = md.parse(fixed);
            var n1 = (html.match(/<table[\s>]/g) || []).length;
            var n2 = (html2.match(/<table[\s>]/g) || []).length;
            if (n2 > n1) { html = html2; text = fixed; }
          }
        }
        body.innerHTML = safeHtml(html);
        lastSourceText = text || '';
        if (copyBtn) { copyBtn.textContent = 'Copy HTML'; copyBtn.title = 'Copy rendered HTML'; }
        if (titleEl) titleEl.textContent = 'Markdown Preview';
      } catch (e) {
        body.innerHTML = '<pre style="color:#c00;white-space:pre-wrap">' + safeHtml(String(e && e.stack ? e.stack : e)) + '</pre>';
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

  function htmlToMarkdown(html) {
    var TS = globalThis.TurndownService;
    if (!TS) return 'ERROR: TurndownService not loaded.';
    var src = String(html || '');
    // No HTML markup: nothing to convert. Return as-is so Markdown
    // tables/fences keep their line breaks (Turndown would collapse
    // plain-text newlines into spaces, flattening tables to one line).
    if (!hasHtmlTags(src)) {
      return src.replace(/\n{3,}/g, '\n\n').trim();
    }
    var ts = new TS({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
    if (globalThis.turndownPluginGfm) ts.use(globalThis.turndownPluginGfm.gfm);
    var md = ts.turndown(src).replace(/\n{3,}/g, '\n\n').trim();
    // Safety net: a text-heavy selection can still lose its row breaks;
    // restore them when the output holds a flattened table.
    if (globalThis.reflowFlattenedTable) {
      var fixed = globalThis.reflowFlattenedTable(md);
      if (fixed !== md) md = fixed;
    }
    return md;
  }

  function renderMarkdownSource(mdText) {
    body.innerHTML = '<pre id="' + NS + '-source" style="white-space:pre-wrap;word-wrap:break-word;margin:0;font-family:Consolas,Menlo,monospace;font-size:inherit;padding:inherit;color:inherit;background:none;"></pre>';
    var pre = body.querySelector('#' + NS + '-source');
    pre.textContent = mdText;
    lastSourceText = mdText;
    if (titleEl) titleEl.textContent = 'Markdown Source';
    if (copyBtn) { copyBtn.textContent = 'Copy MD'; copyBtn.title = 'Copy Markdown source'; }
  }

  function closeBox() { box.remove(); }

  // Traffic-light close
  var tlClose = box.querySelector('.' + NS + '-tl-close');
  if (tlClose) tlClose.addEventListener('click', closeBox);

  // Traffic-light minimize / zoom
  var tlMin = box.querySelector('.' + NS + '-tl-min');
  var tlMax = box.querySelector('.' + NS + '-tl-max');
  if (tlMin) tlMin.addEventListener('click', function () { box.classList.toggle(NS + '-min'); });
  if (tlMax) tlMax.addEventListener('click', function () { box.classList.toggle(NS + '-max'); });

  // Keyboard access for the traffic-light controls (Enter/Space activates).
  Array.prototype.forEach.call(box.querySelectorAll('#' + NS + '-traffic span'), function (el) {
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  });

  // Open in Chrome side panel — send the original source (markdown), not the
  // rendered HTML, so the panel doesn't show literal tags as markdown text.
  sidepanelBtn.addEventListener('click', function () {
    var text = lastSourceText;
    if (!text) {
      var pre = body.querySelector('pre#' + NS + '-source');
      text = pre ? pre.textContent : '';
    }
    try {
      chrome.runtime.sendMessage({ action: 'openSidePanel', text: text });
      closeBox();
    } catch (e) { console.error('[MD] sendMessage failed:', e); }
  });

  themeSel.addEventListener('change', function () {
    config.theme = this.value;
    applyTheme(config.theme);
    saveConfig();
  });

  copyBtn.addEventListener('click', function () {
    var pre = body.querySelector('pre#' + NS + '-source');
    var copyText = pre ? pre.textContent : body.innerHTML;
    var done = function () {
      var old = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(function () { copyBtn.textContent = old; }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(copyText).then(done, done);
    } else {
      var ta = document.createElement('textarea');
      ta.value = copyText; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      ta.remove();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.getElementById(NS + '-box')) {
      closeBox();
    }
  });

  // Ctrl/Cmd+Enter copies when focus is inside the popup.
  box.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      copyBtn.click();
    }
  });

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

  // Drag-to-move (Pointer Events: mouse + touch; capture keeps the drag alive
  // outside the bar, no document-level listeners to leak on re-injection).
  const bar = box.querySelector('#' + NS + '-bar');
  let dragging = false, offX = 0, offY = 0;
  bar.style.touchAction = 'none';
  bar.addEventListener('pointerdown', function (e) {
    if (e.target.closest('#' + NS + '-bar-btns') || e.target.closest('#' + NS + '-traffic')) return;
    dragging = true;
    const rect = box.getBoundingClientRect();
    offX = e.clientX - rect.left;
    offY = e.clientY - rect.top;
    box.style.right = 'auto';
    box.style.left = rect.left + 'px';
    box.style.top = rect.top + 'px';
    try { bar.setPointerCapture(e.pointerId); } catch (err) {}
  });
  bar.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    box.style.left = (e.clientX - offX) + 'px';
    box.style.top = (e.clientY - offY) + 'px';
  });
  bar.addEventListener('pointerup', function () { dragging = false; });
  bar.addEventListener('pointercancel', function () { dragging = false; });

  // Drag-to-resize (bottom-right corner, 24px hit area, touch-friendly).
  let resizing = false, rsx = 0, rsy = 0, rsw = 0, rsh = 0;
  resizeHandle.style.touchAction = 'none';
  resizeHandle.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    e.stopPropagation();
    resizing = true;
    rsx = e.clientX; rsy = e.clientY;
    rsw = box.offsetWidth; rsh = box.offsetHeight;
    try { resizeHandle.setPointerCapture(e.pointerId); } catch (err) {}
  });
  resizeHandle.addEventListener('pointermove', function (e) {
    if (!resizing) return;
    var nw = Math.max(280, rsw + (e.clientX - rsx));
    var nh = Math.max(160, rsh + (e.clientY - rsy));
    box.style.width = nw + 'px';
    box.style.height = nh + 'px';
  });
  function endResize() {
    if (resizing) {
      resizing = false;
      config.width = box.offsetWidth;
      config.height = box.offsetHeight;
      saveConfig();
    }
  }
  resizeHandle.addEventListener('pointerup', endResize);
  resizeHandle.addEventListener('pointercancel', function () { resizing = false; });

  // Keyboard resize: arrows grow/shrink by 16px (Shift: 48px).
  resizeHandle.addEventListener('keydown', function (e) {
    var step = e.shiftKey ? 48 : 16;
    var w = box.offsetWidth, h = box.offsetHeight, used = true;
    if (e.key === 'ArrowRight') w += step;
    else if (e.key === 'ArrowLeft') w = Math.max(280, w - step);
    else if (e.key === 'ArrowDown') h += step;
    else if (e.key === 'ArrowUp') h = Math.max(160, h - step);
    else used = false;
    if (used) {
      e.preventDefault();
      box.style.width = w + 'px';
      box.style.height = h + 'px';
      config.width = w;
      config.height = h;
      saveConfig();
    }
  });

  function positionBox(boxEl, rect) {
    boxEl.style.right = 'auto';
    var w = boxEl.offsetWidth || 380, h = boxEl.offsetHeight || 360;
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
    boxEl.style.left = left + 'px';
    boxEl.style.top = top + 'px';
  }

  if (chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(function (msg) {
      if (msg && msg.action === 'renderMarkdown') {
        if (msg.text) render(msg.text);
        positionBox(box, msg.rect || null);
        box.style.display = 'flex';
      }
      if (msg && msg.action === 'convertHtmlToMarkdown') {
        if (msg.html) {
          // Tag-less selection (Markdown source, not HTML) — render it
          // instead of echoing flattened source back.
          if (msg.html.trim() && !hasHtmlTags(msg.html)) {
            render(msg.html);
          } else {
            var md = htmlToMarkdown(msg.html);
            renderMarkdownSource(md);
          }
        }
        positionBox(box, msg.rect || null);
        box.style.display = 'flex';
      }
    });
  }

  loadConfig(function () {
    applyConfig();
    render('');
  });
})();
