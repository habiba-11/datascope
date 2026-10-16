# DataScope build progress

## Status
- Current part: **Part 1 (done)**
- Last updated: 16 Oct 2026

## Done
- Architecture approved by Prof (docs/architecture.md).
- Setup confirmed: Windows 11, VS Code, Git, Node.js, GitHub account.
- Part 0: Git repo initialised, Live Server installed, first page pushed to github.com/habiba-11/datascope.
- Part 1: design tokens (css/theme.css) for the "Explorer's Toolkit" palette; Investigation Shell (logo, 5-step bar, Pip sidebar) built once in js/app.js and reused by 4 placeholder room pages (Question Studio, Data Hub, Graph Lab, Evidence Board).

## Next
- Part 2: stats engine (mean, median, mode, range) with tests for tricky cases.

## Known bugs
- none yet

## Decisions log
- 15 Oct 2026: the UI must be colourful, playful, engaging and very simple for kids (see the UI section in CLAUDE.md).
- 15 Oct 2026: short explanations by default.
- 15 Oct 2026: deliverables are GitHub source, a live link, a demo video and an offline copy.
- 16 Oct 2026: UI direction chosen: "Explorer's Toolkit" (sky-blue background, navy outlines/shadows, room colours Ask/Plan/Collect/Explore/Conclude = coral/yellow/blue/green/purple, Baloo 2 + Nunito, mascot "Pip" the owl explorer). Exact hex values are in css/theme.css.
- 16 Oct 2026: the Investigation Shell is shared code (js/app.js), not copy-pasted per room — each room page is a thin script that calls mountShell() with its own step, accent colour and message. Keeps Parts 4-9 focused on room content only.
