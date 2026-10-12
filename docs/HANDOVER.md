# Handover plan: from this folder to the live website

This is the plan Claude follows with the site owner. Work through the steps in order, tick them in
`HANDOVER_PROGRESS.md`, and stop at each "Owner action" until the owner confirms.

The screens of Stripe, Railway, Cloudflare and WordPress.com change over time. The menu names below were
right when this was written (October 2026); if the owner sees something different, ask for a screenshot
and adapt, or search the service's help pages.

Facts checked when this folder was prepared (October 2026), verify them again when you get there:

- The current site ayurvedavita.com runs on **WordPress.com**. The domain is registered at WordPress.com
  (registrar: Automattic), its DNS uses the WordPress.com name servers, and it expires on 18 July 2027.
- The domain has **no email** attached (no MX records); their email is a Protonmail address. Changing
  the domain's DNS will not break any mailbox.
- The old booking buttons were WordPress.com payment buttons. The owner has a Stripe account.

---

## Step 1. Check the computer

1. Find out the operating system (macOS or Windows) and remember it for all later instructions.
2. Check `node -v` (needs 20.19 or newer, LTS recommended), `npm -v` and `git --version`.
3. **Owner action** if something is missing:
   - Node.js: download the "LTS" installer from https://nodejs.org and run it with default options.
   - Git (Windows only, macOS usually has it): https://git-scm.com/download/win, default options.
   - After installing, they must close the terminal, open it again in this folder and restart `claude`.

## Step 2. Run the site on this computer

1. `npm install` (takes a few minutes; explain that it downloads the building blocks of the site).
2. `npm run setup`: creates `.env` and fills `SESSION_SECRET` (it never prints the secret).
3. Ask which email they want to log into the admin with and set `ADMIN_EMAIL` in `.env`. For
   `ADMIN_PASSWORD`, open `.env` in their text editor (macOS: `open -e .env`, Windows: `notepad .env`;
   the file exists already, so Notepad will not rename it) and let them type a password themselves.
   It only protects the admin on their computer. Leave the Stripe lines empty for now.
4. Start a local history of the code (it lets you undo any change later):
   `git init -b main`, set their name and email with `git config user.name "..."` and
   `git config user.email "..."`, then `git add -A` and `git commit -m "New Ayurveda Vita website"`.
   `.env` and the local database are ignored by git on purpose.
5. `npm run db:migrate` then `npm run db:seed` (creates a local database filled with **demo** data).
6. Start `npm run dev` in the background and open http://localhost:3000 for them
   (macOS: `open <url>`, Windows: `start <url>`).
7. Give a short tour, one page at a time, asking them to click around:
   - Home page, then **Book** (calendar), pick a date and make a test booking with "Pay on site".
   - The retreat page (`/events/international-ayurveda-retreat`) with the program.
   - `http://localhost:3000/admin`: log in, the overview (statistics), "Events & slots" (adding dates),
     a slot's participant list (mark paid, cancel, add someone who booked by phone, download the list),
     and "Download backup" (a full copy of all events and bookings).
8. Explain clearly that the demo data is fake: the 2027 retreat dates, "Ayurvedic Consultation",
   "Ayurvedic Cooking Class", the bookings and the visit statistics. None of it goes online.

## Step 3. Choose the design

1. Show the four designs. Screenshots are in `docs/designs/` (open them for the owner), and on the
   running site a bar at the bottom switches design live:
   - **Original**: the look of the current WordPress site (dark green and gold).
   - **Sable**: light cream and dark green, calm and elegant, spa feeling.
   - **Terre**: warm terracotta, magazine style.
   - **Lumière**: white and modern, big mountain photo at the top.
2. Show the four layouts of the retreat **program** (buttons "Layout:" above the program on the retreat
   page, screenshots `docs/designs/program-*.jpg`): Tabs, 4 columns, Accordion,
   Morning / afternoon / evening.
3. Write both choices in `HANDOVER_PROGRESS.md`.
4. Apply the choice, two small edits:
   - `src/lib/themes.ts`: set `DEFAULT_THEME` to the chosen design (`"original"`, `"sable"`, `"terre"`
     or `"lumiere"`) and `CHOOSING_DESIGN` to `false`. The design bar disappears.
   - `src/content/RetreatProgram.tsx`: set `CHOSEN_LAYOUT` to `"tabs"`, `"columns"`, `"accordion"` or
     `"dayparts"`. The "Layout:" buttons disappear.
5. Check `npm run lint`, `npm run typecheck`, `npm run build`, then let them look at every page again.
   Commit ("Choose the <name> design").
6. Optional, only if they want a smaller code base later: delete the code of the unused designs. It
   touches many files (search for `theme` and `Theme` in `src`, the CSS blocks in `globals.css`, the
   fonts in `src/app/fonts.ts`, the unused layouts in `RetreatProgram.tsx`). Do it in small steps, with
   `npm run build` passing after each one. Not needed for the site to work.

## Step 4. Small edits (optional)

Ask if they want to change anything before going online. Typical places (see `README.md`):

- Contact details, opening hours, slider quotes, partners: `src/lib/site.ts`.
- About page: `src/app/(site)/about/page.tsx`. Retreat page texts: `src/content/international-ayurveda-retreat.tsx`.

Points to mention to them:

- A few typos of the old site were corrected ("Ayuvrveda", "Life Stile", "ayurvedic file", "quite mind",
  and the noon cooking classes now say "12. PM" instead of "12. AM").
- The retreat page lists health benefits (arthritis, depression, anxiety...). In Switzerland, health
  claims for non-medical offers are regulated; suggest they check the wording is acceptable. Do not add
  new medical claims.
- Images: put new photos in `public/images/` (they can drag them into the folder, you resize them).

Commit after each change they approve.

## Step 5. Stripe in test mode

1. **Owner action**: log in at https://dashboard.stripe.com. If the account was created through
   WordPress.com, it is still a normal Stripe account: same email, use "forgot password" if needed.
2. **Owner action**: switch to **Test mode** (newer accounts call it a "Sandbox"), go to Developers >
   API keys, copy the **Secret key** (starts with `sk_test_`), and paste it into `.env` after
   `STRIPE_SECRET_KEY=` (open the file for them). Check the line is filled without printing the key.
3. Restart the dev server. A booking now offers "Pay online now" next to "Pay on site".
4. Test a booking with "Pay online": card `4242 4242 4242 4242`, any future expiry date, any CVC, any
   name. After paying, the confirmation page must say "Paid", and the admin must show the booking as paid.
   The payment also appears in the Stripe dashboard (test mode).
5. **Owner action** in the Stripe settings (do it again later in live mode, settings are separate):
   - Payment methods: switch on what they want customers to use (cards are on; TWINT, Apple Pay,
     Google Pay are popular in Switzerland).
   - Customer emails: switch on receipts for "Successful payments", so customers who pay online get a
     receipt (search "customer emails" in the dashboard if the menu moved). The website itself sends no
     emails. Test mode does not send receipts.

## Step 6. Save the code on GitHub

GitHub keeps the code safe online, and the hosting reads it from there to publish the site.

1. **Owner action**: create a free account at https://github.com if they have none.
2. Install the GitHub command line tool `gh` (macOS: `brew install gh` if Homebrew exists, otherwise the
   installer from https://cli.github.com; Windows: `winget install --id GitHub.cli`).
3. **Owner action**: run `gh auth login` together (choose GitHub.com, HTTPS, login with a web browser).
4. `gh repo create ayurvedavita --private --source . --push`. The repository must stay **private**.

## Step 7. Put the site online on Railway

Railway hosts the site and its database.

1. **Owner action**: sign up at https://railway.com with "Login with GitHub" and choose the Hobby plan
   (5 USD per month, which includes 5 USD of usage; this small site should stay around that). Add a
   payment card, then set a **usage limit** in the workspace billing settings (for example 10 USD) so
   there is never a surprise bill.
2. **Owner action**: New Project > Deploy from GitHub repo > `ayurvedavita`. Guide them screen by screen.
3. **Owner action**: in the service, add a **Volume** with mount path `/data`. It is the hard disk that
   keeps the bookings; without it every booking is lost at each update.
4. **Owner action**: service > Variables, add:
   - `DATABASE_URL` = `file:/data/prod.db`
   - `ADMIN_EMAIL` = their email
   - `ADMIN_PASSWORD` = a strong password only they know, 10 characters or more (they type it; the admin
     refuses to work online with a shorter one or with the example `change-me`)
   - `SESSION_SECRET` = a new random value. Generate it with
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and let them copy it
     from the terminal (it is only used once, here; do not reuse the local one, do not save it anywhere)
   - `STRIPE_SECRET_KEY` = the `sk_test_` key for now
   - `SITE_URL` = filled in at point 5
5. **Owner action**: service > Settings > Networking > Generate Domain. It gives an address like
   `ayurvedavita-production.up.railway.app`. Set `SITE_URL` to `https://` + that address.
6. Railway builds with `npm run build` and starts with `npm start` by itself. The first start creates the
   database and two real events (International Ayurveda Retreat, Natural Childbirth) without dates.
   If the deploy fails, ask them to copy the error lines from the Railway deploy logs into the chat.
7. Open the Railway address together and log into `/admin`.
8. **Check that the volume works before entering real data**: add one test date, then in Railway click
   "Redeploy", wait until it is back, and check the date is still there. If it disappeared, the volume
   or `DATABASE_URL` is wrong: fix it before going further. Delete the test date afterwards.
9. Let them **add the real dates and prices** (Events & slots > the event > Add slots). Add the other
   events they offer (consultations, courses...) with "New event".
10. Test a booking with the 4242 test card on the Railway address.

## Step 8. Stripe webhook

Stripe uses the webhook to tell the site "this booking is paid" even if the customer closes the page.

1. **Owner action** (Stripe, test mode): Developers > Webhooks > Add endpoint (newer dashboards: add a
   "destination" of type webhook endpoint). URL: `https://<railway address>/api/stripe/webhook`.
   Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.expired`.
2. **Owner action**: copy the "Signing secret" (`whsec_...`) into Railway Variables as
   `STRIPE_WEBHOOK_SECRET`.
3. Make one more test payment and check the webhook shows a successful delivery in Stripe.

## Step 9. Move the domain to the new site

Before starting, list what is ready and ask the owner for a clear "yes, switch now": design chosen, real
dates entered, test payments working online, admin password set. From this moment visitors see the new
site instead of the WordPress one.

1. **Owner action**: in WordPress.com, open the domain's DNS records page ("Domains" in the sidebar, or
   Upgrades > Domains, then ayurvedavita.com > DNS records) and take a **screenshot of all the records**.
   It is the way back if anything goes wrong. Also check DNSSEC on that page: if it is on, it must be
   turned off before changing name servers.
2. **Owner action**: in Railway, service > Settings > Networking > Custom Domain: add `ayurvedavita.com`,
   then `www.ayurvedavita.com`. Railway shows the DNS records to create (a CNAME target, sometimes a TXT
   record for verification). Write them in `HANDOVER_PROGRESS.md`.
3. The domain without "www" needs a CNAME at the root, which many DNS providers cannot do. Recommended
   path, free and reliable: **use Cloudflare for the DNS**.
   - **Owner action**: create an account at https://cloudflare.com, "Add a site" `ayurvedavita.com`,
     Free plan. Cloudflare tries to copy the existing records: compare its list with the screenshot of
     point 1 and add anything missing.
   - **Owner action**: in Cloudflare DNS, delete the records pointing to WordPress (A records
     `192.0.78.x`, and the old `www` record), then add the records Railway asked for: CNAME `@` and
     CNAME `www` to the Railway target, plus the TXT if any. Set them to **DNS only** (grey cloud).
   - **Owner action**: in WordPress.com, on the domain page: Name servers > use custom name servers, and
     enter the two name servers Cloudflare shows.
   - Changes take from a few minutes to 48 hours. Check with a DNS lookup until the domain points to
     Railway, then Railway shows both domains as active with a secure (https) certificate. Both
     `ayurvedavita.com` and `www.ayurvedavita.com` show the site.
   If WordPress.com's own DNS page accepts exactly the records Railway asks for, that also works and
   Cloudflare is not needed.
4. Update Railway `SITE_URL` to `https://ayurvedavita.com`.
5. The old address `ayurvedavita.com/international-ayurveda-retreat` redirects to the new retreat page.

## Step 10. Real payments

1. **Owner action**: in Stripe, leave test mode. If Stripe asks to complete the account (business details,
   bank account for payouts), do it.
2. **Owner action**: copy the live Secret key (`sk_live_...`) into Railway `STRIPE_SECRET_KEY`.
3. **Owner action**: create the webhook again in **live** mode with
   `https://ayurvedavita.com/api/stripe/webhook` and the same three events, and put its new signing
   secret in Railway `STRIPE_WEBHOOK_SECRET`. Repeat the payment settings of step 5 in live mode.
4. Real test, done quickly so no visitor books it: in the admin, create a temporary event "Test" with one
   slot at 1 CHF, book it and pay with their own card, check it shows as paid in the admin, refund it in
   the Stripe dashboard, cancel the booking in the admin, then delete the slot and the event. Tell them
   the card is really charged and refunded; Stripe keeps its small fee (a few cents).

## Step 11. After going live

- Keep the WordPress.com site a few days, then they can cancel the WordPress.com **site plan**
  (Upgrades > Purchases). **Keep the domain registration and its auto-renewal**, otherwise the domain
  expires (18 July 2027). Moving the domain registration away from WordPress.com is optional.
- Backups: the admin has a "Download backup" link (a full copy of events and bookings). Suggest they
  download one regularly (for example every month and before each retreat) and keep it in a safe place.
  Railway volumes may also offer automatic backups depending on the plan: check and switch on if
  available. To restore a backup, ask Claude.
- Things the site does not do (yet), so they know: it sends no emails (Stripe receipts cover online
  payments; for "pay on site" the customer gets the confirmation page only), and images cannot be
  uploaded from the admin (ask Claude to add them).
- Explain maintenance mode: next time, open this folder, run `claude`, and ask for any change in plain
  words.
