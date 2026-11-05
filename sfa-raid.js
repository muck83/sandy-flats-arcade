/* 👹 Boss Raid: the whole class against one giant boss. Loaded by sfa-lesson.js when the teacher starts one.

   Two modes:
   Both start with five integer warm-ups (−4 + 9, (−3) × (−5)…) that only scratch the boss (2 damage each); then the real questions.
   - Review (at the start of a lesson): spiral review questions from the five lessons before this one.
   - Exit ticket (at the end): this lesson's own questions. Every student's first try at each question is recorded, so the
     console shows who got what and which questions the class missed, like an exit ticket.

   Every right answer hits the boss (10, half for a second try, double for a streak of three, more for ★ go-further questions).
   Every 80 seconds or so the boss charges an attack: one multiple-choice question on every screen for 20 seconds. If 60% of
   the answers are right, the class blocks it and everyone who got it right counter-attacks; if not, the boss heals.
   At half health the boss is enraged, at a fifth it makes its last stand. Bring it to zero before the time runs out.

   To make it a game and not just a quiz:
   - Heroes: each student picks Fire Mage, Archer, Knight or Bard. Every right answer charges a special (4 to fill); press it
     for a big move: a 60-damage fireball, an arrow storm (then 3 sure critical hits), a shield that takes the class's next
     failed block, or a battle song (+5 on everyone's hits for 15 s).
   - Combo: when many students hit within a few seconds the class combo goes to x2 or x3, multiplying everyone's damage.
   - Loot: critical hits (and the odd normal one) drop a loot card: full special charge, double damage, sure crits, a bomb.
   - Targets: every half minute or so the boss targets two or three named students. They get 15 seconds for one question:
     right is a dodge (30 damage back), wrong or too slow and they're stunned for 6 seconds.

   Sync through the Sheet, like the Big Board: the console adds up everyone's damage from their running rows (q "zraidx1":
   ids ending x1 are go-further extras, so this never counts as a lesson answer) and publishes the boss in the live counts
   (zrs: state, mode, boss, length, max HP, HP, won, students, healed, combo, battle song until, shields; zra: the attack;
   zrt: the targets) and the spotlight (spot.q "zraid": "T:" the top five, "L:" the latest hits and specials, "G:" who is
   targeted, for the damage numbers and banners on every screen). */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API, SFA = window.SFA;
  if (!A || !SFA) return;
  var H = A.H, el = A.el, esc = SFA.esc;
  var QID = 'zraidx1', ATK_WIN = 20, ATK_GRACE = 6, ATK_SHOW = 8, ATK_FIRST = 45, ATK_EVERY = 80, BLOCK = 0.6, PER = 300, HEAL = 0.06, COUNTER = 25, EASY_N = 5, EASY_D = 2;
  var CMUL = [1, 1, 1.5, 2];   // the class combo: level 2 is x1.5, level 3 is x2
  var CHARGE = 4, DODGE = 30, STUN_MS = 6000, TG_WIN = 15, SONG = 15;
  var AIM_MS = 1700, EMO = ['🔥', '👏', '😱', '💪', '🎉'], CHEER_MS = 10000;   // the weak spot's life; the cheers; one cheer every 10 s
  var HEROES = [
    { id: 'mage', name: 'Fire Mage', e: '🔥', sp: 'FIREBALL', d: 60, col: '#FF7A2E', txt: 'A giant fireball: 60 damage.' },
    { id: 'archer', name: 'Archer', e: '🏹', sp: 'ARROW STORM', d: 30, col: '#7CF2A2', txt: '30 damage, then your next 3 hits are critical hits.' },
    { id: 'knight', name: 'Knight', e: '🛡️', sp: 'SHIELD WALL', d: 20, col: '#9CC8FF', txt: '20 damage, and a shield for the class: it takes the next boss attack you don\'t block.' },
    { id: 'bard', name: 'Bard', e: '🎸', sp: 'BATTLE SONG', d: 20, col: '#FF8FD1', txt: '20 damage, and for 15 seconds every hit by anyone does +5.' }
  ];
  var LOOT = [
    { k: 'charge', e: '⚡', name: 'Full charge', txt: 'Your special is ready!' },
    { k: 'dbl', e: '💥', name: 'Double damage', txt: 'Your next 3 hits do double damage.' },
    { k: 'crit', e: '🎯', name: 'Sure crits', txt: 'Your next 2 hits are critical hits.' },
    { k: 'bomb', e: '💣', name: 'Loot bomb', txt: '40 damage, right now!' }
  ];
  // 🎁 spell boxes: a random spell, its damage scaled by how well the student stops the needle
  var SPELLS = [
    { e: '⚡', name: 'CHAIN LIGHTNING', lo: 20, hi: 35, w: 22 },
    { e: '☄️', name: 'METEOR', lo: 35, hi: 55, w: 14 },
    { e: '❄️', name: 'BLIZZARD', lo: 15, hi: 30, w: 22 },
    { e: '🌪️', name: 'TORNADO', lo: 25, hi: 40, w: 20 },
    { e: '🐸', name: 'FROG CURSE', lo: 1, hi: 1, w: 8, dud: 'The spell backfired: you turned into a frog. Ribbit. 1 damage.' },
    { e: '🎲', name: 'CHAOS ORB', lo: 0, hi: 90, w: 14 }
  ];
  var BOX_CHANCE = 0.15;
  var BOSSES = [
    { id: 'golem', name: 'Glitch Golem', e: '🤖', atk: 'BIT CRUSHER', col: ['#53E0FF', '#5B4BD6', '#1d2a6b'] },
    { id: 'hydra', name: 'The Nonlinear Hydra', e: '🐉', atk: 'TRIPLE BITE', col: ['#4FD97A', '#9B4BE0', '#16402a'] },
    { id: 'slime', name: 'Mega Slime', e: '🫧', atk: 'GOO WAVE', col: ['#FF7AC0', '#38D9C5', '#5a1d44'] },
    { id: 'kraken', name: 'Void Kraken', e: '🦑', atk: 'INK STORM', col: ['#9C7BFF', '#FF5B8A', '#2a1a5c'] }
  ];
  var MODES = ['Review', 'Exit ticket'];

  function rng(seed) { var s = (seed >>> 0) || 1; return function () { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return ((s >>> 8) & 0xffff) / 65536; }; }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function sh3(sid) { var h = 5381, t = String(sid); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return (h % 46656).toString(36); }
  function sNow() { return Date.now() + (A.srvSkew() || 0); }
  function clean(n) { return String(n || '').replace(/[~,#|]/g, '').slice(0, 10); }

  /* ---------------- the boss in the live state ---------------- */
  function raidOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zrs) || !Array.isArray(c.zrid)) return null;
    var z = c.zrs, id = A.decRun(c.zrid), start = A.MODE === 'screen' ? id : A.decRun(c.zrst) || id, a = Array.isArray(c.zra) ? c.zra : [];
    var sp = Lv.spot && Lv.spot.q === 'zraid' ? String(Lv.spot.text || '') : '', top = [], ev = [], seq = 0, tfp = [], tnm = [], g = Array.isArray(c.zrt) ? c.zrt : [];
    sp.split('#').forEach(function (part) {
      var k2 = part.slice(0, 2), v = part.slice(2);
      if (k2 === 'T:' && v) top = v.split(',').map(function (x) { var p = x.split('~'); return { n: p[0], d: +p[1] || 0, s: +p[2] || 0, lv: +p[3] || 0 }; });
      if (k2 === 'L:') { var q = v.split('|'); seq = +q[0] || 0; ev = (q[1] ? q[1].split(',') : []).map(function (x) { var p = x.split('~'); return { n: p[0], d: +p[1] || 0, k: +p[2] || 0 }; }); }
      if (k2 === 'G:' && v) v.split(',').forEach(function (x) { var p = x.split('~'); tfp.push(p[0]); tnm.push(p[1] || ''); });
    });
    return { id: id, start: start, state: z[0], mode: z[1] || 0, boss: z[2] || 0, dur: z[3] || 360, max: z[4] || 1000, hp: z[5] == null ? z[4] : z[5], win: !!z[6], n: z[7] || 0, heal: z[8] || 0,
      combo: z[9] || 1, songEnd: z[10] || 0, shields: z[11] || 0,
      atk: { no: a[0] || 0, st: a[1] || 0, q: a[2] || 0, at: a[3] || 0, right: a[4] || 0, of: a[5] || 0, blocked: !!a[6], shielded: !!a[7] },
      tg: { no: g[0] || 0, st: g[1] || 0, q: g[2] || 0, at: g[3] || 0, fps: tfp, names: tnm }, top: top, ev: ev, seq: seq };
  }
  function leftOf(b) { return Math.max(0, Math.round((b.start + b.dur * 1000 - sNow()) / 1000)); }
  function atkLeft(b) { return Math.max(0, Math.ceil(ATK_WIN - (sNow() - (b.start + b.atk.at * 1000)) / 1000)); }
  function secNow(b) { return (sNow() - b.start) / 1000; }
  function tgLeft(b) { return Math.max(0, Math.ceil(TG_WIN - (secNow(b) - b.tg.at))); }
  function songLeft(b) { return b.songEnd ? Math.max(0, Math.ceil(b.songEnd - secNow(b))) : 0; }
  function phaseOf(b) { var f = b.max ? b.hp / b.max : 1; return f > 0.5 ? 1 : f > 0.2 ? 2 : 3; }
  function bossOf(b) { return BOSSES[b.boss % BOSSES.length]; }

  /* ---------------- questions ---------------- */
  // review: number and multiple-choice questions (and extras) from the five lessons before this one; exit: this lesson's.
  // The list is in a fixed order on every screen, so a question's place in it (ci) means the same thing everywhere.
  var POOLS = {}, poolWait = {};
  function loadPool(mode, cb) {
    if (POOLS[mode]) return cb(POOLS[mode]);
    if (poolWait[mode]) { poolWait[mode].push(cb); return; }
    poolWait[mode] = [cb];
    var me = A.LES(), got = [];
    function take(L) {
      var from = L.label || 'Lesson ' + L.n;
      L.slides.forEach(function (s) {
        if (s.k === 'number' && s.ans != null) got.push({ k: 'number', q: s.q, ans: s.ans, tol: s.tol, fig: s.fig, why: s.why, from: from });
        if (s.k === 'poll' && s.ans != null && !s.warm) got.push({ k: 'poll', q: s.q, opts: s.opts, ans: s.ans, fig: s.fig, why: s.why, from: from });
        (s.more || []).forEach(function (m) { if ((m.k === 'number' || m.k === 'poll') && m.ans != null) got.push({ k: m.k, q: m.q, opts: m.opts, ans: m.ans, tol: m.tol, fig: m.fig, why: m.why, from: from, star: true }); });
      });
    }
    function done() { got.forEach(function (q, i) { q.ci = i; }); POOLS[mode] = got; var w = poolWait[mode]; poolWait[mode] = null; w.forEach(function (f) { try { f(got); } catch (e) { console.warn(e); } }); }
    if (mode === 1) { take(me); return done(); }
    var plan = (window.SFA_PLAN || []).filter(function (p) { return p.n < me.n; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 5), k = 0, keepFn = window.SFA_LESSON;
    (function next() {
      if (k >= plan.length) { window.SFA_LESSON = keepFn; if (!got.length) take(me); return done(); }
      window.SFA_LESSON = function (L) { take(L); };
      var s = document.createElement('script'); s.src = 'lessons/L' + plan[k++].l + '.js'; s.onload = s.onerror = function () { s.remove(); next(); }; document.head.appendChild(s);
    })();
  }
  // boss attacks are multiple choice when there are any (everyone answers at once, so quick to read and quick to answer)
  function atkList(pool) { var p = pool.filter(function (q) { return q.k === 'poll' && q.opts && q.opts.length <= 5; }); return p.length ? p : pool; }
  function atkQ(b) { var pool = POOLS[b.mode]; if (!pool || !pool.length) return null; var L = atkList(pool); return L[b.atk.q % L.length]; }
  function tgQ(b) { var pool = POOLS[b.mode]; if (!pool || !pool.length) return null; var L = atkList(pool); return L[b.tg.q % L.length]; }
  function easyQs() {
    var r = rng((A.S.me ? parseInt(sh3(A.S.me.sid), 36) * 31 : 7) + Math.round((ST.id || 0) / 1000) % 9973), n = function (a, b) { return a + Math.floor(r() * (b - a + 1)); };
    // integer operations: one step each, small numbers, negatives in every one
    var m = function (v) { return v < 0 ? '(−' + (-v) + ')' : String(v); }, w = function (v) { return v < 0 ? '−' + (-v) : String(v); };
    var T = [
      function () { var a = -n(2, 9), b = n(2, 9); return { q: w(a) + ' + ' + b, ans: a + b, why: 'Start at ' + w(a) + ' and go up ' + b + ': ' + w(a + b) + '.' }; },
      function () { var a = n(1, 6), b = a + n(2, 7); return { q: a + ' − ' + b, ans: a - b, why: 'From ' + a + ', going down ' + b + ' passes zero: ' + w(a - b) + '.' }; },
      function () { var a = -n(2, 8), b = n(2, 7); return { q: w(a) + ' − ' + b, ans: a - b, why: 'Going down from a negative goes further below zero: ' + w(a - b) + '.' }; },
      function () { var a = n(1, 8), b = n(2, 7); return { q: a + ' − ' + m(-b), ans: a + b, why: 'Taking away a negative is the same as adding: ' + a + ' + ' + b + ' = ' + (a + b) + '.' }; },
      function () { var a = n(2, 9), b = n(2, 6); return { q: w(-a) + ' × ' + b, ans: -a * b, why: 'Negative times positive is negative: ' + w(-a * b) + '.' }; },
      function () { var a = n(2, 6), b = n(2, 6); return { q: m(-a) + ' × ' + m(-b), ans: a * b, why: 'Negative times negative is positive: ' + a * b + '.' }; },
      function () { var a = n(2, 6), b = n(2, 9); return { q: w(-a * b) + ' ÷ ' + a, ans: -b, why: 'Negative divided by positive is negative: ' + w(-b) + '.' }; },
      function () { var a = n(2, 6), b = n(2, 9); return { q: w(-a * b) + ' ÷ ' + m(-a), ans: b, why: 'Negative divided by negative is positive: ' + b + '.' }; }
    ].map(function (f) { return function () { var o = f(); return { k: 'number', q: 'What is *' + o.q + '*?', ans: o.ans, why: o.why }; }; });
    return shuffle(T, r).slice(0, EASY_N).map(function (f) { return Object.assign(f(), { from: 'warm-up', easy: true }); });
  }

  /* =========================== student page and class screen =========================== */
  var root = null, V = null, ST = null;
  function key() { return 'raid.' + A.LID; }
  function keep() { if (ST) SFA.store.set(key(), ST); }
  // ⭐ arcade level (sfa-lesson.js): XP for effort, and small perks for the special
  function xp(n, once) { if (A.hero && ST) A.hero.add('r', String(Math.round(ST.id / 1000)) + (once ? 'e' : ''), n, once); }
  function hinfo() { return A.hero ? A.hero.info() : { lv: 1, title: 'Rookie', pct: 0, xp: 0, perks: { sp: 0, ch: 0, loot: 1 } }; }
  function spBonus(lv) { return lv >= 10 ? 20 : lv >= 5 ? 10 : lv >= 2 ? 5 : 0; }
  function myName() { return A.S.me ? clean(A.first(A.S.me.name).replace(/[^A-Za-zÀ-ÿ' -]/g, '')) : ''; }

  function sync() {
    var Lv = A.live(), b = A.isLive() || A.MODE === 'screen' ? raidOf(Lv) : null;
    if (b && A.MODE !== 'teach' && b.state === 2 && sNow() - b.start > b.dur * 1000 + 150000) b = null;   // long over: gone
    if (A.MODE === 'student' && A.saving() && !A.S.me) b = null;
    if (!b) { close(); return; }
    if (!root || V.id !== b.id) open(b);
    apply(b);
  }
  function open(b) {
    close();
    var saved = SFA.store.get(key(), null);
    ST = saved && saved.id === b.id ? saved : { id: b.id, dmg: 0, hits: 0, n: 0, streak: 0, best: 0, tries: 0, fb: null, cool: 0, qi: 0, res: {}, atk: {}, countered: {}, hero: null, charge: 0, spUsed: 0, buffs: { crit: 0, dbl: 0 }, dg: 0, sn: 0, stunUntil: 0, tg: {}, em: 0, emi: 0, cheerAt: 0 };
    if (!(saved && saved.id === b.id) && A.MODE === 'student') ST.charge = Math.min(CHARGE, hinfo().perks.ch);
    V = { id: b.id, b: b, hurt: 0, fl: [], parts: [] };
    root = H('div', 'br' + (A.MODE !== 'student' ? ' screen' : '')); root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Boss Raid');
    document.body.appendChild(root); document.body.classList.add('boarding');
    loadPool(b.mode, function () { if (root && V && V.id === b.id) { V.order = null; draw(); } });
    V.tick = setInterval(function () { if (root) drawTop(); }, 1000);
    var last = performance.now();
    (function loop(ts) { if (!root || !V) return; V.raf = requestAnimationFrame(loop); var dt = Math.min(0.1, ((ts || last) - last) / 1000); last = ts || last; frame(dt); })();
  }
  function close() {
    if (!root) return; clearInterval(V.tick); cancelAnimationFrame(V.raf);
    [].forEach.call(document.querySelectorAll('.brban'), function (x) { x.remove(); });
    root.remove(); root = null; V = null; document.body.classList.remove('boarding');
  }
  function apply(b) {
    var prev = V.prev; V.b = b;
    // hits from everyone (my own already showed the moment I answered)
    if (V.seen == null) V.seen = b.seq;
    else if (b.seq > V.seen) {
      var first = b.seq - b.ev.length + 1, me = A.MODE === 'student' ? myName() : null;
      b.ev.forEach(function (e, i) { if (first + i > V.seen && e.n !== me) evFx(e); });
      V.seen = b.seq;
    }
    if (prev) {
      var ph = phaseOf(b), ph0 = phaseOf(prev), B = bossOf(b);
      if (ph > ph0 && b.state === 1 && !b.win) banner(ph === 2 ? '😡 <b>' + esc(B.name.toUpperCase()) + '</b> IS ENRAGED!' : '🔥 <b>LAST STAND!</b> Finish it!', 'phase');
      if (b.atk.st === 1 && !(prev.atk.st === 1 && prev.atk.no === b.atk.no)) { banner('⚠️ <b>' + B.atk + '</b> incoming! Answer to block it!', 'alarm'); snd('alarm'); }
      if (b.atk.st === 2 && !(prev.atk.st === 2 && prev.atk.no === b.atk.no)) {
        V.lastHeal = Math.max(0, b.heal - prev.heal);
        if (b.atk.blocked) { banner('🛡️ <b>BLOCKED!</b> ' + b.atk.right + ' of ' + b.atk.of + ' got it right', 'block'); snd('block'); }
        else if (b.atk.shielded) { banner('🛡️ <b>SHIELD WALL!</b> A knight\'s shield took the hit. No healing!', 'block'); snd('block'); }
        else { banner('💥 <b>The boss hit the class!</b> It healed ' + V.lastHeal + ' HP', 'hurt'); snd('hurt'); V.shake = 1; }
        // my counter-attack: a blocked attack I got right
        if (A.MODE === 'student' && b.atk.blocked && ST.atk[b.atk.no] === 1 && !ST.countered[b.atk.no]) { ST.countered[b.atk.no] = 1; ST.dmg += COUNTER; keep(); send(); hitFx('Your counter', COUNTER, 1); }
      }
    }
    if (prev && b.state === 1 && !b.win) {
      if (b.combo > prev.combo) { banner('⚡ <b>COMBO x' + CMUL[b.combo] + '!</b> Everyone\'s hits do ' + CMUL[b.combo] + '× damage. Keep hitting together!', 'combo'); snd('crit'); }
      if (b.tg.st === 1 && !(prev.tg.st === 1 && prev.tg.no === b.tg.no)) {
        var mineT = A.MODE === 'student' && A.S.me && b.tg.fps.indexOf(sh3(A.S.me.sid)) >= 0;
        banner('🎯 <b>' + esc(bossOf(b).name) + '</b> targets <b>' + b.tg.names.map(esc).join(' & ') + '</b>!', 'alarm'); snd('alarm'); if (mineT) V.shake = 1;
      }
    }
    if (b.win && !V.wonAt) { V.wonAt = performance.now(); boom(); snd('win'); }
    V.prev = b;
    var sig = [b.state, b.win, b.atk.no, b.atk.st, A.MODE === 'student' ? ST.atk[b.atk.no] : b.atk.of, phaseOf(b), b.top.map(function (t) { return t.n + t.d; }).join('.'), !!POOLS[b.mode],
      b.tg.no + '.' + b.tg.st, A.MODE === 'student' ? [ST.hero, ST.tg[b.tg.no], targeted(b)].join('.') : [b.tg.names.join('.'), b.combo, b.shields].join('.')].join('|');
    if (sig !== V.sig) { V.sig = sig; draw(); } else drawTop();
  }

  // banners across the top of every screen
  function banner(html, kind) { V.bq = V.bq || []; V.bq.push({ html: html, kind: kind }); nextBanner(); }
  function nextBanner() {
    if (!root || V.bbusy || !V.bq || !V.bq.length) return;
    var o = V.bq.shift(); V.bbusy = true;
    var b = H('div', 'brban ' + o.kind + (A.MODE === 'screen' ? ' big' : ''), o.html); document.body.appendChild(b);
    setTimeout(function () { b.classList.add('out'); }, A.MODE === 'screen' ? 2600 : 2100);
    setTimeout(function () { b.remove(); if (V) { V.bbusy = false; nextBanner(); } }, A.MODE === 'screen' ? 3000 : 2500);
  }
  // sound: little synthesised effects, off until someone turns them on
  var AC = null;
  function soundOn() { return !!SFA.store.get('raid.sound', false); }
  function snd(k) {
    if (!soundOn()) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var t = AC.currentTime, notes = { hit: [330], crit: [440, 660], alarm: [220, 180, 220, 180], block: [523, 659, 784], hurt: [200, 140], win: [523, 659, 784, 1047, 1319], tick: [440], special: [392, 523, 659, 880], loot: [784, 988, 1319] }[k] || [500];
      notes.forEach(function (f, i) { var o = AC.createOscillator(), g = AC.createGain(); o.type = k === 'alarm' || k === 'hurt' ? 'sawtooth' : k === 'tick' ? 'square' : 'triangle'; o.frequency.value = f; o.connect(g); g.connect(AC.destination); var t0 = t + i * (k === 'alarm' ? 0.16 : 0.1); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(k === 'tick' || k === 'hit' ? 0.05 : 0.1, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25); o.start(t0); o.stop(t0 + 0.28); });
    } catch (e) { }
  }

  /* ---------- the boss: drawn on a canvas, animated ---------- */
  function hitFx(name, d, crit) {
    if (!root) return;
    V.hurt = 1; snd(crit ? 'crit' : 'hit');
    var st = root.querySelector('.brstage'); if (!st || st.querySelectorAll('.brdmg').length > 14) return;
    var f = H('div', 'brdmg' + (crit ? ' crit' : ''), (name ? '<small>' + esc(name) + '</small>' : '') + '−' + d + (crit ? '!' : ''));
    f.style.left = (25 + Math.random() * 50) + '%'; f.style.top = (18 + Math.random() * 40) + '%';
    st.appendChild(f); setTimeout(function () { f.remove(); }, 1500);
  }
  // what a classmate did, on every screen: hits float up, specials fill the stage, dodges and stuns get a banner
  function evFx(e) {
    if (e.k >= 30 && e.k < 30 + SPELLS.length) { var S = SPELLS[e.k - 30]; spFx({ id: 'spell', e: S.e, sp: S.name }, e.n, e.d); banner('🎁 <b>' + esc(e.n) + '</b> opened a spell box: ' + S.e + ' ' + S.name + '! −' + e.d, 'special'); }
    else if (e.k === 20) { banner('💚 <b>SECOND WIND!</b> ' + esc(bossOf(V.b).name) + ' healed ' + e.d + ' HP. It won\'t go down easy!', 'hurt'); snd('hurt'); V.shake = 1; }
    else if (e.k >= 10) { var h = HEROES[(e.k - 10) % HEROES.length]; spFx(h, e.n, e.d); banner(h.e + ' <b>' + esc(e.n) + '</b>: ' + h.sp + '! −' + e.d, 'special'); }
    else if (e.k === 2) { banner('😰 <b>' + esc(bossOf(V.b).name.toUpperCase()) + '</b> IS WEAKENING! Keep hitting!', 'combo'); V.hurt = 1; }
    else if (e.k === 3) { hitFx(e.n + ' dodged!', e.d, 1); }
    else if (e.k === 4) { banner('😵 <b>' + esc(e.n) + '</b> got stunned!', 'hurt'); }
    else if (e.k >= 5 && e.k <= 9) cheerFx(EMO[e.k - 5], e.n);
    else hitFx(e.n, e.d, e.k === 1);
  }
  // a cheer floats up the stage: big on the class screen
  function cheerFx(emo, name) {
    if (!root) return;
    var st = root.querySelector('.brstage'); if (!st || st.querySelectorAll('.brcheerfx').length > 12) return;
    var f = H('div', 'brcheerfx', '<span>' + emo + '</span>' + (name ? '<small>' + esc(name) + '</small>' : ''));
    f.style.left = (8 + Math.random() * 84) + '%'; f.style.animationDuration = (2.2 + Math.random() * 0.8) + 's';
    st.appendChild(f); setTimeout(function () { f.remove(); }, 3200);
  }
  function spFx(h, name, d) {
    if (!root) return;
    V.hurt = 1; V.shake = 0.7; snd('special');
    var st = root.querySelector('.brstage'); if (!st) return;
    var f = H('div', 'brsp ' + h.id, '<span>' + h.e + '</span><b>' + h.sp + '!</b><small>' + esc(name) + ' · −' + d + '</small>');
    st.appendChild(f); setTimeout(function () { f.remove(); }, 1900);
  }
  function boom() { for (var i = 0; i < 60; i++) { var a = Math.random() * Math.PI * 2, s = 120 + Math.random() * 380; V.parts.push({ x: 300, y: 250, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, life: 1.4 + Math.random(), c: ['#FFE14D', '#FF7AC0', '#7CF2A2', '#53E0FF', '#fff'][i % 5] }); } }
  function frame(dt) {
    var cv = root.querySelector('canvas.brboss'); if (!cv) return;
    V.hurt = Math.max(0, V.hurt - dt * 3); V.shake = Math.max(0, (V.shake || 0) - dt * 1.5);
    var b = V.b, c = cv.getContext('2d'), W = cv.width, Hh = cv.height, t = performance.now() / 1000;
    c.clearRect(0, 0, W, Hh);
    var k = Math.min(W / 600, Hh / 440); c.save(); c.translate((W - 600 * k) / 2, (Hh - 440 * k) / 2); c.scale(k, k);
    var dead = V.wonAt ? Math.min(1, (performance.now() - V.wonAt) / 1800) : 0, charge = b.atk.st === 1 && !b.win ? 1 : 0;
    // ground and aura
    c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(300, 410, 190 * (1 - dead * 0.6), 22, 0, 0, Math.PI * 2); c.fill();
    if (charge) { var pr = 0.5 + 0.5 * Math.sin(t * 8), g = c.createRadialGradient(300, 240, 40, 300, 240, 260); g.addColorStop(0, 'rgba(255,60,60,' + (0.35 + pr * 0.3) + ')'); g.addColorStop(1, 'rgba(255,60,60,0)'); c.fillStyle = g; c.fillRect(0, 0, 600, 440); }
    if (dead < 1) {
      var off = V.off || (V.off = document.createElement('canvas')); off.width = 600; off.height = 440; var o = off.getContext('2d');
      o.clearRect(0, 0, 600, 440); o.save();
      var sc = (charge ? 1 + 0.03 * Math.sin(t * 10) : 1) * (1 - dead * 0.5);
      o.translate(300, 400); o.scale(sc, sc); if (dead) o.rotate(Math.sin(t * 40) * 0.08 * dead); o.translate(-300, -400);
      boss(o, bossOf(b).id, t, phaseOf(b), bossOf(b).col, charge);
      o.restore();
      if (V.hurt > 0 || dead) { o.globalCompositeOperation = 'source-atop'; o.fillStyle = 'rgba(255,255,255,' + Math.max(V.hurt * 0.7, dead * 0.9) + ')'; o.fillRect(0, 0, 600, 440); o.globalCompositeOperation = 'source-over'; }
      var sx = (V.hurt * 9 + (V.shake || 0) * 16) * Math.sin(t * 70), sy = (V.shake || 0) * 8 * Math.cos(t * 55);
      c.globalAlpha = 1 - dead; c.drawImage(off, sx, sy); c.globalAlpha = 1;
    }
    V.parts = V.parts.filter(function (p) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 400 * dt; if (p.life <= 0) return false; c.globalAlpha = Math.min(1, p.life); c.fillStyle = p.c; c.fillRect(p.x - 5, p.y - 5, 10, 10); c.globalAlpha = 1; return true; });
    c.restore();
  }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function blk(c, x, y, w, h, col, dark) { var g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, col); g.addColorStop(1, dark); c.fillStyle = g; rr(c, x, y, w, h, 14); c.fill(); c.lineWidth = 5; c.strokeStyle = '#141428'; c.stroke(); }
  function eye(c, x, y, r, angry, glow) {
    c.fillStyle = glow ? '#FF4B4B' : '#fff'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.lineWidth = 4; c.strokeStyle = '#141428'; c.stroke();
    if (!glow) { c.fillStyle = '#141428'; c.beginPath(); c.arc(x + r * 0.15, y + r * 0.1, r * 0.45, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x - r * 0.05, y - r * 0.15, r * 0.15, 0, Math.PI * 2); c.fill(); }
    if (angry) { c.strokeStyle = '#141428'; c.lineWidth = 7; c.beginPath(); c.moveTo(x - r * 1.1, y - r * 1.3 + (angry > 0 ? 0 : 6)); c.lineTo(x + r * 1.1, y - r * 0.8); c.stroke(); }
  }
  function boss(c, id, t, ph, col, charge) {
    var glow = ph >= 2 || charge;
    if (id === 'golem') {
      var bob = Math.sin(t * 2) * 6, sep = ph >= 3 ? 10 + Math.sin(t * 3) * 6 : 0;
      blk(c, 215, 330, 64, 78, col[1], col[2]); blk(c, 321, 330, 64, 78, col[1], col[2]);
      blk(c, 120 - sep, 200 + bob + Math.sin(t * 2.4) * 8, 62, 140, col[1], col[2]); blk(c, 418 + sep, 200 + bob - Math.sin(t * 2.4) * 8, 62, 140, col[1], col[2]);
      blk(c, 185, 185 + bob, 230, 155, col[0], col[1]);
      var pulse = 0.6 + 0.4 * Math.sin(t * 5); c.fillStyle = glow ? 'rgba(255,75,75,' + pulse + ')' : 'rgba(255,225,77,' + pulse + ')'; c.beginPath(); c.arc(300, 262 + bob, 26, 0, Math.PI * 2); c.fill(); c.lineWidth = 5; c.strokeStyle = '#141428'; c.stroke();
      blk(c, 228, 80 + bob - sep, 144, 104, col[0], col[1]);
      c.fillStyle = '#141428'; rr(c, 246, 112 + bob - sep, 108, 34, 10); c.fill();
      c.fillStyle = glow ? '#FF4B4B' : '#9CFBFF'; var ex = 262 + (Math.sin(t * 1.3) + 1) * 30; rr(c, ex, 119 + bob - sep, 26, 20, 6); c.fill();
      if (ph >= 2) { c.strokeStyle = '#141428'; c.lineWidth = 4; c.beginPath(); c.moveTo(200, 200 + bob); c.lineTo(232, 236 + bob); c.lineTo(222, 270 + bob); c.moveTo(398, 300 + bob); c.lineTo(372, 316 + bob); c.lineTo(380, 336 + bob); c.stroke(); }
      for (var i = 0; i < 3; i++) { c.fillStyle = col[1]; c.fillRect(250 + i * 40, 66 + bob - sep, 16, 16); }
    } else if (id === 'hydra') {
      var n = ph >= 3 ? 5 : ph >= 2 ? 4 : 3;
      for (var h = 0; h < n; h++) {
        var m = h - (n - 1) / 2, bx = 300 + m * 60, hx = 300 + m * 115 + Math.sin(t * 1.6 + h) * 18, hy = 110 + Math.abs(m) * 40 + Math.cos(t * 1.3 + h * 1.7) * 16;
        c.lineCap = 'round';
        [[44, '#141428'], [34, col[0]]].forEach(function (s) { c.strokeStyle = s[1]; c.lineWidth = s[0]; c.beginPath(); c.moveTo(bx, 330); c.bezierCurveTo(bx + m * 10, 250, hx - m * 40, hy + 90, hx, hy + 20); c.stroke(); });
        c.fillStyle = col[1]; c.beginPath(); c.ellipse(hx, hy, 46, 32, m * 0.15, 0, Math.PI * 2); c.fill(); c.lineWidth = 5; c.strokeStyle = '#141428'; c.stroke();
        var jaw = 6 + 6 * Math.sin(t * 4 + h); c.fillStyle = '#3a0d24'; c.beginPath(); c.ellipse(hx, hy + 18 + jaw / 2, 26, 6 + jaw / 2, 0, 0, Math.PI); c.fill();
        c.fillStyle = '#fff'; [[-14], [10]].forEach(function (d) { c.beginPath(); c.moveTo(hx + d[0], hy + 18); c.lineTo(hx + d[0] + 5, hy + 28 + jaw / 2); c.lineTo(hx + d[0] + 10, hy + 18); c.fill(); });
        eye(c, hx - 16, hy - 8, 9, ph >= 2 ? 1 : 0, charge); eye(c, hx + 16, hy - 8, 9, ph >= 2 ? 1 : 0, charge);
      }
      var g2 = c.createLinearGradient(0, 290, 0, 420); g2.addColorStop(0, col[0]); g2.addColorStop(1, col[2]); c.fillStyle = g2; c.beginPath(); c.ellipse(300, 370, 175, 70, 0, Math.PI, 0); c.lineTo(475, 405); c.lineTo(125, 405); c.closePath(); c.fill(); c.lineWidth = 5; c.strokeStyle = '#141428'; c.stroke();
      for (var sp = 0; sp < 6; sp++) { c.fillStyle = col[1]; c.beginPath(); c.moveTo(170 + sp * 52, 330 - Math.sin(sp) * 6); c.lineTo(186 + sp * 52, 304); c.lineTo(202 + sp * 52, 330); c.fill(); }
    } else if (id === 'slime') {
      var cx = 300, cy = 270, pts = 64; c.beginPath();
      for (var p = 0; p <= pts; p++) { var a = p / pts * Math.PI * 2, r = 150 + 9 * Math.sin(3 * a + t * 2) + 6 * Math.sin(5 * a - t * 3); var x = cx + Math.cos(a) * r * 1.12, y = cy + Math.sin(a) * r * 0.86; if (y > 400) y = 400; if (p) c.lineTo(x, y); else c.moveTo(x, y); }
      c.closePath(); var g3 = c.createRadialGradient(260, 200, 20, 300, 270, 200); g3.addColorStop(0, '#fff'); g3.addColorStop(0.15, col[0]); g3.addColorStop(1, col[2]); c.fillStyle = g3; c.fill(); c.lineWidth = 6; c.strokeStyle = '#141428'; c.stroke();
      if (ph >= 3) for (var s = 0; s < 7; s++) { var sa = Math.PI + 0.3 + s * 0.42, sx = cx + Math.cos(sa) * 165, sy = cy + Math.sin(sa) * 128; c.fillStyle = col[1]; c.beginPath(); c.moveTo(sx - 12, sy + 6); c.lineTo(sx + Math.cos(sa) * 36, sy + Math.sin(sa) * 36); c.lineTo(sx + 12, sy + 6); c.fill(); c.stroke(); }
      eye(c, 245, 235, 30, ph >= 2 ? 1 : 0, charge); eye(c, 355, 235, 30, ph >= 2 ? 1 : 0, charge);
      c.fillStyle = '#3a0d24'; c.beginPath(); var mw = ph >= 2 ? 50 : 36; c.ellipse(300, 310, mw, ph >= 2 ? 26 : 14 + 4 * Math.sin(t * 3), 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(230, 175, 34, 16, -0.5, 0, Math.PI * 2); c.fill();
      for (var d = 0; d < 3; d++) { var dy = (t * 60 + d * 50) % 120; c.fillStyle = col[0]; c.globalAlpha = 1 - dy / 120; c.beginPath(); c.arc(180 + d * 120, 380 + dy * 0.2, 9, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
    } else {   // kraken
      var nt = ph >= 3 ? 8 : 6;
      for (var tn = 0; tn < nt; tn++) {
        var m2 = tn - (nt - 1) / 2, x0 = 300 + m2 * 22;
        for (var sg = 0; sg < 14; sg++) {
          var u = sg / 13, xx = x0 + m2 * 34 * u * 2.2 + Math.sin(t * 2 + tn + u * 5) * 26 * u, yy = 280 + u * 130 - Math.sin(u * Math.PI) * 20;
          c.fillStyle = sg % 2 ? col[0] : col[2]; c.beginPath(); c.arc(xx, yy, 20 - u * 13, 0, Math.PI * 2); c.fill();
        }
      }
      var g4 = c.createLinearGradient(0, 60, 0, 320); g4.addColorStop(0, col[0]); g4.addColorStop(1, col[2]); c.fillStyle = g4;
      c.beginPath(); c.ellipse(300, 190 + Math.sin(t * 1.5) * 5, 120, 140, 0, 0, Math.PI * 2); c.fill(); c.lineWidth = 6; c.strokeStyle = '#141428'; c.stroke();
      for (var sp2 = 0; sp2 < 5; sp2++) { c.fillStyle = col[1]; c.globalAlpha = 0.55; c.beginPath(); c.arc(250 + sp2 * 26, 110 + (sp2 % 2) * 20, 8, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
      eye(c, 255, 215, 24, ph >= 2 ? 1 : 0, glow); eye(c, 345, 215, 24, ph >= 2 ? 1 : 0, glow);
      if (ph >= 2) { eye(c, 300, 165, 16, 0, true); }
    }
  }

  /* ---------- drawing the page ---------- */
  function drawTop() {
    if (!root || !V) return;
    var b = V.b, t = root.querySelector('.brtop'); if (!t) return;
    var left = leftOf(b), f = b.max ? Math.max(0, b.hp) / b.max : 0;
    t.querySelector('.brclock').textContent = b.win ? '🏆' : b.state === 2 ? 'Time!' : Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2);
    var bar = t.querySelector('.brhp'); bar.className = 'brhp p' + phaseOf(b);
    bar.querySelector('i').style.width = (100 * f).toFixed(1) + '%'; bar.querySelector('u').style.width = (100 * f).toFixed(1) + '%';
    bar.querySelector('span').textContent = Math.max(0, b.hp) + ' / ' + b.max + ' HP';
    var at = root.querySelector('.bratkt'); if (at && b.atk.st === 1) at.textContent = atkLeft(b) + ' s';
    var tt = root.querySelector('.brtgt'); if (tt && b.tg.st === 1) tt.textContent = tgLeft(b) + ' s';
    var bf = t.querySelector('.brbuffs'), sl = songLeft(b);
    if (bf) bf.innerHTML = (b.combo > 1 && b.state === 1 ? '<span class="combo">⚡ COMBO x' + CMUL[b.combo] + '</span>' : '') + (sl && b.state === 1 ? '<span class="song">🎸 +5 · ' + sl + ' s</span>' : '') + (b.shields && b.state === 1 ? '<span class="shield">🛡️ ' + (b.shields > 1 ? '×' + b.shields : 'shield up') + '</span>' : '');
    // a target that runs out of time is stunned; a stun that wears off frees the question box
    if (A.MODE === 'student' && targeted(b) && tgLeft(b) === 0) tgAnswer(false);
    if (A.MODE === 'student' && ST.stunUntil && Date.now() >= ST.stunUntil && V.stunned) { V.stunned = false; draw(); }
    var cd = root.querySelector('.brcount');
    if (b.state === 1 && left > 0 && left <= 10 && !b.win) { if (!cd) { cd = H('div', 'brcount'); root.appendChild(cd); } if (cd.textContent !== String(left)) { cd.textContent = left; snd('tick'); } }
    else if (cd) cd.remove();
    // the attack window closes on this screen at 0 even if the console's word is still on its way
    if (A.MODE === 'student' && b.atk.st === 1 && atkLeft(b) === 0 && !V.closedAtk) { V.closedAtk = b.atk.no; draw(); }
  }
  function draw() {
    if (!root) return;
    var b = V.b, B = bossOf(b);
    var typed = {}, focus = document.activeElement && root.contains(document.activeElement) ? document.activeElement.getAttribute('aria-label') : null;
    [].forEach.call(root.querySelectorAll('input'), function (x) { typed[x.getAttribute('aria-label')] = x.value; });
    var floats = root.querySelectorAll('.brdmg,.brcheerfx,.brsp');
    root.innerHTML = '';
    setTimeout(function () { if (!root) return; [].forEach.call(root.querySelectorAll('input'), function (x) { var k = x.getAttribute('aria-label'); if (typed[k]) x.value = typed[k]; if (k === focus) x.focus({ preventScroll: true }); }); nextBanner(); }, 0);
    var top = H('div', 'brtop', '<span class="brtitle">👹 BOSS RAID <small>' + esc(MODES[b.mode]) + '</small></span><span class="brname">' + B.e + ' ' + esc(B.name) + '</span><span class="brhp"><u></u><i></i><span></span></span><span class="brbuffs"></span><span class="brclock"></span><button type="button" class="bbsnd" title="Sound effects">' + (soundOn() ? '🔊' : '🔇') + '</button>');
    root.appendChild(top);
    top.querySelector('.bbsnd').onclick = function () { SFA.store.set('raid.sound', !soundOn()); this.textContent = soundOn() ? '🔊' : '🔇'; snd('block'); };
    var body = H('div', 'brbody'); root.appendChild(body);
    var stage = H('div', 'brstage' + (b.atk.st === 1 && !b.win ? ' charging' : '')), cv = document.createElement('canvas');
    cv.className = 'brboss'; cv.width = A.MODE === 'screen' ? 960 : 600; cv.height = A.MODE === 'screen' ? 704 : 440; stage.appendChild(cv);
    [].forEach.call(floats, function (f) { stage.appendChild(f); });
    body.appendChild(stage);
    drawTop();
    if (b.state === 2) {   // a win waits for the boss to finish exploding
      var wait = b.win && V.wonAt ? 2600 - (performance.now() - V.wonAt) : 0;
      if (wait > 0) setTimeout(function () { if (root) draw(); }, wait + 50); else ending(body);
    }
    if (A.MODE !== 'student') return drawClass(body, stage);
    stage.appendChild(heroBar());
    if (ST.hero != null) stage.appendChild(cheerBar());
    if (b.state === 2) return;
    var qb = H('div', 'brq'); body.appendChild(qb);
    setTimeout(placeAim, 0);
    V.stunned = Date.now() < (ST.stunUntil || 0);
    if (b.atk.st && !b.win) drawAtk(qb);
    else if (targeted(b)) drawTarget(qb);
    else if (ST.hero == null) drawPick(qb);
    else if (V.stunned) drawStun(qb);
    else drawQ(qb);
  }

  // my hero, my special's charge, my buffs, and the big button when it's ready
  function heroBar() {
    var bar = H('div', 'brme'), h = HEROES[ST.hero];
    var dmg = '⚔️ <b>' + ST.dmg + '</b> damage' + (ST.streak >= 2 ? ' · 🔥 ' + ST.streak + ' in a row' : '') + (ST.buffs.dbl ? ' · 💥×2 for ' + ST.buffs.dbl : '') + (ST.buffs.crit ? ' · 🎯 ' + ST.buffs.crit + ' sure crit' + (ST.buffs.crit > 1 ? 's' : '') : '');
    if (!h) { bar.innerHTML = dmg; return bar; }
    var I = hinfo();
    bar.innerHTML = '<span class="brhero" style="--hc:' + h.col + '">' + h.e + ' ' + h.name + '</span><span class="brlv" title="' + I.xp + ' XP">⭐ Lv ' + I.lv + '</span><span class="brpips">' + [0, 1, 2, 3].map(function (i) { return '<i class="' + (i < ST.charge ? 'on' : '') + '"></i>'; }).join('') + '</span> ' + dmg;
    if (ST.charge >= CHARGE && V.b.state === 1) {
      var go = el('button', { type: 'button', 'class': 'brspbtn', text: h.e + ' ' + h.sp + '!' }); go.style.setProperty('--hc', h.col);
      go.title = h.txt; go.onclick = special; bar.appendChild(go);
    }
    if (ST.box && V.b.state === 1) { var bx = el('button', { type: 'button', 'class': 'brboxbtn', text: '🎁 Open spell box!' }); bx.onclick = openBox; bar.appendChild(bx); }
    return bar;
  }
  function special() {
    var h = HEROES[ST.hero]; if (!h || ST.charge < CHARGE || V.b.state !== 1) return;
    var d = h.d + hinfo().perks.sp;
    ST.charge = 0; ST.spUsed++; ST.dmg += d;
    if (h.id === 'archer') ST.buffs.crit += 3;
    keep(); send(); spFx(h, 'You', d);
    SFA.toast(h.e + ' ' + h.sp + '! ' + h.txt + (d > h.d ? ' (+' + (d - h.d) + ' for your level)' : ''), 3500); draw();
  }
  function charge(n) { var was = ST.charge; ST.charge = Math.min(CHARGE, ST.charge + n); if (was < CHARGE && ST.charge >= CHARGE && ST.hero != null) { snd('loot'); SFA.toast(HEROES[ST.hero].e + ' Your ' + HEROES[ST.hero].sp + ' is ready! Press the glowing button.', 3500); } }
  // loot: critical hits drop it often, normal hits now and then. It opens with a little reveal.
  function maybeLoot(crit) {
    if (Math.random() > (crit ? 0.35 : 0.12) * hinfo().perks.loot) return false;
    var L = LOOT[Math.floor(Math.random() * LOOT.length)];
    if (L.k === 'charge') charge(CHARGE); if (L.k === 'dbl') ST.buffs.dbl += 3; if (L.k === 'crit') ST.buffs.crit += 2;
    if (L.k === 'bomb') { ST.dmg += 40; hitFx('Loot bomb', 40, 1); }
    snd('loot');
    var pop = H('div', 'brloot', '<div class="card"><small>🎁 LOOT!</small><span>' + L.e + '</span><b>' + L.name + '</b><p>' + L.txt + '</p></div>');
    document.body.appendChild(pop); pop.onclick = function () { pop.remove(); };
    setTimeout(function () { pop.classList.add('out'); }, 2200); setTimeout(function () { pop.remove(); }, 2700);
    return true;
  }
  function maybeBox() {
    if (ST.box || Math.random() > BOX_CHANCE) return false;
    ST.box = 1; snd('loot');
    if (ST.fb && ST.fb.ok) ST.fb.html += ' <b>🎁 A spell box dropped!</b> Open it from your hero bar.';
    return true;
  }
  // open a box: a needle sweeps the meter; stop it in the gold for the biggest spell
  function openBox() {
    if (!ST.box || V.boxing || V.b.state !== 1) return;
    V.boxing = true;
    var o = H('div', 'brbox'), t0 = performance.now(), P = 1000, done = false, raf = 0;
    o.innerHTML = '<div class="card"><small>🎁 SPELL BOX</small><b>Stop it in the gold!</b><div class="brmeter"><span class="z1"></span><span class="z2"></span><span class="z3"></span><i></i></div><p>Tap here or press Space</p></div>';
    document.body.appendChild(o);
    var card = o.querySelector('.card'), needle = o.querySelector('i');
    var pos = function () { var u = ((performance.now() - t0) % (2 * P)) / P; return u <= 1 ? u : 2 - u; };
    (function anim() { if (done) return; needle.style.left = (pos() * 100) + '%'; raf = requestAnimationFrame(anim); })();
    var key = function (e) { if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); stop(); } };
    document.addEventListener('keydown', key, true);
    var auto = setTimeout(stop, 4500);
    card.onclick = stop;
    function stop() {
      if (done) return; done = true; clearTimeout(auto); cancelAnimationFrame(raf); document.removeEventListener('keydown', key, true);
      var x = pos(), dx = Math.abs(x - 0.5); needle.style.left = (x * 100) + '%';
      var tier = dx <= 0.04 ? [2.5, '🌟 PERFECT! ×2.5'] : dx <= 0.13 ? [1.6, '✨ GREAT! ×1.6'] : dx <= 0.3 ? [1, 'GOOD'] : [0.4, '😬 Missed the zone ×0.4'];
      var tw = 0, r = Math.random() * SPELLS.reduce(function (a, b) { return a + b.w; }, 0), si = 0;
      for (var i = 0; i < SPELLS.length; i++) { tw += SPELLS[i].w; if (r < tw) { si = i; break; } }
      var S = SPELLS[si], d = S.dud ? 1 : Math.max(1, Math.round((S.lo + Math.random() * (S.hi - S.lo)) * tier[0]));
      ST.box = 0; ST.bxN = (ST.bxN || 0) + 1; ST.bxS = si; ST.bxD = d; ST.dmg += d; keep(); send(); xp(3);
      setTimeout(function () {
        card.innerHTML = '<small>' + tier[1] + '</small><span>' + S.e + '</span><b>' + S.name + '!</b><p>' + (S.dud ? S.dud : '−' + d + ' damage') + '</p>';
        if (root) { spFx({ id: 'spell', e: S.e, sp: S.name }, 'You', d); draw(); }
      }, 450);
      setTimeout(function () { o.classList.add('out'); }, 2600);
      setTimeout(function () { o.remove(); if (V) V.boxing = false; }, 3000);
    }
  }
  // 🎯 the weak spot: after a right answer it glows somewhere on the boss for a moment. Tap it in time: the hit lands twice.
  function aim(d) {
    var a = { d: d, at: Date.now() + 250 + Math.random() * 450, x: 22 + Math.random() * 56, y: 22 + Math.random() * 40 };
    V.aim = a;
    setTimeout(function () { if (V && V.aim === a) { V.aim = null; [].forEach.call(document.querySelectorAll('.brweak,.braimbox'), function (x) { x.remove(); }); } }, a.at - Date.now() + AIM_MS);
    setTimeout(placeAim, Math.max(0, a.at - Date.now()));
  }
  function placeAim() {
    if (!root || !V || !V.aim) return;
    var a = V.aim, now = Date.now(); if (now < a.at || now >= a.at + AIM_MS) return;
    if (root.querySelector('.brweak')) return;
    // on the boss when it's on screen; otherwise (a phone scrolled down) in a strip under the feedback
    var stage = root.querySelector('.brstage'), r = stage && stage.getBoundingClientRect(), sy = r ? r.top + r.height * a.y / 100 : -1, vis = sy > 50 && sy < window.innerHeight - 50, host = stage;
    if (!vis) { var qb = root.querySelector('.brq'); if (!qb) return; host = H('div', 'braimbox'); var fb = qb.querySelector('.fb'); qb.insertBefore(host, fb ? fb.nextSibling : qb.firstChild); }
    var w = el('button', { type: 'button', 'class': 'brweak', 'aria-label': 'Weak spot: tap it' }); w.innerHTML = '<i></i>';
    w.style.left = a.x + '%'; w.style.top = (vis ? a.y : 50) + '%'; w.style.animationDelay = (-(now - a.at)) + 'ms';
    w.onclick = function (e) {
      e.stopPropagation(); if (V.aim !== a) return; V.aim = null; w.remove(); var hb = root.querySelector('.braimbox'); if (hb) hb.remove();
      ST.dmg += a.d; ST.bulls = (ST.bulls || 0) + 1; hitFx('🎯 WEAK SPOT!', a.d, 1); V.shake = 0.5;
      if (ST.fb && ST.fb.ok) ST.fb.html += ' <b>🎯 Weak spot! +' + a.d + '.</b>';
      keep(); sendSoon(); draw();
    };
    host.appendChild(w);
  }
  // 📣 cheers: one every 10 seconds, floating up the class screen with your name
  function cheerBar() {
    var bar = H('div', 'brcheer'), wait = Math.max(0, (ST.cheerAt || 0) + CHEER_MS - Date.now());
    var unlock = function () { if (root) [].forEach.call(root.querySelectorAll('.brch'), function (x) { x.disabled = false; }); };
    EMO.forEach(function (e, i) {
      var bt = el('button', { type: 'button', 'class': 'brch', 'aria-label': 'Cheer ' + e }); bt.textContent = e; bt.disabled = wait > 0;
      bt.onclick = function () {
        if (Date.now() < (ST.cheerAt || 0) + CHEER_MS) return;
        ST.cheerAt = Date.now(); ST.em = (ST.em || 0) + 1; ST.emi = i; keep(); send(); cheerFx(e, 'You');
        [].forEach.call(root.querySelectorAll('.brch'), function (x) { x.disabled = true; });
        setTimeout(unlock, CHEER_MS);
      };
      bar.appendChild(bt);
    });
    if (wait > 0) setTimeout(unlock, wait);
    return bar;
  }
  // pick a hero: before the first question
  function drawPick(box) {
    box.classList.add('pick');
    box.appendChild(H('p', 'kick', 'Choose your hero'));
    box.appendChild(H('p', 'brrule', 'Every right answer charges your special. When it\'s full, press it for a big move.'));
    var I = hinfo(), nx = A.hero ? A.hero.need(I.lv + 1) : 0, got = [I.perks.sp ? 'special +' + I.perks.sp + ' damage' : '', I.perks.ch ? 'start with ' + I.perks.ch + ' charge' + (I.perks.ch > 1 ? 's' : '') : '', I.perks.loot > 1 ? 'more loot' : ''].filter(Boolean);
    var nu = A.hero ? A.hero.unlock[I.lv + 1] : '';
    box.appendChild(H('div', 'brlvcard', '<b>⭐ Level ' + I.lv + ' · ' + esc(I.title) + '</b><i><u style="width:' + I.pct + '%"></u></i><small>' + I.xp + ' / ' + nx + ' XP' + (got.length ? ' · 🔓 ' + got.join(', ') : '') + (nu ? '<br>Next level: ' + esc(nu) : '') + '</small>'));
    var g = H('div', 'brheroes'); box.appendChild(g);
    HEROES.forEach(function (h, i) {
      var c = el('button', { type: 'button', 'class': 'brpickc' }); c.style.setProperty('--hc', h.col);
      c.innerHTML = '<span>' + h.e + '</span><b>' + h.name + '</b><i>' + h.sp + '</i><small>' + h.txt + '</small>';
      c.onclick = function () { ST.hero = i; keep(); send(); snd('block'); draw(); };
      g.appendChild(c);
    });
  }
  function drawStun(box) {
    box.classList.add('stun');
    var left = Math.ceil((ST.stunUntil - Date.now()) / 1000);
    box.appendChild(H('p', 'brstun', '😵<b>STUNNED!</b><span>Back in ' + left + ' s</span>'));
    setTimeout(function () { if (root) draw(); }, 1000);
  }
  // the boss targets me: one question, 15 seconds. Right: dodge and hit back. Wrong or too slow: stunned.
  function targeted(b) { return A.MODE === 'student' && A.S.me && b.tg.st === 1 && b.tg.fps.indexOf(sh3(A.S.me.sid)) >= 0 && ST.tg[b.tg.no] == null && b.state === 1 && !b.win; }
  function tgAnswer(ok) {
    var b = V.b; if (ST.tg[b.tg.no] != null) return;
    ST.tg[b.tg.no] = ok ? 1 : 0;
    xp(ok ? 10 : 1);
    if (ok) { ST.dg++; ST.dmg += DODGE; charge(2); hitFx('DODGED!', DODGE, 1); SFA.toast('🌀 Dodged! You hit back for ' + DODGE + ' and charged your special.', 3000); }
    else { ST.sn++; ST.stunUntil = Date.now() + STUN_MS; ST.streak = 0; V.shake = 1; snd('hurt'); }
    keep(); send(); draw();
  }
  function drawTarget(box) {
    var b = V.b, q = tgQ(b), B = bossOf(b);
    box.classList.add('atk', 'tg');
    box.appendChild(H('p', 'kick', '🎯 ' + esc(B.name.toUpperCase()) + ' IS TARGETING YOU! · <span class="brtgt">' + tgLeft(b) + ' s</span>'));
    box.appendChild(H('p', 'brrule', 'Get it right to dodge and hit back for ' + DODGE + '. Wrong or too slow: stunned for ' + STUN_MS / 1000 + ' seconds.'));
    if (!q) { box.appendChild(H('p', 'q', 'Loading…')); return; }
    box.appendChild(H('p', 'q', A.fmt(q.q)));
    if (q.fig) { var f = H('div', 'cfig'); try { f.appendChild(A.figure(q.fig)); box.appendChild(f); } catch (e) { } }
    if (q.k === 'number') {
      var inp = el('input', { type: 'text', inputmode: 'decimal', placeholder: 'Type a number', 'aria-label': 'Dodge', autocomplete: 'off' }), go = el('button', { type: 'button', 'class': 'btn primary', text: '🌀 Dodge' }), row = H('div', 'row');
      row.appendChild(inp); row.appendChild(go); box.appendChild(row);
      var chk = function () { var v = A.numOf(inp.value); if (!inp.value.trim() || isNaN(v)) return inp.focus(); tgAnswer(Math.abs(v - q.ans) <= (q.tol || 1e-9) + 1e-9); };
      go.onclick = chk; inp.onkeydown = function (e) { if (e.key === 'Enter') chk(); };
    } else {
      var list = H('div', 'opts'); box.appendChild(list);
      q.opts.forEach(function (o, k) { var bt = el('button', { type: 'button', 'class': 'opt' }); bt.appendChild(H('span', 'L', A.letter(k))); bt.appendChild(H('span', 't', A.fmt(o))); bt.onclick = function () { tgAnswer(k === q.ans); }; list.appendChild(bt); });
    }
  }
  // the question to answer next: warm-ups (review only), then the pool in this student's own order
  function nextQ() {
    var b = V.b, pool = POOLS[b.mode]; if (!pool) return null;
    if (!ST.easy) { ST.easy = easyQs(); ST.ei = 0; keep(); }   // both modes: five integer warm-ups first
    if (ST.ei < ST.easy.length) return ST.easy[ST.ei];
    if (!pool.length) return null;
    if (!V.order) {
      var r = rng((A.S.me ? parseInt(sh3(A.S.me.sid), 36) * 977 : 1) + Math.round(ST.id / 1000) % 100000), core = [], star = [];
      pool.forEach(function (q) { (q.star ? star : core).push(q.ci); });
      // exit ticket: this lesson's core questions first, then the ★ ones; review: all mixed
      V.order = b.mode === 1 ? shuffle(core, r).concat(shuffle(star, r)) : shuffle(core.concat(star), r);
    }
    return pool[V.order[ST.qi % V.order.length]];
  }
  function drawQ(box) {
    box.innerHTML = '';
    var b = V.b;
    if (b.state !== 1) { box.appendChild(H('p', 'q', 'Time is up.')); return; }
    if (!POOLS[b.mode]) { box.appendChild(H('p', 'q', 'Loading questions…')); return; }
    var q = nextQ(); if (!q) { box.appendChild(H('p', 'q', 'No questions found.')); return; }
    var warm = q.easy, exitN = b.mode === 1 && !warm ? (ST.qi % V.order.length) + 1 : 0;
    box.appendChild(H('p', 'kick', (warm ? '🌱 Warm-up ' + (ST.ei + 1) + ' of ' + ST.easy.length + ' · integers · ' + EASY_D + ' damage' : b.mode === 1 ? 'Exit ticket · question ' + exitN + (ST.qi >= V.order.length ? ' (round 2: for damage only)' : '') : 'From ' + esc(q.from || 'earlier')) + (q.star ? ' · ★ bonus damage' : '') + ' · answer to attack'));
    box.appendChild(H('p', 'q', A.fmt(q.q)));
    if (q.fig) { var f = H('div', 'cfig'); try { f.appendChild(A.figure(q.fig)); box.appendChild(f); } catch (e) { } }
    if (ST.fb) {
      box.appendChild(H('div', ST.fb.ok ? 'fb good' : 'fb try', ST.fb.html));
      var wait = Math.max(0, ST.cool - Date.now()), nx = el('button', { type: 'button', 'class': 'btn primary', text: wait ? 'Next in ' + Math.ceil(wait / 1000) : 'Next question ▶' });
      if (wait) { nx.disabled = true; setTimeout(function () { if (root) draw(); }, 1000); }
      nx.onclick = function () { ST.fb = null; if (q.easy) { ST.ei++; if (ST.ei === ST.easy.length) SFA.toast('⚔️ Warmed up! Now the real questions: 10 damage each, double for three in a row.', 4500); } else ST.qi++; ST.tries = 0; keep(); draw(); };
      box.appendChild(nx); return;
    }
    // the first time a student meets a question counts for the exit ticket: 1 right first try, 2 right second try, 0 wrong
    function mark(v) { if (q.easy || q.ci == null || ST.qi >= V.order.length || ST.res[q.ci] != null) return; ST.res[q.ci] = v; }
    function right() {
      var first = !ST.tries; ST.hits++; ST.n++;
      if (q.easy) {   // warm-ups: a tiny scratch; streaks and critical hits are for the real questions
        ST.dmg += EASY_D; charge(1); xp(4); ST.fb = { ok: true, html: '<b>🗡️ Scratch! ' + EASY_D + ' damage.</b> Warm-ups are small hits, but they charge your special.' };
        hitFx('You', EASY_D, 0); sendSoon(); keep(); draw(); return;
      }
      ST.streak = first ? ST.streak + 1 : 0; ST.best = Math.max(ST.best, ST.streak);
      var sure = ST.buffs.crit > 0, crit = (first && ST.streak >= 3) || sure, d = first ? 10 : 5, dbl = ST.buffs.dbl > 0, song = songLeft(V.b) ? 5 : 0, combo = CMUL[V.b.combo] || 1;
      if (sure) ST.buffs.crit--; if (dbl) ST.buffs.dbl--;
      if (crit) d *= 2; if (q.star) d = Math.round(d * 1.5); if (dbl) d *= 2; d = Math.round((d + song) * combo);
      ST.dmg += d; mark(first ? 1 : 2); charge(1); xp(first ? 10 : 5);
      var extra = [crit && !sure ? '🔥 ' + ST.streak + ' in a row' : '', sure ? '🎯 sure crit' : '', dbl ? '💥 double' : '', song ? '🎸 +5' : '', combo > 1 ? '⚡ combo x' + combo : ''].filter(Boolean).join(' · ');
      ST.fb = { ok: true, html: '<b>' + (crit ? '💥 CRITICAL HIT! ' : '⚔️ Hit! ') + d + ' damage.</b>' + (extra ? ' ' + extra + '.' : first && ST.streak === 2 ? ' One more in a row for a critical hit.' : '') };
      hitFx('You', d, crit); if (!maybeLoot(crit)) maybeBox(); aim(d); sendSoon(); keep(); draw();
    }
    function wrong() { xp(1); if (!q.easy) ST.streak = 0; ST.n++; mark(0); ST.cool = Date.now() + (q.easy ? 2000 : 4000); ST.fb = { ok: false, html: '<b>The answer is ' + esc(q.k === 'poll' ? A.letter(q.ans) : A.numTxt(q.ans)) + '.</b> ' + A.fmt(q.why || '') }; sendSoon(); keep(); draw(); }
    if (q.k === 'number') {
      var inp = el('input', { type: 'text', inputmode: 'decimal', placeholder: 'Type a number', 'aria-label': 'Answer', autocomplete: 'off' }), go = el('button', { type: 'button', 'class': 'btn primary', text: '⚔️ Attack' }), row = H('div', 'row');
      row.appendChild(inp); row.appendChild(go); box.appendChild(row);
      if (ST.tries) box.appendChild(H('p', 'state', 'Not yet: one more try (half damage).'));
      var check = function () { var v = A.numOf(inp.value); if (!inp.value.trim() || isNaN(v)) return inp.focus(); if (Math.abs(v - q.ans) <= (q.tol || 1e-9) + 1e-9) right(); else if (!ST.tries) { ST.tries = 1; keep(); draw(); } else wrong(); };
      go.onclick = check; inp.onkeydown = function (e) { if (e.key === 'Enter') check(); };
    } else {
      var list = H('div', 'opts'); box.appendChild(list);
      q.opts.forEach(function (o, k) { var bt = el('button', { type: 'button', 'class': 'opt' }); bt.appendChild(H('span', 'L', A.letter(k))); bt.appendChild(H('span', 't', A.fmt(o))); bt.onclick = function () { if (k === q.ans) right(); else wrong(); }; list.appendChild(bt); });
    }
  }
  // the boss attack: everyone gets the same question, one try, 20 seconds
  function drawAtk(box) {
    var b = V.b, a = b.atk, q = atkQ(b), B = bossOf(b), mine = ST.atk[a.no];
    box.classList.add('atk');
    if (a.st === 1) {
      box.appendChild(H('p', 'kick', '⚠️ BOSS ATTACK: ' + B.atk + ' · <span class="bratkt">' + atkLeft(b) + ' s</span>'));
      box.appendChild(H('p', 'brrule', 'Everyone gets this one. If 60% of the answers are right, the class blocks it and everyone who got it right counter-attacks for ' + COUNTER + '.'));
      if (!q) { box.appendChild(H('p', 'q', 'Loading…')); return; }
      box.appendChild(H('p', 'q', A.fmt(q.q)));
      if (q.fig) { var f = H('div', 'cfig'); try { f.appendChild(A.figure(q.fig)); box.appendChild(f); } catch (e) { } }
      if (mine != null) { box.appendChild(H('div', 'fb ' + (mine ? 'good' : 'try'), '<b>Locked in.</b> ' + (mine ? '✅ You got it.' : '❌ Not that one.') + ' Waiting for the rest of the class…')); return; }
      if (atkLeft(b) <= 0) { box.appendChild(H('p', 'state', 'Time! Waiting for the result…')); return; }
      var answer = function (ok) { ST.atk[a.no] = ok ? 1 : 0; xp(ok ? 10 : 1); keep(); send(); draw(); };
      if (q.k === 'number') {
        var inp = el('input', { type: 'text', inputmode: 'decimal', placeholder: 'Type a number', 'aria-label': 'Block', autocomplete: 'off' }), go = el('button', { type: 'button', 'class': 'btn primary', text: '🛡️ Block' }), row = H('div', 'row');
        row.appendChild(inp); row.appendChild(go); box.appendChild(row);
        var chk = function () { var v = A.numOf(inp.value); if (!inp.value.trim() || isNaN(v)) return inp.focus(); answer(Math.abs(v - q.ans) <= (q.tol || 1e-9) + 1e-9); };
        go.onclick = chk; inp.onkeydown = function (e) { if (e.key === 'Enter') chk(); };
      } else {
        var list = H('div', 'opts'); box.appendChild(list);
        q.opts.forEach(function (o, k) { var bt = el('button', { type: 'button', 'class': 'opt' }); bt.appendChild(H('span', 'L', A.letter(k))); bt.appendChild(H('span', 't', A.fmt(o))); bt.onclick = function () { answer(k === q.ans); }; list.appendChild(bt); });
      }
    } else {
      box.appendChild(H('p', 'kick', a.blocked ? '🛡️ BLOCKED!' : '💥 THE BOSS HIT THE CLASS'));
      box.appendChild(H('p', 'q', '<b>' + a.right + ' of ' + a.of + '</b> got it right' + (a.of ? ' (' + Math.round(100 * a.right / a.of) + '%)' : '') + '. ' + (a.blocked ? (mine === 1 ? 'Your counter-attack hit for ' + COUNTER + '!' : 'Your classmates counter-attacked.') : 'It healed ' + (V.lastHeal || 0) + ' HP.')));
      if (q) box.appendChild(H('div', 'fb ' + (mine === 1 ? 'good' : 'try'), '<b>The answer: ' + esc(q.k === 'poll' ? A.letter(q.ans) + ', ' + String(q.opts[q.ans]).replace(/\*/g, '') : A.numTxt(q.ans)) + '.</b> ' + A.fmt(q.why || '')));
      box.appendChild(H('p', 'muted', 'Back to attacking in a few seconds…'));
    }
  }

  // the class screen (and the teacher's view): the boss huge, the top five, and the attacks for everyone to see
  function drawClass(body, stage) {
    var b = V.b, side = H('div', 'brside'); body.appendChild(side);
    if (b.atk.st && !b.win && b.state === 1) {
      var q = atkQ(b), a = b.atk, box = H('div', 'brq atk'); side.appendChild(box);
      if (a.st === 1) {
        box.appendChild(H('p', 'kick', '⚠️ ' + bossOf(b).atk + ' · <span class="bratkt">' + atkLeft(b) + ' s</span>'));
        box.appendChild(H('p', 'brrule', 'Answer on your device! 60% right blocks it.'));
        if (q) { box.appendChild(H('p', 'q', A.fmt(q.q))); if (q.fig) { var f = H('div', 'cfig'); try { f.appendChild(A.figure(q.fig)); box.appendChild(f); } catch (e) { } } if (q.k === 'poll') { var ol = H('div', 'bropts'); q.opts.forEach(function (o, k) { ol.appendChild(H('p', '', '<b>' + A.letter(k) + '</b> ' + A.fmt(o))); }); box.appendChild(ol); } }
        box.appendChild(H('p', 'brcnt', '<b>' + a.of + '</b> answered'));
      } else {
        box.appendChild(H('p', 'kick', a.blocked ? '🛡️ BLOCKED!' : '💥 THE BOSS HIT'));
        box.appendChild(H('p', 'q', '<b>' + a.right + ' of ' + a.of + '</b> right' + (a.of ? ' (' + Math.round(100 * a.right / a.of) + '%)' : '') + (a.blocked ? '. Counter-attack!' : '. It healed ' + (V.lastHeal || 0) + ' HP.')));
        if (q) box.appendChild(H('div', 'fb good', '<b>The answer: ' + esc(q.k === 'poll' ? A.letter(q.ans) + ', ' + String(q.opts[q.ans]).replace(/\*/g, '') : A.numTxt(q.ans)) + '.</b> ' + A.fmt(q.why || '')));
      }
    }
    if (b.tg.st === 1 && b.state === 1 && !b.win) side.appendChild(H('div', 'brq atk tg', '<p class="kick">🎯 TARGETED · <span class="brtgt">' + tgLeft(b) + ' s</span></p><p class="q"><b>' + b.tg.names.map(esc).join(', ') + '</b>: answer to dodge, or get stunned!</p>'));
    var lb = H('div', 'brlead'); lb.appendChild(H('h3', '', '⚔️ Top damage'));
    if (!b.top.length) lb.appendChild(H('p', 'muted', 'Answer questions to attack!'));
    b.top.forEach(function (t, i) { lb.appendChild(H('p', '', '<span>' + ['🥇', '🥈', '🥉', '4.', '5.'][i] + '</span> <b>' + esc(t.n) + '</b>' + (t.lv > 1 ? '<em class="brlvs">Lv ' + t.lv + '</em>' : '') + ' <i>' + t.d + '</i>')); });
    lb.appendChild(H('p', 'muted', b.n + ' raiders · ' + (b.max - Math.max(0, b.hp) + b.heal) + ' damage so far'));
    // the class combo, big: the more students hit within a few seconds of each other, the harder everyone hits
    if (b.state === 1) side.appendChild(H('p', 'brcheerhint', 'Cheer from your device: ' + EMO.join(' ')));
    if (b.state === 1) side.appendChild(H('div', 'brlead brcombo c' + b.combo, '<h3>⚡ Class combo</h3><p class="brcm"><b>x' + CMUL[b.combo] + '</b>' + ['', '', ' Nice!', ' MAX!'][b.combo] + '</p><p class="muted">Hit together! The more of you land a hit within a few seconds, the more damage everyone does (up to x2).</p>' + (b.shields ? '<p>🛡️ <b>' + b.shields + '</b> knight shield' + (b.shields > 1 ? 's' : '') + ' up: the next failed block is covered.</p>' : '')));
    side.appendChild(lb);
    if (V.watch) { var x = el('button', { type: 'button', 'class': 'btn bbback', text: '✕ Back to the console' }); x.onclick = function () { close(); }; root.appendChild(x); }
  }
  // the end: the boss is down (or got away), the MVPs, and each student's own result
  function ending(body) {
    var b = V.b, B = bossOf(b), p = H('div', 'brend' + (b.win ? ' win' : ''));
    var head = b.win ? '<h1>BOSS DEFEATED!</h1><p>The class took down ' + esc(B.name) + '.</p>' : '<h1>IT GOT AWAY…</h1><p>' + esc(B.name) + ' escaped with <b>' + Math.max(0, b.hp) + ' HP</b> left (' + Math.round(100 * Math.max(0, b.hp) / b.max) + '%). So close!</p>';
    var mvp = b.top.slice(0, 3).map(function (t, i) { return '<div class="brmvp"><span>' + ['🥇', '🥈', '🥉'][i] + '</span><b>' + esc(t.n) + '</b><i>' + t.d + ' damage' + (t.s >= 3 ? ' · 🔥 ' + t.s + ' streak' : '') + '</i></div>'; }).join('');
    var mine = '';
    if (A.MODE === 'student') {
      var got = 0, of = 0; Object.keys(ST.res || {}).forEach(function (k) { of++; if (ST.res[k] === 1) got++; });
      if (ST.hits || ST.n) xp(30 + (b.win ? 30 : 0), true);
      var I = hinfo();
      mine = '<p class="brmine">⭐ Level ' + I.lv + ' ' + esc(I.title) + ' · ' + I.xp + ' XP</p><p class="brmine">You dealt <b>' + ST.dmg + '</b> damage with ' + ST.hits + ' hit' + (ST.hits === 1 ? '' : 's') + (ST.best >= 3 ? ', best streak ' + ST.best : '') + '.' + (b.mode === 1 && of ? ' Exit ticket: <b>' + got + ' of ' + of + '</b> right first time.' : '') + '</p>';
    }
    p.innerHTML = '<div class="in">' + head + (mvp ? '<div class="brmvps">' + mvp + '</div>' : '') + mine + '</div>';
    body.appendChild(p);
    if (b.win && !V.partied) { V.partied = true; var n = 0; (function c() { if (!root || n++ > 5) return; A.confetti(); setTimeout(c, 900); })(); }
  }

  var sendT = null;
  function send() {
    clearTimeout(sendT); if (A.MODE !== 'student' || !V) return;
    var x = ''; Object.keys(ST.res || {}).forEach(function (k) { k = +k; while (x.length < k) x += '.'; x = x.slice(0, k) + ST.res[k] + x.slice(k + 1); });
    var at = Object.keys(ST.atk || {}).slice(-12).map(function (k) { return k + '.' + ST.atk[k]; }).join(',');
    A.record({ id: QID, k: 'open' }, 'r1;id:' + Math.round(V.id / 1000) + ';d:' + ST.dmg + ';h:' + ST.hits + ';n:' + ST.n + ';b:' + ST.best + (at ? ';a:' + at : '') + (ST.hero != null ? ';hr:' + ST.hero : '') + ';sp:' + (ST.spUsed || 0) + ';dg:' + (ST.dg || 0) + ';sn:' + (ST.sn || 0) + ';lv:' + hinfo().lv + (ST.em ? ';em:' + ST.em + '.' + ST.emi : '') + (ST.bxN ? ';bx:' + ST.bxN + '.' + ST.bxS + '.' + ST.bxD : '') + (x ? ';x:' + x.slice(0, 340) : ''), null);
  }
  function sendSoon() { clearTimeout(sendT); sendT = setTimeout(send, 2000); }

  /* =========================== the teacher console =========================== */
  function C() { return A.console_().raid; }
  function active() {
    var ids = {}; A.rosterIn().forEach(function (r) { ids[r.sid] = r; });
    var here = {}; (A.consoleAnswers() || []).forEach(function (a) { if (ids[a.sid] && !A.beforeRun(a)) here[a.sid] = 1; });
    return Object.keys(here);
  }
  function nameOf(sid) { var r = A.rosterIn().filter(function (x) { return x.sid === sid; })[0]; return r ? clean(A.first(r.name).replace(/[^A-Za-zÀ-ÿ' -]/g, '')) : ''; }
  function start(mode, mins, bossI) {
    var who = active(), n = Math.max(4, who.length), t = Math.round(Date.now() / 1000) * 1000, dur = Math.round((mins || 6) * 60);
    var max = Math.min(9999, Math.max(600, Math.round(n * PER * dur / 360 / 10) * 10));
    if (bossI == null || bossI < 0) bossI = Math.floor(Math.random() * BOSSES.length);
    var seen = {}; who.forEach(function (s) { seen[s] = 1; });
    A.console_().raid = { id: t, state: 1, mode: mode ? 1 : 0, boss: bossI, dur: dur, max: max, hp: max, heal: 0, win: false, per: Math.round(PER * dur / 360), seen: seen,
      atk: { no: 0, st: 0, q: 0, at: 0, right: 0, of: 0, blocked: 0, shielded: 0 }, nextAtk: ATK_FIRST, rows: {}, ev: [], seq: 0, hist: [], lastPush: 0,
      combo: 1, songEnd: 0, shields: 0, lastHit: {}, tg: { no: 0, st: 0, q: 0, at: 0, sids: [] }, nextTg: 18, tgSeen: {} };
    loadPool(mode ? 1 : 0, function () { A.consolePanel(); });
    A.pushLive(); A.consolePanel();
  }
  function agg() {
    var K = C(); if (!K) return;
    if (!A.rosterIn().length) return;
    var key2 = 'id:' + Math.round(K.id / 1000) + ';', last = {}, changed = false, quiet = !!K.restored;
    (A.consoleAnswers() || []).forEach(function (a) { if (a.q === QID && String(a.answer).indexOf(key2) >= 0 && (!last[a.sid] || String(a.time) >= String(last[a.sid].time))) last[a.sid] = a; });
    var tot = 0, ar = 0, ao = 0, fresh = [], cheers = 0;
    Object.keys(last).forEach(function (sid) {
      var s = String(last[sid].answer), get = function (k) { var m = s.match(new RegExp(';' + k + ':(-?\\d+)')); return m ? +m[1] : 0; };
      var atks = {}; ((s.match(/;a:([0-9.,]*)/) || [, ''])[1]).split(',').filter(Boolean).forEach(function (p) { var q = p.split('.'); atks[q[0]] = +q[1]; });
      var row = { d: get('d'), h: get('h'), n: get('n'), b: get('b'), a: atks, x: (s.match(/;x:([0-2.]*)/) || [, ''])[1], hr: /;hr:\d/.test(s) ? get('hr') : -1, sp: get('sp'), dg: get('dg'), sn: get('sn'), lv: get('lv') || 1, em: 0, emi: 0 };
      var emm = s.match(/;em:(\d+)\.(\d)/); if (emm) { row.em = +emm[1]; row.emi = +emm[2]; }
      row.bx = 0; var bxm = s.match(/;bx:(\d+)\.(\d)\.(\d+)/); if (bxm) { row.bx = +bxm[1]; row.bxs = +bxm[2]; row.bxd = +bxm[3]; }
      // someone who arrived after the start: in the first half the boss gets tougher, so a bigger class still has a fight
      if (!K.seen[sid]) { K.seen[sid] = 1; if (K.state === 1 && !quiet && Date.now() - K.id < K.dur * 500) { var add = Math.min(9999 - K.max, K.per || PER); K.max += add; changed = true; } }
      var old = K.rows[sid] || (quiet ? row : { d: 0, sp: 0, dg: 0, sn: 0, em: 0, bx: 0 }), was = old.d, nm = nameOf(sid), e0 = elapsed(K);
      if (K.state === 1) {
        // specials, dodges and stuns first (each with its own banner), then whatever damage is left as an ordinary hit
        var h = HEROES[row.hr] || HEROES[0], hd = h.d + spBonus(row.lv), dsp = Math.max(0, row.sp - (old.sp || 0)), ddg = Math.max(0, row.dg - (old.dg || 0)), dsn = Math.max(0, row.sn - (old.sn || 0));
        for (var i = 0; i < Math.min(dsp, 3); i++) {
          fresh.push({ n: nm, d: hd, k: 10 + HEROES.indexOf(h) });
          if (h.id === 'knight') K.shields = Math.min(3, (K.shields || 0) + 1);
          if (h.id === 'bard') K.songEnd = Math.max(K.songEnd || 0, Math.round(e0) + SONG);
        }
        for (var j = 0; j < Math.min(ddg, 2); j++) fresh.push({ n: nm, d: DODGE, k: 3 });
        if (dsn) fresh.push({ n: nm, d: 0, k: 4 });
        var nbx = row.bx > (old.bx || 0) && row.bxs < SPELLS.length;
        if (nbx) fresh.push({ n: nm, d: row.bxd, k: 30 + row.bxs });
        var dd = row.d - was - dsp * hd - ddg * DODGE - (nbx ? row.bxd : 0);
        if (dd > 0) fresh.push({ n: nm, d: dd, k: dd >= 20 ? 1 : 0 });
        if (row.d > was) K.lastHit[sid] = Date.now();
      }
      // a cheer (at most three a round, so hits still get through)
      if (row.em > (old.em || 0) && cheers < 3 && row.emi < EMO.length) { cheers++; fresh.push({ n: nm, d: 0, k: 5 + row.emi }); }
      if (!K.rows[sid] || K.rows[sid].d !== row.d || K.rows[sid].n !== row.n) changed = true;
      K.rows[sid] = row; tot += row.d;
      if (K.atk.st === 1 && atks[K.atk.no] != null) { ao++; ar += atks[K.atk.no] ? 1 : 0; }
    });
    delete K.restored;
    if (fresh.length) { K.ev = K.ev.concat(fresh).slice(-8); K.seq += fresh.length; changed = true; }
    if (comboNow(K)) changed = true;
    if (K.atk.st === 1 && (ao !== K.atk.of || ar !== K.atk.right)) { K.atk.of = ao; K.atk.right = ar; changed = true; }
    K.tot = tot;
    var hp = Math.max(0, Math.min(K.max, K.max - tot + K.heal));
    if (hp !== K.hp) { K.hp = hp; changed = true; }
    if (K.state === 1 && K.hp <= 0) { K.win = true; end(); return; }
    if (K.state === 1 && K.atk.st === 1 && ao > 0 && ao >= Object.keys(K.rows).length) { resolveAttack(); return; }   // everyone has answered: no need to wait
    if (changed) { (A.pushNow || A.pushLive)(); A.consolePanel(); }
  }
  function elapsed(K) { return (Date.now() - K.id) / 1000; }
  // the class combo: how many different students hit in the last 9 seconds, against how many are raiding
  function comboNow(K) {
    var now = Date.now(), hitters = Object.keys(K.lastHit || {}).filter(function (s) { return now - K.lastHit[s] < 9000; }).length, raiders = Math.max(1, Object.keys(K.rows).length);
    var c = hitters >= 3 && hitters >= raiders * 0.5 ? 3 : hitters >= 2 && hitters >= raiders * 0.25 ? 2 : 1;
    if (K.state !== 1) c = 1;
    if (c !== K.combo) { K.combo = c; return true; }
    return false;
  }
  // the boss targets two or three students who are raiding (not the same ones every time)
  function startTarget() {
    var K = C(), e = elapsed(K), now = Date.now();
    var pool = Object.keys(K.rows).filter(function (s) { return now - (K.lastHit[s] || 0) < 120000 || K.rows[s].n > 0; });
    if (!pool.length) { K.nextTg = e + 15; return; }
    pool.sort(function (a, b) { return (K.tgSeen[a] || 0) - (K.tgSeen[b] || 0) || Math.random() - 0.5; });
    var n = Math.min(pool.length, pool.length >= 12 ? 3 : 2), who = pool.slice(0, n);
    who.forEach(function (s) { K.tgSeen[s] = (K.tgSeen[s] || 0) + 1; });
    K.tg = { no: K.tg.no + 1, st: 1, q: Math.floor(Math.random() * 9999), at: Math.round(e), sids: who };
    K.nextTg = e + TG_WIN + 25 + Math.random() * 15;
    (A.pushNow || A.pushLive)(); A.consolePanel();
  }
  function startAttack() {
    var K = C(), e = elapsed(K);
    K.atk = { no: K.atk.no + 1, st: 1, q: Math.floor(Math.random() * 9999), at: Math.round(e), right: 0, of: 0, blocked: 0 };
    K.nextAtk = e + ATK_WIN + (K.hp / K.max <= 0.2 ? ATK_EVERY - 20 : ATK_EVERY);
    (A.pushNow || A.pushLive)(); A.consolePanel();
  }
  function resolveAttack() {
    var K = C(), a = K.atk;
    a.blocked = a.of > 0 && a.right / a.of >= BLOCK ? 1 : 0;
    var heal = a.blocked ? 0 : Math.min(Math.round(K.max * HEAL), K.max - Math.max(0, K.hp));   // it can't heal past full
    a.shielded = 0; if (heal && K.shields > 0) { K.shields--; a.shielded = 1; heal = 0; }   // a knight's shield takes it
    if (heal) { K.heal += heal; K.hp = Math.min(K.max, K.hp + heal); }
    a.st = 2; K.hist.push({ no: a.no, q: a.q, right: a.right, of: a.of, blocked: a.blocked, heal: heal });
    (A.pushNow || A.pushLive)(); A.consolePanel();
  }
  function end() { var K = C(); if (!K) return; if (K.state === 1 && A.trophy) { var TB = BOSSES[K.boss % BOSSES.length]; A.trophy({ k: 'raid', id: K.id, win: !!K.win, boss: TB.e + ' ' + TB.name, mode: MODES[K.mode], left: K.max ? Math.round(100 * Math.max(0, K.hp) / K.max) : 0, n: Object.keys(K.rows).length }); } K.state = 2; if (K.atk.st) K.atk.st = 0; K.endedAt = Date.now(); A.pushLive(); A.consolePanel(); }
  /* catch-up both ways. Crushing it: the boss gets a second wind and heals. Too slow: a class hitting too slowly to finish gets a weaker boss. From the last minute's damage rate, if the boss
     wouldn't fall by 90% of the time, its health drops to what would (at most 35% at a time; never tougher). */
  function catchUp(e, early) {
    var K = C(), s = K.samp || [], tot = K.tot || 0, old = null;
    for (var i = 0; i < s.length; i++) if (s[i][0] >= e - 60) { old = s[i]; break; }
    if (!old || e - old[0] < 20) return;
    var rate = (tot - old[1]) / (e - old[0]), proj = tot + rate * Math.max(0, K.dur * 0.9 - e) - K.heal;
    var hpNow = Math.max(0, K.max - tot + K.heal), finish = rate > 0 ? e + hpNow / rate : 1e9;
    // crushing it (on pace to win before three quarters of the clock): SECOND WIND, the boss heals so the finish
    // lands near the end. At most twice a raid, never more than 35% at once
    if ((finish < K.dur * 0.75 || early) && (K.winds || 0) < 2) {
      var h = Math.min(Math.round(tot + rate * (K.dur * 0.92 - e) - K.heal - K.max), Math.round(K.max * 0.35), K.max - hpNow);
      if (h < 30) return;
      h = Math.round(h / 10) * 10; K.winds = (K.winds || 0) + 1;
      K.heal += h; K.hp = Math.max(0, Math.min(K.max, K.max - tot + K.heal));
      K.ev = K.ev.concat([{ n: '', d: h, k: 20 }]).slice(-8); K.seq++;
      (A.pushNow || A.pushLive)(); A.consolePanel(); return;
    }
    if (early || proj >= K.max) return;
    var nm = Math.round(Math.max(proj, K.max * 0.65, tot - K.heal + 40) / 10) * 10;
    if (nm >= K.max) return;
    K.max = nm; K.hp = Math.max(0, Math.min(K.max, K.max - tot + K.heal));
    K.ev = K.ev.concat([{ n: '', d: 0, k: 2 }]).slice(-8); K.seq++;
    (A.pushNow || A.pushLive)(); A.consolePanel();
  }
  function tick() {
    var K = C(); if (!K) return;
    var e = elapsed(K);
    if (K.state === 1) {
      if (e >= K.dur) end();
      else if (K.atk.st === 0 && e >= K.nextAtk && K.dur - e > ATK_WIN + 10) startAttack();
      else if (K.atk.st === 1 && e >= K.atk.at + ATK_WIN + ATK_GRACE) resolveAttack();
      else if (K.atk.st === 2 && e >= K.atk.at + ATK_WIN + ATK_GRACE + ATK_SHOW) { K.atk.st = 0; (A.pushNow || A.pushLive)(); A.consolePanel(); }
      // targets: not during a boss attack, and not just before one
      if (K.tg.st === 1 && e >= K.tg.at + TG_WIN + 4) { K.tg.st = 0; (A.pushNow || A.pushLive)(); }
      else if (K.tg.st === 0 && K.atk.st === 0 && e >= K.nextTg && K.nextAtk - e > TG_WIN + 6 && K.dur - e > TG_WIN + 8) startTarget();
      if (comboNow(K)) (A.pushNow || A.pushLive)();
      K.samp = K.samp || []; if (!K.samp.length || e - K.samp[K.samp.length - 1][0] >= 5) { K.samp.push([e, K.tot || 0]); if (K.samp.length > 40) K.samp.shift(); }
      if (!K.adj1 && e >= K.dur * 0.4) { K.adj1 = 1; catchUp(e); }
      else if (!K.adj2 && e >= K.dur * 0.65) { K.adj2 = 1; catchUp(e); }
      else if ((K.winds || 0) < 2 && K.hp < K.max * 0.25 && e < K.dur * 0.7 && e - (K.windAt || -99) > 20) { K.windAt = e; catchUp(e, true); }   // nearly down far too early
    }
    if (Date.now() - K.lastPush >= 6000) { K.lastPush = Date.now(); (A.pushNow || A.pushLive)(); if (K.state === 1) A.consolePanel(); }
    if (root && V && V.watch) apply(watchState());
  }
  function counts(out) {
    var K = C(); if (!K) return;
    out.zrid = A.encRun(K.id); out.zrst = A.encRun(K.id + (A.console_().skew || 0));
    out.zrs = [K.state, K.mode, K.boss, Math.min(9999, K.dur), K.max, Math.max(0, K.hp), K.win ? 1 : 0, Math.min(9999, Object.keys(K.rows).length || Object.keys(K.seen).length), Math.min(9999, K.heal), K.combo || 1, Math.min(9999, K.songEnd || 0), K.shields || 0];
    out.zra = [K.atk.no, K.atk.st, K.atk.q, Math.min(9999, K.atk.at), K.atk.right, K.atk.of, K.atk.blocked ? 1 : 0, K.atk.shielded ? 1 : 0];
    out.zrt = [K.tg.no, K.tg.st, K.tg.q, Math.min(9999, K.tg.at)];
  }
  function topOf(K) { return Object.keys(K.rows).map(function (s) { return { n: nameOf(s), d: K.rows[s].d, s: K.rows[s].b, lv: K.rows[s].lv || 1 }; }).filter(function (t) { return t.d > 0; }).sort(function (a, b) { return b.d - a.d; }).slice(0, 5); }
  function spot() {
    var K = C();
    var G = K.tg.st === 1 ? '#G:' + K.tg.sids.map(function (s) { return sh3(s) + '~' + nameOf(s); }).join(',') : '';
    return { q: 'zraid', text: ('T:' + topOf(K).map(function (t) { return t.n + '~' + t.d + '~' + t.s + '~' + t.lv; }).join(',') + G + '#L:' + K.seq + '|' + K.ev.map(function (e) { return clean(e.n) + '~' + e.d + '~' + e.k; }).join(',')).slice(0, 600) };
  }
  function restore(Lv) {
    var b = raidOf(Lv); if (!b) return false;
    if (b.state === 2 || Date.now() - b.id > b.dur * 1000 + 60000) { A.console_().raid = null; return false; }
    A.console_().raid = { id: b.id, state: b.state, mode: b.mode, boss: b.boss, dur: b.dur, max: b.max, hp: b.hp, heal: b.heal, win: b.win, per: Math.round(PER * b.dur / 360), seen: {},
      atk: { no: b.atk.no, st: b.atk.st, q: b.atk.q, at: b.atk.at, right: b.atk.right, of: b.atk.of, blocked: b.atk.blocked ? 1 : 0, shielded: b.atk.shielded ? 1 : 0 }, nextAtk: Math.max(ATK_FIRST, b.atk.at + ATK_WIN + ATK_EVERY), rows: {}, ev: [], seq: b.seq, hist: [], lastPush: 0, restored: true,
      combo: 1, songEnd: b.songEnd, shields: b.shields, lastHit: {}, tg: { no: b.tg.no, st: 0, q: 0, at: 0, sids: [] }, nextTg: Math.round((Date.now() - b.id) / 1000) + 20, tgSeen: {} };
    loadPool(b.mode, function () { A.consolePanel(); });
    return true;
  }
  function watchState() {
    var K = C(), out = {}; counts(out);
    var b = raidOf({ lesson: A.LID, counts: out, spot: spot() }); b.start = K.id; return b;
  }
  function watch() { var b = watchState(); open(b); V.watch = true; apply(b); }
  function plain(t) { return String(t || '').replace(/\*/g, '').replace(/<[^>]+>/g, ''); }
  // the exit ticket: each student's first tries, and the questions the class found hardest
  function report(K) {
    var pool = POOLS[K.mode]; if (!pool) return null;
    var per = pool.map(function () { return { r: 0, n: 0 }; }), studs = [];
    Object.keys(K.rows).forEach(function (sid) {
      var x = K.rows[sid].x || '', got = 0, of = 0;
      for (var i = 0; i < x.length && i < pool.length; i++) { if (x[i] === '.') continue; of++; per[i].n++; if (x[i] === '1') { got++; per[i].r++; } }
      studs.push({ sid: sid, name: nameOf(sid), got: got, of: of, d: K.rows[sid].d });
    });
    studs.sort(function (a, b) { return (a.of ? a.got / a.of : 2) - (b.of ? b.got / b.of : 2) || a.of - b.of; });
    var hard = per.map(function (p, i) { return { i: i, r: p.r, n: p.n }; }).filter(function (p) { return p.n >= 2 && p.r < p.n; }).sort(function (a, b) { return a.r / a.n - b.r / b.n; }).slice(0, 3);
    return { pool: pool, studs: studs, hard: hard };
  }
  function section(p) {
    var K = C(), B = BOSSES[K.boss % BOSSES.length], sec = H('div', 'sect');
    sec.appendChild(H('h3', '', '👹 Boss Raid · ' + esc(MODES[K.mode]) + ' · ' + B.e + ' ' + esc(B.name)));
    var left = Math.max(0, Math.round(K.dur - elapsed(K))), raiders = Object.keys(K.rows).length;
    sec.appendChild(H('p', '', (K.state === 1 ? '<b>' + Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2) + '</b> left · ' : K.win ? '<b>🏆 Boss defeated!</b> · ' : '<b>Time: it got away.</b> ') + 'HP <b>' + Math.max(0, K.hp) + ' / ' + K.max + '</b> · ' + raiders + ' raider' + (raiders === 1 ? '' : 's') + (K.atk.st === 1 ? ' · ⚠️ attack on: ' + K.atk.right + ' of ' + K.atk.of + ' right so far' : '')));
    var hc = [0, 0, 0, 0]; Object.keys(K.rows).forEach(function (sid) { if (K.rows[sid].hr >= 0) hc[K.rows[sid].hr % 4]++; });
    sec.appendChild(H('p', 'muted', 'Heroes: ' + HEROES.map(function (h, i) { return h.e + ' ' + hc[i]; }).join(' · ') + (K.combo > 1 ? ' · ⚡ combo x' + CMUL[K.combo] : '') + (K.shields ? ' · 🛡️ ' + K.shields + ' shield' + (K.shields > 1 ? 's' : '') : '') + (K.tg.st === 1 ? ' · 🎯 targeting ' + K.tg.sids.map(nameOf).join(', ') : '')));
    var r = H('div', 'row');
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: '👁 Show the boss', title: 'The boss on this screen', onclick: function () { watch(); } }));
    if (K.state === 1 && K.atk.st === 0 && K.dur - elapsed(K) > ATK_WIN + 10) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '⚠️ Boss attack now', onclick: function () { startAttack(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '⏰ +1 minute', onclick: function () { K.dur += 60; A.pushLive(); A.consolePanel(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: 'End it now', onclick: function () { end(); } }));
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: 'Back to the lesson', onclick: function () { A.console_().raid = null; if (root) close(); A.pushLive(); A.consolePanel(); } }));
    sec.appendChild(r);
    var pool = POOLS[K.mode];
    if (K.hist.length) sec.appendChild(H('p', 'muted', '<b>Boss attacks:</b> ' + K.hist.map(function (h) { var q = pool ? atkList(pool)[h.q % atkList(pool).length] : null; return (h.blocked ? '🛡️ ' : '💥 ') + h.right + '/' + h.of + (h.of ? ' (' + Math.round(100 * h.right / h.of) + '%)' : '') + (q ? ' “' + esc(plain(q.q).slice(0, 60)) + '”' : ''); }).join(' · ')));
    var rep = report(K);
    if (rep && rep.studs.length) {
      sec.appendChild(H('p', 'muted', '<b>' + (K.mode === 1 ? 'Exit ticket' : 'Review') + ', first tries (lowest first):</b> ' + rep.studs.map(function (s) { var pc = s.of ? s.got / s.of : 0; return (!s.of ? '⚪ ' : pc >= 0.8 ? '🟢 ' : pc >= 0.5 ? '🟡 ' : '🔴 ') + esc(s.name) + ' ' + s.got + '/' + s.of; }).join(' · ')));
      if (rep.hard.length) sec.appendChild(H('p', 'muted', '<b>Hardest for the class:</b> ' + rep.hard.map(function (h) { return Math.round(100 * h.r / h.n) + '% right on “' + esc(plain(rep.pool[h.i].q).slice(0, 80)) + '”'; }).join(' · ')));
      var cp = el('button', { type: 'button', 'class': 'btn small', text: '📋 Copy results' });
      cp.onclick = function () {
        var lines = ['Name\tRight first time\tAnswered\tDamage'].concat(rep.studs.map(function (s) { return s.name + '\t' + s.got + '\t' + s.of + '\t' + s.d; }));
        lines.push(''); lines.push('Question\tRight first time\tAnswered');
        rep.pool.forEach(function (q, i) { var n = 0, g = 0; rep.studs.forEach(function (s) { var x = (K.rows[s.sid].x || '')[i]; if (x && x !== '.') { n++; if (x === '1') g++; } }); if (n) lines.push(plain(q.q).replace(/\s+/g, ' ') + '\t' + g + '\t' + n); });
        try { navigator.clipboard.writeText(lines.join('\n')).then(function () { SFA.toast('Copied. Paste it into a spreadsheet.', 2500); }); } catch (e) { SFA.toast('Couldn\'t copy here.', 2500); }
      };
      sec.appendChild(cp);
    }
    p.appendChild(sec);
  }
  (A.every || function (f, ms) { setInterval(f, ms); })(function () { if (A.MODE === 'teach' && A.console_() && C()) tick(); }, 1000);

  window.SFA_RAID = { sync: sync, agg: agg, section: section, start: start, counts: counts, spot: spot, restore: restore, raidOf: raidOf, BOSSES: BOSSES, drawBoss: boss };
})();
