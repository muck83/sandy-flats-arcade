/* Sandy Flats Homework Arcade: one engine, one data file per lesson (hw/u3-04.js calls SFA_HW({...})).
   hw.html?g=u3-04 plays it. Each game is a short run of levels; each level is a few tasks.
   Task kinds:
     solve  step by step: pick the move, then pick what it gives (sfa-ineq's widget). { start, moves: [{ q, opts, ans, res, rans, hint, why, no }] }
     choice pick one. { q, opts, ans, why, no: ['message for a wrong option', ...] }
     number type a number. { q, ans, tol, unit, hint, why }
     pair   type a point. { q, ans: [x, y], hint, why }
     fill   fill the blanks in a table. { q, head: ['x', 'f(x)'], rows: [[0, { a: 5 }], [1, 7]], hint, why } ({ a } cells are inputs)
     sort, match, plane, pick, nl, build: sfa-ineq's widgets, same fields as in the lessons (README).
   Any task may add: tab { head, rows } (a table), fig { range, lines: [{ m, b, dash, col, lab }], pts: [[x, y, 'label']],
   paths: [{ p: [[x, y], ...], col, dash }], vx: [3] (vertical lines), x: 'x', y: 'y' } (a graph), figs: [{ cap, ...fig }] (a row of
   small graphs, e.g. to compare), learn (lines shown above the task), hint (after a wrong try), why (after it is right).
   Coins: 3 for right first time, 2 after one slip, 1 after more; three wrong checks show the answer for 0.
   Stars per level from coins. Progress is saved in this browser and (signed in) to the results sheet under the game's id
   (g31-g45 Unit 3, g61-g75 Unit 4: the results script accepts any g1-g99). */
(function () {
  'use strict';
  var SFA = window.SFA, el = SFA.el, IQ = window.SFA_INEQ, FX = function () { return window.SFA_FX; };
  var app = document.getElementById('hwApp');
  var key = (location.search.match(/[?&]g=([a-z0-9-]+)/) || [])[1] || '';
  var G = null, P = null, cur = null;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(s) { return esc(s).replace(/\*([^*]+)\*/g, '<b>$1</b>').replace(/_([^_]+)_/g, '<i>$1</i>'); }
  function H(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function btn(t, cls, fn) { var b = el('button', { type: 'button', 'class': 'btn ' + (cls || '') }); b.innerHTML = t; b.onclick = fn; return b; }
  function sfx(n) { try { FX() && FX().sfx(n); } catch (e) { } }
  function fx(n, a, b) { try { FX() && FX()[n] && FX()[n](a, b); } catch (e) { } }
  function num(s) { s = String(s == null ? '' : s).trim().replace(/−/g, '-').replace(/,/g, '').replace(/\s+/g, ''); if (/^-?\d+\/\d+$/.test(s)) { var p = s.split('/'); return +p[0] / +p[1]; } if (s === '' || isNaN(+s)) return NaN; return +s; }
  function near(a, b, tol) { return Math.abs(a - b) <= (tol || 1e-6); }
  function txtNum(v) { return (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : String(Math.round(v * 1000) / 1000)).replace('-', '−'); }

  /* ---------- progress ---------- */
  function load() { P = SFA.store.get('hw.' + G.id, null) || { done: {}, stars: {}, coins: {}, best: 0 }; P.done = P.done || {}; P.stars = P.stars || {}; P.coins = P.coins || {}; }
  function totalCoins() { var t = 0; for (var k in P.coins) t += P.coins[k] || 0; return t; }
  function maxCoins() { return G.levels.reduce(function (a, L) { return a + 3 * L.tasks.length; }, 0); }
  function levelsMeta() { return G.levels.map(function (L, i) { return { id: 'L' + (i + 1), tier: L.boss ? 'stretch' : 'core', name: L.name }; }); }
  function save() {
    P.at = new Date().toISOString();
    SFA.store.set('hw.' + G.id, P);
    if (SFA.sync && SFA.sync.on && SFA.sync.report) {
      var meta = levelsMeta(), core = meta.filter(function (m) { return m.tier === 'core'; }), coreN = core.filter(function (m) { return P.done[m.id]; }).length;
      var all3 = meta.every(function (m) { return P.stars[m.id] === 3; });
      var certs = [{ key: 'std', title: G.title + ' complete' }, { key: 'gold', title: G.title + ': three stars everywhere' }];
      var st = { std: coreN === core.length, coreN: coreN, coreTotal: core.length, specials: { gold: all3 } };
      var raw = { done: P.done, stars: P.stars, coins: P.coins, tickets: totalCoins() };
      try { SFA.sync.report(G.id, raw, SFA.sync.summarize(meta, raw, st, certs)); } catch (e) { }
    }
  }

  /* ---------- a small static grapher (cream paper, like the films' graphs) ---------- */
  function figure(f, size) {
    var r = f.range || [-6, 6], ry = f.yrange || r, S = size || 300, pad = 26, w = S, h = Math.round(S * (ry[1] - ry[0]) / (r[1] - r[0])) || S;
    h = Math.max(160, Math.min(h, S * 1.3));
    var X = function (x) { return pad + (x - r[0]) / (r[1] - r[0]) * (w - 2 * pad); }, Y = function (y) { return h - pad - (y - ry[0]) / (ry[1] - ry[0]) * (h - 2 * pad); };
    var step = f.step || (r[1] - r[0] > 16 ? 2 : 1), ystep = f.ystep || (ry[1] - ry[0] > 16 ? Math.ceil((ry[1] - ry[0]) / 10) : 1);
    var s = '<svg class="hwfig" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" role="img" aria-label="' + esc(f.alt || 'graph') + '">';
    for (var x = Math.ceil(r[0] / step) * step; x <= r[1]; x += step) s += '<line x1="' + X(x) + '" y1="' + Y(ry[0]) + '" x2="' + X(x) + '" y2="' + Y(ry[1]) + '" stroke="#d8d0b6" stroke-width="1"/>';
    for (var y = Math.ceil(ry[0] / ystep) * ystep; y <= ry[1]; y += ystep) s += '<line x1="' + X(r[0]) + '" y1="' + Y(y) + '" x2="' + X(r[1]) + '" y2="' + Y(y) + '" stroke="#d8d0b6" stroke-width="1"/>';
    var ax0 = Math.min(Math.max(0, r[0]), r[1]), ay0 = Math.min(Math.max(0, ry[0]), ry[1]);
    s += '<line x1="' + X(r[0]) + '" y1="' + Y(ay0) + '" x2="' + X(r[1]) + '" y2="' + Y(ay0) + '" stroke="#1b1a22" stroke-width="2"/>';
    s += '<line x1="' + X(ax0) + '" y1="' + Y(ry[0]) + '" x2="' + X(ax0) + '" y2="' + Y(ry[1]) + '" stroke="#1b1a22" stroke-width="2"/>';
    if (!f.noTicks) {
      for (x = Math.ceil(r[0] / step) * step; x <= r[1]; x += step) if (x !== 0 || ay0 !== 0) s += '<text x="' + X(x) + '" y="' + (Y(ay0) + 14) + '" font-size="10" text-anchor="middle" fill="#55505f" font-family="IBM Plex Mono,monospace">' + txtNum(x) + '</text>';
      for (y = Math.ceil(ry[0] / ystep) * ystep; y <= ry[1]; y += ystep) if (y !== 0) s += '<text x="' + (X(ax0) - 5) + '" y="' + (Y(y) + 3.5) + '" font-size="10" text-anchor="end" fill="#55505f" font-family="IBM Plex Mono,monospace">' + txtNum(y) + '</text>';
    }
    if (f.x) s += '<text x="' + (w - 4) + '" y="' + (Y(ay0) - 6) + '" font-size="12" font-weight="700" text-anchor="end" fill="#1b1a22" font-family="Bricolage Grotesque,sans-serif">' + esc(f.x) + '</text>';
    if (f.y) s += '<text x="' + (X(ax0) + 6) + '" y="12" font-size="12" font-weight="700" fill="#1b1a22" font-family="Bricolage Grotesque,sans-serif">' + esc(f.y) + '</text>';
    var cols = ['#0e6b70', '#c2410c', '#6d3fb3', '#1b1a22'];
    (f.lines || []).forEach(function (L, i) {
      var c = L.col || cols[i % cols.length], x1 = r[0], x2 = r[1];
      if (L.from != null) x1 = Math.max(x1, L.from); if (L.to != null) x2 = Math.min(x2, L.to);
      // clip to the y range
      var ys = [L.m * x1 + L.b, L.m * x2 + L.b];
      if (L.m !== 0) { var xa = (ry[0] - L.b) / L.m, xb = (ry[1] - L.b) / L.m, lo = Math.min(xa, xb), hi = Math.max(xa, xb); x1 = Math.max(x1, lo); x2 = Math.min(x2, hi); }
      if (x2 <= x1) return;
      s += '<line x1="' + X(x1) + '" y1="' + Y(L.m * x1 + L.b) + '" x2="' + X(x2) + '" y2="' + Y(L.m * x2 + L.b) + '" stroke="' + c + '" stroke-width="3"' + (L.dash ? ' stroke-dasharray="8 6"' : '') + ' stroke-linecap="round"/>';
      if (L.lab) { var lx = L.labAt != null ? L.labAt : x2 - (x2 - x1) * 0.12; s += '<text x="' + (X(lx) + 4) + '" y="' + (Y(L.m * lx + L.b) - 7) + '" font-size="12" font-weight="700" fill="' + c + '" font-family="Bricolage Grotesque,sans-serif">' + esc(L.lab) + '</text>'; }
    });
    (f.vx || []).forEach(function (v, i) { s += '<line x1="' + X(v) + '" y1="' + Y(ry[0]) + '" x2="' + X(v) + '" y2="' + Y(ry[1]) + '" stroke="' + cols[(i + 1) % 4] + '" stroke-width="3"/>'; });
    (f.paths || []).forEach(function (Pth, i) {
      var c = Pth.col || cols[i % cols.length];
      s += '<polyline fill="none" points="' + Pth.p.map(function (q) { return X(q[0]) + ',' + Y(q[1]); }).join(' ') + '" stroke="' + c + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"' + (Pth.dash ? ' stroke-dasharray="8 6"' : '') + '/>';
      if (Pth.dots) Pth.p.forEach(function (q) { s += '<circle cx="' + X(q[0]) + '" cy="' + Y(q[1]) + '" r="4" fill="' + c + '"/>'; });
    });
    (f.circles || []).forEach(function (C) { s += '<ellipse cx="' + X(C.cx) + '" cy="' + Y(C.cy) + '" rx="' + Math.abs(X(C.r) - X(0)) + '" ry="' + Math.abs(Y(C.r) - Y(0)) + '" fill="none" stroke="' + (C.col || cols[0]) + '" stroke-width="3"/>'; });
    (f.pts || []).forEach(function (q) {
      s += '<circle cx="' + X(q[0]) + '" cy="' + Y(q[1]) + '" r="' + (q[3] === 'open' ? 5 : 5) + '" fill="' + (q[3] === 'open' ? '#f7f3e3' : '#1b1a22') + '" stroke="#1b1a22" stroke-width="2"/>';
      if (q[2]) s += '<text x="' + (X(q[0]) + 7) + '" y="' + (Y(q[1]) - 7) + '" font-size="12" font-weight="700" fill="#1b1a22" font-family="Bricolage Grotesque,sans-serif">' + esc(q[2]) + '</text>';
    });
    return s + '</svg>';
  }
  function table(t) {
    var s = '<table class="hwtab">';
    if (t.vertical === false || !t.cols) { s += '<tr>' + t.head.map(function (h) { return '<th>' + fmt(h) + '</th>'; }).join('') + '</tr>'; t.rows.forEach(function (r) { s += '<tr>' + r.map(function (c) { return '<td>' + fmt(typeof c === 'number' ? txtNum(c) : c) + '</td>'; }).join('') + '</tr>'; }); }
    return s + '</table>';
  }
  function extras(T, box) {
    if (T.learn) { var lb = H('div', 'hwlearn'); lb.innerHTML = '<ul>' + T.learn.map(function (l) { return '<li>' + fmt(l) + '</li>'; }).join('') + '</ul>'; box.appendChild(lb); }
    if (T.fig) box.appendChild(H('div', '', figure(T.fig, T.fig.size)));
    if (T.figs) { var row = H('div', 'hwfigs'); T.figs.forEach(function (f) { var fg = H('figure', ''); fg.innerHTML = figure(f, f.size || 190) + (f.cap ? '<figcaption>' + fmt(f.cap) + '</figcaption>' : ''); row.appendChild(fg); }); box.appendChild(row); }
    if (T.tab && !IQK[T.k]) box.appendChild(H('div', '', table(T.tab)));
  }

  /* ---------- options in a fixed, mixed-up order (so the right one isn't always first); hints move with their option ---------- */
  function order(id, n) {
    var h = 2166136261, a = [], i; id = String(id);
    for (i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    for (i = 0; i < n; i++) a.push(i);
    for (i = n - 1; i > 0; i--) { h = (Math.imul(h, 1103515245) + 12345) >>> 0; var j = (h >>> 8) % (i + 1), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;   // a[newPos] = old index
  }
  function mixList(list, ans, id) { var o = order(id, list.length); return { list: o.map(function (k) { return list[k]; }), ans: o.indexOf(ans), map: o }; }
  function mixed(T, id) {
    if (T.keep) return T;
    if (T.k === 'choice') {
      var m = mixList(T.opts, T.ans, id + 'c'), c = Object.assign({}, T, { opts: m.list, ans: m.ans });
      if (T.no) c.no = m.map.map(function (k) { return T.no[k]; });
      return c;
    }
    if (T.k === 'solve' && T.moves) {
      return Object.assign({}, T, { moves: T.moves.map(function (mv, i) {
        var a = mixList(mv.opts || [], mv.ans, id + 'm' + i), r = mixList(mv.res || [], mv.rans, id + 'r' + i), n = Object.assign({}, mv, { opts: a.list, ans: a.ans, res: r.list, rans: r.ans });
        if (mv.no) { n.no = {}; a.map.forEach(function (k, p) { if (mv.no[k] != null) n.no[p] = mv.no[k]; }); r.map.forEach(function (k, p) { if (mv.no['r' + k] != null) n.no['r' + p] = mv.no['r' + k]; }); }
        return n;
      }) });
    }
    return T;
  }

  /* ---------- task widgets: each returns { root, check() → {ok, msg} | null, showAnswer(), freeze() } or self-checking ---------- */
  var IQK = { solve: 1, sort: 1, match: 1, plane: 1, pick: 1, nl: 1, build: 1 };
  var K = {};
  K.choice = function (T, o) {
    var root = H('div', ''), list = H('div', 'hwopts'), wrong = {}, done = false;
    T.opts.forEach(function (t, i) {
      var b = el('button', { type: 'button', 'class': 'hwopt' }); b.innerHTML = fmt(t);
      b.onclick = function () {
        if (done || wrong[i]) return;
        if (i === T.ans) { done = true; b.classList.add('yes'); o.done(1 + Object.keys(wrong).length); }
        else { wrong[i] = 1; b.classList.add('no'); b.disabled = true; o.miss((T.no && T.no[i]) || T.hint || 'Not that one. Read the question again and test the option.'); }
      };
      list.appendChild(b);
    });
    root.appendChild(list);
    return { root: root, self: true, showAnswer: function () { done = true; list.children[T.ans].classList.add('yes'); }, freeze: function () { done = true; } };
  };
  K.number = function (T, o) {
    var root = H('div', 'hwrow'), inp = el('input', { 'class': 'hwin', inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'Your answer' });
    root.appendChild(inp); if (T.unit) root.appendChild(H('span', '', fmt(T.unit)));
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') o.check(); });
    setTimeout(function () { try { inp.focus({ preventScroll: true }); } catch (e) { } }, 60);
    return { root: root,
      check: function () { var v = num(inp.value); if (isNaN(v)) { SFA.toast('Type a number (fractions like 3/4 are fine).'); return null; } return { ok: near(v, T.ans, T.tol), msg: T.hint || 'Not yet. Check each step.' }; },
      showAnswer: function () { inp.value = txtNum(T.ans); }, freeze: function () { inp.disabled = true; } };
  };
  K.pair = function (T, o) {
    var root = H('div', 'hwrow'), a = el('input', { 'class': 'hwin sm', inputmode: 'decimal', 'aria-label': 'x' }), b = el('input', { 'class': 'hwin sm', inputmode: 'decimal', 'aria-label': 'y' });
    root.appendChild(H('span', '', '<b style="font-size:22px">(</b>')); root.appendChild(a); root.appendChild(H('span', '', '<b style="font-size:22px">,</b>')); root.appendChild(b); root.appendChild(H('span', '', '<b style="font-size:22px">)</b>'));
    [a, b].forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') o.check(); }); });
    return { root: root,
      check: function () { var x = num(a.value), y = num(b.value); if (isNaN(x) || isNaN(y)) { SFA.toast('Type both numbers.'); return null; } var okx = near(x, T.ans[0], T.tol), oky = near(y, T.ans[1], T.tol); return { ok: okx && oky, msg: (okx && !oky ? 'Your x is right. Check y. ' : !okx && oky ? 'Your y is right. Check x. ' : '') + (T.hint || 'Put your point into both equations: does it make both true?') }; },
      showAnswer: function () { a.value = txtNum(T.ans[0]); b.value = txtNum(T.ans[1]); }, freeze: function () { a.disabled = b.disabled = true; } };
  };
  K.fill = function (T, o) {
    var root = H('div', ''), tb = H('table', 'hwtab'), ins = [];
    tb.appendChild(H('tr', '', T.head.map(function (h) { return '<th>' + fmt(h) + '</th>'; }).join('')));
    T.rows.forEach(function (r) {
      var tr = H('tr', '');
      r.forEach(function (c) {
        var td = H('td', '');
        if (c && typeof c === 'object') { var i = el('input', { 'class': 'hwin sm', inputmode: 'decimal', 'aria-label': 'blank' }); i._a = c.a; i._tol = c.tol; ins.push(i); td.appendChild(i); i.addEventListener('keydown', function (e) { if (e.key === 'Enter') o.check(); }); }
        else td.innerHTML = fmt(typeof c === 'number' ? txtNum(c) : c);
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    root.appendChild(tb);
    return { root: root,
      check: function () {
        if (ins.some(function (i) { return i.value.trim() === ''; })) { SFA.toast('Fill every blank first.'); return null; }
        var bad = 0; ins.forEach(function (i) { var ok = near(num(i.value), i._a, i._tol); i.style.borderColor = ok ? 'var(--teal)' : 'var(--red)'; if (!ok) bad++; });
        return { ok: !bad, msg: (bad ? bad + ' blank' + (bad > 1 ? 's are' : ' is') + ' not right yet (red). ' : '') + (T.hint || '') };
      },
      showAnswer: function () { ins.forEach(function (i) { i.value = txtNum(i._a); i.style.borderColor = 'var(--marquee)'; }); }, freeze: function () { ins.forEach(function (i) { i.disabled = true; }); } };
  };

  /* ---------- screens ---------- */
  function hero(sub) {
    var h = H('div', 'hwhero');
    var l = H('div', ''); l.appendChild(H('div', 'hwkick', 'Homework · Unit ' + G.unit + ' · Lesson ' + G.lesson + ' · ' + esc(G.topic)));
    l.appendChild(H('h1', 'hwtitle', esc(G.title))); if (sub) l.appendChild(H('p', 'hwsub', fmt(sub)));
    var m = H('div', 'hwmeter');
    var stars = 0; for (var k in P.stars) stars += P.stars[k] || 0;
    m.appendChild(H('div', 'hwstat', '<b id="hwCoins">' + totalCoins() + '</b><small>coins</small>'));
    m.appendChild(H('div', 'hwstat', '<b>' + stars + '/' + 3 * G.levels.length + '</b><small>stars</small>'));
    m.appendChild(H('div', 'hwstat' + (cur && cur.streak >= 3 ? ' hot' : ''), '<b id="hwStreak">' + (cur ? cur.streak : 0) + '</b><small>streak</small>'));
    h.appendChild(l); h.appendChild(m); return h;
  }
  var FACE = { gus: ['G', '#FFD84D'], priya: ['P', '#C99BFF'], marcus: ['M', '#FF7A6B'], zero: ['0', '#FFA23A'], one: ['1', '#FF5A5A'] };
  function home() {
    cur = null; app.innerHTML = ''; window.scrollTo(0, 0);
    app.appendChild(hero(G.goal));
    var c = H('div', 'hwcard'), st = H('div', 'hwstory'), f = FACE[G.who] || FACE.gus;
    var face = H('div', 'hwface', f[0]); face.style.background = f[1]; st.appendChild(face);
    var tx = H('div', ''); tx.appendChild(H('div', 'who', esc((G.who || 'gus').toUpperCase()))); (Array.isArray(G.intro) ? G.intro : [G.intro]).forEach(function (p) { tx.appendChild(H('p', '', fmt(p))); }); st.appendChild(tx);
    c.appendChild(st);
    var pct = Math.round(100 * Object.keys(P.done).filter(function (k) { return P.done[k]; }).length / G.levels.length), bar = H('div', 'hwbar'), bi = H('i'); bi.style.width = pct + '%'; bar.appendChild(bi); c.appendChild(bar);
    c.appendChild(H('p', 'hwtiny', pct + '% done · Each level is a few questions. Right first time earns 3 coins. Get stuck? A wrong try gives you a hint.'));
    app.appendChild(c);
    var map = H('div', 'hwmap');
    G.levels.forEach(function (L, i) {
      var id = 'L' + (i + 1), open = i === 0 || P.done['L' + i] || P.done[id], s = P.stars[id] || 0;
      var b = el('button', { type: 'button', 'class': 'hwlv' + (L.boss ? ' boss' : '') + (P.done[id] ? ' done' : '') }); b.disabled = !open;
      b.innerHTML = '<span class="n">' + (L.boss ? 'Boss level' : 'Level ' + (i + 1)) + ' · ' + L.tasks.length + ' questions</span><b>' + esc(L.name) + '</b>' + (open ? '<span class="st">' + '★★★'.slice(0, s) + '<i>' + '★★★'.slice(s) + '</i></span>' : '<span class="lock">🔒 Finish level ' + i + ' first</span>');
      b.onclick = function () { play(i); };
      map.appendChild(b);
    });
    app.appendChild(map);
    var all = G.levels.every(function (L, i) { return P.done['L' + (i + 1)]; });
    if (all) { var e = H('div', 'hwcard hwend'); e.appendChild(H('p', '', 'You finished every level. Replay any level to raise your stars.')); e.appendChild(btn('🏅 Show my certificate', 'primary', finish)); app.appendChild(e); }
  }
  function play(li) {
    var L = G.levels[li];
    cur = { li: li, ti: 0, coins: 0, results: [], streak: cur ? cur.streak : 0 };
    task();
  }
  function task() {
    var L = G.levels[cur.li], T = L.tasks[cur.ti];
    app.innerHTML = ''; window.scrollTo(0, 0);
    app.appendChild(hero());
    var c = H('div', 'hwcard'), top = H('div', 'hwtop');
    top.appendChild(H('h2', '', (L.boss ? 'Boss · ' : 'Level ' + (cur.li + 1) + ' · ') + esc(L.name)));
    var dots = H('div', 'hwdots'); L.tasks.forEach(function (t, i) { var d = H('i'); if (i < cur.results.length) d.className = cur.results[i] >= 3 ? 'ok' : 'meh'; else if (i === cur.ti) d.className = 'now'; dots.appendChild(d); }); top.appendChild(dots);
    c.appendChild(top);
    if (cur.ti === 0 && L.learn) { var lb = H('div', 'hwlearn'); lb.innerHTML = '<h3>Remember from the lesson</h3><ul>' + L.learn.map(function (l) { return '<li>' + fmt(l) + '</li>'; }).join('') + '</ul>'; c.appendChild(lb); }
    var q = H('p', 'hwq', fmt(T.q || (T.k === 'solve' ? 'Solve it one move at a time.' : '')));
    c.appendChild(q);
    var box = H('div', 'hwtask'); extras(T, box); c.appendChild(box);
    var fb = H('div', ''), slips = 0, finished = false, w;
    var o = {
      id: G.id + 'L' + cur.li + 't' + cur.ti, show: false,
      done: function (tries) { if (finished) return; var s = typeof tries === 'number' ? tries - 1 : slipsOf(tries); award(Math.max(1, 3 - Math.max(s, slips)), true); },
      miss: function (msg) { slips++; cur.streak = 0; upd(); fb.className = 'hwfb try'; fb.innerHTML = fmt(msg); sfx('wrong'); },
      check: function () { doCheck(); }
    };
    function slipsOf(ans) { var m = String(ans || '').match(/\((\d+) slip/); return m ? +m[1] : 0; }
    function upd() { var s = document.getElementById('hwStreak'); if (s) s.textContent = cur.streak; var cn = document.getElementById('hwCoins'); if (cn) cn.textContent = totalCoins() + cur.coins; }
    T = mixed(T, o.id);
    if (IQK[T.k]) {
      var spec = Object.assign({}, T); delete spec.q;
      w = IQ.W[T.k](spec, { id: o.id, show: false, done: function (ans, ok) { o.done(ans); } });
    } else w = K[T.k](T, o);
    box.appendChild(w.root);
    var ctl = H('div', 'hwrow');
    var chk = btn('Check', 'primary', doCheck);
    if (!w.self) ctl.appendChild(chk);
    c.appendChild(ctl); c.appendChild(fb);
    app.appendChild(c);
    function doCheck() {
      if (finished || w.self) return;
      var r = w.check(); if (!r) return;
      if (r.ok) { w.freeze(true); award(Math.max(1, 3 - slips), true); }
      else {
        slips++; cur.streak = 0; upd(); sfx('wrong');
        if (slips >= 3) { w.showAnswer(); w.freeze(false); fb.className = 'hwfb show'; fb.innerHTML = '<b>Here is the answer.</b> ' + fmt(T.why || '') + ' Look at it, then carry on. (0 coins this time.)'; award(0, false); }
        else { fb.className = 'hwfb try'; fb.innerHTML = fmt(r.msg || T.hint || 'Not yet.') + (slips === 2 ? ' <b>Last try before the answer.</b>' : ''); }
      }
    }
    function award(n, ok) {
      if (finished) return; finished = true; chk.remove();
      cur.coins += n; cur.results.push(n); if (n >= 3) cur.streak++; else if (n === 0) cur.streak = 0; upd();
      if (ok) {
        fb.className = 'hwfb good'; fb.innerHTML = '<b>' + (n >= 3 ? ['Nailed it!', 'Spot on!', 'Clean!', 'Yes!'][cur.ti % 4] : 'Got it.') + '</b> +' + n + ' coin' + (n === 1 ? '' : 's') + (cur.streak >= 3 ? ' · 🔥 ' + cur.streak + ' in a row' : '') + (T.why ? '<br>' + fmt(T.why) : '');
        sfx(n >= 3 ? 'coin' : 'tick'); if (n >= 3) fx('pop', fb);
      }
      var last = cur.ti === L.tasks.length - 1;
      var nb = btn(last ? 'Finish the level ▶' : 'Next question ▶', 'primary hwnext', function () { if (last) levelDone(); else { cur.ti++; task(); } });
      c.appendChild(nb); setTimeout(function () { try { nb.focus({ preventScroll: true }); nb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { } }, 80);
    }
  }
  function levelDone() {
    var L = G.levels[cur.li], id = 'L' + (cur.li + 1), max = 3 * L.tasks.length, pct = cur.coins / max;
    var stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
    P.done[id] = true; P.stars[id] = Math.max(P.stars[id] || 0, stars); P.coins[id] = Math.max(P.coins[id] || 0, cur.coins); save();
    app.innerHTML = ''; window.scrollTo(0, 0); app.appendChild(hero());
    var c = H('div', 'hwcard hwend');
    c.appendChild(H('p', 'hwkick', (L.boss ? 'Boss level' : 'Level ' + (cur.li + 1)) + ' complete'));
    c.appendChild(H('div', 'big', '★★★'.slice(0, stars) + '<span style="color:#4a445e">' + '★★★'.slice(stars) + '</span>'));
    c.appendChild(H('p', '', esc(L.name) + ': <b>' + cur.coins + '</b> of ' + max + ' coins.' + (stars < 3 ? ' Replay it any time for three stars.' : ' Perfect run.')));
    sfx('levelup'); if (stars === 3) fx('confetti');
    var row = H('div', 'hwrow'); row.style.justifyContent = 'center';
    var nextI = cur.li + 1;
    if (nextI < G.levels.length) row.appendChild(btn('Next level ▶', 'primary', function () { play(nextI); }));
    else row.appendChild(btn('🏅 Get my certificate', 'primary', finish));
    row.appendChild(btn('Replay this level', '', function () { play(cur.li); }));
    row.appendChild(btn('All levels', '', home));
    c.appendChild(row); app.appendChild(c);
  }
  function finish() {
    app.innerHTML = ''; window.scrollTo(0, 0); cur = null; app.appendChild(hero());
    var stars = 0; for (var k in P.stars) stars += P.stars[k] || 0;
    var me = SFA.sync && SFA.sync.me, name = me && (me.name || me.n) ? String(me.name || me.n) : '';
    if (name.indexOf(',') >= 0) { var pp = name.split(','); name = pp[1].trim().split(' ')[0] + ' ' + pp[0].trim(); }
    var c = H('div', 'hwcard hwend');
    c.appendChild(H('div', 'big', 'Homework done!'));
    var cert = H('div', 'hwcert');
    cert.innerHTML = '<p class="hwtiny" style="color:#55505f">Sandy Flats Homework Arcade</p><h3>' + esc(G.title) + '</h3><p>Unit ' + G.unit + ' · Lesson ' + G.lesson + ': ' + esc(G.topic) + '</p>' +
      (name ? '<p style="font:400 26px var(--hand)">' + esc(name) + '</p>' : '<p><label>Your name: <input class="hwin" style="background:#fff;color:#1b1a22;width:12em" aria-label="Your name"></label></p>') +
      '<p class="stars">' + stars + ' / ' + 3 * G.levels.length + ' ★</p><p>' + totalCoins() + ' of ' + maxCoins() + ' coins · ' + new Date().toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' }) + '</p>' +
      (G.bigIdea ? '<p style="font-style:italic">“' + fmt(G.bigIdea) + '”</p>' : '');
    c.appendChild(cert);
    c.appendChild(H('p', 'hwtiny', SFA.sync && SFA.sync.on && SFA.sync.me ? 'Saved to your results. Your teacher can see it.' : 'Not signed in: take a screenshot of this certificate to show your teacher.'));
    var row = H('div', 'hwrow'); row.style.justifyContent = 'center'; row.appendChild(btn('All levels', '', home)); row.appendChild(el('a', { 'class': 'btn', href: 'homework.html', text: 'More homework' })); c.appendChild(row);
    app.appendChild(c); fx('confetti'); sfx('levelup');
  }

  // for the checker (hw-check.js): open any task directly
  window.SFA_HW_JUMP = function (li, ti) { cur = { li: li, ti: ti, coins: 0, results: [], streak: 0 }; task(); };
  window.SFA_HW = function (def) {
    G = def; load();
    document.title = G.title + ' · Homework · Sandy Flats';
    var gt = document.getElementById('hwGame'); if (gt) gt.textContent = G.title;
    home();
  };
  if (!/^u[34]-\d\d$/.test(key)) { app.innerHTML = '<div class="hwcard"><h2>Pick a homework game</h2><p><a href="homework.html">All homework games</a></p></div>'; return; }
  var s = document.createElement('script'); s.src = 'hw/' + key + '.js?v=20261127b';
  s.onerror = function () { app.innerHTML = '<div class="hwcard"><h2>That homework isn\'t here yet</h2><p><a href="homework.html">All homework games</a></p></div>'; };
  document.head.appendChild(s);
})();
