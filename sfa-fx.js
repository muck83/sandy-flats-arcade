/* Sandy Flats "juice" kit: small shared effects for the lesson games. No dependencies.
   window.SFA_FX: burst, confetti, shake, pop, flash, float, countUp, banner, countdown, sfx, mute, muted, streak, speaker.
   Everything is safe to call anywhere: a missing element is a no-op, prefers-reduced-motion turns movement off,
   and sound is quiet, synthesized (no audio files), starts only after a tap or key press, and can be muted.
   Sound is ON by default on the teacher console and class screen and OFF by default on student devices. */
(function () {
  'use strict';
  if (window.SFA_FX) return;   // loaded twice: keep the first copy
  var W = window, D = document, FX = {};
  var HOST = /[?&](teach|screen)(=|&|$)/.test(location.search), KEY = 'sfa.fx.mute.' + (HOST ? 'host' : 'student');
  var GOLD = '#ffc94d', TEAL = '#35d0ba', COLORS = [GOLD, TEAL, '#ff6b6b', '#7aa2ff', '#c084fc', '#ffffff'];
  var MAXP = 150;   // particles alive at once, everything included (old Chromebooks)

  var rmq = null; try { rmq = W.matchMedia('(prefers-reduced-motion: reduce)'); } catch (e) { }
  function reduced() { return !!(rmq && rmq.matches); }
  FX.reduced = reduced;

  function isEl(x) { return !!(x && x.nodeType === 1); }
  function live(x) { return isEl(x) && x.isConnected !== false && D.documentElement.contains(x); }
  // an element (its centre), or {x, y} in viewport pixels
  function point(t) {
    if (!t) return null;
    if (isEl(t)) { if (!live(t)) return null; var r = t.getBoundingClientRect(); if (!r.width && !r.height) return null; return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
    if (typeof t.x === 'number' && typeof t.y === 'number' && isFinite(t.x) && isFinite(t.y)) return { x: t.x, y: t.y };
    return null;
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function list(v, d) { return Array.isArray(v) && v.length ? v : (typeof v === 'string' && v ? [v] : d); }

  /* ---------- styles ---------- */
  var CSS = [
    '.fx-layer{position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:2147483000}',
    '@keyframes fxPop{0%{transform:scale(1)}30%{transform:scale(1.18,.86)}55%{transform:scale(.92,1.1)}78%{transform:scale(1.04,.97)}100%{transform:scale(1)}}',
    '.fx-pop{animation:fxPop .42s cubic-bezier(.3,1.4,.5,1) both}',
    '@keyframes fxShake{0%,100%{transform:translate(0,0)}15%{transform:translate(calc(var(--fxp,6px)*-1),calc(var(--fxp,6px)*.5))}30%{transform:translate(var(--fxp,6px),calc(var(--fxp,6px)*-.6))}45%{transform:translate(calc(var(--fxp,6px)*-.7),calc(var(--fxp,6px)*-.4))}60%{transform:translate(calc(var(--fxp,6px)*.6),calc(var(--fxp,6px)*.5))}80%{transform:translate(calc(var(--fxp,6px)*-.3),0)}}',
    '.fx-shake{animation:fxShake var(--fxms,.4s) linear both}',
    '.fx-flashbox{position:fixed;pointer-events:none;z-index:2147483001;border-radius:inherit;opacity:0}',
    '@keyframes fxFlash{0%{opacity:.75}100%{opacity:0}}',
    '.fx-float{position:fixed;left:0;top:0;pointer-events:none;z-index:2147483002;font:800 28px/1 "Bricolage Grotesque",system-ui,sans-serif;white-space:nowrap;text-shadow:0 2px 0 rgba(0,0,0,.55),0 0 14px rgba(0,0,0,.45);will-change:transform,opacity}',
    '@keyframes fxFloat{0%{transform:translate(-50%,-50%) scale(.4);opacity:0}16%{transform:translate(-50%,-90%) scale(1.25);opacity:1}30%{transform:translate(-50%,-110%) scale(1)}100%{transform:translate(-50%,-260%) scale(1);opacity:0}}',
    '@keyframes fxFloatStill{0%{opacity:0}15%,70%{opacity:1}100%{opacity:0}}',
    '.fx-banner{position:fixed;left:0;right:0;top:34%;z-index:2147483003;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:.35em;padding:.5em 16px .6em;text-align:center;color:#1a1206;background:linear-gradient(90deg,rgba(255,201,77,0),rgba(255,201,77,.96) 14%,rgba(255,214,110,.98) 50%,rgba(255,201,77,.96) 86%,rgba(255,201,77,0));box-shadow:0 0 60px rgba(255,201,77,.35);font-size:clamp(22px,5.2vw,84px);transform-origin:50% 50%}',
    '.fx-banner b{font:400 1em/1.05 "Luckiest Guy","Bricolage Grotesque",system-ui,sans-serif;letter-spacing:.03em;text-shadow:0 .05em 0 rgba(255,255,255,.45)}',
    '.fx-banner i{font:700 max(14px,.36em)/1.2 "Bricolage Grotesque",system-ui,sans-serif;font-style:normal;opacity:.9}',
    '.fx-banner.t-warn{color:#fff;background:linear-gradient(90deg,rgba(214,48,49,0),rgba(214,48,49,.96) 14%,rgba(240,84,84,.98) 50%,rgba(214,48,49,.96) 86%,rgba(214,48,49,0));box-shadow:0 0 60px rgba(240,84,84,.4)}',
    '.fx-banner.t-warn b{text-shadow:0 .05em 0 rgba(0,0,0,.35)}',
    '.fx-banner.t-info{color:#04201c;background:linear-gradient(90deg,rgba(53,208,186,0),rgba(53,208,186,.96) 14%,rgba(110,231,214,.98) 50%,rgba(53,208,186,.96) 86%,rgba(53,208,186,0));box-shadow:0 0 60px rgba(53,208,186,.35)}',
    '@keyframes fxBanIn{0%{transform:translateX(-110%) skewX(-14deg);opacity:0}60%{transform:translateX(2%) skewX(-4deg);opacity:1}100%{transform:none;opacity:1}}',
    '@keyframes fxBanOut{0%{transform:none;opacity:1}100%{transform:translateX(110%) skewX(14deg);opacity:0}}',
    '@keyframes fxFade{0%{opacity:0}100%{opacity:1}}',
    '.fx-banner.fx-in{animation:fxBanIn .42s cubic-bezier(.2,.9,.3,1.15) both}',
    '.fx-banner.fx-out{animation:fxBanOut .32s ease-in both}',
    '.fx-count{position:fixed;inset:0;z-index:2147483004;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.1em;background:radial-gradient(ellipse at center,rgba(8,10,20,.72),rgba(8,10,20,.9));color:#ffc94d;text-align:center}',
    '.fx-count b{font:400 clamp(110px,34vmin,420px)/1 "Luckiest Guy","Bricolage Grotesque",system-ui,sans-serif;text-shadow:0 .04em 0 #7a4d00,0 0 .3em rgba(255,201,77,.55);display:block}',
    '.fx-count i{font:700 clamp(16px,3.4vmin,44px)/1.2 "Bricolage Grotesque",system-ui,sans-serif;font-style:normal;color:#fff;opacity:.92;padding:0 16px}',
    '@keyframes fxCount{0%{transform:scale(2.2);opacity:0}25%{transform:scale(.9);opacity:1}40%{transform:scale(1.05)}80%{transform:scale(1);opacity:1}100%{transform:scale(.7);opacity:0}}',
    '.fx-count b.fx-go{animation:fxCount .9s cubic-bezier(.2,.9,.3,1.1) both}',
    '.fx-count b.fx-last{color:#35d0ba;text-shadow:0 .04em 0 #0b5d52,0 0 .3em rgba(53,208,186,.6)}',
    /* helper classes for games */
    '@keyframes fxGlow{0%,100%{box-shadow:0 0 0 0 rgba(255,201,77,0),0 0 12px 0 var(--fxc,rgba(255,201,77,.45))}50%{box-shadow:0 0 0 3px var(--fxc,rgba(255,201,77,.45)),0 0 26px 4px var(--fxc,rgba(255,201,77,.45))}}',
    '.fx-glow{animation:fxGlow 1.4s ease-in-out infinite}',
    '@keyframes fxWobble{0%,100%{transform:rotate(0)}25%{transform:rotate(-4deg)}75%{transform:rotate(4deg)}}',
    '.fx-wobble{animation:fxWobble .5s ease-in-out infinite;transform-origin:50% 85%}',
    '@keyframes fxRise{0%{transform:translateY(14px);opacity:0}100%{transform:none;opacity:1}}',
    '.fx-rise{animation:fxRise .35s cubic-bezier(.2,.9,.3,1.2) both}',
    '@keyframes fxPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}',
    '.fx-pulse{animation:fxPulse .9s ease-in-out infinite}',
    '.fx-streak-warm{--fxc:rgba(255,201,77,.5);color:#ffc94d}',
    '.fx-streak-hot{--fxc:rgba(255,140,60,.6);color:#ff9d4d}',
    '.fx-streak-fire{--fxc:rgba(255,90,70,.7);color:#ff6b57}',
    '.fx-speaker{appearance:none;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);color:inherit;border-radius:999px;min-width:38px;height:34px;padding:0 9px;font-size:17px;line-height:1;cursor:pointer}',
    '.fx-speaker:hover{background:rgba(255,255,255,.16)}',
    '.fx-speaker.fx-off{opacity:.6}',
    '@media (prefers-reduced-motion: reduce){.fx-pop,.fx-shake,.fx-glow,.fx-wobble,.fx-rise,.fx-pulse{animation:none!important}.fx-banner.fx-in,.fx-banner.fx-out{animation:fxFade .2s both!important}.fx-count b.fx-go{animation:fxFade .2s both!important}}'
  ].join('\n');
  function styles() { if (D.getElementById('sfa-fx-css')) return; var s = D.createElement('style'); s.id = 'sfa-fx-css'; s.textContent = CSS; (D.head || D.documentElement).appendChild(s); }
  styles();

  /* ---------- particles: one shared canvas, one animation loop, stops itself when empty ---------- */
  var cv = null, cx = null, parts = [], raf = 0, lastT = 0, sprites = {};
  function canvas() {
    if (cv && cv.isConnected) return cv;
    if (!D.body) return null;
    cv = D.createElement('canvas'); cv.className = 'fx-layer'; cv.setAttribute('aria-hidden', 'true');
    D.body.appendChild(cv); cx = cv.getContext('2d'); size();
    return cv;
  }
  function size() { if (!cv) return; var w = W.innerWidth, h = W.innerHeight; if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } }
  W.addEventListener('resize', size);
  // emoji are drawn once to a small off-screen canvas, then stamped: much cheaper than fillText every frame
  function sprite(ch, px) {
    var k = ch + '|' + px; if (sprites[k]) return sprites[k];
    var c = D.createElement('canvas'), s = Math.ceil(px * 1.4); c.width = c.height = s;
    var g = c.getContext('2d'); g.font = px + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, s / 2, s / 2 + px * .06);
    return (sprites[k] = c);
  }
  function add(p) { if (parts.length >= MAXP) return false; parts.push(p); return true; }
  function run() { if (raf || !parts.length) return; lastT = 0; raf = W.requestAnimationFrame(tick); }
  function tick(t) {
    raf = 0;
    if (!cv || !cx) { parts.length = 0; return; }
    var dt = lastT ? Math.min(.05, (t - lastT) / 1000) : .016; lastT = t;
    cx.clearRect(0, 0, cv.width, cv.height);
    var h = cv.height, w = cv.width, k = 0;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.life -= dt; if (p.life <= 0 || p.y > h + 40 || p.x < -60 || p.x > w + 60) continue;
      p.vy += p.g * dt; p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      var a = p.life < p.fade ? p.life / p.fade : 1;
      cx.globalAlpha = a;
      if (p.img) { var s = p.size; cx.setTransform(1, 0, 0, 1, p.x, p.y); cx.rotate(p.rot); cx.drawImage(p.img, -s / 2, -s / 2, s, s); }
      else if (p.flat) { cx.setTransform(1, 0, 0, Math.cos(p.rot * 2.3), p.x, p.y); cx.rotate(p.rot); cx.fillStyle = p.color; cx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * .62); }
      else { cx.setTransform(1, 0, 0, 1, p.x, p.y); cx.fillStyle = p.color; cx.beginPath(); cx.arc(0, 0, p.size / 2, 0, 6.283); cx.fill(); }
      parts[k++] = p;
    }
    parts.length = k;
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = 1;
    if (k) raf = W.requestAnimationFrame(tick); else cx.clearRect(0, 0, cv.width, cv.height);
  }

  // burst(target, { count, colors, emoji, spread, gravity, size })
  FX.burst = function (target, o) {
    try {
      if (reduced()) return; var pt = point(target); if (!pt || !canvas()) return;
      o = o || {};
      var small = W.innerWidth < 600 ? .62 : 1;   // a phone: tighter and a little smaller, so it never hides the question
      var n = Math.max(1, Math.min(40, Math.round((o.count || 14) * (small < 1 ? .8 : 1)))), cols = list(o.colors, COLORS), em = list(o.emoji, null);
      var spread = (o.spread || 220) * small, g = o.gravity == null ? 700 : o.gravity, sz = (o.size || (em ? 24 : 7)) * (small < 1 ? .85 : 1);
      for (var i = 0; i < n; i++) {
        var ang = rnd(0, 6.283), sp = rnd(.35, 1) * spread * 2.2, life = rnd(.5, .9);
        var p = { x: pt.x, y: pt.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - spread * .9, g: g, drag: .965, rot: rnd(0, 6.283), vr: rnd(-7, 7), life: life, fade: .3, size: sz * rnd(.6, 1.2), color: pick(cols) };
        if (em && (i % 2 === 0 || !o.colors)) { p.img = sprite(pick(em), 32); p.size = (o.size || 24) * (small < 1 ? .85 : 1) * rnd(.8, 1.2); }
        if (!add(p)) break;
      }
      run();
    } catch (e) { }
  };

  // confetti({ ms, colors, emoji }): from the top of the whole screen
  var confT = 0;
  FX.confetti = function (o) {
    try {
      if (reduced() || !canvas()) return;
      o = o || {};
      var ms = Math.max(300, Math.min(6000, o.ms || 1800)), cols = list(o.colors, COLORS), em = list(o.emoji, null), end = Date.now() + ms;
      clearInterval(confT);
      var drop = function (n) {
        var w = W.innerWidth;
        for (var i = 0; i < n; i++) {
          var p = { x: rnd(0, w), y: rnd(-40, -10), vx: rnd(-60, 60), vy: rnd(120, 320), g: 260, drag: .992, rot: rnd(0, 6.283), vr: rnd(-6, 6), life: rnd(2.2, 3.4), fade: .5, size: rnd(9, 16), color: pick(cols), flat: true };
          if (em && Math.random() < .3) { p.img = sprite(pick(em), 32); p.size = rnd(22, 32); p.flat = false; }
          if (!add(p)) break;
        }
        run();
      };
      drop(46);
      confT = setInterval(function () { if (Date.now() > end || D.hidden) { clearInterval(confT); return; } drop(10); }, 130);
    } catch (e) { }
  };

  /* ---------- element effects ---------- */
  function replay(el, cls, ms) {
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    clearTimeout(el['_fx' + cls]); el['_fx' + cls] = setTimeout(function () { el.classList.remove(cls); }, ms);
  }
  // shake(el, { ms, power }): el defaults to the page
  FX.shake = function (el, o) {
    try {
      if (reduced()) return; el = el || D.body; if (!live(el)) return; o = o || {};
      var ms = Math.max(120, Math.min(1500, o.ms || 400));
      el.style.setProperty('--fxp', Math.max(1, Math.min(30, o.power || 6)) + 'px'); el.style.setProperty('--fxms', ms + 'ms');
      replay(el, 'fx-shake', ms + 40);
    } catch (e) { }
  };
  FX.pop = function (el) { try { if (reduced() || !live(el)) return; replay(el, 'fx-pop', 460); } catch (e) { } };
  // flash(el, color): a quick wash of colour over the element (no layout change); with no element, the whole screen
  FX.flash = function (el, color) {
    try {
      var r;
      if (el == null) r = { left: 0, top: 0, width: W.innerWidth, height: W.innerHeight };
      else { if (!live(el)) return; r = el.getBoundingClientRect(); if (!r.width || !r.height) return; }
      var f = D.createElement('div'); f.className = 'fx-flashbox';
      f.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;background:' + (color || '#fff') + ';animation:fxFlash ' + (reduced() ? '.25s' : '.4s') + ' ease-out both';
      if (el) { try { f.style.borderRadius = getComputedStyle(el).borderRadius; } catch (e2) { } }
      D.body.appendChild(f); setTimeout(function () { f.remove(); }, 460);
    } catch (e) { }
  };
  // float(target, text, { color, size }): "+10" rising from a point
  var floats = 0;
  FX.float = function (target, text, o) {
    try {
      var pt = point(target); if (!pt || !D.body || floats >= 14) return; o = o || {};
      var f = D.createElement('div'); f.className = 'fx-float'; f.textContent = String(text == null ? '' : text);
      var x = Math.max(30, Math.min(W.innerWidth - 30, pt.x)), y = Math.max(40, pt.y);
      f.style.cssText = 'left:' + x + 'px;top:' + y + 'px;color:' + (o.color || GOLD) + ';font-size:' + (o.size || 28) + 'px;animation:' + (reduced() ? 'fxFloatStill' : 'fxFloat') + ' 1.1s ease-out both;transform:translate(-50%,-110%)';
      D.body.appendChild(f); floats++; setTimeout(function () { f.remove(); floats--; }, 1150);
    } catch (e) { }
  };
  // countUp(el, from, to, ms): whole numbers
  FX.countUp = function (el, from, to, ms) {
    try {
      if (!isEl(el)) return; from = +from || 0; to = +to || 0; ms = Math.max(0, Math.min(4000, ms == null ? 600 : ms));
      if (el._fxCU) W.cancelAnimationFrame(el._fxCU);
      if (reduced() || !ms || from === to || D.hidden) { el.textContent = String(Math.round(to)); return; }
      var t0 = 0, last = null;
      var step = function (t) {
        if (!t0) t0 = t; var k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3), v = Math.round(from + (to - from) * e);
        if (v !== last) { el.textContent = String(v); last = v; }
        if (k < 1) el._fxCU = W.requestAnimationFrame(step); else el._fxCU = 0;
      };
      el._fxCU = W.requestAnimationFrame(step);
      setTimeout(function () { if (el._fxCU) { W.cancelAnimationFrame(el._fxCU); el._fxCU = 0; el.textContent = String(Math.round(to)); } }, ms + 400);   // hidden tab: land on the number anyway
    } catch (e) { }
  };
  // banner(text, { sub, ms, tone }): one at a time, the newest wins
  var ban = null, banT = 0, banT2 = 0;
  FX.banner = function (text, o) {
    try {
      if (!D.body) return; o = o || {};
      clearTimeout(banT); clearTimeout(banT2); if (ban) ban.remove();
      var b = ban = D.createElement('div'); b.className = 'fx-banner fx-in t-' + (o.tone === 'warn' || o.tone === 'info' ? o.tone : 'win'); b.setAttribute('role', 'status');
      var t = D.createElement('b'); t.textContent = String(text == null ? '' : text); b.appendChild(t);
      if (o.sub) { var s = D.createElement('i'); s.textContent = String(o.sub); b.appendChild(s); }
      D.body.appendChild(b);
      banT = setTimeout(function () { b.classList.remove('fx-in'); b.classList.add('fx-out'); banT2 = setTimeout(function () { b.remove(); if (ban === b) ban = null; }, 340); }, Math.max(600, Math.min(8000, o.ms || 1800)));
    } catch (e) { }
  };
  // countdown({ from, sub, go, tick, done }): a 3-2-1 over the whole screen; `done` always runs, also with reduced motion.
  // `left` (ms until zero) lets every device land on GO at the same moment.
  var cd = null, cdT = 0;
  FX.countdown = function (o) {
    try {
      o = o || {}; clearInterval(cdT); if (cd) cd.remove();
      var from = Math.max(1, Math.min(9, o.from || 3)), end = Date.now() + (o.left != null ? Math.max(0, o.left) : from * 1000), goTxt = o.go || 'GO!';
      if (!D.body) { if (o.done) o.done(); return; }
      var box = cd = D.createElement('div'); box.className = 'fx-count'; var num = D.createElement('b'); box.appendChild(num);
      if (o.sub) { var s = D.createElement('i'); s.textContent = String(o.sub); box.appendChild(s); }
      D.body.appendChild(box);
      var shown = null, fin = false;
      var draw = function () {
        var left = end - Date.now(), n = Math.ceil(left / 1000);
        if (left <= -700) { if (!fin) { fin = true; clearInterval(cdT); box.remove(); if (cd === box) cd = null; } return; }
        var lab = n <= 0 ? goTxt : String(Math.min(from, n));
        if (lab === shown) return; shown = lab;
        num.textContent = lab; num.className = n <= 0 ? 'fx-go fx-last' : 'fx-go'; void num.offsetWidth;
        if (n <= 0) { FX.sfx('levelup'); if (o.done) { try { o.done(); } catch (e2) { } } } else FX.sfx('tick');
      };
      draw(); cdT = setInterval(draw, 100);
    } catch (e) { try { if (o && o.done) o.done(); } catch (e3) { } }
  };

  /* ---------- sound: tiny WebAudio synth ---------- */
  var ac = null, master = null, unlocked = false, mutedV = null, lastPlay = {}, voices = 0;
  function readMute() { var v = null; try { v = W.localStorage.getItem(KEY); } catch (e) { } return v === '1' ? true : v === '0' ? false : !HOST; }
  FX.muted = function () { if (mutedV == null) mutedV = readMute(); return mutedV; };
  FX.mute = function (b) {
    mutedV = !!b; try { W.localStorage.setItem(KEY, mutedV ? '1' : '0'); } catch (e) { }
    if (master && ac) { try { master.gain.setTargetAtTime(mutedV ? 0 : VOL, ac.currentTime, .02); } catch (e2) { } }
    Array.prototype.forEach.call(D.querySelectorAll('.fx-speaker'), paint);
    return mutedV;
  };
  // the console's sound switch reaches the class screen (same browser, another window) through the storage event
  W.addEventListener('storage', function (e) { if (e.key !== KEY) return; mutedV = readMute(); if (master && ac) { try { master.gain.setTargetAtTime(mutedV ? 0 : VOL, ac.currentTime, .02); } catch (e2) { } } Array.prototype.forEach.call(D.querySelectorAll('.fx-speaker'), paint); });
  var VOL = .16;   // quiet on purpose
  function unlock() {
    unlocked = true;
    if (ac && ac.state === 'suspended') { try { ac.resume(); } catch (e) { } }
  }
  ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { W.addEventListener(ev, unlock, { capture: true, passive: true }); });
  function ctx() {
    if (!unlocked) return null;
    if (!ac) {
      var AC = W.AudioContext || W.webkitAudioContext; if (!AC) return null;
      try { ac = new AC(); master = ac.createGain(); master.gain.value = FX.muted() ? 0 : VOL; master.connect(ac.destination); } catch (e) { ac = null; return null; }
    }
    if (ac.state === 'suspended') { try { ac.resume(); } catch (e2) { } }
    return ac;
  }
  function tone(f, at, dur, type, vol, to) {
    var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + at;
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || .5, t + .012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .03);
    voices++; o.onended = function () { voices--; try { g.disconnect(); } catch (e) { } };
  }
  var noiseBuf = null;
  function noise(at, dur, vol, f0, f1, q) {
    if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    var s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime + at;
    s.buffer = noiseBuf; fl.type = q ? 'bandpass' : 'lowpass'; fl.Q.value = q || .7; fl.frequency.setValueAtTime(f0, t); if (f1) fl.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || .5, t + .015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + dur + .03);
    voices++; s.onended = function () { voices--; try { g.disconnect(); } catch (e) { } };
  }
  var SOUNDS = {
    tap: function () { tone(520, 0, .06, 'triangle', .35, 380); },
    right: function () { tone(660, 0, .11, 'triangle', .5); tone(990, .09, .2, 'triangle', .5); },
    wrong: function () { tone(220, 0, .16, 'sawtooth', .22, 150); tone(160, .13, .22, 'sawtooth', .2, 110); },
    combo: function () { tone(660, 0, .08, 'square', .2); tone(880, .07, .08, 'square', .2); tone(1175, .14, .08, 'square', .2); tone(1568, .21, .2, 'triangle', .45); },
    levelup: function () { tone(523, 0, .12, 'triangle', .5); tone(659, .1, .12, 'triangle', .5); tone(784, .2, .12, 'triangle', .5); tone(1047, .3, .34, 'triangle', .55); },
    win: function () { [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { tone(f, i * .12, i === 6 ? .6 : .14, 'triangle', .5); }); tone(262, .72, .6, 'sine', .4); },
    lose: function () { tone(392, 0, .22, 'triangle', .4, 370); tone(330, .22, .22, 'triangle', .4, 311); tone(262, .44, .5, 'triangle', .4, 196); },
    tick: function () { tone(1100, 0, .045, 'square', .16); },
    whoosh: function () { noise(0, .34, .5, 300, 3200, 1.2); },
    coin: function () { tone(988, 0, .07, 'square', .22); tone(1319, .07, .26, 'square', .22); },
    boom: function () { tone(140, 0, .42, 'sine', .9, 38); noise(0, .38, .6, 1400, 120); },
    splash: function () { noise(0, .12, .5, 2600, 700, .9); noise(.06, .4, .4, 1800, 300); tone(420, 0, .16, 'sine', .25, 160); }
  };
  // sfx(name): nothing happens before the first tap or key press, or while muted
  FX.sfx = function (name) {
    try {
      var f = SOUNDS[name]; if (!f || FX.muted() || D.hidden) return;
      var now = Date.now(); if (now - (lastPlay[name] || 0) < 70 || voices > 14) return;
      if (!ctx()) return; lastPlay[name] = now; f();
    } catch (e) { }
  };

  /* ---------- streaks ---------- */
  // streak(n): '' (0-1 in a row), 'warm' (2-3), 'hot' (4-6), 'fire' (7+)
  FX.streak = function (n) { n = +n || 0; return n >= 7 ? 'fire' : n >= 4 ? 'hot' : n >= 2 ? 'warm' : ''; };
  // streakClass(el, n): puts fx-streak-warm / -hot / -fire on the element (and fx-glow from 'hot' up); returns the tier
  FX.streakClass = function (el, n) {
    var t = FX.streak(n); if (!isEl(el)) return t;
    el.classList.remove('fx-streak-warm', 'fx-streak-hot', 'fx-streak-fire'); if (t) el.classList.add('fx-streak-' + t);
    el.classList.toggle('fx-glow', t === 'hot' || t === 'fire');
    return t;
  };

  /* ---------- a small speaker button (students, or anywhere) ---------- */
  function paint(b) { var m = FX.muted(); b.textContent = m ? '🔇' : '🔊'; b.classList.toggle('fx-off', m); b.setAttribute('aria-pressed', m ? 'false' : 'true'); b.title = m ? 'Sound is off. Tap to turn game sounds on.' : 'Sound is on. Tap to turn it off.'; }
  FX.speaker = function (cls) {
    var b = D.createElement('button'); b.type = 'button'; b.className = 'fx-speaker' + (cls ? ' ' + cls : ''); b.setAttribute('aria-label', 'Game sounds');
    paint(b);
    b.addEventListener('click', function () { FX.mute(!FX.muted()); unlock(); if (!FX.muted()) FX.sfx('coin'); });
    return b;
  };
  FX.host = HOST;
  FX.colors = { gold: GOLD, teal: TEAL, red: '#ff6b6b', blue: '#7aa2ff', all: COLORS.slice() };

  W.SFA_FX = FX;
})();
