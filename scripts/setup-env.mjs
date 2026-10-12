// Creates .env from .env.example if it is missing, and fills SESSION_SECRET without printing it.
import { randomBytes } from "node:crypto";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";

if (!existsSync(".env")) {
  copyFileSync(".env.example", ".env");
  console.log("Created .env from .env.example.");
}

const env = readFileSync(".env", "utf8");
const empty = /^SESSION_SECRET=""[ \t]*$/m;
if (empty.test(env)) {
  writeFileSync(".env", env.replace(empty, `SESSION_SECRET="${randomBytes(32).toString("hex")}"`));
  console.log("Generated SESSION_SECRET.");
}
console.log("Next: set ADMIN_EMAIL and ADMIN_PASSWORD in .env.");
