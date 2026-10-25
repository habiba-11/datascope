# DataScope: Idea & Architecture (v2, approved by Prof, synthetic-data update)

*This is the idea and architecture document my Prof approved, with one change she requested: students do NOT collect data from friends. The data is synthetic (built by the researcher with a recipe and a seed) so the researcher has full control over what each dataset teaches. The roadmap, thesis rules and open decisions are in claude/project-overview.md and claude/build-chat-prompt.md.*

DataScope is a free website where Grade 5 students run a real investigation: they ask a question, explore the data of a virtual class, draw graphs, work out averages, play chance games, and then defend a conclusion with evidence.

## 1. What is DataScope?

Think of it as a **science lab, but for numbers**. In a normal lab you test an idea with an experiment. In DataScope, students test an idea with **data** (facts and numbers, like "How many hours of sleep do Grade 5 students get?").

**Who is it for?** Grade 5 students in a PYP (Primary Years Programme) school, about 10 to 11 years old. Teachers use it too, with short notes that explain the ideas.

**What does the student actually do?**

1.  Pick a question they care about from a menu of scenarios.

2.  Run a survey on a virtual class and watch the answers arrive (the data is synthetic, so no real child's answers are used).

3.  Turn the answers into graphs and compare them.

4.  Calculate the mean, median, mode and range, and learn what each one *means*.

5.  Play chance games (coin, dice, spinner) and compare what *should* happen with what *did* happen.

6.  Use all of this evidence to make a prediction, solve a school problem, or present a recommendation to a real audience.

**The one-sentence claim for the thesis:**

> A lightweight, browser-based tool that guides children through a full investigation, and records *how they reason* (not just whether they got the answer right), can help them move from "I know how to calculate" to "I can explain what the data tells me."

**Why this fits PYP:** PYP is built on inquiry (asking questions), critical thinking, and *action* (doing something with what you learned). DataScope's last step is exactly that action.

## 2. The big idea: the investigation cycle

Every student walks through the same five steps, which match a well-known method called **PPDAC** (Problem, Plan, Data, Analysis, Conclusion; Paper 5). Each colour below is one step, and the label inside names the app "room" where it happens.

> **Diagram (investigation cycle):** five steps left to right, with a loop back to the start. 1 Ask (Question Studio) → 2 Plan (Question Studio) → 3 Collect (Data Hub: run a survey on a virtual class) → 4 Explore (Graph Lab + Number Lab + Chance Lab) → 5 Conclude (Evidence Board). A new question restarts the loop.

investigation cycle · 5 stages, 1 loop

The cycle ends by asking a new question, so one investigation naturally leads to the next.

**The five steps in kid-friendly words**

1.  **Ask:** "What do I want to find out?" The question must be interesting to the student, clear, and not answerable with only yes or no.

2.  **Plan:** "How many classmates will I ask, and what do I think the answer will be?" Guessing first is important, because later the student checks the guess against the data.

3.  **Collect:** "Let me run the survey." The app runs the survey on a virtual class and shows the answers arriving one by one. The data is synthetic, built by the researcher so every student meets the same ideas.

4.  **Explore:** "What does the data show?" The student draws graphs, finds the mean, median, mode and range, and plays chance games to compare *what should happen* with *what did happen*.

5.  **Conclude:** "Here is what I think, here is my proof, and here is how sure I am." Then the student presents it to a real audience.

## 3. What the research told us

Your 24 completed papers point to nine clear design rules. Each row says what researchers found, which paper numbers (from your tracker) show it, and what DataScope does about it.

| \#  | What researchers found                                                                                                               | Papers         | What DataScope does                                                                                               |
|-----|--------------------------------------------------------------------------------------------------------------------------------------|----------------|-------------------------------------------------------------------------------------------------------------------|
| 1   | Kids can already reason "halfway" about data without being taught, but few reason fully like statisticians.                          | 1, 4           | Start from what kids already think, then nudge them with prompts.                                                 |
| 2   | A good conclusion has three parts: a claim beyond the data, evidence, and how sure you are.                                          | 17, 19         | Every investigation ends with **Claim + Evidence + Certainty** (from "impossible" to "certain").                  |
| 3   | Predict, then collect data, then compare, works for chance and for statistics.                                                       | 11, 12, 13, 19 | Every activity follows **Predict, Test, Compare, Refine**.                                                        |
| 4   | Students and even teachers can calculate the mean and median but cannot explain them. Median and mode get very few meaningful tasks. | 6, 7, 8, 9     | "Meaning tasks": build a dataset for a given mean, find the mistake, and real-life median and mode problems.      |
| 5   | Kids often read graphs as pictures, and many cannot interpret charts well.                                                           | 20, 21         | Kids build their own graph, switch chart types, see direct labels, and answer "what does this graph NOT tell us?" |
| 6   | Common chance mistakes: "luck", "four heads in a row is rare", "everything is equally likely".                                       | 10, 12, 13     | Always list **all possible outcomes first**, include unfair spinners, and ask "answer + why".                     |
| 7   | Bad survey questions give bad data: negatives, leading words, no timeframe, yes/no only.                                             | 17, 28         | A **question checker** that warns about unclear questions, and students fix flawed example questions.             |
| 8   | Guided inquiry beats free play, and the teacher or prompts matter.                                                                   | 23, 24, 25     | Sentence starters like "I think ___ because ___" and short check-ins.                                       |
| 9   | Games help when they are tied to the learning goal, and almost none exist for data.                                                  | 26, 30         | Badges for **good reasoning**, not speed.                                                                         |

**How to read this:** the table is your "literature to design" bridge. In the thesis, each row becomes one justified design decision, which is exactly the "clear line between problem, approach and results" that the GIU regulations ask for.

## 4. The gap DataScope fills

The research shows each good idea exists somewhere, but no single tool puts them together for children.

| Existing work                        | What it does well                                        | What is missing                                                  | Papers     |
|--------------------------------------|----------------------------------------------------------|------------------------------------------------------------------|------------|
| KiData (a website for grades 1 to 6) | Friendly lessons, cartoons, instant right/wrong feedback | Mostly read-and-quiz, no hands-on data, not yet tested with kids | 26         |
| TinkerPlots lesson sequences         | Kids reason deeply about data and models                 | Needs special software and a long lesson series                  | 4          |
| Gamified maths apps                  | Boost motivation and engagement                          | Hardly any focus on data or statistics                           | 30         |
| Probability teaching studies         | Activities fix misconceptions                            | Kept separate from statistics, little with 5th graders in a tool | 11, 12, 13 |
| Textbooks                            | Teach how to calculate the mean                          | Median and mode barely get meaningful tasks                      | 8, 9       |

**Your gap in one line:** there is no light, browser-based tool where a child runs a *complete* investigation on a carefully designed dataset, practises meaning (not only calculation), joins statistics with probability, and where the tool records how the child reasons.

**What you can honestly claim:** DataScope *builds on* these ideas. You are not claiming to prove it works for everyone. Your pilot with real students is what gives you evidence.

## 5. The six modules (the "rooms" of the app)

Think of DataScope as a building with six rooms. A student walks through them in order, but a teacher can open any room on its own.

### Module 1: Question Studio (Ask and Plan)

**What the student does:** picks a scenario (for example, sleep in Grade 5), chooses a survey question for a virtual class, and picks how the answers will be given (choose one, pick a number, rate 1 to 5).

**The clever part:** a **question checker** reads the question and shows friendly warnings: "This has a *not* in it, so try rewording", "Which time? Add 'this week'", "The word 'good' pushes people toward an answer." Students also get flawed example questions and must fix them before the data is revealed.

**Why:** Papers 17 and 28 showed that unclear, boring, yes/no questions ruin an investigation.

### Module 2: Data Hub (Collect, with synthetic data)

**What the student does:** runs a survey on a virtual class. The data is synthetic: the researcher built it with a program instead of collecting it from real people. The student chooses how many classmates to ask (a small group first, then everyone) and watches the answers arrive.

**The clever part:** revealing one answer at a time, so the table grows in front of the student, helps young kids connect each answer to the final graph (Paper 16).

**Why synthetic data?**

- **Full control:** every dataset is built to teach one planned idea, so no lesson depends on luck.

- **Same experience for every student:** this makes the pilot results comparable.

- **Simpler ethics:** no real child's answers are collected for the tool.

- **Repeatable:** a saved *seed* (a starting number for the random generator) recreates exactly the data a student saw.

**Example scenarios (adjust these to your learning outcomes):**

| Scenario                            | How the data is built                          | The idea it teaches                                               |
|-------------------------------------|------------------------------------------------|-------------------------------------------------------------------|
| Hours of sleep in Grade 5           | Most answers between 8 and 10, one answer of 3 | One extreme value drags the mean but not the median (Papers 6, 7) |
| Favourite playground game           | Categories with one clear winner               | The mode is the only "typical value" for categories (Paper 7)     |
| Shoe sizes in the class             | Two sizes tie for most common                  | A dataset can have more than one mode                             |
| Reading minutes: Class A vs Class B | Same mean, very different spread               | The mean alone can hide differences between groups (Paper 1)      |

**How it works behind the scenes:**

1.  For each scenario the researcher writes a short *recipe* in a small JSON file: the answer type, the target mean, median or mode, the spread, any extreme values, and how many classmates.

2.  The **data generator** builds the rows from the recipe and a seed. It then recalculates the mean, median and mode and checks that they match the recipe.

3.  When the student presses "Run survey", the rows appear one by one with labels like "Classmate 7", and the table and tally grow live.

4.  The scenario ID and seed go into the reasoning log, so you always know exactly which data each student saw.

**Trade-off to state in the thesis:** Paper 5 found that students learn well when they collect their own data, and Paper 17 found they need questions they care about. Synthetic data gives control instead. Reduce the loss by choosing relatable scenarios, letting students pick the scenario, and naming real class data as future work.

### Module 3: Graph Lab (Explore, part 1)

**What the student does:** builds a graph from the dataset they just ran, then switches between bar, line, pie, and dot plot to see what changes.

**The clever part:** after each graph the app asks, "What does this graph tell you? What does it NOT tell you?" Labels sit directly on the chart, and colours stay simple (Papers 20, 21).

### Module 4: Number Lab (Explore, part 2)

**What the student does:** the app computes mean, median, mode and range, but only *after* the student predicts roughly where the "typical value" will be.

**Meaning tasks** (this is your biggest contribution):

- **Build it:** "Make 5 numbers whose mean is 6."

- **Find the mistake:** "Mia says the median is 9. Is she right? What did she forget?" (Hint: she forgot to put the numbers in order.)

- **Real-life median and mode:** "Which shoe size should the shop order the most of?"

**Why:** Papers 6 to 9 found people memorise the steps but cannot explain the meaning.

### Module 5: Chance Lab (Explore, part 3)

**What the student does:** picks a coin, dice, or spinner (including an unfair spinner), lists every possible outcome, predicts what will happen, runs 10, 50, then 500 trials, and compares **theoretical** probability (what *should* happen) with **experimental** probability (what *did* happen).

**The clever part:** a simple certainty scale (impossible, unlikely, even chance, likely, certain) and a sample-size step, so kids see that more trials give results closer to the theory (Papers 12, 13, 19).

### Module 6: Evidence Board (Conclude)

**What the student does:** builds a final card with three parts: **Claim** ("I think Grade 5 sleeps less than Grade 3"), **Evidence** (picks graphs and numbers from earlier rooms), and **Certainty** (how sure, and why). Then chooses an audience (the principal, the class, a parent evening) and a form: a prediction, a problem solved, or a recommendation.

**Why:** this is the PYP "action" step, and Paper 17's three-part inference rule.

> **Round 2 change (26 Oct 2026, Habiba's decision after testing):** the audience and form choice was removed, because it had no purpose for the child. The Evidence Board is now Claim + Evidence + Certainty (Paper 17's three parts), with a "📋 My findings" summary of the child's own numbers and words before they write the claim. To mention to Prof: the PYP "action / real audience" part is no longer in the app.

## 6. The architecture in simple terms

**Architecture** means "how the pieces of the app are organised." DataScope is built as four stacked layers, like floors in a building. Each floor only talks to the floor directly below it, which keeps things tidy and makes it easy to fix one part without breaking the rest.

> **Diagram (architecture, 4 layers):** Layer 1 Investigation Shell (step bar, hints, badges, teacher view) → Layer 2 the six rooms (Question Studio, Data Hub, Graph Lab, Number Lab, Chance Lab, Evidence Board) → Layer 3 shared helpers (Stats engine, Chart helper, Prompt engine, Reasoning log, Data generator) → Layer 4 storage (Browser storage, Export CSV/JSON; later and optional: Firebase or Sheets).

architecture · 4 layers, dashed = optional later

The dashed box is optional and comes later. The first version needs no server at all.

**What each layer does**

- **Layer 1, the shell:** the "outside" of the app. It shows the step bar (Ask, Plan, Collect, Explore, Conclude), hints, badges, and a teacher view.

- **Layer 2, the six rooms:** the activities from section 5. Each room is a separate piece of code, so you can build and test them one at a time.

- **Layer 3, shared helpers:** small workers that every room can call.

  - **Stats engine:** calculates mean, median, mode, and range. Kept separate and tested on its own, because it must never be wrong (for example, the median of an even number of values, or two modes).

  - **Chart helper:** draws charts with Chart.js so every graph looks consistent.

  - **Prompt engine:** shows sentence starters like "I think ___ because ___" and the certainty scale.

  - **Reasoning log:** writes the thinking diary from section 7.

  - **Data generator:** builds each scenario's synthetic dataset from a recipe and a seed, so the same data can be recreated.

- **Layer 4, storage:** saves work in the browser, and exports a CSV or JSON file so the teacher (and you, for the thesis) can analyse results.

**Follow one action through the layers**

1.  A student chooses a question in **Question Studio** (layer 2).

2.  The room asks the **question checker** (layer 3) whether the question is clear.

3.  The helper answers with a friendly warning or a green light.

4.  The **Reasoning log** notes that the student rewrote their question.

5.  The finished question is saved in **browser storage** (layer 4).

**Why this design suits a beginner:** you can build the stats engine and one graph first, test them with a few students, and add the remaining rooms later without rewriting what already works.

## 7. What the app saves: the data model and the reasoning log

A **data model** is just a plan for what information the app keeps and how the pieces connect. Think of one student investigation as a **folder** with labelled pages inside.

| Page in the folder | What it holds                                                              | Example                                               |
|--------------------|----------------------------------------------------------------------------|-------------------------------------------------------|
| Question           | The survey question and answer type                                        | "How many hours did you sleep last night?" (a number) |
| Records            | One row per answer from the synthetic class, plus the scenario ID and seed | Classmate 7: 9 hours                                  |
| Graphs             | Which chart the student made and what they said about it                   | Bar chart, "Most of us sleep 8 to 9 hours"            |
| Numbers            | Mean, median, mode, range, and the student's prediction beforehand         | Predicted 8, actual mean 8.4                          |
| Chance trials      | The game used, the outcomes list, predictions, and results                 | Fair coin, 100 flips, 54 heads                        |
| Claims             | The final claim, the evidence chosen, and the certainty rating             | "Likely" with the reason written                      |

### The reasoning log (your thesis evidence)

Besides the folder, the app quietly writes a **diary of thinking moments**, using only the anonymous code. Each entry is one small event:

- The student made a **prediction** (and what it was).

- They **changed** the prediction after seeing data.

- They picked a **certainty level** and wrote a reason.

- They answered a **meaning task** correctly, incorrectly, or after a hint.

- A teacher **tagged** a misconception (for example "thinks all outcomes are equally likely").

**Why this matters:** most tools only record right or wrong. This diary lets you show *how thinking changed*, which is what your research papers measure (Papers 7 and 13 give you scoring levels to use). It becomes the Results chapter of your thesis.

**Safe by design:** the survey data is synthetic, so no child's answers are ever collected. Only the anonymous reasoning log is saved, and it stays in the browser unless the teacher exports it.

## 8. The tech stack: the tools, in plain words

The stack comes from your project overview. It is deliberately small so a beginner can finish it.

| Tool                           | What it is (simple)                             | What we use it for                                                     |
|--------------------------------|-------------------------------------------------|------------------------------------------------------------------------|
| VS Code                        | A free text editor for writing code             | Where you write the app                                                |
| HTML                           | The skeleton of a web page                      | Buttons, text boxes, tables                                            |
| CSS                            | The paint and decoration of a page              | Colours, fonts, kid-friendly layout                                    |
| JavaScript                     | The brain that makes the page react             | Calculating mean/median/mode, running chance games                     |
| Chart.js                       | A free library that draws charts                | Bar, line, pie, and dot plots                                          |
| localStorage / IndexedDB       | A small storage box inside the browser          | Saving a student's work with no server                                 |
| JSON scenario files            | Plain text files that describe a dataset recipe | One file per scenario: target mean, spread, extreme values, categories |
| Firebase (free tier)           | An online database                              | Later and optional, only if cross-device saving is needed              |
| GitHub + GitHub Pages          | Online code storage plus free website hosting   | Gives students a link, nothing to install                              |
| Figma                          | A drawing tool for screen designs               | Optional wireframes before coding                                      |
| School Chromebooks and tablets | The real devices in class                       | Test on these early                                                    |

**The rule of thumb:** use no framework and no server for the first version. Fewer moving parts means fewer things to break, and the thesis asks for a working prototype, not a giant system.