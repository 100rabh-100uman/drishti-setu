"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      data-page-content
      className="w-full min-h-full page-transition-content animate-page-enter"
    >
      {children}
    </div>
  );
}
