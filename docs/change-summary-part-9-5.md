# Change summary: Part 9.5 bug-fix pass

Baseline commit: `61d4d61` (Part 9). Work done 19–22 Oct 2026 in four batches (A–D). Nothing from this pass is committed yet.

## 1. Test results

**Final `node --test`: 33 tests, 33 pass, 0 fail** (was 23 before this pass).

New tests (10):

| File | Test name |
|---|---|
| tests/stats.test.js | compareValues sorts numbers by size and text alphabetically |
| tests/generator.test.js | formatMean: sleep-hours shows 8.4 (not 8.3) |
| tests/generator.test.js | formatMean: shoe-sizes shows 35.3 |
| tests/generator.test.js | formatMean: reading-minutes shows 20 |
| tests/generator.test.js | reading minutes: Class A is paired with Class B, which asks the same question |
| tests/checker.test.js | every scenario question passes our own checker (zero warnings) |
| tests/charts.test.js (new file) | dot plot of text answers uses a category x-axis (one column per game) |
| tests/charts.test.js | dot plot of numbers keeps a number line from the first to the last value |
| tests/charts.test.js | the y-axis leaves one step above the tallest bar for its label |
| tests/charts.test.js | shared labels give a count of 0 for values nobody chose (Class A vs B) |

Browser checks (not automated tests): every batch was also clicked through in headless Chrome (local server + Chrome DevTools Protocol, script kept outside the project). This included all 4 scenarios × 4 chart types in Graph Lab. No console errors.

## 2. Item by item

### A1. Mean mismatch: **fixed**
- **Files and functions:**
  - `js/helpers/stats.js`: new `formatMean(value)`, which rounds to 1 decimal with `Math.round(value * 10) / 10`.
  - `js/helpers/generator.js`: `matchesTarget()` now uses `formatMean`.
  - `js/rooms/number-lab.js`: `setupPredict()`.
  - `js/rooms/evidence-board.js`: `init()`, the evidence chips.
- **Before → after:** Number Lab and Evidence Board used `toFixed(1)` and showed sleep-hours mean **8.3**, while the generator checked 8.4 → every screen now shows the same value as the recipe.
- **What a child now sees:**
  - sleep-hours mean **8.4** (Number Lab stat card and feedback, Evidence Board chip "Mean: 8.4")
  - shoe-sizes **35.3**
  - reading minutes **20**, shown without ".0"

### A2. Shoe question fails our own checker: **fixed**
- **Files:** `data/scenarios/shoe-sizes.json`; new test in `tests/checker.test.js`, which reads every file in `data/scenarios/`.
- **Before → after:** "What shoe size do you wear?" got the warning "Which time?…" → **"What shoe size do you wear this year?"**, with zero warnings.
- **Consistency:**
  - Question Studio, Data Hub and Graph Lab read the question from the JSON, so they update automatically.
  - Number Lab's hard-coded shoe example already said "this week", so it needed no change.

### A3. Tally sort meaningless for text: **fixed**
- **Files and functions:**
  - `js/helpers/stats.js`: new `compareValues(a, b)`, also used inside `mode()`.
  - `js/rooms/data-hub.js`: `renderTally()`.
  - `js/helpers/charts.js`: `buildFrequencyData()`.
- **Before → after:** the playground tally was sorted with `a - b` (NaN for text, so the order was effectively arbitrary) → numbers sort by size and text alphabetically.
- **What a child now sees:** playground columns read **Basketball, Football, Hopscotch, Swings, Tag**, in the same order in Data Hub and Graph Lab.

### B1. Stale prediction in Question Studio Task 3: **fixed**
- **Files and functions:** `js/rooms/question-studio.js`.
  - `renderPredictTask()` now tracks `predictScenarioId` (this replaces `predictRendered`).
  - New `savePrediction()` and `setupPredictSave()`.
- **Before → after:** Task 3 was built once and kept the old scenario → Task 3 rebuilds whenever the chosen scenario changes, and clears the old feedback, the "Let's collect the data" link and the task's completion.
- **Extra fix:** "Save my prediction" is now wired only once, so no duplicate click listeners pile up.

### B2. Plan step never highlighted: **fixed**
- **Files and functions:**
  - `js/app.js`: step links get `data-step`; new exported `setCurrentStep(stepId)`.
  - `js/rooms/question-studio.js`: `showTask()` calls it.
- **Before → after:** the step bar always highlighted Ask in Question Studio → Tasks 1–2 highlight **❓ Ask**, Task 3 highlights **🗺️ Plan**, and going Back returns to Ask. The shell is still built once by `mountShell()`.

### B3. localStorage without error handling: **fixed**
- **Files and functions:** `js/storage/save.js`: `getSelectedScenarioId()` and `setSelectedScenarioId()`.
- **Before → after:** blocked storage threw an error and the room failed to load → reads and writes are in try/catch, with an in-memory fallback and the default `sleep-hours`.
- **What a child now sees:** nothing new. The app keeps working if storage is blocked, but the choice only lasts until the page reloads.

### B4. Dead ends, no "next room": **fixed**
- **Files:**
  - `js/rooms/data-hub.js`, `js/rooms/graph-lab.js`, `js/rooms/number-lab.js` (`markComplete`), `js/rooms/chance-lab.js` (`markComplete`).
  - `css/base.css`: `.next-room-btn`.
- **Before → after:** no way forward at the end of a room except the step bar → one big link per room:
  - Data Hub: **"📊 Let's draw a graph! →"**, shown after "Survey complete!".
  - Graph Lab: **"🔢 Next: Number Lab →"**, always shown.
  - Number Lab: **"🎲 Next: Chance Lab →"**, shown after Task 4.
  - Chance Lab: **"🚩 Next: Evidence Board →"**, shown after the first trial run.

### B5. Class B unreachable: **fixed (decision: option 1)**
See section 4.

### C1. Task 4 had no median question: **fixed**
- **Files and functions:** `js/rooms/number-lab.js`: Task 4 HTML, `setupRealLife()`, `setupFindMistake()` text.
- **Before → after:** Task 4 asked only for the mode → mode question first, then (once it's right) a median question about the same shoes.
- **Data change (decided with Habiba):** the shoe data changed from `34, 35, 35, 36, 34, 35, 37` (mode 35 = median 35) to **`36, 34, 35, 34, 37, 36, 34`** (mode **34**, median **35**). Now the median can't be answered by repeating the mode.
- **New on-screen text:**
  - The median question: "The shop wants the **median** size: half of the shoes sold are this size or smaller, and half are this size or bigger. Which size is it?"
  - Correct mode: "Yes! Size 34 sold 3 pairs, more than any other size. That's the mode."
  - Correct median: "Yes! In order, the sizes are 34, 34, 34, 35, 36, 36, 37. After putting them in order, the size in the centre (the 4th of 7) is 35. That's the median."
  - Mia's task: "…In order, they are 3, 5, 7, 9, 20. The number in the centre is 7, not 20."
- "middle" no longer appears in any text a child sees. It is still a variable name in `stats.js`.

### C2. Answer gating: **fixed**
- **Files and functions:** `js/rooms/number-lab.js`: new `wireRetryChoices()`, used by Task 3 and both Task 4 questions; `setupPredict()` for Task 1.
- **Before → after:**
  - Tasks 3 and 4 completed on any click, even a wrong answer → a wrong answer shows a kind hint, Next stays disabled, and only the correct answer completes the task.
  - Task 1 revealed the stats with an empty guess → it needs a number first.
- **New on-screen text:**
  - Task 1: "Type your guess first, then press Reveal!"
  - Task 3 hint: "Hmm, not quite. Try again! Hint: what must we always do to the numbers before finding the median?"
  - Mode hint: "Not quite. Try again! Hint: count how many times each size appears in the list."
  - Median hint: "Not quite. Try again! Hint: first put the sizes in order from smallest to biggest."
- **Effect on Part 10 (reasoning log):** positive. Each task now has a clear sequence of wrong click(s) → hint → correct click, so Part 10 can log:
  - **correct**: no wrong clicks
  - **correct after a hint**: one or more wrong clicks
  - **incorrect**: left without solving

  That matches architecture §7. The counter itself is not built yet, because the log is out of scope.

### C3. Chance Lab: **fixed (a, b, c)**
- **Files and functions:** `js/rooms/chance-lab.js`: `setupPredict()`, new `toPct()`, new `trialMessage()`, `barRow()`, `setupTrials()`, `previousRun`. Also `css/chance-lab.css`.
- **(a) "Why?" box:**
  - Before → after: a certainty rating alone completed Task 2 → a required **"Why?"** box sits under the scale.
  - With a rating but no reason, the child sees "Now tell us why you think so!".
- **(b) Honest feedback:**
  - Before → after: the text always said "it gets closer to theory" → it reports this run, and only claims "closer" when a bigger run really is closer than the previous run on the same device. The comparison resets when the device changes.
  - Example: "After 50 trials, 6 came up 11 times (22%). Theory says 1 in 6 (about 16.7%). That's closer to the theory than your 10-trial run (10%)."
  - If it is not closer: "This time it was NOT closer than your 50-trial run (22%). Chance can surprise us! Bigger runs are usually closer, but not every time."
- **(c) Theory labels:**
  - Before → after: theory bars were rounded whole percentages (six fair-dice bars of 17% = 102%) → theory reads **"1 in 6 (about 16.7%)"**.
  - Experimental bars use one decimal place, which is exact for 10, 50 and 500 trials, so they always add up to 100%.

### D1. Graph Lab, all 4 scenarios × 4 chart types: **fixed**
- **Files and functions:**
  - `js/helpers/charts.js`: `directLabelsPlugin`, `toDotPoints()`, new `dotXAxis()`, `makeChartConfig()`.
  - `js/rooms/graph-lab.js`.
- **What was broken:**
  1. **Playground dot plot was empty.** The scatter x-axis was numeric, so text values could not be placed: the axis ran 0–1 with no dots. → Text data now gets a category x-axis; numbers keep a number line.
  2. **The tallest bar lost its number** (e.g. sleep-hours 9 h = 6). The y-axis ended at the top count and the label was clipped. This affected bar, line and dot charts in every scenario. → The y-axis now goes one step higher.
  3. **Line charts drew values not in the data.** Curved lines (`tension: 0.25`) overshot, e.g. shoe sizes went above 5 between 34 and 35. → Lines are straight (`tension: 0`).
  4. **Pie:** the value of each slice was shown only by colour, in a small grey legend. → Slices are labelled "value (count)", e.g. "Football (6)", and the legend is removed.
  5. **Dot plot:** every dot had a number. → Only the top dot of each stack is labelled.
- **Readability:** all labels have a white outline, so they stay readable over slice borders and colours. I checked this on pie and dot plots in screenshots.
- **What a child now sees:** a working playground dot plot, every bar with its number, and pie slices that say what they are.

### D2. User text inserted with innerHTML: **fixed**
- **Files and functions:** `js/rooms/evidence-board.js`: `renderCard()` now uses `replaceChildren()` and a new `cardLine()` helper (`createElement` + `textContent`).
- **Before → after:** typed `<b>bold</b>` rendered as bold, and an `<img onerror>` could run → typed text shows literally as plain text. Tested with `<img onerror>`, `<b>` and `<script>` input: nothing ran or rendered.
- **Other rooms checked:** every other `innerHTML` uses recipe or constant data only. Question Studio's checker list inserts warnings whose only variable part is a word from the fixed `LEADING_WORDS` list, never raw typed text. No other change was needed.

### D3. Chart.js unpinned: **fixed**
- **Files:** `rooms/graph-lab.html`.
- **Before → after:** `chart.js@4` (floating) → `chart.js@4.5.1/dist/chart.umd.min.js`, the latest 4.x, published 13 Oct 2025.
- The floating URL was already serving 4.5.1, so the charts look the same today. The offline copy is not built (Part 12).

## 3. Found beyond the list, and not fixed

**Found and fixed:**
- **`[hidden]` did not hide buttons and links.** `.btn { display: inline-block }` overrode the browser's built-in `[hidden]` rule. Question Studio's "Let's collect the data →" was visible before a prediction was saved. Fixed with `[hidden] { display: none !important; }` in `css/base.css`. This also affected the new next-room links.
- **Duplicate click listeners** on Question Studio's "Save my prediction" if Task 3 was rebuilt (fixed as part of B1).
- **Graph Lab line charts overshooting the data** (D1 item 3) and **clipped top labels** (D1 item 2). These were not in the original list.
- **"came up 1 times"** grammar in the new Chance Lab feedback.

**Chosen NOT to fix (and why):**
- **Line chart for categories (playground):** a line joins unrelated games. This is left on purpose as a "what changes?" talking point for the reflection boxes; revisit in Part 11 if the pilot shows confusion.
- **Bar and pie colours are by position.** In the Class A vs B pie, colours repeat after 5 values. Labels now carry the meaning, so this is cosmetic (Part 11).
- **Number Lab's "Next" button reads "All done! 🎉" (disabled) on the last task** next to the new next-room link. This is the existing pattern in every room; changing it everywhere is Part 11 polish.
- **Not tested on a real Chromebook or tablet** (Part 11).
- Everything on the out-of-scope list was left alone.

## 4. B5 decision

**Decision (Habiba): option 1, one 📖 card that compares Class A and Class B**, instead of a separate Class B card.

**What was built:**
- `data/scenarios/reading-minutes-class-a.json` gains `"compareWith": "reading-minutes-class-b"` and `"compareTitle": "Reading minutes: Class A vs Class B"`. The Class B file is unchanged.
- New `js/helpers/scenarios.js`: `loadRecipe(id)` and `loadPartnerRecipe(recipe)`.
- **Question Studio:** the card is titled "Reading minutes: Class A vs Class B".
- **Data Hub:** a shared question box plus two class panels, each with its own survey, progress bar and tally. "▶ Now survey Class B" unlocks only after Class A finishes, and the next-room link appears after Class B. `wireUpSurvey()` takes an element prefix and an `onDone` callback.
- **Graph Lab:** two charts side by side with the **same labels and the same y-height**. The dot plot shares the number line from 4 to 36, so Class A's tight cluster (18–22) and Class B's spread (5–35) are a fair visual comparison. The chart-type buttons switch both charts.
- **Evidence Board:** the claim prompt uses the compare title, and the 4 chips read "Class A mean: 20 · Class B mean: 20 · Class A range: 4 · Class B range: 30".
- Other scenarios are unchanged (one class).

## 5. Size of the change

**Line counts of changed files (after this pass):**

| File | Lines |
|---|---|
| css/base.css | 100 |
| css/chance-lab.css | 147 |
| css/data-hub.css | 149 |
| css/graph-lab.css | 59 |
| data/scenarios/reading-minutes-class-a.json | 14 |
| data/scenarios/shoe-sizes.json | 12 |
| docs/build-progress.md | 53 |
| js/app.js | 65 |
| js/helpers/charts.js | 139 |
| js/helpers/generator.js | 70 |
| js/helpers/scenarios.js (new) | 12 |
| js/helpers/stats.js | 51 |
| js/rooms/chance-lab.js | 271 |
| js/rooms/data-hub.js | 156 |
| js/rooms/evidence-board.js | 280 |
| js/rooms/graph-lab.js | 86 |
| js/rooms/number-lab.js | 252 |
| js/rooms/question-studio.js | 244 |
| js/storage/save.js | 23 |
| rooms/graph-lab.html | 26 |
| tests/charts.test.js (new) | 29 |
| tests/checker.test.js | 37 |
| tests/generator.test.js | 78 |
| tests/stats.test.js | 55 |

**`git diff --stat 61d4d61`** (tracked files only. The 2 new files, `js/helpers/scenarios.js` with 12 lines and `tests/charts.test.js` with 29 lines, and this summary file are untracked, so they are not listed):

```
 css/base.css                                |  11 +++
 css/chance-lab.css                          |  20 ++++-
 css/data-hub.css                            |   7 +-
 css/graph-lab.css                           |  13 ++++
 data/scenarios/reading-minutes-class-a.json |   2 +
 data/scenarios/shoe-sizes.json              |   2 +-
 docs/build-progress.md                      |  19 ++++-
 js/app.js                                   |  10 ++-
 js/helpers/charts.js                        |  68 ++++++++++++----
 js/helpers/generator.js                     |   5 +-
 js/helpers/stats.js                         |  16 +++-
 js/rooms/chance-lab.js                      |  78 ++++++++++++++++---
 js/rooms/data-hub.js                        | 116 +++++++++++++++++++++-------
 js/rooms/evidence-board.js                  |  75 +++++++++++++-----
 js/rooms/graph-lab.js                       |  59 ++++++++++----
 js/rooms/number-lab.js                      | 110 +++++++++++++++++---------
 js/rooms/question-studio.js                 |  78 +++++++++++--------
 js/storage/save.js                          |  17 +++-
 rooms/graph-lab.html                        |   3 +-
 tests/checker.test.js                       |  10 +++
 tests/generator.test.js                     |  22 +++++-
 tests/stats.test.js                         |   7 +-
 22 files changed, 568 insertions(+), 180 deletions(-)
```

## 6. Click-path changes (the supervisor walkthrough describes the old behaviour)

1. **Question Studio:**
   - The step bar now highlights **Plan** on Task 3, instead of Ask.
   - "Let's collect the data →" is hidden until a prediction is saved. Before, it was visible straight away because of the `[hidden]` bug.
   - Going back and picking another scenario resets Task 3.
2. **Question Studio:** the 📖 card is now "Reading minutes: Class A vs Class B", and the 👟 card's question ends in "this year".
3. **Data Hub:**
   - New button at the end: **"📊 Let's draw a graph! →"**.
   - For 📖 there are **two surveys**: "▶ Survey Class A", then "▶ Now survey Class B", which is locked until A finishes.
4. **Graph Lab:**
   - New **"🔢 Next: Number Lab →"** button.
   - For 📖 there are two charts.
   - Pie charts have no legend; the slices are labelled.
   - The playground dot plot now shows dots.
5. **Number Lab:**
   - **Task 1:** Reveal does nothing until a number is typed.
   - **Task 3:** "Mia is right" no longer completes the task; it gives a hint and a retry.
   - **Task 4:** new shoe data (36, 34, 35, 34, 37, 36, 34), and the mode answer is now **34**, not 35. A wrong answer gives a hint and a retry. A **second question (median, answer 35)** appears after the mode is correct.
   - New **"🎲 Next: Chance Lab →"** button after Task 4.
6. **Chance Lab:**
   - **Task 2:** a new **required "Why?" box**. A rating alone no longer enables Next.
   - **Task 3:** theory reads "1 in 6 (about 16.7%)", the feedback text changed (see C3), and there's a new **"🚩 Next: Evidence Board →"** button.
7. **Evidence Board:**
   - Sleep-hours mean chip reads **8.4**, not 8.3.
   - For 📖, the chips are Class A / Class B mean and range.
   - Typed text appears literally on the card.
