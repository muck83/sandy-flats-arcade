/* Muddle Under the Pond: what the host page (muddle-host.html) and the players' page (muddle.html) share.
   The rooms on the floors under the duck pond, the critters players pick, the quick tasks (tiny puzzles, 5 to 15 seconds),
   the words the game uses, and the call to the results script (or to the practice backend, muddle-mock.js, with ?try).

   How the game runs: the host page is the referee. Every ~1.5 s it sends the board (what everyone may see) and each
   player's secret part, and reads back every player's moves. Every ~2 s a player's page sends its unconfirmed moves and
   reads the board and its own part. Moves carry a running number and are re-sent until the host confirms them (ack). */
(function () {
  'use strict';
  var CFG = window.SFA_CONFIG || {};
  var M = window.MUD = {};
  M.TRY = /[?&]try\b/.test(location.search);
  M.endpoint = CFG.endpoint || '';

  M.ROOMS = [
    { e: '📖', n: 'Log Book Library', at: 'in the Log Book Library' },
    { e: '🚉', n: 'Station Zero', at: 'at Station Zero' },
    { e: '🐐', n: 'Goat Bridge', at: 'on Goat Bridge' },
    { e: '⚙️', n: 'Pump Room', at: 'in the Pump Room' },
    { e: '🛒', n: 'Cart Track', at: 'on the Cart Track' },
    { e: '📯', n: 'Fog Horn Deck', at: 'on the Fog Horn Deck' }
  ];
  M.HORN = 5;   // where the fog is cleared
  M.CRITTERS = [
    { e: '🐸', n: 'Frog', c: '#3BBF5C' }, { e: '🦆', n: 'Duck', c: '#F2C53D' }, { e: '🐢', n: 'Turtle', c: '#2FB8A0' }, { e: '🦀', n: 'Crab', c: '#E8584C' },
    { e: '🐟', n: 'Fish', c: '#4C9BE8' }, { e: '🐌', n: 'Snail', c: '#E8964C' }, { e: '🦎', n: 'Newt', c: '#9BD13B' }, { e: '🐞', n: 'Beetle', c: '#D93B5C' },
    { e: '🦦', n: 'Otter', c: '#A9784F' }, { e: '🐙', n: 'Octopus', c: '#B48CFF' }, { e: '🦩', n: 'Flamingo', c: '#FF8CC6' }, { e: '🦫', n: 'Beaver', c: '#C9925A' },
    { e: '🐝', n: 'Bee', c: '#FFD84A' }, { e: '🪼', n: 'Jelly', c: '#8CE0FF' }, { e: '🦢', n: 'Swan', c: '#E6E6F0' }, { e: '🐛', n: 'Bug', c: '#7BD96A' }
  ];
  M.critter = function (k) { return M.CRITTERS[(Math.round(Number(k)) || 0) % M.CRITTERS.length]; };

  M.buzz = function (pat) { var u = navigator.userActivation; if (navigator.vibrate && (!u || u.hasBeenActive)) try { navigator.vibrate(pat); } catch (e) { } };
  M.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  M.H = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  M.rid = function (n) { var a = 'abcdefghijkmnpqrstuvwxyz23456789', s = ''; var r = new Uint32Array(n); (window.crypto || window.msCrypto).getRandomValues(r); for (var i = 0; i < n; i++) s += a.charAt(r[i] % a.length); return s; };
  M.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  M.pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  M.ri = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
  M.secs = function (ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return s >= 60 ? Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2) : s + ''; };
  // nicknames: letters, numbers, spaces, . _ -, 14 characters; a short list of words that are never a nickname
  M.cleanNick = function (x) { return String(x == null ? '' : x).replace(/[^A-Za-z0-9 ._-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 14); };
  var NO = ['fuck', 'shit', 'bitch', 'cunt', 'dick', 'cock', 'pussy', 'penis', 'vagina', 'sex', 'porn', 'nigg', 'fag', 'slut', 'whore', 'rape', 'nazi', 'hitler', 'retard', 'kys', 'damn', 'ass', 'boob', 'butt'];
  M.okNick = function (n) { var t = String(n).toLowerCase().replace(/[^a-z]/g, '').replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e'); return n.length >= 2 && !NO.some(function (w) { return t.indexOf(w) >= 0; }); };

  M.call = function (op, body) {
    if (!M.endpoint) return Promise.reject(new Error('no results script'));
    return fetch(M.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ op: op }, body || {})), redirect: 'follow' })
      .then(function (r) { return r.text(); })
      .then(function (t) { try { return JSON.parse(t); } catch (e) { throw new Error('The results script didn\'t answer properly.'); } })
      .then(function (j) { if (!j.ok) { var e = new Error(j.error || 'failed'); e.server = true; throw e; } return j; });
  };

  /* ---------- the quick tasks ----------
     Each builds a tiny puzzle in box and calls done() once it is solved. Wrong taps just shake; nothing is ever marked. */
  function btn(txt, cls) { var b = M.H('button', 'mtk ' + (cls || ''), txt); b.type = 'button'; return b; }
  function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); M.buzz(40); }
  function choices(box, prompt, right, wrongs, done) {
    box.appendChild(M.H('p', 'mtq', prompt));
    var row = M.H('div', 'mtrow');
    M.shuffle([right].concat(wrongs)).forEach(function (v) {
      var b = btn(String(v)); b.onclick = function () { if (v === right) { b.classList.add('ok'); setTimeout(done, 250); } else { shake(b); b.disabled = true; } };
      row.appendChild(b);
    });
    box.appendChild(row);
  }
  function near(v, n) { var out = []; while (out.length < n) { var w = v + M.pick([-3, -2, -1, 1, 2, 3, 10, -10]); if (w !== v && w >= 0 && out.indexOf(w) < 0) out.push(w); } return out; }
  M.TASKS = {
    dial: { t: 'Set the pressure dial', go: function (box, done) {
      var a = M.ri(3, 12), b = M.ri(3, 12), x = Math.random() < 0.5, v = x ? a * b : a + b + M.ri(5, 20);
      var q = x ? a + ' × ' + b : a + ' + ' + b + ' + ' + (v - a - b);
      choices(box, 'The dial needs <b>' + q + '</b>', v, near(v, 3), done);
    } },
    next: { t: 'Finish the log pattern', go: function (box, done) {
      var s = M.ri(1, 9), d = M.ri(2, 7), dbl = Math.random() < 0.3, seq = [];
      for (var i = 0; i < 4; i++) seq.push(dbl ? s * Math.pow(2, i) : s + d * i);
      var v = dbl ? s * 16 : s + d * 4;
      choices(box, 'What comes next?<br><b class="mtbig">' + seq.join(', ') + ', ?</b>', v, near(v, 3), done);
    } },
    order: { t: 'Stack the crates', go: function (box, done) {
      var ns = []; while (ns.length < 5) { var n = M.ri(1, 60); if (ns.indexOf(n) < 0) ns.push(n); }
      var sorted = ns.slice().sort(function (a, b) { return a - b; }), at = 0;
      box.appendChild(M.H('p', 'mtq', 'Tap the crates from <b>smallest</b> to <b>biggest</b>'));
      var row = M.H('div', 'mtrow');
      ns.forEach(function (n) { var b = btn('📦 ' + n); b.onclick = function () { if (n === sorted[at]) { b.disabled = true; b.classList.add('ok'); if (++at === 5) setTimeout(done, 250); } else shake(b); }; row.appendChild(b); });
      box.appendChild(row);
    } },
    wires: { t: 'Reconnect the wires', go: function (box, done) {
      var cols = M.shuffle([['#E8584C', 'red'], ['#4C9BE8', 'blue'], ['#F2C53D', 'yellow'], ['#3BBF5C', 'green']]), right = M.shuffle(cols), sel = null, left = 4;
      box.appendChild(M.H('p', 'mtq', 'Tap a wire on the left, then the same colour on the right'));
      var g = M.H('div', 'mtwires'), L = M.H('div', 'mtcol'), R = M.H('div', 'mtcol');
      cols.forEach(function (c) { var b = btn('', 'wire'); b.style.background = c[0]; b.setAttribute('aria-label', c[1] + ' wire, left'); b.onclick = function () { if (b.disabled) return; [].forEach.call(L.children, function (x) { x.classList.remove('sel'); }); sel = { c: c, b: b }; b.classList.add('sel'); }; L.appendChild(b); });
      right.forEach(function (c) { var b = btn('', 'wire'); b.style.background = c[0]; b.setAttribute('aria-label', c[1] + ' wire, right'); b.onclick = function () { if (!sel || b.disabled) return; if (sel.c === c) { sel.b.disabled = b.disabled = true; sel.b.classList.remove('sel'); sel.b.classList.add('ok'); b.classList.add('ok'); sel = null; if (--left === 0) setTimeout(done, 250); } else shake(b); }; R.appendChild(b); });
      g.appendChild(L); g.appendChild(M.H('div', 'mtmid', '⚡')); g.appendChild(R); box.appendChild(g);
    } },
    pump: { t: 'Work the hand pump', go: function (box, done) {
      box.appendChild(M.H('p', 'mtq', '<b>Press and hold</b> the handle until the tank is full'));
      var bar = M.H('div', 'mtbar', '<i></i>'), b = btn('🫷 Hold to pump', 'big'), v = 0, t = null, fin = false;
      function stop() { clearInterval(t); t = null; }
      function go(e) { if (e) e.preventDefault(); if (t || fin) return; t = setInterval(function () { v = Math.min(100, v + 4); bar.firstChild.style.width = v + '%'; if (v >= 100) { stop(); fin = true; b.classList.add('ok'); setTimeout(done, 250); } }, 100); }
      b.addEventListener('pointerdown', go); ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (k) { b.addEventListener(k, stop); });
      b.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') go(e); }); b.addEventListener('keyup', stop);
      b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      box.appendChild(bar); box.appendChild(b);
    } },
    memory: { t: 'Repeat the signal', go: function (box, done) {
      var pool = ['🔴', '🟡', '🔵', '🟢', '🟣', '🟠'], seq = [0, 1, 2, 3].map(function () { return M.pick(pool); }), at = 0;
      var p = M.H('p', 'mtq', 'Remember the signal…'), show = M.H('div', 'mtsig', seq.join(' ')), row = M.H('div', 'mtrow');
      box.appendChild(p); box.appendChild(show); box.appendChild(row);
      setTimeout(function () {
        show.textContent = '❔ ❔ ❔ ❔'; p.innerHTML = 'Tap the four lights <b>in the same order</b>';
        pool.forEach(function (c) { var b = btn(c, 'emo'); b.onclick = function () { if (c === seq[at]) { at++; show.textContent = seq.slice(0, at).join(' ') + ' ' + '❔ '.repeat(4 - at); if (at === 4) setTimeout(done, 250); } else { shake(b); at = 0; show.textContent = seq.join(' '); setTimeout(function () { show.textContent = '❔ ❔ ❔ ❔'; }, 1500); } }; row.appendChild(b); });
      }, 2200);
    } },
    odd: { t: 'Spot the odd duck', go: function (box, done) {
      var pairs = [['🦆', '🐤'], ['🐸', '🐢'], ['🐟', '🐠'], ['🍂', '🍁'], ['🌕', '🌝'], ['🪨', '🥔']], pr = M.pick(pairs), n = 16, odd = M.ri(0, n - 1);
      box.appendChild(M.H('p', 'mtq', 'One of these is <b>different</b>. Tap it.'));
      var g = M.H('div', 'mtgrid');
      for (var i = 0; i < n; i++) (function (i) { var b = btn(i === odd ? pr[1] : pr[0], 'emo'); b.onclick = function () { if (i === odd) { b.classList.add('ok'); setTimeout(done, 250); } else shake(b); }; g.appendChild(b); })(i);
      box.appendChild(g);
    } },
    bubbles: { t: 'Pop the mud bubbles', go: function (box, done) {
      var left = 6, area = M.H('div', 'mtarea');
      box.appendChild(M.H('p', 'mtq', 'Pop all <b>6</b> bubbles'));
      box.appendChild(area);
      function one() { var b = btn('🫧', 'bub'); b.style.left = M.ri(4, 80) + '%'; b.style.top = M.ri(6, 70) + '%'; b.onclick = function () { b.remove(); if (--left === 0) setTimeout(done, 200); else one(); }; area.appendChild(b); }
      one();
    } },
    horn: { t: 'Blow the fog horn', go: function (box, done) {
      var left = 8, b = btn('📯 ×8', 'big');
      box.appendChild(M.H('p', 'mtq', 'Tap the horn <b>8 times</b> to clear the fog'));
      b.onclick = function () { left--; b.textContent = left > 0 ? '📯 ×' + left : '✅'; if (left === 0) { b.disabled = true; setTimeout(done, 250); } };
      box.appendChild(b);
    } }
  };
  M.TASK_KINDS = ['dial', 'next', 'order', 'wires', 'pump', 'memory', 'odd', 'bubbles'];

  M.WORDS = {
    keeper: 'Keeper', keepers: 'Keepers', mud: 'Muddler', muds: 'Muddlers',
    keeperJob: 'Do your tasks to fill the pond pump, and work out who the Muddlers are.',
    mudJob: 'Pretend to do tasks. Muddle Keepers when no one else is watching, and don\'t get caught.'
  };
})();
