import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/BookingForm";
import { formatDateRange, formatMoney } from "@/lib/format";
import { getSession } from "@/lib/queries";
import { stripeEnabled } from "@/lib/stripe";

export const metadata: Metadata = { title: "Booking" };

type Props = { params: Promise<{ sessionId: string }>; searchParams: Promise<{ cancelled?: string }> };

export default async function BookSessionPage({ params, searchParams }: Props) {
  const session = await getSession((await params).sessionId);
  if (!session || !session.event.published) notFound();
  const { cancelled } = await searchParams;
  const e = session.event;
  const past = session.startsAt <= new Date();
  const allowOnline = session.allowOnline && stripeEnabled();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/book" className="text-sm underline text-muted">
        ‹ Back to the calendar
      </Link>
      <div className="mt-6 grid md:grid-cols-[200px_1fr] gap-6 items-center">
        {e.imageUrl && (
          <div className="relative aspect-square overflow-hidden" style={{ borderRadius: "var(--radius)" }}>
            <Image src={e.imageUrl} alt={e.title} fill className="object-cover" sizes="200px" />
          </div>
        )}
        <div>
          <h1 className="text-4xl md:text-5xl">{e.title}</h1>
          <p className="mt-3 text-lg">{formatDateRange(session.startsAt, session.endsAt)}</p>
          {e.location && <p className="text-muted">{e.location}</p>}
          <p className="mt-2">
            {formatMoney(session.price, session.currency)} per person
            {session.earlyBird && <span className="text-highlight"> · early bird price</span>}
          </p>
        </div>
      </div>

      {cancelled && (
        <p className="mt-8 card p-4">Payment cancelled, nothing was charged. You can try again below.</p>
      )}

      <div className="card p-6 md:p-8 mt-8">
        {past ? (
          <p>This date is already past.</p>
        ) : session.spotsLeft === 0 ? (
          <p>
            Sorry, this date is full. <Link href="/book" className="underline">See other dates</Link>.
          </p>
        ) : !allowOnline && !session.allowOnSite ? (
          <p>Booking is not open for this date yet.</p>
        ) : (
          <BookingForm
            sessionId={session.id}
            unitPriceCents={session.price}
            currency={session.currency}
            maxSeats={session.spotsLeft}
            allowOnline={allowOnline}
            allowOnSite={session.allowOnSite}
          />
        )}
      </div>
    </div>
  );
}
