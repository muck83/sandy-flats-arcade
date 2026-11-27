/* Homework: Unit 4 Lesson 7, Substitution, Part 1. */
SFA_HW({
  id: 'g67', unit: 4, lesson: 7, topic: 'Substitution, part 1', title: 'The Swap Booth', who: 'marcus',
  intro: ['Marcus works the prize-card booth on festival night. Every question at the booth comes as two equations, and one of them already says what a letter equals.',
    'His trick: *swap* that letter for what it equals, in brackets. Then there is only one letter left to solve. Swap, solve, swap back, and check.'],
  goal: 'Solve a system by substitution when one equation is already solved for a variable.',
  bigIdea: 'Replace the variable with the expression it equals, solve the one-variable equation, back-substitute, then check in both equations.',
  levels: [
    { name: 'Make the swap', learn: ['*Substitute* = replace a letter with what it is equal to.', 'Put the expression in *brackets* so nothing gets lost.'],
      tasks: [
        { k: 'choice', q: 'System: *y = x + 4* and *2x + y = 13*. Replace y in the second equation. What do you get?', opts: ['2(x + 4) + y = 13', '2x + (x + 4) = 13', 'x + 4 + y = 13'], ans: 1,
          no: ['Replace y, not x. The 2x stays.', null, 'The y is gone after you replace it. Replace y with (x + 4).'], why: 'y is swapped for (x + 4). Now there is only x.' },
        { k: 'choice', q: 'System: *x = 2y* and *x + 3y = 15*. Replace x. What do you get?', opts: ['2y + 3y = 15', 'x + 3(2y) = 15', '2x + 3y = 15'], ans: 0,
          no: [null, 'Replace x, not y.', 'x becomes 2y, not 2x.'], why: 'x is swapped for 2y: 2y + 3y = 15, so 5y = 15.' },
        { k: 'solve', q: 'Solve *y = x + 4* and *2x + y = 13*. Find x first.', start: 'y = x + 4 and 2x + y = 13',
          moves: [
            { q: 'First move?', opts: ['Replace y with (x + 4) in equation 2', 'Replace x with (y + 4)'], ans: 0, res: ['2x + (x + 4) = 13', 'x + 4 = 13'], rans: 0,
              hint: 'Equation 1 tells you what y is. Use it in equation 2.', no: { 1: 'Equation 1 says y = x + 4. Swap the y.', r1: 'Keep the 2x. Only the y is replaced.' } },
            { q: 'Next move?', opts: ['Combine like terms', 'Subtract 4 from the left only'], ans: 0, res: ['2x + 4 = 13', '3x + 4 = 13'], rans: 1,
              hint: '2x + x = 3x.', no: { 1: 'Both sides, always.', r0: '2x + x is 3x.' } },
            { q: 'Next move?', opts: ['Add 4 to both sides', 'Subtract 4 from both sides'], ans: 1, res: ['3x = 9', '3x = 17'], rans: 0,
              hint: 'Undo + 4.', no: { 0: 'Adding does not undo + 4.', r1: '13 − 4 = 9.' } },
            { q: 'Last move?', opts: ['Divide both sides by 3', 'Subtract 3 from both sides'], ans: 0, res: ['x = 6', 'x = 3'], rans: 1,
              hint: '3x means 3 times x.', no: { 1: 'Divide to undo times.' }, why: 'x = 3. Now go back for y.' }
          ] },
        { k: 'number', q: 'You found *x = 3*. Use *y = x + 4* to find y. (This is called back-substituting.)', ans: 7, hint: 'Put 3 in for x.', why: 'y = 3 + 4 = 7. The solution is (3, 7).' }
      ] },
    { name: 'The full swap', learn: ['*Replace*, *solve*, *back-substitute*, *check*.', 'Write the answer as a pair (x, y).'],
      tasks: [
        { k: 'solve', q: 'Solve *y = 3x − 2* and *x + y = 10*.', start: 'y = 3x − 2 and x + y = 10',
          moves: [
            { q: 'First move?', opts: ['Replace y with (3x − 2)', 'Replace x with (3x − 2)'], ans: 0, res: ['x + (3x − 2) = 10', '3x − 2 = 10'], rans: 0,
              hint: 'Equation 1 says what y equals.', no: { 1: '3x − 2 is what y equals, not x.', r1: 'Keep the x. Only y is replaced.' } },
            { q: 'Next move?', opts: ['Combine like terms', 'Add 2 to the left only'], ans: 0, res: ['3x − 2 = 10', '4x − 2 = 10'], rans: 1,
              hint: 'x + 3x = 4x.', no: { 1: 'Both sides, always.', r0: 'x + 3x is 4x.' } },
            { q: 'Next move?', opts: ['Add 2 to both sides', 'Subtract 2 from both sides'], ans: 0, res: ['4x = 12', '4x = 8'], rans: 0,
              hint: 'Undo − 2 by adding 2.', no: { 1: 'Undo − 2 with + 2.', r1: '10 + 2 = 12.' } },
            { q: 'Next move?', opts: ['Divide both sides by 4', 'Subtract 4 from both sides'], ans: 0, res: ['x = 3', 'x = 8'], rans: 0,
              hint: 'Divide to undo times 4.' },
            { q: 'Back-substitute.', opts: ['Put x = 3 into y = 3x − 2', 'Say y = 3 too'], ans: 0, res: ['y = 9 − 2 = 7', 'y = 3 − 2 = 1'], rans: 0,
              hint: 'Use the equation that says what y is.', no: { 1: 'x and y are usually different. Work y out.', r1: '3x means 3 times 3 = 9.' }, why: '(3, 7). Check: 3 + 7 = 10 ✓ and 7 = 9 − 2 ✓' }
          ] },
        { k: 'solve', q: 'Solve *x = 2y* and *x + 3y = 15*.', start: 'x = 2y and x + 3y = 15',
          moves: [
            { q: 'First move?', opts: ['Replace y with 2y', 'Replace x with 2y'], ans: 1, res: ['2y + 3y = 15', '2y + 3(2y) = 15'], rans: 0,
              hint: 'Equation 1 says x = 2y.', no: { 0: 'It is x that equals 2y.', r1: 'Only x is replaced. The 3y stays as 3y.' } },
            { q: 'Next move?', opts: ['Combine like terms', 'Divide by 2'], ans: 0, res: ['5y = 15', '6y = 15'], rans: 0,
              hint: '2y + 3y = 5y.', no: { 1: 'Combine the y terms first.', r1: '2y + 3y = 5y. Add, do not multiply.' } },
            { q: 'Next move?', opts: ['Divide both sides by 5', 'Subtract 5 from both sides'], ans: 0, res: ['y = 3', 'y = 10'], rans: 0,
              hint: 'Divide to undo times 5.' },
            { q: 'Back-substitute.', opts: ['Put y = 3 into x = 2y', 'Put y = 3 into x = y'], ans: 0, res: ['x = 5', 'x = 6'], rans: 1,
              hint: 'x = 2 times y.', no: { 1: 'The rule is x = 2y.', r0: '2 × 3 = 6.' }, why: '(6, 3). Check: 6 = 2(3) ✓ and 6 + 9 = 15 ✓' }
          ] },
        { k: 'pair', q: 'Solve *y = x − 1* and *x + y = 9*. Type the pair (x, y).', ans: [5, 4], hint: 'x + (x − 1) = 9, so 2x − 1 = 9.', why: '2x = 10, x = 5, y = 5 − 1 = 4. Check: 5 + 4 = 9 ✓' }
      ] },
    { name: 'Brackets matter', learn: ['When a number is in front, the brackets mean *multiply every term*: 3(x + 3) = 3x + 9.', 'A minus in front of brackets changes every sign inside: −(−2x + 1) = 2x − 1.'],
      tasks: [
        { k: 'solve', q: 'Solve *y = x + 3* and *2x + 3y = 19*.', start: 'y = x + 3 and 2x + 3y = 19',
          moves: [
            { q: 'First move?', opts: ['Replace y with (x + 3)', 'Replace 3y with x + 3'], ans: 0, res: ['2x + 3(x + 3) = 19', '2x + 3x + 3 = 19'], rans: 0,
              hint: 'The whole y is swapped, and the 3 stays in front.', no: { 1: 'y = x + 3, so 3y = 3(x + 3).', r1: 'Keep the brackets: 3(x + 3).' } },
            { q: 'Next move?', opts: ['Distribute the 3', 'Subtract 3 from both sides'], ans: 0, res: ['2x + 3x + 3 = 19', '2x + 3x + 9 = 19'], rans: 1,
              hint: '3 times x and 3 times 3.', no: { 1: 'Open the bracket first.', r0: 'Multiply the 3 inside by 3 too.' } },
            { q: 'Next move?', opts: ['Combine like terms', 'Divide by 2'], ans: 0, res: ['5x + 9 = 19', '6x + 9 = 19'], rans: 0,
              hint: '2x + 3x = 5x.' },
            { q: 'Next move?', opts: ['Subtract 9, then divide by 5', 'Divide by 5, then subtract 9'], ans: 0, res: ['x = 2', 'x = 5.6'], rans: 0,
              hint: 'Undo + 9 first.' },
            { q: 'Back-substitute.', opts: ['Put x = 2 into y = x + 3', 'Put x = 2 into 3y = 19'], ans: 0, res: ['y = 5', 'y = 6'], rans: 0,
              hint: 'Use the equation that is solved for y.', why: '(2, 5). Check: 4 + 15 = 19 ✓' }
          ] },
        { k: 'choice', q: 'Gus wrote *4x + 2(x − 1) = 16* as *4x + 2x − 1 = 16*. What went wrong?', opts: ['Nothing, it is right', '2 times −1 is −2: 4x + 2x − 2', 'It should be 4x + 2x + 2'], ans: 1,
          no: ['The 2 must multiply the −1 too.', null, '2 times −1 is negative.'], why: 'Multiply every term in the bracket: 2(x − 1) = 2x − 2.' },
        { k: 'solve', q: 'Solve *y = −2x + 1* and *3x − y = 14*. Watch the minus in front of the bracket.', start: 'y = −2x + 1 and 3x − y = 14',
          moves: [
            { q: 'First move?', opts: ['Replace y with (−2x + 1)', 'Replace y with −2x and drop the 1'], ans: 0, res: ['3x − (−2x + 1) = 14', '3x − 2x + 1 = 14'], rans: 0,
              hint: 'Swap the whole expression, in brackets.', no: { 1: 'Swap all of it: (−2x + 1).', r1: 'Keep the brackets. The minus sign is in front of all of it.' } },
            { q: 'Next move?', opts: ['Open the brackets and combine', 'Add 1 to both sides'], ans: 0, res: ['3x − 2x + 1 = 14', '5x − 1 = 14', 'x − 1 = 14'], rans: 1,
              hint: '− (−2x) = +2x and − (+1) = −1.', no: { 1: 'Open the brackets first.', r0: 'The minus changes every sign inside: +2x and −1.', r2: '3x + 2x = 5x.' } },
            { q: 'Next move?', opts: ['Add 1 to both sides', 'Subtract 1 from both sides'], ans: 0, res: ['5x = 15', '5x = 13'], rans: 0,
              hint: 'Undo − 1.', no: { 1: 'Undo − 1 with + 1.' } },
            { q: 'Next move?', opts: ['Divide both sides by 5', 'Subtract 5'], ans: 0, res: ['x = 3', 'x = 10'], rans: 0, hint: 'Divide to undo times 5.' },
            { q: 'Back-substitute.', opts: ['Put x = 3 into y = −2x + 1', 'Put x = 3 into y = 2x + 1'], ans: 0, res: ['y = 7', 'y = −5'], rans: 1,
              hint: 'Keep the minus: −2 times 3.', no: { 1: 'The rule is y = −2x + 1.', r0: '−2(3) = −6, and −6 + 1 = −5.' }, why: '(3, −5). Check: 3(3) − (−5) = 9 + 5 = 14 ✓' }
          ] }
      ] },
    { name: 'Card count', learn: ['Gold cards cost *20 SAR*. Silver cards cost *10 SAR*. Marcus took *600 SAR*.', 'He sold *three times as many* silver as gold: *s = 3g*.'],
      tasks: [
        { k: 'choice', q: 'Which system matches the story? (g = gold cards, s = silver cards)', opts: ['20g + 10s = 600 and g = 3s', 'g + s = 600 and s = 3g', '20g + 10s = 600 and s = 3g'], ans: 2,
          no: ['There are more silver cards, so s = 3g, not g = 3s.', '600 is money, so use the prices.', null], why: 'Money: 20g + 10s = 600. Count: s = 3g.' },
        { k: 'solve', q: 'Solve *20g + 10s = 600* and *s = 3g*.', start: '20g + 10s = 600 and s = 3g',
          moves: [
            { q: 'First move?', opts: ['Replace s with 3g', 'Replace g with 3s'], ans: 0, res: ['20g + 10(3g) = 600', '20g + 10 + 3g = 600'], rans: 0,
              hint: 's = 3g tells you what s is.', no: { 1: 'It says s = 3g, not g = 3s.', r1: '10s means 10 times s: 10(3g).' } },
            { q: 'Next move?', opts: ['Multiply 10(3g)', 'Add 10 + 3'], ans: 0, res: ['20g + 13g = 600', '20g + 30g = 600'], rans: 1,
              hint: '10 times 3g is 30g.', no: { 1: '10(3g) means 10 times 3g.', r0: '10 × 3g = 30g, not 13g.' } },
            { q: 'Next move?', opts: ['Combine like terms', 'Subtract 20g from both sides'], ans: 0, res: ['50g = 600', '600g = 50'], rans: 0,
              hint: '20g + 30g = 50g.' },
            { q: 'Next move?', opts: ['Divide both sides by 50', 'Subtract 50 from both sides'], ans: 0, res: ['g = 12', 'g = 550'], rans: 0, hint: 'Divide to undo times 50.' },
            { q: 'Back-substitute.', opts: ['Put g = 12 into s = 3g', 'Put g = 12 into s = g + 3'], ans: 0, res: ['s = 15', 's = 36'], rans: 1,
              hint: 's = 3 times g.', no: { 1: 'The rule is s = 3g.', r0: '3 × 12 = 36.' }, why: '12 gold cards and 36 silver cards.' }
          ] },
        { k: 'choice', q: 'Which check shows that *(g, s) = (12, 36)* is right?', opts: ['12 + 36 = 48', '240 + 360 = 600 and 36 = 3(12)', '20 + 10 = 30'], ans: 1,
          no: ['That is just the total cards. Check the money and the clue.', null, 'Put the numbers into both equations.'], why: '20(12) + 10(36) = 600 ✓ and 3(12) = 36 ✓' },
        { k: 'choice', q: 'In level 1 you found *(3, 7)* for *y = x + 4* and *2x + y = 13*. Does the graph agree?', fig: { range: [-1, 8], yrange: [-1, 14], ystep: 2, lines: [{ m: 1, b: 4, lab: 'y = x + 4', labAt: 5 }, { m: -2, b: 13, lab: '2x + y = 13', labAt: 4.6 }], x: 'x', y: 'y' },
          opts: ['Yes: the lines cross at (3, 7)', 'No: they cross at (7, 3)', 'No: they do not cross'], ans: 0,
          no: [null, 'Read across first (x), then up (y).', 'Look again: they cross once.'], why: 'Algebra and the graph give the same answer.' }
      ] },
    { name: 'The festival boss', boss: true, learn: ['Swap, solve, back-substitute, check. Fewer hints now.'],
      tasks: [
        { k: 'solve', q: 'Solve *y = 4x − 3* and *2x + y = 15*.', start: 'y = 4x − 3 and 2x + y = 15',
          moves: [
            { q: 'First move?', opts: ['Replace x with (4x − 3)', 'Replace y with (4x − 3)'], ans: 1, res: ['2x + (4x − 3) = 15', '2x + 4x = 15'], rans: 0 },
            { q: 'Next move?', opts: ['Combine like terms', 'Add 3 to the left only'], ans: 0, res: ['6x − 3 = 15', '8x − 3 = 15'], rans: 0 },
            { q: 'Next move?', opts: ['Add 3, then divide by 6', 'Subtract 3, then divide by 6'], ans: 0, res: ['x = 2', 'x = 3'], rans: 1, hint: '6x = 18.' },
            { q: 'Back-substitute.', opts: ['Put x = 3 into y = 4x − 3', 'Put x = 3 into 2x + y = 3'], ans: 0, res: ['y = 9', 'y = 12'], rans: 0, why: '(3, 9). Check: 6 + 9 = 15 ✓' }
          ] },
        { k: 'solve', q: 'Solve *x = y − 2* and *3x + 2y = 19*.', start: 'x = y − 2 and 3x + 2y = 19',
          moves: [
            { q: 'First move?', opts: ['Replace x with (y − 2)', 'Replace y with (x − 2)'], ans: 0, res: ['3(y − 2) + 2y = 19', '3y − 2 + 2y = 19'], rans: 0 },
            { q: 'Next move?', opts: ['Distribute and combine', 'Divide by 3'], ans: 0, res: ['5y − 2 = 19', '5y − 6 = 19'], rans: 1, hint: '3 times −2 is −6.' },
            { q: 'Next move?', opts: ['Add 6, then divide by 5', 'Subtract 6, then divide by 5'], ans: 0, res: ['y = 5', 'y = 2.6'], rans: 0 },
            { q: 'Back-substitute.', opts: ['Put y = 5 into x = y − 2', 'Say x = 5 too'], ans: 0, res: ['x = 3', 'x = 7'], rans: 0, why: '(3, 5). Check: 9 + 10 = 19 ✓' }
          ] },
        { k: 'pair', q: 'Solve *y = 2x* and *5x − y = 12*. Type the pair.', ans: [4, 8], hint: '5x − 2x = 12.', why: '3x = 12, x = 4, y = 8. Check: 20 − 8 = 12 ✓' },
        { k: 'number', q: 'A shake costs 4 SAR more than a juice: *s = j + 4*. Two shakes and one juice cost 26 SAR: *2s + j = 26*. What does a juice cost?', ans: 6, unit: 'SAR', hint: '2(j + 4) + j = 26.', why: '2j + 8 + j = 26, so 3j = 18 and j = 6. A shake is 10 SAR.' }
      ] }
  ]
});
