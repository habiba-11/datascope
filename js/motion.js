// Shell layer: small happy motions, paired with their sound.
// The motions are CSS animations (base.css, shell.css), so "reduce motion"
// switches them all off in one place (base.css). The sounds still follow the
// sound toggle.
import { playSound } from './sounds.js';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Plays a CSS animation class on an element, even if it is already playing.
export function animate(element, name) {
  if (!element) return;
  element.classList.remove(name);
  void element.offsetWidth; // forces the browser to restart the animation
  element.classList.add(name);
  element.addEventListener('animationend', () => element.classList.remove(name), { once: true });
}

// Pip reacts: 'hop' (happy) or 'think' (a curious head tilt).
export function pipReacts(name) {
  animate(document.querySelector('.pip-mascot'), name);
}

// Confetti in the five room colours falls over the page (big moments only:
// leveling up, or a finished Evidence Card). Skipped with reduced motion.
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
