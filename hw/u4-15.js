/* Homework: Unit 4 Lesson 15, Make the Decision. */
SFA_HW({
  id: 'g75', unit: 4, lesson: 15, topic: 'Make the decision', title: 'Bike Hire Battle', who: 'zero',
  intro: ['The crew wants to ride bikes along the Sandy Flats beach. Two shops rent bikes. *Wave Wheels* charges a 30 SAR fee plus 10 SAR an hour. *Sunny Spokes* has no fee but charges 16 SAR an hour.',
    'Zero says one shop is always cheaper. Priya says it depends. Find the break-even point and settle it with numbers and graphs.'],
  goal: 'Find a break-even point and use it to choose the better option.',
  bigIdea: 'The break-even point is where two options cost the same; on one side one option is cheaper, on the other side the other is.',
  levels: [
    { name: 'Fee and rate', learn: ['A *fee* is paid once: it is the start value, *b*.', 'A *rate* is paid for each hour (or night, or visit): it is the slope, *m*.', 'Cost: *y = mx + b*.'],
      tasks: [
        { k: 'choice', q: 'Wave Wheels: *30 SAR fee + 10 SAR an hour*. Which equation gives the cost y for x hours?', opts: ['y = 30x + 10', 'y = 10x + 30', 'y = 40x', 'y = 10x'], ans: 1,
          no: ['The fee is paid once, so it is b. The 10 is paid each hour, so it goes with x.', null, 'The fee is paid once, not every hour.', 'Do not forget the 30 SAR fee.'], why: '10 SAR each hour (10x) plus the 30 SAR fee once.' },
        { k: 'choice', q: 'Sunny Spokes: *no fee, 16 SAR an hour*. Which equation?', opts: ['y = 16', 'y = x + 16', 'y = 16x'], ans: 2,
          no: ['That is 16 SAR no matter how long.', '16 is paid each hour, so it goes with x.', null], why: '16 SAR each hour and no fee: y = 16x, with b = 0.' },
        { k: 'fill', q: 'Fill in the cost table (SAR).', head: ['Hours', 'Wave: 10x + 30', 'Sunny: 16x'],
          rows: [[0, 30, { a: 0 }], [2, { a: 50 }, 32], [5, { a: 80 }, { a: 80 }], [8, { a: 110 }, { a: 128 }]],
          hint: 'Wave: 10 times the hours, plus 30. Sunny: 16 times the hours.', why: 'At 5 hours both cost 80 SAR. That is the break-even.' },
        { k: 'number', q: 'Look at your table. After how many hours do the two shops cost the same?', ans: 5, unit: 'hours', hint: 'Find the row where both costs match.', why: 'At 5 hours both cost 80 SAR.' }
      ] },
    { name: 'Find the break-even', learn: ['Both are *y = …*: set them equal and solve for x.', 'Then find y. The break-even point is *(x, y)*. Check it in both.'],
      tasks: [
        { k: 'solve', q: 'Find the break-even of *y = 10x + 30* and *y = 16x* with algebra.', start: 'y = 10x + 30 and y = 16x',
          moves: [
            { q: 'Both say what y is. What first?', opts: ['Add the equations', 'Set them equal'], ans: 1, res: ['16x = 10x + 30', '26x = 30', '16x + 10x = 30'], rans: 0,
              hint: 'At the break-even both costs are the same.', no: { 0: 'Both are y = …: set them equal.', r1: 'Set equal, do not add.', r2: 'Keep the sides apart: 16x = 10x + 30.' } },
            { q: 'Get the x terms together.', opts: ['Subtract 10x from both sides', 'Add 10x to both sides'], ans: 0, res: ['6x = 30', '26x = 30', '6x = 30x'], rans: 0,
              hint: '16x − 10x = 6x.', no: { 1: 'That gives 26x on the left. Take 10x away.', r1: 'Subtract, do not add: 16x − 10x.', r2: '30 has no x. It stays 30.' } },
            { q: 'Get x alone.', opts: ['Divide both sides by 6', 'Subtract 6'], ans: 0, res: ['x = 5', 'x = 24', 'x = 180'], rans: 0, hint: '30 ÷ 6.',
              no: { 1: '6x is 6 times x: divide.', r1: '30 − 6. Divide.', r2: '30 × 6. Divide.' } },
            { q: 'Find the cost.', opts: ['Put 5 in y = 16x', 'Put 5 in 6x = 30'], ans: 0, res: ['y = 21', 'y = 80', 'y = 85'], rans: 1,
              hint: '16 × 5.', no: { 1: 'That has no y.', r0: '16x is 16 × 5, not 16 + 5.', r2: '16 × 5 = 80.' },
              why: 'Check: 10(5) + 30 = 80 ✓. Break-even (5, 80): at 5 hours both cost 80 SAR.' }
          ] },
        { k: 'solve', q: 'Posters for the arcade. Print A: *40 SAR setup + 3 SAR a poster*. Print B: *10 SAR setup + 5 SAR a poster*. Find the break-even.', start: 'y = 3x + 40 and y = 5x + 10',
          moves: [
            { q: 'First move?', opts: ['Set them equal', 'Add them'], ans: 0, res: ['3x + 40 = 5x + 10', '8x + 50 = 0'], rans: 0,
              hint: 'Both are y = ….', no: { 1: 'Set them equal.', r1: 'Write 3x + 40 = 5x + 10.' } },
            { q: 'Get the x terms on one side.', opts: ['Subtract 3x from both sides', 'Add 3x to both sides'], ans: 0, res: ['40 = 2x + 10', '40 = 8x + 10', '40 = 2x'], rans: 0,
              hint: '5x − 3x = 2x. Keep the + 10.', no: { 1: 'Undo +3x by subtracting 3x.', r1: '5x − 3x, not 5x + 3x.', r2: 'Keep the + 10.' } },
            { q: 'Next?', opts: ['Subtract 10 from both sides', 'Divide by 2'], ans: 0, res: ['30 = 2x', '50 = 2x'], rans: 0,
              hint: 'Undo + 10.', no: { 1: 'Take away the 10 first.', r1: '40 − 10, not 40 + 10.' } },
            { q: 'Get x alone.', opts: ['Divide both sides by 2', 'Subtract 2'], ans: 0, res: ['x = 15', 'x = 28', 'x = 60'], rans: 0,
              hint: '30 ÷ 2.', no: { 1: 'Divide.', r1: '30 − 2. Divide.', r2: '30 × 2. Divide.' } },
            { q: 'Find the cost.', opts: ['Put 15 in y = 3x + 40', 'Put 15 in 30 = 2x'], ans: 0, res: ['y = 85', 'y = 58', 'y = 45'], rans: 0,
              hint: '3 × 15 = 45, then + 40.', no: { 1: 'That has no y.', r1: '3x is 3 × 15 = 45.', r2: 'Add the 40 setup.' },
              why: 'Check: 5(15) + 10 = 85 ✓. At 15 posters both cost 85 SAR.' }
          ] },
        { k: 'pair', q: 'Boat rides. Boat X: *y = 4x + 12*. Boat Y: *y = 2x + 20* (x = trips). Find the break-even point.', ans: [4, 28], hint: 'Set 4x + 12 = 2x + 20. Subtract 2x, subtract 12.', why: '2x = 8, so x = 4 trips. y = 16 + 12 = 28 SAR. Check: 8 + 20 = 28 ✓.' },
        { k: 'choice', q: 'Here are both bike shops. Why is the Sunny Spokes line *steeper*?',
          fig: { range: [0, 9], yrange: [0, 150], lines: [{ m: 10, b: 30, lab: 'Wave' }, { m: 16, b: 0, lab: 'Sunny' }], pts: [[5, 80, '(5, 80)']], x: 'hours', y: 'SAR' },
          opts: ['It has a bigger fee', 'It costs more each hour: 16 vs 10', 'It starts higher'], ans: 1,
          no: ['Sunny has no fee at all.', null, 'Sunny starts at 0, lower than Wave.'], why: 'The slope is the rate. 16 SAR an hour climbs faster than 10 SAR an hour.' }
      ] },
    { name: 'Which is cheaper?', learn: ['*Before* the break-even, the smaller *fee* wins.', '*After* it, the smaller *rate* wins.', 'Test one number on each side to be sure.'],
      tasks: [
        { k: 'choice', q: 'The crew rides for *2 hours*. Which shop is cheaper?', opts: ['Wave Wheels: 50 SAR', 'Sunny Spokes: 32 SAR', 'They cost the same'], ans: 1,
          no: ['Wave costs 10(2) + 30 = 50. Sunny costs 32. Which is less?', null, 'They only match at 5 hours.'], why: '2 hours is before the break-even, so the shop with no fee wins: 32 SAR vs 50 SAR.' },
        { k: 'choice', q: 'Now *8 hours*. Which shop is cheaper?', opts: ['Sunny Spokes: 128 SAR', 'They cost the same', 'Wave Wheels: 110 SAR'], ans: 2,
          no: ['128 is more than 110.', 'They only match at 5 hours.', null], why: 'After the break-even the smaller rate wins: Wave 110 SAR vs Sunny 128 SAR.' },
        { k: 'solve', q: 'Gus wants a *7 hour* ride. Which shop, and how much does he save?', start: '7 hours: Wave or Sunny?',
          moves: [
            { q: 'Cost with Wave Wheels?', opts: ['10(7) + 30', '30(7) + 10'], ans: 0, res: ['100 SAR', '220 SAR', '47 SAR'], rans: 0,
              hint: '10 SAR each hour, plus the 30 SAR fee once.', no: { 1: 'The fee is paid once, not each hour.', r1: '10 × 7 = 70, then + 30.', r2: '10 × 7 = 70, not 10 + 7.' } },
            { q: 'Cost with Sunny Spokes?', opts: ['16(7)', '16 + 7'], ans: 0, res: ['112 SAR', '23 SAR'], rans: 0,
              hint: '16 SAR each hour.', no: { 1: 'Multiply: 16 SAR for each of 7 hours.', r1: '16 × 7 = 112.' } },
            { q: 'Compare.', opts: ['Subtract: 112 − 100', 'Add: 112 + 100'], ans: 0, res: ['Sunny saves 12 SAR', 'Wave saves 12 SAR', 'Wave saves 212 SAR'], rans: 1,
              hint: 'The cheaper shop saves the difference.', no: { 1: 'To find a saving, subtract.', r0: 'Wave is the cheaper one: 100 < 112.', r2: 'Subtract, do not add.' },
              why: 'Wave Wheels: 100 SAR. 7 hours is past the break-even, so the smaller rate wins.' }
          ] },
        { k: 'sort', q: 'Which shop is cheaper for each ride?', bins: ['🌊 Wave cheaper', '☀️ Sunny cheaper', '🤝 Same cost'],
          cards: [{ t: '1 hour', b: 1 }, { t: '3 hours', b: 1 }, { t: '5 hours', b: 2 }, { t: '6 hours', b: 0, why: 'Wave 90, Sunny 96.' }, { t: '10 hours', b: 0 }, { t: '4.5 hours', b: 1, why: 'Wave 75, Sunny 72: still before 5 hours.' }],
          why: 'Under 5 hours: Sunny. Exactly 5: the same. Over 5: Wave.' }
      ] },
    { name: 'What if?', learn: ['Change the *fee*: the line moves *up or down*, and the break-even moves.', 'Change the *rate*: the line gets *steeper or flatter*.'],
      tasks: [
        { k: 'solve', q: 'Wave Wheels raises its fee to *48 SAR*. New break-even with Sunny (*y = 16x*)?', start: 'y = 10x + 48 and y = 16x',
          moves: [
            { q: 'First move?', opts: ['Set them equal', 'Add them'], ans: 0, res: ['16x = 10x + 48', '26x = 48'], rans: 0,
              hint: 'Both are y = ….', no: { 1: 'Set them equal.', r1: 'Set equal, do not add.' } },
            { q: 'Next?', opts: ['Subtract 10x from both sides', 'Divide by 16'], ans: 0, res: ['6x = 48', '26x = 48'], rans: 0,
              hint: '16x − 10x = 6x.', no: { 1: 'There is x on both sides. Subtract 10x first.', r1: 'Subtract 10x, do not add.' } },
            { q: 'Finish.', opts: ['Divide by 6, then find y', 'Subtract 6'], ans: 0, res: ['x = 8, y = 128', 'x = 8, y = 80', 'x = 42, y = 672'], rans: 0,
              hint: 'x = 48 ÷ 6. Then y = 16 × 8.', no: { 1: '6x is 6 times x: divide.', r1: 'y = 16 × 8 = 128.', r2: '48 ÷ 6, not 48 − 6.' },
              why: 'The break-even moved from 5 hours to 8 hours. Now Sunny is cheaper for longer.' }
          ] },
        { k: 'choice', q: 'The Wave fee went up from 30 to 48. On the graph, the Wave line…', opts: ['gets steeper', 'moves up: same slope, higher start', 'moves down'], ans: 1,
          no: ['The rate (10 SAR an hour) did not change, so the slope is the same.', null, 'A bigger fee starts higher, not lower.'], why: 'The fee is b. A bigger b moves the line up, and it now crosses Sunny later.' },
        { k: 'solve', q: 'Desert camp kits. Oasis: *90 SAR delivery + 40 SAR a night*. Dune Gear: *70 SAR a night*, no delivery. When do they cost the same?', start: 'y = 40n + 90 and y = 70n',
          moves: [
            { q: 'First move?', opts: ['Set them equal', 'Add them'], ans: 0, res: ['70n = 40n + 90', '110n = 90'], rans: 0,
              hint: 'Both are y = ….', no: { 1: 'Set them equal.', r1: 'Set equal, do not add.' } },
            { q: 'Next?', opts: ['Subtract 40n from both sides', 'Subtract 90'], ans: 0, res: ['30n = 90', '110n = 90'], rans: 0,
              hint: '70n − 40n = 30n.', no: { 1: 'Get the n terms together first.', r1: 'Subtract 40n, do not add.' } },
            { q: 'Finish.', opts: ['Divide by 30, then find y', 'Subtract 30'], ans: 0, res: ['n = 3, y = 210', 'n = 3, y = 90', 'n = 60, y = 4200'], rans: 0,
              hint: 'n = 90 ÷ 30. Then y = 70 × 3.', no: { 1: 'Divide.', r1: 'y = 70 × 3 = 210.', r2: '90 ÷ 30, not 90 − 30.' },
              why: 'At 3 nights both cost 210 SAR. Check: 40(3) + 90 = 210 ✓.' }
          ] },
        { k: 'choice', q: 'A family camps for *2 nights*. Which is cheaper?', opts: ['Oasis: 170 SAR', 'Dune Gear: 140 SAR', 'The same'], ans: 1,
          no: ['170 is more than 140.', null, 'They only match at 3 nights.'], why: 'Oasis: 80 + 90 = 170. Dune Gear: 140. Before the break-even, no delivery fee wins.' }
      ] },
    { name: 'The final decision', boss: true, learn: ['Mixed questions, fewer hints. Equations, break-even, test each side, decide.'],
      tasks: [
        { k: 'solve', q: 'Arcade cards. Card A: *50 SAR + 2 SAR a game*. Card B: *4 SAR a game*. Find the break-even.', start: 'y = 2x + 50 and y = 4x',
          moves: [
            { q: 'First move?', opts: ['Set them equal', 'Add them'], ans: 0, res: ['4x = 2x + 50', '6x = 50'], rans: 0 },
            { q: 'Next?', opts: ['Subtract 2x from both sides', 'Add 2x to both sides'], ans: 0, res: ['2x = 50', '6x = 50'], rans: 0 },
            { q: 'Get x alone.', opts: ['Divide by 2', 'Subtract 2'], ans: 0, res: ['x = 25', 'x = 48'], rans: 0 },
            { q: 'Find y.', opts: ['Put 25 in y = 4x', 'Put 25 in 2x = 50'], ans: 0, res: ['y = 100', 'y = 29'], rans: 0, why: 'At 25 games both cards cost 100 SAR. Check: 2(25) + 50 = 100 ✓.' }
          ] },
        { k: 'sort', q: 'Which card is cheaper?', bins: ['💳 Card A cheaper', '🎟️ Card B cheaper'],
          cards: [{ t: '10 games', b: 1 }, { t: '30 games', b: 0 }, { t: '20 games', b: 1 }, { t: '40 games', b: 0 }, { t: '24 games', b: 1, why: 'A: 98 SAR. B: 96 SAR. Close, but B.' }, { t: '26 games', b: 0, why: 'A: 102 SAR. B: 104 SAR.' }],
          why: 'Under 25 games: Card B (no fee). Over 25: Card A (smaller rate).' },
        { k: 'number', q: 'Card A drops its fee to *30 SAR* (still 2 SAR a game). Card B stays at 4 SAR a game. New break-even: how many games?', ans: 15, unit: 'games',
          why: '4x = 2x + 30, so 2x = 30 and x = 15 games (both 60 SAR).' },
        { k: 'choice', q: 'A third card, C: *20 SAR + 3 SAR a game*. With A (*50 + 2x*) and B (*4x*), which is cheapest for *25 games*?', opts: ['A: 100 SAR', 'B: 100 SAR', 'C: 95 SAR', 'A and B tie, so either'], ans: 2,
          no: ['Work out C too: 20 + 75.', 'Work out C too: 20 + 75.', null, 'A and B tie at 100, but C is cheaper.'], why: 'A: 50 + 50 = 100. B: 100. C: 20 + 75 = 95. C wins at 25 games.' }
      ] }
  ]
});
