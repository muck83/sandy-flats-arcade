SFA_LESSON({
  id: 'L30', n: 21.6, label: 'Inequalities 2', title: 'Turn the Sign',
  game: { title: 'Unit 2 Review', file: 'review-u2.html#r3' },
  big: 'Solve an inequality like an equation: do the same thing to both sides. One exception: multiply or divide both sides by a negative number and the symbol turns around. Then check with a number, and round word answers so they make sense.',
  slides: [
    { k: 'title', min: 1, kicker: 'Under the Pond · Inequalities 2 of 3', title: 'Turn the Sign', sub: 'Floor Three\'s incident slip said: "Divided by a negative. Did not turn the sign." Today you find out why that matters, and you never get that slip.', art: '🔄' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Solve inequalities with one and two steps', 'Find out when the symbol flips, and test why', 'Graph every answer on a number line', 'Solve a word problem and round the answer so it makes sense'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'Which incident slip would you be most embarrassed to get?', opts: ['Fell in the duck pond (again)', 'Forgot to turn the sign', 'Argued with the Voice', 'Left Doug behind'] },

    { k: 'pick', min: 3, id: 'guess', where: 'line', range: [-2, 6], cond: '2x + 1 > 7', kick: 'Guess and check first', q: 'Tap every number that makes *2x + 1 > 7* true. Check each one.',
      learn: ['Testing works, but it is slow. Solving finds *all* the answers at once.'],
      help: 'Try x = 3: 2(3) + 1 = 7. Is 7 > 7?',
      why: 'x = 3 gives 7 > 7: false. x = 4, 5, 6 work. So the answer is x > 3. Next slide: get there without guessing.',
      more: [
        { k: 'pick', where: 'line', range: [-4, 4], cond: 'x − 4 ≤ −2', q: 'Tap every number that makes *x − 4 ≤ −2* true.', why: 'x = 2 gives −2 ≤ −2, which is true. Smaller x works too: x ≤ 2.',
          steps: ['x = 2: 2 − 4 = −2, and −2 ≤ −2 ✓.', 'x = 3: −1 ≤ −2 ✗.', 'So −4 up to 2: x ≤ 2.'] },
        { k: 'pick', where: 'line', range: [-4, 4], cond: '−2x > 2', q: 'Strange one: tap every number that makes *−2x > 2* true.', why: 'Only the numbers *less than* −1 work: −2(−2) = 4 > 2. Remember this one: the answer is x < −1, not x > −1.',
          steps: ['x = 1: −2 > 2 ✗. x = 0: 0 > 2 ✗.', 'x = −1: 2 > 2 ✗. x = −2: 4 > 2 ✓.', 'So x < −1. The answers went the *opposite* way to what you might guess.'] }
      ] },

    { k: 'solve', min: 3, id: 's1', q: 'Solve *x + 5 > 8*, then graph it.', start: 'x + 5 > 8',
      learn: ['Undo what is done to x. Do the *same* to both sides.'],
      moves: [{ q: 'What undoes the + 5?', opts: ['Subtract 5 from both sides', 'Add 5 to both sides', 'Divide both sides by 5'], ans: 0, res: ['x > 3', 'x > 13', 'x < 3'], rans: 0 }],
      graph: { range: [-6, 6], at: 3, open: true, dir: 'r' },
      help: 'What number is added to x? Take it away from both sides.',
      why: 'x + 5 > 8 → x > 3. Check: x = 4 gives 9 > 8 ✓.',
      more: [
        { k: 'solve', q: 'Solve *x − 2 ≤ −5* and graph it.', start: 'x − 2 ≤ −5', moves: [{ q: 'What undoes − 2?', opts: ['Add 2 to both sides', 'Subtract 2 from both sides'], ans: 0, res: ['x ≤ −3', 'x ≤ −7', 'x ≥ −3'], rans: 0 }],
          graph: { range: [-6, 6], at: -3, open: false, dir: 'l' }, why: 'x ≤ −3: closed dot at −3, shade left.', steps: ['Add 2 to both sides: x ≤ −3.', 'Closed dot (≤) at −3.', 'Shade left.'] },
        { k: 'solve', q: 'Solve *4 + x ≥ 1* and graph it.', start: '4 + x ≥ 1', moves: [{ q: 'First move?', opts: ['Subtract 4 from both sides', 'Subtract 1 from both sides', 'Divide by 4'], ans: 0, res: ['x ≥ −3', 'x ≥ 5', 'x ≤ −3'], rans: 0 }],
          graph: { range: [-6, 6], at: -3, open: false, dir: 'r' }, why: 'x ≥ −3: closed dot at −3, shade right.', steps: ['Subtract 4: x ≥ 1 − 4 = −3.', 'Closed dot at −3.', 'Shade right.'] },
        { k: 'number', q: 'Solve *x + 12 < 4*. The answer is x < ?', ans: -8, hint: 'Subtract 12 from both sides: 4 − 12.', why: 'x < −8.', steps: ['Subtract 12 from both sides.', 'x < 4 − 12.', 'x < *−8*.'] }
      ] },

    { k: 'sort', min: 4, id: 'test', kick: 'Experiment', q: 'Start with *4 < 10* (true). Do something to both sides. Is it still true? Sort the results.', bins: ['Still true', 'Now false'],
      learn: ['On a number line, −8 is to the *right* of −20, so −8 > −20.'],
      cards: [{ t: '+ 3: 7 < 13', b: 0 }, { t: '− 6: −2 < 4', b: 0 }, { t: '× 2: 8 < 20', b: 0 }, { t: '× (−2): −8 < −20', b: 1, why: '−8 is to the right of −20 on the number line, so −8 is BIGGER.' }, { t: '÷ 2: 2 < 5', b: 0 }, { t: '÷ (−2): −2 < −5', b: 1, why: '−2 is bigger than −5.' }, { t: '× (−2): −8 > −20', b: 0 }, { t: '÷ (−2): −2 > −5', b: 0 }],
      help: 'For each card, picture both numbers on a number line. Which is further right?',
      why: 'Adding, subtracting, and multiplying or dividing by a positive keep it true. Multiplying or dividing by a negative makes it false, unless you turn the symbol around.',
      more: [
        { k: 'pick', where: 'line', range: [-10, 10], cond: 'x > −6', q: 'Multiplying by −1 mirrors numbers across 0. Tap every whole number with *x > −6* to see which side −6 is "bigger" on.', cand: [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10],
          why: 'Everything to the right of −6 is bigger. Mirror 4 < 6 across zero and you get −4 and −6: now −4 is the bigger one. That is why the sign turns.', steps: ['4 < 6.', 'Times −1: −4 and −6.', '−4 is to the right of −6, so −4 > −6: the symbol turned.'] },
        { k: 'open', q: 'In your own words: why does multiplying both sides by a negative turn the symbol around?', ph: 'Because…',
          model: 'Multiplying by a negative mirrors both numbers across zero. The bigger number ends up further left, so it becomes the smaller one, and the symbol has to turn to stay true.',
          steps: ['Take 2 < 5.', 'Times −1: −2 and −5. Now −2 is further right.', 'So −2 > −5: the order flipped, so the symbol must flip too.'] }
      ] },

    { k: 'sort', min: 3, id: 'flip', kick: 'Flip or keep?', q: 'For each move, does the symbol *flip* or *stay*?', bins: ['🔄 Flip it', '➡️ Keep it'],
      learn: ['Flip only when you *multiply or divide* by a *negative*.'],
      cards: [{ t: 'Divide both sides by −3', b: 0 }, { t: 'Multiply both sides by 4', b: 1 }, { t: 'Subtract 7 from both sides', b: 1 }, { t: 'Add −5 to both sides', b: 1, why: 'Adding or subtracting never flips, even when the number is negative.' }, { t: 'Multiply both sides by −1', b: 0 }, { t: 'Divide both sides by 2', b: 1 }, { t: 'Subtract −8 from both sides', b: 1, why: 'Subtracting never flips.' }, { t: 'Divide both sides by −½', b: 0, why: '−½ is negative, and you are dividing: flip.' }],
      help: 'Ask two questions: am I multiplying or dividing? Is the number negative? Flip only if both are yes.',
      why: 'Flip only for × or ÷ by a negative number. Adding or subtracting a negative does not flip.',
      more: [
        { k: 'sort', q: 'Doug wrote these. Which are right?', bins: ['✓ Right', '✗ Wrong'],
          cards: [{ t: '−x > 4 → x < −4', b: 0 }, { t: '3x ≤ −9 → x ≥ −3', b: 1, why: 'Dividing by +3 does not flip: x ≤ −3.' }, { t: '−2x < 6 → x > −3', b: 0 }, { t: 'x − 5 ≥ −1 → x ≤ 4', b: 1, why: 'Adding 5 does not flip: x ≥ 4.' }, { t: 'x ÷ (−3) > 2 → x < −6', b: 0 }],
          why: 'Look at the move, not the numbers: only × or ÷ by a negative flips.', steps: ['−x > 4: divide by −1, flip → x < −4 ✓.', '3x ≤ −9: divide by +3, keep → x ≤ −3 (Doug flipped ✗).', 'x − 5 ≥ −1: add 5, keep → x ≥ 4 (Doug flipped ✗).'] },
        { k: 'poll', q: 'Marcus solves *−5x ≥ 20* and gets *x ≥ −4*. Test x = 0 in the original: is 0 a solution?', opts: ['Yes, so Marcus is right', 'No: −5(0) = 0, and 0 ≥ 20 is false. Marcus forgot to flip', 'You cannot test 0'], ans: 1,
          why: 'His answer says 0 works, but 0 ≥ 20 is false. The answer is x ≤ −4.', steps: ['Marcus\' answer x ≥ −4 includes 0.', 'Original: −5(0) = 0, and 0 ≥ 20 ✗.', 'So he is wrong. Dividing by −5 flips: x ≤ −4.'] }
      ] },

    { k: 'solve', min: 4, id: 's2', q: 'Solve *−3x > 12*, then graph it.', start: '−3x > 12',
      learn: ['Dividing by a negative? *Turn the sign.* Then check with a number.'],
      moves: [{ q: 'What undoes × (−3)?', opts: ['Divide both sides by −3', 'Divide both sides by 3', 'Add 3 to both sides'], ans: 0, res: ['x > −4', 'x < −4', 'x < 4'], rans: 1, why: 'You divided by −3, a negative, so > turned into <.' }],
      graph: { range: [-8, 4], at: -4, open: true, dir: 'l' },
      help: 'Divide by −3. Did you divide by a negative? Then the sign turns.',
      why: 'x < −4. Check x = −5: −3(−5) = 15, and 15 > 12 ✓.',
      more: [
        { k: 'solve', q: 'Solve *−2x ≤ 10* and graph it.', start: '−2x ≤ 10', moves: [{ q: 'First move?', opts: ['Divide both sides by −2', 'Subtract 2', 'Divide both sides by 2'], ans: 0, res: ['x ≤ −5', 'x ≥ −5', 'x ≥ 5'], rans: 1, why: 'Divided by a negative: ≤ becomes ≥.' }],
          graph: { range: [-8, 4], at: -5, open: false, dir: 'r' }, why: 'x ≥ −5.', steps: ['Divide both sides by −2 and flip.', 'x ≥ −5.', 'Check x = 0: 0 ≤ 10 ✓.'] },
        { k: 'solve', q: 'Solve *x ÷ (−4) < 1* and graph it.', start: 'x ÷ (−4) < 1', moves: [{ q: 'What undoes ÷ (−4)?', opts: ['Multiply both sides by −4', 'Divide both sides by −4', 'Add 4'], ans: 0, res: ['x < −4', 'x > −4', 'x > 4'], rans: 1, why: 'Multiplied by a negative: < becomes >.' }],
          graph: { range: [-8, 4], at: -4, open: true, dir: 'r' }, why: 'x > −4.', steps: ['Multiply both sides by −4 and flip.', 'x > −4.', 'Check x = 0: 0 ÷ (−4) = 0 < 1 ✓.'] },
        { k: 'number', q: 'Solve *−6x ≥ −18*. The answer is x ≤ ? (Careful: two negatives.)', ans: 3, hint: 'Divide both sides by −6. −18 ÷ −6 is positive.', why: 'x ≤ 3. Check x = 0: 0 ≥ −18 ✓.', steps: ['Divide by −6 and flip ≥ to ≤.', '−18 ÷ (−6) = 3.', 'x ≤ *3*.'] }
      ] },

    { k: 'solve', min: 4, id: 's3', q: 'Two steps: solve *−3x + 4 > 19*, then graph it.', start: '−3x + 4 > 19',
      learn: ['Undo adding and subtracting first. Then multiplying and dividing.'],
      moves: [
        { q: 'First move?', opts: ['Subtract 4 from both sides', 'Divide both sides by −3', 'Add 4 to both sides'], ans: 0, res: ['−3x > 15', '−3x > 23', '−3x < 15'], rans: 0 },
        { q: 'Next move?', opts: ['Divide both sides by −3', 'Divide both sides by 3', 'Subtract 3'], ans: 0, res: ['x > −5', 'x < −5', 'x < 5'], rans: 1, why: 'Divided by −3: > turns into <.' }],
      graph: { range: [-8, 2], at: -5, open: true, dir: 'l' },
      help: 'Get rid of the + 4 first. Then deal with the −3.',
      why: 'x < −5. Check x = −6: −3(−6) + 4 = 22, and 22 > 19 ✓.',
      more: [
        { k: 'solve', q: 'Solve *2x − 7 ≤ 3* and graph it.', start: '2x − 7 ≤ 3', moves: [
          { q: 'First move?', opts: ['Add 7 to both sides', 'Divide by 2', 'Subtract 7'], ans: 0, res: ['2x ≤ 10', '2x ≤ −4', '2x ≥ 10'], rans: 0 },
          { q: 'Next move?', opts: ['Divide both sides by 2', 'Divide both sides by −2', 'Subtract 2'], ans: 0, res: ['x ≤ 5', 'x ≥ 5', 'x ≤ 8'], rans: 0, why: 'Dividing by +2: no flip.' }],
          graph: { range: [-2, 8], at: 5, open: false, dir: 'l' }, why: 'x ≤ 5.', steps: ['Add 7: 2x ≤ 10.', 'Divide by 2 (positive, keep): x ≤ 5.', 'Closed dot at 5, shade left.'] },
        { k: 'solve', q: 'Solve *5 − x > 2*. (The x has a hidden −1 in front.)', start: '5 − x > 2', moves: [
          { q: 'First move?', opts: ['Subtract 5 from both sides', 'Add x to both sides', 'Divide by 5'], ans: 0, res: ['−x > −3', '−x > 7', 'x > −3'], rans: 0 },
          { q: 'Next move?', opts: ['Divide both sides by −1', 'Add 1', 'Nothing: x > −3'], ans: 0, res: ['x > 3', 'x < 3', 'x < −3'], rans: 1, why: '−x means −1 × x. Dividing by −1 flips.' }],
          graph: { range: [-2, 8], at: 3, open: true, dir: 'l' }, why: 'x < 3.', steps: ['Subtract 5: −x > −3.', 'Divide by −1 and flip: x < 3.', 'Check x = 0: 5 > 2 ✓.'] },
        { k: 'number', q: 'Solve *−4x − 1 ≥ 11*. The answer is x ≤ ?', ans: -3, hint: 'Add 1, then divide by −4 and flip.', why: 'x ≤ −3.', steps: ['Add 1: −4x ≥ 12.', 'Divide by −4, flip: x ≤ −3.', 'Check x = −4: 16 − 1 = 15 ≥ 11 ✓.'] }
      ] },

    { k: 'match', min: 3, id: 'm1', kick: 'Same numbers, different answers', q: 'Match each inequality to its solution. Watch for the negatives.',
      pairs: [['−2x < 8', 'x > −4'], ['2x < 8', 'x < 4'], ['x − 2 < 8', 'x < 10'], ['−x < 8', 'x > −8']],
      help: 'Which ones divide by a negative? Those are the flipped ones.',
      why: '−2x < 8 and −x < 8 divide by a negative, so they flip to >.',
      more: [
        { k: 'match', q: 'Match each inequality to its graph.', range: [-5, 5],
          pairs: [['−x ≥ 2', { nl: { at: -2, open: false, dir: 'l' } }], ['x ≥ 2', { nl: { at: 2, open: false, dir: 'r' } }], ['−3x < 6', { nl: { at: -2, open: true, dir: 'r' } }], ['3x < 6', { nl: { at: 2, open: true, dir: 'l' } }]],
          why: 'Solve each first: −x ≥ 2 → x ≤ −2; −3x < 6 → x > −2; 3x < 6 → x < 2.', steps: ['−x ≥ 2: divide by −1, flip → x ≤ −2.', '−3x < 6: divide by −3, flip → x > −2.', '3x < 6 → x < 2. x ≥ 2 stays.'] },
        { k: 'build', q: 'Solve *−5x + 2 > −13* and build the answer.', tiles: ['x', '<', '>', '≤', '≥', '3', '−3', '11/5'], ans: ['x<3'], why: '−5x > −15, then divide by −5 and flip: x < 3.',
          steps: ['Subtract 2: −5x > −15.', 'Divide by −5 and flip: x < 3.', 'Check x = 0: 2 > −13 ✓.'] }
      ] },

    { k: 'solve', min: 5, id: 'word', kick: 'Word problem', q: 'You have *$40* for the Sandy Flats fair. Entry is *$10* and each ride is *$4*. What is the *greatest* number of rides? Solve *10 + 4x ≤ 40*.', start: '10 + 4x ≤ 40',
      learn: ['"Have $40" means you can spend up to and including 40: ≤.', 'Rides come in whole numbers, so round at the end. You cannot go over the limit.'],
      moves: [
        { q: 'First move?', opts: ['Subtract 10 from both sides', 'Divide both sides by 4', 'Add 10'], ans: 0, res: ['4x ≤ 30', '4x ≤ 50', '4x ≥ 30'], rans: 0 },
        { q: 'Next move?', opts: ['Divide both sides by 4', 'Subtract 4', 'Multiply by 4'], ans: 0, res: ['x ≤ 7.5', 'x ≥ 7.5', 'x ≤ 26'], rans: 0 },
        { q: 'You cannot ride half a ride. What is the most you can take?', opts: ['Round down: 7 rides', 'Round up: 8 rides', '7.5 rides'], ans: 0, res: ['7 rides. Check: 10 + 4(7) = 38 ≤ 40 ✓', '8 rides. Check: 10 + 4(8) = 42 ≤ 40 ✗'], rans: 0, why: '8 rides costs $42: over the limit. At most → round down.' }],
      help: 'Solve it like an equation first. Then ask: does rounding up take you over $40?',
      why: 'x ≤ 7.5, and you cannot go over, so round down: *7 rides* ($38).',
      more: [
        { k: 'number', q: 'You need *at least 50 points* for the next floor. You have 14 and earn 8 per puzzle: 14 + 8x ≥ 50. What is the *least* number of puzzles?', ans: 5, hint: '8x ≥ 36, so x ≥ 4.5. Do you round up or down to reach 50?',
          why: 'x ≥ 4.5, and you must reach 50, so round up: 5 puzzles (14 + 40 = 54).', steps: ['Subtract 14: 8x ≥ 36.', 'Divide by 8: x ≥ 4.5.', '4 puzzles gives 46: not enough. Round *up* to *5*.'] },
        { k: 'poll', q: 'The cart holds at most 300 kg. Doug weighs 70 kg and each crate weighs 25 kg. Which inequality fits?', opts: ['70 + 25c ≤ 300', '70 + 25c ≥ 300', '70c + 25 ≤ 300', '25 + 70c < 300'], ans: 0,
          why: 'Doug once (70), plus 25 for every crate. At most 300: ≤.', steps: ['Start: Doug\'s 70 kg.', 'Each crate adds 25: + 25c.', 'At most 300: 70 + 25c ≤ 300.'] },
        { k: 'number', q: 'Solve it: 70 + 25c ≤ 300. What is the *most* crates Doug can take?', ans: 9, hint: '25c ≤ 230, so c ≤ 9.2. Round which way?',
          why: 'c ≤ 9.2. 10 crates is 320 kg: too much. So 9.', steps: ['Subtract 70: 25c ≤ 230.', 'Divide by 25: c ≤ 9.2.', 'At most → round *down*: *9* crates (295 kg).'] }
      ] },

    { k: 'conf', min: 1, id: 'conf', q: 'Solving inequalities and turning the sign: how do you feel?' },
    { k: 'exit', min: 4, id: 'exit', q: 'Solve *−2x + 3 ≥ 11*. Show each step, say where you turned the sign and why, then describe the graph.', ph: 'Step 1: … Step 2: … I turned the sign because… Graph: …',
      model: 'Subtract 3: −2x ≥ 8. Divide by −2: x ≤ −4. I turned ≥ into ≤ because I divided by a negative. Graph: closed dot at −4, shaded left.' },
    { k: 'end', title: 'You turned the sign.', next: 'Next: *Inequalities 3, Shade the Floor*. Two variables, a boundary line, and which side to shade.' }
  ]
});
