/* 🧭 Quests, the streak and badges: the student's own corner of the arcade front page.
   SFA_QUESTS.mount(box)   the quest card: avatar and coins, today's three quests, this week's two, the streak, the next unlock.
   SFA_QUESTS.shelf(box)   the profile card and every badge (My Results and the Trophy Shelf use it).
   All the counting lives in sfa-avatar.js (effort: showing up, having a go, retrying, moving up a level). This file only draws.
   Needs sfa-avatar.js first; sfa-wardrobe.js (for the coin total) and sfa-sync.js if the page has them.

   Kind by design: quests take about ten minutes and count tries, not right answers; a finished quest that isn't claimed
   pays out by itself at the end of the day; the streak survives a weekend or a missed day and, when it does end, the
   card just invites a new one (best streak and days shown up never go down). Nothing is taken away for being absent. */
(function () {
  'use strict';
  var SFA = window.SFA, AV = window.SFA_AVATAR;
  if (!SFA || !AV || window.SFA_QUESTS) return;
  var S = SFA.sync;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function mk(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) { var v = attrs[k]; if (v == null) continue; if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v); }
    (kids || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  function toast(m) { if (SFA.toast) SFA.toast(m, 2800); }
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  (function () {
    if (document.getElementById('sfaQcCss')) return;
    var s = document.createElement('style'); s.id = 'sfaQcCss';
    s.textContent = [
      '.qc{display:grid;grid-template-columns:minmax(0,230px) minmax(0,1fr) minmax(0,250px);gap:14px;margin:0 0 22px;padding:14px;border-radius:18px;background:linear-gradient(135deg,#221a38,#1B1824 60%);border:2px solid #4a3f78;color:#F3EFE7;font-family:"Bricolage Grotesque",system-ui,sans-serif}',
      '.qc *{box-sizing:border-box}.qc a{color:#FFC94A}.qc h3{margin:0;font:400 20px "Luckiest Guy",system-ui,sans-serif;letter-spacing:.03em;color:#FFC94A}',
      '.qc .qcme{display:flex;flex-direction:column;align-items:center;text-align:center;gap:3px;min-width:0}.qc .qcme>a{line-height:0;border-radius:50%}',
      '.qc .qcname{font:400 24px/1.1 "Luckiest Guy",system-ui,sans-serif;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.qc .qctt{font-weight:800;font-size:13px;color:#FFE14D}.qc .qcph{font-style:italic;font-size:13px;color:#D9D3E8}',
      '.qc .qccoin{font:400 24px "Luckiest Guy",system-ui,sans-serif;color:#FFC94A}',
      '.qc .qcbtn{display:inline-block;padding:8px 14px;border-radius:12px;border:0;background:#FFC94A;color:#231800;font:800 14px "Bricolage Grotesque",system-ui,sans-serif;text-decoration:none;cursor:pointer;white-space:nowrap}',
      '.qc .qcbtn.ghost{background:#24202F;color:#F3EFE7;border:2px solid #3A3550}.qc .qcbtn.ghost:hover{border-color:#B48CFF}',
      '.qc .qchead{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 12px;margin-bottom:6px}',
      '.qc .qcstreak{display:flex;align-items:center;gap:8px;font-weight:800;font-size:14px}.qc .qcstreak b{color:#FF9F4A}',
      '.qc .qcdots{display:flex;gap:4px}.qc .qcdots i{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font:800 10px "Bricolage Grotesque",system-ui;font-style:normal;background:#2a2538;color:#7d778f;border:2px solid transparent}',
      '.qc .qcdots i.on{background:#FF9F4A;color:#2b1400}.qc .qcdots i.now{border-color:#FFE14D}',
      '.qc .qcsub{font-size:12.5px;color:#ABA5BC;margin:0 0 8px}',
      '.qc .qclist{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}',
      '.qc .qcq{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:4px 10px;align-items:center;padding:8px 10px;border-radius:12px;background:#24202F;border:2px solid #3A3550}',
      '.qc .qcq.done{border-color:#FFC94A;background:#332a14}.qc .qcq.got{opacity:.72;border-color:#2c5a3c;background:#1c2a22}',
      '.qc .qcq .qe{font-size:22px;line-height:1}.qc .qcq b{display:block;font-size:15px;line-height:1.2}.qc .qcq small{display:block;font-size:12.5px;color:#ABA5BC;line-height:1.25}',
      '.qc .qcbar{display:block;height:7px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:5px}.qc .qcbar i{display:block;height:100%;background:#7CC8FF;border-radius:99px}',
      '.qc .qcr{font-weight:800;font-size:13px;color:#FFC94A;white-space:nowrap;text-align:right}.qc .qcr a{font-size:12.5px;font-weight:700}.qc .qcq.got .qcr{color:#7CF2A2}',
      '.qc .qcclaim{animation:qcpulse 1.4s ease-in-out infinite}@keyframes qcpulse{50%{box-shadow:0 0 0 5px rgba(255,201,74,.25)}}',
      '.qc .qcwk{margin-top:10px}.qc .qcwk h4{margin:0 0 6px;font:800 12px "Bricolage Grotesque",system-ui;letter-spacing:.12em;text-transform:uppercase;color:#ABA5BC}',
      '.qc .qcnext{display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px;padding:10px;border-radius:14px;background:#1c1830;border:2px dashed #4a3f78;min-width:0}',
      '.qc .qcnext h4{margin:0;font:800 12px "Bricolage Grotesque",system-ui;letter-spacing:.12em;text-transform:uppercase;color:#ABA5BC}.qc .qcnext b{font-size:16px}.qc .qcnext small{font-size:13px;color:#D9D3E8}',
      '.qc .qcnext .qcbar{width:100%}.qc .qcrar{font:800 11px "Bricolage Grotesque",system-ui;letter-spacing:.1em;text-transform:uppercase}',
      '.qc .qcchip{display:inline-block;padding:8px 12px;border-radius:12px;background:#2f2450;font-weight:800;font-size:15px;margin:10px 0}',
      '.qc.out{grid-template-columns:auto minmax(0,1fr);align-items:center}',
      '.qcpop{position:fixed;z-index:9999;pointer-events:none;font:400 26px "Luckiest Guy",system-ui,sans-serif;color:#FFC94A;text-shadow:0 2px 0 #231800;animation:qcpop 1.1s ease-out forwards}@keyframes qcpop{from{opacity:1;transform:translate(-50%,0) scale(.8)}to{opacity:0;transform:translate(-50%,-70px) scale(1.25)}}',
      '@media (max-width:980px){.qc{grid-template-columns:minmax(0,200px) minmax(0,1fr)}.qc .qcnext{grid-column:1 / -1;flex-direction:row;flex-wrap:wrap;justify-content:center;text-align:left;gap:6px 14px}.qc .qcnext .qcnx{flex:1 1 200px;min-width:0}}',
      '@media (max-width:620px){.qc{grid-template-columns:minmax(0,1fr);padding:10px;gap:10px}.qc .qcme{flex-direction:row;flex-wrap:wrap;justify-content:center;text-align:left;gap:2px 12px}.qc .qcme .qcinfo{flex:1 1 140px;min-width:0}.qc .qcme>a svg{width:84px;height:auto}.qc .qcq{padding:8px}}',
      '@media (prefers-reduced-motion:reduce){.qc .qcclaim{animation:none}.qcpop{animation-duration:.01s}}',
      // the badge shelf
      '.bsh{color:#F3EFE7;font-family:"Bricolage Grotesque",system-ui,sans-serif;margin:14px 0 22px}.bsh *{box-sizing:border-box}.bsh h2{margin:14px 0 4px;font:400 24px "Luckiest Guy",system-ui,sans-serif;letter-spacing:.03em}',
      '.bsh .bshtop{display:flex;flex-wrap:wrap;gap:12px 18px;align-items:center}.bsh .bshnum{display:flex;flex-wrap:wrap;gap:8px}.bsh .bshnum div{padding:8px 12px;border-radius:12px;background:#24202F;border:2px solid #3A3550;min-width:92px}',
      '.bsh .bshnum b{display:block;font:400 26px/1 "Luckiest Guy",system-ui,sans-serif;color:#FFC94A}.bsh .bshnum small{font-size:12.5px;color:#ABA5BC}',
      '.bsh p{margin:0 0 10px;color:#ABA5BC;font-size:14px}.bsh .bshgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}',
      '.bsh .bdg{padding:10px;border-radius:14px;background:#24202F;border:2px solid #3A3550;text-align:center}.bsh .bdg .be{font-size:34px;line-height:1.2}.bsh .bdg b{display:block;font-size:14px}.bsh .bdg small{display:block;font-size:12.5px;color:#ABA5BC;line-height:1.25}',
      '.bsh .bdg.got{border-color:#FFC94A;background:#332a14}.bsh .bdg:not(.got) .be{filter:grayscale(1);opacity:.45}.bsh .bdg u{display:block;height:6px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:6px;text-decoration:none}.bsh .bdg u i{display:block;height:100%;background:#7CC8FF}',
      '@media (max-width:520px){.bsh .bshgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}'
    ].join('\n');
    document.head.appendChild(s);
  })();

  function coins(P) { return window.SFA_WARDROBE ? SFA_WARDROBE.wallet(P).left : null; }
  function seed() { return S && S.me ? S.me.sid : 'me'; }
  function href(go) { return !go ? null : go.charAt(0) === '#' ? (/^(index\.html)?$/.test(here) ? go : 'index.html' + go) : go; }
  function pop(el, txt) {
    var r = el.getBoundingClientRect(), p = mk('div', { 'class': 'qcpop', text: txt }); p.style.left = (r.left + r.width / 2) + 'px'; p.style.top = (r.top - 6) + 'px';
    document.body.appendChild(p); setTimeout(function () { p.remove(); }, 1200);
  }

  function mount(box, opt) {
    opt = opt || {};
    function row(q) {
      var li = mk('li', { 'class': 'qcq' + (q.got ? ' got' : q.done ? ' done' : '') });
      li.appendChild(mk('span', { 'class': 'qe', 'aria-hidden': 'true', text: q.got ? '✅' : q.e }));
      var mid = mk('div', {}, [mk('b', { text: q.n }), mk('small', { text: q.got ? 'Done. Nice.' : q.d })]);
      if (!q.got && !q.done && q.need > 1) mid.appendChild(mk('span', { 'class': 'qcbar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(q.need), 'aria-valuenow': String(q.have), 'aria-label': q.have + ' of ' + q.need, html: '<i style="width:' + Math.round(100 * q.have / q.need) + '%"></i>' }));
      li.appendChild(mid);
      var r = mk('div', { 'class': 'qcr' });
      if (q.got) r.textContent = '+' + q.c + ' 🪙';
      else if (q.done) {
        var b = mk('button', { type: 'button', 'class': 'qcbtn qcclaim', text: 'Claim +' + q.c + ' 🪙' });
        b.onclick = function () { var got = AV.claim(q.id); if (got) { pop(b, '+' + got + ' 🪙'); if (got > q.c) toast('🎉 Daily triple! All three quests done: +' + (got - q.c) + ' bonus coins.'); } draw(); };
        r.appendChild(b);
      } else {
        r.innerHTML = (q.need > 1 ? q.have + ' / ' + q.need + ' · ' : '') + '+' + q.c + ' 🪙';
        var h = href(q.go); if (h) { r.appendChild(mk('br')); r.appendChild(mk('a', { href: h, text: 'Go →' })); }
      }
      li.appendChild(r);
      return li;
    }
    function draw() {
      box.innerHTML = '';
      if (S && S.on && !S.me) {
        // signed out: a small invitation (nothing is tracked until we know whose it is)
        var o = mk('div', { 'class': 'qc out' });
        o.appendChild(mk('div', { html: AV.svg(AV.defLook('guest'), { size: 70 }) }));
        o.appendChild(mk('div', {}, [mk('h3', { text: 'Your avatar, quests and streak start here' }), mk('p', { 'class': 'qcsub', style: 'margin:4px 0 0;font-size:14px', text: 'Sign in above to dress your avatar, earn coins for having a go, and keep a streak that follows you to any computer.' })]));
        box.appendChild(o); return;
      }
      var P = AV.profile(), look = AV.myLook(P, seed()), lv = AV.level(P.xp || 0), Q = AV.quests(P), ph = AV.phraseOf(look), c = coins(P), st = Q.streak;
      var qc = mk('section', { 'class': 'qc', 'aria-label': 'Your quests' }); box.appendChild(qc);

      // me
      var me = mk('div', { 'class': 'qcme' }); qc.appendChild(me);
      me.appendChild(mk('a', { href: 'avatar.html', 'aria-label': 'Open the Wardrobe', html: AV.svg(look, { size: 120, bg: true, label: 'Your avatar' }) }));
      var info = mk('div', { 'class': 'qcinfo' }); me.appendChild(info);
      info.innerHTML = '<div class="qcname ' + AV.nameCls(look) + '">' + esc(AV.firstName()) + '</div><div class="qctt">⭐ Level ' + lv + ' · ' + esc(AV.titleOf(look, lv)) + '</div>' + (ph ? '<div class="qcph">“' + esc(ph) + '”</div>' : '') +
        (c == null ? '' : '<div class="qccoin">🪙 ' + c + '</div>');
      info.appendChild(mk('a', { 'class': 'qcbtn ghost', href: 'avatar.html', text: '👕 Change my look' }));

      // quests
      var main = mk('div', { 'class': 'qcmain' }); qc.appendChild(main);
      var head = mk('div', { 'class': 'qchead' }, [mk('h3', { text: 'Today\'s quests' })]); main.appendChild(head);
      var sk = mk('div', { 'class': 'qcstreak' });
      sk.innerHTML = '<span>' + (st.n >= 2 ? '🔥 <b>' + st.n + '-day streak</b>' : st.n === 1 ? '🔥 <b>Day 1</b> of a new streak' : st.best ? '✨ Start a new streak today' : '✨ Have one go to start a streak') + '</span>' +
        '<span class="qcdots" aria-hidden="true">' + Q.streak.dots.map(function (d) { return '<i class="' + (d.on ? 'on' : '') + (d.today ? ' now' : '') + '">' + 'SMTWTFS'.charAt(d.wd) + '</i>'; }).join('') + '</span>';
      head.appendChild(sk);
      main.appendChild(mk('p', { 'class': 'qcsub', text: (st.n && !st.today ? 'One go today makes it ' + (st.n + 1) + '. ' : '') + 'Tries count, right or wrong. A weekend or a missed day never breaks your streak.' + (st.best > st.n ? ' Best so far: ' + st.best + ' days.' : '') }));
      var ul = mk('ul', { 'class': 'qclist' }); main.appendChild(ul);
      Q.day.forEach(function (q) { ul.appendChild(row(q)); });
      var allGot = Q.day.every(function (q) { return q.got; });
      main.appendChild(mk('p', { 'class': 'qcsub', style: 'margin:6px 0 0', text: allGot ? '🎉 Daily triple done: +' + Q.triple.c + ' bonus coins. See you tomorrow.' : 'Finish all three for a daily triple: +' + Q.triple.c + ' bonus coins.' }));
      var wk = mk('div', { 'class': 'qcwk' }, [mk('h4', { text: 'This week' })]); main.appendChild(wk);
      var ul2 = mk('ul', { 'class': 'qclist' }); wk.appendChild(ul2);
      Q.week.forEach(function (q) { ul2.appendChild(row(q)); });

      // next unlock
      var N = AV.nextUnlock(P), nx = mk('div', { 'class': 'qcnext' }); qc.appendChild(nx);
      if (N) {
        var L = AV.decode(look), R = AV.RARE[AV.rarity(N.k, N.i)], txt = N.k === 'u' || N.k === 'y';
        if (N.k === 'a') L.x = [N.i]; else L[N.k] = N.i;
        if (N.k === 'c' && !L.r) L.r = 9; if (N.k === 'w' && !L.o) L.o = 1;
        nx.appendChild(mk('h4', { text: 'Next unlock' }));
        nx.appendChild(mk('div', { html: txt ? '<span class="qcchip">' + (N.k === 'y' ? '“' + esc(N.it.n) + '”' : esc(N.it.n)) + '</span>' : AV.svg(AV.encode(L), { size: 96, bg: true, label: N.it.n }) }));
        var d = mk('div', { 'class': 'qcnx' }); nx.appendChild(d);
        d.innerHTML = '<b>' + esc(N.it.n) + '</b> <span class="qcrar" style="color:' + R.c + '">◆ ' + R.n + ' ' + esc(AV.CAT[N.k].name.toLowerCase()) + '</span>' +
          '<small style="display:block">Earned, never bought: ' + esc(N.text) + '. <b>' + N.left + ' to go.</b></small>' +
          '<span class="qcbar" role="progressbar" aria-valuemin="0" aria-valuemax="' + N.need + '" aria-valuenow="' + N.have + '"><i style="width:' + Math.max(4, Math.round(100 * N.have / N.need)) + '%"></i></span>';
      } else nx.innerHTML = '<h4>Next unlock</h4><div style="font-size:40px">🏆</div><b>You\'ve earned every effort item.</b><small>Legend.</small>';
      nx.appendChild(mk('a', { href: 'results.html#badges', style: 'font-size:13px;font-weight:700', text: 'My badges →' }));
    }
    draw();
    AV.onChange(function () { if (box.isConnected) draw(); });
    if (S && S.onChange) { var was = S.me ? S.me.sid : null; S.onChange(function () { var now = S.me ? S.me.sid : null; if (now !== was) { was = now; if (window.SFA_WARDROBE) SFA_WARDROBE.refresh(); load(); draw(); } }); }
    function load() { if (window.SFA_WARDROBE && SFA_WARDROBE.load) SFA_WARDROBE.load(function () { if (box.isConnected) draw(); }); }
    load();
    return { draw: draw };
  }

  // the profile card, the effort numbers and every badge
  function shelf(box, opt) {
    opt = opt || {};
    function draw() {
      box.innerHTML = '';
      if (S && S.on && !S.me) return;
      var P = AV.profile(), B = AV.badges(P), got = B.filter(function (b) { return b.got; }).length, st = AV.quests(P).streak;
      var w = mk('section', { 'class': 'bsh', id: 'badges' }); box.appendChild(w);
      var top = mk('div', { 'class': 'bshtop' }); w.appendChild(top);
      top.appendChild(mk('div', { html: AV.card({ size: 'l', walk: true }) }));
      var nums = mk('div', { 'class': 'bshnum' }); top.appendChild(nums);
      [[st.days, st.days === 1 ? 'day shown up' : 'days shown up'], [st.best, 'best streak'], [AV.stat(P, 'tries'), 'goes at anything'], [AV.stat(P, 'retry'), 'retries after a mistake'], [AV.stat(P, 'quests'), 'quests done']].forEach(function (n) {
        nums.appendChild(mk('div', {}, [mk('b', { text: String(n[0]) }), mk('small', { text: n[1] })]));
      });
      w.appendChild(mk('h2', { text: '🏅 My badges: ' + got + ' of ' + B.length }));
      var p = mk('p', { text: 'Badges are for effort: showing up, having a go, trying again. Pick up to 3 favourites for your card in the ' }); p.appendChild(mk('a', { href: 'avatar.html', text: 'Wardrobe' })); p.appendChild(document.createTextNode(' (Card → Favourite badges).')); w.appendChild(p);
      var g = mk('div', { 'class': 'bshgrid' }); w.appendChild(g);
      B.forEach(function (b) {
        g.appendChild(mk('div', { 'class': 'bdg' + (b.got ? ' got' : ''), html: '<div class="be">' + b.e + '</div><b>' + esc(b.n) + '</b><small>' + esc(b.d) + '</small>' + (b.got ? '' : '<u><i style="width:' + Math.round(100 * b.have / b.need) + '%"></i></u><small>' + b.have + ' of ' + b.need + '</small>') }));
      });
    }
    draw();
    AV.onChange(function () { if (box.isConnected) draw(); });
    if (S && S.onChange) { var was = S.me ? S.me.sid : null; S.onChange(function () { var now = S.me ? S.me.sid : null; if (now !== was) { was = now; draw(); } }); }
    return { draw: draw };
  }
  window.SFA_QUESTS = { mount: mount, shelf: shelf };
})();
