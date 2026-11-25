/* Inequalities 4 of 5: the Unit 2 Summative's lesson 4 (Part 4: make the decision). Taught on the Pond Boat Hire
   (k kayaks, p pedal boats), money each day M = 15k + 40p. Allowed corners: (16, 0) $240 · (8, 6) $360 · (6, 7) $370 ·
   (2, 7) $310. On the dashed line, not allowed: (8, 0) and (2, 2.25). What if a kayak took in $40: (16, 0) $640 wins. */
SFA_LESSON({
  id: 'L32', n: 21.8, label: 'Inequalities 4', title: 'Make the Decision',
  game: { title: 'Unit 2 Summative', file: 'summative-u2.html#p4' },
  big: 'Write a rule for the money. The best plan is at a corner of the feasible region, so work out the money at every allowed corner and compare. A corner on a dashed line isn\'t allowed: use the nearest whole-number point inside. When the prices change, check the corners again: the best one can move.',
  slides: [
    { k: 'title', min: 1, kicker: 'Unit 2 Summative · Lesson 4 of 5', title: 'Make the Decision', sub: 'The region shows every plan that works. Today you find the one that takes in the most, and prove it to Marcus.', art: '🏆' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Write a rule for the money each day', 'Find the corners of the feasible region', 'Work out the money at each corner and pick the best', 'Ask "what if?" and see whether the best plan moves', 'Do Part 4 of the summative'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'Who do you think will be closest to the best plan?', opts: ['Marcus (ten of each)', 'Priya (claw machines only)', 'Gus (all 8 air hockey)', 'None of them'] },

    { k: 'build', min: 2, id: 'money', kick: 'The money rule', q: 'Pond Boat Hire: a kayak takes in *$15* a day and a pedal boat *$40*. Build the rule for the money M they take in each day.',
      learn: ['Money from kayaks + money from pedal boats. This one is an *equation*: it works out a value, it isn\'t a limit.'],
      tiles: ['M', '=', '15k', '40p', '+', '100k', '200p', '>'], ans: ['M=15k+40p'], hint: 'Start with M =, then add the money from the kayaks and the money from the pedal boats.',
      help: 'k kayaks take in 15 × k dollars.',
      why: 'M = 15k + 40p. The hire costs ($100, $200) belong to the budget limit, not to the daily money.',
      more: [
        { k: 'number', q: 'Use M = 15k + 40p. How much does the plan (8, 6) take in each day? $', ans: 360, hint: '15 × 8 + 40 × 6.', why: '$360.', steps: ['15(8) = 120.', '40(6) = 240.', '120 + 240 = *$360*.'] },
        { k: 'number', q: 'And (16, 0)? $', ans: 240, hint: '15 × 16 + 40 × 0.', why: '$240: lots of kayaks, but each takes in little.', steps: ['15(16) = 240.', '40(0) = 0.', '*$240*.'] }
      ] },

    { k: 'pick', min: 4, id: 'corners', kick: 'Find the corners', where: 'plane', range: [0, 20], vars: ['k', 'p'], region: 'start',
      cond: 'k ≥ 2, p ≥ 0, p ≤ 7, 3k + 4p ≤ 48, 100k + 200p ≤ 2000, 15k + 40p > 120',
      lines: [{ m: -0.75, b: 12, solid: true, lab: [12.2, 4.6, 'dock'] }, { m: -0.5, b: 10, solid: true, lab: [16.5, 2.7, 'budget'] }, { m: -0.375, b: 3, solid: false, lab: [6.3, 1.7, 'takings'] }, { vx: 2, solid: true, lab: [2.4, 17, 'k = 2'] }, { m: 0, b: 7, solid: true, lab: [16, 7.6, 'p = 7'] }],
      cand: [[16, 0], [8, 6], [6, 7], [2, 7], [8, 0], [12, 3], [4, 7], [2, 2.25]], right: [0, 1, 2, 3],
      notes: ['Dock line meets the k-axis: a corner, allowed.', 'Dock line meets the budget line: a corner, allowed.', 'Budget line meets p = 7: a corner, allowed.', 'p = 7 meets k = 2: a corner, allowed.', 'A corner, but on the *dashed* takings line: it takes in exactly $120. Not allowed.', 'On the dock line, but in the middle of an edge: not a corner.', 'On the edge p = 7, but between two corners: not a corner.', 'A corner, but on the dashed line (and not a whole number). Not allowed.'],
      q: 'The feasible region is shaded. Tap every *allowed* corner: where two boundaries meet and the plan is allowed.',
      learn: ['A corner is where two boundary lines meet on the edge of the region.', 'A corner on the *dashed* line isn\'t allowed. Use the nearest whole-number point inside instead.'],
      help: 'Walk round the edge of the shaded region. Every time the edge turns, that is a corner. Then ask: is it on the dashed line?',
      why: 'Four allowed corners: (16, 0), (8, 6), (6, 7) and (2, 7). The two on the dashed line, (8, 0) and (2, 2.25), are left out.',
      more: [
        { k: 'poll', q: 'The corner (8, 0) is on the dashed line. Which nearby plan should go in the corner table instead?', opts: ['(9, 0)', '(8, 0)', '(7, 0)'], ans: 0,
          why: '(9, 0) takes in $135, more than $120, and fits every other limit. (7, 0) takes in only $105.', steps: ['(8, 0) takes in exactly $120: not enough.', 'Move inside the region: one more kayak.', '(9, 0): $135 ✓.'] },
        { k: 'open', q: 'Why is it enough to check only the corners, not every point in the region?', ph: 'Because…',
          model: 'The money rule is linear: moving along an edge, the money keeps going up or keeps going down. So the biggest value is always at the end of an edge, which is a corner.',
          steps: ['Along a straight edge, M changes at a steady rate.', 'So it is biggest at one end of the edge.', 'The ends of edges are the corners.'] }
      ] },

    { k: 'match', min: 3, id: 'table', kick: 'The corner table', q: 'Work out M = 15k + 40p at each allowed corner. Match each corner to its money.',
      pairs: [['(16, 0)', '$240'], ['(8, 6)', '$360'], ['(6, 7)', '$370'], ['(2, 7)', '$310']],
      learn: ['Put each corner into M = 15k + 40p. Show the working, like 15(8) + 40(6).'],
      help: '(6, 7): 15 × 6 = 90 and 40 × 7 = 280.',
      why: '(6, 7) takes in the most: $370 a day. It beats (8, 6) by just $10.',
      more: [
        { k: 'number', q: 'How much more does the best corner take in than Keith\'s kayaks-only plan (16, 0)? $', ans: 130, hint: '$370 − $240.', why: '$130 a day more.', steps: ['Best: (6, 7), $370.', 'Keith: (16, 0), $240.', '370 − 240 = *$130*.'] },
        { k: 'open', q: 'Moving from (8, 6) to (6, 7) gives up 2 kayaks and gains 1 pedal boat. Use the money to explain why that move is worth it.', ph: 'Giving up 2 kayaks loses… gaining 1 boat gains…',
          model: 'Giving up 2 kayaks loses 2 × $15 = $30. Gaining a pedal boat gains $40. So the move is worth +$10 a day.',
          steps: ['−2 kayaks: −$30.', '+1 pedal boat: +$40.', 'Net: +$10, so (6, 7) is better.'] }
      ] },

    { k: 'sort', min: 3, id: 'claims', kick: 'Who is right?', q: 'Doug, Keith and Marcus each have a plan for the boat hire. Sort each claim.', bins: ['True', 'False'],
      learn: ['First: is the plan possible? Only then compare the money.'],
      cards: [{ t: 'Doug\'s 10 of each takes in $550 a day', b: 0, why: '150 + 400 = 550. True, but read the next card.' }, { t: 'Doug\'s 10 of each is possible', b: 1, why: 'Only 7 boats, 70 m² of dock (48 allowed), $3000 (only $2000).' }, { t: 'Keith\'s kayaks-only (16, 0) takes in the most', b: 1, why: 'It takes in $240, the least of the corners.' }, { t: 'Marcus\'s 7 boats and then fill up, (6, 7), is the best plan', b: 0 }, { t: '(6, 7) spends all $2000', b: 0, why: '600 + 1400 = 2000.' }, { t: '(6, 7) uses all 48 m² of dock', b: 1, why: '18 + 28 = 46 m²: 2 m² spare. The budget is what stops it.' }],
      help: 'Check Doug\'s plan against the stock limit first.',
      why: 'Doug\'s plan takes in the most on paper but is impossible. Of the possible plans, (6, 7) wins with $370.',
      more: [
        { k: 'open', q: 'Write Doug a reply he can\'t argue with. Use numbers.', ph: 'Doug, ten of each would…',
          model: 'Doug, ten of each would take in $550, but you can\'t have it: it needs 10 pedal boats (only 7 exist), 70 m² of dock (we have 48) and $3000 (we have $2000). On the graph it\'s outside the region. The best possible plan is 6 kayaks and 7 pedal boats: $370 a day.',
          steps: ['Say what is good about it (the money).', 'Show each limit it breaks, with numbers.', 'Give the best plan that works, with its money.'] }
      ] },

    { k: 'match', min: 3, id: 'whatif', kick: 'What if?', q: 'What if a kayak took in *$40* a day (pedal boats still $40)? Then M = 40k + 40p. Match each corner to its new money.',
      pairs: [['(16, 0)', '$640'], ['(8, 6)', '$560'], ['(6, 7)', '$520'], ['(2, 7)', '$360']],
      learn: ['Change only what the question changes, then check every corner again. The region stays the same.'],
      help: '(16, 0): 40 × 16 = 640.',
      why: 'Now (16, 0) wins with $640. When the prices change, the best corner can move.',
      more: [
        { k: 'poll', q: 'At $40 a kayak, does the best plan change?', opts: ['Yes: to (16, 0), all kayaks', 'No: (6, 7) still wins', 'Yes: to Doug\'s plan'], ans: 0,
          why: 'Moving from (6, 7) to (8, 6) is now +$80 − $40 = +$40, and kayaks keep winning all the way to (16, 0).', steps: ['New corner money: 640, 560, 520, 360.', 'Biggest: (16, 0).', 'Doug\'s plan is still impossible.'] },
        { k: 'number', kick: 'Deep', q: 'At what daily takings for one kayak (in $) would (6, 7) and (8, 6) take in exactly the same?', ans: 20, hint: 'Going from (6, 7) to (8, 6) gains 2 kayaks and loses 1 boat ($40). When do 2 kayaks make exactly $40?', why: '$20 a kayak: then 2 kayaks = 1 pedal boat.',
          steps: ['The trade: +2 kayaks, −1 boat.', 'It breaks even when 2 kayaks = $40.', 'One kayak = *$20*.'] }
      ] },

    { k: 'play', min: 17, title: 'Your turn: Summative Part 4', file: 'summative-u2.html#p4', btn: '📄 Open Part 4', minutes: 17,
      steps: ['Questions 14 to 18. ★ CORE first: 14, 15 and 16.', 'Corner on the dashed line? Use the nearest whole-number point inside.', 'Then ask your teacher for a *news flash card* (question 19).', 'Keep everything: next lesson you put it all together.'],
      aim: 'Done when you have a best plan, the corner table and the Part 4 self-check matches.' },
    { k: 'number', min: 1, id: 'chk', kick: 'Part 4 self-check', q: 'Add the digits of your best plan\'s daily takings. What do you get?', ans: 9,
      hint: 'Check every allowed corner in the money rule, and make sure your best plan is inside the region.', why: 'That matches the self-check.' },
    { k: 'conf', min: 1, id: 'conf', q: 'Finding the best plan from the corners: how do you feel?' },
    { k: 'end', title: 'Part 4: the decision.', next: 'Bring all four parts. Next lesson: *Inequalities 5*, put it together into one finished plan.' }
  ]
});
