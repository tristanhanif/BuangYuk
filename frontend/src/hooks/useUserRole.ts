"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export type UserRole = "USER" | "VERIFIER" | "ADMIN" | null;

export function useUserRole(): { role: UserRole; loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setRole(data.role as UserRole || "USER");
      } else {
        setRole("USER");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  return { role, loading: authLoading || loading };
}

export function useIsVerifier(): boolean {
  const { role, loading } = useUserRole();
  return !loading && role === "VERIFIER";
}

export function useIsAdmin(): boolean {
  const { role, loading } = useUserRole();
  return !loading && role === "ADMIN";
}