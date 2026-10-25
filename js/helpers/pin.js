// Layer 3: the teacher dashboard PIN (decided by Habiba, 26 Oct 2026).
// Only the SHA-256 "fingerprint" of the PIN is written here, not the PIN itself.
// Honest limit: on a static website this check runs in the browser, so it keeps
// children out but is NOT real security. Real protection needs a login (Part 22).
// Tested in Node (tests/pin.test.js).

export const PIN_HASH = 'cde383eee8ee7a4400adf7a15f716f179a2eb97646b37e089eb8d6d04e663416';

// The SHA-256 fingerprint of a text, as 64 hex characters.
export async function hashText(text) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// True if the typed PIN is right (spaces around it are ignored).
export async function checkPin(typed) {
  return (await hashText(typed.trim())) === PIN_HASH;
}
