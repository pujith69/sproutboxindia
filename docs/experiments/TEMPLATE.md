# EXP-00X — <title>
**Owner:** | **Status:** draft/running/concluded | **Dates:** start – end

## Hypothesis
"Changing X to Y will increase <metric> for <audience> because <reason>."

## Variants (screenshots: control / challenger, mobile + desktop)

## Audience & traffic split
All visitors / one role or language. Split: 50/50.

## Metrics
Primary: | Guardrails: | MDE: | Baseline: | Required sample/variant: | Planned duration:

## Decision rule (written before launch)
- Validity first: Sample Ratio Mismatch check, p < 0.001 → invalid.
- Ship variant if: planned sample reached, two-sided p < 0.05, 95% CI excludes 0, no guardrail significantly worse.
- Otherwise keep control. Low-traffic fallback: Bayesian P(variant beats control), directional only.

## Results
| Variant | Visitors | Conversions | Rate | Abs lift | Rel lift | 95% CI | p-value | P(beats control) |
SRM check: | Guardrails: | Data quality notes:

## Segments (hypotheses only)
grower vs restaurant / mobile vs desktop / en-kn-hi

## Decision & rationale

## Learnings & next experiment

## Appendix: query/export used, commit hash of the variant code
