/* Squeeze Street: a ten-day lemonade stand where every day's costs and rules arrive as inequalities.
   The rules live in squeeze-sim.js (shared with the results script). This file draws the pages: the day's forecast and rules
   (number lines, a budget graph), the order form, the day's results with what the best reading was, and the leaderboard.
   A run is kept in this browser as its list of choices; every screen replays it with the shared rules.
   The leaderboard: a finished run is sent as choices (op squeezeSave, signed in); the board (op squeezeBoard) needs no sign-in. */
(function () {
  'use strict';
  var SFA = window.SFA, el = SFA.el, S = SFA.sync, CFG = window.SFA_CONFIG || {}, SQ = window.squeezeSim();
  var app = document.getElementById('sq'), KEY = 'squeeze.run', NOW = SQ.season(new Date());
  var run = loadRun();

  function blank() { return { season: NOW, plan: [], draft: null, seen: 0, started: false, posted: null }; }
  function loadRun() {
    var r = SFA.store.get(KEY, null);
    if (!r || !Array.isArray(r.plan)) return blank();
    // a run from an earlier week: keep it only while it is finished, unposted and still postable
    if (r.season !== NOW && !(r.plan.length === SQ.DAYS && !r.posted && SQ.seasonsNow(new Date()).indexOf(r.season) >= 0)) return blank();
    return r;
  }
  function save() { SFA.store.set(KEY, run); }

  /* ---------- formatting ---------- */
  function m(c) { var neg = c < 0; c = Math.abs(Math.round(c)); return (neg ? '−' : '') + '$' + Math.floor(c / 100) + '.' + ('0' + c % 100).slice(-2); }
  function d2(c) { return (c / 100).toFixed(2); }   // a number on a number line or in an inequality, in dollars
  function sym(strict, up) { return up ? (strict ? '>' : '≥') : (strict ? '<' : '≤'); }
  function ival(x, money) { return money ? '$' + d2(x) : String(x); }
  function itext(iq, v, money) {
    if (iq.also) return v + ' ' + sym(iq.hiStrict) + ' ' + ival(iq.hi, money) + ' or ' + v + ' ' + sym(iq.also.loStrict, 1) + ' ' + ival(iq.also.lo, money);
    if (iq.lo != null && iq.hi != null) return ival(iq.lo, money) + ' ' + sym(iq.loStrict) + ' ' + v + ' ' + sym(iq.hiStrict) + ' ' + ival(iq.hi, money);
    if (iq.lo != null) return v + ' ' + sym(iq.loStrict, 1) + ' ' + ival(iq.lo, money);
    return v + ' ' + sym(iq.hiStrict) + ' ' + ival(iq.hi, money);
  }
  function priceIq(R) { return { lo: R.min || null, loStrict: R.minStrict, hi: R.max, hiStrict: R.maxStrict }; }
  function sugarIq(R) { return { lo: R.min, loStrict: R.minStrict, hi: R.max || null, hiStrict: R.maxStrict }; }
  function html(tag, cls, h) { var e = el(tag, cls ? { 'class': cls } : null); e.innerHTML = h; return e; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- number line (one-variable and compound inequalities) ---------- */
  function nline(iq, money, label) {
    var vals = [iq.lo, iq.hi, iq.also && iq.also.lo].filter(function (x) { return x != null; });
    var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), step = money ? 5 : 1, from, to;
    if (money) { from = Math.max(0, Math.floor((mn - 20) / 10) * 10); to = Math.ceil((mx + 20) / 10) * 10; }
    else { from = Math.max(0, mn - 3); to = mx + 3; }
    var W = 340, pad = 22, y = 26, X = function (v) { return pad + (v - from) / (to - from) * (W - 2 * pad); };
    var s = '<svg class="nl" viewBox="0 0 ' + W + ' 60" role="img" aria-label="Number line: ' + esc(itext(iq, label || 'x', money)) + '">';
    s += '<line x1="6" y1="' + y + '" x2="' + (W - 6) + '" y2="' + y + '" class="ax"/><path d="M2 ' + y + 'l8 -5v10z M' + (W - 2) + ' ' + y + 'l-8 -5v10z" class="axh"/>';
    for (var v = from; v <= to; v += step) {
      var key = vals.indexOf(v) >= 0, near = vals.some(function (k) { return k !== v && Math.abs(k - v) < (money ? 10 : 1); });
      var lab = money ? (key || (v % 10 === 0 && !near)) : true;
      s += '<line x1="' + X(v) + '" y1="' + (y - 5) + '" x2="' + X(v) + '" y2="' + (y + 5) + '" class="tk"/>';
      if (lab) s += '<text x="' + X(v) + '" y="' + (y + 22) + '" class="' + (key ? 'tl key' : 'tl') + '">' + (money ? d2(v) : v) + '</text>';
    }
    function seg(a, b, arrowL, arrowR) {
      var x1 = a == null ? 8 : X(a), x2 = b == null ? W - 8 : X(b);
      s += '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" class="sg"/>';
      if (arrowL) s += '<path d="M4 ' + y + 'l10 -7v14z" class="sgh"/>';
      if (arrowR) s += '<path d="M' + (W - 4) + ' ' + y + 'l-10 -7v14z" class="sgh"/>';
    }
    function dot(v, strict) { s += '<circle cx="' + X(v) + '" cy="' + y + '" r="6.5" class="' + (strict ? 'dot open' : 'dot') + '"/>'; }
    seg(iq.lo, iq.hi, iq.lo == null, iq.hi == null);
    if (iq.also) seg(iq.also.lo, null, false, true);
    if (iq.lo != null) dot(iq.lo, iq.loStrict);
    if (iq.hi != null) dot(iq.hi, iq.hiStrict);
    if (iq.also) dot(iq.also.lo, iq.also.loStrict);
    return s + '</svg>';
  }

  /* ---------- the co-op limit as a graph: cups c (up) against pitchers P (across) ---------- */
  function bgraph(B, pts) {
    var a = B.a, b = B.b, L = B.L, xi = L / b, yi = L / a;
    var Pmax = Math.max(5, Math.ceil(xi) + 1), cstep = yi > 240 ? 50 : yi > 120 ? 20 : 10, cmax = Math.ceil(yi * 1.12 / cstep) * cstep;
    (pts || []).forEach(function (p) { Pmax = Math.max(Pmax, p.P + 1); while (p.c > cmax) cmax += cstep; });
    var W = 340, H = 270, l = 46, r = 14, t = 14, bt = 40;
    var X = function (P) { return l + P / Pmax * (W - l - r); }, Y = function (c) { return H - bt - c / cmax * (H - t - bt); };
    var s = '<svg class="bg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Graph of ' + d2(a) + 'c + ' + d2(b) + 'P ≤ ' + d2(L) + ', pitchers across, cups up">';
    var Pe = Pmax > 12 ? 2 : 1;
    for (var P = 0; P <= Pmax; P++) { s += '<line x1="' + X(P) + '" y1="' + Y(0) + '" x2="' + X(P) + '" y2="' + Y(cmax) + '" class="gl"/>'; if (P % Pe === 0) s += '<text x="' + X(P) + '" y="' + (Y(0) + 16) + '" class="tl">' + P + '</text>'; }
    for (var c = 0; c <= cmax; c += cstep) s += '<line x1="' + X(0) + '" y1="' + Y(c) + '" x2="' + X(Pmax) + '" y2="' + Y(c) + '" class="gl"/><text x="' + (X(0) - 6) + '" y="' + (Y(c) + 4) + '" class="tl yl">' + c + '</text>';
    s += '<polygon points="' + X(0) + ',' + Y(0) + ' ' + X(0) + ',' + Y(yi) + ' ' + X(xi) + ',' + Y(0) + '" class="rg"/>';
    s += '<line x1="' + X(0) + '" y1="' + Y(yi) + '" x2="' + X(xi) + '" y2="' + Y(0) + '" class="bl"/>';
    s += '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(Pmax) + '" y2="' + Y(0) + '" class="ax"/><line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(0) + '" y2="' + Y(cmax) + '" class="ax"/>';
    var r1 = function (x) { return Math.round(x * 10) / 10; };
    s += '<text x="' + (X(0) + 8) + '" y="' + (Y(yi) - 6) + '" class="tl key st">(0, ' + r1(yi) + ')</text>';
    s += '<text x="' + X(xi) + '" y="' + (Y(0) - 8) + '" class="tl key">(' + r1(xi) + ', 0)</text>';
    s += '<text x="' + ((X(0) + X(Pmax)) / 2) + '" y="' + (H - 6) + '" class="tl ttl">P = pitchers</text>';
    s += '<text x="12" y="' + ((Y(0) + Y(cmax)) / 2) + '" class="tl ttl" transform="rotate(-90 12 ' + ((Y(0) + Y(cmax)) / 2) + ')">c = cups</text>';
    (pts || []).forEach(function (p) { s += '<circle cx="' + X(p.P) + '" cy="' + Y(p.c) + '" r="6" class="pt ' + (p.cls || '') + '"/><text x="' + (X(p.P) + 9) + '" y="' + (Y(p.c) - 8) + '" class="tl st ptl">' + esc(p.label) + '</text>'; });
    return s + '</svg>';
  }
  function budgetText(B) { return '$' + d2(B.a) + 'c + $' + d2(B.b) + 'P ≤ $' + d2(B.L); }

  /* ---------- the stand (title art) ---------- */
  var STAND = '<svg class="art" viewBox="0 0 260 150" aria-hidden="true">' +
    '<circle cx="222" cy="30" r="18" fill="#FFC94A"/><g stroke="#FFC94A" stroke-width="3" stroke-linecap="round"><path d="M222 4v-0M248 30h0M196 30h0"/></g>' +
    '<rect x="40" y="70" width="150" height="62" rx="4" fill="#C77B3A"/><rect x="40" y="70" width="150" height="10" fill="#A9612A"/>' +
    '<rect x="52" y="44" width="8" height="30" fill="#8C5426"/><rect x="170" y="44" width="8" height="30" fill="#8C5426"/>' +
    '<path d="M32 22h166l8 26H24z" fill="#F7F3E3"/><path d="M32 22h24l-6 26H24zM80 22h24l-2 26H78zM128 22h24l2 26h-26zM176 22h22l8 26h-24z" fill="#E8584C"/>' +
    '<path d="M24 48h182l-4 8c-6 6-12 6-18 0-6 6-12 6-18 0-6 6-12 6-18 0-6 6-12 6-18 0-6 6-12 6-18 0-6 6-12 6-18 0-6 6-12 6-18 0-6 6-12 6-18 0-6 6-12 6-18 0-6 6-12 6-18 0z" fill="#E8584C"/>' +
    '<rect x="66" y="90" width="98" height="24" rx="4" fill="#F7F3E3"/><text x="115" y="107" text-anchor="middle" font-family="Luckiest Guy,sans-serif" font-size="14" fill="#1B1A22">SQUEEZE ST.</text>' +
    '<path d="M150 58h22l-3 14h-16z" fill="#FFE27A" stroke="#F7F3E3" stroke-width="2"/><ellipse cx="80" cy="64" rx="12" ry="8" fill="#FFD23F"/><ellipse cx="98" cy="66" rx="10" ry="7" fill="#F2C230"/>' +
    '<rect x="0" y="132" width="260" height="18" fill="#E9C58A"/></svg>';

  /* ---------- views ---------- */
  function view() {
    var R = SQ.run(run.season, run.plan);
    app.innerHTML = '';
    window.scrollTo(0, 0);
    if (location.hash === '#board') return boardView();
    if (run.plan.length > run.seen) return resultView(R);
    if (R.done) return endView(R);
    if (!run.started) return introView(R);
    return dayView(R);
  }
  window.addEventListener('hashchange', view);

  function signInBox(note) {
    if (!S || !S.on) return null;
    if (S.me) return el('p', { 'class': 'muted small', text: 'Signed in as ' + first(S.me.name) + '. Your finished runs go on the leaderboard.' });
    var box = el('div', { 'class': 'card signin' }, [el('b', { text: note || 'Sign in to get on the leaderboard' }), el('p', { 'class': 'muted small', text: 'You can play without signing in, but only signed-in runs are posted.' })]);
    S.button(box);
    return box;
  }
  function first(n) { n = String(n || ''); return (n.indexOf(',') >= 0 ? n.split(',')[1] : n).trim().split(' ')[0] || n; }

  function introView(R) {
    var go = el('button', { type: 'button', 'class': 'btn primary big', text: run.plan.length ? 'Carry on: day ' + (run.plan.length + 1) : 'Open the stand: day 1', onclick: function () { run.started = true; save(); view(); } });
    app.appendChild(el('section', { 'class': 'card hero' }, [
      html('div', 'heroart', STAND),
      el('div', {}, [
        el('h2', { text: 'Ten days on Squeeze Street' }),
        el('p', { text: 'You have ' + m(SQ.START) + ' and a lemonade stand. Every morning the weather, the prices and the town\'s rules arrive as inequalities. Read them right and the money stays in your pocket. Read them wrong and it costs you, but the stand never closes.' }),
        el('p', { 'class': 'muted', text: 'Everyone plays the same ten days this week (' + NOW.replace('-W', ', week ') + '), so the leaderboard is fair. Play as many times as you like: your best run counts.' }),
        el('div', { 'class': 'row' }, [go, el('a', { 'class': 'btn', href: '#board', text: '🏆 Leaderboard' })])
      ])
    ]));
    app.appendChild(el('section', { 'class': 'card how' }, [
      el('h2', { text: 'How a day works' }),
      el('ol', {}, [
        el('li', { text: 'Check the forecast: how many customers might come.' }),
        el('li', { text: 'Read the rules: the price customers accept, the health inspector\'s sugar rule, what supplies cost.' }),
        el('li', { text: 'Make your order: pitchers (each makes 10 cups), sugar, paper cups, and your price.' }),
        el('li', { text: 'Open the stand and see what you sold. Lemonade left over is poured out at night; paper cups keep.' })
      ]),
      el('p', { 'class': 'muted small', text: 'Days 1 to 3: one-variable inequalities. Days 4 to 6: compound inequalities and price ranges. Days 7 to 10: a two-variable budget for the co-op.' })
    ]));
    var sb = signInBox(); if (sb) app.appendChild(sb);
  }

  function statusBar(R, d) {
    var dots = el('div', { 'class': 'dots', 'aria-label': 'Day ' + d + ' of ' + SQ.DAYS });
    for (var i = 1; i <= SQ.DAYS; i++) dots.appendChild(el('i', { 'class': i < d ? 'done' : i === d ? 'now' : '' }));
    return el('div', { 'class': 'status' }, [
      el('div', { 'class': 'stat' }, [el('small', { text: 'Day' }), el('b', { text: d + ' of ' + SQ.DAYS })]),
      el('div', { 'class': 'stat' }, [el('small', { text: 'Cash' }), el('b', { text: m(R.cash < SQ.FLOOR ? SQ.FLOOR : R.cash) })]),
      el('div', { 'class': 'stat' }, [el('small', { text: 'Paper cups in stock' }), el('b', { text: String(R.stock) })]),
      el('div', { 'class': 'stat' }, [el('small', { text: 'Profit so far' }), el('b', { text: m(R.profit) })]),
      dots
    ]);
  }

  function ruleCard(title, icon, iq, v, money, show, words, d) {
    var box = el('div', { 'class': 'rule' }, [el('h3', { text: icon + ' ' + title })]);
    if (show === 'text') box.appendChild(el('p', { 'class': 'iq', text: itext(iq, v, money) }));
    else box.appendChild(el('p', { 'class': 'muted small', text: 'Today the rule comes as a number line. Read it carefully.' }));
    if (show === 'line' || d <= 2) box.appendChild(html('div', 'nlwrap', nline(iq, money, v)));
    box.appendChild(el('p', { 'class': 'small', text: words }));
    return box;
  }
  function costLine(name, it, per) {
    if (it.lo === it.hi) return el('li', {}, [el('b', { text: name + ': ' }), m(it.cost) + ' ' + per]);
    return el('li', {}, [el('b', { text: name + ': ' }), el('span', { 'class': 'iq inline', text: '$' + d2(it.lo) + ' < x ≤ $' + d2(it.hi) }), ' ' + per + '. You find out today\'s price at the till.']);
  }

  function dayView(R) {
    var d = run.plan.length + 1, sp = SQ.day(SQ.seed(run.season), d), prev = R.days.length ? R.days[R.days.length - 1].out : null;
    if (!run.draft) { run.draft = prev ? [prev.asked.P, prev.s, 0, prev.p, -1] : [3, 2, 30, 50, -1]; save(); }
    var cash = R.cash < SQ.FLOOR ? SQ.FLOOR : R.cash, dr = run.draft;
    app.appendChild(statusBar(R, d));
    if (R.cash < SQ.FLOOR) app.appendChild(el('p', { 'class': 'note', text: 'Cash ran low, so your family lends you enough to reach ' + m(SQ.FLOOR) + ' this morning. Loans come off your final profit.' }));

    var left = el('div', { 'class': 'stack' }), right = el('div', { 'class': 'stack' });
    app.appendChild(el('div', { 'class': 'cols' }, [left, right]));

    // forecast
    left.appendChild(el('section', { 'class': 'card fc' }, [
      el('div', { 'class': 'wx', text: sp.wx.icon }),
      el('div', {}, [el('h2', { text: 'Day ' + d + ': ' + sp.wx.label + ', ' + sp.wx.temp + '°C' }),
        el('p', { text: 'Forecast: between ' + sp.crowd.lo + ' and ' + sp.crowd.hi + ' customers come by if your price is fair.' })])
    ]));

    // the rules
    var rules = el('section', { 'class': 'card rules' }, [el('h2', { text: 'Today\'s rules' })]);
    // a symbol key for anyone meeting inequalities for the first time: open on days 1 to 3, folded away after
    var keyBox = el('details', { 'class': 'symkey' }, [el('summary', { text: 'How to read the symbols' }), el('ul', {}, [
      el('li', { text: '≤ means "at most": that number is allowed. p ≤ 0.90 lets you charge $0.90.' }),
      el('li', { text: '< means "less than": that number is NOT allowed. p < 0.90 means $0.85 is the most.' }),
      el('li', { text: '≥ means "at least" and > means "more than": s > 3 means 4 scoops is the least.' }),
      el('li', { text: 'On a number line, a filled dot ● includes the number; an open dot ○ leaves it out. The shading shows every number allowed.' }),
      el('li', { text: '0.45 ≤ p < 0.80 means both at once: from $0.45 up to (but not including) $0.80.' })
    ])]);
    if (d <= 3) keyBox.setAttribute('open', '');
    rules.appendChild(keyBox);
    var P = sp.price, Sg = sp.sugar;
    rules.appendChild(ruleCard('Price customers accept', '🏷️', priceIq(P), 'p', true, P.show,
      'p is your price per cup (5¢ steps). ' + (P.min ? 'Below the bottom, the market permit fines you ' + m(SQ.FINE_PERMIT) + '. ' : '') + 'Above the top, most customers walk away.', d));
    rules.appendChild(ruleCard('Health inspector', '🧪', sugarIq(Sg), 's', false, Sg.show,
      's is scoops of sugar per pitcher (whole scoops). Break the bottom of the rule: a ' + m(SQ.FINE_INSPECT) + ' fine.' + (Sg.max ? ' Over the top: too sweet, and fewer people buy.' : ' More sugar than you need is wasted money.'), d));
    rules.appendChild(el('div', { 'class': 'rule' }, [el('h3', { text: '🛒 Supplies' }), el('ul', { 'class': 'costs' }, [
      costLine('Lemons', sp.lemon, 'for one pitcher'), costLine('Paper cups', sp.cup, 'each'), el('li', {}, [el('b', { text: 'Sugar: ' }), m(SQ.SUGAR) + ' a scoop'])
    ])]));
    if (sp.budget) {
      var B = sp.budget, bx = el('div', { 'class': 'rule budget' }, [el('h3', { text: '🏦 Co-op credit limit' })]);
      if (B.show === 'graph') bx.appendChild(el('p', { 'class': 'muted small', text: 'Today the co-op sends its limit as a graph. Your order (P pitchers of lemons, c paper cups) has to land in the shaded region.' }));
      else bx.appendChild(el('p', { 'class': 'iq', text: budgetText(B) }));
      bx.appendChild(el('p', { 'class': 'small', text: 'The co-op pays for your lemons and paper cups up to a limit. c = paper cups you buy, P = pitchers of lemons. ' + (B.range ? 'Prices are ranges today, so the inequality uses the highest prices: an order that fits at the highest prices always fits. ' : '') + 'Go over and the co-op charges a ' + m(SQ.FEE_COOP) + ' fee and cuts your order down until it fits.' }));
      if (B.show === 'graph') bx.appendChild(html('div', 'bgwrap', bgraph(B)));
      else { var dt = el('details', {}, [el('summary', { text: 'Show the graph' })]); dt.appendChild(html('div', 'bgwrap', bgraph(B))); bx.appendChild(dt); }
      rules.appendChild(bx);
    }
    left.appendChild(rules);

    // the order
    var order = el('section', { 'class': 'card order' }, [el('h2', { text: 'Your order' })]);
    var bill = el('div', { 'class': 'bill', 'aria-live': 'polite' });
    function set(i, v) { dr[i] = v; save(); paintBill(); }
    order.appendChild(stepper('Pitchers to make', 'each makes 10 cups', dr[0], 0, 30, [1], function (v) { set(0, v); }));
    order.appendChild(stepper('Sugar per pitcher', 'scoops', dr[1], 0, 10, [1], function (v) { set(1, v); }));
    order.appendChild(stepper('Paper cups to buy', 'you have ' + R.stock, dr[2], 0, 400, [1, 10], function (v) { set(2, v); }));
    order.appendChild(stepper('Price per cup', 'p, in 5¢ steps', dr[3], 5, 300, [5], function (v) { set(3, v); }, true));
    order.appendChild(bill);
    function paintBill() {
      var Pn = dr[0], cups = R.stock + dr[2], made = Pn * SQ.CUPS_PER_PITCHER, fixed = sp.cup.lo === sp.cup.hi && sp.lemon.lo === sp.lemon.hi;
      bill.innerHTML = '';
      bill.appendChild(el('p', { text: 'You\'ll make ' + made + ' cups of lemonade and have ' + cups + ' paper cups to serve them in.' }));
      if (made > cups) bill.appendChild(el('p', { 'class': 'warn', text: 'Fewer paper cups than lemonade: you can only sell ' + cups + '.' }));
      if (sp.budget) bill.appendChild(el('p', { 'class': 'muted small', text: 'The co-op doesn\'t show a total. Check your order against its limit yourself. Cash on hand: ' + m(cash) + '.' }));
      else if (fixed) {
        var tot = Pn * (sp.lemon.cost + dr[1] * SQ.SUGAR) + dr[2] * sp.cup.cost;
        bill.appendChild(el('p', { 'class': tot > cash ? 'warn' : 'muted small', text: 'Bill: ' + m(tot) + ' of your ' + m(cash) + '.' + (tot > cash ? ' That\'s more than you have: the till will cut your order and charge ' + m(SQ.FEE_TILL) + '.' : '') }));
      } else bill.appendChild(el('p', { 'class': 'muted small', text: 'Part of the bill depends on today\'s price. Cash on hand: ' + m(cash) + '. If the bill comes to more than that, the till cuts your order and charges ' + m(SQ.FEE_TILL) + '.' }));
    }
    paintBill();
    right.appendChild(order);

    // the tip-jar question
    right.appendChild(questionCard(sp, dr, function (i) { dr[4] = i; save(); }));

    right.appendChild(el('button', { type: 'button', 'class': 'btn primary big wide', text: 'Open the stand ▶', onclick: function () {
      run.plan.push(SQ.clean(dr)); run.draft = null; save(); view();
    } }));
  }

  function stepper(label, sub, val, min, max, steps, onset, money) {
    var inp = el('input', { type: 'text', inputmode: money ? 'decimal' : 'numeric', 'aria-label': label, value: money ? d2(val) : String(val) });
    function clamp(v) { v = Math.max(min, Math.min(max, v)); return money ? Math.round(v / 5) * 5 : Math.round(v); }
    function put(v) { val = clamp(v); inp.value = money ? d2(val) : String(val); onset(val); }
    inp.addEventListener('change', function () { var x = parseFloat(String(inp.value).replace(/[^0-9.]/g, '')); put(isFinite(x) ? (money ? x * 100 : x) : val); });
    var btns = [];
    steps.slice().reverse().forEach(function (st) { btns.push(el('button', { type: 'button', 'class': 'sb', 'aria-label': 'minus ' + st, text: '−' + (steps.length > 1 ? st : ''), onclick: function () { put(val - st); } })); });
    btns.push(el('span', { 'class': 'inwrap' }, [money ? el('span', { 'class': 'cur', text: '$' }) : null, inp]));
    steps.forEach(function (st) { btns.push(el('button', { type: 'button', 'class': 'sb', 'aria-label': 'plus ' + st, text: '+' + (steps.length > 1 ? st : ''), onclick: function () { put(val + st); } })); });
    return el('div', { 'class': 'step' }, [el('div', {}, [el('b', { text: label }), el('small', { text: sub })]), el('div', { 'class': 'sbrow' }, btns)]);
  }

  function qPrompt(sp) {
    var q = sp.q;
    if (q.kind === 'pickLine') return 'Which number line shows today\'s ' + (q.about === 'price' ? 'price rule' : 'sugar rule') + '?';
    if (q.kind === 'pickText') return 'Which inequality matches today\'s ' + (q.about === 'price' ? 'price' : 'sugar') + ' number line?';
    if (q.kind === 'mostCost') return q.about === 'cup' ? 'Paper cups cost $' + d2(q.lo) + ' < x ≤ $' + d2(q.hi) + ' each today. What is the most ' + q.n + ' cups could cost?' : 'Lemons for one pitcher cost $' + d2(q.lo) + ' < x ≤ $' + d2(q.hi) + ' today. What is the most the lemons for ' + q.n + ' pitchers could cost?';
    return 'Which order fits under the co-op limit' + (sp.budget.range ? ' (at the highest prices)' : '') + '?';
  }
  function qOpt(sp, o) {
    var q = sp.q;
    if (q.kind === 'pickLine') return html('span', 'qnl', nline(o, q.money, q.var));
    if (q.kind === 'pickText') return el('span', { 'class': 'iq inline', text: itext(o, q.var, q.money) });
    if (q.kind === 'mostCost') return el('span', { text: m(o) });
    return el('span', { text: o.P + ' pitcher' + (o.P === 1 ? '' : 's') + ' and ' + o.c + ' paper cups' });
  }
  function questionCard(sp, dr, onpick) {
    var box = el('section', { 'class': 'card q' }, [el('h2', { text: '🫙 Tip jar question' }), el('p', { 'class': 'muted small', text: 'Optional. Get it right for +' + m(SQ.BONUS) + '.' }), el('p', { text: qPrompt(sp) })]);
    var list = el('div', { 'class': 'qopts', role: 'radiogroup', 'aria-label': 'Answers' });
    sp.q.opts.forEach(function (o, i) {
      var b = el('button', { type: 'button', role: 'radio', 'aria-checked': dr[4] === i ? 'true' : 'false', 'class': 'qo', onclick: function () {
        dr[4] = dr[4] === i ? -1 : i; onpick(dr[4]);
        Array.prototype.forEach.call(list.children, function (c, j) { c.setAttribute('aria-checked', dr[4] === j ? 'true' : 'false'); });
      } }, [el('b', { text: 'ABC'.charAt(i) }), qOpt(sp, o)]);
      list.appendChild(b);
    });
    box.appendChild(list);
    return box;
  }

  /* ---------- a day's results, and what the best reading was ---------- */
  function resultView(R) {
    var D = R.days[run.plan.length - 1], sp = D.spec, o = D.out, d = sp.d;
    app.appendChild(statusBar(R, d));
    var head = el('section', { 'class': 'card res ' + (o.profit >= 0 ? 'up' : 'down') }, [
      el('div', { 'class': 'wx', text: sp.wx.icon }),
      el('div', {}, [el('h2', { text: 'Day ' + d + ': ' + (o.profit >= 0 ? 'you made ' + m(o.profit) : 'you lost ' + m(-o.profit)) }),
        el('p', { text: o.want + ' customers wanted lemonade. You sold ' + o.sold + ' cups at ' + m(o.p) + '.' })])
    ]);
    app.appendChild(head);

    var cols = el('div', { 'class': 'cols' }), L = el('div', { 'class': 'stack' }), Rt = el('div', { 'class': 'stack' });
    cols.appendChild(L); cols.appendChild(Rt); app.appendChild(cols);

    var led = el('table', { 'class': 'ledger' });
    function row(a, b, cls) { led.appendChild(el('tr', cls ? { 'class': cls } : null, [el('td', { text: a }), el('td', { text: b })])); }
    if (o.loan) row('Family loan this morning', '+' + m(o.loan), 'muted');
    row('Sales: ' + o.sold + ' × ' + m(o.p), '+' + m(o.revenue));
    row('Lemons: ' + o.P + ' × ' + m(sp.lemon.cost) + (sp.lemon.lo !== sp.lemon.hi ? ' (today\'s price)' : ''), '−' + m(o.cost.lemons));
    row('Sugar: ' + o.P + ' × ' + o.s + ' scoops × ' + m(SQ.SUGAR), '−' + m(o.cost.sugar));
    row('Paper cups: ' + o.c + ' × ' + m(sp.cup.cost) + (sp.cup.lo !== sp.cup.hi ? ' (today\'s price)' : ''), '−' + m(o.cost.cups));
    o.fines.forEach(function (f) { row({ coop: 'Co-op fee (over the limit)', till: 'Till fee (not enough cash)', permit: 'Market permit fine', inspector: 'Health inspector fine' }[f.k], '−' + m(f.amt), 'bad'); });
    if (o.bonus) row('Tip jar (right answer)', '+' + m(o.bonus), 'good');
    row('Day ' + d + ' profit', m(o.profit), 'tot');
    L.appendChild(el('section', { 'class': 'card' }, [el('h2', { text: 'The till' }), led,
      el('p', { 'class': 'muted small', text: 'Lemonade made: ' + o.made + ' cups' + (o.poured ? ', ' + o.poured + ' poured out tonight' : '') + '. Paper cups left: ' + o.stock1 + '.' })]));

    // what went right and wrong, rule by rule
    var fb = el('section', { 'class': 'card fb' }, [el('h2', { text: 'Reading the rules' })]);
    function say(good, text) { fb.appendChild(el('p', { 'class': good ? 'ok' : 'no', text: (good ? '✓ ' : '✗ ') + text })); }
    var P = sp.price, Sg = sp.sugar, pt = itext(priceIq(P), 'p', true);
    if (o.over) say(false, 'Price: the rule was ' + pt + '. ' + m(o.p) + (P.maxStrict && o.p === P.max ? ' is not less than ' + m(P.max) + ': an open circle leaves the number out.' : ' is above the top.') + ' Most customers walked away. The best price was ' + m(P.best) + '.');
    else if (o.under) say(false, 'Price: the rule was ' + pt + '. ' + m(o.p) + (P.minStrict && o.p === P.min ? ' is not more than ' + m(P.min) : ' is below the bottom') + ', so the market permit fined you. Any price from ' + m(P.low) + ' to ' + m(P.best) + ' was allowed; ' + m(P.best) + ' earns the most.');
    else if (o.p < P.best) say(true, 'Price: ' + m(o.p) + ' follows ' + pt + ', but you could have charged up to ' + m(P.best) + ': ' + m((P.best - o.p) * o.sold) + ' more for the same ' + o.sold + ' cups.');
    else say(true, 'Price: ' + m(o.p) + ' is the highest price that follows ' + pt + '. Spot on.');
    var st = itext(sugarIq(Sg), 's', false);
    if (o.P === 0) say(false, 'You made no lemonade today.');
    else if (o.weak) say(false, 'Sugar: the inspector\'s rule was ' + st + '. ' + o.s + ' scoop' + (o.s === 1 ? '' : 's') + (Sg.minStrict && o.s === Sg.min ? ' is not more than ' + Sg.min + ': an open circle leaves ' + Sg.min + ' out' : ' breaks it') + '. The least allowed was ' + Sg.best + '.');
    else if (o.sweet) say(false, 'Sugar: ' + o.s + ' scoops breaks the top of ' + st + '. Too sweet: fewer people bought. ' + Sg.best + ' scoops was the cheapest safe amount.');
    else if (o.s > Sg.best) say(true, 'Sugar: ' + o.s + ' scoops follows ' + st + ', but ' + Sg.best + ' was enough. The extra cost ' + m((o.s - Sg.best) * o.P * SQ.SUGAR) + '.');
    else say(true, 'Sugar: ' + o.s + ' scoops is the least that follows ' + st + '.');
    if (sp.budget) {
      var B = sp.budget, used = o.coop;
      if (o.fines.some(function (f) { return f.k === 'coop'; })) say(false, 'Co-op: your order needed ' + m(used) + ' of credit at today\'s prices, over the ' + m(B.L) + ' limit. The co-op charged its fee and cut your order (pitchers first) to ' + o.P + ' pitchers and ' + o.c + ' paper cups.');
      else say(true, 'Co-op: your order used ' + m(used) + ' of the ' + m(B.L) + ' limit.');
      Rt.appendChild(el('section', { 'class': 'card' }, [el('h2', { text: 'Your order on the co-op graph' }), html('div', 'bgwrap', bgraph(B, [{ P: o.asked.P, c: o.asked.c, label: '(' + o.asked.P + ', ' + o.asked.c + ')', cls: B.a * o.asked.c + B.b * o.asked.P <= B.L ? 'in' : 'out' }])),
        el('p', { 'class': 'muted small', text: 'The shaded region is ' + budgetText(B) + '. Points on the line count: it is "less than or equal to".' })]));
    }
    if (o.fines.some(function (f) { return f.k === 'till'; })) say(false, 'Till: the bill came to more than your cash, so the till cut your order and charged a fee.' + (sp.cup.lo !== sp.cup.hi || sp.lemon.lo !== sp.lemon.hi ? ' With a price range, plan for the highest price.' : ''));
    if (o.P > 0) {
      var cupsHad = o.stock0 + o.c;
      if (o.sold < o.want && o.made <= cupsHad) say(false, 'Supply: you ran out of lemonade. ' + (o.want - o.sold) + ' customers left thirsty.');
      else if (o.sold < o.want) say(false, 'Supply: you ran out of paper cups. ' + (o.want - o.sold) + ' customers left thirsty.');
      else if (o.poured >= 10) say(false, 'Supply: ' + o.poured + ' cups of lemonade were poured out. ' + Math.floor(o.poured / 10) + ' fewer pitcher' + (Math.floor(o.poured / 10) === 1 ? '' : 's') + ' would have saved ' + m(Math.floor(o.poured / 10) * (sp.lemon.cost + o.s * SQ.SUGAR)) + '.');
      else say(true, 'Supply: you made about the right amount.');
    }
    L.appendChild(fb);

    // the tip-jar question, answered
    var q = sp.q, qb = el('section', { 'class': 'card q' }, [el('h2', { text: '🫙 Tip jar' }), el('p', { text: qPrompt(sp) })]);
    var list = el('div', { 'class': 'qopts' });
    q.opts.forEach(function (op, i) { list.appendChild(el('div', { 'class': 'qo' + (i === q.ans ? ' right' : i === o.q ? ' wrong' : '') }, [el('b', { text: 'ABC'.charAt(i) }), qOpt(sp, op)])); });
    qb.appendChild(list);
    qb.appendChild(el('p', { 'class': 'small', text: o.q < 0 ? 'You skipped it. The answer was ' + 'ABC'.charAt(q.ans) + '.' : o.right ? 'Right: +' + m(SQ.BONUS) + '.' : 'Not this time. The answer was ' + 'ABC'.charAt(q.ans) + '.' }));
    Rt.appendChild(qb);

    Rt.appendChild(el('button', { type: 'button', 'class': 'btn primary big wide', text: d < SQ.DAYS ? 'Next morning: day ' + (d + 1) + ' ▶' : 'See your ten days ▶', onclick: function () { run.seen = run.plan.length; save(); view(); } }));
  }

  /* ---------- the end of the run, and posting it ---------- */
  function endView(R) {
    var best = R.days.reduce(function (a, D) { return Math.max(a, D.out.profit); }, 0) || 1;
    var bars = el('div', { 'class': 'bars', 'aria-label': 'Profit each day' });
    R.days.forEach(function (D) {
      var p = D.out.profit, h = Math.max(2, Math.round(Math.abs(p) / best * 70));
      bars.appendChild(el('div', { 'class': 'bar' + (p < 0 ? ' neg' : ''), title: 'Day ' + D.spec.d + ': ' + m(p) }, [el('i', { style: 'height:' + h + 'px' }), el('small', { text: String(D.spec.d) })]));
    });
    var fines = 0, tips = 0; R.days.forEach(function (D) { D.out.fines.forEach(function (f) { fines += f.amt; }); tips += D.out.bonus; });
    app.appendChild(el('section', { 'class': 'card hero end' }, [
      html('div', 'heroart', STAND),
      el('div', {}, [
        el('h2', { text: 'Ten days done: ' + m(R.profit) + ' profit' }),
        el('p', { text: 'You started with ' + m(SQ.START) + ' and finished with ' + m(R.cash) + (R.loans ? ', less ' + m(R.loans) + ' of family loans' : '') + '. Fines and fees cost you ' + m(fines) + '; the tip jar paid ' + m(tips) + '.' }),
        bars
      ])
    ]));
    var post = el('section', { 'class': 'card post' }, [el('h2', { text: '🏆 The leaderboard' })]);
    app.appendChild(post);
    var again = el('div', { 'class': 'row' }, [
      el('button', { type: 'button', 'class': 'btn primary', text: 'Play this week again', onclick: function () { run = blank(); run.started = true; save(); view(); } }),
      el('a', { 'class': 'btn', href: '#board', text: 'See the leaderboard' })
    ]);
    function paint(msg, bad) {
      post.innerHTML = ''; post.appendChild(el('h2', { text: '🏆 The leaderboard' }));
      post.appendChild(el('p', { 'class': bad ? 'warn' : '', text: msg }));
      if (!run.posted && S && S.on && !S.me) { var sb = signInBox('Sign in to post this run'); if (sb) post.appendChild(sb); }
      post.appendChild(again);
    }
    function send() {
      if (!S || !S.on) return paint('The leaderboard isn\'t switched on here.');
      if (!S.me) return paint('Your run isn\'t on the leaderboard: you aren\'t signed in.');
      paint('Posting your run…');
      S.call('squeezeSave', { season: run.season, v: SQ.V, plan: run.plan }).then(function (j) {
        run.posted = { profit: j.profit, rank: j.rank, best: j.best }; save();
        paint('Posted: ' + m(j.profit) + '. Your best this week is ' + m(j.best) + (j.rank ? ', number ' + j.rank + ' on the board.' : '.'));
      }, function (e) {
        if (/bad code|sign in|not on roster|school account/.test(e.message)) { S.signOut(); save(); paint('Your sign-in has stopped working, so the run has not been posted yet. Sign in again below: it posts straight away.', true); return; }
        var t = /old game/.test(e.message) ? 'The game was updated while you played. Reload the page and play again to post a run.' : /old week/.test(e.message) ? 'This run is from an earlier week, so it can\'t be posted.' : /slow down/.test(e.message) ? 'Too fast: wait a few seconds, then press Try again.' : 'Couldn\'t reach the leaderboard. Check the internet and try again.';
        paint(t, true);
        post.insertBefore(el('button', { type: 'button', 'class': 'btn', text: 'Try again', onclick: send }), again);
      });
    }
    if (run.posted) paint('Posted: ' + m(run.posted.profit) + '. Your best this week is ' + m(run.posted.best) + (run.posted.rank ? ', number ' + run.posted.rank + ' on the board.' : '.'));
    else send();
    if (S && S.on && !run.posted) { var was = !!S.me; S.onChange(function (s) { var now = !!s.me; if (now !== was) save(); if (now && !was && location.hash !== '#board' && !run.posted && app.contains(post)) send(); was = now; }); }
  }

  /* ---------- the public leaderboard ---------- */
  function ask(body) {
    var c = SFA.store.get('sync.cred', null);
    if (c && c.kind === 'code') body.code = c.code; else if (c && c.kind === 'google') body.idToken = c.token;
    return fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), redirect: 'follow' })
      .then(function (r) { return r.text(); }).then(function (t) { var j = JSON.parse(t); if (!j.ok) throw new Error(j.error || 'failed'); return j; });
  }
  var boardWeek = 0;
  function boardView() {
    var weeks = SQ.seasonsNow(new Date()), sea = boardWeek ? weeks[0] : weeks[1];
    var box = el('section', { 'class': 'card board' }, [el('h2', { text: '🏆 Squeeze Street leaderboard' }),
      el('p', { 'class': 'muted small', text: 'Total profit after ten days. Everyone plays the same ten days each week; each player\'s best run counts. First names only.' })]);
    var tabs = el('div', { 'class': 'row tabs' }, [
      el('button', { type: 'button', 'class': 'chip', 'aria-pressed': boardWeek ? 'false' : 'true', text: 'This week', onclick: function () { boardWeek = 0; view(); } }),
      el('button', { type: 'button', 'class': 'chip', 'aria-pressed': boardWeek ? 'true' : 'false', text: 'Last week', onclick: function () { boardWeek = 1; view(); } })
    ]);
    var body = el('div', { 'aria-live': 'polite' }, [el('p', { 'class': 'muted', text: 'Loading…' })]);
    box.appendChild(tabs); box.appendChild(body);
    app.appendChild(box);
    app.appendChild(el('div', { 'class': 'row' }, [el('a', { 'class': 'btn primary', href: '#', text: run.plan.length && run.plan.length < SQ.DAYS ? 'Back to my stand' : 'Play', onclick: function (e) { e.preventDefault(); history.pushState('', '', location.pathname + location.search); view(); } })]));
    if (!CFG.endpoint) { body.innerHTML = ''; body.appendChild(el('p', { text: 'The leaderboard isn\'t switched on here.' })); return; }
    ask({ op: 'squeezeBoard', season: sea }).then(function (j) {
      body.innerHTML = '';
      if (!j.rows.length) { body.appendChild(el('p', { text: 'No runs yet ' + (boardWeek ? 'last week' : 'this week') + '. Be the first!' })); return; }
      var t = el('table', { 'class': 'lb' }, [el('thead', {}, [el('tr', {}, [el('th', { text: '#' }), el('th', { text: 'Name' }), el('th', { text: 'Class' }), el('th', { text: 'Profit' }), el('th', { text: 'Runs' })])])]);
      var tb = el('tbody'); t.appendChild(tb);
      j.rows.forEach(function (r) {
        tb.appendChild(el('tr', { 'class': (r.me ? 'me ' : '') + (r.rank <= 3 ? 'top' + r.rank : '') }, [el('td', { text: r.rank <= 3 ? ['🥇', '🥈', '🥉'][r.rank - 1] : String(r.rank) }), el('td', { text: r.name }), el('td', { text: r.cls || '' }), el('td', { 'class': 'num', text: m(r.profit) }), el('td', { 'class': 'num', text: String(r.runs) })]));
      });
      body.appendChild(t);
      body.appendChild(el('p', { 'class': 'muted small', text: j.players + ' player' + (j.players === 1 ? '' : 's') + ' ' + (boardWeek ? 'last week' : 'this week') + '.' + (j.me && !j.rows.some(function (r) { return r.me; }) ? ' You: number ' + j.me.rank + ' with ' + m(j.me.profit) + '.' : '') }));
    }, function () { body.innerHTML = ''; body.appendChild(el('p', { 'class': 'warn', text: 'Couldn\'t load the leaderboard. Check the internet and try again.' })); });
  }

  view();
})();
