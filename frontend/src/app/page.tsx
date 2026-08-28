"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

export default function SplashPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0);
    }, 1700);

    const redirect = setTimeout(() => {
      router.replace(user ? "/dashboard" : "/login");
    }, 2300);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirect);
    };
  }, [router, user]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-800 via-teal-800 to-teal-900 px-6 text-white transition-opacity duration-700"
      style={{ opacity }}
    >
      <div className="pointer-events-none absolute left-1/2 top-[-20%] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-30%] right-[-10%] h-[28rem] w-[28rem] rounded-full bg-teal-300/15 blur-3xl" />

      <div className="relative flex flex-col items-center [perspective:1200px]">
        <div className="animate-card-3d-in">
          <div className="animate-float will-change-transform" style={{ transformStyle: "preserve-3d" }}>
            <div
              className="flex h-28 w-28 items-center justify-center rounded-3xl bg-white"
              style={{
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(0,0,0,0.05) inset, 0 30px 40px -18px rgba(0,0,0,0.55), 0 14px 24px -16px rgba(0,0,0,0.45)",
              }}
            >
              <Image
                src="/logo.png"
                alt="BuangYuk"
                width={84}
                height={84}
                className="object-contain"
                priority
              />
            </div>
            <div className="mx-6 mt-3 rounded-full bg-black/35 blur-md"
              style={{ height: 10, boxShadow: "0 0 22px 12px rgba(0,0,0,0.35)" }}
            />
          </div>
        </div>

        <h1 className="mt-9 animate-fade-up text-3xl font-semibold tracking-tight sm:text-4xl">
          Buang<b className="font-semibold text-emerald-200">Yuk</b>
        </h1>
        <p className="mt-3 animate-fade-up text-sm font-light tracking-wide text-white/75" style={{ animationDelay: "0.15s" }}>
          Setor sampah, panen manfaat
        </p>

        <div className="mt-12 flex animate-fade-up flex-col items-center" style={{ animationDelay: "0.3s" }}>
          <div className="h-px w-36 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-1/3 animate-shimmer rounded-full bg-white/80" />
          </div>
          <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.35em] text-white/45">
            Menyiapkan
          </p>
        </div>
      </div>
    </div>
  );
}
