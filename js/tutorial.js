// Shell layer: the start-page tutorial (Part 34, Prof's comment 1; design:
// docs/design/frames/f0-tutorial.html). A short animated film with Pip: what
// DataScope is for, the 5 steps, the 6 rooms, and how to use it. About 50 seconds.
// It plays by itself; Pause, Back, Next, the dots, the arrow keys, Skip and Esc
// give the child control. Every word is also in the caption, and there is no
// sound. Reduced motion: no autoplay, no movement, each scene in its final state.
// Words: data/content/tutorial.json. This HTML is built from our own content;
// nothing a child typed ever goes through here.
import { pipSVG } from './pip.js';
import { LOGO_SVG } from './icons.js';
import {
  sceneButtons, autoplayStep, stageScale, tutorialExample, STAGE_WIDTH, STAGE_HEIGHT,
} from './helpers/tutorial-steps.js';

// Pip in a mood ('happy', 'think', 'cheer'), optionally waving.
function pip(mood = 'happy', wave = false) {
  return pipSVG().replace('pip--happy', `pip--${mood}${wave ? ' pip--wave' : ''}`);
}

const SCENERY = `
  <svg class="tut-hills" viewBox="0 0 960 170" preserveAspectRatio="none" aria-hidden="true">
    <ellipse class="hill-back" cx="150" cy="190" rx="380" ry="110"></ellipse>
    <ellipse class="hill-front" cx="760" cy="200" rx="460" ry="120"></ellipse>
  </svg>
  <svg class="tut-cloud" width="120" height="50" viewBox="0 0 120 50" aria-hidden="true">
    <g fill="#fff"><circle cx="30" cy="32" r="18"/><circle cx="55" cy="24" r="22"/><circle cx="82" cy="32" r="17"/><rect x="20" y="32" width="75" height="16" rx="8"/></g>
  </svg>`;
const LOGO = `<div class="tut-logo">${LOGO_SVG}<span>Data<span class="logo-accent">Scope</span></span></div>`;

// The title letters pop in one by one (screen readers read the whole title).
const letters = (text) => [...text]
  .map((c, i) => (c === ' ' ? ' ' : `<span class="tut-letter" aria-hidden="true" style="--i:${i}">${c}</span>`))
  .join('');

// Where each step of the trail sits on the 820px-wide trail.
const stepX = (i) => 46 + i * ((820 - 92) / 4);

// Each scene's picture, in its FINAL state. Scenes 3 and 5 then play a little
// timeline from their start (runTrail, runHints), unless motion is reduced.
const SCENE_HTML = {
  hello: (s) => `<div class="tut-scene tut-s1">${LOGO}
    <div class="tut-pipbox m-float">${pip('happy', true)}</div>
    <div class="tut-words">
      <h3 class="tut-title" aria-label="${s.heading}">${letters(s.heading)}</h3>
      <div class="tut-bubble m-rise" style="--i:12">${s.bubble}</div>
    </div></div>`,

  mission: (s) => `<div class="tut-scene tut-s2">${LOGO}
    <h3 class="tut-title m-rise">${s.heading}</h3>
    <ul class="tut-skills">${s.skills.map((skill, i) => `
      <li class="tut-card tut-skill m-pop" style="--i:${5 + i * 4};background:var(--color-${skill.colour}-light)">
        <span class="tut-em" aria-hidden="true">${skill.icon}</span><b>${skill.name}</b><span>${skill.text}</span>
      </li>`).join('')}</ul>
    <div class="tut-pipbox m-rise" style="--i:24">${pip('think')}</div></div>`,

  journey: (s) => `<div class="tut-scene tut-s3">${LOGO}
    <h3 class="tut-title m-rise">${s.heading}</h3>
    <div class="tut-trail">
      <div class="tut-rail"><i style="width:${2 * ((820 - 92) / 4)}px"></i></div>
      ${s.steps.map((step, i) => `
        <div class="tut-step ${i > 2 ? 'locked' : 'done'}" style="left:${stepX(i)}px;--c:var(--color-${step.colour})">
          <div class="tut-dot" aria-hidden="true">${step.icon}</div>
          <span class="tut-tick" aria-hidden="true">✓</span>
          ${i > 2 ? '<span class="tut-lock" aria-hidden="true">🔒</span>' : ''}
          <b>${step.name}</b>
        </div>`).join('')}
      <div class="tut-token" style="left:${stepX(2)}px">${pip('happy')}</div>
    </div>
    <div class="tut-note m-rise" style="--i:9">${s.note}</div></div>`,

  rooms: (s) => `<div class="tut-scene tut-s4">${LOGO}
    <h3 class="tut-title m-rise">${s.heading}</h3>
    <ol class="tut-rooms">${s.rooms.map((room, i) => `
      <li class="tut-card tut-room m-pop" style="--i:${4 + i * 4};border-top-color:var(--color-${room.colour});background:var(--color-${room.colour}-light)">
        <i class="tut-n" aria-hidden="true">${i + 1}</i>
        <span class="tut-em" aria-hidden="true">${room.icon}</span><b>${room.name}</b><span>${room.text}</span>
      </li>`).join('')}</ol></div>`,

  howto: (s, example) => `<div class="tut-scene tut-s5">${LOGO}
    <h3 class="tut-title m-rise">${s.heading}</h3>
    <div class="tut-card tut-task">
      <div class="tut-about" data-about>${s.aboutTab}</div>
      <div class="tut-room-name">${s.roomName}</div>
      <div class="tut-pipline"><div class="tut-mini">${pip('think')}</div><p>${example.question}</p></div>
      <div class="tut-answer"><span class="tut-ph" data-ph hidden>${s.placeholder}</span><span data-text>${example.answers[0]}${s.edit}</span><span class="tut-caret"></span></div>
      <div class="tut-chips">
        ${example.answers.map((answer, i) => `<div class="tut-chip${i === 0 ? ' picked' : ''}" data-chip>${i === 0 ? '✓ ' : ''}${answer}</div>`).join('')}
      </div>
      <div class="tut-actions">
        <div class="tut-fake-btn" data-hint>${s.hintAfter}</div>
        <div class="tut-fake-btn main" data-next>${s.nextAfter}</div>
      </div>
    </div>
    <ol class="tut-calls">${s.calls.map((call, i) => `<li><i aria-hidden="true">${i + 1}</i><span>${call}</span></li>`).join('')}</ol>
    <div class="tut-finger" data-finger aria-hidden="true"></div></div>`,

  ready: (s) => `<div class="tut-scene tut-s6">${LOGO}
    <div class="tut-pipbox m-float">${pip('cheer')}</div>
    <div class="tut-right">
      <h3 class="tut-title m-rise">${s.heading}</h3>
      <div class="tut-card tut-codecard m-rise" style="--i:5">
        <div class="tut-code-label">${s.codeLabel}</div>
        <div class="tut-code-box">${s.codeExample}</div>
        <button class="btn btn-main" type="button" data-start>${s.start}</button>
      </div>
      <div class="tut-stars m-rise" style="--i:10">${s.stars}</div>
    </div></div>`,
};

// Opens the tutorial. `returnTo`: where the focus goes after Skip or Esc.
// `codeBox`: where the child goes next after "Start exploring".
export async function openTutorial({ scenes }, returnTo, codeBox) {
  const [recipe, content] = await Promise.all([
    fetch('data/scenarios/sleep-hours.json').then((r) => r.json()),
    fetch('data/content/sleep-hours.json').then((r) => r.json()),
  ]);
  const example = tutorialExample(recipe, content);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const dialog = document.createElement('dialog');
  dialog.className = 'modal tutorial';
  dialog.setAttribute('aria-label', 'How DataScope works');
  dialog.innerHTML = `
    <div class="tut-fit" id="tut-fit">
      <div class="tut-stage" id="tut-stage"></div>
      <button class="btn modal-close tut-close" id="tut-close" type="button" aria-label="Close" hidden>✕</button>
    </div>
    <div class="tut-bar" aria-hidden="true"><i id="tut-bar-fill"></i></div>
    <p class="tut-caption" id="tut-caption" aria-live="polite"></p>
    <div class="tut-controls" id="tut-controls">
      <button class="btn btn-quiet" id="tut-back" type="button">← Back</button>
      <button class="btn btn-secondary" id="tut-pause" type="button"></button>
      <button class="btn btn-main" id="tut-next" type="button"></button>
      <div class="tut-dots" id="tut-dots"></div>
      <button class="btn btn-quiet" id="tut-skip" type="button">Skip</button>
    </div>`;
  document.body.append(dialog);
  document.body.classList.add('modal-open');

  const get = (id) => dialog.querySelector(`#${id}`);
  const stage = get('tut-stage');
  const fit = get('tut-fit');
  let current = 0;
  let playing = !reduced;
  let elapsed = 0;
  let lastFrame = 0;
  let frame = null;
  let timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const stopTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  // Scales the 960 x 540 scene to the room left beside the controls.
  function resize() {
    // The dialog's margin, padding and the scene's border take about 56px of the width.
    const room = { width: Math.min(window.innerWidth - 56, STAGE_WIDTH), height: window.innerHeight - 64 - get('tut-controls').offsetHeight - 120 };
    const scale = stageScale(room.width, room.height);
    stage.style.transform = `scale(${scale})`;
    fit.style.width = `${STAGE_WIDTH * scale}px`;
    fit.style.height = `${STAGE_HEIGHT * scale}px`;
  }

  // Scene 3: Pip hops along the trail; each step gets its colour and a tick, and
  // the locks on steps 4 and 5 open when Pip arrives.
  function runTrail(root) {
    const steps = [...root.querySelectorAll('.tut-step')];
    const token = root.querySelector('.tut-token');
    const fill = root.querySelector('.tut-rail i');
    steps.forEach((step) => step.classList.remove('done'));
    token.style.left = `${stepX(0)}px`;
    fill.style.width = '0';
    steps.forEach((step, i) => at(900 + i * 1300, () => {
      token.style.left = `${stepX(i)}px`;
      fill.style.width = `${i * ((820 - 92) / 4)}px`;
      step.classList.add('on');
      step.classList.remove('locked');
      if (i > 0) {
        steps[i - 1].classList.remove('on');
        steps[i - 1].classList.add('done');
      }
      if (i === steps.length - 1) at(700, () => step.classList.add('done'));
    }));
  }

  // Scene 5: a tap circle shows the real way to use a hint: tap 💡, three answers
  // arrive, one fills the box, the words are changed, Next wakes up, 📖 pulses.
  function runHints(root, scene) {
    const text = root.querySelector('[data-text]');
    const placeholder = root.querySelector('[data-ph]');
    const chips = [...root.querySelectorAll('[data-chip]')];
    const hint = root.querySelector('[data-hint]');
    const next = root.querySelector('[data-next]');
    const finger = root.querySelector('[data-finger]');
    const about = root.querySelector('[data-about]');
    const scale = () => stage.getBoundingClientRect().width / STAGE_WIDTH || 1;
    const moveTo = (el) => {
      const a = el.getBoundingClientRect();
      const b = stage.getBoundingClientRect();
      finger.style.left = `${(a.left - b.left) / scale() + a.width / (2 * scale()) - 15}px`;
      finger.style.top = `${(a.top - b.top) / scale() + a.height / (2 * scale()) - 15}px`;
    };
    const tap = () => {
      finger.classList.add('tap');
      setTimeout(() => finger.classList.remove('tap'), 180);
    };

    // The start: an empty box, no answers yet, and Next says why it is waiting.
    text.textContent = '';
    placeholder.hidden = false;
    chips.forEach((chip, i) => {
      chip.classList.remove('picked');
      chip.classList.add('waiting');
      chip.textContent = example.answers[i];
    });
    hint.textContent = scene.hintBefore;
    next.textContent = scene.nextBefore;
    next.classList.remove('main');
    next.classList.add('off');

    at(900, () => {
      finger.classList.add('shown');
      moveTo(hint);
    });
    at(1800, () => {
      tap();
      hint.textContent = scene.hintAfter;
      chips.forEach((chip, i) => setTimeout(() => chip.classList.remove('waiting'), i * 280));
    });
    at(3600, () => moveTo(chips[0]));
    at(4500, () => {
      tap();
      chips[0].classList.add('picked');
      chips[0].textContent = `✓ ${example.answers[0]}`;
      placeholder.hidden = true;
      text.textContent = example.answers[0];
    });
    at(5600, () => finger.classList.remove('shown'));
    [...scene.edit].forEach((ch, i) => at(6000 + i * 55, () => { text.textContent += ch; }));
    at(6000 + scene.edit.length * 55 + 300, () => {
      next.textContent = scene.nextAfter;
      next.classList.remove('off');
      next.classList.add('main', 'tut-bounce');
    });
    at(11000, () => about.classList.add('tut-bounce'));
  }

  function show(i) {
    stopTimers();
    current = i;
    elapsed = 0;
    const scene = scenes[i];
    stage.innerHTML = SCENERY + SCENE_HTML[scene.id](scene, example);
    get('tut-caption').textContent = scene.caption;
    get('tut-bar-fill').style.width = '0';

    const { backDisabled, showSkip, showClose, nextLabel } = sceneButtons(i, scenes.length);
    get('tut-back').disabled = backDisabled;
    get('tut-skip').hidden = !showSkip;
    get('tut-close').hidden = !showClose;
    get('tut-next').textContent = nextLabel;
    get('tut-dots').querySelectorAll('button').forEach((dot, k) => {
      dot.classList.toggle('on', k === i);
      if (k === i) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });

    const root = stage.querySelector('.tut-scene');
    const start = root.querySelector('[data-start]');
    if (start) {
      start.addEventListener('click', () => close(codeBox));
      start.focus();
    }
    if (!reduced && scene.id === 'journey') runTrail(root);
    if (!reduced && scene.id === 'howto') runHints(root, scene);
  }

  function setPlaying(on) {
    playing = on;
    get('tut-pause').textContent = on ? '⏸ Pause' : '▶ Play';
  }

  function close(focusAfter) {
    stopTimers();
    cancelAnimationFrame(frame);
    dialog.close();
    dialog.remove();
    document.body.classList.remove('modal-open');
    window.removeEventListener('resize', resize);
    focusAfter.focus();
  }

  // The clock behind autoplay. It only counts while playing.
  function tick(now) {
    const passed = lastFrame ? now - lastFrame : 0;
    lastFrame = now;
    if (playing) {
      elapsed += passed;
      const { ms } = scenes[current];
      get('tut-bar-fill').style.width = `${Math.min(100, (elapsed / ms) * 100)}%`;
      const step = autoplayStep(elapsed, ms, current, scenes.length);
      if (step === 'next') show(current + 1);
      if (step === 'end') setPlaying(false);
    }
    frame = requestAnimationFrame(tick);
  }

  scenes.forEach((scene, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Screen ${i + 1} of ${scenes.length}: ${scene.title}`);
    dot.addEventListener('click', () => show(i));
    get('tut-dots').append(dot);
  });

  const goNext = () => show(current === scenes.length - 1 ? 0 : current + 1);
  const goBack = () => { if (current > 0) show(current - 1); };
  get('tut-next').addEventListener('click', () => {
    // "Watch again" from the end starts the film again.
    if (current === scenes.length - 1 && !reduced) setPlaying(true);
    goNext();
  });
  get('tut-back').addEventListener('click', goBack);
  get('tut-pause').addEventListener('click', () => {
    // Play after the end starts again from the first scene.
    if (!playing && current === scenes.length - 1 && elapsed >= scenes[current].ms) show(0);
    setPlaying(!playing);
  });
  get('tut-skip').addEventListener('click', () => close(returnTo));
  get('tut-close').addEventListener('click', () => close(returnTo));
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close(returnTo);
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' && current < scenes.length - 1) goNext();
    if (event.key === 'ArrowLeft') goBack();
  });
  window.addEventListener('resize', resize);

  setPlaying(playing);
  dialog.showModal();
  resize();
  show(0);
  get('tut-next').focus();
  // With reduced motion there is no autoplay, and Pause has nothing to do.
  get('tut-pause').hidden = reduced;
  get('tut-bar-fill').parentElement.hidden = reduced;
  resize();
  frame = requestAnimationFrame(tick);
}
