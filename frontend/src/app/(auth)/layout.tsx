"use client";

import { Header } from "@/components/navigation/Header";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        {children}
      </main>
    </div>
  );
}