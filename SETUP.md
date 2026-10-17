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
- **Students:** open `climb.html` (or **Climb** in the top bar; it shows a red **Climb is open** link while a session is open). Leaving the page during a question swaps it for a new one; 3 leaves in a session means nothing more that day counts toward Secure.
- **Try it without the Sheet:** `climb/dev/student.html` and `climb/dev/teacher.html` run against a pretend results script kept in your browser (student codes `AAAAAA`, `BBBBBB`, `CCCCCC`; teacher key `test`). Open them in two tabs. `climb/test.html` checks every question template.
- **The ladder:** all 23 skills (F1, F2, the unit's skills 1-19, extension skills 20-21, which open only after the core skills). Question types include drag-the-point, slider builds, card sorts and mapping arrows. Review items use these hands-on formats when a skill has one, and from session 4 every Secure streak includes the skill's hands-on question. Context words like *fare* and *call-out fee* have a tap-to-see meaning.
- **Pace** on the dashboard estimates how many more sessions each student needs for the core ladder, from their recent rate. Students never see it.
