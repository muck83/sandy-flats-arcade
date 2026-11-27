/* Homework: Unit 4 Lesson 10, Elimination, Part 2. */
SFA_HW({
  id: 'g70', unit: 4, lesson: 10, topic: 'Elimination, Part 2', title: 'The Code Vault', who: 'one',
  intro: ['The prize vault at Sandy Flats Arcade has a new lock. One, the arcade robot, built it, and it only opens for people who can do elimination.',
    'This time nothing cancels at the start. Multiply first, so a variable cancels, then crack each system to open the next door.'],
  goal: 'Multiply one or both equations so a variable cancels, then solve and check.',
  bigIdea: 'If nothing cancels, multiply one or both equations to make opposite or equal coefficients, then eliminate.',
  levels: [
    { name: 'Make it match', learn: ['If nothing cancels, *multiply* one equation by a number first.', 'Multiply *every* term on *both* sides, so the equation stays true.'],
      tasks: [
        { k: 'choice', q: 'Multiply *2x − y = 7* by 3. What do you get?', opts: ['6x − 3y = 7', '6x − 3y = 21', '6x − y = 21', '2x − 3y = 21'], ans: 1,
          no: ['Multiply the 7 too: every term on both sides.', null, 'Multiply the y term too: 3 × (−y) = −3y.', 'Multiply the x term too: 3 × 2x = 6x.'], why: 'Every term times 3: 6x − 3y = 21.' },
        { k: 'choice', q: 'System: *2x + 3y = 12* and *5x − y = 13*. Which move makes y cancel?', opts: ['Add them as they are', 'Multiply equation 1 by 5', 'Multiply equation 2 by 3, then add', 'Multiply equation 2 by 3, then subtract'], ans: 2,
          no: ['3y and −y do not cancel yet.', 'That gives 10x and 15y: nothing matches.', null, '3y − (−3y) = 6y. Opposites: add.'], why: '3 × (−y) = −3y. Then 3y and −3y are opposites, so add.' },
        { k: 'sort', q: 'Can you eliminate right away, or must you multiply first?', bins: ['✅ Ready now', '✖️ Multiply first'],
          cards: [{ t: 'x + y = 9 · x − y = 3', b: 0 }, { t: '2x + 3y = 12 · 5x − y = 13', b: 1 }, { t: '3x + 2y = 8 · 2x + 3y = 7', b: 1 },
            { t: '4x − y = 5 · 2x + y = 7', b: 0, why: '−y and +y are opposites already.' }, { t: 'x + 3y = 7 · 2x − y = 7', b: 1 }, { t: '6x + 2y = 4 · 6x − 5y = 18', b: 0, why: '6x and 6x are the same: subtract now.' }],
          why: 'Ready now: some pair of terms is already opposite or the same.' },
        { k: 'solve', q: 'Solve *x + 2y = 8* and *3x − y = 3*.', start: 'x + 2y = 8 and 3x − y = 3',
          moves: [
            { q: 'Nothing cancels. Turn −y into −2y.', opts: ['Multiply equation 1 by 2', 'Multiply equation 2 by 2', 'Add them now'], ans: 1, res: ['6x − 2y = 3', '6x − y = 6', '6x − 2y = 6'], rans: 2,
              hint: '2 × (−y) = −2y. Then +2y and −2y are opposites.', no: { 0: 'That gives 4y and −y: still no match.', 2: '2y and −y do not cancel yet.', r0: 'Multiply the 3 on the right too: 2 × 3 = 6.', r1: 'Multiply −y too: 2 × (−y) = −2y.' } },
            { q: 'Now +2y and −2y. Next?', opts: ['Add it to equation 1', 'Subtract it from equation 1'], ans: 0, res: ['7x = 14', '7x = 11', '4x = 14'], rans: 0,
              hint: 'Opposites: add. x + 6x = 7x and 8 + 6 = 14.', no: { 1: 'Subtracting gives 4y. Opposites: add.', r1: 'Use the new equation: 8 + 6, not 8 + 3.', r2: 'x + 6x = 7x.' } },
            { q: 'Get x alone.', opts: ['Divide both sides by 7', 'Subtract 7'], ans: 0, res: ['x = 2', 'x = 7', 'x = 98'], rans: 0, hint: '7x means 7 times x.',
              no: { 1: 'Divide to undo times 7.', r1: '14 − 7. Divide instead.', r2: '14 × 7. Divide instead.' } },
            { q: 'Find y.', opts: ['Put 2 in x + 2y = 8', 'Put 2 in 7x = 14'], ans: 0, res: ['2y = 6, so y = 3', '2y = 10, so y = 5', '2y = 6, so y = 6'], rans: 0,
              hint: '2 + 2y = 8, so 2y = 6.', no: { 1: 'That has no y.', r1: 'Take the 2 away: 8 − 2 = 6.', r2: '2y = 6: divide by 2.' },
              why: 'Check: 3(2) − 3 = 3 ✓. The solution is (2, 3).' }
          ] }
      ] },
    { name: 'Multiply one', learn: ['Look for a coefficient that goes into the other one: *y* and *2y*, or *x* and *3x*.', 'After multiplying: the same sign, subtract. Opposite signs, add.'],
      tasks: [
        { k: 'solve', q: 'Solve *2x + y = 7* and *3x + 2y = 12*.', start: '2x + y = 7 and 3x + 2y = 12',
          moves: [
            { q: 'Make the y terms equal.', opts: ['Multiply equation 2 by 2', 'Multiply equation 1 by 2', 'Multiply equation 1 by 3'], ans: 1, res: ['4x + 2y = 7', '4x + y = 14', '4x + 2y = 14'], rans: 2,
              hint: 'y times 2 is 2y, the same as in equation 2.', no: { 0: 'That gives 4y, and equation 1 has y. Still no match.', 2: 'That gives 3y and 2y.', r0: 'Multiply the 7 too.', r1: 'Multiply the y too: 2 × y = 2y.' } },
            { q: 'Both have +2y. Next?', opts: ['Add equation 2', 'Subtract equation 2'], ans: 1, res: ['x = 2', '7x = 26', 'x = 26'], rans: 0,
              hint: 'Same terms: subtract. 4x − 3x = x and 14 − 12 = 2.', no: { 0: 'Adding gives 4y. Same terms: subtract.', r1: 'That is adding.', r2: 'Subtract the numbers too: 14 − 12 = 2.' } },
            { q: 'Find y.', opts: ['Put 2 in 2x + y = 7', 'Put 2 in 4x = 14'], ans: 0, res: ['2 + y = 7, so y = 5', '4 + y = 7, so y = 3', '4 + y = 7, so y = 11'], rans: 1,
              hint: '2x means 2 × 2 = 4.', no: { 1: 'Use an original equation with y in it.', r0: '2x with x = 2 is 4, not 2.', r2: 'Take the 4 away: 7 − 4 = 3.' } },
            { q: 'Check in the other ORIGINAL equation.', opts: ['Check in 3x + 2y = 12', 'Check in 2x + y = 7 again'], ans: 0, res: ['6 + 6 = 12 ✓', '6 + 6 = 13 ✗'], rans: 0,
              hint: 'You found y with equation 1, so check with equation 2.', no: { 1: 'You already used that one. Check the other.', r1: '3(2) + 2(3) = 6 + 6 = 12.' },
              why: 'It works in both. The solution is (2, 3).' }
          ] },
        { k: 'pair', q: 'Solve *x + 4y = 6* and *3x − 2y = 4*. Type the solution.', ans: [2, 1], hint: 'Multiply equation 2 by 2: 6x − 4y = 8. Then add.', why: '7x = 14, so x = 2. Then 2 + 4y = 6, so y = 1. Check: 6 − 2 = 4 ✓.' },
        { k: 'choice', q: 'Marcus solves *4x + y = 10* and *3x − 2y = 2*. He multiplies equation 1 by 2 and writes *8x + 2y = 10*. What is wrong?',
          opts: ['He should multiply by 3', 'He forgot to multiply the 10: it is 20', 'Nothing is wrong', 'He should subtract'], ans: 1,
          no: ['Times 2 is right: it makes 2y, the opposite of −2y.', null, 'Look at the right side.', 'The step is multiplying, not adding or subtracting yet.'],
          why: 'Every term on both sides: 8x + 2y = 20. Then add: 11x = 22, so x = 2 and y = 2.' },
        { k: 'solve', q: 'Solve *5x − 2y = 4* and *x + y = 5*.', start: '5x − 2y = 4 and x + y = 5',
          moves: [
            { q: 'Turn +y into +2y.', opts: ['Multiply equation 2 by 2', 'Multiply equation 1 by 2'], ans: 0, res: ['2x + 2y = 5', '2x + 2y = 10', '2x + y = 10'], rans: 1,
              hint: 'Multiply every term of x + y = 5 by 2.', no: { 1: 'That gives −4y and y.', r0: 'Multiply the 5 too.', r2: 'Multiply y too.' } },
            { q: 'Now −2y and +2y. Next?', opts: ['Add the equations', 'Subtract the equations'], ans: 0, res: ['7x = 9', '3x = −6', '7x = 14'], rans: 2,
              hint: 'Opposites: add. 4 + 10 = 14.', no: { 1: 'Subtracting gives −4y. Opposites: add.', r0: 'Use the new equation: 4 + 10, not 4 + 5.', r1: 'That is subtracting.' } },
            { q: 'Get x alone.', opts: ['Subtract 7', 'Divide both sides by 7'], ans: 1, res: ['x = 2', 'x = 7', 'x = 98'], rans: 0, hint: 'Divide by 7.',
              no: { 0: '7x is 7 times x: divide.', r1: '14 − 7. Divide.', r2: '14 × 7. Divide.' } },
            { q: 'Find y.', opts: ['Put 2 in x + y = 5', 'Put 2 in 7x = 14'], ans: 0, res: ['y = 7', 'y = 3', 'y = 2.5'], rans: 1,
              hint: '2 + y = 5.', no: { 1: 'That has no y.', r0: 'Take away 2: 5 − 2.', r2: '2 + y = 5, so y = 5 − 2.' },
              why: 'Check: 5(2) − 2(3) = 10 − 6 = 4 ✓. The solution is (2, 3).' }
          ] }
      ] },
    { name: 'Multiply both', learn: ['If no number fits, multiply *both* equations.', 'Aim for the *least common multiple*: 2x and 3x both become *6x*.'],
      tasks: [
        { k: 'choice', q: '*3x + 2y = 8* and *2x + 3y = 7*. To make both x terms *6x*, multiply…', opts: ['equation 1 by 3 and equation 2 by 2', 'both by 6', 'equation 1 by 2 and equation 2 by 3', 'equation 1 by 2 only'], ans: 2,
          no: ['That gives 9x and 4x.', 'That gives 18x and 12x: still not equal.', null, 'That gives 6x and 2x.'], why: '3x × 2 = 6x and 2x × 3 = 6x.' },
        { k: 'solve', q: 'Solve *2x + 5y = 16* and *3x + 4y = 17*.', start: '2x + 5y = 16 and 3x + 4y = 17',
          moves: [
            { q: 'Make both x terms 6x.', opts: ['Multiply eq 1 by 2 and eq 2 by 3', 'Multiply eq 1 by 3 and eq 2 by 2', 'Multiply both by 6'], ans: 1,
              res: ['6x + 15y = 16 and 6x + 8y = 17', '6x + 5y = 48 and 6x + 4y = 34', '6x + 15y = 48 and 6x + 8y = 34'], rans: 2,
              hint: '2x × 3 = 6x and 3x × 2 = 6x.', no: { 0: 'That gives 4x and 9x.', 2: 'That gives 12x and 18x.', r0: 'Multiply the numbers on the right too.', r1: 'Multiply the y terms too.' } },
            { q: 'Both have 6x. Next?', opts: ['Add', 'Subtract the second from the first'], ans: 1, res: ['7y = 14', '23y = 82', '7y = 82'], rans: 0,
              hint: 'Same terms: subtract. 15y − 8y = 7y, 48 − 34 = 14.', no: { 0: 'Adding gives 12x. Subtract.', r1: 'That is adding.', r2: 'Subtract the numbers too: 48 − 34 = 14.' } },
            { q: 'Get y alone.', opts: ['Divide both sides by 7', 'Subtract 7'], ans: 0, res: ['y = 2', 'y = 7', 'y = 98'], rans: 0, hint: 'Divide by 7.',
              no: { 1: 'Divide to undo times 7.', r1: '14 − 7. Divide.', r2: '14 × 7. Divide.' } },
            { q: 'Find x.', opts: ['Put 2 in 2x + 5y = 16', 'Put 2 in 7y = 14'], ans: 0, res: ['2x + 7 = 16', '7x = 16', '2x + 10 = 16'], rans: 2,
              hint: '5y with y = 2 is 5 × 2 = 10.', no: { 1: 'That has no x.', r0: '5y is 5 times y: 5 × 2 = 10, not 5 + 2.', r1: '2x and 10 are not like terms.' } },
            { q: 'Finish it.', opts: ['Subtract 10, then divide by 2', 'Add 10, then divide by 2'], ans: 0, res: ['x = 3', 'x = 13', 'x = 6'], rans: 0,
              hint: '2x = 6, then divide.', no: { 1: 'Undo + 10 by subtracting 10.', r1: 'That is (16 + 10) ÷ 2.', r2: '2x = 6: divide by 2.' },
              why: 'Check: 3(3) + 4(2) = 9 + 8 = 17 ✓. The solution is (3, 2).' }
          ] },
        { k: 'solve', q: 'Solve *3x + 2y = 4* and *4x − 3y = 11*. Negative answers are fine.', start: '3x + 2y = 4 and 4x − 3y = 11',
          moves: [
            { q: 'Cancel y. The LCM of 2 and 3 is 6.', opts: ['eq 1 × 2, eq 2 × 3', 'eq 1 × 3, eq 2 × 2'], ans: 1, res: ['9x + 6y = 4 and 8x − 6y = 11', '9x + 6y = 12 and 8x − 6y = 22', '9x + 6y = 12 and 8x − 3y = 22'], rans: 1,
              hint: '2y × 3 = 6y and −3y × 2 = −6y.', no: { 0: 'That gives 4y and −9y.', r0: 'Multiply the numbers on the right too.', r2: 'Multiply −3y too: −6y.' } },
            { q: '+6y and −6y. Next?', opts: ['Add the equations', 'Subtract the equations'], ans: 0, res: ['17x = 34', 'x = −10', '17x = 10'], rans: 0,
              hint: 'Opposites: add. 12 + 22 = 34.', no: { 1: 'Subtracting gives 12y. Opposites: add.', r1: 'That is subtracting.', r2: 'Add the numbers: 12 + 22 = 34.' } },
            { q: 'Get x alone.', opts: ['Divide both sides by 17', 'Subtract 17'], ans: 0, res: ['x = 2', 'x = 17', 'x = 0.5'], rans: 0, hint: '34 ÷ 17.',
              no: { 1: 'Divide to undo times 17.', r1: '34 − 17. Divide.', r2: '34 ÷ 17 = 2, not 17 ÷ 34.' } },
            { q: 'Find y.', opts: ['Put 2 in 3x + 2y = 4', 'Put 2 in 17x = 34'], ans: 0, res: ['6 + 2y = 4, so 2y = 10', '6 + 2y = 4, so 2y = −2', '6 + 2y = 4, so 2y = 2'], rans: 1,
              hint: 'Take 6 away from both sides: 4 − 6 = −2.', no: { 1: 'That has no y.', r0: 'You added 6. Take it away: 4 − 6.', r2: '4 − 6 is negative.' } },
            { q: 'Finish it.', opts: ['Divide both sides by 2', 'Subtract 2'], ans: 0, res: ['y = −1', 'y = 1', 'y = −4'], rans: 0,
              hint: '−2 ÷ 2.', no: { 1: '2y is 2 times y: divide.', r1: 'A negative divided by a positive is negative.', r2: 'That is −2 − 2. Divide.' },
              why: 'Check in 4x − 3y = 11: 8 − 3(−1) = 8 + 3 = 11 ✓. The solution is (2, −1).' }
          ] },
        { k: 'pair', q: 'Solve *2x − 3y = −4* and *5x + 2y = 9*.', ans: [1, 2], hint: 'Cancel y: equation 1 × 2 and equation 2 × 3. You get −6y and +6y.', why: '4x − 6y = −8 and 15x + 6y = 27. Add: 19x = 19, so x = 1. Then 2 − 3y = −4, so y = 2.' }
      ] },
    { name: 'Pick the best number', learn: ['You can cancel x *or* y. Pick the one with the smaller numbers.', 'Always check in the *original* equations.'],
      tasks: [
        { k: 'choice', q: '*6x + 5y = 4* and *2x + 3y = 4*. What is the fastest first move?', opts: ['Multiply eq 1 by 3 and eq 2 by 5', 'Multiply eq 2 by 3, then subtract', 'Add them now', 'Multiply eq 1 by 2'], ans: 1,
          no: ['That works, but the numbers get big. 2x × 3 = 6x is quicker.', null, 'Nothing cancels if you add now.', 'That gives 12x and 2x: no match.'], why: '2x × 3 = 6x, the same as in equation 1. One multiply, then subtract.' },
        { k: 'solve', q: 'Now solve it: *6x + 5y = 4* and *2x + 3y = 4*.', start: '6x + 5y = 4 and 2x + 3y = 4',
          moves: [
            { q: 'Make the x terms match.', opts: ['Multiply eq 2 by 3', 'Multiply eq 2 by 6'], ans: 0, res: ['6x + 9y = 4', '6x + 9y = 12', '6x + 3y = 12'], rans: 1,
              hint: 'Every term of 2x + 3y = 4 times 3.', no: { 1: 'That gives 12x.', r0: 'Multiply the 4 too.', r2: 'Multiply 3y too.' } },
            { q: 'Both have 6x. Next?', opts: ['Subtract eq 1 from it', 'Add eq 1'], ans: 0, res: ['4y = 8', '14y = 16', '4y = 16'], rans: 0,
              hint: '9y − 5y = 4y and 12 − 4 = 8.', no: { 1: 'Adding gives 12x. Subtract.', r1: 'That is adding.', r2: 'Subtract the numbers too: 12 − 4 = 8.' } },
            { q: 'Get y alone.', opts: ['Divide both sides by 4', 'Subtract 4'], ans: 0, res: ['y = 2', 'y = 4', 'y = 32'], rans: 0, hint: '8 ÷ 4.',
              no: { 1: 'Divide.', r1: '8 − 4. Divide.', r2: '8 × 4. Divide.' } },
            { q: 'Find x.', opts: ['Put 2 in 2x + 3y = 4', 'Put 2 in 4y = 8'], ans: 0, res: ['2x = 10', '2x = −2', '2x = 2'], rans: 1,
              hint: '2x + 6 = 4, so 2x = 4 − 6.', no: { 1: 'That has no x.', r0: 'You added 6. Take it away.', r2: '4 − 6 is negative.' } },
            { q: 'Finish it.', opts: ['Divide both sides by 2', 'Add 2'], ans: 0, res: ['x = −1', 'x = 1', 'x = −4'], rans: 0,
              hint: '−2 ÷ 2.', no: { 1: '2x is 2 times x: divide.', r1: 'A negative divided by a positive is negative.', r2: 'Divide, do not multiply.' },
              why: 'Check: 6(−1) + 5(2) = −6 + 10 = 4 ✓. The solution is (−1, 2).' }
          ] },
        { k: 'match', q: 'Match each system to its best first move.',
          pairs: [['2x + 3y = 12 · 5x − y = 13', 'eq 2 × 3, then add'], ['3x + 2y = 8 · 2x + 3y = 7', 'eq 1 × 2, eq 2 × 3, subtract'], ['x + 4y = 6 · 3x + 2y = 8', 'eq 1 × 3, then subtract'], ['5x + y = 9 · 2x − y = 5', 'add now']],
          why: 'Look for the move that makes one pair of terms opposite or the same with the least work.' },
        { k: 'number', q: 'Zero\'s snack bar: 3 popcorns and 2 drinks cost *27 SAR*. 2 popcorns and 3 drinks cost *23 SAR*. How much is *one popcorn*?', ans: 7, unit: 'SAR',
          hint: 'Multiply the first by 2 and the second by 3: both get 6p. Subtract to find a drink, then the popcorn.', why: '6p + 4d = 54 and 6p + 9d = 69, so 5d = 15 and d = 3. Then 3p + 6 = 27, so p = 7 SAR.' }
      ] },
    { name: 'Crack the vault', boss: true, learn: ['Mixed questions, fewer hints. Choose your multipliers, cancel, solve, check.'],
      tasks: [
        { k: 'solve', q: 'Solve *4x + 3y = 1* and *3x + 5y = 9*.', start: '4x + 3y = 1 and 3x + 5y = 9',
          moves: [
            { q: 'Cancel x first. Pick the multipliers.', opts: ['eq 1 × 3, eq 2 × 4', 'eq 1 × 4, eq 2 × 3'], ans: 0, res: ['12x + 9y = 3 and 12x + 20y = 36', '12x + 9y = 1 and 12x + 20y = 9'], rans: 0,
              no: { 1: 'That gives 16x and 9x.', r1: 'Multiply the numbers on the right too.' } },
            { q: 'Next?', opts: ['Add', 'Subtract the first from the second'], ans: 1, res: ['11y = 33', '29y = 39', '11y = 39'], rans: 0, no: { 0: 'Both are 12x: subtract.' } },
            { q: 'Get y alone.', opts: ['Divide both sides by 11', 'Subtract 11'], ans: 0, res: ['y = 3', 'y = 22'], rans: 0 },
            { q: 'Find x.', opts: ['Put 3 in 4x + 3y = 1', 'Put 3 in 11y = 33'], ans: 0, res: ['4x = 10', '4x = −8', '4x = 8'], rans: 1, no: { r0: '1 − 9, not 1 + 9.', r2: '1 − 9 is negative.' } },
            { q: 'Finish it.', opts: ['Divide both sides by 4', 'Add 4'], ans: 0, res: ['x = −2', 'x = 2', 'x = −32'], rans: 0,
              why: 'Check: 3(−2) + 5(3) = −6 + 15 = 9 ✓. The solution is (−2, 3).' }
          ] },
        { k: 'pair', q: 'Solve *3x − 4y = 2* and *x + 2y = 4*.', ans: [2, 1], why: 'Multiply equation 2 by 2: 2x + 4y = 8. Add: 5x = 10, so x = 2. Then 2 + 2y = 4, so y = 1.' },
        { k: 'choice', q: 'Priya solves *2x + y = 3* and *4x + 2y = 12*. She multiplies the first by 2, subtracts, and gets *0 = 6*. What does it mean?',
          opts: ['x = 6', 'Infinitely many solutions', 'No solution: the lines are parallel', 'She made a mistake'], ans: 2,
          no: ['There is no x left at all.', 'That would be 0 = 0, a true statement.', null, 'Her working is right: 4x + 2y = 6 and 4x + 2y = 12 cannot both be true.'],
          why: 'Every variable cancelled and she got a false statement. The lines have the same slope and never meet: no solution.' },
        { k: 'number', q: 'Gus buys 3 big tokens and 4 small tokens for *26 SAR*. Priya buys 5 big and 6 small for *42 SAR*. How much is *one small token*?', ans: 2, unit: 'SAR',
          why: 'Make the big tokens 15b: 15b + 20s = 130 and 15b + 18s = 126. Subtract: 2s = 4, so s = 2 SAR. A big token: 3b + 8 = 26, so b = 6 SAR.' }
      ] }
  ]
});
