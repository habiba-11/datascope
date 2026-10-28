# Change summary: Round 2 (Prof feedback, 25 to 28 Oct 2026)

What each Prof comment became is in `docs/architecture.md`, section 9. This file lists the work part by part, with its commit, so every change can be traced.

**Tests:** `node --test` = 182 pass, 0 fail (was 68 at the start of Round 2).
**Browser checks:** every page loaded at 1366×768 (Chromebook) and 768×1024 (tablet) for all 4 scenarios with no console errors and no sideways scroll (Playwright, 28 Oct 2026). axe accessibility checks: 0 violations on the checked page states (Part 21d, dashboard redesign).

| Part | What | Commit |
|---|---|---|
| 13 | Shared pop-up component (dialog, queue, focus return, Esc) | `79998b9` |
| 14 | Phase intro pop-ups, shown once per child, ℹ️ reopens | `76ae117` |
| 15 | Progress engine, step bar unlocks one phase at a time, route guard, teacher preview | `bb5f5e8` |
| 16 | Phase-end feedback card (stars for reasoning, wins, next-time nudge) | `2e9caa9` |
| 17a-d | Scenario content files; every room follows the chosen scenario in Grade 5 words; readability test | `540e9de`, `313d26c`, `6e458a5`, `144b7a1` |
| 18 | Maths recap pop-up with worked steps that never give the answer away | `5d33bab` |
| 19 | My journey page on a shared `buildJourney` helper | `6450554` |
| fixes | Clearer questions, "My findings" in Evidence Board, audience task removed | `3a0d67c` |
| 20a-b | Teacher dashboard, class metrics, thesis-metrics.csv + data dictionary, DEMO | `3fa0a88`, `2ada40f` |
| – | Teacher's view button + PIN; Playwright dev tool | `bdaecdb` |
| 21a-d | GSAP motion, SVG Pip, unlock animation, card sort, chance animations, accessibility pass | `d483dc7` … `c0a850f` |
| fixes | Preview "Not done yet" bug; aria-pressed on picked answers | `d2d6202`, `e44eaf5` |
| 22a-d | Supabase backend: schema + row-level security, save first send later, teacher email login, privacy note | `0a2ff02`, `3e4c9e3`, `ba051c4`, `5a9c2db` |
| – | Teacher dashboard redesign (top bar + 4 tabs) | `8fe786f` |
| 23 (part) | Evidence Board spacing; shared styles moved to base.css; guide Step 6; this file and architecture section 9 | `37420fc` and later |

## Not done (on purpose or waiting)

- **20c Rubric coding of claims:** waiting for the level descriptions from Papers 7 and 13 (must not be invented).
- **Device test** on a real Chromebook/tablet (`docs/device-test-checklist.md`) and the 12a-d sound/badge checks: Habiba.
- **Privacy note gaps:** data retention and consent wording ([TO DECIDE] with Prof and the school).
- **24 Deploy:** locked until "Prof confirmed". Fonts and Chart.js still load from the internet; local copies come with deploy.
- **Optional extras, may be cut:** fair-share blocks for the mean, guess slider, tap-a-bar in Graph Lab, drag evidence chips, a scenario-linked Chance Lab device.
