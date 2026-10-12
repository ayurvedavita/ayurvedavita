import { zurichDayKey } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { hit, ipFromHeaders } from "@/lib/rate-limit";

const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

export async function POST(request: Request) {
  if (BOT_RE.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
  let path = "";
  try {
    path = String((await request.json()).path ?? "");
  } catch {
    return new Response(null, { status: 400 });
  }
  // Only plain site paths: stops anyone from filling the database with made-up addresses.
  if (!/^\/[a-z0-9\-/]{0,99}$/.test(path) || path.startsWith("/admin") || path.split("/").length > 4) {
    return new Response(null, { status: 204 });
  }
  if (!hit(`track:${ipFromHeaders(request.headers)}`, 120, 60 * 60_000)) return new Response(null, { status: 204 });
  // Booking confirmation pages have a unique id each: count them together.
  if (path.startsWith("/booking/")) path = "/booking/[id]";
  const day = zurichDayKey(new Date());
  await prisma.pageView.upsert({
    where: { path_day: { path, day } },
    create: { path, day, count: 1 },
    update: { count: { increment: 1 } },
  });
  return new Response(null, { status: 204 });
}
