/* Review 5 of 6: the Unit 2 review, step by step (1 of 2). Slope and the start, worked out by hand with the hands-on
   kinds from the inequality lessons (sfa-ineq.js): sort lines by slope, slope from two points and from a table one move
   at a time, test points on a line, match equations to graphs, graph a line, and find b. Review 6 does forms, stories
   and inequality signs. */
SFA_LESSON({
  id: 'L36', n: 21.41, label: 'Review 5', title: 'Slope and the Start, Step by Step',
  game: { title: 'Unit 2 Review', file: 'review-u2.html' },
  big: 'Slope is change in y over change in x, in the same order top and bottom. In a table, check how much x goes up. A point is on a line when it makes the equation true. Graph from (0, b) with rise over run. To find b, put one point into y = mx + b and solve.',
  slides: [
    { k: 'title', min: 1, kicker: 'Unit 2 Review · Step by step 1 of 2', title: 'Slope and the Start', sub: 'Everything from Floors One and Two, worked out one move at a time. Every slide checks your answer, so you know straight away.', art: '🪜' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Sort lines by their slope', 'Find slope from two points and from a table, one step at a time', 'Test whether a point is on a line', 'Match equations to graphs, and graph a line yourself', 'Find b, and write the equation'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'Floors One and Two: which part do you want to practise most today?', opts: ['Slope from two points', 'Slope from a table', 'Graphing a line', 'Finding b', 'All of it'] },

    { k: 'sort', min: 3, id: 'dir', kick: 'Which way does it go?', q: 'Sort each line by its slope.', range: [-4, 4], bins: ['↗ Positive', '↘ Negative', '→ Zero', '↑ Undefined'],
      learn: ['Read a graph left to right, like a sentence.', 'Uphill: *positive*. Downhill: *negative*. Flat: *0*. Straight up and down: *undefined* (the change in x is 0, and you can\'t divide by 0).'],
      cards: [{ t: 'A', plane: { range: [-4, 4], m: 2, b: 0 }, b: 0 }, { t: 'B', plane: { range: [-4, 4], m: -1, b: 1 }, b: 1 }, { t: 'C', plane: { range: [-4, 4], m: 0, b: 2 }, b: 2, why: 'Flat: y never changes, so the change in y is 0, and the slope is 0.' },
        { t: 'D', plane: { range: [-4, 4], vx: 1 }, b: 3, why: 'Straight up and down: x never changes, so you would divide by 0. Undefined.' }, { t: 'E', plane: { range: [-4, 4], m: 0.5, b: -2 }, b: 0, why: 'Gentle, but still uphill left to right: positive.' },
        { t: 'F', plane: { range: [-4, 4], m: -3, b: 0 }, b: 1 }, { t: 'G', plane: { range: [-4, 4], m: 0, b: -3 }, b: 2 }, { t: 'H', plane: { range: [-4, 4], vx: -2 }, b: 3 }],
      help: 'Put your finger on the left end of each line and slide it right. Up, down, flat, or can\'t slide at all?',
      why: 'Uphill left to right is positive, downhill is negative, flat is 0, and straight up and down is undefined.',
      more: [
        { k: 'sort', q: 'No graphs this time. Sort the equations by their slope.', bins: ['Positive', 'Negative', 'Zero', 'Undefined'],
          cards: [{ t: 'y = 3x − 1', b: 0 }, { t: 'y = −x + 4', b: 1 }, { t: 'y = 5', b: 2, why: 'y = 5 is y = 0x + 5: flat.' }, { t: 'x = −2', b: 3, why: 'x = −2 is a vertical line: undefined.' }, { t: 'y = 7 − 2x', b: 1, why: 'The number with x is −2, even though it is written second.' }, { t: '2x + y = 6', b: 1, why: 'Get y alone: y = −2x + 6.' }, { t: 'x − y = 3', b: 0, why: 'Get y alone: −y = −x + 3, so y = x − 3.' }, { t: 'y = ½x', b: 0 }],
          why: 'The slope is the number with x once y is alone. y = 5 is flat; x = −2 is vertical.',
          steps: ['y alone already: y = 3x − 1 (3), y = −x + 4 (−1), y = 7 − 2x (−2), y = ½x (½).', '2x + y = 6 → y = −2x + 6. x − y = 3 → y = x − 3.', 'y = 5: zero. x = −2: undefined.'] },
        { k: 'poll', q: 'A line goes through *(1, 4)* and *(5, 4)*. What is its slope?', opts: ['0', 'Undefined', '4', '1'], ans: 0,
          why: 'Change in y: 4 − 4 = 0. Change in x: 5 − 1 = 4. 0 ÷ 4 = 0. Same y both times: a flat line.', steps: ['Top: 4 − 4 = 0.', 'Bottom: 5 − 1 = 4.', '0 ÷ 4 = *0*: flat.'] },
        { k: 'poll', q: 'A line goes through *(3, −1)* and *(3, 6)*. What is its slope?', opts: ['Undefined', '0', '7', '−7'], ans: 0,
          why: 'Change in x: 3 − 3 = 0. You can\'t divide 7 by 0, so the slope is undefined. Same x both times: a vertical line, x = 3.', steps: ['Top: 6 − (−1) = 7.', 'Bottom: 3 − 3 = 0.', '7 ÷ 0 can\'t be done: *undefined*.'] }
      ] },

    { k: 'solve', min: 4, id: 'pts', kick: 'Slope from two points', q: 'Find the slope of the line through *(2, 9)* and *(6, 1)*.', start: 'm = (change in y) ÷ (change in x)',
      learn: ['Change in y goes on top, change in x on the bottom.', 'Subtract in the *same order* top and bottom: second point minus first, both times.'],
      moves: [
        { q: 'Top: the change in y. Second point minus first.', opts: ['1 − 9', '9 − 1', '6 − 2'], ans: 0, res: ['m = −8 ÷ (change in x)', 'm = 8 ÷ (change in x)', 'm = −10 ÷ (change in x)'], rans: 0,
          hint: 'The y-values are 9 (first point) and 1 (second point). Second minus first.' },
        { q: 'Bottom: the change in x, in the same order.', opts: ['6 − 2', '2 − 6', '1 − 9'], ans: 0, res: ['m = −8 ÷ 4', 'm = −8 ÷ (−4)', 'm = 8 ÷ 4'], rans: 0,
          hint: 'You started the top with the second point (1). Start the bottom with the second point too: 6.', why: 'Same order: second point first, top and bottom.' },
        { q: 'Last move?', opts: ['Divide', 'Subtract', 'Multiply'], ans: 0, res: ['m = −2', 'm = 2', 'm = −½'], rans: 0,
          hint: 'Slope is a division: top ÷ bottom. A negative divided by a positive is negative.', why: 'Negative: the line goes downhill from (2, 9) to (6, 1).' }],
      help: 'Write the two points one above the other. Subtract the y-values, then the x-values, in the same order.',
      why: 'm = (1 − 9) ÷ (6 − 2) = −8 ÷ 4 = −2. Downhill, which matches: y fell from 9 to 1 as x went up.',
      more: [
        { k: 'solve', q: 'With negatives: the slope through *(−2, −1)* and *(2, 7)*.', start: 'm = (change in y) ÷ (change in x)', moves: [
          { q: 'Top: second y minus first y.', opts: ['7 − (−1)', '7 − 1', '−1 − 7'], ans: 0, res: ['m = 8 ÷ (change in x)', 'm = 6 ÷ (change in x)'], rans: 0, hint: 'The first y is −1. Subtracting a negative is adding.' },
          { q: 'Bottom: second x minus first x.', opts: ['2 − (−2)', '2 − 2', '−2 − 2'], ans: 0, res: ['m = 8 ÷ 4', 'm = 8 ÷ 0', 'm = 8 ÷ (−4)'], rans: 0, hint: '2 − (−2) is 2 + 2.' },
          { q: 'Last move?', opts: ['Divide', 'Add'], ans: 0, res: ['m = 2', 'm = 12', 'm = −2'], rans: 0, hint: 'Top ÷ bottom.' }],
          why: 'm = 8 ÷ 4 = 2.', steps: ['Top: 7 − (−1) = 7 + 1 = 8.', 'Bottom: 2 − (−2) = 2 + 2 = 4.', '8 ÷ 4 = *2*.'] },
        { k: 'poll', q: 'Doug finds the slope through (2, 9) and (6, 1) as *(9 − 1) ÷ (2 − 6)*. Is that right?', opts: ['Yes: it gives 8 ÷ (−4) = −2, the same answer', 'No: you must subtract the second point first', 'No: it gives +2'], ans: 0,
          why: 'Doug used first minus second on top AND bottom. Same order both times, so it works: 8 ÷ (−4) = −2. The mistake is only when the order changes.', steps: ['Top: 9 − 1 = 8 (first minus second).', 'Bottom: 2 − 6 = −4 (first minus second).', '8 ÷ (−4) = −2 ✓: the order matches, so it is right.'] },
        { k: 'number', q: 'Find the slope through *(−4, 3)* and *(2, 6)*. Write it as a decimal.', ans: 0.5, hint: 'Top: 6 − 3. Bottom: 2 − (−4).', why: '3 ÷ 6 = 0.5.',
          steps: ['Top: 6 − 3 = 3.', 'Bottom: 2 − (−4) = 6.', '3 ÷ 6 = *0.5* (or ½).'] }
      ] },

    { k: 'solve', min: 4, id: 'tab', kick: 'Slope from a table', q: 'Find the slope from the table. Careful: look at how x goes up.', start: 'm = (change in y) ÷ (change in x)',
      tab: { head: ['x', 'y'], rows: [[1, 4], [3, 10], [5, 16], [7, 22]] },
      learn: ['Pick two rows and treat them as two points.', 'The trap: x might not go up by 1. Here it goes up by 2.'],
      moves: [
        { q: 'Use the first two rows, (1, 4) and (3, 10). The change in y?', opts: ['10 − 4', '3 − 1', '10 + 4'], ans: 0, res: ['m = 6 ÷ (change in x)', 'm = 2 ÷ (change in x)', 'm = 14 ÷ (change in x)'], rans: 0, hint: 'y went from 4 to 10.' },
        { q: 'The change in x?', opts: ['3 − 1', 'It is always 1', '10 − 4'], ans: 0, res: ['m = 6 ÷ 2', 'm = 6 ÷ 1', 'm = 2 ÷ 6'], rans: 0, hint: 'x went from 1 to 3, not from 1 to 2.', why: 'x goes up by 2, not 1: the table trap.' },
        { q: 'Divide.', opts: ['6 ÷ 2', '2 ÷ 6'], ans: 0, res: ['m = 3', 'm = 6', 'm = ⅓'], rans: 0, hint: 'Change in y on top: 6 ÷ 2.' },
        { q: 'Check with two other rows, (5, 16) and (7, 22).', opts: ['(22 − 16) ÷ (7 − 5)', '22 − 16'], ans: 0, res: ['6 ÷ 2 = 3 ✓ the same slope, so the table is a line', '6'], rans: 0, hint: 'Do the same division with the new rows.' }],
      help: 'y goes up by 6 each row. How much does x go up each row?',
      why: 'y goes up 6 each time x goes up 2, so m = 6 ÷ 2 = 3. Every pair of rows gives 3, so it is a straight line.',
      more: [
        { k: 'number', q: 'Find the slope from this table.', tab: { head: ['x', 'y'], rows: [[0, 10], [4, 2], [8, -6]] }, ans: -2, hint: 'y goes down 8 each row. x goes up 4.',
          why: '−8 ÷ 4 = −2.', steps: ['Change in y: 2 − 10 = −8.', 'Change in x: 4 − 0 = 4.', '−8 ÷ 4 = *−2*.'] },
        { k: 'sort', q: 'Is each table a straight line (the same slope between every pair of rows)?', bins: ['📏 Linear', '〰️ Not linear'],
          cards: [{ t: 'x: 0, 1, 2 · y: 1, 3, 5', b: 0 }, { t: 'x: 0, 1, 2 · y: 1, 2, 4', b: 1, why: 'y goes up 1, then 2: the slope changes.' }, { t: 'x: 1, 3, 5 · y: 2, 8, 14', b: 0 },
            { t: 'x: 0, 2, 3 · y: 5, 9, 11', b: 0, why: 'Tricky: x goes up 2 then 1, and y goes up 4 then 2. 4 ÷ 2 = 2 and 2 ÷ 1 = 2: the same slope.' }, { t: 'x: 0, 1, 2 · y: 0, 1, 4', b: 1 }, { t: 'x: 2, 4, 6 · y: 7, 7, 7', b: 0, why: 'Slope 0 every time: a flat line is still a line.' }],
          why: 'Work out change in y ÷ change in x for each pair of rows. All the same: linear.',
          steps: ['1, 3, 5: up 2 each time ✓. 1, 2, 4: up 1 then 2 ✗.', '2, 8, 14 over x up 2: 3 each time ✓. 5, 9, 11 over x up 2 then 1: 2 and 2 ✓.', '0, 1, 4 ✗. 7, 7, 7: slope 0 ✓.'] }
      ] },

    { k: 'pick', min: 3, id: 'on', where: 'plane', range: [-5, 5], cond: 'y = 2x − 3', cand: [[0, -3], [1, -1], [2, 1], [3, 3], [1, 1], [-1, -5], [2, 0], [-1, -1]], kick: 'On the line or not?',
      q: 'Tap every point that is on the line *y = 2x − 3*. (The line isn\'t drawn: work it out.)',
      learn: ['A point is on the line when it makes the equation true.', 'Put in x, work out 2x − 3, and see if you get the y.'],
      help: 'Try (2, 1): 2(2) − 3 = 1. Is that the y?',
      why: '(0, −3), (1, −1), (2, 1), (3, 3) and (−1, −5) all make it true. (1, 1) does not: 2(1) − 3 = −1, not 1.',
      more: [
        { k: 'pick', where: 'plane', range: [-1, 7], cond: '3x + 2y = 12', cand: [[0, 6], [4, 0], [2, 3], [1, 4], [3, 1], [6, 0]], q: 'Standard form: tap every point on *3x + 2y = 12*.',
          why: '(0, 6), (4, 0) and (2, 3) give 12. (1, 4) gives 11.', steps: ['(0, 6): 0 + 12 = 12 ✓. (4, 0): 12 + 0 = 12 ✓.', '(2, 3): 6 + 6 = 12 ✓.', '(1, 4): 3 + 8 = 11 ✗. (3, 1): 11 ✗. (6, 0): 18 ✗.'] },
        { k: 'poll', q: 'Is *(10, 17)* on the line y = 2x − 3? (Too far to see on the graph.)', opts: ['Yes: 2(10) − 3 = 17', 'No: it is off the grid', 'You can\'t tell without a graph'], ans: 0,
          why: 'You don\'t need to see it. 2(10) − 3 = 17, so it is on the line.', steps: ['Put in x = 10: 2(10) − 3.', '= 20 − 3 = 17.', 'That is the y: *on the line*.'] },
        { k: 'number', q: 'The point *(4, k)* is on the line y = −x + 6. What is k?', ans: 2, hint: 'Put x = 4 in: −4 + 6.', why: 'k = −4 + 6 = 2.', steps: ['On the line means it makes the equation true.', 'y = −(4) + 6.', 'y = *2*.'] }
      ] },

    { k: 'match', min: 3, id: 'graphs', kick: 'Equation to graph', q: 'Match each equation to its graph.', range: [-5, 5],
      learn: ['Start with b: where does it cross the y-axis?', 'Then the slope: uphill or downhill, steep or gentle?'],
      pairs: [['y = 2x + 1', { plane: { range: [-5, 5], m: 2, b: 1 } }], ['y = −x + 3', { plane: { range: [-5, 5], m: -1, b: 3 } }], ['y = ½x − 2', { plane: { range: [-5, 5], m: 0.5, b: -2 } }], ['y = −3', { plane: { range: [-5, 5], m: 0, b: -3 } }]],
      help: 'Find b first: 1, 3, −2 and −3. Which graph crosses the y-axis at each?',
      why: 'Each crosses the y-axis at its b. Then 2 is steep uphill, −1 downhill, ½ gentle uphill, and y = −3 is flat.',
      more: [
        { k: 'match', q: 'Now standard form. Get y alone in your head first.', range: [-5, 5],
          pairs: [['2x + y = 4', { plane: { range: [-5, 5], m: -2, b: 4 } }], ['x − y = 1', { plane: { range: [-5, 5], m: 1, b: -1 } }], ['x + 2y = 6', { plane: { range: [-5, 5], m: -0.5, b: 3 } }], ['3x − y = −2', { plane: { range: [-5, 5], m: 3, b: 2 } }]],
          why: '2x + y = 4 → y = −2x + 4. x − y = 1 → y = x − 1. x + 2y = 6 → y = −½x + 3. 3x − y = −2 → y = 3x + 2.',
          steps: ['Get y alone in each one.', 'y = −2x + 4, y = x − 1, y = −½x + 3, y = 3x + 2.', 'Match each b, then check the slope.'] },
        { k: 'open', q: 'Two lines both cross the y-axis at 2. How can you tell their graphs apart?', ph: 'You can tell them apart by…',
          model: 'They start at the same point, (0, 2), so you look at the slope: which way each goes and how steep it is. For example y = 3x + 2 goes up steeply and y = −x + 2 goes down.',
          steps: ['Same b: same y-intercept, (0, 2).', 'Different m: a different direction or steepness.', 'Compare the slopes to tell them apart.'] }
      ] },

    { k: 'plane', min: 4, id: 'graph', kick: 'Graph the line', q: 'Graph *y = 2x − 1*: tap two points on it.', range: [-5, 5], m: 2, b: -1, op: '=', parts: ['line'],
      learn: ['Start at *(0, b)* on the y-axis: here (0, −1).', 'Then the slope as rise over run: 2 means up 2, right 1.'],
      help: 'First point: (0, −1). From there go up 2 and right 1.',
      why: '(0, −1), then up 2 and right 1 to (1, 1). Any two points with y = 2x − 1 make the same line.',
      more: [
        { k: 'plane', q: 'Graph *y = −⅔x + 4*.', range: [-6, 6], m: -2 / 3, b: 4, op: '=', parts: ['line'], hint: 'Start at (0, 4). −⅔ means down 2, right 3.',
          why: '(0, 4), then down 2 and right 3 to (3, 2).', steps: ['b = 4: start at (0, 4).', '−⅔: down 2, right 3.', 'Second point: (3, 2). Or keep going to (6, 0).'] },
        { k: 'plane', q: 'Graph *3x − 2y = 6*. (Get y alone first, or find where it crosses each axis.)', range: [-5, 5], m: 1.5, b: -3, op: '=', parts: ['line'], hint: 'x = 0 gives y = −3. y = 0 gives x = 2.',
          why: 'It crosses the axes at (0, −3) and (2, 0). In slope-intercept form: y = 1.5x − 3.', steps: ['Put x = 0: −2y = 6, so y = −3. Point (0, −3).', 'Put y = 0: 3x = 6, so x = 2. Point (2, 0).', 'Join them: the line y = 1.5x − 3.'] },
        { k: 'plane', q: 'Graph *y = 4*.', range: [-5, 5], m: 0, b: 4, op: '=', parts: ['line'], hint: 'Every point on it has y = 4.',
          why: 'A flat line through (0, 4): slope 0.', steps: ['y = 4 is y = 0x + 4.', 'Slope 0: flat.', 'Every point has y = 4: (−2, 4), (0, 4), (3, 4).'] }
      ] },

    { k: 'solve', min: 5, id: 'b', kick: 'Find the start', q: 'A line has slope *3* and goes through *(2, 11)*. Find b, then write the equation.', start: 'y = 3x + b',
      learn: ['b is y when x = 0. If you can\'t read it, work it out.', 'Put ONE point into y = mx + b and solve for b.'],
      moves: [
        { q: 'Put the point in. Which goes where?', opts: ['x = 2, y = 11', 'x = 11, y = 2', 'Make b = 11'], ans: 0, res: ['11 = 3(2) + b', '2 = 3(11) + b', 'y = 3x + 11'], rans: 0, hint: 'A point is (x, y): x comes first.' },
        { q: 'Next?', opts: ['Work out 3(2)', 'Add 3 and 2'], ans: 0, res: ['11 = 6 + b', '11 = 5 + b', '11 = 32 + b'], rans: 0, hint: '3(2) means 3 times 2.' },
        { q: 'Get b alone.', opts: ['Subtract 6 from both sides', 'Add 6 to both sides', 'Divide by 6'], ans: 0, res: ['b = 5', 'b = 17', 'b = −5'], rans: 0, hint: '6 is added to b. Undo it: subtract 6 from both sides.' },
        { q: 'Write the equation.', opts: ['Put m = 3 and b = 5 into y = mx + b', 'Put the point back in'], ans: 0, res: ['y = 3x + 5', 'y = 5x + 3', 'y = 3x + 11'], rans: 0, hint: 'm goes with x, b is on its own.' },
        { q: 'Check it with the point (2, 11).', opts: ['Put x = 2 into y = 3x + 5', 'No need to check'], ans: 0, res: ['3(2) + 5 = 11 ✓', '3(2) + 5 = 13'], rans: 0, hint: 'Always check: does x = 2 give y = 11?' }],
      help: 'Write y = 3x + b. Put in x = 2 and y = 11, then solve for b.',
      why: '11 = 3(2) + b, so b = 11 − 6 = 5. The line is y = 3x + 5, and (2, 11) checks: 6 + 5 = 11 ✓.',
      more: [
        { k: 'solve', q: 'From two points: write the equation of the line through *(1, 5)* and *(4, 14)*.', start: 'y = mx + b', moves: [
          { q: 'First, the slope.', opts: ['(14 − 5) ÷ (4 − 1)', '(4 − 1) ÷ (14 − 5)', '14 ÷ 4'], ans: 0, res: ['m = 3, so y = 3x + b', 'm = ⅓, so y = ⅓x + b'], rans: 0, hint: 'Change in y on top.' },
          { q: 'Put in one point, (1, 5).', opts: ['5 = 3(1) + b', '1 = 3(5) + b'], ans: 0, res: ['5 = 3 + b', '5 = 4 + b'], rans: 0, hint: 'x = 1, y = 5.' },
          { q: 'Get b alone.', opts: ['Subtract 3 from both sides', 'Add 3'], ans: 0, res: ['b = 2, so y = 3x + 2', 'b = 8, so y = 3x + 8'], rans: 0, hint: 'Undo the + 3.' },
          { q: 'Check with the other point, (4, 14).', opts: ['3(4) + 2', '3(14) + 2'], ans: 0, res: ['12 + 2 = 14 ✓', '44'], rans: 0, hint: 'Put x = 4 in.' }],
          why: 'm = 3, b = 2: y = 3x + 2. Check: 3(4) + 2 = 14 ✓.', steps: ['m = (14 − 5) ÷ (4 − 1) = 9 ÷ 3 = 3.', '5 = 3(1) + b, so b = 2.', 'y = 3x + 2. Check (4, 14): 12 + 2 = 14 ✓.'] },
        { k: 'number', q: 'The table doesn\'t start at x = 0. What is b?', tab: { head: ['x', 'y'], rows: [[2, 7], [4, 11], [6, 15]] }, ans: 3, hint: 'The slope is 4 ÷ 2 = 2. Walk back from x = 2 to x = 0.',
          why: 'Slope 2. Walk back one step of x = 2: y goes down 4, from 7 to 3. So b = 3, and y = 2x + 3.', steps: ['Slope: (11 − 7) ÷ (4 − 2) = 2.', 'From x = 2 back to x = 0: y goes down 2 × 2 = 4.', '7 − 4 = *3*. Check: 2(2) + 3 = 7 ✓.'] },
        { k: 'poll', q: 'Marcus says: "The line goes through (2, 11), so b = 11." What went wrong?', opts: ['b is y only when x = 0, and here x = 2', 'Nothing: b is the y of any point', 'b should be 2'], ans: 0,
          why: 'b is the y-intercept: the y where x = 0. At x = 2 the line is already 6 above its start.', steps: ['b is the value of y when x = 0.', 'The point (2, 11) has x = 2, not 0.', 'Solve instead: 11 = 3(2) + b gives b = 5.'] }
      ] },

    { k: 'play', min: 6, title: 'Practise: Unit 2 Review', steps: ['Open the *Unit 2 Review*.', 'Pick the slope or Find b skill that felt shakiest today.', 'Guided practice first, then *On your own*.', 'Stuck? The Khan Academy videos are on the Learn tab.'], aim: 'Done when one more skill is Developed.', minutes: 6 },
    { k: 'conf', min: 1, id: 'conf', q: 'Slope, graphing and finding b: how do you feel now?' },
    { k: 'exit', min: 4, id: 'exit', q: 'A line goes through *(−1, 2)* and *(3, 10)*. Find the slope (show the subtraction), find b, write the equation, and check it with the second point.', ph: 'm = … b = … y = … Check: …',
      model: 'm = (10 − 2) ÷ (3 − (−1)) = 8 ÷ 4 = 2. Put in (−1, 2): 2 = 2(−1) + b, so b = 4. y = 2x + 4. Check (3, 10): 2(3) + 4 = 10 ✓.' },
    { k: 'end', title: 'Slope and start, step by step.', next: 'Next: *Review 6*. Change the form, tell the story, and turn the sign.' }
  ]
});
