/* Sandy Flats Arcade: subtitle size and on/off, shared by every game, the hub and the reels.
   One "CC" button on each stage (and on the Lost Reels player) cycles Small → Medium → Large → Off.
   The choice is kept in this browser and follows the student from game to game. */
(function () {
  'use strict';
  var KEY = 'sfa.subs', ORDER = ['s', 'm', 'l', 'off'], NAME = { s: 'Small', m: 'Medium', l: 'Large', off: 'Off' };
  function get() { try { var v = JSON.parse(localStorage.getItem(KEY)); if (ORDER.indexOf(v) >= 0) return v; } catch (e) { } return 's'; }
  function set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { } apply(v); tellFrames(v); }
  function apply(v) {
    var b = document.body; if (!b) return;
    ORDER.forEach(function (k) { b.classList.remove('subs-' + k); }); b.classList.add('subs-' + v);
    [].forEach.call(document.querySelectorAll('.ccbtn'), function (x) { x.textContent = 'CC: ' + NAME[v]; x.setAttribute('aria-label', 'Subtitles: ' + NAME[v] + '. Press to change.'); x.setAttribute('aria-pressed', String(v !== 'off')); });
  }
  function tellFrames(v) { [].forEach.call(document.querySelectorAll('iframe'), function (f) { try { f.contentWindow.postMessage({ sfaSubs: v }, '*'); } catch (e) { } }); }
  function cycle() { var v = get(); set(ORDER[(ORDER.indexOf(v) + 1) % ORDER.length]); }

  var css = document.createElement('style');
  css.textContent =
    'body.subs-off .capbar,body.subs-off .cap{display:none!important}' +
    'body.subs-s .capbar,body.subs-s .cap{font-size:clamp(11px,1.45vw,16px)!important;padding:4px 10px 5px!important;max-width:80%!important}' +
    'body.subs-m .capbar,body.subs-m .cap{font-size:clamp(13px,2vw,20px)!important}' +
    'body.subs-l .capbar,body.subs-l .cap{font-size:clamp(15px,2.6vw,28px)!important}' +
    '.reelhead .ccbtn{font:700 14px var(--ui,sans-serif)}';
  document.head.appendChild(css);

  function button(cls) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ccbtn' + (cls ? ' ' + cls : ''); b.title = 'Subtitles: small, medium, large or off (T)';
    b.addEventListener('click', function (e) { e.stopPropagation(); cycle(); }); return b;
  }
  function addButtons(root) {
    [].forEach.call((root || document).querySelectorAll('.stagebtns'), function (bar) { if (!bar.querySelector('.ccbtn')) bar.insertBefore(button(''), bar.firstChild); });
    [].forEach.call((root || document).querySelectorAll('.reelhead .row'), function (row) { if (!row.querySelector('.ccbtn')) row.insertBefore(button('btn'), row.firstChild); });
    apply(get());
  }

  window.addEventListener('message', function (e) { if (e.data && ORDER.indexOf(e.data.sfaSubs) >= 0) apply(e.data.sfaSubs); });
  window.addEventListener('storage', function (e) { if (e.key === KEY) { apply(get()); tellFrames(get()); } });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '')) { e.preventDefault(); cycle(); }
  });
  function boot() {
    addButtons();
    // reel player and other overlays are built later: add the button when they appear
    new MutationObserver(function (ms) { ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1 && (n.matches('.reelhead, .stagebtns') || n.querySelector('.reelhead, .stagebtns'))) addButtons(n.parentNode || n); }); }); })
      .observe(document.body, { childList: true, subtree: true });
    [].forEach.call(document.querySelectorAll('iframe'), function (f) { f.addEventListener('load', function () { tellFrames(get()); }); });
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
