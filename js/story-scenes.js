// Shell layer: the pictures of the story's 7 scenes (Part 44), copied from the
// approved design (docs/design/frames/datascope-story-ui.html) so they look the
// same. Each scene is built once when it opens. A part marked data-line="n"
// shows from line n on, and data-before="n" only before line n (js/story.js),
// so things pop in as the story goes on. data-says="n" marks the classmates
// who answer on line n (their mouths move while the class speaks). The design's animations are in
// css/story.css with an "st-" in front of their names. Changed from the design
// (Habiba, 6 Nov 2026): the mission card says "Pretend class" with no number;
// the thought bubble's words are centred; in the numbers scene Sara stands
// further left and a little smaller, so the cards do not cover her.
// Our own drawings only: no child text ever goes through here.
import { pipSVG } from './pip.js';
import { saraSVG, classmateSVG } from './story-characters.js';

// The design's shared shapes (a star, a sparkle, a soft glow), used with <use>.
export const STORY_DEFS = `
<svg class="st-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
<radialGradient id="starGlow"><stop offset="0" stop-color="#FFE08A" stop-opacity="0.85"></stop><stop offset="1" stop-color="#FFE08A" stop-opacity="0"></stop></radialGradient>
<path id="star5" d="M0 -10 L2.9 -3.8 L9.5 -3.1 L4.7 1.5 L5.9 8.1 L0 4.9 L-5.9 8.1 L-4.7 1.5 L-9.5 -3.1 L-2.9 -3.8 Z" fill="#FFC531" stroke="#17324D" stroke-width="1.4" stroke-linejoin="round"></path>
<path id="spark4" d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10 Z" fill="#fff" stroke="#FFC531" stroke-width="1"></path>
</defs></svg>`;

// Pip, big and cheering (the last scene).
const bigPip = () => pipSVG().replace('pip--happy', 'pip--cheer');

const SCENES = {
  // Sara wonders; a thought bubble pops in: "Do my classmates sleep enough?"
  ask: () => `
<div style="position: absolute; left: 360px; top: 190px; width: 200px; height: 230px">${saraSVG('think')}</div>
<div class="st-part" data-line="1">
<svg style="position: absolute; left: 0; top: 72px; animation: st-popin 0.5s ease-out both; transform-origin: 480px 190px" width="960" height="360" viewBox="0 0 960 360" aria-hidden="true">
<circle cx="552" cy="150" r="9" fill="#fff" stroke="#17324D" stroke-width="3"></circle>
<circle cx="584" cy="124" r="14" fill="#fff" stroke="#17324D" stroke-width="3"></circle>
<ellipse cx="740" cy="84" rx="190" ry="62" fill="#fff" stroke="#17324D" stroke-width="4"></ellipse>
<path d="M606 70 a22 22 0 1 0 24 30 a17 17 0 1 1 -24 -30 Z" fill="#FFC531" stroke="#17324D" stroke-width="3"></path>
<text x="758" y="78" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="700" font-size="26" fill="#17324D">Do my classmates</text>
<text x="758" y="108" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="700" font-size="26" fill="#17324D">sleep enough?</text>
<g font-family="'Baloo 2', sans-serif" font-weight="700" font-size="34" fill="#FF7A6B"><text x="880" y="150" style="animation: st-float 1.8s ease-in-out infinite">?</text><text x="620" y="190" style="animation: st-float 2.2s ease-in-out infinite; animation-delay: -0.8s">?</text></g>
</svg>
</div>`,

  // Sara writes her guess: the "My guess: 8 hours" card, with twinkling stars.
  plan: () => `
<div style="position: absolute; left: 250px; top: 190px; width: 200px; height: 230px">${saraSVG('write')}</div>
<svg style="position: absolute; left: 0; top: 72px" width="960" height="360" viewBox="0 0 960 360" aria-hidden="true">
<g transform="translate(560,60) rotate(-4)"><g style="animation: st-popin 0.5s ease-out both; transform-origin: 115px 75px">
<rect x="0" y="0" width="250" height="160" rx="12" fill="#FFF0C2" stroke="#17324D" stroke-width="4"></rect>
<rect x="0" y="0" width="250" height="38" rx="12" fill="#FFC531" stroke="#17324D" stroke-width="4"></rect>
<text x="125" y="28" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="700" font-size="24" fill="#17324D">My guess</text>
<text x="125" y="112" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="700" font-size="60" fill="#17324D">8 hours</text>
</g></g>
<g transform="translate(520,56)"><g style="animation: st-starfloat 3s ease-in-out infinite"><circle r="26" fill="url(#starGlow)" style="animation: st-pulse 2s ease-in-out infinite"></circle><g style="transform-box: fill-box; transform-origin: 50% 50%; animation: st-tw 1.8s ease-in-out infinite"><use href="#star5" transform="scale(1.5)"></use></g><g transform="translate(16,-14) scale(0.5)"><g style="transform-box: fill-box; transform-origin: 50% 50%; animation: st-tw 1.2s ease-in-out infinite; animation-delay: -0.4s"><use href="#spark4"></use></g></g></g></g>
<g transform="translate(850,48)"><g style="animation: st-starfloat 3.6s ease-in-out infinite; animation-delay: -1s"><circle r="22" fill="url(#starGlow)" style="animation: st-pulse 2.4s ease-in-out infinite"></circle><g style="transform-box: fill-box; transform-origin: 50% 50%; animation: st-tw 2.2s ease-in-out infinite; animation-delay: -0.8s"><use href="#star5" transform="scale(1.2)"></use></g></g></g>
</svg>`,

  // Four classmates; their answers pop up over their heads, and one is sleepy.
  collect: () => `
<div style="position: absolute; left: 150px; top: 190px; width: 200px; height: 230px">${saraSVG('clip')}</div>
<div data-says="1" style="position: absolute; left: 400px; top: 262px; width: 100px; height: 200px; transform: scale(0.85); transform-origin: top left">${classmateSVG({ shirt: '#38B6FF', skin: '#F2C4A0', hair: '#7A4A21', mood: 'idle', delay: 0 })}</div>
<div data-says="1" style="position: absolute; left: 520px; top: 262px; width: 100px; height: 200px; transform: scale(0.85); transform-origin: top left">${classmateSVG({ shirt: '#4CC26B', skin: '#8D5A3B', hair: '#1F1712', mood: 'idle', delay: 1 })}</div>
<div data-says="2" style="position: absolute; left: 640px; top: 262px; width: 100px; height: 200px; transform: scale(0.85); transform-origin: top left">${classmateSVG({ shirt: '#A596FF', skin: '#E8B08A', hair: '#D9822B', mood: 'idle', delay: 2 })}</div>
<div data-says="2" style="position: absolute; left: 760px; top: 262px; width: 100px; height: 200px; transform: scale(0.85); transform-origin: top left">${classmateSVG({ shirt: '#FFC531', skin: '#C68B59', hair: '#3B2A20', mood: 'sleepy', delay: 0 })}</div>
<div class="st-part" data-line="1">
<div style="position: absolute; left: 392px; top: 196px; width: 100px; height: 46px; box-sizing: border-box; background: #fff; border: 4px solid #17324D; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 22px; animation: st-popin 0.4s ease-out both">9 hours</div>
<div style="position: absolute; left: 512px; top: 196px; width: 100px; height: 46px; box-sizing: border-box; background: #fff; border: 4px solid #17324D; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 22px; animation: st-popin 0.4s ease-out 0.5s both">8 hours</div>
</div>
<div class="st-part" data-line="2">
<div style="position: absolute; left: 626px; top: 196px; width: 112px; height: 46px; box-sizing: border-box; background: #fff; border: 4px solid #17324D; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 22px; animation: st-popin 0.4s ease-out both">10 hours</div>
<div style="position: absolute; left: 752px; top: 196px; width: 100px; height: 46px; box-sizing: border-box; background: #FFD9D4; border: 4px solid #17324D; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 22px; animation: st-popin 0.4s ease-out 0.5s both">3 hours</div>
</div>`,

  // Sara points at a bar graph: WHAT and HOW MANY pills, and the bars grow.
  graph: () => `
<div style="position: absolute; left: 110px; top: 190px; width: 200px; height: 230px">${saraSVG('point')}</div>
<svg style="position: absolute; left: 0; top: 72px" width="960" height="360" viewBox="0 0 960 360" aria-hidden="true">
<g transform="translate(450,14)"><g style="animation: st-popin 0.5s ease-out both; transform-origin: 234px 163px">
<rect x="0" y="0" width="468" height="326" rx="22" fill="#fff" stroke="#17324D" stroke-width="4"></rect>
<rect x="18" y="14" width="190" height="30" rx="15" fill="#D3EEFF" stroke="#17324D" stroke-width="3"></rect>
<text x="113" y="35" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="800" font-size="16" fill="#17324D">WHAT: hours slept</text>
<rect x="222" y="14" width="190" height="30" rx="15" fill="#FFF0C2" stroke="#17324D" stroke-width="3"></rect>
<text x="317" y="35" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="800" font-size="16" fill="#17324D">HOW MANY: kids</text>
<line x1="20" y1="270" x2="448" y2="270" stroke="#17324D" stroke-width="4" stroke-linecap="round"></line>
<g style="transform-box: fill-box; transform-origin: 50% 100%">
<rect x="28" y="242" width="62" height="28" rx="6" fill="#FF7A6B" stroke="#17324D" stroke-width="3" style="transform-box: fill-box; transform-origin: 50% 100%; animation: st-grow 0.6s ease-out 0.5s both"></rect>
<rect x="112" y="214" width="62" height="56" rx="6" fill="#38B6FF" stroke="#17324D" stroke-width="3" style="transform-box: fill-box; transform-origin: 50% 100%; animation: st-grow 0.6s ease-out 0.7s both"></rect>
<rect x="196" y="130" width="62" height="140" rx="6" fill="#38B6FF" stroke="#17324D" stroke-width="3" style="transform-box: fill-box; transform-origin: 50% 100%; animation: st-grow 0.7s ease-out 0.9s both"></rect>
<rect x="280" y="102" width="62" height="168" rx="6" fill="#FFC531" stroke="#17324D" stroke-width="3" style="transform-box: fill-box; transform-origin: 50% 100%; animation: st-grow 0.8s ease-out 1.1s both"></rect>
<rect x="364" y="186" width="62" height="84" rx="6" fill="#38B6FF" stroke="#17324D" stroke-width="3" style="transform-box: fill-box; transform-origin: 50% 100%; animation: st-grow 0.7s ease-out 1.3s both"></rect>
</g>
<g font-family="'Nunito', sans-serif" font-weight="800" font-size="18" fill="#17324D" text-anchor="middle" style="animation: st-rise 0.5s ease-out 1.6s both">
<text x="59" y="234">1 kid</text><text x="143" y="206">2 kids</text><text x="227" y="122">5 kids</text><text x="311" y="94">6 kids</text><text x="395" y="178">3 kids</text>
<text x="59" y="298">3 hours</text><text x="143" y="298">7 hours</text><text x="227" y="298">8 hours</text><text x="311" y="298">9 hours</text><text x="395" y="298">10 hours</text>
</g>
</g></g>
</svg>`,

  // The numbers in order, the centre number and the mean; then "My guess was 8";
  // then chance: a die rolls, and "should" and "did" bars grow.
  numbers: () => `
<div style="position: absolute; left: 116px; top: 224px; width: 170px; height: 196px">${saraSVG('point')}</div>
<svg style="position: absolute; left: 0; top: 72px" width="960" height="360" viewBox="0 0 960 360" aria-hidden="true">
<defs><pattern id="stripe" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#FFF0C2"></rect><rect width="5" height="10" fill="#FFC531"></rect></pattern></defs>
<g font-family="'Baloo 2', sans-serif" font-weight="700" font-size="40" fill="#17324D" text-anchor="middle">
<g style="animation: st-rise 0.4s ease-out 0.1s both"><rect x="296" y="22" width="60" height="76" rx="14" fill="#fff" stroke="#17324D" stroke-width="4"></rect><text x="326" y="76">3</text></g>
<g style="animation: st-rise 0.4s ease-out 0.25s both"><rect x="364" y="22" width="60" height="76" rx="14" fill="#fff" stroke="#17324D" stroke-width="4"></rect><text x="394" y="76">8</text></g>
<g style="animation: st-rise 0.4s ease-out 0.4s both"><rect x="432" y="22" width="60" height="76" rx="14" fill="#D5F2DC" stroke="#17324D" stroke-width="4"></rect><text x="462" y="76">9</text></g>
<g style="animation: st-rise 0.4s ease-out 0.55s both"><rect x="500" y="22" width="60" height="76" rx="14" fill="#fff" stroke="#17324D" stroke-width="4"></rect><text x="530" y="76">9</text></g>
<g style="animation: st-rise 0.4s ease-out 0.7s both"><rect x="568" y="22" width="60" height="76" rx="14" fill="#fff" stroke="#17324D" stroke-width="4"></rect><text x="598" y="76">10</text></g>
</g>
<g style="animation: st-popin 0.5s ease-out 0.9s both; transform-origin: 380px 200px">
<rect x="296" y="124" width="150" height="104" rx="20" fill="#D5F2DC" stroke="#17324D" stroke-width="4"></rect>
<text x="371" y="156" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="800" font-size="18" fill="#17324D">Centre number</text>
<text x="371" y="206" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="700" font-size="48" fill="#17324D">9</text>
</g>
<g style="animation: st-popin 0.5s ease-out 1.1s both; transform-origin: 540px 200px">
<rect x="462" y="124" width="150" height="104" rx="20" fill="#D3EEFF" stroke="#17324D" stroke-width="4"></rect>
<text x="537" y="156" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="800" font-size="18" fill="#17324D">Mean</text>
<text x="537" y="206" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="700" font-size="48" fill="#17324D">7.8</text>
</g>
</svg>
<div class="st-part" data-line="1">
<svg style="position: absolute; left: 0; top: 72px" width="960" height="360" viewBox="0 0 960 360" aria-hidden="true">
<g transform="translate(296,250) rotate(-1.5)"><g style="animation: st-popin 0.5s ease-out both; transform-origin: 160px 30px">
<rect x="0" y="0" width="332" height="62" rx="18" fill="#FFF0C2" stroke="#17324D" stroke-width="4"></rect>
<text x="166" y="40" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="700" font-size="24" fill="#17324D">My guess was 8. Very close!</text>
</g></g>
</svg>
</div>
<div class="st-part" data-line="2">
<svg style="position: absolute; left: 0; top: 72px" width="960" height="360" viewBox="0 0 960 360" aria-hidden="true">
<defs><pattern id="stripe2" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#FFF0C2"></rect><rect width="5" height="10" fill="#FFC531"></rect></pattern></defs>
<g transform="translate(656,14)"><g style="animation: st-popin 0.5s ease-out both; transform-origin: 140px 160px">
<rect x="0" y="0" width="280" height="326" rx="22" fill="#fff" stroke="#17324D" stroke-width="4"></rect>
<rect x="18" y="14" width="150" height="30" rx="15" fill="#E3DEFF" stroke="#17324D" stroke-width="3"></rect>
<text x="93" y="35" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="800" font-size="16" fill="#17324D">Chance, too!</text>
<g transform="translate(176,66)"><g style="transform-box: fill-box; transform-origin: 50% 50%; animation: st-roll 1.4s ease-in-out 2">
<rect x="0" y="0" width="80" height="80" rx="16" fill="#fff" stroke="#17324D" stroke-width="4"></rect>
<circle cx="22" cy="22" r="6" fill="#17324D"></circle><circle cx="58" cy="22" r="6" fill="#17324D"></circle><circle cx="22" cy="40" r="6" fill="#17324D"></circle><circle cx="58" cy="40" r="6" fill="#17324D"></circle><circle cx="22" cy="58" r="6" fill="#17324D"></circle><circle cx="58" cy="58" r="6" fill="#17324D"></circle>
</g></g>
<text x="22" y="100" font-family="'Nunito', sans-serif" font-weight="800" font-size="18" fill="#17324D">Roll a die:</text>
<text x="22" y="124" font-family="'Nunito', sans-serif" font-weight="800" font-size="18" fill="#17324D">how likely is 6?</text>
<line x1="26" y1="296" x2="256" y2="296" stroke="#17324D" stroke-width="4" stroke-linecap="round"></line>
<rect x="50" y="216" width="70" height="80" rx="6" fill="url(#stripe2)" stroke="#17324D" stroke-width="3" style="transform-box: fill-box; transform-origin: 50% 100%; animation: st-grow 0.6s ease-out 1.4s both"></rect>
<rect x="160" y="196" width="70" height="100" rx="6" fill="#FFC531" stroke="#17324D" stroke-width="3" style="transform-box: fill-box; transform-origin: 50% 100%; animation: st-grow 0.6s ease-out 1.6s both"></rect>
<g font-family="'Nunito', sans-serif" font-weight="800" font-size="18" fill="#17324D" text-anchor="middle" style="animation: st-rise 0.4s ease-out 2s both"><text x="85" y="206">Should</text><text x="195" y="186">Did</text><text x="85" y="240" font-size="22">16.7%</text><text x="195" y="240" font-size="22">20%</text></g>
</g></g>
</svg>
</div>`,

  // The Evidence Card; then "How sure? Likely" on the ruler; then the Checked! stamp,
  // confetti, and the classmates clap.
  conclude: () => `
<div style="position: absolute; left: 130px; top: 190px; width: 200px; height: 230px">${saraSVG('cheer')}</div>
<svg style="position: absolute; left: 0; top: 72px" width="960" height="360" viewBox="0 0 960 360" aria-hidden="true">
<g transform="translate(320,12)"><g style="animation: st-popin 0.5s ease-out both; transform-origin: 186px 167px">
<rect x="0" y="0" width="372" height="334" rx="22" fill="#fff" stroke="#17324D" stroke-width="4"></rect>
<path d="M2 44 L2 26 Q2 2 26 2 L346 2 Q370 2 370 26 L370 44 Z" fill="#A596FF"></path>
<line x1="2" y1="44" x2="370" y2="44" stroke="#17324D" stroke-width="4"></line>
<text x="22" y="32" font-family="'Baloo 2', sans-serif" font-weight="700" font-size="24" fill="#17324D">My Evidence Card</text>
<rect x="20" y="60" width="96" height="30" rx="15" fill="#FFD9D4" stroke="#17324D" stroke-width="3"></rect>
<text x="68" y="81" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="800" font-size="18" fill="#17324D">I think</text>
<text x="22" y="118" font-family="'Nunito', sans-serif" font-weight="800" font-size="19" fill="#17324D" style="animation: st-rise 0.5s ease-out 0.4s both">Most kids sleep 8 to 9 hours.</text>
<rect x="20" y="134" width="108" height="30" rx="15" fill="#D3EEFF" stroke="#17324D" stroke-width="3"></rect>
<text x="74" y="155" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="800" font-size="18" fill="#17324D">My proof</text>
<text x="22" y="192" font-family="'Nunito', sans-serif" font-weight="800" font-size="19" fill="#17324D" style="animation: st-rise 0.5s ease-out 0.9s both">The centre number is 9.</text>
<text x="22" y="216" font-family="'Nunito', sans-serif" font-weight="800" font-size="19" fill="#17324D" style="animation: st-rise 0.5s ease-out 1.2s both">The tallest bar is 9 hours.</text>
</g></g>
</svg>
<div class="st-part" data-line="1">
<svg style="position: absolute; left: 320px; top: 72px; animation: st-rise 0.5s ease-out both" width="372" height="360" viewBox="0 0 372 360" aria-hidden="true">
<g transform="translate(0,12)">
<rect x="20" y="232" width="116" height="30" rx="15" fill="#FFF0C2" stroke="#17324D" stroke-width="3"></rect>
<text x="78" y="253" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="800" font-size="18" fill="#17324D">How sure?</text>
<text x="152" y="254" font-family="'Baloo 2', sans-serif" font-weight="700" font-size="22" fill="#17324D">Likely</text>
<rect x="22" y="276" width="66" height="30" rx="8" fill="#FF7A6B" stroke="#17324D" stroke-width="3"></rect>
<rect x="94" y="276" width="66" height="30" rx="8" fill="#FFB36B" stroke="#17324D" stroke-width="3"></rect>
<rect x="166" y="276" width="66" height="30" rx="8" fill="#FFE08A" stroke="#17324D" stroke-width="3"></rect>
<rect x="238" y="276" width="66" height="30" rx="8" fill="#B8E6A0" stroke="#17324D" stroke-width="6" style="animation: st-nudge 0.8s ease-in-out infinite"></rect>
<rect x="310" y="276" width="42" height="30" rx="8" fill="#4CC26B" stroke="#17324D" stroke-width="3"></rect>
</g>
</svg>
</div>
<div class="st-part" data-before="2">
<div style="position: absolute; left: 730px; top: 262px; width: 100px; height: 200px; transform: scale(0.85); transform-origin: top left">${classmateSVG({ shirt: '#38B6FF', skin: '#F2C4A0', hair: '#7A4A21', mood: 'idle', delay: 0 })}</div>
<div style="position: absolute; left: 830px; top: 262px; width: 100px; height: 200px; transform: scale(0.85); transform-origin: top left">${classmateSVG({ shirt: '#4CC26B', skin: '#8D5A3B', hair: '#1F1712', mood: 'idle', delay: 1 })}</div>
</div>
<div class="st-part" data-line="2">
<div style="position: absolute; left: 730px; top: 262px; width: 100px; height: 200px; transform: scale(0.85); transform-origin: top left">${classmateSVG({ shirt: '#38B6FF', skin: '#F2C4A0', hair: '#7A4A21', mood: 'clap', delay: 0 })}</div>
<div style="position: absolute; left: 830px; top: 262px; width: 100px; height: 200px; transform: scale(0.85); transform-origin: top left">${classmateSVG({ shirt: '#4CC26B', skin: '#8D5A3B', hair: '#1F1712', mood: 'clap', delay: 1 })}</div>
</div>
<div class="st-part" data-line="2">
<svg style="position: absolute; left: 0; top: 72px" width="960" height="360" viewBox="0 0 960 360" aria-hidden="true">
<g transform="translate(562,64) rotate(10)"><g style="animation: st-stamp 0.5s ease-out both; transform-box: fill-box; transform-origin: 50% 50%">
<rect x="0" y="0" width="128" height="46" rx="12" fill="#fff" stroke="#217A3B" stroke-width="5"></rect>
<text x="64" y="32" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="700" font-size="26" fill="#217A3B">Checked!</text>
</g></g>
<g>
<rect x="60" y="0" width="12" height="18" rx="3" fill="#FF7A6B" style="animation: st-fall 3.4s linear infinite"></rect>
<rect x="150" y="0" width="12" height="18" rx="3" fill="#FFC531" style="animation: st-fall 4.2s linear infinite; animation-delay: -1s"></rect>
<rect x="260" y="0" width="12" height="18" rx="3" fill="#A596FF" style="animation: st-fall 3.8s linear infinite; animation-delay: -2s"></rect>
<rect x="380" y="0" width="12" height="18" rx="3" fill="#38B6FF" style="animation: st-fall 3.3s linear infinite; animation-delay: -0.4s"></rect>
<rect x="470" y="0" width="12" height="18" rx="3" fill="#4CC26B" style="animation: st-fall 4.5s linear infinite; animation-delay: -2.4s"></rect>
<rect x="560" y="0" width="12" height="18" rx="3" fill="#FFC531" style="animation: st-fall 4s linear infinite; animation-delay: -3s"></rect>
<rect x="650" y="0" width="12" height="18" rx="3" fill="#A596FF" style="animation: st-fall 3.6s linear infinite; animation-delay: -1.4s"></rect>
<rect x="720" y="0" width="12" height="18" rx="3" fill="#FF7A6B" style="animation: st-fall 4.4s linear infinite; animation-delay: -3.2s"></rect>
<rect x="800" y="0" width="12" height="18" rx="3" fill="#38B6FF" style="animation: st-fall 3.5s linear infinite; animation-delay: -0.9s"></rect>
<rect x="890" y="0" width="12" height="18" rx="3" fill="#4CC26B" style="animation: st-fall 4.1s linear infinite; animation-delay: -2.8s"></rect>
<rect x="20" y="0" width="12" height="18" rx="3" fill="#FFC531" style="animation: st-fall 3.9s linear infinite; animation-delay: -1.9s"></rect>
<rect x="930" y="0" width="12" height="18" rx="3" fill="#FF7A6B" style="animation: st-fall 4.3s linear infinite; animation-delay: -0.2s"></rect>
</g>
</svg>
</div>`,

  // Big Pip cheers among glowing stars and a shooting star; then the pretend class
  // (no number: Habiba, 6 Nov 2026); then an empty Evidence Card: "You fill it in!"
  mission: () => `
<div style="position: absolute; left: 70px; top: 100px; width: 120px; height: 132px; transform: scale(2.5); transform-origin: top left">${bigPip()}</div>
<svg style="position: absolute; left: 0; top: 72px" width="960" height="360" viewBox="0 0 960 360" aria-hidden="true">
<g transform="translate(90,86)"><g style="animation: st-starfloat 3s ease-in-out infinite"><circle r="34" fill="url(#starGlow)" style="animation: st-pulse 2s ease-in-out infinite"></circle><g style="transform-box: fill-box; transform-origin: 50% 50%; animation: st-tw 1.7s ease-in-out infinite"><use href="#star5" transform="scale(2)"></use></g></g></g>
<g transform="translate(380,60)"><g style="animation: st-starfloat 3.4s ease-in-out infinite; animation-delay: -1.2s"><circle r="26" fill="url(#starGlow)" style="animation: st-pulse 2.3s ease-in-out infinite"></circle><g style="transform-box: fill-box; transform-origin: 50% 50%; animation: st-tw 2s ease-in-out infinite; animation-delay: -0.6s"><use href="#star5" transform="scale(1.5)"></use></g></g></g>
<g transform="translate(340,250)"><g style="animation: st-starfloat 2.8s ease-in-out infinite; animation-delay: -0.5s"><circle r="22" fill="url(#starGlow)" style="animation: st-pulse 1.9s ease-in-out infinite"></circle><g style="transform-box: fill-box; transform-origin: 50% 50%; animation: st-tw 1.5s ease-in-out infinite; animation-delay: -0.9s"><use href="#star5" transform="scale(1.2)"></use></g></g></g>
<g transform="translate(200,40) scale(0.7)"><g style="transform-box: fill-box; transform-origin: 50% 50%; animation: st-tw 1.3s ease-in-out infinite"><use href="#spark4"></use></g></g>
<g transform="translate(300,180) scale(0.5)"><g style="transform-box: fill-box; transform-origin: 50% 50%; animation: st-tw 1.1s ease-in-out infinite; animation-delay: -0.5s"><use href="#spark4"></use></g></g>
<g style="animation: st-shoot 3.2s ease-in infinite"><g transform="translate(900,20) rotate(25)"><line x1="0" y1="0" x2="-70" y2="-28" stroke="#FFE08A" stroke-width="3" stroke-linecap="round" opacity="0.7"></line><use href="#star5" transform="scale(0.9)"></use></g></g>
<g fill="#FFC531"><circle cx="250" cy="300" r="3" style="animation: st-dust 2.6s ease-out infinite"></circle><circle cx="420" cy="310" r="2.5" style="animation: st-dust 3s ease-out infinite; animation-delay: -1s"></circle><circle cx="150" cy="320" r="3" style="animation: st-dust 2.8s ease-out infinite; animation-delay: -1.8s"></circle><circle cx="500" cy="290" r="2" style="animation: st-dust 2.4s ease-out infinite; animation-delay: -0.4s"></circle></g>
</svg>
<div class="st-part" data-line="1">
<svg style="position: absolute; left: 0; top: 72px" width="960" height="360" viewBox="0 0 960 360" aria-hidden="true">
<g transform="translate(400,120)"><g style="animation: st-popin 0.5s ease-out both; transform-origin: 118px 100px">
<rect x="0" y="0" width="236" height="216" rx="22" fill="#fff" stroke="#17324D" stroke-width="4"></rect>
<rect x="20" y="14" width="196" height="30" rx="15" fill="#D3EEFF" stroke="#17324D" stroke-width="3"></rect>
<text x="118" y="35" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="800" font-size="16" fill="#17324D">Pretend class</text>
<g stroke="#17324D" stroke-width="3">
<circle cx="36" cy="76" r="14" fill="#FF7A6B"></circle><circle cx="82" cy="76" r="14" fill="#FFC531"></circle><circle cx="128" cy="76" r="14" fill="#38B6FF"></circle><circle cx="174" cy="76" r="14" fill="#4CC26B"></circle>
<circle cx="36" cy="114" r="14" fill="#A596FF"></circle><circle cx="82" cy="114" r="14" fill="#FF7A6B"></circle><circle cx="128" cy="114" r="14" fill="#FFC531"></circle><circle cx="174" cy="114" r="14" fill="#38B6FF"></circle>
<circle cx="36" cy="152" r="14" fill="#4CC26B"></circle><circle cx="82" cy="152" r="14" fill="#A596FF"></circle><circle cx="128" cy="152" r="14" fill="#FF7A6B"></circle><circle cx="174" cy="152" r="14" fill="#FFC531"></circle>
</g>
<text x="118" y="198" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="800" font-size="18" fill="#17324D">Try it again and again!</text>
</g></g>
</svg>
</div>
<div class="st-part" data-line="2">
<svg style="position: absolute; left: 0; top: 72px" width="960" height="360" viewBox="0 0 960 360" aria-hidden="true">
<g style="animation: st-rise 0.4s ease-out both"><path d="M644 228 L690 228" stroke="#17324D" stroke-width="5" stroke-linecap="round"></path><path d="M680 216 L694 228 L680 240" stroke="#17324D" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></g>
<g transform="translate(706,120)"><g style="animation: st-popin 0.5s ease-out both; transform-origin: 113px 108px">
<rect x="0" y="0" width="226" height="216" rx="22" fill="#F4F0FF" stroke="#17324D" stroke-width="4" stroke-dasharray="10 8"></rect>
<text x="113" y="46" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="700" font-size="24" fill="#17324D">Your Evidence Card</text>
<rect x="22" y="68" width="182" height="28" rx="14" fill="#FFD9D4" stroke="#17324D" stroke-width="3"></rect>
<rect x="22" y="108" width="182" height="28" rx="14" fill="#D3EEFF" stroke="#17324D" stroke-width="3"></rect>
<rect x="22" y="148" width="182" height="28" rx="14" fill="#FFF0C2" stroke="#17324D" stroke-width="3"></rect>
<text x="113" y="204" text-anchor="middle" font-family="'Nunito', sans-serif" font-weight="800" font-size="18" fill="#17324D">You fill it in!</text>
</g></g>
</svg>
</div>`,

};

// The scene's picture, and small Pip watching from the side (not in the last scene).
export function sceneHTML(id) {
  const small = id === 'mission' ? '' : `<div class="st-small-pip">${pipSVG()}</div>`;
  return SCENES[id]() + small;
}
