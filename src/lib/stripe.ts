import "server-only";
import Stripe from "stripe";
import { prisma } from "./prisma";

let client: Stripe | null = null;

export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

export function siteUrl(): string {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Marks the booking paid if its Stripe checkout is paid. Safe to call many times (webhook + return page). */
export async function syncCheckoutSession(checkout: Stripe.Checkout.Session) {
  const bookingId = checkout.metadata?.bookingId;
  if (!bookingId) return;
  if (checkout.payment_status === "paid") {
    await prisma.booking.updateMany({
      where: { id: bookingId, status: { in: ["PENDING", "CANCELLED"] } },
      data: { status: "PAID", paidAt: new Date(), stripeSessionId: checkout.id },
    });
  } else if (checkout.status === "expired") {
    await prisma.booking.updateMany({
      where: { id: bookingId, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
  }
}
