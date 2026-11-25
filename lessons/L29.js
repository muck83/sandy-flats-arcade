SFA_LESSON({
  id: 'L29', n: 21.5, label: 'Inequalities 1', title: 'Which Side of the Line',
  game: { title: 'Unit 2 Review', file: 'review-u2.html#r3' },
  big: 'An inequality has lots of solutions, so its graph is a whole stretch of the number line. Open dot for < and >, closed dot for ≤ and ≥. Then shade toward the numbers that make it true.',
  slides: [
    { k: 'title', min: 1, kicker: 'Under the Pond · Inequalities 1 of 3', title: 'Which Side of the Line', sub: 'The cart sign on Floor Three said WEIGHT LIMIT. One number, and everything on one side of it is safe. Today you learn to read that sign, and to draw it.', art: '⚖️' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Read <, >, ≤ and ≥ out loud', 'Sort statements into true and false', 'Find many solutions, not just one', 'Graph an inequality on a number line: open or closed dot, left or right'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'The cart sign says *MAX 4 RIDERS*. Five of you want to get in. What happens?', opts: ['Someone walks', 'Squeeze in anyway', 'Doug files a complaint', 'Take two trips'] },

    { k: 'match', min: 3, id: 'sym', kick: 'The four symbols', q: 'Match each symbol to how you *say it out loud*.',
      learn: ['The open end of < and > faces the *bigger* number: 3 < 8.', 'The line under ≤ and ≥ means *or equal to*.'],
      pairs: [['is less than', '<'], ['is greater than', '>'], ['is less than or equal to', '≤'], ['is greater than or equal to', '≥']],
      help: 'The pointy end points at the smaller number. A line underneath adds "or equal to".',
      why: 'Read left to right: 3 < 8 is "3 is less than 8". The line under ≤ and ≥ adds "or equal to".',
      more: [
        { k: 'sort', q: 'Sort each phrase into the symbol it means.', bins: ['<', '>', '≤', '≥'],
          cards: [{ t: 'at most', b: 2 }, { t: 'at least', b: 3 }, { t: 'more than', b: 1 }, { t: 'fewer than', b: 0 }, { t: 'no more than', b: 2, why: '"No more than 8" means 8 is allowed, but not 9: that is ≤.' }, { t: 'a minimum of', b: 3 }, { t: 'over', b: 1 }, { t: 'under', b: 0 }],
          why: 'At most, no more than: ≤. At least, a minimum of: ≥. More than, over: >. Fewer than, under: <.',
          steps: ['"At most 8" includes 8, so it is ≤.', '"At least 8" includes 8, so it is ≥.', '"More than", "over", "fewer than", "under" do not include the number: > or <.'] },
        { k: 'build', q: 'The cart holds *at most 300 kg*. Let w be the weight. Build the inequality.', tiles: ['w', '<', '>', '≤', '≥', '300'], ans: ['w≤300'],
          why: 'At most 300 means 300 is fine, 301 is not: w ≤ 300.', steps: ['"At most" includes 300 itself.', 'So use ≤, not <.', 'w ≤ 300.'] },
        { k: 'poll', q: 'Is *x > 4* the same as *4 < x*?', opts: ['Yes: both say x is bigger than 4', 'No: one says bigger, one says smaller', 'Only when x is negative'], ans: 0,
          why: 'Swap the sides and the symbol turns with them. Both still point at the smaller thing: 4.', steps: ['x > 4: x is greater than 4.', '4 < x: 4 is less than x.', 'Same meaning. The symbol always points at the smaller side.'] }
      ] },

    { k: 'sort', min: 4, id: 'tf', kick: 'True or false?', q: 'Drag each statement to *True* or *False*.',
      learn: ['Negatives: further left is *smaller*. −4 < −1.', '5 > 5 is false, but 5 ≥ 5 is true.'],
      bins: ['True', 'False'],
      cards: [{ t: '3 < 7', b: 0 }, { t: '−2 > 1', b: 1 }, { t: '5 ≥ 5', b: 0, why: '≥ means greater than OR equal to. 5 equals 5, so it is true.' }, { t: '5 > 5', b: 1, why: '5 is not bigger than itself.' },
        { t: '−4 < −1', b: 0, why: 'On the number line −4 is further left than −1, so −4 is smaller.' }, { t: '0 ≤ −3', b: 1 }, { t: '−6 > −8', b: 0, why: '−6 is to the right of −8, so it is bigger.' }, { t: '2.5 ≤ 2', b: 1 }],
      help: 'Picture a number line. The number further right is the bigger one.',
      why: 'Further right is bigger, even with negatives: −6 > −8. And the line under ≥ lets equal numbers count: 5 ≥ 5 is true.',
      more: [
        { k: 'sort', q: 'Is *x = 3* a solution? Put 3 in for x and sort.', bins: ['3 is a solution', '3 is not'],
          cards: [{ t: 'x > 2', b: 0 }, { t: 'x < 3', b: 1, why: '3 < 3 is false: 3 is not less than itself.' }, { t: 'x ≤ 3', b: 0 }, { t: 'x ≥ 4', b: 1 }, { t: '2x > 5', b: 0, why: '2(3) = 6, and 6 > 5.' }, { t: 'x + 1 < 4', b: 1, why: '3 + 1 = 4, and 4 < 4 is false.' }],
          why: 'Put 3 in and check each one. 2x > 5 becomes 6 > 5: true.',
          steps: ['x > 2 → 3 > 2 ✓', 'x < 3 → 3 < 3 ✗, x ≤ 3 → 3 ≤ 3 ✓', 'x ≥ 4 → 3 ≥ 4 ✗', '2x > 5 → 6 > 5 ✓, x + 1 < 4 → 4 < 4 ✗'] },
        { k: 'number', q: 'How many *whole numbers* from −10 to 10 make *x > 6* true?', ans: 4, hint: 'List them: 7, …', why: '7, 8, 9 and 10. Not 6: 6 > 6 is false.',
          steps: ['x > 6 means bigger than 6.', '6 itself does not count.', '7, 8, 9, 10: that is *4*.'] },
        { k: 'poll', q: 'Which is true for *every* number x?', opts: ['x > −x', 'x + 1 > x', 'x ≥ 0', '2x > x'], ans: 1,
          why: 'Adding 1 always makes a number bigger. The others fail for negatives or zero: try x = −2 or x = 0.',
          steps: ['Try x = −2: −2 > 2 ✗, so not A.', 'x ≥ 0 fails at x = −2. 2x > x fails at x = 0 (0 > 0 ✗).', 'x + 1 > x: one more is always bigger. *B*.'] }
      ] },

    { k: 'pick', min: 3, id: 'many', where: 'line', range: [-5, 5], cond: 'x > 2', kick: 'More than one answer', q: 'Tap *every* whole number that makes *x > 2* true.',
      learn: ['An equation like x = 2 has *one* answer.', 'An inequality like x > 2 has *lots*.'],
      help: 'Try 3: is 3 > 2? Try 2: is 2 > 2?',
      why: '3, 4 and 5 all work. 2 does not: 2 is not bigger than 2. And it keeps going: 2.5, 10, a million.',
      more: [
        { k: 'pick', where: 'line', range: [-5, 5], cond: 'x ≤ −1', q: 'Tap every whole number that makes *x ≤ −1* true.', why: '−1 counts (≤), and so does everything to its left.',
          steps: ['≤ includes −1 itself.', 'Smaller numbers are to the left: −2, −3, −4, −5.', 'So −5, −4, −3, −2, −1.'] },
        { k: 'pick', where: 'line', range: [-3, 6], cond: '2x + 1 > 5', q: 'Tap every number that makes *2x + 1 > 5* true. Check each one.', why: 'x = 2 gives 5 > 5, which is false. x = 3 gives 7 > 5. So 3, 4, 5, 6.',
          steps: ['Try x = 2: 2(2) + 1 = 5, and 5 > 5 is false.', 'Try x = 3: 2(3) + 1 = 7, and 7 > 5 is true.', 'Bigger x makes it bigger still: 3, 4, 5, 6.'] },
        { k: 'poll', q: 'How many solutions of *x > 2* are there *between 2 and 3*?', opts: ['None', 'Just 2.5', 'Lots: in fact, infinitely many'], ans: 2,
          why: '2.1, 2.01, 2.5, 2.999… every one of them is bigger than 2. That is why we shade the line instead of drawing dots.',
          steps: ['2.5 > 2 ✓. 2.1 > 2 ✓. 2.01 > 2 ✓.', 'You can always find another one closer to 2.', 'Infinitely many: so the graph shades the whole stretch.'] }
      ] },

    { k: 'nl', min: 4, id: 'g1', ans: { at: 2, open: true, dir: 'r' }, q: 'Graph *x > 2* on the number line.',
      learn: ['*Open dot* ○ for < and >: the number itself is not a solution.', '*Closed dot* ● for ≤ and ≥: it is.', 'Shade toward the solutions. Test a number if you are not sure.'],
      help: 'Is 2 itself a solution? Then is 5 a solution, or −5?',
      why: 'Open dot at 2 (2 is not bigger than 2), shaded right toward 3, 4, 5…',
      more: [
        { k: 'nl', ans: { at: -3, open: false, dir: 'l' }, q: 'Graph *x ≤ −3*.', why: 'Closed dot at −3 (it counts), shaded left toward −4, −5…', steps: ['≤ includes −3: closed dot.', 'Less than: smaller numbers, to the left.', 'Closed dot at −3, shade left.'] },
        { k: 'nl', ans: { at: -1, open: true, dir: 'r' }, q: 'Careful: graph *−1 < x*. (The x is on the right.)', why: '−1 < x says x is bigger than −1: x > −1. Open dot at −1, shade right.',
          steps: ['Read it with x first: −1 < x means x > −1.', 'Strict (<), so open dot at −1.', 'Bigger than −1: shade right.'] },
        { k: 'nl', range: [-3, 3], step: 0.5, ans: { at: 1.5, open: false, dir: 'r' }, q: 'Graph *x ≥ 1.5*. The dot can go on the half marks.', why: 'Closed dot halfway between 1 and 2, shaded right.',
          steps: ['1.5 is halfway between 1 and 2.', '≥: closed dot.', 'Greater: shade right.'] }
      ] },

    { k: 'build', min: 3, id: 'read', q: 'Read the graph. *Build* the inequality it shows.', fig: { nl: { at: -1, open: false, dir: 'l' }, range: [-6, 6] },
      learn: ['Dot open or closed? That picks < or ≤.', 'Which way is it shaded? Left means less, right means greater.'],
      tiles: ['x', '<', '>', '≤', '≥', '−1', '1'], ans: ['x≤-1'],
      help: 'The dot is filled in, so −1 counts. Shaded left means smaller numbers.',
      why: 'Closed dot at −1, shaded left: x ≤ −1.',
      more: [
        { k: 'build', q: 'Build the inequality for this graph.', fig: { nl: { at: 3, open: true, dir: 'r' }, range: [-6, 6] }, tiles: ['x', '<', '>', '≤', '≥', '3', '−3'], ans: ['x>3'], why: 'Open dot at 3, shaded right: x > 3.',
          steps: ['Open dot: 3 does not count, so < or >.', 'Shaded right: greater.', 'x > 3.'] },
        { k: 'build', q: 'Here the variable is *t* (temperature). Build it.', fig: { nl: { at: 0, open: true, dir: 'l' }, range: [-6, 6] }, tiles: ['t', '<', '>', '≤', '≥', '0'], ans: ['t<0'], why: 'Open dot at 0, shaded left: t < 0, below freezing.',
          steps: ['Open: 0 does not count.', 'Left: less than.', 't < 0.'] },
        { k: 'match', q: 'Each graph has a *twin*: the same graph written the other way round. Match them.', pairs: [['x > 4', '4 < x'], ['x ≤ −2', '−2 ≥ x'], ['x < 0', '0 > x'], ['x ≥ 1', '1 ≤ x']],
          why: 'Swap the sides and turn the symbol so it still points at the smaller side.', steps: ['x > 4: swap sides → 4 ? x.', 'x was bigger, so 4 is smaller: 4 < x.', 'The symbol always points at the smaller side.'] }
      ] },

    { k: 'match', min: 4, id: 'graphs', kick: 'Four graphs, one number', q: 'All four use the number 1. Match each inequality to its graph.', range: [-4, 4],
      learn: ['Look at the dot first, then the direction.'],
      pairs: [['x < 1', { nl: { at: 1, open: true, dir: 'l' } }], ['x ≤ 1', { nl: { at: 1, open: false, dir: 'l' } }], ['x > 1', { nl: { at: 1, open: true, dir: 'r' } }], ['x ≥ 1', { nl: { at: 1, open: false, dir: 'r' } }]],
      help: 'Find the two with open dots first: they are < and >.',
      why: 'Open dot: < or >. Closed: ≤ or ≥. Left: less. Right: greater.',
      more: [
        { k: 'sort', q: 'Open dot or closed dot? Sort them.', bins: ['○ Open', '● Closed'],
          cards: [{ t: 'x < 4', b: 0 }, { t: 'x ≥ −2', b: 1 }, { t: '5 ≤ x', b: 1 }, { t: 'x > 0', b: 0 }, { t: '−3 > x', b: 0 }, { t: 'x ≤ 7', b: 1 }, { t: 'at least 10', b: 1, why: 'At least 10 includes 10: ≥, closed.' }, { t: 'under 5', b: 0 }],
          why: 'A line under the symbol (≤, ≥), or words like at least or at most: closed. Otherwise open.', steps: ['≤ and ≥ → closed.', '< and > → open.', '"At least" is ≥ → closed. "Under" is < → open.'] },
        { k: 'match', q: 'Now with negatives. Match each to its graph.', range: [-5, 5],
          pairs: [['x > −2', { nl: { at: -2, open: true, dir: 'r' } }], ['x ≤ −2', { nl: { at: -2, open: false, dir: 'l' } }], ['x < 2', { nl: { at: 2, open: true, dir: 'l' } }], ['x ≥ 2', { nl: { at: 2, open: false, dir: 'r' } }]],
          why: 'Find the dot\'s number first (−2 or 2), then open or closed, then the direction.', steps: ['Two graphs sit at −2, two at 2.', 'Open or closed picks the symbol type.', 'Direction picks less or greater.'] },
        { k: 'open', q: 'Explain to a friend why the dot for *x < 1* is open. Use the number 1 in your answer.', ph: 'The dot is open because…',
          model: 'The dot is open because 1 is not a solution: 1 < 1 is false. Numbers like 0.9 or 0.99 are solutions, so we shade right up to 1 but leave the dot empty.',
          steps: ['Test 1 itself: 1 < 1 is false.', 'So 1 is not shaded in: an empty (open) dot.', 'But 0.99 is a solution, so the shading comes right up to the dot.'] }
      ] },

    { k: 'sort', min: 4, id: 'words', kick: 'Signs from Under the Pond', q: 'Each sign hides an inequality. Sort the signs into the symbol they use.', bins: ['<', '>', '≤', '≥'],
      learn: ['*At most*, *no more than*, *up to*: ≤', '*At least*, *a minimum of*: ≥'],
      cards: [{ t: 'Riders must be *at least* 120 cm', b: 3 }, { t: 'Cart holds *at most* 300 kg', b: 2 }, { t: '*Fewer than* 5 tries left', b: 0 }, { t: '*More than* 10 floors down', b: 1 }, { t: 'Under-12s ride free', b: 0, why: 'Under 12 means 11, 11.5… but not 12 itself: <.' }, { t: '*A minimum of* 3 players', b: 3 }, { t: '*No more than* 8 in the cart', b: 2 }, { t: 'Score *over* 50 to pass', b: 1 }],
      help: 'Ask: is the number itself allowed? If 300 kg exactly is fine, it is ≤ or ≥.',
      why: 'If the number itself is allowed (at most, at least, no more than, a minimum of), the symbol has a line under it.',
      more: [
        { k: 'build', q: 'Riders must be *at least 120 cm* tall. Let h be height. Build it.', tiles: ['h', '<', '>', '≤', '≥', '120'], ans: ['h≥120'], why: 'At least 120 includes 120: h ≥ 120.',
          steps: ['At least: 120 is allowed.', 'Taller is fine: greater.', 'h ≥ 120.'] },
        { k: 'nl', range: [-1, 9], ans: { at: 3, open: false, dir: 'r' }, q: 'The game needs *a minimum of 3 players*. Graph p ≥ 3.', why: 'Closed dot at 3 (3 players is fine), shaded right. In real life only whole numbers of players count: 3, 4, 5…',
          steps: ['A minimum of 3: p ≥ 3.', 'Closed dot at 3.', 'Shade right. (Only the whole numbers make sense for people.)'] },
        { k: 'poll', q: 'The cart holds *at most 300 kg*. Marcus and Doug together weigh exactly 300 kg. Can they ride?', opts: ['Yes: at most 300 includes 300', 'No: they must be under 300', 'Only if Doug takes off his helmet'], ans: 0,
          why: 'At most 300 is w ≤ 300. 300 ≤ 300 is true.', steps: ['At most 300 kg: w ≤ 300.', 'Put in w = 300: 300 ≤ 300.', 'True: they can ride (just).'] }
      ] },

    { k: 'conf', min: 1, id: 'conf', q: 'Reading and graphing inequalities on a number line: how do you feel?' },
    { k: 'exit', min: 4, id: 'exit', q: 'Describe the graph of *x ≥ −2*: where is the dot, is it open or closed, and which way is it shaded? Then give two solutions and one number that is not a solution.', ph: 'The dot is at… It is… Shaded… Solutions: … Not a solution: …',
      model: 'The dot is at −2. It is closed because ≥ includes −2. It is shaded to the right. Solutions: −2 and 5. Not a solution: −3.' },
    { k: 'end', title: 'One number, a whole side.', next: 'Next: *Inequalities 2, Turn the Sign*. Solving inequalities, and the one move that flips the symbol.' }
  ]
});
