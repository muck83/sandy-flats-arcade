/* Muddle Under the Pond: the players' page (muddle.html). No sign-in: a room code, a nickname and a critter.
   The device makes its own random id and token (kept on this device only), sends its moves to the host page through the
   results script and shows the board and this player's secret part. Nothing here is saved anywhere else.
   With ?try it plays against the practice backend (muddle-mock.js); each browser tab is a separate player. */
(function () {
  'use strict';
  var M = window.MUD, esc = M.esc, H = M.H, R = M.ROOMS;
  var store = M.TRY ? window.sessionStorage : window.localStorage, SK = 'muddle.me';
  var root = document.getElementById('play'), taskBox = document.getElementById('mtask');
  var me = null;       // {code, pid, tok, nick, look}
  var B = null, S = null, skew = 0, lastOk = 0, fails = 0, acts = [], seq = 0, pollT = null, inflight = false, err = '';
  var L = { room: null, roomAt: 0, done: {}, mud: null, mudAt: 0, voteSel: null, secret: false, seenMsg: 0, dismissed: {}, bellAt: 0, reportAt: 0, fixAt: 0, fogAt: 0 };
  var PING_MS = 2000;

  function load() { try { return JSON.parse(store.getItem(SK) || 'null'); } catch (e) { return null; } }
  function keep() { try { if (me) store.setItem(SK, JSON.stringify(me)); else store.removeItem(SK); } catch (e) { } }
  function seqLoad() { try { seq = +store.getItem(SK + '.seq') || 0; } catch (e) { } }
  function seqKeep() { try { store.setItem(SK + '.seq', String(seq)); } catch (e) { } }
  function send(a) { a.i = ++seq; seqKeep(); acts.push(a); clearTimeout(pollT); pollT = setTimeout(poll, 150); }
  function left() { return B ? Math.max(0, B.left - (Date.now() - B._got)) : 0; }
  function sLeft(ms) { return Math.max(0, (ms || 0) - (Date.now() - B._got)); }

  /* ---------- joining ---------- */
  function joinScreen(note) {
    stop(); B = null; S = null; closeTask();
    root.innerHTML = '';
    var code = ((location.search.match(/[?&]r=([A-Za-z]{4})/) || [])[1] || (me && me.code) || '').toUpperCase();
    var f = H('form', 'mcard mjoinform'); f.setAttribute('autocomplete', 'off');
    f.innerHTML = '<h2>Join the game</h2>' + (note ? '<p class="mwarn">' + esc(note) + '</p>' : '') +
      '<label>Room code<input class="minput mcodein" name="code" maxlength="4" inputmode="text" autocapitalize="characters" spellcheck="false" placeholder="ABCD" value="' + esc(code) + '" required></label>' +
      '<label>Nickname <small>(no full names needed; be kind)</small><input class="minput" name="nick" maxlength="14" spellcheck="false" placeholder="e.g. Captain Toad" value="' + esc(me ? me.nick : '') + '" required></label>' +
      '<fieldset class="mcrit"><legend>Pick your critter</legend></fieldset>' +
      '<button class="mbtn primary big" type="submit">🫧 Join</button>' +
      '<p class="muted msmall">You don\'t sign in. Your nickname is only used in this game and disappears when the room closes.</p>';
    var fs = f.querySelector('.mcrit'), pickK = me ? me.look : M.ri(0, 15);
    M.CRITTERS.forEach(function (c, k) {
      var b = H('button', 'mcritb' + (k === pickK ? ' on' : ''), c.e); b.type = 'button'; b.style.setProperty('--c', c.c); b.setAttribute('aria-label', c.n); b.setAttribute('aria-pressed', k === pickK ? 'true' : 'false');
      b.onclick = function () { pickK = k; [].forEach.call(fs.querySelectorAll('.mcritb'), function (x, i) { x.classList.toggle('on', i === k); x.setAttribute('aria-pressed', i === k ? 'true' : 'false'); }); };
      fs.appendChild(b);
    });
    f.onsubmit = function (e) {
      e.preventDefault();
      var c = f.code.value.toUpperCase().replace(/[^A-Z]/g, ''), n = M.cleanNick(f.nick.value);
      if (c.length !== 4) return warn(f, 'The room code is 4 letters. It\'s on the board.');
      if (n.length < 2) return warn(f, 'Pick a nickname of at least 2 letters (letters, numbers and spaces).');
      if (!M.okNick(n)) return warn(f, 'Pick a different nickname, please.');
      var same = me && me.code === c;
      me = { code: c, pid: same ? me.pid : M.rid(8), tok: same ? me.tok : M.rid(20), nick: n, look: pickK };
      if (!same) { seq = 0; seqKeep(); acts = []; }
      keep(); err = ''; root.innerHTML = '<div class="mcard mcenter"><p class="mbig">Joining room ' + esc(c) + '…</p></div>'; poll();
    };
    root.appendChild(f);
    if (!M.endpoint) warn(f, 'This copy of the site has no results script set up. Ask your teacher for the link.');
  }
  function warn(f, t) { var w = f.querySelector('.mwarn'); if (!w) { w = H('p', 'mwarn'); f.insertBefore(w, f.children[1]); } w.textContent = t; return false; }
  function leave() { if (!window.confirm('Leave this room?')) return; me = null; keep(); joinScreen(); }

  /* ---------- talking to the host (through the results script) ---------- */
  function stop() { clearTimeout(pollT); pollT = null; }
  function poll() {
    stop(); if (!me) return;
    if (inflight) { pollT = setTimeout(poll, 400); return; }
    inflight = true;
    var t0 = Date.now();
    M.call('roomPing', { code: me.code, pid: me.pid, tok: me.tok, nick: me.nick, look: me.look, acts: acts }).then(function (j) {
      inflight = false; fails = 0; lastOk = Date.now(); err = '';
      B = j.board || null; if (B) B._got = Date.now() - (j.now - j.at) - Math.round((Date.now() - t0) / 2);
      S = j.me || null; if (S) S._got = B ? B._got : Date.now();
      if (S && S.bt !== L.bt) { L.bt = S.bt; L.done = {}; }   // a fresh batch of tasks
      if (S && S.ack) acts = acts.filter(function (a) { return a.i > S.ack; });
      if (S && S.kicked) { me = null; keep(); joinScreen('The host removed you from that room.'); return; }
      draw();
      // quick while there are moves to confirm; every 2 s while playing or voting; every 3 s when only waiting or talking
      var calm = !B || !/^(shift|vote)$/.test(B.ph);
      pollT = setTimeout(poll, (document.visibilityState === 'hidden' ? 6000 : acts.length ? 1000 : calm ? PING_MS + 1000 : PING_MS) + Math.random() * 500);
    }, function (e) {
      inflight = false; fails++;
      var m = String(e.message || e);
      if (m === 'no room' && !B && fails < 3) { pollT = setTimeout(poll, 1500); return; }   // the host's first save may still be on its way
      if (m === 'no room') { joinScreen(B ? 'The room closed. Thanks for playing!' : 'There is no open room ' + me.code + '. Check the code on the board.'); return; }
      if (m === 'bad player') { me.pid = M.rid(8); me.tok = M.rid(20); seq = 0; acts = []; keep(); seqKeep(); }
      if (m === 'full') { joinScreen('That room is full (40 players).'); return; }
      if (m === 'unknown op') { joinScreen('The game isn\'t switched on yet. Tell your teacher: the results script needs its update.'); return; }
      err = 'Reconnecting…'; draw();
      pollT = setTimeout(poll, Math.min(10000, 1500 * fails) + Math.random() * 1500);
    });
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && me && Date.now() - lastOk > 2500) poll(); });

  /* ---------- the screens ---------- */
  function myRoom() { if (L.room != null && (S.room === L.room || Date.now() - L.roomAt > 7000)) L.room = null; return L.room != null ? L.room : S.room; }
  function chip(n, k, extra) { var c = M.critter(k); return '<span class="mchip' + (extra || '') + '" style="--c:' + c.c + '"><i>' + c.e + '</i><b>' + esc(n) + '</b></span>'; }
  function head() {
    var c = M.critter(me.look);
    return '<div class="mphead"><span class="mme" style="--c:' + c.c + '"><i>' + c.e + '</i><b>' + esc(S && S.n || me.nick) + '</b></span><span class="mcode small">Room ' + esc(me.code) + '</span>' +
      '<span class="mnet ' + (err ? 'bad' : 'ok') + '">' + (err ? '● ' + esc(err) : '●') + '</span></div>';
  }
  var lastKey = '';
  function draw() {
    if (!me) return;
    if (!B) { root.innerHTML = '<div class="mcard mcenter">' + (err ? '<p class="mbig">' + esc(err) + '</p>' : '<p class="mbig">Joining…</p>') + '</div>'; return; }
    var ph = B.ph, t = Date.now();
    var key = JSON.stringify([ph, B.pa, B.rd, B.pump, !!B.fog, B.pl, B.mt, B.rs, B.win, sKey(), err, L.room, L.voteSel, L.secret, L.done, L.mud, L.dismissed, coolReady()]);
    if (key === lastKey) return; lastKey = key;
    root.innerHTML = head();
    var main = H('div', 'mpmain ph-' + ph); root.appendChild(main);
    if (!S || S.st === 'wait') {
      if (ph === 'lobby' || !S) main.appendChild(H('div', 'mcard mcenter', '<p class="mkick">You\'re in! 🎉</p><h2>Watch the board.<br>The game starts soon.</h2><p class="muted">' + B.pl.length + ' in the room</p>' + rosterHtml(true)));
      else main.appendChild(H('div', 'mcard mcenter', '<h2>A game is already going.</h2><p>You\'ll be in the next one. Watch the board!</p>' + pumpHtml()));
      foot(main, false);
      return;
    }
    if (ph === 'lobby') { main.appendChild(H('div', 'mcard mcenter', '<p class="mkick">Back in the lobby</p><h2>The next game starts soon.</h2>' + rosterHtml(true))); foot(main, false); return; }
    if (ph === 'reveal') { main.appendChild(roleCard(true)); main.appendChild(H('p', 'mcenter muted', 'The shift starts in ' + T('left') + ' s')); return; }
    if (ph === 'shift') { shift(main); return; }
    if (ph === 'talk' || ph === 'vote') { meeting(main); return; }
    if (ph === 'result') { result(main); return; }
    if (ph === 'over') { over(main); return; }
  }
  function sKey() { if (!S) return null; var o = {}; Object.keys(S).forEach(function (k) { if (k !== 'cool' && k !== 'fogIn' && k !== '_got') o[k] = S[k]; }); return o; }
  function coolReady() { if (!S || !B || S.role !== 'M') return 0; return (sLeft(S.cool) > 0 ? 1 : 0) + (sLeft(S.fogIn) > 0 ? 2 : 0) + (B.fog > 0 && sLeft(B.fog) > 0 ? 4 : 0); }
  function T(kind) { return '<span data-t="' + kind + '">' + M.secs(kind === 'cool' ? sLeft(S.cool) : kind === 'fogIn' ? sLeft(S.fogIn) : left()) + '</span>'; }
  // the clocks tick in place, so a held button or an open panel isn't rebuilt every second
  setInterval(function () { if (!B) return; [].forEach.call(root.querySelectorAll('[data-t]'), function (e) { var k = e.getAttribute('data-t'); e.textContent = M.secs(k === 'cool' ? sLeft(S && S.cool) : k === 'fogIn' ? sLeft(S && S.fogIn) : left()); }); }, 250);
  function pumpHtml() { return '<div class="mpump small" role="img" aria-label="Pond pump ' + B.pump + ' percent"><div class="mpumpfill" style="width:' + B.pump + '%"></div><span>💧 ' + B.pump + '%</span></div>'; }
  function rosterHtml(all) {
    return '<div class="mchips">' + B.pl.filter(function (r) { return all || r[3] > 0; }).map(function (r) { return chip(r[1], r[2], r[3] === 2 ? ' lost' : r[3] === 3 ? ' up' : ''); }).join('') + '</div>';
  }
  function roleCard(big) {
    var isM = S.role === 'M', d = H('div', 'mrole' + (big ? ' big' : ''));
    var hold = H('button', 'mbtn big mpeek', '👁 Hold to see your secret role'); hold.type = 'button';
    var face = H('div', 'mroleface ' + (isM ? 'mud' : 'keep'),
      (isM ? '<p class="mkick">🫧 You are a</p><h2>MUDDLER</h2><p>' + esc(M.WORDS.mudJob) + '</p>' + (S.mates && S.mates.length ? '<p>Your fellow Muddler' + (S.mates.length > 1 ? 's' : '') + ': <b>' + S.mates.map(esc).join(', ') + '</b></p>' : '<p>You are the only Muddler.</p>')
        : '<p class="mkick">💧 You are a</p><h2>KEEPER</h2><p>' + esc(M.WORDS.keeperJob) + '</p>'));
    face.hidden = true;
    function show(e) { if (e) e.preventDefault(); face.hidden = false; hold.classList.add('held'); }
    function hide() { face.hidden = true; hold.classList.remove('held'); }
    hold.addEventListener('pointerdown', show); ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (k) { hold.addEventListener(k, hide); });
    hold.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') show(e); }); hold.addEventListener('keyup', hide);
    hold.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    d.appendChild(hold); d.appendChild(face);
    if (big) d.appendChild(H('p', 'muted msmall', 'Keep your screen to yourself. Let go and your role hides again.'));
    return d;
  }
  function msgs(main) {
    (S.msgs || []).forEach(function (m) {
      if (L.dismissed[m.i]) return;
      var b = H('div', 'mmsg', '<p>' + esc(m.t) + '</p>');
      var x = H('button', 'mbtn small', 'Got it'); x.type = 'button'; x.onclick = function () { L.dismissed[m.i] = 1; draw(); };
      b.appendChild(x); main.appendChild(b);
      if (m.i > L.seenMsg) { L.seenMsg = m.i; M.buzz([80, 60, 80]); }
    });
  }
  function shift(main) {
    var room = myRoom(), isM = S.role === 'M', fog = B.fog > 0 && sLeft(B.fog) > 0;
    main.appendChild(H('div', 'mstrip', '<b>Shift ' + B.rd + '</b><span class="mtimer small' + (left() < 10000 ? ' low' : '') + '">' + (B.pa ? '⏸ paused' : '⏱ ' + T('left')) + '</span>' + pumpHtml()));
    if (B.pa) main.appendChild(H('div', 'mmsg', '<p>⏸ The host paused the game.</p>'));
    msgs(main);
    if (!S.alive) main.appendChild(H('div', 'mghost', S.out === 'up' ? '🪜 You were sent up the ladder. ' + (S.role === 'K' ? 'You can still do your tasks to help the Keepers. Shh, no hints!' : 'You can still roll in fog from your secret panel.') : '🧺 You\'re in the Lost &amp; Found. ' + (S.role === 'K' ? 'Keep doing your tasks: they still fill the pump. No talking about who did it!' : '')));
    if (fog) main.appendChild(H('div', 'mfog', '🌫️ <b>Fog!</b> You can\'t see who\'s here and tasks are stuck. Blow the horn at the 📯 Fog Horn Deck.'));
    // where I am and who's here
    var rc = H('div', 'mcard mroomcard');
    var html = '<p class="mkick">You are in</p><h2>' + R[room].e + ' ' + esc(R[room].n) + '</h2>';
    if (L.room != null) html += '<p class="muted">Walking there…</p>';
    else if (typeof S.here === 'number') html += '<p>🌫️ ' + (S.here ? S.here + ' other' + (S.here > 1 ? 's' : '') + ' here, but you can\'t tell who.' : 'You think you\'re alone…') + '</p>';
    else if (Array.isArray(S.here)) html += S.here.length ? '<p>Here with you:</p><div class="mchips">' + S.here.map(function (h) { return chip(h[1], h[2], h[3] ? ' mate' : ''); }).join('') + '</div>' : '<p class="muted">No one else is here.</p>';
    rc.innerHTML = html;
    if (L.room == null && S.pud && S.pud.length) {
      var pd = H('div', 'mpud', '⚠️ <b>' + S.pud.map(esc).join(', ') + '</b> ' + (S.pud.length > 1 ? 'are' : 'is') + ' stuck in a mud puddle here!');
      if (S.alive) { var rep = H('button', 'mbtn primary', '🔔 Report it'); rep.type = 'button'; rep.disabled = Date.now() - L.reportAt < 5000; rep.onclick = function () { L.reportAt = Date.now(); send({ t: 'report' }); draw(); }; pd.appendChild(rep); }
      rc.appendChild(pd);
    }
    // my task in this room
    if (L.room == null) S.tasks.forEach(function (x, j) {
      if (x[0] !== room || x[2] || L.done[j]) return;
      var T = M.TASKS[x[1]], tb = H('div', 'mtaskhere', '<span>★ Your task here: <b>' + esc(T.t) + '</b></span>');
      var go = H('button', 'mbtn primary', fog ? 'Too foggy' : 'Do it'); go.type = 'button'; go.disabled = fog || B.pa; go.onclick = function () { openTask(j); };
      tb.appendChild(go); rc.appendChild(tb);
    });
    if (fog && room === M.HORN && L.room == null && (S.alive || !isM)) {
      var fx = H('div', 'mtaskhere', '<span>📯 Clear the fog for everyone</span>'), fb = H('button', 'mbtn primary', 'Blow the horn'); fb.type = 'button';
      fb.disabled = Date.now() - L.fixAt < 4000; fb.onclick = function () { openTask('horn'); }; fx.appendChild(fb); rc.appendChild(fx);
    }
    main.appendChild(rc);
    // the map
    var map = H('div', 'mmap'); map.setAttribute('aria-label', 'Rooms');
    R.forEach(function (r, i) {
      var mine = S.tasks.filter(function (x) { return x[0] === i; }), todo = mine.some(function (x, j) { return !x[2] && !L.done[S.tasks.indexOf(x)]; }), done = mine.length && !todo;
      var b = H('button', 'mroom' + (i === room ? ' here' : '') + (todo ? ' todo' : ''), '<i>' + r.e + '</i><span>' + esc(r.n) + '</span>' + (todo ? '<em>★ task</em>' : done ? '<em>✓</em>' : '') + (i === room ? '<strong>you</strong>' : ''));
      b.type = 'button'; b.disabled = B.pa;
      b.setAttribute('aria-label', r.n + (i === room ? ', you are here' : '') + (todo ? ', you have a task here' : ''));
      b.onclick = function () { if (i === room) return; L.room = i; L.roomAt = Date.now(); send({ t: 'go', r: i }); draw(); };
      map.appendChild(b);
    });
    main.appendChild(map);
    var nd = S.tasks.filter(function (x, j) { return x[2] || L.done[j]; }).length;
    main.appendChild(H('p', 'muted msmall mcenter', 'This batch: ' + nd + ' of ' + S.tasks.length + ' tasks done. Rooms with ★ have one.'));
    foot(main, true);
  }
  function secretPanel() {
    var p = H('div', 'mcard msecret');
    if (S.role !== 'M') { p.innerHTML = '<p class="mkick">💧 Keeper</p><p>Nothing secret to do. Do your tasks, watch who goes where, and speak up in meetings.</p>'; return p; }
    var cool = sLeft(S.cool), fogIn = sLeft(S.fogIn), fog = B.fog > 0 && sLeft(B.fog) > 0;
    p.appendChild(H('p', 'mkick', '🫧 Muddler' + (S.mates && S.mates.length ? ' · with ' + S.mates.map(esc).join(', ') : '')));
    if (B.ph === 'shift' && S.alive && L.room == null) {
      var ks = Array.isArray(S.here) ? S.here.filter(function (h) { return !h[3]; }) : [];
      if (!ks.length) p.appendChild(H('p', 'muted', 'No Keeper in this room to muddle' + (typeof S.here === 'number' ? ' (well, you can\'t see in the fog)' : '') + '.'));
      else {
        p.appendChild(H('p', '', cool > 0 ? 'Muddle recharging: ' + T('cool') + ' s' : 'Muddle someone in this room' + (S.here.length > 1 ? ' <b>(careful: others will see!)</b>' : '') + ':'));
        var row = H('div', 'mrow');
        ks.forEach(function (h) { var b = H('button', 'mbtn mud', '🫧 ' + esc(h[1])); b.type = 'button'; b.disabled = cool > 0 || (L.mud && Date.now() - L.mudAt < 5000); b.onclick = function () { L.mud = h[0]; L.mudAt = Date.now(); send({ t: 'mud', p: h[0] }); draw(); }; row.appendChild(b); });
        p.appendChild(row);
      }
    }
    var fb = H('button', 'mbtn', fog ? '🌫️ Fog is rolling' : fogIn > 0 ? '🌫️ Fog ready in ' + T('fogIn') + ' s' : '🌫️ Roll in the fog'); fb.type = 'button';
    fb.disabled = fog || fogIn > 0 || B.pa || Date.now() - L.fogAt < 4000; fb.onclick = function () { L.fogAt = Date.now(); send({ t: 'fog' }); draw(); };
    p.appendChild(fb);
    p.appendChild(H('p', 'muted msmall', 'Fake tasks look real on your screen but don\'t fill the pump.'));
    return p;
  }
  function foot(main, playing) {
    var f = H('div', 'mfoot');
    if (playing && S && S.st === 'play') {
      if (B.ph === 'shift' && S.alive) { var bell = H('button', 'mbtn bell', '🔔 Ring the Duck Bell' + (S.bells ? ' (' + S.bells + ' left)' : '')); bell.type = 'button'; bell.disabled = !S.bells || B.pa || Date.now() - L.bellAt < 5000; bell.onclick = function () { if (!window.confirm('Ring the Duck Bell and call a meeting now?')) return; L.bellAt = Date.now(); send({ t: 'bell' }); draw(); }; f.appendChild(bell); }
      var sec = H('button', 'mbtn', L.secret ? '🙈 Hide secret panel' : '🤫 Secret panel'); sec.type = 'button'; sec.onclick = function () { L.secret = !L.secret; draw(); }; f.appendChild(sec);
    }
    var lv = H('button', 'mbtn ghost small', 'Leave room'); lv.type = 'button'; lv.onclick = leave; f.appendChild(lv);
    main.appendChild(f);
    if (L.secret && playing && S && S.st === 'play') main.appendChild(secretPanel());
  }
  function meeting(main) {
    var m = B.mt || {}, why = m.why === 'found' ? '🔔 ' + esc(m.by) + ' found ' + esc(m.vic) + ' in a puddle!' : m.why === 'bell' ? '🔔 ' + esc(m.by) + ' rang the Duck Bell!' : m.why === 'time' ? '🔔 Shift over: meeting time!' : '🔔 Meeting!';
    main.appendChild(H('div', 'mstrip', '<b>' + why + '</b><span class="mtimer small' + (left() < 10000 ? ' low' : '') + '">' + (B.pa ? '⏸' : '⏱ ' + T('left')) + '</span>'));
    msgs(main);
    if (m.fd && m.fd.length) main.appendChild(H('p', 'mlost', '🧺 New in the Lost &amp; Found: <b>' + m.fd.map(esc).join(', ') + '</b>'));
    if (B.ph === 'talk') {
      main.appendChild(H('div', 'mcard mcenter', '<h2>🗣️ Talk it over</h2><p>Where were you? Who did you see? Voting opens when the timer ends.</p>' + rosterHtml(false)));
      foot(main, true); return;
    }
    if (!S.alive) { main.appendChild(H('div', 'mcard mcenter', '<h2>You\'re out this time</h2><p>Watch the vote on the board. No hints!</p>' + rosterHtml(false))); foot(main, true); return; }
    if (S.vote != null) {
      var who = S.vote === 'skip' ? 'skip' : (B.pl.filter(function (r) { return r[0] === S.vote; })[0] || [])[1];
      main.appendChild(H('div', 'mcard mcenter', '<h2>✓ You voted' + (S.vote === 'skip' ? ' to skip' : ' for ' + esc(who)) + '</h2><p class="muted">Waiting for the others…</p>')); foot(main, true); return;
    }
    var sent = acts.some(function (a) { return a.t === 'vote'; });
    var c = H('div', 'mcard mvote', '<h2>🗳️ Who should go up the ladder?</h2>');
    if (sent) { c.appendChild(H('p', 'muted', 'Sending your vote…')); main.appendChild(c); return; }
    var g = H('div', 'mvotegrid');
    B.pl.filter(function (r) { return r[3] === 1 && r[0] !== me.pid; }).forEach(function (r) {
      var cr = M.critter(r[2]), b = H('button', 'mvoteb' + (L.voteSel === r[0] ? ' on' : ''), '<i style="--c:' + cr.c + '">' + cr.e + '</i><b>' + esc(r[1]) + '</b>'); b.type = 'button';
      b.setAttribute('aria-pressed', L.voteSel === r[0] ? 'true' : 'false');
      b.onclick = function () { L.voteSel = r[0]; draw(); }; g.appendChild(b);
    });
    var sk = H('button', 'mvoteb skip' + (L.voteSel === 'skip' ? ' on' : ''), '<i>⏭️</i><b>Skip</b>'); sk.type = 'button'; sk.onclick = function () { L.voteSel = 'skip'; draw(); }; g.appendChild(sk);
    c.appendChild(g);
    var ok = H('button', 'mbtn primary big', L.voteSel ? 'Confirm vote' : 'Pick someone (or Skip)'); ok.type = 'button'; ok.disabled = !L.voteSel || B.pa;
    ok.onclick = function () { send({ t: 'vote', p: L.voteSel }); L.voteSel = null; draw(); };
    c.appendChild(ok); main.appendChild(c);
  }
  function result(main) {
    var r = B.rs || {};
    var mine = r.out === me.pid;
    var h = r.out ? '<h2>🪜 ' + esc(r.n) + ' was sent up the ladder.</h2>' + (r.mud === true ? '<p class="mbig yes">They were a Muddler! 🫧</p>' : r.mud === false ? '<p class="mbig no">They were not a Muddler. 😬</p>' : '<p>Their role stays secret.</p>') : '<h2>' + (r.why === 'tie' ? '⚖️ A tie. No one goes up.' : r.why === 'none' ? 'No one voted.' : '⏭️ Skipped. No one goes up.') + '</h2>';
    main.appendChild(H('div', 'mcard mcenter', (mine ? '<p class="mkick">That\'s you!</p>' : '') + h + '<p class="muted">Next up in ' + T('left') + ' s</p>'));
    foot(main, false);
  }
  function over(main) {
    var w = B.win || {}, mySide = S.role, won = w.side && w.side === mySide;
    var c = H('div', 'mcard mcenter mwin ' + (w.side === 'K' ? 'keep' : w.side === 'M' ? 'mud' : ''),
      '<p class="mkick">' + (w.side === 'K' ? '🏆 Keepers win!' : w.side === 'M' ? '🫧 Muddlers win!' : 'Game over') + '</p><h2>' + (w.side ? (won ? 'You win! 🎉' : 'Your team lost this one.') : '') + '</h2><p>' + esc(w.why || '') + '</p>' +
      '<p>You were a <b>' + (mySide === 'M' ? 'Muddler' : 'Keeper') + '</b>.</p>');
    var roles = B.roles || [];
    c.appendChild(H('p', '', 'The Muddlers were: <b>' + B.pl.filter(function (r) { return roles.indexOf(r[0]) >= 0; }).map(function (r) { return esc(r[1]); }).join(', ') + '</b>'));
    main.appendChild(c);
    main.appendChild(H('p', 'muted mcenter', 'Stay here: the host may start another game.'));
    foot(main, false);
  }

  /* ---------- tasks ---------- */
  var openJ = null;
  function openTask(j) {
    closeTask(); openJ = j;
    var T = j === 'horn' ? M.TASKS.horn : M.TASKS[S.tasks[j][1]];
    taskBox.hidden = false; taskBox.innerHTML = '';
    var card = H('div', 'mtaskcard'); card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true'); card.setAttribute('aria-label', T.t);
    var x = H('button', 'mbtn ghost small mclose', '✕ Close'); x.type = 'button'; x.onclick = closeTask;
    card.appendChild(x); card.appendChild(H('h2', '', T.t));
    if (j !== 'horn' && S.role === 'M') card.appendChild(H('p', 'muted msmall', '(A fake task: it won\'t fill the pump, but it looks busy.)'));
    var box = H('div', 'mtaskbody'); card.appendChild(box);
    taskBox.appendChild(card);
    var startRoom = myRoom();
    T.go(box, function () {
      if (openJ !== j) return;
      if (j === 'horn') { L.fixAt = Date.now(); send({ t: 'fix' }); }
      else { L.done[j] = true; send({ t: 'task', j: j }); }
      box.innerHTML = '<p class="mbig mcenter">✅ Done!</p>';
      setTimeout(closeTask, 700);
    });
    card.dataset.room = startRoom;
    var f = card.querySelector('button.mtk, button.big'); if (f) f.focus();
  }
  function closeTask() { openJ = null; if (taskBox) { taskBox.hidden = true; taskBox.innerHTML = ''; } lastKey = ''; if (me && B) draw(); }
  // a task closes by itself if the shift ends, fog rolls in, or the player is muddled
  setInterval(function () {
    if (openJ == null || !B || !S) return;
    if (B.ph !== 'shift' || (openJ !== 'horn' && B.fog > 0 && sLeft(B.fog) > 0) || (openJ === 'horn' && !(B.fog > 0))) closeTask();
  }, 500);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openJ != null) closeTask(); });
  setInterval(function () { if (me && B) draw(); }, 500);

  me = load(); seqLoad();
  if (me && (!location.search.match(/[?&]r=([A-Za-z]{4})/) || location.search.match(/[?&]r=([A-Za-z]{4})/)[1].toUpperCase() === me.code)) { root.innerHTML = '<div class="mcard mcenter"><p class="mbig">Joining room ' + esc(me.code) + '…</p></div>'; poll(); }
  else joinScreen();
})();
