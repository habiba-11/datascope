# DataScope build progress

## Status
- Current part: **Part 3 (done)**
- Last updated: 17 Oct 2026

## Done
- Architecture approved by Prof (docs/architecture.md).
- Setup confirmed: Windows 11, VS Code, Git, Node.js, GitHub account.
- Part 0: Git repo initialised, Live Server installed, first page pushed to github.com/habiba-11/datascope.
- Part 1: design tokens (css/theme.css) for the "Explorer's Toolkit" palette; Investigation Shell (logo, 5-step bar, Pip sidebar) built once in js/app.js and reused by 4 placeholder room pages (Question Studio, Data Hub, Graph Lab, Evidence Board).
- Part 2: stats engine (js/helpers/stats.js: mean, median, mode, range), tested with `node --test` (tests/stats.test.js, 11 passing cases: even-length median, unsorted numeric median, bimodal data, category-only mode, no-mode case, extreme-value range).
- Part 3: seeded synthetic data generator (js/helpers/generator.js, mulberry32 PRNG) + 5 scenario recipes in data/scenarios/ (sleep-hours, shoe-sizes, playground-game, reading-minutes-class-a/-b). Generator retries seeds until generated data exactly matches the recipe's target mean/median/mode/range. 7 new tests in tests/generator.test.js (18 total passing), including proof the retry loop actually runs (sleep-hours needs seed 5, not 1).

## Next
- Part 4: Data Hub room ("Run survey" reveals answers one by one; table and tally grow).

## Known bugs
- none yet

## Decisions log
- 15 Oct 2026: the UI must be colourful, playful, engaging and very simple for kids (see the UI section in CLAUDE.md).
- 15 Oct 2026: short explanations by default.
- 15 Oct 2026: deliverables are GitHub source, a live link, a demo video and an offline copy.
- 16 Oct 2026: UI direction chosen: "Explorer's Toolkit" (sky-blue background, navy outlines/shadows, room colours Ask/Plan/Collect/Explore/Conclude = coral/yellow/blue/green/purple, Baloo 2 + Nunito, mascot "Pip" the owl explorer). Exact hex values are in css/theme.css.
- 16 Oct 2026: the Investigation Shell is shared code (js/app.js), not copy-pasted per room — each room page is a thin script that calls mountShell() with its own step, accent colour and message. Keeps Parts 4-9 focused on room content only.
