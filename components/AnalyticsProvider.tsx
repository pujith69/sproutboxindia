"use client";

import { useEffect, useState } from "react";

interface Props {
  visitorId: string;
  assignments: Record<string, string>;
  lang: string;
}

const CONSENT_KEY = "sb_consent";

function getConsent(): "accepted" | "declined" | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(CONSENT_KEY) as "accepted" | "declined" | null) ?? null;
}

export default function AnalyticsProvider({
  visitorId,
  assignments,
  lang,
}: Props) {
  const [consent, setConsent] = useState<"accepted" | "declined" | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initial consent check
    const current = getConsent();
    setConsent(current);

    // Listen for consent changes from banner
    const handler = () => setConsent(getConsent());
    window.addEventListener("sb_consent_change", handler);
    return () => window.removeEventListener("sb_consent_change", handler);
  }, []);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || consent !== "accepted" || initialized) return;

    void import("posthog-js").then(({ default: posthog }) => {
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
      posthog.init(key, {
        api_host: host,
        person_profiles: "identified_only",
        capture_pageview: false,
        bootstrap: { distinctID: visitorId },
      });

      // Every event carries every active variant assignment.
      const reg: Record<string, string> = {};
      for (const [expKey, variant] of Object.entries(assignments)) {
        reg[`exp_${expKey}`] = variant;
      }
      posthog.register(reg);

      // Identify without PII: visitor ID only.
      posthog.identify(visitorId);
      setInitialized(true);
    });
  }, [visitorId, assignments, lang, consent, initialized]);

  // If consent is declined, we could optionally reset PostHog
  useEffect(() => {
    if (consent === "declined" && initialized) {
      // PostHog doesn't have a clean reset, but we can opt-out
      void import("posthog-js").then(({ default: posthog }) => {
        posthog.opt_out_capturing();
      });
    }
  }, [consent, initialized]);

  return null;
}
