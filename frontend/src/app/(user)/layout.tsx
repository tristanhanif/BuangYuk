"use client";

import { Header } from "@/components/navigation/Header";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { SidebarNav } from "@/components/navigation/SidebarNav";
import { ReactNode } from "react";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <Header />
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 min-w-0 container mx-auto px-4 py-6">{children}</main>
      </div>
      <BottomNavigation role="user" />
    </div>
  );
}