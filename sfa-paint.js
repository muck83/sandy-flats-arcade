/* 🎨 Paint the Flats: the class, in two to four fair teams, paints one shared hex map of Sandy Flats. Loaded by
   sfa-lesson.js (after sfa-crewkit.js) when the teacher starts one.

   A right answer is a paint drop. A drop paints ONE tile for your team, and you choose where:
   - any empty tile;
   - a rival's tile, but only when at least 3 of your team's tiles touch it (so: connect to defend, surround to flip,
     and drop a tile in a rival's way to block);
   - a landmark ★ (the Fair, the School, the Pond…) is worth 3 and can never be flipped, but it takes TWO DIFFERENT
     teammates: one starts it, another one finishes it. Teams have to talk.
   Score: 1 per tile, 3 per landmark, +3 once every teammate has painted (FULL CREW). In the last minute every right
   answer is 2 drops (the rush minute), so no team is out of it.

   Pulling everyone in:
   - FRESH PAINT: a student's first tile paints a neighbouring tile too, with a banner. The cheapest points a team can
     get are its quiet members' first tiles, and each student's own screen shows which teammates still have one waiting;
   - the FULL CREW bonus needs every single teammate;
   - teams are a snake draft on today's answers (nobody is told why), late joiners go to the next team in turn;
   - questions come in tiers (sfa-crewkit.js); a miss gets a hint and another try, never a knock-out;
   - no shaming: the class screen shows only who HAS painted (avatars on their latest tile, "5 of 6 painting"). Only
     the console lists who has not. At the end every team gets its own award.

   Sync: each student's running row (q "zptx1": "p1;id:<game>;r:<right>;f:<first time>;n:<tries>;d:<drops earned>;
   c:<the tiles they chose, in order, base 36>") goes to the Sheet. The console is the referee: it takes each student's
   choices in order, turns down the ones that are no longer allowed (someone got there first: the drop goes back), and
   publishes the map in the live counts:
     zpts [state, length, board, teams, students, salt, crew list number, full-crew bits], zptid / zptst the start,
     zptf0.. the students' fingerprints in order (student i is on team i mod teams),
     zptm0.. the map, 5 tiles to a number (0 empty, 1-4 a team), zptk the half-built landmarks (a bit per team),
     zptp0.. per student: tiles accepted × 100 + choices looked at, zptl0.. per student: their latest tile (+1),
     zptw at the end: each team's award × 100 + its number
   and the spotlight (spot.q "zpt": "P:" a page of names and avatars, "#E:" the latest fresh paint and landmarks). */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API, SFA = window.SFA, T = window.SFA_CREW;
  var H = A.H, el = A.el, esc = SFA.esc;
  var QID = 'zptx1', BUCKET = 3, RUSH = 60, FLIP = 3, LM_PTS = 3, CREW_PTS = 3, MAXC = 99;
  var BOARDS = [[9, 5], [10, 6], [11, 7], [13, 7]];
  var TEAMS = [{ n: 'Gold Goats', e: '🐐', c: '#FFC94A', k: '#7a5200' }, { n: 'Teal Turtles', e: '🐢', c: '#2DD4BF', k: '#075e54' }, { n: 'Pink Flamingos', e: '🦩', c: '#FF7AC0', k: '#7d1f52' }, { n: 'Blue Jays', e: '🐦', c: '#7AA2FF', k: '#1c3688' }];
  var LMS = [{ e: '🎡', n: 'the Fair' }, { e: '🏫', n: 'the School' }, { e: '🦆', n: 'the Pond' }, { e: '⛰️', n: 'Goat Hill' }, { e: '🍩', n: 'the Donut Stand' }];
  var AW = {
    1: ['👑', 'Mayors of Sandy Flats', function (v) { return 'Most of the map: ' + v + ' points. The goat has been informed.'; }],
    2: ['🔗', 'The Great Wall', function (v) { return 'The longest chain: ' + v + ' tile' + (v === 1 ? '' : 's') + ' joined up in one piece.'; }],
    3: ['🚀', 'Comeback Crew', function (v) { return '+' + v + ' points in the final stretch. Nobody saw it coming.'; }],
    4: ['🤝', 'All Hands on Deck', function (v) { return v + ' teammate' + (v === 1 ? '' : 's') + ' got paint on the map. That is how it is done.'; }],
    5: ['🏛️', 'Landmark Legends', function (v) { return v + ' landmark' + (v === 1 ? '' : 's') + ' taken, two teammates at a time.'; }],
    6: ['🎯', 'Sharp Brushes', function (v) { return v + '% of their answers were right first time. Surgical.'; }],
    7: ['🥷', 'Sneaky Brushes', function (v) { return v + ' rival tile' + (v === 1 ? '' : 's') + ' flipped while nobody was looking.'; }],
    8: ['🧭', 'Explorers', function (v) { return 'Paint in ' + v + ' different rows and columns. They have been everywhere.'; }],
    9: ['💪', 'Never Put the Brush Down', function (v) { return v + ' answer' + (v === 1 ? '' : 's') + ' sent in. The brushes need a rest.'; }],
    10: ['💎', 'Limited Edition', function (v) { return 'Only ' + v + ' tile' + (v === 1 ? '' : 's') + ' in their colour. Collectors will pay millions.'; }],
    11: ['🧘', 'Zen Brushes', function () { return 'Brushes spotless, paint saved for next round. The goat respects it.'; }]
  };
  var AW_MIN = { 2: 3, 3: 2, 4: 0.001, 5: 1, 6: 0.001, 7: 1 };   // an award has to mean something: no "Great Wall" of one tile
  var TIPS = ['A right answer is a paint drop: tap a tile to paint it', '✨ Your FIRST tile paints a neighbour too', '★ Landmarks are worth 3 and need two different teammates', 'Flip a rival tile when 3 of yours touch it', '⭐ FULL CREW: +3 when every teammate has painted', 'Last minute: every right answer is 2 drops'];

  function fx(name) { var F = window.SFA_FX, f = F && F[name]; if (typeof f !== 'function') return; try { return f.apply(F, [].slice.call(arguments, 1)); } catch (e) { } }
  function cat(c, pre) { var out = []; for (var k = 0; k < 6; k++) { var a = c[pre + k]; if (!Array.isArray(a)) break; out = out.concat(a); } return out; }
  function chunk(out, pre, arr, max) { for (var k = 0; k < max && (k === 0 || k * 12 < arr.length); k++) out[pre + k] = arr.slice(k * 12, k * 12 + 12); }

  /* ---------------- the map ---------------- */
  var GEO = {};
  function geo(bi) {
    if (GEO[bi]) return GEO[bi];
    var B = BOARDS[bi] || BOARDS[0], cols = B[0], rows = B[1], w = 86.6, G = { cols: cols, rows: rows, n: cols * rows, nb: [], xy: [], W: (cols + 0.5) * w, Hh: rows * 75 + 25 };
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var odd = r % 2, cand = odd ? [[c - 1, r], [c + 1, r], [c, r - 1], [c + 1, r - 1], [c, r + 1], [c + 1, r + 1]] : [[c - 1, r], [c + 1, r], [c - 1, r - 1], [c, r - 1], [c - 1, r + 1], [c, r + 1]];
      G.nb.push(cand.filter(function (p) { return p[0] >= 0 && p[0] < cols && p[1] >= 0 && p[1] < rows; }).map(function (p) { return p[1] * cols + p[0]; }));
      G.xy.push([(c + 0.5 + (odd ? 0.5 : 0)) * w, 50 + r * 75]);
    }
    var mc = Math.floor(cols / 2), mr = Math.floor(rows / 2);
    G.lmAll = [[mc, mr], [1, 1], [cols - 2, rows - 2], [cols - 2, 1], [1, rows - 2]].map(function (p) { return p[1] * cols + p[0]; });
    return (GEO[bi] = G);
  }
  function lmOf(bi, nt) { return geo(bi).lmAll.slice(0, Math.min(5, nt + 1)); }
  function touching(G, own, tile, v) { var n = 0; G.nb[tile].forEach(function (j) { if (own[j] === v) n++; }); return n; }
  function chain(G, own, v) {
    var seen = {}, best = 0;
    for (var i = 0; i < G.n; i++) {
      if (own[i] !== v || seen[i]) continue;
      var st = [i], n = 0; seen[i] = 1;
      while (st.length) { var x = st.pop(); n++; G.nb[x].forEach(function (j) { if (own[j] === v && !seen[j]) { seen[j] = 1; st.push(j); } }); }
      if (n > best) best = n;
    }
    return best;
  }
  function tally(G, lm, own, nt, crewMask) {
    var out = []; for (var t = 0; t < nt; t++) out.push({ tiles: 0, lm: 0, crew: !!(crewMask >> t & 1), score: 0 });
    for (var i = 0; i < G.n; i++) { var v = own[i]; if (v && out[v - 1]) { if (lm.indexOf(i) >= 0) out[v - 1].lm++; else out[v - 1].tiles++; } }
    out.forEach(function (o) { o.score = o.tiles + o.lm * LM_PTS + (o.crew ? CREW_PTS : 0); });
    return out;
  }

  function gameOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zpts) || !Array.isArray(c.zptid)) return null;
    var z = c.zpts, id = A.decRun(c.zptid), start = A.MODE === 'screen' ? id : A.decRun(c.zptst) || id;
    var sp = Lv.spot && Lv.spot.q === 'zpt' ? String(Lv.spot.text || '') : '', ev = [], seq = 0, m = /#E:(\d+)\|([^#]*)/.exec(sp);
    if (m) { seq = +m[1]; ev = m[2] ? m[2].split(',').map(function (x) { var p = x.split('~'); return { k: p[0], a: +p[1] || 0, b: +p[2] || 0, c: p[3] == null ? -1 : +p[3] }; }) : []; }
    var b = { id: id, start: start, state: z[0], dur: z[1] || 300, board: Math.min(BOARDS.length - 1, z[2] || 0), nt: Math.max(1, Math.min(4, z[3] || 1)), n: z[4] || 0, salt: z[5] || 0, ep: z[6] || 0, crewMask: z[7] || 0,
      fps: cat(c, 'zptf'), halves: c.zptk || [], aw: c.zptw || [], sp: sp, ev: ev, seq: seq };
    var G = geo(b.board), map = cat(c, 'zptm'), per = cat(c, 'zptp'), last = cat(c, 'zptl'), i;
    b.own = []; for (i = 0; i < G.n; i++) b.own.push(T.unpack(map, i, 5, 5));
    b.acc = []; b.prc = []; b.last = [];
    for (i = 0; i < b.n; i++) { b.acc.push(Math.floor((per[i] || 0) / 100)); b.prc.push((per[i] || 0) % 100); b.last.push(T.unpack(last, i, 100, 2) - 1); }
    b.lm = lmOf(b.board, b.nt); b.sc = tally(G, b.lm, b.own, b.nt, b.crewMask);
    return b;
  }
  function leftOf(b) { return Math.max(0, Math.round((b.start + b.dur * 1000 - T.sNow()) / 1000)); }
  function rushOn(b) { return b.state === 1 && b.dur >= 180 && leftOf(b) <= RUSH; }
  function members(b, t) { var out = []; for (var i = t; i < b.n; i += b.nt) out.push(i); return out; }

  /* =========================== student page and class screen =========================== */
  var root = null, V = null, ST = null, crew = T.Crew(), quiz = null;
  var ban0 = T.Banners(function () { return !!root; }), ban = { say: function (h, k, ms) { ban0.say(h, (k || '') + (stu() ? '' : ' ptbig'), ms); }, clear: ban0.clear };
  function key() { return 'paint.' + A.LID; }
  function keep() { if (ST) SFA.store.set(key(), ST); }
  function xp(n, once) { if (A.hero && ST && A.MODE === 'student') A.hero.add('pf', String(Math.round(ST.id / 1000)) + (once ? 'e' : ''), n, once); }
  function stu() { return A.MODE === 'student'; }

  function sync() {
    var Lv = A.live(), b = A.isLive() || A.MODE === 'screen' ? gameOf(Lv) : null;
    if (b && A.MODE !== 'teach' && T.sNow() - b.start > b.dur * 1000 + 180000) b = null;
    if (stu() && A.saving() && !A.S.me) b = null;
    if (!b) { close(); return; }
    if (!root || V.id !== b.id) open(b);
    apply(b);
  }
  function open(b) {
    close();
    var saved = SFA.store.get(key(), null);
    ST = saved && saved.id === b.id ? saved : { id: b.id, r: 0, f: 0, n: 0, d: 0, c: [], bn: 0, lm: [], done: 0 };
    V = { id: b.id, b: b, ep: b.ep, me: -1, t: -1, sel: -1, tiles: [], tip: 0 }; crew = T.Crew();
    root = H('div', 'crw pt' + (stu() ? '' : ' screen')); root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Paint the Flats');
    root.innerHTML = '<div class="crwhud"><h1>🎨 Paint the Flats</h1><span class="crwpill" id="ptT"></span><span class="crwpill" id="ptP"></span><span class="crwsp"></span><span class="crwpill" id="ptS"></span></div>' +
      '<div class="crwbody"><div class="crwscene ptscene"><div class="ptwrap"><div class="ptmapbox"><div class="ptboard"></div></div><div class="ptscore"></div></div><div class="ptgo" hidden></div></div>' +
      '<div class="crwside"><div class="crwcard ptme"></div><div class="crwcard ptq"></div></div></div>';
    document.body.appendChild(root); document.body.classList.add('crwing');
    build(b);
    if (stu()) quiz = T.Quiz({ st: function () { return ST; }, keep: keep, seed: T.hash(A.S.me ? A.S.me.sid : 'x') + Math.round(b.id / 1000) % 99991, redraw: function () { drawQ(); drawMe(); drawMap(); }, right: right, tried: tried });
    V.tick = setInterval(function () { if (!root) return; drawTop(); if (stu() && V.b.state === 1 && pending() > 0 && Date.now() - (V.sentAt || 0) > 20000) send(); }, 1000);
    V.tipT = setInterval(function () { if (root) { V.tip++; drawScore(true); } }, 6000);
    V.fit = function () { if (root) { fit(); V.asig = ''; drawAvs(); } }; window.addEventListener('resize', V.fit);
  }
  function close() {
    if (!root) return; clearInterval(V.tick); clearInterval(V.tipT); window.removeEventListener('resize', V.fit); ban.clear();
    root.remove(); root = null; V = null; quiz = null; document.body.classList.remove('crwing');
    var x = document.querySelector('.crwwatchx'); if (x) x.remove();
  }
  // the board: one <g> per tile, built once
  function build(b) {
    var G = geo(b.board), s = '', hex = '0,-47 40.7,-23.5 40.7,23.5 0,47 -40.7,23.5 -40.7,-23.5';
    for (var i = 0; i < G.n; i++) {
      var li = b.lm.indexOf(i);
      s += '<g class="pth' + (li >= 0 ? ' lm' : '') + (T.hash('s' + i * 7) % 3 === 0 ? ' alt' : '') + '" data-i="' + i + '" transform="translate(' + G.xy[i][0].toFixed(1) + ' ' + G.xy[i][1] + ')"><polygon points="' + hex + '"/>' +
        (li >= 0 ? '<circle class="ptring" r="33"/><g class="ptpip"></g><text class="ptic" y="15">' + LMS[li].e + '</text><text class="ptstar" x="26" y="-22">★</text>' : '<text class="ptem" y="12"></text>') + '</g>';
    }
    var board = root.querySelector('.ptboard');
    board.innerHTML = '<svg viewBox="0 0 ' + G.W.toFixed(0) + ' ' + G.Hh + '" role="img" aria-label="The map of Sandy Flats">' + s + '<polygon class="ptsel" points="' + hex + '" style="display:none"/></svg><div class="ptavs"></div>';
    V.G = G; V.els = [].slice.call(board.querySelectorAll('.pth')); V.cls = []; V.ems = [];
    if (stu()) board.querySelector('svg').addEventListener('click', function (e) { var g = e.target.closest ? e.target.closest('.pth') : null; if (g) tap(+g.getAttribute('data-i')); });
  }
  function fit() {
    var box = root && root.querySelector('.ptmapbox'), bd = root && root.querySelector('.ptboard'); if (!box || !bd) return;
    var r = V.G.W / V.G.Hh, narrow = stu() && window.innerWidth <= 820, w = box.clientWidth, h = narrow ? window.innerHeight * 0.42 : box.clientHeight;
    bd.style.width = Math.max(120, Math.floor(Math.min(w, h * r))) + 'px';
  }

  function myDrops() { var b = V.b, bounced = V.me >= 0 ? Math.max(0, b.prc[V.me] - b.acc[V.me]) : 0; return Math.max(0, ST.d - (ST.c.length - bounced)); }
  function pending() { return Math.max(0, ST.c.length - (V.me >= 0 ? V.b.prc[V.me] : 0)); }
  function pendTiles() { var p = pending(); return p ? ST.c.slice(-p) : []; }
  function painted() { return V.me >= 0 ? V.b.acc[V.me] : 0; }
  function freshReady() { return V.me >= 0 && !painted() && !pending(); }

  function apply(b) {
    var prev = V.prev; V.b = b;
    if (b.ep !== V.ep) { V.ep = b.ep; crew = T.Crew(); }
    crew.take(b.sp);
    if (stu() && A.S.me) {
      V.me = b.fps.indexOf(T.fpn(A.S.me.sid, b.salt)); V.t = V.me >= 0 ? V.me % b.nt : -1;
      if (V.me < 0 && b.state === 1 && !V.said) { V.said = 1; send(); }   // not on a team yet: say hello so the console adds me
      if (V.me >= 0) {
        var bn = Math.max(0, b.prc[V.me] - b.acc[V.me]);
        if (bn > ST.bn) { SFA.toast('Someone got to that tile just before you. Your paint drop is back: pick another tile.', 4200); fx('sfx', 'whoosh'); }
        if (bn !== ST.bn) { ST.bn = bn; keep(); }
        if (V.sel >= 0 && !canPaint(V.sel)) V.sel = -1;
      }
    }
    // what changed on the map since the last look: a splat on each tile
    if (prev && prev.board === b.board) {
      var hits = [];
      for (var i = 0; i < b.own.length; i++) if (b.own[i] !== prev.own[i] && b.own[i]) hits.push(i);
      hits.slice(0, 14).forEach(function (i2, k) { setTimeout(function () { if (root) splat(i2, k < 6); }, k * 110); });
      if (hits.length && !stu()) fx('sfx', 'splash');
    }
    if (V.seen == null) V.seen = b.seq;
    else if (b.seq > V.seen) {
      var first = b.seq - b.ev.length + 1;
      b.ev.forEach(function (e, i3) { if (first + i3 > V.seen) evFx(e); });
      V.seen = b.seq;
    }
    if (prev && b.state === 2 && prev.state !== 2) { celebrate(); }
    if (prev && !V.rushSaid && rushOn(b)) { V.rushSaid = 1; ban.say('⏰ <b>RUSH MINUTE!</b> Every right answer is <b>2 paint drops</b>', 'spark', 3200); fx('sfx', 'levelup'); }
    V.prev = b;
    fit(); drawTop(); drawMap(); drawScore(); drawAvs();
    if (stu()) {
      if (b.state === 2 && !ST.done && (ST.r || ST.n)) { ST.done = 1; keep(); var top = topTeam(b); xp(25 + (painted() && b.sc[V.t] && b.sc[V.t].crew ? 10 : 0) + (V.t >= 0 && V.t === top ? 10 : 0), true); }
      drawMe(); drawGo();
      var sig = [b.state, T.pool().length, myDrops() >= BUCKET, V.me >= 0, rushOn(b)].join('|'); if (sig !== V.qsig) { V.qsig = sig; drawQ(); }
    }
    root.querySelector('.ptscene').classList.toggle('ptover', b.state === 2);
    if (b.state === 2) ending(); else { var e2 = root.querySelector('.ptend'); if (e2) e2.remove(); V.esig = ''; }
  }
  function topTeam(b) { var best = 0; b.sc.forEach(function (s, t) { if (s.score > b.sc[best].score) best = t; }); return best; }
  function nameAt(i) { var c = crew.get(i); return c.n || 'A teammate'; }
  function teamTag(t) { var tm = TEAMS[t] || TEAMS[0]; return '<span style="color:' + tm.c + '">' + tm.e + ' ' + esc(tm.n) + '</span>'; }
  function evFx(e) {
    var b = V.b, t = e.a % b.nt, mine = stu() && e.a === V.me, mate = stu() && V.t === t;
    if (e.k === 'f') { ban.say('✨ <b>FRESH PAINT!</b> ' + esc(mine ? 'Your' : nameAt(e.a) + '\'s') + ' first tile painted two for the ' + teamTag(t), 'good', 1900); if (mate && !mine) xp(3); }
    else if (e.k === 'h') { if (mate || !stu()) ban.say((LMS[e.b] || LMS[0]).e + ' ' + teamTag(t) + ' started <b>' + esc((LMS[e.b] || LMS[0]).n) + '</b>: a different teammate has to finish it!', '', 2600); }
    else if (e.k === 'l') {
      ban.say((LMS[e.b] || LMS[0]).e + ' The ' + teamTag(t) + ' took <b>' + esc((LMS[e.b] || LMS[0]).n) + '</b>' + (e.c >= 0 ? ': ' + esc(nameAt(e.c)) + ' + ' + esc(nameAt(e.a)) : '') + ' <b>+' + LM_PTS + '</b>', 'spark', 3000);
      fx('sfx', 'levelup'); if (stu() && (mine || e.c === V.me)) { xp(8); fx('confetti', { ms: 1200 }); }
    }
    else if (e.k === 'c') { var tt = e.a; ban.say('⭐ <b>FULL CREW!</b> Every one of the ' + teamTag(tt) + ' has painted: <b>+' + CREW_PTS + '</b>', 'spark', 3000); fx('sfx', 'combo'); if (stu() && V.t === tt) xp(6); }
  }
  function tileEl(i) { return V.els[i]; }
  function splat(i, burst) {
    var g = tileEl(i); if (!g) return; g.classList.remove('splat'); void g.getBoundingClientRect(); g.classList.add('splat'); setTimeout(function () { g.classList.remove('splat'); }, 700);
    if (burst && !stu()) { var v = V.b.own[i]; fx('burst', g, { count: 10, colors: [TEAMS[v - 1] ? TEAMS[v - 1].c : '#fff', '#ffffff'], spread: 120, size: 8 }); }
  }
  function celebrate() {
    fx('sfx', 'win');
    var n = 0; (function c() { if (!root || n++ > 3) return; if (window.SFA_FX && SFA_FX.confetti) fx('confetti', { ms: 1600, colors: TEAMS.slice(0, V.b.nt).map(function (t) { return t.c; }) }); else A.confetti(); setTimeout(c, 1400); })();
  }

  function drawTop() {
    if (!root || !V) return;
    var b = V.b, g = function (id) { return root.querySelector('#' + id); }, left = leftOf(b), rush = rushOn(b), done = 0;
    b.own.forEach(function (v) { if (v) done++; });
    var tp = g('ptT'); tp.innerHTML = b.state === 1 ? '⏱ <b>' + T.mmss(left) + '</b>' : '🏁 <b>Time!</b>'; tp.className = 'crwpill' + (b.state === 1 && left <= 10 ? ' hot' : '');
    g('ptP').innerHTML = stu() && V.me >= 0 && b.state === 1 ? '🎨 <b>' + myDrops() + '</b> drop' + (myDrops() === 1 ? '' : 's') : '<b>' + Math.round(100 * done / V.G.n) + '%</b> painted';
    var sp = g('ptS'); sp.innerHTML = b.state !== 1 ? '' : rush ? '⏰ RUSH MINUTE: 2 drops per answer' : ''; sp.className = 'crwpill' + (rush ? ' hot' : '');
    if (b.state === 1 && left <= 5 && left > 0 && V.lastTick !== left && !stu()) { V.lastTick = left; fx('sfx', 'tick'); }
  }
  // what a tile shows on this screen: the published owner, with my own paint that is still drying on top
  function ownView() { var b = V.b, own = b.own; if (stu() && V.t >= 0) { var p = pendTiles(); if (p.length) { own = own.slice(); p.forEach(function (i) { if (b.lm.indexOf(i) < 0) own[i] = V.t + 1; }); } } return own; }
  function canPaint(i) {
    var b = V.b; if (!stu() || b.state !== 1 || V.t < 0 || myDrops() < 1 || ST.c.length >= MAXC) return '';
    if (pendTiles().indexOf(i) >= 0) return '';
    var own = ownView(), v = own[i], li = b.lm.indexOf(i), me = V.t + 1;
    if (li >= 0) { if (v) return ''; var half = (b.halves[li] || 0) >> V.t & 1; if (ST.lm.indexOf(i) >= 0) return ''; return half ? 'finish' : members(b, V.t).length < 2 ? 'finish' : openStart() >= 0 ? '' : 'start'; }
    if (!v) return 'empty';
    if (v === me) return '';
    return touching(V.G, own, i, me) >= FLIP ? 'flip' : '';
  }
  // a landmark I started that still waits for a teammate (one at a time)
  function openStart() { var b = V.b, out = -1; ST.lm.forEach(function (tile) { if (!b.own[tile]) out = tile; }); return out; }
  function drawMap() {
    if (!root || !V) return;
    var b = V.b, own = ownView(), pend = stu() ? pendTiles() : [], can = stu() && b.state === 1 && V.t >= 0 && myDrops() > 0;
    for (var i = 0; i < V.G.n; i++) {
      var v = own[i], li = b.lm.indexOf(i), k = can ? canPaint(i) : '', cl = 'pth' + (li >= 0 ? ' lm' : '') + (V.els[i].classList.contains('alt') ? ' alt' : '') + (v ? ' t' + v : '') + (pend.indexOf(i) >= 0 ? ' pend' : '') + (k ? ' can' + (k === 'flip' ? ' flip' : '') : '') + (V.els[i].classList.contains('splat') ? ' splat' : '');
      if (li >= 0) cl += ((b.halves[li] || 0) && !v ? ' half' : '') + (stu() && V.t >= 0 && ((b.halves[li] || 0) >> V.t & 1) && !v ? ' ours' : '');
      var sig = cl + '|' + (li >= 0 ? b.halves[li] || 0 : '');
      if (V.cls[i] === sig) continue; V.cls[i] = sig;
      V.els[i].setAttribute('class', cl);
      if (li < 0) { var em = V.els[i].querySelector('.ptem'); em.textContent = v && TEAMS[v - 1] ? TEAMS[v - 1].e : ''; }
      else {   // a half-built landmark: a coloured pip for each team that has started it
        var pip = '', m = v ? 0 : b.halves[li] || 0, kx = 0;
        for (var t = 0; t < 4; t++) if (m >> t & 1) { pip += '<circle cx="' + (-24 + kx * 16) + '" cy="33" r="7" fill="' + TEAMS[t].c + '" stroke="#141428" stroke-width="2.5"/>'; kx++; }
        V.els[i].querySelector('.ptpip').innerHTML = pip;
      }
    }
    var sel = root.querySelector('.ptsel');
    if (V.sel >= 0 && can) { sel.style.display = ''; sel.setAttribute('transform', 'translate(' + V.G.xy[V.sel][0].toFixed(1) + ' ' + V.G.xy[V.sel][1] + ')'); } else sel.style.display = 'none';
    root.querySelector('.ptboard').classList.toggle('canpaint', !!can);
  }
  // avatars: each student stands on the latest tile they painted (while it is still their team's)
  function drawAvs() {
    if (!root || !V) return;
    var b = V.b, bd = root.querySelector('.ptboard'), px = (bd.clientWidth || 600) / V.G.W * 86.6, list = [], own = ownView(), i;
    for (i = 0; i < b.n; i++) { var tl = b.last[i]; if (stu() && i === V.me && pending()) { var pt = pendTiles(); tl = pt[pt.length - 1]; } if (tl >= 0 && tl < V.G.n && own[tl] === i % b.nt + 1) list.push([i, tl]); }
    var sig = list.map(function (x) { return x.join(':'); }).join(',') + '|' + crew.key + '|' + Math.round(px) + '|' + V.me;
    if (sig === V.asig) return; V.asig = sig;
    var size = Math.max(16, Math.round(px * 0.8)), names = px >= 64, was = V.avAt || {}, now = {}, h = '', seen = {};
    list.forEach(function (x) {
      if (seen[x[1]]) return; seen[x[1]] = 1;   // two students on one tile (a flip back and forth): the first stands there
      var c = crew.get(x[0]), you = x[0] === V.me, xy = V.G.xy[x[1]]; now[x[0]] = x[1];
      h += '<div class="ptav' + (was[x[0]] !== x[1] ? ' hop' : '') + (you ? ' you' : '') + '" style="left:' + (100 * xy[0] / V.G.W).toFixed(2) + '%;top:' + (100 * xy[1] / V.G.Hh).toFixed(2) + '%;width:' + size + 'px">' + (c.fp ? T.av(c.look, size, false) : '<span style="font-size:' + Math.round(size * 0.6) + 'px">🙂</span>') +
        (names || you ? '<span class="crwname ' + (c.fp ? T.ncls(c.look) : '') + '">' + esc(you ? 'You' : c.n) + '</span>' : '') + '</div>';
    });
    V.avAt = now; root.querySelector('.ptavs').innerHTML = h;
  }
  function drawScore(tipOnly) {
    if (!root || !V) return;
    var b = V.b, box = root.querySelector('.ptscore'), max = 1, h = '';
    b.sc.forEach(function (s) { if (s.score > max) max = s.score; });
    b.sc.forEach(function (s, t) {
      var mem = members(b, t), in_ = mem.filter(function (i) { return b.acc[i] > 0; }).length, tm = TEAMS[t];
      h += '<div class="ptrow' + (stu() && t === V.t ? ' mine' : '') + '" style="--tc:' + tm.c + ';--tk:' + tm.k + '"><span class="ptbadge">' + tm.e + '</span><div class="ptinfo"><b>' + esc(tm.n) + '</b><small>🖌 ' + in_ + ' of ' + mem.length + ' painting' + (s.lm ? ' · ★ ' + s.lm : '') + (s.crew ? ' · ⭐ full crew' : '') + '</small><i class="ptbar"><u style="width:' + Math.round(100 * s.score / max) + '%"></u></i></div><strong data-t="' + t + '">' + s.score + '</strong></div>';
    });
    h += '<p class="pttip">' + (b.state === 1 ? esc(TIPS[V.tip % TIPS.length]) : '') + '</p>';
    var sig = h; if (V.ssig === sig) return; V.ssig = sig;
    var old = {}; [].forEach.call(box.querySelectorAll('strong[data-t]'), function (x) { old[x.getAttribute('data-t')] = +x.textContent || 0; });
    box.innerHTML = h;
    if (!tipOnly) [].forEach.call(box.querySelectorAll('strong[data-t]'), function (x) { var t = x.getAttribute('data-t'), to = +x.textContent || 0; if (old[t] != null && old[t] !== to) { fx('countUp', x, old[t], to, 500); fx('pop', x); } });
  }

  /* ---------- the awards: every team gets one ---------- */
  function ending() {
    var b = V.b, sig = [b.aw.join('.'), crew.key, b.sc.map(function (s) { return s.score; }).join('.'), Math.round(window.innerWidth / 40)].join('|'); if (V.esig === sig) return; V.esig = sig;
    var old = root.querySelector('.ptend'); if (old) old.remove();
    var order = b.sc.map(function (s, t) { return t; }).sort(function (x, y) { return b.sc[y].score - b.sc[x].score || x - y; }), big = !stu();
    var e = H('div', 'ptend'), h = '<h1>Sandy Flats is painted!</h1><div class="ptcards">';
    order.forEach(function (t, k) {
      var w = b.aw[t] || 0, id = Math.floor(w / 100), val = w % 100, a = AW[id] || AW[11], tm = TEAMS[t], who = members(b, t).filter(function (i) { return b.acc[i] > 0 && crew.get(i).fp; });
      var size = big ? Math.max(40, Math.min(120, Math.floor(Math.min(window.innerWidth * 0.24, 520) / Math.max(3, who.length)))) : 30;
      h += '<div class="ptcard" style="--tc:' + tm.c + ';--tk:' + tm.k + ';animation-delay:' + (0.25 + k * 0.45).toFixed(2) + 's"><div class="ptchead"><span>' + tm.e + '</span><b>' + esc(tm.n) + '</b><strong>' + b.sc[t].score + '</strong></div>' +
        '<div class="ptaw"><span>' + a[0] + '</span><b>' + esc(a[1]) + '</b></div><p>' + esc(a[2](val)) + '</p>' +
        '<div class="ptwho">' + who.map(function (i, j) { var c = crew.get(i); return '<div class="ptbob" style="width:' + size + 'px;animation-delay:' + (-(j * 0.23) % 1.6).toFixed(2) + 's">' + T.av(c.look, size, false) + (big ? '<span class="crwname ' + T.ncls(c.look) + '">' + esc(c.n) + '</span>' : '') + '</div>'; }).join('') + '</div></div>';
    });
    e.innerHTML = h + '</div>';
    root.querySelector('.ptscene').appendChild(e);
  }

  /* ---------- my team, my drops, my question (student) ---------- */
  function tap(i) {
    if (!V || V.b.state !== 1) return;
    var k = canPaint(i);
    if (!k) {
      var b = V.b, own = ownView(), v = own[i], why = V.me < 0 ? 'Finding you a team… one moment.' : myDrops() < 1 ? 'Answer a question to earn a paint drop first.' : b.lm.indexOf(i) >= 0 ? (v ? 'That landmark is taken for good.' : ST.lm.indexOf(i) >= 0 ? 'You started this one: it takes a DIFFERENT teammate to finish it. Go and tell them!' : 'You already have a landmark waiting for a teammate (' + LMS[b.lm.indexOf(openStart())].n + '). Get that one finished first.') : v === V.t + 1 ? 'That one is already yours.' : 'To flip a rival tile, ' + FLIP + ' of your team\'s tiles must touch it.';
      SFA.toast(why, 2600); return;
    }
    if (V.sel === i) return paint(i);   // a second tap on the same tile paints it
    V.sel = i; fx('sfx', 'tap'); drawMap(); drawGo();
  }
  function drawGo() {
    var box = root && root.querySelector('.ptgo'); if (!box) return;
    var k = V.sel >= 0 ? canPaint(V.sel) : '';
    if (!k) {
      var idle = V.b.state !== 1 ? '' : V.me < 0 ? '' : myDrops() ? '👆 Tap a tile on the map to pick it' : pending() ? '🖌 Your paint is drying…' : '✏️ Answer a question for a paint drop';
      if (box._k !== 'i' + idle) { box._k = 'i' + idle; box.hidden = !idle; box.className = 'ptgo idle'; box.innerHTML = '<span>' + idle + '</span>'; }
      return;
    }
    box.className = 'ptgo';
    var li = V.b.lm.indexOf(V.sel), L = LMS[li] || LMS[0], sig = V.sel + k + freshReady();
    if (box._k === sig && !box.hidden) return; box._k = sig; box.hidden = false; box.innerHTML = '';
    var txt = k === 'empty' ? (freshReady() ? '✨ Fresh paint: this tile AND a neighbour' : 'An empty tile') : k === 'flip' ? '⚔️ Flip this rival tile' : k === 'start' ? L.e + ' Start ' + L.n + ' (a teammate must finish it)' : L.e + ' Finish ' + L.n + ': +' + LM_PTS + ' for your team';
    box.appendChild(H('span', '', esc(txt)));
    var go = el('button', { type: 'button', 'class': 'btn primary', text: '🎨 Paint it!' }); go.onclick = function () { paint(V.sel); }; box.appendChild(go);
  }
  function paint(i) {
    var k = canPaint(i); if (!k) return;
    var fresh = freshReady();
    ST.c.push(i); if (k === 'start') ST.lm.push(i);
    V.sel = -1; xp(2); keep(); send();
    var g = tileEl(i), tm = TEAMS[V.t];
    drawMap(); V.asig = ''; drawAvs(); drawMe(); drawGo(); drawTop();
    g.classList.add('splat'); setTimeout(function () { g.classList.remove('splat'); }, 700);
    fx('sfx', 'splash'); fx('burst', g, { count: 16, colors: [tm.c, '#ffffff'], spread: 160, size: 9 }); fx('float', g, fresh ? '✨ ×2' : k === 'flip' ? 'Flipped!' : k === 'start' ? 'Half built!' : k === 'finish' ? '+' + LM_PTS : '+1', { color: tm.c, size: 26 });
    if (k === 'start') SFA.toast('🏗 You started ' + LMS[V.b.lm.indexOf(i)].n + '. It needs a DIFFERENT teammate to finish it: go and tell one!', 5000);
    var sig = [V.b.state, T.pool().length, myDrops() >= BUCKET, V.me >= 0, rushOn(V.b)].join('|'); if (sig !== V.qsig) { V.qsig = sig; drawQ(); }
    if (!myDrops()) phoneTo('.ptq', 900);
  }
  function drawMe() {
    var box = root && root.querySelector('.ptme'); if (!box) return;
    var b = V.b, h, tm = TEAMS[V.t] || TEAMS[0], mine = painted();
    if (V.me < 0) h = '<p class="crwkick">Your team</p><p class="ptstat">' + (b.state === 1 ? '🎨 Finding you a team… you can start answering now.' : 'This round is over.') + '</p>';
    else {
      var s = b.sc[V.t] || { score: 0 }, d = myDrops(), mem = members(b, V.t), line;
      h = '<div class="ptteam" style="--tc:' + tm.c + ';--tk:' + tm.k + '"><span>' + tm.e + '</span><div><small>You paint for the</small><b>' + esc(tm.n) + '</b></div><strong>' + s.score + '</strong></div>';
      if (b.state === 2) {
        var w = b.aw[V.t] || 0, a = AW[Math.floor(w / 100)], I = A.hero ? A.hero.info() : null;
        line = (a ? a[0] + ' <b>' + esc(a[1]) + '</b>: your team\'s award. ' : '') + (mine ? 'You put <b>' + mine + '</b> tile' + (mine === 1 ? '' : 's') + ' on the map for them.' : 'No tile from you this time. Next round, one right answer is a tile, and your first one counts double.') + (I ? '<br>⭐ Level ' + I.lv + ' ' + esc(I.title) + ' · ' + I.xp + ' XP' : '');
      } else {
        var dr = ''; for (var k = 0; k < BUCKET; k++) dr += '<i class="' + (k < d ? 'on' : '') + '"></i>';
        h += '<div class="ptdrops" aria-label="' + d + ' paint drops">' + dr + (d > BUCKET ? '<b>+' + (d - BUCKET) + '</b>' : '') + '</div>';
        line = d && freshReady() ? '✨ <b>Fresh paint!</b> Your first tile paints a neighbour too. Tap a tile on the map, then <b>Paint it</b>.'
          : d ? '<b>' + d + ' paint drop' + (d === 1 ? '' : 's') + '.</b> Tap a tile on the map, then <b>Paint it</b>. ' + (mine < 2 ? 'Empty tiles, ★ landmarks, or a rival tile that 3 of yours touch.' : '')
            : pending() ? '🖌 Your paint is drying on the map. Answer another question for the next drop.'
              : freshReady() ? '✨ <b>Fresh paint bonus ready.</b> One right answer is a drop, and your first tile paints a neighbour too.' : 'Answer a question to earn a paint drop.';
      }
      h += '<p class="ptstat">' + line + '</p>';
      if (b.state === 1 && mem.length > 1) {
        var wait = 0;
        h += '<div class="ptmates">' + mem.map(function (i) { var c = crew.get(i), n = b.acc[i] + (i === V.me ? pending() : 0), you = i === V.me; if (!n) wait++; return '<div class="ptmate' + (n ? ' in' : '') + '">' + (c.fp ? T.av(c.look, 34, false) : '<span>🙂</span>') + '<b class="' + (c.fp ? T.ncls(c.look) : '') + '">' + esc(you ? 'You' : c.n || '…') + '</b><small>' + (n ? '🖌 ' + n : '✨ ×2') + '</small></div>'; }).join('') + '</div>';
        h += '<p class="ptstat small">' + (s.crew ? '⭐ <b>Full crew bonus: +' + CREW_PTS + '.</b> Your team got everyone painting.' : wait ? '✨ ×2 = a first tile that paints two. When everyone has painted: <b>+' + CREW_PTS + ' full crew</b>.' : '') + '</p>';
      }
    }
    if (box._h !== h) { box._h = h; box.innerHTML = h; }
  }
  function right(first) {
    var b = V.b, gain = rushOn(b) ? 2 : 1;
    ST.r++; if (first) ST.f++; ST.d += gain;
    xp(first ? 10 : 6); keep(); send();
    fx('sfx', 'right'); fx('burst', root.querySelector('.ptdrops') || root.querySelector('.ptme'), { count: 12, colors: [(TEAMS[V.t] || TEAMS[0]).c, '#fff'] });
    setTimeout(function () { if (root) { drawMe(); drawMap(); drawTop(); drawGo(); fx('pop', root.querySelector('.ptdrops')); } }, 0);
    phoneTo('.ptmapbox', 1100);
    return '<b>🎨 +' + gain + ' paint drop' + (gain === 1 ? '' : 's') + '!</b> ' + (V.me < 0 ? 'You can paint as soon as you have a team.' : freshReady() ? 'Tap a tile on the map: your first one paints a neighbour too.' : 'Tap a tile on the map to paint it.');
  }
  function tried(Q, kind) { ST.n++; xp(2); keep(); sendSoon(); if (kind === 1) fx('sfx', 'wrong'); }
  // on a phone the map and the question are a scroll apart: glide to the one the student needs next
  function phoneTo(sel, ms) {
    if (!stu() || window.innerWidth > 820) return;
    setTimeout(function () { var e = root && root.querySelector(sel); if (!e) return; var r = e.getBoundingClientRect(); if (r.top >= 0 && r.bottom <= window.innerHeight) return; try { e.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (x) { e.scrollIntoView(); } }, ms);
  }
  function drawQ() {
    var box = root && root.querySelector('.ptq'); if (!box || !quiz) return;
    var b = V.b;
    if (b.state !== 1) { box.innerHTML = '<p class="crwq">🏁 Brushes down! Look up: every team gets an award.</p>'; return; }
    // a redraw in the middle of typing (the rush minute starts, a lock opens): what was typed stays
    var oi = box.querySelector('.crwrow input'), ov = oi ? oi.value : '', ofc = !!oi && document.activeElement === oi, oq = box._q;
    var z = quiz.state();
    if (myDrops() >= BUCKET && !(z.fb && !z.fb.end)) { box.innerHTML = '<p class="crwkick">Your bucket is full</p><p class="crwq">🪣 You are holding <b>' + myDrops() + ' paint drops</b>. Paint a tile on the map to keep answering.</p>'; return; }
    quiz.draw(box, { kick: 'Answer to earn ' + (rushOn(b) ? '2 paint drops (rush minute!)' : 'a paint drop'), go: '🎨 Answer', after: function (bx) {
      var nx = el('button', { type: 'button', 'class': 'btn' + (myDrops() ? '' : ' primary'), text: 'Next question ▶' }); nx.onclick = function () { quiz.next(); V.qsig = ''; drawQ(); }; bx.appendChild(nx);
    } });
    var ni = box.querySelector('.crwrow input'); box._q = quiz.state().cur; if (ni && ov && oq === box._q) { ni.value = ov; if (ofc) ni.focus(); }
  }
  var sendT = null;
  function send() {
    clearTimeout(sendT); if (!stu() || !V || !ST) return;
    V.sentAt = Date.now();
    A.record({ id: QID, k: 'open' }, 'p1;id:' + Math.round(V.id / 1000) + ';r:' + ST.r + ';f:' + ST.f + ';n:' + ST.n + ';d:' + ST.d + ';c:' + ST.c.map(function (i) { return i.toString(36); }).join('.'), null);
  }
  function sendSoon() { clearTimeout(sendT); sendT = setTimeout(send, 2500); }

  /* =========================== the teacher console =========================== */
  function C() { return A.console_().paint; }
  function ev(K, e) { K.ev.push(e); K.ev = K.ev.slice(-6); K.seq++; }
  function pickSalt() {
    var ids = A.rosterIn().map(function (r) { return r.sid; });
    for (var s = 1; s < 200; s++) { var seen = {}, ok = true; for (var i = 0; i < ids.length; i++) { var f = T.fpn(ids[i], s); if (seen[f]) { ok = false; break; } seen[f] = 1; } if (ok) return s; }
    return 1;
  }
  function addStudent(K, sid) { if (K.idx[sid] != null || K.order.length >= 60) return false; K.idx[sid] = K.order.length; K.order.push(sid); return true; }
  function teamOfSid(K, sid) { return K.idx[sid] % K.nt; }
  function teamSids(K, t) { return K.order.filter(function (sid, i) { return i % K.nt === t; }); }
  function start(mins) {
    if (!T.pool().length) { SFA.toast('This lesson has no number or multiple-choice questions for Paint the Flats.', 4500); return false; }
    var who = T.active(), str = T.strengths(), n = who.length, nt = n >= 14 ? 4 : n >= 6 ? 3 : n >= 2 ? 2 : 1, dur = Math.round((mins || 5) * 60), t0 = Math.round(Date.now() / 1000) * 1000;
    // the board: about four fifths of the tiles the class can be expected to paint, so the last stretch is fought over
    var want = Math.max(2, n) * (dur / 60) * 0.8, bi = 0; BOARDS.forEach(function (B, i) { if (Math.abs(B[0] * B[1] - want) < Math.abs(BOARDS[bi][0] * BOARDS[bi][1] - want)) bi = i; });
    var K = A.console_().paint = { id: t0, state: 1, dur: dur, board: bi, nt: nt, salt: pickSalt(), ep: Math.floor(Math.random() * 9000) + 1, order: [], idx: {}, own: [], half: {}, acc: {}, prc: {}, last: {}, rows: {}, crew: 0, flips: [0, 0, 0, 0], mid: null, aw: [], ev: [], seq: 0, page: 0 };
    for (var i = 0; i < geo(bi).n; i++) K.own.push(0);
    // a snake draft down the order of how much each student has done today: student i is on team i mod teams, so each
    // round of the draft goes into the list forwards, then backwards
    var order = T.shuffle(who, Math.random).sort(function (a, b) { return (str[b] || 0) - (str[a] || 0); });
    for (var r = 0; r * nt < order.length; r++) { var sl = order.slice(r * nt, r * nt + nt); if (r % 2) sl.reverse(); sl.forEach(function (sid) { addStudent(K, sid); }); }
    A.pushLive(); A.consolePanel(); return true;
  }
  // one choice from one student: true if the paint went on
  function claim(K, sid, tile) {
    var G = geo(K.board), lm = lmOf(K.board, K.nt), t = teamOfSid(K, sid);
    if (!(tile >= 0 && tile < G.n)) return false;
    var li = lm.indexOf(tile), own = K.own[tile];
    if (li >= 0) {
      if (own) return false;
      var hf = K.half[li] || (K.half[li] = {});
      if (hf[t] === sid) return false;
      if (hf[t] != null || teamSids(K, t).length < 2) { K.own[tile] = t + 1; ev(K, { k: 'l', a: K.idx[sid], b: li, c: hf[t] != null && K.idx[hf[t]] != null ? K.idx[hf[t]] : -1 }); K.half[li] = {}; return true; }
      if (lm.some(function (tl, j) { return j !== li && !K.own[tl] && K.half[j] && K.half[j][t] === sid; })) return false;   // one unfinished landmark each
      hf[t] = sid; ev(K, { k: 'h', a: K.idx[sid], b: li }); return true;
    }
    if (own === t + 1) return false;
    if (own) { if (touching(G, K.own, tile, t + 1) < FLIP) return false; K.flips[t]++; }
    K.own[tile] = t + 1; return true;
  }
  // fresh paint: a first tile also paints the empty neighbour that touches the most of the team's tiles (or the nearest empty tile)
  function bonus(K, sid, tile) {
    var G = geo(K.board), lm = lmOf(K.board, K.nt), t = teamOfSid(K, sid) + 1, best = -1, bs = -1;
    var free = function (j) { return !K.own[j] && lm.indexOf(j) < 0; };
    G.nb[tile].forEach(function (j) { if (free(j)) { var s = touching(G, K.own, j, t); if (s > bs) { bs = s; best = j; } } });
    if (best < 0) { var seen = {}, q = [tile]; seen[tile] = 1; while (q.length && best < 0) { var x = q.shift(); G.nb[x].some(function (j) { if (seen[j]) return false; seen[j] = 1; if (free(j)) { best = j; return true; } q.push(j); return false; }); } }
    if (best >= 0) K.own[best] = t;
    return best;
  }
  function crewCheck(K) {
    for (var t = 0; t < K.nt; t++) {
      if (K.crew >> t & 1) continue;
      var m = teamSids(K, t); if (m.length >= 2 && m.every(function (sid) { return K.acc[sid] > 0; })) { K.crew |= 1 << t; ev(K, { k: 'c', a: t, b: 0 }); }
    }
  }
  function parseRow(s) { var m = /;c:([0-9a-z.]*)/.exec(s); return { r: T.getN(s, 'r'), f: T.getN(s, 'f'), n: T.getN(s, 'n'), d: T.getN(s, 'd'), c: m && m[1] ? m[1].split('.').map(function (x) { return parseInt(x, 36); }) : [] }; }
  function agg() {
    var K = C(); if (!K || !A.rosterIn().length) return;
    if (K.restoring) rebuild(K);
    var last = T.rows(QID, 'id:' + Math.round(K.id / 1000) + ';'), changed = false, inR = {};
    A.rosterIn().forEach(function (r) { inR[r.sid] = 1; });
    if (K.state === 1) T.active().concat(Object.keys(last)).forEach(function (sid) { if (inR[sid] && addStudent(K, sid)) changed = true; });
    Object.keys(last).forEach(function (sid) {
      if (K.idx[sid] == null) return;
      var row = parseRow(String(last[sid].answer)), old = K.rows[sid];
      if (!old || old.n !== row.n || old.r !== row.r || old.c.length !== row.c.length) changed = true;
      K.rows[sid] = row;
      if (K.state !== 1) return;
      for (var i = K.prc[sid] || 0; i < row.c.length && i < MAXC; i++) {
        var fresh = !(K.acc[sid] > 0), tile = row.c[i];
        if ((K.acc[sid] || 0) < row.d && claim(K, sid, tile)) {
          var onLm = lmOf(K.board, K.nt).indexOf(tile) >= 0;
          K.acc[sid] = (K.acc[sid] || 0) + 1; if (!onLm) K.last[sid] = tile;   // avatars stand on ordinary tiles, so the landmarks stay in view
          if (fresh) { var bt = bonus(K, sid, tile); if (onLm && bt >= 0) K.last[sid] = bt; ev(K, { k: 'f', a: K.idx[sid], b: tile }); }
        }
        K.prc[sid] = i + 1; changed = true;
      }
    });
    if (K.state === 1) crewCheck(K);
    if (changed) tick(true);
  }
  function scores(K) { return tally(geo(K.board), lmOf(K.board, K.nt), K.own, K.nt, K.crew); }
  // every team gets an award: the top score is the Mayors; each other team gets the award it is best at
  function awards(K) {
    var G = geo(K.board), sc = scores(K), order = sc.map(function (s, t) { return t; }).sort(function (a, b) { return sc[b].score - sc[a].score || a - b; });
    var met = sc.map(function (s, t) {
      var m = teamSids(K, t), in_ = m.filter(function (sid) { return K.acc[sid] > 0; }).length, r = 0, f = 0, n = 0, rowsU = {}, colsU = {};
      m.forEach(function (sid) { var w = K.rows[sid]; if (w) { r += w.r; f += w.f; n += w.n + w.r; } });
      for (var i = 0; i < G.n; i++) if (K.own[i] === t + 1) { rowsU['r' + Math.floor(i / G.cols)] = 1; colsU['c' + i % G.cols] = 1; }
      var ch = chain(G, K.own, t + 1), come = K.mid ? s.score - (K.mid[t] || 0) : 0;
      return { 2: [ch, ch], 3: [come, come], 4: [m.length ? in_ / m.length + in_ / 1000 : 0, in_], 5: [s.lm, s.lm], 6: [r >= 3 ? f / r : 0, r ? Math.round(100 * f / r) : 0], 7: [K.flips[t] || 0, K.flips[t] || 0], 8: [Object.keys(rowsU).length + Object.keys(colsU).length, Object.keys(rowsU).length + Object.keys(colsU).length], 9: [n, n], 10: [s.tiles + s.lm, s.tiles + s.lm], 11: [1, 0] };
    });
    var used = {}, out = [];
    order.forEach(function (t, k) {
      var pick = 0, best = 99;
      if (k === 0 && sc[t].score > 0) { out[t] = 100 + Math.min(99, sc[t].score); return; }
      [2, 3, 4, 5, 6, 7].forEach(function (id) {
        if (used[id] || !(met[t][id][0] >= AW_MIN[id])) return;
        var rank = 0; met.forEach(function (m2, t2) { if (t2 !== t && m2[id][0] > met[t][id][0]) rank++; });
        if (rank < best) { best = rank; pick = id; }
      });
      if (!pick) pick = !used[8] && met[t][8][0] >= 6 ? 8 : !used[10] && met[t][10][0] > 0 ? 10 : !used[9] && met[t][9][0] > 0 ? 9 : 11;
      used[pick] = 1; out[t] = pick * 100 + Math.max(0, Math.min(99, Math.round(met[t][pick][1])));
    });
    return out;
  }
  function end() {
    var K = C(); if (!K) return;
    if (K.state === 1) {
      K.aw = awards(K);
      if (K.order.length && A.trophy) {   // 🏆 the trophy shelf (trophies.html): ic, title and sub are ready to show as they are
        var sc = scores(K), top = 0, in_ = K.order.filter(function (sid) { return K.acc[sid] > 0; }).length, lmN = 0;
        sc.forEach(function (s, t) { if (s.score > sc[top].score) top = t; lmN += s.lm; });
        A.trophy({ k: 'paint', id: K.id, win: true, ic: '🎨', title: 'Paint the Flats: the ' + TEAMS[top].n + ' are the Mayors of Sandy Flats',
          sub: sc.map(function (s, t) { return TEAMS[t].e + ' ' + s.score; }).join(' · ') + ' · ' + in_ + ' of ' + K.order.length + ' students painted · ' + lmN + ' landmark' + (lmN === 1 ? '' : 's'), n: K.order.length, painted: in_, scores: sc.map(function (s) { return s.score; }) });
      }
    }
    K.state = 2; K.endedAt = Date.now(); (A.pushNow || A.pushLive)(); A.consolePanel();
  }
  function tick(force) {
    var K = C(); if (!K) return;
    if (K.restoring) { if (A.rosterIn().length) agg(); return; }
    var now = Date.now(), e = (now - K.id) / 1000, push = !!force;
    if (K.state === 1) {
      if (!K.mid && e >= K.dur * 0.6) K.mid = scores(K).map(function (s) { return s.score; });
      if (e >= K.dur) { end(); return; }
    }
    var pg = Math.floor(e / 4) % Math.max(1, Math.ceil(K.order.length / 12)); if (pg !== K.page) { K.page = pg; push = true; }
    if (push || now - (K.lastPush || 0) >= 4000) { K.lastPush = now; (A.pushNow || A.pushLive)(); if (K.state === 1) A.consolePanel(); }
    if (root && V && V.watch) apply(watchState());
  }
  function counts(out) {
    var K = C(); if (!K) return;
    if (K.restoring) { Object.keys(K.raw.counts).forEach(function (k) { out[k] = K.raw.counts[k]; }); return; }
    var lm = lmOf(K.board, K.nt);
    out.zptid = A.encRun(K.id); out.zptst = A.encRun(K.id + (A.console_().skew || 0));
    out.zpts = [K.state, Math.min(9999, K.dur), K.board, K.nt, K.order.length, K.salt, K.ep, K.crew];
    chunk(out, 'zptf', K.order.map(function (sid) { return T.fpn(sid, K.salt); }), 5);
    chunk(out, 'zptm', T.encPack(K.own, 5, 5), 2);
    out.zptk = lm.map(function (tile, li) { var m = 0, hf = K.half[li] || {}; Object.keys(hf).forEach(function (t) { m |= 1 << +t; }); return m; });
    chunk(out, 'zptp', K.order.map(function (sid) { return Math.min(99, K.acc[sid] || 0) * 100 + Math.min(99, K.prc[sid] || 0); }), 5);
    chunk(out, 'zptl', T.encPack(K.order.map(function (sid) { return K.last[sid] == null ? 0 : K.last[sid] + 1; }), 100, 2), 3);
    if (K.state === 2) out.zptw = K.aw.slice(0, 4);
  }
  function crewList(K) { var L = T.looks(); return K.order.map(function (sid) { return { fp: T.sh3(sid), n: T.nameOf(sid), look: T.lookOf(L, sid) }; }); }
  function spot(all) {
    var K = C(); if (K.restoring) return K.raw.spot;
    var E = '#E:' + K.seq + '|' + K.ev.map(function (e) { return [e.k, e.a, e.b].concat(e.c != null ? [e.c] : []).join('~'); }).join(',');
    return { q: 'zpt', text: (T.crewPage(crewList(K), all ? 0 : K.page || 0, all ? 999 : 12) + E).slice(0, all ? 99999 : 600) };
  }
  // the console was reloaded mid-game: keep publishing what was live until the roster is in, then pick the map back up
  function restore(Lv) {
    var b = gameOf(Lv); if (!b) return false;
    if (b.state === 2 || Date.now() - b.id > b.dur * 1000 + 60000) { A.console_().paint = null; return false; }
    var raw = {}; Object.keys(Lv.counts).forEach(function (k) { if (/^zpt/.test(k)) raw[k] = Lv.counts[k]; });
    A.console_().paint = { id: b.id, state: 1, dur: b.dur, board: b.board, nt: b.nt, salt: b.salt, ep: b.ep % 9000 + 1, restoring: b, raw: { counts: raw, spot: Lv.spot && Lv.spot.q === 'zpt' ? Lv.spot : null },
      order: [], idx: {}, own: b.own.slice(), half: {}, acc: {}, prc: {}, last: {}, rows: {}, crew: b.crewMask, flips: [0, 0, 0, 0], mid: null, aw: [], ev: [], seq: b.seq, page: 0 };
    return true;
  }
  function rebuild(K) {
    var b = K.restoring, by = {}; A.rosterIn().forEach(function (r) { by[T.fpn(r.sid, b.salt)] = r.sid; });
    for (var i = 0; i < b.n; i++) { var sid = by[b.fps[i]] || ('?' + i); K.idx[sid] = i; K.order.push(sid); K.acc[sid] = b.acc[i]; K.prc[sid] = b.prc[i]; if (b.last[i] >= 0) K.last[sid] = b.last[i]; }
    b.halves.forEach(function (m, li) { for (var t = 0; t < 4; t++) if (m >> t & 1) (K.half[li] = K.half[li] || {})[t] = '?'; });   // who started it is not known any more: any teammate can finish it
    delete K.restoring; delete K.raw;
  }
  function watchState() { var out = {}; counts(out); var b = gameOf({ lesson: A.LID, counts: out, spot: spot(true) }); b.start = C().id; return b; }
  function watch() {
    if (C().restoring) return;
    var b = watchState(); open(b); V.watch = true; apply(b);
    var x = el('button', { type: 'button', 'class': 'btn primary crwwatchx', text: '✕ Back to the console' }); x.onclick = function () { close(); }; document.body.appendChild(x);
  }
  function section(p) {
    var K = C(), sec = H('div', 'sect'), now = Date.now();
    sec.appendChild(H('h3', '', '🎨 Paint the Flats'));
    if (K.restoring) { sec.appendChild(H('p', 'muted', 'Picking the map back up…')); p.appendChild(sec); return; }
    var left = Math.max(0, Math.round(K.dur - (now - K.id) / 1000)), sc = scores(K), in_ = K.order.filter(function (sid) { return K.acc[sid] > 0; }).length;
    sec.appendChild(H('p', '', (K.state === 1 ? '<b>' + T.mmss(left) + '</b> left · ' : '<b>🏁 Finished.</b> ') + sc.map(function (s, t) { return TEAMS[t].e + ' <b>' + s.score + '</b>'; }).join(' · ') + ' · 🖌 ' + in_ + ' of ' + K.order.length + ' students have painted'));
    var r = H('div', 'row');
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: '👁 Show the map', title: 'The map on this screen', onclick: function () { watch(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '⏰ +1 minute', onclick: function () { K.dur += 60; A.pushLive(); A.consolePanel(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: 'End it now', onclick: function () { end(); } }));
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: 'Back to the lesson', onclick: function () { A.console_().paint = null; if (root) close(); A.pushLive(); A.consolePanel(); } }));
    sec.appendChild(r);
    var dd = T.fold('g-paint', '📋 The teams · only you see this', true), notYet = [];
    for (var t = 0; t < K.nt; t++) {
      var parts = teamSids(K, t).map(function (sid) {
        var w = K.rows[sid], a = K.acc[sid] || 0, nm = T.nameOf(sid) || '?';
        if (!a) notYet.push(nm);
        return (a ? '🖌 ' : w && w.d > 0 ? '🪣 ' : w && w.n > 0 ? '🤔 ' : '💤 ') + esc(nm) + (a ? ' ' + a : '') + (K.state !== 1 && w ? ' (' + w.r + ' right, ' + w.f + ' first time)' : '');
      });
      dd.appendChild(H('p', 'muted', '<b>' + TEAMS[t].e + ' ' + esc(TEAMS[t].n) + '</b> · ' + sc[t].score + ' points' + (sc[t].crew ? ' · ⭐ full crew' : '') + ' · ' + (parts.join(' · ') || 'nobody yet')));
    }
    if (K.state === 1) {
      dd.appendChild(H('p', 'muted', '🖌 tiles painted · 🪣 has a paint drop, has not used it · 🤔 has tried, nothing right yet · 💤 nothing yet'));
      if (notYet.length) dd.appendChild(H('p', 'muted', '<b>Not painted yet (' + notYet.length + '):</b> ' + notYet.map(esc).join(', ') + '. A quiet word is worth a lot: their first tile paints two, and their team cannot get its full-crew bonus without them.'));
    }
    sec.appendChild(dd);
    p.appendChild(sec);
  }
  (A.every || function (f, ms) { setInterval(f, ms); })(function () { if (A.MODE === 'teach' && A.console_() && C()) tick(); }, 1000);

  (function css() {
    if (document.getElementById('sfaPtCss')) return;
    var c = document.createElement('style'); c.id = 'sfaPtCss';
    c.textContent = [
      '.crw.pt{background:#0b0e24}',
      '.ptscene{background:radial-gradient(ellipse at 50% 40%,#1b2a66 0,#10173d 55%,#0b0e24 100%)}',
      '.ptscene:before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.07) 1.5px,transparent 1.6px);background-size:26px 26px;pointer-events:none}',
      '.ptwrap{position:absolute;inset:0;display:flex;flex-direction:column;gap:6px;padding:8px}',
      '.ptmapbox{position:relative;flex:1;min-height:0;display:flex;align-items:center;justify-content:center;order:2}',
      '.ptboard{position:relative;filter:drop-shadow(0 10px 0 rgba(0,0,0,.35))}',
      '.ptboard svg{display:block;width:100%;height:auto;overflow:visible}',
      '.pth polygon{fill:#E4D29B;stroke:#141428;stroke-width:4;stroke-linejoin:round;transition:fill .35s}',
      '.pth.alt polygon{fill:#D9C385}',
      '.pth.t1 polygon{fill:#FFC94A}.pth.t2 polygon{fill:#2DD4BF}.pth.t3 polygon{fill:#FF7AC0}.pth.t4 polygon{fill:#7AA2FF}',
      '.pth text{text-anchor:middle;pointer-events:none;user-select:none}',
      '.ptem{font-size:34px;opacity:.5}',
      '.pth.lm polygon{fill:#2a2350;stroke:#FFE14D;stroke-width:5}',
      '.pth.lm.t1 polygon{fill:#FFC94A}.pth.lm.t2 polygon{fill:#2DD4BF}.pth.lm.t3 polygon{fill:#FF7AC0}.pth.lm.t4 polygon{fill:#7AA2FF}',
      '.ptring{fill:rgba(255,255,255,.1);stroke:#FFE14D;stroke-width:2.5;stroke-dasharray:7 6;pointer-events:none}',
      '.pth.lm.t1 .ptring,.pth.lm.t2 .ptring,.pth.lm.t3 .ptring,.pth.lm.t4 .ptring{fill:rgba(255,255,255,.45);stroke:#141428;stroke-dasharray:none}',
      '.pth.lm.half .ptring{animation:ptspin 6s linear infinite;transform-box:fill-box;transform-origin:center}',
      '.ptic{font-size:42px}.ptstar{font-size:24px;fill:#FFE14D;stroke:#141428;stroke-width:1.2}',
      '.pth.pend polygon{stroke-dasharray:10 7;animation:ptdry 1s linear infinite}',
      '.canpaint .pth.can{cursor:pointer}.canpaint .pth.can polygon{stroke:#fff}',
      '.canpaint .pth.can.flip polygon{stroke-dasharray:9 6}',
      '.canpaint .pth.lm.can .ptring{stroke:#fff}',
      '.pth.lm.ours polygon{stroke:#fff;stroke-width:6}',
      '.pth.splat polygon,.pth.splat .ptem{animation:ptsplat .6s cubic-bezier(.2,1.7,.4,1) both;transform-box:fill-box;transform-origin:center}',
      '.ptsel{fill:rgba(255,255,255,.5);stroke:#FFE14D;stroke-width:9;stroke-linejoin:round;pointer-events:none;animation:ptpulse .8s ease-in-out infinite alternate}',
      '@keyframes ptsplat{0%{transform:scale(.15)}60%{transform:scale(1.22)}100%{transform:scale(1)}}',
      '@keyframes ptdry{to{stroke-dashoffset:-17}}',
      '@keyframes ptpulse{from{opacity:.55}to{opacity:1}}',
      '@keyframes ptspin{to{transform:rotate(360deg)}}',
      '.ptavs{position:absolute;inset:0;pointer-events:none}',
      '.ptav{position:absolute;transform:translate(-50%,-64%);display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 3px 0 rgba(0,0,0,.35))}',
      '.ptav svg{width:100%;height:auto;display:block}.ptav .crwname{margin-top:-4px;font-size:clamp(9px,1.05vw,17px);background:rgba(12,10,24,.7);padding:0 5px;border-radius:6px}',
      '.ptav.hop{animation:pthop .7s cubic-bezier(.2,1.6,.4,1) both}.ptav.you .crwname{color:#FFE14D}',
      '@keyframes pthop{0%{transform:translate(-50%,-150%) scale(.4);opacity:0}60%{transform:translate(-50%,-58%) scale(1.15,.9);opacity:1}100%{transform:translate(-50%,-64%)}}',
      /* the scoreboard: a row of chips over the map on a student's screen, a tall panel beside it on the class screen */
      '.ptscore{order:1;display:flex;gap:6px;flex-wrap:wrap;align-items:stretch;position:relative;z-index:2}',
      '.ptrow{flex:1 1 0;min-width:0;display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:12px;background:rgba(12,10,24,.78);border:2px solid var(--tc)}',
      '.ptrow.mine{box-shadow:0 0 0 2px #fff,0 0 14px var(--tc)}',
      '.ptbadge{flex:none;width:1.7em;height:1.7em;border-radius:50%;background:var(--tc);display:flex;align-items:center;justify-content:center;font-size:15px;border:2px solid #141428}',
      '.ptinfo{flex:1;min-width:0;display:flex;flex-direction:column}.ptinfo b{font-size:12px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--tc)}',
      '.ptinfo small{display:none;font-size:11px;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.ptbar{display:block;height:5px;border-radius:4px;background:rgba(255,255,255,.14);overflow:hidden;margin-top:3px}.ptbar u{display:block;height:100%;background:var(--tc);border-radius:4px;transition:width .6s}',
      '.ptrow strong{font:400 22px "Luckiest Guy",system-ui;color:#fff;line-height:1}',
      '.pttip{display:none}',
      '.crwban.ptbig{top:9vh;font-size:clamp(18px,2.5vw,48px);padding:.4em 1.1em;border-width:4px}',
      '.crw.pt.screen .ptwrap{flex-direction:row;gap:1.4vw;padding:1.4vw}',
      '.crw.pt.screen .ptmapbox{order:1}',
      '.crw.pt.screen .ptscore{order:2;flex:none;width:min(27vw,520px);flex-direction:column;flex-wrap:nowrap;justify-content:center;gap:1.1vw}',
      '.crw.pt.screen .ptrow{flex:none;gap:1vw;padding:1vw 1.2vw;border-width:4px;border-radius:1.2vw}',
      '.crw.pt.screen .ptbadge{font-size:clamp(20px,2.6vw,50px);border-width:3px}',
      '.crw.pt.screen .ptinfo b{font:400 clamp(15px,1.75vw,34px) "Luckiest Guy",system-ui;letter-spacing:.02em;white-space:normal}',
      '.crw.pt.screen .ptinfo small{display:block;font-size:clamp(11px,1.05vw,20px);font-weight:700;white-space:normal;line-height:1.2}',
      '.crw.pt.screen .ptbar{height:clamp(6px,.7vw,14px);margin-top:.4vw;border-radius:99px}',
      '.crw.pt.screen .ptrow strong{font-size:clamp(30px,4.2vw,80px);min-width:1.3em;text-align:right;color:var(--tc);text-shadow:0 .06em 0 rgba(0,0,0,.5)}',
      '.crw.pt.screen .pttip{display:block;margin:.6vw 0 0;min-height:2.6em;font-size:clamp(12px,1.25vw,24px);font-weight:700;text-align:center;color:#9FE8FF}',
      '.ptgo{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);z-index:6;display:flex;align-items:center;gap:10px;padding:6px 8px 6px 14px;border-radius:99px;background:rgba(12,10,24,.92);border:2px solid #FFE14D;box-shadow:0 8px 24px rgba(0,0,0,.5);max-width:96%;animation:crwbin .25s cubic-bezier(.2,1.6,.4,1) both}',
      '.ptgo[hidden]{display:none}.ptgo span{font-weight:700;font-size:14px;line-height:1.15}.ptgo .btn{white-space:nowrap;flex:none}',
      '.ptgo.idle{display:none}',
      /* my card */
      '.ptteam{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:14px;background:linear-gradient(90deg,var(--tk),rgba(0,0,0,0));border:2px solid var(--tc);margin-bottom:8px}',
      '.ptteam span{font-size:30px;line-height:1}.ptteam div{flex:1;display:flex;flex-direction:column}.ptteam small{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;opacity:.85}',
      '.ptteam b{font:400 22px "Luckiest Guy",system-ui;color:var(--tc);letter-spacing:.02em;line-height:1.05}.ptteam strong{font:400 30px "Luckiest Guy",system-ui;color:#fff}',
      '.ptdrops{display:flex;align-items:center;gap:8px;margin:0 0 8px}',
      '.ptdrops i{width:26px;height:34px;border-radius:50% 50% 50% 50%/62% 62% 38% 38%;clip-path:polygon(50% 0,100% 62%,88% 88%,50% 100%,12% 88%,0 62%);background:rgba(255,255,255,.14)}',
      '.ptdrops i.on{background:linear-gradient(#fff,#FFE14D 30%,#FF9A3D);filter:drop-shadow(0 0 6px rgba(255,200,80,.8))}.ptdrops b{font-weight:800;color:#FFE14D}',
      '.ptstat{margin:0 0 6px;font-size:15px;line-height:1.35}.ptstat b{color:#FFE14D}.ptstat.small{font-size:13px;opacity:.9}.ptstat.small:empty{display:none}',
      '.ptmates{display:flex;flex-wrap:wrap;gap:6px 8px;margin:6px 0}',
      '.ptmate{display:flex;flex-direction:column;align-items:center;width:52px;padding:3px 2px;border-radius:10px;background:rgba(255,255,255,.06);border:1.5px dashed rgba(255,225,77,.7)}',
      '.ptmate.in{border:1.5px solid rgba(255,255,255,.18)}.ptmate svg{width:34px;height:auto}.ptmate span{font-size:22px}',
      '.ptmate b{font-size:10.5px;line-height:1.1;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ptmate small{font-size:10.5px;font-weight:800;color:#FFE14D}',
      '.ptmate.in small{color:#9FE8FF}',
      /* the awards */
      '.ptend{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2vh;padding:2vh 2vw;background:rgba(8,8,22,.86);overflow:auto}',
      '.ptend h1{margin:0;font:400 clamp(22px,5vw,84px) "Luckiest Guy",system-ui;color:#FFE14D;text-shadow:0 .06em 0 rgba(0,0,0,.5);text-align:center;animation:crwbin2 .6s cubic-bezier(.2,1.6,.4,1) both}',
      '.ptcards{display:flex;flex-wrap:wrap;justify-content:center;align-items:stretch;gap:1.4vw;width:100%}',
      '.ptcard{flex:1 1 200px;max-width:min(30vw,600px);display:flex;flex-direction:column;gap:.6vw;padding:1.2vw 1.3vw 1.1vw;border-radius:18px;background:linear-gradient(var(--tk),#141230 70%);border:4px solid var(--tc);box-shadow:0 10px 0 rgba(0,0,0,.4);animation:ptcard .6s cubic-bezier(.2,1.5,.4,1) both;text-align:center}',
      '@keyframes ptcard{from{transform:translateY(40px) scale(.8);opacity:0}to{transform:none;opacity:1}}',
      '.ptchead{display:flex;align-items:center;gap:8px;text-align:left}.ptchead span{font-size:clamp(20px,2.8vw,54px)}.ptchead b{flex:1;font:400 clamp(15px,2vw,38px) "Luckiest Guy",system-ui;color:var(--tc)}.ptchead strong{font:400 clamp(20px,3.2vw,62px) "Luckiest Guy",system-ui}',
      '.ptaw{display:flex;flex-direction:column;align-items:center}.ptaw span{font-size:clamp(30px,6vw,116px);line-height:1.1;animation:ptaw 2.4s ease-in-out infinite}.ptaw b{font:400 clamp(16px,2.5vw,48px) "Luckiest Guy",system-ui;color:#FFE14D;line-height:1.05}',
      '@keyframes ptaw{0%,100%{transform:rotate(-5deg) scale(1)}50%{transform:rotate(5deg) scale(1.08)}}',
      '.ptcard p{margin:0;font-size:clamp(12px,1.4vw,27px);font-weight:600;line-height:1.25}',
      '.ptwho{display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-end;gap:2px 6px;margin-top:auto;padding-top:6px}',
      '.ptbob{display:flex;flex-direction:column;align-items:center;animation:ptbob 1.6s ease-in-out infinite}.ptbob svg{width:100%;height:auto}.ptbob .crwname{font-size:clamp(9px,1.1vw,21px)}',
      '@keyframes ptbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}',
      '@media (max-width:820px){.ptgo,.ptgo.idle{position:relative;left:auto;bottom:auto;transform:none;display:flex;justify-content:center;margin:0 8px 2px;min-height:46px;animation:none;max-width:none}.ptgo.idle{border-color:rgba(255,255,255,.2);padding:6px 14px}.ptgo.idle span{font-weight:600;opacity:.9}.ptgo[hidden]{display:none}.crw.pt:not(.screen) .ptscene{height:auto;min-height:0;padding-bottom:6px}.crw.pt:not(.screen) .ptwrap{position:relative;inset:auto}.crw.pt:not(.screen) .ptmapbox{flex:none;padding:4px 0 10px}.ptwrap{padding:5px}.ptrow{padding:3px 5px;gap:4px;border-radius:9px}.ptbadge{font-size:12px}.ptinfo b{font-size:10.5px}.ptrow strong{font-size:18px}' +
        '.crw.pt:not(.screen) .ptend{position:relative;inset:auto;justify-content:flex-start;gap:6px;padding:8px}.crw.pt:not(.screen) .ptover .ptmapbox,.crw.pt:not(.screen) .ptover .ptgo{display:none}.crw.pt:not(.screen) .ptcards{gap:6px}.crw.pt:not(.screen) .ptcard{flex:1 1 100%;max-width:none;gap:3px;padding:6px 10px;border-width:2px;border-radius:12px}.crw.pt:not(.screen) .ptchead b{font-size:17px}.crw.pt:not(.screen) .ptchead strong{font-size:22px}.crw.pt:not(.screen) .ptaw{flex-direction:row;justify-content:center;gap:8px}.crw.pt:not(.screen) .ptaw span{font-size:26px}.crw.pt:not(.screen) .ptaw b{font-size:18px}.crw.pt:not(.screen) .ptcard p{font-size:12.5px}.crw.pt:not(.screen) .ptwho{padding-top:2px}}',
      '@media (max-width:480px){.ptinfo b{display:none}.ptbar{margin-top:0}.ptgo span{font-size:12px}}',
      '@media (prefers-reduced-motion:reduce){.pth.splat polygon,.pth.splat .ptem,.ptav.hop,.ptbob,.ptaw span,.ptsel,.pth.pend polygon,.pth.lm.half .ptring,.ptcard{animation:none}}'
    ].join('\n');
    document.head.appendChild(c);
  })();

  window.SFA_PAINT = { sync: sync, agg: agg, section: section, start: start, counts: counts, spot: function () { return spot(); }, restore: restore, gameOf: gameOf };
})();
