# EXP-001 — Hero headline A/B test
**Owner:** | **Status:** draft | **Dates:** – (blocked on owner consent + PostHog key)

## Hypothesis
"Changing the hero headline from 'Farm‑Fresh Microgreens. Delivered to Your Kitchen.' to 'Fresh microgreens for your kitchen. Steady income for local growers.' will increase `hero_cta_click` per visitor because the challenger speaks to both sides of the marketplace (restaurant demand + grower income) in one line."

## Variants (screenshots: control / challenger, mobile + desktop)
Not captured yet — experiment is `draft`. Screenshots to be added after QA pass (§7) and before launch.

- Control (en): "Farm‑Fresh Microgreens. Delivered to Your Kitchen."
- Challenger b (en): "Fresh microgreens for your kitchen. Steady income for local growers."
- kn/hi translations exist in `lib/i18n.ts` — all self-translated, marked `// TODO(review): native speaker`. See Blocker #9.

Layout, subheading, buttons unchanged. Only the headline text differs.

## Audience & traffic split
All landing-page visitors, 50/50 split. Growers and restaurants are analyzed separately in reporting where role is known post-signup; at exposure everyone on `/` is one audience.

## Metrics
Primary: `hero_cta_click` per visitor (click on either hero CTA after exposure)
Guardrails: bounce rate, LCP, CTA click → form start rate
MDE: +20% relative lift
Baseline: unknown — to be established in `01-baseline.md` (7–14 days draft data)
Required sample/variant: 8,158 visitors (baseline 5.00%, MDE 20%, alpha 0.05, power 80%) — see `scripts/ab/analyze.py --plan-baseline 0.05 --plan-mde 0.2`
Planned duration: at least 14 days, full weeks, stop only at planned sample

## Decision rule (written before launch)
- Validity first: Sample Ratio Mismatch check; p < 0.001 → results invalid, debug assignment/tracking.
- Ship variant if: planned sample reached, two-sided p < 0.05, 95% CI of difference excludes 0, no guardrail significantly worse.
- Keep control if inconclusive or variant worse.
- Low-traffic fallback: Bayesian P(variant beats control); directional only unless ≥14 days, ≥50 conversions per variant, and P ≥ 95%.
- No peeking: monitor health (SRM, errors, guardrails) daily; never stop early.

## Results
| Variant | Visitors | Conversions | Rate | Abs lift | Rel lift | 95% CI | p-value | P(beats control) |
|---|---|---|---|---|---|---|---|---|
SRM check: | Guardrails: | Data quality notes:

## Segments (hypotheses only)
grower vs restaurant / mobile vs desktop / en-kn-hi

## Decision & rationale
Pending launch.

## Learnings & next experiment
Pending.

## Appendix: query/export used, commit hash of the variant code
Pending.
