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
  var mine = SFA.store.get('les.' + LID, {}) || {};      // this student's answers: { q: { answer, correct, sent, run } }
  // "Start fresh": the teacher's run number (seconds) rides in live.counts.zrun as three 0-9999 parts, so the
  // results script needs no change. Answers from an earlier run are cleared on students' devices and hidden on the console.
  function encRun(t) { var x = Math.floor(t / 1000); return [Math.floor(x / 1e8), Math.floor(x / 1e4) % 1e4, x % 1e4]; }
  function decRun(a) { return Array.isArray(a) && a.length === 3 ? ((a[0] * 1e4 + a[1]) * 1e4 + a[2]) * 1000 : 0; }
  function liveRun() { return live && live.lesson === LID && live.counts ? decRun(live.counts.zrun) : 0; }
  function dropOldRun() {
    var run = liveRun(); if (!run) return false;
    var gone = Object.keys(mine).filter(function (q) { return (mine[q].run || 0) !== run; });
    // only a real answer typed on this device is worth a "started fresh" note; restored or empty entries go quietly
    var loud = gone.some(function (q) { return mine[q].answer && !mine[q].restored; });
    gone.forEach(function (q) { delete mine[q]; }); if (gone.length) saveLocal();
    return gone.length ? (loud ? 2 : 1) : 0;
  }
  var console_ = null;                                    // teacher console state
  var feed = null;                                        // console data shared with the class screen

  /* ---------------- helpers ---------------- */
  function fmt(s) { return esc(s).replace(/\*([^*]+)\*/g, '<b>$1</b>').replace(/_([^_]+)_/g, '<i>$1</i>'); }
  function H(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function plain(s) { return String(s || '').replace(/[*_]/g, ''); }
  function interactive(s) { return !!s.id; }
  function questions() { return LES.slides.filter(interactive); }
  // lesson files are numbered L1-L17 in the order they were written; students see the film number (sfa-nav.js has the map)
  function shownNum(id) { var k = String(id || '').slice(1), m = window.SFA_LESSON_NUM || {}; return m[k] || k; }
  function letter(i) { return 'ABCDEFGH'.charAt(i); }
  function post(body) {
    return fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
      .then(function (r) { return r.text(); })
      .then(function (t) { var j; try { j = JSON.parse(t); } catch (e) { throw new Error('The results script didn\'t answer properly.'); } if (!j.ok) throw new Error(j.error || 'failed'); return j; });
  }
  // Students judge "still live" by when THEY last saw the teacher's state change, not by comparing clocks:
  // a student laptop with a wrong clock used to drop out of live mode (no lock, no follow).
  var liveSeen = { at: null, local: 0 };
  function noteLive(L) {
    if (!L) { liveSeen = { at: null, local: 0 }; return; }
    if (L.at === liveSeen.at) return;
    var age = Date.now() - L.at;
    liveSeen = { at: L.at, local: liveSeen.at === null ? (Math.abs(age) < LIVE_FRESH ? Date.now() - Math.max(0, age) : 0) : Date.now() };
  }
  // "End live lesson" leaves an end marker (counts.zend) rather than nothing, so a late or repeated update can't look live
  function ended(L) { return !!(L && L.counts && Array.isArray(L.counts.zend) && L.counts.zend[0] === 1); }
  function isLive() {
    if (!live || live.lesson !== LID || ended(live)) return false;
    return MODE === 'student' ? Date.now() - liveSeen.local < LIVE_FRESH : Date.now() - live.at < LIVE_FRESH;
  }
  // the lock also rides in counts.zlock, because older results scripts drop the lock field
  function liveLock(L) { return !!(L && (L.lock || (L.counts && Array.isArray(L.counts.zlock) && L.counts.zlock[0] === 1))); }
  function locked() { return MODE === 'student' && isLive() && liveLock(live); }
  function reveal(q) { return isLive() ? (live.reveal && live.reveal[q]) || 0 : 0; }
  // the class screen and console show the class's answers when the teacher shows them, or all along with "as they come in"
  function onScreen(q) { return MODE !== 'student' && (reveal(q) >= 1 || !!(live && live.auto && isLive())); }
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
      var ty = S_('text', { x: 90, y: 20, 'text-anchor': 'middle', style: 'font-size:18px;font-weight:700' }, svg); ty.textContent = 'input';
      var to = S_('text', { x: 330, y: 20, 'text-anchor': 'middle', style: 'font-size:18px;font-weight:700' }, svg); to.textContent = 'output';
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
      '<rect x="62" y="74" width="120" height="44" rx="8" fill="#1B1A22"/><text x="122" y="104" text-anchor="middle" font-family="Trebuchet MS, Verdana, sans-serif" font-weight="700" font-size="24" fill="#FFC94A" class="mlabel"></text>' +
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
  var queue = [], flushing = false, sendSeq = 0, backendOld = false, sendErr = '';
  function saveLocal() { SFA.store.set('les.' + LID, mine); }
  function record(s, answer, correct) {
    mine[s.id] = { answer: String(answer), correct: correct, sent: false, kind: s.k, run: liveRun() };
    saveLocal(); flush(); refreshDots(); clearTimeout(watchT); watchT = setTimeout(watchSend, 15000 + Math.random() * 10000);
    setTimeout(function () { if (slideEl && slideEl.scrollHeight > slideEl.clientHeight + 4) slideEl.scrollTo({ top: slideEl.scrollHeight, behavior: 'smooth' }); }, 120);
  }
  function flush() {
    if (flushing || MODE !== 'student' || !saving || !S.me) { upd(); return; }
    var todo = Object.keys(mine).filter(function (q) { return !mine[q].sent; });
    if (!todo.length) { upd(); return; }
    flushing = true; upd();
    var q = todo[0], a = mine[q], tries = 0;
    (function go() {
      var done = false, my = ++sendSeq;
      // a request the Sheet never answers would hold every later answer back: after 25 s, try again
      var hang = setTimeout(function () { if (done || my !== sendSeq) return; done = true; tries++; sendErr = 'busy'; upd(); go(); }, 25000);
      S.call('answer', { lesson: LID, q: q, kind: a.kind || 'open', answer: a.answer, correct: a.correct === true ? true : a.correct === false ? false : null }).then(function () {
        clearTimeout(hang); if (mine[q] === a) { a.sent = true; saveLocal(); }   // a late reply still counts: the row is in the Sheet
        if (my !== sendSeq) return; done = true;
        sendErr = ''; flushing = false; flush();
      }, function (e) {
        clearTimeout(hang); if (done || my !== sendSeq) return; done = true;
        tries++; sendErr = e.message || 'failed';
        if (/busy/.test(e.message)) return setTimeout(go, Math.min(12000, 1500 + Math.random() * 2500 * tries));   // the Sheet is busy with the class's answers: keep going, never give up
        if (/unknown op/.test(e.message)) backendOld = true;
        if (/sign in/.test(e.message) && S.refresh && CFG.auth !== 'code' && tries < 2) return S.refresh().then(function (err) { if (!err) go(); else { flushing = false; upd(); } });
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
    d.textContent = sendErr && /busy/.test(sendErr) ? 'Sending… (lots of answers arriving at once, keep going: it will get there)' : 'Sending…'; return d;
  }
  function loadMine() {
    if (MODE !== 'student' || !saving || !S.me) return;
    S.call('myAnswers', { lesson: LID }).then(function (j) {
      Object.keys(j.answers || {}).forEach(function (q) { if (q === 'zflag') return; if (!mine[q]) mine[q] = { answer: j.answers[q].answer, correct: j.answers[q].correct === 'yes' ? true : j.answers[q].correct === 'no' ? false : null, sent: true, restored: true }; });
      saveLocal(); render(cur, 0, true); flush();
    }, function (e) { if (/unknown op/.test(e.message)) { backendOld = true; upd(); } else flush(); });
  }

  /* ---------------- focus watch (student) ----------------
     For each question, while its slide is open: times the student left the page (another tab, window or app) before
     answering and for how long, text pasted into an answer box, the question copied, and screenshot keys.
     One summary row per student (q 'zflag') goes to the Responses tab; the console shows it. Browsers can't see a
     photo taken with a phone or most screenshot tools, so these are hints for the teacher, not proof. */
  var watch = { run: 0, q: {} }, away = null, watchSent = '', watchT = null, watchTold = false;
  function watchFor(s) {
    if (MODE !== 'student' || !s || !s.id) return null;
    var run = liveRun(); if ((watch.run || 0) !== run) { watch = { run: run, q: {} }; watchSent = ''; }
    return watch.q[s.id] || (watch.q[s.id] = [0, 0, 0, 0, 0, 0]);   // [left, seconds away, pastes, characters pasted, copies, screenshot keys]
  }
  function watchEnc() {
    var parts = [];
    Object.keys(watch.q).forEach(function (q) { var w = watch.q[q]; if (w.some(function (x) { return x > 0; })) parts.push(q + ':' + w.join(',')); });
    return parts.length ? 'v1;' + parts.join(';') : '';
  }
  function watchBump(i, by) {
    var w = watchFor(LES && LES.slides[cur]); if (!w) return;
    w[i] += by; SFA.store.set('les.watch.' + LID, watch);
    clearTimeout(watchT); watchT = setTimeout(watchSend, 3000);
  }
  var watchLast = 0;
  function watchSend() {
    if (!saving || !S.me) return;
    var v = watchEnc(); if (!v || v === watchSent || v.length > 590) return;
    // answers come first: the flag summary waits until this student's answers are in, and goes at most every 20 s
    var wait = flushing || Object.keys(mine).some(function (k) { return !mine[k].sent; }) ? 8000 : Math.max(0, watchLast + 20000 - Date.now());
    if (wait) { clearTimeout(watchT); watchT = setTimeout(watchSend, wait + Math.random() * 3000); return; }
    watchLast = Date.now();
    S.call('answer', { lesson: LID, q: 'zflag', kind: 'open', answer: v, correct: null }).then(function () { watchSent = v; }, function () { clearTimeout(watchT); watchT = setTimeout(watchSend, 20000); });
  }
  function watchInit() {
    var w0 = SFA.store.get('les.watch.' + LID, null); if (w0 && w0.q) watch = w0;
    function onSlide() { var s = LES.slides[cur]; return s && s.id && slideEl ? s : null; }
    function leave() {
      var s = onSlide(); if (away || !s || mine[s.id]) return;   // only before the question is answered: after that, watching the Meet is fine
      if (document.activeElement && document.activeElement.tagName === 'IFRAME') return;
      away = { at: Date.now(), slide: cur };
    }
    function back() {
      if (!away) return;
      var secs = Math.round((Date.now() - away.at) / 1000), was = away.slide; away = null;
      if (secs < 3 || was !== cur) return;
      var w = watchFor(LES.slides[cur]); if (!w) return;
      w[0]++; w[1] += secs; SFA.store.set('les.watch.' + LID, watch); watchSend();
      if (secs >= 8) SFA.toast('Welcome back. ' + TEACHER + ' can see when you leave the lesson during a question.', 4000);
    }
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') leave(); else back(); });
    window.addEventListener('blur', leave); window.addEventListener('focus', back);
    document.addEventListener('paste', function (e) {
      var t = e.target; if (!slideEl || !t || !slideEl.contains(t) || !/^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
      var txt = ''; try { txt = (e.clipboardData || window.clipboardData).getData('text') || ''; } catch (x) { }
      watchBump(2, 1); watchBump(3, txt.trim().length);
    }, true);
    function copied() { var sel = String(window.getSelection ? window.getSelection() : ''); if (slideEl && sel.trim().length > 8 && window.getSelection().anchorNode && slideEl.contains(window.getSelection().anchorNode) && !/^(INPUT|TEXTAREA)$/.test((document.activeElement || {}).tagName)) watchBump(4, 1); }
    document.addEventListener('copy', copied, true); document.addEventListener('cut', copied, true);
    document.addEventListener('keyup', function (e) { if (e.key === 'PrintScreen') watchBump(5, 1); }, true);
    document.addEventListener('keydown', function (e) { if (e.metaKey && e.shiftKey && /^(3|4|5|s|S)$/.test(e.key)) watchBump(5, 1); }, true);
    window.addEventListener('pagehide', function () { leave(); SFA.store.set('les.watch.' + LID, watch); });
  }
  // tell students once, on their first question, so it's fair (and it puts most of them off)
  function watchTell() {
    if (watchTold || MODE !== 'student' || !saving || !S.me) return;
    var s = LES.slides[cur]; if (!s || !s.id || s.warm) return;
    var k = 'les.watch.told'; if (SFA.store.get(k, 0)) { watchTold = true; return; }
    watchTold = true; SFA.store.set(k, 1);
    SFA.toast('Answer in your own words. If you leave this page or paste during a question, ' + TEACHER + ' sees it.', 6000);
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
  function qline(s, wrap) {
    if (s.warm) wrap.appendChild(H('p', 'kick', 'Warm-up · no wrong answers'));
    wrap.appendChild(H('p', 'q', fmt(s.q)));
    if (s.warm && MODE === 'student') wrap.appendChild(H('p', 'sub', 'Tap one so ' + TEACHER + ' can see you\'re connected.'));
  }
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

  // typed answers, newest first, no names: the class reads each other's thinking
  function answerWall(s) {
    var p = feed && feed.per[s.id], w = H('div', 'wall');
    var list = p ? p.list.filter(function (a) { return String(a.answer).trim(); }).sort(function (a, b) { return a.time < b.time ? 1 : -1; }) : [];
    if (!list.length) { w.appendChild(H('p', 'state', 'Answers appear here as they arrive.')); return w; }
    list.slice(0, 24).forEach(function (a) { w.appendChild(H('div', 'card', esc(String(a.answer).slice(0, 220)))); });
    if (list.length > 24) w.appendChild(H('p', 'state', '+' + (list.length - 24) + ' more on the console'));
    return w;
  }
  // number and machine answers grouped by value, most common first; ticks only once the answer is revealed
  function answerGroups(s) {
    var p = feed && feed.per[s.id], g = {}, order = [], w = H('div', 'groups');
    (p ? p.list : []).forEach(function (a) {
      var k = String(a.answer).trim().replace(/\s+/g, ' ').slice(0, 40); if (!k) return;
      if (!g[k]) { g[k] = { n: 0, ok: a.correct === 'yes' }; order.push(k); } g[k].n++;
    });
    if (!order.length) { w.appendChild(H('p', 'state', 'Answers appear here as they arrive.')); return w; }
    var showRight = reveal(s.id) >= 2 || (MODE === 'teach' && console_ && console_.peek);
    order.sort(function (a, b) { return g[b].n - g[a].n; }).slice(0, 12).forEach(function (k) {
      w.appendChild(H('span', 'grp' + (showRight && g[k].ok ? ' ok' : ''), esc(k.replace(/-/g, '−')) + ' <b>×' + g[k].n + '</b>'));
    });
    return w;
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
        if (show) { r.appendChild(H('p', 'q', 'Sign in on your own device')); r.appendChild(H('p', 'sub', 'Go to <b>' + esc(location.host + location.pathname.replace(/[^\/]*$/, '') + 'lessons.html') + '</b> and open <b>Lesson ' + esc(LES.n) + ': ' + esc(LES.title) + '</b>.')); r.appendChild(H('p', 'sub', (CFG.auth === 'code' ? 'Type the <b>student code</b> from your school email.' : 'Press <b>Sign in with Google</b> and pick your school account.'))); return; }
        if (!saving) { r.appendChild(H('p', 'sub', 'Answer saving is off for this copy, so just follow along.')); return; }
        if (S.me) { r.appendChild(H('p', 'okline', '✓ You\'re in, ' + esc(first(S.me.name)) + '.')); r.appendChild(H('p', 'sub', 'Your answers go to ' + TEACHER + '. Press <b>Next</b> when you\'re ready.')); return; }
        r.appendChild(H('p', 'q', 'Sign in so your answers count'));
        var hold = document.getElementById('sfaAccount'); if (hold) r.appendChild(hold);
        if (CFG.auth !== 'code') { var alt = H('p', 'state', 'No button? Sign in on the <a href="index.html#signin" target="_blank" rel="noopener">Arcade front page</a>, then come back to this tab.'); r.appendChild(alt); }
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
      // the teacher plays the film for everyone on the shared screen in the meeting; the Cinema link stays as a backup
      if (MODE !== 'teach') b.appendChild(H('p', 'note', '📺 <b>Watch together on ' + TEACHER + '\'s shared screen</b> in the meeting.'));
      b.appendChild(H('p', 'q', '<span class="kick">Watch for</span><br>' + fmt(s.watch)));
      var a = H('a', MODE === 'teach' ? 'go' : 'btn small', MODE === 'teach' ? '🎬 Open the Cinema to share' : '🎬 Open the Cinema'); a.href = CFG.cinema || 'https://claude.ai/artifact/EHFcVi37ZD1DyEM2u6XSe4'; a.target = '_blank'; a.rel = 'noopener';
      var row = H('div', 'row'); row.appendChild(a); row.appendChild(H('span', 'onyours', MODE === 'teach' ? 'Pick film ' + esc(f.n || '') + ' and share that tab in the meeting.' : 'Can\'t see the shared screen? Open film ' + esc(f.n || '') + ' yourself.')); b.appendChild(row);
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
        if (show) { box.appendChild(tallyFor(s.id)); var p = feed && feed.per[s.id]; if (p && p.n) box.appendChild(H('p', 'state', p.right + ' right so far')); if (onScreen(s.id)) box.appendChild(answerGroups(s)); if (reveal(s.id) >= 2 || (MODE === 'teach' && console_ && console_.peek)) box.appendChild(H('div', 'reveal', '<b>Answer: ' + esc(show_(s.ans)) + '.</b> ' + fmt(s.why || ''))); return; }
        var a = mine[s.id], inp = el('input', { type: 'text', inputmode: s.ans < 0 ? 'text' : 'decimal', 'aria-label': 'Your answer', placeholder: 'Type a number', autocomplete: 'off' });   // iPhone number pads have no minus key
        if (a) inp.value = a.answer;
        var btn = el('button', { type: 'button', 'class': 'btn primary', text: 'Check' });
        var row = H('div', 'row'); row.appendChild(inp); row.appendChild(btn); box.appendChild(row);
        if (a && a.correct === true) box.appendChild(H('div', 'fb good', '<b>Yes!</b> ' + fmt(s.why || '')));
        else if (a && a.correct === false) box.appendChild(H('div', 'fb try', 'Not yet. ' + fmt(s.hint || 'Check your working and try again.')));
        if (a) box.appendChild(stateLine(s.id));
        if (reveal(s.id) >= 2 && !(a && a.correct === true)) box.appendChild(H('div', 'reveal', '<b>' + TEACHER + ' showed the answer: ' + esc(show_(s.ans)) + '.</b> ' + fmt(s.why || '')));
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
          var keep = mine[s.id] || { answer: '', correct: null, sent: true, kind: 'machine', run: liveRun() }; keep.tried = tried; mine[s.id] = keep; saveLocal();
          draw();
        }, 750);
      }
      function draw() {
        area.innerHTML = '';
        if (show) {
          area.appendChild(tallyFor(s.id)); var p = feed && feed.per[s.id]; if (p && p.n) area.appendChild(H('p', 'state', p.right + ' cracked it so far'));
          if (onScreen(s.id)) area.appendChild(answerGroups(s));
          if (reveal(s.id) >= 2 || (MODE === 'teach' && console_ && console_.peek)) area.appendChild(H('div', 'reveal', '<b>The rule: ' + esc(s.rule.replace(/-/g, '−')) + '</b>'));
          m.querySelector('.mlabel').textContent = reveal(s.id) >= 2 ? s.rule.replace(/-/g, '−') : '?';
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
          var g = el('input', { type: 'text', placeholder: 'The rule, like 5x − 4', 'aria-label': 'The rule', autocomplete: 'off' });
          if (a && a.answer) g.value = String(a.answer).split(' (tried')[0];
          var cb = el('button', { type: 'button', 'class': 'btn primary', text: 'Check my rule' });
          var r2 = H('div', 'row'); r2.appendChild(g); r2.appendChild(cb); area.appendChild(r2);
          if (a && a.correct === true) area.appendChild(H('div', 'fb good', '<b>Cracked it!</b> The rule is ' + esc(s.rule.replace(/-/g, '−')) + '. ' + (tried.length <= 3 ? 'Only ' + tried.length + ' input' + (tried.length === 1 ? '' : 's') + '. Pro move.' : '')));
          else if (a && a.correct === false) area.appendChild(H('div', 'fb try', 'Not quite. Feed it a number where your rule and the machine might disagree, and look again.'));
          else area.appendChild(H('p', 'state', 'Write the rule with x, like 5x − 4 or 3(x − 2).'));
          if (a && a.answer) area.appendChild(stateLine(s.id));
          cb.onclick = function () {
            var f = parseRule(g.value); if (!g.value.trim()) return g.focus();
            if (!f) { SFA.toast('Write it with x, like 5x − 4.'); return; }
            var ok = sameRule(f, rule);
            record(s, g.value.trim() + ' (tried ' + tried.map(function (t) { return numTxt(t[0]); }).join(', ') + ')', ok);
            mine[s.id].tried = tried; saveLocal(); if (ok) { confetti(); m.querySelector('.mlabel').textContent = s.rule.replace(/-/g, '−'); }
            draw();
          };
          g.onkeydown = function (e) { if (e.key === 'Enter') cb.click(); };
        }
        if (reveal(s.id) >= 2 && !(a && a.correct === true)) area.appendChild(H('div', 'reveal', '<b>' + TEACHER + ' showed the rule: ' + esc(s.rule.replace(/-/g, '−')) + '.</b> Feed it a number and check it works.'));
        if ((a && a.correct === true) || reveal(s.id) >= 2) m.querySelector('.mlabel').textContent = s.rule.replace(/-/g, '−');
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
      var qs = questions(), n = qs.filter(function (x) { return mine[x.id] && mine[x.id].answer; }).length;
      if (!show) w.appendChild(H('p', 'q', 'You answered <b>' + n + ' of ' + qs.length + '</b> questions today.'));
      if (LES.big) w.appendChild(H('p', 'sub', '<span class="kick">Remember</span><br>' + fmt(LES.big)));
      if (s.next) w.appendChild(H('p', 'sub', fmt(s.next)));
      if (!show) { var row = H('div', 'row'); row.style.justifyContent = 'center'; var a = H('a', 'go', '🏆 My Results'); a.href = 'results.html'; row.appendChild(a); var gm = H('a', 'btn', '🕹️ Play ' + esc(LES.game.title)); gm.href = LES.game.file; row.appendChild(gm); var b = H('a', 'btn', 'All lessons'); b.href = 'lessons.html'; row.appendChild(b); w.appendChild(row); }
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
      if (show && MODE === 'screen' && !onScreen(s.id)) counts = null;
      if (MODE === 'student' && rv >= 1 && live.counts && live.counts[s.id]) counts = live.counts[s.id];
      var total = counts ? counts.reduce(function (x, y) { return x + y; }, 0) : 0;
      var showAns = s.ans != null && (rv >= 2 || (selfPaced && a) || (MODE === 'teach' && console_ && console_.peek));
      opts.forEach(function (o, i) {
        var b = el('button', { type: 'button', 'class': 'opt' + (i === picked ? ' mine' : '') + (showAns && i === s.ans ? ' right' : '') });
        var bar = H('i', 'bar'); b.appendChild(bar);
        if (isConf) b.appendChild(H('span', 'e', FACES[i]));
        else b.appendChild(H('span', 'L', letter(i)));
        var t = H('span', 't', fmt(o)); b.appendChild(t);
        if (MODE === 'teach' && console_ && console_.names && !isConf && feed && feed.per[s.id] && feed.per[s.id].who[i]) t.appendChild(H('span', 'names', esc(feed.per[s.id].who[i].join(', '))));
        if (counts) { var pc = total ? Math.round(100 * (counts[i] || 0) / total) : 0; b.appendChild(H('span', 'pc', pc + '%')); setTimeout(function () { bar.style.width = pc + '%'; }, 60); }
        if (show || (MODE === 'student' && !selfPaced && rv >= 1)) b.disabled = true;
        else b.onclick = function () { record(s, (i + 1) + '. ' + plain(o), s.ans != null ? i === s.ans : null); d._upd(); };
        list.appendChild(b);
      });
      if (show) foot.appendChild(tallyFor(s.id));
      else if (a) foot.appendChild(stateLine(s.id));
      if (!show && !selfPaced && rv >= 1) foot.appendChild(H('p', 'state', a ? 'Answers are closed. ' + TEACHER + ' is sharing the results.' : 'Answers are closed for this one. Watch the results.'));
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
        if (onScreen(s.id)) box.appendChild(answerWall(s));
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
  // Redraws keep whatever a student is in the middle of typing (and where the cursor is).
  document.addEventListener('input', function (e) { if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) e.target.dataset.typed = '1'; }, true);
  function fieldKey(f) { return f.tagName + '|' + (f.getAttribute('aria-label') || f.placeholder || ''); }
  function upd() {
    if (!slideEl) return refreshDots();
    var keep = {}, act = document.activeElement, focusKey = null, sel = null;
    [].forEach.call(slideEl.querySelectorAll('input[type=text],textarea'), function (f) {
      if (f.dataset.typed) keep[fieldKey(f)] = f.value;
      if (f === act) { focusKey = fieldKey(f); try { sel = [f.selectionStart, f.selectionEnd]; } catch (e) { } }
    });
    try { slideEl._upd(); } catch (e) { }
    [].forEach.call(slideEl.querySelectorAll('input[type=text],textarea'), function (f) {
      var k = fieldKey(f);
      if (k in keep && f.value !== keep[k]) { f.value = keep[k]; f.dataset.typed = '1'; f.dispatchEvent(new Event('input')); }
      if (k === focusKey && document.activeElement !== f && slideEl.contains(f)) { try { f.focus({ preventScroll: true }); if (sel) f.setSelectionRange(sel[0], sel[1]); } catch (e) { } }
    });
    refreshDots();
  }
  function refreshDots() {
    if (!dots) return;
    [].forEach.call(dots.children, function (b, i) {
      var s = LES.slides[i];
      b.className = (i === cur ? 'cur' : i < cur ? 'seen' : '') + (s.id && mine[s.id] && mine[s.id].answer ? ' ok' : '');
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
    if (MODE === 'student') { SFA.store.set('les.at.' + LID, cur); setTimeout(watchTell, 600); }
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
      var other = live && live.lesson !== LID && !ended(live) && Date.now() - live.at < LIVE_FRESH;
      banner.hidden = !other;
      if (other) { banner.innerHTML = ''; banner.appendChild(H('span', '', '<b>' + TEACHER + ' is teaching Lesson ' + esc(shownNum(live.lesson)) + ' right now.</b>')); var a = H('a', 'btn primary small', 'Join it'); a.href = 'lesson.html?l=' + live.lesson.slice(1); banner.appendChild(a); }
    }
  }
  // A sign-in bar under the top bar on every slide, so students can sign in even while the teacher has locked the slides
  var signBar = null, signKey = '';
  function signDraw() {
    if (!signBar) return;
    var need = saving && (!S.me || S.status === 'signedout' || (S.credExpired && S.credExpired()));
    var key = need ? 'need' : 'ok'; if (key === signKey) return; signKey = key;
    signBar.hidden = !need; signBar.innerHTML = ''; document.body.classList.toggle('gated', need); if (!need) return;
    // a sign-in screen in front of the slides: the lesson opens once the student is in
    var card = H('div', 'gatecard');
    card.appendChild(H('div', 'bigicon', '🔑'));
    card.appendChild(H('h2', '', S.me ? 'Sign in again to keep going' : 'Sign in to join the lesson'));
    card.appendChild(H('p', 'sub', 'Type the 6-character <b>student code</b> from ' + TEACHER + '\'s email. Then the slides open.'));
    S.button(card);
    signBar.appendChild(card);
    setTimeout(function () { var i = signBar.querySelector('input'); if (i) i.focus(); }, 50);
  }
  // tell the console this student is in (once per lesson, and again after "Start fresh")
  function sayHere() {
    if (MODE !== 'student' || !saving || !S.me || (S.credExpired && S.credExpired())) return;
    var run = liveRun(), k = 'les.here.' + LID, was = SFA.store.get(k, null);
    if (was && was.sid === S.me.sid && was.run === run) return;
    SFA.store.set(k, { sid: S.me.sid, run: run });
    S.call('answer', { lesson: LID, q: 'here', kind: 'open', answer: 'joined', correct: null }).catch(function () { SFA.store.del(k); });
  }
  function acctDraw() {
    signDraw(); sayHere();
    if (!acctChip) return;
    if (!saving) { acctChip.hidden = true; return; }
    if (S.me) { acctChip.textContent = '✓ ' + first(S.me.name); acctChip.className = 'chip static'; acctChip.onclick = null; }
    else { acctChip.textContent = 'Not signed in: answers won\'t count'; acctChip.className = 'chip warn'; acctChip.onclick = function () { var i = signBar && signBar.querySelector('input'); if (i) { i.focus(); i.scrollIntoView({ block: 'nearest' }); } }; }
  }

  /* ---------------- live: students check what the teacher is showing ---------------- */
  var pollT = null;
  function sameLive(a, beforeJson) { var b = beforeJson ? JSON.parse(beforeJson) : null; function k(x) { if (!x) return 'null'; var c = {}; Object.keys(x).forEach(function (n) { if (n !== 'at') c[n] = x[n]; }); return JSON.stringify(c); } return k(a) === k(b); }
  var polling = false, pollFails = 0;
  function pollLive() {
    clearTimeout(pollT);
    if (!CFG.endpoint || polling) return;   // one request at a time: switching tabs used to start extra polling loops
    if (document.visibilityState === 'hidden') { pollT = setTimeout(pollLive, 15000); return; }
    polling = true; lastPoll = Date.now();
    post({ op: 'live' }).then(function (j) {
      polling = false; pollFails = 0;
      var was = isLive(), before = JSON.stringify(live);
      live = j.live || null; noteLive(live);
      var dropped = MODE === 'student' ? dropOldRun() : 0;
      if (dropped) { render(isLive() && follow ? live.slide : cur, 0, true); if (dropped === 2 && before && JSON.parse(before || 'null')) SFA.toast(TEACHER + ' started the lesson fresh.', 3500); }
      if (locked()) follow = true;
      if (isLive() && follow && live.slide !== cur) render(live.slide, live.slide > cur ? 1 : -1);
      else if (sameLive(live, before) === false) upd();   // ignore the heartbeat time, so typing isn't redrawn for nothing
      if (!was && isLive()) { follow = true; SFA.toast(TEACHER + ' is live. Your screen will follow the lesson.', 3500); }
      drawTop(); refreshDots(); if (dropped || liveRun()) sayHere();
      pollT = setTimeout(pollLive, isLive() ? 4500 + Math.random() * 1500 : 8000 + Math.random() * 2000);
    }, function (e) {
      polling = false;
      if (/unknown op/.test(e.message)) return;   // older results script: no live mode
      pollFails++;
      pollT = setTimeout(pollLive, Math.min(20000, 5000 * pollFails) + Math.random() * 2000);
    });
  }
  var lastPoll = 0;
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && MODE === 'student' && Date.now() - lastPoll > 3000) pollLive(); });

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
    console_ = { on: false, lock: SFA.store.get('teacher.lesson.lock', true) !== false, reveal: {}, spot: null, timer: null, cls: SFA.store.get('teacher.lesson.cls', ''), names: true, peek: false, data: null, since: 0, picked: '', run: 0, auto: SFA.store.get('teacher.lesson.auto', true) !== false, skew: 0 };
    if (!CFG.endpoint) { console_.offline = true; }
    else if (!Key.get()) return askKey(), false;
    var panel = H('aside', 'panel'); panel.id = 'tpanel';
    document.querySelector('.lmain').appendChild(panel);
    if (bc) bc.onmessage = function (e) { var m = e.data || {}; if (m.t === 'hello') broadcast(); if (m.t === 'nav') go(m.to, true); };
    if (!console_.offline) fetchAnswers();
    setInterval(function () { if (!console_.offline) fetchAnswers(); }, 4000);
    setInterval(function () { if (console_.on) pushLive(); }, 120000);
    // a console left open in another tab or device must not keep the class live after you end it elsewhere
    setInterval(function () {
      if (!console_.on || console_.offline || Date.now() - lastPush < 20000) return;
      tpost('live').then(function (j) { if (console_.on && ended(j.live) && j.live.lesson === LID && Date.now() - lastPush > 20000) { console_.on = false; clearTimeout(pushT); consolePanel(); liveChip.hidden = true; SFA.toast('The live lesson was ended from another window.', 4000); } }, function () { });
    }, 15000);
    if (!console_.offline) tpost('live').then(function (j) { if (j.live && j.live.lesson === LID && !ended(j.live) && Date.now() - j.live.at < LIVE_FRESH) { console_.on = true; console_.reveal = j.live.reveal || {}; console_.spot = j.live.spot; console_.timer = j.live.timer; console_.since = Date.now(); console_.lock = liveLock(j.live); var r0 = decRun(j.live.counts && j.live.counts.zrun); if (r0) console_.run = r0; if (j.live.slide !== cur) render(j.live.slide, 1); pushLive(); computeFeed(); consolePanel(); } }, function () { });
    return true;
  }
  // one request at a time: the Sheet can take longer than the 4 s between checks, and an older reply landing after a
  // newer one would make answers vanish and come back. Unchanged replies don't redraw, so buttons don't jump under the mouse.
  var fetching = 0, fetchSeq = 0, applied = 0, lastData = '';
  function fetchAnswers() {
    if (fetching && Date.now() - fetching < 10000) return;   // a slow Sheet still gets a fresh request every 10 s
    fetching = Date.now(); var my = ++fetchSeq;
    tpost('answers', { lesson: LID }).then(function (j) {
      if (my === fetchSeq) fetching = 0;
      if (my < applied) return;   // only an older reply than one already shown is dropped
      applied = my; console_.got = Date.now(); var js = JSON.stringify(j), wasErr = !!console_.err;
      console_.err = ''; if (js === lastData && !wasErr) return; lastData = js;
      console_.data = j; computeFeed(); consolePanel(); upd(); broadcast(); pushCountsIfChanged();
    },
      function (e) {
        if (my === fetchSeq) fetching = 0;
        if (my < applied) return;
        if (/teacher key/.test(e.message)) { Key.del(); askKey('That key didn\'t work. Check it and try again.'); return; }
        console_.err = /unknown op/.test(e.message) ? 'The results script needs updating before answers and live mode work: paste the new Code.gs and deploy a new version (see SETUP.md).' : 'Can\'t reach the results sheet right now. Retrying.';
        consolePanel();
      });
  }
  // answer times come from Google's clock, "Start fresh" from this laptop's: skew (server minus here, measured on every
  // live update) lines them up, so a laptop clock that runs fast can't hide the class's new answers
  function beforeRun(a) { return !!console_.run && !console_.showOld && Date.parse(a.time) < console_.run + (console_.skew || 0) - 5000; }
  function rosterIn() { var r = (console_.data && console_.data.roster) || []; return console_.cls ? r.filter(function (x) { return x.cls === console_.cls; }) : r; }
  function computeFeed() {
    var roster = rosterIn(), ids = {}, name = {};
    roster.forEach(function (r) { ids[r.sid] = 1; name[r.sid] = nice(r.name); });
    var per = {};
    questions().forEach(function (s) {
      var n = s.k === 'conf' ? 4 : s.opts ? s.opts.length : 0, p = per[s.id] = { n: 0, right: 0, counts: [], who: [], list: [], sids: {} };
      for (var i = 0; i < n; i++) { p.counts.push(0); p.who.push([]); }
    });
    var flags = {}, hidden = { cls: 0, fresh: 0 }, allIds = {};
    ((console_.data && console_.data.roster) || []).forEach(function (r) { allIds[r.sid] = 1; });
    ((console_.data && console_.data.answers) || []).forEach(function (a) {
      if (!ids[a.sid]) { if (allIds[a.sid] && a.q !== 'here' && a.q !== 'zflag' && !beforeRun(a)) hidden.cls++; return; }
      if (beforeRun(a)) { hidden.fresh++; return; }   // from before "Start fresh"
      if (a.q === 'zflag') { flags[a.sid] = decFlags(a.answer); return; }
      var p = per[a.q]; if (!p) return;
      p.n++; p.sids[a.sid] = 1; if (a.correct === 'yes') p.right++;
      var k = parseInt(a.answer, 10) - 1;
      if (p.counts.length && k >= 0 && k < p.counts.length) { p.counts[k]++; p.who[k].push(first(name[a.sid])); }
      p.list.push({ sid: a.sid, name: name[a.sid], answer: a.answer, correct: a.correct, time: a.time });
    });
    feed = { total: roster.length, per: per };
    console_.flags = flags; console_.hidden = hidden;
  }
  // a student's focus-watch summary: "v1;q:left,secs,pastes,chars,copies,shots;…" → { q: { left, secs, pastes, chars, copies, shots } }
  function decFlags(v) {
    var out = {}; String(v || '').split(';').slice(1).forEach(function (part) {
      var m = /^([a-z0-9]{1,16}):([0-9,]+)$/.exec(part); if (!m) return;
      var n = m[2].split(',').map(Number);
      out[m[1]] = { left: n[0] || 0, secs: n[1] || 0, pastes: n[2] || 0, chars: n[3] || 0, copies: n[4] || 0, shots: n[5] || 0 };
    });
    return out;
  }
  function secsTxt(x) { return x < 60 ? x + ' s' : Math.floor(x / 60) + ' min ' + (x % 60 ? x % 60 + ' s' : ''); }
  // strong: pasted, copied the question, screenshot key. soft: left the page before answering (could be the Meet)
  function flagTxt(f) {
    var t = [];
    if (f.pastes) t.push('pasted ' + (f.chars ? f.chars + ' characters' : 'text') + (f.pastes > 1 ? ' (' + f.pastes + ' times)' : ''));
    if (f.copies) t.push('copied the question' + (f.copies > 1 ? ' ' + f.copies + ' times' : ''));
    if (f.shots) t.push('pressed a screenshot key');
    if (f.left) t.push('left the page ' + (f.left > 1 ? f.left + ' times' : 'once') + ' (' + secsTxt(f.secs).trim() + ') before answering');
    return t.join(', ');
  }
  function flagStrong(f) { return !!(f && (f.pastes || f.copies || f.shots)); }
  function flagShown(f) { return !!(f && (flagStrong(f) || f.secs >= 10)); }
  function broadcast() { if (bc) bc.postMessage({ t: 'state', slide: cur, live: liveObj(), feed: feed }); }
  function liveObj() {
    var counts = {};
    Object.keys(console_.reveal).forEach(function (q) { if (console_.reveal[q] && feed && feed.per[q] && feed.per[q].counts.length) counts[q] = feed.per[q].counts; });
    if (console_.run) counts.zrun = encRun(console_.run);
    if (console_.lock) counts.zlock = [1];
    return { lesson: LID, slide: cur, at: Date.now(), reveal: console_.reveal, counts: counts, spot: console_.spot, timer: console_.timer, lock: console_.lock, auto: console_.auto };
  }
  var pushT = null, lastCounts = '', lastPush = 0;
  function pushLive() {
    live = liveObj(); upd(); broadcast();
    if (!console_.on || console_.offline) return;
    clearTimeout(pushT);
    pushT = setTimeout(function () { if (!console_.on) return; var L = liveObj(); lastCounts = JSON.stringify(L.counts); lastPush = Date.now(); var t0 = Date.now(); tpost('setLive', { live: L }).then(function (j) { if (j && j.live && j.live.at) { var sk = j.live.at - Math.round((t0 + Date.now()) / 2), moved = Math.abs(sk - (console_.skew || 0)) > 3000; console_.skew = sk; if (moved && console_.data) { computeFeed(); consolePanel(); upd(); broadcast(); } } }).catch(function (e) { SFA.toast('Couldn\'t update the class: ' + e.message, 4000); }); }, 300);
  }
  function endLive() {
    clearTimeout(pushT);
    var tries = 0, endObj = { lesson: LID, slide: cur, reveal: {}, counts: { zend: [1] }, spot: null, timer: null, lock: false };
    live = endObj; upd(); broadcast();
    function send() {
      if (console_.on) return;   // gone live again meanwhile
      tries++;
      tpost('setLive', { live: endObj }).then(function () {
        if (tries === 1) { SFA.toast('Live lesson ended.'); setTimeout(send, 3000); }   // send it twice: an update already on its way can land after the first
      }, function (e) {
        if (console_.on) return;
        if (tries < 4) setTimeout(send, 2000 * tries); else SFA.toast('Couldn\'t end the live lesson: ' + e.message + '. Press Go live, then End live lesson again.', 6000);
      });
    }
    send();
  }
  function pushCountsIfChanged() { if (console_.on && JSON.stringify(liveObj().counts) !== lastCounts) pushLive(); }
  function consoleSlide() { if (!console_) return; console_.picked = ''; console_.peek = false; pushLive(); consolePanel(); }

  // everyone with a flag in this lesson, strongest first
  function flagSection() {
    var sec = H('div', 'sect'), fl = console_.flags || {}, nameOf = {}, rows = [];
    rosterIn().forEach(function (r) { nameOf[r.sid] = nice(r.name); });
    var slideNo = {}; LES.slides.forEach(function (s, i) { if (s.id) slideNo[s.id] = i + 1; });
    Object.keys(fl).forEach(function (sid) {
      if (!nameOf[sid]) return;
      Object.keys(fl[sid]).forEach(function (q) { var f = fl[sid][q]; if (slideNo[q] && flagShown(f)) rows.push({ sid: sid, q: q, f: f, w: (flagStrong(f) ? 1e6 : 0) + f.secs }); });
    });
    sec._n = rows.length; sec.appendChild(H('h3', '', 'Check these answers' + (rows.length ? ' (' + rows.length + ')' : '')));
    if (!rows.length) { sec.appendChild(H('p', 'muted', 'No flags yet. A student is flagged when they paste into an answer, copy a question, press a screenshot key, or leave the lesson for 10 s or more before answering.')); return sec; }
    rows.sort(function (a, b) { return b.w - a.w; });
    var list = H('div', 'flags');
    var ans = {}; ((console_.data && console_.data.answers) || []).forEach(function (a) { ans[a.sid + '|' + a.q] = a.answer; });
    rows.forEach(function (r) {
      var d = H('div', 'flagrow' + (flagStrong(r.f) ? ' strong' : ''));
      d.innerHTML = '<b>' + esc(nameOf[r.sid]) + '</b> · slide ' + slideNo[r.q] + ': ' + esc(flagTxt(r.f));
      var said = ans[r.sid + '|' + r.q];
      d.appendChild(H('div', 'said', said != null ? '“' + esc(String(said).slice(0, 300)) + '”' : '<i>No answer sent yet</i>'));
      list.appendChild(d);
    });
    sec.appendChild(list);
    sec.appendChild(H('p', 'muted', 'Orange: pasted, copied the question or pressed a screenshot key. Grey: left the page before answering, which can be innocent (looking at the Meet). Phone photos and most screenshot tools can\'t be seen.'));
    return sec;
  }

  // a fold-away section whose open/closed state survives the console redrawing every few seconds
  function fold(key, title, dflt) {
    var o = console_.open || (console_.open = {}), d = el('details', { 'class': 'sect fold' }), sm = el('summary');
    sm.innerHTML = '<h3>' + esc(title) + '</h3>'; d.appendChild(sm);
    var was = d.open = key in o ? o[key] : dflt;
    d.addEventListener('toggle', function () { if (d.open !== was) { was = o[key] = d.open; } });   // only the teacher's own clicks are remembered
    return d;
  }
  // how old the answers on screen are, so a stalled connection to the Sheet is obvious
  function freshTick() {
    var e = document.getElementById('fresh'); if (!e) return;
    var a = console_.got ? Math.round((Date.now() - console_.got) / 1000) : -1;
    e.className = 'state ' + (a >= 0 && a < 20 ? 'ok' : 'bad');
    e.textContent = a < 0 ? 'Waiting for answers from your Sheet…' : a < 20 ? '● Answers up to date (checked ' + a + ' s ago)' : '● Answers last arrived ' + a + ' s ago. Still trying; if this keeps growing, reload this page.';
  }
  setInterval(freshTick, 1000);
  function consolePanel() {
    var p = document.getElementById('tpanel'); if (!p || !LES) return;
    var s = LES.slides[cur], keep = p.scrollTop, whoSec = null; p.innerHTML = '';
    // what's needed mid-lesson comes first: live buttons, then this slide's controls and answers
    // live controls
    var top = H('div', 'sect');
    var lb = el('button', { type: 'button', 'class': 'btn ' + (console_.on ? '' : 'primary'), text: console_.on ? 'End live lesson' : 'Go live' });
    lb.onclick = function () {
      console_.on = !console_.on;
      if (console_.on) { console_.since = Date.now(); pushLive(); SFA.toast('Live. Students\' screens now follow your slides.'); }
      else endLive();
      consolePanel(); liveChip.hidden = !console_.on;
    };
    if (console_.offline) lb.disabled = true;
    var sc = el('button', { type: 'button', 'class': 'btn', text: 'Open class screen' });
    sc.onclick = function () { window.open('lesson.html?l=' + N + '&screen', 'sfa-screen-' + LID, 'width=1280,height=760'); };
    var fr = el('button', { type: 'button', 'class': 'btn', text: 'Start fresh' });
    fr.title = 'Back to slide 1, clear reveals, spotlight and timer, and start counting answers from now';
    fr.onclick = function () {
      if (!window.confirm('Start this lesson fresh?\n\nEveryone goes back to slide 1, reveals and the timer are cleared, and students\' earlier answers are hidden here and cleared on their devices. Nothing is deleted from your Sheet.')) return;
      console_.run = Date.now(); console_.showOld = false;
      console_.reveal = {}; console_.spot = null; console_.timer = null; console_.picked = ''; console_.peek = false;
      if (!console_.on && !console_.offline) { console_.on = true; console_.since = Date.now(); liveChip.hidden = false; }
      computeFeed(); render(0, -1); pushLive(); consolePanel();
      SFA.toast('Fresh start. Students\' screens reset within a few seconds.', 4000);
    };
    if (console_.offline) fr.disabled = true;
    var row = H('div', 'row'); row.appendChild(lb); row.appendChild(sc); row.appendChild(fr); top.appendChild(row);
    var hd = console_.hidden || {};
    if (hd.fresh && !console_.showOld) { var hf = H('p', 'state bad', hd.fresh + ' answer' + (hd.fresh > 1 ? 's are' : ' is') + ' hidden because ' + (hd.fresh > 1 ? 'they' : 'it') + ' arrived before you pressed Start fresh. '); hf.appendChild(el('button', { type: 'button', 'class': 'btn small', text: 'Show them', onclick: function () { console_.showOld = true; computeFeed(); consolePanel(); upd(); broadcast(); } })); top.appendChild(hf); }
    if (hd.cls) top.appendChild(H('p', 'state bad', hd.cls + ' answer' + (hd.cls > 1 ? 's' : '') + ' in this lesson ' + (hd.cls > 1 ? 'are' : 'is') + ' from students outside Class ' + esc(console_.cls) + ', so they\'re hidden. Choose "All classes" under Settings to see them.'));
    top.appendChild(H('p', 'muted', console_.on ? 'Live for ' + Math.round((Date.now() - console_.since) / 60000) + ' min. Share the class screen window, not this one.' : 'Share the class screen window. Go live so students\' devices follow you and the polls open.'));
    if (console_.err) top.appendChild(H('p', 'state bad', esc(console_.err)));
    if (!console_.offline) { var fr2 = H('p', 'state' + (console_.got && Date.now() - console_.got < 20000 ? ' ok' : ' bad'), ''); fr2.id = 'fresh'; top.appendChild(fr2); }
    p.appendChild(top);
    freshTick();

    // this slide
    var sec = H('div', 'sect'); sec.appendChild(H('h3', '', 'This slide · planned ' + (s.min || 0) + ' min'));
    if (s.id && feed) {
      var f = feed.per[s.id], n = f ? f.n : 0, tot = feed.total || 0;
      sec.appendChild(H('div', '', '<b>' + n + '</b> of ' + tot + ' answered'));
      var pb = H('div', 'pbar'), bi = H('i'); bi.style.width = (tot ? 100 * n / tot : 0) + '%'; pb.appendChild(bi); sec.appendChild(pb);
      if (s.k === 'number' || s.k === 'machine') sec.appendChild(H('p', 'muted', f.right + ' got it right'));
      var rv = console_.reveal[s.id] || 0, r2 = H('div', 'row');
      var canShow = true;
      if (s.k === 'poll' || s.k === 'conf') r2.appendChild(el('button', { type: 'button', 'class': 'btn small' + (rv >= 1 ? ' good' : ''), text: rv >= 1 ? 'Results showing' : 'Show results to class', onclick: function () { console_.reveal[s.id] = rv >= 1 ? 0 : 1; pushLive(); consolePanel(); } }));
      else r2.appendChild(el('button', { type: 'button', 'class': 'btn small' + (rv >= 1 ? ' good' : ''), text: rv >= 1 ? 'Answers showing' : 'Show answers to class', onclick: function () { console_.reveal[s.id] = rv >= 1 ? 0 : 1; pushLive(); consolePanel(); } }));
      if ((s.k === 'poll' && s.ans != null) || s.model || s.k === 'number' || s.k === 'machine') r2.appendChild(el('button', { type: 'button', 'class': 'btn small' + (rv >= 2 ? ' good' : ''), text: rv >= 2 ? 'Answer showing' : 'Reveal the answer', onclick: function () { console_.reveal[s.id] = rv >= 2 ? (canShow ? 1 : 0) : 2; pushLive(); consolePanel(); } }));
      r2.appendChild(el('button', { type: 'button', 'class': 'btn small', text: console_.peek ? 'Hide answer here' : 'Peek at answer (only here)', onclick: function () { console_.peek = !console_.peek; upd(); consolePanel(); } }));
      if (s.k === 'poll') r2.appendChild(el('button', { type: 'button', 'class': 'btn small', text: console_.names ? 'Hide names' : 'Show names', onclick: function () { console_.names = !console_.names; upd(); consolePanel(); } }));
      sec.appendChild(r2);
      if (s.warm) sec.appendChild(H('p', 'muted', 'Connection check: anyone still under "Not answered yet" below isn\'t signed in or isn\'t on this slide. Help them before the lesson moves on.'));
      if (console_.spot && console_.spot.q === s.id) sec.appendChild(el('button', { type: 'button', 'class': 'btn small', text: 'Stop spotlight', onclick: function () { console_.spot = null; pushLive(); consolePanel(); } }));
      // answers list
      if (f && f.list.length && s.k !== 'poll' && s.k !== 'conf') {
        var al = H('div', 'alist');
        f.list.slice().sort(function (a, b) { return a.time < b.time ? 1 : -1; }).forEach(function (a) {
          var lit = console_.spot && console_.spot.q === s.id && console_.spot.text === a.answer;
          var c = H('div', 'a' + (a.correct === 'yes' ? ' ok' : a.correct === 'no' ? ' no' : '') + (lit ? ' lit' : ''));
          c.appendChild(H('b', '', esc(a.name || a.sid) + (a.correct === 'yes' ? ' ✓' : a.correct === 'no' ? ' ✗' : '') + (lit ? ' · on screen now' : '')));
          var fl = console_.flags && console_.flags[a.sid] && console_.flags[a.sid][s.id];
          if (flagStrong(fl)) { var fb2 = H('span', 'flag strong', '⚠'); fb2.title = 'Possible AI help: ' + flagTxt(fl) + '. Details under "AI-use alerts" below.'; c.firstChild.appendChild(fb2); }
          c.appendChild(document.createTextNode(a.answer));
          if (s.k === 'open' || s.k === 'exit') { var rr = H('div', 'row'); rr.appendChild(el('button', { type: 'button', 'class': 'btn small', text: 'Spotlight (no name)', onclick: function () { console_.spot = { q: s.id, text: a.answer }; pushLive(); consolePanel(); } })); c.appendChild(rr); }
          al.appendChild(c);
        });
        sec.appendChild(al);
      }
      var not = rosterIn().filter(function (r) { return !(f && f.sids[r.sid]); });
      if (not.length && f && f.list.length) {
        sec.appendChild(H('h3', '', 'Not answered yet (' + not.length + ')'));
        var wd = H('div', 'who'); not.forEach(function (r) { wd.appendChild(H('span', '', esc(nice(r.name)))); }); sec.appendChild(wd);
      }
    } else if (s.k === 'play') {
      var mins = s.minutes || 10, rt = H('div', 'row');
      rt.appendChild(el('button', { type: 'button', 'class': 'btn small primary', text: console_.timer ? 'Restart ' + mins + '-minute timer' : 'Start ' + mins + '-minute timer', onclick: function () { console_.timer = { end: Date.now() + mins * 60000, total: mins * 60 }; pushLive(); consolePanel(); } }));
      if (console_.timer) rt.appendChild(el('button', { type: 'button', 'class': 'btn small', text: 'Stop timer', onclick: function () { console_.timer = null; pushLive(); consolePanel(); } }));
      sec.appendChild(rt);
      sec.appendChild(H('p', 'muted', 'Students see the countdown on their own screens and on the class screen.'));
    } else sec.appendChild(H('p', 'muted', s.k === 'film' ? 'Play film ' + esc((LES.film || {}).n || '') + ' on your shared screen. Students are told to watch it there; the Cinema link is their backup.' : 'Nothing to collect on this slide.'));

    p.appendChild(sec);
    // who has signed in to this lesson (since "Start fresh")
    if (console_.data) {
      var inS = {}; ((console_.data.answers || [])).forEach(function (a) { if (beforeRun(a)) return; inS[a.sid] = 1; });
      var ros = rosterIn(), here = ros.filter(function (r) { return inS[r.sid]; }), out = ros.filter(function (r) { return !inS[r.sid]; });
      var ws = fold('who', 'In the lesson: ' + here.length + ' of ' + ros.length + (out.length && here.length ? ' · not in yet: ' + out.length : ''), !!s.warm);
      var hw = H('div', 'who'); here.forEach(function (r) { hw.appendChild(H('span', 'in', esc(nice(r.name)))); }); if (here.length) ws.appendChild(hw);
      if (out.length && out.length < ros.length) { ws.appendChild(H('p', 'muted', 'Not in yet (' + out.length + ')')); var ow = H('div', 'who'); out.forEach(function (r) { ow.appendChild(H('span', '', esc(nice(r.name)))); }); ws.appendChild(ow); }
      else if (!here.length) ws.appendChild(H('p', 'muted', 'Nobody yet. Students appear here as soon as they type their code.'));
      whoSec = ws;
    }

    if (whoSec) p.appendChild(whoSec);
    // pick someone
    var pk = H('div', 'sect'); pk.appendChild(H('h3', '', 'Pick someone'));
    var pr = H('div', 'row');
    pr.appendChild(el('button', { type: 'button', 'class': 'btn small', text: 'Random student', onclick: function () { var r = rosterIn(); if (!r.length) return; var f2 = s.id && feed && feed.per[s.id], pool = f2 && f2.n ? r.filter(function (x) { return f2.sids[x.sid]; }) : r; console_.picked = nice(pool[Math.floor(Math.random() * pool.length)].name); consolePanel(); } }));
    pk.appendChild(pr);
    if (console_.picked) pk.appendChild(H('div', 'picked', esc(console_.picked)));
    p.appendChild(pk);

    // AI-use alerts: logged, folded away until wanted
    if (console_.data) { var fs = flagSection(), nfl = fs._n || 0, fd = fold('flags', 'AI-use alerts' + (nfl ? ' (' + nfl + ')' : ': none'), false); while (fs.firstChild) { if (fs.firstChild.tagName === 'H3') fs.removeChild(fs.firstChild); else fd.appendChild(fs.firstChild); } p.appendChild(fd); }
    // settings
    var st = fold('set', 'Settings', false);
    var lk = el('label', { style: 'display:flex;gap:8px;align-items:center' }), cb = el('input', { type: 'checkbox' }); cb.checked = console_.lock;
    cb.onchange = function () { console_.lock = cb.checked; SFA.store.set('teacher.lesson.lock', cb.checked); pushLive(); };
    lk.appendChild(cb); lk.appendChild(document.createTextNode('Keep everyone on my slide (students can\'t move ahead or back)')); st.appendChild(lk);
    var ak = el('label', { style: 'display:flex;gap:8px;align-items:center' }), acb = el('input', { type: 'checkbox' }); acb.checked = console_.auto;
    acb.onchange = function () { console_.auto = acb.checked; SFA.store.set('teacher.lesson.auto', acb.checked); pushLive(); consolePanel(); };
    ak.appendChild(acb); ak.appendChild(document.createTextNode('Show answers on the class screen as they come in (no names; polls stay open and the right answer stays hidden until you reveal it)')); st.appendChild(ak);
    // class filter
    var roster = (console_.data && console_.data.roster) || [], classes = [];
    roster.forEach(function (r) { if (r.cls && classes.indexOf(r.cls) < 0) classes.push(r.cls); });
    if (classes.length > 1) {
      var sel = el('select', { 'class': 'sel', 'aria-label': 'Class' }); sel.appendChild(el('option', { value: '', text: 'All classes' }));
      classes.sort().forEach(function (c) { var o = el('option', { value: c, text: 'Class ' + c }); if (c === console_.cls) o.selected = true; sel.appendChild(o); });
      sel.onchange = function () { console_.cls = sel.value; SFA.store.set('teacher.lesson.cls', sel.value); computeFeed(); consolePanel(); upd(); broadcast(); pushCountsIfChanged(); };
      st.appendChild(H('p', 'muted', 'Class shown here and on the class screen:')); st.appendChild(sel);
    }

    p.appendChild(st);

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
    p.scrollTop = keep;
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
    if (MODE === 'student') { signBar = H('div', 'gate'); signBar.hidden = true; document.body.appendChild(signBar); }
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
      pollLive(); watchInit();
      window.addEventListener('online', function () { flush(); watchSend(); });
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
