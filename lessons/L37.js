/* Review 6 of 6: the Unit 2 review, step by step (2 of 2). Forms, stories and signs, worked out by hand with the
   hands-on kinds from the inequality lessons (sfa-ineq.js): change the form one move at a time, sort equations that are
   the same line, match a story to m and b, build an equation from a story and a table, turn words into inequality
   signs, and solve a story inequality that turns the sign. Review 5 did slope and the start. */
SFA_LESSON({
  id: 'L37', n: 21.42, label: 'Review 6', title: 'Forms, Stories and Signs, Step by Step',
  game: { title: 'Unit 2 Review', file: 'review-u2.html' },
  big: 'Same line, different clothes: to get y alone, move the x-term, then divide EVERY term by the number with y. In a story, the start is b and the rate is m (it has "per" in its units). An equation never turns its sign; an inequality turns it when you multiply or divide by a negative.',
  slides: [
    { k: 'title', min: 1, kicker: 'Unit 2 Review · Step by step 2 of 2', title: 'Forms, Stories and Signs', sub: 'The same line in different clothes, the story behind the numbers, and the one rule that turns a sign around. One move at a time.', art: '🧩' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Change Ax + By = C into y = mx + b, one move at a time', 'Spot equations that are the same line', 'Say what m and b mean in a story, with units', 'Write an equation from a story and from a table', 'Turn words into inequality signs, and solve a story inequality'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'Your phone is at *80%* and loses *5%* every hour. When do you start to worry?', opts: ['Under 50%', 'Under 20%', 'When it dies', 'I never worry'] },

    { k: 'solve', min: 4, id: 'std', kick: 'Change the form', q: 'Write *3x + 2y = 8* in slope-intercept form, y = mx + b.', start: '3x + 2y = 8',
      learn: ['Get y alone: move the x-term to the other side first.', 'Then divide *every* term by the number with y, the last number too.'],
      moves: [
        { q: 'First move?', opts: ['Subtract 3x from both sides', 'Divide both sides by 2', 'Subtract 8 from both sides'], ans: 0, res: ['2y = −3x + 8', '2y = 3x + 8', '2y = −3x − 8'], rans: 0,
          hint: 'Move the x-term away from the y. It is + 3x on the left, so subtract 3x from both sides.', why: 'Subtracting 3x makes it −3x on the right.' },
        { q: 'Next move?', opts: ['Divide every term by 2', 'Subtract 2', 'Divide only the 8 by 2'], ans: 0, res: ['y = −(3/2)x + 4', 'y = −(3/2)x + 8', 'y = −3x + 4'], rans: 0,
          hint: 'y has a 2 stuck to it. Divide every term by 2: −3x and 8 too.', why: 'Every term: −3x ÷ 2 and 8 ÷ 2.' },
        { q: 'Read off the slope and the y-intercept.', opts: ['m is the number with x, b is the number on its own', 'm is the first number, b is the last'], ans: 0, res: ['m = −3/2, b = 4', 'm = 4, b = −3/2'], rans: 0,
          hint: 'In y = mx + b, m is stuck to x.' }],
      help: 'Get the 2y on its own first, then split the 2 off every term.',
      why: '3x + 2y = 8 → 2y = −3x + 8 → y = −(3/2)x + 4. Slope −3/2, y-intercept 4.',
      more: [
        { k: 'solve', q: 'Write *4x − 2y = 10* in slope-intercept form. Watch the negative.', start: '4x − 2y = 10', moves: [
          { q: 'First move?', opts: ['Subtract 4x from both sides', 'Add 2y to both sides', 'Divide by 4'], ans: 0, res: ['−2y = −4x + 10', '−2y = 4x + 10', '2y = −4x + 10'], rans: 0, hint: 'Move the + 4x: subtract 4x from both sides.' },
          { q: 'Next move?', opts: ['Divide every term by −2', 'Divide every term by 2'], ans: 0, res: ['y = 2x − 5', 'y = −2x + 5', 'y = 2x + 10'], rans: 0,
            hint: 'y has −2 stuck to it, so divide every term by −2. Every sign changes.', why: 'It\'s an equation, so there is no sign to turn: dividing by −2 just changes the sign of every term.' }],
          why: 'y = 2x − 5.', steps: ['Subtract 4x: −2y = −4x + 10.', 'Divide every term by −2: y = 2x − 5.', 'Check (0, −5): 4(0) − 2(−5) = 10 ✓.'] },
        { k: 'solve', q: 'Back the other way: write *y = (2/3)x − 4* in standard form, Ax + By = C, with A positive and no fractions.', start: 'y = (2/3)x − 4', moves: [
          { q: 'Clear the fraction first.', opts: ['Multiply every term by 3', 'Multiply every term by 2', 'Subtract 4'], ans: 0, res: ['3y = 2x − 12', '3y = 2x − 4', '2y = 3x − 8'], rans: 0, hint: 'The fraction is over 3. Times 3 clears it, so every term is multiplied by 3.' },
          { q: 'Get the x-term on the left.', opts: ['Subtract 2x from both sides', 'Add 12 to both sides'], ans: 0, res: ['−2x + 3y = −12', '2x + 3y = −12'], rans: 0, hint: 'Ax + By: x and y both on the left.' },
          { q: 'A must be positive.', opts: ['Multiply every term by −1', 'Leave it'], ans: 0, res: ['2x − 3y = 12', '2x + 3y = 12'], rans: 0, hint: 'Times −1 changes the sign of every term.' }],
          why: '2x − 3y = 12.', steps: ['Times 3: 3y = 2x − 12.', 'Subtract 2x: −2x + 3y = −12.', 'Times −1: *2x − 3y = 12*.'] },
        { k: 'number', q: 'What is the slope of *5x + y = 7*?', ans: -5, hint: 'Get y alone: subtract 5x.', why: 'y = −5x + 7, so m = −5.', steps: ['Subtract 5x from both sides.', 'y = −5x + 7.', 'The number with x: *−5*.'] }
      ] },

    { k: 'sort', min: 3, id: 'same', kick: 'Same line, different clothes', q: 'Which equations are the *same line* as *y = 2x − 4*?', bins: ['✓ Same line', '✗ Different line'],
      learn: ['Get y alone in each one and compare. Same m and same b: same line.'],
      cards: [{ t: '2x − y = 4', b: 0, why: '−y = −2x + 4, so y = 2x − 4.' }, { t: 'y − 2x = −4', b: 0 }, { t: '2x + y = 4', b: 1, why: 'y = −2x + 4: the slope is −2, not 2.' }, { t: 'y = 2(x − 2)', b: 0, why: 'Multiply out: 2x − 4.' },
        { t: '4x − 2y = 8', b: 0, why: '−2y = −4x + 8, then divide by −2: y = 2x − 4.' }, { t: 'y = 4 − 2x', b: 1, why: 'Slope −2 and b = 4: both different.' }, { t: 'x − 2y = 4', b: 1, why: 'y = ½x − 2.' }, { t: 'y + 4 = 2x', b: 0 }],
      help: 'Get y alone. Is it y = 2x − 4?',
      why: 'Five of them become y = 2x − 4. 2x + y = 4, y = 4 − 2x and x − 2y = 4 have a different slope.',
      more: [
        { k: 'build', q: 'Write *3x + y = 5* in slope-intercept form, using the tiles.', tiles: ['y', '=', '−3x', '3x', '+', '−', '5', '⅓x'], ans: ['y=−3x+5', 'y=5−3x', '−3x+5=y'],
          hint: 'Subtract 3x from both sides: y on its own on one side.', why: 'y = −3x + 5.', steps: ['3x + y = 5.', 'Subtract 3x from both sides.', 'y = −3x + 5.'] },
        { k: 'poll', q: 'Which form lets you read the slope straight away?', opts: ['y = mx + b', 'Ax + By = C', 'Both'], ans: 0,
          why: 'In y = mx + b the slope is the number with x. In standard form you have to get y alone first (or work out −A ÷ B).', steps: ['y = mx + b: m is right there.', 'Ax + By = C: get y alone first.', 'So *y = mx + b*.'] }
      ] },

    { k: 'match', min: 3, id: 'story', kick: 'What the numbers mean', q: 'A plumber charges a call-out fee plus a rate per hour: *C = 25h + 40*. Match each part to what it means.',
      learn: ['m is a *rate*: its units have "per" in them (dollars *per* hour).', 'b is the *start*: the value when x = 0, before anything happens.'],
      pairs: [['25', 'dollars per hour: the slope, m'], ['40', 'dollars before any work: the call-out fee, b'], ['h', 'hours of work: the input, x'], ['C', 'total cost in dollars: the output, y']],
      help: 'Which number gets multiplied by the hours? That one is per hour.',
      why: '25 is multiplied by h, so it is $25 per hour (m). 40 is paid even when h = 0: the call-out fee (b).',
      more: [
        { k: 'number', q: 'Use C = 25h + 40. What does the plumber charge for *3 hours*?', ans: 115, hint: '25(3) + 40.', why: '75 + 40 = $115.', steps: ['Put h = 3 in.', '25(3) = 75.', '75 + 40 = *$115*.'] },
        { k: 'build', q: 'A phone battery starts at *80%* and loses *5%* every hour. Write the equation for B, the battery left, after h hours.', tiles: ['B', '=', '80', '−5h', '5h', '+', '−', '80h'], ans: ['B=−5h+80', 'B=80−5h', '−5h+80=B', '80−5h=B'],
          hint: 'The start (80) is b. Losing 5 each hour is a slope of −5.', why: 'B = −5h + 80.', steps: ['Start: 80, that is b.', 'Down 5 every hour: m = −5.', 'B = −5h + 80.'] },
        { k: 'open', q: 'Explain what the slope *−5* means in the battery story. Use both quantities and their units.', ph: 'The slope −5 means…',
          model: 'The slope −5 means the battery goes down by 5 percent for every 1 hour that passes.',
          steps: ['Slope is a rate: change in y per change in x.', 'y is battery (%), x is time (hours).', 'So: down 5 percent per hour.'] }
      ] },

    { k: 'build', min: 3, id: 'table', kick: 'Equation from a table', q: 'Write the equation for this table, using the tiles.', tab: { head: ['x', 'y'], rows: [[0, 7], [1, 4], [2, 1], [3, -2]] },
      tiles: ['y', '=', '−3x', '3x', '+', '−', '7', '4'], ans: ['y=−3x+7', 'y=7−3x', '−3x+7=y', '7−3x=y'],
      learn: ['b: the y when x = 0. Read it from the table if it is there.', 'm: how much y changes each time x goes up 1.'],
      hint: 'At x = 0, y is 7. Each time x goes up 1, y goes down 3.',
      help: 'Find the row where x = 0. Then how much does y change from one row to the next?',
      why: 'b = 7 (the row x = 0) and m = −3 (y goes down 3 each row): y = −3x + 7.',
      more: [
        { k: 'build', q: 'This table doesn\'t start at x = 0. Write its equation.', tab: { head: ['x', 'y'], rows: [[2, 9], [4, 13], [6, 17]] }, tiles: ['y', '=', '2x', '4x', '+', '5', '9', '−'], ans: ['y=2x+5', 'y=5+2x', '2x+5=y'],
          hint: 'The slope is 4 ÷ 2 = 2. Walk back from x = 2 to x = 0 to find b.', why: 'm = 2, b = 9 − 4 = 5: y = 2x + 5.', steps: ['m = (13 − 9) ÷ (4 − 2) = 2.', 'Walk back from x = 2 to 0: y goes down 4, to 5.', 'y = 2x + 5. Check x = 6: 12 + 5 = 17 ✓.'] },
        { k: 'number', q: 'Use the table to find y when *x = 10*.', tab: { head: ['x', 'y'], rows: [[0, 7], [1, 4], [2, 1], [3, -2]] }, ans: -23, hint: 'Use the equation y = −3x + 7.', why: '−3(10) + 7 = −23.',
          steps: ['The equation is y = −3x + 7.', 'Put x = 10: −30 + 7.', '= *−23*.'] }
      ] },

    { k: 'sort', min: 3, id: 'words', kick: 'Words to signs', q: 'Sort each phrase into its inequality sign.', bins: ['<', '>', '≤', '≥'],
      learn: ['*At most*, *no more than* and *a maximum of*: the number itself is allowed, ≤.', '*At least*, *no less than* and *a minimum of*: ≥.', '*Fewer than* and *under* leave the number out: <.'],
      cards: [{ t: 'fewer than 10', b: 0 }, { t: 'more than 10', b: 1 }, { t: 'at most 10', b: 2 }, { t: 'at least 10', b: 3 }, { t: 'no more than 10', b: 2, why: 'No more than 10: 10 is allowed, anything over is not. ≤.' },
        { t: 'no less than 10', b: 3, why: 'No less than 10: 10 or more. ≥.' }, { t: 'under 10', b: 0 }, { t: 'over 10', b: 1 }, { t: 'a maximum of 10', b: 2 }, { t: 'a minimum of 10', b: 3 }],
      help: 'Ask: is 10 itself allowed? Yes: ≤ or ≥. No: < or >.',
      why: 'Is the number itself allowed? Then it has the line under it (≤ or ≥). "No more than" is the sneaky one: it means ≤.',
      more: [
        { k: 'build', q: 'A lift holds *at most 600 kg*. Doug weighs 80 kg and each crate weighs 40 kg. Write the inequality for c crates.', tiles: ['80', '+', '40c', '80c', '≤', '≥', '<', '600'], ans: ['80+40c≤600'],
          hint: 'Doug once (80), plus 40 for each crate. At most: ≤.', why: '80 + 40c ≤ 600.', steps: ['Doug: 80.', 'Each crate: 40c.', 'At most 600: 80 + 40c ≤ 600.'] },
        { k: 'nl', range: [0, 20], step: 2, ans: { at: 12, open: false, dir: 'r' }, q: 'You need *at least 12* points to pass. Graph it.', why: 'Closed dot at 12 (12 passes), shaded right.',
          steps: ['At least 12: x ≥ 12.', '12 itself counts: closed dot.', 'More than 12 also passes: shade right.'] }
      ] },

    { k: 'solve', min: 5, id: 'battery', kick: 'A story inequality', q: 'The battery: B = 80 − 5h. When is it *under 20%*? Solve *80 − 5h < 20*, then graph it.', start: '80 − 5h < 20',
      learn: ['This time it IS an inequality: dividing by a negative turns the sign.', 'Check your answer with a number from the story.'],
      moves: [
        { q: 'First move?', opts: ['Subtract 80 from both sides', 'Divide by −5', 'Add 5h'], ans: 0, res: ['−5h < −60', '−5h < 100', '5h < −60'], rans: 0 },
        { q: 'Next move?', opts: ['Divide both sides by −5', 'Divide both sides by 5'], ans: 0, res: ['h > 12', 'h < 12', 'h > −12'], rans: 0, why: 'Divided by −5: < turns into >.' }],
      graph: { range: [0, 20], at: 12, open: true, dir: 'r' }, v: 'h',
      help: 'Get the −5h on its own first. Then divide by −5, and remember what that does to the sign.',
      why: 'h > 12: after 12 hours the battery is under 20%. Check h = 14: 80 − 70 = 10, and 10 < 20 ✓.',
      more: [
        { k: 'solve', q: 'The plumber: you have *$190*. Solve *25h + 40 ≤ 190* to find the most hours you can pay for.', start: '25h + 40 ≤ 190', moves: [
          { q: 'First move?', opts: ['Subtract 40 from both sides', 'Divide by 25'], ans: 0, res: ['25h ≤ 150', '25h ≤ 230'], rans: 0 },
          { q: 'Next move?', opts: ['Divide both sides by 25', 'Divide both sides by −25'], ans: 0, res: ['h ≤ 6', 'h ≥ 6'], rans: 0, why: 'Dividing by +25: keep the sign.' }],
          why: 'h ≤ 6: at most 6 hours.', steps: ['Subtract 40: 25h ≤ 150.', 'Divide by 25 (positive, keep): h ≤ 6.', 'Check h = 6: 150 + 40 = 190 ✓.'] },
        { k: 'number', q: 'The lift: *80 + 40c ≤ 600*. What is the most crates Doug can take?', ans: 13, hint: 'Subtract 80, then divide by 40.', why: '40c ≤ 520, so c ≤ 13.',
          steps: ['Subtract 80: 40c ≤ 520.', 'Divide by 40: c ≤ 13.', 'Check: 80 + 520 = 600 ✓, so *13*.'] },
        { k: 'poll', q: 'In *−2y = 4x + 6*, you divide every term by −2. Does anything "turn around"?', opts: ['No: it is an equation, so every term just changes sign: y = −2x − 3', 'Yes: = turns into ≠', 'Yes: the y goes to the other side'], ans: 0,
          why: 'Only inequality signs turn. An equation stays an equation: y = −2x − 3.', steps: ['Divide every term by −2.', '−2y → y, 4x → −2x, 6 → −3.', 'y = −2x − 3. The = stays.'] }
      ] },

    { k: 'play', min: 6, title: 'Practise: Unit 2 Review', steps: ['Open the *Unit 2 Review*.', 'Pick the skill that felt shakiest today: changing form, stories or inequalities.', 'Guided practice first, then *On your own*.', 'Stuck? The Khan Academy videos are on the Learn tab.'], aim: 'Done when one more skill is Developed.', minutes: 6 },
    { k: 'conf', min: 1, id: 'conf', q: 'Forms, stories and inequality signs: how do you feel now?' },
    { k: 'exit', min: 4, id: 'exit', q: 'A gym charges a *$30* joining fee plus *$15* per month. Write the equation for the cost C after m months, say what 15 and 30 mean, then solve *15m + 30 ≤ 150* to find the most months you can afford.', ph: 'C = … 15 means… 30 means… 15m + 30 ≤ 150 → …',
      model: 'C = 15m + 30. 15 is the cost in dollars per month (the slope). 30 is the joining fee in dollars, paid at month 0 (the y-intercept). 15m ≤ 120, so m ≤ 8: at most 8 months.' },
    { k: 'end', title: 'Same line, the whole story.', next: 'Next: *Inequalities 1, Which Side of the Line*. One number, and everything on one side of it.' }
  ]
});
