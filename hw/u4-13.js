/* Homework: Unit 4 Lesson 13, Will the Lines Cross? */
SFA_HW({
  id: 'g73', unit: 4, lesson: 13, topic: 'Will the lines cross?', title: 'Kart Chase', who: 'marcus',
  intro: ['The Sandy Flats go-kart track has a new timing board. It only shows two notes for each kart: (time in seconds, distance in metres).',
    'Marcus wants to know: will one kart catch the other? When, and where? Turn two notes into a line, compare the slopes, and find the crossing.'],
  goal: 'Use two points on each line to decide if the lines cross, and find where.',
  bigIdea: 'Different slopes cross at one point; the same slope with a different b never crosses; the same slope and b is the same line.',
  levels: [
    { name: 'Slope from two points', learn: ['*m = change in y ÷ change in x*.', 'Subtract in the *same order*, top and bottom.'],
      tasks: [
        { k: 'solve', q: 'Find the slope of the line through *(1, 3)* and *(4, 12)*.', start: 'm = (change in y) ÷ (change in x)',
          moves: [
            { q: 'Top: the change in y. Second point minus first.', opts: ['4 − 1', '12 − 3', '12 − 4'], ans: 1, res: ['m = 9 ÷ (change in x)', 'm = 15 ÷ (change in x)'], rans: 0,
              hint: 'The y-values are 3 and 12.', no: { 0: '4 and 1 are x-values. y goes on top.', 2: '4 is an x-value. Use the two y-values: 12 and 3.', r1: '12 − 3, not 12 + 3.' } },
            { q: 'Bottom: the change in x, in the same order.', opts: ['4 − 1', '1 − 4', '12 − 3'], ans: 0, res: ['m = 9 ÷ 3', 'm = 9 ÷ (−3)', 'm = 9 ÷ 9'], rans: 0,
              hint: 'You started with the second point on top (12). Start with the second point on the bottom too (4).', no: { 1: 'That is first minus second. Keep the same order as the top.', 2: 'Those are y-values again.', r1: '4 − 1 = 3, positive.', r2: '4 − 1 = 3.' } },
            { q: 'Last move?', opts: ['Divide', 'Subtract'], ans: 0, res: ['m = 3', 'm = ⅓', 'm = 6'], rans: 0,
              hint: 'Slope is top ÷ bottom.', no: { 1: 'Slope is a division.', r1: 'Top ÷ bottom: 9 ÷ 3, not 3 ÷ 9.', r2: '9 ÷ 3, not 9 − 3.' }, why: 'm = 3: up 3 for every 1 across.' }
          ] },
        { k: 'number', q: 'Find the slope through *(2, 7)* and *(6, −1)*.', ans: -2, hint: 'Top: −1 − 7. Bottom: 6 − 2.', why: '(−1 − 7) ÷ (6 − 2) = −8 ÷ 4 = −2. Downhill.' },
        { k: 'choice', q: 'Kart A\'s notes are *(0, 0)* and *(10, 40)* (seconds, metres). What is the slope, and what does it mean?',
          opts: ['40: it goes 40 m each second', '4: it goes 4 m each second', '¼: it goes ¼ m each second', '10: it drove for 10 seconds'], ans: 1,
          no: ['40 m took 10 seconds, not 1.', null, 'Change in distance goes on top: 40 ÷ 10.', 'The slope is a rate, not a time.'], why: '40 ÷ 10 = 4 metres per second. On a distance-time graph the slope is the speed.' }
      ] },
    { name: 'Find the equation', learn: ['*b* is the y-value when x = 0.', 'No (0, b) point? Put m and one point into *y = mx + b* and solve for b.'],
      tasks: [
        { k: 'solve', q: 'Write the equation of the line through *(2, 9)* and *(4, 13)*.', start: 'y = mx + b',
          moves: [
            { q: 'Find the slope.', opts: ['(13 − 9) ÷ (4 − 2)', '(4 − 2) ÷ (13 − 9)', '13 ÷ 4'], ans: 0, res: ['m = 2', 'm = ½', 'm = 4'], rans: 0,
              hint: 'Change in y on top.', no: { 1: 'That is upside down: y goes on top.', 2: 'Use the changes, not one point.', r1: '4 ÷ 2 = 2.', r2: '4 ÷ 2 = 2.' } },
            { q: 'Put m = 2 and the point (2, 9) into y = mx + b.', opts: ['x = 2 and y = 9', 'x = 9 and y = 2'], ans: 0, res: ['2 = 2(9) + b', '9 = 2(2) + b', '9 = 2 + b'], rans: 1,
              hint: '(2, 9) means x = 2 and y = 9.', no: { 1: 'In (2, 9), x comes first.', r0: 'y = 9 and x = 2.', r2: 'm times x: 2 × 2 = 4.' } },
            { q: 'Solve for b.', opts: ['Subtract 4 from both sides', 'Add 4 to both sides'], ans: 0, res: ['b = 5', 'b = 13', 'b = 9'], rans: 0,
              hint: '9 = 4 + b, so b = 9 − 4.', no: { 1: 'Undo + 4 by subtracting 4.', r1: '9 − 4, not 9 + 4.', r2: 'b is not 9: 9 is the y at x = 2.' } },
            { q: 'Write the equation.', opts: ['Put m and b in y = mx + b', 'Put b first'], ans: 0, res: ['y = 5x + 2', 'y = 2x + 5', 'y = 2x + 9'], rans: 1,
              hint: 'm = 2 goes with x. b = 5 is the number on its own.', no: { 1: 'The slope goes with x.', r0: 'The slope (2) goes with x.', r2: 'b is 5, not 9.' },
              why: 'Check with (4, 13): 2(4) + 5 = 13 ✓.' }
          ] },
        { k: 'solve', q: 'Kart B\'s notes: *(10, 70)* and *(30, 130)*. Write *d = mt + b*.', start: 'd = mt + b',
          moves: [
            { q: 'Find the slope (the speed).', opts: ['(130 − 70) ÷ (30 − 10)', '(30 − 10) ÷ (130 − 70)'], ans: 0, res: ['m = 3', 'm = ⅓', 'm = 60'], rans: 0,
              hint: 'Change in distance ÷ change in time.', no: { 1: 'Distance goes on top.', r1: '60 ÷ 20 = 3.', r2: 'Divide: 60 ÷ 20.' } },
            { q: 'Put m = 3 and (10, 70) in.', opts: ['t = 10, d = 70', 't = 70, d = 10'], ans: 0, res: ['70 = 3(10) + b', '10 = 3(70) + b'], rans: 0,
              hint: 'Time first, distance second.', no: { 1: 'In (10, 70), time is 10.', r1: 'd = 70 and t = 10.' } },
            { q: 'Solve for b.', opts: ['Subtract 30 from both sides', 'Divide by 3'], ans: 0, res: ['b = 40', 'b = 70', 'b = 100'], rans: 0,
              hint: '70 = 30 + b.', no: { 1: 'Dividing does not get b alone. Take away 30 first.', r1: 'b is NOT 70: the kart is at 70 m when t = 10, not at the start.', r2: '70 − 30, not 70 + 30.' } },
            { q: 'Write it.', opts: ['m with t, b on its own', 'b with t'], ans: 0, res: ['d = 3t + 40', 'd = 40t + 3'], rans: 0,
              hint: 'd = mt + b.', no: { 1: 'The speed goes with t.', r1: 'The speed (3) goes with t.' }, why: 'Kart B had a 40 m head start and goes 3 m each second.' }
          ] },
        { k: 'choice', q: 'Kart A: *d = 4t*. Kart B: *d = 3t + 40*. Who is faster?', opts: ['Kart B: it starts ahead', 'Same speed', 'Kart A: slope 4 is more than 3'], ans: 2,
          no: ['Starting ahead is the b. Speed is the slope.', 'The slopes are 4 and 3: different.', null], why: 'The slope is the speed: 4 m/s beats 3 m/s. A is behind at the start but faster.' },
        { k: 'plane', q: 'A line goes through *(0, −1)* and *(1, 1)*. Graph it: tap two points on it.', range: [-5, 5], m: 2, b: -1, op: '=', parts: ['line'],
          hint: 'Plot the two given points.', why: 'Slope (1 − (−1)) ÷ (1 − 0) = 2, and b = −1: y = 2x − 1.' }
      ] },
    { name: 'Cross, parallel or same?', learn: ['*Different* slopes: the lines cross at *one* point.', '*Same* slope, *different* b: *parallel*. They never cross: no solution.', '*Same* slope and *same* b: the *same line*. Infinitely many solutions.'],
      tasks: [
        { k: 'sort', q: 'Cross once, parallel, or the same line? Find the slopes first.', bins: ['✖ Cross once', '∥ Parallel', '= Same line'],
          cards: [{ t: 'y = 2x + 1 · y = 2x − 3', b: 1 }, { t: 'y = 3x + 2 · y = −x + 2', b: 0, why: 'Same b, but slopes 3 and −1 are different: they cross at (0, 2).' },
            { t: 'A (0, 1), (2, 5) · B (1, 3), (3, 7)', b: 2, why: 'Both have slope 2. B: 3 = 2(1) + b, so b = 1. The same as A.' }, { t: 'C (0, 0), (1, 3) · D (0, 2), (2, 8)', b: 1, why: 'Both have slope 3, but b = 0 and b = 2.' },
            { t: 'E (0, 5), (1, 3) · F (0, −1), (1, 1)', b: 0 }, { t: 'y = ½x + 4 · 2y = x + 8', b: 2, why: 'Divide 2y = x + 8 by 2: y = ½x + 4.' }],
          why: 'Compare the slopes first. If they match, compare b.' },
        { k: 'solve', q: 'Kart A: *d = 4t*. Kart B: *d = 3t + 40*. The slopes are different, so they meet. When and where?', start: 'd = 4t and d = 3t + 40',
          moves: [
            { q: 'Both say what d is. What first?', opts: ['Add the equations', 'Set them equal', 'Put t = 0'], ans: 1, res: ['4t = 3t + 40', '7t = 40', '4t + 3t = 40'], rans: 0,
              hint: 'At the meeting point both karts have the same d.', no: { 0: 'They are both "d = …": set them equal.', 2: 't = 0 is the start, not the meeting.', r1: 'Set equal, do not add.', r2: '4t = 3t + 40. Keep the sides apart.' } },
            { q: 'Get t alone.', opts: ['Subtract 3t from both sides', 'Divide by 4'], ans: 0, res: ['t = 40', '7t = 40', 't = 10'], rans: 0,
              hint: '4t − 3t = t.', no: { 1: 'There is still t on both sides. Subtract 3t first.', r1: 'Subtract 3t, do not add it.', r2: '4t − 3t = t, so t = 40.' } },
            { q: 'Find d.', opts: ['Put 40 in d = 4t', 'Put 40 in t = 40'], ans: 0, res: ['d = 44', 'd = 160', 'd = 10'], rans: 1,
              hint: 'd = 4 × 40.', no: { 1: 'That has no d.', r0: '4t is 4 × 40, not 4 + 40.', r2: 'Multiply: 4 × 40.' },
              why: 'Kart A catches Kart B after 40 s, 160 m from the start. Check: 3(40) + 40 = 160 ✓.' }
          ] },
        { k: 'choice', q: 'Kart C: *d = 3t + 40*. Kart D: *d = 3t + 10*. Will D catch C?', opts: ['Yes, at t = 30', 'Yes: they are the same line', 'No: same speed, C is always 30 m ahead'], ans: 2,
          no: ['Try t = 30: C is at 130, D is at 100. Not equal.', 'The b values are different: 40 and 10.', null], why: 'Same slope, different b: parallel lines. They never meet: no solution.' },
        { k: 'match', q: 'Match each graph to what it means for the system.', range: [-5, 5],
          pairs: [['Parallel: no solution', { plane: { range: [-5, 5], lines: [{ m: 1, b: 2 }, { m: 1, b: -2 }] } }], ['Cross once: one solution', { plane: { range: [-5, 5], lines: [{ m: 2, b: -1 }, { m: -1, b: 2 }] } }], ['Same line: infinitely many', { plane: { range: [-5, 5], lines: [{ m: -0.5, b: 1 }, { m: -0.5, b: 1 }] } }]],
          why: 'Parallel lines never meet. Crossing lines meet once. The same line meets itself everywhere.' }
      ] },
    { name: 'Find the crossing', learn: ['Write both equations. Compare slopes.', 'Different? *Set them equal*, solve for x, then find y. Check in both.'],
      tasks: [
        { k: 'solve', q: 'Line A goes through *(0, 1)* and *(2, 5)*. Line B goes through *(0, 7)* and *(3, 4)*. Where do they cross?', start: 'A: (0, 1), (2, 5) · B: (0, 7), (3, 4)',
          moves: [
            { q: 'Equation of A. Find its slope.', opts: ['(5 − 1) ÷ (2 − 0)', '(2 − 0) ÷ (5 − 1)'], ans: 0, res: ['A: y = ½x + 1', 'A: y = 2x + 1', 'A: y = 2x + 5'], rans: 1,
              hint: 'Slope 4 ÷ 2 = 2. (0, 1) is on the y-axis, so b = 1.', no: { 1: 'Change in y on top.', r0: '4 ÷ 2 = 2, not ½.', r2: 'b is the y at x = 0: that is 1.' } },
            { q: 'Equation of B. Find its slope.', opts: ['(7 − 4) ÷ (3 − 0)', '(4 − 7) ÷ (3 − 0)'], ans: 1, res: ['B: y = −x + 7', 'B: y = x + 7', 'B: y = −x + 4'], rans: 0,
              hint: 'Second minus first: 4 − 7 = −3. Then −3 ÷ 3 = −1. b = 7.', no: { 0: 'Same order top and bottom: second minus first, 4 − 7.', r1: '−3 ÷ 3 is negative.', r2: 'b is the y at x = 0: 7.' } },
            { q: 'Slopes 2 and −1 are different. Next?', opts: ['Set them equal', 'Add the equations'], ans: 0, res: ['2x + 1 = −x + 7', '2x + 1 = x + 7', 'x + 8 = 0'], rans: 0,
              hint: 'Both are "y = …".', no: { 1: 'Both are y = …: set them equal.', r1: 'Line B is −x + 7.', r2: 'Write 2x + 1 = −x + 7.' } },
            { q: 'Solve for x.', opts: ['Add x, subtract 1, divide by 3', 'Subtract x, subtract 1'], ans: 0, res: ['x = 2', 'x = 6', 'x = 8/3'], rans: 0,
              hint: '3x + 1 = 7, then 3x = 6.', no: { 1: 'Undo −x by adding x.', r1: '3x = 6: divide by 3.', r2: '7 − 1 = 6, not 8.' } },
            { q: 'Find y.', opts: ['Put 2 in y = 2x + 1', 'Put 2 in 3x = 6'], ans: 0, res: ['y = 5', 'y = 4', 'y = 3'], rans: 0,
              hint: '2(2) + 1.', no: { 1: 'That has no y.', r1: '2(2) + 1 = 5.', r2: '2 × 2 = 4, then + 1.' }, why: 'Check in B: −2 + 7 = 5 ✓. The lines cross at (2, 5).' }
          ] },
        { k: 'pair', q: 'Beach tram A goes through *(0, 1)* and *(2, 5)*. Tram B goes through *(1, 9)* and *(3, 7)*. (Minutes, km.) Where do they meet?',
          fig: { range: [0, 6], yrange: [0, 12], pts: [[0, 1, 'A'], [2, 5, 'A'], [1, 9, 'B'], [3, 7, 'B']], x: 'min', y: 'km' },
          ans: [3, 7], hint: 'A: y = 2x + 1. B: slope −1, and 9 = −1 + b, so b = 10. Set them equal.', why: '2x + 1 = −x + 10, so 3x = 9 and x = 3. y = 7. They meet at 3 minutes, 7 km.' },
        { k: 'number', q: 'Gus runs *d = 5t*. Priya runs *d = 3t + 60* (she has a head start). After how many seconds does Gus catch her?', ans: 30, unit: 's',
          hint: 'Set 5t = 3t + 60.', why: '2t = 60, so t = 30 s. Both are at 150 m.' },
        { k: 'choice', q: 'Line E goes through *(1, 4)* and *(2, 7)*. Line F goes through *(3, 10)* and *(5, 16)*. What kind of system is it?',
          opts: ['Cross at one point', 'Parallel: no solution', 'Same line: infinitely many'], ans: 2,
          no: ['Find both slopes: 3 and 6 ÷ 2 = 3. The same.', 'Same slope, yes. Now find each b.', null], why: 'Both slopes are 3. E: 4 = 3 + b, so b = 1. F: 10 = 9 + b, so b = 1. Same line: y = 3x + 1.' }
      ] },
    { name: 'Photo finish', boss: true, learn: ['Mixed questions, fewer hints. Slopes, equations, compare, cross.'],
      tasks: [
        { k: 'solve', q: 'Line A: *(0, −2)* and *(3, 4)*. Line B: *(1, 3)* and *(3, 1)*. Where do they cross?', start: 'A: (0, −2), (3, 4) · B: (1, 3), (3, 1)',
          moves: [
            { q: 'Equation of A?', opts: ['Slope 6 ÷ 3, b = −2', 'Slope 3 ÷ 6, b = −2'], ans: 0, res: ['A: y = 2x − 2', 'A: y = −2x + 2'], rans: 0 },
            { q: 'Slope of B?', opts: ['(1 − 3) ÷ (3 − 1)', '(3 − 1) ÷ (3 − 1)'], ans: 0, res: ['m = −1', 'm = 1'], rans: 0 },
            { q: 'Find b for B with (1, 3).', opts: ['3 = −1(1) + b', '1 = −1(1) + b'], ans: 0, res: ['b = 4: y = −x + 4', 'b = 2: y = −x + 2'], rans: 0, no: { 1: 'Use x and y from the same point: (1, 3).', r1: '3 = −1 + b, so b = 3 + 1 = 4.' } },
            { q: 'Cross?', opts: ['Set 2x − 2 = −x + 4', 'Parallel: stop'], ans: 0, res: ['3x = 6, so x = 2', '3x = 2, so x = ⅔'], rans: 0, no: { 1: 'The slopes are 2 and −1: different.', r1: '4 + 2 = 6.' } },
            { q: 'Find y.', opts: ['Put 2 in y = 2x − 2', 'Put 2 in 3x = 6'], ans: 0, res: ['y = 2', 'y = 6'], rans: 0, why: 'Check in B: −2 + 4 = 2 ✓. They cross at (2, 2).' }
          ] },
        { k: 'sort', q: 'Cross once, parallel, or the same line?', bins: ['✖ Cross once', '∥ Parallel', '= Same line'],
          cards: [{ t: 'm = 2, b = 3 · m = 2, b = −1', b: 1 }, { t: 'm = −1, b = 4 · m = 3, b = 4', b: 0, why: 'Same b only means they cross on the y-axis. The slopes differ.' }, { t: 'y = 4x − 2 · 8x − 2y = 4', b: 2 },
            { t: 'y = −3x + 1 · 3x + y = 5', b: 1 }, { t: '(0, 0), (2, 2) · (0, 4), (4, 0)', b: 0 }, { t: '(1, 1), (2, 3) · (0, −1), (3, 5)', b: 2 }],
          why: 'Get y alone or find slopes from the points. Then compare m, then b.' },
        { k: 'number', q: 'Bus A\'s notes: *(0, 10)* and *(2, 30)*. Bus B\'s notes: *(0, 40)* and *(2, 50)*. (Minutes, km.) After how many minutes does A catch B?', ans: 6, unit: 'minutes',
          why: 'A: y = 10x + 10. B: y = 5x + 40. 10x + 10 = 5x + 40, so 5x = 30 and x = 6 minutes (both at 70 km).' },
        { k: 'number', q: 'What must *k* be so that *y = kx + 1* is parallel to the line through *(0, 0)* and *(2, 6)*?', ans: 3,
          hint: 'Parallel lines have the same slope.', why: 'The slope through (0, 0) and (2, 6) is 6 ÷ 2 = 3. So k = 3 (and b = 1 is different from 0, so they are parallel, not the same).' }
      ] }
  ]
});
