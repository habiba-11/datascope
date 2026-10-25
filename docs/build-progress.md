# DataScope build progress

## Status
- Current part: **Part 12 (more gamification): 12a-d built, waiting for Habiba's test; 11d real-device test still open**
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

- Part 11 (22 Oct 2026), 58 tests passing:
  - 11a: teacher view (teacher.html, js/teacher.js, js/helpers/summary.js), linked from the start page. Imports children's JSON files (newest file per code wins, foreign files skipped with a reason), one row per child (meaning tasks first time / after hint / unsolved, hints, Chance Lab reasons, final claim), 8 misconception tags from the literature with paper numbers, class CSV with tags as rows, two-tap remove.
  - 11b: Number Lab "Has the data changed your mind?" (keep / change with a reason), logged as revision; disabled "All done" hidden on last tasks; teacher view "clear children's work on THIS device" (clearChildData).
  - 11c: accessibility: axe-core audit to 0 violations on all pages (headless only, nothing added to the app); contrast fixed via tokens (main green #217A3B, Conclude purple #A596FF, navy task-progress text with a colour dot); h1 > h2 > h3; <main>; keyboard-reachable answer list; chart descriptions for screen readers (describeChart); feedback announced; focus ring; global reduced motion; all tap targets >= 48px; checked at iPad portrait (768px) and Chromebook (1366x768) with no sideways scroll.
  - Also: every chosen answer shows a ✓ (colour is never the only signal); aria-current on the step bar and Explore tabs; the unfair spinner is now drawn with weighted slices and "Red: 4 of 7 parts" chips (before, it looked identical to the fair spinner, so "equally likely" was the reasonable answer).
  - docs/device-test-checklist.md: printable checklist for 11d.
  - 11e: badges for reasoning (js/helpers/badges.js, js/celebrate.js). Badges are counted from the log, once per reasoning moment: a certainty reason (per device), changing your mind with a reason, a meaning task solved (also after a hint), a real answer to "what does this graph NOT tell us?", a full claim card. Never for trials, hints, predictions or speed. A new badge: counter goes up, Pip says what was good, Pip hops, 8 stars burst (none with reduce motion), optional ding. "🔇 Sound: off" toggle in the sidebar, off by default (Web Audio, no sound files). 65 tests passing.

- Part 12 (22 Oct 2026, gamification; Paper 30: badges, levels, instant feedback, but too much game distracts):
  - 12a: js/sounds.js: every sound in one SOUNDS table (Web Audio, no files), playSound() only plays when sound is on (off by default). correct / tryAgain (soft, not a buzzer) on Number Lab tasks and Question Studio fix-its, tick per classmate + done fanfare in Data Hub (no ticks with reduced motion), spin on Chance Lab trials, done on the Evidence Card, badge ding 0.6 s later so it doesn't clash. A tap "pop" on every button was tried and removed (Habiba didn't like it).
  - 12b: js/motion.js: animate() restarts a CSS animation; cheer() = chime + feedback bounce + Pip hops; encourage() = soft sound + gentle wobble + Pip tilts his head ("think"). Number Lab stat cards pop in one by one on Reveal; Chance Lab device tumbles on each run and the bars grow; Data Hub button and Evidence Card bounce when done. Keyframes in base.css / shell.css / number-lab.css / chance-lab.css; the global reduced-motion rule switches them all off.
  - 12c: 5 named kinds of badge in badges.js (BADGE_TYPES, badgeType, badgeShelf): 🧙 Why-Wizard, 🔄 Mind-Changer, 🧮 Number Cracker, 🔍 Graph Skeptic, 🏅 Data Detective. Counting is unchanged (same keys, once each); kinds only group them. The sidebar counter is now a button that opens js/badge-shelf.js (a <dialog>: earned cards "✓ Earned × 2" in yellow, locked cards "🔒 Still to find" + where to find it, dashed + grey icon). Pip names the badge when it's earned. 2 new tests (67 passing). Checked at 1366x768 and 768x1024.
  - 12d: explorer levels in badges.js (LEVELS, levelFor; tested): 🐣 Rookie Explorer (0) → 🔎 Junior Detective (2) → 🕵️ Super Detective (5) → 🏆 Master Detective (9 of 17 badges). The badge button shows level + count; the shelf says how many badges to the next level. Level-up: Pip announces it, confetti (motion.js confetti(): 40 pieces in room colours, removed by a timer, none with reduced motion), levelUp fanfare. Confetti also when the Evidence Card appears. 68 tests passing.

## Next
- Habiba: test 12a-d (sounds, motions, badge shelf, levels + confetti) in Live Server.
- 12e (optional): room passport stamps (one stamp per room when its reasoning is done).
- 12d: explorer levels + room passport stamps + confetti for a finished Evidence Card.
- 11d (Habiba): run docs/device-test-checklist.md on a real Chromebook or tablet and report back.
- Part 13 (was Part 12): deploy to GitHub Pages, offline copy (fonts + Chart.js local), demo video, thesis screenshots.

## Known bugs/open items
- Number Lab's predict/reveal task and meaning tasks are still hardcoded to sleep-hours/fixed examples (by design — the "Build it"/"Mia"/shoe-size tasks are scenario-independent skill practice, not meant to follow the Question Studio pick). Only Data Hub, Graph Lab, and Evidence Board follow the selected scenario so far.
- Small-group sampling (surveying a few classmates before the whole class) is explicitly out of scope for now — Plan only collects a prediction; decided with Habiba on 18 Oct 2026.
- Graph Lab: a line chart for categories (playground) joins unrelated games (kept as a "what changes?" talking point); bar/pie colours are by position, so they repeat after 5 values (labels carry the meaning).
- Not yet tested on a real Chromebook/tablet (11d) or with a real screen reader.
- Selected answers show a ✓ for sighted users, but buttons don't yet announce "pressed" to screen readers (aria-pressed); feedback text announces the choice in most places.
- Chance Lab Task 2 asks "how likely?" without repeating the spinner picture from Task 1 (the child just saw it one tap earlier).
- The app needs the internet for fonts and Chart.js until the offline copy (Part 12).

## Known bugs
- none yet

## Decisions log
- 22 Oct 2026 (Part 12): more gamification, inserted before deployment (now Part 13). Every sound and motion is tied to a result or reasoning moment; no timers, leaderboards or point loss. No sound on ordinary button taps.
- 15 Oct 2026: the UI must be colourful, playful, engaging and very simple for kids (see the UI section in CLAUDE.md).
- 15 Oct 2026: short explanations by default.
- 15 Oct 2026: deliverables are GitHub source, a live link, a demo video and an offline copy.
- 16 Oct 2026: UI direction chosen: "Explorer's Toolkit" (sky-blue background, navy outlines/shadows, room colours Ask/Plan/Collect/Explore/Conclude = coral/yellow/blue/green/purple, Baloo 2 + Nunito, mascot "Pip" the owl explorer). Exact hex values are in css/theme.css.
- 22 Oct 2026 (Part 11e): badges only for reasoning moments already in the log, counted once each; sound off by default.
- 22 Oct 2026 (Part 11): teacher view linked from the start page; misconception tags fixed to 8 from the literature; revision step after Number Lab's Reveal; English only for the pilot (Arabic RTL = future work). Accessibility changed two colour tokens: main green #2E9A4F -> #217A3B and Conclude purple #8E7CFF -> #A596FF (contrast).
- 22 Oct 2026 (Part 10): codes are handed out by the teacher; the child saves a file for the teacher (no backend); on reload only the code and the log are kept (rooms start fresh). Hints are on-demand and logged, never penalised.
- 22 Oct 2026 (Part 9.5): reading minutes is ONE card that compares Class A and Class B side by side (option 1 for B5), not a separate Class B card.
- 22 Oct 2026 (Part 9.5): Number Lab's real-life shoe data changed to 36, 34, 35, 34, 37, 36, 34 (mode 34, median 35), so the median question can't be passed by repeating the mode.
- 22 Oct 2026 (Part 9.5): meaning tasks complete only on a correct answer; a wrong answer gets a kind hint and a retry.
- 16 Oct 2026: the Investigation Shell is shared code (js/app.js), not copy-pasted per room — each room page is a thin script that calls mountShell() with its own step, accent colour and message. Keeps Parts 4-9 focused on room content only.
