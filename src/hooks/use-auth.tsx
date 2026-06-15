import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        user,
        loading: false,
        isAuthenticated: !!user,
      });
    });

    return () => unsubscribe();
  }, []);

  return authState;
}

/**
 * Get current user synchronously from Firebase auth state
 * Use this in route guards and other sync contexts
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Async function to get the current user's ID token
 */
export async function getIdToken(): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;
  return user.getIdToken();
}
