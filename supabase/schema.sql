-- ============================================================================
-- Gozmar CMS — Supabase schema
-- Run this in Supabase → SQL Editor (or via the Supabase CLI).
-- Creates a single-row `cms_content` table that holds the entire site model
-- as JSON, plus Row Level Security so the public can READ but only admins WRITE.
-- ============================================================================

create table if not exists public.cms_content (
    id          integer primary key default 1,
    data        jsonb not null default '{}'::jsonb,
    updated_at  timestamptz not null default now()
);

-- Seed the single row (id = 1). The admin CMS always reads/writes row id = 1.
insert into public.cms_content (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.cms_content enable row level security;

-- Public (anon) can READ the published content (the site needs this).
drop policy if exists "Public read cms_content" on public.cms_content;
create policy "Public read cms_content"
    on public.cms_content
    for select
    using (true);

-- Only authenticated admins may WRITE. Two options:
--   (A) Any logged-in user (simplest; lock down via Supabase Auth users):
drop policy if exists "Admins write cms_content" on public.cms_content;
create policy "Admins write cms_content"
    on public.cms_content
    for all
    to authenticated
    using (true)
    with check (true);

--   (B) RECOMMENDED for production: restrict to users with an admin claim.
--       Set this claim in Supabase Auth (user_metadata.app_metadata.role = 'admin'
--       or via an Edge Function / trigger). Then replace the policy above with:
-- create policy "Admin-role write cms_content"
--     on public.cms_content
--     for all
--     to authenticated
--     using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' )
--     with check ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );

-- Grant the anon/authenticated roles access (Supabase auto-grants; explicit for clarity):
grant select on public.cms_content to anon, authenticated;
grant update, insert, delete on public.cms_content to authenticated;
