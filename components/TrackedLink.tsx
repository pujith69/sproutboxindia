"use client";

import { useCallback, type MouseEvent, type ReactElement, cloneElement } from "react";
import { track } from "@/lib/analytics";

interface Props {
  href?: string;
  children: ReactElement;
  location: "header" | "hero" | "section" | "footer" | "final";
  ctaId: string;
  variant?: string;
  lang?: string;
  className?: string;
}

function isTrackableClick(e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>): boolean {
  return (
    e.button === 0 &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.shiftKey &&
    !e.altKey &&
    !e.defaultPrevented
  );
}

/**
 * Reusable CTA tracking component. Clones its child (a Link/button/anchor),
 * fires `cta_click` (and `hero_cta_click` when location === "hero") on click,
 * then lets navigation proceed normally. Right-click / modifier clicks are
 * not tracked and behave natively (open in new tab, etc.).
 */
export default function TrackedLink({
  href,
  children,
  location,
  ctaId,
  variant,
  lang,
  className,
}: Props) {
  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      if (!isTrackableClick(e)) return;

      const common = {
        cta_id: ctaId,
        location,
        destination: href ?? undefined,
        ...(variant ? { exp_hero_headline: variant } : {}),
        ...(lang ? { lang } : {}),
      };

      track("cta_click", common);
      if (location === "hero") {
        track("hero_cta_click", common);
      }
    },
    [href, location, ctaId, variant, lang]
  );

  const child = children as ReactElement<any, any>;
  const mergedOnClick = (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    handleClick(e);
    (child.props as { onClick?: (e: MouseEvent) => void }).onClick?.(e);
  };

  return cloneElement(child, {
    onClick: mergedOnClick,
    ...(className ? { className: `${child.props.className ?? ""} ${className}` } : {}),
  }) as ReactElement;
}
