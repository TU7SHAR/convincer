import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");

// Manual .env parsing — no dotenv dependency needed
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
  if (!process.env[key]) process.env[key] = val;
}

const sql = neon(process.env.DATABASE_URL);

await sql`drop table if exists private_page_page_loads`;

await sql`
  create table if not exists private_page_page_loads (
    id uuid primary key default gen_random_uuid(),
    page_token_hash text not null
      references private_page_tokens(token_hash)
      on update cascade
      on delete cascade,
    ip_address text,
    city text,
    region text,
    country text,
    isp text,
    loaded_at timestamptz not null default now()
  )
`;

await sql`
  create index if not exists private_page_page_loads_token_loaded_idx
    on private_page_page_loads (page_token_hash, loaded_at desc)
`;

console.log("private_page_page_loads table ready (with location columns)");
