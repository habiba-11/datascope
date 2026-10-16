import { mountShell } from '../app.js';

mountShell({
  step: 'ask',
  accent: 'ask',
  pipMessage: "Hoo-hoo! I'm Pip. Here we'll pick a question to investigate!",
  contentHTML: `
    <h2>❓ Question Studio</h2>
    <p>Coming soon — this is where you'll pick a scenario and choose a great survey question.</p>
  `,
});
