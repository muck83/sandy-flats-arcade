/* Climb: the adaptive engine. Pure functions over one student's state (no DOM, no network).
   Rules from the plan: Secure = 3 of the last 4 scored attempts on the skill, latest correct, at least 2 templates,
   no timeouts; Tested out = first 2 right first try, each under 60 s; Retained = a correct review at least
   2 sessions after Secure; a missed review sends the skill back to learning and 2 right in a row re-secure it;
   correct answers on later skills pass review credit backward (once per skill per session). */
(function () {
  'use strict';
  var C = window.CLIMB, E = C.engine = {};

  function blankSkill() { return { st: 'new', hist: [], next: 0, securedAt: 0, testedOut: false, stuck: false, front: false, credit: 0, run: 0, n: 0, ok: 0, check: false, last: '' }; }
  E.blank = function () { return { v: 1, theta: 205, nScored: 0, sess: 0, skills: {}, hist: [], today: null, ov: 0, updated: 0 }; };
  E.norm = function (st) {
    st = st && st.v === 1 ? st : E.blank();
    C.SKILLS.forEach(function (s) { if (!st.skills[s.id]) st.skills[s.id] = blankSkill(); });
    return st;
  };
  E.sk = function (st, id) { return st.skills[id]; };
  var DONE = { secure: 1, retained: 1 };
  E.isSecure = function (st, id) { return !!DONE[st.skills[id].st]; };
  E.isOpen = function (st, id) { return C.SKILL[id].needs.every(function (n) { return E.isSecure(st, n); }); };
  E.templates = function (id) { return C.BY[id] || []; };

  /* ---------- sessions ---------- */
  // called when the live session starts (or when a student joins one already running)
  E.begin = function (st, sid, info) {
    info = info || {};
    if (st.today && st.today.id === sid) return st.today;
    if (st.today) closeDay(st);
    st.sess++;
    var t = st.today = { id: sid, n: st.sess, items: 0, scored: 0, right: 0, leaves: 0, away: 0, almost: 0, secured: [], retained: [], fixed: 0, th0: st.theta, noSecure: false, flags: [], revDone: 0, revOk: 0, probes: 0, timeouts: 0, tags: {}, late: !!info.late, pick: 0, review: [], focus: info.focus || '', focusAll: !!info.focusAll, idle: 0, paste: 0 };
    // review queue: skills flagged to the front first, then secure skills due for review (oldest first); 2 at most
    var due = C.SKILLS.map(function (s) { return s.id; }).filter(function (id) { var k = st.skills[id]; return k.st === 'secure' && st.sess - k.securedAt >= C.P.reviewGap; });
    due.sort(function (a, b) { var A = st.skills[a], B = st.skills[b]; return (B.front ? 1 : 0) - (A.front ? 1 : 0) || A.securedAt - B.securedAt; });
    t.review = due.slice(0, 2);
    t.probeLeft = C.P.probeSessions.indexOf(st.sess) >= 0 ? 3 : 0;
    // a skill that got stuck last time comes first today; "front" only lasts one session
    C.SKILLS.forEach(function (s) { st.skills[s.id].front = false; });
    return t;
  };
  function closeDay(st) {
    var t = st.today; if (!t) return;
    st.hist.push({ s: t.n, id: t.id, th: Math.round(st.theta * 10) / 10, sec: t.secured.length, ret: t.retained.length, items: t.scored, leaves: t.leaves });
    if (st.hist.length > 60) st.hist = st.hist.slice(-60);
  }
  E.close = function (st) { closeDay(st); if (st.today) st.today.closed = true; };

  /* ---------- picking the next item ---------- */
  function frontier(st) {
    var open = C.SKILLS.filter(function (s) { return !E.isSecure(st, s.id) && E.isOpen(st, s.id) && E.templates(s.id).length; });
    // stuck skills from earlier sessions first, then ladder order
    open.sort(function (a, b) { return (st.skills[b.id].stuck ? 1 : 0) - (st.skills[a.id].stuck ? 1 : 0) || a.i - b.i; });
    return open.map(function (s) { return s.id; });
  }
  E.frontier = function (st) { var f = frontier(st), t = st.today; if (t && t.focus && f.indexOf(t.focus) >= 0) return t.focus; return f[0] || null; };
  function pickTemplate(st, id, R, avoid) {
    var list = E.templates(id); if (!list.length) return null;
    var k = st.skills[id], i = k.next % list.length, t = list[i];
    if (avoid && t.id === avoid && list.length > 1) t = list[(i + 1) % list.length];
    return t.id;
  }
  // review items use a template different from the one last seen on that skill
  function reviewTemplate(st, id, R) {
    var list = E.templates(id); if (!list.length) return null;
    var others = list.filter(function (t) { return t.id !== st.skills[id].last; });
    return R.pick(others.length ? others : list).id;
  }
  // a probe: any template whose difficulty is near the growth score, Levels 3-7
  function probeTemplate(st, R) {
    var target = st.theta, all = Object.keys(C.T).map(function (k) { return C.T[k]; }).filter(function (t) { return t.level >= 3; });
    if (!all.length) return null;
    all.sort(function (a, b) { return Math.abs(C.diff(a.level) - target) - Math.abs(C.diff(b.level) - target); });
    var best = Math.abs(C.diff(all[0].level) - target), near = all.filter(function (t) { return Math.abs(C.diff(t.level) - target) <= best + 10; });
    return R.pick(near).id;
  }
  // ctx: {twin:{tid}, check:skillId}. Returns {tid, seed, mode, skill} or null when nothing is open.
  E.next = function (st, ctx, seed) {
    ctx = ctx || {};
    var t = st.today, R = C.rng(seed || C.newSeed()), pick = function (tid, mode) { return tid ? { tid: tid, seed: C.newSeed(), mode: mode, skill: C.T[tid].skill } : null; };
    if (ctx.twin) return pick(ctx.twin, ctx.twinMode || 'twin');
    if (ctx.check && E.templates(ctx.check).length) return pick(E.templates(ctx.check)[0].id, 'check');
    if (t && t.review.length) { var rid = t.review[0]; if (st.skills[rid].st === 'secure') return pick(reviewTemplate(st, rid, R), 'review'); t.review.shift(); return E.next(st, ctx, seed + 1); }
    if (t && t.probeLeft > 0 && t.scored >= 2 && t.pick % 3 === 2) return pick(probeTemplate(st, R), 'probe');
    var fr = E.frontier(st), lastSkill = ctx.lastSkill;
    // the teacher's focus skill, opened for everyone: students who haven't reached it get its guided items between their own
    if (t && t.focusAll && t.focus && C.SKILL[t.focus] && !E.isOpen(st, t.focus) && !E.isSecure(st, t.focus) && t.pick % 2 === 1 && E.templates(t.focus).length) return pick(E.templates(t.focus)[0].id, 'preview');
    // interleave: never two in a row from the same skill when there is a choice
    if (fr && fr === lastSkill) {
      var others = frontier(st).filter(function (id) { return id !== fr; });
      if (!others.length) others = C.SKILLS.map(function (s) { return s.id; }).filter(function (id) { return id !== fr && E.isSecure(st, id) && E.templates(id).length; });
      if (others.length) { var o = R.pick(others); return pick(E.isSecure(st, o) ? reviewTemplate(st, o, R) : pickTemplate(st, o, R), E.isSecure(st, o) ? 'practice' : 'new'); }
    }
    if (fr) return pick(pickTemplate(st, fr, R, st.skills[fr].last), 'new');
    // everything open is secure: keep reviewing (oldest secure first), then practise retained skills
    var sec = C.SKILLS.map(function (s) { return s.id; }).filter(function (id) { return E.isSecure(st, id) && E.templates(id).length && id !== lastSkill; });
    if (!sec.length) sec = C.SKILLS.map(function (s) { return s.id; }).filter(function (id) { return E.isSecure(st, id) && E.templates(id).length; });
    if (!sec.length) return null;
    sec.sort(function (a, b) { return (st.skills[a].st === 'secure' ? 0 : 1) - (st.skills[b].st === 'secure' ? 0 : 1) || st.skills[a].securedAt - st.skills[b].securedAt; });
    return pick(reviewTemplate(st, sec[0], R), 'practice');
  };

  /* ---------- recording an answer ---------- */
  function updTheta(st, level, x) {
    var d = C.diff(level), P = 1 / (1 + Math.pow(10, (d - st.theta) / 40)), K = st.nScored < 20 ? 12 : 6;
    st.theta = Math.max(200, Math.min(270, st.theta + K * (x - P)));
    st.nScored++;
  }
  function secureNow(st, id, how) {
    var k = st.skills[id]; k.st = 'secure'; k.securedAt = st.sess; k.stuck = false; k.run = 0;
    if (how === 'out') k.testedOut = true;
    if (st.today && st.today.secured.indexOf(id) < 0) st.today.secured.push(id);
  }
  function retainNow(st, id) {
    var k = st.skills[id]; k.st = 'retained';
    if (st.today && st.today.retained.indexOf(id) < 0) st.today.retained.push(id);
  }
  // r: {ok, tag, timeout, voided}, meta: {mode, secs, ext (used "Almost got it"), fast, afterLeave, idle}
  // returns what changed, for the screen: {secured, retained, testedOut, missedReview, stuck}
  E.record = function (st, it, r, meta) {
    var t = st.today, id = it.skill, k = st.skills[id], mode = meta.mode, out = {};
    if (r.voided) return out;
    var x = r.ok ? 1 : 0;
    if (t) { t.items++; if (mode !== 'preview') { t.scored++; if (r.ok) t.right++; } if (r.timeout) t.timeouts++; if (!r.ok && r.tag) t.tags[r.tag] = (t.tags[r.tag] || 0) + 1; t.pick++; }
    if (mode === 'preview') return out;
    updTheta(st, it.level, x);
    if (mode === 'probe') { if (t) { t.probeLeft--; t.probes++; } return out; }
    k.n++; if (r.ok) k.ok++; k.last = it.tid;
    if (r.ok && (meta.fast || meta.afterLeave || meta.idle)) { k.check = true; if (t) t.flags.push({ k: 'check', skill: id, why: meta.fast ? 'fast' : meta.afterLeave ? 'after leaving' : 'after idle' }); }
    // a later skill's miss that points back at an earlier skill moves that one to the front of next session's review
    if (!r.ok && r.tag && C.TAGSKILL[r.tag] && C.TAGSKILL[r.tag] !== id && E.isSecure(st, C.TAGSKILL[r.tag])) st.skills[C.TAGSKILL[r.tag]].front = true;

    var dueReview = k.st === 'secure' && st.sess - k.securedAt >= C.P.reviewGap;
    if (mode === 'review' || (mode === 'practice' && E.isSecure(st, id))) {
      if (mode === 'review' && t) { t.revDone++; t.review = t.review.filter(function (s) { return s !== id; }); }
      if (r.ok) {
        if (mode === 'review' && t) t.revOk++;
        if (dueReview) { retainNow(st, id); out.retained = true; }
      } else if (mode === 'review' || dueReview) {
        // back to learning: 2 right in a row re-secure it
        k.st = 'relearn'; k.run = 0; out.missedReview = true;
      }
      passBack(st, id, r, out);
      return out;
    }
    // learning (new, practice on an unsecured skill, twin, check)
    if (k.st === 'new') k.st = 'learning';
    k.hist.push({ ok: x, t: it.tid, to: r.timeout ? 1 : 0, s: Math.round(meta.secs || 0), ext: meta.ext ? 1 : 0, first: mode === 'new' ? 1 : 0 });
    if (k.hist.length > 8) k.hist = k.hist.slice(-8);
    if (r.ok) k.next++;
    if (mode === 'twin' && r.ok && t) t.fixed++;
    var blocked = t && t.noSecure;
    if (k.st === 'relearn') {
      k.run = r.ok ? k.run + 1 : 0;
      if (k.run >= 2 && !blocked) { secureNow(st, id); out.secured = true; }
    } else if (!E.isSecure(st, id) && !blocked) {
      var h = k.hist;
      // tested out: the first 2 items of the skill right on the first try, each under 60 s, without the extension
      if (k.n === 2 && h.length === 2 && h.every(function (a) { return a.ok && a.first && !a.ext && !a.to && a.s < C.P.testOutSecs; })) { secureNow(st, id, 'out'); out.secured = out.testedOut = true; }
      else {
        var last4 = h.slice(-4), right = last4.filter(function (a) { return a.ok; }).length, tpls = {};
        last4.forEach(function (a) { tpls[a.t] = 1; });
        var many = E.templates(id).length > 1;
        if (last4.length >= 3 && right >= 3 && last4[last4.length - 1].ok && !last4.some(function (a) { return a.to; }) && (!many || Object.keys(tpls).length >= 2)) { secureNow(st, id); out.secured = true; }
      }
    }
    if (mode === 'twin' && !r.ok) { k.stuck = true; out.stuck = true; if (t) t.flags.push({ k: 'stuck', skill: id, tag: r.tag || '' }); }
    if (r.ok && mode !== 'check') k.stuck = k.stuck && !out.secured;
    if (!out.testedOut) passBack(st, id, r, out);
    return out;
  };
  function passBack(st, id, r, out) {
    if (!r.ok) return;
    (C.BACK[id] || []).forEach(function (b) {
      var k = st.skills[b];
      if (k && k.st === 'secure' && st.sess - k.securedAt >= C.P.reviewGap && k.credit !== st.sess) { k.credit = st.sess; retainNow(st, b); (out.credited = out.credited || []).push(b); }
    });
  }
  // the prerequisite to check after a skill gets stuck: the one its misconception points at, else its first prerequisite
  E.checkFor = function (id, tag) {
    var needs = C.SKILL[id].needs; if (!needs.length) return null;
    var p = tag && C.TAGSKILL[tag]; return p && needs.indexOf(p) >= 0 ? p : needs[0];
  };

  /* ---------- summaries ---------- */
  // one letter per skill for the Sheet and the dashboard: R retained, S secure, L learning, B back to learning, K stuck, O open, - not open
  E.code = function (st, id) {
    var k = st.skills[id];
    if (k.st === 'retained') return 'R'; if (k.st === 'secure') return 'S';
    if (k.st === 'relearn') return 'B'; if (k.stuck) return 'K'; if (k.st === 'learning') return 'L';
    return E.isOpen(st, id) ? 'O' : '-';
  };
  E.map = function (st) { return C.SKILLS.map(function (s) { return s.id + ':' + E.code(st, s.id) + (st.skills[s.id].check ? '!' : ''); }).join(' '); };
  E.summary = function (st) {
    var t = st.today || {};
    return {
      theta: Math.round(st.theta * 10) / 10, sess: st.sess, map: E.map(st), frontier: E.frontier(st) || '',
      secure: C.SKILLS.filter(function (s) { return E.isSecure(st, s.id); }).length,
      retained: C.SKILLS.filter(function (s) { return st.skills[s.id].st === 'retained'; }).length,
      today: { id: t.id || '', items: t.scored || 0, right: t.right || 0, leaves: t.leaves || 0, almost: t.almost || 0, timeouts: t.timeouts || 0, secured: (t.secured || []).join(' '), tags: t.tags || {}, noSecure: !!t.noSecure, late: !!t.late, fixed: t.fixed || 0 }
    };
  };
  // teacher changes waiting for this student (a live check passed or failed, a skill sent back): applied once
  E.applyOverrides = function (st, ov) {
    if (!ov || !ov.at || ov.at <= (st.ov || 0)) return false;
    (ov.cleared || []).forEach(function (id) { if (st.skills[id]) st.skills[id].check = false; });
    (ov.back || []).forEach(function (id) { var k = st.skills[id]; if (k) { k.st = 'learning'; k.hist = []; k.check = false; k.run = 0; } });
    st.ov = ov.at; return true;
  };
})();
