# Putting DataScope online: a beginner's guide (Part 36)

*For Habiba. Written 3 Nov 2026, after "Prof confirmed". About 20 minutes the first time.*

## What "deploying" means

Today DataScope runs only on your laptop (Live Server). **Deploying** means GitHub's computers keep a copy of the same files and show them at a public link:

**https://habiba-11.github.io/datascope/**

This is **GitHub Pages**: free hosting for a repository's files. There is no server and nothing to install. The page is the same HTML, CSS and JavaScript you already have.

After it is set up, updating is just: change, test, commit, **push**. The site updates by itself 1 to 2 minutes later.

## What is already done for you (Part 36a)

- The fonts and Chart.js are stored inside the project (`assets/fonts/`, `js/vendor/`). Pages never wait for other websites, and they work on weak school Wi-Fi.
- The database is **switched off** (`js/config.js`): until Prof and the GIU ethics check say yes, children's work stays in their own browser, and "📤 Save my work" files are the way to collect it.
- The old teacher PIN is gone from the docs. You choose a new one in Step 1.
- `.nojekyll`: tells GitHub Pages to show the files exactly as they are.
- A test checks that every file the site needs exists with exactly the right spelling. Your laptop (Windows) does not mind capital letters; GitHub's computers (Linux) do.

## Step 1: choose a new teacher PIN (in the VS Code terminal)

The site is public, so anyone can read the code. The code holds only a "fingerprint" of the PIN, never the PIN itself. Make the PIN long, so it cannot be guessed from the fingerprint.

```powershell
npm run pin
```

1. Type a new PIN: **10 or more characters, not a word** (for example two words and a number joined with dashes). Press Enter.
2. It prints one line starting with `export const PIN_HASH = '...'`.
3. Open `js/helpers/pin.js`, replace the old `export const PIN_HASH = ...` line with the new one, and save.
4. Write the PIN somewhere safe (not in the project). It is not saved anywhere.

**You should see:** `npm test` still all green. On the start page, 🧑‍🏫 Teacher's view → the new PIN opens the dashboard and the old one does not.

## Step 2: run the deploy check

```powershell
npm run deploy-check
```

It runs all the tests and lists anything that should not go online.

**You should see:** only ✅ lines, then "Ready: you can push". If there is a ❌ line, do what it says and run it again. (Commit your PIN change first: `git add .` then `git commit -m "New teacher PIN"`.)

## Step 3: push (send your commits to GitHub)

```powershell
git push
```

This sends every commit on your laptop to github.com/habiba-11/datascope.

**You should see:** a few lines ending in `main -> main`. On github.com/habiba-11/datascope the newest commit is yours.

## Step 4: switch on GitHub Pages (once only, in the browser)

1. Open **github.com/habiba-11/datascope** and log in.
2. Click **Settings** (the ⚙️ tab at the top of the repository).
3. In the left menu, click **Pages**.
4. Under **Build and deployment**, **Source**: choose **Deploy from a branch**.
5. **Branch**: choose **main**, and the folder **/ (root)**. Click **Save**.
6. Wait 1 to 2 minutes. Refresh the page: at the top it says **"Your site is live at https://habiba-11.github.io/datascope/"**.

(You can watch it build in the **Actions** tab: a yellow dot while it builds, a green ✓ when it is done.)

## Step 5: test the live link

Open **https://habiba-11.github.io/datascope/** and tell me what you see. Then, together (Part 36c):

- [ ] The start page shows the right fonts, and the tutorial plays.
- [ ] A code like `TEST-36` goes into Question Studio.
- [ ] Graph Lab shows charts.
- [ ] It works on a tablet or phone too (same link).
- [ ] Teacher's view opens with the new PIN.

## Updating the site later

1. Change and test on your laptop (Live Server, `npm test`).
2. `npm run deploy-check`
3. `git add .` → `git commit -m "..."` → `git push`
4. 1 to 2 minutes later the site is updated. If your browser still shows the old version, press **Ctrl + Shift + R**.

**During the pilot:** only fix real bugs, and note the date and commit of every change, so the thesis data stays comparable.

## Switching the database on later (only after Prof and the ethics check say yes)

1. In `js/config.js`, set `enabled: true`.
2. `npm test`, `npm run deploy-check` (it will show "Database: ON"), commit, push.
3. The teacher then logs in with email and password (`docs/backend-setup-guide.md`), and children's work goes online by itself.
4. Remember: free Supabase projects pause after about a week without use (setup guide, Step 10).

## If something goes wrong

| What you see | What it means | What to do |
|---|---|---|
| "404 There isn't a GitHub Pages site here" | Pages is not switched on yet, or still building | Wait 2 minutes; check Settings → Pages (Step 4) |
| The page loads but looks plain, with no colours | A stylesheet was not found | Tell me; the deploy test should catch this before push |
| `git push` asks for a login | GitHub wants to know it is you | Log in in the window that opens (the same account as github.com) |
| `git push` says "rejected" | GitHub has commits your laptop does not | Tell me before doing anything else |
| Old version after a change | The browser kept the old files | Ctrl + Shift + R |

## Safety, in one list

- The website contains no secret key and no password (a test checks this).
- The teacher PIN is a speed bump, not real security; the real protection is the database login, which is off for now.
- Everything in the repository is public, including the docs. Never write names, PINs or passwords in it.
