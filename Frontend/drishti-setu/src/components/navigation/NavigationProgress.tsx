"use client";

import { Suspense } from "react";
import { useNavigationLoading } from "@/hooks/useNavigationLoading";

function NavigationProgressBar() {
  const { isLoading, progress } = useNavigationLoading();

  if (!isLoading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.7)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionProperty: "width, opacity",
        }}
      />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBar />
    </Suspense>
  );
}
