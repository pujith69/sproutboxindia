import { headers } from "next/headers";
import { EXPERIMENTS, type Experiment, type Assignment } from "./config";
import { assignVariant } from "./assign";

export async function getVariant(key: string): Promise<Assignment> {
  const h = await headers(); // await works on Next 14 and 15
  const visitorId = h.get("x-sb-vid") ?? "unknown";
  const isBot = h.get("x-sb-bot") === "1";
  const forced = h.get("x-sb-force");
  const exp = EXPERIMENTS[key];

  let variant: string;
  let isQA = false;

  if (isBot || !exp) {
    variant = exp?.variants[0].key ?? "control";
  } else {
    const allowForce =
      process.env.VERCEL_ENV !== "production" ||
      process.env.ALLOW_FORCE_VARIANT === "true";
    const parsed = forced?.match(/^([^:]+):(.+)$/);
    if (parsed && allowForce && parsed[1] === key) {
      const requested = parsed[2];
      const valid = exp.variants.some((v) => v.key === requested);
      variant = valid ? requested : exp.variants[0].key;
      isQA = true;
    } else {
      variant = assignVariant(exp, visitorId);
    }
  }

  return { variant, visitorId, isBot, isQA };
}

export async function allAssignmentsWithFlags(): Promise<Record<string, Assignment>> {
  const h = await headers();
  const visitorId = h.get("x-sb-vid") ?? "unknown";
  const isBot = h.get("x-sb-bot") === "1";
  const result: Record<string, Assignment> = {};
  for (const [key, exp] of Object.entries(EXPERIMENTS)) {
    result[key] = isBot
      ? { variant: exp.variants[0].key, visitorId, isBot: true, isQA: false }
      : {
          variant: assignVariant(exp, visitorId),
          visitorId,
          isBot: false,
          isQA: false,
        };
  }
  return result;
}
