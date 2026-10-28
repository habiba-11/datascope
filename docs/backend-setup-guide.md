# DataScope online database: beginner setup guide

This guide sets up everything **outside the code**: a free Supabase account, the database, and the teacher's login. You only do it once. It takes about **30 minutes**. You need a web browser and your GitHub account. No installing.

> **Ethics first.** Until Prof and the GIU ethics check say yes, use **made-up codes only** (TEST-01, TEST-02 ...) and the DEMO data. No real children.

---

## What you are building (in one picture)

```
Child's browser                      Supabase (online)                Teacher's browser
---------------                      -----------------                -----------------
saves every moment at once   ──►     log_entries table        ◄──     logs in with email + password
(localStorage), then sends it        (children may only ADD;          and reads every child's work
when the internet is there           only teachers may READ)          on the dashboard
```

- **Supabase** is a free online database service (a real PostgreSQL database).
- The website stays on GitHub Pages. Supabase only stores the data.
- Children never log in. They are recognised only by their anonymous explorer code.
- The teacher logs in with an email and password that **you** create. Nobody can sign up by themselves.

---

## Words you will meet

| Word | Meaning |
|------|---------|
| Project | One database inside your Supabase account. We make one called `datascope`. |
| SQL Editor | A page in Supabase where you paste database commands and press **Run**. |
| Table | Like a spreadsheet: rows and columns. |
| Row-level security (RLS) | Rules that say who may read or add which rows. Our script sets them. |
| Project URL | Your database's web address, like `https://abcdefgh.supabase.co`. |
| Publishable key | A public key (`sb_publishable_...`). It is safe in the website, because the rules limit it to "add entries". |
| Secret key | A powerful key (`sb_secret_...`). **Never** put it in the website or on GitHub. We do not need it. |
| Database password | Asked for when you create the project. Keep it in a password manager. The website never needs it. |

---

## Step 1: Create a Supabase account

1. Go to **https://supabase.com** and click **Start your project** (or **Sign in**).
2. Choose **Continue with GitHub** and allow it.
3. If it asks you to create an **organization**, give it a name (e.g. `Habiba GIU`), choose the **Free** plan, and click **Create**.

✅ **You should see:** your Supabase dashboard with a **New project** button.

## Step 2: Create the project

1. Click **New project**.
2. Fill in:
   - **Name:** `datascope`
   - **Database password:** click **Generate a password**, then **copy it into a password manager or a safe note**. You will probably never need it, but you can't see it again.
   - **Region:** pick the one closest to Egypt, e.g. **Central EU (Frankfurt)**. Write the region down; it goes in your privacy note (where the data is stored).
   - **Plan:** Free.
3. Click **Create new project** and wait about 2 minutes while it says "Setting up project".

✅ **You should see:** the project's home page with the name `datascope`.

## Step 3: Make the tables and the safety rules

1. In the left menu click **SQL Editor** (the icon looks like `>_`).
2. Click **New query** (or the **+**).
3. In VS Code open **`backend/schema.sql`**, select everything (**Ctrl + A**), copy (**Ctrl + C**).
4. Paste it into the Supabase editor (**Ctrl + V**) and click **Run** (or **Ctrl + Enter**).

✅ **You should see:** "Success. No rows returned".
✅ Then click **Table Editor** in the left menu: there are 3 tables, `log_entries`, `teacher_tags` and `teachers`, each with a small shield or "RLS enabled" label.

> If you see a red error, copy the message and send it to me. Running the script again is safe.

## Step 4: Stop strangers from signing up

The teacher account is the only key to the children's work, so nobody may create their own account.

1. Left menu: **Authentication**.
2. Open **Sign In / Providers** (in some versions it's under **Configuration** or **Settings**).
3. Turn **OFF** "Allow new users to sign up".
4. Leave the **Email** provider turned **ON** (the teacher logs in with email).
5. Click **Save** if there is a save button.

✅ **You should see:** "Allow new users to sign up" switched off.

## Step 5: Create the teacher's account

1. Still in **Authentication**, click **Users**.
2. Click **Add user**, then **Create new user**.
3. Type the teacher's **email** and a **strong password** (at least 12 characters). For testing you can use your own email.
4. Tick **Auto Confirm User** (so no confirmation email is needed).
5. Click **Create user**.

✅ **You should see:** the email in the users list.

## Step 6: Mark that account as a teacher

Having an account is not enough: the database only shows children's work to accounts in the `teachers` list.

1. Go back to **SQL Editor**, click **New query**, and paste this, **changing the email** to the one from Step 5:

```sql
insert into public.teachers (user_id, email)
select id, email from auth.users where email = 'teacher@example.com'
on conflict (user_id) do nothing;
```

2. Click **Run**. Supabase usually just says "Success. No rows returned", even when it worked, so check it:
3. Click **New query** again, paste this and click **Run**:

```sql
select * from public.teachers;
```

✅ **You should see:** one row with the teacher's email.
If the list is **empty**, the email does not match exactly: check spelling and capital letters, then run step 1 again. Running it twice is safe (the `on conflict` line stops a "duplicate key" error).

## Step 7: Copy the two values the website needs

1. Click the **Connect** button at the top of the project page, or go to **Project Settings** (gear icon) → **API Keys**.
2. Copy the **Project URL** (looks like `https://abcdefgh.supabase.co`).
   - If you only see it under **Project Settings → Data API**, copy it from there.
3. Copy the **Publishable key** (starts with `sb_publishable_`).
   - If your project only shows "anon / legacy" keys, look for a tab called **API Keys** (not "Legacy"), and create a publishable key there if asked.
   - **Do not copy the secret key.**

## Step 8: Put them in the website

1. In VS Code open **`js/config.js`**.
2. Fill it in like this (with **your** values):

```js
export const BACKEND = {
  enabled: true,
  url: 'https://abcdefgh.supabase.co',
  publishableKey: 'sb_publishable_xxxxxxxxxxxxxxxx',
};
```

3. Save the file (**Ctrl + S**).

> Is it OK that this key is on GitHub? **Yes, the publishable key only.** It is meant to be public: anyone could find it in the website anyway. The database rules from Step 3 decide what it may do (only *add* entries). The secret key and the database password must **never** be in the code.

## Step 9: Test it (made-up codes only)

1. Start **Live Server** and open the start page.
2. Type the code **`TEST-01`** and start. Do the Ask step (pick a question, fix the two questions, press Next).
3. Look at the sidebar under Pip: it should say **☁️ Saved online**.
   - **⏳ Sending...** means it is busy; wait a few seconds.
   - **📴 Offline** means no internet: the work is safe in the browser and will be sent later.
   - **⚠️ Not sent** means a setting is wrong: see "If something goes wrong".
4. In Supabase, open **Table Editor → log_entries**: you should see rows with code `TEST-01`.
5. On the start page click **🧑‍🏫 Teacher's view**, log in with the email and password from Step 5.

✅ **You should see:** TEST-01 in the dashboard, with the phases it finished.

## Step 10: Keep the project awake

Free Supabase projects **pause after about 7 days with almost no activity**. Nothing is deleted, but the app can't save or show data until you restore it.

- During the pilot, open the app or the teacher dashboard a few times a week.
- If it pauses: open the Supabase dashboard, open the project, click **Restore project**, and wait a few minutes.
- Before a class session, open the teacher dashboard once to make sure it is awake.

## Step 11: Before real children (only after Prof and ethics say yes)

1. Delete the test data. In **SQL Editor** run:

```sql
delete from public.log_entries where code like 'TEST-%' or code like 'OWL-%';
delete from public.teacher_tags where code like 'TEST-%' or code like 'OWL-%';
```

   (`OWL-07` is a made-up code used by the automatic screenshot tool.)

2. Hand out the real anonymous codes (never names).
3. In the teacher dashboard, make sure **Preview** is switched off on every child device.

---

## If something goes wrong

| What you see | What it means | What to do |
|---|---|---|
| ⚠️ Not sent, and the browser console (F12) says **401** or "Invalid API key" | The key is wrong or missing | Copy the **publishable** key again (Step 7) into `js/config.js` |
| Console says **403**, "permission denied for table log_entries" | The script from Step 3 did not run fully | Run `backend/schema.sql` again |
| Console says **400** with "violates check constraint" | That entry broke a rule (e.g. a code with no digit) | Use a code like `TEST-01`. The app skips that entry and keeps going |
| Teacher login: "Invalid login credentials" | Wrong email or password | Check them, or reset the password in Authentication → Users |
| Teacher is logged in but sees **no children** | The account is not in the `teachers` list | Do Step 6 again with the exact email |
| Nothing loads, the Supabase page says the project is **paused** | 7 days without activity | Step 10: Restore project |

When you send me an error, send the message from the browser console (**F12 → Console**) and the step number.

---

## For your thesis (what to write)

- **Where the data lives:** a Supabase (PostgreSQL) database in the region you chose in Step 2.
- **What is stored:** only the anonymous code and the reasoning-log moments (predictions, answers, reasons the child typed, timestamps). No names, no emails of children, no IP addresses saved by our tables.
- **Who can see it:** only the logged-in teacher account(s) listed in `teachers`. Children's browsers can only add entries, never read them.
- **Deleting a child's data:** the teacher can delete everything for one code from the dashboard.
- See also `docs/privacy-note.md`.
