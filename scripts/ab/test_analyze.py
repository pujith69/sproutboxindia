#!/usr/bin/env python3
"""Unit tests for scripts/ab/analyze.py"""
import math
import sys

sys.path.insert(0, "scripts/ab")
from analyze import required_n_per_variant, two_prop_ztest, srm_p_value, verdict


def test_required_n_known_values():
    assert abs(required_n_per_variant(0.05, 0.2) - 8100) <= 100, required_n_per_variant(0.05, 0.2)
    assert abs(required_n_per_variant(0.05, 0.6) - 1060) <= 10, required_n_per_variant(0.05, 0.6)


def test_identical_groups_give_p_approx_1():
    r = two_prop_ztest(50, 1000, 50, 1000, alpha=0.05)
    assert abs(r["p_value"] - 1.0) < 1e-6, r["p_value"]
    assert abs(r["abs_lift"]) < 1e-9


def test_verdict_inconclusive_when_insufficient_conversions():
    res = {"p_value": 0.01, "ci_low": 0.01, "ci_high": 0.05}
    v = verdict(res, 0.5, 5, 20, 0.05, 50)
    assert v.startswith("DIRECTIONAL ONLY"), v


def test_verdict_invalid_on_srm():
    res = {"p_value": 0.01, "ci_low": 0.01, "ci_high": 0.05}
    v = verdict(res, 0.0001, 100, 100, 0.05, 10)
    assert v.startswith("INVALID"), v


if __name__ == "__main__":
    test_required_n_known_values()
    test_identical_groups_give_p_approx_1()
    test_verdict_inconclusive_when_insufficient_conversions()
    test_verdict_invalid_on_srm()
    print("All analyze.py tests passed.")
