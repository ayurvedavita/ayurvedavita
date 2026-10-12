// Demo data for local development. Wipes the database first: never run it against production.
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { fromZurichInput, zurichDayKey } from "../src/lib/format";

if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed in production");

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }) });
const z = fromZurichInput;

async function main() {
  await prisma.booking.deleteMany();
  await prisma.session.deleteMany();
  await prisma.event.deleteMany();
  await prisma.pageView.deleteMany();

  const retreat = await prisma.event.create({
    data: {
      slug: "international-ayurveda-retreat",
      title: "International Ayurveda Retreat",
      kind: "RETREAT",
      subtitle: "Ayurveda and its 6 instruments, Yoga, Diet & Cooking, Mind-skill",
      summary: "4 days in the Swiss mountains to discover the 6 instruments of deep healing.",
      imageUrl: "/images/lotus.jpg",
      location: "Lindenhof, Churwalden, Switzerland",
    },
  });
  await prisma.session.create({
    data: {
      eventId: retreat.id,
      startsAt: z("2027-09-01T13:00"),
      endsAt: z("2027-09-04T15:00"),
      capacity: 20,
      priceCents: 140000,
      earlyPriceCents: 120000,
      earlyUntil: z("2027-08-18T23:59"),
      note: "Demo dates (2027 edition)",
    },
  });

  const childbirth = await prisma.event.create({
    data: {
      slug: "natural-childbirth",
      title: "Natural Childbirth",
      kind: "COURSE",
      summary: "An Ayurvedic approach to pregnancy and birth.",
      description:
        "A gentle course to prepare body and mind for birth with the wisdom of Ayurveda.\n\nDiet, daily routine, breathing and simple home remedies for each trimester.",
      imageUrl: "/images/natural-childbirth.jpg",
      location: "Churwalden, Switzerland",
    },
  });
  for (const day of ["2026-10-24", "2026-11-21"]) {
    await prisma.session.create({
      data: {
        eventId: childbirth.id,
        startsAt: z(`${day}T10:00`),
        endsAt: z(`${day}T16:00`),
        capacity: 8,
        priceCents: 18000,
      },
    });
  }

  const consultation = await prisma.event.create({
    data: {
      slug: "ayurvedic-consultation",
      title: "Ayurvedic Consultation",
      kind: "CLINIC",
      summary: "One hour, one to one: pulse reading, your dosha and a personal plan.",
      description:
        "A private consultation to understand your constitution (dosha) and your current imbalances.\n\nYou leave with practical advice on food, daily routine and herbal remedies.",
      imageUrl: "/images/meditation.jpg",
      location: "Churwalden, Switzerland",
    },
  });
  const clinicDays = ["2026-10-06", "2026-10-08", "2026-10-13", "2026-10-15", "2026-10-20", "2026-10-22", "2026-11-03", "2026-11-05"];
  for (const day of clinicDays) {
    for (const time of ["10:00", "11:30", "14:00"]) {
      const start = z(`${day}T${time}`);
      await prisma.session.create({
        data: {
          eventId: consultation.id,
          startsAt: start,
          endsAt: new Date(start.getTime() + 60 * 60_000),
          capacity: 1,
          priceCents: 12000,
        },
      });
    }
  }

  const cooking = await prisma.event.create({
    data: {
      slug: "ayurvedic-cooking-class",
      title: "Ayurvedic Cooking Class",
      kind: "CLINIC",
      summary: "Cook a full sattvic meal together, then share it.",
      description: "Spices, seasons and doshas: learn three recipes you will cook again at home.",
      imageUrl: "/images/meal.jpg",
      location: "Churwalden, Switzerland",
    },
  });
  for (const day of ["2026-10-10", "2026-10-31", "2026-11-14"]) {
    await prisma.session.create({
      data: { eventId: cooking.id, startsAt: z(`${day}T17:00`), endsAt: z(`${day}T20:30`), capacity: 10, priceCents: 9500 },
    });
  }

  // A few bookings so the admin has something to show.
  const sessions = await prisma.session.findMany({ orderBy: { startsAt: "asc" } });
  const people = [
    ["Giulia Rossi", "giulia@example.com", "ONLINE", "PAID"],
    ["Anna Keller", "anna@example.com", "ON_SITE", "CONFIRMED"],
    ["Marco Bianchi", "marco@example.com", "ONLINE", "PAID"],
    ["Sophie Meier", "sophie@example.com", "ON_SITE", "CONFIRMED"],
    ["Lena Huber", "lena@example.com", "ON_SITE", "CANCELLED"],
  ] as const;
  for (const [i, [name, email, paymentMethod, status]] of people.entries()) {
    const session = sessions[(i * 7) % sessions.length];
    const seats = session.capacity > 1 ? 1 + (i % 2) : 1;
    await prisma.booking.create({
      data: {
        sessionId: session.id,
        name,
        email,
        seats,
        paymentMethod,
        status,
        amountCents: session.priceCents * seats,
        paidAt: status === "PAID" ? new Date() : null,
        createdAt: new Date(Date.now() - i * 2 * 86_400_000),
      },
    });
  }

  // 30 days of fake traffic.
  const paths = ["/", "/book", "/events/international-ayurveda-retreat", "/courses", "/about"];
  for (let d = 0; d < 30; d++) {
    const day = zurichDayKey(new Date(Date.now() - d * 86_400_000));
    for (const [i, path] of paths.entries()) {
      const count = Math.round((40 - i * 7) * (0.6 + Math.random() * 0.8));
      await prisma.pageView.create({ data: { path, day, count } });
    }
  }

  console.log(`Seeded ${await prisma.event.count()} events, ${sessions.length} sessions.`);
}

main().finally(() => prisma.$disconnect());
