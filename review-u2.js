/* Sandy Flats: Unit 2 Review (Linear Equations and Inequalities), built from the Grade 8 formative task sheet (C1, C2, C3).
   Four success criteria, thirteen skills. Each skill has Learn (the idea plus a worked example), Guided practice
   (one step at a time, hints, a full explanation after every step) and Independent practice (the final answer only,
   then the full worked solution). Problems are generated fresh every time.
   Mastery follows the task sheet's rubric: Limited, Emerging, Developed (the goal: 3 of the last 4 independent problems
   right), Deep (Developed, then 2 stretch problems right). Progress saves like a game, under the key g90, so it
   follows a signed-in student to any computer and shows on the class pages. */
(function () {
  'use strict';
  var SFA = window.SFA, el = SFA.el, KEY = 'g90';

  /* ---------------- numbers ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function F(n, d) { d = d == null ? 1 : d; if (d < 0) { n = -n; d = -d; } var g = gcd(n, d); return [n / g, d / g]; }
  function fs(f) { return (f[0] < 0 ? '−' : '') + Math.abs(f[0]) + (f[1] === 1 ? '' : '/' + f[1]); }
  function feq(a, b) { return a[0] * b[1] === b[0] * a[1]; }
  function fv(f) { return f[0] / f[1]; }
  function parse(s) {
    s = String(s == null ? '' : s).trim().replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/^\+/, '');
    if (!s) return null;
    var m = s.match(/^(-?)\(?(-?\d+)\)?\/\(?(-?\d+)\)?$/);
    if (m) { var d = +m[3]; if (!d) return null; return F((m[1] ? -1 : 1) * +m[2], d); }
    if (/^-?\d*\.?\d+$/.test(s)) { var p = s.split('.'), k = p[1] ? p[1].length : 0; if (k > 6) return null; var den = Math.pow(10, k); return F(Math.round(parseFloat(s) * den), den); }
    return null;
  }
  function ng(n) { return n < 0 ? '−' + (-n) : String(n); }
  function par(n) { return n < 0 ? '(−' + (-n) + ')' : String(n); }
  // a coefficient in front of a variable: 1x → x, −1x → −x, 3/4 → (3/4)x
  function co(f, v, first) {
    if (typeof f === 'number') f = F(f);
    var n = f[0], d = f[1]; if (n === 0) return '';
    var a = Math.abs(n), body = v ? (d === 1 ? (a === 1 ? '' : a) : '(' + a + '/' + d + ')') + v : (d === 1 ? String(a) : a + '/' + d);
    return first ? (n < 0 ? '−' : '') + body : (n < 0 ? ' − ' : ' + ') + body;
  }
  function lineEq(m, b, yv, xv) { var s = co(m, xv || 'x', true), t = co(b, '', !s); return (yv || 'y') + ' = ' + (s + t || '0'); }
  function stdEq(A, B, C) { var s = co(A, 'x', true), t = co(B, 'y', !s); return s + t + ' = ' + ng(C); }
  function M(s) { return '<span class="m">' + s + '</span>'; }

  /* ---------------- randomness ---------------- */
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function nz(a, b) { var v; do v = ri(a, b); while (!v); return v; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // a multiple-choice step from a right answer and wrong ones (duplicates dropped)
  function mc(q, right, wrongs, extra) {
    var seen = {}, opts = [right].concat(wrongs).filter(function (o) { if (seen[o]) return false; seen[o] = 1; return true; }).slice(0, 4);
    var sh = shuffle(opts), st = { type: 'mc', q: q, choices: sh, ans: sh.indexOf(right) };
    for (var k in extra) st[k] = extra[k];
    return st;
  }

  /* ---------------- the coordinate grid ---------------- */
  var R = 8, SZ = 320, U = SZ / (2 * R), gid = 0;
  function X(x) { return ((x + R) * U).toFixed(1); }
  function Y(y) { return ((R - y) * U).toFixed(1); }
  function graph(o) {
    o = o || {}; var id = 'gc' + (++gid), s = '<svg class="gr' + (o.pick ? ' gpick' : '') + '" viewBox="0 0 ' + SZ + ' ' + SZ + '" role="img" aria-label="' + (o.aria || 'Coordinate grid from −8 to 8') + '">';
    s += '<defs><clipPath id="' + id + '"><rect width="' + SZ + '" height="' + SZ + '"/></clipPath></defs><rect class="gbg" width="' + SZ + '" height="' + SZ + '"/>';
    for (var i = -R; i <= R; i++) {
      if (!i) continue;
      s += '<line class="gl" x1="' + X(i) + '" y1="0" x2="' + X(i) + '" y2="' + SZ + '"/><line class="gl" x1="0" y1="' + Y(i) + '" x2="' + SZ + '" y2="' + Y(i) + '"/>';
    }
    s += '<line class="ax" x1="' + X(0) + '" y1="0" x2="' + X(0) + '" y2="' + SZ + '"/><line class="ax" x1="0" y1="' + Y(0) + '" x2="' + SZ + '" y2="' + Y(0) + '"/>';
    for (i = -R + 2; i < R; i += 2) { if (!i) continue; s += '<text class="tk" x="' + X(i) + '" y="' + (+Y(0) + 13) + '">' + i + '</text><text class="tk" style="text-anchor:end" x="' + (+X(0) - 4) + '" y="' + (+Y(i) + 4) + '">' + i + '</text>'; }
    s += '<text class="tk" x="' + (SZ - 8) + '" y="' + (+Y(0) - 6) + '">x</text><text class="tk" x="' + (+X(0) + 10) + '" y="12">y</text>';
    s += '<g clip-path="url(#' + id + ')">';
    function yAt(L, x) { return fv(L.m) * x + fv(L.b); }
    (o.shade || []).forEach(function (L) {
      var a = -R - 1, b = R + 1, far = L.dir > 0 ? 3 * R : -3 * R;
      s += '<polygon class="sh" points="' + X(a) + ',' + Y(yAt(L, a)) + ' ' + X(b) + ',' + Y(yAt(L, b)) + ' ' + X(b) + ',' + Y(far) + ' ' + X(a) + ',' + Y(far) + '"/>';
    });
    (o.lines || []).forEach(function (L) { var a = -R - 1, b = R + 1; s += '<line class="ln' + (L.dash ? ' d' : '') + (L.grey ? ' g' : '') + '" x1="' + X(a) + '" y1="' + Y(yAt(L, a)) + '" x2="' + X(b) + '" y2="' + Y(yAt(L, b)) + '"/>'; });
    s += '</g>';
    (o.pts || []).forEach(function (p) {
      s += '<circle class="pt' + (p.u ? ' u' : '') + '" cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="6"/>';
      if (p.label) s += '<text class="pl" x="' + (+X(p.x) + 9) + '" y="' + (+Y(p.y) - 9) + '">' + p.label + '</text>';
    });
    return s + '</svg>';
  }
  function table(xs, ys, xh, yh) {
    var h = '<table class="tb"><tr><th>' + (xh || 'x') + '</th><th>' + (yh || 'y') + '</th></tr>';
    xs.forEach(function (x, i) { h += '<tr><td>' + ng(x) + '</td><td>' + ng(ys[i]) + '</td></tr>'; });
    return h + '</table>';
  }

  /* ---------------- story contexts ---------------- */
  var CTX = [
    { intro: 'A climbing gym charges a sign-up fee plus a monthly price.', t: function (S, R) { return 'A climbing gym charges a $' + S + ' sign-up fee plus $' + R + ' per month.'; }, x: 'month', xs: 'months', y: 'total cost', money: 1, S: [20, 60, 5], R: [10, 30, 1], dir: 1 },
    { intro: 'A water tank is draining at a steady rate.', t: function (S, R) { return 'A water tank holds ' + S + ' litres. It drains ' + R + ' litres every minute.'; }, x: 'minute', xs: 'minutes', y: 'water in the tank', unit: 'litres', S: [200, 500, 50], R: [5, 25, 5], dir: -1 },
    { intro: 'A candle burns down at a steady rate.', t: function (S, R) { return 'A candle is ' + S + ' cm tall. It burns down ' + R + ' cm every hour.'; }, x: 'hour', xs: 'hours', y: 'height of the candle', unit: 'cm', S: [18, 30, 2], R: [1, 3, 1], dir: -1 },
    { intro: 'Lena saves the same amount every week.', t: function (S, R) { return 'Lena has $' + S + ' saved and adds $' + R + ' every week.'; }, x: 'week', xs: 'weeks', y: 'amount saved', money: 1, S: [30, 120, 10], R: [5, 25, 5], dir: 1 },
    { intro: 'A taxi charges a starting fee plus a price per kilometre.', t: function (S, R) { return 'A taxi ride costs $' + S + ' to start plus $' + R + ' for every kilometre.'; }, x: 'kilometre', xs: 'kilometres', y: 'cost of the ride', money: 1, S: [3, 9, 1], R: [2, 4, 1], dir: 1 },
    { intro: 'After a storm, the Sandy Flats duck pond drops at a steady rate.', t: function (S, R) { return 'After a storm the Sandy Flats duck pond is ' + S + ' cm deep. It drops ' + R + ' cm every day.'; }, x: 'day', xs: 'days', y: 'depth of the pond', unit: 'cm', S: [60, 120, 10], R: [2, 6, 1], dir: -1 },
    { intro: 'A wild goat climbs the Switchback trail at a steady rate.', t: function (S, R) { return 'A wild goat starts ' + S + ' m up the Switchback trail and climbs ' + R + ' m every minute.'; }, x: 'minute', xs: 'minutes', y: 'height up the trail', unit: 'm', S: [10, 50, 5], R: [3, 9, 1], dir: 1 }
  ];
  function story() {
    var c = pick(CTX), S = c.S[0] + c.S[2] * ri(0, Math.floor((c.S[1] - c.S[0]) / c.S[2])), Rt = ri(c.R[0], c.R[1]);
    if (c.R[0] % 5 === 0) Rt = 5 * Math.round(Rt / 5);
    return { c: c, S: S, R: Rt, m: c.dir * Rt, text: c.t(S, Rt), val: function (v) { return c.money ? '$' + ng(v) : ng(v) + ' ' + c.unit; }, u: c.money ? 'dollars' : c.unit };
  }

  /* ---------------- the thirteen skills ---------------- */
  // each generator returns { q (the problem), fig, steps }. A step: { type, q, ans, hint, why, final, lab }.
  // Guided practice walks every step; independent practice asks only the final steps, then shows every step's why.
  var T = {};

  T.s1 = { name: 'Slope from two points', crit: 'compute',
    idea: 'Slope tells you how steep a line is: how much <b>y</b> changes every time <b>x</b> goes up by 1. With two points, find the change in y and the change in x, then divide.',
    formula: 'm = (y₂ − y₁) ÷ (x₂ − x₁)  =  change in y ÷ change in x',
    tips: ['Subtract in the <b>same order</b> on top and bottom: point 2 minus point 1.', 'Subtracting a negative is adding: 3 − (−2) = 5.', 'Simplify the fraction. A negative slope means the line goes down left to right.'],
    gen: function (h) {
      var dx = h ? pick([2, 3, 4, 5, 6]) : ri(1, 4), dy = h ? nz(-9, 9) : nz(-3, 3) * dx;
      if (h && dy % dx === 0) dy += dy > 0 ? 1 : -1;
      var x1 = ri(-6, 3), y1 = ri(-6, 5), x2 = x1 + dx, y2 = y1 + dy;
      if (h && Math.random() < .5) { var t = x1; x1 = x2; x2 = t; t = y1; y1 = y2; y2 = t; dx = -dx; dy = -dy; }
      var m = F(dy, dx);
      return { q: 'Find the slope of the line through ' + M('(' + ng(x1) + ', ' + ng(y1) + ')') + ' and ' + M('(' + ng(x2) + ', ' + ng(y2) + ')') + '.',
        steps: [
          { type: 'num', q: 'Change in y: ' + M('y₂ − y₁') + ' = ?', ans: [F(dy)], hint: 'Point 2\'s y minus point 1\'s y: ' + M(ng(y2) + ' − ' + par(y1)) + '.', why: M(ng(y2) + ' − ' + par(y1) + ' = ' + ng(dy)) + '. The line goes ' + (dy > 0 ? 'up ' : 'down ') + Math.abs(dy) + '.' },
          { type: 'num', q: 'Change in x: ' + M('x₂ − x₁') + ' = ?', ans: [F(dx)], hint: 'Same order as before: ' + M(ng(x2) + ' − ' + par(x1)) + '.', why: M(ng(x2) + ' − ' + par(x1) + ' = ' + ng(dx)) + '.' },
          { type: 'num', final: 1, lab: 'm =', q: 'Slope: divide the change in y by the change in x, and simplify.', ans: [m], hint: 'Put your two answers in a fraction: change in y on top.', why: M('m = ' + ng(dy) + '/' + ng(dx) + ' = ' + fs(m)) + '.' }
        ] };
    } };

  T.s2 = { name: 'Slope from a table', crit: 'compute',
    idea: 'In a table, slope is the change in y divided by the change in x between any two rows. Every pair of rows gives the same slope if the relationship is linear.',
    formula: 'm = (change in y between two rows) ÷ (change in x between the same rows)',
    tips: ['Check the x-column first: it does <b>not</b> always go up by 1.', 'If y goes down as x goes up, the slope is negative.'],
    gen: function (h) {
      var step = h ? pick([2, 3, 4, 5]) : pick([1, 1, 2]), per = h ? nz(-7, 7) : nz(-4, 4) * step;
      if (h && per % step === 0) per += per > 0 ? 1 : -1;
      var x0 = ri(-3, 2), y0 = ri(-8, 10), xs = [], ys = [];
      for (var i = 0; i < 4; i++) { xs.push(x0 + i * step); ys.push(y0 + i * per); }
      var m = F(per, step);
      return { q: 'Find the slope of the linear function in the table.', fig: table(xs, ys),
        steps: [
          { type: 'num', q: 'From one row to the next, how much does <b>y</b> change?', ans: [F(per)], hint: 'Subtract: ' + M(ng(ys[1]) + ' − ' + par(ys[0])) + '.', why: 'y goes from ' + ng(ys[0]) + ' to ' + ng(ys[1]) + ': ' + M(ng(ys[1]) + ' − ' + par(ys[0]) + ' = ' + ng(per)) + '.' },
          { type: 'num', q: 'Over the same rows, how much does <b>x</b> change?', ans: [F(step)], hint: 'Look at the x-column: ' + M(ng(xs[1]) + ' − ' + par(xs[0])) + '.', why: 'x goes from ' + ng(xs[0]) + ' to ' + ng(xs[1]) + ', a change of ' + step + (step === 1 ? '.' : ', not 1.') },
          { type: 'num', final: 1, lab: 'm =', q: 'Slope = change in y ÷ change in x. Simplify.', ans: [m], hint: 'Divide your first answer by your second.', why: M('m = ' + ng(per) + '/' + step + ' = ' + fs(m)) + '.' }
        ] };
    } };

  T.s3 = { name: 'Slope from a graph', crit: 'compute',
    idea: 'On a graph, choose two points where the line crosses grid corners. Count the <b>rise</b> (up is +, down is −) and the <b>run</b> (to the right). Slope is rise over run.',
    formula: 'm = rise ÷ run',
    tips: ['Always move right for the run, so the sign comes from the rise.', 'A line going downhill from left to right has a negative slope.'],
    gen: function (h) {
      var dx, dy, x1, y1, x2, y2, tries = 0;
      do { dx = ri(1, h ? 6 : 4); dy = h ? nz(-6, 6) : nz(-3, 3) * (Math.random() < .6 ? dx : 1); x1 = ri(-7, 1); y1 = ri(-6, 6); x2 = x1 + dx; y2 = y1 + dy; } while ((Math.abs(y2) > 7 || x2 > 7) && ++tries < 50);
      var m = F(dy, dx), b = F(y1 * dx - dy * x1, dx);
      var pts = h ? [{ x: x1, y: y1, label: 'A' }, { x: x2, y: y2, label: 'B' }] : [{ x: x1, y: y1, label: 'A (' + ng(x1) + ', ' + ng(y1) + ')' }, { x: x2, y: y2, label: 'B (' + ng(x2) + ', ' + ng(y2) + ')' }];
      return { q: 'Find the slope of the line. Use points A and B' + (h ? ' (read their coordinates from the grid).' : '.'), fig: graph({ lines: [{ m: m, b: b }], pts: pts, aria: 'A line through A and B' }),
        steps: [
          { type: 'num', q: 'Rise: going from A to B, how far up (+) or down (−) do you move?', ans: [F(dy)], hint: 'A is at height ' + ng(y1) + ', B is at height ' + ng(y2) + '.', why: 'From height ' + ng(y1) + ' to ' + ng(y2) + ' is ' + (dy > 0 ? 'up ' : 'down ') + Math.abs(dy) + ', so the rise is ' + ng(dy) + '.' },
          { type: 'num', q: 'Run: how far right do you move from A to B?', ans: [F(dx)], hint: 'A is at x = ' + ng(x1) + ', B is at x = ' + ng(x2) + '.', why: 'From x = ' + ng(x1) + ' to x = ' + ng(x2) + ' is ' + dx + ' to the right.' },
          { type: 'num', final: 1, lab: 'm =', q: 'Slope = rise ÷ run. Simplify.', ans: [m], hint: 'Rise on top, run on the bottom.', why: M('m = ' + ng(dy) + '/' + dx + ' = ' + fs(m)) + (dy < 0 ? '. Downhill, so negative.' : '. Uphill, so positive.') }
        ] };
    } };

  T.s4 = { name: 'Slope from an equation', crit: 'compute',
    idea: 'In <b>y = mx + b</b>, the slope is the number multiplied by x, even when the terms are in a different order. If y is not alone, get it alone first.',
    formula: 'y = mx + b  →  slope m        Ax + By = C  →  slope = −A ÷ B',
    tips: ['In y = 7 − 2x the slope is −2: the sign in front of the x-term goes with it.', 'For 3y = 6x + 9, divide every term by 3 first: y = 2x + 3.'],
    gen: function (h) {
      if (!h) {
        var m = Math.random() < .7 ? F(nz(-6, 6)) : F(nz(-5, 5), pick([2, 3, 4])), b = ri(-9, 9), form = ri(0, 2), eq;
        if (form === 0) eq = lineEq(m, b);
        else if (form === 1) eq = 'y = ' + (b ? ng(b) + co(m, 'x', false) : co(m, 'x', true));
        else eq = lineEq(m, 0);
        return { q: 'What is the slope of ' + M(eq) + '?', steps: [
          { type: 'num', final: 1, lab: 'm =', q: 'y is already alone. Which number multiplies x (sign included)?', ans: [m], hint: 'Find the x-term. The sign in front of it belongs to the slope.', why: 'The x-term is ' + M(co(m, 'x', true)) + ', so ' + M('m = ' + fs(m)) + (b && form < 2 ? ' (the ' + ng(b) + ' is the y-intercept, not the slope).' : '.') }
        ] };
      }
      if (Math.random() < .4) {
        var k = pick([2, 3, 4, 5]), a = nz(-12, 12), c = ri(-12, 12), m2 = F(a, k);
        return { q: 'What is the slope of ' + M(k + 'y = ' + co(a, 'x', true) + co(c, '', false)) + '?', steps: [
          { type: 'num', q: 'Divide every term by ' + k + ' to get y alone. What is the x-coefficient now?', ans: [m2], hint: M(co(a, 'x', true)) + ' ÷ ' + k + ' = ?', why: M(ng(a) + ' ÷ ' + k + ' = ' + fs(m2)) + '. Every term gets divided, so y = ' + M(co(m2, 'x', true) + co(F(c, k), '', false)) + '.' },
          { type: 'num', final: 1, lab: 'm =', q: 'So what is the slope?', ans: [m2], hint: 'It is the number multiplying x once y is alone.', why: 'Slope ' + M('m = ' + fs(m2)) + '.' }
        ] };
      }
      var A = ri(1, 7), B = nz(-6, 6), C = ri(-12, 12), ms = F(-A, B);
      return { q: 'What is the slope of ' + M(stdEq(A, B, C)) + '?', steps: [
        { type: 'num', q: 'Subtract ' + M(A + 'x') + ' from both sides: ' + M(co(B, 'y', true) + ' = ▢x' + co(C, '', false)) + '. What goes in the box?', ans: [F(-A)], hint: 'Moving the x-term to the other side changes its sign.', why: M(co(B, 'y', true) + ' = ' + co(-A, 'x', true) + co(C, '', false)) + '.' },
        { type: 'num', final: 1, lab: 'm =', q: 'Divide every term by ' + ng(B) + '. What is the slope?', ans: [ms], hint: M(ng(-A) + ' ÷ ' + par(B)) + ' = ?', why: M(ng(-A) + ' ÷ ' + par(B) + ' = ' + fs(ms)) + '. Shortcut check: slope = −A ÷ B = ' + M('−' + A + '/' + par(B)) + '.' }
      ] };
    } };

  T.f1 = { name: 'Standard form to slope-intercept form', crit: 'convert',
    idea: '<b>Standard form</b> is Ax + By = C (x and y on the same side, whole numbers, A not negative). <b>Slope-intercept form</b> is y = mx + b. To convert, get y alone.',
    formula: '1) Subtract the x-term from both sides.   2) Divide EVERY term by the number in front of y.',
    tips: ['Moving the x-term across the equals sign changes its sign.', 'The most common mistake: dividing the x-term but forgetting to divide C.'],
    gen: function (h) {
      var A, B, C;
      if (!h) { var m0 = nz(-4, 4), b0 = ri(-6, 6); B = pick([1, 2, 3, -1, -2]); A = -m0 * B; C = b0 * B; if (A < 0) { A = -A; B = -B; C = -C; } }
      else { A = ri(1, 6); B = pick([2, 3, 4, 5, -2, -3, -4]); C = ri(-12, 12); if (gcd(gcd(A, B), C || A) > 1) C += 1; }
      var m = F(-A, B), b = F(C, B);
      return { q: 'Write ' + M(stdEq(A, B, C)) + ' in slope-intercept form, ' + M('y = mx + b') + '.',
        steps: [
          { type: 'num', q: 'Subtract ' + M(A + 'x') + ' from both sides: ' + M(co(B, 'y', true) + ' = ▢x' + co(C, '', false)) + '. What goes in the box?', ans: [F(-A)], hint: 'The x-term changes sign when it moves to the other side.', why: M(co(B, 'y', true) + ' = ' + co(-A, 'x', true) + co(C, '', false)) + '.' },
          { type: 'num', final: 1, lab: 'm =', q: 'Divide every term by ' + ng(B) + '. What is the slope m?', ans: [m], hint: M(ng(-A) + ' ÷ ' + par(B)) + ' = ?', why: M(ng(-A) + ' ÷ ' + par(B) + ' = ' + fs(m)) + '.' },
          { type: 'num', final: 1, lab: 'b =', q: 'Keep dividing every term by ' + ng(B) + '. What is the y-intercept b?', ans: [b], hint: 'Divide the constant too: ' + M(ng(C) + ' ÷ ' + par(B)) + '.', why: M(ng(C) + ' ÷ ' + par(B) + ' = ' + fs(b)) + '. So ' + M(lineEq(m, b)) + '.' }
        ] };
    } };

  T.f2 = { name: 'Slope-intercept form to standard form', crit: 'convert',
    idea: 'To go from y = mx + b to <b>Ax + By = C</b>, move the x-term to the left side and make every number a whole number, with A not negative.',
    formula: '1) Fraction? Multiply every term by the denominator.  2) Move the x-term left.  3) A negative? Multiply every term by −1.',
    tips: ['Multiply <b>every</b> term, including y and b.', 'Example: y = (2/3)x − 1 → 3y = 2x − 3 → −2x + 3y = −3 → 2x − 3y = 3.'],
    gen: function (h) {
      var q = h ? pick([2, 3, 4, 5]) : 1, p = nz(-5, 5);
      if (h) while (gcd(p, q) !== 1) p = nz(-5, 5);
      var b = h && Math.random() < .5 ? F(ri(-9, 9), q) : F(ri(-6, 6)), m = F(p, q);
      var qb = fv(b) * q, A = -p, B = q, C = qb; if (A < 0) { A = -A; B = -B; C = -C; }
      var steps = [];
      if (q > 1) steps.push({ type: 'num', q: 'Multiply every term by ' + q + ' to clear the fraction: ' + M(q + 'y = ▢x' + co(qb, '', false)) + '. What goes in the box?', ans: [F(p)], hint: M('(' + fs(m) + ') × ' + q) + ' = ?', why: M(q + 'y = ' + co(p, 'x', true) + co(qb, '', false)) + '.' });
      steps.push({ type: 'num', q: 'Move the x-term to the left side: ' + M('▢x + ' + (q === 1 ? '' : q) + 'y = ' + ng(qb)) + '. What goes in the box?', ans: [F(-p)], hint: 'Subtract ' + M(co(p, 'x', true)) + ' from both sides: its sign changes.', why: M(co(-p, 'x', true) + ' + ' + (q === 1 ? '' : q) + 'y = ' + ng(qb)) + (-p < 0 ? '. A is negative, so multiply every term by −1.' : '. A is already positive.') });
      steps.push({ type: 'num', final: 1, labs: ['A =', 'B =', 'C ='], q: 'Write it as ' + M('Ax + By = C') + ' with whole numbers and A positive.', ans: [F(A), F(B), F(C)], at: stdEq(A, B, C),
        check: function (v) { if (!v[0] || !v[1] || !v[2] || v.some(function (f) { return f[1] !== 1; }) || v[0][0] <= 0) return false; var k = v[0][0] / A; return v[1][0] === k * B && v[2][0] === k * C; },
        hint: 'Use the equation from the last step; if A is negative, change every sign.', why: M(stdEq(A, B, C)) + '. Check: solving it for y gives back ' + M(lineEq(m, b)) + '.' });
      return { q: 'Write ' + M(lineEq(m, b)) + ' in standard form, ' + M('Ax + By = C') + '.', steps: steps };
    } };

  T.b1 = { name: 'Find b and write the equation', crit: 'represent',
    idea: '<b>b</b> is the y-intercept: where the line crosses the y-axis, the value of y when x = 0. When you cannot read it, work it out: find the slope m, put <b>one point</b> into y = mx + b, and solve for b. Then check with a second point.',
    formula: 'y = mx + b   →   b = y − m·x        (use any point (x, y) on the line)',
    tips: ['Do not use the point\'s y as b: that is only right when x = 0.', 'Multiply m·x first, then subtract it. Subtracting a negative is adding.', 'If a graph crosses between gridlines, b can be a fraction. Do not guess: calculate.', 'Check: put the other point into your equation.'],
    gen: function (h) {
      var kind = h ? pick([1, 2, 3, 3]) : pick([0, 0, 1, 2]), m, b, xs, ys, tries = 0, ok;
      function yAt(x) { return fv(m) * x + fv(b); }
      do {
        if (kind === 3) { m = F(pick([-3, -1, 1, 3]), 2); b = F(pick([-5, -3, -1, 1, 3, 5]), 2); var a = pick([-5, -3, -1, 1, 3]); xs = [a, a + pick([2, 4])]; }
        else {
          var half = h && Math.random() < .5;
          m = half ? F(pick([-3, -1, 1, 3]), 2) : F(nz(-4, 4)); b = F(ri(-8, 8));
          var st = half ? 2 : (kind === 2 || !h ? 1 : ri(1, 3)), x0 = kind === 2 ? (h ? ri(2, 4) : ri(1, 3)) * (half ? 2 : 1) : nz(-5, 5) * (half ? 2 : 1);
          xs = kind === 2 ? [x0, x0 + st, x0 + 2 * st, x0 + 3 * st] : [x0, x0 + st * ri(1, 3)];
        }
        ys = xs.map(yAt);
        ok = ys.every(function (y) { return Number.isInteger(y) && Math.abs(y) <= (kind === 3 ? 7 : 30); }) && xs.every(function (x) { return x !== 0 && Math.abs(x) <= (kind === 3 ? 7 : 12); });
      } while (!ok && ++tries < 80);
      if (!ok) { kind = 1; m = F(2); b = F(3); xs = [2, 4]; ys = [7, 11]; }
      var x1 = xs[0], y1 = ys[0], mx = F(m[0] * x1, m[1]), right = lineEq(m, b), q, fig = '', steps = [];
      function pf(f) { return f[0] < 0 ? '(' + fs(f) + ')' : fs(f); }
      function mStep(from) {
        var dx = xs[1] - xs[0], dy = ys[1] - ys[0];
        return { type: 'num', lab: 'm =', q: 'Find the slope first, ' + from + '.', ans: [m], hint: M('(' + ng(ys[1]) + ' − ' + par(ys[0]) + ') ÷ (' + ng(xs[1]) + ' − ' + par(xs[0]) + ')'), why: M('m = ' + ng(dy) + '/' + ng(dx) + ' = ' + fs(m)) + '.' };
      }
      if (kind === 0) q = 'A line has slope ' + M(fs(m)) + ' and passes through ' + M('(' + ng(x1) + ', ' + ng(y1) + ')') + '. Find b, then the equation.';
      if (kind === 1) { q = 'A line passes through ' + M('(' + ng(xs[0]) + ', ' + ng(ys[0]) + ')') + ' and ' + M('(' + ng(xs[1]) + ', ' + ng(ys[1]) + ')') + '. Find b, then the equation.'; steps.push(mStep('from the two points')); }
      if (kind === 2) { fig = table(xs, ys); q = 'This table is linear, but x = 0 is not in it. Find b, then the equation.'; steps.push(mStep('from the first two rows')); }
      if (kind === 3) { fig = graph({ lines: [{ m: m, b: b }], pts: [{ x: xs[0], y: ys[0], label: '(' + ng(xs[0]) + ', ' + ng(ys[0]) + ')' }, { x: xs[1], y: ys[1], label: '(' + ng(xs[1]) + ', ' + ng(ys[1]) + ')' }] }); q = 'The line crosses the y-axis between gridlines, so you cannot read b. Use the two marked points to find b, then the equation.'; steps.push(mStep('from the two marked points')); }
      steps.push({ type: 'num', q: 'Put ' + M('(' + ng(x1) + ', ' + ng(y1) + ')') + ' into y = mx + b: ' + M(ng(y1) + ' = ' + pf(m) + '(' + ng(x1) + ') + b') + '. What is ' + M(pf(m) + ' × ' + par(x1)) + '?', ans: [mx], hint: (m[0] < 0) !== (x1 < 0) ? 'One number is negative, so the answer is negative.' : (x1 < 0 ? 'Negative × negative is positive.' : 'Multiply the slope by the x-value.'), why: M(pf(m) + ' × ' + par(x1) + ' = ' + fs(mx)) + ', so ' + M(ng(y1) + ' = ' + fs(mx) + ' + b') + '.' });
      steps.push({ type: 'num', final: 1, lab: 'b =', q: 'Solve for b: ' + M('b = ' + ng(y1) + ' − ' + pf(mx)) + '. What is b?', ans: [b], hint: mx[0] < 0 ? 'Subtracting a negative is adding: ' + M(ng(y1) + ' + ' + fs(F(-mx[0], mx[1]))) + '.' : M(ng(y1) + ' − ' + fs(mx)) + ' = ?', why: M('b = ' + ng(y1) + ' − ' + pf(mx) + ' = ' + fs(b)) + '. The line crosses the y-axis at ' + M('(0, ' + fs(b) + ')') + '.' });
      var chk = kind === 0 ? 'Check: ' + M(pf(m) + '(' + ng(x1) + ') + ' + pf(b) + ' = ' + ng(y1)) + ' ✓' : 'Check with the other point: ' + M(pf(m) + '(' + ng(xs[1]) + ') + ' + pf(b) + ' = ' + ng(ys[1])) + ' ✓';
      var wrong = [lineEq(m, F(y1)), lineEq(m, F(-b[0], b[1])), lineEq(m, F(y1 * mx[1] + mx[0], mx[1])), lineEq(b[0] ? b : F(1), m)];
      steps.push(mc('Which equation is the line?', right, wrong, { final: 1, hint: 'Slope ' + fs(m) + ', y-intercept ' + fs(b) + '.', why: M(right) + '. ' + chk }));
      return { q: q, fig: fig, steps: steps };
    } };

  T.r1 = { name: 'Model a story with an equation and solve', crit: 'represent',
    idea: 'Most linear stories have a <b>starting amount</b> (b, the value when x = 0) and a <b>rate</b> (m, the change for each 1 of x). Write y = mx + b, then put in what you know and solve for the unknown.',
    formula: 'y = (rate)·x + (start)        to solve: undo the + b first, then divide by m',
    tips: ['If the amount goes <b>down</b> over time, the slope is negative.', 'If you are given two data points instead, find the rate with the slope formula, then b.'],
    gen: function (h) {
      var s = story(), c = s.c, k, total, tries = 0;
      do { k = ri(3, 12); total = s.S + s.m * k; } while (total <= 0 && ++tries < 40);
      if (total <= 0) { k = 1; total = s.S + s.m; }
      var steps = [], q;
      if (!h) {
        q = s.text + ' Let x be the number of ' + c.xs + ' and y be the ' + c.y + '. After how many ' + c.xs + ' is the ' + c.y + ' ' + s.val(total) + '?';
        steps.push({ type: 'num', final: 1, lab: 'm =', q: 'What is the rate of change (slope) m?', ans: [F(s.m)], hint: 'How much does the ' + c.y + ' change each ' + c.x + '? Up or down?', why: 'It changes by ' + s.R + ' each ' + c.x + (c.dir < 0 ? ' and goes <b>down</b>, so m = ' + ng(s.m) + '.' : ' and goes up, so m = ' + s.m + '.') });
        steps.push({ type: 'num', final: 1, lab: 'b =', q: 'What is the starting amount (y-intercept) b?', ans: [F(s.S)], hint: 'What is the ' + c.y + ' at 0 ' + c.xs + '?', why: 'At 0 ' + c.xs + ' the ' + c.y + ' is ' + s.val(s.S) + ', so b = ' + s.S + '. The model is ' + M(lineEq(F(s.m), F(s.S))) + '.' });
      } else {
        var a = ri(1, 3), d = a + ri(2, 4), va = s.S + s.m * a, vb = s.S + s.m * d;
        if (va <= 0 || vb <= 0) { a = 1; d = 2; va = s.S + s.m; vb = s.S + 2 * s.m; }
        q = c.intro + ' After ' + a + ' ' + (a === 1 ? c.x : c.xs) + ' the ' + c.y + ' is ' + s.val(va) + '. After ' + d + ' ' + c.xs + ' it is ' + s.val(vb) + '. Let x be the number of ' + c.xs + '. After how many ' + c.xs + ' is the ' + c.y + ' ' + s.val(total) + '?';
        steps.push({ type: 'num', final: 1, lab: 'm =', q: 'Use the two data points (' + a + ', ' + va + ') and (' + d + ', ' + vb + '). What is the slope m?', ans: [F(s.m)], hint: M('(' + vb + ' − ' + va + ') ÷ (' + d + ' − ' + a + ')'), why: M('(' + vb + ' − ' + va + ') ÷ (' + d + ' − ' + a + ') = ' + ng(vb - va) + '/' + (d - a) + ' = ' + ng(s.m)) + '.' });
        steps.push({ type: 'num', final: 1, lab: 'b =', q: 'Put one point into y = mx + b: ' + M(va + ' = ' + ng(s.m) + '(' + a + ') + b') + '. What is b?', ans: [F(s.S)], hint: M(ng(s.m) + ' × ' + a + ' = ' + ng(s.m * a)) + ', then solve for b.', why: M(va + ' = ' + ng(s.m * a) + ' + b') + ', so ' + M('b = ' + va + ' − ' + par(s.m * a) + ' = ' + s.S) + '. The model is ' + M(lineEq(F(s.m), F(s.S))) + '.' });
      }
      steps.push({ type: 'num', q: 'Set up ' + M(total + ' = ' + co(s.m, 'x', true) + ' + ' + s.S) + '. Subtract ' + s.S + ' from both sides: ' + M('▢ = ' + co(s.m, 'x', true)) + '. What goes in the box?', ans: [F(total - s.S)], hint: M(total + ' − ' + s.S) + ' = ?', why: M(total + ' − ' + s.S + ' = ' + ng(total - s.S)) + ', so ' + M(ng(total - s.S) + ' = ' + co(s.m, 'x', true)) + '.' });
      steps.push({ type: 'num', final: 1, lab: 'x =', q: 'Divide both sides by ' + ng(s.m) + '. How many ' + c.xs + '?', ans: [F(k)], hint: M(ng(total - s.S) + ' ÷ ' + par(s.m)) + ' = ?', why: M(ng(total - s.S) + ' ÷ ' + par(s.m) + ' = ' + k) + '. After ' + k + ' ' + c.xs + ' the ' + c.y + ' is ' + s.val(total) + '. Check: ' + M(ng(s.m) + '(' + k + ') + ' + s.S + ' = ' + total) + ' ✓' });
      return { q: q, steps: steps };
    } };

  T.r2 = { name: 'Graph a line from its equation', crit: 'represent',
    idea: 'To graph y = mx + b, plot the <b>y-intercept</b> (0, b). From there use the slope as <b>rise over run</b> to plot a second point, then join them.',
    formula: 'start at (0, b)  →  move up m₁ and right m₂ (for m = m₁/m₂)  →  plot  →  draw the line',
    tips: ['For a negative slope, move <b>down</b> and right.', 'A whole-number slope like 3 is 3/1: up 3, right 1.', 'In standard form, convert to y = mx + b first.'],
    gen: function (h) {
      var q = pick([1, 1, 2, 3]), p = nz(-3, 3), b = ri(-4, 4), m = F(p, q), eq, steps = [];
      if (q > 1) while (gcd(p, q) !== 1) p = nz(-3, 3);
      m = F(p, q);
      if (h && m[1] === 1) {
        var Bc = pick([1, 2, -1, -2, 3]), A = -m[0] * Bc, C = b * Bc; if (A < 0) { A = -A; Bc = -Bc; C = -C; }
        eq = stdEq(A, Bc, C);
        steps.push({ type: 'num', final: 0, lab: 'm =', q: 'Get y alone first. What is the slope m?', ans: [m], hint: 'Subtract the x-term, then divide every term by ' + ng(Bc) + '.', why: 'Solving for y gives ' + M(lineEq(m, F(b))) + ', so m = ' + fs(m) + '.' });
      } else eq = lineEq(m, F(b));
      steps.push({ type: 'num', lab: 'b =', q: 'Where does the line cross the y-axis? b = ?', ans: [F(b)], hint: h && eq.indexOf('y =') ? 'Use y = mx + b from the last step.' : 'b is the number on its own.', why: 'The y-intercept is ' + M('(0, ' + ng(b) + ')') + '.' });
      steps.push({ type: 'graph', final: 1, line: { m: m, b: F(b) }, q: 'Click two points on the line: start at ' + (h ? 'the y-intercept' : M('(0, ' + ng(b) + ')')) + ', then use the slope.', hint: 'From (0, ' + ng(b) + ') move ' + (p > 0 ? 'up ' : 'down ') + Math.abs(p) + ' and right ' + q + ' to ' + M('(' + q + ', ' + ng(b + p) + ')') + '.', at: 'a line through (0, ' + ng(b) + ') and (' + q + ', ' + ng(b + p) + ')',
        why: 'Start at ' + M('(0, ' + ng(b) + ')') + '. Slope ' + fs(m) + ' means ' + (p > 0 ? 'up ' : 'down ') + Math.abs(p) + ', right ' + q + ', which lands on ' + M('(' + q + ', ' + ng(b + p) + ')') + '.' + graph({ lines: [{ m: m, b: F(b) }], pts: [{ x: 0, y: b }, { x: q, y: b + p }] }) });
      return { q: 'Graph ' + M(eq) + '.', steps: steps };
    } };

  T.r3 = { name: 'Inequalities: write, solve and graph', crit: 'represent',
    idea: 'An inequality has many solutions, so its graph is a shaded region. The boundary line is <b>solid</b> for ≤ or ≥ (points on the line count) and <b>dashed</b> for < or >. Shade <b>above</b> for y > or y ≥ and <b>below</b> for y < or y ≤.',
    formula: '"at most", "no more than" → ≤        "at least", "no less than" → ≥',
    tips: ['Check your shading with a test point like (0, 0): if it makes the inequality true, it should be shaded.', 'In word problems, the answer is often a whole number: round to what makes sense.'],
    gen: function (h) {
      if (Math.random() < .5) {
        var op = pick(['<', '≤', '>', '≥']), m = h ? F(nz(-3, 3), pick([2, 3])) : F(nz(-3, 3)), b = nz(-4, 4);
        var solid = op === '≤' || op === '≥', above = op === '>' || op === '≥', zeroOk = op === '<' ? 0 < b : op === '≤' ? 0 <= b : op === '>' ? 0 > b : 0 >= b;
        var eq = 'y ' + op + ' ' + (co(m, 'x', true) + co(b, '', false));
        var pic = graph({ lines: [{ m: m, b: F(b), dash: !solid }], shade: [{ m: m, b: F(b), dir: above ? 1 : -1 }], pts: [{ x: 0, y: 0, u: 1, label: '(0, 0)' }] });
        return { q: 'Graph the inequality ' + M(eq) + '.', fig: graph({ lines: [{ m: m, b: F(b), grey: 1 }], aria: 'The boundary line, not yet styled' }),
          steps: [
            { type: 'mc', final: 1, q: 'Should the boundary line be solid or dashed?', choices: ['Solid', 'Dashed'], ans: solid ? 0 : 1, hint: 'Does the symbol ' + op + ' include "or equal to"?', why: op + (solid ? ' includes "or equal to", so points on the line are solutions: <b>solid</b>.' : ' does not include "or equal to", so points on the line are not solutions: <b>dashed</b>.') },
            { type: 'mc', q: 'Test the point (0, 0): is ' + M('0 ' + op + ' ' + ng(b)) + ' true?', choices: ['Yes, (0, 0) is a solution', 'No, (0, 0) is not a solution'], ans: zeroOk ? 0 : 1, hint: 'Put x = 0 and y = 0 in: ' + M('0 ' + op + ' ' + co(m, '·0', true) + co(b, '', false)) + '.', why: M('0 ' + op + ' ' + ng(b)) + ' is ' + (zeroOk ? 'true' : 'false') + ', so the side with (0, 0) is ' + (zeroOk ? '' : '<b>not</b> ') + 'shaded.' },
            { type: 'mc', final: 1, q: 'Which side do you shade?', choices: ['Above the line', 'Below the line'], ans: above ? 0 : 1, hint: 'y ' + op + ' … means y-values ' + (above ? 'greater' : 'less') + ' than the line.', why: 'y ' + op + ' … means y is ' + (above ? 'greater than' : 'less than') + ' the line, so shade <b>' + (above ? 'above' : 'below') + '</b>. The (0, 0) test agrees.' + pic }
          ] };
      }
      var S, Rt, n, rem, B, sym, txt, eqs, lim, ans, xs;
      if (Math.random() < .5) {
        S = pick([5, 8, 10, 12, 15]); Rt = pick([2, 3, 4, 5, 6]); n = ri(4, 12); rem = h ? ri(1, Rt - 1) : 0; B = S + Rt * n + rem;
        txt = 'You have $' + B + ' to spend at the Sandy Flats fair. Entry costs $' + S + ' and each ride costs $' + Rt + '. Let x be the number of rides.';
        sym = '≤'; ans = n; lim = F(B - S, Rt); xs = 'What is the greatest number of rides you can take?';
      } else {
        S = pick([10, 20, 25, 40]); Rt = pick([5, 6, 8, 12, 15]); n = ri(4, 12); rem = h ? ri(1, Rt - 1) : 0; B = S + Rt * n - rem;
        txt = 'You need at least ' + B + ' points to unlock the next floor. You already have ' + S + ' points and earn ' + Rt + ' points for every puzzle. Let x be the number of puzzles.';
        sym = '≥'; ans = n; lim = F(B - S, Rt); xs = 'What is the least number of puzzles you must solve?';
      }
      var e = function (o) { return S + ' + ' + Rt + 'x ' + o + ' ' + B; };
      return { q: txt + ' ' + xs, steps: [
        mc('Which inequality models the situation?', e(sym), [e(sym === '≤' ? '≥' : '≤'), e(sym === '≤' ? '<' : '>'), e(sym === '≤' ? '>' : '<')], { final: 1, hint: sym === '≤' ? 'You can spend up to $' + B + ', including exactly $' + B + '.' : '"At least" means ' + B + ' or more.', why: (sym === '≤' ? 'Total spent (entry + rides) is at most ' + B + ': ' : 'Total points must be at least ' + B + ': ') + M(e(sym)) + '.' }),
        { type: 'num', lab: 'x ' + sym, q: 'Solve: subtract ' + S + ', then divide by ' + Rt + '. ' + M('x ' + sym + ' ▢'), ans: [lim], hint: M('(' + B + ' − ' + S + ') ÷ ' + Rt), why: M(Rt + 'x ' + sym + ' ' + (B - S)) + ', so ' + M('x ' + sym + ' ' + fs(lim)) + (lim[1] > 1 ? ' (about ' + (fv(lim)).toFixed(2) + ').' : '.') },
        { type: 'num', final: 1, lab: 'x =', q: xs + ' (a whole number)', ans: [F(ans)], hint: sym === '≤' ? 'You can\'t take part of a ride: round <b>down</b>.' : 'You can\'t solve part of a puzzle: round <b>up</b>.', why: lim[1] === 1 ? 'x ' + sym + ' ' + ans + ', so the answer is ' + ans + '.' : (sym === '≤' ? 'x must be at most ' + fv(lim).toFixed(2) + ', so round down to <b>' + ans + '</b>. ' + (ans + 1) + ' would cost too much.' : 'x must be at least ' + fv(lim).toFixed(2) + ', so round up to <b>' + ans + '</b>. ' + (ans - 1) + ' would not be enough.') }
      ] };
    } };

  T.r4 = { name: 'Match words, tables, graphs and equations', crit: 'represent',
    idea: 'The same line can be shown four ways: words, a table, a graph and an equation. To translate between them, find the two key numbers in each one: the <b>slope</b> (rate) and the <b>y-intercept</b> (start).',
    formula: 'words: "starts at …, changes by … each …"   table: y when x = 0, and the change per step   graph: where it crosses the y-axis, rise ÷ run',
    tips: ['If the table does not show x = 0, work backwards using the slope.', 'Watch for swapped numbers: y = 3x + 2 and y = 2x + 3 are different lines.'],
    gen: function (h) {
      var kind = ri(0, 2), m, b, fig = '', q, s;
      if (kind === 2) { s = story(); m = F(s.m); b = F(s.S); q = s.text + ' Let x be the number of ' + s.c.xs + ' and y be the ' + s.c.y + '. Which equation matches?'; }
      else { m = Math.random() < .7 ? F(nz(-4, 4)) : F(nz(-3, 3), 2); b = F(ri(-5, 5)); }
      if (kind === 0) {
        var st = h ? 2 : 1, x0 = h ? ri(1, 3) : 0, xs = [], ys = [], i;
        if (m[1] === 2) { st = 2; if (x0 % 2) x0++; }   // half slopes: even x-values keep every y whole
        for (i = 0; i < 4; i++) { xs.push(x0 + i * st); ys.push(fv(m) * (x0 + i * st) + fv(b)); }
        fig = table(xs, ys); q = 'Which equation matches the table?';
      }
      if (kind === 1) { fig = graph({ lines: [{ m: m, b: b }], pts: [{ x: 0, y: fv(b) }, { x: m[1], y: fv(b) + m[0] }] }); q = 'Which equation matches the graph?'; }
      var right = lineEq(m, b), recip = m[0] ? F(m[1], m[0]) : F(1);
      var wrong = [lineEq(b[0] ? b : F(1), m), lineEq(F(-m[0], m[1]), b), lineEq(m, F(-b[0] || 2)), lineEq(recip, b), lineEq(F(m[0] + 1, m[1]), b)];
      if (h && m[1] === 1) { var Bc = m[0] > 0 ? -1 : 1, A = -m[0] * Bc, C = fv(b) * Bc; right = stdEq(A, Bc, C); wrong = [stdEq(A, -Bc, C), stdEq(A, Bc, -C || 3), lineEq(F(-m[0]), b), lineEq(b[0] ? b : F(2), m)]; }
      var steps = [
        { type: 'num', lab: 'm =', q: 'What is the slope (rate of change)?', ans: [m], hint: kind === 2 ? 'How much does y change for each 1 of x? Up or down?' : 'Change in y ÷ change in x between two ' + (kind === 0 ? 'rows' : 'points') + '.', why: 'The slope is ' + M(fs(m)) + '.' },
        { type: 'num', lab: 'b =', q: 'What is the y-intercept (the value of y when x = 0)?', ans: [b], hint: kind === 0 && h ? 'x = 0 is not in the table: step backwards from the first row using the slope.' : 'Where does it start, or cross the y-axis?', why: 'When x = 0, y = ' + M(fs(b)) + '.' },
        mc(q, right, wrong, { final: 1, hint: 'Find the equation with slope ' + fs(m) + ' and y-intercept ' + fs(b) + (h ? ' (it may be in standard form: solve it for y to check).' : '.'), why: M(right) + ' has slope ' + fs(m) + ' and y-intercept ' + fs(b) + (right.indexOf('y =') ? ' (solve it for y: ' + M(lineEq(m, b)) + ').' : '.') })
      ];
      return { q: kind === 2 ? q : q.replace('Which', 'Find the slope and y-intercept. Which'), fig: fig, steps: steps };
    } };

  T.e1 = { name: 'Explain what slope and y-intercept mean', crit: 'explain',
    idea: 'In a real situation, the <b>slope</b> is a rate: how much y changes for each 1 of x, with units (dollars per month). The <b>y-intercept</b> is the starting value: y when x = 0. A strong explanation names both quantities and their units.',
    formula: 'Slope: "For every 1 [x unit], the [y] goes up/down by [m] [y units]."   Intercept: "At 0 [x units], the [y] is [b]."',
    tips: ['Say up or down: a negative slope means the quantity decreases.', 'Always include units: "$12 per month", not just "12".'],
    gen: function (h) {
      var s = story(), c = s.c, up = c.dir > 0, eq = lineEq(F(s.m), F(s.S));
      var q = s.text + ' The equation ' + M(eq) + ' models it, where x is the number of ' + c.xs + ' and y is the ' + c.y + '.';
      var steps = [
        mc('What does the slope, ' + ng(s.m) + ', mean?', 'The ' + c.y + ' goes ' + (up ? 'up' : 'down') + ' by ' + s.val(s.R) + ' every ' + c.x + '.', ['The ' + c.y + ' starts at ' + s.val(s.R) + '.', 'The ' + c.y + ' goes ' + (up ? 'down' : 'up') + ' by ' + s.val(s.R) + ' every ' + c.x + '.', 'After ' + s.R + ' ' + c.xs + ', the ' + c.y + ' is ' + s.val(s.S) + '.'], { final: 1, hint: 'Slope is a rate: change in y for each 1 of x. Is the ' + c.y + ' increasing or decreasing?', why: 'The slope is the rate of change: ' + s.val(s.R) + ' per ' + c.x + (up ? ', increasing.' : ', and the negative sign means decreasing.') }),
        mc('What does the y-intercept, ' + s.S + ', mean?', 'At the start (0 ' + c.xs + '), the ' + c.y + ' is ' + s.val(s.S) + '.', ['The ' + c.y + ' changes by ' + s.val(s.S) + ' every ' + c.x + '.', 'After 1 ' + c.x + ', the ' + c.y + ' is ' + s.val(s.S) + '.', 'It takes ' + s.S + ' ' + c.xs + ' to finish.'], { final: 1, hint: 'The y-intercept is the value of y when x = 0.', why: 'When x = 0 there have been no ' + c.xs + ' yet, so ' + s.val(s.S) + ' is the starting ' + c.y + '.' }),
        { type: 'frame', final: 1, q: 'Build the explanation of the slope:', parts: ['For every 1 ', { o: shuffle([c.x, 'dollar', c.y]), a: c.x }, ', the ' + c.y + ' ', { o: ['goes up', 'goes down'], a: up ? 'goes up' : 'goes down' }, ' by ', { o: shuffle([String(s.R), String(s.S), String(s.R + s.S)]), a: String(s.R) }, ' ', { o: shuffle(uniq([s.u, c.xs, 'per cent'])), a: s.u }, '.'],
          hint: 'x is the ' + c.x + ' count; the slope number has the units of y.', why: '“For every 1 ' + c.x + ', the ' + c.y + ' ' + (up ? 'goes up' : 'goes down') + ' by ' + s.R + ' ' + s.u + '.” This names both quantities, the direction and the units.' }
      ];
      if (h) {
        var N = ri(4, 9), v = s.S + s.m * N;
        while (v < 0) { N--; v = s.S + s.m * N; }
        steps.push({ type: 'num', final: 1, lab: 'y =', q: 'Use the model: what is the ' + c.y + ' after ' + N + ' ' + c.xs + '? (number only)', ans: [F(v)], hint: 'Put x = ' + N + ' into ' + M(eq) + '.', why: M(ng(s.m) + '(' + N + ') + ' + s.S + ' = ' + ng(v)) + ', so the ' + c.y + ' is ' + s.val(v) + '.' });
      }
      return { q: q, steps: steps };
    } };
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  T.e2 = { name: 'Find and fix the mistake', crit: 'explain',
    idea: 'Checking work is part of reasoning. Read each step and ask: is this step true? Most mistakes are one of a few slips: slope upside down, subtracting a negative, mixed order of subtraction, or dividing only part of an equation.',
    formula: 'Check each step on its own.  Name the error.  Fix it and verify.',
    tips: ['Verify a slope by checking that both points fit your final equation.', 'Verify a conversion by solving back the other way.'],
    gen: function (h) {
      var REASONS = {
        flip: 'He divided the change in x by the change in y. Slope is change in y ÷ change in x.',
        neg: 'He subtracted a negative wrongly. Subtracting a negative means adding.',
        order: 'He subtracted the x-values in the opposite order from the y-values.',
        part: 'He divided only the x-term by B. Every term, including C, must be divided.',
        sign: 'When he moved the x-term to the other side he did not change its sign.'
      };
      var kind = pick(h ? ['neg', 'order', 'part', 'sign'] : ['flip', 'neg', 'order', 'part', 'sign']), work, wrongStep, ansF, ask, x1, y1, x2, y2, dy, dx;
      function pts() { do { x1 = ri(-5, 3); x2 = x1 + ri(1, 5); y1 = ri(-6, 6); y2 = ri(-6, 7); dy = y2 - y1; dx = x2 - x1; } while (!dy || Math.abs(dy) === Math.abs(dx)); }
      var q;
      if (kind === 'flip' || kind === 'order' || kind === 'neg') {
        pts();
        if (kind === 'neg') { while (y1 >= 0 || !dy) { y1 = ri(-7, -1); dy = y2 - y1; } }
        q = 'Marcus found the slope through ' + M('(' + ng(x1) + ', ' + ng(y1) + ')') + ' and ' + M('(' + ng(x2) + ', ' + ng(y2) + ')') + '.';
        if (kind === 'flip') { work = ['Change in y = ' + ng(y2) + ' − ' + par(y1) + ' = ' + ng(dy), 'Change in x = ' + ng(x2) + ' − ' + par(x1) + ' = ' + ng(dx), 'm = ' + ng(dx) + '/' + ng(dy) + ' = ' + fs(F(dx, dy))]; wrongStep = 2; }
        if (kind === 'order') { work = ['Change in y = ' + ng(y2) + ' − ' + par(y1) + ' = ' + ng(dy), 'Change in x = ' + ng(x1) + ' − ' + par(x2) + ' = ' + ng(-dx), 'm = ' + ng(dy) + '/' + ng(-dx) + ' = ' + fs(F(dy, -dx))]; wrongStep = 1; }
        if (kind === 'neg') { var bad = y2 + y1; work = ['Change in y = ' + ng(y2) + ' − ' + par(y1) + ' = ' + ng(bad), 'Change in x = ' + ng(x2) + ' − ' + par(x1) + ' = ' + ng(dx), 'm = ' + ng(bad) + '/' + ng(dx) + ' = ' + fs(F(bad, dx))]; wrongStep = 0; if (bad === dy) { work[0] = 'Change in y = ' + ng(y2) + ' − ' + par(y1) + ' = ' + ng(y2 - 1 + y1); } }
        ansF = F(dy, dx); ask = 'What is the correct slope?';
      } else {
        var A = ri(1, 6), B = pick([2, 3, 4, 5]), C = B * nz(-5, 5);
        if (A % B === 0) A++;
        q = 'Marcus wrote ' + M(stdEq(A, B, C)) + ' in slope-intercept form.';
        if (kind === 'part') { work = [B + 'y = ' + co(-A, 'x', true) + co(C, '', false), 'y = ' + co(F(-A, B), 'x', true) + co(C, '', false), 'So m = ' + fs(F(-A, B)) + ' and b = ' + ng(C)]; wrongStep = 1; ansF = F(C, B); ask = 'What is the correct y-intercept b?'; }
        else { work = [B + 'y = ' + co(A, 'x', true) + co(C, '', false), 'y = ' + co(F(A, B), 'x', true) + co(F(C, B), '', false), 'So m = ' + fs(F(A, B)) + ' and b = ' + fs(F(C, B))]; wrongStep = 0; ansF = F(-A, B); ask = 'What is the correct slope m?'; }
      }
      var fig = '<ol class="work">' + work.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ol>';
      var others = Object.keys(REASONS).filter(function (k) { return k !== kind; }).map(function (k) { return REASONS[k]; });
      return { q: q + ' His work is below, and it has one mistake.', fig: fig, steps: [
        { type: 'mc', final: 1, q: 'Which step has the mistake?', choices: ['Step 1', 'Step 2', 'Step 3'], ans: wrongStep, hint: 'Redo each step yourself and compare.', why: 'Step ' + (wrongStep + 1) + ' is where it goes wrong: ' + M(work[wrongStep]) + '. Every step after it uses the wrong number.' },
        mc('What went wrong?', REASONS[kind], shuffle(others).slice(0, 3), { final: 1, hint: 'Look closely at the signs and at what is on top and bottom.', why: REASONS[kind] }),
        { type: 'num', final: 1, lab: kind === 'part' ? 'b =' : 'm =', q: ask, ans: [ansF], hint: kind === 'part' ? M(ng(C) + ' ÷ ' + B) : kind === 'sign' ? 'Slope = −A ÷ B.' : M('(' + ng(y2) + ' − ' + par(y1) + ') ÷ (' + ng(x2) + ' − ' + par(x1) + ')'), why: 'The correct value is ' + M(fs(ansF)) + '.' }
      ] };
    } };

  // Khan Academy videos for students who are stuck (short links, checked 18 Nov 2026: each opens the named video)
  var KA = 'https://www.khanacademy.org/v/';
  var VIDS = {
    s1: [['Worked example: slope from two points', 'slope-of-a-line-2']],
    s2: [['Calculating slope from tables', 'slope-from-table']],
    s3: [['Finding slope from a graph', 'slope-of-a-line']],
    s4: [['Slope and y-intercept from an equation', 'less-obvious-slope-intercept-form'], ['Converting to slope-intercept form', 'converting-to-slope-intercept-form']],
    f1: [['Converting to slope-intercept form', 'converting-to-slope-intercept-form'], ['Intro to standard form', 'standard-form-for-linear-equations']],
    f2: [['Converting from slope-intercept to standard form', 'converting-from-slope-intercept-to-standard-form'], ['Intro to standard form', 'standard-form-for-linear-equations']],
    b1: [['Find b from the slope and a point', 'linear-equations-in-slope-intercept-form'], ['Find b from two points', 'equation-of-a-line-3']],
    r1: [['Writing a linear equation from a story and a table', 'writing-linear-equations-in-two-variables-given-a-table'], ['Slope and intercept meaning in context', 'slope-intercept-meaning']],
    r2: [['Graph from a slope-intercept equation', 'graphing-a-line-in-slope-intercept-form']],
    r3: [['Intro to graphing two-variable inequalities', 'graphing-inequalities'], ['Inequality word problem', 'inequalities']],
    r4: [['Slope-intercept form from a table', 'slope-intercept-form-from-table'], ['Finding slope from a graph', 'slope-of-a-line']],
    e1: [['Slope and intercept meaning in context', 'slope-intercept-meaning'], ['Linear graphs word problem: cats', 'interpreting-features-of-linear-functions-example']],
    e2: [['Worked example: slope from two points', 'slope-of-a-line-2'], ['Converting to slope-intercept form', 'converting-to-slope-intercept-form']]
  };
  function vidBox(id, lead) {
    var v = VIDS[id]; if (!v) return null;
    var b = el('div', { 'class': 'khan' }, [el('b', { text: lead || '🎬 Stuck? Watch a short Khan Academy video:' })]);
    var ul = el('ul', {}); v.forEach(function (x) { ul.appendChild(el('li', {}, [el('a', { href: KA + x[1], target: '_blank', rel: 'noopener', text: x[0] })])); });
    b.appendChild(ul); return b;
  }

  var CRIT = [
    { id: 'compute', name: 'Compute slope from tables, equations, graphs and ordered pairs', strand: 'C1 · Concepts and Procedures', topics: ['s1', 's2', 's3', 's4'] },
    { id: 'convert', name: 'Convert between standard form and slope-intercept form', strand: 'C1 · Concepts and Procedures', topics: ['f1', 'f2'] },
    { id: 'represent', name: 'Represent scenarios graphically, with equations and with words', strand: 'C3 · Problem Solving', topics: ['b1', 'r1', 'r2', 'r3', 'r4'] },
    { id: 'explain', name: 'Explain reasoning', strand: 'C2 · Communicating Reasoning', topics: ['e1', 'e2'] }
  ];
  var ORDER = []; CRIT.forEach(function (c) { ORDER = ORDER.concat(c.topics); });
  var LV = ['Not started', 'Limited', 'Emerging', 'Developed', 'Deep'];

  /* ---------------- progress and mastery ---------------- */
  var P = SFA.store.get(KEY, null);
  if (!P || !P.t) P = { v: 1, t: {} };
  function st(id) { return P.t[id] || (P.t[id] = { g: 0, h: [], s: 0, n: 0, dev: 0, rv: 0 }); }
  function lvl(id) {
    var t = P.t[id]; if (!t || (!t.n && !t.g && !t.tried)) return 0;
    var last = t.h.slice(-4), right = last.reduce(function (a, b) { return a + b; }, 0), all = t.h.reduce(function (a, b) { return a + b; }, 0);
    if (t.dev || (last.length >= 3 && right >= 3)) return t.s >= 2 ? 4 : 3;
    if ((t.g >= 1 && all >= 1) || all >= 2) return 2;
    return 1;
  }
  function critLvl(c) { return Math.min.apply(null, c.topics.map(lvl)); }
  // how much practice a skill record holds (more = newer, when two tabs or computers disagree)
  function work(t) { return t ? (t.n || 0) + (t.g || 0) + (t.s || 0) + (t.tried ? 1 : 0) : -1; }
  // another tab of the review (opened twice from a lesson) may have saved since this one loaded: keep its newer skills
  function mergeStored() {
    var S = SFA.store.get(KEY, null); if (!S || !S.t || S === P) return false;
    var changed = false;
    Object.keys(S.t).forEach(function (id) { if (work(S.t[id]) > work(P.t[id])) { P.t[id] = S.t[id]; changed = true; } });
    return changed;
  }
  // every level on screen (the skill's badge, the progress line, the home tiles) follows the saved progress
  function refreshLevels() {
    if (view.at === 'home') { var y = window.scrollY; draw(); window.scrollTo(0, y); return; }
    if (view.at !== 'topic') return;
    var L = lvl(view.id), old = app.querySelector('.tophead .badge'); if (old) old.parentNode.replaceChild(badge(L), old);
    var note = app.querySelector('.deepnote'); if (L >= 4 && !note) { var h = app.querySelector('.tophead'); if (h) h.parentNode.insertBefore(deepNote(view.id), h.nextSibling.nextSibling); }
  }
  function save() {
    mergeStored();
    SFA.store.set(KEY, P);
    refreshLevels();
    if (!SFA.sync || !SFA.sync.on) return;
    var levels = ORDER.map(function (id) { var L = lvl(id); return { id: id, tier: ['none', 'limited', 'emerging', 'devel', 'deep'][L], name: T[id].name, done: L >= 3, skipped: false }; });
    var dn = levels.filter(function (L) { return L.done; }).length, deep = ORDER.every(function (id) { return lvl(id) === 4; });
    SFA.sync.report(KEY, P, { levels: levels, levelsDone: dn, levelsTotal: ORDER.length, coreDone: dn, coreTotal: ORDER.length, standard: dn === ORDER.length, specials: deep ? ['Deep on every skill'] : [], assisted: ORDER.reduce(function (a, id) { return a + ((P.t[id] || {}).rv || 0); }, 0), tickets: 0 });
  }

  /* ---------------- answer widgets ---------------- */
  function diag(v, a) {
    if (!v || !a) return 'Type a number, a fraction like −3/4, or a decimal.';
    if (feq(v, F(-a[0], a[1]))) return 'Close: check the sign.';
    if (a[0] && feq(v, F(a[1], a[0]))) return 'That is upside down: change in y goes on top.';
    if (a[0] && feq(v, F(-a[1], a[0]))) return 'Upside down and the wrong sign: change in y goes on top.';
    return 'Not quite.';
  }
  // builds the input for one step; returns { node, read, check, feedback, lock, reveal }
  function widget(s) {
    var box = el('div', {}), w = { node: box };
    if (s.type === 'num') {
      var labs = s.labs || [s.lab || 'Answer'], ins = labs.map(function (L) { var i = el('input', { type: 'text', inputmode: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': L }); return i; });
      box.appendChild(el('div', { 'class': 'inrow' }, labs.map(function (L, i) { return el('label', {}, [L, ins[i]]); })));
      w.read = function () { return ins.map(function (i) { return parse(i.value); }); };
      w.check = function (v) { if (s.check) return s.check(v); return v.every(function (f, i) { return f && feq(f, s.ans[i]); }); };
      w.feedback = function (v) { if (v.some(function (f) { return !f; })) return 'Type a number, a fraction like −3/4, or a decimal.'; return s.ans.length === 1 ? diag(v[0], s.ans[0]) : 'Not quite. Check each number.'; };
      w.lock = function () { ins.forEach(function (i) { i.disabled = true; }); };
      w.focus = function () { ins[0].focus(); };
      w.enter = ins;
    } else if (s.type === 'mc') {
      var sel = -1, bs = s.choices.map(function (c, i) { return el('button', { type: 'button', 'aria-pressed': 'false', onclick: function () { if (box.dataset.locked) return; sel = i; bs.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); } }); });
      bs.forEach(function (b, i) { b.innerHTML = s.choices[i]; });
      box.appendChild(el('div', { 'class': 'mcs' }, bs));
      w.read = function () { return sel; };
      w.check = function (v) { return v === s.ans; };
      w.feedback = function (v) { return v < 0 ? 'Pick an answer first.' : 'Not that one.'; };
      w.lock = function (show) { box.dataset.locked = '1'; if (show) { bs[s.ans].classList.add('right'); if (sel >= 0 && sel !== s.ans) bs[sel].classList.add('wrong'); } };
      w.focus = function () { bs[0].focus(); };
    } else if (s.type === 'graph') {
      var picks = [], g = el('div', {}), read = el('div', { 'class': 'muted', style: 'font-size:14px;margin-top:4px' }), locked = false;
      function draw(extra) { g.innerHTML = graph({ pick: !locked, pts: picks.map(function (p) { return { x: p.x, y: p.y, label: '(' + ng(p.x) + ', ' + ng(p.y) + ')' }; }), lines: extra || [], aria: 'Click grid points to plot them' }); read.textContent = picks.length ? 'Plotted: ' + picks.map(function (p) { return '(' + ng(p.x) + ', ' + ng(p.y) + ')'; }).join(' and ') : 'Click two grid points.'; }
      g.addEventListener('click', function (e) {
        if (locked) return; var sv = g.querySelector('svg'), r = sv.getBoundingClientRect();
        var x = Math.round((e.clientX - r.left) / r.width * 2 * R - R), y = Math.round(R - (e.clientY - r.top) / r.height * 2 * R);
        if (Math.abs(x) > R - 0 || Math.abs(y) > R) return;
        var dup = picks.findIndex(function (p) { return p.x === x && p.y === y; });
        if (dup >= 0) picks.splice(dup, 1); else { if (picks.length >= 2) picks.shift(); picks.push({ x: x, y: y }); }
        draw();
      });
      draw();
      box.appendChild(g); box.appendChild(read);
      box.appendChild(el('div', { 'class': 'btns' }, [el('button', { type: 'button', 'class': 'btn small', text: 'Clear points', onclick: function () { if (!locked) { picks = []; draw(); } } })]));
      var on = function (p) { return Math.abs(p.y - (fv(s.line.m) * p.x + fv(s.line.b))) < 1e-9; };
      w.read = function () { return picks.slice(); };
      w.check = function (v) { return v.length === 2 && on(v[0]) && on(v[1]); };
      w.feedback = function (v) { if (v.length < 2) return 'Plot two points.'; var bad = v.filter(function (p) { return !on(p); }); return bad.length === 2 ? 'Neither point is on the line. Start at the y-intercept.' : 'One point is right, but (' + ng(bad[0].x) + ', ' + ng(bad[0].y) + ') is not on the line. Use rise over run from the other point.'; };
      w.lock = function (show) { locked = true; draw(show ? [{ m: s.line.m, b: s.line.b }] : []); };
      w.focus = function () { };
    } else if (s.type === 'frame') {
      var sels = [], kids = [];
      s.parts.forEach(function (p) {
        if (typeof p === 'string') { kids.push(p); return; }
        var x = el('select', { 'aria-label': 'Choose a word' }, [el('option', { value: '', text: '…' })].concat(p.o.map(function (o) { return el('option', { value: o, text: o }); })));
        sels.push({ el: x, a: p.a }); kids.push(x);
      });
      box.appendChild(el('div', { 'class': 'frame' }, kids));
      w.read = function () { return sels.map(function (x) { return x.el.value; }); };
      w.check = function (v) { return v.every(function (x, i) { return x === sels[i].a; }); };
      w.feedback = function (v) { var n = v.filter(function (x, i) { return x !== sels[i].a; }).length; return n + (n === 1 ? ' blank is' : ' blanks are') + ' not right yet.'; };
      w.lock = function (show) { sels.forEach(function (x) { x.el.disabled = true; if (show) x.el.value = x.a; }); };
      w.focus = function () { sels[0].el.focus(); };
    }
    return w;
  }
  function ansText(s) {
    if (s.at) return s.at;
    if (s.type === 'num') return s.ans.map(fs).join(', ');
    if (s.type === 'mc') return s.choices[s.ans];
    if (s.type === 'frame') return s.parts.map(function (p) { return typeof p === 'string' ? p : p.a; }).join('');
    return '';
  }
  function html(tag, cls, h) { var e = el(tag, cls ? { 'class': cls } : {}); e.innerHTML = h; return e; }
  function probCard(p, tag, stretch) {
    var c = el('div', { 'class': 'prob' });
    c.appendChild(html('span', 'tag' + (stretch ? ' st' : ''), tag));
    c.appendChild(html('div', 'pq', p.q));
    if (p.fig) c.appendChild(html('div', 'fig', p.fig));
    return c;
  }
  function solved(s, i, showNum) {
    var d = el('div', { 'class': 'step ok' });
    d.appendChild(html('div', 'sq', (showNum ? '<span class="n">' + (i + 1) + '</span>' : '') + s.q));
    d.appendChild(html('div', '', 'Answer: <span class="got">' + ansText(s) + '</span>'));
    d.appendChild(html('div', 'why', s.why));
    return d;
  }

  // after Deep: tell the student they can move on, and point to the next skill that still needs work
  function nextSkill(id) {
    var rest = ORDER.filter(function (k) { return k !== id && lvl(k) < 4; });
    if (!rest.length) return null;
    var min = Math.min.apply(null, rest.map(lvl));
    return rest.filter(function (k) { return lvl(k) === min; })[0];
  }
  function deepNote(id) {
    var nx = nextSkill(id), d = el('div', { 'class': 'deepnote', role: 'status' });
    d.appendChild(html('div', '', '<b>🏆 Deep: you have mastered this skill.</b> You can move on now. ' + (nx ? 'Next up: <b>' + T[nx].name + '</b> (' + LV[lvl(nx)] + ').' : 'Every skill is at Deep. Amazing work!') + ' You can still practise here if you want to.'));
    if (nx) d.appendChild(el('div', { 'class': 'btns' }, [el('button', { 'class': 'btn primary', type: 'button', text: 'Move on to ' + T[nx].name + ' →', onclick: function () { go({ at: 'topic', id: nx, tab: lvl(nx) ? 'ind' : 'learn' }); } }), el('button', { 'class': 'btn', type: 'button', text: '← All skills', onclick: function () { go({ at: 'home' }); } })]));
    return d;
  }

  /* ---------------- screens ---------------- */
  var app = document.getElementById('app'), view = { at: 'home' };
  function go(v) { view = v; draw(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function draw() {
    mergeStored();
    app.innerHTML = '';
    if (view.at === 'home') home();
    else if (view.at === 'mixed') mixed();
    else topic();
  }
  function meter(L) { return el('div', { 'class': 'meter l' + L, 'aria-hidden': 'true' }, [1, 2, 3, 4].map(function (k) { return el('i', { 'class': k <= L ? 'on' : '' }); })); }
  function badge(L) { return el('span', { 'class': 'badge l' + L, text: LV[L] }); }

  function home() {
    var all = ORDER.map(lvl), dev = all.filter(function (L) { return L >= 3; }).length;
    var intro = el('section', { 'class': 'card' });
    intro.innerHTML = '<h2>Linear Equations and Inequalities</h2><p style="margin:0">Get ready for the Unit 2 formative. Every skill has three parts: <b>📖 Learn</b> the idea with a worked example, <b>🪜 Guided practice</b> one step at a time with hints, and <b>🎯 On your own</b> practice that moves you toward mastery. New problems every time.</p>' +
      '<p class="eu"><b>Big idea:</b> rearranging and manipulating equations makes it possible to isolate important quantities, compare relationships and solve for unknowns in different contexts.</p>';
    intro.appendChild(el('div', { 'class': 'mast' }, [el('b', { text: dev + ' of ' + ORDER.length + ' skills at Developed or better' }), el('span', { 'class': 'muted', text: 'Developed is the goal for the assessment.' })]));
    var key = el('div', { 'class': 'lvlkey' }, [1, 2, 3, 4].map(function (L) { var s = el('span', { 'class': 'l' + L, style: 'border-color:var(--lc)', text: LV[L] }); return s; }));
    intro.appendChild(key);
    intro.appendChild(el('div', { 'class': 'btns' }, [el('button', { 'class': 'btn primary', type: 'button', text: '🔀 Mixed review: practise my weakest skills', onclick: function () { go({ at: 'mixed' }); } })]));
    app.appendChild(intro);

    var sec = el('section', { 'class': 'card' }, [html('h2', '', 'Your progress toward mastery'), html('p', 'muted', 'Each success criterion shows the level that all of its skills have reached. Open a skill to learn or practise it.')]);
    var crit = el('div', { 'class': 'crit' });
    CRIT.forEach(function (c) {
      var L = critLvl(c), row = el('div', { 'class': 'crow l' + L });
      row.appendChild(el('div', { 'class': 'ch' }, [el('div', {}, [el('div', { 'class': 'strand', text: c.strand }), el('b', { text: c.name })]), badge(L)]));
      row.appendChild(meter(L));
      row.appendChild(el('div', { 'class': 'tiles' }, c.topics.map(function (id) {
        var l = lvl(id), t = P.t[id];
        return el('button', { 'class': 'tile l' + l, type: 'button', onclick: function () { go({ at: 'topic', id: id, tab: l ? 'ind' : 'learn' }); } }, [
          el('span', { 'class': 'tn', text: T[id].name }), meter(l), el('span', { 'class': 'ts', text: l >= 4 ? '🏆 Deep: mastered, move on' : LV[l] + (t && t.h.length ? ' · ' + t.h.filter(Boolean).length + ' right on your own' : '') })]);
      })));
      crit.appendChild(row);
    });
    sec.appendChild(crit); app.appendChild(sec);

    var rub = el('details', { 'class': 'card' });
    rub.innerHTML = '<summary><b>What the levels mean (from the task sheet rubric)</b></summary><div class="scroll"><table class="rub"><tr><th>Level</th><th>In this review</th><th>On the rubric</th></tr>' +
      '<tr><td><b>Limited</b></td><td>You have started the skill.</td><td>Begins to show the concept in simple, familiar problems; accuracy is developing.</td></tr>' +
      '<tr><td><b>Emerging</b></td><td>A guided problem finished without help, plus a problem right on your own (or two right on your own).</td><td>Applies strategies to simple problems and sometimes reaches correct solutions.</td></tr>' +
      '<tr><td class="goal"><b>Developed</b></td><td class="goal">3 of your last 4 problems on your own are right.</td><td class="goal">Effectively uses the methods in most problems, usually arriving at correct solutions.</td></tr>' +
      '<tr><td><b>Deep</b></td><td>Developed, then 2 stretch problems right (harder numbers, less familiar set-ups).</td><td>Selects, adapts and transfers knowledge to unfamiliar problems.</td></tr></table></div>';
    app.appendChild(rub);
  }

  function topic() {
    var id = view.id, D = T[id], L = lvl(id), t = st(id);
    var head = el('div', { 'class': 'tophead' }, [el('button', { 'class': 'btn small', type: 'button', text: '← All skills', onclick: function () { go({ at: 'home' }); } }), html('h2', '', D.name), badge(L)]);
    app.appendChild(head);
    var c = CRIT.filter(function (x) { return x.topics.indexOf(id) >= 0; })[0];
    app.appendChild(el('div', { 'class': 'muted', style: 'font-size:13px;margin-top:4px', text: c.strand + ' · ' + c.name }));
    if (L >= 4) app.appendChild(deepNote(id));
    var tabs = [['learn', '📖 Learn'], ['guided', '🪜 Guided practice'], ['ind', '🎯 On your own']];
    app.appendChild(el('div', { 'class': 'tabs', role: 'tablist' }, tabs.map(function (x) { return el('button', { 'class': 'chip', type: 'button', role: 'tab', 'aria-pressed': view.tab === x[0] ? 'true' : 'false', text: x[1], onclick: function () { go({ at: 'topic', id: id, tab: x[0] }); } }); })));
    var body = el('div', {}); app.appendChild(body);
    if (view.tab === 'learn') learn(body, id);
    else if (view.tab === 'guided') guided(body, id);
    else independent(body, id, false);
  }

  function learn(host, id) {
    var D = T[id], card = el('section', { 'class': 'card' });
    card.appendChild(html('p', 'idea', D.idea));
    card.appendChild(html('div', 'formula', D.formula));
    card.appendChild(html('ul', 'tips', D.tips.map(function (x) { return '<li>' + x + '</li>'; }).join('')));
    var vb = vidBox(id, '🎬 Want it explained another way? Khan Academy videos:'); if (vb) card.appendChild(vb);
    host.appendChild(card);
    st(id).tried = 1; save();
    var ex = el('section', { 'class': 'card' }, [html('h2', '', 'Worked example')]);
    var p = D.gen(false), shown = 0, list = el('div', { 'class': 'steps' });
    ex.appendChild(probCard(p, 'Example'));
    ex.appendChild(list);
    var nb = el('button', { 'class': 'btn primary', type: 'button', text: 'Show step 1' });
    var again = el('button', { 'class': 'btn', type: 'button', text: '🔁 Another example', onclick: function () { learnAgain(); } });
    function learnAgain() { host.innerHTML = ''; learn(host, id); }
    nb.addEventListener('click', function () {
      list.appendChild(solved(p.steps[shown], shown, true)); shown++;
      if (shown >= p.steps.length) { nb.textContent = '🪜 Try guided practice'; nb.onclick = function (e) { e.stopImmediatePropagation(); go({ at: 'topic', id: id, tab: 'guided' }); }; }
      else nb.textContent = 'Show step ' + (shown + 1);
    });
    ex.appendChild(el('div', { 'class': 'btns' }, [nb, again]));
    host.appendChild(ex);
  }

  function guided(host, id) {
    var D = T[id], t = st(id), p = D.gen(false), i = 0, reveals = 0;
    var card = el('section', { 'class': 'card' }, [html('h2', '', 'Guided practice'), html('p', 'muted', 'One step at a time. Use a hint if you need one. After every step you get the full explanation.')]);
    card.appendChild(probCard(p, 'Guided'));
    var list = el('div', { 'class': 'steps' }); card.appendChild(list);
    host.appendChild(card);
    t.tried = 1; save();
    function next() {
      if (i >= p.steps.length) return finish();
      var s = p.steps[i], box = el('div', { 'class': 'step' }), w = widget(s), tries = 0;
      box.appendChild(html('div', 'sq', '<span class="n">' + (i + 1) + '</span>' + s.q));
      box.appendChild(w.node);
      var fb = el('div', { 'class': 'fb', 'aria-live': 'polite' }), hintBox = el('div', {});
      var chk = el('button', { 'class': 'btn primary', type: 'button', text: 'Check' });
      var hb = el('button', { 'class': 'btn', type: 'button', text: '💡 Hint', onclick: function () { hintBox.innerHTML = ''; hintBox.appendChild(html('div', 'hint', s.hint)); } });
      var show = el('button', { 'class': 'btn', type: 'button', text: '👀 Show me', hidden: '' });
      var row = el('div', { 'class': 'btns' }, [chk, hb, show]);
      box.appendChild(row); box.appendChild(fb); box.appendChild(hintBox);
      function done(ok) {
        w.lock(true); row.remove(); hintBox.remove();
        box.classList.add(ok ? 'ok' : 'bad');
        fb.className = 'fb ' + (ok ? 'yes' : 'no'); fb.textContent = ok ? '✓ Correct' : 'The answer is ' + ansText(s).replace(/<[^>]+>/g, '') + '.';
        box.appendChild(html('div', 'why' + (ok ? '' : ' no'), s.why));
        i++; next();
      }
      chk.addEventListener('click', function () {
        var v = w.read();
        if (w.check(v)) return done(true);
        tries++; fb.className = 'fb no'; fb.textContent = w.feedback(v) + (tries >= 2 ? ' You can use “Show me”.' : ' Try again.');
        if (tries >= 2) show.hidden = false;
        if (tries === 1 && !hintBox.firstChild) hb.click();
      });
      show.addEventListener('click', function () { reveals++; done(false); });
      (w.enter || []).forEach(function (inp) { inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') chk.click(); }); });
      list.appendChild(box); setTimeout(w.focus, 30);
    }
    function finish() {
      var ok = reveals === 0;
      if (ok) t.g++; else t.rv = (t.rv || 0) + reveals;
      save();
      var d = el('div', { 'class': 'done' + (ok ? '' : ' no') });
      d.appendChild(html('div', '', ok ? '<b>Solved with no “Show me”. Nice.</b> When it feels easy, try one on your own.' : '<b>Done.</b> You used “Show me” ' + reveals + ' time' + (reveals > 1 ? 's' : '') + '. Try another guided problem to lock it in.'));
      if (!ok) { var gv = vidBox(id); if (gv) d.appendChild(gv); }
      d.appendChild(el('div', { 'class': 'btns' }, [el('button', { 'class': 'btn' + (ok ? '' : ' primary'), type: 'button', text: '🪜 Another guided problem', onclick: function () { host.innerHTML = ''; guided(host, id); } }), el('button', { 'class': 'btn' + (ok ? ' primary' : ''), type: 'button', text: '🎯 Try one on your own', onclick: function () { go({ at: 'topic', id: id, tab: 'ind' }); } })]));
      card.appendChild(d);
    }
    next();
  }

  function progressLine(id) {
    var t = st(id), L = lvl(id), last = t.h.slice(-4), dots = [];
    for (var k = 0; k < 4; k++) dots.push(el('i', { 'class': k < last.length ? (last[k] ? 'y' : 'n') : '' }));
    var msg = L >= 4 ? 'Deep: you have mastered this skill. You can move on to another skill.' : L === 3 ? 'Developed ✓. Stretch problems now: ' + t.s + ' of 2 right for Deep.' : 'Goal: 3 of your last 4 right for Developed.';
    return el('div', { 'class': 'mast' }, [el('span', {}, [el('b', { text: 'Last 4 on your own: ' })]), el('div', { 'class': 'dots', 'aria-label': last.filter(Boolean).length + ' of the last ' + last.length + ' right' }, dots), el('span', { 'class': 'muted', text: msg })]);
  }

  // one independent problem: only the final steps, one check, then the full worked solution
  function independent(host, id, isMixed, onNext) {
    var D = T[id], t = st(id), stretch = lvl(id) >= 3, p = D.gen(stretch);
    var card = el('section', { 'class': 'card' }, [html('h2', '', isMixed ? 'Mixed review: ' + D.name : 'On your own')]);
    if (!isMixed) card.appendChild(html('p', 'muted', 'No hints this time. Answer, check, then read the full solution.'));
    card.appendChild(progressLine(id));
    card.appendChild(probCard(p, stretch ? 'Stretch problem' : 'On your own', stretch));
    var finals = p.steps.filter(function (s) { return s.final; }), ws = finals.map(widget), list = el('div', { 'class': 'steps' });
    finals.forEach(function (s, k) {
      var b = el('div', { 'class': 'step' }); b.appendChild(html('div', 'sq', (finals.length > 1 ? '<span class="n">' + String.fromCharCode(97 + k) + '</span>' : '') + s.q.replace(/^(Divide every term by [^.]+\.|Keep dividing every term by [^.]+\.|Divide both sides by [^.]+\.|Get y alone first\.)\s*/, ''))); b.appendChild(ws[k].node); list.appendChild(b); s._box = b;
    });
    card.appendChild(list);
    var fb = el('div', { 'class': 'fb', 'aria-live': 'polite' }), chk = el('button', { 'class': 'btn primary', type: 'button', text: 'Check my answer' });
    card.appendChild(el('div', { 'class': 'btns' }, [chk])); card.appendChild(fb);
    ws.forEach(function (w) { (w.enter || []).forEach(function (inp) { inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') chk.click(); }); }); });
    host.appendChild(card);
    setTimeout(function () { if (ws[0]) ws[0].focus(); }, 30);
    chk.addEventListener('click', function () {
      var vals = ws.map(function (w) { return w.read(); });
      var empty = ws.some(function (w, k) { var v = vals[k]; return finals[k].type === 'mc' ? v < 0 : finals[k].type === 'num' ? v.some(function (x) { return !x; }) : finals[k].type === 'graph' ? v.length < 2 : v.some(function (x) { return !x; }); });
      if (empty) { fb.className = 'fb no'; fb.textContent = 'Answer every part first (numbers can be fractions like −3/4).'; return; }
      var oks = ws.map(function (w, k) { return w.check(vals[k]); }), ok = oks.every(Boolean), before = lvl(id);
      ws.forEach(function (w, k) { w.lock(true); finals[k]._box.classList.add(oks[k] ? 'ok' : 'bad'); if (!oks[k]) finals[k]._box.appendChild(html('div', 'fb no', 'Correct answer: ' + ansText(finals[k]))); });
      chk.remove();
      t.n++;
      if (stretch) { if (ok) t.s++; } else { t.h.push(ok ? 1 : 0); if (t.h.length > 20) t.h = t.h.slice(-20); var last = t.h.slice(-4); if (last.length >= 3 && last.reduce(function (a, b) { return a + b; }, 0) >= 3) t.dev = 1; }
      save();
      var after = lvl(id);
      fb.className = 'fb ' + (ok ? 'yes' : 'no'); fb.textContent = ok ? '✓ All correct!' : 'Not all right this time. Read the solution, then try another.';
      if (after > before) SFA.toast(after >= 4 ? '🏆 Deep on ' + D.name + '! You can move on to another skill.' : 'Level up: ' + D.name + ' is now ' + LV[after] + '!', after >= 4 ? 5000 : 3600);
      var sol = el('div', { 'class': 'done' + (ok ? '' : ' no') }, [html('div', '', '<b>Full solution</b>')]);
      var sl = el('div', { 'class': 'steps' }); p.steps.forEach(function (s, k) { sl.appendChild(solved(s, k, true)); }); sol.appendChild(sl);
      var nextBtn = el('button', { 'class': 'btn primary', type: 'button', text: 'Next problem →', onclick: function () { if (onNext) onNext(); else { host.innerHTML = ''; independent(host, id, false); } } });
      var extra = !ok && !isMixed ? el('button', { 'class': 'btn', type: 'button', text: '🪜 Guided practice', onclick: function () { go({ at: 'topic', id: id, tab: 'guided' }); } }) : null;
      if (!ok) { var iv = vidBox(id); if (iv) sol.appendChild(iv); }
      sol.appendChild(el('div', { 'class': 'btns' }, [nextBtn, extra]));
      if (after >= 4 && before < 4 && !isMixed) { var nx = nextSkill(id); if (nx) { nextBtn.className = 'btn'; nextBtn.textContent = 'Keep practising this skill'; sol.appendChild(el('div', { 'class': 'btns' }, [el('button', { 'class': 'btn primary', type: 'button', text: '🏆 Move on to ' + T[nx].name + ' →', onclick: function () { go({ at: 'topic', id: nx, tab: lvl(nx) ? 'ind' : 'learn' }); } })])); } }
      card.appendChild(sol);
      card.replaceChild(progressLine(id), card.querySelector('.mast'));
    });
  }

  // mixed review: picks among the weakest skills (not yet Deep), weighted toward the lowest level
  function mixed() {
    app.appendChild(el('div', { 'class': 'tophead' }, [el('button', { 'class': 'btn small', type: 'button', text: '← All skills', onclick: function () { go({ at: 'home' }); } }), html('h2', '', '🔀 Mixed review')]));
    app.appendChild(html('p', 'muted', 'Problems from across the unit, like the assessment. Each one counts toward that skill\'s mastery.'));
    var host = el('div', {}); app.appendChild(host);
    var lastId = null;
    function one() {
      host.innerHTML = '';
      var pool = ORDER.filter(function (id) { return lvl(id) < 4 && id !== lastId; }); if (!pool.length) pool = ORDER.slice();
      var min = Math.min.apply(null, pool.map(lvl)), w = [];
      pool.forEach(function (id) { var n = lvl(id) === min ? 3 : 1; for (var k = 0; k < n; k++) w.push(id); });
      lastId = pick(w);
      independent(host, lastId, true, function () { one(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
    one();
  }

  // the account strip can pull newer progress from the class Sheet after sign-in
  if (SFA.sync && SFA.sync.onChange) SFA.sync.onChange(function () { if (mergeStored()) refreshLevels(); });
  // another tab saved (the review is often open twice): take its newer skills and update the levels here
  window.addEventListener('storage', function (e) { if (e.key && e.key.slice(-KEY.length - 1) === '.' + KEY && mergeStored()) refreshLevels(); });
  // coming back to this tab: make sure the levels are current
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && mergeStored()) refreshLevels(); });
  // review-u2.html#s1 opens that skill (the review lessons link straight to their skills); #mixed opens the mixed review
  var hk = (location.hash || '').slice(1);
  if (T[hk]) view = { at: 'topic', id: hk, tab: lvl(hk) ? 'ind' : 'learn' }; else if (hk === 'mixed') view = { at: 'mixed' };
  draw();
  window.SFA_REVIEW = { T: T, P: function () { return P; }, lvl: lvl };   // for testing
})();
