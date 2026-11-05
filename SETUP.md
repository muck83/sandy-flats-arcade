# Sandy Flats Arcade: results setup (one time, about 10 minutes)

Do all of this signed in to your **aisr.org** Google account, not a personal one. When you're done, send Claude the two values from steps 5 and 6. Neither one is a secret.

## 1. Make the results Sheet
1. Create a new Google Sheet called **Sandy Flats Arcade Results**.
2. Open **Extensions → Apps Script**.
3. Delete what's in `Code.gs`, paste in everything from [backend/Code.gs](backend/Code.gs), then press Save.

## 2. Create the tabs and your teacher key
1. In the Apps Script toolbar, choose the function **setup**, then press **Run**.
2. Allow the permissions it asks for. It only touches this one Sheet.
3. Open **Execution log** and copy the **Teacher key**. You'll type it once on the Class Results page. Keep it private, because anyone who has it can see every result.

## 3. Add your students
In the Sheet's new **Roster** tab, add one row per student:

| sid | name | class | email | code |
|---|---|---|---|---|
| S014 | Aisha … | 8A | aisha…@aisr.org | *(leave blank)* |

- **sid:** use the same ID your student dashboard and QR handouts use. Results can then be matched to the dashboard later.
- **email:** this must be the student's exact school Google address. Students who aren't on the Roster can't sign in.

## 4. Script settings
In Apps Script, go to **Project Settings (⚙) → Script properties**. `setup` already created these; check that each one has the value below and edit any that don't:

| Property | Value |
|---|---|
| AUTH_MODE | `google` (an older copy of the script set this to `code`: change it, or every student sign-in fails) |
| DOMAIN | `aisr.org` |
| CLIENT_ID | the Client ID from step 6. Come back and paste it in once you've made it. |

## 5. Publish the script
1. Go to **Deploy → New deployment → Web app**.
2. Set **Execute as** to **Me** and **Who has access** to **Anyone**.

   "Anyone" only lets the arcade reach the script. Students still have to prove they're an aisr.org account on your Roster, and the Sheet itself stays private.

   If **Anyone** isn't offered because your school admin blocks it, tell Claude. The fallback is to host the arcade inside the script itself.
3. Copy the **Web app URL** (it ends in `/exec`). **Send this to Claude.**

## 6. Create the Google sign-in key
1. Go to <https://console.cloud.google.com> and create a project called **Sandy Flats Arcade**.
2. Open **APIs & Services → OAuth consent screen**. Choose user type **Internal**, use app name **Sandy Flats Arcade**, add your email, and save.
3. Open **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized JavaScript origins: `https://muck83.github.io`
4. Copy the **Client ID** (it ends in `.apps.googleusercontent.com`). **Send this to Claude.** Then paste it into the `CLIENT_ID` script property from step 4.

If Google Cloud says your school account can't create projects, tell Claude. Your IT admin may need to allow it, or we can switch to student codes.

## After setup
- **Students:** they go to the arcade link and press **Sign in with Google** on the front page. Their levels and certificates save as they play, follow them to any computer, and show on **My results**.
- **You:** open **Class results** at the bottom of the front page and enter the teacher key. You'll see the whole class at a glance, filter by class, see the latest activity and download a CSV. The raw data is always in the Sheet too.
- **Updating the script later:** paste the new `Code.gs`, save, then use **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. That keeps the same URL.
- **Editing the Roster:** the script remembers the roster for 5 minutes. After adding a student, wait 5 minutes, or run the function **clearRosterCache** once.

## Lesson slideshows (polls, typed answers, participation)

The slideshows (`lessons.html`) send students' answers to a new **Responses** tab, which is created the first time someone answers. They need the current `backend/Code.gs`:

1. In Apps Script, replace all of Code.gs with the new `backend/Code.gs` and save.
2. **Deploy > Manage deployments > Edit (pencil) > Version: New version > Deploy.** The web app URL stays the same.

Until then, the slides still work but answers stay on each student's computer and live mode is off.

- **You:** open `lessons.html?teach` (or **Lesson slideshows** on the teacher page). Open a lesson's **Console**, enter your teacher key, press **Open class screen** and share that window. Press **Go live** so students' devices follow your slides. "Keep everyone on my slide" (on by default) stops students moving ahead or back while you are live.
- **Students:** open `lessons.html` (or the link from **Copy student link**) and sign in on the second slide.
- **Participation:** `participation.html` shows every student's answers per lesson, with a CSV download.

## Climb: the linear functions check-in

Climb (`climb.html`) is a 12-minute adaptive check-in on the linear functions unit, run live from `climb-teacher.html`. Students sign in with the same student code as the arcade. It needs the current `backend/Code.gs`:

1. In Apps Script, replace all of Code.gs with the new `backend/Code.gs` and save.
2. **Deploy > Manage deployments > Edit (pencil) > Version: New version > Deploy.** The web app URL stays the same.

The **Climb** and **ClimbLog** tabs are created the first time a student saves. Until the script is updated, `climb.html` says Climb isn't switched on yet.

- **You:** open **Climb check-in** on the teacher page (or `climb-teacher.html`) and enter your teacher key. Before class, pick the class and press **Open the waiting room**, then press **Start** when most students are in: everyone gets a 10-second countdown and the same 12 minutes. **Pause all** freezes every clock (fire drill); **End now** stops everyone. Set a **focus skill** to the previous lesson's skill; tick **Open it for everyone** to give students who haven't reached it guided items on it. The **Time** column sets 1.5× or 2× time for students with that accommodation.
- **Flags:** a red **Check** flag means a skill was solved very fast, right after leaving the page, or after being idle. Ask for one item live, then press **✓ counts** or **✗ back**. **Stuck groups** lists students who missed the twin after an explanation and a guided try, grouped by misconception. The **Item report** shows the most-missed question with its most common wrong answer, and **Project to the class** shows it with no names.
- **Students:** open `climb.html` (or **Climb** in the top bar; it shows a red **Climb is open** link while a session is open). Leaving the page during a question swaps it for a new one, but only after 10 seconds on another tab (or minimised), or 30 seconds with the page still showing but something else in focus (a notification, the on-screen keyboard). Shorter trips keep the question and are only counted; after a short tab switch the student sees "Stay on this page". 3 swaps in a session means nothing more that day counts toward Secure. (Change the times with swapHidden and swapBlur in climb/core.js.)
- **Try it without the Sheet:** `climb/dev/student.html` and `climb/dev/teacher.html` run against a pretend results script kept in your browser (student codes `AAAAAA`, `BBBBBB`, `CCCCCC`; teacher key `test`). Open them in two tabs. `climb/test.html` checks every question template.
- **The ladder:** all 23 skills (F1, F2, the unit's skills 1-19, extension skills 20-21, which open only after the core skills). Question types include drag-the-point, slider builds, card sorts and mapping arrows. Review items use these hands-on formats when a skill has one, and from session 4 every Secure streak includes the skill's hands-on question. Context words like *fare* and *call-out fee* have a tap-to-see meaning.
- **Pace** on the dashboard estimates how many more sessions each student needs for the core ladder, from their recent rate. Students never see it.

## One class, no links to click: Climb → lesson → game

1. **Before class:** on the Climb dashboard, pick the class, the focus skill and **Then: Lesson N** (the lesson you're teaching today), then press **Open the waiting room**. Students on the arcade's front page or the lessons page are taken into Climb by themselves after a 5-second countdown (they can press *Stay here*). Anywhere else they see a red **Climb is open** link.
2. **Start:** press **Start** when most are in. Everyone gets the same 12 minutes (more with 1.5×/2× time).
3. **Into the lesson:** press **End Climb → Lesson N**. Climb ends for everyone, the lesson's console opens and goes live, and every student's page moves into the lesson within a few seconds, signed in and following your slide. Students who finished earlier wait on their Climb summary ("Next: Lesson N … opens by itself") and move then too. If you go live on the lesson without ending Climb, students still answering keep going until their own time is up, then move on.
4. **Into the game:** in the lesson console press **End → everyone plays [game]**. The lesson ends and students' pages open that lesson's game, signed in. (**End live lesson** still ends it without moving anyone.)

## Student day (teacher)

`day.html` (📅 **Student day** in the teacher bar, or 📅 beside a name on Class Results and in the Climb dashboard) shows one student's day in one timeline: Climb questions (open any one to see the exact question they got), lesson answers and focus-watch flags, and game levels and certificates. Tick Climb, Lessons and Arcade to choose what to see; the strip of days marks which days have activity; ◀ ▶ move between students; **Print** gives a clean copy for a meeting. Climb now also shows on **My Results**, the front page's results strip and as a sortable **Climb** column on **Class Results**.

All of this needs the current `backend/Code.gs` deployed as a new version.

## Climb and NWEA MAP Growth

- **Four more skills** fill the gaps against MAP Growth's "Use Functions to Model Relationships": 22 Function notation f(x) (Film 5), 23 Domain and range (Film 16), 24 Graph a line from its equation and intercepts (Films 7 and 10), 25 When two functions are equal / systems (Films 11 and 14). 129 questions in all.
- **Every question is tagged with Common Core standards**, and the Climb dashboard has a **By MAP area and standard** table: share of the class with those skills secure, this week's answers and % right, and the RIT range NWEA's MAP-to-Khan Academy correlation lists for each standard. **Download by student and MAP area (CSV)** gives skills secure per MAP area for each student, to set beside their MAP goal scores. Climb's growth score is not a RIT.
- **Each question has its own clock** (60-150 seconds) from how much there is to read and do; 1.5x/2x time and "Almost got it" still apply.
- These need the current `backend/Code.gs` deployed as a new version (the script now accepts skill numbers up to 29). Use APPS-SCRIPT-UPDATE-PROMPT.txt.

## ✋ Ask Mr. Crowell (questions during Climb)

- **Students:** the **✋ Ask Mr. Crowell** button at the top of a question, explanation or guided try sends their screen to you with their name and an optional note ("What are you stuck on?"). They stay on the page, so the question doesn't swap. While their hand is up the question's own clock stops (for up to 3 minutes; the 12-minute session clock keeps going). They see your reply at the top of their screen and can press **Lower my hand**. An answer given after asking is marked *asked* and can't count as "tested out".
- **You:** questions appear at the top of the Climb dashboard, oldest first, numbered in the order they were sent (#1, #2, …), with a chime and the count in the tab title. Each shows the question rebuilt exactly as the student sees it, with what they'd entered or dragged so far, plus the answer and working. Send a quick reply (*I'm coming over*, …) or type one; **✓ Done** takes it off the queue and lowers their hand. **All questions today, in order** lists every question with who sent it, when, their note, the status (Waiting, Done, Hand lowered), your reply and how long it took; **Screen** reopens any of them.
- Every question is also saved in the **ClimbAsk** tab of the Sheet (created by itself). Needs the current `backend/Code.gs` deployed as a new version.

## 📝 The check-in before Climb, and the Climb's length

- **Pick a check-in** from the menu on the Climb dashboard before **Open the waiting room**:
  - **Check-in: Lesson N only:** 4-5 questions on that lesson's skills (Lessons 1-14 and 16; Lessons 15 and 17 have no Climb questions of their own).
  - **Check-in: Lessons 1-N mixed:** one question from each lesson up to N. Past 8 lessons it takes 8 lessons spread across them (always including the latest), so it still fits 5 minutes.
- **Climb length:** the **Climb: N min** menu (5-30 minutes, 12 by default) sets how long the Climb runs. The check-in's 5 minutes come on top. Both menus remember your last choice.
- **Students:** everyone gets the same questions with the same numbers (answer choices shuffled per student), a 5-minute clock (1.5×/2× time applies), **Save and go on** and **Skip this one**, and no right or wrong shown. Leaving the page doesn't swap the question here; it's noted. The Ask button is off during the check-in. When they finish, or time runs out, they go straight into their Climb.
- **You:** the check-in card at the top of the dashboard shows each question's lesson, skill, % right, the most common wrong answer and **Project**; **By student** shows ✓ ✗ – ⏱ per question with a score. Check-in answers don't move anyone on the ladder, are logged in ClimbLog with mode *quiz*, and show on Student day.
- Needs the current `backend/Code.gs` deployed as a new version.

## 👁 See a student's screen during Climb

Press 👁 beside any name on the Climb dashboard. It shows that student's screen: which screen they're on (waiting, check-in, question, explanation, guided try, summary), the question rebuilt exactly, what they've typed, picked or dragged so far, the time left on their clock and how often they've left the page. While it's open their page reports every 3 seconds (normally every 8), so it stays about 3 seconds behind. Close it to stop. Students don't see anything change. Needs the current `backend/Code.gs` deployed as a new version.

## 🔠 The Big Board (an optional starter, any live lesson)

A class crossword that mixes hangman, Wheel of Fortune and a crossword. On the first slides of a live lesson the console offers **🔠 Start the Big Board**: pick a theme (⚡ Pokémon, ⚽ Sport and football, 🎮 Games and food, 📐 Maths words: unit vocabulary such as slope, intercept and domain, with student-friendly clues; 🦁 Animals, 🚀 Space, 🦸 Superheroes, 🍥 Anime, 🎵 Music, 🔬 Science lab, 🌍 Around the world, 🌊 Under the sea, 💻 Tech and the internet, 🏎️ Cars and racing. Each theme has 40 words, so a class of up to 36 gets a full board, and the console remembers the last theme picked) and a length (4, 6 or 8 minutes; 6 by default). Wait until students have joined: everyone with a row in the lesson gets their own word.

- **Students** see their word as blank tiles with its crossword clue. Each student starts with **five warm-ups** (times tables, a doubling machine, the output of a pair, a point on the y-axis and the like, in a different order for everyone) so the game opens with easy wins. After that, right answers to quick review questions (spiral review: number and multiple-choice questions, extras included, from the five lessons taught before this one) earn letter guesses; a vowel costs two, and three right in a row earns a bonus. They can type the whole word to solve it at any time. Every fifth miss gives a free letter, so nobody stays stuck.
- **Solved words** fill in on the class crossword with the solver's name, and their letters appear in gold, free, in every word that crosses them.
- **Helper mode:** once a student has found their word, every right answer earns a gift letter they can send to a classmate who is still looking (words that cross theirs are listed first). The classmate gets a gold letter and a "a classmate sent you a letter" message.
- **The class screen:** a banner for every word cracked ("⚡ Jane cracked 6 ACROSS: CHECK!") and every gift, a pulsing "3 WORDS TO GO!", a giant 10-second countdown at the end, and a mystery picture beside the board that uncovers as words are found. Sound effects (🔇/🔊 in the top bar) are off until someone turns them on.
- **Every word found:** the whole class gets a celebration (names, the Sandy Flats cast, confetti) on every screen.
- **The console** shows time left, words found, and who is stuck (letters showing out of the word's length); **👁 Show the board**, **⏰ +1 minute**, **End it now** and **Back to the lesson**. Students who join late get a spare word (or share one if none are left) and start with 3 bonus letter guesses; in the last minute no new words are handed out, and latecomers become helpers straight away, sending gift letters to classmates. If you reload the console mid-game, it picks up the same board and who has which word.
- Progress saves as the answer `zboardx1`, which the results script treats as a go-further extra, so it never counts as a lesson answer or in participation.

## 👹 Boss Raid (an optional review or exit ticket, any live lesson)

The whole class against one giant boss on the class screen. The console offers it on the first slides of a live lesson (set to review) and on the exit ticket and last slides (set to exit ticket); press **👹 Start the Boss Raid**. The first menu picks the questions:

- **📚 Review**: number and multiple-choice questions (extras included) from the five lessons before this one, after three easy warm-ups.
- **🎟️ Exit ticket**: this lesson's own questions, the core ones first and then the ★ ones. Each student's first try at each question is recorded.

Pick a boss (🤖 Glitch Golem, 🐉 The Nonlinear Hydra, 🫧 Mega Slime, 🦑 Void Kraken, or random) and a length (4, 6 or 8 minutes; 6 by default). Go live and wait for students to join first, because the boss's health is set by how many are here (about 130 HP per student for 6 minutes). Students who arrive in the first half make it a little tougher.

- **Attacking:** a right answer hits for 10 (5 on a second try), double for a streak of three or more, and half as much again for ★ questions. Every hit shows on the class screen with the student's name.
- **Boss attacks:** about every 80 seconds (sooner in its last stand) the boss charges. The same question appears on every screen for 20 seconds. If 70% of the answers are right, the class blocks it and everyone who got it right counter-attacks for 25. If not, the boss heals 10%. The class screen then shows the right answer and why. **⚠️ Boss attack now** on the console fires one whenever you like.
- **Phases:** at half health the boss is enraged, and at a fifth it makes its last stand; it looks angrier each time.
- **The end:** bring it to zero for a big win with an MVP podium. If time runs out it gets away, with its health left on screen. Every student sees their own damage, and in exit-ticket mode also their score ("5 of 6 right first time").
- **On the console:** health, raiders and each boss attack's result (with the question). Below that, every student's first-try score, lowest first (🟢 80%+, 🟡 50%+, 🔴 below), and the questions the class found hardest. **📋 Copy results** puts it all on the clipboard to paste into a spreadsheet. The console picks the raid back up if it's reloaded.

One game at a time: the Big Board, the Boss Raid and the Lane Clash don't run together.

## ⏪ The Rewind arc (catch-up before Lesson 12)

Lesson 12 leans on slope, graphing lines and solving. The Rewind arc revisits them inside the story: Gus is frozen mid-word after *The Undoer*, and the team rides Effie's Rewinder back through time to hear the rest of his sentence. Each Rewind is a full lesson with its own film, listed between Lesson 11 and Lesson 12.

- **Rewind 1: Rewind** (`lesson.html?l=18`, film *Rewind* in the Cinema): slope as rise over run from any two points, walking a line backwards, falling lines and negative slope, slope from coordinates and tables (same order, top and bottom). Game: *Scorch Marks*.
- **Rewind 2: The Line Home** (`lesson.html?l=19`, film *The Line Home*): graphing y = mx + b from start (where x is 0) and step, negative and fraction steps, where a line meets the floor, testing whether a point is on a line, and writing the rule from two points. Game: *Half a Rule*.
- **Rewind 3: The Moment Before** (`lesson.html?l=20`, film *The Moment Before*): solving two-step equations by undoing in reverse (last thing done, first thing undone), with subtraction, division and negative answers, word problems, and checking by putting the answer back in. The team finally hears Gus's sentence ("It's going to rain") and leaves a crack in his frost, which is why he can whisper hints in the later films. Game: *Three Roads*.
- Film sources are in `cinema-src/` (see its README).

## Lessons: going further on each slide, and the Clash

- **🪜 Help me start / ⭐ Go further:** every question slide after the opening hook has a first step for students who are stuck (**🪜 Help me start**, before they answer) and two extra questions for students who finish early: **★ Another one** (the same idea, new numbers) and **★★ Stretch** (one step deeper). Students work down them while you stay on the slide; your slide lock still keeps the class together and nothing moves the deck. Every extra shows a full worked solution as soon as it's answered, right or wrong, so no one waits for you. Number extras give two tries. In the console, each slide shows **⭐ Going further: ★ n tried, n right · ★★ …** (with names when only a few). Extras save to the Sheet as the slide id + x1/x2. 230 extras across the 17 lessons; to change them, edit `more` on a slide (format in `lessons/README.md`).
- **⚔️ Lane Clash (optional, at the end of a lesson):** Plants vs Zombies, team against team, with the Sandy Flats characters. On the exit-ticket or end slide the console offers **Start a Lane Clash** (you must be live). The console deals out two fair teams balanced on today's live lesson (answers, go-further extras and machines probed, half credit for being right, a bump for anyone active in the last 10 minutes; equal numbers taking part, then swapped until the strengths match; the console shows each team's strength), 30 seconds of rules as banners on every screen (Skip the rules starts it early), and every student's page and the class screen switch to the battle: 5 minutes, 5 lanes, each team's gold vault at its end.
  - **Earning:** only by answering this lesson's questions: 3 coins (★★ questions 4), +2 every three in a row, +1 on a streak of 5+, 1 coin on a second try; a wrong answer pauses for 5 seconds. A team that falls behind gets a ⚡ comeback coin on every right answer and tougher characters.
  - **Rewards for hard work:** every 3 right answers is a hero level: characters 12% stronger and new ones unlocked (Rental Rita and Priya at Lv 2, One and Zero at Lv 3, Maximus Million and Mr. Dunmore at Lv 4, The Undefined at Lv 5). **Good lesson participation starts a student with more coins (up to 10) and up to 2 hero levels.** Students' own characters glow with a YOU tag and level stars; hero levels 4 and 5 get a class-wide shout-out; MVPs at the end.
  - **The characters (seed-packet cards with cooldowns; a right answer earns 3 coins):** attackers Gus (3 coins, grabs 8 gold), Rental Rita (5, speedy courier, 16), One (9, superhero, double damage to defenders, 24), Maximus Million (16, giant, 50), The Undefined (24, boss, 90); defenders Pea Pigeon (5, shooter), Squaring Sam (6, wall), Priya (11, long-range sharpshooter), Mr. Dunmore (14, fortress wall); Zero (9, rolls down a lane erasing every enemy). The better ones cost more and grab more gold per coin, so saving up pays. Pick a card, then a lane. Each lane has three planting spots per team.
  - **Mux** guards each lane at each fort: the first enemy to reach a gate sets him charging. He hits every attacker in your half of the lane for 400 and knocks them back, so small attackers are flattened but a giant or The Undefined survives, battered (send something small first). He parks again 90 s later.
  - **Catch-up:** a team behind (25 gold and 20%) gets a bonus coin per right answer, 25% tougher characters, half as much gold again on every grab and a faster Mux; far behind (60 gold and 40%), two coins, 50% tougher, double gold and Mux three times as fast. One grab is at most 160 gold.
  - **Mux the Machine** guards each lane at each vault like a lawnmower: the first attacker to reach it sends Mux charging through your half of the lane; he parks again 90 seconds later.
  - **Waves:** a wave meter across the top, "a wave is coming" at halfway, and the **final wave** in the last minute: everyone faster, double gold (triple for the team behind).
  - **Built for the delay:** everything placed waits 8 seconds in its gate (you see the countdown), the console referees and sends the board out every second, and every screen plays the battle forward smoothly in between. The console shows the time, gold, how many characters are on the board, the teams and the top heroes, with **End the battle now** and **Back to the lesson**. No script update needed.
  - **Time:** pick 3, 5 or 8 minutes before **Start a Lane Clash**; during the battle **⏰ +1 minute** adds a minute (everyone sees "+1 MINUTE!", and the final wave moves with it). Longer battles are closer: in playtests 8-minute battles were close 7 times in 10.
  - **Teamwork:** each lane button has a 📣: it calls the student's team for help in that lane ("📣 AISHA: Help in lane 2!").
  - **The end:** the winner, both teams' MVPs and five awards, each to a different student where possible: 💰 Gold Grabber, 🧠 Brain Box (most right), 🔥 On Fire (longest streak), 🛡️ Wall Builder (most defenders), 🦸 Top Hero (highest level).
  - **The class screen** shows a live Top Heroes board under the battle. Sound effects are off until someone presses 🔇 (per device).
  - Balance was tuned over 70 simulated battles with bot classes of different abilities and strategies: no side advantage, smart lane choices beat random spamming, and about 4 in 10 battles change leader in the final wave.
- **Playtest the balance:** `climb/dev/clash-playtest.html` runs 70 bot battles with the real rules and reports fairness and intensity.
- **Try it without the Sheet:** `lesson-practice.html?l=13&teach` (teacher key `test`) and `lesson-practice.html?l=13` (student codes `AAAAAA`, `BBBBBB`, `CCCCCC`) in two tabs.

## Making phone and AI look-ups harder (and visible)

No question that shows its information on screen can be made photo-proof (and the text must stay readable for Listen and screen readers), so the aim is to make looking things up slower, less rewarding and visible to you:

- **Check-in: each student's own numbers.** Everyone gets the same questions, each with different numbers, so one student's answers (or a photo of their screen) are no use to anyone else. The results card groups wrong answers by the *mistake* behind them, and **Project** shows one version of the question.
- **Every check-in has a hands-on question** (drag a point, slide, sort or draw arrows), apart from Lesson 2's (its skill has none yet). A phone can say what to do, but the student still has to do it.
- **Machines don't give their rule away.** The five machines whose rule appeared on an earlier slide (Lessons 2, 11, 13, 14 and 15) are now "twins" with their own rule, so students have to probe them.
- **📱? hint (the phone pattern).** A right answer a few seconds after a long still stretch (15 s with nothing typed, clicked, scrolled or moved; in lessons counted from the student's first touch of the slide, so listening to you doesn't count). Thinking looks like this too, so it only shows when it keeps happening: in **Climb**, a 📱? pill in the Flags column after 3 in a session (check-in cells show a small dot); in the **lesson console**, in "Check these answers" after 3 in a lesson. Ask the student to explain one.
- **Effort counts more than being right** in the Lane Clash lesson bonus: answering, go-further extras and machines probed (2+ inputs) count in full; right answers count half.
