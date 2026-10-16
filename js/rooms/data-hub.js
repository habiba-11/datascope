import { mountShell } from '../app.js';

mountShell({
  step: 'collect',
  accent: 'collect',
  pipMessage: "Hoo-hoo! Our pretend class is almost ready. Soon you'll run the survey here!",
  contentHTML: `
    <h2>📋 Data Hub</h2>
    <p>Coming soon — this is where you'll run a survey on our pretend class and watch the answers arrive.</p>
  `,
});
