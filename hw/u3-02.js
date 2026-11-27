/* Homework: Unit 3 Lesson 2, Function Machines. */
SFA_HW({
  id: 'g32',
  unit: 3,
  lesson: 2,
  topic: 'What is a function?',
  title: 'Prize Counter Chaos',
  who: 'priya',
  intro: ['Priya runs the prize counter at the Sandy Flats arcade. Players trade tickets for prizes, and the counter has machines that turn an *input* into an *output*.', 'Today some machines are acting strange. A good machine gives *exactly one output* for each input. Help Priya find the machines that break the rule.'],
  goal: 'Decide if a rule, a table, a set of pairs or a story is a function, and say why.',
  bigIdea: 'A function gives each input exactly one output. Two inputs can share an output; one input can never have two.',
  levels: [
    { name: 'Inputs and outputs', learn: ['A machine takes an *input* and gives an *output*.', 'A *function* gives each input *exactly one* output, every time.', 'Different inputs can give the same output. That is fine.'],
      tasks: [
        { k: 'solve', q: 'The token machine\'s rule is *× 2, then + 1*. Put in *4*.', start: 'input: 4',
          moves: [
            { q: 'What first?', opts: ['Times 4', 'Add 1', 'Times 2'], ans: 2, res: ['4 × 2 = 8', '4 + 1 = 5', '4 × 2 = 6'], rans: 0, hint: 'Do the rule in order: × 2 comes first.', no: { '0': 'The rule is × 2. The 4 is the input.', '1': 'The rule says × 2 first, then + 1.', r1: 'That is + 1. We are doing × 2 now.', r2: '4 × 2 is 8. Did you add?' } },
            { q: 'Next?', opts: ['Times 2 again', 'Add 1'], ans: 1, res: ['output: 8 + 1 = 10', 'output: 8 + 1 = 9', 'output: 8'], rans: 1, hint: 'The second part of the rule is + 1.', no: { '0': 'Only one × 2. Then + 1.', r0: '8 + 1 = 9.', r2: 'Do not forget the + 1.' }, why: 'Input 4 gives output 9. Every time you put in 4, you get 9.' }
          ] },
        { k: 'fill', q: 'Fill in the table for the rule *× 2, then + 1*.', head: ['input x', 'output y'], rows: [[1, { a: 3 }], [2, { a: 5 }], [3, { a: 7 }], [5, { a: 11 }]], hint: 'Times 2, then add 1. For 5: 10 + 1.', why: 'Each input gives exactly one output: it is a function.' },
        { k: 'choice', q: 'At the counter, button *A1* always gives a yo-yo, and button *A2* always gives a yo-yo too. Is button → prize a function?', opts: ['Yes: each button gives one prize', 'No: two buttons give the same prize', 'No: there are too few prizes'], ans: 0, no: [null, 'Two inputs can share an output. That is still a function.', 'The number of prizes does not matter. Check each input.'], why: 'Each button (input) gives exactly one prize (output). Sharing is fine.' }
      ] },
    { name: 'Pairs and tables', learn: ['An ordered pair is *(input, output)*.', 'Look for an input that appears *twice* with *different* outputs.', 'A repeated *output* is fine.'],
      tasks: [
        { k: 'solve', q: 'Is this set of pairs a function? *(1, 4), (2, 6), (3, 8), (1, 9)*', start: '(1, 4), (2, 6), (3, 8), (1, 9)',
          moves: [
            { q: 'First move?', opts: ['List the inputs (first numbers)', 'List the outputs (second numbers)'], ans: 0, res: ['4, 6, 8, 9', '1, 2, 3, 4', '1, 2, 3, 1'], rans: 2, hint: 'The rule is about inputs, so start with the inputs.', no: { '1': 'The rule is about each *input*. List the first numbers.', r0: 'Those are the outputs. Inputs come first in each pair.', r1: 'Read the first number of every pair: the last pair starts with 1.' } },
            { q: 'Next move?', opts: ['Add up the inputs', 'Look for a repeated input'], ans: 1, res: ['Input 3 appears twice', 'Input 1 appears twice', 'No input repeats'], rans: 1, hint: 'Is any number in 1, 2, 3, 1 there twice?', no: { r0: '3 is only there once.', r2: 'Look again: 1, 2, 3, *1*.' } },
            { q: 'Next move?', opts: ['Check the outputs of input 1', 'Check the outputs of input 2'], ans: 0, res: ['1 → 4 and 1 → 9: two outputs', '1 → 4 both times', '1 → 9 only'], rans: 0, hint: 'Find both pairs that start with 1.', no: { r1: 'The pairs are (1, 4) and (1, 9). The outputs are different.', r2: 'There is also the pair (1, 4).' } },
            { q: 'Decide.', opts: ['Decide by guessing', 'Decide and give the reason'], ans: 1, res: ['A function: most inputs are fine', 'A function: 1 is a small number', 'Not a function: input 1 has two outputs'], rans: 2, hint: 'One input with two outputs breaks the rule.', no: { r0: 'One broken input is enough to break the rule.', r1: 'The size does not matter. Input 1 has two outputs.' }, why: 'Input 1 goes to 4 and to 9, so it is not a function.' }
          ] },
        { k: 'solve', q: 'Is this set of pairs a function? *(2, 5), (3, 5), (4, 5)*', start: '(2, 5), (3, 5), (4, 5)',
          moves: [
            { q: 'First move?', opts: ['List the inputs', 'List the outputs'], ans: 0, res: ['5, 5, 5', '2, 3, 4'], rans: 1, hint: 'Inputs are the first numbers.', no: { '1': 'Start with the inputs: the first numbers.', r0: 'Those are the outputs.' } },
            { q: 'Next move?', opts: ['Look for a repeated input', 'Look for a repeated output'], ans: 0, res: ['No input repeats', 'Input 2 repeats'], rans: 0, hint: 'Only repeated *inputs* can break the rule.', no: { '1': 'A repeated output is fine. Check the inputs.', r1: '2, 3, 4: each one is there once.' } },
            { q: 'Decide.', opts: ['Decide by the outputs', 'Decide and give the reason'], ans: 1, res: ['A function: each input has one output', 'Not a function: output 5 repeats'], rans: 0, hint: 'Is there any input with two outputs?', no: { '0': 'Outputs are allowed to repeat.', r1: 'Sharing an output is fine. Each input still has one output.' }, why: 'Three inputs share output 5. That is allowed: it is a function.' }
          ] },
        { k: 'choice', q: 'Is this table a function?', tab: { head: ['x', '1', '2', '2', '3'], rows: [['y', 0, 4, 5, 6]] }, opts: ['No: input 2 has outputs 4 and 5', 'Yes: the outputs are all different', 'Yes: every column has a number'], ans: 0, no: [null, 'Different outputs are not the test. Look for a repeated input.', 'Look at the inputs: 2 is there twice.'], why: 'x = 2 goes to 4 and to 5. One input, two outputs: not a function.' },
        { k: 'sort', q: 'Function or not? Sort each set of pairs.', bins: ['Function', 'Not a function'], cards: [{ t: '(1, 2), (2, 4), (3, 6)', b: 0 }, { t: '(5, 1), (5, 2), (6, 3)', b: 1, why: 'Input 5 has two outputs: 1 and 2.' }, { t: '(0, 7), (1, 7), (2, 7)', b: 0, why: 'Same output for every input is fine.' }, { t: '(3, 4), (4, 3), (3, 5)', b: 1, why: 'Input 3 has outputs 4 and 5.' }, { t: '(−1, 1), (1, 1), (2, 4)', b: 0, why: '−1 and 1 are different inputs. They can share 1.' }], why: 'Only a repeated input with different outputs breaks the rule.' }
      ] },
    { name: 'Mapping arrows', learn: ['A mapping draws an arrow from each input to its output: *1 → 3*.', 'Two arrows *leaving* one input: not a function.', 'Two arrows *arriving* at one output: still a function.'],
      tasks: [
        { k: 'sort', q: 'Function or not? Read each mapping.', bins: ['Function', 'Not a function'], cards: [{ t: '1 → 4, 2 → 4, 3 → 4', b: 0, why: 'Arrows arrive at 4 from many inputs. That is fine.' }, { t: '5 → 1, 5 → 2', b: 1, why: 'Two arrows leave 5.' }, { t: 'A → 10, B → 20, C → 30', b: 0 }, { t: '7 → 0, 8 → 1, 7 → 2', b: 1, why: '7 has two arrows: to 0 and to 2.' }, { t: '2 → 3, 3 → 2', b: 0 }], why: 'Count the arrows leaving each input. More than one: not a function.' },
        { k: 'choice', q: 'The counter breaks. Button *B2* gives a ball on Monday but a kite on Tuesday. Is button → prize still a function?', opts: ['Yes: it still gives a prize', 'No: B2 gives two different prizes', 'Yes: Monday and Tuesday are different'], ans: 1, no: ['It gives a prize, but not always the same one.', null, 'The input is the button, not the day. B2 has two outputs.'], why: 'One input (B2) now has two outputs. That is why you would be annoyed!' },
        { k: 'choice', q: 'Turn it around: *price → prize*. A yo-yo and a whistle both cost 3 tickets. Is price → prize a function?', opts: ['Yes: prices are numbers', 'Yes: each prize has one price', 'No: 3 tickets goes to two prizes'], ans: 2, no: ['Being numbers does not matter. Check input 3.', 'That is prize → price. Here the input is the price.', null], why: 'Input 3 tickets has two outputs. But prize → price IS a function: each prize has one price.' },
        { k: 'number', q: 'A machine *adds 6*. The output is *15*. What was the input?', ans: 9, hint: 'Run it backwards: undo + 6 by taking away 6.', why: '15 − 6 = 9. Check: 9 + 6 = 15.' }
      ] },
    { name: 'Real-life rules', learn: ['Ask: can *one input* give *two outputs*?', 'Then turn it around: swap input and output and ask again.', 'The answer can change when you turn it around.'],
      tasks: [
        { k: 'sort', q: 'Is each rule a function?', bins: ['Function', 'Not a function'], cards: [{ t: 'a student → their birthday', b: 0, why: 'Each person has one birthday.' }, { t: 'a birthday → students born then', b: 1, why: 'Many students can share a birthday.' }, { t: 'a player → their high score', b: 0 }, { t: 'a score → players with it', b: 1 }, { t: 'a prize → its ticket price', b: 0 }, { t: 'a game → its price per play', b: 0 }], why: 'If one input can point to two or more outputs, it is not a function.' },
        { k: 'solve', q: 'Players\' IDs: 8041 Sara, 8042 Omar, 8043 Lina, 8044 Omar, 8045 Yusuf. Is *name → ID* a function?', start: 'name → ID',
          moves: [
            { q: 'First move?', opts: ['Look for an ID that is there twice', 'Look for a name that is there twice'], ans: 1, res: ['Sara: IDs 8041 and 8042', 'Omar: IDs 8042 and 8044', 'No name repeats'], rans: 1, hint: 'The input is the name. Is any name there twice?', no: { '0': 'The input is the *name* this time.', r0: 'Sara is there only once.', r2: 'Look again: two players are called Omar.' } },
            { q: 'Decide.', opts: ['Count the players', 'Decide and give the reason'], ans: 1, res: ['Not a function: one name, two IDs', 'A function: every player has an ID'], rans: 0, hint: 'Input "Omar" has two outputs.', no: { r1: 'True, but the input "Omar" goes to two IDs.' }, why: 'Name → ID breaks the rule. But ID → name IS a function: each ID belongs to one player.' }
          ] },
        { k: 'choice', q: 'Marcus says *(4, 2), (9, 3), (9, −3)* is a function. Is he right?', opts: ['No: input 9 has outputs 3 and −3', 'Yes: 3 and −3 are the same size', 'Yes: there are only three pairs'], ans: 0, no: [null, '3 and −3 are different outputs.', 'The number of pairs does not matter.'], why: 'Input 9 goes to two outputs, so it is not a function.' }
      ] },
    { name: 'The jackpot boss', boss: true, learn: ['Mixed machines. Look at the inputs every time.'],
      tasks: [
        { k: 'solve', q: 'Is *(−2, 4), (−1, 1), (0, 0), (1, 1), (2, 4)* a function?', start: '(−2, 4), (−1, 1), (0, 0), (1, 1), (2, 4)',
          moves: [
            { q: 'First move?', opts: ['List the inputs', 'List the outputs'], ans: 0, res: ['4, 1, 0, 1, 4', '−2, −1, 0, 1, 2'], rans: 1, hint: 'First numbers.' },
            { q: 'Next move?', opts: ['Look for a repeated output', 'Look for a repeated input'], ans: 1, res: ['1 and −1 are the same input', 'No input repeats'], rans: 1, hint: '−1 and 1 are different numbers.', no: { '0': 'Repeated outputs are fine. Check inputs.' } },
            { q: 'Decide.', opts: ['Decide and give the reason', 'Decide by the outputs'], ans: 0, res: ['A function: each input has one output', 'Not a function: 4 and 1 repeat'], rans: 0, no: { r1: 'Outputs can repeat.' }, why: 'Outputs 1 and 4 are shared, but no input has two outputs. It is a function.' }
          ] },
        { k: 'solve', q: 'A machine does *× 3, then − 2*. The output is *13*. Find the input.', start: 'output: 13',
          moves: [
            { q: 'What do you undo first?', opts: ['Undo × 3: divide by 3', 'Undo − 2: take away 2', 'Undo − 2: add 2'], ans: 2, res: ['13 − 2 = 11', '13 + 2 = 15', '13 ÷ 3'], rans: 1, hint: 'Backwards means the last step first.', no: { '0': 'Going backwards, undo the last step first: the − 2.', '1': 'The opposite of − 2 is + 2.' } },
            { q: 'Next?', opts: ['Undo × 3: times 3', 'Undo × 3: divide by 3'], ans: 1, res: ['input: 15 ÷ 3 = 5', 'input: 15 × 3 = 45', 'input: 15 − 3 = 12'], rans: 0, hint: 'The opposite of × 3 is ÷ 3.', no: { '0': 'Times undoes divide, not times.' }, why: 'Check: 5 × 3 = 15, 15 − 2 = 13. ✓' }
          ] },
        { k: 'fill', q: 'A new machine: *− 3, then halve*. Fill in the outputs.', head: ['input', 'output'], rows: [[5, { a: 1 }], [7, { a: 2 }], [11, { a: 4 }], [3, { a: 0 }]], hint: 'Take 3 away first, then take half. For 11: 8, then 4.', why: 'Each input gives one output: a function.' },
        { k: 'choice', q: 'Which table is *not* a function?', opts: ['x: 4, 5, 6 · y: 1, 2, 3', 'x: 1, 2, 3 · y: 5, 5, 5', 'x: 1, 2, 1 · y: 5, 6, 7', 'x: 0, 1, 2 · y: 2, 1, 0'], ans: 2, no: ['Each input here has one output.', 'Same output for every input is allowed.', null, 'Each input here has one output.'], why: 'Input 1 goes to 5 and to 7.' },
        { k: 'sort', q: 'Last check. Function or not?', bins: ['Function', 'Not a function'], cards: [{ t: 'time of day → beach temperature', b: 0, why: 'At one moment there is one temperature.' }, { t: 'temperature → time of day', b: 1, why: '30° can happen in the morning and in the afternoon.' }, { t: '(8, 1), (9, 1), (10, 2)', b: 0 }, { t: '6 → 2, 6 → 3', b: 1 }], why: 'One input, one output: function. One input, two outputs: not.' }
      ] }
  ]
});
