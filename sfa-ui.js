/* Sandy Flats Arcade: one-screen game layout.
   On a laptop the stage sits on the left and "Your job" sits on the right, so the
   picture, the question and the answer boxes are all on screen together.
   Levels, certificates and the footer move into a "Levels" drawer.
   On a phone the job card comes straight after the stage, with a "Your job" pill
   when it is scrolled out of sight. Loaded by every game page after the game code. */
(function () {
  'use strict';
  var play = document.querySelector('.play'), main = play && play.querySelector('.main');
  var work = document.getElementById('workH'), aside = play && play.querySelector('aside');
  if (!play || !main || !work || !aside) return;
  work = work.closest('section');
  var GOALS = {
    'g1': 'Feed numbers into each machine, watch what comes out, and work out its secret rule.',
    'g2': 'Test the suspects. Catch the one that gives the same input two different outputs.',
    'g3': 'Open each door by turning the same rule into words, a table, a graph and a formula.',
    'g4': 'Build a graph that tells the story, then read the story from a graph.',
    'g5': 'Measure the steps between two marks to find the slope, then find the rule.',
    'g6': 'Check each machine\'s table. Does it go up by the same amount every time, or is it lying?',
    'g7': 'Work out each ride\'s speed and decide who wins the race.',
    'g8': 'Decide if a story needs dots or a line, then fence in the inputs and outputs.'
  };
  var gid = (location.pathname.match(/\/(g\d)-/) || [])[1];
  var TIER = { 'Low floor': 'Warm-up', 'Core': 'Main', 'Stretch': 'Challenge', 'Review': 'Review' };

  var css = document.createElement('style');
  css.textContent = [
    '.jobk{font:700 12px var(--ui);letter-spacing:.12em;text-transform:uppercase;color:var(--teal);margin:0 0 2px}',
    '.jobk b{color:var(--muted);font-weight:600;letter-spacing:.06em}',
    '#workBody h3{color:var(--marquee);font-size:14px;letter-spacing:.06em;margin:14px 0 6px}',
    '.task{font-size:1.06em}',
    '.say{font-size:1.04em}',
    '.stuck{display:flex;align-items:center;gap:10px;margin-top:10px;flex-wrap:wrap}',
    '.stuck small{color:var(--muted)}',
    '.covergoal{display:block;margin-top:12px;max-width:34em;font:600 clamp(14px,1.8vw,18px) var(--ui);color:#fff;text-shadow:0 2px 6px #000;text-align:center}',
    '.startcover{flex-direction:column}',
    '.startcover{display:flex!important;flex-direction:column;align-items:center;justify-content:center}.startcover[hidden]{display:none!important}',
    '#chLevel{display:none!important}',
    '.lvchip b{font-family:var(--mono)}',
    '.drawer{position:fixed;inset:0;z-index:70;display:flex;justify-content:flex-end;background:rgba(6,5,10,.6)}',
    '.drawer[hidden]{display:none}',
    '.drawer>.panel{width:min(440px,100%);height:100%;overflow:auto;background:var(--bg);border-left:2px solid var(--line);padding:14px 16px;display:flex;flex-direction:column;gap:12px}',
    '.drawer .dhead{display:flex;justify-content:space-between;align-items:center}',
    '.drawer .footer{margin-top:4px;flex-direction:column;align-items:flex-start}',
    '.jobpill{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:50;background:var(--marquee);color:#231800;border:0;border-radius:999px;padding:10px 18px;font:800 15px var(--ui);box-shadow:0 6px 18px rgba(0,0,0,.5)}',
    '.jobpill[hidden]{display:none}',
    '@media (min-width:901px){',
    ' body.oneScreen .wrap{max-width:1600px;padding-block:8px 8px}',
    ' body.oneScreen .topbar{padding-bottom:6px}',
    ' body.oneScreen .play{grid-template-columns:minmax(0,1fr) minmax(380px,40%);margin-top:8px;align-items:start}',
    ' body.oneScreen .play>.main{align-items:center}',
    ' body.oneScreen .play>.main .stage{width:min(100%,calc((100vh - var(--topH,60px) - 80px) * 16 / 9))}',
    ' body.oneScreen .play>.main>.row{align-self:stretch}',
    ' body.oneScreen .play>aside{max-height:calc(100vh - var(--topH,60px) - 22px);overflow:auto;position:sticky;top:8px;padding-right:2px}',
    ' body.oneScreen .footer{display:none}',
    ' body.oneScreen .drawer .footer{display:flex}',
    '}',
    '@media (max-width:900px){',
    ' body.oneScreen .play>aside{display:contents}',
    ' body.oneScreen .play{display:flex;flex-direction:column}',
    ' body.oneScreen .play>.main{display:contents}',
    ' body.oneScreen .play .stage{order:1}',
    ' body.oneScreen .play section.job{order:2}',
    ' body.oneScreen .play>.main>.row{order:3}',
    ' body.oneScreen .play>aside>section{order:4}',
    ' body.oneScreen .wrap>.footer{display:none}',
    '}'
  ].join('\n');
  document.head.appendChild(css);
  document.body.classList.add('oneScreen');

  // the job card goes to the top of the right-hand column
  work.classList.add('job');
  aside.insertBefore(work, aside.firstChild);
  var kicker = document.createElement('p'); kicker.className = 'jobk'; kicker.textContent = 'Your job';
  work.insertBefore(kicker, work.firstChild);

  // "Stuck?" sits with the question, not under the picture
  var hint = document.getElementById('btnHint'), say = document.getElementById('say');
  if (hint && say) {
    var stuck = document.createElement('div'); stuck.className = 'stuck';
    hint.textContent = 'Stuck? Get a hint (H)';
    stuck.appendChild(hint);
    var sm = document.createElement('small'); sm.textContent = 'Hints get stronger each time you press.'; stuck.appendChild(sm);
    say.parentNode.insertBefore(stuck, say.nextSibling);
  }

  // levels, certificates and the footer go into a drawer
  var lv = document.getElementById('levels'), ct = document.getElementById('certs');
  var lvCard = lv && lv.closest('section'), ctCard = ct && ct.closest('section'), foot = document.querySelector('.wrap>.footer');
  var drawer = document.createElement('div'); drawer.className = 'drawer'; drawer.hidden = true;
  var panel = document.createElement('div'); panel.className = 'panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Levels and certificates');
  var head = document.createElement('div'); head.className = 'dhead';
  head.innerHTML = '<b style="font-family:var(--display);font-size:22px;color:var(--marquee);letter-spacing:.03em">Levels</b>';
  var close = document.createElement('button'); close.type = 'button'; close.className = 'btn small'; close.textContent = 'Close (Esc)';
  head.appendChild(close); panel.appendChild(head);
  if (lvCard) panel.appendChild(lvCard);
  if (ctCard) panel.appendChild(ctCard);
  if (foot) { var f2 = foot.cloneNode(false); while (foot.firstChild) f2.appendChild(foot.firstChild); panel.appendChild(f2); }
  var tb = document.getElementById('btnTeacher'); if (tb) tb.style.setProperty('display', 'none', 'important');   // teachers use Ctrl+Shift+K or the Teacher corner page
  drawer.appendChild(panel); document.body.appendChild(drawer);
  function openD() { drawer.hidden = false; close.focus(); }
  function closeD() { drawer.hidden = true; }
  close.addEventListener('click', closeD);
  drawer.addEventListener('click', function (e) { if (e.target === drawer) closeD(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) { e.stopPropagation(); closeD(); } }, true);
  if (lv) lv.addEventListener('click', function (e) { if (e.target.closest('button:not([disabled])') && !e.target.closest('.tonly')) setTimeout(closeD, 60); });

  var chips = document.querySelector('.topbar .chips');
  var chip = document.createElement('button'); chip.type = 'button'; chip.className = 'chip lvchip'; chip.addEventListener('click', openD);
  if (chips) chips.insertBefore(chip, chips.firstChild);

  // friendlier level names, and "Level 2 of 12" in the chip and on the job card
  function sync() {
    if (!lv) return;
    [].forEach.call(lv.querySelectorAll('.tier'), function (t) { var n = TIER[t.textContent]; if (n && n !== t.textContent) t.textContent = n; });
    var bs = [].slice.call(lv.querySelectorAll('li>button:first-child')), i = -1, done = 0;
    bs.forEach(function (b, k) { if (b.getAttribute('aria-current') === 'true') i = k; if (b.querySelector('.st.done')) done++; });
    chip.innerHTML = '☰ Levels <b>' + done + '/' + bs.length + '</b>';
    if (i >= 0) {
      var tier = (bs[i].querySelector('.tier') || {}).textContent || '';
      kicker.innerHTML = 'Your job <b>· Level ' + (i + 1) + ' of ' + bs.length + (tier ? ' · ' + tier : '') + '</b>';
    }
  }
  if (lv && window.MutationObserver) new MutationObserver(sync).observe(lv, { childList: true, subtree: true });
  sync();

  // the start screen says what the game is about
  var start = document.getElementById('start');
  if (start && GOALS[gid] && !start.querySelector('.covergoal')) { var g = document.createElement('span'); g.className = 'covergoal'; g.textContent = GOALS[gid]; start.appendChild(g); }

  // keep the newest feedback in view inside the job column
  if (say && window.MutationObserver) new MutationObserver(function () { if (say.textContent) try { say.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { } }).observe(say, { childList: true, characterData: true, subtree: true });

  // when a new level starts, bring its job card to the top of the column
  var title = document.getElementById('workH'), lastT = '';
  if (title && window.MutationObserver) new MutationObserver(function () {
    if (title.textContent === lastT) return; lastT = title.textContent;
    if (window.innerWidth > 900) { aside.scrollTop = 0; }
  }).observe(title, { childList: true, characterData: true, subtree: true });

  // phone: a pill that jumps to the job card when it's out of sight
  var pill = document.createElement('button'); pill.type = 'button'; pill.className = 'jobpill'; pill.textContent = '▼ Your job'; pill.hidden = true;
  pill.addEventListener('click', function () { work.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  document.body.appendChild(pill);
  function checkPill() {
    if (window.innerWidth > 900 || (start && !start.hidden)) { pill.hidden = true; return; }
    var r = work.getBoundingClientRect(); pill.hidden = !(r.top > window.innerHeight - 40);
  }
  window.addEventListener('scroll', checkPill, { passive: true }); window.addEventListener('resize', checkPill);
  setInterval(checkPill, 1000);

  // measure the top bar so the stage can size itself to the screen
  function topH() { var t = document.querySelector('.topbar'); if (t) document.documentElement.style.setProperty('--topH', (t.getBoundingClientRect().bottom + 8) + 'px'); }
  window.addEventListener('resize', topH); topH(); setTimeout(topH, 500);
})();
