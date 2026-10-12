"use server";

import { redirect } from "next/navigation";
import { activeBookingsWhere, currentPriceCents, seatsTaken, type PaymentMethod } from "@/lib/booking";
import { prisma } from "@/lib/prisma";
import { clientIp, hit } from "@/lib/rate-limit";
import { getStripe, siteUrl, stripeEnabled } from "@/lib/stripe";

export type BookingFormState = { error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createBooking(_prev: BookingFormState, form: FormData): Promise<BookingFormState> {
  // Honeypot: real people never fill this hidden field.
  if (form.get("website")) return { error: "Something went wrong." };

  const sessionId = String(form.get("sessionId") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const phone = String(form.get("phone") ?? "").trim() || null;
  const message = String(form.get("message") ?? "").trim() || null;
  const seats = Number(form.get("seats") ?? 1);
  const method = String(form.get("method") ?? "") as PaymentMethod;

  if (name.length < 2) return { error: "Please enter your name." };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email." };
  if (!Number.isInteger(seats) || seats < 1 || seats > 10) return { error: "Invalid number of places." };
  if (method !== "ONLINE" && method !== "ON_SITE") return { error: "Please choose how to pay." };
  if (method === "ONLINE" && !stripeEnabled()) return { error: "Online payment is not available yet." };
  if (name.length > 120 || email.length > 200 || (phone?.length ?? 0) > 40 || (message?.length ?? 0) > 2000) {
    return { error: "One of the fields is too long." };
  }
  // Stops someone from filling every place with fake bookings.
  if (!hit(`book:${await clientIp()}`, 8, 60 * 60_000)) {
    return { error: "Too many bookings from your connection. Please try again later or contact us." };
  }

  const result = await prisma.$transaction(async (tx) => {
    const session = await tx.session.findUnique({
      where: { id: sessionId },
      include: { event: true, bookings: { where: activeBookingsWhere(), select: { seats: true } } },
    });
    if (!session || !session.event.published) return { error: "This date does not exist anymore." };
    if (session.startsAt <= new Date()) return { error: "This date is already past." };
    if (method === "ONLINE" && !session.allowOnline) return { error: "Online payment is not offered for this date." };
    if (method === "ON_SITE" && !session.allowOnSite) return { error: "Payment on site is not offered for this date." };
    const left = session.capacity - seatsTaken(session.bookings);
    if (seats > left) return { error: left > 0 ? `Only ${left} place(s) left.` : "Sorry, this date is now full." };

    const unitPrice = currentPriceCents(session);
    const booking = await tx.booking.create({
      data: {
        sessionId,
        name,
        email,
        phone,
        message,
        seats,
        paymentMethod: method,
        status: method === "ON_SITE" ? "CONFIRMED" : "PENDING",
        amountCents: unitPrice * seats,
        currency: session.currency,
      },
    });
    return { booking, session, unitPrice };
  });

  if ("error" in result) return { error: result.error };
  const { booking, session, unitPrice } = result;

  if (method === "ON_SITE") redirect(`/booking/${booking.id}`);

  let checkoutUrl: string | null = null;
  try {
    const checkout = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          quantity: seats,
          price_data: {
            currency: session.currency.toLowerCase(),
            unit_amount: unitPrice,
            product_data: { name: session.event.title, description: session.startsAt.toISOString().slice(0, 10) },
          },
        },
      ],
      metadata: { bookingId: booking.id },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      success_url: `${siteUrl()}/booking/${booking.id}?checkout={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/book/${sessionId}?cancelled=1`,
    });
    await prisma.booking.update({ where: { id: booking.id }, data: { stripeSessionId: checkout.id } });
    checkoutUrl = checkout.url;
  } catch (err) {
    console.error("Stripe checkout failed", err);
    await prisma.booking.delete({ where: { id: booking.id } });
    return { error: "Online payment failed to start. Please try again or choose to pay on site." };
  }
  redirect(checkoutUrl!);
}
