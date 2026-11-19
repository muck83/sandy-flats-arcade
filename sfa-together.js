/* Sandy Flats lessons: the whole-class side of a live lesson (loaded by sfa-lesson.js before the lesson file).

   🤝 Everybody In + the class mural   every question in a live lesson is a class goal. Each student who is present owns one
                                       piece of a picture; answering snaps it into place with their first name. Passing the
                                       teacher's goal (85% of those present unless changed) pays everyone XP (XP is coins in
                                       the Wardrobe), questions in a row build a streak that pays more, and 100% finishes the
                                       picture for a bonus. Murals are kept in a gallery for the lesson.
   👋 Nudges and activity               the console lists who hasn't answered, with a private buzz for one student or for all
                                       of them, and shows each student as active / quiet / away.
   🙋 Reactions                         got it / not sure / lost, always on students' screens, as a meter on the console.
   🎯 Spotlight spin                    a random student, weighted to those not picked yet, with "phone a friend" and "pass".
   👥 Think-pair-share                  think alone, see your partner's answer, agree on one.
   ⭐ Effort XP                         first tries, second tries after a wrong answer and coming back all earn a little.

   How it travels (no new operations in the results script):
   console → everyone   numbers in live.counts (zei, zmu, znd, zna, zsp, ztp, zgl, zgm) and text in live.x, one JSON string
                        (names on the mural, partners and their answers). An older results script drops live.x: then the
                        mural has no names on students' devices and pairs are told to find a partner themselves.
   student → console    ordinary answer rows whose ids end in x1 (so reports leave them out): zrxx1 reaction, zactx1 away/back,
                        zspinx1 spotlight reply, ztpax1 / ztpfx1 think-pair-share.
   console → class screen (same browser): names and avatars for the spin and the pairs' answers, with each broadcast. */
(function () {
  'use strict';
  var API = window.SFA_LESSON_API; if (!API || !API.tg || !window.SFA) return;
  var SFA = window.SFA, esc = SFA.esc, H = API.H, el = API.el, G = API.tg, MODE = API.MODE, LID = API.LID, S = API.S, TEACHER = API.TEACHER;

  /* ---------------- small helpers ---------------- */
  function hk(sid) { var h = 2166136261, s = String(sid) + '|sfa'; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return [h % 10000, Math.floor(h / 10000) % 10000]; }
  function hs(sid) { var k = hk(sid); return k[0] + '.' + k[1]; }
  function LES() { return API.LES(); }
  function live() { return API.live(); }
  function C() { var L = live(); return L && L.lesson === LID && L.counts ? L.counts : {}; }
  var xRaw = null, xObj = {};
  function X() { var L = live(), r = L && L.lesson === LID && typeof L.x === 'string' ? L.x : ''; if (r !== xRaw) { xRaw = r; try { xObj = r ? JSON.parse(r) : {}; } catch (e) { xObj = {}; } if (!xObj || typeof xObj !== 'object') xObj = {}; } return xObj; }
  function curSlide() { var L = LES(); return L ? L.slides[G.cur()] : null; }
  function curQ() { var s = curSlide(); return s && s.id ? s : null; }
  function nm(name) { return String(API.first(name) || '').replace(/[^A-Za-zÀ-ÿ' -]/g, '').slice(0, 10); }
  function meSid() { return S && S.me ? S.me.sid : ''; }
  function answered(q) { var a = API.mine()[q]; return !!(a && a.answer); }
  function gameOn() { return !!document.querySelector('.clash,.lc,.bb,.br,.wdov') || document.body.classList.contains('clashing'); }
  function buzz() {
    try { if (navigator.vibrate) navigator.vibrate([180, 90, 180]); } catch (e) { }
    try { var A = window.AudioContext || window.webkitAudioContext; if (!A) return; var ac = new A(), o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 660; g.gain.value = .06; o.connect(g); g.connect(ac.destination); o.start(); o.frequency.setValueAtTime(880, ac.currentTime + .12); o.stop(ac.currentTime + .28); setTimeout(function () { ac.close(); }, 600); } catch (e) { }
  }
  function avatar(look, size) { return window.SFA_AVATAR && look ? SFA_AVATAR.svg(look, { size: size }) : '<span style="font-size:' + Math.round(size * .7) + 'px;line-height:1">🙂</span>'; }

  /* ---------------- the pictures: original simplified drawings, 320 by 200 ---------------- */
  function svg(inner) { return '<svg viewBox="0 0 320 200" preserveAspectRatio="none" aria-hidden="true">' + inner + '</svg>'; }
  var stars = '<g fill="#FFF3B0"><circle cx="30" cy="24" r="1.6"/><circle cx="74" cy="48" r="1.2"/><circle cx="108" cy="18" r="1.4"/><circle cx="226" cy="30" r="1.5"/><circle cx="262" cy="58" r="1.2"/><circle cx="296" cy="20" r="1.6"/><circle cx="204" cy="66" r="1"/><circle cx="48" cy="80" r="1"/></g>';
  var PICS = [
    { t: 'Kingdom Centre, Riyadh', svg: svg('<rect width="320" height="200" fill="#1B2A5C"/><rect y="120" width="320" height="80" fill="#2B3F7E"/>' + stars + '<circle cx="262" cy="34" r="16" fill="#FFE9A8"/><circle cx="268" cy="30" r="14" fill="#1B2A5C"/>' +
      '<g fill="#101A3D"><rect x="0" y="150" width="34" height="50"/><rect x="30" y="132" width="26" height="68"/><rect x="60" y="158" width="40" height="42"/><rect x="214" y="140" width="30" height="60"/><rect x="248" y="156" width="36" height="44"/><rect x="286" y="128" width="34" height="72"/></g>' +
      '<g fill="#FFD76A"><rect x="36" y="140" width="4" height="5"/><rect x="46" y="152" width="4" height="5"/><rect x="220" y="150" width="4" height="5"/><rect x="232" y="166" width="4" height="5"/><rect x="294" y="140" width="4" height="5"/><rect x="306" y="156" width="4" height="5"/><rect x="70" y="168" width="4" height="5"/></g>' +
      '<path d="M128 200 L128 46 Q128 26 140 26 L180 26 Q192 26 192 46 L192 200 Z" fill="#9FC4E8"/><path d="M128 200 L128 46 Q128 26 140 26 L160 26 L160 200 Z" fill="#C5DEF5"/>' +
      '<path d="M138 34 Q160 150 182 34 Z" fill="#1B2A5C"/><rect x="134" y="26" width="52" height="8" rx="3" fill="#E9F4FF"/><g stroke="#6F9CC9" stroke-width="1"><path d="M128 120 H192 M128 140 H192 M128 160 H192 M128 180 H192"/></g><rect y="192" width="320" height="8" fill="#C9A45C"/>') },
    { t: 'The Pyramids of Giza', svg: svg('<rect width="320" height="200" fill="#F7B267"/><rect width="320" height="70" fill="#F79D65"/><circle cx="250" cy="52" r="26" fill="#FFE08A"/>' +
      '<path d="M0 150 Q80 130 160 146 T320 140 V200 H0 Z" fill="#E0A458"/><path d="M90 150 L170 40 L250 150 Z" fill="#D9963F"/><path d="M170 40 L250 150 L196 150 Z" fill="#B87A2E"/>' +
      '<path d="M10 156 L66 84 L122 156 Z" fill="#E3A650"/><path d="M66 84 L122 156 L84 156 Z" fill="#C28534"/><path d="M226 158 L270 100 L314 158 Z" fill="#E3A650"/><path d="M270 100 L314 158 L284 158 Z" fill="#C28534"/>' +
      '<path d="M0 166 Q90 150 180 164 T320 160 V200 H0 Z" fill="#F0C27B"/><g fill="#7A4E1D"><ellipse cx="60" cy="178" rx="12" ry="6"/><path d="M68 176 q6 -14 10 -2 z"/><rect x="52" y="180" width="2.5" height="10"/><rect x="64" y="180" width="2.5" height="10"/><circle cx="80" cy="168" r="3"/></g>') },
    { t: 'The Eiffel Tower, Paris', svg: svg('<rect width="320" height="200" fill="#8ECAE6"/><g fill="#fff" opacity=".85"><ellipse cx="60" cy="40" rx="30" ry="10"/><ellipse cx="84" cy="34" rx="20" ry="9"/><ellipse cx="250" cy="60" rx="28" ry="9"/></g>' +
      '<rect y="170" width="320" height="30" fill="#7FB069"/><path d="M0 170 Q40 150 70 170 Z M240 170 Q280 146 320 170 Z" fill="#5B8E4E"/>' +
      '<path d="M108 190 Q146 130 155 22 L165 22 Q174 130 212 190 L192 190 Q168 150 160 112 Q152 150 128 190 Z" fill="#5C4B3B"/><rect x="134" y="140" width="52" height="7" fill="#3E3227"/><rect x="144" y="96" width="32" height="6" fill="#3E3227"/><rect x="158" y="8" width="4" height="16" fill="#3E3227"/>' +
      '<path d="M132 190 Q160 150 188 190 Z" fill="#8ECAE6"/><g stroke="#3E3227" stroke-width="1.5"><path d="M138 147 L150 190 M182 147 L170 190 M150 102 L140 140 M170 102 L180 140"/></g>') },
    { t: 'The Taj Mahal, Agra', svg: svg('<rect width="320" height="200" fill="#F9C6C9"/><rect width="320" height="60" fill="#F7A8B8"/><circle cx="56" cy="46" r="18" fill="#FFE5B4"/>' +
      '<rect y="150" width="320" height="50" fill="#84C5BE"/><rect x="130" y="150" width="60" height="50" fill="#B5E2DC"/><rect y="146" width="320" height="6" fill="#E8DCC8"/>' +
      '<g fill="#FBF7EE" stroke="#D8C9B0" stroke-width="1.5"><rect x="100" y="92" width="120" height="56"/><path d="M132 92 Q132 54 160 44 Q188 54 188 92 Z"/><rect x="60" y="62" width="10" height="86"/><rect x="250" y="62" width="10" height="86"/><rect x="84" y="80" width="8" height="68"/><rect x="228" y="80" width="8" height="68"/><circle cx="116" cy="84" r="10"/><circle cx="204" cy="84" r="10"/></g>' +
      '<g fill="#D8C9B0"><circle cx="65" cy="58" r="6"/><circle cx="255" cy="58" r="6"/><circle cx="88" cy="77" r="5"/><circle cx="232" cy="77" r="5"/><rect x="159" y="30" width="2" height="16"/></g><path d="M146 148 V118 Q160 100 174 118 V148 Z" fill="#C9B79A"/><path d="M110 148 V126 Q118 116 126 126 V148 Z M194 148 V126 Q202 116 210 126 V148 Z" fill="#DDD0B8"/>') },
    { t: 'The Great Wall of China', svg: svg('<rect width="320" height="200" fill="#BDE0FE"/><circle cx="270" cy="40" r="20" fill="#FFF1A8"/><path d="M0 110 L60 60 L110 100 L170 50 L230 96 L280 66 L320 92 V200 H0 Z" fill="#8FB996"/><path d="M0 140 Q80 90 160 130 T320 110 V200 H0 Z" fill="#5E9C69"/><path d="M0 170 Q100 130 200 166 T320 150 V200 H0 Z" fill="#3F7D4E"/>' +
      '<path d="M-6 150 Q60 116 110 132 Q170 150 214 112 Q260 76 326 96" fill="none" stroke="#C9B28A" stroke-width="16"/><path d="M-6 142 Q60 108 110 124 Q170 142 214 104 Q260 68 326 88" fill="none" stroke="#8C7A5B" stroke-width="2" stroke-dasharray="7 5"/>' +
      '<g fill="#B59E78" stroke="#8C7A5B" stroke-width="1.5"><rect x="96" y="102" width="28" height="36"/><rect x="200" y="84" width="28" height="36"/><rect x="286" y="62" width="26" height="34"/></g><g fill="#8C7A5B"><rect x="96" y="96" width="6" height="7"/><rect x="107" y="96" width="6" height="7"/><rect x="118" y="96" width="6" height="7"/><rect x="200" y="78" width="6" height="7"/><rect x="211" y="78" width="6" height="7"/><rect x="222" y="78" width="6" height="7"/><rect x="106" y="116" width="8" height="12"/><rect x="210" y="98" width="8" height="12"/></g>') },
    { t: 'Burj Khalifa, Dubai', svg: svg('<rect width="320" height="200" fill="#FF9E7A"/><rect width="320" height="80" fill="#C96A8C"/><rect width="320" height="36" fill="#6A4C93"/><circle cx="70" cy="118" r="24" fill="#FFD27A"/><rect y="150" width="320" height="50" fill="#3A6EA5"/><path d="M0 160 H320 M20 172 H120 M180 180 H300" stroke="#7FB2E5" stroke-width="2"/>' +
      '<g fill="#2B2D42"><rect x="10" y="118" width="22" height="34"/><rect x="36" y="104" width="18" height="48"/><rect x="92" y="124" width="26" height="28"/><rect x="214" y="110" width="20" height="42"/><rect x="238" y="126" width="30" height="26"/><rect x="274" y="96" width="18" height="56"/><path d="M296 152 V112 Q306 100 316 112 V152 Z"/></g>' +
      '<path d="M140 152 V96 H146 V70 H151 V44 H156 V22 L160 4 L164 22 V44 H169 V70 H174 V96 H180 V152 Z" fill="#DDE6F0"/><path d="M160 4 L164 22 V44 H169 V70 H174 V96 H180 V152 H160 Z" fill="#A9BCD0"/>') },
    { t: 'Sydney Opera House', svg: svg('<rect width="320" height="200" fill="#A8DADC"/><circle cx="52" cy="44" r="20" fill="#FFF3B0"/><rect y="140" width="320" height="60" fill="#1D7EA8"/><path d="M0 152 H90 M120 164 H260 M40 180 H200 M230 150 H320" stroke="#7CC6E3" stroke-width="2"/>' +
      '<path d="M40 140 Q160 30 300 140" fill="none" stroke="#5C6B73" stroke-width="5"/><path d="M70 140 V114 M110 140 V88 M150 140 V78 M190 140 V80 M230 140 V96 M270 140 V118" stroke="#5C6B73" stroke-width="2"/>' +
      '<rect x="70" y="128" width="190" height="14" fill="#C9ADA7"/><g fill="#FDFCF5" stroke="#C8C2B0" stroke-width="1.5"><path d="M84 130 Q88 80 130 64 Q122 100 124 130 Z"/><path d="M118 130 Q124 70 172 50 Q160 96 162 130 Z"/><path d="M158 130 Q166 84 204 70 Q196 104 198 130 Z"/><path d="M252 130 Q246 92 216 80 Q224 108 222 130 Z"/></g>') },
    { t: 'Elephant Rock, AlUla', svg: svg('<rect width="320" height="200" fill="#2E294E"/><rect y="70" width="320" height="60" fill="#8E4A6B"/><rect y="104" width="320" height="40" fill="#E07A5F"/>' + stars + '<path d="M0 150 Q80 138 160 148 T320 144 V200 H0 Z" fill="#D9A066"/>' +
      '<path d="M96 156 Q84 96 120 64 Q160 36 204 52 Q244 66 246 110 Q248 140 240 156 L214 156 Q220 120 204 106 Q186 96 176 116 Q170 136 174 156 Z" fill="#B5651D"/><path d="M120 64 Q160 36 204 52 Q244 66 246 110 Q232 80 196 70 Q156 60 120 64 Z" fill="#CF8A45"/>' +
      '<path d="M96 156 Q84 96 120 64 Q104 100 112 156 Z" fill="#8F4E14"/><circle cx="214" cy="84" r="3" fill="#5A2F0A"/><path d="M0 170 Q100 158 190 170 T320 166 V200 H0 Z" fill="#EBC08A"/><g fill="#5A2F0A"><rect x="270" y="150" width="3" height="16"/><path d="M262 152 q10 -14 20 0 z"/></g>') },
    { t: 'Blocks, in the spirit of De Stijl', svg: svg('<rect width="320" height="200" fill="#F7F3E3"/><rect x="0" y="0" width="120" height="110" fill="#D62828"/><rect x="230" y="0" width="90" height="60" fill="#F7B801"/><rect x="120" y="110" width="110" height="90" fill="#1D4E89"/><rect x="0" y="150" width="60" height="50" fill="#F7B801"/><rect x="270" y="130" width="50" height="70" fill="#D62828"/>' +
      '<g stroke="#111" stroke-width="6"><path d="M120 0 V200 M230 0 V200 M0 110 H320 M0 150 H120 M60 150 V200 M230 60 H320 M270 110 V200 M120 50 H230"/></g>') },
    { t: 'Swirling Night, in the spirit of the post-impressionists', svg: svg('<rect width="320" height="200" fill="#16306B"/><g fill="none" stroke="#5B8DD9" stroke-width="5" stroke-linecap="round"><path d="M20 70 Q70 20 120 60 T220 54 Q260 40 300 70"/><path d="M40 96 Q90 60 140 92 Q180 116 150 84 Q130 66 110 84"/><path d="M180 100 Q230 70 290 100"/></g><g fill="none" stroke="#9CC3F5" stroke-width="2.5"><path d="M30 60 Q70 30 110 54 M200 44 Q250 30 296 58 M60 104 Q100 80 136 100"/></g>' +
      '<g fill="#FFE066"><circle cx="262" cy="36" r="14"/><circle cx="40" cy="30" r="6"/><circle cx="96" cy="26" r="5"/><circle cx="170" cy="28" r="6"/><circle cx="214" cy="80" r="5"/><circle cx="130" cy="112" r="4"/></g><g fill="none" stroke="#FFF3B0" stroke-width="2"><circle cx="262" cy="36" r="20"/><circle cx="40" cy="30" r="10"/><circle cx="170" cy="28" r="10"/><circle cx="96" cy="26" r="9"/></g>' +
      '<path d="M0 150 Q60 120 120 146 T240 140 T320 150 V200 H0 Z" fill="#0E2148"/><path d="M34 200 Q28 120 52 60 Q70 120 66 200 Z" fill="#0A1630"/><g fill="#1B3A6B"><rect x="150" y="150" width="22" height="20"/><rect x="186" y="156" width="26" height="18"/><rect x="230" y="150" width="20" height="24"/><path d="M196 156 L199 130 L202 156 Z"/></g><g fill="#FFD166"><rect x="156" y="156" width="4" height="5"/><rect x="194" y="162" width="4" height="5"/><rect x="238" y="158" width="4" height="5"/></g>') },
    { t: 'The Big Wave, in the spirit of woodblock prints', svg: svg('<rect width="320" height="200" fill="#F3E9D2"/><circle cx="262" cy="44" r="18" fill="#E76F51"/><path d="M196 150 L226 104 L256 150 Z" fill="#8FA9BF"/><path d="M216 120 L226 104 L236 120 Q226 126 216 120 Z" fill="#fff"/>' +
      '<path d="M0 200 V110 Q20 40 96 34 Q150 32 170 70 Q150 56 124 64 Q160 76 158 110 Q140 86 112 92 Q140 110 132 140 Q180 170 320 160 V200 Z" fill="#1D3F72"/><path d="M0 200 V150 Q60 124 130 150 Q200 176 320 166 V200 Z" fill="#2F6690"/>' +
      '<g fill="#fff"><circle cx="100" cy="34" r="7"/><circle cx="116" cy="38" r="6"/><circle cx="132" cy="44" r="6"/><circle cx="148" cy="52" r="6"/><circle cx="162" cy="62" r="5"/><circle cx="172" cy="74" r="4"/><circle cx="84" cy="36" r="6"/><circle cx="130" cy="66" r="4"/><circle cx="150" cy="84" r="4"/><circle cx="124" cy="96" r="4"/></g><g fill="none" stroke="#9CC3F5" stroke-width="2"><path d="M20 120 Q50 70 100 60 M40 150 Q70 110 110 110 M10 176 Q90 150 170 176"/></g>') },
    { t: 'Circles in Squares, in the spirit of early abstract art', svg: svg((function () {
      var cols = ['#E63946', '#F4A261', '#2A9D8F', '#264653', '#E9C46A', '#8E5BD6', '#F28482', '#3A86FF'], o = '', k = 0;
      for (var r = 0; r < 2; r++) for (var c = 0; c < 4; c++, k++) {
        o += '<rect x="' + c * 80 + '" y="' + r * 100 + '" width="80" height="100" fill="' + cols[(k + 3) % 8] + '"/>';
        for (var j = 0; j < 4; j++) o += '<ellipse cx="' + (c * 80 + 40) + '" cy="' + (r * 100 + 50) + '" rx="' + (36 - j * 9) + '" ry="' + (44 - j * 11) + '" fill="' + cols[(k * 3 + j * 5 + 1) % 8] + '"/>';
      }
      return o;
    })()) }
  ];
  function layout(n) {
    var r = n <= 3 ? 1 : n <= 8 ? 2 : n <= 15 ? 3 : n <= 24 ? 4 : n <= 35 ? 5 : 6, out = [], base = Math.floor(n / r), extra = n % r;
    for (var i = 0; i < r; i++) { var c = base + (i < extra ? 1 : 0); for (var j = 0; j < c; j++) out.push({ x: 100 * j / c, y: 100 * i / r, w: 100 / c, h: 100 / r, c: c }); }
    return out;
  }
  // draw (or update) a mural: the picture underneath, one cover per piece; a filled piece lifts its cover and shows a name
  function mural(host, pic, n, filled, names, myIdx) {
    var key = pic + ':' + n;
    if (host._k !== key) {
      host._k = key; host.innerHTML = '<div class="tgpic">' + PICS[pic % PICS.length].svg + '</div>'; host._f = [];
      host._p = layout(n).map(function (g) { var d = H('div', 'tgpc'); d.style.cssText = 'left:' + g.x + '%;top:' + g.y + '%;width:' + g.w + '%;height:' + g.h + '%;--c:' + Math.max(g.c, 3); d.appendChild(H('b')); host.appendChild(d); return d; });
    }
    host._p.forEach(function (d, i) {
      var f = !!filled[i], t = f && names ? names[i] || '' : (i === myIdx && !f ? 'you' : '');
      if (f !== host._f[i]) { host._f[i] = f; d.classList.toggle('in', f); }
      d.classList.toggle('me', i === myIdx && !f);
      if (d.firstChild.textContent !== t) d.firstChild.textContent = t;
    });
  }
  function bits(z, n) { var out = []; for (var i = 0; i < n; i++) out.push(z ? ((z[Math.floor(i / 13)] || 0) >> (i % 13)) & 1 : 0); return out; }
  function thumb(pic, pct) { var d = H('div', 'tgmu'), n = 20, k = Math.round(n * pct / 100), f = []; for (var i = 0; i < n; i++) f.push(i < k ? 1 : 0); if (pct < 100 && k >= n) f[n - 1] = 0; mural(d, pic, n, f, null, -1); return d; }

  /* ---------------- styles ---------------- */
  (function () {
    var c = document.createElement('style'); c.id = 'sfaTogetherCss';
    c.textContent = [
      '.tgmu{position:relative;aspect-ratio:8/5;border-radius:10px;overflow:hidden;background:#0d0b14;container-type:inline-size;box-shadow:0 0 0 2px #FFC94A}',
      '.tgmu .tgpic,.tgmu .tgpic svg{position:absolute;inset:0;width:100%;height:100%;display:block}',
      '.tgpc{position:absolute;box-sizing:border-box;background:#1c1830;border:1px solid #3b3560;display:flex;align-items:flex-end;justify-content:center;transition:background .5s,border-color .5s;overflow:hidden}',
      '.tgpc::before{content:"🧩";position:absolute;inset:0;display:grid;place-items:center;font-size:calc(100cqi / var(--c) / 3.2);opacity:.28;transition:opacity .3s}',
      '.tgpc.in{background:transparent;border-color:rgba(255,255,255,.35);animation:tgsnap .6s cubic-bezier(.2,1.7,.4,1)}.tgpc.in::before{opacity:0}',
      '.tgpc b{position:relative;max-width:100%;font:800 calc(100cqi / var(--c) / 5.2) var(--ui,system-ui);line-height:1.15;padding:0 .35em;margin-bottom:.15em;border-radius:99px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff;background:rgba(15,10,30,.72)}',
      '.tgpc b:empty{display:none}.tgpc.me{border:2px dashed #FFE14D;animation:tgme 1.4s ease-in-out infinite}.tgpc.me b{background:#FFE14D;color:#231800}',
      '@keyframes tgsnap{0%{transform:scale(1.5) rotate(-8deg);opacity:0;z-index:2}60%{opacity:1}100%{transform:none}}',
      '@keyframes tgme{50%{background:#3a2f12}}',
      '.tgstrip{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;width:min(100%,calc((100vh - 150px) * 16 / 9));margin-bottom:6px}body.m-teach .tgstrip{width:100%}.tgstrip:empty{display:none}',
      '@media (min-width:701px){body.m-student.tg-strip .deck,body.m-student.tg-strip .lnav,body.m-student.tg-strip .tgstrip{width:min(100%,calc((100vh - 232px) * 16 / 9))}}@media (max-width:700px){.tgstrip{width:100%}}',
      '.tgei .tgmu{cursor:zoom-in}',
      // the class screen: the slide keeps clear of the mural in the corner
      'body.m-screen.tg-ei .slide{padding-right:25vw}',
      '.tgei{display:flex;flex:1 1 320px;align-items:center;gap:12px;box-sizing:border-box;padding:6px 10px;border-radius:14px;background:#1d1438;border:2px solid #4b3d8f;color:#fff}',
      '.tgei[hidden]{display:none}',
      '.tgei .tgmu{flex:none;width:clamp(96px,22%,190px)}.tgei .tgtx{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}',
      '.tgei .tgh{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font:800 15px var(--ui,system-ui)}.tgei .tgh em{font-style:normal;padding:1px 9px;border-radius:99px;background:#FF7A3D;color:#231800;font-size:13px}',
      '.tgei .tgh small{font:600 12px var(--ui,system-ui);color:#bdb4e6}',
      '.tgbar{position:relative;height:12px;border-radius:6px;background:#0f0a22;overflow:visible}.tgbar i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#5CE0B8,#3BFF8A);transition:width .7s cubic-bezier(.2,.8,.2,1)}',
      '.tgbar u{position:absolute;top:-3px;bottom:-3px;width:3px;border-radius:2px;background:#FFE14D}.tgei.hit .tgbar i{background:linear-gradient(90deg,#FFC94A,#FF7A3D)}',
      '.tgei .tgs{font:600 13.5px/1.3 var(--ui,system-ui);color:#e9e4ff}.tgei.need{border-color:#FFE14D;animation:tgneed 2.4s ease-in-out infinite}.tgei.need .tgs{color:#FFE9A8}',
      '@keyframes tgneed{50%{box-shadow:0 0 0 4px rgba(255,225,77,.25)}}',
      'body.m-screen .tgei{position:fixed;right:1vw;bottom:1vw;z-index:40;width:23vw;flex-direction:column;align-items:stretch;gap:.6vw;padding:.8vw;margin:0;background:rgba(22,14,44,.92);box-shadow:0 10px 40px rgba(0,0,0,.5)}',
      'body.m-screen .tgei .tgmu{width:100%}body.m-screen .tgei .tgh{font-size:1.25vw}body.m-screen .tgei .tgh em{font-size:1.05vw}body.m-screen .tgei .tgs{font-size:1.05vw}body.m-screen .tgei .tgh small{font-size:.95vw}',
      '.tgparty{position:fixed;inset:0;z-index:88;display:grid;place-items:center;background:rgba(10,8,20,.8);padding:16px;animation:tgfade .3s}',
      '.tgparty .card{width:min(92vw,760px);text-align:center;background:#1d1438;border:3px solid #FFE14D;border-radius:22px;padding:16px 18px;color:#fff;animation:tgpop .5s cubic-bezier(.2,1.6,.4,1)}',
      '.tgparty h2{margin:0 0 4px;font:400 clamp(26px,5vw,54px) "Luckiest Guy",system-ui;color:#FFE14D}.tgparty p{margin:6px 0 0;font:700 clamp(15px,2.2vw,24px) var(--ui,system-ui)}.tgparty small{display:block;margin-top:6px;color:#bdb4e6;font:600 clamp(12px,1.5vw,16px) var(--ui,system-ui)}',
      '.tgparty .tgmu{width:min(100%,560px);margin:10px auto 0}.tgparty.out{opacity:0;transition:opacity .4s}',
      '@keyframes tgfade{from{opacity:0}}@keyframes tgpop{from{transform:scale(.6);opacity:0}}',
      '.tgnudge{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:70;width:min(92vw,520px);display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:18px;background:#FFE14D;color:#231800;box-shadow:0 12px 40px rgba(0,0,0,.5);font:700 16px/1.3 var(--ui,system-ui);animation:tgwob .7s cubic-bezier(.2,1.6,.4,1)}',
      '.tgnudge span{font-size:34px}.tgnudge button{margin-left:auto;flex:none}',
      '@keyframes tgwob{0%{transform:translateX(-50%) translateY(-40px) rotate(-3deg);opacity:0}50%{transform:translateX(-50%) rotate(2deg)}100%{transform:translateX(-50%)}}',
      '.tgrx{flex:none;margin-left:auto;display:flex;align-items:center;gap:4px;padding:4px 6px 4px 10px;border-radius:99px;background:#1d1438;border:2px solid #4b3d8f;color:#cfc8f5;font:700 12px var(--ui,system-ui);box-shadow:0 4px 16px rgba(0,0,0,.4)}',
      '.tgrx[hidden]{display:none}.tgrx button{min-width:38px;min-height:38px;border-radius:99px;border:2px solid transparent;background:#2a2050;font-size:19px;cursor:pointer;padding:0 8px;color:#fff;display:flex;align-items:center;gap:4px}',
      '.tgrx button small{font:700 11px var(--ui,system-ui);display:none}.tgrx button.on{border-color:#FFE14D;background:#3a2f12}.tgrx button.on small{display:inline}',
      '@media (max-width:700px){.tgrx>span{display:none}.tgei .tgs{font-size:12.5px}.tgei .tgh{font-size:13.5px}}',
      '.tgban{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:69;max-width:92vw;padding:9px 18px;border-radius:99px;background:#1d1438;border:2px solid #FFE14D;color:#fff;font:700 15px var(--ui,system-ui);box-shadow:0 8px 30px rgba(0,0,0,.5);animation:tgfade .3s}',
      '.tgmodal{position:fixed;inset:0;z-index:72;display:grid;place-items:center;background:rgba(10,8,20,.82);padding:16px}',
      '.tgmodal .card{width:min(94vw,520px);background:#1d1438;border:3px solid #FFE14D;border-radius:22px;padding:18px;color:#fff;text-align:center;animation:tgpop .4s cubic-bezier(.2,1.6,.4,1)}',
      '.tgmodal h2{margin:0 0 6px;font:400 30px "Luckiest Guy",system-ui;color:#FFE14D}.tgmodal p{margin:0 0 12px;font:600 16px/1.35 var(--ui,system-ui)}.tgmodal .col{display:flex;flex-direction:column;gap:8px}.tgmodal .btn{width:100%;justify-content:center}',
      '.tgtps{position:fixed;inset:0;z-index:55;overflow:auto;display:grid;place-items:start center;background:rgba(10,8,20,.9);padding:70px 14px 20px}',
      '.tgtps .card{width:min(96vw,680px);background:#1d1438;border:3px solid #5CE0B8;border-radius:20px;padding:16px 18px;color:#fff;display:flex;flex-direction:column;gap:10px}',
      '.tgtps h2{margin:0;font:400 26px "Luckiest Guy",system-ui;color:#5CE0B8}.tgtps .tq{font:700 18px/1.3 var(--ui,system-ui)}.tgtps textarea{width:100%;box-sizing:border-box;min-height:74px;border-radius:12px;border:2px solid #4b3d8f;background:#0f0a22;color:#fff;font:600 16px var(--ui,system-ui);padding:10px}',
      '.tgtps .bub{border-radius:14px;padding:8px 12px;background:#2a2050;font:600 15px/1.35 var(--ui,system-ui)}.tgtps .bub small{display:block;color:#bdb4e6;font-weight:700;margin-bottom:2px}.tgtps .bub.p{background:#14352a}.tgtps .muted{color:#bdb4e6;font:600 13px var(--ui,system-ui);margin:0}',
      '.tgspin{position:fixed;inset:0;z-index:86;display:grid;place-items:center;background:rgba(10,8,20,.88);padding:2vw;color:#fff;animation:tgfade .3s}',
      '.tgspin .wrap{width:min(96vw,1200px);text-align:center}.tgspin h2{margin:0 0 1vw;font:400 clamp(26px,4.4vw,64px) "Luckiest Guy",system-ui;color:#FFE14D}',
      '.tgspin .grid{display:flex;flex-wrap:wrap;justify-content:center;gap:.6vw}.tgspin .t{display:flex;flex-direction:column;align-items:center;padding:.4vw .7vw;border-radius:14px;border:3px solid transparent;font:800 clamp(11px,1.3vw,18px) var(--ui,system-ui);opacity:.55;transition:opacity .1s,transform .1s}',
      '.tgspin .t.hot{border-color:#FFE14D;background:#3a2f12;opacity:1;transform:scale(1.15)}.tgspin .t.won{border-color:#3BFF8A;background:#14352a;opacity:1;transform:scale(1.3);z-index:2}',
      '.tgspin .who{margin-top:1.4vw;font:400 clamp(30px,6vw,90px) "Luckiest Guy",system-ui;color:#3BFF8A;animation:tgpop .5s cubic-bezier(.2,1.6,.4,1)}.tgspin .sub{font:700 clamp(16px,2.4vw,34px) var(--ui,system-ui);margin-top:.6vw}',
      '.tgspin.mini{inset:auto auto 1.2vw 1.2vw;background:rgba(22,14,44,.94);border:3px solid #3BFF8A;border-radius:18px;padding:.6vw 1.2vw;display:block}.tgspin.mini .grid,.tgspin.mini h2{display:none}.tgspin.mini .who{margin:0;font-size:clamp(20px,2.6vw,40px);animation:none}.tgspin.mini .sub{font-size:clamp(12px,1.3vw,20px);margin:0}',
      '.tgstage{position:fixed;left:50%;top:1.2vw;transform:translateX(-50%);z-index:41;max-width:70vw;padding:.7vw 1.6vw;border-radius:18px;background:rgba(22,14,44,.94);border:3px solid #5CE0B8;color:#fff;text-align:center;font:700 clamp(14px,1.7vw,28px) var(--ui,system-ui)}',
      '.tgstage b{display:block;font:400 clamp(20px,2.6vw,44px) "Luckiest Guy",system-ui;color:#5CE0B8}.tgstage.full{inset:0;transform:none;max-width:none;border-radius:0;border:0;overflow:auto;padding:2vw 3vw;background:rgba(10,8,20,.96)}',
      '.tgstage .cards{display:flex;flex-wrap:wrap;gap:1vw;justify-content:center;margin-top:1.4vw}.tgstage .cards div{max-width:28vw;text-align:left;padding:.8vw 1.2vw;border-radius:14px;background:#2a2050;font:600 clamp(14px,1.6vw,26px)/1.3 var(--ui,system-ui);animation:tgpop .4s both}',
      '.tggal{position:fixed;inset:0;z-index:87;overflow:auto;background:rgba(10,8,20,.95);color:#fff;padding:3vw;text-align:center}.tggal h2{margin:0 0 1.5vw;font:400 clamp(26px,4vw,60px) "Luckiest Guy",system-ui;color:#FFE14D}',
      '.tggrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}.tggal .tggrid{grid-template-columns:repeat(auto-fit,minmax(min(40vw,240px),1fr));gap:1.6vw;max-width:1300px;margin:0 auto}',
      '.tgfr{display:flex;flex-direction:column;gap:4px;font:700 12px/1.25 var(--ui,system-ui);text-align:center}.tgfr .tgmu{box-shadow:0 0 0 2px #4b3d8f}.tgfr.full .tgmu{box-shadow:0 0 0 4px #FFE14D,0 0 18px rgba(255,225,77,.5)}.tgfr small{color:#bdb4e6}.tggal .tgfr{font-size:clamp(12px,1.3vw,20px)}',
      '.tgwho{display:flex;flex-wrap:wrap;gap:4px}.tgwho button{font:700 12px var(--ui,system-ui);padding:3px 9px;border-radius:99px;background:var(--panel2,#2a2050);border:1px solid var(--line,#4b3d8f);color:inherit;cursor:pointer}',
      '.tgwho button:hover{border-color:#FFE14D}.tgwho button.sent{background:#3a2f12;border-color:#FFE14D}.tgwho .dim{opacity:.55;font:600 12px var(--ui,system-ui);padding:3px 9px}',
      '.tgdot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;background:#3BFF8A}.tgdot.quiet{background:#FFC94A}.tgdot.away{background:#E8584C}.tgdot.out{background:#666}',
      '.tgmeter{display:flex;height:14px;border-radius:7px;overflow:hidden;background:var(--panel2,#2a2050)}.tgmeter i{display:block;height:100%;transition:width .5s}.tgmeter .g{background:#3BFF8A}.tgmeter .n{background:#FFC94A}.tgmeter .l{background:#E8584C}',
      '.tgpairs{display:flex;flex-direction:column;gap:6px;max-height:260px;overflow:auto}.tgpairs div{font:600 12.5px/1.35 var(--ui,system-ui);padding:6px 8px;border-radius:8px;background:var(--panel2,#2a2050)}.tgpairs div.ok{border-left:4px solid #3BFF8A}.tgpairs small{display:block;opacity:.75}',
      '@media (prefers-reduced-motion:reduce){.tgpc.in,.tgei.need,.tgpc.me,.tgnudge{animation:none}}'
    ].join('\n');
    document.head.appendChild(c);
  })();

  /* =====================================================================================================
     THE CONSOLE (teacher)
     ===================================================================================================== */
  var T = null, D = { here: [], hereSet: {}, last: {}, away: {}, rx: {}, looks: {}, spin: {}, tpa: {}, tpf: {} }, lastSig = '', xOk = SFA.store.get('teacher.tg.xok', null);
  function con() { return API.console_(); }
  function opt(k, d) { var v = SFA.store.get('teacher.tg.' + k, null); return v == null ? d : v; }
  function TS() {
    var c = con(), run = (c && c.run) || 0;
    if (!T || T.run !== run) {
      var sv = SFA.store.get('teacher.tgs.' + LID, null);
      T = sv && sv.run === run && Date.now() - (sv.at || 0) < 5 * 3600000 ? sv : { run: run, allIn: {}, full: {}, streak: 0, best: 0, hits: 0, fulls: 0, hitSlide: -1, reward: 0, asked: [], picked: {}, gal: {}, order: [], seq: 1 };
      T.nudges = []; T.na = null; T.spin = T.spin || null; T.tps = T.tps || null; T.slide = -1; T.slideAt = Date.now(); T.showGal = false;
    }
    return T;
  }
  function saveT() { if (T) { T.at = Date.now(); SFA.store.set('teacher.tgs.' + LID, T); } }
  function busy() { var c = con(); return !!(c && (c.board || c.clash || c.raid || c.show || c.sumo || c.stand || c.duel)); }
  function ansSet(q) { var f = G.feed(), p = f && f.per[q]; return p ? p.sids : {}; }
  function rightSet(q) { var f = G.feed(), p = f && f.per[q], o = {}; (p ? p.list : []).forEach(function (a) { if (a.correct === 'yes') o[a.sid] = 1; }); return o; }
  function agg() {
    var c = con(); if (!c || !c.data) return;
    var ros = API.rosterIn(), ids = {}, d = { here: [], hereSet: {}, last: {}, away: {}, rx: {}, looks: {}, spin: {}, tpa: {}, tpf: {} };
    ros.forEach(function (r) { ids[r.sid] = r; });
    (c.data.answers || []).forEach(function (a) {
      if (!ids[a.sid] || API.beforeRun(a)) return;
      var t = Date.parse(a.time) || 0, v = String(a.answer), m;
      d.hereSet[a.sid] = 1; if (t > (d.last[a.sid] || 0)) d.last[a.sid] = t;
      if (a.q === 'zactx1') { m = /^ac1;([wb]);/.exec(v); if (m) d.away[a.sid] = m[1] === 'w' ? t : 0; }
      else if (a.q === 'zrxx1') { m = /^rx1;([gnl]);(\d+)/.exec(v); if (m) d.rx[a.sid] = { v: m[1], slide: +m[2] }; }
      else if (a.q === 'zlookx1') { m = /^lk1;([0-9a-z]{1,12})/.exec(v); if (m) d.looks[a.sid] = (window.SFA_AVATAR && SFA_AVATAR.fromWire && SFA_AVATAR.fromWire(v)) || m[1]; }
      else if (a.q === 'zspinx1') { m = /^sp1;(\d+);(go|friend|pass)/.exec(v); if (m) d.spin[a.sid] = { seq: +m[1], r: m[2] }; }
      else if (a.q === 'ztpax1' || a.q === 'ztpfx1') { m = /^tp1;(\d+);([\s\S]*)$/.exec(v); if (m) (a.q === 'ztpax1' ? d.tpa : d.tpf)[a.sid] = { id: +m[1], text: m[2], t: t }; }
    });
    d.here = ros.filter(function (r) { return d.hereSet[r.sid]; });
    D = d; step();
  }
  function isAway(sid) { return !!(D.away[sid] && D.away[sid] >= (D.last[sid] || 0) - 500); }
  // active: answered this question, or busy in the last minute or so. quiet: here, but nothing from them. away: their device left the lesson page.
  function act(sid) {
    var c = con(), t = TS(), s = curQ(), now = Date.now() + ((c && c.skew) || 0);
    if (!D.hereSet[sid]) return 'out';
    if (isAway(sid)) return 'away';
    if (s && ansSet(s.id)[sid]) return 'active';
    var recent = now - (D.last[sid] || 0) < 75000;
    if (s) return Date.now() - t.slideAt < 45000 || recent ? 'active' : 'quiet';
    var asked = t.asked.slice(-2); if (!asked.length || recent) return 'active';
    return asked.every(function (q) { return !ansSet(q)[sid]; }) ? 'quiet' : 'active';
  }
  function missed(sid) { var t = TS(), n = 0; for (var i = t.asked.length - 1; i >= 0; i--) { if (ansSet(t.asked[i])[sid]) break; n++; } return n; }
  function pieces() { var t = TS(); D.here.forEach(function (r) { if (t.order.indexOf(r.sid) < 0) t.order.push(r.sid); }); return t.order.filter(function (sid) { return D.hereSet[sid]; }); }
  function nameOf(sid) { var r = API.rosterIn().filter(function (x) { return x.sid === sid; })[0]; return r ? nm(r.name) : ''; }
  function niceOf(sid) { var r = API.rosterIn().filter(function (x) { return x.sid === sid; })[0]; return r ? API.nice(r.name) : sid; }
  function ei() {
    var s = curQ(), c = con(); if (!s || !c || !c.on || !opt('on', true) || busy()) return null;
    var as = ansSet(s.id), ps = pieces(), n = ps.filter(function (sid) { return as[sid]; }).length, thr = opt('thr', 85);
    return { s: s, ps: ps, as: as, n: n, present: ps.length, need: Math.max(1, Math.ceil(ps.length * thr / 100 - 1e-9)) };
  }
  function picFor(q) { var t = TS(), i = t.asked.indexOf(q); return ((i < 0 ? t.asked.length : i) + (parseInt(LID.slice(1), 10) || 0) * 5) % PICS.length; }
  // once a second and after every batch of answers: goals reached, streaks, the spin's stages, nudges timing out
  function step() {
    var c = con(); if (MODE !== 'teach' || !c || !LES()) return;
    var t = TS(), now = Date.now(), redraw = false, cq = curQ();
    if (t.slide !== G.cur()) {
      if (t.slideQ && c.on && !t.allIn[t.slideQ] && now - t.slideAt > 20000 && t.asked.indexOf(t.slideQ) >= 0 && t.streak) { t.streak = 0; }   // moved on without the class: the streak starts again
      t.slide = G.cur(); t.slideAt = now; t.slideQ = cq ? cq.id : ''; t.na = null; redraw = true;
      if (t.spin && t.spin.state >= 2) t.spin = null;
    }
    if (cq && c.on && !busy() && t.asked.indexOf(cq.id) < 0) t.asked.push(cq.id);
    var e = ei();
    if (e && e.present) {
      t.gal[e.s.id] = [picFor(e.s.id), e.n, e.present];
      if (e.n >= e.need && !t.allIn[e.s.id]) {
        t.allIn[e.s.id] = 1; t.streak++; t.best = Math.max(t.best || 0, t.streak); t.hits++; t.hitSlide = G.cur(); t.reward = 10 + 5 * Math.min(6, t.streak - 1); redraw = true;
        SFA.toast('🤝 Everybody In! ' + e.n + ' of ' + e.present + ' answered' + (t.streak > 1 ? ' · streak ×' + t.streak : '') + ' · +' + t.reward + ' XP each', 4000);
      }
      if (e.n >= e.present && !t.full[e.s.id]) { t.full[e.s.id] = 1; t.fulls++; redraw = true; }
    }
    // nudges show for 20 seconds
    var n0 = t.nudges.length; t.nudges = t.nudges.filter(function (x) { return now - x.at < 20000; }); if (t.nudges.length !== n0) redraw = true;
    if (t.na && now - t.na.at > 20000) { t.na = null; redraw = true; }
    // the spin: 4 seconds of spinning, then it lands; a pass spins again, a friend is picked for "phone a friend"
    var sp = t.spin;
    if (sp) {
      if (sp.state === 1 && now - sp.at > 4200) { sp.state = 2; sp.landed = now; redraw = true; }
      var r = D.spin[sp.sid];
      if (sp.state >= 2 && r && r.seq === sp.seq && sp.resp !== r.r) {
        sp.resp = r.r; sp.respAt = now; redraw = true;
        if (r.r === 'friend') { var f = spinPick([sp.sid], true); if (f) { sp.friend = f; sp.state = 3; } }
      }
      if (sp.resp === 'pass' && now - sp.respAt > 2600) { if ((sp.passes || 0) < 3) { var skip = (sp.skip || []).concat([sp.sid]); t.picked[sp.sid] = Math.max(0, (t.picked[sp.sid] || 1) - 1); spinStart(sp.only, skip, (sp.passes || 0) + 1); } else t.spin = null; redraw = true; }
    }
    var sig = JSON.stringify(countsOut({})) + '|' + x();
    if (sig !== lastSig) { lastSig = sig; saveT(); API.pushLive(); redraw = true; }
    if (redraw) API.consolePanel();
  }
  function countsOut(o) {
    var c = con(), t = TS(); if (!c || !c.on) return o;
    var e = ei();
    if (e && e.present) {
      o.zei = [1, e.present, e.n, e.need, t.streak, t.hits, G.cur(), t.reward || 10, t.hitSlide + 1, t.fulls, picFor(e.s.id), opt('mural', true) ? 1 : 0];
      var z = [], i; for (i = 0; i < Math.ceil(e.present / 13); i++) z.push(0);
      e.ps.forEach(function (sid, k) { if (e.as[sid]) z[Math.floor(k / 13)] |= 1 << (k % 13); });
      o.zmu = z.slice(0, 12);
    } else if (t.hits) o.zei = [0, 0, 0, 0, t.streak, t.hits, G.cur(), t.reward || 10, t.hitSlide + 1, t.fulls, 0, 0];
    if (t.nudges.length) { o.znd = []; t.nudges.slice(-4).forEach(function (x) { o.znd.push(x.k[0], x.k[1], x.seq); }); }
    if (t.na) o.zna = [t.na.seq, t.na.slide];
    if (t.spin) { var a = hk(t.spin.sid), b = t.spin.friend ? hk(t.spin.friend) : [0, 0]; o.zsp = [t.spin.seq, t.spin.state, a[0], a[1], b[0], b[1]]; }
    if (t.tps) o.ztp = [t.tps.id, t.tps.ph, t.tps.slide];
    if (t.showGal) { var gl = galList().slice(-11).reverse(), flat = []; gl.forEach(function (g) { flat.push(g.pic, g.pct); }); o.zgl = [1].concat(flat.slice(0, 10)); if (flat.length > 10) o.zgm = flat.slice(10, 22); }
    return o;
  }
  function galList() { var t = TS(); return t.asked.filter(function (q) { return t.gal[q] && t.gal[q][1] > 0; }).map(function (q) { var g = t.gal[q]; return { q: q, pic: g[0], n: g[1], of: g[2], pct: g[2] ? Math.min(100, Math.floor(100 * g[1] / g[2])) : 0 }; }); }
  // the text that rides along: mural names, the spotlight's name, think-pair-share partners and what they wrote
  function x() {
    var c = con(), t = TS(); if (!c || !c.on) return undefined;
    var o = {}, e = ei();
    if (e && e.present) o.mu = { n: e.ps.map(nameOf), k: e.ps.map(hs) };
    if (t.spin && t.spin.state >= 2) o.sp = { n: nameOf(t.spin.sid), f: t.spin.friend ? nameOf(t.spin.friend) : '' };
    if (t.tps) {
      var tp = { q: t.tps.q };
      if (t.tps.pairs) {
        tp.pairs = t.tps.pairs.map(function (p) { var out = []; p.forEach(function (sid) { out.push(hs(sid), nameOf(sid)); }); return out; });
        tp.a = {}; t.tps.pairs.forEach(function (p) { p.forEach(function (sid) { var a = D.tpa[sid]; if (a && a.id === t.tps.id) tp.a[hs(sid)] = a.text.slice(0, 160); }); });
        tp.f = t.tps.pairs.map(function (p) { var f = pairFinal(p); return f ? f.text.slice(0, 160) : ''; });
      }
      o.tp = tp;
    }
    var s = JSON.stringify(o); return s.length > 2 && s.length <= 12000 ? s : undefined;
  }
  function pairFinal(p) { var t = TS(), best = null; p.forEach(function (sid) { var f = D.tpf[sid]; if (f && t.tps && f.id === t.tps.id && (!best || f.t > best.t)) best = { text: f.text, t: f.t, sid: sid }; }); return best; }
  function pushed(sent, got) { if (typeof sent.x !== 'string') return; var ok = typeof got.x === 'string'; if (ok !== xOk) { xOk = ok; SFA.store.set('teacher.tg.xok', ok); API.consolePanel(); } }

  /* ---- nudges ---- */
  function nudge(sid) { var t = TS(); t.nudges = t.nudges.filter(function (x) { return x.sid !== sid; }); t.nudges.push({ sid: sid, k: hk(sid), seq: t.seq = (t.seq % 9000) + 1, at: Date.now() }); SFA.toast('👋 Nudged ' + nameOf(sid) + '. Only their device buzzes.', 2500); step(); }
  function nudgeAll() { var t = TS(); t.na = { seq: t.seq = (t.seq % 9000) + 1, slide: G.cur(), at: Date.now() }; SFA.toast('👋 Everyone who hasn\'t answered got a nudge on their own device.', 3000); step(); }
  function notYet(sec, s, not) {
    var c = con(); if (!c || !c.data) return false;
    var t = TS(), inNot = not.filter(function (r) { return D.hereSet[r.sid]; }), outNot = not.filter(function (r) { return !D.hereSet[r.sid]; });
    if (!not.length) { if (D.here.length) sec.appendChild(H('p', 'state ok', '✓ Everyone has answered.')); return true; }
    sec.appendChild(H('h3', '', 'Not answered yet (' + inNot.length + (outNot.length ? ' here · ' + outNot.length + ' not in' : '') + ')'));
    if (inNot.length) {
      var row = H('div', 'row'), nb = el('button', { type: 'button', 'class': 'btn small primary', text: t.na ? '👋 Nudged' : '👋 Nudge all ' + inNot.length + ' who haven\'t answered' });
      nb.disabled = !c.on || !!t.na; nb.onclick = nudgeAll; row.appendChild(nb); sec.appendChild(row);
      var w = H('div', 'tgwho');
      var rank = { away: 0, quiet: 1, active: 2 };
      inNot.slice().sort(function (a, b) { return rank[act(a.sid)] - rank[act(b.sid)]; }).forEach(function (r) {
        var st = act(r.sid), sent = t.nudges.some(function (x) { return x.sid === r.sid; }) || !!t.na;
        var b = el('button', { type: 'button', 'class': sent ? 'sent' : '', title: (st === 'away' ? 'Their device has left the lesson page. ' : st === 'quiet' ? 'Here, but nothing from them for a while. ' : '') + 'Tap to buzz only this student\'s device.' });
        b.innerHTML = '<i class="tgdot ' + st + '"></i>' + esc(API.nice(r.name)) + (sent ? ' · 👋 sent' : '');
        b.disabled = !c.on; b.onclick = function () { nudge(r.sid); }; w.appendChild(b);
      });
      sec.appendChild(w);
      sec.appendChild(H('p', 'muted', 'Tap a name to buzz just that student. <i class="tgdot"></i>active <i class="tgdot quiet"></i>quiet <i class="tgdot away"></i>away from the page'));
    }
    if (outNot.length) { var ow = H('div', 'tgwho'); outNot.forEach(function (r) { ow.appendChild(H('span', 'dim', esc(API.nice(r.name)) + ' (not in)')); }); sec.appendChild(ow); }
    return true;
  }

  /* ---- spotlight spin ---- */
  function spinPick(skip, preferAnswered) {
    var t = TS(), s = curQ(), pool = D.here.map(function (r) { return r.sid; }).filter(function (sid) { return skip.indexOf(sid) < 0; });
    var live_ = pool.filter(function (sid) { return !isAway(sid); }); if (live_.length) pool = live_;
    if (preferAnswered && s) { var rs = rightSet(s.id), as = ansSet(s.id), a1 = pool.filter(function (sid) { return rs[sid]; }), a2 = pool.filter(function (sid) { return as[sid]; }); pool = a1.length ? a1 : a2.length ? a2 : pool; }
    if (!pool.length) return null;
    var w = pool.map(function (sid) { return 1 / (1 + 5 * (t.picked[sid] || 0)); }), tot = w.reduce(function (a, b) { return a + b; }, 0), r = Math.random() * tot;
    for (var i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  }
  function spinStart(only, skip, passes) {
    var t = TS(), s = curQ(), sk = skip || [];
    if (only && s) { var as = ansSet(s.id); D.here.forEach(function (r) { if (!as[r.sid] && sk.indexOf(r.sid) < 0) sk = sk.concat([r.sid]); }); }
    var sid = spinPick(sk, false); if (!sid) { SFA.toast('Nobody to pick yet: students appear once they join.'); t.spin = null; return; }
    t.picked[sid] = (t.picked[sid] || 0) + 1;
    t.spin = { seq: t.seq = (t.seq % 9000) + 1, sid: sid, state: 1, at: Date.now(), only: !!only, skip: skip || [], passes: passes || 0 };
    step();
  }

  /* ---- think-pair-share ---- */
  function tpsStart(q) { var t = TS(); t.tps = { id: t.seq = (t.seq % 9000) + 1, ph: 1, q: String(q || '').slice(0, 240), slide: G.cur(), at: Date.now(), pairs: null }; step(); API.consolePanel(); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x_ = a[i]; a[i] = a[j]; a[j] = x_; } return a; }
  function tpsPair() {
    var t = TS(); if (!t.tps) return;
    var all = D.here.map(function (r) { return r.sid; }).filter(function (sid) { return !isAway(sid); });
    // someone who hasn't written yet sits with someone who has, so every pair has something to start from
    var wrote = shuffle(all.filter(function (sid) { return D.tpa[sid] && D.tpa[sid].id === t.tps.id; })), blank = shuffle(all.filter(function (sid) { return wrote.indexOf(sid) < 0; })), pairs = [];
    while (wrote.length && blank.length) pairs.push([wrote.pop(), blank.pop()]);
    var rest = wrote.concat(blank); while (rest.length >= 2) pairs.push([rest.pop(), rest.pop()]);
    if (rest.length) { if (pairs.length) pairs[pairs.length - 1].push(rest.pop()); else pairs.push([rest.pop()]); }
    t.tps.pairs = pairs; t.tps.ph = 2; step(); API.consolePanel();
  }

  /* ---- the console's sections ---- */
  function panel(p, s, running) {
    var c = con(); if (!c || !c.data) return;
    var t = TS(), sec = H('div', 'sect'), ros = D.here;
    // class pulse: reactions and activity
    var g = [], n = [], l = [];
    ros.forEach(function (r) { var x_ = D.rx[r.sid]; if (!x_ || x_.slide !== G.cur()) return; (x_.v === 'g' ? g : x_.v === 'n' ? n : l).push(API.nice(r.name)); });
    var st = { active: [], quiet: [], away: [] }; ros.forEach(function (r) { st[act(r.sid)].push(r); });
    sec.appendChild(H('h3', '', '💬 Class pulse <small>· this slide</small>'));
    var tot = Math.max(1, ros.length), m = H('div', 'tgmeter');
    [['g', g], ['n', n], ['l', l]].forEach(function (x_) { var i = H('i', x_[0]); i.style.width = (100 * x_[1].length / tot) + '%'; m.appendChild(i); });
    sec.appendChild(m);
    sec.appendChild(H('p', 'muted', '👍 ' + g.length + ' got it · 🤔 ' + n.length + ' not sure · 🆘 <b>' + l.length + ' lost</b> · ' + (ros.length - g.length - n.length - l.length) + ' no signal'));
    if (l.length) sec.appendChild(H('p', 'state bad', '🆘 Lost: ' + esc(l.join(', '))));
    if (n.length) sec.appendChild(H('p', 'state', '🤔 Not sure: ' + esc(n.join(', '))));
    sec.appendChild(H('p', 'muted', '<i class="tgdot"></i>' + st.active.length + ' active · <i class="tgdot quiet"></i>' + st.quiet.length + ' quiet · <i class="tgdot away"></i>' + st.away.length + ' away'));
    if (st.quiet.length || st.away.length) {
      var w = H('div', 'tgwho');
      st.away.concat(st.quiet).forEach(function (r) {
        var a = act(r.sid), ms = missed(r.sid), sent = t.nudges.some(function (x_) { return x_.sid === r.sid; });
        var b = el('button', { type: 'button', 'class': sent ? 'sent' : '', title: 'Tap to buzz only this student\'s device' });
        b.innerHTML = '<i class="tgdot ' + a + '"></i>' + esc(API.nice(r.name)) + (a === 'away' ? ' · left the page' : ms > 1 ? ' · missed ' + ms + ' in a row' : '') + (sent ? ' · 👋 sent' : '');
        b.disabled = !c.on; b.onclick = function () { nudge(r.sid); }; w.appendChild(b);
      });
      sec.appendChild(w);
    }
    p.appendChild(sec);
    if (running) return;

    // whole-class moves
    var mv = H('div', 'sect'); mv.appendChild(H('h3', '', '✨ Whole-class moves'));
    var e = ei();
    if (e) mv.appendChild(H('p', 'muted', '🤝 Everybody In: <b>' + e.n + ' of ' + e.present + '</b> in · goal ' + e.need + (t.streak ? ' · 🔥 streak ×' + t.streak : '') + (t.allIn[e.s.id] ? ' · ✓ goal reached' : '') + (t.full[e.s.id] ? ' · 🖼️ picture complete' : '') + ' · <i>' + esc(PICS[picFor(e.s.id)].t) + '</i>'));
    else if (!opt('on', true)) mv.appendChild(H('p', 'muted', '🤝 Everybody In is switched off (Settings).'));
    var row = H('div', 'row');
    if (!t.spin) {
      row.appendChild(el('button', { type: 'button', 'class': 'btn small', text: '🎯 Spotlight spin', title: 'Picks a student who is here, favouring those not picked yet. They can phone a friend or pass.', onclick: function () { spinStart(false); } }));
      if (s.id && Object.keys(ansSet(s.id)).length) row.appendChild(el('button', { type: 'button', 'class': 'btn small', text: '🎯 Spin: someone who answered', onclick: function () { spinStart(true); } }));
    }
    if (!t.tps) {
      var dq = s.q ? String(s.q).replace(/[*_]/g, '') : '';
      row.appendChild(el('button', { type: 'button', 'class': 'btn small', text: '👥 Think-pair-share', title: dq ? 'Uses this slide\'s question' : 'You type the question', onclick: function () { var q = dq || window.prompt('The question for think-pair-share:', ''); if (q) tpsStart(q); } }));
      if (dq) row.appendChild(el('button', { type: 'button', 'class': 'btn small', text: '✏️ …with my own question', onclick: function () { var q = window.prompt('The question for think-pair-share:', ''); if (q) tpsStart(q); } }));
    }
    var gl = galList();
    if (gl.length) row.appendChild(el('button', { type: 'button', 'class': 'btn small' + (t.showGal ? ' good' : ''), text: t.showGal ? '🖼️ Gallery is showing: hide it' : '🖼️ Show the gallery (' + gl.length + ')', onclick: function () { t.showGal = !t.showGal; step(); API.consolePanel(); } }));
    [].forEach.call(row.children, function (b) { if (!c.on) b.disabled = true; });
    mv.appendChild(row);
    if (!c.on) mv.appendChild(H('p', 'muted', 'Go live to use these.'));
    if (t.spin) {
      var sp = t.spin, who = niceOf(sp.sid);
      mv.appendChild(H('p', 'state ok', '🎯 <b>' + esc(who) + '</b>' + (sp.state === 1 ? ' (the class screen is still spinning…)' : sp.resp === 'go' ? ' said: 👍 I\'ll have a go' : sp.resp === 'friend' ? ' phoned a friend: <b>' + esc(sp.friend ? niceOf(sp.friend) : 'nobody free') + '</b>' : sp.resp === 'pass' ? ' passed. Spinning again…' : ' has the choice on their device: have a go, phone a friend, or pass.')));
      var r2 = H('div', 'row');
      r2.appendChild(el('button', { type: 'button', 'class': 'btn small', text: '🎯 Spin again', onclick: function () { spinStart(sp.only, [sp.sid]); } }));
      r2.appendChild(el('button', { type: 'button', 'class': 'btn small', text: 'Clear the spotlight', onclick: function () { t.spin = null; step(); API.consolePanel(); } }));
      mv.appendChild(r2);
    }
    if (t.tps) {
      var tp = t.tps, wrote = ros.filter(function (r) { return D.tpa[r.sid] && D.tpa[r.sid].id === tp.id; });
      mv.appendChild(H('p', 'state ok', '👥 <b>Think-pair-share</b> · ' + (tp.ph === 1 ? 'Think: ' + wrote.length + ' of ' + ros.length + ' have written' : tp.ph === 2 ? 'Pair: ' + tp.pairs.filter(function (p_) { return pairFinal(p_); }).length + ' of ' + tp.pairs.length + ' pairs have agreed' : 'Share: the pairs\' answers are on the class screen (no names)')));
      mv.appendChild(H('p', 'muted', '“' + esc(tp.q) + '”'));
      var r3 = H('div', 'row');
      if (tp.ph === 1) r3.appendChild(el('button', { type: 'button', 'class': 'btn small primary', text: '👥 Pair them up ▶', onclick: tpsPair }));
      if (tp.ph === 2) r3.appendChild(el('button', { type: 'button', 'class': 'btn small primary', text: '📣 Share ▶', onclick: function () { tp.ph = 3; step(); API.consolePanel(); } }));
      r3.appendChild(el('button', { type: 'button', 'class': 'btn small', text: 'End', onclick: function () { t.tps = null; step(); API.consolePanel(); } }));
      mv.appendChild(r3);
      var list = H('div', 'tgpairs');
      if (tp.ph === 1) { var no = ros.filter(function (r) { return wrote.indexOf(r) < 0; }); if (no.length) mv.appendChild(H('p', 'muted', 'Still thinking: ' + esc(no.map(function (r) { return API.nice(r.name); }).join(', ')))); wrote.forEach(function (r) { list.appendChild(H('div', '', '<b>' + esc(API.nice(r.name)) + '</b>: ' + esc(D.tpa[r.sid].text))); }); }
      else tp.pairs.forEach(function (p_) {
        var f = pairFinal(p_);
        list.appendChild(H('div', f ? 'ok' : '', '<b>' + esc(p_.map(niceOf).join(' + ')) + '</b>: ' + (f ? esc(f.text) : '<i>talking…</i>') + '<small>' + p_.map(function (sid) { var a = D.tpa[sid]; return esc(nameOf(sid)) + ': ' + (a && a.id === tp.id ? esc(a.text.slice(0, 120)) : '—'); }).join(' · ') + '</small>'));
      });
      if (list.children.length) mv.appendChild(list);
      if (tp.ph >= 2 && xOk === false) mv.appendChild(H('p', 'state bad', 'The results script is an older version, so students can\'t see their partner on their device: they are told to pair up with someone near them. Paste the new Code.gs to switch that on (see APPS-SCRIPT-UPDATE-PROMPT.txt).'));
    }
    p.appendChild(mv);
    if (gl.length) {
      var fd = API.fold('tggal', '🖼️ Class gallery · ' + gl.filter(function (x_) { return x_.pct >= 100; }).length + ' of ' + gl.length + ' complete', false), gg = H('div', 'tggrid');
      gl.forEach(function (x_) { gg.appendChild(frame(x_.pic, x_.pct)); }); fd.appendChild(gg); p.appendChild(fd);
    }
  }
  function frame(pic, pct) { var f = H('div', 'tgfr' + (pct >= 100 ? ' full' : '')); f.appendChild(thumb(pic, pct)); f.appendChild(H('span', '', esc(PICS[pic % PICS.length].t))); f.appendChild(H('small', '', pct >= 100 ? '⭐ Complete: everybody in' : pct + '% of the class')); return f; }
  function settings(st) {
    var lk = el('label', { style: 'display:flex;gap:8px;align-items:center' }), cb = el('input', { type: 'checkbox' }); cb.checked = opt('on', true);
    cb.onchange = function () { SFA.store.set('teacher.tg.on', cb.checked); step(); API.consolePanel(); };
    lk.appendChild(cb); lk.appendChild(document.createTextNode('🤝 Everybody In: a class goal and mural on every question')); st.appendChild(lk);
    var row = H('div', 'row'), sl = el('select', { 'aria-label': 'Everybody In goal' });
    [60, 70, 80, 85, 90, 100].forEach(function (v) { var o = el('option', { value: String(v), text: 'Goal: ' + v + '% of students who are here' + (v === 100 ? ' (everyone)' : '') }); if (v === opt('thr', 85)) o.selected = true; sl.appendChild(o); });
    sl.onchange = function () { SFA.store.set('teacher.tg.thr', +sl.value); step(); API.consolePanel(); };
    row.appendChild(sl); st.appendChild(row);
    var mk = el('label', { style: 'display:flex;gap:8px;align-items:center' }), mb = el('input', { type: 'checkbox' }); mb.checked = opt('mural', true);
    mb.onchange = function () { SFA.store.set('teacher.tg.mural', mb.checked); step(); };
    mk.appendChild(mb); mk.appendChild(document.createTextNode('Show the mural (first names on pieces that are in; empty pieces stay anonymous)')); st.appendChild(mk);
    if (xOk === false) st.appendChild(H('p', 'muted', 'Older results script: the mural shows names on the class screen only, and think-pair-share partners are not shown on devices, until you paste the new Code.gs.'));
  }
  function screenData() {
    if (MODE !== 'teach' || !con()) return null;
    var t = TS(), o = {};
    if (t.spin) {
      var pool = D.here.slice(0, 36).map(function (r) { return { n: nm(r.name), look: D.looks[r.sid] || (window.SFA_AVATAR ? SFA_AVATAR.defLook(r.sid) : ''), me: r.sid === t.spin.sid }; });
      o.spin = { seq: t.spin.seq, state: t.spin.state, pool: pool, pick: pool.map(function (x_) { return x_.me; }).indexOf(true), name: nameOf(t.spin.sid), resp: t.spin.resp || '', friend: t.spin.friend ? { n: nameOf(t.spin.friend), look: D.looks[t.spin.friend] || '' } : null, passes: t.spin.passes || 0 };
    }
    if (t.tps) {
      var tp = t.tps, wrote = D.here.filter(function (r) { return D.tpa[r.sid] && D.tpa[r.sid].id === tp.id; }).length;
      o.tps = { id: tp.id, ph: tp.ph, q: tp.q, wrote: wrote, present: D.here.length, pairs: tp.pairs ? tp.pairs.length : 0, agreed: tp.pairs ? tp.pairs.filter(function (p) { return pairFinal(p); }).length : 0, finals: tp.ph === 3 && tp.pairs ? tp.pairs.map(pairFinal).filter(Boolean).map(function (f) { return f.text.slice(0, 220); }) : [] };
    }
    if (t.showGal) o.gal = galList();
    return o;
  }

  /* =====================================================================================================
     STUDENTS' DEVICES AND THE CLASS SCREEN
     ===================================================================================================== */
  var Lc = null;   // this student's (or this screen's) memory for the lesson run
  function LS() {
    var run = G.liveRun();
    if (!Lc || Lc.run !== run) { var sv = SFA.store.get('les.tg.' + LID, null); Lc = sv && sv.run === run ? sv : { run: run, hits: null, fulls: 0, got: {}, owed: {}, nseq: 0, na: 0, sp: 0, spAns: 0, cb: 0, rx: null }; Lc.got = Lc.got || {}; Lc.owed = Lc.owed || {}; }
    return Lc;
  }
  function saveL() { if (Lc && MODE === 'student') SFA.store.set('les.tg.' + LID, Lc); }
  function xp(key, amt, msg) {
    if (MODE !== 'student' || !meSid()) return 0;
    var L = LS(); if (L.got[key]) return 0; L.got[key] = 1; saveL();
    var got = API.hero.add('e', LID + 'r' + Math.floor(L.run / 1000), amt, false);
    if (got && msg) SFA.toast(msg + ' · +' + got + ' XP', 2600);
    return got;
  }
  // effort counts: a first try, another try after a wrong answer, and coming back after a nudge or time away
  function onAnswer(s, correct, was) {
    if (MODE !== 'student' || !s || /^z|^here$/.test(s.id) || !API.isLive()) return;
    var L = LS(), id = s.id;
    if (!was || !was.answer) xp('a:' + id, 3);
    else if (was.correct === false) { xp('r:' + id, 2); if (correct === true) xp('rc:' + id, 3, '💪 You stuck with it'); }
    if (L.cb && Date.now() - L.cb < 6 * 60000) { L.cb = 0; xp('cb:' + id, 5, '🙌 Thanks for jumping back in'); }
    if (L.owed[id]) { var amt = L.owed[id]; delete L.owed[id]; xp('owe:' + id, amt, '🤝 Your piece is in: you collected your share'); }
    saveL(); setTimeout(drawEI, 30);
  }

  /* ---- the meter and the mural ---- */
  var eiEl = null, stripEl = null;
  // students and the console: a strip above the slide holds the mural with its meter, and the reaction buttons
  function strip() { if (!stripEl) { var deck = document.querySelector('.deck'); stripEl = H('div', 'tgstrip'); deck.parentNode.insertBefore(stripEl, deck); } return stripEl; }
  // the slide gives up a little height while the strip is showing, so the Next button stays on the screen
  function stripFit() { if (!stripEl) return; var on = [].some.call(stripEl.children, function (c) { return !c.hidden; }); document.body.classList.toggle('tg-strip', on); }
  function drawEI() {
    var z = C().zei, s = curQ(), deck = document.querySelector('.deck');
    var on = !!(z && z[0] === 1 && s && z[6] === G.cur() && (MODE !== 'student' || API.isLive()) && !gameOn());
    document.body.classList.toggle('tg-ei', on && !!(z && z[11] === 1));
    if (!on) { if (eiEl) eiEl.hidden = true; stripFit(); return; }
    if (!eiEl) {
      eiEl = H('div', 'tgei'); eiEl.setAttribute('role', 'status');
      eiEl.innerHTML = '<div class="tgmu"></div><div class="tgtx"><div class="tgh"></div><div class="tgbar"><i></i><u></u></div><div class="tgs"></div></div>';
      if (MODE === 'screen' || !deck) document.body.appendChild(eiEl); else strip().insertBefore(eiEl, strip().firstChild);
      eiEl.querySelector('.tgmu').onclick = function () { party('🧩 The class mural', 'Every answer places a piece. The picture is finished when everyone here is in.', '', true); };
    }
    eiEl.hidden = false; stripFit();
    var present = z[1], n = z[2], need = z[3], streak = z[4], pic = z[10], showM = z[11] === 1, mu = X().mu, names = mu && mu.n && mu.n.length === present ? mu.n : null;
    var filled = bits(C().zmu, present), myIdx = -1, mineIn = MODE === 'student' && answered(s.id);
    if (MODE === 'student' && mu && mu.k && mu.k.length === present) { myIdx = mu.k.indexOf(hs(meSid())); if (myIdx >= 0 && mineIn) filled[myIdx] = 1; }
    if (myIdx < 0 && mineIn && filled.filter(Boolean).length < Math.min(present, n)) { /* counts are ahead of the bits for a moment */ }
    var shown = Math.max(n, filled.filter(Boolean).length), reached = shown >= need, full = shown >= present;
    var mh = eiEl.querySelector('.tgmu'); mh.style.display = showM ? '' : 'none'; if (showM) mural(mh, pic, present, filled, names, myIdx);
    eiEl.querySelector('.tgh').innerHTML = '<span>' + (full ? '🖼️ Picture complete: everybody in!' : reached ? '🎉 Everybody In!' : '🤝 Everybody In') + '</span><small>' + shown + ' of ' + present + ' in' + (reached ? '' : ' · goal ' + need) + '</small>' + (streak > 1 ? '<em>🔥 streak ×' + streak + '</em>' : '');
    eiEl.querySelector('.tgbar i').style.width = (present ? 100 * shown / present : 0) + '%';
    var tick = eiEl.querySelector('.tgbar u'); tick.style.left = 'calc(' + (present ? 100 * need / present : 100) + '% - 2px)'; tick.style.display = need < present ? '' : 'none';
    var left = need - shown, msg;
    if (MODE === 'student') {
      msg = mineIn ? (full ? 'Every piece is in. ' + esc(PICS[pic % PICS.length].t) + '.' : reached ? 'Your piece is in ✓ · ' + (present - shown) + ' more to finish the picture' : 'Your piece is in ✓ · ' + left + ' more to reach the class goal')
        : (reached ? 'The class made the goal. <b>Add your answer</b> to place your piece and collect your share.' : '<b>Your class needs your piece.</b> Any answer counts, a guess is fine. ' + left + ' more to reach the goal.');
    } else msg = full ? esc(PICS[pic % PICS.length].t) : reached ? (present - shown) + ' more to finish the picture' : left + ' more answer' + (left === 1 ? '' : 's') + ' to reach the class goal';
    eiEl.querySelector('.tgs').innerHTML = msg;
    eiEl.className = 'tgei' + (reached ? ' hit' : '') + (MODE === 'student' && !mineIn ? ' need' : '');
  }
  function party(title, sub, small, quiet) {
    var old = document.querySelector('.tgparty'); if (old) old.remove();
    var z = C().zei || [], o = H('div', 'tgparty'), card = H('div', 'card'); o.appendChild(card);
    card.appendChild(H('h2', '', title)); if (sub) card.appendChild(H('p', '', sub));
    if (z[0] === 1 && z[11] === 1) { var m = H('div', 'tgmu'), mu = X().mu; card.appendChild(m); mural(m, z[10], z[1], bits(C().zmu, z[1]), mu && mu.n && mu.n.length === z[1] ? mu.n : null, -1); }
    if (small) card.appendChild(H('small', '', small));
    o.onclick = function () { o.remove(); };
    document.body.appendChild(o); if (quiet) return;
    API.confetti(); setTimeout(function () { o.classList.add('out'); }, 5200); setTimeout(function () { o.remove(); }, 5700);
  }
  function hits() {
    var z = C().zei; if (!z || (MODE === 'student' && !API.isLive())) return;
    var L = LS(); if (L.hits == null) { L.hits = z[5]; L.fulls = z[9]; saveL(); return; }
    var hit = z[5] > L.hits, full = z[9] > (L.fulls || 0); if (!hit && !full) return;
    L.hits = z[5]; L.fulls = z[9];
    var sl = LES().slides[z[8] - 1], amt = z[7], streak = z[4], pic = PICS[(z[10] || 0) % PICS.length].t, sub = '', small = '';
    if (MODE === 'student') {
      var mineIn = sl && sl.id && answered(sl.id);
      if (hit) { if (mineIn) { var got = xp('hit:' + z[5], amt); sub = (streak > 1 ? '🔥 Streak ×' + streak + ' · ' : '') + '+' + (got || amt) + ' XP for everyone who is in'; } else if (sl && sl.id) { L.owed[sl.id] = amt; sub = 'Add your answer to collect your <b>+' + amt + ' XP</b> share'; } }
      if (full) { var g2 = xp('full:' + z[9], 10); small = '🖼️ ' + esc(pic) + ' is complete: every single piece. +' + (g2 || 10) + ' XP bonus'; }
    } else { if (hit) sub = (streak > 1 ? '🔥 Streak ×' + streak + ' · ' : '') + '+' + amt + ' XP each'; if (full) small = '🖼️ ' + esc(pic) + ' is complete: every single piece.'; }
    saveL();
    party(full ? '🖼️ Masterpiece!' : '🎉 Everybody In!', sub || (full ? 'Everyone here answered.' : ''), small || (hit && !full ? 'Fill every piece to finish the picture.' : ''));
  }

  /* ---- nudges (private) ---- */
  function nudgeFx() {
    var L = LS(); L.cb = Date.now(); saveL();
    var old = document.querySelector('.tgnudge'); if (old) old.remove();
    var me = S && S.me ? API.first(S.me.name) : '', b = H('div', 'tgnudge', '<span>👋</span><div><b>' + esc(me ? me + ', your' : 'Your') + ' class needs your answer.</b><br>Have a go. A guess is fine, and you can change it.</div>');
    var ok = el('button', { type: 'button', 'class': 'btn small', text: 'OK' }); ok.onclick = function () { b.remove(); var f = document.querySelector('.slide input:not([disabled]),.slide textarea'); if (f) try { f.focus(); } catch (e) { } }; b.appendChild(ok);
    document.body.appendChild(b); buzz(); setTimeout(function () { b.remove(); }, 9000);
  }
  function nudges() {
    if (!API.isLive() || !meSid()) return;
    var c = C(), L = LS(), k = hk(meSid()), s = curQ(), i;
    if (c.znd) for (i = 0; i + 2 < c.znd.length + 0 && i < c.znd.length; i += 3) if (c.znd[i] === k[0] && c.znd[i + 1] === k[1] && c.znd[i + 2] !== L.nseq) { L.nseq = c.znd[i + 2]; saveL(); nudgeFx(); }
    if (c.zna && c.zna[0] !== L.na) { L.na = c.zna[0]; saveL(); if (s && c.zna[1] === G.cur() && !answered(s.id)) nudgeFx(); }
  }

  /* ---- away and back ---- */
  var awayT = null, awaySent = false, lastTouch = Date.now();
  function watchAway() {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') { clearTimeout(awayT); awayT = setTimeout(function () { if (document.visibilityState === 'hidden' && API.isLive() && meSid() && !awaySent) { awaySent = true; G.sendZ('zactx1', 'ac1;w;' + G.cur() + ';' + Date.now() % 100000); } }, 8000); }
      else { clearTimeout(awayT); if (awaySent) { awaySent = false; var L = LS(); L.cb = Date.now(); saveL(); G.sendZ('zactx1', 'ac1;b;' + G.cur() + ';' + Date.now() % 100000); } }
    });
    ['pointerdown', 'keydown'].forEach(function (ev) { document.addEventListener(ev, function () { var now = Date.now(), s = curQ(); if (now - lastTouch > 90000 && s && !answered(s.id) && API.isLive()) { var L = LS(); L.cb = now; saveL(); } lastTouch = now; }, { passive: true, capture: true }); });
  }

  /* ---- reactions ---- */
  var rxEl = null, rxAt = 0;
  function drawRx() {
    var on = MODE === 'student' && API.isLive() && !!meSid() && !document.body.classList.contains('gated');
    if (!on) { if (rxEl) rxEl.hidden = true; stripFit(); return; }
    var L = LS(), cur = L.rx && L.rx.slide === G.cur() ? L.rx.v : '';
    if (!rxEl) {
      rxEl = H('div', 'tgrx'); rxEl.appendChild(H('span', '', 'How is it going?'));
      [['g', '👍', 'Got it'], ['n', '🤔', 'Not sure'], ['l', '🆘', 'I\'m lost']].forEach(function (r) {
        var b = el('button', { type: 'button', title: r[2], 'aria-label': r[2] }); b.innerHTML = r[1] + '<small>' + r[2] + '</small>'; b._v = r[0];
        b.onclick = function () {
          if (Date.now() - rxAt < 1500) return; rxAt = Date.now();
          var L2 = LS(); L2.rx = { slide: G.cur(), v: r[0] }; saveL(); G.sendZ('zrxx1', 'rx1;' + r[0] + ';' + G.cur());
          SFA.toast(r[0] === 'g' ? '👍 Nice. ' + TEACHER + ' can see it.' : r[0] === 'n' ? '🤔 Thanks for saying so. Only ' + TEACHER + ' sees this.' : '🆘 Thanks for saying so. Only ' + TEACHER + ' sees this, and help is coming.', 2600);
          drawRx();
        };
        rxEl.appendChild(b);
      });
      if (document.querySelector('.deck')) strip().appendChild(rxEl); else document.body.appendChild(rxEl);
    }
    rxEl.hidden = false; rxEl._k = cur; stripFit();
    [].forEach.call(rxEl.querySelectorAll('button'), function (b) { b.classList.toggle('on', b._v === cur); });
  }

  /* ---- spotlight spin: students ---- */
  var banEl = null, banKey = '', banT = null;
  function banner(key, html, ms) {
    if (key === banKey) return; banKey = key; clearTimeout(banT);
    if (banEl) banEl.remove(); banEl = null; if (!html) return;
    banEl = H('div', 'tgban', html); document.body.appendChild(banEl);
    if (ms) banT = setTimeout(function () { if (banEl) banEl.remove(); banEl = null; }, ms);
  }
  var spModal = null;
  function spinStudent() {
    var z = C().zsp, L = LS(), k = meSid() ? hk(meSid()) : null;
    if (!z || !z[1] || !API.isLive()) { banner('', ''); if (spModal) { spModal.remove(); spModal = null; } return; }
    var seq = z[0], st = z[1], me = k && z[2] === k[0] && z[3] === k[1], friend = k && st === 3 && z[4] === k[0] && z[5] === k[1], sp = X().sp || {};
    if (st === 1) { banner('s1:' + seq, '🎯 Spotlight spin… watch the class screen'); return; }
    if (me) {
      banner('me:' + seq, '');
      if (L.spAns === seq) { if (spModal) { spModal.remove(); spModal = null; } if (st === 3) banner('mf:' + seq, '📞 ' + esc(sp.f || 'A friend') + ' is helping you out', 8000); return; }
      if (spModal) return;
      if (L.sp !== seq) { L.sp = seq; saveL(); buzz(); }
      spModal = H('div', 'tgmodal'); var card = H('div', 'card'); spModal.appendChild(card);
      card.appendChild(H('h2', '', '🎯 The spotlight is yours'));
      card.appendChild(H('p', '', TEACHER + ' would love to hear your thinking. It doesn\'t have to be right: say what you tried. You choose:'));
      var col = H('div', 'col'); card.appendChild(col);
      [['go', '👍 I\'ll have a go', 'primary'], ['friend', '📞 Phone a friend', ''], ['pass', '↩️ Pass this time', '']].forEach(function (o) {
        var b = el('button', { type: 'button', 'class': 'btn ' + o[2], text: o[1] });
        b.onclick = function () { var L2 = LS(); L2.spAns = seq; saveL(); G.sendZ('zspinx1', 'sp1;' + seq + ';' + o[0]); if (o[0] === 'go') xp('spin:' + seq, 5, '🎤 Brave'); spModal.remove(); spModal = null; };
        col.appendChild(b);
      });
      document.body.appendChild(spModal); return;
    }
    if (spModal) { spModal.remove(); spModal = null; }
    if (friend) { if (L.sp !== seq + 0.5) { L.sp = seq + 0.5; saveL(); buzz(); } banner('fr:' + seq, '📞 <b>' + esc(sp.n || 'A classmate') + ' phoned a friend, and it\'s you!</b> Help them out.', 12000); return; }
    banner('o:' + seq + ':' + st, '🎯 The spotlight is on <b>' + esc(sp.n || 'a classmate') + '</b>' + (st === 3 && sp.f ? ', with help from <b>' + esc(sp.f) + '</b>' : '') + '. Listen in.', 7000);
  }

  /* ---- think-pair-share: students ---- */
  var tpEl = null, tpSig = '';
  function tpsStudent() {
    var z = C().ztp, on = !!(z && z[1] && API.isLive() && meSid() && !document.body.classList.contains('gated'));
    if (!on) { if (tpEl) { tpEl.remove(); tpEl = null; tpSig = ''; } return; }
    var id = z[0], ph = z[1], tp = X().tp || {}, key = hs(meSid()), mineA = API.mine().ztpax1, mineF = API.mine().ztpfx1;
    var myA = mineA && mineA.answer.indexOf('tp1;' + id + ';') === 0 ? mineA.answer.slice(('tp1;' + id + ';').length) : '';
    var myF = mineF && mineF.answer.indexOf('tp1;' + id + ';') === 0 ? mineF.answer.slice(('tp1;' + id + ';').length) : '';
    var pair = null, pi = -1; (tp.pairs || []).forEach(function (p, i) { for (var j = 0; j < p.length; j += 2) if (p[j] === key) { pair = p; pi = i; } });
    var partners = []; if (pair) for (var j = 0; j < pair.length; j += 2) if (pair[j] !== key) partners.push({ n: pair[j + 1] || 'your partner', a: (tp.a || {})[pair[j]] || '' });
    var pairF = pi >= 0 && tp.f ? tp.f[pi] || '' : '';
    var sig = [id, ph, myA, myF, pairF, JSON.stringify(partners), ph === 3 ? JSON.stringify(tp.f || []) : ''].join('|');
    if (sig === tpSig && tpEl) return; tpSig = sig;
    var draft = tpEl && tpEl.querySelector('textarea') ? tpEl.querySelector('textarea').value : null, had = tpEl && tpEl._ph === ph;
    if (tpEl) tpEl.remove();
    tpEl = H('div', 'tgtps'); tpEl._ph = ph; var card = H('div', 'card'); tpEl.appendChild(card);
    card.appendChild(H('h2', '', ph === 1 ? '💭 Think · on your own' : ph === 2 ? '👥 Pair · agree on one answer' : '📣 Share'));
    card.appendChild(H('div', 'tq', tp.q ? esc(tp.q) : 'The question ' + esc(TEACHER) + ' is showing.'));
    function box(ph_, val, label, send) {
      var ta = el('textarea', { 'aria-label': label, placeholder: label, maxlength: '300' }); ta.value = had && draft != null ? draft : val;
      var b = el('button', { type: 'button', 'class': 'btn primary', text: val ? 'Send again' : 'Send' }), row = H('div', 'row');
      b.onclick = function () { var v = ta.value.trim(); if (!v) { SFA.toast('Type something first. A few words is enough.'); return ta.focus(); } send(v); tpSig = ''; tpsStudent(); };
      card.appendChild(ta); row.appendChild(b); card.appendChild(row);
    }
    if (ph === 1) {
      box(1, myA, 'What do you think? A few words is enough.', function (v) { G.sendZ('ztpax1', 'tp1;' + id + ';' + v); xp('tpa:' + id, 4); });
      card.appendChild(H('p', 'muted', myA ? '✓ Sent. You can still change it. Next you\'ll see a partner\'s answer.' : 'Only your partner and ' + esc(TEACHER) + ' will see this. No wrong answers here.'));
    } else if (ph === 2) {
      if (partners.length) {
        card.appendChild(H('p', 'muted', 'Your partner' + (partners.length > 1 ? 's' : '') + ': <b>' + esc(partners.map(function (p) { return p.n; }).join(' and ')) + '</b>. Find them, compare, then send the answer you both agree on.'));
        card.appendChild(H('div', 'bub', '<small>You wrote</small>' + (myA ? esc(myA) : '<i>nothing yet. Tell your partner what you think.</i>')));
        partners.forEach(function (p) { card.appendChild(H('div', 'bub p', '<small>' + esc(p.n) + ' wrote</small>' + (p.a ? esc(p.a) : '<i>nothing yet. Ask them what they think.</i>'))); });
      } else {
        card.appendChild(H('p', 'muted', 'Pair up with someone near you. Compare what you each think, then send the answer you both agree on.'));
        if (myA) card.appendChild(H('div', 'bub', '<small>You wrote</small>' + esc(myA)));
      }
      if (pairF && pairF !== myF) card.appendChild(H('div', 'bub p', '<small>Your pair\'s answer so far</small>' + esc(pairF)));
      box(2, myF || pairF, 'The answer you both agree on', function (v) { G.sendZ('ztpfx1', 'tp1;' + id + ';' + v); xp('tpf:' + id, 4, '🤝 Agreed'); });
      if (myF) card.appendChild(H('p', 'muted', '✓ Sent for your pair. Either of you can change it.'));
    } else {
      card.appendChild(H('p', 'muted', 'Pairs\' answers are on the class screen. Whose thinking is close to yours? Whose is different?'));
      if (myF || pairF) card.appendChild(H('div', 'bub', '<small>Your pair said</small>' + esc(myF || pairF)));
      (tp.f || []).forEach(function (f, i) { if (f && i !== pi) card.appendChild(H('div', 'bub p', '<small>Another pair</small>' + esc(f))); });
    }
    document.body.appendChild(tpEl);
  }

  /* ---- the class screen: spin, think-pair-share, gallery ---- */
  var scr = null, spinEl = null, spinSeq = 0, spinIv = null, stageEl = null, galEl = null, galSig = '';
  function fromConsole(d) { scr = d || null; }
  function spinScreen() {
    var sp = scr && scr.spin;
    if (!sp) { if (spinEl) { spinEl.remove(); spinEl = null; clearInterval(spinIv); } spinSeq = 0; return; }
    if (!spinEl || spinSeq !== sp.seq) {
      if (spinEl) spinEl.remove(); clearInterval(spinIv); spinSeq = sp.seq;
      spinEl = H('div', 'tgspin'); var wrap = H('div', 'wrap'); spinEl.appendChild(wrap);
      wrap.appendChild(H('h2', '', '🎯 Spotlight spin'));
      var grid = H('div', 'grid'), sz = sp.pool.length > 24 ? 54 : sp.pool.length > 12 ? 72 : 96;
      sp.pool.forEach(function (p) { grid.appendChild(H('div', 't', avatar(p.look, sz) + '<span>' + esc(p.n) + '</span>')); });
      wrap.appendChild(grid); wrap.appendChild(H('div', 'who')); wrap.appendChild(H('div', 'sub'));
      document.body.appendChild(spinEl); spinEl._st = 0;
      var tiles = grid.children, hot = -1;
      spinIv = setInterval(function () { if (!spinEl || spinEl._st >= 2) return clearInterval(spinIv); if (hot >= 0 && tiles[hot]) tiles[hot].classList.remove('hot'); hot = Math.floor(Math.random() * tiles.length); if (tiles[hot]) tiles[hot].classList.add('hot'); }, 130);
    }
    var key = sp.state + ':' + sp.resp + ':' + (sp.friend ? sp.friend.n : '');
    if (spinEl._key === key) return; spinEl._key = key;
    if (sp.state >= 2) {
      spinEl._st = 2; clearInterval(spinIv);
      [].forEach.call(spinEl.querySelectorAll('.t'), function (t, i) { t.classList.remove('hot'); t.classList.toggle('won', i === sp.pick); });
      spinEl.querySelector('.who').textContent = sp.name + '!';
      spinEl.querySelector('.sub').innerHTML = sp.resp === 'go' ? '👍 is having a go. Listen in.' : sp.resp === 'pass' ? '↩️ passes this time. Spinning again…' : sp.state === 3 && sp.friend ? '📞 phones a friend: <b>' + esc(sp.friend.n) + '</b>' : 'Have a go, phone a friend, or pass: your choice.';
      if (!spinEl._land) { spinEl._land = 1; API.confetti(); setTimeout(function () { if (spinEl && spinSeq === sp.seq) spinEl.classList.add('mini'); }, 6500); }
    }
  }
  function stageScreen() {
    var tp = scr && scr.tps;
    if (!tp) { if (stageEl) { stageEl.remove(); stageEl = null; } return; }
    if (!stageEl) { stageEl = H('div', 'tgstage'); document.body.appendChild(stageEl); }
    var sig = JSON.stringify(tp); if (stageEl._s === sig) return; stageEl._s = sig;
    stageEl.className = 'tgstage' + (tp.ph === 3 ? ' full' : '');
    stageEl.innerHTML = '<b>' + (tp.ph === 1 ? '💭 Think · on your own' : tp.ph === 2 ? '👥 Pair · agree on one answer' : '📣 Share · what the pairs agreed') + '</b>' + esc(tp.q) +
      '<br><small>' + (tp.ph === 1 ? tp.wrote + ' of ' + tp.present + ' have written something' : tp.ph === 2 ? tp.agreed + ' of ' + tp.pairs + ' pairs have agreed' : tp.finals.length + (tp.finals.length === 1 ? ' answer' : ' answers')) + '</small>';
    if (tp.ph === 3) { var cards = H('div', 'cards'); tp.finals.forEach(function (f, i) { var c = H('div', '', esc(f)); c.style.animationDelay = (i * .12) + 's'; cards.appendChild(c); }); stageEl.appendChild(cards); }
  }
  function gallery() {
    var list = null;
    if (scr && scr.gal) list = scr.gal.map(function (g) { return [g.pic, g.pct]; });
    else if (MODE === 'student' && API.isLive() && C().zgl && C().zgl[0] === 1) { list = []; var f = C().zgl.slice(1).concat(C().zgm || []); for (var i = 0; i + 1 < f.length; i += 2) list.push([f[i], f[i + 1]]); list.reverse(); }
    var sig = list ? JSON.stringify(list) : '';
    if (sig === galSig) return; galSig = sig;
    if (galEl) { galEl.remove(); galEl = null; } if (!list) return;
    galEl = H('div', 'tggal'); galEl.appendChild(H('h2', '', '🖼️ Our class gallery'));
    var g = H('div', 'tggrid'); list.forEach(function (x_) { g.appendChild(frame(x_[0], x_[1])); }); galEl.appendChild(g);
    var done = list.filter(function (x_) { return x_[1] >= 100; }).length;
    galEl.appendChild(H('p', '', done ? '⭐ ' + done + ' of ' + list.length + ' finished with every single student in.' : 'A picture is finished when every student here has answered.'));
    document.body.appendChild(galEl);
  }

  /* ---- everything that follows the live state ---- */
  function sync() {
    if (!LES()) return;
    try {
      drawEI();
      if (MODE === 'teach') return;
      hits(); gallery();
      if (MODE === 'student') { nudges(); spinStudent(); tpsStudent(); drawRx(); }
      if (MODE === 'screen') { spinScreen(); stageScreen(); }
    } catch (e) { if (window.console) console.warn('together', e); }
  }
  if (MODE === 'teach') API.every(function () { try { step(); drawEI(); } catch (e) { if (window.console) console.warn('together', e); } }, 1000);
  else setInterval(sync, 1000);
  if (MODE === 'student') watchAway();

  window.SFA_TOGETHER = { sync: sync, agg: agg, counts: countsOut, x: x, pushed: pushed, onAnswer: onAnswer, xp: xp, notYet: notYet, panel: panel, settings: settings, screenData: screenData, fromConsole: fromConsole, pics: PICS, _state: function () { return { T: T, D: D, L: Lc, scr: scr }; } };
})();
