# DataScope badges: design and animation spec (Explorer's Toolkit)

Belongs to **Part 21b (Progress and rewards)** in `docs/round-2-plan.md`. It uses the pop-up component from **Part 13** (`js/ui/modal.js`).

**Reference files in this folder:**
- `badges-demo.html`: a working demo of the badge pop-up, the flight into the backpack, and the backpack shelf. Open it with Live Server and use the DEMO buttons.
- `explorer-ui.html`: the chosen look (Direction 3, Explorer's Toolkit) as one static screen.

These are references. **Port the ideas into the real app's files and do not copy them in whole.** Visual values go into `css/theme.css` variables.

---

## 1. Hard rules (from CLAUDE.md and round-2 decision D7)
- Badges reward **reasoning**: guessing first, explaining, changing your mind because of the data, using evidence. Never speed. No timers, no leaderboards, and no comparing children.
- Using a hint never blocks a badge.
- Each badge is earned **once** per child code. Earning is saved with `save.js` and logged with `log.js` as `badge-earned { badgeId, phase }`. If a badge event already exists, reuse it and do not rename it.
- Colour is never the only signal: every badge has its own **icon and name**.
- `prefers-reduced-motion` gives the same information with no movement (see section 5).
- Child-facing text uses the Grade 5 language rules from Part 17.

## 2. The 9 badges

**Super badges** reward the deepest reasoning. They get a gold outer ring, a "★ Super reasoning badge ★" tag, more confetti and stronger rays.

| id | Name | Phase | Colour (theme var) | Icon | Earn rule (suggested; check it against the real log events) | Pop-up text (why) | Locked hint (how) |
|----|------|-------|--------------------|------|------|------|------|
| question-fixer | Question Fixer | Ask | --ask #FF7A6B | question mark | Fixed one flawed question so it passes the checker | You fixed a confusing question. Clear questions get clear answers! | Fix a question that is not clear. |
| brave-guesser | Brave Guesser | Plan | --plan #FFC531 | compass | Saved a prediction before seeing data | You made a guess before looking. Scientists guess first, then check! | Make a guess before you see the data. |
| data-collector | Data Collector | Collect | --collect #38B6FF | clipboard | Survey complete (both classes for Reading minutes) | You asked the whole pretend class. More answers, better evidence! | Ask the whole pretend class. |
| graph-explorer | Graph Explorer | Explore | --explore #4CC26B | bar chart | Tried 2 or more chart types | You tried two kinds of graphs. Each one shows something new! | Try 2 different graphs. |
| middle-finder | Middle Finder | Explore | --collect #38B6FF | 5 dots, middle one big | Median task correct after sorting (or with the drag-to-sort cards) | You put the numbers in order to find the middle. That is the median! | Sort the numbers to find the median. |
| chance-tester | Chance Tester | Explore | --conclude #8E7CFF | dice | Ran both 10 and 500 trials and answered the compare question | You saw that more tries get closer to the real chance! | Run 10 tries, then 500 tries. |
| mind-changer ★ | Mind Changer | any | --conclude #8E7CFF | two curved arrows | Revised a prediction after seeing data, with a reason | You changed your mind because of the data. Real scientists do that! | Change your guess after you see the data. |
| because-builder ★ | Because Builder | any | --plan #FFC531 | speech bubble | 3 written answers that contain "because" (or "so") and are at least 10 characters | You explained your thinking with "because" three times. Great reasoning! | Explain 3 answers using "because". |
| evidence-expert ★ | Evidence Expert | Conclude | --ask #FF7A6B | flag | Evidence Card has a claim, at least 1 evidence item, and a certainty with a reason | You made a claim, showed proof and said how sure you are! | Finish your Evidence Card. |

**Note for Claude in VS Code:** the app already has badges.
1. **First list the existing badge IDs and rules** in the code.
2. Propose a mapping to this table: keep existing IDs where they match, and add only the missing ones.
3. Ask Habiba before removing any badge.

Earn rules must be **pure functions** (for example `js/helpers/badges.js` → `checkBadges(entries) → newBadgeIds[]`), with tests in `tests/badges.test.js`.

## 3. How a badge looks
- A **round explorer patch** in a 120×120 SVG:
  - outer circle in the badge colour with a 4px navy (#17324D) outline
  - a white dashed "stitch" ring (dasharray 6 6)
  - a light inner circle with a 3px navy outline
  - the icon in navy stroke (2.2), scaled 2× from a 24px grid
- **Super:** an extra gold (#FFC531) outer ring.
- **Locked:** a grey patch (#C9D6E2, inner #EEF3F7), a lock icon, a dashed "Locked" ribbon and the "how" text underneath.
- **Name ribbon:** a white pill with a navy outline and a small colour dot. Navy text on white is used for contrast; never put navy text on the violet badge colour.
- **Mystery back** (shown before the flip): a navy circle with a gold dashed ring and a big gold "?".
- Icon SVG paths are in `ICONS` inside `badges-demo.html`. All art is original. Pip is our own owl.

## 4. The pop-up animation (total about 2 seconds, then the button pulses gently)

| Time | What happens | CSS |
|------|--------------|-----|
| 0 ms | Backdrop fades in (navy at 55%) | `bp-fade` 200 ms |
| 100 ms | Card drops in with a bounce | `bp-drop` 550 ms, spring `cubic-bezier(.34,1.56,.64,1)` |
| 300 ms+ | "You found a badge!" letters bounce in one by one (35 ms apart) | `bp-letter` |
| 450 ms | Mystery patch spins 1.5 turns and lands showing the badge | `bp-flip` rotateY 0 → 540deg, 900 ms |
| 1350 ms | **Stamp:** badge pops to 128% and settles; card wiggles | `bp-stamp`, `bp-shake` |
| 1350 ms | Gold rays appear, then spin slowly forever | `bp-rays-in`, `bp-spin` 9 s linear |
| 1350 ms | Confetti burst: 16 pieces (28 for super), circles and stars in the 5 room colours | `bp-burst`, `--a` angle, `--d` distance |
| 1500 ms | Badge name, super tag, and the "why" sentence rise in | `bp-rise` |
| 1800 ms | Pip peeks up from the bottom-left corner, then waves 3 times | `bp-peek`, `bp-wave` |
| 1900 ms | "Put it in my backpack →" button appears; focus moves to it | `bp-rise` |
| 2600 ms+ | Button pulses gently (5%) | `bp-pulse` |
| On click | The badge **flies along an arc** into the header backpack (Web Animations API, 800 ms). The backpack bumps, the counter pops +1, and the new badge springs into its slot on the shelf | `flyToBackpack()`, `bp-bump`, `bp-count`, `bp-slot` |
| Optional | A soft 3-note chime (Web Audio, no sound files), only if sound is ON (it is off by default) | `chime()` |

**Queue:** if 2 badges are earned at once, show them one after the other using the Part 13 modal queue. Badge pop-ups come **after** the phase-feedback card (Part 16), never on top of it.

## 5. Accessibility and performance
- Built as a real dialog with `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the badge name. Esc closes it (the badge is still added). Focus stays inside and returns to the previous element afterwards.
- The animated letters are `aria-hidden`; the name and "why" sentence are real text.
- **Reduced motion:** no flip, rays, confetti, flight or pulse. The card appears with the badge already showing, and the counter updates instantly.
- Animate only `transform` and `opacity`. Keep confetti under 60 pieces. Nothing flashes more than 3 times a second.
- Tap targets are at least 48px (the button is 58px). It must work by touch, by mouse and by keyboard alone.

## 6. Where it plugs in
- `css/theme.css`: tokens `--spring`, `--ease-out`, and the 5 room colours (already there if the Explorer theme is in place).
- `css/badges.css`: the badge, shelf and pop-up styles plus all `bp-*` keyframes.
- `js/ui/badge-popup.js`: `showBadgePopup(badge)`, built on `openModal()` from Part 13.
- `js/helpers/badges.js`: the badge list (data) plus `checkBadges()`, a pure function with tests.
- **Header:** the badge counter becomes a **backpack button** that opens the "My Explorer Backpack" shelf (and is the target of the flight).
- The **My journey** page (Part 19) can reuse the shelf.
- **Thesis note:** badges are tied to reasoning moves recorded in the log (Papers 26, 30; architecture row 9). The badge log shows *which* reasoning moves each child made.
