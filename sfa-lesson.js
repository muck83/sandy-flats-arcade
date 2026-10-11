/* Sandy Flats lesson slideshows.
   lesson.html?l=N          student deck: answer polls and questions on your own device, follow the teacher when live
   lesson.html?l=N&teach    teacher console: live results, reveal, spotlight, timer, who hasn't answered
   lesson.html?l=N&screen   the class screen to share: driven by the console in the same browser
   Lessons are data files in lessons/LN.js (see lessons/README.md). Answers go to the Responses tab via the results script. */
(function () {
  'use strict';
  var SFA = window.SFA, el = SFA.el, esc = SFA.esc, CFG = window.SFA_CONFIG || {}, S = SFA.sync;
  var Q = new URLSearchParams(location.search);
  var MODE = Q.has('teach') ? 'teach' : Q.has('screen') ? 'screen' : 'student';
  var N = Math.max(1, Math.min(20, parseInt(Q.get('l'), 10) || 1)), LID = 'L' + N;
  var TEACHER = 'Mr. Crowell';
  var LIVE_FRESH = 10 * 60 * 1000;   // a live session counts as running while the console has checked in within 10 minutes
  document.body.classList.add('lesson', 'm-' + MODE);

  var LES = null, cur = 0, slideEl = null, live = null, follow = true, saving = !!(S && S.on);
  var mine = SFA.store.get('les.' + LID, {}) || {};      // this student's answers: { q: { answer, correct, sent } }
  var console_ = null;                                    // teacher console state
  var feed = null;                                        // console data shared with the class screen

  /* ---------------- helpers ---------------- */
  function fmt(s) { return esc(s).replace(/\*([^*]+)\*/g, '<b>$1</b>').replace(/_([^_]+)_/g, '<i>$1</i>'); }
  function H(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function plain(s) { return String(s || '').replace(/[*_]/g, ''); }
  function interactive(s) { return !!s.id; }
  function questions() { return LES.slides.filter(interactive); }
  function letter(i) { return 'ABCDE'.charAt(i); }
  function post(body) {
    return fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
      .then(function (r) { return r.text(); })
      .then(function (t) { var j; try { j = JSON.parse(t); } catch (e) { throw new Error('The results script didn\'t answer properly.'); } if (!j.ok) throw new Error(j.error || 'failed'); return j; });
  }
  function isLive() { return !!(live && live.lesson === LID && Date.now() - live.at < LIVE_FRESH); }
  function locked() { return MODE === 'student' && isLive() && !!live.lock; }
  function reveal(q) { return isLive() ? (live.reveal && live.reveal[q]) || 0 : 0; }
  function first(n) { n = String(n || ''); return (n.indexOf(',') >= 0 ? n.split(',')[1] : n).trim().split(' ')[0] || n; }
  function nice(n) { n = String(n || ''); if (n.indexOf(',') < 0) return n; var p = n.split(','); return (p[1].trim().split(' ')[0] + ' ' + p[0].trim()).trim(); }
  function confetti() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cols = ['#FFC94A', '#5CE0B8', '#B48CFF', '#E8584C', '#3BFF8A'];
    for (var i = 0; i < 46; i++) {
      var b = H('i', 'conf-bit');
      b.style.left = (10 + Math.random() * 80) + 'vw'; b.style.background = cols[i % cols.length];
      b.style.setProperty('--dx', (Math.random() * 30 - 15) + 'vw'); b.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      b.style.animationDelay = (Math.random() * .25) + 's';
      document.body.appendChild(b); setTimeout(function (b) { return function () { b.remove(); }; }(b), 2000);
    }
  }

  /* ---------------- rules: 2x+1, 3(x-2), x^2 ... ---------------- */
  function parseRule(src) {
    var s = String(src || '').toLowerCase().replace(/\s+/g, '').replace(/[−–—]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/')
      .replace(/^(y|f\(x\)|out(put)?|rule)(=|:)/, '').replace(/²/g, '^2').replace(/,/g, '.');
    if (!s || s.length > 60) return null;
    var toks = [], m, re = /\d+(?:\.\d+)?|\.\d+|[x+\-*/^()n]/g, last = 0;
    while ((m = re.exec(s))) { if (m.index !== last) return null; last = re.lastIndex; toks.push(m[0] === 'n' ? 'x' : m[0]); }
    if (last !== s.length) return null;
    var t = [];
    toks.forEach(function (k) {
      var p = t[t.length - 1];
      if (p != null && (/^[\d.]/.test(p) || p === 'x' || p === ')') && (k === 'x' || k === '(' || (/^[\d.]/.test(k) && p === ')'))) t.push('*');
      t.push(k);
    });
    var i = 0;
    function peek() { return t[i]; }
    function bin(a, b, o) { return function (x) { var u = a(x), v = b(x); return o === '+' ? u + v : o === '-' ? u - v : o === '*' ? u * v : u / v; }; }
    function expr() { var a = term(); while (peek() === '+' || peek() === '-') { var o = t[i++]; a = bin(a, term(), o); } return a; }
    function term() { var a = unary(); while (peek() === '*' || peek() === '/') { var o = t[i++]; a = bin(a, unary(), o); } return a; }
    function unary() { if (peek() === '-') { i++; var a = unary(); return function (x) { return -a(x); }; } if (peek() === '+') { i++; return unary(); } return pow(); }
    function pow() { var a = atom(); if (peek() === '^') { i++; var b = unary(); return function (x) { return Math.pow(a(x), b(x)); }; } return a; }
    function atom() {
      var k = t[i++];
      if (k == null) throw 0;
      if (k === 'x') return function (x) { return x; };
      if (k === '(') { var a = expr(); if (t[i++] !== ')') throw 0; return a; }
      if (/^[\d.]/.test(k)) { var v = parseFloat(k); return function () { return v; }; }
      throw 0;
    }
    try { var f = expr(); return i === t.length ? f : null; } catch (e) { return null; }
  }
  function sameRule(f, g) {
    var xs = [0, 1, 2, 3, 5, 10, -1, -4, 0.5];
    for (var k = 0; k < xs.length; k++) { var a = f(xs[k]), b = g(xs[k]); if (!isFinite(a) && !isFinite(b)) continue; if (!(Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(a)))) return false; }
    return true;
  }
  function numOf(s) { var f = parseRule(String(s).replace(/x/gi, '')); if (!f) return NaN; var v = f(0); return isFinite(v) ? v : NaN; }
  function numTxt(v) { v = Math.round(v * 1000) / 1000; return String(v).replace('-', '−'); }

  /* ---------------- figures ---------------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function S_(tag, attrs, parent) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function niceStep(span) { var raw = span / 6, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }
  function figure(f) {
    var box = H('div', 'fig');
    if (f.kind === 'table') {
      var t = H('table', 'ftab'), tr = H('tr');
      (f.head || []).forEach(function (h) { tr.appendChild(H('th', '', fmt(h))); }); t.appendChild(tr);
      (f.rows || []).forEach(function (r, ri) {
        var row = H('tr'); r.forEach(function (c) { var td = H('td', String(c) === '?' ? 'qm' : '', esc(String(c).replace(/^-/, '−'))); td.style.animationDelay = (.15 + ri * .12) + 's'; row.appendChild(td); }); t.appendChild(row);
      });
      box.appendChild(t); return box;
    }
    var W = 420, Hh = 270, svg = S_('svg', { viewBox: '0 0 ' + W + ' ' + Hh, role: 'img' });
    var defs = S_('defs', {}, svg), mk = S_('marker', { id: 'ah', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    S_('path', { d: 'M0,0 L10,5 L0,10 z', fill: '#5CE0B8' }, mk);
    if (f.kind === 'map') {
      var ins = [], outs = [];
      (f.pairs || []).forEach(function (p) { if (ins.indexOf(p[0]) < 0) ins.push(p[0]); if (outs.indexOf(p[1]) < 0) outs.push(p[1]); });
      var rows = Math.max(ins.length, outs.length, 1), gap = Math.min(52, 220 / rows);
      S_('ellipse', { 'class': 'oval', cx: 90, cy: 140, rx: 62, ry: Math.max(40, rows * gap / 2 + 26) }, svg);
      S_('ellipse', { 'class': 'oval', cx: 330, cy: 140, rx: 62, ry: Math.max(40, rows * gap / 2 + 26) }, svg);
      var ty = S_('text', { x: 90, y: 16, 'text-anchor': 'middle' }, svg); ty.textContent = 'input';
      var to = S_('text', { x: 330, y: 16, 'text-anchor': 'middle' }, svg); to.textContent = 'output';
      function yAt(i, n) { return 140 + (i - (n - 1) / 2) * gap; }
      ins.forEach(function (v, i) { var t = S_('text', { 'class': 'mv', x: 90, y: yAt(i, ins.length) }, svg); t.textContent = String(v).replace(/^-/, '−'); });
      outs.forEach(function (v, i) { var t = S_('text', { 'class': 'mv', x: 330, y: yAt(i, outs.length) }, svg); t.textContent = String(v).replace(/^-/, '−'); });
      (f.pairs || []).forEach(function (p, k) {
        var y1 = yAt(ins.indexOf(p[0]), ins.length), y2 = yAt(outs.indexOf(p[1]), outs.length), len = Math.hypot(220, y2 - y1) + 10;
        var a = S_('path', { 'class': 'arr', d: 'M120,' + y1 + ' L300,' + y2 }, svg); a.style.setProperty('--len', len); a.style.animationDelay = (.3 + k * .25) + 's';
      });
      box.appendChild(svg); return box;
    }
    // graph
    var x0 = f.x[0], x1 = f.x[1], y0 = f.y[0], y1 = f.y[1], L = 46, R = W - 14, T = 14, B = Hh - 38;
    function X(v) { return L + (v - x0) / (x1 - x0) * (R - L); }
    function Y(v) { return B - (v - y0) / (y1 - y0) * (B - T); }
    var sx = niceStep(x1 - x0), sy = niceStep(y1 - y0), v;
    for (v = Math.ceil(x0 / sx) * sx; v <= x1 + 1e-9; v += sx) { S_('line', { 'class': 'gr', x1: X(v), x2: X(v), y1: T, y2: B }, svg); var tx = S_('text', { x: X(v), y: B + 16, 'text-anchor': 'middle' }, svg); tx.textContent = numTxt(v); }
    for (v = Math.ceil(y0 / sy) * sy; v <= y1 + 1e-9; v += sy) { S_('line', { 'class': 'gr', x1: L, x2: R, y1: Y(v), y2: Y(v) }, svg); var tyy = S_('text', { x: L - 6, y: Y(v) + 4, 'text-anchor': 'end' }, svg); tyy.textContent = numTxt(v); }
    S_('line', { 'class': 'ax', x1: X(Math.max(x0, Math.min(0, x1))), x2: X(Math.max(x0, Math.min(0, x1))), y1: T, y2: B }, svg);
    S_('line', { 'class': 'ax', x1: L, x2: R, y1: Y(Math.max(y0, Math.min(0, y1))), y2: Y(Math.max(y0, Math.min(0, y1))) }, svg);
    if (f.xl) { var xl = S_('text', { x: (L + R) / 2, y: Hh - 4, 'text-anchor': 'middle' }, svg); xl.textContent = f.xl; }
    if (f.yl) { var yl = S_('text', { x: 12, y: (T + B) / 2, 'text-anchor': 'middle', transform: 'rotate(-90 12 ' + (T + B) / 2 + ')' }, svg); yl.textContent = f.yl; }
    (f.lines || []).forEach(function (ln, li) {
      var pts = ln.pts || [], c = li ? ' c' + li : '';
      if (!ln.only && pts.length > 1) {
        var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' '), len = 0;
        for (var i = 1; i < pts.length; i++) len += Math.hypot(X(pts[i][0]) - X(pts[i - 1][0]), Y(pts[i][1]) - Y(pts[i - 1][1]));
        var p = S_('path', { 'class': 'ln' + c, d: d }, svg); p.style.setProperty('--len', Math.ceil(len) + 2); p.style.animationDelay = (.3 + li * .5) + 's';
      }
      if (ln.dots || ln.only) pts.forEach(function (q, i) { var dt = S_('circle', { 'class': 'pt' + c, cx: X(q[0]), cy: Y(q[1]), r: 5.5 }, svg); dt.style.animationDelay = (.4 + li * .5 + i * .12) + 's'; });
    });
    box.appendChild(svg); return box;
  }

  /* ---------------- the machine picture ---------------- */
  function machineArt(label) {
    var box = H('div', 'mach idle');
    box.innerHTML = '<svg viewBox="0 0 320 220" aria-hidden="true">' +
      '<g class="body"><path d="M70 20 L130 20 L118 58 L82 58 Z" fill="#8E5BD6" stroke="#1B1A22" stroke-width="3"/>' +
      '<rect x="40" y="56" width="220" height="120" rx="18" fill="#E8584C" stroke="#1B1A22" stroke-width="3"/>' +
      '<rect x="62" y="74" width="120" height="44" rx="8" fill="#1B1A22"/><text x="122" y="104" text-anchor="middle" font-family="Luckiest Guy, sans-serif" font-size="24" fill="#FFC94A" class="mlabel"></text>' +
      '<rect x="250" y="120" width="56" height="26" rx="6" fill="#5CE0B8" stroke="#1B1A22" stroke-width="3"/>' +
      '<circle cx="80" cy="186" r="14" fill="#1B1A22"/><circle cx="220" cy="186" r="14" fill="#1B1A22"/></g>' +
      '<g class="gear" ><circle cx="212" cy="96" r="22" fill="#FFC94A" stroke="#1B1A22" stroke-width="3" stroke-dasharray="8 6"/><circle cx="212" cy="96" r="7" fill="#1B1A22"/></g>' +
      '<g class="gear g2"><circle cx="232" cy="140" r="14" fill="#F7F3E3" stroke="#1B1A22" stroke-width="3" stroke-dasharray="6 5"/><circle cx="232" cy="140" r="4" fill="#1B1A22"/></g>' +
      '<g><circle cx="80" cy="150" r="7" fill="#FFC94A"/><circle cx="102" cy="150" r="7" fill="#3BFF8A"/><circle cx="124" cy="150" r="7" fill="#B48CFF"/></g>' +
      '</svg>';
    box.querySelector('.mlabel').textContent = label || '?';
    return box;
  }
  function art(a) {
    if (a === 'machine') return machineArt('f(x)');
    var e = { film: '🎬', game: '🕹️' }[a] || a || '🎡';
    return H('div', 'bigicon', esc(e));
  }

  /* ---------------- answers (student) ---------------- */
  var queue = [], flushing = false, backendOld = false, sendErr = '';
  function saveLocal() { SFA.store.set('les.' + LID, mine); }
  function record(s, answer, correct) {
    mine[s.id] = { answer: String(answer), correct: correct, sent: false, kind: s.k };
    saveLocal(); flush(); refreshDots();
    setTimeout(function () { if (slideEl && slideEl.scrollHeight > slideEl.clientHeight + 4) slideEl.scrollTo({ top: slideEl.scrollHeight, behavior: 'smooth' }); }, 120);
  }
  function flush() {
    if (flushing || MODE !== 'student' || !saving || !S.me) { upd(); return; }
    var todo = Object.keys(mine).filter(function (q) { return !mine[q].sent; });
    if (!todo.length) { upd(); return; }
    flushing = true; upd();
    var q = todo[0], a = mine[q], tries = 0;
    (function go() {
      S.call('answer', { lesson: LID, q: q, kind: a.kind || 'open', answer: a.answer, correct: a.correct === true ? true : a.correct === false ? false : null }).then(function () {
        if (mine[q] === a) { a.sent = true; saveLocal(); }
        sendErr = ''; flushing = false; flush();
      }, function (e) {
        tries++; sendErr = e.message || 'failed';
        if (/busy/.test(e.message) && tries < 6) return setTimeout(go, 1500 + Math.random() * 3000 * tries);
        if (/unknown op/.test(e.message)) backendOld = true;
        if (/sign in/.test(e.message) && S.refresh && tries < 2) return S.refresh().then(function (err) { if (!err) go(); else { flushing = false; upd(); } });
        flushing = false; upd();
        if (!/unknown op|sign in/.test(e.message)) setTimeout(flush, 15000);
      });
    })();
  }
  function stateLine(q) {
    var a = mine[q], d = H('p', 'state');
    if (!a) return d;
    if (!saving) { d.textContent = 'Answer saved on this computer.'; return d; }
    if (a.sent) { d.className = 'state ok'; d.textContent = '✓ Sent to ' + TEACHER; return d; }
    if (backendOld) { d.textContent = 'Saved here. Answers can\'t reach ' + TEACHER + ' yet.'; return d; }
    if (sendErr && /roster/.test(sendErr)) { d.className = 'state bad'; d.textContent = 'Not sent: your school account isn\'t on ' + TEACHER + '\'s class list. Tell ' + TEACHER + '.'; return d; }
    if (sendErr && /school account/.test(sendErr)) { d.className = 'state bad'; d.textContent = 'Not sent: sign in with your school (aisr.org) account.'; return d; }
    if (sendErr && !/busy|sign in/.test(sendErr)) { d.className = 'state bad'; d.textContent = 'Not sent yet (' + sendErr + '). Trying again…'; return d; }
    if (!S.me || (S.credExpired && S.credExpired())) {
      d.className = 'state bad';
      d.textContent = !S.me ? 'Saved here only. Sign in so it reaches ' + TEACHER + ':' : 'Your sign-in timed out, so this hasn\'t reached ' + TEACHER + '. Sign in again:';
      if (S.button) { var gb = H('div', 'gbtn'); gb.style.cssText = 'margin-top:6px'; d.appendChild(gb); S.button(gb); }
      else { var ln = H('a', '', 'Sign in'); ln.href = '#'; ln.setAttribute('data-signin', ''); d.appendChild(document.createTextNode(' ')); d.appendChild(ln); }
      return d;
    }
    d.textContent = 'Sending…'; return d;
  }
  function loadMine() {
    if (MODE !== 'student' || !saving || !S.me) return;
    S.call('myAnswers', { lesson: LID }).then(function (j) {
      Object.keys(j.answers || {}).forEach(function (q) { if (!mine[q]) mine[q] = { answer: j.answers[q].answer, correct: j.answers[q].correct === 'yes' ? true : j.answers[q].correct === 'no' ? false : null, sent: true }; });
      saveLocal(); render(cur, 0, true); flush();
    }, function (e) { if (/unknown op/.test(e.message)) { backendOld = true; upd(); } else flush(); });
  }

  /* ---------------- slides ---------------- */
  // ctx: 'student' answers; 'screen' and 'teach' show the class's answers and never take input
  function build(s, i) {
    var d = H('div', 'slide k-' + s.k), show = MODE !== 'student';
    d._upd = function () { };
    var K = KINDS[s.k] || KINDS.text;
    K(s, d, show);
    return d;
  }
  function head(s, d) {
    var w = H('div', 'st'); d.appendChild(w);
    return w;
  }
  function qline(s, wrap) { wrap.appendChild(H('p', 'q', fmt(s.q))); }
  function withFig(s, d, left) {
    if (!s.fig) { d.appendChild(left); return; }
    var c = H('div', 'cols grow'); c.appendChild(left); var r = H('div', 'st'); r.appendChild(figure(s.fig)); c.appendChild(r); d.appendChild(c);
  }
  function tallyFor(q) {
    var t = H('p', 'tally'); t.appendChild(H('span', 'dot'));
    var n = feed && feed.per && feed.per[q] ? feed.per[q].n : 0, of = feed ? feed.total : 0;
    t.appendChild(document.createTextNode(feed ? n + (of ? ' of ' + of : '') + ' answered' : 'Answer on your own device'));
    return t;
  }
  function spotFor(q) {
    if (!(live && live.spot && live.spot.q === q && (MODE !== 'student' || isLive()))) return null;
    return H('div', 'spot', '<small>From the class</small>' + esc(live.spot.text));
  }

  var KINDS = {
    title: function (s, d) {
      var w = head(s, d);
      if (s.art) w.appendChild(H('div', 'art')).appendChild(art(s.art));
      if (s.kicker) w.appendChild(H('p', 'kick', fmt(s.kicker)));
      w.appendChild(H('h1', '', fmt(s.title || LES.title)));
      if (s.sub) w.appendChild(H('p', 'sub', fmt(s.sub)));
    },
    signin: function (s, d, show) {
      var w = head(s, d); w.appendChild(H('h2', '', fmt(s.title || 'Before we start')));
      var c = H('div', 'cols top grow'), l = H('div', 'st'), r = H('div', 'st');
      l.appendChild(H('p', 'kick', 'Today you will'));
      var ol = H('ol', 'pts'); (s.points || []).forEach(function (p) { ol.appendChild(H('li', '', fmt(p))); }); l.appendChild(ol);
      c.appendChild(l); c.appendChild(r); d.appendChild(c);
      function draw() {
        r.innerHTML = '';
        if (show) { r.appendChild(H('p', 'q', 'Sign in on your own device')); r.appendChild(H('p', 'sub', 'Open the lesson link, then press <b>Sign in with Google</b> and pick your school account.')); return; }
        if (!saving) { r.appendChild(H('p', 'sub', 'Answer saving is off for this copy, so just follow along.')); return; }
        if (S.me) { r.appendChild(H('p', 'okline', '✓ You\'re in, ' + esc(first(S.me.name)) + '.')); r.appendChild(H('p', 'sub', 'Your answers go to ' + TEACHER + '. Press <b>Next</b> when you\'re ready.')); return; }
        r.appendChild(H('p', 'q', 'Sign in so your answers count'));
        var hold = document.getElementById('sfaAccount'); if (hold) r.appendChild(hold);
        var alt = H('p', 'state', 'No button? Sign in on the <a href="index.html#signin" target="_blank" rel="noopener">Arcade front page</a>, then come back to this tab.'); r.appendChild(alt);
      }
      d._upd = function () { if (!r.contains(document.getElementById('sfaAccount')) || S.me) draw(); };
      draw();
    },
    text: function (s, d) {
      var w = head(s, d); w.appendChild(H('h2', '', fmt(s.title)));
      var left = H('div', 'st');
      var ol = H('ol', 'pts st'); (s.points || []).forEach(function (p) { ol.appendChild(H('li', '', fmt(p))); }); left.appendChild(ol);
      if (s.note) left.appendChild(H('p', 'note', fmt(s.note)));
      if (!s.fig && s.art) { var c = H('div', 'cols grow'); c.appendChild(left); var r = H('div', 'st'); r.appendChild(art(s.art)); c.appendChild(r); d.appendChild(c); }
      else withFig(s, d, left);
    },
    film: function (s, d) {
      var w = head(s, d); w.appendChild(H('h2', '', fmt(s.title || 'Watch')));
      var f = LES.film || {}, b = H('div', 'st grow');
      var card = H('div', 'fcard'); card.appendChild(H('div', 'num', esc(f.n || ''))); var t = H('div'); t.appendChild(H('b', '', esc(f.title || ''))); t.appendChild(H('small', '', 'Film ' + esc(f.n || '') + ' in the Sandy Flats Cinema' + (f.len ? ' · ' + esc(f.len) : ''))); card.appendChild(t); b.appendChild(card);
      if (s.cue) b.appendChild(H('p', 'note', fmt(s.cue)));
      b.appendChild(H('p', 'q', '<span class="kick">Watch for</span><br>' + fmt(s.watch)));
      var a = H('a', 'go', '🎬 Open the Cinema'); a.href = CFG.cinema || 'https://claude.ai/artifact/EHFcVi37ZD1DyEM2u6XSe4'; a.target = '_blank'; a.rel = 'noopener';
      var row = H('div', 'row'); row.appendChild(a); row.appendChild(H('span', 'onyours', 'Pick film ' + esc(f.n || '') + ', then come back here.')); b.appendChild(row);
      d.appendChild(b);
    },
    poll: function (s, d, show) { choice(s, d, show, s.opts, false); },
    conf: function (s, d, show) { choice(s, d, show, ['Lost', 'Getting there', 'Got it', 'I could teach it'], true); },
    open: function (s, d, show) { typed(s, d, show, false); },
    exit: function (s, d, show) { typed(s, d, show, true); },
    number: function (s, d, show) {
      var w = head(s, d); var left = H('div', 'st'); qline(s, left);
      var box = H('div', 'ans'); left.appendChild(box); withFig(s, d, left);
      d._upd = function () {
        box.innerHTML = '';
        if (show) { box.appendChild(tallyFor(s.id)); var p = feed && feed.per[s.id]; if (p && p.n) box.appendChild(H('p', 'state', p.right + ' right so far')); if (reveal(s.id) >= 2 || (MODE === 'teach' && console_ && console_.peek)) box.appendChild(H('div', 'reveal', '<b>Answer: ' + esc(show_(s.ans)) + '.</b> ' + fmt(s.why || ''))); return; }
        var a = mine[s.id], inp = el('input', { type: 'text', inputmode: 'decimal', 'aria-label': 'Your answer', placeholder: 'Type a number', autocomplete: 'off' });
        if (a) inp.value = a.answer;
        var btn = el('button', { type: 'button', 'class': 'btn primary', text: 'Check' });
        var row = H('div', 'row'); row.appendChild(inp); row.appendChild(btn); box.appendChild(row);
        if (a && a.correct === true) box.appendChild(H('div', 'fb good', '<b>Yes!</b> ' + fmt(s.why || '')));
        else if (a && a.correct === false) box.appendChild(H('div', 'fb try', 'Not yet. ' + fmt(s.hint || 'Check your working and try again.')));
        box.appendChild(stateLine(s.id));
        function check() {
          var v = numOf(inp.value); if (!inp.value.trim()) return inp.focus();
          if (isNaN(v)) { SFA.toast('Type a number, like 12 or -3.'); return; }
          var ok = Math.abs(v - s.ans) <= (s.tol || 1e-9) + 1e-9;
          record(s, inp.value.trim(), ok); if (ok) confetti(); d._upd(); if (!ok) setTimeout(function () { var i2 = box.querySelector('input'); if (i2) i2.focus(); }, 50);
        }
        btn.onclick = check; inp.onkeydown = function (e) { if (e.key === 'Enter') check(); };
      };
      d._upd();
    },
    machine: function (s, d, show) {
      var rule = parseRule(s.rule), w = head(s, d);
      w.appendChild(H('h2', '', esc(s.name || 'The machine')));
      var c = H('div', 'cols grow'), l = H('div', 'st'), r = H('div', 'st');
      var m = machineArt('?'); r.appendChild(m); c.appendChild(l); c.appendChild(r); d.appendChild(c);
      l.appendChild(H('p', 'q', fmt(s.q)));
      var area = H('div', 'ans'); l.appendChild(area);
      var tried = (mine[s.id] && mine[s.id].tried) || [];
      function feedIt(v) {
        var out = rule(v); m.classList.remove('idle'); m.classList.add('run');
        m.querySelectorAll('.tok').forEach(function (t) { t.remove(); });
        var a = H('div', 'tok inp', esc(numTxt(v))); m.appendChild(a);
        setTimeout(function () {
          m.classList.remove('run'); m.classList.add('idle');
          var b = H('div', 'tok out', esc(isFinite(out) ? numTxt(out) : '!')); m.appendChild(b);
          tried.push([v, out]); if (tried.length > 12) tried.shift();
          var keep = mine[s.id] || { answer: '', correct: null, sent: true, kind: 'machine' }; keep.tried = tried; mine[s.id] = keep; saveLocal();
          draw();
        }, 750);
      }
      function draw() {
        area.innerHTML = '';
        if (show) {
          area.appendChild(tallyFor(s.id)); var p = feed && feed.per[s.id]; if (p && p.n) area.appendChild(H('p', 'state', p.right + ' cracked it so far'));
          if (reveal(s.id) >= 2 || (MODE === 'teach' && console_ && console_.peek)) area.appendChild(H('div', 'reveal', '<b>The rule: ' + esc(s.rule.replace(/-/g, '−')) + '</b>'));
          var demo = el('input', { type: 'text', inputmode: 'decimal', placeholder: 'Try a number', 'aria-label': 'Input' }), go = el('button', { type: 'button', 'class': 'btn', text: 'Feed it' });
          go.onclick = function () { var v = numOf(demo.value); if (!isNaN(v)) feedIt(v); };
          demo.onkeydown = function (e) { if (e.key === 'Enter') go.click(); };
          var rr = H('div', 'row'); rr.appendChild(demo); rr.appendChild(go); area.appendChild(rr);
          var lg0 = H('div', 'log'); tried.forEach(function (t) { lg0.appendChild(H('span', '', esc(numTxt(t[0]) + ' → ' + (isFinite(t[1]) ? numTxt(t[1]) : '!')))); }); area.appendChild(lg0);
          return;
        }
        var inp = el('input', { type: 'text', inputmode: 'decimal', placeholder: 'A number to feed in', 'aria-label': 'Number to feed in', autocomplete: 'off' });
        var fb = el('button', { type: 'button', 'class': 'btn', text: 'Feed it' });
        fb.onclick = function () { var v = numOf(inp.value); if (!inp.value.trim()) return inp.focus(); if (isNaN(v)) { SFA.toast('Feed it a number, like 0 or 5.'); return; } feedIt(v); };
        inp.onkeydown = function (e) { if (e.key === 'Enter') fb.click(); };
        var row = H('div', 'row'); row.appendChild(inp); row.appendChild(fb); area.appendChild(row);
        var lg = H('div', 'log'); tried.forEach(function (t) { lg.appendChild(H('span', '', esc(numTxt(t[0]) + ' → ' + (isFinite(t[1]) ? numTxt(t[1]) : '!')))); });
        if (!tried.length) lg.appendChild(H('span', '', 'Nothing fed in yet. Try 0.'));
        area.appendChild(lg);
        var a = mine[s.id];
        if (tried.length || (a && a.answer)) {
          var g = el('input', { type: 'text', placeholder: 'The rule, like 2x + 1', 'aria-label': 'The rule', autocomplete: 'off' });
          if (a && a.answer) g.value = String(a.answer).split(' (tried')[0];
          var cb = el('button', { type: 'button', 'class': 'btn primary', text: 'Check my rule' });
          var r2 = H('div', 'row'); r2.appendChild(g); r2.appendChild(cb); area.appendChild(r2);
          if (a && a.correct === true) area.appendChild(H('div', 'fb good', '<b>Cracked it!</b> The rule is ' + esc(s.rule.replace(/-/g, '−')) + '. ' + (tried.length <= 3 ? 'Only ' + tried.length + ' input' + (tried.length === 1 ? '' : 's') + '. Pro move.' : '')));
          else if (a && a.correct === false) area.appendChild(H('div', 'fb try', 'Not quite. Feed it a number where your rule and the machine might disagree, and look again.'));
          else area.appendChild(H('p', 'state', 'Write the rule with x, like 2x + 1 or 3(x − 2).'));
          if (a && a.answer) area.appendChild(stateLine(s.id));
          cb.onclick = function () {
            var f = parseRule(g.value); if (!g.value.trim()) return g.focus();
            if (!f) { SFA.toast('Write it with x, like 2x + 1.'); return; }
            var ok = sameRule(f, rule);
            record(s, g.value.trim() + ' (tried ' + tried.map(function (t) { return numTxt(t[0]); }).join(', ') + ')', ok);
            mine[s.id].tried = tried; saveLocal(); if (ok) { confetti(); m.querySelector('.mlabel').textContent = s.rule.replace(/-/g, '−'); }
            draw();
          };
          g.onkeydown = function (e) { if (e.key === 'Enter') cb.click(); };
        }
        if (a && a.correct === true) m.querySelector('.mlabel').textContent = s.rule.replace(/-/g, '−');
      }
      d._upd = draw; draw();
    },
    play: function (s, d) {
      var w = head(s, d); w.appendChild(H('h2', '', fmt(s.title)));
      var c = H('div', 'cols top grow'), l = H('div', 'st'), r = H('div', 'st');
      var ol = H('ol', 'pts'); (s.steps || []).forEach(function (p) { ol.appendChild(H('li', '', fmt(p))); }); l.appendChild(ol);
      if (s.aim) l.appendChild(H('p', 'note', fmt(s.aim)));
      var a = H('a', 'go', '🕹️ Open ' + esc(LES.game.title)); a.href = LES.game.file; a.target = '_blank'; a.rel = 'noopener'; r.appendChild(a);
      r.appendChild(H('p', 'onyours', 'It opens in a new tab. Come back to this tab when the timer ends.'));
      var tbox = H('div', 'timer'); r.appendChild(tbox);
      c.appendChild(l); c.appendChild(r); d.appendChild(c);
      var local = null, iv = null;
      function tick() {
        var t = (isLive() || MODE !== 'student') && live && live.timer ? live.timer : local;
        tbox.innerHTML = '';
        if (!t) {
          if (MODE === 'student') { var b = el('button', { type: 'button', 'class': 'btn', text: 'Start my ' + (s.minutes || 10) + '-minute timer' }); b.onclick = function () { local = { end: Date.now() + (s.minutes || 10) * 60000, total: (s.minutes || 10) * 60 }; tick(); }; tbox.appendChild(b); }
          return;
        }
        var left = Math.max(0, Math.round((t.end - Date.now()) / 1000)), p = t.total ? 100 * left / t.total : 0;
        var ring = H('div', 'ring' + (left ? '' : ' done')); ring.style.setProperty('--p', p.toFixed(1)); ring.appendChild(H('span', '', Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2)));
        tbox.appendChild(ring); tbox.appendChild(H('span', '', left ? 'Keep playing!' : '<b>Time\'s up.</b> Come back to the lesson.'));
      }
      d._upd = tick; tick(); iv = setInterval(function () { if (!document.body.contains(d)) return clearInterval(iv); tick(); }, 1000);
    },
    end: function (s, d, show) {
      var w = head(s, d); w.appendChild(H('div', 'bigicon', '🏆')); w.appendChild(H('h1', '', fmt(s.title || 'Done!')));
      var qs = questions(), n = qs.filter(function (x) { return mine[x.id]; }).length;
      if (!show) w.appendChild(H('p', 'q', 'You answered <b>' + n + ' of ' + qs.length + '</b> questions today.'));
      if (LES.big) w.appendChild(H('p', 'sub', '<span class="kick">Remember</span><br>' + fmt(LES.big)));
      if (s.next) w.appendChild(H('p', 'sub', fmt(s.next)));
      if (!show) { var row = H('div', 'row'); row.style.justifyContent = 'center'; var a = H('a', 'go', '🏆 My Results'); a.href = 'results.html'; row.appendChild(a); var b = H('a', 'btn', 'All lessons'); b.href = 'lessons.html'; row.appendChild(b); w.appendChild(row); }
    }
  };
  function show_(v) { return numTxt(v); }

  function choice(s, d, show, opts, isConf) {
    var w = head(s, d), left = H('div', 'st'); qline(s, left);
    var list = H('div', isConf ? 'opts conf' : 'opts'); left.appendChild(list);
    var foot = H('div', 'st'); left.appendChild(foot);
    withFig(s, d, left);
    var FACES = ['😵', '🤔', '🙂', '😎'];
    d._upd = function () {
      list.innerHTML = ''; foot.innerHTML = '';
      var a = mine[s.id], picked = a ? parseInt(a.answer, 10) - 1 : -1;
      var rv = reveal(s.id), selfPaced = MODE === 'student' && !isLive();
      var counts = null;
      if (show && feed && feed.per[s.id]) counts = feed.per[s.id].counts;
      if (show && MODE === 'screen' && !rv) counts = null;
      if (MODE === 'student' && rv >= 1 && live.counts && live.counts[s.id]) counts = live.counts[s.id];
      var total = counts ? counts.reduce(function (x, y) { return x + y; }, 0) : 0;
      var showAns = s.ans != null && (rv >= 2 || (selfPaced && a) || (MODE === 'teach' && console_ && console_.peek));
      opts.forEach(function (o, i) {
        var b = el('button', { type: 'button', 'class': 'opt' + (i === picked ? ' mine' : '') + (showAns && i === s.ans ? ' right' : '') });
        var bar = H('i', 'bar'); b.appendChild(bar);
        if (isConf) b.appendChild(H('span', 'e', FACES[i]));
        else b.appendChild(H('span', 'L', letter(i)));
        var t = H('span', 't', fmt(o)); b.appendChild(t);
        if (MODE === 'teach' && console_ && console_.names && feed && feed.per[s.id] && feed.per[s.id].who[i]) t.appendChild(H('span', 'names', esc(feed.per[s.id].who[i].join(', '))));
        if (counts) { var pc = total ? Math.round(100 * (counts[i] || 0) / total) : 0; b.appendChild(H('span', 'pc', pc + '%')); setTimeout(function () { bar.style.width = pc + '%'; }, 60); }
        if (show) b.disabled = true;
        else b.onclick = function () { record(s, (i + 1) + '. ' + plain(o), s.ans != null ? i === s.ans : null); d._upd(); };
        list.appendChild(b);
      });
      if (show) foot.appendChild(tallyFor(s.id));
      else if (a) foot.appendChild(stateLine(s.id));
      if (!show && a && !selfPaced && rv < 1) foot.appendChild(H('p', 'state', TEACHER + ' will share the class results. You can change your answer until then.'));
      if (showAns && s.why) foot.appendChild(H('div', 'reveal', '<b>' + (MODE === 'student' && a ? (picked === s.ans ? 'Yes! ' : 'Not this time. ') : '') + '</b>' + fmt(s.why)));
      else if (isConf && !show && a) foot.appendChild(H('p', 'state', 'Thanks. That helps ' + TEACHER + ' plan the next lesson.'));
    };
    d._upd();
  }

  function typed(s, d, show, isExit) {
    var w = head(s, d);
    if (isExit) w.appendChild(H('p', 'kick', 'Exit ticket'));
    var left = H('div', 'st'); qline(s, left);
    var box = H('div', 'ans'); left.appendChild(box); withFig(s, d, left);
    var draft = null;
    d._upd = function () {
      var ta0 = box.querySelector('textarea'); if (ta0) draft = ta0.value;
      box.innerHTML = '';
      var sp = spotFor(s.id), rv = reveal(s.id), a = mine[s.id];
      if (show) {
        box.appendChild(tallyFor(s.id));
        if (sp) box.appendChild(sp);
        if (s.model && (rv >= 2 || (MODE === 'teach' && console_ && console_.peek))) box.appendChild(H('div', 'reveal', '<b>One good answer:</b> ' + fmt(s.model)));
        return;
      }
      var ta = el('textarea', { 'aria-label': 'Your answer', placeholder: s.ph || 'Type your answer', maxlength: '600' });
      ta.value = draft != null ? draft : a ? a.answer : '';
      function fit() { ta.style.height = 'auto'; ta.style.height = Math.max(ta.scrollHeight + 4, 0) + 'px'; }
      ta.addEventListener('input', fit); setTimeout(fit, 0);
      var btn = el('button', { type: 'button', 'class': 'btn primary', text: a ? 'Send again' : 'Send' });
      btn.onclick = function () { var v = ta.value.trim(); if (!v) { SFA.toast('Type something first. A guess is fine.'); return ta.focus(); } draft = null; record(s, v, null); d._upd(); };
      box.appendChild(ta);
      var row = H('div', 'row'); row.appendChild(btn);
      if (s.hint && !a) { var hb = el('button', { type: 'button', 'class': 'btn small', text: 'Need a start?' }); hb.onclick = function () { hb.replaceWith(H('span', 'state', fmt(s.hint))); }; row.appendChild(hb); }
      box.appendChild(row);
      if (a) box.appendChild(stateLine(s.id));
      if (sp) box.appendChild(sp);
      if (s.model && a && (rv >= 2 || !isLive())) box.appendChild(H('div', 'reveal', '<b>One good answer:</b> ' + fmt(s.model)));
    };
    d._upd();
  }

  /* ---------------- deck ---------------- */
  var deck, dots, counter, prevB, nextB;
  function upd() { if (slideEl) try { slideEl._upd(); } catch (e) { } refreshDots(); }
  function refreshDots() {
    if (!dots) return;
    [].forEach.call(dots.children, function (b, i) {
      var s = LES.slides[i];
      b.className = (i === cur ? 'cur' : i < cur ? 'seen' : '') + (s.id && mine[s.id] ? ' ok' : '');
    });
    if (counter) counter.textContent = (cur + 1) + ' / ' + LES.slides.length;
    var lk = locked();
    if (prevB) prevB.disabled = cur === 0 || lk;
    if (nextB) nextB.disabled = cur === LES.slides.length - 1 || lk;
    if (dots) dots.style.pointerEvents = lk ? 'none' : '';
  }
  function render(i, dir, quiet) {
    i = Math.max(0, Math.min(LES.slides.length - 1, i));
    var old = slideEl;
    if (old && old.contains(document.getElementById('sfaAccount'))) document.getElementById('acctHold').appendChild(document.getElementById('sfaAccount'));
    cur = i; slideEl = build(LES.slides[i], i);
    if (!quiet) slideEl.classList.add('in'); if (dir < 0) slideEl.classList.add('back');
    if (old) { if (quiet) old.remove(); else { old.classList.add('out'); if (dir < 0) old.classList.add('back'); setTimeout(function () { old.remove(); }, 380); } }
    deck.appendChild(slideEl);
    fitWatch(slideEl);
    if (MODE === 'student') SFA.store.set('les.at.' + LID, cur);
    refreshDots();
    if (MODE === 'teach') consoleSlide();
    if (MODE === 'screen' && bc && !quiet) { }
  }
  // shrink a slide's text a little at a time until everything fits on the 16:9 slide (laptop and class screen; phones scroll)
  function fit(el) {
    if (!el || !el.isConnected) return;
    el.style.fontSize = '';
    if (getComputedStyle(el).position !== 'absolute') return;
    var base = parseFloat(getComputedStyle(el).fontSize), f = base;
    while (el.scrollHeight > el.clientHeight + 2 && f > base * 0.7) { f *= 0.95; el.style.fontSize = f + 'px'; }
  }
  function fitWatch(el) {
    var queued = false;
    function later() { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; fit(el); }); }
    fit(el); setTimeout(function () { fit(el); }, 800);
    if (window.MutationObserver) new MutationObserver(function (ms) { if (ms.some(function (m) { return m.target.tagName !== 'TEXTAREA'; })) later(); }).observe(el, { childList: true, subtree: true, characterData: true });
  }
  window.addEventListener('resize', function () { fit(slideEl); });
  function go(i, byHand) {
    if (i === cur || i < 0 || i >= LES.slides.length) return;
    var dir = i > cur ? 1 : -1;
    if (locked() && byHand) { SFA.toast(TEACHER + ' is moving the slides for everyone right now.'); return; }
    if (MODE === 'student' && byHand && isLive() && follow && i !== live.slide) { follow = false; drawTop(); }
    if (MODE === 'screen' && byHand && bc && consoleSeen) { bc.postMessage({ t: 'nav', to: i }); return; }
    render(i, dir);
  }

  /* ---------------- top bar ---------------- */
  var topChips, liveChip, acctChip, banner;
  function drawTop() {
    if (!liveChip) return;
    if (MODE === 'student') {
      liveChip.hidden = !isLive();
      liveChip.className = 'chip live';
      liveChip.textContent = locked() ? 'Live: ' + TEACHER + ' is moving the slides' : follow ? 'Live with ' + TEACHER : 'Back to ' + TEACHER + '\'s slide';
      refreshDots();
      liveChip.setAttribute('aria-pressed', follow ? 'true' : 'false');
      var other = live && live.lesson !== LID && Date.now() - live.at < LIVE_FRESH;
      banner.hidden = !other;
      if (other) { banner.innerHTML = ''; banner.appendChild(H('span', '', '<b>' + TEACHER + ' is teaching Lesson ' + esc(live.lesson.slice(1)) + ' right now.</b>')); var a = H('a', 'btn primary small', 'Join it'); a.href = 'lesson.html?l=' + live.lesson.slice(1); banner.appendChild(a); }
    }
  }
  function acctDraw() {
    if (!acctChip) return;
    if (!saving) { acctChip.hidden = true; return; }
    if (S.me) { acctChip.textContent = '✓ ' + first(S.me.name); acctChip.className = 'chip static'; acctChip.onclick = null; }
    else { acctChip.textContent = 'Not signed in: answers won\'t count'; acctChip.className = 'chip warn'; acctChip.onclick = function () { var k = LES.slides.findIndex(function (s) { return s.k === 'signin'; }); go(k >= 0 ? k : 0, true); }; }
  }

  /* ---------------- live: students check what the teacher is showing ---------------- */
  var pollT = null;
  function pollLive() {
    clearTimeout(pollT);
    if (!CFG.endpoint) return;
    if (document.visibilityState === 'hidden') { pollT = setTimeout(pollLive, 15000); return; }
    post({ op: 'live' }).then(function (j) {
      var was = isLive(), before = JSON.stringify(live);
      live = j.live || null;
      if (locked()) follow = true;
      if (isLive() && follow && live.slide !== cur) render(live.slide, live.slide > cur ? 1 : -1);
      else if (JSON.stringify(live) !== before) upd();
      if (!was && isLive()) { follow = true; SFA.toast(TEACHER + ' is live. Your screen will follow the lesson.', 3500); }
      drawTop();
      pollT = setTimeout(pollLive, isLive() ? 5000 + Math.random() * 1500 : 20000);
    }, function (e) {
      if (/unknown op/.test(e.message)) return;   // older results script: no live mode
      pollT = setTimeout(pollLive, 20000);
    });
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && MODE === 'student') pollLive(); });

  /* ---------------- class screen <-> console (same browser) ---------------- */
  var bc = null, consoleSeen = false;
  try { bc = new BroadcastChannel('sfa-lesson-' + LID); } catch (e) { }
  function screenListen() {
    if (!bc) return;
    bc.onmessage = function (e) {
      var m = e.data || {};
      if (m.t === 'state') {
        consoleSeen = true; live = m.live; feed = m.feed;
        if (m.slide !== cur) render(m.slide, m.slide > cur ? 1 : -1); else upd();
      }
    };
    bc.postMessage({ t: 'hello' });
  }

  /* ---------------- teacher console ---------------- */
  var KEY = 'sfa.classkey';
  var Key = {
    get: function () { try { var s = sessionStorage.getItem(KEY); if (s) return s; var r = JSON.parse(localStorage.getItem(KEY) || 'null'); if (r && r.until > Date.now()) return r.k; } catch (e) { } return ''; },
    set: function (k, remember) { try { sessionStorage.setItem(KEY, k); if (remember) { var d = new Date(); d.setHours(23, 59, 59, 0); localStorage.setItem(KEY, JSON.stringify({ k: k, until: d.getTime() })); } } catch (e) { } },
    del: function () { try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) { } }
  };
  function tpost(op, body) { return post(Object.assign({ op: op, teacherKey: Key.get() }, body || {})); }

  function askKey(msg) {
    var main = document.querySelector('.lmain'); main.innerHTML = '';
    var inp = el('input', { type: 'password', 'class': 'num', style: 'width:22em;max-width:100%', autocomplete: 'off', 'aria-label': 'Teacher key' });
    var rem = el('input', { type: 'checkbox', id: 'remKey' });
    var b = el('button', { type: 'button', 'class': 'btn primary', text: 'Open the console', onclick: function () { Key.set(inp.value.trim(), rem.checked); location.reload(); } });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') b.click(); });
    main.appendChild(el('div', { 'class': 'card keybox' }, [
      el('h2', { text: 'Teacher key' }),
      el('p', { 'class': 'muted', text: msg || 'Paste the teacher key from the results script (Project Settings > Script properties > TEACHER_KEY). It is the same key as Class Results.' }),
      el('div', { 'class': 'row' }, [inp, b]),
      el('label', { 'for': 'remKey', style: 'display:flex;gap:8px;align-items:center;margin-top:10px' }, [rem, 'Remember on this computer until the end of today'])
    ]));
    inp.focus();
  }

  function consoleInit() {
    console_ = { on: false, lock: SFA.store.get('teacher.lesson.lock', true) !== false, reveal: {}, spot: null, timer: null, cls: SFA.store.get('teacher.lesson.cls', ''), names: true, peek: false, data: null, since: 0, picked: '' };
    if (!CFG.endpoint) { console_.offline = true; }
    else if (!Key.get()) return askKey(), false;
    var panel = H('aside', 'panel'); panel.id = 'tpanel';
    document.querySelector('.lmain').appendChild(panel);
    if (bc) bc.onmessage = function (e) { var m = e.data || {}; if (m.t === 'hello') broadcast(); if (m.t === 'nav') go(m.to, true); };
    if (!console_.offline) fetchAnswers();
    setInterval(function () { if (!console_.offline) fetchAnswers(); }, 4000);
    setInterval(function () { if (console_.on) pushLive(); }, 120000);
    tpost('live').then(function (j) { if (j.live && j.live.lesson === LID && Date.now() - j.live.at < LIVE_FRESH) { console_.on = true; console_.reveal = j.live.reveal || {}; console_.spot = j.live.spot; console_.timer = j.live.timer; console_.since = Date.now(); console_.lock = !!j.live.lock; if (j.live.slide !== cur) render(j.live.slide, 1); consolePanel(); } }, function () { });
    return true;
  }
  function fetchAnswers() {
    tpost('answers', { lesson: LID }).then(function (j) { console_.data = j; console_.err = ''; computeFeed(); consolePanel(); upd(); broadcast(); pushCountsIfChanged(); },
      function (e) {
        if (/teacher key/.test(e.message)) { Key.del(); askKey('That key didn\'t work. Check it and try again.'); return; }
        console_.err = /unknown op/.test(e.message) ? 'The results script needs updating before answers and live mode work: paste the new Code.gs and deploy a new version (see SETUP.md).' : 'Can\'t reach the results sheet right now. Retrying.';
        consolePanel();
      });
  }
  function rosterIn() { var r = (console_.data && console_.data.roster) || []; return console_.cls ? r.filter(function (x) { return x.cls === console_.cls; }) : r; }
  function computeFeed() {
    var roster = rosterIn(), ids = {}, name = {};
    roster.forEach(function (r) { ids[r.sid] = 1; name[r.sid] = nice(r.name); });
    var per = {};
    questions().forEach(function (s) {
      var n = s.k === 'conf' ? 4 : s.opts ? s.opts.length : 0, p = per[s.id] = { n: 0, right: 0, counts: [], who: [], list: [], sids: {} };
      for (var i = 0; i < n; i++) { p.counts.push(0); p.who.push([]); }
    });
    ((console_.data && console_.data.answers) || []).forEach(function (a) {
      if (!ids[a.sid]) return; var p = per[a.q]; if (!p) return;
      p.n++; p.sids[a.sid] = 1; if (a.correct === 'yes') p.right++;
      var k = parseInt(a.answer, 10) - 1;
      if (p.counts.length && k >= 0 && k < p.counts.length) { p.counts[k]++; p.who[k].push(first(name[a.sid])); }
      p.list.push({ sid: a.sid, name: name[a.sid], answer: a.answer, correct: a.correct, time: a.time });
    });
    feed = { total: roster.length, per: per };
  }
  function broadcast() { if (bc) bc.postMessage({ t: 'state', slide: cur, live: liveObj(), feed: feed }); }
  function liveObj() {
    var counts = {};
    Object.keys(console_.reveal).forEach(function (q) { if (console_.reveal[q] && feed && feed.per[q] && feed.per[q].counts.length) counts[q] = feed.per[q].counts; });
    return { lesson: LID, slide: cur, at: Date.now(), reveal: console_.reveal, counts: counts, spot: console_.spot, timer: console_.timer, lock: console_.lock };
  }
  var pushT = null, lastCounts = '';
  function pushLive() {
    live = liveObj(); upd(); broadcast();
    if (!console_.on || console_.offline) return;
    clearTimeout(pushT);
    pushT = setTimeout(function () { var L = liveObj(); lastCounts = JSON.stringify(L.counts); tpost('setLive', { live: L }).catch(function (e) { SFA.toast('Couldn\'t update the class: ' + e.message, 4000); }); }, 300);
  }
  function pushCountsIfChanged() { if (console_.on && JSON.stringify(liveObj().counts) !== lastCounts) pushLive(); }
  function consoleSlide() { if (!console_) return; console_.picked = ''; console_.peek = false; pushLive(); consolePanel(); }

  function consolePanel() {
    var p = document.getElementById('tpanel'); if (!p || !LES) return;
    var s = LES.slides[cur]; p.innerHTML = '';
    // live controls
    var top = H('div', 'sect');
    var lb = el('button', { type: 'button', 'class': 'btn ' + (console_.on ? '' : 'primary'), text: console_.on ? 'End live lesson' : 'Go live' });
    lb.onclick = function () {
      console_.on = !console_.on;
      if (console_.on) { console_.since = Date.now(); pushLive(); SFA.toast('Live. Students\' screens now follow your slides.'); }
      else tpost('setLive', { live: null }).then(function () { SFA.toast('Live lesson ended.'); });
      consolePanel(); liveChip.hidden = !console_.on;
    };
    if (console_.offline) lb.disabled = true;
    var sc = el('button', { type: 'button', 'class': 'btn', text: 'Open class screen' });
    sc.onclick = function () { window.open('lesson.html?l=' + N + '&screen', 'sfa-screen-' + LID, 'width=1280,height=760'); };
    var row = H('div', 'row'); row.appendChild(lb); row.appendChild(sc); top.appendChild(row);
    var lk = el('label', { style: 'display:flex;gap:8px;align-items:center' }), cb = el('input', { type: 'checkbox' }); cb.checked = console_.lock;
    cb.onchange = function () { console_.lock = cb.checked; SFA.store.set('teacher.lesson.lock', cb.checked); pushLive(); };
    lk.appendChild(cb); lk.appendChild(document.createTextNode('Keep everyone on my slide (students can\'t move ahead or back)')); top.appendChild(lk);
    top.appendChild(H('p', 'muted', console_.on ? 'Live for ' + Math.round((Date.now() - console_.since) / 60000) + ' min. Share the class screen window, not this one.' : 'Share the class screen window. Go live so students\' devices follow you and the polls open.'));
    if (console_.err) top.appendChild(H('p', 'state bad', esc(console_.err)));
    p.appendChild(top);

    // class filter
    var roster = (console_.data && console_.data.roster) || [], classes = [];
    roster.forEach(function (r) { if (r.cls && classes.indexOf(r.cls) < 0) classes.push(r.cls); });
    if (classes.length > 1) {
      var sel = el('select', { 'class': 'sel', 'aria-label': 'Class' }); sel.appendChild(el('option', { value: '', text: 'All classes' }));
      classes.sort().forEach(function (c) { var o = el('option', { value: c, text: 'Class ' + c }); if (c === console_.cls) o.selected = true; sel.appendChild(o); });
      sel.onchange = function () { console_.cls = sel.value; SFA.store.set('teacher.lesson.cls', sel.value); computeFeed(); consolePanel(); upd(); broadcast(); pushCountsIfChanged(); };
      p.appendChild(sel);
    }

    // this slide
    var sec = H('div', 'sect'); sec.appendChild(H('h3', '', 'This slide · planned ' + (s.min || 0) + ' min'));
    if (s.id && feed) {
      var f = feed.per[s.id], n = f ? f.n : 0, tot = feed.total || 0;
      sec.appendChild(H('div', '', '<b>' + n + '</b> of ' + tot + ' answered'));
      var pb = H('div', 'pbar'), bi = H('i'); bi.style.width = (tot ? 100 * n / tot : 0) + '%'; pb.appendChild(bi); sec.appendChild(pb);
      if (s.k === 'number' || s.k === 'machine') sec.appendChild(H('p', 'muted', f.right + ' got it right'));
      var rv = console_.reveal[s.id] || 0, r2 = H('div', 'row');
      var canShow = s.k === 'poll' || s.k === 'conf';
      if (canShow) r2.appendChild(el('button', { type: 'button', 'class': 'btn small' + (rv >= 1 ? ' good' : ''), text: rv >= 1 ? 'Results showing' : 'Show results to class', onclick: function () { console_.reveal[s.id] = rv >= 1 ? 0 : 1; pushLive(); consolePanel(); } }));
      if ((s.k === 'poll' && s.ans != null) || s.model || s.k === 'number' || s.k === 'machine') r2.appendChild(el('button', { type: 'button', 'class': 'btn small' + (rv >= 2 ? ' good' : ''), text: rv >= 2 ? 'Answer showing' : 'Reveal the answer', onclick: function () { console_.reveal[s.id] = rv >= 2 ? (canShow ? 1 : 0) : 2; pushLive(); consolePanel(); } }));
      r2.appendChild(el('button', { type: 'button', 'class': 'btn small', text: console_.peek ? 'Hide answer here' : 'Peek at answer (only here)', onclick: function () { console_.peek = !console_.peek; upd(); consolePanel(); } }));
      if (s.k === 'poll' || s.k === 'conf') r2.appendChild(el('button', { type: 'button', 'class': 'btn small', text: console_.names ? 'Hide names' : 'Show names', onclick: function () { console_.names = !console_.names; upd(); consolePanel(); } }));
      sec.appendChild(r2);
      if (console_.spot && console_.spot.q === s.id) sec.appendChild(el('button', { type: 'button', 'class': 'btn small', text: 'Stop spotlight', onclick: function () { console_.spot = null; pushLive(); consolePanel(); } }));
      // answers list
      if (f && f.list.length && s.k !== 'poll' && s.k !== 'conf') {
        var al = H('div', 'alist');
        f.list.slice().sort(function (a, b) { return a.time < b.time ? 1 : -1; }).forEach(function (a) {
          var c = H('div', 'a' + (a.correct === 'yes' ? ' ok' : a.correct === 'no' ? ' no' : ''));
          c.appendChild(H('b', '', esc(a.name || a.sid) + (a.correct === 'yes' ? ' ✓' : a.correct === 'no' ? ' ✗' : '')));
          c.appendChild(document.createTextNode(a.answer));
          if (s.k === 'open' || s.k === 'exit') { var rr = H('div', 'row'); rr.appendChild(el('button', { type: 'button', 'class': 'btn small', text: 'Spotlight (no name)', onclick: function () { console_.spot = { q: s.id, text: a.answer }; pushLive(); consolePanel(); } })); c.appendChild(rr); }
          al.appendChild(c);
        });
        sec.appendChild(al);
      }
      var not = rosterIn().filter(function (r) { return !(f && f.sids[r.sid]); });
      if (not.length && not.length < rosterIn().length + 1) {
        sec.appendChild(H('h3', '', 'Not answered yet (' + not.length + ')'));
        var wd = H('div', 'who'); not.forEach(function (r) { wd.appendChild(H('span', '', esc(nice(r.name)))); }); sec.appendChild(wd);
      }
    } else if (s.k === 'play') {
      var mins = s.minutes || 10, rt = H('div', 'row');
      rt.appendChild(el('button', { type: 'button', 'class': 'btn small primary', text: console_.timer ? 'Restart ' + mins + '-minute timer' : 'Start ' + mins + '-minute timer', onclick: function () { console_.timer = { end: Date.now() + mins * 60000, total: mins * 60 }; pushLive(); consolePanel(); } }));
      if (console_.timer) rt.appendChild(el('button', { type: 'button', 'class': 'btn small', text: 'Stop timer', onclick: function () { console_.timer = null; pushLive(); consolePanel(); } }));
      sec.appendChild(rt);
      sec.appendChild(H('p', 'muted', 'Students see the countdown on their own screens and on the class screen.'));
    } else sec.appendChild(H('p', 'muted', s.k === 'film' ? 'Students open the Cinema in a new tab. You can also play the film on your shared screen.' : 'Nothing to collect on this slide.'));
    p.appendChild(sec);

    // pick someone
    var pk = H('div', 'sect'); pk.appendChild(H('h3', '', 'Pick someone'));
    var pr = H('div', 'row');
    pr.appendChild(el('button', { type: 'button', 'class': 'btn small', text: 'Random student', onclick: function () { var r = rosterIn(); if (!r.length) return; var f2 = s.id && feed && feed.per[s.id], pool = f2 && f2.n ? r.filter(function (x) { return f2.sids[x.sid]; }) : r; console_.picked = nice(pool[Math.floor(Math.random() * pool.length)].name); consolePanel(); } }));
    pk.appendChild(pr);
    if (console_.picked) pk.appendChild(H('div', 'picked', esc(console_.picked)));
    p.appendChild(pk);

    // outline
    var ol = H('div', 'sect'); ol.appendChild(H('h3', '', 'Lesson plan · ' + LES.slides.reduce(function (t, x) { return t + (x.min || 0); }, 0) + ' min'));
    var ul = H('ul', 'outline'), at = 0;
    LES.slides.forEach(function (x, i) {
      var b = el('button', { type: 'button', 'class': i === cur ? 'cur' : '', onclick: function () { go(i, true); } });
      var lab = x.title || x.q || x.name || x.k;
      var f3 = x.id && feed && feed.per[x.id];
      b.appendChild(H('span', '', (i + 1) + '. ' + esc(plain(lab)).slice(0, 48)));
      b.appendChild(H('span', 'm', (f3 ? f3.n + '✓ · ' : '') + at + '′'));
      at += x.min || 0;
      var li = H('li'); li.appendChild(b); ul.appendChild(li);
    });
    ol.appendChild(ul); p.appendChild(ol);
    var links = H('p', 'muted', '<a href="participation.html">Participation across all lessons</a> · <a href="lessons.html">All lessons</a>');
    p.appendChild(links);
  }

  /* ---------------- start ---------------- */
  function boot() {
    var top = H('header', 'ltop');
    var brand = H('a', 'brand', 'Sandy Flats'); brand.href = MODE === 'teach' ? 'lessons.html?teach' : 'lessons.html'; top.appendChild(brand);
    top.appendChild(H('h1', 'gtitle', 'Lesson ' + LES.n + ': ' + esc(LES.title) + (MODE === 'teach' ? ' · Teacher console' : '')));
    counter = H('span', 'count'); top.appendChild(counter);
    topChips = H('div', 'chips'); top.appendChild(topChips);
    liveChip = el('button', { type: 'button', 'class': 'chip live', hidden: '' });
    liveChip.onclick = function () { if (MODE === 'student') { follow = true; if (isLive()) go(live.slide); drawTop(); } };
    topChips.appendChild(liveChip);
    if (MODE === 'student') { acctChip = el('button', { type: 'button', 'class': 'chip' }); topChips.appendChild(acctChip); }
    document.body.insertBefore(top, document.body.firstChild);
    banner = H('div', 'banner'); banner.hidden = true; top.after(banner);
    var main = document.querySelector('.lmain');
    var col = H('div'); col.style.width = '100%'; col.style.display = 'flex'; col.style.flexDirection = 'column'; col.style.alignItems = 'center';
    deck = H('div', 'deck'); deck.setAttribute('aria-live', 'polite'); col.appendChild(deck);
    var nav = H('nav', 'lnav'); nav.setAttribute('aria-label', 'Slides');
    prevB = el('button', { type: 'button', 'class': 'btn', text: '◀ Back', onclick: function () { go(cur - 1, true); } });
    nextB = el('button', { type: 'button', 'class': 'btn primary', text: 'Next ▶', onclick: function () { go(cur + 1, true); } });
    dots = H('div', 'dots');
    LES.slides.forEach(function (s, i) { var b = el('button', { type: 'button', 'aria-label': 'Slide ' + (i + 1), onclick: function () { go(i, true); } }); dots.appendChild(b); });
    nav.appendChild(prevB); nav.appendChild(dots); nav.appendChild(nextB); col.appendChild(nav);
    main.appendChild(col);
    if (MODE === 'screen') document.body.appendChild(H('div', 'screenhint', 'Arrow keys change slides · F for full screen'));

    document.addEventListener('keydown', function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && MODE !== 'student')) { e.preventDefault(); go(cur + 1, true); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(cur - 1, true); }
      else if ((e.key === 'f' || e.key === 'F') && MODE === 'screen') { if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); }
    });
    document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('[data-signin]'); if (a) { e.preventDefault(); var k = LES.slides.findIndex(function (s) { return s.k === 'signin'; }); go(k >= 0 ? k : 0, true); } });

    var start = MODE === 'student' ? Math.min(SFA.store.get('les.at.' + LID, 0) || 0, LES.slides.length - 1) : 0;
    if (MODE === 'teach' && !consoleInit()) return;
    render(start, 1);
    if (MODE === 'student') {
      if (saving) S.onChange(function () { acctDraw(); upd(); if (S.me && !loadMine.done) { loadMine.done = true; loadMine(); } else if (S.me && !(S.credExpired && S.credExpired())) flush(); });
      else acctDraw();
      pollLive();
      window.addEventListener('online', flush);
      // signed in on the arcade in another tab: pick it up here
      window.addEventListener('storage', function (e) { if (e.key === 'sfa.sync.me' && e.newValue && !S.me) location.reload(); });
    }
    if (MODE === 'screen') screenListen();
    if (MODE === 'teach') { liveChip.hidden = !console_.on; liveChip.textContent = 'Live'; }
  }

  window.SFA_LESSON = function (L) { LES = L; };
  var sc = document.createElement('script');
  sc.src = 'lessons/' + LID + '.js';
  sc.onload = function () { if (!LES) return fail(); document.title = 'Lesson ' + LES.n + ': ' + LES.title + ' · Sandy Flats'; boot(); };
  sc.onerror = fail;
  function fail() { document.querySelector('.lmain').innerHTML = '<div class="card keybox"><h2>That lesson isn\'t here</h2><p class="muted">Go back to <a href="lessons.html">all lessons</a>.</p></div>'; }
  document.head.appendChild(sc);
})();
