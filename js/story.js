// Shell layer: the start-page story (Part 44, Round 4). It replaces the old
// film (Part 34). Pip shows Sara, an original young investigator, solving a
// mystery in 7 scenes (Ask, Plan, Collect, Explore x2, Conclude), then it is
// the child's turn. Approved design: docs/design/frames/datascope-story-ui.html.
// Nothing moves on by itself (Habiba: no timer): the child taps Next or Back,
// or the arrow keys. The first "Start the story" tap also lets the browser
// play sound. Words: data/content/story.json; rules: helpers/story.js (tested).
// The HTML is built from our own content; nothing a child typed goes in here.
import { pipSVG } from './pip.js';
import { playSound } from './sounds.js';
import { startMusic, stopMusic } from './music.js';
import { getSoundOn, setSoundOn, getMusicOn, setMusicOn } from './storage/save.js';
import {
  nextPosition, previousPosition, skipPosition, nextLabel, trailStates, stageScale,
} from './helpers/story.js';
import { avatarSVG } from './story-characters.js';
import { sceneHTML } from './story-scenes.js';

const SOUND_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor"/><path d="M16 9 Q19 12 16 15 M18.5 6.5 Q24 12 18.5 17.5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>';
const MUSIC_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18 V6 L20 4 V16" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="3" fill="currentColor"/><circle cx="17.5" cy="16" r="3" fill="currentColor"/></svg>';

// The sky behind every scene: drifting clouds (like the rooms), across the
// whole window. The hills are part of the stage (so Sara always stands on
// them), drawn much wider than it, so they reach both edges of any window.
const SKY = `
  <div class="st-sky" aria-hidden="true">
    <svg class="st-cloud st-cloud--1" viewBox="-4 4 140 56"><ellipse cx="60" cy="30" rx="60" ry="22" fill="#fff"/><ellipse cx="30" cy="38" rx="34" ry="16" fill="#fff"/><ellipse cx="96" cy="40" rx="36" ry="16" fill="#fff"/></svg>
    <svg class="st-cloud st-cloud--2" viewBox="-4 4 140 56"><ellipse cx="60" cy="30" rx="60" ry="22" fill="#fff"/><ellipse cx="30" cy="38" rx="34" ry="16" fill="#fff"/><ellipse cx="96" cy="40" rx="36" ry="16" fill="#fff"/></svg>
  </div>`;
const HILLS = `
  <svg class="st-hills" viewBox="0 0 3360 1600" aria-hidden="true">
    <path d="M0 360 C900 230 1400 300 1680 340 S2600 260 3360 330 L3360 1600 L0 1600 Z" fill="var(--color-hill-back)"/>
    <path d="M0 430 C900 340 1400 370 1700 400 S2600 350 3360 410 L3360 1600 L0 1600 Z" fill="var(--color-hill-front)"/>
  </svg>`;

// Opens the story. `returnTo`: where the focus goes when it closes.
export function openStory(words, returnTo) {
  const { scenes, buttons, speakers, start } = words;
  let position = { scene: 0, line: 0 };
  let shownScene = -1;

  const dialog = document.createElement('dialog');
  dialog.className = 'story';
  dialog.setAttribute('aria-labelledby', 'story-title');
  dialog.innerHTML = `
    ${SKY}
    <div class="story-stage" id="story-stage">
      ${HILLS}
      <header class="story-top">
        <ol class="story-trail" id="story-trail" aria-label="The 5 steps"></ol>
        <div class="story-switches">
          <button type="button" class="story-switch" id="story-sound" aria-label="Sound effects">${SOUND_ICON}</button>
          <button type="button" class="story-switch" id="story-music" aria-label="Background music">${MUSIC_ICON}</button>
        </div>
      </header>
      <div class="story-scene" id="story-scene"></div>
      <section class="story-card">
        <div class="story-who">
          <div class="story-avatar" id="story-avatar"></div>
          <span class="story-name" id="story-name"></span>
        </div>
        <div class="story-words">
          <p class="story-meta"><span class="story-chip" id="story-chip"></span><span class="story-count" id="story-count"></span></p>
          <p class="story-line" id="story-line" aria-live="polite"></p>
        </div>
        <div class="story-controls">
          <div class="story-buttons">
            <button type="button" class="btn story-back" id="story-back">${buttons.back}</button>
            <button type="button" class="btn btn-main story-next" id="story-next"></button>
          </div>
          <div class="story-dots-row">
            <ol class="story-dots" id="story-dots" aria-hidden="true">${scenes.map(() => '<li></li>').join('')}</ol>
            <button type="button" class="story-skip" id="story-skip">${buttons.skip}</button>
          </div>
        </div>
      </section>
      <div class="story-cover" id="story-cover">
        <div class="story-cover-pip m-float">${pipSVG()}</div>
        <h2 class="story-cover-title" id="story-title">${start.title}</h2>
        <p class="story-cover-sub">${start.sub}</p>
        <button type="button" class="btn btn-main story-start m-nudge" id="story-start">${start.button}</button>
        <p class="story-cover-note">${start.soundNote}</p>
      </div>
    </div>`;
  document.body.append(dialog);
  const get = (id) => dialog.querySelector(`#${id}`);

  // The 960 x 600 stage is scaled to fit the window (never bigger than real size).
  function fit() {
    get('story-stage').style.setProperty('--scale', stageScale(innerWidth - 16, innerHeight - 16));
  }
  fit();
  window.addEventListener('resize', fit);

  // The two switches: pressed (navy) = on.
  function showSwitches() {
    get('story-sound').setAttribute('aria-pressed', String(getSoundOn()));
    get('story-music').setAttribute('aria-pressed', String(getMusicOn()));
  }
  get('story-sound').addEventListener('click', () => {
    setSoundOn(!getSoundOn());
    showSwitches();
    playSound('tap'); // a sample, so the child hears it is on
  });
  get('story-music').addEventListener('click', () => {
    setMusicOn(!getMusicOn());
    if (getMusicOn()) startMusic(); else stopMusic();
    showSwitches();
  });
  showSwitches();

  function render() {
    const scene = scenes[position.scene];
    const line = scene.lines[position.line];

    get('story-trail').innerHTML = trailStates(scene.step).map((s, i) => `
      <li class="story-step story-step--${s.state}" style="--c: var(--color-${s.colour})">
        <span class="story-step-dot">${s.state === 'done' ? '✓' : i + 1}</span>
        <span class="story-step-name">${s.name}</span>
      </li>`).join('');

    // A new scene: build its picture; then show its parts up to this line.
    if (shownScene !== position.scene) {
      shownScene = position.scene;
      get('story-scene').innerHTML = sceneHTML(scene.id);
    }
    get('story-scene').querySelectorAll('[data-line]').forEach((part) => {
      part.hidden = Number(part.dataset.line) > position.line;
    });

    get('story-avatar').innerHTML = avatarSVG(line.who);
    get('story-avatar').dataset.who = line.who;
    get('story-name').textContent = speakers[line.who];
    get('story-chip').textContent = scene.chip;
    get('story-chip').dataset.step = scene.step;
    get('story-count').textContent = `Scene ${position.scene + 1} of ${scenes.length}`;
    const text = get('story-line');
    text.textContent = line.text;
    text.classList.remove('story-line--in');
    void text.offsetWidth; // restarts the line's pop-in
    text.classList.add('story-line--in');

    get('story-next').textContent = nextLabel(scenes, position, buttons);
    get('story-back').disabled = position.scene === 0 && position.line === 0;
    get('story-dots').querySelectorAll('li').forEach((dot, i) => {
      dot.className = i < position.scene ? 'done' : (i === position.scene ? 'now' : '');
    });
  }

  // The sounds of a line: a whoosh when a new scene opens, and a little
  // sound for who speaks (Pip's rising hoot, Sara's chirp).
  function soundsFor(line, newScene) {
    if (newScene) playSound('whoosh');
    if (line.who === 'pip') playSound('hoot');
    else if (line.who === 'sara') playSound('sara');
  }

  function goTo(next) {
    const newScene = next.scene !== position.scene;
    position = next;
    render();
    soundsFor(scenes[position.scene].lines[position.line], newScene);
  }

  function close() {
    stopMusic();
    window.removeEventListener('resize', fit);
    dialog.close();
    dialog.remove();
    if (returnTo) returnTo.focus();
  }

  get('story-start').addEventListener('click', () => {
    get('story-cover').hidden = true;
    startMusic(); // the tap lets the browser play sound (only if music is on)
    render();
    soundsFor(scenes[0].lines[0], true);
    get('story-next').focus();
  });
  get('story-next').addEventListener('click', () => {
    const next = nextPosition(scenes, position);
    if (next) goTo(next);
    else close(); // "Start mission": back to the start page, to type the code
  });
  get('story-back').addEventListener('click', () => goTo(previousPosition(scenes, position)));
  get('story-skip').addEventListener('click', () => goTo(skipPosition(scenes)));
  // Arrow keys move too (when the story has started); Esc closes it.
  dialog.addEventListener('keydown', (event) => {
    if (!get('story-cover').hidden) return;
    if (event.key === 'ArrowRight') get('story-next').click();
    if (event.key === 'ArrowLeft' && !get('story-back').disabled) get('story-back').click();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  dialog.showModal();
  get('story-start').focus();
}
