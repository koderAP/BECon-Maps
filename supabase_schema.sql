-- Create tables for Map App

create table if not exists public.map_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  lat decimal not null,
  lng decimal not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.map_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  location_id uuid references public.map_locations(id) on delete set null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.map_locations enable row level security;
alter table public.map_events enable row level security;

-- Create Policies
-- Allow public read access
create policy "Enable read access for all users" on public.map_locations for select using (true);
create policy "Enable read access for all users" on public.map_events for select using (true);

-- Allow full access for authenticated service roles (and admins if they sign in)
-- Since we are using a custom admin token, effectively we interact via service role key in usage, 
-- but for the frontend client (if we used supabase auth), we'd need more.
-- For now, the API uses SERVICE_ROLE_KEY to write, which bypasses RLS.
-- So RLS is mainly for public read safety.
