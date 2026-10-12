import Link from "next/link";
import { activeBookingsWhere, seatsTaken, STATUS_LABELS } from "@/lib/booking";
import { formatDate, formatMoney, formatTime, zurichDayKey } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const DAY = 86_400_000;

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-3xl font-semibold mt-1 text-heading">{value}</p>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

export default async function AdminHome() {
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * DAY);
  const days = Array.from({ length: 30 }, (_, i) => zurichDayKey(new Date(now.getTime() - (29 - i) * DAY)));

  const [recentBookings, paidAgg, onSiteUpcoming, upcomingSessions, views, latest] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: since30 }, status: { not: "CANCELLED" } } }),
    prisma.booking.aggregate({ where: { status: "PAID", paidAt: { gte: since30 } }, _sum: { amountCents: true } }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED", session: { startsAt: { gt: now } } },
      _sum: { amountCents: true },
    }),
    prisma.session.findMany({
      where: { startsAt: { gt: now } },
      include: { event: true, bookings: { where: activeBookingsWhere(now), select: { seats: true } } },
      orderBy: { startsAt: "asc" },
    }),
    prisma.pageView.findMany({ where: { day: { gte: days[0] } } }),
    prisma.booking.findMany({
      include: { session: { include: { event: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const perDay = new Map(days.map((d) => [d, 0]));
  const perPath = new Map<string, number>();
  for (const v of views) {
    perDay.set(v.day, (perDay.get(v.day) ?? 0) + v.count);
    perPath.set(v.path, (perPath.get(v.path) ?? 0) + v.count);
  }
  const totalViews = [...perDay.values()].reduce((a, b) => a + b, 0);
  const maxDay = Math.max(1, ...perDay.values());
  const topPages = [...perPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const upcomingSeats = upcomingSessions.reduce((sum, s) => sum + seatsTaken(s.bookings), 0);
  const nextSessions = upcomingSessions.filter((s) => s.bookings.length > 0 || s.capacity > 1).slice(0, 8);

  return (
    <div className="space-y-10">
      <h1 className="text-3xl">Overview</h1>

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Tile label="Bookings (30 days)" value={String(recentBookings)} />
        <Tile label="Paid online (30 days)" value={formatMoney(paidAgg._sum.amountCents ?? 0)} />
        <Tile label="To collect on site" value={formatMoney(onSiteUpcoming._sum.amountCents ?? 0)} hint="upcoming dates" />
        <Tile label="Upcoming participants" value={String(upcomingSeats)} hint={`${upcomingSessions.length} upcoming slots`} />
        <Tile label="Site visits (30 days)" value={totalViews.toLocaleString("en-US")} />
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-semibold">Page views per day</h2>
        <p className="text-sm text-muted mb-4">Last 30 days, hover a bar for the number.</p>
        <div className="flex items-end gap-[2px] h-40 border-b border-line" role="img" aria-label="Page views per day">
          {[...perDay.entries()].map(([day, count]) => (
            <div key={day} className="group relative flex-1 h-full flex items-end">
              <div
                className="w-full rounded-t-[4px] bg-[#2f6b4f] group-hover:bg-[#133124]"
                style={{ height: `${(count / maxDay) * 100}%`, minHeight: count ? 2 : 0 }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-black/85 px-2 py-1 text-xs text-white">
                {day.slice(8)}.{day.slice(5, 7)}: {count}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>{days[0].slice(8)}.{days[0].slice(5, 7)}</span>
          <span>today</span>
        </div>
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="font-normal pb-2">Most viewed pages</th>
              <th className="font-normal pb-2 text-right">Views</th>
            </tr>
          </thead>
          <tbody>
            {topPages.map(([path, count]) => (
              <tr key={path} className="border-t border-line">
                <td className="py-1.5">{path}</td>
                <td className="py-1.5 text-right tabular-nums">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="card p-5">
          <h2 className="text-lg font-semibold mb-3">Next dates</h2>
          <table className="w-full text-sm">
            <tbody>
              {nextSessions.map((s) => {
                const taken = seatsTaken(s.bookings);
                return (
                  <tr key={s.id} className="border-t border-line">
                    <td className="py-2">
                      <Link href={`/admin/sessions/${s.id}`} className="underline">
                        {s.event.title}
                      </Link>
                      <div className="text-muted">
                        {formatDate(s.startsAt)} {formatTime(s.startsAt)}
                      </div>
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {taken} / {s.capacity}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-semibold mb-3">Latest bookings</h2>
          <table className="w-full text-sm">
            <tbody>
              {latest.map((b) => (
                <tr key={b.id} className="border-t border-line">
                  <td className="py-2">
                    <Link href={`/admin/sessions/${b.sessionId}`} className="underline">
                      {b.name}
                    </Link>
                    <div className="text-muted">
                      {b.session.event.title} · {formatDate(b.session.startsAt)}
                    </div>
                  </td>
                  <td className="py-2 text-right">
                    <div>{formatMoney(b.amountCents, b.currency)}</div>
                    <div className="text-muted text-xs">{STATUS_LABELS[b.status]}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
