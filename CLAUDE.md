# Fluid Intimacy - Project Instructions

## Status (LIVE since Nov 19 2026, T-0619: open course + paid PDF guide, merged to main)

- Open course: no login, no accounts, no AI coach. 18+ confirmation kept (stored in the browser). Lesson progress is local only.
- Paid products (live since Nov 19 2026): free 5-question quiz at `/guide`, then a personal PDF guide made from the answers (no AI at run time).
  Prices live in one place, `src/guide/quiz.ts`: guide EUR 12, guide + deep dive + 30-day plan EUR 19, couples edition +EUR 5.
- History: archived 2026-09-15 after the Firebase project `fluid-b6251` was deleted from the Google account (all logins broke). The open course no longer needs Firebase at all.
- Marc's OK Nov 19 2026 (T-0619): keep the name Fluid, repo unarchived, site unpaused, open course live.
- EU withdrawal waiver (Nov 19 2026, T-0633, Marc OK): a required tick box above "Get my PDF" (instant delivery; the 14-day withdrawal right is lost once the download starts), also enforced in `guide-checkout` (400 without `withdrawalWaiver: true`; consent time saved in Stripe metadata `withdrawal_waiver_at`). Seller line under the button: Dizid Web Development, KvK 91308380, VAT NL004437513B72, dev@dizid.com. No business address shown (none is public on Marc's other sites either).
- Security headers (Nov 20 2026, T-0636): `netlify.toml` adds Permissions-Policy and a **report-only** CSP (blocks nothing; everything is same-site except Google Fonts). Violations: one line each in the `csp-report` function log (`/api/csp-report`). Enforce later by renaming the header to `Content-Security-Policy` once that log stays clean. A new outside host must be added to the policy; `node scripts/csp-hash.mjs` after a build flags inline scripts.

## Deployment

- Netlify site: `fluid33` (site ID `4904bea0-d314-432e-8b5a-42bf8e3084bc`), URL `fluid33.netlify.app`. Unpaused Nov 19 2026 (Netlify API `PUT /api/v1/sites/<id>/enable`; `updateSite {disabled:false}` is ignored). Auto-builds on push to main are still on: put `[skip netlify]` in the newest commit and laptop-deploy.
- Laptop deploy only (no Netlify build minutes). Deploy from a checkout with a REAL `node_modules`: a symlinked one ships broken functions (all 502, Nov 19). Afterwards curl `/api/guide-checkout` (expect 405 on GET). Steps: `npm run build`, then `netlify deploy --no-build --dir dist --site <id>` (netlify-cli 23 builds by default; `--no-build` skips it).
- GitHub repo: `dizid/fluid` (public; archived 2026-09-15, unarchived Nov 19 2026).
- Stripe: Marc's one shared live account. The guide checkout uses inline EUR prices (no Price IDs) and tags sessions with metadata `app=fluid-guide`; only those are served as PDFs. No webhook. Env var: `STRIPE_SECRET_KEY` (already on the Netlify site from the old paywall; checked Nov 19: valid live key of the shared account, it is a secret var so the CLI shows it masked but functions do get it). Old price `price_1Sv9sS8gBja0qkMxhe47jQll` (AI coach, one-time) is no longer used.

## Design Changes

**Always ask for user confirmation before making design/UI changes.**

When modifying styles, layouts, colors, typography, or visual elements, describe the proposed changes and wait for approval before implementing.

## Project Overview

- Vue 3 + Vite + Pinia (persisted state in localStorage), PWA
- Netlify Functions: `guide-checkout` (POST /api/guide-checkout), `guide-pdf` (GET /api/guide-pdf?session_id=)
- PDF: pdf-lib, standard fonts (`netlify/lib/pdf-builder.ts`); text blocks in `netlify/lib/guide-text.ts` (server-only), picked by `netlify/lib/guide-assembly.ts`
- SEO: `build/prerender.ts` writes static HTML per page (title, description, canonical, JSON-LD, lesson text), sitemap.xml and robots.txt at build. Page list + `SITE_URL`/`SITE_NAME`: `src/seo/pages.ts`.

## Key Features

- 4 free modules, 12 lessons (`src/content/modules/index.ts`)
- `/guide` quiz with free lesson picks, paid PDF, `/guide/download` (Stripe return page, retries while payment confirms)
- Support address shown to buyers: dev@dizid.com (`src/guide/copy.ts`)
