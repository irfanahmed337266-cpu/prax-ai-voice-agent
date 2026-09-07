-- =========================================================
-- PRAX Configurable Chatbot Platform
-- Row Level Security
-- =========================================================

alter table public.chatbots
enable row level security;

alter table public.chatbot_stages
enable row level security;

alter table public.stage_transitions
enable row level security;

alter table public.conversations
enable row level security;

alter table public.messages
enable row level security;

alter table public.knowledge_bases
enable row level security;

alter table public.documents
enable row level security;

alter table public.document_chunks
enable row level security;

alter table public.handoff_rules
enable row level security;

alter table public.branding
enable row level security;

alter table public.ai_providers
enable row level security;