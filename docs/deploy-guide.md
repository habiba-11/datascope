# Putting DataScope online: a beginner's guide (Part 36)

*For Habiba. Updated 4 Nov 2026: Prof confirmed, the ethics check agreed, the database is on, and Claude has already pushed the code. What is left for you is switching on GitHub Pages (about 5 minutes).*

## What "deploying" means

Today DataScope runs only on your laptop (Live Server). **Deploying** means GitHub's computers keep a copy of the same files and show them at a public link:

**https://habiba-11.github.io/datascope/**

This is **GitHub Pages**: free hosting for a repository's files. There is no server and nothing to install. The page is the same HTML, CSS and JavaScript you already have.

After it is set up, updating is just: change, test, commit, **push**. The site updates by itself 1 to 2 minutes later.

## What is already done for you

- **Everything is online.** The database is switched on (`js/config.js`): children's work goes to Supabase by itself, and the teacher logs in with the email and password stored in the database. There are no files to save or import any more.
- The browser still keeps each answer for a moment, until it has been sent. So if the school Wi-Fi drops, nothing is lost: it is sent when the internet is back.
- The fonts and Chart.js are stored inside the project (`assets/fonts/`, `js/vendor/`), so pages never wait for other websites.
- The teacher PIN is unchanged, stored only as a hash. It is only asked when the database is switched off, so online it is never used.
- `.nojekyll` tells GitHub Pages to show the files exactly as they are.
- A test checks that every file the site needs exists with exactly the right spelling. Your laptop (Windows) does not mind capital letters; GitHub's computers (Linux) do.
- The code is **pushed** to github.com/habiba-11/datascope.

## Step 1: switch on GitHub Pages (once only, in the browser)

1. Open **github.com/habiba-11/datascope** and log in.
2. Click **Settings** (the ⚙️ tab at the top of the repository).
3. In the left menu, click **Pages**.
4. Under **Build and deployment**, **Source**: choose **Deploy from a branch**.
5. **Branch**: choose **main**, and the folder **/ (root)**. Click **Save**.
6. Wait 1 to 2 minutes. Refresh the page: at the top it says **"Your site is live at https://habiba-11.github.io/datascope/"**.

(You can watch it build in the **Actions** tab: a yellow dot while it builds, a green ✓ when it is done.)

## Step 2: test the live link

Open **https://habiba-11.github.io/datascope/**, use a made-up code like `TEST-40`, and check:

- [ ] The start page shows the right fonts, and the tutorial plays.
- [ ] The code goes into Question Studio, and the line at the bottom says "☁️ Saved online" after an answer.
- [ ] Graph Lab shows charts.
- [ ] It works on a tablet or phone too (same link).
- [ ] 🧑‍🏫 Teacher's view → log in with the teacher email and password → 🔄 Refresh: `TEST-40` is in 👧 Children.

Then tell Claude what you saw. Before the pilot, delete the TEST- codes (`docs/backend-setup-guide.md`, Step 11).

## Updating the site later

1. Change and test on your laptop (Live Server, `npm test`).
2. `npm run deploy-check` (it runs the tests and lists anything that is not ready).
3. `git add .` → `git commit -m "..."` → `git push`
4. 1 to 2 minutes later the site is updated. If your browser still shows the old version, press **Ctrl + Shift + R**.

**During the pilot:** only fix real bugs, and note the date and commit of every change, so the thesis data stays comparable. Never rename a field in the reasoning log: add new ones instead.

**Supabase:** free projects pause after about a week without use (setup guide, Step 10). Open the Supabase dashboard before each school session.

## If something goes wrong

| What you see | What it means | What to do |
|---|---|---|
| "404 There isn't a GitHub Pages site here" | Pages is not switched on yet, or still building | Wait 2 minutes; check Settings → Pages (Step 1) |
| The page loads but looks plain, with no colours | A stylesheet was not found | Tell Claude; the deploy test should catch this before a push |
| "⚠️ Not sent yet" stays at the bottom of a room | The database did not answer | Open the Supabase dashboard: is the project paused? Restore it |
| The teacher login says the email or password is wrong | It is not an account in the `teachers` table | Setup guide, Steps 7 and 8 |
| Old version after a change | The browser kept the old files | Ctrl + Shift + R |

## Safety, in one list

- The website contains no secret key and no password (a test checks this). The publishable key is meant to be public: the database rules decide what it may do.
- Checked on 4 Nov 2026: without a login, the database returns nothing when asked for children's work, and nobody can sign up as a teacher by themselves.
- Everything in the repository is public, including the docs. Never write names, passwords or the teacher login in it.
