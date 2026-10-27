# 00-audit.md — SproutBox A/B testing repo audit

**Repo:** `sproutboxindia` (Next.js app, Vercel: https://sproutboxindia.vercel.app)
**Audited:** 2026-10-22
**Status:** Draft

## Stack

| Item | Detail |
|------|--------|
| Framework | Next.js 16.2.1, App Router (`app/`), TypeScript, root layout `app/layout.tsx` (no `src/`) |
| Styling | Tailwind CSS v4, glassmorphism theme |
| Auth / DB | Supabase (Auth + PostgreSQL on Neon); `lib/supabase/` (server/client/middleware clients), `lib/auth.ts` server actions |
| Animations | Framer Motion |
| UI | shadcn-ish primitives + `@base-ui/react` in `components/ui/` |
| i18n | **None installed.** No i18n library, no translation files. (Playbook rule 2 requires en/kn/hi for variant strings — a lightweight i18n module must be added; see Phase 1.) |
| Analytics | Google Analytics hardcoded in `app/layout.tsx` (GTM `G-3S2T96R14P`, `strategy="afterInteractive"`). No PostHog, no consent banner, no cookie policy. |
| Deploy config | `next.config.ts` with `output: 'standalone'` |
| Env (`.env.local`) | `AUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL` (Neon), `NEXT_PUBLIC_APP_URL`. No PostHog vars. |

## Where things live

| Item | Path |
|------|------|
| Root layout | `app/layout.tsx` |
| Marketing layout (Navbar + Footer) | `app/(marketing)/layout.tsx` |
| Landing page | `app/(marketing)/page.tsx` (renders Hero, Problem, Solution, HowItWorks, Benefits, Features, CTA) |
| Landing sections | `components/sections/{Hero,Problem,Solution,HowItWorks,Benefits,Features,CTA}.tsx` |
| Navbar | `components/layout/Navbar.tsx` |
| Footer | `components/layout/Footer.tsx` |
| Login | `app/(auth)/login/page.tsx` (email/password, server action `signIn`) |
| Signup | `app/(auth)/signup/page.tsx` (role picker grower/restaurant/admin + name/email/password, server action `signUp`) |
| Auth callback / signout | `app/auth/callback/`, `app/auth/signout/` |
| Auth server actions | `lib/auth.ts` |
| Supabase clients | `lib/supabase/{client,server,middleware}.ts` |
| Middleware | `middleware.ts` (Supabase session refresh + protected-route redirects) |
| DB schema | `supabase/schema.sql` (tables: profiles, orders, subscriptions, tray_assignments, ...) |

## How join/registration forms submit

- `/signup` is a client form posting to the `signUp` Server Action (`lib/auth.ts:8`).
- Action calls Supabase `auth.signUp`, upserts a `profiles` row (id, email, full_name, role), then `redirect(`/${role}`)` — i.e. `/grower`, `/restaurant`, or `/admin`.
- `/login` posts to `signIn` (`lib/auth.ts:48`), then redirects to `/${profile.role || "grower"}`.
- No `/join/grower` or `/join/restaurant` routes exist; `/register` does not exist. The playbook's `/join/*` paths map to `/signup` with a role selection in this repo.
- `join_form_submit` fires after the server action returns success (2xx equivalent — no error returned).

## Existing analytics

- Google Analytics (GTAG) in `app/layout.tsx:33-45`, loads `afterInteractive`. No cookie/consent banner anywhere.
- No PostHog, no segment, no experiment instrumentation yet.

## Database

- Supabase Postgres (Neon). Users in `auth.users`; profiles in `profiles` table with `role` column.
- No `visitor_id` / `experiment_variants` columns yet (proposed migration in §3.3 of playbook, needs owner approval).

## Known bugs (fix in Phase 0, separate commit)

1. **Nav/footer anchor mismatch.** Navbar links to `#about`, `#features`, `#contact`; Footer links to `#about`, `#features`, `#contact`, `#privacy`. Existing section IDs: `#hero`, `#problem`, `#solution`, `#features`, `#benefits`, `#how-it-works`, `#cta`. `#about`, `#contact`, `#privacy` resolve nowhere.
2. **Footer links to `#about`** but no About section exists (also `#contact`, `#privacy` missing).
3. **No stat-countdown section exists** in the current Hero (playbook mentions animated counters; not present) — nothing to fix.
4. **Metadata:** `<title>` is "SproutBox — Grow Smarter, Ship Faster" with a meta description — acceptable, but no `openGraph` image (blocker #8: ask owner for OG image).

## Baseline Lighthouse (mobile) for `/`

Not measured yet — no dev server/production URL reachable from this environment at audit time. To be captured in `01-baseline.md` after `npm run dev` / deploy, before any experiment runs. Playbook requires 7–14 days of draft data; traffic is low, so record baseline as "insufficient traffic — recommend outreach/WhatsApp groups/local listings" if needed.

## Notes for Phase 1

- No i18n library → adding a dependency would violate playbook rule 7 ("don't add dependencies other than the analytics SDK without asking"). Phase 1 will add a lightweight `lib/i18n.ts` dictionary approach (en/kn/hi) with no new dependency; it can later migrate to next-intl if the owner prefers.
- PostHog key/host are owner-supplied (blocker #1). Analytics seam will be implemented gated on `NEXT_PUBLIC_POSTHOG_KEY` presence so nothing breaks without it.
- `middleware.ts` currently handles Supabase sessions; Phase 1 extends it with `sb_vid` + bot detection (must coexist with `updateSession`).
