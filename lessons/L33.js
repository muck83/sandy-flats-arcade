/* Inequalities 5 of 5: the Unit 2 Summative's lesson 5 (Part 5: put it together and hand it in). Short hands-on
   slides on what a finished plan needs, then most of the lesson to build it. */
SFA_LESSON({
  id: 'L33', n: 21.9, label: 'Inequalities 5', title: 'Put It Together',
  game: { title: 'Unit 2 Summative', file: 'summative-u2.html#p5' },
  big: 'A finished plan tells the whole story in order: the question and the variables, the limits, the system, the graph, the corner table, and a recommendation that uses numbers. Choose your best work and tidy it, so someone new could check every step.',
  slides: [
    { k: 'title', min: 1, kicker: 'Unit 2 Summative · Lesson 5 of 5', title: 'Put It Together', sub: 'Four parts done. Today they become one plan the Sandy Flats Arcade could actually use: a report, a poster or a 90-second pitch.', art: '📋' },
    { k: 'signin', min: 1, title: 'Today you will', points: ['Check what your finished plan must include', 'Put the six parts in order', 'Check your graph and your recommendation', 'Build your plan and hand it in on Toddle'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'Which format are you going for?', opts: ['📄 The plan (report)', '🪧 The poster', '🎬 The 90-second pitch', 'Not sure yet'] },

    { k: 'sort', min: 2, id: 'parts', kick: 'What goes in', q: 'Which of these must be in your finished plan, in every format?', bins: ['✓ Must be in it', '✗ Leave it out'],
      learn: ['Don\'t staple the four parts together: choose your best work and tidy it.'],
      cards: [{ t: 'The question, and what c and h stand for', b: 0 }, { t: 'The limits table, with number lines for the prize deal and the stock', b: 0 }, { t: 'The system of inequalities', b: 0 }, { t: 'The graph: labelled, region shaded, corners and plans marked', b: 0 }, { t: 'The corner table with the money', b: 0 }, { t: 'A recommendation that uses numbers', b: 0 }, { t: 'Every hint you used', b: 1, why: 'Hints help you along the way; the plan shows your thinking, not the hints.' }, { t: 'All four parts stapled together, untidied', b: 1, why: 'The task says: choose your best work and tidy it up.' }],
      help: 'Look at the "Your plan must include" list in Part 5.',
      why: 'Six parts, in every format: question and variables, limits table, system, graph, corner table, recommendation.',
      more: [
        { k: 'poll', q: 'You chose the 90-second pitch. What do you upload?', opts: ['The video, plus a photo of the graph and table', 'Just the video', 'Just the graph'], ans: 0,
          why: 'The pitch shows the graph and table on screen, and you upload a photo of them too, so they can be checked.', steps: ['Every format needs the same six parts.', 'A video alone is hard to check.', 'So add a photo of the graph and table.'] }
      ] },

    { k: 'order', min: 2, id: 'order', q: 'Put the six parts of the plan in order, the way a reader meets them.',
      steps: ['The question in your own words, and what c and h stand for', 'The limits table: each limit in words, its inequality, and the number lines', 'The system of inequalities', 'The graph with the feasible region', 'The corner table with the money at each corner', 'The recommendation, with the what-if and your news flash'],
      hint: 'A reader needs the question before the limits, and the corners before the recommendation.',
      why: 'Each part uses the one before: limits, then system, then graph, then corners, then the decision.' },

    { k: 'sort', min: 2, id: 'graph', kick: 'Check the graph', q: 'Your partner\'s graph. Sort each thing: ready, or fix it first?', bins: ['✓ Ready', '🔧 Fix first'],
      cards: [{ t: 'Axes labelled: c = claw machines, h = air hockey tables', b: 0 }, { t: 'The staff pay line is drawn solid', b: 1, why: 'Staff pay is more than $300: dashed.' }, { t: 'The region is shaded where every limit overlaps', b: 0 }, { t: 'Only the floor and budget lines are drawn', b: 1, why: 'All five lines: floor, budget, staff pay, c = 4 and h = 8.' }, { t: 'Each corner is marked with its coordinates', b: 0 }, { t: 'Marcus\'s plan is marked inside the region', b: 1, why: 'Ten of each breaks three limits: it belongs outside the region.' }],
      help: 'Check each one against your Part 3 checklist: labels, dashed line, all five lines, shading.',
      why: 'Solid and dashed lines, all five boundaries and plans in the right place are what the Graphing row of the rubric checks.',
      more: [
        { k: 'poll', kick: 'Deep', q: 'For Deep in Graphing, what else does the rubric look for?', opts: ['All the corners found, the crossing point checked in both equations, and the dashed-line corners marked as not included', 'Colours', 'A bigger grid'], ans: 0,
          why: 'Deep means the corners are found accurately, the crossing is checked in both equations, and the corners on the dashed line are shown as not allowed.', steps: ['Read the Deep column of the Graphing row.', 'Corners found and checked.', 'Dashed-line corners marked as not included.'] }
      ] },

    { k: 'sort', min: 2, id: 'rec', kick: 'Check the recommendation', q: 'Which recommendations would convince the arcade?', bins: ['Convincing', 'Needs work'],
      learn: ['A strong recommendation names the plan, gives its money, and says with numbers why it beats each friend\'s plan.'],
      cards: [{ t: '"Rent the plan from our corner table that takes in the most: $___ a day. Marcus\'s plan breaks the floor, budget and stock limits; Gus\'s takes in $___ and Priya\'s $___."', b: 0 },
        { t: '"Gus is right because air hockey is better."', b: 1, why: 'No numbers, and "better" at what? Use the corner table.' },
        { t: '"We tested every corner. The best one beats Gus by $___ a day, and still fits all 60 m² and the $4800."', b: 0 },
        { t: '"Our answer is on the graph."', b: 1, why: 'Say which plan, and why, in words and numbers.' }],
      help: 'Does it name a plan? Give money? Compare with the friends?',
      why: 'Convincing recommendations use numbers from the corner table and deal with every friend\'s plan.',
      more: [
        { k: 'open', q: 'Write the first two sentences of your own recommendation: name the plan, give its money, and beat one friend\'s plan with a number.', ph: 'We recommend…',
          model: 'We recommend renting ___ claw machines and ___ air hockey tables, which takes in $___ a day. That is $___ more than Gus\'s plan, and Marcus\'s plan breaks three limits.',
          steps: ['Name the plan (c and h).', 'Give the money each day.', 'Compare with a friend\'s plan, using numbers.'] }
      ] },

    { k: 'play', min: 28, title: 'Build your plan: Summative Part 5', file: 'summative-u2.html#p5', btn: '📄 Open Part 5', minutes: 28,
      steps: ['Choose your format: the plan, the poster or the pitch.', 'Build it with all six parts, in order.', 'Final check: labels, dashed line, shading, numbers in the recommendation, your name on every page.', 'Photo or PDF every page and upload it to the Unit 2 Summative on Toddle. Check it opens.'],
      aim: 'Done when your upload is on Toddle and every page is readable.' },
    { k: 'conf', min: 1, id: 'conf', q: 'Linear inequalities, the whole unit: how do you feel now?' },
    { k: 'end', title: 'The Pop-Up Arcade, decided.', next: 'Check your upload opens on Toddle. Then practise anything that felt shaky in the *Unit 2 Review*.' }
  ]
});
