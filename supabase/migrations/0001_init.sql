-- Kogni initial schema.
-- Run via `supabase db push` (with the CLI linked to your project) or paste
-- into the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth.users, created automatically on sign up.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  plan_id text not null default 'free' check (plan_id in ('free', 'pro', 'business')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are self-readable" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles are self-updatable" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile + starter credit grant whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');

  insert into public.credit_transactions (user_id, amount, reason)
  values (new.id, 100, 'signup_bonus');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('post', 'carousel', 'ad', 'story', 'thumbnail', 'custom')),
  prompt text not null,
  format text not null,
  status text not null default 'queued',
  cover_image_url text,
  model text,
  credits_consumed integer not null default 0,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id, created_at desc);

alter table public.projects enable row level security;

create policy "projects are owner-readable" on public.projects
  for select using (auth.uid() = user_id);
create policy "projects are owner-writable" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "projects are owner-updatable" on public.projects
  for update using (auth.uid() = user_id);
create policy "projects are owner-deletable" on public.projects
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- project_assets
-- ---------------------------------------------------------------------------
create table if not exists public.project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  url text not null,
  width integer not null,
  height integer not null,
  is_selected boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists project_assets_project_id_idx on public.project_assets (project_id);

alter table public.project_assets enable row level security;

create policy "project_assets follow parent project" on public.project_assets
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- carousels + carousel_slides
-- ---------------------------------------------------------------------------
create table if not exists public.carousels (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  slide_count integer not null,
  audience text,
  tone text,
  created_at timestamptz not null default now()
);

alter table public.carousels enable row level security;

create policy "carousels follow parent project" on public.carousels
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

create table if not exists public.carousel_slides (
  id uuid primary key default gen_random_uuid(),
  carousel_id uuid not null references public.carousels (id) on delete cascade,
  "position" integer not null,
  role text not null,
  headline text not null,
  body text not null,
  image_url text,
  prompt text not null,
  status text not null default 'queued'
);

create index if not exists carousel_slides_carousel_id_idx on public.carousel_slides (carousel_id, "position");

alter table public.carousel_slides enable row level security;

create policy "carousel_slides follow parent carousel" on public.carousel_slides
  for all using (
    exists (
      select 1 from public.carousels c
      join public.projects p on p.id = c.project_id
      where c.id = carousel_id and p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- generations + generation_attempts (audit trail, always server-written)
-- ---------------------------------------------------------------------------
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null,
  model text not null,
  prompt text not null,
  status text not null default 'queued',
  credits_cost integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.generations enable row level security;

create policy "generations are owner-readable" on public.generations
  for select using (auth.uid() = user_id);
-- No insert/update policy for authenticated role: generations are written
-- exclusively by server code using the service-role key, so credits can never
-- be forged from the client.

create table if not exists public.generation_attempts (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.generations (id) on delete cascade,
  attempt_number integer not null,
  status text not null,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.generation_attempts enable row level security;

create policy "generation_attempts are owner-readable" on public.generation_attempts
  for select using (
    exists (select 1 from public.generations g where g.id = generation_id and g.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- templates (public read, managed by admins via service role)
-- ---------------------------------------------------------------------------
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text not null,
  slide_count integer,
  style text not null,
  preview_url text not null,
  prompt text not null
);

alter table public.templates enable row level security;

create policy "templates are publicly readable" on public.templates
  for select using (true);

-- ---------------------------------------------------------------------------
-- favorites
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

alter table public.favorites enable row level security;

create policy "favorites are owner-managed" on public.favorites
  for all using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- brand_kits
-- ---------------------------------------------------------------------------
create table if not exists public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null default 'My Brand',
  primary_color text not null default '#000000',
  secondary_color text not null default '#FFFFFF',
  accent_color text not null default '#3B82F6',
  font text not null default 'Inter',
  style text not null default 'Minimal',
  logo_url text,
  tone_of_voice text,
  created_at timestamptz not null default now()
);

alter table public.brand_kits enable row level security;

create policy "brand_kits are owner-managed" on public.brand_kits
  for all using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- credit_transactions: append-only ledger. Balance = sum(amount).
-- ---------------------------------------------------------------------------
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null, -- positive = grant, negative = consumption
  reason text not null,
  project_id uuid references public.projects (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists credit_transactions_user_id_idx on public.credit_transactions (user_id, created_at desc);

alter table public.credit_transactions enable row level security;

create policy "credit_transactions are owner-readable" on public.credit_transactions
  for select using (auth.uid() = user_id);
-- No client insert policy: credits are only ever debited/credited by
-- server-side code (service role) so balances can't be manipulated client-side.

create or replace view public.credit_balances as
  select user_id, coalesce(sum(amount), 0) as balance
  from public.credit_transactions
  group by user_id;

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id text not null check (plan_id in ('free', 'pro', 'business')),
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions are owner-readable" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- storage bucket for generated assets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-assets', 'project-assets', true)
on conflict (id) do nothing;

create policy "project-assets are publicly readable"
  on storage.objects for select
  using (bucket_id = 'project-assets');

create policy "users can upload to their own folder"
  on storage.objects for insert
  with check (bucket_id = 'project-assets' and (storage.foldername(name))[1] = auth.uid()::text);
