# Homework Arcade data files

`hw.html?g=u3-04` plays `hw/u3-04.js`. Each file calls `SFA_HW({...})`; the engine is `hw.js` (task kinds are listed at
its top). Game ids: Unit 3 lesson n = `g3n` written as g31 … g45 (lesson 1 → g31, lesson 15 → g45); Unit 4 lesson n =
g61 … g75. The results script accepts any id g1-g99, so these save like the other games.

```js
SFA_HW({
  id: 'g34', unit: 3, lesson: 4, topic: 'Function notation', title: 'The Fare Machine', who: 'gus',   // who: gus, priya, marcus, zero, one
  intro: ['story paragraph', 'story paragraph'], goal: 'one line: what you will be able to do',
  bigIdea: 'the one sentence printed on the certificate',
  levels: [ { name, learn: ['reminder line', ...], tasks: [ ... ] }, ..., { name, boss: true, learn, tasks } ]
});
```

Check a file: `node hw-check.js hw/u3-04.js` (structure) then `node hw-check.js --browser hw/u3-04.js` (renders every task).
