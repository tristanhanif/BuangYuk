"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register-role");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <p className="text-muted-foreground">Mengalihkan ke pendaftaran baru...</p>
    </div>
  );
}
