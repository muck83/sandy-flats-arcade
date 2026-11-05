/* 👗 The fashion show: every student's avatar (built in the Wardrobe, avatar.html) walks the catwalk, one after
   another, on the class screen and every device. Loaded by sfa-lesson.js when the teacher starts one.

   Sync: students send their look once a lesson (q "zlookx1": "lk1;<look>;<level>", see lookSync in sfa-lesson.js).
   The console collects the looks, shuffles the order and steps through it. The live state carries the show
   (counts zfid: its id; zfs: [state, walker number, how many, seconds each]) and the spotlight (q "zshow":
   "W:name~look~level~fingerprint#Q:next name", and at the end "G:" every look for the group photo).
   Each screen starts the walk the moment it sees a new walker, so nothing needs a shared clock. */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API, SFA = window.SFA, AV = window.SFA_AVATAR;
  if (!A || !SFA || !AV) return;
  var H = A.H, el = A.el, esc = SFA.esc, FINALE = 7;

  function sh3(sid) { var h = 5381, t = String(sid); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return (h % 46656).toString(36); }
  function clean(n) { return String(n || '').replace(/[~,#|;]/g, '').slice(0, 12); }
  function showOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zfs) || !Array.isArray(c.zfid)) return null;
    var z = c.zfs, sp = Lv.spot && Lv.spot.q === 'zshow' ? String(Lv.spot.text || '') : '', w = null, next = '', group = [];
    sp.split('#').forEach(function (part) {
      var k = part.slice(0, 2), v = part.slice(2);
      if (k === 'W:' && v) { var p = v.split('~'); w = { n: p[0], look: p[1], lv: +p[2] || 1, fp: p[3] || '' }; }
      if (k === 'Q:') next = v;
      if (k === 'G:' && v) group = v.split(',');
    });
    return { id: A.decRun(c.zfid), state: z[0], i: z[1] || 0, n: z[2] || 0, per: z[3] || 5, w: w, next: next, group: group };
  }

  /* ---------- styles ---------- */
  (function () {
    if (document.getElementById('sfaShowCss')) return;
    var s = document.createElement('style'); s.id = 'sfaShowCss';
    s.textContent = [
      '.fs{position:fixed;inset:0;z-index:92;overflow:hidden;background:radial-gradient(ellipse at 50% 0%,#3a1f4f 0%,#120a1c 60%,#07040c 100%);color:#F3EFE7;font-family:"Bricolage Grotesque",system-ui,sans-serif}',
      '.fs .fstop{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 16px;z-index:5}',
      '.fs .fstitle{font:400 clamp(20px,3.4vw,40px) "Luckiest Guy",system-ui;color:#FFE14D;text-shadow:0 3px 0 #141428}.fs .fscount{font-weight:800;font-size:clamp(14px,2vw,22px);opacity:.85}',
      '.fs .fslight{position:absolute;top:-10%;width:40%;height:120%;background:linear-gradient(180deg,rgba(255,240,180,.22),rgba(255,240,180,0) 80%);clip-path:polygon(45% 0,55% 0,100% 100%,0 100%);mix-blend-mode:screen;animation:fssweep 6s ease-in-out infinite alternate}',
      '.fs .fslight.l{left:5%;transform-origin:50% 0}.fs .fslight.r{right:5%;animation-delay:-3s}',
      '@keyframes fssweep{from{transform:rotate(-12deg)}to{transform:rotate(12deg)}}',
      '.fs .fsrun{position:absolute;left:50%;bottom:0;width:min(70vw,720px);height:62%;transform:translateX(-50%);background:linear-gradient(180deg,#2a1a3a,#4a2a5e);clip-path:polygon(38% 0,62% 0,100% 100%,0 100%);box-shadow:inset 0 0 60px rgba(0,0,0,.6)}',
      '.fs .fsrun:before,.fs .fsrun:after{content:"";position:absolute;top:0;bottom:0;width:50%;background:repeating-linear-gradient(180deg,transparent 0 22px,rgba(255,225,77,.9) 22px 28px)}',
      '.fs .fsrun:before{left:0;clip-path:polygon(76% 0,77.5% 0,2% 100%,0 100%)}.fs .fsrun:after{right:0;clip-path:polygon(22.5% 0,24% 0,100% 100%,98% 100%)}',
      '.fs .fswalk{position:absolute;left:50%;top:30%;transform-origin:50% 100%;z-index:3}',
      '.fs .fswalk .av{filter:drop-shadow(0 10px 18px rgba(0,0,0,.55))}',
      '.fs .fscard{position:absolute;left:50%;bottom:5%;transform:translateX(-50%);z-index:4;min-width:min(86vw,420px);text-align:center;padding:10px 22px 12px;border-radius:20px;background:rgba(20,10,30,.88);border:3px solid #FFE14D;box-shadow:0 0 30px rgba(255,225,77,.35);opacity:0;animation:fscard .5s cubic-bezier(.2,1.6,.4,1) forwards}',
      '.fs .fscard b{display:block;font:400 clamp(28px,5vw,58px)/1.05 "Luckiest Guy",system-ui}.fs .fscard i{display:block;font-style:normal;font-weight:800;color:#FFE14D;font-size:clamp(14px,2vw,22px)}.fs .fscard small{display:block;opacity:.8;font-size:clamp(12px,1.6vw,18px);margin-top:2px}',
      '@keyframes fscard{from{opacity:0;transform:translate(-50%,30px) scale(.8)}to{opacity:1;transform:translate(-50%,0) scale(1)}}',
      '.fs .fsnext{position:absolute;right:16px;bottom:12px;z-index:4;font-weight:800;opacity:.75;font-size:clamp(12px,1.6vw,18px)}',
      '.fs .fsme{position:absolute;left:50%;top:13%;transform:translateX(-50%);z-index:6;font:400 clamp(22px,4vw,44px) "Luckiest Guy",system-ui;color:#FF8FD1;text-shadow:0 3px 0 #141428;animation:fsme .6s ease-in-out infinite alternate;white-space:nowrap}',
      '@keyframes fsme{to{transform:translateX(-50%) scale(1.08)}}',
      '.fs .fsflash{position:absolute;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.95),rgba(255,255,255,0) 65%);pointer-events:none;z-index:2;animation:fsflash .35s ease-out forwards}',
      '@keyframes fsflash{from{opacity:1;transform:scale(.4)}to{opacity:0;transform:scale(1.4)}}',
      '.fs .fsgroup{position:absolute;left:0;right:0;bottom:8%;display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-end;gap:2px 0;padding:0 2vw;z-index:3}',
      '.fs .fsgroup .av{animation:fsbow 1.2s ease-in-out infinite alternate}@keyframes fsbow{0%,60%{transform:none}100%{transform:rotate(-8deg) translateY(4px)}}',
      '.fs .fsend{position:absolute;left:50%;top:22%;transform:translateX(-50%);text-align:center;z-index:4}.fs .fsend h1{margin:0;font:400 clamp(36px,7vw,84px) "Luckiest Guy",system-ui;color:#FFE14D;text-shadow:0 4px 0 #141428}',
      '.fs .fsclap{position:absolute;left:16px;bottom:12px;z-index:6;width:60px;height:60px;border-radius:50%;border:3px solid #FFE14D;background:rgba(20,10,30,.8);font-size:30px;cursor:pointer}',
      '.fs .fsheart{position:absolute;z-index:5;font-size:30px;pointer-events:none;animation:fsheart 1.6s ease-out forwards}@keyframes fsheart{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-220px) scale(1.4)}}',
      '.fs .fsback{position:absolute;right:14px;top:58px;z-index:7}',
      '@media (prefers-reduced-motion:reduce){.fs .fslight,.fs .fsme,.fs .fsgroup .av{animation:none}}'
    ].join('\n');
    document.head.appendChild(s);
  })();

  /* ---------- every screen ---------- */
  var root = null, V = null;
  function sync() {
    var b = A.isLive() || A.MODE === 'screen' ? showOf(A.live()) : null;
    if (!b || !b.state) { if (!(V && V.watch)) close(); return; }
    apply(b);
  }
  function open(b) {
    close();
    V = { id: b.id, i: -1, st: -1 };
    root = H('div', 'fs'); root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Fashion show');
    document.body.appendChild(root); document.body.classList.add('boarding');
    V.fl = setInterval(function () { if (!root || V.st !== 1) return; var f = H('div', 'fsflash'); f.style.left = (8 + Math.random() * 84) + '%'; f.style.top = (30 + Math.random() * 50) + '%'; root.appendChild(f); setTimeout(function () { f.remove(); }, 400); }, 700);
  }
  function close() { if (!root) return; clearInterval(V.fl); root.remove(); root = null; V = null; document.body.classList.remove('boarding'); }
  function apply(b) {
    if (!root || V.id !== b.id) { var w = V && V.watch; open(b); V.watch = w; }
    if (b.state === V.st && b.i === V.i) return;
    V.st = b.state; V.i = b.i;
    draw(b);
  }
  function me(b) { return A.MODE === 'student' && A.S.me && b.w && b.w.fp === sh3(A.S.me.sid); }
  function wearing(look) {
    var L = AV.decode(look), out = [];
    ['h', 'a', 't'].forEach(function (k) { if (L[k]) out.push(AV.CAT[k].items[L[k]].n); });
    if (AV.CAT.b.items[L.b].fx) out.unshift(AV.CAT.b.items[L.b].n);
    return out;
  }
  function draw(b) {
    root.innerHTML = '';
    root.appendChild(H('div', 'fslight l')); root.appendChild(H('div', 'fslight r')); root.appendChild(H('div', 'fsrun'));
    root.appendChild(H('div', 'fstop', '<span class="fstitle">👗 SANDY FLATS FASHION SHOW</span><span class="fscount">' + (b.state === 1 ? (b.i + 1) + ' of ' + b.n : '🎉') + '</span>'));
    if (V.watch) { var x = el('button', { type: 'button', 'class': 'btn fsback', text: '✕ Back to the console' }); x.onclick = function () { close(); }; root.appendChild(x); }
    if (b.state === 2) {   // the finale: everyone takes a bow
      root.appendChild(H('div', 'fsend', '<h1>THAT\'S THE SHOW!</h1><p>' + b.n + ' looks on the catwalk. Give yourselves a round of applause.</p>'));
      var g = H('div', 'fsgroup'), sz = Math.max(44, Math.min(110, Math.floor(window.innerWidth * 0.9 / Math.max(1, Math.min(b.group.length, 14)))));
      b.group.forEach(function (look) { var d = document.createElement('div'); d.innerHTML = AV.svg(look, { size: sz }); g.appendChild(d.firstChild); });
      root.appendChild(g); clapBtn(); A.confetti(); return;
    }
    if (!b.w) return;
    var big = Math.min(window.innerHeight * 0.42, 300), wk = H('div', 'fswalk', AV.svg(b.w.look, { size: big, walk: true, label: b.w.n + '\'s avatar' }));
    root.appendChild(wk);
    var per = Math.max(3, b.per) * 1000;
    // in from the back of the catwalk, a pose at the front, then off to the side
    try {
      wk.animate([
        { transform: 'translateX(-50%) scale(.32)', top: '22%', offset: 0 },
        { transform: 'translateX(-50%) scale(1)', top: '34%', offset: 0.42 },
        { transform: 'translateX(-50%) scale(1.05) rotate(-6deg)', top: '34%', offset: 0.55 },
        { transform: 'translateX(-50%) scale(1.05) rotate(6deg)', top: '33%', offset: 0.66 },
        { transform: 'translateX(-50%) scale(1)', top: '34%', offset: 0.8 },
        { transform: 'translateX(120%) scale(.9)', top: '36%', offset: 1 }
      ], { duration: per, fill: 'forwards', easing: 'ease-in-out' });
    } catch (e) { wk.style.transform = 'translateX(-50%)'; }
    var wr = wearing(b.w.look);
    var card = H('div', 'fscard', '<b class="' + AV.nameCls(b.w.look) + '">' + esc(b.w.n) + '</b><i>⭐ Level ' + b.w.lv + ' · ' + esc(AV.title(b.w.lv)) + '</i>' + (wr.length ? '<small>Wearing: ' + esc(wr.join(' · ')) + '</small>' : ''));
    card.style.animationDelay = Math.round(per * 0.38) + 'ms'; root.appendChild(card);
    if (b.next) root.appendChild(H('div', 'fsnext', 'Next up: <b>' + esc(b.next) + '</b>'));
    if (me(b)) root.appendChild(H('div', 'fsme', '🌟 YOU\'RE ON THE RUNWAY! 🌟'));
    clapBtn();
  }
  // a clap on this device: hearts float up (just for fun, nothing is sent)
  function clapBtn() {
    if (A.MODE !== 'student') return;
    var c = el('button', { type: 'button', 'class': 'fsclap', 'aria-label': 'Clap', text: '👏' });
    c.onclick = function () { for (var i = 0; i < 3; i++) (function (i) { setTimeout(function () { if (!root) return; var h = H('div', 'fsheart', ['💖', '👏', '✨', '🔥'][Math.floor(Math.random() * 4)]); h.style.left = (6 + Math.random() * 20) + '%'; h.style.bottom = '70px'; root.appendChild(h); setTimeout(function () { h.remove(); }, 1700); }, i * 120); })(i); };
    root.appendChild(c);
  }

  /* ---------- the console ---------- */
  function C() { return A.console_().show; }
  function start(per) {
    var ids = {}; A.rosterIn().forEach(function (r) { ids[r.sid] = r; });
    var looks = {}, here = {};
    (A.consoleAnswers() || []).forEach(function (a) {
      if (!ids[a.sid]) return;
      if (a.q === 'zlookx1') { var m = String(a.answer).match(/^lk1;([0-9a-z]{1,12});(\d+)/); if (m && (!looks[a.sid] || String(a.time) >= looks[a.sid].t)) looks[a.sid] = { look: m[1], lv: +m[2], t: String(a.time) }; }
      if (!A.beforeRun(a)) here[a.sid] = 1;
    });
    var who = Object.keys(here); Object.keys(looks).forEach(function (s) { if (!here[s]) who.push(s); });
    if (!who.length) { SFA.toast('Nobody has joined yet. Wait for students to join, then start the show.', 4000); A.consolePanel(); return; }
    for (var i = who.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = who[i]; who[i] = who[j]; who[j] = t; }
    var order = who.map(function (sid) { var r = ids[sid], L = looks[sid]; return { sid: sid, n: clean(A.first(r.name).replace(/[^A-Za-zÀ-ÿ' -]/g, '')), look: L ? L.look : AV.defLook(sid), lv: L ? L.lv : 1 }; });
    A.console_().show = { id: Math.round(Date.now() / 1000) * 1000, state: 1, per: Math.max(3, per || 5), order: order, i: 0, at: Date.now() };
    A.pushLive(); A.consolePanel();
    SFA.toast('👗 The show is on! ' + order.length + ' looks, about ' + Math.ceil(order.length * (per || 5) / 60) + ' minute' + (order.length * (per || 5) > 60 ? 's' : '') + '.', 3500);
  }
  function next() { var K = C(); if (!K) return; if (K.i + 1 >= K.order.length) { K.state = 2; K.at = Date.now(); } else { K.i++; K.at = Date.now(); } A.pushLive(); A.consolePanel(); }
  function end() { A.console_().show = null; if (root) close(); A.pushLive(); A.consolePanel(); }
  function tick() {
    var K = C(); if (!K) return;
    if (K.state === 1 && Date.now() - K.at >= K.per * 1000) next();
    else if (K.state === 2 && Date.now() - K.at >= FINALE * 1000) end();
    if (root && V && V.watch) apply(watchState());
  }
  function counts(out) {
    var K = C(); if (!K) return;
    out.zfid = A.encRun(K.id); out.zfs = [K.state, K.i, Math.min(9999, K.order.length), K.per];
  }
  function spot() {
    var K = C(), w = K.order[K.i], nx = K.order[K.i + 1];
    if (K.state === 2) return { q: 'zshow', text: ('G:' + K.order.map(function (o) { return o.look; }).join(',')).slice(0, 598) };
    return { q: 'zshow', text: 'W:' + w.n + '~' + w.look + '~' + w.lv + '~' + sh3(w.sid) + (nx ? '#Q:' + nx.n : '') };
  }
  function watchState() { var out = {}; counts(out); return showOf({ lesson: A.LID, counts: out, spot: spot() }); }
  function section(p) {
    var K = C(), sec = H('div', 'sect'), w = K.order[K.i];
    sec.appendChild(H('h3', '', '👗 Fashion show · ' + (K.state === 1 ? (K.i + 1) + ' of ' + K.order.length + ': ' + esc(w.n) + ' on the catwalk' : 'the finale')));
    var r = H('div', 'row');
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: '👁 Show it here', onclick: function () { var b = watchState(); open(b); V.watch = true; apply(b); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '⏭ Next', onclick: next }));
    r.appendChild(el('button', { type: 'button', 'class': 'btn', text: 'End the show', onclick: end }));
    sec.appendChild(r);
    sec.appendChild(H('p', 'muted', 'Up next: ' + K.order.slice(K.i + 1, K.i + 6).map(function (o) { return esc(o.n); }).join(', ') + (K.order.length > K.i + 6 ? '…' : '')));
    p.appendChild(sec);
  }
  (A.every || function (f, ms) { setInterval(f, ms); })(function () { if (A.MODE === 'teach' && A.console_() && C()) tick(); }, 1000);

  window.SFA_SHOW = { sync: sync, start: start, counts: counts, spot: spot, section: section, showOf: showOf };
})();
