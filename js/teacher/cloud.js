// Teacher dashboard: talks to the online database (Part 22), with plain fetch().
// The teacher logs in with email + password (Supabase Auth). The database only
// shows children's work to a logged-in account listed in "teachers"
// (backend/schema.sql), so this login is real protection, unlike the PIN.
import { BACKEND } from '../config.js';
import { fromRow, groupByCode, tagsByCode } from '../helpers/outbox.js';

// The login is kept until the browser tab is closed.
const SESSION_KEY = 'datascope:teacherSession';

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function saveSession(session) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // storage blocked: the teacher logs in again next time
  }
}

export const isLoggedIn = () => Boolean(readSession());
export const teacherEmail = () => readSession()?.email || '';

// Asks Supabase Auth for a login ticket: with email + password, or with the
// "refresh" ticket when the old one ran out (they last about an hour).
async function getTicket(grantType, body) {
  const response = await fetch(`${BACKEND.url}/auth/v1/token?grant_type=${grantType}`, {
    method: 'POST',
    headers: { apikey: BACKEND.publishableKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error_description || data.msg || `Login failed (${response.status})`);
  saveSession({ access: data.access_token, refresh: data.refresh_token, email: data.user?.email || body.email || '' });
}

export function logIn(email, password) {
  return getTicket('password', { email: email.trim(), password });
}

export async function logOut() {
  const session = readSession();
  saveSession(null);
  if (!session) return;
  await fetch(`${BACKEND.url}/auth/v1/logout`, {
    method: 'POST',
    headers: { apikey: BACKEND.publishableKey, Authorization: `Bearer ${session.access}` },
  }).catch(() => {}); // logged out on this device anyway
}

// One request to the database as the logged-in teacher. If the ticket ran out
// (401), it gets a fresh one once and tries again.
async function request(path, options = {}, canRetry = true) {
  const session = readSession();
  if (!session) throw new Error('Please log in again.');
  const response = await fetch(`${BACKEND.url}${path}`, {
    ...options,
    headers: {
      apikey: BACKEND.publishableKey,
      Authorization: `Bearer ${session.access}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (response.status === 401 && canRetry) {
    try {
      await getTicket('refresh_token', { refresh_token: session.refresh });
    } catch {
      saveSession(null);
      throw new Error('Please log in again.');
    }
    return request(path, options, false);
  }
  if (!response.ok) throw new Error(`The database answered ${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

const PAGE = 1000; // Supabase sends at most 1000 rows per request

// Every child's log, as one "file" per child (the same shape as an imported file).
export async function fetchChildren() {
  const rows = [];
  for (let offset = 0; ; offset += PAGE) {
    const page = await request(`/rest/v1/log_entries?select=*&order=time.asc,id.asc&offset=${offset}&limit=${PAGE}`);
    rows.push(...page);
    if (page.length < PAGE) break;
  }
  return groupByCode(rows.map(fromRow));
}

export async function fetchTags() {
  return tagsByCode(await request('/rest/v1/teacher_tags?select=code,tag'));
}

const eq = (value) => `eq.${encodeURIComponent(value)}`;

export function addTag(code, tag) {
  return request('/rest/v1/teacher_tags', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify([{ code, tag }]),
  });
}

export function removeTag(code, tag) {
  return request(`/rest/v1/teacher_tags?code=${eq(code)}&tag=${eq(tag)}`, { method: 'DELETE' });
}

// Privacy: deletes everything stored for one explorer code (log + tags).
export async function deleteChild(code) {
  await request(`/rest/v1/log_entries?code=${eq(code)}`, { method: 'DELETE' });
  await request(`/rest/v1/teacher_tags?code=${eq(code)}`, { method: 'DELETE' });
}
