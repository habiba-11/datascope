// Shell layer: small happy motions, paired with their sound.
// Simple ones are CSS animations (base.css, shell.css), so "reduce motion"
// switches them all off in one place (base.css). Bigger ones (Part 21) use
// GSAP (js/vendor/gsap.min.js, loaded by each room page): they also do nothing
// with reduced motion, and if GSAP is missing the page still works, just still.
// The sounds still follow the sound toggle.
import { playSound, playBursts } from './sounds.js';
import { pipMoodFor } from './pip.js';

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
  lock.textContent = '🔒';
  holder.append(lock);

  gsap.timeline({ onComplete: () => lock.remove() })
    .from(element, { scale: 0.3, opacity: 0, duration: MOTION.medium, ease: MOTION.spring, clearProps: 'all' })
    .to(lock, { keyframes: { x: [-4, 4, -3, 3, 0] }, duration: 0.4 })
    .call(() => { lock.textContent = '🔑'; })
    .to(lock, { rotation: 90, duration: MOTION.fast })
    .call(() => { lock.textContent = '🔓'; })
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

// Confetti in the five room colours falls over the page (big moments only:
// a finished phase, or leveling up). Skipped with reduced motion.
// It ALWAYS plays a sound with it (the sparkle, or e.g. 'levelUp'), even with
// reduced motion, so the same moment always sounds the same (4 Nov 2026).
const CONFETTI_COLOURS = ['ask', 'plan', 'collect', 'explore', 'conclude'];

export function confetti({ sound = 'confetti' } = {}) {
  playSound(sound);
  if (reduceMotion()) return;
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.setAttribute('aria-hidden', 'true');
    piece.style.left = `${Math.random() * 95}vw`; // 95, so no piece pokes out sideways
    piece.style.background = `var(--color-${CONFETTI_COLOURS[i % CONFETTI_COLOURS.length]})`;
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    piece.style.setProperty('--spin', `${Math.random() * 720 - 360}deg`);
    document.body.append(piece);
    // Removed after 2.5 s (1.8 s fall + up to 0.5 s delay), even if the animation never ran.
    setTimeout(() => piece.remove(), 2500);
  }
}

// Fireworks (Part 43b, Round 4): bursts of coloured sparks, one after another,
// for a finished phase (3 bursts) or the end of the whole journey (6 bursts).
// Each burst has a soft pop (sounds.js playBursts), at fixed times, so the same
// moment always sounds the same; with reduced motion only the sound plays.
// The sparks only fade out once (no flashing) and never block a tap.
export const BURST_GAP = 0.35; // seconds between two bursts
const SPARKS = 14;

export function fireworks({ bursts = 3 } = {}) {
  const times = Array.from({ length: bursts }, (_, i) => i * BURST_GAP);
  playBursts(times);
  if (reduceMotion()) return;
  times.forEach((time, b) => {
    const burst = document.createElement('span');
    burst.className = 'firework';
    burst.setAttribute('aria-hidden', 'true');
    burst.style.left = `${15 + Math.random() * 70}vw`;
    burst.style.top = `${12 + Math.random() * 35}vh`;
    for (let i = 0; i < SPARKS; i++) {
      const angle = (i / SPARKS) * 2 * Math.PI;
      const distance = 70 + Math.random() * 40;
      const spark = document.createElement('i');
      spark.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      spark.style.setProperty('--c', `var(--color-${CONFETTI_COLOURS[(b + i) % CONFETTI_COLOURS.length]})`);
      spark.style.setProperty('--d', `${time}s`);
      burst.append(spark);
    }
    document.body.append(burst);
    setTimeout(() => burst.remove(), (time + 1.4) * 1000);
  });
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
