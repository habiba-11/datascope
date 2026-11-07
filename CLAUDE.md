# DataScope: instructions for Claude (read this first, every session)

## Who I am and what we are building
- I am **Habiba**, a bachelor student at GIU. I build and test this project. My supervisor (Prof) is **Dr. Nada Ahmed Hamed Sharaf**.
- **DataScope: The Evidence Lab** is a real website (not a mockup) for **Grade 5 PYP students (age 10 to 11)**. Children run a full data investigation: Ask, Plan, Collect, Explore, Conclude.
- The full approved design is in `docs/architecture.md`. The research behind every design rule is in `docs/literature-key-findings.md` (paper numbers match). Read both before planning anything. Never invent facts about the papers.
- Notes between sessions are kept in `docs/project-notes.md` (how to run, test and deploy, the database rules, the decisions, the open items). Read it at the start of every session. (Since 5 Nov 2026 it replaces the old build log, plans and guides; they are in Git history, see its last section.)

## My setup
- Windows 11, VS Code, Git, Node.js and a GitHub account are all installed. Give terminal commands for **PowerShell** in the VS Code terminal.
- My level: about 2 out of 3 in HTML, CSS, JavaScript, Git and the terminal. I'm a capable beginner, so don't talk down to me and don't skip steps.

## How to work with me (mentor mode)
- You are my patient senior-developer mentor. Work **one small part at a time** (about 30 to 60 minutes of work each). Never build the whole app at once.
- **Explanations: short.** Give steps first, then a small "Why?" box of 2 to 4 lines. Give longer explanations only when I ask.
- Before you create or edit files, tell me in 2 to 3 lines what you will change and why. Keep each change small enough for me to read and understand. I must understand all the code, because I defend it in my thesis.
- Before any terminal command, say in one line what it does.
- After each step, give a **"You should see..."** checklist, then **stop and wait** until I say it works or paste an error. If there's an error, explain it in plain words first, then fix it.
- At the end of each part, give me:
  - a Git commit message
  - a **thesis note**: one line for the Implementation chapter, with the paper number when relevant
  - what to keep for the thesis (screenshot, code snippet, design decision)
- If something I ask contradicts this file or `docs/architecture.md`, tell me before doing it.

## Decisions already made (do not reopen without asking me)
- **Tech:**
  - Plain HTML, CSS and JavaScript (ES modules). No framework, no build tools, no TypeScript. (Backend: see "Round 2" below, decided 27 Oct 2026.)
  - Chart.js for charts.
  - Save in the browser (localStorage) first, then send to the online database (Supabase) when online. CSV/JSON files are only a fallback when the database is switched off.
  - Host on GitHub Pages.
- **Running locally:** use the VS Code **Live Server** extension, because ES modules and loading JSON files do not work from `file://`.
- **Tests:** the stats engine and the data generator are tested with Node's built-in test runner (`node --test`). There is no extra library to install.
- **The 5 steps and 6 rooms:**
  - Question Studio covers Ask and Plan.
  - Data Hub covers Collect.
  - Graph Lab, Number Lab and Chance Lab cover Explore.
  - Evidence Board covers Conclude.
- **Four layers:**
  1. Investigation Shell: step bar, hints, badges, teacher view.
  2. The six rooms.
  3. Shared helpers: stats engine, chart helper, prompt engine, reasoning log, data generator, question checker.
  4. Storage.
- **Synthetic data (Prof's decision):**
  - Children do NOT collect real data. Each scenario has a small JSON recipe.
  - A seeded generator builds a virtual class's answers, then checks itself. The mean, median, mode and range must match the recipe, with no accidental ties. If the check fails, it tries the next seed.
  - The "Run survey" button reveals answers one by one ("Classmate 7: 9 hours") while a table and tally grow.
  - Save the scenario ID and seed, so the exact data a child saw can be recreated.
  - Label the data as synthetic ("a pretend class") in the app.
- **Example scenarios (to be finalised with me):**
  - sleep hours with one extreme value (mean vs median)
  - favourite playground game (mode for categories)
  - shoe sizes with two modes
  - reading minutes, Class A vs Class B (same mean, different spread)
- **Room by room:**
  - **Question Studio:** a question checker warns about "not", leading words, a missing timeframe, and yes/no-only questions. Children fix flawed example questions.
  - **Number Lab:** the child predicts first, then the app reveals mean, median, mode and range, followed by meaning tasks (build a dataset with a given mean, find the mistake, real-life median and mode).
  - **Chance Lab:** list all outcomes first, predict, run 10 / 50 / 500 trials, then compare theoretical vs experimental probability. Include unfair spinners and a certainty scale (impossible to certain).
  - **Evidence Board:** Claim + Evidence + How sure, and why. (The audience/form task was removed on 26 Oct 2026, Habiba's decision; a "📋 My findings" summary helps the child before the claim.)
- **Reasoning log:** records predictions, revisions, certainty ratings and meaning-task results, under anonymous codes only. It is my thesis evidence.

## UI design: VERY IMPORTANT
The app must be **colourful, playful, engaging for young kids, and very simple**. The goal is "a fun science lab for kids", not "a school form".
- **Mascot:** an original, friendly guide character (for example a round, smiling "data detective" with a magnifying glass; invent our own, never a known character). It greets the child, gives hints in speech bubbles, and celebrates good reasoning.
- **Colours:** bright, cheerful and warm. Each room has its own colour, used on its step-bar icon and page accent, so children always know where they are. Use a light, soft background and dark text for readability.
- **Shapes:** rounded corners everywhere, chunky "bouncy" buttons with a soft shadow that press down when tapped, and big friendly icons or emoji next to every label.
- **Fonts:** one rounded, kid-friendly font for headings (for example Baloo 2 or Fredoka) and a very readable font for body text (for example Nunito). Text size at least 18px, headings big.
- **Simplicity:**
  - One task per screen, few words, short sentences.
  - One clear big "Next" action per screen.
  - No clutter, and no more than 3 choices at once where possible.
- **Engagement:**
  - Small happy animations (answers popping into the table, the tally growing).
  - Confetti or stars when the child explains their reasoning (badges reward good reasoning, never speed).
  - Sound effects on by default, with a toggle to turn them off (changed 5 Nov 2026, Habiba; was off).
- **Kids and classroom rules:**
  - Works on Chromebooks and tablets: touch-friendly, tap targets at least 48px, no hover-only features.
  - Colour is never the only signal (always add an icon or word).
  - Respect "reduced motion" settings.
  - Good contrast.
- **Charts:** simple bright colours, labels directly on the chart, big readable numbers.
- Before building screens (Part 1), propose 2 to 3 short design directions (palette, fonts, mascot idea) and let me choose. Then put all colours, fonts and sizes as CSS variables in one file, so the whole look can be changed in one place.

## Target folder structure (grow it part by part, do not create it all at once)
```
datascope/
  index.html            (shell: welcome + step bar)
  css/                  (theme.css = design tokens, base.css, one file per room)
  js/
    app.js              (shell / navigation)
    rooms/              (one file per room)
    helpers/            (stats.js, generator.js, checker.js, log.js, charts.js, prompts.js)
    storage/            (save.js, export.js)
  data/scenarios/       (one JSON recipe per scenario)
  assets/               (mascot, icons, sounds)
  tests/                (node --test files)
  docs/                 (architecture, literature, project-notes, design/)
```

## Build plan (adapt with me; one part at a time)
- **Part 0:** project folder, Git repo, Live Server, first colourful "Hello DataScope" page, push to GitHub.
- **Part 1:** design tokens and the Investigation Shell (mascot, step bar, moving between empty, colourful room pages).
- **Part 2:** stats engine (mean, median, mode, range) with tests for tricky cases: even count, unordered data, ties or two modes, categories.
- **Part 3:** scenario recipes (JSON), seeded generator, self-check, with tests.
- **Part 4:** Data Hub ("Run survey" reveals answers one by one; table and tally grow).
- **Part 5:** Graph Lab (Chart.js, switch chart types, direct labels, "What does this graph NOT tell us?").
- **Part 6:** Number Lab (predict, reveal, meaning tasks).
- **Part 7:** Question Studio and the question checker.
- **Part 8:** Chance Lab.
- **Part 9:** Evidence Board.
- **Part 10:** reasoning log, saving, CSV/JSON export.
- **Part 11:** polish, accessibility, teacher view, testing on a Chromebook or tablet.
- **Part 12:** deploy to GitHub Pages, demo video, thesis screenshots and documentation.

Final deliverables: source code on GitHub, a live GitHub Pages link, a recorded demo video, and an offline copy.

## Open questions: ask me when we reach the part that needs them (short, multiple-choice, with your recommendation)
- **Small group vs the whole class:** the generator only controls the full class. Decide how to handle a child surveying a small group first.
- **Teacher view without a backend:** each child's work stays on their device. Plan an export-and-import flow for the teacher.
- **Scenarios:** the final 4 to 6, each with one learning outcome, its numbers (class size, range, extreme values, modes), and the Chance Lab games.
- **Classroom:** language (English only, or also Arabic right-to-left), school devices and browsers, internet reliability, one device per child or pairs, session length, and how children get their anonymous code.
- **Pilot evaluation:** pre/post comparison with a rubric (papers 7 and 13), or a case study using the reasoning log.

## Rules
- **Privacy:** no real names or personal data anywhere. Use kid-friendly invented classmate names or "Classmate 7", and anonymous codes only.
- **Integrity (GIU regulations section 7):**
  - Synthetic datasets are teaching material only, labelled as synthetic, and never presented as research results.
  - Never invent pilot results.
  - Remind me to declare AI assistance in my thesis.
- Keep code simple and readable: clarity over cleverness, small files, one job per file, simple comments.
- Be honest about difficulty. If a part is too big, split it.

## Session routine
- **Start:** read `docs/project-notes.md`, then ask what we're working on, whether the last change worked, and how much time I have today.
- **End:** update `docs/project-notes.md` (keep it ONE short file): new decisions, open items and anything needed later.

## Round 2 (Prof feedback, 25 Oct 2026)
- Round 2 is finished. Its plan (`docs/round-2-plan.md`) was removed on 5 Nov 2026 and is in Git history; the decisions that still hold are below and in `docs/project-notes.md`.
- **Backend (decided 27 Oct 2026, replaces "optional bonus"):** Supabase (PostgreSQL + row-level security + teacher login), called with plain `fetch()` (no Supabase library). Settings in `js/config.js` (`enabled` switch). Offline-first: the log is saved in the browser at once and sent to the database when online (retry, no duplicates).
  - **No files for children or the teacher:** with the database on, children's work goes online by itself and the teacher sees it on the dashboard after an email + password login (replaces the PIN). **Changed 4 Nov 2026 (Habiba): no files at all.** The child's "Save my work" files and the teacher's file import were removed; everything goes online. The browser keeps each moment only until it is sent (offline-first).
  - **Security:** children (publishable key) may only ADD log entries; only a logged-in teacher (listed in the `teachers` table) may read or delete. Never put the secret key in the website.
  - **Ethics:** Prof and the GIU ethics check agreed (Habiba, 4 Nov 2026), so real children's work may go online, under anonymous codes only. Delete the TEST- codes from the database before the pilot (`docs/project-notes.md`, section 4).
  - Database notes: `docs/project-notes.md`, section 3 (the step-by-step setup guide is in Git history). Database script: `backend/schema.sql`.
- **Rewards stay about good reasoning, never speed.** No timers, no leaderboards, no comparing children.
- **Demo data is labelled DEMO** everywhere it appears and is **never exported**.
- **Deploy is locked** until I write "Prof confirmed".

## Round 3 (Prof feedback, 2 Nov 2026)
- Round 3 is finished and the site is live (https://habiba-11.github.io/datascope/, since 4 Nov 2026). Its plan was removed on 5 Nov 2026 and is in Git history; the decisions below still hold.
- **Working mode:** one part at a time. Stop and wait after each part. I make the commits.
- **Tutorial → story (replaced in Round 4, Part 44, 6 Nov 2026):** the 6-scene film of Round 3 is gone. Its place is the story (see Round 4 below). There is **no timer anywhere**: nothing moves on by itself.
- **Charts:** 18px bold navy text, word labels ("Size 34", "5 kids") and an axis title ("Number of kids"). Line charts use a true number line. Games get no line, and the app explains why.
- **Hints give answers:** the first 💡 tap shows 3 true answers. Tap is the main way, drag is a bonus, and the child can edit or write their own. A tap adds to any text already in the box. Numbers come from `stats.js`; the words live in `data/content`.
- **Where hints give answers:** Graph Lab, Chance Lab why, Evidence Board and the change-my-guess reason. Not the fix-its or the bonus question, except that the last fix-it hint's idea can be tapped into the box (changed 4 Nov 2026, Habiba; logged as hint-picked).
- **Thesis data:** every answer logs `answerSource` (own / hint / hint-edited). Only own and hint-edited answers count as evidence of reasoning, and results report them apart.
- **Rewards:** stars ignore where an answer came from, so a hint never costs a star. Graph Skeptic, Why-Wizard and Because Builder need own or edited words.
- **Mean task:** keep 5 numbers, with a worked example beside the question. All-same answers are correct and logged as `allSame`.
- **Room summary:** a "📖 About this room" tab on the task card. The pop-up still opens once, and the (i) button is removed.
- **Checker:** accepts specific and regular time phrases, and vague words still ask "When?" (Paper 28).
- **Live site (changed 4 Nov 2026):** the database is ON (Prof and the ethics check agreed). The teacher logs in with the email + password in the database. The PIN stays as it is, stored only as a hash; it is only asked when the database is off. Claude commits and pushes; Habiba switches on GitHub Pages herself. The repo stays public.

## Round 4 (pilot feedback, 5 Nov 2026)
- Real Grade 5 children tried DataScope. Their feedback (purpose unclear, "boring", several unclear screens) is fixed in Parts 42 to 51. Every part's date and commit is in `docs/project-notes.md`, section 9. This overrides "only fix real bugs during the pilot".
- **Working mode:** one part at a time; after each part run `npm test`, check Chrome at 1366 and 768, then Claude commits. **Never push until Habiba writes "push".**
- **Reasoning log:** never rename a field; add new events or fields (so far: events `mission-seen`, `idle-help-shown`, `idle-help-taken`, `fixit-choice`, `bonus-seen`, `bonus-choice`, `tray-intro-seen`; field `usedHint` on Build it).
- **Purpose (Part 42):** a Mission card per scenario after picking it, a "🎯 Why?" line per room. **Rejected by Habiba (6 Nov 2026), do not add back:** Evidence Card stickers, a mission bar, an audience sentence ("tell the principal"), "🎯 For your mission" on the end-of-room cards.
- **Background (6 Nov 2026):** only drifting clouds plus each room's own shapes in the side margins. **Rejected, do not add back:** birds, sun, flowers, butterfly, swaying hills.
- **Liveliness (Part 43, decided 6 Nov 2026):** Pip beside the card at 1366, bigger inside the card below that; idle help after 10 seconds, at most once per screen; background music on but quiet, with its own switch; one composed loop shared with the story.
- **Story (Part 44, built 6 Nov 2026):** looks like `docs/design/frames/datascope-story-ui.html` (scenes copied from it, stage fills the window), without the sun, birds, flowers and the class size. Read-aloud in the story only (own switch, on by default), the clearest English browser voice. No timer: Next and Back only.
- **Choosing vs answering (Part 48, 7 Nov 2026):** a green ✓ means "right answer". A plain choice (which graph to draw) is a navy, pressed, underlined tab, never a green ✓. Graph Lab: a "Pick a graph to draw" toolbar on top of the chart with "Graphs tried: N of 4".
- **Devices:** laptops and PC screens only (1366x768 matters most).
