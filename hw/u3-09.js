/* Homework: Unit 3 Lesson 9, Tell the Story of a Graph. */
(function () {
  // a qualitative graph: no numbers, just the shape
  function G(p, y, cap) { var f = { range: [0, 10], yrange: [0, 10], noTicks: true, x: 'time', y: y || 'distance', paths: [{ p: p }] }; if (cap) { f.cap = cap; f.size = 150; } return f; }
  var A = [[0, 0], [3, 4], [5, 4], [7, 9]], B = [[0, 0], [4, 7], [6, 7], [7, 0]], C = [[0, 0], [4, 5], [6, 5], [10, 0]], D = [[0, 9], [1, 5.5], [2, 3.6], [3, 2.5], [5, 1.6], [7, 1.2], [10, 1]];
  SFA_HW({
    id: 'g39', unit: 3, lesson: 9, topic: 'Tell the story of a graph', title: 'The Kite Day Tracker', who: 'priya',
    intro: ['It is Kite Day at Sandy Flats! Priya clipped a little tracker to everything: kites, phones, the bath tub at the beach house, even Gus.',
      'The tracker draws a graph for each thing, but it has no numbers. Read the *shape* of each graph and tell its story.'],
    goal: 'Read a graph piece by piece: up, down or flat, fast or slow, and match graphs to stories.',
    bigIdea: 'Read a graph left to right: up means growing, down means falling, flat means no change, and steeper means faster.',
    levels: [
      { name: 'Read left to right', learn: ['Read a graph from *left to right*, like a sentence.', '*Up*: the value grows. *Down*: it falls. *Flat*: it does not change.'],
        tasks: [
          { k: 'choice', q: 'This graph shows the *height* of Marcus\'s kite. What is happening?', fig: G([[0, 1], [9, 8]], 'height'),
            opts: ['The kite is going up', 'The kite is coming down', 'The kite stays at one height', 'The kite goes up, then down'], ans: 0,
            no: [null, 'Read from left to right. Does the line go up or down?', 'A flat line means the same height. This line is not flat.', 'There is only one piece here, and it only goes one way.'], why: 'The line goes up from left to right, so the height grows.' },
          { k: 'choice', q: 'This graph shows Zero\'s *phone battery* while it sits in his bag. What does the flat line tell you?', fig: G([[0, 6], [10, 6]], 'battery'),
            opts: ['The battery level does not change', 'The battery is charging', 'The battery is going down fast', 'The phone is broken'], ans: 0,
            no: [null, 'Charging would make the line go up.', 'Going down would make the line go down.', 'The graph does not say that. It only shows the level.'], why: 'Flat means no change: the battery stays at the same level.' },
          { k: 'sort', q: 'Would each graph go *up*, *down* or stay *flat*? Sort them.', bins: ['↗ Up', '↘ Down', '→ Flat'],
            cards: [{ t: 'Water in a tub that is filling', b: 0 }, { t: 'Battery while you play a game', b: 1, why: 'Playing uses the battery, so it goes down.' }, { t: 'Height of a parked car', b: 2, why: 'A parked car does not go up or down.' },
              { t: 'Distance from home as you walk away', b: 0 }, { t: 'Height of a kite as it lands', b: 1 }, { t: 'Distance from home while you wait', b: 2, why: 'Waiting: you do not move, so the distance stays the same.' }] },
          { k: 'solve', q: 'This graph shows Gus\'s *distance from home*. Tell its story, one piece at a time.', fig: G([[0, 0], [3, 6], [6, 6], [9, 0]]), start: 'Gus\'s trip: 3 pieces',
            moves: [
              { q: 'Look at piece 1. What shape is it?', opts: ['Up, straight', 'Flat', 'Down'], ans: 0, res: ['1: Gus walks away at a steady speed', '1: Gus walks towards home', '1: Gus stands still'], rans: 0,
                hint: 'Read from the left. The first piece climbs.', no: { r1: 'Up means the distance from home grows. He is moving away.', r2: 'He is moving: the distance changes.' } },
              { q: 'Piece 2?', opts: ['Flat', 'Up', 'Down'], ans: 0, res: ['2: Gus stops. The distance stays the same', '2: Gus walks very slowly', '2: Gus walks home'], rans: 0,
                hint: 'The middle piece does not go up or down.', no: { r1: 'Slow walking would still go up a little. Flat means he does not move at all.', r2: 'Walking home would make the line go down.' } },
              { q: 'Piece 3?', opts: ['Down', 'Up', 'Flat'], ans: 0, res: ['3: Gus walks back home', '3: Gus walks further away', '3: Gus waits again'], rans: 0,
                hint: 'The last piece goes down to the axis.', no: { r1: 'Down means the distance from home gets smaller.' }, why: 'The line ends at 0: Gus is home again.' }
            ] }
        ] },
      { name: 'Steep or gentle?', learn: ['*Steeper* means the value changes *faster*. Flatter means slower.', 'A *straight* piece changes at a steady rate. A *curved* piece speeds up or slows down.'],
        tasks: [
          { k: 'choice', q: 'Two kites, A and B, go up. The graphs show their height. Which kite goes up *faster*?', figs: [G([[0, 0], [5, 9]], 'height', 'Kite A'), G([[0, 0], [10, 4]], 'height', 'Kite B')],
            opts: ['Kite A: its line is steeper', 'Kite B: its line is longer', 'They go up at the same speed'], ans: 0,
            no: [null, 'Long does not mean fast. Look at how steep each line is.', 'One line is much steeper than the other.'], why: 'Steeper means the height changes faster.' },
          { k: 'solve', q: 'This graph shows the *money Priya saved* for Kite Day. Read it piece by piece.', fig: G([[0, 0], [3, 2], [6, 8], [9, 9]], 'money'), start: 'Priya\'s savings: 3 pieces',
            moves: [
              { q: 'Is any piece going down?', opts: ['No: every piece goes up', 'Yes: piece 3', 'Yes: piece 1'], ans: 0, res: ['Her savings never go down', 'Her savings go down at the end', 'Her savings stay the same'], rans: 0,
                hint: 'Look at each piece from left to right. Do any of them fall?', no: { 1: 'Piece 3 is gentle, but it still goes up.', 2: 'Piece 1 goes up, slowly.', r2: 'Flat would mean no change. Every piece climbs.' } },
              { q: 'Which piece is the steepest?', opts: ['Piece 2', 'Piece 1', 'Piece 3'], ans: 0, res: ['Piece 2: she saves fastest here', 'Piece 2: she saves slowest here', 'Piece 2: she spends money here'], rans: 0,
                hint: 'Steepest means the biggest climb in the same time.', no: { r1: 'Steeper means faster, not slower.', r2: 'Spending would make the line go down.' }, why: 'Maybe she had a job in that part: the money grew fastest.' }
            ] },
          { k: 'choice', q: 'Which story fits this *curved* graph?', fig: G(D, 'temperature'),
            opts: ['Hot tea cools fast, then more slowly', 'Hot tea cools at a steady speed', 'Cold juice warms up', 'Hot tea stays hot'], ans: 0,
            no: [null, 'Steady would be a straight line. This one is curved.', 'Warming up would make the graph go up.', 'Staying hot would be a flat line.'], why: 'Steep at first (cools fast), then flatter and flatter (cools slowly).' },
          { k: 'choice', q: 'Marcus says: "On a distance graph, a flat piece means walking slowly." Is he right?',
            opts: ['No: flat means he stopped', 'Yes: flat means slow', 'No: flat means he walks fast'], ans: 0,
            no: [null, 'Slow walking still changes the distance a little, so the line still climbs a little.', 'Fast walking makes a steep line.'], why: 'Flat means the distance does not change at all: he is standing still.' }
        ] },
      { name: 'Match the story', learn: ['Look for clues: a *flat* piece is a stop or a wait. *Down* is something getting smaller or coming back.', 'Compare how steep the pieces are: fast or slow?'],
        tasks: [
          { k: 'choice', q: 'Bath time at the beach house. The tub fills at a steady rate. One sits in the bath for a while. Then he pulls the plug and the water drains out *quickly*. Which graph?',
            figs: [G(A, 'water', 'A'), G(B, 'water', 'B'), G(C, 'water', 'C'), G(D, 'water', 'D')], opts: ['Graph A', 'Graph B', 'Graph C', 'Graph D'], ans: 1,
            no: ['Graph A never goes down. The water must drain out.', null, 'Graph C goes down slowly. The story says quickly.', 'Graph D only goes down. The tub fills first.'], why: 'B: up (fill), flat (sit), then steep down (drain fast).' },
          { k: 'choice', q: 'Same four graphs. Zero walks slowly to the pier. He rests there. Then he walks back at the *same slow speed*. Which graph?',
            figs: [G(A, '?', 'A'), G(B, '?', 'B'), G(C, '?', 'C'), G(D, '?', 'D')], opts: ['Graph A', 'Graph B', 'Graph C', 'Graph D'], ans: 2,
            no: ['Graph A never comes back down. Zero comes back.', 'In B the last piece is steep: that is fast, not slow.', null, 'D has no flat piece for the rest.'], why: 'C: up, flat, then down just as gently as it went up.' },
          { k: 'solve', q: 'Graphs B and C both go up, flat, then down. How can you tell them apart?', figs: [G(B, 'water', 'B'), G(C, 'distance', 'C')], start: 'B and C: up, flat, down',
            moves: [
              { q: 'Which pieces look different?', opts: ['The last pieces (going down)', 'The flat pieces', 'Nothing is different'], ans: 0, res: ['B goes down steeply. C goes down gently.', 'B goes down gently. C goes down steeply.', 'B and C go down the same way.'], rans: 0,
                hint: 'Compare the going-down pieces.', no: { 1: 'Both flat pieces are flat. Look at another piece.', 2: 'Look again at the last piece of each graph.', r1: 'B drops in a short time. That is the steep one.' } },
              { q: 'What does that mean?', opts: ['Steep means fast', 'Steep means slow'], ans: 0, res: ['B empties fast: the plug is pulled', 'C empties fast: the plug is pulled', 'B is slower than C'], rans: 0,
                hint: 'Steeper means the value changes faster.', no: { 1: 'A steep piece changes a lot in a short time. That is fast.', r1: 'C is the gentle one.', r2: 'Steeper is faster.' }, why: 'B matches the bath (drains quickly), C matches Zero (walks back slowly).' }
            ] },
          { k: 'choice', q: 'One walks to the bus stop, waits, then rides the bus to the beach. Which graph shows his distance from home?',
            figs: [G(A, 'distance', 'A'), G(B, 'distance', 'B'), G(C, 'distance', 'C')], opts: ['Graph A', 'Graph B', 'Graph C'], ans: 0,
            no: [null, 'B comes back down: that would mean he goes back home.', 'C comes back down: that would mean he goes back home.'], why: 'A: up (walk), flat (wait), then steeper up (the bus is faster).' }
        ] },
      { name: 'Sketch the story', learn: ['To sketch a graph, split the story into pieces.', 'For each piece ask: up, down or flat? Fast or slow?'],
        tasks: [
          { k: 'choice', q: 'The arcade opens. It fills with people quickly. It stays full at lunch. Then it slowly empties until closing. Which shape fits?',
            opts: ['Steep up, flat, gentle down', 'Gentle up, flat, steep down', 'Steep up, gentle down, flat', 'Flat, steep up, gentle down'], ans: 0,
            no: [null, 'It fills *quickly*: the first piece is steep.', 'It stays full at lunch before it empties.', 'It starts filling straight away.'], why: 'Three pieces in order: fills fast (steep up), full (flat), empties slowly (gentle down).' },
          { k: 'solve', q: 'Sketch the graph for this story, one piece at a time: *Priya\'s phone charges, then sits unplugged in her bag, then she plays a game on it.*', start: 'Graph of battery over time',
            moves: [
              { q: 'Piece 1: the phone charges. Which shape?', opts: ['Up', 'Down', 'Flat'], ans: 0, res: ['Piece 1: up (the battery rises)', 'Piece 1: up (the battery falls)'], rans: 0,
                hint: 'Charging makes the battery level bigger.', no: { 1: 'Charging adds to the battery. That goes up.', 2: 'Flat would mean no change. Charging changes it.' } },
              { q: 'Piece 2: it sits unplugged in her bag. Which shape?', opts: ['Flat', 'Up', 'Down, steep'], ans: 0, res: ['Piece 2: flat (no change)', 'Piece 2: flat (charging fast)'], rans: 0,
                hint: 'Nobody uses it and it is not charging.', no: { 1: 'It is unplugged, so it is not charging.', 2: 'Nobody is using it, so it does not drop fast.' } },
              { q: 'Piece 3: she plays a game. Which shape?', opts: ['Down', 'Up', 'Flat'], ans: 0, res: ['Piece 3: down (games use battery)', 'Piece 3: down (it charges)'], rans: 0,
                hint: 'Playing uses up the battery.', no: { 1: 'Playing does not charge the phone.', 2: 'Playing uses battery, so the level changes.' }, why: 'Up, flat, down. You need no numbers: the shape tells the story.' }
            ] },
          { k: 'choice', q: 'Which graph matches Priya\'s phone story (charge, sit in bag, play)?', figs: [G([[0, 2], [4, 9], [7, 9], [10, 3]], 'battery', 'A'), G([[0, 9], [4, 2], [7, 2], [10, 8]], 'battery', 'B'), G([[0, 2], [4, 9], [7, 3], [10, 3]], 'battery', 'C')],
            opts: ['Graph A', 'Graph B', 'Graph C'], ans: 0, no: [null, 'B goes down first. Charging comes first, and charging goes up.', 'In C the flat piece is at the end. The bag part is in the middle.'], why: 'A: up, flat, down, the same order as the story.' },
          { k: 'choice', q: 'This graph shows the *water in the arcade fish tank*. Which story fits?', fig: G([[0, 2], [4, 8], [10, 8]], 'water'),
            opts: ['It is filled at a steady rate, then left full', 'It is full, then it leaks', 'It fills faster and faster, then stops', 'It stays full all day'], ans: 0,
            no: [null, 'A leak would make the line go down.', 'The first piece is straight, so the rate is steady, not faster and faster.', 'It is not flat at the start: the water rises first.'], why: 'Straight up (steady filling), then flat (no change).' }
        ] },
      { name: 'The kite final', boss: true, learn: ['Everything at once: up, down, flat, steep, gentle, straight, curved. Read slowly, piece by piece.'],
        tasks: [
          { k: 'solve', q: 'Marcus rides his bike from the arcade. The graph shows his *distance from the arcade*. Tell the story.', fig: G([[0, 0], [2, 6], [4, 6], [7, 8], [9, 0]]), start: 'Marcus\'s ride: 4 pieces',
            moves: [
              { q: 'Piece 1?', opts: ['Up, steep', 'Up, gentle', 'Flat'], ans: 0, res: ['He rides away fast', 'He rides away slowly', 'He rides back fast'], rans: 0, hint: 'Compare piece 1 with piece 3.' },
              { q: 'Pieces 2 and 3?', opts: ['Flat, then up gently', 'Flat, then down', 'Up, then flat'], ans: 0, res: ['He stops, then rides on slowly', 'He stops, then rides on fast', 'He rides on, then stops'], rans: 0 },
              { q: 'Piece 4?', opts: ['Down, steep', 'Down, gentle', 'Up, steep'], ans: 0, res: ['He rides back to the arcade fast', 'He rides further away', 'He rides back slowly'], rans: 0, why: 'The graph ends at 0 distance: he is back at the arcade.' }
            ] },
          { k: 'number', q: 'This graph shows Gus\'s distance from home on a walk. How many times does he *stop*?', fig: G([[0, 0], [2, 4], [3, 4], [5, 7], [7, 7], [9, 0]]), ans: 2, unit: 'stops',
            hint: 'A stop is a flat piece. Count the flat pieces.', why: 'Two flat pieces, so two stops.' },
          { k: 'choice', q: 'The label on the vertical axis is missing. Which label fits this graph?', fig: G(D, '?'),
            opts: ['Temperature of hot tea', 'Distance walked at a steady speed', 'Water in a tub being filled', 'Height of a parked car'], ans: 0,
            no: [null, 'Steady would be a straight line, and walking away goes up.', 'Filling goes up, not down.', 'A parked car would be a flat line.'], why: 'It falls fast, then slower and slower: hot tea cooling.' },
          { k: 'sort', q: 'Is each change *speeding up*, *slowing down* or *steady*?', bins: ['Speeding up', 'Slowing down', 'Steady'],
            cards: [{ t: 'A ball rolls downhill, faster and faster', b: 0 }, { t: 'Hot tea cools more and more slowly', b: 1 }, { t: 'A tap fills a tub at the same rate', b: 2 },
              { t: 'A car brakes to stop at a light', b: 1, why: 'Braking: the car goes slower and slower.' }, { t: 'A snowball grows faster as it rolls', b: 0 }, { t: 'A walker keeps the same pace', b: 2, why: 'Same pace: a straight line.' }] }
        ] }
    ]
  });
})();
