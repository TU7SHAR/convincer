import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
for (const line of readFileSync(resolve(__dirname, ".env"), "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  const key = t.slice(0, eq).trim();
  const val = t.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
  if (!process.env[key]) process.env[key] = val;
}

const sql = neon(process.env.DATABASE_URL);

// Order matters — child tables first, then parents
await sql`truncate table private_page_visit_events restart identity cascade`;
await sql`truncate table private_page_visit_sessions restart identity cascade`;
await sql`truncate table private_page_page_loads restart identity cascade`;
await sql`truncate table private_page_responses restart identity cascade`;
await sql`truncate table private_page_tokens restart identity cascade`;

console.log("All tables cleared.");