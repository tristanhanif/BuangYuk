"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useUserRole() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user && userProfile) {
        setRole(userProfile.role);
      } else if (user && !userProfile) {
        // User exists but profile not loaded yet - check cookie
        const cookieRole = document.cookie
          .split("; ")
          .find((c) => c.startsWith("buangyuk_role="))
          ?.split("=")[1];
        setRole(cookieRole || "customer");
      } else {
        setRole(null);
      }
      setLoading(false);
    }
  }, [user, userProfile, authLoading]);

  return { user, userProfile, role, loading, authLoading };
}

/**
 * Hook to guard a page by role. Redirects to appropriate dashboard if unauthorized.
 */
export function useAuthGuard(allowedRoles: string[]) {
  const { role, loading } = useUserRole();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading && role !== null) {
      if (allowedRoles.includes(role)) {
        setAuthorized(true);
      } else {
        // Redirect to appropriate dashboard
        switch (role) {
          case "admin": router.replace("/admin"); break;
          case "collector": router.replace("/collector"); break;
          case "bank_sampah": router.replace("/bank-sampah"); break;
          case "umkm": router.replace("/umkm"); break;
          default: router.replace("/dashboard");
        }
      }
    }
  }, [role, loading, allowedRoles, router]);

  return { authorized, loading, role };
}
