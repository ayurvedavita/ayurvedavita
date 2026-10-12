"use client";

import { useState } from "react";

export type ProgramDay = { title: string; items: [time: string, label: string][] };

const LAYOUTS = {
  tabs: "Tabs",
  columns: "4 columns",
  accordion: "Accordion",
  dayparts: "Morning / afternoon / evening",
} as const;
type Layout = keyof typeof LAYOUTS;

// Set to the chosen layout ("tabs", "columns", "accordion" or "dayparts") to remove the "Layout:" buttons.
const CHOSEN_LAYOUT: Layout | null = null;

// Meals and breaks are shown quieter than the teaching sessions.
const BREAK_RE = /breakfast|lunch|dinner|^rest$|check-?in|check-out|departure/i;

/** "Day 2 /// Dosha focus ~ Kapha•Pitta" -> "Dosha focus ~ Kapha•Pitta" */
function theme(day: ProgramDay) {
  return day.title.split("///").pop()!.trim();
}

/** "07. PM" -> 19, "12. PM" -> 12 (noon), "12. AM" -> 0 (midnight). */
function hour24(time: string) {
  const h = Number(time.slice(0, 2)) % 12;
  return time.includes("PM") ? h + 12 : h;
}

export function RetreatProgram({ days }: { days: ProgramDay[] }) {
  const [picked, setLayout] = useState<Layout>("tabs");
  const layout = CHOSEN_LAYOUT ?? picked;
  return (
    <div>
      {!CHOSEN_LAYOUT && (
        <div className="mx-auto max-w-[720px] mb-8 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted mr-1">Layout:</span>
          {(Object.keys(LAYOUTS) as Layout[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setLayout(key)}
              className={`px-3 py-1 border border-line ${layout === key ? "bg-accent text-accent-text" : ""}`}
              style={{ borderRadius: "var(--radius-btn)" }}
            >
              {LAYOUTS[key]}
            </button>
          ))}
        </div>
      )}
      {layout === "tabs" && <TabsLayout days={days} />}
      {layout === "columns" && <ColumnsLayout days={days} />}
      {layout === "accordion" && <AccordionLayout days={days} />}
      {layout === "dayparts" && <DaypartsLayout days={days} />}
    </div>
  );
}

function TabsLayout({ days }: { days: ProgramDay[] }) {
  const [active, setActive] = useState(0);
  const day = days[active];
  return (
    <div className="mx-auto max-w-[720px]">
      <div className="flex gap-2 flex-wrap">
        {days.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`px-4 py-3 rounded-t-[18px] text-lg font-semibold ${
              i === active ? "bg-white text-[#133124]" : "bg-accent text-accent-text"
            }`}
            style={{ fontFamily: "var(--font-tagline)" }}
          >
            DAY {i + 1}
          </button>
        ))}
      </div>
      <div className="bg-accent text-accent-text p-6 mt-6" style={{ borderRadius: "var(--radius)" }}>
        <p className="ui text-xl mb-6">{day.title}</p>
        <ol className="border-l-2 border-current/40 ml-1">
          {day.items.map(([time, label]) => (
            <li key={time} className="flex items-baseline gap-6 py-4 pl-6 relative">
              <span className="absolute left-0 top-1/2 w-4 border-t-2 border-current/40" />
              <span className="ui text-2xl md:text-3xl w-24 shrink-0 opacity-90">{time}</span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** All four days visible at once, like a printed agenda. Scrolls sideways on phones. */
function ColumnsLayout({ days }: { days: ProgramDay[] }) {
  return (
    <div className="-mx-4 px-4 overflow-x-auto snap-x snap-mandatory">
      <div className="grid grid-flow-col auto-cols-[85%] sm:auto-cols-[45%] lg:auto-cols-fr gap-4 pb-2">
        {days.map((day, i) => (
          <section key={i} className="card snap-start overflow-hidden">
            <header className="bg-accent text-accent-text px-4 py-4">
              <p className="ui text-sm opacity-80">Day {i + 1}</p>
              <p className="font-heading text-xl leading-tight mt-1">{theme(day)}</p>
            </header>
            <ol className="px-4 py-2">
              {day.items.map(([time, label]) => (
                <li
                  key={time}
                  className={`flex gap-3 py-2 border-b border-line last:border-0 text-[15px] leading-snug ${
                    BREAK_RE.test(label) ? "text-muted" : ""
                  }`}
                >
                  <span className="ui text-highlight w-14 shrink-0">{time}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

/** One line per day; open a day to read its schedule. */
function AccordionLayout({ days }: { days: ProgramDay[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-[720px] border-t border-line">
      {days.map((day, i) => {
        const isOpen = open === i;
        return (
          <section key={i} className="border-b border-line">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center gap-5 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-heading text-5xl text-highlight w-14 shrink-0 leading-none">{i + 1}</span>
              <span className="flex-1">
                <span className="ui text-xs text-muted block">Day {i + 1}</span>
                <span className="font-heading text-2xl text-heading">{theme(day)}</span>
              </span>
              <span className="text-sm text-muted hidden sm:inline">{day.items.length} moments</span>
              <span className={`text-2xl transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
            </button>
            {isOpen && (
              <ol className="pb-6 pl-[76px] sm:columns-2 gap-x-8">
                {day.items.map(([time, label]) => (
                  <li
                    key={time}
                    className={`flex gap-3 py-1.5 break-inside-avoid ${BREAK_RE.test(label) ? "text-muted" : ""}`}
                  >
                    <span className="ui text-highlight w-14 shrink-0">{time}</span>
                    <span>{label}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}
    </div>
  );
}

const PARTS = [
  { name: "Morning", from: 0, to: 12 },
  { name: "Afternoon", from: 12, to: 18 },
  { name: "Evening", from: 18, to: 24 },
];

/** Pick a day, then read it as morning, afternoon and evening blocks. */
function DaypartsLayout({ days }: { days: ProgramDay[] }) {
  const [active, setActive] = useState(0);
  const day = days[active];
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {days.map((d, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`text-left px-4 py-3 border transition ${
              i === active ? "bg-accent text-accent-text border-transparent" : "border-line hover:bg-bg-alt"
            }`}
            style={{ borderRadius: "var(--radius)" }}
          >
            <span className="ui text-xs opacity-75 block">Day {i + 1}</span>
            <span className="text-sm leading-tight">{theme(d)}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {PARTS.map((part) => {
          const items = day.items.filter(([time]) => {
            const h = hour24(time);
            return h >= part.from && h < part.to;
          });
          return (
            <section key={part.name} className="card p-5">
              <h4 className="ui text-sm text-highlight mb-3">{part.name}</h4>
              {items.length ? (
                <ol className="space-y-3">
                  {items.map(([time, label]) => (
                    <li key={time} className={BREAK_RE.test(label) ? "text-muted" : ""}>
                      <span className="ui text-xs text-muted block">{time}</span>
                      <span className={BREAK_RE.test(label) ? "" : "font-semibold text-heading"}>{label}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-muted text-sm">Free time</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
