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
    'g8': 'Decide if a story needs dots or a line, then fence in the inputs and outputs.',
    'g9': 'Feed zero first to see where a rule starts, then crack each machine.',
    'g10': 'Plot Gus\'s signs, find the half tile, read the graph backwards and dodge the Vertical Line.',
    'g11': 'Say each machine\'s name back three ways: sentence, pair, point.',
    'g12': 'Find the step, walk back to input 0 to find where each rule starts, then predict a row that isn\'t in the table.',
    'g13': 'Find the start and the step of the leaking water tower, then find when the town runs dry.',
    'g14': 'Run each machine backwards to find what went in, then check it with the table, the graph and the crossing.',
    'g15': 'Square it, double it, divide 1 by it: cross the valley, climb the tower, drop into the canyon and find the input the door can\'t take.',
    'g16': 'Name each family, match the shadows by changing one number, and test points to open Max\'s locks.',
    'g17': 'Re-forge the Chain four ways, catch the lying link, then find the edge of the Undefined\'s rule 12/x.',
    'g18': 'Set the lift dial by end minus start, find the slope of every span, and name the cause on each incident slip.',
    'g19': 'Find the slope from the log, walk back to post zero for the start, then write the rule and check it before the train leaves.',
    'g20': 'Write the bridge\'s load rule, turn the sign when you divide by a negative, check it with a number and read it on the line.',
    'g21': 'Open Gate A\'s three locks: a slope from two points, a rule from a log that starts late, and a counterweight where the sign has to turn.'
  };
  var gid = (location.pathname.match(/\/(g\d+)-/) || [])[1];
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
    '.covergoal,.startcover span.covergoal{display:block;margin-top:12px;max-width:34em;font:600 clamp(14px,1.8vw,18px) var(--ui);color:#fff;text-shadow:0 2px 6px #000;text-align:center;background:none;box-shadow:none;padding:0;border-radius:0}',
    '.startcover:has(.covergoal){place-content:center;align-content:center;gap:4px}',
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
    '.lvdone{margin:4px 0 10px;padding:12px 14px;border-radius:12px;background:rgba(63,166,107,.16);border:2px solid var(--green);display:flex;flex-direction:column;gap:6px;animation:lvpop .45s cubic-bezier(.2,1.6,.4,1)}',
    '.lvdone.all{background:rgba(245,197,24,.16);border-color:var(--marquee)}',
    '.lvdone .lvbig{font:800 clamp(20px,2.2vw,26px) var(--ui);color:var(--green)}',
    '.lvdone.all .lvbig{color:var(--marquee)}',
    '.lvdone .lvline{display:flex;align-items:center;gap:8px;flex-wrap:wrap;color:var(--muted);font:600 14px var(--ui)}',
    '.lvdone .pips{display:inline-flex;gap:3px;flex-wrap:wrap}',
    '.lvdone .pips i{width:12px;height:12px;border-radius:50%;border:2px solid var(--line);display:inline-block}',
    '.lvdone .pips i.x{border-radius:3px}',
    '.lvdone .pips i.on{background:var(--green);border-color:var(--green)}',
    '.lvdone .lvnext{font-size:1.02em}',
    '.lvdone .row{margin:2px 0 0}',
    '.donedlg h2{color:var(--marquee);font-size:clamp(22px,3vw,32px)}',
    '.donebig{font:700 1.15em var(--ui);margin:4px 0 8px}',
    '.donelist{margin:0 0 14px;padding-left:1.2em;line-height:1.6}',
    '.donedlg .row{display:flex;gap:10px;flex-wrap:wrap}',
    '@keyframes lvpop{from{transform:scale(.85);opacity:0}to{transform:none;opacity:1}}',
    '@media (prefers-reduced-motion:reduce){.lvdone{animation:none}}',
    '@media (min-width:901px){',
    ' body.oneScreen .wrap{max-width:1600px;padding-block:8px 8px}',
    ' body.oneScreen .topbar{padding-bottom:6px}',
    ' body.oneScreen .topbar .gtitle{flex:1 1 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:6em}',   // the title gives way first, so the bar stays one row
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

  // finishing a level or the whole game is announced loudly, so nobody wonders whether they're done
  var gname = ((document.querySelector('.gtitle') || {}).textContent || document.title || 'this game').trim();
  var seen = null, banner = null, bannerAt = -1, finishTok = 0;
  function levels() {
    return [].slice.call(lv.querySelectorAll('li>button:first-child')).map(function (b, k) {
      var t = b.querySelector('.tier');
      return { b: b, k: k, done: !!b.querySelector('.st.done'), cur: b.getAttribute('aria-current') === 'true', extra: !!(t && /\bstretch\b/.test(t.className)), open: !b.disabled };
    });
  }
  function nextOpen(ls, extra) { for (var j = 0; j < ls.length; j++) if (!ls[j].done && (ls[j].open || extra) && (extra == null || ls[j].extra === extra)) return ls[j]; return null; }
  function mk(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function btn(text, cls, fn) { var b = mk('button', 'btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function dropBanner() { if (banner) banner.remove(); banner = null; bannerAt = -1; finishTok++; }   // a pending finish screen belongs to the banner
  function watchDone() {
    if (!lv) return;
    var ls = levels(), now = ls.map(function (l) { return l.done; });
    if (!seen || seen.length !== now.length) { seen = now; return; }
    var hit = null; ls.forEach(function (l) { if (l.done && !seen[l.k] && l.cur) hit = l; });
    seen = now;
    var cur = ls.filter(function (l) { return l.cur; })[0];
    if (banner && (!cur || cur.k !== bannerAt)) dropBanner();
    if (!hit) return;
    var main = ls.filter(function (l) { return !l.extra; }), mainLeft = main.filter(function (l) { return !l.done; }).length;
    var allLeft = ls.filter(function (l) { return !l.done; }).length, doneN = ls.length - allLeft;
    var gameDone = !allLeft || (!hit.extra && !mainLeft);
    showBanner(ls, hit, doneN, gameDone);
    if (window.SFA_JUICE) try { SFA_JUICE.level({ k: hit.k, total: ls.length, doneN: doneN, all: gameDone, hard: hit.extra || hit.k === main.length - 1, done: ls.map(function (l) { return l.done; }), extra: ls.map(function (l) { return l.extra; }) }); } catch (e) { }
    // the finish screen only shows while the student is still on the level they just finished
    if (gameDone) { var tok = finishTok; whenClear(function () { if (tok !== finishTok) return; var c = levels().filter(function (l) { return l.cur; })[0]; if (!c || c.k !== hit.k) return; showFinish(!allLeft, main.length, nextOpen(levels(), true)); }); }
  }
  function showBanner(ls, hit, doneN, gameDone) {
    dropBanner();
    banner = mk('div', 'lvdone' + (gameDone ? ' all' : '')); banner.setAttribute('role', 'status'); bannerAt = hit.k;
    banner.appendChild(mk('b', 'lvbig', gameDone ? '🏆 Game complete!' : '✓ Level ' + (hit.k + 1) + ' complete!'));
    var pips = mk('span', 'pips'); ls.forEach(function (l) { pips.appendChild(mk('i', (l.done ? 'on' : '') + (l.extra ? ' x' : ''))); });
    var line = mk('span', 'lvline'); line.appendChild(pips); line.appendChild(document.createTextNode(' ' + doneN + ' of ' + ls.length + ' levels done')); banner.appendChild(line);
    var nx = nextOpen(ls), row = mk('div', 'row');
    if (gameDone) banner.appendChild(mk('span', 'lvnext', 'Make your certificate in ☰ Levels.'));   // kept short: the job card must not push the page past one screen
    if (!gameDone && nx && !document.getElementById('btnNext')) row.appendChild(btn('Next level →', 'primary', function () { nx.b.click(); }));
    else if (!gameDone && nx) banner.appendChild(mk('span', 'lvnext', 'Press the Next button below to keep going.'));
    if (gameDone) row.appendChild(btn('What now?', 'primary', function () { showFinish(!ls.some(function (l) { return !l.done; }), ls.filter(function (l) { return !l.extra; }).length, nextOpen(levels(), true)); }));
    if (row.firstChild) banner.appendChild(row);
    work.insertBefore(banner, kicker.nextSibling);
    if (window.innerWidth > 900) aside.scrollTop = 0; else try { banner.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { }
  }
  // wait for any reel or certificate window to close before showing the finish screen
  function whenClear(fn) {
    var n = 0; (function tick() {
      var busy = [].some.call(document.querySelectorAll('.ov'), function (o) { return !o.hidden && o.id !== 'sfaDone'; });
      if (busy && n++ < 300) return setTimeout(tick, 1000);
      setTimeout(fn, 600);
    })();
  }
  function showFinish(every, mainN, challenge) {
    var S = window.SFA; if (!S || !S.overlay) return;
    var ov = S.overlay('sfaDone', 'Game complete'), b = ov.body; b.innerHTML = '';
    ov.dlg.classList.add('donedlg');
    var h = ov.dlg.querySelector('h2'); if (h) h.textContent = '🏆 You finished ' + gname + (/[?!.]$/.test(gname) ? '' : '!');
    b.appendChild(mk('p', 'donebig', every ? 'You cleared every level. That is the whole game, done.' : 'You cleared the warm-up and every main level. That means this game is done.'));
    var ul = mk('ul', 'donelist');
    var notSaving = /Not saving/.test((document.querySelector('.topbar') || {}).textContent || '');
    ul.appendChild(mk('li', '', notSaving ? 'Your results are NOT reaching your teacher yet. Sign in at the top right so they count.' : 'Your results are saved for your teacher.'));
    ul.appendChild(mk('li', '', 'Make your certificate: it is in ☰ Levels.'));
    if (challenge) ul.appendChild(mk('li', '', 'Want more? Challenge levels are optional extras that earn special certificates.'));
    ul.appendChild(mk('li', '', 'Or go back to the arcade and pick your next game.'));
    b.appendChild(ul);
    var row = mk('div', 'row');
    row.appendChild(btn('Make my certificate', 'primary', function () { S.closeOverlay(ov); openD(); var c = document.getElementById('certs'); if (c) try { c.scrollIntoView({ block: 'start' }); } catch (e) { } }));
    if (challenge) row.appendChild(btn('Try a Challenge', '', function () { S.closeOverlay(ov); if (challenge.open) challenge.b.click(); else openD(); }));
    var home = mk('a', 'btn', 'Back to the arcade'); home.href = 'index.html'; row.appendChild(home);
    b.appendChild(row);
    if (window.SFA_JUICE) try { SFA_JUICE.finish(ov, every); } catch (e) { }
    S.openOverlay(ov);
  }
  if (lv && window.MutationObserver) new MutationObserver(watchDone).observe(lv, { childList: true, subtree: true });
  watchDone();

  // the start screen says what the game is about
  var start = document.getElementById('start');
  if (start && GOALS[gid] && !start.querySelector('.covergoal')) { var g = document.createElement('span'); g.className = 'covergoal'; g.textContent = GOALS[gid]; start.appendChild(g); }

  // keep the newest feedback in view inside the job column
  if (say && window.MutationObserver) new MutationObserver(function () { if (say.textContent) try { say.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { } }).observe(say, { childList: true, characterData: true, subtree: true });

  // when a new level starts, bring its job card to the top of the column
  var title = document.getElementById('workH'), lastT = '';
  if (title && window.MutationObserver) new MutationObserver(function () {
    if (title.textContent === lastT) return; lastT = title.textContent; finishTok++;
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
  // chips come and go (sign-in state, a game's extra chip), so keep measuring when the bar changes height
  var tbar = document.querySelector('.topbar'); if (tbar && window.ResizeObserver) new ResizeObserver(topH).observe(tbar);
})();

/* ✨ Arcade juice: the same feedback in all 21 games, from what is already on the page. Nothing here touches a game's
   rules, saved progress or sync: it only watches the feedback line (#say: "good" / "bad"), the step ticks and the level
   list, and answers with movement, particles and (if the student turns it on) short sounds from sfa-fx.js. Every call
   to the effects kit is guarded, so a page without sfa-fx.js still gets the CSS part. */
(function () {
  'use strict';
  var say = document.getElementById('say'), work = document.getElementById('workBody'), job = work && work.closest('section');
  var task = document.getElementById('task'), stage = document.querySelector('.play .stage') || document.getElementById('stage');
  if (!say || !work || !job) return;
  function FX() { return window.SFA_FX || {}; }
  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function replay(el, cls, ms) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); clearTimeout(el['_j' + cls]); el['_j' + cls] = setTimeout(function () { el.classList.remove(cls); }, ms); }

  var css = document.createElement('style');
  css.textContent = [
    '.say{transition:background .25s,border-color .25s}',
    '.say.good{border-left-width:6px;background:linear-gradient(90deg,rgba(53,208,186,.2),var(--panel2) 75%);font-weight:600}',
    '.say.good::before{content:"✓ ";color:var(--teal);font-weight:800}',
    '.say.bad{border-left-width:6px;background:linear-gradient(90deg,rgba(226,87,76,.16),var(--panel2) 75%)}',
    '.say.bad::before{content:"↻ ";color:var(--red);font-weight:800}',
    '.jx-good{animation:jxgood .55s cubic-bezier(.2,1.5,.4,1)}',
    '@keyframes jxgood{0%{transform:scale(.95);box-shadow:0 0 0 0 rgba(53,208,186,.75)}55%{transform:scale(1.03)}100%{transform:none;box-shadow:0 0 0 16px rgba(53,208,186,0)}}',
    '.jx-bad{animation:jxbad .4s}',
    '@keyframes jxbad{20%{transform:translateX(-7px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}',
    '#workBody>*{animation:jxin .32s cubic-bezier(.2,.9,.3,1.1) both}',
    '@keyframes jxin{from{transform:translateY(10px);opacity:0}to{transform:none;opacity:1}}',
    '.jx-new{animation:jxnew .45s cubic-bezier(.2,.9,.3,1.1)}',
    '@keyframes jxnew{from{transform:translateX(26px);opacity:.2}to{transform:none;opacity:1}}',
    '.btn{transition:transform .08s,box-shadow .08s,border-color .15s,filter .15s}',
    '.btn:not(:disabled):active{transform:translateY(2px) scale(.98)}',
    '.btn.primary:not(:disabled):hover{filter:brightness(1.07)}',
    '#workBody input[type=text]:focus,#workBody input[type=number]:focus{box-shadow:0 0 0 4px rgba(245,197,24,.22)}',
    '.task ol.steps li.now{font-weight:600}',
    '.task ol.steps li.did::after{display:inline-block;animation:jxtick .45s cubic-bezier(.2,1.8,.4,1)}',
    '@keyframes jxtick{from{transform:scale(0) rotate(-40deg)}to{transform:none}}',
    '.startcover>span:first-child{display:inline-block;animation:jxpulse 1.5s ease-in-out infinite}',
    '@keyframes jxpulse{50%{transform:scale(1.06)}}',
    '.chip.jxcombo{cursor:default;background:#2c1a05;border-color:#ffc94d;color:#ffc94d;font-weight:800}',
    '.chip.jxcombo[hidden]{display:none}',
    '.chip.jxcombo.fx-streak-hot{border-color:#ff9d4d;color:#ff9d4d;background:#331402}',
    '.chip.jxcombo.fx-streak-fire{border-color:#ff6b57;color:#fff;background:#b3261a}',
    '.chip.jxcombo b{font-family:var(--mono)}',
    '.chip.jxsound[aria-pressed="false"]{color:var(--muted)}',
    '.jxscene{position:fixed;left:50%;top:10%;transform:translateX(-50%);z-index:75;pointer-events:none;width:min(540px,calc(100vw - 24px))}',
    '.jxscene .card{position:relative;overflow:hidden;pointer-events:auto;cursor:pointer;display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:22px;background:linear-gradient(160deg,#2c2160,#171230);border:3px solid var(--marquee);box-shadow:0 0 0 6px rgba(245,197,24,.18),0 18px 50px rgba(0,0,0,.6);animation:jxdrop .6s cubic-bezier(.2,1.5,.4,1) both}',
    '.jxscene .card::before{content:"";position:absolute;left:-40px;top:50%;width:260px;height:260px;margin-top:-130px;background:repeating-conic-gradient(rgba(245,197,24,.16) 0 12deg,transparent 12deg 24deg);border-radius:50%;animation:jxspin 9s linear infinite}',
    '.jxscene.all .card{border-color:#5CE0B8;box-shadow:0 0 0 6px rgba(92,224,184,.2),0 0 60px rgba(92,224,184,.35),0 18px 50px rgba(0,0,0,.6)}',
    '.jxscene.out .card{animation:jxup .32s ease-in both}',
    '.jxscene .jav{position:relative;flex:none;line-height:0;animation:jxjump .5s ease-in-out infinite alternate}',
    '.jxscene .jav .em{font-size:64px;line-height:1.1;display:block}',
    '.jxscene .jtx{position:relative;min-width:0}',
    '.jxscene b.big{display:block;font:400 clamp(22px,6vw,34px)/1.05 var(--display);color:var(--marquee);letter-spacing:.03em}',
    '.jxscene.all b.big{color:#8BF3CF}',
    '.jxscene small{display:block;margin-top:5px;font:600 14px/1.3 var(--ui);color:#E4DFF1}',
    '.jxscene .pips{display:flex;gap:4px;flex-wrap:wrap;margin-top:7px}',
    '.jxscene .pips i{width:13px;height:13px;border-radius:50%;border:2px solid #6a628c;display:inline-block}',
    '.jxscene .pips i.x{border-radius:3px}',
    '.jxscene .pips i.on{background:var(--green);border-color:var(--green)}',
    '.jxscene .pips i.new{background:var(--marquee);border-color:var(--marquee);animation:jxpip .7s cubic-bezier(.2,1.8,.4,1) .45s both}',
    '@keyframes jxdrop{from{transform:translateY(-140%) rotate(-4deg);opacity:0}to{transform:none;opacity:1}}',
    '@keyframes jxup{to{transform:translateY(-140%);opacity:0}}',
    '@keyframes jxjump{to{transform:translateY(-10px) rotate(4deg)}}',
    '@keyframes jxspin{to{transform:rotate(360deg)}}',
    '@keyframes jxpip{0%{transform:scale(0)}60%{transform:scale(1.9)}100%{transform:scale(1)}}',
    '.donehero{display:flex;align-items:center;gap:14px;margin:0 0 10px;padding:10px 14px;border-radius:16px;background:linear-gradient(160deg,rgba(245,197,24,.18),rgba(245,197,24,.04));border:2px solid var(--marquee)}',
    '.donehero .jav{line-height:0;animation:jxjump .5s ease-in-out infinite alternate}.donehero .jav .em{font-size:56px;line-height:1.1;display:block}',
    '.donehero b{font:400 clamp(20px,4vw,28px)/1.1 var(--display);color:var(--marquee);letter-spacing:.03em}',
    '.donehero small{display:block;font:600 14px var(--ui);color:var(--muted);margin-top:3px}',
    '.lvdone .lvbig{display:inline-block;animation:jxtick .5s cubic-bezier(.2,1.8,.4,1) .1s both}',
    '@media (max-width:480px){.chip.jxsound .lbl{display:none}.topbar .chips{gap:6px}.jxscene{top:6%}.jxscene .card{padding:11px 13px;gap:10px}}'
  ].join('\n');
  document.head.appendChild(css);

  /* where the student last tapped or typed: effects start there */
  var lastEl = null;
  function note(e) { var t = e.target; if (!t || !t.closest) return; lastEl = t.closest('button,input,select,textarea,[role=button],canvas,svg') || t; }
  document.addEventListener('pointerdown', note, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && document.activeElement && document.activeElement !== document.body) lastEl = document.activeElement; }, true);
  function anchor() {
    if (lastEl && document.documentElement.contains(lastEl) && (job.contains(lastEl) || (stage && (stage === lastEl || stage.contains(lastEl))))) { var r = lastEl.getBoundingClientRect(); if (r.width && r.height && r.bottom > 0 && r.top < window.innerHeight) return lastEl; }
    var f = say.textContent ? say : job, fr = f.getBoundingClientRect();
    if (fr.bottom > 0 && fr.top < window.innerHeight) return f;
    return { x: window.innerWidth / 2, y: window.innerHeight * 0.62 };   // the job card is scrolled away: the middle of the screen
  }

  /* the streak meter in the top bar: right answers in a row, this visit only */
  var combo = 0, best = 0, chips = document.querySelector('.topbar .chips'), chip = mk('span', 'chip static jxcombo');
  chip.hidden = true; chip.setAttribute('role', 'status'); chip.title = 'Right answers in a row';
  if (chips) chips.appendChild(chip);
  function setCombo(n) {
    combo = n; if (n > best) best = n;
    if (n < 2) { chip.hidden = true; return; }
    chip.hidden = false; chip.innerHTML = '🔥 <b>' + n + '</b> in a row';
    var F = FX(); if (F.streakClass) F.streakClass(chip, n); replay(chip, 'jx-good', 600);
  }
  // sound: off until the student turns it on (sfa-fx.js remembers the choice)
  var snd = null;
  function paintSnd() { var F = FX(), on = !!(F.muted && !F.muted()); snd.innerHTML = (on ? '🔊' : '🔇') + '<span class="lbl"> Sound ' + (on ? 'on' : 'off') + '</span>'; snd.setAttribute('aria-label', on ? 'Game sounds on' : 'Game sounds off'); snd.setAttribute('aria-pressed', on ? 'true' : 'false'); snd.title = on ? 'Game sounds are on. Tap to turn them off.' : 'Game sounds are off. Tap to turn them on.'; }
  function speaker() {
    var F = FX(); if (snd || !chips || !F.mute || !F.muted) return;
    snd = mk('button', 'chip jxsound'); snd.type = 'button'; paintSnd();
    snd.addEventListener('click', function () { var F2 = FX(); F2.mute(!F2.muted()); paintSnd(); if (!F2.muted() && F2.sfx) F2.sfx('coin'); });
    chips.appendChild(snd);
  }
  speaker(); window.addEventListener('load', speaker);

  function hardNow() { var k = document.querySelector('.jobk'); return !!k && /Challenge/i.test(k.textContent); }
  var WORDS = ['Nice!', 'Yes!', 'Got it!', 'Sharp!', 'Spot on!', 'Boom!'], wi = Math.floor(Math.random() * WORDS.length);
  var softAt = 0, lastGood = 0, lastSig = '', lastAt = 0, badAt = 0, actAt = 0, grewAt = 0;
  function good(node, soft) {
    var now = Date.now();
    if (soft) { if (now - lastGood < 450 || now - softAt < 450) return; softAt = now; var F0 = FX(); if (F0.burst) F0.burst(anchor(), { count: 10, emoji: ['✨'], spread: 110 }); if (F0.sfx) F0.sfx('tap'); return; }   // a job step ticked: a sparkle, not a streak point
    if (now - lastGood < 450) return; lastGood = now;
    setCombo(combo + 1);
    var F = FX(), a = anchor(), hard = hardNow();
    if (node) replay(node, 'jx-good', 600);
    if (F.burst) F.burst(a, { count: Math.min(30, 10 + combo * 3), emoji: combo >= 4 ? ['⭐', '✨', '🔥'] : ['⭐', '✨'], spread: 150 + Math.min(130, combo * 22) });
    if (F.float) F.float(a, combo >= 2 ? WORDS[wi++ % WORDS.length] + ' ×' + combo : WORDS[wi++ % WORDS.length], { color: combo >= 4 ? '#ff9d4d' : '#5CE0B8', size: 24 + Math.min(14, combo * 2) });
    if (F.sfx) F.sfx(combo >= 3 && combo % 3 === 0 ? 'combo' : 'right');
    if (combo >= 5 && combo % 5 === 0) { if (F.banner) F.banner(combo + ' in a row!', { sub: 'You are on fire 🔥', ms: 1300 }); if (F.shake) F.shake(stage, { power: 6, ms: 350 }); }
    else if (hard && F.shake) F.shake(stage, { power: 7, ms: 320 });
  }
  function bad(node) {
    var F = FX(), a = anchor(); badAt = Date.now();
    if (combo >= 3 && F.float) F.float(chip, 'streak over', { color: '#b9b3cc', size: 18 });
    setCombo(0);
    replay(node, 'jx-bad', 450);
    if (a.nodeType === 1 && a !== say && a !== job && a.tagName !== 'CANVAS' && F.shake) F.shake(a, { power: 5, ms: 300 });
    if (hardNow() && F.shake) F.shake(stage, { power: 8, ms: 380 });
    if (F.sfx) F.sfx('wrong');
  }
  function onSay() {
    var kind = /\bgood\b/.test(say.className) ? 'good' : /\bbad\b/.test(say.className) ? 'bad' : '', text = say.textContent.trim();
    if (!kind || !text) { lastSig = ''; return; }
    var sig = kind + '|' + text, now = Date.now(); if (sig === lastSig && now - lastAt < 700) return; lastSig = sig; lastAt = now;
    if (kind === 'good') good(say); else bad(say);
  }
  if (window.MutationObserver) {
    new MutationObserver(onSay).observe(say, { attributes: true, attributeFilter: ['class'], childList: true, characterData: true, subtree: true });
    // games that tick a step without a "good" line still get the moment
    var didN = -1;
    var steps = function () { if (!task) return; var n = task.querySelectorAll('ol.steps li.did').length; if (didN >= 0 && n > didN) setTimeout(function () { good(null, true); }, 60); didN = n; };
    if (task) { new MutationObserver(steps).observe(task, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true }); steps(); }
    // an answer box or button turning green (the games' mark(): class "ok", or "good" on a choice) is a right answer too, even when no line is said
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        var t = ms[i].target, was = ' ' + (ms[i].oldValue || '') + ' ';
        if (t !== say && t.classList && ((t.classList.contains('ok') && was.indexOf(' ok ') < 0) || (t.classList.contains('good') && was.indexOf(' good ') < 0)) && /^(INPUT|SELECT|TEXTAREA|BUTTON|SPAN|DIV|LI|TD)$/.test(t.tagName)) { if (Date.now() - badAt > 300) good(null); return; }
      }
    }).observe(work, { attributes: true, attributeFilter: ['class'], attributeOldValue: true, subtree: true });
    // some games move straight on to the next question after a right answer, with no "good" line and no tick: when a
    // tap or Enter in the job card is followed by a new part of the job and no "not yet", that is a right answer too
    new MutationObserver(function (ms) { for (var i = 0; i < ms.length; i++) { if (ms[i].type === 'attributes' && !ms[i].target.hidden) { grewAt = Date.now(); return; } for (var j = 0; j < ms[i].addedNodes.length; j++) if (ms[i].addedNodes[j].nodeType === 1) { grewAt = Date.now(); return; } } }).observe(work, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });   // a new part added, or a hidden one shown
    var act = function () {
      var t = Date.now(), wh0 = document.getElementById('workH'), title = wh0 ? wh0.textContent : ''; actAt = t;
      setTimeout(function () {
        if (actAt !== t || badAt >= t || lastGood >= t - 100 || grewAt < t) return;
        if ((wh0 && wh0.textContent !== title) || document.getElementById('btnNext')) return;
        good(null);
      }, 900);
    };
    // an answer button or a Check counts; Watch, Replay, Hint, Next and the like never do
    work.addEventListener('click', function (e) {
      var bt = e.target.closest && e.target.closest('button'); if (!bt || /watch|again|replay|hint|start|next|show|play|skip|back|clear|reset|undo|certificate|level|stuck|help|sound|caption/i.test(bt.textContent)) return;
      act();
    }, true);
    work.addEventListener('keydown', function (e) { if (e.key === 'Enter') act(); }, true);
    // a new level slides in
    var wh = document.getElementById('workH'), lastT = wh ? wh.textContent : '';
    if (wh) new MutationObserver(function () { if (wh.textContent === lastT) return; lastT = wh.textContent; didN = -1; setTimeout(steps, 0); replay(job, 'jx-new', 500); var F = FX(); if (F.sfx) F.sfx('whoosh'); }).observe(wh, { childList: true, characterData: true, subtree: true });
  }

  /* level complete and game complete: the student's own avatar takes the bow */
  function avatar(size) {
    var A = window.SFA_AVATAR;
    try { if (A && A.svg && A.myLook) return A.svg(A.myLook(), { size: size }); } catch (e) { }
    return '<span class="em">🎉</span>';
  }
  var scene = null, sceneT = 0;
  function dropScene() { clearTimeout(sceneT); if (!scene) return; var s = scene; scene = null; s.classList.add('out'); setTimeout(function () { s.remove(); }, 340); }
  function level(o) {
    dropScene();
    var F = FX(), pips = '';
    for (var i = 0; i < o.total; i++) pips += '<i class="' + (i === o.k ? 'new' : o.done[i] ? 'on' : '') + (o.extra[i] ? ' x' : '') + '"></i>';
    scene = mk('div', 'jxscene' + (o.all ? ' all' : ''));
    scene.innerHTML = '<div class="card" role="status"><div class="jav">' + avatar(92) + '</div><div class="jtx"><b class="big">' + (o.all ? '🏆 GAME COMPLETE!' : 'LEVEL ' + (o.k + 1) + ' COMPLETE!') + '</b>' +
      '<small>' + (o.all ? 'Every main level done. Take a bow.' : o.doneN + ' of ' + o.total + ' levels done' + (best >= 3 ? ' · best streak 🔥 ' + best : '')) + '</small><div class="pips">' + pips + '</div></div></div>';
    scene.addEventListener('click', dropScene);
    document.body.appendChild(scene);
    sceneT = setTimeout(dropScene, o.all ? 5200 : 3400);
    if (F.confetti) F.confetti({ ms: o.all ? 2800 : 1300 });
    if (F.sfx) F.sfx(o.all ? 'win' : 'levelup');
    if ((o.all || o.hard) && F.shake) F.shake(stage, { power: 8, ms: 420 });
    if (Date.now() - lastGood > 450) setCombo(combo + 1);   // the answer that finished the level counts for the streak
    lastGood = Date.now();   // the level's own "good" line is part of this moment
  }
  function finish(ov, every) {
    var b = ov && ov.body; if (!b || b.querySelector('.donehero')) return;
    var h = mk('div', 'donehero', '<div class="jav">' + avatar(84) + '</div><div><b>' + (every ? 'Every single level!' : 'You did it!') + '</b><small>' + (best >= 3 ? 'Best streak this visit: 🔥 ' + best + ' in a row' : 'That took real thinking.') + '</small></div>');
    b.insertBefore(h, b.firstChild);
    var F = FX(); if (F.confetti) F.confetti({ ms: 2600, emoji: ['🏆', '⭐'] }); if (F.sfx) F.sfx('win');
  }
  window.SFA_JUICE = { level: level, finish: finish, good: good, combo: function () { return combo; } };
})();
