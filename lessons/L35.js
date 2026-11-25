/* Inequalities 2 of 7: before the Unit 2 Summative launches. Two-variable inequalities on the plane: testing points,
   one side of the line, solid or dashed, shading, reading a graph, and getting y alone from a story. */
SFA_LESSON({
  id: 'L35', n: 21.46, label: 'Inequalities 2', title: 'Shade the Floor',
  game: { title: 'Unit 2 Review', file: 'review-u2.html#r3' },
  big: 'A two-variable inequality like y < 2x − 1 is true for a whole region of points. Graph the boundary line y = 2x − 1: solid for ≤ and ≥, dashed for < and >. Then test a point and shade the side where it is true.',
  slides: [
    { k: 'title', min: 1, kicker: 'Under the Pond · Inequalities 2 of 7', title: 'Shade the Floor', sub: 'In The Floor Is Lava, the safe squares were never one point. They were half the floor. Today you find out which half, and how to draw it.', art: '🌋' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Test points in inequalities with x and y', 'See that all the solutions sit on one side of a line', 'Choose a solid or dashed boundary line', 'Graph y < mx + b: plot the line, then shade the right side'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'The Floor Is Lava. Where do you stand?', opts: ['Middle of the safe side', 'Right on the edge (living dangerously)', 'Wherever my friends stand', 'I just melt'] },

    { k: 'pick', min: 4, id: 'pts', where: 'plane', range: [-5, 5], cond: 'y > x + 1', kick: 'Test the points', q: 'Which points are solutions of *y > x + 1*? Tap them.',
      cand: [[0, 3], [2, 1], [-2, 0], [1, 2], [3, 5], [-1, -3], [-3, 2]],
      learn: ['A point (x, y) is a solution if it makes the inequality *true*.', 'Put x and y in: for (0, 3), is 3 > 0 + 1?'],
      help: 'Point A is (0, 3). Put x = 0 and y = 3 in: 3 > 0 + 1?',
      why: 'A, C, E and G work. D (1, 2) gives 2 > 2: false. It sits right on the line y = x + 1.',
      more: [
        { k: 'pick', where: 'plane', range: [-5, 5], cond: 'y ≤ 2x − 1', q: 'Which points are solutions of *y ≤ 2x − 1*?', cand: [[2, 3], [0, 0], [3, 1], [-1, -4], [1, 2], [-2, 1]],
          why: '(2, 3) is on the line: 3 ≤ 3 is true, because ≤ includes equal.', steps: ['A (2, 3): 3 ≤ 2(2) − 1 = 3 ✓ (equal counts).', 'B (0, 0): 0 ≤ −1 ✗.', 'C (3, 1): 1 ≤ 5 ✓. D (−1, −4): −4 ≤ −3 ✓.', 'E (1, 2): 2 ≤ 1 ✗. F (−2, 1): 1 ≤ −5 ✗.'] },
        { k: 'poll', q: 'Is *(4, 9)* a solution of *y ≥ 2x + 1*?', opts: ['Yes: 9 ≥ 9 is true', 'No: 9 is not bigger than 9', 'Cannot tell without a graph'], ans: 0,
          why: '2(4) + 1 = 9, and 9 ≥ 9 is true. The point is on the line, and ≥ lets the line count.', steps: ['2(4) + 1 = 9.', '9 ≥ 9: equal counts for ≥.', 'Yes. It sits on the boundary line.'] },
        { k: 'number', q: 'For *y < −x + 6*, what is the *biggest whole number* y can be when x = 2?', ans: 3, hint: '−2 + 6 = 4. y must be less than 4.', why: 'y < 4, so the biggest whole number is 3.',
          steps: ['Put x = 2: y < −2 + 6.', 'y < 4.', 'Biggest whole number less than 4: *3*.'] }
      ] },

    { k: 'pick', min: 4, id: 'side', where: 'plane', range: [-5, 5], cond: 'y < 2x − 1', kick: 'Notice a pattern', q: 'Now the line *y = 2x − 1* is drawn. Tap every point that is a solution of *y < 2x − 1*. Where are they?',
      line: { m: 2, b: -1 }, cand: [[3, 1], [0, 2], [2, 0], [-2, 1], [1, -3], [-1, 2], [2, 3], [4, 2]],
      learn: ['Watch where the solutions are compared to the line.'],
      help: 'Test A (3, 1): is 1 < 2(3) − 1?',
      why: 'Every solution (A, C, E, H) is *below* the line. G (2, 3) is on the line: 3 < 3 is false. So: one line splits the plane, and one side is all solutions.',
      more: [
        { k: 'poll', q: 'For *y > −x + 2*, are the solutions above or below the line y = −x + 2?', opts: ['Above', 'Below', 'Some of each'], ans: 0,
          why: 'y > means y is bigger than the line\'s y: higher up, above. Test (0, 5): 5 > 2 ✓, and (0, 5) is above.', steps: ['y > … means bigger y.', 'Bigger y is higher: above the line.', 'Check (0, 5): 5 > 2 ✓.'] },
        { k: 'pick', where: 'plane', range: [-5, 5], cond: 'y ≥ −x + 2', line: { m: -1, b: 2, solid: true }, q: 'The solid line is y = −x + 2. Tap every solution of *y ≥ −x + 2*, including any on the line.', cand: [[0, 2], [2, 3], [-3, 1], [1, 1], [3, -2], [-1, 4]],
          why: 'Above the line, and on it (solid, ≥): A, B, D and F.', steps: ['A (0, 2): 2 ≥ 2 ✓ on the line.', 'B (2, 3): 3 ≥ 0 ✓. D (1, 1): 1 ≥ 1 ✓.', 'F (−1, 4): 4 ≥ 3 ✓. C and E are below.'] },
        { k: 'open', q: 'Why does it make sense that all the solutions are on *one side* of the line?', ph: 'Because…',
          model: 'For any x, the line gives one y. y < 2x − 1 means y is smaller than that, so the point is lower than the line. That is true for every x, so all the solutions are below it.',
          steps: ['Pick any x, say x = 3. The line is at y = 5.', 'y < 5 means any point lower than (3, 5).', 'Every x works the same way, so it is the whole region below the line.'] }
      ] },

    { k: 'sort', min: 3, id: 'dash', kick: 'Solid or dashed?', q: 'Sort each inequality by the boundary line it needs.', bins: ['━ Solid line', '┅ Dashed line'],
      learn: ['≤ and ≥: points *on* the line count, so draw it *solid*.', '< and >: they do not count, so draw it *dashed*.'],
      cards: [{ t: 'y < 3x + 1', b: 1 }, { t: 'y ≥ −x + 2', b: 0 }, { t: 'y > 2x', b: 1 }, { t: 'y ≤ x − 4', b: 0 }, { t: 'y ≥ 5', b: 0 }, { t: 'y < −2x − 3', b: 1 }, { t: 'x > 1', b: 1, why: 'x > 1 is strict: dashed. (It is a vertical line.)' }, { t: '3x + y ≤ 6', b: 0, why: 'The line under ≤: solid.' }],
      help: 'Look only at the symbol. Does it have a line under it?',
      why: 'A line under the symbol (≤, ≥) means a solid boundary. No line (<, >) means dashed.',
      more: [
        { k: 'plane', q: 'The line y = x + 2 is drawn for *y ≥ x + 2*. Choose its style.', range: [-5, 5], m: 1, b: 2, op: '>=', parts: ['style'],
          why: '≥: points on the line are solutions, so it is solid.', steps: ['The symbol is ≥.', '≥ includes equal: points on the line count.', 'Solid line.'] },
        { k: 'sort', q: 'Shade above or below the line? (y is already alone.)', bins: ['⬆️ Above', '⬇️ Below'],
          cards: [{ t: 'y > 2x + 1', b: 0 }, { t: 'y ≤ −x', b: 1 }, { t: 'y < 4', b: 1 }, { t: 'y ≥ ½x − 3', b: 0 }, { t: 'y < −3x + 2', b: 1 }, { t: 'y ≥ −5', b: 0 }],
          why: 'When y is alone on the left: > or ≥ means above, < or ≤ means below.', steps: ['y > … or y ≥ …: y is bigger, so higher: above.', 'y < … or y ≤ …: lower: below.', 'This only works when y is alone on the left.'] },
        { k: 'poll', q: 'Careful: *4 > y* (y on the right). Shade above or below y = 4?', opts: ['Above', 'Below'], ans: 1,
          why: '4 > y means y < 4: below. Read it with y first.', steps: ['Turn it round: 4 > y is y < 4.', 'y less than 4: lower.', 'Below, dashed.'] }
      ] },

    { k: 'plane', min: 4, id: 'p1', q: 'The boundary of *y > x + 1* is drawn. Choose solid or dashed, then tap a side to shade it.', range: [-5, 5], m: 1, b: 1, op: '>', parts: ['style', 'shade'],
      learn: ['Not sure which side? Use *🧪 Test a point*, like (0, 0).', 'True: shade its side. False: shade the other side.'],
      help: 'Test (0, 0): is 0 > 0 + 1?',
      why: 'Dashed (>, so the line itself does not count), shaded above. (0, 0) gives 0 > 1: false, so (0, 0)\'s side is NOT shaded.',
      more: [
        { k: 'plane', q: 'Style and shade *y ≤ −2x + 3*.', range: [-5, 5], m: -2, b: 3, op: '<=', parts: ['style', 'shade'], why: 'Solid (≤), shaded below. Test (0, 0): 0 ≤ 3 ✓, and (0, 0) is below.',
          steps: ['≤: solid line.', 'Test (0, 0): 0 ≤ −2(0) + 3 = 3 ✓.', 'Shade the side with (0, 0): below.'] },
        { k: 'plane', q: 'A flat line: style and shade *y < 3*.', range: [-5, 5], m: 0, b: 3, op: '<', parts: ['style', 'shade'], why: 'Dashed, shaded below: every point with y less than 3.',
          steps: ['y < 3 has no x: the boundary is the flat line y = 3.', '<: dashed.', 'y smaller than 3: below.'] },
        { k: 'plane', q: 'A vertical line: style and shade *x ≥ −2*.', range: [-5, 5], vx: -2, op: '>=', parts: ['style', 'shade'], why: 'Solid, shaded right: every point with x of −2 or more.',
          steps: ['x ≥ −2: the boundary is the vertical line x = −2.', '≥: solid.', 'x bigger: right of the line.'] }
      ] },

    { k: 'plane', min: 5, id: 'p2', q: 'The whole thing: graph *y < 2x − 1*. Plot two points on the line, choose its style, then shade.', range: [-5, 5], m: 2, b: -1, op: '<',
      learn: ['1. Start at b = −1 on the y-axis. Slope 2: up 2, right 1.', '2. < means dashed.', '3. Test a point off the line, then shade.'],
      help: 'Plot (0, −1) first. Then go up 2 and right 1 to (1, 1).',
      why: 'Line through (0, −1) and (1, 1), dashed, shaded below. Test (0, 0): 0 < −1 is false, so (0, 0)\'s side is not shaded.',
      more: [
        { k: 'plane', q: 'Graph *y ≥ −x + 4*.', range: [-5, 5], m: -1, b: 4, op: '>=', why: 'Through (0, 4) and (1, 3), solid, shaded above.',
          steps: ['b = 4: plot (0, 4). Slope −1: down 1, right 1 → (1, 3).', '≥: solid.', 'Test (0, 0): 0 ≥ 4 ✗ → shade the other side: above.'] },
        { k: 'plane', q: 'A fraction slope: graph *y > ½x − 2*.', range: [-5, 5], m: 0.5, b: -2, op: '>', why: 'Through (0, −2) and (2, −1), dashed, shaded above.',
          steps: ['b = −2: plot (0, −2). Slope ½: up 1, right 2 → (2, −1).', '>: dashed.', 'Test (0, 0): 0 > −2 ✓ → shade the side with (0, 0): above.'] },
        { k: 'plane', kick: 'Deep level', q: 'Graph *−2y < 4x + 6*. First get y alone. (Dividing by −2 does something to the sign!)', range: [-5, 5], m: -2, b: -3, op: '>',
          learn: ['−2y < 4x + 6 → divide every term by −2 and turn the sign: y > −2x − 3.'],
          why: 'y > −2x − 3: through (0, −3) and (−1, −1), dashed, shaded above.',
          steps: ['Divide by −2 and flip: y > −2x − 3.', 'Plot (0, −3), then down 2, right 1 → (1, −5), or up 2, left 1 → (−1, −1).', 'Dashed (>). Test (0, 0): −2(0) < 6 ✓ → shade (0, 0)\'s side: above.'] }
      ] },

    { k: 'build', min: 3, id: 'read', q: 'Read this graph. *Build* the inequality it shows.', fig: { plane: { range: [-5, 5], m: -1, b: 2, op: '<=' } },
      learn: ['Line first: find b and the slope. Solid or dashed picks the symbol type. Shaded below: <. Above: >.'],
      tiles: ['y', '<', '>', '≤', '≥', '−x', 'x', '+ 2', '− 2'], ans: ['y≤-x+2'],
      help: 'The line crosses the y-axis at 2 and goes down 1 for every 1 right. It is solid and shaded below.',
      why: 'Line y = −x + 2, solid, shaded below: y ≤ −x + 2.',
      more: [
        { k: 'build', q: 'Build the inequality for this graph.', fig: { plane: { range: [-5, 5], m: 2, b: 0, op: '>' } }, tiles: ['y', '<', '>', '≤', '≥', '2x', '−2x', '+ 1'], ans: ['y>2x'], why: 'Through (0, 0) with slope 2, dashed, shaded above: y > 2x.',
          steps: ['b = 0, slope 2: y = 2x.', 'Dashed: < or >.', 'Shaded above: y > 2x.'] },
        { k: 'match', q: 'Four graphs on the same line y = x. Match each to its inequality.',
          pairs: [['y ≥ x', { plane: { range: [-3, 3], m: 1, b: 0, op: '>=' } }], ['y > x', { plane: { range: [-3, 3], m: 1, b: 0, op: '>' } }], ['y ≤ x', { plane: { range: [-3, 3], m: 1, b: 0, op: '<=' } }], ['y < x', { plane: { range: [-3, 3], m: 1, b: 0, op: '<' } }]],
          why: 'Solid or dashed picks the line under the symbol. Above or below picks > or <.', steps: ['Solid lines: ≥ or ≤. Dashed: > or <.', 'Shaded above: ≥ or >.', 'Shaded below: ≤ or <.'] }
      ] },

    { k: 'solve', min: 3, id: 'tix', kick: 'From a story', q: 'Adult tickets cost $4 (x) and kid tickets cost $2 (y). You can spend *at most $20*: *4x + 2y ≤ 20*. Get y alone so you can graph it.', start: '4x + 2y ≤ 20',
      learn: ['Get y alone like solving: undo the 4x, then the × 2.'],
      moves: [
        { q: 'First move?', opts: ['Subtract 4x from both sides', 'Divide both sides by 4', 'Subtract 2 from both sides'], ans: 0, res: ['2y ≤ −4x + 20', '2y ≤ 4x + 20', '2y ≥ −4x + 20'], rans: 0 },
        { q: 'Next move?', opts: ['Divide every term by 2', 'Divide only the 20 by 2', 'Subtract 2'], ans: 0, res: ['y ≤ −2x + 10', 'y ≥ −2x + 10', 'y ≤ −4x + 10'], rans: 0, why: 'Divided by +2: no flip.' }],
      help: 'Move the 4x to the other side first: subtract it from both sides.',
      why: 'y ≤ −2x + 10. Now it is ready to graph: b = 10, slope −2, solid, shaded below.',
      more: [
        { k: 'solve', kick: 'Deep level', q: 'Get y alone: *−3y > 6x − 9*.', start: '−3y > 6x − 9', moves: [{ q: 'First move?', opts: ['Divide every term by −3', 'Divide every term by 3', 'Add 3y'], ans: 0, res: ['y < −2x + 3', 'y > −2x + 3', 'y < 2x − 3'], rans: 0, why: 'Dividing by −3 flips > to <, and changes every sign: 6x ÷ (−3) = −2x, −9 ÷ (−3) = 3.' }],
          why: 'y < −2x + 3.', steps: ['Divide every term by −3.', 'Flip the sign: > becomes <.', 'y < −2x + 3.'] },
        { k: 'pick', where: 'plane', range: [-1, 11], cond: '4x + 2y ≤ 20', q: 'Which ticket plans can you afford? (x adults, y kids) Tap them.', cand: [[2, 5], [3, 5], [0, 10], [4, 3], [1, 7], [5, 0]],
          why: '(2, 5) costs $18, (0, 10) $20, (1, 7) $18, (5, 0) $20: yes. (3, 5) costs $22 and (4, 3) costs $22: too much.',
          steps: ['Cost = 4x + 2y.', 'A (2, 5): 8 + 10 = 18 ✓. B (3, 5): 12 + 10 = 22 ✗.', 'C (0, 10): 20 ✓. D (4, 3): 22 ✗.', 'E (1, 7): 18 ✓. F (5, 0): 20 ✓.'] }
      ] },

    { k: 'plane', min: 4, id: 'p3', q: 'Now graph the ticket rule *y ≤ −2x + 10*. Points in the shaded part are plans you can afford.', range: [-1, 11], m: -2, b: 10, op: '<=',
      learn: ['b = 10, slope −2: down 2, right 1.', 'At most: solid. Test (0, 0): $0 ≤ $20, so shade (0, 0)\'s side.'],
      help: 'Plot (0, 10). Then down 2, right 1: (1, 8).',
      why: 'Solid line through (0, 10) and (5, 0), shaded below toward (0, 0). Only whole-number points make sense: you cannot buy half a ticket.',
      more: [
        { k: 'plane', q: 'Snacks: chips cost $3 (x), drinks $1 (y), at least $6 to get a free toy: *y ≥ −3x + 6*. Graph it.', range: [-1, 11], m: -3, b: 6, op: '>=',
          why: 'Through (0, 6) and (2, 0), solid, shaded above (away from (0, 0): spending $0 does not get a toy).', steps: ['b = 6, slope −3: (0, 6) and (1, 3), (2, 0).', 'At least: solid.', 'Test (0, 0): 0 ≥ 6 ✗ → shade the other side: above.'] },
        { k: 'open', q: 'On the ticket graph, the point (2.5, 3) is in the shaded part. Is it a real plan? Why or why not?', ph: 'It is / is not a real plan because…',
          model: 'It is not a real plan: you cannot buy 2.5 adult tickets. The shading shows every point that fits the rule, but only the whole-number points make sense in the story.',
          steps: ['Check the rule: 4(2.5) + 2(3) = 16 ≤ 20, so it fits.', 'But x is a number of tickets: it must be whole.', 'So in the story, only whole-number points count.'] }
      ] },

    { k: 'conf', min: 1, id: 'conf', q: 'Graphing inequalities on the coordinate plane: how do you feel?' },
    { k: 'exit', min: 4, id: 'exit', q: 'Describe how to graph *y ≥ −2x + 1*: the line (two points on it), solid or dashed, which side to shade, and a test point that proves it.', ph: 'Points on the line: … The line is… Shade… Test point: …',
      model: 'Points (0, 1) and (1, −1). Solid, because ≥ includes the line. Shade above. Test (0, 0): 0 ≥ 1 is false, so (0, 0)\'s side is not shaded: shade the other side, above.' },
    { k: 'end', title: 'You shaded the floor.', next: 'Next: *Inequalities 3*. The Pop-Up Arcade project starts: Marcus, Priya and Gus have to fill the old boathouse.' }
  ]
});
