-- =========================================================
-- PRAX Configurable Chatbot Platform
-- Initial Database Schema
-- =========================================================

create extension if not exists "uuid-ossp";

create extension if not exists vector
with schema extensions;


-- =========================================================
-- CHATBOTS
-- =========================================================

create table if not exists public.chatbots (
    id uuid primary key default gen_random_uuid(),

    name text not null,
    business_name text,
    use_case text,
    website_url text,

    system_prompt text,

    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- CHATBOT STAGES
-- =========================================================

create table if not exists public.chatbot_stages (
    id uuid primary key default gen_random_uuid(),

    chatbot_id uuid not null
        references public.chatbots(id)
        on delete cascade,

    name text not null,
    description text,

    stage_order integer not null default 0,

    is_start boolean not null default false,
    is_terminal boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- STAGE TRANSITIONS
-- =========================================================

create table if not exists public.stage_transitions (
    id uuid primary key default gen_random_uuid(),

    chatbot_id uuid not null
        references public.chatbots(id)
        on delete cascade,

    from_stage_id uuid not null
        references public.chatbot_stages(id)
        on delete cascade,

    to_stage_id uuid not null
        references public.chatbot_stages(id)
        on delete cascade,

    condition text,

    priority integer not null default 0,

    created_at timestamptz not null default now()
);


-- =========================================================
-- CONVERSATIONS
-- =========================================================

create table if not exists public.conversations (
    id uuid primary key default gen_random_uuid(),

    chatbot_id uuid not null
        references public.chatbots(id)
        on delete cascade,

    external_user_id text,

    current_stage_id uuid
        references public.chatbot_stages(id)
        on delete set null,

    state jsonb not null default '{}'::jsonb,

    status text not null default 'active'
        check (
            status in (
                'active',
                'handoff',
                'closed'
            )
        ),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- MESSAGES
-- =========================================================

create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),

    conversation_id uuid not null
        references public.conversations(id)
        on delete cascade,

    role text not null
        check (
            role in (
                'system',
                'user',
                'assistant',
                'tool'
            )
        ),

    content text not null,

    metadata jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now()
);


-- =========================================================
-- KNOWLEDGE BASES
-- =========================================================

create table if not exists public.knowledge_bases (
    id uuid primary key default gen_random_uuid(),

    chatbot_id uuid not null
        references public.chatbots(id)
        on delete cascade,

    name text not null,
    description text,

    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- DOCUMENTS
-- =========================================================

create table if not exists public.documents (
    id uuid primary key default gen_random_uuid(),

    knowledge_base_id uuid not null
        references public.knowledge_bases(id)
        on delete cascade,

    name text not null,

    source_type text not null default 'file',

    source_url text,
    storage_path text,
    mime_type text,

    metadata jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now()
);


-- =========================================================
-- DOCUMENT CHUNKS
-- =========================================================

create table if not exists public.document_chunks (
    id uuid primary key default gen_random_uuid(),

    document_id uuid not null
        references public.documents(id)
        on delete cascade,

    content text not null,

    chunk_index integer not null,

    embedding extensions.vector(1536),

    metadata jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now()
);


-- =========================================================
-- HANDOFF RULES
-- =========================================================

create table if not exists public.handoff_rules (
    id uuid primary key default gen_random_uuid(),

    chatbot_id uuid not null
        references public.chatbots(id)
        on delete cascade,

    name text not null,

    condition text not null,

    priority integer not null default 0,

    is_active boolean not null default true,

    created_at timestamptz not null default now()
);


-- =========================================================
-- BRANDING
-- =========================================================

create table if not exists public.branding (
    id uuid primary key default gen_random_uuid(),

    chatbot_id uuid not null unique
        references public.chatbots(id)
        on delete cascade,

    primary_color text,
    secondary_color text,

    logo_url text,

    bot_name text,

    welcome_message text,

    widget_position text not null default 'bottom-right',

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- INDEXES
-- =========================================================

create index if not exists idx_chatbot_stages_chatbot
on public.chatbot_stages(chatbot_id);

create index if not exists idx_stage_transitions_chatbot
on public.stage_transitions(chatbot_id);

create index if not exists idx_conversations_chatbot
on public.conversations(chatbot_id);

create index if not exists idx_messages_conversation
on public.messages(conversation_id);

create index if not exists idx_knowledge_bases_chatbot
on public.knowledge_bases(chatbot_id);

create index if not exists idx_documents_knowledge_base
on public.documents(knowledge_base_id);

create index if not exists idx_document_chunks_document
on public.document_chunks(document_id);

create index if not exists idx_handoff_rules_chatbot
on public.handoff_rules(chatbot_id);


-- =========================================================
-- UPDATED_AT FUNCTION
-- =========================================================

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

drop trigger if exists update_chatbots_updated_at
on public.chatbots;

create trigger update_chatbots_updated_at
before update on public.chatbots
for each row
execute function public.update_updated_at_column();


drop trigger if exists update_chatbot_stages_updated_at
on public.chatbot_stages;

create trigger update_chatbot_stages_updated_at
before update on public.chatbot_stages
for each row
execute function public.update_updated_at_column();


drop trigger if exists update_conversations_updated_at
on public.conversations;

create trigger update_conversations_updated_at
before update on public.conversations
for each row
execute function public.update_updated_at_column();


drop trigger if exists update_knowledge_bases_updated_at
on public.knowledge_bases;

create trigger update_knowledge_bases_updated_at
before update on public.knowledge_bases
for each row
execute function public.update_updated_at_column();


drop trigger if exists update_branding_updated_at
on public.branding;

create trigger update_branding_updated_at
before update on public.branding
for each row
execute function public.update_updated_at_column();
