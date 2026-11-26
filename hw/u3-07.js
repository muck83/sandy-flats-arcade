/* Homework: Unit 3 Lesson 7, Build a Linear Model. */
SFA_HW({
  id: 'g37',
  unit: 3,
  lesson: 7,
  topic: 'Build a linear model',
  title: 'Model Maker',
  who: 'priya',
  intro: ['Priya opened a rental stall on the beach: kayaks, paddle boards and snorkels. Every price is a starting fee plus an amount for each hour.', 'But Priya lost her price list! She only has old receipts, tables and a graph. Help her rebuild each price rule as *y = mx + b*, and say what the numbers mean.'],
  goal: 'Find the rate of change and the initial value from words, a table, a graph or two points, and write y = mx + b.',
  bigIdea: 'A linear model is y = mx + b: m is the rate ("per") and b is the starting value (when x = 0).',
  levels: [
    { name: 'Read the sign', learn: ['*m* is the rate: look for "each" or "per".', '*b* is the start: look for "fee", "starts at" or "to join".', 'Write *y = mx + b*, and give units: "SAR per hour", "SAR".'],
      tasks: [
        { k: 'choice', q: 'The snorkel sign says: *15 SAR fee, plus 5 SAR per hour*. What is the rate *m*?', opts: ['20 SAR', '5 SAR per hour', '15 SAR per hour', '15 SAR'], ans: 1, no: ['Do not add them. The rate is the "per hour" part.', null, '15 is the fee, paid once. The "per" number is the rate.', '15 SAR is the start, b.'], why: '"Per hour" tells you the rate: m = 5 SAR per hour.' },
        { k: 'solve', q: 'Paddle boards: *starts at 10 SAR, then 3 SAR per hour*. Build the model.', start: 'Starts at 10 SAR, 3 SAR per hour',
          moves: [
            { q: 'First move?', opts: ['Add 10 + 3', 'Find the rate (the "per")'], ans: 1, res: ['m = 10 SAR per hour', 'm = 13', 'm = 3 SAR per hour'], rans: 2, hint: 'Which number has "per hour"?', no: { '0': 'The two numbers mean different things. Do not add them.', r0: '10 is the start. 3 is "per hour".', r1: 'Find the "per" number on its own.' } },
            { q: 'Next move?', opts: ['Find the start (the "starts at")', 'Find the end'], ans: 0, res: ['b = 3 SAR', 'b = 10 SAR', 'b = 0'], rans: 1, hint: 'What do you pay at 0 hours?', no: { r0: '3 is the rate. The start is 10.', r2: 'It starts at 10, not 0.' } },
            { q: 'Last move?', opts: ['Write y = bx + m', 'Write y = mx + b'], ans: 1, res: ['C = 10h + 3', 'C = 13h', 'C = 3h + 10'], rans: 2, hint: 'The rate goes with h.', no: { '0': 'The rate goes with x (here h).', r0: 'Swapped: that says 10 SAR per hour.', r1: 'That would be 13 SAR every hour, with no start fee.' }, why: 'C = 3h + 10: 3 SAR each hour, 10 SAR to start.' }
          ] },
        { k: 'choice', q: 'The kayak model is *C = 25h + 20*. What does the *20* mean?', opts: ['A 20 SAR fee, even for 0 hours', '20 hours of kayaking', '20 SAR for each hour', 'The total for 1 hour'], ans: 0, no: [null, '20 is in SAR, not hours.', 'The "per hour" number goes with h: that is 25.', '1 hour costs 25 + 20 = 45 SAR.'], why: 'b = 20 is the starting value: C = 20 when h = 0.' }
      ] },
    { name: 'From a table', learn: ['m = change in y ÷ change in x. Check the x step!', 'b is y when x = 0. If the table does not show x = 0, *work back*.'],
      tasks: [
        { k: 'solve', q: 'Write the model for this table.', tab: { head: ['x', '0', '2', '4', '6'], rows: [['y', 20, 26, 32, 38]] }, start: 'x: 0, 2, 4, 6 · y: 20, 26, 32, 38',
          moves: [
            { q: 'First move?', opts: ['Find the change in y and in x', 'Find the change in y only'], ans: 0, res: ['+6 in y for each +2 in x', '+6 in y for each +1 in x', '+2 in y for each +6 in x'], rans: 0, hint: '26 − 20 and 2 − 0.', no: { '1': 'x goes up by 2, so you need both changes.', r1: 'Look at x: 0, 2, 4. It goes up by 2.', r2: 'Swapped: y goes up 6.' } },
            { q: 'Next move?', opts: ['Divide to get m', 'Multiply to get m'], ans: 0, res: ['m = 2 ÷ 6', 'm = 6 ÷ 2 = 3', 'm = 6'], rans: 1, hint: 'Change in y ÷ change in x.', no: { '1': 'The rate is a division.', r0: 'Upside down: y on top.', r2: '6 is for 2 steps of x. Divide by 2.' } },
            { q: 'Next move?', opts: ['Read b at x = 2', 'Read b at x = 0'], ans: 1, res: ['b = 20', 'b = 3', 'b = 26'], rans: 0, hint: 'Find x = 0 in the table.', no: { '0': 'The start is at x = 0.', r1: '3 is m.', r2: '26 is at x = 2.' } },
            { q: 'Last move?', opts: ['Write y = mb + x', 'Write y = mx + b'], ans: 1, res: ['y = 3x + 20', 'y = 20x + 3', 'y = 6x + 20'], rans: 0, hint: 'm = 3, b = 20.', no: { r1: 'Swapped: m goes with x.', r2: 'm is 3, not 6: x steps by 2.' }, why: 'Check x = 4: 3(4) + 20 = 32. ✓' }
          ] },
        { k: 'solve', q: 'This table has no x = 0. Work back to find b.', tab: { head: ['hours', '1', '2', '3'], rows: [['SAR', 15, 19, 23]] }, start: 'h: 1, 2, 3 · C: 15, 19, 23',
          moves: [
            { q: 'First move?', opts: ['Find the rate', 'Say b = 15'], ans: 0, res: ['m = 15 SAR per hour', 'm = 1 SAR per hour', 'm = 4 SAR per hour'], rans: 2, hint: '19 − 15 for 1 more hour.', no: { '1': '15 is the cost at 1 hour, not at 0 hours.', r0: '15 is a cost, not the change.', r1: '1 is the hour step. The cost changes by 4.' } },
            { q: 'Next move?', opts: ['Work forward to h = 4', 'Work back one hour to h = 0'], ans: 1, res: ['b = 15 − 4 = 11 SAR', 'b = 15 + 4 = 19 SAR', 'b = 15 SAR'], rans: 0, hint: 'Going back 1 hour takes away one rate.', no: { '0': 'b is at h = 0, which is back from h = 1.', r1: 'Going back means subtract.', r2: '15 is at h = 1. Go back one more hour.' } },
            { q: 'Last move?', opts: ['Write the model', 'Stop'], ans: 0, res: ['C = 11h + 4', 'C = 4h + 11', 'C = 4h + 15'], rans: 1, hint: 'm = 4, b = 11.', no: { r0: 'Swapped: 4 per hour goes with h.', r2: 'b is 11, not 15.' }, why: 'Check h = 3: 4(3) + 11 = 23. ✓' }
          ] },
        { k: 'number', q: 'Use the model *C = 4h + 11*. What does *10 hours* cost?', ans: 51, unit: 'SAR', hint: '4 × 10 first, then add 11.', why: 'C = 40 + 11 = 51 SAR.' }
      ] },
    { name: 'From a graph', learn: ['*b*: where the line crosses the y-axis.', '*m*: go 1 step right and count up (or down).'],
      tasks: [
        { k: 'solve', q: 'This graph shows snorkel hire. Build the model.', fig: { range: [0, 5], yrange: [0, 12], ystep: 2, lines: [{ m: 2, b: 2 }], pts: [[0, 2], [1, 4]], x: 'hours', y: 'SAR' }, start: 'Line through (0, 2) and (1, 4)',
          moves: [
            { q: 'First move?', opts: ['Read where it crosses the y-axis', 'Read where it crosses the x-axis'], ans: 0, res: ['b = 0', 'b = 4', 'b = 2'], rans: 2, hint: 'The y-axis is the up-and-down axis, at x = 0.', no: { '1': 'b is on the y-axis, at x = 0.', r0: 'The line starts above 0, at 2.', r1: '4 is the height at x = 1.' } },
            { q: 'Next move?', opts: ['Count the grid lines', 'Go 1 right and count up'], ans: 1, res: ['m = 1', 'm = 2', 'm = 4'], rans: 1, hint: 'From (0, 2) to (1, 4): up how many?', no: { r0: '1 is the step right. It goes up 2.', r2: '4 is the height. The rise is 4 − 2 = 2.' } },
            { q: 'Last move?', opts: ['Write y = mx + b', 'Write y = bx + m'], ans: 0, res: ['y = 2x', 'y = 2x + 2', 'y = 4x + 2'], rans: 1, hint: 'm = 2, b = 2.', no: { r0: 'Do not forget b = 2.' }, why: '2 SAR per hour plus a 2 SAR start.' }
          ] },
        { k: 'choice', q: 'A water bottle drains. What is the rate *m*?', fig: { range: [0, 5], yrange: [0, 10], ystep: 2, lines: [{ m: -2, b: 8 }], pts: [[0, 8], [1, 6]], x: 'minutes', y: 'cups' }, opts: ['8 cups per minute', '2 cups per minute', '−2 cups per minute', '−8 cups per minute'], ans: 2, no: ['8 is the start, b.', 'The line goes down, so the rate is negative.', null, '8 is the start, not the rate.'], why: '8 to 6 in 1 minute: down 2, so m = −2.' },
        { k: 'plane', q: 'Graph the model *y = 3x − 2*: tap two points on it.', range: [-5, 5], m: 3, b: -2, op: '=', parts: ['line'], hint: 'Start at b: (0, −2). Then right 1, up 3.', why: '(0, −2), then right 1 and up 3 to (1, 1).' }
      ] },
    { name: 'From two receipts', learn: ['Two points: m = (change in y) ÷ (change in x).', 'Then *work back* to x = 0 to find b.', 'Test the model with one of the points.'],
      tasks: [
        { k: 'solve', q: 'Two kayak receipts: *2 hours → 70 SAR* and *5 hours → 145 SAR*. Build the model.', start: '(2, 70) and (5, 145)',
          moves: [
            { q: 'First move?', opts: ['Find the change in y and in x', 'Divide 145 by 5'], ans: 0, res: ['145 − 70 = 75 SAR, 5 − 2 = 3 hours', '145 − 70 = 75 SAR, 5 + 2 = 7 hours', '145 + 70 = 215 SAR, 5 − 2 = 3 hours'], rans: 0, hint: 'Subtract both: big minus small.', no: { '1': '145 ÷ 5 forgets the start fee. Use the changes.', r1: 'Subtract the hours too: 5 − 2.', r2: 'Subtract the costs: 145 − 70.' } },
            { q: 'Next move?', opts: ['Multiply to get m', 'Divide to get m'], ans: 1, res: ['3 ÷ 75 = 0.04 SAR per hour', '75 × 3 = 225 SAR per hour', '75 ÷ 3 = 25 SAR per hour'], rans: 2, hint: 'SAR ÷ hours.', no: { '0': 'Rate = change in y ÷ change in x.', r0: 'Upside down: SAR on top.', r1: 'Divide, do not multiply.' } },
            { q: 'Next move?', opts: ['Say b = 70', 'Work back to x = 0 to get b'], ans: 1, res: ['70 + 2 × 25 = 120 SAR', '70 − 2 × 25 = 20 SAR', '70 − 25 = 45 SAR'], rans: 1, hint: 'From 2 hours back to 0 hours: take away 2 rates.', no: { '0': '70 is for 2 hours, not 0 hours.', r0: 'Going back means subtract.', r2: 'That only goes back 1 hour. Go back 2.' } },
            { q: 'Last move?', opts: ['Write the model', 'Stop'], ans: 0, res: ['C = 25h + 20', 'C = 25h + 70', 'C = 20h + 25'], rans: 0, hint: 'm = 25, b = 20.', no: { r1: 'b is 20, the cost at 0 hours.', r2: 'Swapped: 25 per hour goes with h.' }, why: 'C = 25h + 20: 25 SAR per hour, 20 SAR to start.' }
          ] },
        { k: 'solve', q: 'Test the model *C = 25h + 20* with the second receipt (5 hours).', start: 'C = 25(5) + 20',
          moves: [
            { q: 'What first?', opts: ['Add 5 + 20', 'Multiply 25 × 5'], ans: 1, res: ['C = 30 + 20', 'C = 25(25)', 'C = 125 + 20'], rans: 2, hint: 'Multiply before you add.', no: { '0': 'Multiply first: order of operations.', r0: '25 × 5 is 125, not 30.' } },
            { q: 'Last move?', opts: ['Add 125 + 20', 'Subtract 20'], ans: 0, res: ['C = 145 ✓', 'C = 105', 'C = 140'], rans: 0, hint: '125 + 20.', no: { '1': 'The model says + 20.', r1: 'Add, do not subtract.', r2: '125 + 20 = 145.' }, why: '145 SAR matches the receipt, so the model works.' }
          ] },
        { k: 'choice', q: 'In *C = 25h + 20*, what does *25* mean?', opts: ['You can kayak for 25 hours', 'Each extra hour costs 25 SAR', 'The cost for 2 hours', 'The fee to start is 25 SAR'], ans: 1, no: ['25 is in SAR per hour, not hours.', null, '2 hours cost 70 SAR.', 'The start is b = 20.'], why: 'm = 25 SAR per hour: the rate.' }
      ] },
    { name: 'The closing time boss', boss: true, learn: ['Mixed models. Find m (watch the sign), find b, write it, test it.'],
      tasks: [
        { k: 'solve', q: 'Priya\'s phone credit: after *3 days* she has *70 SAR*, after *7 days* *30 SAR*. Build the model.', start: '(3, 70) and (7, 30)',
          moves: [
            { q: 'First move?', opts: ['Divide 70 by 3', 'Find the changes'], ans: 1, res: ['30 − 70 = −40 SAR, 7 − 3 = 4 days', '70 − 30 = 40 SAR, 7 − 3 = 4 days'], rans: 0, hint: 'Second point minus first point, for both.', no: { r1: 'The credit goes down, so the change is −40.' } },
            { q: 'Next move?', opts: ['Subtract to get m', 'Divide to get m'], ans: 1, res: ['m = −4 SAR per day', 'm = 10 SAR per day', 'm = −40 ÷ 4 = −10 SAR per day'], rans: 2, hint: '−40 ÷ 4.' },
            { q: 'Next move?', opts: ['Say b = 70', 'Work back to day 0'], ans: 1, res: ['b = 70', '70 − 3 × 10 = 40 SAR', '70 + 3 × 10 = 100 SAR'], rans: 2, hint: 'She loses 10 a day, so 3 days ago she had more.', no: { r1: 'Going back in time, the credit was higher.' } },
            { q: 'Last move?', opts: ['Write the model', 'Stop'], ans: 0, res: ['C = 10d + 100', 'C = −10d + 100', 'C = 100d − 10'], rans: 1, why: 'Starts at 100 SAR and loses 10 SAR a day.' }
          ] },
        { k: 'number', q: 'Same model, *C = −10d + 100*. On which day does the credit reach 0?', ans: 10, hint: '100 − 10d = 0. How many 10s are in 100?', why: '10d = 100, so d = 10.' },
        { k: 'match', q: 'Match each model to its story.', pairs: [['y = 5x + 20', '20 SAR to join, 5 SAR each game'], ['y = 20x + 5', '5 SAR fee, 20 SAR per hour'], ['y = −5x + 20', '20 L tank, drains 5 L a minute'], ['y = 5x', '5 SAR a cup, no fee']] },
        { k: 'choice', q: 'Which model fits the graph?', fig: { range: [0, 7], yrange: [0, 30], ystep: 5, lines: [{ m: -5, b: 30 }], pts: [[0, 30], [4, 10]], x: 'x', y: 'y' }, opts: ['y = 5x + 30', 'y = 30x − 5', 'y = −20x + 30', 'y = −5x + 30'], ans: 3, no: ['The line goes down, so m is negative.', 'b is where it crosses the y-axis: 30.', 'Down 20 over 4 steps right: 20 ÷ 4 = 5.', null], why: 'b = 30. From (0, 30) to (4, 10): down 20 in 4 steps, so m = −5.' },
        { k: 'number', q: 'Snorkels: *C = 5h + 15*. Priya pays *40 SAR*. How many hours?', ans: 5, unit: 'hours', hint: '5h + 15 = 40. Take away 15, then divide by 5.', why: '5h = 25, so h = 5.' }
      ] }
  ]
});
