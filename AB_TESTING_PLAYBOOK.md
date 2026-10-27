# SproutBox — A/B Testing Playbook (for the coding agent)

You are a coding agent working in the SproutBox repo (Next.js app deployed on Vercel at https://sproutboxindia.vercel.app). Your job: build a reusable A/B testing setup, run the first experiments on the landing page, and produce a decision report for each one.

Work through the phases in order. Commit once per phase with a clear message. **Never invent content** (testimonials, income figures, customer names, statistics, offers). Anything listed under "Blockers" in §11 needs the owner's input: use a clearly marked placeholder, keep that experiment `draft`, and report it back instead of shipping guesses.

---

## 0. Context

SproutBox is a demand-driven, decentralized microgreen platform connecting **restaurants** (buyers) with **home-based growers** (suppliers).

Current landing page (`/`):
- Header nav: How it works, For Growers, For Restaurants, **Sign in** (`/login`), **Get Started** (`/register`)
- Hero: headline "Farm-to-fork, door to door." + two CTAs: **Join as Grower** (`/join/grower`) and **Partner as Restaurant** (`/join/restaurant`)
- Hero visual: "Sample dashboard — illustrative preview" (made-up numbers)
- Stats strip (animated counters), 3-step process, For Growers section (CTA "Start Growing"), crop catalog with emojis and ₹/kg prices, For Restaurants section (CTA "Partner With Us"), final CTA, footer
- Language switcher (English / ಕನ್ನಡ / हिन्दी) **only in the footer**
- No testimonials, logos, real photos, FAQ or WhatsApp contact

Two audiences = two funnels. **Always analyze growers and restaurants separately.**

## 1. Goals and rules

**Goal:** increase qualified signups: completed grower onboarding and restaurant onboarding.

**Hard rules**
1. Don't change anything outside the experiment's variant. No drive-by redesigns.
2. Every user-visible string in a variant must exist in **en, kn, hi** (follow the repo's existing i18n approach). Mark Kannada/Hindi strings that you translated yourself with `// TODO(review): native speaker` and list them in your report.
3. No PII (name, phone, email) in analytics events. Visitor ID is a random UUID.
4. Bots and crawlers always get the control and are never tracked (avoids SEO cloaking issues and skewed data).
5. One experiment per page section at a time. Run landing-page experiments **sequentially** (traffic is low).
6. Don't hurt performance or accessibility: keep Lighthouse performance/accessibility scores no lower than before; variants must be keyboard- and screen-reader-accessible.
7. Don't add dependencies other than the analytics SDK below without asking.

## 2. Phase 0 — Repo audit

Create `docs/experiments/00-audit.md` containing:
- [ ] Next.js version, router type (App/Pages), TypeScript or JS, `src/` or root layout, i18n library and how translations are stored
- [ ] Where the landing page, header, footer, language switcher, and `/join/grower`, `/join/restaurant`, `/register` live
- [ ] How join/registration forms submit (API route? server action? external service?), and what happens after success
- [ ] Existing analytics (Vercel Analytics, GA, etc.) and any cookie/consent banner
- [ ] Database used, if any, and where leads/users are stored
- [ ] Baseline Lighthouse (mobile) for `/`

**Fix these existing bugs first** (separate commit, not experiments):
- Nav anchors `#growers` / `#restaurants` don't match footer anchors `#for-growers` / `#for-restaurants`; make them consistent
- Footer links to `#about` but no About section exists. Remove the link or add the section
- Stat counters render `0` before the count-up animation. Make sure they end on the real values even if JS is slow (or render final values server-side)
- `<title>` is just "SproutBox" and there's no OG image. Add a descriptive title, a unique meta description, and an OG image (ask the owner for the image if none exists)

## 3. Phase 1 — Foundation

Target structure (adapt paths to the repo):

```
src/lib/experiments/config.ts      # experiment registry
src/lib/experiments/assign.ts      # deterministic bucketing
src/lib/experiments/server.ts      # getVariant() for server components
src/lib/experiments/useExposure.ts # client hook: fire exposure when visible
src/lib/analytics.ts               # single track() seam
src/components/AnalyticsProvider.tsx
middleware.ts                      # visitor id + bot handling
scripts/ab/analyze.py              # statistics
docs/experiments/TEMPLATE.md       # report template
```

### 3.1 Visitor ID and assignment (no vendor lock-in)

Assignment is **deterministic**: `variant = f(hash(visitorId + experimentKey))`. No per-experiment cookies, no flicker, same visitor always sees the same variant.

`config.ts`
```ts
export type Variant = { key: string; weight: number }; // weights sum to 1
export type Experiment = {
  key: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'concluded';
  variants: Variant[];            // first variant is the control
  primaryMetric: string;          // event name
  winner?: string;
};

export const EXPERIMENTS: Record<string, Experiment> = {
  hero_headline: {
    key: 'hero_headline',
    description: 'Benefit-led hero headline vs current',
    status: 'draft',
    variants: [{ key: 'control', weight: 0.5 }, { key: 'b', weight: 0.5 }],
    primaryMetric: 'hero_cta_click',
  },
};
```

`assign.ts`
```ts
import { EXPERIMENTS, type Experiment } from './config';

export function hash32(str: string): number {          // FNV-1a, edge-safe
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function assignVariant(exp: Experiment, visitorId: string): string {
  const control = exp.variants[0].key;
  if (exp.status !== 'running') return exp.status === 'concluded' && exp.winner ? exp.winner : control;
  const b = hash32(`v1:${exp.key}:${visitorId}`) / 0xffffffff;
  let acc = 0;
  for (const v of exp.variants) { acc += v.weight; if (b < acc) return v.key; }
  return control;
}

export function allAssignments(visitorId: string): Record<string, string> {
  return Object.fromEntries(Object.values(EXPERIMENTS).map(e => [e.key, assignVariant(e, visitorId)]));
}
```

`middleware.ts` — ensure an `sb_vid` cookie (first-party, random UUID, ~90 days), detect bots by user-agent regex (bots get `x-sb-bot: 1` and never a variant), and forward the id to server components via a **request header** (cookies set in the same response aren't readable by `cookies()` on that first request):
```ts
import { NextRequest, NextResponse } from 'next/server';
const BOT = /bot|crawl|spider|slurp|bing|facebookexternalhit|preview|lighthouse|headless/i;

export function middleware(req: NextRequest) {
  const existing = req.cookies.get('sb_vid')?.value;
  const vid = existing ?? crypto.randomUUID();
  const headers = new Headers(req.headers);
  headers.set('x-sb-vid', vid);
  if (BOT.test(req.headers.get('user-agent') ?? '')) headers.set('x-sb-bot', '1');
  const res = NextResponse.next({ request: { headers } });
  if (!existing) res.cookies.set('sb_vid', vid, { maxAge: 60 * 60 * 24 * 90, sameSite: 'lax', path: '/', secure: true });
  return res;
}
export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
```

`server.ts`
```ts
import { headers } from 'next/headers';
import { EXPERIMENTS } from './config';
import { assignVariant } from './assign';

export async function getVariant(key: string): Promise<{ variant: string; visitorId: string; isBot: boolean }> {
  const h = await headers();                 // await works on Next 14 and 15
  const visitorId = h.get('x-sb-vid') ?? 'unknown';
  const isBot = h.get('x-sb-bot') === '1';
  const exp = EXPERIMENTS[key];
  const variant = isBot || !exp ? exp?.variants[0].key ?? 'control' : assignVariant(exp, visitorId);
  return { variant, visitorId, isBot };
}
```
Note: reading `headers()` makes the landing page dynamically rendered. That's acceptable at this scale; measure TTFB/LCP and report the difference in the audit. (Optimization later: middleware rewrite to statically generated variant pages.)

**QA override:** allow `?sb_force=<experiment>:<variant>` only when `process.env.VERCEL_ENV !== 'production'` or `ALLOW_FORCE_VARIANT=true`. Tag events from forced views with `is_qa: true` and exclude them from analysis.

### 3.2 Analytics (PostHog, behind one seam)

- Install `posthog-js`. Env vars (add to `.env.example`, set in Vercel; ask the owner for the key):
  ```
  NEXT_PUBLIC_POSTHOG_KEY=
  NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com   # or https://eu.i.posthog.com
  ```
- `AnalyticsProvider` (client): `posthog.init(key, { api_host, person_profiles: 'identified_only', bootstrap: { distinctID: <sb_vid> } })`. Pass `sb_vid` and all current assignments from the root layout (server) as props. Call `posthog.register({ exp_<key>: variant })` for each, so **every event carries every active variant**.
- `analytics.ts` exports `track(event, props)`. All tracking in the app goes through it, so the vendor can be swapped later.
- Keep the SDK out of the critical path (load after hydration / `requestIdleCallback`).
- Ask the owner whether a consent banner or privacy-policy update is needed (cookie + analytics; India's DPDP Act). Don't ship tracking to production without the owner's OK on this.

`useExposure.ts` — fire `experiment_exposure` **when the changed element is actually visible** (IntersectionObserver, threshold 0.5), once per visitor per session (sessionStorage guard). Attach the ref to the real element, not a wrapper with `display: contents`.

### 3.3 Event taxonomy

| Event | When | Properties |
|---|---|---|
| `experiment_exposure` | variant element ≥50% visible | `experiment`, `variant`, `path`, `lang`, `device` |
| `hero_cta_click` | click on hero CTA | `cta_id` (`join_grower`/`join_restaurant`), `variant`s, `lang` |
| `cta_click` | any tracked CTA | `cta_id`, `location` (header/hero/section/footer/final), `destination` |
| `join_form_view` | `/join/*` loaded | `role` (`grower`/`restaurant`) |
| `join_form_start` | first field interaction | `role` |
| `join_form_step_complete` | each step (if multi-step) | `role`, `step` |
| `join_form_submit` | **after server returns success** | `role` (no PII) |
| `whatsapp_click` | WhatsApp CTA click | `role`, `location` |
| `language_change` | language switched | `from`, `to`, `location` |

Rules: `join_form_submit` fires only after a 2xx response. Name events with snake_case. Don't send form values.

**Server-side ground truth (recommended, ask the owner first):** add nullable columns (`visitor_id`, `experiment_variants` JSON) to the leads/users table and fill them from the `sb_vid` cookie in the submit handler. Then conversions can be verified against the database and not just client events. Propose the migration; don't apply it without approval.

### 3.4 Reusable CTA tracking

Create a `TrackedLink` client component that wraps the existing link/button, fires `cta_click` (and `hero_cta_click` when `location="hero"`) on click, then navigates normally. It must not break right-click/open-in-new-tab.

## 4. Phase 2 — Baseline (no experiments running)

Deploy foundation with all experiments `draft` and collect **7–14 days** of data (full weeks). Then record in `docs/experiments/01-baseline.md`:
- Visitors per week (total, mobile/desktop, en/kn/hi)
- Conversion rates: landing → CTA click, CTA click → form start, form start → submit, per role
- Typical weekly conversions per role

These numbers set the baseline conversion rate (`p1`) used for sample-size planning below. If traffic is too low to measure, say so plainly in the report and recommend traffic sources (outreach, WhatsApp groups, local listings) before more testing.

## 5. Experiment design standard

For every experiment, copy `docs/experiments/TEMPLATE.md` to `docs/experiments/EXP-00X-<key>.md` and fill it in **before launching**:

1. **Hypothesis:** "Changing X to Y will increase <metric> for <audience> because <reason>."
2. **Variants:** control + one challenger (more variants split already-low traffic).
3. **Primary metric** (one) + **guardrails** (bounce rate, LCP, form-start rate).
4. **Audience/targeting:** all visitors, or one role/language.
5. **Sample size:** run `python scripts/ab/analyze.py --plan-baseline <p1> --plan-mde <relative lift>`. Choose an MDE you'd actually care about (e.g. 0.2 = +20% relative).
6. **Duration:** at least 14 days and full weeks; stop only when the planned sample is reached.
7. **Decision rule** (below), written down in advance.

### Decision rules (fixed before launch)

- **Validity first:** run the Sample Ratio Mismatch check (expected 50/50). If p < 0.001, results are **invalid**; debug assignment/tracking and re-run.
- **Ship the variant** if: planned sample reached, two-sided p < 0.05 (alpha divided by number of challengers if >1), 95% CI of the difference excludes 0, and no guardrail is significantly worse.
- **Keep control** if the result is inconclusive or the variant is worse. "No difference" is a valid, reportable result.
- **Low-traffic fallback:** if the planned sample is unreachable in 6 weeks, report Bayesian P(variant beats control) and mark the result **directional** unless there are at least 14 days and 50 conversions per variant and P ≥ 95%.
- No peeking: you may monitor health (SRM, errors, guardrails) daily, but never stop early because the numbers look good.

## 6. Phase 3 — Experiment backlog

Run in this order (sequentially). Statuses: ✅ ready to build, ⛔ blocked on owner input (§11).

| ID | Key | Page/section | Control → Variant | Primary metric | Status |
|---|---|---|---|---|---|
| EXP-001 | `hero_headline` | Hero | "Farm-to-fork, door to door." → "Fresh microgreens for your kitchen. Steady income for local growers." | `hero_cta_click` per visitor | ✅ |
| EXP-002 | `restaurant_cta` | Restaurants section + hero | "Partner as Restaurant / Partner With Us" → "Get a free sample tray" (or "Request a quote" if no sample offer) | restaurant `join_form_submit` | ⛔ offer must be real |
| EXP-003 | `whatsapp_cta` | `/join/grower` + growers section | form only → form + "Chat on WhatsApp" secondary button (`wa.me` link with prefilled message) | grower lead = `join_form_submit` OR `whatsapp_click` | ⛔ WhatsApp number |
| EXP-004 | `lang_switcher_pos` | Header | switcher in footer → switcher in header | `language_change` rate; submit rate for kn/hi visitors | ✅ |
| EXP-005 | `social_proof` | Below hero | none → real testimonials / pilot stats | CTA click rate | ⛔ real content |
| EXP-006 | `hero_visual` | Hero | illustrative dashboard → real photo of trays/harvest | CTA click rate | ⛔ real photos |
| EXP-007 | `grower_earnings` | Growers section | static "₹50+ per tray" → earnings calculator (trays → ₹/month) | grower `join_form_start` | ⛔ real payout formula |
| EXP-008 | `nav_cta` | Header | "Get Started" → role-specific CTAs + sticky header CTA | `cta_click` (header) → submits | ✅ |
| EXP-009 | `catalog_photos` | Crop catalog | emojis → real photos | scroll-to-CTA + CTA click | ⛔ real photos |
| EXP-010 | `join_form_length` | `/join/*` | current form → shortest viable form (name, phone, city) | `join_form_submit` / `join_form_start` | ✅ (after reading the forms) |

Implement **EXP-001 first**, end to end (including the report), to prove the pipeline. Then pick the next unblocked item.

### EXP-001 implementation notes
- Hero server component calls `getVariant('hero_headline')` and renders the matching headline (en/kn/hi strings for both).
- Same subheading, buttons, layout. Only the headline text differs.
- `useExposure` on the headline element; `TrackedLink` on both hero CTAs.
- Set status to `running` only after QA (§7) passes and the owner confirms the consent/privacy point.

## 7. QA checklist (every experiment, before launch)

- [ ] `?sb_force=<key>:<variant>` renders each variant correctly in en, kn, hi, on mobile (375px) and desktop
- [ ] Same visitor (same cookie) sees the same variant across reloads and pages
- [ ] Clearing cookies can produce the other variant; over ~200 fake visitor IDs the split is ≈50/50 (unit test for `assignVariant`)
- [ ] Bots (set a Googlebot UA) always get control and fire no events
- [ ] `experiment_exposure` fires once per session, only when the element is visible
- [ ] Every conversion event fires exactly once per action, and `join_form_submit` only on success
- [ ] Events carry the `exp_<key>` property; no PII in any payload (inspect the network tab)
- [ ] No layout shift (CLS) or flicker on load; Lighthouse mobile not worse than baseline
- [ ] Keyboard focus order and contrast OK in both variants
- [ ] Rollback: setting `status: 'paused'` (or removing the experiment) restores control for everyone

## 8. Phase 4 — Launch and monitor

- Deploy; set experiment `status: 'running'`; record `startedAt` in the report.
- Daily health checks only: SRM p-value, error rate, guardrails, event volume. Don't read the lift as a verdict.
- If SRM fails or a guardrail degrades badly: pause, diagnose, document.

## 9. Phase 5 — Analysis and report

Export per-visitor data from PostHog (or the DB) as CSV with columns `visitor_id,variant,converted`:
- **Visitors** = distinct visitors with an `experiment_exposure` for this experiment (excluding `is_qa`, bots)
- **converted** = 1 if that visitor fired the primary-metric event **after** their first exposure within the test window

Run:
```
python scripts/ab/analyze.py --csv data.csv --control control
```
Also segment results (grower vs restaurant, mobile vs desktop, en/kn/hi). Segments are **hypotheses for the next test, not verdicts.**

Fill the report template; include screenshots of both variants, dates, traffic split, results table, guardrails, SRM result, decision, learnings, and next experiment.

`scripts/ab/analyze.py` (stdlib only):
```python
#!/usr/bin/env python3
"""A/B analysis for SproutBox (stdlib only).

Plan sample size:
  python scripts/ab/analyze.py --plan-baseline 0.05 --plan-mde 0.2
Summary counts:
  python scripts/ab/analyze.py --cv 2000 --cc 90 --vv 2010 --vc 118
CSV (columns: visitor_id,variant,converted):
  python scripts/ab/analyze.py --csv data.csv --control control
"""
import argparse, csv, math, random
from statistics import NormalDist

N = NormalDist()


def two_prop_ztest(x1, n1, x2, n2, alpha=0.05):
    p1, p2 = x1 / n1, x2 / n2
    pooled = (x1 + x2) / (n1 + n2)
    se_pooled = math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))
    z = (p2 - p1) / se_pooled if se_pooled > 0 else 0.0
    p_value = 2 * (1 - N.cdf(abs(z)))
    se_diff = math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)
    zc = N.inv_cdf(1 - alpha / 2)
    diff = p2 - p1
    return {
        "p1": p1, "p2": p2, "abs_lift": diff,
        "rel_lift": diff / p1 if p1 > 0 else float("nan"),
        "z": z, "p_value": p_value,
        "ci_low": diff - zc * se_diff, "ci_high": diff + zc * se_diff,
    }


def required_n_per_variant(p1, mde_rel, alpha=0.05, power=0.8):
    p2 = p1 * (1 + mde_rel)
    za, zb = N.inv_cdf(1 - alpha / 2), N.inv_cdf(power)
    pbar = (p1 + p2) / 2
    num = (za * math.sqrt(2 * pbar * (1 - pbar)) + zb * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2
    return math.ceil(num / (p2 - p1) ** 2)


def srm_p_value(n1, n2, expected_share=0.5):
    total = n1 + n2
    e1, e2 = total * expected_share, total * (1 - expected_share)
    chi2 = (n1 - e1) ** 2 / e1 + (n2 - e2) ** 2 / e2
    return 2 * (1 - N.cdf(math.sqrt(chi2)))  # chi-square, 1 d.f.


def prob_variant_beats_control(x1, n1, x2, n2, draws=100_000, seed=7):
    rng = random.Random(seed)
    wins = 0
    for _ in range(draws):
        a = rng.betavariate(1 + x1, 1 + n1 - x1)
        b = rng.betavariate(1 + x2, 1 + n2 - x2)
        wins += b > a
    return wins / draws


def verdict(res, srm_p, c_conv, v_conv, alpha, min_conv):
    if srm_p < 0.001:
        return "INVALID: sample ratio mismatch. Fix assignment/tracking before trusting this."
    if min(c_conv, v_conv) < min_conv:
        return f"DIRECTIONAL ONLY: fewer than {min_conv} conversions in a variant."
    if res["p_value"] < alpha and res["ci_low"] > 0:
        return "VARIANT WINS (check guardrails before shipping)."
    if res["p_value"] < alpha and res["ci_high"] < 0:
        return "CONTROL WINS: the variant hurts conversion."
    return "INCONCLUSIVE: keep control."


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv")
    ap.add_argument("--control", default="control")
    ap.add_argument("--cv", type=int); ap.add_argument("--cc", type=int)
    ap.add_argument("--vv", type=int); ap.add_argument("--vc", type=int)
    ap.add_argument("--alpha", type=float, default=0.05)
    ap.add_argument("--min-conversions", type=int, default=50)
    ap.add_argument("--plan-baseline", type=float)
    ap.add_argument("--plan-mde", type=float, default=0.2)
    a = ap.parse_args()

    if a.plan_baseline:
        n = required_n_per_variant(a.plan_baseline, a.plan_mde, a.alpha)
        print(f"Required visitors per variant: {n:,} "
              f"(baseline {a.plan_baseline:.2%}, relative MDE {a.plan_mde:.0%}, alpha {a.alpha}, power 80%)")
        return

    groups, conflicts = {}, 0
    if a.csv:
        assigned = {}
        with open(a.csv, newline="") as f:
            for row in csv.DictReader(f):
                vid, var = row["visitor_id"], row["variant"]
                if vid in assigned:
                    if assigned[vid] != var:
                        conflicts += 1  # visitor saw two variants: tracking/cookie problem
                    continue
                assigned[vid] = var
                g = groups.setdefault(var, [0, 0])
                g[0] += 1
                g[1] += int(row["converted"])
    else:
        if None in (a.cv, a.cc, a.vv, a.vc):
            ap.error("provide --csv, or all of --cv --cc --vv --vc, or --plan-baseline")
        groups = {a.control: [a.cv, a.cc], "variant": [a.vv, a.vc]}

    if a.control not in groups:
        ap.error(f"control '{a.control}' not found; variants present: {list(groups)}")
    if conflicts:
        print(f"WARNING: {conflicts} visitors appeared in more than one variant (excluded after first row).\n")

    cn, cx = groups[a.control]
    others = [k for k in groups if k != a.control]
    alpha_adj = a.alpha / max(1, len(others))  # Bonferroni across challengers
    print(f"Control '{a.control}': {cx}/{cn} = {cx / cn:.2%}\n")
    for k in others:
        vn, vx = groups[k]
        r = two_prop_ztest(cx, cn, vx, vn, alpha_adj)
        srm = srm_p_value(cn, vn) if len(others) == 1 else float("nan")
        bayes = prob_variant_beats_control(cx, cn, vx, vn)
        print(f"Variant '{k}': {vx}/{vn} = {r['p2']:.2%}")
        print(f"  abs lift {r['abs_lift']:+.2%} | rel lift {r['rel_lift']:+.1%}")
        print(f"  {(1 - alpha_adj):.1%} CI of difference: [{r['ci_low']:+.2%}, {r['ci_high']:+.2%}]")
        print(f"  z = {r['z']:.2f}, p = {r['p_value']:.4f} (alpha used: {alpha_adj:.4f})")
        print(f"  P(variant beats control) = {bayes:.1%}")
        print(f"  SRM p-value = {srm:.4f}" if not math.isnan(srm) else "  SRM: check manually for >2 variants")
        print(f"  VERDICT: {verdict(r, 0.5 if math.isnan(srm) else srm, cx, vx, alpha_adj, a.min_conversions)}\n")


if __name__ == "__main__":
    main()
```

Add a small `scripts/ab/test_analyze.py` that checks `required_n_per_variant(0.05, 0.2)` is ≈ 8,100 and `required_n_per_variant(0.05, 0.6)` is ≈ 1,060, and that identical groups give p ≈ 1.

## 10. Phase 6 — Ship or revert, then clean up

- Winner: set `status: 'concluded'`, `winner: '<variant>'`; hard-code the winning copy/markup, then remove the losing branch and the experiment code in a follow-up commit.
- Loser/inconclusive: set `status: 'concluded'`, winner = control; remove challenger code.
- Update `docs/experiments/README.md` with an index table: ID, hypothesis, dates, result, decision, link to report.
- Propose the next experiment from the backlog based on what was learned.

### Report template (`docs/experiments/TEMPLATE.md`)

```md
# EXP-00X — <title>
**Owner:** | **Status:** draft/running/concluded | **Dates:** start – end

## Hypothesis
## Variants (screenshots: control / challenger, mobile + desktop)
## Audience & traffic split
## Metrics
Primary: | Guardrails: | MDE: | Baseline: | Required sample/variant: | Planned duration:
## Decision rule (written before launch)
## Results
| Variant | Visitors | Conversions | Rate | Abs lift | Rel lift | 95% CI | p-value | P(beats control) |
SRM check: | Guardrails: | Data quality notes:
## Segments (hypotheses only)
grower vs restaurant / mobile vs desktop / en-kn-hi
## Decision & rationale
## Learnings & next experiment
## Appendix: query/export used, commit hash of the variant code
```

## 11. Blockers — ask the owner (don't guess)

1. PostHog project key (or approval to use another analytics tool) and the host region
2. Consent banner / privacy policy update OK before tracking goes live
3. Approval for the DB migration that stores `visitor_id` and variants on leads (optional but recommended)
4. WhatsApp business number and the prefilled message text (EXP-003)
5. Whether a free sample tray is a real, affordable offer (EXP-002); otherwise use "Request a quote"
6. Real testimonials / restaurant names / pilot numbers (EXP-005) and real photos of trays/harvests (EXP-006, EXP-009)
7. The real grower payout formula, e.g. ₹/tray by crop (EXP-007)
8. An OG image for social sharing
9. Review of the Kannada and Hindi strings added for variants

## 12. Definition of done

- [ ] Audit doc, bug fixes, and baseline doc committed
- [ ] Foundation merged: middleware, assignment, analytics seam, exposure hook, tracked CTAs, QA override
- [ ] Unit tests for `assignVariant` (determinism, ~50/50 split, non-running status returns control) and for `analyze.py`
- [ ] EXP-001 launched with a filled-in pre-registration report
- [ ] Final report for each concluded experiment with a clear ship / keep-control decision
- [ ] `docs/experiments/README.md` index is up to date
- [ ] A short summary for the owner: what was done, current results, what's blocked on them
