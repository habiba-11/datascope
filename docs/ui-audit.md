# UI audit: before and after the 3-zone layout (28 Oct 2026)

Rules and frames: `docs/design/ui-ux-guide.md` (section 2 checklist). Screenshots: `docs/screenshots/ui-before/` and `docs/screenshots/ui-after/`.

**How it was measured (same script both times):** Playwright with the installed Chrome at 1366×768, reduced motion, teacher preview on, sleep-hours scenario. Each task or step was shown in turn.
- **Buttons:** every visible button or link-button on the page. Both times this includes 8 that are always there: the 5 trail stops, (i), the backpack and Sound.
- **Primary-looking:** a filled, coloured button that is not a chosen answer.
- **Sentences:** the instruction sentences of at least 3 words in the task area, including Pip's line. Before, Pip's line was in the sidebar, so the "before" column shows card + Pip.
- **Height:** the page height in px, which shows how much a child must scroll.

| Screen | Buttons before → after | Primary-looking before → after | Sentences before (card + Pip) → after | Height before → after (px) | What moved out |
|---|---|---|---|---|---|
| Welcome | 2 → 2 | 1 → 1 | 4 → 5 | 768 → 844 | Teacher's view became a quiet button |
| Question Studio: pick | 14 → 13 | 1 → 1 | 2 + 2 → 2 | 853 → 904 | "Ask" phase chip (the trail shows it); cards are radio choice cards |
| Question Studio: fix-its | 10 → 9 (per fix-it) | 1 → 1 | 3 + 2 → 2 | 1056 → 768 / 900 | One fix-it per step; Hint in the action bar; bonus folded away |
| Plan: guess | 11 → 9 | **2 → 1** | 1 + 2 → 2 | 768 → 768 | "Save my guess" is the only primary |
| Data Hub: before survey | 9 → 10 | 1 → 1 | 3 + 2 → 4 | 768 → 942 | Pretend-class sentence became a pill; Back added |
| Data Hub: after survey | 10 → 10 | **2 → 1** | 4 + 2 → 4 | 902 → 943 | Disabled "Survey done!" removed; the long list became a seat grid |
| Graph Lab | 18 → 14 | 1 → 1 | 3 + 2 → 2 | **1416 → 1064** | One question per step; segmented chart switch; both hints in the action bar |
| Number Lab: task 1 | 15 → 11 | **2 → 1** | 2 + 2 → 3 | 838 → 768 | "Show the numbers" + Next became one primary; Recap in the top bar |
| Number Lab: task 2 | 15 → 11 | **2 → 1** | 4 + 2 → 4 | 836 → 768 | "Check my numbers" + Next became one primary |
| Number Lab: task 3 | 16 → 13 | 1 → 1 | 2 + 2 → 3 | 932 → 959 | Stepper replaces "Task 3 of 4" |
| Number Lab: task 4 | 19 → 16 | 1 → 1 | 2 + 2 → 3 | 932 → 959 | The median question shows only after the mode question |
| Chance Lab: pick | 17 → 14 | 1 → 1 | 3 + 2 → 3 | 876 → 768 | Outcomes show only after a pick; device cards are radio choice cards |
| Chance Lab: how likely | 19 → 15 | 1 → 1 | 2 + 2 → 4 | 919 → 901 | Hint in the action bar |
| Chance Lab: test | 16 → 13 | **4 → 1** | 2 + 2 → 5 | 791 → 768 | 3 yellow run buttons became a 10 / 50 / 500 switch + one run button |
| Evidence Board: claim | 13 → 12 | **2 → 1** | 3 + 2 → 5 | 848 → 956 | "Save my claim" + Next became one primary; the card is shown beside the task |
| Evidence Board: proof | 15 → 16 | 1 → 1 | 1 + 2 → 3 | 768 → 956 | (the live card is the new second panel) |
| Evidence Board: how sure | 18 → 17 | **2 → 1** | 2 + 2 → 4 | 948 → 1007 | "Make my Evidence Card" is the only primary |
| My journey | 12 → 13 | 1 → 1 | 5 + 1 → 5 | **1566 → 1298** | Trail and ID card side by side; extra answers behind "See more" |
| Teacher dashboard | 5 → 5 | 0 → 0 | 2 → 2 | 983 → 983 | Unchanged layout (adult tool); buttons now white secondary instead of browser grey |

**Summary**
- **Primary buttons:** every child screen now has exactly one. Before, 7 screens had 2 to 4.
- **The Pip sidebar is gone.** Pip is a one-line guide inside the task card, and the card takes the full width.
- **Buttons:** fewer on most screens (for example Graph Lab 18 → 14, Number Lab 15 → 11). Evidence Board stays about the same because of its 5 certainty words and the proof chips, and Data Hub and My journey gained a Back button.
- **Height:** some screens are taller because the card now holds 2 panels side by side, with bigger text (body at least 17px, questions 30px). The longest screens got much shorter: Graph Lab −352 px, My journey −268 px.
- **Known exceptions to "max 4 choices":** the certainty scale has 5 words (Papers 12, 13, 19), and the playground guess has 5 games, because the choices must match the data.

**Thesis note:** one primary action per screen, one task per step (mini stepper) and progressive disclosure (Hint, (i), 📘 Recap, "See more") follow the guided-inquiry design for young learners (Papers 23 to 25). This table and the screenshots are the evidence. Pilot effects are **not** claimed here.
