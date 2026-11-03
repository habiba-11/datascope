# DataScope Round 3: plan after Prof's feedback (2 Nov 2026)

Claude reads this after `docs/build-progress.md` at the start of every session. One part at a time: stop and wait after each part. Habiba makes the commits.

Last updated: 3 Nov 2026 · Owner: Habiba · Supervisor: Dr. Nada Ahmed Hamed Sharaf

Not part of this plan: the literature review, which comes after everything is confirmed, pushed and deployed.

## Prof's comments and where they live

| # | Comment | Part |
|---|---------|------|
| 1 | Start-page tutorial: purpose, how to use it, all rooms | 34 |
| 2 | Charts: larger bold dark text, word labels, better line chart, size vs count | 26, 27, 28 |
| 3 | Hints give answers: tap or drag, editable, or own words | 30, 31, 32 |
| 4 | "Show the numbers" becomes "Show statistics" | 25 (done) |
| 5 | Mean task is too slow | 29 |
| 6 | Room summary as a tab | 33 |
| 7 | Chance Lab numbers and brackets | 28 |
| 8 | Checker knows many time words | 25 (done) |
| 9 | Deployment | 36 (locked) |

## Rules for every part
- Before editing, say in 2 to 3 lines what will change and why. Short explanations. End with "You should see...", then stop.
- No framework or build tools. Ask before adding a library.
- Never hard-code answers: numbers come from `stats.js` and the scenario data. Words live in `data/content`.
- Anything a child types or taps is shown with `textContent`.
- `node --test` stays green, with tests for every new helper.
- Rewards are for reasoning, never speed. No timers, no leaderboards.
- Reduced motion, 48px tap targets, colour never the only signal, text at least 18px.
- DEMO data stays labelled and is never exported. Never invent pilot results. Never put the Supabase secret key in the website.
- Testing in Live Server: the database is on, so use made-up codes like `TEST-26`.
- End of each part: update `docs/build-progress.md`, give a commit message, a thesis note and what to keep.

## Parts

### Part 25: Button wording and question checker (comments 4, 8) (done)
**Files:** `js/rooms/number-lab.js`, `data/content/phases.json`, `js/helpers/badges.js`, `js/helpers/checker.js`, `tests/checker.test.js`.
**Risks:** a stricter checker could block a suggested fix; content tests cover this.
**Tests:** accepted phrases, vague phrases, each fixed bug.
**You should see:** "🔍 Show statistics"; `last month` and `right now` give ✅; `lately` and `Which 3 games` ask "When?".

### Part 26: Chart text and word labels (comment 2)
**Files:** `js/helpers/charts.js`, `js/rooms/graph-lab.js`, `data/scenarios/*.json`, `tests/charts.test.js`.
**Build:** 18px bold navy chart text. Under the bar: "Size 34", "9 hours", "Football". On the bar: "5 kids". Axis titles: "Number of kids" and the scenario's own name for the answer. Pie: "Football: 6 kids".
**Risks:** 11 values on the reading charts may crowd. The teacher charts share the labels plugin and must not change.
**Tests:** label wording for all 4 scenarios, singular "1 kid", teacher labels unchanged, screen-reader description.
**You should see:** every axis has a title; no chart shows a bare number without saying what it counts; no sideways scroll at 768px.

### Part 27: A better line chart (comment 2)
**Files:** `js/helpers/charts.js`, `js/rooms/graph-lab.js`, `data/content/*.json`, `tests/charts.test.js`.
**Build:** numbers use a true number line, including values nobody chose (sleep 3, 4, 5, 6, 7...), with a thick line and big dots. Games: tapping Line explains "Games have no order, so try a bar!" and draws no line (Paper 20).
**Risks:** the chart-switch log and Graph Explorer badge must stay correct when Line is tapped for games.
**Tests:** gaps are kept (3 to 7 is four steps), zero counts included, no line for words.
**You should see:** the gap from 3 to 7 hours looks wide; big dots with "6 kids" labels; games show the friendly message.

### Part 28: Chance Lab numbers and Data Hub tally (comments 7, 2)
**Files:** `js/rooms/chance-lab.js`, `js/helpers/chance.js`, `css/chance-lab.css`, `css/data-hub.css`, `tests/chance.test.js`.
**Build:** one row per outcome with the "should" and "did" bars together, no brackets, 18px or larger and bold. For example: "6: Should be 1 in 6, about 17%. Did: 6 of 50, 12%." The message underneath drops its brackets too. The Data Hub tally gets the same text style and labels.
**Risks:** 6 dice rows on a tablet; "closer" must stay honest; the log's values must not change.
**Tests:** new row wording, messages follow the 12-word rule, "closer" only when true.
**You should see:** no brackets in Chance Lab; each outcome's two bars side by side; all text at least 18px; no sideways scroll at 768px.

### Part 29: Mean task with a worked example (comment 5)
**Files:** `js/helpers/number-tasks.js`, `js/rooms/number-lab.js`, `data/content/*.json`, `css/number-lab.css`, `tests/number-tasks.test.js`.
**Build:** keep 5 numbers (reverse calculation, Paper 9). Beside the question, a worked example: 4, 4, 4, 4, 4 becomes 3, 5, 4, 4, 4, "one down, one up, the mean stays 4", computed with `stats.js`. All-same answers are correct, logged `allSame`, and Pip asks "Can you make them different?" without blocking.
**Risks:** the example must not use the class's real numbers.
**Tests:** example mean is right and never equals the target; `allSame` detection.
**You should see:** the example beside the boxes; 8, 8, 8, 8, 8 passes with Pip's challenge; a wrong answer still gets the tip.

### Part 30: Hint engine, first in Graph Lab (comment 3)
**Files:** new `js/helpers/suggestions.js`, `js/helpers/prompts.js`, `js/helpers/log.js`, `js/rooms/graph-lab.js`, `data/content/*.json`, new tests.
**Build:** the first 💡 tap shows 3 true answers (the old tips go). Tap adds the answer to the box (appended if it already has text); drag is a bonus, using pointer events like the card sort. Log `answerSource` (own / hint / hint-edited) with the original suggestion, and a new `hint-picked` event `{ prompt, suggestionId, how }`. Clearing the box resets the source to `own`.
**Risks:** filling a box from code must fire `input` and `change`, or logging and the Next button break.
**Tests:** every source case, clearing resets, tapped text stays plain text.
**You should see:** tap fills the box; edit it and it logs `hint-edited`; drag works with mouse and touch; typing alone logs `own`.

### Part 31: Hints in the other rooms (comment 3)
**Files:** `js/rooms/chance-lab.js`, `js/rooms/evidence-board.js`, `js/rooms/number-lab.js`, `data/content/*.json`, tests.
**Build:** Chance Lab why, the 3 Evidence Board boxes and the change-my-guess reason. Not the fix-its or the bonus question.
**Risks:** Evidence Board's two inline boxes are small; suggestions must fit each device and scenario.
**Tests:** every suggestion is true, at least 5 words and at least 10 characters; numbers match `stats.js` for all scenarios.
**You should see:** 3 answers in each listed box; the card fills correctly from a tapped answer.

### Part 32: Badges, thesis columns and teacher view (comment 3)
**Files:** `js/helpers/badges.js`, `js/helpers/journey.js`, `js/helpers/metrics.js`, `js/helpers/thesis.js`, `js/teacher/detail.js`, tests.
**Build:** stars ignore the source. Graph Skeptic, Why-Wizard and Because Builder need own or edited words. New columns at the end: `graphTellSource`, `graphNotTellSource`, `chanceReasonSource`, `revisionReasonSource`, `claimSource`, `becauseSource`, `certaintyReasonSource`, `suggestionsUsed`. `hintsUsed` means "times 💡 was tapped". The teacher sees where each answer came from.
**Risks:** older logs have no source field and must still work. A one-letter edit counts as `hint-edited`: state this limit in the thesis.
**Tests:** old logs, column order, dictionary covers every column, DEMO never exported, a hint never lowers stars.
**You should see:** a tapped answer earns the stars but not those 3 badges; an edited one earns them; the CSV has the new columns.

### Part 33: Room summary tab (comment 6)
**Files:** `js/task-card.js`, `js/app.js`, `js/phase-intro.js`, `data/content/phases.json`, `css/task-card.css`, tests.
**Build:** a "📖 About this room" tab in the same spot on every task card, opening inside the card, with the bullets plus "You are done when...". The pop-up still opens once. The (i) button goes, and the "Tap the (i) button" line changes.
**Risks:** it must not look like a room tab in the Explore rooms.
**Tests:** every phase has its text, 12-word rule.
**You should see:** the tab in every room; it opens and closes inside the card; keyboard works; no (i) button.

### Part 34: Start-page tutorial (comment 1)
**Files:** `index.html`, `js/welcome.js`, new `js/tutorial.js`, `js/helpers/tutorial-steps.js`, `data/content/tutorial.json`, `css/tutorial.css`, tests.
**Build (changed on 3 Nov 2026 to follow Habiba's design, `docs/design/frames/f0-tutorial.html`):** a 6-scene animated film with Pip (hello, your mission, the 5-step journey, the 6 rooms, how to use the hints and the About tab, ready), about 50 seconds. It plays by itself, with Pause, Back, Next, dots, arrow keys, Skip and Esc; the words are always in a caption; no sound. Reduced motion: no autoplay, every scene in its final state. It opens by itself on the first visit in this browser; "▶ See how it works (1 minute)" sits under the green Start button. It shows all rooms while the step bar stays locked (mention to Prof). Built last so it shows the final UI.
**Risks:** no code exists yet, so seen-state is per browser and the view can't be logged against a child.
**Tests:** scene text rules, no scene empty.
**You should see:** it opens on a fresh browser, not on reload; Skip and Watch again work; with reduced motion the scenes show without movement.

### Part 35: Full check and docs (all comments)
**Files:** `docs/`.
**Build:** run all 4 scenarios, keyboard-only, and on a tablet or Chromebook. Update `docs/architecture.md` and write `docs/change-summary-round-3.md`. Remind Habiba to declare AI assistance.
**Risks:** the real-device test needs Habiba.
**Tests:** all green, no console errors, accessibility audit.
**You should see:** every Prof comment ticked off in the change summary.

### Part 36: Deployment (comment 9)
**Unlocked: Habiba wrote "Prof confirmed" (3 Nov 2026). Changed 4 Nov 2026: the database is ON (ethics agreed), no files at all, the PIN stays as it is (hashed); Claude pushes, Habiba switches on GitHub Pages herself.**
**Files:** `js/config.js`, the HTML pages, `docs/`, `js/helpers/pin.js`, a new beginner deploy guide.
**Build:** a step-by-step guide. Database off until the GIU ethics check is cleared. Local copies of fonts and Chart.js. Change the PIN and remove it from the docs. Turn on GitHub Pages from `main`. Smoke-test the link. Build the offline copy and demo-video script.
**Risks:** everything in the public repo is also served on the site. Linux hosting is case-sensitive, unlike Windows.
**Tests:** live-link check of every page.
**You should see:** `https://habiba-11.github.io/datascope/` works on a device other than your laptop.

## Decisions
Habiba's 29 answers are in the Decisions log of `docs/build-progress.md` (3 Nov 2026) and in the Round 3 section of `CLAUDE.md`.
