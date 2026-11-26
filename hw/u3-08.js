/* Homework: Unit 3 Lesson 8, Compare Two Functions. */
SFA_HW({
  id: 'g38',
  unit: 3,
  lesson: 8,
  topic: 'Compare two functions',
  title: 'Beach Dash Duel',
  who: 'marcus',
  intro: ['It is the Sandy Flats Beach Dash! Marcus says he is the fastest, so he gives himself a 40 m head start. Priya says that is fine: she will catch him.', 'The race data comes in different forms: an equation, a table, a graph and words. Compare them to find who starts ahead, who is faster, and when one catches the other.'],
  goal: 'Compare two linear functions given in different forms: the start, the rate, and when they are equal.',
  bigIdea: 'Compare the starts (b) and the rates (m): the bigger start is ahead at first, and the bigger rate catches up where the graphs cross.',
  levels: [
    { name: 'On your marks', learn: ['The *start* (initial value) is the output when x = 0.', 'The *rate* is how much the output changes for each 1 of x.', 'The bigger start is ahead at first. The bigger rate grows faster.'],
      tasks: [
        { k: 'choice', q: 'Marcus: *d = 3t + 40* (metres after t seconds). Priya\'s table is below. Who *starts ahead*?', tab: { head: ['t (s)', '0', '2', '4'], rows: [['Priya d (m)', 0, 10, 20]] }, opts: ['Priya: she runs faster', 'They start together', 'Marcus: he starts at 40 m'], ans: 2, no: ['Faster is the rate. "Starts ahead" is about t = 0.', 'At t = 0 Marcus is at 40 m and Priya is at 0 m.', null], why: 'At t = 0: Marcus 40 m, Priya 0 m. Marcus starts ahead.' },
        { k: 'solve', q: 'Find Priya\'s *rate* from her table.', tab: { head: ['t (s)', '0', '2', '4'], rows: [['Priya d (m)', 0, 10, 20]] }, start: 't: 0, 2, 4 · d: 0, 10, 20',
          moves: [
            { q: 'First move?', opts: ['Find the change in d and in t', 'Read d when t = 2'], ans: 0, res: ['+2 m for every +10 s', '+10 m for every +2 s', '+10 m for every +1 s'], rans: 1, hint: 'The table jumps 2 seconds at a time.', no: { '1': 'One value is not a rate. Find the changes.', r0: 'Swapped: the distance goes up 10.', r2: 'Look at t: 0, 2, 4. It goes up by 2.' } },
            { q: 'Next move?', opts: ['Add to get the rate', 'Divide to get the rate'], ans: 1, res: ['2 ÷ 10 = 0.2 m per second', '10 m per second', '10 ÷ 2 = 5 m per second'], rans: 2, hint: 'Metres ÷ seconds.', no: { '0': 'A rate is a division.', r0: 'Upside down: metres on top.', r1: '10 m is for 2 seconds. Divide by 2.' }, why: 'Priya runs 5 m each second: d = 5t.' }
          ] },
        { k: 'choice', q: 'Marcus runs *3 m* per second. Priya runs *5 m* per second. Who is *faster*?', opts: ['Marcus: he is ahead', 'Priya: 5 is more than 3', 'Marcus: he has 40 m'], ans: 1, no: ['Being ahead is the start, not the speed.', null, '40 m is his head start, not his speed.'], why: 'The bigger rate grows faster. On a graph, Priya\'s line is steeper.' }
      ] },
    { name: 'The race table', learn: ['Fill in a table for both and look for the time when they are *equal*.', 'After that point, the faster one is ahead.'],
      tasks: [
        { k: 'fill', q: 'Complete the race table. Marcus: *d = 3t + 40*. Priya: *d = 5t*.', head: ['t (s)', 'Marcus (m)', 'Priya (m)'], rows: [[0, 40, 0], [10, { a: 70 }, { a: 50 }], [20, { a: 100 }, { a: 100 }], [30, { a: 130 }, { a: 150 }]], hint: 'Marcus: 3 × t, then + 40. Priya: 5 × t.', why: 'At 20 s they are both at 100 m. At 30 s Priya is ahead.' },
        { k: 'solve', q: 'Extend the table to find when Priya catches Marcus. At *t = 10*: Marcus 70 m, Priya 50 m.', start: 't = 10: Marcus 70, Priya 50',
          moves: [
            { q: 'Next move?', opts: ['Go back to t = 0', 'Go to t = 15'], ans: 1, res: ['t = 15: Marcus 85, Priya 75', 't = 15: Marcus 85, Priya 85', 't = 15: Marcus 75, Priya 85'], rans: 0, hint: '3 × 15 + 40 and 5 × 15.', no: { '0': 'We want to go forward until they are equal.', r1: 'Priya: 5 × 15 = 75.', r2: 'Swapped. Marcus: 45 + 40 = 85. Priya: 75.' } },
            { q: 'Next move?', opts: ['Go to t = 20', 'Stop here'], ans: 0, res: ['t = 20: Marcus 100, Priya 100', 't = 20: Marcus 110, Priya 100', 't = 20: Marcus 100, Priya 90'], rans: 0, hint: '3 × 20 + 40 and 5 × 20.', no: { '1': 'Marcus is still ahead. Keep going.', r1: 'Marcus: 60 + 40 = 100.', r2: 'Priya: 5 × 20 = 100.' } },
            { q: 'Last move?', opts: ['Add the distances', 'Say what it means'], ans: 1, res: ['Marcus catches Priya at 20 s', 'Priya catches Marcus at 20 s, 100 m', 'They never meet'], rans: 1, hint: 'Who was behind before 20 s?', no: { '0': 'Adding does not help. They are equal.', r0: 'Marcus was ahead. Priya catches him.', r2: 'They are equal at t = 20.' }, why: 'Equal at 20 s and 100 m. After that, Priya is ahead.' }
          ] },
        { k: 'choice', q: 'The race is *80 m* long. Who wins?', opts: ['It is a tie', 'Priya: she is faster', 'Marcus: he gets there before Priya'], ans: 2, no: ['They tie at 100 m, not 80 m.', 'She is faster, but she catches him only at 100 m.', null], why: 'The race ends before 100 m, so Priya has not caught up yet. Marcus wins.' },
        { k: 'choice', q: 'The race is *150 m* long. Who wins?', opts: ['Priya: she passes him at 100 m', 'Marcus: he started ahead', 'It is a tie'], ans: 0, no: [null, 'After 100 m, Priya is in front.', 'They tie only at 100 m.'], why: 'After they meet at 100 m, the faster runner stays ahead.' }
      ] },
    { name: 'Equation vs table', learn: ['Turn both into a *start* and a *rate*.', 'Behind but faster? It will catch up.'],
      tasks: [
        { k: 'solve', q: 'Savings for a new arcade game. Gus: *G = 15w + 60* (SAR after w weeks). Zero\'s table is below. Compare.', tab: { head: ['w', '0', '1', '2', '3'], rows: [['Zero (SAR)', 0, 25, 50, 75]] }, start: 'Gus: G = 15w + 60 · Zero: 0, 25, 50, 75',
          moves: [
            { q: 'First move?', opts: ['Find each start (w = 0)', 'Find each total at week 3'], ans: 0, res: ['Gus 60 SAR, Zero 0 SAR', 'Gus 15 SAR, Zero 0 SAR', 'Gus 60 SAR, Zero 25 SAR'], rans: 0, hint: 'In the equation, the start is the number on its own.', no: { '1': 'Start with w = 0.', r1: '15 is the rate. The start is 60.', r2: 'At w = 0, Zero has 0.' } },
            { q: 'Next move?', opts: ['Add the starts', 'Find each rate'], ans: 1, res: ['Gus 15, Zero 75 SAR per week', 'Gus 15, Zero 25 SAR per week', 'Gus 60, Zero 25 SAR per week'], rans: 1, hint: 'Gus: the number with w. Zero: the change each week.', no: { '0': 'Adding does not compare them.', r0: '75 is Zero\'s total at week 3. He adds 25 a week.', r2: '60 is Gus\'s start. His rate is 15.' } },
            { q: 'Decide.', opts: ['Say who is ahead and who is faster', 'Pick the biggest number'], ans: 0, res: ['Zero starts ahead, Gus saves faster', 'Gus is ahead and faster', 'Gus starts ahead, Zero saves faster'], rans: 2, hint: 'Compare the starts, then the rates.', no: { r0: 'Gus starts at 60, Zero at 0.', r1: '25 per week is faster than 15.' }, why: 'Zero is behind but faster, so he will catch Gus.' }
          ] },
        { k: 'number', q: 'In which week do Gus and Zero have the *same* amount? (Extend the table: Gus 60, 75, 90…; Zero 0, 25, 50…)', ans: 6, hint: 'Zero gains 10 SAR on Gus each week. He is 60 behind.', why: 'Week 6: Gus 15(6) + 60 = 150, Zero 25(6) = 150.' },
        { k: 'choice', q: 'Who has more after *week 10*?', opts: ['Gus: he started ahead', 'Zero: 250 SAR vs 210 SAR', 'They are equal'], ans: 1, no: ['Zero caught up in week 6 and keeps saving faster.', null, 'They were equal only in week 6.'], why: 'Gus: 150 + 60 = 210. Zero: 250. The faster saver stays ahead.' }
      ] },
    { name: 'Graphs and words', learn: ['On a graph: start = where it crosses the y-axis, rate = steepness.', 'Draining or losing: the rate is *negative*. "Faster" means the bigger drop.'],
      tasks: [
        { k: 'solve', q: 'Fahd\'s savings are on the graph. Lina says: "I have *20 SAR* and add *2 SAR* a day." Compare.', fig: { range: [0, 8], yrange: [0, 45], ystep: 5, lines: [{ m: 5, b: 5, lab: 'Fahd' }], pts: [[0, 5], [1, 10]], x: 'days', y: 'SAR' }, start: 'Fahd: line through (0, 5) and (1, 10)',
          moves: [
            { q: 'First move?', opts: ['Read Fahd\'s start on the y-axis', 'Read Fahd at day 8'], ans: 0, res: ['Fahd starts at 0 SAR', 'Fahd starts at 5 SAR', 'Fahd starts at 10 SAR'], rans: 1, hint: 'Where does the line cross the y-axis?', no: { r0: 'The line crosses the y-axis above 0.', r2: '10 is at day 1.' } },
            { q: 'Next move?', opts: ['Find Lina\'s start', 'Find Fahd\'s rate'], ans: 1, res: ['2 SAR per day', '10 SAR per day', '5 SAR per day'], rans: 2, hint: 'From day 0 to day 1: 5 to 10.', no: { r0: '2 per day is Lina\'s rate.', r1: '10 is the height at day 1. The rise is 10 − 5.' } },
            { q: 'Decide.', opts: ['Compare names', 'Compare starts and rates'], ans: 1, res: ['Fahd starts ahead, Lina grows faster', 'Fahd is ahead and faster', 'Lina starts ahead, Fahd grows faster'], rans: 2, hint: 'Lina: start 20, rate 2. Fahd: start 5, rate 5.', no: { r0: 'Fahd starts at 5, Lina at 20.', r1: 'Lina starts at 20, more than 5.' }, why: 'Fahd is behind but faster, so he catches Lina.' }
          ] },
        { k: 'number', q: 'Fahd: *5x + 5*. Lina: *2x + 20*. On which day do they have the same amount?', ans: 5, hint: 'Try day 5 in both.', why: 'Day 5: Fahd 25 + 5 = 30, Lina 10 + 20 = 30.' },
        { k: 'choice', q: 'Two splash tanks drain. Tank A: *W = 80 − 5t*. Tank B: 90, 87, 84, 81 litres at t = 0, 1, 2, 3. Which drains *faster*?', opts: ['Tank A: it loses 5 L a minute', 'Tank B: 90 is bigger', 'Tank B: it starts with more'], ans: 0, no: [null, 'Compare the drop each minute: 5 vs 3.', 'Starting with more is not draining faster.'], why: 'A loses 5 L a minute, B loses 3 L a minute.' },
        { k: 'choice', q: 'Same tanks. Which *starts* with more water?', opts: ['Tank B: 90 L', 'Tank A: it drains faster', 'Tank A: 80 L'], ans: 0, no: [null, 'Draining fast is the rate, not the start.', '80 is less than 90.'], why: 'At t = 0: A has 80 L, B has 90 L.' }
      ] },
    { name: 'The photo finish boss', boss: true, learn: ['Mixed forms. Find each start and rate, then compare.'],
      tasks: [
        { k: 'match', q: 'Match each function to its start and rate.', pairs: [['x: 0, 1, 2 · y: 8, 11, 14', 'Start 8, rate 3'], ['y = 3x + 2', 'Start 2, rate 3'], ['Starts at 8, loses 2 each step', 'Start 8, rate −2'], ['x: 0, 2, 4 · y: 0, 4, 8', 'Start 0, rate 2']] },
        { k: 'solve', q: 'Data plans. Plan A: *50 SAR + 2 SAR per GB*. Plan B: GB 0, 5, 10 → 20, 45, 70 SAR. Compare.', start: 'A: 50 + 2 per GB · B: 20, 45, 70',
          moves: [
            { q: 'First move?', opts: ['Find each start', 'Find each cost at 5 GB'], ans: 0, res: ['A 2 SAR, B 20 SAR', 'A 50 SAR, B 20 SAR'], rans: 1, hint: 'Cost at 0 GB.' },
            { q: 'Next move?', opts: ['Add the starts', 'Find each rate'], ans: 1, res: ['A 2, B 5 SAR per GB', 'A 2, B 25 SAR per GB'], rans: 0, hint: 'B goes up 25 for every 5 GB.', no: { r1: '25 is for 5 GB. Divide by 5.' } },
            { q: 'Next move?', opts: ['Check 10 GB on both', 'Check 0 GB again'], ans: 0, res: ['A 52, B 70', 'A 70, B 70: equal'], rans: 1, hint: 'A: 50 + 2 × 10.' },
            { q: 'Decide.', opts: ['Pick A always', 'Say which plan is cheaper when'], ans: 1, res: ['Over 10 GB, Plan A is cheaper', 'Over 10 GB, Plan B is cheaper'], rans: 0, why: 'B starts cheaper but costs more per GB. After 10 GB, A is cheaper.' }
          ] },
        { k: 'choice', q: 'Zero needs only *4 GB*. Which plan is cheaper?', opts: ['They cost the same', 'Plan B: 40 SAR vs 58 SAR', 'Plan A: 58 SAR vs 40 SAR'], ans: 1, no: ['They are equal only at 10 GB.', null, 'A: 50 + 8 = 58. B: 5 × 4 + 20 = 40. Which is less?'], why: 'Below 10 GB, Plan B\'s low start wins.' },
        { k: 'choice', q: 'Which line grows faster, and where are they equal?', fig: { range: [0, 6], yrange: [0, 12], ystep: 2, lines: [{ m: 1, b: 4, lab: 'A' }, { m: 2, b: 1, lab: 'B' }], x: 'x', y: 'y' }, opts: ['B grows faster; equal at x = 3', 'A grows faster; they never meet', 'A grows faster; equal at x = 3', 'B grows faster; equal at x = 7'], ans: 0, no: [null, 'They cross at (3, 7).', 'A is less steep: up 1 each step. B goes up 2.', 'Find where the lines cross: x = 3, y = 7.'], why: 'B is steeper (rate 2). The lines cross at (3, 7).' },
        { k: 'number', q: 'Sara has *100 SAR* and spends *8 SAR* a day. Omar has *40 SAR* and saves *4 SAR* a day. On which day do they have the same?', ans: 5, hint: 'The gap is 60 SAR. It closes by 8 + 4 = 12 each day.', why: 'Day 5: Sara 100 − 40 = 60, Omar 40 + 20 = 60.' }
      ] }
  ]
});
