// Sorts numbers by size and text alphabetically (use as .sort(compareValues)).
export function compareValues(a, b) {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}

export function mean(numbers) {
  const total = numbers.reduce((sum, n) => sum + n, 0);
  return total / numbers.length;
}

// Rounds a mean to 1 decimal place for showing to children.
// The generator uses this too, so the app always shows the recipe's mean
// (e.g. 8.35 shows as 8.4, while toFixed(1) would show 8.3).
export function formatMean(value) {
  return Math.round(value * 10) / 10;
}

export function median(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

export function mode(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  const maxCount = Math.max(...counts.values());

  // Every value appears the same single time: no typical value exists.
  if (maxCount === 1) {
    return [];
  }

  return [...counts.entries()]
    .filter(([, count]) => count === maxCount)
    .map(([value]) => value)
    .sort(compareValues);
}

export function range(numbers) {
  return Math.max(...numbers) - Math.min(...numbers);
}
