import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { KIND_LABELS } from "@/lib/site";

export default async function AdminEvents() {
  const now = new Date();
  const events = await prisma.event.findMany({
    include: { _count: { select: { sessions: { where: { startsAt: { gt: now } } } } } },
    orderBy: { createdAt: "asc" },
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Events & slots</h1>
        <Link href="/admin/events/new" className="btn">
          + New event
        </Link>
      </div>
      <div className="card divide-y divide-[var(--border)]">
        {events.map((e) => (
          <Link key={e.id} href={`/admin/events/${e.id}`} className="flex items-center gap-4 p-4 hover:bg-bg-alt">
            <div className="flex-1">
              <p className="font-semibold">{e.title}</p>
              <p className="text-sm text-muted">
                {KIND_LABELS[e.kind]} · {e._count.sessions} upcoming slot(s)
              </p>
            </div>
            {!e.published && <span className="text-xs rounded bg-bg-alt px-2 py-1">Hidden</span>}
            <span className="text-muted">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
