import "server-only";

import { neon } from "@neondatabase/serverless";

import type { PrivateResponseInput } from "@/src/lib/validation";

type TokenState = {
  exists: boolean;
  isActive: boolean;
  isClosed: boolean;
  closedReason: string | null;
  storageAvailable: boolean;
};

type InsertResult = {
  status: "inserted" | "inactive" | "closed" | "rate_limited" | "missing";
  id?: string;
};

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(databaseUrl);
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function getTokenState(tokenHash: string): Promise<TokenState> {
  if (!isDatabaseConfigured()) {
    return {
      exists: false,
      isActive: true,
      isClosed: false,
      closedReason: null,
      storageAvailable: false,
    };
  }

  const sql = getSql();
  const rows = await sql`
    select is_active, is_closed, closed_reason
    from private_page_tokens
    where token_hash = ${tokenHash}
    limit 1
  `;
  const row = rows[0] as
    | {
        is_active: boolean;
        is_closed: boolean;
        closed_reason: string | null;
      }
    | undefined;

  if (!row) {
    return {
      exists: false,
      isActive: true,
      isClosed: false,
      closedReason: null,
      storageAvailable: true,
    };
  }

  return {
    exists: true,
    isActive: row.is_active,
    isClosed: row.is_closed,
    closedReason: row.closed_reason,
    storageAvailable: true,
  };
}

export async function storePrivateResponse(
  tokenHash: string,
  input: PrivateResponseInput,
): Promise<InsertResult> {
  const sql = getSql();

  await sql`
    insert into private_page_tokens (token_hash, recipient_label)
    values (${tokenHash}, 'private recipient')
    on conflict (token_hash) do nothing
  `;

  const metadata = JSON.stringify({ schemaVersion: 1 });
  const rows = await sql`
    with token_state as (
      select token_hash, is_active, is_closed
      from private_page_tokens
      where token_hash = ${tokenHash}
      for update
    ),
    recent as (
      select count(*)::int as response_count
      from private_page_responses
      where page_token_hash = ${tokenHash}
        and created_at > now() - interval '10 minutes'
    ),
    inserted as (
      insert into private_page_responses (
        page_token_hash,
        response_type,
        message,
        contact_method,
        phone_number,
        preferred_time,
        waiting_period,
        reply_permission,
        metadata
      )
      select
        token_state.token_hash,
        ${input.responseType},
        ${input.message ?? null},
        ${input.contactMethod ?? null},
        ${input.phoneNumber ?? null},
        ${input.preferredTime ?? null},
        ${input.waitingPeriod ?? null},
        ${input.replyPermission ?? null},
        ${metadata}::jsonb
      from token_state, recent
      where token_state.is_active = true
        and token_state.is_closed = false
        and recent.response_count < 5
      returning id
    ),
    closed as (
      update private_page_tokens
      set
        is_closed = true,
        closed_reason = 'no_contact',
        closed_at = now()
      where token_hash = ${tokenHash}
        and ${input.responseType} = 'no_contact'
        and exists (select 1 from inserted)
      returning token_hash
    )
    select
      coalesce((select is_active from token_state), false) as is_active,
      coalesce((select is_closed from token_state), false) as was_closed,
      coalesce((select response_count from recent), 0) as response_count,
      (select id::text from inserted limit 1) as inserted_id
  `;

  const row = rows[0] as
    | {
        is_active: boolean;
        was_closed: boolean;
        response_count: number;
        inserted_id: string | null;
      }
    | undefined;

  if (!row) {
    return { status: "missing" };
  }

  if (row.inserted_id) {
    return { status: "inserted", id: row.inserted_id };
  }

  if (!row.is_active) {
    return { status: "inactive" };
  }

  if (row.was_closed) {
    return { status: "closed" };
  }

  if (Number(row.response_count) >= 5) {
    return { status: "rate_limited" };
  }

  return { status: "missing" };
}
