# Switchback: series bible

A nine-film season (plus a short Film 0) that carries Units 2 to 4: linear equations and inequalities, functions and
graphing, linear systems. It is organised by readiness, not by calendar week. Each film opens one step of the plan,
and each unit ends in a gate check.

## Premise

Mr. Dunmore sends Marcus to Switchback, a mountain town built around a cable-car line, for work experience as a
trainee operator. Marcus cares about one thing: the summit station is said to have a vending machine holding the last
pudding in the region. Nobody has reached the summit in eleven years. The summit span fails nine inspections, and each
film passes one.

## The world (canonical numbers)

Everything is counted from the town square, **Level 0**. Up is plus, the mine is minus.

- **The shaft lift** runs straight up and down at the Base: Lookout at Level 5, mine floor at Level -5. It is a
  vertical number line and is where signed change is taught.
- **The cable line** is measured in **posts** (x) and **levels** (y). Stations are unevenly spaced.

| Station | Post | Level | Span arriving | Slope |
|---|---|---|---|---|
| Base | 0 | 0 | | |
| Stitch Row (mid-station market) | 3 | 6 | Span 1, the Rise | 2 |
| Ridge End | 7 | 6 | Span 2, the Ridge | 0 |
| The Dip (later, the Crossing) | 9 | 2 | Span 3 | -2 |
| Summit | 14 | 12 | Span 4 | 2 |

- **The mine line** is known from two readings only: (post 2, level -1) and (post 6, level -3). Slope -1/2.
- **Three districts, one per unit:** the Rise (Unit 2), Stitch Row (Unit 3, crew jackets and patches, the vendors'
  quotes), the Crossing (Unit 4, where the rival line is built).

## Cast

| Id | Who | Voice | Notes |
|---|---|---|---|
| `marcus` | Trainee operator, the lead | as in `rewind/build.py` | Confident, wrong first, right second. |
| `pigeon` (cast key `doug`) | Doug, Safety Inspector | his own "Coo" | Only ever says "Coo." Ines understands him. |
| `ines` | Station master | en-IE-EmilyNeural, +14% | Deadpan. Logs everything. "Logged." |
| `tavi` | Junior mechanic, about 14 | en-GB-MaisieNeural, +10% | Few words. Fixes what trainees break. Explains the math. |
| `keith` | Goat, Assistant Station Manager | none (a bleat effect) | Outranks Marcus. Eats paperwork. |
| `anchor` | Chip Hartley, by phone | as in `build.py` | Takes Marcus's call once a film. |
| `dunmore` | Mr. Dunmore | as in `build.py` | Film 0 only. |
| later | Desmond (Stitch Row vendor, Films 5, 6, Gate B), Rex (Parallel Lines Ltd., Films 7 to 9) | to cast | |

The two new voices are in `VOICES` in `../rewind/build.py`. They were chosen from the voice list, not auditioned by ear: listen to Film 1 and swap them there if they sound wrong.

## Humor rules

1. **The wrong answer is the joke.** Marcus makes the real Grade 8 error with total confidence and the mountain
   delivers the consequence. No joke interrupts the math.
2. **Deadpan officialdom.** Forms, signs, logbooks. Everyone treats absurd things as routine.
3. **Marcus is never the dumb one.** His arithmetic is usually fine; his setup is wrong. He gets it right on the second
   try in every film, and by Unit 4 he catches other people's errors.
4. **No slang, no memes.** They date within a term.
5. **Animals have plain human names and job titles.** They never talk.

## Running jokes

| Joke | How it runs | Payoff |
|---|---|---|
| The goat pen | Every wrong answer lands Marcus in the goat pen. First time: "Why is it goats?" After that: "Why is it ALWAYS the goats?" It replaces the duck pond. | Film 9: his test point lands in the pen on purpose, and the pen is inside the safe zone. |
| Keith | Employee of the Month, every month. Approves paperwork by eating it. | Finale: Marcus wins. Keith eats the certificate. Doug files a report on Keith. |
| Doug's incident report | After each wrong move a stamped form appears: "Cause: (the error in plain words). Filed by D. Pigeon." The form names the misconception. | Film 9: the form reads "Cause: none." |
| Days since last incident | Doug resets the station sign with his beak after each error, even when it already says 0. | Film 6: it reaches 10, then the logbook restarts and Day 10 becomes Day 0. |
| The helmet | Each film's big idea is written on Marcus's helmet under "UP FIRST. THEN ACROSS." (from Rewind 1). It is the season's anchor chart. | Finale: he hands a blank helmet to the next trainee. |
| "Logged." | Ines writes down everything. Marcus's "Write that down. Somewhere official." now always gets "Logged." | Her logbook is the data in Films 1, 2, 4 and 6. |
| Chip's call-in | "Chip! It's Marcus. I'm calling from level six." "And how is the weather at level six?" The weather is the recap. | Finale: Chip takes a different caller. "Coo." "Caller, that is the headline." |
| The pudding | Marcus's only motive. Callback to the pudding his past self ate. | The summit machine: "One button, one pudding. It's a function." |
| Doug doesn't need the cable car | Marcus works out how to reach a station. Doug is already there. Ines: "It is, undeniably, a Doug." | Film 8: in the fog Doug needs Marcus's exact answer. Film 4: Doug is the input with two outputs. |
| Doug versus Keith | Rivals for Employee of the Month. Stares and paperwork only. | Finale, as above. |
| Parallel Lines Ltd. | Rex's slogan is "We'll never cross you." He can only shout across the valley. | Film 7: a third company turns out to be the same line under another name. |

## Film formula

1. **Cold open (20 s):** the incident sign and one deadpan exchange.
2. **Title card.**
3. **The job:** a task with a real consequence on the mountain.
4. **Marcus's confident wrong move** (the target misconception), preceded by a *pause point*.
5. **Goat pen, sign flip, Doug's report.**
6. **The fix** from Tavi or Ines, then **Marcus right on his own**, and Doug flies the answer out.
7. **Chip's call** about halfway: a one-line recap. In a long film (Film 1 runs about 7 minutes) this is the
   mid-film stop: the teacher pauses here for questions, and the lesson puts its first question slides between the
   two halves.
8. **A harder case** that Marcus does alone.
9. **Helmet line**, a tease for the next film, a title card with the big idea.
10. **Sting** (ten seconds, Doug or Keith), then the "to be continued" card.

**Pause points.** The teacher pauses before the wrong move and the class votes: "What will Doug write on the report?"
The pause points for each film are listed in its `meta.json` note.

## The season

| Film | Plan step | Marcus's wrong move | Helmet line |
|---|---|---|---|
| 0 Roll Call | Opening check (4 items) | none; he arrives | (blank) |
| 1 End Minus Start | U2.1 | Start minus end; counts table rows instead of dividing by the change in posts | End minus start. Level change over post change. |
| 2 Station Zero | U2.2 | Takes b from the first row when it isn't x = 0 | b is where x is zero. m is the change for each 1. |
| 3 Weight Limit | U2.3 | Doesn't flip when dividing by a negative | Divide by a negative, flip the sign. |
| Gate A: The Last Car Down | U2 transition check | (class check, presented as Doug's inspection) | |
| 4 One Ticket, One Stop | U3.1 | Calls two tickets to one stop "broken" | One input, one output. Outputs can repeat. |
| 5 The Honest Quote | U3.2 | "It goes up, so it's linear" | Linear means the same change every step. |
| 6 Day Ten Is Day Zero | U3.3 | Treats a fee change as a per-patch change | A fee moves the start. A rate changes the step. |
| Gate B: Two Quotes | U3 transition check | | |
| 7 Where the Lines Meet | U4.1 | Checks the point in one equation only | A solution has to work in both. |
| 8 Exactly There | U4.2 | Adds when he should subtract, so nothing cancels | Pick the easy method. Check in both originals. |
| 9 The Safe Zone | U4.3 | Shades the wrong side; orders 2.5 gondolas | Test a point. Shade its side if it works. |

Film 9 mirrors Film 1: a new trainee makes Marcus's Film 1 error and Marcus corrects it from his helmet.

## Engagement around the films

- **Predict the report:** the pause-point vote above (a `poll` slide in the lesson).
- **The class owns the sign:** the hub map shows the class's own "lessons since we last missed a gate".
- **Stings:** every film has one after the big-idea card, so students stay to the end.
- **Lost Reels:** passing a gate unlocks a Switchback blooper in the existing `reels/` format.
- **Wardrobe and emotes:** Doug and Keith as pets, the inspector's clipboard, the scribbled helmet, a patch for every
  station passed, a goat emote for Lane Clash.
- **Crews:** the console forms temporary groups from a check's errors, then re-checks the same skill "on the other
  line" with new numbers or another representation.
- **Class games** (run from the lesson console, not tied to one film): Sumo Graphing, Lane Clash, Boss Raid for the
  gates, Climb as the check engine. Lane Clash and Boss Raid take their questions from the lesson's own `number` and
  `poll` slides and extras, so each Switchback lesson is its own topic pack; none of them has a Switchback skin yet.

## Arcade games

One arcade game per film, built like `g1` to `g17`: the student plays inside that film's scenes, drawn with the same
engine, using the film's own numbers, with the cast's voiced lines. Each has a low level, about six core levels that
follow the film's beats in order, three stretch levels, a hint ladder, a side panel that records the student's work,
and certificates signed by the cast. About 30 minutes. A game can only be locked once its film is scripted, so only
Film 1's is specified; the rest are outlines.

**Film 1: The Log Book** (scenes `shaft`, `profile`, `log`; numbers from the table in "The world")

| Level | Name | The student |
|---|---|---|
| L0 low | Up and Down | Counts the lift's steps on the number line and says which way. |
| L1 | The Shaft Lift | Sets the dial with end minus start: 4 to -2, then -2 to 3, then new pairs. |
| L2 | Which Way | Reads direction from the sign, with starts and ends on both sides of zero. |
| L3 | Span One | Rise and run from the graph, Base to Stitch Row: 6 / 3 = 2. |
| L4 | The Ridge and the Dip | Slopes of 0 and -2 from the graph. |
| L5 | Ines's Logbook | Posts 9, 10, 13, 14: divides each level change by its post change and finds 2 every time. |
| L6 | Two Readings | (2, -1) and (6, -3): -1/2, then again from the other end. |
| S1 stretch | File the Report | Plays Doug: reads a wrong working and picks the cause for the form. |
| S2 stretch | A Bent Cable | A log whose pairs of rows do not share a slope: shows it is not straight. |
| S3 stretch | The Missing Stop | Given the slope, fills in a level the storm wiped from the log. |

Certificates: **Winch Licence** (Ines: "Logged."), **Deputy Inspector** for S1 (Doug: "Coo."), **Employee of the
Week** for S2 and S3 (Keith; the certificate has a bite out of it).

**Films 2 to 9 (outlines)**

| Film | Game | Scene | Core ladder | Existing game it overlaps |
|---|---|---|---|---|
| 2 | Station Zero | winch room, `log` | Find m and b with units, match log, chart and rule, write the rule, justify "straight" | g12 Off the Edge, g13 Half a Rule |
| 3 | Weight Limit | loading dock, scales | Two-step equations, distribute and combine, equation or inequality from a load story, the flip, read a number line | g14 Three Roads (undoing only) |
| 4 | One Ticket, One Stop | ticket hall | Sort mappings, tables and graphs; repeated output; constant machine; f(x); domain and range | g2 Glitch Hunt, g8 Doug's Steps, g11 Name Them Back |
| 5 | The Honest Quote | Stitch Row stalls | Rate and start from a story, table, graph, two points; compare; Desmond's doubling price; where a quote makes sense | g6 Linear or Liar?, g7 Faster Than |
| 6 | Patch Shop | jacket stall, `log` | Fee change or rate change; Day 10 becomes Day 0; swap a table to test an inverse | none |
| 7 | Where the Lines Meet | the Crossing, `profile` | Graph both, estimate, check in both; one, none or every point | g14 Three Roads (one crossing) |
| 8 | Exactly There | the Crossing in fog | Choose substitution or elimination, solve, check in both originals | none |
| 9 | The Safe Zone | summit approach | Solid or dashed, test point (Doug), shade, overlap, whole cars only | none |

Films 2, 4 and 5 revisit skills that Sandy Flats games already teach, so their games should spend their core levels
on what is new in this plan (units of m and b, justifying linearity, the constant function, a changing rate) and link
the older game as the low level.

## Production notes

Films live in `switchback/f<n>/` as `beats.json`, `episode.js` and `meta.json`, in the format described in
`../README.md`. **Film 1 is built (7:52; Chip's call runs 3:24 to 3:48). Film 0 is a script only.**

The mountain's sets, props and new cast are drawn once, in `sfa-switchback.js` at the repo root, and shared by the
films and the arcade games. An `episode.js` pulls it in with the `__WORLD__` placeholder, which `build.py` fills.
Build a film with `python ../rewind/build.py ONEALONE.html f1 OUT.html REWIND.html` (the two films from the Cinema:
One Alone as the page shell, Rewind for Doug's "Coo").

Keith is not in a beat's `cast` (the engine draws every cast member as a person): place him with
`"set": {"keith": [x, facing, dy]}`. Scene state is cleared by every `scene` beat, so set it again after one.

Scenes and the `set` keys the scripts use:

| Scene | What it shows | `set` keys |
|---|---|---|
| `class` | Dunmore's classroom (as in the Rewind films) | |
| `base` | Level 0 station: desk, incident sign, Employee of the Month board | `sign` (number), `report` (`{cause, by}` or null), `board` (lines), `eotm` (true shows the board close up), `helmet` (lines) |
| `shaft` | The shaft lift as a vertical number line, -5 to 5 | `lift` (level), `mark` (target level), `panel` (lines) |
| `profile` | The line's graph: posts across, levels up | `pts` (`[post, level, label]`), `span` (`[from, to]` highlighted), `tris` (as in Rewind), `panel`, `board` |
| `log` | Ines's logbook as a table | `rows` (`[post, level]`), `steps` (true shows the change columns), `panel` |
| `pen` | The goat pen | |
| `news` | Chip's desk (as in the Rewind films) | `ticker`, `inset` |

Effects (`fx`): `lift` (`from`, `to`, `ok`), `ride` (`from`, `to`, in graph units), `launch` (the gondola thrown
clear), `goats` (landing in the pen), `signflip` (`to`: Doug resets the sign), `stamp` (the report), `fly` (`note`:
Doug carries the answer), `count` (`from`, `to`: steps along the number line), `eat` (Keith eats a form),
`grow_<id>` (a slope triangle). `bleat` (Film 0) is not drawn yet.
