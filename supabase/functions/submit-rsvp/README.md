# Deploy `submit-rsvp`

1. In Resend, create an API key with sending access.
2. In Supabase, open **Edge Functions > Secrets** and add:
   - Name: `RESEND_API_KEY`
   - Value: the Resend API key
3. Open **Edge Functions** and deploy a new function named `submit-rsvp`.
4. Paste the contents of `index.ts` into the Supabase function editor.
5. Disable JWT verification for this public wedding form, then deploy.
6. Submit a test RSVP and confirm:
   - A row appears in **Table Editor > wedding_rsvps**.
   - An email appears in `jonandmik@gmail.com`.

Do not put the Resend API key in `index.html`, `script.js`, GitHub, or this folder.
