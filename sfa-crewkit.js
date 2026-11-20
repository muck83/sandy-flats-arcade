/* 🧰 The shared kit for the two "everyone is needed" games: 🎈 All Aboard (sfa-aloft.js) and 💦 Splash Squad
   (sfa-splash.js). Loaded by sfa-lesson.js just before either of them.

   What is in here:
   - the question pool: this lesson's number and multiple-choice questions in three tiers. Tier 0 (the way in) is the
     questions the class has already met on the slides; tier 1 is each slide's first "go further" variant; tier 2 is the
     stretch and challenge variants. A student who has been quiet or unsure today starts on tier 0; two right first time
     moves a student up a tier, and a question that had to be shown moves them down.
   - the question card: a wrong answer is never the end. First miss: a hint and another try (a wrong choice is crossed
     out). Second miss: the worked answer, then a fresh, easier question. After two shown answers in a row the next one
     is a "sure" question: multiple choice where wrong choices keep crossing out until it is right.
   - small tools both games use: the crew list sent a page at a time in the spotlight text (names and avatars for every
     screen without going over its 600 characters), bit lists for the live counts, who is here, and fair strengths. */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API, SFA = window.SFA;
  var H = A.H, el = A.el, esc = SFA.esc;

  function rng(seed) { var s = (seed >>> 0) || 1; return function () { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return ((s >>> 8) & 0xffff) / 65536; }; }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function hash(t) { var h = 5381; t = String(t); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h; }
  function sh3(sid) { return (hash(sid) % 46656).toString(36); }
  // a student's fingerprint as a number that fits the live counts (1..9973); the console picks a salt with no clashes
  function fpn(sid, salt) { return hash(String(sid) + '#' + (salt || 0)) % 9973 + 1; }
  function sNow() { return Date.now() + (A.srvSkew() || 0); }
  function clean(n) { return String(n || '').replace(/[~,#|;:]/g, '').slice(0, 10); }
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  // crew lists carry classic 12-character looks; A.fullLook adds each student's extras (hair, outfit…) back when the console sent them
  function full(look) { return A.fullLook ? A.fullLook(look || '') : look || ''; }
  function av(look, size, walk) { return window.SFA_AVATAR ? SFA_AVATAR.svg(full(look), { size: size, walk: !!walk }) : '<span style="font-size:' + Math.round(size * 0.7) + 'px">🙂</span>'; }
  function ncls(look) { return window.SFA_AVATAR ? SFA_AVATAR.nameCls(full(look)) : ''; }

  /* ---------------- the questions ---------------- */
  var POOL = null;
  function pool() {
    if (POOL) return POOL;
    var L = A.LES() || {}, got = [];
    function add(k, s, tier) {
      got.push({ k: k, q: s.q, opts: s.opts, ans: s.ans, tol: s.tol, fig: s.fig, why: s.why || '', hint: s.hint || s.help || '', tier: tier,
        steps: Array.isArray(s.steps) && typeof s.steps[0] === 'string' ? s.steps : null });
    }
    (L.slides || []).forEach(function (s) {
      if (s.k === 'number' && typeof s.ans === 'number') add('number', s, 0);
      if (s.k === 'poll' && typeof s.ans === 'number' && !s.warm && s.opts && s.opts.length <= 6) add('poll', s, 0);
      (A.gameForms ? A.gameForms(s) : []).forEach(function (g) { add(g.k, g, 0); });   // cross it out, estimate, spot the mistake, always/sometimes/never
      (s.more || []).forEach(function (m, i) {
        if (m.k === 'number' && typeof m.ans === 'number') add('number', m, i === 0 ? 1 : 2);
        else if (m.k === 'poll' && typeof m.ans === 'number' && m.opts && m.opts.length <= 6) add('poll', m, i === 0 ? 1 : 2);
      });
    });
    got = got.slice(0, 98); got.forEach(function (q, i) { q.ci = i; });
    return (POOL = got);
  }
  // quiet or unsure in today's lesson: start on the way-in questions
  function startTier() {
    var m = A.mine() || {}, n = 0, r = 0;
    Object.keys(m).forEach(function (q) { var a = m[q]; if (/^z|^here$/.test(q) || !a || !a.answer) return; n++; if (a.correct === true || a.correct === 'yes') r++; });
    return n >= 3 && r / n >= 0.5 ? 1 : 0;
  }
  function numOf(v) {
    v = String(v == null ? '' : v).trim().replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/^\+/, '').replace(/(\d),(\d{3})(?!\d)/g, '$1$2').replace(',', '.');
    var m = /^(-?\d*\.?\d+)(?:\/(-?\d*\.?\d+))?$/.exec(v); if (!m) return NaN;
    var b = m[2] != null ? +m[2] : 1; return b ? +m[1] / b : NaN;
  }
  function plain(t) { return String(t || '').replace(/[*_]/g, '').replace(/<[^>]+>/g, ''); }
  function ansTxt(Q) { return Q.k === 'poll' ? A.letter(Q.ans) + ': ' + plain(Q.opts[Q.ans]) : A.numTxt(Q.ans); }

  /* The question card. o: { st: function → the game's saved state (the card keeps its own part in st().qz), keep: save it,
     seed: a number (this student, this game), redraw: draw the game's question box again,
     right(first, Q) → the feedback html (the game does its own scoring there), tried(Q, kind) kind 1 a miss with a retry,
     2 the answer had to be shown }. */
  function Quiz(o) {
    var P = pool(), ords = {};
    function Z() {
      var ST = o.st(); if (!ST.qz) ST.qz = { tier: startTier(), cur: -1, tries: 0, elim: [], fb: null, streak: 0, rev: 0, used: [], sure: 0, xh: 0, n: 0, cool: 0 };
      return ST.qz;
    }
    function order(t) { if (!ords[t]) ords[t] = shuffle(P.filter(function (q) { return q.tier === t; }).map(function (q) { return q.ci; }), rng(o.seed + t * 7919)); return ords[t]; }
    function pick(z) {
      var free = function (ci) { return z.used.indexOf(ci) < 0; }, i, c;
      if (z.sure) {   // a sure question: multiple choice, the way-in ones first
        for (i = 0; i <= 2; i++) { c = order(i).filter(function (ci) { return P[ci].k === 'poll' && free(ci); }); if (c.length) return c[0]; }
        for (i = 0; i <= 2; i++) { c = order(i).filter(function (ci) { return P[ci].k === 'poll'; }); if (c.length) return c[z.n % c.length]; }
      }
      var tiers = [z.tier, z.tier - 1, z.tier + 1, z.tier - 2, z.tier + 2].filter(function (t) { return t >= 0 && t <= 2; });
      for (i = 0; i < tiers.length; i++) { c = order(tiers[i]).filter(free); if (c.length) return c[0]; }
      return -1;
    }
    function next() {
      var z = Z(); if (!P.length) return;
      var ci = pick(z); if (ci < 0) { z.used = []; ci = pick(z); }
      z.cur = ci; z.tries = 0; z.elim = []; z.fb = null; z.xh = 0; z.cool = 0; if (ci >= 0) z.used.push(ci); if (z.used.length > 90) z.used = z.used.slice(-30);
      o.keep();
    }
    function q() { var z = Z(); if (z.cur < 0 || !P[z.cur]) next(); return P[Z().cur] || null; }
    // a teammate's hint: one wrong choice crossed out, or the range the number is in and the first step
    function extra() {
      var z = Z(), Q = q(); if (!Q || z.xh || (z.fb && z.fb.end)) return false;
      z.xh = 1;
      if (Q.k === 'poll') { for (var k = 0; k < Q.opts.length; k++) if (k !== Q.ans && z.elim.indexOf(k) < 0) { z.elim.push(k); break; } }
      o.keep(); return true;
    }
    function extraHtml(Q) {
      if (Q.k === 'poll') return '💡 <b>A teammate\'s hint:</b> one wrong choice is crossed out for you.' + (Q.hint ? ' ' + A.fmt(Q.hint) : '');
      var whole = Math.abs(Q.ans - Math.round(Q.ans)) < 1e-9, lo = Math.floor(Q.ans) - (1 + Q.ci % 3), hi = lo + 5;
      return '💡 <b>A teammate\'s hint:</b> the answer is ' + (whole ? 'a whole number ' : '') + 'between ' + A.numTxt(lo) + ' and ' + A.numTxt(hi) + '.' + (Q.steps ? ' First step: ' + A.fmt(Q.steps[0]) : Q.hint && !Z().tries ? ' ' + A.fmt(Q.hint) : '');
    }
    function newRound() { var z = Z(); z.rev = 0; z.sure = 0; o.keep(); }
    function shown(Q) {
      var w = Q.steps ? '<ol>' + Q.steps.map(function (s) { return '<li>' + A.fmt(s) + '</li>'; }).join('') + '</ol>' : Q.why ? ' ' + A.fmt(Q.why) : '';
      return '<b>The answer is ' + esc(ansTxt(Q)) + '.</b>' + w;
    }
    /* d: { kick: the small line over the question, go: the answer button's words, after(box): what goes under a right
       answer (a Next button, or the game's waiting panel) } */
    function draw(box, d) {
      box.innerHTML = '';
      var z = Z(), Q = q();
      if (!Q) { box.appendChild(H('p', 'crwq', 'This lesson has no number or multiple-choice questions for a game.')); return; }
      box.appendChild(H('p', 'crwkick', (d.kick || '') + (z.sure ? ' · 🎯 a sure one: keep going until it\'s right' : '')));
      box.appendChild(H('p', 'crwq', A.fmt(Q.q)));
      if (Q.fig) { var f = H('div', 'crwfig'); try { f.appendChild(A.figure(Q.fig)); box.appendChild(f); } catch (e) { } }
      if (z.fb && z.fb.end) {
        box.appendChild(H('div', 'crwfb ' + (z.fb.ok ? 'good' : 'show'), z.fb.html));
        if (z.fb.ok) { if (d.after) d.after(box); return; }
        var wait = Math.max(0, z.cool - Date.now()), nx = el('button', { type: 'button', 'class': 'btn primary', text: wait ? 'Read it first… ' + Math.ceil(wait / 1000) : 'Got it: a new question ▶' });
        if (wait) { nx.disabled = true; setTimeout(function () { if (box.isConnected) o.redraw(); }, Math.min(1000, wait + 30)); }
        nx.onclick = function () { next(); o.redraw(); };
        box.appendChild(nx); return;
      }
      if (z.fb) box.appendChild(H('div', 'crwfb try', z.fb.html));
      if (z.xh) box.appendChild(H('div', 'crwfb mate', extraHtml(Q)));
      function right() {
        var first = z.tries === 0 && !z.sure && !z.elim.length;
        z.n++; z.streak = first ? z.streak + 1 : 0; z.rev = 0; z.sure = 0;
        if (z.streak >= 2 && z.tier < 2) { z.tier++; z.streak = 0; }
        z.fb = { ok: true, end: true, html: o.right(first, Q) || '<b>✓ Right!</b>' };
        o.keep(); o.redraw();
      }
      function miss(k) {
        z.n++;
        if (z.sure) {   // a sure question never runs out of tries
          if (Q.k === 'poll') { z.elim.push(k); z.fb = { html: '<b>Not that one.</b> It\'s crossed out: try another.' }; }
          else z.fb = { html: shown(Q) + ' <i>Type it in to lock it in.</i>' };
          o.tried(Q, 1); o.keep(); o.redraw(); return;
        }
        if (z.tries === 0) {
          z.tries = 1; if (Q.k === 'poll') z.elim.push(k);
          z.fb = { html: '<b>Not yet: one more try.</b> ' + (Q.hint ? '💡 ' + A.fmt(Q.hint) : Q.k === 'poll' ? '💡 That choice is crossed out. Read the others again.' : '💡 Check the signs, then go through it one step at a time.') };
          o.tried(Q, 1); o.keep(); o.redraw(); return;
        }
        z.streak = 0; z.tier = Math.max(0, z.tier - 1); z.rev++; if (z.rev >= 2) z.sure = 1;
        z.cool = Date.now() + 3500;
        z.fb = { ok: false, end: true, html: shown(Q) + '<p class="crwsoft">No problem: read it, then the next one is yours.</p>' };
        o.tried(Q, 2); o.keep(); o.redraw();
      }
      if (Q.k === 'number') {
        var inp = el('input', { type: 'text', inputmode: 'text', placeholder: 'Type a number', 'aria-label': 'Answer', autocomplete: 'off' }), go = el('button', { type: 'button', 'class': 'btn primary', text: d.go || 'Answer' }), row = H('div', 'crwrow');
        row.appendChild(inp); row.appendChild(go); box.appendChild(row);
        var check = function () { var v = numOf(inp.value); if (!inp.value.trim() || isNaN(v)) { inp.focus(); return; } if (Math.abs(v - Q.ans) <= (Q.tol || 1e-9) + 1e-9) right(); else miss(-1); };
        go.onclick = check; inp.onkeydown = function (e) { if (e.key === 'Enter') check(); };
      } else {
        var list = H('div', 'opts'); box.appendChild(list);
        Q.opts.forEach(function (op, k) {
          var out = z.elim.indexOf(k) >= 0, bt = el('button', { type: 'button', 'class': 'opt' + (out ? ' crwout' : '') });
          bt.appendChild(H('span', 'L', A.letter(k))); bt.appendChild(H('span', 't', A.fmt(op))); bt.disabled = out;
          bt.onclick = function () { if (k === Q.ans) right(); else miss(k); };
          list.appendChild(bt);
        });
      }
    }
    return { draw: draw, next: next, q: q, extra: extra, newRound: newRound, state: Z };
  }

  /* ---------------- the crew list, a page at a time ---------------- */
  // console: list = [{ fp, n, look }] in the game's fixed order; page p of `per`
  function crewPage(list, p, per) {
    var pages = Math.max(1, Math.ceil(list.length / per)), s = (p % pages) * per;
    return 'P:' + s + '~' + list.length + '|' + list.slice(s, s + per).map(function (x) { return x.fp + '~' + clean(x.n) + '~' + String(x.look || '').replace(/[^0-9a-z]/g, '').slice(0, 12); }).join(',');
  }
  // every screen: keep what has arrived so far
  function Crew() {
    var C = { list: [], total: 0, key: '' };
    C.take = function (text) {
      var m = /(?:^|#)P:(\d+)~(\d+)\|([^#]*)/.exec(String(text || '')); if (!m) return false;
      var s = +m[1], ch = false; if (C.total !== +m[2]) { C.total = +m[2]; ch = true; }
      (m[3] ? m[3].split(',') : []).forEach(function (x, i) { var p = x.split('~'), o = C.list[s + i]; if (!o || o.fp !== p[0] || o.n !== p[1] || o.look !== (p[2] || '')) { C.list[s + i] = { fp: p[0], n: p[1] || '', look: p[2] || '' }; ch = true; } });
      if (ch) C.key = C.list.map(function (x) { return x ? x.fp + x.look + x.n : ''; }).join('.') + C.total;
      return ch;
    };
    C.get = function (i) { return C.list[i] || { fp: '', n: '', look: '' }; };
    return C;
  }
  // true/false lists in the live counts: 12 to a number
  function encBits(a) { var out = []; for (var i = 0; i < a.length; i += 12) { var v = 0; for (var j = 0; j < 12 && i + j < a.length; j++) if (a[i + j]) v |= 1 << j; out.push(v); } return out.slice(0, 12); }
  function bit(nums, i) { var v = nums && nums[Math.floor(i / 12)]; return !!(v && (v >> (i % 12)) & 1); }
  // small numbers (each under `base`) in the live counts: `per` to a number
  function encPack(a, base, per) { var out = []; for (var i = 0; i < a.length; i += per) { var v = 0; for (var j = per - 1; j >= 0; j--) v = v * base + (a[i + j] || 0); out.push(v); } return out; }
  function unpack(nums, i, base, per) { var v = nums && nums[Math.floor(i / per)]; if (!v) return 0; return Math.floor(v / Math.pow(base, i % per)) % base; }

  /* ---------------- the console's side ---------------- */
  function gameRow(a) { return /^z/.test(a.q) || a.q === 'here'; }
  function active() {
    var ids = {}; A.rosterIn().forEach(function (r) { ids[r.sid] = 1; });
    var here = {}; (A.consoleAnswers() || []).forEach(function (a) { if (ids[a.sid] && !A.beforeRun(a)) here[a.sid] = 1; });
    return Object.keys(here);
  }
  function nameOf(sid) { var r = A.rosterIn().filter(function (x) { return x.sid === sid; })[0]; return r ? clean(A.first(r.name).replace(/[^A-Za-zÀ-ÿ' -]/g, '')) : ''; }
  function looks() {
    var out = {}, t = {};
    (A.consoleAnswers() || []).forEach(function (a) { if (a.q !== 'zlookx1') return; var m = String(a.answer).match(/^lk1;([0-9a-z]{1,12})/); if (m && (!t[a.sid] || String(a.time) >= t[a.sid])) { t[a.sid] = String(a.time); out[a.sid] = m[1]; } });
    return out;
  }
  function lookOf(L, sid) { return L[sid] || (window.SFA_AVATAR ? SFA_AVATAR.defLook(sid) : ''); }
  // how much of today's lesson each student has done: answers, plus half for each right one (never shown to students)
  function strengths() {
    var out = {};
    (A.consoleAnswers() || []).forEach(function (a) { if (gameRow(a) || A.beforeRun(a) || !a.answer) return; out[a.sid] = (out[a.sid] || 0) + 1 + (a.correct === 'yes' ? 0.5 : 0); });
    return out;
  }
  // each student's latest row for a game: q is the game's row id, key 'id:<seconds>;'
  function rows(q, key) {
    var last = {}; (A.consoleAnswers() || []).forEach(function (a) { if (a.q === q && String(a.answer).indexOf(key) >= 0 && (!last[a.sid] || String(a.time) >= String(last[a.sid].time))) last[a.sid] = a; });
    return last;
  }
  function getN(s, k) { var m = String(s).match(new RegExp(';' + k + ':(-?\\d+)')); return m ? +m[1] : 0; }
  function fold(key, title, open) { if (A.fold) return A.fold(key, title, open); var d = el('details', { 'class': 'sect fold' }); d.appendChild(el('summary', {}, [H('h3', '', title)])); d.open = !!open; return d; }

  /* ---------------- on every screen ---------------- */
  // banners across the top, one after another
  function Banners(isOpen) {
    var q = [], cur = null;
    function next() {
      if (cur || !q.length || !isOpen()) return;
      var b = q.shift(); cur = H('div', 'crwban ' + (b.kind || ''), b.html); document.body.appendChild(cur);
      setTimeout(function () { if (cur) { cur.classList.add('out'); var c = cur; setTimeout(function () { c.remove(); }, 350); cur = null; } next(); }, b.ms || 2600);
    }
    return { say: function (html, kind, ms) { if (q.length > 4) q.shift(); q.push({ html: html, kind: kind, ms: ms }); next(); }, clear: function () { q = []; [].forEach.call(document.querySelectorAll('.crwban'), function (x) { x.remove(); }); cur = null; } };
  }

  (function css() {
    if (document.getElementById('sfaCrewCss')) return;
    var c = document.createElement('style'); c.id = 'sfaCrewCss';
    c.textContent = [
      'body.crwing{overflow:hidden}',
      '.crw{position:fixed;inset:0;z-index:90;overflow:auto;color:#F3EFE7;font-family:"Bricolage Grotesque",system-ui,sans-serif;display:flex;flex-direction:column}',
      '.crw *{box-sizing:border-box}',
      '.crwhud{position:relative;z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;padding:8px 14px;background:rgba(12,10,24,.72);backdrop-filter:blur(3px)}',
      '.crwhud h1{margin:0;font:400 clamp(20px,3vw,34px) "Luckiest Guy",system-ui;color:#FFE14D;letter-spacing:.02em}',
      '.crwhud .crwpill{padding:4px 12px;border-radius:99px;background:rgba(255,255,255,.12);font-weight:800;font-size:clamp(13px,1.6vw,20px);white-space:nowrap}',
      '.crwhud .crwpill:empty{display:none}',
      '.crwhud .crwpill b{color:#FFE14D}.crwhud .crwpill.hot{background:#FF7A3D;color:#231000}.crwhud .crwpill.hot b{color:#231000}',
      '.crwhud .crwsp{flex:1}',
      '.crwbody{position:relative;flex:1;display:flex;min-height:0}',
      '.crwscene{position:relative;flex:1;min-height:260px;overflow:hidden}',
      '.crwside{position:relative;z-index:4;width:min(46vw,520px);flex:none;overflow:auto;padding:12px 14px 20px;background:rgba(14,12,28,.86);display:flex;flex-direction:column;gap:10px}',
      '.crw.screen .crwside{display:none}',
      '.crwcard{background:rgba(255,255,255,.07);border:2px solid rgba(255,255,255,.14);border-radius:16px;padding:12px 14px}',
      '.crwkick{margin:0 0 4px;font-weight:800;font-size:13px;letter-spacing:.03em;color:#9FE8FF;text-transform:uppercase}',
      '.crwq{margin:0 0 10px;font-size:clamp(17px,2.2vw,22px);font-weight:600;line-height:1.3}.crwq b{color:#FFE14D}',
      '.crwfig{background:#fff;border-radius:12px;padding:6px;margin:0 0 10px;max-width:420px}.crwfig svg{max-width:100%;height:auto;display:block}',
      '.crwrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
      '.crwrow input{flex:1;min-width:120px;font:700 20px "IBM Plex Mono",monospace;padding:9px 12px;border-radius:12px;border:2px solid #6c6690;background:#14122a;color:#fff}',
      '.crwrow input:focus{outline:none;border-color:#FFE14D}',
      '.crwfb{margin:0 0 10px;padding:9px 12px;border-radius:12px;font-size:15px;line-height:1.35}',
      '.crwfb.good{background:rgba(92,224,184,.18);border:2px solid #5CE0B8}.crwfb.try{background:rgba(255,201,74,.15);border:2px solid #FFC94A}',
      '.crwfb.show{background:rgba(159,232,255,.12);border:2px solid #9FE8FF}.crwfb.mate{background:rgba(255,122,192,.14);border:2px solid #FF7AC0}',
      '.crwfb ol{margin:6px 0 0;padding-left:1.3em}.crwsoft{margin:6px 0 0;opacity:.8;font-style:italic}',
      '.crw .opt.crwout{opacity:.35;text-decoration:line-through}',
      '.crwban{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:96;padding:10px 22px;border-radius:999px;background:#1b2350;border:3px solid #FFE14D;color:#fff;font-size:clamp(15px,2.2vw,26px);font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.5);animation:crwbin .35s cubic-bezier(.2,1.6,.4,1) both;max-width:94vw;text-align:center;pointer-events:none}',
      '.crwban b{color:#FFE14D}.crwban.spark{background:#5a1f00;border-color:#FF9A3D}.crwban.good{background:#0d3b2c;border-color:#5CE0B8}.crwban.out{opacity:0;transition:opacity .3s}',
      '@keyframes crwbin{from{transform:translateX(-50%) scale(.6);opacity:0}to{transform:translateX(-50%) scale(1);opacity:1}}',
      '.crwend{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;padding:3vh 16px 0;pointer-events:none}',
      '.crwend h1{margin:0;font:400 clamp(34px,7vw,96px) "Luckiest Guy",system-ui;color:#FFE14D;text-shadow:0 5px 0 rgba(0,0,0,.45);animation:crwbin2 .6s cubic-bezier(.2,1.6,.4,1) both}',
      '.crwend p{margin:6px 0 0;font-size:clamp(16px,2.4vw,30px);font-weight:700;text-shadow:0 2px 6px rgba(0,0,0,.7);max-width:1000px}',
      '@keyframes crwbin2{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}',
      '.crwname{font-weight:800;font-size:.72em;line-height:1.1;white-space:nowrap;text-shadow:0 1px 3px rgba(0,0,0,.8)}',
      '.crwwatchx{position:fixed;top:8px;right:8px;z-index:98}',
      '@media (max-width:820px){.crwbody{flex-direction:column}.crwside{width:auto;flex:1 0 auto;order:2}.crwscene{flex:none;height:34vh;min-height:200px}.crw.screen .crwscene{flex:1;height:auto}}',
      '@media (prefers-reduced-motion:reduce){.crwban,.crwend h1{animation:none}}'
    ].join('\n');
    document.head.appendChild(c);
  })();

  window.SFA_CREW = { rng: rng, shuffle: shuffle, hash: hash, sh3: sh3, fpn: fpn, sNow: sNow, clean: clean, mmss: mmss, av: av, ncls: ncls, pool: pool, plain: plain, Quiz: Quiz,
    crewPage: crewPage, Crew: Crew, encBits: encBits, bit: bit, encPack: encPack, unpack: unpack,
    active: active, nameOf: nameOf, looks: looks, lookOf: lookOf, strengths: strengths, rows: rows, getN: getN, fold: fold, Banners: Banners };
})();
