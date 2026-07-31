import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured.");
}

const sql = neon(process.env.DATABASE_URL);

await sql`
  alter table private_page_visit_events
  add column if not exists notification_attempted_at timestamptz
`;
await sql`
  alter table private_page_visit_events
  add column if not exists notification_sent_at timestamptz
`;
await sql`
  alter table private_page_visit_events
  add column if not exists notification_error text
`;

const columns = await sql`
  select column_name
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'private_page_visit_events'
    and column_name in (
      'notification_attempted_at',
      'notification_sent_at',
      'notification_error'
    )
  order by column_name
`;
const legacyPageLoadTable = await sql`
  select to_regclass('public.private_page_page_loads') is not null as exists
`;
const legacyExists = Boolean(legacyPageLoadTable[0]?.exists);
const legacyColumns = legacyExists
  ? await sql`
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'private_page_page_loads'
      order by ordinal_position
    `
  : [];
const legacyCount = legacyExists
  ? await sql`select count(*)::int as count from private_page_page_loads`
  : [{ count: 0 }];

console.log(
  JSON.stringify({
    notificationColumns: columns.map((column) => column.column_name),
    legacyPageLoadTableExists: legacyExists,
    legacyPageLoadColumns: legacyColumns.map((column) => column.column_name),
    legacyPageLoadRowCount: Number(legacyCount[0]?.count ?? 0),
  }),
);
