// Shell layer: the start-page story (Part 44, Round 4). It replaces the old
// film (Part 34). Pip shows Sara, an original young investigator, solving a
// mystery in 7 scenes (Ask, Plan, Collect, Explore x2, Conclude), then it is
// the child's turn. Approved design: the first story design (frames/datascope-story-ui.html, removed 12 Nov 2026; in Git history).
// Nothing moves on by itself (Habiba: no timer): the child taps Next or Back,
// or the arrow keys. The first "Start the story" tap also lets the browser
// play sound. Words: data/content/story.json; rules: helpers/story.js (tested).
// Part 44c: each line is read aloud (its own switch, on by default; js/voice.js),
// the speaker's mouth moves only while the voice speaks, the music goes quieter
// meanwhile, "Hear this again" repeats a line, and each line has the design's
// scene sound effects (js/story-sounds.js). With read-aloud off, Pip hoots and
// Sara chirps instead.
// The HTML is built from our own content; nothing a child typed goes in here.
import { pipSVG } from './pip.js';
import { playSound } from './sounds.js';
import { startMusic, stopMusic, duckMusic } from './music.js';
import {
  getSoundOn, setSoundOn, getMusicOn, setMusicOn, getVoiceOn, setVoiceOn,
} from './storage/save.js';
import {
  nextPosition, previousPosition, skipPosition, nextLabel, trailStates, stageScale, STORY_EFFECTS,
} from './helpers/story.js';
import { speak, stopSpeaking } from './voice.js';
import {
  playStoryEffects, playStoryStart, playStoryEnd, EFFECT_SECONDS,
} from './story-sounds.js';
import { avatarSVG } from './story-characters.js';
import { sceneHTML, placeHTML } from './story-scenes.js';
import { mountSceneDefs } from './scenes/defs.js';

const SOUND_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor"/><path d="M16 9 Q19 12 16 15 M18.5 6.5 Q24 12 18.5 17.5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>';
// The design's bold tick for a step that is done (a drawing, not a thin ✓).
const TICK = '<svg width="20" height="20" viewBox="0 0 20 20" aria-label="done"><path d="M4 10 L8.5 14.5 L16 6" stroke="#17324D" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// The design's read-aloud icon (a speech bubble with lines) and its "hear again" speaker.
const VOICE_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5 H20 V16 H12 L7 20 V16 H4 Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M8 9.5 H16 M8 12.5 H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const AGAIN_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor"/><path d="M16 8 Q19 12 16 16 M18.5 5.5 Q23 12 18.5 18.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const MUSIC_ICON ='<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18 V6 L20 4 V16" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="3" fill="currentColor"/><circle cx="17.5" cy="16" r="3" fill="currentColor"/></svg>';

// Opens the story. `returnTo`: where the focus goes when it closes.
export function openStory(words, returnTo) {
  const { scenes, buttons, speakers, start } = words;
  let position = { scene: 0, line: 0 };
  let shownScene = -1;

  const dialog = document.createElement('dialog');
  dialog.className = 'story';
  dialog.setAttribute('aria-labelledby', 'story-title');
  dialog.innerHTML = `
    <div class="story-stage" id="story-stage">
      <div class="st-place" id="story-place" aria-hidden="true"></div>
      <header class="story-top">
        <ol class="story-trail" id="story-trail" aria-label="The 5 steps"></ol>
        <div class="story-switches">
          <button type="button" class="story-switch" id="story-sound" aria-label="Sound effects">${SOUND_ICON}</button>
          <button type="button" class="story-switch" id="story-music" aria-label="Background music">${MUSIC_ICON}</button>
          <button type="button" class="story-switch" id="story-voice" aria-label="Read aloud">${VOICE_ICON}</button>
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
          <div class="story-line-row">
            <p class="story-line" id="story-line" aria-live="polite"></p>
            <button type="button" class="story-again" id="story-again" aria-label="${buttons.again}">${AGAIN_ICON}</button>
          </div>
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
        <!-- 11 Nov 2026 (Habiba: "hard to read"): the words sit on a white panel, not on the picture. -->
        <div class="story-cover-panel">
          <h2 class="story-cover-title" id="story-title">${start.title}</h2>
          <p class="story-cover-sub">${start.sub}</p>
          <button type="button" class="btn btn-main story-start m-nudge" id="story-start">${start.button}</button>
          <p class="story-cover-note">${start.soundNote}</p>
        </div>
      </div>
    </div>`;
  document.body.append(dialog);
  mountSceneDefs(); // the shared gradients of the places and the cast (Part 59s)
  const get = (id) => dialog.querySelector(`#${id}`);
  get('story-place').innerHTML = placeHTML(scenes[0].id); // the cover shows the school yard too

  // The 960 x 600 stage is scaled to fill the window, as big as fits (like the design).
  function fit() {
    get('story-stage').style.setProperty('--scale', stageScale(innerWidth, innerHeight));
  }
  fit();
  window.addEventListener('resize', fit);

  // The two switches: pressed (navy) = on.
  function showSwitches() {
    get('story-sound').setAttribute('aria-pressed', String(getSoundOn()));
    get('story-music').setAttribute('aria-pressed', String(getMusicOn()));
    get('story-voice').setAttribute('aria-pressed', String(getVoiceOn()));
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
  get('story-voice').addEventListener('click', () => {
    setVoiceOn(!getVoiceOn());
    showSwitches();
    if (getVoiceOn()) sayLine(); else quiet();
  });
  showSwitches();

  // Read-aloud: while a line is said, the speaker's mouth moves (css/story.css)
  // and the music goes quieter, by about 70 percent.
  const currentLine = () => scenes[position.scene].lines[position.line];
  function quiet() {
    stopSpeaking();
    dialog.classList.remove('st-talking-pip', 'st-talking-sara', 'st-talking-kids');
    duckMusic(false);
  }
  // The sounds and yawn timers of the line on screen. When the child moves on
  // (or closes the story) before they are over, they stop, so nothing from an
  // old line plays over the new one (scan, 7 Nov 2026).
  let lineSounds = [];
  let lineTimers = [];
  function stopLine() {
    lineSounds.forEach((sound) => sound.stop());
    lineTimers.forEach(clearTimeout);
    lineSounds = [];
    lineTimers = [];
    dialog.classList.remove('st-yawning');
  }
  // A line's "after" (e.g. a yawn): played once the words are done. The
  // sleepy classmate opens their mouth wide while it plays (css/story.css).
  function playAfter(line, at = 0) {
    if (!line.after) return;
    lineSounds.push(playStoryEffects([[line.after, at]]));
    lineTimers.push(
      setTimeout(() => dialog.classList.add('st-yawning'), at * 1000),
      setTimeout(() => dialog.classList.remove('st-yawning'), (at + (EFFECT_SECONDS[line.after] || 1)) * 1000),
    );
  }

  function sayLine() {
    const line = currentLine();
    speak(line.who, line.say || line.text, {
      onStart: () => {
        dialog.classList.add(`st-talking-${line.who}`);
        duckMusic(true);
      },
      onEnd: () => {
        dialog.classList.remove(`st-talking-${line.who}`);
        duckMusic(false);
        playAfter(line);
      },
    });
  }
  // "Hear this again" works even with read-aloud off: the child asked for it.
  get('story-again').addEventListener('click', () => {
    quiet();
    sayLine();
  });

  function render() {
    const scene = scenes[position.scene];
    const line = scene.lines[position.line];
    dialog.dataset.line = position.line; // which classmates talk (css/story.css data-says)

    get('story-trail').innerHTML = trailStates(scene.step).map((s, i) => `
      <li class="story-step story-step--${s.state}" style="--c: var(--color-${s.colour})">
        <span class="story-step-dot">${s.state === 'done' ? TICK : i + 1}</span>
        <span class="story-step-name">${s.name}</span>
      </li>`).join('');

    // A new scene: build its picture; then show its parts up to this line.
    if (shownScene !== position.scene) {
      shownScene = position.scene;
      get('story-place').innerHTML = placeHTML(scene.id); // Part 59s: the school yard or the classroom
      get('story-scene').innerHTML = sceneHTML(scene.id);
    }
    // A part shows from its data-line on, or only before its data-before.
    get('story-scene').querySelectorAll('.st-part').forEach((part) => {
      const from = Number(part.dataset.line || 0);
      const until = part.dataset.before === undefined ? Infinity : Number(part.dataset.before);
      part.hidden = position.line < from || position.line >= until;
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

  // The sounds of a line: a whoosh when a new scene opens, the scene's sound
  // effects, and the line read aloud (or, with read-aloud off, a little sound
  // for who speaks: Pip's rising hoot, Sara's chirp).
  function soundsFor(line, newScene) {
    quiet();
    stopLine();
    if (newScene) playSound('whoosh');
    lineSounds.push(playStoryEffects(STORY_EFFECTS[`${scenes[position.scene].id}:${position.line}`]));
    if (getVoiceOn()) sayLine();
    else {
      if (line.who === 'pip') playSound('hoot');
      else if (line.who === 'sara') playSound('sara');
      playAfter(line, 0.6); // no voice: the yawn comes a moment after the words appear
    }
  }

  function goTo(next) {
    const newScene = next.scene !== position.scene;
    position = next;
    render();
    soundsFor(scenes[position.scene].lines[position.line], newScene);
  }

  function close() {
    quiet();
    stopLine();
    stopMusic();
    window.removeEventListener('resize', fit);
    dialog.close();
    dialog.remove();
    if (returnTo) returnTo.focus();
  }

  get('story-start').addEventListener('click', () => {
    get('story-cover').hidden = true;
    startMusic(); // the tap lets the browser play sound (only if music is on)
    playStoryStart();
    render();
    soundsFor(scenes[0].lines[0], true);
    get('story-next').focus();
  });
  get('story-next').addEventListener('click', () => {
    const next = nextPosition(scenes, position);
    if (next) goTo(next);
    else {
      playStoryEnd(); // "Start mission": a fanfare, then back to the start page to type the code
      close();
    }
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
