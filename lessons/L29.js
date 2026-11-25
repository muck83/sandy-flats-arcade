/* Inequalities 1 of 5: the Unit 2 Summative's lesson 1 (launch + Part 1). Every summative lesson runs the same way:
   a few hands-on slides on the skills the part needs, taught on the Pond Boat Hire (k kayaks, p pedal boats: the same
   kinds of limits as the boathouse, different numbers, so nothing gives the summative away), then work time on the part,
   then the part's own self-check, and the part is kept for Part 5.
   Pond Boat Hire: dock 3k + 4p ≤ 48 · budget 100k + 200p ≤ 2000 · lifeguard k ≥ 2 · stock 0 ≤ p ≤ 7 · takings 15k + 40p > 120. */
SFA_LESSON({
  id: 'L29', n: 21.5, label: 'Inequalities 1', title: 'One Thing at a Time',
  game: { title: 'Unit 2 Summative', file: 'summative-u2.html#p1' },
  big: 'A limit in words becomes an inequality: at least is ≥, no more than is ≤, more than is >. Solve it like an equation, graph it with an open or a closed dot, and when there are several limits, keep only the numbers that pass all of them.',
  slides: [
    { k: 'title', min: 1, kicker: 'Unit 2 Summative · Lesson 1 of 5', title: 'One Thing at a Time', sub: 'The Sandy Flats Arcade is opening a pop-up in the old boathouse, and Priya, Marcus and Gus already disagree about what goes inside. Today: try their plans, then start Part 1.', art: '🏖️' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Try plans in the Boathouse Planner', 'Turn limits in words into inequalities', 'Graph them, including the ones with two ends', 'Start Part 1 of the summative: one machine at a time'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'Marcus wants ten of each machine. Before you do any maths: is he right?', opts: ['Yes, fair to both', 'No, too many', 'No idea yet', 'Ask Gus'] },

    { k: 'play', min: 8, title: 'Launch: the Boathouse Planner', file: 'summative-u2-planner.html', btn: '🏖️ Open the Boathouse Planner', minutes: 8,
      steps: ['Work in pairs. Read the five limits at the top.', 'Try Marcus\'s, Priya\'s and Gus\'s plans. Which limits break?', 'Now beat all three: find the plan that takes in the most money and breaks no limit.', 'Write your best plan down. Don\'t decide anything yet: that is what Parts 1 to 4 are for.'],
      aim: 'Done when you have a best plan written down, and can say which limit stops you going higher.' },

    { k: 'sort', min: 2, id: 'words', kick: 'Signal words', q: 'Each limit hides a symbol. Sort the signal words.', bins: ['<', '>', '≤', '≥'],
      learn: ['Ask: is the number itself allowed? If yes, the symbol has a line under it (≤ or ≥).'],
      cards: [{ t: 'at least', b: 3 }, { t: 'no more than', b: 2, why: '"No more than 8" allows 8 but not 9: ≤.' }, { t: 'more than', b: 1 }, { t: 'up to', b: 2 }, { t: 'only 7 for hire', b: 2, why: 'Only 7: you can have 7, not 8. That is ≤ 7.' }, { t: 'fewer than', b: 0 }, { t: 'a minimum of', b: 3 }, { t: 'under', b: 0 }],
      help: 'Try a number: does "at least 4" allow exactly 4?',
      why: 'At least, a minimum of: ≥. No more than, up to, only: ≤. More than: >. Fewer than, under: <.',
      more: [
        { k: 'build', q: 'Pond Boat Hire: the lifeguard needs *at least 2 kayaks*. Let k be the number of kayaks. Build it.', tiles: ['k', '<', '>', '≤', '≥', '2'], ans: ['k≥2'], why: 'At least 2 includes 2: k ≥ 2.',
          steps: ['"At least 2": 2 is allowed, and more is fine.', 'So ≥, not >.', 'k ≥ 2.'] },
        { k: 'match', q: 'Match each symbol to how you say it out loud.', pairs: [['<', 'is less than'], ['>', 'is greater than'], ['≤', 'is less than or equal to'], ['≥', 'is greater than or equal to']],
          why: 'The line under the symbol adds "or equal to".', steps: ['The open end faces the bigger number.', 'A line underneath: "or equal to".'] },
        { k: 'poll', q: 'The boat hire must take in *more than $120* a day. Is exactly $120 enough?', opts: ['Yes: $120 is fine', 'No: "more than" means $120 is not enough', 'Only on weekends'], ans: 1,
          why: 'More than $120 is > 120. $120 > $120 is false. That is why this line will be dashed later.', steps: ['"More than": > 120.', 'Test 120: 120 > 120 is false.', 'So exactly $120 is not enough.'] }
      ] },

    { k: 'nl', min: 2, id: 'g1', between: true, range: [0, 12], v: 'k', ans: { at: 2, open: false, dir: 'r' }, kick: 'Graph a limit', q: 'Lifeguard rule: *at least 2 kayaks*, k ≥ 2. Graph it.',
      learn: ['*Closed dot* ● when the number is allowed (≤, ≥). *Open dot* ○ when it is not (<, >).', 'One limit: shade left or right. Two limits, one at each end: *between two dots*.'],
      help: 'Is 2 kayaks allowed? Then is 10 allowed, or 1?',
      why: 'Closed dot at 2 (2 kayaks is fine), shaded right. Only whole numbers make sense: 2, 3, 4…',
      more: [
        { k: 'nl', between: true, range: [0, 20], v: 'k', ans: { at: 8, open: true, dir: 'r' }, q: 'Kayaks only: the takings rule works out as *k > 8*. Graph it.', why: 'Open dot at 8 (8 kayaks take in exactly $120: not enough), shaded right.',
          steps: ['> means 8 itself is not allowed: open dot.', 'Bigger numbers: shade right.', 'In the story: 9 or more kayaks.'] },
        { k: 'build', q: 'Read the graph and build its inequality.', fig: { nl: { at: 5, open: true, dir: 'l' }, range: [0, 12] }, tiles: ['p', '<', '>', '≤', '≥', '5'], ans: ['p<5'], why: 'Open dot at 5, shaded left: p < 5.',
          steps: ['Open: 5 is not included.', 'Left: smaller numbers.', 'p < 5.'] },
        { k: 'nl', range: [-6, 6], ans: { at: -1, open: true, dir: 'l' }, q: 'With negatives: graph *x < −1*.', why: 'Open dot at −1, shaded left toward −2, −3…',
          steps: ['<: open dot at −1.', 'Less than: left.', '−2, −3, −1.5 are all solutions.'] }
      ] },

    { k: 'nl', min: 2, id: 'g2', between: true, range: [0, 12], v: 'p', ans: { at: 0, open: false, to: 7, toOpen: false, dir: 'b' }, kick: 'Two ends', q: 'Only *7 pedal boats* are for hire in town, and you can\'t hire fewer than 0. Graph *0 ≤ p ≤ 7*.',
      learn: ['Two limits, one at each end: use *Between two dots*.', 'Check each end on its own: is 0 allowed? Is 7?'],
      help: 'Choose Between two dots. Put one dot on 0 and one on 7. Can you hire 0 boats? 7 boats?',
      why: 'Closed dots at 0 and 7, shaded between. 0, 1, 2… 7 boats are all possible.',
      more: [
        { k: 'nl', between: true, range: [0, 12], ans: { at: 3, open: true, to: 9, toOpen: false, dir: 'b' }, q: 'Graph *3 < x ≤ 9*. Each end has its own dot.', why: 'Open dot at 3 (not included), closed dot at 9 (included), shaded between.',
          steps: ['3 < x: 3 is not included, open dot.', 'x ≤ 9: 9 is included, closed dot.', 'Shade between them.'] },
        { k: 'pick', where: 'line', range: [0, 12], cond: 'x > 3, x ≤ 9', q: 'Tap every whole number with *3 < x ≤ 9*.', why: '4, 5, 6, 7, 8 and 9: six whole numbers. Not 3.',
          steps: ['3 is not included (open).', '9 is included (closed).', '4, 5, 6, 7, 8, 9.'] },
        { k: 'poll', q: 'Why does the stock limit need *two* ends, but the lifeguard rule only one?', opts: ['Boats have a top limit (7) and you can\'t go below 0; kayaks only have a bottom limit (2)', 'Pedal boats are bigger', 'It is a mistake: both have one end'], ans: 0,
          why: 'p ≤ 7 caps it from above, and p ≥ 0 because you can\'t hire a negative number. The kayak rule k ≥ 2 has no top in that limit.', steps: ['p ≤ 7 and p ≥ 0: two ends.', 'k ≥ 2 on its own: one end, keeps going right.', 'Always ask: can it be negative here?'] }
      ] },

    { k: 'solve', min: 2, id: 's1', kick: 'One machine only', q: 'Kayaks only (p = 0). Each kayak needs 3 m² and the dock has 48 m², so *3k ≤ 48*. Solve and graph it.', start: '3k ≤ 48', v: 'k',
      learn: ['Dock space used = 3 × the number of kayaks = 3k.'],
      moves: [{ q: 'What undoes × 3?', opts: ['Divide both sides by 3', 'Subtract 3 from both sides', 'Multiply both sides by 3'], ans: 0, res: ['k ≤ 16', 'k ≤ 45', 'k ≥ 16'], rans: 0 }],
      graph: { range: [0, 20], at: 16, open: false, dir: 'l' },
      help: 'Divide both sides by 3. Dividing by a positive number keeps the sign.',
      why: 'k ≤ 16: at most 16 kayaks fit. 16 × 3 = 48 m² exactly.',
      more: [
        { k: 'solve', q: 'Budget, kayaks only: each kayak costs $100 and there is $2000. Solve *100k ≤ 2000* and graph it.', start: '100k ≤ 2000', v: 'k', moves: [{ q: 'First move?', opts: ['Divide both sides by 100', 'Subtract 100'], ans: 0, res: ['k ≤ 20', 'k ≤ 1900', 'k ≥ 20'], rans: 0 }],
          graph: { range: [0, 20], at: 20, open: false, dir: 'l' }, why: 'k ≤ 20.', steps: ['Divide by 100.', 'k ≤ 20.', 'Closed dot at 20, shade left.'] },
        { k: 'solve', q: 'Takings, kayaks only: $15 each, more than $120. Solve *15k > 120* and graph it.', start: '15k > 120', v: 'k', moves: [{ q: 'First move?', opts: ['Divide both sides by 15', 'Subtract 15'], ans: 0, res: ['k > 8', 'k > 105', 'k < 8'], rans: 0 }],
          graph: { range: [0, 20], at: 8, open: true, dir: 'r' }, why: 'k > 8: open dot. 8 kayaks take in exactly $120, which is not more than $120.', steps: ['Divide by 15: k > 8.', 'Strict (>): open dot.', '9 kayaks or more.'] },
        { k: 'solve', kick: 'For the Unit 2 Check', q: 'Not in the summative, but on the Check: solve *−3x + 4 > 19*.', start: '−3x + 4 > 19',
          moves: [{ q: 'First move?', opts: ['Subtract 4 from both sides', 'Divide by −3'], ans: 0, res: ['−3x > 15', '−3x > 23'], rans: 0 }, { q: 'Next?', opts: ['Divide both sides by −3', 'Divide both sides by 3'], ans: 0, res: ['x > −5', 'x < −5'], rans: 1, why: 'Dividing by a negative turns the sign.' }],
          why: 'x < −5.', steps: ['Subtract 4: −3x > 15.', 'Divide by −3 and turn the sign: x < −5.'] }
      ] },

    { k: 'pick', min: 2, id: 'all', where: 'line', range: [0, 20], v: 'k', cond: 'k ≥ 2, k ≤ 16, k ≤ 20, k > 8', kick: 'Every limit at once', q: 'Kayaks only. The limits are *k ≥ 2*, *k ≤ 16*, *k ≤ 20* and *k > 8*. Tap every number of kayaks that passes *all four*.',
      learn: ['A plan has to pass *every* limit, so keep only the numbers that are in all of them.', 'The tightest limit at each end wins.'],
      help: 'Which is the tightest top limit: 16 or 20? Which bottom limit matters more: 2 or 8?',
      why: '9 to 16: eight numbers. k ≤ 16 beats k ≤ 20, and k > 8 beats k ≥ 2. Not 8: it fails k > 8.',
      more: [
        { k: 'nl', between: true, range: [0, 20], v: 'k', ans: { at: 8, open: true, to: 16, toOpen: false, dir: 'b' }, q: 'Graph them together: *8 < k ≤ 16*.', why: 'Open dot at 8, closed dot at 16, shaded between.',
          steps: ['Bottom: k > 8, open dot.', 'Top: k ≤ 16, closed dot.', 'Shade between.'] },
        { k: 'poll', q: 'Which two limits don\'t matter at all when it\'s kayaks only?', opts: ['k ≥ 2 and k ≤ 20', 'k ≤ 16 and k > 8', 'All four matter'], ans: 0,
          why: 'Any k from 9 to 16 already passes k ≥ 2 and k ≤ 20. The tighter limits do the work.', steps: ['k > 8 already means k ≥ 2.', 'k ≤ 16 already means k ≤ 20.', 'So those two never stop a plan here.'] },
        { k: 'number', q: 'How many whole numbers of kayaks pass all four limits?', ans: 8, hint: 'Count from 9 to 16, both included.', why: '9, 10, 11, 12, 13, 14, 15, 16: eight.',
          steps: ['Smallest: 9 (8 fails k > 8).', 'Largest: 16.', '16 − 9 + 1 = *8*.'] }
      ] },

    { k: 'solve', min: 2, id: 's2', kick: 'Fix one, solve for the other', q: 'Now hire exactly *2 kayaks*. Dock space: *3(2) + 4p ≤ 48*. How many pedal boats fit?', start: '3(2) + 4p ≤ 48', v: 'p',
      learn: ['Put the kayaks in first: they use 3(2) = 6 m². The pedal boats get what is left.', 'Whole boats only, and you can\'t go over: round *down*.'],
      moves: [
        { q: 'First move?', opts: ['Work out 3(2) = 6', 'Divide everything by 4', 'Subtract 3'], ans: 0, res: ['6 + 4p ≤ 48', '5 + 4p ≤ 48', '32 + 4p ≤ 48'], rans: 0 },
        { q: 'Next move?', opts: ['Subtract 6 from both sides', 'Divide both sides by 4', 'Add 6 to both sides'], ans: 0, res: ['4p ≤ 42', '4p ≤ 54', 'p ≤ 42'], rans: 0 },
        { q: 'Next move?', opts: ['Divide both sides by 4', 'Subtract 4'], ans: 0, res: ['p ≤ 10.5', 'p ≤ 38'], rans: 0 },
        { q: 'You can only hire whole boats. What does p ≤ 10.5 mean?', opts: ['At most 10 pedal boats', 'At most 11 pedal boats', '10.5 pedal boats'], ans: 0, res: ['p ≤ 10 whole boats', 'p ≤ 11 whole boats'], rans: 0, why: '11 boats would need 6 + 44 = 50 m²: too much. Round down.' }],
      graph: { range: [0, 12], at: 10, open: false, dir: 'l' },
      help: 'The 2 kayaks use 3 × 2 = 6 m² first. Then 48 − 6 is left for boats.',
      why: 'At most 10 pedal boats fit next to 2 kayaks. (The other limits may cut it lower: that is the next question in Part 1.)',
      more: [
        { k: 'solve', q: 'Takings with exactly 2 kayaks: *15(2) + 40p > 120*. What is the fewest pedal boats?', start: '15(2) + 40p > 120', v: 'p', moves: [
          { q: 'First move?', opts: ['Work out 15(2) = 30', 'Divide by 40'], ans: 0, res: ['30 + 40p > 120', '17 + 40p > 120'], rans: 0 },
          { q: 'Next?', opts: ['Subtract 30 from both sides', 'Add 30'], ans: 0, res: ['40p > 90', '40p > 150'], rans: 0 },
          { q: 'Next?', opts: ['Divide both sides by 40', 'Subtract 40'], ans: 0, res: ['p > 2.25', 'p > 50'], rans: 0 },
          { q: 'Whole boats, and you must beat $120. The fewest?', opts: ['3 pedal boats', '2 pedal boats'], ans: 0, res: ['p ≥ 3 whole boats', 'p ≥ 2'], rans: 0, why: '2 boats take in 30 + 80 = $110: not enough. Round up.' }],
          why: 'At least 3 pedal boats.', steps: ['30 + 40p > 120.', '40p > 90, so p > 2.25.', 'Must beat it: round *up* to 3.'] },
        { k: 'pick', where: 'line', range: [0, 12], v: 'p', cond: 'p ≤ 10.5, p ≤ 9, p > 2.25, p ≤ 7, p ≥ 0', q: 'With 2 kayaks the limits on p are *p ≤ 10.5* (dock), *p ≤ 9* (budget), *p > 2.25* (takings) and *0 ≤ p ≤ 7* (stock). Tap every number of pedal boats that works.',
          why: '3, 4, 5, 6, 7. The stock limit (7) is the tightest top, and the takings (more than 2.25) the tightest bottom.', steps: ['Top: 7 beats 9 and 10.5.', 'Bottom: more than 2.25, so 3.', '3, 4, 5, 6, 7.'] },
        { k: 'number', q: 'With exactly *4* kayaks, how many pedal boats fit on the dock at most? (3(4) + 4p ≤ 48)', ans: 9, hint: '12 + 4p ≤ 48, so 4p ≤ 36.', why: 'p ≤ 9.',
          steps: ['3(4) = 12.', '4p ≤ 36.', 'p ≤ *9*.'] }
      ] },

    { k: 'play', min: 16, title: 'Your turn: Summative Part 1', file: 'summative-u2.html#p1', btn: '📄 Open Part 1', minutes: 16,
      steps: ['Questions 1 to 4. Do the ★ CORE ones first: 1, 2 and 3.', 'Same moves as today, with the boathouse: c claw machines, h air hockey tables.', 'Stuck? Press 💡 Need a hint. Using hints is fine.', 'Show your working, and keep your page: you need it for Part 5.'],
      aim: 'Done when 1 to 4 are answered and the self-check at the end of Part 1 matches.' },
    { k: 'number', min: 1, id: 'chk', kick: 'Part 1 self-check', q: 'How many whole numbers are in your list for question *3d*?', ans: 9,
      hint: 'Look again at which dots are open, and use the tightest limit at each end.', why: 'That matches the self-check. Now check 4d.',
      more: [
        { k: 'number', q: 'And how many whole numbers are in your list for question *4d*?', ans: 4, hint: 'Look again: subtract the claw machines\' share first, then use the stock limit too.', why: 'That matches.',
          steps: ['Put c = 4 into each limit first.', 'Solve each for h, then keep the tightest top and bottom.', 'Count the whole numbers between your dots, closed ones included.'] }
      ] },
    { k: 'conf', min: 1, id: 'conf', q: 'Writing, solving and graphing one-variable limits: how do you feel?' },
    { k: 'end', title: 'Part 1: one machine at a time.', next: 'Keep your Part 1 (in your folder, or in the same browser). Next lesson: *Inequalities 2* and Part 2, both machines at once.' }
  ]
});
