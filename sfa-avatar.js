/* Sandy Flats Arcade: avatars, the wardrobe and the coin wallet.
   Every student has a little character drawn in SVG: a colour, eyes, a mouth, a hat, an extra, a trail, a name colour,
   a character type (cat, bunny, robot...) and a pet.
   A look is 9 base-36 characters (one per part, in that order), e.g. "120350030". Older 7-character looks still work:
   a missing part counts as 0 (the plain blob, no pet). Basic parts are free; the rest cost coins, and the best ones
   also need an arcade level. New items only ever go on the END of a list, because looks and purchases use positions.
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
      { n: 'Galaxy', c: '#5B3FC4', fx: 'galaxy', p: 150, lv: 4 }, { n: 'Solid gold', c: '#FFC107', fx: 'gold', p: 300, lv: 8 },
      { n: 'Neon lime', c: '#B6FF2E', p: 40 }, { n: 'Lilac', c: '#C8A2FF', p: 40 }, { n: 'Peach', c: '#FFB38A', p: 30 }, { n: 'Teal', c: '#1FC7B6', p: 30 },
      { n: 'Shadow', c: '#4A4A6A', p: 60 }, { n: 'Camo', c: '#6B8E4E', fx: 'camo', p: 100, lv: 2 }, { n: 'Cotton candy', c: '#FFB3E1', fx: 'candy', p: 100, lv: 2 },
      { n: 'Slime', c: '#7FE04A', fx: 'slime', p: 120, lv: 3 }, { n: 'Sunset', c: '#FF8A5B', fx: 'sunset', p: 150, lv: 3 },
      { n: 'Holographic', c: '#D9B8FF', fx: 'holo', p: 250, lv: 6 }, { n: 'Rainbow', c: '#FFE14D', fx: 'rainbow', p: 300, lv: 9 }] },
    e: { name: 'Eyes', items: [{ n: 'Round' }, { n: 'Happy' }, { n: 'Sleepy', p: 20 }, { n: 'Big', p: 30 }, { n: 'Star eyes', p: 80, lv: 3 }, { n: 'Heart eyes', p: 80, lv: 5 },
      { n: 'Wink', p: 30 }, { n: 'Side-eye', p: 40 }, { n: 'Chill', p: 40 }, { n: 'Anime sparkle', p: 80, lv: 2 }, { n: 'Dizzy', p: 60 }, { n: 'Laser eyes', p: 200, lv: 7 }, { n: 'Happy tears', p: 60 }] },
    m: { name: 'Mouth', items: [{ n: 'Smile' }, { n: 'Grin' }, { n: 'Oh!', p: 20 }, { n: 'Tongue out', p: 30 }, { n: 'Smirk', p: 30 },
      { n: 'Braces', p: 30 }, { n: 'Fangs', p: 40 }, { n: 'Cat mouth :3', p: 30 }, { n: 'Bubblegum', p: 60, lv: 2 }, { n: 'Moustache', p: 50 }, { n: 'Laughing', p: 40 }, { n: 'Nervous', p: 20 }, { n: 'Bunny teeth', p: 30 }] },
    h: { name: 'Hat', items: [{ n: 'No hat' }, { n: 'Cap', p: 40 }, { n: 'Beanie', p: 40 }, { n: 'Party hat', p: 50 }, { n: 'Headphones', p: 60 }, { n: 'Top hat', p: 80 },
      { n: 'Cowboy hat', p: 80 }, { n: 'Wizard hat', p: 120, lv: 3 }, { n: 'Viking helmet', p: 120, lv: 4 }, { n: 'Crown', p: 250, lv: 5 }, { n: 'Halo', p: 250, lv: 7 },
      { n: 'Backwards cap', p: 40 }, { n: 'Bucket hat', p: 50 }, { n: 'Frog hat', p: 80 }, { n: 'Cat-ear headphones', p: 90, lv: 2 }, { n: 'Chef hat', p: 60 },
      { n: 'Graduation cap', p: 100, lv: 3 }, { n: 'Pirate hat', p: 90, lv: 2 }, { n: 'Astronaut helmet', p: 200, lv: 6 }, { n: 'Flower crown', p: 70 },
      { n: 'Headband', p: 30 }, { n: 'Mushroom hat', p: 80, lv: 2 }, { n: 'Propeller cap', p: 60 }] },
    a: { name: 'Extra', items: [{ n: 'Nothing' }, { n: 'Glasses', p: 30 }, { n: 'Bow tie', p: 30 }, { n: 'Scarf', p: 40 }, { n: 'Sunglasses', p: 60 }, { n: 'Medal', p: 100, lv: 4 }, { n: 'Cape', p: 150, lv: 3 }, { n: 'Wings', p: 300, lv: 6 },
      { n: 'Gaming headset', p: 80, lv: 2 }, { n: 'Pi chain', p: 60 }, { n: 'Boba tea', p: 50 }, { n: 'Skateboard', p: 100, lv: 2 }, { n: 'Basketball', p: 60 },
      { n: 'Game controller', p: 70 }, { n: 'Backpack', p: 50 }, { n: 'Phone', p: 50 }, { n: 'Guitar', p: 150, lv: 3 }, { n: 'Earbuds', p: 40 }, { n: 'Ice cream', p: 40 }] },
    t: { name: 'Trail', items: [{ n: 'No trail' }, { n: 'Sparkles', e: '✨', p: 60 }, { n: 'Hearts', e: '💖', p: 60 }, { n: 'Music', e: '🎵', p: 60 }, { n: 'Stars', e: '⭐', p: 100, lv: 2 }, { n: 'Flames', e: '🔥', p: 150, lv: 3 }, { n: 'Rainbow', e: '🌈', p: 250, lv: 6 },
      { n: 'Lightning', e: '⚡', p: 60 }, { n: 'Bubbles', e: '🫧', p: 60 }, { n: 'Confetti', e: '🎉', p: 80 }, { n: 'Sakura', e: '🌸', p: 80 }, { n: 'Snow', e: '❄️', p: 80 },
      { n: 'Butterflies', e: '🦋', p: 100, lv: 2 }, { n: 'Dead funny', e: '💀', p: 100, lv: 2 }, { n: 'Moai', e: '🗿', p: 120, lv: 3 }, { n: 'Pixel aliens', e: '👾', p: 120, lv: 3 },
      { n: 'Money rain', e: '💸', p: 150, lv: 4 }, { n: 'Galaxy', e: '🌌', p: 200, lv: 5 }, { n: 'Diamonds', e: '💎', p: 250, lv: 7 }] },
    n: { name: 'Name colour', items: [{ n: 'White' }, { n: 'Mint', p: 20 }, { n: 'Pink', p: 20 }, { n: 'Sky', p: 20 }, { n: 'Gold', p: 150, lv: 8 }, { n: 'Rainbow', p: 300, lv: 10 },
      { n: 'Neon', p: 40 }, { n: 'Lilac', p: 20 }, { n: 'Orange', p: 20 }, { n: 'Toxic green', p: 100, lv: 2 }, { n: 'Fire', p: 120, lv: 3 }, { n: 'Ice', p: 120, lv: 3 },
      { n: 'Galaxy', p: 200, lv: 5 }, { n: 'Holographic', p: 300, lv: 9 }] },
    // the character under everything: 0 is the original blob, the rest add ears, horns, tails and so on
    k: { name: 'Character', items: [{ n: 'Blob' }, { n: 'Cat' }, { n: 'Bear' }, { n: 'Bunny' }, { n: 'Frog', p: 40 }, { n: 'Penguin', p: 50 }, { n: 'Fox', p: 60 },
      { n: 'Capybara', p: 80 }, { n: 'Axolotl', p: 100, lv: 2 }, { n: 'Robot', p: 120, lv: 3 }, { n: 'Ghost', p: 120, lv: 3 }, { n: 'Alien', p: 150, lv: 4 },
      { n: 'Dino', p: 150, lv: 4 }, { n: 'Unicorn', p: 200, lv: 6 }, { n: 'Dragon', p: 300, lv: 8 }] },
    // a little friend by the avatar's feet
    p: { name: 'Pet', items: [{ n: 'No pet' }, { n: 'Kitten', e: '🐱', p: 40 }, { n: 'Puppy', e: '🐶', p: 40 }, { n: 'Hamster', e: '🐹', p: 50 }, { n: 'Froggy', e: '🐸', p: 50 },
      { n: 'Duck', e: '🦆', p: 60 }, { n: 'Turtle', e: '🐢', p: 60 }, { n: 'Penguin', e: '🐧', p: 80 }, { n: 'Otter', e: '🦦', p: 100, lv: 2 }, { n: 'Octopus', e: '🐙', p: 120, lv: 3 },
      { n: 'Fox cub', e: '🦊', p: 120, lv: 3 }, { n: 'Panda', e: '🐼', p: 150, lv: 4 }, { n: 'T. rex', e: '🦖', p: 200, lv: 5 }, { n: 'Dragon', e: '🐉', p: 300, lv: 8 }] }
  };
  var ORDER = ['b', 'e', 'm', 'h', 'a', 't', 'n', 'k', 'p'];

  /* ---------- looks ---------- */
  function decode(code) {
    var s = String(code || ''), L = {};
    ORDER.forEach(function (k, i) { var v = parseInt(s.charAt(i) || '0', 36); L[k] = isNaN(v) || !CAT[k].items[v] ? 0 : v; });
    return L;
  }
  function encode(L) { return ORDER.map(function (k) { return ((L && L[k]) || 0).toString(36); }).join(''); }
  function hash(t) { var h = 5381; t = String(t); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h; }
  // someone who never visited the wardrobe still gets a look of their own, from the free parts
  function defLook(seed) {
    var h = hash(seed || 'x'), free = [];
    CAT.k.items.forEach(function (it, i) { if (!it.p) free.push(i); });
    // >>> (not >>) keeps the numbers positive, so a big hash can't make a "-1" part
    return encode({ b: h % 4, e: (h >>> 3) % 2, m: (h >>> 5) % 2, h: 0, a: 0, t: 0, n: 0, k: free[(h >>> 7) % free.length], p: 0 });
  }

  /* ---------- drawing ---------- */
  var INK = '#141428', uid = 0;
  var BODY = 'M60 30 C95 30 104 60 104 95 C104 128 86 142 60 142 C34 142 16 128 16 95 C16 60 25 30 60 30 Z';
  // the ghost: the same head, with a wavy hem instead of feet
  var GHOST = 'M60 30 C95 30 104 60 104 95 L104 140 Q97 152 89 141 Q82 152 74.5 141 Q67 152 60 141 Q53 152 45.5 141 Q38 152 31 141 Q23 152 16 140 L16 95 C16 60 25 30 60 30 Z';
  // draw something on the left, then the same thing mirrored on the right. f(X, s): X maps an x, s is 1 (left) or -1 (right)
  function both(f) { return f(function (x) { return x; }, 1) + f(function (x) { return 120 - x; }, -1); }
  function ink(w) { return ' stroke="' + INK + '" stroke-width="' + w + '" stroke-linejoin="round"'; }

  function eyes(v, fill) {
    var o = '', s3 = ink(3);
    function round(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="10" fill="#fff"' + s3 + '/><circle cx="' + (x + 1) + '" cy="' + (y + 1) + '" r="5" fill="' + INK + '"/><circle cx="' + (x + 3) + '" cy="' + (y - 2) + '" r="1.8" fill="#fff"/>'; }
    function arc(x, y) { return '<path d="M' + (x - 8) + ' ' + (y + 3) + ' Q' + x + ' ' + (y - 9) + ' ' + (x + 8) + ' ' + (y + 3) + '" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>'; }
    // an eyelid in the body colour, coming down to d below the middle of the eye
    function lid(x, y, d) {
      var h = Math.round(Math.sqrt(100 - d * d) * 10) / 10;
      return '<path d="M' + (x - h) + ' ' + (y + d) + ' A10 10 0 ' + (d > 0 ? 1 : 0) + ' 1 ' + (x + h) + ' ' + (y + d) + ' Z" fill="' + fill + '"' + s3 + '/>';
    }
    function white(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="10" fill="#fff"' + s3 + '/>'; }
    [45, 75].forEach(function (x) {
      var y = 78;
      if (v === 1) o += arc(x, y);
      else if (v === 2) o += '<path d="M' + (x - 9) + ' ' + y + ' A9 9 0 0 0 ' + (x + 9) + ' ' + y + ' Z" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="' + x + '" cy="' + (y + 4) + '" r="3.5" fill="' + INK + '"/>';
      else if (v === 3) o += '<circle cx="' + x + '" cy="' + y + '" r="13" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="' + (x + 1) + '" cy="' + (y + 2) + '" r="7" fill="' + INK + '"/><circle cx="' + (x + 4) + '" cy="' + (y - 2) + '" r="2.6" fill="#fff"/>';
      else if (v === 4) o += '<text x="' + x + '" y="' + (y + 8) + '" font-size="24" text-anchor="middle">⭐</text>';
      else if (v === 5) o += '<text x="' + x + '" y="' + (y + 8) + '" font-size="22" text-anchor="middle">💗</text>';
      else if (v === 6) o += x === 45 ? round(x, y) : arc(x, y);   // wink
      else if (v === 7) o += white(x, y) + '<circle cx="' + (x + 5) + '" cy="' + (y + 3) + '" r="4.5" fill="' + INK + '"/>' + lid(x, y, -1);   // side-eye
      else if (v === 8) o += white(x, y) + '<circle cx="' + (x + 1) + '" cy="' + (y + 5) + '" r="4.5" fill="' + INK + '"/>' + lid(x, y, 2);   // chill
      else if (v === 9) o += '<ellipse cx="' + x + '" cy="' + y + '" rx="11" ry="14" fill="#fff"' + s3 + '/><ellipse cx="' + x + '" cy="' + (y + 2) + '" rx="8" ry="11" fill="#5B3FC4"/>' +
        '<ellipse cx="' + x + '" cy="' + (y + 3) + '" rx="4.5" ry="6" fill="' + INK + '"/><circle cx="' + (x + 3) + '" cy="' + (y - 4) + '" r="3.6" fill="#fff"/><circle cx="' + (x - 3) + '" cy="' + (y + 7) + '" r="1.8" fill="#fff"/>';
      else if (v === 10) o += '<circle cx="' + x + '" cy="' + y + '" r="11" fill="#fff"' + s3 + '/><path d="M' + x + ' ' + y + ' a2 2 0 0 1 4 0 a4 4 0 0 1 -8 0 a6 6 0 0 1 12 0 a8 8 0 0 1 -16 0" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>';
      else if (v === 11) o += '<circle class="avlz" cx="' + x + '" cy="' + y + '" r="16" fill="#FF3B3B" opacity=".3"/><circle cx="' + x + '" cy="' + y + '" r="10" fill="#FF2E2E"' + s3 + '/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="4" fill="#fff"/><path d="M' + (x - 17) + ' ' + y + ' L' + (x + 17) + ' ' + y + '" stroke="#FFB0B0" stroke-width="2" stroke-linecap="round" opacity=".85"/>';
      else if (v === 12) {   // happy tears
        var tx = x < 60 ? x - 10 : x + 10;
        o += arc(x, y) + '<path d="M' + tx + ' ' + (y + 3) + ' C' + (tx - 6) + ' ' + (y + 11) + ' ' + (tx - 5) + ' ' + (y + 16) + ' ' + tx + ' ' + (y + 16) + ' C' + (tx + 5) + ' ' + (y + 16) + ' ' + (tx + 6) + ' ' + (y + 11) + ' ' + tx + ' ' + (y + 3) + ' Z" fill="#7CC8FF"' + ink(2) + '/>';
      }
      else o += round(x, y);
    });
    return o;
  }
  function mouth(v) {
    var s = ' stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"', smile = '<path d="M48 102 Q60 115 72 102" fill="none"' + s + '/>';
    var grin = '<path d="M46 100 Q60 122 74 100 Z" fill="' + INK + '"/>';
    if (v === 1) return grin + '<path d="M49 101 L71 101 L69 106 L51 106 Z" fill="#fff"/>';
    if (v === 2) return '<ellipse cx="60" cy="107" rx="6" ry="8" fill="' + INK + '"/>';
    if (v === 3) return grin + '<ellipse cx="60" cy="112" rx="7" ry="6" fill="#FF6B8A"/>';
    if (v === 4) return '<path d="M50 107 Q62 111 72 99" fill="none"' + s + '/>';
    if (v === 5) return grin + '<path d="M49 101 L71 101 L69 106 L51 106 Z" fill="#fff"/><path d="M50 103.5 L70 103.5" stroke="#8A94A6" stroke-width="1.8"/>' +   // braces
      '<g fill="#8A94A6"><rect x="52" y="102" width="3" height="3"/><rect x="58.5" y="102" width="3" height="3"/><rect x="65" y="102" width="3" height="3"/></g>';
    if (v === 6) return '<path d="M52 105 L54.5 114 L57 107 Z M63 107 L65.5 114 L68 105 Z" fill="#fff"' + ink(2) + '/>' + smile;   // fangs
    if (v === 7) return '<path d="M47 102 Q53.5 111 60 103 Q66.5 111 73 102" fill="none"' + s + ' stroke-linejoin="round"/>';   // :3
    if (v === 8) return '<ellipse cx="60" cy="105" rx="4" ry="3" fill="' + INK + '"/><g class="avbb"><circle cx="60" cy="112" r="14" fill="#FF8FD1"' + ink(3) + '/>' +   // bubblegum
      '<path d="M52 107 Q54 102 59 101" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/></g>';
    if (v === 9) return '<path d="M50 108 Q60 117 70 108" fill="none"' + s + '/>' +   // moustache
      '<path d="M60 97 C54 91 44 92 40 98 C37 102 32 100 31 96 C31 104 40 108 48 104 C53 102 57 100 60 100 C63 100 67 102 72 104 C80 108 89 104 89 96 C88 100 83 102 80 98 C76 92 66 91 60 97 Z" fill="#5B3A1E"' + ink(2.5) + '/>';
    if (v === 10) return '<path d="M40 98 Q60 132 80 98 Z" fill="' + INK + '"' + ink(2) + '/><ellipse cx="60" cy="117" rx="9" ry="6" fill="#FF6B8A"/><path d="M43 99 L77 99 L75 104 L45 104 Z" fill="#fff"/>';   // laughing
    if (v === 11) return '<path d="M44 106 L49 102 L54 106 L60 102 L66 106 L71 102 L76 106" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';   // nervous
    if (v === 12) return '<rect x="54" y="106" width="6" height="8" rx="1.5" fill="#fff"' + ink(2.2) + '/><rect x="60" y="106" width="6" height="8" rx="1.5" fill="#fff"' + ink(2.2) + '/>' + smile;   // bunny teeth
    return smile;
  }
  function hat(v) {
    var st = ink(3.5), s2 = ink(2.5);
    switch (v) {
      case 1: return '<path d="M30 42 Q30 12 60 12 Q90 12 90 42 Z" fill="#E8452C"' + st + '/><path d="M62 39 L106 43 Q102 51 62 46 Z" fill="#B8321F"' + st + '/><circle cx="60" cy="13" r="4" fill="#B8321F"/>';
      case 2: return '<path d="M28 44 Q28 6 60 6 Q92 6 92 44 Z" fill="#3BAF7A"' + st + '/><rect x="25" y="35" width="70" height="13" rx="6" fill="#2A8A5E"' + st + '/><circle cx="60" cy="5" r="8" fill="#fff"' + st + '/>';
      case 3: return '<path d="M40 38 L60 -10 L80 38 Z" fill="#FF8FD1"' + st + '/><path d="M47 22 L73 22 M53 8 L67 8" stroke="#FFE14D" stroke-width="5"/><circle cx="60" cy="-11" r="6" fill="#FFE14D"' + st + '/>';
      case 4: return '<path d="M20 82 Q20 16 60 16 Q100 16 100 82" fill="none" stroke="#2b2b3a" stroke-width="8"/><rect x="8" y="68" width="18" height="28" rx="7" fill="#FF5B8A"' + st + '/><rect x="94" y="68" width="18" height="28" rx="7" fill="#FF5B8A"' + st + '/>';
      case 5: return '<ellipse cx="60" cy="37" rx="40" ry="8" fill="#3B3B52"' + st + '/><rect x="38" y="-8" width="44" height="45" rx="3" fill="#3B3B52"' + st + '/><rect x="38" y="23" width="44" height="8" fill="#E8452C"/><path d="M44 -2 L44 18" stroke="#8A8AA8" stroke-width="3" stroke-linecap="round"/>';
      case 6: return '<path d="M38 36 Q36 4 50 6 Q60 13 70 6 Q84 4 82 36 Z" fill="#B8763A"' + st + '/><path d="M10 37 Q60 56 110 37 Q104 29 60 34 Q16 29 10 37 Z" fill="#A0642D"' + st + '/>';
      case 7: return '<path d="M30 40 L64 -22 L90 40 Z" fill="#4B3BB8"' + st + '/><ellipse cx="60" cy="40" rx="38" ry="7" fill="#3A2C99"' + st + '/><text x="58" y="18" font-size="14" fill="#FFE14D" text-anchor="middle">✦</text><text x="68" y="-1" font-size="10" fill="#FFE14D" text-anchor="middle">✦</text>';
      case 8: return '<path d="M30 30 Q6 24 8 0 Q20 16 34 21 Z" fill="#F3EFE7"' + st + '/><path d="M90 30 Q114 24 112 0 Q100 16 86 21 Z" fill="#F3EFE7"' + st + '/><path d="M28 44 Q28 10 60 10 Q92 10 92 44 Z" fill="#9AA4B2"' + st + '/><rect x="26" y="36" width="68" height="9" rx="3" fill="#6E7888"' + st + '/>';
      case 9: return '<path d="M32 38 L32 8 L46 22 L60 0 L74 22 L88 8 L88 38 Z" fill="#FFC94A"' + st + '/><circle cx="46" cy="31" r="4" fill="#E8452C"/><circle cx="60" cy="29" r="4.5" fill="#53B7FF"/><circle cx="74" cy="31" r="4" fill="#4FD97A"/>';
      case 10: return '<ellipse cx="60" cy="8" rx="27" ry="7" fill="none" stroke="#FFE14D" stroke-width="6" opacity=".95"/><ellipse cx="60" cy="8" rx="27" ry="7" fill="none" stroke="#fff" stroke-width="2"/>';
      case 11: return '<path d="M31 40 Q16 39 9 47 Q20 50 32 46 Z" fill="#1F4FA8"' + st + '/><path d="M30 42 Q30 12 60 12 Q90 12 90 42 Z" fill="#2E6BD9"' + st + '/>' +   // backwards cap
        '<path d="M49 42 Q49 32 60 32 Q71 32 71 42" fill="#1F4FA8"' + ink(3) + '/><circle cx="60" cy="13" r="4" fill="#1F4FA8"/>';
      case 12: return '<path d="M34 38 Q34 8 60 8 Q86 8 86 38 Z" fill="#F2D27A"' + st + '/><path d="M35 30 L85 30" stroke="#C9952E" stroke-width="4"/>' +   // bucket hat
        '<path d="M18 46 L34 32 L86 32 L102 46 Q60 56 18 46 Z" fill="#E5BE55"' + st + '/>';
      case 13: return '<path d="M28 46 Q28 10 60 10 Q92 10 92 46 Z" fill="#6BCB5A"' + st + '/>' +   // frog hat
        both(function (X) { return '<circle cx="' + X(42) + '" cy="12" r="10" fill="#6BCB5A"' + st + '/><circle cx="' + X(42) + '" cy="12" r="5.5" fill="#fff"' + ink(2) + '/><circle cx="' + X(42) + '" cy="13" r="2.8" fill="' + INK + '"/>'; }) +
        '<path d="M48 32 Q60 40 72 32" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><ellipse cx="38" cy="33" rx="4" ry="2.5" fill="#FF7AA8" opacity=".6"/><ellipse cx="82" cy="33" rx="4" ry="2.5" fill="#FF7AA8" opacity=".6"/>';
      case 14: return both(function (X) { return '<path d="M' + X(26) + ' 40 L' + X(28) + ' 6 L' + X(50) + ' 24 Z" fill="#FFB3DE"' + st + '/><path d="M' + X(31) + ' 30 L' + X(32) + ' 15 L' + X(42) + ' 23 Z" fill="#FF6FB5"/>'; }) +   // cat-ear headphones
        '<path d="M20 82 Q20 16 60 16 Q100 16 100 82" fill="none" stroke="' + INK + '" stroke-width="12"/><path d="M20 82 Q20 16 60 16 Q100 16 100 82" fill="none" stroke="#FFB3DE" stroke-width="7"/>' +
        both(function (X) { return '<rect x="' + (X(8) - (X(8) > 60 ? 18 : 0)) + '" y="68" width="18" height="28" rx="7" fill="#FFB3DE"' + st + '/><circle cx="' + X(17) + '" cy="82" r="4" fill="#7CF2FF"/>'; });
      case 15: return '<path d="M38 46 L38 28 Q22 28 24 14 Q26 0 42 4 Q46 -8 60 -8 Q74 -8 78 4 Q94 0 96 14 Q98 28 82 28 L82 46 Z" fill="#fff"' + st + '/>' +   // chef hat
        '<path d="M50 12 Q52 20 50 28 M70 12 Q68 20 70 28" fill="none" stroke="#D3DAE3" stroke-width="3" stroke-linecap="round"/><path d="M39 36 L81 36" stroke="#D3DAE3" stroke-width="3"/>';
      case 16: return '<path d="M36 42 Q36 22 60 22 Q84 22 84 42 Z" fill="#222"' + st + '/><path d="M60 4 L106 18 L60 32 L14 18 Z" fill="#2b2b3a"' + st + '/>' +   // graduation cap
        '<path d="M60 18 L96 22 L96 40" fill="none" stroke="#FFC94A" stroke-width="3" stroke-linecap="round"/><path d="M92 40 L100 40 L99 50 L93 50 Z" fill="#FFC94A"' + ink(2) + '/><circle cx="60" cy="18" r="3.5" fill="#FFC94A"/>';
      case 17: return '<path d="M12 40 Q24 -2 60 10 Q96 -2 108 40 Q60 26 12 40 Z" fill="#2b2b3a"' + st + '/><path d="M19 35 Q60 23 101 35" fill="none" stroke="#FFC94A" stroke-width="3"/>' +   // pirate hat
        '<circle cx="60" cy="20" r="6" fill="#FFC94A"' + ink(2) + '/><path d="M60 16.5 L60 23.5" stroke="#B8860B" stroke-width="2"/>';
      case 18: return '<circle cx="60" cy="80" r="52" fill="#BFE6FF" fill-opacity=".22" stroke="#E8EEF5" stroke-width="7"/>' +   // astronaut helmet
        '<circle cx="60" cy="80" r="55.5" fill="none"' + ink(2.5) + '/><circle cx="60" cy="80" r="48.5" fill="none"' + ink(2) + '/>' +
        '<path d="M30 58 Q37 42 52 35" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/><circle cx="84" cy="44" r="3" fill="#fff" opacity=".8"/>' +
        '<rect x="22" y="126" width="76" height="12" rx="6" fill="#E8EEF5"' + st + '/><circle cx="60" cy="132" r="3" fill="#FF5B5B"/>';
      case 19: return '<path d="M26 44 Q60 22 94 44" fill="none" stroke="#3BAF7A" stroke-width="4" stroke-linecap="round"/>' +   // flower crown
        [[32, 40, '#FF8FD1'], [45, 35, '#FFE14D'], [60, 33, '#C9A6FF'], [75, 35, '#FFE14D'], [88, 40, '#FF8FD1']].map(function (f) {
          return '<circle cx="' + f[0] + '" cy="' + f[1] + '" r="7" fill="' + f[2] + '"' + s2 + '/><circle cx="' + f[0] + '" cy="' + f[1] + '" r="2.6" fill="#FF9F1C"/>';
        }).join('');
      case 20: return '<path d="M18 60 Q60 34 102 60 L101 70 Q60 46 19 70 Z" fill="#FF5B8A"' + st + '/><path d="M20 65 Q60 40 100 65" fill="none" stroke="#fff" stroke-width="2.5" opacity=".85"/>';   // headband
      case 21: return '<path d="M10 48 Q10 -2 60 -2 Q110 -2 110 48 Q60 38 10 48 Z" fill="#E8452C"' + st + '/>' +   // mushroom hat
        '<g fill="#fff"><circle cx="40" cy="18" r="7"/><circle cx="70" cy="10" r="5"/><circle cx="86" cy="28" r="6"/><circle cx="26" cy="36" r="4"/><circle cx="58" cy="30" r="4"/></g>';
      case 22: return '<path d="M28 44 Q28 8 60 8 Q92 8 92 44 Z" fill="#FFD23F"' + st + '/>' +   // propeller cap
        '<path d="M60 8 Q46 9 42 44 L60 44 Z" fill="#FF5B5B"' + ink(2) + '/><path d="M60 8 Q74 9 78 44 L60 44 Z" fill="#53B7FF"' + ink(2) + '/>' +
        '<rect x="26" y="38" width="68" height="10" rx="5" fill="#FFD23F"' + st + '/><path d="M60 8 L60 -3" stroke="' + INK + '" stroke-width="3"/>' +
        '<g class="avpr"><ellipse cx="48" cy="-4" rx="12" ry="3.5" fill="#53B7FF"' + s2 + '/><ellipse cx="72" cy="-4" rx="12" ry="3.5" fill="#FF5B5B"' + s2 + '/></g><circle cx="60" cy="-4" r="3" fill="' + INK + '"/>';
    }
    return '';
  }
  // extras under the feet (they don't bob with the body)
  function extraUnder(v) {
    if (v === 11) return '<rect x="10" y="149" width="100" height="7" rx="3.5" fill="#FF5B8A"' + ink(3) + '/><path d="M22 152.5 L98 152.5" stroke="#fff" stroke-width="1.5" stroke-dasharray="4 4" opacity=".7"/>' +   // skateboard
      '<circle cx="28" cy="158" r="3.6" fill="#FFE14D"' + ink(2.2) + '/><circle cx="92" cy="158" r="3.6" fill="#FFE14D"' + ink(2.2) + '/>';
    return '';
  }
  function extraBack(v) {
    var st = ink(3.5);
    if (v === 6) return '<path d="M30 52 Q10 118 2 152 L118 152 Q110 118 90 52 Z" fill="#C0263A"' + st + '/>';
    if (v === 7) return '<path d="M22 82 Q-20 48 -15 100 Q-4 96 0 114 Q8 100 22 106 Z" fill="#fff"' + st + '/><path d="M98 82 Q140 48 135 100 Q124 96 120 114 Q112 100 98 106 Z" fill="#fff"' + st + '/>';
    if (v === 14) return '<path d="M30 60 Q30 22 60 22 Q90 22 90 60 Z" fill="#FF8A1F"' + st + '/><path d="M52 25 Q60 12 68 25" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>';   // backpack top
    return '';
  }
  function extraFront(v) {
    var st = ink(3.5), s2 = ink(2.5);
    switch (v) {
      case 1: return '<circle cx="45" cy="78" r="13" fill="none" stroke="' + INK + '" stroke-width="3.5"/><circle cx="75" cy="78" r="13" fill="none" stroke="' + INK + '" stroke-width="3.5"/><path d="M58 78 L62 78" stroke="' + INK + '" stroke-width="3.5"/>';
      case 2: return '<path d="M60 129 L45 120 L45 138 Z M60 129 L75 120 L75 138 Z" fill="#E8452C"' + st + '/><circle cx="60" cy="129" r="4" fill="#B8321F"' + st + '/>';
      case 3: return '<path d="M22 116 Q60 132 98 116 L98 127 Q60 143 22 127 Z" fill="#E8452C"' + st + '/><path d="M74 128 L85 127 L90 152 L77 152 Z" fill="#E8452C"' + st + '/>';
      case 4: return '<path d="M31 71 H58 V80 Q45 92 31 80 Z" fill="' + INK + '"/><path d="M62 71 H89 V80 Q75 92 62 80 Z" fill="' + INK + '"/><path d="M58 73 L62 73" stroke="' + INK + '" stroke-width="3"/><path d="M36 74 L44 74" stroke="#fff" stroke-width="2" opacity=".6"/>';
      case 5: return '<path d="M52 112 L60 125 L68 112" fill="none" stroke="#2E6BD9" stroke-width="5"/><circle cx="60" cy="130" r="8" fill="#FFC94A"' + st + '/><text x="60" y="134" font-size="9" text-anchor="middle" fill="#7a5600">★</text>';
      case 8: return '<path d="M16 84 Q16 22 60 22 Q104 22 104 84" fill="none" stroke="' + INK + '" stroke-width="6"/>' +   // gaming headset
        '<rect x="6" y="72" width="16" height="26" rx="6" fill="#2b2b3a"' + st + '/><rect x="98" y="72" width="16" height="26" rx="6" fill="#2b2b3a"' + st + '/>' +
        '<rect x="10" y="80" width="8" height="10" rx="2" fill="#4FD97A"/><rect x="102" y="80" width="8" height="10" rx="2" fill="#4FD97A"/>' +
        '<path d="M14 96 Q18 116 42 112" fill="none" stroke="#2b2b3a" stroke-width="4" stroke-linecap="round"/><circle cx="44" cy="112" r="4.5" fill="#2b2b3a"' + ink(2) + '/>';
      case 9: return '<path d="M30 116 Q60 136 90 116" fill="none" stroke="#9A6E08" stroke-width="6" stroke-linecap="round"/><path d="M30 116 Q60 136 90 116" fill="none" stroke="#FFD54A" stroke-width="3.5" stroke-dasharray="5 3"/>' +   // pi chain
        '<circle cx="60" cy="131" r="8" fill="#FFD54A"' + s2 + '/><text x="60" y="135" font-size="11" font-weight="700" font-family="Georgia,serif" text-anchor="middle" fill="#7a5600">π</text>';
      case 10: return '<path d="M114 82 L120 62" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/><path d="M114 82 L120 62" stroke="#FF5B8A" stroke-width="4.5" stroke-linecap="round"/>' +   // boba tea
        '<path d="M98 86 L122 86 L118 120 L102 120 Z" fill="#F0D2A8"' + st + '/><rect x="96" y="80" width="28" height="7" rx="3.5" fill="#fff"' + s2 + '/>' +
        '<g fill="' + INK + '"><circle cx="106" cy="115" r="2.6"/><circle cx="112" cy="116" r="2.6"/><circle cx="115" cy="111" r="2.6"/><circle cx="108" cy="110" r="2.6"/><circle cx="106" cy="98" r="1.6"/><circle cx="114" cy="98" r="1.6"/></g>' +
        '<path d="M108 101.5 Q110 103.5 112 101.5" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/>';
      case 12: return '<circle cx="10" cy="114" r="13" fill="#FF8A1F"' + st + '/><path d="M-3 114 L23 114 M10 101 L10 127" stroke="' + INK + '" stroke-width="2"/>' +   // basketball
        '<path d="M1 104 Q6 114 1 124 M19 104 Q14 114 19 124" fill="none" stroke="' + INK + '" stroke-width="2"/>';
      case 13: return '<path d="M38 122 Q38 114 48 114 L72 114 Q82 114 82 122 L86 136 Q88 144 80 144 Q74 144 70 138 L50 138 Q46 144 40 144 Q32 144 34 136 Z" fill="#2b2b3a"' + st + '/>' +   // game controller
        '<path d="M46 123 L46 131 M42 127 L50 127" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="72" cy="123" r="2.4" fill="#FF5B5B"/><circle cx="77" cy="128" r="2.4" fill="#53B7FF"/><circle cx="67" cy="128" r="2.4" fill="#4FD97A"/><circle cx="72" cy="133" r="2.4" fill="#FFE14D"/>';
      case 14: return both(function (X) {   // backpack straps
        var d = 'M' + X(30) + ' 56 Q' + X(24) + ' 92 ' + X(30) + ' 128';
        return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#FF8A1F" stroke-width="5" stroke-linecap="round"/>';
      });
      case 15: return '<rect x="100" y="80" width="18" height="30" rx="4" fill="#2b2b3a"' + st + '/><rect x="103" y="84" width="12" height="20" rx="1.5" fill="#7CC8FF"/>' +   // phone
        '<path d="M105 88 L113 88 M105 92 L111 92" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M109 101 l-2.5 -2.5 a1.6 1.6 0 0 1 2.5 -2 a1.6 1.6 0 0 1 2.5 2 Z" fill="#FF5B8A"/><circle cx="109" cy="106.5" r="1.4" fill="#fff"/>';
      case 16: return '<g transform="rotate(-22 50 124)"><rect x="50" y="120.5" width="58" height="7" fill="#8A5A2B"' + s2 + '/><rect x="104" y="117" width="14" height="14" rx="3" fill="#5B3A1E"' + s2 + '/>' +   // guitar
        '<path d="M24 112 Q14 112 14 124 Q14 136 26 136 Q34 140 44 136 Q58 136 58 124 Q58 112 44 112 Q36 108 24 112 Z" fill="#E8452C"' + st + '/>' +
        '<circle cx="40" cy="124" r="5" fill="' + INK + '"/><path d="M40 124 L112 124" stroke="#F3EFE7" stroke-width="1"/></g>';
      case 17: return both(function (X) {   // earbuds
        return '<rect x="' + (X(9) - (X(9) > 60 ? 9 : 0)) + '" y="80" width="9" height="11" rx="4.5" fill="#fff"' + ink(2.2) + '/><rect x="' + (X(11) - (X(11) > 60 ? 5 : 0)) + '" y="89" width="5" height="11" rx="2.5" fill="#fff"' + ink(2.2) + '/>';
      });
      case 18: return '<path d="M100 96 L120 96 L110 124 Z" fill="#F2C27A"' + st + '/><path d="M103 103 L116 110 M117 103 L106 112" stroke="#C9952E" stroke-width="1.6"/>' +   // ice cream
        '<circle cx="110" cy="78" r="8" fill="#7CF2A2"' + st + '/><circle cx="110" cy="90" r="10" fill="#FF8FD1"' + st + '/>' +
        '<path d="M105 86 l2 1 M113 84 l1 2 M110 92 l2 -1 M104 93 l1 1.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>';
    }
    return '';
  }

  /* character types: kBack goes behind the body (ears, tails, spikes), kFront on top of it (whiskers, belly, horn) */
  function kBack(v, fill) {
    var st = ink(4);
    switch (v) {
      case 1: return both(function (X) { return '<path d="M' + X(27) + ' 52 L' + X(22) + ' 8 L' + X(54) + ' 33 Z" fill="' + fill + '"' + st + '/><path d="M' + X(30) + ' 40 L' + X(27) + ' 19 L' + X(45) + ' 32 Z" fill="#FF9EC4"/>'; });   // cat
      case 2: return both(function (X) { return '<circle cx="' + X(31) + '" cy="40" r="14" fill="' + fill + '"' + st + '/><circle cx="' + X(31) + '" cy="40" r="7" fill="#000" opacity=".18"/>'; });   // bear
      case 3: return both(function (X, s) {   // bunny
        return '<g transform="rotate(' + (-14 * s) + ' ' + X(44) + ' 36)"><ellipse cx="' + X(44) + '" cy="8" rx="11" ry="30" fill="' + fill + '"' + st + '/><ellipse cx="' + X(44) + '" cy="10" rx="5" ry="20" fill="#FF9EC4"/></g>';
      });
      case 4: return both(function (X) { return '<circle cx="' + X(40) + '" cy="40" r="15" fill="' + fill + '"' + st + '/><circle cx="' + X(40) + '" cy="37" r="7" fill="#fff" opacity=".35"/>'; });   // frog
      case 6: return '<path d="M98 128 Q140 130 132 80 Q120 100 98 108 Z" fill="' + fill + '"' + st + '/><ellipse cx="130" cy="88" rx="7" ry="10" transform="rotate(20 130 88)" fill="#fff"' + st + '/>' +   // fox
        both(function (X) { return '<path d="M' + X(26) + ' 54 L' + X(18) + ' 4 L' + X(56) + ' 32 Z" fill="' + fill + '"' + st + '/><path d="M' + X(20.9) + ' 22 L' + X(18) + ' 4 L' + X(31.7) + ' 14 Z" fill="' + INK + '"/>'; });
      case 7: return both(function (X) { return '<ellipse cx="' + X(30) + '" cy="44" rx="9" ry="8" fill="' + fill + '"' + st + '/>'; });   // capybara
      case 8: return both(function (X) {   // axolotl gills
        return [[28, 58, 6, 40], [24, 68, 0, 62], [23, 80, 4, 86]].map(function (g) {
          var d = 'M' + X(g[0]) + ' ' + g[1] + ' L' + X(g[2]) + ' ' + g[3];
          return '<path d="' + d + '" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><path d="' + d + '" stroke="#FF8FC8" stroke-width="5.5" stroke-linecap="round"/>';
        }).join('');
      });
      case 9: return '<rect x="6" y="68" width="12" height="22" rx="3" fill="#C9D2DD"' + ink(3) + '/><rect x="102" y="68" width="12" height="22" rx="3" fill="#C9D2DD"' + ink(3) + '/>' +   // robot
        '<path d="M60 32 L60 6" stroke="' + INK + '" stroke-width="4"/><circle class="avbl" cx="60" cy="3" r="6" fill="#FF4D4D"' + ink(3) + '/>';
      case 11: return both(function (X) {   // alien
        return '<path d="M' + X(46) + ' 36 Q' + X(42) + ' 14 ' + X(32) + ' 5" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><circle cx="' + X(32) + '" cy="3" r="6" fill="#9BFF6B"' + ink(3) + '/>';
      });
      case 12: return '<path d="M36 44 L38 16 L54 32 Z M52 34 L60 4 L68 34 Z M66 32 L82 16 L84 44 Z" fill="#FFB020"' + st + '/>' +   // dino
        '<path d="M26 126 Q-6 136 -16 108 Q4 122 22 112 Z" fill="' + fill + '"' + st + '/>';
      case 13: return '<circle cx="80" cy="34" r="9" fill="#FF8FD1"' + ink(3) + '/><circle cx="92" cy="44" r="8" fill="#C9A6FF"' + ink(3) + '/><circle cx="99" cy="57" r="7" fill="#7CC8FF"' + ink(3) + '/>';   // unicorn mane
      case 14: return both(function (X) {   // dragon wings
        var d = 'M' + X(24) + ' 80 Q' + X(-2) + ' 44 ' + X(-14) + ' 62 Q' + X(-6) + ' 68 ' + X(-8) + ' 78 Q' + X(2) + ' 78 ' + X(2) + ' 90 Q' + X(10) + ' 86 ' + X(20) + ' 96 Z';
        return '<path d="' + d + '" fill="' + fill + '"' + st + '/><path d="' + d + '" fill="#000" opacity=".18"/>';
      }) + '<path d="M38 42 L42 18 L54 32 Z M52 34 L60 8 L68 34 Z M66 32 L78 18 L82 42 Z" fill="#FF5B5B"' + st + '/>';
    }
    return '';
  }
  function kFront(v) {
    var nose = '<path d="M55 91 L65 91 L60 96.5 Z" fill="#FF7AA8"' + ink(2) + '/>', holes = '<circle cx="55" cy="93" r="1.8" fill="' + INK + '"/><circle cx="65" cy="93" r="1.8" fill="' + INK + '"/>';
    switch (v) {
      case 1: return nose + both(function (X) { return '<path d="M' + X(26) + ' 100 L' + X(2) + ' 95 M' + X(26) + ' 107 L' + X(3) + ' 111" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>'; });   // cat whiskers
      case 2: return '<ellipse cx="60" cy="102" rx="17" ry="13" fill="#fff" opacity=".35"/><ellipse cx="60" cy="93" rx="5" ry="3.5" fill="' + INK + '"/>';   // bear muzzle
      case 3: return nose;   // bunny
      case 4: return holes;   // frog
      case 5: return '<path d="M60 62 C84 62 92 92 90 112 C88 132 76 140 60 140 C44 140 32 132 30 112 C28 92 36 62 60 62 Z" fill="#fff"/>' +   // penguin belly and beak
        '<path d="M53 91 L67 91 L60 98 Z" fill="#FFA53B"' + ink(2) + '/>';
      case 6: return '<path d="M18 100 Q38 96 50 112 Q60 118 70 112 Q82 96 102 100 Q100 134 60 140 Q20 134 18 100 Z" fill="#fff" opacity=".92"/><ellipse cx="60" cy="94" rx="4.5" ry="3.2" fill="' + INK + '"/>';   // fox
      case 7: return '<ellipse cx="60" cy="101" rx="24" ry="16" fill="#000" opacity=".12"/><ellipse cx="54" cy="96" rx="2.6" ry="3.4" fill="' + INK + '"/><ellipse cx="66" cy="96" rx="2.6" ry="3.4" fill="' + INK + '"/>';   // capybara snout
      case 9: return '<path d="M26 60 Q60 50 94 60" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="3"/>' +   // robot panels
        '<rect x="44" y="118" width="32" height="15" rx="4" fill="#C9D2DD"' + ink(3) + '/><circle cx="52" cy="125.5" r="3" fill="#FF4D4D"/><circle cx="60" cy="125.5" r="3" fill="#FFD23F"/><circle cx="68" cy="125.5" r="3" fill="#4FD97A"/>' +
        '<g fill="#000" opacity=".3"><circle cx="24" cy="70" r="2.5"/><circle cx="96" cy="70" r="2.5"/><circle cx="26" cy="122" r="2.5"/><circle cx="94" cy="122" r="2.5"/></g>';
      case 11: return '<g fill="#fff" opacity=".3"><circle cx="48" cy="50" r="4"/><circle cx="60" cy="45" r="5"/><circle cx="72" cy="50" r="4"/></g>';   // alien spots
      case 12: return '<ellipse cx="60" cy="118" rx="26" ry="20" fill="#fff" opacity=".28"/>' + holes;   // dino belly
      case 13: return '<path d="M53 36 L60 -2 L67 36 Z" fill="#FFE14D"' + ink(3.5) + '/><path d="M55 27 L65 23 M56.5 17 L63.5 14" stroke="#E0A800" stroke-width="2.5" stroke-linecap="round"/>';   // unicorn horn
      case 14: return both(function (X) { return '<path d="M' + X(42) + ' 38 Q' + X(34) + ' 22 ' + X(30) + ' 10 Q' + X(44) + ' 20 ' + X(52) + ' 34 Z" fill="#F3EFE7"' + ink(3) + '/>'; }) +   // dragon horns
        '<ellipse cx="60" cy="118" rx="26" ry="20" fill="#fff" opacity=".22"/>' + holes;
    }
    return '';
  }
  function trail(v, id) {
    var it = CAT.t.items[v]; if (!v || !it || !it.e) return '';
    var P = [[-8, 128, 0], [126, 118, 0.35], [-4, 64, 0.7], [122, 54, 1.05], [60, -16, 1.4]], o = '';
    P.forEach(function (p) { o += '<text class="avtr" x="' + p[0] + '" y="' + p[1] + '" font-size="18" text-anchor="middle" style="animation-delay:' + p[2] + 's">' + it.e + '</text>'; });
    return o;
  }
  function pet(v) {
    var it = CAT.p.items[v]; if (!v || !it || !it.e) return '';
    return '<ellipse cx="120" cy="157" rx="11" ry="2.5" fill="rgba(0,0,0,.25)"/><text class="avpet" x="120" y="153" font-size="26" text-anchor="middle">' + it.e + '</text>';
  }
  /* special body fills: g = gradient stops [offset, colour], v = top-to-bottom, x = extra drawing (kept inside the body) */
  var SHINE = '<path d="M34 54 Q40 46 48 44" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".7"/>';
  var FX = {
    galaxy: { g: [[0, '#2b1a6b'], [.55, '#6b3fd6'], [1, '#1fa3c9']],
      x: '<g fill="#fff"><circle cx="34" cy="60" r="1.6"/><circle cx="84" cy="56" r="1.2"/><circle cx="30" cy="112" r="1.4"/><circle cx="92" cy="118" r="1.8"/><circle cx="62" cy="128" r="1.2"/><circle cx="96" cy="88" r="1.1"/></g>' },
    gold: { g: [[0, '#FFF3A0'], [.45, '#FFC107'], [1, '#B8860B']], x: SHINE },
    candy: { g: [[0, '#FFB3E1'], [.5, '#D9B8FF'], [1, '#9BE3FF']], x: SHINE },
    sunset: { g: [[0, '#7B3FC4'], [.4, '#E8457C'], [.7, '#FF8A5B'], [1, '#FFD23F']], v: 1 },
    holo: { g: [[0, '#B5FFFC'], [.25, '#D9B8FF'], [.5, '#FFC6E8'], [.75, '#FFF3B0'], [1, '#B8FFD0']],
      x: SHINE + '<path d="M78 120 Q88 114 92 102" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".6"/><text x="86" y="60" font-size="10" fill="#fff" text-anchor="middle">✦</text>' },
    rainbow: { g: [[0, '#FF5B5B'], [.2, '#FFB020'], [.4, '#FFE14D'], [.6, '#4FD97A'], [.8, '#53B7FF'], [1, '#9B6BFF']], v: 1 },
    camo: { x: [[36, 58, 13, 7, -20, '#4A6B35'], [80, 48, 14, 8, 15, '#8FAE6A'], [26, 102, 9, 14, 10, '#3B4F2A'], [94, 98, 11, 8, -30, '#4A6B35'],
      [54, 128, 16, 7, 0, '#8FAE6A'], [86, 130, 9, 6, 20, '#3B4F2A'], [62, 40, 10, 5, 5, '#3B4F2A'], [40, 124, 6, 5, 0, '#4A6B35']].map(function (b) {
      return '<ellipse cx="' + b[0] + '" cy="' + b[1] + '" rx="' + b[2] + '" ry="' + b[3] + '" transform="rotate(' + b[4] + ' ' + b[0] + ' ' + b[1] + ')" fill="' + b[5] + '"/>';
    }).join('') },
    slime: { x: SHINE + '<g fill="#fff" opacity=".45"><circle cx="86" cy="62" r="4"/><circle cx="92" cy="72" r="2.2"/><circle cx="30" cy="118" r="3"/></g>' +
      '<path d="M16 95 C16 60 25 30 60 30 C95 30 104 60 104 95 L104 100 Q98 96 96 106 Q94 116 90 106 Q86 92 78 100 Q72 106 66 98 Q60 92 52 100 Q46 108 40 98 Q34 90 28 104 Q24 112 22 100 Q20 94 16 100 Z" fill="#fff" opacity=".12"/>' }
  };
  // the whole character, as an SVG string. o.walk: feet and bob animate. o.size: width in px (height follows)
  function svg(code, o) {
    o = o || {};
    var L = decode(code), id = 'av' + (++uid), B = CAT.b.items[L.b], fill = B.c, defs = '', extra = '', F = FX[B.fx];
    var ghost = L.k === 10, body = ghost ? GHOST : BODY;
    if (F && F.g) {
      defs = '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="' + (F.v ? 0 : 1) + '" y2="1">' + F.g.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join('') + '</linearGradient>';
      fill = 'url(#' + id + 'g)';
    }
    if (F && F.x) { defs += '<clipPath id="' + id + 'c"><path d="' + body + '"/></clipPath>'; extra = '<g clip-path="url(#' + id + 'c)">' + F.x + '</g>'; }
    var w = o.size || 120, st = ' stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"', foot = L.k === 5 ? '#FFA53B' : fill;
    var bod = '<g class="avbod">' + extraBack(L.a) + kBack(L.k, fill) +
      '<ellipse cx="15" cy="100" rx="8" ry="13" fill="' + fill + '"' + st + '/><ellipse cx="105" cy="100" rx="8" ry="13" fill="' + fill + '"' + st + '/>' +
      '<path d="' + body + '" fill="' + fill + '"' + st + '/>' + extra + kFront(L.k) +
      '<ellipse cx="34" cy="98" rx="6" ry="4" fill="#FF7AA8" opacity=".45"/><ellipse cx="86" cy="98" rx="6" ry="4" fill="#FF7AA8" opacity=".45"/>' +
      eyes(L.e, fill) + mouth(L.m) + extraFront(L.a) + hat(L.h) + '</g>';
    if (ghost) bod = '<g class="avgh">' + bod + '</g>';
    return '<svg class="av' + (o.walk ? ' walk' : '') + '" viewBox="-20 -24 160 184" width="' + w + '" height="' + Math.round(w * 184 / 160) + '" role="img" aria-label="' + (o.label || 'Avatar') + '" xmlns="http://www.w3.org/2000/svg">' +
      (defs ? '<defs>' + defs + '</defs>' : '') +
      (ghost ? '<ellipse cx="60" cy="156" rx="30" ry="5" fill="rgba(0,0,0,.18)"/>' : '<ellipse cx="60" cy="154" rx="40" ry="6" fill="rgba(0,0,0,.25)"/>') +
      extraUnder(L.a) +
      (ghost ? '' : '<g class="avft l"><ellipse cx="44" cy="146" rx="13" ry="7" fill="' + foot + '"' + st + '/></g><g class="avft r"><ellipse cx="76" cy="146" rx="13" ry="7" fill="' + foot + '"' + st + '/></g>') +
      pet(L.p) + bod + trail(L.t, id) + '</svg>';
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
      '.avn6{color:#C6FF3D;text-shadow:0 0 8px rgba(198,255,61,.75)}.avn7{color:#D6BCFF}.avn8{color:#FFB15C}.avn9{color:#8CFF5A;text-shadow:0 0 4px #39D11F,0 0 12px rgba(57,209,31,.7)}' +
      '.avn10,.avn11,.avn12,.avn13{-webkit-background-clip:text;background-clip:text;color:transparent}' +
      '.avn10{background-image:linear-gradient(0deg,#FF3B3B,#FF8A1F 50%,#FFE14D)}.avn11{background-image:linear-gradient(90deg,#fff,#A8E8FF 50%,#53B7FF)}' +
      '.avn12{background-image:linear-gradient(90deg,#C9A6FF,#8A6BFF 35%,#4FC3F7 70%,#FF9BE1)}' +
      '.avn13{background-image:linear-gradient(90deg,#B5FFFC,#D9B8FF,#FFC6E8,#FFF3B0,#B8FFD0,#B5FFFC);background-size:200% 100%;animation:avholo 3s linear infinite}@keyframes avholo{to{background-position:200% 0}}' +
      // pets bob, the propeller spins, the robot light blinks, ghosts float, bubblegum grows, laser eyes glow
      '.av .avpet{transform-box:fill-box;transform-origin:50% 100%;animation:avpet 1.8s ease-in-out infinite}@keyframes avpet{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px) rotate(-5deg)}}' +
      '.av .avpr{transform-box:fill-box;transform-origin:center;animation:avpr .5s linear infinite}@keyframes avpr{50%{transform:scaleX(.12)}}' +
      '.av .avbl{animation:avbl 1.2s steps(1) infinite}@keyframes avbl{50%{opacity:.3}}' +
      '.av .avgh{animation:avgh 2.6s ease-in-out infinite alternate}@keyframes avgh{to{transform:translateY(-6px)}}' +
      '.av .avbb{transform-box:fill-box;transform-origin:50% 0;animation:avbb 2.4s ease-in-out infinite}@keyframes avbb{0%,100%{transform:scale(.85)}50%{transform:scale(1.08)}}' +
      '.av .avlz{animation:avlz 1s ease-in-out infinite alternate}@keyframes avlz{from{opacity:.15}to{opacity:.55}}' +
      // the Lane Clash team intro: each name under its avatar, marching in one after another
      '.lcrost span.hasav{display:flex;flex-direction:column;align-items:center;gap:0;padding:0 2px;background:none}.lcrost .lcav{display:block;animation:lcavin .55s cubic-bezier(.2,1.6,.4,1) both}' +
      '.lcrost span.hasav em{font-style:normal;padding:1px 8px;border-radius:99px;background:rgba(255,255,255,.12);font-size:.85em}' +
      '@keyframes lcavin{from{opacity:0;transform:translateY(24px) scale(.4)}to{opacity:1;transform:none}}' +
      '@media (prefers-reduced-motion:reduce){.av .avtr,.av.walk .avft,.av.walk .avbod,.lcrost .lcav,.av .avpet,.av .avpr,.av .avbl,.av .avgh,.av .avbb,.av .avlz,.avn13{animation:none}.av .avtr{opacity:.8}}';
    (document.head || document.documentElement).appendChild(s);
  }
  if (document.head) css(); else document.addEventListener('DOMContentLoaded', css);

  window.SFA_AVATAR = { CAT: CAT, ORDER: ORDER, decode: decode, encode: encode, defLook: defLook, svg: svg, nameCls: nameCls, level: level, title: title, need: need,
    profile: profile, save: save, myLook: myLook, owns: owns, lessons: lessons, localGames: localGames, earned: earned, RATE: RATE, hash: hash,
    scale: scale, price: price, itemPrice: itemPrice, strutPrice: function () { return price(STRUT); } };
})();
