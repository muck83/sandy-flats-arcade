/* 🎩 Sure Thing!: the fair's quiz show, hosted by Gary the goat (in a bow tie). Loaded by sfa-lesson.js (after
   sfa-crewkit.js) when the teacher starts one.

   Everyone gets the SAME question at the same time (this lesson's questions through the crew kit's pool, the way-in
   ones first). Each student answers, then says HOW SURE they are before anyone knows who is right:
       🌱 Careful   right +2   wrong +1  (a "brave try" chip: a careful miss still earns)
       🎯 Sure      right +5   wrong −2
       🚀 ALL IN    right +10  wrong −10
   Betting what you honestly believe is the best plan: Sure beats Careful only when you are right more than half the
   time, ALL IN beats Sure only above about 6 in 10.

   Nobody gets crushed:
   - everyone starts on 20 chips and the goat's safety net means nobody can ever hold fewer than 10;
   - THE POT belongs to the whole class. Every question it grows by up to 4 chips a head, by the share of the class
     that locked in an answer (right or wrong). On a question where the share reaches the target (80% unless the
     teacher picks another), it is a FULL HOUSE: the pot pays that many chips to EVERY student and starts again. So the
     class wants its quiet students in, and a wrong answer helps exactly as much as a right one;
   - COMEBACK ROUNDS (the middle question and the last one): anyone at or under the class's middle stack wins double;
   - the awards at the end spread the glory (bravest bet, best comeback, steadiest hand, most improved, the goat's
     favourite) and every avatar is on stage. There is no table and no last place on any screen.

   Sync: each student's row (q "zsrx1": "g1;id:<game>;a:<one token per question, joined by _>", a token is bet 1-3,
   r or w, then the answer) goes to the Sheet. The console works everything out again from the rows each time (so a
   reloaded console loses nothing) and publishes the show in the live counts: zsrid/zsrst the start; zsrs state,
   length, question, phase, questions, players, locked in, auto, deadline, crew list number, pot, phase time; zsrq the
   questions (pool numbers); zsrp what the pot paid after each question; zsrc each question's comeback line; zsrm
   target, seconds, full houses, the pot's last growth, share, chips won, % right, questions scored; zsrv the split at the reveal;
   zsra the awards. The spotlight (spot.q "zsr") carries a page of the crew's names and avatars and, for a number
   question, "#S:" the class's most common answers. */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API, SFA = window.SFA, T = window.SFA_CREW;
  var H = A.H, el = A.el, esc = SFA.esc;
  var QID = 'zsrx1', START = 20, FLOOR = 10, POTMAX = 4, GAP = 16000, DRUM = 2800, POTAT = 5600;
  var BET = [null, { n: 'Careful', e: '🌱', w: 2, l: 1, c: 'b1' }, { n: 'Sure', e: '🎯', w: 5, l: -2, c: 'b2' }, { n: 'ALL IN', e: '🚀', w: 10, l: -10, c: 'b3' }];
  var AWARDS = [
    { e: '🚀', n: 'Bravest bet', f: function (v) { return 'Went ALL IN on question ' + v + ' and nailed it'; } },
    { e: '🪃', n: 'Best comeback', f: function (v) { return 'Climbed ' + v + ' chips back from their lowest point'; } },
    { e: '🧊', n: 'Steadiest hand', f: function (v) { return v + ' spot-on call' + (v === 1 ? '' : 's') + ': bold when sure, careful when not'; } },
    { e: '📈', n: 'Most improved', f: function () { return 'Got stronger and stronger as the show went on'; } },
    { e: '🐐', n: 'The goat\'s favourite', f: function (v) { return 'Locked in an answer ' + v + ' time' + (v === 1 ? '' : 's') + '. Gary noticed.'; } }
  ];
  var SAY = {
    open: ['Baa-rilliant to see you. Lock in an answer, then tell me how sure you are.', 'No peeking at your neighbour. I have rectangular pupils. I see everything.', 'Fresh question, hot off the hay bale.', 'Remember: a careful bet can never lose a chip.', 'Answer first. Bet second. Panic never.', 'I ate the easy questions. Kidding. This one is fine.', 'Take your time. I am a goat. I have nowhere to be.', 'Trust your working, not your neighbour\'s face.'],
    cb: ['COMEBACK ROUND! If your stack is small, your wins count double.', 'Comeback round: the back of the herd gets double. I love an underdog. Undergoat.'],
    last: ['Last question! Small stacks win double. Make it count.', 'The grand finale. Straighten your bow ties.'],
    wait: ['The pot is hungry. Who is still thinking?', 'Every answer feeds the pot. Even a wild guess.', 'I need more of you in. Right or wrong, the pot does not care.', 'Still waiting on a few. Nudge your neighbour (gently).'],
    drum: ['The class has spoken. Drum roll, please…', 'Hooves crossed, everyone…', 'Here is how the herd voted…', 'Locked. Sealed. Let\'s see it…'],
    hi: ['Look at that! You lot are on fire.', 'Nearly everyone! I am one proud goat.', 'That is how it\'s done. Someone feed these people.'],
    mid: ['A split herd! The best kind of question.', 'Half of you are grinning. Half are not.', 'Close one. Read the answer, it comes back.'],
    lo: ['Ooh, a tricky one. That was sneaky of me.', 'That one bit back. Careful bets look clever now.', 'Tough crowd, tough question. Shake it off.'],
    full: ['FULL HOUSE! The pot pays everybody. EVERYBODY!', 'That is a full house. Chips for the whole herd!', 'You filled the house, so I empty the pot. Fair is fair.'],
    pot: ['The pot grows. Get a full house and it is all yours.', 'I am keeping the pot warm until more of you answer.', 'So close to a full house. Bring a friend next question.'],
    end: ['What a show. Take a bow, all of you.', 'I have hosted worse. I have never hosted better.', 'That\'s the show! The goat is proud.']
  };

  function fx() { return window.SFA_FX || {}; }
  function parseTok(s) { var m = /^([123])([rw])(.*)$/.exec(s || ''); return m ? { b: +m[1], ok: m[2] === 'r', a: m[3] } : null; }
  function isCb(i, n) { return n >= 4 && (i === n - 1 || i === Math.ceil(n / 2) - 1); }
  // one student's show so far: the same sum on the student's device and on the console
  function tally(toks, lines, paid, upTo) {
    var c = START, dip = null, o = { steps: [], right: 0, n: 0, calls: 0, caught: 0, hi: START };
    for (var i = 0; i < upTo; i++) {
      var t = toks[i] || null, st = { c0: c, d: 0, cb: false, net: false, tok: t };
      if (t) {
        var B = BET[t.b]; st.cb = lines[i] > 0 && c <= lines[i]; st.d = t.ok ? B.w * (st.cb ? 2 : 1) : B.l;
        o.n++; if (t.ok) o.right++; if ((t.ok && t.b >= 2) || (!t.ok && t.b === 1)) o.calls++;
      }
      c += st.d; if (c < FLOOR) { c = FLOOR; st.net = true; o.caught++; }
      st.c1 = c; if (st.d < 0 && (dip == null || c < dip)) dip = c;
      c += paid[i] || 0; st.c2 = c; o.steps.push(st); if (c > o.hi) o.hi = c;
    }
    o.c = c; o.climb = dip == null ? 0 : Math.max(0, c - dip);
    return o;
  }
  function pickLine(k, seed) { var a = SAY[k]; return a[Math.abs(seed) % a.length]; }
  function qTxt(Q) { return String(Q.q || '').replace(/^\s*[*_]?Warm-up \d+ of \d+[.:]?[*_]?\s*/i, ''); }
  function numKey(v) { return String(Math.round(v * 1000) / 1000); }

  function gameOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zsrs) || !Array.isArray(c.zsrid)) return null;
    var z = c.zsrs, m = c.zsrm || [], id = A.decRun(c.zsrid), start = A.MODE === 'screen' ? id : A.decRun(c.zsrst) || id;
    var sp = Lv.spot && Lv.spot.q === 'zsr' ? String(Lv.spot.text || '') : '', sm = /#S:(\d+)\|([^#]*)/.exec(sp), tops = null;
    if (sm) tops = { qi: +sm[1], list: sm[2] ? sm[2].split(',').map(function (x) { var p = x.split('~'); return { t: p[0], n: +p[1] || 0, ok: p[2] === 'r' }; }) : [] };
    return { id: id, start: start, state: z[0], dur: z[1] || 600, qi: z[2] || 0, ph: z[3] || 0, nq: z[4] || 1, n: z[5] || 0, ans: z[6] || 0, auto: !!z[7], dead: z[8] || 0, ep: z[9] || 0, pot: z[10] || 0, phAt: z[11] || 0,
      qs: c.zsrq || [], paid: c.zsrp || [], lines: c.zsrc || [], target: m[0] || 80, secs: m[1] || 45, jack: m[2] || 0, add: m[3] || 0, share: m[4] || 0, won: m[5] || 0, rightPct: m[6] || 0, allRight: m[7] || 0, done: m[8] || 0,
      split: c.zsrv || [], aw: c.zsra || [], sp: sp, tops: tops };
  }
  function upTo(b) { return b.state === 2 ? Math.min(b.nq, b.done) : b.qi + (b.ph === 1 ? 1 : 0); }

  /* =========================== student page and class screen =========================== */
  var root = null, V = null, ST = null, crew = T.Crew();
  function key() { return 'sure.' + A.LID; }
  function keep() { if (ST) SFA.store.set(key(), ST); }
  function xp(n, tag) { if (A.hero && ST && A.MODE === 'student') A.hero.add('st', String(Math.round(ST.id / 1000)) + (tag || ''), n, !!tag); }
  function myFp() { return A.S && A.S.me ? T.sh3(A.S.me.sid) : ''; }
  function stu() { return A.MODE === 'student' && !(V && V.watch); }
  function Qof(b) { return T.pool()[b.qs[b.qi]] || null; }
  function g(sel) { return root ? root.querySelector(sel) : null; }

  function sync() {
    if (A.MODE === 'teach') return;   // the console shows the stage only when the teacher asks (watch)
    var Lv = A.live(), b = A.isLive() || A.MODE === 'screen' ? gameOf(Lv) : null;
    if (b && T.sNow() - b.start > b.dur * 1000 + 180000) b = null;   // long over: gone
    if (A.MODE === 'student' && A.saving() && !A.S.me) b = null;
    if (!b) { close(); return; }
    if (!root || V.id !== b.id) open(b);
    apply(b);
  }
  function goat(cls) {
    var k = '#141428';
    return '<svg class="' + (cls || 'sthgoat') + '" viewBox="0 0 200 236" aria-hidden="true">' +
      '<path d="M34 236c0-44 28-66 66-66s66 22 66 66z" fill="#2B1B63" stroke="' + k + '" stroke-width="5"/>' +
      '<path d="M100 176l-17 60h34z" fill="#FFF7E8"/>' +
      '<g class="sthear"><path d="M56 88C30 78 12 86 6 102c18 8 38 4 52-6z" fill="#E9DFC8" stroke="' + k + '" stroke-width="5" stroke-linejoin="round"/></g>' +
      '<g class="sthear r"><path d="M144 88c26-10 44-2 50 14-18 8-38 4-52-6z" fill="#E9DFC8" stroke="' + k + '" stroke-width="5" stroke-linejoin="round"/></g>' +
      '<path d="M76 54C62 34 62 14 76 2c6 16 14 26 24 40z" fill="#C9A66B" stroke="' + k + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M124 54c14-20 14-40 0-52-6 16-14 26-24 40z" fill="#C9A66B" stroke="' + k + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M100 38c-32 0-50 22-50 50 0 24 12 36 20 52 6 13 16 20 30 20s24-7 30-20c8-16 20-28 20-52 0-28-18-50-50-50z" fill="#FBF5E6" stroke="' + k + '" stroke-width="5"/>' +
      '<path d="M88 158c2 16 6 24 12 30 6-6 10-14 12-30z" fill="#E9DFC8" stroke="' + k + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<ellipse cx="100" cy="128" rx="27" ry="21" fill="#FFD3BF" stroke="' + k + '" stroke-width="4"/>' +
      '<ellipse cx="91" cy="121" rx="3.5" ry="5" fill="' + k + '"/><ellipse cx="109" cy="121" rx="3.5" ry="5" fill="' + k + '"/>' +
      '<path class="sthmouth" d="M86 134c8 9 20 9 28 0" fill="none" stroke="' + k + '" stroke-width="4" stroke-linecap="round"/>' +
      '<g class="stheyes"><ellipse cx="76" cy="88" rx="12" ry="13" fill="#FFE14D" stroke="' + k + '" stroke-width="4"/><rect x="68" y="84.5" width="16" height="7" rx="3.5" fill="' + k + '"/>' +
      '<ellipse cx="124" cy="88" rx="12" ry="13" fill="#FFE14D" stroke="' + k + '" stroke-width="4"/><rect x="116" y="84.5" width="16" height="7" rx="3.5" fill="' + k + '"/></g>' +
      '<path d="M62 70c8-6 18-7 26-3M138 70c-8-6-18-7-26-3" fill="none" stroke="' + k + '" stroke-width="4" stroke-linecap="round"/>' +
      '<g class="sthtie"><path d="M100 200l-34-17v34zM100 200l34-17v34z" fill="#FF4D6D" stroke="' + k + '" stroke-width="5" stroke-linejoin="round"/><circle cx="100" cy="200" r="8.5" fill="#FF7A90" stroke="' + k + '" stroke-width="5"/></g>' +
      '</svg>';
  }
  function open(b) {
    close();
    var saved = SFA.store.get(key(), null);
    ST = saved && saved.id === b.id ? saved : { id: b.id, t: [], pick: null, x: {}, done: 0 };
    V = { id: b.id, b: b, ep: b.ep, sawOpen: -1, rv: null, chips: null }; crew = T.Crew();
    var S = A.MODE === 'student';
    root = H('div', 'sth ' + (S ? 'student' : 'screen')); root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Sure Thing!');
    root.innerHTML = '<div class="sthbeam a"></div><div class="sthbeam b"></div><div class="sthbeam c"></div>' +
      '<header class="sthtop"><h1 class="sthlogo"><span>🎩</span> SURE THING!</h1><span class="sthpill" id="sthQ"></span><span class="sthpill" id="sthT"></span><span class="sthsp"></span>' +
      (S ? '<span class="sthpill chips" id="sthC" title="Your chips">🪙 <b>' + START + '</b></span>' : '<span class="sthpill" id="sthN"></span>') + '</header>' +
      '<div class="sthmain"><aside class="sthhost"><div class="sthsay" aria-live="polite"></div>' + goat() + '<small>Gary, your host</small></aside>' +
      '<section class="sthboard"></section>' +
      '<aside class="sthpot"><p class="sthpk">The pot</p><div class="sthjar"><span>🪙</span><b id="sthP">0</b><small>for everyone</small></div><div class="sthmeter"><i><u></u><s></s></i></div><p class="sthpl" id="sthL"></p></aside></div>' +
      (S ? '<section class="sthme"></section>' : '') + '<section class="sthend" hidden></section>';
    document.body.appendChild(root); document.body.classList.add('crwing');
    var F = fx(); if (F.speaker) { try { var sp = F.speaker('sthspk'); if (sp) g('.sthtop').appendChild(sp); } catch (e) { } }
    V.tick = setInterval(function () { if (root) drawTop(); }, 500);
  }
  function close() {
    if (!root) return; clearInterval(V.tick); (V.timers || []).forEach(clearTimeout);
    root.remove(); root = null; V = null; document.body.classList.remove('crwing');
    var x = document.querySelector('.sthwatch'); if (x) x.remove();
  }
  function later(fn, ms) { (V.timers = V.timers || []).push(setTimeout(function () { if (root && V) fn(); }, ms)); }

  // 0 the question is open · 1 the drum roll (the class's split) · 2 the answer · 3 the pot · 9 the awards
  function stage() {
    var b = V.b; if (b.state === 2) return 9; if (b.ph !== 1) return 0;
    if (!V.rv || V.rv.qi !== b.qi) {
      var lateIn = V.sawOpen !== b.qi;   // opened in the middle of a reveal: no replay
      V.rv = { qi: b.qi, t0: Date.now() - (lateIn ? 99999 : 0), did: lateIn ? { 1: 1, 2: 1, 3: 1 } : {} };
      if (!lateIn) { later(render, DRUM + 20); later(render, POTAT + 20); }
    }
    var e = Date.now() - V.rv.t0; return e < DRUM ? 1 : e < POTAT ? 2 : 3;
  }
  function mine() { return (ST ? ST.t : []).map(parseTok); }
  function myTally(n) { return tally(mine(), V.b.lines, V.b.paid, n); }
  function myChips(s) {
    var b = V.b, n = upTo(b); if (b.state === 2 || s === 0) return myTally(n).c;
    var t = myTally(n), st = t.steps[b.qi]; if (!st) return t.c;
    return s === 1 ? st.c0 : s === 2 ? st.c1 : st.c2;
  }

  function apply(b) {
    V.b = b;
    if (b.ep !== V.ep) { V.ep = b.ep; crew = T.Crew(); }
    crew.take(b.sp);
    if (b.state === 1 && b.ph === 0) {
      if (V.sawOpen !== b.qi) { V.sawOpen = b.qi; V.rv = null; V.openAt = Date.now(); if (V.sawOpenOnce) { var F = fx(); F.sfx && F.sfx('whoosh'); } V.sawOpenOnce = 1; }
    }
    if (stu() && ST.pick && ST.pick.qi !== b.qi) { ST.pick = null; keep(); }
    render();
  }
  function render() {
    if (!root || !V) return;
    var b = V.b, s = stage();
    root.className = 'sth ' + (stu() ? 'student' : 'screen') + ' s' + s + (b.state === 1 && b.lines[b.qi] > 0 ? ' cb' : '');
    drawTop(); drawPot(s); drawHost(s); effects(s);
    if (stu()) setChips(myChips(s), s === 2);
    var me = g('.sthme'); if (me) me.hidden = s === 9;
    if (s === 9) { drawEnd(); return; }
    g('.sthend').hidden = true; g('.sthmain').hidden = false;
    drawBoard(s); if (stu()) drawMe(s);
  }
  function timeLeft() { var b = V.b; return b.dead && b.ph === 0 && b.state === 1 ? Math.max(0, Math.ceil((b.start + b.dead * 1000 - T.sNow()) / 1000)) : -1; }
  function drawTop() {
    if (!root || !V) return;
    var b = V.b, tl = timeLeft(), q = g('#sthQ'), t = g('#sthT'), h;
    h = b.state === 2 ? 'The awards' : (stu() ? 'Q <b>' : 'Question <b>') + (b.qi + 1) + '</b> of ' + b.nq; if (q._h !== h) { q._h = h; q.innerHTML = h; }
    h = tl >= 0 ? '⏱ <b>' + tl + '</b>' : ''; if (t._h !== h) { t._h = h; t.innerHTML = h; t.className = 'sthpill' + (tl >= 0 && tl <= 5 ? ' hot' : ''); if (tl >= 0 && tl <= 5 && tl > 0 && b.ph === 0) { var F = fx(); F.sfx && F.sfx('tick'); } }
    var n = g('#sthN'); if (n) { h = b.state === 2 ? '' : '🔒 <b>' + Math.min(b.ans, b.n) + '</b> of ' + b.n + ' locked in'; if (n._h !== h) { n._h = h; n.innerHTML = h; } }
    // out of time with an answer picked but no bet: it goes in as a careful one
    if (stu() && tl === 0 && ST.pick && ST.pick.qi === b.qi && !ST.t[b.qi]) lock(1);
    else if (stu() && tl === 0 && !V.tz) { V.tz = 1; drawMe(stage()); } else if (tl !== 0) V.tz = 0;
    if (b.state === 1 && b.ph === 0 && V.openAt && Date.now() - V.openAt > 14000 && !V.nag && b.n && b.ans / b.n < 0.6) { V.nag = b.qi + 1; drawHost(0); }
    if (V.nag && V.nag !== b.qi + 1) V.nag = 0;
  }
  function setChips(v, burst) {
    var c = g('#sthC'); if (!c) return; var bEl = c.querySelector('b'), was = V.chips; V.chips = v;
    if (was == null || was === v) { bEl.textContent = v; return; }
    var F = fx(); if (F.countUp) F.countUp(bEl, was, v, 700); else bEl.textContent = v;
    if (v > was) { F.pop && F.pop(c); if (burst) { F.burst && F.burst(c, { emoji: ['🪙'], count: 12, spread: 130 }); } F.float && F.float(c, '+' + (v - was), { color: '#FFE14D', size: 30 }); }
    else { F.float && F.float(c, '−' + (was - v), { color: '#FF8A8A', size: 26 }); F.shake && F.shake(c, { power: 4, ms: 300 }); }
  }
  function drawPot(s) {
    var b = V.b, shown = b.pot, p = g('#sthP');
    // during the drum roll and the answer the pot still shows what it held before this question
    if (b.state === 1 && b.ph === 1 && s < 3) shown = b.paid[b.qi] ? b.paid[b.qi] - b.add : b.pot - b.add;
    shown = Math.max(0, shown);
    if (V.potShown == null) { V.potShown = shown; p.textContent = shown; }
    else if (V.potShown !== shown) { var F = fx(); if (F.countUp) F.countUp(p, V.potShown, shown, 600); else p.textContent = shown; V.potShown = shown; F.pop && F.pop(g('.sthjar')); }
    var share = b.n ? Math.min(1, b.ans / b.n) : 0, need = Math.max(0, Math.ceil(b.n * b.target / 100) - b.ans);
    g('.sthmeter u').style.width = (share * 100) + '%'; g('.sthmeter s').style.left = b.target + '%';
    g('.sthmeter').className = 'sthmeter' + (b.n && need === 0 ? ' full' : '');
    var h = b.state === 2 ? (b.jack ? 'The pot paid everyone <b>' + b.jack + '</b> time' + (b.jack === 1 ? '' : 's') : 'Gary ate what was left') :
      b.ph === 0 ? (need > 0 ? '<b>' + need + '</b> more answer' + (need === 1 ? '' : 's') + ' for a <b>FULL HOUSE</b>: the pot pays everyone' : '<b>FULL HOUSE!</b> The pot pays out at the reveal') :
        s < 3 ? 'Every answer grows it' : b.paid[b.qi] ? '<b>FULL HOUSE!</b> It paid <b>🪙 ' + b.paid[b.qi] + '</b> to everyone' : '+' + b.add + ' this question. A full house (' + b.target + '% answering) pays it out';
    var L = g('#sthL'); if (L._h !== h) { L._h = h; L.innerHTML = h; }
  }
  function drawHost(s) {
    var b = V.b, seed = Math.round(b.id / 1000) + b.qi * 7, k, t;
    if (s === 9) k = 'end';
    else if (s === 0) k = V.nag === b.qi + 1 ? 'wait' : b.qi === b.nq - 1 && b.nq > 1 ? 'last' : b.lines[b.qi] > 0 ? 'cb' : 'open';
    else if (s === 1) k = 'drum';
    else if (s === 2) k = b.rightPct >= 70 ? 'hi' : b.rightPct >= 40 ? 'mid' : 'lo';
    else k = b.paid[b.qi] ? 'full' : 'pot';
    t = b.state === 1 && b.qi === 0 && s === 0 && !V.nag ? 'Welcome to SURE THING! Answer, then bet on yourself.' : pickLine(k, seed);
    var box = g('.sthsay'); if (box._t !== t) { box._t = t; box.textContent = t; box.classList.remove('in'); void box.offsetWidth; box.classList.add('in'); }
    g('.sthhost').className = 'sthhost k-' + k;
  }
  // the one-off effects as each part of the reveal arrives
  function effects(s) {
    if (s < 1 || s > 3 || !V.rv) { if (s === 9 && !V.endFx) { V.endFx = 1; endFx(); } return; }
    var b = V.b, F = fx(), did = V.rv.did, S = stu(), tok = S ? parseTok(ST.t[b.qi]) : null;
    if (s >= 1 && !did[1]) { did[1] = 1; F.sfx && F.sfx('tick'); later(function () { var f2 = fx(); f2.sfx && f2.sfx('tick'); }, 900); later(function () { var f3 = fx(); f3.sfx && f3.sfx('tick'); }, 1800); }
    if (s >= 2 && !did[2]) {
      did[2] = 1;
      if (S) {
        if (tok) {
          var st = myTally(b.qi + 1).steps[b.qi];
          if (tok.ok) { F.sfx && F.sfx(tok.b === 3 ? 'levelup' : 'right'); if (tok.b === 3 || st.cb) A.confetti(); xp(5 + (tok.b >= 2 ? 2 : 0)); }
          else { F.sfx && F.sfx(tok.b === 1 ? 'coin' : 'wrong'); if (tok.b === 1) xp(2); }
        }
      } else {
        F.sfx && F.sfx(b.rightPct >= 50 ? 'win' : 'boom');
        later(function () { var ok = g('.sthopt.ok'); var f2 = fx(); if (ok && f2.burst) f2.burst(ok, { count: 26, spread: 260 }); }, 60);
        if (b.rightPct >= 70) A.confetti();
      }
    }
    if (s >= 3 && !did[3]) {
      did[3] = 1;
      if (b.paid[b.qi]) {
        if (F.banner) F.banner('FULL HOUSE!', { sub: 'The pot pays 🪙 ' + b.paid[b.qi] + ' to everyone', ms: 2600 });
        F.sfx && F.sfx('coin'); if (F.confetti) F.confetti({ emoji: ['🪙'], ms: 1600 }); else A.confetti();
      } else if (b.add) { F.float && F.float(g('.sthjar'), '+' + b.add, { size: S ? 26 : 54 }); F.sfx && F.sfx('coin'); }
    }
  }

  /* ---------- the board: the question, then the class's split, then the answer ---------- */
  function splitTiles(b, Q) {
    var out = [], tot = 0, i;
    if (Q.k === 'poll') { for (i = 0; i < Q.opts.length; i++) { out.push({ L: A.letter(i), html: A.fmt(Q.opts[i]), n: b.split[i] || 0, ok: i === Q.ans, key: String(i) }); tot += b.split[i] || 0; } }
    else {
      var L = b.tops && b.tops.qi === b.qi ? b.tops.list : [], got = false;
      L.forEach(function (x) { if (x.t === '*') { out.push({ L: '…', html: 'other answers', n: x.n, ok: false, key: '*' }); } else { out.push({ L: '', html: esc(String(x.t).replace('-', '−')), n: x.n, ok: x.ok, key: x.t }); if (x.ok) got = true; } tot += x.n; });
      if (!got) out.push({ L: '', html: esc(A.numTxt(Q.ans)), n: 0, ok: true, key: numKey(Q.ans), late: true });
    }
    return { list: out, tot: tot };
  }
  function drawBoard(s) {
    var b = V.b, Q = Qof(b), box = g('.sthboard'), S = stu(), tok = S ? parseTok(ST.t[b.qi]) : null;
    var sig = [b.qi, s, b.split.join('.'), b.tops ? b.tops.list.length : 0, Q ? 1 : 0, s >= 1 && tok ? tok.a : ''].join('|');
    if (box._sig === sig) return; var fresh = box._qi !== b.qi; box._sig = sig; box._qi = b.qi;
    if (!Q) { box.innerHTML = '<p class="sthq">Getting the question…</p>'; return; }
    var cb = b.lines[b.qi] > 0, h = '<p class="sthkick">' + (cb ? '<em>🔥 Comeback round</em> stacks of 🪙 ' + b.lines[b.qi] + ' or less win double' : Q.tier === 0 ? 'Warm-up question' : Q.tier === 1 ? 'Step it up' : '⭐ The tricky one') + '</p>';
    h = '<div class="sthL">' + h + '<p class="sthq">' + A.fmt(qTxt(Q)) + '</p><div class="sthfig"></div></div><div class="sthR">';
    if (s === 0) {
      if (!S) h += Q.k === 'poll' ? '<div class="sthopts">' + Q.opts.map(function (o, i) { return '<div class="sthopt"><span class="L">' + A.letter(i) + '</span><span class="t">' + A.fmt(o) + '</span></div>'; }).join('') + '</div>'
        : '<p class="sthtype">✍️ Work it out, type it on your device, then bet on it.</p>';
    } else {
      var sp = splitTiles(b, Q), tot = Math.max(1, sp.tot);
      h += '<div class="sthopts' + (Q.k === 'poll' ? '' : ' sthnum') + '">' + sp.list.map(function (o) {
        var pc = Math.round(100 * o.n / tot), me = tok && (Q.k === 'poll' ? tok.a === o.key : tok.a === o.key);
        return '<div class="sthopt' + (s >= 2 ? (o.ok ? ' ok' : ' dim') : '') + (me ? ' mine' : '') + (o.late && s < 2 ? ' hid' : '') + '"><i class="bar" data-w="' + pc + '"' + (s > 1 ? ' style="width:' + pc + '%;transition:none"' : '') + '></i>' + (o.L ? '<span class="L">' + o.L + '</span>' : '') + '<span class="t">' + o.html + '</span>' +
          (me ? '<em>you</em>' : '') + '<span class="pc">' + (s >= 2 && o.ok ? '✓ ' : '') + o.n + '</span></div>';
      }).join('') + '</div>';
      var bt = [b.split[6] || 0, b.split[7] || 0, b.split[8] || 0], bn = Math.max(1, bt[0] + bt[1] + bt[2]);
      h += '<div class="sthconf"><span>How sure was the class?</span>' + [1, 2, 3].map(function (k) { return '<b class="' + BET[k].c + '" style="flex:' + Math.max(0.6, bt[k - 1] / bn * 6).toFixed(2) + '">' + BET[k].e + ' ' + BET[k].n + ' <u>' + bt[k - 1] + '</u></b>'; }).join('') + '</div>';
      if (s >= 2) h += '<div class="sthans"><b>✓ ' + esc(Q.k === 'poll' ? A.letter(Q.ans) + ': ' + T.plain(Q.opts[Q.ans]) : A.numTxt(Q.ans)) + '</b> · ' + b.rightPct + '% of the answers were right' + (!S && Q.why && String(Q.why).length < 200 ? '<p>' + A.fmt(Q.why) + '</p>' : '') + '</div>';
    }
    box.innerHTML = h + '</div>'; box.classList.toggle('two', !S && !!Q.fig && s >= 1); box.classList.toggle('st3', s === 3);
    if (Q.fig) { try { box.querySelector('.sthfig').appendChild(A.figure(Q.fig)); } catch (e) { } }
    if (fresh) { box.classList.remove('in'); void box.offsetWidth; box.classList.add('in'); }
    // the bars grow after the first paint
    var bars = box.querySelectorAll('.bar'); if (bars.length) requestAnimationFrame(function () { requestAnimationFrame(function () { [].forEach.call(bars, function (x) { x.style.width = x.getAttribute('data-w') + '%'; }); }); });
    if (bars.length) setTimeout(function () { [].forEach.call(bars, function (x) { x.style.width = x.getAttribute('data-w') + '%'; }); }, 400);   // a hidden tab: land there anyway
  }

  /* ---------- my answer and my bet (student) ---------- */
  function ansLabel(Q, a) { return Q.k === 'poll' ? A.letter(+a) + ': ' + T.plain(Q.opts[+a] || '') : String(a).replace('-', '−'); }
  function lock(bet) {
    var b = V.b, p = ST.pick; if (!p || p.qi !== b.qi || ST.t[b.qi]) return;
    for (var i = 0; i < b.qi; i++) if (!ST.t[i]) ST.t[i] = '';
    ST.t[b.qi] = bet + (p.ok ? 'r' : 'w') + p.a; ST.pick = null; keep(); send(); xp(3);
    var F = fx(); F.sfx && F.sfx('tap'); F.pop && F.pop(g('.sthme'));
    drawMe(stage());
  }
  function drawMe(s) {
    var box = g('.sthme'); if (!box || !V) return;
    var b = V.b, Q = Qof(b), tok = parseTok(ST.t[b.qi]), p = ST.pick && ST.pick.qi === b.qi ? ST.pick : null, tl = timeLeft();
    var sig = [b.qi, s, ST.t[b.qi] || '', p ? p.a : '', tl === 0 ? 'z' : '', Q ? 1 : 0, b.paid[b.qi] || 0, b.add].join('|');
    if (box._sig === sig) return; box._sig = sig; box.innerHTML = '';
    if (!Q) return;
    var before = myTally(b.qi).c, zone = b.lines[b.qi] > 0 && before <= b.lines[b.qi];
    if (s === 0 && !tok) {
      if (tl === 0 && !p) { box.appendChild(H('p', 'sthwait', '⏰ <b>Time!</b> No answer went in this round, so your chips stay put. The next one is yours.')); return; }
      if (!p) {
        box.appendChild(H('p', 'sthstep', '<b>1</b> Your answer'));
        if (Q.k === 'poll') {
          var list = H('div', 'sthopts'); box.appendChild(list);
          Q.opts.forEach(function (op, k) {
            var bt = el('button', { type: 'button', 'class': 'sthopt' }); bt.appendChild(H('span', 'L', A.letter(k))); bt.appendChild(H('span', 't', A.fmt(op)));
            bt.onclick = function () { ST.pick = { qi: b.qi, a: String(k), ok: k === Q.ans }; keep(); var F = fx(); F.sfx && F.sfx('tap'); drawMe(stage()); };
            list.appendChild(bt);
          });
        } else {
          var inp = el('input', { type: 'text', inputmode: 'text', placeholder: 'Type a number', 'aria-label': 'Your answer', autocomplete: 'off' }), go = el('button', { type: 'button', 'class': 'btn primary', text: 'That\'s my answer ▶' }), row = H('div', 'sthrow');
          row.appendChild(inp); row.appendChild(go); box.appendChild(row);
          var check = function () { var v = A.numOf(inp.value); if (!inp.value.trim() || isNaN(v)) { inp.focus(); var F = fx(); F.shake && F.shake(inp, { power: 4, ms: 250 }); return; } ST.pick = { qi: b.qi, a: numKey(v), ok: Math.abs(v - Q.ans) <= (Q.tol || 1e-9) + 1e-9 }; keep(); drawMe(stage()); };
          go.onclick = check; inp.onkeydown = function (e) { if (e.key === 'Enter') check(); };
        }
        box.appendChild(H('p', 'sthnote', 'Not sure? Answer anyway: a <b>Careful</b> bet can\'t lose, and every answer feeds the class pot.'));
        return;
      }
      var pk = H('p', 'sthpicked', 'Your answer: <b>' + esc(ansLabel(Q, p.a)) + '</b> '), ch = el('button', { type: 'button', 'class': 'sthchg', text: 'change' });
      ch.onclick = function () { ST.pick = null; keep(); drawMe(stage()); }; pk.appendChild(ch); box.appendChild(pk);
      box.appendChild(H('p', 'sthstep', '<b>2</b> How sure are you?' + (zone ? ' <em>🔥 Comeback: your wins count double</em>' : '')));
      var bets = H('div', 'sthbets'); box.appendChild(bets);
      [1, 2, 3].forEach(function (k) {
        var B = BET[k], w = B.w * (zone ? 2 : 1), bt = el('button', { type: 'button', 'class': 'sthbet ' + B.c });
        bt.innerHTML = '<span>' + B.e + '</span><b>' + B.n + '</b><small><i>right +' + w + '</i><i>wrong ' + (B.l > 0 ? '+' + B.l : '−' + (-B.l)) + '</i></small>';
        bt.onclick = function () { lock(k); }; bets.appendChild(bt);
      });
      box.appendChild(H('p', 'sthnote', 'You have 🪙 <b>' + before + '</b>. Gary\'s safety net: nobody ever drops below 🪙 ' + FLOOR + '.'));
      return;
    }
    if (!tok) { box.appendChild(H('p', 'sthwait', s >= 2 ? 'No answer from you on this one, so your chips stayed put. <b>The next one is yours.</b>' : '🥁 Here it comes…')); if (s >= 3) potLine(box, b); return; }
    var B = BET[tok.b];
    if (s < 2) { box.appendChild(H('p', 'sthwait', '🔒 <b>Locked in:</b> ' + esc(ansLabel(Q, tok.a)) + ' · ' + B.e + ' ' + B.n + '<br>' + (s === 1 ? '🥁 Here it comes…' : 'Waiting for the reveal. The pot grows with every classmate who answers.'))); return; }
    var st = myTally(b.qi + 1).steps[b.qi], card = H('div', 'sthres ' + (tok.ok ? 'good' : tok.b === 1 ? 'brave' : 'miss')), h;
    if (tok.ok) h = '<h3>✓ RIGHT! <b>+' + st.d + ' 🪙</b></h3><p>' + (st.cb ? '🔥 Comeback round: that win counted double. ' : '') + (tok.b === 3 ? 'ALL IN and right. Gary just dropped his hay.' : tok.b === 2 ? 'Good call: you knew it.' : 'You had it! Next time you can back yourself with a bigger bet.') + '</p>';
    else if (tok.b === 1) h = '<h3>Not this time… <b>+1 🪙</b> brave try</h3><p>You went careful, and that was the smart call. Read the answer below: it comes back.</p>';
    else h = '<h3>✗ Not this time <b>' + (st.c1 - st.c0 === 0 ? '±0' : '−' + (st.c0 - st.c1)) + ' 🪙</b></h3><p>' + (st.net ? '🛟 Gary\'s safety net caught you: you can\'t drop below 🪙 ' + FLOOR + '. ' : '') + 'Being unsure is fine: a Careful bet never loses.</p>';
    card.innerHTML = h; box.appendChild(card);
    var why = H('div', 'sthwhy', '<b>The answer: ' + esc(Q.k === 'poll' ? A.letter(Q.ans) + ': ' + T.plain(Q.opts[Q.ans]) : A.numTxt(Q.ans)) + '</b>' + (Q.steps ? '<ol>' + Q.steps.map(function (x) { return '<li>' + A.fmt(x) + '</li>'; }).join('') + '</ol>' : Q.why ? '<br>' + A.fmt(Q.why) : ''));
    box.appendChild(why);
    if (s >= 3) potLine(box, b);
    if (!tok.ok && tok.b > 1 && !V.rv.did.sh) { V.rv.did.sh = 1; var F = fx(); F.shake && F.shake(card, { power: 5, ms: 350 }); }
  }
  function potLine(box, b) {
    box.appendChild(H('p', 'sthpotl' + (b.paid[b.qi] ? ' paid' : ''), b.paid[b.qi] ? '🎉 <b>FULL HOUSE!</b> The pot paid everyone <b>+' + b.paid[b.qi] + ' 🪙</b>, you included.' : '🏺 The pot grew by ' + b.add + '. It pays everyone when ' + b.target + '% of the class answers.'));
  }
  function send() {
    if (A.MODE !== 'student' || !V || !ST) return;
    A.record({ id: QID, k: 'open' }, 'g1;id:' + Math.round(V.id / 1000) + ';a:' + ST.t.join('_'), null);
  }

  /* ---------- the awards: everyone on stage ---------- */
  function endFx() {
    var F = fx(), n = 0; F.sfx && F.sfx('win');
    (function c() { if (!root || n++ > 2) return; A.confetti(); later(c, 1100); })();
    if (stu() && ST && !ST.done && ST.t.some(function (x) { return !!x; })) { ST.done = 1; keep(); xp(20, 'e'); }
  }
  function drawEnd() {
    var b = V.b, box = g('.sthend'), S = stu(), me = myFp(), i;
    var sig = [crew.key, b.aw.join('.'), b.n, b.won, root.clientWidth > 700 ? 1 : 0].join('|'); if (box._sig === sig) { box.hidden = false; return; }
    box._sig = sig; box.hidden = false; g('.sthmain').hidden = true;
    var h = '<h2>THAT\'S THE SHOW!</h2><p class="sthsum">Together the class won <b>🪙 ' + b.won + '</b> · <b>' + b.allRight + '%</b> of all answers were right · the pot paid everyone <b>' + b.jack + '</b> time' + (b.jack === 1 ? '' : 's') + '</p>';
    if (S) {
      var t = myTally(upTo(b)), mineAw = [];
      for (i = 0; i < AWARDS.length; i++) if (b.aw[i * 2] && crew.get(b.aw[i * 2] - 1).fp === me && me) mineAw.push(AWARDS[i]);
      h += '<div class="sthmine"><p class="sthkick">Your show</p><p class="sthbig">🪙 <b>' + t.c + '</b></p><p>' + (t.n ? '<b>' + t.right + '</b> right out of ' + t.n + ' answered · <b>' + t.calls + '</b> spot-on call' + (t.calls === 1 ? '' : 's') + (t.climb > 0 ? ' · climbed back <b>' + t.climb + '</b>' : '') : 'You watched this one. Next show, one careful answer gets you on the board.') + '</p>' +
        mineAw.map(function (a) { return '<p class="sthwon">' + a.e + ' You won <b>' + a.n + '</b>!</p>'; }).join('') + '</div>';
      if (mineAw.length && !ST.aw) { ST.aw = 1; keep(); xp(10, 'a'); }
    }
    h += '<div class="sthaws">';
    for (i = 0; i < AWARDS.length; i++) {
      var ci = b.aw[i * 2]; if (!ci) continue; var c = crew.get(ci - 1), you = c.fp && c.fp === me;
      h += '<div class="sthaw' + (you ? ' you' : '') + '" style="animation-delay:' + (0.5 + i * 0.45).toFixed(2) + 's"><span class="e">' + AWARDS[i].e + '</span><b>' + AWARDS[i].n + '</b><div class="av">' + (c.fp ? T.av(c.look, S ? 64 : Math.max(80, Math.round(root.clientHeight * 0.13)), false) : '<span class="ph">🙂</span>') + '</div>' +
        '<strong class="' + T.ncls(c.look) + '">' + esc(you ? 'You!' : c.n || '…') + '</strong><small>' + esc(AWARDS[i].f(b.aw[i * 2 + 1] || 0)) + '</small></div>';
    }
    h += '</div>';
    var n = Math.max(b.n, crew.total), per = Math.max(6, Math.min(n, Math.ceil(n / (n > 24 ? 3 : n > 10 ? 2 : 1)))), size = Math.max(30, Math.min(S ? 46 : Math.round(root.clientHeight * 0.17), Math.floor((root.clientWidth || 600) * 0.8 / per) - 6));
    h += '<div class="sthcrowd"><div class="sthgary">' + goat('sthgoat sm') + '<span>' + esc(pickLine('end', Math.round(b.id / 1000))) + '</span></div><div class="sthrowd">';
    for (i = 0; i < n; i++) { var p = crew.get(i); if (!p.fp) continue; h += '<div class="sthp' + (p.fp === me ? ' you' : '') + '" style="width:' + size + 'px;animation-delay:' + (-(i * 0.31) % 2).toFixed(2) + 's">' + T.av(p.look, size, false) + '<span class="crwname ' + T.ncls(p.look) + '">' + esc(p.fp === me ? 'You' : p.n) + '</span></div>'; }
    h += '</div></div>';
    box.innerHTML = h;
  }

  /* =========================== the teacher console =========================== */
  function C() { return A.console_().sure; }
  function push() { var K = C(); if (K) K.lastPush = Date.now(); (A.pushNow || A.pushLive)(); }
  function pickQs(n, seed) {
    var P = T.pool(), r = T.rng(seed), by = [[], [], []], out = [], seen = {};
    var ok = P.filter(function (q) { return T.plain(q.q).length <= 260; }); if (ok.length < Math.min(n, P.length)) ok = P;
    ok.forEach(function (q) { by[q.tier].push(q.ci); }); by = by.map(function (a) { return T.shuffle(a, r); });
    function take(t, k) { while (k > 0 && by[t].length) { var ci = by[t].shift(), kk = T.plain(P[ci].q).slice(0, 70) + '|' + P[ci].ans; if (seen[kk]) continue; seen[kk] = 1; out.push(ci); k--; } }
    take(0, Math.ceil(n * 0.5)); take(1, Math.max(0, n - 1 - out.length)); take(2, n - out.length); take(1, n - out.length); take(0, n - out.length);
    return out.sort(function (a, b) { return P[a].tier - P[b].tier; });
  }
  function start(o) {
    o = o || {};
    if (!T.pool().length) { SFA.toast('This lesson has no number or multiple-choice questions for Sure Thing!', 4500); return false; }
    var t = Math.round(Date.now() / 1000) * 1000, qs = pickQs(Math.max(3, Math.min(8, o.n || 7)), t / 1000 % 99991), K;
    A.console_().sure = K = { id: t, state: 1, nq: qs.length, qs: qs, qi: 0, ph: 0, phAt: Date.now(), auto: o.auto ? 1 : 0, secs: Math.max(20, Math.min(120, o.secs || 45)), dead: 0, target: Math.max(50, Math.min(100, o.target || 80)),
      order: [], idx: {}, rows: {}, raw: {}, lines: [], paid: [], pot: 0, jack: 0, add: 0, share: 0, split: [], tops: '', ansN: 0, rightPct: 0, aw: [], won: 0, allRight: 0, ep: Math.floor(Math.random() * 9000) + 1, page: 0 };
    T.active().forEach(function (sid) { K.idx[sid] = K.order.length; K.order.push(sid); });
    openQ(0); A.consolePanel(); return true;
  }
  function toks(K, sid) { return K.rows[sid] || []; }
  function chipsAll(K, n) { return K.order.map(function (sid) { return tally(toks(K, sid), K.lines, K.paid, n).c; }); }
  function openQ(i) {
    var K = C(), now = Date.now();
    K.qi = i; K.ph = 0; K.phAt = now; K.dead = K.auto ? now + K.secs * 1000 : 0; K.split = []; K.tops = ''; K.add = 0; K.share = 0; K.rightPct = 0;
    for (var j = 0; j < i; j++) { if (K.paid[j] == null) K.paid[j] = 0; if (K.lines[j] == null) K.lines[j] = 0; }
    if (isCb(i, K.nq) && K.order.length) { var cs = chipsAll(K, i).sort(function (a, b) { return a - b; }); K.lines[i] = Math.min(9999, cs[Math.floor((cs.length - 1) / 2)]); } else K.lines[i] = 0;
    K.paid[i] = 0; countAns(K); push();
  }
  function countAns(K) { var n = 0; K.order.forEach(function (sid) { if (toks(K, sid)[K.qi]) n++; }); K.ansN = n; return n; }
  function reveal() {
    var K = C(); if (!K || K.state !== 1 || K.ph !== 0) return;
    agg();   // the newest rows first (a reloaded console may not have counted them yet)
    var Q = T.pool()[K.qs[K.qi]], sp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], nums = {}, n = 0, right = 0;
    K.order.forEach(function (sid) {
      var t = toks(K, sid)[K.qi]; if (!t) return; n++; if (t.ok) right++; sp[5 + t.b]++;
      if (Q && Q.k === 'poll') { if (+t.a >= 0 && +t.a < 6) sp[+t.a]++; } else { var o = nums[t.a] = nums[t.a] || { t: t.a, n: 0, ok: t.ok }; o.n++; }
    });
    sp[9] = right; sp[10] = n; K.split = sp; K.ansN = n;
    var L = Object.keys(nums).map(function (k) { return nums[k]; }).sort(function (a, b) { return b.n - a.n || (b.ok ? 1 : 0) - (a.ok ? 1 : 0); }), top = L.slice(0, 4), rest = 0;
    L.slice(4).forEach(function (x) { if (x.ok) top.push(x); else rest += x.n; });
    K.tops = top.map(function (x) { return String(x.t).replace(/[^0-9.\-]/g, '').slice(0, 9) + '~' + x.n + '~' + (x.ok ? 'r' : 'w'); }).concat(rest ? ['*~' + rest + '~w'] : []).join(',');
    var N = Math.max(1, K.order.length), share = Math.min(1, n / N);
    K.share = Math.round(share * 100); K.add = Math.round(share * POTMAX); K.pot += K.add; K.rightPct = n ? Math.round(100 * right / n) : 0;
    if (n && K.share >= K.target && K.pot > 0) { K.paid[K.qi] = K.pot; K.pot = 0; K.jack++; } else K.paid[K.qi] = 0;
    K.ph = 1; K.phAt = Date.now(); K.dead = 0; push(); A.consolePanel();
  }
  function next() {
    var K = C(); if (!K || K.state !== 1 || K.ph !== 1) return;
    if (K.qi + 1 >= K.nq) finish(); else { openQ(K.qi + 1); A.consolePanel(); }
  }
  function finish() {
    var K = C(); if (!K || K.state !== 1) return;
    var n = K.done = K.qi + (K.ph === 1 ? 1 : 0), P = [], tot = 0, rr = 0, aa = 0, half = Math.floor(n / 2);
    // how hard each question was: the share of answers that were right
    var hard = []; for (var q = 0; q < n; q++) { var a = 0, r = 0; K.order.forEach(function (sid) { var t = toks(K, sid)[q]; if (t) { a++; if (t.ok) r++; } }); hard[q] = a ? r / a : 1; }
    K.order.forEach(function (sid, i) {
      var tk = toks(K, sid), t = tally(tk, K.lines, K.paid, n); tot += t.c - START; rr += t.right; aa += t.n;
      if (!t.n) return;
      var r1 = 0, n1 = 0, r2 = 0, n2 = 0, brave = 0, bq = 0;
      for (var j = 0; j < n; j++) { var x = tk[j]; if (!x) continue; if (j < half) { n1++; if (x.ok) r1++; } else { n2++; if (x.ok) r2++; } if (x.ok && x.b === 3 && 2 - hard[j] > brave) { brave = 2 - hard[j]; bq = j + 1; } }
      P.push({ i: i, h: T.hash(sid + K.id) % 1000 / 1000, t: t, brave: brave, bq: bq, up: n1 && n2 ? r2 / n2 - r1 / n1 : n2 && !n1 ? r2 / n2 * 0.5 : 0 });
    });
    var used = {}, aw = [];
    function give(score, val) {
      var L = P.map(function (p) { return { p: p, s: score(p) }; }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s || a.p.h - b.p.h; });
      var w = L.filter(function (x) { return !used[x.p.i]; })[0] || (P.length <= aw.length / 2 ? L[0] : null);
      if (w) { used[w.p.i] = 1; aw.push(w.p.i + 1, Math.max(0, Math.min(9999, Math.round(val(w.p))))); } else aw.push(0, 0);
    }
    give(function (p) { return p.brave; }, function (p) { return p.bq; });
    give(function (p) { return p.t.climb; }, function (p) { return p.t.climb; });
    give(function (p) { return p.t.n >= Math.max(1, Math.ceil(n / 2)) ? p.t.calls + p.t.calls / p.t.n : 0; }, function (p) { return p.t.calls; });
    give(function (p) { return p.up; }, function (p) { return Math.round(p.up * 100); });
    give(function (p) { return p.t.n + p.h; }, function (p) { return p.t.n; });   // most answers in; a coin flip between ties, so anyone who kept answering can win it
    K.aw = aw; K.won = Math.max(0, Math.min(9999, tot)); K.allRight = aa ? Math.round(100 * rr / aa) : 0;
    if (K.order.length && A.trophy) {
      var inN = P.length;
      A.trophy({ k: 'sure', id: K.id, win: K.jack > 0, ic: '🎩', title: 'Sure Thing!: the class won ' + K.won + ' chips', sub: inN + ' of ' + K.order.length + ' players answered · ' + K.allRight + '% right · ' + K.jack + ' full house' + (K.jack === 1 ? '' : 's'), n: K.order.length, inN: inN, won: K.won, jack: K.jack });
    }
    K.state = 2; K.endedAt = Date.now(); K.dead = 0; push(); A.consolePanel();
  }
  function agg() {
    var K = C(); if (!K || !A.rosterIn().length) return;
    var last = T.rows(QID, 'id:' + Math.round(K.id / 1000) + ';'), changed = false;
    T.active().concat(Object.keys(last)).forEach(function (sid) { if (K.idx[sid] == null) { K.idx[sid] = K.order.length; K.order.push(sid); changed = true; } });
    Object.keys(last).forEach(function (sid) {
      var m = /;a:([^;]*)/.exec(String(last[sid].answer)), raw = m ? m[1] : '';
      if (K.raw[sid] !== raw) { K.raw[sid] = raw; K.rows[sid] = raw.split('_').map(parseTok); changed = true; }
    });
    var was = K.ansN; if (K.state === 1 && K.ph === 0 && countAns(K) !== was) changed = true;
    if (changed) { A.pushLive(); A.consolePanel(); }
  }
  function tick() {
    var K = C(); if (!K) return;
    var now = Date.now();
    if (!K.aggAt || now - K.aggAt > 6000) { K.aggAt = now; agg(); }   // a reloaded console counts the rows without waiting for the next poll
    if (K.state === 1 && K.auto) {
      if (K.ph === 0) { var N = K.order.length; if ((K.dead && now >= K.dead + 1500) || (N > 0 && K.ansN >= N && now - K.phAt > 6000)) { reveal(); return; } }
      else if (now - K.phAt >= GAP) { next(); return; }
    }
    var pg = Math.floor((now - K.id) / 4000) % Math.max(1, Math.ceil(K.order.length / 10)), ch = pg !== K.page; K.page = pg;
    if (ch || now - (K.lastPush || 0) >= 5000) push();
    if (root && V && V.watch) { apply(watchState()); watchBar(); }
  }
  function counts(out) {
    var K = C(); if (!K) return;
    var el_ = Math.round(((K.endedAt || Date.now()) - K.id) / 1000), rel = function (t) { return t ? Math.max(1, Math.min(9999, Math.round((t - K.id) / 1000))) : 0; };
    out.zsrid = A.encRun(K.id); out.zsrst = A.encRun(K.id + (A.console_().skew || 0));
    out.zsrs = [K.state, Math.min(9999, K.state === 1 ? el_ + 900 : el_), K.qi, K.ph, K.nq, Math.min(9999, K.order.length), Math.min(9999, K.ansN), K.auto ? 1 : 0, rel(K.dead), K.ep, Math.min(9999, K.pot), rel(K.phAt)];
    out.zsrq = K.qs.slice(0, 12);
    out.zsrp = K.paid.slice(0, 12).map(function (x) { return Math.min(9999, x || 0); });
    out.zsrc = K.lines.slice(0, 12).map(function (x) { return x || 0; });
    out.zsrm = [K.target, K.secs, K.jack, K.add, K.share, K.won, K.rightPct, K.allRight, K.done || 0];
    out.zsrv = K.ph === 1 || K.state === 2 ? K.split.slice(0, 11) : [];
    if (K.state === 2) out.zsra = K.aw.slice(0, 12);
  }
  function crewList(K) { var L = T.looks(); return K.order.map(function (sid) { return { fp: T.sh3(sid), n: T.nameOf(sid), look: T.lookOf(L, sid) }; }); }
  function spot(all) {
    var K = C(); if (!K) return null;
    return { q: 'zsr', text: (T.crewPage(crewList(K), all ? 0 : K.page || 0, all ? 999 : 10) + (K.ph === 1 && K.state === 1 ? '#S:' + K.qi + '|' + K.tops : '')).slice(0, all ? 99999 : 600) };
  }
  function restore(Lv) {
    var b = gameOf(Lv); if (!b) return false;
    if (b.state === 2 || Date.now() - b.id > 3 * 3600000 || !b.qs.length) { A.console_().sure = null; return false; }
    var K = { id: b.id, state: 1, nq: b.nq, qs: b.qs.slice(0, b.nq), qi: b.qi, ph: b.ph, phAt: b.phAt ? b.id + b.phAt * 1000 : Date.now(), auto: b.auto ? 1 : 0, secs: b.secs, dead: 0, target: b.target,
      order: [], idx: {}, rows: {}, raw: {}, lines: b.lines.slice(), paid: b.paid.slice(), pot: b.pot, jack: b.jack, add: b.add, share: b.share, split: b.split.slice(), tops: '', ansN: b.ans, rightPct: b.rightPct, aw: [], won: 0, allRight: 0, ep: b.ep % 9000 + 1, page: 0 };
    if (b.tops && b.tops.qi === b.qi) K.tops = b.tops.list.map(function (x) { return x.t + '~' + x.n + '~' + (x.ok ? 'r' : 'w'); }).join(',');
    if (K.auto && K.ph === 0) K.dead = b.dead ? Math.max(Date.now() + 8000, b.id + b.dead * 1000) : Date.now() + K.secs * 1000;
    A.console_().sure = K;
    return true;
  }
  function watchState() { var out = {}; counts(out); var b = gameOf({ lesson: A.LID, counts: out, spot: spot(true) }); b.start = C().id; return b; }
  // the stage on the console itself (one computer on the projector): the pacing buttons come along
  function watchBar() {
    var K = C(), bar = document.querySelector('.sthwatch'); if (!bar || !K) return;
    var sig = [K.state, K.ph, K.qi, K.auto].join('|'); if (bar._sig === sig) return; bar._sig = sig; bar.innerHTML = '';
    if (K.state === 1) bar.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: K.ph === 0 ? '🥁 Reveal' : K.qi + 1 >= K.nq ? '🏆 The awards' : 'Next question ▶', onclick: function () { if (K.ph === 0) reveal(); else next(); tick(); } }));
    bar.appendChild(el('button', { type: 'button', 'class': 'btn', text: '✕ Back to the console', onclick: function () { close(); } }));
  }
  function watch() {
    var b = watchState(); open(b); V.watch = true; V.sawOpen = b.ph === 0 ? -1 : b.qi; apply(b);
    document.body.appendChild(H('div', 'sthwatch')); watchBar();
  }
  function section(p) {
    var K = C(), sec = H('div', 'sect'), Q = T.pool()[K.qs[K.qi]], N = K.order.length;
    sec.appendChild(H('h3', '', '🎩 Sure Thing!'));
    var inL = [], outL = [];
    K.order.forEach(function (sid) { var n = T.nameOf(sid) || '?'; if (toks(K, sid)[K.qi]) inL.push(n); else outL.push(n); });
    sec.appendChild(H('p', '', K.state === 2 ? '<b>That\'s the show.</b> The class won 🪙 ' + K.won + ' together · ' + K.allRight + '% right · the pot paid out ' + K.jack + ' time' + (K.jack === 1 ? '' : 's') + '.'
      : '<b>Question ' + (K.qi + 1) + ' of ' + K.nq + '</b> · ' + (K.ph === 0 ? '🔒 <b>' + inL.length + '</b> of ' + N + ' locked in' + (K.dead ? ' · reveals in <b>' + Math.max(0, Math.ceil((K.dead - Date.now()) / 1000)) + ' s</b>' : '') : 'revealed: <b>' + K.rightPct + '%</b> right' + (K.paid[K.qi] ? ' · 🎉 FULL HOUSE, the pot paid 🪙 ' + K.paid[K.qi] + ' each' : '')) + ' · pot 🪙 ' + K.pot + ' · full house at ' + K.target + '%'));
    if (K.state === 1 && Q) sec.appendChild(H('p', 'muted', '<b>On the screens:</b> ' + A.fmt(T.plain(qTxt(Q)).slice(0, 220)) + ' <b>Answer: ' + esc(Q.k === 'poll' ? A.letter(Q.ans) + ': ' + T.plain(Q.opts[Q.ans]) : A.numTxt(Q.ans)) + '</b>'));
    var r = H('div', 'row');
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: K.ph === 0 ? '🥁 Reveal the answer' : K.qi + 1 >= K.nq ? '🏆 The awards' : 'Next question ▶', onclick: function () { if (K.ph === 0) reveal(); else next(); } }));
    r.appendChild(el('button', { type: 'button', 'class': 'btn' + (K.state === 2 ? ' primary' : ''), text: '👁 Show the stage', title: 'The show on this screen, with the pacing buttons', onclick: function () { watch(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: K.auto ? '⏸ Auto-run is ON (' + K.secs + ' s a question)' : '▶ Let it run by itself', title: 'On: each question reveals when everyone has answered or the time is up, and the next one follows. Off: you press Reveal and Next.', onclick: function () {
      K.auto = K.auto ? 0 : 1; K.dead = K.auto && K.ph === 0 ? Date.now() + K.secs * 1000 : 0; if (K.auto && K.ph === 1) K.phAt = Date.now() - GAP + 5000; push(); A.consolePanel(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: 'End it now', title: 'Straight to the awards', onclick: function () { finish(); } }));
    r.appendChild(el('button', { type: 'button', 'class': 'btn' + (K.state === 2 ? ' primary' : ''), text: 'Back to the lesson', onclick: function () { A.console_().sure = null; if (root) close(); A.pushLive(); A.consolePanel(); } }));
    sec.appendChild(r);
    var dd = T.fold('g-sure', '📋 Details · only you see this', true);
    if (K.state === 1) {
      dd.appendChild(H('p', 'muted', '<b>✍️ Still thinking (' + outL.length + '):</b> ' + (outL.map(esc).join(', ') || 'nobody') + '<br><b>🔒 Locked in (' + inL.length + '):</b> ' + (inL.map(esc).join(', ') || 'nobody yet')));
      dd.appendChild(H('p', 'muted', 'The pot pays the whole class when ' + K.target + '% have answered, right or wrong, so a quiet word with someone still thinking helps everyone. A Careful bet can never lose a chip.'));
    } else {
      var n = K.done || 0, L = K.order.map(function (sid) { var t = tally(toks(K, sid), K.lines, K.paid, n); return { n: T.nameOf(sid) || '?', t: t }; }).sort(function (a, b) { return a.n.localeCompare(b.n); });
      dd.appendChild(H('p', 'muted', '<b>Chips · right of answered · spot-on calls (A to Z, not a ranking):</b><br>' + L.map(function (x) { return esc(x.n) + ' 🪙' + x.t.c + ' · ' + x.t.right + '/' + x.t.n + ' · ' + x.t.calls; }).join('<br>')));
    }
    sec.appendChild(dd);
    p.appendChild(sec);
  }
  (A.every || function (f, ms) { setInterval(f, ms); })(function () { if (A.MODE === 'teach' && A.console_() && C()) tick(); }, 1000);

  (function css() {
    if (document.getElementById('sfaSureCss')) return;
    var c = document.createElement('style'); c.id = 'sfaSureCss';
    c.textContent = [
      'body.crwing{overflow:hidden}',
      '.sth{position:fixed;inset:0;z-index:90;overflow:auto;color:#FFF7E8;font-family:"Bricolage Grotesque",system-ui,sans-serif;display:flex;flex-direction:column;background:radial-gradient(120% 90% at 50% -10%,#5a2390 0%,#35125c 38%,#170828 78%,#0d0418 100%)}',
      '.sth *{box-sizing:border-box}.sth [hidden]{display:none!important}',
      // the curtains and the lights
      '.sth:before,.sth:after{content:"";position:fixed;top:0;bottom:0;width:4.2vw;z-index:1;pointer-events:none;background:repeating-linear-gradient(90deg,#7d0f2b 0 10px,#b31a40 10px 22px,#8f1232 22px 30px);box-shadow:inset -14px 0 22px rgba(0,0,0,.55)}',
      '.sth:before{left:0;border-radius:0 0 40% 0/0 0 6% 0}.sth:after{right:0;transform:scaleX(-1);border-radius:0 0 40% 0/0 0 6% 0}',
      '.sthbeam{position:fixed;top:-8vh;left:50%;width:44vw;height:125vh;margin-left:-22vw;pointer-events:none;z-index:0;transform-origin:50% 0;background:linear-gradient(180deg,rgba(255,238,170,.2),rgba(255,238,170,.05) 55%,rgba(255,238,170,0) 85%);clip-path:polygon(46% 0,54% 0,100% 100%,0 100%);animation:sthsway 9s ease-in-out infinite alternate}',
      '.sthbeam.a{--a:-34deg;--b:-16deg}.sthbeam.b{--a:30deg;--b:14deg;animation-duration:11s;background:linear-gradient(180deg,rgba(150,220,255,.18),rgba(150,220,255,.04) 55%,rgba(150,220,255,0) 85%)}.sthbeam.c{--a:-6deg;--b:8deg;animation-duration:13s;background:linear-gradient(180deg,rgba(255,150,210,.14),rgba(255,150,210,.03) 55%,rgba(255,150,210,0) 85%)}',
      '@keyframes sthsway{from{transform:rotate(var(--a))}to{transform:rotate(var(--b))}}',
      '.sth.s1 .sthbeam{animation-duration:1.1s}.sth.s2 .sthbeam,.sth.s3 .sthbeam{--a:-3deg;--b:3deg}',
      // the top
      '.sthtop{position:relative;z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;padding:10px 5.4vw 8px}',
      '.sthlogo{margin:0;font:400 clamp(24px,3.4vw,58px)/1 "Luckiest Guy",system-ui;color:#FFE14D;letter-spacing:.03em;text-shadow:0 .07em 0 #B3371A,0 .14em 0 rgba(0,0,0,.4);padding-bottom:.22em;background:radial-gradient(circle,#FFE9A0 0 2.5px,transparent 3.5px) 0 100%/16px 8px repeat-x;animation:sthbulb 1.2s steps(2) infinite}',
      '.sthlogo span{display:inline-block;animation:sthtip 4s ease-in-out infinite;transform-origin:50% 90%}',
      '@keyframes sthbulb{50%{background-position:8px 100%}}@keyframes sthtip{0%,86%,100%{transform:none}90%{transform:rotate(-16deg) translateY(-3px)}95%{transform:rotate(6deg)}}',
      '.sthpill{padding:.28em .85em;border-radius:99px;background:rgba(255,255,255,.13);font-weight:800;font-size:clamp(13px,1.5vw,28px);white-space:nowrap;border:2px solid rgba(255,255,255,.12)}',
      '.sthpill:empty{display:none}.sthpill b{color:#FFE14D}.sthpill.hot{background:#FF4D6D;border-color:#FFB3C0;animation:sthpulse .5s ease-in-out infinite alternate}.sthpill.hot b{color:#fff}',
      '.sthpill.chips{background:#FFE14D;color:#3a2500;border-color:#fff3b0;font-size:clamp(16px,1.8vw,30px)}.sthpill.chips b{color:#3a2500;font-family:"IBM Plex Mono",monospace}',
      '.sthsp{flex:1}.sthspk{position:relative}',
      '@keyframes sthpulse{to{transform:scale(1.08)}}',
      // the stage
      '.sthmain{position:relative;z-index:4;flex:1;display:grid;grid-template-columns:minmax(150px,15vw) minmax(0,1fr) minmax(170px,15vw);gap:1.6vw;align-items:center;padding:.5vh 5.6vw 2vh;min-height:0}',
      '.sthhost{display:flex;flex-direction:column;align-items:center;text-align:center;align-self:end}',
      '.sthhost small{font-weight:800;opacity:.7;font-size:clamp(11px,.9vw,17px);letter-spacing:.06em;text-transform:uppercase;margin-top:2px}',
      '.sthgoat{width:100%;max-width:min(300px,30vh);height:auto;filter:drop-shadow(0 12px 14px rgba(0,0,0,.5));animation:sthbob 3.2s ease-in-out infinite;transform-origin:50% 100%}',
      '.sthgoat .stheyes{animation:sthblink 5s infinite;transform-origin:100px 88px}.sthgoat .sthear{animation:sthflap 3.6s ease-in-out infinite;transform-origin:56px 92px}.sthgoat .sthear.r{transform-origin:144px 92px;animation-direction:reverse}.sthgoat .sthtie{transform-origin:100px 200px}',
      '.sthhost.k-drum .sthgoat{animation:sthjit .18s linear infinite}.sthhost.k-full .sthgoat,.sthhost.k-hi .sthgoat,.sthhost.k-end .sthgoat{animation:sthhop .55s ease-in-out infinite alternate}.sthhost.k-full .sthtie,.sthhost.k-hi .sthtie{animation:sthspin .8s linear infinite}',
      '@keyframes sthbob{50%{transform:translateY(-1.2%) rotate(-1.4deg)}}@keyframes sthblink{0%,94%,100%{transform:none}97%{transform:scaleY(.1)}}@keyframes sthflap{50%{transform:rotate(-9deg)}}',
      '@keyframes sthjit{0%{transform:translate(-2px,0) rotate(-1deg)}50%{transform:translate(2px,-1px) rotate(1deg)}100%{transform:translate(-2px,0) rotate(-1deg)}}@keyframes sthhop{to{transform:translateY(-7%) rotate(3deg)}}@keyframes sthspin{to{transform:rotate(360deg)}}',
      '.sthsay{position:relative;background:#FFFDF4;color:#22123f;border-radius:20px;padding:.6em .8em;margin:0 0 16px;font-weight:700;font-size:clamp(14px,1.35vw,27px);line-height:1.22;box-shadow:0 8px 0 rgba(0,0,0,.28);min-height:3.2em;display:flex;align-items:center;justify-content:center}',
      '.sthsay:after{content:"";position:absolute;left:50%;bottom:-13px;margin-left:-12px;border:13px solid transparent;border-top-color:#FFFDF4;border-bottom:0}',
      '.sthsay.in{animation:sthsayin .4s cubic-bezier(.2,1.5,.4,1) both}@keyframes sthsayin{from{transform:scale(.7) rotate(-3deg);opacity:0}to{transform:none;opacity:1}}',
      '.sthboard{position:relative;align-self:center;background:linear-gradient(180deg,#241552,#170c38);border:4px solid #FFE14D;border-radius:26px;padding:clamp(12px,1.8vw,34px) clamp(14px,2.2vw,42px);box-shadow:0 0 0 7px rgba(255,225,77,.16),0 0 60px rgba(255,225,77,.18),0 24px 60px rgba(0,0,0,.55);max-height:100%;overflow:auto}',
      '.sthboard.in{animation:sthflip .55s cubic-bezier(.2,1.2,.4,1) both}@keyframes sthflip{from{transform:perspective(900px) rotateX(-70deg) scale(.9);opacity:0}to{transform:none;opacity:1}}',
      '.sth.cb .sthboard{border-color:#FF7A3D;box-shadow:0 0 0 7px rgba(255,122,61,.2),0 0 70px rgba(255,122,61,.35),0 24px 60px rgba(0,0,0,.55)}',
      '.sthboard.two{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:2vw;align-items:center}.sthboard.two .sthopts{grid-template-columns:1fr}.sthboard.two .sthq{font-size:clamp(18px,2vw,42px)}',
      '.sthkick{margin:0 0 .35em;font-weight:800;font-size:clamp(12px,1.15vw,24px);letter-spacing:.07em;text-transform:uppercase;color:#9FE8FF}.sthkick em{font-style:normal;background:#FF7A3D;color:#2a0d00;border-radius:99px;padding:.1em .6em;margin-right:.4em}',
      '.sthq{margin:0 0 .55em;font-size:clamp(19px,2.8vw,58px);font-weight:700;line-height:1.22;text-wrap:balance}.sthq b{color:#FFE14D;white-space:nowrap}',
      '.sthfig:empty{display:none}.sthfig{margin:0 0 .7em;max-width:min(560px,100%)}.sthfig .fig{margin:0}.sthfig svg{max-width:100%;height:auto;display:block;max-height:32vh}.sth.screen .sthfig{max-width:min(46vw,100%)}.sth.screen .sthfig .ftab{font-size:clamp(15px,1.5vw,32px)}',
      '.sthtype{margin:.2em 0 0;font-size:clamp(16px,1.7vw,34px);font-weight:700;color:#C9B8FF}',
      '.sthopts{display:grid;grid-template-columns:1fr 1fr;gap:clamp(8px,.9vw,18px)}.sthopts.sthnum{grid-template-columns:repeat(auto-fit,minmax(min(100%,11em),1fr))}',
      '.sthopt{position:relative;overflow:hidden;display:flex;align-items:center;gap:.6em;text-align:left;border-radius:16px;background:rgba(255,255,255,.09);border:3px solid rgba(255,255,255,.2);padding:.5em .7em;font:700 clamp(16px,1.9vw,40px)/1.2 "Bricolage Grotesque",system-ui,sans-serif;color:inherit;min-height:2.6em;transition:opacity .4s,border-color .3s,background .3s,transform .15s}',
      'button.sthopt{cursor:pointer;width:100%}button.sthopt:hover{border-color:#FFE14D;background:rgba(255,225,77,.14)}button.sthopt:active{transform:scale(.97)}',
      '.sthopt>*{position:relative;z-index:1}.sthopt .L{flex:none;width:1.7em;height:1.7em;border-radius:50%;background:#FFE14D;color:#2a1a00;display:grid;place-items:center;font-weight:800;font-size:.85em}',
      '.sthopt .t{flex:1;min-width:0;overflow-wrap:anywhere}.sthopts.sthnum .sthopt .t{font-family:"IBM Plex Mono",monospace;font-size:1.15em}',
      '.sthopt .bar{position:absolute;z-index:0;left:0;top:0;bottom:0;width:0;background:linear-gradient(90deg,rgba(110,168,255,.5),rgba(110,168,255,.28));transition:width 2s cubic-bezier(.3,.8,.3,1)}',
      '.sthopt .pc{font:600 .9em "IBM Plex Mono",monospace;opacity:.95;white-space:nowrap}.sthopt em{font-style:normal;font-size:.5em;font-weight:800;background:#FFE14D;color:#2a1a00;border-radius:99px;padding:.15em .6em;text-transform:uppercase;letter-spacing:.05em}',
      '.sthopt.hid{display:none}.sthopt.mine{border-style:dashed;border-color:#FFE14D}',
      '.sthopt.ok{border-color:#5CE0B8;background:rgba(92,224,184,.2);box-shadow:0 0 34px rgba(92,224,184,.55);animation:sthok .7s cubic-bezier(.2,1.6,.4,1) both}.sthopt.ok .bar{background:linear-gradient(90deg,rgba(92,224,184,.7),rgba(92,224,184,.38))}.sthopt.ok .L{background:#5CE0B8}',
      '.sthopt.dim{opacity:.48}@keyframes sthok{0%{transform:scale(1)}40%{transform:scale(1.07)}100%{transform:scale(1)}}',
      '.sth.s1 .sthopts{animation:sthjit .2s linear infinite}.sthboard.st3 .sthopt.ok,.sthboard.st3 .sthans{animation:none}',
      '.sthconf{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin-top:.8em;font-size:clamp(12px,1.15vw,24px);font-weight:700}.sthconf span{flex:0 0 100%;opacity:.75;text-transform:uppercase;letter-spacing:.06em;font-size:.8em}',
      '.sthconf b{padding:.3em .7em;border-radius:12px;white-space:nowrap;min-width:max-content;color:#18102c}.sthconf u{text-decoration:none;font-family:"IBM Plex Mono",monospace;margin-left:.3em}',
      '.sth .b1{background:#8BE9B3}.sth .b2{background:#FFC94A}.sth .b3{background:#FF7AA8}',
      '.sthans{margin-top:.8em;padding:.5em .8em;border-radius:14px;background:rgba(92,224,184,.16);border:2px solid #5CE0B8;font-size:clamp(14px,1.4vw,30px);animation:sthsayin .4s both}.sthans b{color:#8BF3CF}.sthans p{margin:.3em 0 0;font-size:.8em;opacity:.92}',
      // the pot
      '.sthpot{align-self:center;text-align:center;background:rgba(255,255,255,.07);border:3px solid rgba(255,225,77,.5);border-radius:24px;padding:clamp(10px,1.2vw,24px)}',
      '.sthpk{margin:0;font:400 clamp(16px,1.7vw,34px) "Luckiest Guy",system-ui;color:#FFE14D;letter-spacing:.05em;text-transform:uppercase}',
      '.sthjar{display:flex;flex-direction:column;align-items:center;line-height:1;margin:.2em 0 .5em}.sthjar span{font-size:clamp(26px,3vw,60px);animation:sthcoin 2.4s ease-in-out infinite}.sthjar b{font:600 clamp(40px,5.4vw,110px)/1 "IBM Plex Mono",monospace;color:#FFE14D;text-shadow:0 .05em 0 #9a5b00}',
      '.sthjar small{font-weight:800;font-size:clamp(11px,1vw,20px);opacity:.8;text-transform:uppercase;letter-spacing:.06em}@keyframes sthcoin{50%{transform:translateY(-12%) rotateY(180deg)}}',
      '.sthmeter{padding-top:clamp(12px,1.3vw,26px)}.sthmeter i{position:relative;display:block;height:clamp(12px,1.2vw,22px);border-radius:99px;background:rgba(0,0,0,.4);overflow:visible;border:2px solid rgba(255,255,255,.25)}',
      '.sthmeter u{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:linear-gradient(90deg,#6EA8FF,#9FE8FF);transition:width .8s cubic-bezier(.3,1.3,.5,1)}.sthmeter.full u{background:linear-gradient(90deg,#5CE0B8,#FFE14D);box-shadow:0 0 18px rgba(255,225,77,.8)}',
      '.sthmeter s{position:absolute;top:-7px;bottom:-7px;width:4px;margin-left:-2px;background:#FFE14D;border-radius:2px}.sthmeter s:after{content:"🎯";position:absolute;left:50%;top:-1.5em;transform:translateX(-50%);font-size:clamp(11px,1vw,20px)}',
      '.sthpl{margin:.9em 0 0;font-size:clamp(12px,1.05vw,22px);line-height:1.25;font-weight:600}.sthpl b{color:#FFE14D}',
      // a student's own panel
      '.sthme{position:relative;z-index:4;margin:0 12px 16px;background:rgba(14,8,34,.86);border:2px solid rgba(255,255,255,.16);border-radius:20px;padding:12px 14px}',
      '.sthme:empty{display:none}.sthstep{margin:0 0 8px;font-weight:800;font-size:16px}.sthstep b{display:inline-grid;place-items:center;width:1.5em;height:1.5em;border-radius:50%;background:#FFE14D;color:#2a1a00;margin-right:.3em}.sthstep em{font-style:normal;color:#FF9A5C;font-size:.9em}',
      '.sthme .sthopts{grid-template-columns:1fr 1fr}.sthme .sthopt{font-size:17px}',
      '.sthrow{display:flex;gap:8px;flex-wrap:wrap}.sthrow input{flex:1;min-width:120px;font:700 20px "IBM Plex Mono",monospace;padding:10px 12px;border-radius:12px;border:2px solid #7a6bb0;background:#14092c;color:#fff}.sthrow input:focus{outline:none;border-color:#FFE14D}',
      '.sthnote{margin:10px 0 0;font-size:13.5px;opacity:.85;line-height:1.3}.sthnote b{color:#FFE14D}',
      '.sthpicked{margin:0 0 10px;font-size:16px}.sthpicked b{color:#FFE14D}.sthchg{appearance:none;background:none;border:0;color:#9FE8FF;text-decoration:underline;font:inherit;font-size:14px;cursor:pointer;padding:4px}',
      '.sthbets{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}',
      '.sthbet{appearance:none;border:0;border-radius:16px;padding:10px 4px 9px;color:#18102c;font-family:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;box-shadow:0 5px 0 rgba(0,0,0,.35);transition:transform .12s,box-shadow .12s}',
      '.sthbet:hover{transform:translateY(-2px)}.sthbet:active{transform:translateY(4px);box-shadow:0 1px 0 rgba(0,0,0,.35)}.sthbet span{font-size:26px;line-height:1}.sthbet b{font:400 18px "Luckiest Guy",system-ui;letter-spacing:.03em}',
      '.sthbet small{display:flex;flex-direction:column;font-weight:800;font-size:12.5px;line-height:1.25}.sthbet small i{font-style:normal}.sthbet.b3{animation:sthglow 1.6s ease-in-out infinite}',
      '@keyframes sthglow{50%{box-shadow:0 5px 0 rgba(0,0,0,.35),0 0 20px rgba(255,122,168,.8)}}',
      '.sthwait{margin:0;font-size:16px;line-height:1.4}.sthwait b{color:#FFE14D}',
      '.sthres{border-radius:16px;padding:10px 14px;margin:0 0 10px;animation:sthsayin .45s cubic-bezier(.2,1.5,.4,1) both}.sthres h3{margin:0;font:400 clamp(20px,5.6vw,30px) "Luckiest Guy",system-ui;letter-spacing:.02em}.sthres h3 b{white-space:nowrap}.sthres p{margin:4px 0 0;font-size:15px;line-height:1.3}',
      '.sthres.good{background:rgba(92,224,184,.2);border:3px solid #5CE0B8}.sthres.good h3{color:#8BF3CF}.sthres.brave{background:rgba(255,201,74,.16);border:3px solid #FFC94A}.sthres.brave h3{color:#FFD97A}.sthres.miss{background:rgba(159,180,255,.14);border:3px solid #9FB4FF}.sthres.miss h3{color:#C6D2FF}',
      '.sthwhy{font-size:15px;line-height:1.35;padding:8px 12px;border-radius:12px;background:rgba(255,255,255,.07)}.sthwhy ol{margin:6px 0 0;padding-left:1.3em}.sthwhy b{color:#9FE8FF}',
      '.sthpotl{margin:10px 0 0;font-size:15px;line-height:1.3}.sthpotl.paid{color:#FFE14D;font-weight:700}',
      // the awards
      '.sthend{position:relative;z-index:4;flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 5.6vw 2vh;gap:1.2vh;min-height:0}',
      '.sthend h2{margin:0;font:400 clamp(30px,5vw,96px)/1 "Luckiest Guy",system-ui;color:#FFE14D;text-shadow:0 .06em 0 #B3371A,0 .12em 0 rgba(0,0,0,.4);animation:sthsayin .6s cubic-bezier(.2,1.6,.4,1) both}',
      '.sthsum{margin:0;font-size:clamp(14px,1.6vw,32px);font-weight:600}.sthsum b{color:#FFE14D}',
      '.sthmine{background:rgba(14,8,34,.8);border:3px solid #FFE14D;border-radius:20px;padding:10px 18px;width:100%;max-width:520px}.sthmine p{margin:2px 0;font-size:15px}.sthmine .sthbig{font:600 44px/1.1 "IBM Plex Mono",monospace;color:#FFE14D}.sthmine .sthwon{font-size:18px;font-weight:800;color:#8BF3CF}',
      '.sthaws{display:flex;flex-wrap:wrap;justify-content:center;gap:clamp(8px,1.2vw,24px);width:100%}',
      '.sthaw{flex:1 1 150px;max-width:330px;background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.05));border:3px solid rgba(255,225,77,.55);border-radius:22px;padding:clamp(8px,1vw,20px);display:flex;flex-direction:column;align-items:center;gap:2px;animation:sthawin .6s cubic-bezier(.2,1.5,.4,1) both}',
      '.sthaw.you{border-color:#5CE0B8;box-shadow:0 0 30px rgba(92,224,184,.5)}.sthaw .e{font-size:clamp(24px,2.8vw,56px);line-height:1}.sthaw>b{font:400 clamp(15px,1.6vw,32px) "Luckiest Guy",system-ui;color:#FFE14D;letter-spacing:.03em}',
      '.sthaw .av{line-height:0;margin:2px 0}.sthaw .av svg{display:block}.sthaw .ph{font-size:48px;line-height:1.2}.sthaw strong{font-size:clamp(15px,1.7vw,34px);font-weight:800}.sthaw small{font-size:clamp(11.5px,1vw,21px);opacity:.88;line-height:1.2;font-weight:600}',
      '@keyframes sthawin{from{transform:translateY(40px) scale(.7);opacity:0}to{transform:none;opacity:1}}',
      '.sthcrowd{margin-top:auto;width:100%;display:flex;align-items:flex-end;gap:1.5vw}.sthgary{flex:none;width:clamp(70px,10vw,190px);display:flex;flex-direction:column-reverse;align-items:center;gap:6px}.sthgary span{background:#FFFDF4;color:#22123f;border-radius:14px;padding:.4em .6em;font-weight:700;font-size:clamp(11px,1vw,20px);line-height:1.2}',
      '.sthgoat.sm{max-width:100%}',
      '.sthrowd{flex:1;display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-end;gap:4px 6px;padding:10px 8px 6px;border-radius:26px 26px 0 0;background:linear-gradient(180deg,rgba(255,225,77,.16),rgba(255,225,77,.03));border-top:4px solid rgba(255,225,77,.6)}',
      '.sthp{display:flex;flex-direction:column;align-items:center;animation:sthhop2 2s ease-in-out infinite}.sthp svg{display:block;max-width:100%;height:auto}.sthp .crwname{margin-top:2px;font-weight:800}.sth.screen .sthp .crwname{font-size:clamp(12px,1.05vw,22px)}.sthp.you .crwname{color:#FFE14D}@keyframes sthhop2{0%,60%,100%{transform:none}30%{transform:translateY(-9px)}}',
      // the teacher's pacing buttons over the stage
      '.sthwatch{position:fixed;right:10px;bottom:10px;z-index:98;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;opacity:.92}.sthwatch .btn{font-size:16px}',
      // a student's device and narrow screens
      '.sth.student:before,.sth.student:after{display:none}.sth.student .sthtop{padding:8px 12px 6px}.sth.student .sthlogo{font-size:clamp(20px,6vw,34px)}',
      '.sth.student .sthmain{display:flex;flex-direction:column;align-items:stretch;gap:10px;padding:2px 12px 10px;flex:none}',
      '.sth.student .sthhost{flex-direction:row;align-items:center;align-self:stretch;gap:10px;text-align:left}.sth.student .sthhost small{display:none}.sth.student .sthgoat{width:58px;flex:none;order:-1}',
      '.sth.student .sthsay{margin:0;flex:1;font-size:14.5px;min-height:0;justify-content:flex-start;border-radius:14px;box-shadow:0 4px 0 rgba(0,0,0,.28)}.sth.student .sthsay:after{left:-9px;bottom:50%;margin:0 0 -8px;border:8px solid transparent;border-right-color:#FFFDF4;border-left:0}',
      '.sth.student .sthboard{border-width:3px;border-radius:18px;padding:12px 14px;box-shadow:0 0 0 4px rgba(255,225,77,.14),0 10px 26px rgba(0,0,0,.5);max-height:none}',
      '.sth.student .sthkick{font-size:12px}.sth.student .sthq{font-size:clamp(18px,4.8vw,24px)}.sth.student .sthboard .sthopt{font-size:16px;min-height:0;border-width:2px;border-radius:12px}.sth.student .sthconf{font-size:12.5px}.sth.student .sthans{font-size:14.5px}',
      '.sth.student .sthpot{order:3;display:grid;grid-template-columns:auto 1fr;align-items:center;gap:2px 12px;text-align:left;padding:8px 12px;border-width:2px;border-radius:16px}',
      '.sth.student .sthpk{font-size:14px;grid-column:1}.sth.student .sthjar{grid-column:1;grid-row:2;flex-direction:row;gap:6px;margin:0}.sth.student .sthjar span{font-size:20px}.sth.student .sthjar b{font-size:30px}.sth.student .sthjar small{display:none}',
      '.sth.student .sthmeter{grid-column:2;grid-row:1;margin-top:12px}.sth.student .sthmeter i{height:12px}.sth.student .sthmeter s:after{font-size:11px}.sth.student .sthpl{grid-column:2;grid-row:2;margin:4px 0 0;font-size:12.5px}',
      '.sth.student .sthend{padding:0 12px 16px}.sth.student .sthaw{flex-basis:130px;border-width:2px;border-radius:16px}.sth.student .sthgary{display:none}',
      '@media (max-width:560px){.sth.student .sthboard .sthopts,.sthme .sthopts{grid-template-columns:1fr}.sthpill{font-size:12.5px}}',
      '@media (max-width:900px){.sth.screen .sthmain{grid-template-columns:1fr;align-items:start;overflow:auto}.sth.screen .sthhost{flex-direction:row;gap:10px}.sth.screen .sthgoat{width:70px}.sth.screen .sthsay{margin:0;flex:1}.sth.screen .sthsay:after{display:none}.sth.screen .sthhost small{display:none}}',
      '@media (prefers-reduced-motion:reduce){.sthbeam,.sthlogo,.sthlogo span,.sthgoat,.sthgoat *,.sthp,.sthjar span,.sthbet.b3,.sth.s1 .sthopts,.sthpill.hot{animation:none!important}.sthopt .bar{transition:none}}'
    ].join('\n');
    document.head.appendChild(c);
  })();

  window.SFA_SURE = { sync: sync, agg: agg, section: section, start: start, counts: counts, spot: function () { return spot(); }, restore: restore, gameOf: gameOf, tally: tally };
})();
