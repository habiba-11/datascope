# Change summary: Round 3 (Prof feedback, 2 Nov 2026)

What each Prof comment became is in `docs/architecture.md`, section 10. This file lists the work part by part, with its commit, so every change can be traced.

**Tests:** `node --test` = 286 pass, 0 fail (was 211 at the start of Round 3).
**Browser checks:** see "Part 35 check" below.

| Part | Prof | What | Commit |
|---|---|---|---|
| 25 | 4, 8 | "Show statistics"; the checker knows many more time phrases (16 of 64 tried phrases passed before) and 5 bugs fixed | `fa14107` |
| 26 | 2 | Chart text 18px bold navy, "Size 34" / "5 kids" / "Number of kids", pie with outside counts and a colour key | `5211ec5` |
| 27 | 2 | Line chart on a true number line; games explain why there is no line | `5211ec5` |
| 28 | 7, 2 | Chance Lab one row per outcome, no brackets, 18px; Data Hub tally in chart words | `3f35b92` |
| 29 | 5 | Build it: a worked example beside the boxes; all-same answers logged | `abb40b1` |
| 30 | 3 | Answer hints in Graph Lab: tap, drag or edit; own / hint / hint-edited logged | `3163e81` |
| 31 | 3 | The same in Chance Lab, Evidence Board and the change-my-guess reason | `4ec5a33` |
| 32 | 3 | Badges need own or edited words; stars unchanged; 8 thesis columns; the teacher sees each source | `3ae4bfb` |
| 33 | 6 | "📖 About this room" tab with "You are done when..."; (i) removed | `cdbcb1d` |
| 34 | 1 | Start-page tutorial: an animated film with Pip, following Habiba's design (f0) | `4f5b6a6` |
| 35 | all | Full check, text sizes, an accessibility fix, these docs | (this part) |

## Part 35 check (3 Nov 2026)

A fresh child ran a whole investigation the real way (no teacher preview), from the start page and tutorial to My journey, in Chrome with reduced motion and the online database blocked: all 4 questions at 1366×768, and sleep and games at 768×1024. Every run reached My journey with all 7 phases "✅ Done". On every screen and pop-up it measured:

- **Page errors:** none.
- **Sideways scroll:** none.
- **Buttons under 44px:** none.
- **axe accessibility checks** (loaded into the test browser only): 2 real problems found and fixed. The scenario and device cards were radios that also said "pressed" (`aria-allowed-attr`), and the Class A / Class B headings in Number Lab skipped a level (`heading-order`). Two Data Hub warnings were the test measuring an empty page while it moved on to Graph Lab; they did not come back when checked on their own.
- **Text under 18px:** 13 kinds of text children read were raised to 18px (stat labels, certainty words, the code help line, the scenario question, checker tips, the badge line, the hint button, the pretend-class pill, room tools, pop-up lines). Left at 14 to 16px, to decide with Habiba: the step names, the mini stepper chips, the code / sound / online line and the ▼ on the About tab.

Not checked by the script: a real tablet or Chromebook, touch dragging, keyboard-only use, and a screen reader.

## Decisions made with Habiba (3 Nov 2026)

All 29 answers are in `docs/build-progress.md` (Decisions log) and in the Round 3 section of `CLAUDE.md`. Changed later on the way: the pie chart got a colour key (Habiba's reference picture), and the tutorial follows her f0 design with autoplay.

## Not done (on purpose or waiting)

- **36 Deploy:** locked until "Prof confirmed". Local copies of the fonts and Chart.js come with it: on 3 Nov 2026 Google Fonts timed out during testing and pages waited for it.
- **Real device and keyboard-only test:** Habiba (`docs/device-test-checklist.md`).
- **Small navigation labels under 18px** (step names, mini stepper, code / sound line): to decide with Habiba.
- **A page error from Part 21a's page fade** ("Transition was aborted because of invalid state"), when going from the start page to Question Studio with motion on. Children do not see it.
- **The checker:** "Do you know what game you like today?" still passes (an open word anywhere cancels the yes/no warning).
- **Rubric coding, retention and consent:** as in Round 2.
- **Thesis:** declare the AI assistance used to build DataScope (GIU regulations).
