import "server-only";

import { neon } from "@neondatabase/serverless";

import type { VisitEventInput } from "@/src/lib/visit-validation";

export type AdminResponse = {
  id: string;
  responseType: string;
  message: string | null;
  contactMethod: string | null;
  phoneNumber: string | null;
  preferredTime: string | null;
  waitingPeriod: string | null;
  replyPermission: string | null;
  createdAt: string;
};

export type AdminVisitEvent = {
  id: string;
  eventType: string;
  sectionKey: string | null;
  createdAt: string;
  notificationSentAt: string | null;
  notificationError: string | null;
};

export type AdminVisitSession = {
  sessionId: string;
  startedAt: string;
  lastSeenAt: string;
  events: AdminVisitEvent[];
};

export type AdminDashboardData = {
  tokenState: {
    exists: boolean;
    isActive: boolean;
    isClosed: boolean;
    closedReason: string | null;
  };
  responses: AdminResponse[];
  visits: AdminVisitSession[];
  totals: {
    responses: number;
    visits: number;
    sectionViews: number;
  };
};

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(databaseUrl);
}

export async function storeConsentedVisitEvent(
  tokenHash: string,
  input: VisitEventInput,
) {
  const sql = getSql();
  const metadata = JSON.stringify({
    schemaVersion: 1,
    consent: true,
    consentVersion: input.consentVersion,
  });

  await sql`
    insert into private_page_tokens (token_hash, recipient_label)
    values (${tokenHash}, 'private recipient')
    on conflict (token_hash) do nothing
  `;

  const rows = await sql`
    with saved_session as (
      insert into private_page_visit_sessions (
        session_id,
        page_token_hash,
        consent_version,
        last_seen_at
      )
      values (
        ${input.sessionId}::uuid,
        ${tokenHash},
        ${input.consentVersion},
        now()
      )
      on conflict (session_id) do update
      set last_seen_at = now()
      where private_page_visit_sessions.page_token_hash = excluded.page_token_hash
      returning session_id
    )
    insert into private_page_visit_events (
      session_id,
      event_type,
      route_label,
      section_key,
      metadata
    )
    select
      saved_session.session_id,
      ${input.eventType},
      ${input.route},
      ${input.sectionKey ?? null},
      ${metadata}::jsonb
    from saved_session
    on conflict do nothing
    returning id::text, created_at::text
  `;
  const row = rows[0] as
    | {
        id: string;
        created_at: string;
      }
    | undefined;

  return row
    ? {
        id: row.id,
        createdAt: row.created_at,
      }
    : null;
}

export async function storeVisitNotificationResult(
  eventId: string,
  result: { sent: boolean; error?: string },
) {
  const sql = getSql();
  const safeError = result.error?.slice(0, 500) ?? null;

  await sql`
    update private_page_visit_events
    set
      notification_attempted_at = now(),
      notification_sent_at = case when ${result.sent} then now() else null end,
      notification_error = case
        when ${result.sent} then null
        else ${safeError}
      end
    where id = ${eventId}::uuid
  `;
}

export async function getAdminDashboardData(
  tokenHash: string,
): Promise<AdminDashboardData> {
  const sql = getSql();

  const tokenPromise = sql`
    select is_active, is_closed, closed_reason
    from private_page_tokens
    where token_hash = ${tokenHash}
    limit 1
  `;
  const responsesPromise = sql`
    select
      id::text,
      response_type,
      message,
      contact_method,
      phone_number,
      preferred_time,
      waiting_period,
      reply_permission,
      created_at::text
    from private_page_responses
    where page_token_hash = ${tokenHash}
    order by created_at desc
    limit 200
  `;
  const visitsPromise = sql`
    select
      session_id::text,
      started_at::text,
      last_seen_at::text
    from private_page_visit_sessions
    where page_token_hash = ${tokenHash}
    order by started_at desc
    limit 100
  `;
  const eventsPromise = sql`
    select
      events.id::text,
      events.session_id::text,
      events.event_type,
      events.section_key,
      events.created_at::text,
      events.notification_sent_at::text,
      events.notification_error
    from private_page_visit_events events
    inner join private_page_visit_sessions sessions
      on sessions.session_id = events.session_id
    where sessions.page_token_hash = ${tokenHash}
    order by events.created_at asc
    limit 1000
  `;

  const [tokenRows, responseRows, visitRows, eventRows] = await Promise.all([
    tokenPromise,
    responsesPromise,
    visitsPromise,
    eventsPromise,
  ]);
  const tokenRow = tokenRows[0] as
    | {
        is_active: boolean;
        is_closed: boolean;
        closed_reason: string | null;
      }
    | undefined;
  const eventsBySession = new Map<string, AdminVisitEvent[]>();

  for (const rawEvent of eventRows) {
    const event = rawEvent as {
      id: string;
      session_id: string;
      event_type: string;
      section_key: string | null;
      created_at: string;
      notification_sent_at: string | null;
      notification_error: string | null;
    };
    const events = eventsBySession.get(event.session_id) ?? [];

    events.push({
      id: event.id,
      eventType: event.event_type,
      sectionKey: event.section_key,
      createdAt: event.created_at,
      notificationSentAt: event.notification_sent_at,
      notificationError: event.notification_error,
    });
    eventsBySession.set(event.session_id, events);
  }

  const responses = responseRows.map((rawResponse) => {
    const response = rawResponse as {
      id: string;
      response_type: string;
      message: string | null;
      contact_method: string | null;
      phone_number: string | null;
      preferred_time: string | null;
      waiting_period: string | null;
      reply_permission: string | null;
      created_at: string;
    };

    return {
      id: response.id,
      responseType: response.response_type,
      message: response.message,
      contactMethod: response.contact_method,
      phoneNumber: response.phone_number,
      preferredTime: response.preferred_time,
      waitingPeriod: response.waiting_period,
      replyPermission: response.reply_permission,
      createdAt: response.created_at,
    };
  });
  const visits = visitRows.map((rawVisit) => {
    const visit = rawVisit as {
      session_id: string;
      started_at: string;
      last_seen_at: string;
    };

    return {
      sessionId: visit.session_id,
      startedAt: visit.started_at,
      lastSeenAt: visit.last_seen_at,
      events: eventsBySession.get(visit.session_id) ?? [],
    };
  });

  return {
    tokenState: {
      exists: Boolean(tokenRow),
      isActive: tokenRow?.is_active ?? true,
      isClosed: tokenRow?.is_closed ?? false,
      closedReason: tokenRow?.closed_reason ?? null,
    },
    responses,
    visits,
    totals: {
      responses: responses.length,
      visits: visits.length,
      sectionViews: eventRows.filter(
        (event) =>
          (event as { event_type: string }).event_type === "section_view",
      ).length,
    },
  };
}

export async function deleteVisitSession(
  tokenHash: string,
  sessionId: string,
) {
  const sql = getSql();
  const rows = await sql`
    delete from private_page_visit_sessions
    where session_id = ${sessionId}::uuid
      and page_token_hash = ${tokenHash}
    returning session_id
  `;

  return rows.length === 1;
}
export async function setPrivatePageActive(
  tokenHash: string,
  isActive: boolean,
) {
  const sql = getSql();

  await sql`
    insert into private_page_tokens (
      token_hash,
      recipient_label,
      is_active
    )
    values (
      ${tokenHash},
      'private recipient',
      ${isActive}
    )
    on conflict (token_hash) do update
    set is_active = excluded.is_active
  `;
}

export type PageLoadRecord = {
  loadedAt: Date;
  ip: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  isp: string | null;
};

export async function recordPageLoad(
  tokenHash: string,
  geo: { ip: string | null; city: string | null; region: string | null; country: string | null; isp: string | null } = { ip: null, city: null, region: null, country: null, isp: null },
): Promise<PageLoadRecord> {
  const sql = getSql();

  await sql`
    insert into private_page_tokens (token_hash, recipient_label)
    values (${tokenHash}, 'private recipient')
    on conflict (token_hash) do nothing
  `;

  const rows = await sql`
    insert into private_page_page_loads (page_token_hash, ip_address, city, region, country, isp)
    values (${tokenHash}, ${geo.ip}, ${geo.city}, ${geo.region}, ${geo.country}, ${geo.isp})
    returning loaded_at, ip_address, city, region, country, isp
  `;

  const row = rows[0] as { loaded_at: string; ip_address: string | null; city: string | null; region: string | null; country: string | null; isp: string | null } | undefined;

  return {
    loadedAt: row ? new Date(row.loaded_at) : new Date(),
    ip: row?.ip_address ?? null,
    city: row?.city ?? null,
    region: row?.region ?? null,
    country: row?.country ?? null,
    isp: row?.isp ?? null,
  };
}
