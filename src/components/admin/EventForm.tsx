import { readdirSync } from "node:fs";
import path from "node:path";
import type { Event } from "@prisma/client";
import { saveEvent } from "@/app/admin/actions";
import { KIND_LABELS } from "@/lib/site";

function siteImages() {
  try {
    return readdirSync(path.join(process.cwd(), "public/images"))
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && !f.startsWith("partner-"))
      .map((f) => `/images/${f}`);
  } catch {
    return [];
  }
}

export function EventForm({ event }: { event?: Event }) {
  const images = siteImages();
  return (
    <form action={saveEvent} className="card p-6 grid gap-4 md:grid-cols-2">
      {event && <input type="hidden" name="id" value={event.id} />}
      <div className="md:col-span-2">
        <label className="label">Title *</label>
        <input name="title" required defaultValue={event?.title} className="field" />
      </div>
      <div>
        <label className="label">Type</label>
        <select name="kind" defaultValue={event?.kind ?? "CLINIC"} className="field">
          {Object.entries(KIND_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Web address (leave empty to build it from the title)</label>
        <input name="slug" defaultValue={event?.slug} className="field" placeholder="ayurvedic-consultation" />
      </div>
      <div className="md:col-span-2">
        <label className="label">Subtitle</label>
        <input name="subtitle" defaultValue={event?.subtitle ?? ""} className="field" />
      </div>
      <div className="md:col-span-2">
        <label className="label">Short summary (shown on cards)</label>
        <input name="summary" defaultValue={event?.summary ?? ""} className="field" />
      </div>
      <div className="md:col-span-2">
        <label className="label">Description (leave an empty line between paragraphs)</label>
        <textarea name="description" rows={7} defaultValue={event?.description ?? ""} className="field" />
      </div>
      <div>
        <label className="label">Image</label>
        <input name="imageUrl" list="site-images" defaultValue={event?.imageUrl ?? ""} className="field" />
        <datalist id="site-images">
          {images.map((src) => (
            <option key={src} value={src} />
          ))}
        </datalist>
      </div>
      <div>
        <label className="label">Location</label>
        <input name="location" defaultValue={event?.location ?? ""} className="field" placeholder="Churwalden, Switzerland" />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="published" defaultChecked={event?.published ?? true} /> Visible on the website
      </label>
      <div className="md:col-span-2 flex justify-end">
        <button className="btn">{event ? "Save" : "Create event"}</button>
      </div>
    </form>
  );
}
