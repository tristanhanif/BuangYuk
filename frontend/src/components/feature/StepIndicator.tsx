"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function StepIndicator({ currentStep, totalSteps, labels, className }: StepIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          const isActive = step === currentStep;
          const isDone = step < currentStep;
          return (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all",
                    isDone && "bg-primary text-primary-foreground",
                    isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isActive && !isDone && "bg-muted text-muted-foreground"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isDone ? <Check className="h-4 w-4" /> : step}
                </div>
                {labels && (
                  <span
                    className={cn(
                      "mt-1 hidden max-w-[80px] text-center text-xs sm:block",
                      isActive ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {labels[index]}
                  </span>
                )}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded-full",
                    step < currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
