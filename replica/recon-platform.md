# Replica recon: Futurepedia → CS student platform

User scope: web platform with accounts, categorized AI tools, practical use cases, beginner learning and student opportunities. Research: 2026-10-30. Replaces the earlier one-page Handshake scope.

| Public source | Evidence |
|---|---|
| https://www.futurepedia.io/ | Tool stacks, workflow library, onboarding and progress positioning |
| https://www.futurepedia.io/ai-tools | Category hierarchy |
| https://www.futurepedia.io/ai-tools/code-assistant | Cards, category results, sort controls, pagination and saves |
| https://www.futurepedia.io/tool/claude | Overview, examples, pricing, limits and provider destination |

No login, competitor bundle/code/private API, licensed asset, rating, review, directory dataset or copied wording was used. Authenticated features are inferred from public positioning, not observed.

Screen inventory: S01 landing (sections and onboarding); S02 categories (category groups); S03 category results (cards/sort/pagination); S04 tool detail (uses/pricing/source); S05 personalized plan (advertised only).

Flows: F01 home→categories→results→detail→provider, four public transitions. F02 sorting controls observed; ranking formula unknown. F03 saves/counts observed; authenticated save flow untested. F04 role/goals/constraints→plan advertised, not executed.

Our additional flows: F05 signup/login/recovery; F06 cloud bookmarks; F07 lessons/progress; F08 project recipes; F09 opportunity search/detail/source; F10 collection; F11 submission/moderation.

Our 26 page types: discover, tools, tool detail, use cases, recipe detail, learning index, lesson reader, opportunities, internships, hackathons, events/research, opportunity detail, AI briefing, search, registration, login, recovery, password update, callback, dashboard, saved collection, profile, submission, moderation, sources and privacy.

Repeated components: sidebar, global search, breadcrumbs, filters, cards, pagination, save controls, forms, source links, recipe steps, prompt copy, lesson disclosures, progress indicators, moderation decisions, empty/loading/error/denied states.

Inferred model: Tool(name/category/provider/pricing/use cases/save totals) and Category hierarchy have high conceptual confidence; physical storage unknown. User/save has medium confidence; personalized plans low confidence. Campus Signal independently designs its own schema.

Excluded: competitor content, ratings, users, paid courses, editorial verification and exact design. No claim to cover every AI tool/website. Popularity uses our actual aggregate saves. New design is intentional.

Size: L for a public production platform. First integrated release implements the routes and data layer; email delivery, moderation provisioning, n8n activation and scaling require explicit completion checks. See backend.md.
