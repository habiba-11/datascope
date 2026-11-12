// Shell layer: read-aloud for the story (Part 44c, Round 4). The browser's own
// voice says each line (no sound files), with a different voice and pitch for
// Pip, Sara and the class. The choice of voice and the spoken words are in
// helpers/voice.js (tested). onStart and onEnd come from the voice itself, so
// a mouth moves only while that line is really being said.
import {
  rankVoices, pickVoice, speechText, speakingTime, VOICE_STYLE,
} from './helpers/voice.js';

let ranked = []; // the clearest English voices first
let current = 0; // the number of the line being said, so an old line's "end" is ignored
let safety = null;

function loadVoices() {
  try {
    ranked = rankVoices(window.speechSynthesis.getVoices());
  } catch {
    ranked = [];
  }
}

// The browser lists its voices a moment after the page opens.
if (globalThis.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
}

// Says `text` as `who` ('pip', 'sara' or 'kids').
export function speak(who, text, { onStart = () => {}, onEnd = () => {} } = {}) {
  stopSpeaking();
  current += 1;
  const mine = current;
  const done = () => {
    if (mine !== current) return; // a newer line has started: not ours to end
    clearTimeout(safety);
    onEnd();
  };
  const synth = globalThis.speechSynthesis;
  if (!synth) {
    // No read-aloud in this browser: the mouth still moves for a moment.
    onStart();
    safety = setTimeout(done, speakingTime(text));
    return;
  }
  const line = new SpeechSynthesisUtterance(speechText(text));
  const voice = pickVoice(ranked, who);
  if (voice) {
    line.voice = voice;
    line.lang = voice.lang;
  }
  Object.assign(line, VOICE_STYLE[who] || VOICE_STYLE.pip);
  line.volume = 1;
  line.onstart = () => { if (mine === current) onStart(); };
  line.onend = done;
  line.onerror = done;
  // A safety net: some browsers never say that a line has ended.
  safety = setTimeout(done, speakingTime(text) + 2500);
  synth.speak(line);
}

export function stopSpeaking() {
  clearTimeout(safety);
  try {
    window.speechSynthesis.cancel();
  } catch {
    // No read-aloud in this browser.
  }
}
