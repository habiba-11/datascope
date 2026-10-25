// Layer 3: the rules behind the "sort the cards" puzzle (Part 21c). The child
// puts Mia's numbers in order to find the median themselves. Pure, tested in
// Node (tests/sort-cards.test.js).

// A new list with the item at `from` moved to `to` (the others shift along).
export function moveItem(list, from, to) {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(Math.max(0, Math.min(to, copy.length)), 0, item);
  return copy;
}

// True when the numbers go from smallest to biggest.
export function isSorted(list) {
  return list.every((value, i) => i === 0 || list[i - 1] <= value);
}

// The position(s) in the centre: one for an odd count, two for an even count.
export function centreIndexes(length) {
  const half = Math.floor(length / 2);
  return length % 2 === 1 ? [half] : [half - 1, half];
}

// Where a dragged card lands: the number of other cards whose centre is left
// of the pointer. `centres` are the x positions of the other cards' centres.
export function dropIndex(pointerX, centres) {
  return centres.filter((x) => x < pointerX).length;
}
