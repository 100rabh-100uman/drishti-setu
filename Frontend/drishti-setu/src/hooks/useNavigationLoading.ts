"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function useNavigationLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const prevPathRef = useRef(pathname);
  const prevParamsRef = useRef(searchParams?.toString());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Complete progress
  const completeLoading = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);

    finishTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 220);
  }, []);

  // Start progress
  const startLoading = useCallback(() => {
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setIsLoading(true);
    setProgress(15);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 40) return prev + 15;
        if (prev < 70) return prev + 8;
        if (prev < 90) return prev + 2;
        return prev;
      });
    }, 80);
  }, []);

  // Detect route change completion
  useEffect(() => {
    const currentParams = searchParams?.toString();
    const hasPathChanged = pathname !== prevPathRef.current;
    const hasParamsChanged = currentParams !== prevParamsRef.current;

    if (hasPathChanged || hasParamsChanged) {
      prevPathRef.current = pathname;
      prevParamsRef.current = currentParams;
      completeLoading();
    }
  }, [pathname, searchParams, completeLoading]);

  // Intercept internal link clicks to begin progress indicator immediately
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Ignore clicks with modifier keys (new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external, hash-only, mailto, tel, or target="_blank"
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank"
      ) {
        return;
      }

      // Check if clicking same path
      const currentUrl = new URL(window.location.href);
      const targetUrl = new URL(anchor.href, window.location.href);

      if (currentUrl.pathname === targetUrl.pathname && currentUrl.search === targetUrl.search) {
        return;
      }

      // Start the progress indicator
      startLoading();
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      if (timerRef.current) clearInterval(timerRef.current);
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    };
  }, [startLoading]);

  return { isLoading, progress, startLoading, completeLoading };
}
