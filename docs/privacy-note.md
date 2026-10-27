# DataScope privacy note (online database, Part 22)

*Draft for Habiba's thesis and for Prof / the GIU ethics self-assessment. Parts marked **[TO DECIDE]** are not decided yet: fill them in with Prof and the school. Nothing in this note means approval has been given.*

Status: **testing only.** Until Prof and the ethics check agree, only made-up codes (TEST-01 ...) and DEMO data are used.

## 1. What is stored

| Data | Example | Where |
|------|---------|-------|
| Anonymous explorer code | `OWL-07` | every log entry |
| Reasoning-log moments: type, room, time | "prediction in Number Lab at 09:14" | `log_entries` |
| What the child chose or typed in the tasks | a guess (8), a reason ("the 3 pulls it down"), a claim | `log_entries.details` |
| Which synthetic scenario and seed the child saw | `sleep-hours`, seed 5 | `log_entries` |
| The teacher's misconception tags on a code | `median-no-order` | `teacher_tags` |
| The teacher's login (email + password hash) | managed by Supabase Auth | Supabase |

**Not stored:** children's names, emails, photos, birthdays, school or class names. The code rule (letters + at least one digit, 3 to 10 characters) is checked by the app *and* by the database, so a plain name cannot be used as a code.

**One honest risk:** children type free text (reasons, claims). A child *could* type a name there. The teacher should remind children not to, and can delete a child's data (section 5).

The survey data children work with is **synthetic** (a made-up class). No real classmate's answers are collected.

## 2. Why it is stored

- So the teacher can see each child's reasoning and give feedback (teacher dashboard).
- As research data for the thesis (how children's reasoning changes), analysed under the anonymous code only.

## 3. Where it is stored

- **Supabase** (PostgreSQL database service), project region: **[TO FILL IN: the region chosen in the setup guide, Step 2, e.g. Central EU (Frankfurt)]**.
- The child's own browser also keeps a copy (localStorage) until it is sent, and afterwards, until the device is cleared (teacher view: "Clear children's work on THIS device").
- Supabase, as the service provider, may keep its own short technical logs (for example of requests). See Supabase's privacy policy; **[TO CHECK with Prof whether this needs mentioning in the consent text]**.

## 4. Who can see it

- **Children** (website without login, publishable key): may only **add** their own log entries. They cannot read anyone's data, not even their own, from the database. This is enforced by the database's row-level security (`backend/schema.sql`), not just by the website.
- **The teacher:** only accounts that Habiba creates *and* lists in the `teachers` table can read or delete. Public sign-up is switched off.
- **Habiba (researcher):** through the teacher account and the Supabase dashboard.
- The secret key and the database password are never in the website or on GitHub.

## 5. Deleting data

- **One child:** teacher dashboard → open the child → "🗑️ Delete all of CODE's data" (two taps). This deletes the log entries and tags for that code.
- **Test data before the pilot:** see setup guide, Step 11.
- **Everything after the study:** delete the Supabase project (Project Settings → General → Delete project).
- **How long data is kept:** **[TO DECIDE, e.g. until the thesis is graded, then deleted]**.

## 6. Consent and codes

- **Consent wording** for parents/children and the school: **[TO DECIDE with Prof and the school]**.
- Codes are handed out by the teacher. Only the teacher knows which child has which code. That list stays with the teacher, **never** in DataScope or the database.

## 7. If the internet or the database is down

The work is saved in the browser first and sent later (with retry and no duplicates), so a dropped connection loses nothing. With the database switched off (`js/config.js`), DataScope works fully on the device, and files are the fallback.
