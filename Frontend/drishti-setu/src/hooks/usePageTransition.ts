"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export function usePageTransition() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null);

  const navigateWithTransition = useCallback(
    (href: string, delayMs: number = 190) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setTransitionTarget(href);

      const targets = Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-page-content], [data-page-container], .page-transition-content, main"
        )
      );
      targets.forEach((el) => el.classList.add("page-transitioning-out"));

      setTimeout(() => {
        router.push(href);
      }, delayMs);
    },
    [isTransitioning, router]
  );

  return {
    isTransitioning,
    transitionTarget,
    navigateWithTransition,
  };
}
