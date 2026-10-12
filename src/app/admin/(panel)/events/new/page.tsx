import Link from "next/link";
import { EventForm } from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/events" className="text-sm underline text-muted">
        ‹ All events
      </Link>
      <h1 className="text-3xl">New event</h1>
      <EventForm />
    </div>
  );
}
