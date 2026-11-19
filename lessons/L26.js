SFA_LESSON({
  id: 'L26', n: 21.2, label: 'Review 2', title: 'Change the Form',
  game: { title: 'Unit 2 Review', file: 'review-u2.html' },
  big: 'Same line, different clothes. Ax + By = C to y = mx + b: move the x-term, then divide EVERY term by B. Back again: clear fractions, move x left, make A positive. Then graph from (0, b) with rise over run.',
  slides: [
    { k: 'title', min: 1, kicker: 'Unit 2 Review · 2 of 4', title: 'Change the Form', sub: 'Standard form and slope-intercept form are the same line in different clothes. Today you change them, and graph them.', art: '🔁' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Turn Ax + By = C into y = mx + b', 'Turn y = mx + b into Ax + By = C', 'Graph a line from its equation', 'Spot the most common conversion mistakes'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'Same thing, different clothes. Which "translation" do you use most?', opts: ['Two languages at home', 'Texting shortcuts (brb, idk)', 'Emojis instead of words', 'Converting money', 'None, I say it as it is'] },
    { k: 'text', min: 2, title: 'Two forms, one line', points: ['*Slope-intercept form*: y = mx + b. You can read the slope and where it crosses the y-axis.', '*Standard form*: Ax + By = C. x and y on the same side, whole numbers, A not negative.', 'Standard form is great for intercepts: put x = 0 or y = 0.', 'Changing form never changes the line.'] },
    { k: 'text', min: 2, title: 'Standard → slope-intercept', points: ['Example: *4x + 2y = 10*.', '1) Subtract 4x from both sides: 2y = −4x + 10.', '2) Divide *every* term by 2: y = −2x + 5.', 'Slope −2, y-intercept 5.'], note: 'The classic slip: dividing the x-term by 2 but forgetting to divide the 10.' },
    { k: 'ex', min: 2, kick: 'Example 1 of 3 · Standard → slope-intercept', title: 'B is 1', q: 'Write *3x + y = 7* as y = mx + b.',
      steps: [
        { t: 'y is nearly alone. Subtract 3x from both sides.', eq: 'y = [[−3]]x + [[7]]' },
        { t: 'Read it: m = [[~−3]], b = [[~7]].' },
        { t: 'Check a point: x = 1 gives y = [[4]]. In the original: 3(1) + 4 = 7 ✓' }
      ] },
    { k: 'ex', min: 2, kick: 'Example 2 of 3 · Standard → slope-intercept', title: 'Divide every term', q: 'Write *2x + 4y = 12* as y = mx + b.',
      steps: [
        { t: 'Subtract 2x from both sides.', eq: '4y = [[−2]]x + 12' },
        { t: 'Divide *every* term by 4, the 12 too.', eq: 'y = −(2/4)x + 12/4' },
        { t: 'Simplify: m = [[~−1/2]], b = [[~3]].', eq: 'y = [[−1/2]]x + [[3]]' },
        { t: 'Check: x = 2 gives y = [[2]]. In the original: 2(2) + 4(2) = 12 ✓' }
      ] },
    { k: 'ex', min: 2, kick: 'Example 3 of 3 · Standard → slope-intercept', title: 'A negative B', q: 'Write *5x − 2y = 8* as y = mx + b.',
      steps: [
        { t: 'Subtract 5x from both sides.', eq: '−2y = [[−5]]x + 8' },
        { t: 'Divide every term by *−2*: both signs flip.', eq: 'y = [[5/2]]x − [[4]]' },
        { t: 'm = [[~5/2]], b = [[~−4]].' }
      ] },
    { k: 'number', min: 5, id: 'sb1', q: 'Write *6x + 3y = 12* as y = mx + b. What is *b*?', ans: 4,
      hint: '3y = −6x + 12. Divide every term by 3.', why: 'y = −2x + 4, so b = 4.',
      help: 'First move the 6x. What is 3y equal to?',
      more: [
        { k: 'number', q: 'Write *2x + y = 7* as y = mx + b. What is the slope m?', ans: -2, hint: 'y is already nearly alone: subtract 2x.', why: 'y = −2x + 7.',
          steps: ['Subtract 2x from both sides.', 'y = −2x + 7.', 'm = *−2*, b = 7.'] },
        { k: 'number', q: 'Write *3x − 4y = 8* as y = mx + b. What is b?', ans: -2, hint: '−4y = −3x + 8. Divide every term by −4.', why: 'y = (3/4)x − 2.',
          steps: ['Subtract 3x: −4y = −3x + 8.', 'Divide every term by −4: y = (3/4)x − 2.', 'b = *−2*.'] },
        { k: 'number', q: 'Write *5x + 2y = 9* as y = mx + b. What is b? A fraction or decimal is fine.', ans: 4.5, tol: 0.01, hint: 'Divide the 9 by 2 as well.', why: 'y = −(5/2)x + 9/2.',
          steps: ['2y = −5x + 9.', 'Divide every term by 2.', 'y = −(5/2)x + *9/2* (4.5).'] }
      ] },
    { k: 'poll', min: 3, id: 'slip', q: 'Marcus turns *2x + 5y = 15* into *y = −(2/5)x + 15*. What went wrong?',
      opts: ['Nothing', 'He forgot to divide 15 by 5: it should be + 3', 'The slope should be +2/5', 'He should divide by 2'], ans: 1,
      why: 'Every term gets divided by 5: 15 ÷ 5 = 3. y = −(2/5)x + 3.',
      help: 'Check each term: was it divided by 5?',
      more: [
        { k: 'poll', q: 'Doug turns *4x + y = 6* into *y = 4x + 6*. What went wrong?', opts: ['Nothing', 'Moving 4x across changes its sign: y = −4x + 6', 'He should divide by 4', 'b should be −6'], ans: 1, why: 'Subtracting 4x from both sides gives y = −4x + 6.',
          steps: ['Subtract 4x from both sides.', 'Left: y. Right: 6 − 4x.', 'y = *−4x + 6*.'] },
        { k: 'number', q: 'Fix it: *3x − 6y = 18* in slope-intercept form. What is the slope? A fraction is fine.', ans: 0.5, tol: 0.01, hint: '−6y = −3x + 18, then divide by −6.', why: 'y = (1/2)x − 3.',
          steps: ['−6y = −3x + 18.', 'Divide every term by −6.', 'y = (1/2)x − 3: m = *1/2*.'] },
        { k: 'open', q: 'Explain why you must divide *every* term by B, not just the x-term.', ph: 'Because...',
          model: 'Dividing both sides of an equation by the same number keeps it balanced, and the right side is the whole of −Ax + C. If you only divide part of a side, the two sides are no longer equal, so the line changes.',
          steps: ['An equation is a balance: do the same to both whole sides.', 'The right side is −Ax + C, all of it.', 'Divide only part → the sides are not equal any more.'] }
      ] },
    { k: 'text', min: 2, title: 'Slope-intercept → standard', points: ['Example: *y = (2/3)x − 1*.', '1) Fraction? Multiply every term by 3: 3y = 2x − 3.', '2) Move the x-term left: −2x + 3y = −3.', '3) A is negative, so multiply every term by −1: *2x − 3y = 3*.'] },
    { k: 'ex', min: 2, kick: 'Example 1 of 3 · Slope-intercept → standard', title: 'Make A positive', q: 'Write *y = 4x − 3* in standard form.',
      steps: [
        { t: 'Move the x-term to the left: subtract 4x.', eq: '[[−4]]x + y = [[−3]]' },
        { t: 'A is negative, so multiply every term by −1.', eq: '[[4]]x − y = [[3]]' },
        { t: 'Done: A = 4 is positive and every number is whole.' }
      ] },
    { k: 'ex', min: 2, kick: 'Example 2 of 3 · Slope-intercept → standard', title: 'Clear the fraction', q: 'Write *y = −(3/4)x + 2* in standard form.',
      steps: [
        { t: 'Multiply every term by 4 to clear the fraction.', eq: '4y = [[−3]]x + [[8]]' },
        { t: 'Add 3x to both sides.', eq: '[[3]]x + 4y = 8' },
        { t: 'A = 3 is positive: done.' }
      ] },
    { k: 'ex', min: 2, kick: 'Example 3 of 3 · Slope-intercept → standard', title: 'All three moves', q: 'Write *y = (2/5)x − 1* in standard form.',
      steps: [
        { t: 'Multiply every term by 5.', eq: '5y = [[2]]x − [[5]]' },
        { t: 'Subtract 2x from both sides.', eq: '[[−2]]x + 5y = [[−5]]' },
        { t: 'A is negative: multiply every term by −1.', eq: '2x − 5y = [[5]]' }
      ] },
    { k: 'poll', min: 5, id: 'bs1', q: 'Which is *y = −3x + 4* in standard form?', opts: ['3x + y = 4', '−3x − y = 4', 'y + 4 = 3x', '3x − y = −4'], ans: 0,
      why: 'Add 3x to both sides: 3x + y = 4. A = 3 is positive: done.',
      help: 'Get the x-term onto the left side with y.',
      more: [
        { k: 'poll', q: 'Which is *y = (1/2)x + 3* in standard form?', opts: ['x − 2y = −6', 'x + 2y = 6', '2x − y = 3', 'x − 2y = 6'], ans: 0, why: '2y = x + 6 → −x + 2y = 6 → x − 2y = −6.',
          steps: ['Multiply every term by 2: 2y = x + 6.', 'Move x left: −x + 2y = 6.', 'Make A positive (× −1): *x − 2y = −6*.'] },
        { k: 'number', q: 'Write *y = (3/4)x − 2* as Ax + By = C with A positive and whole numbers. What is C?', ans: 8, hint: 'Multiply by 4, move 3x left, then fix the sign.', why: '4y = 3x − 8 → −3x + 4y = −8 → 3x − 4y = 8.',
          steps: ['× 4: 4y = 3x − 8.', 'Move 3x: −3x + 4y = −8.', '× −1: 3x − 4y = *8*.'] },
        { k: 'number', q: 'Write *y = −(2/5)x + 1* in standard form with A positive. What is B?', ans: 5, hint: 'Multiply every term by 5 first.', why: '5y = −2x + 5 → 2x + 5y = 5.',
          steps: ['× 5: 5y = −2x + 5.', 'Add 2x: 2x + 5y = 5.', 'A = 2 is positive, so B = *5*.'] }
      ] },
    { k: 'text', min: 2, title: 'Graph it', points: ['Get it into y = mx + b.', 'Plot the y-intercept *(0, b)*.', 'Slope as rise over run: for 2/3, go up 2 and right 3. Negative: go down.', 'Plot the second point and join them. Check a third point.'] },
    { k: 'ex', min: 2, kick: 'Example 1 of 3 · Graph a line', title: 'Start at b', q: 'Graph *y = 2x − 3*.',
      fig: { kind: 'graph', x: [-3, 5], y: [-5, 6], lines: [] },
      steps: [
        { t: 'Plot b: the y-intercept is [[−3]], so [[~(0, −3)]].', fig: { kind: 'graph', x: [-3, 5], y: [-5, 6], lines: [{ pts: [[0, -3]], dots: true, only: true }], labels: [[0, -3, '(0, −3)']] } },
        { t: 'Slope 2 = 2/1: up [[2]], right [[1]].', fig: { kind: 'graph', x: [-3, 5], y: [-5, 6], lines: [{ pts: [[0, -3], [1, -1]], dots: true, only: true }], labels: [[0, -3, '(0, −3)'], [1, -1, '(1, −1)']], arrows: [[0, -3, 0, -1, 'up 2'], [0, -1, 1, -1, 'right 1', 1]] } },
        { t: 'Do it again to get a third point: [[(2, 1)]].', fig: { kind: 'graph', x: [-3, 5], y: [-5, 6], lines: [{ pts: [[0, -3], [1, -1], [2, 1]], dots: true, only: true }], labels: [[0, -3, '(0, −3)'], [2, 1, '(2, 1)']], arrows: [[0, -3, 0, -1, 'up 2'], [0, -1, 1, -1, ''], [1, -1, 1, 1, 'up 2'], [1, 1, 2, 1, '']] } },
        { t: 'Join the points with a ruler.', fig: { kind: 'graph', x: [-3, 5], y: [-5, 6], lines: [{ pts: [[-1, -5], [4.5, 6]] }, { pts: [[0, -3], [1, -1], [2, 1]], dots: true, only: true }], labels: [[0, -3, '(0, −3)'], [2, 1, '(2, 1)']] } }
      ] },
    { k: 'ex', min: 2, kick: 'Example 2 of 3 · Graph a line', title: 'Use the intercepts', q: 'Graph *3x + 2y = 6*.',
      fig: { kind: 'graph', x: [-2, 4], y: [-2, 5], lines: [] },
      steps: [
        { t: 'Put x = 0: 2y = 6, so y = [[3]]. Plot [[~(0, 3)]].', fig: { kind: 'graph', x: [-2, 4], y: [-2, 5], lines: [{ pts: [[0, 3]], dots: true, only: true }], labels: [[0, 3, '(0, 3)']] } },
        { t: 'Put y = 0: 3x = 6, so x = [[2]]. Plot [[~(2, 0)]].', fig: { kind: 'graph', x: [-2, 4], y: [-2, 5], lines: [{ pts: [[0, 3], [2, 0]], dots: true, only: true }], labels: [[0, 3, '(0, 3)'], [2, 0, '(2, 0)']] } },
        { t: 'Join them. Check the slope: down 3, right 2 is [[−3/2]], and y = −(3/2)x + 3 ✓', fig: { kind: 'graph', x: [-2, 4], y: [-2, 5], lines: [{ pts: [[-1.33, 5], [3.33, -2]] }, { pts: [[0, 3], [2, 0]], dots: true, only: true }], labels: [[0, 3, '(0, 3)'], [2, 0, '(2, 0)']], arrows: [[0, 3, 0, 0, 'down 3'], [0, 0, 2, 0, 'right 2']] } }
      ] },
    { k: 'ex', min: 2, kick: 'Example 3 of 3 · Graph a line', title: 'A fraction slope', q: 'Graph *y = −(1/3)x + 2*.',
      fig: { kind: 'graph', x: [-2, 7], y: [-2, 4], lines: [] },
      steps: [
        { t: 'Plot b: [[(0, 2)]].', fig: { kind: 'graph', x: [-2, 7], y: [-2, 4], lines: [{ pts: [[0, 2]], dots: true, only: true }], labels: [[0, 2, '(0, 2)']] } },
        { t: 'Slope −1/3: down [[1]], right [[3]], to [[(3, 1)]].', fig: { kind: 'graph', x: [-2, 7], y: [-2, 4], lines: [{ pts: [[0, 2], [3, 1]], dots: true, only: true }], labels: [[0, 2, '(0, 2)'], [3, 1, '(3, 1)']], arrows: [[0, 2, 0, 1, 'down 1'], [0, 1, 3, 1, 'right 3']] } },
        { t: 'Again to [[(6, 0)]], then join.', fig: { kind: 'graph', x: [-2, 7], y: [-2, 4], lines: [{ pts: [[-2, 2.67], [7, -0.33]] }, { pts: [[0, 2], [3, 1], [6, 0]], dots: true, only: true }], labels: [[0, 2, '(0, 2)'], [3, 1, '(3, 1)'], [6, 0, '(6, 0)']] } }
      ] },
    { k: 'poll', min: 5, id: 'gr1', q: 'Which graph shows *2x + y = 3*?', fig: { kind: 'graph', x: [-4, 4], y: [-4, 6], lines: [{ pts: [[-1, 5], [3, -3]] }, { pts: [[0, 3], [1, 1]], dots: true, only: true }] },
      opts: ['This one: crosses at (0, 3) and goes down 2 for every 1 right', 'No: 2x + y = 3 crosses at (0, 2)', 'No: its slope is +2, so it goes uphill', 'No: it should cross the x-axis at 3'], ans: 0,
      why: 'y = −2x + 3: y-intercept 3, slope −2. The graph crosses at (0, 3) and goes down 2, right 1 to (1, 1).',
      help: 'Change it to y = mx + b first.',
      more: [
        { k: 'number', q: 'The line *y = (1/3)x − 2* starts at (0, −2). Using the slope, what is y at *x = 3*?', ans: -1, hint: 'Up 1, right 3.', why: '−2 + 1 = −1.',
          steps: ['Slope 1/3: up 1, right 3.', 'From (0, −2) to (3, −1).', 'y = *−1*.'] },
        { k: 'number', q: 'Where does *3x + 4y = 12* cross the *x-axis*? Give the x-value.', ans: 4, hint: 'On the x-axis, y = 0.', why: '3x = 12, x = 4.',
          steps: ['On the x-axis y = 0.', '3x + 0 = 12.', 'x = *4*: the point (4, 0).'] },
        { k: 'poll', q: 'Which is the fastest way to graph *5x + 2y = 10*?', opts: ['Find both intercepts: (0, 5) and (2, 0), then join them', 'Make a table with 20 values', 'Guess the slope', 'Only use the y-intercept'], ans: 0, why: 'Standard form gives the intercepts fast: x = 0 → y = 5; y = 0 → x = 2.',
          steps: ['x = 0: 2y = 10, y = 5 → (0, 5).', 'y = 0: 5x = 10, x = 2 → (2, 0).', 'Two points are enough: join them.'] }
      ] },
    { k: 'conf', min: 1, id: 'conf', q: 'Changing forms and graphing: how do you feel?' },
    { k: 'play', min: 10, title: 'Practise: Unit 2 Review', steps: ['Open the *Unit 2 Review*.', 'Under *Convert forms*, do both skills.', 'Then *Graph a line* under Represent.', 'Stuck? Guided practice first, or the Khan Academy video on the Learn tab.'], aim: 'Done when both Convert skills are Developed.', minutes: 9 },
    { k: 'exit', min: 4, id: 'exit', q: 'Write *4x − 2y = 6* in slope-intercept form, then write *y = (1/3)x + 2* in standard form. Show each step.', ph: 'First: ... Second: ...',
      model: '4x − 2y = 6 → −2y = −4x + 6 → divide every term by −2: y = 2x − 3. y = (1/3)x + 2 → × 3: 3y = x + 6 → −x + 3y = 6 → × −1: x − 3y = −6.' },
    { k: 'end', title: 'Same line, new clothes.', next: 'Next: *Review 3, Tell the Whole Story*. Words, tables, graphs, equations and inequalities.' }
  ]
});
