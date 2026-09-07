-- ============================================================================
-- PRAX Configurable Chatbot Platform
-- Migration 006: Deployments
-- ============================================================================

create table if not exists public.deployments (
    id uuid primary key default gen_random_uuid(),

    chatbot_id uuid not null
        references public.chatbots(id)
        on delete cascade,

    name text not null default 'Website Deployment',

    deployment_key_hash text not null unique,

    key_prefix text not null,

    allowed_domains text[] not null default '{}',

    is_active boolean not null default true,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists idx_deployments_chatbot_id
    on public.deployments(chatbot_id);

create index if not exists idx_deployments_key_hash
    on public.deployments(deployment_key_hash);

create index if not exists idx_deployments_active
    on public.deployments(is_active);

-- ---------------------------------------------------------------------------
-- Updated-at trigger
-- ---------------------------------------------------------------------------

drop trigger if exists set_deployments_updated_at
    on public.deployments;

create trigger set_deployments_updated_at
before update on public.deployments
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.deployments enable row level security;

-- Backend uses the server-side Supabase key.
-- Public clients never receive direct database access.