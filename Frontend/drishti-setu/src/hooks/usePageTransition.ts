"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export function usePageTransition() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null);

  const navigateWithTransition = useCallback(
    (href: string, delayMs: number = 260) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setTransitionTarget(href);

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
