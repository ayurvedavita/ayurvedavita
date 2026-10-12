// Creates the real events of the site on a brand new, empty database (first start in production).
// Does nothing once any event exists, so events deleted in the admin never come back.
// Dates and prices are added in the admin afterwards.
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL }) });

const events = [
  {
    // This exact slug shows the hand-written page in src/content/international-ayurveda-retreat.tsx
    slug: "international-ayurveda-retreat",
    title: "International Ayurveda Retreat",
    kind: "RETREAT",
    subtitle: "Ayurveda and its 6 instruments, Yoga, Diet & Cooking, Mind-skill",
    summary: "4 days in the Swiss mountains to discover the 6 instruments of deep healing.",
    imageUrl: "/images/lotus.jpg",
    location: "Lindenhof, Churwalden, Switzerland",
  },
  {
    slug: "natural-childbirth",
    title: "Natural Childbirth",
    kind: "COURSE",
    summary: "An Ayurvedic approach to pregnancy and birth.",
    imageUrl: "/images/natural-childbirth.jpg",
    location: "Switzerland",
  },
];

try {
  if ((await prisma.event.count()) === 0) {
    for (const data of events) await prisma.event.create({ data });
    console.log(`Starter content: created ${events.length} events.`);
  }
} finally {
  await prisma.$disconnect();
}
