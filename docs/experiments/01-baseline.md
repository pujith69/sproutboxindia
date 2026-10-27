# 01-baseline.md — SproutBox A/B testing baseline metrics

**Repo:** `sproutboxindia` (Next.js app, Vercel: https://sproutboxindia.vercel.app)
**Period:** [START_DATE] – [END_DATE] (7–14 days, full weeks)
**Status:** Draft / Complete

---

## Traffic Summary

| Metric | Value |
|--------|-------|
| Total visitors (7 days) | |
| Total visitors (14 days) | |
| Mobile / Desktop split | % / % |
| Language distribution (en/kn/hi) | % / % / % |
| New vs Returning visitors | % / % |

---

## Conversion Funnel (Per Role)

### Growers (role=grower)

| Stage | Visitors | Conversions | Rate |
|-------|----------|-------------|------|
| Landing page → Hero CTA click | | | |
| Hero CTA click → Join form start | | | |
| Join form start → Submit (success) | | | |

### Restaurants (role=restaurant)

| Stage | Visitors | Conversions | Rate |
|-------|----------|-------------|------|
| Landing page → Hero CTA click | | | |
| Hero CTA click → Join form start | | | |
| Join form start → Submit (success) | | |

---

## Primary Metric Baselines (for sample-size planning)

| Metric | Baseline Rate (p1) | Notes |
|--------|-------------------|-------|
| `hero_cta_click` per visitor (all) | | |
| `hero_cta_click` per visitor (growers) | | |
| `hero_cta_click` per visitor (restaurants) | | |
| `join_form_submit` per visitor (growers) | | |
| `join_form_submit` per visitor (restaurants) | | |

> **If traffic is too low to measure:** Record as "insufficient traffic — recommend outreach/WhatsApp groups/local listings before more testing" (playbook §4).

---

## Guardrail Baselines

| Guardrail | Baseline | Target (no worse than) |
|-----------|----------|------------------------|
| Bounce rate | | |
| LCP (mobile) | | |
| CTA click → form start rate | | |

---

## Lighthouse (Mobile) — `/`

| Category | Score | Notes |
|----------|-------|-------|
| Performance | | |
| Accessibility | | |
| Best Practices | | |
| SEO | | |

---

## Data Quality Notes

- SRM check on any running experiments (should be 50/50):
- Bot traffic excluded (`x-sb-bot` header):
- QA forced views excluded (`is_qa: true`):
- Events with missing properties:

---

## Next Steps

- [ ] Baseline rates recorded above
- [ ] Sample size calculated for EXP-001 using `python scripts/ab/analyze.py --plan-baseline <p1> --plan-mde 0.2`
- [ ] EXP-001 pre-registration report reviewed and approved
- [ ] Owner consent + PostHog key confirmed
- [ ] Ready to flip EXP-001 to `status: 'running'`