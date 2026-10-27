"use client";

import { useEffect, useRef, type RefObject } from "react";
import { track } from "@/lib/analytics";

export type Device = "mobile" | "desktop";

interface Options {
  experiment: string;
  variant: string;
  lang: string;
  device: Device;
  once?: boolean;
}

function computeDevice(): Device {
  if (typeof window === "undefined") return "desktop";
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

/**
 * Fire `experiment_exposure` once per visitor per session when the
 * element is >= 50% visible (IntersectionObserver threshold 0.5).
 * Attach the ref to the real element, not a wrapper with
 * `display: contents`.
 */
export function useExposure(
  ref: RefObject<HTMLElement | null>,
  options: Options
): void {
  const { experiment, variant, lang, device: propDevice, once = true } = options;
  const fired = useRef(false);
  const deviceRef = useRef<Device>(
    typeof window !== "undefined" ? computeDevice() : "desktop"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `sb_exp_${experiment}`;
    if (once && sessionStorage.getItem(key)) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (fired.current) return;
        fired.current = true;
        if (once) sessionStorage.setItem(key, "1");

        track("experiment_exposure", {
          experiment,
          variant,
          path: window.location.pathname,
          lang,
          device: deviceRef.current,
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [experiment, variant, lang, once]);
}
