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
  n: 1,                           // lesson number shown to students
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

## Figures (`fig`)

```js
fig: { kind: 'graph', x: [0, 10], y: [0, 20], xl: 'minutes', yl: 'litres',
       lines: [ { pts: [[0, 2], [6, 14]], dots: false }, { pts: [[1, 3], [2, 5], [3, 7]], dots: true, only: true } ] }
// a line through pts (dots: true marks each point; only: true draws just the dots)

fig: { kind: 'map', pairs: [[1, 4], [2, 4], [3, 9]] }        // mapping diagram, inputs left, outputs right
fig: { kind: 'table', head: ['x', 'y'], rows: [[0, 1], [1, 3], [2, 5]] }   // in/out table (any number of columns)
```
