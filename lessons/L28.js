SFA_LESSON({
  id: 'L28', n: 21.4, label: 'Review 4', title: 'Find the Start',
  game: { title: 'Unit 2 Review', file: 'review-u2.html' },
  big: 'b is where the line crosses the y-axis: the value of y when x = 0. If you cannot see it, work it out: find m, put ONE point into y = mx + b, and solve, so b = y − mx. Then check with a second point.',
  slides: [
    { k: 'title', min: 1, kicker: 'Unit 2 Review · 4 of 4', title: 'Find the Start', sub: 'Every line has a start, b. Sometimes you can read it. Today you learn to work it out when you cannot.', art: '🎯' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Say what b means on a graph, in a table and in a story', 'Find b from the slope and one point', 'Find b from two points, a table or a graph', 'Spot the three most common b mistakes'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'You walk into a film 20 minutes late. How do you work out what you missed?', opts: ['Ask the person next to me', 'Work backwards from what is happening now', 'Look it up on my phone', 'Pretend I know', 'Leave and start again'] },
    // retrieval warm-up: the three small skills every "find b" problem uses (retr: true marks them for the planner)
    { k: 'number', min: 1, id: 'r1', retr: true, q: '*Warm-up 1 of 3.* Find the slope through *(1, 4)* and *(3, 10)*.', ans: 3,
      hint: 'Top: 10 − 4. Bottom: 3 − 1.', why: '(10 − 4) ÷ (3 − 1) = 6 ÷ 2 = 3.', help: 'Change in y goes on top. Change in x goes on the bottom.' },
    { k: 'number', min: 1, id: 'r2', retr: true, q: '*Warm-up 2 of 3.* Solve *11 = 6 + b*. What is b?', ans: 5,
      hint: 'Subtract 6 from both sides.', why: 'b = 11 − 6 = 5. Today every problem ends with a step like this.', help: 'What do you add to 6 to make 11?' },
    { k: 'number', min: 1, id: 'r3', retr: true, q: '*Warm-up 3 of 3.* What is *−3 × (−2)*?', ans: 6,
      hint: 'A negative times a negative is positive.', why: '−3 × (−2) = +6.', help: '3 × 2 is 6. Now decide the sign.' },
    { k: 'text', min: 2, title: 'What b is', points: ['In *y = mx + b*, b is the *y-intercept*: where the line crosses the y-axis.', 'It is the value of y when *x = 0*: the start.', 'Table: the y next to x = 0. Graph: the crossing point (0, b). Story: the starting amount.', 'If x = 0 is not there, you *work backwards*. That is today.'] },
    { k: 'text', min: 2, title: 'Slope and one point → b', points: ['Example: slope *3* through *(2, 11)*.', '1) Put the point into y = mx + b: 11 = 3(2) + b.', '2) Multiply: 11 = 6 + b.', '3) Undo the 6: b = 11 − 6 = *5*. So y = 3x + 5.', 'Shortcut: *b = y − mx*.'], note: 'Check: 3(2) + 5 = 11 ✓. Always check with the point.' },
    { k: 'ex', min: 2, kick: 'Example 1 of 3 · Slope and a point', title: 'Walk back to x = 0', q: 'A line has slope *2* and goes through *(3, 4)*. Find b.',
      fig: { kind: 'graph', x: [-2, 5], y: [-3, 6], lines: [{ pts: [[3, 4]], dots: true, only: true }], labels: [[3, 4, '(3, 4)']] },
      steps: [
        { t: 'Put the point into y = mx + b.', eq: '[[4]] = 2([[3]]) + b' },
        { t: 'Multiply.', eq: '4 = [[6]] + b' },
        { t: 'Undo the 6: b = 4 − 6 = [[~−2]]. On the graph: 3 steps back, down 2 each time.', eq: 'b = [[−2]]', fig: { kind: 'graph', x: [-2, 5], y: [-3, 6], lines: [{ pts: [[-0.5, -3], [4, 6]] }, { pts: [[3, 4], [0, -2]], dots: true, only: true }], labels: [[3, 4, '(3, 4)'], [0, -2, '(0, −2)']], arrows: [[3, 4, 0, 4, 'back 3', 1], [0, 4, 0, -2, 'down 6']] } },
        { t: 'Check: 2(3) − 2 = 4 ✓. The equation is y = [[2]]x − [[2]].' }
      ] },
    { k: 'ex', min: 2, kick: 'Example 2 of 3 · Slope and a point', title: 'Negative times negative', q: 'A line has slope *−3* and goes through *(−2, 7)*. Find b.',
      steps: [
        { t: 'Put the point in.', eq: '[[7]] = −3([[−2]]) + b' },
        { t: '−3 × −2 = [[~+6]].', eq: '7 = [[6]] + b' },
        { t: 'b = 7 − 6 = [[1]].', eq: 'y = −3x + [[~1]]' },
        { t: 'Check: −3(−2) + 1 = 6 + 1 = 7 ✓' }
      ] },
    // we do: a faded example. The class does every move (pairs, then cold call) before the question on their own
    { k: 'ex', min: 2, wedo: true, kick: 'We do · Finish it together', title: 'A fraction slope', q: 'A line has slope *1/2* and goes through *(4, 1)*. Find b.',
      steps: [
        { t: 'Your turn: put the point (4, 1) into y = (1/2)x + b.', eq: '[[1]] = (1/2)([[4]]) + b' },
        { t: 'Multiply: half of 4.', eq: '1 = [[2]] + b' },
        { t: 'Undo it to get b alone.', eq: 'b = [[−1]]     so y = (1/2)x − [[1]]' }
      ] },
    { k: 'number', min: 4, id: 'pt1', q: 'A line has slope *−2* and goes through *(3, 4)*. What is *b*?', ans: 10,
      hint: '4 = −2(3) + b. What is −2 × 3?', why: '4 = −6 + b, so b = 4 + 6 = 10. y = −2x + 10.',
      help: 'Put x = 3 and y = 4 into y = −2x + b.',
      more: [
        { k: 'number', q: 'Slope *4* through *(−1, −3)*. What is b?', ans: 1, hint: '−3 = 4(−1) + b.', why: '−3 = −4 + b, so b = 1.',
          steps: ['Put the point in: −3 = 4(−1) + b.', '4 × (−1) = −4, so −3 = −4 + b.', 'Add 4 to both sides: b = *1*.'] },
        { k: 'number', q: 'Slope *1/2* through *(4, 7)*. What is b?', ans: 5, hint: '(1/2) × 4 = 2.', why: '7 = 2 + b, so b = 5.',
          steps: ['7 = (1/2)(4) + b.', '(1/2)(4) = 2, so 7 = 2 + b.', 'b = 7 − 2 = *5*.'] },
        { k: 'number', q: 'Slope *−3* through *(−2, 1)*. What is b?', ans: -5, hint: '−3 × −2 is positive.', why: '1 = 6 + b, so b = −5.',
          steps: ['1 = −3(−2) + b.', 'Negative × negative: −3 × −2 = 6. So 1 = 6 + b.', 'b = 1 − 6 = *−5*.'] }
      ] },
    { k: 'poll', min: 3, id: 'slip', q: 'A line has slope *3* and goes through *(2, 5)*. Doug writes *y = 3x + 5*. What went wrong?',
      opts: ['Nothing', 'He used the point\'s y as b. b = 5 − 6 = −1, so y = 3x − 1', 'The slope should be 5', 'b should be 2, the x of the point'], ans: 1,
      why: '5 is the y-value at x = 2, not at x = 0. 5 = 3(2) + b → b = −1. Check Doug\'s: 3(2) + 5 = 11, not 5 ✗.',
      help: 'Check his equation: put x = 2 in. Do you get 5?',
      more: [
        { k: 'poll', q: 'Slope *−2* through *(4, 1)*. Marcus writes 1 = −8 + b, so *b = −7*. What went wrong?', opts: ['Nothing', 'To undo −8 you add 8: b = 1 + 8 = 9', 'He should multiply 1 by 4', 'The slope should be +2'], ans: 1, why: '1 = −8 + b. Add 8 to both sides: b = 9.',
          steps: ['1 = −2(4) + b = −8 + b.', 'Undo −8 by adding 8 to both sides.', 'b = *9*. Check: −2(4) + 9 = 1 ✓.'] },
        { k: 'poll', q: 'A line crosses the axes at *(0, 6)* and *(3, 0)*. Lena says b = 3. Is she right?', opts: ['Yes', 'No: b is where it crosses the y-axis, (0, 6), so b = 6', 'No: b = 0', 'No: b = 9'], ans: 1, why: 'b is the y-intercept: the point with x = 0. (3, 0) is the x-intercept.',
          steps: ['b lives on the *y*-axis, where x = 0.', '(0, 6) has x = 0.', 'So b = *6*. (3, 0) is the x-intercept.'] },
        { k: 'open', q: 'Explain how you can check a value of b once you have found it.', ph: 'I can check by...',
          model: 'Put the point back into y = mx + b with my m and b. If it gives the right y-value, b is right. Even better, check a second point too.',
          steps: ['Write the full equation y = mx + b.', 'Put in the x of a point you know.', 'You should get its y. Try a second point too.'] }
      ] },
    { k: 'text', min: 2, title: 'Two points → b', points: ['Example: *(2, 7)* and *(5, 16)*.', '1) Slope first: (16 − 7) ÷ (5 − 2) = 9 ÷ 3 = 3.', '2) Put either point in: 7 = 3(2) + b → b = 1.', '3) Check with the other point: 3(5) + 1 = 16 ✓.', 'Equation: *y = 3x + 1*.'] },
    { k: 'ex', min: 2, kick: 'Example 1 of 2 · Two points', title: 'Slope, then b', q: 'A line goes through *(1, 5)* and *(3, 9)*. Find b.',
      fig: { kind: 'graph', x: [-1, 4], y: [-1, 10], lines: [{ pts: [[1, 5], [3, 9]], dots: true, only: true }], labels: [[1, 5, '(1, 5)'], [3, 9, '(3, 9)', 'l']] },
      steps: [
        { t: 'Slope first.', eq: 'm = (9 − 5) ÷ (3 − 1) = [[4]] ÷ [[2]] = [[2]]', fig: { kind: 'graph', x: [-1, 4], y: [-1, 10], lines: [{ pts: [[1, 5], [3, 9]], dots: true, only: true }], labels: [[1, 5, '(1, 5)'], [3, 9, '(3, 9)', 'l']], arrows: [[1, 5, 3, 5, 'right 2'], [3, 5, 3, 9, 'up 4']] } },
        { t: 'Put one point in: (1, 5).', eq: '5 = 2(1) + b  →  b = [[3]]' },
        { t: 'Check with the other point.', eq: '2(3) + 3 = 9 ✓', fig: { kind: 'graph', x: [-1, 4], y: [-1, 10], lines: [{ pts: [[-1, 1], [3.5, 10]] }, { pts: [[1, 5], [3, 9], [0, 3]], dots: true, only: true }], labels: [[1, 5, '(1, 5)'], [3, 9, '(3, 9)', 'l'], [0, 3, '(0, 3)', 'l']] } },
        { t: 'The equation is y = [[~2]]x + [[~3]].' }
      ] },
    { k: 'ex', min: 2, wedo: true, kick: 'We do · Finish it together', title: 'Going down', q: 'A line goes through *(−2, 1)* and *(2, −7)*. Find b.',
      steps: [
        { t: 'Slope first.', eq: 'm = (−7 − 1) ÷ (2 − (−2)) = [[−8]] ÷ [[4]] = [[−2]]' },
        { t: 'Use (−2, 1).', eq: '1 = −2(−2) + b  →  1 = [[4]] + b' },
        { t: 'b = [[−3]].', eq: 'y = −2x − [[~3]]' },
        { t: 'Check with (2, −7).', eq: '−2(2) − 3 = −7 ✓' }
      ] },
    { k: 'number', min: 4, id: 'two', q: 'A line goes through *(1, 2)* and *(4, 11)*. What is *b*?', ans: -1,
      hint: 'Slope first: (11 − 2) ÷ (4 − 1).', why: 'm = 9 ÷ 3 = 3. Then 2 = 3(1) + b, so b = −1. y = 3x − 1.',
      help: 'You need m before you can find b. What is the slope?',
      more: [
        { k: 'number', q: 'A line goes through *(−1, 8)* and *(3, −4)*. What is b?', ans: 5, hint: 'm = (−4 − 8) ÷ (3 − (−1)).', why: 'm = −12 ÷ 4 = −3. 8 = −3(−1) + b = 3 + b, so b = 5.',
          steps: ['m = −12 ÷ 4 = −3.', 'Use (−1, 8): 8 = −3(−1) + b = 3 + b.', 'b = *5*. Check (3, −4): −9 + 5 = −4 ✓.'] },
        { k: 'number', q: 'A line goes through *(2, 4)* and *(6, 6)*. What is b?', ans: 3, hint: 'The slope is a fraction.', why: 'm = 2 ÷ 4 = 1/2. 4 = 1 + b, so b = 3.',
          steps: ['m = (6 − 4) ÷ (6 − 2) = 2/4 = 1/2.', 'Use (2, 4): 4 = (1/2)(2) + b = 1 + b.', 'b = *3*.'] },
        { k: 'open', q: 'Does it matter which of the two points you use to find b? Explain.', ph: 'It does / does not matter because...',
          model: 'It does not matter. Both points are on the same line, so both fit y = mx + b with the same m and b. Use the one with easier numbers, then check with the other one.',
          steps: ['Both points are on the line.', 'So both make y = mx + b true with the same b.', 'Pick the easier one; check with the other.'] }
      ] },
    { k: 'text', min: 2, title: 'Tables and graphs with no x = 0', points: ['*Table*: find the slope, then step back to x = 0 (each step back, subtract the slope). Or put a row in: b = y − mx.', '*Graph*: if the crossing is between gridlines, do not guess.', 'Pick two points on exact grid corners, find m, then b = y − mx.', 'b can be a fraction, like 1.5.'] },
    { k: 'ex', min: 2, kick: 'Example 1 of 2 · Tables', title: 'Step back to x = 0', q: 'This table is linear. Find b.',
      fig: { kind: 'table', head: ['x', 'y'], rows: [[4, 9], [5, 11], [6, 13], [7, 15]] },
      steps: [
        { t: 'Slope: x goes up 1, y goes up [[2]], so m = [[~2]].' },
        { t: 'Step back to x = 0, taking away 2 each time.', fig: { kind: 'table', head: ['x', 'y'], rows: [[0, 1], [1, 3], [2, 5], [3, 7], [4, 9], [5, 11]], hi: [0] } },
        { t: 'b = [[1]]. Or work it out: 9 = 2(4) + b, so b = [[~1]] ✓', eq: 'y = 2x + [[~1]]' }
      ] },
    { k: 'ex', min: 2, opt: true, kick: 'Example 2 of 2 · Graphs', title: 'Between the gridlines', q: 'Find b for this line.',
      fig: { kind: 'graph', x: [-2, 5], y: [-1, 4], lines: [{ pts: [[-2, -0.5], [5, 3]] }] },
      steps: [
        { t: 'It crosses the y-axis between gridlines. Do not guess. Find two grid points: *(1, 1)* and *(3, 2)*.', fig: { kind: 'graph', x: [-2, 5], y: [-1, 4], lines: [{ pts: [[-2, -0.5], [5, 3]] }, { pts: [[1, 1], [3, 2]], dots: true, only: true }], labels: [[1, 1, '(1, 1)'], [3, 2, '(3, 2)', 'l']] } },
        { t: 'Right [[2]], up [[1]], so m = [[1/2]].', fig: { kind: 'graph', x: [-2, 5], y: [-1, 4], lines: [{ pts: [[-2, -0.5], [5, 3]] }, { pts: [[1, 1], [3, 2]], dots: true, only: true }], labels: [[1, 1, '(1, 1)'], [3, 2, '(3, 2)', 'l']], arrows: [[1, 1, 3, 1, 'right 2'], [3, 1, 3, 2, 'up 1']] } },
        { t: 'Put (1, 1) in: 1 = (1/2)(1) + b, so b = [[0.5]].', eq: 'y = (1/2)x + [[~0.5]]', fig: { kind: 'graph', x: [-2, 5], y: [-1, 4], lines: [{ pts: [[-2, -0.5], [5, 3]] }, { pts: [[1, 1], [3, 2], [0, 0.5]], dots: true, only: true }], labels: [[1, 1, '(1, 1)'], [3, 2, '(3, 2)', 'l'], [0, 0.5, '(0, 0.5)', 'l']] } }
      ] },
    { k: 'number', min: 4, id: 'tab', q: 'This table is linear. What is *b*, the value of y when x = 0?', fig: { kind: 'table', head: ['x', 'y'], rows: [[3, 11], [4, 13], [5, 15], [6, 17]] }, ans: 5,
      hint: 'y goes up 2 for each 1 of x. Step back 3 times from (3, 11).', why: 'm = 2. 11 = 2(3) + b, so b = 5. Or step back: 11 → 9 → 7 → 5.',
      help: 'What is the slope? Then: how far is x = 3 from x = 0?',
      more: [
        { k: 'number', q: 'Table x: 2, 4, 6 and y: 1, 7, 13. What is b?', ans: -5, hint: 'y goes up 6 while x goes up 2.', why: 'm = 3. 1 = 3(2) + b, so b = −5.',
          steps: ['m = 6 ÷ 2 = 3.', 'Use (2, 1): 1 = 3(2) + b = 6 + b.', 'b = *−5*.'] },
        { k: 'number', q: 'Table x: 5, 10, 15 and y: 30, 20, 10. What is b?', ans: 40, hint: 'm = −10 ÷ 5.', why: 'm = −2. 30 = −2(5) + b = −10 + b, so b = 40.',
          steps: ['m = −10 ÷ 5 = −2.', '30 = −2(5) + b = −10 + b.', 'b = 30 + 10 = *40*.'] },
        { k: 'number', q: 'This line crosses the y-axis between gridlines. It goes through *(1, 2)* and *(3, 3)*. What is b? A decimal is fine.', fig: { kind: 'graph', x: [-2, 6], y: [-1, 5], lines: [{ pts: [[-2, 0.5], [6, 4.5]] }, { pts: [[1, 2], [3, 3]], dots: true, only: true }] }, ans: 1.5, tol: 0.01, hint: 'm = 1/2. Then 2 = (1/2)(1) + b.', why: '2 = 0.5 + b, so b = 1.5.',
          steps: ['m = (3 − 2) ÷ (3 − 1) = 1/2.', '2 = (1/2)(1) + b = 0.5 + b.', 'b = *1.5*: the line crosses at (0, 1.5).'] }
      ] },
    { k: 'ex', min: 2, wedo: true, kick: 'We do · Finish it together', title: 'The joining fee', q: 'A gym costs *$95* for 3 months and *$175* for 7 months. What is the joining fee?',
      steps: [
        { t: 'The points are (3, 95) and (7, 175). Monthly price first.', eq: 'm = (175 − 95) ÷ (7 − 3) = [[80]] ÷ [[4]] = [[20]]' },
        { t: 'Put one point in.', eq: '95 = 20(3) + b  →  95 = [[60]] + b' },
        { t: 'b = [[35]]: the joining fee is $[[~35]], the cost at 0 months.', eq: 'y = 20x + [[~35]]' }
      ] },
    { k: 'est', min: 4, id: 'story', lo: 0, hi: 11, step: 1, near: 2, q: 'A taxi ride of *2 km* costs *$11*. A ride of *6 km* costs *$23*. *Estimate* the starting fee in dollars first, then work out b exactly.', ans: 5,
      hint: 'The points are (2, 11) and (6, 23). Find the price per km first.', why: 'm = 12 ÷ 4 = $3 per km. 11 = 3(2) + b, so b = $5.',
      help: 'Write the two rides as points (km, cost).',
      more: [
        { k: 'number', q: 'A candle is *22 cm* after 2 hours and *16 cm* after 5 hours. How tall was it at the start?', ans: 26, hint: 'm = (16 − 22) ÷ (5 − 2).', why: 'm = −2 cm per hour. 22 = −2(2) + b, so b = 26 cm.',
          steps: ['m = −6 ÷ 3 = −2 cm per hour.', '22 = −2(2) + b = −4 + b.', 'b = *26* cm: its height at 0 hours.'] },
        { k: 'number', q: 'A phone plan costs *$38* for 4 GB and *$62* for 10 GB. What is the fixed monthly fee?', ans: 22, hint: 'Price per GB first.', why: 'm = 24 ÷ 6 = $4 per GB. 38 = 4(4) + b, so b = $22.',
          steps: ['m = (62 − 38) ÷ (10 − 4) = 24 ÷ 6 = 4.', '38 = 4(4) + b = 16 + b.', 'b = *$22*.'] },
        { k: 'open', q: 'In the taxi problem, b = 5. Explain what the 5 means.', ph: 'The 5 means...',
          model: 'The $5 is the cost of a 0 km ride: the fee you pay just for getting in, before you travel any distance.',
          steps: ['b is the value when x = 0.', 'x is kilometres, so 0 km.', '*$5 is the cost before you travel at all.*'] }
      ] },
    { k: 'odd', min: 2, id: 'odd1', items: ['y = 2x + 5', 'y = −x + 5', 'y = 2x', 'The line through (0, 5) and (1, 8)'],
      why: ['It is the only one that goes through (1, 7)', 'It is the only one that goes downhill', 'It is the only one that starts at 0 (b = 0)', 'It is the only one with slope 3'],
      note: 'Three of them start at b = 5. To find a start you cannot see, use the slope and one point: b = y − mx.' },
    { k: 'cross', min: 2, opt: true, id: 'check', q: 'Cross out every equation that does *not* go through both *(2, 3)* and *(4, 7)*.', opts: ['y = 2x − 1', 'y = 2x + 3', 'y = 4x − 5', 'y = 3x + 2'], ans: 0,
      reasons: ['It misses (2, 3)', 'It fits (2, 3) but misses (4, 7)'], because: [0, 0, 1, 0],
      why: 'm = 4 ÷ 2 = 2. 3 = 2(2) + b → b = −1. Check (4, 7): 2(4) − 1 = 7 ✓.',
      help: 'Test each option with both points.' },
    { k: 'conf', min: 1, id: 'conf', q: 'Finding b: how do you feel now?' },
    { k: 'play', min: 8, title: 'Practise: Unit 2 Review', steps: ['Open the *Unit 2 Review*.', 'Under *Represent*, do *Find b and write the equation*.', 'Guided practice first, then *On your own*.', 'Stuck? The Khan Academy videos are on the Learn tab.'], aim: 'Done when Find b is Developed.', minutes: 8 },
    { k: 'exit', min: 4, id: 'exit', q: 'A line goes through *(1, 5)* and *(4, 14)*. Find m, find b, write the equation, and check it with the second point.', ph: 'm = ... b = ... y = ... Check: ...',
      model: 'm = (14 − 5) ÷ (4 − 1) = 9 ÷ 3 = 3. 5 = 3(1) + b, so b = 2. y = 3x + 2. Check (4, 14): 3(4) + 2 = 14 ✓.' },
    { k: 'end', title: 'You found the start.', next: 'Keep practising in the *Unit 2 Review* until every skill is Developed. The formative is on Tuesday 24 November.' }
  ]
});
