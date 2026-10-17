/* Climb: shared core for the linear functions check-in.
   The skill ladder, misconception tags, number and equation checking, seeded randomness,
   and the figure helpers (graphs, tables, mapping diagrams) that question templates draw with.
   Templates register themselves with CLIMB.add({...}) from climb/bank-*.js. */
(function () {
  'use strict';
  var C = window.CLIMB = window.CLIMB || {};

  /* ---------- timing and rules (from the plan's design parameters) ---------- */
  C.P = {
    session: 12 * 60,        // seconds live
    item: 90,                // seconds per item
    almost: 20,              // "Almost got it" extra seconds, offered in the last 20 s
    almostPerSession: 3,
    explain: 30,             // teaching loop: explanation screen, at most
    guided: 60,              // teaching loop: guided try, at most
    testOutSecs: 60,
    reviewGap: 2,            // sessions after Secure before a review is due
    leavesNoSecure: 3,       // tab leaves in a session after which nothing counts toward Secure
    awayAmber: 20,           // seconds away that flag amber
    fastSecs: 10,            // correct this fast on Level 4+ marks "needs check"
    idleSecs: 60,
    probeSessions: [1, 8, 15],
    online: true,            // students take it at home: the interactive-item rule below applies
    iaFrom: 4                // from this session on, every Secure streak includes the skill's interactive template
  };

  /* ---------- the ladder (Version 1: F1, F2 and skills 1-13) ---------- */
  C.SKILLS = [
    { id: 'F1', name: 'Find the change', needs: [] },
    { id: 'F2', name: 'How two quantities change together', needs: ['F1'] },
    { id: '1', name: 'Evaluate a rule', needs: [] },
    { id: '2', name: 'Read values from a graph', needs: [] },
    { id: '3', name: 'Function or not: pairs and mappings', needs: ['1'] },
    { id: '4', name: 'Function or not: graphs, tables, constant functions', needs: ['2', '3'] },
    { id: '5', name: 'Functions in context', needs: ['4'] },
    { id: '6', name: 'Rate of change (the step) in stories and tables', needs: ['1', 'F2'] },
    { id: '7', name: 'Slope as a rate on a graph', needs: ['2', '6', 'F1'] },
    { id: '8', name: 'Slope from two points', needs: ['7'] },
    { id: '9', name: 'Rate from tables and scaled graphs', needs: ['8'] },
    { id: '10', name: 'Initial value (the start)', needs: ['2', 'F2'] },
    { id: '11', name: 'Equation from a graph', needs: ['7', '10'] },
    { id: '12', name: 'Equation from a table or two points', needs: ['9', '11'] },
    { id: '13', name: 'Slope and intercept in context', needs: ['11'] },
    { id: '14', name: 'Linear or nonlinear: identify', needs: ['7'] },
    { id: '15', name: 'Linear or nonlinear: justify', needs: ['9', '14'] },
    { id: '16', name: 'Compare rate and initial value', needs: ['9', '10'] },
    { id: '17', name: 'Compare in context', needs: ['13', '16'] },
    { id: '18', name: 'Qualitative graphs: describe and match', needs: ['2'] },
    { id: '19', name: 'Qualitative graphs: rates', needs: ['7', '18'] },
    { id: '20', name: 'Extension: slope and equations', needs: ['12'], ext: true },
    { id: '21', name: 'Extension: reasoning', needs: ['5', '15', '17', '19'], ext: true }
  ];
  // the core ladder (the pacing projection counts these; extension skills come after)
  C.CORE = C.SKILLS.filter(function (s) { return !s.ext; }).map(function (s) { return s.id; });
  C.SKILL = {}; C.SKILLS.forEach(function (s, i) { s.i = i; C.SKILL[s.id] = s; });
  C.label = function (id) { return /^F/.test(id) ? id : 'Skill ' + id; };
  // a correct answer on the key skill also counts as review for these (plan: "Review credit flows backward")
  C.BACK = { '4': ['3'], '5': ['4'], '6': ['F2'], '7': ['F1'], '8': ['7', 'F1'], '9': ['8'], '11': ['7', '10'], '12': ['8', '9', '11'], '13': ['11'], '15': ['14'], '16': ['9', '10'], '17': ['13', '16'], '19': ['7', '18'], '20': ['12'] };
  // a misconception seen on a later skill points back at the skill that teaches it
  C.TAGSKILL = { M1: '7', M2: 'F1', M3: '10', M4: '7', M5: '9', M6: '3', M7: '14', M8: '9', M9: '10', M10: '18', M11: '16', M12: '7', M13: '7', M15: '4', M16: '13', M17: 'F2' };
  // tap-to-see glossary for context words in questions
  C.GLOSS = {
    'fare': 'The price you pay for a trip, such as a taxi or bus ride.',
    'call-out fee': 'A fixed amount a worker charges just for coming, before any hourly cost.',
    'postage': 'The cost of sending a letter or parcel.',
    'joining fee': 'A one-time amount you pay to start, such as joining a gym.',
    'starting fee': 'A fixed amount charged at the start, before anything else is added.',
    'rate': 'How much one quantity changes for every 1 more of the other.',
    'steady': 'Changing by the same amount every time (a constant rate).',
    'initial value': 'The start: the output when the input is 0. Where the line crosses the up (y) axis.',
    // the Sandy Flats lessons say "start", "step", "across" and "up": these bridge Climb's words to theirs
    'rate of change': 'The step: how much the output changes for every 1 more input.',
    'slope': 'The step, seen on a graph: rise ÷ run (how far up for every 1 across).',
    'y-intercept': 'The start: where the line crosses the up (y) axis.',
    'y-axis': 'The up axis: outputs are read up this axis.',
    'x-axis': 'The across axis: inputs are read along this axis.',
    'nonlinear': 'Not linear: the step is not the same every time, so the graph is not a straight line.',
    'linear': 'The same step every time, so the graph is a straight line.',
    'proportional': 'Starts at 0: doubling the input doubles the output.',
    'function': 'A rule where each input has exactly one output.',
    'constant': 'Staying the same: the output never changes, so the step is 0.'
  };
  // where each skill is taught in the Sandy Flats films (lesson number students see = film order)
  C.FILM = { F1: 'before the unit (integer subtraction)', F2: 'Films 1-2', '1': 'Film 1', '2': 'Film 4', '3': 'Film 3', '4': 'Film 4', '5': 'Film 7', '6': 'Film 7', '7': 'Film 9', '8': 'Film 10', '9': 'Film 13', '10': 'Films 1 and 8', '11': 'Film 10', '12': 'Film 8', '13': 'Film 7', '14': 'Film 12', '15': 'Film 13', '16': 'Film 14', '17': 'Film 14', '18': 'Film 6', '19': 'Film 6', '20': 'stretch', '21': 'stretch' };

  /* ---------- misconception tags ---------- */
  C.TAGS = {
    M1: { name: 'Slope as run over rise', say: 'You found run over rise. Slope is rise over run: the change in y divided by the change in x.', habit: 'Ask: for every 1 step right, how far up or down? Up goes on top.' },
    M2: { name: 'Sign error', say: 'The size is right, but the sign is not. Check which way it changes.', habit: 'Always do end minus start, and keep the sign: down or less is negative.' },
    M3: { name: 'y-intercept confused with x-intercept', say: 'That is where the line crosses the x-axis. The initial value is where it crosses the y-axis, at x = 0.', habit: 'Initial value means "when x is 0". Look on the y-axis.' },
    M4: { name: 'Slope from one point', say: 'You divided y by x at one point. That only works when the line goes through (0, 0).', habit: 'Use two points and divide the changes, not the values.' },
    M5: { name: 'Counted squares, ignored the scale', say: 'You counted grid squares, but each square is not worth 1 on this axis.', habit: 'Read the numbers on the axes before you count.' },
    M6: { name: 'Inputs and outputs reversed', say: 'A function can repeat outputs. What it cannot do is give one input two different outputs.', habit: 'Check the inputs: does any input appear with two different outputs?' },
    M7: { name: 'Linear means "increasing" or "has a pattern"', say: 'Linear means the rate of change is the same everywhere, not just that it goes up or follows a pattern.', habit: 'Check that every change in y divided by change in x is the same.' },
    M8: { name: 'Rate from rows when x skips', say: 'That is the change over more than 1 step of x. The rate is the change for 1 step: divide by the change in x.', habit: 'Divide the change in y by the change in x, every time.' },
    M9: { name: 'Rate and start value swapped', say: 'You swapped the rate and the starting value.', habit: 'The rate is "per 1 more". The start value is the amount at 0.' },
    M10: { name: 'Graph read as a picture', say: 'The graph is not a picture of the path. It shows how one quantity changes as the other changes.', habit: 'Read the axes first, then ask what going up or down means.' },
    M11: { name: 'Compared one feature only', say: 'You compared only one feature. Both the rate and the start value matter.', habit: 'Check the start and the rate before you decide.' },
    M12: { name: 'Slope read where the line crosses', say: 'Where the line crosses an axis is not its slope. Slope is how steep it is.', habit: 'Slope = change in y ÷ change in x between two points.' },
    M13: { name: 'Slope as a length or height', say: 'You used a height or a value, not a change. Slope compares two changes.', habit: 'Find how much y changes and how much x changes, then divide.' },
    M14: { name: 'Combined all the numbers', say: 'Adding or multiplying all the numbers you see does not answer the question.', habit: 'Say what each number means before you use it.' },
    M15: { name: 'A function needs a formula', say: 'A function does not need a formula or a pattern. It only needs one output for each input.', habit: 'Ignore the pattern: check each input has exactly one output.' },
    M16: { name: 'Assumed proportional', say: 'Doubling x only doubles y when the line goes through (0, 0). Here it starts somewhere else.', habit: 'Check the starting value before you scale.' },
    M17: { name: 'Subtracted the changes', say: 'You subtracted the changes. To compare them as a rate, divide.', habit: 'Rate = change in y ÷ change in x.' },
    T0: { name: 'Timed out', say: 'Time ran out. Here is the method, step by step.', habit: 'Start with the first step even if you are unsure.' },
    G: { name: 'Other', say: 'Not yet. Here is the method with your numbers.', habit: 'Work one step at a time and check each step.' }
  };

  /* ---------- seeded randomness: the same seed always rebuilds the same question ---------- */
  C.rng = function (seed) {
    var a = seed >>> 0;
    function next() { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
    var R = {
      next: next,
      int: function (lo, hi) { return lo + Math.floor(next() * (hi - lo + 1)); },
      nz: function (lo, hi) { var v; do { v = R.int(lo, hi); } while (v === 0); return v; },     // never 0
      pick: function (arr) { return arr[Math.floor(next() * arr.length)]; },
      chance: function (p) { return next() < p; },
      sign: function () { return next() < 0.5 ? -1 : 1; },
      shuffle: function (arr) { var b = arr.slice(); for (var i = b.length - 1; i > 0; i--) { var j = Math.floor(next() * (i + 1)), t = b[i]; b[i] = b[j]; b[j] = t; } return b; },
      // distinct values from lo..hi, none in `avoid`
      distinct: function (n, lo, hi, avoid) { var out = [], tries = 0; while (out.length < n && tries++ < 500) { var v = R.int(lo, hi); if (out.indexOf(v) < 0 && (!avoid || avoid.indexOf(v) < 0)) out.push(v); } return out; },
      name: function () { return R.pick(['Aisha', 'Omar', 'Lina', 'Yusuf', 'Sara', 'Khalid', 'Maya', 'Faisal', 'Noor', 'Daniel', 'Hana', 'Sam', 'Layla', 'Adam', 'Reem', 'Leo']); }
    };
    return R;
  };
  C.newSeed = function () { return (Math.floor(Math.random() * 2147483646) + 1) >>> 0; };

  /* ---------- numbers ---------- */
  var MINUS = '−';
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  C.gcd = gcd;
  // exact fraction n/d as a value; keep it as a number everywhere and format with C.fmt
  C.fr = function (n, d) { return n / d; };
  // the closest small fraction to v, as [n, d], or null
  C.asFrac = function (v, maxD) {
    maxD = maxD || 12;
    for (var d = 1; d <= maxD; d++) { var n = Math.round(v * d); if (Math.abs(n / d - v) < 1e-9) { var g = gcd(n, d); return [n / g, d / g]; } }
    return null;
  };
  // display: whole numbers, then simple fractions (2/3), then up to 2 decimals; true minus sign
  C.fmt = function (v, opt) {
    if (typeof v === 'string') return v;
    if (!isFinite(v)) return '?';
    var f = C.asFrac(v), s;
    if (opt === 'dec' || !f) s = String(Math.round(v * 100) / 100);
    else if (f[1] === 1) s = String(f[0]);
    else s = Math.abs(f[0]) + '/' + f[1], s = (f[0] < 0 ? '-' : '') + s;
    return s.replace(/^-/, MINUS);
  };
  // signed term for equations: "+ 3", "− 3"
  C.term = function (v) { return (v < 0 ? MINUS + ' ' : '+ ') + C.fmt(Math.abs(v)); };
  // y = mx + b written the usual way: y = 2x − 3, y = −x, y = (1/2)x + 4, y = 5
  C.eqText = function (m, b, yv, xv) {
    yv = yv || 'y'; xv = xv || 'x';
    var mx = m === 0 ? '' : m === 1 ? xv : m === -1 ? MINUS + xv : (C.asFrac(m) && C.asFrac(m)[1] !== 1 ? (m < 0 ? MINUS : '') + '(' + C.fmt(Math.abs(m)) + ')' + xv : C.fmt(m) + xv);
    if (!mx) return yv + ' = ' + C.fmt(b);
    return yv + ' = ' + mx + (b === 0 ? '' : ' ' + C.term(b));
  };
  // a student's typed number: 2, -3, −3, 0.5, .5, 2/3, -2/3, 1 1/2. NaN if it isn't one.
  C.parseNum = function (s) {
    s = String(s == null ? '' : s).trim().replace(/[−–—]/g, '-').replace(/\s+/g, ' ').replace(/,/g, '');
    if (!s) return NaN;
    var m;
    if ((m = s.match(/^(-?)\s*(\d+)\s+(\d+)\s*\/\s*(\d+)$/))) { var v = +m[2] + (+m[3]) / (+m[4]); return +m[4] ? (m[1] ? -v : v) : NaN; }
    if ((m = s.match(/^(-?)\s*\(?\s*(-?\d*\.?\d+)\s*\)?\s*\/\s*\(?\s*(-?\d*\.?\d+)\s*\)?$/))) { var d = +m[3]; if (!d) return NaN; var q = (+m[2]) / d; return m[1] ? -q : q; }
    if (/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s.replace(/\s/g, ''))) return +s.replace(/\s/g, '');
    return NaN;
  };
  // "a 5-riyal fee" but "an 8-riyal fee" / "an 11-riyal fee"; "1 minute" but "2 minutes"
  C.an = function (n) { n = Math.abs(Math.round(n)); return n === 11 || n === 18 || /^8/.test(String(n)) ? 'an' : 'a'; };
  C.pl = function (n, word, many) { return n + ' ' + (Math.abs(n) === 1 ? word : (many || word + 's')); };
  C.near = function (a, b, tol) { return Math.abs(a - b) <= (tol == null ? 0.01 : tol); };

  /* ---------- equations: parsed and checked at 3 x-values ---------- */
  // returns function(x) or null. Accepts y = 2x + 3, y = 3 + 2x, 2x + 3 = y, 2x+3, y = (1/2)x − 4, y = x/2, y = 2(x + 1)
  C.parseEq = function (s, xv, yv) {
    xv = (xv || 'x').toLowerCase(); yv = (yv || 'y').toLowerCase();
    s = String(s || '').toLowerCase().replace(/[−–—]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/\s+/g, '');
    s = s.replace(/^f\(x\)=/, yv + '=');
    var sides = s.split('=');
    var expr;
    if (sides.length === 1) expr = sides[0];
    else if (sides.length === 2) { if (sides[0] === yv) expr = sides[1]; else if (sides[1] === yv) expr = sides[0]; else return null; }
    else return null;
    if (!expr) return null;
    var toks = [], i = 0;
    while (i < expr.length) {
      var c = expr[i];
      if (/[0-9.]/.test(c)) { var j = i; while (j < expr.length && /[0-9.]/.test(expr[j])) j++; var n = expr.slice(i, j); if (!/^(\d+\.?\d*|\.\d+)$/.test(n)) return null; toks.push({ t: 'n', v: +n }); i = j; continue; }
      if (c === xv) { toks.push({ t: 'x' }); i++; continue; }
      if ('+-*/()'.indexOf(c) >= 0) { toks.push({ t: c }); i++; continue; }
      return null;
    }
    // implicit multiplication: 2x, 2(…), x(…), )(, )x, )2
    var out = [];
    toks.forEach(function (k, idx) {
      var p = out[out.length - 1];
      if (p && (p.t === 'n' || p.t === 'x' || p.t === ')') && (k.t === 'n' || k.t === 'x' || k.t === '(')) out.push({ t: '*' });
      out.push(k);
    });
    var pos = 0;
    function peek() { return out[pos]; }
    function eat(t) { if (out[pos] && out[pos].t === t) { pos++; return true; } return false; }
    function primary() {
      var k = out[pos++]; if (!k) throw 0;
      if (k.t === 'n') return function () { return k.v; };
      if (k.t === 'x') return function (x) { return x; };
      if (k.t === '(') { var e = sum(); if (!eat(')')) throw 0; return e; }
      if (k.t === '-') { var u = primary(); return function (x) { return -u(x); }; }
      if (k.t === '+') return primary();
      throw 0;
    }
    function prod() {
      var a = primary();
      while (peek() && (peek().t === '*' || peek().t === '/')) {
        var op = out[pos++].t, b = primary(), l = a;
        a = op === '*' ? (function (l, b) { return function (x) { return l(x) * b(x); }; })(l, b) : (function (l, b) { return function (x) { return l(x) / b(x); }; })(l, b);
      }
      return a;
    }
    function sum() {
      var a = prod();
      while (peek() && (peek().t === '+' || peek().t === '-')) {
        var op = out[pos++].t, b = prod(), l = a;
        a = op === '+' ? (function (l, b) { return function (x) { return l(x) + b(x); }; })(l, b) : (function (l, b) { return function (x) { return l(x) - b(x); }; })(l, b);
      }
      return a;
    }
    try { var f = sum(); if (pos !== out.length) return null; if (!isFinite(f(1.5))) return null; return f; } catch (e) { return null; }
  };
  // equal answers for the interactive kinds: lists of points or arrows (in any order), or {m, b} slider values
  C.sameVal = function (a, b) {
    if (a == null || b == null) return false;
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      var key = function (q) { return Array.isArray(q) ? q.map(function (n) { return Math.round(n * 1000); }).join(',') : String(q); };
      var A = a.map(key).sort(), B = b.map(key).sort();
      return A.every(function (x, i) { return x === B[i]; });
    }
    if (typeof a === 'object') return Object.keys(b).every(function (k) { return C.near(+a[k], +b[k], 1e-6); });
    return C.near(+a, +b, 1e-6);
  };
  C.sameFn = function (f, g) { return [-2, 1, 3].every(function (x) { var a = f(x), b = g(x); return isFinite(a) && isFinite(b) && Math.abs(a - b) < 1e-6; }); };
  C.line = function (m, b) { return function (x) { return m * x + b; }; };

  /* ---------- keyword rubric for short typed answers ---------- */
  var MISSPELL = { functoin: 'function', fucntion: 'function', funtion: 'function', ouput: 'output', outpt: 'output', imput: 'input', inpt: 'input', valeu: 'value', vaule: 'value' };
  C.norm = function (s) { return ' ' + String(s || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).map(function (w) { return MISSPELL[w] || w; }).join(' ').replace(/\s+/g, ' ').trim() + ' '; };
  C.hasAny = function (normText, words) { return words.some(function (w) { return normText.indexOf(' ' + C.norm(w).trim() + ' ') >= 0; }); };

  /* ---------- figures (return HTML strings) ---------- */
  var COL = { line: '#1D4ED8', line2: '#C2410C', line3: '#047857', pt: '#F97316', grid: '#E3E8F2', axis: '#4A5468', ink: '#111827' };
  C.COL = COL;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  C.esc = esc;
  // spec: {x:[min,max], y:[min,max], dx, dy (grid step, default 1), lx, ly (label every, default 2 grid lines or 1 when few),
  //        xl, yl (axis titles), size (px), lines:[{m,b} | {p:[[x1,y1],[x2,y2]]} | {seg:[[x,y],...]} | {f:fn}, color?, dash?],
  //        pts:[{x,y,l, c}], label: what the figure shows (for screen readers), nums:false hides axis numbers }
  // the graph's pixel frame: shared by C.graph and the drag-the-point questions
  C.frame = function (g) {
    var W = g.size || 340, H = g.h || W, pad = { l: g.yl ? 46 : 30, r: 12, t: 12, b: g.xl ? 42 : 26 };
    var x0 = g.x[0], x1 = g.x[1], y0 = g.y[0], y1 = g.y[1], iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    return { W: W, H: H, pad: pad, iw: iw, ih: ih,
      X: function (x) { return pad.l + (x - x0) / (x1 - x0) * iw; }, Y: function (y) { return pad.t + (y1 - y) / (y1 - y0) * ih; },
      x: function (px) { return x0 + (px - pad.l) / iw * (x1 - x0); }, y: function (py) { return y1 - (py - pad.t) / ih * (y1 - y0); } };
  };
  C.graph = function (g) {
    var F = C.frame(g), W = F.W, H = F.H, pad = F.pad, iw = F.iw, ih = F.ih, X = F.X, Y = F.Y;
    var x0 = g.x[0], x1 = g.x[1], y0 = g.y[0], y1 = g.y[1], dx = g.dx || 1, dy = g.dy || 1;
    var lx = g.lx || (((x1 - x0) / dx) > 12 ? 2 * dx : dx), ly = g.ly || (((y1 - y0) / dy) > 12 ? 2 * dy : dy);
    var s = '<svg class="cfig" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="' + esc(g.label || 'Graph') + '" style="max-width:100%;height:auto">';
    s += '<rect x="' + pad.l + '" y="' + pad.t + '" width="' + iw + '" height="' + ih + '" fill="#fff" stroke="#DCE2EE"/>';
    var v;
    for (v = Math.ceil(x0 / dx) * dx; v <= x1 + 1e-9; v += dx) s += '<line x1="' + X(v) + '" y1="' + pad.t + '" x2="' + X(v) + '" y2="' + (pad.t + ih) + '" stroke="' + COL.grid + '"/>';
    for (v = Math.ceil(y0 / dy) * dy; v <= y1 + 1e-9; v += dy) s += '<line x1="' + pad.l + '" y1="' + Y(v) + '" x2="' + (pad.l + iw) + '" y2="' + Y(v) + '" stroke="' + COL.grid + '"/>';
    var ax = (y0 <= 0 && y1 >= 0) ? Y(0) : (y0 > 0 ? Y(y0) : Y(y1)), ay = (x0 <= 0 && x1 >= 0) ? X(0) : X(x0);
    s += '<line x1="' + pad.l + '" y1="' + ax + '" x2="' + (pad.l + iw) + '" y2="' + ax + '" stroke="' + COL.axis + '" stroke-width="1.6"/>';
    s += '<line x1="' + ay + '" y1="' + pad.t + '" x2="' + ay + '" y2="' + (pad.t + ih) + '" stroke="' + COL.axis + '" stroke-width="1.6"/>';
    if (g.nums !== false) {
      var fs = 11;
      for (v = Math.ceil(x0 / lx) * lx; v <= x1 + 1e-9; v += lx) { if (Math.abs(v) < 1e-9 && x0 < 0) continue; s += '<text x="' + X(v) + '" y="' + Math.min(ax + 14, pad.t + ih + 14) + '" font-size="' + fs + '" text-anchor="middle" fill="' + COL.axis + '">' + C.fmt(Math.round(v * 1000) / 1000, 'dec') + '</text>'; }
      for (v = Math.ceil(y0 / ly) * ly; v <= y1 + 1e-9; v += ly) { if (Math.abs(v) < 1e-9 && x0 < 0) continue; s += '<text x="' + (ay - 5) + '" y="' + (Y(v) + 4) + '" font-size="' + fs + '" text-anchor="end" fill="' + COL.axis + '">' + C.fmt(Math.round(v * 1000) / 1000, 'dec') + '</text>'; }
      if (x0 < 0 && y0 < 0 && W >= 200) s +='<text x="' + (ay - 5) + '" y="' + (ax + 14) + '" font-size="' + fs + '" text-anchor="end" fill="' + COL.axis + '">0</text>';
    }
    if (g.xl) s += '<text x="' + (pad.l + iw / 2) + '" y="' + (H - 6) + '" font-size="13" font-weight="700" text-anchor="middle" fill="' + COL.ink + '">' + esc(g.xl) + '</text>';
    if (g.yl) s += '<text transform="translate(13 ' + (pad.t + ih / 2) + ') rotate(-90)" font-size="13" font-weight="700" text-anchor="middle" fill="' + COL.ink + '">' + esc(g.yl) + '</text>';
    s += '<clipPath id="cl' + (++clipN) + '"><rect x="' + pad.l + '" y="' + pad.t + '" width="' + iw + '" height="' + ih + '"/></clipPath><g clip-path="url(#cl' + clipN + ')">';
    (g.lines || []).forEach(function (L) {
      var col = L.color || COL.line, dash = L.dash ? ' stroke-dasharray="6 5"' : '', wid = L.w || 3;
      if (L.seg) { s += '<polyline fill="none" stroke="' + col + '" stroke-width="' + wid + '" stroke-linejoin="round" stroke-linecap="round"' + dash + ' points="' + L.seg.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' ') + '"/>'; return; }
      var f = L.f;
      if (!f && L.p) { var p = L.p, mm = (p[1][1] - p[0][1]) / (p[1][0] - p[0][0]); if (!isFinite(mm)) { s += '<line x1="' + X(p[0][0]) + '" y1="' + pad.t + '" x2="' + X(p[0][0]) + '" y2="' + (pad.t + ih) + '" stroke="' + col + '" stroke-width="' + wid + '"' + dash + '/>'; return; } f = C.line(mm, p[0][1] - mm * p[0][0]); }
      if (!f) f = C.line(L.m, L.b);
      var a = L.from != null ? L.from : x0, b = L.to != null ? L.to : x1, pts = [], n = L.curve ? 80 : 1;
      for (var k = 0; k <= n; k++) { var xx = a + (b - a) * k / n; pts.push(X(xx) + ',' + Y(f(xx))); }
      s += '<polyline fill="none" stroke="' + col + '" stroke-width="' + wid + '" stroke-linecap="round"' + dash + ' points="' + pts.join(' ') + '"/>';
    });
    s += '</g>';
    (g.pts || []).forEach(function (P) {
      var cx = X(P.x), cy = Y(P.y);
      // a handle the student drags (or moves with the arrow keys)
      if (P.h != null) s += '<g class="hdl" data-h="' + P.h + '" tabindex="0" role="slider" aria-label="' + esc((P.name || 'Point') + ' at ' + C.pt(P.x, P.y) + '. Use the arrow keys to move it.') + '" style="cursor:grab;outline:none"><circle cx="' + cx + '" cy="' + cy + '" r="17" fill="#FDEDE3" class="halo"/><circle cx="' + cx + '" cy="' + cy + '" r="9" fill="' + (P.c || COL.pt) + '" stroke="#fff" stroke-width="2"/></g>';
      else s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (P.r || 6) + '" fill="' + (P.c || COL.pt) + '" stroke="#fff" stroke-width="2"/>';
      if (P.l) { var right = cx < pad.l + iw - 70; s += '<text x="' + (cx + (right ? 9 : -9)) + '" y="' + (cy - 9) + '" font-size="13" font-weight="700" text-anchor="' + (right ? 'start' : 'end') + '" fill="' + COL.ink + '" paint-order="stroke" stroke="#fff" stroke-width="3">' + esc(P.l) + '</text>'; }
    });
    return s + '</svg>';
  };
  var clipN = 0;
  // point label "(−3, 4)"
  C.pt = function (x, y) { return '(' + C.fmt(x) + ', ' + C.fmt(y) + ')'; };
  // spec: {cols:['x','y'] or [{h:'Hours'}...], rows:[[..],[..]], side:true draws it sideways (header column, values across)}
  C.table = function (t) {
    var head = t.cols.map(function (h) { return typeof h === 'string' ? h : h.h; }), s = '<table class="ctbl">';
    if (t.side) {
      head.forEach(function (h, c) { s += '<tr><th scope="row">' + h + '</th>' + t.rows.map(function (r) { return '<td>' + (typeof r[c] === 'number' ? C.fmt(r[c]) : r[c]) + '</td>'; }).join('') + '</tr>'; });
    } else {
      s += '<tr>' + head.map(function (h) { return '<th scope="col">' + h + '</th>'; }).join('') + '</tr>';
      t.rows.forEach(function (r) { s += '<tr>' + r.map(function (v) { return '<td>' + (typeof v === 'number' ? C.fmt(v) : v) + '</td>'; }).join('') + '</tr>'; });
    }
    return s + '</table>';
  };
  // mapping diagram: {left:[...], right:[...], arrows:[[i,j],...], lt:'Input', rt:'Output'}
  C.mapping = function (m) {
    var n = Math.max(m.left.length, m.right.length), H = 40 + n * 40, W = 300;
    var s = '<svg class="cfig" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Mapping diagram" style="max-width:100%;height:auto">';
    s += '<defs><marker id="ar' + (++clipN) + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="' + COL.line + '"/></marker></defs>';
    s += '<ellipse cx="60" cy="' + (H / 2 + 8) + '" rx="44" ry="' + (n * 20 + 6) + '" fill="#F3F5FA" stroke="#DCE2EE"/><ellipse cx="240" cy="' + (H / 2 + 8) + '" rx="44" ry="' + (n * 20 + 6) + '" fill="#F3F5FA" stroke="#DCE2EE"/>';
    s += '<text x="60" y="16" text-anchor="middle" font-size="13" font-weight="700">' + esc(m.lt || 'Input') + '</text><text x="240" y="16" text-anchor="middle" font-size="13" font-weight="700">' + esc(m.rt || 'Output') + '</text>';
    function yy(i, len) { return H / 2 + 8 + (i - (len - 1) / 2) * 40; }
    m.left.forEach(function (v, i) { s += '<text x="60" y="' + (yy(i, m.left.length) + 5) + '" text-anchor="middle" font-size="16" font-weight="700">' + esc(typeof v === 'number' ? C.fmt(v) : v) + '</text>'; });
    m.right.forEach(function (v, i) { s += '<text x="240" y="' + (yy(i, m.right.length) + 5) + '" text-anchor="middle" font-size="16" font-weight="700">' + esc(typeof v === 'number' ? C.fmt(v) : v) + '</text>'; });
    m.arrows.forEach(function (a) { s += '<line x1="84" y1="' + yy(a[0], m.left.length) + '" x2="214" y2="' + yy(a[1], m.right.length) + '" stroke="' + COL.line + '" stroke-width="2" marker-end="url(#ar' + clipN + ')"/>'; });
    return s + '</svg>';
  };
  // a list of ordered pairs: {(1, 2), (3, 4)}
  C.pairs = function (ps) { return '{' + ps.map(function (p) { return C.pt(p[0], p[1]); }).join(', ') + '}'; };

  /* ---------- the bank ---------- */
  C.T = {}; C.BY = {};
  C.add = function (t) {
    if (!t || !t.id || !C.SKILL[t.skill] || typeof t.gen !== 'function') { if (window.console) console.warn('Climb: skipped template', t && t.id); return; }
    t.level = t.level || 1;
    C.T[t.id] = t;
    (C.BY[t.skill] = C.BY[t.skill] || []).push(t);
    C.BY[t.skill].sort(function (a, b) { return a.level - b.level || (a.order || 0) - (b.order || 0); });
  };
  // build the question for a template and a seed (the same pair always gives the same question)
  C.make = function (tid, seed) {
    var t = C.T[tid]; if (!t) return null;
    var it = t.gen(C.rng(seed));
    it.tid = tid; it.seed = seed; it.level = t.level; it.skill = t.skill; it.type = t.type;
    return it;
  };
  C.diff = function (level) { return 205 + (level - 1) * 10; };

  /* ---------- grading ---------- */
  // vals: one entry per part (string for num/eq/text, option index for choice, array of indexes for multi)
  // returns {ok, tag, parts:[bool], shown: a short text of what the student answered}
  C.grade = function (it, vals) {
    var res = { ok: true, tag: null, parts: [] };
    it.parts.forEach(function (p, i) {
      var v = vals[i], ok = false, tag = null;
      if (p.kind === 'num') {
        var n = C.parseNum(v);
        ok = isFinite(n) && C.near(n, p.key, p.tol);
        if (!ok && isFinite(n)) (p.wrong || []).some(function (w) { if (C.near(n, w.v, p.tol)) { tag = w.tag; return true; } });
      } else if (p.kind === 'choice') {
        var o = p.opts[v]; ok = !!(o && o.ok); if (!ok && o) tag = o.tag || null;
      } else if (p.kind === 'multi') {
        var sel = v || []; ok = p.opts.every(function (o, k) { return !!o.ok === (sel.indexOf(k) >= 0); });
        if (!ok) { p.opts.some(function (o, k) { if (!o.ok && sel.indexOf(k) >= 0 && o.tag) { tag = o.tag; return true; } }); if (!tag) p.opts.some(function (o, k) { if (o.ok && sel.indexOf(k) < 0 && o.missTag) { tag = o.missTag; return true; } }); }
      } else if (p.kind === 'eq') {
        var f = C.parseEq(v, p.xv, p.yv); ok = !!f && C.sameFn(f, p.key);
        if (!ok && f) (p.wrong || []).some(function (w) { if (C.sameFn(f, w.f)) { tag = w.tag; return true; } });
      } else if (p.kind === 'points' || p.kind === 'slider' || p.kind === 'arrows') {
        var c0 = v == null ? null : p.check ? p.check(v) : { ok: C.sameVal(v, p.key) };
        ok = !!(c0 && c0.ok);
        if (!ok && c0) tag = c0.tag || null;
        if (!ok && !tag && v != null) (p.wrong || []).some(function (w) { if (C.sameVal(v, w.v)) { tag = w.tag; return true; } });
      } else if (p.kind === 'sort') {
        var put = v || [];
        ok = p.cards.every(function (c, k) { return put[k] === c.bin; });
        if (!ok) p.cards.some(function (c, k) { if (put[k] != null && put[k] >= 0 && put[k] !== c.bin && c.tag) { tag = c.tag; return true; } });
      } else if (p.kind === 'text') {
        var t = C.norm(v), first = t.trim().split(' ')[0];
        ok = !!t.trim() && (p.need || []).every(function (g) { return C.hasAny(t, g); }) && !(p.not || []).some(function (w) { return C.hasAny(t, [w]); }) && !(p.notFirst || []).some(function (w) { return first === w; });
        if (!ok && p.tag) tag = p.tag;
      }
      res.parts.push(ok);
      if (!ok) { res.ok = false; if (!res.tag && tag) res.tag = tag; }
    });
    if (it.check) { var c = it.check(vals, res); if (c) { res.ok = !!c.ok; res.tag = c.ok ? null : (c.tag || res.tag); } }
    res.shown = C.shown(it, vals);
    return res;
  };
  // what the student answered, as short text (for the log and the "Your answer" panel)
  C.shown = function (it, vals) {
    return it.parts.map(function (p, i) {
      var v = vals[i];
      if (p.kind === 'choice') return p.opts[v] ? strip(p.opts[v].t) : '(none)';
      if (p.kind === 'multi') return (v || []).map(function (k) { return p.opts[k] ? strip(p.opts[k].t) : ''; }).join(' + ') || '(none)';
      if (p.kind === 'points') return (v || []).map(function (q, k) { return (p.names && p.names[k] ? p.names[k] + ' ' : '') + C.pt(q[0], q[1]); }).join(', ');
      if (p.kind === 'slider') return p.sliders.map(function (s) { return s.id + ' = ' + C.fmt(v ? v[s.id] : s.start); }).join(', ');
      if (p.kind === 'sort') return p.cards.map(function (c, k) { var b = v && v[k] != null && v[k] >= 0 ? strip(p.bins[v[k]]) : '?'; return strip(c.t).slice(0, 30) + ' → ' + b; }).join('; ');
      if (p.kind === 'arrows') return (v || []).map(function (a) { return C.fmt(p.left[a[0]]) + '→' + C.fmt(p.right[a[1]]); }).join(', ') || '(no arrows)';
      return String(v == null || v === '' ? '(blank)' : v).slice(0, 80);
    }).join(' | ').slice(0, 300);
  };
  function strip(h) { var s = String(h || ''); if (/<svg/.test(s)) { var m = s.match(/aria-label="([^"]*)"/); s = s.replace(/<svg[\s\S]*?<\/svg>/g, m ? '[' + m[1] + ']' : '[figure]'); } s = s.replace(/<\/t[dh]>\s*<t[dh]/g, ', <td').replace(/<\/tr>\s*<tr>/g, '; '); return s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim(); }
  C.strip = strip;
})();
