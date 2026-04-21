create table if not exists public.favorite_papers (
  user_id uuid not null references auth.users (id) on delete cascade,
  paper_id text not null,
  source text not null default 'arxiv',
  title text not null,
  summary text not null default '',
  authors text[] not null default '{}',
  categories text[] not null default '{}',
  primary_category text,
  arxiv_url text not null,
  pdf_url text,
  comment text,
  published_at timestamptz,
  updated_at timestamptz,
  saved_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, paper_id)
);

create index if not exists favorite_papers_user_saved_at_idx
  on public.favorite_papers (user_id, saved_at desc);

alter table public.favorite_papers enable row level security;

drop policy if exists "Users can view own favorite papers" on public.favorite_papers;
create policy "Users can view own favorite papers"
  on public.favorite_papers
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own favorite papers" on public.favorite_papers;
create policy "Users can insert own favorite papers"
  on public.favorite_papers
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own favorite papers" on public.favorite_papers;
create policy "Users can update own favorite papers"
  on public.favorite_papers
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own favorite papers" on public.favorite_papers;
create policy "Users can delete own favorite papers"
  on public.favorite_papers
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
