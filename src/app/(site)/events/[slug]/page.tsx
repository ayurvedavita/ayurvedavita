import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SessionRow } from "@/components/blocks";
import { richContent } from "@/content";
import { getEventBySlug, getUpcomingSessions } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEventBySlug((await params).slug);
  return { title: event?.title ?? "Not found", description: event?.summary ?? undefined };
}

export default async function EventPage({ params }: Props) {
  const event = await getEventBySlug((await params).slug);
  if (!event) notFound();
  const sessions = await getUpcomingSessions({ eventId: event.id });

  const Rich = richContent[event.slug];
  if (Rich) return <Rich event={event} sessions={sessions} />;

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-5xl md:text-6xl text-center">{event.title}</h1>
      {event.subtitle && <p className="text-center text-xl text-muted mt-4">{event.subtitle}</p>}
      {event.imageUrl && (
        <div className="relative aspect-[4/3] mt-10 overflow-hidden" style={{ borderRadius: "var(--radius)" }}>
          <Image src={event.imageUrl} alt={event.title} fill className="object-cover" sizes="768px" priority />
        </div>
      )}
      <div className="prose-site mt-10">
        {event.summary && <p className="text-xl font-semibold">{event.summary}</p>}
        {event.description?.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}
        {event.location && <p className="text-muted">📍 {event.location}</p>}
      </div>
      <h2 className="text-3xl mt-12 mb-6">Dates</h2>
      {sessions.length ? (
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} showTitle={false} />
          ))}
        </div>
      ) : (
        <p className="text-muted">No upcoming dates yet. Write to us and we will let you know.</p>
      )}
    </article>
  );
}
