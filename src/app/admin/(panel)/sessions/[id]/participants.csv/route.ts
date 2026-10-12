import { isAdmin } from "@/lib/auth";
import { STATUS_LABELS } from "@/lib/booking";
import { toZurichInput } from "@/lib/format";
import { prisma } from "@/lib/prisma";

// A leading ' stops Excel from running text typed by a visitor (e.g. a name starting with "=") as a formula.
const cell = (value: unknown) => {
  const raw = String(value ?? "");
  const safe = typeof value === "string" && /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const session = await prisma.session.findUnique({
    where: { id },
    include: { event: true, bookings: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) return new Response("Not found", { status: 404 });

  const header = ["Name", "Email", "Phone", "Places", "Amount", "Status", "Payment", "Message", "Booked at"];
  const rows = session.bookings.map((b) => [
    b.name,
    b.email,
    b.phone,
    b.seats,
    (b.amountCents / 100).toFixed(2),
    STATUS_LABELS[b.status],
    b.paymentMethod === "ONLINE" ? "online" : "on site",
    b.message,
    toZurichInput(b.createdAt).replace("T", " "),
  ]);
  // Semicolons + BOM so Excel opens it correctly with European settings.
  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
  const name = `${session.event.slug}-${toZurichInput(session.startsAt).slice(0, 10)}.csv`;
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"` },
  });
}
