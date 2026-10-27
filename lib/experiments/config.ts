import type { Lang } from "@/lib/i18n";

export type Variant = { key: string; weight: number }; // weights sum to 1

export type ExperimentStatus = "draft" | "running" | "paused" | "concluded";

export type Experiment = {
  key: string;
  description: string;
  status: ExperimentStatus;
  variants: Variant[]; // first variant is the control
  primaryMetric: string; // event name
  winner?: string;
};

export const EXPERIMENTS: Record<string, Experiment> = {
  hero_headline: {
    key: "hero_headline",
    description: "Benefit-led hero headline vs current",
    status: "draft",
    variants: [{ key: "control", weight: 0.5 }, { key: "b", weight: 0.5 }],
    primaryMetric: "hero_cta_click",
  },
};

export function getExperiment(key: string): Experiment | undefined {
  return EXPERIMENTS[key];
}

export function allExperimentKeys(): string[] {
  return Object.keys(EXPERIMENTS);
}

export function controlKey(key: string): string | undefined {
  return EXPERIMENTS[key]?.variants[0].key;
}

export type Assignment = { variant: string; visitorId: string; isBot: boolean; isQA: boolean };

export function isRunning(key: string): boolean {
  return EXPERIMENTS[key]?.status === "running";
}

export interface HeadlineVariant {
  key: "control" | "b";
  label: string;
}

export const HERO_HEADLINE_VARIANTS: Record<string, string> = {
  control: "hero_headline_control",
  b: "hero_headline_b",
};

export function messageKeyForVariant(experimentKey: string, variant: string, field: string): string {
  if (experimentKey === "hero_headline" && field === "headline") {
    return HERO_HEADLINE_VARIANTS[variant] ?? "hero_headline_control";
  }
  return `${experimentKey}_${variant}_${field}`;
}

export const SUPPORTED_LANGS: Lang[] = ["en", "kn", "hi"];
