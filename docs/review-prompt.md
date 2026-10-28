# Prompt for Claude chat: project review from the zip

How to use it:
1. Make the zip **without** the `node_modules` folder (it is huge and not our code). In File Explorer: select every item in `C:\datascope` except `node_modules`, right-click → **Compress to ZIP file**.
2. Open a new chat on claude.ai, attach the zip, and paste everything between the two lines below.

---

I am Habiba, a bachelor student at the German International University (GIU). My supervisor is Dr. Nada Ahmed Hamed Sharaf. The attached zip is the full source code of my bachelor project, **DataScope: The Evidence Lab**: a website (plain HTML, CSS and JavaScript ES modules, Chart.js, GSAP, optional Supabase backend) where Grade 5 PYP children (age 10 to 11) run a data investigation: Ask, Plan, Collect, Explore, Conclude.

Please review the project and tell me **what is done, what is missing, and what I need to ask my professor**.

**Read these first, in this order** (they are the source of truth for what was planned):
1. `CLAUDE.md` (rules and decisions)
2. `docs/architecture.md` (the approved design; section 9 = changes after Prof's feedback)
3. `docs/round-2-plan.md` (Prof's 8 comments, Parts 13 to 24)
4. `docs/build-progress.md` and `docs/change-summary-round-2.md` (what I believe is done)
5. `docs/literature-key-findings.md` (the research; paper numbers are used everywhere)
6. `docs/privacy-note.md`, `docs/backend-setup-guide.md`, `docs/device-test-checklist.md`

**Then check the code itself.** Do not trust the progress notes alone: for every item, open the real files (`index.html`, `rooms/`, `js/`, `css/`, `data/`, `tests/`, `teacher/`, `backend/schema.sql`) and confirm it exists and does what the docs say. If you cannot run the code, say which things you checked by reading only.

**Give me your answer in this structure:**

1. **Summary** (5 lines max): how complete the project is and the 3 most important next steps.
2. **Prof's 8 comments:** a table with one row per comment (from `docs/round-2-plan.md`, section 1): comment, status (✅ done / 🟡 partly / ❌ missing), evidence (file names), and what is left.
3. **Original build plan (Parts 0 to 12) and Round 2 (Parts 13 to 24):** the same table, one row per part.
4. **Gaps and risks you found in the code:** bugs, things the docs promise that the code does not do, mismatches between the docs, accessibility or privacy problems (children's data, anonymous codes, the secret key never in the code), and anything that breaks the rules in `CLAUDE.md`. Sort by importance and give the file and line where you can.
5. **Questions for my professor:** grouped by topic (for example: scope, rubric and evaluation, ethics and consent, data and privacy, deployment, the pilot, thesis writing). For each question: the question itself, why it matters (one line), and 2 to 3 possible answers with the one you recommend. Include the open decisions already listed in the docs (for example the rubric levels from Papers 7 and 13, data retention and consent wording, the pilot design, and the deploy confirmation).
6. **What I should prepare for the thesis:** screenshots, figures, code snippets and design decisions worth explaining, each linked to a paper number from `docs/literature-key-findings.md` where it fits.

**Rules for your answer:**
- Never invent facts about the papers. Only use what is in `docs/literature-key-findings.md`, and say "not in the notes" if something is missing.
- Never invent pilot results or numbers. The datasets in the app are synthetic teaching material ("a pretend class") and are not research results.
- If something is unclear, say so instead of guessing.
- Write in plain, short English. I am a capable beginner.
- Remind me to declare AI assistance in my thesis (GIU regulations, section 7).
