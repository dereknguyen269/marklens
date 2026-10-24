// overlay.js — fullscreen overlay host injected into the page for "overlay" mode.
//
// The overlay is a full-viewport iframe pointing at sidepanel.html?embed=1, so
// the complete editor/preview stack (CodeMirror, marked, themes, storage, docs
// library) runs inside the extension's own origin instead of being re-implemented
// against the page. This file only owns the host shell, the Esc fallback, and
// the close channel from the embedded page.
//
// Injected by js/background.js via chrome.scripting (activeTab). Must be
// idempotent: re-injection while the overlay is open focuses the existing frame.

(function () {
  var HOST_ID = 'marklens-overlay-host';
  var existing = document.getElementById(HOST_ID);
  if (existing) {
    var liveFrame = existing.querySelector('iframe');
    if (liveFrame) { try { liveFrame.focus(); } catch (e) {} }
    return;
  }

  var root = document.createElement('div');
  root.id = HOST_ID;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'MarkLens editor');
  root.style.cssText = 'position:fixed;inset:0;z-index:2147483647;' +
    'background:rgba(12,14,18,0.55);display:flex;align-items:stretch;' +
    'justify-content:stretch;margin:0;padding:0;overflow:hidden;';

  var frame = document.createElement('iframe');
  frame.src = chrome.runtime.getURL('sidepanel.html?embed=1');
  frame.title = 'MarkLens — Markdown editor and preview';
  frame.setAttribute('allow', 'clipboard-write');
  frame.style.cssText = 'border:0;display:block;width:100%;height:100%;' +
    'margin:0;padding:0;background:#fff;color-scheme:normal;';

  function closeOverlay() {
    window.removeEventListener('message', onMessage);
    document.removeEventListener('keydown', onKey, true);
    if (frame.parentNode) frame.parentNode.removeChild(frame);
    if (root.parentNode) root.parentNode.removeChild(root);
    try { window.focus(); } catch (e) {}
  }

  // The embedded page posts this when its close button / Esc fires. Verify the
  // source window so a page script cannot spoof the close channel.
  function onMessage(e) {
    if (e.source !== frame.contentWindow) return;
    if (!e.data || e.data.source !== 'marklens' || e.data.action !== 'close-overlay') return;
    closeOverlay();
  }

  // Fallback for focus that never entered the iframe (e.g. it failed to load).
  // Key events inside the iframe stay in the iframe and are handled there.
  function onKey(e) {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    e.stopPropagation();
    closeOverlay();
  }

  root.appendChild(frame);
  (document.body || document.documentElement).appendChild(root);

  window.addEventListener('message', onMessage);
  document.addEventListener('keydown', onKey, true);

  frame.addEventListener('load', function () {
    try { frame.focus(); } catch (e) {}
  });

  // Subtle fade-in through the Web Animations API (works regardless of the
  // page's style-src CSP, unlike a keyframes <style> block).
  try {
    root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140, easing: 'ease-out' });
  } catch (e) {}
})();
