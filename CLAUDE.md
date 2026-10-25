# DataScope: instructions for Claude (read this first, every session)

## Who I am and what we are building
- I am **Habiba**, a bachelor student at GIU. I build and test this project. My supervisor (Prof) is **Dr. Nada Ahmed Hamed Sharaf**.
- **DataScope: The Evidence Lab** is a real website (not a mockup) for **Grade 5 PYP students (age 10 to 11)**. Children run a full data investigation: Ask, Plan, Collect, Explore, Conclude.
- The full approved design is in `docs/architecture.md`. The research behind every design rule is in `docs/literature-key-findings.md` (paper numbers match). Read both before planning anything. Never invent facts about the papers.
- Progress between sessions is kept in `docs/build-progress.md`. Read it at the start of every session.

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
  - Plain HTML, CSS and JavaScript (ES modules). No framework, no build tools, no TypeScript, no backend.
  - Chart.js for charts.
  - Save in the browser (localStorage), and export CSV/JSON.
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
  - **Evidence Board:** Claim + Evidence + How sure, and why, for a real audience.
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
  - Sound effects off by default, with a toggle.
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
  docs/                 (architecture, literature, build-progress)
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
- **Start:** read `docs/build-progress.md`, then ask what part we're on, whether the last part worked, and how much time I have today.
- **End:** update `docs/build-progress.md` with what's done, what's next, known bugs, and decisions made.

## Round 2 (Prof feedback, 25 Oct 2026)
- The Round 2 plan lives in `docs/round-2-plan.md` (Parts 13 to 24). Read it right after `docs/build-progress.md` at the start of every session. It replaces Parts 11 to 12 of the build plan above (deploy is now Part 24).
- **Backend is an optional bonus (Part 22), behind a config flag** (`enabled: false` by default). This is an explicit exception to "no backend" above. The app must work fully with the flag off.
- **Rewards stay about good reasoning, never speed.** No timers, no leaderboards, no comparing children.
- **Demo data is labelled DEMO** everywhere it appears and is **never exported**.
- **Deploy is locked** until I write "Prof confirmed".
