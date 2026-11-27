/* Homework: Unit 4 Lesson 6, How Many Solutions? */
SFA_HW({
  id: 'g66', unit: 4, lesson: 6, topic: 'How many solutions?', title: 'The Savings Race', who: 'priya',
  intro: ['The friends are saving for the giant prize at the arcade counter. Gus starts with *50 SAR* and saves *20* a week. Marcus starts with *80* and saves *20*. Priya starts with *50* and saves *20*. Zero starts with *20* and saves *30*.',
    'Who will ever have the same amount as Gus? Compare slopes and intercepts to see if two lines cross once, never, or are the same line.'],
  goal: 'Tell if a system has one solution, no solution or infinitely many by comparing slopes and y-intercepts.',
  bigIdea: 'Different slopes: one solution. Same slope, different b: parallel, no solution. Same slope, same b: the same line, infinitely many.',
  levels: [
    { name: 'Slopes and starts', learn: ['In *y = mx + b*, m is the slope and b is where the line crosses the y-axis.', 'Not in that form? Get y alone first.'],
      tasks: [
        { k: 'choice', q: 'What are the slope and the y-intercept of *y = 3x − 2*?', opts: ['m = −2, b = 3', 'm = 3, b = −2', 'm = 3, b = 2'], ans: 1,
          no: ['m is the number with x.', null, 'Keep the sign: b = −2.'], why: 'm is with x (3). b is the number alone (−2).' },
        { k: 'solve', q: 'Write *2x + y = 3* in y = mx + b form.', start: '2x + y = 3',
          moves: [
            { q: 'First move?', opts: ['Subtract 2x from both sides', 'Add 2x to both sides'], ans: 0, res: ['y = 2x + 3', 'y = −2x + 3'], rans: 1,
              hint: 'Remove + 2x from the left by subtracting it.', no: { 1: 'Adding gives 4x on the left. Subtract 2x.', r0: 'Subtracting 2x makes −2x on the right.' } },
            { q: 'Read m and b.', opts: ['m is the number alone', 'm is the number with x'], ans: 1, res: ['m = −2, b = 3', 'm = 3, b = −2'], rans: 0,
              hint: 'm is stuck to x.', no: { 0: 'm is the slope: the number with x.' }, why: 'Slope −2, y-intercept 3.' }
          ] },
        { k: 'solve', q: 'Write *4x + 2y = 10* in y = mx + b form.', start: '4x + 2y = 10',
          moves: [
            { q: 'First move?', opts: ['Divide only y by 2', 'Subtract 4x from both sides'], ans: 1, res: ['2y = −4x + 10', '2y = 4x + 10', '2y = −4x − 10'], rans: 0,
              hint: 'Move the x term first.', no: { 0: 'Every term must be divided, and first move the 4x.', r1: 'Subtracting 4x gives −4x.', r2: 'The 10 does not change sign.' } },
            { q: 'Next move?', opts: ['Divide every term by 2', 'Divide only the 10 by 2'], ans: 0, res: ['y = −4x + 5', 'y = −2x + 10', 'y = −2x + 5'], rans: 2,
              hint: 'Every term: 2y, −4x and 10.', no: { 1: 'Every term must be divided.', r0: 'Divide −4x by 2 too.', r1: 'Divide the 10 by 2 too.' }, why: 'm = −2, b = 5.' }
          ] },
        { k: 'choice', q: 'Gus: *y = 20x + 50*. Marcus: *y = 20x + 80*. Will they ever have the same amount?', opts: ['Yes, in week 3', 'Never: same slope, Marcus stays ahead', 'Always'], ans: 1,
          no: ['They both add 20 a week. The gap of 30 never shrinks.', null, 'They start at different amounts.'], why: 'Same slope (20), different start: parallel lines that never meet.' }
      ] },
    { name: 'Three cases', learn: ['*Different slopes*: the lines cross once. *One* solution.', '*Same slope, different b*: parallel. *No* solution. *Same slope, same b*: the same line. *Infinitely many*.'],
      tasks: [
        { k: 'sort', q: 'Sort each system by its number of solutions.', bins: ['One solution', 'No solution', 'Infinitely many'],
          cards: [{ t: 'y = 2x + 1 and y = 2x − 3', b: 1, why: 'Same slope 2, different b: parallel.' }, { t: 'y = −x + 5 and y = x + 1', b: 0 },
            { t: 'y = 4x and y = −4x', b: 0, why: 'Slopes 4 and −4 are different. They cross at (0, 0).' }, { t: 'y = 3x − 1 and y = 3x − 1', b: 2 },
            { t: 'y = ½x + 2 and y = ½x − 2', b: 1 }, { t: 'y = 5 and y = −1', b: 1, why: 'Both flat (slope 0), different b: parallel.' }],
          why: 'Compare slopes first. Same slope? Then compare b.' },
        { k: 'choice', q: 'How many solutions does this system have?', fig: { range: [-5, 5], lines: [{ m: 1, b: 2 }, { m: 1, b: -1 }], x: 'x', y: 'y' },
          opts: ['One', 'None', 'Infinitely many'], ans: 1, no: ['Look closely: do they ever cross?', null, 'There are two different lines here.'], why: 'Parallel lines never meet: no solution.' },
        { k: 'choice', q: 'Which graph shows a system with *infinitely many* solutions?', figs: [{ cap: 'A', range: [-4, 4], lines: [{ m: 1, b: 0 }, { m: -1, b: 2 }] }, { cap: 'B', range: [-4, 4], lines: [{ m: 2, b: 1 }, { m: 2, b: -2 }] }, { cap: 'C', range: [-4, 4], lines: [{ m: -0.5, b: 1 }, { m: -0.5, b: 1, dash: true }] }],
          opts: ['A', 'B', 'C'], ans: 2, no: ['A: the lines cross once.', 'B: parallel, they never meet.', null], why: 'In C, one line sits on top of the other: every point is shared.' }
      ] },
    { name: 'Rewrite, then decide', learn: ['Write *both* equations as y = mx + b.', 'Compare slopes, then y-intercepts.'],
      tasks: [
        { k: 'solve', q: 'How many solutions: *y = 2x + 1* and *4x − 2y = −2*?', start: 'Rewrite 4x − 2y = −2',
          moves: [
            { q: 'First move?', opts: ['Subtract 4x from both sides', 'Add 4x to both sides'], ans: 0, res: ['−2y = −4x − 2', '−2y = 4x − 2'], rans: 0,
              hint: 'Move the 4x away from the y.', no: { 1: 'It is + 4x on the left. Subtract it.', r1: 'Subtracting 4x makes −4x.' } },
            { q: 'Next move?', opts: ['Divide every term by 2', 'Divide every term by −2'], ans: 1, res: ['y = 2x + 1', 'y = −2x + 1', 'y = 2x − 2'], rans: 0,
              hint: 'y has −2 stuck to it. Divide everything by −2: every sign changes.', no: { 0: 'Divide by the whole −2.', r1: '−4x ÷ −2 is positive 2x.', r2: '−2 ÷ −2 is +1.' } },
            { q: 'Compare with y = 2x + 1.', opts: ['Compare only the slopes', 'Compare slopes, then b'], ans: 1, res: ['Same slope, same b: infinitely many', 'Same slope: no solution'], rans: 0,
              hint: 'Same slope is not enough. Check b too.', no: { 0: 'Same slope can mean parallel or the same line. Check b.' }, why: 'They are the same line written two ways.' }
          ] },
        { k: 'solve', q: 'How many solutions: *3x + y = 2* and *6x + 2y = 10*?', start: '3x + y = 2 and 6x + 2y = 10',
          moves: [
            { q: 'Solve equation 1 for y.', opts: ['Add 3x to both sides', 'Subtract 3x from both sides'], ans: 1, res: ['y = −3x + 2', 'y = 3x + 2'], rans: 0,
              hint: 'Remove + 3x by subtracting.', no: { 0: 'Subtract to remove + 3x.', r1: 'Subtracting 3x makes −3x.' } },
            { q: 'Solve equation 2 for y.', opts: ['Subtract 6x, divide every term by 2', 'Subtract 6x, divide only y by 2'], ans: 0, res: ['y = −3x + 10', 'y = −3x + 5'], rans: 1,
              hint: '2y = −6x + 10. Now divide every term by 2.', no: { 1: 'Every term must be divided.', r0: 'Divide the 10 by 2 too.' } },
            { q: 'Decide.', opts: ['Compare slopes, then b', 'Compare only b'], ans: 0, res: ['Different slopes: one solution', 'Same slope, b = 2 and 5: no solution'], rans: 1,
              hint: 'Both slopes are −3. Then b: 2 and 5.', no: { 1: 'Start with the slopes.' }, why: 'Parallel lines: no solution.' }
          ] },
        { k: 'choice', q: 'Shortcut: *x − 4y = 7* and *x − 4y = 1*. How many solutions?', opts: ['One', 'None', 'Infinitely many'], ans: 1,
          no: ['The same left side cannot be 7 and 1 at once.', null, 'The right sides are different.'], why: 'x − 4y cannot equal 7 and 1 at the same time.' },
        { k: 'choice', q: 'How many solutions: *y = −2x + 4* and *4x + 2y = 8*?', opts: ['Infinitely many: same line', 'None: parallel', 'One'], ans: 0,
          no: [null, 'Rewrite it: 2y = −4x + 8, so y = −2x + 4. Same b too.', 'Rewrite the second one. Are the slopes different?'], why: '4x + 2y = 8 gives y = −2x + 4: the same line.' }
      ] },
    { name: 'Build your own', learn: ['*No solution*: keep the slope, change b.', '*Infinitely many*: multiply the whole equation by a number.'],
      tasks: [
        { k: 'choice', q: 'Which second equation makes a system with *y = 4x − 1* that has *no solution*?', opts: ['y = −4x − 1', 'y = 4x − 1', 'y = 4x + 3'], ans: 2,
          no: ['Different slope: they cross once.', 'The same line: infinitely many.', null], why: 'Same slope 4, different b: parallel.' },
        { k: 'choice', q: 'Which equation, with *x + 3y = 6*, gives *infinitely many* solutions?', opts: ['2x + 6y = 12', '2x + 6y = 6', 'x − 3y = 6'], ans: 0,
          no: [null, 'Times 2 must double the 6 too: 12.', 'The sign changed, so the slope changed.'], why: '2x + 6y = 12 is the first equation times 2: the same line.' },
        { k: 'number', q: '*y = □x + 7* and *y = 5x + 1* have *no solution*. What number goes in the box?', ans: 5, hint: 'Parallel lines have the same slope.', why: 'y = 5x + 7 and y = 5x + 1 are parallel.' },
        { k: 'match', q: 'Match each system to its number of solutions.', pairs: [['y = x + 3 and y = x − 3', 'No solution'], ['y = x + 3 and y = −x + 3', 'One solution: (0, 3)'], ['y = x + 3 and 2y = 2x + 6', 'Infinitely many']] }
      ] },
    { name: 'The prize counter boss', boss: true, learn: ['Mixed questions. Rewrite, compare slopes, compare b, then decide.'],
      tasks: [
        { k: 'solve', q: 'Zero: *y = 30x + 20*. Gus: *y = 20x + 50*. Will they ever match? When?', start: '30x + 20 = 20x + 50',
          moves: [
            { q: 'Compare the slopes first.', opts: ['30 and 20: different', '30 and 20: the same'], ans: 0, res: ['No solution', 'One solution: they meet once'], rans: 1, hint: 'Different slopes cross once.' },
            { q: 'Solve: first move?', opts: ['Subtract 20x from both sides', 'Subtract 30x from the left only'], ans: 0, res: ['10x + 20 = 50', '50x + 20 = 50'], rans: 0 },
            { q: 'Next move?', opts: ['Subtract 20, then divide by 10', 'Divide by 10, then add 20'], ans: 0, res: ['x = 7', 'x = 3'], rans: 1 },
            { q: 'Find the amount.', opts: ['Put x = 3 into either rule', 'Add 30 + 20'], ans: 0, res: ['y = 110: week 3, 110 SAR', 'y = 50'], rans: 0, why: 'Check: 30(3) + 20 = 110 and 20(3) + 50 = 110 ✓' }
          ] },
        { k: 'sort', q: 'Sort each system.', bins: ['One solution', 'No solution', 'Infinitely many'],
          cards: [{ t: '2x + y = 4 and 2x + y = 1', b: 1 }, { t: 'x + y = 4 and 3x + 3y = 12', b: 2, why: 'The second is the first times 3.' }, { t: 'x + y = 4 and x − y = 2', b: 0 },
            { t: 'y = 2x and 2x − y = 0', b: 2, why: '2x − y = 0 gives y = 2x.' }, { t: '6x − 3y = 9 and y = 2x + 1', b: 1, why: '6x − 3y = 9 gives y = 2x − 3: same slope, different b.' }] },
        { k: 'choice', q: 'Gus and Priya\'s savings make one line on top of the other. What does it mean?', opts: ['They never have the same amount', 'They always have the same amount', 'They match only once'], ans: 1,
          no: ['Same line means every point is shared.', null, 'They match every week, not once.'], why: 'Both are y = 20x + 50: infinitely many solutions.' },
        { k: 'choice', q: 'Marcus says: "Different b always means no solution." Test *y = x + 1* and *y = 2x + 3*.', opts: ['He is right', 'He is wrong: different slopes cross once'], ans: 1,
          no: ['Check the slopes: 1 and 2. They are different.', null], why: 'Different b only means no solution when the slopes are the same.' }
      ] }
  ]
});
