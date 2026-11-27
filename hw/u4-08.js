/* Homework: Unit 4 Lesson 8, Substitution, Part 2. */
SFA_HW({
  id: 'g68', unit: 4, lesson: 8, topic: 'Substitution, part 2', title: 'Boardwalk Clue Trail', who: 'zero',
  intro: ['Zero hid a clue trail along the Sandy Flats boardwalk. At every station there is a system, and this time no letter is alone yet.',
    'Get a letter alone first, swap it in with brackets, and solve. Some stations are traps: the letters vanish and the trail says *NONE* or *EVERY POINT*.'],
  goal: 'Solve one equation for a variable first, substitute with brackets, and spot no solution or infinitely many.',
  bigIdea: 'Solve for a variable with coefficient 1 or −1, substitute in brackets and distribute; 0 = 5 means no solution, 4 = 4 means infinitely many.',
  levels: [
    { name: 'Get one alone', learn: ['No letter alone? *Solve one equation for a letter* first.', 'Pick a letter with coefficient *1 or −1*. Then you avoid fractions.'],
      tasks: [
        { k: 'choice', q: 'System: *x + 2y = 7* and *3x − 4y = 1*. What is the best first move?', opts: ['Solve equation 2 for y', 'Solve equation 1 for x', 'Solve equation 2 for x'], ans: 1,
          no: ['−4y has a 4 stuck to it: you would get fractions.', null, '3x has a 3 stuck to it: you would get fractions.'], why: 'x has coefficient 1 in equation 1: x = 7 − 2y. No fractions.' },
        { k: 'solve', q: 'Solve *4x − y = 5* for y.', start: '4x − y = 5',
          moves: [
            { q: 'First move?', opts: ['Add 4x to both sides', 'Subtract 4x from both sides'], ans: 1, res: ['−y = −4x + 5', '−y = 4x + 5', 'y = −4x + 5'], rans: 0,
              hint: 'Move the 4x away. It is + 4x, so subtract.', no: { 0: 'Adding gives 8x. Subtract 4x.', r1: 'Subtracting 4x makes −4x.', r2: 'The minus sign on y is still there: −y.' } },
            { q: 'Next move?', opts: ['Multiply every term by −1', 'Just remove the minus from y'], ans: 0, res: ['y = 4x − 5', 'y = −4x + 5', 'y = 4x + 5'], rans: 0,
              hint: 'Times −1 changes the sign of *every* term.', no: { 1: 'If you change one sign, change them all: multiply every term by −1.', r1: 'Change the signs on the right too.', r2: 'Change the sign of the 5 too.' }, why: 'y = 4x − 5. Check with x = 2: 8 − 3 = 5 ✓' }
          ] },
        { k: 'choice', q: 'System: *3x + y = 9* and *2x + 5y = 6*. Which letter is easiest to get alone?', opts: ['x in equation 1', 'y in equation 1', 'y in equation 2'], ans: 1,
          no: ['x has a 3: you would divide by 3.', null, 'y has a 5: you would divide by 5.'], why: 'y has coefficient 1: y = 9 − 3x.' },
        { k: 'choice', q: 'Solve *x − 2y = 3* for x.', opts: ['x = 3 − 2y', 'x = 3 + 2y', 'x = 2y − 3'], ans: 1,
          no: ['Add 2y to both sides. − 2y + 2y = 0, and the right side gets + 2y.', null, 'The 3 stays positive.'], why: 'Add 2y to both sides: x = 3 + 2y.' }
      ] },
    { name: 'Station 1 and 2', learn: ['Substitute with *brackets*.', 'A minus in front of brackets changes *every* sign inside.'],
      tasks: [
        { k: 'solve', q: 'Station 1: solve *x + y = 8* and *3x − y = 4*.', start: 'x + y = 8 and 3x − y = 4',
          moves: [
            { q: 'Solve equation 1 for y.', opts: ['Subtract x from both sides', 'Add x to both sides'], ans: 0, res: ['y = 8 + x', 'y = 8 − x'], rans: 1,
              hint: 'Remove the x from the left.', no: { 1: 'Adding gives 2x. Subtract x.', r0: 'Subtracting x makes − x.' } },
            { q: 'Substitute into equation 2.', opts: ['Use brackets: 3x − (8 − x) = 4', 'No brackets: 3x − 8 − x = 4'], ans: 0, res: ['3x − (8 − x) = 4', '3x − 8 − x = 4'], rans: 0,
              hint: 'The minus is in front of the whole y.', no: { 1: 'Without brackets the minus only hits the 8. Use brackets.' } },
            { q: 'Next move?', opts: ['Open the brackets and combine', 'Add 8 to both sides'], ans: 0, res: ['2x − 8 = 4', '4x − 8 = 4'], rans: 1,
              hint: '−(8 − x) = −8 + x. Then 3x + x = 4x.', no: { 1: 'Open the brackets first.', r0: '− (− x) is + x, so 3x + x = 4x.' } },
            { q: 'Next move?', opts: ['Add 8, then divide by 4', 'Subtract 8, then divide by 4'], ans: 0, res: ['x = 3', 'x = −1'], rans: 0,
              hint: 'Undo − 8 by adding 8: 4x = 12.' },
            { q: 'Back-substitute.', opts: ['Put x = 3 into y = 8 − x', 'Say y = 3 too'], ans: 0, res: ['y = 5', 'y = 11'], rans: 0,
              hint: 'y = 8 − 3.', no: { 1: 'Work y out from y = 8 − x.', r1: '8 − 3, not 8 + 3.' }, why: '(3, 5). Check: 3 + 5 = 8 ✓ and 9 − 5 = 4 ✓' }
          ] },
        { k: 'pair', q: 'Station 2: the x from Station 1 (3) is the number in front of y. Solve *x + 3y = 13* and *2x − y = 5*.', ans: [4, 3], hint: 'x = 13 − 3y. Then 2(13 − 3y) − y = 5.', why: '26 − 7y = 5, y = 3, x = 4. Check: 4 + 9 = 13 ✓ and 8 − 3 = 5 ✓' },
        { k: 'solve', q: 'Solve *2x + 3y = 5* and *x − 2y = −8*.', start: '2x + 3y = 5 and x − 2y = −8',
          moves: [
            { q: 'Solve equation 2 for x.', opts: ['Add 2y to both sides', 'Subtract 2y from both sides'], ans: 0, res: ['x = −2y − 8', 'x = 2y − 8'], rans: 1,
              hint: 'Undo − 2y by adding 2y.', no: { 1: 'Subtracting gives − 4y. Add 2y.', r0: 'Adding 2y makes + 2y on the right.' } },
            { q: 'Substitute into equation 1.', opts: ['2(2y − 8) + 3y = 5', '2y − 8 + 3y = 5'], ans: 0, res: ['2(2y − 8) + 3y = 5', '2(2y) − 8 + 3y = 5'], rans: 0,
              hint: '2x becomes 2 times the whole (2y − 8).', no: { 1: 'The 2 in 2x must multiply all of it: use brackets.', r1: 'Keep the brackets around all of 2y − 8.' } },
            { q: 'Next move?', opts: ['Distribute and combine', 'Divide by 2'], ans: 0, res: ['7y − 8 = 5', '7y − 16 = 5'], rans: 1,
              hint: '2 times −8 is −16. Then 4y + 3y = 7y.', no: { 1: 'Open the brackets first.', r0: 'Multiply the 8 by 2 too.' } },
            { q: 'Next move?', opts: ['Add 16, then divide by 7', 'Subtract 16, then divide by 7'], ans: 0, res: ['y = 3', 'y = −11/7'], rans: 0,
              hint: '7y = 21.' },
            { q: 'Back-substitute.', opts: ['Put y = 3 into x = 2y − 8', 'Put y = 3 into x = 2y + 8'], ans: 0, res: ['x = −2', 'x = 14'], rans: 0,
              hint: 'x = 2(3) − 8.', no: { 1: 'The rule is x = 2y − 8.' }, why: '(−2, 3). Check: −4 + 9 = 5 ✓ and −2 − 6 = −8 ✓' }
          ] }
      ] },
    { name: 'Trap stations', learn: ['Letters vanish and you get something *false* (−6 = 5): *no solution*. The lines are parallel.', 'Letters vanish and you get something *true* (8 = 8): *infinitely many*. It is the same line.'],
      tasks: [
        { k: 'solve', q: 'Solve *y = 2x + 3* and *4x − 2y = 5*.', start: 'y = 2x + 3 and 4x − 2y = 5',
          moves: [
            { q: 'First move?', opts: ['Replace y with (2x + 3)', 'Replace x with (2x + 3)'], ans: 0, res: ['4x − 2(2x + 3) = 5', '4x − 2x + 3 = 5'], rans: 0,
              hint: 'y is already alone. Swap it in brackets.', no: { 1: 'It is y that equals 2x + 3.', r1: 'Keep the brackets: −2 times all of it.' } },
            { q: 'Next move?', opts: ['Distribute the −2', 'Add 2 to both sides'], ans: 0, res: ['4x − 4x + 6 = 5', '4x − 4x − 3 = 5', '4x − 4x − 6 = 5'], rans: 2,
              hint: '−2 times 2x and −2 times 3.', no: { 1: 'Open the brackets first.', r0: '−2 times +3 is −6.', r1: 'Multiply the 3 by −2 too.' } },
            { q: 'Next move?', opts: ['Combine like terms', 'Divide by 4'], ans: 0, res: ['−6 = 5', '8x − 6 = 5'], rans: 0,
              hint: '4x − 4x = 0.', no: { r1: '4x − 4x is 0, not 8x.' } },
            { q: 'What does −6 = 5 tell you?', opts: ['It is always true', 'It is never true'], ans: 1, res: ['No solution: parallel lines', 'Infinitely many: same line'], rans: 0,
              hint: '−6 is not 5.', no: { 0: '−6 = 5 is false.', r1: 'A false statement means no point works.' }, why: 'Both lines have slope 2 (4x − 2y = 5 is y = 2x − 2.5). Parallel.' }
          ] },
        { k: 'solve', q: 'Solve *x + 3y = 4* and *2x + 6y = 8*.', start: 'x + 3y = 4 and 2x + 6y = 8',
          moves: [
            { q: 'Solve equation 1 for x.', opts: ['Subtract 3y from both sides', 'Divide by 3'], ans: 0, res: ['x = 4 + 3y', 'x = 4 − 3y'], rans: 1,
              hint: 'Remove + 3y by subtracting.', no: { 1: 'x has coefficient 1. Just move the 3y.', r0: 'Subtracting 3y makes − 3y.' } },
            { q: 'Substitute into equation 2.', opts: ['2(4 − 3y) + 6y = 8', '2(4 − 3y) + 6(4 − 3y) = 8'], ans: 0, res: ['2(4 − 3y) + 6y = 8', '8 − 3y + 6y = 8'], rans: 0,
              hint: 'Replace only x. The 6y stays.', no: { 1: 'Only x is replaced. 6y stays as 6y.', r1: 'Keep the brackets: 2 times all of (4 − 3y).' } },
            { q: 'Distribute and combine.', opts: ['Multiply 2 by both terms', 'Multiply 2 by the 4 only'], ans: 0, res: ['8 − 6y + 6y = 8, so 8 = 8', '8 − 3y + 6y = 8, so 3y = 0'], rans: 0,
              hint: '2 times 4 and 2 times −3y.', no: { 1: 'The 2 multiplies every term inside.' } },
            { q: 'What does 8 = 8 tell you?', opts: ['It is always true', 'It is never true'], ans: 0, res: ['No solution', 'Infinitely many: same line'], rans: 1,
              hint: '8 = 8 is true, whatever y is.', no: { 1: '8 = 8 is true.', r0: 'A true statement means every point on the line works.' }, why: 'Equation 2 is equation 1 times 2: the same line.' }
          ] },
        { k: 'sort', q: 'Each card shows how a substitution ended. Sort them.', bins: ['One solution', 'No solution', 'Infinitely many'],
          cards: [{ t: 'x = 4', b: 0 }, { t: '0 = 5', b: 1 }, { t: '7 = 7', b: 2 }, { t: '−3 = 2', b: 1 }, { t: 'y = 0', b: 0, why: 'y = 0 is a number. It gives one solution.' }, { t: '0 = 0', b: 2, why: '0 = 0 is true, so every point on the line works.' }],
          why: 'A letter = a number: one. True: infinitely many. False: none.' },
        { k: 'choice', q: 'A substitution ends with *−6 = 5*. What do the two lines look like?', opts: ['They cross once', 'They are parallel', 'They are the same line'], ans: 1,
          no: ['Crossing once gives x = a number.', null, 'The same line gives something true, like 8 = 8.'], why: 'No solution: parallel lines never meet.' }
      ] },
    { name: 'Station 3 and 4', learn: ['Plan: which letter has coefficient 1 or −1? Get it alone.', 'Brackets, distribute, solve, back-substitute, check.'],
      tasks: [
        { k: 'solve', q: 'Station 3: solve *x − y = −1* and *3x + 2y = 12*.', start: 'x − y = −1 and 3x + 2y = 12',
          moves: [
            { q: 'Solve equation 1 for x.', opts: ['Add y to both sides', 'Subtract y from both sides'], ans: 0, res: ['x = y − 1', 'x = −1 − y'], rans: 0,
              hint: 'Undo − y by adding y.', no: { 1: 'Subtracting gives − 2y. Add y.', r1: 'Adding y makes + y.' } },
            { q: 'Substitute into equation 2.', opts: ['3(y − 1) + 2y = 12', '3y − 1 + 2y = 12'], ans: 0, res: ['3(y − 1) + 2y = 12', '3y − 3 + 2 = 12'], rans: 0,
              hint: 'Brackets: 3 times all of x.', no: { 1: 'The 3 must multiply all of (y − 1).', r1: 'Keep the y in 2y.' } },
            { q: 'Next move?', opts: ['Distribute and combine', 'Divide by 3'], ans: 0, res: ['5y − 3 = 12', '5y − 1 = 12'], rans: 0,
              hint: '3 times −1 is −3. 3y + 2y = 5y.', no: { r1: 'Multiply the −1 by 3 too.' } },
            { q: 'Next move?', opts: ['Add 3, then divide by 5', 'Subtract 3, then divide by 5'], ans: 0, res: ['y = 3', 'y = 1.8'], rans: 0, hint: '5y = 15.' },
            { q: 'Back-substitute.', opts: ['Put y = 3 into x = y − 1', 'Put y = 3 into x = 1 − y'], ans: 0, res: ['x = 4', 'x = 2'], rans: 1,
              hint: 'x = 3 − 1.', no: { 1: 'The rule is x = y − 1.', r0: '3 − 1 = 2.' }, why: '(2, 3). Check: 2 − 3 = −1 ✓ and 6 + 6 = 12 ✓' }
          ] },
        { k: 'pair', q: 'Station 4: the total is 3 times the y from Station 3, so 3 × 3 = 9. Solve *x + y = 9* and *2x − y = 3*.', ans: [4, 5], hint: 'y = 9 − x. Then 2x − (9 − x) = 3.', why: '3x − 9 = 3, x = 4, y = 5. Check: 8 − 5 = 3 ✓' },
        { k: 'choice', q: 'Next system: *5x − y = 7* and *3x + 2y = 12*. Best first move?', opts: ['Solve eq 1 for y: y = 5x − 7', 'Solve eq 1 for y: y = −5x + 7', 'Solve eq 2 for x'], ans: 0,
          no: [null, 'Move 5x: −y = −5x + 7. Then times −1 changes every sign.', 'x has a 3 there: fractions.'], why: '−y = −5x + 7, so y = 5x − 7.' },
        { k: 'number', q: 'Now finish it: *3x + 2(5x − 7) = 12*. What is x?', ans: 2, hint: 'Distribute: 3x + 10x − 14 = 12.', why: '13x = 26, so x = 2. Then y = 5(2) − 7 = 3.' }
      ] },
    { name: 'The treasure boss', boss: true, learn: ['The last stations. Get one letter alone, use brackets, and watch for traps.'],
      tasks: [
        { k: 'solve', q: 'Solve *3x + y = 7* and *2x − 3y = 1*.', start: '3x + y = 7 and 2x − 3y = 1',
          moves: [
            { q: 'First move?', opts: ['Solve eq 1 for y', 'Solve eq 2 for x'], ans: 0, res: ['y = 7 − 3x', 'y = 7 + 3x'], rans: 0 },
            { q: 'Substitute.', opts: ['2x − 3(7 − 3x) = 1', '2x − 3 · 7 − 3x = 1'], ans: 0, res: ['2x − 3(7 − 3x) = 1', '3x + (7 − 3x) = 7'], rans: 0 },
            { q: 'Next move?', opts: ['Distribute and combine', 'Add 3 to both sides'], ans: 0, res: ['−7x − 21 = 1', '11x − 21 = 1'], rans: 1, hint: '−3 times −3x is +9x.' },
            { q: 'Next move?', opts: ['Add 21, then divide by 11', 'Subtract 21, then divide by 11'], ans: 0, res: ['x = 2', 'x = −20/11'], rans: 0 },
            { q: 'Back-substitute.', opts: ['Put x = 2 into y = 7 − 3x', 'Put x = 2 into y = 7x − 3'], ans: 0, res: ['y = 1', 'y = 11'], rans: 0, why: '(2, 1). Check: 4 − 3 = 1 ✓' }
          ] },
        { k: 'choice', q: 'Zero solves *2x + y = 5* and *6x + 3y = 15* and gets *15 = 15*. What is the answer?', opts: ['x = 15', 'No solution', 'Infinitely many: same line'], ans: 2,
          no: ['There is no letter left. 15 = 15 is a true statement.', '15 = 15 is true, not false.', null], why: 'Equation 2 is equation 1 times 3: the same line.' },
        { k: 'pair', q: 'Solve *−x + y = 2* and *4x + y = 17*.', ans: [3, 5], hint: 'y = x + 2. Then 4x + (x + 2) = 17.', why: '5x + 2 = 17, x = 3, y = 5. Check: 12 + 5 = 17 ✓' },
        { k: 'number', q: 'Zero has *15 coins*, some 1 SAR and some 2 SAR, worth *22 SAR* in all. How many *2 SAR* coins? (a + b = 15 and a + 2b = 22)', ans: 7, hint: 'a = 15 − b. Then (15 − b) + 2b = 22.', why: '15 + b = 22, so b = 7 two-riyal coins and 8 one-riyal coins.' }
      ] }
  ]
});
