# Backend checklist and activation limits

Implemented: Postgres/RLS; verified server sessions; HttpOnly Secure cookies; server refresh/global logout; same-origin mutations; owner-private bookmark/profile/progress/submission operations; app_metadata admin checks; bounded source-specific ingress; hashed scoped integration token. No service key in browser/repository. Private history/log/key tables have no public grants or policies by design.

Ten Node server tests cover CSRF, auth input, secure cookies, token-free responses, forged sessions, bookmark ownership and role spoofing. Rolled-back two-user Auth fixtures prove database profile isolation, bookmark ownership and fake-admin denial. See tests/server.test.mjs.

## Remaining user configuration
1. Supabase Auth → URL Configuration: Site URL `https://campus-signal-cs.hazy-rhino-9769.chatgpt.site`; allowed redirect `https://campus-signal-cs.hazy-rhino-9769.chatgpt.site/auth/callback`.
2. Configure custom SMTP for public signup/confirmation/reset delivery. Supabase's default mail service is restricted. No real email signup/reset was tested.
3. Create your account. A trusted Supabase administrator must assign `app_metadata.role=admin` to enable moderation. User profile metadata cannot grant it.
4. Import n8n/platform-collector.json, platform-expiry.json, platform-errors.json. Map `Campus Signal ingestion` (already saved, restricted to this Supabase domain). Set the error workflow on the other two; execute manually, inspect each branch, then publish schedules. Workflow file upload was denied, so execution/scheduling is not verified.
5. Review n8n trial status (UI showed three days remaining). No plan upgrades made.

The Site retains its existing owner-private ChatGPT access gate. App registration does not change Site audience. Backup verification, custom SMTP/domain, public audience, account deletion/export, broader source coverage and server pagination are later operational work. Do not describe this release as fully production-ready.
