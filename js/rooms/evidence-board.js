import { mountShell } from '../app.js';

mountShell({
  step: 'conclude',
  accent: 'conclude',
  pipMessage: "Hoo-hoo! Last stop — soon you'll share your claim and evidence here!",
  contentHTML: `
    <h2>🚩 Evidence Board</h2>
    <p>Coming soon — this is where you'll make your final claim and back it up with evidence.</p>
  `,
});
