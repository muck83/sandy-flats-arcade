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

## Figures (`fig`)

```js
fig: { kind: 'graph', x: [0, 10], y: [0, 20], xl: 'minutes', yl: 'litres',
       lines: [ { pts: [[0, 2], [6, 14]], dots: false }, { pts: [[1, 3], [2, 5], [3, 7]], dots: true, only: true } ] }
// a line through pts (dots: true marks each point; only: true draws just the dots)

fig: { kind: 'map', pairs: [[1, 4], [2, 4], [3, 9]] }        // mapping diagram, inputs left, outputs right
fig: { kind: 'table', head: ['x', 'y'], rows: [[0, 1], [1, 3], [2, 5]] }   // in/out table (any number of columns)
```
