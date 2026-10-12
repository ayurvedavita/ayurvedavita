import Link from "next/link";
import { notFound } from "next/navigation";
import { createSessions, deleteEvent } from "@/app/admin/actions";
import { EventForm } from "@/components/admin/EventForm";
import { activeBookingsWhere, seatsTaken } from "@/lib/booking";
import { daysAgo, formatDate, formatMoney, formatTime, zurichDayKey } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ added?: string }> };

export default async function AdminEventPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { added } = await searchParams;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      sessions: {
        where: { startsAt: { gt: daysAgo(30) } },
        include: { bookings: { where: activeBookingsWhere(), select: { seats: true } } },
        orderBy: { startsAt: "asc" },
      },
    },
  });
  if (!event) notFound();
  const last = event.sessions.at(-1);

  return (
    <div className="space-y-8">
      <Link href="/admin/events" className="text-sm underline text-muted">
        ‹ All events
      </Link>
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-3xl flex-1">{event.title}</h1>
        <Link href={`/events/${event.slug}`} className="btn btn-ghost">
          View page ↗
        </Link>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Slots</h2>
        {added && <p className="card p-3 mb-3 text-sm">{added} slot(s) added.</p>}
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted">
              <tr>
                <th className="p-3 font-normal">Date</th>
                <th className="p-3 font-normal">Price</th>
                <th className="p-3 font-normal">Booked</th>
                <th className="p-3 font-normal" />
              </tr>
            </thead>
            <tbody>
              {event.sessions.map((s) => (
                <tr key={s.id} className={`border-t border-line ${s.startsAt < new Date() ? "opacity-50" : ""}`}>
                  <td className="p-3">
                    {formatDate(s.startsAt)} · {formatTime(s.startsAt)}
                    {s.note && <span className="text-muted"> · {s.note}</span>}
                  </td>
                  <td className="p-3">
                    {formatMoney(s.priceCents, s.currency)}
                    {s.earlyPriceCents != null && <span className="text-muted"> (early {formatMoney(s.earlyPriceCents)})</span>}
                  </td>
                  <td className="p-3 tabular-nums">
                    {seatsTaken(s.bookings)} / {s.capacity}
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/sessions/${s.id}`} className="underline">
                      Participants
                    </Link>
                  </td>
                </tr>
              ))}
              {event.sessions.length === 0 && (
                <tr>
                  <td className="p-3 text-muted" colSpan={4}>
                    No slots yet. Add some below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Add slots</h2>
        <form action={createSessions} className="card p-6 grid gap-4 md:grid-cols-4">
          <input type="hidden" name="eventId" value={event.id} />
          <div>
            <label className="label">Date *</label>
            <input type="date" name="date" required className="field" defaultValue={zurichDayKey(new Date())} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Start time(s) *, separated by commas</label>
            <input name="times" required className="field" placeholder="10:00, 11:30, 14:00" />
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <input type="number" name="duration" min={15} step={15} defaultValue={60} className="field" />
          </div>
          <div>
            <label className="label">Repeat every week, for</label>
            <select name="weeks" className="field" defaultValue="1">
              {[1, 2, 3, 4, 6, 8, 12].map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "No repeat" : `${n} weeks`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Places per slot</label>
            <input type="number" name="capacity" min={1} defaultValue={last?.capacity ?? 1} className="field" />
          </div>
          <div>
            <label className="label">Price (CHF)</label>
            <input name="price" required defaultValue={last ? last.priceCents / 100 : ""} className="field" />
          </div>
          <div />
          <div>
            <label className="label">Early bird price (optional)</label>
            <input name="earlyPrice" className="field" />
          </div>
          <div>
            <label className="label">Early bird until</label>
            <input type="date" name="earlyUntil" className="field" />
          </div>
          <div>
            <label className="label">Several days? Last day</label>
            <input type="date" name="endDate" className="field" />
          </div>
          <div>
            <label className="label">Ends at (last day)</label>
            <input type="time" name="endTime" className="field" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Internal note</label>
            <input name="note" className="field" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="allowOnline" defaultChecked /> Online payment
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="allowOnSite" defaultChecked /> Pay on site
          </label>
          <div className="md:col-span-4 flex justify-end">
            <button className="btn">Add slots</button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Event details</h2>
        <EventForm event={event} />
        <form action={deleteEvent} className="mt-4 text-right">
          <input type="hidden" name="id" value={event.id} />
          <button className="text-sm text-red-700 underline">Delete this event</button>
        </form>
      </section>
    </div>
  );
}
