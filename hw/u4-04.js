/* Homework: Unit 4 Lesson 4, What Is a Solution to a System? */
SFA_HW({
  id: 'g64', unit: 4, lesson: 4, topic: 'What is a solution to a system?', title: 'Buggy Price Check', who: 'gus',
  intro: ['Two beach-buggy shops opened on the Sandy Flats sand track. *Dune Rides* charges 12 SAR to start plus 2 SAR a lap. *Wave Wheels* charges 4 SAR to start plus 4 SAR a lap.',
    'Gus wants to know: is there a number of laps where both shops cost the same? Test points in both rules to find out.'],
  goal: 'Check if a point is a solution of a system by testing it in both equations.',
  bigIdea: 'A solution of a system makes both equations true at the same time. On a graph, it is where the lines cross.',
  levels: [
    { name: 'Two checks', learn: ['A *system* is two equations together. A solution makes *both* true.', 'Put x and y into equation 1, then into equation 2. Only ✓ ✓ is a solution.'],
      tasks: [
        { k: 'solve', q: 'Is *(2, 5)* a solution of the system *y = 3x − 1* and *x + y = 7*?', start: 'Test (2, 5)',
          moves: [
            { q: 'Test equation 1: y = 3x − 1.', opts: ['Put x = 5 and y = 2', 'Put x = 2 and y = 5'], ans: 1, res: ['5 = 3(2) − 1 = 5 ✓', '5 = 3(2 − 1) = 3 ✗'], rans: 0,
              hint: 'x comes first in the pair: x = 2, y = 5.', no: { 0: 'You swapped them. In (2, 5), x is 2.', r1: 'Multiply first: 3 × 2 = 6, then take 1.' } },
            { q: 'Next move?', opts: ['Stop: one ✓ is enough', 'Test equation 2: x + y = 7'], ans: 1, res: ['2 + 5 = 7 ✓', '2 × 5 = 10 ✗'], rans: 0,
              hint: 'A system needs both equations true.', no: { 0: 'One ✓ is not enough. Test equation 2 too.', r1: 'x + y means add.' } },
            { q: 'Decide.', opts: ['Both true: yes', 'Only one true: no'], ans: 0, res: ['(2, 5) solves the system', '(2, 5) is not a solution'], rans: 0,
              hint: 'You got ✓ and ✓.', why: '✓ ✓: (2, 5) is on both lines.' }
          ] },
        { k: 'choice', q: 'System: *x + y = 12* and *x − y = 2*. Is *(7, 5)* a solution?', opts: ['Yes: 12 ✓ and 2 ✓', 'No: only one is true', 'No: both are false'], ans: 0,
          no: [null, 'Test both: 7 + 5 = 12 and 7 − 5 = 2.', 'Test both: 7 + 5 = 12 and 7 − 5 = 2.'], why: '7 + 5 = 12 ✓ and 7 − 5 = 2 ✓' },
        { k: 'choice', q: 'Same system: *x + y = 12* and *x − y = 2*. Is *(8, 4)* a solution?', opts: ['Yes: 8 + 4 = 12', 'No: 8 − 4 = 4, not 2'], ans: 1,
          no: ['That is only one equation. Test x − y = 2 too.', null], why: '✓ ✗: one false check means it is not a solution.' },
        { k: 'choice', q: 'Zero says *(0, 5)* solves *y = 2x − 3* and *y = x + 5*, because 5 = 0 + 5. Is he right?', opts: ['Yes: 5 = 0 + 5', 'No: 2(0) − 3 = −3, not 5'], ans: 1,
          no: ['That only checks one equation.', null], why: 'It passes the second equation but fails the first. Not a solution.' }
      ] },
    { name: 'Two buggy shops', learn: ['x = laps, y = cost in SAR.', '*Dune: y = 2x + 12*. *Wave: y = 4x + 4*.'],
      tasks: [
        { k: 'fill', q: 'Fill in the prices for each shop.', head: ['Laps x', 'Dune (SAR)', 'Wave (SAR)'], rows: [[0, { a: 12 }, { a: 4 }], [2, { a: 16 }, { a: 12 }], [4, { a: 20 }, { a: 20 }], [6, { a: 24 }, { a: 28 }]],
          hint: 'Dune: 2 times laps, plus 12. Wave: 4 times laps, plus 4.', why: 'At 4 laps both shops cost 20 SAR.' },
        { k: 'solve', q: 'Test the point *(4, 20)* in both rules.', start: 'Test (4, 20)',
          moves: [
            { q: 'Test Dune: y = 2x + 12.', opts: ['Work out 2(4) + 12', 'Work out 2(20) + 12'], ans: 0, res: ['2(4 + 12) = 32 ✗', '2(4) + 12 = 20 ✓'], rans: 1,
              hint: 'x is the laps, 4. Put 4 in for x.', no: { 1: '20 is y, the cost. Put x = 4 into the rule.', r0: 'Multiply first: 2 × 4 = 8, then add 12.' } },
            { q: 'Test Wave: y = 4x + 4.', opts: ['Work out 4(4) + 4', 'Work out 4(20) + 4'], ans: 0, res: ['4(4) + 4 = 20 ✓', '4 + 4 + 4 = 12 ✗'], rans: 0,
              hint: 'Put x = 4 in again.', no: { 1: 'x = 4, not 20.', r1: '4x means 4 times x.' } },
            { q: 'What does (4, 20) mean?', opts: ['Both rules are true', 'Only Dune is true'], ans: 0, res: ['4 laps cost 20 SAR at both shops', '4 laps are free'], rans: 0,
              hint: 'You got ✓ ✓.', why: 'At 4 laps, the two shops cost the same: 20 SAR.' }
          ] },
        { k: 'choice', q: 'Is *(2, 16)* a solution of the system?', opts: ['Yes: it works for Dune', 'No: it fails Wave', 'No: it fails both'], ans: 1,
          no: ['Test Wave too: 4(2) + 4 = 12, not 16.', null, 'Dune works: 2(2) + 12 = 16 ✓.'], why: 'Dune ✓, Wave ✗ (12, not 16). Not a solution.' },
        { k: 'choice', q: 'In the story, what does the solution of the system tell Gus?', opts: ['The laps where both cost the same', 'The cheapest shop', 'The start price of each shop'], ans: 0,
          no: [null, 'The solution is one point that fits both rules.', 'Start prices are the 12 and 4 in the rules.'], why: 'The solution fits both rules: same laps, same cost.' }
      ] },
    { name: 'See it on a graph', learn: ['Each line shows *all* the solutions of one equation.', 'A point on *both* lines solves the system. That is where they *cross*.'],
      tasks: [
        { k: 'pair', q: 'The two shops on a graph. Type the point where the lines cross.', fig: { range: [-1, 8], yrange: [-1, 32], ystep: 4, lines: [{ m: 2, b: 12, lab: 'Dune', labAt: 0.5 }, { m: 4, b: 4, lab: 'Wave', labAt: 5.5 }], x: 'laps', y: 'SAR' },
          ans: [4, 20], hint: 'Find where the two lines meet. Read across, then up.', why: '(4, 20): the same answer as your table.' },
        { k: 'choice', q: 'The lines are *y = x + 1* and *y = −x + 5*. Which point solves the system?', fig: { range: [-1, 6], lines: [{ m: 1, b: 1 }, { m: -1, b: 5 }], pts: [[2, 3, 'A'], [4, 5, 'B'], [1, 4, 'C']], x: 'x', y: 'y' },
          opts: ['A (2, 3)', 'B (4, 5)', 'C (1, 4)'], ans: 0,
          no: [null, 'B is on y = x + 1 only. Test y = −x + 5: −4 + 5 = 1, not 5.', 'C is on y = −x + 5 only. Test y = x + 1: 1 + 1 = 2, not 4.'], why: 'A is on both lines: 3 = 2 + 1 ✓ and 3 = −2 + 5 ✓' },
        { k: 'sort', q: 'System: *y = x + 1* and *y = −x + 5*. Sort each point.', bins: ['On both (solution)', 'On one line only', 'On neither'],
          cards: [{ t: '(2, 3)', b: 0 }, { t: '(0, 1)', b: 1, why: 'y = x + 1 ✓, but −0 + 5 = 5, not 1.' }, { t: '(4, 1)', b: 1, why: '−4 + 5 = 1 ✓, but 4 + 1 = 5, not 1.' },
            { t: '(3, 4)', b: 1, why: '3 + 1 = 4 ✓, but −3 + 5 = 2, not 4.' }, { t: '(0, 0)', b: 2 }, { t: '(1, 1)', b: 2, why: '1 + 1 = 2 ✗ and −1 + 5 = 4 ✗' }],
          why: 'Test each point in both equations. Only (2, 3) gets ✓ ✓.' }
      ] },
    { name: 'Test with negatives', learn: ['Use brackets when you put in a negative: 2(−1).', 'One ✗ is enough to say "not a solution".'],
      tasks: [
        { k: 'solve', q: 'Is *(2, 4)* a solution of *2x + y = 8* and *x − y = 1*?', start: 'Test (2, 4)',
          moves: [
            { q: 'Test equation 1: 2x + y = 8.', opts: ['Put x = 2, y = 4', 'Put x = 4, y = 2'], ans: 0, res: ['2(2) + 4 = 8 ✓', '2(4) + 2 = 10 ✗'], rans: 0,
              hint: 'x first: x = 2.', no: { 1: 'You swapped them.' } },
            { q: 'Test equation 2: x − y = 1.', opts: ['Work out 4 − 2', 'Work out 2 − 4'], ans: 1, res: ['2 − 4 = 2 ✗', '2 − 4 = −2, not 1 ✗', '2 − 4 = 1 ✓'], rans: 1,
              hint: 'x − y is 2 − 4. That is negative.', no: { 0: 'x − y means x first: 2 − 4.', r0: '2 − 4 is negative: −2.', r2: '2 − 4 = −2, not 1.' } },
            { q: 'Decide.', opts: ['✓ ✗: not a solution', '✓ ✗: a solution'], ans: 0, res: ['(2, 4) is not a solution', '(2, 4) solves it'], rans: 0,
              hint: 'It must pass both.', why: 'It fails equation 2. (The real solution is (3, 2): 6 + 2 = 8 and 3 − 2 = 1.)' }
          ] },
        { k: 'solve', q: 'Is *(−1, 4)* a solution of *y = x + 5* and *2x + y = 2*?', start: 'Test (−1, 4)',
          moves: [
            { q: 'Test equation 1: y = x + 5.', opts: ['Work out −1 + 5', 'Work out 1 + 5'], ans: 0, res: ['4 = 4 ✓', '4 = 6 ✗'], rans: 0,
              hint: 'x is −1, with the minus sign.', no: { 1: 'x = −1. Keep the minus sign.' } },
            { q: 'Test equation 2: 2x + y = 2.', opts: ['Work out 2(−1) + 4', 'Work out 2 − 1 + 4'], ans: 0, res: ['−2 + 4 = 2 ✓', '2 + 4 = 6 ✗'], rans: 0,
              hint: '2x means 2 times x, and x = −1.', no: { 1: '2x means 2 times x: 2(−1).', r1: '2(−1) = −2, not 2.' } },
            { q: 'Decide.', opts: ['✓ ✓: a solution', 'Negatives never work'], ans: 0, res: ['(−1, 4) solves the system', 'Not a solution'], rans: 0,
              hint: 'Both checks passed.', why: 'Both true. Negative numbers can be solutions too.' }
          ] },
        { k: 'pair', q: 'Find the point that solves *x + y = 9* and *y = 2x*. Use the table.', tab: { head: ['x', '1', '2', '3', '4'], rows: [['y = 2x', 2, 4, 6, 8], ['x + y', 3, 6, 9, 12]] },
          ans: [3, 6], hint: 'Find the column where x + y is 9.', why: '(3, 6): 6 = 2(3) ✓ and 3 + 6 = 9 ✓' },
        { k: 'choice', q: 'Which point is on *x + y = 12* but is *not* a solution of the system *x + y = 12* and *x − y = 2*?', opts: ['(7, 5)', '(10, 2)', '(8, 3)'], ans: 1,
          no: ['(7, 5) is the solution: it passes both.', null, '8 + 3 = 11. It is not on x + y = 12.'], why: '10 + 2 = 12 ✓, but 10 − 2 = 8 ✗.' }
      ] },
    { name: 'The rush hour boss', boss: true, learn: ['Mixed questions. Test every point in both equations.'],
      tasks: [
        { k: 'solve', q: 'Is *(2, 5)* a solution of *y = −2x + 9* and *3x − y = 1*?', start: 'Test (2, 5)',
          moves: [
            { q: 'Test equation 1.', opts: ['Work out −2(2) + 9', 'Work out −2(5) + 9'], ans: 0, res: ['4 + 9 = 13 ✗', '−4 + 9 = 5 ✓'], rans: 1, hint: 'Put in x = 2. Watch the sign.' },
            { q: 'Test equation 2.', opts: ['Work out 3(2) − 5', 'Work out 3(5) − 2'], ans: 0, res: ['6 − 5 = 1 ✓', '6 + 5 = 11 ✗'], rans: 0 },
            { q: 'Decide.', opts: ['Not a solution', 'A solution'], ans: 1, res: ['(2, 5) solves the system', '(2, 5) fails'], rans: 0, why: '✓ ✓: (2, 5) is where the two lines cross.' }
          ] },
        { k: 'pair', q: 'Tank A has *y = 50 − 3x* litres after x minutes. Tank B has *y = 10 + 2x*. Which point works for both? Use the table.', tab: { head: ['x', '6', '7', '8', '9'], rows: [['Tank A', 32, 29, 26, 23], ['Tank B', 22, 24, 26, 28]] },
          ans: [8, 26], hint: 'Find the column where the two tanks match.', why: 'At 8 minutes both tanks hold 26 litres.' },
        { k: 'choice', q: 'A system has the solution *(4, 20)*. What must be true?', opts: ['Only one line goes through (4, 20)', 'Both lines go through (4, 20)', 'The lines never meet'], ans: 1,
          no: ['A solution is on both lines.', null, 'They meet at (4, 20).'], why: 'The solution is the point both lines share.' },
        { k: 'match', q: 'System: *x + y = 6* and *y = x + 2*. Match each point to its checks.', pairs: [['(2, 4)', '✓ ✓ solution'], ['(3, 3)', '✓ ✗ first only'], ['(0, 2)', '✗ ✓ second only'], ['(1, 1)', '✗ ✗ neither']] }
      ] }
  ]
});
