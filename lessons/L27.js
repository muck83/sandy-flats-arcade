SFA_LESSON({
  id: 'L27', n: 21.3, label: 'Review 3', title: 'Tell the Whole Story',
  game: { title: 'Unit 2 Review', file: 'review-u2.html' },
  big: 'Every linear story has a start (b) and a rate (m). Write y = mx + b, then solve for what you don\'t know. "At most" is ≤, "at least" is ≥. Explain with both quantities and their units.',
  slides: [
    { k: 'title', min: 1, kicker: 'Unit 2 Review · 3 of 4', title: 'Tell the Whole Story', sub: 'Words, a table, a graph and an equation can all tell the same story. Today you translate between them, add inequalities, and explain what the numbers mean.', art: '📖' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Write an equation from a story and solve for an unknown', 'Write, solve and graph an inequality', 'Explain what the slope and y-intercept mean, with units', 'Find and fix a mistake in someone\'s work'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'Your phone is at 80% and loses 5% every hour. What do you do?', opts: ['Charge it now', 'Wait until 20%', 'Low power mode', 'Let it die, it builds character'] },
    // retrieval warm-up: slope, b and changing form from Reviews 1 and 2 (retr: true marks them for the planner)
    { k: 'number', min: 1, id: 'r1', retr: true, q: '*Warm-up 1 of 3.* What is the slope of the line through *(0, 4)* and *(2, 10)*?', ans: 3,
      hint: 'Top: 10 − 4. Bottom: 2 − 0.', why: '(10 − 4) ÷ (2 − 0) = 6 ÷ 2 = 3.', help: 'Change in y goes on top. Change in x goes on the bottom.' },
    { k: 'number', min: 1, id: 'r2', retr: true, q: '*Warm-up 2 of 3.* In *y = −2x + 7*, what is *b*, the y-intercept?', ans: 7,
      hint: 'b is the number on its own: the value of y when x = 0.', why: 'When x = 0, y = 7. Today b is the *start* of a story.', help: 'Put x = 0. What is y?' },
    { k: 'number', min: 1, id: 'r3', retr: true, q: '*Warm-up 3 of 3.* Write *6x + 2y = 10* as y = mx + b. What is the slope?', ans: -3,
      hint: '2y = −6x + 10. Now divide every term by 2.', why: 'y = −3x + 5, so the slope is −3.', help: 'Move the 6x to the other side first. Then divide every term by 2.' },
    { k: 'text', min: 2, title: 'Start and rate', points: ['*Start* (b): the value when x = 0. "A $25 sign-up fee", "a 300-litre tank".', '*Rate* (m): the change for each 1 of x. "$12 per month", "drains 15 litres a minute".', 'Going down? The slope is *negative*.', 'Equation: *y = (rate)·x + (start)*.'] },
    { k: 'ex', min: 2, kick: 'Example · Story → equation → solve', title: 'Going up', q: 'A gym charges *$30* to join plus *$15* a month. When has Kai paid *$150*?',
      steps: [
        { t: 'Start: b = [[~30]]. Rate: m = [[~15]] per month.', eq: 'y = [[15]]x + [[30]]' },
        { t: 'Put in what you know: y = 150.', eq: '[[150]] = 15x + 30' },
        { t: 'Undo the + 30 first.', eq: '[[120]] = 15x' },
        { t: 'Then divide by 15: x = [[8]] months.', eq: 'Check: 15([[~8]]) + 30 = 150 ✓' }
      ] },
    // we do: a faded example. The class writes the equation and solves it (pairs, then cold call) before the question on their own
    { k: 'ex', min: 2, wedo: true, kick: 'We do · Finish it together', title: 'Going down', q: 'A pool holds *600 L* and drains *40 L* a minute. When are *200 L* left?',
      fig: { kind: 'graph', x: [0, 16], y: [0, 700], xl: 'minutes', yl: 'litres', lines: [{ pts: [[0, 600], [15, 0]] }] },
      steps: [
        { t: 'Your turn: find the start and the rate. It is going *down*, so the rate is negative.', eq: 'y = [[−40]]x + [[600]]' },
        { t: 'Set y = 200 and subtract 600.', eq: '200 = −40x + 600  →  [[−400]] = −40x' },
        { t: 'Divide by −40: x = [[10]] minutes.', eq: 'Check: −40([[~10]]) + 600 = 200 ✓', fig: { kind: 'graph', x: [0, 16], y: [0, 700], xl: 'minutes', yl: 'litres', lines: [{ pts: [[0, 600], [15, 0]] }, { pts: [[10, 200]], dots: true, only: true }], labels: [[10, 200, '(10, 200)']] } }
      ] },
    { k: 'ex', min: 2, opt: true, kick: 'Extra example · Story → equation → solve', title: 'Two data points', q: 'A plumber charges *$110* for 2 hours and *$190* for 4 hours. What is the call-out fee?',
      steps: [
        { t: 'The points are (2, 110) and (4, 190). Rate first.', eq: 'm = (190 − 110) ÷ (4 − 2) = [[80]] ÷ [[2]] = [[40]]' },
        { t: 'Put one point into y = mx + b.', eq: '110 = 40(2) + b  →  110 = [[80]] + b' },
        { t: 'b = [[~30]]: a $[[~30]] call-out fee, then $40 an hour.', eq: 'y = 40x + [[30]]' }
      ] },
    { k: 'number', min: 4, id: 'st1', q: 'A climbing gym charges a *$25* sign-up fee plus *$12* per month. Sam has paid *$121* in total. How many months has Sam been a member?', ans: 8,
      hint: 'y = 12x + 25. Put y = 121, subtract 25, divide by 12.', why: '121 − 25 = 96, and 96 ÷ 12 = 8 months.',
      help: 'Which number is the start? Which is the rate?',
      more: [
        { k: 'number', q: 'A water tank holds *300* litres and drains *15* litres every minute. After how many minutes are *120* litres left?', ans: 12, hint: 'y = −15x + 300. Set y = 120.', why: '120 − 300 = −180, and −180 ÷ −15 = 12.',
          steps: ['Start 300, rate −15 (draining): y = −15x + 300.', '120 = −15x + 300 → −180 = −15x.', 'x = *12* minutes.'] },
        { k: 'number', q: 'A taxi costs a starting fee plus a price per km. *3 km* costs *$13* and *7 km* costs *$25*. What is the starting fee?', ans: 4, hint: 'Slope first: (25 − 13) ÷ (7 − 3). Then work back to 0 km.', why: 'Rate $3 per km. 13 − 3 × 3 = 4.',
          steps: ['Rate: (25 − 13) ÷ (7 − 3) = 12 ÷ 4 = 3 dollars per km.', '13 = 3(3) + b → b = 13 − 9.', 'Starting fee: *$4*. y = 3x + 4.'] },
        { k: 'number', q: 'A candle is *24 cm* tall and burns *1.5 cm* per hour. After how many hours is it *9 cm* tall?', ans: 10, hint: 'y = −1.5x + 24.', why: '9 − 24 = −15, and −15 ÷ −1.5 = 10.',
          steps: ['y = −1.5x + 24.', '9 = −1.5x + 24 → −15 = −1.5x.', 'x = *10* hours.'] }
      ] },
    { k: 'ex', min: 2, kick: 'Example 1 of 2 · Four representations', title: 'One story, four ways', q: 'Lena has *$40* and saves *$15* a week.',
      steps: [
        { t: '*Words → equation*: start [[~40]], rate [[~15]].', eq: 'y = [[15]]x + [[40]]' },
        { t: '*Table*: start at week 0 with $40, then add 15 each row.', fig: { kind: 'table', head: ['weeks', 'dollars'], rows: [[0, 40], [1, 55], [2, 70], [3, 85]], hi: [0] } },
        { t: '*Graph*: crosses the y-axis at 40 and goes up 15 for each week.', fig: { kind: 'graph', x: [0, 6], y: [0, 140], xl: 'weeks', yl: 'dollars', lines: [{ pts: [[0, 40], [6, 130]] }, { pts: [[0, 40], [1, 55], [2, 70], [3, 85]], dots: true, only: true }], labels: [[0, 40, '(0, 40)']] } },
        { t: 'The same two numbers are in every one: *start 40, rate 15*.' }
      ] },
    { k: 'ex', min: 2, wedo: true, kick: 'We do · Finish it together', title: 'Table → equation', q: 'Write the equation for this table.',
      fig: { kind: 'table', head: ['x', 'y'], rows: [[0, 9], [2, 5], [4, 1], [6, -3]] },
      steps: [
        { t: 'Start: at x = 0, y = 9, so b = [[9]].', fig: { kind: 'table', head: ['x', 'y'], rows: [[0, 9], [2, 5], [4, 1], [6, -3]], hi: [0] } },
        { t: 'Rate: y goes down 4 while x goes up 2.', eq: 'm = −4 ÷ 2 = [[−2]]' },
        { t: 'Your turn: write the equation.', eq: 'y = [[−2]]x + [[9]]' },
        { t: 'Check a row: (4, 1).', eq: '−2(4) + 9 = 1 ✓', fig: { kind: 'table', head: ['x', 'y'], rows: [[0, 9], [2, 5], [4, 1], [6, -3]], hi: [2] } }
      ] },
    { k: 'cross', min: 3, id: 'rep', q: 'Lena has *$40* and saves *$15* a week. Cross out every table that does *not* match her savings.', opts: ['Weeks 0, 1, 2: $40, $55, $70', 'Weeks 0, 1, 2: $15, $55, $95', 'Weeks 0, 1, 2: $0, $15, $30', 'Weeks 1, 2, 3: $40, $55, $70'], ans: 0,
      why: 'Start at $40 when x = 0, then add $15 each week: 40, 55, 70.',
      help: 'What does she have at week 0?',
      more: [
        { k: 'poll', q: 'Which equation matches the table x: 0, 1, 2 and y: 9, 6, 3?', opts: ['y = −3x + 9', 'y = 3x + 9', 'y = 9x − 3', 'y = −3x'], ans: 0, why: 'Start 9, goes down 3 each step.',
          steps: ['When x = 0, y = 9: b = 9.', 'y goes down 3 for each 1 of x: m = −3.', '*y = −3x + 9*.'] },
        { k: 'poll', q: 'A graph starts at (0, 50) and goes down to (10, 0). Which story fits?', opts: ['A $50 gift card, spending $5 a day for 10 days', 'Saving $5 a day starting with $0', 'A $10 fee plus $50 a day', 'Spending $50 a day'], ans: 0, why: 'Start 50, slope (0 − 50) ÷ 10 = −5: losing 5 each day.',
          steps: ['Start: 50.', 'Slope: −50 ÷ 10 = −5.', 'Starts at $50, goes down $5 a day: *the gift card*.'] },
        { k: 'open', q: 'Describe a story that matches *y = 20x + 100*. Say what x and y are.', ph: 'x is... y is... The 100 means... The 20 means...',
          model: 'x is the number of weeks and y is money saved in dollars. I start with $100 and save $20 every week.',
          steps: ['100 is the start (when x = 0).', '20 is the rate: the change each 1 of x.', 'Any story with a start of 100 that grows by 20 per unit works.'] }
      ] },
    { k: 'text', min: 2, title: 'Inequalities', points: ['*At most*, no more than → *≤*.   *At least*, no less than → *≥*.', 'Solve like an equation. Dividing by a negative? Turn the sign.', 'Graph y ≤ … or y ≥ …: *solid* line. y < … or y > …: *dashed* line.', 'Shade *above* for y > or y ≥, *below* for y < or y ≤. Test (0, 0) to check.'] },
    { k: 'ex', min: 2, kick: 'Example 1 of 3 · Inequalities', title: 'At most', q: 'You have *$40*. A cinema ticket is *$12* and snacks are *$4* each. How many snacks can you buy at most?',
      steps: [
        { t: '"At most $40" means *≤ 40*.', eq: '[[12]] + [[4]]x ≤ 40' },
        { t: 'Subtract 12 from both sides.', eq: '4x ≤ [[28]]' },
        { t: 'Divide by 4.', eq: 'x ≤ [[7]]' },
        { t: 'At most *7 snacks*. Check: 7 snacks cost 12 + 28 = 40 ✓, 8 snacks cost 44 ✗.' }
      ] },
    { k: 'ex', min: 2, wedo: true, kick: 'We do · Finish it together', title: 'Turn the sign', q: 'Solve *20 − 3x ≥ 5*.',
      steps: [
        { t: 'Subtract 20 from both sides.', eq: '−3x ≥ [[−15]]' },
        { t: 'Divide by −3. Dividing by a negative *turns the sign*.', eq: 'x ≤ [[5]]' },
        { t: 'Check with a number: x = 0 gives 20 ≥ 5 ✓. x = 6 gives 2 ≥ 5 ✗. So x ≤ 5 is right.' }
      ] },
    { k: 'ex', min: 2, kick: 'Example 3 of 3 · Inequalities', title: 'Graph an inequality', q: 'Graph *y < 2x − 1*.',
      fig: { kind: 'graph', x: [-3, 4], y: [-4, 5], lines: [] },
      steps: [
        { t: 'Draw y = 2x − 1 as a [[dashed|dotted]] line: < has no "or equal to".', fig: { kind: 'graph', x: [-3, 4], y: [-4, 5], lines: [{ pts: [[-1.5, -4], [3, 5]], dash: true }] } },
        { t: 'Test (0, 0): is 0 < 2(0) − 1? That is 0 < [[−1]]: [[false|no]].', fig: { kind: 'graph', x: [-3, 4], y: [-4, 5], lines: [{ pts: [[-1.5, -4], [3, 5]], dash: true }, { pts: [[0, 0]], dots: true, only: true }], labels: [[0, 0, '(0, 0)', 'l']] } },
        { t: '(0, 0) is not a solution, so shade the other side: [[below|under]] the line.', fig: { kind: 'graph', x: [-3, 4], y: [-4, 5], lines: [{ pts: [[-1.5, -4], [3, 5]], dash: true }, { pts: [[0, 0]], dots: true, only: true }], labels: [[0, 0, '(0, 0)', 'l']], shade: [{ pts: [[-1.5, -4], [3, 5]], above: false }] } }
      ] },
    { k: 'order', min: 2, id: 'ord1', q: 'A phone plan costs *$20* a month plus *$5* per GB. You can spend *at most $45*. Put the steps in order to find the most GB you can use.',
      steps: ['Write it: 20 + 5x ≤ 45', 'Subtract 20 from both sides: 5x ≤ 25', 'Divide both sides by 5: x ≤ 5', 'Say it in words: at most 5 GB', 'Check: 5 GB costs 20 + 25 = $45 ✓, and 6 GB would cost $50 ✗'],
      hint: 'Write the inequality first. The check comes last.', why: 'Write it, undo the + 20, undo the × 5, answer in words, then check. Dividing by a positive number: the sign stays.' },
    { k: 'number', min: 4, id: 'iq1', q: 'You have *$50* for the fair. Entry is *$8* and each ride is *$6*. What is the *greatest* number of rides you can take?', ans: 7,
      hint: '8 + 6x ≤ 50. Subtract 8, divide by 6, round down.', why: '6x ≤ 42, x ≤ 7. Seven rides cost 8 + 42 = 50, which is allowed.',
      help: '"Have $50" means you can spend at most 50. Which symbol?',
      more: [
        { k: 'number', q: 'You need *at least 100* points. You have *28* and earn *8* per puzzle. What is the *fewest* puzzles?', ans: 9, hint: '28 + 8x ≥ 100.', why: '8x ≥ 72, x ≥ 9.',
          steps: ['28 + 8x ≥ 100.', '8x ≥ 72.', 'x ≥ 9: the fewest is *9*.'] },
        { k: 'poll', q: 'Which inequality is graphed with a *dashed* line and shading *below*?', opts: ['y < 2x + 1', 'y ≤ 2x + 1', 'y > 2x + 1', 'y ≥ 2x + 1'], ans: 0, why: 'Dashed: not "or equal to" (< or >). Below: less than. So y < 2x + 1.',
          steps: ['Dashed → < or >.', 'Below → less than.', '*y < 2x + 1*.'] },
        { k: 'number', q: 'A bag can hold *at most 20 kg*. It weighs *2 kg* empty. Each book is *1.5 kg*. What is the greatest number of books?', ans: 12, hint: '2 + 1.5x ≤ 20.', why: '1.5x ≤ 18, x ≤ 12.',
          steps: ['2 + 1.5x ≤ 20.', '1.5x ≤ 18.', 'x ≤ *12* books.'] }
      ] },
    { k: 'poll', min: 3, id: 'iq2', q: 'Is the point *(0, 0)* a solution of *y > −x + 3*?', opts: ['Yes: 0 > 3 is true', 'No: 0 > 3 is false, so (0, 0) is not shaded', 'Yes, every point is', 'Only if the line is solid'], ans: 1,
      why: 'Put x = 0, y = 0: 0 > 0 + 3 means 0 > 3, which is false. The shading is on the other side of the line from (0, 0): above.',
      help: 'Replace x and y with 0. Is it true?',
      more: [
        { k: 'poll', q: 'For *y ≤ 3x − 2*, which side is shaded and what kind of line?', opts: ['Below, solid', 'Below, dashed', 'Above, solid', 'Above, dashed'], ans: 0, why: '≤: solid line, shade below.',
          steps: ['≤ includes "or equal to": solid.', 'Less than: below the line.', '*Below, solid*.'] },
        { k: 'poll', q: 'Is *(2, 5)* a solution of *y ≥ 2x + 1*?', opts: ['Yes: 5 ≥ 5', 'No: 5 is not more than 5', 'No: it is below the line', 'Only for a dashed line'], ans: 0, why: '2(2) + 1 = 5, and 5 ≥ 5 is true (the line counts).',
          steps: ['2x + 1 at x = 2 is 5.', 'Is 5 ≥ 5? Yes.', 'It is *on the solid line*, so it counts.'] },
        { k: 'open', q: 'Explain why y < 2x + 1 has a dashed line but y ≤ 2x + 1 has a solid one.', ph: 'Because...',
          model: 'Points on the line make y exactly equal to 2x + 1. For ≤ those points count, so the line is drawn solid. For < "equal" is not allowed, so the line is dashed to show its points are not solutions.',
          steps: ['On the line: y = 2x + 1 exactly.', '≤ allows equal: the line is part of the answer (solid).', '< does not: dashed.'] }
      ] },
    { k: 'text', min: 2, title: 'Explain it like a mathematician', points: ['Slope: "For every 1 *[x unit]*, the *[y]* goes *up/down* by *[m]* *[y units]*."', 'y-intercept: "At 0 *[x units]*, the *[y]* is *[b]*."', 'Name both quantities and the units.', 'Check: does your equation give the right value for one data point?'] },
    { k: 'ex', min: 2, kick: 'Example 1 of 2 · Explain', title: 'Going up', q: '*y = 12x + 25* is the cost in dollars of x months of guitar lessons.',
      steps: [
        { t: '*12 is the slope*: "For every 1 month, the cost goes [[up]] by $[[12]]."' },
        { t: '*25 is the y-intercept*: "At [[0]] months, the cost is $[[25]]." It is a starting fee.' },
        { t: 'Check the units: 12 is dollars per month, 25 is dollars.' }
      ] },
    { k: 'ex', min: 2, wedo: true, kick: 'We do · Finish it together', title: 'Going down', q: '*y = −3x + 45* is the battery left (%) after x hours of gaming.',
      steps: [
        { t: '*−3*: "For every 1 hour, the battery goes [[down]] by [[3]]%."' },
        { t: '*45*: "At [[0]] hours, the battery is at [[45]]%."' },
        { t: 'Weak: "−3 is the slope." Strong: it names both quantities, the direction and the units.' }
      ] },
    { k: 'open', min: 4, id: 'mean', q: 'A pond is modelled by *y = −4x + 90*, where x is days after a storm and y is the depth in cm. Explain what *−4* and *90* mean.', ph: 'The −4 means... The 90 means...',
      model: 'The −4 means the pond gets 4 cm shallower every day. The 90 means the pond was 90 cm deep right after the storm (day 0).',
      help: 'Which number is the rate and which is the start? Use "cm" and "day".',
      more: [
        { k: 'poll', q: 'A phone plan costs *y = 10x + 30* dollars for x GB of data. What does 30 mean?', opts: ['The monthly price with no data used', '$30 per GB', '30 GB included', 'It goes down by $30'], ans: 0, why: 'When x = 0, y = 30: the price with no data.',
          steps: ['30 is b, the value when x = 0.', 'x = 0 means no data.', 'So *$30 is the price before any data*.'] },
        { k: 'poll', q: 'Which explanation of the slope in *y = 2.5x + 5* (y = cost of a taxi in $, x = km) is best?', opts: ['The cost goes up by $2.50 for every km', 'It is 2.5', 'The taxi costs $2.50', 'The cost starts at $2.50'], ans: 0, why: 'A strong explanation names the quantities, the direction and the units.',
          steps: ['2.5 is the rate: change in cost per 1 km.', 'Positive: the cost goes up.', '*$2.50 more for every km*.'] },
        { k: 'number', q: 'In *y = −4x + 90*, after how many days is the pond *50 cm* deep?', ans: 10, hint: '50 = −4x + 90.', why: '−40 = −4x, x = 10.',
          steps: ['50 = −4x + 90.', 'Subtract 90: −40 = −4x.', 'x = *10* days.'] }
      ] },
    { k: 'asn', min: 3, opt: true, id: 'fix', q: 'When you solve an inequality, the sign turns around.', ans: 1,
      eg: 'When does it turn? Give an example.', ph: 'It turns when...',
      why: 'Only when you multiply or divide both sides by a *negative* number. 30 − 4x ≥ 6 → −4x ≥ −24 → x ≤ 6 (turned). But 2x + 4 ≥ 10 → 2x ≥ 6 → x ≥ 3 (not turned).',
      model: 'Marcus solved 30 − 4x ≥ 6 and wrote x ≥ 6. He divided by −4 without turning the sign. Check x = 7: 30 − 28 = 2, which is not ≥ 6. It should be x ≤ 6.',
      help: 'Try one where you divide by a negative number, and one where you divide by a positive number.',
      more: [
        { k: 'poll', q: 'Doug writes *"at most 12"* as *x ≥ 12*. Is that right?', opts: ['No: at most means x ≤ 12', 'Yes', 'No: it means x < 12', 'No: it means x = 12'], ans: 0, why: 'At most 12: 12 or less, so ≤.',
          steps: ['"At most" = no more than.', '12 or anything below.', '*x ≤ 12*.'] },
        { k: 'number', q: 'Solve *50 − 5x > 20*. What is the greatest *whole number* x?', ans: 5, hint: '−5x > −30. Divide by −5 and turn the sign.', why: 'x < 6, so the greatest whole number is 5.',
          steps: ['−5x > −30.', 'Divide by −5, turn the sign: x < 6.', 'Greatest whole number: *5*. (6 is not allowed: < not ≤.)'] },
        { k: 'open', q: 'Explain how plugging in a number can catch a mistake in an inequality answer.', ph: 'If I pick a number...',
          model: 'Pick a number your answer says works and put it in the original inequality. If it makes the inequality false, the answer is wrong (often the sign should have turned). Also try a number the answer says does not work.',
          steps: ['Choose a value inside your answer.', 'Substitute it in the original inequality.', 'False → the answer (or its sign) is wrong.'] }
      ] },
    { k: 'conf', min: 1, id: 'conf', q: 'Stories, inequalities and explaining: how ready are you for the formative?' },
    { k: 'play', min: 8, title: 'Practise: Unit 2 Review', steps: ['Open the *Unit 2 Review*.', 'Do the *Represent* and *Explain* skills.', 'Then try *🔀 Mixed review*: it is like the assessment.', 'Stuck? Guided practice, or the Khan Academy video on the Learn tab.'], aim: 'Done when every success criterion shows Emerging or better.', minutes: 8 },
    { k: 'exit', min: 3, id: 'exit', q: 'A tank starts with *200 L* and fills at *25 L* per minute. Write the equation, explain what each number means, and find when it holds *at least 450 L*.', ph: 'Equation... The 25 means... The 200 means... At least 450 L when...',
      model: 'y = 25x + 200. 25 means 25 more litres every minute; 200 means the tank had 200 L at the start. 25x + 200 ≥ 450 → 25x ≥ 250 → x ≥ 10: after 10 minutes or more.' },
    { k: 'end', title: 'Ready for Unit 2.', next: 'Next: *Review 4, Find the Start*. Working out b, the y-intercept, when you cannot just read it.' }
  ]
});
