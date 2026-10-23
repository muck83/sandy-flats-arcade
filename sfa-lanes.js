/* Lane Clash: the battle rules. Shared by the teacher console (which runs the real battle), every student page and the
   class screen (which play it forward between the console's snapshots), and the playtest page. No DOM in here.

   Plants vs Zombies, but both teams attack and defend. Three lanes. Team 0's vault is on the left (x = 0), team 1's on
   the right (x = LEN). Attackers march at the enemy vault and grab gold if they get through. Defenders are planted on
   tiles in your own half and never move: Squaring Sam is a wall, Priya's Pea Pigeon shoots down the lane. Zero rolls
   down a lane erasing every enemy. Each vault has a Mux the Machine in every lane: the first enemy to reach it sets
   Mux charging down the lane, flattening every attacker in it. Once per lane, like a lawnmower.

   Anything placed waits DEPLOY ticks in its gate, so the placement reaches every screen before it moves. Time is in
   ticks of 0.1 s from the start of the battle. */
(function () {
  'use strict';
  var L = window.SFA_LANES = {};
  L.LEN = 1000; L.LANES = 3; L.DUR = 3000; L.DEPLOY = 80; L.FRENZY = 600; L.RANGE = 45; L.MOW = 40; L.MOWBACK = 900;   // Mux parks again 90 s after charging
  L.TILES = [380, 200];   // your planted defenders' two spots per lane, front and back (team 1 mirrors them)
  // kind: a = attacker (marches), d = defender (planted), s = special (instant). cost in coins; hp; damage per second;
  // speed in lane units per second; gold grabbed at the vault; reach for shooters; hero level needed; cooldown in ticks
  L.UNITS = [
    { id: 'gus', kind: 'a', who: 'gus', name: 'Gus', role: 'Sneaky runner', cost: 2, hp: 45, dps: 9, spd: 95, gold: 6, lv: 1, cd: 40, say: 'Fast and cheap. Slips through empty lanes.' },
    { id: 'sam', kind: 'd', who: 'sam', name: 'Squaring Sam', role: 'Wall', cost: 5, hp: 190, dps: 7, lv: 1, cd: 100, say: 'Plants himself in your half and blocks the lane.' },
    { id: 'one', kind: 'a', who: 'one', name: 'One', role: 'Superhero', cost: 6, hp: 150, dps: 24, spd: 60, gold: 10, lv: 2, cd: 80, breaker: 2, say: 'Smashes walls and pigeons: double damage to defenders.' },
    { id: 'zero', kind: 's', who: 'zero', name: 'Zero', role: 'Eraser', cost: 5, pie: 70, lv: 3, cd: 200, say: 'Rolls down a lane and erases every enemy in it.' },
    { id: 'max', kind: 'a', who: 'max', name: 'Maximus Million', role: 'Giant', cost: 10, hp: 420, dps: 30, spd: 38, gold: 24, lv: 4, cd: 250, say: 'Huge and slow. Grabs loads of gold.' },
    { id: 'pigeon', kind: 'd', who: 'pigeon', name: 'Pea Pigeon', role: 'Shooter', cost: 4, hp: 45, dps: 6, reach: 300, lv: 1, cd: 60, say: 'Perches in your half and pelts attackers from afar.' }
  ];
  L.ORDER = [0, 5, 1, 2, 3, 4];   // seed-packet order on screen
  L.unit = function (t) { return L.UNITS[t]; };
  L.mul = function (lv) { return 1 + 0.12 * (lv - 1); };                           // each hero level: 12% stronger
  L.frenzy = function (t, dur) { dur = dur || L.DUR; return t >= dur - L.FRENZY && t < dur; };   // the final wave: the last minute
  // hero level: every 3 right answers in the battle, plus a head start for a good lesson
  L.lvOf = function (right, boost) { return Math.min(5, 1 + (boost || 0) + Math.floor(right / 3)); };
  // the lesson bonus: effort in today's lesson buys starting coins and a head-start level. Answering, trying the
  // go-further extras and probing the machines count in full; being right counts half, so looking answers up pays
  // less than doing the work
  L.lessonBonus = function (answered, correct, extras, probed) {
    var effort = answered + extras + (probed || 0);
    return { coins: Math.min(16, 2 + effort + Math.floor(correct / 2)), boost: effort >= 12 ? 2 : effort >= 6 ? 1 : 0 };
  };
  // coins for one answer in the battle: 3 (a ★★ question 4), 1 on a second try or in the bonus round, +2 every third
  // in a row, +1 more on each answer while on a streak of 5 or more
  L.coinsFor = function (firstTry, hard, streak, bonusRound) {
    if (!firstTry || bonusRound) return 1;
    return (hard ? 4 : 3) + (streak % 3 === 0 ? 2 : 0) + (streak >= 5 ? 1 : 0);
  };
  // a team more than 25 gold and 20% behind is in comeback mode: a bonus coin on every right answer, 25% tougher units
  L.comeback = function (S, team) { var me = S.score[team], them = S.score[1 - team]; return them - me > 25 && me < them * 0.8; };
  L.newState = function (dur) { return { dur: dur || L.DUR, t: 0, units: [], pend: [], score: [0, 0], next: 1, mow: [[1, 1, 1], [1, 1, 1]], mowAt: [[0, 0, 0], [0, 0, 0]] }; };
  function vaultX(team) { return team ? L.LEN : 0; }
  function tileX(team, k) { return team ? L.LEN - L.TILES[k] : L.TILES[k]; }

  // a placement becomes a pending unit: {id, team, lane, type, lv, at (tick it leaves the gate), owner}
  L.place = function (S, p) {
    var o = { id: p.id || S.next++, team: p.team, lane: p.lane, type: p.type, lv: p.lv || 1, at: p.at, owner: p.owner || '', sid: p.sid || '' };
    if (o.id >= S.next) S.next = o.id + 1;
    S.pend.push(o); return o;
  };
  // how many of a team's defenders are planted (or waiting to be) in a lane: L.TILES.length spots each
  L.planted = function (S, team, lane) {
    var n = 0;
    S.units.forEach(function (u) { if (u.team === team && u.lane === lane && L.UNITS[u.type].kind === 'd') n++; });
    S.pend.forEach(function (u) { if (u.team === team && u.lane === lane && L.UNITS[u.type].kind === 'd') n++; });
    return n;
  };

  // one tick (0.1 s). fx (optional) hears about what happened, for animation and shout-outs.
  L.step = function (S, fx) {
    S.t++;
    var fz = L.frenzy(S.t, S.dur), i, j;
    if (!S.mowAt) S.mowAt = [[0, 0, 0], [0, 0, 0]];
    for (var mt = 0; mt < 2; mt++) for (var ml = 0; ml < 3; ml++) if (!S.mow[mt][ml] && S.mowAt[mt][ml] && S.t >= S.mowAt[mt][ml]) { S.mow[mt][ml] = 1; S.mowAt[mt][ml] = 0; if (fx) fx({ k: 'mowback', team: mt, lane: ml }); }
    // leave the gate
    if (S.pend.length) {
      var still = [];
      S.pend.sort(function (a, b) { return a.at - b.at || a.id - b.id; });
      for (i = 0; i < S.pend.length; i++) {
        var p = S.pend[i];
        if (p.at > S.t) { still.push(p); continue; }
        var U = L.UNITS[p.type];
        if (U.kind === 's') {
          var hits = [];
          S.units.forEach(function (u) { if (u.team !== p.team && u.lane === p.lane) { u.hp -= U.pie * L.mul(p.lv); hits.push(u.id); } });
          if (fx) fx({ k: 'zero', p: p, hits: hits });
          continue;
        }
        var x = vaultX(p.team);
        if (U.kind === 'd') {
          // a defender takes the first free tile: walls at the front, shooters at the back
          var taken = {};
          S.units.forEach(function (u) { if (u.team === p.team && u.lane === p.lane && u.tile != null) taken[u.tile] = 1; });
          var order = U.id === 'sam' ? [0, 1] : [1, 0], tile = order.filter(function (k) { return !taken[k]; })[0];
          if (tile == null) tile = order[0];
          x = tileX(p.team, tile);
        }
        var u = { id: p.id, team: p.team, lane: p.lane, type: p.type, lv: p.lv, x: x, hp: U.hp * L.mul(p.lv) * (L.comeback(S, p.team) ? 1.25 : 1), owner: p.owner, sid: p.sid, tile: U.kind === 'd' ? tile : null };
        u.max = u.hp; S.units.push(u);
        if (fx) fx({ k: 'spawn', u: u });
      }
      S.pend = still;
    }
    // fight, shoot or march (everyone decides first, then damage lands at once: the same answer on every screen)
    S.units.sort(function (a, b) { return a.id - b.id; });
    var dmg = {};
    for (i = 0; i < S.units.length; i++) {
      var me = S.units[i]; if (me.hp <= 0) continue;
      var M = L.UNITS[me.type], dir = me.team ? -1 : 1, reach = M.reach || L.RANGE, best = null, bd = 1e9;
      for (j = 0; j < S.units.length; j++) {
        var o = S.units[j]; if (o.team === me.team || o.lane !== me.lane || o.hp <= 0) continue;
        if (M.reach && L.UNITS[o.type].kind !== 'a') continue;   // shooters only aim at attackers
        var d = (o.x - me.x) * dir; if (d >= -5 && d <= reach && d < bd) { bd = d; best = o; }
      }
      if (best) { dmg[best.id] = (dmg[best.id] || 0) + M.dps * L.mul(me.lv) * 0.1 * (M.breaker && L.UNITS[best.type].kind === 'd' ? M.breaker : 1); me.fight = best.id; }
      else { me.fight = 0; if (M.kind === 'a') me.x += dir * M.spd * 0.1 * (fz ? 1.5 : 1); }
    }
    var keep = [];
    for (i = 0; i < S.units.length; i++) {
      var u2 = S.units[i];
      if (dmg[u2.id]) { u2.hp -= dmg[u2.id]; if (fx) fx({ k: 'hit', u: u2 }); }
      if (u2.hp <= 0) { if (fx) fx({ k: 'die', u: u2 }); continue; }
      keep.push(u2);
    }
    S.units = keep;
    // at the enemy vault: Mux charges the first time in each lane, after that the gold goes
    keep = [];
    var mowed = {};
    for (i = 0; i < S.units.length; i++) {
      var a = S.units[i], foe = 1 - a.team;
      if (L.UNITS[a.type].kind !== 'a' || Math.abs(a.x - vaultX(foe)) > L.MOW) { keep.push(a); continue; }
      if (S.mow[foe][a.lane]) { S.mow[foe][a.lane] = 0; S.mowAt[foe][a.lane] = S.t + L.MOWBACK; mowed[foe + ':' + a.lane] = 1; if (fx) fx({ k: 'mow', team: foe, lane: a.lane, by: a }); }
      if (mowed[foe + ':' + a.lane]) continue;
      if ((a.team === 0 && a.x >= L.LEN) || (a.team === 1 && a.x <= 0)) {
        var g = Math.round(L.UNITS[a.type].gold * L.mul(a.lv) * (fz ? (S.score[a.team] < S.score[1 - a.team] ? 3 : 2) : 1));   // the final wave: double gold, triple for the team behind
        S.score[a.team] += g;
        if (fx) fx({ k: 'grab', u: a, gold: g });
        continue;
      }
      keep.push(a);
    }
    // Mux flattens every attacker of that team in the lane
    if (Object.keys(mowed).length) keep = keep.filter(function (a) {
      // Mux charges through your own half of the lane
      var hit = L.UNITS[a.type].kind === 'a' && mowed[(1 - a.team) + ':' + a.lane] && Math.abs(a.x - vaultX(1 - a.team)) <= L.LEN / 2;
      if (hit && fx) fx({ k: 'die', u: a, mowed: true });
      return !hit;
    });
    S.units = keep;
  };
  L.advance = function (S, toT, fx) { var n = 0; toT = Math.min(toT, S.dur || L.DUR); while (S.t < toT && n++ < 4000) L.step(S, fx); return S; };

  // the snapshot the console sends out with the live state: 4 numbers a unit (id, x or leave-tick, code, hp; hp 0 = in
  // the gate), 3 units per counts key (zu0, zu1, …), plus zcs = [tick, gold 0, gold 1, state, Mux bits, length in ticks]. Every number 0..9999.
  function code(u) { return u.lane * 1000 + u.type * 100 + u.lv * 10 + u.team; }
  L.encode = function (S, state, maxKeys) {
    var bits = 0; for (var tm = 0; tm < 2; tm++) for (var ln = 0; ln < 3; ln++) if (S.mow[tm][ln]) bits |= 1 << (tm * 3 + ln);
    var out = { zcs: [S.t, Math.min(9999, S.score[0]), Math.min(9999, S.score[1]), state || 1, bits, Math.min(9999, S.dur || L.DUR)] }, nums = [];
    S.pend.forEach(function (p) { nums.push(p.id % 10000, Math.max(0, Math.min(9999, p.at)), code(p), 0); });
    S.units.forEach(function (u) { nums.push(u.id % 10000, Math.round(Math.max(0, Math.min(L.LEN, u.x))), code(u), Math.max(1, Math.min(9999, Math.round(u.hp)))); });
    for (var k = 0; k * 12 < nums.length && k < (maxKeys || 48); k++) out['zu' + k] = nums.slice(k * 12, k * 12 + 12);
    return out;
  };
  L.decode = function (counts) {
    if (!counts || !Array.isArray(counts.zcs)) return null;
    var z = counts.zcs, bits = z[4] == null ? 63 : z[4];
    var S = { dur: z[5] || L.DUR, t: z[0], units: [], pend: [], score: [z[1], z[2]], next: 1, state: z[3], mow: [[0, 1, 2].map(function (l) { return bits >> l & 1; }), [0, 1, 2].map(function (l) { return bits >> (3 + l) & 1; })] };
    for (var k = 0; Array.isArray(counts['zu' + k]); k++) {
      var a = counts['zu' + k];
      for (var i = 0; i + 3 < a.length; i += 4) {
        var c = a[i + 2], o = { id: a[i], lane: Math.floor(c / 1000), type: Math.floor(c / 100) % 10, lv: Math.floor(c / 10) % 10 || 1, team: c % 10 };
        if (!L.UNITS[o.type]) continue;
        if (a[i + 3] === 0) { o.at = a[i + 1]; S.pend.push(o); }
        else {
          o.x = a[i + 1]; o.hp = a[i + 3]; o.max = (L.UNITS[o.type].hp || 1) * L.mul(o.lv);
          if (L.UNITS[o.type].kind === 'd') { var off = o.team ? L.LEN - o.x : o.x; o.tile = L.TILES.indexOf(off); if (o.tile < 0) o.tile = null; }
          S.units.push(o);
        }
      }
    }
    return S;
  };
  L.clone = function (S) { return { dur: S.dur, mowAt: S.mowAt ? [S.mowAt[0].slice(), S.mowAt[1].slice()] : null, t: S.t, units: S.units.map(function (u) { return Object.assign({}, u); }), pend: S.pend.map(function (p) { return Object.assign({}, p); }), score: S.score.slice(), next: S.next, state: S.state, mow: [S.mow[0].slice(), S.mow[1].slice()] }; };
})();
