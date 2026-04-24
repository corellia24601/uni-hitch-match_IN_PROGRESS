-- Core enums
create type ride_role as enum ('driver', 'passenger');
create type ride_lifecycle as enum ('open', 'full', 'closed', 'expired');
create type passenger_lifecycle as enum ('searching', 'matched', 'closed');
create type thread_lifecycle as enum ('interested', 'pending', 'confirmed', 'completed', 'cancelled');
create type reservation_status as enum ('pending', 'confirmed', 'cancelled');
create type event_channel as enum ('email');
create type event_status as enum ('queued', 'sent', 'failed');

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  account_number text unique not null,
  name text not null,
  handle text unique not null,
  school_email text unique not null check (school_email like '%@illinois.edu'),
  phone text not null,
  bio text not null default '',
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists rides (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references profiles(user_id) on delete cascade,
  role ride_role not null,
  lifecycle ride_lifecycle not null default 'open',
  passenger_lifecycle passenger_lifecycle,
  depart_at timestamptz not null,
  departure text not null,
  arrival text not null,
  pickup_detail text not null default '',
  dropoff_detail text not null default '',
  notes text not null default '',
  flexible_minutes int not null default 0,
  allow_pets boolean not null default false,
  allow_smoking boolean not null default false,
  music_preference text not null default 'light',
  cancellation_policy text not null default 'flexible',
  expires_at timestamptz not null,
  seats_total int not null default 0,
  seats_remaining int not null default 0,
  luggage_total int not null default 0,
  luggage_remaining int not null default 0,
  seats_needed int not null default 0,
  luggage_needed int not null default 0,
  price_per_person_no_luggage numeric,
  price_per_luggage numeric,
  passenger_luggage_price numeric,
  price_pm boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references rides(id) on delete cascade,
  user_id uuid not null references profiles(user_id) on delete cascade,
  seats_reserved int not null,
  luggage_reserved int not null,
  status reservation_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists threads (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid references rides(id) on delete set null,
  kind text not null check (kind in ('direct', 'group')),
  title text not null,
  lifecycle thread_lifecycle not null default 'interested',
  created_by_user_id uuid not null references profiles(user_id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists thread_members (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references threads(id) on delete cascade,
  user_id uuid not null references profiles(user_id) on delete cascade,
  unique (thread_id, user_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references threads(id) on delete cascade,
  sender_user_id uuid not null references profiles(user_id) on delete cascade,
  text text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists message_reads (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references threads(id) on delete cascade,
  user_id uuid not null references profiles(user_id) on delete cascade,
  last_read_at timestamptz not null default now(),
  unique (thread_id, user_id)
);

create table if not exists contact_exchange_consents (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references threads(id) on delete cascade,
  user_id uuid not null references profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (thread_id, user_id)
);

create table if not exists saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(user_id) on delete cascade,
  name text not null,
  pool ride_role not null,
  date_from date,
  date_to date,
  departure text,
  arrival text,
  seat_threshold int,
  luggage_threshold int,
  sort_dir text not null default 'asc',
  created_at timestamptz not null default now()
);

create table if not exists notification_preferences (
  user_id uuid primary key references profiles(user_id) on delete cascade,
  interest boolean not null default true,
  confirm boolean not null default true,
  cancel boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists notification_events (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references profiles(user_id) on delete cascade,
  trigger_user_id uuid references profiles(user_id) on delete set null,
  type text not null check (type in ('interest', 'confirm', 'cancel')),
  title text not null,
  body text not null,
  channel event_channel not null default 'email',
  status event_status not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references profiles(user_id) on delete set null,
  target_type text not null,
  target_id uuid not null,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_rides_route_time on rides (departure, arrival, depart_at);
create index if not exists idx_messages_thread_time on messages (thread_id, created_at);
create index if not exists idx_events_recipient on notification_events (recipient_user_id, created_at);

alter table profiles enable row level security;
alter table rides enable row level security;
alter table threads enable row level security;
alter table thread_members enable row level security;
alter table messages enable row level security;
alter table message_reads enable row level security;
alter table contact_exchange_consents enable row level security;
alter table saved_searches enable row level security;
alter table notification_preferences enable row level security;
alter table notification_events enable row level security;
alter table reservations enable row level security;
alter table audit_events enable row level security;

create policy "profiles self read" on profiles
for select using (
  auth.uid() = user_id
  or exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
);

create policy "profiles self write" on profiles
for update using (auth.uid() = user_id);

create policy "rides public read" on rides for select using (true);
create policy "rides owner write" on rides for all using (auth.uid() = owner_user_id);

create policy "thread members read" on threads
for select using (
  exists (
    select 1 from thread_members tm
    where tm.thread_id = threads.id and tm.user_id = auth.uid()
  )
);

create policy "thread members read members" on thread_members
for select using (
  exists (
    select 1 from thread_members tm
    where tm.thread_id = thread_members.thread_id and tm.user_id = auth.uid()
  )
);

create policy "thread members write members" on thread_members
for insert with check (auth.uid() = user_id);

create policy "thread members read messages" on messages
for select using (
  exists (
    select 1 from thread_members tm
    where tm.thread_id = messages.thread_id and tm.user_id = auth.uid()
  )
);

create policy "thread members write messages" on messages
for insert with check (auth.uid() = sender_user_id);

create policy "own saved searches" on saved_searches
for all using (auth.uid() = user_id);

create policy "own notification prefs" on notification_preferences
for all using (auth.uid() = user_id);

create policy "own notifications" on notification_events
for select using (auth.uid() = recipient_user_id);

create policy "reservation participants" on reservations
for all using (
  auth.uid() = user_id
  or exists (select 1 from rides r where r.id = reservations.ride_id and r.owner_user_id = auth.uid())
);

create policy "thread consent participants" on contact_exchange_consents
for all using (
  exists (
    select 1 from thread_members tm
    where tm.thread_id = contact_exchange_consents.thread_id and tm.user_id = auth.uid()
  )
);

create policy "audit admin read" on audit_events
for select using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.is_admin = true)
);

