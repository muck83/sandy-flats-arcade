/* 🔠 The Big Board: a class crossword at the start of a live lesson. Loaded by sfa-lesson.js when the teacher starts one.

   Hangman + Wheel of Fortune + a crossword. Every student who is here gets their own word in one themed crossword.
   Right answers to quick review questions (spiral review: the lessons already taught) earn letter guesses; a vowel costs
   two. When a student solves their word it fills in on the class crossword, and its letters show up for free in every
   word that crosses it. If every active student finds their word, the whole class gets a big celebration.

   How it stays in sync through the Sheet (the same way as the Lane Clash): every screen builds the identical crossword
   from the theme, a seed and the number of words, which ride in the live state (counts zbs). The console keeps who has
   which word (the spotlight, spot.q "zboard": "A:" fingerprints of the students in word order, "#N:" their first names)
   and which words are solved (counts zbw0.., 13 words to a number). Students send one running row (q "zboardx1": the
   results script counts ids ending x1 as go-further extras, so this never counts as a lesson answer). */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API, SFA = window.SFA;
  if (!A || !SFA) return;
  var H = A.H, el = A.el, esc = SFA.esc;
  var QID = 'zboardx1', SPARE = 3, MAXW = 39, PUSH_MS = 1500, VOWELS = 'AEIOU';

  /* ---------------- themes: [WORD, clue] ---------------- */
  var THEMES = [
    { id: 'poke', name: 'Pokémon', e: '⚡', words: [
      ['PIKACHU', 'Electric mouse Pokémon'], ['EEVEE', 'Brown fox that can evolve into eight types'], ['CHARMANDER', 'Fire lizard with a flame on its tail'],
      ['BULBASAUR', 'Grass starter with a bulb on its back'], ['SQUIRTLE', 'Water turtle starter'], ['SNORLAX', 'Sleeps all day and blocks the road'],
      ['JIGGLYPUFF', 'Pink singer who sends everyone to sleep'], ['MEOWTH', 'Team Rocket\'s talking cat'], ['PSYDUCK', 'Duck with a headache that never goes away'],
      ['GENGAR', 'Grinning purple ghost'], ['ONIX', 'Giant rock snake'], ['MEWTWO', 'Psychic Pokémon made in a lab'], ['LUCARIO', 'Fighter that can sense aura'],
      ['GYARADOS', 'Angry sea serpent that evolves from a floppy fish'], ['MAGIKARP', 'Fish whose only move is Splash'], ['VULPIX', 'Fire fox with six tails'],
      ['ZUBAT', 'Cave bat that is everywhere'], ['POKEBALL', 'Red and white capsule'], ['DRAGONITE', 'Friendly orange dragon'], ['CHARIZARD', 'Fire and flying dragon'],
      ['BLASTOISE', 'Turtle with water cannons on its shell'], ['GROWLITHE', 'Loyal fire puppy'], ['TOGEPI', 'Baby that still wears its eggshell'],
      ['SLOWPOKE', 'Very, very slow pink Pokémon'], ['MACHAMP', 'Fighter with four arms'], ['ABRA', 'Teleports away the moment you see it'], ['DITTO', 'Can transform into anything'],
      ['MUDKIP', 'Water starter with a fin on its head'], ['PIPLUP', 'Penguin starter'], ['ROWLET', 'Grass owl starter'], ['LITTEN', 'Fire cat starter'],
      ['GRENINJA', 'Ninja frog with a tongue scarf'], ['GARCHOMP', 'Dragon shaped like a land shark'], ['TOTODILE', 'Crocodile starter with big jaws'],
      ['TRAINER', 'Person who catches and battles Pokémon'], ['BADGE', 'What you win from a gym leader'], ['POTION', 'Heals your Pokémon'], ['EVOLVE', 'What a Pokémon does when it changes form'],
      ['LEGENDARY', 'The rarest kind of Pokémon'], ['POKEDEX', 'Device that records every Pokémon you meet']] },
    { id: 'sport', name: 'Sport and football', e: '⚽', words: [
      ['GOAL', 'What every striker wants to score'], ['STRIKER', 'Player whose job is scoring'], ['KEEPER', 'The only player allowed to use their hands'], ['PENALTY', 'A kick from the spot'],
      ['OFFSIDE', 'Flag goes up: you were behind the last defender'], ['CORNER', 'Kick taken from the edge of the pitch by the flag'], ['REFEREE', 'Blows the whistle'],
      ['DRIBBLE', 'Run with the ball at your feet'], ['TACKLE', 'Win the ball off an opponent'], ['HEADER', 'Hit the ball with your head'], ['STADIUM', 'Where the big match is played'],
      ['TROPHY', 'Lift it if you win the final'], ['WHISTLE', 'What the referee blows'], ['CAPTAIN', 'Wears the armband'], ['DEFENDER', 'Stops the other team scoring'],
      ['MIDFIELD', 'The middle of the pitch'], ['VOLLEY', 'Kick the ball before it hits the ground'], ['HATTRICK', 'Three goals by one player'], ['DERBY', 'A match between local rivals'],
      ['JERSEY', 'A team shirt'], ['BOOTS', 'Football shoes with studs'], ['PITCH', 'The grass you play on'], ['LEAGUE', 'Teams play each other all season in one'],
      ['CHAMPION', 'Winner of the whole thing'], ['MEDAL', 'Gold, silver or bronze'], ['SPRINT', 'A very fast short run'], ['RELAY', 'Race where you pass a baton'],
      ['MARATHON', 'A very long running race'], ['DUNK', 'Slam the basketball through the hoop'], ['TENNIS', 'Sport with a racket, a net and a yellow ball'], ['SERVE', 'Start a point in tennis'],
      ['OLYMPICS', 'Games held every four years with five rings'], ['COACH', 'Trains the team'], ['KICKOFF', 'How a football match starts'], ['MESSI', 'Argentina\'s little magician'],
      ['RONALDO', 'Portugal star famous for his "Siuu"'], ['SALAH', 'Egypt\'s king of the right wing'], ['MBAPPE', 'French striker with rocket speed'], ['FREEKICK', 'A set piece after a foul'],
      ['SUBSTITUTE', 'Player who comes off the bench']] },
    { id: 'games', name: 'Games and food', e: '🎮', words: [
      ['CREEPER', 'Green mob that hisses, then explodes'], ['PICKAXE', 'Tool for mining blocks'], ['DIAMOND', 'The best ore to find underground'], ['PIXEL', 'One tiny square of a screen'],
      ['RESPAWN', 'Come back after you lose a life'], ['LEVEL', 'Beat one to unlock the next'], ['BOSS', 'The big enemy at the end'], ['JOYSTICK', 'Stick you push to move'],
      ['ARCADE', 'Room full of coin games'], ['AVATAR', 'Your character in a game'], ['QUEST', 'A mission in an adventure game'], ['PORTAL', 'Step in here, come out somewhere else'],
      ['LAVA', 'Glowing orange: do not fall in'], ['COMBO', 'Moves chained together'], ['HIGHSCORE', 'The best result on the leaderboard'], ['SPEEDRUN', 'Finishing a game as fast as possible'],
      ['CONTROLLER', 'What you hold to play'], ['GLITCH', 'A bug that makes a game act weird'], ['LOOT', 'Treasure you pick up'], ['CRAFT', 'Make tools from what you collect'],
      ['PIZZA', 'Round, cheesy, comes in slices'], ['BURGER', 'Patty in a bun'], ['NACHOS', 'Tortilla chips with melted cheese'], ['POPCORN', 'Movie snack that pops'],
      ['CHOCOLATE', 'Sweet brown bar'], ['SHAWARMA', 'Meat wrap sliced off a spinning grill'], ['FALAFEL', 'Fried balls of chickpeas'], ['DONUT', 'Sweet ring with a hole in the middle'],
      ['PANCAKE', 'Flat breakfast you flip'], ['NOODLES', 'Long and slurpy'], ['TACO', 'Crunchy shell with filling'], ['WAFFLE', 'Breakfast with little squares'],
      ['SUSHI', 'Rice and fish rolled in seaweed'], ['KEBAB', 'Meat cooked on a skewer'], ['MANGO', 'Sweet orange tropical fruit'], ['SMOOTHIE', 'Blended fruit drink'],
      ['MILKSHAKE', 'Cold, thick and slurped through a straw'], ['CUPCAKE', 'Little cake with icing on top'], ['KUNAFA', 'Cheesy pastry dessert soaked in syrup'], ['CROISSANT', 'Buttery crescent pastry']] },
    { id: 'maths', name: 'Maths words', e: '📐', words: [
      ['SLOPE', 'How steep a line is: rise over run'], ['RISE', 'How far up between two points'], ['RUN', 'How far across between two points'], ['INTERCEPT', 'Where a line crosses an axis'],
      ['FUNCTION', 'A rule that gives every input exactly one output'], ['INPUT', 'What goes into a machine'], ['OUTPUT', 'What comes out of a machine'], ['RULE', 'Tells a machine what to do to its input'],
      ['RATE', 'How fast something changes'], ['LINEAR', 'The same step every time: its graph is a line'], ['NONLINEAR', 'Its steps change, so its graph curves or bends'], ['GRAPH', 'A picture of a rule on a grid'],
      ['TABLE', 'Inputs and outputs in rows'], ['ORIGIN', 'The point (0, 0)'], ['AXIS', 'One of the two number lines on a grid'], ['VARIABLE', 'A letter that stands for a number'],
      ['EQUATION', 'Two sides with an equals sign between them'], ['SOLVE', 'Find the value that makes it true'], ['UNDO', 'Run the steps backwards to find the input'], ['CHECK', 'Put your answer back in to make sure'],
      ['DOMAIN', 'All the inputs a rule can take'], ['RANGE', 'All the outputs a rule gives'], ['START', 'The output when the input is zero'], ['STEP', 'How much the output changes each time the input goes up by one'],
      ['NEGATIVE', 'Below zero; a slope that goes downhill'], ['POSITIVE', 'Above zero; a slope that goes uphill'], ['PARALLEL', 'Same slope, never meet'], ['STEEP', 'A big slope, like a cliff'],
      ['HORIZONTAL', 'Flat: slope zero'], ['VERTICAL', 'Straight up and down'], ['POINT', 'A pair of numbers on a grid'], ['COORDINATE', 'One of the two numbers in (x, y)'],
      ['QUADRANT', 'One of the four corners of the grid'], ['MAPPING', 'Arrows from inputs to outputs'], ['SQUARE', 'Multiply a number by itself'], ['ABSOLUTE', 'This value makes a V-shaped graph'],
      ['CONSTANT', 'Never changes'], ['PATTERN', 'Something that repeats or grows in a regular way'], ['PREDICT', 'Use the rule to say what comes next'], ['FRACTION', 'One half or two thirds, for example']] }
  ];
  // the mystery picture behind each theme's board
  var PIC = { poke: ['⚡', '🔥', '💧', '🌿', '⭐', '🥚', '🐉', '🎒'], sport: ['⚽', '🏆', '🥅', '🏃', '🥇', '📣', '🏀', '🎾'], games: ['🎮', '🍕', '🍔', '🍩', '💎', '👾', '🌮', '🍿'], maths: ['📈', '📐', '➗', '✖️', '📊', '🔢', '📏', '🧮'] };
  window.SFA_BOARD_THEMES = THEMES;

  /* ---------------- the crossword: the same on every screen from (theme, seed, n) ---------------- */
  function rng(seed) { var s = (seed >>> 0) || 1; return function () { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return ((s >>> 8) & 0xffff) / 65536; }; }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var built = {};
  function build(theme, seed, n) {
    var key = theme + ':' + seed + ':' + n; if (built[key]) return built[key];
    var T = THEMES[theme % THEMES.length], r = rng(seed * 7919 + theme * 31 + 7), pool = shuffle(T.words, r);
    var grid = {}, placed = [], used = {}, box = { r0: 0, r1: 0, c0: 0, c1: 0 };
    function at(rr, cc) { return grid[rr + ',' + cc]; }
    function fits(w, r0, c0, d) {
      var dr = d === 'D' ? 1 : 0, dc = d === 'A' ? 1 : 0, cross = 0;
      if (at(r0 - dr, c0 - dc) || at(r0 + dr * w.length, c0 + dc * w.length)) return -1;
      for (var k = 0; k < w.length; k++) {
        var rr = r0 + dr * k, cc = c0 + dc * k, g = at(rr, cc);
        if (g) { if (g.ch !== w[k] || g[d] != null) return -1; cross++; }
        else if (d === 'A' ? (at(rr - 1, cc) || at(rr + 1, cc)) : (at(rr, cc - 1) || at(rr, cc + 1))) return -1;
      }
      return cross;
    }
    function put(it) {
      var dr = it.d === 'D' ? 1 : 0, dc = it.d === 'A' ? 1 : 0;
      for (var k = 0; k < it.w.length; k++) { var rr = it.r + dr * k, cc = it.c + dc * k, kk = rr + ',' + cc, g = grid[kk] || (grid[kk] = { ch: it.w[k] }); g[it.d] = placed.length; box.r0 = Math.min(box.r0, rr); box.r1 = Math.max(box.r1, rr); box.c0 = Math.min(box.c0, cc); box.c1 = Math.max(box.c1, cc); }
      placed.push(it);
    }
    // a long word across the middle, then each next word where it crosses the most and keeps the grid compact
    var first = 0; for (var f = 1; f < Math.min(8, pool.length); f++) if (pool[f][0].length > pool[first][0].length) first = f;
    put({ w: pool[first][0], clue: pool[first][1], r: 0, c: 0, d: 'A' }); used[first] = 1;
    n = Math.min(n, pool.length);
    while (placed.length < n) {
      var best = null, tried = 0;
      for (var i = 0; i < pool.length && tried < 14; i++) {
        if (used[i]) continue; tried++;
        var w = pool[i][0];
        Object.keys(grid).forEach(function (kk) {
          var g = grid[kk], rc = kk.split(',').map(Number);
          for (var k = 0; k < w.length; k++) {
            if (w[k] !== g.ch) continue;
            ['A', 'D'].forEach(function (d) {
              if (g[d] != null) return;
              var r0 = d === 'D' ? rc[0] - k : rc[0], c0 = d === 'A' ? rc[1] - k : rc[1], cr = fits(w, r0, c0, d); if (cr <= 0) return;
              var rr1 = d === 'D' ? r0 + w.length - 1 : r0, cc1 = d === 'A' ? c0 + w.length - 1 : c0;
              var hgt = Math.max(box.r1, rr1) - Math.min(box.r0, r0) + 1, wid = Math.max(box.c1, cc1) - Math.min(box.c0, c0) + 1;
              var sc = cr * 30 - (hgt + wid) * 2 - Math.abs(hgt * 1.6 - wid);   // crossings, then compact and wider than tall (a screen)
              if (!best || sc > best.s) best = { i: i, r: r0, c: c0, d: d, s: sc };
            });
          }
        });
      }
      if (!best) {   // nothing crosses any more: start a new block under the grid
        for (var j = 0; j < pool.length; j++) if (!used[j]) { best = { i: j, r: box.r1 + 2, c: box.c0, d: 'A' }; break; }
        if (!best) break;
      }
      used[best.i] = 1; put({ w: pool[best.i][0], clue: pool[best.i][1], r: best.r, c: best.c, d: best.d });
    }
    // to the top-left corner; number the clues in reading order
    var cells = {}, starts = {};
    placed.forEach(function (it) { it.r -= box.r0; it.c -= box.c0; starts[it.r + ',' + it.c] = 1; });
    Object.keys(grid).forEach(function (kk) { var rc = kk.split(',').map(Number), g = grid[kk]; cells[(rc[0] - box.r0) + ',' + (rc[1] - box.c0)] = { ch: g.ch, A: g.A, D: g.D }; });
    var num = 0, numAt = {};
    Object.keys(starts).map(function (kk) { return kk.split(',').map(Number); }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }).forEach(function (rc) { numAt[rc[0] + ',' + rc[1]] = ++num; });
    placed.forEach(function (it, i) { it.i = i; it.no = numAt[it.r + ',' + it.c]; it.len = it.w.length; });
    return (built[key] = { theme: T, words: placed, cells: cells, rows: box.r1 - box.r0 + 1, cols: box.c1 - box.c0 + 1, numAt: numAt });
  }
  function cellsOf(it) { var out = []; for (var k = 0; k < it.len; k++) out.push(it.d === 'A' ? [it.r, it.c + k] : [it.r + k, it.c]); return out; }
  // the letters a student gets for free: every cell of their word that a solved word crosses
  function freeLetters(B, wi, solved) { var it = B.words[wi], out = {}; cellsOf(it).forEach(function (rc, k) { var g = B.cells[rc[0] + ',' + rc[1]], other = it.d === 'A' ? g.D : g.A; if (other != null && solved[other]) out[k] = 1; }); return out; }

  /* ---------------- the board in the live state ---------------- */
  function sh3(sid) { var h = 5381, t = String(sid); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return (h % 46656).toString(36); }
  function sNow() { return Date.now() + (A.srvSkew() || 0); }
  function boardOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zbs) || !Array.isArray(c.zbid)) return null;
    var z = c.zbs, id = A.decRun(c.zbid), start = A.MODE === 'screen' ? id : A.decRun(c.zbst) || id, solved = {};
    for (var k = 0; Array.isArray(c['zbw' + k]); k++) c['zbw' + k].forEach(function (v, j) { for (var b = 0; b < 13; b++) if (v >> b & 1) solved[k * 13 * 12 + j * 13 + b] = 1; });
    var gifts = []; for (var g = 0; Array.isArray(c['zbg' + g]); g++) c['zbg' + g].forEach(function (v, j) { gifts[g * 12 + j] = v; });
    var sp = Lv.spot && Lv.spot.q === 'zboard' ? String(Lv.spot.text || '') : '', owners = [], names = [];
    sp.split('#').forEach(function (part) { var k2 = part.slice(0, 2), v = part.slice(2); if (k2 === 'A:') owners = v.split(',').map(function (x) { return x ? x.split('+') : []; }); if (k2 === 'N:') names = v.split(','); });
    return { id: id, start: start, state: z[0], theme: z[1], seed: z[2], n: z[3], dur: z[4], all: !!z[5], solved: solved, gifts: gifts, owners: owners, names: names };
  }
  function leftOf(b) { return Math.max(0, Math.round((b.start + b.dur * 1000 - sNow()) / 1000)); }
  function solvedCount(b, B) { var n = 0, of = 0; B.words.forEach(function (w, i) { if (b.owners[i] && b.owners[i].length) { of++; if (b.solved[i]) n++; } }); return { n: n, of: of }; }

  /* =========================== student page and class screen =========================== */
  var root = null, V = null, ST = null, POOL = null, poolLoading = false;
  function key() { return 'board.' + A.LID; }
  function keep() { if (ST) SFA.store.set(key(), ST); }
  function myIdx(b) { if (!A.S.me) return -1; var f = sh3(A.S.me.sid); for (var i = 0; i < b.owners.length; i++) if (b.owners[i].indexOf(f) >= 0) return i; return -1; }

  function sync() {
    var Lv = A.live(), b = A.isLive() || A.MODE === 'screen' ? boardOf(Lv) : null;
    if (b && A.MODE !== 'teach' && b.state === 2 && sNow() - b.start > b.dur * 1000 + 150000) b = null;   // long over: gone
    if (A.MODE === 'student' && A.saving() && !A.S.me) b = null;
    if (!b) { close(); return; }
    if (!root || V.id !== b.id) open(b);
    V.b = b; V.B = build(b.theme, b.seed, b.n);
    if (A.MODE === 'student') {
      var wi = myIdx(b);
      if (wi < 0 && b.state === 1 && Date.now() - (V.joinAt || 0) > 15000) { V.joinAt = Date.now(); send(-1); }
      if (ST.w !== wi) { ST.w = wi; ST.guessed = {}; ST.gifted = {}; ST.solved = false; ST.misses = 0; ST.giftSeen = 0; keep(); }
      receiveGifts(b);
    }
    // what's new since the last update: a banner for every word solved and every gift letter sent
    if (V.prev) {
      Object.keys(b.solved).forEach(function (i) { if (!V.prev.solved[i] && V.B.words[i]) { var it = V.B.words[i]; banner('⚡ <b>' + esc(b.names[i] || 'Someone') + '</b> cracked ' + it.no + (it.d === 'A' ? ' ACROSS' : ' DOWN') + ': <b>' + it.w + '</b>!', 'solve'); } });
      b.gifts.forEach(function (g, i) { if (g > (V.prev.gifts[i] || 0) && b.owners[i] && b.owners[i].length && !b.solved[i]) banner('🎁 <b>' + esc(b.names[i] || 'A classmate') + '</b> got a gift letter!', 'gift'); });
    }
    V.prev = { solved: Object.assign({}, b.solved), gifts: b.gifts.slice() };
    var sig = [b.state, b.all, Object.keys(b.solved).join('.'), b.owners.map(function (o) { return o.join('+'); }).join(','), ST.w, A.MODE === 'student' ? ST.giftSeen : ''].join('|');
    if (sig !== V.sig) { V.sig = sig; draw(); }
  }
  function open(b) {
    close();
    var saved = SFA.store.get(key(), null);
    ST = saved && saved.id === b.id ? saved : { id: b.id, w: -1, guessed: {}, gifted: {}, credits: 1, right: 0, streak: 0, misses: 0, solved: false, qi: 0, tries: 0, fb: null, cool: 0, solveCool: 0, giftCred: 0, gifts: [], giftSeen: 0 };
    V = { id: b.id, b: b, B: build(b.theme, b.seed, b.n) };
    root = H('div', 'bb' + (A.MODE === 'screen' ? ' screen' : '')); root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'The Big Board: class crossword');
    document.body.appendChild(root); document.body.classList.add('boarding');
    if (A.MODE === 'student') loadPool();
    V.tick = setInterval(function () { if (root) drawTop(); }, 1000);
  }
  // a classmate sent gift letters to my word: reveal that many letters I don't have yet
  function receiveGifts(b) {
    var it = V.B.words[ST.w]; if (!it) return;
    var got = b.gifts[ST.w] || 0, fresh = got - (ST.giftSeen || 0); if (fresh <= 0) return;
    ST.giftSeen = got; ST.gifted = ST.gifted || {};
    var news = [];
    for (var n = 0; n < fresh; n++) {
      var hidden = []; for (var k = 0; k < it.len; k++) if (!shown(k) && hidden.indexOf(it.w[k]) < 0) hidden.push(it.w[k]);
      if (!hidden.length) break;
      var ch = hidden[Math.floor(Math.random() * hidden.length)]; ST.guessed[ch] = true; ST.gifted[ch] = 1; news.push(ch);
    }
    if (news.length) { SFA.toast('🎁 A classmate sent you ' + (news.length === 1 ? 'a letter: ' : 'letters: ') + news.join(', '), 4000); snd('gift'); }
    var all = true; for (var j = 0; j < it.len; j++) if (!shown(j)) all = false;
    if (all && !ST.solved) { ST.solved = true; A.confetti(); send(); }
    keep();
  }
  // banners across the top of every screen: who cracked what, who got a gift
  function banner(html, kind) { V.bq = V.bq || []; V.bq.push({ html: html, kind: kind }); nextBanner(); }
  function nextBanner() {
    if (!root || V.bbusy || !V.bq || !V.bq.length) return;
    var o = V.bq.shift(); V.bbusy = true; snd(o.kind);
    var b = H('div', 'bbban ' + o.kind + (A.MODE === 'screen' ? ' big' : ''), o.html); document.body.appendChild(b);   // outside the board, so a redraw can't wipe it
    setTimeout(function () { b.classList.add('out'); }, A.MODE === 'screen' ? 2600 : 2000);
    setTimeout(function () { b.remove(); if (V) { V.bbusy = false; nextBanner(); } }, A.MODE === 'screen' ? 3000 : 2400);
  }
  // sound: little synthesised effects, off until someone turns them on
  var AC = null;
  function soundOn() { return !!SFA.store.get('board.sound', false); }
  function snd(k) {
    if (!soundOn()) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var t = AC.currentTime, notes = { solve: [523, 659, 784], gift: [880, 1175], tick: [440], party: [523, 659, 784, 1047, 1319] }[k] || [600];
      notes.forEach(function (f, i) { var o = AC.createOscillator(), g = AC.createGain(); o.type = k === 'tick' ? 'square' : 'triangle'; o.frequency.value = f; o.connect(g); g.connect(AC.destination); var t0 = t + i * 0.11; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(k === 'tick' ? 0.05 : 0.12, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28); o.start(t0); o.stop(t0 + 0.3); });
    } catch (e) { }
  }
  function close() { if (!root) return; clearInterval(V.tick); [].forEach.call(document.querySelectorAll('.bbban'), function (x) { x.remove(); }); root.remove(); root = null; V = null; document.body.classList.remove('boarding'); }

  // spiral review: number and multiple-choice questions (and their extras) from the lessons already taught, newest first
  function loadPool() {
    if (POOL || poolLoading) return; poolLoading = true;
    var me = A.LES(), plan = (window.SFA_PLAN || []).filter(function (p) { return p.n < me.n; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 5), got = [], k = 0, keepFn = window.SFA_LESSON;
    function take(L) {
      L.slides.forEach(function (s) {
        if (s.k === 'number' && s.ans != null) got.push({ k: 'number', q: s.q, ans: s.ans, tol: s.tol, fig: s.fig, why: s.why, from: L.label || 'Lesson ' + L.n });
        if (s.k === 'poll' && s.ans != null && !s.warm) got.push({ k: 'poll', q: s.q, opts: s.opts, ans: s.ans, fig: s.fig, why: s.why, from: L.label || 'Lesson ' + L.n });
        (s.more || []).forEach(function (m) { if ((m.k === 'number' || m.k === 'poll') && m.ans != null) got.push(Object.assign({ from: L.label || 'Lesson ' + L.n }, m)); });
      });
    }
    (function next() {
      if (k >= plan.length) {
        window.SFA_LESSON = keepFn; poolLoading = false;
        if (!got.length) take(me);   // the first lesson: nothing earlier, so today's
        var r = rng((A.S.me ? parseInt(sh3(A.S.me.sid), 36) * 977 : 1) + (ST ? Math.round(ST.id / 1000) % 100000 : 0));
        POOL = shuffle(got, r); draw(); return;
      }
      window.SFA_LESSON = function (L) { take(L); };
      var s = document.createElement('script'); s.src = 'lessons/L' + plan[k++].l + '.js'; s.onload = s.onerror = function () { s.remove(); next(); }; document.head.appendChild(s);
    })();
  }

  var sendT = null;
  function send(w) {
    clearTimeout(sendT);
    var word = w == null ? ST.w : w, rev = 0;
    if (word >= 0 && V && V.B.words[word]) { var it = V.B.words[word]; for (var k = 0; k < it.len; k++) if (shown(k)) rev++; }
    A.record({ id: QID, k: 'open' }, 'b1;id:' + Math.round(V.id / 1000) + ';w:' + word + ';s:' + (ST.solved ? 1 : 0) + ';r:' + ST.right + ';m:' + ST.misses + ';k:' + rev + (ST.gifts && ST.gifts.length ? ';gv:' + ST.gifts.join('.') : ''), null);
  }
  function sendSoon() { clearTimeout(sendT); sendT = setTimeout(function () { send(); }, 3000); }

  function shown(k) {   // is letter k of my word showing? (guessed, free from a crossing word, or solved)
    var it = V.B.words[ST.w]; if (!it) return false;
    if (ST.solved || V.b.solved[ST.w]) return true;
    if (ST.guessed[it.w[k]]) return true;
    return !!freeLetters(V.B, ST.w, V.b.solved)[k];
  }

  /* ---------- drawing ---------- */
  function drawTop() {
    var b = V.b, B = V.B, t = root.querySelector('.bbtop'); if (!t) return;
    var sc = solvedCount(b, B), left = leftOf(b);
    t.querySelector('.bbclock').textContent = b.all ? '🎉' : b.state === 2 ? 'Time!' : Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2);
    t.querySelector('.bbprog b').textContent = sc.n + ' of ' + sc.of;
    t.querySelector('.bbbar i').style.width = (sc.of ? Math.round(100 * sc.n / sc.of) : 0) + '%';
    var rem = sc.of - sc.n, tg = t.querySelector('.bbtogo');
    tg.hidden = !(b.state === 1 && rem > 0 && rem <= 3); tg.textContent = rem === 1 ? '1 WORD TO GO!' : rem + ' WORDS TO GO!';
    // the last ten seconds, huge
    var cd = root.querySelector('.bbcount');
    if (b.state === 1 && left > 0 && left <= 10 && !b.all) { if (!cd) { cd = H('div', 'bbcount'); root.appendChild(cd); } if (cd.textContent !== String(left)) { cd.textContent = left; cd.classList.remove('beat'); void cd.offsetWidth; cd.classList.add('beat'); snd('tick'); } }
    else if (cd) cd.remove();
  }
  function grid(B, b, opts) {
    opts = opts || {};
    var wrap = H('div', 'bbgrid'), cs = opts.cell || 34;
    wrap.style.width = (B.cols * cs) + 'px'; wrap.style.height = (B.rows * cs) + 'px'; wrap.style.setProperty('--cs', cs + 'px');
    var mine = opts.mine >= 0 ? B.words[opts.mine] : null, mineCells = {};
    if (mine) cellsOf(mine).forEach(function (rc, k) { mineCells[rc[0] + ',' + rc[1]] = k; });
    var owned = function (i) { return i != null && b.owners[i] && b.owners[i].length; };
    Object.keys(B.cells).forEach(function (kk) {
      var g = B.cells[kk]; if (!owned(g.A) && !owned(g.D) && !(kk in mineCells)) return;
      var rc = kk.split(',').map(Number), on = (g.A != null && b.solved[g.A]) || (g.D != null && b.solved[g.D]);
      var cell = H('div', 'bbcell' + (on ? ' on' : '') + (kk in mineCells ? ' mine' : ''));
      cell.style.left = (rc[1] * cs) + 'px'; cell.style.top = (rc[0] * cs) + 'px';
      if (B.numAt[kk]) cell.appendChild(H('small', '', String(B.numAt[kk])));
      var showCh = on || (kk in mineCells && opts.shown && opts.shown(mineCells[kk]));
      if (showCh) cell.appendChild(H('b', '', g.ch));
      wrap.appendChild(cell);
    });
    // who found each word (class screen and the teacher's view)
    if (opts.names) B.words.forEach(function (it, i) { if (!b.solved[i] || !b.names[i]) return; var tg = H('span', 'bbwho', esc(b.names[i])); tg.style.left = (it.c * cs) + 'px'; tg.style.top = (it.r * cs - 16) + 'px'; wrap.appendChild(tg); });
    return wrap;
  }
  function fitGrid(B, w, h) { return Math.max(14, Math.min(46, Math.floor(Math.min(w / B.cols, h / B.rows)))); }

  function draw() {
    if (!root) return;
    var b = V.b, B = V.B, T = B.theme;
    var typed = {}, focus = document.activeElement && root.contains(document.activeElement) ? document.activeElement.getAttribute('aria-label') : null;
    [].forEach.call(root.querySelectorAll('input'), function (x) { typed[x.getAttribute('aria-label')] = x.value; });
    root.innerHTML = '';
    setTimeout(function () { if (!root) return; [].forEach.call(root.querySelectorAll('input'), function (x) { var k = x.getAttribute('aria-label'); if (typed[k]) x.value = typed[k]; if (k === focus) x.focus({ preventScroll: true }); }); nextBanner(); }, 0);
    var top = H('div', 'bbtop', '<span class="bbtitle">' + T.e + ' THE BIG BOARD <small>' + esc(T.name) + '</small></span><span class="bbprog"><b></b> words found</span><span class="bbbar"><i></i></span><span class="bbtogo" hidden></span><span class="bbclock"></span><button type="button" class="bbsnd" title="Sound effects">' + (soundOn() ? '🔊' : '🔇') + '</button>');
    root.appendChild(top);
    top.querySelector('.bbsnd').onclick = function () { SFA.store.set('board.sound', !soundOn()); this.textContent = soundOn() ? '🔊' : '🔇'; snd('gift'); };
    drawTop();
    if (b.all) { party(); }
    if (A.MODE !== 'student') return drawClass();
    var body = H('div', 'bbbody'); root.appendChild(body);
    var it = B.words[ST.w];
    if (!it) { body.appendChild(H('div', 'bbwait', b.state === 1 ? '<b>Getting your word…</b><p>Mr. Crowell\'s console hands out words every few seconds.</p>' : '<b>The Big Board is over.</b>')); return; }
    var left = H('div', 'bbleft'); body.appendChild(left);
    // my word: tiles, the clue, my letters and misses
    var mineBox = H('div', 'bbmine');
    mineBox.appendChild(H('p', 'bbclue', '<b>' + it.no + (it.d === 'A' ? ' across' : ' down') + '</b> · ' + esc(it.clue) + ' <span>(' + it.len + ' letters)</span>'));
    var tiles = H('div', 'bbtiles'), free = freeLetters(B, ST.w, b.solved);
    for (var k = 0; k < it.len; k++) { var sh = shown(k); tiles.appendChild(H('span', 'bbtile' + (sh ? ' on' : '') + (sh && !ST.solved && ((free[k] && !ST.guessed[it.w[k]]) || (ST.gifted && ST.gifted[it.w[k]])) ? ' gift' : ''), sh ? it.w[k] : '')); }
    mineBox.appendChild(tiles);
    var solvedNow = ST.solved || b.solved[ST.w];
    if (solvedNow) { mineBox.appendChild(H('p', 'bbwin', '🎉 You found it! It\'s on the class board now, and its letters are helping the words that cross it.')); helper(mineBox); }
    else {
      mineBox.appendChild(H('p', 'bbstat', '🔤 <b>' + ST.credits + '</b> letter guess' + (ST.credits === 1 ? '' : 'es') + ' · a vowel costs 2 · misses ' + '●'.repeat(Math.min(ST.misses, 8)) + '<span class="off">' + '●'.repeat(Math.max(0, 5 - ST.misses % 5)) + '</span>'));
      if (Object.keys(free).length || (ST.gifted && Object.keys(ST.gifted).length)) mineBox.appendChild(H('p', 'bbgifttxt', '🎁 Gold letters came free from your classmates: words that cross yours, and gifts.'));
      // the letter keys
      var keys = H('div', 'bbkeys');
      'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').forEach(function (ch) {
        var used = ST.guessed[ch] != null, isV = VOWELS.indexOf(ch) >= 0, cost = isV ? 2 : 1;
        var bt = el('button', { type: 'button', 'class': 'bbkey' + (isV ? ' v' : '') + (used ? (ST.guessed[ch] ? ' hit' : ' miss') : '') + (!used && ST.credits < cost ? ' poor' : ''), text: ch });
        bt.disabled = used || b.state !== 1; bt.onclick = function () { guess(ch); };
        keys.appendChild(bt);
      });
      mineBox.appendChild(keys);
      // solve the whole word
      var row = H('div', 'row bbsolve'), inp = el('input', { type: 'text', placeholder: 'Know it? Type the whole word', 'aria-label': 'Solve your word', autocomplete: 'off' }), go = el('button', { type: 'button', 'class': 'btn primary', text: 'Solve' });
      var cd = Math.max(0, ST.solveCool - Date.now());
      if (cd) { go.disabled = true; go.textContent = 'Wait ' + Math.ceil(cd / 1000); setTimeout(function () { if (root) draw(); }, 1000); }
      go.onclick = function () { solve(inp.value); }; inp.onkeydown = function (e) { if (e.key === 'Enter') solve(inp.value); };
      row.appendChild(inp); row.appendChild(go); mineBox.appendChild(row);
    }
    left.appendChild(mineBox);
    // the class crossword, my word outlined
    var gb = H('div', 'bbmini'); var cs = fitGrid(B, Math.min(520, (window.innerWidth || 800) * 0.42), 260);
    gb.appendChild(grid(B, b, { cell: cs, mine: ST.w, shown: shown })); left.appendChild(gb);
    // questions: the only way to earn letters
    var qb = H('div', 'bbq'); body.appendChild(qb); drawQ(qb);
  }
  // helper mode: send a gift letter to a classmate who is still looking (words that cross mine first)
  function helper(box) {
    var b = V.b, B = V.B, me = B.words[ST.w], crossing = {};
    cellsOf(me).forEach(function (rc) { var g = B.cells[rc[0] + ',' + rc[1]], o = me.d === 'A' ? g.D : g.A; if (o != null) crossing[o] = 1; });
    var open = B.words.map(function (w, i) { return i; }).filter(function (i) { return i !== ST.w && b.owners[i] && b.owners[i].length && !b.solved[i]; })
      .sort(function (x, y) { return (crossing[y] ? 1 : 0) - (crossing[x] ? 1 : 0) || (b.gifts[x] || 0) - (b.gifts[y] || 0); });
    var hb = H('div', 'bbhelp'); box.appendChild(hb);
    hb.appendChild(H('p', 'bbhelpt', '🎁 <b>Helper mode.</b> Every right answer now earns a gift letter. You have <b>' + (ST.giftCred || 0) + '</b>. Send one to a classmate who is still looking:'));
    if (!open.length) { hb.appendChild(H('p', 'muted', 'Everyone else has found their word!')); return; }
    var list = H('div', 'bbhelpl'); hb.appendChild(list);
    open.slice(0, 12).forEach(function (i) {
      var it = B.words[i], bt = el('button', { type: 'button', 'class': 'btn small' + (crossing[i] ? ' cross' : ''), text: (b.names[i] || 'Someone') + ' · ' + it.no + (it.d === 'A' ? 'A' : 'D') + (crossing[i] ? ' · crosses yours' : '') });
      bt.disabled = !(ST.giftCred > 0) || b.state !== 1;
      bt.onclick = function () { if (!(ST.giftCred > 0)) return; ST.giftCred--; ST.gifts = (ST.gifts || []).concat([i]).slice(-80); keep(); send(); snd('gift'); SFA.toast('🎁 Sent a letter to ' + (b.names[i] || 'a classmate') + '!', 2500); draw(); };
      list.appendChild(bt);
    });
  }
  function drawQ(box) {
    box.innerHTML = '';
    if (V.b.state !== 1) { box.appendChild(H('p', 'q', 'Time is up.')); return; }
    if (!POOL) { box.appendChild(H('p', 'q', 'Loading questions…')); return; }
    if (!POOL.length) { box.appendChild(H('p', 'q', 'No questions found.')); return; }
    var q = POOL[ST.qi % POOL.length];
    box.appendChild(H('p', 'kick', 'Answer to earn letters · from ' + esc(q.from || 'earlier') + (ST.streak >= 2 ? ' · 🔥 ' + ST.streak + ' in a row' : '')));
    box.appendChild(H('p', 'q', A.fmt(q.q)));
    if (q.fig) { var f = H('div', 'cfig'); try { f.appendChild(A.figure(q.fig)); box.appendChild(f); } catch (e) { } }
    if (ST.fb) {
      box.appendChild(H('div', ST.fb.ok ? 'fb good' : 'fb try', ST.fb.html));
      var wait = Math.max(0, ST.cool - Date.now()), nx = el('button', { type: 'button', 'class': 'btn primary', text: wait ? 'Next in ' + Math.ceil(wait / 1000) : 'Next question ▶' });
      if (wait) { nx.disabled = true; setTimeout(function () { if (root) draw(); }, 1000); }
      nx.onclick = function () { ST.fb = null; ST.qi++; ST.tries = 0; keep(); draw(); };
      box.appendChild(nx); return;
    }
    function right() {
      var first = !ST.tries; ST.streak = first ? ST.streak + 1 : 0; ST.right++;
      var got = 1 + (first && ST.streak % 3 === 0 ? 1 : 0), helping = ST.solved || V.b.solved[ST.w];
      if (helping) ST.giftCred = (ST.giftCred || 0) + got; else ST.credits += got;
      ST.fb = { ok: true, html: '<b>Yes! +' + got + (helping ? ' gift letter' + (got > 1 ? 's' : '') + ' to send' : ' letter guess' + (got > 1 ? 'es' : '')) + '.</b>' + (got > 1 ? ' 🔥 Three in a row!' : '') };
      sendSoon(); keep(); draw();
    }
    function wrong() { ST.streak = 0; ST.cool = Date.now() + 4000; ST.fb = { ok: false, html: '<b>The answer is ' + esc(q.k === 'poll' ? A.letter(q.ans) : A.numTxt(q.ans)) + '.</b> ' + A.fmt(q.why || '') }; keep(); draw(); }
    if (q.k === 'number') {
      var inp = el('input', { type: 'text', inputmode: 'decimal', placeholder: 'Type a number', 'aria-label': 'Answer', autocomplete: 'off' }), go = el('button', { type: 'button', 'class': 'btn primary', text: 'Check' }), row = H('div', 'row');
      row.appendChild(inp); row.appendChild(go); box.appendChild(row);
      if (ST.tries) box.appendChild(H('p', 'state', 'Not yet: one more try.'));
      var check = function () { var v = A.numOf(inp.value); if (!inp.value.trim() || isNaN(v)) return inp.focus(); if (Math.abs(v - q.ans) <= (q.tol || 1e-9) + 1e-9) right(); else if (!ST.tries) { ST.tries = 1; keep(); draw(); } else wrong(); };
      go.onclick = check; inp.onkeydown = function (e) { if (e.key === 'Enter') check(); };
    } else {
      var list = H('div', 'opts'); box.appendChild(list);
      q.opts.forEach(function (o, k) { var bt = el('button', { type: 'button', 'class': 'opt' }); bt.appendChild(H('span', 'L', A.letter(k))); bt.appendChild(H('span', 't', A.fmt(o))); bt.onclick = function () { if (k === q.ans) right(); else wrong(); }; list.appendChild(bt); });
    }
  }
  function guess(ch) {
    var it = V.B.words[ST.w], cost = VOWELS.indexOf(ch) >= 0 ? 2 : 1;
    if (!it || ST.guessed[ch] != null) return;
    if (ST.credits < cost) { SFA.toast(cost === 2 ? 'A vowel costs 2 letter guesses. Answer a question to earn more.' : 'Answer a question to earn a letter guess.'); return; }
    ST.credits -= cost; var hit = it.w.indexOf(ch) >= 0; ST.guessed[ch] = hit;
    if (!hit) {
      ST.misses++;
      if (ST.misses % 5 === 0) {   // every fifth miss, a free letter so nobody gets stuck
        var hidden = []; for (var k = 0; k < it.len; k++) if (!shown(k)) hidden.push(it.w[k]);
        if (hidden.length) { var gift = hidden[Math.floor(Math.random() * hidden.length)]; ST.guessed[gift] = true; SFA.toast('🎁 Five misses: here\'s a free letter, ' + gift + '.', 3500); }
      }
    }
    var all = true; for (var j = 0; j < it.len; j++) if (!shown(j)) all = false;
    if (all) { ST.solved = true; A.confetti(); send(); } else sendSoon();
    keep(); draw();
  }
  function solve(txt) {
    var it = V.B.words[ST.w], t = String(txt || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (!it || !t) return;
    if (t === it.w) { ST.solved = true; A.confetti(); keep(); send(); draw(); return; }
    ST.misses++; ST.solveCool = Date.now() + 8000; keep(); sendSoon(); SFA.toast('Not quite. Try again in a few seconds.', 2500); draw();
  }

  // the class screen (and the teacher's view): the whole crossword, who found what, and the clues still open
  function drawClass() {
    var b = V.b, B = V.B, body = H('div', 'bbclass'); root.appendChild(body);
    var w = (window.innerWidth || 1000) * (A.MODE === 'screen' ? 0.62 : 0.6), h = (window.innerHeight || 700) * 0.7;
    var gw = H('div', 'bbbig'); gw.appendChild(grid(B, b, { cell: fitGrid(B, w, h), names: true })); body.appendChild(gw);
    var side = H('div', 'bbside'); body.appendChild(side);
    var sc = solvedCount(b, B), pc = document.createElement('canvas'); pc.className = 'bbpic'; pc.width = 480; pc.height = 300; picture(pc, B.theme, b.all ? 1 : sc.of ? sc.n / sc.of : 0, b.seed); side.appendChild(H('p', 'bbpict', b.all ? '🖼️ The mystery picture!' : '🖼️ Mystery picture: every word found uncovers more'));
    side.appendChild(pc);
    var cl = H('div', 'bbclues'), open = B.words.filter(function (it, i) { return b.owners[i] && b.owners[i].length && !b.solved[i]; });
    cl.appendChild(H('h3', '', open.length ? 'Still to find' : 'Every word found!'));
    open.slice(0, 18).forEach(function (it) { cl.appendChild(H('p', '', '<b>' + it.no + (it.d === 'A' ? 'A' : 'D') + '</b> ' + esc(it.clue) + ' <span>(' + it.len + ')</span>')); });
    if (open.length > 18) cl.appendChild(H('p', 'muted', '…and ' + (open.length - 18) + ' more'));
    side.appendChild(cl);
    if (V.watch) { var x = el('button', { type: 'button', 'class': 'btn bbback', text: '✕ Back to the console' }); x.onclick = function () { close(); }; root.appendChild(x); }
  }

  // a picture made of the theme's emoji, under 24 tiles that come off as the class finds words
  function picture(cv, T, frac, seed) {
    var c = cv.getContext('2d'), W = cv.width, Hh = cv.height, r = rng(seed * 13 + 5), em = PIC[T.id] || ['⭐'];
    var g = c.createLinearGradient(0, 0, W, Hh); g.addColorStop(0, '#2b3570'); g.addColorStop(1, '#7a3e9e'); c.fillStyle = g; c.fillRect(0, 0, W, Hh);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (var i = 0; i < 26; i++) { c.font = Math.round(26 + r() * 30) + 'px serif'; c.fillText(em[i % em.length], r() * W, r() * Hh); }
    c.font = '150px serif'; c.fillText(T.e, W / 2, Hh / 2 + 8);
    c.font = '400 34px "Luckiest Guy", sans-serif'; c.fillStyle = '#FFE14D'; c.strokeStyle = '#1b1a22'; c.lineWidth = 6; c.strokeText('WELL DONE, CLASS!', W / 2, Hh - 30); c.fillText('WELL DONE, CLASS!', W / 2, Hh - 30);
    var cols = 6, rows = 4, tw = W / cols, th = Hh / rows, order = shuffle(Array.from({ length: cols * rows }, function (x, i) { return i; }), r), off = Math.round(frac * cols * rows);
    order.slice(off).forEach(function (t) { var x = (t % cols) * tw, y = Math.floor(t / cols) * th; c.fillStyle = '#151a33'; c.fillRect(x + 1, y + 1, tw - 2, th - 2); c.fillStyle = '#39406a'; c.font = '400 30px "Luckiest Guy", sans-serif'; c.fillText('?', x + tw / 2, y + th / 2 + 2); });
  }
  // every word found: the whole class celebrates
  function party() {
    if (V.partyEl) { root.appendChild(V.partyEl); return; }
    var p = H('div', 'bbparty', '<div class="in"><h1>EVERY WORD FOUND!</h1><p>The whole class cracked the Big Board. ' + (V.b.names.filter(Boolean).length) + ' words, ' + (V.b.names.filter(Boolean).length) + ' heroes.</p><div class="bbnames">' + V.b.names.filter(Boolean).map(function (n) { return '<span>' + esc(n) + '</span>'; }).join('') + '</div></div>');
    var parade = H('div', 'bbparade');
    if (window.SFA_SPRITES && window.SFA_SPRITES.ready && SFA_SPRITES.ready()) ['gus', 'one', 'zero', 'sam', 'pigeon', 'max', 'priya', 'marcus'].forEach(function (w, i) {
      var s = SFA_SPRITES.get(w); if (!s) return; var cv = document.createElement('canvas'), k = Math.min(90 / s.w, 120 / s.h); cv.width = Math.round(s.w * k); cv.height = Math.round(s.h * k); cv.getContext('2d').drawImage(s.frames[0], 0, 0, cv.width, cv.height); cv.style.animationDelay = (i * 0.35) + 's'; parade.appendChild(cv);
    });
    p.appendChild(parade); root.appendChild(p); V.partyEl = p;
    snd('party'); var n = 0; (function boom() { if (!root || n++ > 6) return; A.confetti(); setTimeout(boom, 900); })();
  }

  /* =========================== the teacher console =========================== */
  function C() { return A.console_().board; }
  function active() {   // students here today: anyone with a row in this run of the lesson
    var ids = {}; A.rosterIn().forEach(function (r) { ids[r.sid] = r; });
    var here = {}; (A.consoleAnswers() || []).forEach(function (a) { if (ids[a.sid] && !A.beforeRun(a)) here[a.sid] = 1; });
    return Object.keys(here).map(function (s) { return ids[s]; });
  }
  function start(theme, mins) {
    var who = active(), r = rng(Date.now() % 100000), order = shuffle(who, r);
    var n = Math.max(6, Math.min(MAXW, order.length + SPARE)), t = Math.round(Date.now() / 1000) * 1000;
    var K = A.console_().board = { id: t, state: 1, theme: theme, seed: 1 + Math.floor(r() * 9000), n: n, dur: Math.round((mins || 6) * 60), owners: [], solved: {}, last: 0, lastPush: 0 };
    var B = build(K.theme, K.seed, K.n); K.n = B.words.length;
    // students get the shorter words; the longest are left as spares for anyone who arrives late
    var idx = B.words.map(function (w, i) { return i; }).sort(function (a, b) { return B.words[a].len - B.words[b].len; });
    order.forEach(function (s, i) { K.owners[idx[i]] = [s.sid]; });
    for (var i = 0; i < K.n; i++) K.owners[i] = K.owners[i] || [];
    A.pushLive(); A.consolePanel();
  }
  function nameOf(sid) { var r = A.rosterIn().filter(function (x) { return x.sid === sid; })[0]; return r ? A.first(r.name).replace(/[^A-Za-zÀ-ÿ' -]/g, '').slice(0, 10) : ''; }
  function agg() {
    var K = C(); if (!K || K.state !== 1) return;
    var key2 = 'id:' + Math.round(K.id / 1000) + ';', last = {}, changed = false;
    (A.consoleAnswers() || []).forEach(function (a) { if (a.q === QID && String(a.answer).indexOf(key2) >= 0 && (!last[a.sid] || String(a.time) >= String(last[a.sid].time))) last[a.sid] = a; });
    K.prog = K.prog || {};
    var gifts = [];
    Object.keys(last).forEach(function (sid) {
      var s = String(last[sid].answer), get = function (k) { var m = s.match(new RegExp(';' + k + ':(-?\\d+)')); return m ? +m[1] : 0; };
      var w = get('w'), mineAt = -1; K.owners.forEach(function (o, i) { if (o.indexOf(sid) >= 0) mineAt = i; });
      if (mineAt < 0) {   // someone new: a spare word, or share an unsolved one
        var spare = K.owners.findIndex(function (o) { return !o.length; });
        if (spare < 0) { var open = K.owners.map(function (o, i) { return i; }).filter(function (i) { return !K.solved[i]; }); spare = open.length ? open[Math.floor(Math.random() * open.length)] : 0; }
        K.owners[spare].push(sid); changed = true; return;
      }
      K.prog[sid] = { w: mineAt, k: get('k'), r: get('r'), m: get('m') };
      ((s.match(/;gv:([0-9.]*)/) || [, ''])[1]).split('.').filter(Boolean).forEach(function (t) { var ti = +t; if (ti >= 0 && ti < K.n) gifts[ti] = (gifts[ti] || 0) + 1; });
      if (w === mineAt && get('s') === 1 && !K.solved[mineAt]) { K.solved[mineAt] = 1; changed = true; }
    });
    for (var gi = 0; gi < K.n; gi++) if ((gifts[gi] || 0) > ((K.gifts || [])[gi] || 0)) { K.gifts = K.gifts || []; K.gifts[gi] = gifts[gi]; changed = true; }
    var owned = 0, done = 0; K.owners.forEach(function (o, i) { if (o.length) { owned++; if (K.solved[i]) done++; } });
    if (owned && done === owned) { K.all = true; end(); return; }
    if (changed) { (A.pushNow || A.pushLive)(); A.consolePanel(); }
  }
  function end() { var K = C(); if (!K) return; K.state = 2; K.endedAt = Date.now(); A.pushLive(); A.consolePanel(); }
  function tick() {
    var K = C(); if (!K) return;
    if (K.state === 1 && Date.now() >= K.id + K.dur * 1000) end();
    if (Date.now() - K.lastPush >= PUSH_MS * 4) { K.lastPush = Date.now(); (A.pushNow || A.pushLive)(); }
    if (root && V && V.watch) { var b = watchState(), sig = [b.state, b.all, Object.keys(b.solved).join('.'), b.owners.join(',')].join('|'); V.b = b; if (sig !== V.sig) { V.sig = sig; draw(); } }
  }
  function counts(out) {
    var K = C(); if (!K) return;
    out.zbid = A.encRun(K.id); out.zbst = A.encRun(K.id + (A.console_().skew || 0));
    out.zbs = [K.state, K.theme, K.seed, K.n, Math.min(9999, K.dur), K.all ? 1 : 0];
    if (K.gifts && K.gifts.length) for (var g = 0; g * 12 < K.n; g++) { var ga = []; for (var j = 0; j < 12 && g * 12 + j < K.n; j++) ga.push(Math.min(9999, (K.gifts[g * 12 + j] || 0))); out['zbg' + g] = ga; }
    for (var k = 0; k * 13 * 12 < K.n; k++) { var arr = []; for (var j = 0; j < 12; j++) { var v = 0; for (var b = 0; b < 13; b++) if (K.solved[k * 156 + j * 13 + b]) v |= 1 << b; arr.push(v); if (k * 156 + (j + 1) * 13 >= K.n) break; } out['zbw' + k] = arr; }
  }
  function spot() {
    var K = C(), A2 = K.owners.map(function (o) { return o.map(sh3).join('+'); }).join(','), N = K.owners.map(function (o) { return o.length ? nameOf(o[0]) : ''; }).join(',');
    return { q: 'zboard', text: ('A:' + A2 + '#N:' + N).slice(0, 600) };
  }
  function restore(Lv) {
    var b = boardOf(Lv); if (!b) return false;
    if (b.state === 2 || Date.now() - b.id > b.dur * 1000 + 60000) { A.console_().board = null; return false; }
    var bySh = {}; A.rosterIn().forEach(function (r) { bySh[sh3(r.sid)] = r.sid; });
    A.console_().board = { id: b.id, state: b.state, theme: b.theme, seed: b.seed, n: b.n, dur: b.dur, all: b.all, solved: b.solved, gifts: b.gifts.slice(), owners: b.owners.map(function (o) { return o.map(function (f) { return bySh[f]; }).filter(Boolean); }), lastPush: 0 };
    for (var i = A.console_().board.owners.length; i < b.n; i++) A.console_().board.owners.push([]);
    return true;
  }
  function watchState() { var K = C(); return { id: K.id, start: K.id, state: K.state, theme: K.theme, seed: K.seed, n: K.n, dur: K.dur, all: !!K.all, solved: K.solved, gifts: (K.gifts || []).slice(), owners: K.owners.map(function (o) { return o.map(sh3); }), names: K.owners.map(function (o) { return o.length ? nameOf(o[0]) : ''; }) }; }
  function watch() { var b = watchState(); open(b); V.watch = true; V.b = b; draw(); }
  function section(p) {
    var K = C(), sec = H('div', 'sect'), B = build(K.theme, K.seed, K.n), T = B.theme;
    sec.appendChild(H('h3', '', T.e + ' The Big Board · ' + esc(T.name)));
    var owned = K.owners.filter(function (o) { return o.length; }).length, done = Object.keys(K.solved).filter(function (i) { return K.owners[i] && K.owners[i].length; }).length, left = Math.max(0, Math.round((K.id + K.dur * 1000 - Date.now()) / 1000));
    sec.appendChild(H('p', '', (K.state === 1 ? '<b>' + Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2) + '</b> left · ' : K.all ? '<b>🎉 Every word found!</b> · ' : '<b>Time.</b> ') + '<b>' + done + ' of ' + owned + '</b> words found · ' + B.words.length + ' words in the crossword'));
    // who is where: stuck students first
    var rows = [];
    K.owners.forEach(function (o, i) { o.forEach(function (sid) { var pr = (K.prog || {})[sid] || { k: 0, r: 0 }; rows.push({ n: nameOf(sid), sid: sid, w: B.words[i], done: !!K.solved[i], k: pr.k, r: pr.r }); }); });
    rows.sort(function (a, b) { return (a.done ? 1 : 0) - (b.done ? 1 : 0) || a.k / a.w.len - b.k / b.w.len; });
    if (rows.length) sec.appendChild(H('p', 'muted', rows.map(function (x) { return (x.done ? '✅ ' : '🔤 ') + esc(x.n) + (x.done ? '' : ' ' + x.k + '/' + x.w.len + (x.r ? ' · ' + x.r + '✓' : '')); }).join(' · ')));
    var r = H('div', 'row');
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: '👁 Show the board', title: 'The whole crossword on this screen', onclick: function () { watch(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '⏰ +1 minute', onclick: function () { K.dur += 60; A.pushLive(); A.consolePanel(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: 'End it now', onclick: function () { end(); } }));
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: 'Back to the lesson', onclick: function () { A.console_().board = null; if (root) close(); A.pushLive(); A.consolePanel(); } }));
    sec.appendChild(r); p.appendChild(sec);
  }
  (A.every || function (f, ms) { setInterval(f, ms); })(function () { if (A.MODE === 'teach' && A.console_() && C()) tick(); }, 1000);

  window.SFA_BOARD = { sync: sync, agg: agg, section: section, start: start, counts: counts, spot: spot, restore: restore, boardOf: boardOf, build: build, THEMES: THEMES };
})();
