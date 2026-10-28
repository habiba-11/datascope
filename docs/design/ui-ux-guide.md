# DataScope UI/UX guide: structure and motion (round 2)

**Goal:** every screen feels calm and clear, never crowded, and motion helps the child understand what is happening. The look stays Explorer's Toolkit (see `explorer-ui.html` and `CLAUDE.md`).

**Reference frames:** `docs/design/frames/`. Open `index.html` with Live Server and reload a frame to replay its motion. They are **references**: port the patterns into the real files. Do not copy them in whole, and keep the real texts from the content files (Part 17).

| Frame | Screen | Main idea |
|-------|--------|-----------|
| f1-start | Welcome / code | One big action, Pip waving, title letters bounce in |
| f2-phaseintro | Phase intro pop-up (Part 14) | 3 short bullets that appear one by one, one button |
| f3-ask | Ask: pick a question | 4 big choice cards; the chosen one lifts and gets a check |
| f4-collect | Data Hub | Classmates "take their seats"; seat colours match bar colours; bars grow |
| f5-numberlab | Number Lab | Explore sub-rooms as tabs; a mini stepper; cards slide into order and the middle lights up |
| f6-chancelab | Chance Lab | Spinner with easing; dashed "should" bars next to solid "did" bars |
| f7-phasefeedback | Phase-end feedback (Part 16) | Stars pop one by one, 2 wins, 1 nudge, the lock opens on the next phase |
| f8-evidenceboard | Evidence Board | Clue tray beside a 3-slot card; a clue flies in; a "Ready to share!" stamp |

---

## 1. The 3-zone layout (use it on EVERY room screen)

```
┌──────────────────────────────────────────────────────────┐
│ ZONE 1  Top bar: logo · trail (step bar) · (i) · backpack │
├──────────────────────────────────────────────────────────┤
│ ZONE 2  ONE task card (max-width 1000px, centred)        │
│   coloured header strip: room name + "Task 2 of 3"       │
│   Pip line (1 sentence) + big question (1 line)          │
│   the task itself (max 2 panels side by side)            │
├──────────────────────────────────────────────────────────┤
│ ZONE 3  Action bar: [Back]            [Hint] [PRIMARY]   │
└──────────────────────────────────────────────────────────┘
```

- **Zone 1, top bar.** It is identical on every room screen. Use icon buttons with an `aria-label`. Pip does **not** live here.
  - The trail shows done steps (green ✓), the current step (room colour, pulsing ring) and **one** locked "More soon" stop (Part 15).
  - Room-specific buttons (📘 Recap) sit next to (i). There are at most 3 buttons on the right.
- **Zone 2, the task card.** **One task per screen.** Pip moves *into* the card as one short line next to the question, so Pip no longer takes up a whole column.
  - The Explore rooms become **tabs on the card header** (Graph Lab · Number Lab · Chance Lab, with ✓ and 🔒), not separate crowded pages.
  - Multi-step tasks use a **mini stepper** (chips: ✓ Guess · 2 Sort · 3 Find the middle) instead of showing every step at once.
- **Zone 3, the action bar.** It is always in the same place: **Back** (quiet, light outline) on the left; **Hint** (white) and **ONE primary button** (green #2E9A4F, white text) on the right.
  - The primary button's text says exactly what happens next ("Ask the other 8", "Check my order", "Spin 500 times").
  - When the task is not finished, the primary button explains why (for example "Write your idea first") instead of hiding.

## 2. Declutter rules (the checklist for every screen)

1. **One primary button** per screen, always in the action bar. Everything else is secondary (white) or quiet (outline / link).
2. **At most 4 choices** visible at once (Grade 5 rule: 3 to 4). More choices go behind "Show more" or a next step.
3. **One sentence** of instruction, plus one big question. Extra explanation goes into (i), Hint or 📘 Recap pop-ups (progressive disclosure).
4. **At most 2 panels** side by side in the card. Panels stack at narrow widths (`flex-wrap` / `auto-fit`).
5. **Show results only after the child acts** (predict first, then reveal), so the screen grows step by step.
6. **Spacing:** 8 / 16 / 24 / 32 px only. 24px inside cards, 16 to 22px between groups. White space is fine; the area under the card may stay empty.
7. **Text:** body at least 17px, questions 30 to 34px (Baloo 2), labels 15px minimum. No paragraph is wider than about 70 characters.
8. **Same thing, same place:** the room colour lives in the card header strip, the trail circle and the room's icons. The primary button is always green.
9. **No duplicate info:** if the trail shows progress, do not also print "You are in Collect" on the page.
10. **Touch:** every button is at least 48px tall, with at least 8px between targets.

**Audit table to fill in for every current screen (Claude: produce this before refactoring):**

| Screen | # buttons visible | # primary-looking buttons | # sentences of instruction | panels | What moves out (to (i) / Hint / Recap / next step) |
|--------|-------------------|---------------------------|----------------------------|--------|-------------------------------------------------------|

## 3. Components to build once and reuse
- `topBar({ phase, unlocked, done })`: logo, trail, (i), optional extra icon button, backpack.
- `taskCard({ room, title, taskIndex, taskCount, tabs? })`: header strip (room colour), optional tabs, task dots; returns the body element.
- `pipLine(text)`: a small Pip with one sentence.
- `miniStepper(steps, current)`: done / current / next chips.
- `actionBar({ back, hint, primary: { label, onClick, enabled, whyDisabled } })`.
- `choiceCards(options)`: big tappable cards with `role="radio"`, a check badge on the chosen one, and arrow-key support.
- `segmented(options)`: for 10 / 50 / 500 trials, chart types, and similar choices.
- Buttons, three kinds only: `.btn-primary`, `.btn-secondary`, `.btn-quiet`, plus `.icon-btn`. They press down 5px on `:active`.

## 4. Motion system

**Tokens** (in `css/theme.css`):
```
--dur-fast: 150ms;  --dur: 300ms;  --dur-slow: 600ms;
--ease-out: cubic-bezier(.22,1,.36,1);
--spring:   cubic-bezier(.34,1.56,.64,1);   /* bouncy overshoot */
--stagger:  90ms;
```

**Reusable classes** (in `css/motion.css`), each with a stagger index through `style="--i: 2"`:

| Class | What it does | Use it for |
|-------|--------------|------------|
| `m-rise` | fades in and rises 18px | cards, text blocks, list items on enter |
| `m-pop` | scales from 0.6 with a bounce | choice cards, chips, seats, stars |
| `m-ring` | a pulsing ring around the current trail step | "you are here" |
| `m-grow` | bars grow from the bottom (`scaleY`) | tally, Graph Lab, Chance Lab bars |
| `m-pulse` | gentle 4% breathing | the primary button, only once the task is ready |
| `m-float` | slow up/down | Pip on the welcome screen |
| `m-shake` | small left/right wobble | lock before it opens; a gentle "try again" (never as a punishment) |

**What each motion means** (motion must teach, not decorate):
- **Enter:** the card rises, then its content staggers in (90 ms apart). The child's eye follows the order of reading.
- **Choose:** the chosen card lifts 4px and a check badge pops. The others stay still.
- **Data arrives (Collect):** each classmate pops into a seat; the matching bar grows by one step at the same moment. The seat colour equals the bar colour, so the child sees *one answer → one bar step*.
- **Order (Number Lab):** cards slide along an arc into sorted order, then the middle card turns green with a "Middle!" arrow. This shows *why* the median needs sorting (Papers 6 to 9).
- **Chance:** the spinner eases out (fast, then slow); the pointer ticks when it stops; "did" bars grow next to the dashed "should" bars.
- **Finish a phase:** the feedback card springs in, stars pop one by one (300 ms apart), wins rise, the lock shakes, the shackle opens, and the next trail circle pops in (Part 15 + 16).
- **Conclude:** the chosen clue flies from the tray into the "My proof" slot; the slot glows; the certainty pill bounces; a "Ready to share!" stamp lands.
- **Badges:** see `badges-spec.md` (flip, stamp, confetti, fly to backpack).

**Rules:**
- Animate only `transform` and `opacity` (plus `background-color` on a few highlights).
- Entrances last 300 to 600 ms. Never block input for longer than the animation. A tap during an animation finishes it instantly.
- Loops are only for "you are here" (ring), "ready" (pulse) and demos. Pause loops when the tab is hidden.
- `@media (prefers-reduced-motion: reduce)`: no movement at all. Everything is shown in its final state, and the information stays the same.
- No timers and no speed rewards. Nothing flashes more than 3 times a second.

## 5. Screens not drawn yet: apply the same pattern
- **Plan:** a task card with a "Make a guess" slider (big thumb, the live number in Baloo 2), then "Save my guess" as the primary.
- **Graph Lab:** the Explore tabs; a segmented chart-type switch above the chart; bars and dots animate between types; the reflection question appears **after** the child has tried 2 types.
- **My journey (Part 19):** a 5-stop trail with Pip walking stop to stop, one summary card per stop (stars, 1 to 2 lines, a "see more" button), and the backpack shelf at the end.
- **Teacher dashboard (Part 20):** calm version: no motion, no Pip, plain cards and tables. It is an adult tool.

## 6. Suggested build order (Claude: adapt to round-2-plan.md and confirm with Habiba)
1. **UI-a: tokens and `motion.css`.** Can merge with Part 21a.
2. **UI-b: shell components:** `topBar` with the trail (uses Part 15 progress), `actionBar`, `taskCard`, `pipLine`, the three button kinds.
3. **UI-c: refactor one room at a time** into the 3-zone layout, in this order: Data Hub → Number Lab → Question Studio → Graph Lab → Chance Lab → Evidence Board. One commit per room, with a before/after screenshot for the thesis.
4. **UI-d: room motions** from section 4 (merges with Part 21c).
5. **UI-e: audit:** fill in the table from section 2 again for every screen, test keyboard-only use and reduced motion, and check on a Chromebook or tablet.

**Thesis note:** decluttering follows a one-task-per-screen rule and progressive disclosure, which supports guided inquiry for young learners (Papers 23 to 25) and graph reading (Papers 20 and 21). Before/after screenshots and the audit table are the evidence.
