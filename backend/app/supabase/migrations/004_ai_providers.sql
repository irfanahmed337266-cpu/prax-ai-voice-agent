-- =========================================================
-- PRAX Configurable Chatbot Platform
-- AI Provider / BYOK Configuration
-- =========================================================

create table if not exists public.ai_providers (
    id uuid primary key default gen_random_uuid(),

    chatbot_id uuid not null
        references public.chatbots(id)
        on delete cascade,

    provider text not null
        check (
            provider in (
                'gemini',
                'openai',
                'anthropic'
            )
        ),

    model text not null,

    api_key_encrypted text not null,

    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


create index if not exists idx_ai_providers_chatbot
on public.ai_providers(chatbot_id);


create index if not exists idx_ai_providers_active
on public.ai_providers(chatbot_id, is_active);


drop trigger if exists update_ai_providers_updated_at
on public.ai_providers;

create trigger update_ai_providers_updated_at
before update on public.ai_providers
for each row
execute function public.update_updated_at_column();