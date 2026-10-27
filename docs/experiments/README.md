# SproutBox A/B Experiments Index

| ID | Key | Hypothesis | Status | Started | Ended | Result | Report |
|----|-----|------------|--------|---------|-------|--------|--------|
| — | — | **Phase 0: Audit & bug fixes** | ✅ Done | — | — | — | [00-audit.md](00-audit.md) |
| — | — | **Phase 1: Foundation** | ✅ Done | — | — | — | — |
| — | — | **Phase 2: Baseline collection** | ⏳ Pending deploy | — | — | — | [01-baseline.md](01-baseline.md) |
| EXP-001 | `hero_headline` | Benefit-led headline vs current ("Fresh microgreens for your kitchen. Steady income for local growers.") | 📝 Pre-reg draft | — | — | — | [EXP-001-hero_headline.md](EXP-001-hero_headline.md) |
| EXP-002 | `restaurant_cta` | "Partner as Restaurant" → "Get a free sample tray" / "Request a quote" | ⛔ Blocked (#5) | — | — | — | — |
| EXP-003 | `whatsapp_cta` | Form only → Form + WhatsApp CTA | ⛔ Blocked (#4) | — | — | — | — |
| EXP-004 | `lang_switcher_pos` | Footer → Header | ✅ Ready | — | — | — | — |
| EXP-005 | `social_proof` | None → Real testimonials/pilot stats | ⛔ Blocked (#6) | — | — | — | — |
| EXP-006 | `hero_visual` | Illustrative dashboard → Real photo | ⛔ Blocked (#6) | — | — | — | — |
| EXP-007 | `grower_earnings` | Static "₹50+ per tray" → Earnings calculator | ⛔ Blocked (#7) | — | — | — | — |
| EXP-008 | `nav_cta` | "Get Started" → Role-specific + sticky | ✅ Ready | — | — | — | — |
| EXP-009 | `catalog_photos` | Emojis → Real photos | ⛔ Blocked (#6) | — | — | — | — |
| EXP-010 | `join_form_length` | Current → Shortest viable (name, phone, city) | ✅ Ready | — | — | — | — |

---

## Blockers (playbook §11)

| # | Blocker | Required For | Status |
|---|---------|--------------|--------|
| 1 | PostHog project key + host | All tracking | ✅ Provided (`phc_Ak3B...`, `eu.i.posthog.com`) |
| 2 | Consent banner / DPDP sign-off | Production tracking | ✅ Banner implemented (Accept/Decline) |
| 3 | DB migration for `visitor_id` + variants | Server-side ground truth (optional) | ⏳ Not requested |
| 4 | WhatsApp Business number + message | EXP-003 | ❌ Needed |
| 5 | Free sample tray offer OR "Request a quote" decision | EXP-002 | ❌ Needed |
| 6 | Real testimonials / pilot stats / photos | EXP-005, 006, 009 | ❌ Needed |
| 7 | Grower payout formula (₹/tray by crop) | EXP-007 | ❌ Needed |
| 8 | OG image (1200×630px) | Social metadata | ❌ **Needed** — placeholder in `app/layout.tsx` |
| 9 | Native speaker review of 28 kn/hi strings | All localized variants | ❌ **Needed** — marked `// TODO(review): native speaker` in `lib/i18n.ts` |

---

## Next Actions

1. **Owner provides**: OG image + native review (blockers #8, #9)
2. **Deploy** foundation to Vercel (all experiments `draft`)
3. **Collect baseline** 7–14 days → fill `01-baseline.md`
4. **Launch EXP-001**: flip `hero_headline` to `status: 'running'` in `lib/experiments/config.ts`
5. **Monitor** daily (SRM, guardrails) — no peeking
6. **Analyze** after planned sample reached → fill report → ship/revert