-- Run this once in Supabase Dashboard > SQL Editor if you already ran
-- rsvp-setup.sql when the RSVP form still collected email addresses.

-- Keep any email values already collected, but stop requiring the column.
alter table public.wedding_rsvps
alter column email drop not null;

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
