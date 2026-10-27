import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { getVariant } from "@/lib/experiments/server";
import { Headline } from "./HeroHeadline";
import TrackedLink from "@/components/TrackedLink";
import { t } from "@/lib/i18n";
import { MotionButton } from "@/components/ui/button";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

export default async function Hero() {
  const { variant } = await getVariant("hero_headline");
  const lang = "en";

  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-6"
    >
      {/* Radial gradient glow */}
      <div className="gradient-radial-hero pointer-events-none absolute inset-0" />

      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-sprout-500/10 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 15, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-sprout-400/8 blur-3xl"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Badge */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <span className="inline-flex items-center gap-2 rounded-full border border-sprout-500/20 bg-sprout-500/10 px-4 py-1.5 text-xs font-medium text-sprout-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sprout-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sprout-500" />
            </span>
            Now Partnering With Restaurants
          </span>
        </motion.div>

        {/* Headline (A/B variant: control vs b, en/kn/hi via i18n) */}
        <Headline variant={variant} lang={lang} />

        {/* Sub‑headline */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          {t("en", "hero_subhead")}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <TrackedLink href="/login" location="hero" ctaId="join_grower" variant={variant} lang={lang}>
            <Link href="/login">
              <MotionButton size="lg" variant="primary" className="h-12 rounded-xl px-8 text-base">
                {t("en", "hero_cta_order")}
              </MotionButton>
            </Link>
          </TrackedLink>
          <TrackedLink
            href="#how-it-works"
            location="hero"
            ctaId="see_how_it_works"
            variant={variant}
            lang={lang}
          >
            <MotionButton size="lg" variant="glass" className="h-12 rounded-xl px-8 text-base">
              <a href="#how-it-works">{t("en", "hero_cta_how")}</a>
            </MotionButton>
          </TrackedLink>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
