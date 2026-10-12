import "server-only";
import { headers } from "next/headers";

// Simple in-memory limits. The site runs as a single server on Railway, so memory is shared by all visitors.
// A restart resets the counters, which is fine: they only exist to stop automated abuse.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function prune(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}

/** Counts one hit for `key`. Returns false once `limit` hits happened within `windowMs`. */
export function hit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  prune(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

/** True if `key` has already reached `limit` (without counting a new hit). */
export function blocked(key: string, limit: number): boolean {
  const bucket = buckets.get(key);
  return Boolean(bucket && bucket.resetAt > Date.now() && bucket.count >= limit);
}

export function reset(key: string) {
  buckets.delete(key);
}

/** Best guess of the visitor's IP address behind Railway's proxy. */
export async function clientIp(): Promise<string> {
  return ipFromHeaders(await headers());
}

export function ipFromHeaders(h: Headers): string {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim() || "unknown";
  return h.get("x-real-ip") ?? "unknown";
}
