/* Homework: Unit 3 Lesson 13, Undo It: Inverse Functions. */
SFA_HW({
  id: 'g43', unit: 3, lesson: 13, topic: 'Inverse functions', title: 'The Undo Booth', who: 'gus',
  intro: ['Tourists are visiting Sandy Flats, so Gus opened a money booth at the arcade. The rule is *1 USD = 3.75 riyals*.',
    'Every machine in the booth has an *undo machine* that takes the answer back to the start. Help Gus build the undo machines and check them before the tourists line up.'],
  goal: 'Undo a function: swap inputs and outputs, build the undo machine, and check two functions are inverses.',
  bigIdea: 'An inverse undoes a function: it swaps inputs and outputs, so the domain and range swap too.',
  levels: [
    { name: 'Swap in and out', learn: ['An inverse *undoes* a function. It swaps the inputs and the outputs.', 'If f(2) = 7, the inverse takes 7 back to 2. The point (2, 7) becomes (7, 2).'],
      tasks: [
        { k: 'choice', q: 'A machine f takes 2 to 7: *f(2) = 7*. What does the inverse do with 7?', opts: ['It takes 7 back to 2', 'It takes 7 to 14', 'It takes 7 to −7', 'It takes 2 to 7'], ans: 0,
          no: [null, 'The inverse goes backwards, to the start.', 'An inverse is not "make it negative". It undoes the machine.', 'That is f itself. The inverse goes the other way.'], why: 'The inverse undoes f: 7 goes back to 2.' },
        { k: 'pair', q: 'The point *(2, 7)* is on f. Which point is on the inverse?', ans: [7, 2], hint: 'Swap the input and the output.', why: '(2, 7) becomes (7, 2).' },
        { k: 'fill', q: 'Gus changes USD into riyals (× 3.75). Fill in the *undo* table: riyals back into USD.', tab: { head: ['USD', '1', '2', '4', '10'], rows: [['Riyals', 3.75, 7.5, 15, 37.5]] },
          head: ['Riyals (in)', 'USD (out)'], rows: [[3.75, { a: 1 }], [7.5, { a: 2 }], [15, { a: 4 }], [37.5, { a: 10 }]],
          hint: 'Use the first table backwards: find the riyals, read the USD.', why: 'The undo table is the first table with the rows swapped.' },
        { k: 'solve', q: 'Machine f: *double, then add 3*. It gave 13. Undo it to find the start.', start: 'Output: 13',
          moves: [
            { q: 'Which step do you undo first?', opts: ['Undo "add 3": subtract 3', 'Undo "double": halve', 'Add 3'], ans: 0, res: ['13 − 3 = 10', '13 − 3 = 11', '13 − 3 = 9'], rans: 0,
              hint: '"Add 3" was done last, so undo it first.', no: { 1: '"Double" was done first, so undo it last.', 2: 'Undo adding with subtracting.', r1: 'Check: 13 − 3.', r2: 'Check: 13 − 3.' } },
            { q: 'Next move?', opts: ['Undo "double": halve', 'Double again'], ans: 0, res: ['10 ÷ 2 = 5', '10 ÷ 2 = 20', '10 ÷ 2 = 8'], rans: 0,
              hint: 'Undo doubling with halving.', no: { 1: 'Undo doubling with the opposite: halve.', r1: 'Halving makes it smaller.', r2: 'Half of 10?' }, why: 'Check: 2(5) + 3 = 13 ✓. Undo machine: subtract 3, then halve.' }
          ] }
      ] },
    { name: 'Undo machines', learn: ['Undo each step with its *opposite*: + and −, × and ÷.', 'Undo in *reverse order*: the last step first.'],
      tasks: [
        { k: 'choice', q: 'Machine g: *× 4, then − 1*. Which is its undo machine?', opts: ['+ 1, then ÷ 4', '÷ 4, then + 1', '− 1, then × 4', '÷ 4, then − 1'], ans: 0,
          no: [null, 'Right operations, wrong order. Undo the last step (− 1) first.', 'Those are the same steps again, not the opposites.', 'Use the opposites (+ for −) and the reverse order.'], why: 'Last step first: undo − 1 with + 1, then undo × 4 with ÷ 4.' },
        { k: 'solve', q: 'Machine g: *× 4, then − 1*. It gave *19*. Undo it.', start: 'Output: 19',
          moves: [
            { q: 'First move?', opts: ['Undo − 1: add 1', 'Undo × 4: divide by 4', 'Subtract 1'], ans: 0, res: ['19 + 1 = 20', '19 + 1 = 18', '19 + 1 = 21'], rans: 0,
              hint: '− 1 was done last. Undo it first.', no: { 1: '× 4 was done first, so undo it last.', 2: 'Undo subtracting with adding.' } },
            { q: 'Next move?', opts: ['Undo × 4: divide by 4', 'Multiply by 4'], ans: 0, res: ['20 ÷ 4 = 5', '20 ÷ 4 = 80', '20 ÷ 4 = 16'], rans: 0,
              hint: 'Undo multiplying with dividing.', no: { 1: 'Undo multiplying with the opposite: divide.', r1: 'Dividing makes it smaller.', r2: '20 ÷ 4 means how many 4s in 20.' }, why: 'Check: 5 × 4 − 1 = 19 ✓.' }
          ] },
        { k: 'solve', q: 'A tourist has *30 riyals*. How many USD is that? (1 USD = 3.75 riyals)', start: '30 riyals → ? USD',
          moves: [
            { q: 'Riyals to USD: which operation?', opts: ['Divide by 3.75', 'Multiply by 3.75', 'Subtract 3.75'], ans: 0, res: ['30 ÷ 3.75 = 8', '30 ÷ 3.75 = 80', '30 ÷ 3.75 = 0.8'], rans: 0,
              hint: 'USD → riyals is × 3.75. Going back, undo it.', no: { 1: '× 3.75 goes USD → riyals. Going back, undo it: divide.', 2: 'Changing money is multiplying, so undo it by dividing.', r1: '3.75 × 80 is 300, not 30.', r2: '3.75 × 0.8 is 3, not 30.' } },
            { q: 'Check it.', opts: ['Change 8 USD back: 8 × 3.75', 'Change 8 USD back: 8 ÷ 3.75'], ans: 0, res: ['8 × 3.75 = 30 riyals ✓', '8 × 3.75 = 32 riyals'], rans: 0,
              hint: 'USD to riyals is × 3.75.', no: { 1: 'USD to riyals is × 3.75.', r1: '8 × 3 = 24 and 8 × 0.75 = 6. Add them.' }, why: '30 riyals = 8 USD. The round trip brings you back to 30.' }
          ] },
        { k: 'solve', q: 'Phones show *°F*. The rule °C → °F is *× 1.8, then + 32*. Change *86 °F* back to °C.', start: '86 °F → ? °C',
          moves: [
            { q: 'First move?', opts: ['Subtract 32', 'Divide by 1.8', 'Add 32'], ans: 0, res: ['86 − 32 = 54', '86 − 32 = 64', '86 − 32 = 118'], rans: 0,
              hint: '"+ 32" was done last, so undo it first.', no: { 1: '× 1.8 was done first, so undo it last.', 2: 'Undo adding 32 with subtracting 32.', r1: '86 − 32: take 30, then 2 more.', r2: 'Subtracting makes it smaller.' } },
            { q: 'Next move?', opts: ['Divide by 1.8', 'Multiply by 1.8'], ans: 0, res: ['54 ÷ 1.8 = 30', '54 ÷ 1.8 = 3', '54 ÷ 1.8 = 300'], rans: 0,
              hint: 'Undo × 1.8 with ÷ 1.8.', no: { 1: 'Undo multiplying with dividing.', r1: '1.8 × 3 is only 5.4.', r2: '1.8 × 300 is 540.' }, why: 'Check: 30 × 1.8 + 32 = 54 + 32 = 86 ✓. 86 °F is a hot 30 °C.' }
          ] }
      ] },
    { name: 'Domain and range swap', learn: ['The *domain* of f (its inputs) becomes the *range* of the inverse.', 'The *range* of f (its outputs) becomes the *domain* of the inverse.'],
      tasks: [
        { k: 'choice', q: 'Machine k has domain *{0, 2, 4}* and range *{1, 5, 9}*. What is the *domain* of its inverse?', opts: ['{1, 5, 9}', '{0, 2, 4}', '{0, 1, 2, 4, 5, 9}', '{9, 5, 1, 4, 2, 0}'], ans: 0,
          no: [null, 'That is the domain of k. The inverse swaps them.', 'The inverse only takes in the outputs of k.', 'The inverse only takes in the outputs of k.'], why: 'The inverse takes in what k gives out: {1, 5, 9}.' },
        { k: 'fill', q: 'Machine h is in the table. Fill in its undo table.', tab: { head: ['x', '1', '2', '3', '4'], rows: [['h(x)', 6, 11, 16, 21]] },
          head: ['In', 'Undo (out)'], rows: [[6, { a: 1 }], [11, { a: 2 }], [16, { a: 3 }], [21, { a: 4 }]], hint: 'Find each number in the h(x) row and read the x above it.', why: 'The undo table swaps the rows: 6 → 1, 11 → 2, 16 → 3, 21 → 4.' },
        { k: 'choice', q: 'Machine h: x → 6, 11, 16, 21 for x = 1, 2, 3, 4. Its rule is *× 5, then + 1*. What is the undo rule?', opts: ['− 1, then ÷ 5', '÷ 5, then − 1', '− 5, then ÷ 1', '+ 1, then × 5'], ans: 0,
          no: [null, 'Right opposites, wrong order. Undo + 1 first.', 'Undo × 5 with ÷ 5, not − 5.', 'Those are not opposites.'], why: 'Test: 16 − 1 = 15, 15 ÷ 5 = 3 ✓.' },
        { k: 'sort', q: 'Is each pair of machines a pair of *inverses*?', bins: ['✓ Inverses', '✗ Not inverses'],
          cards: [{ t: '× 2, + 3  |  − 3, ÷ 2', b: 0 }, { t: '× 2, + 3  |  ÷ 2, − 3', b: 1, why: 'Wrong order: undo the + 3 first. Test 5: 13 ÷ 2 − 3 = 3.5.' }, { t: '+ 5  |  − 5', b: 0 }, { t: '× 4  |  × ¼', b: 0, why: 'Times ¼ is the same as ÷ 4. They are inverses.' },
            { t: '− 6  |  − 6', b: 1, why: 'Undo − 6 with + 6.' }, { t: '× 3, − 1  |  + 1, ÷ 3', b: 0 }, { t: '× 3, − 1  |  ÷ 3, + 1', b: 1, why: 'Wrong order. Test 2: 2 × 3 − 1 = 5, then 5 ÷ 3 + 1 is not 2.' }] }
      ] },
    { name: 'Round trips', learn: ['To check, go on a *round trip*: put a number into f, then put the answer into the inverse.', 'If you get your number back, they are inverses.'],
      tasks: [
        { k: 'solve', q: 'Round trip: change *6 USD* to riyals, then back to USD.', start: '6 USD',
          moves: [
            { q: 'First move?', opts: ['Change to riyals: × 3.75', 'Change to riyals: ÷ 3.75'], ans: 0, res: ['6 × 3.75 = 22.5 riyals', '6 × 3.75 = 18.75 riyals', '6 × 3.75 = 225 riyals'], rans: 0,
              hint: 'USD → riyals is × 3.75.', no: { 1: 'One USD is worth more than one riyal, so the number gets bigger: ×.', r1: '6 × 3 = 18 and 6 × 0.75 = 4.5. Add them.', r2: 'Check the decimal point: 6 × 3.75 is about 6 × 4.' } },
            { q: 'Next move?', opts: ['Change back: ÷ 3.75', 'Change back: × 3.75'], ans: 0, res: ['22.5 ÷ 3.75 = 6 USD', '22.5 ÷ 3.75 = 60 USD'], rans: 0,
              hint: 'Undo × with ÷.', no: { 1: 'Going back, undo × 3.75 with ÷ 3.75.', r1: '3.75 × 60 is 225, not 22.5.' }, why: 'Back to 6 USD: × 3.75 and ÷ 3.75 are inverses.' }
          ] },
        { k: 'choice', q: 'Priya\'s machine: *add 4, then triple*. She says the undo is *subtract 4, then divide by 3*. Test with 2. Is she right?', opts: ['No: the order is wrong', 'Yes: they are inverses', 'No: she should multiply by 3'], ans: 0,
          no: [null, 'Try it: 2 + 4 = 6, × 3 = 18. Then 18 − 4 = 14, 14 ÷ 3 is not 2.', 'Undo tripling with dividing, not multiplying.'], why: 'Undo the last step first: 18 ÷ 3 = 6, then 6 − 4 = 2 ✓.' },
        { k: 'number', q: 'Machine f: *× 3, then − 2*. The inverse gets *25*. What does it give out?', ans: 9, hint: 'Undo − 2 first (add 2), then undo × 3 (divide by 3).', why: '25 + 2 = 27, 27 ÷ 3 = 9. Check: 9 × 3 − 2 = 25 ✓.' },
        { k: 'choice', q: 'f takes 1 → 4, 2 → 6, 3 → 8. Which table is the *inverse* of f?', opts: ['4 → 1, 6 → 2, 8 → 3', '1 → 8, 2 → 6, 3 → 4', '4 → 8, 6 → 6, 8 → 4', '1 → −4, 2 → −6, 3 → −8'], ans: 0,
          no: [null, 'The inverse starts with the outputs of f: 4, 6, 8.', 'Each arrow must go back to where it came from: 4 goes back to 1.', 'Negatives do not undo f. Swap the inputs and outputs.'], why: 'Swap every pair: 4 → 1, 6 → 2, 8 → 3.' }
      ] },
    { name: 'The tourist rush boss', boss: true, learn: ['Mixed questions, fewer hints. Opposite operations, last step first, and check with a round trip.'],
      tasks: [
        { k: 'solve', q: 'Machine: *× 5, then − 7*. It gave *38*. Undo it.', start: 'Output: 38',
          moves: [
            { q: 'First move?', opts: ['Add 7', 'Divide by 5', 'Subtract 7'], ans: 0, res: ['38 + 7 = 45', '38 + 7 = 31', '38 + 7 = 44'], rans: 0, hint: 'Undo the last step first.' },
            { q: 'Next move?', opts: ['Divide by 5', 'Multiply by 5'], ans: 0, res: ['45 ÷ 5 = 9', '45 ÷ 5 = 8', '45 ÷ 5 = 225'], rans: 0, why: 'Check: 9 × 5 − 7 = 38 ✓.' }
          ] },
        { k: 'number', q: 'A tourist pays *150 riyals*. How many USD is that? (1 USD = 3.75 riyals)', ans: 40, unit: 'USD', why: '150 ÷ 3.75 = 40. Check: 40 × 3.75 = 150 ✓.' },
        { k: 'pair', q: 'The point *(−2, 9)* is on f. Which point is on the inverse?', ans: [9, -2], why: 'Swap them: (9, −2).' },
        { k: 'solve', q: 'Riyadh in summer: a phone shows *104 °F*. Change it to °C. (°C → °F is × 1.8, then + 32.)', start: '104 °F → ? °C',
          moves: [
            { q: 'First move?', opts: ['Subtract 32', 'Divide by 1.8'], ans: 0, res: ['104 − 32 = 72', '104 − 32 = 82', '104 − 32 = 136'], rans: 0 },
            { q: 'Next move?', opts: ['Divide by 1.8', 'Multiply by 1.8'], ans: 0, res: ['72 ÷ 1.8 = 40', '72 ÷ 1.8 = 4', '72 ÷ 1.8 = 129.6'], rans: 0, why: 'Check: 40 × 1.8 + 32 = 72 + 32 = 104 ✓.' }
          ] },
        { k: 'choice', q: 'Zero changes 30 riyals into USD: "30 × 3.75 = 112.50, so it is 112.50 USD." What went wrong?', opts: ['He multiplied. He should divide: 8 USD', 'Nothing: it is right', 'He should subtract: 26.25 USD', 'He should add: 33.75 USD'], ans: 0,
          no: [null, '1 USD is worth more than 1 riyal, so you get fewer USD than riyals.', 'Changing money is multiplying or dividing, not subtracting.', 'Changing money is multiplying or dividing, not adding.'], why: 'Riyals → USD undoes × 3.75, so divide: 30 ÷ 3.75 = 8 USD.' }
      ] }
  ]
});
