/* Inequalities 6 of 7: the Unit 2 Summative's lesson 4 (Part 4: make the decision). Taught on the Pond Boat Hire
   (k kayaks, p pedal boats): dock 3k + 4p ≤ 48 · budget 100k + 300p ≤ 2500 · k ≥ 2 · 0 ≤ p ≤ 7 · takings 15k + 40p > 120.
   Money each day M = 15k + 40p. Corners: (16, 0) $240 · (8.8, 5.4) $348, the best corner but not whole · (4, 7) $340 ·
   (2, 7) $310; on the dashed line, not allowed: (8, 0) and (2, 2.25). The whole-number hunt round (8.8, 5.4): (7, 6) $345
   is the best plan, on the budget line and not at a corner; rounding the corner down to (8, 5) gives only $320.
   What if a kayak took in $40: (16, 0) $640 wins. Like the summative, the best plan is not at a corner. */
SFA_LESSON({
  id: 'L32', n: 21.8, label: 'Inequalities 6', title: 'Make the Decision',
  game: { title: 'Unit 2 Summative', file: 'summative-u2.html#p4' },
  big: 'Write a rule for the money and work it out at every corner of the feasible region. If the best corner isn\'t whole numbers, you can\'t use it: hunt the whole-number plans around it, check each one against every limit, and pick the one that takes in the most. Rounding the corner down is rarely the best. When the prices change, check again.',
  slides: [
    { k: 'title', min: 1, kicker: 'Unit 2 Summative · Lesson 4 of 5', title: 'Make the Decision', sub: 'The region shows every plan that works. Today you find the one that takes in the most, even when the best corner is a plan nobody can use, and prove it to Marcus.', art: '🏆' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Write a rule for the money each day', 'Find the corners of the feasible region and the money at each', 'Hunt for the best whole-number plan when the best corner isn\'t whole', 'Ask "what if?" and see whether the best plan moves', 'Do Part 4 of the summative'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'Who do you think will be closest to the best plan?', opts: ['Marcus (ten of each)', 'Priya (claw machines only)', 'Gus (all 8 air hockey)', 'None of them'] },

    { k: 'build', min: 2, id: 'money', kick: 'The money rule', q: 'Pond Boat Hire: a kayak takes in *$15* a day and a pedal boat *$40*. Build the rule for the money M they take in each day.',
      learn: ['Money from kayaks + money from pedal boats. This one is an *equation*: it works out a value, it isn\'t a limit.'],
      tiles: ['M', '=', '15k', '40p', '+', '100k', '300p', '>'], ans: ['M=15k+40p'], hint: 'Start with M =, then add the money from the kayaks and the money from the pedal boats.',
      help: 'k kayaks take in 15 × k dollars.',
      why: 'M = 15k + 40p. The hire costs ($100, $300) belong to the budget limit, not to the daily money.',
      more: [
        { k: 'number', q: 'Use M = 15k + 40p. How much does the plan (9, 5) take in each day? $', ans: 335, hint: '15 × 9 + 40 × 5.', why: '$335.', steps: ['15(9) = 135.', '40(5) = 200.', '135 + 200 = *$335*.'] },
        { k: 'number', q: 'And (16, 0)? $', ans: 240, hint: '15 × 16 + 40 × 0.', why: '$240: lots of kayaks, but each takes in little.', steps: ['15(16) = 240.', '40(0) = 0.', '*$240*.'] }
      ] },

    { k: 'pick', min: 3, id: 'corners', kick: 'Find the corners', where: 'plane', range: [0, 20], vars: ['k', 'p'], region: 'start',
      cond: 'k ≥ 2, p ≥ 0, p ≤ 7, 3k + 4p ≤ 48, 100k + 300p ≤ 2500, 15k + 40p > 120',
      lines: [{ m: -0.75, b: 12, solid: true, lab: [12.2, 4.6, 'dock'] }, { m: -1 / 3, b: 25 / 3, solid: true, lab: [16.2, 3.6, 'budget'] }, { m: -0.375, b: 3, solid: false, lab: [6.3, 1.7, 'takings'] }, { vx: 2, solid: true, lab: [2.4, 17, 'k = 2'] }, { m: 0, b: 7, solid: true, lab: [16, 7.6, 'p = 7'] }],
      cand: [[16, 0], [8.8, 5.4], [4, 7], [2, 7], [8, 0], [12, 3], [3, 7], [2, 2.25]], right: [0, 1, 2, 3],
      notes: ['Dock line meets the k-axis: a corner.', 'Dock line meets the budget line: a corner, but *not whole numbers*. It goes in the corner table, but nobody can hire 8.8 kayaks.', 'Budget line meets p = 7: a corner.', 'p = 7 meets k = 2: a corner.', 'A corner, but on the *dashed* takings line: it takes in exactly $120. Not allowed.', 'On the dock line, but in the middle of an edge: not a corner.', 'On the edge p = 7, between two corners: not a corner.', 'A corner, but on the dashed line (and not whole). Not allowed.'],
      q: 'The feasible region is shaded. Tap every *corner* (where the edge turns). Leave out the corners on the dashed line.',
      learn: ['A corner is where two boundary lines meet on the edge of the region. It doesn\'t have to be whole numbers.', 'A corner on the *dashed* line isn\'t allowed.'],
      help: 'Walk round the edge of the shaded region. Every time the edge turns, that is a corner. Then ask: is it on the dashed line?',
      why: 'Four corners count: (16, 0), (8.8, 5.4), (4, 7) and (2, 7). One of them, (8.8, 5.4), isn\'t whole numbers. The two on the dashed line are left out.',
      more: [
        { k: 'poll', q: 'The corner (8, 0) is on the dashed line. Which nearby plan is allowed?', opts: ['(9, 0)', '(8, 0)', '(7, 0)'], ans: 0,
          why: '(9, 0) takes in $135, more than $120, and fits every other limit. (7, 0) takes in only $105.', steps: ['(8, 0) takes in exactly $120: not enough.', 'Move inside the region: one more kayak.', '(9, 0): $135 ✓.'] },
        { k: 'open', q: 'Why do the corners matter so much when you look for the most money?', ph: 'Because…',
          model: 'The money rule is linear: moving along an edge, the money keeps going up or keeps going down. So the most money (if parts of boats were allowed) is always at a corner. That tells you where to start looking for the best whole-number plan.',
          steps: ['Along a straight edge, M changes at a steady rate.', 'So it is biggest at one end: a corner.', 'With whole boats only, look near the best corner.'] }
      ] },

    { k: 'match', min: 2, id: 'table', kick: 'The corner table', q: 'Work out M = 15k + 40p at each corner. Match each corner to its money.',
      pairs: [['(16, 0)', '$240'], ['(8.8, 5.4)', '$348'], ['(4, 7)', '$340'], ['(2, 7)', '$310']],
      learn: ['Put each corner into M = 15k + 40p, decimals too. Use a calculator.'],
      help: '(8.8, 5.4): 15 × 8.8 = 132 and 40 × 5.4 = 216.',
      why: 'The biggest is (8.8, 5.4): $348. But you can\'t hire 8.8 kayaks, so it is not the answer. It tells you where to hunt.',
      more: [
        { k: 'poll', q: 'Which corner is the best *usable* corner?', opts: ['(4, 7): $340', '(8.8, 5.4): $348', '(16, 0): $240'], ans: 0,
          why: '(8.8, 5.4) isn\'t whole, so of the corners you can use, (4, 7) takes in the most. But a whole-number plan that isn\'t a corner might still beat it.', steps: ['(8.8, 5.4) can\'t be used.', 'Of the rest: $340 is the biggest.', 'Next slide: can a non-corner plan beat $340?'] },
        { k: 'number', q: 'How much more is the best corner (8.8, 5.4) than Keith\'s kayaks-only plan (16, 0)? $', ans: 108, hint: '$348 − $240.', why: '$108 a day.', steps: ['348 − 240 = *108*.'] }
      ] },

    { k: 'sort', min: 3, id: 'hunt', kick: 'The whole-number hunt', q: 'The best corner is (8.8, 5.4). Here are the whole-number plans around it. Check each one: allowed, or does it break a limit?', bins: ['✓ Allowed', '✗ Breaks a limit'],
      learn: ['Round *down* and *up*, and try one step along each edge. A plan that rounds up often breaks a limit.', 'Check the dock (≤ 48 m²) and the budget (≤ $2500) for every plan.'],
      cards: [{ t: '(8, 5)', b: 0, why: '44 m² and $2300 ✓.' }, { t: '(9, 5)', b: 0, why: '47 m² and $2400 ✓.' }, { t: '(8, 6)', b: 1, why: '48 m² ✓, but $2600 is over the $2500 budget.' }, { t: '(9, 6)', b: 1, why: '51 m² and $2700: breaks both.' }, { t: '(7, 6)', b: 0, why: '45 m² and $2500 exactly ✓.' }, { t: '(10, 4)', b: 0, why: '46 m² and $2200 ✓.' }],
      help: 'For (8, 6): dock 3(8) + 4(6) = 48. Budget 100(8) + 300(6) = ?',
      why: 'Four are allowed: (8, 5), (9, 5), (7, 6) and (10, 4). (8, 6) breaks the budget and (9, 6) breaks both.',
      more: [
        { k: 'poll', q: 'Why does rounding *up* to (9, 6) fail?', opts: ['It needs 51 m² of dock and $2700: more than both limits', 'Rounding up is never allowed in maths', 'It takes in too little'], ans: 0,
          why: 'The corner sits right on both lines, so going up and right pushes past both of them.', steps: ['Dock: 27 + 24 = 51 > 48.', 'Budget: 900 + 1800 = 2700 > 2500.', 'Outside the region.'] }
      ] },

    { k: 'pick', min: 3, id: 'best', kick: 'The best whole-number plan', where: 'plane', range: [0, 12], vars: ['k', 'p'], region: 'start',
      cond: 'k ≥ 2, p ≥ 0, p ≤ 7, 3k + 4p ≤ 48, 100k + 300p ≤ 2500, 15k + 40p > 120',
      lines: [{ m: -0.75, b: 12, solid: true, lab: [10.3, 2.6, 'dock'] }, { m: -1 / 3, b: 25 / 3, solid: true, lab: [0.3, 8.9, 'budget'] }],
      cand: [[8, 5], [9, 5], [8, 6], [9, 6], [7, 6], [10, 4], [4, 7]], right: [4],
      notes: ['15(8) + 40(5) = $320: the corner rounded down. Allowed, but not the most.', '$335. Allowed, but not the most.', '$360, but it breaks the budget ($2600).', 'Breaks the dock and the budget.', '15(7) + 40(6) = 105 + 240 = *$345*: the most of the allowed plans.', '$310.', '$340: the best usable corner, but $5 less.'],
      q: 'A zoomed-in grid round the best corner. Work out M = 15k + 40p for the allowed plans, then tap the *one* plan that takes in the most.',
      learn: ['Only allowed plans count. Then compare the money.'],
      help: 'Allowed: (8, 5), (9, 5), (7, 6), (10, 4) and (4, 7). Work out 15k + 40p for each.',
      why: '(7, 6) takes in $345: the best plan. It isn\'t at a corner: it sits on the budget line, using exactly $2500. Rounding the corner down to (8, 5) would have given only $320.',
      more: [
        { k: 'number', kick: 'Deep', q: 'Moving along the budget line from (4, 7) to (7, 6) adds 3 kayaks and takes away 1 pedal boat. How many dollars a day does that gain?', ans: 5, hint: '3 kayaks × $15, minus 1 boat × $40.', why: '+$5: that is why (7, 6) beats the corner (4, 7).',
          steps: ['+3 kayaks: +$45.', '−1 pedal boat: −$40.', 'Net: *+$5* a day.'] },
        { k: 'poll', q: 'Is the best plan (7, 6) at a corner of the region?', opts: ['No: it is on the budget edge, near the best corner', 'Yes: every best plan is a corner'], ans: 0,
          why: 'With whole numbers only, the best plan can sit on an edge. That is why you hunt instead of just reading the corner table.', steps: ['(7, 6) is on the budget line: 700 + 1800 = 2500.', 'It is not where two lines meet.', 'So it is on an edge, not a corner.'] }
      ] },

    { k: 'sort', min: 2, id: 'claims', kick: 'Who is right?', q: 'Doug, Keith and Marcus each have a plan for the boat hire. Sort each claim.', bins: ['True', 'False'],
      learn: ['First: is the plan possible? Only then compare the money.'],
      cards: [{ t: 'Doug\'s 10 of each takes in $550 a day', b: 0, why: '150 + 400 = 550. True, but read the next card.' }, { t: 'Doug\'s 10 of each is possible', b: 1, why: 'Only 7 boats, 70 m² of dock (48 allowed), $4000 (only $2500).' }, { t: 'Keith\'s kayaks-only plan (16, 0) takes in the most', b: 1, why: '$240: the least of the corners.' }, { t: 'Marcus\'s "all 7 boats, then fill the dock", (6, 7), is possible', b: 1, why: '600 + 2100 = $2700: over the budget.' }, { t: 'The best plan is the corner (8.8, 5.4)', b: 1, why: 'You can\'t hire 8.8 kayaks. The best whole-number plan is (7, 6).' }, { t: '(7, 6) spends exactly $2500', b: 0, why: '700 + 1800 = 2500.' }],
      help: 'Check Doug\'s plan against the stock limit first.',
      why: 'Doug\'s plan takes in the most on paper but is impossible, and so is Marcus\'s. The best plan that works is (7, 6): $345.',
      more: [
        { k: 'open', q: 'Write Doug a reply he can\'t argue with. Use numbers.', ph: 'Doug, ten of each would…',
          model: 'Doug, ten of each would take in $550, but you can\'t have it: it needs 10 pedal boats (only 7 exist), 70 m² of dock (we have 48) and $4000 (we have $2500). On the graph it\'s outside the region. The best plan that works is 7 kayaks and 6 pedal boats: $345 a day.',
          steps: ['Say what is good about it (the money).', 'Show each limit it breaks, with numbers.', 'Give the best plan that works, with its money.'] }
      ] },

    { k: 'match', min: 2, id: 'whatif', kick: 'What if?', q: 'What if a kayak took in *$40* a day (pedal boats still $40)? Then M = 40k + 40p. Match each corner to its new money.',
      pairs: [['(16, 0)', '$640'], ['(8.8, 5.4)', '$568'], ['(4, 7)', '$440'], ['(2, 7)', '$360']],
      learn: ['Change only what the question changes, then check the corners again. The region stays the same.'],
      help: '(16, 0): 40 × 16 = 640.',
      why: 'Now (16, 0) wins with $640, and it is whole numbers, so no hunt is needed. When the prices change, the best plan can move.',
      more: [
        { k: 'poll', q: 'At $40 a kayak, does the best plan change?', opts: ['Yes: to (16, 0), all kayaks', 'No: (7, 6) still wins', 'Yes: to Doug\'s plan'], ans: 0,
          why: '(16, 0) takes in $640, far more than (7, 6) at $520. Doug\'s plan is still impossible.', steps: ['New corner money: 640, 568, 440, 360.', 'Biggest: (16, 0), and it is whole.', 'So the best plan moves to all kayaks.'] }
      ] },

    { k: 'play', min: 17, title: 'Your turn: Summative Part 4', file: 'summative-u2.html#p4', btn: '📄 Open Part 4', minutes: 17,
      steps: ['Questions 14 to 18. ★ CORE first: 14, 15 and 16.', 'Question 16: the best corner isn\'t whole numbers. Do the whole-number hunt: check the plans around it against every limit.', 'Then ask your teacher for a *news flash card* (question 19).', 'Keep everything: next lesson you put it all together.'],
      aim: 'Done when you have a best plan, the corner table and the Part 4 self-check matches.' },
    { k: 'number', min: 1, id: 'chk', kick: 'Part 4 self-check', q: 'Add the digits of your best plan\'s daily takings. What do you get?', ans: 8,
      hint: 'Check the whole-number plans around the best corner, not just the corner rounded down.', why: 'That matches the self-check.',
      more: [
        { k: 'poll', q: 'Is your best plan at a corner of the region?', opts: ['No: it is near the best corner, on an edge', 'Yes'], ans: 0, why: 'That matches the self-check: the best plan is not at a corner.',
          steps: ['The best corner isn\'t whole numbers.', 'The best whole-number plan sits near it.', 'Check it beats every possible friend\'s plan.'] }
      ] },
    { k: 'conf', min: 1, id: 'conf', q: 'Finding the best plan, corners and the whole-number hunt: how do you feel?' },
    { k: 'end', title: 'Part 4: the decision.', next: 'Bring all four parts. Next lesson: *Inequalities 7*, put it together into one finished plan.' }
  ]
});
