SFA_LESSON({
  id: 'L20', n: 11.7, label: 'Rewind 3', title: 'The Moment Before',
  film: { n: 'Rewind 3', title: 'The Moment Before', len: '5:18' },
  game: { title: 'Three Roads', file: 'g14-three-roads.html' },
  big: 'To solve a two-step equation, read it as a machine and undo it in reverse: last thing done, first thing undone. The opposite of + is −, of × is ÷. Then check by putting the answer back in.',
  slides: [
    { k: 'title', min: 1, kicker: 'Rewind 3', title: 'The Moment Before', sub: 'Five locks stand between the team and the second before Gus froze. Every lock is an equation.', art: '🔓' },
    { k: 'signin', min: 1, title: 'Before we start', points: ['Watch *The Moment Before*', 'Solve two-step equations by undoing', 'Check every answer', 'Answer a quick exit ticket'] },
    { k: 'poll', min: 1, id: 'warm', warm: true, q: 'You get dressed: socks, then shoes. To get undressed, what comes off first?', opts: ['Socks', 'Shoes', 'Both at once', 'I sleep in my shoes'] },
    { k: 'poll', min: 2, id: 'hook', q: 'Lock one says *3x + 4 = 25*. Marcus divides by 3 first and gets eight and a third. What should he undo first?',
      opts: ['Divide by 3', 'Take away 4', 'Add 4', 'Times by 3'], ans: 1,
      why: 'The machine did ×3 first, then +4. Undo in reverse: take away the 4 first (25 − 4 = 21), then divide by 3 (21 ÷ 3 = 7). Marcus undid them in the wrong order and landed at 8:20 pm, eight years ago.' },
    { k: 'film', min: 6, title: 'Watch: The Moment Before', watch: 'Watch the way back under each lock. Which step gets undone first, every time?' },
    { k: 'open', min: 2, id: 'canteen', q: 'Why did dividing by 3 first send Marcus to the wrong time?', ph: 'It was wrong because...',
      model: 'The 4 was added last, so it has to come off first. If you divide first, you\'re dividing the 4 as well, and you get 25 ÷ 3 instead of 21 ÷ 3.',
      help: 'Which happened last to x: the ×3 or the +4? That one gets undone first.' },
    { k: 'text', min: 1, title: 'How to solve by undoing', points: ['Read it as a machine: what happened to x, in order.', '*Undo in reverse*: last thing done, first thing undone.', 'The opposite of *+* is *−*. The opposite of *×* is *÷*.', '*Check*: put your answer back in. Does it give the right number?'] },
    { k: 'number', min: 3, id: 'lock2', q: 'Lock two: *5x − 6 = 19*. What is x?', ans: 5,
      hint: 'The last thing was − 6. Undo it: 19 + 6. Then undo × 5.', why: '19 + 6 = 25, then 25 ÷ 5 = 5. Check: 5 × 5 − 6 = 19. ✓',
      help: 'What was done last to x: × 5 or − 6? Undo that one first.',
      more: [
        { k: 'number', q: 'Solve *4x − 7 = 21*.', ans: 7, hint: '21 + 7, then ÷ 4.', why: '28 ÷ 4 = 7. Check: 4 × 7 − 7 = 21. ✓',
          steps: ['The last thing done was − 7. Undo it: 21 + 7 = 28.', 'Then undo × 4: 28 ÷ 4 = *7*.', 'Check: 4 × 7 − 7 = 28 − 7 = 21. ✓'] },
        { k: 'number', q: 'Solve *3x + 10 = 31*.', ans: 7, hint: '31 − 10, then ÷ 3.', why: '21 ÷ 3 = 7. Check: 3 × 7 + 10 = 31. ✓',
          steps: ['Undo + 10: 31 − 10 = 21.', 'Undo × 3: 21 ÷ 3 = *7*.', 'Check: 21 + 10 = 31. ✓'] }
      ] },
    { k: 'number', min: 3, id: 'lock3', q: 'Lock three: *x ÷ 2 + 3 = 10*. What is x?', ans: 14,
      hint: 'Undo + 3: 10 − 3. Then undo ÷ 2: times by 2.', why: '10 − 3 = 7, then 7 × 2 = 14. Check: 14 ÷ 2 + 3 = 10. ✓',
      help: 'The opposite of dividing by 2 is multiplying by 2. But first undo the + 3.',
      more: [
        { k: 'number', q: 'Solve *x ÷ 3 − 2 = 4*.', ans: 18, hint: '4 + 2, then × 3.', why: '6 × 3 = 18. Check: 18 ÷ 3 − 2 = 4. ✓',
          steps: ['Undo − 2: 4 + 2 = 6.', 'Undo ÷ 3: 6 × 3 = *18*.', 'Check: 18 ÷ 3 = 6, 6 − 2 = 4. ✓'] },
        { k: 'number', q: 'Solve *x ÷ 5 + 1 = 4*.', ans: 15, hint: '4 − 1, then × 5.', why: '3 × 5 = 15. Check: 15 ÷ 5 + 1 = 4. ✓',
          steps: ['Undo + 1: 4 − 1 = 3.', 'Undo ÷ 5: 3 × 5 = *15*.', 'Check: 15 ÷ 5 = 3, 3 + 1 = 4. ✓'] }
      ] },
    { k: 'number', min: 3, id: 'neg', q: 'Lock four: *2x + 9 = 3*. What is x? (Yes, it can be negative.)', ans: -3,
      hint: 'Undo + 9: 3 − 9. That goes below zero.', why: '3 − 9 = −6, then −6 ÷ 2 = −3. Check: 2 × (−3) + 9 = −6 + 9 = 3. ✓',
      help: 'Start with 3 − 9. Use a number line if it helps: from 3, go back 9.',
      more: [
        { k: 'number', q: 'Solve *4x + 20 = 8*.', ans: -3, hint: '8 − 20, then ÷ 4.', why: '−12 ÷ 4 = −3. Check: −12 + 20 = 8. ✓',
          steps: ['Undo + 20: 8 − 20 = −12.', 'Undo × 4: −12 ÷ 4 = *−3*.', 'Check: 4 × (−3) + 20 = −12 + 20 = 8. ✓'] },
        { k: 'number', q: 'Solve *3x − 5 = −17*.', ans: -4, hint: '−17 + 5, then ÷ 3.', why: '−12 ÷ 3 = −4. Check: −12 − 5 = −17. ✓',
          steps: ['Undo − 5: −17 + 5 = −12.', 'Undo × 3: −12 ÷ 3 = *−4*.', 'Check: 3 × (−4) − 5 = −12 − 5 = −17. ✓'] }
      ] },
    { k: 'poll', min: 2, id: 'first', q: 'For *7x − 4 = 31*, what do you undo *first*?', opts: ['÷ 7', '+ 4 (to undo the − 4)', '− 4', '× 7'], ans: 1,
      why: 'The last thing done to x was − 4, so undo it first by adding 4: 31 + 4 = 35. Then ÷ 7: x = 5.',
      help: 'Say the machine out loud: x, times 7, then take 4. Which came last?' },
    { k: 'poll', min: 2, id: 'check', q: 'Sam says *x = 6* solves *4x + 3 = 25*. Check it by putting 6 back in.', opts: ['Sam is right', 'Sam is wrong: it gives 27'], ans: 1,
      why: '4 × 6 + 3 = 24 + 3 = 27, not 25. The real answer: 25 − 3 = 22, 22 ÷ 4 = 5.5.',
      help: 'Work out 4 × 6 + 3. Is it 25?',
      more: [
        { k: 'number', q: 'Then what does solve *4x + 3 = 25*? (A decimal is fine.)', ans: 5.5, tol: 0.01, hint: '25 − 3, then ÷ 4.', why: '22 ÷ 4 = 5.5. Check: 4 × 5.5 + 3 = 22 + 3 = 25. ✓',
          steps: ['Undo + 3: 25 − 3 = 22.', 'Undo × 4: 22 ÷ 4 = *5.5*.', 'Check: 4 × 5.5 = 22, plus 3 is 25. ✓', 'Answers don\'t have to be whole numbers.'] }
      ] },
    { k: 'number', min: 3, id: 'words', q: 'The last lock: "The freeze came at second x. *Double it, add eleven*, and you get *twenty-five*." What is x?', ans: 7,
      hint: 'That\'s 2x + 11 = 25. Undo + 11, then undo × 2.', why: '25 − 11 = 14, 14 ÷ 2 = 7. Seven: Gus\'s favourite.',
      help: 'Write it as an equation first: double x is 2x, add eleven is + 11.',
      more: [
        { k: 'number', q: '*Triple a number, then take away 5*, and you get *22*. What is the number?', ans: 9, hint: '3x − 5 = 22.', why: '22 + 5 = 27, 27 ÷ 3 = 9.',
          steps: ['Write it: 3x − 5 = 22.', 'Undo − 5: 22 + 5 = 27.', 'Undo × 3: 27 ÷ 3 = *9*.', 'Check: 3 × 9 − 5 = 22. ✓'] },
        { k: 'open', q: '*Halve a number, then add 6*, and you get *10*. Write the equation, then solve it.', ph: 'The equation is... so x = ...', model: 'x ÷ 2 + 6 = 10. Undo + 6: 4. Undo ÷ 2: 8. So x = 8.',
          steps: ['Halve it: x ÷ 2. Then add 6: x ÷ 2 + 6 = 10.', 'Undo + 6: 10 − 6 = 4.', 'Undo ÷ 2: 4 × 2 = *8*.', 'Check: 8 ÷ 2 + 6 = 4 + 6 = 10. ✓'] }
      ] },
    { k: 'open', min: 2, id: 'why', q: 'Why do we undo the steps in *reverse* order? Use socks and shoes (or something else) to explain.', ph: 'We undo in reverse because...',
      model: 'You put socks on, then shoes. To get them off you take the shoes off first, because they went on last. Equations are the same: the last thing done to x is on the outside, so it comes off first.',
      help: 'Think about the warm-up. Why can\'t you take your socks off first?' },
    { k: 'conf', min: 1, id: 'conf', q: 'How do you feel about solving by undoing?' },
    { k: 'play', min: 7, title: 'Play Three Roads', steps: ['Open *Three Roads*.', 'Work each machine backwards: last thing done, first thing undone.', 'Check your answer before you lock it in.'], aim: 'Done when you\'ve cleared three levels.', minutes: 7 },
    { k: 'exit', min: 2, id: 'exit', q: 'Solve *6x − 8 = 34*. Show both undo steps, then check your answer.', ph: 'Undo − 8: ... Undo × 6: ... Check: ...',
      model: 'Undo − 8: 34 + 8 = 42. Undo × 6: 42 ÷ 6 = 7. Check: 6 × 7 − 8 = 42 − 8 = 34. ✓' },
    { k: 'end', title: 'Back to Day 26', next: 'Next: *Lesson 12: The Outer Machines*. Rules that aren\'t lines at all.' }
  ]
});
