"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { isConfigValid } from "@/lib/firebase";

/**
 * Initializes the auth state and forces the login modal if no user exists.
 */
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { initialize, user, initialized, loading, setIsAuthOpen } = useAuthStore();
  
  useEffect(() => {
    if (isConfigValid) {
      initialize();
    }
  }, [initialize]);

  useEffect(() => {
    if (initialized && !loading && !user) {
      setIsAuthOpen(true);
    }
  }, [initialized, loading, user, setIsAuthOpen]);

  // Loading Splash
  if (!initialized) {
     return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center gap-6">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-xs animate-pulse">Initializing Portal</p>
        </div>
     );
  }

  return (
    <div className="contents">
       {children}
    </div>
  );
};
