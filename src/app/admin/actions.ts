"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkCredentials, endAdminSession, requireAdmin, startAdminSession, weakAdminPassword } from "@/lib/auth";
import { fromZurichInput, parseMoney, slugify } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { blocked, clientIp, hit, reset } from "@/lib/rate-limit";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const optional = (form: FormData, key: string) => text(form, key) || null;

const LOGIN_WINDOW_MS = 15 * 60_000;
const LOGIN_FAILS_PER_IP = 5; // per visitor, per 15 minutes
const LOGIN_FAILS_GLOBAL = 30; // all visitors together, per 15 minutes (stops attacks spread over many addresses)

export async function login(form: FormData) {
  if (weakAdminPassword()) redirect("/admin/login?error=weak");
  const ipKey = `login:${await clientIp()}`;
  if (blocked(ipKey, LOGIN_FAILS_PER_IP) || blocked("login:all", LOGIN_FAILS_GLOBAL)) {
    redirect("/admin/login?error=locked");
  }
  if (!checkCredentials(text(form, "email"), String(form.get("password") ?? ""))) {
    hit(ipKey, LOGIN_FAILS_PER_IP, LOGIN_WINDOW_MS);
    hit("login:all", LOGIN_FAILS_GLOBAL, LOGIN_WINDOW_MS);
    await new Promise((r) => setTimeout(r, 1000)); // slows down password guessing
    redirect("/admin/login?error=1");
  }
  reset(ipKey);
  await startAdminSession();
  redirect("/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}

// ---- Events

export async function saveEvent(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const title = text(form, "title");
  if (!title) throw new Error("Title is required");
  const data = {
    title,
    slug: slugify(text(form, "slug") || title),
    kind: text(form, "kind") || "CLINIC",
    subtitle: optional(form, "subtitle"),
    summary: optional(form, "summary"),
    description: optional(form, "description"),
    imageUrl: optional(form, "imageUrl"),
    location: optional(form, "location"),
    published: form.get("published") === "on",
  };
  const event = id
    ? await prisma.event.update({ where: { id }, data })
    : await prisma.event.create({ data });
  revalidatePath("/", "layout");
  redirect(`/admin/events/${event.id}`);
}

export async function deleteEvent(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const paid = await prisma.booking.count({ where: { session: { eventId: id }, status: { in: ["PAID", "CONFIRMED"] } } });
  if (paid > 0) throw new Error("This event has active bookings. Cancel them first, or unpublish the event instead.");
  await prisma.event.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/events");
}

// ---- Slots (sessions)

function sessionFields(form: FormData) {
  const early = text(form, "earlyPrice");
  const earlyUntil = text(form, "earlyUntil");
  return {
    capacity: Math.max(1, Number(text(form, "capacity")) || 1),
    priceCents: parseMoney(text(form, "price") || "0"),
    earlyPriceCents: early ? parseMoney(early) : null,
    earlyUntil: early && earlyUntil ? fromZurichInput(`${earlyUntil}T23:59`) : null,
    allowOnline: form.get("allowOnline") === "on",
    allowOnSite: form.get("allowOnSite") === "on",
    note: optional(form, "note"),
  };
}

/** Creates one slot per start time, optionally repeated every week. */
export async function createSessions(form: FormData) {
  await requireAdmin();
  const eventId = text(form, "eventId");
  const date = text(form, "date");
  const endDate = text(form, "endDate");
  const times = text(form, "times")
    .split(/[,\s]+/)
    .filter(Boolean);
  const duration = Number(text(form, "duration")) || 60;
  const weeks = Math.min(52, Math.max(1, Number(text(form, "weeks")) || 1));
  if (!date || times.length === 0) throw new Error("Date and at least one start time are required");
  const fields = sessionFields(form);

  const rows = [];
  for (let w = 0; w < weeks; w++) {
    const day = new Date(`${date}T12:00:00Z`);
    day.setUTCDate(day.getUTCDate() + 7 * w);
    const dayKey = day.toISOString().slice(0, 10);
    for (const time of times) {
      if (!/^\d{1,2}:\d{2}$/.test(time)) throw new Error(`Invalid time: ${time}`);
      const startsAt = fromZurichInput(`${dayKey}T${time.padStart(5, "0")}`);
      // A multi-day event (retreat) ends on endDate at the end time; otherwise it lasts `duration` minutes.
      const endsAt =
        endDate && weeks === 1
          ? fromZurichInput(`${endDate}T${text(form, "endTime") || "17:00"}`)
          : new Date(startsAt.getTime() + duration * 60_000);
      rows.push({ eventId, startsAt, endsAt, ...fields });
    }
  }
  await prisma.session.createMany({ data: rows });
  revalidatePath("/", "layout");
  redirect(`/admin/events/${eventId}?added=${rows.length}`);
}

export async function updateSession(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  await prisma.session.update({
    where: { id },
    data: {
      startsAt: fromZurichInput(text(form, "startsAt")),
      endsAt: text(form, "endsAt") ? fromZurichInput(text(form, "endsAt")) : null,
      ...sessionFields(form),
    },
  });
  revalidatePath("/", "layout");
  redirect(`/admin/sessions/${id}?saved=1`);
}

export async function deleteSession(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const session = await prisma.session.findUniqueOrThrow({ where: { id } });
  const active = await prisma.booking.count({ where: { sessionId: id, status: { in: ["PAID", "CONFIRMED"] } } });
  if (active > 0) throw new Error("This slot has bookings. Cancel them first.");
  await prisma.session.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect(`/admin/events/${session.eventId}`);
}

// ---- Bookings

export async function setBookingStatus(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const status = text(form, "status");
  if (!["CONFIRMED", "PAID", "CANCELLED"].includes(status)) throw new Error("Invalid status");
  const booking = await prisma.booking.update({
    where: { id },
    data: { status, paidAt: status === "PAID" ? new Date() : undefined },
  });
  revalidatePath("/admin", "layout");
  redirect(`/admin/sessions/${booking.sessionId}`);
}

/** For bookings taken by phone or WhatsApp. */
export async function addManualBooking(form: FormData) {
  await requireAdmin();
  const sessionId = text(form, "sessionId");
  const session = await prisma.session.findUniqueOrThrow({ where: { id: sessionId } });
  const seats = Math.max(1, Number(text(form, "seats")) || 1);
  const paid = form.get("paid") === "on";
  await prisma.booking.create({
    data: {
      sessionId,
      name: text(form, "name"),
      email: text(form, "email").toLowerCase(),
      phone: optional(form, "phone"),
      seats,
      paymentMethod: "ON_SITE",
      status: paid ? "PAID" : "CONFIRMED",
      paidAt: paid ? new Date() : null,
      amountCents: session.priceCents * seats,
      currency: session.currency,
      message: "Added by admin",
    },
  });
  revalidatePath("/", "layout");
  redirect(`/admin/sessions/${sessionId}`);
}
