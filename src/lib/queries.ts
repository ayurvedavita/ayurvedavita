import "server-only";
import { prisma } from "./prisma";
import { activeBookingsWhere, currentPriceCents, isEarlyBird, seatsTaken } from "./booking";

const sessionInclude = () => ({
  event: true,
  bookings: { where: activeBookingsWhere(), select: { seats: true } },
});

type RawSession = Awaited<ReturnType<typeof loadSessions>>[number];

function loadSessions(where: object, take?: number) {
  return prisma.session.findMany({
    where,
    include: sessionInclude(),
    orderBy: { startsAt: "asc" },
    take,
  });
}

function decorate(s: RawSession) {
  const { bookings, ...rest } = s;
  return {
    ...rest,
    spotsLeft: Math.max(0, s.capacity - seatsTaken(bookings)),
    price: currentPriceCents(s),
    earlyBird: isEarlyBird(s),
  };
}

export type SessionView = ReturnType<typeof decorate>;

export async function getUpcomingSessions(opts: { eventId?: string; kind?: string; take?: number } = {}) {
  const sessions = await loadSessions(
    {
      startsAt: { gt: new Date() },
      eventId: opts.eventId,
      event: { published: true, ...(opts.kind ? { kind: opts.kind } : {}) },
    },
    opts.take,
  );
  return sessions.map(decorate);
}

/** The next bookable date of each event, soonest first. */
export async function getNextDatePerEvent() {
  const sessions = await getUpcomingSessions();
  const seen = new Set<string>();
  return sessions.filter((s) => {
    if (s.spotsLeft === 0 || seen.has(s.eventId)) return false;
    seen.add(s.eventId);
    return true;
  });
}

export async function getSession(id: string) {
  const s = await prisma.session.findUnique({ where: { id }, include: sessionInclude() });
  return s ? decorate(s) : null;
}

export async function getEvents(kind?: string) {
  const events = await prisma.event.findMany({
    where: { published: true, ...(kind ? { kind } : {}) },
    include: { sessions: { where: { startsAt: { gt: new Date() } }, orderBy: { startsAt: "asc" }, take: 1 } },
    orderBy: { createdAt: "asc" },
  });
  return events.map(({ sessions, ...e }) => ({ ...e, nextSession: sessions[0] ?? null }));
}

export function getEventBySlug(slug: string) {
  return prisma.event.findFirst({ where: { slug, published: true } });
}
