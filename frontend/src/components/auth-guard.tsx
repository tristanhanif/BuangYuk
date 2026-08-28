"use client";

import { ReactNode } from "react";
import { useAuthGuard } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

/**
 * Wraps content that requires specific roles.
 * Shows loading while checking, redirects if unauthorized.
 */
export function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const { authorized, loading } = useAuthGuard(allowedRoles);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">Mengalihkan ke dashboard yang sesuai...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
