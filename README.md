# Campus Signal

Original CS student discovery website, informed by public Handshake research. No competitor data copied. Starter resources are clearly labelled; they are not verified open listings.

## Run
Serve `dist/` with any static server, e.g. `python -m http.server 4173 --directory dist`. No npm dependencies. Bookmarks are local to the browser and do not sync across devices.

## Supabase activation
Campus Signal now uses its own Supabase project `dtkrcefozqhhyhvspxbx`. The schema is applied and eight official resource-directory links are stored as published records; these are not verified open vacancies. The website uses a publishable key with read-only public access. n8n remains inactive pending instance access. For a separate installation, create a project and run `supabase/schema.sql` once in its SQL editor, and set `supabaseUrl` and `publishableKey` in `dist/config.js`. Use only the publishable key in the frontend. Review RLS with Supabase advisors before a public launch. Public clients can read only published, unexpired records. No public insert/update policy exists.

Only trusted service credentials can collect, moderate, expire and archive records. Review records in Supabase Table Editor before setting `status=published`. Verify source permissions, eligibility, location and deadlines yourself. Pending collection is not a claim that a vacancy is open. Popularity defaults to zero; engagement collection and personalized rankings are future work.

## n8n activation
The four JSON files are importable inactive workflows, not already installed or live-tested. Import them into your own n8n instance. In n8n Variables set:

- `CAMPUS_SUPABASE_URL`: project's HTTPS API origin.
- `CAMPUS_GREENHOUSE_BOARD`: an employer's public board token, after confirming collection permission.
- `CAMPUS_EMPLOYER_NAME`: matching display name.

Create an HTTP Custom Auth credential named `Campus Signal Supabase service`. Its JSON must contain `headers` with `apikey` and `Authorization` (`Bearer ` plus the legacy service_role JWT). Keep this only in n8n's encrypted credentials, never in frontend config or Git. Map every Supabase HTTP node to that credential after import. New Supabase secret keys can instead use the apikey header alone when supported by the project's API settings. Test that configuration against your project.

1. `01-greenhouse.json`: scheduled six-hour employer API fetch, CS internship title filter, normalization, URL upsert to review queue. Repeated ingestion updates the same URL and archives changed fields. Missing source jobs are not automatically closed; feed absence is ambiguous.
2. `02-ai-feed.json`: twelve-hour official Hugging Face RSS collection, link validation, pending queue. Stores title/source and original generic summary, not full copied articles. Existing feed items are rechecked; older items outside the feed are not monitored.
3. `03-expire.json`: hourly expiry only for explicit deadlines entered by reviewers. HTTP errors never imply closure.
4. `04-errors.json`: private redacted failure logs. Select this workflow as the Error Workflow in each of the other three workflows' settings after import. Test with a deliberate invalid board token, confirm a private collection_runs entry, then restore it.

Run each collector manually against a test project before activating schedules. Check a pending row, ingest again to confirm no duplicate, change its title to confirm version history, publish it to confirm website visibility, and check expiry. n8n version/credential integration must be verified in the target instance. Neither n8n nor database runtime was available for these checks in this build.

## Coverage and limits
This is a discovery MVP, not the complete large platform: no student accounts, notification delivery, application tracking, employer submissions, automated AI summarization, personalized ranking, generic website scraping, or LinkedIn crawler. Live mode currently loads at most 200 published rows and filters them client-side; use server pagination/search before scaling. Location values from employer APIs are free text; the MVP dropdown offers broad exact-match regions and will need normalization before live launch. See replica/recon.md and replica/features.csv for evidence and scope.

## Repository
Public source repository: https://github.com/theraimzhanov/campus-signal. The private Sites deployment has its own source repository. Database and n8n activation remain pending as described above.
