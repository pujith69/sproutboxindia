import { hash32, assignVariant, allAssignments } from "./assign";
import { EXPERIMENTS } from "./config";

describe("hash32", () => {
  test("is deterministic", () => {
    expect(hash32("test")).toBe(hash32("test"));
  });

  test("different strings produce different hashes (mostly)", () => {
    const h1 = hash32("a");
    const h2 = hash32("b");
    // Very unlikely to collide, but possible
    expect(h1).not.toBe(h2);
  });

  test("returns unsigned 32-bit integer", () => {
    const h = hash32("test");
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });
});

describe("assignVariant", () => {
  const exp = EXPERIMENTS.hero_headline;
  const controlKey = exp.variants[0].key;

  test("returns control when experiment is draft", () => {
    expect(assignVariant(exp, "visitor-123")).toBe(controlKey);
  });

  test("returns control when experiment is paused", () => {
    const pausedExp = { ...exp, status: "paused" as const };
    expect(assignVariant(pausedExp, "visitor-123")).toBe(controlKey);
  });

  test("returns winner when experiment is concluded with winner", () => {
    const concludedExp = { ...exp, status: "concluded" as const, winner: "b" };
    expect(assignVariant(concludedExp, "visitor-123")).toBe("b");
  });

  test("returns control when experiment is concluded without winner", () => {
    const concludedExp = { ...exp, status: "concluded" as const, winner: undefined };
    expect(assignVariant(concludedExp, "visitor-123")).toBe(controlKey);
  });

  test("is deterministic for same visitor", () => {
    const runningExp = { ...exp, status: "running" as const };
    const v1 = assignVariant(runningExp, "visitor-123");
    const v2 = assignVariant(runningExp, "visitor-123");
    expect(v1).toBe(v2);
  });

  test("splits ~50/50 over many visitors", () => {
    const runningExp = { ...exp, status: "running" as const };
    const counts: Record<string, number> = { control: 0, b: 0 };
    const N = 10000;

    for (let i = 0; i < N; i++) {
      const variant = assignVariant(runningExp, `visitor-${i}`);
      counts[variant] = (counts[variant] || 0) + 1;
    }

    const controlRatio = counts.control / N;
    // Allow 3% margin (95% CI for binomial with p=0.5, n=10000 is ~0.98%)
    expect(controlRatio).toBeGreaterThan(0.47);
    expect(controlRatio).toBeLessThan(0.53);
  });

  test("different visitors get different variants (distribution)", () => {
    const runningExp = { ...exp, status: "running" as const };
    const variants = new Set<string>();

    for (let i = 0; i < 100; i++) {
      variants.add(assignVariant(runningExp, `visitor-${i}`));
    }

    // Should see both variants (extremely unlikely to see only one)
    expect(variants.size).toBe(2);
  });
});

describe("allAssignments", () => {
  test("returns assignment for each experiment", () => {
    const assignments = allAssignments("visitor-123");
    expect(Object.keys(assignments)).toEqual(Object.keys(EXPERIMENTS));
  });

  test("is deterministic", () => {
    const a1 = allAssignments("visitor-123");
    const a2 = allAssignments("visitor-123");
    expect(a1).toEqual(a2);
  });
});