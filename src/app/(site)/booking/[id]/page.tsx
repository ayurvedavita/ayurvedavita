import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STATUS_LABELS } from "@/lib/booking";
import { formatDateRange, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import { getStripe, stripeEnabled, syncCheckoutSession } from "@/lib/stripe";

export const metadata: Metadata = { title: "Your booking", robots: { index: false } };

type Props = { params: Promise<{ id: string }> };

export default async function BookingPage({ params }: Props) {
  const { id } = await params;
  let booking = await prisma.booking.findUnique({ where: { id }, include: { session: { include: { event: true } } } });
  if (!booking) notFound();

  // Coming back from Stripe: confirm the payment without waiting for the webhook.
  if (booking.status === "PENDING" && booking.stripeSessionId && stripeEnabled()) {
    await syncCheckoutSession(await getStripe().checkout.sessions.retrieve(booking.stripeSessionId));
    booking = await prisma.booking.findUniqueOrThrow({ where: { id }, include: { session: { include: { event: true } } } });
  }

  const { session } = booking;
  const ok = booking.status === "PAID" || booking.status === "CONFIRMED";
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="text-6xl mb-6">{ok ? "🙏" : "⏳"}</p>
      <h1 className="text-4xl md:text-5xl">{ok ? "Thank you, see you soon!" : "Your booking"}</h1>
      <div className="card p-6 mt-10 text-left space-y-2">
        <p className="font-heading text-2xl text-heading">{session.event.title}</p>
        <p>{formatDateRange(session.startsAt, session.endsAt)}</p>
        {session.event.location && <p className="text-muted">{session.event.location}</p>}
        <hr className="border-line my-3" />
        <p>
          {booking.name} · {booking.email}
        </p>
        <p>
          {booking.seats} place(s) · {formatMoney(booking.amountCents, booking.currency)}
        </p>
        <p className="font-semibold text-highlight">{STATUS_LABELS[booking.status]}</p>
        {booking.status === "CONFIRMED" && <p className="text-sm text-muted">You pay on site when you arrive.</p>}
        {booking.status === "PENDING" && (
          <p className="text-sm text-muted">We have not received the payment yet. If you just paid, refresh this page in a minute.</p>
        )}
      </div>
      <p className="mt-8 text-muted">
        Keep this page link. Any question: <a href={`mailto:${site.email}`} className="underline">{site.email}</a>
      </p>
      <Link href="/" className="btn mt-8">
        Back to the site
      </Link>
    </div>
  );
}
