# DataScope build progress

## Status
- Current part: **Part 6 (done)**
- Last updated: 18 Oct 2026

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

## Next
- Part 7: Question Studio (scenario picker + question checker).

## Known bugs/open items
- Data Hub and Graph Lab currently only use the sleep-hours scenario; the other 4 recipes aren't wired into any room UI yet (will revisit once Question Studio lets a child pick a scenario, Part 7).
- Open question still pending (see CLAUDE.md): how to let a child survey a small group before the full class.
- Graph Lab's reflection textareas and Number Lab's task answers don't persist anywhere yet; wiring to the reasoning log is Part 10.

## Known bugs
- none yet

## Decisions log
- 15 Oct 2026: the UI must be colourful, playful, engaging and very simple for kids (see the UI section in CLAUDE.md).
- 15 Oct 2026: short explanations by default.
- 15 Oct 2026: deliverables are GitHub source, a live link, a demo video and an offline copy.
- 16 Oct 2026: UI direction chosen: "Explorer's Toolkit" (sky-blue background, navy outlines/shadows, room colours Ask/Plan/Collect/Explore/Conclude = coral/yellow/blue/green/purple, Baloo 2 + Nunito, mascot "Pip" the owl explorer). Exact hex values are in css/theme.css.
- 16 Oct 2026: the Investigation Shell is shared code (js/app.js), not copy-pasted per room — each room page is a thin script that calls mountShell() with its own step, accent colour and message. Keeps Parts 4-9 focused on room content only.
