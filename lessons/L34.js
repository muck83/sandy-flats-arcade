/* Inequalities 1 of 7: before the Unit 2 Summative launches. One-variable inequalities: symbols, true and false,
   many solutions, number lines, solving (turning the sign for a negative) and a word problem with rounding.
   Inequalities 2 moves to the plane; Inequalities 3 to 7 run with the summative, one lesson per part. */
SFA_LESSON({
  id: 'L34', n: 21.45, label: 'Inequalities 1', title: 'Which Side of the Line',
  game: { title: 'Unit 2 Review', file: 'review-u2.html#r3' },
  big: 'An inequality has lots of solutions, so its graph is a whole stretch of the number line: open dot for < and >, closed dot for ≤ and ≥. Solve it like an equation, but turn the sign if you multiply or divide by a negative. In a word problem, round so the answer makes sense.',
  slides: [
    { k: 'title', min: 1, kicker: 'Under the Pond · Inequalities 1 of 7', title: 'Which Side of the Line', sub: 'The cart sign on Floor Three said WEIGHT LIMIT. One number, and everything on one side of it is safe. Today: read that kind of sign, draw it, and solve it.', art: '⚖️' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Sort statements into true and false', 'Find many solutions, not just one', 'Graph an inequality on a number line', 'Solve inequalities, and turn the sign when you divide by a negative', 'Solve a word problem and round the answer so it makes sense'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'The cart sign says *MAX 4 RIDERS*. Five of you want to get in. What happens?', opts: ['Someone walks', 'Squeeze in anyway', 'Doug files a complaint', 'Take two trips'] },

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

    { k: 'conf', min: 1, id: 'conf', q: 'Number lines and solving inequalities: how do you feel?' },
    { k: 'exit', min: 4, id: 'exit', q: 'Solve *−2x + 3 ≥ 11*. Show each step, say where you turned the sign and why, then describe the graph: where is the dot, open or closed, which way?', ph: 'Step 1: … Step 2: … I turned the sign because… Graph: …',
      model: 'Subtract 3: −2x ≥ 8. Divide by −2: x ≤ −4. I turned ≥ into ≤ because I divided by a negative. Graph: closed dot at −4, shaded left.' },
    { k: 'end', title: 'One number, a whole side.', next: 'Next: *Inequalities 2, Shade the Floor*. Two variables, a boundary line, and which side to shade.' }
  ]
});
