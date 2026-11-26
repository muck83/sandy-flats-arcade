/* Homework: Unit 3 Lesson 11, Stretch It or Flip It. */
SFA_HW({
  id: 'g41', unit: 3, lesson: 11, topic: 'Stretch it or flip it', title: 'Zero\'s Multiplier', who: 'zero',
  intro: ['Zero built a *Multiplier Machine* for the arcade token booth. Tokens cost *4 riyals* each, so the normal price is *f(x) = 4x* for x tokens.',
    'Zero\'s machine takes a number *a* and makes a new price *g(x) = a · f(x)*: double price on festival night, sales, and a strange minus button. Find out what each number does to the graph.'],
  goal: 'Stretch, compress or flip a graph: write g(x) = a · f(x) as mx + b and say steeper, flatter or flipped.',
  bigIdea: 'g(x) = a · f(x) multiplies every output by a: a > 1 is steeper, 0 < a < 1 is flatter, a < 0 flips it over the x-axis.',
  levels: [
    { name: 'Steeper or flatter?', learn: ['*g(x) = a · f(x)* multiplies *every output* by a.', 'a > 1: *steeper* (a stretch). 0 < a < 1: *flatter* (a compression).', 'a < 0: the graph *flips* over the x-axis.'],
      tasks: [
        { k: 'choice', q: 'Festival night: *g(x) = 2 · f(x)*, where *f(x) = 4x*. What happens to the prices?', opts: ['Every price doubles: the graph is steeper', 'Every price goes up 2 riyals', 'Every price halves: flatter', 'The graph flips over'], ans: 0,
          no: [null, 'Times 2 is not + 2. Each output is multiplied.', 'Times 2 makes outputs bigger, not smaller.', 'Only a negative a flips the graph.'], why: '4 tokens cost 16 riyals instead of 8. Bigger outputs: a steeper line.' },
        { k: 'fill', q: 'Fill in the table for *f(x) = 4x*. Multiply each output of f.', head: ['x', 'f(x)', '2 · f(x)', '½ · f(x)'], rows: [[0, 0, 0, 0], [1, 4, { a: 8 }, { a: 2 }], [2, 8, { a: 16 }, { a: 4 }], [3, 12, { a: 24 }, { a: 6 }]],
          hint: 'Use the f(x) column. Double it, then halve it.', why: '2 · f grows twice as fast, ½ · f half as fast. At x = 0 all three are 0.' },
        { k: 'sort', q: 'What does each multiplier do to the graph of f?', bins: ['Steeper', 'Flatter', 'Flipped'],
          cards: [{ t: '3 · f(x)', b: 0 }, { t: '0.5 · f(x)', b: 1 }, { t: '−f(x)', b: 2, why: '−f(x) means −1 · f(x). A negative a flips the graph.' }, { t: '1.5 · f(x)', b: 0, why: '1.5 is bigger than 1, so the graph is steeper.' },
            { t: '¼ · f(x)', b: 1, why: '¼ is between 0 and 1, so the graph is flatter.' }, { t: '−2 · f(x)', b: 2, why: 'It is negative, so it flips (and it is steeper too).' }] },
        { k: 'solve', q: '*f(x) = 6x* and *g(x) = 2 · f(x)*. Write g(x) and describe the change.', start: 'g(x) = 2 · f(x)',
          moves: [
            { q: 'What first?', opts: ['Replace f(x) with 6x', 'Add 2 to 6x', 'Replace x with 2'], ans: 0, res: ['g(x) = 2 · 6x', 'g(x) = 2 + 6x', 'g(x) = 2 · 6'], rans: 0,
              hint: 'f(x) is a name for 6x. Swap it in.', no: { 1: 'It says 2 · f(x): multiply, do not add.', 2: 'x stays x. The 2 multiplies the output.', r1: 'The dot means times.', r2: 'Keep the x: f(x) = 6x.' } },
            { q: 'Next move?', opts: ['Multiply 2 × 6', 'Add 2 + 6'], ans: 0, res: ['g(x) = 12x', 'g(x) = 8x', 'g(x) = 3x'], rans: 0,
              hint: '2 · 6x: multiply the numbers.', no: { 1: 'The dot means multiply.', r1: '2 + 6 is 8. We multiply: 2 × 6.', r2: 'That is 6 ÷ 2. We multiply.' } },
            { q: 'Steeper, flatter or flipped?', opts: ['Compare the slopes 6 and 12', 'Compare the y-intercepts'], ans: 0, res: ['12 > 6: steeper, a stretch', '12 > 6: flatter, a compression', 'Flipped over the x-axis'], rans: 0,
              hint: 'Both start at (0, 0). Look at the slopes.', no: { 1: 'Both intercepts are 0. The slopes tell you more.', r1: 'A bigger slope is steeper.', r2: '12 is positive, so it is not flipped.' }, why: 'a = 2 is bigger than 1: the slope doubles from 6 to 12.' }
          ] }
      ] },
    { name: 'Sales and price rises', learn: ['*25% off*: you pay 100% − 25% = 75%, so *a = 0.75*.', 'Half price: a = ½. Double: a = 2. Up 50%: a = 1.5.', 'Multiply *every term* of f by a.'],
      tasks: [
        { k: 'solve', q: 'Token sale: *25% off* the normal price *f(x) = 4x*. Write the sale price g(x).', start: 'Sale: 25% off f(x) = 4x',
          moves: [
            { q: 'Turn "25% off" into a multiplier.', opts: ['Pay 100% − 25% = 75%', 'Use 25% as the multiplier', 'Subtract 25 from 4x'], ans: 0, res: ['a = 0.75', 'a = 0.25', 'a = 75'], rans: 0,
              hint: '25% is what you save. What do you still pay?', no: { 1: '25% is what you save. You pay what is left.', 2: '25% off is a percent of the price, not 25 riyals.', r1: '75% as a decimal is 0.75.', r2: '75% is 75 out of 100: 0.75.' } },
            { q: 'Next move?', opts: ['Multiply: 0.75 · 4x', 'Subtract: 4x − 0.75'], ans: 0, res: ['g(x) = 3x', 'g(x) = 3.25x', 'g(x) = 4.75x'], rans: 0,
              hint: 'g(x) = a · f(x). 0.75 × 4 = ?', no: { 1: 'g(x) = a · f(x): multiply.', r1: '0.75 × 4: three quarters of 4.', r2: 'Multiplying by less than 1 makes it smaller.' } },
            { q: 'Check one input.', opts: ['Test x = 2 in f and g', 'No need to check'], ans: 0, res: ['f(2) = 8, g(2) = 6, 0.75 × 8 = 6 ✓', 'f(2) = 8, g(2) = 2'], rans: 0,
              hint: 'Always test a point.', no: { 1: 'A quick check catches mistakes. Test x = 2.', r1: 'g(2) = 3 × 2.' }, why: 'The sale line g(x) = 3x is flatter than 4x: a compression.' }
          ] },
        { k: 'solve', q: 'Festival night doubles a price with a fee: *f(x) = 3x + 2*. Write *g(x) = 2 · f(x)*.', start: 'g(x) = 2 · f(x)',
          moves: [
            { q: 'What first?', opts: ['Replace f(x) with (3x + 2)', 'Replace x with 2'], ans: 0, res: ['g(x) = 2(3x + 2)', 'g(x) = 2 · 3x + 2', 'g(x) = 2 + 3x + 2'], rans: 0,
              hint: 'Brackets around the whole rule.', no: { 1: 'x stays x. The 2 multiplies the output.', r1: 'Without brackets only 3x is doubled. The whole price doubles.', r2: 'The 2 multiplies. It is not added.' } },
            { q: 'Next move?', opts: ['Multiply 2 by both terms', 'Multiply 2 by 3x only'], ans: 0, res: ['g(x) = 6x + 4', 'g(x) = 6x + 2', 'g(x) = 5x + 4'], rans: 0,
              hint: 'Every output doubles, so the fee doubles too.', no: { 1: 'The 2 multiplies everything in the brackets.', r1: 'The fee doubles too: 2 × 2 = 4.', r2: '2 × 3x is 6x.' }, why: 'Slope 3 → 6 (steeper) and the intercept 2 → 4 also doubles.' }
          ] },
        { k: 'number', q: 'Normal price *f(x) = 8x*. Half-price day: *g(x) = ½ · f(x)*. Find *g(5)*.', ans: 20, unit: 'riyals', hint: 'f(5) = 40. Now take half.', why: 'g(5) = ½ × 40 = 20. Or g(x) = 4x, so g(5) = 20.' },
        { k: 'choice', q: 'Prices go *up by 50%*. Which multiplier a does Zero type in?', opts: ['a = 1.5', 'a = 0.5', 'a = 50', 'a = −1.5'], ans: 0,
          no: [null, '0.5 would make prices half. Up 50% is 100% + 50%.', '50% is not 50. Write 150% as a decimal.', 'Negative flips the graph. Prices go up.'], why: '100% + 50% = 150% = 1.5.' }
      ] },
    { name: 'Flip it', learn: ['*a < 0* flips the graph over the x-axis: uphill becomes downhill.', 'Every output changes sign. A minus in front changes *both* signs inside the brackets.', 'A point with output 0 stays put.'],
      tasks: [
        { k: 'choice', q: 'The graph shows *f(x) = 2x* and *g(x) = −f(x)* (dashed). What happened?', fig: { range: [-4, 4], lines: [{ m: 2, b: 0, lab: 'f' }, { m: -2, b: 0, dash: true, lab: 'g' }], x: 'x', y: 'y' },
          opts: ['It flipped over the x-axis', 'It moved down 2', 'It got flatter', 'It moved left'], ans: 0,
          no: [null, 'Both lines still go through (0, 0), so nothing moved down.', 'It is just as steep, but downhill.', 'Both still go through (0, 0).'], why: 'Every output changed sign: (1, 2) became (1, −2). Uphill became downhill.' },
        { k: 'solve', q: '*f(x) = 2x − 4* and *g(x) = −f(x)*. Write g(x) as mx + b.', start: 'g(x) = −f(x)',
          moves: [
            { q: 'What first?', opts: ['Replace f(x) with (2x − 4)', 'Make only the 2 negative'], ans: 0, res: ['g(x) = −(2x − 4)', 'g(x) = −2x − 4', 'g(x) = (2x − 4) − 1'], rans: 0,
              hint: 'Keep the brackets: the minus works on the whole rule.', no: { 1: 'The minus works on the whole output, not just the slope.', r1: 'Too fast! Keep the brackets first.', r2: '−f(x) means −1 times f(x), not minus 1.' } },
            { q: 'Next move?', opts: ['Change the sign of both terms', 'Change the sign of 2x only'], ans: 0, res: ['g(x) = −2x + 4', 'g(x) = −2x − 4', 'g(x) = 2x + 4'], rans: 0,
              hint: '−(2x) and −(−4).', no: { 1: 'The minus multiplies everything in the brackets.', r1: '−(−4) is +4.', r2: '−(2x) is −2x.' }, why: 'Slope 2 → −2 and intercept −4 → 4: flipped over the x-axis.' }
          ] },
        { k: 'pair', q: 'The point *(3, 5)* is on f. *g(x) = −f(x)*. Where does the point go on g?', ans: [3, -5], hint: 'Same input. The output changes sign.', why: '(3, 5) flips to (3, −5).' },
        { k: 'choice', q: 'A tank fills at 5 litres a minute: *f(t) = 5t*. A second tank *loses* 5 litres a minute. Which rule shows its change in water?',
          opts: ['g(t) = −f(t) = −5t', 'g(t) = f(t) − 5', 'g(t) = ½ · f(t)', 'g(t) = 5 · f(t)'], ans: 0,
          no: [null, 'That is 5 less than f, but it still goes up.', 'That still goes up, just slower.', 'That goes up 25 litres a minute.'], why: 'Losing water is a negative change: the same rate, flipped.' }
      ] },
    { name: 'Graph it', learn: ['Multiply the slope of f by a.', 'f(x) = x goes through (0, 0), and so does every a · x.'],
      tasks: [
        { k: 'plane', q: '*f(x) = x*. Graph *g(x) = 3 · f(x)*: tap two points on it.', range: [-5, 5], m: 3, b: 0, op: '=', parts: ['line'],
          hint: 'g(x) = 3x. Start at (0, 0), then up 3, right 1.', why: 'g(x) = 3x: three times as steep as y = x.' },
        { k: 'plane', q: '*f(x) = 2x*. Graph *g(x) = −½ · f(x)*.', range: [-5, 5], m: -1, b: 0, op: '=', parts: ['line'],
          hint: '−½ × 2x = −x. Start at (0, 0), then down 1, right 1.', why: 'g(x) = −x: flatter than 2x and flipped.' },
        { k: 'match', q: '*f(x) = x*. Match each rule to its graph.', range: [-5, 5],
          pairs: [['2 · f(x)', { plane: { range: [-5, 5], m: 2, b: 0 } }], ['½ · f(x)', { plane: { range: [-5, 5], m: 0.5, b: 0 } }], ['−f(x)', { plane: { range: [-5, 5], m: -1, b: 0 } }], ['−3 · f(x)', { plane: { range: [-5, 5], m: -3, b: 0 } }]],
          why: 'All go through (0, 0). 2x steep uphill, ½x gentle uphill, −x downhill, −3x steep downhill.' },
        { k: 'choice', q: 'Which point is on *all* of y = x, y = 2x, y = ½x and y = −x?', opts: ['(0, 0)', '(1, 1)', '(1, 2)', '(0, 1)'], ans: 0,
          no: [null, '(1, 1) is only on y = x.', '(1, 2) is only on y = 2x.', 'Put x = 0 into each rule. What is y?'], why: 'a × 0 = 0 for every a, so (0, 0) never moves.' }
      ] },
    { name: 'The machine boss', boss: true, learn: ['Mixed questions, fewer hints. Brackets, multiply every term, then say steeper, flatter or flipped.'],
      tasks: [
        { k: 'solve', q: 'Delivery tokens: *f(x) = 4x + 8*. A 25% sale: *g(x) = 0.75 · f(x)*. Write g(x).', start: 'g(x) = 0.75 · f(x)',
          moves: [
            { q: 'What first?', opts: ['Replace f(x) with (4x + 8)', 'Take 0.75 from 4x'], ans: 0, res: ['g(x) = 0.75(4x + 8)', 'g(x) = 0.75 · 4x + 8'], rans: 0 },
            { q: 'Next move?', opts: ['Multiply 0.75 by both terms', 'Multiply 0.75 by 4x only'], ans: 0, res: ['g(x) = 3x + 6', 'g(x) = 3x + 8', 'g(x) = 3.25x + 7.25'], rans: 0,
              no: { r1: 'The 8 is part of the price, so it is on sale too: 0.75 × 8 = 6.' }, why: 'Slope 4 → 3 and intercept 8 → 6: flatter, a compression.' }
          ] },
        { k: 'solve', q: '*f(x) = −3x + 6* and *g(x) = −⅓ · f(x)*. Write g(x) as mx + b.', start: 'g(x) = −⅓ · f(x)',
          moves: [
            { q: 'What first?', opts: ['Replace f(x) with (−3x + 6)', 'Replace x with −⅓'], ans: 0, res: ['g(x) = −⅓(−3x + 6)', 'g(x) = −⅓ − 3x + 6'], rans: 0 },
            { q: 'Next move?', opts: ['Multiply −⅓ by both terms', 'Multiply −⅓ by −3x only'], ans: 0, res: ['g(x) = x − 2', 'g(x) = −x − 2', 'g(x) = x + 6'], rans: 0,
              no: { r1: '−⅓ × −3x: negative times negative is positive.', r2: 'The 6 is multiplied too: −⅓ × 6 = −2.' }, why: 'Slope −3 → 1: flipped (downhill to uphill) and flatter.' }
          ] },
        { k: 'number', q: '*f(x) = 10x*. *g(x) = 0.8 · f(x)*. Find *g(15)*.', ans: 120, hint: 'f(15) = 150. Then 0.8 × 150.', why: 'g(x) = 8x, so g(15) = 120.' },
        { k: 'choice', q: 'Marcus says: "*g(x) = ½ · f(x)* is steeper, because you multiply." Is he right?', opts: ['No: times ½ makes outputs smaller, flatter', 'Yes: multiplying always makes it steeper', 'No: it flips the graph'], ans: 0,
          no: [null, 'Try it: ½ × 8 = 4. The outputs get smaller.', 'Only a negative a flips it. ½ is positive.'], why: '0 < ½ < 1, so every output is halved: a flatter line.' }
      ] }
  ]
});
