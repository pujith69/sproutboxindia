"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const CONSENT_KEY = "sb_consent";

type Consent = "accepted" | "declined" | null;

export function useConsent(): Consent {
  const [consent, setConsent] = useState<Consent>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as Consent;
    if (stored) setConsent(stored);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setConsent("accepted");
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setConsent("declined");
  };

  return consent;
}

export default function ConsentBanner() {
  const consent = useConsent();

  if (consent !== null) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-4 md:px-8 md:py-6"
    >
      <div className="mx-auto max-w-4xl glass border border-white/10 rounded-2xl p-4 md:p-6">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:max-w-2xl">
            <p className="text-sm font-medium">
              We value your privacy
            </p>
            <p className="text-xs text-muted-foreground">
              We use analytics (PostHog) to understand how visitors use our site and improve your experience.
              No personal data is collected. See our{" "}
              <a href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </a>
              {" for details."}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                localStorage.setItem(CONSENT_KEY, "accepted");
                window.dispatchEvent(new Event("sb_consent_change"));
              }}
              className="flex-1 md:flex-none rounded-lg bg-sprout-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sprout-500/25 transition-all hover:bg-sprout-400"
            >
              Accept
            </button>
            <button
              onClick={() => {
                localStorage.setItem(CONSENT_KEY, "declined");
                window.dispatchEvent(new Event("sb_consent_change"));
              }}
              className="flex-1 md:flex-none rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}