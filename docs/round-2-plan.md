# DataScope Round 2: plan after Prof's feedback

Save this file as `datascope/docs/round-2-plan.md`. Claude in VS Code reads it at the start of every session and works on **one part at a time**.

Last updated: 25 Oct 2026 · Owner: Habiba · Supervisor: Dr. Nada Ahmed Hamed Sharaf

---

## 1. What Prof asked for (her 8 comments + deploy)

| # | Comment | Where it lives in this plan |
|---|---------|-----------------------------|
| 1 | A pop-up for each phase that briefly explains what the phase does | Parts 13, 14 |
| 2 | Phase bar unlocks one phase at a time, after the previous one is done (not all visible at once) | Part 15 |
| 3 | Instant feedback for the student after each phase | Part 16 |
| 4 | Questions simpler (wording and structure) for a Grade 5 student, and tied to the scenario chosen at the start | Part 17 (a to d) |
| 5 | Recap of mean / median / mode as a pop-up: what they do and how they are calculated | Part 18 |
| 6 | Student dashboard that summarises the student's journey, linked to a hidden teacher dashboard that gathers detailed info for thesis results | Parts 19, 20 |
| 7 | Backend + database (bonus) | Part 22 |
| 8 | More motion, more interactive, more gamified | Part 21 (a to d) |
| 9 | Deploy, **only after Prof confirms** | Part 24 (locked) |

---

## 2. What the current code does (facts that shape the plan)

Read from the code, not guessed:

1. **Step bar (`js/app.js`).** `mountShell()` renders all 5 steps as links, every time. There is no "progress" state anywhere, and any room can be opened by typing its URL.
2. **Number Lab is hard-wired to sleep hours.** `js/rooms/number-lab.js` always loads `sleep-hours.json`. Its log entries say `'typical hours of sleep'`. Its meaning tasks (Mia's median, the shoe shop) are the same for every scenario. A child who picks *Playground games* still gets sleep numbers. **This is the root cause of comment 4.**
3. **Chance Lab ignores the scenario.** Coin, dice and spinners are generic.
4. **Question Studio fix-it examples** ("Isn't staying up late bad for you?", "Do you like games?") are the same whichever scenario was picked.
5. **Graph Lab has no completion gate.** The "Next: Number Lab" link is always visible.
6. **Teacher view** (`teacher.html`) is linked from the welcome page, so it is not hidden. It works by importing the children's JSON files. `parseExportFile` rejects any `formatVersion` other than 1.
7. **The reasoning log has no timing or phase events**, so "time per phase" or "when did the child finish Collect?" cannot be answered yet.
8. **There is no pop-up component.** Motion is CSS keyframes in `base.css` and `shell.css`, plus `motion.js`. Sounds are Web Audio, with no sound files.
9. Good news: everything goes through `storage/save.js`, the log goes through `helpers/log.js`, and there are 33 passing tests. New features can plug into those.

---

## 3. Decisions and assumptions (Claude: confirm each with Habiba before the part that needs it)

| # | Decision / assumption | Why | Needs Prof? |
|---|----------------------|-----|-------------|
| D1 | **Explore's three rooms unlock in order**: Graph Lab, then Number Lab, then Chance Lab. **Conclude** appears after all three. | Matches comment 2 and the architecture order. | Mention in next meeting |
| D2 | Progress is saved **per child code + scenario**. Starting a new investigation resets the bar to *Ask*, but the log keeps everything. | Teacher dashboard can compare scenarios per child. | No |
| D3 | The phase-intro pop-up shows **once automatically** per phase, with an ℹ️ button to reopen it. | Helpful, not annoying. | No |
| D4 | Phase feedback is **rule-based** (no AI API). | Works offline, free, private, explainable in the thesis. | No |
| D5 | **Backend is a bonus and optional.** The app must keep working with no backend (flag `enabled:false`). | CLAUDE.md says "no backend for v1"; this is an explicit exception, recorded in CLAUDE.md. | Yes, she listed it |
| D6 | **"Hidden" teacher dashboard = not linked from any child page.** On a static site this is only a speed bump, not security. Real protection needs login (Part 22). | Honest about what hiding can and cannot do. | Mention |
| D7 | **Rewards stay about good reasoning, never speed.** No timers, no leaderboards, no child-vs-child comparison. | Papers 26 and 30; architecture row 9. Applies to all gamification in Part 21. | No |
| D8 | **Children's reasoning data on a cloud database needs school/ethics approval**, even with anonymous codes. | GIU regulations ask for an ethical self-assessment. Habiba checks with Prof before any real child uses a backend build. | Yes |
| D9 | **Demo data in dashboards must be clearly labelled DEMO and never exported as results.** | Integrity rule: never invent pilot results. | No |

---

## 4. Rules for EVERY part (carried over from CLAUDE.md, plus new ones)

- Mentor mode: before editing, say in 2 to 3 lines what you will change and why. Short explanations. End with a "You should see..." checklist, then **stop and wait**.
- Plain HTML/CSS/JS (ES modules). **No framework, no build tools.** A new library (e.g. GSAP) needs Habiba's OK first.
- `node --test` must stay green (33 tests now). Add tests for every new pure helper.
- **Never hard-code an answer.** Compute answers with `stats.js` from the scenario data.
- Anything a child typed is shown with `textContent`, never `innerHTML` (existing rule).
- New log event types go into `EVENT_TYPES` in `helpers/log.js` and get a test. Do **not** rename existing event types.
- Accessibility: tap targets at least 48px, colour is never the only signal, `prefers-reduced-motion` respected, dialogs trap focus and close with Esc.
- Language: Grade 5 reading level (see Part 17 rules) for every child-facing string.
- End of every part: update `docs/build-progress.md`, give a **Git commit message**, a **one-line thesis note**, and **what to keep** (screenshot / snippet / decision).

---

## 5. Parts at a glance

Size: **S** about 1 session · **M** 2 to 3 sessions · **L** 4 or more sessions.

| Part | Title | Prof # | Size | Needs |
|------|-------|--------|------|-------|
| 13 | Pop-up component (modal) | 1, 3, 5 | S | none |
| 14 | Phase intro pop-ups | 1 | S | 13 |
| 15 | Progress engine + progressive step bar | 2 | M | none (14 helps) |
| 16 | Phase-end feedback card | 3 | M | 13, 15 |
| 17a | Content layer + Grade 5 rewrite: Question Studio (Ask, Plan) | 4 | M | none |
| 17b | Same for Number Lab (also fixes the sleep-hours hard-wiring) | 4 | M | 17a |
| 17c | Same for Graph Lab + Chance Lab | 4 | M | 17a |
| 17d | Same for Data Hub + Evidence Board + hints + Pip lines | 4 | S | 17a |
| 18 | Mean / median / mode recap pop-up | 5 | S | 13, 17b |
| 19 | Student journey dashboard | 6 | M | 15, 16, 17 |
| 20 | Hidden teacher dashboard (local-first) | 6 | L | 19 |
| 21a-d | Gamified motion and interaction | 8 | L (split) | content stable (after 17) |
| 22a-e | Backend + database (BONUS) | 7 | L | 20, Prof OK, ethics |
| 23 | Final QA + docs + thesis material | n/a | M | all above |
| 24 | Deploy | 9 | S | **LOCKED until Habiba says "Prof confirmed"** |

**Cut list if time runs short (cut from the top):** 1) Part 22 backend, 2) fancy drag interactions in 21c (keep the median card-sort), 3) the scenario-linked Chance Lab device in 17c. **Never cut:** 13 to 16, 17, 18, 19, and the thesis-metrics export in 20.

---

## 6. Part specs

### Part 13: Pop-up component (modal)
**Goal:** one reusable, accessible pop-up used by phase intros (14), feedback (16) and the recap (18).
**New:** `js/ui/modal.js`, `css/modal.css`, `tests/modal-queue.test.js`. **Changed:** link `modal.css` in every `rooms/*.html`.
**Build:**
- `openModal({ icon, title, body, buttons, accent, dismissible })`. `body` is a DOM node or plain text (never raw HTML from a child).
- Dialog semantics: `role="dialog"`, `aria-modal`, labelled by the title. Focus moves in, is trapped, and returns to the old element on close. Esc and a big ✕ close it (when `dismissible`). The page behind does not scroll.
- One pop-up at a time. Extra ones wait in a queue (pure helper, tested in Node).
- Pip appears in the pop-up header. Bouncy pop-in, switched off by reduced motion. Buttons at least 48px.
- Use a tiny temporary demo page to check it, and delete it afterwards.
**You should see:** a pop-up opens with a pop-in, Tab stays inside it, Esc closes it, focus goes back to the button you pressed, two pop-ups in a row show one after the other.
**Thesis note:** a shared pop-up gives consistent guidance (guided inquiry, Papers 23 to 25).

### Part 14: Phase intro pop-ups
**Goal:** each phase starts with a short "what happens here" pop-up (comment 1).
**New:** `data/content/phases.json`. **Changed:** `js/app.js` (ℹ️ button in the header), each room file (call the intro), `storage/save.js` (remember "seen" per child + phase).
**Draft copy (Claude may polish, but keep it this short and simple):**

| Phase | Title | Text (max 3 bullets, each under 10 words) |
|-------|-------|-------------------------------------------|
| Ask ❓ | Ask a question | Pick a question to explore. · Check that it is a good question. · Fix questions that are not clear. |
| Plan 🗺️ | Make a plan | Guess the answer before you look. · Scientists guess first, then check. |
| Collect 📋 | Collect data | Ask our pretend class your question. · Watch the answers pop in. · This class is made up, just for learning. |
| Graph Lab 📊 | Draw graphs | Turn answers into pictures. · Try different graphs. · Ask: what can it NOT tell us? |
| Number Lab 🔢 | Find the numbers | Find the mean, median, mode and range. · Each one tells a different story. |
| Chance Lab 🎲 | Test chance | List everything that could happen. · Guess, then test many times. · Compare "should happen" with "did happen". |
| Evidence Board 🚩 | Show your evidence | Say what you found. · Show your proof. · Say how sure you are. |

**Behaviour:**
- Opens automatically the first time a child enters that phase. A ℹ️ button in the header reopens it.
- Ask and Plan share a page, so the Plan intro opens when the child reaches Task 3.
- Each Explore room has its own intro.
- Log `popup-seen { phase, auto }`.
**You should see:** the first visit shows the pop-up, a reload does not, ℹ️ reopens it, "clear child data" makes it show again.

### Part 15: Progress engine + progressive step bar
**Goal:** the bar starts with **only Ask**. Each phase appears, with an animation, after the previous one is finished (comment 2).
**New:** `js/helpers/progress.js` (pure rules), `tests/progress.test.js`. **Changed:** `js/app.js`, `css/shell.css`, `storage/save.js`, every room file, `storage/export.js`, `helpers/summary.js`.
**Phase completion rules (Claude: confirm with Habiba):**
- **Ask:** a scenario is chosen AND both flawed questions are fixed.
- **Plan:** a prediction is saved.
- **Collect:** the survey is complete (both classes for Reading minutes).
- **Explore:** Graph Lab done (both reflections written, at least 10 characters each) → Number Lab done (all tasks) → Chance Lab done (all 3 tasks).
- **Conclude:** the Evidence Card is built and the work is saved.
**Build:**
- Save progress per child code + scenario in `save.js`. Clear it in `clearChildData()`.
- `mountShell()` renders only unlocked steps. Done steps show ✅ and stay clickable for review. A newly unlocked step slides in and its connector "draws" itself.
- **Route guard:** opening a room that is not unlocked yet redirects to the furthest unlocked room with a friendly Pip line. No dead ends.
- Graph Lab needs a real completion gate (see Fact 5). The Explore sub-tabs unlock the same way.
- New log events: `phase-start`, `phase-complete` (with timestamps, so duration can be computed later).
- Bump `FORMAT_VERSION` to 2. `parseExportFile` must accept **both 1 and 2**.
**Tests:** unlock order, guard decision, per-scenario progress, v1 and v2 files both parse.
**You should see:** a fresh code shows one step; finishing it makes the next one slide in; typing a locked URL bounces you back politely; reload keeps progress.
**Thesis note:** scaffolded progression (one step at a time) mirrors the PPDC cycle (Paper 5).

### Part 16: Phase-end feedback card
**Goal:** after every phase, an instant, kind summary pop-up (comment 3), then the next phase unlocks.
**New:** `js/helpers/feedback.js`, `tests/feedback.test.js`. **Changed:** each room file, `helpers/log.js`.
**Build:**
- `buildPhaseFeedback(phase, facts)` returns `{ stars (1 to 3), wins[] (max 3), nextTime (1 nudge), learned }`. It is a **pure function**, so it is easy to test.
- Stars measure **reasoning**, not speed or perfection. Examples: wrote a reason; used a number as evidence; tried 2 or more chart types; changed their mind because of the data. Using a hint is fine and is never punished.
- Facts come from the log entries of that phase and scenario. Examples: Number Lab compares prediction vs real mean; Chance Lab says whether 500 trials came closer to theory than 10.
- `learned` comes from the scenario's `teaches` line, or a short per-phase line.
- Pop-up shows animated stars, the wins, one nudge, then a **"Unlock next phase →"** button that triggers the Part 15 animation.
- Also tighten the **per-question** feedback: one short sentence on *why* the answer is right or wrong, in Grade 5 words.
- Log `phase-feedback { phase, stars }`.
**Tests:** fixtures covering low, medium and high star cases for every phase.
**You should see:** finishing Collect pops a card with stars and 2 to 3 specific wins that mention the child's own answers; the button unlocks Explore.

### Part 17: Scenario-driven content + Grade 5 rewrite (a to d)
**Goal:** every question matches the scenario the child picked, and a 10-year-old can read it (comment 4).

**New content layer:** `data/content/<scenarioId>.json` for all 5 recipes (sleep-hours, shoe-sizes, playground-game, reading-minutes-class-a, reading-minutes-class-b). A new `loadContent()` in `helpers/scenarios.js`. Each file holds that scenario's wording: fix-it examples, plan prompt, Number Lab tasks, graph prompts, Chance Lab story, claim starters.

**Language rules for every child-facing string:**
1. Sentences of 12 words or fewer. One idea per sentence.
2. One question per screen. Instruction first, then the question.
3. Everyday words. A maths word gets a one-line meaning the first time ("mean = the fair share").
4. Use the scenario's own things (sleep, shoes, games, books). Small numbers.
5. At most 3 or 4 answer options.
6. Active voice, friendly Pip voice, an emoji cue at the start.

**Before → after (from the current code):**

| Now | Rewrite |
|-----|---------|
| "What do you think most classmates will say for: 'How many hours did you sleep last night?'" | "Make a guess! About how many hours did most kids sleep?" |
| "Can you think of 5 numbers whose mean is 6?" | "5 friends slept some hours. Their mean is 6. Type 5 numbers that fit." |
| "Which numbers back up your claim? Choose at least one." | "Pick the numbers that prove your idea." |
| "What does this graph NOT tell you?" | "What can't this graph tell us?" (hint: "It doesn't tell us WHY...") |
| "Mia looked at these numbers and said: 'The median is 20.'" | Use the scenario's own data: "Mia read for 9, 3, 20, 5, 7 minutes. She says the median is 20. Is she right?" |

Keep the certainty scale words (impossible to certain) because they come from Papers 12, 13 and 19, and add a short kid-friendly gloss.

**Rules for the four sub-parts:**
- **17a Question Studio (Ask, Plan).** Fix-it examples themed per scenario. Plan wording as above. Keep the checker rules (not, leading words, timeframe, yes/no).
- **17b Number Lab.** **Remove the sleep-hours hard-wiring** and the hard-coded log text. Keep the 3 meaning-task types (build it, find the mistake, real-life median/mode), themed per scenario. **Category scenario (Playground game):** the mean and median do not make sense for games. Show **mode only**, plus one task: "Why can't we find a mean of favourite games?" (Paper 7). **Reading minutes:** compare Class A and Class B. Answers are computed from the data with `stats.js`.
- **17c Graph Lab + Chance Lab.** Graph prompts themed per scenario. Chance Lab keeps the 4 approved devices (coin, dice, fair spinner, unfair spinner) but gets a scenario story ("Pip's recess spinner", etc.). **Optional, ask Habiba first:** one extra scenario-linked device, "draw a classmate card from the survey", where the theory is computed from the real data (e.g. 1 in 20 kids slept 3 hours).
- **17d Data Hub + Evidence Board + hints.** Simpler claim starters, evidence labels, hint texts in `prompts.js`, and Pip's speech-bubble lines.

**New test `tests/content.test.js`:** every scenario has every content key; every string is within the sentence-length rule; every fix-it example fails the checker and its suggested fix passes; no answer is hard-coded.
**Thesis note:** a readability rule, enforced by a test, shows the Grade 5 design was checked and not just claimed.

### Part 18: Mean / median / mode recap pop-up
**Goal:** a short recap before the child answers questions (comment 5).
**New:** `data/content/recap.json`, `js/ui/recap.js`. **Changed:** `js/rooms/number-lab.js`, Evidence Board header.
**Build:**
- Four cards: **Mean, Median, Mode, Range**. Each has: what it tells you (one line), how to find it (3 numbered steps), and a worked example that **animates step by step** (tap "Next step"). Examples are computed live with `stats.js`.
- **Important:** the worked example must use a **small neutral example set, not the scenario's real numbers.** Otherwise the recap would give away the answer before the child makes the "predict first" guess. Use the scenario's nouns, but different numbers.
- For category scenarios, show **Mode** plus a note on why mean and median do not apply.
- Opens automatically at the start of Number Lab. A 📘 Recap button stays in the Number Lab and Evidence Board headers.
- Log `recap-viewed { auto, cardsViewed }`.
**You should see:** Number Lab opens with the recap, the steps animate, 📘 reopens it, and the recap never shows the scenario's real mean or median.

### Part 19: Student journey dashboard
**Goal:** at the end, the child sees a summary of their whole journey and answers (comment 6, student side).
**New:** `js/helpers/journey.js`, `tests/journey.test.js`, `rooms/my-journey.html`, `js/rooms/my-journey.js`, `css/my-journey.css`. **Changed:** Evidence Board (final button), `app.js` (route guard knows the new page).
**Build:**
- `buildJourney(entries, code, scenarioId)` is a **pure function** returning one summary per phase: the question chosen; prediction vs real answer (and after any revision); graphs tried and what the child wrote; the numbers found; chance device and theory vs experiment; the final claim card; badges and level; hints used; first-try count; stars per phase; time per phase.
- **This same function feeds the teacher dashboard in Part 20** (one source of truth, so the two can never disagree).
- Kid-friendly visuals: a 5-stop trail with a star rating at each stop, a "Detective ID card" (code, level, badges), a "What I learned" strip, and a print-friendly layout.
- The existing "Save my work for my teacher" button moves here as the final action.
**Tests:** a fixture log produces the expected journey, including missing phases.
**You should see:** finishing Conclude opens "My journey", every number matches what the child did, and the page prints cleanly.

### Part 20: Hidden teacher dashboard (local-first)
**Goal:** a detailed, hidden dashboard that gathers what each child did and claimed, shaped for the thesis Results chapter (comment 6, teacher side).
**New/moved:** `teacher/index.html` (moved from `teacher.html`), `js/teacher/*.js`, `css/teacher.css` (extended), `tests/metrics.test.js`. **Changed:** remove the "For teachers" link from `index.html`.
**Build:**
- **Hidden:** no link from any child page. A simple PIN gate is an honest speed bump only (D6). Real login comes in Part 22.
- **Class overview:** number of children; completion funnel per phase; average time per phase; hints used; first-try rate on meaning tasks; prediction accuracy; how often children revised after seeing data.
- **Per-child drill-down:** the full journey (reuse `buildJourney`), a timestamped timeline of every log event, the **exact text the child wrote**, and the claim card.
- **Keep** the 8 misconception tags. **Add rubric coding of each claim** using the levels from Papers 7 and 13: Claude must read `docs/literature-key-findings.md` and **must not invent levels**.
- Filter by scenario.
- **Exports:** the class CSV (existing), a new **`thesis-metrics.csv`** (one row per child per scenario, ready for Excel/SPSS), and a **data dictionary** file that explains every column.
- Charts with Chart.js. Screenshot-friendly for thesis figures.
- Still imports children's files (v1 and v2) for now.
- **Demo mode:** a clearly labelled **DEMO** sample so Habiba can show Prof, which is excluded from every export (D9).
**Tests:** metrics from fixtures (funnel, durations, first-try rate, prediction error), CSV column order, demo data never exported.
**You should see:** import 3 child files, see the funnel and averages, open one child's timeline, download `thesis-metrics.csv` and the data dictionary.

### Part 21: Gamified motion and interaction (a to d)
**Goal:** the app feels like a game, not a form (comment 8). **Hard rule (D7):** rewards reasoning, never speed. No timers, no leaderboards.

**What Claude needs from Habiba (nothing needs an account or password):**
1. **A way to see the UI.** Claude cannot see motion. Best option: allow a **dev-only Playwright install** for screenshots (it is never shipped to students). Otherwise Habiba sends screenshots or short screen recordings.
2. **OK for libraries.** Start with CSS plus the Web Animations API. Add GSAP only if needed, and then as a local copy (school internet is unreliable).
3. **Art.** Claude can draw an **original** Pip as SVG with states. If Habiba wants illustrated art, she supplies it (e.g. from Figma).
4. **Test device.** A school Chromebook or tablet, to check performance.

**Sub-parts:**
- **21a Motion system.** Tokens in `theme.css` (durations, easings, a spring curve). Helpers in `motion.js`: stagger, count-up numbers, shake, float, pulse, reveal. Optional page transitions via the browser's View Transitions API (progressive enhancement only).
- **21b Progress and rewards.** Pip walks along the 5-stop trail to the next stop on unlock; lock → key → open animation for the step bar; animated XP bar; badge "card flip" reveal; level-up. Confetti only for phase-complete and level-up.
- **21c Interactive tasks.**
  - Data Hub: classmates pop into seats; tally bars bounce.
  - Graph Lab: animated switch between chart types; tap a bar to highlight it.
  - Number Lab: **drag-to-sort number cards to find the median** (must-keep); a "fair share" blocks animation for the mean; a guess slider with live emoji.
  - Chance Lab: coin flip, dice roll, spinner with easing; bars grow live during 500 trials.
  - Evidence Board: drag evidence chips onto the card, then a "stamp" effect.
- **21d Performance and accessibility.** Animate only `transform` and `opacity`. Cap particles at about 60. Pause animations when the tab is hidden. No flashing more than 3 times a second. Use pointer events (touch), and give every drag a **button alternative for keyboard users**. Reduced-motion switches everything off. Test on a Chromebook.

### Part 22: Backend + database (BONUS) (a to e)
**Prerequisites:** Part 20 done, Prof's OK (D5), and Habiba has checked ethics (D8). The app must keep working with the backend **off**.
- **22a Choose and set up.** Claude presents 2 to 3 options in a table (hosting on GitHub Pages stays static; the backend lives in a cloud service) and Habiba chooses. **Recommendation: Supabase** (Postgres, row-level security, login, SQL/CSV export, a client that loads from a CDN without build tools). Alternatives: Firebase, or a small Node + SQLite server. **Caveat to check:** free projects can pause when inactive. Verify the current terms and keep the project awake around the pilot.
- **22b Schema + security.** Tables mirror the existing log entry shape so the CSV is identical: `students(code)`, `log_entries(id, code, scenario_id, time, room, type, details jsonb)`, `progress(code, scenario_id, phase, completed_at, duration_ms)`, `teacher_tags`, `teacher_rubric`. A CHECK on `code` using the same pattern as `isValidCode`. **Row-level security:** the public (anon) key can only INSERT rows for itself and cannot read other children's data; only a logged-in teacher can read everything. No personal data, anonymous codes only. The public key is meant to be public; **never commit a service-role key**.
- **22c Sync layer.** `storage/sync.js`, **offline-first**: localStorage stays the source on the device; each log entry is queued and sent in batches with retry. Every entry gets a client-generated id so retries never create duplicates. A small kid-friendly status (☁️ saved · ⏳ waiting · 📴 offline). If the backend is down, nothing breaks. "Save my work" file export remains as a fallback. Settings go in `js/config.js` with `enabled:false` by default.
- **22d Teacher live mode.** Teacher login. The dashboard switches between "import files" and "live". Test with two browsers.
- **22e Privacy note.** One page for the thesis: what is stored, why, how long, how to delete a child's data by code, and the consent wording. Habiba confirms with Prof and the school; Claude does not assume approval.
**Thesis note:** an optional, offline-first sync layer lets the pilot collect data across devices without changing the child's experience.

### Part 23: Final QA + docs + thesis material
- Run the whole flow on all 4 scenario choices (reading minutes counts as one), keyboard-only once, and on a tablet/Chromebook (finishes the open Part 11d).
- No console errors. All tests green.
- Update `docs/architecture.md` with a clearly marked section **"Round 2 changes after Prof feedback, Oct 2026"** (UI kit, progress engine, journey and dashboards, optional sync). Write `docs/change-summary-round-2.md`.
- List screenshots for the thesis. Remind Habiba to **declare AI assistance** in the thesis.

### Part 24: Deploy (LOCKED)
**Do not start until Habiba writes: "Prof confirmed."** Then: GitHub Pages setup; switch Chart.js (and any animation library) to **local copies** for school internet; backend settings if Part 22 was done; smoke-test the live link; build the offline copy; write the demo-video script.

---

## 7. Thesis notes (one line per theme, for the Implementation chapter)

- **Iteration after supervisor feedback:** record each of the 8 comments, the change made, and the reason. This is a strong "design process" paragraph.
- **Scaffolded progression (Part 15) and instant feedback (Part 16):** guided inquiry (Papers 23 to 25) and Predict, Test, Compare, Refine (Papers 11, 12, 13, 19).
- **Grade 5 language rules (Part 17):** enforced by a test.
- **Journey + teacher dashboard (Parts 19, 20):** the reasoning log becomes the Results chapter evidence. Be explicit that synthetic datasets are teaching material, not research results, and that no pilot results exist until real children use it.
- **Backend (Part 22):** optional and offline-first; ethics approval comes first.
