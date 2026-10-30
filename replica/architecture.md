# Replica architect

Dependency-free browser ES modules/CSS compile into a Sites Cloudflare Worker. Supabase provides Postgres/Auth; scoped Supabase Edge ingress accepts collection; n8n Cloud is the intended scheduler. Existing Site identity and audience retained.

Worker verifies Supabase /user, refreshes sessions server-side and uses HttpOnly Secure SameSite=Lax cookies. Mutations require same Origin. Browser has no service-role key. Global logout revokes refresh sessions; existing access JWTs retain normal expiry.

Tables: existing listings/history/collection_runs; tools/use_cases/learning_tracks; owner-private profiles/bookmarks/progress/submissions; public sources; private hashed integration_keys. Admin uses server-controlled app_metadata, never user_metadata. Tables have RLS.

APIs: GET /api/catalog (published data, max 1,000/type); /api/auth/{register,login,reset,password,session,logout,me}; /api/{bookmarks,progress,profile,submissions}; /api/admin (server-assigned role). Supabase /functions/v1/campus-ingest accepts only bounded source imports, expiry and redacted failure reports with its own scoped token.

URLs deduplicate imports; changed listing content is archived. Fetch errors never close jobs. Event start/end and application deadlines stay distinct. Unknown data stays unknown. Tools discovered on GitHub remain pending review. Validated primary-source article/opportunity metadata is published with attribution.

Risks: SMTP and auth redirect setup, source breadth, operational moderation, stale-source monitoring, bounded catalog retrieval and backup verification. Before thousands of entries, add indexed server search/keyset pagination/caching. No subscription upgrades made.
