// Layer 3: arrow keys in a group of choice cards (role="radiogroup").
// Pure, so it is tested in Node (tests/choice-keys.test.js).
// Right/Down = next, Left/Up = previous (wrapping round), Home/End = first/last.
// Returns the new index, or null for any other key.
export function nextIndex(key, index, count) {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (index + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (index - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
