-- Run this once in Supabase Dashboard > SQL Editor.
-- It creates the RSVP table and allows public form submissions without
-- allowing website visitors to read, edit, or delete RSVP records.

create table if not exists public.wedding_rsvps (
  id bigint generated always as identity primary key,
  full_name text not null check (char_length(full_name) between 2 and 120),
  attendance text not null check (
    attendance in ('Yes, I will attend', 'Sorry, I cannot attend')
  ),
  guest_count integer check (guest_count between 1 and 5),
  contact_number text check (
    contact_number is null or char_length(contact_number) <= 40
  ),
  message text check (message is null or char_length(message) <= 1000),
  submitted_at timestamptz not null default now(),
  constraint attending_guest_count_required check (
    attendance <> 'Yes, I will attend' or guest_count is not null
  ),
  constraint absent_guest_count_empty check (
    attendance <> 'Sorry, I cannot attend' or guest_count is null
  )
);

alter table public.wedding_rsvps enable row level security;

revoke all on table public.wedding_rsvps from anon, authenticated;
grant insert on table public.wedding_rsvps to anon, authenticated;
grant usage, select on sequence public.wedding_rsvps_id_seq to anon, authenticated;

drop policy if exists "Anyone can submit a wedding RSVP"
  on public.wedding_rsvps;

create policy "Anyone can submit a wedding RSVP"
on public.wedding_rsvps
for insert
to anon, authenticated
with check (
  char_length(full_name) between 2 and 120
  and attendance in ('Yes, I will attend', 'Sorry, I cannot attend')
);

comment on table public.wedding_rsvps is
  'Private RSVP responses for the Jon Madz and Coleene wedding website.';
