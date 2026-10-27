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
