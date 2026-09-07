-- ============================================================
-- PRAX Configurable Chatbot Platform
-- Migration 005
-- Phase 5.5: pgvector similarity search
-- ============================================================

create or replace function public.match_document_chunks(
    query_embedding extensions.vector(1536),
    match_knowledge_base_id uuid,
    match_threshold float default 0.20,
    match_count integer default 5
)
returns table (
    id uuid,
    document_id uuid,
    content text,
    chunk_index integer,
    metadata jsonb,
    created_at timestamptz,
    similarity float
)
language sql
stable
as $$
    select
        dc.id,
        dc.document_id,
        dc.content,
        dc.chunk_index,
        dc.metadata,
        dc.created_at,
        1 - (dc.embedding <=> query_embedding) as similarity
    from public.document_chunks as dc
    inner join public.documents as d
        on d.id = dc.document_id
    inner join public.knowledge_bases as kb
        on kb.id = d.knowledge_base_id
    where
        d.knowledge_base_id = match_knowledge_base_id
        and kb.is_active = true
        and dc.embedding is not null
        and 1 - (dc.embedding <=> query_embedding) >= match_threshold
    order by
        dc.embedding <=> query_embedding
    limit least(greatest(match_count, 1), 50);
$$;