-- Invoices: one row per invoice id (matches invoice.details.id)
-- Run this in Supabase SQL Editor or via supabase db push

create table if not exists public.invoices (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_user_id_updated_at_idx
  on public.invoices (user_id, updated_at desc);

alter table public.invoices enable row level security;

create policy "invoices_select_own"
  on public.invoices
  for select
  using (auth.uid() = user_id);

create policy "invoices_insert_own"
  on public.invoices
  for insert
  with check (auth.uid() = user_id);

create policy "invoices_update_own"
  on public.invoices
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "invoices_delete_own"
  on public.invoices
  for delete
  using (auth.uid() = user_id);
