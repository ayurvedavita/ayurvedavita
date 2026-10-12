import path from "node:path";
import Database from "better-sqlite3";
import { isAdmin } from "@/lib/auth";
import { zurichDayKey } from "@/lib/format";

/** Full copy of the database (events, dates, bookings). Keep it somewhere safe. */
export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const file = path.resolve((process.env.DATABASE_URL ?? "").replace(/^file:/, ""));
  const db = new Database(file, { readonly: true, fileMustExist: true });
  try {
    const snapshot = db.serialize();
    return new Response(new Uint8Array(snapshot), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="ayurvedavita-backup-${zurichDayKey(new Date())}.db"`,
      },
    });
  } finally {
    db.close();
  }
}
