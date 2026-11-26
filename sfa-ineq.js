/* Sandy Flats: hands-on slide kinds for the inequality lessons (Inequalities 1 to 3, lessons/L29-L31.js).
   Loaded by lesson.html and lesson-practice.html right after sfa-lesson.js; it adds its kinds to the player through
   SFA_LESSON_API.kit and never edits sfa-lesson.js. Every kind checks the answer on the student's device, gives feedback
   that says what to fix, and saves through the player's record() as an 'open' answer (correct true/false), so the
   results script needs no change. The console counts right answers and has Show answer, like the other new kinds.

   Kinds (all take id, q, optional learn: ['short teaching line', ...], help, why, more):
     nl     Graph it on a number line: drag or tap the dot, open or closed, shade left or right.
            { range: [-6, 6], step: 1, v: 'x', ans: { at: 2, open: true, dir: 'r' } }
     pick   Tap every solution. On a number line: { where: 'line', range, cond: 'x + 2 > 5', cand: [values] (default every tick) }
            On the plane: { where: 'plane', range: [-5, 5], cond: 'y < 2x + 1', cand: [[x, y], ...], line: { m, b, solid } }
     sort   Sort the cards into groups (drag, or tap a card then a group). { bins: ['True', 'False'],
            cards: [{ t: '3 < 5', b: 0, why: 'hint shown if it lands in the wrong group', nl: {at, open, dir} (a picture) }] }
     match  Match each item on the left to one on the right. { pairs: [['left', 'right'], ...] }; either side may be
            { nl: { at, open, dir }, range } (a little number line) or { t: 'text' }.
     build  Write the inequality from tiles. { tiles: ['x', '<', '≥', '3'], ans: ['x≥3'] (sides may be swapped), fig: { nl: {...}, range } or { plane: {...} } }
     solve  Solve it one move at a time: pick the move, then the result; optional graph at the end.
            { start: '−3x + 4 > 19', moves: [{ q, opts, ans, res, rans, hint, why }], graph: { range, at, open, dir } }
     plane  Graph a two-variable inequality: plot two points on the boundary, choose solid or dashed, tap a side to shade,
            and test points. { range: [-6, 6], m: 2, b: 1, op: '<', parts: ['line', 'style', 'shade'] (leave out 'line'
            and the boundary is drawn for them), vx: 3 for a vertical line x = 3 (then m and b are not used) }
            Graph a line (an equation): { m: 2, b: −1, op: '=', parts: ['line'] }: plot two points, no shading or testing.
   tab: { head: ['x', 'y'], rows: [[0, 3], [2, 7]] } on any of them shows a small table under the question.
   more: the slide's 🔭 Go deeper tasks, any of the kinds above (plus 'poll' and 'number'), each with q and steps (a worked
   solution shown once it is done). They save as the slide id + x1, x2, x3 like the other lessons' extras. */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API; if (!A || !A.kit) return;
  var K = A.kit, H = K.H, fmt = K.fmt, plain = K.plain, SFA = window.SFA, el = SFA.el, MODE = A.MODE, TEACHER = A.TEACHER;
  var SVGNS = 'http://www.w3.org/2000/svg', EPS = 1e-9;
  function S_(tag, attrs, parent) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function mine() { return A.mine(); }
  function btn(text, cls, fn) { var b = el('button', { type: 'button', 'class': 'btn ' + (cls || '') }); b.innerHTML = text; if (fn) b.onclick = fn; return b; }
  function row(kids, cls) { var r = H('div', 'iqrow' + (cls ? ' ' + cls : '')); kids.forEach(function (k) { if (k) r.appendChild(k); }); return r; }
  function toast(t) { if (SFA.toast) SFA.toast(t); }
  // numbers as students write them: a real minus sign, and fractions as fractions
  function frac(v) {
    if (Math.abs(v - Math.round(v)) < 1e-7) return String(Math.round(v)).replace('-', '−');
    for (var d = 2; d <= 12; d++) { var n = v * d; if (Math.abs(n - Math.round(n)) < 1e-7) return (v < 0 ? '−' : '') + Math.abs(Math.round(n)) + '/' + d; }
    return String(Math.round(v * 100) / 100).replace('-', '−');
  }
  var PRETTY = { '<': '<', '>': '>', '<=': '≤', '>=': '≥', '=': '=' };
  function cmp(a, op, b) { return op === '<' ? a < b - EPS : op === '>' ? a > b + EPS : op === '<=' ? a <= b + EPS : op === '>=' ? a >= b - EPS : Math.abs(a - b) < EPS; }
  function normOp(o) { return String(o).replace('≤', '<=').replace('≥', '>='); }
  function strictOp(o) { o = normOp(o); return o === '<' || o === '>'; }
  /* 'y < 2x + 1', '−3x + 4 > 19': a condition in x and y, checked on the student's device. vars renames them
     (['k', 'p'] reads k as x and p as y). Several limits at once: 'k ≥ 2, 3k + 4p ≤ 48' (comma or "and"): all must hold. */
  function parseCond(str, vars) {
    vars = vars || ['x', 'y'];
    var all = String(str).split(/\s*(?:,|\band\b)\s*/).filter(Boolean);
    if (all.length > 1) {
      var ps = all.map(function (p) { return parseCond(p, vars); }); if (ps.some(function (p) { return !p; })) return null;
      return { multi: ps, src: String(str), vars: vars, test: function (x, y) { return ps.every(function (p) { return p.test(x, y); }); } };
    }
    var t = String(str).replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/[−–]/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, '');
    if (vars[0] !== 'x' || vars[1] !== 'y') t = t.replace(/[a-z]/g, function (ch) { return ch === vars[0] ? 'x' : ch === vars[1] ? 'y' : ch; });
    var m = /^(.*?)(<=|>=|<|>|=)(.*)$/.exec(t); if (!m) return null;
    function js(e) {
      e = e.replace(/(\d|\))(?=[xy(])/g, '$1*').replace(/([xy])(?=[\d(xy])/g, '$1*');
      if (!/^[0-9xy+\-*/().]*$/.test(e) || !e) return null;
      try { return new Function('x', 'y', 'return (' + e + ');'); } catch (er) { return null; }
    }
    var L = js(m[1]), R = js(m[3]); if (!L || !R) return null;
    return { op: m[2], L: L, R: R, src: String(str), vars: vars, test: function (x, y) { return cmp(L(x, y || 0), m[2], R(x, y || 0)); } };
  }
  // the working for one point: "3 + 2 > 5 → 5 > 5 ✗ false". With several limits: the first one that fails (or all, if none does)
  function subst(c, x, y) {
    if (c.multi) {
      var bad = c.multi.filter(function (p) { return !p.test(x, y); });
      return { ok: !bad.length, html: bad.length ? subst(bad[0], x, y).html : '<span class="iqsub"><b class="yes">✓ passes every limit</b></span>' };
    }
    var vx = c.vars ? c.vars[0] : 'x', vy = c.vars ? c.vars[1] : 'y', re = new RegExp('(\\d)?\\s*([' + vx + vy + '])(?![a-z])', 'g');
    var shown = String(c.src).replace(re, function (all, d, v) { var val = v === vx ? x : y, t = frac(val); return d ? d + '(' + t + ')' : val < 0 ? '(' + t + ')' : t; });
    var ok = c.test(x, y), parts = shown.split(/\s*(<=|>=|≤|≥|<|>|=)\s*/), lv = frac(c.L(x, y || 0)), rv = frac(c.R(x, y || 0));
    var same = parts.length === 3 && parts[0].replace(/[()]/g, '') === lv && parts[2].replace(/[()]/g, '') === rv;
    return { ok: ok, html: '<span class="iqsub">' + fmt(shown) + (same ? '' : ' → ' + lv + ' ' + (PRETTY[c.op] || c.op) + ' ' + rv) + ' <b class="' + (ok ? 'yes' : 'no') + '">' + (ok ? '✓ true' : '✗ false') + '</b></span>', parts: parts };
  }
  function svgPt(svg, e) { var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; var m = svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }

  /* ---------------- number lines ---------------- */
  var NLW = 640, NLH = 92, NLP = 30;
  function nlAxis(range, step, small) {
    var lo = range[0], hi = range[1], W = small ? 320 : NLW, Hh = small ? 58 : NLH, P = small ? 16 : NLP, cy = small ? 22 : 38;
    var svg = S_('svg', { viewBox: '0 0 ' + W + ' ' + Hh, 'class': 'iqnl' + (small ? ' sm' : ''), role: 'img' });
    var defs = S_('defs', {}, svg), id = 'ah' + Math.random().toString(36).slice(2, 8);
    var mk = S_('marker', { id: id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, defs);
    S_('path', { d: 'M0,0 L10,5 L0,10 z', 'class': 'iqah' }, mk);
    function X(v) { return P + 8 + (v - lo) / (hi - lo) * (W - 2 * P - 16); }
    S_('line', { 'class': 'iqaxis', x1: P - 8, x2: W - P + 8, y1: cy, y2: cy, 'marker-start': 'url(#' + id + ')', 'marker-end': 'url(#' + id + ')' }, svg);
    var every = (hi - lo) > 16 ? 2 : 1;
    for (var v = lo; v <= hi + EPS; v += step) {
      var whole = Math.abs(v - Math.round(v)) < EPS;
      S_('line', { 'class': 'iqtick' + (whole ? '' : ' half'), x1: X(v), x2: X(v), y1: cy - (whole ? 8 : 5), y2: cy + (whole ? 8 : 5) }, svg);
      if (whole && Math.round(v) % every === 0) { var t = S_('text', { x: X(v), y: cy + (small ? 22 : 30), 'text-anchor': 'middle', 'class': 'iqlbl' + (Math.round(v) === 0 ? ' zero' : '') }, svg); t.textContent = frac(v); }
    }
    var g = S_('g', {}, svg);
    return { svg: svg, X: X, cy: cy, g: g, lo: lo, hi: hi, W: W, P: P, id: id, small: small,
      vOf: function (x) { var v = lo + (x - P - 8) / (W - 2 * P - 16) * (hi - lo); v = Math.round(v / step) * step; return Math.max(lo, Math.min(hi, Math.round(v * 1000) / 1000)); } };
  }
  // the graph itself: a ray from the dot to the end of the line, then the dot on top
  function nlDraw(ax, st, cls) {
    var g = ax.g; while (g.firstChild) g.removeChild(g.firstChild);
    if (st.at == null) return;
    var x = ax.X(st.at), r = ax.small ? 6.5 : 10;
    if (st.dir === 'l' || st.dir === 'r') {
      var end = st.dir === 'r' ? ax.W - ax.P + 6 : ax.P - 6;
      var ray = S_('line', { 'class': 'iqray ' + (cls || ''), x1: x, x2: end, y1: ax.cy, y2: ax.cy, 'marker-end': 'url(#' + ax.id + 'r)' }, g);
      var mk = S_('marker', { id: ax.id + 'r', viewBox: '0 0 10 10', refX: 6, refY: 5, markerWidth: 3.2, markerHeight: 3.2, orient: 'auto' }, g);
      S_('path', { d: 'M0,0 L10,5 L0,10 z', 'class': 'iqrayh ' + (cls || '') }, mk);
      ray.style.setProperty('--len', Math.abs(end - x));
    }
    // between two dots (dir 'b'): a segment from at to to, and a second dot with its own open or closed
    if (st.dir === 'b' && st.to != null) {
      var x2 = ax.X(st.to), seg = S_('line', { 'class': 'iqray ' + (cls || ''), x1: Math.min(x, x2), x2: Math.max(x, x2), y1: ax.cy, y2: ax.cy }, g);
      seg.style.setProperty('--len', Math.abs(x2 - x));
      S_('circle', { 'class': 'iqdot ' + (st.toOpen ? 'open ' : st.toOpen === false ? 'closed ' : 'unset ') + (st.sel === 1 && !cls ? 'sel ' : '') + (cls || ''), cx: x2, cy: ax.cy, r: r }, g);
    }
    S_('circle', { 'class': 'iqdot ' + (st.open ? 'open ' : st.open === false ? 'closed ' : 'unset ') + (st.dir === 'b' && st.sel === 0 && !cls ? 'sel ' : '') + (cls || ''), cx: x, cy: ax.cy, r: r }, g);
  }
  function nlRead(v, st) {
    if (st.at == null) return ''; v = v || 'x';
    if (st.dir === 'b' && st.to != null) {
      var lo = st.at <= st.to ? [st.at, st.open] : [st.to, st.toOpen], hi = st.at <= st.to ? [st.to, st.toOpen] : [st.at, st.open];
      return frac(lo[0]) + ' ' + (lo[1] ? '<' : '≤') + ' ' + v + ' ' + (hi[1] ? '<' : '≤') + ' ' + frac(hi[0]);
    }
    var op = st.dir === 'r' ? (st.open ? '>' : '≥') : st.dir === 'l' ? (st.open ? '<' : '≤') : '?'; return v + ' ' + op + ' ' + frac(st.at);
  }
  function nlPic(spec, range) { var ax = nlAxis(range || spec.range || [-6, 6], 1, true); nlDraw(ax, spec); var b = H('div', 'iqpic'); b.appendChild(ax.svg); return b; }

  /* ---------------- the coordinate plane ---------------- */
  var PW = 400, PP = 22;
  function planeAxis(range, vars) {
    vars = vars || ['x', 'y'];
    var lo = range[0], hi = range[1], u = (PW - 2 * PP) / (hi - lo);
    var svg = S_('svg', { viewBox: '0 0 ' + PW + ' ' + PW, 'class': 'iqplane', role: 'img' });
    function X(v) { return PP + (v - lo) * u; } function Y(v) { return PW - PP - (v - lo) * u; }
    var clip = 'cp' + Math.random().toString(36).slice(2, 8);
    S_('rect', { x: PP, y: PP, width: PW - 2 * PP, height: PW - 2 * PP, 'class': 'iqbg' }, svg);
    var cd = S_('clipPath', { id: clip }, S_('defs', {}, svg)); S_('rect', { x: PP, y: PP, width: PW - 2 * PP, height: PW - 2 * PP }, cd);
    var shade = S_('g', { 'clip-path': 'url(#' + clip + ')' }, svg);
    for (var v = lo; v <= hi; v++) {
      S_('line', { 'class': 'iqgl', x1: X(v), x2: X(v), y1: PP, y2: PW - PP }, svg);
      S_('line', { 'class': 'iqgl', x1: PP, x2: PW - PP, y1: Y(v), y2: Y(v) }, svg);
    }
    S_('line', { 'class': 'iqpax', x1: X(0), x2: X(0), y1: PP - 6, y2: PW - PP + 6 }, svg);
    S_('line', { 'class': 'iqpax', x1: PP - 6, x2: PW - PP + 6, y1: Y(0), y2: Y(0) }, svg);
    var stepL = hi - lo > 12 ? 2 : 1;
    for (v = lo; v <= hi; v++) {
      if (!v || v % stepL) continue;
      var tx = S_('text', { x: X(v), y: Y(0) + 13, 'text-anchor': 'middle', 'class': 'iqplbl' }, svg); tx.textContent = frac(v);
      var ty = S_('text', { x: X(0) - 5, y: Y(v) + 4, 'text-anchor': 'end', 'class': 'iqplbl' }, svg); ty.textContent = frac(v);
    }
    var xl = S_('text', { x: PW - PP + 2, y: Y(0) - 6, 'text-anchor': 'end', 'class': 'iqplbl ax' }, svg); xl.textContent = vars[0];
    var yl = S_('text', { x: X(0) + 6, y: PP + 10, 'class': 'iqplbl ax' }, svg); yl.textContent = vars[1];
    var lineG = S_('g', { 'clip-path': 'url(#' + clip + ')' }, svg), top = S_('g', {}, svg);
    return { svg: svg, X: X, Y: Y, lo: lo, hi: hi, u: u, shade: shade, lineG: lineG, top: top,
      at: function (e, snap) { var p = svgPt(svg, e), x = lo + (p.x - PP) / u, y = lo + (PW - PP - p.y) / u; if (snap) { x = Math.round(x); y = Math.round(y); } return { x: Math.max(lo, Math.min(hi, x)), y: Math.max(lo, Math.min(hi, y)) }; } };
  }
  function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
  // a boundary: { m, b } or { vx }; draw it across the grid
  function bLine(ax, ln, cls) {
    var lo = ax.lo - 1, hi = ax.hi + 1, p;
    if (ln.vx != null) p = [[ln.vx, lo], [ln.vx, hi]];
    else p = [[lo, ln.m * lo + ln.b], [hi, ln.m * hi + ln.b]];
    return S_('line', { 'class': 'iqbline ' + (cls || ''), x1: ax.X(p[0][0]), y1: ax.Y(p[0][1]), x2: ax.X(p[1][0]), y2: ax.Y(p[1][1]) }, ax.lineG);
  }
  // the half of the grid on one side: side 'above'/'below' for y = mx + b, 'left'/'right' for x = vx
  function bShade(ax, ln, side, cls) {
    var lo = ax.lo - 1, hi = ax.hi + 1, pts;
    if (ln.vx != null) pts = side === 'right' ? [[ln.vx, lo], [hi, lo], [hi, hi], [ln.vx, hi]] : [[lo, lo], [ln.vx, lo], [ln.vx, hi], [lo, hi]];
    else { var far = side === 'above' ? hi + 40 : lo - 40; pts = [[lo, ln.m * lo + ln.b], [hi, ln.m * hi + ln.b], [hi, far], [lo, far]]; }
    return S_('polygon', { 'class': 'iqshd ' + (cls || ''), points: pts.map(function (q) { return ax.X(q[0]).toFixed(1) + ',' + ax.Y(Math.max(ax.lo - 60, Math.min(ax.hi + 60, q[1]))).toFixed(1); }).join(' ') }, ax.shade);
  }
  function sideOf(ln, x, y) { if (ln.vx != null) return Math.abs(x - ln.vx) < 0.15 ? null : x > ln.vx ? 'right' : 'left'; var d = y - (ln.m * x + ln.b); return Math.abs(d) < 0.15 * Math.max(1, Math.abs(ln.m)) ? null : d > 0 ? 'above' : 'below'; }
  function lineOf(p, q) { if (!p || !q || (p.x === q.x && p.y === q.y)) return null; if (Math.abs(p.x - q.x) < EPS) return { vx: p.x }; var m = (q.y - p.y) / (q.x - p.x); return { m: m, b: p.y - m * p.x }; }
  function lineTxt(ln, vars) {
    vars = typeof vars === 'string' ? ['x', vars] : vars || ['x', 'y'];
    if (ln.vx != null) return vars[0] + ' = ' + frac(ln.vx);
    var m = ln.m, b = ln.b, t = '';
    if (Math.abs(m) > EPS) t = (Math.abs(m - 1) < EPS ? '' : Math.abs(m + 1) < EPS ? '−' : frac(m)) + vars[0];
    if (Math.abs(b) > EPS || !t) t += t ? (b > 0 ? ' + ' : ' − ') + frac(Math.abs(b)) : frac(b);
    return vars[1] + ' = ' + t;
  }
  function ineqTxt(ln, op, vars) { return lineTxt(ln, vars).replace(' = ', ' ' + (PRETTY[normOp(op)] || op) + ' '); }
  function rightSide(spec) { var op = normOp(spec.op); return spec.vx != null ? (op[0] === '>' ? 'right' : 'left') : (op[0] === '>' ? 'above' : 'below'); }
  function targetLine(spec) { return spec.vx != null ? { vx: spec.vx } : { m: spec.m, b: spec.b }; }
  function onTarget(spec, p) { return spec.vx != null ? Math.abs(p.x - spec.vx) < EPS : Math.abs(p.y - (spec.m * p.x + spec.b)) < 1e-7; }
  function twoPts(spec) {
    var r = spec.range || [-6, 6], out = [];
    if (spec.vx != null) return [{ x: spec.vx, y: 0 }, { x: spec.vx, y: 2 }];
    var xs = []; for (var x = r[0]; x <= r[1]; x++) xs.push(x);
    xs.sort(function (a, b) { return Math.abs(a) - Math.abs(b); });
    xs.forEach(function (x) { var y = spec.m * x + spec.b; if (out.length < 2 && Math.abs(y - Math.round(y)) < 1e-7 && y >= r[0] && y <= r[1]) out.push({ x: x, y: Math.round(y) }); });
    return out;
  }

  /* ---------------- the widgets ----------------
     Each one: W[kind](spec, o) → { root, check() → { ok, msg, ans } or null if not ready, showAnswer(), freeze() }.
     o.show: the console or class screen (nothing to touch). o.done(ans, ok): for a widget that checks itself (solve). */
  var W = {};

  // 📏 graph on a number line
  W.nl = function (spec, o) {
    var range = spec.range || [-6, 6], step = spec.step || 1, ans = spec.ans || {}, v = spec.v || 'x';
    var st = { at: spec.start != null ? spec.start : null, open: null, dir: null }, frozen = !!o.show;
    var root = H('div', 'iqw iqnlw'), ax = nlAxis(range, step), drag = false;
    root.appendChild(ax.svg);
    var bOpen = btn('<span class="iqsym open"></span> Open dot', 'small iqtog'), bClosed = btn('<span class="iqsym closed"></span> Closed dot', 'small iqtog');
    var bL = btn('◀ Shade left', 'small iqtog'), bR = btn('Shade right ▶', 'small iqtog'), bB = btn('◀▶ Between two dots', 'small iqtog');
    var between = !!spec.between || ans.dir === 'b';
    var hint = H('p', 'iqhint', 'Tap or drag on the line to put the dot.');
    st.sel = 0;
    function draw() {
      nlDraw(ax, st, frozen && o.right ? 'good' : '');
      var curOpen = st.dir === 'b' && st.sel === 1 ? st.toOpen : st.open;
      bOpen.classList.toggle('on', curOpen === true); bClosed.classList.toggle('on', curOpen === false);
      bL.classList.toggle('on', st.dir === 'l'); bR.classList.toggle('on', st.dir === 'r'); bB.classList.toggle('on', st.dir === 'b');
      hint.textContent = st.at == null ? 'Tap or drag on the line to put the dot.' :
        st.dir === 'b' ? 'Two dots: drag either one. Tap a dot to pick it (it glows), then choose open or closed for that dot.' :
        st.open == null ? 'Dot at ' + frac(st.at) + '. Now: open or closed?' : st.dir == null ? 'Now: which way do the solutions go?' : 'Drag the dot to move it. Change anything, then Check.';
    }
    function setOpen(v) { if (frozen) return; if (st.dir === 'b' && st.sel === 1) st.toOpen = v; else st.open = v; draw(); }
    bOpen.onclick = function () { setOpen(true); };
    bClosed.onclick = function () { setOpen(false); };
    bL.onclick = function () { if (frozen) return; st.dir = 'l'; st.sel = 0; draw(); };
    bR.onclick = function () { if (frozen) return; st.dir = 'r'; st.sel = 0; draw(); };
    bB.onclick = function () {
      if (frozen) return; st.dir = 'b';
      if (st.at == null) st.at = range[0];
      if (st.to == null) { var t = st.at + 3 * step; if (t > range[1]) t = st.at - 3 * step; st.to = Math.max(range[0], Math.min(range[1], t)); st.toOpen = null; }
      st.sel = 1; draw();
    };
    if (!o.show) {
      root.appendChild(row([bOpen, bClosed, bL, bR, between ? bB : null], 'iqwrap')); root.appendChild(hint);
      ax.svg.addEventListener('pointerdown', function (e) {
        if (frozen) return; drag = true; try { ax.svg.setPointerCapture(e.pointerId); } catch (er) { }
        var v0 = ax.vOf(svgPt(ax.svg, e).x);
        if (st.dir === 'b' && st.to != null) st.sel = Math.abs(v0 - st.to) < Math.abs(v0 - st.at) ? 1 : 0;
        if (st.dir === 'b' && st.sel === 1) st.to = v0; else st.at = v0;
        draw(); e.preventDefault();
      });
      ax.svg.addEventListener('pointermove', function (e) {
        if (!drag || frozen) return; var nv = ax.vOf(svgPt(ax.svg, e).x);
        if (st.dir === 'b' && st.sel === 1) { if (nv !== st.to) { st.to = nv; draw(); } } else if (nv !== st.at) { st.at = nv; draw(); }
      });
      ['pointerup', 'pointercancel'].forEach(function (ev) { ax.svg.addEventListener(ev, function () { drag = false; }); });
      ax.svg.classList.add('live');
    }
    draw();
    // the answer's two ends in order, low then high, each [value, open]
    function ends(a, b, ao, bo) { return a <= b ? [[a, ao], [b, bo]] : [[b, bo], [a, ao]]; }
    return { root: root,
      check: function () {
        if (st.at == null) { toast('Put the dot on the line first.'); return null; }
        if (st.dir == null) { toast(between ? 'Choose: shade left, shade right, or between two dots.' : 'Choose which way to shade: left or right.'); return null; }
        if (st.open == null || (st.dir === 'b' && st.toOpen == null)) { toast(st.dir === 'b' ? 'Choose open or closed for both dots: tap a dot, then pick.' : 'Choose: open dot or closed dot.'); return null; }
        var msgs = [], ok;
        if (ans.dir === 'b') {
          if (st.dir !== 'b') { ok = false; msgs.push('This one has *two* limits, one on each side. Use *Between two dots*.'); }
          else {
            var A = ends(ans.at, ans.to, !!ans.open, !!ans.toOpen), M = ends(st.at, st.to, st.open, st.toOpen);
            var okE = Math.abs(A[0][0] - M[0][0]) < EPS && Math.abs(A[1][0] - M[1][0]) < EPS, okO = okE && A[0][1] === M[0][1] && A[1][1] === M[1][1];
            if (!okE) msgs.push('Check where each dot goes: one at the smallest number allowed, one at the biggest.');
            else if (!okO) msgs.push('Look at each end on its own: is that number allowed (closed ●) or not (open ○)?');
            ok = okE && okO;
          }
        } else {
          if (st.dir === 'b') { ok = false; msgs.push('This one has only *one* limit: the solutions keep going one way. Shade left or right.'); }
          else {
            var okAt = Math.abs(st.at - ans.at) < EPS, okO1 = st.open === !!ans.open, okD = st.dir === ans.dir;
            if (!okAt) msgs.push('The dot goes on the *boundary*: the number the inequality compares ' + v + ' to.');
            if (!okO1) msgs.push(ans.open ? '< and > do *not* include the boundary number, so the dot is *open*.' : '≤ and ≥ *include* the boundary number, so the dot is *closed* (filled in).');
            if (!okD) msgs.push('Test a number on one side. If it makes the inequality true, shade *that* side.');
            ok = okAt && okO1 && okD;
          }
        }
        return { ok: ok, ans: nlRead(v, st), msg: 'Your graph shows *' + nlRead(v, st) + '*. ' + msgs.join(' ') };
      },
      showAnswer: function () { st.at = ans.at; st.open = !!ans.open; st.dir = ans.dir; if (ans.dir === 'b') { st.to = ans.to; st.toOpen = !!ans.toOpen; } st.sel = -1; draw(); },
      freeze: function (good) { frozen = true; o.right = good; st.sel = -1; root.classList.add('frozen'); [bOpen, bClosed, bL, bR, bB].forEach(function (b) { b.disabled = true; }); hint.remove(); draw(); }
    };
  };

  /* the feasible region: the grid square cut down by every limit in c (each one linear), drawn as one shaded shape */
  function drawRegion(ax, g, c) {
    var lo = ax.lo, hi = ax.hi, poly = [[lo, lo], [hi, lo], [hi, hi], [lo, hi]];
    (c.multi || [c]).forEach(function (p) {
      var f = function (x, y) { return p.L(x, y) - p.R(x, y); }, f0 = f(0, 0), a = f(1, 0) - f0, b = f(0, 1) - f0, sg = p.op[0] === '>' ? -1 : 1;
      var keep = function (q) { return sg * (a * q[0] + b * q[1] + f0) <= 1e-9; }, out = [];
      for (var i = 0; i < poly.length; i++) {
        var P = poly[i], Q = poly[(i + 1) % poly.length], kp = keep(P), kq = keep(Q);
        if (kp) out.push(P);
        if (kp !== kq) { var fp = a * P[0] + b * P[1] + f0, fq = a * Q[0] + b * Q[1] + f0, t = fp / (fp - fq); out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]); }
      }
      poly = out;
    });
    clear(g); if (poly.length < 3) return;
    S_('polygon', { 'class': 'iqregion', points: poly.map(function (q) { return ax.X(q[0]).toFixed(1) + ',' + ax.Y(q[1]).toFixed(1); }).join(' ') }, g);
  }

  // 👆 tap every solution, on a number line or on the plane
  W.pick = function (spec, o) {
    var plane = spec.where === 'plane', vars = spec.vars || [spec.v || 'x', 'y'], c = spec.cond ? parseCond(spec.cond, vars) : null, right = spec.right;
    var root = H('div', 'iqw iqpick' + (plane ? ' plane' : '')), sel = {}, marks = {}, frozen = !!o.show, regG = null;
    if (!c && !right) { root.appendChild(H('p', 'state bad', 'This question\'s condition could not be read.')); return { root: root, check: function () { return null; }, showAnswer: function () { }, freeze: function () { } }; }
    var cand, key = function (p) { return plane ? p[0] + ',' + p[1] : String(p); }, ax, dots = {};
    var hint = H('p', 'iqhint', plane ? 'Tap the points that are solutions. Tap again to undo.' : 'Tap every number that makes it true. Tap again to undo.');
    var work = H('div', 'iqwork');
    if (plane) {
      ax = planeAxis(spec.range || [-5, 5], vars); cand = spec.cand || [];
      regG = S_('g', {}, ax.shade);
      if (spec.region === 'start') drawRegion(ax, regG, c);
      [].concat(spec.line || [], spec.lines || []).forEach(function (ln) {
        bLine(ax, ln, ln.solid === false ? 'dash' : ln.solid ? '' : 'given'); if (ln.shade) bShade(ax, ln, ln.shade, 'given');
        if (ln.lab) { var tl = S_('text', { x: ax.X(ln.lab[0]), y: ax.Y(ln.lab[1]), 'class': 'iqllbl' }, ax.top); tl.textContent = ln.lab[2]; }
      });
      cand.forEach(function (p, i) {
        var g = S_('g', { 'class': 'iqcand', tabindex: o.show ? -1 : 0 }, ax.top);
        S_('circle', { cx: ax.X(p[0]), cy: ax.Y(p[1]), r: 16, 'class': 'hit' }, g);
        S_('circle', { cx: ax.X(p[0]), cy: ax.Y(p[1]), r: 8, 'class': 'pt' }, g);
        var t = S_('text', { x: ax.X(p[0]) + 11, y: ax.Y(p[1]) - 9, 'class': 'iqclbl' }, g); t.textContent = 'ABCDEFGHIJ'.charAt(i);
        dots[key(p)] = g;
      });
    } else {
      var range = spec.range || [-5, 5]; ax = nlAxis(range, 1);
      cand = spec.cand || (function () { var a = []; for (var v = range[0]; v <= range[1]; v++) a.push(v); return a; })();
      cand.forEach(function (v) {
        var g = S_('g', { 'class': 'iqcand', tabindex: o.show ? -1 : 0 }, ax.svg);
        S_('rect', { x: ax.X(v) - 15, y: ax.cy - 22, width: 30, height: 44, 'class': 'hit' }, g);
        S_('circle', { cx: ax.X(v), cy: ax.cy, r: 9, 'class': 'pt' }, g);
        dots[key(v)] = g;
      });
    }
    root.appendChild(ax.svg);
    function lab(p, i) { return plane ? 'ABCDEFGHIJ'.charAt(i) + ' (' + frac(p[0]) + ', ' + frac(p[1]) + ')' : frac(p); }
    function draw() { cand.forEach(function (p) { var g = dots[key(p)]; g.setAttribute('class', 'iqcand' + (sel[key(p)] ? ' on' : '') + (marks[key(p)] ? ' ' + marks[key(p)] : '')); }); }
    if (!o.show) {
      cand.forEach(function (p) {
        var g = dots[key(p)], tog = function () { if (frozen) return; sel[key(p)] = !sel[key(p)]; marks = {}; work.innerHTML = ''; draw(); };
        g.addEventListener('click', tog); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
      });
      root.appendChild(hint);
    }
    root.appendChild(work);
    function truth(p) { if (right) return right.indexOf(cand.indexOf(p)) >= 0; return plane ? c.test(p[0], p[1]) : c.test(p, 0); }
    function why(p, i) { if (spec.notes && spec.notes[i]) return H('p', '', '<b>' + esc_(lab(p, i)) + ':</b> ' + fmt(spec.notes[i])); if (!c) return null; var sb = subst(c, plane ? p[0] : p, plane ? p[1] : 0); return H('p', '', '<b>' + esc_(lab(p, i)) + ':</b> ' + sb.html); }
    return { root: root,
      check: function () {
        var picked = cand.filter(function (p) { return sel[key(p)]; });
        if (!picked.length) { toast('Tap at least one ' + (plane ? 'point' : 'number') + ' first.'); return null; }
        var good = cand.filter(truth), hit = picked.filter(truth).length, extra = picked.length - hit, miss = good.length - hit;
        marks = {}; work.innerHTML = ''; var shown = 0;
        cand.forEach(function (p, i) {
          var k = key(p), t = truth(p);
          if (sel[k] && !t) marks[k] = 'no'; else if (!sel[k] && t) marks[k] = 'miss'; else if (sel[k]) marks[k] = 'ok';
          if (marks[k] === 'no' && shown < 3) { var wy = why(p, i); if (wy) { shown++; work.appendChild(wy); } }
        });
        draw();
        var ok = !extra && !miss, ansT = plane ? picked.map(function (p) { return 'ABCDEFGHIJ'.charAt(cand.indexOf(p)); }).join(', ') : picked.map(frac).join(', ');
        var msg = ok ? '' : 'You found *' + hit + ' of ' + good.length + '*.' + (extra ? ' ' + extra + ' you picked ' + (extra === 1 ? 'is' : 'are') + ' not ' + (right ? 'right' : 'a solution') + ' (red)' + (c || spec.notes ? ': the working shows why.' : '.') : '') + (miss ? ' ' + (miss === 1 ? (right ? 'One is' : 'One solution is') : miss + (right ? ' are' : ' solutions are')) + ' still missing (dashed ring).' : '');
        return { ok: ok, ans: 'picked ' + ansT, msg: msg };
      },
      showAnswer: function () { sel = {}; marks = {}; cand.forEach(function (p) { if (truth(p)) { sel[key(p)] = true; marks[key(p)] = 'ok'; } }); draw(); },
      freeze: function () {
        frozen = true; root.classList.add('frozen'); hint.remove(); work.innerHTML = '';
        // the working for every candidate, so the right answer explains itself
        var list = H('div', 'iqworkall');
        if (plane && spec.region && spec.region !== 'start' && c) drawRegion(ax, regG, c);
        cand.forEach(function (p, i) { var wy = why(p, i); if (wy) list.appendChild(wy); });
        if (cand.length <= 8) work.appendChild(list);
      }
    };
  };
  function esc_(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }

  // 🗂️ sort cards into groups; 🔗 match (each group is one row that takes one card)
  function cardFace(c, range) {
    var f = H('span', 'iqface');
    if (c && typeof c === 'object' && c.nl) { if (c.t) f.appendChild(H('span', 'iqct', fmt(c.t))); f.appendChild(nlPic(c.nl, c.range || range)); }
    else if (c && typeof c === 'object' && c.plane) { if (c.t) f.appendChild(H('span', 'iqct', fmt(c.t))); f.appendChild(planePic(c.plane)); }
    else f.innerHTML = fmt(typeof c === 'object' ? c.t : c);
    return f;
  }
  function sorter(spec, o, isMatch) {
    var cards = isMatch ? spec.pairs.map(function (p, i) { return { face: p[1], b: i, why: p[2] }; }) : (spec.cards || []).map(function (c) { return { face: c, b: c.b, why: c.why }; });
    var bins = isMatch ? spec.pairs.map(function (p) { return p[0]; }) : spec.bins || ['True', 'False'];
    var n = cards.length, sh = K.seeded(o.id || 'sort', n), where = {}, state = {}, picked = -1, frozen = !!o.show;
    var root = H('div', 'iqw ' + (isMatch ? 'iqmatch' : 'iqsort')), pool = H('div', 'iqpool'), binEls = [], cardEls = [];
    pool.setAttribute('data-bin', '-1');
    var poolWrap = H('div', 'iqpoolw'); poolWrap.appendChild(H('p', 'iqhint', isMatch ? 'Drag each card to its match, or tap a card and then the row it goes with.' : 'Drag each card into a group, or tap a card and then a group.')); poolWrap.appendChild(pool);
    var binsBox = H('div', isMatch ? 'iqrows' : 'iqbins' + (bins.length > 2 ? ' many' : ''));
    bins.forEach(function (b, i) {
      var be = H('div', 'iqbin'); be.setAttribute('data-bin', String(i));
      var hd = H('div', 'iqbinh'); hd.appendChild(cardFace(b, spec.range)); be.appendChild(hd);
      var zone = H('div', 'iqzone'); zone.setAttribute('data-bin', String(i)); be.appendChild(zone);
      be.onclick = function (e) { if (frozen || picked < 0 || e.target.closest('.iqcard')) return; move(picked, i); };
      binEls.push(zone); binsBox.appendChild(be);
    });
    pool.onclick = function (e) { if (frozen || picked < 0 || e.target.closest('.iqcard')) return; move(picked, -1); };
    for (var i = 0; i < n; i++) where[i] = -1;
    function move(ci, bi) {
      if (isMatch && bi >= 0) { for (var j = 0; j < n; j++) if (j !== ci && where[j] === bi) { where[j] = -1; delete state[j]; } }
      where[ci] = bi; delete state[ci]; picked = -1; draw();
    }
    cards.forEach(function (c, ci) {
      var ce = el('button', { type: 'button', 'class': 'iqcard', 'data-i': String(ci), draggable: 'false' }); ce.appendChild(cardFace(c.face, spec.range));
      cardEls.push(ce);
      if (o.show) return;
      /* Drag a card, or tap it and then tap a group.
         Mouse and pen: the drag starts after a few pixels of movement.
         Touch (cards are touch-action: pan-y): a sideways move picks the card up at once; holding still for a moment
         picks it up too; a quick up-or-down swipe scrolls the page. While dragging, the page scrolls when the card nears
         the top or bottom edge, so groups below the fold can be reached. If the browser takes the touch away mid-drag
         (pointercancel), the card stays chosen (gold) and a tap on a group puts it there, so nothing is lost. */
      var g = { down: false, moved: false, touch: false, id: 0, sx: 0, sy: 0, lx: 0, ly: 0, ghost: null, timer: 0, over: null, raf: 0, gx: 0, gy: 0 };
      function zoneAt(x, y) { var t = document.elementFromPoint(x, y), z = t && t.closest && t.closest('[data-bin]'); return z && root.contains(z) ? z : null; }
      function mark(z) { var b = z ? (z.closest('.iqbin') || z) : null; if (g.over && g.over !== b) g.over.classList.remove('over'); if (b) b.classList.add('over'); g.over = b; }
      function place(x, y) { if (!g.ghost) return; g.ghost.style.transform = 'translate(' + (x - g.gx) + 'px,' + (y - g.gy) + 'px) rotate(-3deg)'; mark(zoneAt(x, y)); }
      function edge() {   // scroll the page while the card is held near the top or bottom edge
        g.raf = 0; if (!g.ghost) return;
        var h = window.innerHeight, m = Math.min(70, h * 0.12), v = 0;
        if (g.ly < m) v = -Math.ceil((m - g.ly) / 4); else if (g.ly > h - m) v = Math.ceil((g.ly - (h - m)) / 4);
        if (v) { window.scrollBy(0, v); mark(zoneAt(g.lx, g.ly)); }
        g.raf = requestAnimationFrame(edge);
      }
      function lift() {
        clearTimeout(g.timer); g.moved = true; picked = -1; draw();
        var r = ce.getBoundingClientRect();
        g.ghost = ce.cloneNode(true); g.ghost.className = 'iqcard iqghost'; g.ghost.removeAttribute('data-i');
        g.ghost.style.width = r.width + 'px'; g.ghost.style.left = r.left + 'px'; g.ghost.style.top = r.top + 'px';
        g.gx = g.sx; g.gy = g.sy;   // the card stays under the finger where it was grabbed
        document.body.appendChild(g.ghost); ce.classList.add('lifted'); root.classList.add('dragging');
        place(g.lx, g.ly); if (!g.raf) g.raf = requestAnimationFrame(edge);
        if (g.touch) { try { if (navigator.vibrate) navigator.vibrate(12); } catch (er) { } }
      }
      function clear() {
        if (g.raf) cancelAnimationFrame(g.raf); g.raf = 0;
        if (g.ghost) g.ghost.remove(); g.ghost = null; ce.classList.remove('lifted'); root.classList.remove('dragging'); mark(null);
      }
      function end(drop, e) {
        clearTimeout(g.timer); if (!g.down) return; g.down = false;
        if (e) { g.lx = e.clientX; g.ly = e.clientY; }
        if (!g.moved) return;
        var z = drop ? zoneAt(g.lx, g.ly) : null; clear();
        if (z) move(ci, +z.getAttribute('data-bin'));
        else if (!drop) { picked = ci; draw(); }   // the browser took the touch: keep the card chosen, tap a group to place it
        setTimeout(function () { g.moved = false; }, 0);   // let the click that ends a drag see it, then forget
      }
      ce.addEventListener('dragstart', function (e) { e.preventDefault(); });
      ce.addEventListener('contextmenu', function (e) { if (g.down || g.moved) e.preventDefault(); });
      ce.addEventListener('pointerdown', function (e) {
        if (frozen || state[ci] === 'ok' || e.button > 0 || g.down) return;
        clear(); g.down = true; g.moved = false; g.id = e.pointerId; g.touch = e.pointerType === 'touch';
        g.sx = g.lx = e.clientX; g.sy = g.ly = e.clientY;
        try { ce.setPointerCapture(e.pointerId); } catch (er) { }
        if (!g.touch) { e.preventDefault(); return; }   // no focus jump, no text selection
        clearTimeout(g.timer);
        g.timer = setTimeout(function () { if (g.down && !g.moved) lift(); }, 200);
      });
      ce.addEventListener('pointermove', function (e) {
        if (!g.down || e.pointerId !== g.id) return;
        g.lx = e.clientX; g.ly = e.clientY;
        var dx = Math.abs(g.lx - g.sx), dy = Math.abs(g.ly - g.sy);
        if (!g.moved) {
          if (g.touch) {
            if (dx > 6 && dx >= dy) lift();   // sideways: drag now
            else if (dy > 8) { clearTimeout(g.timer); g.down = false; return; }   // up or down: the page scrolls
            else return;
          } else if (dx + dy > 5) lift(); else return;
        }
        place(g.lx, g.ly);
      });
      ce.addEventListener('touchmove', function (e) { if (g.moved && e.cancelable) e.preventDefault(); }, { passive: false });
      ce.addEventListener('pointerup', function (e) { if (e.pointerId === g.id) end(true, e); });
      ce.addEventListener('pointercancel', function (e) { if (e.pointerId === g.id) end(false); });
      ce.addEventListener('lostpointercapture', function (e) { if (g.down && e.pointerId === g.id) end(true); });
      ce.addEventListener('click', function (e) {
        e.stopPropagation();
        if (g.moved) { g.moved = false; return; }   // the click that ends a drag
        if (frozen || state[ci] === 'ok') return;
        // a card is already chosen and this one sits in another group: tapping it drops the chosen card into that group
        if (picked >= 0 && picked !== ci && where[picked] !== where[ci]) { move(picked, where[ci]); return; }
        picked = picked === ci ? -1 : ci; draw();
      });
    });
    function draw() {
      sh.forEach(function (ci) { var ce = cardEls[ci], tgt = where[ci] < 0 ? pool : binEls[where[ci]]; if (ce.parentNode !== tgt) tgt.appendChild(ce); });
      cardEls.forEach(function (ce, ci) { ce.className = 'iqcard' + (picked === ci ? ' sel' : '') + (state[ci] ? ' ' + state[ci] : ''); });
      root.classList.toggle('picking', picked >= 0);
      pool.classList.toggle('empty', !cards.some(function (c, ci) { return where[ci] < 0; }));
    }
    root.appendChild(poolWrap); root.appendChild(binsBox);
    draw();
    return { root: root,
      check: function () {
        var left = cards.filter(function (c, ci) { return where[ci] < 0; }).length;
        if (left) { toast((isMatch ? 'Match' : 'Sort') + ' every card first: ' + left + ' to go.'); return null; }
        var good = 0, firstWrong = null;
        cards.forEach(function (c, ci) { if (where[ci] === c.b) { state[ci] = 'ok'; good++; } else { state[ci] = 'no'; if (!firstWrong) firstWrong = c; } });
        picked = -1; draw();
        var ok = good === n, msg = ok ? '' : '*' + good + ' of ' + n + '* are right (green). The red ones are in the wrong ' + (isMatch ? 'row' : 'group') + ': move them and check again.' + (firstWrong && firstWrong.why ? ' Hint: ' + firstWrong.why : '');
        return { ok: ok, ans: ok ? 'all ' + n + ' right' : good + ' of ' + n + ' right', msg: msg };
      },
      showAnswer: function () { cards.forEach(function (c, ci) { where[ci] = c.b; state[ci] = 'ok'; }); picked = -1; draw(); },
      freeze: function () { frozen = true; root.classList.add('frozen'); var h = poolWrap.querySelector('.iqhint'); if (h) h.remove(); cardEls.forEach(function (c) { c.disabled = true; }); }
    };
  }
  W.sort = function (spec, o) { return sorter(spec, o, false); };
  W.match = function (spec, o) { return sorter(spec, o, true); };

  // 🧱 write the inequality from tiles
  function normIq(s) { return String(s).replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/[−–]/g, '-').replace(/\s+/g, '').toLowerCase(); }
  function flipIq(s) { var m = /^(.*?)(<=|>=|<|>)(.*)$/.exec(s); if (!m) return s; return m[3] + ({ '<': '>', '>': '<', '<=': '>=', '>=': '<=' })[m[2]] + m[1]; }
  W.build = function (spec, o) {
    var tiles = spec.tiles || [], use = [], frozen = !!o.show, root = H('div', 'iqw iqbuild');
    var accept = [].concat(spec.ans || []).map(normIq); accept = accept.concat(accept.map(flipIq));
    if (spec.fig) { var f = H('div', 'iqbfig'); if (spec.fig.nl) f.appendChild(nlPic(spec.fig.nl, spec.fig.range)); else if (spec.fig.plane) f.appendChild(planePic(spec.fig.plane)); else if (spec.fig.t) f.appendChild(H('p', 'iqct', fmt(spec.fig.t))); root.appendChild(f); }
    var strip = H('div', 'iqstrip'), bank = H('div', 'iqbank');
    root.appendChild(strip);
    function draw() {
      strip.innerHTML = '';
      if (!use.length) strip.appendChild(H('span', 'iqph', o.show ? '…' : 'Tap tiles to build it here'));
      use.forEach(function (ti, k) { var b = el('button', { type: 'button', 'class': 'iqtile in' }); b.innerHTML = fmt(tiles[ti]); b.onclick = function () { if (frozen) return; use.splice(k, 1); draw(); }; if (frozen) b.disabled = true; strip.appendChild(b); });
      bank.innerHTML = '';
      tiles.forEach(function (t, ti) { var b = el('button', { type: 'button', 'class': 'iqtile' }); b.innerHTML = fmt(t); b.disabled = frozen || use.indexOf(ti) >= 0; b.onclick = function () { use.push(ti); draw(); }; bank.appendChild(b); });
    }
    if (!o.show) { root.appendChild(bank); root.appendChild(row([btn('Clear', 'small', function () { if (!frozen) { use = []; draw(); } })])); }
    draw();
    function built() { return use.map(function (ti) { return tiles[ti]; }).join(' '); }
    return { root: root,
      check: function () {
        if (!use.length) { toast('Tap some tiles first.'); return null; }
        var t = normIq(built()), ok = accept.indexOf(t) >= 0, msg = '';
        if (!ok) {
          var near = accept.some(function (a) { return a.replace(/[<>=]+/, '?') === t.replace(/[<>=]+/, '?'); });
          msg = near ? 'So close: everything but the *symbol* is right. Is the boundary number itself included? Which way do the solutions go?' : (spec.hint || 'Not yet. Start with the variable, then the symbol, then the rest.');
        }
        return { ok: ok, ans: built(), msg: msg };
      },
      showAnswer: function () {
        var want = normIq([].concat(spec.ans)[0] || ''), out = [], usedT = {};
        // rebuild the first accepted answer from the tiles, longest tiles first
        var rest = want, guard = 0;
        while (rest && guard++ < 20) {
          var best = -1;
          tiles.forEach(function (t, ti) { if (usedT[ti]) return; var nt = normIq(t); if (nt && rest.indexOf(nt) === 0 && (best < 0 || nt.length > normIq(tiles[best]).length)) best = ti; });
          if (best < 0) break; usedT[best] = 1; out.push(best); rest = rest.slice(normIq(tiles[best]).length);
        }
        use = out; draw();
      },
      freeze: function () { frozen = true; root.classList.add('frozen'); draw(); var r = root.querySelector('.iqrow'); if (r) r.remove(); bank.remove(); }
    };
  };
  function planePic(p) {
    var ax = planeAxis(p.range || [-5, 5], p.vars), b = H('div', 'iqpic plane' + (p.big ? ' big' : ''));
    if (p.lines) {   // a system: several labelled boundaries and the region where every limit holds
      if (p.region) drawRegion(ax, S_('g', {}, ax.shade), parseCond(p.region, p.vars));
      p.lines.forEach(function (ln) { bLine(ax, ln, ln.solid === false ? 'dash' : ''); if (ln.lab) { var tl = S_('text', { x: ax.X(ln.lab[0]), y: ax.Y(ln.lab[1]), 'class': 'iqllbl' }, ax.top); tl.textContent = ln.lab[2]; } });
      (p.pts || []).forEach(function (q) { S_('circle', { cx: ax.X(q[0]), cy: ax.Y(q[1]), r: 6, 'class': 'iqpp' + (q[3] ? ' hollow' : '') }, ax.top); if (q[2]) { var t = S_('text', { x: ax.X(q[0]) + 8, y: ax.Y(q[1]) - 8, 'class': 'iqclbl' }, ax.top); t.textContent = q[2]; } });
      b.appendChild(ax.svg); return b;
    }
    var ln = targetLine(p);
    if (p.shade !== false && p.op) bShade(ax, ln, rightSide(p), 'given');
    bLine(ax, ln, strictOp(p.op || '<=') ? 'dash' : '');
    b.appendChild(ax.svg); return b;
  }

  // 🪜 solve it one move at a time
  W.solve = function (spec, o) {
    var steps = spec.moves || [], k = 0, phase = 'move', slips = 0, frozen = !!o.show, root = H('div', 'iqw iqsolve');
    var work = H('div', 'iqlines'), ask = H('div', 'iqask'), gbox = H('div', 'iqgbox'), lines = [spec.start], notes = [], whys = [], gw = null, wrong = {};
    root.appendChild(work); root.appendChild(ask); root.appendChild(gbox);
    function drawWork() {
      work.innerHTML = '';
      lines.forEach(function (l, i) { var r = H('div', 'iqline' + (i === lines.length - 1 && !frozen ? ' now' : '')); r.appendChild(H('span', 'iqeq', fmt(l))); if (notes[i]) r.appendChild(H('span', 'iqnote', fmt(notes[i]))); if (whys[i]) r.appendChild(H('span', 'iqwhy', '💡 ' + fmt(whys[i]))); work.appendChild(r); });
    }
    function finishGraph() {
      if (!spec.graph || gw) return;
      gbox.appendChild(H('p', 'iqask-q', '<b>Last step:</b> graph your answer on the number line.'));
      gw = W.nl({ range: spec.graph.range, ans: spec.graph, v: spec.v }, { show: o.show, id: (o.id || '') + 'g' }); gbox.appendChild(gw.root);
      if (o.show) return;
      var fb = H('div', ''), cb = btn('Check my graph', 'primary small', function () {
        var r = gw.check(); if (!r) return;
        if (r.ok) { gw.freeze(true); cb.remove(); fb.innerHTML = ''; o.done(lines[lines.length - 1] + (slips ? ' (' + slips + ' slip' + (slips > 1 ? 's' : '') + ')' : ''), true); }
        else { slips++; fb.className = 'fb try'; fb.innerHTML = fmt(r.msg); }
      });
      gbox.appendChild(row([cb])); gbox.appendChild(fb);
    }
    function drawAsk() {
      ask.innerHTML = '';
      if (k >= steps.length) { if (spec.graph) finishGraph(); else if (!o.show && !frozen) o.done(lines[lines.length - 1] + (slips ? ' (' + slips + ' slip' + (slips > 1 ? 's' : '') + ')' : ''), true); return; }
      if (o.show) { ask.appendChild(H('p', 'iqask-q', 'Students pick each move, then its result.')); return; }
      var s = steps[k], opts = phase === 'move' ? s.opts : s.res, right = phase === 'move' ? s.ans : s.rans;
      ask.appendChild(H('p', 'iqask-q', fmt(phase === 'move' ? (s.q || 'What is the next move?') : 'What do you get?')));
      var list = H('div', 'iqopts');
      (opts || []).forEach(function (t, i) {
        var b = el('button', { type: 'button', 'class': 'iqopt' + (wrong[k + phase + i] ? ' no' : '') }); b.innerHTML = fmt(t);
        b.disabled = !!wrong[k + phase + i];
        b.onclick = function () {
          if (i === right) {
            if (phase === 'move') { notes[lines.length - 1] = plain(t); phase = 'res'; }
            else { lines.push(t); phase = 'move'; k++; if (s.why) whys[lines.length - 1] = s.why; }
            drawWork(); drawAsk();
          } else {
            slips++; wrong[k + phase + i] = 1; drawAsk();
            ask.appendChild(H('div', 'fb try', fmt((s.no && s.no[phase === 'move' ? i : 'r' + i]) || s.hint || (phase === 'res' ? 'Do the move to both sides. Did you multiply or divide by a negative? Then the sign turns around.' : 'What is stuck to the variable? Undo the adding or subtracting first, then the multiplying.'))));
          }
        };
        list.appendChild(b);
      });
      ask.appendChild(list);
    }
    drawWork(); drawAsk();
    return { root: root, self: true,
      showAnswer: function () {
        lines = [spec.start]; notes = []; whys = [];
        steps.forEach(function (s) { notes[lines.length - 1] = plain(s.opts[s.ans]); lines.push(s.res[s.rans]); if (s.why) whys[lines.length - 1] = s.why; });
        k = steps.length; frozen = true; drawWork(); ask.innerHTML = '';
        if (spec.graph) { if (!gw) { gbox.innerHTML = ''; gw = W.nl({ range: spec.graph.range, ans: spec.graph, v: spec.v }, { show: true }); gbox.appendChild(gw.root); } gw.showAnswer(); gw.freeze(true); }
      },
      freeze: function () { frozen = true; root.classList.add('frozen'); drawWork(); }
    };
  };

  // 📈 graph a two-variable inequality on the plane
  W.plane = function (spec, o) {
    var range = spec.range || [-6, 6], parts = spec.parts || ['line', 'style', 'shade'], has = function (p) { return parts.indexOf(p) >= 0; };
    var V = spec.vars || ['x', 'y'], tl = targetLine(spec), frozen = !!o.show, root = H('div', 'iqw iqplanew'), ax = planeAxis(range, V);
    var st = { pts: [], solid: has('style') ? null : !strictOp(spec.op), side: null, tests: [] }, mode = has('line') ? 'plot' : has('shade') ? 'shade' : 'test', dragI = -1;
    root.appendChild(ax.svg);
    var info = H('div', 'iqtest');
    var bPlot = btn('📍 Plot', 'small iqtog'), bShadeB = btn('🎨 Shade', 'small iqtog'), bTest = btn('🧪 Test a point', 'small iqtog');
    var bSolid = btn('<span class="iqls"></span> Solid', 'small iqtog'), bDash = btn('<span class="iqls dash"></span> Dashed', 'small iqtog');
    var hint = H('p', 'iqhint');
    function myLine() { return has('line') ? lineOf(st.pts[0], st.pts[1]) : tl; }
    function draw() {
      clear(ax.shade); clear(ax.lineG); clear(ax.top);
      var ln = myLine();
      if (ln && st.side && (ln.vx != null ? (st.side === 'left' || st.side === 'right') : (st.side === 'above' || st.side === 'below'))) bShade(ax, ln, st.side, frozen && o.right ? 'good' : '');
      if (ln) bLine(ax, ln, (st.solid === false ? 'dash' : st.solid ? 'set' : 'unset') + (has('line') ? '' : ' given'));
      st.pts.forEach(function (p, i) { S_('circle', { cx: ax.X(p.x), cy: ax.Y(p.y), r: 7.5, 'class': 'iqpp' + (dragI === i ? ' drag' : '') }, ax.top); });
      st.tests.forEach(function (t) { var g = S_('g', { 'class': 'iqtp ' + (t.ok == null ? 'on' : t.ok ? 'yes' : 'no') }, ax.top); S_('circle', { cx: ax.X(t.x), cy: ax.Y(t.y), r: 6 }, g); var tx = S_('text', { x: ax.X(t.x) + 8, y: ax.Y(t.y) + 14 }, g); tx.textContent = t.ok == null ? 'on' : t.ok ? '✓' : '✗'; });
      bPlot.classList.toggle('on', mode === 'plot'); bShadeB.classList.toggle('on', mode === 'shade'); bTest.classList.toggle('on', mode === 'test');
      bSolid.classList.toggle('on', st.solid === true); bDash.classList.toggle('on', st.solid === false);
      hint.innerHTML = mode === 'plot' ? (st.pts.length < 2 ? 'Tap two points that are on <b>' + esc_(lineTxt(tl, V)) + '</b>. (' + st.pts.length + ' of 2)' : 'Drag a point to move it, or tap it to take it away.') :
        mode === 'shade' ? (ln ? 'Tap the side of the line to shade.' : 'Plot the line first.') : 'Tap any point to test it in the inequality.';
      ax.svg.setAttribute('data-mode', frozen ? '' : mode);
    }
    function near(p) { for (var i = 0; i < st.pts.length; i++) if (Math.abs(st.pts[i].x - p.x) < 0.5 && Math.abs(st.pts[i].y - p.y) < 0.5) return i; return -1; }
    if (!o.show) {
      var modes = [has('line') && bPlot, has('shade') && bShadeB, spec.op !== '=' && bTest].filter(Boolean);   // op '=': graph a line, nothing to test or shade
      bPlot.onclick = function () { mode = 'plot'; draw(); }; bShadeB.onclick = function () { mode = 'shade'; draw(); }; bTest.onclick = function () { mode = 'test'; draw(); };
      bSolid.onclick = function () { if (frozen) return; st.solid = true; draw(); }; bDash.onclick = function () { if (frozen) return; st.solid = false; draw(); };
      var ctl = H('div', 'iqctl');
      if (modes.length > 1) ctl.appendChild(row(modes, 'iqwrap'));
      if (has('style')) ctl.appendChild(row([H('span', 'iqlab', 'Line:'), bSolid, bDash], 'iqwrap'));
      ctl.appendChild(hint); ctl.appendChild(info); root.appendChild(ctl);
      ax.svg.classList.add('live');
      ax.svg.addEventListener('pointerdown', function (e) {
        if (frozen) return; e.preventDefault();
        if (mode === 'plot') {
          var p = ax.at(e, true), i = near(p);
          if (i >= 0) { dragI = i; st.moved = false; try { ax.svg.setPointerCapture(e.pointerId); } catch (er) { } }
          else { if (st.pts.length >= 2) st.pts.pop(); st.pts.push(p); if (st.pts.length === 2 && has('shade') && !st.side) mode = 'shade'; }
          draw();
        } else if (mode === 'shade') {
          var q = ax.at(e, false), ln = myLine(); if (!ln) { toast('Plot two points first.'); return; }
          var sd = sideOf(ln, q.x, q.y); if (!sd) { toast('That is on the line. Tap one side of it.'); return; }
          st.side = sd; draw();
        } else {
          var t = ax.at(e, true), c = parseCond(ineqTxt(tl, spec.op, V), V), on = onTarget(spec, t);
          st.tests = st.tests.filter(function (x) { return x.x !== t.x || x.y !== t.y; }).slice(-3);
          st.tests.push({ x: t.x, y: t.y, ok: on && strictOp(spec.op) ? false : on ? true : c.test(t.x, t.y) });
          var sb = subst(c, t.x, t.y);
          info.innerHTML = '<b>Test (' + frac(t.x) + ', ' + frac(t.y) + '):</b> ' + sb.html + '<br>' + (on ? 'It is <b>on</b> the boundary line, so it counts only if the line is solid (≤ or ≥). Test a point off the line to choose a side.' : sb.ok ? 'A solution: shade the side this point is on.' : 'Not a solution: shade the <b>other</b> side.');
          draw();
        }
      });
      ax.svg.addEventListener('pointermove', function (e) { if (dragI < 0 || frozen) return; var p = ax.at(e, true), cur = st.pts[dragI]; if (p.x !== cur.x || p.y !== cur.y) { if (near(p) < 0) { st.pts[dragI] = p; st.moved = true; draw(); } } });
      ['pointerup', 'pointercancel'].forEach(function (ev) { ax.svg.addEventListener(ev, function () { if (dragI >= 0) { if (!st.moved) st.pts.splice(dragI, 1); dragI = -1; draw(); } }); });
    }
    draw();
    function readMine() { var ln = myLine(); if (!ln) return 'no line'; var op = st.side === 'above' || st.side === 'right' ? (st.solid ? '≥' : '>') : st.side ? (st.solid ? '≤' : '<') : '?'; return st.side ? ineqTxt(ln, op === '≥' ? '>=' : op === '≤' ? '<=' : op, V) : lineTxt(ln, V) + (st.solid == null || spec.op === '=' ? '' : st.solid ? ', solid' : ', dashed'); }
    return { root: root,
      check: function () {
        if (has('line') && st.pts.length < 2) { toast('Plot two points on the boundary line first.'); return null; }
        if (has('style') && st.solid == null) { toast('Choose a solid or a dashed line.'); return null; }
        if (has('shade') && !st.side) { toast('Tap the side of the line to shade.'); return null; }
        var okL = !has('line') || (onTarget(spec, st.pts[0]) && onTarget(spec, st.pts[1])), okS = st.solid === !strictOp(spec.op), okH = !has('shade') || st.side === rightSide(spec), msgs = [];
        if (!okL) msgs.push(spec.vx != null ? 'Every point on ' + V[0] + ' = ' + frac(spec.vx) + ' has ' + V[0] + ' = ' + frac(spec.vx) + '.' : 'Your line isn\'t ' + lineTxt(tl, V) + ' yet. ' + (spec.hint || 'Start where it crosses the ' + V[1] + '-axis, (0, ' + frac(spec.b) + '), then use the slope ' + frac(spec.m) + ' for the second point. Or find where it crosses each axis.'));
        if (!okS) msgs.push(strictOp(spec.op) ? '< and >: points *on* the line are not solutions, so the line is *dashed*.' : '≤ and ≥: points *on* the line are solutions too, so the line is *solid*.');
        if (!okH) msgs.push('Use *🧪 Test a point*: try (0, 0) or another point off the line. True? Shade its side. False? Shade the other side.');
        return { ok: okL && okS && okH, ans: readMine(), msg: (has('line') || has('shade') ? 'Your graph shows *' + readMine() + '*. ' : '') + msgs.join(' ') };
      },
      showAnswer: function () { if (has('line')) st.pts = twoPts(spec); st.solid = !strictOp(spec.op); if (has('shade')) st.side = rightSide(spec); draw(); },
      freeze: function (good) { frozen = true; o.right = good; root.classList.add('frozen'); [bPlot, bShadeB, bSolid, bDash].forEach(function (b) { b.disabled = true; }); hint.remove(); draw(); }
    };
  };

  /* ---------------- the slides ---------------- */
  var ICON = { nl: ['📏', 'Graph it'], pick: ['👆', 'Tap the solutions'], sort: ['🗂️', 'Sort it'], match: ['🔗', 'Match them'], build: ['🧱', 'Build the inequality'], solve: ['🪜', 'Solve it, step by step'], plane: ['📈', 'Graph it on the plane'] };
  function learnBox(s) { var b = H('div', 'iqlearn'); b.appendChild(H('span', 'iqlico', '📘')); var ul = H('ul', ''); s.learn.forEach(function (t) { ul.appendChild(H('li', '', fmt(t))); }); b.appendChild(ul); return b; }
  // tab: { head: ['x', 'y'], rows: [[0, 3], [2, 7]] }: a small table under the question (any hands-on kind or Go deeper task)
  function tabBox(t) {
    var w = H('div', 'iqtab'), tb = H('table', 'ftab'), tr = H('tr');
    (t.head || []).forEach(function (h) { tr.appendChild(H('th', '', fmt(String(h)))); }); tb.appendChild(tr);
    (t.rows || []).forEach(function (r) { var row = H('tr'); r.forEach(function (c) { row.appendChild(H('td', String(c) === '?' ? 'qm' : '', fmt(String(c).replace(/^-/, '−')))); }); tb.appendChild(row); });
    w.appendChild(tb); return w;
  }
  Object.keys(ICON).forEach(function (kind) {
    K.NEWK[kind] = 1;
    K.KINDS[kind] = function (s, d, show) {
      K.head(s, d);
      var side = kind === 'plane' || (kind === 'pick' && s.where === 'plane');
      var grid = H('div', 'iqgrid' + (side ? ' side' : '')), txt = H('div', 'st iqtxt'), area = H('div', 'iqarea'), foot = H('div', 'iqfoot');
      txt.appendChild(H('p', 'kick', ICON[kind][0] + ' ' + fmt(s.kick || ICON[kind][1])));
      K.qline(s, txt);
      if (s.tab) txt.appendChild(tabBox(s.tab));
      if (s.learn && s.learn.length) txt.appendChild(learnBox(s));
      grid.appendChild(txt); grid.appendChild(area); d.appendChild(grid);
      if (side) txt.appendChild(foot); else grid.appendChild(foot);
      var a0 = mine()[s.id], last = null, frozen = false, shownAns = false;
      var w = W[kind](s, { show: show, id: s.id, done: function (ans, ok) { K.retry(s, ans, ok, 'open'); if (ok) K.confetti(); d._upd(); } });
      area.appendChild(w.root);
      if (!show && a0 && a0.correct === true) { w.showAnswer(); w.freeze(true); frozen = true; }
      d._upd = function () {
        foot.innerHTML = '';
        var a = mine()[s.id], rv = K.reveal(s.id), solved = !!(a && a.correct === true);
        if (show) {
          foot.appendChild(K.tallyFor(s.id)); K.rightSoFar(s, foot, 'Right');
          if (K.onScreen(s.id)) foot.appendChild(K.answerGroups(s));
          if ((rv >= 2 || K.peeking()) && !shownAns) { shownAns = true; w.showAnswer(); if (w.freeze) w.freeze(true); }
          if (shownAns && s.why) foot.appendChild(H('div', 'reveal', fmt(s.why)));
          return;
        }
        if (solved) {
          if (!frozen) { frozen = true; w.freeze(true); }
          foot.appendChild(H('div', 'fb good', '<b>Yes!</b> ' + fmt(s.why || '')));
        } else if (rv >= 2) {
          if (!frozen) { frozen = true; w.showAnswer(); w.freeze(true); }
          foot.appendChild(H('div', 'reveal', '<b>' + TEACHER + ' showed the answer.</b> ' + fmt(s.why || '')));
        } else {
          if (!w.self) {
            var cb = btn('Check', 'primary', function () {
              var r = w.check(); if (!r) return;
              last = r.ok ? null : r.msg; K.retry(s, r.ans, r.ok, 'open'); if (r.ok) K.confetti(); d._upd();
            });
            foot.appendChild(row([cb]));
          }
          if (last && a && a.correct === false) foot.appendChild(H('div', 'fb try', fmt(last)));
        }
        if (a) foot.appendChild(K.stateLine(s.id));
        if (!a) K.helpFor(s, foot, s.help);
        deeper(s, foot, d);
      };
      d._upd();
    };
  });

  /* 🔭 Go deeper: optional tasks, one at a time, for a student who has checked the slide's task at least once */
  var DEEP = ['🔭 Deeper', '🔭🔭 Deeper still', '🔭🔭🔭 Deepest'];
  function xDone(m, x) { return !!(x && (x.restored || (m.k === 'poll' || m.k === 'open' ? x.answer : x.correct === true || (x.tries || 0) >= (m.k === 'number' ? 2 : 3)))); }
  function deeper(s, box, d) {
    if (MODE !== 'student' || !s.more || !s.more.length) return;
    var a = mine()[s.id]; if (!a) return;
    var wrap = H('div', 'more iqdeep'); box.appendChild(wrap);
    if (!s._deep) {
      wrap.appendChild(H('p', 'kick', '🔭 Go deeper · optional'));
      wrap.appendChild(H('p', 'iqhint', s.deepNote || 'Done early, or want more? ' + s.more.length + ' harder one' + (s.more.length > 1 ? 's' : '') + ' on this idea. The class won\'t wait, so stop when ' + TEACHER + ' moves on.'));
      wrap.appendChild(row([btn('🔭 Go deeper', 'small', function () { s._deep = true; d._upd(); })]));
      return;
    }
    wrap.appendChild(H('p', 'kick', '🔭 Go deeper'));
    s._dw = s._dw || {};
    for (var i = 0; i < s.more.length; i++) {
      var m = s.more[i], id = K.xid(s, i), x = mine()[id], label = m.label || DEEP[i] || DEEP[2];
      if (xDone(m, x)) {
        var dn = H('div', 'xdone iqxdone'); dn.appendChild(H('p', '', '<b>' + label + '</b> ' + (x.correct === true ? '✓ right' : x.correct === false ? '· answer shown' : '✓ sent')));
        if (s._open === i || (s._open == null && i === lastDone(s))) dn.appendChild(solution(m, x, s, id));
        wrap.appendChild(dn); continue;
      }
      wrap.appendChild(deepCard(s, m, id, label, d));
      return;
    }
    wrap.appendChild(H('p', 'state ok', 'All done on this slide. Nice work. Explain one of them to someone near you, or wait for ' + TEACHER + '.'));
  }
  function lastDone(s) { var k = -1; s.more.forEach(function (m, i) { if (xDone(m, mine()[K.xid(s, i)])) k = i; }); return k; }
  function solution(m, x, s, id) {
    var w = H('div', 'xsol');
    if (W[m.k]) {
      var wd = s._dw[id + 'sol'];
      if (!wd) { wd = W[m.k](m, { show: false, id: id, done: function () { } }); wd.showAnswer(); if (wd.freeze) wd.freeze(true); s._dw[id + 'sol'] = wd; }
      if (x.correct !== true) w.appendChild(H('div', 'reveal', '<b>Here is the answer.</b> ' + fmt(m.why || '')));
      else if (m.why) w.appendChild(H('div', 'fb good', '<b>Yes!</b> ' + fmt(m.why)));
      if (x.correct !== true) w.appendChild(wd.root);
    } else if (m.k === 'poll') w.appendChild(H('div', x.correct === false ? 'fb try' : 'fb good', (x.correct === true ? '<b>Yes!</b> ' : x.correct === false ? '<b>Not this one.</b> The answer is ' + fmt(m.opts[m.ans]) + '. ' : '') + fmt(m.why || '')));
    else if (m.k === 'number') w.appendChild(H('div', x.correct ? 'fb good' : 'reveal', x.correct ? '<b>Yes!</b> ' + fmt(m.why || '') : '<b>The answer is ' + frac(m.ans) + '.</b> ' + fmt(m.why || '')));
    else if (m.model) w.appendChild(H('div', 'reveal', '<b>One good answer:</b> ' + fmt(m.model)));
    if (m.steps && m.steps.length) { var sol = H('div', 'worked'); sol.appendChild(H('p', 'kick', 'Worked solution')); var ol = H('ol', ''); m.steps.forEach(function (t) { ol.appendChild(H('li', '', fmt(t))); }); sol.appendChild(ol); w.appendChild(sol); }
    return w;
  }
  function deepCard(s, m, id, label, d) {
    var c = H('div', 'xq iqxq'), x = mine()[id];
    c.appendChild(H('p', 'xl', label));
    if (m.kick) c.appendChild(H('p', 'kick', fmt(m.kick)));
    c.appendChild(H('p', 'xqq', fmt(m.q)));
    if (m.tab) c.appendChild(tabBox(m.tab));
    if (m.learn && m.learn.length) c.appendChild(learnBox(m));
    var save = function (ans, ok) { var t = (x && x.tries) || 0; K.record({ id: id, k: 'open' }, ans, ok); mine()[id].tries = t + 1; K.saveLocal(); s._open = null; if (ok) K.confetti(); d._upd(); };
    if (W[m.k]) {
      var wd = s._dw[id]; if (!wd) { wd = W[m.k](m, { show: false, id: id, done: function (ans, ok) { save(ans, ok); } }); s._dw[id] = wd; }
      c.appendChild(wd.root);
      if (!wd.self) {
        var cb = btn('Check', 'primary small', function () { var r = wd.check(); if (!r) return; s._dmsg = r.ok ? null : r.msg; save(r.ans, r.ok); });
        var tries = (x && x.tries) || 0;
        c.appendChild(row([cb, tries ? H('span', 'iqhint', 'Try ' + (tries + 1) + ' of 3: then the answer is shown.') : null]));
        if (x && x.correct === false && s._dmsg) c.appendChild(H('div', 'fb try', fmt(s._dmsg)));
      }
    } else if (m.k === 'poll') {
      var list = H('div', 'opts xopts'); c.appendChild(list);
      (m.opts || []).forEach(function (o, k) { var ob = el('button', { type: 'button', 'class': 'opt' }); ob.appendChild(H('span', 'L', 'ABCDEFGH'.charAt(k))); ob.appendChild(H('span', 't', fmt(o))); ob.onclick = function () { save((k + 1) + '. ' + plain(o), m.ans != null ? k === m.ans : null); }; list.appendChild(ob); });
    } else if (m.k === 'number') {
      var inp = el('input', { type: 'text', inputmode: 'text', placeholder: 'Type a number', autocomplete: 'off', 'aria-label': label + ' answer' });
      var go = function () { var raw = inp.value.trim().replace(/[−–]/g, '-'); if (!raw) return inp.focus(); var v = /^-?\d*\.?\d+\/\d+$/.test(raw) ? eval_(raw) : parseFloat(raw); if (isNaN(v)) { toast('Type a number, like 12 or -3.'); return; } save(inp.value.trim(), Math.abs(v - m.ans) <= (m.tol || 0) + 1e-9); };
      inp.onkeydown = function (e) { if (e.key === 'Enter') go(); };
      c.appendChild(row([inp, btn('Check', 'primary small', go)]));
      if (x && x.correct === false) c.appendChild(H('div', 'fb try', 'Not yet. ' + fmt(m.hint || 'Check your working and try once more.')));
    } else {
      var ta = el('textarea', { placeholder: m.ph || 'Type your answer', maxlength: '600', 'aria-label': label + ' answer' });
      c.appendChild(ta); c.appendChild(row([btn('Send', 'primary small', function () { var v = ta.value.trim(); if (!v) { toast('Type something first. A guess is fine.'); return ta.focus(); } save(v, null); })]));
    }
    return c;
  }
  function eval_(f) { var p = f.split('/'); return +p[0] / +p[1]; }

  window.SFA_INEQ = { W: W, parseCond: parseCond, subst: subst, frac: frac };   // for testing
})();
