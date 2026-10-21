# DataScope build progress

## Status
- Current part: **Part 10 (done: 10a, 10b, hints, 10c)**
- Last updated: 22 Oct 2026

## Done
- Architecture approved by Prof (docs/architecture.md).
- Setup confirmed: Windows 11, VS Code, Git, Node.js, GitHub account.
- Part 0: Git repo initialised, Live Server installed, first page pushed to github.com/habiba-11/datascope.
- Part 1: design tokens (css/theme.css) for the "Explorer's Toolkit" palette; Investigation Shell (logo, 5-step bar, Pip sidebar) built once in js/app.js and reused by 4 placeholder room pages (Question Studio, Data Hub, Graph Lab, Evidence Board).
- Part 2: stats engine (js/helpers/stats.js: mean, median, mode, range), tested with `node --test` (tests/stats.test.js, 11 passing cases: even-length median, unsorted numeric median, bimodal data, category-only mode, no-mode case, extreme-value range).
- Part 3: seeded synthetic data generator (js/helpers/generator.js, mulberry32 PRNG) + 5 scenario recipes in data/scenarios/ (sleep-hours, shoe-sizes, playground-game, reading-minutes-class-a/-b). Generator retries seeds until generated data exactly matches the recipe's target mean/median/mode/range. 7 new tests in tests/generator.test.js (18 total passing), including proof the retry loop actually runs (sleep-hours needs seed 5, not 1).
- Part 4: Data Hub room (rooms/data-hub.html, js/rooms/data-hub.js, css/data-hub.css) wired to the sleep-hours scenario. "Run survey" reveals the 20 synthetic classmates one at a time (paced, reduced-motion aware), with a live progress bar and a growing tally of bars per value.
- Part 5: Graph Lab room (rooms/graph-lab.html, js/rooms/graph-lab.js, css/graph-lab.css) using Chart.js (CDN). Shared chart helper (js/helpers/charts.js) builds frequency data and a custom "direct labels" plugin so values are written on the chart, not just in tooltips. Bar/Line/Pie/Dot-plot are switchable on the same sleep-hours data. "What does this graph tell/NOT tell you?" reflection boxes are present but not yet saved (Part 10).
- Added an "Explore rooms" sub-nav to the shell (js/app.js, css/shell.css) since Explore spans 3 rooms; added a Chance Lab placeholder (Part 1 pattern) so the sub-nav has somewhere to go until Part 8.
- Part 6: Number Lab room (rooms/number-lab.html, js/rooms/number-lab.js, css/number-lab.css). A 4-step task flow: predict then reveal mean/median/mode/range (reuses Part 2 stats engine); "Build it" (5 numbers with mean 6); "Find the mistake" (Mia's unsorted-median error); real-life mode (shoe sizes). Next/Back navigation gates progress on completing each task.
- Part 7: Question Studio room (rooms/question-studio.html, js/rooms/question-studio.js, css/question-studio.css) with a 2-task flow: (1) scenario picker — 4 cards for sleep-hours/shoe-sizes/playground-game/reading-minutes, selecting one saves it via the new js/storage/save.js (localStorage); (2) question checker (js/helpers/checker.js) — live warnings for "not", leading words, missing timeframe, and yes/no-only questions, applied to 2 flawed example questions the child must fix, plus a free-practice box. 5 new tests in tests/checker.test.js (23 total passing). Data Hub and Graph Lab now read the selected scenario via getSelectedScenarioId() instead of hardcoding sleep-hours. Extracted shared task-flow styles into css/tasks.css (used by both Number Lab and Question Studio).
- Part 8: Chance Lab room (rooms/chance-lab.html, js/rooms/chance-lab.js, css/chance-lab.css), replacing its Part-1 placeholder. 3-task flow: pick a device (fair coin/dice/fair spinner/unfair spinner) and see all outcomes listed first; rate one outcome's likelihood on a 5-point certainty scale (impossible to certain); run 10/50/500 trials with Theoretical vs. Experimental bar charts side by side. Trials use plain Math.random() (not the seeded generator) since the point is genuine run-to-run variability converging toward theory, not reproducible synthetic data.
- Part 9: Evidence Board room (rooms/evidence-board.html, js/rooms/evidence-board.js, css/evidence-board.css). 4-task flow: Claim ("I think ___ because ___"), Evidence (pick which real stats from the selected scenario back it up), Certainty (5-point scale + required "why"), Audience + Form (principal/class/parent evening; prediction/problem solved/recommendation) — ending in an assembled "Evidence Card" with a link back to Question Studio to start a new investigation.
- Resolved the open "small group vs whole class" question (decision: skip small-group sampling for now, flagged as future work). Added a Plan task (Task 3) to Question Studio: a phase badge (❓ Ask / 🗺️ Plan) distinguishes the two phases sharing one room; Plan asks the child to predict the answer before collecting data (number input or category chips depending on scenario), then links to Data Hub.
- Part 9.5 (bug-fix pass, batches A-D, 19-22 Oct 2026). Full details in docs/change-summary-part-9-5.md. 33 tests passing.
  - Numbers: one shared formatMean() (sleep mean now 8.4 everywhere); shoe question gets "this year" + a test that every scenario question passes the checker; text-safe sort (compareValues) for tallies.
  - Shell/navigation: Question Studio Task 3 rebuilds when the scenario changes; the step bar follows Ask/Plan (setCurrentStep); localStorage wrapped in try/catch; one "next room" link per room; found and fixed: [hidden] was overridden by .btn's display.
  - Reading minutes now compares Class A and Class B side by side (Data Hub, Graph Lab on a shared scale, Evidence Board chips), via "compareWith" in Class A's recipe and the new js/helpers/scenarios.js.
  - Number Lab: Task 1 needs a guess; Tasks 3-4 complete only on a correct answer (kind hint + retry); new real-life median question (shoe data changed so mode 34 ≠ median 35); "centre" instead of "middle".
  - Chance Lab: required "Why?" with the certainty rating; honest trial feedback (only says "closer" if it is); theory shown as "1 in 6 (about 16.7%)".
  - Graph Lab: all 4 scenarios x 4 chart types checked in a headless browser; fixed the empty playground dot plot (category axis), clipped top labels, curved lines overshooting the data, colour-only pie legend, cluttered dot labels. Chart.js pinned to 4.5.1.
  - Evidence Card built with textContent (typed text can't become HTML).
- Part 10 (22 Oct 2026), 51 tests passing:
  - 10a: welcome page asks for a teacher-issued explorer code (e.g. OWL-07; must contain a digit, so names are refused); sidebar shows the code. js/helpers/log.js (makeEntry/logEvent, fixed event types); save.js gained shared readItem/writeItem with in-memory fallback.
  - 10b: every room writes to the log: Q-Studio prediction, Data Hub data-seen (scenario + seed), Graph Lab reflections, Number Lab prediction + meaning tasks (correct / after-hint / incorrect via trackMeaningTask, incl. leaving unsolved), Chance Lab certainty + trials, Evidence Board claim (logged once unless changed).
  - Hints: js/helpers/prompts.js (prompt engine): "💡 Need a hint?" with up to 3 escalating hints/sentence starters on Graph Lab tell/NOT tell, Chance Lab why, Evidence Board claim and why. Hint use is logged.
  - 10c: js/storage/export.js. Evidence Board "📤 Save my work for my teacher" downloads datascope-CODE-DATE.json (with a synthetic-data note); a small link saves the same log as CSV (formula-safe). Needs a code first.

## Next
- Part 11: polish, accessibility, teacher view (import the children's JSON files), testing on a Chromebook or tablet.

## Known bugs/open items
- Number Lab's predict/reveal task and meaning tasks are still hardcoded to sleep-hours/fixed examples (by design — the "Build it"/"Mia"/shoe-size tasks are scenario-independent skill practice, not meant to follow the Question Studio pick). Only Data Hub, Graph Lab, and Evidence Board follow the selected scenario so far.
- Small-group sampling (surveying a few classmates before the whole class) is explicitly out of scope for now — Plan only collects a prediction; decided with Habiba on 18 Oct 2026.
- Graph Lab's reflection textareas, Number Lab's task answers, Chance Lab's predictions, Question Studio's Plan prediction, and Evidence Board's claim/evidence/certainty don't persist anywhere yet — this is exactly what Part 10's reasoning log is for.
- Graph Lab: all 16 scenario x chart-type combinations were checked in Part 9.5. Still open for Part 11: a line chart for categories (playground) joins unrelated games; bar colours are by position, so in the pie the same colour repeats after 5 values.
- Number Lab meaning tasks now follow wrong click -> hint -> correct click. Part 10 should log this as correct / correct after a hint / incorrect (architecture section 7).
- Not yet tested on a real Chromebook/tablet (Part 11).
- The "revision" log event (changed a prediction after seeing data) has no screen yet. Suggested place: after Number Lab's Reveal ("Has the data changed your mind?"). Decide in Part 11.
- Shared devices: the log is never cleared, but each child's export contains only the entries under their own code. Decide in Part 11 whether a teacher "clear this device" button is needed.

## Known bugs
- none yet

## Decisions log
- 15 Oct 2026: the UI must be colourful, playful, engaging and very simple for kids (see the UI section in CLAUDE.md).
- 15 Oct 2026: short explanations by default.
- 15 Oct 2026: deliverables are GitHub source, a live link, a demo video and an offline copy.
- 16 Oct 2026: UI direction chosen: "Explorer's Toolkit" (sky-blue background, navy outlines/shadows, room colours Ask/Plan/Collect/Explore/Conclude = coral/yellow/blue/green/purple, Baloo 2 + Nunito, mascot "Pip" the owl explorer). Exact hex values are in css/theme.css.
- 22 Oct 2026 (Part 10): codes are handed out by the teacher; the child saves a file for the teacher (no backend); on reload only the code and the log are kept (rooms start fresh). Hints are on-demand and logged, never penalised.
- 22 Oct 2026 (Part 9.5): reading minutes is ONE card that compares Class A and Class B side by side (option 1 for B5), not a separate Class B card.
- 22 Oct 2026 (Part 9.5): Number Lab's real-life shoe data changed to 36, 34, 35, 34, 37, 36, 34 (mode 34, median 35), so the median question can't be passed by repeating the mode.
- 22 Oct 2026 (Part 9.5): meaning tasks complete only on a correct answer; a wrong answer gets a kind hint and a retry.
- 16 Oct 2026: the Investigation Shell is shared code (js/app.js), not copy-pasted per room — each room page is a thin script that calls mountShell() with its own step, accent colour and message. Keeps Parts 4-9 focused on room content only.
