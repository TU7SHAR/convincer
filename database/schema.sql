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
