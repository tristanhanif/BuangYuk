"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

interface UserProfileData {
  uid: string;
  role: string;
  fullName?: string;  // update.md
  displayName?: string;  // legacy compat
  email?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch user profile from Firestore to get role
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfileData;
            setUserProfile(data);
            // Set role cookie for middleware
            document.cookie = `buangyuk_role=${data.role}; path=/; max-age=86400`;
          }
        } catch {
          // Profile fetch failed, continue with default
        }
      } else {
        setUserProfile(null);
        document.cookie = "buangyuk_role=; path=/; max-age=0";
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser(auth.currentUser);
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfileData);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, refreshUser }}>
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