SFA_LESSON({
  id: 'L19', n: 11.6, label: 'Rewind 2', title: 'The Line Home',
  film: { n: 'Rewind 2', title: 'The Line Home', len: '5:41' },
  game: { title: 'Half a Rule', file: 'g13-half-a-rule.html' },
  big: 'To graph y = mx + b: start where x is 0 (at b on the y-axis), then step: over 1, up m. A negative step goes down; a step of ½ goes over 2, up 1. A point is on the line if the rule gives its y.',
  slides: [
    { k: 'title', min: 1, kicker: 'Rewind 2', title: 'The Line Home', sub: 'Stranded in the past with no ground, the team has to lay its own track home. Every track needs a rule.', art: '🛤️' },
    { k: 'signin', min: 1, title: 'Before we start', points: ['Watch *The Line Home*', 'Graph a line: start, then step', 'Test if a point is on a line', 'Answer a quick exit ticket'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'You\'re stranded and have to build a road home. What do you build it out of?', opts: ['Bricks', 'Pudding', 'Maths', 'I\'d just wait for a bus'] },
    { k: 'poll', min: 2, id: 'hook', q: 'The rule is *y = 2x + 1*. Marcus says: "Plus one, so the track starts at *(1, 0)*." Where should it start?',
      opts: ['(1, 0)', '(0, 1)', '(2, 1)', '(1, 2)'], ans: 1,
      why: 'The start is where x is 0: y = 2 × 0 + 1 = 1. So the track starts at (0, 1), on the y-axis. Marcus put it on the x-axis and fell into the fog.' },
    { k: 'film', min: 6, title: 'Watch: The Line Home', watch: 'Watch where each track starts, and how it steps. How do they spot the fake landing pad?' },
    { k: 'open', min: 2, id: 'start', q: 'Why does the line *y = 2x + 1* start at *(0, 1)* and not at (1, 0)?', ph: 'It starts at (0, 1) because...',
      model: 'The start is where x is 0. Put 0 in: 2 × 0 + 1 = 1. So the point is (0, 1): 0 across, 1 up. (1, 0) would mean x is 1, and the rule gives 3 there, not 0.',
      help: 'Put x = 0 into the rule. What is y?',
      more: [
        { k: 'number', q: 'Where does *y = 3x + 5* start? Give the y-value where it crosses the y-axis.', ans: 5, hint: 'Put x = 0 in: 3 × 0 + 5.', why: '3 × 0 + 5 = 5. The start is (0, 5).',
          steps: ['The start is where x = 0.', 'y = 3 × 0 + 5 = 5.', 'So the line crosses the y-axis at *(0, 5)*. The number on its own is the start.'] },
        { k: 'number', q: 'Where does *y = 4x* start? Give the y-value where it crosses the y-axis.', ans: 0, hint: 'Put x = 0 in: 4 × 0.', why: 'There\'s no number on its own, so the start is 0: the line goes through (0, 0).',
          steps: ['Put x = 0 in: y = 4 × 0 = 0.', 'No number on its own means the start is *0*.', 'The line goes through (0, 0). (Zero would be proud.)'] }
      ] },
    { k: 'text', min: 1, title: 'How to graph y = mx + b', points: ['*Start*: where x is 0. That\'s the number on its own (b), on the y-axis.', '*Step*: the number with x (m). Over 1, up m.', 'A *negative* step goes down: over 1, down.', 'A *fraction* step: ½ means over 2, up 1.'] },
    { k: 'number', min: 2, id: 'next', q: 'The track is *y = 2x + 1*. How high is it at *x = 3*?', ans: 7,
      hint: 'Put 3 in: 2 × 3 + 1.', why: '2 × 3 + 1 = 7. Or count: start 1, then up 2 three times: 3, 5, 7.',
      help: 'Start at 1. Each step across goes up 2. Take three steps.',
      more: [
        { k: 'number', q: 'How high is *y = 3x − 2* at *x = 4*?', ans: 10, hint: '3 × 4 − 2.', why: '12 − 2 = 10.',
          steps: ['Put 4 in for x: y = 3 × 4 − 2.', '3 × 4 = 12.', '12 − 2 = *10*.'] },
        { k: 'number', q: 'How high is *y = −2x + 5* at *x = 4*?', ans: -3, hint: '−2 × 4 + 5.', why: '−8 + 5 = −3. The line has gone below the floor.',
          steps: ['Put 4 in for x: y = −2 × 4 + 5.', '−2 × 4 = −8.', '−8 + 5 = *−3*.'] }
      ] },
    { k: 'poll', min: 2, id: 'onit', q: 'Which landing pad is *on* the line *y = 3x − 2*? (The others are fakes.)', opts: ['(2, 4)', '(2, 5)', '(4, 9)', '(0, 2)'], ans: 0,
      why: 'Test each one: put x in and see if the rule gives the y. 3 × 2 − 2 = 4 ✓. (2, 5): 4, not 5. (4, 9): 10, not 9. (0, 2): −2, not 2.',
      help: 'For each pad, put its x into the rule. Does the answer match its y?',
      more: [
        { k: 'poll', q: 'Is *(5, 11)* on the line *y = 2x + 1*?', opts: ['Yes', 'No'], ans: 0, why: '2 × 5 + 1 = 11. The rule gives 11, so yes.',
          steps: ['Put x = 5 in: 2 × 5 + 1 = 11.', 'The pad\'s y is 11. They match.', '*Yes*, (5, 11) is on the line.'] },
        { k: 'number', q: 'The pad *(3, ?)* is on *y = −x + 9*. What is the missing y?', ans: 6, hint: '−3 + 9.', why: '−1 × 3 + 9 = 6.',
          steps: ['Put x = 3 in: y = −3 + 9.', 'y = *6*.', 'So the pad is at (3, 6).'] }
      ] },
    { k: 'poll', min: 2, id: 'graph', q: 'Which rule matches this track?', opts: ['y = 2x + 3', 'y = 3x + 2', 'y = 3x', 'y = 2x + 2'], ans: 1,
      fig: { kind: 'graph', x: [0, 4], y: [0, 14], lines: [{ pts: [[0, 2], [4, 14]], dots: false }, { pts: [[0, 2], [1, 5], [2, 8]], dots: true, only: true }] },
      why: 'It starts at 2 (where x is 0) and goes up 3 for every 1 across. Start 2, step 3: y = 3x + 2.',
      help: 'Where does the line cross the y-axis? That\'s the number on its own. Then: how far up for one across?' },
    { k: 'number', min: 2, id: 'floor', q: 'The track *y = −2x + 8* goes downhill. At what *x* does it meet the floor (where y = 0)?', ans: 4,
      hint: 'Start at 8. Count steps of −2 until you reach 0.', why: '8, 6, 4, 2, 0: four steps. It meets the floor at x = 4.',
      help: 'Start at 8. Step down 2 at a time: 8, 6, ... How many steps to get to 0?',
      more: [
        { k: 'number', q: 'Where does *y = −3x + 9* meet the floor? Give x.', ans: 3, hint: '9, 6, 3, 0.', why: 'Three steps of −3 from 9 reach 0: x = 3.',
          steps: ['Start at 9. Each step across goes down 3.', '9 → 6 → 3 → 0 is three steps.', 'So it meets the floor at *x = 3*. Check: −3 × 3 + 9 = 0. ✓'] },
        { k: 'number', q: 'Where does *y = −x + 5* meet the floor? Give x.', ans: 5, hint: 'It goes down 1 each step from 5.', why: 'Five steps of −1 from 5 reach 0.',
          steps: ['Start at 5, step −1.', '5, 4, 3, 2, 1, 0: five steps.', '*x = 5*. Check: −5 + 5 = 0. ✓'] }
      ] },
    { k: 'number', min: 2, id: 'half', q: 'The ramp is *y = ½x + 2*. How high is it at *x = 6*?', ans: 5,
      hint: 'Over 2, up 1. From x = 0 to x = 6 is three lots of "over 2".', why: '½ × 6 + 2 = 3 + 2 = 5. Or: start 2, then up 1 three times.',
      help: 'Half of 6 is 3. Then add the start.',
      more: [
        { k: 'number', q: 'How high is *y = ⅓x + 1* at *x = 6*?', ans: 3, hint: 'A third of 6, plus 1.', why: '6 ÷ 3 = 2, plus 1 is 3.',
          steps: ['⅓ of 6 is 2.', '2 + 1 = *3*.', 'In steps: over 3, up 1, twice: 1 → 2 → 3.'] },
        { k: 'number', q: 'How high is *y = −½x + 4* at *x = 4*?', ans: 2, hint: 'Half of 4 is 2. The minus means down.', why: '−2 + 4 = 2. Over 2, down 1, twice.',
          steps: ['−½ × 4 = −2.', '−2 + 4 = *2*.', 'In steps: start 4, over 2 down 1, over 2 down 1: 4 → 3 → 2.'] }
      ] },
    { k: 'poll', min: 3, id: 'marks', q: 'The last track has two glowing marks: *(0, 3)* and *(2, 7)*. Which rule lays it?', opts: ['y = 3x + 2', 'y = 2x + 3', 'y = 4x + 3', 'y = 2x + 7'], ans: 1,
      why: 'The mark at x = 0 gives the start: 3. From (0, 3) to (2, 7) is up 4 over 2, so the step is 4 ÷ 2 = 2. Start 3, step 2: y = 2x + 3.',
      help: 'Which mark is at x = 0? That\'s the start. Then: rise ÷ run between the marks is the step.',
      more: [
        { k: 'number', q: 'A line goes through *(0, −1)* and *(3, 5)*. What is its step (the number with x)?', ans: 2, hint: 'Rise 5 − (−1) = 6. Run 3.', why: '6 ÷ 3 = 2. The rule is y = 2x − 1.',
          steps: ['The start is −1 (the point where x = 0).', 'Rise = 5 − (−1) = 6. Run = 3 − 0 = 3.', 'Step = 6 ÷ 3 = *2*. Rule: y = 2x − 1.'] },
        { k: 'open', q: 'Write the rule of the line through *(0, 4)* and *(2, 0)*.', ph: 'y = ...', model: 'y = −2x + 4',
          steps: ['Start: the point with x = 0 is (0, 4), so the start is 4.', 'Step: from (0, 4) to (2, 0) is down 4 over 2: −4 ÷ 2 = −2.', 'Rule: *y = −2x + 4*. Check (2, 0): −4 + 4 = 0. ✓'] }
      ] },
    { k: 'number', min: 2, id: 'home', q: 'Home is at *(4, 11)*. Is it on *y = 2x + 3*? Put x = 4 into the rule: what y does it give?', ans: 11,
      hint: '2 × 4 + 3.', why: '8 + 3 = 11. Home is 11 up, so yes, it\'s on the line.' },
    { k: 'machine', min: 2, id: 'layer', name: 'The Track Layer', rule: '2x+3', q: 'Feed the Track Layer some x values. Try *0* first: that\'s the start. What is its rule?' },
    { k: 'open', min: 2, id: 'twins', q: 'Two tracks: *y = 2x + 1* and *y = 2x + 5*. How are they the same? How are they different?', ph: 'They are the same because... They are different because...',
      model: 'Same step (2), so they\'re equally steep: they never cross. Different starts (1 and 5), so one is always 4 higher than the other.',
      help: 'Look at the number with x in each. Then look at the number on its own.' },
    { k: 'conf', min: 1, id: 'conf', q: 'How do you feel about graphing a line from its rule?' },
    { k: 'play', min: 7, title: 'Play Half a Rule', steps: ['Open *Half a Rule*.', 'Find the start (where x is 0) and the step.', 'Every rule needs both.'], aim: 'Done when you\'ve cleared three levels.', minutes: 7 },
    { k: 'exit', min: 2, id: 'exit', q: 'Describe the line *y = −3x + 6*: where does it start, which way does it step, and where does it meet the floor?', ph: 'It starts at... It steps... It meets the floor at...',
      model: 'It starts at (0, 6). It steps over 1, down 3. It meets the floor (y = 0) at x = 2: 6, 3, 0.' },
    { k: 'end', title: 'Home again', next: 'Next: *Rewind 3: The Moment Before*. Solving for the exact input.' }
  ]
});
