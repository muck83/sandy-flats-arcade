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
    api('climbClass').then(function (j) { busy = false; off = j.now + (Date.now() - t0) / 2 - Date.now(); data = j; draw(); schedule(); }, function (e) { fail(e); schedule(); });
  }
  function schedule() {
    clearTimeout(timer);
    var s = data && data.session, hot = s && s.state !== 'ended';
    timer = setTimeout(function () { if (document.visibilityState === 'visible' && Key.get()) refresh(); else schedule(); }, hot ? 5000 : 30000);
  }
  function control(action, extra) {
    var b = Object.assign({ action: action }, extra || {});
    return api('climbControl', b).then(function (j) { data.session = j.session; if (j.accom) data.accom = j.accom; draw(); refresh(); return j; }, fail);
  }

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
    body.appendChild(classTable(s));
    var g = el('div', { 'class': 'grid2', style: 'margin-top:20px' });
    g.appendChild(groupsCard(s)); g.appendChild(tagsCard()); g.appendChild(itemReportCard(s)); g.appendChild(itemsCard());
    body.appendChild(g);
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
    var B = function (t, cl, f) { var b = el('button', { type: 'button', 'class': 'btn ' + (cl || ''), text: t }); b.onclick = function () { b.disabled = true; f(); }; row.appendChild(b); };
    if (!s || s.state === 'ended') B('Open the waiting room', 'primary', function () { control('open', { cls: cls, focus: foc.value, focusAll: all.checked }); });
    if (s && s.state === 'open') B('Start: 12 minutes for everyone', 'primary', function () { control('start'); });
    if (s && s.state === 'running') B('Pause all', 'warm', function () { control('pause'); });
    if (s && s.state === 'paused') B('Resume', 'primary', function () { control('resume'); });
    if (running) B('End now', '', function () { if (window.confirm('End the session for everyone now?')) control('end'); else draw(); });
    if (s && s.state === 'ended') B('Clear', 'small', function () { control('clear'); });
    B('Refresh', 'small', function () { refresh(); });
    B('Download CSV', 'small', csv);
    c.appendChild(row);
    return c;
  }
  function tick() {
    var s = data && data.session, ck = document.getElementById('clock'); if (!ck || !s) { if (ck) ck.textContent = ''; return; }
    if (s.state === 'running' && now() < s.start) ck.textContent = 'Starts in ' + mmss(s.start - now());
    else if (s.state === 'running') ck.textContent = mmss(s.start + (s.pausedMs || 0) + 720000 - now()) + ' left';
    else if (s.state === 'paused') ck.textContent = mmss(s.start + (s.pausedMs || 0) + 720000 - s.pausedAt) + ' left (paused)';
    else ck.textContent = '';
  }
  setInterval(tick, 500);

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
      var nm = el('td', { 'class': 'nm' }); nm.appendChild(el('button', { type: 'button', text: nice(r.name), onclick: function () { detail(r); } })); if (!cls && r.cls) nm.appendChild(el('span', { 'class': 'muted small', text: ' · ' + r.cls })); tr.appendChild(nm);
      // now
      var nowTd = el('td'), here = onPage(r.sid), ph = L ? L.ph : '';
      var label = !here ? (L ? 'Away' : 'Not here') : ph === 'wait' ? 'Waiting' : ph === 'item' ? 'Question' : ph === 'explain' ? 'Explanation' : ph === 'guided' ? 'Guided try' : ph === 'done' ? 'Done' : ph === 'paused' ? 'Paused' : 'On page';
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
    var rows = data.log.filter(function (r) { return r[2] === sid && ids[r[1]] && (r[8] === 'yes' || r[8] === 'no') && r[6] !== 'probe' && r[6] !== 'preview'; });
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

  /* ---------- one student ---------- */
  function detail(r) {
    api('climbStudent', { sid: r.sid }).then(function (j) {
      var st = j.state, p = el('div', { 'class': 'overlay' }), d = el('section', { 'class': 'dialog', style: 'max-width:900px;max-height:90vh;overflow:auto' });
      d.appendChild(el('h1', { text: nice(r.name) }));
      if (!st) d.appendChild(el('p', { 'class': 'muted', text: 'Hasn\'t done a Climb session yet.' }));
      else {
        st = E.norm(st);
        d.appendChild(el('p', { style: 'margin:0', text: 'Growth score ' + Math.round(st.theta) + ' after ' + st.sess + ' session' + (st.sess === 1 ? '' : 's') + ' and ' + st.nScored + ' scored questions.' }));
        var t = el('table', { 'class': 'dash' }); t.appendChild(el('tr', {}, ['Skill', 'State', 'Right', 'Last 4', 'Secured in session'].map(function (h) { return el('th', { text: h }); })));
        C.SKILLS.forEach(function (s) {
          var k = st.skills[s.id], code = E.code(st, s.id);
          t.appendChild(el('tr', {}, [el('td', { text: C.label(s.id) + ' ' + s.name }), el('td', { text: ({ R: 'Retained', S: 'Secure', L: 'Learning', B: 'Back to learning', K: 'Stuck', O: 'Open', '-': 'Not open' }[code]) + (k.testedOut ? ' (tested out)' : '') + (k.check ? ' · needs check' : '') }), el('td', { text: k.n ? k.ok + '/' + k.n : '·' }), el('td', { text: k.hist.slice(-4).map(function (a) { return a.to ? '⏱' : a.ok ? '✓' : '✗'; }).join(' ') || '·' }), el('td', { text: k.securedAt ? String(k.securedAt) : '·' })]));
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

  function csv() {
    var q = function (v) { v = String(v == null ? '' : v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
    var head = ['Student', 'Class', 'Growth score', 'Sessions', 'Secure', 'Retained', 'Frontier'].concat(C.SKILLS.map(function (s) { return C.label(s.id); }));
    var lines = [head.map(q).join(',')];
    roster().forEach(function (r) { var row = rowOf(r.sid), m = parseMap(row && row.map); lines.push([nice(r.name), r.cls, row ? Math.round(row.theta) : '', row ? row.sess : '', row ? row.secure : '', row ? row.retained : '', row && row.frontier ? C.label(row.frontier) : ''].concat(C.SKILLS.map(function (s) { var v = m[s.id]; return v ? ({ R: 'retained', S: 'secure', L: 'learning', B: 'back to learning', K: 'stuck', O: 'open', '-': '' }[v.c] || '') + (v.chk ? ' (check)' : '') : ''; })).map(q).join(',')); });
    var a = el('a', { href: URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' })), download: 'climb-skill-maps.csv' }); document.body.appendChild(a); a.click(); a.remove();
  }
  load();
})();
