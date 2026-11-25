/* Squeeze Street: the lemonade stand game's rules.
   The same text is pasted into backend/Code.gs, so the results script can replay a finished run from its choices and work
   out the profit itself (the page never sends a score). Change one, change the other the same way, and bump V.
   Plain ES5, no DOM: it runs in the browser and in Apps Script. All money is in whole cents. */
function squeezeSim() {
  var V = 'sq1', DAYS = 10, START = 1500, CUPS_PER_PITCHER = 10, SUGAR = 8, FLOOR = 500;
  var FINE_PERMIT = 300, FINE_INSPECT = 400, FEE_COOP = 300, FEE_TILL = 100, BONUS = 100;
  var WX = {
    rain: { label: 'Rainy', icon: '🌧️', t: [16, 20], c: [14, 24], m: [45, 60] },
    cloudy: { label: 'Cloudy', icon: '⛅', t: [22, 27], c: [26, 40], m: [55, 75] },
    sunny: { label: 'Sunny', icon: '☀️', t: [28, 34], c: [40, 58], m: [70, 90] },
    hot: { label: 'Heatwave', icon: '🔥', t: [37, 43], c: [60, 85], m: [90, 115] }
  };

  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function ri(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
  function r5(r, lo, hi) { return 5 * ri(r, Math.ceil(lo / 5), Math.floor(hi / 5)); }
  function shuffle(r, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // the ISO week ("2026-W48"): everyone plays the same ten days all week, so runs on the leaderboard are comparable
  function season(dt) {
    var d = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate())), wd = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - wd);
    var w = Math.ceil(((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
    return d.getUTCFullYear() + '-W' + (w < 10 ? '0' : '') + w;
  }
  // the weeks a run may be posted to: this one, and either side of it (a run finished just after midnight on Sunday)
  function seasonsNow(now) { var t = now.getTime(); return [season(new Date(t - 7 * 864e5)), season(now), season(new Date(t + 7 * 864e5))]; }

  // which kinds of rules each day uses: one-variable number lines first, then compound inequalities, then two-variable budgets
  var PLAN = [null,
    { price: 'one', ps: 0, sugar: 'one', ss: 0, show: 'text', q: 'pickLine:sugar' },
    { price: 'one', ps: 1, sugar: 'one', ss: 1, show: 'text', q: 'pickLine:price' },
    { price: 'one', ps: 2, sugar: 'one', ss: 2, show: 'line', q: 'pickText:price' },
    { price: 'two', sugar: 'one', ss: 2, show: 'text', cup: 1, q: 'mostCost:cup' },
    { price: 'two', sugar: 'two', show: 'text', lemon: 1, q: 'mostCost:lemon' },
    { price: 'two', sugar: 'two', show: 'line', cup: 1, lemon: 1, q: 'pickText:sugar' },
    { price: 'two', sugar: 'one', ss: 2, show: 'text', budget: 'text', q: 'region' },
    { price: 'two', sugar: 'two', show: 'line', budget: 'text', q: 'region' },
    { price: 'two', sugar: 'one', ss: 2, show: 'text', budget: 'graph', q: 'region' },
    { price: 'two', sugar: 'two', show: 'text', budget: 'text', cup: 1, lemon: 1, q: 'region' }
  ];

  // one day's weather, prices and rules: they depend only on the week and the day, never on what the player did
  function day(seed, d) {
    var r = rng(seed + d * 7919), P = PLAN[d];
    var keys = ['rain', 'cloudy', 'sunny', 'sunny', 'hot', 'hot', 'cloudy', 'sunny'];
    var wk = d === 1 ? 'sunny' : keys[ri(r, 0, keys.length - 1)], W = WX[wk];
    var sp = { d: d, wx: { k: wk, label: W.label, icon: W.icon, temp: ri(r, W.t[0], W.t[1]) } };
    var lo = ri(r, W.c[0], W.c[0] + 6), hi = lo + ri(r, 8, W.c[1] - W.c[0]);
    sp.crowd = { lo: lo, hi: hi }; sp.base = ri(r, lo, hi);
    // price rule: customers walk away above the top; on compound days the market permit also sets a lowest price
    var M = r5(r, W.m[0], W.m[1]), strictT = P.ps === 1 ? true : P.ps === 0 ? false : r() < 0.5;
    sp.price = { min: 0, minStrict: false, max: M, maxStrict: strictT, show: P.show };
    if (P.price === 'two') { sp.price.min = M - r5(r, 25, 40); sp.price.minStrict = r() < 0.4; sp.price.maxStrict = r() < 0.5; }
    sp.price.best = sp.price.maxStrict ? M - 5 : M;
    sp.price.low = sp.price.min ? (sp.price.minStrict ? sp.price.min + 5 : sp.price.min) : 5;
    // the health inspector: sugar scoops per pitcher
    var k = ri(r, 2, 3), sStrict = P.ss === 1 ? true : P.ss === 0 ? false : r() < 0.5;
    sp.sugar = { min: k, minStrict: sStrict, max: 0, maxStrict: false, show: P.show };
    if (P.sugar === 'two') { sp.sugar.minStrict = r() < 0.5; sp.sugar.max = k + ri(r, 2, 3); sp.sugar.maxStrict = r() < 0.5; }
    sp.sugar.best = sp.sugar.minStrict ? k + 1 : k;
    sp.sugar.top = sp.sugar.max ? (sp.sugar.maxStrict ? sp.sugar.max - 1 : sp.sugar.max) : 10;
    // supplies: a fixed price, or a range "lo < cost <= hi" where today's real price is only known at the till
    var cup = ri(r, 4, 6), lem = r5(r, 150, 200);
    sp.cup = { lo: cup, hi: cup, cost: cup };
    if (P.cup) { var cl = ri(r, 3, 5), ch = cl + ri(r, 2, 3); sp.cup = { lo: cl, hi: ch, cost: ri(r, cl + 1, ch) }; }
    sp.lemon = { lo: lem, hi: lem, cost: lem };
    if (P.lemon) { var ll = r5(r, 130, 170), lh = ll + r5(r, 30, 50); sp.lemon = { lo: ll, hi: lh, cost: r5(r, ll + 5, lh) }; }
    // the co-op's credit limit on cups and lemons: a two-variable inequality  (cup price)c + (lemon price)P <= L
    sp.budget = null;
    if (P.budget) {
      var a = sp.cup.hi, b = sp.lemon.hi, L = 50 * Math.round(0.8 * (hi * a + Math.ceil(hi / CUPS_PER_PITCHER) * b) / 50);
      sp.budget = { a: a, b: b, L: L, show: P.budget, range: sp.cup.lo !== sp.cup.hi || sp.lemon.lo !== sp.lemon.hi };
    }
    sp.q = question(r, P.q, sp);
    return sp;
  }

  function ineq(rule) { return { lo: rule.min, loStrict: rule.minStrict, hi: rule.max, hiStrict: rule.maxStrict }; }
  // one optional planning question a day: a right answer puts $1 in the tip jar; a wrong one costs nothing but that dollar
  function question(r, kind, sp) {
    var parts = kind.split(':'), q = { kind: parts[0], about: parts[1] || '' }, opts;
    if (q.kind === 'pickLine' || q.kind === 'pickText') {
      var R = q.about === 'price' ? sp.price : sp.sugar, right = ineq(R);
      if ((q.about === 'sugar' && !R.max) || (q.about === 'price' && !R.min)) {
        // a ray: s >= k, s > k, p <= M, p < M
        var one = q.about === 'sugar' ? { lo: R.min, loStrict: R.minStrict, hi: null } : { lo: null, hi: R.max, hiStrict: R.maxStrict };
        var flip = one.lo != null ? { lo: null, hi: one.lo, hiStrict: one.loStrict } : { lo: one.hi, loStrict: one.hiStrict, hi: null };
        var hole = one.lo != null ? { lo: one.lo, loStrict: !one.loStrict, hi: null } : { lo: null, hi: one.hi, hiStrict: !one.hiStrict };
        opts = [one, flip, hole];
      } else {
        opts = [right, { lo: right.lo, loStrict: !right.loStrict, hi: right.hi, hiStrict: !right.hiStrict }, { lo: null, hi: right.lo, hiStrict: !right.loStrict, also: { lo: right.hi, loStrict: !right.hiStrict } }];
      }
      q.var = q.about === 'price' ? 'p' : 's'; q.money = q.about === 'price';
    } else if (q.kind === 'mostCost') {
      var it = q.about === 'cup' ? sp.cup : sp.lemon, n = q.about === 'cup' ? 10 * ri(r, 3, 6) : ri(r, 3, 6);
      q.n = n; q.lo = it.lo; q.hi = it.hi;
      opts = [n * it.hi, n * it.lo, n * Math.round((it.lo + it.hi) / 2)];
    } else {
      // which order fits under the co-op limit (at the highest prices on a range day)?
      var B = sp.budget, P1 = ri(r, 1, Math.max(1, Math.min(4, Math.floor((B.L - 2 * B.a) / B.b)))), room = Math.floor((B.L - B.b * P1) / B.a);
      var c1 = Math.max(0, room - ri(r, 2, 8));
      var P2 = P1 + 1, c2 = Math.max(0, Math.floor((B.L - B.b * P2) / B.a)) + ri(r, 3, 10);
      var P3 = Math.max(1, P1 - 1), c3 = Math.floor((B.L - B.b * P3) / B.a) + ri(r, 1, 6);
      opts = [{ P: P1, c: c1 }, { P: P2, c: c2 }, { P: P3, c: c3 }];
    }
    var order = shuffle(r, [0, 1, 2]);
    q.opts = order.map(function (i) { return opts[i]; });
    q.ans = order.indexOf(0);
    return q;
  }

  function int(x, lo, hi) { x = Math.round(Number(x)); return isFinite(x) ? Math.max(lo, Math.min(hi, x)) : lo; }
  // a day's choices: [pitchers, sugar scoops per pitcher, cups to buy, price in cents (5-cent steps), question answer or -1]
  function clean(x) {
    x = x || [];
    return [int(x[0], 0, 30), int(x[1], 0, 10), int(x[2], 0, 400), 5 * int(Number(x[3]) / 5, 1, 60), int(x[4], -1, 2)];
  }
  // the most the order can be and still fit under a limit: cut pitchers first (lemonade spoils, paper cups keep), then cups
  function trim(P, c, a, b, lim) {
    if (a * c + b * P <= lim) return [P, c];
    if (a * c <= lim) return [Math.max(0, Math.floor((lim - a * c) / b)), c];
    return [0, Math.max(0, Math.floor(lim / a))];
  }

  // replays a run from the start; plan is a list of days' choices (an unfinished run replays as far as it goes)
  function run(sea, plan) {
    var seed = hash('squeeze|' + sea), cash = START, stock = 0, loans = 0, out = [], clean0 = [];
    plan = (Array.isArray(plan) ? plan : []).slice(0, DAYS);
    for (var d = 1; d <= plan.length; d++) {
      var sp = day(seed, d), x = clean(plan[d - 1]), o = { loan: 0, fines: [] };
      clean0.push(x);
      if (cash < FLOOR) { o.loan = FLOOR - cash; loans += o.loan; cash = FLOOR; }
      o.cash0 = cash; o.stock0 = stock;
      var P = x[0], s = x[1], c = x[2], p = x[3];
      o.asked = { P: P, c: c };
      if (sp.budget) {
        o.coop = sp.cup.cost * c + sp.lemon.cost * P;
        if (o.coop > sp.budget.L) { var t = trim(P, c, sp.cup.cost, sp.lemon.cost, sp.budget.L); P = t[0]; c = t[1]; o.fines.push({ k: 'coop', amt: FEE_COOP }); }
      }
      var perP = sp.lemon.cost + s * SUGAR;
      if (P * perP + c * sp.cup.cost > cash) { var t2 = trim(P, c, sp.cup.cost, perP, cash); P = t2[0]; c = t2[1]; o.fines.push({ k: 'till', amt: FEE_TILL }); }
      o.P = P; o.c = c; o.s = s; o.p = p;
      o.cost = { lemons: P * sp.lemon.cost, sugar: P * s * SUGAR, cups: c * sp.cup.cost };
      var spent = o.cost.lemons + o.cost.sugar + o.cost.cups;
      stock += c;
      var R = sp.price, S = sp.sugar;
      o.over = R.maxStrict ? p >= R.max : p > R.max;
      o.under = R.min ? (R.minStrict ? p <= R.min : p < R.min) : false;
      o.weak = S.minStrict ? s <= S.min : s < S.min;
      o.sweet = S.max ? (S.maxStrict ? s >= S.max : s > S.max) : false;
      var want = o.over ? Math.floor(sp.base * 0.15) : sp.base;
      if (o.sweet) want = Math.floor(want * 0.6);
      o.want = want;
      o.made = P * CUPS_PER_PITCHER;
      o.sold = Math.min(want, o.made, stock);
      stock -= o.sold;
      o.poured = o.made - o.sold;
      o.revenue = o.sold * p;
      if (P > 0 && o.under) o.fines.push({ k: 'permit', amt: FINE_PERMIT });
      if (P > 0 && o.weak) o.fines.push({ k: 'inspector', amt: FINE_INSPECT });
      var fined = 0; o.fines.forEach(function (f) { fined += f.amt; });
      o.q = x[4]; o.right = x[4] >= 0 && x[4] === sp.q.ans; o.bonus = o.right ? BONUS : 0;
      o.profit = o.revenue - spent - fined + o.bonus;
      cash += o.profit;
      o.cash1 = cash; o.stock1 = stock;
      out.push({ spec: sp, out: o });
    }
    return { season: sea, days: out, cash: cash, stock: stock, loans: loans, profit: cash - START - loans, plan: clean0, done: plan.length === DAYS };
  }

  return {
    V: V, DAYS: DAYS, START: START, CUPS_PER_PITCHER: CUPS_PER_PITCHER, SUGAR: SUGAR, FLOOR: FLOOR,
    FINE_PERMIT: FINE_PERMIT, FINE_INSPECT: FINE_INSPECT, FEE_COOP: FEE_COOP, FEE_TILL: FEE_TILL, BONUS: BONUS,
    season: season, seasonsNow: seasonsNow, seed: function (sea) { return hash('squeeze|' + sea); }, day: day, run: run, clean: clean
  };
}
