"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    import("firebase/auth")
      .then(({ onAuthStateChanged }) =>
        import("@/lib/firebase/config").then(({ getFirebaseAuth }) => {
          unsubscribe = onAuthStateChanged(getFirebaseAuth(), (u) => {
            setUser(u);
            setLoading(false);
          });
        })
      )
      .catch(() => {
        // Firebase not configured — show UI as signed-out
        setLoading(false);
      });

    return () => unsubscribe?.();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import(
        "firebase/auth"
      );
      const { getFirebaseAuth } = await import("@/lib/firebase/config");
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
    } catch (e) {
      console.error("Sign-in failed:", e);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { signOut: firebaseSignOut } = await import("firebase/auth");
      const { getFirebaseAuth } = await import("@/lib/firebase/config");
      await firebaseSignOut(getFirebaseAuth());
    } catch (e) {
      console.error("Sign-out failed:", e);
    }
  }, []);

  return (
    <AuthContext value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
