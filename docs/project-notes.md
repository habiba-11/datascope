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
2. **Codes (since Part 60d):** each child presses "Make me a code" (e.g. `FOX-4725`)
   and writes it on paper. If the teacher needs to know who is who (pre/post), ask
   the children to hand in their paper code; that list never goes into DataScope.
   Tell the children: at the end, Settings → "I'm finished" (clears the computer).
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
- **Evidence Board speed (re-measured in the scan, 10 Nov 2026):** busy only in its first seconds, while its icons move (and when Pip's idle help wakes the hint icon at 10 s); once they rest it runs at 60 fps with the CPU 4x slower. As designed (Part 57).
- **Part 59:** On 10 Nov 2026 Claude's checks sent a few rows under TEST-01 and OWL-07 to the database
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
| 59b | 10 Nov | `7c6c391` | **Number Lab = a maths workshop:** a chalkboard (a chalk bar chart, a wave, a pie and a ruler), a shelf of building blocks with dots, an abacus and a plant; 3 chalk-dust specks move. **No digits or maths words in the scene** (the mockup's "3 + 4 = 7, mean, median" and numbered blocks were left out: Part 51, the games scenario visits this room; tested). Sara thinks (hand on chin). Shared scene pieces moved to `js/scenes/parts.js` (floor, shelf, plant; the classroom uses them too, same picture). Not taken from the mockup: the automatic glowing "Middle!" card (it would give the Real life answer away; the child finds the centre, Part 56). "Show statistics" after the estimate was already there. Speed (CPU 4x slower): 58 to 60 fps, scenes on and off. No logic, log or content change. |
| 59c | 10 Nov | `3d5d396` | **Question Studio = a warm study** (Ask and Plan): a cork pinboard with sticky notes (only question words: ?, Why?, How?, When?, Who?; the mockup's "8 h" would hint at the sleep answer) and red string, two bookshelves with a globe, a plant; 3 dust specks. Sara thinks. Left out: the mockup's hanging lamp (it sat in the top bar, over the logo at 768). The picture cards for the 4 questions were already there (Part 54 icons). `bookRow()` and `lamp()` added to `js/scenes/parts.js` for the Evidence Board. Speed (CPU 4x slower): 58 to 60 fps. No logic, log or content change. |
| 59d | 10 Nov | `35d4eb9` | **Graph Lab = a bright science lab:** mint walls and floor, a window (a cloud, green hills, no sun), a shelf of four coloured beakers, a plant; 3 dust specks. Sara stands calm (the mockup's pointing pose went behind big Pip, so she seemed to poke his hat). **Graph Lab steps unchanged** (Habiba said "continue" to option A: no lock of the "NOT tell" step behind 2 graph types). Charts already follow the brief (18px bold navy, word labels, WHAT / HOW MANY axis titles). Speed (CPU 4x slower): 53 to 56 fps with the scene, 55 to 56 without (Chart.js is the heavy part). No logic, log or content change. |
| 59e | 10 Nov | `615136d` | **Chance Lab = a funfair tent:** coral and cream canvas stripes, a scalloped yellow edge, bunting, a prize shelf (5 balls, 4 dice) and a striped pole. The only movement: a small green flag waving on the pole (skew + scale, 2.4 s; hangs still with reduced motion). Sara cheers. The pole moved from behind the card (mockup) to the far left, so the flag can be seen. The mockup's spinner details (an unfair colour, dashed "should" next to solid "did" bars) were already in Chance Lab: no change. Speed (CPU 4x slower): 55 to 58 fps with the scene, 46 to 53 without (Chance Lab's own 3D devices are the heavy part). No logic, log or content change. |
| 59f | 10 Nov | `5bb059b` `1b2a7ba` | **Evidence Board = a detective office:** purple walls, a corkboard with three notes (Claim, Proof, Sure?) joined by red string, a desk with a paper and a magnifier, a plant; 3 dust specks. Sara writes. Left out: the hanging purple lamp (top bar, as in 59c). **Evidence Board unchanged:** no clue tray, and the stamp still says "Checked!" (the mockup's "Ready to share!" would be a content change; scene only, as agreed). Speed (CPU 4x slower): 37 to 46 fps with the scene, 39 to 52 without; the main thread is 71 to 96% busy either way, so the room itself is heavy (open item, section 7). No logic, log or content change. |
| 59g | 10 Nov | `9b26902` | **Start page in the look of `docs/design/datascope-welcome-ui.html`** (Habiba asked for this design instead of the 6 doors, so there are no doors). The school yard behind the page (`js/scenes/schoolyard.js`: sky, hills with trees, the school, a fence, grass with a path, a big tree); only 3 clouds drift and the school flag waves. Left out (Round 4 and Part 59 rule): the sun, birds, butterfly, flowers, swaying grass and tree, the clock on the school; and the panel's background blur (slow). Sara cheers beside big Pip (his outfit, cheering), "Dress Pip" under them; on the right a light panel: Pip's hello with a tail, the title, and the code card. **Code box (content change):** empty: "Type your code first. It is on the card from your teacher."; wrong: "Hmm, that code does not look right. Check each letter and number, then try again." (was "Codes look like OWL-07 ..."); right: a green tick and "Welcome, explorer CODE! Pip is so happy to see you." Code rules, saving, the story and the Wardrobe intro unchanged. Fits 1366x768 without scrolling; stacks below 900 px. Not logged. |
| 59s | 10 Nov | `a1f9b13` | **The story in the look of `docs/design/datascope-story-ui-v2.html`** (same 7 scenes, words, sounds, voice and buttons). Each scene has a place drawn on the stage (school yard: Ask, Plan, Mission; classroom: Collect to Conclude), drawn wider and taller than the stage (`PLACE_AREA`) so it reaches the edges of any window; `classroom(area)`, `schoolyard(area)` and `floor(...area)` can draw wider (the rooms are unchanged). The new Sara (`saraSVG(mood, { story: true })`: bobs, blinks, talks, points) and four new classmates (`kidSVG()`: one in a headscarf, one with glasses; talk, yawn, clap), the new Pip. Props after v2: a thought bubble, the sticky guess note and a tick, desks with speech bubbles then four DATA cards, the graph on the whiteboard (Most kids! / Only 1!, WHAT / HOW MANY pills, word labels), the number cards, a how-sure bar and a rolling 3D die, the Evidence Card with a LIKELY! stamp and confetti, a pretend class and "Your mission!". The trail sits on a white pill. **Not from v2:** sun, birds, flowers, butterfly (Round 4); the camera push-in and film grain (motion and speed rules); "a pretend class of 25" (no class size, 6 Nov); v2's 25-kid graph (its centre number is 8, not 9): the story keeps its own numbers (tested). Speed (CPU 4x slower): 60 fps in the busiest scenes. |
| 59s+ | 10 Nov | `c41c234` | **Sara only in the story (Habiba):** from the Mission scene on, Pip is the main character. Mission scene: no Sara, Pip big in the middle (cheers on the last line). Rooms: no Sara in the left column; big Pip stands there alone and bigger (230 px at 1366), the card stays on the right. Start page: Pip alone and bigger. Tested: no `saraSVG` in the rooms, the start page or the Mission scene. |
| 59p+ | 10 Nov | `5ae368c` | **Pip's friendly eyes (Habiba: "he looks kinda scary with those eyes staring"):** a small resting upper eyelid over each eye, a soft smiling line under it, and lighter eyebrows a little higher. Four versions compared (`docs/design/screens/after/pip-eye-versions.png`: big lids looked grumpy or sleepy; C chosen). Blink, wink, look-up and all 16 outfits still work (contact sheet). |
| 59p++ | 10 Nov | `1f7787d` | **Pip's happy face (Habiba: with the eyelids "he looks like he wanna cry"):** the eyelids and the lines under the eyes are gone; soft light cheeks push up under each eye (a smiling eye shape, no dark line), the pupils are a little smaller with one small sparkle, the eyebrows are thin and relaxed, and a small smile sits under the beak (`pip-smile`). Compared at the size of the start page (`pip-eye-versions-2.png`: J chosen). Blink, moods, the story's talking beak and all 16 outfits still work. |
| 59p+++ | 10 Nov | `52d1a7b` | **Pip without puffy eyes (Habiba):** the light cheeks under the eyes are gone; instead rosy pink cheeks on the face (bigger blush). Kept: clear eyes, slightly smaller pupils with one sparkle, thin eyebrows, the smile under the beak (`pip-eye-versions-3.png`: L chosen). |
| 59p4 | 10 Nov | `5596f3f` | **Pip's face from Habiba's own SVG** (pasted 10 Nov), drawn at 85% like the rest of Pip: rounded ear tufts, a small arched upper eyelid on each eye (edge curving up: alert, not sleepy), the iris a little low with a big sparkle, the mockup's soft eyebrows, soft pink cheeks, no smile line. Her SVG's blur filter (cheeks) and wing-flap animation left out (see-through cheeks; the moods move the wings). All 16 outfits still fit (contact sheet). **This is Pip's face now; earlier tries (droopy lids, lines or light cheeks under the eyes, a smile) are not to come back.** |
| Scan | 10 Nov | `f177756` | **Whole scan with a new bot, `node dev/scan.mjs` (`--wide` for more):** it plays like a child from the start page to My journey (closes pop-ups with their main button, types answers, tries choices, sorts cards, uses hints) and reports page errors, console errors, missing files, sideways scroll, the main button off screen, small tap targets, stuck screens and motion with reduced motion (report in `dev/scan/report.md`, not in Git; the database is blocked). Result: 10 runs (4 scenarios at 1366x768 and 768x1024, 2 with reduced motion), **0 problems**, every run reached My journey. Also checked by hand: teacher page, story with reduced motion (nothing moves), Pip's Wardrobe, My journey. **Bug fixed:** Number Lab, games with no Plan prediction said "Estimate first, then check the statistics!" (Part 51); now "Predict first, then check the mode!". |
| Icons | 11 Nov | (this commit) | **Fewer icons (Habiba: "so many unnecessary emojis"; she approved the list).** Removed: the owl before Pip's sentences and hints; the icon on the card header (also Question Studio's) and the pill; the icons of "Why?" and "About this room"; icons at the start of instruction sentences in the content files; every icon on the main button (`action-bar.js` shows words only); icons before small labels (e.g. "Pick a graph to explore:", "My Evidence Card", "Why do you think so?", Keep / Change my guess, See an example); decorative icons in feedback (target, scales, thumbs-up, pencil, tap, party, magnifier); the teacher view shows only the warning icon (`showOnlyIcons()` in icon-text.js, set by `js/teacher/calm-icons.js`). **Kept:** step bar, Explore tabs, locks, picture choices (questions, chance games, Mia right/wrong), ✓ / ✗ on feedback, warnings, the hint button, badges and backpack, "Words, not numbers!", icon buttons (Sound, Music, Exit, Maths recap, My findings, Dress Pip, saved status), Maths recap pictures, task titles, and the Fix 2 checklist icons. Number Lab's first screen: 16 → 12 icons (all on the keep list), Evidence Board 11 → 5, Data Hub 7 → 2. Bug caught by the scan on the way (games: a missing import); new test: every file that uses an icon helper imports it. No log field changed. |

| 60a | 11 Nov | (this commit) | **Evidence Board, step 1 (Habiba):** the question the claim answers sits in its own lavender box, big ("Look at your findings." small above it). **Each line has its own Hint button** under its box ("I think", "because"); a tap opens only that line's 3 answers, nothing opens by itself (before: one button, the "because" answers replaced the "I think" ones when that box had words). The box glows while its answers are open and it is empty. Log unchanged (`hint` with prompt `claim` / `claim-because`). |
| 60b | 11 Nov | (this commit) | **Start page:** "Dress Pip" is big (60 px, 22 px words) with no icon (rooms unchanged). **No flash after Exit:** measured 0.3 to 0.6 s of a pale page with only the code panel, then Pip, the yard and the logo popped in and the panel jumped 30 px (the yard is drawn by `welcome.js` after all its modules load). Now `<html class="is-loading">` hides the page over a sky-and-grass colour until `welcome.js` has drawn everything, then all shows at once. If the script fails, a one-line timer in `index.html` shows the page after 1.5 s (tested with welcome.js blocked and reduced motion on). |
| 60c | 11 Nov | (this commit) | **Settings menu replaces the strip under the card (Habiba chose "Settings menu"):** a "Settings" gear button beside the logo (`js/settings-menu.js`) opens a panel with "Your code", Saved online?, Sound, Music, Exit (same ids, so their code is unchanged); closes on a tap outside or Esc. Not sent / offline: a yellow "!" on the gear too. Below 1240 px only the gear shows (its name for screen readers). **Logo** on a white pill over the room pictures. **Step bar over the card** (Habiba chose "centre over card"): a small script moves it right by the card's offset (145 px at every laptop width) but stops 16 px before the right buttons: exactly centred at 1366 in rooms without a top button, 14 to 19 px short with "My findings" / "Maths recap"; at 1240 those two rooms cannot move. Scan: 0 problems. Still open: at 1366x768 the Evidence Board's first Hint button starts half under the sticky button bar (visible after a small scroll). |
| 60d | 11 Nov | (this commit) | **Codes made by the child (Habiba chose "only the button"):** the green button says "Make me a code" while the box is empty and makes an animal + 4 digits (`js/helpers/code-maker.js`, tested: 40 animals x 9000 = 360,000 codes, never `OWL-`/`TEST-`, fits the app and database rule; two children share a code with a chance of about 1 in 70 among 100 children, since children cannot read the database to check). Then it says "Start exploring". "I already have a code" (small, on the label line) is for typing the code from the paper. **Last code** (`datascope:lastCode`): Exit keeps it, so the start page shows it again; an emptied box says "Your code was FOX-4725. Put it back". **"I'm finished"** (Settings menu, My journey): a warning with the code big ("Write your code on paper NOW"), sends waiting work (up to 4 s), then `clearChildData()` and the start page. **Changed rule (also the teacher's Clear this device): log entries not sent yet stay on the device and are still sent later** (each carries its own code; every screen filters by code, so the next child never sees them). Same code later = a fresh trail, the work joins the same code online. Not logged. Scan: 0 problems. |
| logo | 11 Nov | `0f99c16` | Start page: the DataScope logo on the same white pill as in the rooms (Habiba: hard to read over the tree). |
| 60e | 11 Nov | (this commit) | **Rooms remember (Habiba: Back must not wipe answers or restart the room):** every room saves its step and answers in this browser (`saveRoomState` / `loadRoomState` in save.js, key `datascope:rooms`, per code; a state for another scenario is ignored; cleared by "Start a new investigation" and by clearing the device). Coming back opens the same step: Question Studio (question, Fix 1 solved, Fix 2 text, bonus, prediction; no Mission card again), Data Hub (surveyed classes filled at once), Graph Lab (graph, kinds tried, both answers), Number Lab (estimate, reveal, keep/change with words, Build it numbers, solved choices and card sorts shown as answered), Chance Lab (game, how likely, why, the last test), Evidence Board (claim, proof, how sure, the stamp). **Restoring logs nothing** (tested: only the shell's usual `phase-start`, `tray-intro-seen`, `findings-viewed` on a visit) and **hint answers stay hint answers** (`tappedAnswers` / `restoreTapped` in prompts.js), so `answerSource` is right. **Bug fixed:** Chance Lab, Back to "Pick a game" and tapping the same game again wiped the test results. Not restored on purpose: a half-done card sort (sorted but no centre tapped) starts again. **Thesis:** from 11 Nov, returning to a room no longer makes children redo (and re-log) finished tasks, so fewer duplicate entries than before. |
| cover | 11 Nov | (this commit) | **Story cover readable (Habiba: "hard to read"):** the title, the line under it, "Start the story" and the sound note sit on a white panel with a navy border (like the start page's panel), Pip standing on top; no more white text shadow over the school yard. Words unchanged. |
| story | 11 Nov | (this commit) | **Story: nothing overlaps (Habiba):** checked every step at 1366x768 and 1280x720. The place and characters sit 16 px lower and the top band is 64 px (was 72), so the trail no longer covers the classroom's window rod and whiteboard; the dialog card follows (top 446, was 436), so feet still meet it. Graph: 13 px per kid (was 15), so "6 kids" fits inside the green box; the box ends above the hour labels (moved 4 px down); "Only 1!" 12 px higher, clear of "1 kid". Numbers scene: the how-sure bar and its words 12 px higher, off the marker tray. Story numbers unchanged. **Wardrobe intro pop-up:** no small Pip in the title bar (new `pip: false` option in `openModal`; every other pop-up keeps it) and no owl icon on "Dress Pip now". |
| 61a | 11 Nov | (this commit) | **Story: how Sara found the median and mean (Habiba).** Found while planning: the story graph had 17 kids but Sara said "the mean is 7.8" (their mean was 141 / 17 = 8.3). **Habiba chose a 10-kid class:** 3, 7, 8, 8, 9, 9, 9, 9, 10, 10 (`STORY_CLASS` in js/story-scenes.js); the graph bars are now 1, 1, 2, 4, 2 kids. **New scene 5 "calc"** (Step 4, "median and mean", 8 scenes now): the 10 answers as cards in order; the two middle cards are both 9: "Median = 9"; 3 + 7 + ... + 10 = 82; "Mean = 82 ÷ 10 = 8.2"; Pip: "The one kid with only 3 hours pulls the mean down." Scene 6 now says "the mean is 8.2". Test: the graph, the cards, the sums and Sara's words agree (median 9, total 82, mean 8.2, no 7.8 left). |

**Round 5 plan (Habiba, 11 Nov 2026):** 60a Evidence Board question + per-line hints; 60b start page (bigger "Dress Pip" without icon, the flash after Exit); 60c look (readable logo, step bar centred over the card, a settings (gear) menu replaces the bottom strip); 60d codes (**only a "Make me a code" button makes new codes**, a small "I already have a code" to type one again; remember the last code; "I'm finished" clears the device after a big warning; the same code later = a fresh trail, work joins the same code online, no database change); 60e Back keeps answers and the last phase in every room. **Note for the thesis:** with child-made codes the teacher only knows who is who if the child writes the code down and tells the teacher.

**Decision (Habiba, 10 Nov 2026):** Sara appears only in the story (scenes 1 to 6). Pip is the main character from the Mission scene on, on the start page and in every room.

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
