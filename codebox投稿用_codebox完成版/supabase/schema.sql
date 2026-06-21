create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  code text not null,
  description text,
  screenshot_url text,
  screenshot_urls text[] not null default '{}',
  archive_url text,
  archive_name text,
  archive_size integer,
  language text not null default 'javascript',
  ai_tool text,
  x_account text,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.post_delete_passwords (
  post_id uuid primary key references public.posts(id) on delete cascade,
  password_hash text not null
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_likes_count_idx on public.posts (likes_count desc);
create index posts_search_idx on public.posts using gin ((title || ' ' || code) gin_trgm_ops);
create index comments_post_id_idx on public.comments (post_id);

alter table public.posts
add column if not exists screenshot_urls text[] not null default '{}';

alter table public.posts
add column if not exists ai_tool text;

alter table public.posts
add column if not exists x_account text;

alter table public.posts
add column if not exists archive_url text;

alter table public.posts
add column if not exists archive_name text;

alter table public.posts
add column if not exists archive_size integer;

alter table public.posts enable row level security;
alter table public.post_delete_passwords enable row level security;
alter table public.comments enable row level security;

create policy "posts are public read" on public.posts for select using (true);
drop policy if exists "anonymous can insert posts" on public.posts;
create policy "comments are public read" on public.comments for select using (true);
create policy "anonymous can insert comments" on public.comments for insert with check (true);

create or replace function public.create_post_with_password(
  post_title text,
  post_code text,
  post_description text,
  post_screenshot_url text,
  post_screenshot_urls text[],
  post_archive_url text,
  post_archive_name text,
  post_archive_size integer,
  post_language text,
  post_ai_tool text,
  post_x_account text,
  delete_password text
)
returns uuid
language plpgsql
security definer
as $$
declare
  new_post_id uuid;
begin
  insert into public.posts (
    title,
    code,
    description,
    screenshot_url,
    screenshot_urls,
    archive_url,
    archive_name,
    archive_size,
    language,
    ai_tool,
    x_account
  )
  values (
    post_title,
    post_code,
    post_description,
    post_screenshot_url,
    coalesce(post_screenshot_urls, '{}'),
    nullif(post_archive_url, ''),
    nullif(post_archive_name, ''),
    post_archive_size,
    coalesce(post_language, 'javascript'),
    nullif(post_ai_tool, ''),
    nullif(post_x_account, '')
  )
  returning id into new_post_id;

  insert into public.post_delete_passwords (post_id, password_hash)
  values (new_post_id, crypt(delete_password, gen_salt('bf')));

  return new_post_id;
end;
$$;

create or replace function public.increment_like(post_id uuid)
returns void
language sql
security definer
as $$
  update public.posts
  set likes_count = likes_count + 1
  where id = post_id;
$$;

create or replace function public.delete_post_with_password(post_id uuid, password text)
returns boolean
language plpgsql
security definer
as $$
declare
  deleted_count integer;
begin
  delete from public.posts
  using public.post_delete_passwords
  where posts.id = post_delete_passwords.post_id
    and posts.id = post_id
    and post_delete_passwords.password_hash = crypt(password, post_delete_passwords.password_hash);

  get diagnostics deleted_count = row_count;
  return deleted_count > 0;
end;
$$;

insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('archives', 'archives', true)
on conflict (id) do nothing;

create policy "screenshots are public read"
on storage.objects for select
using (bucket_id = 'screenshots');

create policy "anonymous can upload screenshots"
on storage.objects for insert
with check (bucket_id = 'screenshots');

drop policy if exists "archives are public read" on storage.objects;
create policy "archives are public read"
on storage.objects for select
using (bucket_id = 'archives');

drop policy if exists "anonymous can upload archives" on storage.objects;
create policy "anonymous can upload archives"
on storage.objects for insert
with check (bucket_id = 'archives');
