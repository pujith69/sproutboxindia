"use client";

import { useRef, type RefObject } from "react";
import { motion, type Variants } from "framer-motion";
import { useExposure } from "@/lib/experiments/useExposure";
import { t, type Lang } from "@/lib/i18n";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

export interface HeadlineProps {
  variant: string;
  lang: Lang;
}

export function Headline({ variant, lang }: HeadlineProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const device =
    typeof window !== "undefined"
      ? window.innerWidth < 768
        ? "mobile"
        : "desktop"
      : "desktop";

  useExposure(ref as RefObject<HTMLElement>, {
    experiment: "hero_headline",
    variant,
    lang,
    device,
  });

  const isControl = variant === "control";

  return (
    <motion.h1
      ref={ref}
      custom={1}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="mt-8 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
    >
      {isControl ? (
        <>
          {t(lang, "hero_control_1")}{" "}
          <span className="gradient-text-sprout">{t(lang, "hero_control_2")}</span>
        </>
      ) : (
        t(lang, "hero_headline_b")
      )}
    </motion.h1>
  );
}
