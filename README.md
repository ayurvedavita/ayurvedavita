# Ayurveda•Vita

> New owner? Read `START_HERE.md` first. The step-by-step handover plan is in `docs/HANDOVER.md`.

Website of Ayurveda•Vita: retreats, courses and clinics, with online booking (pay online by card, or pay on site)
and a private admin area to add dates, see participants and follow the site statistics.

Stack: Next.js 16, Tailwind CSS 4, Prisma 7 with SQLite, Stripe Checkout.

## Run it locally

```bash
npm install
npm run setup               # creates .env and its SESSION_SECRET; then set ADMIN_EMAIL / ADMIN_PASSWORD
npm run db:migrate          # creates prisma/dev.db
npm run db:seed             # demo events, dates and bookings (local only, wipes the database)
npm run dev                 # http://localhost:3000
```

- Website: `/`, booking calendar: `/book`
- Admin: `/admin` (login = `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`)

## Where things are

| What | File |
|---|---|
| Contact details, footer, home slider, partners, menu | `src/lib/site.ts` |
| Colors and fonts of each design | `src/app/globals.css` |
| Home page | `src/app/(site)/page.tsx` |
| Retreat page content (program, team, location) | `src/content/international-ayurveda-retreat.tsx` |
| Other event pages | generic layout, text edited in the admin |
| Booking logic (seats, early bird price) | `src/lib/booking.ts`, `src/app/(site)/book/actions.ts` |
| Stripe | `src/lib/stripe.ts`, `src/app/api/stripe/webhook/route.ts` |
| Admin pages | `src/app/admin/` |
| Database schema | `prisma/schema.prisma` |
| Images | `public/images/` |

## Payments

- **Pay on site**: the booking is confirmed straight away; the admin marks it "paid" on the day.
- **Pay online**: Stripe Checkout. Needs `STRIPE_SECRET_KEY`. Without it, only "pay on site" is offered.
  The return page confirms the payment; the webhook (`/api/stripe/webhook`, event
  `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `checkout.session.expired`) is the
  safety net if the customer closes the tab. Refunds are done in the Stripe dashboard.
- An unpaid online booking holds its places for 35 minutes, then frees them.

## Prototype designs

Four designs share the same pages: `original` (copy of the WordPress site), `sable`, `terre`, `lumiere`.
The retreat program also has four layouts (buttons above it, in `src/content/RetreatProgram.tsx`).
Screenshots: `docs/designs/`. The cleanup once chosen is described in `docs/HANDOVER.md`, step 3.
A switcher at the bottom of the site, or `?theme=sable` in any URL, changes it.
Once one is chosen: set `DEFAULT_THEME` and `CHOOSING_DESIGN = false` in `src/lib/themes.ts`, and
`CHOSEN_LAYOUT` in `src/content/RetreatProgram.tsx`.

## Deploy (Railway)

1. New Railway project from the GitHub repo.
2. Add a **volume** mounted on `/data` (the SQLite database lives there).
3. Variables: `DATABASE_URL=file:/data/prod.db`, `SITE_URL=https://<domain>`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
   `SESSION_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
4. Build command `npm run build`, start command `npm start`. On start it applies database migrations, and on
   a brand new empty database it creates the real events (`prisma/starter.mjs`, no dates: add them in the admin).
5. Custom domain in Railway settings, then a CNAME at the domain registrar.
6. Stripe dashboard > Developers > Webhooks: add `https://<domain>/api/stripe/webhook` with the 3 events above,
   copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

Never run `npm run db:seed` against the production database: it deletes everything.
Online, `ADMIN_PASSWORD` must be 10+ characters (the admin refuses `change-me` or shorter passwords).

## Backups

Admin > "Download backup" gives a full copy of the SQLite database (`/admin/backup`). To restore, stop the
service and replace the database file on the volume (`/data/prod.db`) with the backup.
