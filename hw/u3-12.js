/* Homework: Unit 3 Lesson 12, Move the Starting Point. */
SFA_HW({
  id: 'g42', unit: 3, lesson: 12, topic: 'Move the starting point', title: 'Clock Restart', who: 'one',
  intro: ['One is growing a giant sunflower in the arcade window. Its height is *h(t) = 2t + 4* centimetres after *t* days.',
    'On day 10 the arcade starts a *Sunflower Challenge*, and day 10 becomes the new *day 0*. Help One rewrite the model when the clock restarts, and find out what sliding a graph left or right does to its rule.'],
  goal: 'Shift a graph left or right with f(x − h) and f(x + h), and rewrite a model when its start moves.',
  bigIdea: 'g(x) = f(x − h) moves the graph right h, f(x + h) moves it left h, and for a line that is the same as a shift up or down.',
  levels: [
    { name: 'Right or left?', learn: ['*g(x) = f(x − h)* moves the graph *right* h.', '*g(x) = f(x + h)* moves it *left* h.', 'It feels backwards: the input must be h bigger to get the same output.'],
      tasks: [
        { k: 'choice', q: 'Which way does *g(x) = f(x − 3)* move the graph of f?', opts: ['Right 3', 'Left 3', 'Up 3', 'Down 3'], ans: 0,
          no: [null, 'It feels like minus means left, but it is backwards: x must be 3 bigger to give the same output.', 'The − 3 is inside the brackets, with x. It moves sideways.', 'The − 3 is inside the brackets, with x. Up and down come from outside.'], why: 'g(5) = f(2): g does at 5 what f did at 2, three steps later. So right 3.' },
        { k: 'choice', q: 'Which way does *g(x) = f(x + 2)* move the graph of f?', opts: ['Left 2', 'Right 2', 'Up 2', 'Down 2'], ans: 0,
          no: [null, 'Backwards again: + inside the brackets moves it left.', 'Inside the brackets, with x: that is sideways.', 'Inside the brackets, with x: that is sideways.'], why: 'g(0) = f(2): g gets there 2 steps earlier. So left 2.' },
        { k: 'fill', q: '*f(x) = 2x*. Fill in the table for *g(x) = f(x − 3)*.', head: ['x', 'x − 3', 'g(x) = f(x − 3)'], rows: [[3, { a: 0 }, { a: 0 }], [4, { a: 1 }, { a: 2 }], [5, { a: 2 }, { a: 4 }], [6, { a: 3 }, { a: 6 }]],
          hint: 'First take 3 from x. Then double the answer.', why: 'g(3) = f(0) = 0: the point (0, 0) of f is at (3, 0) on g. Right 3.' },
        { k: 'solve', q: '*f(x) = 2x + 1* and *g(x) = f(x − 3)*. Find *g(5)*.', start: 'g(5) = f(5 − 3)',
          moves: [
            { q: 'What first?', opts: ['Work out 5 − 3', 'Find f(5)', 'Take 3 from f(5)'], ans: 0, res: ['g(5) = f(2)', 'g(5) = f(8)', 'g(5) = f(−2)'], rans: 0,
              hint: 'Do the inside of the brackets first.', no: { 1: 'The input to f is 5 − 3, not 5.', 2: 'The − 3 is inside the brackets: it changes the input, not the output.', r1: '5 − 3, not 5 + 3.', r2: '5 − 3 is positive.' } },
            { q: 'Next move?', opts: ['Use the rule: 2(2) + 1', 'Use the rule: 2(5) + 1'], ans: 0, res: ['g(5) = 5', 'g(5) = 4', 'g(5) = 7'], rans: 0,
              hint: 'Now the input to f is 2.', no: { 1: 'The input to f is now 2, not 5.', r1: '2(2) + 1: do not forget the + 1.', r2: '2(2) = 4, then + 1.' }, why: 'g(5) = f(2) = 5. g shows at x = 5 what f showed at x = 2: right 3.' }
          ] }
      ] },
    { name: 'Rewrite the rule', learn: ['Replace *every x* in f with (x − h), in brackets.', 'Multiply out the brackets: multiply *every* term inside.', 'Then combine the numbers.'],
      tasks: [
        { k: 'solve', q: '*f(x) = 2x* and *g(x) = f(x − 3)*. Write g(x) as mx + b.', start: 'g(x) = f(x − 3)',
          moves: [
            { q: 'What first?', opts: ['Put (x − 3) in place of x', 'Take 3 from the output', 'Take 3 from the slope'], ans: 0, res: ['g(x) = 2(x − 3)', 'g(x) = 2x − 3', 'g(x) = 2(x + 3)'], rans: 0,
              hint: 'f doubles its input. Now the input is x − 3.', no: { 1: 'The − 3 is inside the brackets: it changes the input.', 2: 'Sliding sideways does not change the slope.', r1: 'Keep the brackets: 2 doubles the whole input x − 3.', r2: 'Keep the sign: x − 3.' } },
            { q: 'Next move?', opts: ['Multiply 2 by both terms', 'Multiply 2 by x only'], ans: 0, res: ['g(x) = 2x − 6', 'g(x) = 2x − 3', 'g(x) = 2x + 6'], rans: 0,
              hint: '2 × x and 2 × (−3).', no: { 1: 'The 2 multiplies everything in the brackets.', r1: 'The 3 is multiplied too: 2 × 3 = 6.', r2: '2 × (−3) is negative.' }, why: 'Right 3 gives the same line as down 6: same slope, intercept 0 → −6.' }
          ] },
        { k: 'solve', q: '*f(x) = 3x + 1* and *g(x) = f(x − 2)*. Write g(x) as mx + b.', start: 'g(x) = f(x − 2)',
          moves: [
            { q: 'What first?', opts: ['Put (x − 2) in place of x', 'Take 2 from the end'], ans: 0, res: ['g(x) = 3(x − 2) + 1', 'g(x) = 3x − 2 + 1', 'g(x) = 3(x − 2 + 1)'], rans: 0,
              hint: 'Replace x, and only x. The + 1 stays outside.', no: { 1: 'The − 2 is inside the brackets, with x.', r1: 'Keep the brackets: 3 multiplies the whole x − 2.', r2: 'Only x is replaced. The + 1 stays outside the brackets.' } },
            { q: 'Next move?', opts: ['Multiply 3 by both terms', 'Multiply 3 by x only'], ans: 0, res: ['g(x) = 3x − 6 + 1', 'g(x) = 3x − 2 + 1', 'g(x) = 3x − 5 + 1'], rans: 0,
              hint: '3 × x and 3 × (−2).', no: { 1: 'The 3 multiplies everything in the brackets.', r1: 'The 2 is multiplied too: 3 × 2 = 6.', r2: '3 × 2 is 6.' } },
            { q: 'Next move?', opts: ['Combine −6 + 1', 'Combine 3x + 1'], ans: 0, res: ['g(x) = 3x − 5', 'g(x) = 3x − 7', 'g(x) = 3x + 5'], rans: 0,
              hint: 'Start at −6 and go up 1.', no: { 1: '3x and 1 are not like terms.', r1: '−6 + 1: up 1 from −6.', r2: '−6 + 1 is still negative.' }, why: 'Same slope 3, intercept 1 → −5.' }
          ] },
        { k: 'solve', q: '*f(x) = −x + 4* and *g(x) = f(x + 1)*. Write g(x) as mx + b.', start: 'g(x) = f(x + 1)',
          moves: [
            { q: 'What first?', opts: ['Put (x + 1) in place of x', 'Add 1 to the end'], ans: 0, res: ['g(x) = −(x + 1) + 4', 'g(x) = −x + 1 + 4', 'g(x) = −(x − 1) + 4'], rans: 0,
              hint: 'Replace x with (x + 1). Keep the brackets.', no: { 1: 'The + 1 is inside the brackets, with x.', r1: 'Keep the brackets: the minus works on the whole x + 1.', r2: 'Keep the sign: x + 1.' } },
            { q: 'Next move?', opts: ['Change the sign of both terms', 'Change the sign of x only'], ans: 0, res: ['g(x) = −x − 1 + 4', 'g(x) = −x + 1 + 4'], rans: 0,
              hint: '−(x + 1) = −x − 1.', no: { 1: 'The minus works on everything in the brackets.', r1: '−(+1) is −1.' } },
            { q: 'Next move?', opts: ['Combine −1 + 4', 'Combine −x + 4'], ans: 0, res: ['g(x) = −x + 3', 'g(x) = −x + 5', 'g(x) = −x − 3'], rans: 0,
              hint: 'Start at −1 and go up 4.', no: { 1: '−x and 4 are not like terms.', r1: '−1 + 4 is 3.', r2: '−1 + 4 is positive.' }, why: 'Left 1 gives the same line as down 1: intercept 4 → 3.' }
          ] },
        { k: 'choice', q: '*f(x) = 2x*. You found *f(x − 3) = 2x − 6*. Which *up or down* shift gives the same line?', opts: ['f(x) − 6', 'f(x) − 3', 'f(x) + 6', 'f(x) + 3'], ans: 0,
          no: [null, 'f(x) − 3 = 2x − 3. Compare with 2x − 6.', 'f(x) + 6 = 2x + 6. Check the sign.', 'f(x) + 3 = 2x + 3.'], why: 'For a line, right 3 is the same as down 2 × 3 = 6: same slope, new intercept.' }
      ] },
    { name: 'Restart the clock', learn: ['Day 10 becomes the new *day 0*.', 'New day s = old day − 10, so *old day = s + 10*.', 'So the new model is *g(s) = h(s + 10)*.'],
      tasks: [
        { k: 'number', q: 'One\'s sunflower: *h(t) = 2t + 4* cm after t days. How tall is it on *day 10*?', ans: 24, unit: 'cm', hint: '2 × 10, then + 4.', why: 'h(10) = 24 cm. This will be the starting height for the challenge.' },
        { k: 'solve', q: 'Day 10 is the new day 0. Write the new model *g(s) = h(s + 10)*, where *h(t) = 2t + 4*.', start: 'g(s) = h(s + 10)',
          moves: [
            { q: 'What first?', opts: ['Put (s + 10) in place of t', 'Add 10 to the height'], ans: 0, res: ['g(s) = 2(s + 10) + 4', 'g(s) = 2s + 10 + 4', 'g(s) = 2(s − 10) + 4'], rans: 0,
              hint: 'Old day t = s + 10. Put it in for t, in brackets.', no: { 1: 'The 10 is days, not centimetres. It goes inside, with s.', r1: 'Brackets! The 2 multiplies the whole s + 10.', r2: 'Day 10 is the new day 0: old day = s + 10, not s − 10.' } },
            { q: 'Next move?', opts: ['Multiply 2 by both terms', 'Multiply 2 by s only'], ans: 0, res: ['g(s) = 2s + 20 + 4', 'g(s) = 2s + 10 + 4', 'g(s) = 2s + 12 + 4'], rans: 0,
              hint: '2 × s and 2 × 10.', no: { 1: 'The 2 multiplies everything in the brackets.', r1: 'The 10 is multiplied too: 2 × 10 = 20.', r2: '2 × 10 = 20.' } },
            { q: 'Next move?', opts: ['Combine 20 + 4', 'Combine 2s + 20'], ans: 0, res: ['g(s) = 2s + 24', 'g(s) = 2s + 14', 'g(s) = 26s'], rans: 0,
              hint: 'Add the plain numbers.', no: { 1: '2s and 20 are not like terms.', r1: '20 + 4 = 24.', r2: '2s and 24 cannot be added together.' }, why: 'New start: 24 cm on the new day 0. Same growth: 2 cm a day.' }
          ] },
        { k: 'choice', q: 'In the new model *g(s) = 2s + 24*, what does the *24* mean?', opts: ['The height on day 10 (the new day 0)', 'The height on the very first day', 'It grows 24 cm a day', 'The challenge lasts 24 days'], ans: 0,
          no: [null, 'On the first day it was 4 cm: h(0) = 4.', 'The growth per day is the number with s: 2.', 'The model does not say how long the challenge lasts.'], why: 'g(0) = 24: at the new start (day 10) the sunflower is 24 cm tall.' },
        { k: 'fill', q: 'Check the new model with a table. Fill in the old day and the height.', head: ['New day s', 'Old day t', 'Height h(t)'], rows: [[0, { a: 10 }, { a: 24 }], [1, { a: 11 }, { a: 26 }], [5, { a: 15 }, { a: 34 }]],
          hint: 'Old day = s + 10. Then use h(t) = 2t + 4.', why: 'g(5) = 2(5) + 24 = 34 too. The new model works.' }
      ] },
    { name: 'Same line, two ways', learn: ['For a line, sliding right or left gives the *same slope* and a *new intercept*.', 'So a sideways shift of a line is also an up or down shift.'],
      tasks: [
        { k: 'plane', q: '*f(x) = x + 1*. Graph *g(x) = f(x − 3)*: tap two points on it.', range: [-5, 5], m: 1, b: -2, op: '=', parts: ['line'],
          hint: 'g(x) = (x − 3) + 1 = x − 2. Start at (0, −2).', why: 'g(x) = x − 2: f moved right 3 (which is also down 3).' },
        { k: 'plane', q: '*f(x) = 2x*. Graph *g(x) = f(x + 1)*.', range: [-5, 5], m: 2, b: 2, op: '=', parts: ['line'],
          hint: 'g(x) = 2(x + 1) = 2x + 2. Start at (0, 2).', why: 'g(x) = 2x + 2: left 1 is the same line as up 2.' },
        { k: 'match', q: '*f(x) = 2x*. Match each rule to its simpler form.', pairs: [['f(x − 2)', '2x − 4'], ['f(x + 2)', '2x + 4'], ['f(x) − 2', '2x − 2'], ['f(x) + 2', '2x + 2']],
          why: 'Inside the brackets the 2 gets doubled (2 × 2 = 4). Outside it does not.' },
        { k: 'choice', q: 'Priya\'s savings: *S(w) = 50w + 100* riyals after w weeks. She restarts the count at week 4. What is the new rule *S(w + 4)*?', opts: ['50w + 300', '50w + 104', '50w − 100', '50w + 200'], ans: 0,
          no: [null, 'Multiply 50 by the 4 too: 50(w + 4) = 50w + 200.', 'Week 4 is the new week 0: use w + 4, not w − 4.', '50(w + 4) = 50w + 200. Do not forget the + 100.'], why: '50(w + 4) + 100 = 50w + 200 + 100 = 50w + 300. She had 300 riyals at week 4.' }
      ] },
    { name: 'The challenge boss', boss: true, learn: ['Mixed questions, fewer hints. Brackets first, multiply every term, then combine.'],
      tasks: [
        { k: 'solve', q: '*f(x) = 4x − 1* and *g(x) = f(x − 2)*. Write g(x) as mx + b.', start: 'g(x) = f(x − 2)',
          moves: [
            { q: 'What first?', opts: ['Put (x − 2) in place of x', 'Take 2 from the end'], ans: 0, res: ['g(x) = 4(x − 2) − 1', 'g(x) = 4x − 2 − 1', 'g(x) = 4(x + 2) − 1'], rans: 0 },
            { q: 'Next move?', opts: ['Multiply 4 by both terms', 'Multiply 4 by x only'], ans: 0, res: ['g(x) = 4x − 8 − 1', 'g(x) = 4x − 2 − 1', 'g(x) = 4x + 8 − 1'], rans: 0 },
            { q: 'Next move?', opts: ['Combine −8 − 1', 'Combine 4x − 8'], ans: 0, res: ['g(x) = 4x − 9', 'g(x) = 4x − 7', 'g(x) = 4x + 9'], rans: 0, why: 'Right 2 is the same line as down 8: intercept −1 → −9.' }
          ] },
        { k: 'solve', q: 'A tank holds *W(t) = 5t + 40* litres after t minutes. Restart the clock at minute 6: write *g(s) = W(s + 6)*.', start: 'g(s) = W(s + 6)',
          moves: [
            { q: 'What first?', opts: ['Put (s + 6) in place of t', 'Add 6 litres'], ans: 0, res: ['g(s) = 5(s + 6) + 40', 'g(s) = 5s + 6 + 40', 'g(s) = 5(s − 6) + 40'], rans: 0 },
            { q: 'Next move?', opts: ['Multiply out, then combine', 'Add 6 + 40 first'], ans: 0, res: ['g(s) = 5s + 70', 'g(s) = 5s + 46', 'g(s) = 5s + 76'], rans: 0,
              no: { r1: '5 × 6 = 30, then 30 + 40.', r2: '5(s + 6) = 5s + 30. Then + 40.' }, why: 'At minute 6 the tank has 70 litres: W(6) = 30 + 40 = 70.' }
          ] },
        { k: 'pair', q: 'The point *(1, 4)* is on f. *g(x) = f(x − 5)*. Where does the point move on g?', ans: [6, 4], why: 'Right 5: (1, 4) moves to (6, 4). The output does not change.' },
        { k: 'choice', q: 'Zero says: "*f(x + 4)* moves the graph right 4, because + means right." Is he right?', opts: ['No: f(x + 4) moves it left 4', 'Yes: + means right', 'No: it moves it up 4', 'No: it moves it down 4'], ans: 0,
          no: [null, 'Inside the brackets it is backwards: g(0) = f(4), so g gets there 4 steps early.', 'The + 4 is inside the brackets, with x: sideways.', 'The + 4 is inside the brackets, with x: sideways.'], why: 'Inside the brackets, + moves the graph left.' }
      ] }
  ]
});
