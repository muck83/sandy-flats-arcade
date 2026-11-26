/* Homework: Unit 3 Lesson 3, Graphs That Are Functions. */
SFA_HW({
  id: 'g33', unit: 3, lesson: 3, topic: 'Graphs of functions and the vertical line test', title: 'The Scanner Beam', who: 'marcus',
  intro: ['Marcus found an old ghost scanner in the back room of the arcade. It shoots a *straight up-and-down beam* and slides it across any graph, from left to right.',
    'If the beam ever touches the graph in two places at once, the alarm rings: that graph is not a function. Help Marcus scan the graphs and explain every alarm.'],
  goal: 'Use the vertical line test to decide if a graph is a function, and explain it with inputs and outputs.',
  bigIdea: 'If a vertical line hits a graph twice, one input has two outputs, so the graph is not a function.',
  levels: [
    { name: 'Points on a graph', learn: ['Every point on a graph is *(input, output)*: x is the input, y is the output.', 'Two points on the same vertical line have the *same input* but different outputs.'],
      tasks: [
        { k: 'number', q: 'The graph shows three points. What is the *output* for input *4*?', fig: { range: [0, 6], pts: [[1, 2, 'A'], [2, 3, 'B'], [4, 1, 'C']], x: 'x', y: 'y' }, ans: 1, hint: 'Go across to x = 4, then up to the point. How high is it?', why: 'Point C is (4, 1): input 4, output 1.' },
        { k: 'choice', q: 'Is this set of points a function?', fig: { range: [0, 6], pts: [[1, 1], [2, 3], [3, 3], [4, 2]], x: 'x', y: 'y' }, opts: ['Yes: no two points are stacked', 'No: two points have output 3'], ans: 0,
          no: [null, 'Sharing an output is fine. Look for two points on one *vertical* line.'], why: 'Each x has one point above it. Two inputs sharing output 3 is allowed.' },
        { k: 'solve', q: 'Points: *(1, 2), (2, 3), (2, 5), (4, 1), (5, 4)*. Is this a function?', fig: { range: [0, 6], pts: [[1, 2], [2, 3], [2, 5], [4, 1], [5, 4]], x: 'x', y: 'y' }, start: '(1, 2), (2, 3), (2, 5), (4, 1), (5, 4)',
          moves: [
            { q: 'First move?', opts: ['Slide a vertical line across', 'Slide a flat line up', 'Count the points'], ans: 0, res: ['At x = 2 it hits two points', 'It never hits two points', 'At y = 2 it hits two points'], rans: 0, hint: 'The test uses a *vertical* (up-and-down) line, moving left to right.',
              no: { 1: 'A flat line tests outputs. We test inputs with a vertical line.', 2: 'The number of points does not matter.', r1: 'Look at x = 2: there are two dots above it.', r2: 'We slide a vertical line, so we look at x-values.' } },
            { q: 'Next move?', opts: ['Read those two points', 'Read every point'], ans: 0, res: ['(2, 3) and (2, 5)', '(3, 2) and (5, 2)', '(2, 3) and (4, 1)'], rans: 0, hint: 'Both points have x = 2.',
              no: { r1: 'Input comes first: (2, 3), not (3, 2).', r2: '(4, 1) is not on the line x = 2.' } },
            { q: 'Next move?', opts: ['Say it as input and outputs', 'Add the points'], ans: 0, res: ['Input 2 gives outputs 3 and 5', 'Inputs 3 and 5 give output 2', 'Input 2 gives output 8'], rans: 0, hint: 'x is the input, y is the output.',
              no: { r1: 'You swapped them. The x-value is the input.', r2: 'We do not add. Input 2 has two different outputs.' } },
            { q: 'Decide.', opts: ['Decide and give the reason', 'Decide by the shape'], ans: 0, res: ['Not a function: one input, two outputs', 'A function: most points are fine'], rans: 0, hint: 'One stacked pair is enough.',
              no: { r1: 'One input with two outputs is enough to break the rule.' }, why: 'Input 2 has outputs 3 and 5, so the alarm rings: not a function.' }
          ] }
      ] },
    { name: 'Slide the beam', learn: ['*Vertical line test*: slide an up-and-down line across the graph.', 'It hits *2 or more* points anywhere: *not* a function.', 'It always hits *at most 1* point: a function.'],
      tasks: [
        { k: 'choice', q: 'Scan this line. Is it a function?', fig: { range: [-5, 5], lines: [{ m: 2, b: -1 }], x: 'x', y: 'y' }, opts: ['Yes: every vertical line hits it once', 'No: it goes on forever'], ans: 0,
          no: [null, 'Going on forever is fine. Does a vertical line ever hit it twice?'], why: 'A slanted line has one point above each x: a function.' },
        { k: 'choice', q: 'Scan this circle. Is it a function?', fig: { range: [-5, 5], circles: [{ cx: 0, cy: 0, r: 3 }], vx: [1], x: 'x', y: 'y' }, opts: ['No: a vertical line hits it twice', 'Yes: it is a nice smooth shape'], ans: 0,
          no: [null, 'Smooth is not the test. Look at the beam at x = 1: top and bottom.'], why: 'The beam at x = 1 hits the top and the bottom of the circle: one input, two outputs.' },
        { k: 'solve', q: 'Prove the circle is *not* a function with numbers. It goes through *(0, 3)* and *(0, −3)*.', fig: { range: [-5, 5], circles: [{ cx: 0, cy: 0, r: 3 }], pts: [[0, 3], [0, -3]], x: 'x', y: 'y' }, start: 'Circle through (0, 3) and (0, −3)',
          moves: [
            { q: 'First move?', opts: ['Compare the inputs (x)', 'Compare the outputs (y) only'], ans: 0, res: ['Both have input 0', 'Inputs 3 and −3', 'Both have input 3'], rans: 0, hint: 'The input is the first number in each point.',
              no: { 1: 'Start with the inputs: are they the same?', r1: '3 and −3 are the y-values: the outputs.', r2: 'The first number in each point is 0.' } },
            { q: 'Next move?', opts: ['Compare the outputs', 'Stop here'], ans: 0, res: ['3 and −3: two different outputs', '3 and −3: the same output'], rans: 0, hint: 'Are 3 and −3 the same number?',
              no: { r1: '3 and −3 are different numbers.' } },
            { q: 'Decide.', opts: ['Decide and give the reason', 'Decide by the size'], ans: 0, res: ['Not a function: input 0 has two outputs', 'A function: it is round'], rans: 0, hint: 'Same input, two outputs.',
              why: 'Input 0 gives outputs 3 and −3. A vertical line at x = 0 hits both.' }
          ] },
        { k: 'choice', q: 'Scan the line *x = 3*. Is it a function?', fig: { range: [-5, 5], vx: [3], x: 'x', y: 'y' }, opts: ['No: input 3 has every output', 'Yes: it is a straight line'], ans: 0,
          no: [null, 'Straight is not enough. The beam at x = 3 lies right on top of it.'], why: 'Every point has input 3: (3, 0), (3, 1), (3, 2)… One input, many outputs.' }
      ] },
    { name: 'Curves and steps', learn: ['Curves can be functions too. Just scan them.', 'A U shape opening up passes. A U lying on its side fails.'],
      tasks: [
        { k: 'choice', q: 'Scan this U-shaped curve. Is it a function?', fig: { range: [-5, 5], paths: [{ p: [[-3, 4.5], [-2.5, 3.125], [-2, 2], [-1.5, 1.125], [-1, 0.5], [-0.5, 0.125], [0, 0], [0.5, 0.125], [1, 0.5], [1.5, 1.125], [2, 2], [2.5, 3.125], [3, 4.5]] }], x: 'x', y: 'y' },
          opts: ['Yes: each vertical line hits it once', 'No: it has two sides', 'No: it is curved'], ans: 0,
          no: [null, 'Two sides are fine: they are at different x-values.', 'Curved is fine. Only the beam test matters.'], why: 'Points like (−2, 2) and (2, 2) share an output, not an input. It is a function.' },
        { k: 'solve', q: 'This U is on its side: *x = y²*. It goes through *(4, 2)* and *(4, −2)*. Is it a function?', fig: { range: [-5, 5], paths: [{ p: [[4, -2], [2.25, -1.5], [1, -1], [0.25, -0.5], [0, 0], [0.25, 0.5], [1, 1], [2.25, 1.5], [4, 2]] }], pts: [[4, 2], [4, -2]], vx: [4], x: 'x', y: 'y' }, start: '(4, 2) and (4, −2)',
          moves: [
            { q: 'First move?', opts: ['Compare the inputs', 'Compare the shapes'], ans: 0, res: ['Both have input 4', 'Inputs 2 and −2'], rans: 0, hint: 'The input is the x-value: the first number.',
              no: { r1: '2 and −2 are the y-values (outputs).' } },
            { q: 'Next move?', opts: ['Compare the outputs', 'Square the inputs'], ans: 0, res: ['2 and −2: different', '2 and −2: the same'], rans: 0, hint: 'Is 2 equal to −2?',
              no: { r1: '2 and −2 are different numbers.' } },
            { q: 'Decide.', opts: ['Decide and give the reason', 'Guess'], ans: 0, res: ['Not a function: input 4 has two outputs', 'A function: it is a smooth curve'], rans: 0, hint: 'One input, two outputs: what does that mean?',
              no: { r1: 'Smooth is not the test. Input 4 has two outputs.' }, why: 'Turn the U on its side and the beam at x = 4 hits it twice.' }
          ] },
        { k: 'sort', q: 'Function or not? Imagine each graph.', bins: ['Function', 'Not a function'],
          cards: [{ t: 'a U opening up (y = x²)', b: 0 }, { t: 'a U on its side (x = y²)', b: 1 }, { t: 'a flat line (y = 4)', b: 0, why: 'Each input has one output: 4.' }, { t: 'an up-and-down line (x = 2)', b: 1 }, { t: 'a circle', b: 1 }, { t: 'a slanted straight line', b: 0 }, { t: 'dots, none stacked', b: 0 }],
          why: 'Picture the beam sliding across. Two hits at once: not a function.' }
      ] },
    { name: 'Stories as graphs', learn: ['First decide: what is the *input*? It goes on the x-axis.', 'Height of a ball over *time*: at each moment, one height. A function.', 'Turn it around and the answer can change.'],
      tasks: [
        { k: 'choice', q: 'Zero throws a beach ball up. The input is *time*, the output is *height*. Is time → height a function?', fig: { range: [0, 5], yrange: [0, 5], paths: [{ p: [[0, 0], [0.5, 1.75], [1, 3], [1.5, 3.75], [2, 4], [2.5, 3.75], [3, 3], [3.5, 1.75], [4, 0]] }], x: 'time (s)', y: 'height (m)' },
          opts: ['Yes: at each moment there is one height', 'No: the ball comes back down'], ans: 0,
          no: [null, 'Coming down is fine. At any one moment, the ball is at one height.'], why: 'Each time has one height, so the graph passes the vertical line test.' },
        { k: 'solve', q: 'Now turn it around: *height → time*. Use the graph. Is it a function?', fig: { range: [0, 5], yrange: [0, 5], paths: [{ p: [[0, 0], [0.5, 1.75], [1, 3], [1.5, 3.75], [2, 4], [2.5, 3.75], [3, 3], [3.5, 1.75], [4, 0]] }], lines: [{ m: 0, b: 3, dash: true, col: '#c2410c' }], pts: [[1, 3], [3, 3]], x: 'time (s)', y: 'height (m)' }, start: 'input: height 3 m',
          moves: [
            { q: 'First move?', opts: ['Find when the height is 3 m', 'Find the height at 3 s'], ans: 0, res: ['At t = 1 s and t = 3 s', 'Only at t = 1 s', 'At t = 2 s'], rans: 0, hint: 'Follow the dashed line at height 3. Where does it hit the curve?',
              no: { 1: 'The input is now the height. Start at 3 m.', r1: 'The dashed line hits the curve twice: going up and coming down.', r2: 'At 2 s the ball is at 4 m, the top.' } },
            { q: 'Decide.', opts: ['Decide and give the reason', 'Decide by the top point'], ans: 0, res: ['Not a function: 3 m gives two times', 'A function: the ball goes up once'], rans: 0, hint: 'One input (3 m), how many outputs?',
              no: { r1: 'The input 3 m has two outputs: 1 s and 3 s.' }, why: 'Height 3 m happens on the way up and on the way down. Height → time is not a function.' }
          ] },
        { k: 'sort', q: 'Function or not?', bins: ['Function', 'Not a function'],
          cards: [{ t: 'time → height of a ball', b: 0 }, { t: 'height → time of a ball', b: 1 }, { t: 'day → highest temperature', b: 0 }, { t: 'temperature → day', b: 1, why: 'Two days can have the same temperature.' }, { t: 'minutes parked → parking fee', b: 0 }],
          why: 'Ask: can one input have two outputs?' }
      ] },
    { name: 'The alarm boss', boss: true, learn: ['Open dot: the point is *not* on the graph. Closed dot: it is.', 'Mixed graphs. Scan every one.'],
      tasks: [
        { k: 'choice', q: 'The beach car park: the fee jumps every hour. Is this graph a function?', fig: { range: [0, 4], yrange: [0, 8], step: 1, ystep: 2, paths: [{ p: [[0, 2], [1, 2]] }, { p: [[1, 4], [2, 4]] }, { p: [[2, 6], [3, 6]] }], pts: [[0, 2], [1, 4], [2, 6], [1, 2, '', 'open'], [2, 4, '', 'open'], [3, 6, '', 'open']], x: 'hours', y: 'SAR' },
          opts: ['Yes: each input has one output', 'No: it has jumps', 'No: x = 1 has two dots'], ans: 0,
          no: [null, 'Jumps are fine if no input has two outputs.', 'At x = 1, one dot is open: that point is not on the graph.'], why: 'At every x, only one point counts. The open dots are not included.' },
        { k: 'solve', q: 'Look at *x = 1* on the car park graph. How many outputs does input 1 have?', start: 'x = 1: open dot at (1, 2), closed dot at (1, 4)',
          moves: [
            { q: 'First move?', opts: ['Remember what an open dot means', 'Count every dot'], ans: 0, res: ['Open: the point is not included', 'Open: the point counts twice'], rans: 0, hint: 'Open dot: not on the graph.' },
            { q: 'Next move?', opts: ['Count the outputs at x = 1', 'Count the jumps'], ans: 0, res: ['One output: 4', 'Two outputs: 2 and 4'], rans: 0, hint: 'Only the closed dot counts.' },
            { q: 'Decide.', opts: ['Decide and give the reason', 'Guess'], ans: 0, res: ['A function: input 1 gives only 4', 'Not a function: two dots at x = 1'], rans: 0,
              why: 'Parked 1 hour? You pay 4 SAR. Only one fee for each time.' }
          ] },
        { k: 'choice', q: 'Is this a function?', fig: { range: [0, 6], pts: [[1, 4], [2, 1], [2, 5], [4, 3], [5, 2]], x: 'x', y: 'y' }, opts: ['No: input 2 has two outputs', 'Yes: the points are spread out'], ans: 0,
          no: [null, 'Look at x = 2: two points are stacked.'], why: '(2, 1) and (2, 5) are on one vertical line.' },
        { k: 'choice', q: 'Which two points prove a graph is *not* a function?', opts: ['(1, 5) and (1, −2)', '(1, 5) and (3, 5)', '(0, 0) and (2, 2)', '(4, 1) and (1, 4)'], ans: 0,
          no: [null, 'These share an output, not an input. That is fine.', 'Different inputs: fine.', 'Different inputs: 4 and 1.'], why: 'Same input 1, different outputs 5 and −2.' },
        { k: 'choice', q: 'Gus says: "*y = 4* is not a function, because every input gives 4." Is he right?', opts: ['No: each input has one output, 4', 'Yes: the outputs are all the same', 'Yes: it is a flat line'], ans: 0,
          no: [null, 'Many inputs can share one output.', 'A flat line passes the vertical line test.'], why: 'The beam hits the flat line once at every x. It is a function.' }
      ] }
  ]
});
