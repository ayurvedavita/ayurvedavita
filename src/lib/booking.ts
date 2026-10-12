import type { Prisma } from "@prisma/client";

export type PaymentMethod = "ONLINE" | "ON_SITE";
export type BookingStatus = "PENDING" | "CONFIRMED" | "PAID" | "CANCELLED";

// Stripe checkout links expire after 30 minutes; an unpaid online booking holds its seats that long.
export const PENDING_HOLD_MINUTES = 35;

/** Bookings that currently use seats. */
export function activeBookingsWhere(now = new Date()): Prisma.BookingWhereInput {
  return {
    OR: [
      { status: { in: ["CONFIRMED", "PAID"] } },
      { status: "PENDING", createdAt: { gt: new Date(now.getTime() - PENDING_HOLD_MINUTES * 60_000) } },
    ],
  };
}

type PricedSession = { priceCents: number; earlyPriceCents: number | null; earlyUntil: Date | null };

export function isEarlyBird(session: PricedSession, now = new Date()): boolean {
  return session.earlyPriceCents != null && session.earlyUntil != null && now <= session.earlyUntil;
}

export function currentPriceCents(session: PricedSession, now = new Date()): number {
  return isEarlyBird(session, now) ? session.earlyPriceCents! : session.priceCents;
}

export function seatsTaken(bookings: { seats: number }[]): number {
  return bookings.reduce((sum, b) => sum + b.seats, 0);
}

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting payment",
  CONFIRMED: "Confirmed (pay on site)",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};
