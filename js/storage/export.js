// Layer 4: the teacher's downloads (the class log and the thesis tables), made
// from the work in the online database. Nothing is sent anywhere: the browser
// just saves a file to Downloads. (Children no longer save files: 4 Nov 2026.)

// e.g. "datascope-class-2026-10-22.csv". Uses the device's own (local) date:
// toISOString() is UTC, which in Egypt would say "yesterday" just after midnight.
export function exportFileName(code, extension, now = new Date()) {
  const two = (n) => String(n).padStart(2, '0');
  const day = `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`;
  return `datascope-${code || 'NO-CODE'}-${day}.${extension}`;
}

// One CSV cell. Lists become "a; b", and text is wrapped in quotes when it
// holds a comma, quote or new line. Text starting with = + - @ gets a ' in
// front, so a spreadsheet never runs a child's typing as a formula.
export function csvCell(value) {
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

// A CSV with fixed columns, in this order (the thesis metrics table, Part 20).
// `columns` are keys; each row is an object with those keys.
export function tableCSV(columns, rows) {
  const lines = rows.map((row) => columns.map((col) => csvCell(row[col])).join(','));
  return [columns.join(','), ...lines].join('\r\n');
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
