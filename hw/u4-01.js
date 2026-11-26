/* Homework: Unit 4 Lesson 1, One Equation Isn't Enough. */
SFA_HW({
  id: 'g61', unit: 4, lesson: 1, topic: 'One equation isn\'t enough', title: 'The Lost Receipt', who: 'priya',
  intro: ['Priya runs the snack stand at the Sandy Flats arcade. Popcorn costs *6 SAR*. Juice costs *3 SAR*. Last night she took *60 SAR*, then the wind blew the receipt into the sea.',
    'How much popcorn and how much juice did she sell? One clue is not enough. Help her test pairs, find the line of possibilities, and use a second clue to crack it.'],
  goal: 'Test if a pair (x, y) is a solution, and see why we need two equations.',
  bigIdea: 'One equation in two variables has many solutions (a line). A second equation can narrow it to one pair.',
  levels: [
    { name: 'Test a pair', learn: ['A *solution* of an equation like 2x + 3y = 12 is a pair *(x, y)* that makes it true.', 'Put the numbers in: *x first, y second*. Then work out both sides.'],
      tasks: [
        { k: 'choice', q: 'In the pair *(3, 5)*, what is x and what is y?', opts: ['x = 5 and y = 3', 'x = 3 and y = 5', 'x = 8 and y = 0'], ans: 1,
          no: ['The x value always comes first in a pair.', null, 'Do not add them. The pair has two separate numbers.'], why: 'An ordered pair is (x, y): x first, y second.' },
        { k: 'solve', q: 'Is *(3, 2)* a solution of *2x + 3y = 12*? Test it one move at a time.', start: '2x + 3y = 12, test (3, 2)',
          moves: [
            { q: 'First move?', opts: ['Put 2 for x and 3 for y', 'Put 3 for x and 2 for y', 'Add 3 + 2'], ans: 1, res: ['2(3) + 3(2) = 12', '2(2) + 3(3) = 12', '3 + 2 = 12'], rans: 0,
              hint: 'x comes first in the pair, so x = 3 and y = 2.', no: { 0: 'You swapped them. In (3, 2), x is 3.', 2: 'Put each number in its own place in the equation.', r1: 'That puts 2 for x. In (3, 2), x is 3.' } },
            { q: 'Work out the left side.', opts: ['Multiply, then add', 'Add, then multiply'], ans: 0, res: ['5(5) = 12, so 25 = 12', '6 + 6 = 12, so 12 = 12'], rans: 1,
              hint: 'Multiply first: 2 × 3 and 3 × 2. Then add.', no: { 1: 'Multiply before you add.', r0: 'That adds first. Do 2 × 3 = 6 and 3 × 2 = 6.' } },
            { q: 'Decide.', opts: ['12 = 12 is true', '12 = 12 is false'], ans: 0, res: ['(3, 2) is a solution ✓', '(3, 2) is not a solution'], rans: 0,
              hint: 'Both sides are the same number.', why: 'Both sides match, so (3, 2) makes the equation true.' }
          ] },
        { k: 'choice', q: 'Is *(1, 4)* a solution of *2x + 3y = 12*?', opts: ['Yes: it has a 4 in it', 'No: 2 + 12 = 14, not 12', 'Yes: every pair works'], ans: 1,
          no: ['Test it: 2(1) + 3(4) = 2 + 12. Is that 12?', null, 'Not every pair. Test it: 2(1) + 3(4) = 14.'], why: '2(1) + 3(4) = 14, and 14 ≠ 12. So (1, 4) is not a solution.' },
        { k: 'number', q: 'Look at *x + y = 7*. If *x = 2*, what must y be?', ans: 5, hint: '2 + ? = 7', why: '(2, 5) is a solution, because 2 + 5 = 7.' }
      ] },
    { name: 'So many pairs', learn: ['One equation with two letters has *many* solutions.', 'Priya\'s clue: *6p + 3j = 60* (p = popcorn, j = juice). Money left for juice = 60 − 6p.'],
      tasks: [
        { k: 'solve', q: 'Priya sold *4* popcorns. How many juices? Solve *6(4) + 3j = 60*.', start: '6(4) + 3j = 60',
          moves: [
            { q: 'First move?', opts: ['Add 6 + 4', 'Multiply 6 × 4'], ans: 1, res: ['24 + 3j = 60', '10 + 3j = 60'], rans: 0,
              hint: '6(4) means 6 times 4.', no: { 0: '6(4) is multiplication, not adding.', r1: '6 + 4 = 10, but 6(4) means 6 × 4.' } },
            { q: 'Undo the + 24.', opts: ['Subtract 24 from both sides', 'Add 24 to both sides', 'Subtract 24 from the left only'], ans: 0, res: ['3j = 84', '3j = 60', '3j = 36'], rans: 2,
              hint: 'Do the same to both sides, so it stays balanced.', no: { 1: 'Adding 24 makes it 24 + 24. Undo + 24 by subtracting.', 2: 'Whatever you do to one side, do to the other side too.', r0: '60 + 24 = 84 is adding. You subtracted: 60 − 24.', r1: 'You must subtract 24 from 60 as well.' } },
            { q: 'Last move?', opts: ['Subtract 3 from both sides', 'Divide both sides by 3'], ans: 1, res: ['j = 12', 'j = 33'], rans: 0,
              hint: '3j means 3 times j. Undo times by dividing.', no: { 0: '3j is 3 times j. Divide to undo it.' }, why: '(4, 12): 4 popcorns and 12 juices cost 24 + 36 = 60 SAR.' }
          ] },
        { k: 'fill', q: 'Fill in more pairs that cost exactly 60 SAR. Juices = (60 − 6p) ÷ 3.', head: ['Popcorn p', 'Juice j'], rows: [[0, { a: 20 }], [2, { a: 16 }], [6, { a: 8 }], [10, { a: 0 }]],
          hint: 'Work out 6 × p, take it from 60, then divide by 3.', why: 'Each extra popcorn means 2 fewer juices (6 SAR = two 3 SAR juices).' },
        { k: 'choice', q: 'Here are Priya\'s pairs on a graph. What do you notice?', fig: { range: [-1, 12], yrange: [-1, 22], ystep: 2, pts: [[0, 20], [2, 16], [4, 12], [6, 8], [8, 4], [10, 0]], x: 'p', y: 'j' },
          opts: ['They are all over the place', 'They lie on one straight line', 'They make a circle'], ans: 1, why: 'All the solutions of one equation lie on one straight line.' },
        { k: 'choice', q: 'How many pairs (x, y) make *x + y = 7* true?', opts: ['Only one', 'Exactly 7', 'Infinitely many'], ans: 2,
          no: ['Try (2, 5), (3, 4), (0, 7)... there are more.', 'Decimals work too: (2.5, 4.5). Keep going.', null], why: 'Any pair that adds to 7 works, decimals and negatives too: infinitely many.' }
      ] },
    { name: 'The line of answers', learn: ['Every solution is a point. All the solutions together make a *line*.', 'To graph, find two pairs that work, plot them, and join them.'],
      tasks: [
        { k: 'plane', q: 'Graph *x + y = 7*: tap two points on it. (Same as y = −x + 7.)', range: [-2, 8], m: -1, b: 7, op: '=', parts: ['line'], hint: 'Try (0, 7) and (7, 0). Both add to 7.' },
        { k: 'solve', q: 'Find the missing number in the pair *(4, ?)* for *2x + y = 6*.', start: '2(4) + y = 6',
          moves: [
            { q: 'First move?', opts: ['Multiply 2 × 4', 'Add 2 + 4'], ans: 0, res: ['6 + y = 6', '8 + y = 6'], rans: 1,
              hint: '2(4) means 2 × 4.', no: { 1: '2(4) is multiplication.', r0: 'That is 2 + 4. Multiply: 2 × 4 = 8.' } },
            { q: 'Next move?', opts: ['Add 8 to both sides', 'Subtract 8 from both sides'], ans: 1, res: ['y = −2', 'y = 2', 'y = 14'], rans: 0,
              hint: 'Undo + 8 by subtracting 8 from both sides.', no: { 0: 'Adding 8 does not undo + 8.', r1: 'Careful with the sign: 6 − 8 is negative.', r2: 'That is 6 + 8. You subtracted.' }, why: 'The pair is (4, −2): 2(4) + (−2) = 8 − 2 = 6 ✓' }
          ] },
        { k: 'sort', q: 'Which pairs are solutions of *x + 2y = 8*?', bins: ['✓ Solution', '✗ Not a solution'],
          cards: [{ t: '(8, 0)', b: 0 }, { t: '(2, 3)', b: 0, why: '2 + 2(3) = 2 + 6 = 8 ✓' }, { t: '(4, 2)', b: 0 }, { t: '(0, 4)', b: 0 },
            { t: '(3, 3)', b: 1, why: '3 + 2(3) = 9, not 8.' }, { t: '(6, 2)', b: 1, why: '6 + 2(2) = 10, not 8.' }, { t: '(1, 4)', b: 1, why: '1 + 2(4) = 9. Remember y is doubled.' }],
          why: 'Put each pair in: x + 2 times y must make 8.' },
        { k: 'choice', q: 'The line shows every solution of *x + y = 7*. Is the point *(3, 1)* a solution?', fig: { range: [-1, 8], lines: [{ m: -1, b: 7, lab: 'x + y = 7' }], pts: [[3, 1, '(3, 1)']], x: 'x', y: 'y' },
          opts: ['Yes: it is near the line', 'No: it is not on the line', 'Yes: 3 and 1 are whole numbers'], ans: 1,
          no: ['Near is not enough. 3 + 1 = 4, not 7.', null, 'Test it: 3 + 1 = 4, not 7.'], why: '3 + 1 = 4 ≠ 7. Points off the line are not solutions.' }
      ] },
    { name: 'The second clue', learn: ['A *system* is two equations that must be true *at the same time*.', 'Test a pair in *both* equations. It must pass both.'],
      tasks: [
        { k: 'choice', q: 'Priya remembers: "I sold *12 things* in total." Which equation says that?', opts: ['6p + 3j = 12', 'p + j = 12', 'p = 12j'], ans: 1,
          no: ['6p + 3j is money. The new clue counts things.', null, 'That says popcorn is 12 times juice.'], why: 'Popcorns plus juices make 12: p + j = 12.' },
        { k: 'solve', q: 'Test *(8, 4)* in both clues: *6p + 3j = 60* and *p + j = 12*.', start: '(p, j) = (8, 4)',
          moves: [
            { q: 'Test clue 1: 6p + 3j = 60.', opts: ['Put 4 for p and 8 for j', 'Put 8 for p and 4 for j'], ans: 1, res: ['6(8) + 3(4) = 48 + 12 = 60 ✓', '6 + 8 + 3 + 4 = 21 ✗'], rans: 0,
              hint: 'p comes first in the pair, so p = 8 and j = 4.', no: { 0: 'You swapped them. p = 8.', r1: '6p means 6 times p. Multiply, do not add.' } },
            { q: 'Next move?', opts: ['Stop: one ✓ is enough', 'Test clue 2: p + j = 12'], ans: 1, res: ['8 × 4 = 32 ✗', '8 + 4 = 12 ✓'], rans: 1,
              hint: 'A system needs both clues to be true.', no: { 0: 'A pair must pass *both* clues. Test clue 2.', r0: 'Clue 2 adds: p + j.' } },
            { q: 'Decide.', opts: ['Both true: it is the answer', 'Only one is true'], ans: 0, res: ['8 popcorns and 4 juices ✓', 'Not a solution'], rans: 0,
              hint: 'You got ✓ and ✓.', why: 'Only (8, 4) passes both clues: 8 popcorns and 4 juices.' }
          ] },
        { k: 'choice', q: 'Is *(6, 8)* a solution of the system *6p + 3j = 60* and *p + j = 12*?', opts: ['Yes: it passes clue 1', 'No: it fails p + j = 12', 'No: it fails both'], ans: 1,
          no: ['It passes clue 1 (36 + 24 = 60), but test clue 2 too.', null, 'Test clue 1: 6(6) + 3(8) = 36 + 24 = 60 ✓.'], why: '6 + 8 = 14, not 12. One ✗ is enough to say no.' },
        { k: 'pair', q: 'Each line shows one clue. Type the point where they cross.', fig: { range: [-1, 13], yrange: [-1, 21], ystep: 2, lines: [{ m: -2, b: 20, lab: 'clue 1' }, { m: -1, b: 12, lab: 'clue 2', labAt: 1 }], x: 'p', y: 'j' },
          ans: [8, 4], hint: 'Find the one point on both lines. Read across, then up.', why: '(8, 4) is on both lines: it is the answer to both clues.' },
        { k: 'choice', q: 'Why could Priya not find the answer from the first clue alone?', opts: ['It has many solutions', 'It has no solutions', 'The numbers were too big'], ans: 0,
          no: [null, 'It has lots: (0, 20), (4, 12), (8, 4)...', 'Size is not the problem. Count the pairs that work.'], why: 'One equation gives a whole line of answers. A second clue picks one.' }
      ] },
    { name: 'The closing time boss', boss: true, learn: ['Mixed questions. Put the numbers in, work out both sides, and test every equation.'],
      tasks: [
        { k: 'number', q: 'Find y so that *(4, y)* is a solution of *3x − 2y = 10*.', ans: 1, hint: '12 − 2y = 10. Subtract 12, then divide by −2.', why: '3(4) − 2(1) = 12 − 2 = 10 ✓' },
        { k: 'solve', q: 'Is *(2, 5)* a solution of *4x + y = 12*?', start: '4x + y = 12, test (2, 5)',
          moves: [
            { q: 'First move?', opts: ['Put 5 for x and 2 for y', 'Put 2 for x and 5 for y'], ans: 1, res: ['4(2) + 5 = 12', '4(5) + 2 = 12'], rans: 0, hint: 'x first.' },
            { q: 'Work out the left side.', opts: ['Add, then multiply', 'Multiply, then add'], ans: 1, res: ['13 = 12', '28 = 12'], rans: 0, hint: '4 × 2 first.' },
            { q: 'Decide.', opts: ['Close enough: yes', '13 ≠ 12: no'], ans: 1, res: ['(2, 5) is not a solution', '(2, 5) is a solution'], rans: 0,
              hint: 'It must be exactly equal.', why: '13 is not 12, so (2, 5) is not on this line.' }
          ] },
        { k: 'sort', q: 'The system is *x − y = 2* and *x + y = 8*. Sort each pair.', bins: ['Fits both', 'Fits one only', 'Fits neither'],
          cards: [{ t: '(5, 3)', b: 0, why: '5 − 3 = 2 ✓ and 5 + 3 = 8 ✓' }, { t: '(4, 2)', b: 1, why: '4 − 2 = 2 ✓, but 4 + 2 = 6 ✗' }, { t: '(6, 2)', b: 1, why: '6 − 2 = 4 ✗, but 6 + 2 = 8 ✓' },
            { t: '(10, 8)', b: 1, why: '10 − 8 = 2 ✓, but 10 + 8 = 18 ✗' }, { t: '(1, 1)', b: 2, why: '1 − 1 = 0 ✗ and 1 + 1 = 2 ✗' }, { t: '(0, 0)', b: 2 }],
          why: 'Only (5, 3) passes both. It is the solution of the system.' },
        { k: 'choice', q: 'Zero says: "*(6, 2)* solves the system *x + y = 8* and *x − y = 2*, because 6 + 2 = 8." Is he right?', opts: ['Yes: 6 + 2 = 8', 'No: 6 − 2 = 4, not 2', 'No: 6 + 2 is not 8'], ans: 1,
          no: ['That is only one equation. Test the other one.', null, '6 + 2 = 8 is true. Test the other equation.'], why: 'It must pass both. 6 − 2 = 4 ✗, so it is not a solution of the system.' }
      ] }
  ]
});
