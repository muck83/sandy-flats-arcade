/* Squeeze Street: music and the open-the-stand reveal.
   Music: a short breezy loop made on the fly with Web Audio (no audio files). It plays only while game sound is on
   (the arcade's speaker button, sfa-fx.js) and the 🎵 button is on, starts after the first tap, pauses when the tab is hidden,
   and speeds up into a "rush" while the stand is open.
   Reveal: a street scene over the page. Customers walk up; buyers leave with a cup, the rest walk away saying why
   (too pricey, sold out, too sweet). Cups and takings count up, then the day's profit lands with confetti or a sad tune.
   Tap anywhere to skip. prefers-reduced-motion goes straight to the profit. */
(function () {
  'use strict';
  var W = window, D = document, FX = W.SFA_FX || null;

  /* ---------------- music ---------------- */
  var MKEY = 'sfa.squeeze.music', ac = null, out = null, timer = null, nextT = 0, step = 0, mood = 'calm', playing = false;
  function musicWanted() { var v = null; try { v = localStorage.getItem(MKEY); } catch (e) { } return v !== '0'; }
  function soundOn() { return FX ? !FX.muted() : false; }
  function hz(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  // F major: I - vi - IV - V, then IV - V - iii - vi (MIDI roots and chord tones)
  var BARS = [[53, [65, 69, 72]], [50, [62, 65, 69]], [46, [58, 62, 65]], [48, [60, 64, 67]],
    [46, [58, 62, 65]], [48, [60, 64, 67]], [45, [57, 60, 64]], [50, [62, 65, 69]]];
  // a hummable tune over the 8 bars: 8 eighth notes a bar, 0 = rest
  var TUNE = [72, 0, 74, 72, 69, 0, 67, 0, 69, 0, 72, 0, 74, 72, 69, 0, 70, 0, 69, 67, 65, 0, 67, 0, 67, 0, 69, 0, 72, 0, 0, 0,
    70, 0, 72, 70, 69, 0, 65, 0, 67, 0, 69, 72, 76, 0, 74, 0, 72, 0, 69, 67, 64, 0, 67, 0, 69, 0, 74, 0, 72, 0, 0, 0];
  function note(f, t, dur, type, vol) {
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
  }
  var nbuf = null;
  function shaker(t, vol) {
    if (!nbuf) { nbuf = ac.createBuffer(1, ac.sampleRate / 4, ac.sampleRate); var d = nbuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = nbuf; f.type = 'highpass'; f.frequency.value = 6000;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + 0.07);
  }
  function eighth() { return 60 / (mood === 'rush' ? 132 : 100) / 2; }
  function schedule() {
    if (!ac) return;
    var e = eighth();
    while (nextT < ac.currentTime + 0.2) {
      var bar = Math.floor(step / 8) % 8, i = step % 8, B = BARS[bar], t = nextT + (i % 2 ? e * 0.12 : 0);   // a little swing
      if (i === 0 || i === 4) note(hz(B[0] - 12), t, e * 1.8, 'triangle', 0.5);
      if (i === 3 || i === 7) note(hz(B[0] - 5), t, e * 0.9, 'triangle', 0.3);
      note(hz(B[1][i % 3]), t, e * 1.4, 'sine', 0.13);
      var m = TUNE[step % 64]; if (m) note(hz(m), t, e * 1.6, 'triangle', 0.22);
      if (i % 2) shaker(t, mood === 'rush' ? 0.14 : 0.07);
      nextT += e; step++;
    }
  }
  function startMusic() {
    if (playing || !musicWanted() || !soundOn() || D.hidden) return;
    var AC = W.AudioContext || W.webkitAudioContext; if (!AC) return;
    try {
      if (!ac) { ac = new AC(); out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination); }
      if (ac.state === 'suspended') ac.resume();
    } catch (e) { return; }
    playing = true; nextT = ac.currentTime + 0.1;
    out.gain.cancelScheduledValues(ac.currentTime); out.gain.setTargetAtTime(0.09, ac.currentTime, 0.4);
    timer = setInterval(schedule, 60); schedule();
  }
  function stopMusic() {
    if (!playing) return;
    playing = false; clearInterval(timer); timer = null;
    try { out.gain.cancelScheduledValues(ac.currentTime); out.gain.setTargetAtTime(0, ac.currentTime, 0.15); } catch (e) { }
  }
  function sync() { if (musicWanted() && soundOn() && !D.hidden) startMusic(); else stopMusic(); }
  ['pointerdown', 'keydown'].forEach(function (ev) { W.addEventListener(ev, function () { setTimeout(sync, 0); }, { capture: true, passive: true }); });
  D.addEventListener('visibilitychange', sync);
  W.addEventListener('storage', function (e) { if (e.key === MKEY || /^sfa\.fx\.mute/.test(e.key || '')) { paintMusic(); sync(); } });

  var mbtn = null;
  function paintMusic() {
    if (!mbtn) return;
    var on = musicWanted() && soundOn();
    mbtn.textContent = on ? '🎵 Music' : '🎵 Off'; mbtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    mbtn.title = on ? 'Music is on. Tap to turn it off.' : 'Music is off. Tap to turn it on (it turns game sound on too).';
  }
  function musicButton() {
    var b = mbtn = D.createElement('button'); b.type = 'button'; b.className = 'chip sq-music';
    b.addEventListener('click', function () {
      var on = musicWanted() && soundOn();
      try { localStorage.setItem(MKEY, on ? '0' : '1'); } catch (e) { }
      if (!on && FX && FX.muted()) FX.mute(false);   // turning music on turns game sound on too
      paintMusic(); setTimeout(sync, 0);
    });
    paintMusic();
    return b;
  }
  // the speaker (all game sound) and music buttons go in the top bar
  function bar() {
    var chips = D.querySelector('.topbar .chips'); if (!chips) return;
    if (FX && FX.speaker) { var sp = FX.speaker('chip'); sp.addEventListener('click', function () { setTimeout(function () { paintMusic(); sync(); }, 0); }); chips.insertBefore(sp, chips.firstChild); }
    chips.insertBefore(musicButton(), chips.firstChild.nextSibling);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', bar); else bar();

  /* ---------------- the reveal ---------------- */
  /* customers are arcade avatars with made-up looks (the same ones each time for a given week and day); without sfa-avatar.js, emoji */
  var AVS = W.SFA_AVATAR;
  function rng(seed) { var a = AVS.hash(seed); return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function custLook(seed) {
    var C = AVS.CAT, R = rng(seed);
    function pick(k, p) { return C[k] && R() < (p == null ? 1 : p) ? Math.floor(R() * C[k].items.length) : 0; }
    return AVS.encode({ b: pick('b'), e: pick('e'), m: pick('m'), h: pick('h', .4), a: pick('a', .3), t: 0, n: 0, k: pick('k'), p: pick('p', .1), r: pick('r', .5), c: pick('c'), o: pick('o', .5), q: pick('q') });
  }
  function customer(seed, k) {
    if (AVS) { try { var w = mk('i', 'rv-e av'); w.innerHTML = AVS.svg(custLook(seed), { size: 60, walk: true, label: 'Customer' }); return w; } catch (e) { } }
    return mk('i', 'rv-e', PEOPLE[k % PEOPLE.length]);
  }
  var PEOPLE = ['🧑', '👩', '👨', '🧒', '👧', '👦', '👵', '🧓', '👱', '🧔', '👩‍🦱', '👨‍🦰'];
  function sfx(n) { if (FX) FX.sfx(n); }
  function money(c) { var neg = c < 0; c = Math.abs(Math.round(c)); return (neg ? '−' : '') + '$' + Math.floor(c / 100) + '.' + ('0' + c % 100).slice(-2); }
  function mk(tag, cls, text) { var e = D.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // o: { d, wx: {k, label, icon, temp}, stand: svg html, me: the player's avatar svg html (or ''), seed: text for the customers' looks, base, sold, price, revenue, profit, why: 'pricey'|'soldout'|'sweet'|'', fines: [{label, amt}], great }
  function reveal(o, done) {
    var reduce = FX ? FX.reduced() : false, timers = [], finished = false, closed = false;
    function later(f, ms) { timers.push(setTimeout(f, ms)); }
    var ov = mk('div', 'rv-ov'); ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Day ' + o.d + ' at the stand');
    var scene = mk('div', 'rv-scene wx-' + o.wx.k);
    var sky = mk('div', 'rv-sky');
    if (o.wx.k === 'rain') sky.appendChild(mk('div', 'rv-rain'));
    if (o.wx.k === 'cloudy' || o.wx.k === 'rain') { sky.appendChild(mk('span', 'rv-cloud c1', '☁️')); sky.appendChild(mk('span', 'rv-cloud c2', '☁️')); }
    if (o.wx.k === 'sunny' || o.wx.k === 'hot') sky.appendChild(mk('span', 'rv-sun', '☀️'));
    if (o.wx.k === 'hot') sky.appendChild(mk('div', 'rv-heat'));
    scene.appendChild(sky);
    var title = mk('div', 'rv-title', 'Day ' + o.d + ' · ' + o.wx.label + ' ' + o.wx.temp + '°C');
    scene.appendChild(title);
    var stand = mk('div', 'rv-stand'); stand.innerHTML = o.stand; scene.appendChild(stand);
    var sign = mk('div', 'rv-sign', 'CLOSED'); scene.appendChild(sign);
    var me = null;
    if (o.me) { me = mk('div', 'rv-me'); me.innerHTML = o.me; scene.appendChild(me); }
    function react(cls, ms) { if (!me) return; me.classList.remove('hop', 'oops'); void me.offsetWidth; me.classList.add(cls); setTimeout(function () { me.classList.remove(cls); }, ms); }
    var crowd = mk('div', 'rv-crowd'); scene.appendChild(crowd);
    scene.appendChild(mk('div', 'rv-ground'));
    ov.appendChild(scene);
    var hud = mk('div', 'rv-hud'), cupsB = mk('b', null, '0'), cashB = mk('b', null, money(0));
    hud.appendChild(mk('span', null, '🥤 Cups sold ')); hud.appendChild(cupsB); hud.appendChild(mk('span', 'rv-sep', '·')); hud.appendChild(mk('span', null, '💰 Takings ')); hud.appendChild(cashB);
    ov.appendChild(hud);
    var fin = mk('div', 'rv-final'); fin.hidden = true; ov.appendChild(fin);
    var skip = mk('button', 'rv-skip', 'Skip ▶▶'); skip.type = 'button'; ov.appendChild(skip);
    D.body.appendChild(ov);
    D.body.classList.add('rv-lock');
    mood = 'rush';
    requestAnimationFrame(function () { ov.classList.add('in'); });

    var shownCups = 0;
    function setCups(n) { shownCups = Math.min(o.sold, n); cupsB.textContent = String(shownCups); cashB.textContent = money(shownCups * o.price); }

    function finale() {
      if (finished) return; finished = true;
      timers.forEach(clearTimeout); timers = [];
      setCups(o.sold); skip.hidden = true;
      mood = 'calm';
      fin.innerHTML = '';
      var up = o.profit >= 0;
      if (o.me) { var fme = mk('div', 'rv-fme ' + (up ? 'up' : 'down')); fme.innerHTML = o.me; fin.appendChild(fme); }
      fin.appendChild(mk('div', 'rv-fday', 'Day ' + o.d + (up ? ': you made' : ': you lost')));
      var big = mk('div', 'rv-big ' + (up ? 'up' : 'down'), money(0)); fin.appendChild(big);
      fin.appendChild(mk('div', 'rv-fsub', o.sold + ' cups sold at ' + money(o.price) + ' = ' + money(o.revenue) + ' in the till'));
      if (o.fines.length) { var fl = mk('div', 'rv-fines'); o.fines.forEach(function (f) { fl.appendChild(mk('span', null, '−' + money(f.amt) + ' ' + f.label)); }); fin.appendChild(fl); }
      var go = mk('button', 'btn primary big', 'See how you read the rules ▶'); go.type = 'button'; fin.appendChild(go);
      go.addEventListener('click', function (e) { e.stopPropagation(); close(); });
      fin.hidden = false;
      requestAnimationFrame(function () { fin.classList.add('in'); });
      var target = Math.abs(o.profit);
      if (reduce) big.textContent = money(target);
      else { var t0 = 0; requestAnimationFrame(function tick(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1000), e = 1 - Math.pow(1 - k, 3); big.textContent = money(target * e); if (k < 1 && !closed) requestAnimationFrame(tick); }); setTimeout(function () { big.textContent = money(target); }, 1300); }
      setTimeout(function () {
        if (up) { sfx(o.great ? 'win' : 'levelup'); if (FX && !reduce) FX.confetti({ ms: o.great ? 2800 : 1200 }); }
        else { sfx('lose'); if (FX) FX.shake(big); }
      }, reduce ? 0 : 650);
      go.focus();
    }
    function close() {
      if (closed) return; closed = true;
      timers.forEach(clearTimeout);
      ov.classList.remove('in'); ov.classList.add('out');
      D.body.classList.remove('rv-lock');
      setTimeout(function () { ov.remove(); done(); }, reduce ? 0 : 260);
    }
    skip.addEventListener('click', function (e) { e.stopPropagation(); finale(); });
    ov.addEventListener('click', function () { if (!finished) finale(); });
    ov.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (finished) close(); else finale(); } });
    ov.tabIndex = -1; ov.focus();
    if (reduce) { finale(); return; }

    // the sign flips to OPEN, then the customers come
    later(function () { sign.textContent = 'OPEN'; sign.classList.add('open'); sfx('whoosh'); }, 700);
    var figs = Math.max(1, Math.min(22, o.base)), buyers = o.base ? Math.round(o.sold / o.base * figs) : 0, leavers = figs - buyers;
    if (o.sold > 0 && buyers === 0) { buyers = 1; leavers = figs - 1; }
    // who comes in which order: sold out means the leavers come last; otherwise they mix in
    var order = [], i;
    if (o.why === 'soldout') { for (i = 0; i < buyers; i++) order.push(1); for (i = 0; i < leavers; i++) order.push(0); }
    else { var acc = 0; for (i = 0; i < figs; i++) { acc += buyers / figs; if (acc >= 0.999) { order.push(1); acc -= 1; } else order.push(0); } }
    var gap = Math.max(120, Math.min(280, 3200 / figs)), per = buyers ? o.sold / buyers : 0, bought = 0;
    var SAY = { pricey: 'Too pricey!', soldout: 'Sold out?!', sweet: 'Too sweet!', '': 'Not today' };
    order.forEach(function (buy, k) {
      later(function () {
        var p = mk('span', 'rv-p'); p.appendChild(customer((o.seed || '') + '|' + o.d + '|' + k, k * 7 + o.d));
        p.style.bottom = (8 + (k % 3) * 3) + '%';
        crowd.appendChild(p);
        requestAnimationFrame(function () { p.style.transitionDuration = '800ms'; p.style.left = buy ? '47%' : '30%'; });
        setTimeout(function () {
          if (buy) {
            bought++; setCups(bought === buyers ? o.sold : Math.round(bought * per));
            var cup = mk('span', 'rv-cup', '🥤'); p.appendChild(cup); sfx('coin'); react('hop', 420);
            setTimeout(function () { p.style.transitionDuration = '900ms'; p.style.left = '112%'; }, 180);
          } else {
            if (o.why === 'soldout' && !sign.classList.contains('out')) { sign.textContent = 'SOLD OUT'; sign.classList.add('out'); sfx('wrong'); }
            p.appendChild(mk('span', 'rv-say', SAY[o.why] || SAY[''])); p.classList.add('turn'); react('oops', 700);
            setTimeout(function () { p.style.transitionDuration = '900ms'; p.style.left = '-14%'; }, 420);
          }
          setTimeout(function () { p.remove(); }, 1600);
        }, 820);
      }, 1200 + k * gap);
    });
    later(finale, 1200 + figs * gap + 1500);
  }

  W.SQFX = { reveal: reveal, music: { sync: sync, playing: function () { return playing; } } };
})();
