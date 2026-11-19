SFA_LESSON({
  id: 'L25', n: 21.1, label: 'Review 1', title: 'Slope Four Ways',
  game: { title: 'Unit 2 Review', file: 'review-u2.html' },
  big: 'Slope is change in y over change in x, every time. Points: subtract in the same order. Table: check the x-step. Graph: rise over run. Equation: get y alone, then it is the number with x.',
  slides: [
    { k: 'title', min: 1, kicker: 'Unit 2 Review · 1 of 4', title: 'Slope Four Ways', sub: 'Two points, a table, a graph, an equation. Four ways in, one answer out: how much y changes for every 1 of x.', art: '📐' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Find slope from two points, in the same order top and bottom', 'Find slope from a table, even when x goes up by more than 1', 'Read rise over run from a graph', 'Get y alone to find the slope of any equation'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'Which is the steepest thing you have walked up?', opts: ['Stairs at school', 'A hill or a mountain trail', 'A slide (the wrong way)', 'A wheelchair ramp', 'Escalator (walking counts)'] },
    // retrieval warm-up: three quick questions on the number skills today's slopes need (retr: true marks them for the planner)
    { k: 'number', min: 1, id: 'r1', retr: true, q: '*Warm-up 1 of 3.* What is *3 − (−2)*?', ans: 5,
      hint: 'Subtracting a negative is the same as adding: 3 + 2.', why: '3 − (−2) = 3 + 2 = 5. You need this today when a point has a negative number.', help: 'Two minus signs next to each other make a plus.' },
    { k: 'number', min: 1, id: 'r2', retr: true, q: '*Warm-up 2 of 3.* What is *−8 ÷ 4*?', ans: -2,
      hint: 'A negative divided by a positive is negative.', why: '−8 ÷ 4 = −2.', help: '8 ÷ 4 is 2. Now decide the sign: is one of the numbers negative?' },
    { k: 'number', min: 1, id: 'r3', retr: true, q: '*Warm-up 3 of 3.* The rule is *y = 3x − 2*. What is y when *x = 4*?', ans: 10,
      hint: '3 × 4 first, then subtract 2.', why: '3(4) − 2 = 12 − 2 = 10.', help: 'Put 4 where x is: 3 × 4 − 2.' },
    { k: 'text', min: 2, title: 'One idea, four places', points: ['Slope = *change in y ÷ change in x*.', 'It tells you how much y changes for every *1* that x goes up.', 'Positive: uphill. Negative: downhill. Bigger number: steeper.', 'The formula with two points: *m = (y₂ − y₁) ÷ (x₂ − x₁)*.'],
      note: 'Same order on top and bottom. Point 2 minus point 1, both times.' },

    { k: 'ex', min: 2, kick: 'Example 1 of 3 · Two points', title: 'Up and right', q: 'Find the slope through *(1, 2)* and *(4, 8)*.',
      fig: { kind: 'graph', x: [-1, 6], y: [-1, 10], lines: [{ pts: [[1, 2], [4, 8]], dots: true, only: true }], labels: [[1, 2, '(1, 2)'], [4, 8, '(4, 8)', 'l']] },
      steps: [
        { t: 'Name them: point 1 = (1, 2), point 2 = (4, 8).' },
        { t: 'Change in y: 8 − 2 = [[~6]]. The line goes up [[~6]].', eq: 'y₂ − y₁ = 8 − 2 = [[6]]', fig: { kind: 'graph', x: [-1, 6], y: [-1, 10], lines: [{ pts: [[1, 2], [4, 8]], dots: true, only: true }], labels: [[1, 2, '(1, 2)'], [4, 8, '(4, 8)', 'l']], arrows: [[4, 2, 4, 8, 'up 6']] } },
        { t: 'Change in x: 4 − 1 = [[~3]]. It goes right [[~3]].', eq: 'x₂ − x₁ = 4 − 1 = [[3]]', fig: { kind: 'graph', x: [-1, 6], y: [-1, 10], lines: [{ pts: [[1, 2], [4, 8]], dots: true, only: true }], labels: [[1, 2, '(1, 2)'], [4, 8, '(4, 8)', 'l']], arrows: [[1, 2, 4, 2, 'right 3'], [4, 2, 4, 8, 'up 6']] } },
        { t: 'Divide: m = 6 ÷ 3 = [[~2]]. y goes up [[~2]] for every 1 of x.', eq: 'm = 6/3 = [[2]]', fig: { kind: 'graph', x: [-1, 6], y: [-1, 10], lines: [{ pts: [[-0.5, -1], [5, 10]] }, { pts: [[1, 2], [4, 8]], dots: true, only: true }], labels: [[1, 2, '(1, 2)'], [4, 8, '(4, 8)', 'l']], arrows: [[1, 2, 4, 2, 'right 3'], [4, 2, 4, 8, 'up 6']] } }
      ] },
    { k: 'ex', min: 2, kick: 'Example 2 of 3 · Two points', title: 'Negatives', q: 'Find the slope through *(−2, 5)* and *(3, −5)*.',
      fig: { kind: 'graph', x: [-4, 5], y: [-7, 7], lines: [{ pts: [[-2, 5], [3, -5]], dots: true, only: true }], labels: [[-2, 5, '(−2, 5)'], [3, -5, '(3, −5)', 'l']] },
      steps: [
        { t: 'Point 1 = (−2, 5), point 2 = (3, −5).' },
        { t: 'Change in y: −5 − 5 = [[~−10]]. Down [[~10]].', eq: '−5 − 5 = [[−10]]', fig: { kind: 'graph', x: [-4, 5], y: [-7, 7], lines: [{ pts: [[-2, 5], [3, -5]], dots: true, only: true }], labels: [[-2, 5, '(−2, 5)'], [3, -5, '(3, −5)', 'l']], arrows: [[3, 5, 3, -5, 'down 10']] } },
        { t: 'Change in x: 3 − (−2) = [[~5]]. Subtracting a negative is adding.', eq: '3 − (−2) = [[5]]', fig: { kind: 'graph', x: [-4, 5], y: [-7, 7], lines: [{ pts: [[-2, 5], [3, -5]], dots: true, only: true }], labels: [[-2, 5, '(−2, 5)'], [3, -5, '(3, −5)', 'l']], arrows: [[-2, 5, 3, 5, 'right 5', 1], [3, 5, 3, -5, 'down 10']] } },
        { t: 'm = −10 ÷ 5 = [[~−2]]. Negative: the line goes downhill.', eq: 'm = −10/5 = [[−2]]', fig: { kind: 'graph', x: [-4, 5], y: [-7, 7], lines: [{ pts: [[-3, 7], [4, -7]] }, { pts: [[-2, 5], [3, -5]], dots: true, only: true }], labels: [[-2, 5, '(−2, 5)'], [3, -5, '(3, −5)', 'l']], arrows: [[-2, 5, 3, 5, 'right 5', 1], [3, 5, 3, -5, 'down 10']] } }
      ] },
    // we do: a faded example. The first move is done; the class supplies the rest (pairs, then cold call) before the question on their own
    { k: 'ex', min: 2, wedo: true, kick: 'We do · Finish it together', title: 'A fraction slope', q: 'Find the slope through *(−3, −1)* and *(3, 3)*.',
      steps: [
        { t: 'Point 1 = (−3, −1), point 2 = (3, 3). The change in y is done for you.', eq: '3 − (−1) = 3 + 1 = 4' },
        { t: 'Your turn: the change in x. Point 2 minus point 1.', eq: '[[3]] − ([[−3]]) = [[6]]' },
        { t: 'Divide, then simplify.', eq: 'm = [[4]]/[[6]] = [[2/3]]' },
        { t: 'The other order works too, as long as top and bottom match.', eq: '(−1 − 3) ÷ (−3 − 3) = [[−4]] ÷ [[−6]] = 2/3 ✓' }
      ] },
    { k: 'number', min: 4, id: 'pts1', q: 'Find the slope of the line through *(2, 3)* and *(6, 11)*.', ans: 2,
      hint: 'Top: 11 − 3. Bottom: 6 − 2.', why: '(11 − 3) ÷ (6 − 2) = 8 ÷ 4 = 2.',
      help: 'Label them: point 1 is (2, 3), point 2 is (6, 11). Now do y₂ − y₁.',
      more: [
        { k: 'number', q: 'Find the slope through *(−1, 4)* and *(3, −4)*.', ans: -2, hint: '(−4 − 4) ÷ (3 − (−1)).', why: '−8 ÷ 4 = −2.',
          steps: ['Top: −4 − 4 = −8.', 'Bottom: 3 − (−1) = 3 + 1 = 4.', '−8 ÷ 4 = *−2*. Downhill.'] },
        { k: 'number', q: 'Find the slope through *(−3, −5)* and *(1, −2)*. A fraction is fine.', ans: 0.75, tol: 0.01, hint: 'Subtracting a negative is adding.', why: '(−2 − (−5)) ÷ (1 − (−3)) = 3 ÷ 4.',
          steps: ['Top: −2 − (−5) = −2 + 5 = 3.', 'Bottom: 1 − (−3) = 1 + 3 = 4.', 'm = *3/4* (0.75).'] },
        { k: 'number', q: 'A line has slope *3* and goes through *(1, 2)*. It also goes through *(5, y)*. What is y?', ans: 14, hint: 'x goes up by 4. How much does y go up?', why: 'x changes by 4, so y changes by 3 × 4 = 12: 2 + 12 = 14.',
          steps: ['From x = 1 to x = 5 is a change of 4.', 'Slope 3: y changes by 3 for each 1 of x, so 3 × 4 = 12.', 'y = 2 + 12 = *14*.', 'Check: (14 − 2) ÷ (5 − 1) = 12 ÷ 4 = 3 ✓'] }
      ] },
    { k: 'mistake', min: 3, id: 'oops', q: 'Doug finds the slope through *(1, 7)* and *(4, 1)*. Tap the first line that goes wrong.',
      lines: ['Top, starting with point 1: 7 − 1 = 6', 'Bottom: 4 − 1 = 3', 'Slope = 6 ÷ 3 = 2'], ans: 1, fix: 'Bottom, starting with point 1 too: 1 − 4 = −3, so the slope is 6 ÷ (−3) = −2',
      hint: 'Which point does the top start from? Does the bottom start from the same one?',
      why: 'Top: 7 − 1 is point 1 minus point 2. Bottom: 4 − 1 is point 2 minus point 1. Same order: (1 − 7) ÷ (4 − 1) = −6 ÷ 3 = −2. The line goes downhill.',
      help: 'Which point did he start from on top? Which on the bottom?',
      more: [
        { k: 'poll', q: 'Ana finds the slope through *(5, 2)* and *(1, 10)* as (10 − 2) ÷ (1 − 5). Is she right?', opts: ['Yes: −2', 'No: it should be +2', 'No: she must start with the smaller x', 'Yes, but it equals 2'], ans: 0, why: 'Both top and bottom are point 2 minus point 1. 8 ÷ −4 = −2.',
          steps: ['Top: 10 − 2 is point 2 minus point 1.', 'Bottom: 1 − 5 is point 2 minus point 1. Same order ✓', '8 ÷ (−4) = *−2*.'] },
        { k: 'poll', q: 'Marcus writes the slope through *(2, 5)* and *(6, 7)* as (6 − 2) ÷ (7 − 5) = 2. What is the mistake?', opts: ['None', 'He put change in x on top: slope is change in y over change in x, so 2/4 = 1/2', 'He subtracted in the wrong order', 'He should have added'], ans: 1, why: 'Slope is change in y ÷ change in x: (7 − 5) ÷ (6 − 2) = 2 ÷ 4 = 1/2.',
          steps: ['Change in y: 7 − 5 = 2.', 'Change in x: 6 − 2 = 4.', 'm = 2 ÷ 4 = *1/2*. He had it upside down.'] },
        { k: 'open', q: 'Explain why (y₂ − y₁) ÷ (x₂ − x₁) and (y₁ − y₂) ÷ (x₁ − x₂) give the same slope, but (y₁ − y₂) ÷ (x₂ − x₁) does not.', ph: 'The first two... The third...',
          model: 'The second is the first with top and bottom both multiplied by −1, and a negative over a negative is positive, so nothing changes. The third only flips the top, so the sign of the slope flips.',
          steps: ['y₁ − y₂ = −(y₂ − y₁) and x₁ − x₂ = −(x₂ − x₁).', 'Both flipped: −a ÷ −b = a ÷ b. Same slope.', 'Only the top flipped: −a ÷ b. Opposite sign.'] }
      ] },

    { k: 'text', min: 2, title: 'Slope from a table', points: ['Pick any two rows.', 'Change in y ÷ change in x, between those rows.', 'Look at the x-column first: it does *not* always go up by 1.', 'Every pair of rows gives the same slope if it is linear.'] },
    { k: 'ex', min: 2, opt: true, kick: 'Example 1 of 3 · Tables', title: 'x goes up by 1', q: 'Find the slope of this table.',
      fig: { kind: 'table', head: ['x', 'y'], rows: [[0, 4], [1, 7], [2, 10], [3, 13]] },
      steps: [
        { t: 'Look at the x-column first: it goes up by [[1]].', fig: { kind: 'table', head: ['x', 'y', 'x step'], rows: [[0, 4, ''], [1, 7, '+1'], [2, 10, '+1'], [3, 13, '+1']] } },
        { t: 'y goes up by [[3]] every row.', fig: { kind: 'table', head: ['x', 'y', 'x step', 'y step'], rows: [[0, 4, '', ''], [1, 7, '+1', '+3'], [2, 10, '+1', '+3'], [3, 13, '+1', '+3']] } },
        { t: 'm = 3 ÷ 1 = [[~3]].', eq: 'm = (y step) ÷ (x step) = 3/1 = [[3]]' }
      ] },
    { k: 'ex', min: 2, kick: 'Example 2 of 3 · Tables', title: 'The x-step trap', q: 'Find the slope of this table.',
      fig: { kind: 'table', head: ['x', 'y'], rows: [[2, 11], [4, 7], [6, 3], [8, -1]] },
      steps: [
        { t: 'x goes up by [[2]], not 1.', fig: { kind: 'table', head: ['x', 'y', 'x step'], rows: [[2, 11, ''], [4, 7, '+2'], [6, 3, '+2'], [8, -1, '+2']] } },
        { t: 'y goes [[down]] by [[4]] every row: 7 − 11 = [[~−4]].', fig: { kind: 'table', head: ['x', 'y', 'x step', 'y step'], rows: [[2, 11, '', ''], [4, 7, '+2', '−4'], [6, 3, '+2', '−4'], [8, -1, '+2', '−4']] } },
        { t: 'm = −4 ÷ 2 = [[~−2]].', eq: 'm = −4/2 = [[−2]]' },
        { t: 'The trap: dividing by 1 gives −4. Always check the x-step.' }
      ] },
    { k: 'ex', min: 2, wedo: true, kick: 'We do · Finish it together', title: 'Any two rows', q: 'Find the slope of this table.',
      fig: { kind: 'table', head: ['x', 'y'], rows: [[1, 2], [4, 4], [7, 6]] },
      steps: [
        { t: 'Use rows 1 and 2. The x step is done for you: 4 − 1 = 3.', fig: { kind: 'table', head: ['x', 'y'], rows: [[1, 2], [4, 4], [7, 6]], hi: [0, 1] } },
        { t: 'Your turn: the y step, then the slope.', eq: 'y step: 4 − 2 = [[2]]     m = [[2]]/[[3]]' },
        { t: 'Check with rows 1 and 3: the slope is the same.', eq: '(6 − 2) ÷ (7 − 1) = [[4]]/[[6]] = 2/3 ✓', fig: { kind: 'table', head: ['x', 'y'], rows: [[1, 2], [4, 4], [7, 6]], hi: [0, 2] } }
      ] },
    { k: 'number', min: 4, id: 'tab1', q: 'What is the slope of this table?', fig: { kind: 'table', head: ['x', 'y'], rows: [[0, 5], [2, 11], [4, 17], [6, 23]] }, ans: 3,
      hint: 'y goes up by 6 each row. How much does x go up?', why: 'Each row: y + 6, x + 2. 6 ÷ 2 = 3.',
      help: 'Is the x-step 1? Look again.',
      more: [
        { k: 'number', q: 'Slope of the table x: 1, 4, 7, 10 and y: 20, 14, 8, 2?', ans: -2, hint: 'y changes by −6 while x changes by 3.', why: '−6 ÷ 3 = −2.',
          steps: ['y: 14 − 20 = −6 per row.', 'x: 4 − 1 = 3 per row.', 'm = −6 ÷ 3 = *−2*.'] },
        { k: 'number', q: 'Slope of the table x: −2, 3, 8 and y: 1, 3, 5? A fraction is fine.', ans: 0.4, tol: 0.01, hint: 'x goes up by 5, y by 2.', why: '2 ÷ 5 = 0.4.',
          steps: ['y: 3 − 1 = 2.', 'x: 3 − (−2) = 5.', 'm = *2/5* (0.4).'] },
        { k: 'number', q: 'A linear table has rows *(1, 9)* and *(5, 1)*. What is y when *x = 0*?', ans: 11, hint: 'Find the slope, then step back one x from (1, 9).', why: 'Slope −8 ÷ 4 = −2. Back one step: 9 + 2 = 11.',
          steps: ['Slope: (1 − 9) ÷ (5 − 1) = −8 ÷ 4 = −2.', 'Going back 1 in x undoes −2: add 2.', 'y = 9 + 2 = *11*. That is the y-intercept.'] }
      ] },

    { k: 'text', min: 2, title: 'Slope from a graph', points: ['Find two points where the line crosses grid corners.', 'Rise: how far up (+) or down (−).', 'Run: how far right.', 'Slope = rise ÷ run.'] },
    { k: 'ex', min: 2, kick: 'Example 1 of 2 · Graphs', title: 'Rise over run', q: 'Find the slope of this line.',
      fig: { kind: 'graph', x: [-3, 5], y: [-4, 5], lines: [{ pts: [[-1, -4], [3.5, 5]] }] },
      steps: [
        { t: 'Find two points on exact grid corners: *(0, −2)* and *(2, 2)*.', fig: { kind: 'graph', x: [-3, 5], y: [-4, 5], lines: [{ pts: [[-1, -4], [3.5, 5]] }, { pts: [[0, -2], [2, 2]], dots: true, only: true }], labels: [[0, -2, '(0, −2)'], [2, 2, '(2, 2)', 'l']] } },
        { t: 'Rise: from (0, −2) go up to the height of (2, 2). Up [[4]].', fig: { kind: 'graph', x: [-3, 5], y: [-4, 5], lines: [{ pts: [[-1, -4], [3.5, 5]] }, { pts: [[0, -2], [2, 2]], dots: true, only: true }], labels: [[0, -2, '(0, −2)'], [2, 2, '(2, 2)', 'l']], arrows: [[0, -2, 0, 2, 'up 4']] } },
        { t: 'Run: then right to the point. Right [[2]].', fig: { kind: 'graph', x: [-3, 5], y: [-4, 5], lines: [{ pts: [[-1, -4], [3.5, 5]] }, { pts: [[0, -2], [2, 2]], dots: true, only: true }], labels: [[0, -2, '(0, −2)'], [2, 2, '(2, 2)', 'l']], arrows: [[0, -2, 0, 2, 'up 4'], [0, 2, 2, 2, 'right 2', 1]] } },
        { t: 'm = rise ÷ run = 4 ÷ 2 = [[~2]].', eq: 'm = 4/2 = [[2]]' }
      ] },
    { k: 'ex', min: 2, wedo: true, kick: 'We do · Finish it together', title: 'Downhill', q: 'Find the slope of this line.',
      fig: { kind: 'graph', x: [-4, 4], y: [-4, 6], lines: [{ pts: [[-3.33, 6], [3.33, -4]] }] },
      steps: [
        { t: 'Two grid points: *(−2, 4)* and *(2, −2)*.', fig: { kind: 'graph', x: [-4, 4], y: [-4, 6], lines: [{ pts: [[-3.33, 6], [3.33, -4]] }, { pts: [[-2, 4], [2, -2]], dots: true, only: true }], labels: [[-2, 4, '(−2, 4)'], [2, -2, '(2, −2)', 'l']] } },
        { t: 'Rise: down [[6]], so the rise is [[−6]].', fig: { kind: 'graph', x: [-4, 4], y: [-4, 6], lines: [{ pts: [[-3.33, 6], [3.33, -4]] }, { pts: [[-2, 4], [2, -2]], dots: true, only: true }], labels: [[-2, 4, '(−2, 4)'], [2, -2, '(2, −2)', 'l']], arrows: [[-2, 4, -2, -2, 'down 6']] } },
        { t: 'Run: right [[4]].', fig: { kind: 'graph', x: [-4, 4], y: [-4, 6], lines: [{ pts: [[-3.33, 6], [3.33, -4]] }, { pts: [[-2, 4], [2, -2]], dots: true, only: true }], labels: [[-2, 4, '(−2, 4)'], [2, -2, '(2, −2)', 'l']], arrows: [[-2, 4, -2, -2, 'down 6'], [-2, -2, 2, -2, 'right 4']] } },
        { t: 'Rise over run. Downhill means negative.', eq: 'm = [[−6]]/[[4]] = [[−3/2]]' }
      ] },
    { k: 'est', min: 4, id: 'gr1', lo: 0, hi: 2, step: 0.1, near: 0.2, q: 'Look at the line. *Estimate* its slope first (is it steeper or flatter than 1?), then work it out.', fig: { kind: 'graph', x: [-2, 8], y: [-2, 8], lines: [{ pts: [[0, 1], [6, 5]] }, { pts: [[0, 1], [3, 3], [6, 5]], dots: true, only: true }] }, ans: 0.6667, tol: 0.01,
      hint: 'From (0, 1) to (3, 3): up 2, right 3.', why: 'Rise 2, run 3: slope 2/3.',
      help: 'Use the dots. Count up, then count right.',
      more: [
        { k: 'number', q: 'A line goes through *(0, 6)* and *(3, 0)* on a graph. What is its slope?', ans: -2, hint: 'From (0, 6) to (3, 0) you go down 6.', why: 'Rise −6, run 3: −2.',
          steps: ['Rise: from 6 down to 0 is −6.', 'Run: from 0 to 3 is 3.', 'm = −6 ÷ 3 = *−2*. Downhill.'] },
        { k: 'poll', q: 'A line on a graph goes down from left to right and is not very steep. Which could be its slope?', opts: ['3', '−3', '−1/4', '1/4'], ans: 2, why: 'Downhill means negative; not steep means small: −1/4.',
          steps: ['Down left to right: negative slope.', 'Not steep: the number is close to 0.', 'So *−1/4*.'] },
        { k: 'number', q: 'A line rises 5 for every run of 2. It passes *(0, −3)*. What is y when *x = 4*?', ans: 7, hint: 'Run 4 is two runs of 2.', why: 'Two runs of 2 means two rises of 5: −3 + 10 = 7.',
          steps: ['Slope 5/2.', 'From x = 0 to x = 4 is two runs of 2.', 'Two rises of 5: +10.', 'y = −3 + 10 = *7*.'] }
      ] },

    { k: 'text', min: 2, title: 'Slope from an equation', points: ['In *y = mx + b*, the slope is m: the number with x.', 'y = 7 − 2x: the slope is *−2* (the sign comes with it).', 'If y is not alone, get it alone first.', 'Standard form Ax + By = C: subtract the x-term, then divide every term by B.'] },
    { k: 'ex', min: 2, opt: true, kick: 'Example 1 of 3 · Equations', title: 'y is already alone', q: 'Find the slope of *y = 5 − 3x*.',
      steps: [
        { t: 'The slope is the number with x, *sign included*.' },
        { t: 'Write it in the usual order.', eq: 'y = [[−3]]x + [[5]]' },
        { t: 'm = [[~−3]]. The 5 is b, the y-intercept, not the slope.' }
      ] },
    { k: 'ex', min: 2, kick: 'Example 2 of 3 · Equations', title: 'Standard form', q: 'Find the slope of *6x + 3y = 9*.',
      steps: [
        { t: 'Get y alone. Subtract 6x from both sides.', eq: '3y = [[−6]]x + 9' },
        { t: 'Divide *every* term by 3.', eq: 'y = [[−2]]x + [[3]]' },
        { t: 'm = [[~−2]].' },
        { t: 'Quick check: in Ax + By = C the slope is −A ÷ B.', eq: '−6 ÷ 3 = −2 ✓' }
      ] },
    { k: 'ex', min: 2, wedo: true, kick: 'We do · Finish it together', title: 'A negative B', q: 'Find the slope of *2x − 5y = 10*.',
      steps: [
        { t: 'Step 1 is done for you: subtract 2x from both sides.', eq: '−5y = −2x + 10' },
        { t: 'Your turn: divide every term by −5. Both signs flip.', eq: 'y = [[2/5]]x − [[2]]' },
        { t: 'So the slope is the number with x.', eq: 'm = [[2/5]]     Check: −A ÷ B = −2 ÷ (−5) = 2/5 ✓' }
      ] },
    { k: 'number', min: 4, id: 'eq1', q: 'What is the slope of *3x + 2y = 8*?', ans: -1.5, tol: 0.01,
      hint: 'Subtract 3x: 2y = −3x + 8. Then divide everything by 2.', why: 'y = −(3/2)x + 4. The slope is −3/2.',
      help: 'Step 1: move the x-term. What is 2y equal to?',
      more: [
        { k: 'number', q: 'What is the slope of *y = 9 − 4x*?', ans: -4, hint: 'Which number is with x? Take its sign too.', why: 'The x-term is −4x, so m = −4.',
          steps: ['Rewrite: y = −4x + 9.', 'The number with x is −4.', 'm = *−4*. (9 is the y-intercept.)'] },
        { k: 'number', q: 'What is the slope of *4y = 6x − 12*?', ans: 1.5, tol: 0.01, hint: 'Divide every term by 4.', why: 'y = 1.5x − 3: slope 3/2.',
          steps: ['Divide every term by 4.', '6x ÷ 4 = (3/2)x and −12 ÷ 4 = −3.', 'y = (3/2)x − 3: m = *3/2*.'] },
        { k: 'number', q: 'What is the slope of *5x − 2y = 10*?', ans: 2.5, tol: 0.01, hint: 'Subtract 5x, then divide by −2.', why: '−2y = −5x + 10, so y = 2.5x − 5.',
          steps: ['Subtract 5x: −2y = −5x + 10.', 'Divide every term by −2: y = (5/2)x − 5.', 'm = *5/2*. Shortcut: −A ÷ B = −5 ÷ −2 = 5/2.'] }
      ] },
    { k: 'odd', min: 2, id: 'odd1', items: ['y = 3x + 6', 'y = 3x − 2', 'y = −3x + 6', 'y = x + 6'],
      why: ['It is the only one that goes through (−2, 0)', 'It is the only one with a negative y-intercept', 'It is the only one that goes downhill (negative slope)', 'It is the only one that goes up just 1 for every 1 across'],
      note: 'Slope and y-intercept are two different things about a line. Three of these have slope 3 or −3, and three have b = 6.' },
    { k: 'cross', min: 3, opt: true, id: 'match', q: 'Cross out every one that does *not* have the same slope as the line through (0, 1) and (2, 7).', opts: ['y = 3x − 4', 'y = 7x + 1', 'A table where x goes 1, 2, 3 and y goes 4, 6, 8', 'x + 3y = 6'], ans: 0,
      reasons: ['Its slope is 7', 'Its slope is 2', 'Its slope is −1/3'], because: [0, 0, 1, 2],
      why: 'The two points give (7 − 1) ÷ (2 − 0) = 3. y = 3x − 4 has slope 3. The table has slope 2; x + 3y = 6 has slope −1/3.',
      help: 'Find the slope of the two points first, then check each option.',
      more: [
        { k: 'poll', q: 'Which line is steepest?', opts: ['y = 2x + 9', 'The line through (0, 0) and (1, −5)', 'y = 0.5x', 'A table: x 0, 2, 4 and y 1, 4, 7'], ans: 1, why: 'Steepness is the size of the slope: |−5| = 5 beats 2, 0.5 and 1.5.',
          steps: ['Slopes: 2, −5, 0.5 and 3 ÷ 2 = 1.5.', 'Steepest means the biggest size, ignoring the sign.', '−5 is size 5: the *line through (0, 0) and (1, −5)*.'] },
        { k: 'number', q: 'The line *2x + 4y = 8* has slope m. What is m?', ans: -0.5, tol: 0.01, hint: '−A ÷ B.', why: '−2 ÷ 4 = −1/2.',
          steps: ['4y = −2x + 8.', 'y = −(1/2)x + 2.', 'm = *−1/2*.'] },
        { k: 'open', q: 'A table, a graph and an equation all show the same line. Explain how you could check they really match.', ph: 'I would find... in each and...',
          model: 'Find the slope in each one (change in y over change in x in the table, rise over run on the graph, the x-number once y is alone in the equation) and the y-intercept in each. If both numbers match everywhere, it is the same line.',
          steps: ['Slope from each: table, graph, equation.', 'y-intercept from each: y when x = 0.', 'Both match → the same line.'] }
      ] },
    { k: 'conf', min: 1, id: 'conf', q: 'Slope from points, tables, graphs and equations: how do you feel?' },
    { k: 'play', min: 6, title: 'Practise: Unit 2 Review', steps: ['Open the *Unit 2 Review*.', 'Pick a slope skill under *Compute slope*.', 'Stuck? Do *Guided practice* first, or watch the Khan Academy video on the Learn tab.', 'Then *On your own* until it says Developed.'], aim: 'Done when one slope skill is Developed. Keep going at home for the others.', minutes: 6 },
    { k: 'exit', min: 3, id: 'exit', q: 'Find the slope three ways and say if they match: the points *(1, 4)* and *(3, 10)*; the table x: 0, 1, 2 and y: 2, 5, 8; the equation *6x − 2y = 4*.', ph: 'Points: ... Table: ... Equation: ...',
      model: 'Points: (10 − 4) ÷ (3 − 1) = 3. Table: y goes up 3 for each 1 of x, so 3. Equation: −2y = −6x + 4, y = 3x − 2, so 3. All three are 3: they match.' },
    { k: 'end', title: 'Slope, four ways.', next: 'Next: *Review 2, Change the Form*. Standard form, slope-intercept form, and graphing them.' }
  ]
});
