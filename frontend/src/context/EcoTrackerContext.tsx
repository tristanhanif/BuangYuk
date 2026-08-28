"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useAuth } from "@/context/AuthContext";
import { EcoSummary } from "@/types/user";

interface EcoTrackerContextType {
  ecoSummary: EcoSummary | null;
  loading: boolean;
}

const EcoTrackerContext = createContext<EcoTrackerContextType | undefined>(undefined);

export function EcoTrackerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ecoSummary, setEcoSummary] = useState<EcoSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const summaryRef = doc(db, "user_eco_summaries", user.uid);
    const unsubscribe = onSnapshot(summaryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setEcoSummary({
          ...data,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        } as EcoSummary);
      } else {
        setEcoSummary({
          userId: user.uid,
          totalCO2Saved: 0,
          totalEcoPoints: 0,
          totalTransactions: 0,
          wasteBreakdown: {},
          monthlyCO2Trend: [],
          lastUpdated: new Date(),
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <EcoTrackerContext.Provider value={{ ecoSummary: user ? ecoSummary : null, loading: user ? loading : false }}>
      {children}
    </EcoTrackerContext.Provider>
  );
}

export function useEcoTracker() {
  const context = useContext(EcoTrackerContext);
  if (!context) {
    throw new Error("useEcoTracker must be used within an EcoTrackerProvider");
  }
  return context;
}