// Layer 3: keeps pop-ups in a line, so only one is open at a time.
// Pure logic with no page, so it can be tested in Node (tests/modal-queue.test.js).
export function createModalQueue() {
  const waiting = [];
  let current = null;

  return {
    // A new pop-up wants to open. Returns it if it can show now,
    // or null if another one is open (then it waits its turn).
    add(item) {
      if (current) {
        waiting.push(item);
        return null;
      }
      current = item;
      return item;
    },

    // The open pop-up was closed. Returns the next one to show, or null.
    done() {
      current = waiting.shift() || null;
      return current;
    },

    get current() {
      return current;
    },

    get waitingCount() {
      return waiting.length;
    },
  };
}
