import Link from "next/link";
import { STATUS_LABELS } from "@/lib/booking";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type Props = { searchParams: Promise<{ q?: string; past?: string }> };

export default async function AdminBookings({ searchParams }: Props) {
  const { q, past } = await searchParams;
  const now = new Date();
  const bookings = await prisma.booking.findMany({
    where: {
      session: { startsAt: past ? { lte: now } : { gt: now } },
      ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {}),
    },
    include: { session: { include: { event: true } } },
    orderBy: { session: { startsAt: past ? "desc" : "asc" } },
    take: 300,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Bookings</h1>
      <form className="flex gap-3 flex-wrap items-center">
        <input name="q" defaultValue={q} placeholder="Search a name or email" className="field max-w-xs" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="past" defaultChecked={Boolean(past)} /> Past dates
        </label>
        <button className="btn">Search</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="p-3 font-normal">Date</th>
              <th className="p-3 font-normal">Event</th>
              <th className="p-3 font-normal">Name</th>
              <th className="p-3 font-normal">Places</th>
              <th className="p-3 font-normal">Amount</th>
              <th className="p-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className={`border-t border-line ${b.status === "CANCELLED" ? "opacity-45" : ""}`}>
                <td className="p-3 whitespace-nowrap">
                  {formatDate(b.session.startsAt)} {formatTime(b.session.startsAt)}
                </td>
                <td className="p-3">
                  <Link href={`/admin/sessions/${b.sessionId}`} className="underline">
                    {b.session.event.title}
                  </Link>
                </td>
                <td className="p-3">
                  {b.name}
                  <div className="text-muted text-xs">{b.email}</div>
                </td>
                <td className="p-3">{b.seats}</td>
                <td className="p-3">{formatMoney(b.amountCents, b.currency)}</td>
                <td className="p-3">{STATUS_LABELS[b.status]}</td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="p-3 text-muted">
                  Nothing found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
