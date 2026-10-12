// All dates are stored in UTC and shown in Swiss time, whatever the server timezone is.
export const TZ = "Europe/Zurich";

function tzOffsetMs(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** "2026-09-01T13:00" typed in Swiss time -> Date. */
export function fromZurichInput(value: string): Date {
  const naive = new Date(`${value.slice(0, 16)}:00Z`);
  if (Number.isNaN(naive.getTime())) throw new Error(`Invalid date: ${value}`);
  const first = new Date(naive.getTime() - tzOffsetMs(naive));
  return new Date(naive.getTime() - tzOffsetMs(first));
}

/** Date -> "2026-09-01T13:00" in Swiss time, for <input type="datetime-local">. */
export function toZurichInput(date: Date): string {
  return new Date(date.getTime() + tzOffsetMs(date)).toISOString().slice(0, 16);
}

/** Date -> "2026-09-01" in Swiss time. */
export function zurichDayKey(date: Date): string {
  return toZurichInput(date).slice(0, 10);
}

export function formatDate(date: Date, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(date);
}

export function formatDateRange(start: Date, end?: Date | null): string {
  if (!end) return `${formatDate(start)} · ${formatTime(start)}`;
  if (zurichDayKey(start) === zurichDayKey(end)) {
    return `${formatDate(start)} · ${formatTime(start)} – ${formatTime(end)}`;
  }
  return `${formatDate(start, { weekday: undefined })} → ${formatDate(end, { weekday: undefined })}`;
}

/** 120000 -> "1,200 CHF" (same style as the original site). */
export function formatMoney(cents: number, currency = "CHF"): string {
  const amount = cents / 100;
  const digits = Number.isInteger(amount) ? 0 : 2;
  return `${amount.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${currency}`;
}

/** "1200" or "1200.50" -> cents. */
export function parseMoney(value: string): number {
  const n = Number(value.replace(",", ".").trim());
  if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid amount: ${value}`);
  return Math.round(n * 100);
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86_400_000);
}
