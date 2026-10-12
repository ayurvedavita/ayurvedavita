import Image from "next/image";
import Link from "next/link";
import { formatDate, formatDateRange, formatMoney, formatTime } from "@/lib/format";
import type { SessionView } from "@/lib/queries";
import { KIND_LABELS, site } from "@/lib/site";

export function Dots() {
  return <p className="text-center tracking-[2.5em] text-xl py-6 select-none">···</p>;
}

export function Partners({ title = "The events are organized in collaboration with" }: { title?: string }) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 text-center">
      <p className="font-semibold mb-10">{title}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
        {site.partners.map((p) => (
          <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className="flex justify-center">
            {/* Partner logos are white: on light themes they sit on a dark tile. */}
            <span className="partner-tile inline-flex p-2" style={{ borderRadius: "var(--radius)" }}>
              <Image src={p.logo} alt={p.name} width={200} height={120} className="h-auto w-[180px]" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export type EventCardData = {
  slug: string;
  title: string;
  kind: string;
  summary: string | null;
  imageUrl: string | null;
  nextSession: { startsAt: Date } | null;
};

export function EventCard({ event }: { event: EventCardData }) {
  return (
    <Link href={`/events/${event.slug}`} className="group block card overflow-hidden">
      {event.imageUrl && (
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        </div>
      )}
      <div className="p-5">
        <p className="ui text-xs text-highlight">{KIND_LABELS[event.kind] ?? event.kind}</p>
        <h3 className="mt-1 text-3xl text-highlight">{event.title}</h3>
        {event.summary && <p className="mt-2 text-muted">{event.summary}</p>}
        <p className="mt-3 text-sm">
          {event.nextSession ? `Next date: ${formatDate(event.nextSession.startsAt)}` : "New dates coming soon"}
        </p>
      </div>
    </Link>
  );
}

export function SessionRow({ session, showTitle = true }: { session: SessionView; showTitle?: boolean }) {
  const full = session.spotsLeft === 0;
  return (
    <div className="card flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4">
      <div className="flex-1">
        {showTitle && <p className="font-semibold text-heading">{session.event.title}</p>}
        <p className={showTitle ? "text-sm text-muted" : "font-semibold"}>{formatDateRange(session.startsAt, session.endsAt)}</p>
        <p className="text-sm text-muted">
          {formatMoney(session.price, session.currency)}
          {session.earlyBird && " · early bird"} ·{" "}
          {full ? "Full" : session.capacity === 1 ? "Available" : `${session.spotsLeft} spots left`}
        </p>
      </div>
      {full ? (
        <span className="btn btn-ghost opacity-60">Full</span>
      ) : (
        <Link href={`/book/${session.id}`} className="btn">
          Book
        </Link>
      )}
    </div>
  );
}

/** "2026 /// 01.09 > 04.09 /// CHURWALDEN /// SWITZERLAND", like the original site. */
export function retreatDateLine(session: SessionView) {
  const dm = (d: Date) => formatDate(d, { weekday: undefined, year: undefined, day: "2-digit", month: "2-digit" }).replace("/", ".");
  const year = formatDate(session.startsAt, { weekday: undefined, day: undefined, month: undefined });
  const dates = session.endsAt ? `${dm(session.startsAt)} > ${dm(session.endsAt)}` : dm(session.startsAt);
  const place = session.event.location?.split(",").slice(1).map((p) => p.trim()) ?? [];
  return [year, dates, ...place].join(" /// ");
}

/** Home block of the original site: retreat title, dates, contact and price buttons. */
export function FeaturedEventClassic({ session }: { session: SessionView }) {
  const e = session.event;
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 text-center">
      <Link href={`/events/${e.slug}`} className="inline-block text-highlight underline underline-offset-8 decoration-2">
        <h2 className="text-4xl md:text-6xl !text-highlight">{e.title}</h2>
      </Link>
      <p className="mt-8 text-3xl lg:text-[40px] xl:text-[44px] lg:whitespace-nowrap font-heading text-heading uppercase">{retreatDateLine(session)}</p>
      <p className="mt-10 text-xl font-semibold">• EMAIL US for any question •</p>
      <a href={`mailto:${site.email}`} className="btn mt-6">
        Email us
      </a>
      <p className="mt-10 text-xl font-semibold text-highlight">• BOOK your place •</p>
      <div className="mt-6 mx-auto max-w-2xl flex flex-col gap-3">
        <PriceButtons session={session} />
      </div>
    </section>
  );
}

export function PriceButtons({ session }: { session: SessionView }) {
  const until = (d: Date) => formatDate(d, { weekday: undefined, month: "short", day: "2-digit" }).toUpperCase();
  const rows: { label: string; price: number; closed: boolean }[] = [];
  if (session.earlyPriceCents != null && session.earlyUntil) {
    rows.push({ label: `Earlybirds by ${until(session.earlyUntil)}`, price: session.earlyPriceCents, closed: !session.earlyBird });
  }
  rows.push({ label: "Book your place", price: session.priceCents, closed: false });
  return rows.map((r) => (
    <Link
      key={r.label}
      href={`/book/${session.id}`}
      aria-disabled={r.closed}
      className={`btn w-full !py-4 text-sm sm:text-base !tracking-[0.06em] ${r.closed ? "pointer-events-none opacity-50 line-through" : ""}`}
    >
      {r.label} &gt;&gt; <strong>{formatMoney(r.price, session.currency)}</strong>
    </Link>
  ));
}

export function SessionTimes({ sessions }: { sessions: SessionView[] }) {
  return (
    <ul className="space-y-1 text-sm">
      {sessions.map((s) => (
        <li key={s.id}>
          {formatDate(s.startsAt)} {formatTime(s.startsAt)}
        </li>
      ))}
    </ul>
  );
}
