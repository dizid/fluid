# Fluid Intimacy - Project Instructions

## Status (T-0594, Nov 16 2026: branch keepbusy/T-0594-open-course, NOT live)

- Open course: no login, no accounts, no AI coach. 18+ confirmation kept (stored in the browser). Lesson progress is local only.
- Paid products (built, not live): free 5-question quiz at `/guide`, then a personal PDF guide made from the answers (no AI at run time).
  Prices live in one place, `src/guide/quiz.ts`: guide EUR 12, guide + deep dive + 30-day plan EUR 19, couples edition +EUR 5.
- History: archived 2026-09-15 after the Firebase project `fluid-b6251` was deleted from the Google account (all logins broke). The open course no longer needs Firebase at all.
- Going live needs Marc: unpause the Netlify site, OK the Stripe sales on the shared account, the name question (fluidintimacy.com is someone else's couples-course business), and terms/contact text for paid products. See ~/AI-COMPANY/output/marc-ok-needed.md (T-0594).

## Deployment

- Netlify site: `fluid33` (site ID `4904bea0-d314-432e-8b5a-42bf8e3084bc`), URL `fluid33.netlify.app`. The site is DISABLED (paused) since the archive: deploys upload but never go live, not even drafts.
- Laptop deploy only (no Netlify build minutes): `npm run build`, then `netlify deploy --no-build --dir dist --site <id>` (netlify-cli 23 builds by default; `--no-build` skips it).
- GitHub repo: `dizid/fluid` (public, archived 2026-09-15: read-only, the branch can't be pushed until it's unarchived).
- Stripe: Marc's one shared live account. The guide checkout uses inline EUR prices (no Price IDs) and tags sessions with metadata `app=fluid-guide`; only those are served as PDFs. No webhook. Env var: `STRIPE_SECRET_KEY` (already on the Netlify site from the old paywall). Old price `price_1Sv9sS8gBja0qkMxhe47jQll` (AI coach, one-time) is no longer used.

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
