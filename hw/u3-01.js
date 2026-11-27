/* Homework: Unit 3 Lesson 1, Transformation Mystery. */
SFA_HW({
  id: 'g31',
  unit: 3,
  lesson: 1,
  topic: 'Transformations of y = x',
  title: 'Laser Line Show',
  who: 'zero',
  intro: ['Tonight the Sandy Flats arcade has a laser show on the beach. Every laser beam is a straight line. The first beam is the *parent beam*: *y = x*.', 'But a wave hit the control desk and the beam labels got mixed up. Zero needs you to say how each new beam is different from the parent beam, before the show starts.'],
  goal: 'Say how a line moves when its equation changes: up or down, steeper or flatter, or flipped.',
  bigIdea: '+ a number moves the line up or down, × a number changes how steep it is, and a minus in front of x flips it.',
  levels: [
    { name: 'Meet the parent beam', learn: ['The simplest line is *y = x*: the *parent function*. It goes through (0, 0) with slope 1.', 'A *transformation* moves or reshapes a graph.', 'Compare a new line with y = x: put the same x into both and compare the outputs.'],
      tasks: [
        { k: 'choice', q: 'Which equation is the *parent beam*?', opts: ['y = x', 'y = x + 1', 'y = −x', 'y = 2x'], ans: 0, no: [null, 'This one is moved: it has + 1.', 'This one is flipped: it has a minus.', 'This one is changed: it has × 2.'], why: 'y = x is the simplest line: the output is the same as the input.' },
        { k: 'choice', q: 'The dashed beam is *y = x*. What happened to make the solid beam?', fig: { range: [-5, 5], lines: [{ m: 1, b: 0, dash: true, col: '#55505f', lab: 'y = x' }, { m: 1, b: 3 }], x: 'x', y: 'y' }, opts: ['It got steeper', 'It flipped', 'It moved down 3', 'It moved up 3'], ans: 3, no: ['The two beams are parallel: same steepness.', 'Both beams go uphill, so it did not flip.', 'Look at the y-axis: the solid beam crosses it *above* 0.', null], why: 'Same steepness, but it crosses the y-axis at 3, not 0: a shift up 3.' },
        { k: 'solve', q: 'How is *y = x + 2* different from *y = x*? Work it out like in class.', start: 'y = x + 2  and  y = x',
          moves: [
            { q: 'First move?', opts: ['Put x = 0 into both', 'Add the two equations', 'Draw a circle'], ans: 0, res: ['y = 0 and y = 0', 'y = 2 and y = 0', 'y = 2 and y = 2'], rans: 1, hint: 'Make a table: start with x = 0. Then x + 2 = 0 + 2.', no: { r0: 'For y = x + 2, put in 0: 0 + 2 = 2, not 0.', r2: 'For y = x, put in 0: the output is 0.' } },
            { q: 'Next move?', opts: ['Put x = 1 into both', 'Stop: we are done'], ans: 0, res: ['y = 1 and y = 3', 'y = 3 and y = 1', 'y = 2 and y = 1'], rans: 1, hint: 'One point is not enough. Try x = 1: 1 + 2 = 3.', no: { r0: 'The first output is for y = x + 2: 1 + 2 = 3.', r2: '1 + 2 is 3, not 2.' } },
            { q: 'Now compare.', opts: ['Compare the outputs', 'Compare the letters'], ans: 0, res: ['Every output is 2 more', 'Every output is 2 times more', 'The outputs are the same'], rans: 0, hint: '2 vs 0, then 3 vs 1. What is the difference each time?', no: { r1: '2 × 1 = 2, not 3. The difference is always + 2.', r2: '3 and 1 are not the same.' } },
            { q: 'Name the change.', opts: ['Change the equation', 'Name the transformation'], ans: 1, res: ['A stretch by 2', 'A shift right 2', 'A shift up 2'], rans: 2, hint: '"2 more" on every output means the line goes up.', no: { r0: 'A stretch changes the steepness. Here the steepness stays the same.', r1: 'The outputs (y) change, so it moves up, not right.' }, why: 'Every output is 2 more, so the whole line slides up 2. The steepness does not change.' }
          ] }
      ] },
    { name: 'Up and down', learn: ['*y = x + k*: the beam moves *up* k.', '*y = x − k*: the beam moves *down* k.', 'The y-intercept moves. The slope stays 1.'],
      tasks: [
        { k: 'match', q: 'Match each beam to its graph.', range: [-5, 5], pairs: [['y = x + 4', { plane: { m: 1, b: 4, op: '=' } }, 'It crosses the y-axis at 4.'], ['y = x − 3', { plane: { m: 1, b: -3, op: '=' } }, 'It crosses the y-axis at −3.'], ['y = x', { plane: { m: 1, b: 0, op: '=' } }, 'The parent goes through (0, 0).'], ['y = x + 1', { plane: { m: 1, b: 1, op: '=' } }, 'It crosses the y-axis at 1.']] },
        { k: 'number', q: 'Where does the beam *y = x − 3* cross the y-axis? Type the y-value.', ans: -3, hint: 'Put in x = 0: 0 − 3 = ?', why: 'y = −3. The parent beam moved down 3.' },
        { k: 'solve', q: 'Zero wants the parent beam moved *down 5*. Write the new beam.', start: 'y = x',
          moves: [
            { q: 'What do you do?', opts: ['Multiply x by 5', 'Add 5 to every output', 'Subtract 5 from every output'], ans: 2, res: ['y = x + 5', 'y = x − 5', 'y = 5x'], rans: 1, hint: 'Down means smaller outputs. Take 5 away.', no: { '0': 'Multiplying changes the steepness. We want to move it down.', '1': 'Adding moves it up, not down.', r0: '+ 5 is up. We subtracted 5.', r2: '5x is steeper. We subtracted 5.' } },
            { q: 'Check it.', opts: ['Put in y = 0', 'Put in x = 0'], ans: 1, res: ['y = 0: it crosses at 0', 'y = 5: it crosses at 5', 'y = −5: it crosses the y-axis at −5'], rans: 2, hint: '0 − 5 = ?', no: { r0: '0 − 5 is not 0.', r1: '0 − 5 is −5, not 5.' }, why: 'y = x − 5 crosses the y-axis 5 below the parent beam.' }
          ] },
        { k: 'choice', q: 'Gus says: "*y = x − 3* moves the beam *up* 3." Is he right?', opts: ['No: minus 3 moves it down 3', 'Yes: there is a 3, so it goes up', 'No: it moves right 3'], ans: 0, no: [null, 'Look at the sign. − 3 makes every output smaller.', 'We take 3 from the output (y), so the move is up or down.'], why: 'Every output is 3 less, so the line is 3 lower.' }
      ] },
    { name: 'Steeper or flatter', learn: ['*y = ax* with a bigger than 1: *steeper* (a stretch).', '*y = ax* with a between 0 and 1: *flatter* (a compression).', 'All of these still go through (0, 0).'],
      tasks: [
        { k: 'fill', q: 'Fill in the table for *y = 3x* and *y = ½x*.', head: ['x', 'y = 3x', 'y = ½x'], rows: [[-2, { a: -6 }, { a: -1 }], [0, { a: 0 }, { a: 0 }], [2, { a: 6 }, { a: 1 }], [4, { a: 12 }, { a: 2 }]], hint: 'For y = 3x, times x by 3. For y = ½x, take half of x. Half of −2 is −1.', why: 'y = 3x grows 3 for each step right. y = ½x grows only ½.' },
        { k: 'solve', q: 'How is *y = 3x* different from *y = x*?', start: 'y = 3x  and  y = x',
          moves: [
            { q: 'First move?', opts: ['Put x = 1 into both', 'Add 3 to both'], ans: 0, res: ['y = 4 and y = 1', 'y = 1 and y = 3', 'y = 3 and y = 1'], rans: 2, hint: '3x means 3 times x. 3 × 1 = ?', no: { r0: '3x is 3 times x, not 3 plus x. 3 × 1 = 3.', r1: 'The first output is for y = 3x: 3 × 1 = 3.' } },
            { q: 'Next move?', opts: ['Put x = 2 into both', 'Put x = 1 in again'], ans: 0, res: ['y = 5 and y = 2', 'y = 6 and y = 2', 'y = 6 and y = 6'], rans: 1, hint: '3 × 2 = 6.', no: { r0: '3 × 2 = 6. Did you add 3?', r2: 'y = x gives 2 when x = 2.' } },
            { q: 'Compare.', opts: ['Compare the y-intercepts only', 'Compare how much y grows'], ans: 1, res: ['y = 3x grows 3 per step; y = x grows 1', 'Both grow 1 per step', 'y = 3x grows 2 per step'], rans: 0, hint: '3 to 6 is + 3. 1 to 2 is + 1.', no: { r1: 'y = 3x went from 3 to 6: that is + 3.', r2: '6 − 3 = 3, not 2.' } },
            { q: 'Name the change.', opts: ['Guess', 'Name the transformation'], ans: 1, res: ['A stretch: 3 times as steep', 'A shift up 3', 'A compression'], rans: 0, hint: 'It grows faster, so it is steeper.', no: { r1: 'A shift keeps the steepness. Both lines go through (0, 0) here.', r2: 'A compression makes it flatter. This one is steeper.' }, why: 'Multiplying x by 3 makes the beam 3 times as steep. It still goes through (0, 0).' }
          ] },
        { k: 'sort', q: 'Steeper or flatter than the parent beam *y = x*?', bins: ['Steeper', 'Flatter'], cards: [{ t: 'y = 2x', b: 0 }, { t: 'y = ½x', b: 1 }, { t: 'y = 4x', b: 0 }, { t: 'y = ¼x', b: 1 }, { t: 'y = 1.5x', b: 0, why: '1.5 is bigger than 1: steeper.' }, { t: 'y = 0.3x', b: 1, why: '0.3 is less than 1: flatter.' }], why: 'The number times x: bigger than 1 is steeper, between 0 and 1 is flatter.' },
        { k: 'choice', q: 'Which beam is the *flattest*?', fig: { range: [-5, 5], lines: [{ m: 2, b: 0, lab: 'A' }, { m: 1, b: 0, lab: 'B', col: '#55505f', dash: true }, { m: 0.3333333333333333, b: 0, lab: 'C' }], x: 'x', y: 'y' }, opts: ['B: y = x', 'A: y = 2x', 'C: y = ⅓x'], ans: 2, no: ['B is the parent. C is flatter.', 'A climbs 2 for each step right. That is the steepest.', null], why: '⅓ is less than 1, so C climbs only ⅓ per step: the flattest.' }
      ] },
    { name: 'Flip it', learn: ['*y = −x* is a *reflection*: the beam flips like a mirror.', 'Every output has the *opposite sign*: 3 becomes −3.', 'Uphill becomes downhill. It still goes through (0, 0).'],
      tasks: [
        { k: 'choice', q: 'The dashed beam is *y = x*. What happened to make the solid beam?', fig: { range: [-5, 5], lines: [{ m: 1, b: 0, dash: true, col: '#55505f', lab: 'y = x' }, { m: -1, b: 0 }], x: 'x', y: 'y' }, opts: ['It moved down', 'It got flatter', 'It flipped (a reflection)', 'It moved right'], ans: 2, no: ['Both beams go through (0, 0). It did not move down.', 'It is just as steep, but downhill.', null, 'Both go through (0, 0).'], why: 'Uphill became downhill with the same steepness: a reflection. It is y = −x.' },
        { k: 'solve', q: 'Find the output of *y = −x* when *x = 3*. Then compare with y = x.', start: 'y = −(3)',
          moves: [
            { q: 'What first?', opts: ['Take the opposite of 3', 'Subtract 3 from 0 twice', 'Ignore the minus'], ans: 0, res: ['y = 0', 'y = −3', 'y = 3'], rans: 1, hint: '−x means "the opposite of x".', no: { '2': 'The minus matters: it flips the sign.', r0: 'The opposite of 3 is −3.', r2: 'The opposite of 3 is −3, not 3.' } },
            { q: 'Now compare.', opts: ['Put x = 3 into y = x', 'Add 3'], ans: 0, res: ['y = −3: the same output', 'y = 3: same size, opposite sign', 'y = 6: double'], rans: 1, hint: 'y = x gives back the input.', no: { r0: 'y = x gives 3 when x = 3.', r2: 'y = x gives 3, not 6.' }, why: '3 and −3: every output flips its sign, like a mirror over the x-axis.' }
          ] },
        { k: 'sort', q: 'What kind of change is each beam, compared with *y = x*?', bins: ['Shift', 'Stretch / compress', 'Reflection'], cards: [{ t: 'y = x + 2', b: 0 }, { t: 'y = 2x', b: 1 }, { t: 'y = −x', b: 2 }, { t: 'y = x − 4', b: 0, why: '− 4 moves it down 4: a shift.' }, { t: 'y = ⅓x', b: 1, why: '× ⅓ makes it flatter: a compression.' }, { t: 'y = 5x', b: 1 }], why: '+ or − a number: shift. A number times x: stretch or compress. A minus in front of x: reflection.' },
        { k: 'plane', q: 'Graph the flipped beam *y = −x*: tap two points on it.', range: [-5, 5], m: -1, b: 0, op: '=', parts: ['line'], hint: 'Start at (0, 0). Then right 1, down 1: (1, −1).', why: '(0, 0) and (1, −1): downhill, as steep as y = x.' }
      ] },
    { name: 'Show time boss', boss: true, learn: ['Mixed beams. Look at the number times x (steepness, flip) and the number added (up or down).'],
      tasks: [
        { k: 'match', q: 'Match each beam to its graph.', range: [-5, 5], pairs: [['y = 2x', { plane: { m: 2, b: 0, op: '=' } }, 'Steep, through (0, 0).'], ['y = ½x', { plane: { m: 0.5, b: 0, op: '=' } }, 'Flat, through (0, 0).'], ['y = −x', { plane: { m: -1, b: 0, op: '=' } }, 'Downhill, through (0, 0).'], ['y = x − 2', { plane: { m: 1, b: -2, op: '=' } }, 'Crosses the y-axis at −2.']] },
        { k: 'solve', q: 'Describe *y = 2x + 1* compared with *y = x*.', start: 'y = 2x + 1  and  y = x',
          moves: [
            { q: 'First move?', opts: ['Look at the y only', 'Look at the number times x'], ans: 1, res: ['It is 1: the same', 'It is 2: moved up 2', 'It is 2: twice as steep'], rans: 2, hint: 'The number times x controls the steepness.', no: { r0: 'The number times x is 2.', r1: 'The number times x changes steepness, not position.' } },
            { q: 'Next move?', opts: ['Look at the number added', 'Look at the 2 again'], ans: 0, res: ['+ 1: flipped', '+ 1: moved right 1', '+ 1: moved up 1'], rans: 2, hint: 'A number added moves the line up or down.', no: { r0: 'Only a minus in front of x flips it.', r1: 'Adding changes the outputs (y): up, not right.' } },
            { q: 'Last move.', opts: ['Name one change', 'Name both changes'], ans: 1, res: ['Flipped, then up 1', 'Stretched by 2, then up 1', 'Shifted up 2, then up 1'], rans: 1, hint: 'Put your two answers together.', why: '2x: twice as steep. + 1: up 1. It crosses the y-axis at (0, 1).' }
          ] },
        { k: 'plane', q: 'Graph *y = x + 3*: tap two points on it.', range: [-5, 5], m: 1, b: 3, op: '=', parts: ['line'], hint: 'The parent beam moved up 3. Start at (0, 3).', why: '(0, 3), then up 1 and right 1 to (1, 4).' },
        { k: 'choice', q: 'Zero flips the parent beam, then moves it *down 2*. Which beam is it?', opts: ['y = −2x', 'y = −x + 2', 'y = x − 2', 'y = −x − 2'], ans: 3, no: ['−2x is flipped and steeper, not moved down.', '+ 2 moves it up. We want down.', 'This one is not flipped: there is no minus in front of x.', null], why: '−x flips it. − 2 moves it down 2.' },
        { k: 'number', q: 'On the beam *y = ½x*, what is y when *x = 6*?', ans: 3, hint: 'Half of 6.', why: 'y = ½ × 6 = 3. The flat beam only climbs to 3.' }
      ] }
  ]
});
