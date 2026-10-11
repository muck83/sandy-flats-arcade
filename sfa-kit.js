/* Sandy Flats Arcade: minimal kit for the lesson pages (storage, DOM helper, toast), same storage namespace as the games. */
(function () {
  'use strict';
  var SFA = window.SFA = window.SFA || {}, NS = 'sfa.', mem = {};
  SFA.store = {
    get: function (k, d) { try { var v = localStorage.getItem(NS + k); if (v != null) return JSON.parse(v); } catch (e) { } return (k in mem) ? mem[k] : d; },
    set: function (k, v) { mem[k] = v; try { localStorage.setItem(NS + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { delete mem[k]; try { localStorage.removeItem(NS + k); } catch (e) { } },
    clearStudent: function () {
      var keep = /^sfa\.teacher/; mem = {};
      try { var ks = []; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(NS) === 0 && !keep.test(k)) ks.push(k); } ks.forEach(function (k) { localStorage.removeItem(k); }); } catch (e) { }
    }
  };
  SFA.el = function (tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) { var v = attrs[k]; if (v == null) continue; if (k === 'text') e.textContent = v; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v); else e.setAttribute(k, v); }
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  };
  var tt = null;
  SFA.toast = function (msg, ms) {
    var t = document.getElementById('sfaToast'); if (!t) { t = SFA.el('div', { id: 'sfaToast', 'class': 'toast', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(function () { t.hidden = true; }, ms || 2600);
  };
  SFA.GAMES = [
    { id: 'g1', title: 'Crack the Fair', file: 'g1-crack-the-fair.html' },
    { id: 'g2', title: 'Glitch Hunt', file: 'g2-glitch-hunt.html' },
    { id: 'g4', title: 'Gus\'s Forecast', file: 'g4-gus-forecast.html' },
    { id: 'g3', title: 'The Keeper\'s Vault', file: 'g3-keepers-vault.html' },
    { id: 'g5', title: 'Scorch Marks', file: 'g5-scorch-marks.html' },
    { id: 'g6', title: 'Linear or Liar?', file: 'g6-linear-or-liar.html' },
    { id: 'g7', title: 'Faster Than', file: 'g7-faster-than.html' },
    { id: 'g8', title: 'Doug\'s Steps', file: 'g8-dougs-steps.html' }
  ];
  SFA.parseLevels = function (s) {
    return String(s || '').split(' ').filter(Boolean).map(function (t) { var m = t.match(/^([^.]+)\.([a-z]*):(.)$/); return m ? { id: m[1], tier: m[2], st: m[3] } : null; }).filter(Boolean);
  };
  SFA.ago = function (iso) {
    var d = (Date.now() - new Date(iso).getTime()) / 1000; if (!isFinite(d)) return '';
    if (d < 90) return 'just now'; if (d < 3600) return Math.round(d / 60) + ' min ago'; if (d < 86400) return Math.round(d / 3600) + ' h ago';
    var n = Math.round(d / 86400); return n === 1 ? 'yesterday' : n + ' days ago';
  };
})();
window.SFA.esc = window.SFA.esc || function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
