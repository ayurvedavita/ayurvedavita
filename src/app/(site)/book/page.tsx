import type { Metadata } from "next";
import { Calendar, type CalendarSession } from "@/components/Calendar";
import { formatMoney, formatTime, zurichDayKey } from "@/lib/format";
import { getUpcomingSessions } from "@/lib/queries";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Book" };

export default async function BookPage() {
  const sessions = await getUpcomingSessions();
  const items: CalendarSession[] = sessions.map((s) => ({
    id: s.id,
    day: zurichDayKey(s.startsAt),
    time: formatTime(s.startsAt),
    title: s.event.title,
    kind: s.event.kind,
    price: formatMoney(s.price, s.currency),
    spotsLeft: s.spotsLeft,
    capacity: s.capacity,
  }));
  return (
    <div className="mx-auto max-w-[1152px] px-4 md:px-6 py-12">
      <h1 className="text-5xl md:text-6xl text-center">Book your place</h1>
      <p className="text-center text-muted mt-4 mb-12">
        Choose a date, then pay online or on site. Questions?{" "}
        <a href={`mailto:${site.email}`} className="underline">
          Email us
        </a>
        .
      </p>
      <Calendar sessions={items} today={zurichDayKey(new Date())} />
    </div>
  );
}
