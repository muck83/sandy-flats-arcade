/* Sandy Flats: Unit 2 Check, the student page. Draws one question at a time from the engine in check-u2.js,
   keeps the clock, records pacing and focus flags, and saves after every answer (this browser first, then the class
   Sheet through sfa-sync.js, key g91), so a reload or a dropped connection picks up at the same question.
   The numbers of every question are drawn as ink (canvas pictures) or on a grid, not as text that can be selected. */
(function () {
  'use strict';
  var SFA = window.SFA, el = SFA.el, CU = window.CU2, S = SFA.sync || null, KEY = CU.KEY, N = CU.num;
  var TRY = !!window.CU2_TRY, DEMO = !!window.CU2_DEMO, Q = location.search;
  // extra time set by the teacher (percent): the check lasts at least 35 minutes × (1 + extra), whatever the start code says
  function extraPct() { var x = me() && Number(me().extra); return x === 25 || x === 50 || x === 100 ? x : 0; }
  function minutesFor(len) { return Math.max(len, Math.round(CU.LENS[0] * (1 + extraPct() / 100))); }
  var root = document.getElementById('ck'), chips = document.getElementById('ckChips');
  var LVC = ['l0', 'l1', 'l2', 'l3', 'l4'];
  var SKN = {}; CU.SK.forEach(function (k) { SKN[k.id] = k; });
  var CRN = {}; CU.CRIT.forEach(function (c) { CRN[c.id] = c; });

  /* ---------------- saved state ---------------- */
  function fresh() { return { v: 1, done: {}, att: null, past: [] }; }
  function load() { var p = SFA.store.get(KEY, null); if (!p || typeof p !== 'object' || !p.done) p = fresh(); if (!p.past) p.past = []; return p; }
  var P = load();
  function save() {
    SFA.store.set(KEY, P);
    if (S && S.on && P.att) S.report(KEY, P, CU.summary(P.att, Date.now()));
  }
  function me() { return S && S.me; }
  function deadline(a) { return a.t0 + a.lenMs + (a.extMs || 0); }
  function nice(n) { n = String(n || ''); if (n.indexOf(',') < 0) return n; var p = n.split(','); return (p[1].trim().split(' ')[0] + ' ' + p[0].trim()).trim(); }

  /* ---------------- ink: text drawn as a picture ---------------- */
  var MONO = '"IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace';
  function drawInk(c) {
    var t = c._t, size = c._s, dpr = Math.max(2, window.devicePixelRatio || 1), ctx = c.getContext('2d'), font = '600 ' + size + 'px ' + MONO;
    ctx.font = font; var w = Math.ceil(ctx.measureText(t).width) + 6, h = Math.ceil(size * 1.45);
    c.width = w * dpr; c.height = h * dpr; c.style.width = w + 'px';
    ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.font = font; ctx.fillStyle = c._c; ctx.textBaseline = 'alphabetic'; ctx.fillText(t, 3, size * 1.08);
  }
  function ink(text, size, color) { var c = document.createElement('canvas'); c.className = 'ink'; c._t = String(text); c._s = size || 18; c._c = color || '#1B1A22'; c.setAttribute('aria-hidden', 'true'); drawInk(c); return c; }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { [].forEach.call(document.querySelectorAll('canvas.ink'), drawInk); });
  // "plain text [[ink]] plain text" to nodes
  function rich(text, tag, cls, size) {
    var box = el(tag || 'span', cls ? { 'class': cls } : {});
    String(text).split(/\[\[(.+?)\]\]/).forEach(function (s, i) { if (!s) return; box.appendChild(i % 2 ? ink(s, size) : document.createTextNode(s)); });
    return box;
  }
  // the review's own problem HTML (paper questions): its numbers become ink too
  function inkHtml(html, tag, cls) {
    var box = el(tag || 'div', cls ? { 'class': cls } : {}); box.innerHTML = html;
    [].forEach.call(box.querySelectorAll('.m'), function (m) { m.parentNode.replaceChild(ink(m.textContent), m); });
    [].forEach.call(box.querySelectorAll('table.tb td, table.tb th'), function (td) { var t = td.textContent; td.textContent = ''; td.appendChild(ink(t)); });
    [].forEach.call(box.querySelectorAll('ol.work li'), function (li) { var t = li.textContent; li.textContent = ''; li.appendChild(ink(t)); });
    return box;
  }

  /* ---------------- the grid ---------------- */
  var NS = 'http://www.w3.org/2000/svg', GR = 8, U = 20, SZ = 320, gid = 0;
  function sv(tag, at, kids) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); (kids || []).forEach(function (c) { e.appendChild(c); }); return e; }
  function gx(x) { return (x + GR) * U; }
  function gy(y) { return (GR - y) * U; }
  function lineEnds(L) { var a = -GR - 1, b = GR + 1, m = N.fv(L.m), c = N.fv(L.b); return { x1: gx(a), y1: gy(m * a + c), x2: gx(b), y2: gy(m * b + c) }; }
  function graph(spec, mini) {
    spec = spec || {}; var id = 'ckc' + (++gid), i;
    var s = sv('svg', { 'class': 'ckg' + (mini ? ' mini' : ''), viewBox: '-12 -12 344 344', role: 'img', 'aria-label': spec.aria || 'Coordinate grid from −8 to 8' });
    s.appendChild(sv('defs', {}, [sv('clipPath', { id: id }, [sv('rect', { width: SZ, height: SZ })])]));
    s.appendChild(sv('rect', { 'class': 'gbg', x: -12, y: -12, width: 344, height: 344, rx: 10 }));
    for (i = -GR; i <= GR; i++) { s.appendChild(sv('line', { 'class': 'gl', x1: gx(i), y1: 0, x2: gx(i), y2: SZ })); s.appendChild(sv('line', { 'class': 'gl', x1: 0, y1: gy(i), x2: SZ, y2: gy(i) })); }
    s.appendChild(sv('line', { 'class': 'ax', x1: gx(0), y1: 0, x2: gx(0), y2: SZ })); s.appendChild(sv('line', { 'class': 'ax', x1: 0, y1: gy(0), x2: SZ, y2: gy(0) }));
    for (i = -GR + 2; i < GR; i += mini ? 4 : 2) {
      if (!i) continue;
      var a = sv('text', { 'class': 'tk', x: gx(i), y: gy(0) + (mini ? 22 : 13) }); a.textContent = N.ng(i); s.appendChild(a);
      var b = sv('text', { 'class': 'tk te', x: gx(0) - 4, y: gy(i) + (mini ? 8 : 4) }); b.textContent = N.ng(i); s.appendChild(b);
    }
    var xl = sv('text', { 'class': 'tk', x: SZ - 6, y: gy(0) - 6 }); xl.textContent = 'x'; s.appendChild(xl);
    var yl = sv('text', { 'class': 'tk', x: gx(0) + 10, y: 10 }); yl.textContent = 'y'; s.appendChild(yl);
    var clip = sv('g', { 'clip-path': 'url(#' + id + ')' }); s.appendChild(clip);
    (spec.lines || []).forEach(function (L) { var e = lineEnds(L); e['class'] = 'ln' + (L.grey ? ' g' : '') + (L.dash ? ' d' : ''); clip.appendChild(sv('line', e)); });
    (spec.pts || []).forEach(function (p) {
      s.appendChild(sv('circle', { 'class': 'pt', cx: gx(p.x), cy: gy(p.y), r: mini ? 9 : 6 }));
      if (p.label) { var t = sv('text', { 'class': 'pl', x: gx(p.x) + (p.x > 6 ? -18 : 9), y: gy(p.y) + (p.y > 6 ? 18 : -9) }); t.textContent = p.label; s.appendChild(t); }
    });
    s._clip = clip;
    return s;
  }

  /* ---------------- answer widgets: each has node, get() (null = not answered yet), set(response), lock() ---------------- */
  var flagNow = function () { };   // set by the test: records a flag on the current question
  function numWidget(p, onEnter) {
    var last = null, ins = p.labs.map(function (L) {
      var i = el('input', { type: 'text', inputmode: 'text', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', 'aria-label': L.replace('=', '').trim() || 'Answer', maxlength: '12' });
      i.addEventListener('focus', function () { last = i; });
      i.addEventListener('paste', function () { flagNow('paste'); });
      i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); onEnter && onEnter(); } });
      return i;
    });
    function key(ch) { return el('button', { type: 'button', 'class': 'ck-key', text: ch, 'aria-label': ch === '−' ? 'minus sign' : 'fraction slash', onclick: function () { var i = last || ins[0]; if (i.disabled) return; var a = i.selectionStart == null ? i.value.length : i.selectionStart; i.value = i.value.slice(0, a) + ch + i.value.slice(i.selectionEnd == null ? a : i.selectionEnd); i.focus(); try { i.setSelectionRange(a + 1, a + 1); } catch (e) { } } }); }
    var keys = [key('−'), key('/')];
    var node = el('div', { 'class': 'ck-num' }, [el('div', { 'class': 'ck-inrow' }, p.labs.map(function (L, k) { return el('label', {}, [ink(L, 18), ins[k]]); }).concat([el('span', { 'class': 'ck-keys' }, keys)])), el('small', { 'class': 'ck-hint', text: 'Type a whole number, a fraction like −3/4, or a decimal.' })]);
    return { node: node, focus: function () { ins[0].focus(); },
      get: function () { var v = ins.map(function (i) { return i.value.trim(); }); return v.some(function (x) { return !x; }) ? null : v; },
      set: function (r) { (r || []).forEach(function (x, k) { if (ins[k]) ins[k].value = x; }); },
      lock: function () { ins.forEach(function (i) { i.disabled = true; }); keys.forEach(function (b) { b.disabled = true; }); } };
  }
  function mcWidget(p) {
    var sel = -1, locked = false, graphs = p.opts.some(function (o) { return typeof o !== 'string'; });
    var bs = p.opts.map(function (o, i) {
      var b = el('button', { type: 'button', 'class': 'ck-opt', 'aria-pressed': 'false', 'aria-label': 'Option ' + 'ABCDEF'[i], onclick: function () { if (locked) return; pick(i); } }, [el('span', { 'class': 'ck-let', text: 'ABCDEF'[i] })]);
      if (typeof o === 'string') b.appendChild(rich(o, 'span', 'ck-ot')); else b.appendChild(graph({ lines: [o.g] }, true));
      return b;
    });
    function pick(i) { sel = i; bs.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); }
    return { node: el('div', { 'class': 'ck-opts' + (graphs ? ' graphs' : ''), role: 'group', 'aria-label': 'Options' }, bs), focus: function () { bs[0].focus(); },
      get: function () { return sel < 0 ? null : sel; }, set: function (r) { if (r != null && r >= 0) pick(r); }, lock: function () { locked = true; bs.forEach(function (b) { b.disabled = true; }); } };
  }
  // a table or a list of working; with a row part its rows can be tapped
  function rowsFig(fig, p) {
    var sel = -1, locked = false, isT = fig.t === 'table', rows = isT ? fig.rows : fig.lines;
    var kids = rows.map(function (r, i) {
      var inner = isT ? [el('span', { 'class': 'c' }, [ink(r[0])]), el('span', { 'class': 'c' }, [ink(r[1])])] : [el('span', { 'class': 'n', text: String(i + 1) }), el('span', { 'class': 'c' }, [ink(r)])];
      if (!p) return el('div', { 'class': 'ck-row' }, inner);
      return el('button', { type: 'button', 'class': 'ck-row tap', 'aria-pressed': 'false', 'aria-label': (isT ? 'Row ' : 'Line ') + (i + 1), onclick: function () { if (locked) return; pick(i); } }, inner);
    });
    function pick(i) { sel = i; kids.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); }
    var node = el('div', { 'class': 'ck-rows ' + (isT ? 'tbl' : 'work') }, (isT ? [el('div', { 'class': 'ck-row head' }, [el('span', { 'class': 'c' }, [ink(fig.head[0])]), el('span', { 'class': 'c' }, [ink(fig.head[1])])])] : []).concat(kids));
    return { node: node, focus: function () { if (p) kids[0].focus(); }, get: function () { return sel < 0 ? null : sel; }, set: function (r) { if (r != null && r >= 0) pick(r); }, lock: function () { locked = true; kids.forEach(function (b) { if (b.tagName === 'BUTTON') b.disabled = true; }); } };
  }
  function orderWidget(p) {
    var ord = p.lines.map(function (x, i) { return i; }), locked = false, list = el('ol', { 'class': 'ck-order' });
    function draw(focusAt, dir) {
      list.innerHTML = '';
      ord.forEach(function (li, pos) {
        var up = el('button', { type: 'button', 'class': 'ck-mv', text: '▲', 'aria-label': 'Move line ' + (pos + 1) + ' up', onclick: function () { move(pos, -1); } }), dn = el('button', { type: 'button', 'class': 'ck-mv', text: '▼', 'aria-label': 'Move line ' + (pos + 1) + ' down', onclick: function () { move(pos, 1); } });
        up.disabled = locked || pos === 0; dn.disabled = locked || pos === ord.length - 1;
        list.appendChild(el('li', {}, [el('span', { 'class': 'mv' }, [up, dn]), el('span', { 'class': 'c' }, [ink(p.lines[li])])]));
        if (focusAt === pos) setTimeout(function () { var b = dir < 0 ? up : dn; if (b.disabled) b = dir < 0 ? dn : up; b.focus(); }, 0);
      });
    }
    function move(pos, d) { if (locked) return; var t = ord[pos]; ord[pos] = ord[pos + d]; ord[pos + d] = t; draw(pos + d, d); }
    draw();
    return { node: list, focus: function () { var b = list.querySelector('button:not(:disabled)'); if (b) b.focus(); }, get: function () { return ord.slice(); }, set: function (r) { if (Array.isArray(r) && r.length === ord.length) { ord = r.slice(); draw(); } }, lock: function () { locked = true; draw(); } };
  }
  // an interactive grid: 'point' (one tap), 'line' (two taps), 'ineq' (style and shade a boundary)
  function gridWidget(fig, p) {
    var mode = p.kind, max = mode === 'line' ? 2 : mode === 'point' ? 1 : 0, marks = [], locked = false, cur = { x: 0, y: 0 }, showCur = false, st = { solid: null, above: null };
    var spec = { lines: (fig && fig.lines) || [], pts: (fig && fig.pts) || [], aria: mode === 'ineq' ? 'Grid with the boundary line' : 'Grid: tap a grid point to plot it. With the keyboard, use the arrow keys and press Enter.' };
    var s = graph(spec), over = sv('g', {}), read = el('div', { 'class': 'ck-read', role: 'status', 'aria-live': 'polite' });
    s.appendChild(over); s.classList.add('live');
    if (max) { s.setAttribute('tabindex', '0'); s.setAttribute('role', 'application'); }
    function draw() {
      while (over.firstChild) over.removeChild(over.firstChild);
      while (s._clip.querySelector('.user')) s._clip.removeChild(s._clip.querySelector('.user'));
      if (mode === 'ineq') {
        var e = lineEnds(p.line);
        if (st.above != null) { var far = st.above ? -3 * SZ : 4 * SZ; s._clip.appendChild(sv('polygon', { 'class': 'sh user', points: e.x1 + ',' + e.y1 + ' ' + e.x2 + ',' + e.y2 + ' ' + e.x2 + ',' + far + ' ' + e.x1 + ',' + far })); }
        e['class'] = 'ln user' + (st.solid == null ? ' g' : st.solid ? '' : ' d'); s._clip.appendChild(sv('line', e));
        read.textContent = (st.solid == null ? 'Line style: not chosen' : st.solid ? 'Solid line' : 'Dashed line') + ' · ' + (st.above == null ? 'shading: not chosen' : st.above ? 'shaded above' : 'shaded below');
        return;
      }
      if (mode === 'line' && marks.length === 2 && !(marks[0].x === marks[1].x && marks[0].y === marks[1].y)) {
        var a = marks[0], b = marks[1], ex;
        if (a.x === b.x) ex = { x1: gx(a.x), y1: 0, x2: gx(a.x), y2: SZ }; else ex = lineEnds({ m: N.F(b.y - a.y, b.x - a.x), b: N.F(a.y * (b.x - a.x) - (b.y - a.y) * a.x, b.x - a.x) });
        ex['class'] = 'ln user'; s._clip.appendChild(sv('line', ex));
      }
      marks.forEach(function (m) { over.appendChild(sv('circle', { 'class': 'pt u', cx: gx(m.x), cy: gy(m.y), r: 7 })); });
      if (showCur && !locked) over.appendChild(sv('circle', { 'class': 'cur', cx: gx(cur.x), cy: gy(cur.y), r: 11 }));
      read.textContent = marks.length ? 'Plotted: ' + marks.map(function (m) { return '(' + N.ng(m.x) + ', ' + N.ng(m.y) + ')'; }).join(' and ') + (mode === 'line' && marks.length < 2 ? '. Tap one more point.' : '') : (mode === 'line' ? 'Tap two grid points.' : 'Tap a grid point.') + (showCur ? ' Cursor at (' + N.ng(cur.x) + ', ' + N.ng(cur.y) + ').' : '');
    }
    function tap(x, y) {
      if (locked || !max) return;
      var dup = -1; marks.forEach(function (m, i) { if (m.x === x && m.y === y) dup = i; });
      if (dup >= 0) marks.splice(dup, 1); else { if (marks.length >= max) marks.shift(); marks.push({ x: x, y: y }); }
      draw();
    }
    s.addEventListener('click', function (e) {
      var r = s.getBoundingClientRect(), ux = (e.clientX - r.left) / r.width * 344 - 12, uy = (e.clientY - r.top) / r.height * 344 - 12;
      var x = Math.round(ux / U - GR), y = Math.round(GR - uy / U); if (Math.abs(x) > GR || Math.abs(y) > GR) return;
      cur = { x: x, y: y }; tap(x, y);
    });
    s.addEventListener('keydown', function (e) {
      if (locked || !max) return;
      var k = e.key, d = k === 'ArrowLeft' ? [-1, 0] : k === 'ArrowRight' ? [1, 0] : k === 'ArrowUp' ? [0, 1] : k === 'ArrowDown' ? [0, -1] : null;
      if (d) { e.preventDefault(); showCur = true; cur = { x: Math.max(-GR, Math.min(GR, cur.x + d[0])), y: Math.max(-GR, Math.min(GR, cur.y + d[1])) }; draw(); }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); showCur = true; tap(cur.x, cur.y); }
    });
    s.addEventListener('focus', function () { if (s.matches(':focus-visible')) { showCur = true; draw(); } });
    s.addEventListener('blur', function () { showCur = false; draw(); });
    var kids = [s, read], segs = [];
    if (mode === 'ineq') {
      var seg = function (label, key, a, b) {
        var bs = [a, b].map(function (o) { return el('button', { type: 'button', 'aria-pressed': 'false', text: o[0], onclick: function () { if (locked) return; st[key] = o[1]; upd(); } }); });
        var upd = function () { bs.forEach(function (x, i) { x.setAttribute('aria-pressed', st[key] === [a, b][i][1] ? 'true' : 'false'); }); draw(); };
        segs.push({ bs: bs, upd: upd });
        return el('div', { 'class': 'ck-segrow' }, [el('span', { text: label }), el('div', { 'class': 'ck-seg', role: 'group', 'aria-label': label }, bs)]);
      };
      kids.push(seg('Boundary line', 'solid', ['Solid', true], ['Dashed', false])); kids.push(seg('Shade', 'above', ['Above the line', true], ['Below the line', false]));
    } else {
      kids.push(el('div', { 'class': 'ck-gbtns' }, [el('button', { type: 'button', 'class': 'btn small', text: 'Clear', onclick: function () { if (!locked) { marks = []; draw(); } } }), el('small', { 'class': 'ck-hint', text: 'Tap a point again to remove it. Keyboard: click the grid, move with the arrow keys, press Enter.' })]));
    }
    draw();
    return { node: el('div', { 'class': 'ck-gw' }, kids), focus: function () { },
      get: function () { if (mode === 'ineq') return st.solid == null || st.above == null ? null : { solid: st.solid, above: st.above }; if (mode === 'point') return marks[0] ? { x: marks[0].x, y: marks[0].y } : null; return marks.length === 2 ? marks.map(function (m) { return { x: m.x, y: m.y }; }) : null; },
      set: function (r) { if (!r) return; if (mode === 'ineq') { st = { solid: r.solid, above: r.above }; segs.forEach(function (g) { g.upd(); }); } else marks = mode === 'point' ? [r] : r.slice(); draw(); },
      lock: function () { locked = true; s.classList.remove('live'); s.removeAttribute('tabindex'); kidsLock(); draw(); } };
    function kidsLock() { kids.forEach(function (k) { [].forEach.call(k.querySelectorAll ? k.querySelectorAll('button') : [], function (b) { b.disabled = true; }); }); }
  }
  function qNode(p) { return p.html ? inkHtml(p.q, 'p', 'ck-q') : rich(p.q, 'p', 'ck-q'); }
  // one part of a question: returns the widget, with the figure inside it when the figure is what gets tapped
  function partWidget(p, fig, onEnter) {
    var w;
    if (p.kind === 'num') w = numWidget(p, onEnter);
    else if (p.kind === 'mc') w = mcWidget(p);
    else if (p.kind === 'order') w = orderWidget(p);
    else if (p.kind === 'row') w = rowsFig(fig, p);
    else if (p.kind === 'point' || p.kind === 'line' || p.kind === 'ineq') w = gridWidget(fig && fig.t === 'graph' ? fig : null, p);
    else if (p.kind === 'multi') {
      var ws = p.subs.map(function (s) { return partWidget(s, null, onEnter); });
      w = { node: el('div', { 'class': 'ck-multi' }, ws.map(function (x) { return x.node; })), focus: function () { ws[0].focus(); },
        get: function () { var r = ws.map(function (x) { return x.get(); }); return r.some(function (x) { return x == null; }) ? null : r; },
        set: function (r) { (r || []).forEach(function (x, i) { if (ws[i]) ws[i].set(x); }); }, lock: function () { ws.forEach(function (x) { x.lock(); }); } };
      return w;   // each sub already carries its own prompt
    }
    w.node = el('div', { 'class': 'ck-part' }, [qNode(p), w.node]);
    return w;
  }
  function usesFig(p) { return p.kind === 'row' || p.kind === 'point' || p.kind === 'line' || p.kind === 'ineq'; }

  /* ---------------- flags: leaving the tab, paste, copy ---------------- */
  var awaySince = 0;
  function away(on) {
    var a = P.att; if (!a || a.end || !a.cur) { awaySince = 0; return; }
    if (on && !awaySince) { awaySince = Date.now(); a.cur.b = (a.cur.b || 0) + 1; a.cur.f |= CU.FLAG.away; SFA.store.set(KEY, P); }
    else if (!on && awaySince) { a.cur.a = (a.cur.a || 0) + Math.round((Date.now() - awaySince) / 1000); awaySince = 0; SFA.store.set(KEY, P); }
  }
  document.addEventListener('visibilitychange', function () { away(document.visibilityState === 'hidden'); });
  window.addEventListener('blur', function () { away(true); });
  window.addEventListener('focus', function () { if (document.visibilityState !== 'hidden') away(false); });
  flagNow = function (kind) { var a = P.att; if (a && !a.end && a.cur) { a.cur.f |= CU.FLAG[kind]; SFA.store.set(KEY, P); } };
  document.addEventListener('copy', function () { flagNow('copy'); });
  document.addEventListener('cut', function () { flagNow('copy'); });
  window.addEventListener('beforeunload', function (e) { var a = P.att; if (a && !a.end && a.cur && !window.CU2_NOWARN) { e.preventDefault(); e.returnValue = ''; return ''; } });

  /* ---------------- screens ---------------- */
  var tick = null, view = '', hook = null;
  function clear() { clearInterval(tick); tick = null; root.innerHTML = ''; chips.innerHTML = ''; }
  function card(kids, cls) { return el('section', { 'class': 'card ck-card' + (cls ? ' ' + cls : '') }, kids); }
  function badge(L) { return el('span', { 'class': 'badge ' + LVC[L], text: CU.LV[L] }); }

  function render() {
    var a = P.att;
    document.body.classList.toggle('ck-run', !!(a && !a.end && me()));
    if (!S || !S.on) { clear(); view = 'off'; root.appendChild(card([el('h2', { text: 'The check can\'t run here' }), el('p', { text: 'Results saving isn\'t switched on for this copy of the arcade, so the Unit 2 Check has nowhere to send your answers. Tell Mr. Crowell.' })])); return; }
    if (!me()) return gate();
    if (a && a.sid && a.sid !== me().sid) { P = fresh(); a = null; }
    if (a && !a.end && Date.now() >= deadline(a)) finish('time', deadline(a));
    if (!a) { if (!GATE.open) return closed(); if (!DEMO && Date.now() - GATE.at > 60000) gateCheck().then(function (on) { if (!on && view === 'intro') render(); }); return intro(); }
    if (a.end) return summary();
    test();
  }

  function gate() {
    clear(); view = 'gate';
    root.appendChild(card([el('h2', { text: 'Sign in first' }), el('p', { text: 'The Unit 2 Check saves to your name, so sign in with your student code in the box above. Then this page will show the start screen.' })]));
  }

  /* the open/closed switch: a new attempt can start only while Mr. Crowell has the Check open */
  var GATE = { open: DEMO, known: DEMO, at: 0 };
  function gateCheck() {
    if (DEMO) return Promise.resolve(true);
    return S.call('checkState', {}).then(function (j) { GATE.open = !!j.open; GATE.known = true; GATE.at = Date.now(); return GATE.open; },
      function (e) { if (e.server) { GATE.open = false; GATE.known = true; } return GATE.open; });   // offline: keep the last answer
  }
  function closed() {
    clear(); view = 'closed';
    var msg = el('p', { 'class': 'ck-msg', role: 'status', 'aria-live': 'polite' });
    root.appendChild(card([el('h2', { text: GATE.known ? 'The Unit 2 Check is closed' : 'Checking whether the Check is open…' }),
      GATE.known ? el('p', { 'class': 'ck-lead', text: 'Mr. Crowell opens the Unit 2 Check in class. Keep this page open: it starts by itself when he opens it.' }) : null,
      GATE.known ? el('p', {}, [el('a', { 'class': 'btn', href: 'review-u2.html', text: '📝 Practise with the Unit 2 Review' }), ' ', el('button', { type: 'button', 'class': 'btn', text: 'Check again', onclick: function () { msg.textContent = 'Checking…'; poll(); } })]) : null,
      msg]));
    var wasKnown = GATE.known;
    function poll() { gateCheck().then(function (on) { if (view !== 'closed') return; if (on || !wasKnown || !GATE.known) render(); else msg.textContent = 'Still closed.'; }); }
    if (!GATE.known) poll();
    tick = setInterval(poll, 15000);
  }

  var demoLen = 10;
  var RECORDED = ['Your answers, and how long each one took.', 'If you leave this tab or window during a question.', 'If you paste into an answer box or copy a question.', 'Answers that are very fast or very slow.'];
  function intro(again) {
    clear(); view = 'intro';
    var inp = el('input', { type: 'text', 'class': 'ck-code', maxlength: '5', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', 'aria-label': 'Start code', placeholder: '•••••' });
    var msg = el('p', { 'class': 'ck-msg', role: 'status', 'aria-live': 'polite' });
    var go = el('button', { type: 'button', 'class': 'btn primary', text: 'Start the check', onclick: start });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') start(); });
    inp.addEventListener('input', function () { msg.textContent = ''; });
    function start() {
      if (DEMO) return begin({ ok: true, code: 'DEMOX', len: demoLen, lenIdx: 0, top: 0, demo: true });
      var r = CU.readCode(inp.value, Date.now());
      if (!r.ok) { msg.textContent = r.why; inp.focus(); return; }
      go.disabled = true; msg.textContent = 'Starting…';
      gateCheck().then(function (on) { go.disabled = false; if (on) begin(r); else render(); });
    }
    root.appendChild(card([
      el('h2', { text: again ? 'A new attempt' : 'Unit 2 Check: Linear Equations and Inequalities' }),
      el('p', { 'class': 'ck-lead', text: 'Hi ' + nice(me().name).split(' ')[0] + '. This check shows what you can do now and what to practise next. It is not a race. The questions get harder when you are right and easier when you are wrong. So everyone meets questions they can\'t do yet. That is normal.' }),
      el('div', { 'class': 'ck-grid' }, [
        el('div', {}, [el('h3', { text: 'How it works' }), el('ul', { 'class': 'ck-list' }, [
          el('li', { text: 'About 35 minutes. One question at a time. You can\'t go back, so check before you press Submit.' }),
          el('li', { text: 'Everyone gets different numbers. Do your own thinking.' }),
          el('li', { text: 'Read each instruction. Sometimes you type. Sometimes you tap a graph, a table or a line of working.' }),
          el('li', { text: 'Stuck? Choose "I don\'t know yet". That helps Mr. Crowell help you. It is not a failure.' }),
          el('li', {}, [el('b', { text: 'Have paper and a pencil ready. ' }), 'Some questions ask you to work it out on paper first. Write out your thinking one step at a time, then type your answer. Writing it out is how you catch your own mistakes.'])
        ])]),
        el('div', {}, [el('h3', { text: 'What is recorded' }), el('ul', { 'class': 'ck-list' }, RECORDED.map(function (t) { return el('li', { text: t }); })), el('p', { 'class': 'muted', text: 'These are notes for Mr. Crowell. They do not change your result. A calculator is fine. Other tabs, apps and AI helpers are not.' })])
      ]),
      extraPct() ? el('p', { 'class': 'ck-extra', text: '⏱ You have extra time: ' + minutesFor(CU.LENS[0]) + ' minutes instead of 35.' }) : null,
      DEMO ? el('div', { 'class': 'ck-start' }, [el('div', { 'class': 'ck-demo' }, [el('b', { text: 'Teacher demo. ' }), 'Nothing here reaches the class results. How long should this demo run? ', el('span', { 'class': 'ck-seg', role: 'group', 'aria-label': 'Demo length' }, [5, 10, 35].map(function (m) { var b = el('button', { type: 'button', 'aria-pressed': m === demoLen ? 'true' : 'false', text: m + ' min', onclick: function () { demoLen = m; [].forEach.call(b.parentNode.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); } }); return b; }))]), go])
        : el('div', { 'class': 'ck-start' }, [el('label', {}, ['Start code from Mr. Crowell ', inp]), go]),
      msg,
      TRY ? el('p', { 'class': 'muted' }, ['Practice mode: ', el('button', { type: 'button', 'class': 'btn small', text: 'Use a practice code', onclick: function () { inp.value = CU.makeCode(Date.now(), 0, 0); } }), ' (the real code comes from the teacher dashboard).']) : null
    ]));
    if (P.past.length) root.appendChild(el('p', { 'class': 'muted', text: 'Earlier attempts: ' + P.past.map(function (x) { return new Date(x.t0).toLocaleDateString() + ' (scale ' + x.scale + ')'; }).join(', ') }));
    // on a phone, focusing the code box scrolls past the instructions: let the student read from the top first
    try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); }
  }

  function begin(r) {
    var now = Date.now(), n = (P.att ? P.att.n : P.past.length) + 1;
    if (P.att && P.att.end) { var sc = CU.score(P.att.log); P.past.push({ t0: P.att.t0, code: P.att.code, scale: sc.scale, n: sc.n, why: P.att.end.why }); P.past = P.past.slice(-5); }
    var mm = TRY && Q.match(/[?&]mins=([\d.]+)/), mins = mm ? parseFloat(mm[1]) : r.demo ? r.len : minutesFor(r.len);
    P.att = { n: n, sid: me().sid, code: r.code, lenIdx: r.lenIdx, top: r.top, lenMs: Math.round(mins * 60000), seed: CU.hash(me().sid + '|' + r.code + '|' + now) & 0x7fffffff, t0: now, log: [], cur: null, end: null, ext: 0, extMs: 0, reloads: 0, papers: [] };
    save(); render();
  }

  function finish(why, at) {
    var a = P.att; if (!a || a.end) return;
    away(false); a.cur = null; a.end = { at: at || Date.now(), why: why };
    save();
  }

  // the question the student is on (made again from the seed after a reload, so it is the same question)
  function current() {
    var a = P.att;
    if (!a.cur) {
      if (a.log.length >= CU.MAX_ITEMS) { finish('max'); return null; }
      if (CU.stable(a.log, a.top)) { finish('stable'); return null; }
      var nx = CU.next(a.seed, a.log, true, a.top);
      a.cur = { i: nx.i, s: nx.s, d: nx.d, p: nx.paper, t0: Date.now(), part: 0, resp: [], f: 0, a: 0, b: 0, r: 0 };
      SFA.store.set(KEY, P);
    }
    var c = a.cur, it = c.p ? CU.paper(c.s, c.d, a.seed) : null;
    if (c.p && !it) { c.p = 0; }
    if (!it) it = CU.make(c.s, c.d, a.seed + '|' + c.i);
    if (!it) { for (var d = 1; d <= 4 && !it; d++) it = CU.make(c.s, d, a.seed + '|' + c.i + '|alt'); if (it) c.d = it.d; }
    return it;
  }

  function test() {
    clear(); view = 'test';
    var a = P.att, it = current();
    if (!it) { if (!a.end) finish('max'); return render(); }
    var c = a.cur, sk = SKN[c.s];
    // top bar: question number and a calm clock (minutes only)
    var hideT = SFA.store.get('ck.hidetimer', false);
    var tchip = el('button', { type: 'button', 'class': 'chip ck-time', title: 'Tap to hide or show the time', onclick: function () { hideT = !hideT; SFA.store.set('ck.hidetimer', hideT); clock(); } });
    var sync = el('span', { 'class': 'chip static ck-sync' });
    chips.appendChild(el('span', { 'class': 'chip static', text: 'Question ' + (c.i + 1) })); chips.appendChild(tchip); chips.appendChild(sync);
    var nudge = el('p', { 'class': 'ck-nudge', role: 'status', 'aria-live': 'polite', hidden: '' });
    function clock() {
      var left = deadline(a) - Date.now();
      if (left <= 0) { finish('time', deadline(a)); render(); return; }
      var m = Math.ceil(left / 60000);
      tchip.textContent = hideT ? '⏳ Show time' : '⏳ ' + (left < 60000 ? 'Under 1 minute left' : m + ' min left');
      tchip.classList.toggle('low', !hideT && left < 3 * 60000);
      var st = S.status; sync.textContent = st === 'saved' ? '✓ Saved' : st === 'saving' ? 'Saving…' : 'Saved on this device (will send)';
      var onQ = (Date.now() - c.t0) / 1000;
      if (onQ > Math.max(90, it.exp * 2) && nudge.hidden) { nudge.hidden = false; nudge.textContent = 'No rush. If you are stuck, it is fine to give your best answer or choose "I don\'t know yet" and move on.'; }
    }
    tick = setInterval(clock, 1000);

    var head = el('h2', { 'class': 'ck-h', tabindex: '-1', text: 'Question ' + (c.i + 1) }), kids = [el('div', { 'class': 'ck-meta' }, [head, el('span', { 'class': 'ck-skill', text: sk.name })])];
    if (c.p) kids.push(el('div', { 'class': 'ck-paper', role: 'note' }, [el('b', { text: '✍ Work it out on paper. ' }), 'Take your time with this one. Write out each step of your thinking, check that each step follows from the last, then type your final answer here.']));
    kids.push(it.html ? inkHtml(it.stem, 'div', 'ck-stem') : rich(it.stem, 'p', 'ck-stem'));
    var body = el('div', { 'class': 'ck-body' }), figBox = el('div', { 'class': 'ck-fig' }), partsBox = el('div', { 'class': 'ck-parts' });
    if (it.figHtml) { figBox.appendChild(inkHtml(it.figHtml, 'div', 'fig')); }
    body.appendChild(figBox); body.appendChild(partsBox); kids.push(body);
    var msg = el('p', { 'class': 'ck-msg', role: 'status', 'aria-live': 'polite' });
    var submit = el('button', { type: 'button', 'class': 'btn primary', text: 'Submit answer', onclick: function () { doSubmit(); } });
    var idkBox = el('span', { 'class': 'ck-idk' });
    function idkAsk() {
      idkBox.innerHTML = '';
      idkBox.appendChild(el('button', { type: 'button', 'class': 'ck-link', text: 'I don\'t know yet', onclick: function () {
        idkBox.innerHTML = ''; idkBox.appendChild(el('span', { text: 'Skip this question? ' }));
        idkBox.appendChild(el('button', { type: 'button', 'class': 'btn small', text: 'Yes, next question', onclick: function () { done(false, true); } }));
        idkBox.appendChild(el('button', { type: 'button', 'class': 'ck-link', text: 'Keep working', onclick: idkAsk }));
      } }));
    }
    idkAsk();
    kids.push(nudge); kids.push(msg); kids.push(el('div', { 'class': 'ck-actions' }, [submit, idkBox]));
    kids.push(el('p', { 'class': 'ck-foot muted', text: 'You can\'t go back after you submit.' }));
    root.appendChild(el('section', { 'class': 'ck-item prob' }, kids));

    var figShown = false, widgets = [], active = null, allOk = true;
    function showPart(k, restore) {
      // the figure is drawn once: inside the part that taps it, or above the parts when no part does
      var p = it.parts[k], embeds = !!it.fig && usesFig(p) && (p.kind === 'row' || it.fig.t === 'graph');
      if (it.fig && !figShown) { figShown = true; if (!embeds) figBox.appendChild(it.fig.t === 'graph' ? graph(it.fig) : rowsFig(it.fig, null).node); }
      var w = partWidget(p, embeds ? it.fig : null, function () { doSubmit(); });
      if (it.parts.length > 1) w.node.insertBefore(el('div', { 'class': 'ck-pn', text: 'Part ' + (k + 1) + ' of ' + it.parts.length }), w.node.firstChild);
      partsBox.appendChild(w.node); widgets[k] = w;
      if (restore !== undefined) { w.set(restore); w.lock(); w.node.classList.add('done'); if (!CU.checkPart(p, restore)) allOk = false; }
      else { active = w; submit.textContent = k < it.parts.length - 1 ? 'Submit part ' + (k + 1) : 'Submit answer'; }
      return w;
    }
    for (var k = 0; k < c.part && k < it.parts.length; k++) showPart(k, c.resp[k]);
    showPart(Math.min(c.part, it.parts.length - 1));
    clock();
    setTimeout(function () { try { head.focus({ preventScroll: true }); } catch (e) { } window.scrollTo(0, 0); }, 0);

    hook = { item: it, answer: function (resp) { if (active) { active.set(resp); doSubmit(); } }, skip: function () { done(false, true); } };   // for scripted run-throughs
    function doSubmit() {
      if (!active) return;
      var r = active.get();
      if (r == null) { msg.textContent = 'Answer this part first' + (it.parts[c.part].kind === 'num' ? ' (fill in every box)' : '') + ', or choose "I don\'t know yet".'; return; }
      msg.textContent = '';
      var p = it.parts[c.part]; if (!CU.checkPart(p, r)) allOk = false;
      active.lock(); active.node.classList.add('done'); c.resp[c.part] = r; c.part++;
      if (c.part < it.parts.length) { SFA.store.set(KEY, P); active = null; var w = showPart(c.part); try { w.node.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { } w.focus(); return; }
      done(allOk, false);
    }
    function done(ok, idk) {
      away(false);
      var t = Math.max(1, Math.round((Date.now() - c.t0) / 1000)), f = c.f || 0;
      if (CU.fast(t, it.exp)) f |= CU.FLAG.fast; if (CU.slow(t, it.exp)) f |= CU.FLAG.slow;
      a.log.push({ s: c.s, d: c.d, ok: ok ? 1 : 0, p: c.p ? 1 : 0, idk: idk ? 1 : 0, t: t, f: f, a: c.a || 0, b: c.b || 0, r: c.r || 0 });
      if (c.p) a.papers.push({ s: c.s, i: c.i, chk: it.chk });
      P.done['a' + a.n + 'i' + c.i] = 1; a.cur = null;
      save(); render();
    }
  }

  /* ---------------- the summary: what you can do, what to practise next ---------------- */
  function scaleBar(sc) {
    var pos = function (v) { return Math.max(0, Math.min(100, (v - 250) / 5)); };
    var bar = el('div', { 'class': 'ck-scale', role: 'img', 'aria-label': 'Scale score ' + sc.scale + ', give or take ' + sc.pm });
    [['Limited', 250, 450, 'l1'], ['Emerging', 450, 550, 'l2'], ['Developed', 550, 650, 'l3'], ['Deep', 650, 750, 'l4']].forEach(function (b) { bar.appendChild(el('span', { 'class': 'band ' + b[3], style: 'left:' + pos(b[1]) + '%;width:' + (pos(b[2]) - pos(b[1])) + '%' }, [el('i', { text: b[0] })])); });
    bar.appendChild(el('span', { 'class': 'range', style: 'left:' + pos(sc.scale - sc.pm) + '%;width:' + (pos(sc.scale + sc.pm) - pos(sc.scale - sc.pm)) + '%' }));
    bar.appendChild(el('span', { 'class': 'dot', style: 'left:' + pos(sc.scale) + '%' }));
    return bar;
  }
  function summary() {
    clear(); view = 'summary';
    var a = P.att, sc = CU.score(a.log), mins = Math.max(1, Math.round((a.end.at - a.t0) / 60000));
    var why = { time: 'Time is up.', stable: 'You answered enough questions for a steady result, so the check stopped early.', max: 'You reached the last question.', left: 'The check was ended.' }[a.end.why] || '';
    var fb = CU.feedback(sc, a.log, a.top), practise = CU.nextSteps(fb, sc, 3);
    function lvTag(x) { return x.level ? badge(x.level) : el('span', { 'class': 'badge l0', text: x.n ? 'First read' : 'Not reached' }); }
    var sync = el('p', { 'class': 'ck-savenote', role: 'status' });
    function showSync() { var st = S.status, un = S.unsent ? S.unsent() : 0; sync.textContent = st === 'saved' && !un ? '✓ Your result has reached Mr. Crowell.' : 'Your result is saved on this device and is still being sent. Keep this page open until it says it has reached Mr. Crowell.'; sync.classList.toggle('warn', !(st === 'saved' && !un)); }
    tick = setInterval(showSync, 1500); showSync();

    var top = [el('h2', { text: a.log.length ? 'Check finished. Here is where you are.' : 'Check finished' }), el('p', { 'class': 'muted', text: why + ' You answered ' + a.log.length + ' question' + (a.log.length === 1 ? '' : 's') + ' in ' + mins + ' minute' + (mins === 1 ? '' : 's') + '.' })];
    if (sc.level) {
      top.push(el('div', { 'class': 'ck-overall' }, [el('div', {}, [el('div', { 'class': 'k', text: 'Overall, right now' }), badge(sc.level), el('div', { 'class': 'ck-sc' }, [el('b', { text: String(sc.scale) }), ' ± ' + sc.pm + ' on the Unit 2 scale'])]), scaleBar(sc)]));
      top.push(el('p', { 'class': 'muted', text: 'The ± is honest uncertainty: one check can\'t pin you down exactly. Developed (550 and up) is the goal for Unit 2. Below: what you can do now, and exactly what to work on next.' }));
    } else top.push(el('p', { text: 'There are not enough answers yet for an overall level (at least ' + CU.NEED.all + ' are needed). Whatever you did answer is still below.' }));
    top.push(sync);
    root.appendChild(card(top));

    // what to do next comes before the long skill list: on a phone it is the first thing under the result
    if (practise.length) root.appendChild(card([el('h2', { text: 'Your next steps' }), el('p', { text: 'Work on these first, in this order. Each one says exactly what to do. Then open it in the Unit 2 Review: read the Learn tab, do the guided practice, and finish with independent practice until you get 3 of 4 right.' }),
      el('ol', { 'class': 'ck-steps' }, practise.map(function (x) {
        return el('li', {}, [el('div', { 'class': 'ck-fbh' }, [el('b', { text: x.name }), lvTag(x)]), el('p', { 'class': 'ck-how' }, [el('b', { text: 'How to improve: ' }), x.next]),
          el('a', { 'class': 'btn small', href: 'review-u2.html#' + x.id, text: '📝 Practise this' })]);
      }))]));
    else if (sc.level) root.appendChild(card([el('h2', { text: 'Your next steps' }), el('p', {}, ['Every skill you were asked about is at Developed or Deep. Keep it sharp with the stretch problems or the ', el('a', { href: 'review-u2.html#mixed', text: 'mixed review' }), ', and explain each step as you go.'])]));

    root.appendChild(card([el('h2', { text: 'Skill by skill: what you can do, and what\'s next' }), el('p', { 'class': 'muted', text: 'Each skill had one to three questions. "First read" means only one answer so far, so it is a best guess.' })].concat(CU.CRIT.map(function (c) {
      return el('div', { 'class': 'ck-fbc' }, [el('h3', { text: c.name }), el('ul', { 'class': 'ck-fb' }, fb.filter(function (x) { return x.crit === c.id; }).map(function (x) {
        return el('li', { 'class': 'ck-fbi ' + LVC[x.level] }, [el('div', { 'class': 'ck-fbh' }, [el('a', { href: 'review-u2.html#' + x.id, text: x.name }), lvTag(x)]),
          x.can ? el('p', { 'class': 'ck-can' }, ['✓ ', x.can]) : null,
          el('p', { 'class': 'ck-how' }, [x.level === 4 ? '★ ' : '→ ', x.next])]);
      }))]);
    }))));

    root.appendChild(card([el('h2', { text: 'The four success criteria' }), el('div', { 'class': 'ck-crits' }, CU.CRIT.map(function (c) {
      var e = sc.crit[c.id];
      return el('div', { 'class': 'ck-crit ' + LVC[e.level] }, [el('div', {}, [el('small', { text: c.strand }), el('b', { text: c.name })]), el('div', { 'class': 'r' }, [badge(e.level), el('small', { text: e.n + ' question' + (e.n === 1 ? '' : 's') + (e.level ? ' · ' + e.scale + ' ± ' + e.pm : '') })])]);
    }))]));

    var more = [el('a', { 'class': 'btn', href: 'review-u2.html', text: '📝 Open the Unit 2 Review' }), el('a', { 'class': 'btn', href: 'index.html', text: '🕹️ Back to the arcade' })];
    var codeIn = el('input', { type: 'text', 'class': 'ck-code small', maxlength: '5', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', 'aria-label': 'New start code', placeholder: '•••••' }), cm = el('span', { 'class': 'ck-msg', role: 'status' });
    function withCode(f) { var r = CU.readCode(codeIn.value, Date.now()); if (!r.ok) { cm.textContent = ' ' + r.why; return; } gateCheck().then(function (on) { if (on) f(r); else cm.textContent = ' The Check is closed. Mr. Crowell opens it in class.'; }); }
    var tools = el('details', { 'class': 'ck-tools' }, [el('summary', { text: 'Mr. Crowell gave you a new code?' }), el('p', { 'class': 'muted', text: 'A new start code can give you 10 more minutes on this attempt (if it ended because time ran out today) or start a fresh attempt with new numbers.' }),
      el('div', { 'class': 'ck-start' }, [codeIn,
        a.end.why === 'time' && a.log.length < CU.MAX_ITEMS ? el('button', { type: 'button', 'class': 'btn small', text: '+10 minutes', onclick: function () { withCode(function () { a.ext = (a.ext || 0) + 1; a.extMs = Date.now() + 600000 - a.t0 - a.lenMs; a.end = null; save(); render(); }); } }) : null,
        el('button', { type: 'button', 'class': 'btn small', text: 'Start a new attempt', onclick: function () { withCode(function (r) { if (window.confirm('Start a new attempt? Your teacher will see the new attempt in place of this one.')) begin(r); }); } }), cm])]);
    root.appendChild(el('div', { 'class': 'ck-end' }, more));
    root.appendChild(tools);
  }

  /* ---------------- start up ---------------- */
  if (P.att && !P.att.end) { P.att.reloads = (P.att.reloads || 0) + 1; if (P.att.cur) P.att.cur.r = (P.att.cur.r || 0) + 1; SFA.store.set(KEY, P); }
  var lastSid = me() ? me().sid : null;
  if (S && S.onChange) S.onChange(function () {
    var sid = me() ? me().sid : null;
    if (sid !== lastSid) { lastSid = sid; P = load(); render(); return; }   // signed in (the saved copy from the Sheet may have arrived) or out
    if (view === 'gate' && sid) render();
  });
  // teacher demo: always the pretend student (practice backend only), even if a practice student was signed in here
  if (DEMO && S && !(me() && me().sid === 'demo')) { if (me()) S.signOut(); P = fresh(); S.signInCode('DEMO00').then(function () { P = load(); render(); }, function () { }); }
  render();
  window.CU2_APP = { state: function () { return P; }, render: render, hook: function () { return view === 'test' ? hook : null; } };
})();
