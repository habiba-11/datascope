// Shell layer: Pip, our original mascot (Part 21b): a round owl explorer with a
// yellow explorer hat and a magnifying glass. Drawn as SVG, so it is sharp at
// any size and its parts can move. Moods: 'happy' (default), 'think', 'cheer'.
// The mood styles and the blink are in base.css; reduced motion stops the movement.

// `label`: '' when Pip is decoration next to text (hidden from screen readers).
export function pipSVG(label = '') {
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
  return `
<svg class="pip pip--happy" viewBox="0 0 120 132" ${a11y}>
  <g class="pip-all">
    <path class="pip-tuft" d="M24 40 L22 14 L42 30 Z"/>
    <path class="pip-tuft" d="M96 40 L98 14 L78 30 Z"/>
    <g class="pip-wing pip-wing-left"><ellipse cx="20" cy="84" rx="10" ry="22"/></g>
    <ellipse class="pip-body" cx="60" cy="78" rx="42" ry="46"/>
    <ellipse class="pip-belly" cx="60" cy="94" rx="27" ry="26"/>
    <path class="pip-feather" d="M47 88 q6.5 7 13 0 q6.5 7 13 0"/>
    <path class="pip-feather" d="M47 100 q6.5 7 13 0 q6.5 7 13 0"/>
    <circle class="pip-eye" cx="43" cy="58" r="15"/>
    <circle class="pip-eye" cx="77" cy="58" r="15"/>
    <g class="pip-pupils">
      <circle class="pip-pupil" cx="43" cy="59" r="7"/>
      <circle class="pip-pupil" cx="77" cy="59" r="7"/>
      <circle class="pip-shine" cx="46" cy="56" r="2.5"/>
      <circle class="pip-shine" cx="80" cy="56" r="2.5"/>
    </g>
    <g class="pip-lids">
      <ellipse cx="43" cy="58" rx="16" ry="16"/>
      <ellipse cx="77" cy="58" rx="16" ry="16"/>
    </g>
    <circle class="pip-blush" cx="28" cy="74" r="5"/>
    <circle class="pip-blush" cx="92" cy="74" r="5"/>
    <path class="pip-beak" d="M53 70 L67 70 L60 81 Z"/>
    <path class="pip-hat-top" d="M36 30 Q38 6 60 6 Q82 6 84 30 Z"/>
    <path class="pip-hat-band" d="M37 24 L83 24 L84 30 L36 30 Z"/>
    <path class="pip-hat-brim" d="M18 32 Q60 20 102 32 Q60 42 18 32 Z"/>
    <path class="pip-foot" d="M44 122 l-6 7 h14 Z M76 122 l-6 7 h14 Z"/>
    <g class="pip-wing pip-wing-right"><ellipse cx="100" cy="84" rx="10" ry="22"/></g>
    <g class="pip-glass">
      <line x1="104" y1="96" x2="96" y2="108"/>
      <circle cx="109" cy="88" r="9"/>
    </g>
    <text class="pip-question" x="100" y="22">?</text>
    <g class="pip-sparkles">
      <path d="M10 18 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z"/>
      <path d="M108 8 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z"/>
    </g>
  </g>
</svg>`;
}

// Changes Pip's mood everywhere on the page ('happy', 'think' or 'cheer').
export function setPipMood(mood) {
  document.querySelectorAll('svg.pip').forEach((svg) => {
    svg.classList.remove('pip--happy', 'pip--think', 'pip--cheer');
    svg.classList.add(`pip--${mood}`);
  });
}

// A mood for a moment, then back to happy.
let moodTimer = null;
export function pipMoodFor(mood, ms = 1400) {
  setPipMood(mood);
  clearTimeout(moodTimer);
  moodTimer = setTimeout(() => setPipMood('happy'), ms);
}
