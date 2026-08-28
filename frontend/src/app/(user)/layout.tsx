"use client";

import { Header } from "@/components/navigation/Header";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { ReactNode } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

export default function UserLayout({ children }: { children: ReactNode }) {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <BottomNavigation role={role === "collector" ? "collector" : role === "admin" ? "admin" : "user"} />
    </div>
  );
}