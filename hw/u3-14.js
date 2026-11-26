/* Homework: Unit 3 Lesson 14, Error Detective. */
SFA_HW({
  id: 'g44', unit: 3, lesson: 14, topic: 'Error detective', title: 'Case Files of Sandy Flats', who: 'priya',
  intro: ['Somebody fed wrong answers into the arcade\'s Homework Helper robot, and now it gives bad advice. Priya opened the *Sandy Flats Detective Agency* to fix it.',
    'Each case file shows some work with one mistake in it. Find the mistake, name it, then write the fix. Check every fix before you close the case.'],
  goal: 'Find, explain and fix mistakes about slope, intercepts, notation, function tests, transformations, domain and inverses.',
  bigIdea: 'A mistake is a clue: find the first wrong step, say why it is wrong, fix it, and check the fix.',
  levels: [
    { name: 'Slope cases', learn: ['Slope = *change in y ÷ change in x*. Keep the same order on top and bottom.', 'Uphill: positive slope. Downhill: negative slope.', 'In a table, check the step in x too: it is not always 1.'],
      tasks: [
        { k: 'solve', q: 'Case 1. Find the slope of the line through *(1, 5)* and *(3, 1)*. The robot wrote this:', start: 'm = (3 − 1) ÷ (1 − 5) = −½',
          moves: [
            { q: 'What is wrong?', opts: ['Rise and run are swapped', 'The subtraction 3 − 1 is wrong', 'Nothing: it is right'], ans: 0, res: ['Fix: m = (1 − 5) ÷ (3 − 1)', 'Fix: m = (5 − 1) ÷ (3 − 1)', 'Fix: m = (3 − 1) ÷ (5 − 1)'], rans: 0,
              hint: 'Which numbers are the x values? Which go on top?', no: { 1: '3 − 1 = 2 is fine. Look at which numbers are on top.', 2: 'The x values (3 and 1) are on top. Slope is change in y on top.', r1: 'Keep the same order on top and bottom: (1 − 5) goes with (3 − 1).', r2: 'That still has x on top.' } },
            { q: 'Finish the fix.', opts: ['Work out −4 ÷ 2', 'Work out 2 ÷ −4'], ans: 0, res: ['m = −2', 'm = 2', 'm = −½'], rans: 0,
              hint: '1 − 5 = −4 and 3 − 1 = 2.', no: { 1: 'That is the robot\'s upside-down fraction again.', r1: '−4 ÷ 2 is negative.', r2: 'That is the robot\'s answer. Divide −4 by 2.' }, why: 'Check: from (1, 5), right 2 and down 4 lands on (3, 1) ✓.' }
          ] },
        { k: 'choice', q: 'Case 2. Find the slope of this line. The robot says: "Rise = 6, run = 3, so the slope is 2."', fig: { range: [-1, 5], yrange: [-1, 7], lines: [{ m: -2, b: 6 }], pts: [[0, 6], [3, 0]], x: 'x', y: 'y' },
          opts: ['The line goes down, so the slope is −2', 'The slope should be 3 ÷ 6 = ½', 'Nothing: the slope is 2', 'The slope should be 6'], ans: 0,
          no: [null, 'Rise goes on top, run on the bottom. The size 2 is right. Look at the direction.', 'Read the line from left to right. Up or down?', 'Slope is rise ÷ run, not just the rise.'], why: 'Left to right the line goes down 6 as it goes right 3: slope −6 ÷ 3 = −2.' },
        { k: 'solve', q: 'Case 3. The robot says: "The rate of change is 5."', tab: { head: ['x', '1', '2', '3', '4'], rows: [['y', 5, 8, 11, 14]] }, start: '"The rate of change is 5."',
          moves: [
            { q: 'What is wrong?', opts: ['5 is the first y, not the change', 'The table is not linear', 'Nothing: it is right'], ans: 0, res: ['Rate = change in y ÷ change in x', 'Rate = the first y value', 'Rate = the last y value'], rans: 0,
              hint: 'Rate of change is how much y goes up each step.', no: { 1: '5, 8, 11, 14: it goes up 3 every time. That is linear.', 2: 'Does y go up by 5 each step?', r1: 'That is the robot\'s mistake.', r2: 'A rate is a change, not one value.' } },
            { q: 'Find the rate.', opts: ['Work out (8 − 5) ÷ (2 − 1)', 'Work out 14 ÷ 4'], ans: 0, res: ['Rate = 3', 'Rate = −3', 'Rate = 13'], rans: 0,
              hint: 'Take two rows next to each other.', no: { 1: '14 ÷ 4 is not a change. Subtract first.', r1: 'y goes up, so the rate is positive.', r2: '8 − 5 = 3, and 2 − 1 = 1.' }, why: 'y goes up 3 for each 1 in x: the rate is 3 (y = 3x + 2).' }
          ] },
        { k: 'number', q: 'Case 4. "y goes up 6 each time, so the slope is 6." What is the real slope?', tab: { head: ['x', '0', '2', '4', '6'], rows: [['y', 1, 7, 13, 19]] }, ans: 3,
          hint: 'Look at the x row: it goes up 2 each time, not 1.', why: 'Slope = 6 ÷ 2 = 3. The robot forgot that x goes up by 2.' }
      ] },
    { name: 'Equation cases', learn: ['The y-intercept is where the line crosses the *y-axis* (x = 0).', 'In y = mx + b, b keeps its sign: y = 4x − 7 has b = −7.', '*3x* means 3 times x.'],
      tasks: [
        { k: 'choice', q: 'Case 5. The robot says: "*y = 4x − 7* has a y-intercept of 7." What is the fix?', opts: ['The y-intercept is −7', 'The y-intercept is 4', 'The y-intercept is 7: it is right', 'The y-intercept is −4'], ans: 0,
          no: [null, '4 is the slope, the number with x.', 'b keeps its sign. Put x = 0: y = −7.', '−4 is not in the equation. Put x = 0.'], why: 'Put x = 0: y = 0 − 7 = −7. The line crosses at (0, −7).' },
        { k: 'solve', q: 'Case 6. Write the equation of this line. The robot wrote this:', fig: { range: [-1, 5], yrange: [-1, 5], lines: [{ m: -2, b: 4 }], pts: [[2, 0]], x: 'x', y: 'y' }, start: 'Slope −2. It crosses at 2, so y = −2x + 2',
          moves: [
            { q: 'What is wrong?', opts: ['b was read on the x-axis', 'The slope should be 2', 'Nothing: it is right'], ans: 0, res: ['It crosses the y-axis at (0, 4)', 'It crosses the y-axis at (0, 2)', 'It crosses the y-axis at (0, −2)'], rans: 0,
              hint: 'Where does the line cross the y-axis (the up-down axis)?', no: { 1: 'The line goes down, so −2 is right.', 2: 'Check: is (0, 2) on the line?', r1: '2 is where it crosses the x-axis.', r2: 'Look at the y-axis above 0.' } },
            { q: 'Write the fix.', opts: ['Use m = −2 and b = 4', 'Use m = 4 and b = −2'], ans: 0, res: ['y = −2x + 4', 'y = −2x − 4', 'y = 2x + 4'], rans: 0,
              hint: 'm is the slope, b is the y-intercept.', no: { 1: 'm is the slope (−2). b is the y-intercept (4).', r1: 'b is +4: the line crosses above 0.', r2: 'The slope is −2: the line goes down.' }, why: 'Check: x = 2 gives −4 + 4 = 0, so (2, 0) is on the line ✓.' }
          ] },
        { k: 'solve', q: 'Case 7. *f(x) = 3x*. The robot wrote:', start: 'f(5) = 3 + 5 = 8',
          moves: [
            { q: 'What is wrong?', opts: ['3x means 3 times x, not 3 + x', 'f(5) means f times 5', 'Nothing: it is right'], ans: 0, res: ['Fix: f(5) = 3 × 5', 'Fix: f(5) = 3 + 5', 'Fix: f(5) = 5 − 3'], rans: 0,
              hint: 'What does 3x mean?', no: { 1: 'f(5) means "f of 5": put 5 into the rule.', 2: 'Is 3x the same as 3 + x?', r1: 'That is the robot\'s mistake.', r2: 'There is no subtracting in 3x.' } },
            { q: 'Finish the fix.', opts: ['Multiply 3 × 5', 'Add 3 + 5'], ans: 0, res: ['f(5) = 15', 'f(5) = 35', 'f(5) = 8'], rans: 0,
              hint: '3 × 5 = ?', no: { 1: '3x means multiply.', r1: '3 × 5, not 35.', r2: 'That is the robot\'s answer.' }, why: 'Why the mistake? 3x has no sign in it, so it is easy to read it as 3 + x.' }
          ] },
        { k: 'choice', q: 'Case 8. *f(x) = 2x − 1*. Find x when *f(x) = 3*. The robot says: "f(3) = 2(3) − 1 = 5, so x = 5." What is the fix?', opts: ['Solve 2x − 1 = 3, so x = 2', 'x = 3, because f(x) = 3', 'f(3) = 5 is right, so x = 5', 'Solve 2x − 1 = 5, so x = 3'], ans: 0,
          no: [null, '3 is the output. You need the input that gives 3.', 'The robot found f(3), the output for input 3. The question gives the output.', 'The output is 3, not 5.'], why: 'f(x) = 3 means the output is 3: 2x − 1 = 3, 2x = 4, x = 2. Check: f(2) = 3 ✓.' }
      ] },
    { name: 'Graph cases', learn: ['The function test uses a *vertical* line: hits twice means one input, two outputs.', '*f(x) + k* moves a graph *up or down*. *a · f(x)* with 0 < a < 1 is *flatter*.'],
      tasks: [
        { k: 'choice', q: 'Case 9. Is this graph a function? The robot says: "I drew a line at y = 2. It hits the graph twice, so it is not a function."',
          fig: { range: [-3, 3], yrange: [-1, 5], paths: [{ p: [[-2.2, 4.84], [-2, 4], [-1.5, 2.25], [-1, 1], [-0.5, 0.25], [0, 0], [0.5, 0.25], [1, 1], [1.5, 2.25], [2, 4], [2.2, 4.84]] }], x: 'x', y: 'y' },
          opts: ['A line at y = 2 is flat. Use a vertical line', 'It hits twice, so it is not a function', 'Nothing: the robot is right'], ans: 0,
          no: [null, 'Two points side by side is fine: two inputs with the same output.', 'Which kind of line does the test use?'], why: 'Every vertical line hits this graph once: each input has one output. It IS a function.' },
        { k: 'choice', q: 'Case 10. Describe *g(x) = f(x) + 3*. The robot says "the + 3 moves the graph 3 units to the right" and drew g (dashed).', fig: { range: [-2, 6], yrange: [-4, 6], lines: [{ m: 1, b: 0, lab: 'f' }, { m: 1, b: -3, dash: true, lab: 'g' }], x: 'x', y: 'y' },
          opts: ['+ 3 outside f moves it up 3, not right', 'It should move left 3', 'It should get 3 times steeper', 'Nothing: the robot is right'], ans: 0,
          no: [null, 'The + 3 is outside the brackets, so it changes the outputs.', 'Adding does not change the slope.', 'Right 3 would be f(x − 3).'], why: 'Every output goes up 3: g crosses the y-axis at (0, 3).' },
        { k: 'solve', q: 'Case 11. *f(x) = 4x*. The robot says: "*g(x) = ½ · f(x)* is steeper, because you multiply."', start: '"½ · f(x) is steeper."',
          moves: [
            { q: 'Write g(x) first.', opts: ['g(x) = ½ · 4x', 'g(x) = ½ + 4x'], ans: 0, res: ['g(x) = 2x', 'g(x) = 8x', 'g(x) = 4.5x'], rans: 0,
              hint: 'Multiply 4x by ½.', no: { 1: 'The dot means times.', r1: 'Half of 4 is 2, not 8.', r2: 'That adds ½. We multiply.' } },
            { q: 'Compare the slopes.', opts: ['Compare 2 with 4', 'Compare 2 with ½'], ans: 0, res: ['2 < 4: flatter. The robot is wrong.', '2 > 4: steeper. The robot is right.'], rans: 0,
              hint: 'The slope of f is 4.', no: { 1: 'Compare g with f: f has slope 4.', r1: '2 is less than 4.' }, why: 'Multiplying by a number between 0 and 1 makes outputs smaller: flatter.' }
          ] },
        { k: 'sort', q: 'Is each statement *correct* or a *mistake*?', bins: ['✓ Correct', '✗ Mistake'],
          cards: [{ t: 'f(x) − 2 moves the graph down 2', b: 0 }, { t: 'f(x − 2) moves the graph left 2', b: 1, why: 'Inside the brackets it is backwards: f(x − 2) moves it right 2.' }, { t: '−f(x) flips it over the x-axis', b: 0 },
            { t: 'y = 3x − 5 has b = 5', b: 1, why: 'b keeps its sign: b = −5.' }, { t: 'Vertical line hits twice: not a function', b: 0 }, { t: '3 · f(x) is flatter than f(x)', b: 1, why: '3 is bigger than 1, so it is steeper.' }] }
      ] },
    { name: 'Domain and inverse cases', learn: ['A domain only has values that make sense in the story.', 'To undo × 3.75, divide by 3.75. To undo a whole machine, undo the last step first.'],
      tasks: [
        { k: 'choice', q: 'Case 12. Metro tickets cost 4 riyals: *C(t) = 4t*, t = number of tickets. The robot says: "Domain: all numbers from −10 to 10." What is the fix?', opts: ['Whole numbers 0, 1, 2, 3, …', 'All numbers from 0 to 10', 'All numbers, even negatives', 'Only the number 4'], ans: 0,
          no: [null, 'Can you buy 2.5 tickets?', 'You cannot buy −2 tickets.', '4 is the price, not the number of tickets.'], why: 'You can buy 0, 1, 2, … tickets, never −2 or 3.5. The domain is whole numbers.' },
        { k: 'solve', q: 'Case 13. 1 USD = 3.75 riyals. Change 30 riyals into USD. The robot wrote:', start: '30 × 3.75 = 112.50, so 112.50 USD',
          moves: [
            { q: 'What is wrong?', opts: ['It multiplied instead of divided', '3.75 is the wrong rate', 'Nothing: it is right'], ans: 0, res: ['Fix: 30 ÷ 3.75', 'Fix: 30 − 3.75', 'Fix: 3.75 ÷ 30'], rans: 0,
              hint: '1 USD is worth more than 1 riyal. Should you get more USD or fewer?', no: { 1: 'The rate is right: 1 USD = 3.75 riyals.', 2: 'Should 30 riyals be more than 100 USD?', r1: 'Changing money uses × or ÷.', r2: 'The riyals go first: 30 ÷ 3.75.' } },
            { q: 'Finish the fix.', opts: ['Divide 30 by 3.75', 'Divide 3.75 by 30'], ans: 0, res: ['8 USD', '80 USD', '0.8 USD'], rans: 0,
              hint: 'How many 3.75s make 30?', no: { 1: 'The riyals go first: 30 ÷ 3.75.', r1: '80 × 3.75 is 300.', r2: '0.8 × 3.75 is 3.' }, why: 'Check: 8 × 3.75 = 30 ✓.' }
          ] },
        { k: 'solve', q: 'Case 14. Write the equation for the table. The robot wrote: "y goes up 6 each time, so y = 6x + 1."', tab: { head: ['x', '0', '2', '4', '6'], rows: [['y', 1, 7, 13, 19]] }, start: 'y = 6x + 1',
          moves: [
            { q: 'What is wrong?', opts: ['x goes up 2 each time, not 1', 'b should be 0', 'Nothing: it is right'], ans: 0, res: ['Fix: slope = 6 ÷ 2', 'Fix: slope = 6 ÷ 1', 'Fix: slope = 2 ÷ 6'], rans: 0,
              hint: 'Look at the x row.', no: { 1: 'At x = 0, y = 1. So b = 1 is right.', 2: 'Test x = 2: 6(2) + 1 = 13, but the table says 7.', r1: 'x goes up by 2, not 1.', r2: 'Change in y goes on top.' } },
            { q: 'Write the fix.', opts: ['Slope 3 and b = 1', 'Slope 3 and b = 0'], ans: 0, res: ['y = 3x + 1', 'y = 3x + 7', 'y = 6x + 1'], rans: 0,
              hint: 'b is y when x = 0.', no: { 1: 'At x = 0, y = 1, so b = 1.', r1: 'b is y at x = 0: 1.', r2: 'That is the robot\'s answer.' }, why: 'Check: x = 4 gives 3(4) + 1 = 13 ✓.' }
          ] },
        { k: 'choice', q: 'Case 15. Buses cost 300 riyals each to rent: *C(b) = 300b*. The robot drew a solid straight line. What is the fix?', opts: ['Draw dots: you can only rent whole buses', 'The line should go down', 'The line should start at 300', 'Nothing: a solid line is right'], ans: 0,
          no: [null, 'More buses cost more, so it goes up.', '0 buses cost 0 riyals.', 'Can you rent 2.5 buses?'], why: 'The domain is 0, 1, 2, 3, …: it is discrete, so the graph is dots, not a line.' }
      ] },
    { name: 'The chief detective boss', boss: true, learn: ['Mixed case files, fewer hints. Find the first wrong step, fix it, check it.'],
      tasks: [
        { k: 'solve', q: 'Case 16. A line has slope 4 and goes through *(2, 3)*. The robot wrote:', start: '3 = 4(2) + b, so b = 11',
          moves: [
            { q: 'What is wrong?', opts: ['It added 8 instead of subtracting', 'The slope should be 2', 'Nothing: it is right'], ans: 0, res: ['Fix: b = 3 − 8', 'Fix: b = 3 + 8', 'Fix: b = 8 − 3'], rans: 0,
              hint: '3 = 8 + b. What do you do to both sides?' },
            { q: 'Finish the fix.', opts: ['Work out 3 − 8', 'Work out 8 − 3'], ans: 0, res: ['b = −5, so y = 4x − 5', 'b = 5, so y = 4x + 5', 'b = 11, so y = 4x + 11'], rans: 0, why: 'Check with (2, 3): 4(2) − 5 = 3 ✓.' }
          ] },
        { k: 'choice', q: 'Case 17. The robot says: "This table is linear, because y always goes up."', tab: { head: ['x', '1', '2', '3', '4'], rows: [['y', 2, 4, 8, 16]] },
          opts: ['Not linear: the steps 2, 4, 8 are not equal', 'Linear: y always goes up', 'Linear: the slope is 2'], ans: 0,
          no: [null, 'Going up is not enough. The steps must be equal.', 'Check every step: 4 − 2, 8 − 4, 16 − 8.'], why: 'y doubles each time. A linear table has the same step every time.' },
        { k: 'number', q: 'Case 18. *f(x) = 3x* and *g(x) = f(x − 4)*. The robot wrote *g(x) = 3x − 4*. In the right answer, what number goes at the end, after 3x?', ans: -12,
          hint: '3(x − 4): multiply both terms.', why: 'g(x) = 3(x − 4) = 3x − 12. The robot forgot to multiply the 4 by 3.' },
        { k: 'choice', q: 'Case 19. Undo the machine *× 2, then + 6*. The robot says: "÷ 2, then − 6." What is the fix?', opts: ['− 6 first, then ÷ 2', '÷ 2, then + 6', '× 2, then − 6', 'Nothing: the robot is right'], ans: 0,
          no: [null, 'Undo + 6 with − 6, not + 6.', 'Undo × 2 with ÷ 2.', 'Test 5: 5 × 2 + 6 = 16. Then 16 ÷ 2 − 6 = 2, not 5.'], why: 'Last step first: 16 − 6 = 10, 10 ÷ 2 = 5 ✓.' }
      ] }
  ]
});
