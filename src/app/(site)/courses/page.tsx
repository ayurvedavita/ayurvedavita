import type { Metadata } from "next";
import { EventCard } from "@/components/blocks";
import { getEvents } from "@/lib/queries";

export const metadata: Metadata = { title: "Courses" };

export default async function CoursesPage() {
  const [courses, clinics] = await Promise.all([getEvents("COURSE"), getEvents("CLINIC")]);
  return (
    <div className="mx-auto max-w-[1152px] px-4 md:px-6 py-12 space-y-20">
      <section>
        <h1 className="text-5xl mb-10">Courses</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>
      {clinics.length > 0 && (
        <section>
          <h2 className="text-4xl mb-10">Clinics & consultations</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {clinics.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
