/* Show-Off: the avatar stage show (showoff-u2.html). The student's own arcade avatar is the star: it walks the runway (a number
   line) and poses on the photo floor (the coordinate plane), cheers when an answer is right and stumbles when it's wrong, in
   front of an audience of classmates' avatars. The show ends with a curtain call and the podium.
   The questions and the scoring live in showoff-sim.js (shared with the results script). A show is kept in this browser as its
   seed and answers; every screen rebuilds it from those.
   The leaderboard: a finished show is sent as seed + answers (op showoffSave, signed in) and the script marks it itself;
   the board (op showoffBoard) needs no sign-in and shows each player's best show this week, first names only, with their look. */
(function () {
  'use strict';
  var SFA = window.SFA, el = SFA.el, S = SFA.sync, CFG = window.SFA_CONFIG || {}, SO = window.showoffSim(), AV = window.SFA_AVATAR, FX = window.SFA_FX;
  var app = document.getElementById('so'), KEY = 'showoff.show', NOW = SO.season(new Date()), SCREEN = /[?&]screen\b/.test(location.search);
  var run = loadRun(), crowd = null, crowdAsked = false;

  function newSeed() {
    var A = 'abcdefghijklmnopqrstuvwxyz0123456789', s = '', c = null;
    try { c = window.crypto.getRandomValues(new Uint32Array(10)); } catch (e) { }
    for (var i = 0; i < 10; i++) s += A.charAt((c ? c[i] : Math.floor(Math.random() * 1e9)) % 36);
    return s;
  }
  function blank() { return { seed: newSeed(), season: NOW, ans: [], started: false, posted: null, cheered: false }; }
  function loadRun() {
    var r = SFA.store.get(KEY, null);
    if (!r || !r.seed || !Array.isArray(r.ans)) return blank();
    // a show from an earlier week: keep it only while it is finished, unposted and still postable
    if (r.season !== NOW && !(r.ans.length === SO.LOOKS && !r.posted && SO.seasonsNow(new Date()).indexOf(r.season) >= 0)) return blank();
    return r;
  }
  function save() { SFA.store.set(KEY, run); }

  /* ---------- small helpers ---------- */
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function html(tag, cls, h) { var e = el(tag, cls ? { 'class': cls } : null); e.innerHTML = h; return e; }
  function sfx(n) { if (FX) FX.sfx(n); }
  function first(n) { n = String(n || ''); return (n.indexOf(',') >= 0 ? n.split(',')[1] : n).trim().split(' ')[0] || n; }
  function nb(t) { return String(t).replace(/ /g, ' '); }   // an inequality never breaks across lines
  function myLook() { if (!AV) return ''; try { return AV.myLook(AV.profile(), S && S.me ? S.me.sid : 'guest'); } catch (e) { return ''; } }
  function myName() { if (S && S.me) return first(S.me.name); try { return AV ? AV.firstName() : 'You'; } catch (e) { return 'You'; } }
  function avSvg(look, size, label, o) {
    if (!AV || !look) return '';
    try { o = o || {}; return AV.svg(look, { size: size, label: label || 'Avatar', walk: !!o.walk, still: !!o.still, bg: !!o.bg }); } catch (e) { return ''; }
  }
  // made-up fans fill empty seats: the same faces for a given seed
  function fanLook(seed) {
    if (!AV) return '';
    var C = AV.CAT, h = AV.hash(seed);
    function R() { h = (Math.imul(h ^ (h >>> 15), 2246822507) + 0x6D2B79F5) >>> 0; return h / 4294967296; }
    function p(k, q) { return C[k] && R() < (q == null ? 1 : q) ? Math.floor(R() * C[k].items.length) : 0; }
    return AV.encode({ b: p('b'), e: p('e'), m: p('m'), h: p('h', .4), a: p('a', .3), t: 0, n: 0, k: p('k'), p: p('p', .15), r: p('r', .5), c: p('c'), o: p('o', .5), q: p('q') });
  }
  function state() {
    var m = SO.mark(run.seed, run.ans), streak = 0;
    for (var i = run.ans.length - 1; i >= 0 && m.marks[i]; i--) streak++;
    return { score: m.score, right: m.right, best: m.best, streak: streak, marks: m.marks };
  }

  /* ---------- the public board (no sign-in needed) ---------- */
  function ask(body) {
    var c = SFA.store.get('sync.cred', null);
    if (c && c.kind === 'code') body.code = c.code; else if (c && c.kind === 'google') body.idToken = c.token;
    return fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), redirect: 'follow' })
      .then(function (r) { return r.text(); }).then(function (t) { var j = JSON.parse(t); if (!j.ok) throw new Error(j.error || 'failed'); return j; });
  }
  // tonight's audience: classmates from this week's board (their own looks), then fans
  function getCrowd(done) {
    if (crowd) return done(crowd);
    if (!CFG.endpoint || crowdAsked) return done(seats([]));
    crowdAsked = true;
    ask({ op: 'showoffBoard', season: NOW }).then(function (j) { crowd = seats((j.rows || []).filter(function (r) { return !r.me && r.look; })); done(crowd); }, function () { crowd = seats([]); done(crowd); });
  }
  function seats(rows) {
    var out = rows.slice(0, 9).map(function (r) { return { look: r.look, name: r.name }; });
    for (var i = 0; out.length < 9; i++) out.push({ look: fanLook(run.seed + '|fan' + i), name: '' });
    return out;
  }

  /* ---------- the runway (Acts 1 and 2): a number line from −8 to 8 ---------- */
  var RW = 700, RH = 300, BASE = 226;
  function RX(v) { return 350 + v * 39; }
  function runway(o) {
    o = o || {};
    var s = '<svg class="floor runway" viewBox="0 0 ' + RW + ' ' + RH + '" role="img" aria-label="' + esc(o.label || 'The runway: a number line from −8 to 8') + '">';
    s += '<defs><linearGradient id="soBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6C8" stop-opacity=".0"/><stop offset="1" stop-color="#FFE27A" stop-opacity=".38"/></linearGradient>' +
      '<filter id="soGlow" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="5"/></filter></defs>';
    s += '<path d="M10 ' + (BASE + 8) + 'L690 ' + (BASE + 8) + 'L700 ' + RH + 'L0 ' + RH + 'z" class="rwboard"/>';
    if (o.light) s += lit(o.light);
    s += '<line x1="18" y1="' + BASE + '" x2="682" y2="' + BASE + '" class="rwax"/><path d="M8 ' + BASE + 'l12 -7v14z M692 ' + BASE + 'l-12 -7v14z" class="rwah"/>';
    for (var v = -SO.RUN; v <= SO.RUN; v++) {
      s += '<line x1="' + RX(v) + '" y1="' + (BASE - 8) + '" x2="' + RX(v) + '" y2="' + (BASE + 8) + '" class="rwtk' + (v === 0 ? ' z' : '') + '"/>';
      s += '<text x="' + RX(v) + '" y="' + (BASE + 36) + '" class="rwtl' + (v === 0 ? ' z' : '') + '">' + SO.n(v) + '</text>';
    }
    if (o.light) s += dot(o.light);
    if (o.ghost != null) s += '<g class="ghost"><circle cx="' + RX(o.ghost) + '" cy="' + BASE + '" r="15"/><text x="' + RX(o.ghost) + '" y="' + (BASE - 22) + '">here</text></g>';
    if (o.stops) for (var w = -SO.RUN; w <= SO.RUN; w++) s += '<rect class="hit" data-v="' + w + '" x="' + (RX(w) - 19.5) + '" y="40" width="39" height="' + (RH - 40) + '"/>';
    s += '<circle class="sel" cx="-99" cy="' + BASE + '" r="13"/>';
    return s + '<g class="mepos"></g></svg>';
  }
  function lit(P) {
    var x = RX(P.at), end = P.dir === 'r' ? 690 : 10;
    return '<polygon class="beam" points="' + (x + (P.dir === 'r' ? 30 : -30)) + ',0 ' + (end + (P.dir === 'r' ? -60 : 60)) + ',0 ' + end + ',' + BASE + ' ' + x + ',' + BASE + '"/>' +
      '<line x1="' + x + '" y1="' + BASE + '" x2="' + end + '" y2="' + BASE + '" class="litglow" filter="url(#soGlow)"/><line x1="' + x + '" y1="' + BASE + '" x2="' + (P.dir === 'r' ? end - 6 : end + 6) + '" y2="' + BASE + '" class="litline"/>' +
      '<path d="' + (P.dir === 'r' ? 'M700 ' + BASE + 'l-18 -11v22z' : 'M0 ' + BASE + 'l18 -11v22z') + '" class="lithead"/>';
  }
  function dot(P) { return '<circle cx="' + RX(P.at) + '" cy="' + BASE + '" r="11" class="litdot' + (P.open ? ' open' : '') + '"/>'; }
  // a little runway for an answer choice
  function miniLine(P) {
    var X = function (v) { return 120 + v * 17; }, x = X(P.at), end = P.dir === 'r' ? 232 : 8, s = '<svg class="mini ml" viewBox="0 0 240 58" aria-hidden="true">';
    s += '<line x1="6" y1="22" x2="234" y2="22" class="rwax"/>';
    for (var v = -6; v <= 6; v++) s += '<line x1="' + X(v) + '" y1="17" x2="' + X(v) + '" y2="27" class="rwtk"/>';
    [-5, 0, 5, P.at].forEach(function (v) { if (Math.abs(v) <= 6) s += '<text x="' + X(v) + '" y="48" class="rwtl' + (v === P.at ? ' key' : '') + '">' + SO.n(v) + '</text>'; });
    s += '<line x1="' + x + '" y1="22" x2="' + end + '" y2="22" class="litline"/><path d="' + (P.dir === 'r' ? 'M238 22l-11 -7v14z' : 'M2 22l11 -7v14z') + '" class="lithead"/>';
    return s + '<circle cx="' + x + '" cy="22" r="7" class="litdot' + (P.open ? ' open' : '') + '"/></svg>';
  }
  function describeLine(P) { return (P.open ? 'open' : 'closed') + ' dot at ' + SO.n(P.at) + ', lit to the ' + (P.dir === 'r' ? 'right' : 'left'); }

  /* ---------- the photo floor (Act 3): the plane from −5 to 5 ---------- */
  var FW = 420, U = 36, LIM = 5.5;
  function FX_(x) { return 210 + x * U; }
  function FY(y) { return 210 - y * U; }
  // the part of the floor where y (op) m·x + b, as a polygon (clipping the floor square)
  function half(poly, m, b, above) {
    var out = [], f = function (p) { return (p[1] - (m * p[0] + b)) * (above ? 1 : -1); };
    for (var i = 0; i < poly.length; i++) {
      var P = poly[i], Q = poly[(i + 1) % poly.length], fp = f(P), fq = f(Q);
      if (fp >= 0) out.push(P);
      if ((fp >= 0) !== (fq >= 0)) { var t = fp / (fp - fq); out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]); }
    }
    return out;
  }
  var SQUARE = [[-LIM, -LIM], [LIM, -LIM], [LIM, LIM], [-LIM, LIM]];
  function region(lines) { var p = SQUARE; lines.forEach(function (L) { p = half(p, L.m, L.b, SO.up(L.op)); }); return p; }
  function polyPts(p, X, Y) { return p.map(function (q) { return X(q[0]).toFixed(1) + ',' + Y(q[1]).toFixed(1); }).join(' '); }
  function seg(m, b, X, Y) {   // the part of y = m·x + b on the floor
    var x1 = -LIM, x2 = LIM;
    if (m) { var xa = (-LIM - b) / m, xb = (LIM - b) / m; x1 = Math.max(x1, Math.min(xa, xb)); x2 = Math.min(x2, Math.max(xa, xb)); }
    else if (Math.abs(b) > LIM) return '';
    if (x1 >= x2) return '';
    return 'x1="' + X(x1).toFixed(1) + '" y1="' + Y(m * x1 + b).toFixed(1) + '" x2="' + X(x2).toFixed(1) + '" y2="' + Y(m * x2 + b).toFixed(1) + '"';
  }
  function photoFloor(o) {
    o = o || {};
    var s = '<svg class="floor plane" viewBox="0 0 ' + FW + ' ' + FW + '" role="img" aria-label="' + esc(o.label || 'The photo floor: a grid from −5 to 5 on both axes') + '">';
    s += '<rect x="' + FX_(-LIM) + '" y="' + FY(LIM) + '" width="' + (2 * LIM * U) + '" height="' + (2 * LIM * U) + '" class="flbg" rx="6"/>';
    if (o.shade) s += '<polygon class="shade' + (o.shade.length > 1 ? ' both' : '') + '" points="' + polyPts(region(o.shade), FX_, FY) + '"/>';
    for (var k = -5; k <= 5; k++) s += '<line x1="' + FX_(k) + '" y1="' + FY(LIM) + '" x2="' + FX_(k) + '" y2="' + FY(-LIM) + '" class="gl"/><line x1="' + FX_(-LIM) + '" y1="' + FY(k) + '" x2="' + FX_(LIM) + '" y2="' + FY(k) + '" class="gl"/>';
    s += '<line x1="' + FX_(-LIM) + '" y1="' + FY(0) + '" x2="' + FX_(LIM) + '" y2="' + FY(0) + '" class="flax"/><line x1="' + FX_(0) + '" y1="' + FY(LIM) + '" x2="' + FX_(0) + '" y2="' + FY(-LIM) + '" class="flax"/>';
    for (var t = -5; t <= 5; t++) if (t) s += '<text x="' + FX_(t) + '" y="' + (FY(0) + 15) + '" class="fltl">' + SO.n(t) + '</text><text x="' + (FX_(0) - 7) + '" y="' + (FY(t) + 4) + '" class="fltl y">' + SO.n(t) + '</text>';
    s += '<text x="' + (FX_(LIM) - 2) + '" y="' + (FY(0) - 8) + '" class="flv">x</text><text x="' + (FX_(0) + 9) + '" y="' + (FY(LIM) + 12) + '" class="flv">y</text>';
    (o.lines || []).forEach(function (L, i) {
      var g = seg(L.m, L.b, FX_, FY); if (!g) return;
      s += '<line ' + g + ' class="bline c' + i + (L.dashed ? ' dashed' : '') + '"/>';
    });
    if (o.mark) s += '<g class="ghost"><circle cx="' + FX_(o.mark[0]) + '" cy="' + FY(o.mark[1]) + '" r="11"/></g>';
    if (o.hits) for (var x = -5; x <= 5; x++) for (var y = -5; y <= 5; y++) s += '<rect class="hit" data-x="' + x + '" data-y="' + y + '" x="' + (FX_(x) - U / 2) + '" y="' + (FY(y) - U / 2) + '" width="' + U + '" height="' + U + '"/>';
    s += '<circle class="sel" cx="-99" cy="-99" r="10"/>';
    return s + '<g class="mepos"></g></svg>';
  }
  function miniPlane(line, opt) {
    var X = function (x) { return 60 + x * 10; }, Y = function (y) { return 60 - y * 10; }, sq = [[-5.5, -5.5], [5.5, -5.5], [5.5, 5.5], [-5.5, 5.5]];
    var s = '<svg class="mini mp" viewBox="0 0 120 120" aria-hidden="true"><rect x="5" y="5" width="110" height="110" class="flbg"/>';
    s += '<polygon class="shade" points="' + polyPts(half(sq, line.m, line.b, opt.above), X, Y) + '"/>';
    for (var k = -5; k <= 5; k++) s += '<line x1="' + X(k) + '" y1="5" x2="' + X(k) + '" y2="115" class="gl"/><line x1="5" y1="' + Y(k) + '" x2="115" y2="' + Y(k) + '" class="gl"/>';
    s += '<line x1="5" y1="60" x2="115" y2="60" class="flax"/><line x1="60" y1="5" x2="60" y2="115" class="flax"/>';
    var g = seg(line.m, line.b, X, Y);
    return s + (g ? '<line ' + g + ' class="bline' + (opt.solid ? '' : ' dashed') + '"/>' : '') + '</svg>';
  }
  function describePlane(o) { return (o.solid ? 'solid' : 'dashed') + ' line, shaded ' + (o.above ? 'above' : 'below'); }

  /* ---------- the star: your avatar on the floor ---------- */
  var FEET = 0.962;   // where the feet are, down the avatar picture
  function placeMe(svgEl, look, x, y, w, walkIn) {
    var g = svgEl.querySelector('.mepos'); if (!g) return null;
    var h = w * 184 / 160;
    if (!g.firstChild) {
      g.innerHTML = '<g class="mereact"><g class="mespot"><ellipse cx="' + (w / 2) + '" cy="' + (h * FEET) + '" rx="' + (w * .62) + '" ry="' + (w * .14) + '"/></g>' +
        (avSvg(look, w, myName() + ', the star of the show', { walk: false }) || '<text x="' + (w / 2) + '" y="' + (h * .7) + '" font-size="' + (w * .7) + '" text-anchor="middle">🌟</text>') + '</g>';
    }
    var t = 'translate(' + (x - w / 2).toFixed(1) + 'px,' + (y - h * FEET).toFixed(1) + 'px)';
    if (walkIn) { var av = g.querySelector('svg.av'); if (av) { av.classList.add('walk'); clearTimeout(g._w); g._w = setTimeout(function () { av.classList.remove('walk'); }, 720); } }
    g.style.transform = t;
    return g;
  }
  function react(svgEl, cls) {
    var r = svgEl.querySelector('.mereact'); if (!r) return;
    r.classList.remove('pose', 'trip', 'cheer'); void r.getBoundingClientRect(); r.classList.add(cls);
  }

  /* ---------- views ---------- */
  function view() {
    app.innerHTML = '';
    document.body.classList.toggle('so-screen', SCREEN);
    if (location.hash === '#board') return boardView();
    if (!run.started && !run.ans.length) return introView();
    if (run.ans.length < SO.LOOKS) return stageView(run.ans.length);
    finaleView();
  }
  window.addEventListener('hashchange', view);

  function signInBox(note) {
    if (!S || !S.on) return null;
    if (S.me) return el('p', { 'class': 'muted small', text: 'Signed in as ' + first(S.me.name) + '. Your finished shows go on the leaderboard, with your avatar.' });
    var box = el('div', { 'class': 'card signin' }, [el('b', { text: note || 'Sign in to get your avatar on the podium' }), el('p', { 'class': 'muted small', text: 'You can play without signing in, but only signed-in shows are posted.' })]);
    S.button(box);
    return box;
  }

  function introView() {
    var look = myLook();
    var go = el('button', { type: 'button', 'class': 'btn primary big', text: '🎬 Start the show', onclick: function () { run.started = true; save(); sfx('whoosh'); view(); } });
    var hero = el('section', { 'class': 'card hero so-hero' }, [
      html('div', 'herostar', (AV ? AV.card({ size: 'l', tag: 'Tonight\'s star', walk: false }) : '') ),
      el('div', {}, [
        el('h2', { text: 'The show is about you' }),
        el('p', { text: 'Ten looks, three acts, one star: your avatar. Walk the runway, change fast, then pose on the photo floor. Every look is an inequality. Get it right and you strike a pose for the cameras. Get it wrong and you stumble (the audience gasps), then see how it works.' }),
        el('p', { 'class': 'muted', text: 'Right answers in a row score more: 100, then 120, 140, up to 200. The best show this week takes the top of the podium, avatar and all.' }),
        el('div', { 'class': 'row' }, [go, el('a', { 'class': 'btn', href: 'avatar.html', text: '👕 Change my look first' }), el('a', { 'class': 'btn', href: '#board', text: '🏆 The podium' })])
      ])
    ]);
    app.appendChild(hero);
    app.appendChild(el('section', { 'class': 'card how' }, [
      el('h2', { text: 'Tonight\'s programme' }),
      el('ol', {}, [
        el('li', {}, [el('b', { text: 'Act 1, The Runway: ' }), 'the runway is a number line. Read the lights, then walk to the biggest or smallest whole number that works. Watch for the negative: dividing by one turns the sign.']),
        el('li', {}, [el('b', { text: 'Act 2, Quick Change: ' }), 'solve it (x on both sides too), then pick the right lights: open or closed dot, left or right.']),
        el('li', {}, [el('b', { text: 'Act 3, The Photo Floor: ' }), 'the floor is the coordinate plane. Pose where an inequality is true, test a point, pick the shading, and find the spot where two are true at once.'])
      ])
    ]));
    var aud = el('section', { 'class': 'card audience-card' }, [el('h2', { text: '🎟️ Tonight\'s audience' }), el('p', { 'class': 'muted small', text: 'Classmates who played this week come to watch (and their best show is on the podium).' })]);
    var row = el('div', { 'class': 'crowd big' }); aud.appendChild(row); app.appendChild(aud);
    getCrowd(function (c) { row.innerHTML = crowdHtml(c); });
    var sb = signInBox(); if (sb) app.appendChild(sb);
    if (!look) app.appendChild(el('p', { 'class': 'muted small', text: 'Your avatar didn\'t load, so a star stands in for it tonight.' }));
  }

  function crowdHtml(c) {
    return c.map(function (p, i) {
      return '<span class="fan" style="--d:' + (i * 70) + 'ms">' + (avSvg(p.look, 64, p.name ? p.name + '\'s avatar' : 'A fan', { still: true }) || '<i>🙂</i>') + (p.name ? '<b>' + esc(p.name) + '</b>' : '') + '</span>';
    }).join('');
  }

  /* ---------- one look on stage ---------- */
  function stageView(i) {
    var show = SO.show(run.seed), L = show[i], st = state(), look = myLook(), act = L.act, answered = false;
    var hud = el('div', { 'class': 'hud' }, [
      html('span', 'look', 'Look <b>' + (i + 1) + '</b>/' + SO.LOOKS),
      html('span', 'act', 'Act ' + act + ': ' + SO.ACTS[act]),
      html('span', 'sc', '⭐ <b id="soScore">' + st.score + '</b>'),
      html('span', 'stk' + (st.streak >= 2 ? ' on' : ''), '🔥 <b>' + st.streak + '</b> in a row')
    ]);
    var dots = el('div', { 'class': 'pips', 'aria-hidden': 'true' });
    for (var k = 0; k < SO.LOOKS; k++) dots.appendChild(el('i', { 'class': k < i ? (st.marks[k] ? 'ok' : 'no') : k === i ? 'now' : '' }));
    var isFloor = act === 3;
    var theatre = el('div', { 'class': 'theatre act' + act + (isFloor ? ' fl' : ''), tabindex: '-1' });
    theatre.appendChild(el('div', { 'class': 'curtain l', 'aria-hidden': 'true' })); theatre.appendChild(el('div', { 'class': 'curtain r', 'aria-hidden': 'true' }));
    theatre.appendChild(el('div', { 'class': 'valance', 'aria-hidden': 'true' }));
    var floorBox = el('div', { 'class': 'floorbox' }); theatre.appendChild(floorBox);
    var flash = el('div', { 'class': 'camflash', 'aria-hidden': 'true' }); theatre.appendChild(flash);
    var aud = el('div', { 'class': 'crowd', 'aria-label': 'The audience' }); theatre.appendChild(aud);
    getCrowd(function (c) { aud.innerHTML = crowdHtml(c); });

    var qbox = el('section', { 'class': 'card qbox' });
    var qtext = el('p', { 'class': 'q' }); qtext.innerHTML = qHtml(L); qbox.appendChild(qtext);
    var controls = el('div', { 'class': 'controls' }); qbox.appendChild(controls);
    var fb = el('div', { 'class': 'fb', 'aria-live': 'polite' }); qbox.appendChild(fb);

    app.appendChild(el('section', { 'class': 'card stagecard' }, [hud, dots, theatre]));
    app.appendChild(qbox);

    var svgEl, sel = null, W = isFloor ? 56 : 150;
    function draw(o) { floorBox.innerHTML = isFloor ? photoFloor(o) : runway(o); svgEl = floorBox.querySelector('svg'); }
    function standAt(pt, walk) {
      if (isFloor) placeMe(svgEl, look, FX_(pt[0]), FY(pt[1]), W, walk);
      else placeMe(svgEl, look, RX(pt), BASE, W, walk);
    }
    function lineOpts(lines) { return lines.map(function (M) { return { m: M.m, b: M.b, dashed: SO.strict(M.op) }; }); }
    var testLine = L.k === 'test' ? { m: -L.std.a / L.std.b, b: L.std.c / L.std.b, dashed: SO.strict(L.std.op) } : null;

    // first picture: what the look starts with
    if (L.k === 'read') draw({ light: L.pic, label: 'The runway is lit: ' + describeLine(L.pic) });
    else if (L.k === 'walk') draw({ stops: true });
    else if (L.k === 'solve' || L.k === 'graph') draw({});
    else if (L.k === 'pose') draw({ hits: true, lines: lineOpts(L.lines) });
    else if (L.k === 'test') draw({ lines: [testLine], label: 'The photo floor with the line ' + L.std.a + 'x + ' + L.std.b + 'y = ' + L.std.c + '; you stand at (' + L.pt[0] + ', ' + L.pt[1] + ')' });
    else draw({});
    // the star walks on from the wings
    if (L.k === 'test') { standAt([-5, -5]); setTimeout(function () { standAt(L.pt, true); }, 60); }
    else if (isFloor) { standAt([0, 0]); }
    else { standAt(-8); setTimeout(function () { standAt(0, true); }, 60); }

    /* the controls for each kind */
    var confirm = null, where = null;
    function choose(v, walk) {
      if (answered) return;
      sel = v; sfx('tap');
      var ring = svgEl.querySelector('.sel');
      if (L.k === 'walk') { ring.setAttribute('cx', RX(v)); where.textContent = 'You\'re standing at x = ' + SO.n(v); standAt(v, walk !== false); }
      else { ring.setAttribute('cx', FX_(v[0])); ring.setAttribute('cy', FY(v[1])); where.textContent = 'You\'re standing at (' + SO.n(v[0]) + ', ' + SO.n(v[1]) + ')'; standAt(v, walk !== false); }
      confirm.disabled = false;
    }
    if (L.k === 'walk' || L.k === 'pose') {
      where = el('span', { 'class': 'where', text: L.k === 'walk' ? 'Tap the runway to walk there.' : 'Tap a point on the floor to walk there.' });
      confirm = el('button', { type: 'button', 'class': 'btn primary big', disabled: 'disabled', text: L.k === 'walk' ? '📸 Strike a pose here' : '📸 Pose for the photo', onclick: function () { if (sel != null) submit(sel); } });
      var nudge = el('div', { 'class': 'nudge' });
      function nudgeBtn(txt, lab, dx, dy) { return el('button', { type: 'button', 'class': 'btn small', 'aria-label': lab, text: txt, onclick: function () { step(dx, dy); } }); }
      if (L.k === 'walk') { nudge.appendChild(nudgeBtn('◀', 'Step left', -1, 0)); nudge.appendChild(nudgeBtn('▶', 'Step right', 1, 0)); }
      else { nudge.appendChild(nudgeBtn('◀', 'Step left', -1, 0)); nudge.appendChild(nudgeBtn('▲', 'Step up', 0, 1)); nudge.appendChild(nudgeBtn('▼', 'Step down', 0, -1)); nudge.appendChild(nudgeBtn('▶', 'Step right', 1, 0)); }
      controls.appendChild(el('div', { 'class': 'row walkrow' }, [where, nudge, confirm]));
      floorBox.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('.hit') : null; if (!t) return;
        if (L.k === 'walk') choose(+t.getAttribute('data-v')); else choose([+t.getAttribute('data-x'), +t.getAttribute('data-y')]);
      });
      theatre.setAttribute('tabindex', '0'); theatre.setAttribute('aria-label', L.k === 'walk' ? 'The runway. Use the arrow keys to walk, Enter to pose.' : 'The photo floor. Use the arrow keys to walk, Enter to pose.');
      theatre.addEventListener('keydown', function (e) {
        var k = e.key, d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[k];
        if (d) { e.preventDefault(); step(d[0], d[1]); } else if (k === 'Enter' && sel != null) { e.preventDefault(); submit(sel); }
      });
    }
    function step(dx, dy) {
      if (answered) return;
      if (L.k === 'walk') { var v = sel == null ? 0 : sel + dx; choose(Math.max(-SO.RUN, Math.min(SO.RUN, v))); }
      else { var p = sel || [0, 0]; if (sel) p = [p[0] + dx, p[1] + dy]; choose([Math.max(-5, Math.min(5, p[0])), Math.max(-5, Math.min(5, p[1]))]); }
    }
    var optBtns = [];
    if (L.opts) {
      var grid = el('div', { 'class': 'opts ' + L.k });
      L.opts.forEach(function (o, j) {
        var inner, lab;
        if (L.k === 'graph') { inner = miniLine(o); lab = describeLine(o); }
        else if (L.k === 'shade') { inner = miniPlane(L.line, o); lab = describePlane(o); }
        else { inner = '<span class="iqt">' + esc(nb(o)) + '</span>'; lab = o; }
        var b = el('button', { type: 'button', 'class': 'opt', 'aria-label': lab, onclick: function () { submit(j); } });
        b.innerHTML = inner + (L.k === 'graph' || L.k === 'shade' ? '<span class="cap">' + esc(lab) + '</span>' : '');
        optBtns.push(b); grid.appendChild(b);
      });
      controls.appendChild(grid);
    }

    function submit(a) {
      if (answered) return; answered = true;
      var ok = SO.check(L, a), before = state(), pts = ok ? SO.pts(before.streak) : 0;
      run.ans.push(a); save();
      var after = state();
      optBtns.forEach(function (b, j) { b.disabled = true; if (j === L.ans) b.classList.add('right'); else if (j === a) b.classList.add('wrong'); });
      if (confirm) confirm.disabled = true;
      reveal(ok, a);
      document.getElementById('soScore').textContent = after.score;
      var stk = hud.querySelector('.stk'); stk.innerHTML = '🔥 <b>' + after.streak + '</b> in a row'; stk.classList.toggle('on', after.streak >= 2);
      dots.children[i].className = ok ? 'ok' : 'no';
      // the star and the audience react
      react(svgEl, ok ? 'pose' : 'trip');
      aud.classList.remove('cheer', 'gasp'); void aud.offsetWidth; aud.classList.add(ok ? 'cheer' : 'gasp');
      if (ok) {
        flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
        sfx(after.streak >= 3 ? 'combo' : 'right');
        var me = svgEl.querySelector('.mepos');
        if (FX && me) { FX.burst(me, { n: 16 }); FX.float(me, '+' + pts, { color: '#FFE27A', size: 30 }); }
      } else { sfx('wrong'); if (FX) FX.shake(theatre, { ms: 300 }); }
      var head = ok ? pick(['✨ Nailed it!', '📸 Picture perfect!', '🌟 Star quality!', '👏 The crowd goes wild!', '💃 Work it!']) + ' +' + pts + (before.streak ? ' (' + (before.streak + 1) + ' in a row)' : '')
        : pick(['😬 Oops, a stumble!', '🙈 Wardrobe malfunction!', '🫣 The crowd gasps!', '😵 Tripped on the runway!']);
      fb.innerHTML = '';
      fb.className = 'fb ' + (ok ? 'good' : 'bad');
      fb.appendChild(el('b', { 'class': 'fbh', text: head }));
      if (!ok) fb.appendChild(el('p', { text: wrongLine(L, a) }));
      var ol = el('ol', { 'class': 'why' }); L.why.forEach(function (w) { ol.appendChild(el('li', { text: w })); }); fb.appendChild(ol);
      var last = run.ans.length >= SO.LOOKS;
      var next = el('button', { type: 'button', 'class': 'btn primary big', text: last ? '🎭 Curtain call' : 'Next look ▶', onclick: function () { sfx('whoosh'); view(); window.scrollTo({ top: 0, behavior: 'smooth' }); } });
      fb.appendChild(next);
      setTimeout(function () { try { next.focus({ preventScroll: true }); fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { } }, 250);
    }
    // after an answer the floor shows the whole story: the lights or the shading, and where the right answer is
    function reveal(ok, a) {
      if (L.k === 'walk') { var m = L.sol.match(/x (\S) (\S+)/), c = Number(m[2].replace('−', '-')), op = m[1]; draw({ light: { at: c, open: SO.strict(op), dir: SO.up(op) ? 'r' : 'l' }, ghost: ok ? null : L.ans }); }
      else if (L.k === 'read') draw({ light: L.pic });
      else if (L.k === 'solve') { var s = L.opts[L.ans].match(/x (\S) (\S+)/); draw({ light: { at: Number(s[2].replace('−', '-')), open: SO.strict(s[1]), dir: SO.up(s[1]) ? 'r' : 'l' } }); }
      else if (L.k === 'graph') draw({ light: L.opts[L.ans] });
      else if (L.k === 'pose') draw({ lines: lineOpts(L.lines), shade: L.lines, mark: ok ? null : L.ex });
      else if (L.k === 'test') draw({ lines: [testLine], shade: [{ m: testLine.m, b: testLine.b, op: L.std.op === '<' || L.std.op === '≤' ? '≤' : '≥' }] });
      else if (L.k === 'shade') draw({ lines: [{ m: L.line.m, b: L.line.b, dashed: !L.opts[L.ans].solid }], shade: [{ m: L.line.m, b: L.line.b, op: L.opts[L.ans].above ? '≥' : '≤' }] });
      // the star stays where it was standing
      standAt(L.k === 'walk' || L.k === 'pose' ? a : L.k === 'test' ? L.pt : isFloor ? [0, 0] : 0, false);
    }
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function qHtml(L) {
    var q = esc(L.q);
    if (L.iq) q = q.replace(esc(L.iq), '<span class="iq">' + esc(nb(L.iq)) + '</span>');
    if (L.lines) L.lines.forEach(function (M, i) { var t = esc(SO.lineText(M)); q = q.replace(t, '<span class="iq c' + i + '">' + nb(t) + '</span>'); });
    return q;
  }
  function wrongLine(L, a) {
    if (L.k === 'walk') {
      if (L.flip && a === edgeOf(L, true)) return 'So close: that\'s the answer without turning the sign. Dividing by a negative turns it round.';
      return 'You walked to ' + SO.n(a) + '. The answer is ' + L.sol + ', so the ' + L.ask + ' whole number is ' + SO.n(L.ans) + '.';
    }
    if (L.k === 'pose') {
      var bad = L.lines.filter(function (M) { return !SO.inLine(M, a[0], a[1]); });
      var M = bad[0];
      if (!M) return 'That point isn\'t on the floor.';
      var v = M.m * a[0] + M.b;
      return 'At (' + SO.n(a[0]) + ', ' + SO.n(a[1]) + '): ' + SO.lineText(M) + ' says ' + SO.n(a[1]) + ' ' + M.op + ' ' + SO.n(v) + ', which is false' + (a[1] === v ? ' (you\'re on the dashed line, and that doesn\'t count)' : '') + '. One that works: (' + SO.n(L.ex[0]) + ', ' + SO.n(L.ex[1]) + ').';
    }
    if (L.k === 'solve') {
      var num = function (t) { return String(t).split(' ').pop(); };
      return 'The answer is ' + L.opts[L.ans] + '. ' + (num(L.opts[a]) === num(L.opts[L.ans]) ? 'Yours is what you get without turning the sign: dividing by a negative turns it round.' : 'Check the arithmetic, and turn the sign when you divide by a negative.');
    }
    if (L.k === 'graph') return 'It should be: ' + describeLine(L.opts[L.ans]) + '.';
    if (L.k === 'shade') return 'It should be: ' + describePlane(L.opts[L.ans]) + '.';
    if (L.k === 'read') return 'The lights show ' + L.opts[L.ans] + '.';
    if (L.k === 'test') return 'Here it\'s ' + (L.ans === 0 ? 'true, so you are in.' : 'false, so you are not in.');
    return '';
  }
  // the whole-number answer someone gets if they forget to turn the sign
  function edgeOf(L, wrongWay) {
    var m = L.sol.match(/x (\S) (\S+)/), c = Number(m[2].replace('−', '-')), op = m[1];
    if (wrongWay) op = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' }[op];
    return op === '<' ? c - 1 : op === '>' ? c + 1 : c;
  }

  /* ---------- the curtain call ---------- */
  function finaleView() {
    var st = state(), look = myLook();
    var star = el('section', { 'class': 'card finale' }, [
      html('div', 'bow', avSvg(look, 170, myName() + ', taking a bow') || '<span class="bigstar">🌟</span>'),
      el('div', { 'class': 'fin' }, [
        el('span', { 'class': 'k', text: '🎭 Curtain call' }),
        el('h2', { text: st.right >= 9 ? 'A standing ovation!' : st.right >= 7 ? 'Bravo! Encore!' : st.right >= 5 ? 'A solid show!' : 'Every star has an off night' }),
        html('div', 'bigscore', '<b id="soFinal">0</b><span> points</span>'),
        el('p', { text: st.right + ' of ' + SO.LOOKS + ' looks right · best run ' + st.best + ' in a row' }),
        el('div', { 'class': 'pips big', 'aria-label': st.marks.map(function (m, k) { return 'Look ' + (k + 1) + (m ? ' right' : ' wrong'); }).join(', ') }, st.marks.map(function (m) { return el('i', { 'class': m ? 'ok' : 'no' }); }))
      ])
    ]);
    app.appendChild(star);
    if (FX) FX.countUp(document.getElementById('soFinal'), 0, st.score, 1200); else document.getElementById('soFinal').textContent = st.score;
    if (!run.cheered) { run.cheered = true; save(); setTimeout(function () { sfx(st.right >= 6 ? 'win' : 'lose'); if (FX && st.right >= 6) FX.confetti({ ms: 3000 }); }, 300); }
    var bow = star.querySelector('.bow'); bow.classList.add(st.right >= 6 ? 'up' : 'down');

    var post = el('section', { 'class': 'card post' }, [el('h2', { text: '🏆 The podium' })]);
    app.appendChild(post);
    var again = el('div', { 'class': 'row' }, [
      el('button', { type: 'button', 'class': 'btn primary', text: '🎬 Another show', onclick: function () { run = blank(); run.started = true; save(); view(); window.scrollTo(0, 0); } }),
      el('a', { 'class': 'btn', href: 'avatar.html', text: '👕 New look for next time' }),
      el('a', { 'class': 'btn', href: '#board', text: '🏆 Full podium' })
    ]);
    function paint(msg, bad) {
      post.innerHTML = ''; post.appendChild(el('h2', { text: '🏆 The podium' }));
      post.appendChild(el('p', { 'class': bad ? 'warn' : '', text: msg }));
      if (!run.posted && S && S.on && !S.me) { var sb = signInBox('Sign in to put your avatar on the podium'); if (sb) post.appendChild(sb); }
      var pod = el('div', { 'class': 'podwrap' }); post.appendChild(pod);
      if (CFG.endpoint) loadPodium(pod, run.season, 0);
      post.appendChild(again);
    }
    function send() {
      if (!S || !S.on) return paint('The leaderboard isn\'t switched on here.');
      if (!S.me) return paint('Your show isn\'t on the podium: you aren\'t signed in.');
      paint('Posting your show…');
      var lk = myLook(); lk = AV && AV.fit ? AV.fit(lk, 80) : lk.slice(0, 80);   // a look with many newer parts is trimmed the wardrobe's way
      S.call('showoffSave', { season: run.season, v: SO.V, seed: run.seed, answers: run.ans, look: lk }).then(function (j) {
        run.posted = { score: j.score, rank: j.rank, best: j.best }; save();
        paint(postedText(run.posted));
      }, function (e) {
        if (/bad code|sign in|not on roster|school account/.test(e.message)) { S.signOut(); save(); paint('Your sign-in has stopped working, so the show has not been posted yet. Sign in again below: it posts straight away.', true); return; }
        var t = /old game/.test(e.message) ? 'The game was updated while you played. Reload the page and play again to post a show.' : /old week/.test(e.message) ? 'This show is from an earlier week, so it can\'t be posted.' : /slow down/.test(e.message) ? 'Too fast: wait a few seconds, then press Try again.' : /posted/.test(e.message) ? 'This show is already on the board.' : 'Couldn\'t reach the leaderboard. Check the internet and try again.';
        paint(t, true);
        if (!/posted|old/.test(e.message)) post.insertBefore(el('button', { type: 'button', 'class': 'btn', text: 'Try again', onclick: send }), again);
      });
    }
    if (run.posted) paint(postedText(run.posted));
    else send();
    if (S && S.on && !run.posted) { var was = !!S.me; S.onChange(function (s) { var now = !!s.me; if (now && !was && location.hash !== '#board' && !run.posted && app.contains(post)) send(); was = now; }); }
  }
  function postedText(p) { return 'Posted: ' + p.score + ' points. Your best this week is ' + p.best + (p.rank ? ', number ' + p.rank + ' on the board.' : '.'); }

  /* ---------- the podium and the line-up (the end of a show and #board) ---------- */
  function loadPodium(host, season, lastWeek) {
    host.innerHTML = '<p class="muted">Loading the podium…</p>';
    ask({ op: 'showoffBoard', season: season }).then(function (j) {
      host.innerHTML = '';
      if (!j.rows.length) { host.appendChild(el('p', { text: 'No shows yet ' + (lastWeek ? 'last week' : 'this week') + '. Be the first star on the podium!' })); return; }
      host.appendChild(podium(j.rows));
      var rest = j.rows.filter(function (r) { return r.rank > 3; });
      if (rest.length) host.appendChild(lineup(rest));
      host.appendChild(el('p', { 'class': 'muted small', text: j.players + ' player' + (j.players === 1 ? '' : 's') + ' ' + (lastWeek ? 'last week' : 'this week') + '. Best show each, first names only.' + (j.me && !j.rows.some(function (r) { return r.me; }) ? ' You: number ' + j.me.rank + ' with ' + j.me.score + '.' : '') }));
    }, function () { host.innerHTML = ''; host.appendChild(el('p', { 'class': 'warn', text: 'Couldn\'t load the podium. Check the internet and try again.' })); });
  }
  function podium(rows) {
    var top = [rows.filter(function (r) { return r.rank === 2; })[0], rows.filter(function (r) { return r.rank === 1; })[0], rows.filter(function (r) { return r.rank === 3; })[0]];
    // ties share a rank: fill the empty steps from the order the board gave
    var used = top.filter(Boolean), spare = rows.slice(0, 3).filter(function (r) { return used.indexOf(r) < 0; });
    top = top.map(function (r) { return r || spare.shift() || null; });
    var box = el('div', { 'class': 'podium', role: 'list', 'aria-label': 'The top three' });
    top.forEach(function (r, k) {
      var step = ['p2', 'p1', 'p3'][k];
      if (!r) { box.appendChild(el('div', { 'class': 'pod empty ' + step })); return; }
      var d = el('div', { 'class': 'pod ' + step + (r.me ? ' me' : ''), role: 'listitem' });
      d.innerHTML = '<div class="pav">' + (avSvg(r.look, step === 'p1' ? 132 : 104, r.name + '\'s avatar') || '<span class="bigstar">🌟</span>') + '</div>' +
        '<b class="pnm">' + esc(r.name) + (r.me ? ' (you)' : '') + '</b><span class="psc">' + r.score + '</span>' +
        '<div class="block"><span>' + (['🥇', '🥈', '🥉'][r.rank - 1] || '🏅') + '</span><i>' + r.rank + '</i></div>';
      box.appendChild(d);
    });
    return box;
  }
  function lineup(rows) {
    var box = el('div', { 'class': 'lineup', role: 'list', 'aria-label': 'The line-up' });
    rows.forEach(function (r, k) {
      var d = el('div', { 'class': 'lu' + (r.me ? ' me' : ''), role: 'listitem', style: '--d:' + (k * 90) + 'ms' });
      d.innerHTML = (avSvg(r.look, 70, r.name + '\'s avatar') || '<span>🙂</span>') + '<b>' + r.rank + '. ' + esc(r.name) + '</b><span>' + r.score + (r.cls ? ' · ' + esc(r.cls) : '') + '</span>';
      box.appendChild(d);
    });
    return box;
  }
  var boardWeek = 0;
  function boardView() {
    var weeks = SO.seasonsNow(new Date()), sea = boardWeek ? weeks[0] : weeks[1];
    var box = el('section', { 'class': 'card board' }, [el('h2', { text: '🏆 Show-Off podium' }),
      el('p', { 'class': 'muted small', text: 'Points from a ten-look show: 100 a look, more for answers in a row (best 1,700). Each player\'s best show this week counts. First names only.' })]);
    var tabs = el('div', { 'class': 'row tabs' }, [
      el('button', { type: 'button', 'class': 'chip', 'aria-pressed': boardWeek ? 'false' : 'true', text: 'This week', onclick: function () { boardWeek = 0; view(); } }),
      el('button', { type: 'button', 'class': 'chip', 'aria-pressed': boardWeek ? 'true' : 'false', text: 'Last week', onclick: function () { boardWeek = 1; view(); } })
    ]);
    var body = el('div', { 'aria-live': 'polite' });
    box.appendChild(tabs); box.appendChild(body); app.appendChild(box);
    if (!SCREEN) app.appendChild(el('div', { 'class': 'row' }, [el('a', { 'class': 'btn primary', href: '#', text: run.ans.length && run.ans.length < SO.LOOKS ? 'Back to my show' : '🎬 Play', onclick: function (e) { e.preventDefault(); history.pushState('', '', location.pathname + location.search); view(); } })]));
    if (!CFG.endpoint) { body.appendChild(el('p', { text: 'The leaderboard isn\'t switched on here.' })); return; }
    loadPodium(body, sea, boardWeek);
    if (SCREEN) { clearInterval(boardView.t); boardView.t = setInterval(function () { if (location.hash === '#board') loadPodium(body, sea, boardWeek); }, 60000); }
  }

  view();
})();
