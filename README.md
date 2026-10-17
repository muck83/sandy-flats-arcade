# Sandy Flats Arcade

Grade 8 function games from the Undefined Saga (Zero, One, Gus, Priya, Marcus).

- **Play:** https://muck83.github.io/sandy-flats-arcade/
- **My results (students):** `results.html`
- **Class results (teacher):** `class.html`
- **Climb, the linear functions check-in:** `climb.html` (students), `climb-teacher.html` (teacher). Question bank and engine in `climb/`.
- **Results setup (one time):** [SETUP.md](SETUP.md)

Student results are stored in a Google Sheet owned by the teacher, through the Apps Script in [backend/Code.gs](backend/Code.gs). No student data lives in this repository. `config.js` holds the script URL and the Google sign-in client id, and neither one is secret. While `endpoint` is empty, the arcade runs without saving anything.
