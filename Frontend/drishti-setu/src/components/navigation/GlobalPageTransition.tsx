"use client";

import { useEffect, useRef, createContext, useContext, useCallback, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useNavigationLoading } from "@/hooks/useNavigationLoading";

interface GlobalTransitionContextType {
  navigateWithTransition: (href: string) => void;
}

const GlobalTransitionContext = createContext<GlobalTransitionContextType>({
  navigateWithTransition: () => {},
});

export function useGlobalTransition() {
  return useContext(GlobalTransitionContext);
}

function GlobalTransitionManager() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startLoading } = useNavigationLoading();
  const isTransitioningRef = useRef(false);

  const getTransitionTargets = (): HTMLElement[] => {
    const customTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-page-content], [data-page-container], .page-transition-content"
      )
    );
    if (customTargets.length > 0) return customTargets;

    const mainEl = document.querySelector<HTMLElement>("main");
    return mainEl ? [mainEl] : [];
  };

  const clearTransitionClasses = useCallback(() => {
    const targets = getTransitionTargets();
    targets.forEach((el) => el.classList.remove("page-transitioning-out"));
    isTransitioningRef.current = false;
  }, []);

  // Clear any remaining exit classes whenever route changes
  useEffect(() => {
    clearTransitionClasses();
  }, [pathname, searchParams, clearTransitionClasses]);

  const navigateWithTransition = useCallback(
    (href: string) => {
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;

      const targets = getTransitionTargets();
      targets.forEach((el) => el.classList.add("page-transitioning-out"));

      startLoading();

      setTimeout(() => {
        router.push(href);
        // Safety timeout to prevent permanent lock
        setTimeout(() => {
          isTransitioningRef.current = false;
        }, 500);
      }, 190);
    },
    [router, startLoading]
  );

  // Global link interceptor for all Next.js Link and anchor tags
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Allow modifier keys (Ctrl/Cmd/Shift/Alt) to open in new tab
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return;
      if (e.button !== 0) return; // Only left click

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      if (anchor.getAttribute("data-no-transition") === "true") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.target === "_blank") return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      if (href.startsWith("http://") || href.startsWith("https://")) {
        try {
          const parsed = new URL(href);
          if (parsed.origin !== window.location.origin) return;
        } catch {
          return;
        }
      }

      const currentUrl = new URL(window.location.href);
      const targetUrl = new URL(anchor.href, window.location.href);

      // Same page click, no animation needed
      if (currentUrl.pathname === targetUrl.pathname && currentUrl.search === targetUrl.search) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      navigateWithTransition(targetUrl.pathname + targetUrl.search + targetUrl.hash);
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, [navigateWithTransition]);

  return null;
}

export function GlobalPageTransition() {
  return (
    <Suspense fallback={null}>
      <GlobalTransitionManager />
    </Suspense>
  );
}
