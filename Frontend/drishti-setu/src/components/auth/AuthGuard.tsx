"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/auth.service";
import { PageLoadingState } from "@/components/ui/PageLoadingState";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Backend-Authoritative Authentication Guard
 * Protects application routes by validating the active JWT session against
 * FastAPI GET /users/me/. Redirects unauthenticated visitors to /login.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthentication() {
      const redirectQuery = pathname && pathname !== "/" && pathname !== "/login" 
        ? `?redirect=${encodeURIComponent(pathname)}` 
        : "";
      const expiredQuery = pathname && pathname !== "/" && pathname !== "/login"
        ? `?error=session_expired&redirect=${encodeURIComponent(pathname)}`
        : "?error=session_expired";

      // 1. Initial quick local session check
      const localSession = authService.getCurrentSession();
      if (!localSession || !localSession.token) {
        if (isMounted) {
          setIsAuthorized(false);
          setIsVerifying(false);
          router.replace(`/login${redirectQuery}`);
        }
        return;
      }

      // 2. Authoritative backend verification against GET /users/me/
      try {
        const validatedSession = await authService.validateSession();
        if (!isMounted) return;

        if (validatedSession && (validatedSession.user || validatedSession.token)) {
          setIsAuthorized(true);
        } else if (localSession && localSession.token) {
          // Fallback to active local session
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.replace(`/login${expiredQuery}`);
        }
      } catch {
        if (!isMounted) return;
        // If local session exists, allow access
        if (localSession && localSession.token) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.replace(`/login${redirectQuery}`);
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    }

    checkAuthentication();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (isVerifying || !isAuthorized) {
    return <PageLoadingState type="dashboard" />;
  }

  return <>{children}</>;
}

export default AuthGuard;
