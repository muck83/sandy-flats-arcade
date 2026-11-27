/* Homework: Unit 4 Lesson 2, One, None or Infinitely Many. */
SFA_HW({
  id: 'g62', unit: 4, lesson: 2, topic: 'One, none or infinitely many', title: 'The Mind-Reading Machine', who: 'zero',
  intro: ['Zero built a mind-reading machine for the arcade. You feed it an equation, and it shows the secret number x.',
    'But some equations make it flash *EVERY NUMBER!* and some make it jam with *NO NUMBER!* Solve each one move by move and tell the machine which kind it is.'],
  goal: 'Solve linear equations and tell if they have one solution, no solution or infinitely many.',
  bigIdea: 'Simplify until you see x = a number (one solution), a true statement like 6 = 6 (infinitely many) or a false one like 1 = −3 (none).',
  levels: [
    { name: 'Warm up the machine', learn: ['Do the *same thing to both sides*, so the equation stays balanced.', 'Get the x terms on one side first. Undo adding or subtracting, then multiplying.'],
      tasks: [
        { k: 'solve', q: 'Solve *2x + 7 = 15*.', start: '2x + 7 = 15',
          moves: [
            { q: 'First move?', opts: ['Divide both sides by 2', 'Subtract 7 from both sides', 'Add 7 to both sides'], ans: 1, res: ['2x = 22', '2x = 8', 'x + 7 = 15'], rans: 1,
              hint: 'Undo the + 7 first.', no: { 0: 'You can, but then 7 and 15 must be divided too. Undo + 7 first: it is easier.', 2: 'Adding 7 does not undo + 7.', r0: '15 + 7 is adding. You subtracted.', r2: 'Subtracting 7 does not change the 2 in 2x.' } },
            { q: 'Next move?', opts: ['Subtract 2 from both sides', 'Divide both sides by 2'], ans: 1, res: ['x = 4', 'x = 6', 'x = 16'], rans: 0,
              hint: '2x means 2 times x. Undo times by dividing.', no: { 0: '2x is 2 times x. Divide to undo it.', r1: '8 − 2 = 6 is subtracting. You divided.', r2: '8 × 2 is multiplying. You divided.' }, why: 'Check: 2(4) + 7 = 15 ✓. One solution.' }
          ] },
        { k: 'solve', q: 'Solve *3x + 5 = x + 13*. There is an x on both sides.', start: '3x + 5 = x + 13',
          moves: [
            { q: 'First, get the x terms together.', opts: ['Subtract x from both sides', 'Subtract 3x from the left only', 'Add x to both sides'], ans: 0, res: ['3x + 5 = 13', '2x + 5 = 13', '4x + 5 = 13'], rans: 1,
              hint: 'There is an x on the right. Subtract x from both sides.', no: { 1: 'Always do the same to both sides.', 2: 'Adding x makes 2x on the right. Subtract to remove it.', r0: '3x − x = 2x, not 3x.', r2: '3x − x is 2x. You subtracted.' } },
            { q: 'Next move?', opts: ['Subtract 5 from both sides', 'Divide both sides by 2'], ans: 0, res: ['2x = 18', '2x = 8'], rans: 1,
              hint: 'Undo the + 5.', no: { 1: 'Undo the + 5 first, then divide.', r0: '13 − 5 = 8, not 18.' } },
            { q: 'Last move?', opts: ['Divide both sides by 2', 'Subtract 2 from both sides'], ans: 0, res: ['x = 6', 'x = 4'], rans: 1,
              hint: 'Divide to undo 2 times x.', no: { 1: '2x is 2 times x. Divide.' }, why: 'Check: 3(4) + 5 = 17 and 4 + 13 = 17 ✓' }
          ] },
        { k: 'choice', q: 'What is a good first move for *5x − 2 = 3x + 8*?', opts: ['Add 2 to the left only', 'Subtract 3x from both sides', 'Subtract 5x from the left only'], ans: 1,
          no: ['Both sides, always. And + 2 to the left side only breaks the balance.', null, 'Do the same to both sides.'], why: 'It gives 2x − 2 = 8. Then add 2 and divide by 2.' },
        { k: 'number', q: 'Now finish it. Solve *5x − 2 = 3x + 8*. x = ?', ans: 5, hint: '2x − 2 = 8. Add 2 to both sides, then divide by 2.', why: '2x = 10, so x = 5. Check: 23 = 23 ✓' }
      ] },
    { name: 'When x vanishes', learn: ['If the x\'s disappear and you get something *true* (6 = 6): *infinitely many* solutions. Every number works.', 'If the x\'s disappear and you get something *false* (1 = −3): *no solution*.'],
      tasks: [
        { k: 'solve', q: 'Solve *2x + 6 = 2(x + 3)*.', start: '2x + 6 = 2(x + 3)',
          moves: [
            { q: 'First move?', opts: ['Distribute the 2', 'Subtract 6 from the left only'], ans: 0, res: ['2x + 6 = 2x + 3', '2x + 6 = 2x + 6'], rans: 1,
              hint: 'Multiply *both* terms in the bracket by 2.', no: { 1: 'Do the same to both sides. Open the bracket first.', r0: 'The 2 multiplies the 3 too: 2 × 3 = 6.' } },
            { q: 'Next move?', opts: ['Subtract 2x from both sides', 'Divide both sides by x'], ans: 0, res: ['6 = 6', '0 = 0x'], rans: 0,
              hint: 'Take 2x away from both sides.', no: { 1: 'Never divide by x. Subtract 2x.' } },
            { q: 'What does 6 = 6 tell you?', opts: ['It is never true', 'It is always true'], ans: 1, res: ['Infinitely many solutions', 'No solution', 'x = 6'], rans: 0,
              hint: '6 = 6 is true, whatever x was.', no: { 0: '6 = 6 is true!', r1: 'A true statement means every number works.', r2: 'The x is gone. It is not x = 6.' }, why: 'Both sides are the same expression. Every number works.' }
          ] },
        { k: 'solve', q: 'Solve *4x + 1 = 4x − 3*.', start: '4x + 1 = 4x − 3',
          moves: [
            { q: 'First move?', opts: ['Subtract 4x from both sides', 'Subtract 1 from both sides'], ans: 0, res: ['1 = −3', '0 = −2'], rans: 0,
              hint: 'There is 4x on both sides. Take it away.', no: { 1: 'That works too, but the x is still there. Subtract 4x to see it fast.', r1: '4x − 4x = 0, and the 1 and −3 stay.' } },
            { q: 'What does 1 = −3 tell you?', opts: ['It is always true', 'It is never true'], ans: 1, res: ['No solution', 'Infinitely many solutions', 'x = −3'], rans: 0,
              hint: '1 is not −3, whatever x is.', no: { 0: '1 = −3 is false.', r1: 'A false statement means no number works.', r2: 'The x is gone. It is not x = −3.' }, why: 'The same 4x cannot give 1 and −3. No number works.' }
          ] },
        { k: 'choice', q: 'Yousef\'s trick: think of x, double it, add 6, take away 2x. So *2x + 6 − 2x = 6*. Which numbers make it true?', opts: ['Only x = 6', 'No number', 'Every number'], ans: 2,
          no: ['Try x = 10: 20 + 6 − 20 = 6. It works too.', 'Try any number: you always get 6.', null], why: '2x − 2x = 0, so it is 6 = 6: true for every x.' },
        { k: 'choice', q: 'Lina asks: is a number plus 3 ever equal to the same number plus 5? *x + 3 = x + 5*', opts: ['Yes, for x = 2', 'Never: no solution', 'Always: every number'], ans: 1,
          no: ['2 + 3 = 5 and 2 + 5 = 7. Not equal.', null, 'Try x = 0: 3 and 5. Not equal.'], why: 'Subtract x: 3 = 5 is false. No number works.' }
      ] },
    { name: 'Sort the jam', learn: ['*Distribute first*, then collect the x terms on one side.', 'See what is left: x = a number, true or false.'],
      tasks: [
        { k: 'sort', q: 'Simplify each equation in your head. Then sort it.', bins: ['One solution', 'No solution', 'Infinitely many'],
          cards: [{ t: '3x + 4 = x + 10', b: 0, why: '2x = 6, so x = 3.' }, { t: '6 − x = x + 2', b: 0, why: '4 = 2x, so x = 2.' }, { t: '5(x − 1) = 5x − 5', b: 2, why: '5x − 5 = 5x − 5: the same both sides.' },
            { t: '3x + 2x + 1 = 5x + 1', b: 2, why: '5x + 1 = 5x + 1: the same both sides.' }, { t: '2x + 9 = 2x − 1', b: 1, why: 'Subtract 2x: 9 = −1, false.' },
            { t: '4(x + 2) = 4x + 6', b: 1, why: '4x + 8 = 4x + 6, so 8 = 6: false.' }, { t: '7x = 3x', b: 0, why: '4x = 0, so x = 0. Zero is still one solution!' }],
          why: 'x = a number: one. True statement: infinitely many. False statement: none.' },
        { k: 'solve', q: 'Solve *3(x + 4) = 3x + 10*.', start: '3(x + 4) = 3x + 10',
          moves: [
            { q: 'First move?', opts: ['Subtract 4 from both sides', 'Distribute the 3'], ans: 1, res: ['3x + 4 = 3x + 10', '3x + 12 = 3x + 10', '3x + 7 = 3x + 10'], rans: 1,
              hint: 'Open the bracket first: 3 times x and 3 times 4.', no: { 0: 'The 4 is inside a bracket. Open the bracket first.', r0: 'You forgot to multiply the 4 by 3.', r2: 'Multiply, do not add: 3 × 4 = 12.' } },
            { q: 'Next move?', opts: ['Subtract 3x from both sides', 'Divide both sides by 3'], ans: 0, res: ['12 = 10', 'x = 10'], rans: 0,
              hint: 'There is 3x on both sides.', no: { 1: 'Collect the x terms first: subtract 3x.', r1: '3x − 3x = 0. The x is gone.' } },
            { q: 'Decide.', opts: ['12 = 10 is false', '12 = 10 is true'], ans: 0, res: ['Infinitely many solutions', 'No solution'], rans: 1,
              hint: 'Is 12 really equal to 10?', no: { 1: '12 is not 10.', r0: 'A false statement means no number works.' }, why: 'The machine jams: no number works.' }
          ] },
        { k: 'choice', q: 'Priya solves *6x + 2 = 6x + 2* and gets *0 = 0*. She writes "x = 0". What should she write?', opts: ['x = 0 is the only answer', 'Infinitely many solutions', 'No solution'], ans: 1,
          no: ['0 = 0 has no x in it. Try x = 5 in the start: 32 = 32. It works too.', null, '0 = 0 is true, not false.'], why: '0 = 0 is a true statement, so every number works.' }
      ] },
    { name: 'Build your own', learn: ['For *no solution*: same x part on both sides, different numbers (2x + 1 = 2x + 4).', 'For *infinitely many*: make both sides exactly the same.'],
      tasks: [
        { k: 'choice', q: 'Which equation has *no solution*?', opts: ['4x + 5 = 4x + 5', '4x + 5 = 2x + 5', '4x + 5 = 4x + 1'], ans: 2,
          no: ['Both sides are the same: infinitely many.', '2x = 0 gives x = 0: one solution.', null], why: 'Subtract 4x: 5 = 1, false. No solution.' },
        { k: 'choice', q: 'Which right side makes *2(x + 4) = ?* true for *every* x?', opts: ['2x + 4', '2x + 8', 'x + 8'], ans: 1,
          no: ['2 × 4 = 8, not 4.', null, 'The 2 multiplies the x too.'], why: '2(x + 4) = 2x + 8. Same both sides: infinitely many.' },
        { k: 'number', q: 'What number in the box makes *2(x + 3) = 2x + □* true for every x?', ans: 6, hint: 'Distribute the left side first.', why: '2(x + 3) = 2x + 6. With 6 in the box, both sides match.' },
        { k: 'solve', q: 'Solve *7 − x = x + 1*.', start: '7 − x = x + 1',
          moves: [
            { q: 'Get the x terms together.', opts: ['Add x to the left only', 'Add x to both sides'], ans: 1, res: ['7 = 2x + 1', '7 = x + 1', '7 + x = 2x + 1'], rans: 0,
              hint: 'Adding x cancels the − x on the left. Do it to both sides.', no: { 0: 'Both sides, always.', r1: 'x + x is 2x.', r2: '−x + x = 0, so the left side is just 7.' } },
            { q: 'Next move?', opts: ['Subtract 1 from both sides', 'Divide both sides by 2'], ans: 0, res: ['6 = 2x', '8 = 2x'], rans: 0,
              hint: 'Undo the + 1.', no: { 1: 'Undo the + 1 first.', r1: '7 − 1 = 6, not 8.' } },
            { q: 'Last move?', opts: ['Subtract 2 from both sides', 'Divide both sides by 2'], ans: 1, res: ['x = 3', 'x = 4', 'x = 12'], rans: 0,
              hint: '2x means 2 times x.', no: { 0: 'Divide to undo times.', r2: '6 × 2 is multiplying.' }, why: 'Check: 7 − 3 = 4 and 3 + 1 = 4 ✓. One solution.' }
          ] }
      ] },
    { name: 'The jammed machine boss', boss: true, learn: ['Mixed equations. Distribute, collect x terms, then decide: one, none or infinitely many.'],
      tasks: [
        { k: 'solve', q: 'Solve *2(3x − 1) = 4x + 6*.', start: '2(3x − 1) = 4x + 6',
          moves: [
            { q: 'First move?', opts: ['Distribute the 2', 'Add 1 to both sides'], ans: 0, res: ['6x − 1 = 4x + 6', '6x − 2 = 4x + 6', '5x + 1 = 4x + 6'], rans: 1,
              hint: '2 times 3x and 2 times −1.', no: { 1: 'The − 1 is inside the bracket. Open it first.', r0: 'Multiply the −1 by 2 as well.' } },
            { q: 'Next move?', opts: ['Subtract 4x from both sides', 'Subtract 6x from both sides'], ans: 0, res: ['2x − 2 = 6', '10x − 2 = 6'], rans: 0, hint: 'Remove the 4x on the right.' },
            { q: 'Next move?', opts: ['Subtract 2 from both sides', 'Add 2 to both sides'], ans: 1, res: ['2x = 8', '2x = 4'], rans: 0, hint: 'Undo − 2 by adding 2.' },
            { q: 'Last move?', opts: ['Divide both sides by 2', 'Multiply both sides by 2'], ans: 0, res: ['x = 16', 'x = 4'], rans: 1, why: 'Check: 2(12 − 1) = 22 and 16 + 6 = 22 ✓' }
          ] },
        { k: 'choice', q: 'The machine jams on *5x − 4 = 5(x − 1)*. Why?', opts: ['x = 1', 'Infinitely many solutions', 'No solution: −4 = −5 is false'], ans: 2,
          no: ['Try it: 5 − 4 = 1, but 5(0) = 0.', 'Distribute: 5x − 5. The numbers −4 and −5 are different.', null], why: '5x − 4 = 5x − 5. Subtract 5x: −4 = −5, false.' },
        { k: 'number', q: 'Solve *9 − 2x = x + 3*. x = ?', ans: 2, hint: 'Add 2x to both sides: 9 = 3x + 3.', why: '6 = 3x, so x = 2. Check: 5 = 5 ✓' },
        { k: 'choice', q: 'How many solutions has *6x + 2 − x = 5x + 2*?', opts: ['One: x = 0', 'None', 'Infinitely many'], ans: 2,
          no: ['Collect the left side first: 6x − x = 5x.', 'Collect: 5x + 2 = 5x + 2. That is true.', null], why: 'The left side is 5x + 2, the same as the right. Every number works.' }
      ] }
  ]
});
