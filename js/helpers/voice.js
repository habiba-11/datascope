// Helper layer: read-aloud for the story (Part 44c, Round 4). The browser's
// own voices are used (no sound files). They differ a lot between devices, so
// we pick the clearest English voice there is: "Natural" / "Online" voices
// first, then Google US / UK, then well-known good voices; robotic ones last.
// Pure (no browser), so it is tested (tests/voice.test.js); js/voice.js speaks.

// How each speaker sounds: Pip a little slower and lower, the class higher.
export const VOICE_STYLE = {
  pip: { rate: 0.95, pitch: 0.9 },
  sara: { rate: 1, pitch: 1.15 },
  kids: { rate: 1.05, pitch: 1.3 },
};

// A score for one voice ({ name, lang }): higher = clearer.
export function voiceScore({ name, lang }) {
  let score = 0;
  if (/natural|neural|online/i.test(name)) score += 100;
  if (/google (us|uk)/i.test(name)) score += 60;
  if (/samantha|karen|daniel|serena|moira|tessa|ava|allison|zira|jenny|aria|guy|libby|sonia/i.test(name)) score += 40;
  if (/en[-_](US|GB)/i.test(lang)) score += 10;
  if (/espeak|compact/i.test(name)) score -= 50;
  return score;
}

// Only English voices, the clearest first.
export function rankVoices(voices) {
  return voices.filter((v) => /^en/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a));
}

// Known voice names on Windows, Mac, iPad, Chromebook and in Chrome (6 Nov 2026:
// a Windows laptop here had only George, Hazel and Susan, and the first lists
// did not know them, so Pip got a female voice; now they are known).
const FEMALE = /female|samantha|karen|serena|moira|tessa|ava|allison|zira|jenny|aria|libby|sonia|hazel|susan|catherine|linda|heera|emma|fiona|victoria|kate|michelle|natasha|clara|google us english|google uk english female/i;
const MALE = /\bmale\b|daniel|guy|ryan|alex|fred|david|mark|george|james|richard|ravi|sean|oliver|thomas|arthur|william|christopher|eric|google uk english male/i;

// The voice for a speaker, from the ranked list (or null: no voices at all).
// Sara: the best female voice; Pip: the best male voice; the class: a third one.
export function pickVoice(ranked, who) {
  if (!ranked.length) return null;
  // \bmale\b finds "Male" as a word, so it never matches inside "female".
  const female = ranked.filter((v) => FEMALE.test(v.name) && !/\bmale\b/i.test(v.name));
  const male = ranked.filter((v) => MALE.test(v.name) && !/female/i.test(v.name));
  if (who === 'sara') return female[0] || ranked[0];
  if (who === 'pip') return male[0] || ranked[Math.min(1, ranked.length - 1)];
  return female[1] || ranked[Math.min(2, ranked.length - 1)];
}

// The words as the voice should say them (the screen keeps the original):
// "..." becomes a short pause, "!" is read calmly, and words in CAPITALS are
// lowercase, because many voices spell them out letter by letter ("Y-O-U-R").
export function speechText(text) {
  return text
    .replace(/\.\.\./g, ',')
    .replace(/!/g, '.')
    .replace(/\b[A-Z]{2,}\b/g, (word) => word.toLowerCase());
}

// How long a line takes to say, roughly (ms): a safety net in case the browser
// never says that the voice has finished.
export function speakingTime(text) {
  return Math.max(1200, text.length * 62);
}
