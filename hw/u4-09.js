/* Homework: Unit 4 Lesson 9, Elimination, Part 1. */
SFA_HW({
  id: 'g69', unit: 4, lesson: 9, topic: 'Elimination, Part 1', title: 'Scale Showdown', who: 'zero',
  intro: ['Zero runs the prize counter at Sandy Flats Arcade. Every plush toy weighs the same, and every puzzle cube weighs the same. But the labels fell off!',
    'Zero has two balance scales and a pile of equations. Add or take away the scales to make one prize vanish, and find every weight before the doors open.'],
  goal: 'Add or subtract two equations to cancel a variable, then solve and check.',
  bigIdea: 'When a variable has opposite or equal coefficients, add or subtract the equations so it cancels.',
  levels: [
    { name: 'Balance it', learn: ['Adding or taking away the *same amount* on both sides keeps a scale balanced.', 'Opposites add to 0: *+y* and *−y* cancel.'],
      tasks: [
        { k: 'choice', q: 'Scale A: 1 plush and 1 cube weigh *9 kg*. Scale B: 3 plush and 1 cube weigh *19 kg*. What is on B that is not on A?',
          opts: ['2 cubes weighing 10 kg', '2 plush weighing 10 kg', '3 plush weighing 19 kg', '2 plush weighing 28 kg'], ans: 1,
          no: ['The cubes are the same on both scales: 1 each. They cancel.', null, 'Take away Scale A first: 1 plush, 1 cube and 9 kg.', 'Take away: 19 − 9, not 19 + 9.'],
          why: 'Take Scale A off Scale B: 3 − 1 = 2 plush, 1 − 1 = 0 cubes, 19 − 9 = 10 kg.' },
        { k: 'number', q: 'Same scales. 2 plush weigh 10 kg. How much does *one plush* weigh?', ans: 5, unit: 'kg', hint: 'Share 10 kg between 2 plush.', why: '10 ÷ 2 = 5 kg. Then Scale A says the cube is 9 − 5 = 4 kg.' },
        { k: 'choice', q: 'You add *x + y = 10* and *x − y = 4*. Which terms cancel?', opts: ['10 and 4', '+x and +x', '+y and −y'], ans: 2,
          no: ['Numbers never cancel: 10 + 4 = 14.', 'x + x = 2x. They grow, they do not cancel.', null], why: '+y + (−y) = 0. That is why adding works here: you get 2x = 14.' },
        { k: 'solve', q: 'Solve the system *x + y = 11* and *x − y = 5*.', start: 'x + y = 11 and x − y = 5',
          moves: [
            { q: 'The y terms are +y and −y. What first?', opts: ['Multiply the first by 2', 'Add the equations', 'Add the x terms only'], ans: 1,
              res: ['2x + 2y = 16', '2x = 16', '2x = 6'], rans: 1, hint: 'Opposites add to 0. Add left to left and right to right.',
              no: { 0: 'Multiplying does not cancel anything here. +y and −y are already opposites.', 2: 'Add everything: the x terms, the y terms and the numbers.', r0: '+y + (−y) = 0, not 2y.', r2: 'Add the numbers: 11 + 5 = 16.' } },
            { q: 'Get x alone.', opts: ['Subtract 2 from both sides', 'Divide both sides by 2'], ans: 1, res: ['x = 8', 'x = 14', 'x = 32'], rans: 0,
              hint: '2x means 2 times x. Undo it by dividing.', no: { 0: '2x is 2 times x, so divide, do not subtract.', r1: 'That is 16 − 2. Divide: 16 ÷ 2.', r2: 'That is 16 × 2. Divide: 16 ÷ 2.' } },
            { q: 'Find y. Put x = 8 into one equation.', opts: ['Put 8 in x + y = 11', 'Put 8 in 2x = 16'], ans: 0, res: ['y = 19', 'y = 3', 'y = 8'], rans: 1,
              hint: 'Use an equation that still has y in it.', no: { 1: '2x = 16 has no y in it. Use x + y = 11.', r0: '8 + y = 11. Take 8 away from 11.', r2: '8 is x. 8 + y = 11, so y = 11 − 8.' },
              why: 'Check in the other equation: 8 − 3 = 5 ✓. The solution is (8, 3).' }
          ] }
      ] },
    { name: 'Add or take away?', learn: ['*Opposite* coefficients (+3y and −3y): *add* the equations.', '*Same* coefficients (2y and 2y): *subtract* one from the other.', 'Subtracting? Subtract *every* term: x terms, y terms and numbers.'],
      tasks: [
        { k: 'sort', q: 'Add or subtract? Sort each system by the move that cancels a variable.', bins: ['➕ Add', '➖ Subtract'],
          cards: [{ t: '5x + 2y = 16 · 3x − 2y = 0', b: 0 }, { t: '6x + y = 20 · 2x + y = 8', b: 1 }, { t: '−3x + 4y = 5 · 3x + 7y = 17', b: 0, why: '−3x and +3x are opposites: add.' },
            { t: '2x − 5y = 1 · 2x + 3y = 9', b: 1, why: '2x and 2x are the same: subtract.' }, { t: 'x + 4y = 9 · −x + y = 1', b: 0 }, { t: '3x + 2y = 12 · 3x − y = 3', b: 1, why: 'Look at x: 3x and 3x are the same. Subtract to cancel x.' }],
          why: 'Opposite signs: add. Same sign and size: subtract.' },
        { k: 'solve', q: 'Solve *3x + y = 14* and *x + y = 6*.', start: '3x + y = 14 and x + y = 6',
          moves: [
            { q: 'Both have +y. What cancels it?', opts: ['Add the equations', 'Subtract the second from the first', 'Divide by 3'], ans: 1,
              res: ['2x = 8', '4x = 8', '2x = 20'], rans: 0, hint: 'Same terms: subtract. Then +y − y = 0.',
              no: { 0: 'Adding gives +2y: it doubles. Same signs: subtract.', 2: 'Dividing does not cancel y.', r1: '3x − x = 2x, not 4x.', r2: 'Subtract the numbers too: 14 − 6 = 8.' } },
            { q: 'Get x alone.', opts: ['Divide both sides by 2', 'Subtract 2 from both sides'], ans: 0, res: ['x = 4', 'x = 6', 'x = 16'], rans: 0,
              hint: '2x means 2 times x: divide by 2.', no: { 1: '2x is 2 times x, so divide.', r1: 'That is 8 − 2. Divide: 8 ÷ 2.', r2: 'That is 8 × 2. Divide.' } },
            { q: 'Find y.', opts: ['Put 4 in x + y = 6', 'Put 4 in 2x = 8'], ans: 0, res: ['y = 2', 'y = 10', 'y = 4'], rans: 0,
              hint: 'Use an equation with y in it.', no: { 1: '2x = 8 has no y. Use x + y = 6.', r1: '4 + y = 6. Take away 4, do not add.', r2: '4 is x. 4 + y = 6, so y = 6 − 4.' } },
            { q: 'Check in the other equation.', opts: ['Check in 3x + y = 14', 'No need to check'], ans: 0, res: ['3(4) + 2 = 14 ✓', '3(4) + 2 = 13 ✗'], rans: 0,
              hint: 'A solution must make BOTH equations true.', no: { 1: 'Always check: the answer must work in both equations.', r1: '3(4) = 12, and 12 + 2 = 14.' },
              why: 'It works in both. The solution is (4, 2).' }
          ] },
        { k: 'choice', q: 'Priya solves *4x + 3y = 25* and *4x − y = 13*. She subtracts and gets *2y = 12*. What went wrong?',
          opts: ['She should add', '25 − 13 is not 12', '3y − (−y) is 4y, not 2y', 'Nothing: y = 6'], ans: 2,
          no: ['Adding gives 8x: x does not cancel. Subtracting was right.', '25 − 13 = 12 is right.', null, 'Check: 3y − (−y) = 3y + y.'],
          why: 'Subtracting a negative is adding: 3y − (−y) = 4y. So 4y = 12 and y = 3.' },
        { k: 'solve', q: 'Solve *3x − 2y = 5* and *x + 2y = 7*.', start: '3x − 2y = 5 and x + 2y = 7',
          moves: [
            { q: 'Look at the y terms: −2y and +2y. What first?', opts: ['Subtract the equations', 'Add the equations'], ans: 1, res: ['4x = 12', '4x + 4y = 12', '2x = −2'], rans: 0,
              hint: 'Opposites: add, and the y terms vanish.', no: { 0: 'Subtracting gives −4y: y does not cancel. Opposites: add.', r1: '−2y + 2y = 0, not 4y.', r2: 'That is subtracting. Add: 3x + x = 4x and 5 + 7 = 12.' } },
            { q: 'Get x alone.', opts: ['Divide both sides by 4', 'Subtract 4 from both sides'], ans: 0, res: ['x = 3', 'x = 8', 'x = 48'], rans: 0,
              hint: '4x means 4 times x.', no: { 1: 'Divide to undo times 4.', r1: '12 − 4 = 8. Divide instead: 12 ÷ 4.', r2: 'That is 12 × 4. Divide.' } },
            { q: 'Find y.', opts: ['Put 3 in x + 2y = 7', 'Put 3 in 4x = 12'], ans: 0, res: ['3 + 2y = 7, so y = 5', '3 + 2y = 7, so y = 2', '3 + 2y = 7, so y = 4'], rans: 1,
              hint: '2y = 7 − 3 = 4. Then divide by 2.', no: { 1: 'That has no y in it.', r0: '2y = 10 means you added 3. Take it away: 7 − 3 = 4.', r2: '2y = 4, so y = 4 ÷ 2.' },
              why: 'Check: 3(3) − 2(2) = 9 − 4 = 5 ✓. The solution is (3, 2).' }
          ] }
      ] },
    { name: 'Careful with negatives', learn: ['Work in columns: x terms, then y terms, then numbers.', 'Subtracting a negative is adding: *3y − (−y) = 4y*.'],
      tasks: [
        { k: 'solve', q: 'Now solve Priya\'s system the right way: *4x + 3y = 25* and *4x − y = 13*.', start: '4x + 3y = 25 and 4x − y = 13',
          moves: [
            { q: 'The x terms are 4x and 4x. What first?', opts: ['Add the equations', 'Subtract: first minus second'], ans: 1, res: ['2y = 12', '4y = 12', '4y = 38'], rans: 1,
              hint: 'Same terms: subtract. Watch the minus sign on −y.', no: { 0: 'Adding gives 8x: it grows. Same terms: subtract.', r0: '3y − (−y) = 3y + y = 4y.', r2: 'Subtract the numbers too: 25 − 13 = 12.' } },
            { q: 'Get y alone.', opts: ['Subtract 4', 'Divide both sides by 4'], ans: 1, res: ['y = 3', 'y = 8', 'y = 48'], rans: 0,
              hint: '4y means 4 times y.', no: { 0: 'Divide to undo times 4.', r1: 'That is 12 − 4. Divide.', r2: 'That is 12 × 4. Divide.' } },
            { q: 'Find x.', opts: ['Put 3 in 4x + 3y = 25', 'Put 3 in 4y = 12'], ans: 0, res: ['4x + 3 = 25', '7x = 25', '4x + 9 = 25'], rans: 2,
              hint: '3y means 3 × 3 = 9.', no: { 1: '4y = 12 has no x.', r0: '3y with y = 3 is 3 × 3 = 9, not 3.', r1: '4x and 9 are not like terms. Keep them apart.' } },
            { q: 'Finish it.', opts: ['Subtract 9, then divide by 4', 'Add 9, then divide by 4'], ans: 0, res: ['x = 4', 'x = 8.5', 'x = 16'], rans: 0,
              hint: 'Undo + 9 by taking away 9: 4x = 16.', no: { 1: 'Undo + 9 by subtracting 9.', r1: 'That is (25 + 9) ÷ 4. Subtract the 9.', r2: '4x = 16. Now divide by 4.' },
              why: 'Check: 4(4) − 3 = 13 ✓. The solution is (4, 3).' }
          ] },
        { k: 'solve', q: 'Solve *2x + y = 13* and *−2x + 3y = 7*.', start: '2x + y = 13 and −2x + 3y = 7',
          moves: [
            { q: 'Look at the x terms: 2x and −2x.', opts: ['Add the equations', 'Subtract the equations'], ans: 0, res: ['4y = 20', '4y = 6', '2y = 20'], rans: 0,
              hint: 'Opposites: add. 2x + (−2x) = 0.', no: { 1: 'Subtracting gives 4x: x does not cancel.', r1: 'Add the numbers: 13 + 7 = 20.', r2: 'y + 3y = 4y.' } },
            { q: 'Get y alone.', opts: ['Divide both sides by 4', 'Subtract 4'], ans: 0, res: ['y = 5', 'y = 16', 'y = 80'], rans: 0, hint: 'Divide by 4.',
              no: { 1: '4y is 4 times y: divide.', r1: 'That is 20 − 4.', r2: 'That is 20 × 4.' } },
            { q: 'Find x.', opts: ['Put 5 in 2x + y = 13', 'Put 5 in 4y = 20'], ans: 0, res: ['2x = 8, so x = 4', '2x = 18, so x = 9', '2x = 8, so x = 16'], rans: 0,
              hint: '2x + 5 = 13, so 2x = 13 − 5.', no: { 1: 'That has no x.', r1: 'You added 5. Take it away: 13 − 5 = 8.', r2: '2x = 8: divide, 8 ÷ 2.' },
              why: 'Check: −2(4) + 3(5) = −8 + 15 = 7 ✓. The solution is (4, 5).' }
          ] },
        { k: 'pair', q: 'Solve *x − y = 1* and *5x + y = 17*. Type the solution.', ans: [3, 2], hint: 'Add: −y and +y cancel. 6x = 18.', why: '6x = 18, so x = 3. Then 3 − y = 1, so y = 2. Check: 15 + 2 = 17 ✓.' },
        { k: 'choice', q: 'Gus subtracts *(2x + 5y = 1)* minus *(2x − 3y = 9)*. What does he get?', opts: ['2y = −8', '8y = 10', '8y = −8', '2y = 10'], ans: 2,
          no: ['5y − (−3y) = 5y + 3y = 8y.', 'Subtract the numbers: 1 − 9 = −8.', null, 'Two mistakes: 5y − (−3y) is 8y, and 1 − 9 is −8.'], why: '5y − (−3y) = 8y and 1 − 9 = −8. So 8y = −8 and y = −1.' }
      ] },
    { name: 'At the counter', learn: ['Write each fact as an equation. Then look: what cancels?', 'Answer the question in words with units.'],
      tasks: [
        { k: 'solve', q: 'Gus and Marcus have *20 tokens* in total. Gus has *6 more* than Marcus. So *g + m = 20* and *g − m = 6*. How many each?', start: 'g + m = 20 and g − m = 6',
          moves: [
            { q: 'What cancels m?', opts: ['Subtract the equations', 'Add the equations'], ans: 1, res: ['2g = 26', '2g = 14', '2m = 14'], rans: 0,
              hint: '+m and −m are opposites.', no: { 0: 'Subtracting cancels g, not m. That works too, but adding is what cancels m.', r1: 'Add the numbers: 20 + 6 = 26.', r2: 'm cancels, so you are left with g.' } },
            { q: 'Get g alone.', opts: ['Divide both sides by 2', 'Subtract 2'], ans: 0, res: ['g = 13', 'g = 24', 'g = 52'], rans: 0, hint: '2g means 2 times g.',
              no: { 1: 'Divide to undo times 2.', r1: '26 − 2. Divide instead.', r2: '26 × 2. Divide instead.' } },
            { q: 'Find m.', opts: ['Put 13 in g + m = 20', 'Put 13 in 2g = 26'], ans: 0, res: ['m = 33', 'm = 7', 'm = 13'], rans: 1,
              hint: '13 + m = 20.', no: { 1: 'That has no m.', r0: '13 + m = 20: take 13 away from 20.', r2: '13 is Gus. Marcus has 20 − 13.' },
              why: 'Gus has 13 tokens and Marcus has 7. Check: 13 − 7 = 6 ✓.' }
          ] },
        { k: 'number', q: '2 iced teas and 1 juice cost *11 SAR*. 2 iced teas and 3 juices cost *21 SAR*. How much is *one juice*?', ans: 5, unit: 'SAR',
          hint: 'Subtract the first order from the second: the teas cancel. 2 juices = 10 SAR.', why: '(2t + 3j) − (2t + j) = 2j, and 21 − 11 = 10. So 2j = 10 and j = 5 SAR.' },
        { k: 'match', q: 'Match each system to its solution.',
          pairs: [['x + y = 6 · x − y = 2', '(4, 2)'], ['x + y = 9 · x − y = 1', '(5, 4)'], ['2x + y = 7 · x + y = 4', '(3, 1)'], ['x + 2y = 10 · x − 2y = 2', '(6, 2)']],
          why: 'Add or subtract, then check each pair in both equations.' },
        { k: 'solve', q: 'Zero\'s snack bar: 3 hot dogs and 2 sodas cost *24 SAR*. 1 hot dog and 2 sodas cost *12 SAR*. Find each price.', start: '3h + 2s = 24 and h + 2s = 12',
          moves: [
            { q: 'Both have 2s. What first?', opts: ['Add the equations', 'Subtract the second from the first'], ans: 1, res: ['2h = 12', '4h = 36', '3h = 12'], rans: 0,
              hint: 'Same terms: subtract.', no: { 0: 'Adding gives 4s. Same terms: subtract.', r1: 'That is adding. Subtract: 3h − h = 2h, 24 − 12 = 12.', r2: '3h − h = 2h.' } },
            { q: 'Get h alone.', opts: ['Divide both sides by 2', 'Subtract 2'], ans: 0, res: ['h = 6', 'h = 10', 'h = 24'], rans: 0, hint: 'Divide by 2.',
              no: { 1: '2h is 2 times h.', r1: '12 − 2. Divide.', r2: '12 × 2. Divide.' } },
            { q: 'Find s.', opts: ['Put 6 in h + 2s = 12', 'Put 6 in 2h = 12'], ans: 0, res: ['2s = 6, so s = 3', '2s = 18, so s = 9', '2s = 6, so s = 6'], rans: 0,
              hint: '6 + 2s = 12, so 2s = 6.', no: { 1: 'That has no s.', r1: 'Take the 6 away: 12 − 6 = 6.', r2: '2s = 6: divide by 2.' },
              why: 'A hot dog costs 6 SAR and a soda costs 3 SAR. Check: 18 + 6 = 24 ✓.' }
          ] }
      ] },
    { name: 'The opening rush', boss: true, learn: ['Mixed questions, fewer hints. Look first: opposite or the same? Then cancel, solve and check.'],
      tasks: [
        { k: 'sort', q: 'Add, subtract, or not yet? Sort each system.', bins: ['➕ Add', '➖ Subtract', '⏳ Not yet'],
          cards: [{ t: '2x + 3y = 12 · 5x − y = 13', b: 2, why: 'No matching terms yet: 2x and 5x, 3y and −y.' }, { t: 'x + 5y = 9 · x − 2y = 2', b: 1 }, { t: '7x − 4y = 1 · 2x + 4y = 8', b: 0 },
            { t: '3x + y = 5 · x + 3y = 7', b: 2 }, { t: '−x + 6y = 4 · x + 2y = 12', b: 0 }, { t: '4x + 9y = 1 · 4x + 2y = 8', b: 1 }],
          why: 'Opposites: add. The same: subtract. Nothing matches: not yet (that is the next lesson).' },
        { k: 'solve', q: 'Solve *5x + 2y = 16* and *3x − 2y = 0*.', start: '5x + 2y = 16 and 3x − 2y = 0',
          moves: [
            { q: 'First move?', opts: ['Subtract the equations', 'Add the equations'], ans: 1, res: ['8x = 16', '2x = 16', '8x = 0'], rans: 0,
              no: { 0: 'Subtracting gives 4y: y does not cancel.', r1: '5x + 3x = 8x.', r2: '16 + 0 = 16.' } },
            { q: 'Next?', opts: ['Divide both sides by 8', 'Subtract 8'], ans: 0, res: ['x = 2', 'x = 8', 'x = 128'], rans: 0, no: { 1: 'Divide to undo times 8.' } },
            { q: 'Find y.', opts: ['Put 2 in 3x − 2y = 0', 'Put 2 in 8x = 16'], ans: 0, res: ['6 − 2y = 0, so y = 3', '6 − 2y = 0, so y = −3', '6 − 2y = 0, so y = 6'], rans: 0,
              no: { 1: 'That has no y.', r1: '6 = 2y, so y is positive 3.', r2: '2y = 6, so y = 6 ÷ 2.' }, why: 'Check: 5(2) + 2(3) = 16 ✓. The solution is (2, 3).' }
          ] },
        { k: 'pair', q: 'Solve *6x + y = 20* and *2x + y = 8*.', ans: [3, 2], hint: 'Subtract: 4x = 12.', why: '4x = 12, so x = 3. Then 6 + y = 8, so y = 2. Check: 18 + 2 = 20 ✓.' },
        { k: 'number', q: 'Priya buys 2 kites and 3 hats for *31 SAR*. Marcus buys 2 kites and 1 hat for *17 SAR*. How much is *one hat*?', ans: 7, unit: 'SAR',
          hint: 'Subtract Marcus\'s order from Priya\'s.', why: '2 hats = 31 − 17 = 14 SAR, so a hat is 7 SAR. A kite: 2k + 7 = 17, so k = 5 SAR.' }
      ] }
  ]
});
