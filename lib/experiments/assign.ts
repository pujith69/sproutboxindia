import { EXPERIMENTS, type Experiment } from "./config";

/**
 * FNV-1a 32-bit hash, edge-safe (unsigned result).
 */
export function hash32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Deterministic bucketing: variant = f(hash(visitorId + experimentKey)).
 * Same visitor always sees the same variant. No cookies, no flicker.
 */
export function assignVariant(exp: Experiment, visitorId: string): string {
  const control = exp.variants[0].key;
  if (exp.status !== "running") {
    return exp.status === "concluded" && exp.winner ? exp.winner : control;
  }
  const b = hash32(`v1:${exp.key}:${visitorId}`) / 0xffffffff;
  let acc = 0;
  for (const v of exp.variants) {
    acc += v.weight;
    if (b < acc) return v.key;
  }
  return control;
}

export function allAssignments(visitorId: string): Record<string, string> {
  return Object.fromEntries(
    Object.values(EXPERIMENTS).map((e) => [e.key, assignVariant(e, visitorId)])
  );
}
