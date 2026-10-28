// Shell layer: the ONE task card in the middle of every room screen (UI guide,
// zone 2): a header strip in the room colour, then Pip's one line, the big
// question and the task. Styles: css/task-card.css.
// These build HTML from our own content; anything a child typed goes in
// later with textContent, never through here.
import { pipSVG } from './pip.js';
import { stepStates } from './helpers/stepper.js';

// title:     the strip's words, e.g. "Collect · Data Hub"
// pill:      optional small label on the right of the strip (e.g. the pretend-class label)
// tabsHTML:  optional tabs in the strip instead of the title (the Explore rooms)
// bodyHTML:  the task itself
export function taskCardHTML({ title, pill = '', tabsHTML = '', bodyHTML }) {
  const strip = tabsHTML
    ? `<div class="task-card-tabs">${tabsHTML}</div>`
    : `<p class="task-card-title">${title}</p>${pill ? `<span class="task-card-pill">${pill}</span>` : ''}`;
  return `
    <section class="task-card m-rise">
      <header class="task-card-strip">${strip}</header>
      <div class="task-card-body">${bodyHTML}</div>
    </section>`;
}

// Pip, small, with ONE sentence. `data-pip-text` lets other code change what Pip says.
// The question is the page's h1 (what the child must answer).
export function pipLineHTML(text, question = '') {
  return `
    <div class="pip-line">
      <span class="pip-mascot pip-mascot--line">${pipSVG()}</span>
      <div class="pip-line-words">
        ${question ? `<h1 class="task-question">${question}</h1>` : ''}
        <p class="pip-line-text" data-pip-text aria-live="polite">${text}</p>
      </div>
    </div>`;
}

// The small chips for a task with steps: "✓ Class A · 2 Class B · 3 Compare".
export function miniStepperHTML(labels, current) {
  const chips = stepStates(labels, current).map((s) => `
    <li class="stepper-chip stepper-chip--${s.state}"${s.state === 'now' ? ' aria-current="step"' : ''}>
      <span class="stepper-mark" aria-hidden="true">${s.state === 'done' ? '✓' : s.number}</span>
      ${s.label}<span class="sr-only"> (${s.word})</span>
    </li>`).join('');
  return `<ol class="mini-stepper" aria-label="Steps">${chips}</ol>`;
}
