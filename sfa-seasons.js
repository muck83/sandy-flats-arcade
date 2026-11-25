/* Sandy Flats: the two seasons of films, and the season tabs the student pages share (arcade, Lessons, My Results).
   Season 1 is the original Sandy Flats run: Films 1 to 17 (Zero, the machines, the Undefined) and the three Rewinds.
   Season 2 is Under the Pond (cinema-src/switchback/crawl): Film 0, then one floor per plan step, numbered on from Film 18.
   SFA.seasons.tabs(host, {stats, onPick}) draws the tabs and the chosen season's title card; the page shows that season's list.
   Students land on the season of the game or lesson they opened last (sfa.lastgame, kept by sfa-nav.js), unless they picked a
   tab more recently than that; with no history, the newest season. */
(function () {
  'use strict';
  var SFA = window.SFA = window.SFA || {};
  var LIST = [
    { n: 1, tag: 'Season 1', name: 'Sandy Flats', art: '⚙️', films: '17 films and 3 Rewinds',
      blurb: 'Zero, the machines and the Undefined. Feed a machine, crack its rule, then graph it, find its slope and meet its family.',
      a: '#FFC94A', b: '#FF8C5C', bg: 'linear-gradient(120deg,#2A1808 0%,#5E3410 50%,#B8651C 100%)' },
    { n: 2, tag: 'Season 2', name: 'Under the Pond', art: '🦆', films: 'Film 0, Floors One to Three and Gate A',
      blurb: 'Marcus fell in the duck pond one time too many. Nine floors of tests under Sandy Flats, a Voice that files incident slips, and the only way out is down.',
      a: '#4FC3A1', b: '#9BDCFF', bg: 'linear-gradient(120deg,#04080E 0%,#0C2426 50%,#1C5450 100%)' }
  ];
  function get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  // a film number as students see it: Under the Pond counts on from 18; the Rewinds are 11.5 to 11.7
  function ofFilm(n) { return +n >= 18 ? 2 : 1; }
  // Unit 2 pages (review-u2.html, the game of the Review and Inequalities lessons; check-u2, summative-u2) are Under the Pond too
  function ofGame(idOrFile) { var f = String(idOrFile || ''); if (/-u2\b/.test(f)) return 2; var m = f.match(/g(\d+)/); return m && +m[1] >= 18 ? 2 : 1; }
  function ofLesson(L) { return L && +L.n >= 18 ? 2 : 1; }
  // how a film is named in its own season: Under the Pond's films are floors and gates
  var TAG = { 18: ['Floor', '1'], 19: ['Floor', '2'], 20: ['Floor', '3'], 21: ['Gate', 'A'] };
  function filmTag(n) { return TAG[n] || ['Film', String(n)]; }
  function current() {
    var pick = get('sfa.season'), last = get('sfa.lastgame');
    if (pick && pick.n && (!last || !last.at || (pick.at || 0) >= last.at)) return pick.n;
    if (last && last.file) return ofGame(last.file);
    return LIST[LIST.length - 1].n;
  }
  function remember(n) { try { localStorage.setItem('sfa.season', JSON.stringify({ n: n, at: Date.now() })); } catch (e) { } }

  var css = '.seasons{margin:16px 0 4px}' +
    '.seasons .stabs{display:flex;gap:8px;flex-wrap:wrap}' +
    '.seasons .stab{flex:1 1 220px;display:flex;align-items:center;gap:10px;text-align:left;cursor:pointer;font:inherit;color:var(--ink,#f4efe6);background:var(--panel,#1c1a24);border:2px solid var(--line,rgba(255,255,255,.18));border-radius:14px 14px 0 0;padding:10px 14px;opacity:.72;transition:opacity .15s,border-color .15s}' +
    '.seasons .stab:hover,.seasons .stab:focus-visible{opacity:1;outline:none;border-color:var(--sa)}' +
    '.seasons .stab[aria-selected=true]{opacity:1;border-color:var(--sa);background:var(--sbg);border-bottom-color:transparent}' +
    '.seasons .stab .se{font-size:26px;line-height:1}' +
    '.seasons .stab small{display:block;font:800 11px var(--ui,system-ui);letter-spacing:.14em;text-transform:uppercase;color:var(--sa)}' +
    '.seasons .stab b{display:block;font:400 20px/1.1 var(--display,"Luckiest Guy",sans-serif);letter-spacing:.03em}' +
    '.seasons .stab em{display:block;font:600 12px var(--mono,monospace);font-style:normal;color:var(--muted,#b9b3c4)}' +
    '.seasons .scard{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 18px;align-items:center;padding:18px 20px;border-radius:0 0 16px 16px;border:2px solid var(--sa);border-top-width:4px;background:var(--sbg);color:#fff;animation:sfaSeason .45s both}' +
    '.seasons .scard .k{font:800 12px var(--ui,system-ui);letter-spacing:.18em;text-transform:uppercase;color:var(--sa)}' +
    '.seasons .scard h2{margin:2px 0 0;font:400 clamp(30px,5vw,48px)/1 var(--display,"Luckiest Guy",sans-serif);letter-spacing:.03em;color:#fff;text-shadow:3px 3px 0 rgba(0,0,0,.45)}' +
    '.seasons .scard p{margin:6px 0 0;max-width:62ch;color:rgba(255,255,255,.86)}' +
    '.seasons .scard .sm{margin-top:8px;font:600 13px var(--mono,monospace);color:var(--sb)}' +
    '.seasons .scard .sbar{height:8px;border-radius:4px;background:rgba(255,255,255,.14);overflow:hidden;margin-top:6px;max-width:420px}' +
    '.seasons .scard .sbar i{display:block;height:100%;background:var(--sa)}' +
    '.seasons .scard .art{font-size:clamp(54px,9vw,92px);line-height:1;filter:drop-shadow(4px 4px 0 rgba(0,0,0,.4));transform:rotate(-6deg)}' +
    '.seasons .scard:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(115deg,rgba(255,255,255,.035) 0 14px,transparent 14px 28px);pointer-events:none}' +
    '@keyframes sfaSeason{from{opacity:0;transform:translateY(8px)}}' +
    '@media (prefers-reduced-motion:reduce){.seasons .scard{animation:none}}' +
    '@media (max-width:560px){.seasons .stab{flex-basis:100%;border-radius:12px}.seasons .stab[aria-selected=true]{border-bottom-color:var(--sa)}.seasons .scard{border-radius:16px;margin-top:8px;grid-template-columns:1fr}.seasons .scard .art{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // host: an element to draw into. o.stats(n) -> {done, total, label} for the progress line; o.onPick(n) when a tab is chosen.
  function tabs(host, o) {
    o = o || {}; var cur = current(), wrap = document.createElement('div'), row = document.createElement('div'), card = document.createElement('div'), btns = {};
    wrap.className = 'seasons'; row.className = 'stabs'; row.setAttribute('role', 'tablist'); row.setAttribute('aria-label', 'Seasons');
    card.className = 'scard'; card.setAttribute('role', 'tabpanel'); card.id = 'seasonPanel';
    LIST.forEach(function (S) {
      var s = o.stats ? o.stats(S.n) : null, b = document.createElement('button');
      b.type = 'button'; b.className = 'stab'; b.id = 'seasonTab' + S.n; b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', 'seasonPanel');
      b.style.setProperty('--sa', S.a); b.style.setProperty('--sbg', S.bg);
      b.innerHTML = '<span class="se" aria-hidden="true">' + S.art + '</span><span><small>' + S.tag + '</small><b></b><em></em></span>';
      b.querySelector('b').textContent = S.name; b.querySelector('em').textContent = s && s.total ? s.done + ' of ' + s.total + ' ' + (s.unit || 'done') : S.films;
      b.addEventListener('click', function () { remember(S.n); set(S.n, true); });
      b.addEventListener('keydown', function (e) { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; var i = LIST.indexOf(S), j = (i + (e.key === 'ArrowRight' ? 1 : LIST.length - 1)) % LIST.length; btns[LIST[j].n].focus(); btns[LIST[j].n].click(); });
      btns[S.n] = b; row.appendChild(b);
    });
    function set(n, user) {
      var S = LIST.filter(function (x) { return x.n === n; })[0] || LIST[0], s = o.stats ? o.stats(S.n) : null; cur = S.n;
      LIST.forEach(function (x) { var on = x.n === S.n; btns[x.n].setAttribute('aria-selected', String(on)); btns[x.n].tabIndex = on ? 0 : -1; });
      card.style.setProperty('--sa', S.a); card.style.setProperty('--sb', S.b); card.style.setProperty('--sbg', S.bg); card.setAttribute('aria-labelledby', 'seasonTab' + S.n);
      card.innerHTML = '<div><div class="k"></div><h2></h2><p></p><div class="sm"></div>' + (s && s.total ? '<div class="sbar" aria-hidden="true"><i></i></div>' : '') + '</div><div class="art" aria-hidden="true"></div>';
      card.querySelector('.k').textContent = S.tag + ' · ' + S.films; card.querySelector('h2').textContent = S.name; card.querySelector('p').textContent = S.blurb;
      card.querySelector('.sm').textContent = s ? (s.label || (s.done + ' of ' + s.total + ' ' + (s.unit || 'done'))) : '';
      if (s && s.total) card.querySelector('.sbar i').style.width = Math.round(100 * s.done / s.total) + '%';
      card.querySelector('.art').textContent = S.art;
      card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
      if (o.onPick) o.onPick(S.n, !!user);
    }
    wrap.appendChild(row); wrap.appendChild(card); host.appendChild(wrap);
    set(cur, false);
    return { set: set, cur: function () { return cur; } };
  }
  SFA.seasons = { list: LIST, ofFilm: ofFilm, ofGame: ofGame, ofLesson: ofLesson, filmTag: filmTag, current: current, tabs: tabs };
})();
