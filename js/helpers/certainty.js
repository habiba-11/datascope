// Layer 3: the certainty scale, shared by Chance Lab and Evidence Board.
// The five words come from Papers 12, 13 and 19 (impossible to certain);
// the gloss under each word is for 10-year-olds.
export const CERTAINTY = [
  { value: 'impossible', word: 'Impossible', gloss: "can't happen" },
  { value: 'unlikely', word: 'Unlikely', gloss: 'probably not' },
  { value: 'even', word: 'Even chance', gloss: '50-50' },
  { value: 'likely', word: 'Likely', gloss: 'probably' },
  { value: 'certain', word: 'Certain', gloss: 'will happen' },
];

// The buttons. `extraClass` adds a class (Evidence Board also uses "choice-btn").
export function certaintyButtonsHTML(extraClass = '') {
  return CERTAINTY.map((c) => `
    <button class="btn certainty-btn ${extraClass}" data-value="${c.value}" data-word="${c.word}" type="button">
      ${c.word}<span class="certainty-gloss">${c.gloss}</span>
    </button>`).join('');
}
