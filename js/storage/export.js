// Layer 4: turns the reasoning log into files the child hands in to the teacher.
// Nothing is sent anywhere: the browser just saves a file to Downloads.

export const FORMAT_VERSION = 1;

// The JSON file: everything about one child's work, under the code only.
export function buildExport(code, entries, now = new Date()) {
  return {
    app: 'DataScope: The Evidence Lab',
    formatVersion: FORMAT_VERSION,
    exportedAt: now.toISOString(),
    code,
    note: 'The survey data in DataScope is synthetic (a pretend class), made for teaching. '
      + 'This file holds one child\'s reasoning log under an anonymous code.',
    entries,
  };
}

// e.g. "datascope-OWL-07-2026-10-22.json". Uses the device's own (local) date:
// toISOString() is UTC, which in Egypt would say "yesterday" just after midnight.
export function exportFileName(code, extension, now = new Date()) {
  const two = (n) => String(n).padStart(2, '0');
  const day = `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`;
  return `datascope-${code || 'NO-CODE'}-${day}.${extension}`;
}

// One CSV cell. Lists become "a; b", and text is wrapped in quotes when it
// holds a comma, quote or new line. Text starting with = + - @ gets a ' in
// front, so a spreadsheet never runs a child's typing as a formula.
function csvCell(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  let text = Array.isArray(value) ? value.join('; ') : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// The CSV file: one row per log entry. The first columns are always the same;
// after them comes one column for every detail used by any entry.
export function toCSV(entries) {
  const first = ['code', 'time', 'room', 'type'];
  const extra = [];
  for (const entry of entries) {
    for (const key of Object.keys(entry)) {
      if (!first.includes(key) && !extra.includes(key)) extra.push(key);
    }
  }
  const columns = [...first, ...extra];
  const rows = entries.map((entry) => columns.map((col) => csvCell(entry[col])).join(','));
  return [columns.join(','), ...rows].join('\r\n');
}

// Saves text as a file in the browser's Downloads folder.
export function downloadFile(fileName, text, mimeType) {
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000); // tidy up after the download starts
}
