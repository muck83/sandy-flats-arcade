/* Sandy Flats Arcade: avatars, the wardrobe and the coin wallet.
   Every student has a little character drawn in SVG: a colour, eyes, a mouth, a hat, an extra, a trail and a name colour.
   A look is 7 base-36 characters (one per part, in that order), e.g. "1203500". Basic parts are free; the rest cost
   coins, and the best ones also need an arcade level.
   Coins are worked out from everything the student has done (arcade game levels and certificates, live-game XP,
   lesson answers, Climb), minus what they've spent. What they own, spend and wear lives in the arcade profile
   (the reserved game 'g99', shared with the arcade level), so it follows them to another computer. */
(function () {
  'use strict';
  var SFA = window.SFA = window.SFA || {};
  if (window.SFA_AVATAR) return;

  var CAT = {
    b: { name: 'Colour', items: [
      { n: 'Sky', c: '#53B7FF' }, { n: 'Mint', c: '#4FD97A' }, { n: 'Coral', c: '#FF7A6B' }, { n: 'Grape', c: '#9B6BFF' },
      { n: 'Sunny', c: '#FFD23F', p: 30 }, { n: 'Bubblegum', c: '#FF8FD1', p: 30 }, { n: 'Ocean', c: '#2E6BD9', p: 50 }, { n: 'Lava', c: '#E8452C', p: 50 },
      { n: 'Galaxy', c: '#5B3FC4', fx: 'galaxy', p: 150, lv: 4 }, { n: 'Solid gold', c: '#FFC107', fx: 'gold', p: 300, lv: 8 }] },
    e: { name: 'Eyes', items: [{ n: 'Round' }, { n: 'Happy' }, { n: 'Sleepy', p: 20 }, { n: 'Big', p: 30 }, { n: 'Star eyes', p: 80, lv: 3 }, { n: 'Heart eyes', p: 80, lv: 5 }] },
    m: { name: 'Mouth', items: [{ n: 'Smile' }, { n: 'Grin' }, { n: 'Oh!', p: 20 }, { n: 'Tongue out', p: 30 }, { n: 'Smirk', p: 30 }] },
    h: { name: 'Hat', items: [{ n: 'No hat' }, { n: 'Cap', p: 40 }, { n: 'Beanie', p: 40 }, { n: 'Party hat', p: 50 }, { n: 'Headphones', p: 60 }, { n: 'Top hat', p: 80 },
      { n: 'Cowboy hat', p: 80 }, { n: 'Wizard hat', p: 120, lv: 3 }, { n: 'Viking helmet', p: 120, lv: 4 }, { n: 'Crown', p: 250, lv: 5 }, { n: 'Halo', p: 250, lv: 7 }] },
    a: { name: 'Extra', items: [{ n: 'Nothing' }, { n: 'Glasses', p: 30 }, { n: 'Bow tie', p: 30 }, { n: 'Scarf', p: 40 }, { n: 'Sunglasses', p: 60 }, { n: 'Medal', p: 100, lv: 4 }, { n: 'Cape', p: 150, lv: 3 }, { n: 'Wings', p: 300, lv: 6 }] },
    t: { name: 'Trail', items: [{ n: 'No trail' }, { n: 'Sparkles', e: '✨', p: 60 }, { n: 'Hearts', e: '💖', p: 60 }, { n: 'Music', e: '🎵', p: 60 }, { n: 'Stars', e: '⭐', p: 100, lv: 2 }, { n: 'Flames', e: '🔥', p: 150, lv: 3 }, { n: 'Rainbow', e: '🌈', p: 250, lv: 6 }] },
    n: { name: 'Name colour', items: [{ n: 'White' }, { n: 'Mint', p: 20 }, { n: 'Pink', p: 20 }, { n: 'Sky', p: 20 }, { n: 'Gold', p: 150, lv: 8 }, { n: 'Rainbow', p: 300, lv: 10 }] }
  };
  var ORDER = ['b', 'e', 'm', 'h', 'a', 't', 'n'];

  /* ---------- looks ---------- */
  function decode(code) {
    var s = String(code || ''), L = {};
    ORDER.forEach(function (k, i) { var v = parseInt(s.charAt(i) || '0', 36); L[k] = isNaN(v) || !CAT[k].items[v] ? 0 : v; });
    return L;
  }
  function encode(L) { return ORDER.map(function (k) { return ((L && L[k]) || 0).toString(36); }).join(''); }
  function hash(t) { var h = 5381; t = String(t); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h; }
  // someone who never visited the wardrobe still gets a look of their own, from the free parts
  function defLook(seed) { var h = hash(seed || 'x'); return encode({ b: h % 4, e: (h >> 3) % 2, m: (h >> 5) % 2, h: 0, a: 0, t: 0, n: 0 }); }

  /* ---------- drawing ---------- */
  var INK = '#141428', uid = 0;
  function eyes(v) {
    var o = '';
    [45, 75].forEach(function (x) {
      var y = 78;
      if (v === 1) o += '<path d="M' + (x - 8) + ' ' + (y + 3) + ' Q' + x + ' ' + (y - 9) + ' ' + (x + 8) + ' ' + (y + 3) + '" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>';
      else if (v === 2) o += '<path d="M' + (x - 9) + ' ' + y + ' A9 9 0 0 0 ' + (x + 9) + ' ' + y + ' Z" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="' + x + '" cy="' + (y + 4) + '" r="3.5" fill="' + INK + '"/>';
      else if (v === 3) o += '<circle cx="' + x + '" cy="' + y + '" r="13" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="' + (x + 1) + '" cy="' + (y + 2) + '" r="7" fill="' + INK + '"/><circle cx="' + (x + 4) + '" cy="' + (y - 2) + '" r="2.6" fill="#fff"/>';
      else if (v === 4) o += '<text x="' + x + '" y="' + (y + 8) + '" font-size="24" text-anchor="middle">⭐</text>';
      else if (v === 5) o += '<text x="' + x + '" y="' + (y + 8) + '" font-size="22" text-anchor="middle">💗</text>';
      else o += '<circle cx="' + x + '" cy="' + y + '" r="10" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="' + (x + 1) + '" cy="' + (y + 1) + '" r="5" fill="' + INK + '"/><circle cx="' + (x + 3) + '" cy="' + (y - 2) + '" r="1.8" fill="#fff"/>';
    });
    return o;
  }
  function mouth(v) {
    var s = ' stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"';
    if (v === 1) return '<path d="M46 100 Q60 122 74 100 Z" fill="' + INK + '"/><path d="M49 101 L71 101 L69 106 L51 106 Z" fill="#fff"/>';
    if (v === 2) return '<ellipse cx="60" cy="107" rx="6" ry="8" fill="' + INK + '"/>';
    if (v === 3) return '<path d="M46 100 Q60 122 74 100 Z" fill="' + INK + '"/><ellipse cx="60" cy="112" rx="7" ry="6" fill="#FF6B8A"/>';
    if (v === 4) return '<path d="M50 107 Q62 111 72 99" fill="none"' + s + '/>';
    return '<path d="M48 102 Q60 115 72 102" fill="none"' + s + '/>';
  }
  function hat(v) {
    var st = ' stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"';
    switch (v) {
      case 1: return '<path d="M30 42 Q30 12 60 12 Q90 12 90 42 Z" fill="#E8452C"' + st + '/><path d="M62 39 L106 43 Q102 51 62 46 Z" fill="#B8321F"' + st + '/><circle cx="60" cy="13" r="4" fill="#B8321F"/>';
      case 2: return '<path d="M28 44 Q28 6 60 6 Q92 6 92 44 Z" fill="#3BAF7A"' + st + '/><rect x="25" y="35" width="70" height="13" rx="6" fill="#2A8A5E"' + st + '/><circle cx="60" cy="5" r="8" fill="#fff"' + st + '/>';
      case 3: return '<path d="M40 38 L60 -10 L80 38 Z" fill="#FF8FD1"' + st + '/><path d="M47 22 L73 22 M53 8 L67 8" stroke="#FFE14D" stroke-width="5"/><circle cx="60" cy="-11" r="6" fill="#FFE14D"' + st + '/>';
      case 4: return '<path d="M20 82 Q20 16 60 16 Q100 16 100 82" fill="none" stroke="#2b2b3a" stroke-width="8"/><rect x="8" y="68" width="18" height="28" rx="7" fill="#FF5B8A"' + st + '/><rect x="94" y="68" width="18" height="28" rx="7" fill="#FF5B8A"' + st + '/>';
      case 5: return '<ellipse cx="60" cy="37" rx="40" ry="8" fill="#222"' + st + '/><rect x="38" y="-8" width="44" height="45" rx="3" fill="#222"' + st + '/><rect x="38" y="23" width="44" height="8" fill="#E8452C"/>';
      case 6: return '<path d="M38 36 Q36 4 50 6 Q60 13 70 6 Q84 4 82 36 Z" fill="#B8763A"' + st + '/><path d="M10 37 Q60 56 110 37 Q104 29 60 34 Q16 29 10 37 Z" fill="#A0642D"' + st + '/>';
      case 7: return '<path d="M30 40 L64 -22 L90 40 Z" fill="#4B3BB8"' + st + '/><ellipse cx="60" cy="40" rx="38" ry="7" fill="#3A2C99"' + st + '/><text x="58" y="18" font-size="14" fill="#FFE14D" text-anchor="middle">✦</text><text x="68" y="-1" font-size="10" fill="#FFE14D" text-anchor="middle">✦</text>';
      case 8: return '<path d="M30 30 Q6 24 8 0 Q20 16 34 21 Z" fill="#F3EFE7"' + st + '/><path d="M90 30 Q114 24 112 0 Q100 16 86 21 Z" fill="#F3EFE7"' + st + '/><path d="M28 44 Q28 10 60 10 Q92 10 92 44 Z" fill="#9AA4B2"' + st + '/><rect x="26" y="36" width="68" height="9" rx="3" fill="#6E7888"' + st + '/>';
      case 9: return '<path d="M32 38 L32 8 L46 22 L60 0 L74 22 L88 8 L88 38 Z" fill="#FFC94A"' + st + '/><circle cx="46" cy="31" r="4" fill="#E8452C"/><circle cx="60" cy="29" r="4.5" fill="#53B7FF"/><circle cx="74" cy="31" r="4" fill="#4FD97A"/>';
      case 10: return '<ellipse cx="60" cy="8" rx="27" ry="7" fill="none" stroke="#FFE14D" stroke-width="6" opacity=".95"/><ellipse cx="60" cy="8" rx="27" ry="7" fill="none" stroke="#fff" stroke-width="2"/>';
    }
    return '';
  }
  function extraBack(v) {
    var st = ' stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"';
    if (v === 6) return '<path d="M30 52 Q10 118 2 152 L118 152 Q110 118 90 52 Z" fill="#C0263A"' + st + '/>';
    if (v === 7) return '<path d="M22 82 Q-20 48 -15 100 Q-4 96 0 114 Q8 100 22 106 Z" fill="#fff"' + st + '/><path d="M98 82 Q140 48 135 100 Q124 96 120 114 Q112 100 98 106 Z" fill="#fff"' + st + '/>';
    return '';
  }
  function extraFront(v) {
    var st = ' stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"';
    switch (v) {
      case 1: return '<circle cx="45" cy="78" r="13" fill="none" stroke="' + INK + '" stroke-width="3.5"/><circle cx="75" cy="78" r="13" fill="none" stroke="' + INK + '" stroke-width="3.5"/><path d="M58 78 L62 78" stroke="' + INK + '" stroke-width="3.5"/>';
      case 2: return '<path d="M60 129 L45 120 L45 138 Z M60 129 L75 120 L75 138 Z" fill="#E8452C"' + st + '/><circle cx="60" cy="129" r="4" fill="#B8321F"' + st + '/>';
      case 3: return '<path d="M22 116 Q60 132 98 116 L98 127 Q60 143 22 127 Z" fill="#E8452C"' + st + '/><path d="M74 128 L85 127 L90 152 L77 152 Z" fill="#E8452C"' + st + '/>';
      case 4: return '<path d="M31 71 H58 V80 Q45 92 31 80 Z" fill="' + INK + '"/><path d="M62 71 H89 V80 Q75 92 62 80 Z" fill="' + INK + '"/><path d="M58 73 L62 73" stroke="' + INK + '" stroke-width="3"/><path d="M36 74 L44 74" stroke="#fff" stroke-width="2" opacity=".6"/>';
      case 5: return '<path d="M52 112 L60 125 L68 112" fill="none" stroke="#2E6BD9" stroke-width="5"/><circle cx="60" cy="130" r="8" fill="#FFC94A"' + st + '/><text x="60" y="134" font-size="9" text-anchor="middle" fill="#7a5600">★</text>';
    }
    return '';
  }
  function trail(v, id) {
    var it = CAT.t.items[v]; if (!v || !it || !it.e) return '';
    var P = [[-8, 128, 0], [126, 118, 0.35], [-4, 64, 0.7], [122, 54, 1.05], [60, -16, 1.4]], o = '';
    P.forEach(function (p) { o += '<text class="avtr" x="' + p[0] + '" y="' + p[1] + '" font-size="18" text-anchor="middle" style="animation-delay:' + p[2] + 's">' + it.e + '</text>'; });
    return o;
  }
  // the whole character, as an SVG string. o.walk: feet and bob animate. o.size: width in px (height follows)
  function svg(code, o) {
    o = o || {};
    var L = decode(code), id = 'av' + (++uid), B = CAT.b.items[L.b], fill = B.c, defs = '', extra = '';
    if (B.fx === 'galaxy') {
      defs = '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b1a6b"/><stop offset=".55" stop-color="#6b3fd6"/><stop offset="1" stop-color="#1fa3c9"/></linearGradient>'; fill = 'url(#' + id + 'g)';
      extra = '<g fill="#fff"><circle cx="34" cy="60" r="1.6"/><circle cx="84" cy="56" r="1.2"/><circle cx="30" cy="112" r="1.4"/><circle cx="92" cy="118" r="1.8"/><circle cx="62" cy="128" r="1.2"/><circle cx="96" cy="88" r="1.1"/></g>';
    } else if (B.fx === 'gold') {
      defs = '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3A0"/><stop offset=".45" stop-color="#FFC107"/><stop offset="1" stop-color="#B8860B"/></linearGradient>'; fill = 'url(#' + id + 'g)';
      extra = '<path d="M34 54 Q40 46 48 44" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".7"/>';
    }
    var w = o.size || 120, st = ' stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"';
    return '<svg class="av' + (o.walk ? ' walk' : '') + '" viewBox="-20 -24 160 184" width="' + w + '" height="' + Math.round(w * 184 / 160) + '" role="img" aria-label="' + (o.label || 'Avatar') + '" xmlns="http://www.w3.org/2000/svg">' +
      (defs ? '<defs>' + defs + '</defs>' : '') +
      '<ellipse cx="60" cy="154" rx="40" ry="6" fill="rgba(0,0,0,.25)"/>' +
      '<g class="avft l"><ellipse cx="44" cy="146" rx="13" ry="7" fill="' + fill + '"' + st + '/></g><g class="avft r"><ellipse cx="76" cy="146" rx="13" ry="7" fill="' + fill + '"' + st + '/></g>' +
      '<g class="avbod">' + extraBack(L.a) +
      '<ellipse cx="15" cy="100" rx="8" ry="13" fill="' + fill + '"' + st + '/><ellipse cx="105" cy="100" rx="8" ry="13" fill="' + fill + '"' + st + '/>' +
      '<path d="M60 30 C95 30 104 60 104 95 C104 128 86 142 60 142 C34 142 16 128 16 95 C16 60 25 30 60 30 Z" fill="' + fill + '"' + st + '/>' + extra +
      '<ellipse cx="34" cy="98" rx="6" ry="4" fill="#FF7AA8" opacity=".45"/><ellipse cx="86" cy="98" rx="6" ry="4" fill="#FF7AA8" opacity=".45"/>' +
      eyes(L.e) + mouth(L.m) + extraFront(L.a) + hat(L.h) + '</g>' + trail(L.t, id) + '</svg>';
  }
  function nameCls(code) { return 'avn avn' + decode(code).n; }

  /* ---------- levels (the same curve as the arcade level in sfa-lesson.js) ---------- */
  var TITLES = ['Rookie', 'Scout', 'Brawler', 'Ranger', 'Knight', 'Champion', 'Hero', 'Captain', 'Legend', 'Mythic'];
  function need(n) { return 75 * n * (n - 1); }
  function level(xp) { var n = 1; while (n < 30 && (xp || 0) >= need(n + 1)) n++; return n; }
  function title(n) { return TITLES[Math.min(n, TITLES.length) - 1] + (n > TITLES.length ? ' ' + '★'.repeat(Math.min(5, n - TITLES.length)) : ''); }

  /* ---------- the profile ---------- */
  var KEY = 'g99';
  function profile() { var P = SFA.store ? SFA.store.get(KEY, null) : null; if (!P || typeof P.xp !== 'number') P = { xp: 0, games: {}, got: {} }; P.own = P.own || {}; P.les = P.les || {}; P.spent = P.spent || 0; return P; }
  function save(P) {
    SFA.store.set(KEY, P);
    try { if (SFA.sync && SFA.sync.report) SFA.sync.report(KEY, P, { levels: [], levelsDone: 0, levelsTotal: 0, coreDone: 0, coreTotal: 0, standard: false, specials: [], assisted: 0, tickets: 0 }); } catch (e) { }
  }
  function myLook(P, seed) { P = P || profile(); return P.look || defLook(seed); }
  function owns(P, k, i) { var it = CAT[k].items[i]; return !!it && (!it.p || !!(P.own || {})[k + i]); }

  /* ---------- the wallet ---------- */
  // lesson answers: this browser's copy, or the synced count per lesson, whichever is bigger
  function lessons(P) {
    var per = {}, n = 0, r = 0, joined = 0;
    for (var i = 1; i <= 40; i++) {
      var m = SFA.store.get('les.L' + i, null), k = 0, kr = 0;
      if (m) Object.keys(m).forEach(function (q) { var a = m[q]; if (/^z|^here$/.test(q) || !a || !a.answer) return; k++; if (a.correct === true || a.correct === 'yes') kr++; });
      per['L' + i] = { n: k, r: kr };
    }
    Object.keys((P && P.les) || {}).forEach(function (l) { var s = P.les[l], c = per[l] || { n: 0, r: 0 }; per[l] = { n: Math.max(c.n, s.n || 0), r: Math.max(c.r, s.r || 0) }; });
    Object.keys(per).forEach(function (l) { if (per[l].n) { joined++; n += per[l].n; r += per[l].r; } });
    return { n: n, r: r, joined: joined };
  }
  // games: summaries from the server ('mine') or this browser's own game saves
  function localGames() {
    var out = [];
    for (var i = 1; i <= 30; i++) { var P = SFA.store.get('g' + i, null); if (P && P.done) out.push({ game: 'g' + i, levelsDone: Object.keys(P.done).length, standard: false, specials: [] }); }
    return out;
  }
  var RATE = { level: 5, std: 40, special: 25, xpPer: 5, answer: 2, right: 1, lesson: 5, secure: 5, session: 2 };
  function earned(d) {
    var g = (d.games || []).filter(function (x) { return /^g([1-9]|[1-8][0-9])$/.test(x.game); }), lv = 0, std = 0, sp = 0;
    g.forEach(function (x) { lv += Number(x.levelsDone) || 0; std += x.standard ? 1 : 0; sp += (x.specials || []).length; });
    var L = d.les || { n: 0, r: 0, joined: 0 }, c = d.climb || null, xp = d.xp || 0;
    var parts = [
      { k: 'games', e: '🕹️', label: 'Arcade games', txt: lv + ' levels, ' + (std + sp) + ' certificates', c: lv * RATE.level + std * RATE.std + sp * RATE.special },
      { k: 'live', e: '⚔️', label: 'Class games', txt: xp + ' XP from Boss Raid, Lane Clash and the Big Board', c: Math.floor(xp / RATE.xpPer) },
      { k: 'les', e: '📚', label: 'Lessons', txt: L.joined + ' lessons, ' + L.n + ' answers (' + L.r + ' right)', c: L.n * RATE.answer + L.r * RATE.right + L.joined * RATE.lesson },
      { k: 'climb', e: '🧗', label: 'Climb', txt: c ? (Number(c.secure) || 0) + ' skills secure, ' + (Number(c.sess) || 0) + ' sessions' : 'not started yet', c: c ? (Number(c.secure) || 0) * RATE.secure + (Number(c.sess) || 0) * RATE.session : 0 }
    ];
    return { parts: parts, total: parts.reduce(function (a, p) { return a + p.c; }, 0) };
  }

  /* ---------- prices ----------
     The prices above are for a class whose middle student (the median) has about 1,000 coins. The teacher's class page
     works out the real median from everyone's work so far and sets a scale; it reaches students in the live state of
     the next lesson (counts zpr, kept as 'teacher.avprice' so signing out doesn't lose it). */
  var STRUT = 25;
  function scale() { var v = +(SFA.store && SFA.store.get('teacher.avprice', 100)) || 100; return Math.max(10, Math.min(1000, v)) / 100; }
  function price(p) { return p ? Math.max(5, Math.round(p * scale() / 5) * 5) : 0; }
  function itemPrice(k, i) { var it = CAT[k].items[i]; return it ? price(it.p) : 0; }

  /* ---------- styles, once ---------- */
  function css() {
    if (document.getElementById('sfaAvCss')) return;
    var s = document.createElement('style'); s.id = 'sfaAvCss';
    s.textContent = '.av{overflow:visible;display:block}.av .avtr{opacity:0;transform-box:fill-box;transform-origin:center;animation:avtr 1.8s ease-out infinite}' +
      '@keyframes avtr{0%{opacity:0;transform:translateY(10px) scale(.5)}30%{opacity:1}100%{opacity:0;transform:translateY(-26px) scale(1.15)}}' +
      '.av.walk .avft.l{animation:avstep .42s ease-in-out infinite alternate}.av.walk .avft.r{animation:avstep .42s ease-in-out infinite alternate-reverse}' +
      '@keyframes avstep{from{transform:translateY(0)}to{transform:translateY(-7px)}}.av.walk .avbod{animation:avbob .21s ease-in-out infinite alternate}@keyframes avbob{to{transform:translateY(-3px)}}' +
      '.avn1{color:#7CF2A2}.avn2{color:#FF8FD1}.avn3{color:#7CC8FF}.avn4{color:#FFD23F;text-shadow:0 0 10px rgba(255,210,63,.6)}' +
      '.avn5{background:linear-gradient(90deg,#FF5B5B,#FFB020,#FFE14D,#4FD97A,#53B7FF,#9B6BFF);-webkit-background-clip:text;background-clip:text;color:transparent}' +
      // the Lane Clash team intro: each name under its avatar, marching in one after another
      '.lcrost span.hasav{display:flex;flex-direction:column;align-items:center;gap:0;padding:0 2px;background:none}.lcrost .lcav{display:block;animation:lcavin .55s cubic-bezier(.2,1.6,.4,1) both}' +
      '.lcrost span.hasav em{font-style:normal;padding:1px 8px;border-radius:99px;background:rgba(255,255,255,.12);font-size:.85em}' +
      '@keyframes lcavin{from{opacity:0;transform:translateY(24px) scale(.4)}to{opacity:1;transform:none}}' +
      '@media (prefers-reduced-motion:reduce){.av .avtr,.av.walk .avft,.av.walk .avbod,.lcrost .lcav{animation:none}.av .avtr{opacity:.8}}';
    (document.head || document.documentElement).appendChild(s);
  }
  if (document.head) css(); else document.addEventListener('DOMContentLoaded', css);

  window.SFA_AVATAR = { CAT: CAT, ORDER: ORDER, decode: decode, encode: encode, defLook: defLook, svg: svg, nameCls: nameCls, level: level, title: title, need: need,
    profile: profile, save: save, myLook: myLook, owns: owns, lessons: lessons, localGames: localGames, earned: earned, RATE: RATE, hash: hash,
    scale: scale, price: price, itemPrice: itemPrice, strutPrice: function () { return price(STRUT); } };
})();
