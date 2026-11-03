# Prompt for Claude in VS Code (Round 3, Prof feedback of 2 Nov 2026)

**Setup:** open the `datascope` folder in VS Code, start a NEW Claude chat, and paste the block below once. Claude will read the repo, ask you questions, and write a plan. It will not code until you say "start Part 25".

---

```
We are starting ROUND 3 of DataScope. My supervisor (Prof) reviewed the build in our weekly meeting on 2 Nov 2026 and gave me the comments below. Stay in mentor mode as defined in CLAUDE.md.

READ FIRST (in this order):
1. CLAUDE.md
2. docs/build-progress.md
3. docs/architecture.md
4. docs/round-2-plan.md
5. docs/design/ui-ux-guide.md, docs/design/frames/f0-tutorial.html and docs/privacy-note.md
6. The code you need to understand each comment: js/app.js, js/welcome.js, js/phase-intro.js, js/recap.js, js/helpers/charts.js, js/rooms/graph-lab.js, js/rooms/number-lab.js, js/rooms/chance-lab.js, js/rooms/question-studio.js, js/rooms/evidence-board.js, js/helpers/prompts.js, js/helpers/checker.js, js/helpers/number-tasks.js, js/helpers/badges.js, js/helpers/feedback.js, js/helpers/thesis.js, data/content/*.json, index.html, css/*.css

PROF'S COMMENTS (my words, in order of the meeting):

1. START-PAGE TUTORIAL. A student who opens the site will be confused: he does not know what he will learn, what the website is for, or how to use it. Prof suggested a mini tutorial video or animation on the start page, at the very beginning, showing (a) the purpose of the website, (b) how to use it, and (c) a brief summary of all the rooms.
   UI REFERENCE: I will put docs/design/frames/f0-tutorial.html in the repo. It is an animated reference (same style as the other frames) with 6 screens: Hello, Your mission, The journey (5 steps), The 6 rooms, How to use it (hints + room tab), Ready. Open it in a browser, match its look and motion, and take the "Notes for building it" at the bottom of that page as the starting spec. Tell me what you would change.

2. GRAPHS AND CHARTS (Graph Lab, and any chart a child sees). The UI is not suitable:
   - a little larger font, and BOLD, dark text (not light grey)
   - word labels, not numbers only (for example "9 hours" or "Football", with a clear axis title such as "Number of kids")
   - the line chart must be better visualised
   - differentiate between the SIZE and the COUNT (I am not sure exactly what Prof meant, so ask me; my guess: the value on the x axis, like shoe size 34, versus how many kids chose it, like 6 kids).

3. HINTS AND OPEN QUESTIONS. It is boring and not reliable to make a Grade 5 student think of a full answer alone. The hints should GIVE answers. The student can DRAG a suggested answer into the box, or CLICK/TAP it to make it his answer. He must also be able to EDIT the suggested answer, or write everything on his own.

4. BUTTON TEXT. In Number Lab the button "Show the numbers" must say "Show statistics" (check every place the old wording appears, including Pip's lines, tests and docs).

5. MEAN TASK ("Build it": make 5 numbers with a given mean). It takes too long to think of 5 numbers with a specific mean. Either change the task, or show a mini worked example beside the question that is similar, so the student can solve it faster.

6. ROOM SUMMARIES AS A TAB. The summary of each room must be a tab the student can reopen at any time (today it is a pop-up that shows once, plus the (i) button).

7. CHANCE LAB, THEORY VS EXPERIMENT. The UI is not clear: the numbers are small and not bold, and it is not clear what the numbers inside brackets ( ) are for. Find those numbers and tell me what they are before changing them.

8. QUESTION CHECKER. In the "fix the question" part (Question Studio), the checker should recognise many time words and phrases (this year, today, this week, and more), not only a couple. Note: I wrote "backend" in my notes, but I think I mean js/helpers/checker.js, not Supabase. Confirm this with me.

9. DEPLOYMENT. I need to deploy, but I know nothing about deployment. Explain it in a beginner way, step by step. Deployment is the LAST part, and it stays locked until I write "Prof confirmed".

NOT NOW: my literature review is the very last thing, after everything is confirmed, pushed to GitHub and deployed. Do not start it and do not plan it in this chat.

DO THIS NOW (no feature code yet):
1. Reply with what you understood, in 10 lines or fewer.
2. Check each comment against the REAL code and tell me what is already there or where I am wrong. For example, the checker may already know some time words, so find out which real phrases fail.
3. Ask me every question you need, in ONE batch, short and multiple-choice, with your recommendation first. Do not guess. Think especially about these unclear points:
   - Tutorial: video file or an animation built in the page (HTML/CSS/JS with Pip)? How long? Can it be skipped? Shown only the first time, with a "Watch again" button? Where exactly on the start page? Words only, or also sound (sound stays off by default)?
   - Room summary tab: where does the tab sit, and is the content the same as the phase pop-up or longer? Does the (i) button stay?
   - Charts: what does "size versus count" mean? What should the line chart look like, especially for category data like the playground game, where a line joining unrelated games is misleading?
   - Hints: which input works on a Chromebook or tablet with touch? (My guess: tap is the main way and drag is a bonus; ask me.) How many suggested answers per question? Must they be built from the scenario's real data with stats.js, never hard-coded?
   - Hints and my THESIS DATA: if a child can tap a ready answer, the typed text is no longer always his own words. This affects the 10-character rules, the "because" rule, the star rules in feedback.js, the badges, the hint count, and the thesis-metrics.csv columns. Propose how to log where each answer came from (for example: own words / hint unchanged / hint edited), and which stars and badges should count. Hints must still never cost a star.
   - Mean task: which option do you recommend (worked example beside the question, fewer numbers, number chips, something else)? Answers must still be checked with stats.js.
   - Deployment: GitHub username and repo name, public or private repo, will the live site send data to Supabase or stay in offline mode until ethics is cleared, and has Prof confirmed?
4. After I answer, write docs/round-3-plan.md: Parts 25 onward, in a sensible order, each with the files to change, the risks, the tests and a "You should see..." check. Deployment is the last part. Show me the plan before saving it.
5. Append a short "Round 3 (Prof feedback, 2 Nov 2026)" section to CLAUDE.md with the decisions we make. Show me the exact text first. Update docs/build-progress.md.
6. Run `node --test` and tell me the result. Then STOP and wait. I will say "start Part 25".

RULES THAT NEVER CHANGE:
- One part at a time. Before editing, tell me in 2 to 3 lines what you will change and why. Short explanations. After each step, give a "You should see..." checklist and wait for me.
- If anything is unclear, ASK ME. Do not guess.
- No framework, no build tools. Ask me before adding any library.
- Never hard-code answers or hint answers: compute them with stats.js and the scenario data.
- Anything a child types or taps is shown with textContent, never innerHTML.
- Keep `node --test` green, and add tests for every new helper.
- Rewards stay about good reasoning, never speed. No timers, no leaderboards.
- Respect reduced motion, 48px tap targets, colour is never the only signal, text size at least 18px.
- Demo data stays labelled DEMO and is never exported. Never invent pilot results.
- Never put the Supabase secret key anywhere in the website.
- At the end of each part: update docs/build-progress.md, give me a Git commit message, a one-line thesis note, and what to keep for the thesis (screenshot, snippet, decision).
- If anything I ask contradicts CLAUDE.md or the architecture, tell me before doing it.
```

---

## Prompt for later: Deploy (paste ONLY after Prof confirms)

```
Prof confirmed. Start the Deploy part from docs/round-3-plan.md. First explain deployment to me in 5 lines in simple words. Then list what must be true before we publish (tests green, no console errors, Chart.js and fonts as local copies, js/config.js settings, no secret key, all links work from the GitHub Pages address). Then guide me step by step, one step at a time, with a "You should see..." check after each, from "git push" to opening the live link on a Chromebook or tablet. Also give me the offline copy.
```
