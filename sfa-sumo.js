/* 🤼 Sumo Graphing: teams of two wrestle with straight-line graphs. Loaded by sfa-lesson.js when the teacher starts it.

   Every problem: a rule (y = 2x − 3, later negative and fraction slopes and rearranged rules), fill a table of three x
   values, plot two points on the grid, draw the line through them, then use the line to find a point that's off the table
   (when x = 6, y = ?; or when y = −5, x = ?). Every step right earns power for the student's team (half for a second try).

   Every 30 seconds the console compares each pair's power with their opponents' since the last bout and turns it into a
   sumo move on every screen: a short film of the four avatars (in sumo belts) charging, slapping, pushing and throwing.
   A bigger gap is a bigger push; out of the ring is a point. A fight lasts 2 minutes (four bouts). Three fights: after each,
   winners meet winners and the rest meet each other. At the end, a highlight reel of the best moves on every screen.

   Sync through the Sheet like the Boss Raid: students send one running row (q "zsumox1", an x1 extra, so it never counts
   as a lesson answer) with their points and steps. The console referees, and publishes in the live counts:
     zss  state (3 teams, 1 fighting, 5 bell, 4 rematch, 2 over), round, rounds, round length, bout, phase start (s after
          the id), teams, matches
     zsw  each team's wins, zsl their last result (four teams to a number)
     zsm0… each match: team a, team b (99: the Sumo-Bot), ring position + 100, bout, move, winner side, who did it,
          ring-outs a and b, live power a and b this bout, result
   and the spotlight (spot.q "zsumo"): "P:" a page of the roster (team.member~fingerprint~name~look; long rosters take
   turns), and at the end "R:" the highlight reel and "S:" the standings. */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API, SFA = window.SFA, AV = window.SFA_AVATAR;
  if (!A || !SFA || window.SFA_SUMO) return;
  var H = A.H, el = A.el, esc = SFA.esc;
  var QID = 'zsumox1', CLIP = 30, ROUNDS = 3, INTRO = 16, BELL = 8, BREAK = 14, GR = 8, MOVIE = 6900, PUSH_MS = 4000, BOT = 99, REEL_N = 5, FIN_INTRO = 10, DEMO_S = 30, FIN_AUTO = 40;
  var SIDE = [{ n: 'EAST', c: '#FF5B5B', e: '🔴' }, { n: 'WEST', c: '#53B7FF', e: '🔵' }];
  var MOVES = [
    { n: 'STAREDOWN', en: 'nobody scored, nobody blinks', e: '👀' },
    { n: 'LOCKED GRIP', en: 'belt to belt: nobody budges', e: '🤝' },
    { n: 'TSUPPARI', en: 'slap barrage', e: '✋' },
    { n: 'OSHIDASHI', en: 'frontal push', e: '💨' },
    { n: 'UWATENAGE', en: 'overarm throw', e: '🌀' },
    { n: 'HATAKIKOMI', en: 'slap down', e: '👇' },
    { n: 'UTCHARI', en: 'comeback throw from the edge', e: '🔄' },
    { n: 'YORIKIRI', en: 'force out', e: '🚪' },
    { n: 'TAG-TEAM CHARGE', en: 'both partners charge', e: '👊' },
    { n: 'YOKOZUNA RUMBLE', en: 'grand champion super move', e: '⚡' },
    { n: 'PANCAKE PRESS', en: 'flying belly flop: flat as a pancake', e: '🥞' },
    { n: 'SUMO TORNADO', en: 'spun round and round and flung', e: '🌪️' },
    { n: 'BOWLING BALL', en: 'rolled up and bowled a strike', e: '🎳' }
  ];
  var STA = ['Thunder', 'Mochi', 'Volcano', 'Tsunami', 'Noodle', 'Iron', 'Dumpling', 'Typhoon', 'Wasabi', 'Boulder', 'Sushi', 'Quake', 'Ramen', 'Avalanche', 'Tofu', 'Meteor', 'Panda', 'Blizzard', 'Teriyaki', 'Dragon'];
  var STB = ['Bellies', 'Crushers', 'Stompers', 'Titans', 'Bumpers', 'Mountains', 'Rumblers', 'Wobblers'];
  var BOT_LOOK = AV ? AV.encode({ b: 2, e: 1, m: 1, h: 0, a: 0, t: 0, n: 0, k: 9, p: 0 }) : '';
  var TX = 'translateX(-50%) ';

  function mix32(h) { h = h >>> 0; h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return h >>> 0; }
  function rng(seed) { var s = mix32(seed) || 1; return function () { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return ((s >>> 8) & 0xffff) / 65536; }; }
  function hash(t) { var h = 5381; t = String(t); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h; }
  function sh3(sid) { return (hash(sid) % 46656).toString(36); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function clean(n) { return String(n || '').replace(/[~,#|.;]/g, '').slice(0, 12); }
  function sNow() { return Date.now() + (A.srvSkew() || 0); }
  function nm(n) { return n < 0 ? '−' + (-n) : String(n); }
  function pt(x, y) { return '(' + nm(x) + ', ' + nm(y) + ')'; }
  function clock(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function avSvg(look, size) { return AV ? AV.svg(look || '', { size: size || 90 }) : '<span class="smnoav">🙂</span>'; }
  function teamName(t, id) { if (t === BOT) return 'Sumo-Bot 3000'; if (t >= 90) { var F = V && V.o && V.o.fin && V.o.fin[t - 90]; return F ? F.n : 'Finalist'; } var k = Math.round(id / 1000) % 20; return STA[(t + k) % STA.length] + ' ' + STB[(t * 3 + k) % STB.length]; }
  function pack(arr) { var out = []; for (var i = 0; i < arr.length && out.length < 12; i += 4) out.push((arr[i] || 0) * 1000 + (arr[i + 1] || 0) * 100 + (arr[i + 2] || 0) * 10 + (arr[i + 3] || 0)); return out; }
  function unpack(a, n) { var out = []; (a || []).forEach(function (v) { out.push(Math.floor(v / 1000) % 10, Math.floor(v / 100) % 10, Math.floor(v / 10) % 10, v % 10); }); return out.slice(0, n); }

  // the game in the live state
  function sumoOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zss) || !Array.isArray(c.zsid)) return null;
    var z = c.zss, id = A.decRun(c.zsid), start = A.MODE === 'screen' ? id : A.decRun(c.zsst) || id;
    var o = { id: id, start: start, state: z[0], round: z[1] || 1, rounds: z[2] || ROUNDS, rlen: z[3] || 120, clip: z[4] || 0, at: start + (z[5] || 0) * 1000, nt: z[6] || 0, nm: z[7] || 0, intro: z[8] || INTRO, demo: z[9] || 0, autoFin: z[10] || 0, m: [], ros: [], reel: [], stand: [], fin: null, work: [null, null] };
    o.w = unpack(c.zsw, o.nt); o.l = unpack(c.zsl, o.nt);
    for (var i = 0; i < o.nm; i++) { var q = c['zsm' + i]; if (Array.isArray(q)) o.m.push({ i: i, a: q[0], b: q[1], pos: q[2] - 100, seq: q[3], mv: q[4], ws: q[5], ac: q[6], sa: q[7], sb: q[8], la: q[9], lb: q[10], fl: q[11] }); }
    var sp = Lv.spot && Lv.spot.q === 'zsumo' ? String(Lv.spot.text || '') : '';
    sp.split('#').forEach(function (part) {
      var k = part.slice(0, 2), v = part.slice(2);
      if (k === 'P:') { var bar = v.indexOf('|'); (bar >= 0 ? v.slice(bar + 1) : '').split(',').forEach(function (x) { var p = x.split('~'), ti = (p[0] || '').split('.'); if (p[1]) o.ros.push({ t: +ti[0], i: +ti[1] || 0, fp: p[1], n: p[2] || '?', look: p[3] || '' }); }); }
      else if (k === 'R:' && v) o.reel = v.split(',').map(function (x) { var p = x.split('.').map(Number); return { r: p[0], mv: p[1], a: p[2], b: p[3], ws: p[4], ac: p[5], p0: p[6] - 200, p1: p[7] - 200, ro: p[8] }; }).filter(function (h) { return MOVES[h.mv]; });
      else if (k === 'S:' && v) o.stand = v.split(',').map(function (x) { var p = x.split('.').map(Number); return { t: p[0], w: p[1], pts: p[2] }; });
      else if (k === 'F:' && v) o.fin = v.split(',').map(function (x) { var p = x.split('~'); return { fp: p[0], n: p[1] || '?', look: p[2] || '' }; });
      else if (k === 'W:') o.work = v.split('|').map(decWork);
    });
    return o;
  }

  // a finalist's problem as it travels: seed.level.stage.table (n: empty).points (x_y~x_y).power.graphs
  function decWork(s) { var p = String(s || '').split('.'); if (p.length < 5 || !p[0]) return null; return { seed: +p[0], lvl: +p[1] || 1, stage: +p[2] || 0, tv: (p[3] || 'n_n_n').split('_').map(function (v) { return v === 'n' || v === '' ? null : +v; }), pm: (p[4] ? p[4].split('~') : []).map(function (q) { var a = q.split('_'); return [+a[0], +a[1]]; }).filter(function (q) { return !isNaN(q[0]) && !isNaN(q[1]); }), p: +p[5] || 0, c: +p[6] || 0 }; }
  function encWork(P) { return P ? P.seed + '.' + P.lvl + '.' + P.stage + '.' + P.tv.map(function (v) { return v == null ? 'n' : v; }).join('_') + '.' + P.pm.map(function (q) { return q[0] + '_' + q[1]; }).join('~') : ''; }

  /* =========================== the problems =========================== */
  // a line y = (mn/md)x + b, three table x values, and a point off the table to find with the line
  function gen(seed, lvl) {
    var r = rng(seed), ri = function (a, b) { return a + Math.floor(r() * (b - a + 1)); }, pick = function (a) { return a[Math.floor(r() * a.length)]; };
    for (var t = 0; t < 300; t++) {
      var mn, md = 1, b, xs, form = 0;
      if (lvl <= 1) { mn = ri(1, 5); b = ri(-7, 7); xs = pick([[0, 1, 2], [1, 2, 3], [0, 2, 4], [-1, 0, 1], [2, 3, 4], [0, 1, 3], [-2, 0, 2]]); }
      else if (lvl === 2) { mn = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]); b = ri(-8, 8); xs = pick([[-1, 0, 1], [-2, 0, 2], [1, 2, 3], [-2, -1, 0], [-3, -1, 1], [0, 2, 3], [-1, 1, 2], [2, 4, 5], [-4, -2, 0]]); }
      else if (lvl === 3 || r() < 0.5) { var fr = pick([[1, 2], [-1, 2], [1, 3], [-1, 3], [2, 3], [-2, 3], [3, 2], [-3, 2], [1, 4], [-1, 4], [3, 4], [-3, 4], [5, 2], [-5, 2], [4, 3], [-4, 3]]); mn = fr[0]; md = fr[1]; b = ri(-6, 6); xs = pick([[-md, 0, md], [0, md, 2 * md], [-2 * md, -md, 0], [-md, md, 2 * md]]); }
      else { mn = pick([-5, -4, -3, -2, -1, 2, 3, 4, 5]); b = ri(-8, 8); xs = pick([[-2, 0, 2], [-1, 1, 3], [-3, -1, 1], [1, 2, 4], [-4, -3, -1], [0, 3, 4]]); }
      if (lvl >= 4) form = pick([1, 2, 3, 0]); else if (lvl === 2 && r() < 0.25) form = 1;
      if (form === 3 && !(mn === -1 && md === 1)) form = 1;
      if ((form === 1 || form === 2) && b === 0) form = 0;
      var f = function (x) { return mn * x / md + b; }, ys = xs.map(f);
      if (ys.filter(function (y) { return Math.abs(y) <= GR; }).length < 2) continue;
      var cand = [];
      for (var x = -GR; x <= GR; x++) { if (x % md || xs.indexOf(x) >= 0) continue; var y = f(x); if (Math.abs(y) <= GR) cand.push([x, y]); }
      var far = cand.filter(function (c) { return Math.abs(c[0]) >= 3; }); if (far.length) cand = far;
      if (!cand.length) continue;
      var tg = pick(cand);
      return { mn: mn, md: md, b: b, xs: xs, ys: ys.map(function (y) { return y + 0; }), form: form, ask: lvl <= 1 ? 'y' : r() < 0.5 ? 'x' : 'y', tx: tg[0], ty: tg[1] + 0, lvl: lvl };
    }
    return { mn: 1, md: 1, b: 1, xs: [0, 1, 2], ys: [1, 2, 3], form: 0, ask: 'y', tx: 4, ty: 5, lvl: 1 };
  }
  function onLine(Q, x, y) { return (y - Q.b) * Q.md === Q.mn * x; }
  function coef(Q, html) {
    var a = Math.abs(Q.mn), neg = Q.mn < 0;
    if (Q.md === 1) return (neg ? '−' : '') + (a === 1 ? '' : a);
    return (neg ? '−' : '') + (html ? '<span class="smfr"><i>' + a + '</i><i>' + Q.md + '</i></span>' : '(' + a + '/' + Q.md + ')');
  }
  function slopeInt(Q, html) { var X = html ? '<i class="smx">x</i>' : 'x', Y = html ? '<i class="smx">y</i>' : 'y'; return Y + ' = ' + coef(Q, html) + X + (Q.b > 0 ? ' + ' + Q.b : Q.b < 0 ? ' − ' + (-Q.b) : ''); }
  function ruleHTML(Q) {
    var X = '<i class="smx">x</i>', Y = '<i class="smx">y</i>', c = coef(Q, true), pos = c.charAt(0) === '−' ? c.slice(1) : c;
    if (Q.form === 3) return X + ' + ' + Y + ' = ' + nm(Q.b);
    if (Q.form === 2) return Y + ' ' + (Q.b > 0 ? '− ' + Q.b : '+ ' + (-Q.b)) + ' = ' + c + X;
    if (Q.form === 1) return Y + ' = ' + nm(Q.b) + (Q.mn < 0 ? ' − ' : ' + ') + pos + X;
    return slopeInt(Q, true);
  }
  function tableHint(Q, x) {
    var co = Q.md === 1 ? nm(Q.mn) : '(' + nm(Q.mn) + '/' + Q.md + ')';
    return (Q.form ? 'That rule is ' + slopeInt(Q) + '. So ' : '') + 'y = ' + co + ' × ' + (x < 0 ? '(' + nm(x) + ')' : x) + (Q.b > 0 ? ' + ' + Q.b : Q.b < 0 ? ' − ' + (-Q.b) : '');
  }

  /* =========================== student page and class screen =========================== */
  var root = null, V = null, ST = null;
  function key() { return 'sumo.' + A.LID; }
  function keep() { if (ST) SFA.store.set(key(), ST); }
  function xp(n, once) { if (A.hero && V) A.hero.add('s', String(Math.round(V.id / 1000)) + (once ? 'e' : ''), n, once); }
  function hinfo() { return A.hero ? A.hero.info() : { lv: 1 }; }
  function screenish() { return A.MODE !== 'student'; }
  function fighting() { return !!(V && V.o && (V.o.state === 1 || V.o.state === 7)); }

  function sync() {
    var Lv = A.live(), o = A.isLive() || A.MODE === 'screen' ? sumoOf(Lv) : null;
    if (o && A.MODE !== 'teach' && stale(o)) o = null;
    if (A.MODE === 'student' && A.saving() && !A.S.me) o = null;
    if (!o) { if (root && !(V && V.watch)) close(); return; }
    if (V && V.watch) return;
    if (!root || V.id !== o.id) open(o);
    apply(o);
  }
  function stale(o) { var age = sNow() - o.at; return o.state === 2 ? age > 6 * 60000 : age > (o.rlen + 300) * 1000; }
  function open(o) {
    close();
    var saved = SFA.store.get(key(), null);
    ST = saved && saved.id === o.id ? saved : { id: o.id, p: 0, c: 0, f: 0, w: 0, k: 0, b: 0, ms: [0, 0, 0, 0], s1: 0, sn: 0, n: 0, pr: null, reelSeen: 0 };
    V = { id: o.id, o: o, ros: {}, mp: {}, cards: {}, sig: '' };
    var rs = SFA.store.get('sumo.ros.' + A.LID, null); if (rs && rs.id === o.id) V.ros = rs.ros || {};
    root = H('div', 'sm' + (screenish() ? ' screen' : '')); root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Sumo Graphing');
    document.body.appendChild(root); document.body.classList.add('boarding'); document.body.classList.add('clashing');
    V.tick = setInterval(function () { if (root) drawTop(); }, 250);
    V.key = function (e) { onKey(e); }; document.addEventListener('keydown', V.key);
    if (A.MODE === 'student' && !(saved && saved.id === o.id)) send();   // so the console sees a late arrival and gives them a team
  }
  function close() {
    if (!root) return;
    clearInterval(V.tick); document.removeEventListener('keydown', V.key); clearTimeout(V.reelT);
    [].forEach.call(document.querySelectorAll('.smv'), function (x) { x.remove(); });
    Object.keys(V.cards).forEach(function (k) { var c = V.cards[k]; if (c.box && c.box._stop) c.box._stop(); });
    root.remove(); root = null; V = null; document.body.classList.remove('boarding'); document.body.classList.remove('clashing');
  }

  // who's who: the roster arrives a page at a time, so every page keeps what it has seen
  function mergeRoster(o) {
    if (!o.ros.length) return false;
    var ch = false;
    o.ros.forEach(function (r) { var x = V.ros[r.fp]; if (!x || x.t !== r.t || x.i !== r.i || x.look !== r.look || x.n !== r.n) { V.ros[r.fp] = { t: r.t, i: r.i, n: r.n, look: r.look }; ch = true; } });
    if (ch) SFA.store.set('sumo.ros.' + A.LID, { id: V.id, ros: V.ros });
    return ch;
  }
  function mem(t) {
    if (t === BOT) return [{ n: 'Sumo-Bot', look: BOT_LOOK }];
    if (t >= 90) { var F = V.o && V.o.fin && V.o.fin[t - 90]; return [F ? { n: F.n, look: F.look } : { n: '…', look: '' }]; }
    var out = []; Object.keys(V.ros).forEach(function (fp) { var r = V.ros[fp]; if (r.t === t) out.push({ n: r.n, look: r.look, i: r.i, fp: fp }); });
    out.sort(function (a, b) { return a.i - b.i; });
    return out.length ? out : [{ n: '…', look: '' }];
  }
  function names(t) { return mem(t).map(function (x) { return x.n; }).join(' & '); }
  function myFp() { return A.MODE === 'student' && A.S.me ? sh3(A.S.me.sid) : ''; }
  function myTeam() { var o = V.o; if (o && o.state >= 6) { var fi = -1; (o.fin || []).forEach(function (f, i) { if (f.fp === myFp()) fi = i; }); if (fi >= 0) return 90 + fi; } var r = V.ros[myFp()]; return r ? r.t : -1; }
  function finalist() { var t = myTeam(); return t >= 90 && t < BOT; }
  function myMatch(o) { var t = myTeam(); if (t < 0) return null; for (var i = 0; i < o.m.length; i++) if (o.m[i].a === t || o.m[i].b === t) return o.m[i]; return null; }
  function actor(m, ws, ac) { var M = mem(ws ? m.b : m.a); if (ac === 3 && M.length > 1) return M.map(function (x) { return x.n; }).join(' & '); return (M[ac] || M[0]).n; }

  function apply(o) {
    var prev = V.o; V.o = o;
    var rch = mergeRoster(o), films = [];
    // a bout happened: play it (every match on the class screen, your own on your device)
    o.m.forEach(function (m) {
      var k = o.round + ':' + m.a + 'v' + m.b, p = V.mp[k];
      if (p && m.seq > p.seq && (o.state === 1 || o.state === 5 || o.state === 7 || o.state === 8)) {
        var ro = m.sa > p.sa ? 1 : m.sb > p.sb ? 1 : 0, p1 = m.sa > p.sa ? 110 : m.sb > p.sb ? -110 : m.pos;
        films.push({ m: m, p0: p.pos, p1: p1, ro: ro, title: (o.state >= 6 ? '🥇 GRAND FINAL' : 'FIGHT ' + o.round) + ' · BOUT ' + m.seq });
      }
      V.mp[k] = { seq: m.seq, pos: m.pos, sa: m.sa, sb: m.sb };
    });
    var mm = A.MODE === 'student' ? myMatch(o) : null;
    var sig = [o.state, o.round, o.nm, o.m.map(function (m) { return m.a + 'v' + m.b; }).join(','), A.MODE === 'student' ? [myTeam(), mm ? mm.a + 'v' + mm.b : '', mm ? mem(mm.a).length + mem(mm.b).length : 0].join('.') : Object.keys(V.ros).length, o.reel.length, o.stand.length, o.fin ? o.fin.map(function (f) { return f.fp; }).join(',') : ''].join('|');
    if (sig !== V.sig || (rch && o.state !== 1 && o.state !== 2 && o.state !== 7)) { V.sig = sig; draw(); }
    else upd();
    // the films after the redraw, so a new screen (the bell) doesn't cut them off
    films.forEach(function (f) { if (screenish()) cardMovie(f.m, f); else if (f.m === mm || o.state >= 6) bigMovie(f); });
    if (prev && prev.state !== o.state) {
      if (o.state === 1) snd('bell');
      if (o.state === 5) snd('bell');
    }
  }

  /* ---------- drawing ---------- */
  function draw() {
    var o = V.o; if (!root) return;
    Object.keys(V.cards).forEach(function (k) { var c = V.cards[k]; if (c.box && c.box._stop) c.box._stop(); }); V.cards = {};
    root.innerHTML = '';
    root.appendChild(topBar());
    if (V.demoStop && o.state !== 3) { V.demoStop(); V.demoStop = null; V.demoBox = null; }
    V.wbox = null;
    if (o.state >= 6) { if (!screenish() && finalist() && o.state === 7) stFight(); else if (o.state === 6) finIntro(); else if (o.state === 7) finView(); else finEnd(); }
    else if (screenish()) { if (o.state === 3) scrIntro(); else if (o.state === 1 || o.state === 5) scrArena(); else if (o.state === 4) scrBreak(); else scrEnd(); }
    else if (myTeam() < 0) root.appendChild(H('div', 'smcard', '<h2>🤼 Finding your team…</h2><p>The console is putting you in a pair. This takes a few seconds.</p>'));
    else if (o.state === 3) stIntro();
    else if (o.state === 1) stFight();
    else if (o.state === 5) stBell();
    else if (o.state === 4) stBreak();
    else stEnd();
    if (V.watch) { var x = el('button', { type: 'button', 'class': 'btn smback', text: '✕ Back to the console' }); x.onclick = function () { close(); }; root.querySelector('.smright').appendChild(x); }
    drawTop();
  }
  function topBar() {
    var o = V.o, t = H('div', 'smtop');
    t.innerHTML = '<div class="smlogo">🤼 <b>SUMO GRAPHING</b></div><div class="smmid"><span class="smrd"></span><b class="smclock"></b><small class="smsub"></small></div>' +
      '<div class="smright"><button type="button" class="smsnd" title="Sound">' + (soundOn() ? '🔊' : '🔇') + '</button></div>';
    t.querySelector('.smsnd').onclick = function () { SFA.store.set('sumo.sound', !soundOn()); this.textContent = soundOn() ? '🔊' : '🔇'; snd('taiko'); };
    return t;
  }
  function dots(n) { return n ? new Array(Math.min(n, 9) + 1).join('●') : ''; }
  function drawTop() {
    var o = V && V.o; if (!o || !root) return;
    var now = A.MODE === 'teach' ? Date.now() : sNow(), e = (now - o.at) / 1000, rd = root.querySelector('.smrd'), ck = root.querySelector('.smclock'), sub = root.querySelector('.smsub');
    if (!rd) return;
    if (o.state === 3) { rd.textContent = 'Meet the teams'; ck.textContent = clock(o.intro - e); sub.textContent = 'first bout soon'; }
    else if (o.state === 1 || o.state === 7) { var nb = Math.ceil(o.rlen / CLIP); rd.textContent = (o.state === 7 ? '🥇 Grand final' : 'Fight ' + o.round + ' of ' + o.rounds) + ' · Bout ' + Math.min(nb, o.clip + 1) + ' of ' + nb; ck.textContent = clock(o.rlen - e); sub.textContent = 'next move in ' + Math.max(0, Math.ceil((o.clip + 1) * CLIP - e)) + ' s'; }
    else if (o.state === 5) { rd.textContent = 'Fight ' + o.round + ' of ' + o.rounds; ck.textContent = '🔔'; sub.textContent = 'the bell!'; }
    else if (o.state === 4) { rd.textContent = 'Rematch!'; ck.textContent = clock(BREAK - e); sub.textContent = 'Fight ' + (o.round + 1) + ' starts soon'; }
    else if (o.state === 6) { rd.textContent = '🥇 Grand final'; ck.textContent = clock(FIN_INTRO - e); sub.textContent = 'the top two, 1 v 1'; }
    else if (o.state === 8) { rd.textContent = 'Grand champion'; ck.textContent = '🏆'; sub.textContent = ''; }
    else { rd.textContent = 'Final results'; ck.textContent = '🏆'; sub.textContent = o.autoFin ? 'grand final next' : ''; }
  }

  // the arena: the ring, the roof, the crowd and the wrestlers. Everything that zooms with the camera sits in .smcam.
  // Each wrestler: .smw (where they stand) > .smbod (squash and stretch: the body, belt, dizzy eyes and sunglasses) + stars
  function scene(box, L, R, small) {
    var st = H('div', 'smst' + (small ? ' small' : '')), cam = H('div', 'smcam');
    cam.innerHTML = '<div class="smroof"><i></i><i></i><i></i><i></i></div><div class="smcrowd" aria-hidden="true">' + new Array(7).join('🙌👏😮🎉🤩📣👀🙌🎌👏') + '</div><div class="smring"><i class="smln l"></i><i class="smln r"></i></div>';
    st.appendChild(cam);
    var s = [L, R].map(function (M, k) {
      var sd = H('div', 'smsd s' + k);
      M.slice(0, 3).forEach(function (x, j) { var w = H('div', 'smw w' + j); w.innerHTML = '<div class="smbod">' + avSvg(x.look, 120) + '<i class="smbelt" style="--bc:' + SIDE[k].c + '"></i><i class="smeyes"><b></b><b></b></i><i class="smshades">🕶️</i></div><i class="smstars">⭐ 💫 ⭐</i>'; sd.appendChild(w); });
      cam.appendChild(sd); return sd;
    });
    box.appendChild(st);
    return { st: st, cam: cam, s: s };
  }
  function xAt(p) { return 50 + Math.max(-110, Math.min(110, p)) * 0.38; }
  function place(S, p) { S.s[0].style.left = (xAt(p) - 9) + '%'; S.s[1].style.left = (xAt(p) + 9) + '%'; }
  function fx(st, txt, x, y, dur, cls) {
    var f = H('span', 'smfx' + (cls ? ' ' + cls : ''), txt); f.style.left = x + '%'; f.style.top = y + '%'; st.appendChild(f);
    if (f.animate) f.animate([{ transform: 'translate(-50%,0) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,-20%) scale(1.15)', opacity: 1, offset: .2 }, { transform: 'translate(-50%,-80%) scale(1)', opacity: 0 }], { duration: dur || 900, easing: 'ease-out', fill: 'forwards' });
    setTimeout(function () { f.remove(); }, (dur || 900) + 50);
  }
  function dust(st, x) { fx(st, '💨', x - 4, 66, 700); fx(st, '💨', x + 4, 68, 700); }
  function flash(st, x) { var f = st.querySelector('.smflash'); if (!f || !f.animate) return; f.style.setProperty('--fx', x + '%'); f.animate([{ opacity: 0 }, { opacity: 0.95 }, { opacity: 0 }], { duration: 320 }); }
  function pickOne(a) { return a[Math.floor(Math.random() * a.length)]; }
  var IMPACT = ['BWOMP!', 'SPLOOSH!', 'THWACK!', 'BOING!', 'KER-BLAM!', 'WHUMP!', 'SPLAT!'];
  var ANN = { hit: ['OH, THE BELLY!', 'WHAT A SHOVE!', 'THEY FELT THAT IN THE CHEAP SEATS!', 'BELLY TO BELLY!', 'SOMEBODY CALL A DOCTOR!', 'THE CROWD GOES WILD!'],
    0: ['AWKWARD…', 'THE STAREDOWN… SOMEBODY SOLVE SOMETHING!'], 1: ['NOBODY BUDGES!', 'A BATTLE OF THE BELLIES!'], 2: ['SLAP CITY!', 'THE HANDS ARE A BLUR!'], 4: ['WE HAVE LIFT-OFF!', 'AIRBORNE!'],
    5: ['FACE PLANT!', 'RIGHT INTO THE SAND!'], 6: ['FROM THE EDGE! UNBELIEVABLE!', 'WHAT A COMEBACK!'], 8: ['DOUBLE TROUBLE!', 'TEAMWORK!'], 9: ['THE YOKOZUNA RUMBLE!!!', 'ORBIT ACHIEVED!'],
    10: ['FLAT AS A PANCAKE!', 'WHO ORDERED BREAKFAST?', 'EXTRA SYRUP!'], 11: ['A HUMAN TORNADO!', 'THEY ARE SPINNING!', 'GET THE MOP, THEY ARE DIZZY!'], 12: ['STRIKE!', 'A PERFECT GAME!', 'ROLLING THUNDER!'],
    ro: ['INTO THE CROWD!', 'SEE YOU LATER!', 'BYE BYE!', 'SOMEBODY CATCH THEM!'] };

  /* the film of one bout: o = { L, R (members), p0, p1 (ring position before and after; ±110 is out), mv, ws (0 east won,
     1 west won, 2 even), ro, title, sub }. About 7 s: salt, stomp, the referee, crouch, CHARGE, a slow-motion zoom on the
     bellies colliding, the move, then sunglasses for the winner, dizzy stars for the loser, and the move's name. */
  function movie(box, o) {
    if (box._stop) box._stop();
    box.innerHTML = '';
    var S = scene(box, o.L, o.R, o.small), st = S.st, cam = S.cam, an = [], timers = [];
    var ws = o.ws, W = ws === 2 ? null : S.s[ws], Lo = ws === 2 ? null : S.s[1 - ws], dir = ws === 1 ? -1 : 1;
    var c0 = xAt(o.p0), c1 = xAt(o.p1), Lx = 22, Rx = 78, MV = MOVES[o.mv] || MOVES[0];
    function an_(e, kf, op) { if (e && e.animate) an.push(e.animate(kf, Object.assign({ fill: 'forwards', easing: 'ease-out' }, op))); }
    function later(ms, f) { timers.push(setTimeout(function () { if (st.isConnected) f(); }, ms)); }
    function slide(e, a, b, delay, dur, ease) { an_(e, [{ left: a + '%' }, { left: b + '%' }], { delay: delay, duration: dur, easing: ease || 'ease-out' }); }
    function bods(sd) { return sd ? [].slice.call(sd.querySelectorAll('.smbod')) : []; }
    function squash(sd, kf, op) { bods(sd).forEach(function (b, i) { an_(b, kf, Object.assign({ fill: 'none', easing: 'ease-in-out' }, op, { delay: (op.delay || 0) + i * 70 })); }); }
    function sc(x, y) { return { transform: 'scale(' + x + ',' + y + ')' }; }
    var JELLY = [sc(1, 1), sc(0.78, 1.2), sc(1.16, 0.88), sc(0.92, 1.07), sc(1.04, 0.97), sc(1, 1)];
    var ann = pickOne(o.ro ? ANN.ro : ANN[o.mv] && Math.random() < 0.75 ? ANN[o.mv] : ANN.hit);
    st.insertAdjacentHTML('beforeend', '<i class="smbar smbt"></i><i class="smbar smbb"></i><div class="smtitle">' + esc(o.title || '') + '</div><div class="smflash"></div><div class="smspeed"></div>' +
      '<div class="smref">🪭 HAKKIYOI!</div><div class="smcomic">' + pickOne(IMPACT) + '</div>' + (o.ro ? '<div class="smstamp">RING OUT!</div>' : '') +
      '<div class="smban"><i class="smann">' + esc(ann) + '</i><b>' + MV.e + ' ' + MV.n + '</b><span>' + (o.sub || '') + '</span></div>');
    var q = function (x) { return st.querySelector(x); };
    S.s[0].style.left = Lx + '%'; S.s[1].style.left = Rx + '%';
    an_(q('.smbar.smbt'), [{ top: '-10%' }, { top: '0%' }], { duration: 400 }); an_(q('.smbar.smbb'), [{ bottom: '-10%' }, { bottom: '0%' }], { duration: 400 });
    an_(q('.smtitle'), [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1)', offset: 0.2 }, { opacity: 1, transform: 'scale(1)', offset: 0.8 }, { opacity: 0, transform: 'scale(1)' }], { duration: 1200, delay: 100 });
    // the salt throw: a handful each, up into the air
    later(400, function () { snd('salt'); [0, 1].forEach(function (k) { var x = k ? Rx - 3 : Lx + 3; fx(cam, '🧂', x, 44, 600); for (var i = 0; i < 5; i++) (function (i) { later(i * 70, function () { fx(cam, '✨', x + (k ? -1 : 1) * (2 + i * 2.5), 40 - i * 4, 800); }); })(i); }); });
    [0, 1].forEach(function (k) { squash(S.s[k], [sc(1, 1), sc(0.9, 1.1), sc(1, 1)], { delay: 380, duration: 400 }); });
    // shiko: both sides stomp twice, and the bellies wobble when they land
    var hop = [{ transform: TX + 'translateY(0)' }, { transform: TX + 'translateY(-18%)', offset: 0.25 }, { transform: TX + 'translateY(0)', offset: 0.5 }, { transform: TX + 'translateY(-18%)', offset: 0.75 }, { transform: TX + 'translateY(0)' }];
    [0, 1].forEach(function (k) { an_(S.s[k], hop, { delay: 950, duration: 760, fill: 'none', easing: 'ease-in-out' }); squash(S.s[k], [sc(1, 1), sc(1.18, 0.84), sc(1, 1)], { delay: 1110, duration: 260 }); squash(S.s[k], [sc(1, 1), sc(1.18, 0.84), sc(1, 1)], { delay: 1490, duration: 260 }); });
    later(1140, function () { snd('taiko'); dust(cam, Lx); dust(cam, Rx); }); later(1520, function () { snd('taiko'); dust(cam, Lx); dust(cam, Rx); });
    // the referee's call, then a nervous crouch (and sweat)
    an_(q('.smref'), [{ opacity: 0, transform: 'translateX(-50%) scale(.4)' }, { opacity: 1, transform: 'translateX(-50%) scale(1.15)', offset: 0.2 }, { opacity: 1, transform: 'translateX(-50%) scale(1)', offset: 0.85 }, { opacity: 0, transform: 'translateX(-50%) scale(1)' }], { delay: 1700, duration: 900, fill: 'none' });
    later(1700, function () { snd('whistle'); });
    later(1850, function () { fx(cam, '💦', Lx + 4, 30, 700); fx(cam, '💦', Rx - 4, 30, 700); });
    var T = 2450, A0 = T + 800, BAN = 4950;   // the tachiai (they meet), the move after the slow-motion, the move's name
    if (o.mv === 0) {
      [0, 1].forEach(function (k) { squash(S.s[k], [sc(1, 1), sc(1.1, 0.88)], { delay: 1900, duration: 300, fill: 'forwards' }); an_(S.s[k], [{ transform: TX + 'scale(1)' }, { transform: TX + 'translateY(-3%) scale(1.06)' }], { delay: 2300, duration: 450, direction: 'alternate', iterations: 6, fill: 'none' }); });
      q('.smcomic').textContent = '…'; q('.smcomic').style.left = '50%';
      an_(q('.smcomic'), [{ opacity: 0, transform: 'translateX(-50%) scale(.5)' }, { opacity: 1, transform: 'translateX(-50%) scale(1)', offset: 0.2 }, { opacity: 1, transform: 'translateX(-50%) scale(1)', offset: 0.85 }, { opacity: 0, transform: 'translateX(-50%) scale(1)' }], { delay: 2600, duration: 1800, fill: 'none' });
      later(2400, function () { fx(cam, '⚡', 50, 48, 1600); later(400, function () { fx(cam, '⚡', 50, 44, 1400); }); fx(cam, '😤', 28, 30, 1400); fx(cam, '😤', 72, 30, 1400); });
      later(3600, function () { fx(cam, '🦗', 50, 58, 1500); snd('cricket'); });
    } else {
      // crouch, then CHARGE: they stretch as they launch
      [0, 1].forEach(function (k) { squash(S.s[k], [sc(1, 1), sc(1.14, 0.84), sc(1.14, 0.84), sc(0.86, 1.14)], { delay: 1850, duration: 600, fill: 'forwards' }); });
      slide(S.s[0], Lx, c0 - 9, 2050, 400, 'ease-in'); slide(S.s[1], Rx, c0 + 9, 2050, 400, 'ease-in');
      // the collision, in slow motion: zoom on the bellies, speed lines, a comic-book sound, both bellies jiggle like jelly
      later(T, function () { snd('clash'); snd('boing'); flash(st, c0); });
      an_(st, [{ transform: 'none' }, { transform: 'translate(1.4%,-1.2%)' }, { transform: 'translate(-1.2%,1%)' }, { transform: 'translate(.7%,-.5%)' }, { transform: 'none' }], { delay: T, duration: 380, fill: 'none' });
      cam.style.transformOrigin = c0 + '% 66%';
      an_(cam, [{ transform: 'scale(1)' }, { transform: 'scale(1.55)', offset: 0.14 }, { transform: 'scale(1.6)', offset: 0.78 }, { transform: 'scale(1)' }], { delay: T, duration: 1000, fill: 'none', easing: 'ease-out' });
      q('.smspeed').style.setProperty('--fx', c0 + '%');
      an_(q('.smspeed'), [{ opacity: 0 }, { opacity: 0.7, offset: 0.15 }, { opacity: 0.7, offset: 0.7 }, { opacity: 0 }], { delay: T, duration: 900, fill: 'none' });
      q('.smcomic').style.left = c0 + '%';
      an_(q('.smcomic'), [{ opacity: 0, transform: 'translateX(-50%) rotate(-10deg) scale(.3)' }, { opacity: 1, transform: 'translateX(-50%) rotate(-10deg) scale(1.25)', offset: 0.18 }, { opacity: 1, transform: 'translateX(-50%) rotate(-5deg) scale(1)', offset: 0.8 }, { opacity: 0, transform: 'translateX(-50%) rotate(0deg) scale(1.5)' }], { delay: T, duration: 950, fill: 'none' });
      [0, 1].forEach(function (k) { squash(S.s[k], JELLY, { delay: T, duration: 850 }); });
      var wF = c0 - 9 * dir, loF = c0 + 9 * dir, wT = c1 - 9 * dir, loT = c1 + 9 * dir;
      var push = function (d0, dur, ease) { slide(W, wF, wT, d0, dur, ease || 'cubic-bezier(.25,.1,.25,1)'); slide(Lo, loF, loT, d0, dur, ease || 'cubic-bezier(.25,.1,.25,1)'); squash(W, [sc(1, 1), sc(1.08, 0.94), sc(1, 1)], { delay: d0, duration: dur }); squash(Lo, [sc(1, 1), sc(0.9, 1.08), sc(1, 1)], { delay: d0, duration: dur }); };
      var dizzy = function (ms) { later(ms, function () { if (Lo) Lo.classList.add('dizzy'); }); };
      // out of the ring: they fly right into the crowd, and the crowd ducks
      var tumble = function (d0) {
        if (!o.ro) return;
        var far = Math.max(9, Math.min(91, loT + 8 * dir));
        an_(Lo, [{ transform: TX + 'translateY(0) rotate(0deg) scale(1)' }, { transform: TX + 'translateY(-130%) rotate(' + (dir * 220) + 'deg) scale(.8)', offset: 0.5 }, { transform: TX + 'translateY(-118%) rotate(' + (dir * 400) + 'deg) scale(.58)' }], { delay: d0, duration: 750, easing: 'ease-out' });
        slide(Lo, loT, far, d0, 750);
        squash(Lo, [sc(1, 1), sc(0.75, 1.3), sc(1.2, 0.8)], { delay: d0, duration: 750, fill: 'forwards' });
        later(d0 + 700, function () { fx(cam, '💥', far, 16, 700); fx(cam, '😱', far - 6 * dir, 12, 1000); fx(cam, '🙀', far - 12 * dir, 14, 1000); snd('ooh'); });
        an_(cam.querySelector('.smcrowd'), [{ transform: 'translateY(0)' }, { transform: 'translateY(-14%) rotate(-1deg)' }, { transform: 'translateY(6%) rotate(1deg)' }, { transform: 'translateY(0)' }], { delay: d0 + 700, duration: 500, fill: 'none' });
      };
      var arc = function (e, d0, dur, up, spin) { an_(e, [{ transform: TX + 'translateY(0) rotate(0deg)' }, { transform: TX + 'translateY(' + up + '%) rotate(' + (spin / 2) + 'deg)', offset: 0.5 }, { transform: TX + 'translateY(0) rotate(' + spin + 'deg)' }], { delay: d0, duration: dur, easing: 'ease-in-out' }); };
      // slaps: a hand shoots out of the winner, again and again
      var slaps = function (d0, n) {
        var w0 = W && W.querySelector('.w0'); if (!w0) return;
        var h = H('i', 'smhand', ws ? '🤚' : '✋'); w0.appendChild(h);
        an_(h, [{ transform: 'translateX(0) scale(1)', opacity: 1 }, { transform: 'translateX(' + (dir * 110) + '%) scale(1.3)', opacity: 1 }], { delay: d0, duration: 85, iterations: n * 2, direction: 'alternate', fill: 'none', easing: 'ease-in' });
        later(d0 + n * 170 + 50, function () { h.remove(); });
      };
      if (o.mv === 1) {
        an_(S.s[0], [{ left: (c0 - 9) + '%' }, { left: (c0 - 7) + '%' }, { left: (c0 - 11) + '%' }, { left: (c0 - 8) + '%' }, { left: (c0 - 9) + '%' }], { delay: A0, duration: 1600 });
        an_(S.s[1], [{ left: (c0 + 9) + '%' }, { left: (c0 + 11) + '%' }, { left: (c0 + 7) + '%' }, { left: (c0 + 10) + '%' }, { left: (c0 + 9) + '%' }], { delay: A0, duration: 1600 });
        [0, 1].forEach(function (k) { squash(S.s[k], [sc(1, 1), sc(0.88, 1.1), sc(1.1, 0.9), sc(0.9, 1.1), sc(1, 1)], { delay: A0, duration: 1600 }); });
        later(A0 + 300, function () { fx(cam, '💦', c0 - 7, 30, 1100); fx(cam, '💦', c0 + 7, 32, 1100); snd('ooh'); }); later(A0 + 900, function () { fx(cam, '😣', c0 - 9, 26, 900); fx(cam, '😣', c0 + 9, 26, 900); });
      } else if (o.mv === 2) {
        slaps(A0, 6);
        squash(Lo, [sc(1, 1), sc(1.2, 0.86), sc(0.84, 1.15), sc(1.2, 0.86), sc(0.84, 1.15), sc(1.2, 0.86), sc(0.84, 1.15), sc(1, 1)], { delay: A0 + 60, duration: 1020, easing: 'linear' });
        for (var i = 0; i < 6; i++) (function (i) { later(A0 + 80 + i * 170, function () { fx(cam, ['💥', '✋', '💢'][i % 3], loF + (i % 3 - 1) * 4, 28 + (i % 2) * 10, 500); snd('slap'); }); })(i);
        push(A0 + 1050, 600); dizzy(A0 + 1100); tumble(A0 + 1650);
      } else if (o.mv === 3) {
        later(A0 + 150, function () { fx(cam, '💨', wF - 10 * dir, 52, 800); fx(cam, '💨', wF - 13 * dir, 58, 800); });
        push(A0, 1300); dizzy(A0 + 1000); tumble(A0 + 1300);
      } else if (o.mv === 7) {
        push(A0, 1450, 'ease-in-out'); later(A0 + 400, function () { fx(cam, '😤', wF, 24, 900); fx(cam, '😫', loF, 24, 900); }); dizzy(A0 + 1100); tumble(A0 + 1450);
      } else if (o.mv === 4) {
        slide(W, wF, wT, A0 + 100, 1100); slide(Lo, loF, loT, A0 + 200, 1100, 'ease-in-out'); arc(Lo, A0 + 200, 1100, -85, dir * 360);
        squash(Lo, [sc(1, 1), sc(0.72, 1.32), sc(0.9, 1.1), sc(1.3, 0.74), sc(1, 1)], { delay: A0 + 200, duration: 1300 });
        later(A0 + 1280, function () { dust(cam, loT); snd('thud'); fx(cam, '💫', loT, 34, 900); }); dizzy(A0 + 1300); tumble(A0 + 1400);
      } else if (o.mv === 6) {
        slide(W, wF, wF - 6 * dir, A0, 500); slide(Lo, loF, loF - 6 * dir, A0, 500);
        later(A0 + 100, function () { fx(cam, '😰', wF - 6 * dir, 22, 700); snd('ooh'); });
        squash(W, [sc(1, 1), sc(0.85, 1.12), sc(0.85, 1.12), sc(1.2, 0.85), sc(1, 1)], { delay: A0, duration: 800 });
        slide(Lo, loF - 6 * dir, loT, A0 + 600, 1000, 'ease-in-out'); arc(Lo, A0 + 600, 1000, -95, dir * 360); slide(W, wF - 6 * dir, wT, A0 + 650, 900);
        squash(Lo, [sc(1, 1), sc(0.72, 1.32), sc(1.3, 0.74), sc(1, 1)], { delay: A0 + 600, duration: 1100 });
        later(A0 + 1580, function () { dust(cam, loT); snd('thud'); }); dizzy(A0 + 1600); tumble(A0 + 1650);
      } else if (o.mv === 5) {
        an_(W, [{ transform: TX + 'scale(1)' }, { transform: TX + 'translateY(-12%) scale(.94)' }, { transform: TX + 'scale(1)' }], { delay: A0, duration: 600, fill: 'none' });
        slaps(A0 + 60, 1);
        an_(Lo, [{ transform: TX + 'rotate(0deg)' }, { transform: TX + 'translateY(32%) rotate(' + (-dir * 88) + 'deg)', offset: 0.3 }, { transform: TX + 'translateY(32%) rotate(' + (-dir * 88) + 'deg)', offset: 0.7 }, { transform: TX + 'rotate(0deg)' }], { delay: A0 + 80, duration: 1500, fill: 'none' });
        squash(Lo, [sc(1, 1), sc(1, 1), sc(1.25, 0.7), sc(1.25, 0.7), sc(1, 1)], { delay: A0 + 80, duration: 1500 });
        later(A0 + 520, function () { dust(cam, loF); snd('thud'); fx(cam, '💢', loF, 34, 700); fx(cam, '🥴', loF, 26, 1000); });
        push(A0 + 900, 650); dizzy(A0 + 500); tumble(A0 + 1600);
      } else if (o.mv === 8) {
        var back = W.querySelector('.w1');
        if (back) an_(back, [{ transform: 'none' }, { transform: 'translate(' + (dir * 70) + '%,-70%) rotate(' + (dir * 25) + 'deg)', offset: 0.5 }, { transform: 'translate(' + (dir * 35) + '%,0)' }], { delay: A0, duration: 700 });
        later(A0 + 120, function () { fx(cam, '👊', loF - 3, 32, 700); later(160, function () { fx(cam, '👊', loF + 3, 40, 700); snd('slap'); }); });
        later(A0 + 680, function () { snd('boing'); }); squash(Lo, JELLY, { delay: A0 + 650, duration: 700 });
        push(A0 + 650, 1000); dizzy(A0 + 1200); tumble(A0 + 1650);
      } else if (o.mv === 9) {
        an_(st, [{ filter: 'none' }, { filter: 'brightness(2.4) saturate(1.8)' }, { filter: 'none' }], { delay: A0, duration: 500, fill: 'none' });
        later(A0, function () { fx(cam, '⚡', c0 - 12, 20, 900); fx(cam, '⚡', c0 + 12, 16, 900); fx(cam, '⚡', c0, 10, 900); snd('boing'); });
        squash(W, [sc(1, 1), sc(1.3, 0.8), sc(0.85, 1.2), sc(1, 1)], { delay: A0, duration: 500 });
        slide(Lo, loF, loT, A0 + 150, 1500); arc(Lo, A0 + 150, 1500, -260, dir * 720); slide(W, wF, wT, A0 + 200, 900);
        squash(Lo, [sc(1, 1), sc(0.7, 1.35), sc(0.8, 1.2), sc(1.35, 0.7), sc(1, 1)], { delay: A0 + 150, duration: 1600 });
        later(A0 + 700, function () { fx(cam, '🛰️', loF, 6, 900); });
        later(A0 + 1600, function () { dust(cam, loT); dust(cam, loT - 6); snd('thud'); });
        an_(st, [{ transform: 'none' }, { transform: 'translate(1.8%,-1.6%)' }, { transform: 'translate(-1.4%,1.2%)' }, { transform: 'none' }], { delay: A0 + 1600, duration: 400, fill: 'none' });
        dizzy(A0 + 1650); tumble(A0 + 1700);
      } else if (o.mv === 10) {
        // PANCAKE PRESS: up, up, up… and a belly flop that flattens them, butter and syrup on top, then they peel off the floor
        W.style.zIndex = 4;
        later(A0, function () { snd('whoosh'); fx(cam, '😨', loF, 24, 900); });
        slide(W, wF, loF, A0, 1000, 'ease-in-out');
        an_(W, [{ transform: TX + 'translateY(0) rotate(0deg)' }, { transform: TX + 'translateY(-170%) rotate(' + (-dir * 25) + 'deg)', offset: 0.55 }, { transform: TX + 'translateY(-14%) rotate(0deg)' }], { delay: A0, duration: 1000, easing: 'cubic-bezier(.5,0,.9,.6)' });
        squash(W, [sc(1, 1), sc(0.8, 1.25), sc(1.2, 0.85)], { delay: A0, duration: 1000, fill: 'forwards' });
        squash(Lo, [sc(1, 1), sc(2.3, 0.1)], { delay: A0 + 1000, duration: 110, fill: 'forwards', easing: 'ease-in' });
        later(A0 + 1000, function () {
          snd('splat'); flash(st, loF); dust(cam, loF - 6); dust(cam, loF + 6);
          fx(cam, 'PANCAKE!', loF, 26, 1300, 'smword'); fx(cam, '🥞', loF, 50, 1300);
        });
        an_(st, [{ transform: 'none' }, { transform: 'translate(0,2%)' }, { transform: 'translate(0,-1.2%)' }, { transform: 'none' }], { delay: A0 + 1000, duration: 350, fill: 'none' });
        later(A0 + 1250, function () { fx(cam, '🧈', loF - 2, 50, 1100); }); later(A0 + 1400, function () { fx(cam, '🍯', loF + 3, 48, 1100); snd('boing'); });
        // the winner bounces off the pancake and lands
        an_(W, [{ transform: TX + 'translateY(-14%)' }, { transform: TX + 'translateY(-70%)' }, { transform: TX + 'translateY(0)' }], { delay: A0 + 1150, duration: 600, easing: 'ease-in-out' });
        slide(W, loF, wT, A0 + 1150, 600);
        squash(W, [sc(1.2, 0.85), sc(1, 1)], { delay: A0 + 1150, duration: 400, fill: 'forwards' });
        if (o.ro) { later(A0 + 1500, function () { fx(cam, '🍳', loF, 30, 900); }); tumble(A0 + 1600); }
        else {
          squash(Lo, [sc(2.3, 0.1), sc(2.3, 0.1), sc(0.8, 1.3), sc(1.12, 0.9), sc(1, 1)], { delay: A0 + 1550, duration: 700, fill: 'forwards' });
          slide(Lo, loF, loT, A0 + 1650, 500); dizzy(A0 + 1900);
        }
      } else if (o.mv === 11) {
        // SUMO TORNADO: the winner spins like a top, the rival gets caught in it and is flung away spinning
        later(A0, function () { snd('whoosh'); fx(cam, '🌪️', wF, 30, 1300); }); later(A0 + 450, function () { snd('whoosh'); fx(cam, '💨', loF, 40, 800); fx(cam, '🌀', wF, 46, 900); });
        squash(W, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(1800deg)' }], { delay: A0, duration: 1500, easing: 'ease-in-out' });
        an_(W, [{ transform: TX + 'translateY(0)' }, { transform: TX + 'translateY(-10%)' }, { transform: TX + 'translateY(0)' }], { delay: A0, duration: 300, iterations: 5, fill: 'none' });
        squash(Lo, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(1080deg)' }], { delay: A0 + 350, duration: 1150, easing: 'ease-in' });
        an_(Lo, [{ transform: TX + 'translateY(0) rotate(0deg)' }, { transform: TX + 'translateY(-45%) rotate(' + (dir * 360) + 'deg)', offset: 0.6 }, { transform: TX + 'translateY(0) rotate(' + (dir * 720) + 'deg)' }], { delay: A0 + 450, duration: 1100, easing: 'ease-in-out' });
        slide(Lo, loF, loT, A0 + 450, 1100, 'ease-in'); slide(W, wF, wT, A0 + 300, 1200, 'ease-in-out');
        later(A0 + 1150, function () { fx(cam, 'WHEEEE!', loT, 22, 1100, 'smword'); fx(cam, '😵‍💫', loT, 30, 1000); });
        later(A0 + 1550, function () { dust(cam, loT); snd('thud'); }); dizzy(A0 + 1500); tumble(A0 + 1600);
      } else if (o.mv === 12) {
        // BOWLING BALL: a run-up, curl into a ball, roll… STRIKE! The rival goes flying like a pin
        slide(W, wF, wF - 12 * dir, A0, 400, 'ease-out');
        squash(W, [sc(1, 1), sc(0.78, 0.72)], { delay: A0 + 200, duration: 200, fill: 'forwards' });
        later(A0 + 250, function () { fx(cam, '🎳', wF - 12 * dir, 30, 800); snd('whoosh'); });
        slide(W, wF - 12 * dir, loF - 6 * dir, A0 + 450, 600, 'ease-in');
        an_(W, [{ transform: TX + 'translateY(6%) rotate(0deg)' }, { transform: TX + 'translateY(6%) rotate(' + (dir * 900) + 'deg)' }], { delay: A0 + 450, duration: 600, easing: 'ease-in' });
        later(A0 + 1050, function () {
          snd('strike'); flash(st, loF); fx(cam, 'STRIKE!', loF, 24, 1400, 'smword');
          for (var i = 0; i < 5; i++) fx(cam, ['💥', '⭐', '✨'][i % 3], loF + (i - 2) * 4, 34 + (i % 2) * 10, 900);
        });
        an_(Lo, [{ transform: TX + 'translateY(0) rotate(0deg)' }, { transform: TX + 'translateY(-40%) rotate(' + (dir * 70) + 'deg)', offset: 0.4 }, { transform: TX + 'translateY(8%) rotate(' + (dir * 95) + 'deg)' }], { delay: A0 + 1050, duration: 650, easing: 'ease-out' });
        slide(Lo, loF, loT, A0 + 1050, 650);
        later(A0 + 1650, function () { dust(cam, loT); snd('thud'); });
        // the ball rolls on to its spot and unrolls into a wrestler again
        an_(W, [{ transform: TX + 'translateY(6%) rotate(' + (dir * 900) + 'deg)' }, { transform: TX + 'translateY(0) rotate(' + (dir * 1080) + 'deg)' }], { delay: A0 + 1050, duration: 450, easing: 'ease-out' });
        slide(W, loF - 6 * dir, wT, A0 + 1050, 450);
        squash(W, [sc(0.78, 0.72), sc(1.15, 0.9), sc(1, 1)], { delay: A0 + 1500, duration: 400, fill: 'forwards' });
        if (o.ro) tumble(A0 + 1700);
        else { an_(Lo, [{ transform: TX + 'translateY(8%) rotate(' + (dir * 95) + 'deg)' }, { transform: TX + 'translateY(0) rotate(0deg)' }], { delay: A0 + 1900, duration: 450, easing: 'cubic-bezier(.3,1.6,.6,1)' }); dizzy(A0 + 1800); }
      }
      // the winner: sunglasses on, a flex and a little victory hop; the referee's fan points their way
      if (W) {
        later(BAN - 150, function () { W.classList.add('cool'); fx(cam, '🪭', (ws ? wT + 6 : wT - 6), 22, 1400); snd('boing'); });
        squash(W, [sc(1, 1), sc(1.15, 0.86), sc(0.92, 1.12), sc(1.05, 0.96), sc(1, 1)], { delay: BAN - 100, duration: 700 });
        an_(W, [{ transform: TX + 'translateY(0)' }, { transform: TX + 'translateY(-14%)' }, { transform: TX + 'translateY(0)' }], { delay: BAN, duration: 420, iterations: 2, fill: 'none', easing: 'ease-out' });
      }
    }
    if (o.ro) { an_(q('.smstamp'), [{ opacity: 0, transform: 'rotate(-12deg) scale(3)' }, { opacity: 1, transform: 'rotate(-12deg) scale(1)' }], { delay: BAN - 250, duration: 300 }); later(BAN - 200, function () { for (var c = 0; c < 8; c++) fx(st, ['🎌', '✨', '🎉'][c % 3], 10 + c * 11, 20 + (c % 3) * 12, 1300); }); }
    an_(q('.smban'), [{ opacity: 0, transform: 'scale(2.2)' }, { opacity: 1, transform: 'scale(1)', offset: 0.25 }, { opacity: 1, transform: 'scale(1)' }], { delay: BAN, duration: 1300 });
    an_(cam.querySelector('.smcrowd'), [{ transform: 'translateY(0)' }, { transform: 'translateY(-8%)' }], { delay: BAN, duration: 240, iterations: 6, direction: 'alternate', fill: 'none' });
    later(BAN, function () { snd('crowd'); });
    box._stop = function () { an.forEach(function (a) { try { a.cancel(); } catch (e) { } }); timers.forEach(clearTimeout); box._stop = null; };
    return S;
  }
  function filmOf(f, small) {
    var m = f.m, ws = m.ws;
    var who = ws === 2 ? '' : '<b>' + esc(actor(m, ws, m.ac)) + '</b>';
    var sub = ws === 2 ? MOVES[m.mv].en : MOVES[m.mv].en + ' by ' + who + (f.ro ? ' · a point for ' + esc(teamName(ws ? m.b : m.a, V.id)) + '!' : '');
    return { L: mem(m.a), R: mem(m.b), p0: f.p0, p1: f.p1, mv: m.mv, ws: ws, ro: f.ro, title: f.title, sub: sub, small: small };
  }
  // on a student's device: the bout full screen (tap to skip)
  function bigMovie(f) {
    [].forEach.call(document.querySelectorAll('.smv'), function (x) { x.remove(); });
    var ov = H('div', 'smv'), box = H('div', 'smvbox'); ov.appendChild(box); ov.appendChild(H('small', 'smskip', 'tap to skip'));
    document.body.appendChild(ov);
    var t9 = myTeam(), mine = f.m.a === t9 ? 0 : f.m.b === t9 ? 1 : -1, F = filmOf(f), won = f.m.ws === mine, lost = f.m.ws === 1 - mine;
    F.sub += won ? ' <em class="smyay">YOUR TEAM!</em>' : lost ? ' <em class="smboo">Answer faster to hit back!</em>' : '';
    movie(box, F);
    var gone = false, end = function () { if (gone) return; gone = true; if (box._stop) box._stop(); ov.remove(); upd(); };
    setTimeout(function () { ov.onclick = end; }, 1200);
    setTimeout(end, MOVIE + 400);
  }
  // on the class screen: every match plays its bout in its own card, all at once
  function cardMovie(m, f) {
    var c = V.cards[m.a + 'v' + m.b]; if (!c) return;
    c.busy = Date.now() + MOVIE; movie(c.box, filmOf(f, true));
    setTimeout(function () { if (V && V.cards[m.a + 'v' + m.b] === c && Date.now() >= c.busy - 50) { c.busy = 0; c.S = scene(c.box, mem(m.a), mem(m.b), true); place(c.S, m.pos); updCard(c, m); } }, MOVIE + 200);
  }

  // a match card: the ring and the live tug of war
  function card(m, big) {
    var c = { root: H('div', 'smmatch' + (big ? ' smbigc' : '')), busy: 0 };
    var t0 = A.MODE === 'student' ? myTeam() : -9, you = ' <i class="smyou">you</i>';
    c.root.innerHTML = '<div class="smmh"><span class="smtn s0" style="--c:' + SIDE[0].c + '">' + SIDE[0].e + ' ' + esc(teamName(m.a, V.id)) + (m.a === t0 ? you : '') + ' <b class="smsho"></b></span><span class="smtn s1" style="--c:' + SIDE[1].c + '"><b class="smsho"></b> ' + (m.b === t0 ? you : '') + esc(teamName(m.b, V.id)) + ' ' + SIDE[1].e + '</span></div>' +
      '<div class="smnames"><span>' + esc(names(m.a)) + '</span><span>' + esc(names(m.b)) + '</span></div>';
    c.box = H('div', 'smbox'); c.root.appendChild(c.box);
    c.tug = H('div', 'smtug', '<b class="sma">0</b><i><u></u></i><b class="smb">0</b>'); c.root.appendChild(c.tug);
    c.res = H('div', 'smres'); c.root.appendChild(c.res);
    c.S = scene(c.box, mem(m.a), mem(m.b), !big); place(c.S, m.pos);
    updCard(c, m);
    return c;
  }
  function updCard(c, m) {
    var sh = c.root.querySelectorAll('.smmh .smsho'); sh[0].textContent = dots(m.sa); sh[1].textContent = dots(m.sb);
    c.tug.querySelector('.sma').textContent = m.la; c.tug.querySelector('.smb').textContent = m.lb;
    var tot = m.la + m.lb; c.tug.querySelector('u').style.width = (tot ? Math.round(100 * m.la / tot) : 50) + '%';
    c.tug.title = 'Power this bout';
    if (!c.busy && c.S) place(c.S, m.pos);
    var o = V.o, wt = m.fl === 1 ? m.a : m.b; c.res.textContent = (o.state === 5 || o.state === 2 || o.state === 8) && m.fl ? '🏆 ' + teamName(wt, V.id) + (wt === BOT || wt >= 90 ? ' wins ' : ' win ') + (o.state === 8 ? 'the grand final!' : 'fight ' + o.round + '!') : '';
  }
  function upd() {
    var o = V && V.o; if (!o || !root) return;
    o.m.forEach(function (m) { var c = V.cards[m.a + 'v' + m.b]; if (c) updCard(c, m); });
    if (V.wbox && o.state === 7) { var ws = JSON.stringify(o.work); if (ws !== V.wsig) { V.wsig = ws; drawBoards(); } }
    drawTop();
  }

  /* ---------- the student's screens ---------- */
  function matchup(m, mine) {
    var side = function (t, k) { return '<div class="smvside s' + k + (mine === k ? ' me' : '') + '" style="--c:' + SIDE[k].c + '"><small>' + SIDE[k].e + ' ' + SIDE[k].n + (mine === k ? ' · YOU' : '') + '</small><div class="smavs">' + mem(t).map(function (x) { return '<figure>' + avSvg(x.look, 96) + '<figcaption>' + esc(x.n) + '</figcaption></figure>'; }).join('') + '</div><b>' + esc(teamName(t, V.id)) + '</b></div>'; };
    return '<div class="smvs">' + side(m.a, 0) + '<div class="smvsx">VS</div>' + side(m.b, 1) + '</div>';
  }
  function stIntro() {
    var o = V.o, mm = myMatch(o), mine = mm ? (mm.a === myTeam() ? 0 : 1) : -1;
    var c = H('div', 'smcard');
    c.innerHTML = '<h2>🤼 Sumo Graphing!</h2>' + (mm ? matchup(mm, mine) : '') +
      '<ol class="smhow"><li>A rule like <b>y = 2x − 3</b></li><li>Fill the table</li><li>Plot two points</li><li>Draw the line</li><li>Use your line to find a point</li></ol>' +
      '<p>Every step earns power for your team. <b>Every 30 seconds</b> your team\'s power against theirs becomes a sumo move. Push them out of the ring for a point!</p><p class="muted">3 fights of ' + Math.round(o.rlen / 60 * 10) / 10 + ' minutes. Winners meet winners.</p>';
    if (o.demo) c.insertBefore(demoBox(), c.children[1]);
    root.appendChild(c);
  }
  function stBell() {
    var o = V.o, mm = myMatch(o), t = myTeam(), c = H('div', 'smcard');
    var won = mm && mm.fl && ((mm.fl === 1) === (mm.a === t));
    c.innerHTML = '<h2>🔔 The bell! Fight ' + o.round + ' is over</h2>' + (mm && mm.fl ? '<p class="smbig">' + (won ? '🏆 You won fight ' + o.round + '!' : '😤 ' + esc(teamName(mm.fl === 1 ? mm.a : mm.b, V.id)) + ' took this one.') + '</p>' : '') + '<p class="muted">' + (o.round < o.rounds ? 'Rematches next: winners meet winners.' : 'Final results and the highlight reel next…') + '</p>';
    root.appendChild(c);
  }
  function stBreak() {
    var o = V.o, t = myTeam(), mm = myMatch(o), w = o.w[t] || 0, played = o.round, res = o.l[t];
    var ring = w === played ? '🏆 Unbeaten ring' : w === 0 ? '🔥 Comeback ring' : '⚖️ Middle ring';
    var c = H('div', 'smcard');
    c.innerHTML = '<h2>' + (res === 1 ? '🏆 You won fight ' + played + '!' : res === 2 ? '😤 Fight ' + played + ' went to them. Bounce back!' : 'Fight ' + played + ' done') + '</h2>' +
      '<p class="smbig">Record <b>' + w + '–' + (played - w) + '</b> · Fight ' + (played + 1) + ': <b>' + ring + '</b></p>' + (mm ? matchup(mm, mm.a === t ? 0 : 1) : '') +
      '<p class="muted">Problems get harder this fight' + (played + 1 >= 3 ? ': fraction slopes and rearranged rules.' : ': negative slopes and finding x.') + '</p>';
    root.appendChild(c);
  }
  function stFight() {
    var o = V.o, mm = myMatch(o); if (!mm) { root.appendChild(H('div', 'smcard', '<h2>Waiting for your match…</h2>')); return; }
    var body = H('div', 'smbody'), left = H('div', 'smleft'), work = H('div', 'smwork');
    body.appendChild(left); body.appendChild(work); root.appendChild(body);
    var c = card(mm, true); V.cards[mm.a + 'v' + mm.b] = c; left.appendChild(c.root);
    if (o.state === 7) left.appendChild(H('div', 'smfinbar', '🥇 <b>GRAND FINAL</b>: the whole class is watching your graphs live!'));
    left.appendChild(H('div', 'smmini', '<span>⚡ Your power: <b class="smmy">' + ST.p + '</b></span><span>✅ Problems: <b>' + ST.c + '</b></span><span>🔥 Streak: <b>' + ST.k + '</b></span>'));
    V.work = work;
    if (!ST.pr || ST.pr.stage === 4 || (ST.pr.round !== o.round && !ST.pr.got)) newProblem();
    drawWork();
  }
  function stEnd() {
    var o = V.o, t = myTeam(), w = o.w[t] || 0, c = H('div', 'smcard');
    var place = 0; o.stand.forEach(function (s, i) { if (s.t === t) place = i + 1; });
    var reel = H('div', 'smreelbox');
    c.innerHTML = '<h2>🏆 Final results</h2>';
    c.appendChild(reel);
    var mine = H('div', 'smmine');
    mine.innerHTML = '<p class="smbig">' + esc(teamName(t, V.id)) + ': <b>' + w + '–' + (o.rounds - w) + '</b>' + (place ? ' · ' + ordinal(place) + ' place' : '') + '</p><p>You solved <b>' + ST.c + '</b> graph' + (ST.c === 1 ? '' : 's') + ' (' + ST.f + ' perfect) and earned <b>' + ST.p + '</b> power. Steps right first time: <b>' + (ST.sn ? Math.round(100 * ST.s1 / ST.sn) : 0) + '%</b>.</p>';
    c.appendChild(mine); if (o.autoFin) c.appendChild(H('p', 'smbig', '🥇 Grand final coming up: the top two, 1 v 1!')); c.appendChild(standings(o));
    root.appendChild(c);
    if (!ST.endXp && (ST.c || ST.sn)) { ST.endXp = 1; keep(); xp(25 + 10 * w, true); }
    playReel(reel);
  }
  function ordinal(n) { return n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'); }
  function standings(o) {
    var d = H('div', 'smstand');
    var L = o.stand.length ? o.stand : o.w.map(function (w, t) { return { t: t, w: w, pts: 0 }; }).sort(function (a, b) { return b.w - a.w; });
    d.innerHTML = '<h3>Standings</h3><ol>' + L.map(function (s, i) { return '<li class="' + (s.t === myTeam() ? 'me' : '') + '"><span>' + (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ordinal(i + 1)) + '</span><b>' + esc(teamName(s.t, V.id)) + '</b><small>' + esc(names(s.t)) + '</small><em>' + s.w + '–' + (o.rounds - s.w) + '</em></li>'; }).join('') + '</ol>';
    return d;
  }
  // the highlight reel: the best moves of the three fights, counting down to number one
  function playReel(box, again) {
    var o = V.o, R = o.reel; clearTimeout(V.reelT);
    if (!R.length) { box.innerHTML = '<p class="muted">The highlight reel is on its way…</p>'; return; }
    var i = 0;
    (function next() {
      if (!root || !box.isConnected) return;
      if (i >= R.length) { box.innerHTML = ''; var b = el('button', { type: 'button', 'class': 'btn primary', text: '🎬 Watch the highlight reel again' }); b.onclick = function () { playReel(box, true); }; box.appendChild(b); return; }
      var h = R[i], k = R.length - i, m = { a: h.a, b: h.b, ws: h.ws, ac: h.ac, mv: h.mv };
      var F = filmOf({ m: m, p0: h.p0, p1: h.p1, ro: h.ro, title: (k === 1 ? '🥇 MOVE OF THE DAY' : 'HIGHLIGHT #' + k) + ' · FIGHT ' + h.r }, screenish() ? false : true);
      box.innerHTML = ''; movie(box, F); i++;
      V.reelT = setTimeout(next, MOVIE + 500);
    })();
  }

  /* ---------- the grand final: the top two, 1 v 1, with both graphs on every screen ---------- */
  function tblStr(Q, tv) { return '<table class="smtbl"><tr><th>x</th>' + Q.xs.map(function (x) { return '<th>' + nm(x) + '</th>'; }).join('') + '</tr><tr><th>y</th>' + Q.xs.map(function (x, i) { var v = tv[i]; return '<td class="' + (v != null ? 'ok' : '') + '">' + (v != null ? nm(v) : '') + '</td>'; }).join('') + '</tr></table>'; }
  var STEPS = ['① Fill the table', '② Plot 2 points', '③ Draw the line', '④ Find the point'];
  function stepsStr(st) { return '<div class="smsteps">' + STEPS.map(function (x, i) { return '<span class="' + (i < st ? 'done' : i === st ? 'on' : '') + '">' + x + '</span>'; }).join('') + '</div>'; }
  function workView(wk, side) {
    var o = V.o, F = o.fin && o.fin[side], d = H('div', 'smwatch smnoink'); d.style.setProperty('--c', SIDE[side].c);
    var head = '<h3>' + SIDE[side].e + ' ' + esc(F ? F.n : '…') + (wk ? ' <small>⚡ ' + wk.p + ' · ✅ ' + wk.c + ' solved</small>' : '') + '</h3>';
    if (!wk) { d.innerHTML = head + '<p class="muted">Waiting for their first step…</p>'; return d; }
    var Q = gen(wk.seed, wk.lvl);
    d.innerHTML = head + '<div class="smrule">' + ruleHTML(Q) + '</div>' + stepsStr(wk.stage) + (wk.stage >= 3 ? '<p class="smtip">Find: ' + (Q.ask === 'y' ? 'when x = ' + nm(Q.tx) + ', y = ?' : 'when y = ' + nm(Q.ty) + ', x = ?') + '</p>' : '') + tblStr(Q, wk.tv) + '<div class="smgraph">' + svgStr({ stage: wk.stage, pm: wk.pm }, Q, SIDE[side].c) + '</div>';
    return d;
  }
  function drawBoards() { if (!V.wbox) return; V.wbox.innerHTML = ''; [0, 1].forEach(function (i) { V.wbox.appendChild(workView(V.o.work[i], i)); }); }
  function finIntro() {
    var o = V.o, m = o.m[0], c = H('div', 'smcard smwide');
    c.innerHTML = '<h2>🥇 GRAND FINAL!</h2><p class="smbig">The top two wrestlers, <b>1 v 1</b>. ' + (finalist() ? 'That\'s you! The whole class will watch your graphs.' : 'Watch their graphs live!') + '</p>' + (m ? matchup(m, finalist() ? myTeam() - 90 : -1) : '');
    root.appendChild(c);
  }
  function finView() {
    var o = V.o, m = o.m[0]; if (!m) return;
    var wrap = H('div', 'smfin'), c = card(m, true); V.cards[m.a + 'v' + m.b] = c;
    wrap.appendChild(c.root);
    V.wbox = H('div', 'smboards'); wrap.appendChild(V.wbox); V.wsig = JSON.stringify(o.work); drawBoards();
    root.appendChild(wrap);
  }
  function finEnd() {
    var o = V.o, m = o.m[0], c = H('div', 'smcard smwide');
    var w = m && m.fl ? (m.fl === 1 ? 0 : 1) : -1, F = w >= 0 && o.fin ? o.fin[w] : null, L = F ? o.fin[1 - w] : null;
    c.innerHTML = F ? '<h2>🏆 GRAND CHAMPION: ' + esc(F.n) + '!</h2><div class="smchamp">' + avSvg(F.look, 200) + '</div><p class="smbig">' + esc(F.n) + ' beat ' + esc(L ? L.n : '') + (m.sa !== m.sb ? ' with ' + Math.max(m.sa, m.sb) + '–' + Math.min(m.sa, m.sb) + ' in ring-outs' : ' by pushing hardest') + '!</p>' : '<h2>🥇 The grand final is over</h2>';
    root.appendChild(c);
    if (F && !V.champed) { V.champed = true; var n = 0; (function cf() { if (!root || n++ > 4) return; A.confetti(); setTimeout(cf, 900); })(); if (A.MODE === 'student' && A.hero && myTeam() === 90 + w) A.hero.add('s', String(Math.round(V.id / 1000)) + 'f', 20, true); }
  }

  /* ---------- the worked example: one problem worked out, step by step ---------- */
  var DEMO_Q = { mn: 2, md: 1, b: -3, xs: [0, 1, 2], ys: [-3, -1, 1], form: 0, ask: 'y', tx: 4, ty: 5, lvl: 1 };
  function demo(box, loop) {
    var Q = DEMO_Q, T = [], dead = false, i = 0, tb = [-3, -1, 1], two = [[0, -3], [1, -1]];
    var S = [
      ['The rule is <b>y = 2x − 3</b>. Step ①: put each <b>x</b> from the table into the rule.', { st: 0, tv: [null, null, null], pm: [] }],
      ['x = 0: y = 2 × 0 − 3 = <b>−3</b>', { st: 0, tv: [-3, null, null], pm: [] }],
      ['x = 1: y = 2 × 1 − 3 = <b>−1</b>', { st: 0, tv: [-3, -1, null], pm: [] }],
      ['x = 2: y = 2 × 2 − 3 = <b>1</b>', { st: 0, tv: tb, pm: [] }],
      ['Step ②: each column is a point (x, y). Plot <b>(0, −3)</b>…', { st: 1, tv: tb, pm: [[0, -3]] }],
      ['…and <b>(1, −1)</b>.', { st: 1, tv: tb, pm: two }],
      ['Step ③: draw a straight line through both dots, right across the grid.', { st: 3, tv: tb, pm: two }],
      ['Step ④: when <b>x = 4</b>, what is y? Go to 4 on the x-axis, then straight up to the line…', { st: 3, tv: tb, pm: two, gx: 1 }],
      ['…then across to the y-axis: <b>y = 5</b>. The point is <b>(4, 5)</b>: tap it!', { st: 4, tv: tb, pm: two, gx: 1, gy: 1 }],
      ['Check with the rule: 2 × 4 − 3 = 5 ✓. Every step right earns power for your team.', { st: 4, tv: tb, pm: two, gx: 1, gy: 1 }]
    ];
    function show() {
      if (dead) return;
      var x = S[i], k = x[1];
      box.innerHTML = '<div class="smdh">👀 Worked example</div><div class="smrule">' + ruleHTML(Q) + '</div>' + stepsStr(k.st === 4 ? 3 : k.st) + '<p class="smcap">' + x[0] + '</p><div class="smdg">' + tblStr(Q, k.tv) + '<div class="smgraph' + (i === 6 ? '' : ' smnoink') + '">' + svgStr({ stage: k.st, pm: k.pm, guideX: k.gx, guideY: k.gy }, Q, '#E8323A') + '</div></div>';
      i++;
      if (i < S.length) T.push(setTimeout(show, i === 1 ? 3400 : 2700));
      else {
        var again = el('button', { type: 'button', 'class': 'btn small', text: '↻ Watch again' }); again.onclick = function () { T.forEach(clearTimeout); T = []; i = 0; show(); }; box.appendChild(again);
        if (loop) T.push(setTimeout(function () { i = 0; show(); }, 5000));
      }
    }
    show();
    return function () { dead = true; T.forEach(clearTimeout); };
  }
  function demoBox() { if (!V.demoBox) { V.demoBox = H('div', 'smdemo'); V.demoStop = demo(V.demoBox, true); } return V.demoBox; }

  /* ---------- a problem: table → plot → line → find ---------- */
  function newProblem() {
    var o = V.o; ST.n++;
    var lvl = Math.min(4, (o.round || 1) + (ST.k >= 2 ? 1 : 0));
    var seen = SFA.store.get('sumo.seen', []) || [], seed = 0, k0;
    for (var k = 0; k < 30; k++) { seed = hash((A.S.me ? A.S.me.sid : 'x') + ':' + V.id + ':' + ST.n + ':' + k + ':' + Date.now()); var g = gen(seed, lvl); k0 = g.mn + '/' + g.md + '/' + g.b; if (seen.indexOf(k0) < 0) break; }
    seen.push(k0); SFA.store.set('sumo.seen', seen.slice(-40));
    sendSoon(); ST.pr = { seed: seed, lvl: lvl, round: o.round, stage: 0, tv: [null, null, null], act: 0, buf: '', tm: [0, 0, 0], pm: [], pmiss: 0, sel: null, lmiss: 0, fmiss: 0, miss: 0, got: 0, msg: '', good: false };
    keep();
  }
  function Q_() { return gen(ST.pr.seed, ST.pr.lvl); }
  function award(base, missed) {
    var P = ST.pr, mult = [1, 1, 1.25, 1.5, 1.75][P.lvl] || 1, pts = missed ? Math.max(1, Math.round(base * mult / 2)) : Math.round(base * mult);
    ST.p += pts; P.got += pts; ST.sn++; if (!missed) ST.s1++;
    powPop(pts); sendSoon(); return pts;
  }
  function miss(kind) { var P = ST.pr; P.miss++; ST.w++; ST.ms[kind]++; snd('thud'); }
  function powPop(n) {
    var w = V.work; if (!w) return; var r = w.getBoundingClientRect();
    var f = H('div', 'smpow', '+' + n + ' ⚡'); f.style.left = (r.left + r.width / 2 - 30) + 'px'; f.style.top = (r.top + 40) + 'px';
    document.body.appendChild(f); setTimeout(function () { f.remove(); }, 1200);
    var my = root && root.querySelector('.smmy'); if (my) my.textContent = ST.p;
  }
  function msg(t, good) { ST.pr.msg = t; ST.pr.good = !!good; }
  function drawWork() {
    var w = V.work; if (!w || !w.isConnected) return;
    var P = ST.pr, Q = Q_(), o = V.o, mm = myMatch(o), side = mm && mm.b === myTeam() ? 1 : 0, col = SIDE[side].c;
    w.innerHTML = '';
    w.appendChild(H('div', 'smrule', ruleHTML(Q) + (P.lvl >= 2 ? '<small>Level ' + P.lvl + ' · ×' + [1, 1, 1.25, 1.5, 1.75][P.lvl] + ' power</small>' : '')));
    var steps = ['① Fill the table', '② Plot 2 points', '③ Draw the line', '④ Find the point'];
    w.appendChild(H('div', 'smsteps', steps.map(function (s, i) { return '<span class="' + (i < P.stage ? 'done' : i === P.stage ? 'on' : '') + '">' + s + '</span>'; }).join('')));
    var ask = Q.ask === 'y' ? 'when <b>x = ' + nm(Q.tx) + '</b>, what is <b>y</b>?' : 'when <b>y = ' + nm(Q.ty) + '</b>, what is <b>x</b>?';
    var tip = P.stage === 0 ? 'Put each <b>x</b> into the rule and type <b>y</b>.' : P.stage === 1 ? 'Tap <b>two points</b> from your table on the grid (' + P.pm.length + ' of 2).' : P.stage === 2 ? '<b>Drag a line</b> through both dots (or tap one dot, then the other).' : P.stage === 3 ? 'Use your line: ' + ask + ' <b>Tap that point</b> on your line.' : '✅ ' + pt(Q.tx, Q.ty) + ': ' + (Q.ask === 'y' ? 'y = ' + nm(Q.ty) : 'x = ' + nm(Q.tx)) + '! <b>+' + P.got + ' power</b>' + (P.miss ? '' : ' · perfect!');
    w.appendChild(H('div', 'smtip', tip));
    // the table
    var tb = '<table class="smtbl"><tr><th>x</th>' + Q.xs.map(function (x) { return '<th>' + nm(x) + '</th>'; }).join('') + '</tr><tr><th>y</th>' + Q.xs.map(function (x, i) {
      var v = P.tv[i], cls = v != null ? (P.tm[i] >= 3 ? 'rev' : 'ok') : P.stage === 0 ? 'cell' + (P.act === i ? ' smact' : '') : '';
      return '<td class="' + cls + '" data-i="' + i + '">' + (v != null ? nm(v) : P.act === i && P.stage === 0 ? (P.buf ? P.buf.replace('-', '−') : '?') : '') + '</td>';
    }).join('') + '</tr></table>';
    var tw = H('div', 'smtw', tb); w.appendChild(tw);
    [].forEach.call(tw.querySelectorAll('td.cell'), function (td) { td.onclick = function () { P.act = +td.dataset.i; P.buf = ''; drawWork(); }; });
    w.appendChild(H('div', 'smfb' + (P.good ? ' good' : ''), P.msg || ''));
    if (P.stage === 0) w.appendChild(keypad());
    else w.appendChild(graph(P, Q, col));  }
  function keypad() {
    var k = H('div', 'smkeys');
    ['7', '8', '9', '⌫', '4', '5', '6', '−', '1', '2', '3', '0'].forEach(function (c) { var b = el('button', { type: 'button', text: c }); b.onclick = function () { press(c); }; k.appendChild(b); });
    var go = el('button', { type: 'button', 'class': 'smgo', text: '✓ Check' }); go.onclick = function () { press('ok'); }; k.appendChild(go);
    return k;
  }
  function press(c) {
    var P = ST.pr; if (!P || P.stage !== 0 || !fighting()) return;
    if (c === '⌫') P.buf = P.buf.slice(0, -1);
    else if (c === '−') P.buf = P.buf.charAt(0) === '-' ? P.buf.slice(1) : '-' + P.buf;
    else if (c === 'ok') return checkCell();
    else if (P.buf.replace('-', '').length < 3) P.buf += c;
    drawWork();
  }
  function onKey(e) {
    if (!root || A.MODE !== 'student' || !ST || !ST.pr || ST.pr.stage !== 0 || document.querySelector('.smv')) return;
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === '-' || e.key === '−') press('−');
    else if (e.key === 'Backspace') press('⌫');
    else if (e.key === 'Enter') press('ok');
    else return;
    e.preventDefault();
  }
  function checkCell() {
    var P = ST.pr, Q = Q_(), i = P.act;
    if (!P.buf || P.buf === '-') return;
    var v = parseInt(P.buf, 10), y = Q.ys[i];
    if (v === y) { P.tv[i] = y; award(2, P.tm[i] > 0); msg(P.tm[i] ? 'Got it.' : 'Yes!', true); snd('slap'); }
    else {
      P.tm[i]++; miss(0);
      if (P.tm[i] >= 3) { P.tv[i] = y; ST.sn++; msg('It\'s ' + nm(y) + ': ' + tableHint(Q, Q.xs[i]) + ' = ' + nm(y) + '.'); }
      else msg(P.tm[i] === 1 ? 'Not quite. ' + tableHint(Q, Q.xs[i]) + ' = ?' : 'Careful with the signs: ' + tableHint(Q, Q.xs[i]) + ' = ?');
    }
    P.buf = '';
    var next = [0, 1, 2].filter(function (j) { return P.tv[j] == null; });
    if (!next.length) { P.stage = 1; msg('Table done! Now plot two of those points.', true); }
    else if (P.tv[i] != null) P.act = next[0];
    keep(); drawWork();
  }

  // the grid: −8 to 8 both ways, 20 units to a square
  var SQ = 20, SZ = (2 * GR + 2) * SQ;
  function gx(x) { return (x + GR + 1) * SQ; }
  function gy(y) { return (GR + 1 - y) * SQ; }
  function lineEnds(Q) {
    // the line across the whole grid, clipped to the square
    var lo = -GR - 0.5, hi = GR + 0.5, f = function (x) { return Q.mn * x / Q.md + Q.b; }, g = function (y) { return (y - Q.b) * Q.md / Q.mn; };
    var pts = [], add = function (x, y) { if (x >= lo - 1e-9 && x <= hi + 1e-9 && y >= lo - 1e-9 && y <= hi + 1e-9) pts.push([x, y]); };
    add(lo, f(lo)); add(hi, f(hi)); add(g(lo), lo); add(g(hi), hi);
    pts.sort(function (a, b) { return a[0] - b[0]; });
    return [pts[0], pts[pts.length - 1]];
  }
  function svgStr(P, Q, col) {
    var s = '<svg viewBox="0 0 ' + SZ + ' ' + SZ + '" role="img" aria-label="Coordinate grid from −8 to 8">';
    s += '<rect x="0" y="0" width="' + SZ + '" height="' + SZ + '" fill="#FFFDF6"/>';
    for (var i = -GR; i <= GR; i++) {
      var ax = i === 0;
      s += '<line x1="' + gx(i) + '" y1="' + gy(GR) + '" x2="' + gx(i) + '" y2="' + gy(-GR) + '" stroke="' + (ax ? '#2a1a0a' : '#d9cdb0') + '" stroke-width="' + (ax ? 2 : 1) + '"/>';
      s += '<line x1="' + gx(-GR) + '" y1="' + gy(i) + '" x2="' + gx(GR) + '" y2="' + gy(i) + '" stroke="' + (ax ? '#2a1a0a' : '#d9cdb0') + '" stroke-width="' + (ax ? 2 : 1) + '"/>';
      if (i && i % 2 === 0) { s += '<text x="' + gx(i) + '" y="' + (gy(0) + 13) + '" font-size="9" text-anchor="middle" fill="#6b5a3a">' + nm(i) + '</text><text x="' + (gx(0) - 4) + '" y="' + (gy(i) + 3) + '" font-size="9" text-anchor="end" fill="#6b5a3a">' + nm(i) + '</text>'; }
    }
    s += '<text x="' + (gx(GR) + 8) + '" y="' + (gy(0) + 4) + '" font-size="11" font-style="italic" fill="#2a1a0a">x</text><text x="' + (gx(0) + 5) + '" y="' + (gy(GR) - 6) + '" font-size="11" font-style="italic" fill="#2a1a0a">y</text>';
    if (P.stage >= 3) { var e = lineEnds(Q); s += '<line class="smline" x1="' + gx(e[0][0]) + '" y1="' + gy(e[0][1]) + '" x2="' + gx(e[1][0]) + '" y2="' + gy(e[1][1]) + '" stroke="' + col + '" stroke-width="4" stroke-linecap="round"/>'; }
    if (P.stage === 3 && P.fmiss >= 2) s += Q.ask === 'y' ? '<line x1="' + gx(Q.tx) + '" y1="' + gy(GR) + '" x2="' + gx(Q.tx) + '" y2="' + gy(-GR) + '" stroke="#C0392B" stroke-width="2" stroke-dasharray="6 5"/>' : '<line x1="' + gx(-GR) + '" y1="' + gy(Q.ty) + '" x2="' + gx(GR) + '" y2="' + gy(Q.ty) + '" stroke="#C0392B" stroke-width="2" stroke-dasharray="6 5"/>';
    if (P.guideX) s += '<line x1="' + gx(Q.tx) + '" y1="' + gy(0) + '" x2="' + gx(Q.tx) + '" y2="' + gy(Q.ty) + '" stroke="#C0392B" stroke-width="2.5" stroke-dasharray="6 5"/>';
    if (P.guideY) s += '<line x1="' + gx(Q.tx) + '" y1="' + gy(Q.ty) + '" x2="' + gx(0) + '" y2="' + gy(Q.ty) + '" stroke="#C0392B" stroke-width="2.5" stroke-dasharray="6 5"/>';
    if (P.stage === 1 && P.pmiss >= 2) { var h = hintPt(P, Q); if (h) s += '<circle cx="' + gx(h[0]) + '" cy="' + gy(h[1]) + '" r="11" fill="none" stroke="' + col + '" stroke-width="2" stroke-dasharray="4 3"><animate attributeName="r" values="8;13;8" dur="1.2s" repeatCount="indefinite"/></circle>'; }
    P.pm.forEach(function (p, k) { s += '<circle cx="' + gx(p[0]) + '" cy="' + gy(p[1]) + '" r="' + (P.sel === k ? 10 : 7) + '" fill="' + col + '" stroke="#141428" stroke-width="2"/>'; });
    if (P.stage === 4) s += '<text x="' + gx(Q.tx) + '" y="' + (gy(Q.ty) + 7) + '" font-size="22" text-anchor="middle">⭐</text><text x="' + gx(Q.tx) + '" y="' + (gy(Q.ty) - 14) + '" font-size="12" font-weight="800" text-anchor="middle" fill="#141428">' + pt(Q.tx, Q.ty) + '</text>';
    if (P.flash && Date.now() - P.flash.t < 900) s += '<text x="' + gx(P.flash.x) + '" y="' + (gy(P.flash.y) + 6) + '" font-size="18" text-anchor="middle" fill="#C0392B" font-weight="900">✕</text>';
    s += '<line class="smprev" x1="0" y1="0" x2="0" y2="0" stroke="' + col + '" stroke-width="3" stroke-dasharray="7 5" stroke-linecap="round" visibility="hidden"/></svg>';
    return s;
  }
  function graph(P, Q, col) {
    var wrap = H('div', 'smgraph'); wrap.innerHTML = svgStr(P, Q, col);
    var svg = wrap.firstChild, prev = svg.querySelector('.smprev'), down = null;
    function at(e) { var r = svg.getBoundingClientRect(); return { x: (e.clientX - r.left) * SZ / r.width / SQ - GR - 1, y: GR + 1 - (e.clientY - r.top) * SZ / r.height / SQ }; }
    svg.addEventListener('pointerdown', function (e) {
      if (!fighting() || P.stage < 1 || P.stage > 3) return;
      e.preventDefault(); down = at(e);
      if (P.stage === 2) { try { svg.setPointerCapture(e.pointerId); } catch (x) { } }
    });
    svg.addEventListener('pointermove', function (e) {
      if (!down || P.stage !== 2) return;
      var p = at(e); prev.setAttribute('x1', gx(down.x)); prev.setAttribute('y1', gy(down.y)); prev.setAttribute('x2', gx(p.x)); prev.setAttribute('y2', gy(p.y)); prev.setAttribute('visibility', 'visible');
    });
    svg.addEventListener('pointerup', function (e) {
      if (!down) return; var d0 = down, p = at(e); down = null; prev.setAttribute('visibility', 'hidden');
      if (P.stage === 2) drew(d0, p);
      else tap(Math.round(p.x), Math.round(p.y));
    });
    svg.addEventListener('pointercancel', function () { down = null; prev.setAttribute('visibility', 'hidden'); });
    if (P.flash && Date.now() - P.flash.t < 900) setTimeout(function () { if (V && V.work) drawWork(); }, 950 - (Date.now() - P.flash.t));
    return wrap;
  }
  function hintPt(P, Q) { for (var i = 0; i < 3; i++) { var x = Q.xs[i], y = Q.ys[i]; if (Math.abs(y) <= GR && !P.pm.some(function (p) { return p[0] === x && p[1] === y; })) return [x, y]; } return null; }
  function tap(x, y) {
    var P = ST.pr, Q = Q_();
    if (Math.abs(x) > GR || Math.abs(y) > GR) return;
    if (P.stage === 1) {
      if (P.pm.some(function (p) { return p[0] === x && p[1] === y; })) return;
      if (onLine(Q, x, y)) {
        P.pm.push([x, y]); award(2, P.pmiss > 0); snd('slap');
        if (P.pm.length >= 2) { P.stage = 2; msg('Two points! Now draw the line through them.', true); } else msg(pt(x, y) + ' is on the line. One more!', true);
      } else {
        P.pmiss++; miss(1); P.flash = { x: x, y: y, t: Date.now() };
        var h = hintPt(P, Q);
        msg(pt(x, y) + ' isn\'t on this line. ' + (P.pmiss >= 2 && h ? 'Use your table: try ' + pt(h[0], h[1]) + '.' : 'Use a column of your table: (x, y).'));
        if (P.pmiss >= 4 && h) { P.pm.push(h); ST.sn++; if (P.pm.length >= 2) { P.stage = 2; msg('Here\'s ' + pt(h[0], h[1]) + ' from your table. Now draw the line.'); } }
      }
    } else if (P.stage === 3) {
      var want = Q.ask === 'y' ? 'x = ' + nm(Q.tx) : 'y = ' + nm(Q.ty);
      if (x === Q.tx && y === Q.ty) { award(5, P.fmiss > 0); return complete(); }
      P.fmiss++; miss(3); P.flash = { x: x, y: y, t: Date.now() };
      if (P.fmiss >= 4) { ST.sn++; msg('It was ' + pt(Q.tx, Q.ty) + '. Follow the line to ' + want + ' next time.'); return complete(); }
      msg(onLine(Q, x, y) ? pt(x, y) + ' is on your line, but you need the point where ' + want + '.' : pt(x, y) + ' isn\'t on your line. Follow the line to where ' + want + '.');
    } else if (P.stage === 2) drew({ x: x, y: y }, { x: x, y: y });
    keep(); drawWork();
  }
  function drew(a, b) {
    var P = ST.pr, len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len < 0.8) {
      // a tap: pick a dot, then the other
      var k = -1; P.pm.forEach(function (p, i) { if (Math.hypot(p[0] - b.x, p[1] - b.y) < 0.7) k = i; });
      if (k < 0) { msg('Drag from one dot through the other, or tap one dot and then the other.'); keep(); drawWork(); return; }
      if (P.sel == null || P.sel === k) { P.sel = k; msg('Now tap the other dot.'); keep(); drawWork(); return; }
      P.sel = null; return lineOk();
    }
    // a drag: both dots must sit close to the line drawn
    var dist = function (p) { return Math.abs((b.y - a.y) * p[0] - (b.x - a.x) * p[1] + b.x * a.y - b.y * a.x) / len; };
    if (len >= 1.5 && P.pm.every(function (p) { return dist(p) < 0.6; })) return lineOk();
    P.lmiss++; miss(2);
    if (P.lmiss >= 3) { ST.sn++; P.stage = 3; msg('Here\'s the line through your two dots. Now use it!'); keep(); drawWork(); return; }
    msg('Your line missed a dot. Start on one dot and drag right through the other.'); keep(); drawWork();
  }
  function lineOk() { var P = ST.pr; award(3, P.lmiss > 0); snd('slap'); P.stage = 3; msg('A straight line! Now use it.', true); keep(); drawWork(); }
  function complete() {
    var P = ST.pr; ST.c++;
    if (!P.miss) { ST.f++; ST.k++; ST.b = Math.max(ST.b, ST.k); } else ST.k = 0;
    xp(P.miss ? 3 : 6);
    P.stage = 4; if (!P.msg || P.good) msg(P.miss ? 'Solved!' : '🔥 Perfect! ' + (ST.k >= 2 ? ST.k + ' in a row: harder problems, more power.' : ''), true);
    snd('crowd'); send(); keep(); drawWork();
    var my = root && root.querySelectorAll('.smmini b'); if (my && my.length) { my[1].textContent = ST.c; my[2].textContent = ST.k; }
    setTimeout(function () { if (V && fighting() && ST.pr === P) { newProblem(); drawWork(); } }, 1700);
  }

  var sendT = null;
  function send() {
    clearTimeout(sendT); if (A.MODE !== 'student' || !V) return;
    A.record({ id: QID, k: 'open' }, 's1;id:' + Math.round(V.id / 1000) + ';p:' + ST.p + ';c:' + ST.c + ';f:' + ST.f + ';w:' + ST.w + ';k:' + ST.k + ';b:' + ST.b + ';lv:' + hinfo().lv + ';ms:' + ST.ms.join('.') + ';s1:' + ST.s1 + ';sn:' + ST.sn + (ST.pr ? ';pr:' + encWork(ST.pr) : ''), null);
  }
  function sendSoon() { keep(); clearTimeout(sendT); sendT = setTimeout(send, V && V.o && V.o.state === 7 ? 300 : 1500); }   // the grand final: every step at once, for the class watching

  /* ---------- the class screen (and the teacher's "Show the arena") ---------- */
  function scrIntro() {
    var o = V.o, c = H('div', 'smcard wide');
    c.innerHTML = '<h2>🤼 Sumo Graphing: meet the wrestlers!</h2><p>Rule → table → 2 points → line → find the point. <b>Every 30 seconds</b>, each pair\'s work becomes a sumo move. Push them out for a point!</p>';
    if (o.demo) c.appendChild(demoBox());
    var g = H('div', 'smgrid'); o.m.forEach(function (m) { g.appendChild(H('div', 'smmatch', matchup(m, -1))); }); c.appendChild(g);
    root.appendChild(c);
  }
  function scrArena() {
    var o = V.o, g = H('div', 'smgrid');
    o.m.forEach(function (m) { var c = card(m, false); V.cards[m.a + 'v' + m.b] = c; g.appendChild(c.root); });
    root.appendChild(g);
  }
  function scrBreak() {
    var o = V.o, c = H('div', 'smcard wide');
    c.innerHTML = '<h2>🔁 Rematch! Fight ' + (o.round + 1) + ': winners meet winners</h2>';
    var row = H('div', 'smsplit'), st = standings(o), g = H('div', 'smgrid');
    o.m.forEach(function (m) { g.appendChild(H('div', 'smmatch', matchup(m, -1))); });
    row.appendChild(g); row.appendChild(st); c.appendChild(row); root.appendChild(c);
  }
  function scrEnd() {
    var o = V.o, c = H('div', 'smcard wide');
    var top = o.stand[0];
    c.innerHTML = '<h2>🏆 ' + (top ? esc(teamName(top.t, V.id)) + ' (' + esc(names(top.t)) + ') are the champions!' : 'Final results') + '</h2>';
    var row = H('div', 'smsplit'), reel = H('div', 'smreelbox smrw');
    row.appendChild(reel); row.appendChild(standings(o)); c.appendChild(row); root.appendChild(c);
    playReel(reel);
  }

  /* ---------- sound: taiko drums, slaps and the crowd ---------- */
  var AC = null;
  function soundOn() { var v = SFA.store.get('sumo.sound', null); return v == null ? A.MODE !== 'student' : !!v; }
  function snd(k) {
    if (!soundOn()) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); var t = AC.currentTime;
      if (k === 'taiko' || k === 'clash' || k === 'thud') {
        var o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(k === 'clash' ? 130 : k === 'thud' ? 70 : 95, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.3);
        g.gain.setValueAtTime(k === 'clash' ? 0.55 : 0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.42); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + 0.45);
      }
      if (k === 'slap' || k === 'clash' || k === 'crowd') {
        var dur = k === 'crowd' ? 1.3 : 0.09, buf = AC.createBuffer(1, Math.floor(AC.sampleRate * dur), AC.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        var src = AC.createBufferSource(), f = AC.createBiquadFilter(), g2 = AC.createGain(); src.buffer = buf; f.type = 'bandpass'; f.frequency.value = k === 'crowd' ? 900 : 2200; f.Q.value = k === 'crowd' ? 0.6 : 1.4;
        g2.gain.setValueAtTime(0.001, t); g2.gain.exponentialRampToValueAtTime(k === 'crowd' ? 0.16 : 0.3, t + (k === 'crowd' ? 0.3 : 0.005)); g2.gain.exponentialRampToValueAtTime(0.001, t + dur);
        src.connect(f); f.connect(g2); g2.connect(AC.destination); src.start(t);
      }
      if (k === 'boing') { var ob = AC.createOscillator(), gb = AC.createGain(); ob.type = 'sine'; ob.frequency.setValueAtTime(160, t); ob.frequency.exponentialRampToValueAtTime(720, t + 0.18); ob.frequency.exponentialRampToValueAtTime(300, t + 0.35); gb.gain.setValueAtTime(0.25, t); gb.gain.exponentialRampToValueAtTime(0.001, t + 0.4); ob.connect(gb); gb.connect(AC.destination); ob.start(t); ob.stop(t + 0.42); }
      if (k === 'whistle') { var ow = AC.createOscillator(), lfo = AC.createOscillator(), lg = AC.createGain(), gw = AC.createGain(); ow.type = 'triangle'; ow.frequency.value = 1900; lfo.frequency.value = 28; lg.gain.value = 120; lfo.connect(lg); lg.connect(ow.frequency); gw.gain.setValueAtTime(0.08, t); gw.gain.exponentialRampToValueAtTime(0.001, t + 0.5); ow.connect(gw); gw.connect(AC.destination); ow.start(t); lfo.start(t); ow.stop(t + 0.5); lfo.stop(t + 0.5); }
      if (k === 'cricket') { [0, 0.25, 0.5].forEach(function (d) { var oc = AC.createOscillator(), gc = AC.createGain(); oc.type = 'square'; oc.frequency.value = 4200; gc.gain.setValueAtTime(0.001, t + d); gc.gain.linearRampToValueAtTime(0.03, t + d + 0.02); gc.gain.linearRampToValueAtTime(0.001, t + d + 0.12); oc.connect(gc); gc.connect(AC.destination); oc.start(t + d); oc.stop(t + d + 0.13); }); }
      if (k === 'salt' || k === 'ooh') {
        var du = k === 'ooh' ? 1.1 : 0.25, bf = AC.createBuffer(1, Math.floor(AC.sampleRate * du), AC.sampleRate), dd = bf.getChannelData(0);
        for (var j = 0; j < dd.length; j++) dd[j] = Math.random() * 2 - 1;
        var sr = AC.createBufferSource(), fl = AC.createBiquadFilter(), g4 = AC.createGain(); sr.buffer = bf; fl.type = 'bandpass'; fl.frequency.setValueAtTime(k === 'ooh' ? 380 : 6000, t); if (k === 'ooh') fl.frequency.linearRampToValueAtTime(260, t + du); fl.Q.value = k === 'ooh' ? 3 : 0.8;
        g4.gain.setValueAtTime(0.001, t); g4.gain.exponentialRampToValueAtTime(k === 'ooh' ? 0.35 : 0.06, t + (k === 'ooh' ? 0.25 : 0.02)); g4.gain.exponentialRampToValueAtTime(0.001, t + du);
        sr.connect(fl); fl.connect(g4); g4.connect(AC.destination); sr.start(t);
      }
      if (k === 'splat' || k === 'whoosh' || k === 'strike') {
        var n = k === 'whoosh' ? 0.45 : k === 'strike' ? 0.6 : 0.35, bs = AC.createBuffer(1, Math.floor(AC.sampleRate * n), AC.sampleRate), ds = bs.getChannelData(0);
        for (var q = 0; q < ds.length; q++) ds[q] = (Math.random() * 2 - 1) * (k === 'strike' ? (Math.sin(q / 90) > 0.2 ? 1 : 0.15) : 1);
        var ss = AC.createBufferSource(), fs = AC.createBiquadFilter(), gs = AC.createGain(); ss.buffer = bs;
        fs.type = k === 'splat' ? 'lowpass' : 'bandpass'; fs.Q.value = k === 'whoosh' ? 1.2 : 0.9;
        fs.frequency.setValueAtTime(k === 'splat' ? 900 : k === 'whoosh' ? 300 : 2600, t); fs.frequency.exponentialRampToValueAtTime(k === 'splat' ? 140 : k === 'whoosh' ? 2400 : 1200, t + n);
        gs.gain.setValueAtTime(0.001, t); gs.gain.exponentialRampToValueAtTime(k === 'whoosh' ? 0.22 : 0.45, t + (k === 'whoosh' ? 0.2 : 0.01)); gs.gain.exponentialRampToValueAtTime(0.001, t + n);
        ss.connect(fs); fs.connect(gs); gs.connect(AC.destination); ss.start(t);
        if (k === 'splat') { var op = AC.createOscillator(), gp = AC.createGain(); op.type = 'sine'; op.frequency.setValueAtTime(220, t); op.frequency.exponentialRampToValueAtTime(45, t + 0.3); gp.gain.setValueAtTime(0.5, t); gp.gain.exponentialRampToValueAtTime(0.001, t + 0.35); op.connect(gp); gp.connect(AC.destination); op.start(t); op.stop(t + 0.36); }
      }
      if (k === 'bell') { [880, 1320].forEach(function (fq, j) { var o2 = AC.createOscillator(), g3 = AC.createGain(); o2.type = 'triangle'; o2.frequency.value = fq; g3.gain.setValueAtTime(0.12 / (j + 1), t); g3.gain.exponentialRampToValueAtTime(0.001, t + 1.2); o2.connect(g3); g3.connect(AC.destination); o2.start(t); o2.stop(t + 1.25); }); }
    } catch (e) { }
  }

  /* =========================== the teacher console: the referee =========================== */
  function C() { return A.console_().sumo; }
  function save(K) { try { SFA.store.set('teacher.sumo.' + A.LID, K); } catch (e) { } }
  function active() {
    var ids = {}; A.rosterIn().forEach(function (r) { ids[r.sid] = r; });
    var here = {}; (A.consoleAnswers() || []).forEach(function (a) { if (ids[a.sid] && !A.beforeRun(a)) here[a.sid] = 1; });
    return Object.keys(here);
  }
  function nameOf(sid) { var r = A.rosterIn().filter(function (x) { return x.sid === sid; })[0]; return r ? clean(A.first(r.name).replace(/[^A-Za-zÀ-ÿ' -]/g, '')) : '?'; }
  function looksBySid() {
    var out = {}, t = {};
    (A.consoleAnswers() || []).forEach(function (a) { if (a.q !== 'zlookx1') return; var m = String(a.answer).match(/^lk1;([0-9a-z]{1,12})/); if (m && (!t[a.sid] || String(a.time) >= t[a.sid])) { t[a.sid] = String(a.time); out[a.sid] = m[1]; } });
    return out;
  }
  // fair pairs: the most sure with the least sure, from today's answers
  function makeTeams(who) {
    var sc = {}; who.forEach(function (s) { sc[s] = Math.random() * 0.5; });
    (A.consoleAnswers() || []).forEach(function (a) { if (sc[a.sid] != null && !A.beforeRun(a) && !/^z/.test(a.q) && (a.correct === true || a.correct === 'yes')) sc[a.sid] += 1; });
    var L = who.slice().sort(function (a, b) { return sc[b] - sc[a]; }), teams = [];
    if (L.length <= 3) L.forEach(function (s) { teams.push([s]); });
    else {
      while (L.length >= 2) teams.push([L.shift(), L.pop()]);
      if (L.length) { teams.sort(function (a, b) { return (sc[a[0]] + sc[a[1]]) - (sc[b[0]] + sc[b[1]]); }); teams[0].push(L[0]); }
    }
    return shuffle(teams).map(function (s) { return { s: s, w: 0, pts: 0, opp: [], res: 0 }; });
  }
  function newMatch(a, b) { return { a: a, b: b, pos: 0, seq: 0, mv: 0, ws: 2, ac: 0, sa: 0, sb: 0, la: 0, lb: 0, ta: 0, tb: 0, fl: 0, base: {} }; }
  // the next round: winners meet winners (no rematch if it can be helped); an odd team out meets the Sumo-Bot
  function pairUp(K, first) {
    var idx = K.teams.map(function (t, i) { return i; });
    if (first) idx = shuffle(idx); else idx.sort(function (a, b) { return K.teams[b].w - K.teams[a].w || K.teams[b].pts - K.teams[a].pts || Math.random() - 0.5; });
    var out = [], used = {};
    for (var i = 0; i < idx.length; i++) {
      var a = idx[i], b = -1, j; if (used[a]) continue; used[a] = 1;
      for (j = i + 1; j < idx.length; j++) if (!used[idx[j]] && K.teams[a].opp.indexOf(idx[j]) < 0) { b = idx[j]; break; }
      if (b < 0) for (j = i + 1; j < idx.length; j++) if (!used[idx[j]]) { b = idx[j]; break; }
      if (b >= 0) used[b] = 1;
      out.push(newMatch(a, b < 0 ? BOT : b));
    }
    return out.slice(0, 20);
  }
  function zero() { return { p: 0, c: 0, f: 0, w: 0, sn: 0 }; }
  function snap(r) { r = r || zero(); return { p: r.p, c: r.c, f: r.f, w: r.w, sn: r.sn }; }
  function finTeam(K, t) { return t >= 90 && t < BOT ? K.ft[t - 90] : K.teams[t]; }
  function startRound(K, st) {
    K.state = st || 1; K.at = Math.round(Date.now() / 1000) * 1000; K.clip = 0; K.rx = 0;
    K.m.forEach(function (m) { [m.a, m.b].forEach(function (t) { if (t !== BOT) finTeam(K, t).s.forEach(function (sid) { m.base[sid] = snap(K.rows[sid]); }); }); });
  }
  function start(mins, demoOn, finOn) {
    var who = active();
    if (!who.length) { SFA.toast('Nobody has answered anything yet: wait for students to join, then start.', 4000); return false; }
    var t = Math.round(Date.now() / 1000) * 1000;
    var K = { id: t, state: 3, round: 1, at: t, rlen: Math.round((mins || 2) * 60 / CLIP) * CLIP, rx: 0, clip: 0, teams: makeTeams(who), m: [], rows: {}, hl: [], reel: [], cur: 0, lastPush: 0, lastSave: 0, hist: [], intro: demoOn ? INTRO + DEMO_S : INTRO, demo: demoOn ? 1 : 0, autoFin: finOn ? 1 : 0 };
    K.m = pairUp(K, true);
    A.console_().sumo = K; save(K);
    A.pushLive(); A.consolePanel();
    return true;
  }
  // a side's power since the last bout (a team of three counts as two, so it's fair)
  function sidePow(K, m, side, peek) {
    var t = m[side], o = { p: 0, c: 0, f: 0, w: 0, steps: 0, best: -1, both: false }; if (t === BOT) return o;
    var team = finTeam(K, t), per = [];
    team.s.forEach(function (sid, i) {
      var r = K.rows[sid] || zero(), b = m.base[sid] || (m.base[sid] = snap(r)), d = Math.max(0, r.p - b.p);
      per.push(d); o.p += d; o.c += Math.max(0, r.c - b.c); o.f += Math.max(0, r.f - b.f); o.w += Math.max(0, r.w - b.w); o.steps += Math.max(0, r.sn - b.sn);
      if (!peek) m.base[sid] = snap(r);
    });
    if (team.s.length >= 3) o.p = Math.round(o.p * 2 / team.s.length);
    var best = -1, bv = 0; per.forEach(function (d, i) { if (d > bv) { bv = d; best = i; } }); o.best = best;
    var tot = per.reduce(function (a, b) { return a + b; }, 0); o.both = per.length > 1 && tot > 0 && per.filter(function (d) { return d >= tot * 0.35; }).length >= 2;
    return o;
  }
  function median(a) { if (!a.length) return 0; a = a.slice().sort(function (x, y) { return x - y; }); return a[Math.floor(a.length / 2)]; }
  function resolveClip(K) {
    K.clip++;
    var pw = K.m.map(function (m) { return [sidePow(K, m, 'a'), sidePow(K, m, 'b')]; }), all = [];
    pw.forEach(function (p, i) { all.push(p[0].p); if (K.m[i].b !== BOT) all.push(p[1].p); });
    var med = median(all);
    K.m.forEach(function (m, i) {
      var P = pw[i];
      // the Sumo-Bot fights like the middle of the class, give or take
      if (m.b === BOT) P[1] = { p: Math.round(Math.max(4, med) * (0.7 + Math.random() * 0.45)), c: 1, f: 0, w: 0, steps: 3, best: 0, both: false };
      fight(K, m, P[0], P[1]);
    });
  }
  function fight(K, m, PA, PB) {
    var a = PA.p, b = PB.p, d = a - b, tot = a + b, p0 = m.pos, mv = 0, ws = 2, push = 0, ro = 0;
    if (tot > 0 && Math.abs(d) <= Math.max(1, tot * 0.06)) mv = 1;
    else if (tot > 0) {
      ws = d > 0 ? 0 : 1;
      var W = ws ? PB : PA, Lo = ws ? PA : PB, dir = ws ? -1 : 1, edge = dir * p0 <= -45;
      push = Math.min(80, Math.round(18 + 62 * Math.abs(d) / Math.max(14, tot)));
      var p1 = p0 + dir * push; ro = Math.abs(p1) >= 100 ? 1 : 0;
      if (edge && push >= 35) mv = 6;
      else if (push >= 72 && W.p >= 3 * Math.max(1, Lo.p) && W.p >= 25) mv = 9;
      else if (ro) mv = pickOne([7, 10, 11, 12]);
      else if (W.p >= 2 * Math.max(1, Lo.p) && push >= 45) mv = Math.random() < 0.7 ? 10 : 12;
      else if (W.both && push >= 40) mv = 8;
      else if (W.f > 0) mv = Math.random() < 0.6 ? 4 : 11;
      else if (W.c >= 2 || W.steps >= 6) mv = Math.random() < 0.6 ? 2 : 11;
      else if (Lo.w > W.w + 1) mv = 5;
      else mv = pickOne([3, 3, 10, 11, 12]);
      m.pos = ro ? 0 : p1;
      if (ro) { if (ws) m.sb++; else m.sa++; }
    }
    m.seq++; m.mv = mv; m.ws = ws; m.ac = ws === 2 ? 0 : (ws ? PB : PA).both ? 3 : Math.max(0, (ws ? PB : PA).best);
    m.ta += a; m.tb += b; m.la = 0; m.lb = 0;
    if (ws !== 2) K.hl.push({ r: K.round, mv: mv, a: m.a, b: m.b, ws: ws, ac: m.ac, p0: p0, p1: ro ? (ws ? -110 : 110) : m.pos, ro: ro, sc: push + ro * 40 + (mv === 6 ? 60 : mv === 9 ? 50 : mv === 10 ? 45 : mv === 12 ? 35 : mv === 11 ? 30 : mv === 8 ? 20 : mv === 4 ? 10 : 0) + Math.random() });
  }
  // the bell: who won each match (ring-outs, then where they stand, then power)
  function bell(K) {
    K.state = 5; K.at = Math.round(Date.now() / 1000) * 1000;
    var res = [];
    K.m.forEach(function (m) {
      var aw = m.sa !== m.sb ? m.sa > m.sb : m.pos !== 0 ? m.pos > 0 : m.ta !== m.tb ? m.ta > m.tb : Math.random() < 0.5;
      m.fl = aw ? 1 : 2;
      [[m.a, m.b, aw, m.ta], [m.b, m.a, !aw, m.tb]].forEach(function (x) { if (x[0] === BOT) return; var T = K.teams[x[0]]; T.opp.push(x[1]); T.res = x[2] ? 1 : 2; if (x[2]) T.w++; T.pts += x[3]; });
      res.push({ a: m.a, b: m.b, sa: m.sa, sb: m.sb, fl: m.fl, ta: m.ta, tb: m.tb });
    });
    K.hist.push({ round: K.round, res: res });
  }
  function afterBell(K) {
    if (K.round < ROUNDS) { K.state = 4; K.at = Math.round(Date.now() / 1000) * 1000; K.m = pairUp(K, false); }
    else end(K);
  }
  // the grand final: the two students with the most power, 1 v 1
  function finalists(K) { var c = []; K.teams.forEach(function (t) { t.s.forEach(function (sid) { c.push({ sid: sid, p: (K.rows[sid] || {}).p || 0 }); }); }); c.sort(function (a, b) { return b.p - a.p; }); return c.filter(function (x) { return x.p > 0; }).slice(0, 2); }
  function startFinal(K) {
    var f = finalists(K); if (f.length < 2) { SFA.toast('A grand final needs two students with points.', 3500); K.autoFin = 0; return; }
    K.ft = [{ s: [f[0].sid] }, { s: [f[1].sid] }]; K.m3 = K.m3 || K.m; K.m = [newMatch(90, 91)]; K.state = 6; K.round = 4; K.at = Math.round(Date.now() / 1000) * 1000;
    save(K); (A.pushNow || A.pushLive)(); A.consolePanel();
  }
  function finBell(K) {
    var m = K.m[0]; if (!m || !K.ft) return;
    var aw = m.sa !== m.sb ? m.sa > m.sb : m.pos !== 0 ? m.pos > 0 : m.ta !== m.tb ? m.ta > m.tb : Math.random() < 0.5;
    m.fl = aw ? 1 : 2; K.state = 8; K.at = Math.round(Date.now() / 1000) * 1000; K.champ = K.ft[aw ? 0 : 1].s[0];
    if (A.trophy) A.trophy({ k: 'sumof', id: K.id, champ: nameOf(K.champ), vs: nameOf(K.ft[aw ? 1 : 0].s[0]) });
    save(K); (A.pushNow || A.pushLive)(); A.consolePanel();
  }
  function finNames(K) { return K.ft ? esc(nameOf(K.ft[0].s[0])) + ' vs ' + esc(nameOf(K.ft[1].s[0])) : ''; }
  function standingsOf(K) { return K.teams.map(function (t, i) { return { t: i, w: t.w, pts: t.pts }; }).sort(function (a, b) { return b.w - a.w || b.pts - a.pts; }); }
  function end(K) {
    K = K || C(); if (!K || K.state === 2) return;
    if (K.state === 1) bell(K);
    K.state = 2; K.at = K.endedAt = Math.round(Date.now() / 1000) * 1000;
    // the reel: the best moves, a different pair of teams each where it can be, counting down to the best
    var L = K.hl.slice().sort(function (a, b) { return b.sc - a.sc; }), pick = [], seen = {};
    L.forEach(function (h) { var k = h.a + 'v' + h.b + ':' + h.r; if (pick.length < REEL_N && !seen[k]) { seen[k] = 1; pick.push(h); } });
    L.forEach(function (h) { if (pick.length < REEL_N && pick.indexOf(h) < 0) pick.push(h); });
    K.reel = pick.reverse();
    var S = standingsOf(K), top = S[0];
    if (A.trophy && top) A.trophy({ k: 'sumo', id: K.id, champ: teamName(top.t, K.id), who: K.teams[top.t].s.map(nameOf).join(' & '), rec: top.w + '–' + (ROUNDS - top.w), n: K.teams.reduce(function (a, t) { return a + t.s.length; }, 0) });
    save(K); (A.pushNow || A.pushLive)(); A.consolePanel();
  }
  function agg() {
    var K = C(); if (!K) return;
    var key2 = 'id:' + Math.round(K.id / 1000) + ';', last = {}, changed = false;
    (A.consoleAnswers() || []).forEach(function (a) { if (a.q === QID && String(a.answer).indexOf(key2) >= 0 && (!last[a.sid] || String(a.time) >= String(last[a.sid].time))) last[a.sid] = a; });
    Object.keys(last).forEach(function (sid) {
      var s = String(last[sid].answer), get = function (k) { var m = s.match(new RegExp(';' + k + ':(\\d+)')); return m ? +m[1] : 0; };
      var ms = s.match(/;ms:(\d+)\.(\d+)\.(\d+)\.(\d+)/);
      var row = { p: get('p'), c: get('c'), f: get('f'), w: get('w'), k: get('k'), b: get('b'), lv: get('lv') || 1, s1: get('s1'), sn: get('sn'), ms: ms ? ms.slice(1).map(Number) : [0, 0, 0, 0], pr: (s.match(/;pr:([0-9n_.~-]+)/) || [])[1] || '' };
      var old = K.rows[sid]; if (!old || old.p !== row.p || old.sn !== row.sn) changed = true;
      K.rows[sid] = row;
    });
    // late arrivals (their first row says they're here) join the smallest team still fighting, the Bot's opponent first
    // the finalists' work: on every screen as soon as it arrives
    if (K.state === 7 && K.ft) { var moved = false; K.ft.forEach(function (t) { var r = K.rows[t.s[0]]; if (r && r.pr !== t.lastPr) { t.lastPr = r.pr; moved = true; } }); if (moved) { K.lastPush = Date.now(); (A.pushNow || A.pushLive)(); } }
    if (K.state < 6 && K.state !== 2) {
      var inT = {}; K.teams.forEach(function (t) { t.s.forEach(function (s) { inT[s] = 1; }); });
      Object.keys(last).forEach(function (sid) {
        if (inT[sid] || !A.rosterIn().some(function (r) { return r.sid === sid; })) return;
        var cand = []; K.m.forEach(function (m) { [m.a, m.b].forEach(function (t) { if (t !== BOT && K.teams[t].s.length < 3) cand.push({ t: t, bot: m.b === BOT, n: K.teams[t].s.length }); }); });
        cand.sort(function (a, b) { return a.n - b.n || (b.bot ? 1 : 0) - (a.bot ? 1 : 0); });
        var t = cand.length ? cand[0].t : (K.teams.push({ s: [], w: 0, pts: 0, opp: [], res: 0 }), K.teams.length - 1);
        if (!cand.length) K.m.push(newMatch(t, BOT));
        K.teams[t].s.push(sid); inT[sid] = 1;
        K.m.forEach(function (m) { if (m.a === t || m.b === t) m.base[sid] = snap(K.rows[sid]); });
        K.ents = null; changed = true;
      });
    }
    if (K.state === 1 || K.state === 7) {
      var lv = [];
      K.m.forEach(function (m) { var la = sidePow(K, m, 'a', true).p, lb = m.b === BOT ? -1 : sidePow(K, m, 'b', true).p; lv.push(la); if (lb >= 0) lv.push(lb); if (la !== m.la || (lb >= 0 && lb !== m.lb)) { m.la = la; if (lb >= 0) m.lb = lb; changed = true; } });
      var md = median(lv), e = (Date.now() - K.at) / 1000, part = Math.min(1, (e - K.clip * CLIP) / CLIP);
      K.m.forEach(function (m) { if (m.b === BOT) m.lb = Math.round(Math.max(2, md) * Math.max(0.2, part)); });
    }
    if (changed) A.consolePanel();
  }
  function tick() {
    var K = C(); if (!K) return;
    var now = Date.now(), e = (now - K.at) / 1000, pushed = false, go = function () { pushed = true; save(K); (A.pushNow || A.pushLive)(); A.consolePanel(); };
    if (K.state === 3 && e >= (K.intro || INTRO)) { startRound(K); go(); }
    else if (K.state === 6 && e >= FIN_INTRO) { startRound(K, 7); go(); }
    else if (K.state === 1 || K.state === 7) {
      var len = K.rlen + (K.rx || 0), n = Math.ceil(len / CLIP), due = e >= len ? n : Math.min(n, Math.floor(e / CLIP));
      if (due > K.clip) { resolveClip(K); if (K.clip >= n) { if (K.state === 7) finBell(K); else bell(K); } go(); }
    }
    else if (K.state === 5 && e >= BELL) { afterBell(K); go(); }
    else if (K.state === 4 && e >= BREAK) { K.round++; startRound(K); go(); }
    else if (K.state === 2 && K.autoFin && !K.ft && e >= FIN_AUTO) { startFinal(K); pushed = true; }
    else if ((K.state === 2 || K.state === 8) && now - (K.state === 8 ? K.at : K.endedAt || now) > 8 * 60000) { A.console_().sumo = null; if (root && V && V.watch) close(); (A.pushNow || A.pushLive)(); A.consolePanel(); return; }
    if (!pushed && now - K.lastPush >= PUSH_MS) { K.lastPush = now; (A.pushNow || A.pushLive)(); if (K.state === 1) A.consolePanel(); }
    if (pushed) K.lastPush = now;
    if (now - (K.lastSave || 0) > 3000) { K.lastSave = now; save(K); }
    if (root && V && V.watch) apply(watchState());
  }
  function counts(out) {
    var K = C(); if (!K) return;
    out.zsid = A.encRun(K.id); out.zsst = A.encRun(K.id + (A.console_().skew || 0));
    out.zss = [K.state, K.round, ROUNDS, Math.min(9999, K.rlen + (K.rx || 0)), K.clip, Math.min(9999, Math.max(0, Math.round((K.at - K.id) / 1000))), K.teams.length, K.m.length, K.intro || INTRO, K.demo || 0, K.autoFin || 0];
    out.zsw = pack(K.teams.map(function (t) { return Math.min(9, t.w); })); out.zsl = pack(K.teams.map(function (t) { return t.res || 0; }));
    K.m.forEach(function (m, i) { out['zsm' + i] = [m.a, m.b, Math.max(0, Math.min(200, Math.round(m.pos) + 100)), m.seq % 10000, m.mv, m.ws, m.ac, m.sa, m.sb, Math.min(9999, m.la), Math.min(9999, Math.max(0, m.lb)), m.fl]; });
  }
  // the roster, one entry per student: team.member~fingerprint~name~look (two of the same first name get an initial)
  function entries(K) {
    if (K.ents) return K.ents;
    var LK = looksBySid(), first = {}, R = {};
    A.rosterIn().forEach(function (r) { R[r.sid] = r; });
    K.teams.forEach(function (t) { t.s.forEach(function (sid) { var f = nameOf(sid); first[f] = (first[f] || 0) + 1; }); });
    var out = [];
    K.teams.forEach(function (t, ti) {
      t.s.forEach(function (sid, i) {
        var f = nameOf(sid), r = R[sid];
        if (first[f] > 1 && r) { var last = String(r.name || '').indexOf(',') >= 0 ? String(r.name).split(',')[0].trim() : String(r.name || '').trim().split(' ').slice(-1)[0]; f = clean(f + ' ' + (last.charAt(0) || '')); }
        out.push(ti + '.' + i + '~' + sh3(sid) + '~' + f + '~' + (LK[sid] || (AV ? AV.defLook(sid) : '')));
      });
    });
    K.ents = out; K.entsAt = Date.now();
    return out;
  }
  function spot() {
    var K = C(), head = '';
    if (K.ents && Date.now() - (K.entsAt || 0) > 20000) K.ents = null;   // new looks from the wardrobe
    if (K.state === 2) head = 'R:' + K.reel.map(function (h) { return [h.r, h.mv, h.a, h.b, h.ws, h.ac, Math.round(h.p0) + 200, Math.round(h.p1) + 200, h.ro].join('.'); }).join(',') + '#S:' + standingsOf(K).slice(0, 12).map(function (x) { return x.t + '.' + x.w + '.' + Math.min(9999, Math.round(x.pts)); }).join(',') + '#';
    if (K.state >= 6 && K.ft) { var LK = looksBySid(); head = 'F:' + K.ft.map(function (t) { var sid = t.s[0]; return sh3(sid) + '~' + nameOf(sid) + '~' + (LK[sid] || (AV ? AV.defLook(sid) : '')); }).join(',') + '#W:' + K.ft.map(function (t) { var r = K.rows[t.s[0]]; return r && r.pr ? r.pr + '.' + r.p + '.' + r.c : ''; }).join('|') + '#'; }
    var E = entries(K), n = E.length, budget = 588 - head.length, pick = [], c0 = n ? K.cur % n : 0, used = 0;
    for (var k = 0; k < n; k++) { var x = E[(c0 + k) % n]; if (used + x.length + 1 > budget - 8) break; pick.push(x); used += x.length + 1; }
    K.cur = n ? (c0 + pick.length) % n : 0;
    return { q: 'zsumo', text: (head + 'P:' + c0 + '|' + pick.join(',')).slice(0, 600) };
  }
  function restore(Lv) {
    var o = sumoOf(Lv), saved = SFA.store.get('teacher.sumo.' + A.LID, null);
    if (!o || !saved || saved.id !== o.id || o.state === 2 || o.state === 8) { A.console_().sumo = null; return false; }
    saved.ents = null; saved.lastPush = 0; A.console_().sumo = saved;
    return true;
  }
  function watchState() {
    var K = C(), out = {}; counts(out);
    var o = sumoOf({ lesson: A.LID, counts: out, spot: spot() }); o.start = K.id; o.at = K.at; return o;
  }
  function watch() { var o = watchState(); open(o); V.watch = true; root.classList.add('screen'); apply(o); draw(); }

  // what the teacher sees: the fight, and who is stuck on which step
  function section(p) {
    var K = C(), sec = H('div', 'sect'), e = (Date.now() - K.at) / 1000, len = K.rlen + (K.rx || 0), nT = K.teams.reduce(function (a, t) { return a + t.s.length; }, 0);
    sec.appendChild(H('h3', '', '🤼 Sumo Graphing · ' + (K.state >= 6 ? '🥇 Grand final' : K.state === 2 ? 'Results' : 'Fight ' + K.round + ' of ' + ROUNDS)));
    var line = K.state === 6 ? '🥇 ' + finNames(K) + ' · starts in <b>' + clock(FIN_INTRO - e) + '</b>' : K.state === 7 ? '🥇 ' + finNames(K) + ' · <b>' + clock(len - e) + '</b> left · ring-outs ' + K.m[0].sa + '–' + K.m[0].sb + ' · this bout ' + K.m[0].la + '–' + K.m[0].lb : K.state === 8 ? '🏆 Grand champion: <b>' + esc(nameOf(K.champ)) + '</b> (beat ' + esc(nameOf(K.ft[K.ft[0].s[0] === K.champ ? 1 : 0].s[0])) + ')' :
      K.state === 3 ? 'Teams on every screen' + (K.demo ? ', with the worked example' : '') + ': the first bout starts in <b>' + clock((K.intro || INTRO) - e) + '</b>' :
      K.state === 1 ? '<b>' + clock(len - e) + '</b> left · bout ' + Math.min(Math.ceil(len / CLIP), K.clip + 1) + ' of ' + Math.ceil(len / CLIP) + ' · next move in ' + Math.max(0, Math.ceil((K.clip + 1) * CLIP - e)) + ' s' :
      K.state === 5 ? '🔔 The bell: fight ' + K.round + ' results on screen' : K.state === 4 ? 'Rematches on screen: fight ' + (K.round + 1) + ' starts in <b>' + clock(BREAK - e) + '</b>' :
      (function () { var S = standingsOf(K)[0]; return S ? '🏆 Champions: <b>' + esc(teamName(S.t, K.id)) + '</b> (' + esc(K.teams[S.t].s.map(nameOf).join(' & ')) + '), ' + S.w + '–' + (ROUNDS - S.w) + ' · highlight reel on every screen' : 'Over'; })();
    sec.appendChild(H('p', '', line + ' · ' + nT + ' wrestler' + (nT === 1 ? '' : 's') + ' in ' + K.teams.length + ' team' + (K.teams.length === 1 ? '' : 's')));
    var r = H('div', 'row');
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: '👁 Show the arena', title: 'The class screen view on this screen', onclick: function () { watch(); } }));
    if (K.state === 3 || K.state === 4) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '⏭ Start the fight now', onclick: function () { if (K.state === 4) K.round++; startRound(K); save(K); (A.pushNow || A.pushLive)(); A.consolePanel(); } }));
    if (K.state === 6) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '⏭ Start the final now', onclick: function () { startRound(K, 7); save(K); (A.pushNow || A.pushLive)(); A.consolePanel(); } }));
    if (K.state === 2 && !K.ft) { var fl = finalists(K); if (fl.length === 2) r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: '🥇 Grand final: ' + nameOf(fl[0].sid) + ' vs ' + nameOf(fl[1].sid) + (K.autoFin ? ' (in ' + Math.max(0, Math.ceil(FIN_AUTO - e)) + ' s)' : ''), title: 'The two students with the most power, 1 v 1; everyone watches their graphs', onclick: function () { startFinal(K); } })); }
    if (K.state === 1 || K.state === 7) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '⏰ +1 bout', title: 'Add 30 seconds to this fight', onclick: function () { K.rx = (K.rx || 0) + CLIP; save(K); A.pushLive(); A.consolePanel(); } }));
    if (K.state !== 2 && K.state !== 8) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: K.state >= 6 ? 'End the final now' : 'End it now', title: K.state >= 6 ? 'Decide the final as it stands' : 'Straight to the results and the highlight reel', onclick: function () { if (K.state >= 6) finBell(K); else end(K); } }));
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: 'Back to the lesson', onclick: function () { A.console_().sumo = null; if (root) close(); A.pushLive(); A.consolePanel(); } }));
    sec.appendChild(r);
    // details: the matches, and every student's steps
    var dd = dfold('g-sumo', '📋 Details · matches, who missed which step', K.state === 2);
    var tn = function (t) { return t >= 90 && t < BOT ? (K.ft ? esc(nameOf(K.ft[t - 90].s[0])) : '?') : t === BOT ? '🤖 Sumo-Bot' : esc(teamName(t, K.id)) + ' (' + esc(K.teams[t].s.map(nameOf).join(', ')) + ')'; };
    dd.appendChild(H('p', 'muted', '<b>Fight ' + K.round + ':</b> ' + K.m.map(function (m) { return tn(m.a) + ' ' + m.sa + '–' + m.sb + ' ' + tn(m.b) + (K.state === 1 ? ' · ring ' + (m.pos > 0 ? '▶' : m.pos < 0 ? '◀' : '•') + Math.abs(m.pos) + ' · this bout ' + m.la + '–' + m.lb : m.fl ? ' · 🏆 ' + (m.fl === 1 ? tn(m.a) : tn(m.b)) : ''); }).join('<br>')));
    var studs = []; K.teams.forEach(function (t, ti) { t.s.forEach(function (sid) { var w = K.rows[sid] || { c: 0, f: 0, s1: 0, sn: 0, ms: [0, 0, 0, 0], p: 0 }; studs.push({ sid: sid, n: nameOf(sid), t: ti, r: w }); }); });
    studs.sort(function (a, b) { return a.r.c - b.r.c || (a.r.sn ? a.r.s1 / a.r.sn : 0) - (b.r.sn ? b.r.s1 / b.r.sn : 0); });
    var STEP = ['table', 'plotting', 'drawing the line', 'finding the point'], tot = [0, 0, 0, 0];
    studs.forEach(function (s) { (s.r.ms || []).forEach(function (v, i) { tot[i] += v || 0; }); });
    var hard = tot.indexOf(Math.max.apply(null, tot));
    if (tot[hard] > 0) dd.appendChild(H('p', 'muted', '<b>Most misses:</b> ' + STEP[hard] + ' (' + tot[hard] + ') · table ' + tot[0] + ' · plotting ' + tot[1] + ' · line ' + tot[2] + ' · finding ' + tot[3]));
    dd.appendChild(H('p', 'muted', '<b>Students (fewest graphs first):</b> ' + studs.map(function (s) { var pc = s.r.sn ? Math.round(100 * s.r.s1 / s.r.sn) : -1; return (pc < 0 ? '⚪ ' : pc >= 80 ? '🟢 ' : pc >= 55 ? '🟡 ' : '🔴 ') + esc(s.n) + ' ' + s.r.c + ' graph' + (s.r.c === 1 ? '' : 's') + (pc >= 0 ? ', ' + pc + '% first try' : ', nothing yet') + (s.r.ms && s.r.ms.some(Boolean) ? ' (misses ' + s.r.ms.join('/') + ')' : ''); }).join(' · ') + '<br><small>Misses are table / plotting / line / finding.</small>'));
    var cp = el('button', { type: 'button', 'class': 'btn small', text: '📋 Copy results' });
    cp.onclick = function () {
      var lines = ['Name\tTeam\tWins\tGraphs\tPerfect\tSteps right first try\tSteps\tTable misses\tPlot misses\tLine misses\tFind misses'].concat(studs.map(function (s) { var m = s.r.ms || [0, 0, 0, 0]; return [s.n, teamName(s.t, K.id), K.teams[s.t].w, s.r.c, s.r.f || 0, s.r.s1 || 0, s.r.sn || 0, m[0], m[1], m[2], m[3]].join('\t'); }));
      try { navigator.clipboard.writeText(lines.join('\n')).then(function () { SFA.toast('Copied. Paste it into a spreadsheet.', 2500); }); } catch (x) { SFA.toast('Couldn\'t copy here.', 2500); }
    };
    dd.appendChild(cp);
    sec.appendChild(dd);
    p.appendChild(sec);
  }
  function dfold(key3, title, open) { if (A.fold) return A.fold(key3, title, open); var d = el('details', { 'class': 'sect fold' }); d.appendChild(el('summary', {}, [H('h3', '', title)])); d.open = !!open; return d; }
  (A.every || function (f, ms) { setInterval(f, ms); })(function () { if (A.MODE === 'teach' && A.console_() && C()) tick(); }, 500);

  /* ---------- styles ---------- */
  var css = [
    '.sm{position:fixed;inset:0;z-index:90;overflow:auto;background:radial-gradient(ellipse at top,#4a2414,#140a06 72%);color:#F6EFE3;padding:10px 14px 28px;display:flex;flex-direction:column;gap:12px;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}',
    '.smtop{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:10px;align-items:center}',
    '.smlogo{font-size:18px;letter-spacing:1px}.smright{display:flex;justify-content:flex-end;gap:8px;align-items:center;min-width:0}',
    '.smyou{font-style:normal;background:#FFE14D;color:#2a1a0a;border-radius:8px;padding:0 6px;font-size:12px;vertical-align:middle}',
    '.smsho{color:#FFE14D;letter-spacing:2px;white-space:nowrap}',
    '.smmid{text-align:center;display:flex;flex-direction:column;align-items:center;line-height:1.2}.smrd{font-weight:800;font-size:13px;opacity:.9}.smclock{font:900 28px/1.1 system-ui;color:#FFE14D}.smsub{opacity:.75}',
    '.smsnd{background:rgba(255,255,255,.1);border:0;border-radius:10px;font-size:18px;padding:4px 8px;cursor:pointer;color:inherit}.smback{white-space:nowrap}',
    '.smbody{display:grid;grid-template-columns:1fr;gap:12px}',
    '@media (min-width:821px){.smbody{grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:start}}',
    '.smleft{display:flex;flex-direction:column;gap:10px}.smmini{display:flex;flex-wrap:wrap;gap:10px 16px;font-weight:700;opacity:.92}.smmini b{color:#FFE14D}',
    '.smwork{background:rgba(255,255,255,.06);border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:9px}',
    '.smrule{font:900 30px/1.15 Georgia,"Times New Roman",serif;text-align:center;background:#FFF7E0;color:#2a1a0a;border-radius:12px;padding:10px;border:3px solid #C9A45C}.smrule small{display:block;font:700 12px/1.2 system-ui;color:#8a6a2a;margin-top:4px}',
    '.smx{font-style:italic}.smfr{display:inline-flex;flex-direction:column;vertical-align:middle;font-size:.62em;text-align:center;line-height:1.05;margin:0 2px}.smfr i{font-style:normal}.smfr i:first-child{border-bottom:2px solid currentColor}',
    '.smsteps{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}.smsteps span{font-size:12px;font-weight:800;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,.08);opacity:.6}.smsteps .on{background:#FFE14D;color:#2a1a0a;opacity:1}.smsteps .done{opacity:.9;background:rgba(124,242,162,.25)}',
    '.smtip{text-align:center;font-weight:600}.smtip b{color:#FFE14D}',
    '.smtbl{border-collapse:collapse;margin:0 auto}.smtbl td,.smtbl th{border:2px solid #C9A45C;padding:6px 12px;text-align:center;font:800 20px/1.1 system-ui;min-width:52px}.smtbl th{background:rgba(201,164,92,.25)}',
    '.smtbl td.cell{cursor:pointer;background:rgba(255,255,255,.06)}.smtbl td.smact{outline:3px solid #FFE14D;outline-offset:-3px;background:rgba(255,225,77,.16)}.smtbl td.ok{color:#7CF2A2}.smtbl td.rev{color:#FFB86B}',
    '.smfb{min-height:1.3em;text-align:center;font-weight:700;color:#FFB86B}.smfb.good{color:#7CF2A2}',
    '.smkeys{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;max-width:340px;width:100%;margin:0 auto}.smkeys button{font:800 21px/1 system-ui;padding:13px 0;border-radius:11px;border:0;background:#F6EFE3;color:#2a1a0a;box-shadow:0 3px 0 #9c8a6a;cursor:pointer}.smkeys button:active{transform:translateY(2px);box-shadow:0 1px 0 #9c8a6a}.smkeys .smgo{grid-column:span 4;background:#FFE14D}',
    '.smgraph svg{width:100%;max-width:440px;display:block;margin:0 auto;touch-action:none;border-radius:10px;cursor:crosshair;user-select:none;-webkit-user-select:none}',
    '.smline{stroke-dasharray:1200;stroke-dashoffset:1200;animation:smink .7s ease-out forwards}@keyframes smink{to{stroke-dashoffset:0}}',
    '.smpow{position:fixed;z-index:99;font:900 26px/1 system-ui;color:#FFE14D;text-shadow:0 2px 0 #000;pointer-events:none;animation:smpow 1.1s ease-out forwards}@keyframes smpow{from{transform:translateY(0);opacity:1}to{transform:translateY(-70px);opacity:0}}',
    '.smcard{background:rgba(255,255,255,.06);border-radius:18px;padding:16px;max-width:900px;width:100%;margin:0 auto;display:flex;flex-direction:column;gap:10px;text-align:center}.smcard.wide{max-width:none}.smcard h2{margin:0;font-size:26px}.smbig{font-size:20px;font-weight:700}.smbig b{color:#FFE14D}',
    '.smhow{display:flex;flex-wrap:wrap;gap:6px 18px;justify-content:center;padding:0;margin:4px 0;list-style-position:inside;font-weight:700}',
    '.smvs{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:10px;align-items:center}.smvsx{font:900 30px/1 Impact,system-ui;color:#FFE14D;text-shadow:0 3px 0 #000}',
    '.smvside{border:3px solid var(--c);border-radius:14px;padding:8px;background:rgba(0,0,0,.2);display:flex;flex-direction:column;gap:4px;align-items:center;min-width:0}.smvside.me{box-shadow:0 0 0 3px #FFE14D}.smvside small{font-weight:800;color:var(--c)}',
    '.smavs{display:flex;justify-content:center;gap:4px}.smavs figure{margin:0;flex:1 1 0;max-width:84px;min-width:0}.smavs svg{width:100%;height:auto}.smavs figcaption{font-weight:700;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.smgrid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}',
    '.smmatch{background:rgba(255,255,255,.06);border-radius:14px;padding:8px;display:flex;flex-direction:column;gap:6px;min-width:0}',
    '.smmh,.smnames{display:flex;justify-content:space-between;gap:8px;font-weight:800;min-width:0}.smnames{font-weight:600;font-size:13px;opacity:.8}.smtn{color:var(--c);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.smtug{display:flex;align-items:center;gap:8px;font-weight:800}.smtug i{flex:1;height:12px;border-radius:6px;background:' + SIDE[1].c + ';overflow:hidden;position:relative}.smtug u{position:absolute;left:0;top:0;bottom:0;background:' + SIDE[0].c + ';transition:width .6s}.smtug .sma{color:' + SIDE[0].c + '}.smtug .smb{color:' + SIDE[1].c + '}',
    '.smres{text-align:center;font-weight:800;color:#FFE14D;min-height:0}.smres:empty{display:none}',
    '.smst{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:14px;background:radial-gradient(ellipse at 50% 0%,#5a3220,#1a0f0a 72%);container-type:inline-size}',
    '.smroof{position:absolute;left:10%;right:10%;top:0;height:8%;background:linear-gradient(#6a1838,#3a0e20);clip-path:polygon(3% 0,97% 0,100% 100%,0 100%)}',
    '.smroof i{position:absolute;top:100%;width:2cqi;height:5cqi;border-radius:0 0 1cqi 1cqi}.smroof i:nth-child(1){left:2%;background:#2E8B57}.smroof i:nth-child(2){left:32%;background:#C0392B}.smroof i:nth-child(3){left:66%;background:#F5F5F5}.smroof i:nth-child(4){left:96%;background:#222}',
    '.smcrowd{position:absolute;left:0;right:0;top:12%;font-size:3.4cqi;line-height:1.25;white-space:normal;word-break:break-all;height:24%;overflow:hidden;opacity:.33;text-align:center}',
    '.smring{position:absolute;left:5%;right:5%;bottom:5%;height:36%;border-radius:50%;background:radial-gradient(ellipse at 50% 40%,#f6e7bd,#e2c88a 68%,#c9a45c 70%,#b38a45 75%,#6b4a22 76%);box-shadow:0 1.2cqi 0 #2a1a0a}',
    '.smln{position:absolute;top:40%;width:.7cqi;height:18%;background:#fff;border-radius:.3cqi;opacity:.9}.smln.l{left:44%}.smln.r{left:56%}',
    '.smsd{position:absolute;bottom:17%;width:17%;transform:translateX(-50%);z-index:2}.smst.small .smsd{width:18%}',
    '.smw{position:absolute;left:0;bottom:0;width:100%}.smw svg{width:100%;height:auto;display:block}.smw .smnoav{font-size:8cqi}',
    '.smsd .w1{left:-36%;bottom:12%;width:82%;z-index:-1;filter:brightness(.85)}.smsd.s1 .w1{left:54%}.smsd .w2{left:-62%;bottom:22%;width:66%;z-index:-2;filter:brightness(.72)}.smsd.s1 .w2{left:96%}',
    '.smsd .w0{position:relative}',
    '.smbelt{position:absolute;left:24%;right:24%;top:71%;height:7%;background:var(--bc);border:.3cqi solid #141428;border-radius:.6cqi}.smbelt::after{content:"";position:absolute;left:41%;top:85%;width:18%;height:130%;background:var(--bc);border:.3cqi solid #141428;border-top:0;border-radius:0 0 .4cqi .4cqi}',
    '.smsd.s1 .smw svg{transform:scaleX(-1)}',
    '.smcam{position:absolute;inset:0}',
    '.smbod{position:relative;transform-origin:50% 92%}',
    '.smeyes{display:none;position:absolute;inset:0;pointer-events:none}.smeyes b{position:absolute;top:49%;width:14%;aspect-ratio:1;border-radius:50%;background:#fff;border:.25cqi solid #141428;display:flex;align-items:center;justify-content:center;font:900 2.3cqi/1 system-ui;color:#141428;animation:smspin .6s linear infinite}.smeyes b::after{content:"@"}.smeyes b:first-child{left:33.6%}.smeyes b:last-child{left:52.4%}',
    '.smshades{display:none;position:absolute;left:50%;top:47%;font-size:5.4cqi;line-height:1;transform:translateX(-50%)}.smsd.cool .smshades{display:block;animation:smdrop .45s cubic-bezier(.3,1.6,.6,1)}',
    '.smstars{display:none;position:absolute;left:0;right:0;top:-2%;text-align:center;font-size:2.6cqi;font-style:normal;white-space:nowrap;animation:smorbit .9s linear infinite}.smsd.dizzy .smeyes,.smsd.dizzy .smstars{display:block}.smsd.dizzy .smshades{display:none}',
    '@keyframes smspin{to{transform:rotate(360deg)}}@keyframes smorbit{0%{transform:perspective(60px) rotateY(0deg)}100%{transform:perspective(60px) rotateY(360deg)}}@keyframes smdrop{from{transform:translate(-50%,-260%) rotate(-20deg)}to{transform:translate(-50%,0)}}',
    '.smhand{position:absolute;top:56%;opacity:0;font-size:5cqi;font-style:normal;z-index:3;line-height:1}.smsd.s0 .smhand{left:72%}.smsd.s1 .smhand{left:-2%}',
    '.smspeed{position:absolute;inset:0;background:repeating-conic-gradient(from 0deg at var(--fx,50%) 64%,rgba(255,255,255,.65) 0 1.6deg,transparent 1.6deg 8deg);-webkit-mask:radial-gradient(circle at var(--fx,50%) 64%,transparent 22%,#000 50%);mask:radial-gradient(circle at var(--fx,50%) 64%,transparent 22%,#000 50%);opacity:0;pointer-events:none;z-index:4}',
    '.smcomic{position:absolute;top:24%;font:900 8cqi/1 Impact,system-ui;color:#FFE14D;-webkit-text-stroke:.35cqi #141428;text-shadow:.6cqi .6cqi 0 #E8323A;z-index:6;opacity:0;white-space:nowrap;pointer-events:none}',
    '.smref{position:absolute;left:50%;top:13%;background:#fff;color:#141428;font:900 3.4cqi/1 Impact,system-ui;padding:.8cqi 1.8cqi;border-radius:2cqi;border:.3cqi solid #141428;opacity:0;z-index:6;white-space:nowrap;letter-spacing:.15cqi}',
    '.smann{display:block;font:900 3.4cqi/1.1 Impact,system-ui;font-style:normal;color:#FFE14D;-webkit-text-stroke:.18cqi #141428;margin-bottom:1cqi;letter-spacing:.1cqi}',
    '.smbar{position:absolute;left:0;right:0;height:10%;background:#000;z-index:5}.smbar.smbt{top:-10%}.smbar.smbb{bottom:-10%}',
    '.smtitle{position:absolute;top:12%;left:0;right:0;text-align:center;font:900 4.2cqi/1 Impact,system-ui;color:#FFE14D;letter-spacing:.3cqi;text-shadow:0 .4cqi 0 #000;opacity:0;z-index:6}',
    '.smflash{position:absolute;inset:0;background:radial-gradient(circle at var(--fx,50%) 62%,#fff,rgba(255,255,255,0) 55%);opacity:0;pointer-events:none;z-index:4}',
    '.smban{position:absolute;left:0;right:0;top:26%;text-align:center;opacity:0;z-index:6;padding:0 3%}.smban>b{display:block;font:900 8cqi/1 Impact,system-ui;color:#fff;-webkit-text-stroke:.35cqi #141428;text-shadow:0 .6cqi 0 #C0392B;letter-spacing:.2cqi}',
    '.smban span b{color:#B0281F}.smban span{display:inline-block;margin-top:1.2cqi;font:800 2.7cqi/1.25 system-ui;color:#2a1a0a;background:#FFE14D;padding:.7cqi 1.8cqi;border-radius:2cqi;max-width:94%}.smban em{font-style:normal;margin-left:.6cqi;padding:0 1cqi;border-radius:1cqi}.smyay{background:#7CF2A2}.smboo{background:#fff}',
    '.smstamp{position:absolute;top:13%;right:6%;font:900 6cqi/1 Impact,system-ui;color:#E8323A;border:.6cqi solid #E8323A;padding:.4cqi 1.4cqi;opacity:0;z-index:7;background:rgba(255,255,255,.9);border-radius:1cqi}',
    '.smfx{position:absolute;font-size:6cqi;z-index:6;pointer-events:none;line-height:1}',
    '.smfx.smword{font:900 7cqi/1 Impact,system-ui;color:#FFE14D;-webkit-text-stroke:.3cqi #141428;text-shadow:.5cqi .5cqi 0 #E8323A;white-space:nowrap;z-index:7}',
    '.smv{position:fixed;inset:0;z-index:96;background:rgba(5,3,10,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:10px}.smvbox{width:min(96vw,calc(84vh * 1.7778))}.smskip{opacity:.6;color:#fff}',
    '.smreelbox{width:100%;max-width:820px;margin:0 auto}.smreelbox.smrw{max-width:none}',
    '.smsplit{display:grid;grid-template-columns:1fr;gap:14px;align-items:start}@media (min-width:821px){.smsplit{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}}',
    '.smstand{text-align:left;background:rgba(0,0,0,.2);border-radius:14px;padding:10px 12px}.smstand h3{margin:0 0 6px}.smstand ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}',
    '.smstand li{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:2px 8px;align-items:center;padding:4px 6px;border-radius:8px}.smstand li.me{background:rgba(255,225,77,.18)}.smstand li small{grid-column:2;opacity:.75;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.smstand li em{grid-row:1/3;grid-column:3;font-style:normal;font-weight:900;color:#FFE14D}.smstand li span{grid-row:1/3}',
    '.smmine{display:flex;flex-direction:column;gap:4px}',
    '.sm.screen .smclock{font-size:40px}.sm.screen .smcard h2{font-size:34px}.sm.screen .smtn{font-size:18px}',
    '@media (max-width:820px){.smtop{gap:6px}.smlogo{font-size:13px}.smlogo b{display:block}.smclock{font-size:22px}.smtn{font-size:14px}.smrule{font-size:24px}.smvsx{font-size:22px}.smvside{padding:6px 4px}.smvside b{font-size:14px}.smcard h2{font-size:21px}}',
    '.smnoink .smline{animation:none;stroke-dashoffset:0}',
    '.smfinbar{background:linear-gradient(90deg,#FFE14D,#FFB020);color:#2a1a0a;border-radius:12px;padding:8px 12px;font-weight:700;text-align:center}',
    '.smfin{display:flex;flex-direction:column;gap:12px}.smfin .smmatch{max-width:900px;width:100%;margin:0 auto}',
    '.smboards{display:grid;grid-template-columns:1fr;gap:12px}@media (min-width:821px){.smboards{grid-template-columns:1fr 1fr}}',
    '.smwatch{border:3px solid var(--c);border-radius:16px;padding:10px;background:rgba(0,0,0,.2);display:flex;flex-direction:column;gap:8px;text-align:center}.smwatch h3{margin:0;color:var(--c)}.smwatch h3 small{color:#F6EFE3;font-weight:600}',
    '.smdemo{background:rgba(0,0,0,.25);border:2px solid #C9A45C;border-radius:16px;padding:10px;display:flex;flex-direction:column;gap:8px;text-align:center;width:100%;max-width:760px;margin:0 auto}.smdh{font-weight:900;color:#FFE14D;letter-spacing:1px}',
    '.smcap{font-size:18px;font-weight:600;min-height:2.6em;margin:0}.smcap b{color:#FFE14D}',
    '.smdg{display:grid;grid-template-columns:1fr;gap:10px;align-items:center}@media (min-width:640px){.smdg{grid-template-columns:auto minmax(0,1fr)}}.smdg .smgraph svg{max-width:340px}',
    '.smchamp svg{width:200px;height:auto}',
    '@media (prefers-reduced-motion:reduce){.smline{animation:none;stroke-dashoffset:0}}'
  ].join('\n');
  var sty = document.createElement('style'); sty.textContent = css; document.head.appendChild(sty);

  window.SFA_SUMO = { sync: sync, agg: agg, section: section, start: start, counts: counts, spot: spot, restore: restore, sumoOf: sumoOf, gen: gen,
    movie: movie, MOVES: MOVES,
    peek: function () { return ST && ST.pr ? { q: gen(ST.pr.seed, ST.pr.lvl), stage: ST.pr.stage, act: ST.pr.act, pm: ST.pr.pm.slice(), p: ST.p, c: ST.c } : null; } };   // for the practice simulator
})();
