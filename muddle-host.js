/* Muddle Under the Pond: the teacher's host page (muddle-host.html). It is the referee and the class screen.
   It makes a room code, takes in players, deals the secret roles and tasks, runs the shifts, meetings and votes, and
   decides who wins. Everything about the game lives in this page (and in this browser's localStorage, so a refresh
   picks the game back up); the results script only carries messages between this page and the players' devices.
   With ?try it runs against the practice backend (muddle-mock.js) and can add pretend players (bots). */
(function () {
  'use strict';
  var M = window.MUD, esc = M.esc, H = M.H, R = M.ROOMS;
  var PUSH_MS = 1500, REVEAL_MS = 7000, RESULT_MS = 9000, FOG_MS = 40000, FOG_COOL = 75000, SEEN_MS = 25000;
  var SAVE = 'muddle.host' + (M.TRY ? '.try' : '');

  /* ---------- the teacher key (the same one Class Results uses, kept the same way) ---------- */
  var KEY = 'sfa.classkey';
  var Key = {
    get: function () { if (M.TRY) return 'test'; try { var s = sessionStorage.getItem(KEY); if (s) return s; var r = JSON.parse(localStorage.getItem(KEY) || 'null'); if (r && r.until > Date.now()) return r.k; } catch (e) { } return ''; },
    set: function (k, remember) { try { sessionStorage.setItem(KEY, k); if (remember) { var d = new Date(); d.setHours(23, 59, 59, 0); localStorage.setItem(KEY, JSON.stringify({ k: k, until: d.getTime() })); } } catch (e) { } },
    del: function () { try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) { } }
  };
  var owner = (function () { var k = 'muddle.owner', o = ''; try { o = localStorage.getItem(k) || ''; if (!o) { o = M.rid(16); localStorage.setItem(k, o); } } catch (e) { o = M.rid(16); } return o; })();

  var DEF = { mud: 0, shift: 120, talk: 60, vote: 30, tasks: 4, size: 3, cool: 30, reveal: true, bells: 1 };
  var G = null;   // the game
  function fresh(code) { return { code: code, ph: 'lobby', paused: false, left: 0, end: 0, rd: 0, set: Object.assign({}, DEF, (G && G.set) || loadSet()), P: {}, order: [], pump: 0, fog: 0, fogReady: 0, mt: null, rs: null, win: null, feed: [], kicked: {}, started: Date.now() }; }
  function loadSet() { try { return JSON.parse(localStorage.getItem('muddle.set') || 'null') || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(SAVE, JSON.stringify({ at: Date.now(), G: G })); localStorage.setItem('muddle.set', JSON.stringify(G.set)); } catch (e) { } }
  function saved() { try { var o = JSON.parse(localStorage.getItem(SAVE) || 'null'); if (o && o.G && Date.now() - o.at < 3 * 3600 * 1000) return o.G; } catch (e) { } return null; }
  function newCode() { var a = 'BCDFGHJKLMNPQRSTVWXZ', s = ''; for (var i = 0; i < 4; i++) s += a.charAt(Math.floor(Math.random() * a.length)); return s; }   // no vowels: a code never spells a word

  /* ---------- small helpers ---------- */
  function now() { return Date.now(); }
  function inGame() { return G.order.filter(function (p) { return G.P[p] && G.P[p].inGame && !G.P[p].kicked; }).map(function (p) { return G.P[p]; }); }
  function alive() { return inGame().filter(function (p) { return p.alive; }); }
  function feed(t) { G.feed.push(t); G.feed = G.feed.slice(-6); }
  function msg(P, t) { P.mi = (P.mi || 0) + 1; P.msgs = (P.msgs || []).concat([{ i: P.mi, t: t }]).slice(-4); }
  function fogOn() { return G.fog > now(); }
  function phaseEnd(ms) { G.end = now() + ms; }
  // the pump needs every Keeper's tasks several times over ("pump size" batches): finishing a batch brings a fresh one
  function pumpCalc() {
    var ks = inGame().filter(function (p) { return p.role === 'K'; }), d = 0;
    ks.forEach(function (p) { d += p.doneN || 0; });
    var goal = ks.length * G.set.tasks * (G.set.size || 3);
    G.pump = goal ? Math.min(100, Math.floor(100 * d / goal)) : 0;
  }
  function newTasks(p) {
    var rooms = M.shuffle([0, 1, 2, 3, 4, 5]).filter(function (r) { return r !== p.room; }).concat(p.room >= 0 ? [p.room] : []).slice(0, Math.min(6, G.set.tasks));   // not the room they're standing in, unless they need all six
    p.tasks = rooms.map(function (r) { return { r: r, k: M.pick(M.TASK_KINDS), d: false }; });
    p.bt = (p.bt || 0) + 1;
  }

  /* ---------- the game's steps ---------- */
  function mudCount(n) { var want = +G.set.mud || (n <= 6 ? 1 : n <= 14 ? 2 : 3); return Math.max(1, Math.min(want, Math.floor((n - 1) / 3) || 1)); }
  function startGame() {
    var t = now(), ps = G.order.map(function (p) { return G.P[p]; }).filter(function (p) { return p && !p.kicked && t - p.seen < SEEN_MS; });
    if (ps.length < 3) { toast('You need at least 3 players to start (' + ps.length + ' here).'); return; }
    var nm = mudCount(ps.length), muds = M.shuffle(ps).slice(0, nm);
    G.order.forEach(function (id) { var p = G.P[id]; p.inGame = false; });
    ps.forEach(function (p) {
      p.inGame = true; p.alive = true; p.out = ''; p.found = false; p.mudRoom = -1; p.vote = null; p.msgs = []; p.bells = G.set.bells;
      p.role = muds.indexOf(p) >= 0 ? 'M' : 'K';
      p.doneN = 0; p.room = -1; newTasks(p);
    });
    G.rd = 0; G.pump = 0; G.win = null; G.rs = null; G.mt = null; G.feed = []; G.fog = 0; G.paused = false;
    G.ph = 'reveal'; phaseEnd(REVEAL_MS);
    feed('A new game! ' + ps.length + ' players, ' + nm + ' ' + (nm === 1 ? 'Muddler' : 'Muddlers') + ' among them.');
    pumpCalc(); push(true);
  }
  function startShift() {
    G.rd++; G.ph = 'shift'; phaseEnd(G.set.shift * 1000); G.fog = 0; G.fogReady = now() + 20000; G.mt = null; G.rs = null;
    inGame().forEach(function (p) { p.room = M.ri(0, 5); p.vote = null; p.cool = now() + G.set.cool * 1000; });
    feed('Shift ' + G.rd + ' begins. Get to work!');
  }
  function meeting(why, by, vic) {
    if (G.ph !== 'shift') return;
    var found = inGame().filter(function (p) { return p.out === 'mud' && !p.found; });
    found.forEach(function (p) { p.found = true; });
    G.mt = { why: why, by: by ? by.n : '', vic: vic ? vic.n : '', room: vic ? vic.mudRoom : -1, fd: found.map(function (p) { return p.n; }) };
    G.ph = 'talk'; phaseEnd(G.set.talk * 1000); G.fog = 0;
    inGame().forEach(function (p) { p.vote = null; });
    feed(why === 'found' ? by.n + ' found ' + vic.n + ' ' + R[vic.mudRoom].at + '.' : why === 'bell' ? by.n + ' rang the Duck Bell.' : why === 'time' ? 'The shift bell rang.' : 'The host called a meeting.');
  }
  function startVote() { G.ph = 'vote'; phaseEnd(G.set.vote * 1000); }
  function tally() {
    var t = { skip: 0 }, voters = alive();
    voters.forEach(function (p) { var v = p.vote; if (v == null) return; t[v] = (t[v] || 0) + 1; });
    var best = null, bn = 0, tie = false;
    Object.keys(t).forEach(function (k) { if (t[k] > bn) { best = k; bn = t[k]; tie = false; } else if (t[k] === bn && bn > 0) tie = true; });
    var out = !tie && best && best !== 'skip' ? G.P[best] : null, why = out ? '' : bn === 0 ? 'none' : tie ? 'tie' : 'skip';
    if (out && out.alive) { out.alive = false; out.out = 'up'; out.found = true; feed(out.n + ' was sent up the ladder.'); }
    else feed(why === 'tie' ? 'A tie: no one was sent up.' : why === 'none' ? 'No one voted.' : 'Most players skipped: no one was sent up.');
    G.rs = { out: out ? out.id : null, n: out ? out.n : '', mud: out && G.set.reveal ? out.role === 'M' : null, tally: t, why: why };
    G.ph = 'result'; phaseEnd(RESULT_MS);
  }
  function checkWin() {
    var a = alive(), m = a.filter(function (p) { return p.role === 'M'; }).length, k = a.length - m;
    var w = null;
    if (m === 0) w = { side: 'K', why: 'Every Muddler was found!' };
    else if (G.pump >= 100) w = { side: 'K', why: 'The pond pump is full!' };
    else if (m >= k) w = { side: 'M', why: 'The Muddlers took over the pond!' };
    if (!w) return false;
    if (G.ph === 'result') { G.pendingWin = w; return true; }   // finish showing the vote first
    over(w); return true;
  }
  function over(w) { G.win = w; G.ph = 'over'; G.end = 0; G.paused = false; G.pendingWin = null; feed(w.side === 'K' ? '🏆 The Keepers win! ' + w.why : w.side === 'M' ? '🫧 The Muddlers win! ' + w.why : 'The game was ended.'); }
  function advance() {   // the phase clock ran out (or the host pressed Skip)
    if (G.ph === 'reveal') startShift();
    else if (G.ph === 'shift') meeting('time');
    else if (G.ph === 'talk') startVote();
    else if (G.ph === 'vote') tally();
    else if (G.ph === 'result') { if (G.pendingWin) over(G.pendingWin); else if (!checkWin()) startShift(); }
  }

  /* ---------- players' moves ---------- */
  function act(P, a) {
    var t = now(), ph = G.ph;
    if (!P.inGame || P.kicked) return;
    var here = function (x) { return x.inGame && x.alive && x.room === P.room && x !== P; };
    switch (a.t) {
      case 'go': if (ph === 'shift' && a.r >= 0 && a.r < 6) P.room = Math.floor(a.r); break;
      case 'task':
        if (ph !== 'shift' || fogOn()) break;
        var tk = P.tasks[a.j]; if (!tk || tk.d || tk.r !== P.room) break;
        tk.d = true;
        if (P.tasks.every(function (x) { return x.d; })) { newTasks(P); msg(P, 'Batch done! Here are fresh tasks' + (P.role === 'K' ? ': the pump needs more.' : ' to fake.')); }
        if (P.role === 'K') { P.doneN = (P.doneN || 0) + 1; pumpCalc(); checkWin(); }
        break;
      case 'fix': if (ph === 'shift' && fogOn() && P.room === M.HORN && (P.alive || P.role === 'K')) { G.fog = 0; feed('🌫️ ' + P.n + ' cleared the fog at the Fog Horn Deck.'); } break;
      case 'fog': if (ph === 'shift' && P.role === 'M' && !fogOn() && t >= G.fogReady) { G.fog = t + FOG_MS; G.fogReady = t + FOG_MS + FOG_COOL; feed('🌫️ Fog rolled in! No one can see who is in a room, and no task works. Clear it at the Fog Horn Deck.'); } break;
      case 'mud':
        var T = G.P[a.p];
        if (ph !== 'shift' || P.role !== 'M' || !P.alive || t < P.cool || !T || !T.inGame || !T.alive || T.role !== 'K' || T.room !== P.room) break;
        var wit = inGame().filter(function (x) { return here(x) && x !== T; });
        T.alive = false; T.out = 'mud'; T.found = false; T.mudRoom = P.room;
        P.cool = t + G.set.cool * 1000;
        msg(T, 'Someone muddled you ' + R[P.room].at + '! You are in the Lost & Found now. Keep doing your tasks to help the Keepers, but no talking about it.');
        wit.forEach(function (w) { var others = wit.filter(function (o) { return o !== w; }).map(function (o) { return o.n; }).concat([P.n]).sort(); msg(w, '💦 Splash! ' + T.n + ' just got muddled right here ' + R[P.room].at + '! Also in the room: ' + others.join(', ') + '.'); });
        checkWin();
        break;
      case 'report':
        if (ph !== 'shift' || !P.alive) break;
        var v = inGame().filter(function (x) { return x.out === 'mud' && !x.found && x.mudRoom === P.room; })[0];
        if (v) meeting('found', P, v);
        break;
      case 'bell': if (ph === 'shift' && P.alive && P.bells > 0) { P.bells--; meeting('bell', P); } break;
      case 'vote':
        if (ph !== 'vote' || !P.alive || P.vote != null) break;
        if (a.p === 'skip' || (G.P[a.p] && G.P[a.p].inGame && G.P[a.p].alive)) P.vote = a.p;
        if (alive().every(function (x) { return x.vote != null; })) tally();
        break;
    }
  }
  function takePlayers(players) {
    var t = now();
    Object.keys(players).forEach(function (id) {
      var o = players[id]; if (G.kicked[id]) return;
      var P = G.P[id];
      if (!P) {
        var n = M.cleanNick(o.n) || 'Player'; if (!M.okNick(n)) n = M.critter(o.k).n + ' ' + (G.order.length + 1);
        var base = n, i = 2; while (G.order.some(function (q) { return G.P[q] && G.P[q].n.toLowerCase() === n.toLowerCase(); })) n = base.slice(0, 11) + ' ' + i++;
        P = G.P[id] = { id: id, n: n, k: o.k % M.CRITTERS.length, seq: 0, seen: t, sat: o.at, inGame: false, alive: false, tasks: [], msgs: [] };
        G.order.push(id);
        if (G.ph === 'lobby') feed(P.n + ' joined.');
      }
      if (o.at !== P.sat) { P.sat = o.at; P.seen = t; }
      if (G.paused) return;   // moves wait (they are re-sent) until the game goes on
      (o.a || []).filter(function (a) { return a && a.i > P.seq; }).sort(function (a, b) { return a.i - b.i; }).forEach(function (a) { P.seq = a.i; try { act(P, a); } catch (e) { } });
    });
  }

  /* ---------- what each screen gets ---------- */
  function board() {
    var t = now(), vis = G.order.map(function (id) { return G.P[id]; }).filter(function (p) { return p && !p.kicked; });
    return {
      v: 1, code: G.code, ph: G.ph, pa: G.paused, left: G.paused ? G.left : Math.max(0, G.end - t), rd: G.rd, pump: G.pump, fog: fogOn() ? G.fog - t : 0,
      set: { shift: G.set.shift, talk: G.set.talk, vote: G.set.vote, reveal: G.set.reveal },
      pl: vis.map(function (p) { return [p.id, p.n, p.k, !p.inGame ? 0 : p.found ? (p.out === 'up' ? 3 : 2) : 1, G.ph === 'vote' && p.vote != null ? 1 : 0]; }),
      mt: G.mt, rs: G.ph === 'result' || G.ph === 'over' ? G.rs : null, win: G.win,
      roles: G.ph === 'over' ? inGame().filter(function (p) { return p.role === 'M'; }).map(function (p) { return p.id; }) : null,
      feed: G.feed.slice(-4)
    };
  }
  function secret(P) {
    var t = now();
    if (P.kicked) return { kicked: 1 };
    if (!P.inGame) return { st: 'wait', ack: P.seq, n: P.n };
    var o = { st: 'play', ack: P.seq, n: P.n, role: P.role, alive: P.alive, out: P.out, room: P.room, bells: P.bells, vote: P.vote, msgs: P.msgs || [],
      tasks: P.tasks.map(function (x) { return [x.r, x.k, x.d ? 1 : 0]; }), bt: P.bt || 0 };
    if (P.role === 'M') {
      o.mates = inGame().filter(function (x) { return x.role === 'M' && x !== P; }).map(function (x) { return x.n; });
      o.cool = Math.max(0, (P.cool || 0) - t); o.fogIn = Math.max(0, G.fogReady - t);
    }
    if (G.ph === 'shift') {
      var foggy = fogOn() && P.role !== 'M', others = inGame().filter(function (x) { return x !== P && x.alive && x.room === P.room; });
      if (P.alive || P.role === 'M') o.here = foggy ? others.length : others.map(function (x) { return [x.id, x.n, x.k, x.role === 'M' && P.role === 'M' ? 1 : 0]; });
      o.pud = inGame().filter(function (x) { return x !== P && x.out === 'mud' && !x.found && x.mudRoom === P.room; }).map(function (x) { return x.n; });
    }
    return o;
  }

  /* ---------- the network loop ---------- */
  var sent = {}, inflight = false, lastOk = 0, failMsg = '', bots = [];
  function push(force) {
    if (!G || G.closed) return;
    if (inflight && !force) return;
    var pub = board(), priv = {};
    G.order.forEach(function (id) { var s = JSON.stringify(secret(G.P[id])); if (force === 'all' || sent[id] !== s) { priv[id] = JSON.parse(s); } });
    inflight = true;
    var claim = !!G.claim;
    M.call('roomHost', { teacherKey: Key.get(), code: G.code, owner: owner, claim: claim, pub: pub, priv: priv }).then(function (j) {
      inflight = false; lastOk = now(); failMsg = ''; G.claim = false;
      Object.keys(priv).forEach(function (id) { sent[id] = JSON.stringify(priv[id]); });
      takePlayers(j.players || {});
      save(); draw();
    }, function (e) {
      inflight = false;
      var m = String(e.message || e);
      if (m === 'taken') { failMsg = 'Another host page is running room ' + G.code + '.'; G.closed = true; draw(); return; }
      if (m === 'teacher key') { Key.del(); failMsg = 'The teacher key was not accepted.'; G.closed = true; draw(); return; }
      if (m === 'unknown op') { failMsg = 'unknown op'; G.closed = true; draw(); return; }
      failMsg = 'Can\'t reach the results script (' + m + '). Trying again…'; draw();
    });
  }

  /* ---------- the page ---------- */
  var root = document.getElementById('host'), toastT = null;
  function toast(t) { var e = document.getElementById('mtoast'); if (!e) { e = H('div', 'mtoast'); e.id = 'mtoast'; e.setAttribute('role', 'status'); document.body.appendChild(e); } e.textContent = t; e.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { e.classList.remove('on'); }, 4000); }
  function joinUrl() { var u = new URL('muddle.html', location.href); return u.origin + u.pathname + (M.TRY ? '?try&r=' : '?r=') + G.code; }
  function shortUrl() { var u = new URL('muddle.html', location.href); return (u.host + u.pathname).replace(/^www\./, ''); }
  function chip(p, extra) { var c = M.critter(p.k); return '<span class="mchip' + (extra || '') + '" style="--c:' + c.c + '"><i>' + c.e + '</i><b>' + esc(p.n) + '</b></span>'; }

  function setupScreen(note) {
    root.innerHTML = '';
    var box = H('section', 'mcard msetup');
    box.appendChild(H('h2', '', 'Start a game room'));
    box.appendChild(H('p', '', 'Students open the join page on a phone or laptop, type the room code and a nickname. <b>No sign-in.</b> Nicknames are the only thing they type; nothing is saved to the results Sheet, and the room disappears 3 hours after the last move.'));
    if (note) box.appendChild(H('p', 'mwarn', note));
    var old = saved();
    var row = H('div', 'mrow');
    if (!M.endpoint) { box.appendChild(H('p', 'mwarn', 'This copy of the site has no results script set up, so only practice mode works.')); }
    else if (!Key.get()) {
      var inp = H('input'); inp.type = 'password'; inp.placeholder = 'Teacher key'; inp.autocomplete = 'off'; inp.setAttribute('aria-label', 'Teacher key'); inp.className = 'minput';
      var rem = H('label', 'mrem', '<input type="checkbox"> remember until tonight');
      var go = H('button', 'mbtn primary', 'Use this key'); go.type = 'button';
      go.onclick = function () { if (!inp.value.trim()) return; Key.set(inp.value.trim(), rem.querySelector('input').checked); setupScreen(); };
      box.appendChild(H('p', '', 'Type your teacher key (the same one Class Results asks for).'));
      row.appendChild(inp); row.appendChild(rem); row.appendChild(go); box.appendChild(row);
      row = H('div', 'mrow');
    }
    if (M.endpoint && Key.get()) {
      var b = H('button', 'mbtn primary big', '🫧 Open a new room'); b.type = 'button'; b.onclick = function () { begin(fresh(newCode())); }; row.appendChild(b);
      if (old && !old.closed) { var r2 = H('button', 'mbtn', '↩ Go back to room ' + esc(old.code) + (old.ph !== 'lobby' ? ' (game running)' : '')); r2.type = 'button'; r2.onclick = function () { old.claim = true; begin(old); }; row.appendChild(r2); }
    }
    if (!M.TRY) { var tr = H('a', 'mbtn', '🧪 Practice mode (no Sheet, with bots)'); tr.href = 'muddle-host.html?try'; row.appendChild(tr); }
    else box.appendChild(H('p', 'mtip', '🧪 <b>Practice mode.</b> Nothing reaches the results script. Open the room, then add bots, or open the join link in other tabs of this browser (each tab is a player).'));
    box.appendChild(row);
    box.appendChild(rules());
    root.appendChild(box);
  }
  function rules() {
    var d = H('details', 'mrules');
    d.innerHTML = '<summary>How the game works (for you and the class)</summary>' +
      '<ul><li>Everyone is a <b>Keeper</b> fixing the pond station under the duck pond… except 1 to 3 secret <b>Muddlers</b>.</li>' +
      '<li><b>Shifts:</b> players walk between six rooms on their device and do quick tasks (5 to 15 seconds each). Every Keeper task fills the <b>pond pump</b>.</li>' +
      '<li><b>Muddlers</b> fake their tasks. When they share a room with a Keeper they can <b>muddle</b> them, which sends that player to the <b>Lost &amp; Found</b> (out of the vote, but they can keep doing tasks). Anyone else in the room sees it happen, so Muddlers wait until no one is watching. They can also roll in <b>fog</b>: no one sees who is in a room and tasks stop until someone blows the horn at the Fog Horn Deck.</li>' +
      '<li>Find someone in a puddle? <b>Report</b> it. Suspicious? Ring the <b>Duck Bell</b> (once per game). Either one starts a <b>meeting</b>, and so does the end of each shift.</li>' +
      '<li><b>Meetings:</b> the class talks out loud for a minute, then everyone still in votes on their device. The most votes is <b>sent up the ladder</b> (out). A tie or "skip" sends no one.</li>' +
      '<li><b>Keepers win</b> when the pump is full or every Muddler is sent up. <b>Muddlers win</b> when they equal the Keepers still in.</li>' +
      '<li>Ground rules worth saying: no peeking at other screens, no shouting your role when you are out, be kind in meetings.</li></ul>';
    return d;
  }

  function begin(g) {
    G = g; sent = {}; G.closed = false; failMsg = '';
    if (!G.kicked) G.kicked = {};
    loadBots();
    push('all'); draw();
  }

  var lastDraw = '';
  function draw() {
    if (!G) return;
    if (G.closed) {
      var why = failMsg === 'unknown op' ? 'The results script doesn\'t know Muddle yet. Paste the new Code.gs into Apps Script and redeploy (APPS-SCRIPT-UPDATE-PROMPT.txt in the site folder walks you through it). Until then, practice mode works.' : failMsg;
      G = null; setupScreen(why); return;
    }
    var pub = board(), t = now();
    var key = JSON.stringify([pub.ph, pub.pa, pub.rd, pub.pump, !!pub.fog, pub.pl, pub.mt, pub.rs, pub.win, pub.feed, failMsg, G.set, t - lastOk < 6000, bots.length, G.order.length]);
    if (key === lastDraw) return; lastDraw = key;
    var keepScroll = window.scrollY;
    root.innerHTML = '';
    var top = H('div', 'mhostbar');
    top.innerHTML = '<span class="mcode" title="Room code">Room <b>' + esc(G.code) + '</b></span><span class="mjoin">Join at <b>' + esc(shortUrl()) + '</b></span>' +
      '<span class="mnet ' + (failMsg ? 'bad' : t - lastOk < 6000 ? 'ok' : 'wait') + '">' + (failMsg ? '⚠ ' + esc(failMsg) : t - lastOk < 6000 ? '● live' : '● connecting…') + '</span>';
    var cp = H('button', 'mbtn small', '🔗 Copy join link'); cp.type = 'button';
    cp.onclick = function () { var u = joinUrl(); (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { toast('Copied: ' + u); }, function () { window.prompt('Copy this link for students:', u); }); };
    top.appendChild(cp);
    root.appendChild(top);
    var stage = H('section', 'mstage ph-' + pub.ph);
    root.appendChild(stage);
    stageFor(stage, pub, t);
    root.appendChild(controls(pub));
    window.scrollTo(0, keepScroll);
  }
  function timerHtml(pub, label) { return '<div class="mtimer' + (pub.left < 10000 && !pub.pa ? ' low' : '') + '"><small>' + label + '</small><b data-t="left">' + (pub.pa ? '⏸' : M.secs(pub.left)) + '</b></div>'; }
  function pumpHtml(pub) { return '<div class="mpump" role="img" aria-label="Pond pump ' + pub.pump + ' percent full"><div class="mpumpfill" style="width:' + pub.pump + '%"></div><span>💧 Pond pump ' + pub.pump + '%</span></div>'; }
  function roster(pub, opts) {
    opts = opts || {};
    var g = H('div', 'mroster');
    pub.pl.forEach(function (row) {
      var p = { id: row[0], n: row[1], k: row[2] }, st = row[3];
      if (opts.inGameOnly && st === 0) return;
      var cls = opts.roles ? '' : st === 2 ? ' lost' : st === 3 ? ' up' : st === 0 && G.ph !== 'lobby' ? ' waiting' : '';
      if (opts.roles && opts.roles.indexOf(p.id) >= 0) cls += ' mud';
      var tag = st === 2 ? '<em>Lost &amp; Found</em>' : st === 3 ? '<em>up the ladder</em>' : st === 0 && G.ph !== 'lobby' ? '<em>next game</em>' : '';
      if (opts.voted && row[4]) tag = '<em>✓ voted</em>';
      if (opts.roles) tag = opts.roles.indexOf(p.id) >= 0 ? '<em>Muddler</em>' : '<em>Keeper</em>';
      if (opts.tally) { var n = opts.tally[p.id] || 0; tag = n ? '<em>' + '🗳️'.repeat(Math.min(n, 8)) + (n > 8 ? ' ' + n : '') + '</em>' : ''; }
      var c = M.critter(p.k), b = H('div', 'mpl' + cls, '<i style="--c:' + c.c + '">' + c.e + '</i><b>' + esc(p.n) + '</b>' + tag);
      if (opts.kick) { b.classList.add('kickable'); b.title = 'Remove ' + p.n; b.tabIndex = 0; b.setAttribute('role', 'button'); b.onclick = b.onkeydown = function (e) { if (e.type === 'keydown' && e.key !== 'Enter') return; kick(p.id); }; }
      g.appendChild(b);
    });
    return g;
  }
  function stageFor(s, pub, t) {
    var ph = pub.ph, inN = pub.pl.filter(function (r) { return r[3] > 0; }).length;
    if (ph === 'lobby') {
      var n = pub.pl.length;
      s.appendChild(H('div', 'mlobbyhead', '<p class="mbig">Go to <b>' + esc(shortUrl()) + '</b><br>and type the room code</p><div class="mbigcode">' + esc(G.code).split('').map(function (c) { return '<span>' + c + '</span>'; }).join('') + '</div>'));
      s.appendChild(H('h3', '', n ? n + ' ' + (n === 1 ? 'player' : 'players') + ' in the pond <small>(click a name to remove it)</small>' : 'Waiting for players…'));
      s.appendChild(roster(pub, { kick: true }));
      return;
    }
    if (ph === 'reveal') {
      s.appendChild(H('div', 'mcenter', '<p class="mkick">🤫 Shh…</p><h2>Look at your own screen.<br>Hold the button to see your secret role.</h2>' + timerHtml(pub, 'shift starts in')));
      return;
    }
    if (ph === 'shift') {
      s.appendChild(H('div', 'mshifthead', '<h2>Shift ' + pub.rd + '</h2>' + timerHtml(pub, 'shift bell in')));
      s.appendChild(H('div', '', pumpHtml(pub)));
      if (pub.fog) s.appendChild(H('div', 'mfog', '🌫️ <b>Fog!</b> No one can see who is in a room and tasks are stuck. Someone blow the horn at the 📯 Fog Horn Deck! <small>(<span data-t="fog">' + M.secs(pub.fog) + '</span>)</small>'));
      s.appendChild(H('div', 'mrooms', R.map(function (r) { return '<span>' + r.e + ' ' + esc(r.n) + '</span>'; }).join('')));
      s.appendChild(roster(pub, { inGameOnly: true }));
      s.appendChild(feedBox(pub));
      return;
    }
    if (ph === 'talk' || ph === 'vote') {
      var m = pub.mt || {}, why = m.why === 'found' ? '🔔 <b>' + esc(m.by) + '</b> found <b>' + esc(m.vic) + '</b> in a puddle ' + esc(R[m.room] ? R[m.room].at : '') + '!' : m.why === 'bell' ? '🔔 <b>' + esc(m.by) + '</b> rang the Duck Bell!' : m.why === 'time' ? '🔔 The shift bell rang. Meeting time!' : '🔔 Meeting called by the host.';
      s.appendChild(H('div', 'mmeethead', '<h2>' + why + '</h2>' + timerHtml(pub, ph === 'talk' ? 'talk it over' : 'vote now')));
      if (m.fd && m.fd.length) s.appendChild(H('p', 'mlost', '🧺 New in the Lost &amp; Found: <b>' + m.fd.map(esc).join(', ') + '</b>'));
      else s.appendChild(H('p', 'mlost', 'No one new in the Lost &amp; Found.'));
      if (ph === 'talk') s.appendChild(H('p', 'mbig', '🗣️ Talk out loud: where were you? Who did you see? Then vote on your device.'));
      else { var vd = pub.pl.filter(function (r) { return r[4]; }).length, al = pub.pl.filter(function (r) { return r[3] === 1; }).length; s.appendChild(H('p', 'mbig', '🗳️ Vote on your device: <b>' + vd + ' of ' + al + '</b> have voted.')); }
      s.appendChild(roster(pub, { inGameOnly: true, voted: ph === 'vote' }));
      s.appendChild(H('div', '', pumpHtml(pub)));
      return;
    }
    if (ph === 'result') {
      var r = pub.rs || {};
      var head = r.out ? '<h2 class="mout">🪜 ' + esc(r.n) + ' was sent up the ladder.</h2>' + (r.mud === true ? '<p class="mbig yes">' + esc(r.n) + ' <b>was a Muddler!</b> 🫧</p>' : r.mud === false ? '<p class="mbig no">' + esc(r.n) + ' <b>was not a Muddler.</b> 😬</p>' : '<p class="mbig">Their role stays secret…</p>')
        : '<h2>' + (r.why === 'tie' ? '⚖️ A tie! No one goes up the ladder.' : r.why === 'none' ? '🤷 No one voted.' : '⏭️ Skipped. No one goes up the ladder.') + '</h2>';
      s.appendChild(H('div', 'mcenter', head + '<p class="muted">Skip votes: ' + ((r.tally || {}).skip || 0) + '</p>'));
      s.appendChild(roster(pub, { inGameOnly: true, tally: r.tally || {} }));
      return;
    }
    if (ph === 'over') {
      var w = pub.win || {};
      s.appendChild(H('div', 'mcenter mwin ' + (w.side === 'K' ? 'keep' : w.side === 'M' ? 'mud' : ''), '<p class="mkick">' + (w.side === 'K' ? '🏆 The Keepers win!' : w.side === 'M' ? '🫧 The Muddlers win!' : 'Game over') + '</p><h2>' + esc(w.why || 'The host ended the game.') + '</h2>'));
      s.appendChild(H('h3', '', 'Who was who'));
      s.appendChild(roster(pub, { inGameOnly: true, roles: pub.roles || [] }));
      s.appendChild(feedBox(pub));
    }
  }
  function feedBox(pub) { return H('ul', 'mfeed', pub.feed.slice().reverse().map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('')); }

  var openD = {};
  function controls(pub) {
    var c = H('section', 'mcontrols'), ph = pub.ph;
    function b(txt, fn, cls, dis) { var x = H('button', 'mbtn ' + (cls || ''), txt); x.type = 'button'; x.onclick = fn; if (dis) x.disabled = true; c.appendChild(x); return x; }
    c.appendChild(H('b', 'mctitle', 'Host'));
    if (ph === 'lobby') b('▶ Start the game', startGame, 'primary');
    if (ph === 'over') { b('🔁 Play again (same room)', function () { G.ph = 'lobby'; G.win = null; G.rs = null; G.mt = null; G.order.forEach(function (id) { G.P[id].inGame = false; }); feed('Back in the lobby.'); push(true); draw(); }, 'primary'); }
    if (ph !== 'lobby' && ph !== 'over') {
      b(G.paused ? '▶ Resume' : '⏸ Pause', function () { if (G.paused) { G.paused = false; G.end = now() + G.left; } else { G.paused = true; G.left = Math.max(0, G.end - now()); } push(true); draw(); });
      b('⏭ Skip', function () { if (G.paused) { G.paused = false; } advance(); push(true); draw(); });
      if (ph === 'shift') b('🔔 Call a meeting', function () { meeting('host'); push(true); draw(); });
      b('⏹ End game', function () { if (window.confirm('End this game and show everyone\'s roles?')) { over({ side: null, why: 'The host ended the game.' }); push(true); draw(); } });
    }
    b('🚪 Close room', function () { if (!window.confirm('Close room ' + G.code + '? Players will be sent back to the join screen.')) return; G.closed = true; M.call('roomHost', { teacherKey: Key.get(), code: G.code, owner: owner, end: true }).catch(function () { }); try { localStorage.removeItem(SAVE); } catch (e) { } stopBots(); G = null; setupScreen('Room closed.'); }, 'ghost');
    if (ph !== 'lobby' && ph !== 'over') {
      var kd = H('details', 'mkick'); kd.open = !!openD.kick; kd.ontoggle = function () { openD.kick = kd.open; }; kd.innerHTML = '<summary>Remove a player</summary>';
      var kr = H('div', 'mrow');
      G.order.forEach(function (id) { var p = G.P[id]; if (!p || p.kicked) return; var x = H('button', 'mbtn small', esc(p.n)); x.type = 'button'; x.onclick = function () { kick(id); }; kr.appendChild(x); });
      kd.appendChild(kr); c.appendChild(kd);
    }
    // settings: changeable in the lobby (and between games)
    var sd = H('details', 'mset'); sd.open = openD.set != null ? openD.set : ph === 'lobby'; sd.ontoggle = function () { openD.set = sd.open; };
    sd.innerHTML = '<summary>Settings</summary>';
    var grid = H('div', 'msetgrid');
    function sel(label, k, opts) {
      var l = H('label', '', '<span>' + label + '</span>'), s = H('select');
      opts.forEach(function (o) { var op = H('option', '', o[1]); op.value = String(o[0]); if (String(G.set[k]) === String(o[0])) op.selected = true; s.appendChild(op); });
      s.disabled = ph !== 'lobby' && ph !== 'over';
      s.onchange = function () { G.set[k] = k === 'reveal' ? s.value === 'true' : +s.value; save(); push(true); };
      l.appendChild(s); grid.appendChild(l);
    }
    sel('Muddlers', 'mud', [[0, 'Auto (1 up to 6 players, 2 up to 14, then 3)'], [1, '1'], [2, '2'], [3, '3']]);
    sel('Shift length', 'shift', [[60, '1 min'], [90, '1.5 min'], [120, '2 min'], [180, '3 min'], [240, '4 min']]);
    sel('Talk time', 'talk', [[30, '30 s'], [45, '45 s'], [60, '1 min'], [90, '1.5 min'], [120, '2 min']]);
    sel('Vote time', 'vote', [[20, '20 s'], [30, '30 s'], [45, '45 s'], [60, '1 min']]);
    sel('Tasks each', 'tasks', [[3, '3'], [4, '4'], [5, '5'], [6, '6']]);
    sel('Pump size', 'size', [[2, 'small (2 batches of tasks)'], [3, 'medium (3 batches)'], [4, 'large (4 batches)'], [5, 'huge (5 batches)']]);
    sel('Muddle recharge', 'cool', [[20, '20 s'], [30, '30 s'], [45, '45 s'], [60, '1 min']]);
    sel('Duck Bells each', 'bells', [[0, 'none'], [1, '1'], [2, '2']]);
    sel('Show role when sent up', 'reveal', [[true, 'yes'], [false, 'no (harder)']]);
    sd.appendChild(grid); c.appendChild(sd);
    if (M.TRY) {
      var bd = H('div', 'mrow mbots');
      bd.appendChild(H('span', '', '🤖 Bots: ' + bots.length));
      [1, 5].forEach(function (n) { var x = H('button', 'mbtn small', '+' + n + ' bot' + (n > 1 ? 's' : '')); x.type = 'button'; x.disabled = ph !== 'lobby' && ph !== 'over'; x.onclick = function () { for (var i = 0; i < n; i++) addBot(); draw(); }; bd.appendChild(x); });
      var o = H('a', 'mbtn small', '📱 Open a player tab'); o.href = joinUrl(); o.target = '_blank'; o.rel = 'noopener'; bd.appendChild(o);
      c.appendChild(bd);
    }
    return c;
  }
  function kick(id) {
    var p = G.P[id]; if (!p) return;
    if (!window.confirm('Remove ' + p.n + ' from the room?')) return;
    p.kicked = true; G.kicked[id] = 1;
    if (p.inGame && p.alive) { p.alive = false; p.out = 'gone'; }
    feed(p.n + ' was removed by the host.');
    if (G.ph !== 'lobby' && G.ph !== 'over') { pumpCalc(); checkWin(); }
    push(true); draw();
  }

  /* ---------- practice bots (?try only): pretend players that use the same messages as a real device ---------- */
  var BOTN = ['Pip', 'Moss', 'Reed', 'Lily', 'Pebble', 'Fern', 'Puddle', 'Sprout', 'Mallow', 'Drizzle', 'Clover', 'Nettle', 'Bramble', 'Minnow', 'Willow', 'Sedge', 'Tadpole', 'Rush', 'Kelp', 'Algae'];
  function addBot() {
    if (!G || bots.length >= 20) return;
    var b = { pid: M.rid(8), tok: M.rid(16), nick: (BOTN[bots.length % BOTN.length] + ' (bot)').slice(0, 14), look: M.ri(0, 15), seq: 0, acts: [], me: null, board: null, busy: false, wait: 0 };
    bots.push(b); keepBots();
  }
  function stopBots() { bots = []; }
  function keepBots() { if (G) G.bots = bots.map(function (b) { return { pid: b.pid, tok: b.tok, nick: b.nick, look: b.look, seq: b.seq }; }); }
  function loadBots() { bots = M.TRY && G && G.bots ? G.bots.map(function (b) { return Object.assign({ acts: [], me: null, board: null, busy: false, wait: 0 }, b); }) : []; }
  function botAct(b, a) { a.i = ++b.seq; b.acts.push(a); keepBots(); }
  function botThink(b) {
    var me = b.me, bd = b.board; if (!me || !bd || me.st !== 'play') return;
    var t = now();
    if (bd.ph === 'shift' && !bd.pa) {
      if (t < b.wait) return;
      if (me.alive && me.pud && me.pud.length && me.role === 'K' && Math.random() < 0.6) { botAct(b, { t: 'report' }); b.wait = t + 3000; return; }
      if (me.role === 'M' && me.alive && me.cool <= 0 && Array.isArray(me.here)) {
        var ks = me.here.filter(function (h) { return !h[3]; });
        if (ks.length && me.here.length <= 2 && Math.random() < (me.here.length === 1 ? 0.8 : 0.4)) { botAct(b, { t: 'mud', p: M.pick(ks)[0] }); b.wait = t + 2500; return; }   // bolder than a careful player, so practice games move
      }
      if (me.role === 'M' && me.fogIn <= 0 && !bd.fog && Math.random() < 0.04) { botAct(b, { t: 'fog' }); b.wait = t + 2000; return; }
      if (bd.fog && me.role === 'K' && Math.random() < 0.35) { if (me.room !== M.HORN) botAct(b, { t: 'go', r: M.HORN }); else botAct(b, { t: 'fix' }); b.wait = t + 2500; return; }
      var todo = me.tasks.map(function (x, j) { return { r: x[0], d: x[2], j: j }; }).filter(function (x) { return !x.d; });
      if (me.role === 'M' && Math.random() < 0.5) { botAct(b, { t: 'go', r: M.ri(0, 5) }); b.wait = t + M.ri(4000, 9000); return; }   // Muddlers wander, looking for someone alone
      if (todo.length) {
        var tk = todo[0];
        if (me.room !== tk.r) { botAct(b, { t: 'go', r: tk.r }); b.wait = t + M.ri(2000, 4000); }
        else if (!bd.fog) { botAct(b, { t: 'task', j: tk.j }); b.wait = t + M.ri(5000, 12000); }
      } else if (Math.random() < 0.3) { botAct(b, { t: 'go', r: M.ri(0, 5) }); b.wait = t + M.ri(5000, 10000); }
    }
    if (bd.ph === 'vote' && me.alive && me.vote == null && t > b.wait) {
      if (!b.voteAt) b.voteAt = t + M.ri(2000, 12000);
      if (t > b.voteAt) {
        var opts = bd.pl.filter(function (r) { return r[3] === 1 && r[0] !== b.pid && (me.role !== 'M' || (me.mates || []).indexOf(r[1]) < 0); }).map(function (r) { return r[0]; });
        botAct(b, { t: 'vote', p: Math.random() < 0.25 || !opts.length ? 'skip' : M.pick(opts) }); b.voteAt = 0;
      }
    }
  }
  function botLoop() {
    if (!G || G.closed) return;
    bots.forEach(function (b) {
      if (b.busy || Math.random() < 0.3) return;
      b.busy = true;
      M.call('roomPing', { code: G.code, pid: b.pid, tok: b.tok, nick: b.nick, look: b.look, acts: b.acts }).then(function (j) {
        b.busy = false; b.me = j.me; b.board = j.board;
        if (j.me && j.me.ack) b.acts = b.acts.filter(function (a) { return a.i > j.me.ack; });
        if (j.me && j.me.kicked) { bots.splice(bots.indexOf(b), 1); keepBots(); return; }
        botThink(b);
      }, function () { b.busy = false; });
    });
  }

  /* ---------- clocks ---------- */
  setInterval(function () {
    if (!G || G.closed) return;
    if (!G.paused && G.end && now() >= G.end && G.ph !== 'lobby' && G.ph !== 'over') { advance(); push(true); }
    if (G && G.ph === 'shift' && G.fog && !fogOn() && G.fog > 0) { G.fog = 0; feed('The fog lifted by itself.'); }
    draw();
    if (G) [].forEach.call(root.querySelectorAll('[data-t]'), function (e) { var k = e.getAttribute('data-t'), ms = k === 'fog' ? G.fog - now() : G.paused ? G.left : G.end - now(); if (!(G.paused && k === 'left')) e.textContent = M.secs(ms); });
  }, 250);
  setInterval(function () { if (G && !G.closed) push(); }, PUSH_MS);
  setInterval(botLoop, 1000);
  window.addEventListener('beforeunload', function (e) { if (G && !G.closed && G.ph !== 'lobby' && G.ph !== 'over') { save(); e.preventDefault(); e.returnValue = ''; } });

  setupScreen();
  window.MUDDLE_HOST = { get G() { return G; }, bots: function () { return bots; }, push: push };
})();
