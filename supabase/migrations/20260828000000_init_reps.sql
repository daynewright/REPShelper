-- REPS Helper schema. RLS: authenticated users only see their own rows.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  legal_name text not null default '',
  spouse_name text,
  real_estate_employment text
    check (
      real_estate_employment is null
      or real_estate_employment in ('independent', 'owner_5pct', 'w2_employee')
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tax_year_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  year integer not null,
  group_rental_activities boolean not null default false,
  unique (user_id, year)
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  address text,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  occurred_on date not null,
  duration_minutes integer not null check (duration_minutes > 0),
  started_at timestamptz,
  ended_at timestamptz,
  category text not null
    check (category in ('real_property_trade', 'rental', 'other_work')),
  property_id uuid references public.properties (id) on delete restrict,
  performer text not null default 'taxpayer'
    check (performer in ('taxpayer', 'spouse')),
  activity_kind text,
  notes text not null,
  source text not null check (source in ('timer', 'manual')),
  created_at timestamptz not null default now(),
  constraint time_entries_rental_property check (
    (category = 'rental' and property_id is not null)
    or (category <> 'rental' and property_id is null)
  ),
  constraint time_entries_spouse_rental check (
    performer = 'taxpayer' or category = 'rental'
  )
);

create table public.active_timers (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  started_at timestamptz not null,
  category text not null
    check (category in ('real_property_trade', 'rental', 'other_work')),
  property_id uuid references public.properties (id) on delete restrict,
  performer text not null default 'taxpayer'
    check (performer in ('taxpayer', 'spouse')),
  activity_kind text,
  notes text,
  constraint active_timers_rental_property check (
    (category = 'rental' and property_id is not null)
    or (category <> 'rental' and property_id is null)
  ),
  constraint active_timers_spouse_rental check (
    performer = 'taxpayer' or category = 'rental'
  )
);

create table public.participation_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  year integer not null,
  property_id uuid references public.properties (id) on delete cascade,
  test_code text not null
    check (
      test_code in (
        'substantially_all',
        '100_and_most',
        'spa',
        'five_of_ten',
        'personal_service',
        'facts'
      )
    ),
  claimed boolean not null default true,
  note text,
  unique (user_id, year, test_code, property_id)
);

create unique index participation_flags_grouped_unique
  on public.participation_flags (user_id, year, test_code)
  where property_id is null;

create index time_entries_user_date_idx
  on public.time_entries (user_id, occurred_on);

create index properties_user_idx
  on public.properties (user_id);

alter table public.profiles enable row level security;
alter table public.tax_year_settings enable row level security;
alter table public.properties enable row level security;
alter table public.time_entries enable row level security;
alter table public.active_timers enable row level security;
alter table public.participation_flags enable row level security;

create policy "profiles_select" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);
create policy "profiles_insert" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "profiles_update" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "tax_year_settings_select" on public.tax_year_settings
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "tax_year_settings_insert" on public.tax_year_settings
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "tax_year_settings_update" on public.tax_year_settings
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "tax_year_settings_delete" on public.tax_year_settings
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "properties_select" on public.properties
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "properties_insert" on public.properties
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "properties_update" on public.properties
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "properties_delete" on public.properties
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "time_entries_select" on public.time_entries
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "time_entries_insert" on public.time_entries
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "time_entries_update" on public.time_entries
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "time_entries_delete" on public.time_entries
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "active_timers_select" on public.active_timers
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "active_timers_insert" on public.active_timers
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "active_timers_update" on public.active_timers
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "active_timers_delete" on public.active_timers
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "participation_flags_select" on public.participation_flags
  for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "participation_flags_insert" on public.participation_flags
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "participation_flags_update" on public.participation_flags
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "participation_flags_delete" on public.participation_flags
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.tax_year_settings to authenticated;
grant select, insert, update, delete on public.properties to authenticated;
grant select, insert, update, delete on public.time_entries to authenticated;
grant select, insert, update, delete on public.active_timers to authenticated;
grant select, insert, update, delete on public.participation_flags to authenticated;
