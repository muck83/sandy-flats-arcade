/* 👕 The Wardrobe: the shop where students spend coins on their avatar (sfa-avatar.js has the parts, prices and wallet).
   SFA_WARDROBE.mount(box) draws it into any element: the Wardrobe page (avatar.html) and the first slide of a live
   lesson both use it. Needs sfa-kit.js, sfa-sync.js and sfa-avatar.js first.

   The wallet counts everything done so far. Lesson answers made on another computer are fetched once per lesson
   (myAnswers) and kept in the profile, so they count everywhere from then on. */
(function () {
  'use strict';
  var SFA = window.SFA, AV = window.SFA_AVATAR;
  if (!SFA || !AV || window.SFA_WARDROBE) return;
  var esc = SFA.esc || function (s) { return String(s); }, S = SFA.sync;

  (function () {
    if (document.getElementById('sfaWdCss')) return;
    var s = document.createElement('style'); s.id = 'sfaWdCss';
    s.textContent = [
      '.wd{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:16px;align-items:start;color:#F3EFE7}',
      '@media (max-width:760px){.wd{grid-template-columns:1fr}}',
      '.wd .wdcard{background:#1B1824;border:2px solid #3A3550;border-radius:18px;padding:14px}',
      '.wd .wdme{display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px;background:radial-gradient(ellipse at 50% 30%,#3a2a5e,#1B1824 70%)}',
      '.wd .wdme .av{margin:0 auto}.wd .wdname{font:400 28px "Luckiest Guy",system-ui;line-height:1.1}.wd .wdlv{color:#FFE14D;font-weight:800}',
      '.wd .wdxp{width:80%;height:8px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden}.wd .wdxp i{display:block;height:100%;background:#FFE14D}',
      '.wd .wdcoins{margin-top:6px;font:400 34px "Luckiest Guy",system-ui;color:#FFC94A}.wd .wdcoins small{display:block;font:600 13px "Bricolage Grotesque",system-ui;color:#ABA5BC}',
      '.wd .wdparts{width:100%;margin:8px 0 0;padding:0;list-style:none;text-align:left;font-size:14px}.wd .wdparts li{display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-top:1px solid #3A3550}.wd .wdparts li small{display:block;color:#ABA5BC;font-size:12px}.wd .wdparts b{color:#FFC94A;white-space:nowrap}',
      '.wd .wdstate{font-size:13px;color:#ABA5BC;margin:6px 0 0}',
      '.wd .wdtabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}.wd .wdtab{padding:7px 12px;border-radius:99px;border:2px solid #3A3550;background:#24202F;color:#F3EFE7;font-weight:800;cursor:pointer}.wd .wdtab.on{border-color:#FFC94A;background:#3a2f14;color:#FFC94A}',
      '.wd .wdgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px}',
      '.wd .wdit{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border-radius:14px;border:2px solid #3A3550;background:#24202F;color:#F3EFE7;cursor:pointer;font:inherit}',
      '.wd .wdit:hover{border-color:#B48CFF}.wd .wdit.on{border-color:#3BFF8A;box-shadow:0 0 0 2px rgba(59,255,138,.3)}.wd .wdit.try{border-color:#FFC94A}.wd .wdit.lock{opacity:.6}',
      '.wd .wdnm{display:flex;align-items:center;min-height:64px;font:400 24px "Luckiest Guy",system-ui}.wd .wdit b{font-size:13px;line-height:1.1}.wd .wdit small{font-size:12px;font-weight:800;color:#FFC94A}.wd .wdit small.own{color:#3BFF8A}.wd .wdit small.lk{color:#ABA5BC}',
      '.wd .wdbuy{position:sticky;bottom:0;margin-top:12px;display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:#2a2140;border:2px solid #FFC94A}',
      '.wd .wdbuy span{flex:1 1 200px;font-weight:700}.wd .wdbtn{padding:9px 16px;border-radius:12px;border:0;background:#FFC94A;color:#231800;font-weight:800;cursor:pointer}.wd .wdbtn:disabled{opacity:.45;cursor:default}.wd .wdbtn.ghost{background:transparent;color:#F3EFE7;border:2px solid #3A3550}'
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
    var e = AV.earned({ games: DATA.games || AV.localGames(), climb: DATA.climb, xp: P.xp || 0, les: AV.lessons(P) });
    return { parts: e.parts, earned: e.total, spent: P.spent || 0, left: Math.max(0, e.total - (P.spent || 0)) };
  }

  function mount(box, opt) {
    opt = opt || {};
    var cat = 'h', tryLook = null;
    function first() { var n = S && S.me ? String(S.me.name || '') : ''; return (n.indexOf(',') >= 0 ? n.split(',')[1] : n).trim().split(' ')[0] || 'You'; }
    function draw() {
      var P = AV.profile(), seed = S && S.me ? S.me.sid : 'me', look = AV.myLook(P, seed), show = tryLook || look, W = wallet(P);
      var lv = AV.level(P.xp || 0), a = AV.need(lv), b = AV.need(lv + 1);
      box.innerHTML = '';
      var wd = SFA.el('div', { 'class': 'wd' }); box.appendChild(wd);
      // me: the avatar, level, coins and where they came from
      var me = SFA.el('div', { 'class': 'wdcard wdme' }); wd.appendChild(me);
      me.innerHTML = AV.svg(show, { size: 190, walk: true, label: 'Your avatar' }) +
        '<div class="wdname ' + AV.nameCls(show) + '">' + esc(first()) + '</div><div class="wdlv">⭐ Level ' + lv + ' · ' + esc(AV.title(lv)) + '</div><div class="wdxp"><i style="width:' + Math.round(100 * ((P.xp || 0) - a) / (b - a)) + '%"></i></div>' +
        '<div class="wdcoins">🪙 ' + W.left + '<small>' + W.earned + ' earned · ' + W.spent + ' spent</small></div>' +
        '<ul class="wdparts">' + W.parts.map(function (p) { return '<li><span>' + p.e + ' ' + esc(p.label) + '<small>' + esc(p.txt) + '</small></span><b>' + p.c + '</b></li>'; }).join('') + '</ul>' +
        (DATA.lesMsg ? '<p class="wdstate">' + esc(DATA.lesMsg) + '</p>' : '') + (!S || !S.me ? '<p class="wdstate">Sign in so your coins count everything you\'ve done and follow you to any computer.</p>' : '');
      if (opt.extra) me.appendChild(opt.extra(P, W));
      // the shop
      var shop = SFA.el('div', { 'class': 'wdcard' }); wd.appendChild(shop);
      var tabs = SFA.el('div', { 'class': 'wdtabs', role: 'tablist' }); shop.appendChild(tabs);
      AV.ORDER.forEach(function (k) { var t = SFA.el('button', { type: 'button', 'class': 'wdtab' + (k === cat ? ' on' : ''), role: 'tab', 'aria-selected': k === cat ? 'true' : 'false', text: AV.CAT[k].name }); t.onclick = function () { cat = k; draw(); }; tabs.appendChild(t); });
      var grid = SFA.el('div', { 'class': 'wdgrid' }); shop.appendChild(grid);
      var L = AV.decode(show), cur = AV.decode(look);
      AV.CAT[cat].items.forEach(function (it, i) {
        var own = AV.owns(P, cat, i), lock = (it.lv || 0) > lv, pr = AV.itemPrice(cat, i), on = cur[cat] === i, tr = L[cat] === i && !on;
        var t = {}; AV.ORDER.forEach(function (k) { t[k] = cur[k]; }); t[cat] = i;
        var c = SFA.el('button', { type: 'button', 'class': 'wdit' + (on ? ' on' : '') + (tr ? ' try' : '') + (lock ? ' lock' : ''), 'aria-label': it.n });
        c.innerHTML = (cat === 'n' ? '<span class="wdnm ' + AV.nameCls(AV.encode(t)) + '">' + esc(first()) + '</span>' : AV.svg(AV.encode(t), { size: 64 })) + '<b>' + esc(it.n) + '</b>' + (on ? '<small class="own">✓ Wearing</small>' : own ? '<small class="own">Owned</small>' : lock ? '<small class="lk">🔒 Level ' + it.lv + '</small>' : '<small>🪙 ' + pr + '</small>');
        c.onclick = function () {
          if (own) { P.look = AV.encode(t); tryLook = null; AV.save(P); if (opt.onChange) opt.onChange(P); draw(); }
          else { tryLook = AV.encode(t); draw(); }
        };
        grid.appendChild(c);
      });
      // trying something on that isn't owned yet: buy it, or put it back
      if (tryLook) {
        var TL = AV.decode(tryLook), k = null; AV.ORDER.forEach(function (q) { if (TL[q] !== cur[q] && !AV.owns(P, q, TL[q])) k = q; });
        if (k) {
          var it = AV.CAT[k].items[TL[k]], pr = AV.itemPrice(k, TL[k]), lock = (it.lv || 0) > lv, short = pr - W.left;
          var bar = SFA.el('div', { 'class': 'wdbuy' });
          bar.appendChild(SFA.el('span', { text: lock ? '🔒 ' + it.n + ' unlocks at level ' + it.lv + ' (you\'re level ' + lv + ').' : short > 0 ? it.n + ': 🪙 ' + pr + '. You need ' + short + ' more coins.' : it.n + ' for 🪙 ' + pr + '?' }));
          var buy = SFA.el('button', { type: 'button', 'class': 'wdbtn', text: 'Buy and wear' }); buy.disabled = lock || short > 0;
          buy.onclick = function () {
            var Q = AV.profile(), W2 = wallet(Q); if (W2.left < pr) return;
            Q.spent = (Q.spent || 0) + pr; Q.own[k + TL[k]] = 1; Q.look = tryLook; tryLook = null; AV.save(Q);
            if (SFA.toast) SFA.toast('🛍️ ' + it.n + ' is yours!', 2500); if (opt.onChange) opt.onChange(Q); draw();
          };
          var back = SFA.el('button', { type: 'button', 'class': 'wdbtn ghost', text: 'Put it back' }); back.onclick = function () { tryLook = null; draw(); };
          bar.appendChild(buy); bar.appendChild(back); shop.appendChild(bar);
        }
      }
    }
    draw(); fetchAll(draw);
    return { draw: draw };
  }
  window.SFA_WARDROBE = { mount: mount, wallet: wallet, refresh: function () { DATA.fetched = false; } };
})();
