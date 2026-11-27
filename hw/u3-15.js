/* Homework: Unit 3 Lesson 15, Is the Model Good Enough? */
SFA_HW({
  id: 'g45', unit: 3, lesson: 15, topic: 'Is the model good enough?', title: 'Model Test Lab', who: 'marcus',
  intro: ['The arcade is planning a *summer gaming marathon*. Marcus wants to know two things: how long a controller battery lasts, and how hot it will be outside on each month of the marathon season.',
    'He has some real data. Build a model, test it, find where it breaks, and improve it when new data arrives.'],
  goal: 'Build a line model from data, find errors, say where the model breaks, and improve it with new data.',
  bigIdea: 'A model is good enough when its errors are small enough for what we need, inside a sensible domain, and we revise it when new data arrives.',
  levels: [
    { name: 'Errors', learn: ['A *model* is a simple rule that describes a real situation. It makes *predictions*.', '*Error = actual − predicted*.', 'Positive error: the model was too low. Negative error: too high.'],
      tasks: [
        { k: 'number', q: 'A model predicts *30*. The actual value is *33*. What is the error?', ans: 3, hint: 'Error = actual − predicted.', why: 'Error = 33 − 30 = 3.' },
        { k: 'choice', q: 'Same model: predicted 30, actual 33. Was the prediction too high or too low?', opts: ['Too low: the actual value is bigger', 'Too high: the actual value is bigger', 'Exactly right'], ans: 0,
          no: [null, 'The prediction (30) is below the actual (33). That is too low.', 'They are 3 apart.'], why: 'A positive error means the model guessed too low.' },
        { k: 'solve', q: 'Battery model: *B = −0.8t + 100* (% after t minutes). Predict t = 30, then find the error. The actual value was *77%*.', start: 'B = −0.8(30) + 100',
          moves: [
            { q: 'What first?', opts: ['Multiply −0.8 × 30', 'Add 30 + 100', 'Multiply 0.8 × 130'], ans: 0, res: ['B = −24 + 100', 'B = 24 + 100', 'B = −2.4 + 100'], rans: 0,
              hint: 'Multiply before you add.', no: { 1: 'Multiply before you add.', 2: 'Multiply −0.8 by 30 only, then add 100.', r1: 'Keep the sign: −0.8 × 30 is negative.', r2: '0.8 × 30 = 24 (8 × 3 = 24).' } },
            { q: 'Next move?', opts: ['Add −24 + 100', 'Subtract 100 − (−24)'], ans: 0, res: ['B = 76', 'B = 124', 'B = 86'], rans: 0,
              hint: '−24 + 100 is the same as 100 − 24.', no: { 1: 'It is −24 + 100: the same as 100 − 24.', r1: 'The battery cannot be above 100%. 100 − 24.', r2: '100 − 24 = 76.' } },
            { q: 'Find the error.', opts: ['Actual − predicted: 77 − 76', 'Predicted − actual: 76 − 77'], ans: 0, res: ['Error = 1', 'Error = −1', 'Error = 153'], rans: 0,
              hint: 'Error = actual − predicted.', no: { 1: 'Error is actual minus predicted.', r1: '77 − 76 is positive.', r2: 'Subtract, do not add.' }, why: 'Error 1: the model is 1% too low. Close!' }
          ] },
        { k: 'choice', q: 'Two models for the same data. Their errors: *A: 1, −2, 1, 0* and *B: 5, −6, 4, −3*. Which is good enough to plan with?', opts: ['Model A: its errors are small', 'Model B: its errors are big', 'Both are the same', 'Neither: a good model has no errors'], ans: 0,
          no: [null, 'Big errors mean bad predictions.', 'A\'s errors are all 2 or less. B\'s are up to 6.', 'Real data is never perfect. Small errors are fine.'], why: 'A is never more than 2 off. B can be 6 off.' }
      ] },
    { name: 'Build a rough model', learn: ['Pick two points *far apart*.', 'Rate = change in y ÷ change in x.', 'Then find the value at x = 0, and write y = mx + b.'],
      tasks: [
        { k: 'solve', q: 'Battery data: *(0, 100)* and *(40, 68)* (minutes, %). Build the model.', tab: { head: ['t (min)', '0', '10', '20', '30', '40'], rows: [['B (%)', 100, 92, 84, 77, 68]] }, start: 'Points (0, 100) and (40, 68)',
          moves: [
            { q: 'Find the rate.', opts: ['(68 − 100) ÷ (40 − 0)', '(40 − 0) ÷ (68 − 100)', '(68 + 100) ÷ 40'], ans: 0, res: ['rate = −32 ÷ 40', 'rate = 32 ÷ 40', 'rate = −32 ÷ −40'], rans: 0,
              hint: 'Change in y on top, change in x on the bottom.', no: { 1: 'That is upside down: change in y goes on top.', 2: 'Change means subtract.', r1: '68 − 100 is negative: the battery goes down.', r2: '40 − 0 is positive.' } },
            { q: 'Next move?', opts: ['Work out −32 ÷ 40', 'Work out 40 ÷ −32'], ans: 0, res: ['rate = −0.8 % per minute', 'rate = −8 % per minute', 'rate = 0.8 % per minute'], rans: 0,
              hint: '32 ÷ 40 = 0.8.', no: { 1: 'Keep the order: −32 ÷ 40.', r1: 'Check the decimal: 40 × 0.8 = 32.', r2: 'The battery goes down, so the rate is negative.' } },
            { q: 'Write the model.', opts: ['The value at t = 0 is 100', 'The value at t = 0 is 68'], ans: 0, res: ['B = −0.8t + 100', 'B = 100t − 0.8', 'B = −0.8t + 68'], rans: 0,
              hint: 'Look at the table: t = 0.', no: { 1: '68 is the value at t = 40.', r1: 'The rate goes with t.', r2: 'b is the value at t = 0: 100.' }, why: 'B = −0.8t + 100: start at 100%, lose 0.8% a minute.' }
          ] },
        { k: 'solve', q: 'Riyadh high temperatures: January (month 1) *20 °C*, May (month 5) *40 °C*. Build a line model for T.', tab: { head: ['Month m', '1', '2', '3', '4', '5'], rows: [['High T (°C)', 20, 23, 28, 33, 40]] }, start: 'Points (1, 20) and (5, 40)',
          moves: [
            { q: 'Find the rate.', opts: ['(40 − 20) ÷ (5 − 1)', '(5 − 1) ÷ (40 − 20)', '40 ÷ 5'], ans: 0, res: ['rate = 5 °C per month', 'rate = 4 °C per month', 'rate = 20 °C per month'], rans: 0,
              hint: 'Change in T ÷ change in months.', no: { 1: 'Change in y (temperature) goes on top.', 2: 'Use the change: subtract first.', r1: '20 ÷ 4 = 5.', r2: 'Divide 20 by the 4 months.' } },
            { q: 'Find the value at m = 0.', opts: ['Go back 1 month: 20 − 5', 'Go forward 1 month: 20 + 5', 'Use the first value, 20'], ans: 0, res: ['T(0) = 15', 'T(0) = 25', 'T(0) = 20'], rans: 0,
              hint: 'January is month 1. Month 0 is one step back.', no: { 1: 'Month 0 is before month 1: go back.', 2: '20 is the value at m = 1, not m = 0.', r1: 'Go back: subtract one rate.', r2: '20 is at m = 1.' } },
            { q: 'Write the model.', opts: ['Use rate 5 and start 15', 'Use rate 15 and start 5'], ans: 0, res: ['T = 5m + 15', 'T = 15m + 5', 'T = 5m + 20'], rans: 0,
              hint: 'T = rate × m + start.', no: { 1: 'The rate is 5 and the start is 15.', r1: 'The rate goes with m.', r2: 'The start (m = 0) is 15.' }, why: 'Check: m = 5 gives 25 + 15 = 40 ✓.' }
          ] },
        { k: 'fill', q: 'Test *T = 5m + 15* on the months we skipped. Model = the predicted value. Error = actual − predicted.', head: ['m', 'Actual', 'Model', 'Error'], rows: [[2, 23, { a: 25 }, { a: -2 }], [3, 28, { a: 30 }, { a: -2 }], [4, 33, { a: 35 }, { a: -2 }]],
          hint: 'Predicted = 5 × m + 15. Then actual − predicted.', why: 'All three errors are −2: the model is always 2 °C too high.' },
        { k: 'choice', q: 'The errors are all *−2*. How should Marcus improve the model?', opts: ['Lower the start by 2: T = 5m + 13', 'Raise the start by 2: T = 5m + 17', 'Change the rate to 3', 'Keep it: errors do not matter'], ans: 0,
          no: [null, 'Negative errors mean the model is too high. Go down.', 'The errors are all the same, so the rate is fine. Move the start.', '2 °C every time is easy to fix.'], why: 'The model is 2 too high every time, so move the whole line down 2.' }
      ] },
    { name: 'New data arrives', learn: ['If all the errors have the same sign, the model is off in one direction: shift it.', 'Then test the new model on *new data*.'],
      tasks: [
        { k: 'number', q: 'Improved model: *T = 5m + 13*. Predict *June* (m = 6).', ans: 43, unit: '°C', hint: '5 × 6 + 13.', why: 'T = 30 + 13 = 43 °C. June\'s actual high was 43 °C: error 0!' },
        { k: 'number', q: 'July (m = 7): the model predicts *48 °C*. The actual high was *44 °C*. What is the error?', ans: -4, unit: '°C', hint: 'Error = actual − predicted = 44 − 48.', why: 'Error = −4: the model is now too high. The heat is levelling off.' },
        { k: 'choice', q: 'The model *T = 5m + 13* predicts *73 °C* for December (m = 12). Is that sensible?', opts: ['No: it gets cooler after summer', 'Yes: the model says so', 'Yes: it gets hotter every month', 'No: it should be 78 °C'], ans: 0,
          no: [null, 'A model can give silly answers outside its data.', 'Riyadh is cooler in winter.', 'Any answer this hot is not sensible for December.'], why: 'The model only fits January to June. After that, temperatures fall: a straight line breaks.' },
        { k: 'solve', q: 'When does the battery model *B = −0.8t + 100* reach *0%*?', start: '−0.8t + 100 = 0',
          moves: [
            { q: 'First move?', opts: ['Subtract 100 from both sides', 'Add 100 to both sides', 'Divide both sides by 100'], ans: 0, res: ['−0.8t = −100', '−0.8t = 100', '0.8t = −100'], rans: 0,
              hint: 'Undo the + 100 first, on both sides.', no: { 1: 'Undo + 100 with − 100.', 2: 'Undo the adding first.', r1: '0 − 100 = −100.', r2: 'The left side is still −0.8t.' } },
            { q: 'Next move?', opts: ['Divide both sides by −0.8', 'Multiply both sides by −0.8'], ans: 0, res: ['t = 125', 't = −125', 't = 80'], rans: 0,
              hint: 'Undo × (−0.8) with ÷ (−0.8).', no: { 1: 'Undo multiplying with dividing.', r1: 'Negative ÷ negative is positive.', r2: '100 ÷ 0.8 is more than 100.' }, why: 'After 125 minutes the model gives negative %: it breaks there.' }
          ] }
      ] },
    { name: 'Where does it break?', learn: ['Most models only work for *part* of the inputs: a limited domain.', 'Ask: does this prediction make sense in the real world?'],
      tasks: [
        { k: 'sort', q: 'Is each prediction *sensible* or *not sensible*?', bins: ['✓ Sensible', '✗ Not sensible'],
          cards: [{ t: 'Battery at t = 60: 52%', b: 0 }, { t: 'Battery at t = 150: −20%', b: 1, why: 'A battery cannot go below 0%.' }, { t: 'Plant at week 4: 17 cm', b: 0 },
            { t: 'Plant at week 100: 305 cm', b: 1, why: 'A 3 metre plant is not likely. Plants stop growing.' }, { t: 'May high temperature: 38 °C', b: 0 }, { t: 'December high: 73 °C', b: 1, why: 'Nowhere is that hot in December.' }] },
        { k: 'number', q: 'New battery data at *t = 50*: actual *58%*. The model *B = −0.8t + 100* is the line. What is the error at t = 50?',
          fig: { range: [0, 60], yrange: [0, 110], step: 10, ystep: 10, lines: [{ m: -0.8, b: 100 }], pts: [[0, 100], [10, 92], [20, 84], [30, 77], [40, 68], [50, 58]], x: 't', y: 'B' }, ans: -2,
          hint: 'Predicted: −0.8 × 50 + 100 = 60. Then actual − predicted.', why: '58 − 60 = −2: the battery drains a little faster near the end.' },
        { k: 'choice', q: 'Model A has errors *3, 3, 4, 3*. How could you improve it?', opts: ['Raise its start value by about 3', 'Lower its start value by about 3', 'Make it steeper', 'Nothing can be done'], ans: 0,
          no: [null, 'Positive errors mean the model is too low. Go up.', 'The errors are about the same each time, so the slope is fine.', 'Errors all the same size are easy to fix.'], why: 'Actual is about 3 more than predicted every time, so move the line up 3.' },
        { k: 'solve', q: 'Plant model: *h = 3w + 5* cm after w weeks. When would it reach *2 metres* (200 cm)?', start: '3w + 5 = 200',
          moves: [
            { q: 'First move?', opts: ['Subtract 5 from both sides', 'Divide both sides by 3', 'Add 5 to both sides'], ans: 0, res: ['3w = 195', '3w = 205', 'w + 5 = 200'], rans: 0,
              hint: 'Undo the + 5 first.', no: { 1: 'Undo the + 5 before you divide.', 2: 'Undo + 5 with − 5.', r1: '200 − 5 = 195.', r2: 'The 3 is still with w.' } },
            { q: 'Next move?', opts: ['Divide both sides by 3', 'Subtract 3 from both sides'], ans: 0, res: ['w = 65', 'w = 192', 'w = 585'], rans: 0,
              hint: 'Undo × 3 with ÷ 3.', no: { 1: '3w means 3 times w. Undo it by dividing.', r1: '195 ÷ 3 = 65.', r2: 'That is 195 × 3. Divide.' }, why: 'Week 65 is more than a year! The plant will probably stop growing first: the model breaks.' }
          ] }
      ] },
    { name: 'The marathon boss', boss: true, learn: ['Build, test, judge, improve. Fewer hints this time.'],
      tasks: [
        { k: 'solve', q: 'A new controller battery: *(0, 90)* and *(20, 70)* (minutes, %). Build the model, predict t = 50, then find the error. The actual value was *45%*.', start: 'Points (0, 90) and (20, 70)',
          moves: [
            { q: 'Find the rate.', opts: ['(70 − 90) ÷ (20 − 0)', '(20 − 0) ÷ (70 − 90)'], ans: 0, res: ['rate = −1 % per minute', 'rate = 1 % per minute', 'rate = −20 % per minute'], rans: 0 },
            { q: 'Write the model.', opts: ['Start value 90 at t = 0', 'Start value 70'], ans: 0, res: ['B = −t + 90', 'B = 90t − 1', 'B = −t + 70'], rans: 0 },
            { q: 'Predict t = 50.', opts: ['Put 50 into the model', 'Take 50 from 70'], ans: 0, res: ['B = −50 + 90 = 40', 'B = 50 + 90 = 140', 'B = −50 + 90 = 30'], rans: 0 },
            { q: 'Find the error.', opts: ['45 − 40', '40 − 45'], ans: 0, res: ['Error = 5: the model is too low', 'Error = −5: the model is too high'], rans: 0, why: 'The battery lasts a bit longer than the model says.' }
          ] },
        { k: 'number', q: 'Same model *B = −t + 90*. When does it predict *0%*?', ans: 90, unit: 'minutes', why: '−t + 90 = 0, so t = 90 minutes.' },
        { k: 'fill', q: 'Test *T = 5m + 13* on months 1, 3 and 5. Model = the predicted value. Error = actual − predicted.', head: ['m', 'Actual', 'Model', 'Error'], rows: [[1, 20, { a: 18 }, { a: 2 }], [3, 28, { a: 28 }, { a: 0 }], [5, 40, { a: 38 }, { a: 2 }]],
          hint: 'Predicted = 5m + 13.', why: 'Errors 2, 0, 2: small. Good enough to plan the marathon.' },
        { k: 'choice', q: 'What makes a model *good enough*?', opts: ['Small errors for what we need, in a sensible domain', 'It must have no errors at all', 'It must work for every possible input', 'It must be a straight line'], ans: 0,
          no: [null, 'Real data is never perfect. Small errors are fine.', 'Most models only work for part of the inputs.', 'Some data is curved. The shape should fit the data.'], why: 'Good enough depends on what we need it for, and where we use it.' }
      ] }
  ]
});
