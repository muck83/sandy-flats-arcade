/* Climb: the teacher dashboard. Runs the live session (open, start, pause, end, focus skill, time multipliers)
   and shows the class: who is on the page, each student's skill map and growth score, flags, stuck groups,
   misconceptions this week, and the item report (most-missed question, ready to project without names). */
(function () {
  'use strict';
  var SFA = window.SFA, C = window.CLIMB, E = C.engine, esc = SFA.esc, el = SFA.el, CFG = window.SFA_CONFIG || {}, body = document.getElementById('body');
  var KEY = 'sfa.classkey', data = null, off = 0, cls = SFA.store.get('teacher.climb.cls', ''), sortBy = 'frontier', timer = null, busy = false;
  var Key = {
    get: function () { try { var s = sessionStorage.getItem(KEY); if (s) return s; var r = JSON.parse(localStorage.getItem(KEY) || 'null'); if (r && r.until > Date.now()) return r.k; } catch (e) { } return ''; },
    set: function (k, remember) { try { sessionStorage.setItem(KEY, k); if (remember) { var d = new Date(); d.setHours(23, 59, 59, 0); localStorage.setItem(KEY, JSON.stringify({ k: k, until: d.getTime() })); } } catch (e) { } },
    del: function () { try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) { } }
  };
  function api(op, b) {
    return fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ op: op, teacherKey: Key.get() }, b || {})) })
      .then(function (r) { return r.text(); }).then(function (t) { var j; try { j = JSON.parse(t); } catch (e) { throw new Error('The results script didn\'t answer properly.'); } if (!j.ok) throw new Error(j.error); return j; });
  }
  function nice(n) { n = String(n || ''); if (n.indexOf(',') < 0) return n; var p = n.split(','); return (p[1].trim().split(' ')[0] + ' ' + p[0].trim()).trim(); }
  function now() { return Date.now() + off; }
  function mmss(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function askKey(msg) {
    var inp = el('input', { type: 'password', 'class': 'ninp', style: 'max-width:26em;font-size:18px', autocomplete: 'off', 'aria-label': 'Teacher key' }), rem = el('input', { type: 'checkbox', id: 'rk' });
    var go = el('button', { type: 'button', 'class': 'btn primary', text: 'Open', onclick: function () { Key.set(inp.value.trim(), rem.checked); load(); } });
    inp.onkeydown = function (e) { if (e.key === 'Enter') go.click(); };
    body.innerHTML = '';
    body.appendChild(el('section', { 'class': 'card', style: 'max-width:680px' }, [el('h2', { text: 'Teacher key' }), el('p', { 'class': 'muted', style: 'margin:0', text: msg || 'Paste the teacher key from the results script (Script properties > TEACHER_KEY). Same key as Class Results.' }), el('div', { 'class': 'ctl' }, [inp, go]), el('label', { 'for': 'rk', style: 'display:flex;gap:8px;align-items:center' }, [rem, 'Remember on this computer until the end of today'])]));
    inp.focus();
  }
  function fail(e) {
    busy = false;
    if (/teacher key/.test(e.message)) { Key.del(); return askKey('That key didn\'t work. Check it and try again.'); }
    if (/unknown op/.test(e.message)) { body.innerHTML = '<section class="card"><h2>Update the results script first</h2><p class="muted" style="margin:0">Climb needs the new backend/Code.gs. Paste it into Apps Script, save, then Deploy > Manage deployments > Edit > Version: New version > Deploy. The URL stays the same.</p></section>'; return; }
    SFA.toast('Couldn\'t reach the results sheet: ' + e.message, 5000);
  }
  function load() {
    if (!CFG.endpoint) { body.textContent = 'Results saving isn\'t switched on for this copy of the arcade.'; return; }
    if (!Key.get()) return askKey();
    refresh(true);
  }
  function refresh(first) {
    if (busy) return; busy = true;
    var t0 = Date.now();
    api('climbClass', watching ? { watch: watching.sid } : {}).then(function (j) { busy = false; off = j.now + (Date.now() - t0) / 2 - Date.now(); data = j; draw(); drawWatch(); schedule(); }, function (e) { fail(e); schedule(); });
  }
  function schedule() {
    clearTimeout(timer);
    var s = data && data.session, hot = s && s.state !== 'ended';
    timer = setTimeout(function () { if (document.visibilityState === 'visible' && Key.get()) refresh(); else schedule(); }, watching ? 3000 : hot ? 5000 : 30000);
  }
  function control(action, extra) {
    var b = Object.assign({ action: action }, extra || {});
    return api('climbControl', b).then(function (j) { data.session = j.session; if (j.accom) data.accom = j.accom; draw(); refresh(); return j; }, fail);
  }

  // the lessons' titles (for the "Then: Lesson" menu)
  var LES = {};
  (function () { var left = 17, prev = window.SFA_LESSON; window.SFA_LESSON = function (L) { LES[String(L.id).slice(1)] = L; };
    for (var i = 1; i <= 17; i++) { var sc = document.createElement('script'); sc.src = (window.CLIMB_ROOT || '') + 'lessons/L' + i + '.js'; sc.onload = sc.onerror = function () { if (--left === 0) { window.SFA_LESSON = prev; if (data) draw(); } }; document.head.appendChild(sc); } })();
  function nextL(s) { return s && s.state !== 'ended' ? (s.next || 0) : s && s.state === 'ended' && s.next ? s.next : SFA.store.get('teacher.climb.next', 0); }

  /* ---------- derived data ---------- */
  function roster() { return data.roster.filter(function (r) { return !cls || r.cls === cls; }); }
  function rowOf(sid) { return data.rows.filter(function (r) { return r.sid === sid; })[0] || null; }
  function parseMap(m) { var o = {}; String(m || '').split(' ').forEach(function (t) { var p = t.split(':'); if (p.length === 2) o[p[0]] = { c: p[1].replace('!', ''), chk: p[1].indexOf('!') >= 0 }; }); return o; }
  function sessLog(id) { return data.log.filter(function (r) { return r[2] === id; }); }
  // live = the ping cache when it is from this session and recent
  function liveOf(sid) { var h = data.here[sid], s = data.session; if (!h || !s || h.sess !== s.id || now() - h.at > 45000) return null; return h; }
  function onPage(sid) { var h = data.here[sid], s = data.session; return !!(h && s && now() - h.at < 15000 && (s.state === 'open' ? h.ph === 'wait' : true)); }
  // pacing projection (teacher only; students never see a projected finish): core skills left ÷ skills secured per session lately
  function pace(r) {
    if (!r || !r.hist || r.hist.length < 2) return { text: '·', title: 'Needs 2 sessions' };
    var m = parseMap(r.map), left = C.CORE.filter(function (id) { var v = m[id]; return !v || (v.c !== 'S' && v.c !== 'R'); }).length;
    if (!left) return { text: 'Core done', title: 'Every core skill is secure: extension skills and review' };
    var recent = r.hist.slice(-5), rate = recent.reduce(function (a, h) { return a + (h.sec || 0); }, 0) / recent.length;
    if (!rate) return { text: left + ' left · stalled', title: 'No skills secured in the last ' + recent.length + ' sessions' };
    var n = Math.ceil(left / rate);
    return { text: left + ' left · ≈' + n + ' session' + (n === 1 ? '' : 's'), title: 'At ' + (Math.round(rate * 10) / 10) + ' skills secured per session over the last ' + recent.length + ' sessions' };
  }
  function growthFlag(r) {
    if (!r || !r.hist || r.hist.length < 3) return '';
    var h = r.hist, last3 = h.slice(-3);
    if (last3.every(function (x) { return !x.sec; })) return 'No new skill in 3 sessions';
    if (h.length >= 4) { var th = h.slice(-4).map(function (x) { return x.th; }); if (Math.max.apply(null, th) - Math.min.apply(null, th) < 2) return 'Growth score flat for 4 sessions'; }
    return '';
  }

  /* ---------- drawing ---------- */
  function draw() {
    var s = data.session, classes = [];
    data.roster.forEach(function (r) { if (r.cls && classes.indexOf(r.cls) < 0) classes.push(r.cls); });
    classes.sort();
    body.innerHTML = '';
    body.appendChild(sessionCard(s, classes));
    if (s && s.quiz) body.appendChild(quizCard(s));
    body.appendChild(classTable(s));
    var g = el('div', { 'class': 'grid2', style: 'margin-top:20px' });
    g.appendChild(groupsCard(s)); g.appendChild(tagsCard()); g.appendChild(itemReportCard(s)); g.appendChild(itemsCard());
    body.appendChild(g);
    body.appendChild(standardsCard());
    renderAsks();
    body.appendChild(el('p', { 'class': 'muted small', style: 'margin-top:20px', text: 'Updates every ' + (s && s.state !== 'ended' ? '5' : '30') + ' seconds. Last update ' + new Date().toLocaleTimeString() + '. Students never see each other\'s progress.' }));
  }
  function sessionCard(s, classes) {
    var c = el('section', { 'class': 'card', style: 'gap:16px' });
    var stLine = !s ? 'No session open' : s.state === 'open' ? 'Waiting room open' : s.state === 'running' ? (now() < s.start ? 'Starting…' : 'Running') : s.state === 'paused' ? 'Paused' : 'Ended';
    var head = el('div', { 'class': 'ctl', style: 'justify-content:space-between' });
    var left = el('div', { style: 'display:flex;flex-direction:column;gap:4px' });
    left.appendChild(el('span', { 'class': 'state', id: 'stLine', text: stLine }));
    var here = roster().filter(function (r) { return onPage(r.sid); }).length;
    left.appendChild(el('span', { 'class': 'muted', id: 'stSub', text: s ? (s.cls ? 'Class ' + s.cls : 'All classes') + ' · ' + here + ' of ' + roster().length + ' on the page' + (s.focus ? ' · Focus: ' + C.label(s.focus) + (s.focusAll ? ' (open for everyone)' : '') : '') : 'Open the waiting room before class, then press Start at the 2-minute mark.' }));
    head.appendChild(left);
    head.appendChild(el('span', { 'class': 'state', id: 'clock', style: 'font-variant-numeric:tabular-nums' }));
    c.appendChild(head);
    var row = el('div', { 'class': 'ctl' });
    var running = s && (s.state === 'open' || s.state === 'running' || s.state === 'paused');
    if (classes.length > 1) {
      var sel = el('select', { 'aria-label': 'Class' }); sel.appendChild(el('option', { value: '', text: 'All classes' }));
      classes.forEach(function (k) { var o = el('option', { value: k, text: 'Class ' + k }); if (k === cls) o.selected = true; sel.appendChild(o); });
      sel.onchange = function () { cls = sel.value; SFA.store.set('teacher.climb.cls', cls); draw(); };
      if (running) sel.disabled = true;
      row.appendChild(sel);
    }
    var foc = el('select', { 'aria-label': 'Focus skill' }); foc.appendChild(el('option', { value: '', text: 'No focus skill' }));
    // set the focus to the skill of the film you taught in the previous lesson (the plan's rule), so new content comes from you first
    C.SKILLS.forEach(function (k) { var o = el('option', { value: k.id, text: 'Focus: ' + C.label(k.id) + ' · ' + k.name + (C.FILM[k.id] ? ' · ' + C.FILM[k.id] : '') }); if (s && s.focus === k.id) o.selected = true; foc.appendChild(o); });
    foc.title = 'Pick the skill from the film you showed last lesson';
    var all = el('input', { type: 'checkbox', id: 'fall' }); all.checked = !!(s && s.focusAll);
    row.appendChild(foc); row.appendChild(el('label', { 'for': 'fall', style: 'display:flex;gap:6px;align-items:center;font-size:15px', title: 'Students who haven\'t reached the focus skill get its guided items (not scored) between their own' }, [all, 'Open it for everyone']));
    if (running) { foc.onchange = all.onchange = function () { control('focus', { focus: foc.value, focusAll: all.checked }); }; }
    // the lesson that follows: students who finish Climb wait on their summary and move into it when you go live
    var nxt = el('select', { 'aria-label': 'Lesson after Climb', title: 'Students move into this lesson by themselves when you go live on it' });
    nxt.appendChild(el('option', { value: '0', text: 'Then: no lesson' }));
    (window.SFA_PLAN || []).slice().sort(function (a, b) { return a.n - b.n; }).forEach(function (p) { var L = LES[p.l], o = el('option', { value: String(p.l), text: 'Then: Lesson ' + p.n + (L ? ' · ' + L.title : '') }); if (String(p.l) === String(nextL(s))) o.selected = true; nxt.appendChild(o); });
    nxt.onchange = function () { SFA.store.set('teacher.climb.next', +nxt.value); if (running) control('next', { next: +nxt.value }); else draw(); };
    row.appendChild(nxt);
    var B = function (t, cl, f) { var b = el('button', { type: 'button', 'class': 'btn ' + (cl || ''), text: t }); b.onclick = function () { b.disabled = true; f(); }; row.appendChild(b); };
    // the check-in: the same questions for everyone before Climb (C.QUIZ), one seed per session
    var qz = el('input', { type: 'checkbox', id: 'qz' }); qz.checked = s && s.state !== 'ended' ? !!s.quiz : !!SFA.store.get('teacher.climb.quiz', false);
    qz.onchange = function () { SFA.store.set('teacher.climb.quiz', qz.checked); };
    if (running) qz.disabled = true;
    row.appendChild(el('label', { 'for': 'qz', style: 'display:flex;gap:6px;align-items:center;font-size:15px', title: C.QUIZ.items.length + ' questions, one per lesson, the same numbers for everyone. Then each student goes straight into their Climb.' }, [qz, 'Start with the ' + Math.round(C.QUIZ.secs / 60) + '-min check-in (' + C.QUIZ.name.replace(/ check-in$/, '') + ')']));
    function quizSpec() { return qz.checked ? { tids: C.QUIZ.items.map(function (x) { return x.tid; }), seed: Math.floor(Math.random() * 4294967296), secs: C.QUIZ.secs, name: C.QUIZ.name } : null; }
    if (!s || s.state === 'ended') B('Open the waiting room', 'primary', function () { control('open', { cls: cls, focus: foc.value, focusAll: all.checked, next: +nxt.value, quiz: quizSpec() }); });
    if (s && s.state === 'open') B(s.quiz ? 'Start: check-in, then Climb' : 'Start: 12 minutes for everyone', 'primary', function () { control('start'); });
    if (s && s.state === 'running') B('Pause all', 'warm', function () { control('pause'); });
    if (s && s.state === 'paused') B('Resume', 'primary', function () { control('resume'); });
    if (running) B('End now', '', function () { if (window.confirm('End the session for everyone now?')) control('end'); else draw(); });
    // one press: end Climb for everyone, open the lesson's console and go live; students' pages follow by themselves
    var nl = nextL(s), film = nl && window.SFA_LESSON_NUM ? window.SFA_LESSON_NUM[nl] : nl;
    if (nl && running) B('End Climb → Lesson ' + film, 'primary', function () {
      if (!window.confirm('End Climb for everyone and start Lesson ' + film + ' live?\n\nStudents still answering stop now. Everyone\'s page moves into the lesson by itself.')) return draw();
      control('end').then(function () { location.href = (window.CLIMB_ROOT || '') + 'lesson.html?l=' + nl + '&teach&golive'; });
    });
    if (nl && s && s.state === 'ended') B('Start Lesson ' + film + ' live', 'primary', function () { location.href = (window.CLIMB_ROOT || '') + 'lesson.html?l=' + nl + '&teach&golive'; });
    if (s && s.state === 'ended') B('Clear', 'small', function () { control('clear'); });
    B('Refresh', 'small', function () { refresh(); });
    B('Download CSV', 'small', csv);
    c.appendChild(row);
    return c;
  }
  function tick() {
    var s = data && data.session, ck = document.getElementById('clock'); if (!ck || !s) { if (ck) ck.textContent = ''; return; }
    if (s.state === 'running' && now() < s.start) ck.textContent = 'Starts in ' + mmss(s.start - now());
    else if (s.state === 'running') ck.textContent = (s.quiz && now() < s.start + (s.pausedMs || 0) + s.quiz.secs * 1000 ? 'Check-in ' + mmss(s.start + (s.pausedMs || 0) + s.quiz.secs * 1000 - now()) + ' · ' : '') + mmss(s.start + (s.pausedMs || 0) + 720000 + qms(s) - now()) + ' left';
    else if (s.state === 'paused') ck.textContent = mmss(s.start + (s.pausedMs || 0) + 720000 + qms(s) - s.pausedAt) + ' left (paused)';
    else ck.textContent = '';
  }
  setInterval(tick, 500);
  function qms(s) { return s && s.quiz ? s.quiz.secs * 1000 : 0; }

  function classTable(s) {
    var wrap = el('div', { 'class': 'tw', style: 'margin-top:20px' }), t = el('table', { 'class': 'dash' });
    var cols = [['name', 'Student'], ['here', 'Now'], ['frontier', 'Working on'], ['theta', 'Growth score'], ['pace', 'Pace'], ['map', 'Skill map (F1 F2 1-21)'], ['today', 'Today'], ['leaves', 'Left page'], ['flags', 'Flags'], ['time', 'Time']];
    var hr = el('tr'); cols.forEach(function (c) { var th = el('th'); if (['name', 'frontier', 'theta', 'leaves'].indexOf(c[0]) >= 0) th.appendChild(el('button', { type: 'button', text: c[1] + (sortBy === c[0] ? ' ▾' : ''), onclick: function () { sortBy = c[0]; draw(); } })); else th.textContent = c[1]; hr.appendChild(th); });
    t.appendChild(hr);
    var rows = roster().map(function (r) {
      var row = rowOf(r.sid), L = liveOf(r.sid), m = parseMap(row && row.map), fr = row && row.frontier;
      var td = row && row.today && s && row.today.id === s.id ? row.today : null;
      return { r: r, row: row, L: L, m: m, fr: fr, td: td, frI: fr && C.SKILL[fr] ? C.SKILL[fr].i : 99, leaves: L ? L.lv : td ? td.leaves : 0 };
    });
    rows.sort(function (a, b) {
      if (sortBy === 'frontier') return a.frI - b.frI || (a.r.name < b.r.name ? -1 : 1);
      if (sortBy === 'theta') return ((b.row && b.row.theta) || 0) - ((a.row && a.row.theta) || 0);
      if (sortBy === 'leaves') return b.leaves - a.leaves;
      return a.r.name < b.r.name ? -1 : 1;
    });
    rows.forEach(function (x) {
      var tr = el('tr'), r = x.r, row = x.row, L = x.L;
      var nm = el('td', { 'class': 'nm' }); nm.appendChild(el('button', { type: 'button', 'class': 'eye', text: '👁', title: 'See ' + nice(r.name) + '\'s screen', 'aria-label': 'See ' + nice(r.name) + '\'s screen', onclick: function () { watch(r); } })); nm.appendChild(el('button', { type: 'button', text: nice(r.name), onclick: function () { detail(r); } })); if (!cls && r.cls) nm.appendChild(el('span', { 'class': 'muted small', text: ' · ' + r.cls })); tr.appendChild(nm);
      // now
      var nowTd = el('td'), here = onPage(r.sid), ph = L ? L.ph : '';
      var label = !here ? (L ? 'Away' : 'Not here') : ph === 'wait' ? 'Waiting' : ph === 'item' ? (L.scr && L.scr.v === 'quiz' ? 'Check-in' : 'Question') : ph === 'quizdone' ? 'Check-in done' : ph === 'explain' ? 'Explanation' : ph === 'guided' ? 'Guided try' : ph === 'done' ? 'Done' : ph === 'paused' ? 'Paused' : 'On page';
      nowTd.appendChild(el('span', { 'class': 'pill' + (here ? ' on' : ''), text: label }));
      if (x.td && x.td.late) nowTd.appendChild(el('span', { 'class': 'pill amber', style: 'margin-left:4px', text: 'late' }));
      tr.appendChild(nowTd);
      tr.appendChild(el('td', { text: (L && L.sk ? C.label(L.sk) : x.fr ? C.label(x.fr) : '·') + (s && s.focus && x.fr && C.SKILL[x.fr] && C.SKILL[s.focus] && C.SKILL[x.fr].i < C.SKILL[s.focus].i ? ' (behind focus)' : ''), title: x.fr && C.SKILL[x.fr] ? 'Frontier: ' + C.SKILL[x.fr].name : '' }));
      var th = row ? Math.round(row.theta) : null, th0 = row && row.hist && row.hist.length >= 2 ? Math.round(row.hist[1].th) : null;
      tr.appendChild(el('td', { text: th == null ? '·' : String(th) + (th0 != null ? ' (' + (th - th0 >= 0 ? '+' : '') + (th - th0) + ' since session 2)' : ''), title: 'LF growth score, 200-270' }));
      var pc = pace(row); tr.appendChild(el('td', { text: pc.text, title: pc.title }));
      var mapTd = el('td'), mini = el('div', { 'class': 'mini' });
      C.SKILLS.forEach(function (k) { var v = x.m[k.id] || { c: '-' }; var i = el('i', { 'class': 'k-' + v.c + (v.chk ? ' chk' : ''), title: C.label(k.id) + ' ' + k.name + ': ' + ({ R: 'retained', S: 'secure', L: 'learning', B: 'back to learning', K: 'stuck', O: 'open', '-': 'not open' }[v.c] || '') + (v.chk ? ' · needs check' : '') }); mini.appendChild(i); });
      mapTd.appendChild(mini); tr.appendChild(mapTd);
      var n = L ? L.n : x.td ? x.td.items : 0, ok = L ? L.ok : x.td ? x.td.right : 0, to = L ? L.to : x.td ? x.td.timeouts : 0, al = L ? L.al : x.td ? x.td.almost : 0;
      tr.appendChild(el('td', { text: n ? ok + '/' + n + ' right' + (to ? ' · ' + to + ' timed out' : '') + (al ? ' · +20s ×' + al : '') : '·' }));
      var lv = x.leaves, lt = el('td'); if (lv) lt.appendChild(el('span', { 'class': 'pill ' + (lv >= 3 ? 'red' : 'amber'), text: lv + (L && L.aw ? ' · ' + L.aw + ' s away' : ''), title: lv >= 3 ? 'Nothing counts toward Secure today' : '' })); else lt.textContent = n ? '0' : '·'; tr.appendChild(lt);
      // flags: needs check (with buttons), stuck, growth
      var ft = el('td'), fl = L && L.fl ? L.fl.split(',') : [];
      C.SKILLS.forEach(function (k) {
        if (!(x.m[k.id] && x.m[k.id].chk)) return;
        var w = el('span', { style: 'display:inline-flex;gap:4px;align-items:center;margin-right:8px' });
        w.appendChild(el('span', { 'class': 'pill red', text: 'Check ' + C.label(k.id), title: 'Solved fast, right after leaving the page, or after being idle. Ask for one item live; then mark it.' }));
        w.appendChild(el('button', { type: 'button', 'class': 'ck', text: '✓ counts', onclick: function () { check(r, k.id, true); } }));
        w.appendChild(el('button', { type: 'button', 'class': 'ck', text: '✗ back', onclick: function () { check(r, k.id, false); } }));
        ft.appendChild(w);
      });
      fl.forEach(function (f) { var m = f.match(/^stuck([^.]+)\.?(.*)$/); if (m) ft.appendChild(el('span', { 'class': 'pill amber', style: 'margin-right:4px', text: 'Stuck ' + C.label(m[1]) + (m[2] ? ' · ' + m[2] : ''), title: m[2] && C.TAGS[m[2]] ? C.TAGS[m[2]].name : '' })); });
      var gf = growthFlag(row); if (gf) ft.appendChild(el('span', { 'class': 'pill blue', text: gf }));
      if (row && row.ov && row.ov.at && (row.ov.cleared || []).concat(row.ov.back || []).length) ft.appendChild(el('span', { 'class': 'muted small', text: ' (checks recorded)' }));
      tr.appendChild(ft);
      var tm = el('td'), sel = el('select', { 'aria-label': 'Time for ' + nice(r.name), style: 'font-size:14px;padding:4px;border-radius:8px;border:1px solid var(--line2)' });
      [[1, '1×'], [1.5, '1.5×'], [2, '2×']].forEach(function (o) { var op = el('option', { value: o[0], text: o[1] }); if ((data.accom[r.sid] || 1) === o[0]) op.selected = true; sel.appendChild(op); });
      sel.onchange = function () { control('accom', { sid: r.sid, mult: +sel.value }); };
      tm.appendChild(sel); tr.appendChild(tm);
      t.appendChild(tr);
    });
    if (!rows.length) t.appendChild(el('tr', {}, [el('td', { colspan: '10', 'class': 'muted', text: 'No students on the roster for this class.' })]));
    wrap.appendChild(t);
    return wrap;
  }
  function check(r, skill, ok) {
    api('climbCheck', { sid: r.sid, skill: skill, ok: ok }).then(function () { SFA.toast(nice(r.name) + ': ' + C.label(skill) + (ok ? ' counts.' : ' goes back to learning.') + ' Applied next time they open Climb.'); refresh(); }, fail);
  }

  /* ---------- stuck groups, misconceptions, item report ---------- */
  function sids() { var o = {}; roster().forEach(function (r) { o[r.sid] = r; }); return o; }
  function groupsCard(s) {
    var c = el('section', { 'class': 'card' }); c.appendChild(el('h2', { text: 'Stuck groups' }));
    var by = {}, ids = sids();
    Object.keys(ids).forEach(function (sid) { var L = liveOf(sid); if (!L || !L.fl) return; L.fl.split(',').forEach(function (f) { var m = f.match(/^stuck([^.]+)\.(M\d+)$/); if (m) (by[m[2]] = by[m[2]] || []).push(nice(ids[sid].name) + ' (' + C.label(m[1]) + ')'); }); });
    if (s) sessLog(s.id).forEach(function (r) { if (r[6] === 'twin' && r[8] === 'no' && /^M/.test(r[9]) && ids[r[1]]) { var nm = nice(ids[r[1]].name) + ' (' + C.label(r[3]) + ')'; var a = by[r[9]] = by[r[9]] || []; if (a.indexOf(nm) < 0) a.push(nm); } });
    var keys = Object.keys(by).sort(function (a, b) { return by[b].length - by[a].length; });
    if (!keys.length) { c.appendChild(el('p', { 'class': 'muted', style: 'margin:0', text: 'No one is stuck right now. A student is stuck when they miss the twin after an explanation and a guided try.' })); return c; }
    var ul = el('ul', { 'class': 'list' });
    keys.forEach(function (k) { ul.appendChild(el('li', {}, [el('span', {}, [el('b', { text: k + ' ' + (C.TAGS[k] ? C.TAGS[k].name : '') }), el('br'), el('span', { 'class': 'muted small', text: by[k].join(', ') })]), el('span', { 'class': 'pill ' + (by[k].length >= 3 ? 'red' : 'amber'), text: by[k].length + (by[k].length >= 3 ? ': pull a group' : '') })])); });
    c.appendChild(ul); return c;
  }
  function tagsCard() {
    var c = el('section', { 'class': 'card' }); c.appendChild(el('h2', { text: 'Misconceptions this week' }));
    var ids = sids(), by = {}, n = Object.keys(ids).length;
    data.log.forEach(function (r) { if (r[8] === 'no' && /^M/.test(r[9]) && ids[r[1]]) { (by[r[9]] = by[r[9]] || {})[r[1]] = 1; } });
    var keys = Object.keys(by).sort(function (a, b) { return Object.keys(by[b]).length - Object.keys(by[a]).length; });
    if (!keys.length) { c.appendChild(el('p', { 'class': 'muted', style: 'margin:0', text: 'No tagged wrong answers in the last 8 days.' })); return c; }
    var ul = el('ul', { 'class': 'list' });
    keys.forEach(function (k) { var m = Object.keys(by[k]).length, whole = m > n / 3; ul.appendChild(el('li', {}, [el('span', { text: k + ' · ' + (C.TAGS[k] ? C.TAGS[k].name : '') }), el('span', { 'class': 'pill ' + (whole ? 'red' : ''), text: m + ' student' + (m === 1 ? '' : 's') + (whole ? ': whole-class reteach' : ': small group') })])); });
    c.appendChild(ul);
    if (keys[0]) c.appendChild(el('p', { 'class': 'muted small', style: 'margin:0', text: 'Misconception of the week: ' + keys[0] + ', ' + (C.TAGS[keys[0]] ? C.TAGS[keys[0]].say : '') }));
    return c;
  }
  function itemReportCard(s) {
    var c = el('section', { 'class': 'card' }); c.appendChild(el('h2', { text: 'Item report' }));
    var ids = sids(), sessIds = []; data.log.forEach(function (r) { if (sessIds.indexOf(r[2]) < 0) sessIds.push(r[2]); });
    var sid = s ? s.id : sessIds[sessIds.length - 1];
    var rows = data.log.filter(function (r) { return r[2] === sid && ids[r[1]] && (r[8] === 'yes' || r[8] === 'no') && r[6] !== 'probe' && r[6] !== 'preview' && r[6] !== 'quiz'; });
    if (!rows.length) { c.appendChild(el('p', { 'class': 'muted', style: 'margin:0', text: 'Ready after a session: the most-missed question, its most common wrong answer, and a Project button that shows it to the class with no names.' })); return c; }
    var by = {}; rows.forEach(function (r) { var o = by[r[4]] = by[r[4]] || { n: 0, miss: 0, wrong: {}, tag: {}, row: null }; o.n++; if (r[8] === 'no') { o.miss++; o.wrong[r[7]] = (o.wrong[r[7]] || 0) + 1; if (r[9]) o.tag[r[9]] = (o.tag[r[9]] || 0) + 1; if (!o.row) o.row = r; } });
    var worst = Object.keys(by).filter(function (k) { return by[k].miss; }).sort(function (a, b) { return by[b].miss - by[a].miss || by[b].miss / by[b].n - by[a].miss / by[a].n; })[0];
    if (!worst) { c.appendChild(el('p', { 'class': 'muted', style: 'margin:0', text: 'No misses in session ' + sid + '.' })); return c; }
    var o = by[worst], wa = Object.keys(o.wrong).sort(function (a, b) { return o.wrong[b] - o.wrong[a]; })[0], tg = Object.keys(o.tag).sort(function (a, b) { return o.tag[b] - o.tag[a]; })[0];
    // rebuild the exact question one student missed with that answer, from its template and seed
    var ex = rows.filter(function (r) { return r[4] === worst && r[8] === 'no' && r[7] === wa; })[0] || o.row, item = null;
    try { item = C.make(worst, ex[5]); } catch (e) { }
    c.appendChild(el('p', { style: 'margin:0', html: null, text: 'Most missed in ' + sid + ': ' + worst + ' (' + C.label(C.T[worst] ? C.T[worst].skill : '?') + '), missed ' + o.miss + ' of ' + o.n + ' times.' }));
    c.appendChild(el('p', { style: 'margin:0', text: 'Most common wrong answer: "' + wa + '" (' + o.wrong[wa] + ' student' + (o.wrong[wa] === 1 ? '' : 's') + ')' + (tg ? ', tag ' + tg + ': ' + (C.TAGS[tg] ? C.TAGS[tg].name : '') : '') + '.' }));
    if (item) {
      var box = el('div', { 'class': 'think' }); box.innerHTML = '<b>' + item.stem + '</b>' + (item.fig ? '<div class="figw">' + item.fig + '</div>' : '') + '<ol class="work" style="font-size:16px">' + item.work.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ol>';
      c.appendChild(box);
      c.appendChild(el('div', {}, [el('button', { type: 'button', 'class': 'btn primary', text: 'Project to the class (no names)', onclick: function () { project(item, wa); } })]));
    }
    return c;
  }
  function project(item, wa) {
    var p = el('div', { 'class': 'proj', role: 'dialog', 'aria-label': 'Projected question' });
    p.innerHTML = '<h1 class="stem">' + item.stem + '</h1>' + (item.fig ? '<div class="figw">' + item.fig + '</div>' : '') + '<p class="ask">A common answer was ' + esc(wa) + '. Is it right?</p><button type="button" class="btn">Close</button>';
    p.querySelector('button').onclick = function () { p.remove(); };
    document.body.appendChild(p);
  }
  function itemsCard() {
    var c = el('section', { 'class': 'card' }); c.appendChild(el('h2', { text: 'Questions this week' }));
    var ids = sids(), by = {};
    data.log.forEach(function (r) { if (!ids[r[1]] || (r[8] !== 'yes' && r[8] !== 'no') || r[6] === 'preview') return; var o = by[r[4]] = by[r[4]] || { n: 0, ok: 0 }; o.n++; if (r[8] === 'yes') o.ok++; });
    var keys = Object.keys(by).filter(function (k) { return by[k].n >= 3; });
    if (!keys.length) { c.appendChild(el('p', { 'class': 'muted', style: 'margin:0', text: 'Percent correct per question template appears once a template has 3 or more answers.' })); return c; }
    // expected range by level, roughly: Level 1 about 85%, Level 7 about 40%
    keys.sort(function (a, b) { return by[a].ok / by[a].n - by[b].ok / by[b].n; });
    var ul = el('ul', { 'class': 'list' });
    keys.slice(0, 14).forEach(function (k) {
      var o = by[k], p = Math.round(100 * o.ok / o.n), lvl = C.T[k] ? C.T[k].level : 0, exp = 92 - 8 * lvl, odd = Math.abs(p - exp) > 30;
      ul.appendChild(el('li', {}, [el('span', { text: k + ' · L' + lvl + ' · ' + C.label(C.T[k] ? C.T[k].skill : '?') }), el('span', { 'class': 'pill' + (odd ? ' amber' : ''), text: p + '% of ' + o.n + (odd ? (p < exp ? ': harder than its level' : ': easier than its level') : '') })]));
    });
    c.appendChild(ul); return c;
  }

  /* ---------- progress by NWEA MAP area and standard ---------- */
  // skills secure across the class (from each student's skill map) and this week's answers, grouped by the
  // MAP Growth instructional area and the Common Core standard each skill and question practises
  function standardsCard() {
    var c = el('section', { 'class': 'card', style: 'margin-top:20px;gap:14px' });
    c.appendChild(el('h2', { text: 'By MAP area and standard' }));
    c.appendChild(el('p', { 'class': 'muted small', style: 'margin:0', text: 'Secure = share of students with the skills for that standard secure or retained. Answers = this week\'s Climb answers on questions tagged with it. RIT = where NWEA\'s MAP-to-Khan Academy correlation lists these skills (Grade 8 averages 222 in fall, 229 in spring). Climb\'s growth score is not a RIT.' }));
    var ids = sids(), R = roster(), maps = {};
    R.forEach(function (r) { var row = rowOf(r.sid); maps[r.sid] = parseMap(row && row.map); });
    var std = {};   // code -> {area, rit, skills:{}, ans, ok}
    C.SKILLS.forEach(function (s) {
      var d = C.STD[s.id]; if (!d) return;
      d.codes.forEach(function (code) { var ci = C.codeInfo(code), o = std[code] = std[code] || { area: ci.area, rit: ci.rit || '·', skills: {}, ans: 0, ok: 0 }; o.skills[s.id] = 1; });
    });
    data.log.forEach(function (x) {
      if (!ids[x[1]] || (x[8] !== 'yes' && x[8] !== 'no')) return;
      C.stdOf(x[4]).forEach(function (code) { var ci = C.codeInfo(code), o = std[code] = std[code] || { area: ci.area, rit: ci.rit || '·', skills: {}, ans: 0, ok: 0 }; o.ans++; if (x[8] === 'yes') o.ok++; });
    });
    function secureShare(skills) {
      var n = 0, have = 0;
      R.forEach(function (r) { Object.keys(skills).forEach(function (id) { n++; var v = maps[r.sid][id]; if (v && (v.c === 'S' || v.c === 'R')) have++; }); });
      return n ? Math.round(100 * have / n) : 0;
    }
    var areas = {};
    Object.keys(std).forEach(function (code) { var o = std[code]; (areas[o.area] = areas[o.area] || []).push(code); });
    var t = el('table', { 'class': 'dash' });
    t.appendChild(el('tr', {}, ['MAP area', 'Standard', 'Climb skills', 'Secure', 'Answers this week', 'Right', 'NWEA RIT'].map(function (h) { return el('th', { text: h }); })));
    ['OA-F', 'OA-EE', 'NS-RP', 'NS-OP'].forEach(function (a) {
      if (!areas[a]) return;
      var allSk = {}; areas[a].forEach(function (code) { Object.keys(std[code].skills).forEach(function (k) { allSk[k] = 1; }); });
      var sh = secureShare(allSk), tot = areas[a].reduce(function (z, code) { return z + std[code].ans; }, 0), okk = areas[a].reduce(function (z, code) { return z + std[code].ok; }, 0);
      t.appendChild(el('tr', { style: 'background:#F3F5FA;font-weight:700' }, [el('td', { text: C.MAPAREA[a] }), el('td', { text: 'all' }), el('td', { text: Object.keys(allSk).length + ' skills' }), el('td', {}, [bar(sh)]), el('td', { text: String(tot) }), el('td', { text: tot ? Math.round(100 * okk / tot) + '%' : '·' }), el('td', { text: '' })]));
      areas[a].sort().forEach(function (code) {
        var o = std[code], share = secureShare(o.skills);
        t.appendChild(el('tr', {}, [el('td', { text: '' }), el('td', { text: code }), el('td', { text: Object.keys(o.skills).map(C.label).join(', '), style: 'white-space:normal;max-width:260px' }), el('td', {}, [bar(share)]), el('td', { text: String(o.ans) }), el('td', { text: o.ans ? Math.round(100 * o.ok / o.ans) + '%' : '·' }), el('td', { text: o.rit })]));
      });
    });
    var tw = el('div', { 'class': 'tw' }); tw.appendChild(t); c.appendChild(tw);
    c.appendChild(el('div', {}, [el('button', { type: 'button', 'class': 'btn small', text: 'Download by student and MAP area (CSV)', onclick: stdCsv })]));
    return c;
  }
  function bar(p) { return el('span', { style: 'display:inline-flex;align-items:center;gap:6px' }, [el('span', { style: 'display:inline-block;width:80px;height:8px;border-radius:4px;background:#DCE2EE;overflow:hidden' }, [el('i', { style: 'display:block;height:8px;width:' + p + '%;background:#1D4ED8' })]), el('span', { text: p + '%' })]); }
  // per student: skills secure in each MAP area, to set beside their MAP goal scores
  function stdCsv() {
    var q = function (v) { v = String(v == null ? '' : v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
    var AREAS = ['OA-F', 'OA-EE', 'NS-RP', 'NS-OP'], skillsIn = {};
    AREAS.forEach(function (a) { skillsIn[a] = C.SKILLS.filter(function (s) { return C.STD[s.id] && C.STD[s.id].area === a; }).map(function (s) { return s.id; }); });
    var lines = [['Student', 'Class', 'Growth score'].concat(AREAS.map(function (a) { return C.MAPAREA[a] + ' (secure of ' + skillsIn[a].length + ')'; })).map(q).join(',')];
    roster().forEach(function (r) {
      var row = rowOf(r.sid), m = parseMap(row && row.map);
      lines.push([nice(r.name), r.cls, row ? Math.round(row.theta) : ''].concat(AREAS.map(function (a) { return skillsIn[a].filter(function (id) { return m[id] && (m[id].c === 'S' || m[id].c === 'R'); }).length; })).map(q).join(','));
    });
    var a = el('a', { href: URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' })), download: 'climb-by-map-area.csv' }); document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------- one student ---------- */
  function detail(r) {
    api('climbStudent', { sid: r.sid }).then(function (j) {
      var st = j.state, p = el('div', { 'class': 'overlay' }), d = el('section', { 'class': 'dialog', style: 'max-width:900px;max-height:90vh;overflow:auto' });
      d.appendChild(el('h1', { text: nice(r.name) }));
      d.appendChild(el('a', { href: (window.CLIMB_ROOT || '') + 'day.html#sid=' + encodeURIComponent(r.sid), text: '📅 See their whole day: Climb, lessons and games' }));
      if (!st) d.appendChild(el('p', { 'class': 'muted', text: 'Hasn\'t done a Climb session yet.' }));
      else {
        st = E.norm(st);
        d.appendChild(el('p', { style: 'margin:0', text: 'Growth score ' + Math.round(st.theta) + ' after ' + st.sess + ' session' + (st.sess === 1 ? '' : 's') + ' and ' + st.nScored + ' scored questions.' }));
        var t = el('table', { 'class': 'dash' }); t.appendChild(el('tr', {}, ['Skill', 'Standards', 'State', 'Right', 'Last 4', 'Secured in session'].map(function (h) { return el('th', { text: h }); })));
        C.SKILLS.forEach(function (s) {
          var k = st.skills[s.id], code = E.code(st, s.id);
          t.appendChild(el('tr', {}, [el('td', { text: C.label(s.id) + ' ' + s.name }), el('td', { 'class': 'small', text: C.STD[s.id] ? C.STD[s.id].codes.join(', ') : '' }), el('td', { text: ({ R: 'Retained', S: 'Secure', L: 'Learning', B: 'Back to learning', K: 'Stuck', O: 'Open', '-': 'Not open' }[code]) + (k.testedOut ? ' (tested out)' : '') + (k.check ? ' · needs check' : '') }), el('td', { text: k.n ? k.ok + '/' + k.n : '·' }), el('td', { text: k.hist.slice(-4).map(function (a) { return a.to ? '⏱' : a.ok ? '✓' : '✗'; }).join(' ') || '·' }), el('td', { text: k.securedAt ? String(k.securedAt) : '·' })]));
        });
        d.appendChild(t);
        if (st.hist.length) d.appendChild(el('p', { 'class': 'muted small', style: 'margin:0', text: 'Sessions: ' + st.hist.map(function (h) { return '#' + h.s + ' ' + Math.round(h.th) + (h.sec ? ' +' + h.sec + ' secured' : '') + (h.leaves ? ' (left page ' + h.leaves + '×)' : ''); }).join(' · ') }));
        var mine = data.log.filter(function (x) { return x[1] === r.sid; }).slice(-30).reverse();
        if (mine.length) {
          var lt = el('table', { 'class': 'dash' }); lt.appendChild(el('tr', {}, ['When', 'Question', 'Mode', 'Answer', 'Result', 'Tag', 'Secs'].map(function (h) { return el('th', { text: h }); })));
          mine.forEach(function (x) { lt.appendChild(el('tr', {}, [el('td', { text: new Date(x[0]).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' }) }), el('td', { text: x[4] + ' (' + C.label(x[3]) + ')' }), el('td', { text: x[6] }), el('td', { text: x[7], style: 'white-space:normal;max-width:260px' }), el('td', { text: { yes: '✓', no: '✗', time: '⏱', void: 'left page' }[x[8]] || x[8] }), el('td', { text: x[9] }), el('td', { text: String(x[10]) })])); });
          d.appendChild(el('h2', { style: 'margin:8px 0 0;font-size:18px', text: 'Last answers (8 days)' })); d.appendChild(lt);
        }
      }
      d.appendChild(el('div', {}, [el('button', { type: 'button', 'class': 'btn', text: 'Close', onclick: function () { p.remove(); } })]));
      p.appendChild(d); p.onclick = function (e) { if (e.target === p) p.remove(); };
      document.body.appendChild(p);
    }, fail);
  }

  /* ---------- ✋ questions from students ---------- */
  // Students press "Ask Mr. Crowell" in Climb: their screen (the question rebuilt from template + seed, with what they'd
  // entered) arrives here with their name. Open ones form a queue, oldest first; every question today is numbered in the
  // order it was sent and stays in the list below with what happened to it. Done takes it off the queue.
  var asksBox = el('div', { id: 'asks' }); body.parentNode.insertBefore(asksBox, body);
  var askSig = '', seenAsk = null, openSnap = {};
  var QUICK = ['I\'m coming over', 'Re-read the question slowly', 'Try the first step, then check', 'Make your best try'];
  var WHERE = { item: 'on a question', explain: 'on the explanation', guided: 'on a guided try' };
  var STATUS = { waiting: 'Waiting', answered: 'Done', lowered: 'Hand lowered' };
  function asksToday() {
    var ids = {}; roster().forEach(function (r) { ids[r.sid] = r; });
    return (data.asks || []).filter(function (a) { return ids[a.sid]; }).sort(function (a, b) { return a.at - b.at; }).map(function (a, i) { a.n = i + 1; a.who = nice(ids[a.sid].name); return a; });
  }
  function hhmm(t) { return new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
  function partSnap(p, v) {
    var lab = p.label ? '<div class="pl">' + p.label + '</div>' : '', got;
    if (p.kind === 'points' && v && v.length) {
      var g = p.grid, lines = (g.lines || []).slice();
      if (p.connect === 'line' && v.length >= 2 && v[0][0] !== v[1][0]) lines.push({ p: [v[0], v[1]] });
      if ((p.connect === 'poly' || p.connect === 'seg') && v.length >= 2) lines.push({ seg: v.slice().sort(function (a, b) { return p.connect === 'poly' ? a[0] - b[0] : 0; }) });
      if (p.extra) try { lines = lines.concat(p.extra(v) || []); } catch (e) { }
      var pts = (g.pts || []).concat(v.map(function (q, k) { return { x: q[0], y: q[1], l: (p.names ? p.names[k] + ' ' : '') + C.pt(q[0], q[1]) }; }));
      return '<div class="part">' + lab + '<div class="figw">' + C.graph(Object.assign({}, g, { lines: lines, pts: pts, label: 'The student\'s points' })) + '</div></div>';
    }
    if (p.kind === 'slider' && p.grid && v) {
      var add = {}; try { add = p.draw ? p.draw(v) : { lines: [{ m: v.m, b: v.b }] }; } catch (e) { }
      return '<div class="part">' + lab + '<p class="small" style="margin:0">' + esc(C.shown({ parts: [p] }, [v])) + '</p><div class="figw">' + C.graph(Object.assign({}, p.grid, { lines: (p.grid.lines || []).concat(add.lines || []), pts: (p.grid.pts || []).concat(add.pts || []), label: 'The student\'s line' })) + '</div></div>';
    }
    if ((p.kind === 'choice' || p.kind === 'multi') && p.opts) {
      var pick = p.kind === 'multi' ? (v || []) : [v];
      return '<div class="part">' + lab + '<div class="opts' + (p.opts.some(function (o) { return /<svg/.test(o.t); }) ? ' figs' : '') + '">' + p.opts.map(function (o, k) { var on = pick.indexOf(k) >= 0; return '<div class="opt' + (on ? ' sel' : '') + '" style="cursor:default">' + (on ? '<b class="pick">Their pick</b>' : '') + '<span>' + o.t + '</span>' + (o.ok ? '<b class="key">✓ right</b>' : '') + '</div>'; }).join('') + '</div></div>';
    }
    got = C.shown({ parts: [p] }, [v]);
    return '<div class="part">' + lab + '<p class="small" style="margin:0">Their answer so far: <b>' + esc(got) + '</b></p></div>';
  }
  function screenHtml(a) {
    var it = null; try { it = C.make(a.tid, a.seed); } catch (e) { }
    if (!it) return '<p class="muted">This question couldn\'t be rebuilt (' + esc(a.tid) + ').</p>';
    var h = '<div class="snap"><p class="stem2">' + it.stem + '</p>' + (it.fig ? '<div class="figw">' + it.fig + '</div>' : '');
    if (a.view === 'guided') h += '<p class="small" style="margin:0">' + esc(a.shown) + ' (a guided try on this question, new numbers each time).</p>';
    else h += it.parts.map(function (p, i) { return partSnap(p, (a.vals || [])[i]); }).join('');
    if (a.view === 'explain') h += '<p class="small" style="margin:0">They had already answered: <b>' + esc(a.shown) + '</b>, and were reading the explanation.</p>';
    return h + '<details><summary>Answer and working</summary><ol class="work" style="font-size:16px">' + it.work.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ol><p style="margin:0"><b>Answer:</b> ' + it.answer + '</p></details></div>';
  }
  function reply(a, msg, done, btn) {
    if (btn) btn.disabled = true;
    api('climbReply', { sid: a.sid, row: a.row, reply: msg || '', done: !!done }).then(function () {
      if (msg) a.reply = (a.reply ? a.reply + ' / ' : '') + msg;
      if (done) { a.status = 'answered'; a.closed = Date.now(); }
      askSig = ''; renderAsks(true);
      SFA.toast(done ? '#' + a.n + ' ' + a.who + ': done.' : 'Sent to ' + a.who + ': ' + msg);
    }, function (e) { if (btn) btn.disabled = false; fail(e); });
  }
  function renderAsks(force) {
    if (!data) return;
    var list = asksToday(), open = list.filter(function (a) { return a.status === 'waiting'; });
    // a chime and the tab title when a new question comes in
    var rows = open.map(function (a) { return a.row; });
    if (seenAsk && rows.some(function (r) { return seenAsk.indexOf(r) < 0; })) chime();
    seenAsk = (seenAsk || []).concat(rows.filter(function (r) { return (seenAsk || []).indexOf(r) < 0; }));
    document.title = (open.length ? '(' + open.length + ' ✋) ' : '') + document.title.replace(/^\(\d+ ✋\) /, '');
    var sig = cls + '|' + list.map(function (a) { return a.row + a.status + a.reply; }).join(',');
    if (!force && sig === askSig) return;
    var act = document.activeElement;
    if (!force && act && asksBox.contains(act) && act.tagName === 'INPUT' && act.value) return;   // don't wipe a reply being typed
    askSig = sig;
    asksBox.innerHTML = '';
    if (!list.length) return;
    var c = el('section', { 'class': 'card askcard' + (open.length ? ' hot' : ''), style: 'gap:14px;margin-bottom:20px' });
    c.appendChild(el('h2', { text: open.length ? '✋ ' + open.length + ' question' + (open.length === 1 ? '' : 's') + ' waiting (oldest first)' : '✋ Questions: none waiting' }));
    open.forEach(function (a) {
      var box = el('div', { 'class': 'askq' });
      box.innerHTML = '<div class="askh"><span class="askn">#' + a.n + '</span><b style="font-size:20px">' + esc(a.who) + '</b><span class="muted">' + esc(C.label(a.skill)) + ' · ' + WHERE[a.view] + ' · sent ' + hhmm(a.at) + ' · waiting <span data-wait="' + a.at + '">' + mmss(now() - a.at) + '</span></span></div>' +
        (a.note ? '<p class="asknote">“' + esc(a.note) + '”</p>' : '') + (a.reply ? '<p class="small muted" style="margin:0">You replied: ' + esc(a.reply) + '</p>' : '');
      var det = el('details', { 'class': 'askd' }); det.open = openSnap[a.row] !== false; det.ontoggle = function () { openSnap[a.row] = det.open; };
      det.innerHTML = '<summary>Their screen</summary>' + screenHtml(a);
      box.appendChild(det);
      var row = el('div', { 'class': 'ctl', style: 'gap:8px' });
      QUICK.forEach(function (q) { var b = el('button', { type: 'button', 'class': 'ck', text: q }); b.onclick = function () { reply(a, q, false, b); }; row.appendChild(b); });
      var inp = el('input', { type: 'text', 'class': 'ninp', maxlength: '140', placeholder: 'Or type a short reply…', style: 'flex:1 1 220px;font-size:16px;min-height:40px;padding:6px 10px', 'aria-label': 'Reply to ' + a.who });
      var send = el('button', { type: 'button', 'class': 'btn small', text: 'Send' }); send.onclick = function () { if (inp.value.trim()) reply(a, inp.value.trim(), false, send); };
      inp.onkeydown = function (e) { if (e.key === 'Enter') send.click(); };
      var dn = el('button', { type: 'button', 'class': 'btn primary small', text: '✓ Done', title: 'Takes it off the queue and lowers their hand' }); dn.onclick = function () { reply(a, inp.value.trim(), true, dn); };
      row.appendChild(inp); row.appendChild(send); row.appendChild(dn);
      box.appendChild(row);
      c.appendChild(box);
    });
    // every question today, in the order it was sent
    var d = el('details', { 'class': 'askd' }); d.open = !!openSnap.log;
    d.ontoggle = function () { openSnap.log = d.open; };
    d.appendChild(el('summary', { text: 'All questions today, in order (' + list.length + ')' }));
    var tw = el('div', { 'class': 'tw', style: 'margin-top:10px' }), t = el('table', { 'class': 'dash' });
    t.appendChild(el('tr', {}, ['#', 'Sent', 'Student', 'Skill', 'Where', 'Note', 'Their answer then', 'Status', 'Your reply', 'Took', ''].map(function (h) { return el('th', { text: h }); })));
    list.forEach(function (a) {
      var sh = el('button', { type: 'button', 'class': 'ck', text: 'Screen' }); sh.onclick = function () { showSnap(a); };
      t.appendChild(el('tr', {}, [el('td', { text: '#' + a.n }), el('td', { text: hhmm(a.at) }), el('td', { text: a.who, style: 'font-weight:700' }), el('td', { text: C.label(a.skill) + ' · ' + a.tid }), el('td', { text: (WHERE[a.view] || '').replace(/^on (a |the )?/, '') }),
        el('td', { text: a.note, style: 'white-space:normal;max-width:220px' }), el('td', { text: a.view === 'guided' ? '' : a.shown, style: 'white-space:normal;max-width:220px' }),
        el('td', {}, [el('span', { 'class': 'pill ' + (a.status === 'waiting' ? 'amber' : a.status === 'answered' ? 'on' : ''), text: STATUS[a.status] || a.status })]), el('td', { text: a.reply, style: 'white-space:normal;max-width:200px' }),
        el('td', { text: a.closed ? mmss(a.closed - a.at) : '' }), el('td', {}, [sh])]));
    });
    tw.appendChild(t); d.appendChild(tw); c.appendChild(d);
    asksBox.appendChild(c);
  }
  function showSnap(a) {
    var p = el('div', { 'class': 'overlay', role: 'dialog', 'aria-label': 'Question #' + a.n });
    var d = el('section', { 'class': 'dialog', style: 'max-width:900px;max-height:90vh;overflow:auto' });
    d.innerHTML = '<h1 style="font-size:26px">#' + a.n + ' · ' + esc(a.who) + ' · ' + hhmm(a.at) + '</h1>' + (a.note ? '<p class="asknote">“' + esc(a.note) + '”</p>' : '') + screenHtml(a).replace('<details>', '<details open>');
    d.appendChild(el('div', {}, [el('button', { type: 'button', 'class': 'btn', text: 'Close', onclick: function () { p.remove(); } })]));
    p.appendChild(d); p.onclick = function (e) { if (e.target === p) p.remove(); };
    document.body.appendChild(p);
  }
  setInterval(function () { [].forEach.call(asksBox.querySelectorAll('[data-wait]'), function (x) { x.textContent = mmss(now() - +x.getAttribute('data-wait')); }); }, 1000);
  function chime() {
    try { var A = window.AudioContext || window.webkitAudioContext, ctx = new A(), o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5); o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.55); } catch (e) { }
  }

  /* ---------- the check-in's results: per question and per student ---------- */
  function quizCard(s) {
    var q = s.quiz, c = el('section', { 'class': 'card', style: 'gap:14px;margin-top:20px' }), ids = {};
    roster().forEach(function (r) { ids[r.sid] = r; });
    var rows = data.log.filter(function (r) { return r[2] === s.id && r[6] === 'quiz' && ids[r[1]]; });
    var got = {}; rows.forEach(function (r) { var i = q.tids.indexOf(r[4]); if (i >= 0) (got[r[1]] = got[r[1]] || {})[i] = r; });
    var lesson = function (tid) { var x = C.QUIZ.items.filter(function (y) { return y.tid === tid; })[0]; return x ? 'Lesson ' + x.lesson : C.label(C.T[tid] ? C.T[tid].skill : ''); };
    var took = Object.keys(got).length;
    c.appendChild(el('h2', { text: '📝 ' + (q.name || 'Check-in') + ': ' + took + ' of ' + roster().length + ' students so far' }));
    c.appendChild(el('p', { 'class': 'muted small', style: 'margin:0', text: 'The same questions and numbers for everyone. Students don\'t see right or wrong, and these answers don\'t move anyone on the ladder. ✓ right · ✗ wrong · – skipped · ⏱ time ran out on it · blank: not reached.' }));
    // per question
    var qt = el('table', { 'class': 'dash' });
    qt.appendChild(el('tr', {}, ['#', 'Lesson', 'Skill', '% right', 'Most common wrong answer', ''].map(function (h) { return el('th', { text: h }); })));
    q.tids.forEach(function (tid, i) {
      var a = Object.keys(got).map(function (sid) { return got[sid][i]; }).filter(function (r) { return r && r[8] !== 'time' && !/skip/.test(r[11]); });
      var ok = a.filter(function (r) { return r[8] === 'yes'; }).length, wrong = {};
      a.forEach(function (r) { if (r[8] === 'no') wrong[r[7]] = (wrong[r[7]] || 0) + 1; });
      var wa = Object.keys(wrong).sort(function (x, y) { return wrong[y] - wrong[x]; })[0], pct = a.length ? Math.round(100 * ok / a.length) : null;
      var item = null; try { item = C.make(tid, C.quizSeed(q, i)); } catch (e) { }
      var pb = el('button', { type: 'button', 'class': 'ck', text: 'Project', onclick: function () { if (item) project(item, wa || '…'); } });
      qt.appendChild(el('tr', {}, [el('td', { text: 'Q' + (i + 1) }), el('td', { text: lesson(tid) }), el('td', { text: C.T[tid] ? C.label(C.T[tid].skill) + ' · ' + C.SKILL[C.T[tid].skill].name : tid, style: 'white-space:normal' }),
        el('td', {}, [el('span', { 'class': 'pill ' + (pct == null ? '' : pct >= 80 ? 'on' : pct >= 50 ? 'amber' : 'red'), text: pct == null ? '·' : pct + '% of ' + a.length })]),
        el('td', { text: wa ? '"' + wa + '" (' + wrong[wa] + ')' : '', style: 'white-space:normal;max-width:280px' }), el('td', {}, item ? [pb] : [])]));
    });
    var w1 = el('div', { 'class': 'tw' }); w1.appendChild(qt); c.appendChild(w1);
    // per student
    var d = el('details'); d.appendChild(el('summary', { text: 'By student', style: 'cursor:pointer;font-weight:700;color:var(--blue)' }));
    var st = el('table', { 'class': 'dash' });
    st.appendChild(el('tr', {}, ['Student'].concat(q.tids.map(function (t, i) { return 'Q' + (i + 1); })).concat(['Score']).map(function (h) { return el('th', { text: h }); })));
    roster().slice().sort(function (a, b) { return a.name < b.name ? -1 : 1; }).forEach(function (r) {
      var g = got[r.sid] || {}, sc = 0;
      var cells = q.tids.map(function (t, i) { var x = g[i]; if (!x) return el('td', { text: '' }); if (x[8] === 'yes') sc++; var sym = /skip/.test(x[11]) ? '–' : x[8] === 'yes' ? '✓' : x[8] === 'time' ? '⏱' : '✗'; return el('td', { text: sym, title: x[7] + (/afterleave/.test(x[11]) ? ' (after leaving the page)' : ''), style: 'color:' + (x[8] === 'yes' ? 'var(--green)' : 'var(--red)') }); });
      st.appendChild(el('tr', {}, [el('td', { text: nice(r.name), style: 'font-weight:700' })].concat(cells).concat([el('td', { text: got[r.sid] ? sc + ' / ' + q.tids.length : '' })])));
    });
    var w2 = el('div', { 'class': 'tw', style: 'margin-top:10px' }); w2.appendChild(st); d.appendChild(w2); c.appendChild(d);
    return c;
  }

  /* ---------- 👁 a student's screen, live ---------- */
  // Their page sends what's on screen with each check-in (every 3 s while you watch): the question is rebuilt from its
  // template and seed, with what they've typed, picked or dragged so far.
  var watching = null, watchSig = '';
  var VIEWS = { wait: 'In the waiting room', quiz: 'On a check-in question', item: 'On a question', explain: 'Reading the explanation after a miss', guided: 'On a guided try', right: 'Just got one right', changed: 'Question swapped after leaving the page', done: 'Finished: on their summary', quizdone: 'Check-in done, starting Climb', paused: 'Paused', signin: 'Signing in', msg: 'On a message screen' };
  function watch(r) {
    watching = { sid: r.sid, name: nice(r.name), el: null }; watchSig = '';
    var p = el('div', { 'class': 'overlay', role: 'dialog', 'aria-label': nice(r.name) + '\'s screen' });
    var d = el('section', { 'class': 'dialog', style: 'max-width:960px;max-height:92vh;overflow:auto;gap:12px' });
    p.appendChild(d); document.body.appendChild(p); watching.el = d; watching.box = p;
    var close = function () { p.remove(); watching = null; schedule(); };
    p.onclick = function (e) { if (e.target === p) close(); };
    watching.close = close;
    drawWatch(); refresh();
  }
  function drawWatch() {
    if (!watching || !data) return;
    var L = data.here[watching.sid], sc = L && L.scr, age = L ? Math.round((now() - L.at) / 1000) : null;
    var sig = JSON.stringify(sc || null) + (age != null && age > 20 ? 'old' : '');
    var meta = watching.el.querySelector('[data-age]');
    if (meta && sig === watchSig) { meta.textContent = age == null ? '' : 'Updated ' + age + ' s ago'; return; }
    watchSig = sig;
    var d = watching.el; d.innerHTML = '';
    var head = el('div', { style: 'display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px' });
    head.appendChild(el('h1', { style: 'font-size:26px', text: '👁 ' + watching.name }));
    head.appendChild(el('span', { 'class': 'muted small', 'data-age': '1', text: age == null ? '' : 'Updated ' + age + ' s ago' }));
    d.appendChild(head);
    var line = !L ? 'Not on Climb today.' : age > 45 ? 'Not on the page right now (last seen ' + Math.round(age / 60) + ' min ago).' : (VIEWS[sc && sc.v] || VIEWS[L.ph] || 'On the page');
    var bits = [line];
    if (sc && sc.tid && C.T[sc.tid]) bits.push(C.label(C.T[sc.tid].skill) + ' · ' + C.SKILL[C.T[sc.tid].skill].name);
    if (sc && sc.left != null && (sc.v === 'item' || sc.v === 'quiz')) bits.push(mmss(sc.left * 1000) + ' left on their clock');
    if (L && L.lv) bits.push('left the page ' + L.lv + '×');
    d.appendChild(el('p', { style: 'margin:0;font-size:18px', text: bits.join(' · ') }));
    if (sc && sc.tid) {
      var v = []; try { v = JSON.parse(sc.vals || '[]'); } catch (e) { }
      var box = el('div'); box.innerHTML = screenHtml({ tid: sc.tid, seed: sc.seed, view: sc.v === 'quiz' ? 'item' : sc.v, vals: v, shown: sc.shown });
      d.appendChild(box);
    }
    d.appendChild(el('p', { 'class': 'muted small', style: 'margin:0', text: 'Rebuilt from what their page sends every 3 seconds while this is open. Answer choices may be in a different order on their screen.' }));
    d.appendChild(el('div', {}, [el('button', { type: 'button', 'class': 'btn', text: 'Close', onclick: watching.close })]));
  }
  setInterval(function () { if (watching && data) drawWatch(); }, 1000);

  function csv() {
    var q = function (v) { v = String(v == null ? '' : v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
    var head = ['Student', 'Class', 'Growth score', 'Sessions', 'Secure', 'Retained', 'Frontier'].concat(C.SKILLS.map(function (s) { return C.label(s.id); }));
    var lines = [head.map(q).join(',')];
    roster().forEach(function (r) { var row = rowOf(r.sid), m = parseMap(row && row.map); lines.push([nice(r.name), r.cls, row ? Math.round(row.theta) : '', row ? row.sess : '', row ? row.secure : '', row ? row.retained : '', row && row.frontier ? C.label(row.frontier) : ''].concat(C.SKILLS.map(function (s) { var v = m[s.id]; return v ? ({ R: 'retained', S: 'secure', L: 'learning', B: 'back to learning', K: 'stuck', O: 'open', '-': '' }[v.c] || '') + (v.chk ? ' (check)' : '') : ''; })).map(q).join(',')); });
    var a = el('a', { href: URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' })), download: 'climb-skill-maps.csv' }); document.body.appendChild(a); a.click(); a.remove();
  }
  load();
})();
