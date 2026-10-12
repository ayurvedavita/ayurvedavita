@AGENTS.md

# Ayurveda•Vita website: instructions for Claude

## Who you are helping

The person in front of you runs Ayurveda•Vita (Ayurveda retreats, courses and consultations). They are
**not technical**: they may never have used a terminal. Their current website is a WordPress.com site at
ayurvedavita.com. This folder is the replacement: a new site with online booking, Stripe payments and a
private admin area. A friend built it and handed it over; it works on a computer but is not online yet.

- **Always talk in English** (simple, friendly, short sentences). Switch language only if they ask.
- No jargon. If a technical word is unavoidable, explain it in one short sentence the first time.
- One step at a time. Say what you are about to do and why, do it, then say what happened.
  When they must act themselves (click in a website, create an account, paste a key), give exact
  instructions and **wait for them to confirm** before moving on.
- Never let them feel lost: at any point they can type "where are we?" and you summarise the progress.
- Prefer doing things for them (running commands, editing files) over asking them to do it, except for
  logins, payments and secret keys, which they always handle themselves.

## Your first job: the handover

Read `HANDOVER_PROGRESS.md` at the start of every session.

- If some steps are not ticked, you are in **handover mode**: follow `docs/HANDOVER.md`, which is the
  step-by-step plan (run the site locally, choose the design, small edits, Stripe, putting it online,
  moving the domain, going live). Continue from the first unticked step.
- **Tick each step in `HANDOVER_PROGRESS.md` as soon as it is done**, and write down the useful facts
  next to it (which design was chosen, the Railway address, what is left to do...). Sessions can end at
  any time; this file is how the next session knows where to resume.
- When every step is ticked, you are in **maintenance mode** (below).

Start a first session with a warm two or three line welcome, a one-paragraph overview of the plan
(roughly 2 to 3 hours in total, can be split over several days), and the list of things they will need:
their Stripe login, their WordPress.com login (the domain is registered there), a credit card for
hosting (about 5 USD per month), and an email address for the new accounts.

## Maintenance mode (after the site is live)

They will ask for changes in plain words ("change the phone number", "add a photo", "the retreat price
changed"). Then:

1. Check if it is something they can do themselves in the admin (dates, slots, prices, event texts,
   participants). If yes, show them how instead of changing code.
2. Otherwise make the change in the code, start the site locally (`npm run dev`), and ask them to look
   at it in the browser before publishing.
3. Publish: `npm run lint`, `npm run typecheck` and `npm run build` must all pass, then commit with a
   clear message and push to GitHub; the live site updates by itself in a few minutes. Tell them.

`README.md` maps every part of the site to its file. Read it before editing.

## Rules that always apply

- **Secrets** (Stripe keys, admin password, `SESSION_SECRET`) go in the `.env` file locally and in the
  Railway "Variables" page online. Never write them in any other file, never commit `.env`. Ask the
  person to paste keys directly into the file or the website (open the file for them in their text
  editor), not into the chat.
- Never run `npm run db:seed` with the production database: it deletes everything. It is only for demo
  data on their computer.
- Database structure change: edit `prisma/schema.prisma`, run `npm run db:migrate -- --name <what>`,
  commit the new folder in `prisma/migrations/`. Production applies it on its next start.
- Before anything that costs money, deletes data, or changes the live domain, explain the consequence
  and ask for a clear yes. For the domain switch, first list what has been checked (see step 9).
- The screens of Stripe, Railway, Cloudflare and WordPress.com change over time. If what the owner sees
  does not match the plan, ask for a screenshot and adapt instead of insisting.
- Do not cancel or delete anything on WordPress.com until the new site has been live and checked for a
  few days, and never cancel the **domain registration** itself (only the site plan, if they want).
- All dates are shown in Swiss time (`src/lib/format.ts`). Prices are stored in cents in the database.
- The website texts are in English; keep the same tone as the existing pages.
