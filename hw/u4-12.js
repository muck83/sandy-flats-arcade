/* Homework: Unit 4 Lesson 12, Write the System. */
SFA_HW({
  id: 'g72', unit: 4, lesson: 12, topic: 'Write the system', title: 'Festival Count-Up', who: 'gus',
  intro: ['It is the Sandy Flats Beach Festival, and Gus is in charge of the books. Tickets, lemonade, coins, delivery vans: every stall gives him two facts and two unknowns.',
    'Turn each story into a system, solve it, and tell each stall owner the answer in a full sentence before the fireworks start.'],
  goal: 'Turn a word problem into a system, solve it, and answer in a sentence with units.',
  bigIdea: 'Define the variables, write one equation for each fact, solve, then answer in a sentence with units.',
  levels: [
    { name: 'Name the unknowns', learn: ['Start with *Let*: "Let a = the number of adult tickets." Say what each letter means.', 'One equation usually *counts things*. The other counts *money* (or points, or distance).'],
      tasks: [
        { k: 'choice', q: 'The festival sold *30 tickets* for *440 SAR*. Adult tickets cost 20 SAR. Kid tickets cost 10 SAR. Which is the best first line?',
          opts: ['Let a = 440', 'Let a = number of adult tickets', 'Let a = adults cost 20', 'Let a = tickets'], ans: 1,
          no: ['440 is a total you already know, not an unknown.', null, 'A letter stands for a number you do not know yet.', 'Which tickets? Be exact: adult or kid.'], why: 'A good "Let" says exactly what the letter counts. Then k = number of kid tickets.' },
        { k: 'choice', q: 'Same story. Which equation *counts the tickets*?', opts: ['20a + 10k = 30', 'a + k = 440', 'a + k = 30', '20a + 10k = 440'], ans: 2,
          no: ['20a is money, not tickets.', '440 is money, not tickets.', null, 'That one counts money.'], why: 'Adult tickets plus kid tickets make 30 tickets.' },
        { k: 'choice', q: 'Same story. Which equation *counts the money*?', opts: ['20a + 10k = 440', 'a + k = 440', '10a + 20k = 440', '20a + 10k = 30'], ans: 0,
          no: [null, 'a + k counts tickets, not riyals.', 'Adults cost 20, so it is 20a.', '30 is the number of tickets.'], why: 'Each adult ticket is 20 SAR (20a). Each kid ticket is 10 SAR (10k). Together: 440 SAR.' },
        { k: 'solve', q: 'Solve *a + k = 30* and *20a + 10k = 440*.', start: 'a + k = 30 and 20a + 10k = 440',
          moves: [
            { q: 'Get k alone in a + k = 30.', opts: ['Subtract a from both sides', 'Add a to both sides'], ans: 0, res: ['k = a − 30', 'k = 30 − a', 'k = 30 + a'], rans: 1,
              hint: 'Take a away from both sides: k = 30 − a.', no: { 1: 'Adding a gives 2a + k. Subtract a instead.', r0: 'The order matters: 30 − a.', r2: 'You subtracted a, so it is 30 − a.' } },
            { q: 'Swap it into the money equation.', opts: ['Replace k with (30 − a)', 'Replace a with (30 − a)'], ans: 0, res: ['20a + 10(30 − a) = 440', '20a + 10 · 30 − a = 440'], rans: 0,
              hint: 'Use brackets: 10 times all of (30 − a).', no: { 1: 'You found what k is, not a.', r1: 'Use brackets: the 10 multiplies the −a too.' } },
            { q: 'Distribute and collect.', opts: ['20a + 300 − 10a', '20a + 300 − a'], ans: 0, res: ['10a + 300 = 440', '30a + 300 = 440', '19a + 300 = 440'], rans: 0,
              hint: '10 × (−a) = −10a, and 20a − 10a = 10a.', no: { 1: '10 × (−a) = −10a.', r1: '20a − 10a, not 20a + 10a.', r2: '10 × (−a) is −10a.' } },
            { q: 'Solve and find k.', opts: ['Subtract 300, divide by 10', 'Add 300, divide by 10'], ans: 0, res: ['a = 14, so k = 16', 'a = 74, so k = −44', 'a = 140, so k = −110'], rans: 0,
              hint: '10a = 140, so a = 14.', no: { 1: 'Undo + 300 by subtracting 300.', r1: 'Subtract 300, do not add.', r2: '10a = 140: divide by 10.' },
              why: '14 adult tickets and 16 kid tickets. Check: 280 + 160 = 440 SAR ✓ and 14 + 16 = 30 ✓.' }
          ] }
      ] },
    { name: 'Coins and points', learn: ['A table helps: one row for each thing. Columns: *how many*, *value each*, *total value*.', 'Total value = how many × value each.'],
      tasks: [
        { k: 'solve', q: 'Marcus has *12 coins*. Some are 1 SAR coins (x) and some are 2 SAR coins (y). They are worth *19 SAR*. How many of each?', start: 'Let x = 1 SAR coins, y = 2 SAR coins',
          moves: [
            { q: 'Write the system.', opts: ['Count the coins, then count the money', 'Count the money twice'], ans: 0, res: ['x + y = 19 and x + 2y = 12', 'x + y = 12 and 2x + y = 19', 'x + y = 12 and x + 2y = 19'], rans: 2,
              hint: '12 is the number of coins. 19 is the money. Each 2 SAR coin is worth 2.', no: { 1: 'One fact is about coins, the other about money.', r0: 'You swapped the totals: 12 coins, 19 SAR.', r1: 'y is the 2 SAR coins, so it is 2y.' } },
            { q: 'Both have x. What first?', opts: ['Add the equations', 'Subtract the first from the second'], ans: 1, res: ['y = 7', '3y = 31', 'y = 31'], rans: 0,
              hint: 'Same terms: subtract. 2y − y = y and 19 − 12 = 7.', no: { 0: 'Adding gives 2x. Same terms: subtract.', r1: 'That is adding.', r2: '19 − 12, not 19 + 12.' } },
            { q: 'Find x.', opts: ['Put 7 in x + y = 12', 'Put 7 in y = 7'], ans: 0, res: ['x = 19', 'x = 5', 'x = 7'], rans: 1,
              hint: 'x + 7 = 12.', no: { 1: 'That has no x.', r0: 'Take away: 12 − 7.', r2: '7 is y. x = 12 − 7.' },
              why: 'Marcus has 5 one-riyal coins and 7 two-riyal coins. Check: 5 + 14 = 19 SAR ✓.' }
          ] },
        { k: 'solve', q: 'Hoop game: Priya scores *34 points* from *14 baskets*. Each basket is worth 2 or 3 points. Let x = 2-pointers, y = 3-pointers.', start: 'x + y = 14 and 2x + 3y = 34',
          moves: [
            { q: 'Make the x terms match.', opts: ['Multiply the first by 2', 'Multiply the first by 3'], ans: 0, res: ['2x + 2y = 14', '2x + 2y = 28', '2x + y = 28'], rans: 1,
              hint: 'Every term of x + y = 14 times 2.', no: { 1: 'That gives 3x and 2x.', r0: 'Multiply the 14 too.', r2: 'Multiply y too.' } },
            { q: 'Both have 2x. Next?', opts: ['Subtract it from 2x + 3y = 34', 'Add it to 2x + 3y = 34'], ans: 0, res: ['y = 6', '5y = 62', 'y = 20'], rans: 0,
              hint: '3y − 2y = y and 34 − 28 = 6.', no: { 1: 'Adding gives 4x. Subtract.', r1: 'That is adding.', r2: 'Use the new equation: 34 − 28.' } },
            { q: 'Find x.', opts: ['Put 6 in x + y = 14', 'Put 6 in y = 6'], ans: 0, res: ['x = 8', 'x = 20', 'x = 6'], rans: 0,
              hint: 'x + 6 = 14.', no: { 1: 'That has no x.', r1: 'Take away: 14 − 6.', r2: '6 is y.' },
              why: 'Priya scored 8 two-pointers and 6 three-pointers. Check: 16 + 18 = 34 points ✓.' }
          ] },
        { k: 'choice', q: 'For the hoop game, Omar wrote *x + y = 34* and *2x + 3y = 14*. What went wrong?', opts: ['He used the wrong letters', 'He swapped the totals: 14 baskets, 34 points', 'Nothing', 'He should use 3x + 2y'], ans: 1,
          no: ['Any letters are fine if you say what they mean.', null, 'x + y counts baskets. Did she score 34 baskets?', 'x is 2-pointers, so 2x is right.'], why: 'x + y counts baskets, so it equals 14. 2x + 3y counts points, so it equals 34.' },
        { k: 'fill', q: 'Check Priya\'s answer in a table: 8 two-pointers and 6 three-pointers.', head: ['Basket', 'How many', 'Points'],
          rows: [['2 pts each', 8, { a: 16 }], ['3 pts each', 6, { a: 18 }], ['Total', { a: 14 }, { a: 34 }]],
          hint: 'Points = how many × points each. Then add each column.', why: '14 baskets and 34 points: both facts are true ✓.' }
      ] },
    { name: 'Mix and travel', learn: ['Mixing: the *litres* add up, and cost = price × litres.', 'Trips: the *times* add up, and distance = speed × time.'],
      tasks: [
        { k: 'solve', q: 'Gus makes *20 L* of festival lemonade from mint lemonade (6 SAR per L) and plain lemonade (4 SAR per L). It costs *96 SAR*. Let m = litres of mint, p = litres of plain.', start: 'Let m = mint (L), p = plain (L)',
          moves: [
            { q: 'Write the system.', opts: ['Count litres, then count cost', 'Count cost twice'], ans: 0, res: ['m + p = 20 and 6m + 4p = 96', 'm + p = 96 and 6m + 4p = 20', 'm + p = 20 and 4m + 6p = 96'], rans: 0,
              hint: 'Litres: m + p = 20. Cost: 6 per litre of mint, 4 per litre of plain.', no: { 1: 'One fact is litres, the other is cost.', r1: 'You swapped the totals: 20 L, 96 SAR.', r2: 'Mint costs 6, so it is 6m.' } },
            { q: 'Make the p terms match.', opts: ['Multiply the first by 4', 'Add the equations now'], ans: 0, res: ['4m + 4p = 80', '4m + 4p = 20', '4m + p = 80'], rans: 0,
              hint: 'p × 4 = 4p, the same as in 6m + 4p = 96.', no: { 1: 'Adding cancels nothing: m + 6m = 7m. Make the p terms match first.', r1: 'Multiply the 20 too.', r2: 'Multiply p too.' } },
            { q: 'Cancel p.', opts: ['Subtract it from 6m + 4p = 96', 'Add it to 6m + 4p = 96'], ans: 0, res: ['2m = 16', '10m = 176', '2m = 176'], rans: 0,
              hint: '6m − 4m = 2m and 96 − 80 = 16.', no: { 1: 'Adding gives 8p. Subtract.', r1: 'That is adding.', r2: '96 − 80, not 96 + 80.' } },
            { q: 'Solve and find p.', opts: ['Divide by 2, then use m + p = 20', 'Subtract 2, then use m + p = 20'], ans: 0, res: ['m = 8, p = 28', 'm = 8, p = 12', 'm = 14, p = 6'], rans: 1,
              hint: 'm = 8. Then 8 + p = 20.', no: { 1: '2m is 2 times m: divide.', r0: '8 + p = 20, so p = 20 − 8.', r2: '2m = 16: divide by 2.' },
              why: '8 L of mint and 12 L of plain. Check: 48 + 48 = 96 SAR ✓.' }
          ] },
        { k: 'solve', q: 'Marcus drives the festival van for *5 hours* and *380 km*. On the highway he drives at 100 km/h. On the beach road he drives at 40 km/h. Let h = hours on the highway, b = hours on the beach road.', start: 'Let h = highway (h), b = beach road (h)',
          moves: [
            { q: 'Write the system.', opts: ['Count hours, then count distance', 'Count speed'], ans: 0, res: ['h + b = 5 and 100b + 40h = 380', 'h + b = 380 and 100h + 40b = 5', 'h + b = 5 and 100h + 40b = 380'], rans: 2,
              hint: 'Distance = speed × time: 100h on the highway, 40b on the beach road.', no: { 1: 'Speeds do not add up. Times add up, and distances add up.', r0: 'The highway speed goes with h: 100h.', r1: 'You swapped the totals: 5 hours, 380 km.' } },
            { q: 'Get b alone.', opts: ['Subtract h from both sides', 'Add h to both sides'], ans: 0, res: ['b = 5 + h', 'b = 5 − h'], rans: 1,
              hint: 'Subtract h from both sides of h + b = 5.', no: { 1: 'Adding h gives 2h + b. Take h away instead.', r0: 'You took h away, so it is 5 − h.' } },
            { q: 'Swap it in.', opts: ['Replace b in 100h + 40b = 380', 'Replace h'], ans: 0, res: ['100h + 40(5 − h) = 380', '100h + 40 · 5 − h = 380'], rans: 0,
              hint: 'Use brackets.', no: { 1: 'You know what b is.', r1: 'Use brackets: 40 multiplies −h too.' } },
            { q: 'Distribute and collect.', opts: ['100h + 200 − 40h', '100h + 200 − h'], ans: 0, res: ['60h + 200 = 380', '140h + 200 = 380', '60h + 5 = 380'], rans: 0,
              hint: '40 × 5 = 200 and 40 × (−h) = −40h.', no: { 1: '40 × (−h) = −40h.', r1: '100h − 40h, not plus.', r2: '40 × 5 = 200.' } },
            { q: 'Solve.', opts: ['Subtract 200, divide by 60', 'Add 200, divide by 60'], ans: 0, res: ['h = 3, so b = 2', 'h = 9⅔, so b = −4⅔'], rans: 0,
              hint: '60h = 180.', no: { 1: 'Undo + 200 by subtracting.', r1: 'Negative hours cannot be right. Subtract 200.' },
              why: '3 hours on the highway (300 km) and 2 hours on the beach road (80 km). 300 + 80 = 380 km ✓.' }
          ] },
        { k: 'number', q: 'A festival banner has a perimeter of *30 m*. Its length is *5 m more* than its width. How long is it?', ans: 10, unit: 'm',
          hint: '2L + 2W = 30 and L = W + 5. Swap L in: 2(W + 5) + 2W = 30.', why: '4W + 10 = 30, so W = 5 m and L = 10 m. Check: 10 + 10 + 5 + 5 = 30 ✓.' },
        { k: 'choice', q: 'A question asks "how many tickets?" Which answer *cannot* be right?', opts: ['13 tickets', '12.5 tickets', '0 tickets', '40 tickets'], ans: 1,
          no: ['13 is a whole number: possible.', null, '0 is possible: maybe none were sold.', '40 is possible.'], why: 'You cannot sell half a ticket. Always check the answer makes sense in the story.' }
      ] },
    { name: 'Plan it yourself', learn: ['Plan: *Let* x = …, Eq 1 counts …, Eq 2 counts …, method, units.', 'Check in the *story*, not only in the equations.'],
      tasks: [
        { k: 'match', q: 'Match each story to its system.',
          pairs: [['x pens at 2, y books at 4: 10 items, 28 SAR', 'x + y = 10 · 2x + 4y = 28'], ['Two numbers: sum 10, difference 4', 'x + y = 10 · x − y = 4'], ['Length x, width y: perimeter 28, x is 4 more', '2x + 2y = 28 · x = y + 4'], ['x cats, y birds: 10 heads, 28 legs', 'x + y = 10 · 4x + 2y = 28']],
          why: 'Find the two facts in each story. A cat has 4 legs and a bird has 2.' },
        { k: 'solve', q: 'Claw machine: small prizes cost 3 tokens and big prizes cost 8 tokens. One wins *9 prizes* for *42 tokens*. Let s = small, b = big.', start: 'Let s = small prizes, b = big prizes',
          moves: [
            { q: 'Write the system.', opts: ['Count prizes, then count tokens', 'Count tokens twice'], ans: 0, res: ['s + b = 42 and 3s + 8b = 9', 's + b = 9 and 3s + 8b = 42', 's + b = 9 and 8s + 3b = 42'], rans: 1,
              hint: '9 prizes. 42 tokens: 3 for each small, 8 for each big.', no: { 1: 'One fact counts prizes, the other counts tokens.', r0: 'You swapped the totals.', r2: 'Small prizes cost 3: 3s.' } },
            { q: 'Get s alone.', opts: ['Subtract b from both sides', 'Add b to both sides'], ans: 0, res: ['s = 9 − b', 's = 9 + b'], rans: 0, hint: 'Subtract b from both sides.', no: { 1: 'Adding b gives s + 2b. Take b away instead.', r1: 'You took b away, so it is 9 − b.' } },
            { q: 'Swap it in and distribute.', opts: ['Replace s with (9 − b) in 3s + 8b = 42', 'Replace b'], ans: 0, res: ['27 + 8b = 42', '27 − 3b + 8b = 42', '9 − 3b + 8b = 42'], rans: 1,
              hint: '3(9 − b) = 27 − 3b.', no: { 1: 'You know what s is.', r0: 'Multiply the −b too: 3 × (−b) = −3b.', r2: '3 × 9 = 27.' } },
            { q: 'Collect and solve.', opts: ['5b + 27 = 42, so subtract 27 and divide by 5', '11b + 27 = 42'], ans: 0, res: ['b = 3', 'b = 13.8', 'b = 15'], rans: 0,
              hint: '5b = 15.', no: { 1: '−3b + 8b = 5b.', r1: 'Subtract 27, do not add.', r2: '5b = 15: divide by 5.' } },
            { q: 'Find s.', opts: ['Put 3 in s = 9 − b', 'Put 3 in 5b = 15'], ans: 0, res: ['s = 6', 's = 12', 's = 3'], rans: 0,
              hint: 's = 9 − 3.', no: { 1: 'That has no s.', r1: '9 − 3, not 9 + 3.', r2: '3 is b.' }, why: 'One won 6 small prizes and 3 big prizes. Check: 18 + 24 = 42 tokens ✓.' }
          ] },
        { k: 'pair', q: 'Two numbers add to 10. Their difference is 4. Type them as (bigger, smaller).', ans: [7, 3], hint: 'x + y = 10 and x − y = 4. Add them.', why: '2x = 14, so x = 7 and y = 3. Check: 7 − 3 = 4 ✓.' },
        { k: 'number', q: 'Priya has *7 more* tickets than Gus. Together they have *41*. How many does *Priya* have?', ans: 24, unit: 'tickets',
          hint: 'p = g + 7 and p + g = 41. Swap p in: (g + 7) + g = 41.', why: '2g + 7 = 41, so g = 17 and p = 24. Check: 24 + 17 = 41 ✓.' }
      ] },
    { name: 'Fireworks finale', boss: true, learn: ['Mixed questions, fewer hints. Let, two equations, solve, sentence, check.'],
      tasks: [
        { k: 'solve', q: 'Ferris wheel: adults pay 15 SAR, children pay 9 SAR. *26 riders* paid *282 SAR*. Let a = adults, c = children.', start: 'Let a = adults, c = children',
          moves: [
            { q: 'Write the system.', opts: ['Count riders, then money', 'Count money twice'], ans: 0, res: ['a + c = 26 and 15a + 9c = 282', 'a + c = 282 and 15a + 9c = 26'], rans: 0, no: { r1: 'You swapped the totals.' } },
            { q: 'Make the c terms match.', opts: ['Multiply the first by 9', 'Multiply the first by 15'], ans: 0, res: ['9a + 9c = 234', '9a + 9c = 26'], rans: 0, no: { r1: 'Multiply the 26 too.' } },
            { q: 'Cancel c.', opts: ['Subtract it from 15a + 9c = 282', 'Add it'], ans: 0, res: ['6a = 48', '24a = 516', '6a = 516'], rans: 0 },
            { q: 'Solve and find c.', opts: ['Divide by 6, then use a + c = 26', 'Subtract 6'], ans: 0, res: ['a = 8, c = 18', 'a = 8, c = 34', 'a = 42, c = −16'], rans: 0,
              why: '8 adults and 18 children rode. Check: 120 + 162 = 282 SAR ✓.' }
          ] },
        { k: 'choice', q: 'Gus says the answer is 8 adults and 18 children. Which check proves it?', opts: ['8 + 18 = 26 only', '15 + 9 = 24', '8 + 18 = 26 and 120 + 162 = 282'], ans: 2,
          no: ['That checks one fact. Check both.', 'That checks nothing.', null], why: 'The answer must make both facts true: the riders and the money.' },
        { k: 'number', q: 'Marcus runs and swims in a beach race: *3 hours* in total and *22 km*. He runs at 10 km/h and swims at 2 km/h. How many hours does he *run*?', ans: 2, unit: 'hours',
          why: 'r + s = 3 and 10r + 2s = 22. Swap s = 3 − r: 10r + 6 − 2r = 22, so 8r = 16 and r = 2 hours.' },
        { k: 'number', q: 'Priya mixes juice at 9 SAR per L and juice at 4 SAR per L to make *10 L* costing *65 SAR*. How many litres of the *9 SAR* juice?', ans: 5, unit: 'L',
          why: 'x + y = 10 and 9x + 4y = 65. Swap y = 10 − x: 9x + 40 − 4x = 65, so 5x = 25 and x = 5 L.' },
        { k: 'pair', q: 'Gold tokens are worth 5 points and silver tokens 2 points. Zero has *13 tokens* worth *41 points*. Type (gold, silver).', ans: [5, 8],
          why: 'g + s = 13 and 5g + 2s = 41. Swap s = 13 − g: 5g + 26 − 2g = 41, so 3g = 15, g = 5 and s = 8.' }
      ] }
  ]
});
