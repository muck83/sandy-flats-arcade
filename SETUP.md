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
