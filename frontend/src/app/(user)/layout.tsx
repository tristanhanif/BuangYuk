"use client";

import { Header } from "@/components/navigation/Header";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { ReactNode } from "react";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <BottomNavigation role="user" />
    </div>
  );
}