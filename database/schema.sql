create extension if not exists pgcrypto;

create table if not exists private_page_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text unique not null
    check (length(token_hash) = 64),
  recipient_label text,
  is_active boolean not null default true,
  is_closed boolean not null default false,
  closed_reason text,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  closed_at timestamptz,
  constraint private_page_tokens_closed_reason_check
    check (
      (is_closed = false and closed_reason is null)
      or
      (is_closed = true and closed_reason is not null)
    )
);

create table if not exists private_page_responses (
  id uuid primary key default gen_random_uuid(),
  page_token_hash text not null
    references private_page_tokens(token_hash)
    on update cascade
    on delete restrict,
  response_type text not null
    check (
      response_type in (
        'talk',
        'need_time',
        'written_message',
        'no_contact'
      )
    ),
  message text
    check (message is null or char_length(message) between 1 and 5000),
  contact_method text,
  phone_number text
    check (phone_number is null or char_length(phone_number) between 3 and 30),
  preferred_time text,
  waiting_period text,
  reply_permission text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists private_page_responses_token_created_idx
  on private_page_responses (page_token_hash, created_at desc);

comment on table private_page_responses is
  'Stores only deliberate response submissions from the private page.';

comment on column private_page_tokens.token_hash is
  'SHA-256 hash of the private URL token. The raw token is never stored.';

alter table private_page_responses
  add column if not exists phone_number text;

create table if not exists private_page_visit_sessions (
  session_id uuid primary key,
  page_token_hash text not null
    references private_page_tokens(token_hash)
    on update cascade
    on delete cascade,
  consent_version text not null,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists private_page_visit_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null
    references private_page_visit_sessions(session_id)
    on delete cascade,
  event_type text not null
    check (event_type in ('session_started', 'section_view')),
  route_label text not null
    check (char_length(route_label) between 1 and 120),
  section_key text,
  metadata jsonb not null default '{}'::jsonb,
  notification_attempted_at timestamptz,
  notification_sent_at timestamptz,
  notification_error text,
  created_at timestamptz not null default now(),
  constraint private_page_visit_events_section_check
    check (
      (event_type = 'session_started' and section_key is null)
      or
      (event_type = 'section_view' and section_key is not null)
    )
);

alter table private_page_visit_events
  add column if not exists notification_attempted_at timestamptz;

alter table private_page_visit_events
  add column if not exists notification_sent_at timestamptz;

alter table private_page_visit_events
  add column if not exists notification_error text;

create index if not exists private_page_visit_sessions_token_started_idx
  on private_page_visit_sessions (page_token_hash, started_at desc);

create index if not exists private_page_visit_events_session_created_idx
  on private_page_visit_events (session_id, created_at asc);

create unique index if not exists private_page_visit_session_started_unique
  on private_page_visit_events (session_id, event_type)
  where event_type = 'session_started';

create unique index if not exists private_page_visit_section_unique
  on private_page_visit_events (session_id, section_key)
  where event_type = 'section_view';

comment on table private_page_visit_sessions is
  'Stores visit sessions only after the visitor explicitly opts in.';

comment on table private_page_visit_events is
  'Stores named section arrivals only; no IP address, device fingerprint, inferred phone number, or raw private URL token.';
