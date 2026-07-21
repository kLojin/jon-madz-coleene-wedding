# Deploy `submit-rsvp`

1. Run `supabase/security-hardening.sql` in the Supabase SQL Editor.
2. In Resend, create an API key with sending access.
3. In Supabase, open **Edge Functions > Secrets** and add:
   - Name: `RESEND_API_KEY`
   - Value: the Resend API key
   - Name: `ALLOWED_ORIGIN`
   - Value: the exact deployed website origin, such as `https://example.com` (no trailing slash)
4. Open **Edge Functions** and deploy a function named `submit-rsvp`.
5. Paste the contents of `index.ts` into the Supabase function editor.
6. Disable JWT verification for this public wedding form, then deploy.
7. Submit a test RSVP and confirm:
   - A row appears in **Table Editor > wedding_rsvps**.
   - An email appears in `jonandmik@gmail.com`.
8. Send more than five test requests within 15 minutes and confirm the function returns HTTP 429.

Do not put the Resend API key in `index.html`, `script.js`, GitHub, or this folder.
