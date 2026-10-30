# Campus Signal

A multi-page CS student workspace: categorized AI tools, practical use cases, beginner learning, internships, hackathons, community events, research resources and an AI briefing. Built independently using the Replica recon/architect/design/build/backend/test/diff workflow with Futurepedia's public discovery patterns as a reference. No competitor code, assets or directory data copied.

## Run locally
Node 22 or newer; no external packages required.

```sh
node scripts/build.mjs
node scripts/dev.mjs
node --test tests/server.test.mjs
```

Open http://127.0.0.1:4173. Routes are served by the Worker adapter, including nested tool, project and lesson pages. Edit src/, not generated worker/index.js or dist/server/index.js. Scripts/build.mjs embeds the HTML/CSS/JS into a deployable Worker.

## Features
- AI tool directory with categories, keyword/level filters, pagination, actual aggregate-save sorting, original student examples and official provider links.
- 12 original project recipes with steps, suggested tools, starter prompts and deliverables.
- 5 learning paths / 21 lessons, exercises and account-synced progress.
- Separate internship, hackathon and event boards with source links and supplied dates.
- AI feed briefing, global search, resource sources/freshness page.
- Email registration/login/recovery forms and server-side Supabase Auth integration; secure HttpOnly session cookies and same-origin writes.
- Cloud bookmarks, private profile, submission history and role-protected moderation.

## Backend
Supabase project `dtkrcefozqhhyhvspxbx`. Initial schema and platform migration are in supabase/. RLS isolates user-owned data. Admins are assigned through server-controlled `app_metadata.role=admin`; users cannot grant themselves access through profile metadata. Private integration hashes/history/logs are not publicly readable.

The worker uses only a publishable Supabase key and the caller's verified access token. Supabase Edge ingress keeps the service key inside Supabase. n8n uses a distinct scoped token in its encrypted Header Auth credential, not the service-role key. No tokens are stored in this repository.

## Collection and n8n
Current exports: n8n/platform-collector.json, platform-expiry.json and platform-errors.json. Earlier numbered exports are legacy and should not be used for this release.

The collector has branches for official Hugging Face RSS, Greenhouse employer API, MLH public event metadata, official Python community events, and GitHub public repository metadata. It validates inputs, deduplicates source URLs, preserves source links, and tracks successful sources. GitHub tool candidates remain pending moderation. Primary-source opportunity/article metadata is published with verification caveats. Failures never imply closure. Explicit event end dates and application deadlines are distinct.

The `Campus Signal ingestion` credential already exists in n8n, restricted to the Supabase project domain. Exports reference its ID. Native browser upload was denied twice, so automated import and scheduled n8n execution are NOT confirmed. Import the three files manually, map the credential if necessary, set the error workflow on collector/expiry, run manually and inspect every branch, then publish schedules. Collector runs every 12 hours; expiry every 24 hours. Failure routes send redacted error records.

`scripts/check-collectors.mjs` performs one-time independent source/ingress integration checks, not n8n installation. `scripts/run-collector-check.mjs` reads the scoped token from hidden stdin. Never paste it into source or command arguments. Successful initial imports populate the database; repeating the check updates/deduplicates by URL.

## Auth activation and honest limits
In Supabase Auth URL Configuration, set the Site URL to `https://campus-signal-cs.hazy-rhino-9769.chatgpt.site` and allow `https://campus-signal-cs.hazy-rhino-9769.chatgpt.site/auth/callback`. Configure custom SMTP for general public email confirmation/reset delivery. Dashboard browser access was denied, so these settings were not changed; live email registration/recovery remain unverified. Create an app account and assign an admin role through trusted administration before using moderation.

The deployed Site retains its existing owner-private ChatGPT gate. Registration in this app does not make the Site public. No audience or subscription changes were made. n8n reported three trial days remaining at setup.

This release does not cover every AI tool or website. It has no AI-generated personalized plan, provider model calls, notification delivery, automated account deletion/export, payments, or LinkedIn scraper. Before large-scale operation, add server-side indexed search/pagination (current catalog cap: 1,000/type), backups verification, auth abuse controls and moderation operations. Never present source-imported metadata as a guarantee of open applications, price, eligibility, or editorial endorsement.

Research and validation: replica/recon.md, architecture.md, backend.md, test-plan.md, bugs.md, features.csv and parity.md. Source repository: https://github.com/theraimzhanov/campus-signal.
