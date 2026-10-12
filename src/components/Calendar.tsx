"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type CalendarSession = {
  id: string;
  day: string; // YYYY-MM-DD, Swiss time
  time: string;
  title: string;
  kind: string;
  price: string;
  spotsLeft: number;
  capacity: number;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthGrid(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function Calendar({ sessions, today }: { sessions: CalendarSession[]; today: string }) {
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarSession[]>();
    for (const s of sessions) map.set(s.day, [...(map.get(s.day) ?? []), s]);
    return map;
  }, [sessions]);
  const kinds = useMemo(() => [...new Set(sessions.map((s) => s.title))], [sessions]);

  const start = sessions[0]?.day ?? today;
  const [cursor, setCursor] = useState({ y: Number(start.slice(0, 4)), m: Number(start.slice(5, 7)) - 1 });
  const [selected, setSelected] = useState<string | null>(sessions[0]?.day ?? null);
  const [filter, setFilter] = useState<string | null>(null);

  const visible = (list: CalendarSession[] = []) => (filter ? list.filter((s) => s.title === filter) : list);
  const move = (delta: number) =>
    setCursor(({ y, m }) => {
      const d = new Date(Date.UTC(y, m + delta, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    });
  const monthLabel = new Date(Date.UTC(cursor.y, cursor.m, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const daySessions = visible(selected ? byDay.get(selected) : []);

  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
      <div className="card p-4 md:p-6">
        {kinds.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {[null, ...kinds].map((k) => (
              <button
                key={k ?? "all"}
                type="button"
                onClick={() => setFilter(k)}
                className={`px-3 py-1 text-sm border border-line ${filter === k ? "bg-accent text-accent-text" : ""}`}
                style={{ borderRadius: "var(--radius-btn)" }}
              >
                {k ?? "All"}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={() => move(-1)} className="px-3 py-1 text-2xl" aria-label="Previous month">
            ‹
          </button>
          <p className="font-heading text-2xl text-heading capitalize">{monthLabel}</p>
          <button type="button" onClick={() => move(1)} className="px-3 py-1 text-2xl" aria-label="Next month">
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted mb-2">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthGrid(cursor.y, cursor.m).map((day, i) => {
            if (!day) return <span key={i} />;
            const list = visible(byDay.get(day));
            const open = list.some((s) => s.spotsLeft > 0);
            const isSelected = day === selected;
            return (
              <button
                key={day}
                type="button"
                disabled={!list.length}
                onClick={() => setSelected(day)}
                className={`aspect-square flex flex-col items-center justify-center text-sm transition ${
                  isSelected ? "bg-accent text-accent-text" : list.length ? "hover:bg-bg-alt" : "opacity-35"
                } ${day === today ? "ring-1 ring-highlight" : ""}`}
                style={{ borderRadius: "var(--radius-btn)" }}
              >
                {Number(day.slice(8))}
                {list.length > 0 && (
                  <span className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-accent-text" : open ? "bg-highlight" : "bg-muted"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {selected && daySessions.length ? (
          <>
            <p className="font-heading text-2xl text-heading mb-4">
              {new Date(`${selected}T12:00:00Z`).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                timeZone: "UTC",
              })}
            </p>
            <div className="space-y-3">
              {daySessions.map((s) => (
                <div key={s.id} className="card p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-heading">{s.title}</p>
                    <p className="text-sm text-muted">
                      {s.time} · {s.price} ·{" "}
                      {s.spotsLeft === 0 ? "Full" : s.capacity === 1 ? "Available" : `${s.spotsLeft} spots left`}
                    </p>
                  </div>
                  {s.spotsLeft > 0 ? (
                    <Link href={`/book/${s.id}`} className="btn">
                      Book
                    </Link>
                  ) : (
                    <span className="text-sm text-muted">Full</span>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted">
            {sessions.length ? "Pick a highlighted day to see the available times." : "No dates are open for booking yet."}
          </p>
        )}
      </div>
    </div>
  );
}
