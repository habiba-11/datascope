# Prompt for Claude chat: explain DataScope to me (for my professor walkthrough)

## How to use this

1. In claude.ai, create a **Project** (e.g. "DataScope thesis") and add these files as project knowledge. A new chat works too: attach them to the first message.
   - **Must attach (the facts):** `CLAUDE.md`, `docs/architecture.md`, `docs/literature-key-findings.md`, `docs/build-progress.md`, `docs/change-summary-part-9-5.md`
   - **Strongly recommended (the code, so it can show real snippets):** everything in `js/` (`app.js`, `celebrate.js`, `welcome.js`, `teacher.js`, `js/helpers/*`, `js/storage/*`, `js/rooms/*`) and everything in `data/scenarios/`
   - Optional: `index.html`, `teacher.html`, and screenshots you want explained.
2. Paste everything between the two lines below as your first message.
3. It answers **one section per reply**. Type **"next"** to continue, or ask follow-up questions at any point.

---

You are my patient tutor. I am Habiba, a bachelor student at GIU (German International University). I built **DataScope: The Evidence Lab**, a website for Grade 5 PYP children (age 10–11) that guides them through a full data investigation: Ask, Plan, Collect, Explore, Conclude. My supervisor is Dr. Nada Ahmed Hamed Sharaf. I must explain **every feature and every user flow** to her and defend **why** each one is built that way, with **real references**.

My level: a capable beginner (about 2 out of 3 in HTML, CSS, JavaScript and Git). Explain in **simple words, short sentences and concrete examples**, but in **full detail**. Define every technical term the first time you use it (for example localStorage, seed, ES module, aria-live, JSON, CSV).

### Strict rules about references (very important)

- Cite **only** papers that appear in the attached `docs/literature-key-findings.md`. Use **its** paper numbers (Paper 1, 4, 5 … 30; some numbers like 2, 3, 14, 15, 22 and 27 are not in my list, so never cite them) and copy the full reference **from that file**.
- Only claim what that file says a paper found. If my file's summary doesn't support a point, say so; do not stretch it.
- Many decisions are **not** from my papers. They come from technical standards or engineering choices (for example WCAG colour contrast 4.5:1, 48px tap targets, reduced motion, privacy, seeded random numbers, no backend). Label each of these clearly as **"Design/engineering decision, not from my literature list"**. Where a well-known standard exists (for example WCAG 2.1 by the W3C), name it and tell me to **verify and add it myself** before citing it in the thesis.
- **Never invent** a paper, author, year, quote, statistic or pilot result. If you are unsure, write "⚠️ check this". Pilot results do not exist yet; never present synthetic data or tests as research findings.
- The survey data in the app is **synthetic** (a "pretend class"). Always describe it that way.

### What I built (ground truth, so you explain the real app)

**Architecture (4 layers, `docs/architecture.md` section 6):** (1) Investigation Shell (`js/app.js`, `js/celebrate.js`, `js/welcome.js`, `js/teacher.js`): step bar, Pip the owl mascot, badges, teacher view. (2) Six rooms (`js/rooms/*.js`). (3) Shared helpers (`js/helpers/`): `stats.js`, `generator.js`, `checker.js`, `charts.js`, `log.js`, `prompts.js`, `badges.js`, `summary.js`, `scenarios.js`. (4) Storage (`js/storage/save.js`, `export.js`). Plain HTML/CSS/JavaScript (ES modules), no framework, no backend, Chart.js 4.5.1 for charts, localStorage for saving, 65 automated tests with Node's built-in test runner (`node --test`).

**Synthetic data:** each scenario is a small JSON recipe (`data/scenarios/`). A seeded generator (mulberry32) builds a virtual class and **checks itself**: mean (rounded with `formatMean`), median, mode and range must match the recipe, or it tries the next seed. Scenario ID + seed recreate exactly the data a child saw. Four scenarios: sleep hours (one extreme value of 3 → mean 8.4 vs median 9), favourite playground game (categories → mode only), shoe sizes (two modes, 34 and 35), reading minutes Class A vs Class B (same mean 20, range 4 vs 30, shown side by side).

**Start page:** the child types a teacher-issued anonymous code (e.g. OWL-07). It must contain a letter and a digit, so a real name is refused. A small "For teachers" link opens the teacher view.

**Question Studio (Ask + Plan):** Task 1: pick one of 4 scenario cards. Task 2: fix two flawed survey questions until the question checker gives a green light (warnings for "not", leading words, a missing timeframe, yes/no-only questions, a missing "?"), plus a free practice box. Task 3 (Plan): predict the answer before collecting data (a number, or a category chip). The step bar shows Ask for Tasks 1–2 and Plan for Task 3.

**Data Hub (Collect):** "Run survey" reveals classmates one by one ("Classmate 7: 9 hours") while a tally grows; reduced-motion aware. For reading minutes, Class A is surveyed first, then Class B unlocks. Logs scenario + seed. Then a "Let's draw a graph!" button appears.

**Graph Lab (Explore 1):** the same data as bar, line, pie or dot plot; numbers written directly on the chart; pie slices named ("Football (6)"); a category axis for text data; straight lines (no curves that invent values); for Class A vs B, two charts on one shared scale. Reflection: "What does this graph tell you?" and "What does it NOT tell you?", with on-demand hints. Each chart has a spoken description for screen readers.

**Number Lab (Explore 2):** Task 1: predict the typical sleep hours (a number is required), then reveal mean/median/mode/range, then "Has the data changed your mind?" (keep, or change with a reason → logged as a revision). Meaning tasks: Task 2 "Build it" (5 numbers with mean 6); Task 3 "Find Mia's mistake" (she forgot to order the data); Task 4 real-life mode AND median with shoe-shop data 36, 34, 35, 34, 37, 36, 34 (mode 34 ≠ median 35). A wrong answer gives a kind hint and the child retries; each task is logged as correct / after-hint / incorrect (left unsolved). The feedback avoids the word "middle" ("the number in the centre after putting them in order").

**Chance Lab (Explore 3):** Task 1: pick a fair coin, dice, fair spinner or unfair spinner; all outcomes are listed first; spinners are drawn with slices sized by probability ("Red: 4 of 7 parts"). Task 2: certainty scale (impossible → certain) plus a required "Why?" with hints. Task 3: run 10 / 50 / 500 trials; theoretical ("1 in 6, about 16.7%") vs experimental bars; honest feedback that only says "closer to theory" if this bigger run really was closer than the previous one.

**Evidence Board (Conclude):** claim ("I think ___ because ___"), pick evidence chips (real stats from the chosen scenario), certainty + why, audience (principal / class / parent evening) + form (prediction / problem solved / recommendation) → an Evidence Card (typed text is shown safely as plain text). "📤 Save my work for my teacher" downloads a JSON file (a CSV link too) with only this child's entries and a "synthetic data" note.

**Reasoning log (thesis evidence):** events data-seen, prediction, revision, certainty, meaning-task, trials, hint, reflection, claim and teacher-tag, each with the anonymous code and a time. Typed answers are logged when the child leaves the box.

**Hints (prompt engine):** "💡 Need a hint?" on 5 open questions; up to 3 hints each, from a nudge question to a sentence starter; hint use is logged and never penalised.

**Badges:** counted from the log, once per reasoning moment (a reason for certainty, changing your mind with a reason, a solved meaning task, a real "NOT tell" answer, a full claim card); never for speed or clicking. Pip praises the specific reasoning; stars burst (none with reduced motion); sound is off by default with a toggle.

**Teacher view:** import many children's files; one row per child (meaning tasks ✅/💡/❌, hints, Chance Lab reasons, final claim); tag misconceptions from 8 literature-based tags (each shows its paper numbers); download one class CSV; two-tap remove; "clear children's work on THIS device" for shared devices.

**Accessibility and classroom:** axe-core audit with 0 violations; colour contrast fixed in design tokens; chosen answers show ✓ (colour is never the only signal); tap targets ≥ 48px; keyboard focus ring; headings h1 > h2 > h3; aria-live feedback; reduced motion respected; checked at iPad (768px) and Chromebook (1366×768) sizes. Privacy: codes only, no names, nothing sent to a server.

**Decisions made with my supervisor or myself:** synthetic data instead of real collection (Prof's decision); no small-group sampling yet (future work); English only for the pilot (Arabic RTL is future work); on reload only the code and the log are kept (rooms start fresh).

### What I want from you

Go through the sections below **one per reply**, and wait for me to type "next".

**For every room, feature and helper**, use this structure:
1. **What it is** (2–3 simple sentences, as if to a classmate).
2. **What the child sees and does**, step by step, including what happens on a wrong answer, an empty answer, or going Back.
3. **How it works inside**: which files and functions, explained simply, with one short code snippet from my attached files (only if attached; do not invent code).
4. **Why it is built this way**: the design rule (architecture section 3 table rows 1–9), the paper number(s) and what each paper found (from my file), and the **gap it fills** (architecture section 4).
5. **Not from my papers**: the engineering or standard reasons, labelled as described above.
6. **Limitations and honest trade-offs** (e.g. synthetic data vs real data collection: Papers 5 and 17 per my architecture doc).
7. **3 questions my professor might ask, with short model answers** in my voice.

**Sections (one per reply):**
1. The big picture: the one-sentence thesis claim, the PPDAC/investigation cycle, the 4 layers, why no framework and no backend, how the files are organised.
2. Synthetic data: the recipes, the seeded generator, the self-check, the 4 scenarios and what each one teaches.
3. Start page and anonymous codes, privacy, storage (localStorage, the in-memory fallback, what is kept on reload).
4. Question Studio (Ask + Plan) and the question checker.
5. Data Hub.
6. Graph Lab (chart types, direct labels, the "NOT tell" question, Class A vs B on a shared scale).
7. Number Lab (predict → reveal → revise, the meaning tasks, retry with hints, avoiding "middle").
8. Chance Lab (outcomes first, the unfair spinner, the certainty scale + why, trials, honest feedback).
9. Evidence Board (claim + evidence + certainty, audience and form, save for teacher).
10. Reasoning log + hints (prompt engine) + badges: what is recorded, why, and how it becomes thesis evidence (rubric levels from Papers 7 and 13).
11. Teacher view (import, summary, misconception tags, class CSV, clearing a shared device).
12. Accessibility, classroom and safety (contrast, ✓ signals, 48px targets, keyboard, screen readers, reduced motion, safe text display, CSV formula safety).
13. Testing: what the 65 automated tests check, the browser checks, the bug-fix pass (from `change-summary-part-9-5.md`), and what is still untested (real device, pilot).
14. **Every user flow**, as numbered step lists, including branches:
    - a child's full happy path, from the start page to the saved file;
    - each scenario's path (sleep, playground, shoe sizes, reading A vs B);
    - wrong answers → hint → retry; leaving a task unsolved;
    - typing a name instead of a code; arriving in a room without a code; storage blocked;
    - going Back and choosing a different scenario; reloading the page; coming back on another day;
    - two children sharing one device; saving without a code;
    - the teacher flow: collect files → import → read the table → tag → class CSV → clear a device;
    - a keyboard-only user; a screen-reader user; a user with reduced motion.
    Then draw a simple text flow diagram of the whole site.
15. A **one-page cheat sheet** for my walkthrough: each feature → its paper(s) → the gap it fills → a one-line "why".
16. A list of everything I should **verify or add myself** before submitting: references marked ⚠️, any standards to cite, screenshots to take, and a reminder to **declare AI assistance** (Claude Code built the code with me; Claude chat explained it) as the GIU regulations require.

Start with section 1.

---
