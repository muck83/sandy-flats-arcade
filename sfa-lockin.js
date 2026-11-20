/* 🔐 Goat Lock-In: an escape room for the whole class. The Wild Goat has locked everyone in the prize vault at the
   Sandy Flats Fair (and eaten the key). Between the class and the door there is a chain of 5 to 7 locks, and a clock.
   Loaded by sfa-lesson.js (after sfa-crewkit.js) when the teacher starts one.

   - Every lock needs pieces from a set number of DIFFERENT students: one right answer is one piece, and a student can
     put only one piece in each lock. The number is scaled to who is here (about 4 in 10 of the class for a short game,
     6 in 10 for a long one; fewer for the first lock, 8 in 10 for the last), so a few fast students cannot open a lock
     alone. Each piece clicks into the lock on every screen with its maker's avatar on it.
   - A student whose piece is in can pocket ONE piece for the next lock. After that their right answers add 4 seconds
     to the clock each (6 times at most), so nobody runs out of things to do and nobody can carry the class.
   - SPLIT-CLUE locks (one in a short game, two in a longer one): one to three pairs of students each get half of a
     2-digit code on their own screens: one has the first digit, the other the second. They have to find each other
     in the room and talk. The pairs put a student who has been quiet with one who has been busy. The lock needs
     its pieces AND every pair's code.
   - Never stuck: a wrong answer gets a hint and another try (sfa-crewkit.js). The teacher's 💡 Give a clue sends every
     student still working a hint and shows split-clue pairs the whole code. A lock that has been shut for a long time
     starts to rust: it needs one piece fewer every few seconds, and a pair's code is shown to them, then let through.
   - No shaming: the screens show the pieces that are IN and who made them. Only the console lists who has not.

   Sync like the other crew games: each student's running row (q "zvltx1": "e1;id:<game>;r:<right>;f:<first time>;
   n:<tries>;p:<pieces made>;x:<clock top-ups>;dl:<the lock my last piece went in>;bl:<the lock I pocketed one for>;
   sc:<lock>.<the code I typed>") goes to the Sheet; the console is the referee and publishes in the live counts
     zvlts [state, clock, locks, the lock they are on, pieces needed, students, salt, crew list number, escaped,
            clues given, pairs done (bits 0-2) + pairs shown the code (bit 3), seconds to spare],
     zvltid / zvltst the start, zvltf0.. fingerprints, zvltd who has a piece in this lock, zvltb who has pocketed one,
     zvltq the pairs (students, +1), zvltc their codes
   and the spotlight (spot.q "zvlt": "P:" a page of names and avatars, "#E:" the latest openings and top-ups). */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API, SFA = window.SFA, T = window.SFA_CREW;
  var H = A.H, el = A.el, esc = SFA.esc;
  var QID = 'zvltx1', TOPUP = 4, TOPUP_MAX = 6, RUST_AT = 75, RUST_LAST = 95, RUST_EVERY = 8, PAIR_SHOW = 45, PAIR_PASS = 100;
  // the chain, by how many locks: k padlock, d dial, s split-clue safe, g gears, f fuse box, w the vault wheel
  var CHAINS = { 5: 'kdsgw', 6: 'kdsgsw', 7: 'kdsgfsw' };
  var KIND = {
    k: { n: 'The Rusty Padlock', g: '🔑', piece: 'key tooth', pl: 'key teeth', beat: 'CLUNK. The padlock drops off. Behind it there is… another door. You can hear the goat chewing.' },
    d: { n: 'The Dizzy Dial', g: '🔢', piece: 'digit', pl: 'digits', beat: 'The dial spins open! Somewhere outside, the goat burps up a raffle ticket.' },
    s: { n: 'The Two-Half Safe', g: '🧩', piece: 'piece', pl: 'pieces', beat: 'Two halves, one code. The safe swings open and four hundred rubber ducks pour out.' },
    g: { n: 'The Grumpy Gears', g: '⚙️', piece: 'gear', pl: 'gears', beat: 'The gears grind, the wall slides back… and behind it is a slightly smaller wall.' },
    f: { n: 'The Fuse Box', g: '🔋', piece: 'fuse', pl: 'fuses', beat: 'The lights come on. Everyone can now see how much popcorn they are standing in.' },
    w: { n: 'The Vault Wheel', g: '🔩', piece: 'bolt', pl: 'bolts', beat: '' }
  };
  var GOAT = ['Baa.', 'I ate the key. No regrets.', 'It needs DIFFERENT people. I counted.', 'Take your time. I live here now.', 'Half of you could just sit there. Please do.', 'That lock was my favourite.', 'Nobody has ever got out. (Nobody has ever been in.)', 'Is that popcorn? Slide it under the door.'];

  function fx(name) { var F = window.SFA_FX, f = F && F[name]; if (typeof f !== 'function') return; try { return f.apply(F, [].slice.call(arguments, 1)); } catch (e) { } }
  function cat(c, pre) { var out = []; for (var k = 0; k < 6; k++) { var a = c[pre + k]; if (!Array.isArray(a)) break; out = out.concat(a); } return out; }
  function chunk(out, pre, arr, max) { for (var k = 0; k < max && (k === 0 || k * 12 < arr.length); k++) out[pre + k] = arr.slice(k * 12, k * 12 + 12); }
  function chainOf(nl) { return CHAINS[nl] || CHAINS[5]; }
  function kindOf(nl, L) { var c = chainOf(nl); return c.charAt(Math.max(0, Math.min(c.length, L) - 1)); }

  function gameOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zvlts) || !Array.isArray(c.zvltid)) return null;
    var z = c.zvlts, id = A.decRun(c.zvltid), start = A.MODE === 'screen' ? id : A.decRun(c.zvltst) || id;
    var sp = Lv.spot && Lv.spot.q === 'zvlt' ? String(Lv.spot.text || '') : '', ev = [], seq = 0, m = /#E:(\d+)\|([^#]*)/.exec(sp);
    if (m) { seq = +m[1]; ev = m[2] ? m[2].split(',').map(function (x) { var p = x.split('~'); return { k: p[0], a: +p[1] || 0 }; }) : []; }
    var q = c.zvltq || [], cd = c.zvltc || [], pairs = [], pm = z[10] || 0;
    for (var i = 0; i * 2 + 1 < q.length; i++) if (q[i * 2] && q[i * 2 + 1]) pairs.push({ a: q[i * 2] - 1, b: q[i * 2 + 1] - 1, code: cd[i] || 0, ok: !!(pm >> i & 1) });
    return { id: id, start: start, state: z[0], dur: z[1] || 300, nl: CHAINS[z[2]] ? z[2] : 5, L: z[3] || 1, need: z[4] || 1, n: z[5] || 0, salt: z[6] || 0, ep: z[7] || 0, win: !!z[8], clue: z[9] || 0, show: !!(pm >> 3 & 1), spare: z[11] || 0,
      fps: cat(c, 'zvltf'), done: c.zvltd || [], bank: c.zvltb || [], pairs: pairs, sp: sp, ev: ev, seq: seq };
  }
  function leftOf(b) { return Math.max(0, Math.round((b.start + b.dur * 1000 - T.sNow()) / 1000)); }
  function doneList(b) { var out = []; for (var i = 0; i < b.n; i++) if (T.bit(b.done, i)) out.push(i); return out; }

  /* =========================== student page and class screen =========================== */
  var root = null, V = null, ST = null, crew = T.Crew(), quiz = null;
  var ban0 = T.Banners(function () { return !!root; }), ban = { say: function (h, k, ms) { ban0.say(h, (k || '') + (stu() ? '' : ' lkbig'), ms); }, clear: ban0.clear };
  function key() { return 'lockin.' + A.LID; }
  function keep() { if (ST) SFA.store.set(key(), ST); }
  function xp(n, once) { if (A.hero && ST && A.MODE === 'student') A.hero.add('lk', String(Math.round(ST.id / 1000)) + (once ? 'e' : ''), n, once); }
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
    ST = saved && saved.id === b.id ? saved : { id: b.id, r: 0, f: 0, n: 0, p: 0, x: 0, dl: 0, bl: 0, sc: '', clue: 0, got: {}, done: 0 };
    V = { id: b.id, b: b, ep: b.ep, me: -1, L: 0, goat: 0 }; crew = T.Crew();
    root = H('div', 'crw lk' + (stu() ? '' : ' screen')); root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Goat Lock-In');
    root.innerHTML = '<div class="crwhud"><h1>🔐 Goat Lock-In</h1><span class="crwpill" id="lkT"></span><span class="crwpill" id="lkL"></span><span class="crwsp"></span><span class="crwpill" id="lkS"></span></div>' +
      '<div class="crwbody"><div class="crwscene lkscene"><div class="lkchain"></div><div class="lkmain"><div class="lkartbox"><div class="lkart"></div></div>' +
      '<div class="lkpanel"><h2 class="lkname"></h2><p class="lkneed"></p><div class="lkslots"></div><div class="lkpairs"></div></div></div>' +
      '<div class="lkfloor"><span class="lkprize">🧸</span><span class="lkprize">🎟️</span><span class="lkprize">🍭</span><p class="lkstory"></p><span class="lkprize">🎈</span><span class="lkprize">🦆</span><div class="lkgoat"><b></b><span>🐐</span></div></div></div>' +
      '<div class="crwside"><div class="crwcard lkme"></div><div class="crwcard lkq"></div></div></div>';
    document.body.appendChild(root); document.body.classList.add('crwing');
    if (stu()) quiz = T.Quiz({ st: function () { return ST; }, keep: keep, seed: T.hash(A.S.me ? A.S.me.sid : 'x') + Math.round(b.id / 1000) % 99991, redraw: function () { drawQ(); drawMe(); }, right: right, tried: tried });
    V.tick = setInterval(function () { if (root) drawTop(); }, 1000);
    V.goatT = setInterval(function () { if (root && V.b.state === 1) { V.goat++; goatSay(GOAT[V.goat % GOAT.length]); } }, 9000);
    V.fit = function () { if (root) { V.ssig = ''; drawLock(); } }; window.addEventListener('resize', V.fit);
  }
  function close() {
    if (!root) return; clearInterval(V.tick); clearInterval(V.goatT); window.removeEventListener('resize', V.fit); ban.clear();
    root.remove(); root = null; V = null; quiz = null; document.body.classList.remove('crwing');
    var x = document.querySelector('.crwwatchx'); if (x) x.remove();
  }
  function goatSay(t) { var g = root && root.querySelector('.lkgoat b'); if (!g) return; g.textContent = t; g.classList.remove('say'); void g.offsetWidth; g.classList.add('say'); }

  function myPair(b) { for (var i = 0; i < b.pairs.length; i++) if (b.pairs[i].a === V.me || b.pairs[i].b === V.me) return i; return -1; }
  function iAmIn(b) { return V.me >= 0 && (T.bit(b.done, V.me) || ST.dl === b.L || (ST.sc && ST.sc.split('.')[0] === String(b.L) && pairRight(b))); }
  function iBanked(b) { return V.me >= 0 && b.L < b.nl && (T.bit(b.bank, V.me) || ST.bl === b.L + 1); }
  function pairRight(b) { var i = myPair(b); return i >= 0 && ST.sc === b.L + '.' + b.pairs[i].code; }

  function apply(b) {
    var prev = V.prev; V.b = b;
    if (b.ep !== V.ep) { V.ep = b.ep; crew = T.Crew(); }
    crew.take(b.sp);
    if (stu() && A.S.me) {
      V.me = b.fps.indexOf(T.fpn(A.S.me.sid, b.salt));
      if (b.state === 1 && !V.said && (V.me < 0 || !ST.hi)) { V.said = 1; ST.hi = 1; keep(); send(); }   // say hello: the console counts me as here (and adds me if I am late)
    }
    // a lock opened
    if (b.L !== V.L) {
      var was = V.L; V.L = b.L;
      if (stu()) {
        if (ST.bl === b.L) { ST.dl = b.L; keep(); }
        if (was && b.L > was && (ST.got[was] || ST.dl === was)) { xp(4); }
        var z = quiz.state(); if (z.fb && z.fb.ok) { quiz.next(); } quiz.newRound(); V.qsig = '';
      }
      if (was && b.L > was && b.state === 1) opened(was, b);
      V.ssig = ''; V.asig = '';
    }
    if (stu() && V.me >= 0 && b.state === 1) {
      if (T.bit(b.done, V.me)) { if (ST.dl !== b.L) { ST.dl = b.L; keep(); } if (!ST.got[b.L]) { ST.got[b.L] = 1; keep(); xp(5); } }
      // the teacher (or a rusty lock) sent a clue
      if (b.clue > ST.clue) { ST.clue = b.clue; keep(); if (!iAmIn(b) && quiz.extra()) { SFA.toast('💡 A clue from your teacher! Look at your question again.', 3500); fx('sfx', 'coin'); V.qsig = ''; } }
    }
    if (V.seen == null) V.seen = b.seq;
    else if (b.seq > V.seen) {
      var first = b.seq - b.ev.length + 1;
      b.ev.forEach(function (e, i) { if (first + i > V.seen) evFx(e); });
      V.seen = b.seq;
    }
    if (prev && b.state === 2 && prev.state !== 2) finale(b);
    if (!prev && b.state === 1 && T.sNow() - b.start < 15000) { story('The Wild Goat has locked the whole class in the prize vault at the fair. And eaten the key. ' + b.nl + ' locks to go.'); goatSay('Baa. You are mine now.'); }
    V.prev = b;
    drawTop(); drawChain(); drawLock();
    if (stu()) {
      if (b.state === 2 && !ST.done && (ST.r || ST.n)) { ST.done = 1; keep(); xp(25 + (b.win ? 25 : 0), true); }
      drawMe();
      var sig = [b.state, b.L, T.pool().length, V.me >= 0, iAmIn(b), iBanked(b)].join('|'); if (sig !== V.qsig) { V.qsig = sig; drawQ(); }
    }
    root.querySelector('.lkscene').classList.toggle('lkover', b.state === 2);
    if (b.state === 2) ending(); else { var e2 = root.querySelector('.lkend'); if (e2) e2.remove(); V.esig = ''; }
  }
  function story(t) { var s = root && root.querySelector('.lkstory'); if (!s) return; s.textContent = t; s.classList.remove('in'); void s.offsetWidth; s.classList.add('in'); }
  function opened(was, b) {
    var K = KIND[kindOf(b.nl, was)];
    ban.say('🔓 <b>LOCK ' + was + ' IS OPEN!</b> ' + (b.nl - was) + ' to go', 'spark', 2600);
    story(K.beat); goatSay(was === b.nl - 1 ? 'Not the last one. NOT the last one!' : 'Hey! I liked that lock.');
    fx('sfx', 'boom'); fx('shake', root.querySelector('.lkscene'), { ms: 500, power: 8 }); fx('burst', root.querySelector('.lkart'), { count: 26, emoji: ['🔩', '✨', K.g], spread: 320, size: 26 });
  }
  function evFx(e) {
    var b = V.b;
    if (e.k === 't') { fx('float', root.querySelector('#lkT'), '+' + TOPUP + ' s', { color: '#5CE0B8', size: stu() ? 20 : 34 }); fx('sfx', 'coin'); }
    else if (e.k === 'c') { var p = b.pairs[e.a]; ban.say('🧩 <b>CODE CRACKED!</b> ' + (p ? esc(nameAt(p.a)) + ' + ' + esc(nameAt(p.b)) + ' found each other' : 'Two halves found each other'), 'good', 2600); fx('sfx', 'levelup'); }
    else if (e.k === 'u') { ban.say('💡 <b>A clue!</b> Everyone still working: look at your question again', '', 2400); }
    else if (e.k === 'r') { goatSay('That lock is going rusty. Fine. It needs fewer pieces.'); }
  }
  function nameAt(i) { return crew.get(i).n || 'a classmate'; }
  function finale(b) {
    if (b.win) { fx('sfx', 'win'); var n = 0; (function c() { if (!root || n++ > 4) return; if (window.SFA_FX && SFA_FX.confetti) fx('confetti', { ms: 1800 }); else A.confetti(); setTimeout(c, 1300); })(); }
    else fx('sfx', 'lose');
  }

  function drawTop() {
    if (!root || !V) return;
    var b = V.b, g = function (id) { return root.querySelector('#' + id); }, left = leftOf(b), hot = b.state === 1 && left <= 30;
    var tp = g('lkT'); tp.innerHTML = b.state === 1 ? '⏱ <b>' + T.mmss(left) + '</b>' : b.win ? '🚪 <b>Out!</b>' : '⏱ <b>Time</b>'; tp.className = 'crwpill' + (hot ? ' hot' : '');
    g('lkL').innerHTML = b.state === 1 || !b.win ? '🔒 Lock <b>' + Math.min(b.L, b.nl) + '</b> of ' + b.nl : '🔓 <b>' + b.nl + '</b> locks opened';
    g('lkS').innerHTML = b.state !== 1 ? '' : hot ? '⏰ Hurry!' : '';
    root.classList.toggle('lkhot', hot);
    if (hot && left <= 10 && left > 0 && V.lastTick !== left && !stu()) { V.lastTick = left; fx('sfx', 'tick'); }
  }
  function drawChain() {
    var b = V.b, sig = [b.L, b.nl, b.state, b.win].join('|'); if (sig === V.csig) return; V.csig = sig;
    var h = '';
    for (var i = 1; i <= b.nl; i++) {
      var k = kindOf(b.nl, i), open = i < b.L || (b.state === 2 && b.win), cur = i === b.L && b.state === 1;
      h += (i > 1 ? '<i class="lklink' + (open ? ' on' : '') + '"></i>' : '') + '<span class="lkmed' + (open ? ' open' : cur ? ' cur' : '') + '" title="' + esc(KIND[k].n) + '"><em>' + (open ? '🔓' : k === 's' ? '🧩' : '🔒') + '</em><b>' + i + '</b></span>';
    }
    h += '<i class="lklink' + (b.win ? ' on' : '') + '"></i><span class="lkmed door' + (b.win ? ' open' : '') + '"><em>🚪</em></span>';
    root.querySelector('.lkchain').innerHTML = h;
  }
  /* the lock art: one drawing per kind, with a ring that fills as the pieces go in */
  function gear(cx, cy, r, teeth, cls) {
    var pts = []; for (var i = 0; i < teeth * 2; i++) { var a = Math.PI * i / teeth, rr = i % 2 ? r : r * 0.78; pts.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1)); }
    return '<g class="' + cls + '"><polygon points="' + pts.join(' ') + '" fill="#FFC94A" stroke="#141428" stroke-width="4" stroke-linejoin="round"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.3).toFixed(1) + '" fill="#141428"/></g>';
  }
  function art(k) {
    var s = '<circle cx="100" cy="100" r="96" fill="#1a1d3f" stroke="#141428" stroke-width="5"/><circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="10"/><circle class="lkring" cx="100" cy="100" r="88" fill="none" stroke="#5CE0B8" stroke-width="10" stroke-linecap="round" stroke-dasharray="553" stroke-dashoffset="553" transform="rotate(-90 100 100)"/>';
    if (k === 'k') s += '<g class="lkbody"><path class="lkshk" d="M66 92V72a34 34 0 0 1 68 0v20" fill="none" stroke="#c9d1e6" stroke-width="14" stroke-linecap="round"/><rect x="52" y="88" width="96" height="74" rx="14" fill="#FFC94A" stroke="#141428" stroke-width="5"/><rect x="52" y="88" width="96" height="20" rx="10" fill="rgba(255,255,255,.35)"/><circle cx="100" cy="120" r="11" fill="#141428"/><rect x="95" y="122" width="10" height="24" rx="3" fill="#141428"/></g>';
    else if (k === 'd') { var t = ''; for (var i = 0; i < 12; i++) t += '<rect x="98" y="34" width="4" height="' + (i % 3 ? 8 : 14) + '" fill="#F3EFE7" transform="rotate(' + i * 30 + ' 100 100)"/>'; s += '<g class="lkbody"><circle cx="100" cy="100" r="68" fill="#2b2f66" stroke="#141428" stroke-width="5"/><g class="lkspin">' + t + '<circle cx="100" cy="100" r="34" fill="#FFC94A" stroke="#141428" stroke-width="5"/><rect x="96" y="70" width="8" height="26" rx="4" fill="#141428"/></g><path d="M100 22l9 14h-18z" fill="#FF7A3D" stroke="#141428" stroke-width="3"/></g>'; }
    else if (k === 'g') s += '<g class="lkbody">' + gear(78, 86, 40, 10, 'lkspin') + gear(132, 122, 30, 8, 'lkspin rev') + gear(84, 142, 20, 7, 'lkspin') + '</g>';
    else if (k === 's') s += '<g class="lkbody"><rect x="42" y="48" width="116" height="108" rx="12" fill="#6c7aa8" stroke="#141428" stroke-width="5"/><rect x="54" y="60" width="92" height="84" rx="8" fill="#8fa0cf" stroke="#141428" stroke-width="4"/><g class="lkspin"><circle cx="100" cy="102" r="22" fill="#FFC94A" stroke="#141428" stroke-width="5"/><path d="M100 76v52M74 102h52" stroke="#141428" stroke-width="6" stroke-linecap="round"/></g><circle cx="66" cy="72" r="5" fill="#141428"/><circle cx="134" cy="72" r="5" fill="#141428"/><rect x="50" y="156" width="18" height="10" fill="#141428"/><rect x="132" y="156" width="18" height="10" fill="#141428"/></g>';
    else if (k === 'f') s += '<g class="lkbody"><rect x="48" y="42" width="104" height="120" rx="10" fill="#4b5578" stroke="#141428" stroke-width="5"/><path d="M108 54L80 104h20l-8 44 30-56h-20z" fill="#FFE14D" stroke="#141428" stroke-width="4" stroke-linejoin="round"/><circle cx="62" cy="56" r="4" fill="#141428"/><circle cx="138" cy="56" r="4" fill="#141428"/><circle cx="62" cy="148" r="4" fill="#141428"/><circle cx="138" cy="148" r="4" fill="#141428"/></g>';
    else { var sp = ''; for (var j = 0; j < 6; j++) sp += '<g transform="rotate(' + j * 60 + ' 100 100)"><rect x="95" y="34" width="10" height="66" rx="5" fill="#c9d1e6" stroke="#141428" stroke-width="4"/><circle cx="100" cy="34" r="11" fill="#FFC94A" stroke="#141428" stroke-width="4"/></g>'; s += '<g class="lkbody"><g class="lkspin slow"><circle cx="100" cy="100" r="50" fill="none" stroke="#c9d1e6" stroke-width="12"/><circle cx="100" cy="100" r="50" fill="none" stroke="#141428" stroke-width="3"/>' + sp + '<circle cx="100" cy="100" r="20" fill="#FFC94A" stroke="#141428" stroke-width="5"/></g></g>'; }
    return '<svg viewBox="0 0 200 200" aria-hidden="true">' + s + '</svg>';
  }
  function glyph(k, i, L) { return k === 'd' ? '<u class="lkdig">' + (T.hash('d' + i + '.' + L) % 10) + '</u>' : '<u>' + KIND[k].g + '</u>'; }
  function drawLock() {
    if (!root || !V) return;
    var b = V.b, L = Math.min(b.L, b.nl), k = kindOf(b.nl, L), K = KIND[k], dn = doneList(b), sc = root.querySelector('.lkscene');
    if (stu() && V.me >= 0 && iAmIn(b) && dn.indexOf(V.me) < 0) dn.push(V.me);   // my own piece shows straight away
    var need = Math.max(b.need, 1), got = Math.min(dn.length, need);
    var artBox = root.querySelector('.lkart');
    if (V.artK !== k + L) { V.artK = k + L; artBox.innerHTML = art(k); artBox.className = 'lkart in k' + k; }
    var ring = artBox.querySelector('.lkring'); if (ring) ring.setAttribute('stroke-dashoffset', (553 * (1 - got / need)).toFixed(1));
    artBox.classList.toggle('busy', b.state === 1 && got > 0);
    root.querySelector('.lkname').innerHTML = b.state === 2 && b.win ? '🚪 The door is open!' : '<span>Lock ' + L + '</span> ' + esc(K.n);
    var left = Math.max(0, need - got), pl = b.pairs.filter(function (p) { return !p.ok; }).length;
    root.querySelector('.lkneed').innerHTML = b.state !== 1 ? '' : left ? 'Needs <b>' + need + '</b> ' + esc(need === 1 ? K.piece : K.pl) + ' from <b>' + (need === 1 ? 'one</b> person' : 'different</b> people') + ' · <b>' + left + '</b> to go' : pl ? 'All the pieces are in! Waiting for <b>' + pl + '</b> split code' + (pl === 1 ? '' : 's') : 'Opening…';
    var cw = root.querySelector('.lkslots').clientWidth || 300, big = !stu();
    var sig = [L, need, dn.join('.'), crew.key, cw, b.state, V.me].join('|');
    if (sig !== V.ssig) {
      V.ssig = sig;
      var rowsN = need > 20 ? 3 : need > (big ? 9 : 6) ? 2 : 1, cols = Math.ceil(need / rowsN), size = Math.max(26, Math.min(big ? 150 : 52, Math.floor(cw / cols) - 10)), h = '', had = V.had || {}, now = {};
      for (var i = 0; i < need; i++) {
        var who = dn[i];
        if (who == null) { h += '<div class="lkslot" style="width:' + size + 'px;font-size:' + size + 'px"><div class="lkhole" style="height:' + size + 'px"><u>' + (k === 'd' ? '?' : K.g) + '</u></div></div>'; continue; }
        var c = crew.get(who), you = who === V.me; now[who] = 1;
        h += '<div class="lkslot in' + (had[who] ? '' : ' pop') + (you ? ' you' : '') + '" style="width:' + size + 'px;font-size:' + size + 'px"><div class="lkpiece" style="height:' + size + 'px">' + (c.fp ? T.av(c.look, Math.round(size * 0.86), false) : '<span style="font-size:' + Math.round(size * 0.55) + 'px">🙂</span>') + glyph(k, who, L) + '</div>' + (size >= 44 ? '<span class="crwname ' + (c.fp ? T.ncls(c.look) : '') + '">' + esc(you ? 'You' : c.n) + '</span>' : '') + '</div>';
      }
      var fresh = Object.keys(now).filter(function (w) { return !had[w]; }).length;
      V.had = now; root.querySelector('.lkslots').innerHTML = h;
      if (fresh && V.drawn && b.state === 1) { fx('sfx', 'coin'); if (big) [].slice.call(root.querySelectorAll('.lkslot.pop')).slice(0, 4).forEach(function (x) { fx('burst', x, { count: 8, spread: 90, size: 7 }); }); fx('pop', artBox); }
      V.drawn = 1;
    }
    // the split-clue pairs: two halves looking for each other
    var ph = '';
    if (b.state === 1) b.pairs.forEach(function (p) {
      var ca = crew.get(p.a), cb = crew.get(p.b), sz = big ? Math.max(48, Math.min(120, Math.round(window.innerWidth * 0.06))) : 34, half = function (c, i) { return '<span class="lkhalf">' + (c.fp ? T.av(c.look, sz, false) : '<span style="font-size:' + Math.round(sz * 0.6) + 'px">🙂</span>') + '<b class="crwname ' + (c.fp ? T.ncls(c.look) : '') + '">' + esc(i === V.me ? 'You' : c.n || '…') + '</b></span>'; };
      ph += '<div class="lkpair' + (p.ok ? ' ok' : '') + '">' + half(ca, p.a) + '<em>' + (p.ok ? '🔑<small>code cracked!</small>' : '<i>½</i> 🧩 <i>½</i><small>find each other!</small>') + '</em>' + half(cb, p.b) + '</div>';
    });
    var pb = root.querySelector('.lkpairs'); if (pb._h !== ph) { pb._h = ph; pb.innerHTML = ph; }
    sc.classList.toggle('lksplit', b.pairs.length > 0 && b.state === 1);
  }
  /* the ending: out through the door with the prizes, or let out by the goat */
  function ending() {
    var b = V.b, sig = [b.win, crew.key, b.L, Math.round((root.querySelector('.lkscene').clientWidth || 0) / 40)].join('|'); if (V.esig === sig) return; V.esig = sig;
    var old = root.querySelector('.lkend'); if (old) old.remove();
    var who = []; for (var i = 0; i < Math.max(b.n, crew.total); i++) if (crew.get(i).fp) who.push(crew.get(i));
    var big = !stu(), size = Math.max(28, Math.min(big ? 130 : 44, Math.floor((root.querySelector('.lkscene').clientWidth || 600) * 0.9 / Math.max(5, Math.min(who.length, 14))))), prizes = ['🧸', '🎟️', '🍭', '🎈', '🦆', '🍿', '🏆', '🥨'];
    var e = H('div', 'lkend' + (b.win ? ' win' : ''));
    e.innerHTML = (b.win ? '<h1>YOU\'RE OUT!</h1><p>All ' + b.nl + ' locks, with <b>' + T.mmss(b.spare) + '</b> left on the clock. The goat is asleep on a pile of prize tickets. Help yourselves.</p>'
      : '<h1>SO CLOSE!</h1><p>Time ran out on lock <b>' + Math.min(b.L, b.nl) + '</b> of ' + b.nl + '. The goat opened the door itself, yawned, and charged everyone one sock to leave. ' + (b.L > 1 ? (b.L - 1) + ' lock' + (b.L === 2 ? '' : 's') + ' opened: that took a lot of different people.' : '') + '</p>') +
      '<div class="lkdoor"><div class="lkglow"></div><span class="lkzz">' + (b.win ? '🐐💤' : '🐐🧦') + '</span></div>' +
      '<div class="lkrun">' + who.map(function (c, j) { return '<div class="lkhop" style="width:' + size + 'px;font-size:' + size + 'px;animation-delay:' + (-(j * 0.21) % 1.5).toFixed(2) + 's"><i>' + (b.win ? prizes[j % prizes.length] : '🧦') + '</i>' + T.av(c.look, size, b.win) + '<span class="crwname ' + T.ncls(c.look) + '">' + esc(c.n) + '</span></div>'; }).join('') + '</div>';
    root.querySelector('.lkscene').appendChild(e);
  }

  /* ---------- my piece and my question (student) ---------- */
  function drawMe() {
    var box = root && root.querySelector('.lkme'); if (!box) return;
    var b = V.b, L = Math.min(b.L, b.nl), K = KIND[kindOf(b.nl, L)], h, pi = myPair(b), keepInput = false;
    if (b.state === 2) {
      var I = A.hero ? A.hero.info() : null;
      h = '<p class="crwkick">Your part in the escape</p><p class="lkstat">' + (ST.p ? 'You made <b>' + ST.p + '</b> piece' + (ST.p === 1 ? '' : 's') + (ST.x ? ' and added <b>' + ST.x * TOPUP + ' s</b> to the clock' : '') + '. ' + (b.win ? 'The door needed you.' : 'Every one of them counted.') : 'No piece from you this time. Next time, one right answer puts you on a lock.') + '</p>' + (I ? '<p class="lkstat">⭐ Level ' + I.lv + ' ' + esc(I.title) + ' · ' + I.xp + ' XP</p>' : '');
    } else if (V.me < 0) h = '<p class="crwkick">Lock ' + L + ' of ' + b.nl + '</p><p class="lkstat">🔐 Getting you in… you can start answering now.</p>';
    else {
      var in_ = iAmIn(b), bk = iBanked(b), dn = doneList(b).length + (in_ && !T.bit(b.done, V.me) ? 1 : 0), left = Math.max(0, b.need - dn), left0 = !left;
      h = '<p class="crwkick">Lock ' + L + ' of ' + b.nl + ' · ' + esc(K.n) + '</p>';
      h += '<div class="lkmine' + (in_ ? ' in' : '') + '"><span>' + (in_ ? '✅' : K.g) + '</span><p>' + (in_ ? '<b>Your ' + esc(K.piece) + ' is in this lock.</b> ' + (b.L >= b.nl ? 'Every right answer now adds <b>+' + TOPUP + ' s</b> to the clock.' : bk ? '🎒 And you have one in your pocket for the next lock. Every right answer now adds <b>+' + TOPUP + ' s</b> to the clock.' : 'Answer again to pocket one for the next lock.')
        : left0 ? '<b>The pieces are in.</b> This lock is only waiting for its split code now.' : '<b>This lock needs YOUR ' + esc(K.piece) + '.</b> One right answer and it clicks in, with your face on it.') + '</p></div>';
      h += '<div class="lkbar"><u style="width:' + Math.min(100, 100 * dn / Math.max(1, b.need)) + '%"></u></div><p class="lkstat small">' + (left ? '<b>' + left + '</b> more ' + (left === 1 ? 'person' : 'different people') + ' needed.' + (in_ ? ' You cannot add another, so help someone near you get theirs in.' : '') : in_ ? 'All the pieces are in!' : '') + '</p>';
      if (pi >= 0) {
        var p = b.pairs[pi], first = p.a === V.me, mate = first ? p.b : p.a, mc = crew.get(mate), d1 = Math.floor(p.code / 10), d2 = p.code % 10, okP = p.ok || pairRight(b), showAll = b.show || okP;
        h += '<div class="lksplitme' + (okP ? ' ok' : '') + '"><p class="crwkick">🧩 Split clue: you hold half a code</p><div class="lkcode"><b' + (first || showAll ? '' : ' class="q"') + '>' + (first || showAll ? d1 : '?') + '</b><b' + (!first || showAll ? '' : ' class="q"') + '>' + (!first || showAll ? d2 : '?') + '</b></div>' +
          (okP ? '<p class="lkstat"><b>🔑 Code cracked!</b> You and ' + esc(mc.n || 'your partner') + ' found each other.</p>'
            : '<p class="lkstat">You have the <b>' + (first ? 'FIRST' : 'SECOND') + '</b> digit. <b>' + esc(mc.n || 'A classmate') + '</b> has the other one. ' + (b.show ? 'The goat sneezed and the other half fell out: type the code in!' : 'Find them in the room, then one of you types the whole code.') + '</p><div class="crwrow lkcin"><input type="text" inputmode="numeric" maxlength="2" placeholder="2 digits" aria-label="The 2-digit code" autocomplete="off"><button type="button" class="btn primary">🔑 Try it</button></div>') + '</div>';
        keepInput = !okP;
      }
    }
    if (box._h === h) return;
    var oldIn = box.querySelector('.lkcin input'), val = oldIn ? oldIn.value : '', foc = oldIn && document.activeElement === oldIn;
    box._h = h; box.innerHTML = h;
    if (keepInput) {
      var inp = box.querySelector('.lkcin input'), go = box.querySelector('.lkcin button'); inp.value = val; if (foc) inp.focus();
      var tryIt = function () {
        var v = inp.value.replace(/\D/g, ''), bb = V.b, pp = bb.pairs[myPair(bb)]; if (v.length < 2 || !pp) { inp.focus(); return; }
        if (+v === pp.code) { ST.sc = bb.L + '.' + pp.code; xp(12); keep(); send(); fx('sfx', 'levelup'); fx('confetti', { ms: 1200 }); V.ssig = ''; drawMe(); drawLock(); }
        else { inp.value = ''; fx('sfx', 'wrong'); fx('shake', box.querySelector('.lksplitme'), { ms: 300, power: 5 }); SFA.toast('Not that code. Check each other\'s digit: first digit, then second.', 3000); ST.n++; keep(); sendSoon(); }
      };
      go.onclick = tryIt; inp.onkeydown = function (e) { if (e.key === 'Enter') tryIt(); };
    }
  }
  function right(first) {
    var b = V.b, K = KIND[kindOf(b.nl, Math.min(b.L, b.nl))], msg;
    ST.r++; if (first) ST.f++;
    xp(first ? 10 : 6);
    if (V.me >= 0 && !iAmIn(b)) { ST.p++; ST.dl = b.L; msg = '<b>' + K.g + ' CLICK! Your ' + esc(K.piece) + ' is in the lock.</b> Look up: your face is on it.'; fx('sfx', 'right'); fx('burst', root.querySelector('.lkart'), { count: 16, emoji: [K.g, '✨'], spread: 180, size: 22 }); }
    else if (V.me >= 0 && !iBanked(b) && b.L < b.nl) { ST.p++; ST.bl = b.L + 1; msg = '<b>🎒 Pocketed!</b> That piece goes straight into the next lock the moment this one opens.'; fx('sfx', 'coin'); }
    else if (V.me >= 0 && ST.x < TOPUP_MAX) { ST.x++; msg = '<b>⏱ +' + TOPUP + ' seconds on the clock</b> for everyone. Nice.'; fx('sfx', 'coin'); fx('float', root.querySelector('#lkT'), '+' + TOPUP + ' s', { color: '#5CE0B8', size: 20 }); }
    else if (V.me < 0) { ST.p++; ST.dl = b.L; msg = '<b>✓ Right!</b> Your piece goes in as soon as you are on the list.'; }
    else msg = '<b>✓ Right!</b> The clock is as full as you can make it. Keep going for XP, or help someone near you get a piece in.';
    keep(); send(); V.ssig = '';
    setTimeout(function () { if (root) { drawMe(); drawLock(); var sg = [V.b.state, V.b.L, T.pool().length, V.me >= 0, iAmIn(V.b), iBanked(V.b)].join('|'); if (sg !== V.qsig) { V.qsig = sg; drawQ(); } } }, 0);
    return msg;
  }
  function tried(Q, kind) { ST.n++; xp(2); keep(); sendSoon(); if (kind === 1) fx('sfx', 'wrong'); }
  function drawQ() {
    var box = root && root.querySelector('.lkq'); if (!box || !quiz) return;
    var b = V.b;
    if (b.state !== 1) { box.innerHTML = '<p class="crwq">' + (b.win ? '🚪 You are out. Enjoy the prizes!' : '⏱ Time is up: look up to see how it ends.') + '</p>'; return; }
    // a redraw in the middle of typing (the rush minute starts, a lock opens): what was typed stays
    var oi = box.querySelector('.crwrow input'), ov = oi ? oi.value : '', ofc = !!oi && document.activeElement === oi, oq = box._q;
    var in_ = iAmIn(b), K = KIND[kindOf(b.nl, Math.min(b.L, b.nl))];
    quiz.draw(box, { kick: in_ ? (iBanked(b) || b.L >= b.nl ? 'Answer to add time to the clock' : 'Answer to pocket a piece for the next lock') : 'Answer to add your ' + K.piece + ' to the lock', go: in_ ? '⏱ Answer' : K.g + ' Answer', after: function (bx) {
      var nx = el('button', { type: 'button', 'class': 'btn primary', text: 'Next question ▶' }); nx.onclick = function () { quiz.next(); drawQ(); }; bx.appendChild(nx);
    } });
    var ni = box.querySelector('.crwrow input'); box._q = quiz.state().cur; if (ni && ov && oq === box._q) { ni.value = ov; if (ofc) ni.focus(); }
  }
  var sendT = null;
  function send() {
    clearTimeout(sendT); if (!stu() || !V || !ST) return;
    A.record({ id: QID, k: 'open' }, 'e1;id:' + Math.round(V.id / 1000) + ';r:' + ST.r + ';f:' + ST.f + ';n:' + ST.n + ';p:' + ST.p + ';x:' + ST.x + ';dl:' + ST.dl + ';bl:' + ST.bl + ';sc:' + ST.sc, null);
  }
  function sendSoon() { clearTimeout(sendT); sendT = setTimeout(send, 2500); }

  /* =========================== the teacher console =========================== */
  function C() { return A.console_().lockin; }
  function ev(K, e) { K.ev.push(e); K.ev = K.ev.slice(-6); K.seq++; }
  function pickSalt() {
    var ids = A.rosterIn().map(function (r) { return r.sid; });
    for (var s = 1; s < 200; s++) { var seen = {}, ok = true; for (var i = 0; i < ids.length; i++) { var f = T.fpn(ids[i], s); if (seen[f]) { ok = false; break; } seen[f] = 1; } if (ok) return s; }
    return 1;
  }
  function addStudent(K, sid) { if (K.idx[sid] != null || K.order.length >= 60) return false; K.idx[sid] = K.order.length; K.order.push(sid); return true; }
  // who is really here: the students whose page has said hello to this game (everyone in the lesson for the first 20 s)
  function here(K) { var w = K.order.filter(function (sid) { return K.rows[sid]; }); return (Date.now() - K.id) / 1000 < 20 || !w.length ? K.order.slice() : w; }
  function needFor(K, L) {
    var N = Math.max(1, here(K).length), per = K.dur0 / K.nl, f = Math.max(0.42, Math.min(0.6, 0.42 + (per - 48) * 0.008)), k = kindOf(K.nl, L);
    var m = L === K.nl ? 0.8 / f : L === 1 ? 0.6 : k === 's' ? 0.8 : 1;
    return Math.max(1, Math.min(N, Math.round(N * f * m)));
  }
  function start(mins) {
    if (!T.pool().length) { SFA.toast('This lesson has no number or multiple-choice questions for Goat Lock-In.', 4500); return false; }
    var dur = Math.round((mins || 6) * 60), nl = dur >= 450 ? 7 : dur >= 330 ? 6 : 5, t0 = Math.round(Date.now() / 1000) * 1000;
    var K = A.console_().lockin = { id: t0, state: 1, dur: dur, dur0: dur, nl: nl, L: 1, need: 1, win: false, spare: 0, salt: pickSalt(), ep: Math.floor(Math.random() * 9000) + 1, order: [], idx: {}, rows: {}, pc: {}, xt: {}, tops: {}, done: {}, bank: {}, tot: {}, was: {},
      pairs: [], show: false, clue: 0, at: Date.now(), rust: 0, times: [], ev: [], seq: 0, page: 0 };
    T.active().forEach(function (sid) { addStudent(K, sid); });
    K.need = needFor(K, 1);
    A.pushLive(); A.consolePanel(); return true;
  }
  // a split-clue lock: pair the students who have made the fewest pieces with the ones who have made the most
  function deal(K) {
    K.pairs = []; K.show = false;
    if (kindOf(K.nl, K.L) !== 's') return;
    // only students who have really been answering in this game: a pair never waits on someone who is not playing
    var on = here(K).filter(function (sid) { var r = K.rows[sid]; return r && r.r + r.n > 0; });
    var w = T.shuffle(on.length >= 2 ? on : here(K), Math.random), N = w.length, P = N >= 20 ? 3 : N >= 12 ? 2 : N >= 2 ? 1 : 0;
    w.sort(function (a, b) { return (K.was[a] || 0) - (K.was[b] || 0) || (K.tot[a] || 0) - (K.tot[b] || 0); });
    var pool = w.slice(0, Math.max(P * 2, Math.min(N, P * 4)));   // not the same faces twice
    pool.sort(function (a, b) { return (K.tot[a] || 0) - (K.tot[b] || 0); });
    for (var i = 0; i < P; i++) { var a = pool[i], b = pool[pool.length - 1 - i]; if (!a || !b || a === b) break; var flip = Math.random() < 0.5; K.pairs.push({ a: flip ? b : a, b: flip ? a : b, code: 10 + Math.floor(Math.random() * 90), ok: false }); K.was[a] = 1; K.was[b] = 1; }
  }
  function put(K, sid) { if (K.done[sid] === K.L) return false; K.done[sid] = K.L; K.tot[sid] = (K.tot[sid] || 0) + 1; return true; }
  function doneN(K) { return K.order.filter(function (sid) { return K.done[sid] === K.L; }).length; }
  function advance(K) {
    K.times.push(Math.round((Date.now() - K.id) / 1000));
    ev(K, { k: 'o', a: K.L }); K.L++;
    if (K.L > K.nl) { K.win = true; K.spare = Math.max(0, Math.round(K.dur - (Date.now() - K.id) / 1000)); end(); return; }
    K.at = Date.now(); K.rust = 0;
    K.order.forEach(function (sid) { if (K.bank[sid] === K.L) { delete K.bank[sid]; put(K, sid); } });   // the pocketed pieces go straight in
    // ...but a lock never opens on pocketed pieces alone: it always waits for at least one more person
    K.need = Math.max(needFor(K, K.L), Math.min(Math.max(1, here(K).length), doneN(K) + 1)); deal(K);
  }
  function check(K) { var guard = 0; while (K.state === 1 && guard++ < 8 && doneN(K) >= K.need && K.pairs.every(function (p) { return p.ok; })) advance(K); }
  function parseRow(s) { var m = /;sc:(\d+)\.(\d+)/.exec(s); return { r: T.getN(s, 'r'), f: T.getN(s, 'f'), n: T.getN(s, 'n'), p: T.getN(s, 'p'), x: T.getN(s, 'x'), dl: T.getN(s, 'dl'), bl: T.getN(s, 'bl'), sl: m ? +m[1] : 0, sc: m ? +m[2] : 0 }; }
  function agg() {
    var K = C(); if (!K || !A.rosterIn().length) return;
    if (K.restoring) rebuild(K);
    var last = T.rows(QID, 'id:' + Math.round(K.id / 1000) + ';'), changed = false, inR = {}, fresh = !!K.restored;
    A.rosterIn().forEach(function (r) { inR[r.sid] = 1; });
    if (K.state === 1) T.active().concat(Object.keys(last)).forEach(function (sid) { if (inR[sid] && addStudent(K, sid)) changed = true; });
    Object.keys(last).forEach(function (sid) {
      if (K.idx[sid] == null) return;
      var row = parseRow(String(last[sid].answer)), old = K.rows[sid];
      if (!old || old.n !== row.n || old.r !== row.r || old.p !== row.p) changed = true;
      K.rows[sid] = row;
      if (K.state !== 1) return;
      if (fresh) { K.pc[sid] = row.p; K.xt[sid] = row.x; K.tops[sid] = row.x; }   // the console was reloaded: these pieces were counted before
      // new pieces, one at a time: this lock, then the pocket, then the clock
      for (var i = K.pc[sid] || 0; i < row.p; i++) {
        if (K.done[sid] !== K.L) put(K, sid);
        else if (K.bank[sid] !== K.L + 1 && K.L < K.nl) K.bank[sid] = K.L + 1;
        else topUp(K, sid);
      }
      K.pc[sid] = Math.max(K.pc[sid] || 0, row.p);
      // the student's own page says where its pieces went: this catches a piece sent while the console was reloading
      if (row.dl === K.L || row.bl === K.L) put(K, sid);
      for (var j = K.xt[sid] || 0; j < row.x; j++) topUp(K, sid);
      K.xt[sid] = Math.max(K.xt[sid] || 0, row.x);
      if (row.sl === K.L) K.pairs.forEach(function (p, pi) { if (!p.ok && (p.a === sid || p.b === sid) && row.sc === p.code) crack(K, pi); });
    });
    delete K.restored;
    if (K.state === 1) check(K);
    if (changed) tick(true);
  }
  function topUp(K, sid) { if ((K.tops[sid] || 0) >= TOPUP_MAX) return; K.tops[sid] = (K.tops[sid] || 0) + 1; K.dur = Math.min(9999, K.dur + TOPUP); ev(K, { k: 't', a: K.idx[sid] }); }
  function crack(K, pi) { var p = K.pairs[pi]; if (!p || p.ok) return; p.ok = true; put(K, p.a); put(K, p.b); ev(K, { k: 'c', a: pi }); }
  function clue() {
    var K = C(); if (!K || K.state !== 1) return;
    if (K.pairs.some(function (p) { return !p.ok; })) { if (K.show) K.pairs.forEach(function (p, pi) { crack(K, pi); }); else K.show = true; }
    K.clue = Math.min(9999, K.clue + 1); ev(K, { k: 'u', a: 0 }); check(K); (A.pushNow || A.pushLive)(); A.consolePanel();
  }
  function end() {
    var K = C(); if (!K) return;
    if (K.state === 1 && K.order.length && A.trophy) {   // 🏆 the trophy shelf (trophies.html): ic, title and sub are ready to show as they are
      var makers = K.order.filter(function (sid) { return K.tot[sid] > 0 || (K.rows[sid] && K.rows[sid].p > 0); }).length, op = Math.min(K.nl, K.L - 1);
      A.trophy({ k: 'lockin', id: K.id, win: !!K.win, ic: K.win ? '🔓' : '🔐', title: K.win ? 'Goat Lock-In: the class escaped the vault' : 'Goat Lock-In: ' + op + ' of ' + K.nl + ' locks opened',
        sub: makers + ' of ' + K.order.length + ' students put a piece in a lock' + (K.win ? ' · ' + T.mmss(K.spare) + ' to spare' : ''), locks: op, of: K.nl, n: K.order.length, makers: makers, spare: K.spare });
    }
    K.state = 2; K.endedAt = Date.now(); (A.pushNow || A.pushLive)(); A.consolePanel();
  }
  function tick(force) {
    var K = C(); if (!K) return;
    if (K.restoring) { if (A.rosterIn().length) agg(); return; }
    var now = Date.now(), e = (now - K.id) / 1000, push = !!force;
    if (K.state === 1) {
      if (e >= K.dur) { end(); return; }
      // a lock that has been shut for a long time: split-clue pairs are shown the code, then let through; then it rusts
      var open = (now - K.at) / 1000, wait = K.pairs.some(function (p) { return !p.ok; });
      if (wait && !K.show && open >= PAIR_SHOW) { K.show = true; push = true; }
      if (wait && open >= PAIR_PASS) { K.pairs.forEach(function (p, pi) { crack(K, pi); }); push = true; }
      var rustAt = K.L === K.nl ? RUST_LAST : RUST_AT;
      if (open >= rustAt && K.need > 1 && doneN(K) < K.need) { var steps = Math.floor((open - rustAt) / RUST_EVERY) + 1; if (steps > K.rust) { K.rust = steps; K.need--; if (steps === 1) ev(K, { k: 'r', a: 0 }); push = true; } }
      var L0 = K.L; check(K); if (K.L !== L0 || K.state !== 1) push = true;
      if (K.state !== 1) return;
    }
    var pg = Math.floor(e / 4) % Math.max(1, Math.ceil(K.order.length / 12)); if (pg !== K.page) { K.page = pg; push = true; }
    if (push || now - (K.lastPush || 0) >= 4000) { K.lastPush = now; (A.pushNow || A.pushLive)(); if (K.state === 1) A.consolePanel(); }
    if (root && V && V.watch) apply(watchState());
  }
  function counts(out) {
    var K = C(); if (!K) return;
    if (K.restoring) { Object.keys(K.raw.counts).forEach(function (k) { out[k] = K.raw.counts[k]; }); return; }
    var pm = (K.show ? 8 : 0); K.pairs.forEach(function (p, i) { if (p.ok) pm |= 1 << i; });
    out.zvltid = A.encRun(K.id); out.zvltst = A.encRun(K.id + (A.console_().skew || 0));
    out.zvlts = [K.state, Math.min(9999, K.dur), K.nl, K.L, K.need, K.order.length, K.salt, K.ep, K.win ? 1 : 0, K.clue, pm, Math.min(9999, K.spare)];
    chunk(out, 'zvltf', K.order.map(function (sid) { return T.fpn(sid, K.salt); }), 5);
    out.zvltd = T.encBits(K.order.map(function (sid) { return K.done[sid] === K.L; }));
    out.zvltb = T.encBits(K.order.map(function (sid) { return K.bank[sid] === K.L + 1; }));
    if (K.pairs.length) { out.zvltq = []; out.zvltc = []; K.pairs.forEach(function (p) { out.zvltq.push((K.idx[p.a] == null ? -1 : K.idx[p.a]) + 1, (K.idx[p.b] == null ? -1 : K.idx[p.b]) + 1); out.zvltc.push(p.code); }); }
  }
  function crewList(K) { var L = T.looks(); return K.order.map(function (sid) { return { fp: T.sh3(sid), n: T.nameOf(sid), look: T.lookOf(L, sid) }; }); }
  function spot(all) {
    var K = C(); if (K.restoring) return K.raw.spot;
    var E = '#E:' + K.seq + '|' + K.ev.map(function (e) { return e.k + '~' + e.a; }).join(',');
    return { q: 'zvlt', text: (T.crewPage(crewList(K), all ? 0 : K.page || 0, all ? 999 : 12) + E).slice(0, all ? 99999 : 600) };
  }
  // the console was reloaded mid-game: keep publishing what was live until the roster is in, then pick the locks back up
  function restore(Lv) {
    var b = gameOf(Lv); if (!b) return false;
    if (b.state === 2 || Date.now() - b.id > b.dur * 1000 + 60000) { A.console_().lockin = null; return false; }
    var raw = {}; Object.keys(Lv.counts).forEach(function (k) { if (/^zvlt/.test(k)) raw[k] = Lv.counts[k]; });
    A.console_().lockin = { id: b.id, state: 1, dur: b.dur, dur0: b.dur, nl: b.nl, L: b.L, need: b.need, win: false, spare: 0, salt: b.salt, ep: b.ep % 9000 + 1, restoring: b, raw: { counts: raw, spot: Lv.spot && Lv.spot.q === 'zvlt' ? Lv.spot : null },
      order: [], idx: {}, rows: {}, pc: {}, xt: {}, tops: {}, done: {}, bank: {}, tot: {}, was: {}, pairs: [], show: b.show, clue: b.clue, at: Date.now(), rust: 0, times: [], ev: [], seq: b.seq, page: 0 };
    return true;
  }
  function rebuild(K) {
    var b = K.restoring, by = {}; A.rosterIn().forEach(function (r) { by[T.fpn(r.sid, b.salt)] = r.sid; });
    for (var i = 0; i < b.n; i++) { var sid = by[b.fps[i]] || ('?' + i); K.idx[sid] = i; K.order.push(sid); if (T.bit(b.done, i)) { K.done[sid] = b.L; K.tot[sid] = 1; } if (T.bit(b.bank, i)) K.bank[sid] = b.L + 1; }
    K.pairs = b.pairs.map(function (p) { return { a: K.order[p.a], b: K.order[p.b], code: p.code, ok: p.ok }; });
    delete K.restoring; delete K.raw; K.restored = true;
  }
  function watchState() { var out = {}; counts(out); var b = gameOf({ lesson: A.LID, counts: out, spot: spot(true) }); b.start = C().id; return b; }
  function watch() {
    if (C().restoring) return;
    var b = watchState(); open(b); V.watch = true; apply(b);
    var x = el('button', { type: 'button', 'class': 'btn primary crwwatchx', text: '✕ Back to the console' }); x.onclick = function () { close(); }; document.body.appendChild(x);
  }
  function section(p) {
    var K = C(), sec = H('div', 'sect'), now = Date.now();
    sec.appendChild(H('h3', '', '🔐 Goat Lock-In'));
    if (K.restoring) { sec.appendChild(H('p', 'muted', 'Picking the locks back up…')); p.appendChild(sec); return; }
    var left = Math.max(0, Math.round(K.dur - (now - K.id) / 1000)), L = Math.min(K.L, K.nl), kd = KIND[kindOf(K.nl, L)], dn = doneN(K), wait = K.pairs.filter(function (q) { return !q.ok; }).length;
    sec.appendChild(H('p', '', K.state === 1 ? '<b>' + T.mmss(left) + '</b> left · 🔒 lock <b>' + L + '</b> of ' + K.nl + ' (' + esc(kd.n) + ') · <b>' + dn + '</b> of ' + K.need + ' pieces in' + (wait ? ' · waiting for ' + wait + ' split code' + (wait === 1 ? '' : 's') : '')
      : K.win ? '<b>🔓 They escaped</b> with ' + T.mmss(K.spare) + ' to spare.' : '<b>Time.</b> ' + (K.L - 1) + ' of ' + K.nl + ' locks opened.'));
    var r = H('div', 'row');
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: '👁 Show the vault', title: 'The vault on this screen', onclick: function () { watch(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '💡 Give a clue', title: wait ? (K.show ? 'Lets the split-code pairs through' : 'Shows each split-code pair the whole code, and sends everyone still working a hint') : 'Sends everyone who has not added a piece to this lock a hint for their question', onclick: function () { clue(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '⏰ +1 minute', onclick: function () { K.dur = Math.min(9999, K.dur + 60); A.pushLive(); A.consolePanel(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: 'End it now', onclick: function () { end(); } }));
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: 'Back to the lesson', onclick: function () { A.console_().lockin = null; if (root) close(); A.pushLive(); A.consolePanel(); } }));
    sec.appendChild(r);
    var dd = T.fold('g-lockin', '📋 Who is doing what · only you see this', true);
    if (K.state === 1) {
      var g = { in_: [], work: [], stuck: [], idle: [] };
      K.order.forEach(function (sid) { var w = K.rows[sid], nm = esc(T.nameOf(sid) || '?'); if (K.done[sid] === K.L) g.in_.push(nm + (K.bank[sid] === K.L + 1 ? ' 🎒' : '')); else if (!w || !(w.r + w.n)) g.idle.push(nm); else if (w.n > w.r * 2 + 1) g.stuck.push(nm); else g.work.push(nm); });
      dd.appendChild(H('p', 'muted', '<b>✅ Piece in this lock (' + g.in_.length + '):</b> ' + (g.in_.join(', ') || 'nobody yet') + '<br><b>✏️ Working on it (' + g.work.length + '):</b> ' + (g.work.join(', ') || 'nobody') + '<br><b>🤔 Finding it hard (' + g.stuck.length + '):</b> ' + (g.stuck.join(', ') || 'nobody') + '<br><b>💤 Not started (' + g.idle.length + '):</b> ' + (g.idle.join(', ') || 'nobody')));
      K.pairs.forEach(function (q) { dd.appendChild(H('p', 'muted', '🧩 <b>' + esc(T.nameOf(q.a) || '?') + '</b> (first digit ' + Math.floor(q.code / 10) + ') and <b>' + esc(T.nameOf(q.b) || '?') + '</b> (second digit ' + q.code % 10 + '): ' + (q.ok ? 'cracked ✓' : K.show ? 'both can see the code now' : 'looking for each other'))); });
      dd.appendChild(H('p', 'muted', '🎒 = has a piece ready for the next lock. A lock needs different people, so a quiet word with someone who has not started is worth more than anything the fast ones can do. Stuck for ' + RUST_AT + ' s, a lock starts to need fewer pieces by itself.'));
    } else {
      var rowsL = K.order.map(function (sid) { var w = K.rows[sid] || { r: 0, f: 0, p: 0 }; return { n: T.nameOf(sid) || '?', r: w.r, f: w.f, p: Math.max(K.tot[sid] || 0, Math.min(w.p || 0, K.nl)) }; }).sort(function (a, b) { return a.n.localeCompare(b.n); });
      dd.appendChild(H('p', 'muted', '<b>Locks they put a piece in · right answers (right first time):</b> ' + rowsL.map(function (x) { return esc(x.n) + ' ' + x.p + ' · ' + x.r + ' (' + x.f + ')'; }).join(' — ')));
    }
    sec.appendChild(dd);
    p.appendChild(sec);
  }
  (A.every || function (f, ms) { setInterval(f, ms); })(function () { if (A.MODE === 'teach' && A.console_() && C()) tick(); }, 1000);

  (function css() {
    if (document.getElementById('sfaLkCss')) return;
    var c = document.createElement('style'); c.id = 'sfaLkCss';
    c.textContent = [
      '.crw.lk{background:#0b0e24}',
      '.crwban.lkbig{top:17vh;font-size:clamp(18px,2.5vw,48px);padding:.4em 1.1em;border-width:4px}',
      /* the vault wall: steel plates and rivets */
      '.lkscene{display:flex;flex-direction:column;gap:1.2vh;padding:1.4vh 1.4vw;background:radial-gradient(circle at 12px 12px,rgba(255,255,255,.16) 0 3px,transparent 4px) 0 0/140px 110px,linear-gradient(90deg,rgba(0,0,0,.28) 0 2px,transparent 2px) 0 0/140px 100%,linear-gradient(rgba(0,0,0,.28) 0 2px,transparent 2px) 0 0/100% 110px,linear-gradient(160deg,#39406b,#22264a 55%,#161a38)}',
      '.lkscene:after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 120px rgba(0,0,0,.65);transition:box-shadow .5s}',
      '.lkhot .lkscene:after{box-shadow:inset 0 0 120px rgba(255,60,40,.55);animation:lkalarm 1s ease-in-out infinite alternate}',
      '@keyframes lkalarm{from{opacity:.5}to{opacity:1}}',
      '.lkchain{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;flex:none}',
      '.lkmed{position:relative;flex:none;width:clamp(30px,4.4vw,84px);height:clamp(30px,4.4vw,84px);border-radius:50%;display:flex;align-items:center;justify-content:center;background:#141832;border:3px solid #5b6392;box-shadow:0 4px 0 rgba(0,0,0,.4)}',
      '.lkmed em{font-style:normal;font-size:clamp(15px,2.2vw,42px);line-height:1;filter:grayscale(.7) brightness(.8)}',
      '.lkmed b{position:absolute;right:-4px;bottom:-4px;min-width:1.5em;height:1.5em;border-radius:99px;background:#5b6392;color:#fff;font-size:clamp(9px,.9vw,17px);display:flex;align-items:center;justify-content:center}',
      '.lkmed.open{background:#0d3b2c;border-color:#5CE0B8}.lkmed.open em{filter:none}.lkmed.open b{background:#5CE0B8;color:#06231a}',
      '.lkmed.cur{border-color:#FFE14D;background:#3b2c05;animation:lkpulse 1.2s ease-in-out infinite}.lkmed.cur em{filter:none}.lkmed.cur b{background:#FFE14D;color:#231a00}',
      '.lkmed.door{border-style:dashed}.lkmed.door.open{border-style:solid;animation:lkpulse .8s ease-in-out infinite}',
      '@keyframes lkpulse{0%,100%{box-shadow:0 4px 0 rgba(0,0,0,.4),0 0 0 0 rgba(255,225,77,.5)}50%{box-shadow:0 4px 0 rgba(0,0,0,.4),0 0 0 8px rgba(255,225,77,0)}}',
      '.lklink{flex:0 1 clamp(10px,3vw,60px);height:clamp(6px,.8vw,14px);border-radius:99px;background:repeating-linear-gradient(90deg,#5b6392 0 10px,#2b3054 10px 16px);margin:0 -2px}.lklink.on{background:repeating-linear-gradient(90deg,#5CE0B8 0 10px,#0d3b2c 10px 16px)}',
      '.lkmain{position:relative;z-index:2;flex:1;min-height:0;display:flex;align-items:center;gap:2.4vw}',
      '.lkartbox{position:relative;flex:0 0 36%;max-width:54vh;align-self:center;padding:0 .6vw}',
      '.lkart{filter:drop-shadow(0 10px 0 rgba(0,0,0,.4))}.lkart svg{display:block;width:100%;height:auto}',
      '.lkart.in{animation:lkin .6s cubic-bezier(.2,1.5,.4,1) both}',
      '@keyframes lkin{from{transform:scale(.3) rotate(-40deg);opacity:0}to{transform:none;opacity:1}}',
      '.lkring{transition:stroke-dashoffset .8s cubic-bezier(.3,1.4,.5,1)}',
      '.lkspin{transform-box:fill-box;transform-origin:center}',
      '.lkart.busy .lkspin{animation:lkrot 9s linear infinite}.lkart.busy .lkspin.rev{animation-direction:reverse;animation-duration:6s}.lkart.busy .lkspin.slow{animation-duration:16s}',
      '.lkart.kd .lkspin,.lkart.ks .lkspin{transform-box:view-box;transform-origin:100px 100px}.lkart.ks .lkspin{transform-origin:100px 102px}',
      '.lkart.kw .lkspin{transform-box:view-box;transform-origin:100px 100px}',
      '@keyframes lkrot{to{transform:rotate(360deg)}}',
      '.lkart.busy .lkshk{animation:lkjig 1.6s ease-in-out infinite}@keyframes lkjig{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}',
      '.lkfloor{position:relative;z-index:2;flex:none;display:flex;align-items:flex-end;gap:1vw;margin:0 -1.4vw -1.4vh;padding:1vh 1.6vw 1.2vh;background:linear-gradient(rgba(10,10,28,0),rgba(10,10,28,.7) 45%)}',
      '.lkprize{flex:none;font-size:clamp(18px,3.4vw,68px);line-height:1;filter:drop-shadow(0 4px 0 rgba(0,0,0,.4))}.lkprize:nth-child(2){transform:rotate(-12deg)}.lkprize:nth-child(3){transform:rotate(9deg) translateY(4px)}.lkprize:nth-child(5){transform:rotate(8deg)}',
      '.lkgoat{flex:none;display:flex;align-items:flex-end;gap:.6vw;pointer-events:none}',
      '.lkgoat span{font-size:clamp(34px,6.4vw,124px);line-height:1;transform-origin:50% 100%;animation:lkpeek 4s ease-in-out infinite;filter:drop-shadow(0 4px 0 rgba(0,0,0,.4))}',
      '.lkgoat b{max-width:min(34vw,420px);background:#fff;color:#141428;padding:.35em .8em;border-radius:1em 1em .15em 1em;font-size:clamp(11px,1.45vw,28px);font-weight:800;line-height:1.15;opacity:0;margin-bottom:3vh;text-align:center}',
      '.lkgoat b.say{animation:lksay 6s ease both}',
      '@keyframes lksay{0%{opacity:0;transform:scale(.6)}6%,85%{opacity:1;transform:none}100%{opacity:0}}',
      '@keyframes lkpeek{0%,100%{transform:rotate(-6deg) translateY(0)}50%{transform:rotate(6deg) translateY(-6px)}}',
      '.lkpanel{flex:1;min-width:0;display:flex;flex-direction:column;gap:1vh;padding:1.4vh 1.4vw;border-radius:18px;background:rgba(10,10,28,.72);border:3px solid rgba(255,255,255,.14)}',
      '.lkname{margin:0;font:400 clamp(17px,3.2vw,60px) "Luckiest Guy",system-ui;color:#FFE14D;line-height:1.05;text-shadow:0 .06em 0 rgba(0,0,0,.5)}',
      '.lkname span{display:inline-block;font:800 .38em "Bricolage Grotesque",system-ui;letter-spacing:.08em;text-transform:uppercase;color:#06231a;background:#5CE0B8;padding:.25em .7em;border-radius:99px;vertical-align:middle;margin-right:.4em;text-shadow:none}',
      '.lkneed{margin:0;font-size:clamp(12px,1.7vw,32px);font-weight:700;line-height:1.2}.lkneed b{color:#FFE14D}.lkneed:empty{display:none}',
      '.lkslots{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 8px;padding-top:.6vh}',
      '.lkslot{display:flex;flex-direction:column;align-items:center}',
      '.lkhole{width:100%;border-radius:50%;border:3px dashed rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.25)}.lkhole u{text-decoration:none;font-size:42%;opacity:.35;filter:grayscale(1);font-weight:800}',
      '.lkslot .crwname{font-size:clamp(9px,1.05vw,19px);margin-top:2px}',
      '.lkpiece{position:relative;width:100%;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff7c9,#FFC94A 60%,#c98a12);border:3px solid #141428;display:flex;align-items:flex-end;justify-content:center;overflow:visible;box-shadow:0 4px 0 rgba(0,0,0,.4)}',
      '.lkpiece svg{display:block;max-width:86%;height:auto;margin-bottom:4%}',
      '.lkpiece u{position:absolute;right:-8%;bottom:-6%;text-decoration:none;font-size:34%;line-height:1;filter:drop-shadow(0 2px 0 rgba(0,0,0,.5))}',
      '.lkpiece u.lkdig{font:400 38% "Luckiest Guy",system-ui;color:#141428;background:#fff;border:2px solid #141428;border-radius:8px;padding:.05em .28em;filter:none}',
      '.lkslot.pop .lkpiece{animation:lkclick .6s cubic-bezier(.2,1.7,.4,1) both}.lkslot.you .lkpiece{border-color:#fff;box-shadow:0 0 0 3px #FFE14D,0 4px 0 rgba(0,0,0,.4)}.lkslot.you .crwname{color:#FFE14D}',
      '@keyframes lkclick{0%{transform:translateY(-60px) scale(.3) rotate(-90deg);opacity:0}70%{transform:translateY(4px) scale(1.12);opacity:1}100%{transform:none}}',
      '.lkpairs{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 14px}.lkpairs:empty{display:none}',
      '.lkpair{display:flex;align-items:center;gap:1vw;padding:.6vw 1.6vw;border-radius:99px;background:rgba(255,122,192,.16);border:3px dashed #FF7AC0}',
      '.lkpair.ok{background:rgba(92,224,184,.18);border:2px solid #5CE0B8}',
      '.lkpair em{font-style:normal;font-weight:800;font-size:clamp(14px,2.6vw,52px);text-align:center;line-height:1.05;white-space:nowrap}.lkpair em i{font-style:normal;color:#FF7AC0}.lkpair em small{display:block;font-size:.4em;font-weight:800;color:#FFE14D}',
      '.lkpair:not(.ok) .lkhalf:first-child{animation:lkseekL 1.4s ease-in-out infinite}.lkpair:not(.ok) .lkhalf:last-child{animation:lkseekR 1.4s ease-in-out infinite}',
      '@keyframes lkseekL{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}@keyframes lkseekR{0%,100%{transform:translateX(0)}50%{transform:translateX(-5px)}}',
      '.lkhalf{display:flex;flex-direction:column;align-items:center}.lkhalf .crwname{font-size:clamp(10px,1.05vw,19px)}',
      '.lkstory{flex:1;align-self:center;margin:0;min-height:2.5em;display:flex;align-items:center;justify-content:center;text-align:center;font-size:clamp(12px,1.65vw,32px);font-weight:700;font-style:italic;line-height:1.2;color:#cfe9ff;text-shadow:0 2px 4px rgba(0,0,0,.7)}',
      '.lkstory.in{animation:fxRise .5s both,lkglowtxt 3s ease-out both}@keyframes lkglowtxt{from{color:#FFE14D}to{color:#cfe9ff}}',
      /* a student's own screen: the scene is small */
      '.crw.lk:not(.screen) .lkscene{padding:8px 10px;gap:6px}',
      '.crw.lk:not(.screen) .lkartbox{flex:0 0 26%;max-width:150px}.crw.lk:not(.screen) .lkpanel{padding:8px 10px;gap:4px;border-width:2px;border-radius:14px}',
      '.crw.lk:not(.screen) .lkname{font-size:clamp(16px,2.2vw,26px)}.crw.lk:not(.screen) .lkneed{font-size:13px}.crw.lk:not(.screen) .lkstory{font-size:12.5px}.crw.lk:not(.screen) .lkslot .crwname{font-size:9.5px}',
      '.crw.lk:not(.screen) .lkgoat span{font-size:34px}.crw.lk:not(.screen) .lkgoat b{font-size:11px;max-width:150px;margin-bottom:14px}.crw.lk:not(.screen) .lkpair{gap:6px;padding:3px 10px;border-width:2px}.crw.lk:not(.screen) .lkpair em{font-size:15px}.crw.lk:not(.screen) .lkprize{display:none}.crw.lk:not(.screen) .lkfloor{margin:0 -10px -8px;padding:2px 10px 4px}',
      '.crw.lk:not(.screen) .lkmed{width:28px;height:28px;border-width:2px}.crw.lk:not(.screen) .lkmed em{font-size:14px}.crw.lk:not(.screen) .lkmed b{font-size:9px}.crw.lk:not(.screen) .lklink{height:5px;flex-basis:16px}',
      /* my card */
      '.lkmine{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:14px;background:rgba(255,201,74,.12);border:2px dashed #FFC94A;margin-bottom:8px}',
      '.lkmine.in{background:rgba(92,224,184,.14);border:2px solid #5CE0B8}.lkmine span{font-size:30px;line-height:1}.lkmine p{margin:0;font-size:15px;line-height:1.3}.lkmine b{color:#FFE14D}',
      '.lkbar{height:12px;border-radius:9px;background:#14122a;border:2px solid #6c6690;overflow:hidden;margin:0 0 5px}.lkbar u{display:block;height:100%;background:linear-gradient(90deg,#5CE0B8,#FFE14D);transition:width .6s}',
      '.lkstat{margin:0 0 4px;font-size:15px;line-height:1.35}.lkstat b{color:#FFE14D}.lkstat.small{font-size:13px;opacity:.92}.lkstat.small:empty{display:none}',
      '.lksplitme{margin-top:8px;padding:10px 12px;border-radius:14px;background:rgba(255,122,192,.14);border:2px dashed #FF7AC0}.lksplitme.ok{background:rgba(92,224,184,.14);border:2px solid #5CE0B8}',
      '.lkcode{display:flex;gap:8px;margin:2px 0 8px}.lkcode b{width:48px;height:58px;border-radius:10px;background:#fff;color:#141428;font:400 38px/58px "Luckiest Guy",system-ui;text-align:center;border:3px solid #141428;box-shadow:0 4px 0 rgba(0,0,0,.4)}.lkcode b.q{background:#2b2f55;color:#FF7AC0;border-style:dashed;border-color:#FF7AC0}',
      '.lkcin input{max-width:130px;text-align:center;letter-spacing:.3em}.lkcin input::placeholder{letter-spacing:normal}',
      /* the ending */
      '.lkover .lkchain,.lkover .lkmain,.lkover .lkfloor{display:none}',
      '.lkend{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;align-items:center;text-align:center;padding:3vh 16px 0;background:rgba(8,8,22,.82);overflow:hidden}',
      '.lkend.win{background:radial-gradient(ellipse at 50% 62%,rgba(255,225,120,.5),rgba(8,8,22,.86) 62%)}',
      '.lkend h1{margin:0;font:400 clamp(30px,7vw,110px) "Luckiest Guy",system-ui;color:#FFE14D;text-shadow:0 .06em 0 rgba(0,0,0,.5);animation:crwbin2 .6s cubic-bezier(.2,1.6,.4,1) both}',
      '.lkend p{margin:6px 0 0;font-size:clamp(13px,2vw,34px);font-weight:700;max-width:1200px;text-shadow:0 2px 6px rgba(0,0,0,.7)}.lkend p b{color:#FFE14D}',
      '.lkdoor{position:relative;flex:1;min-height:40px;width:min(30vw,300px);margin-top:1vh;border-radius:999px 999px 0 0;background:linear-gradient(#141428,#141428) padding-box;border:6px solid #5b6392;border-bottom:0;display:flex;align-items:flex-end;justify-content:center;overflow:hidden}',
      '.lkend.win .lkdoor{border-color:#FFE14D}.lkglow{position:absolute;inset:0;background:linear-gradient(#fff7c9,#FFC94A);opacity:0}.lkend.win .lkglow{opacity:1;animation:lkshine 2s ease-in-out infinite alternate}@keyframes lkshine{from{opacity:.75}to{opacity:1}}',
      '.lkzz{position:relative;font-size:clamp(24px,5vw,80px);line-height:1.2}',
      '.lkrun{position:relative;display:flex;flex-wrap:wrap-reverse;justify-content:center;align-items:flex-end;gap:2px 6px;padding:0 2% 2vh;margin-top:-3vh}',
      '.lkhop{display:flex;flex-direction:column;align-items:center;animation:lkhop 1.5s ease-in-out infinite}.lkhop svg{width:100%;height:auto}.lkhop i{font-style:normal;font-size:.5em;line-height:1;margin-bottom:-.15em}.lkhop .crwname{font-size:clamp(9px,1vw,18px)}',
      '.lkend:not(.win) .lkhop{animation-name:lkshuf}',
      '@keyframes lkhop{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-16%) rotate(3deg)}}@keyframes lkshuf{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}',
      '@media (max-width:820px){.crw.lk:not(.screen) .lkscene{height:auto;min-height:0}.crw.lk:not(.screen) .lkartbox{flex:0 0 84px}.crw.lk:not(.screen) .lkgoat b{display:none}.crw.lk:not(.screen) .lkend{position:relative;padding:10px 10px 0}.crw.lk:not(.screen) .lkdoor{flex:none;height:70px}.crw.lk:not(.screen) .lkrun{margin-top:0}}',
      '@media (prefers-reduced-motion:reduce){.lkart.busy .lkspin,.lkart.busy .lkshk,.lkmed.cur,.lkgoat span,.lkhop,.lkpair .lkhalf,.lkslot.pop .lkpiece,.lkart.in,.lkhot .lkscene:after{animation:none!important}}'
    ].join('\n');
    document.head.appendChild(c);
  })();

  window.SFA_LOCKIN = { sync: sync, agg: agg, section: section, start: start, counts: counts, spot: function () { return spot(); }, restore: restore, gameOf: gameOf };
})();
