/* Homework: Unit 3 Lesson 4, Function Notation. */
SFA_HW({
  id: 'g34', unit: 3, lesson: 4, topic: 'Function notation', title: 'The Fare Machine', who: 'gus',
  intro: ['The Sandy Flats beach shuttle has a new fare machine, and it only speaks in function notation. *F(k)* is the fare in riyals for a ride of *k* kilometres.',
    'Passengers are queuing and the machine keeps asking questions. Answer them before the queue reaches the pier.'],
  goal: 'Read f(x), work it out from a rule, a table and a graph, and run it backwards.',
  bigIdea: 'f(3) = 11 means: put in 3, get out 11. The point is (3, 11).',
  levels: [
    { name: 'Read the meter', learn: ['*f(x)* is read "f of x". It is the *output* when the input is x.', '*f(3) = 11* means input 3, output 11: the point *(3, 11)*.'],
      tasks: [
        { k: 'choice', q: 'The machine shows *F(4) = 13*. What does it mean?', opts: ['A 4 km ride costs 13 riyals', 'A 13 km ride costs 4 riyals', 'F times 4 is 13', '4 riders paid 13 riyals in total'], ans: 0,
          no: [null, 'The number inside the brackets is the *input*: the kilometres.', 'F(4) is not multiplication. Read it as "F of 4".', 'The input is kilometres, not riders.'], why: 'Inside the brackets: the input (4 km). After the equals sign: the output (13 riyals).' },
        { k: 'pair', q: 'Write *F(4) = 13* as a point (input, output).', ans: [4, 13], hint: 'Input first, output second.', why: '(4, 13): the input goes first.' },
        { k: 'choice', q: 'Which statement says "a 10 km ride costs 33 riyals"?', opts: ['F(33) = 10', 'F(10) = 33', 'F = 10 × 33', '10F = 33'], ans: 1, why: 'Input 10 inside the brackets, output 33 after the equals sign.' }
      ] },
    { name: 'Run the rule', learn: ['To evaluate, *replace x with the input*, in brackets, then work it out.', 'Order: brackets, then multiply, then add or subtract.'],
      tasks: [
        { k: 'solve', q: 'The fare rule is *F(k) = 3k + 1*. Find *F(4)*.', start: 'F(4) = 3(4) + 1',
          moves: [
            { q: 'What first?', opts: ['Multiply 3 × 4', 'Add 4 + 1', 'Add 3 + 4'], ans: 0, res: ['F(4) = 12 + 1', 'F(4) = 3(5)', 'F(4) = 7 + 1'], rans: 0, hint: 'Multiply before you add.' },
            { q: 'Last move?', opts: ['Add 12 + 1', 'Multiply 12 × 1', 'Subtract 1'], ans: 0, res: ['F(4) = 13', 'F(4) = 12', 'F(4) = 11'], rans: 0, why: 'A 4 km ride costs 13 riyals, which matches the meter in level 1.' }
          ] },
        { k: 'number', q: 'Same rule, *F(k) = 3k + 1*. Find *F(0)*. What does it mean?', ans: 1, unit: 'riyals', hint: '3 × 0 = 0. What is left?', why: 'F(0) = 1: the fare before you go anywhere, the starting charge.' },
        { k: 'solve', q: 'A new rule: *g(x) = −2x + 7*. Find *g(−3)*.', start: 'g(−3) = −2(−3) + 7',
          moves: [
            { q: 'What first?', opts: ['Multiply −2 × −3', 'Add −3 + 7', 'Subtract 2 − 3'], ans: 0, res: ['g(−3) = 6 + 7', 'g(−3) = −6 + 7', 'g(−3) = −2(4)'], rans: 0, hint: 'Negative times negative is positive.' },
            { q: 'Last move?', opts: ['Add 6 + 7', 'Subtract 7 − 6'], ans: 0, res: ['g(−3) = 13', 'g(−3) = 1'], rans: 0 }
          ] },
        { k: 'fill', q: 'Fill in the fare table for *F(k) = 3k + 1*.', head: ['k (km)', 'F(k) (riyals)'], rows: [[1, { a: 4 }], [2, { a: 7 }], [5, { a: 16 }], [8, { a: 25 }]], hint: 'Multiply k by 3, then add 1.', why: 'Each extra kilometre adds 3 riyals.' }
      ] },
    { name: 'Tables and graphs', learn: ['In a table, find the input in the top row (or left column) and read its output.', 'On a graph, go *across* to the input, then *up or down* to the line. The height is the output.'],
      tasks: [
        { k: 'number', q: 'This table shows *h(t)*, the height in metres of a kite after *t* seconds. What is *h(3)*?', tab: { head: ['t', '0', '1', '2', '3', '4'], rows: [['h(t)', 2, 5, 8, 11, 14]] }, ans: 11, hint: 'Find t = 3 in the top row.', why: 'h(3) = 11: after 3 seconds the kite is 11 m up.' },
        { k: 'number', q: 'Same table. For what input is *h(t) = 14*?', tab: { head: ['t', '0', '1', '2', '3', '4'], rows: [['h(t)', 2, 5, 8, 11, 14]] }, ans: 4, hint: 'This time 14 is the *output*. Find it in the bottom row and read up.', why: 't = 4. Finding the input from the output is "solving" f(x) = 14.' },
        { k: 'number', q: 'The graph shows *p(x)*. What is *p(2)*?', fig: { range: [-1, 6], yrange: [-1, 8], lines: [{ m: 1.5, b: 1, lab: 'p' }], pts: [[2, 4]], x: 'x', y: 'y' }, ans: 4, hint: 'Go across to x = 2, then up to the line.', why: 'p(2) = 4: the point (2, 4) is on the line.' },
        { k: 'pair', q: 'Same graph: the line goes through *(4, 7)*. Write this with function notation by filling in p( __ ) = __ as a point.', fig: { range: [-1, 6], yrange: [-1, 8], lines: [{ m: 1.5, b: 1, lab: 'p' }], pts: [[4, 7]], x: 'x', y: 'y' }, ans: [4, 7], why: 'p(4) = 7.' }
      ] },
    { name: 'Run it backwards', learn: ['*Evaluate*: you know the input, find the output. f(5) = ?', '*Solve*: you know the output, find the input. f(x) = 22, so x = ?'],
      tasks: [
        { k: 'solve', q: '*F(k) = 3k + 1*. Which ride costs 22 riyals? Solve *F(k) = 22*.', start: '3k + 1 = 22',
          moves: [
            { q: 'What is stuck to the 3k?', opts: ['Subtract 1 from both sides', 'Divide both sides by 3', 'Add 1 to both sides'], ans: 0, res: ['3k = 21', '3k = 23', 'k + 1 = 22'], rans: 0, hint: 'Undo the + 1 first, on both sides.' },
            { q: 'Next move?', opts: ['Divide both sides by 3', 'Subtract 3 from both sides', 'Multiply both sides by 3'], ans: 0, res: ['k = 7', 'k = 18', 'k = 63'], rans: 0, why: 'A 7 km ride costs 22 riyals: F(7) = 22.' }
          ] },
        { k: 'choice', q: 'Marcus says *F(22) = 7*. Is he right?', opts: ['No: F(7) = 22. He swapped the input and the output.', 'Yes: it is the same thing written backwards.', 'No: F(22) = 22.'], ans: 0, why: 'F(22) = 3(22) + 1 = 67. Order matters: input inside the brackets.' },
        { k: 'solve', q: '*g(x) = 4x − 5*. Solve *g(x) = 19*.', start: '4x − 5 = 19',
          moves: [
            { q: 'First move?', opts: ['Add 5 to both sides', 'Subtract 5 from both sides', 'Divide both sides by 4'], ans: 0, res: ['4x = 24', '4x = 14', 'x − 5 = 19'], rans: 0, hint: 'Undo − 5 by adding 5.' },
            { q: 'Next move?', opts: ['Divide both sides by 4', 'Subtract 4 from both sides'], ans: 0, res: ['x = 6', 'x = 20'], rans: 0, why: 'Check: g(6) = 4(6) − 5 = 19. ✓' }
          ] }
      ] },
    { name: 'The rush hour boss', boss: true, learn: ['Mixed questions. No new ideas, just everything at once. Take your time: coins come from first tries.'],
      tasks: [
        { k: 'number', q: 'A water tank: *W(t) = 500 − 20t* litres after *t* minutes. Find *W(10)*.', ans: 300, unit: 'litres', why: 'W(10) = 500 − 200 = 300 litres left after 10 minutes.' },
        { k: 'number', q: 'Same tank. When is it empty? Solve *W(t) = 0*.', ans: 25, unit: 'minutes', hint: '500 − 20t = 0. Add 20t to both sides, then divide.', why: '20t = 500, so t = 25 minutes.' },
        { k: 'match', q: 'Match each statement to what it means for the tank.', pairs: [['W(0) = 500', 'It starts with 500 litres'], ['W(5) = 400', 'After 5 minutes, 400 litres are left'], ['W(t) = 100', 'Find when 100 litres are left'], ['W(25) = 0', 'It is empty after 25 minutes']] },
        { k: 'choice', q: '*f(x) = x²*. Which is true?', opts: ['f(3) = 9 and f(−3) = 9', 'f(3) = 6', 'f(−3) = −9', 'f(9) = 3'], ans: 0, no: [null, 'x² means x times x, not x times 2.', '(−3)(−3) is positive.', 'Input 9 gives 81.'], why: 'Two inputs can share an output. That is still a function: each input has one output.' }
      ] }
  ]
});
