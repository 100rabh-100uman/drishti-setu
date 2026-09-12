"use client";

import { ReactNode, MouseEvent } from "react";
import { useRouter } from "next/navigation";

interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  transitionDelay?: number;
  title?: string;
  "aria-label"?: string;
}

export function TransitionLink({
  href,
  children,
  className,
  onClick,
  transitionDelay = 260,
  ...rest
}: TransitionLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // If modifier keys pressed, let browser handle new tab/window
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (onClick) onClick(e);

    // Add exit transition effect to main container if present
    const rootEl =
      document.querySelector("[data-page-container]") ||
      document.querySelector("main");
    if (rootEl) {
      rootEl.classList.remove("animate-page-enter");
      rootEl.classList.add("animate-page-exit");
    }

    setTimeout(() => {
      router.push(href);
    }, transitionDelay);
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
}
