# DataScope: project notes (the one file to read later)

Written 5 Nov 2026, the day after the site went live. It replaces the old build
log, round plans, change summaries and guides (they are still in Git history:
see the end). Kept beside it: `architecture.md` (the approved design),
`literature-key-findings.md` (the papers and their numbers) and `design/`
(UI guide, badge spec and the design frames f0 to f13).

## 1. What it is

- **DataScope: The Evidence Lab**, a website for Grade 5 PYP children (age 10 to 11).
  A child runs a full data investigation: Ask, Plan, Collect, Explore, Conclude.
- **Live:** https://habiba-11.github.io/datascope/ (GitHub Pages, from `main`, folder `/`).
- **Repo:** https://github.com/habiba-11/datascope (public on purpose).
- Plain HTML, CSS and JavaScript modules. No build step. Chart.js, GSAP and the
  two fonts are stored inside the app, so nothing loads from the internet.

| Step | Room | File |
|---|---|---|
| Ask + Plan | Question Studio | `js/rooms/question-studio.js` |
| Collect | Data Hub | `js/rooms/data-hub.js` |
| Explore | Graph Lab, Number Lab, Chance Lab | `js/rooms/graph-lab.js`, `number-lab.js`, `chance-lab.js` |
| Conclude | Evidence Board, then My journey | `js/rooms/evidence-board.js`, `my-journey.js` |

- **4 scenarios** (`data/scenarios/`, words in `data/content/`): sleep hours (an
  extreme value: mean vs median), shoe sizes (two modes), playground game (words:
  only the mode), reading minutes Class A vs B (same mean, different spread).
- The class data is **synthetic** ("a pretend class"), made by a seeded generator
  that checks its own mean, median, mode and range. Scenario + seed are logged.
- Teacher's view: `teacher/index.html` (email + password login).

## 2. Working on it

| Job | How |
|---|---|
| Run it locally | VS Code, **Live Server** on `index.html` (ES modules don't work from `file://`) |
| Run the tests | `npm test` (Node's built-in runner, about 306 tests) |
| Before every push | `npm run deploy-check`: runs the tests, checks every file the site asks for exists with the right spelling, no secret key, database switch |
| Put a change online | `git add .` → `git commit -m "..."` → `git push`. The site updates in 1 to 2 minutes (Ctrl + Shift + R if the browser shows the old one) |
| Screenshots for the thesis | `npm run shots` → `dev/screenshots/` |

Code layout: `js/app.js` (shell: step bar, status line), `js/rooms/` (one per
room), `js/helpers/` (stats, generator, charts, checker, log, findings... most
are tested), `js/storage/` (save.js = the browser, sync.js = the database),
`css/theme.css` (every colour, font and size in one place).

**During the pilot:** only fix real bugs, and note the date and commit of every
change, so the thesis data stays comparable. Never rename a field in the
reasoning log; add new ones instead. **Round 4 (section 9) overrides the "only
bugs" rule:** deliberate changes based on the pilot children's feedback.

## 3. The online database (Supabase)

- Settings: `js/config.js` (`enabled: true`, the project URL and the
  **publishable** key). Database script: `backend/schema.sql`.
- **Offline-first:** every moment is saved in the browser at once and sent when
  there is internet (retry, no duplicates). The status line shows ☁️ Saved online,
  ⏳ Sending..., 📴 Offline or ⚠️ Not sent yet.
- **Who may do what (enforced by the database's row-level security, not just the
  website):** children's browsers may only ADD log entries; only a logged-in
  account listed in the `teachers` table may READ or DELETE. Public sign-up is off.
- **Never** put the secret key (`sb_secret_...`) or the database password in the
  code or on GitHub. The publishable key is meant to be public.
- **Free projects pause after about 7 days without use.** Open the Supabase
  dashboard (or the teacher view) before each school session. If it is paused:
  open the project, click **Restore project**, wait a few minutes.

| Problem | Cause | Fix |
|---|---|---|
| ⚠️ Not sent, console (F12) says 401 / invalid key | wrong key | copy the publishable key again into `js/config.js` |
| Console says 403, permission denied | the schema script did not run fully | run `backend/schema.sql` again in the SQL Editor |
| Console says 400, check constraint | that entry broke a rule (e.g. a code with no digit) | use a code like `TEST-01`; the app skips it and goes on |
| Teacher login: invalid credentials | wrong email or password | Supabase → Authentication → Users |
| Teacher logged in but sees no children | the account is not in `teachers` | add its exact email to the `teachers` table |
| Nothing saves, project paused | 7 days unused | Restore project |

## 4. Before the pilot (do these)

1. **Delete the test data.** Supabase → SQL Editor → run:
   ```sql
   delete from public.log_entries where code like 'TEST-%' or code like 'OWL-%';
   delete from public.teacher_tags where code like 'TEST-%' or code like 'OWL-%';
   ```
2. Hand out the real anonymous codes (letters + a digit, e.g. `OWL-07`). Only the
   teacher knows which child has which code; that list never goes into DataScope.
3. On every child device, make sure the teacher **Preview** (all rooms open) is off.
4. Try it once on a real Chromebook or tablet (touch, the tutorial's speed, sound).

## 5. Privacy and ethics (approved 4 Nov 2026 by Prof and the GIU ethics check)

- **Stored:** the anonymous code, and the reasoning-log moments (type, room, time,
  what the child chose or typed, whether an answer was their own words or a hint,
  the scenario and seed). Teacher tags on a code. The teacher's login (Supabase Auth).
- **Not stored:** names, emails, photos, birthdays, school or class. The code rule
  is checked by the app AND the database, so a plain name cannot be a code.
- **Honest risk:** children type free text, so a child could type a name. Remind
  them not to; the teacher can delete one child's data (teacher view → the child →
  🗑️ Delete all of CODE's data, two taps).
- After the study: delete the Supabase project (Project Settings → General).
- Still to decide with Prof and the school: how long data is kept, the consent
  wording, and the Supabase region to name in the thesis.

## 6. Decisions that still hold

- **Rewards are for good reasoning, never speed.** No timers at all (since Part 44 the
  story moves only on Next), no leaderboards, no comparing children. Stars
  ignore where an answer came from, so a hint never costs a star.
- **Hints give answers:** the first 💡 tap shows 3 true answers; tap (main) or
  drag (bonus); the child can edit them. The 💡 button sits under the question.
  Used in Graph Lab, the Chance Lab "why", Evidence Board and the change-my-guess
  reason; the fix-its only let the last idea be tapped.
- **Thesis data:** every answer logs `answerSource` (own / hint / hint-edited);
  only own and hint-edited answers count as evidence of reasoning.
- **Look ("Explorer's Toolkit"):** sky-blue background, navy outlines, a colour per
  step (Ask coral, Plan yellow, Collect blue, Explore green, Conclude purple),
  Baloo 2 + Nunito, Pip the owl. Text at least 18px (short navigation labels may be
  14 to 16px). Colour is never the only signal. Tap targets at least 48px.
  Reduced motion is respected everywhere.
- **Icons (Part 54, then 3D and moving in Part 57, 10 Nov 2026):** no keyboard emoji
  anywhere: our own illustrations (`js/illustrations.js`, 70 icons; contact sheet
  `docs/design/illustration-sheet.html`, open it with Live Server). A new icon copies
  Habiba's 3D style: 64x64, navy outline about 2.6 px, gradients lit from the top-left,
  a darker copy behind for the extruded side, one gloss, under 2.5 KB, gradient ids
  written with `~`; it gets its own small idle motion (a class in ILLUSTRATION_CSS) and
  goes on the sheet. Faces only on mascot-like icons (star, heart, bulb, flame, moon,
  Pip the owl, the chick). **Motion only where it rewards or guides:** room header,
  pop-up titles, Pip lines, hint buttons, badges and the finale (`cheer()` = a happy
  jump). Icons next to words, in lists, tables, cards and the step bar stay still
  (`animate` is false by default in `js/icon-text.js`). Never more than 12 move on
  a screen (pop-ups first), each moves for 8 s and then rests until hover, tap or
  a reward wakes it; motion pauses in a hidden tab; reduced motion stops it all;
  nothing fades faster than 3 times a second (tested). `npm test` fails on any emoji.
- **Pip's Wardrobe (Part 58, 10 Nov 2026):** the child can dress Pip (16 items from
  `docs/design/pip-wardrobe-ui.html`; art `js/art/pip-outfits.js`, words and unlock rules
  `data/content/wardrobe.json`, rules `js/helpers/wardrobe.js`, screen `js/wardrobe.js`).
  Items open with a reasoning badge or a finished step (Explore, Conclude), 5 are free;
  never speed, points, a shop or comparing. Opens from the backpack, My journey, the button under big Pip and the badge
  pop-up's "Try it on Pip" (a pop-up, never inside a task card); never needed for anything. Pip wears the
  outfit on every screen (one Pip: `pipSVG()`; the beak is drawn after every item,
  held items sit in the right wing). Default: explorer hat + magnifier. Since Part 59p Pip and his hat have the rooms mockup's look (same size and place).
  Saved per code in this browser only (children never read the database).
  **`FEATURES.wardrobe`** in `js/config.js`: false = no buttons, Pip in his hat, no
  wardrobe log entries (for a pilot group without it).
- **Room scenes (Part 59, from 10 Nov 2026):** see section 9; `FEATURES.richScenes` switches them off.
- **Sound is ON by default** (changed 5 Nov 2026), with a remembered on/off
  toggle. Every sound belongs to a motion and is timed to it; every confetti and
  every badge landing has its sound.
- **Charts:** 18px bold navy, words on the labels ("Size 34", "5 kids"), WHAT
  (blue) and HOW MANY (yellow) axis pills, number answers on a true number line,
  two classes as dot plots stacked on the same line, games get dots on stems
  (no line) with a "Careful!" note, the pie shows counts + a colour key.
- **Games (words)** have only the mode: a "Words, not numbers!" box explains it, and
  the mode alone is full proof on the Conclude card.
- **No files:** children don't save files and the teacher doesn't import any;
  everything goes online. Demo data is labelled DEMO and never exported.
- **Teacher PIN** is stored only as a hash and only asked when the database is off.
- **English only** for the pilot (Arabic right-to-left is future work);
  small-group sampling is out of scope.

- **Phones (5 Nov 2026):** checked at 390px and 360px: nothing sticks out sideways. Below 560px the step bar is smaller, the logo shows its picture only, wide grids shrink (minmax(min(Npx, 100%), 1fr)), Chance Lab cards go 2 across, My journey hides the 7 stop names under its circles, the tally names are 14px and each column is as wide as its name, and game names on a narrow chart may slant.

## 7. Known open items

- Icons (Parts 54 and 57) not yet seen on a real Chromebook, tablet or phone, nor with a
  screen reader (icons are hidden from screen readers unless they carry meaning alone).
  The motion, the badge shine and the coin tokens were only checked in Chrome on Windows.
- **Icon motion cost (Part 57, measured 10 Nov 2026, Chrome on Windows, CPU throttled 4x,
  no graphics card in the test browser):** frames stay smooth (45 to 60 fps in the
  rooms, 60 fps with the maximum of 12 moving icons), but the main thread is much
  busier while icons move (12 icons: about 6% when still, 75 to 100% when moving;
  rooms with 2 to 3 moving icons: about +15 to +40 points). 210 moving icons (no limit)
  drop to 17 fps, so the 12-icon limit matters. **Decided (Habiba chose A, 10 Nov):** an
  icon moves for 8 seconds after it appears, then rests; hover/tap or a reward wakes
  it (so after 8 s a screen costs about the same as with no motion). Still to do:
  check on a real Chromebook (Shift + Esc, Task Manager: the tab's CPU %).

- **Pip's Wardrobe (Part 58)** not yet tried by children or on a real device. Its log
  rows (room `wardrobe`: `wardrobe-opened`, `outfit-changed`) are only in the class
  log CSV; filter them out there. `thesis-metrics.csv` never uses them. The outfit is
  per browser: a child on another laptop sees Pip in his explorer hat again.
- Not yet tested on a real Chromebook or tablet, or with a real screen reader.
- **For Habiba (found in 59b):** the games Number Lab prediction still says "Estimate first, then check the statistics!" (number words, Part 51). Content, not changed yet.
- **Part 59:** the story still draws the old flat Sara (`js/story-characters.js`); the rooms
  use the new one (`js/characters.js`). Switch the story when it moves to the v2 look.
  On 10 Nov 2026 Claude's checks sent a few rows under TEST-01 and OWL-07 to the database
  (removed by the section 4 clean-up; the check tools now block the database).
- Read-aloud voices differ per device. Chrome on Windows offline had only Microsoft George, Hazel and Susan; Google voices need the internet; a Chromebook may have others. Listen on the school laptops; if the voices sound robotic, record the lines as small audio files (Part 44 option).
- The page fade between rooms sometimes logs "Transition was aborted" in the
  console. Children don't see it.
- Graph Lab bar colours repeat after 5 values (the labels carry the meaning).
- The playground guess shows 5 games (more than 3 choices), because the choices
  must match the data.
- Rubric coding of each claim waits for the real levels from Papers 7 and 13.
- Thesis: declare the AI assistance used (GIU regulations, section 7).

## 8. Getting an old file back

Every deleted doc is still in Git history (deleted on 5 Nov 2026). In the VS
Code terminal (PowerShell):

```powershell
git log --oneline -- docs/build-progress.md          # find the last commit that had it
git show 26aef10:docs/build-progress.md > old-build-progress.md   # copy it out
```

The old files were: build-progress.md (the full build log, Parts 0 to 41),
round-2-plan.md, round-3-plan.md, round-3-prompt.md, review-prompt.md,
change-summary-*.md, ui-audit.md, backend-setup-guide.md (the step-by-step
Supabase setup), deploy-guide.md, privacy-note.md, device-test-checklist.md and
screenshots/ (UI before and after).

## 9. Round 4 (pilot feedback, 5 Nov 2026)

Habiba ran a pilot with real Grade 5 children. Their feedback: they did not
understand the purpose ("like a game without knowing what you try to reach"),
all said it looks boring, and several screens were unclear (fix the question,
the bonus, the helper buttons, the graph switch, buttons below the screen, a
second guess, number words in the games scenario). Work starts 6 Nov 2026, in
Parts 42 to 51. Claude commits each part; nothing is pushed until Habiba says "push".

| Part | Date | Commit | What changed and why |
|---|---|---|---|
| 42a | 6 Nov | `432c8d9` | **Mission card:** after picking a scenario, Pip shows its mission ("Find out how long Grade 5 kids sleep at night.") and names the product ("At the end, you make your Evidence Card."). New log event `mission-seen`. |
| 42b | 6 Nov | `17e4ed7`, reverted in `4b8fb4f` | A mission bar under the step bar. **Removed: Habiba did not like it.** |
| 42c | 6 Nov | `4fd9e05` | **"🎯 Why?"** line per room (phases.json `why`), next to the About tab (no extra height) and first in the intro pop-up; bullets cut to 2; games get their own Number Lab words. |
| fix | 6 Nov | `0747fc8` | Bug (Habiba): the Question Fixer badge showed after the Plan intro. The intro now waits one turn, so: Ask card, badge, Plan intro. |
| 42c+ | 6 Nov | `39b4021` | The "Why?" box removed from the About panel (Habiba: "repetitive"); the line next to the tab stays. |
| 42d | 6 Nov | `512f46d` | **"🎯 For your mission:"** under "I learned" on every end-of-room card, from the child's own work (e.g. "Your graph shows the most common answer: 9 hours."; games: "The mode is Tag"). |
| 43a | 6 Nov | `0b4d866` | **Living background** on every child page: clouds, sun, birds (flap, then glide), swaying hills and flowers, a butterfly, one touch per room (stars in Chance Lab, bars in Graph Lab, shapes, never digits, in Number Lab). Behind the card; taps go through. Start page birds stay above the title. Reduced motion: a still picture. Below 1100px the room touches are hidden (no side space). |
| 43a+ | 6 Nov | `edc23a7` | Habiba: **only clouds** move (birds, sun, flowers, butterfly removed; hills still). Room shapes enhanced: 10 per room, 4 pictures of the room topic (Chance: star, die, coin, spinner; Graph: bars, pie, line, dots; Number: circle, triangle, square, diamond), different sizes, float, turn or twinkle. |
| 43b | 6 Nov | `dd54874` | **Interface motion:** buttons squish and spring back; answer buttons pop in one after another; the current step hops when a room opens; a tapped tally column wiggles (with a tick); **fireworks** (3 bursts, soft pops) when a phase is unlocked and when the Evidence Card is stamped; a 6-burst finale on My journey. Reduced motion: only the sounds. Not done: a single chart bar wiggling on tap (Chart.js draws one picture). |
| 43c | 6 Nov | `fe6f142` | **Big Pip, alive and talking:** stands in the left margin at 1240px+ (180px wide at 1366, 148px at 1280) with a speech bubble; idle moves every 6 to 10 s; a line (from `data/content/pip-lines.json`, 6 to 8 per event, editable) with a move for: room opens (wave + hoot), right answer (jump), wrong answer (kind tilt), hint (wink + chirp), badge, phase done (dance). Below 1240px the card Pip grows to 80px and talks in its line. No new log events. |
| 43d | 6 Nov | `ffee561` | **Sound fix (bug, Habiba):** opening a room sounded like "try again": Pip's hoot fell G to E like the try-again sound. The hoot now rises; a test keeps every happy sound from going down or starting like try-again. No bird sounds (Pip's chirp is now "wink"). **Music:** the story's C-Am-F-G loop (104 bpm, 8 bars), on and quiet, own 🎵 switch, stops when the tab is hidden. A soft tap for every button, a whoosh when a room opens. |
| 43e | 6 Nov | `573b1bc` | **Idle help:** 10 s without a tap, key, typing or scroll: Pip wiggles and offers help once per screen, with "💡 Yes, help me!" (opens the hint). New log events `idle-help-shown` (screen, hintButton) and `idle-help-taken` (screen). |
| 42d undone | 6 Nov | `f9c0d25` | "For your mission" removed again (Habiba did not like it). |
| fix | 6 Nov | `c9019f9` | Data Hub compare: Class A and Class B in their own boxes (yellow / blue, 📗 / 📘 badges, a clear gap). |
| fix | 6 Nov | `7713eda` | Number Lab "Which spreads out more?": a reminder of each class (lowest, highest, mean, range worked out, a ruler on one shared scale). |
| fix | 6 Nov | `2ac19ea` | Fireworks behind the cards, where they can be seen, with a real firework sound (whistle, bang, crackles); My journey loops them every 1.3 s. |
| fix | 6 Nov | `a9e792b` | Number Lab Build it: 💡 hint ("write the mean in all 5 boxes", then a chip that fills them). New field `usedHint` on the build-mean `meaning-task` entry; `hint-picked` with suggestionId `fill-mean`. |
| fix | 6 Nov | `fd7bdee` | **Realistic fireworks** (Habiba: cartoonish, annoying sound): canvas behind the cards, rocket + glowing streaks with gravity and glitter; sound made from noise (launch, hiss, boom with echo, crackles); My journey loop every 2.2 s, far-off and quiet. 60 fps with the CPU slowed 4x. |
| 44a | 6 Nov | `642194f` | **The story** replaces the film (no timer): Start cover, trail, switches, dialog card, Next/Back/Skip/arrow keys/Esc; 7 scenes in `data/content/story.json`. Habiba: old "6 rooms" and "hints" scenes dropped; scene 7 says "a pretend class" (no size); the story sky is like the rooms (clouds, hills). |
| 44b | 6 Nov | `9545c37` | The story looks like the approved design: its 7 scenes copied from `datascope-story-ui.html`, parts pop in line by line, the stage fills the window. Not copied (Habiba): sun, birds, flowers; the class size. |
| 44c | 6 Nov | `4011ad1` | **Read-aloud** (own switch, on): the clearest English browser voice; Pip male, Sara female, the class higher; CAPITAL words said in lowercase; mouths move only while speaking; music 70% quieter meanwhile; "Hear this again". The design's scene sound effects per line. Found: this Windows laptop has only Microsoft George, Hazel and Susan (no Natural or Google voices offline). |
| fix | 6 Nov | `138ba77` | Story: bubble words centred; Sara clear of the cards in the numbers scene; classmates talk (mouths) on their lines; a real yawn sound instead of reading "yawn" (story.json lines can have `say` and `after`). |
| 45 | 7 Nov | `0e35db6` | **Fix the question:** Fix 1 = choose A or B (+ why), new event `fixit-choice`; Fix 2 = type, ONE tip at a time, 4 ticks turning green, a good example beside. Checker rules unchanged, tips in plain words. |
| 46 | 7 Nov | `96e33b7` | **Bonus question** is its own optional step (⭐ Bonus, after Fix 2): Try the bonus / No thanks, continue. New events `bonus-seen`, `bonus-choice` (taken). |
| 47 | 7 Nov | `ddabaa5` | **Helper tray** in the left margin above Pip (top-bar row below 1240px): 💡 Hint (every room, greyed when none), 📖 Maths recap (Number Lab), 🧭 My findings (Evidence Board), each with a "when to use me" line. Pip points at it the first time in each room; new event `tray-intro-seen`. |
| 47 undone | 7 Nov | `a11bfcf` | The helper tray removed again (Habiba): the helpers stay in their places. |
| 47b | 7 Nov | `37da910` | **Pointers:** the first time each helper appears in a room, an arrow points at it where it is (Hint under the question, Maths recap and My findings in the top bar) with its "when to use me" line, and Pip says a line. Event `tray-intro-seen` (phase, helper, auto); the About tab shows them again. |
| 48 | 7 Nov | `e460571` | **Graph choice:** the 4 big chart cards became a small "📊 Pick a graph to draw" toolbar on top of the chart; the graph drawn now is navy, pressed and underlined (no green ✓); counter "Graphs tried: 2 of 4". `chart-switch` unchanged. Same look found elsewhere (not changed yet, for Habiba): certainty buttons (green + ✓), scenario and device cards (green ✓ badge), Chance Lab 10/50/500 (green), Number Lab picks and quiz answers (green + ✓, also on a wrong answer). |
| 49 | 7 Nov | `b633492` | **Main button on screen:** the action bar (Back + the one main button) sticks to the bottom of the window while the card scrolls under it; see-through, only the buttons float (Habiba: no blue strip, `cc21d0c`). Before: below the screen at 1366x768 in Question Studio, Data Hub, Graph Lab (by 330px) and Evidence Board; at 768 also Chance Lab. After: on screen everywhere, also in a real laptop window (1366x625). |
| 50 | 7 Nov | `db39ea1` | **Prediction vs estimate (Habiba chose A):** Plan is a "🔮 prediction" (most kids), Number Lab a "📏 estimate" of the mean with a reminder of the prediction. Games: Number Lab checks the Plan prediction against the mode (asks only if there is none). New log fields `planGuess`, `fromPlan` on the Number Lab `prediction`; predictionError (estimate − mean), Brave Guesser and Mind Changer unchanged. For games, numberGuess/revision after 7 Nov are about the Plan prediction: report them apart from earlier data. |
| 51 | 7 Nov | `0d3e7f1` | **No number words for games:** Number Lab intro "Find the most popular answer", "🔍 Show the mode", Keep: "Look at the mode above. Does it back you up?", Pip "Data is everywhere in real life!", end card "You solved all the puzzles.", Evidence Board "Use the mode as proof". Number Cracker: "what the data really means". Kept on purpose: the "why games have no mean" lesson. Left for Habiba: the room name "🔢 Number Lab", "📘 Maths recap", the badge name "Number Cracker". Checked by reading every games screen in Chrome. |
| Scan | 7 Nov | `457cf51` `5bbf46f` `09c623e` `462d9ae` | **Whole scan (bot plays all 4 scenarios like a child, 1366 / 768 / reduced motion, timeline of taps, sounds, pop-ups):** star notes stop when the end card closes early; story sounds and yawn timers stop on Next; the fade into 6 rooms was cancelled by Chrome (GSAP moved to the head); Pip drops reactions older than 3 s; reduced motion covers ::backdrop. After: no errors, no missing files, no animation with reduced motion, voice starts within 10 ms of Next. |
| 52a | 8 Nov | `584130d` | The About tab's "🧰 Show me the helpers" button removed (Habiba). Idle help: with no 💡 on screen Pip says calm lines (`idleCalm` in pip-lines.json), never "Need help?". Log unchanged (`idle-help-shown`, hintButton false). |
| 52b | 8 Nov | `602a4e2` | **Fix 1** right answer: 3 rows (the better question; WHEN with its own time words; pushy with the other question's words). Content `choice.whenWords / whenWhy / pushyWords` replace `why`; js/helpers/fixit-words.js (tested). **Checklist:** heading + icon, title and one explaining line per check; Fix 2 puts it under both columns, 2 across (Hint stays on screen at 1366x768). Checker rules unchanged. |
| 52c | 8 Nov | `b535442` | **Build it:** what to do, a goal box ("Goal: their mean must be 35."), "Mean = add all 5, then divide by 5", boxes labelled Friend 1 to 5 (content `buildGoal`). **Shoes real life Q2:** "The shop puts the 7 boxes in a row, smallest to biggest. Which size is the box in the centre?" (same numbers and answer). |
| 52e | 8 Nov | `f73048d` | **Fireworks only on My journey;** a finished phase and the stamped Evidence Card get confetti only. **Realistic confetti:** two party-popper blasts from the bottom corners on a canvas (paper, ribbons, dots that flip, sway and fade, ~4 s), js/confetti.js + js/helpers/confetti.js (tested); 59 fps. |
| 53a | 8 Nov | `6e8c3a1` `80cd8b8` | **Fix 2 less crowded:** no tip box repeating the checklist; one column of short checks; only the check to fix next shows its line, with a navy "Fix this next" label (nextCheck() in checker.js). Fix 1 explanation cut to 3 labelled rows (≤ 14 words each). Pushy check gives 2 examples; yes/no check says "Begin your question with What, Which or How." |
| 53a++ | 8 Nov | `b143a9d` | **Checker rule change (thesis: report checker results before and after 8 Nov apart):** a 5th check "🧠 It makes sense", first in the list: at least 5 words (was 3), asks the person (you / your / we / our), and in Fix 2 a topic word (content `fixIts[1].topicWords`). "how this week?" no longer passes. Done line: "It passes every check! Read it out loud. Does it make sense?"; the Fix 2 hint hides when done. |
| 53a+++ | 8 Nov | `39313d9` `ace8d86` | Checker: the question must BEGIN with a question word (see 53a++). Every check always shows its explaining line ("It makes sense" names the exact problem while broken); at 1366x768 the last check is under the button bar (a little scroll). |
| 53b | 8 Nov | `ad7bcca` | **Real life median** (sleep, shoes): the numbers as chips + "🔢 Put them in order": they line up with their place (1 to 7) under each. Wrong pick: before ordering "Tap Put them in order first", after "The centre has the same number of boxes on each side". New event `reallife-sorted` (scenarioId). Open for Habiba: a wrong Number Lab pick still shows green ✓ while selected (Part 48 item). |
| 53c | 8 Nov | `424e4cf` | **Evidence Board hints say their line:** "These finish your 'because …' line", each chip starts with a faded "because …" / "I think …" (not put in the box), and the target box glows yellow until it has words. createAnswerHint `line` option. |
| 53d | 8 Nov | `8cc6d93` | **Hint arrow:** follows its button while it shows (scrolls with the page), sits beside it pointing left (never covers what is under it), and points at every 💡 Hint button the first time it is on screen; Maths recap and My findings once per room. |
| 53e | 8 Nov | `c8c676b` | **Confetti after every completed room** (when its end card is closed), also when nothing new unlocks. |
| 55 | 8 Nov | `07a68b7` `519b400` | **Build it, simpler** (Habiba: "confusing and crowded"; she chose A and A): ONE goal sentence ("Type 5 sleep times. Their mean must be 8 hours.", content `build` with {target}; `buildGoal` removed), the 5 boxes, a **live total line** ("Your 5 numbers add up to 38. You need 40.", green with a ✓ at 40; never shows the mean), the worked example behind "See an example", the hint as before. A wrong try: "Not yet: their mean is 7.6. Look at the total." (goes when the boxes change). **Thesis: the live total makes Build it easier; report build-mean tries before and after 8 Nov apart.** |
| 56 | 8 Nov | `58af439` | **Real life median, the child does both steps** (Habiba): question 2 uses the card sort (drag or ← →) instead of the "Put them in order" button and the 4 answer buttons; when sorted, "Now tap the card in the centre"; a wrong tap shows the places 1 to 7 under the cards. Words: "Put the hours in order, smallest to biggest. Then tap the one in the centre." `reallife-sorted` now means the child sorted; `real-life-median` wrong taps count as tries. **Thesis: report real-life-median results before and after 8 Nov apart.** |
| 54 | 8-10 Nov | `a30e6db` `55050db` `b21e119` `1b1e22b` `cd33615` `ddd2ed6` `d70053d` `59a8453` `f9514f7` (this commit) | **Every emoji replaced by our own illustrations** (Habiba's spec and her 26 icons; 44 more drawn in the same style and shown on `docs/design/illustration-sheet.html`: 70 in all). `js/illustrations.js` (the icons) and `js/icon-text.js` (puts an icon before words; the words stay plain text). Our texts name icons as `:name:` (e.g. ":crystal-ball: Predict!"); content stores `"icon": "moon"`. Badges keep their patch frame with the colourful icon inside and a gentle shine; the level is a 96 px picture on My ID. The step bar keeps its navy line icons. Kept as text: → ← ✓ ✕ ○ ★ ☆ ▼ ▲. Tests: `no-emoji.test.js` (no emoji in js/css/html/data; every icon name exists), `illustrations.test.js`. Size: 37.3 KB (about 9 KB compressed), offline, no font or CDN. **Thesis: idle-help `screen` values lost their emoji after 8 Nov (e.g. "Bonus" for "⭐ Bonus"); match them by hand. The CSV exports are unchanged.** |
| 57 | 10 Nov | `a0b855a` `dea9018` `154ad6d` `d33690d` `3e0941b` `e50f8d2` `99f0e25` (commits say "Part 52a" to "52e": Habiba's spec was called Part 52) | **Icons in 3D, and they move** (Habiba's new 26 + the other 44 redrawn in the same style, 3 batches checked on the contact sheet; the flat file is gone). Idle motion per icon, faces on mascot-like ones, hover/tap jump, `cheer()` on rewards (badge landing, finale). Motion only on room headers, pop-up titles, Pip lines, hints, badges, finale; everything else still. At most 12 moving (pop-ups first), each for 8 s then resting (Habiba chose A), paused in a hidden tab, off with reduced motion. Fixed on the way: icons next to words had dropped about 10 px in sentences (`.ds-icon svg` sits on the baseline again). Size: 77 KB, 18 KB compressed (was 37 KB / 9 KB). Measured cost: see section 7. No log field changed. |
| 58 | 10 Nov | `4341676` `5a8ad94` (this commit) (Habiba's spec called it Part 53) | **Pip's Wardrobe.** 58a: Pip draws outfit layers on every screen (back, neck, face, head, then the beak, held item in the right wing; default pixel-identical to before); 16 items, unlock by badge (real ids: `changed-mind`, `claim`, ...) or finished step; saved per code; `FEATURES.wardrobe`. 58b: the Wardrobe pop-up (tabs, tick when worn, New!, locked silhouette + Pip says how to find it, Take everything off, Surprise me), "Dress Pip" in the backpack and on My journey, "New for Pip" line inside the badge pop-up. **New log events `wardrobe-opened`, `outfit-changed` {slot, itemId} (room `wardrobe`): NOT reasoning data, only in the class log CSV.** No existing field changed. Checked in Chrome at 1366 and 768, and with the switch off. **58d (Habiba):** a yellow "Dress Pip" button under big Pip (laptop screens, 1240 px and wider; narrower: the backpack), and "Try it on Pip" in the badge pop-up: the badge still lands in the backpack, then (after any waiting pop-up, `afterAllModals()`) the Wardrobe opens with the new item on Pip. Only the main badge button pulses. **58e (Habiba):** "Dress Pip" under Pip on the start page (needs the code in the box first: the outfit is kept per code), and a one-time pop-up "New: Pip's Wardrobe!" when the child first presses Start exploring (before any room, never on top of the story): Pip dressed up, 3 short lines, "Dress Pip now" or "Start exploring". Shown once per code (`introSeen` in the wardrobe save; cleared with the device). Not logged. |

| 59a | 10 Nov | `db23bc2` (Habiba's brief called it Part 54; 54 to 58 were taken) | **Every room becomes a place, step 1: Data Hub = a classroom.** Shared scene layer: `js/scenes/` (defs.js = the `ds-` gradients, once per page; one file per scene; index.js = which room gets which scene, Sara's pose, what moves), `js/characters.js` (the mockup's Sara, the seat kids), `css/scenes.css`. The scene is a still SVG covering the window like a photo; only 6 dust specks move (transform + opacity), paused in a hidden tab, stopped by reduced motion. No sun, no ticking clock, no blur or noise filters (tested). At 1240 px and wider Sara stands left with big Pip in front of her and the card moves right; narrower: scene only. Seats are small classmates; the shirt and the answer badge have the bar's colour (+ the answer as text). **`FEATURES.richScenes`** (config.js): false = plain colour, no hills, no clouds, nothing moving, card centred. Fixed on the way: at 360 px the "Why?" line was squeezed beside the About tab (it now goes under it). Speed (1366x768, CPU 4x slower): 59 to 60 fps with scenes on and off, main thread equally busy. No logic, log field or content changed. Screenshots: `docs/design/screens/before/` (all rooms) and `after/`. |
| 59p | 10 Nov | `1cbcfe9` | **Pip in the rooms mockup's look** (Habiba chose B): soft brown outlines, shading, amber eyes, a two-part beak, three-toed feet, a soft shadow, and the mockup's explorer hat. Drawn at 85% of the mockup and moved so his eyes, body and beak sit where they were (within 1 px), so all 16 Wardrobe items fit unchanged (checked on a contact sheet: every item, all on at once, think and cheer). Same class names, so every mood, blink, wink, wave and the story's talking beak still work; only the right wing's turning points moved (base.css, badges.css). His colours are now in `js/pip.js` (no longer in base.css); his 5 gradients in `js/scenes/defs.js`, put on every page by `pipSVG()`. Not changed: the small owl icon in `js/illustrations.js` (Habiba's icon set). No log field changed. |
| 59b | 10 Nov | (this commit) | **Number Lab = a maths workshop:** a chalkboard (a chalk bar chart, a wave, a pie and a ruler), a shelf of building blocks with dots, an abacus and a plant; 3 chalk-dust specks move. **No digits or maths words in the scene** (the mockup's "3 + 4 = 7, mean, median" and numbered blocks were left out: Part 51, the games scenario visits this room; tested). Sara thinks (hand on chin). Shared scene pieces moved to `js/scenes/parts.js` (floor, shelf, plant; the classroom uses them too, same picture). Not taken from the mockup: the automatic glowing "Middle!" card (it would give the Real life answer away; the child finds the centre, Part 56). "Show statistics" after the estimate was already there. Speed (CPU 4x slower): 58 to 60 fps, scenes on and off. No logic, log or content change. |

**Decisions (Habiba, 10 Nov 2026, Part 59):** the mockups `docs/design/datascope-rooms-ui.html` and `datascope-story-ui-v2.html` are the reference. **Pip gets the mockup's artwork** (step 59p, right after 59a: all 16 Wardrobe items must be moved onto him). The start page keeps "Start exploring" as the main button (the story stays secondary); 6 doors, locked ones greyed. Speed is checked with Chrome's CPU slowed 4x until a Chromebook is available. Scenes have **no sun, birds, flowers or swaying grass**; only clouds, dust and the funfair flag move; the scenes replace the floating room shapes (Part 43a) room by room. Order: 59a Data Hub, 59p Pip, 59b Number Lab, 59c Question Studio, 59d Graph Lab, 59e Chance Lab, 59f Evidence Board, 59g Start page; ask Habiba before each room (also before changing a room's logic or words, e.g. Graph Lab's "NOT tell" after 2 graphs, Evidence Board's "Ready to share!").

**Decisions (Habiba, 8 Nov 2026):** fireworks only on My journey (rooms: confetti only); no "Show me the helpers" button; Pip offers help only when a 💡 is on screen. The "top buttons don't work" report (8 Nov) could not be reproduced (every top button worked in Chrome at 1366x768 and 1366x625) and was dropped by Habiba.

**Decisions (Habiba, 6 Nov 2026):** no stickers on the Evidence Card, no mission
bar, no audience sentence ("tell the principal") anywhere. Pip stands beside the
card at 1366 and grows inside it below that; idle help after 10 seconds, at most
once per screen; background music on but quiet, with its own switch; read-aloud
only in the story (Part 44) for now. Children use **laptops and PC screens only**
(1366x768 is the size that matters most; 768 is still checked).

**Speed (43a, Chrome with the CPU slowed 4x, 1366x768, 6s):** Graph Lab and Chance Lab run at 60 frames/s with or without the background in 2 of 3 runs; every version (even with no background) had one slower first run (51 to 55). Not measured on a real school laptop.

**Measured (Chrome, 6 Nov 2026):** the main green button is already below the
screen at 1366x768 in Data Hub, Graph Lab and Evidence Board (Part 49 fixes this).
