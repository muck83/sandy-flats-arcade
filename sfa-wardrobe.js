/* 👕 The Wardrobe: where students make their avatar their own (sfa-avatar.js has the parts, prices, wallet and effort unlocks).
   SFA_WARDROBE.mount(box) draws it into any element: the Wardrobe page (avatar.html) and the first slide of a live
   lesson both use it. Needs sfa-kit.js, sfa-sync.js and sfa-avatar.js first.

   Built for a phone: the avatar stays in view at the top, the parts are in a few groups (Body, Hair, Face, Outfit, Head,
   Extras, Friends, Moves, Card), and there is a Surprise me button, an Undo, saved looks and dyes (recolour the hat, extras or pet). Free parts go on with one
   tap; coin parts are tried on first and bought from the bar at the bottom; effort parts (🎯) are never sold: the bar
   says what earns them and how far along the student is.

   The wallet counts everything done so far. Lesson answers made on another computer are fetched once per lesson
   (myAnswers) and kept in the profile, so they count everywhere from then on. */
(function () {
  'use strict';
  var SFA = window.SFA, AV = window.SFA_AVATAR;
  if (!SFA || !AV || window.SFA_WARDROBE) return;
  var esc = SFA.esc || function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }, S = SFA.sync;
  function toast(m, ms) { if (SFA.toast) SFA.toast(m, ms || 2500); }
  function mk(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) { var v = attrs[k]; if (v == null) continue; if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v); }
    (kids || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }

  (function () {
    if (document.getElementById('sfaWdCss')) return;
    var s = document.createElement('style'); s.id = 'sfaWdCss';
    s.textContent = [
      '.wd{display:grid;grid-template-columns:minmax(0,310px) minmax(0,1fr);grid-template-areas:"me shop" "side shop";grid-template-rows:auto 1fr;gap:14px 16px;align-items:start;color:#F3EFE7;font-family:"Bricolage Grotesque",system-ui,sans-serif}',
      '.wd *{box-sizing:border-box}.wd button{font:inherit;color:inherit}',
      '.wd .wdcard{background:#1B1824;border:2px solid #3A3550;border-radius:18px;padding:14px;min-width:0}',
      '.wd .wdme{grid-area:me;display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px;background:radial-gradient(ellipse at 50% 30%,#3a2a5e,#1B1824 70%)}',
      '.wd .wdshop{grid-area:shop}.wd .wdside{grid-area:side;display:flex;flex-direction:column;gap:12px;min-width:0}',
      '.wd .wdme .av{margin:0 auto;max-width:100%;height:auto}.wd .wdinfo{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0;max-width:100%}',
      '.wd .wdname{font:400 28px "Luckiest Guy",system-ui;line-height:1.1}.wd .wdlv{color:#FFE14D;font-weight:800;font-size:14px}.wd .wdph{font-style:italic;color:#D9D3E8;font-size:14px}',
      '.wd .wdxp{width:160px;max-width:80%;height:8px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden}.wd .wdxp i{display:block;height:100%;background:#FFE14D}',
      '.wd .wdcoins{font:400 30px "Luckiest Guy",system-ui;color:#FFC94A;line-height:1.1}',
      '.wd .wdacts{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-top:6px}',
      '.wd .wdbtn{padding:9px 14px;border-radius:12px;border:0;background:#FFC94A;color:#231800;font-weight:800;cursor:pointer;min-height:40px}.wd .wdbtn:disabled{opacity:.45;cursor:default}',
      '.wd .wdbtn.ghost{background:#24202F;color:#F3EFE7;border:2px solid #3A3550}.wd .wdbtn.ghost:hover:not(:disabled){border-color:#B48CFF}.wd .wdbtn.fun{background:linear-gradient(135deg,#FF8FD1,#B48CFF);color:#1b0f2e}',
      '.wd h3{margin:0 0 8px;font:800 13px "Bricolage Grotesque",system-ui;letter-spacing:.1em;text-transform:uppercase;color:#ABA5BC}',
      '.wd .wdfits{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.wd .wdfit{position:relative;padding:2px 4px;border-radius:12px;border:2px solid #3A3550;background:#24202F;cursor:pointer;line-height:0}.wd .wdfit:hover{border-color:#B48CFF}',
      '.wd .wdfit.on{border-color:#3BFF8A}.wd .wdfitx{position:absolute;top:-8px;right:-8px;width:24px;height:24px;border-radius:50%;border:2px solid #3A3550;background:#1B1824;color:#ABA5BC;font-size:12px;line-height:1;cursor:pointer;padding:0}',
      '.wd .wdparts{width:100%;margin:6px 0 0;padding:0;list-style:none;text-align:left;font-size:14px}.wd .wdparts li{display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-top:1px solid #3A3550}.wd .wdparts li small{display:block;color:#ABA5BC;font-size:12px}.wd .wdparts b{color:#FFC94A;white-space:nowrap}',
      '.wd details summary{cursor:pointer;font-weight:800}.wd .wdstate{font-size:13px;color:#ABA5BC;margin:6px 0 0}',
      '.wd .wdhint{font-size:13px;color:#ABA5BC;margin:0 0 10px}.wd .wdhint b{color:#F3EFE7}',
      // the dye row: a swatch per dye above the hats, extras and pets
      '.wd .wddye{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 12px;padding:8px 10px;border-radius:14px;background:#24202F;border:2px solid #3A3550}.wd .wddye>b{font-size:13px;margin-right:4px}',
      '.wd .wddy{width:30px;height:30px;padding:0;border-radius:50%;border:3px solid #141428;box-shadow:0 0 0 2px #3A3550;cursor:pointer}.wd .wddy:hover{box-shadow:0 0 0 2px #B48CFF}.wd .wddy.on{box-shadow:0 0 0 3px #3BFF8A}',
      '.wd .wdgrp{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;padding-bottom:4px}',   // wraps: a row that scrolls sideways hid Friends, Moves and Card on a narrow laptop
      '.wd .wdg{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:1px;min-width:58px;padding:6px 8px;border-radius:14px;border:2px solid #3A3550;background:#24202F;font-weight:800;font-size:12px;cursor:pointer}',
      '.wd .wdg span{font-size:22px;line-height:1.1}.wd .wdg.on{border-color:#FFC94A;background:#3a2f14;color:#FFC94A}',
      '.wd .wdtabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}.wd .wdtab{padding:7px 12px;border-radius:99px;border:2px solid #3A3550;background:#24202F;color:#F3EFE7;font-weight:800;font-size:14px;cursor:pointer}.wd .wdtab.on{border-color:#B48CFF;background:#2f2450;color:#E3D4FF}',
      '.wd .wdgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px}.wd .wdgrid.sw{grid-template-columns:repeat(auto-fill,minmax(64px,1fr))}.wd .wdgrid.tx{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}',
      '.wd .wdit{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px 6px;border-radius:14px;border:2px solid #3A3550;background:#24202F;color:#F3EFE7;cursor:pointer;min-width:0;overflow:hidden}',
      '.wd .wdit .av{max-width:100%;height:auto}.wd .wdit:hover{border-color:#B48CFF}.wd .wdit.on{border-color:#3BFF8A;box-shadow:0 0 0 2px rgba(59,255,138,.3)}.wd .wdit.try{border-color:#FFC94A}.wd .wdit.lock>svg,.wd .wdit.lock>.wdsw,.wd .wdit.lock>.wdbg{opacity:.55}',
      '.wd .wdit b{font-size:13px;line-height:1.15;text-align:center;overflow-wrap:anywhere}.wd .wdit small{font-size:12px;font-weight:800;color:#FFC94A}.wd .wdit small.own{color:#3BFF8A}.wd .wdit small.lk{color:#ABA5BC}.wd .wdit small.ef{color:#7CC8FF}',
      '.wd .wdnm{display:flex;align-items:center;min-height:56px;font:400 24px "Luckiest Guy",system-ui}',
      '.wd .wdsw{width:40px;height:40px;border-radius:50%;border:3px solid #141428;box-shadow:inset 0 -6px 0 rgba(0,0,0,.15)}',
      '.wd .wdgrid.tx .wdit{flex-direction:row;justify-content:space-between;gap:8px;padding:10px 12px;text-align:left}.wd .wdgrid.tx .wdit b{text-align:left;font-size:15px}.wd .wdgrid.tx .wdit small{white-space:nowrap}',
      '.wd .wdbg{font-size:34px;line-height:1.3}.wd .wdgrid.tx .wdrar{position:static;flex:0 0 auto;margin-right:2px}.wd .wdgrid.tx .wdit b{flex:1 1 auto}',
      // rarity: a small gem in the corner and a tinted edge
      '.wd .wdrar{position:absolute;top:5px;left:6px;width:10px;height:10px;border-radius:3px;transform:rotate(45deg);box-shadow:0 0 0 2px rgba(0,0,0,.35)}',
      '.wd .wdit.r2{background:linear-gradient(180deg,rgba(83,183,255,.12),#24202F 60%)}.wd .wdit.r3{background:linear-gradient(180deg,rgba(180,140,255,.16),#24202F 60%)}.wd .wdit.r4{background:linear-gradient(180deg,rgba(255,201,74,.18),#24202F 60%)}',
      '.wd .wdbuy{position:sticky;bottom:0;z-index:4;margin-top:12px;display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:#2a2140;border:2px solid #FFC94A;box-shadow:0 -6px 18px rgba(0,0,0,.4)}',
      '.wd .wdbuy span{flex:1 1 200px;font-weight:700}.wd .wdbuy em{font-style:normal;font-weight:800}.wd .wdbar{display:block;height:8px;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden;margin-top:6px}.wd .wdbar i{display:block;height:100%;background:#7CC8FF}',
      '.wd .wdcardprev{margin:0 0 12px}',
      '@media (max-width:760px){.wd{grid-template-columns:minmax(0,1fr);grid-template-areas:"me" "shop" "side";gap:10px}',
      '.wd .wdme{position:sticky;top:0;z-index:6;flex-direction:row;flex-wrap:wrap;justify-content:center;text-align:left;gap:4px 10px;padding:8px 10px;border-radius:0 0 18px 18px;box-shadow:0 8px 18px rgba(0,0,0,.45)}',
      '.wd .wdme>.av{width:92px;margin:0}.wd .wdinfo{align-items:flex-start;flex:1 1 150px}.wd .wdname{font-size:22px}.wd .wdcoins{font-size:22px}.wd .wdph,.wd .wdxp{display:none}',
      '.wd .wdacts{flex:1 1 100%;margin-top:2px}.wd .wdacts .wdbtn{flex:1 1 auto;padding:7px 8px;font-size:13px;min-height:36px}',
      '.wd .wdgrp{flex-wrap:wrap;overflow:visible;gap:5px}.wd .wdg{flex:1 1 56px;min-width:0;padding:5px 2px;font-size:11.5px}.wd .wdg span{font-size:20px}',
      '.wd .wdcard{padding:10px}.wd .wdgrid{grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:6px}.wd .wdgrid.tx{grid-template-columns:1fr}.wd .wdit b{font-size:12px}}'
    ].join('\n');
    document.head.appendChild(s);
  })();

  var DATA = { games: null, climb: null, fetched: false, lesBusy: false, lesMsg: '' };
  function plan() { return (window.SFA_PLAN || []).map(function (p) { return 'L' + p.l; }); }
  // what the server knows: game summaries and Climb, then any lesson not yet counted from the server
  function fetchAll(redraw) {
    if (DATA.fetched || !S || !S.on || !S.me) return;
    DATA.fetched = true;
    S.mine().then(function (j) { DATA.games = j.games || []; DATA.climb = j.climb || null; redraw(); }, function () { redraw(); });
    var P = AV.profile(), todo = plan().filter(function (l) { return !(P.lesSrv || {})[l]; });
    if (!todo.length) return;
    DATA.lesBusy = true; var k = 0;
    (function next() {
      if (k >= todo.length) { DATA.lesBusy = false; DATA.lesMsg = ''; AV.save(AV.profile()); redraw(); return; }
      var l = todo[k++]; DATA.lesMsg = 'Counting your lesson answers… ' + k + ' of ' + todo.length; redraw();
      S.call('myAnswers', { lesson: l }).then(function (j) {
        var n = 0, r = 0; Object.keys(j.answers || {}).forEach(function (q) { var a = j.answers[q]; if (/^z|^here$/.test(q) || !a || !a.answer) return; n++; if (a.correct === 'yes') r++; });
        var Q = AV.profile(); Q.lesSrv = Q.lesSrv || {}; Q.lesSrv[l] = 1; var o = Q.les[l] || { n: 0, r: 0 }; Q.les[l] = { n: Math.max(o.n || 0, n), r: Math.max(o.r || 0, r) };
        SFA.store.set('g99', Q); next();
      }, function () { next(); });
    })();
  }
  function wallet(P) {
    var e = AV.earned({ games: DATA.games || AV.localGames(), climb: DATA.climb, xp: P.xp || 0, les: AV.lessons(P), ef: P.ef });
    return { parts: e.parts, earned: e.total, spent: P.spent || 0, left: Math.max(0, e.total - (P.spent || 0)) };
  }

  // the groups of parts; 'fav' is the favourite badges (part of the look, but picked from badges, not items)
  var GROUPS = [
    { e: '🙂', n: 'Body', tabs: ['k', 'b', 'f'] }, { e: '💇', n: 'Hair', tabs: ['r', 'c'] }, { e: '👀', n: 'Face', tabs: ['e', 'm'] },
    { e: '👕', n: 'Outfit', tabs: ['o', 'q', 'w'] }, { e: '🎩', n: 'Head', tabs: ['h'] }, { e: '🎒', n: 'Extras', tabs: ['a'] },
    { e: '🐾', n: 'Friends', tabs: ['p', 't'] }, { e: '🕺', n: 'Moves', tabs: ['j', 'g'] }, { e: '🏷️', n: 'Card', tabs: ['u', 'y', 'n', 'fav'] }
  ];
  var TABNAME = { b: 'Skin and colour', fav: 'Favourite badges', q: 'Colour', c: 'Colour', f: 'Details' };
  var HINT = {
    q: 'Every colour is free. It also colours a hijab, turban, head wrap or hair bow.', w: 'A pattern shows on your outfit.', c: 'Pick a hair style first, then its colour.',
    g: 'Your backdrop shows on your profile card, here and on the arcade front page.', j: 'Your move plays wherever your avatar is on a page.',
    u: 'Your title shows under your name on your card.', y: 'Pick a line that sounds like you.', fav: 'Badges are earned by effort. Pick up to 3 to show on your card.'
  };
  var DYEFOR = { h: 'dh', a: 'dx', p: 'dp' }, SWATCH = { c: 1, q: 1 }, TEXT = { u: 1, y: 1 }, RANDOM = ['k', 'b', 'e', 'm', 'r', 'c', 'o', 'q', 'w', 'f', 'h', 'p', 't', 'g', 'j'];

  function mount(box, opt) {
    opt = opt || {};
    var grp = 0, cat = 'k', tryLook = null, undo = [];
    function first() { return AV.firstName(); }
    function seed() { return S && S.me ? S.me.sid : 'me'; }
    function clone(L) { var t = {}; AV.ALL.forEach(function (k) { t[k] = L[k]; }); t.x = L.x.slice(); t.fav = L.fav.slice(); t.dh = L.dh; t.dx = L.dx; t.dp = L.dp; return t; }
    function wearIt(code, keepUndo) {
      var P = AV.profile(), was = AV.myLook(P, seed());
      if (code === was) return;
      if (!keepUndo) { undo.push(was); if (undo.length > 20) undo.shift(); }
      AV.setLook(P, code); P.ef = P.ef || {}; P.ef.sty = 1; tryLook = null; AV.save(P);
      if (opt.onChange) opt.onChange(P);
    }
    function surprise() {
      var P = AV.profile(), L = AV.decode(AV.myLook(P, seed()));
      RANDOM.forEach(function (k) {
        var own = []; AV.CAT[k].items.forEach(function (it, i) { if (AV.owns(P, k, i)) own.push(i); });
        // hats, pets, trails and backdrops are "nothing" about a third of the time, so the face still shows
        if (/[hptgfw]/.test(k) && Math.random() < 0.35) { L[k] = 0; return; }
        L[k] = own[Math.floor(Math.random() * own.length)] || 0;
      });
      if (!L.r && Math.random() < 0.8) { var hs = []; AV.CAT.r.items.forEach(function (it, i) { if (i && AV.owns(P, 'r', i)) hs.push(i); }); L.r = hs[Math.floor(Math.random() * hs.length)] || 0; }
      var xs = []; AV.CAT.a.items.forEach(function (it, i) { if (i && AV.owns(P, 'a', i)) xs.push(i); });
      L.x = []; for (var n = Math.floor(Math.random() * 3); n > 0 && xs.length; n--) L.x = AV.wear(L.x, xs.splice(Math.floor(Math.random() * xs.length), 1)[0]);
      ['dh', 'dx', 'dp'].forEach(function (k) { L[k] = Math.random() < 0.25 ? 1 + Math.floor(Math.random() * (AV.DYES.length - 1)) : 0; });
      wearIt(AV.encode(L)); draw();
    }
    // a redraw empties the box for a moment; hold its height and the page's place so a pick far down the list doesn't jump the page to the top
    function draw() {
      var sy = window.pageYOffset, h = box.offsetHeight;
      if (h) box.style.minHeight = h + 'px';
      try { paint(); } finally { box.style.minHeight = ''; }
      if (h && Math.abs(window.pageYOffset - sy) > 2) window.scrollTo(0, Math.min(sy, Math.max(0, document.documentElement.scrollHeight - window.innerHeight)));
    }
    function paint() {
      var P = AV.profile(), look = AV.myLook(P, seed()), show = tryLook || look, W = wallet(P);
      var lv = AV.level(P.xp || 0), a = AV.need(lv), b = AV.need(lv + 1), keepScroll = box.querySelector('.wdgrp') ? box.querySelector('.wdgrp').scrollLeft : 0;
      box.innerHTML = '';
      var wd = mk('div', { 'class': 'wd' }); box.appendChild(wd);

      /* me: the avatar, name, title, coins and the quick buttons */
      var me = mk('div', { 'class': 'wdcard wdme' }); wd.appendChild(me);
      var ph = AV.phraseOf(show);
      me.innerHTML = AV.svg(show, { size: 190, walk: true, bg: true, label: 'Your avatar' }) +
        '<div class="wdinfo"><div class="wdname ' + AV.nameCls(show) + '">' + esc(first()) + '</div><div class="wdlv">⭐ Level ' + lv + ' · ' + esc(AV.titleOf(show, lv)) + '</div>' +
        (ph ? '<div class="wdph">“' + esc(ph) + '”</div>' : '') + '<div class="wdxp"><i style="width:' + Math.round(100 * ((P.xp || 0) - a) / (b - a)) + '%"></i></div>' +
        '<div class="wdcoins">🪙 ' + W.left + '</div></div>';
      var acts = mk('div', { 'class': 'wdacts' }); me.appendChild(acts);
      var bR = mk('button', { type: 'button', 'class': 'wdbtn fun', text: '🎲 Surprise me', title: 'A random look from everything you own' }); bR.onclick = surprise; acts.appendChild(bR);
      var bU = mk('button', { type: 'button', 'class': 'wdbtn ghost', text: '↩ Undo' }); bU.disabled = !undo.length; bU.onclick = function () { var c = undo.pop(); if (c) { wearIt(c, true); draw(); } }; acts.appendChild(bU);
      var fits = (P.fits || []).filter(function (c) { return typeof c === 'string'; });
      var bS = mk('button', { type: 'button', 'class': 'wdbtn ghost', text: '💾 Save look' }); bS.disabled = fits.indexOf(look) >= 0;
      bS.onclick = function () { var Q = AV.profile(), f = (Q.fits || []).filter(function (c) { return c !== look; }); f.push(look); if (f.length > 5) f.shift(); Q.fits = f; AV.save(Q); toast('💾 Look saved. Find it under Saved looks.'); draw(); };
      acts.appendChild(bS);

      /* side: saved looks, where the coins came from */
      var side = mk('div', { 'class': 'wdside' }); wd.appendChild(side);
      if (fits.length) {
        var fc = mk('div', { 'class': 'wdcard' }, [mk('h3', { text: 'Saved looks' })]), fr = mk('div', { 'class': 'wdfits' }); fc.appendChild(fr); side.appendChild(fc);
        fits.forEach(function (c) {
          var f = mk('button', { type: 'button', 'class': 'wdfit' + (c === look ? ' on' : ''), 'aria-label': 'Wear this saved look', html: AV.svg(c, { size: 52, still: true }) });
          f.onclick = function () { wearIt(c); draw(); };
          var x = mk('span', { 'class': 'wdfitx', role: 'button', tabindex: '0', 'aria-label': 'Delete this saved look', text: '✕' });
          x.onclick = function (e) { e.stopPropagation(); var Q = AV.profile(); Q.fits = (Q.fits || []).filter(function (y) { return y !== c; }); AV.save(Q); draw(); };
          f.appendChild(x); fr.appendChild(f);
        });
      }
      var cn = mk('details', { 'class': 'wdcard' }); side.appendChild(cn);
      cn.innerHTML = '<summary>🪙 ' + W.earned + ' earned · ' + W.spent + ' spent</summary><ul class="wdparts">' + W.parts.map(function (p) { return '<li><span>' + p.e + ' ' + esc(p.label) + '<small>' + esc(p.txt) + '</small></span><b>' + p.c + '</b></li>'; }).join('') + '</ul>' +
        (DATA.lesMsg ? '<p class="wdstate">' + esc(DATA.lesMsg) + '</p>' : '') + (S && S.on && !S.me ? '<p class="wdstate">Sign in so your coins count everything you\'ve done and follow you to any computer.</p>' : '');
      if (!matchMedia('(max-width:760px)').matches) cn.open = true;
      if (opt.extra) { var ex = opt.extra(P, W); if (ex) side.appendChild(ex); }

      /* the shop */
      var shop = mk('div', { 'class': 'wdcard wdshop' }); wd.appendChild(shop);
      var gr = mk('div', { 'class': 'wdgrp', role: 'tablist', 'aria-label': 'Parts' }); shop.appendChild(gr);
      GROUPS.forEach(function (G, gi) {
        var g = mk('button', { type: 'button', 'class': 'wdg' + (gi === grp ? ' on' : ''), role: 'tab', 'aria-selected': gi === grp ? 'true' : 'false', html: '<span aria-hidden="true">' + G.e + '</span>' + esc(G.n) });
        g.onclick = function () { grp = gi; cat = G.tabs[0]; draw(); }; gr.appendChild(g);
      });
      gr.scrollLeft = keepScroll;
      var G = GROUPS[grp];
      if (G.tabs.length > 1) {
        var tabs = mk('div', { 'class': 'wdtabs', role: 'tablist' }); shop.appendChild(tabs);
        G.tabs.forEach(function (k) { var t = mk('button', { type: 'button', 'class': 'wdtab' + (k === cat ? ' on' : ''), role: 'tab', 'aria-selected': k === cat ? 'true' : 'false', text: TABNAME[k] || AV.CAT[k].name }); t.onclick = function () { cat = k; draw(); }; tabs.appendChild(t); });
      }
      var L = AV.decode(show), cur = AV.decode(look), multi = cat === 'a';
      if (G.n === 'Card') shop.appendChild(mk('div', { 'class': 'wdcardprev', html: AV.card({ look: show, name: first(), lv: lv }) }));
      var hint = multi ? '<b>Wearing ' + cur.x.length + ' of ' + AV.MAXX + '.</b> Wear up to ' + AV.MAXX + ' extras, one per spot (face, neck, back, hands, feet…). Tap a worn one to take it off.' : HINT[cat];
      if (hint) shop.appendChild(mk('p', { 'class': 'wdhint', html: hint }));
      /* 🎨 dyes: recolour the hat, the extras or the pet you're wearing (free, and they stay when you change the item) */
      var dk = DYEFOR[cat];
      if (dk && (cat === 'a' ? cur.x.length : cur[cat])) {
        var dr = mk('div', { 'class': 'wddye', role: 'group', 'aria-label': 'Dye' }, [mk('b', { text: '🎨 Dye ' + (cat === 'a' ? 'your extras' : cat === 'h' ? 'your hat' : 'your pet') })]);
        AV.DYES.forEach(function (D, di) {
          var bg = !di ? 'conic-gradient(#FF5B5B,#FFD23F,#4FD97A,#53B7FF,#9B6BFF,#FF5B5B)' : D.m ? 'linear-gradient(135deg,#fff,#8A93A3)' : D.c;
          var sw = mk('button', { type: 'button', 'class': 'wddy' + ((cur[dk] || 0) === di ? ' on' : ''), title: D.n, 'aria-label': D.n, 'aria-pressed': (cur[dk] || 0) === di ? 'true' : 'false', style: 'background:' + bg });
          sw.onclick = function () { var w = clone(cur); w[dk] = di; wearIt(AV.encode(w)); draw(); };
          dr.appendChild(sw);
        });
        shop.appendChild(dr);
      }
      var grid = mk('div', { 'class': 'wdgrid' + (SWATCH[cat] ? ' sw' : TEXT[cat] ? ' tx' : '') }); shop.appendChild(grid);

      if (cat === 'fav') {
        AV.badges(P).forEach(function (bd) {
          var on = cur.fav.indexOf(bd.i) >= 0;
          var c = mk('button', { type: 'button', 'class': 'wdit' + (on ? ' on' : '') + (bd.got ? '' : ' lock'), 'aria-label': bd.n + ': ' + bd.d, title: bd.d });
          c.innerHTML = '<span class="wdbg">' + bd.e + '</span><b>' + esc(bd.n) + '</b>' + (on ? '<small class="own">★ On your card</small>' : bd.got ? '<small class="own">Earned</small>' : '<small class="ef">🎯 ' + bd.have + ' / ' + bd.need + '</small>');
          c.onclick = function () {
            if (!bd.got) { toast('🎯 ' + bd.n + ': ' + bd.d + ' (' + bd.have + ' of ' + bd.need + ').', 3500); return; }
            var t = clone(cur); if (on) t.fav = t.fav.filter(function (x) { return x !== bd.i; }); else { t.fav.push(bd.i); while (t.fav.length > 3) t.fav.shift(); }
            wearIt(AV.encode(t)); draw();
          };
          grid.appendChild(c);
        });
        return;
      }

      AV.CAT[cat].items.forEach(function (it, i) {
        var own = AV.owns(P, cat, i), lock = !it.u && (it.lv || 0) > lv, pr = AV.itemPrice(cat, i), rar = AV.rarity(cat, i);
        var on = multi ? (i ? cur.x.indexOf(i) >= 0 : !cur.x.length) : cur[cat] === i, tr = !on && (multi ? i > 0 && L.x.indexOf(i) >= 0 : L[cat] === i);
        var t = clone(cur); if (multi) t.x = AV.wear(cur.x, i); else t[cat] = i;
        // a hair colour or a pattern is easier to judge with something to show it on
        if (cat === 'c' && !t.r) t.r = 1; if ((cat === 'q' || cat === 'w') && !t.o && !(cat === 'q' && t.h >= 31)) t.o = 1;
        var code = AV.encode(t);
        var c = mk('button', { type: 'button', 'class': 'wdit r' + rar + (on ? ' on' : '') + (tr ? ' try' : '') + (!own ? ' lock' : ''), 'aria-label': it.n + (rar ? ', ' + AV.RARE[rar].n : ''), 'aria-pressed': on ? 'true' : 'false' });
        var pic = cat === 'n' ? '<span class="wdnm ' + AV.nameCls(code) + '">' + esc(first()) + '</span>'
          : SWATCH[cat] ? '<span class="wdsw" style="background:' + (it.g ? 'linear-gradient(180deg,' + it.g.map(function (s) { return s[1]; }).join(',') + ')' : it.c) + '"></span>'
          : TEXT[cat] ? '' : AV.svg(code, { size: 72, bg: cat === 'g', still: cat !== 'j' });
        var stt = on ? '<small class="own">✓ ' + (TEXT[cat] || SWATCH[cat] ? 'On' : 'Wearing') + '</small>' : own ? (TEXT[cat] || SWATCH[cat] ? '' : '<small class="own">' + (it.u ? 'Earned' : it.p ? 'Owned' : 'Free') + '</small>')
          : it.u ? '<small class="ef">🎯 ' + Math.min(AV.stat(P, it.u[0]), it.u[1]) + ' / ' + it.u[1] + '</small>' : lock ? '<small class="lk">🔒 Level ' + it.lv + '</small>' : '<small>🪙 ' + pr + '</small>';
        c.innerHTML = (rar ? '<i class="wdrar" style="background:' + AV.RARE[rar].c + '" title="' + AV.RARE[rar].n + '"></i>' : '') + pic + '<b>' + esc(it.n) + '</b>' + stt;
        c.onclick = function () {
          if (own) {
            var w = clone(cur); if (multi) w.x = on ? AV.wear(cur.x, i, 'toggle') : AV.wear(cur.x, i); else w[cat] = i;
            wearIt(AV.encode(w)); draw();
          } else { var z = clone(cur); if (multi) z.x = AV.wear(cur.x, i); else z[cat] = i; tryLook = AV.encode(z); draw(); }
        };
        grid.appendChild(c);
      });

      /* trying on something not owned yet: buy it, see how to earn it, or put it back */
      if (tryLook) {
        var TL = AV.decode(tryLook), k = null, idx = 0;
        AV.ALL.forEach(function (q) {
          if (q === 'a') TL.x.forEach(function (i) { if (cur.x.indexOf(i) < 0 && !AV.owns(P, 'a', i)) { k = 'a'; idx = i; } });
          else if (TL[q] !== cur[q] && !AV.owns(P, q, TL[q])) { k = q; idx = TL[q]; }
        });
        if (k) {
          var it = AV.CAT[k].items[idx], pr = AV.itemPrice(k, idx), lock = (it.lv || 0) > lv, short = pr - W.left, R = AV.RARE[AV.rarity(k, idx)];
          var bar = mk('div', { 'class': 'wdbuy' }), nm = '<em style="color:' + R.c + '">' + esc(it.n) + '</em> <small>(' + R.n + ')</small>';
          var back = mk('button', { type: 'button', 'class': 'wdbtn ghost', text: 'Put it back' }); back.onclick = function () { tryLook = null; draw(); };
          if (it.u) {
            var have = Math.min(AV.stat(P, it.u[0]), it.u[1]);
            bar.appendChild(mk('span', { html: '🎯 ' + nm + ' can\'t be bought. You earn it: ' + esc(AV.needText(it.u)) + '. You\'re at ' + have + ' of ' + it.u[1] + '.<i class="wdbar"><i style="width:' + Math.round(100 * have / it.u[1]) + '%"></i></i>' }));
            bar.appendChild(back);
          } else {
            bar.appendChild(mk('span', { html: lock ? '🔒 ' + nm + ' unlocks at level ' + it.lv + ' (you\'re level ' + lv + ').' : short > 0 ? nm + ': 🪙 ' + pr + '. You need ' + short + ' more coins.' : nm + ' for 🪙 ' + pr + '?' }));
            var buy = mk('button', { type: 'button', 'class': 'wdbtn', text: 'Buy and wear' }); buy.disabled = lock || short > 0;
            buy.onclick = function () {
              var Q = AV.profile(), W2 = wallet(Q); if (W2.left < pr) return;
              Q.spent = (Q.spent || 0) + pr; Q.own[k + idx] = 1; AV.save(Q); var code = tryLook; wearIt(code);
              toast('🛍️ ' + it.n + ' is yours!'); draw();
            };
            bar.appendChild(buy); bar.appendChild(back);
          }
          shop.appendChild(bar);
        } else tryLook = null;
      }
    }
    draw(); fetchAll(draw);
    return { draw: draw };
  }
  window.SFA_WARDROBE = { mount: mount, wallet: wallet, refresh: function () { DATA.fetched = false; }, load: fetchAll };
})();
