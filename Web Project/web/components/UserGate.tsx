"use client";

import { useAuthStore } from "@/store/useAuthStore";

/**
 * Gatekeeper component that only renders its children if a user is authenticated.
 */
export const UserGate = ({ children }: { children: React.ReactNode }) => {
  const { user, initialized } = useAuthStore();
  
  // If we haven't checked auth yet, we show nothing (splash handles it)
  if (!initialized) return null;
  
  // If no user, everything inside THIS gate is hidden
  if (!user) return null;

  return <>{children}</>;
};
