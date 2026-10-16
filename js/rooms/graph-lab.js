import { mountShell } from '../app.js';

mountShell({
  step: 'explore',
  accent: 'explore',
  pipMessage: "Hoo-hoo! Soon we'll turn our data into colourful graphs right here!",
  contentHTML: `
    <h2>📊 Graph Lab</h2>
    <p>Coming soon — this is where you'll build graphs and explore the numbers.</p>
  `,
});
