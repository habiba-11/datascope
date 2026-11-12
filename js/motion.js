// Shell layer: small happy motions, paired with their sound.
// Simple ones are CSS animations (base.css, shell.css), so "reduce motion"
// switches them all off in one place (base.css). Bigger ones (Part 21) use
// GSAP (js/vendor/gsap.min.js, loaded by each room page): they also do nothing
// with reduced motion, and if GSAP is missing the page still works, just still.
// The sounds still follow the sound toggle.
import {
  playSound, playFirework, loadRecording, playRecording,
} from './sounds.js';
import { RISE_SECONDS } from './helpers/fireworks.js';
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

// A step (or Explore tab) opens: it springs in while a lock shakes, becomes a key,
// turns, becomes an open lock and floats away (Part 21b). Without motion it just appears.
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

// Cards flip in, one after another (e.g. earned badges on the shelf).
export function flipIn(elements) {
  const gsap = gsapOrNull();
  if (!gsap || !elements.length) return;
  gsap.from(elements, { rotationY: 180, opacity: 0, duration: MOTION.slow, ease: MOTION.spring, stagger: 0.12, clearProps: 'all' });
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
// `sound`: false when the recording already has its bang (Part 61b).
function rocket(delay, far, sound = true) {
  const zone = BURST_ZONES[burstCount % BURST_ZONES.length];
  const between = ([from, to]) => from + Math.random() * (to - from);
  const seed = burstCount;
  burstCount += 1;
  if (sound) playFirework(delay, far);
  if (!reduceMotion()) launchFirework((between(zone.x) / 100) * innerWidth, (between(zone.y) / 100) * innerHeight, seed, delay);
}

export function fireworks({ bursts = 3 } = {}) {
  if (reduceMotion()) {
    playFirework(0);
    return;
  }
  for (let b = 0; b < bursts; b++) rocket(b * BURST_GAP, false);
}

// The finale on My journey. Part 61b (Habiba, 11 Nov 2026): her fireworks
// recording, repeated for as long as the page is open (she chose "repeat").
// Each rocket launches RISE_SECONDS before its bang, so it bursts exactly on
// it (bang times: assets/sounds/fireworks-bangs.json, from dev/firework-bangs.mjs).
// The sound starts a moment after the show (lead), so even the first bang
// has its rocket, and the first rocket rises at once. It rests while the tab is hidden. Reduced motion: the recording
// once, no rockets. Without the file: the made-up far-off loop as before.
export const LOOP_GAP_MS = 2200; // the old loop (only without the recording)
const SHOW = new URL('../assets/sounds/fireworks-bangs.json', import.meta.url);

export async function fireworksLoop() {
  let show = null;
  try {
    show = await (await fetch(SHOW)).json();
    // show.file is from the site's root; this file is in js/, one folder down.
    if (!(await loadRecording(new URL(`../${show.file}`, import.meta.url)))) show = null;
  } catch {
    show = null;
  }
  if (!show) return madeUpLoop();
  if (reduceMotion()) {
    playRecording(0);
    return () => {};
  }
  // The sound starts just late enough for the first rocket to launch at once
  // (11 Nov 2026, Habiba: fireworks immediately): 0.6 - 0.44 = 0.16 s.
  const lead = Math.max(0, RISE_SECONDS - show.bangs[0]);
  const playShow = () => {
    if (document.hidden) return;
    playRecording(lead);
    // Each rocket launches RISE_SECONDS before its bang, so it bursts on it.
    for (const bang of show.bangs) rocket(lead + bang - RISE_SECONDS, true, false);
  };
  playShow();
  const timer = setInterval(playShow, show.duration * 1000);
  return () => clearInterval(timer);
}

// Before Part 61b: one made-up firework about every 2.2 s, far off and quiet.
function madeUpLoop() {
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
