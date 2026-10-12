import type { Metadata } from "next";
import { EventCard } from "@/components/blocks";
import { getEvents } from "@/lib/queries";

export const metadata: Metadata = { title: "Retreats" };

export default async function RetreatsPage() {
  const retreats = await getEvents("RETREAT");
  return (
    <div className="mx-auto max-w-[1152px] px-4 md:px-6 py-12">
      <h1 className="text-5xl mb-10">Retreats</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {retreats.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  );
}
