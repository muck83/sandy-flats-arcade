/* Sandy Flats: one navigation strip shared by the arcade, the lessons and the teacher pages.
   Students: Arcade · Lessons · My Results (and, on a game, a link to that game's lesson), plus a red
   "Live now" link whenever the teacher is running a lesson. Teacher pages: Lessons · Class Results ·
   Participation · Teacher guide · Student view. */
(function () {
  'use strict';
  var CFG = window.SFA_CONFIG || {}, Q = location.search, page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (/[?&]screen/.test(Q)) return;   // the class screen stays clean for screen sharing
  var teach = /^(class|participation|teacher)\.html$/.test(page) || (/^lessons?\.html$/.test(page) && /[?&]teach/.test(Q));
  var PLAN = [   // film order: lesson file number, the number students see (= film), its game
    { l: 10, n: 1, game: 'g9-try-zero-first.html' },
    { l: 1, n: 2, game: 'g1-crack-the-fair.html' },
    { l: 2, n: 3, game: 'g2-glitch-hunt.html' },
    { l: 11, n: 4, game: 'g10-tile-run.html' },
    { l: 12, n: 5, game: 'g11-name-them-back.html' },
    { l: 3, n: 6, game: 'g4-gus-forecast.html' },
    { l: 4, n: 7, game: 'g3-keepers-vault.html' },
    { l: 13, n: 8, game: 'g12-off-the-edge.html' },
    { l: 14, n: 9, game: 'g13-half-a-rule.html' },
    { l: 5, n: 10, game: 'g5-scorch-marks.html' },
    { l: 15, n: 11, game: 'g14-three-roads.html' },
    { l: 6, n: 13, game: 'g6-linear-or-liar.html' },
    { l: 7, n: 14, game: 'g7-faster-than.html' },
    { l: 17, n: 15, game: 'g16-family-gallery.html' },
    { l: 8, n: 16, game: 'g8-dougs-steps.html' },
    { l: 9, n: 17, game: 'g3-keepers-vault.html' }
  ];
  var LESSON_OF = {}, NUM = {};   // game file -> lesson file number; lesson file number -> number shown
  PLAN.forEach(function (p) { if (!LESSON_OF[p.game]) LESSON_OF[p.game] = p.l; NUM[p.l] = p.n; });
  window.SFA_LESSON_OF = LESSON_OF; window.SFA_LESSON_NUM = NUM; window.SFA_PLAN = PLAN;

  var css = '.sfanav{display:flex;flex-wrap:wrap;gap:6px;align-items:center}' +
    '.sfanav a{font:700 13px/1 var(--ui,system-ui,sans-serif);padding:7px 11px;border-radius:999px;color:var(--ink,#f4efe6);text-decoration:none;border:1px solid var(--line,rgba(255,255,255,.18));background:var(--panel2,rgba(255,255,255,.04));white-space:nowrap}' +
    '.sfanav a:hover,.sfanav a:focus-visible{border-color:var(--marquee,#FFC94A);outline:none}' +
    '.sfanav a.on{background:var(--marquee,#FFC94A);color:#231800;border-color:transparent}' +
    '.sfanav a.live{background:#E5484D;color:#fff;border-color:transparent;animation:sfanavPulse 2s ease-in-out infinite}' +
    '@keyframes sfanavPulse{50%{box-shadow:0 0 0 4px rgba(229,72,77,.3)}}' +
    '.sfanav-strip{padding:10px 0 4px}' +
    '.sfalive{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin:0 0 14px;padding:14px 16px;border-radius:14px;background:#3a1418;border:2px solid #E5484D}' +
    '.sfalive b{font-size:18px}.sfalive a{font:800 15px var(--ui,system-ui);padding:10px 16px;border-radius:999px;background:#E5484D;color:#fff;text-decoration:none}' +
    '@media (prefers-reduced-motion:reduce){.sfanav a.live{animation:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function link(href, text, on, cls) {
    var a = document.createElement('a'); a.href = href; a.textContent = text;
    if (on) { a.className = 'on'; a.setAttribute('aria-current', 'page'); }
    if (cls) a.className = (a.className ? a.className + ' ' : '') + cls;
    return a;
  }
  var nav = document.createElement('nav'); nav.className = 'sfanav'; nav.setAttribute('aria-label', 'Sandy Flats');
  var liveSlot = document.createElement('span'); liveSlot.style.display = 'contents';
  if (teach) {
    nav.appendChild(link('lessons.html?teach', '📚 Lessons', /^lessons?\.html$/.test(page)));
    nav.appendChild(link('class.html', '🏆 Class Results', page === 'class.html'));
    nav.appendChild(link('participation.html', '✋ Participation', page === 'participation.html'));
    nav.appendChild(link('teacher.html', '🧭 Teacher guide', page === 'teacher.html'));
    nav.appendChild(link('index.html', '👀 Student view', false));
  } else {
    nav.appendChild(liveSlot);
    nav.appendChild(link('index.html', '🕹️ Arcade', page === 'index.html' || page === ''));
    nav.appendChild(link('lessons.html', '📚 Lessons', page === 'lessons.html' || page === 'lesson.html'));
    if (LESSON_OF[page]) nav.appendChild(link('lesson.html?l=' + LESSON_OF[page], '📺 Lesson ' + (NUM[LESSON_OF[page]] || LESSON_OF[page]) + ' slides', false));
    if (page === 'lesson.html') {   // and from a lesson, straight to its game
      var ln = +((Q.match(/[?&]l=(\d+)/) || [])[1] || 0), gf = (PLAN.filter(function (p) { return p.l === ln; })[0] || {}).game;
      if (gf) nav.appendChild(link(gf, '🕹️ Play the game', false));
    }
    nav.appendChild(link('results.html', '⭐ My Results', page === 'results.html'));
  }

  function place() {
    var top = document.querySelector('.topbar, .ltop');
    if (top) {
      var after = top.querySelector('.gtitle') || top.querySelector('.brand');
      if (after) top.insertBefore(nav, after.nextSibling); else top.insertBefore(nav, top.firstChild);
      return true;
    }
    var wrap = document.querySelector('.wrap');
    if (wrap && page !== 'lesson.html') { var strip = document.createElement('div'); strip.className = 'sfanav-strip'; strip.appendChild(nav); wrap.insertBefore(strip, wrap.firstChild); return true; }
    return false;
  }
  function start() {
    if (place()) return liveCheck();
    // the lesson page builds its top bar after loading the lesson file
    var tries = 0, iv = setInterval(function () { if (place() || ++tries > 50) { clearInterval(iv); liveCheck(); } }, 100);
  }

  /* ---------- "Live now": students see the lesson the teacher is running ---------- */
  function liveCheck() {
    if (teach || !CFG.endpoint) return;
    var here = page === 'lesson.html' ? 'L' + ((Q.match(/[?&]l=(\d+)/) || [])[1] || '') : '';
    function check() {
      if (document.visibilityState === 'hidden') return;
      fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ op: 'live' }) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          var L = j && j.live, ended = L && L.counts && Array.isArray(L.counts.zend) && L.counts.zend[0] === 1;
          var on = L && !ended && /^L\d+$/.test(L.lesson) && Math.abs(Date.now() - L.at) < 15 * 60000 && L.lesson !== here;
          liveSlot.innerHTML = '';
          var big = document.getElementById('sfaLive'); if (big) big.remove();
          if (!on) return;
          var id = L.lesson.slice(1), n = NUM[id] || id, href = 'lesson.html?l=' + id;
          liveSlot.appendChild(link(href, '🔴 Live now: Lesson ' + n, false, 'live'));
          var anchor = document.getElementById('nextUp') || document.getElementById('grid');
          if (anchor) {
            var box = document.createElement('div'); box.id = 'sfaLive'; box.className = 'sfalive';
            box.innerHTML = '<span><b>Your teacher is teaching Lesson ' + n + ' right now.</b></span>';
            var a = document.createElement('a'); a.href = href; a.textContent = '▶ Join the lesson'; box.appendChild(a);
            anchor.parentNode.insertBefore(box, anchor);
          }
        }, function () { });
    }
    check();
    if (/^(index|lessons)\.html$/.test(page) || page === '') setInterval(check, 45000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
