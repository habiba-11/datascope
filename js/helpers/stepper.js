// Layer 3: the mini stepper inside a task card (UI guide: "✓ Guess · 2 Sort · 3 Find").
// Pure: it only says which steps are done, which one is now, and which come next.
// Each state also has a word, so colour is never the only signal.

const WORDS = { done: 'done', now: 'now', next: 'still to do' };

// `labels`: the step names in order. `current`: the index of the step the child is on.
export function stepStates(labels, current) {
  return labels.map((label, i) => {
    const state = i < current ? 'done' : i === current ? 'now' : 'next';
    return { label, number: i + 1, state, word: WORDS[state] };
  });
}
