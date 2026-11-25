/* Inequalities 4 of 7: the Unit 2 Summative's lesson 2 (Part 2: both machines at once). Taught on the Pond Boat Hire
   (k kayaks, p pedal boats): dock 3k + 4p ≤ 48 · budget 100k + 300p ≤ 2500 · k ≥ 2 · 0 ≤ p ≤ 7 · takings 15k + 40p > 120. */
SFA_LESSON({
  id: 'L30', n: 21.6, label: 'Inequalities 4', title: 'Both at Once',
  game: { title: 'Unit 2 Summative', file: 'summative-u2.html#p2' },
  big: 'With two things to choose, each limit becomes an inequality in two variables: each term is the amount for one, times how many. Every limit together is the system. A plan is possible only if it passes every inequality. Rewrite a boundary as y = mx + b, and the slope is the trade between the two.',
  slides: [
    { k: 'title', min: 1, kicker: 'Unit 2 Summative · Lesson 2 of 5', title: 'Both at Once', sub: 'Part 1 changed one machine at a time. Real plans change both. Today every limit gets two variables, and you test the friends\' plans properly.', art: '⚖️' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Write a limit with two variables, and say what each term means', 'Put every limit together into a system', 'Test a plan against every limit', 'Rewrite a boundary in slope-intercept form and explain its slope', 'Do Part 2 of the summative'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'Which do you think breaks first in the boathouse: floor space, budget or staff pay?', opts: ['Floor space', 'Budget', 'Staff pay', 'All at once'] },

    { k: 'build', min: 3, id: 'two', kick: 'Two variables', q: 'Pond Boat Hire: a kayak needs *3 m²* of dock, a pedal boat needs *4 m²*, and the dock has *48 m²*. Build the dock inequality (k kayaks, p pedal boats).',
      learn: ['Each term is (the amount for one) × (how many): 3k is the dock space for k kayaks.', 'Add the terms for both, then compare with the limit.'],
      tiles: ['3k', '4p', '4k', '3p', '+', '≤', '≥', '<', '48'], ans: ['3k+4p≤48'],
      help: 'Space for the kayaks is 3k. Space for the pedal boats is 4p. Together they can\'t go over 48.',
      why: '3k + 4p ≤ 48: kayak space plus boat space, no more than the 48 m² dock.',
      more: [
        { k: 'build', q: 'Budget: a kayak costs *$100* to hire, a pedal boat *$300*, and there is *$2500*. Build it.', tiles: ['100k', '300p', '15k', '40p', '+', '≤', '≥', '>', '2500'], ans: ['100k+300p≤2500'],
          why: '100k + 300p ≤ 2500. Careful: $15 and $40 are what they take in each day, not what they cost.', steps: ['Cost of kayaks: 100k. Cost of boats: 300p.', 'Together: no more than $2500.', '100k + 300p ≤ 2500.'] },
        { k: 'build', q: 'Takings: a kayak takes in *$15* a day, a pedal boat *$40*, and the hire must take in *more than $120*. Build it.', tiles: ['15k', '40p', '100k', '300p', '+', '>', '≥', '≤', '120'], ans: ['15k+40p>120'],
          why: '15k + 40p > 120. Strict: exactly $120 is not enough.', steps: ['Money from kayaks: 15k. From boats: 40p.', '"More than": >, not ≥.', '15k + 40p > 120.'] },
        { k: 'poll', q: 'Why is the takings inequality *>* and not *≥*?', opts: ['"More than $120" means $120 exactly is not enough', 'Because takings are money', 'Because it is the last limit'], ans: 0,
          why: 'At exactly $120 the rule is not met. > leaves 120 out; ≥ would let it in.', steps: ['More than: >.', 'At least: ≥.', 'The words decide the sign.'] }
      ] },

    { k: 'match', min: 2, id: 'terms', kick: 'What each term means', q: 'Match each term to what it means at the Pond Boat Hire.',
      pairs: [['3k', 'm² of dock the kayaks use'], ['4p', 'm² of dock the pedal boats use'], ['300p', 'dollars spent hiring pedal boats'], ['15k', 'dollars the kayaks take in each day']],
      help: 'Look at the number: 3 and 4 are square metres, 300 is a hire cost, 15 is daily takings.',
      why: 'The number tells you which limit it belongs to; the letter tells you which boat.',
      more: [
        { k: 'sort', q: 'Which limit is each inequality? (One is written a different way.)', bins: ['Dock space', 'Budget', 'Takings'],
          cards: [{ t: '3k + 4p ≤ 48', b: 0 }, { t: '100k + 300p ≤ 2500', b: 1 }, { t: '15k + 40p > 120', b: 2 }, { t: 'k + 3p ≤ 25', b: 1, why: 'Divide every term of 100k + 300p ≤ 2500 by 100: k + 3p ≤ 25. Same limit, smaller numbers.' }],
          why: 'k + 3p ≤ 25 is the budget divided by 100.', steps: ['Dock uses m²: 3 and 4.', 'Budget uses hire costs: 100 and 300 (or 1 and 3 after dividing by 100).', 'Takings use daily money: 15 and 40.'] },
        { k: 'open', q: 'Explain what *100k + 300p ≤ 2500* means, in a sentence a parent would understand.', ph: 'It means…',
          model: 'The money spent hiring kayaks ($100 each) plus the money spent hiring pedal boats ($300 each) can\'t be more than the $2500 they have.',
          steps: ['100k: money for kayaks.', '300p: money for pedal boats.', '≤ 2500: no more than the $2500 budget.'] }
      ] },

    { k: 'sort', min: 3, id: 'test', kick: 'Test a plan', q: 'Plan: *10 kayaks and 6 pedal boats*, (10, 6). Put the numbers in. Does it pass each limit?', bins: ['✓ Passes', '✗ Breaks'],
      learn: ['Put k = 10 and p = 6 into every inequality.', 'One ✗ and the plan is impossible.'],
      cards: [{ t: 'k ≥ 2', b: 0 }, { t: '0 ≤ p ≤ 7', b: 0 }, { t: '3k + 4p ≤ 48', b: 1, why: '3(10) + 4(6) = 30 + 24 = 54, and 54 ≤ 48 is false.' }, { t: '100k + 300p ≤ 2500', b: 1, why: '1000 + 1800 = 2800, more than $2500.' }, { t: '15k + 40p > 120', b: 0, why: '150 + 240 = 390 > 120 ✓.' }],
      help: 'Dock: 3 × 10 + 4 × 6. Is it 48 or less?',
      why: '(10, 6) passes three limits but breaks the dock (54 m²) and the budget ($2800), so it is impossible.',
      more: [
        { k: 'pick', where: 'plane', range: [0, 20], vars: ['k', 'p'], cond: 'k ≥ 2, p ≥ 0, p ≤ 7, 3k + 4p ≤ 48, 100k + 300p ≤ 2500, 15k + 40p > 120',
          cand: [[4, 7], [10, 6], [16, 0], [2, 2], [4, 5], [12, 4], [10, 10]], q: 'Which plans pass *every* limit? Tap them. (The working appears for any you get wrong.)',
          why: 'A (4, 7), C (16, 0) and E (4, 5) pass everything. (2, 2) only takes in $110, (12, 4) needs 52 m², and (10, 10) breaks the stock, dock and budget.',
          steps: ['A (4, 7): 40 m², $2500 exactly, $340 ✓.', 'B (10, 6): 54 m² ✗. D (2, 2): $110 ✗. F (12, 4): 52 m² ✗.', 'C (16, 0) and E (4, 5) pass all five.', 'G (10, 10): 10 > 7 boats ✗.'] },
        { k: 'sort', q: 'Doug says "Ten of each!" Sort the limits for (10, 10).', bins: ['✓ Passes', '✗ Breaks'],
          cards: [{ t: 'k ≥ 2', b: 0 }, { t: 'p ≤ 7', b: 1 }, { t: '3k + 4p ≤ 48', b: 1, why: '30 + 40 = 70 m².' }, { t: '100k + 300p ≤ 2500', b: 1, why: '$4000.' }, { t: '15k + 40p > 120', b: 0 }],
          why: 'It takes in lots ($550), but breaks three limits.', steps: ['p = 10 > 7 ✗.', 'Dock 70 > 48 ✗. Budget 4000 > 2500 ✗.', 'Lots of money, impossible plan.'] }
      ] },

    { k: 'solve', min: 3, id: 'si', kick: 'Slope-intercept form', q: 'Rewrite the dock boundary *3k + 4p = 48* as *p = mk + b*.', start: '3k + 4p = 48',
      learn: ['Get the p term alone, then divide *every* term by the number in front of p.'],
      moves: [
        { q: 'First move?', opts: ['Subtract 3k from both sides', 'Divide both sides by 4', 'Subtract 48 from both sides'], ans: 0, res: ['4p = −3k + 48', '4p = 3k + 48', '4p = −3k − 48'], rans: 0 },
        { q: 'Next move?', opts: ['Divide every term by 4', 'Divide only the 48 by 4'], ans: 0, res: ['p = −¾k + 12', 'p = −3k + 12', 'p = −¾k + 48'], rans: 0, why: 'Divide both terms on the right: −3k ÷ 4 and 48 ÷ 4.' }],
      help: 'Move the 3k to the other side first. Its sign changes.',
      why: 'p = −¾k + 12. Slope −¾, and it crosses the p-axis at 12.',
      more: [
        { k: 'solve', q: 'Now the budget boundary: *100k + 300p = 2500*. (The number at the end won\'t be whole.)', start: '100k + 300p = 2500', moves: [
          { q: 'First move?', opts: ['Subtract 100k from both sides', 'Divide by 100k'], ans: 0, res: ['300p = −100k + 2500', '300p = 100k + 2500'], rans: 0 },
          { q: 'Next?', opts: ['Divide every term by 300', 'Divide by 100'], ans: 0, res: ['p = −⅓k + 8⅓', 'p = −3k + 8⅓', 'p = −⅓k + 2500'], rans: 0, why: '2500 ÷ 300 = 8⅓: not a whole number, and that is fine.' }],
          why: 'p = −⅓k + 8⅓.', steps: ['Subtract 100k: 300p = −100k + 2500.', 'Divide by 300: p = −⅓k + 8⅓.', 'It crosses the p-axis at 8⅓, between 8 and 9.'] },
        { k: 'solve', q: 'The takings boundary: *15k + 40p = 120*.', start: '15k + 40p = 120', moves: [
          { q: 'First move?', opts: ['Subtract 15k from both sides', 'Divide by 15'], ans: 0, res: ['40p = −15k + 120', '40p = 15k + 120'], rans: 0 },
          { q: 'Next?', opts: ['Divide every term by 40', 'Divide by 15'], ans: 0, res: ['p = −⅜k + 3', 'p = −15k + 3'], rans: 0 }],
          why: 'p = −⅜k + 3.', steps: ['40p = −15k + 120.', 'Divide by 40: −15/40 = −⅜, 120/40 = 3.'] },
        { k: 'solve', kick: 'For the Unit 2 Check (Deep)', q: 'A negative in front of y: get y alone in *−3y > 6x − 9*.', start: '−3y > 6x − 9', moves: [
          { q: 'First move?', opts: ['Divide every term by −3', 'Divide every term by 3'], ans: 0, res: ['y < −2x + 3', 'y > −2x + 3'], rans: 0, why: 'Dividing by −3 turns > into <.' }],
          why: 'y < −2x + 3.', steps: ['Divide every term by −3.', 'Turn the sign: y < −2x + 3.'] }
      ] },

    { k: 'sort', min: 2, id: 'slope', kick: 'What the slope means', q: 'The dock boundary is *p = −¾k + 12*. Sort each statement: true or false?', bins: ['True', 'False'],
      learn: ['Slope −¾: p goes *down 3* when k goes *up 4*.'],
      cards: [{ t: 'Add 4 kayaks and there is room for 3 fewer pedal boats', b: 0 }, { t: 'Add 3 kayaks and there is room for 4 fewer pedal boats', b: 1, why: 'Backwards: −¾ is down 3 for every 4 across.' }, { t: '3 pedal boats use the same dock as 4 kayaks', b: 0, why: '3 × 4 = 12 m² and 4 × 3 = 12 m².' }, { t: 'The 12 means 12 pedal boats fit with no kayaks', b: 0 }, { t: 'The slope is negative because more kayaks leave less room for boats', b: 0 }, { t: 'The slope is −¾ because a kayak costs ¾ of a boat', b: 1, why: 'That slope comes from dock space. A kayak costs ⅓ of a boat: that is the budget slope.' }],
      help: 'Check with real numbers: 4 kayaks take 12 m². How many pedal boats is that?',
      why: 'The slope is the trade: 4 kayaks use the same dock as 3 pedal boats.',
      more: [
        { k: 'open', q: 'Finish the sentence for the budget slope, −⅓: "For every pedal boat they add, they can afford ___ fewer kayaks, because …"', ph: 'For every pedal boat they add…',
          model: 'For every pedal boat they add, they can afford 3 fewer kayaks, because one pedal boat ($300) costs the same as three kayaks ($100 each).',
          steps: ['p = −⅓k + 8⅓: up 1 boat, back 3 kayaks.', 'A boat costs $300, a kayak $100.', 'One boat = three kayaks in money.'] },
        { k: 'poll', q: 'Which boundary is *steeper*: dock (−¾) or budget (−⅓)?', opts: ['Dock: −¾ is steeper than −⅓', 'Budget', 'They are the same'], ans: 0,
          why: '¾ is bigger than ⅓, so the dock line drops faster. That is why the two lines cross.', steps: ['Compare sizes: ¾ = 0.75, ⅓ ≈ 0.33.', 'Bigger size: steeper.', 'Different slopes, so the lines cross somewhere.'] }
      ] },

    { k: 'play', min: 18, title: 'Your turn: Summative Part 2', file: 'summative-u2.html#p2', btn: '📄 Open Part 2', minutes: 18,
      steps: ['Questions 5 to 9. ★ CORE first: 5, 6 and 7.', 'Write what each term means, like 3k = dock space for kayaks.', 'In question 7, put the numbers in. Show the working for at least one ✗.', 'Keep your page for Part 5.'],
      aim: 'Done when 5 to 9 are answered and the Part 2 self-check matches.' },
    { k: 'number', min: 1, id: 'chk', kick: 'Part 2 self-check', q: 'In question 7, how many of the three friends\' plans are *impossible*?', ans: 1,
      hint: 'Put each plan into every inequality, including the prize deal and the stock limit.', why: 'That matches the self-check.',
      more: [
        { k: 'poll', q: 'In question 8, what kind of numbers are your two slopes?', opts: ['Both negative fractions', 'Both positive whole numbers', 'One positive, one negative'], ans: 0, why: 'That matches the self-check.',
          steps: ['More of one machine leaves room or money for fewer of the other.', 'So both slopes are negative.', 'And they are fractions.'] }
      ] },
    { k: 'conf', min: 1, id: 'conf', q: 'Writing a system and testing plans: how do you feel?' },
    { k: 'end', title: 'Part 2: both machines at once.', next: 'Keep your Part 2 with Part 1. Next lesson: *Inequalities 5* and Part 3, graphing the system.' }
  ]
});
