import { mountShell } from '../app.js';

mountShell({
  step: 'explore',
  accent: 'explore',
  explorePage: 'chance',
  pipMessage: "Hoo-hoo! Soon we'll flip coins and spin spinners right here!",
  contentHTML: `
    <h2>🎲 Chance Lab</h2>
    <p>Coming soon — this is where you'll predict, then test, what chance games really do.</p>
  `,
});
