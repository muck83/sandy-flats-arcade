/* Unit 2 Summative, The Pop-Up Arcade (summative-u2.html and summative-u2-teacher.html).
   Draws the number lines and the coordinate grid, blank or with the answer (data-ans). On the student page, typed
   answers and graph photos are kept in this browser only (localStorage), so a student can work without signing in
   and print everything to one PDF at the end. Nothing is sent anywhere. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, str, cls, extra) {
    var t = s('text', Object.assign({ x: x, y: y, 'class': cls }, extra || {}), parent);
    t.textContent = str; return t;
  }

  /* ---------- number lines: data-min, data-max, data-every (number labels), data-var, data-ans "L,c|o,R,c|o" ---------- */
  function numberLine(box) {
    var min = +box.dataset.min, max = +box.dataset.max, every = +(box.dataset.every || 1), v = box.dataset['var'] || '';
    var W = 600, H = 58, pl = 30, pr = 30, ay = 24;
    var X = function (n) { return pl + (n - min) / (max - min) * (W - pl - pr); };
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Number line from ' + min + ' to ' + max + (v ? ' for ' + v : '') });
    s('line', { x1: 8, y1: ay, x2: W - 8, y2: ay, 'class': 'nlax' }, svg);
    s('path', { d: 'M8 ' + ay + ' l9 -6 v12 z', fill: '#2B2A33' }, svg);
    s('path', { d: 'M' + (W - 8) + ' ' + ay + ' l-9 -6 v12 z', fill: '#2B2A33' }, svg);
    var stepT = (max - min) > 40 ? every : 1;
    for (var n = min; n <= max + 1e-9; n += stepT) {
      var big = Math.abs((n - min) % every) < 1e-9;
      s('line', { x1: X(n), y1: ay - (big ? 8 : 5), x2: X(n), y2: ay + (big ? 8 : 5), 'class': 'nltk' }, svg);
      if (big) txt(svg, X(n), ay + 24, String(n), 'nlnum');
    }
    if (v) txt(svg, W - 6, ay - 10, v, 'nlvar', { 'text-anchor': 'end' });
    if (box.dataset.ans) {
      var a = box.dataset.ans.split(','), L = a[0] === '' ? null : +a[0], R = a[2] === '' ? null : +a[2];
      var x1 = L == null ? 12 : X(L), x2 = R == null ? W - 12 : X(R);
      s('line', { x1: x1, y1: ay, x2: x2, y2: ay, 'class': 'ansl' }, svg);
      if (L == null) s('path', { d: 'M6 ' + ay + ' l12 -8 v16 z', fill: '#2456D6' }, svg);
      if (R == null) s('path', { d: 'M' + (W - 6) + ' ' + ay + ' l-12 -8 v16 z', fill: '#2456D6' }, svg);
      if (L != null) s('circle', { cx: X(L), cy: ay, r: 7, 'class': 'ansd' + (a[1] === 'o' ? ' o' : '') }, svg);
      if (R != null) s('circle', { cx: X(R), cy: ay, r: 7, 'class': 'ansd' + (a[3] === 'o' ? ' o' : '') }, svg);
    }
    box.appendChild(svg);
  }

  /* ---------- the coordinate grid: c across (0 to 32, 2 per square), h up (0 to 14, 1 per square) ---------- */
  function grid(box) {
    var cell = 24, ml = 46, mr = 16, mt = 16, mb = 44, nx = 16, ny = 14, cpc = 2;
    var W = ml + nx * cell + mr, H = mt + ny * cell + mb;
    var X = function (c) { return ml + c / cpc * cell; }, Y = function (h) { return mt + (ny - h) * cell; };
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Coordinate grid: claw machines c from 0 to 32 across, air hockey tables h from 0 to 14 up' + (box.dataset.ans ? ', with the answer drawn' : '') });
    s('rect', { x: ml, y: mt, width: nx * cell, height: ny * cell, 'class': 'gbg' }, svg);
    for (var i = 0; i <= nx; i++) s('line', { x1: ml + i * cell, y1: mt, x2: ml + i * cell, y2: mt + ny * cell, 'class': 'gl' + (i % 2 ? '' : ' mj') }, svg);
    for (var j = 0; j <= ny; j++) s('line', { x1: ml, y1: mt + j * cell, x2: ml + nx * cell, y2: mt + j * cell, 'class': 'gl' + (j % 2 ? '' : ' mj') }, svg);
    s('line', { x1: ml, y1: mt + ny * cell, x2: ml + nx * cell, y2: mt + ny * cell, 'class': 'gax' }, svg);
    s('line', { x1: ml, y1: mt, x2: ml, y2: mt + ny * cell, 'class': 'gax' }, svg);
    for (i = 0; i <= nx; i++) txt(svg, ml + i * cell, mt + ny * cell + 15, String(i * cpc), 'gnum', { 'text-anchor': 'middle' });
    for (j = 0; j <= ny; j++) txt(svg, ml - 6, Y(j) + 4, String(j), 'gnum', { 'text-anchor': 'end' });
    txt(svg, ml + nx * cell / 2, H - 6, 'c = number of claw machines', 'gttl', { 'text-anchor': 'middle' });
    txt(svg, 14, mt + ny * cell / 2, 'h = number of air hockey tables', 'gttl', { 'text-anchor': 'middle', transform: 'rotate(-90 14 ' + (mt + ny * cell / 2) + ')' });
    if (box.dataset.ans === 'pre') drawPre(svg, X, Y);
    else if (box.dataset.ans) drawAnswer(svg, X, Y, box.dataset.ans);
    box.appendChild(svg);
    box.su2 = { svg: svg, X: X, Y: Y, inv: function (px, py) { return [(px - ml) / cell * cpc, ny - (py - mt) / cell]; }, W: W, H: H };
  }
  // the support grid: floor space and budget already drawn, the rest is the student's
  function drawPre(svg, X, Y) {
    var line = function (a, b, cls) { s('line', { x1: X(a[0]), y1: Y(a[1]), x2: X(b[0]), y2: Y(b[1]), 'class': 'bd ' + cls }, svg); };
    line([0, 10], [30, 0], 'sp'); line([0, 12], [24, 0], 'bu');
    [[0, 10], [30, 0], [0, 12], [24, 0]].forEach(function (p) { s('circle', { cx: X(p[0]), cy: Y(p[1]), r: 4.5, 'class': 'cpt' }, svg); });
    var lab = function (c, h, dy, str, cls, deg) { var x = X(c), y = Y(h) + dy; txt(svg, x, y, str, 'glab ' + cls, { transform: 'rotate(' + deg + ' ' + x + ' ' + y + ')' }); };
    lab(19.5, 10 - 19.5 / 3, -5, 'floor space 2c + 6h = 60', 'sp', 33.7);
    lab(3, 12 - 3 / 2, -5, 'budget 200c + 400h = 4800', 'bu', 45);
  }
  function drawAnswer(svg, X, Y, mode) {
    var P = function (pts) { return pts.map(function (p) { return X(p[0]) + ',' + Y(p[1]); }).join(' '); };
    // the feasible region: c >= 4, 0 <= h <= 8, 2c + 6h <= 60, 200c + 400h <= 4800, 20c + 50h > 300
    s('polygon', { points: P([[15, 0], [24, 0], [12, 6], [6, 8], [4, 8], [4, 4.4]]), 'class': 'fz' }, svg);
    var line = function (a, b, cls) { s('line', { x1: X(a[0]), y1: Y(a[1]), x2: X(b[0]), y2: Y(b[1]), 'class': 'bd ' + cls }, svg); };
    line([4, 0], [4, 14], 'lm'); line([0, 8], [32, 8], 'lm');
    line([0, 10], [30, 0], 'sp'); line([0, 12], [24, 0], 'bu'); line([0, 6], [15, 0], 'st d');
    txt(svg, X(4) + 4, Y(13.3), 'c = 4', 'glab'); txt(svg, X(25), Y(8) - 5, 'h = 8', 'glab');
    // labels sit along their lines (on screen: 1 c-unit = 12 px, 1 h-unit = 24 px, so the angles are not the slopes)
    var lab = function (c, h, dy, str, cls, deg) { var x = X(c), y = Y(h) + dy; txt(svg, x, y, str, 'glab ' + cls, { transform: 'rotate(' + deg + ' ' + x + ' ' + y + ')' }); };
    lab(19.5, 10 - 19.5 / 3, -5, 'floor space', 'sp', 33.7);
    lab(16, 12 - 16 / 2, -5, 'budget', 'bu', 45);
    lab(6.5, 6 - 0.4 * 6.5, 22, 'staff pay (dashed)', 'st', 38.7);
    txt(svg, X(11), Y(2.6), 'feasible region', 'glab fz', { 'text-anchor': 'middle' });
    [[24, 0], [12, 6], [6, 8], [4, 8]].forEach(function (p) { s('circle', { cx: X(p[0]), cy: Y(p[1]), r: 5.5, 'class': 'cpt' }, svg); });
    [[15, 0], [4, 4.4]].forEach(function (p) { s('circle', { cx: X(p[0]), cy: Y(p[1]), r: 5.5, 'class': 'cpt o' }, svg); });
    txt(svg, X(12) + 8, Y(6) - 8, '(12, 6) best: $540', 'glab');
    txt(svg, X(6) + 4, Y(8) - 9, '(6, 8) Gus', 'glab');
    txt(svg, X(24) - 4, Y(0) - 9, '(24, 0) Priya', 'glab', { 'text-anchor': 'middle' });
    if (mode === 'full') {
      s('circle', { cx: X(10), cy: Y(10), r: 5.5, 'class': 'ppt' }, svg);
      txt(svg, X(10) + 8, Y(10) + 4, '(10, 10) Marcus: outside', 'glab');
    }
  }

  document.querySelectorAll('.nl').forEach(numberLine);
  document.querySelectorAll('.grid').forEach(grid);

  /* ---------- hints: three levels per question (a nudge, the first step, an example from another setting).
     The handout opens them one at a time and notes the deepest level used. The support pack prints them all as cards. ---------- */
  var HINTS = {
    1: ['"At least 4" means 4 is allowed, and so is anything bigger.', 'Start with c ___ 4. Which symbol means "greater than or equal to"?', 'Example: "at least 10 burritos" → b ≥ 10. Closed dot on 10, arrow to the right.'],
    2: ['"Only 8" means 8 is the most they can rent.', 'Use ≤ for "at most". You can\'t rent −1 tables either, so h ≥ 0.', 'Example: "no more than 6 drinks" → 0 ≤ d ≤ 6. Closed dots on 0 and 6, shaded between.'],
    3: ['With claw machines only, the floor used is 2 × c.', 'Floor: 2c ≤ 60, then divide both sides by 2. Build the budget (200c ≤ ___) and staff pay (20c > ___) the same way.', 'Example: a taco takes 2 minutes on a grill that has 240 minutes: 2t ≤ 240, so t ≤ 120. For 3d, a number has to be in every shaded part at once.'],
    4: ['Put c = 4 in first. 4 claw machines already use 2 × 4 = 8 m².', 'Floor: 8 + 6h ≤ 60. Subtract 8 from both sides, then divide by 6.', 'Example: 10 burritos use 4 × 10 = 40 minutes, so 40 + 2t ≤ 240 → 2t ≤ 200 → t ≤ 100.'],
    5: ['c claw machines use 2c m². What do h air hockey tables use?', 'Floor: 2c + 6h ≤ 60. Build the budget the same way with $200 and $400.', 'Example: t tacos (2 minutes each) and b burritos (4 minutes each) on a 240-minute grill: 2t + 4b ≤ 240.'],
    6: ['A system is a list. Write every limit, one per line.', 'You need five: prize deal, stock, floor space, budget, staff pay.', 'Look back at questions 1, 2 and 5.'],
    7: ['Marcus\'s plan is c = 10, h = 10. Put those numbers into each inequality.', 'Floor for Marcus: 2(10) + 6(10) = 80. Is 80 ≤ 60?', 'Example: 50 tacos and 40 burritos: 2(50) + 4(40) = 260. Is 260 ≤ 240? No, so ✗.'],
    8: ['Get h on its own on one side.', '2c + 6h = 60 → take 2c from both sides → 6h = −2c + 60 → divide every term by 6.', 'Example: 2t + 4b = 240 → 4b = −2t + 240 → b = −½t + 60.'],
    9: ['Look at your slope. When h goes up by 1, what happens to c?', 'One air hockey table uses 6 m². How many 2 m² claw machines is that?', 'Example: a burrito uses 4 minutes, the same as 2 tacos, so each extra burrito means 2 fewer tacos.'],
    10: ['To find where a line crosses the c-axis, put h = 0.', 'Floor: 2c + 6(0) = 60, so c = 30 and the point is (30, 0). Now put c = 0 to find where it crosses the h-axis.', 'Dashed for < or > (the line itself isn\'t included). Solid for ≤ or ≥.'],
    11: ['Plot the two crossing points from question 10 and join them with a ruler. Across, each square is 2 machines.', 'Test point (0, 0): is 2(0) + 6(0) ≤ 60? Yes, so keep the side with (0, 0). Test every line the same way.', 'The feasible region is where all the "keep" sides overlap. It has six corners.'],
    12: ['Find where the floor space and budget lines meet. Read across, then up.', 'Put the point you read into 2c + 6h and into 200c + 400h.', 'Both should come out exactly at the limit: 60 and 4800. If not, try a nearby point.'],
    13: ['Plot (10, 10), (24, 0) and (6, 8).', 'A plan is possible if it is in the shaded region or on a solid edge.', 'One of the three should be well outside. Where are the other two?'],
    14: ['Each claw machine takes in $20 a day, so c machines take in 20c.', 'M = 20c + ___h', 'Example: tacos make $3 each and burritos $5 each: P = 3t + 5b.'],
    15: ['The corners are where two edges of the shaded region meet.', 'One corner is where floor space meets budget. Others are on the c-axis, on h = 8 and on c = 4.', 'For each corner: M = 20 × c + 50 × h. Example: (24, 0) → 20 × 24 + 50 × 0 = $480.'],
    16: ['Which row of your table has the biggest M?', 'Check that plan is inside the region and uses whole numbers.', 'Frame: "The best plan is ___ claw machines and ___ air hockey tables. It takes in $___ a day, which is $___ more than Gus\'s plan and $___ more than Priya\'s."'],
    17: ['Look at your ✓ and ✗ table for Marcus.', 'Name each limit his plan breaks, with numbers.', 'Frame: "Ten of each would need ___ m², but there are only 60 m². It would cost $___, but …"'],
    18: ['The new rule is M = 20c + 70h.', 'Work out M again at the corners (24, 0), (12, 6), (6, 8) and (4, 8).', 'To explain why: going from (12, 6) to (6, 8) loses 6 claw machines and gains 2 tables. Compare the money lost with the money gained.'],
    19: ['Read your card. Which limit or which takings number changes?', 'Rewrite that one inequality (or the money rule), redraw that one line, and find the new corners.', 'Work out M at the new corners. Is the best plan the same as before? Say why or why not.']
  };
  var CARDS = [
    { t: 'Rent rise', d: 'The air hockey company raises its summer rent to $600 a table. Everything else stays the same.' },
    { t: 'Broken tables', d: 'Three of the town\'s air hockey tables are broken. Only 5 can be rented now.' },
    { t: 'Bigger boathouse', d: 'The council clears out a storeroom. There are now 72 m² of floor for machines.' },
    { t: 'New prize deal', d: 'The prize company changes its deal: it now wants at least 10 claw machines.' },
    { t: 'Claw craze', d: 'A new prize is going viral. Each claw machine now takes in $30 a day.' },
    { t: 'Sponsor', d: 'A sponsor adds money. The budget for machines is now $6000.' }
  ];
  window.SU2 = { HINTS: HINTS, CARDS: CARDS };

  /* ---------- student page: answers kept in this browser ---------- */
  var KEY = 'sfa.su2.answers.v1', PKEY = 'sfa.su2.photo.';
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  var saved = load(), saveWarned = false;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(saved)); }
    catch (e) { if (!saveWarned) { saveWarned = true; alert('This browser won\'t keep your typing (private window or storage blocked). Print or save as PDF before you close the page.'); } }
  }
  document.querySelectorAll('.ans').forEach(function (box) {
    var id = box.dataset.id, ta = document.createElement('textarea'), prt = document.createElement('div');
    ta.setAttribute('aria-label', box.dataset.label || 'Your answer');
    ta.value = saved[id] || ''; prt.className = 'prt'; prt.textContent = ta.value;
    ta.addEventListener('input', function () { saved[id] = ta.value; prt.textContent = ta.value; save(); });
    box.appendChild(ta); box.appendChild(prt);
  });
  document.querySelectorAll('input[data-id]').forEach(function (inp) {
    inp.value = saved[inp.dataset.id] || '';
    inp.addEventListener('input', function () { saved[inp.dataset.id] = inp.value; save(); });
  });

  // photo slots: a photo of a hand-drawn graph (or of the finished plan), shrunk and kept in this browser
  document.querySelectorAll('.photo').forEach(function (box) {
    var id = box.dataset.id, img = document.createElement('img'), wrap = document.createElement('div'), inp = document.createElement('input'), rm = document.createElement('button');
    wrap.className = 'pbtn';
    inp.type = 'file'; inp.accept = 'image/*'; inp.id = 'ph-' + id;
    var lab = document.createElement('label'); lab.htmlFor = inp.id; lab.textContent = box.dataset.label || 'Add a photo:';
    rm.type = 'button'; rm.className = 'chip'; rm.textContent = 'Remove photo'; rm.hidden = true;
    img.alt = box.dataset.alt || 'Your photo';
    function show(src) { if (src) { img.src = src; box.classList.add('has'); rm.hidden = false; if (!img.parentNode) box.appendChild(img); } else { img.remove(); img.removeAttribute('src'); box.classList.remove('has'); rm.hidden = true; } }
    try { show(localStorage.getItem(PKEY + id)); } catch (e) { }
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        var im = new Image();
        im.onload = function () {
          var k = Math.min(1, 1400 / Math.max(im.width, im.height)), cv = document.createElement('canvas');
          cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
          cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
          var url = cv.toDataURL('image/jpeg', 0.82); show(url);
          try { localStorage.setItem(PKEY + id, url); } catch (e) { alert('The photo is on the page now, but this browser can\'t keep it after you close the page. Print or save as PDF before you leave.'); }
        };
        im.src = r.result;
      };
      r.readAsDataURL(f); inp.value = '';
    });
    rm.addEventListener('click', function () { show(null); try { localStorage.removeItem(PKEY + id); } catch (e) { } });
    wrap.appendChild(lab); wrap.appendChild(inp); wrap.appendChild(rm); box.appendChild(wrap);
  });

  // hint drawers: one level at a time; the deepest level used is kept and printed (so the teacher sees it)
  document.querySelectorAll('.hints[data-q]').forEach(function (box) {
    var q = box.dataset.q, hs = HINTS[q] || [], used = +saved['hint' + q] || 0;
    var btn = document.createElement('button'), list = document.createElement('div'), note = document.createElement('div');
    btn.type = 'button'; btn.className = 'hbtn'; list.className = 'hlist'; note.className = 'hused';
    var names = ['Nudge', 'First step', 'Example'];
    function draw() {
      list.innerHTML = '';
      for (var i = 0; i < used; i++) { var p = document.createElement('p'); p.className = 'hl'; p.innerHTML = '<b>' + names[i] + ':</b> '; p.appendChild(document.createTextNode(hs[i])); list.appendChild(p); }
      btn.textContent = used >= hs.length ? '💡 All hints shown' : used ? '💡 Next hint (' + (used + 1) + ' of ' + hs.length + ')' : '💡 Need a hint?';
      btn.disabled = used >= hs.length;
      note.textContent = used ? 'Hints used on this question: ' + used + ' of ' + hs.length : '';
    }
    btn.addEventListener('click', function () { if (used < hs.length) { used++; saved['hint' + q] = used; save(); draw(); } });
    box.appendChild(btn); box.appendChild(list); box.appendChild(note); draw();
  });

  // news flash: drawn at random on screen (kept), or picked to match the paper card the teacher handed out
  document.querySelectorAll('.newsflash').forEach(function (box) {
    var sel = document.createElement('select'), draw = document.createElement('button'), card = document.createElement('div');
    sel.setAttribute('aria-label', 'Your news flash card');
    sel.appendChild(new Option('Pick the card you were given…', ''));
    CARDS.forEach(function (c, i) { sel.appendChild(new Option('Card ' + (i + 1) + ': ' + c.t, String(i))); });
    draw.type = 'button'; draw.className = 'chip'; draw.textContent = '🎲 Draw one at random';
    card.className = 'ncard';
    function show() {
      var i = saved.card; sel.value = i == null ? '' : String(i); card.innerHTML = '';
      if (i == null || !CARDS[i]) { card.hidden = true; return; }
      card.hidden = false;
      var b = document.createElement('b'); b.textContent = '📰 News flash ' + (+i + 1) + ': ' + CARDS[i].t; card.appendChild(b);
      card.appendChild(document.createTextNode(CARDS[i].d));
    }
    sel.addEventListener('change', function () { saved.card = sel.value === '' ? null : +sel.value; save(); show(); });
    draw.addEventListener('click', function () { saved.card = Math.floor(Math.random() * CARDS.length); save(); show(); });
    var row = document.createElement('div'); row.className = 'pbtn noprint'; row.appendChild(sel); row.appendChild(draw);
    box.appendChild(row); box.appendChild(card); show();
  });

  function on(id, fn) { var b = document.getElementById(id); if (b) b.addEventListener('click', fn); }
  on('printMine', function () { document.body.classList.remove('blank'); window.print(); });
  on('printBlank', function () { document.body.classList.add('blank'); window.print(); setTimeout(function () { document.body.classList.remove('blank'); }, 500); });
  on('clearMine', function () {
    if (!confirm('Clear everything you typed and every photo you added on this page, in this browser? This can\'t be undone.')) return;
    try { localStorage.removeItem(KEY); Object.keys(localStorage).forEach(function (k) { if (k.indexOf(PKEY) === 0) localStorage.removeItem(k); }); } catch (e) { }
    location.reload();
  });
  window.addEventListener('afterprint', function () { document.body.classList.remove('blank'); });
})();
