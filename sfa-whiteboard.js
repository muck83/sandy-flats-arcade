/* Sandy Flats: the lesson whiteboard.
   The teacher draws in the console (🖊 Whiteboard). The class screen shows it at once (same browser), and students' own
   pages show it through the live lesson (needs the results script with the `wb` field; an older script just leaves it out).
   Board units: 1000 wide by 562 tall (16:9). Strokes travel as text: "<grid>:" then strokes joined by "|", each stroke
   "<colour><width>" then its points, every number as 2 base-36 characters.
   SFA_WB.init({ onChange(final) })   teacher: final = a stroke ended / undo / clear / grid (push to students); else just repaint the class screen
   SFA_WB.open() / close()            teacher: the drawing overlay; it shows to the class while open (unless "Show to class" is off)
   SFA_WB.live()                      what the console puts in the live object: null, or { on: 1, g, s }
   SFA_WB.restore(wb)                 teacher: after a console reload, pick up what was on the board
   SFA_WB.sync(live, mode)            class screen and students: show, update or hide the board */
(function () {
  'use strict';
  var W = window.SFA_WB = {}, BW = 1000, BH = 562, MAXLEN = 40000;
  var COLS = ['#1B1A22', '#2456D6', '#D62F2F', '#1E8A4C', '#E08A00', '#7A3FD0'], CNAME = ['Black', 'Blue', 'Red', 'Green', 'Orange', 'Purple'];
  var WID = [3, 6, 12], GRIDS = ['No grid', 'Squares', 'Coordinate plane', 'First quadrant'];
  var S = { open: false, show: true, g: 0, strokes: [], cur: null, col: 0, w: 1, tool: 'pen', undo: [] }, hooks = {};

  /* ---------- encoding ---------- */
  function b36(n) { n = Math.max(0, Math.min(1295, Math.round(n))); var s = n.toString(36); return s.length < 2 ? '0' + s : s; }
  function enc(strokes, g) { return g + ':' + strokes.map(function (k) { return String(k.c) + k.w + k.p.map(b36).join(''); }).join('|'); }
  function dec(s) {
    var m = String(s || '').match(/^(\d):?(.*)$/); if (!m) return { g: 0, strokes: [] };
    var out = [];
    (m[2] ? m[2].split('|') : []).forEach(function (t) {
      if (t.length < 2) return; var p = [];
      for (var i = 2; i + 1 < t.length; i += 2) p.push(parseInt(t.substr(i, 2), 36));
      if (p.length >= 2) out.push({ c: +t[0] || 0, w: +t[1] || 0, p: p });
    });
    return { g: +m[1] || 0, strokes: out };
  }
  // fewer points, same look: Ramer-Douglas-Peucker on the board units
  function simplify(p, tol) {
    if (p.length <= 4) return p;
    var pts = []; for (var i = 0; i < p.length; i += 2) pts.push([p[i], p[i + 1]]);
    var keep = new Array(pts.length); keep[0] = keep[pts.length - 1] = true;
    (function rdp(a, b) {
      var ax = pts[a][0], ay = pts[a][1], bx = pts[b][0], by = pts[b][1], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, best = -1, bi = -1;
      for (var j = a + 1; j < b; j++) { var d = Math.abs(dy * pts[j][0] - dx * pts[j][1] + bx * ay - by * ax) / L; if (d > best) { best = d; bi = j; } }
      if (best > tol) { keep[bi] = true; rdp(a, bi); rdp(bi, b); }
    })(0, pts.length - 1);
    var out = []; pts.forEach(function (q, k) { if (keep[k]) out.push(Math.round(q[0]), Math.round(q[1])); });
    return out;
  }

  /* ---------- drawing ---------- */
  function grid(ctx, g, k) {
    if (!g) return;
    ctx.save(); ctx.lineWidth = 1 * k;
    var cell = g === 3 ? 40 : 50, ox = g === 2 ? 500 : g === 3 ? 40 : 0, oy = g === 2 ? 281 : g === 3 ? 522 : 0, x, y;
    ctx.strokeStyle = '#DCD5BF';
    for (x = ox % cell; x <= BW; x += cell) { ctx.beginPath(); ctx.moveTo(x * k, 0); ctx.lineTo(x * k, BH * k); ctx.stroke(); }
    for (y = oy % cell; y <= BH; y += cell) { ctx.beginPath(); ctx.moveTo(0, y * k); ctx.lineTo(BW * k, y * k); ctx.stroke(); }
    if (g >= 2) {
      ctx.strokeStyle = '#2B2A33'; ctx.lineWidth = 2 * k;
      ctx.beginPath(); ctx.moveTo((g === 3 ? ox : 0) * k, oy * k); ctx.lineTo(BW * k, oy * k); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox * k, 0); ctx.lineTo(ox * k, (g === 3 ? oy : BH) * k); ctx.stroke();
      ctx.fillStyle = '#6B6676'; ctx.font = (13 * k) + 'px "IBM Plex Mono", monospace'; ctx.textAlign = 'center';
      for (x = ox + cell * 2; x < BW - 10; x += cell * 2) ctx.fillText(String(Math.round((x - ox) / cell)), x * k, (oy + 17) * k);
      if (g === 2) for (x = ox - cell * 2; x > 10; x -= cell * 2) ctx.fillText(String(Math.round((x - ox) / cell)), x * k, (oy + 17) * k);
      ctx.textAlign = 'right';
      for (y = oy - cell * 2; y > 10; y -= cell * 2) ctx.fillText(String(Math.round((oy - y) / cell)), (ox - 6) * k, (y + 5) * k);
      if (g === 2) for (y = oy + cell * 2; y < BH - 5; y += cell * 2) ctx.fillText(String(Math.round((oy - y) / cell)), (ox - 6) * k, (y + 5) * k);
      ctx.textAlign = 'left'; ctx.font = 'italic ' + (15 * k) + 'px Georgia, serif'; ctx.fillStyle = '#2B2A33';
      ctx.fillText('x', (BW - 16) * k, (oy - 8) * k); ctx.fillText('y', (ox + 8) * k, 18 * k);
    }
    ctx.restore();
  }
  function stroke(ctx, s, k) {
    var p = s.p; ctx.strokeStyle = COLS[s.c] || COLS[0]; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = (WID[s.w] || 6) * k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (p.length === 2) { ctx.beginPath(); ctx.arc(p[0] * k, p[1] * k, ctx.lineWidth / 2, 0, 7); ctx.fill(); return; }
    ctx.beginPath(); ctx.moveTo(p[0] * k, p[1] * k);
    for (var i = 2; i + 3 < p.length; i += 2) { var mx = (p[i] + p[i + 2]) / 2, my = (p[i + 1] + p[i + 3]) / 2; ctx.quadraticCurveTo(p[i] * k, p[i + 1] * k, mx * k, my * k); }
    ctx.lineTo(p[p.length - 2] * k, p[p.length - 1] * k); ctx.stroke();
  }
  function paint(cv, g, strokes, extra) {
    var r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    var ctx = cv.getContext('2d'), k = w / BW;
    ctx.fillStyle = '#FFFDF5'; ctx.fillRect(0, 0, w, h);
    grid(ctx, g, k);
    strokes.forEach(function (s) { stroke(ctx, s, k); });
    if (extra) stroke(ctx, extra, k);
  }

  /* ---------- styles ---------- */
  var css = '.wbx{position:fixed;inset:0;z-index:90;background:rgba(10,8,16,.92);display:flex;flex-direction:column;align-items:center;justify-content:safe center;overflow:auto;padding:12px;gap:10px}' +
    '.wbx .wbbar{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;justify-content:center;max-width:100%}' +
    '.wbx .wbbar button,.wbx .wbbar select{font:700 13px var(--ui,system-ui,sans-serif);padding:7px 11px;border-radius:999px;border:2px solid #3A3550;background:#24202F;color:#F3EFE7;cursor:pointer}' +
    '.wbx .wbbar button[aria-pressed="true"]{border-color:#FFC94A;background:#3A3015}' +
    '.wbx .wbbar .sw{width:30px;height:30px;padding:0;border-radius:50%}' +
    '.wbx .wbbar .sw[aria-pressed="true"]{outline:3px solid #FFC94A;outline-offset:2px}' +
    '.wbx .wbbar .sep{width:1px;height:26px;background:#3A3550}' +
    '.wbx .wbbar .go{background:#FFC94A;color:#231800;border-color:#FFC94A}' +
    '.wbx canvas{display:block;width:min(100%,calc((100vh - 120px) * 16 / 9));aspect-ratio:16/9;height:auto;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.5);touch-action:none;background:#FFFDF5}' +
    '.wbx.view canvas{cursor:default;width:min(100%,calc((100vh - 90px) * 16 / 9))}' +
    '.wbx .wbt{font:400 22px var(--display,system-ui);letter-spacing:.04em;color:#FFC94A}' +
    '.wbx .wbs{font:600 13px var(--ui,system-ui);color:#ABA5BC}' +
    '.wbmin{position:fixed;right:14px;bottom:14px;z-index:90;font:800 14px var(--ui,system-ui);padding:10px 16px;border-radius:999px;border:0;background:#FFC94A;color:#231800;box-shadow:0 8px 24px rgba(0,0,0,.4);cursor:pointer}';
  function addCss() { if (document.getElementById('wbcss')) return; var st = document.createElement('style'); st.id = 'wbcss'; st.textContent = css; document.head.appendChild(st); }
  function E(tag, attrs, kids) { var e = document.createElement(tag); for (var k in attrs || {}) { if (k === 'text') e.textContent = attrs[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); } (kids || []).forEach(function (c) { if (c) e.appendChild(c); }); return e; }

  /* ---------- teacher: the drawing overlay ---------- */
  var box = null, cv = null, bar = null, sizeObs = null;
  W.init = function (h) { hooks = h || {}; };
  function changed(final) { if (hooks.onChange) hooks.onChange(!!final); }
  function full() { return enc(S.strokes, S.g).length > MAXLEN; }
  function redraw() { if (cv) paint(cv, S.g, S.strokes, S.cur); }
  function at(e) { var r = cv.getBoundingClientRect(); return [Math.max(0, Math.min(BW, (e.clientX - r.left) / r.width * BW)), Math.max(0, Math.min(BH, (e.clientY - r.top) / r.height * BH))]; }
  function hitStroke(x, y) {
    for (var i = S.strokes.length - 1; i >= 0; i--) { var p = S.strokes[i].p, tol = (WID[S.strokes[i].w] || 6) / 2 + 9; for (var j = 0; j < p.length; j += 2) if (Math.hypot(p[j] - x, p[j + 1] - y) < tol) return i; }
    return -1;
  }
  function snapshot() { S.undo.push(JSON.stringify(S.strokes)); if (S.undo.length > 60) S.undo.shift(); }
  function buildBar() {
    bar.innerHTML = '';
    bar.appendChild(E('span', { 'class': 'wbt', text: '🖊 Whiteboard' }));
    COLS.forEach(function (c, i) { bar.appendChild(E('button', { type: 'button', 'class': 'sw', title: CNAME[i], 'aria-label': CNAME[i] + ' pen', 'aria-pressed': S.tool === 'pen' && S.col === i ? 'true' : 'false', style: 'background:' + c, onclick: function () { S.col = i; S.tool = 'pen'; buildBar(); } })); });
    bar.appendChild(E('span', { 'class': 'sep' }));
    ['Thin', 'Medium', 'Thick'].forEach(function (t, i) { bar.appendChild(E('button', { type: 'button', 'aria-pressed': S.w === i && S.tool === 'pen' ? 'true' : 'false', text: t, onclick: function () { S.w = i; S.tool = 'pen'; buildBar(); } })); });
    bar.appendChild(E('button', { type: 'button', 'aria-pressed': S.tool === 'erase' ? 'true' : 'false', text: '🧽 Eraser', title: 'Tap or drag over a line to remove it', onclick: function () { S.tool = 'erase'; buildBar(); } }));
    bar.appendChild(E('span', { 'class': 'sep' }));
    var gs = E('select', { 'aria-label': 'Grid', onchange: function () { S.g = +gs.value; redraw(); changed(true); } }, GRIDS.map(function (g, i) { var o = E('option', { value: String(i), text: (i ? '▦ ' : '') + g }); if (i === S.g) o.selected = true; return o; }));
    bar.appendChild(gs);
    bar.appendChild(E('button', { type: 'button', text: '↶ Undo', onclick: function () { if (!S.undo.length) return; S.strokes = JSON.parse(S.undo.pop()); redraw(); changed(true); } }));
    bar.appendChild(E('button', { type: 'button', text: '🗑 Clear', onclick: function () { if (!S.strokes.length) return; snapshot(); S.strokes = []; redraw(); changed(true); } }));
    bar.appendChild(E('span', { 'class': 'sep' }));
    bar.appendChild(E('button', { type: 'button', 'aria-pressed': S.show ? 'true' : 'false', text: S.show ? '📡 Showing to class' : '🙈 Hidden from class', title: 'While hidden you can prepare the board; the class keeps seeing the slide', onclick: function () { S.show = !S.show; buildBar(); changed(true); } }));
    bar.appendChild(E('button', { type: 'button', 'class': 'go', text: '✕ Close board', onclick: W.close }));
  }
  W.open = function () {
    addCss();
    if (box) return;
    S.open = true;
    box = E('div', { 'class': 'wbx', role: 'dialog', 'aria-label': 'Whiteboard' });
    bar = E('div', { 'class': 'wbbar' });
    cv = E('canvas', { 'aria-label': 'Drawing area' });
    var note = E('div', { 'class': 'wbs', text: 'Students see the board on the class screen and on their own devices. Close it to go back to the slide.' });
    box.appendChild(bar); box.appendChild(cv); box.appendChild(note);
    document.body.appendChild(box); buildBar();
    var drawing = false, last = 0;
    cv.addEventListener('pointerdown', function (e) {
      e.preventDefault(); cv.setPointerCapture(e.pointerId); var p = at(e);
      if (S.tool === 'erase') { drawing = true; var h = hitStroke(p[0], p[1]); if (h >= 0) { snapshot(); S.strokes.splice(h, 1); redraw(); changed(true); } return; }
      if (full()) { if (window.SFA && SFA.toast) SFA.toast('The board is full. Clear it or undo to keep drawing.', 3500); return; }
      drawing = true; S.cur = { c: S.col, w: S.w, p: [Math.round(p[0]), Math.round(p[1])] }; redraw();
    });
    cv.addEventListener('pointermove', function (e) {
      if (!drawing) return; var p = at(e);
      if (S.tool === 'erase') { var h = hitStroke(p[0], p[1]); if (h >= 0) { snapshot(); S.strokes.splice(h, 1); redraw(); changed(true); } return; }
      var q = S.cur.p, lx = q[q.length - 2], ly = q[q.length - 1];
      if (Math.hypot(p[0] - lx, p[1] - ly) < 2.5) return;
      q.push(Math.round(p[0]), Math.round(p[1])); redraw();
      if (Date.now() - last > 120) { last = Date.now(); changed(false); }   // the class screen follows the pen as it moves
    });
    function up() {
      if (!drawing) return; drawing = false;
      if (S.tool === 'pen' && S.cur) { snapshot(); S.cur.p = simplify(S.cur.p, 1.1); S.strokes.push(S.cur); S.cur = null; redraw(); changed(true); }
    }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    try { sizeObs = new ResizeObserver(redraw); sizeObs.observe(cv); } catch (e) { window.addEventListener('resize', redraw); }
    requestAnimationFrame(redraw);
    changed(true);
  };
  W.close = function () {
    S.open = false; S.cur = null;
    if (sizeObs) try { sizeObs.disconnect(); } catch (e) { }
    if (box) box.remove(); box = null; cv = null;
    changed(true);
  };
  W.isOpen = function () { return S.open; };
  W.live = function () { if (!S.open || !S.show) return null; var str = S.cur ? S.strokes.concat([{ c: S.cur.c, w: S.cur.w, p: S.cur.p }]) : S.strokes; return { on: 1, g: S.g, s: enc(str, S.g) }; };
  W.restore = function (wb) { if (!wb || !wb.s) return; var d = dec(wb.s); S.strokes = d.strokes; S.g = d.g; };

  /* ---------- class screen and students: the read-only board ---------- */
  var vbox = null, vcv = null, vmin = null, lastS = '', minimized = false, vObs = null;
  function vpaint() { if (!vcv) return; var d = dec(lastS); paint(vcv, d.g, d.strokes); }
  W.sync = function (live, mode) {
    var wb = live && live.wb && live.wb.on ? live.wb : null;
    if (!wb) { if (vbox) { vbox.remove(); vbox = null; vcv = null; } if (vmin) { vmin.remove(); vmin = null; } lastS = ''; minimized = false; return; }
    addCss();
    var s = String(wb.s || (wb.g || 0) + ':');
    if (!vbox && !(minimized && vmin)) {
      vbox = E('div', { 'class': 'wbx view', role: 'dialog', 'aria-label': 'Whiteboard from your teacher' });
      vcv = E('canvas', { role: 'img', 'aria-label': 'Your teacher\'s whiteboard' });
      var head = E('div', { 'class': 'wbbar' }, [E('span', { 'class': 'wbt', text: '🖊 Whiteboard' })]);
      if (mode === 'student') head.appendChild(E('button', { type: 'button', text: 'Back to the slide for now', onclick: function () { minimized = true; vbox.remove(); vbox = null; vcv = null; vmin = E('button', { type: 'button', 'class': 'wbmin', text: '🖊 Open the whiteboard', onclick: function () { minimized = false; vmin.remove(); vmin = null; lastS = ''; W.sync(live, mode); } }); document.body.appendChild(vmin); } }));
      vbox.appendChild(head); vbox.appendChild(vcv);
      document.body.appendChild(vbox);
      try { vObs = new ResizeObserver(vpaint); vObs.observe(vcv); } catch (e) { window.addEventListener('resize', vpaint); }
      lastS = '';
    }
    if (s !== lastS) { lastS = s; requestAnimationFrame(vpaint); }
  };
  W._enc = enc; W._dec = dec;   // for testing
})();
