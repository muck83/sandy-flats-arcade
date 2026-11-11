# Lesson slideshows

Each lesson is one file, `lessons/L<n>.js`, that calls `SFA_LESSON({...})`. The player is `lesson.html?l=<n>`
(students), `lesson.html?l=<n>&teach` (teacher console) and `lesson.html?l=<n>&screen` (the window the teacher
screen-shares). Answers go to the results Sheet's **Responses** tab through the arcade's Apps Script.

Lessons are 45-minute online lessons: students follow on their own device, the teacher screen-shares the class screen,
and the class answers polls and typed questions as they go.

## Lesson object

```js
SFA_LESSON({
  id: 'L1',                       // must match the file name
  n: 1,                           // lesson number shown to students (and the order lessons are listed in)
  label: 'Rewind 1',              // optional: shown instead of "Lesson n" (the Rewind arc uses n: 11.5)
  title: 'Crack the Fair',        // the game this lesson launches
  film: { n: 2, title: 'Zero 2: Sidekick', len: '5:41' },     // film number in the Sandy Flats Cinema
  game: { title: 'Crack the Fair', file: 'g1-crack-the-fair.html' },
  big: 'Two inputs can tell you a rule. One can\'t.',          // the one idea students should leave with
  slides: [ ... ]
});
```

## Slides

Every slide has `k` (kind) and `min` (planned minutes; the lesson's slides should add up to about 45).
Any slide may also have `fig` (a picture, see below). Text is plain; `*word*` makes **bold**, `_word_` makes italic.
Write for a Grade 8 student who doesn't want to do the math: short sentences, one idea per slide, always say what to do.

| k | Fields | What students do |
|---|---|---|
| `title` | `kicker`, `title`, `sub`, `art` (`'machine'`, `'film'`, `'game'` or one emoji) | nothing |
| `signin` | `title`, `points` (2-4 "today you will" lines) | sign in with their school account |
| `text` | `title`, `points` (2-5 short lines, they animate in one by one), optional `note` | read |
| `film` | `title`, `watch` (what to look for, one sentence), optional `cue` ("Start at 4:00") | watch on the teacher's shared screen (Cinema link as a backup) |
| `poll` | `id`, `q`, `opts` (2-5 short options), optional `ans` (index of the right option), `why` (shown when revealed), `warm: true` (the opening no-wrong-answer connection check) | tap one option |
| `open` | `id`, `q`, `ph` (placeholder), optional `hint`, `model` (an example answer the teacher can reveal) | type a sentence |
| `number` | `id`, `q`, `ans` (number), optional `tol`, `hint` (shown after a wrong try), `why` (shown when right) | type a number, auto-checked |
| `machine` | `id`, `name`, `rule` (e.g. `'2x+1'`, `'3x-2'`, `'x^2'`), `q` | feed numbers into an animated machine, then type its rule (auto-checked) |
| `conf` | `id`, `q` | pick 1 of 4 faces: lost / getting there / got it / could teach it |
| `play` | `title`, `steps` (3-4 lines), `aim` (one line: "Done when..."), `minutes` | open the game and play |
| `exit` | `id`, `q`, `ph`, optional `model` | the exit ticket: type an answer |
| `end` | `title`, optional `next` | see how many they answered |

`id`s are lower-case letters and digits, unique in the lesson, at most 16 characters.

## Differentiation inside a slide: `help` and `more`

Any `poll`, `number`, `open` or `machine` slide (not `warm`, `conf` or `exit`) can carry:

- `help`: one first step for a student who is stuck, shown when they press **🪜 Help me start** before answering.
  `number` and `open` slides use their `hint` for this when there's no `help`.
- `more`: up to 3 extra questions, worked down one at a time by students who have already answered the slide's
  question, while the teacher keeps the class on the slide. `more[0]` is **★ Another one** (the same idea, new
  numbers or a new context), `more[1]` is **★★ Stretch** (one step deeper: backwards, a twist, explain or generalise).

```js
more: [
  { k: 'number', q: '...', ans: 7, hint: 'shown after a wrong try', why: 'one line when right',
    steps: ['Worked solution, step 1', 'step 2', '...'] , fig: {...} },
  { k: 'poll', q: '...', opts: ['...', '...', '...'], ans: 1, why: '...', steps: [...] },
  { k: 'open', q: '...', ph: 'placeholder', model: 'one good answer', steps: [...] }
]
```

Every extra needs `steps`: a complete worked solution in 2-5 short lines, shown to the student as soon as they answer
(right or wrong), because the teacher won't have time to go over the extras with everyone. A `number` extra gives two
tries, then shows the answer. Extras save as the slide id + `x1`, `x2` and the console counts them on that slide.

## The Lane Clash

At the end of a lesson the console can start a 5-minute team battle (sfa-clash.js, rules in sfa-lanes.js). Its questions come from the lesson itself: every
`number` slide, every `poll` slide with an `ans` (not warm-ups), and every `number`/`poll` extra in `more`. So a lesson
with good extras has a good Clash.

## Stand on the Line

A whole-class game from the console's games tray (sfa-stand.js). It needs nothing from the lesson file: the lines and the
inequalities are made up fresh each game, so it works in any lesson once the class can read a line.

- **Lobby (10 s).** A grid from −6 to 6 on the class screen; every avatar mills about.
- **Line rounds (3 to 7, default 5; 15 to 40 s each, default 25).** The Voice gives a line and each student taps one
  lattice point on their own device; their avatar walks there on the class screen. The forms come in this order: an
  equation, a start and a step in words, a table with uneven x-steps, two points, a slope and one point (6 rounds: two
  points twice; 7: the table twice as well). Slopes are 0, ±1, ±2 and ±½, so every line has at least six lattice points on
  the grid; every game has a zero slope, a negative slope and exactly one ±½; no line repeats. On the line: 1 point. On a
  point of the line nobody else chose: 3 points. When time is up the line is drawn with one line of working.
- **Elimination (optional).** Inequalities stack one at a time: solid boundary for ≤ and ≥ (points on it are in), dashed
  for < and > (points on it are out). The region is shaded when time is up (or straight away, with the easier setting).
  Anyone still in who stands outside it, or nowhere, is butted off the grid by a goat. From the fourth rule, two survivors
  on one point both go. If everyone still in would go, nobody does. It ends at three or fewer survivors or after six
  rules. The region always keeps at least four lattice points. A correct point is 1 point for anyone, and eliminated
  students play on as ghosts.
- **End.** A podium of the survivors (the top three by points if there was no elimination), then everyone by points.
  Students earn class-game XP like the Boss Raid (10 a correct round, 15 for a point of their own, 30 for finishing, 30
  more for the podium), which the Wardrobe turns into coins.

The console shows who has not answered yet, and has Pause, Time's up now, Skip round (not scored), End it now. It
survives a console reload, and late joiners get a place (as a ghost once the elimination has begun).

To try it without a class: `climb/dev/stand-sim.html` (the real console, class screen and two student pages with 22
pretend classmates on the practice backend) and `climb/dev/stand-test.html` (the maths over thousands of seeds).

## Figures (`fig`)

```js
fig: { kind: 'graph', x: [0, 10], y: [0, 20], xl: 'minutes', yl: 'litres',
       lines: [ { pts: [[0, 2], [6, 14]], dots: false }, { pts: [[1, 3], [2, 5], [3, 7]], dots: true, only: true } ] }
// a line through pts (dots: true marks each point; only: true draws just the dots)

fig: { kind: 'map', pairs: [[1, 4], [2, 4], [3, 9]] }        // mapping diagram, inputs left, outputs right
fig: { kind: 'table', head: ['x', 'y'], rows: [[0, 1], [1, 3], [2, 5]] }   // in/out table (any number of columns)
```
