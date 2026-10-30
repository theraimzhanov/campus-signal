# Replica test plan

F01: directory→keyword/category/pagination→tool detail→provider; test empty and nested refresh.
F02: use cases→recipe→tools→copy prompt; test long text/mobile.
F03: learning→lesson/exercise→completion; unauthenticated completion must go to login.
F04: opportunity section→detail→source; preserve unknown eligibility/deadline.
F05: signup/login/reset forms, native validation, server errors, confirmation-pending state. Live email delivery requires SMTP/redirect setup; unverified.
F06: saved/profile/progress/submissions: anonymous denial, verified owner, cross-user denial. Unit/DB fixtures run; full real-account browser pass pending.
F07: moderation: anonymous/non-admin denial, user_metadata spoof denied; provisioned admin browser pass pending.
F08: sources→normalize→scoped ingress→DB→catalog; repeat import, reject missing key. Independent integration test is not an n8n schedule.
F09: n8n import→credential mapping→manual run→error route→publication→second scheduled run. Blocked on native upload/manual import.

Run `node --test tests/server.test.mjs`. Preview with `node scripts/build.mjs` then `node scripts/dev.mjs`. Final results in outputs/platform-test-report.md.
