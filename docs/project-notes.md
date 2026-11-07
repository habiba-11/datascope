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

- Not yet tested on a real Chromebook or tablet, or with a real screen reader.
- Read-aloud voices differ per device. Chrome on Windows offline had only Microsoft George, Hazel and Susan; Google voices need the internet; a Chromebook may have others. Listen on the school laptops; if the voices sound robotic, record the lines as small audio files (Part 44 option).
- The page fade between rooms sometimes logs "Transition was aborted" in the
  console. Children don't see it.
- Graph Lab bar colours repeat after 5 values (the labels carry the meaning).
- The playground guess shows 5 games (more than 3 choices), because the choices
  must match the data.
- The question checker lets "Do you know what game you like today?" pass (any open
  word cancels the yes/no warning).
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

**Decisions (Habiba, 6 Nov 2026):** no stickers on the Evidence Card, no mission
bar, no audience sentence ("tell the principal") anywhere. Pip stands beside the
card at 1366 and grows inside it below that; idle help after 10 seconds, at most
once per screen; background music on but quiet, with its own switch; read-aloud
only in the story (Part 44) for now. Children use **laptops and PC screens only**
(1366x768 is the size that matters most; 768 is still checked).

**Speed (43a, Chrome with the CPU slowed 4x, 1366x768, 6s):** Graph Lab and Chance Lab run at 60 frames/s with or without the background in 2 of 3 runs; every version (even with no background) had one slower first run (51 to 55). Not measured on a real school laptop.

**Measured (Chrome, 6 Nov 2026):** the main green button is already below the
screen at 1366x768 in Data Hub, Graph Lab and Evidence Board (Part 49 fixes this).
