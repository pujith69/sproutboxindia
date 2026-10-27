/* ────────────────────────────────────────────────────────────
   Single analytics seam for SproutBox.
   All tracking in the app goes through `track()` so the vendor
   can be swapped later. Currently wired to PostHog, gated on
   NEXT_PUBLIC_POSTHOG_KEY presence — nothing is tracked without it.
   ──────────────────────────────────────────────────────────── */

let ph: any = null;
let initialized = false;

export function getPostHog(): any {
  if (typeof window === "undefined") return null;
  if (!initialized && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const posthog = require("posthog-js");
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    ph = posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false,
    });
    initialized = true;
  }
  return ph;
}

export function track(
  event: string,
  props: Record<string, unknown> = {},
  options: { isQA?: boolean } = {}
): void {
  if (typeof window === "undefined") return;
  const instance = getPostHog();
  if (!instance) return;
  instance.capture(event, {
    ...props,
    ...(options.isQA ? { is_qa: true } : {}),
  });
}
