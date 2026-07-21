-- Run once in Supabase SQL Editor before deploying the hardened Edge Function.
-- This migration removes direct public RSVP inserts, adds server-side rate
-- tracking, and enforces storage limits for the public wedding uploader.

revoke all on table public.wedding_rsvps from anon, authenticated;
revoke usage, select on sequence public.wedding_rsvps_id_seq from anon, authenticated;

drop policy if exists "Anyone can submit a wedding RSVP"
  on public.wedding_rsvps;

create table if not exists public.rsvp_rate_limits (
  id bigint generated always as identity primary key,
  key_hash text not null check (char_length(key_hash) = 64),
  attempted_at timestamptz not null default now()
);

create index if not exists rsvp_rate_limits_lookup_idx
  on public.rsvp_rate_limits (key_hash, attempted_at desc);

create index if not exists rsvp_rate_limits_cleanup_idx
  on public.rsvp_rate_limits (attempted_at);

alter table public.rsvp_rate_limits enable row level security;
revoke all on table public.rsvp_rate_limits from anon, authenticated;

-- Enforce limits at Storage, because browser checks can be bypassed.
update storage.buckets
set
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]::text[]
where id = 'wedding-photos';

drop policy if exists "Guests can upload wedding photos" on storage.objects;

create policy "Guests can upload wedding photos"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'wedding-photos'
  and public.is_gallery_open()
  and (
    (
      name like 'originals/uploads/%'
      and lower(storage.extension(name)) in (
        'jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif',
        'mp4', 'mov', 'webm'
      )
    )
    or (
      name like 'optimized/uploads/%'
      and lower(storage.extension(name)) = 'webp'
    )
  )
);

-- Guests may create only the metadata shape produced by the uploader.
alter table public.wedding_uploads enable row level security;

drop policy if exists "Guests can create upload records"
  on public.wedding_uploads;

create policy "Guests can create upload records"
on public.wedding_uploads
for insert
to anon, authenticated
with check (
  public.is_gallery_open()
  and file_path like 'originals/uploads/%'
  and file_type in ('image', 'video')
  and mime_type in (
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  )
  and char_length(file_name) between 1 and 255
  and char_length(coalesce(guest_name, '')) <= 80
  and char_length(coalesce(caption, '')) <= 240
  and album in (
    'guest-gallery',
    'ceremony',
    'reception',
    'portraits',
    'preparation',
    'afterparty'
  )
  and approved = (not public.is_approval_required())
  and deleted_at is null
);

revoke select, update, delete on public.wedding_uploads
  from anon, authenticated;
grant insert on public.wedding_uploads to anon, authenticated;

-- Security check: if either row says CHANGE IMMEDIATELY, rotate the passcode
-- in the gallery Admin panel before publishing the URL.
select
  'admin passcode' as credential,
  case
    when public.is_admin_passcode('admin1234') then 'CHANGE IMMEDIATELY'
    else 'custom value detected'
  end as status
union all
select
  'guest passcode',
  case
    when public.is_gallery_passcode('guest2027') then 'CHANGE IMMEDIATELY'
    else 'custom value detected'
  end;

notify pgrst, 'reload schema';

