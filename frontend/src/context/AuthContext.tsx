"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}