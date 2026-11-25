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
| `mistake` | `id`, `q`, `lines` (a worked solution, one line each), `ans` (index of the first wrong line), optional `fix` (that line as it should be), `hint`, `why` | **Spot the mistake**: tap the first line that is wrong; they can try again |
| `order` | `id`, `q`, `steps` (in the right order; shown shuffled and lettered), optional `hint`, `why` | **Put the steps in order**: tap the steps one at a time, then check; right places turn green |
| `cross` | `id`, `q`, `opts`, `ans` (index of the one that stays), `why`, optional `reasons` (2-4 short reasons) with `because` (the reason index for each option) | **Cross it out**: cross out wrong options one at a time, credit for each; the class screen shows which are crossed out most |
| `odd` | `id`, `items` (four things), `why` (one true reason for each item, true for that item only), optional `q`, `note` | **Which one doesn't belong?** pick any one, then the reason that fits it; every item can be right |
| `asn` | `id`, `q` (a statement), `ans` (0 always, 1 sometimes, 2 never), `eg` (the follow-up prompt), `why`, optional `model`, `ph` | **Always, sometimes or never?** tap one, then type an example; examples show on the class screen without names |
| `est` | `id`, `q`, `lo`, `hi`, `step` (the slider), `ans`, optional `tol`, `near` (how close counts as a good estimate), `hint`, `why` | **Estimate first**: a slider guess, locked in, then the exact answer; the class screen shows how the estimates cluster |

The last six also take `help` and `more`. They save as the older kinds (`poll`, `open`, `number`), so the results script
needs no change. The Lane Clash and Boss Raid only draw their questions from `number` and `poll` slides.

`id`s are lower-case letters and digits, unique in the lesson, at most 16 characters.

## Hands-on kinds (sfa-ineq.js): graph, drag, sort, match, build

`sfa-ineq.js` (loaded after `sfa-lesson.js` on lesson.html and lesson-practice.html) adds seven kinds, used by the
inequality lessons (Inequalities 1 to 3, L29 to L31). Each one checks the answer on the student's device, says what to
fix, saves as an `open` answer with right or wrong, and has **Show answer** on the console. All take `id`, `q`, and
optional `kick` (the label above the question), `learn` (1 to 3 short teaching lines shown above the task), `help`, `why`.

| k | Fields | What students do |
|---|---|---|
| `nl` | `range` ([−6, 6]), `step` (1 or 0.5), `v` ('x'), `ans: { at, open, dir: 'l' or 'r' }` | Drag or tap the dot onto a number line, open or closed, shade left or right |
| `pick` | `where: 'line'` with `range`, `cond` ('2x + 1 > 5'), optional `cand`; or `where: 'plane'` with `range`, `cond` ('y < 2x − 1'), `cand: [[x, y], …]`, optional `line: { m, b, solid }` | Tap every solution. Wrong picks show the working: "2 > 2 ✗ false" |
| `sort` | `bins` (2 to 4 names), `cards: [{ t, b, why }]` (a card can be a picture: `{ nl: { at, open, dir } }`) | Drag cards into groups (or tap a card, then a group). Right ones lock green; `why` is the hint for a wrong one |
| `match` | `pairs: [[left, right, why], …]`; either side can be text or `{ nl: {…} }` or `{ plane: { m, b, op } }` | Drag each card onto its row |
| `build` | `tiles` (strings), `ans` (accepted answers, e.g. 'x≤-1'; the sides may be swapped), optional `fig: { nl: {…}, range }` or `{ plane: {…} }` | Tap tiles to write the inequality |
| `solve` | `start`, `moves: [{ q, opts, ans, res, rans, hint, why }]`, optional `graph: { range, at, open, dir }` | Pick each move, then its result; a wrong pick explains itself. Ends by graphing the answer |
| `plane` | `range`, `m`, `b` (or `vx` for x = …), `op` ('<', '<=', '>', '>='), `parts` (any of 'line', 'style', 'shade'; without 'line' the boundary is drawn) | Plot two points on the boundary, choose solid or dashed, tap a side to shade; 🧪 Test a point shows the working for any point |

On these kinds, `more` is **🔭 Go deeper**: up to three optional tasks of any of the kinds above (or `poll`, `number`,
`open`), each with `steps` (a worked solution). A student opens them after checking the slide's task once; a task allows
three tries (two for `number`), then shows the answer and the worked solution. They save as the slide id + x1 to x3.
Use `moves`, never `steps`, for a `solve` task's moves: in `more`, `steps` is the worked solution.

## Differentiation inside a slide: `help` and `more`

Any `poll`, `number`, `open` or `machine` slide (not `warm`, `conf` or `exit`) can carry:

- `help`: one first step for a student who is stuck, shown when they press **🪜 Help me start** before answering.
  `number` and `open` slides use their `hint` for this when there's no `help`.
- `more`: up to 3 extra questions, worked down one at a time by students who have already answered the slide's
  question, while the teacher keeps the class on the slide. `more[0]` is **★ Another one** (the same idea, new
  numbers or a new context), `more[1]` is **★★ Stretch** (one step deeper: backwards, a twist, explain or generalise),
  `more[2]` is **★★★ Challenge** (two ideas combined, a harder case, or a why question). The Under the Pond lessons
  (L21 to L24) give every question all three.

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

## The Floor Is Lava

A whole-class game from the console's games tray (sfa-stand.js; it was Stand on the Line). It needs nothing from the
lesson file: the lines and the inequalities are made up fresh each game, so it works in any lesson once the class can read
a line. Under the Pond: the grid is lava and only the points that satisfy the rule are safe.

- **Lobby (16 s).** The floor on the class screen, every avatar milling about, and the scoring table.
- **Line rounds (3 to 10, 10 to 60 s each).** The Voice gives a line and each student taps a point on their own device, or
  types one (1.5, 1/2, −3/2 and 2 1/2 all work, so a fraction on the line is possible); their avatar walks there. The line is
  always given as a rule, never as points (a student could just stand on a given point). Forms, tick any:
  slope-intercept, standard form, point-slope, horizontal or vertical. Order: easiest first, as listed, or random. Slopes, tick any: positive whole,
  negative whole, zero, fractions, undefined. Grid −6 to 6 or −10 to 10. Every made-up line has at least six safe points
  on the grid and no line repeats. You can also type your own lines (two points, or a slope and a point, are shown to the class as y = …) (the panel draws each one and
  refuses one with fewer than four safe points); they come first. At the reveal the safe points rise as stepping stones,
  everyone on lava melts into a puddle and comes back as a ghost, and the working is shown in one line.
- **Inequality round (off, points only, or elimination).** Rules stack one at a time (slope-intercept, standard form,
  horizontal or vertical; strict, non-strict or both; 1 to 6 rules): solid boundary for ≤ and ≥ (safe), dashed for < and
  > (lava). The safe region cools to rock at the reveal and always keeps at least four safe points. In elimination,
  anyone still in who is on lava, or nowhere, melts and is out (a ghost who keeps scoring); from rule 4 two survivors on
  one point both go (a setting); if everyone still in would go, nobody does; it ends at three or fewer survivors.
- **Scoring, accuracy first.** Safe 100; speed up to +50, falling over the round and timed on the student's own device
  from when their page showed the round to their last tap, so a slow connection costs nothing; +25 for a safe point
  nobody else chose; then ×1.5 for a negative coordinate, ×2 for a fraction, ×3 for both. Lava or no answer 0. Each can be
  switched off. Every student sees their own breakdown after each round; the class screen shows the top movers.
- **Hint step.** Automatic (a student on nothing for two rounds gets it; two right with it and it switches off: "You're
  back on your own. Go."), for everyone, or off, and you can switch it on or off for one student from the list of who has
  not answered. Only that student sees it: "When x = 2, what is y?" with one worked first step for the harder forms, or
  "Is (1, 3) safe? Check: 3 > 1 + 1?" in the inequality round. A right answer puts them on a safe point for 60 points.
- **End.** A podium of the survivors (the top three by points without an elimination), then everyone by points. Class-game
  XP like the Boss Raid, which the Wardrobe turns into coins. report.html shows each student's lines right, inequality
  rounds safe and rounds with the hint step.

The console shows who has not answered, and has Pause, Time's up now, Skip round (not scored), End it now and the sound
switch for the class screen's sizzle. It survives a console reload, and late joiners get a place (as a ghost once an
elimination has begun). A lesson page that was open before this version went live keeps playing Stand on the Line
(sfa-stand-v1.js) and never mixes with it.

To try it without a class: `climb/dev/stand-sim.html` (the real console, class screen and three student pages with 27
pretend classmates on the practice backend) and `climb/dev/stand-test.html` (the maths over thousands of seeds).

## Figures (`fig`)

```js
fig: { kind: 'graph', x: [0, 10], y: [0, 20], xl: 'minutes', yl: 'litres',
       lines: [ { pts: [[0, 2], [6, 14]], dots: false }, { pts: [[1, 3], [2, 5], [3, 7]], dots: true, only: true } ] }
// a line through pts (dots: true marks each point; only: true draws just the dots)

fig: { kind: 'map', pairs: [[1, 4], [2, 4], [3, 9]] }        // mapping diagram, inputs left, outputs right
fig: { kind: 'table', head: ['x', 'y'], rows: [[0, 1], [1, 3], [2, 5]] }   // in/out table (any number of columns)
```
