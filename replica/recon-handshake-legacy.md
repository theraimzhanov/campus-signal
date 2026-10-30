# Replica recon: Handshake → Campus Signal

Scope authorized by user: web discovery of opportunities for CS students, with an original design and additional AI/project discovery. Research date: 2026-10-30. Public reading only; no account access, crawler, source bundles, private endpoints, or proprietary assets.

## Sources
| Source | Evidence |
|---|---|
| https://joinhandshake.com/students/ | Career discovery, events and AI learning positioning |
| https://support.joinhandshake.com/hc/en-us/articles/218693408-Searching-for-Jobs-and-Internships | Search, location, job types, work arrangements, eligibility, sorting and cards |

The events help URL attempted during research was unavailable and is not evidence. No logged-in screens or mobile states were tested. Product behavior described in documentation is distinguished from direct observation below.

## Screen inventory
| ID | Screen | Evidence | Components / states |
|---|---|---|---|
| S01 | Public student landing page | Observed public page | Navigation, signup CTA, career/AI/event sections; populated state |
| S02 | Jobs discovery | Public help documentation | Search, filters, results, sorting; actual account UI not inspected |
| S03 | Listing details | Inferred destination of discovery | Detail and apply destination; unverified layout |
| S04 | Career preferences/profile | Help documentation | Interests and qualifications; account required |
| S05 | Events discovery | Marketing mention only | Career events; details and filters unverified |

## User flows
F01: S01 → signup → S04 → S02. Account steps untested; exact click count unknown.
F02: S02 → search/filter → matching results → S03 → provider application. Filtering documented; application steps not observed.
F03: S01 → events discovery (S05). Event registration flow unverified.
Campus Signal implemented flow: discovery → optional keyword/category/location → details → official source (2 clicks from discovery without filters).
Edge cases: no matching results, no bookmarks, malformed stored bookmarks, database outage, unknown eligibility, unavailable deadline, unsafe source URL.

## Components
Navigation, keyword input, category controls, location filter, sort select, resource card, bookmark toggle, detail dialog, empty state, data-source status.

## Inferred data model
Opportunity(title, organization, location, type, qualifications, compensation, deadline): high confidence in field concepts from help article; backend structure unknown.
Student(profile, interests, saved items): medium confidence; actual storage unknown.
Event(title, host, schedule): low confidence from marketing only.
Campus Signal adds category, source_url, verified_at, moderation status, versions and collection runs; these are our design decisions, not claims about Handshake.

## Original design
Campus Signal uses a quiet green editorial desk, serif accent headline, typographic arrow artwork, independent cards and an AI briefing sidebar. No Handshake layout, name, logos, screenshots or copy shipped. The user requested a complete visual change, so pixel parity is intentionally out of scope.

## Scope and size
5 source screen concepts / 3 source flows; MVP implements one discovery page with details and saved view. M for a reviewed live pilot; larger platform remains L. Hardest parts: authorized source coverage, changes/duplicate handling across sources, truthful eligibility and freshness. Excluded: employer network, university agreements, original listings database, recruiter messaging, in-platform applications and proprietary AI courses.

## Delivered versus pending
Working starter directory, local bookmarks, filters, source links and details. Supabase schema/RLS/history and 4 importable n8n workflows prepared. Database activation, n8n credentials and schedules, live ingestion and real popularity remain pending. Starter resources are explicitly labelled; no fictional open vacancies or popularity counts.
