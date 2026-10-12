import Link from "next/link";
import { notFound } from "next/navigation";
import { addManualBooking, deleteSession, setBookingStatus, updateSession } from "@/app/admin/actions";
import { activeBookingsWhere, seatsTaken, STATUS_LABELS } from "@/lib/booking";
import { formatDateRange, formatMoney, toZurichInput } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

function StatusButton({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={setBookingStatus} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className="underline text-xs mr-3">{label}</button>
    </form>
  );
}

export default async function AdminSessionPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { saved } = await searchParams;
  const session = await prisma.session.findUnique({
    where: { id },
    include: { event: true, bookings: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) notFound();
  const active = await prisma.booking.findMany({ where: { sessionId: id, ...activeBookingsWhere() }, select: { seats: true } });
  const taken = seatsTaken(active);
  const toCollect = session.bookings.filter((b) => b.status === "CONFIRMED").reduce((s, b) => s + b.amountCents, 0);
  const paid = session.bookings.filter((b) => b.status === "PAID").reduce((s, b) => s + b.amountCents, 0);

  return (
    <div className="space-y-8">
      <Link href={`/admin/events/${session.eventId}`} className="text-sm underline text-muted">
        ‹ {session.event.title}
      </Link>
      <div>
        <h1 className="text-3xl">{session.event.title}</h1>
        <p className="text-muted mt-1">{formatDateRange(session.startsAt, session.endsAt)}</p>
      </div>

      <section className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm text-muted">Places booked</p>
          <p className="text-2xl font-semibold">
            {taken} / {session.capacity}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted">Paid</p>
          <p className="text-2xl font-semibold">{formatMoney(paid, session.currency)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted">To collect on site</p>
          <p className="text-2xl font-semibold">{formatMoney(toCollect, session.currency)}</p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Participants</h2>
          <a href={`/admin/sessions/${id}/participants.csv`} className="btn btn-ghost text-sm">
            Download list (Excel)
          </a>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted">
              <tr>
                <th className="p-3 font-normal">Name</th>
                <th className="p-3 font-normal">Contact</th>
                <th className="p-3 font-normal">Places</th>
                <th className="p-3 font-normal">Payment</th>
                <th className="p-3 font-normal" />
              </tr>
            </thead>
            <tbody>
              {session.bookings.map((b) => (
                <tr key={b.id} className={`border-t border-line align-top ${b.status === "CANCELLED" ? "opacity-45" : ""}`}>
                  <td className="p-3">
                    <p className="font-semibold">{b.name}</p>
                    {b.message && <p className="text-muted text-xs mt-1">“{b.message}”</p>}
                  </td>
                  <td className="p-3">
                    <a href={`mailto:${b.email}`} className="underline">
                      {b.email}
                    </a>
                    {b.phone && <p className="text-muted">{b.phone}</p>}
                  </td>
                  <td className="p-3">{b.seats}</td>
                  <td className="p-3">
                    <p>{formatMoney(b.amountCents, b.currency)}</p>
                    <p className="text-xs text-muted">
                      {STATUS_LABELS[b.status]} · {b.paymentMethod === "ONLINE" ? "online" : "on site"}
                    </p>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {b.status === "CONFIRMED" && <StatusButton id={b.id} status="PAID" label="Mark paid" />}
                    {b.status !== "CANCELLED" && <StatusButton id={b.id} status="CANCELLED" label="Cancel" />}
                    {b.status === "CANCELLED" && <StatusButton id={b.id} status="CONFIRMED" label="Restore" />}
                  </td>
                </tr>
              ))}
              {session.bookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-3 text-muted">
                    No bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-2">
          Cancelling an online payment here does not refund it: refund it in the Stripe dashboard.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Add a participant (phone, WhatsApp...)</h2>
        <form action={addManualBooking} className="card p-6 grid gap-4 md:grid-cols-5 items-end">
          <input type="hidden" name="sessionId" value={id} />
          <div>
            <label className="label">Name *</label>
            <input name="name" required className="field" />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" className="field" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input name="phone" className="field" />
          </div>
          <div>
            <label className="label">Places</label>
            <input name="seats" type="number" min={1} defaultValue={1} className="field" />
          </div>
          <label className="flex items-center gap-2 pb-2">
            <input type="checkbox" name="paid" /> Already paid
          </label>
          <div className="md:col-span-5 flex justify-end">
            <button className="btn">Add</button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Edit this slot</h2>
        {saved && <p className="card p-3 mb-3 text-sm">Saved.</p>}
        <form action={updateSession} className="card p-6 grid gap-4 md:grid-cols-4">
          <input type="hidden" name="id" value={id} />
          <div>
            <label className="label">Starts</label>
            <input type="datetime-local" name="startsAt" required defaultValue={toZurichInput(session.startsAt)} className="field" />
          </div>
          <div>
            <label className="label">Ends</label>
            <input type="datetime-local" name="endsAt" defaultValue={session.endsAt ? toZurichInput(session.endsAt) : ""} className="field" />
          </div>
          <div>
            <label className="label">Places</label>
            <input type="number" name="capacity" min={1} defaultValue={session.capacity} className="field" />
          </div>
          <div>
            <label className="label">Price (CHF)</label>
            <input name="price" defaultValue={session.priceCents / 100} className="field" />
          </div>
          <div>
            <label className="label">Early bird price</label>
            <input name="earlyPrice" defaultValue={session.earlyPriceCents != null ? session.earlyPriceCents / 100 : ""} className="field" />
          </div>
          <div>
            <label className="label">Early bird until</label>
            <input type="date" name="earlyUntil" defaultValue={session.earlyUntil ? toZurichInput(session.earlyUntil).slice(0, 10) : ""} className="field" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Internal note</label>
            <input name="note" defaultValue={session.note ?? ""} className="field" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="allowOnline" defaultChecked={session.allowOnline} /> Online payment
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="allowOnSite" defaultChecked={session.allowOnSite} /> Pay on site
          </label>
          <div className="md:col-span-4 flex justify-end">
            <button className="btn">Save</button>
          </div>
        </form>
        <form action={deleteSession} className="mt-4 text-right">
          <input type="hidden" name="id" value={id} />
          <button className="text-sm text-red-700 underline">Delete this slot</button>
        </form>
      </section>
    </div>
  );
}
