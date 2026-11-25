/* Inequalities 3 of 5: the Unit 2 Summative's lesson 3 (Part 3: graph the system). Taught on the Pond Boat Hire
   (k kayaks, p pedal boats): dock 3k + 4p ≤ 48 · budget 100k + 200p ≤ 2000 · k ≥ 2 · 0 ≤ p ≤ 7 · takings 15k + 40p > 120.
   Axis crossings: dock (16, 0) (0, 12) · budget (20, 0) (0, 10) · takings (8, 0) (0, 3). Dock and budget cross at (8, 6). */
SFA_LESSON({
  id: 'L31', n: 21.7, label: 'Inequalities 3', title: 'Graph the System',
  game: { title: 'Unit 2 Summative', file: 'summative-u2.html#p3' },
  big: 'Graph each boundary from where it crosses the axes: solid for ≤ and ≥, dashed for < and >. A test point like (0, 0) tells you which side to keep. The feasible region is where every limit\'s side overlaps, and its corners are where two boundaries meet.',
  slides: [
    { k: 'title', min: 1, kicker: 'Unit 2 Summative · Lesson 3 of 5', title: 'Graph the System', sub: 'Five limits, one grid. Today the system turns into a picture, and the plans that work turn into one shaded region.', art: '🗺️' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Find where a boundary crosses each axis', 'Choose solid or dashed, and test a point to choose a side', 'Shade the region where every limit is met', 'Read a crossing point and check it', 'Do Part 3 of the summative'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'In The Floor Is Lava, where were the safe squares?', opts: ['On one side of the line', 'Right on the line', 'Everywhere', 'I just melt'] },

    { k: 'match', min: 3, id: 'cross', kick: 'Where it crosses the axes', q: 'Match each boundary to where it crosses an axis.',
      learn: ['Crosses the k-axis: put *p = 0*. Crosses the p-axis: put *k = 0*.', 'Two crossings are two points: enough to draw the line.'],
      pairs: [['3k + 4p = 48 crosses the k-axis at', '(16, 0)'], ['3k + 4p = 48 crosses the p-axis at', '(0, 12)'], ['100k + 200p = 2000 crosses the k-axis at', '(20, 0)'], ['100k + 200p = 2000 crosses the p-axis at', '(0, 10)']],
      help: 'For the k-axis, cover up the p term: 3k = 48, so k = 16.',
      why: 'Dock: 3k = 48 gives (16, 0), 4p = 48 gives (0, 12). Budget: 100k = 2000 gives (20, 0), 200p = 2000 gives (0, 10).',
      more: [
        { k: 'number', q: 'Where does the takings boundary *15k + 40p = 120* cross the k-axis? k = ?', ans: 8, hint: 'Put p = 0: 15k = 120.', why: '(8, 0).', steps: ['p = 0: 15k = 120.', 'k = 120 ÷ 15 = *8*.'] },
        { k: 'number', q: 'And the p-axis? p = ?', ans: 3, hint: 'Put k = 0: 40p = 120.', why: '(0, 3).', steps: ['k = 0: 40p = 120.', 'p = *3*.'] },
        { k: 'sort', q: 'Solid or dashed boundary?', bins: ['━ Solid', '┅ Dashed'],
          cards: [{ t: '3k + 4p ≤ 48', b: 0 }, { t: '100k + 200p ≤ 2000', b: 0 }, { t: '15k + 40p > 120', b: 1, why: 'More than $120: points on the line take in exactly $120, which is not enough. Dashed.' }, { t: 'k ≥ 2', b: 0 }, { t: 'p ≤ 7', b: 0 }],
          why: 'Only the takings line is dashed.', steps: ['≤ and ≥: solid.', '>: dashed.', 'Only the takings rule uses >.'] }
      ] },

    { k: 'plane', min: 4, id: 'dock', kick: 'One boundary', q: 'Graph the dock limit *p ≤ −¾k + 12*. Plot two points on the boundary, choose solid or dashed, then shade.', range: [0, 20], vars: ['k', 'p'], m: -0.75, b: 12, op: '<=',
      hint: 'Use the axis crossings: (0, 12) and (16, 0).',
      learn: ['Easiest two points: the axis crossings, (0, 12) and (16, 0).', 'Test (0, 0): 0 ≤ 12 is true, so keep the side with (0, 0).'],
      help: 'Tap (0, 12) on the p-axis and (16, 0) on the k-axis.',
      why: 'Solid line from (0, 12) to (16, 0), shaded below toward (0, 0).',
      more: [
        { k: 'plane', q: 'Graph the budget: *p ≤ −½k + 10*.', range: [0, 20], vars: ['k', 'p'], m: -0.5, b: 10, op: '<=', hint: 'Axis crossings: (0, 10) and (20, 0).', why: 'Solid, from (0, 10) to (20, 0), shaded below.',
          steps: ['Crossings (0, 10) and (20, 0).', '≤: solid.', 'Test (0, 0): 0 ≤ 10 ✓, shade toward it.'] },
        { k: 'plane', q: 'Graph the takings: *p > −⅜k + 3*.', range: [0, 20], vars: ['k', 'p'], m: -0.375, b: 3, op: '>', hint: 'Axis crossings: (0, 3) and (8, 0).', why: 'Dashed, from (0, 3) to (8, 0), shaded above, away from (0, 0).',
          steps: ['Crossings (0, 3) and (8, 0).', '>: dashed.', 'Test (0, 0): 0 > 3 ✗, so shade the other side: above.'] },
        { k: 'plane', q: 'Graph the lifeguard rule: *k ≥ 2*.', range: [0, 20], vars: ['k', 'p'], vx: 2, op: '>=', why: 'A solid vertical line at k = 2, shaded right.',
          steps: ['k = 2 is a vertical line.', '≥: solid.', 'Bigger k: shade right.'] }
      ] },

    { k: 'pick', min: 4, id: 'region', kick: 'The feasible region', where: 'plane', range: [0, 20], vars: ['k', 'p'], region: 'end',
      lines: [{ m: -0.75, b: 12, solid: true, lab: [12.2, 4.6, 'dock'] }, { m: -0.5, b: 10, solid: true, lab: [16.5, 2.7, 'budget'] }, { m: -0.375, b: 3, solid: false, lab: [6.3, 1.7, 'takings'] }, { vx: 2, solid: true, lab: [2.4, 17, 'k = 2'] }, { m: 0, b: 7, solid: true, lab: [16, 7.6, 'p = 7'] }],
      cond: 'k ≥ 2, p ≥ 0, p ≤ 7, 3k + 4p ≤ 48, 100k + 200p ≤ 2000, 15k + 40p > 120',
      cand: [[6, 7], [10, 6], [12, 3], [4, 1], [1, 8], [8, 4], [14, 4], [3, 5]],
      q: 'All five boundaries are drawn. Tap every plan that passes *all* of them. Then look at where they are.',
      learn: ['Each limit keeps one side of its line. The *feasible region* is where all the kept sides overlap.', 'A point on a solid line counts. A point on the dashed line does not.'],
      help: 'Is the point below the dock and budget lines, above the dashed line, right of k = 2 and below p = 7?',
      why: 'A, C, F and H pass every limit, and they all sit inside one shaded region. That region is every plan the boat hire could choose.',
      more: [
        { k: 'poll', q: 'A plan sits exactly on the dashed takings line. Is it allowed?', opts: ['No: it takes in exactly $120, and the rule is more than $120', 'Yes: lines always count', 'Only if it is whole numbers'], ans: 0,
          why: 'Dashed means the line itself is left out.', steps: ['On the line: 15k + 40p = 120.', 'The rule is > 120.', 'Not allowed.'] },
        { k: 'sort', q: 'Inside the region, on its edge, or outside?', bins: ['Inside', 'On a solid edge', 'Outside'],
          cards: [{ t: '(8, 4)', b: 0 }, { t: '(12, 3)', b: 1, why: '3(12) + 4(3) = 48: exactly on the dock line, which is solid. It counts.' }, { t: '(6, 7)', b: 1, why: 'On p = 7 and on the budget line: a corner.' }, { t: '(14, 4)', b: 2, why: 'Dock: 42 + 16 = 58 m², too much.' }, { t: '(4, 1)', b: 2, why: 'Takings: 60 + 40 = $100, not more than $120.' }],
          why: 'Edge points on solid lines are allowed; they use a limit up exactly.', steps: ['Test each limit.', 'Exactly equal on a solid line: on the edge, allowed.', 'Any limit broken: outside.'] }
      ] },

    { k: 'sort', min: 2, id: 'both', kick: 'Where two lines cross', q: 'Which points are on *both* the dock line 3k + 4p = 48 and the budget line 100k + 200p = 2000?', bins: ['On both', 'Dock only', 'Budget only', 'Neither'],
      learn: ['Read the crossing from the graph, then *check* it in both equations.'],
      cards: [{ t: '(8, 6)', b: 0, why: '24 + 24 = 48 and 800 + 1200 = 2000.' }, { t: '(4, 9)', b: 1, why: '12 + 36 = 48, but 400 + 1800 = 2200.' }, { t: '(16, 0)', b: 1 }, { t: '(10, 5)', b: 2, why: '30 + 20 = 50 (not 48), but 1000 + 1000 = 2000.' }, { t: '(20, 0)', b: 2 }, { t: '(6, 6)', b: 3 }],
      help: 'Put each point into 3k + 4p. Is it 48? Then into 100k + 200p. Is it 2000?',
      why: '(8, 6) is on both lines: that is where they cross, a corner of the region.',
      more: [
        { k: 'number', q: 'Check (8, 6) in the dock equation: 3(8) + 4(6) = ?', ans: 48, hint: '24 + 24.', why: '48 ✓: it is on the dock line.', steps: ['3(8) = 24.', '4(6) = 24.', '24 + 24 = *48* ✓.'] },
        { k: 'open', q: 'Why is reading a point off the graph not enough? What does the check add?', ph: 'Reading it is not enough because…',
          model: 'Graphs are drawn by hand, so a point can look like (8, 6) but really be (8, 5.8). Putting it into both equations proves it is exactly on both lines.',
          steps: ['A hand-drawn graph can be a little off.', 'The equations are exact.', 'If it fits both, it really is the crossing.'] }
      ] },

    { k: 'play', min: 18, title: 'Your turn: Summative Part 3', file: 'summative-u2.html#p3', btn: '📄 Open Part 3', minutes: 18,
      steps: ['Questions 10 to 13. ★ CORE first: 10, 11 and 13.', 'Careful with the grid: across is *2 machines per square*, up is 1.', 'Label every line. Staff pay is dashed. Use a test point for each side.', 'Keep your graph: it is the centre of your Part 5 plan.'],
      aim: 'Done when the region is shaded and the Part 3 self-check matches.' },
    { k: 'number', min: 1, id: 'chk', kick: 'Part 3 self-check', q: 'Add up your three *c-axis* crossings from question 10.', ans: 69,
      hint: 'For the c-axis put h = 0 in each boundary line, then solve for c.', why: 'That matches the self-check.',
      more: [
        { k: 'number', q: 'And your three *h-axis* crossings added up?', ans: 28, hint: 'Put c = 0 in each boundary line, then solve for h.', why: 'That matches.',
          steps: ['h-axis: put c = 0.', 'Solve each boundary for h.', 'Add the three.'] }
      ] },
    { k: 'conf', min: 1, id: 'conf', q: 'Graphing a system and shading the feasible region: how do you feel?' },
    { k: 'end', title: 'Part 3: the system on one grid.', next: 'Keep your graph. Next lesson: *Inequalities 4* and Part 4, making the decision.' }
  ]
});
