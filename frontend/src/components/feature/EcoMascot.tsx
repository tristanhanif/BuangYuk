"use client";

import { cn } from "@/lib/utils";

export interface EcoMascotProps {
  stage: 1 | 2 | 3 | 4;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  message?: string;
  className?: string;
}

const SIZE_CLASS = {
  sm: "h-16 w-16",
  md: "h-28 w-28",
  lg: "h-40 w-40",
};

/**
 * Stage menghubungkan visual mascot ke Level Ekologi (satu sistem).
 * stage 1 = Benih, 2 = Tunas, 3 = Pohon Rindang, 4 = Earth Guardian.
 */
export function EcoMascot({ stage, size = "md", animated = false, message, className }: EcoMascotProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className={cn(
          "relative",
          SIZE_CLASS[size],
          animated && "animate-bounce-slow"
        )}
        aria-label={`Maskot ekologi tahap ${stage}`}
      >
        <MascotIllustration stage={stage} />
      </div>
      {message && (
        <p className="mt-2 text-sm text-muted-foreground text-center">{message}</p>
      )}
    </div>
  );
}

export function stageFromXp(xp: number): 1 | 2 | 3 | 4 {
  if (xp >= 2001) return 4;
  if (xp >= 501) return 3;
  if (xp >= 251) return 2;
  return 1;
}

export function stageFromLevel(level: "bronze" | "silver" | "gold", xp: number): 1 | 2 | 3 | 4 {
  if (level === "gold") return 4;
  if (level === "silver") return 3;
  return xp >= 251 ? 2 : 1;
}

function MascotIllustration({ stage }: { stage: 1 | 2 | 3 | 4 }) {
  switch (stage) {
    case 1:
      return <SeedlingSVG />;
    case 2:
      return <SproutSVG />;
    case 3:
      return <TreeSVG />;
    case 4:
      return <GuardianSVG />;
  }
}

function SeedlingSVG() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Benih">
      <circle cx="100" cy="100" r="80" fill="#F0FDF4" />
      <ellipse cx="100" cy="165" rx="36" ry="14" fill="#B08D57" />
      <path d="M100 165 C100 120 80 80 60 60" stroke="#10B981" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M100 165 C100 120 120 80 140 60" stroke="#10B981" strokeWidth="8" fill="none" strokeLinecap="round" />
      <ellipse cx="62" cy="55" rx="18" ry="26" fill="#6EE7B7" transform="rotate(-20 62 55)" />
      <ellipse cx="138" cy="55" rx="18" ry="26" fill="#6EE7B7" transform="rotate(20 138 55)" />
      <circle cx="86" cy="175" r="4" fill="#6EE7B7" />
      <circle cx="100" cy="180" r="4" fill="#6EE7B7" />
      <circle cx="114" cy="175" r="4" fill="#6EE7B7" />
    </svg>
  );
}

function SproutSVG() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Tunas">
      <circle cx="100" cy="100" r="80" fill="#ECFDF5" />
      <ellipse cx="100" cy="180" rx="44" ry="14" fill="#B08D57" />
      <path d="M100 180 C100 130 90 90 100 60" stroke="#059669" strokeWidth="10" fill="none" strokeLinecap="round" />
      <ellipse cx="64" cy="80" rx="30" ry="16" fill="#10B981" transform="rotate(-25 64 80)" />
      <ellipse cx="136" cy="80" rx="30" ry="16" fill="#34D399" transform="rotate(25 136 80)" />
      <ellipse cx="100" cy="56" rx="20" ry="30" fill="#10B981" />
      <circle cx="82" cy="70" r="3.5" fill="#047857" />
      <circle cx="100" cy="56" r="3.5" fill="#047857" />
      <circle cx="118" cy="70" r="3.5" fill="#047857" />
    </svg>
  );
}

function TreeSVG() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Pohon Rindang">
      <circle cx="100" cy="100" r="80" fill="#ECFDF5" />
      <ellipse cx="100" cy="182" rx="48" ry="14" fill="#B08D57" />
      <rect x="92" y="120" width="16" height="52" rx="6" fill="#92400E" />
      <circle cx="100" cy="92" r="52" fill="#10B981" />
      <circle cx="70" cy="118" r="30" fill="#059669" />
      <circle cx="130" cy="118" r="30" fill="#34D399" />
      <circle cx="100" cy="58" r="22" fill="#6EE7B7" />
      <circle cx="86" cy="110" r="3" fill="#FBBF24" />
      <circle cx="114" cy="104" r="3" fill="#FBBF24" />
      <circle cx="96" cy="84" r="3" fill="#FBBF24" />
    </svg>
  );
}

function GuardianSVG() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Earth Guardian">
      <circle cx="100" cy="100" r="80" fill="#EFF6F8" />
      <circle cx="100" cy="100" r="56" fill="#0F4C5C" />
      <circle cx="100" cy="100" r="56" fill="none" stroke="#FBBF24" strokeWidth="4" />
      <path
        d="M100 60 C120 72 120 110 100 132 C80 110 80 72 100 60 Z"
        fill="#10B981"
      />
      <path
        d="M64 92 C84 96 92 104 96 118 C76 112 66 104 64 92 Z"
        fill="#34D399"
      />
      <path
        d="M136 92 C116 96 108 104 104 118 C124 112 134 104 136 92 Z"
        fill="#34D399"
      />
      <rect x="82" y="74" width="36" height="10" rx="5" fill="#FBBF24" />
      <circle cx="96" cy="96" r="6" fill="#0F4C5C" />
      <circle cx="104" cy="96" r="6" fill="#0F4C5C" />
      <path d="M93 108 Q100 114 107 108" stroke="#0F4C5C" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
