"use client";

import { AuthModal } from "@/components/AuthModal";
import { useAuthStore } from "@/store/useAuthStore";

export const GlobalAuthModal = () => {
  const { isAuthOpen, setIsAuthOpen } = useAuthStore();
  
  return (
    <AuthModal 
      isOpen={isAuthOpen} 
      onClose={() => setIsAuthOpen(false)} 
    />
  );
};
