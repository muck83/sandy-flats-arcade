/* Homework: Unit 3 Lesson 5, Domain and Range. */
SFA_HW({
  id: 'g35', unit: 3, lesson: 5, topic: 'Domain and range', title: 'Festival Gatekeeper', who: 'one',
  intro: ['The Sandy Flats Beach Festival is open! One is the gatekeeper. Every stall has a rule, like *cost = 5 × rides*. But the rules work for any number, and real life does not.',
    'Nobody can buy −2 rides or 3.5 boat trips. Help One decide which inputs make sense and which outputs can really happen at each stall.'],
  goal: 'Choose a sensible domain and range for a real situation, and tell discrete from continuous.',
  bigIdea: 'The domain is the inputs that make sense, the range is the outputs you get, and the situation decides both.',
  levels: [
    { name: 'At the gate', learn: ['The *domain* is all the allowed *inputs* (x-values).', 'The *range* is all the *outputs* (y-values) you can get.', 'Ask: "Can the input be 2.5?" No: *discrete* (dots). Yes: *continuous* (a line).'],
      tasks: [
        { k: 'choice', q: 'A ride costs 5 SAR. Cost: *C(n) = 5n* for n rides. Which input makes *no sense*?', opts: ['n = 2.5', 'n = 0', 'n = 3', 'n = 6'], ans: 0,
          no: [null, '0 rides makes sense: you just watch.', 'You can take 3 rides.', 'You can take 6 rides if you have 30 SAR.'], why: 'You cannot take half a ride. Rides come in whole numbers.' },
        { k: 'choice', q: 'What is the *domain* of a function?', opts: ['All the inputs that are allowed', 'All the outputs you can get', 'The biggest number on the graph'], ans: 0,
          no: [null, 'That is the range.', 'The domain is a set of inputs, not one number.'], why: 'Domain: inputs (x). Range: outputs (y).' },
        { k: 'sort', q: 'Discrete (whole steps, dots) or continuous (any value, a line)? Sort the *inputs*.', bins: ['Discrete', 'Continuous'],
          cards: [{ t: 'number of rides', b: 0 }, { t: 'minutes swimming', b: 1, why: 'You can swim 2.5 minutes: any value.' }, { t: 'kilograms of sand', b: 1 }, { t: 'number of goals', b: 0 }, { t: 'litres of water', b: 1 }, { t: 'people on a bus', b: 0, why: 'You cannot have 3.5 people.' }],
          why: 'Things you count are discrete. Things you measure are continuous.' }
      ] },
    { name: 'Count the rides', learn: ['Find the *biggest input* the situation allows.', 'Discrete: list the inputs in { } and put each one in to get the range.'],
      tasks: [
        { k: 'solve', q: 'Rides cost 5 SAR each: *C(n) = 5n*. Zero has *30 SAR*. Find the domain and range.', start: 'C(n) = 5n, wallet 30 SAR',
          moves: [
            { q: 'First move?', opts: ['Find the biggest input', 'Find the smallest output', 'Multiply 5 × 30'], ans: 0, res: ['30 ÷ 5 = 6 rides', '30 − 5 = 25 rides', '5 × 30 = 150 rides'], rans: 0, hint: 'How many 5s fit into 30?',
              no: { 2: '5 × 30 is the cost of 30 rides. Zero only has 30 SAR.', r1: 'Each ride takes 5 SAR, so divide.', r2: 'That would cost 750 SAR!' } },
            { q: 'Next move?', opts: ['List the inputs', 'Draw a line'], ans: 0, res: ['Domain: {0, 1, 2, 3, 4, 5, 6}', 'Domain: 0 ≤ n ≤ 6, any number', 'Domain: {1, 2, 3, 4, 5}'], rans: 0, hint: 'Whole rides only, from 0 up to 6.',
              no: { 1: 'Rides are discrete: dots, not a line.', r1: '"Any number" would allow 2.5 rides.', r2: '0 rides is allowed, and so is 6 (6 × 5 = 30).' } },
            { q: 'Next move?', opts: ['Put each input in', 'Copy the domain'], ans: 0, res: ['Range: {0, 5, 10, 15, 20, 25, 30}', 'Range: {0, 1, 2, 3, 4, 5, 6}', 'Range: 0 to 30, any number'], rans: 0, hint: '5 × 0, 5 × 1, 5 × 2 …',
              no: { 1: 'The range is the outputs (costs), not the inputs.', r1: 'Those are the inputs. Times each by 5.', r2: 'Only multiples of 5 can come out.' } },
            { q: 'Last move?', opts: ['Discrete or continuous?', 'Stop'], ans: 0, res: ['Discrete: draw dots', 'Continuous: draw a line'], rans: 0, hint: 'Can you take 2.5 rides?',
              no: { r1: 'No half rides, so no line between the dots.' }, why: '7 dots: (0, 0), (1, 5) … (6, 30).' }
          ] },
        { k: 'fill', q: 'Juice costs 8 SAR a cup, at most 5 cups: *J(c) = 8c*. Fill in the outputs.', head: ['c (cups)', 'J (SAR)'], rows: [[0, { a: 0 }], [1, { a: 8 }], [2, { a: 16 }], [3, { a: 24 }], [4, { a: 32 }], [5, { a: 40 }]], hint: 'Multiply each number of cups by 8.', why: 'Range: {0, 8, 16, 24, 32, 40}.' },
        { k: 'number', q: 'Same juice stall. What is the *biggest* number in the range?', ans: 40, unit: 'SAR', hint: 'The most cups is 5. 5 × 8 = ?', why: '5 cups cost 40 SAR: the biggest output.' },
        { k: 'choice', q: 'Which graph shows the juice stall?', figs: [{ cap: 'A', range: [0, 6], yrange: [0, 40], step: 1, ystep: 8, pts: [[0, 0], [1, 8], [2, 16], [3, 24], [4, 32], [5, 40]], x: 'cups', y: 'SAR' }, { cap: 'B', range: [0, 6], yrange: [0, 40], step: 1, ystep: 8, lines: [{ m: 8, b: 0, from: 0, to: 5 }], x: 'cups', y: 'SAR' }],
          opts: ['A: dots', 'B: a line'], ans: 0, no: [null, 'A line means you could buy 2.5 cups. Can you?'], why: 'Cups are counted, so the graph is separate dots.' }
      ] },
    { name: 'Fill and drain', learn: ['Continuous: write the domain like *0 ≤ t ≤ 6*.', 'Find the end: when is the tank full? When is the battery empty?'],
      tasks: [
        { k: 'solve', q: 'The splash-zone tank holds *300 L*. A hose adds 50 L a minute: *V(t) = 50t*. Find the domain and range.', start: 'V(t) = 50t, tank holds 300 L',
          moves: [
            { q: 'First move?', opts: ['Find when the tank is full', 'Find 50 × 300'], ans: 0, res: ['50t = 300, so t = 6 minutes', '50t = 300, so t = 250 minutes', 't = 300 minutes'], rans: 0, hint: 'Full means V = 300. Divide 300 by 50.',
              no: { 1: '50 × 300 is not a time. Solve 50t = 300.', r1: 'Divide, do not subtract: 300 ÷ 50 = 6.', r2: '300 is litres, not minutes.' } },
            { q: 'Next move?', opts: ['Write the domain', 'Write the range'], ans: 0, res: ['0 ≤ t ≤ 6', '{0, 1, 2, 3, 4, 5, 6}', '0 ≤ t ≤ 300'], rans: 0, hint: 'Time can be any value from 0 to 6, like 2.5 minutes.',
              no: { 1: 'Domain first: the inputs (time).', r1: 'Time is continuous: 2.5 minutes is allowed too.', r2: '300 is the volume. The time stops at 6.' } },
            { q: 'Next move?', opts: ['Write the range', 'Draw dots'], ans: 0, res: ['0 ≤ V ≤ 300', '0 ≤ V ≤ 6', '50 ≤ V ≤ 300'], rans: 0, hint: 'Outputs go from empty (0 L) to full.',
              no: { 1: 'Water can be any amount: not dots.', r1: '6 is the time. The range is litres.', r2: 'At t = 0 the tank is empty: 0 L.' } },
            { q: 'Last move?', opts: ['Discrete or continuous?', 'Stop'], ans: 0, res: ['Continuous: draw a line', 'Discrete: draw dots'], rans: 0, hint: 'Can the water be 125 L?',
              no: { r1: 'Water fills smoothly: 125 L happens at 2.5 minutes.' }, why: 'A line segment from (0, 0) to (6, 300).' }
          ] },
        { k: 'solve', q: 'Your phone starts at 100% and loses 10% an hour: *B(h) = 100 − 10h*. Find the domain and range.', start: 'B(h) = 100 − 10h',
          moves: [
            { q: 'First move?', opts: ['Find when the battery is empty', 'Find B(100)'], ans: 0, res: ['100 − 10h = 0, so h = 10', '100 − 10h = 0, so h = 90', '100 − 10h = 0, so h = −10'], rans: 0, hint: 'Empty means B = 0. Add 10h to both sides: 100 = 10h.',
              no: { 1: '100 is a percent, not hours.', r1: '10h = 100, so divide: h = 10.', r2: 'Time cannot be negative. 10h = 100 gives h = 10.' } },
            { q: 'Next move?', opts: ['Write the domain', 'Write the range'], ans: 0, res: ['0 ≤ h ≤ 10', '0 ≤ h ≤ 100', 'h ≥ 0'], rans: 0, hint: 'From now (0 hours) until empty.',
              no: { 1: 'Domain first: the inputs (hours).', r1: '100 is the battery %. It is empty after 10 hours.', r2: 'After 10 hours the battery would be negative.' } },
            { q: 'Next move?', opts: ['Write the range', 'Stop'], ans: 0, res: ['0 ≤ B ≤ 100', '10 ≤ B ≤ 100', '0 ≤ B ≤ 10'], rans: 0, hint: 'From full (100%) down to empty.',
              no: { r1: 'It goes all the way down to 0%.', r2: '10 is the hours. The battery goes up to 100%.' }, why: 'The battery can show any % from 0 to 100, so it is continuous.' }
          ] },
        { k: 'choice', q: 'Is *h = 11* in the domain of the battery?', opts: ['No: B(11) = −10%, which can\'t happen', 'Yes: any time works', 'Yes: 11 is a whole number'], ans: 0,
          no: [null, 'Put in 11: 100 − 110 = −10. Can a battery be −10%?', 'Being whole does not help. Check the output.'], why: 'The battery is empty after 10 hours, so the domain stops at 10.' },
        { k: 'choice', q: 'This graph shows a drink machine filling a cup. What is the domain?', fig: { range: [0, 10], yrange: [0, 40], step: 1, ystep: 5, lines: [{ m: 5, b: 0, from: 0, to: 8 }], pts: [[0, 0], [8, 40]], x: 'seconds', y: 'mL' },
          opts: ['0 ≤ t ≤ 8', '0 ≤ t ≤ 40', '{0, 1, 2, …, 8}', 't ≥ 0'], ans: 0,
          no: [null, '40 is the top output: the range.', 'The graph is a line, so every value counts, not just whole ones.', 'The line stops at 8 seconds.'], why: 'The line runs from t = 0 to t = 8: domain 0 ≤ t ≤ 8, range 0 ≤ V ≤ 40.' }
      ] },
    { name: 'Boats and buses', learn: ['Check every input: does it make sense *here*?', 'Negative numbers, fractions of things, or going past the limit are not allowed.'],
      tasks: [
        { k: 'sort', q: 'Boat trips cost 20 SAR. The budget is 100 SAR. Is each input in the domain?', bins: ['In the domain', 'Not in the domain'],
          cards: [{ t: '0 trips', b: 0 }, { t: '3 trips', b: 0 }, { t: '5 trips', b: 0, why: '5 × 20 = 100: just enough.' }, { t: '2.5 trips', b: 1, why: 'No half trips.' }, { t: '−1 trips', b: 1 }, { t: '6 trips', b: 1, why: '6 × 20 = 120: over the budget.' }],
          why: 'Domain: {0, 1, 2, 3, 4, 5}.' },
        { k: 'solve', q: 'A festival bus costs 400 SAR to rent: *C(b) = 400b*. The club has *1600 SAR*. Find the domain and range.', start: 'C(b) = 400b, budget 1600 SAR',
          moves: [
            { q: 'First move?', opts: ['Find the most buses', 'Find 400 + 1600'], ans: 0, res: ['1600 ÷ 400 = 4 buses', '1600 − 400 = 1200 buses', '1600 ÷ 400 = 40 buses'], rans: 0, hint: 'How many 400s fit into 1600?',
              no: { 1: 'Adding does not tell us how many buses.', r1: 'Divide: each bus takes 400.', r2: 'Check: 400 × 4 = 1600.' } },
            { q: 'Next move?', opts: ['List the inputs', 'Write 0 ≤ b ≤ 4'], ans: 0, res: ['Domain: {0, 1, 2, 3, 4}', 'Domain: {1, 2, 3}', 'Domain: {0, 400, 800}'], rans: 0, hint: 'Whole buses from 0 to 4.',
              no: { 1: 'You can\'t rent 3.5 buses, so list them.', r1: '0 and 4 are allowed too.', r2: 'Those are costs (outputs), not buses.' } },
            { q: 'Next move?', opts: ['Put each input in', 'Copy the domain'], ans: 0, res: ['Range: {0, 400, 800, 1200, 1600}', 'Range: {0, 1, 2, 3, 4}', 'Range: 0 ≤ C ≤ 1600'], rans: 0, hint: '400 × 0, 400 × 1, …',
              no: { 1: 'The range is the costs.', r1: 'Those are the inputs.', r2: 'Only whole buses, so only these costs: list them.' }, why: 'Discrete: 5 dots on the graph.' }
          ] },
        { k: 'choice', q: 'Marcus wrote the domain for the 5 SAR rides (30 SAR wallet) as *0 ≤ n ≤ 6*. What is wrong?', opts: ['It allows half rides like 2.5', 'It should start at 1', 'Nothing: it is right'], ans: 0,
          no: [null, '0 rides is allowed: you can choose not to ride.', '0 ≤ n ≤ 6 includes 2.5. Is that OK for rides?'], why: 'Rides are discrete: {0, 1, 2, 3, 4, 5, 6}.' },
        { k: 'choice', q: 'Which is the best *range* for the temperature on the beach in one day, from 22° at night to 35° at 2 pm?', opts: ['22 ≤ T ≤ 35', '{22, 23, …, 35}', '0 ≤ T ≤ 35', 'T ≥ 22'], ans: 0,
          no: [null, 'Temperature changes smoothly: 27.5° is possible.', 'It never goes down to 0°.', 'It never goes above 35° that day.'], why: 'Continuous from the lowest (22°) to the highest (35°).' }
      ] },
    { name: 'The gate boss', boss: true, learn: ['Mixed stalls. Find the limit, decide dots or line, then write the domain and range.'],
      tasks: [
        { k: 'solve', q: 'Ice cream costs *6 SAR* a scoop, at most *4* scoops: *S(n) = 6n*. Find the domain and range.', start: 'S(n) = 6n, at most 4 scoops',
          moves: [
            { q: 'First move?', opts: ['Decide: can n be 2.5?', 'Find 6 × 6'], ans: 0, res: ['No: discrete', 'Yes: continuous'], rans: 0, hint: 'Can you buy half a scoop here?' },
            { q: 'Next move?', opts: ['List the inputs', 'Write 0 ≤ n ≤ 4'], ans: 0, res: ['Domain: {0, 1, 2, 3, 4}', 'Domain: {1, 2, 3}'], rans: 0, hint: 'From 0 to 4.' },
            { q: 'Next move?', opts: ['Put each input in', 'Add 6 each time from 6'], ans: 0, res: ['Range: {0, 6, 12, 18, 24}', 'Range: {6, 12, 18, 24, 30}'], rans: 0, hint: '6 × 0 = 0.',
              why: 'Five dots, from (0, 0) to (4, 24).' }
          ] },
        { k: 'sort', q: 'Discrete or continuous?', bins: ['Discrete', 'Continuous'],
          cards: [{ t: 'tickets sold → money', b: 0 }, { t: 'time cooking → temperature', b: 1 }, { t: 'kilometres driven → fuel used', b: 1 }, { t: 'friends invited → pizzas', b: 0 }],
          why: 'Counted inputs: discrete. Measured inputs: continuous.' },
        { k: 'number', q: 'A kite string lets out 4 m every second, up to *60 m*: *L(t) = 4t*. The domain is 0 ≤ t ≤ ?', ans: 15, unit: 'seconds', hint: 'When is L = 60? Divide 60 by 4.', why: '4t = 60, so t = 15. Domain 0 ≤ t ≤ 15.' },
        { k: 'choice', q: 'For the kite string, which is the range?', opts: ['0 ≤ L ≤ 60', '0 ≤ L ≤ 15', '{0, 4, 8, …, 60}', 'L ≥ 4'], ans: 0,
          no: [null, '15 is the time. The range is metres of string.', 'The string lets out smoothly: 10 m happens too.', 'At t = 0 the string is 0 m.'], why: 'Any length from 0 m to 60 m.' }
      ] }
  ]
});
