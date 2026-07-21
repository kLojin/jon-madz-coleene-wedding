# Production security checklist

These source changes must be paired with the deployed Supabase configuration.

## Apply now

1. Run `supabase/security-hardening.sql` in the Supabase SQL Editor.
2. Review the two passcode audit rows returned by the script. If either says **CHANGE IMMEDIATELY**, rotate it in the gallery Admin panel.
3. Add the Edge Function secret `ALLOWED_ORIGIN` using the exact deployed site origin, with no trailing slash.
4. Redeploy `supabase/functions/submit-rsvp/index.ts` with Verify JWT disabled.
5. Confirm the `wedding-photos` bucket shows a 50 MB file limit and only the approved image/video MIME types.
6. Run Supabase Security Advisor and resolve unexpected public table, function, or storage-policy findings.
7. Test one valid RSVP, a sixth rapid RSVP (must return HTTP 429), a valid upload, an invalid file type, gallery approval, and both passcodes.
8. Confirm your host applies the included `_headers` file. If it does not support that format, copy the same headers into the hosting configuration.

## Controls included

- RSVP data and rate-limit tables deny direct anonymous access.
- The public RSVP endpoint checks the website origin, rejects oversized bodies, uses a honeypot, validates every field, and rate-limits by a salted network-address hash plus a global hourly ceiling.
- Browser passcodes are held in memory only and disappear on reload.
- Storage enforces 50 MB, approved MIME types, approved path prefixes, and the gallery close date.
- Guest upload metadata is constrained by RLS.
- Supabase browser libraries are pinned to an exact version.

## Remaining architectural limits

- The photo bucket is public. A person who already has an asset URL can open it without the gallery passcode. Genuine private media requires a private bucket and short-lived signed URLs.
- IP-based RSVP limits reduce automated abuse but do not replace CAPTCHA/Turnstile against a distributed attack.
- Gallery passcodes are shared credentials rather than individual user accounts. Use long unique passphrases and rotate them after the event.
- The included `_headers` file supplies CSP, HSTS, clickjacking, MIME-sniffing, referrer, and permissions protections on compatible hosts; other hosts require equivalent configuration.
