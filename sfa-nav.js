/* Sandy Flats: one navigation strip shared by the arcade, the lessons and the teacher pages.
   Students: Arcade · Lessons · My Results (and, on a game, a link to that game's lesson), plus a red
   "Live now" link whenever the teacher is running a lesson. Teacher pages: Lessons · Class Results ·
   Participation · Teacher guide · Student view. */
(function () {
  'use strict';
  var CFG = window.SFA_CONFIG || {}, Q = location.search, page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (/[?&]screen/.test(Q)) return;   // the class screen stays clean for screen sharing
  var teach = /^(class|participation|teacher)\.html$/.test(page) || (/^lessons?\.html$/.test(page) && /[?&]teach/.test(Q));
  // which lesson each game belongs to (the lesson files say the same)
  var LESSON_OF = { 'g1-crack-the-fair.html': 1, 'g2-glitch-hunt.html': 2, 'g4-gus-forecast.html': 3, 'g3-keepers-vault.html': 4, 'g5-scorch-marks.html': 5, 'g6-linear-or-liar.html': 6, 'g7-faster-than.html': 7, 'g8-dougs-steps.html': 8 };
  window.SFA_LESSON_OF = LESSON_OF;

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
    if (LESSON_OF[page]) nav.appendChild(link('lesson.html?l=' + LESSON_OF[page], '📺 Lesson ' + LESSON_OF[page] + ' slides', false));
    if (page === 'lesson.html') {   // and from a lesson, straight to its game
      var ln = +((Q.match(/[?&]l=(\d+)/) || [])[1] || 0), gf = ln === 9 ? 'g3-keepers-vault.html' : Object.keys(LESSON_OF).filter(function (f) { return LESSON_OF[f] === ln; })[0];
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
          var n = L.lesson.slice(1), href = 'lesson.html?l=' + n;
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
