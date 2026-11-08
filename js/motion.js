// Shell layer: small happy motions, paired with their sound.
// Simple ones are CSS animations (base.css, shell.css), so "reduce motion"
// switches them all off in one place (base.css). Bigger ones (Part 21) use
// GSAP (js/vendor/gsap.min.js, loaded by each room page): they also do nothing
// with reduced motion, and if GSAP is missing the page still works, just still.
// The sounds still follow the sound toggle.
import { playSound, playFirework } from './sounds.js';
import { launchFirework } from './fireworks.js';
import { blastConfetti } from './confetti.js';
import { pipMoodFor } from './pip.js';
import { iconHTML } from './icon-text.js';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The same timings as the motion tokens in theme.css (seconds).
export const MOTION = { fast: 0.25, medium: 0.45, slow: 0.8, spring: 'back.out(1.7)', out: 'power3.out' };

// GSAP, or null when it may not or cannot run (reduced motion, or not loaded).
function gsapOrNull() {
  return !reduceMotion() && window.gsap ? window.gsap : null;
}

// A hidden tab does not need to animate: pause everything until it is back.
if (typeof document !== 'undefined' && window.gsap) {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.gsap.globalTimeline.pause();
    else window.gsap.globalTimeline.resume();
  });
}

// Plays a CSS animation class on an element, even if it is already playing.
export function animate(element, name) {
  if (!element) return;
  element.classList.remove(name);
  void element.offsetWidth; // forces the browser to restart the animation
  element.classList.add(name);
  element.addEventListener('animationend', () => element.classList.remove(name), { once: true });
}

// Pip reacts: 'hop' (a happy hop, wings up) or 'think' (a head tilt, eyes up, "?").
export function pipReacts(name) {
  // Every Pip on the page: the one in the card and (Part 43c) big Pip beside it.
  document.querySelectorAll('.pip-mascot').forEach((pip) => animate(pip, name));
  pipMoodFor(name === 'think' ? 'think' : 'cheer');
}

// Part 43c: tells big Pip (js/pip-stand.js) to say a line for this event.
// An event on the window, so motion.js does not need to know about the stand.
function pipLine(event) {
  window.dispatchEvent(new CustomEvent('datascope:pip', { detail: { event } }));
}

// ---------- GSAP helpers (Part 21a) ----------

// Elements spring in one after another (stat cards, list items, stars...).
// `keepStyle`: true when the elements have their own inline style that must
// stay afterwards (e.g. a bar's width); otherwise the motion styles are cleared.
export function stagger(elements, { each = 0.08, from = { y: 16, scale: 0.85 }, keepStyle = false } = {}) {
  const gsap = gsapOrNull();
  if (!gsap || !elements.length) return;
  gsap.from(elements, {
    ...from, opacity: 0, duration: MOTION.medium, ease: MOTION.spring, stagger: each,
    ...(keepStyle ? {} : { clearProps: 'all' }),
  });
}

// One element pops in.
export function pop(element) {
  stagger(element ? [element] : []);
}

// A number counts up from 0 to `to` (e.g. the mean 8.4). With reduced motion,
// or without GSAP, the final number is simply shown.
export function countUp(element, to, decimals = 0) {
  const gsap = gsapOrNull();
  const show = (n) => { element.textContent = n.toFixed(decimals); };
  if (!gsap) {
    show(to);
    return;
  }
  const counter = { value: 0 };
  gsap.to(counter, { value: to, duration: MOTION.slow, ease: MOTION.out, onUpdate: () => show(counter.value), onComplete: () => show(to) });
}

// A gentle side-to-side shake (a kind "not yet", never an angry one).
export function shake(element) {
  const gsap = gsapOrNull();
  if (!gsap || !element) return;
  gsap.fromTo(element, { x: 0 }, { keyframes: { x: [-6, 6, -4, 4, 0] }, duration: MOTION.medium, ease: 'none', clearProps: 'x' });
}

// A short "look at me" pulse (e.g. a newly opened button).
export function pulse(element) {
  const gsap = gsapOrNull();
  if (!gsap || !element) return;
  gsap.fromTo(element, { scale: 1 }, { scale: 1.08, duration: MOTION.fast, yoyo: true, repeat: 3, ease: 'sine.inOut', clearProps: 'scale' });
}

// A slow, endless float up and down (e.g. Pip waiting). Returns the tween so
// it can be stopped; nothing with reduced motion.
export function float(element) {
  const gsap = gsapOrNull();
  if (!gsap || !element) return null;
  return gsap.to(element, { y: -6, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
}

// The room's content slides in when a page opens.
export function enterRoom(element) {
  const gsap = gsapOrNull();
  if (!gsap || !element) return;
  gsap.from(element, { y: 24, opacity: 0, duration: MOTION.medium, ease: MOTION.out, clearProps: 'all' });
}

// A step (or Explore tab) opens: it springs in while a 🔒 shakes, becomes a 🔑,
// turns, becomes 🔓 and floats away (Part 21b). Without motion it just appears.
export function unlockStep(element) {
  const gsap = gsapOrNull();
  if (!gsap || !element) return;
  const holder = element.querySelector('.step-icon') || element;
  const lock = document.createElement('span');
  lock.className = 'unlock-badge';
  lock.setAttribute('aria-hidden', 'true');
  lock.innerHTML = iconHTML('lock'); // our icons (Part 54g)
  holder.append(lock);

  gsap.timeline({ onComplete: () => lock.remove() })
    .from(element, { scale: 0.3, opacity: 0, duration: MOTION.medium, ease: MOTION.spring, clearProps: 'all' })
    .to(lock, { keyframes: { x: [-4, 4, -3, 3, 0] }, duration: 0.4 })
    .call(() => { lock.innerHTML = iconHTML('key'); })
    .to(lock, { rotation: 90, duration: MOTION.fast })
    .call(() => { lock.innerHTML = iconHTML('lock-open'); })
    .to(lock, { rotation: 0, scale: 1.4, duration: 0.2 })
    .to(lock, { y: -24, opacity: 0, duration: 0.35 })
    .fromTo(holder, { scale: 1 }, { scale: 1.25, duration: 0.18, yoyo: true, repeat: 1, clearProps: 'scale' }, '<');
}

// A progress bar grows from `fromPct` to its own width (e.g. the level bar).
export function growBar(fill, fromPct) {
  const gsap = gsapOrNull();
  if (!gsap || !fill) return;
  gsap.from(fill, { width: `${fromPct}%`, duration: MOTION.slow, ease: MOTION.out });
}

// Cards flip in, one after another (e.g. earned badges on the shelf).
export function flipIn(elements) {
  const gsap = gsapOrNull();
  if (!gsap || !elements.length) return;
  gsap.from(elements, { rotationY: 180, opacity: 0, duration: MOTION.slow, ease: MOTION.spring, stagger: 0.12, clearProps: 'all' });
}

// A bar bounces up from the bottom (e.g. a tally bar that just grew).
export function bounceBar(element) {
  const gsap = gsapOrNull();
  if (!gsap || !element) return;
  gsap.from(element, { scaleY: 0.6, transformOrigin: '50% 100%', duration: MOTION.medium, ease: 'elastic.out(1, 0.5)', clearProps: 'transform' });
}

// A rubber stamp thumps down onto a card (e.g. the finished Evidence Card).
export function stamp(element) {
  const gsap = gsapOrNull();
  if (!gsap || !element) return;
  gsap.from(element, { scale: 3, opacity: 0, rotation: -40, duration: MOTION.medium, ease: 'power4.in' });
}

// ---------- big moments ----------

// Confetti in the five room colours (big moments only: a finished phase, a
// level up, the stamped Evidence Card, My journey). Realistic since 8 Nov 2026
// (Habiba): two party-popper blasts on a canvas (js/confetti.js). Skipped with
// reduced motion.
// It ALWAYS plays a sound with it (the sparkle, or e.g. 'levelUp'), even with
// reduced motion, so the same moment always sounds the same (4 Nov 2026).
export function confetti({ sound = 'confetti' } = {}) {
  playSound(sound);
  if (reduceMotion()) return;
  blastConfetti();
}

// Fireworks (Part 43b; changed 6 Nov 2026, Habiba: in the background, and
// realistic): rockets rise and burst on a canvas BEHIND the cards (js/fireworks.js),
// each with a firework sound (sounds.js playFirework). They burst where they can
// be seen: the side margins and the band above the card, in turn.
// Since 8 Nov 2026 (Habiba) only My journey has fireworks: a gentle, far-off
// loop (fireworksLoop). The rooms have confetti only. Reduced motion: only the sound, once.
export const BURST_GAP = 0.45; // seconds between two rockets

const BURST_ZONES = [
  { x: [3, 12], y: [18, 55] },
  { x: [88, 97], y: [18, 55] },
  { x: [25, 75], y: [6, 12] },
];
let burstCount = 0;

// One rocket, `delay` seconds from now, in the next zone; returns nothing.
function rocket(delay, far) {
  const zone = BURST_ZONES[burstCount % BURST_ZONES.length];
  const between = ([from, to]) => from + Math.random() * (to - from);
  const seed = burstCount;
  burstCount += 1;
  playFirework(delay, far);
  if (!reduceMotion()) launchFirework((between(zone.x) / 100) * innerWidth, (between(zone.y) / 100) * innerHeight, seed, delay);
}

export function fireworks({ bursts = 3 } = {}) {
  if (reduceMotion()) {
    playFirework(0);
    return;
  }
  for (let b = 0; b < bursts; b++) rocket(b * BURST_GAP, false);
}

// The finale on My journey: a far-off show, one rocket about every 2.2 s, for
// as long as the page is open; quieter and duller, so it never gets in the way.
// It rests while the tab is hidden. Returns a function that stops it.
export const LOOP_GAP_MS = 2200;

export function fireworksLoop() {
  if (reduceMotion()) {
    playFirework(0, true);
    return () => {};
  }
  const timer = setInterval(() => {
    if (!document.hidden) rocket(0, true);
  }, LOOP_GAP_MS);
  rocket(0, true);
  return () => clearInterval(timer);
}

// A right answer: a chime, the feedback box bounces, and Pip hops.
export function cheer(feedback) {
  playSound('correct');
  animate(feedback, 'cheer');
  pipReacts('hop');
  pipLine('correct');
}

// A wrong answer: a soft sound, a gentle wobble, and Pip thinks with you.
// Kind on purpose: trying again is part of learning, not a failure.
export function encourage(feedback) {
  playSound('tryAgain');
  animate(feedback, 'wobble');
  pipReacts('think');
  pipLine('tryAgain');
}
