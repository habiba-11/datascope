// Shell layer: small happy motions, paired with their sound.
// Simple ones are CSS animations (base.css, shell.css), so "reduce motion"
// switches them all off in one place (base.css). Bigger ones (Part 21) use
// GSAP (js/vendor/gsap.min.js, loaded by each room page): they also do nothing
// with reduced motion, and if GSAP is missing the page still works, just still.
// The sounds still follow the sound toggle.
import { playSound } from './sounds.js';
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
  animate(document.querySelector('.pip-mascot'), name);
  pipMoodFor(name === 'think' ? 'think' : 'cheer');
}

// ---------- GSAP helpers (Part 21a) ----------

// Elements spring in one after another (stat cards, list items, stars...).
export function stagger(elements, { each = 0.08, from = { y: 16, scale: 0.85 } } = {}) {
  const gsap = gsapOrNull();
  if (!gsap || !elements.length) return;
  gsap.from(elements, { ...from, opacity: 0, duration: MOTION.medium, ease: MOTION.spring, stagger: each, clearProps: 'all' });
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

// ---------- big moments ----------

// Confetti in the five room colours falls over the page (big moments only:
// a finished phase, or leveling up). Skipped with reduced motion.
const CONFETTI_COLOURS = ['ask', 'plan', 'collect', 'explore', 'conclude'];

export function confetti() {
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

// A right answer: a chime, the feedback box bounces, and Pip hops.
export function cheer(feedback) {
  playSound('correct');
  animate(feedback, 'cheer');
  pipReacts('hop');
}

// A wrong answer: a soft sound, a gentle wobble, and Pip thinks with you.
// Kind on purpose: trying again is part of learning, not a failure.
export function encourage(feedback) {
  playSound('tryAgain');
  animate(feedback, 'wobble');
  pipReacts('think');
}
