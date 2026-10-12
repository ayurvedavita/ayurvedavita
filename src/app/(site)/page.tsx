import Image from "next/image";
import Link from "next/link";
import { Dots, EventCard, FeaturedEventClassic, Partners, PriceButtons, SessionRow, retreatDateLine } from "@/components/blocks";
import { Hero } from "@/components/heroes";
import { getEvents, getNextDatePerEvent, getUpcomingSessions, type SessionView } from "@/lib/queries";
import { getThemeConfig } from "@/lib/theme-server";

export default async function HomePage() {
  const theme = await getThemeConfig();
  const [retreats, upcoming, events] = await Promise.all([
    getUpcomingSessions({ kind: "RETREAT", take: 1 }),
    getNextDatePerEvent(),
    getEvents(),
  ]);
  const featured = retreats[0];

  if (theme.name === "original") {
    return (
      <>
        <Hero variant="slider" />
        {featured && <FeaturedEventClassic session={featured} />}
        <section className="mx-auto max-w-3xl px-4 pt-6">
          <h2 className="text-center text-4xl mb-8">Next dates</h2>
          <div className="space-y-3">
            {upcoming.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
            {upcoming.length === 0 && <p className="text-center text-muted">New dates coming soon.</p>}
          </div>
          <p className="text-center mt-8">
            <Link href="/book" className="btn">
              Open the calendar
            </Link>
          </p>
        </section>
        <Partners />
      </>
    );
  }

  return (
    <>
      <Hero variant={theme.hero} />
      <Offerings events={events} />
      {featured && <FeaturedEventModern session={featured} />}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <p className="ui text-xs text-highlight text-center">Calendar</p>
        <h2 className="text-center text-4xl md:text-5xl mt-2 mb-10">Next dates</h2>
        <div className="space-y-3">
          {upcoming.map((s) => (
            <SessionRow key={s.id} session={s} />
          ))}
          {upcoming.length === 0 && <p className="text-center text-muted">New dates coming soon.</p>}
        </div>
        <p className="text-center mt-10">
          <Link href="/book" className="btn btn-ghost">
            See all dates
          </Link>
        </p>
      </section>
      <QuoteBand />
      <Partners />
    </>
  );
}

function Offerings({ events }: { events: Awaited<ReturnType<typeof getEvents>> }) {
  return (
    <section className="bg-bg-alt py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="ui text-xs text-highlight text-center">What we offer</p>
        <h2 className="text-center text-4xl md:text-5xl mt-2 mb-12">Retreats, courses & clinics</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedEventModern({ session }: { session: SessionView }) {
  const e = session.event;
  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
      {e.imageUrl && (
        <div className="relative aspect-square overflow-hidden" style={{ borderRadius: "var(--radius)" }}>
          <Image src={e.imageUrl} alt={e.title} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
      )}
      <div>
        <p className="ui text-xs text-highlight">Featured retreat</p>
        <h2 className="text-4xl md:text-5xl mt-2">{e.title}</h2>
        {e.subtitle && <p className="mt-4 text-lg text-muted">{e.subtitle}</p>}
        <p className="mt-6 font-semibold">{retreatDateLine(session)}</p>
        <p className="mt-1 text-sm text-muted">Max {session.capacity} people · {session.spotsLeft} spots left</p>
        <div className="mt-8 flex flex-col gap-3">
          <PriceButtons session={session} />
        </div>
        <Link href={`/events/${e.slug}`} className="inline-block mt-6 underline underline-offset-4">
          Program, team and location
        </Link>
      </div>
    </section>
  );
}

function QuoteBand() {
  return (
    <section className="bg-bg-alt py-20 text-center px-4">
      <Dots />
      <p className="font-heading text-3xl md:text-5xl text-heading max-w-3xl mx-auto italic">
        “Ayurveda teaches that every person has the power to heal themselves.”
      </p>
      <Dots />
    </section>
  );
}
