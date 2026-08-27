"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { EcoTrackerProvider } from "@/context/EcoTrackerContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <EcoTrackerProvider>{children}</EcoTrackerProvider>
    </AuthProvider>
  );
}
