/* Homework: Unit 4 Lesson 3, Brackets and Fractions. */
SFA_HW({
  id: 'g63', unit: 4, lesson: 3, topic: 'Brackets and fractions', title: 'Camp Cost Splitter', who: 'marcus',
  intro: ['The friends are planning a desert camping weekend, and Marcus is in charge of the money. Every cost is split, shared or bracketed.',
    'His notebook is full of equations with brackets, fractions and decimals. Solve them one move at a time so nobody pays too much.'],
  goal: 'Solve equations with brackets, fractions and decimals, one move at a time, and check the answer.',
  bigIdea: 'Open brackets by multiplying every term inside, clear fractions by multiplying every term, then solve and check.',
  levels: [
    { name: 'Open the brackets', learn: ['*a(b + c) = ab + ac*: multiply *every* term inside the bracket.', '*Like terms* have the same letter part: 3x and 2x can be added.'],
      tasks: [
        { k: 'choice', q: 'What is *3(x − 4)* without brackets?', opts: ['3x − 4', '3x − 12', '3x + 12', 'x − 12'], ans: 1,
          no: ['The 3 multiplies the 4 too.', null, '3 times −4 is −12, not +12.', 'The 3 multiplies the x too.'], why: '3 × x = 3x and 3 × (−4) = −12.' },
        { k: 'choice', q: 'What is *−2(x − 5)* without brackets?', opts: ['−2x − 10', '−2x + 5', '−2x + 10'], ans: 2,
          no: ['−2 times −5 is positive.', 'Multiply the 5 by −2 too.', null], why: '−2 × x = −2x and −2 × (−5) = +10.' },
        { k: 'solve', q: 'Solve *2(x + 5) − x = 13*.', start: '2(x + 5) − x = 13',
          moves: [
            { q: 'First move?', opts: ['Subtract 5 from both sides', 'Distribute the 2'], ans: 1, res: ['2x + 5 − x = 13', '2x + 10 − x = 13', '2x + 7 − x = 13'], rans: 1,
              hint: 'Open the bracket first: 2 times x and 2 times 5.', no: { 0: 'The 5 is inside a bracket. Open it first.', r0: 'You forgot to multiply the 5 by 2.', r2: 'Multiply, do not add: 2 × 5 = 10.' } },
            { q: 'Next move?', opts: ['Collect like terms (2x − x)', 'Subtract 10 from the left only'], ans: 0, res: ['x + 10 = 13', '3x + 10 = 13'], rans: 0,
              hint: '2x take away x leaves 1x, just x.', no: { 1: 'Both sides, always. Collect the x terms first.', r1: '2x − x is x, not 3x.' } },
            { q: 'Last move?', opts: ['Add 10 to both sides', 'Subtract 10 from both sides'], ans: 1, res: ['x = 23', 'x = 3'], rans: 1,
              hint: 'Undo + 10 by subtracting 10.', no: { 0: 'Adding 10 does not undo + 10.', r0: '13 + 10 is adding. You subtracted.' }, why: 'Check: 2(3 + 5) − 3 = 16 − 3 = 13 ✓' }
          ] },
        { k: 'number', q: 'Marcus rents 4 sleeping bags. Each costs x SAR plus 1 SAR for cleaning. Total: *4(x + 1) = 20*. Find x.', ans: 4, unit: 'SAR', hint: 'Distribute: 4x + 4 = 20. Then subtract 4 and divide.', why: '4x + 4 = 20, so 4x = 16 and x = 4.' }
      ] },
    { name: 'Distribute and collect', learn: ['Order: *distribute*, then *collect like terms*, then undo + or −, then undo × or ÷.', 'Watch the sign in front of the bracket.'],
      tasks: [
        { k: 'solve', q: 'Solve *4(x − 3) + 2x = 24*.', start: '4(x − 3) + 2x = 24',
          moves: [
            { q: 'First move?', opts: ['Distribute the 4', 'Add 3 to both sides'], ans: 0, res: ['4x − 3 + 2x = 24', '4x − 12 + 2x = 24', '4x + 12 + 2x = 24'], rans: 1,
              hint: '4 times x and 4 times −3.', no: { 1: 'The − 3 is inside the bracket. Open it first.', r0: 'Multiply the 3 by 4 too.', r2: '4 times −3 is negative.' } },
            { q: 'Next move?', opts: ['Collect like terms (4x + 2x)', 'Divide both sides by 4'], ans: 0, res: ['6x − 12 = 24', '8x − 12 = 24', '4x − 10 = 24'], rans: 0,
              hint: 'Add the x terms: 4x + 2x.', no: { 1: 'Collect the x terms first.', r1: '4x + 2x = 6x. Add, do not multiply.', r2: 'Add the x terms, not 2 and −12.' } },
            { q: 'Next move?', opts: ['Subtract 12 from both sides', 'Add 12 to both sides'], ans: 1, res: ['6x = 36', '6x = 12'], rans: 0,
              hint: 'Undo − 12 by adding 12.', no: { 0: 'Subtracting makes it − 24. Undo − 12 with + 12.', r1: '24 + 12 = 36.' } },
            { q: 'Last move?', opts: ['Divide both sides by 6', 'Subtract 6 from both sides'], ans: 0, res: ['x = 6', 'x = 30'], rans: 0,
              hint: '6x means 6 times x.', no: { 1: 'Divide to undo times.' }, why: 'Check: 4(6 − 3) + 12 = 12 + 12 = 24 ✓' }
          ] },
        { k: 'solve', q: 'Solve *5(x + 2) = 3x + 20*.', start: '5(x + 2) = 3x + 20',
          moves: [
            { q: 'First move?', opts: ['Subtract 3x from the right only', 'Distribute the 5'], ans: 1, res: ['5x + 10 = 3x + 20', '5x + 2 = 3x + 20'], rans: 0,
              hint: 'Open the bracket: 5 times x, 5 times 2.', no: { 0: 'Do the same to both sides. Open the bracket first.', r1: 'Multiply the 2 by 5 too.' } },
            { q: 'Next move?', opts: ['Subtract 3x from both sides', 'Add 3x to both sides'], ans: 0, res: ['8x + 10 = 20', '2x + 10 = 20'], rans: 1,
              hint: 'Remove the 3x on the right.', no: { 1: 'Adding makes 6x on the right. Subtract 3x.', r0: '5x − 3x = 2x.' } },
            { q: 'Next move?', opts: ['Subtract 10 from both sides', 'Divide both sides by 2'], ans: 0, res: ['2x = 10', '2x = 30'], rans: 0,
              hint: 'Undo + 10.', no: { 1: 'Undo the + 10 first.', r1: '20 − 10 = 10.' } },
            { q: 'Last move?', opts: ['Divide both sides by 2', 'Multiply both sides by 2'], ans: 0, res: ['x = 20', 'x = 5'], rans: 1,
              hint: 'Divide to undo 2 times x.', why: 'Check: 5(7) = 35 and 15 + 20 = 35 ✓' }
          ] },
        { k: 'solve', q: 'Solve *−2(x − 5) = 16*. Careful with the negative.', start: '−2(x − 5) = 16',
          moves: [
            { q: 'First move?', opts: ['Distribute the −2', 'Add 5 to both sides'], ans: 0, res: ['−2x − 10 = 16', '−2x + 10 = 16'], rans: 1,
              hint: '−2 times −5 is positive 10.', no: { 1: 'The − 5 is inside the bracket. Open it first.', r0: 'Negative times negative is positive: −2 × −5 = +10.' } },
            { q: 'Next move?', opts: ['Subtract 10 from both sides', 'Add 10 to both sides'], ans: 0, res: ['−2x = 6', '−2x = 26'], rans: 0,
              hint: 'Undo + 10 by subtracting 10.', no: { 1: 'Adding does not undo + 10.', r1: '16 − 10 = 6.' } },
            { q: 'Last move?', opts: ['Divide both sides by 2', 'Divide both sides by −2'], ans: 1, res: ['x = 3', 'x = −3', 'x = −12'], rans: 1,
              hint: 'x is stuck to −2, so divide by −2.', no: { 0: 'Divide by the whole −2, sign and all.', r0: '6 ÷ (−2) is negative.', r2: 'Divide, do not multiply or subtract.' }, why: 'Check: −2(−3 − 5) = −2(−8) = 16 ✓' }
          ] }
      ] },
    { name: 'Fraction busters', learn: ['To clear a fraction, multiply *every term on both sides* by its denominator.', 'Or distribute the fraction first: ½(6x + 8) = 3x + 4.'],
      tasks: [
        { k: 'solve', q: 'Solve *½(6x + 8) = x − 2*.', start: '½(6x + 8) = x − 2',
          moves: [
            { q: 'First move?', opts: ['Distribute the ½', 'Subtract 8 from both sides'], ans: 0, res: ['3x + 8 = x − 2', '3x + 4 = x − 2', '12x + 16 = x − 2'], rans: 1,
              hint: 'Half of 6x and half of 8.', no: { 1: 'The 8 is inside the bracket. Open it first.', r0: 'Halve the 8 too.', r2: '½ means half, not times 2.' } },
            { q: 'Next move?', opts: ['Subtract x from both sides', 'Subtract 3x from the left only'], ans: 0, res: ['2x + 4 = −2', '4x + 4 = −2'], rans: 0,
              hint: 'Collect the x terms on the left.', no: { 1: 'Both sides, always.', r1: '3x − x = 2x.' } },
            { q: 'Next move?', opts: ['Add 4 to both sides', 'Subtract 4 from both sides'], ans: 1, res: ['2x = −6', '2x = 2', '2x = −2'], rans: 0,
              hint: 'Undo + 4. Then −2 − 4 is more negative.', no: { 0: 'Adding does not undo + 4.', r1: '−2 − 4 = −6, not 2.', r2: '−2 − 4 = −6.' } },
            { q: 'Last move?', opts: ['Divide both sides by 2', 'Subtract 2 from both sides'], ans: 0, res: ['x = −3', 'x = 3'], rans: 0,
              hint: 'Divide to undo times 2.', no: { 1: 'Divide to undo times.', r1: '−6 ÷ 2 is negative.' }, why: 'Check: ½(−18 + 8) = −5 and −3 − 2 = −5 ✓' }
          ] },
        { k: 'solve', q: 'Three friends split the tent and 30 SAR of firewood. Each pays 25 SAR: *⅓(x + 30) = 25*. Find the tent price x by clearing the fraction.', start: '⅓(x + 30) = 25',
          moves: [
            { q: 'First move?', opts: ['Multiply both sides by 3', 'Subtract 30 from both sides'], ans: 0, res: ['x + 30 = 75', 'x + 30 = 25', '3x + 90 = 75'], rans: 0,
              hint: '3 times ⅓ is 1. Multiply the 25 by 3 too.', no: { 1: 'The 30 is inside the bracket with the ⅓. Clear the fraction first.', r1: 'Multiply the right side by 3 too.', r2: '3 × ⅓(x + 30) is just x + 30.' } },
            { q: 'Last move?', opts: ['Add 30 to both sides', 'Subtract 30 from both sides'], ans: 1, res: ['x = 45', 'x = 105'], rans: 0,
              hint: 'Undo + 30.', no: { 0: 'Adding does not undo + 30.', r1: '75 − 30 = 45.' }, why: 'The tent is 45 SAR. Check: ⅓(75) = 25 ✓' }
          ] },
        { k: 'solve', q: 'Solve *x/4 + 5 = 8* by clearing the fraction.', start: 'x/4 + 5 = 8',
          moves: [
            { q: 'First move?', opts: ['Multiply only x/4 by 4', 'Multiply every term by 4'], ans: 1, res: ['x + 20 = 32', 'x + 5 = 32', 'x + 20 = 8'], rans: 0,
              hint: 'Every term: x/4, 5 and 8 all get multiplied by 4.', no: { 0: 'Every term must be multiplied, or the balance breaks.', r1: 'The 5 must be multiplied by 4 too.', r2: 'The 8 must be multiplied by 4 too.' } },
            { q: 'Last move?', opts: ['Subtract 20 from both sides', 'Divide both sides by 20'], ans: 0, res: ['x = 12', 'x = 52'], rans: 0,
              hint: 'Undo + 20.', no: { 1: '20 is added, not multiplied. Subtract it.', r1: '32 − 20 = 12.' }, why: 'Check: 12/4 + 5 = 3 + 5 = 8 ✓' }
          ] },
        { k: 'number', q: 'Solve *⅔(x − 3) = 8*. x = ?', ans: 15, hint: 'Multiply both sides by 3: 2(x − 3) = 24. Then divide by 2.', why: 'x − 3 = 12, so x = 15. Check: ⅔(12) = 8 ✓' }
      ] },
    { name: 'Decimals and detectives', learn: ['To clear decimals like 0.3, multiply *every term* by 10.', 'Always *check*: put your answer back into the first equation.'],
      tasks: [
        { k: 'solve', q: 'Firewood costs 0.3 SAR per stick plus a 1.5 SAR bag. Marcus paid 4.2 SAR: *0.3x + 1.5 = 4.2*. How many sticks?', start: '0.3x + 1.5 = 4.2',
          moves: [
            { q: 'First move?', opts: ['Multiply every term by 10', 'Multiply only 0.3x by 10'], ans: 0, res: ['3x + 15 = 42', '3x + 1.5 = 42', '3x + 1.5 = 4.2'], rans: 0,
              hint: 'Every term: 0.3x, 1.5 and 4.2.', no: { 1: 'Every term must be multiplied.', r1: '1.5 × 10 = 15.', r2: 'Multiply 1.5 and 4.2 by 10 too.' } },
            { q: 'Next move?', opts: ['Subtract 15 from both sides', 'Divide both sides by 3'], ans: 0, res: ['3x = 27', '3x = 57'], rans: 0,
              hint: 'Undo + 15.', no: { 1: 'Undo the + 15 first.', r1: '42 − 15 = 27.' } },
            { q: 'Last move?', opts: ['Subtract 3 from both sides', 'Divide both sides by 3'], ans: 1, res: ['x = 24', 'x = 9'], rans: 1,
              hint: 'Divide to undo times 3.', why: '9 sticks. Check: 0.3(9) + 1.5 = 2.7 + 1.5 = 4.2 ✓' }
          ] },
        { k: 'choice', q: 'Zero solved *2(x + 6) = 20* like this: 2x + 6 = 20, then 2x = 14, then x = 7. Where is the mistake?', opts: ['Line 2: 20 − 6 is not 14', 'Line 1: 2 × 6 is 12, not 6', 'Line 3: 14 ÷ 2 is not 7'], ans: 1,
          no: ['20 − 6 = 14 is right. Look earlier.', null, '14 ÷ 2 = 7 is right. Look earlier.'], why: 'The 2 multiplies both terms: 2x + 12 = 20.' },
        { k: 'number', q: 'Fix Zero\'s work. Solve *2(x + 6) = 20*. x = ?', ans: 4, hint: '2x + 12 = 20. Subtract 12, then divide by 2.', why: '2x = 8, so x = 4. Check: 2(10) = 20 ✓' },
        { k: 'choice', q: 'Check: is *x = 5* a solution of *3(x − 1) = 2x + 2*?', opts: ['Yes: both sides are 12', 'No: 3(5) − 1 = 14', 'No: the sides are 12 and 10'], ans: 0,
          no: [null, 'Do the bracket first: 5 − 1 = 4, then 3 × 4.', '2(5) + 2 = 12, not 10.'], why: '3(4) = 12 and 10 + 2 = 12 ✓' }
      ] },
    { name: 'The campfire boss', boss: true, learn: ['Brackets, fractions and decimals all at once. Plan your first move, then go step by step.'],
      tasks: [
        { k: 'solve', q: 'Solve *0.5(4x − 6) + x = 12*.', start: '0.5(4x − 6) + x = 12',
          moves: [
            { q: 'First move?', opts: ['Distribute the 0.5', 'Add 6 to both sides'], ans: 0, res: ['2x − 6 + x = 12', '2x − 3 + x = 12'], rans: 1, hint: 'Half of 4x and half of −6.' },
            { q: 'Next move?', opts: ['Collect like terms', 'Divide by 2'], ans: 0, res: ['3x − 3 = 12', '2x − 2 = 12'], rans: 0, hint: '2x + x = 3x.' },
            { q: 'Next move?', opts: ['Add 3 to both sides', 'Subtract 3 from both sides'], ans: 0, res: ['3x = 9', '3x = 15'], rans: 1 },
            { q: 'Last move?', opts: ['Divide both sides by 3', 'Subtract 3 from both sides'], ans: 0, res: ['x = 5', 'x = 12'], rans: 0, why: 'Check: 0.5(14) + 5 = 7 + 5 = 12 ✓' }
          ] },
        { k: 'solve', q: 'Solve *(x + 5)/3 = x − 1*.', start: '(x + 5)/3 = x − 1',
          moves: [
            { q: 'First move?', opts: ['Multiply both sides by 3', 'Subtract 5 from both sides'], ans: 0, res: ['x + 5 = 3x − 1', 'x + 5 = 3x − 3'], rans: 1,
              hint: 'Times 3 on the right means 3 times all of (x − 1).', no: { r0: 'Multiply the −1 by 3 as well.' } },
            { q: 'Next move?', opts: ['Subtract x from both sides', 'Subtract 3x from the left only'], ans: 0, res: ['5 = 2x − 3', '5 = 4x − 3'], rans: 0 },
            { q: 'Next move?', opts: ['Subtract 3 from both sides', 'Add 3 to both sides'], ans: 1, res: ['8 = 2x', '2 = 2x'], rans: 0 },
            { q: 'Last move?', opts: ['Divide both sides by 2', 'Subtract 2 from both sides'], ans: 0, res: ['x = 6', 'x = 4'], rans: 1, why: 'Check: (4 + 5)/3 = 3 and 4 − 1 = 3 ✓' }
          ] },
        { k: 'number', q: 'Solve *3(2x − 1) − 4x = 9*. x = ?', ans: 6, hint: 'Distribute: 6x − 3 − 4x = 9. Collect: 2x − 3 = 9.', why: '2x = 12, so x = 6. Check: 3(11) − 24 = 9 ✓' },
        { k: 'choice', q: 'Best first move to clear the fractions in *x/2 + x/3 = 5*?', opts: ['Multiply every term by 5', 'Multiply every term by 6', 'Multiply only x/2 by 2'], ans: 1,
          no: ['5 does not clear halves or thirds.', null, 'Every term must be multiplied, and the thirds stay.'], why: '6 is a multiple of 2 and 3: 3x + 2x = 30, so x = 6.' }
      ] }
  ]
});
