create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  name text not null check (char_length(btrim(name)) between 2 and 60),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(btrim(comment)) between 10 and 600),
  created_at timestamptz not null default now()
);

create table if not exists public.site_likes (
  visitor_id uuid primary key,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;
alter table public.site_likes enable row level security;

drop policy if exists "Anyone can read public reviews" on public.reviews;
create policy "Anyone can read public reviews"
  on public.reviews
  for select
  to anon
  using (true);

drop policy if exists "Anyone can publish a valid review" on public.reviews;
create policy "Anyone can publish a valid review"
  on public.reviews
  for insert
  to anon
  with check (
    char_length(btrim(name)) between 2 and 60
    and rating between 1 and 5
    and char_length(btrim(comment)) between 10 and 600
  );

revoke all on table public.reviews from public, anon, authenticated;
grant select on table public.reviews to anon;
grant insert (name, rating, comment) on table public.reviews to anon;
revoke all on sequence public.reviews_id_seq from public, anon, authenticated;
grant usage, select on sequence public.reviews_id_seq to anon;
revoke all on table public.site_likes from public, anon, authenticated;

create or replace function public.get_public_summary()
returns table (review_count bigint, average_rating numeric, like_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*) from public.reviews),
    coalesce((select avg(rating)::numeric(3, 2) from public.reviews), 0),
    (select count(*) from public.site_likes);
$$;

revoke all on function public.get_public_summary() from public, anon, authenticated;
grant execute on function public.get_public_summary() to anon;

create or replace function public.toggle_site_like(p_visitor_id uuid)
returns table (liked boolean, like_count bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_rows integer;
begin
  if p_visitor_id is null then
    raise exception 'A visitor ID is required.';
  end if;

  insert into public.site_likes (visitor_id)
  values (p_visitor_id)
  on conflict (visitor_id) do nothing;

  get diagnostics inserted_rows = row_count;

  if inserted_rows = 0 then
    delete from public.site_likes
    where visitor_id = p_visitor_id;
  end if;

  liked := inserted_rows = 1;
  select count(*) into like_count from public.site_likes;
  return next;
end;
$$;

revoke all on function public.toggle_site_like(uuid) from public, anon, authenticated;
grant execute on function public.toggle_site_like(uuid) to anon;
