import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserAPI } from "@/lib/backend";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  dob?: string;
  profileComplete?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  isAuthOpen: boolean;
  setUser: (user: any) => void;
  setIsAuthOpen: (open: boolean) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  initialize: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      initialized: false,
      isAuthOpen: false,
      setUser: (user) => set({ user }),
      setIsAuthOpen: (open) => set({ isAuthOpen: open }),
      
      updateProfile: async (data) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        const updatedUser = { ...currentUser, ...data, profileComplete: true };
        set({ user: updatedUser });
        
        try {
          await UserAPI.sync(updatedUser);
        } catch (e) {
          console.error("Profile update sync failed:", e);
        }
      },

      initialize: () => {
        if (get().initialized) return;
        
        onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            const user = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "User",
              photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'User'}&background=random`,
            };
            
            set({ user, loading: false, initialized: true });
            
            // Sync with backend
            try {
              const profile = await UserAPI.sync(user);
              if (profile && profile.dob) {
                set({ user: { ...user, ...profile, profileComplete: true } });
              } else {
                set({ user: { ...user, profileComplete: false } });
              }

              // Refresh data
              const { fetchLikedSongs } = (await import("./useLikedStore")).useLikedStore.getState();
              const { fetchPlaylists } = (await import("./usePlaylistStore")).usePlaylistStore.getState();
              fetchLikedSongs();
              fetchPlaylists();
            } catch (e) {
              console.error("Backend sync failed:", e);
            }
          } else {
            set({ user: null, loading: false, initialized: true });
          }
        });
      },

      logout: async () => {
        set({ loading: true });
        try {
          await signOut(auth);
          set({ user: null, loading: false });
        } catch (error) {
          console.error("Logout failed:", error);
          set({ loading: false });
        }
      },
    }),
    {
      name: "music-app-auth",
      partialize: (state) => ({ user: state.user }), // Only persist user info
    }
  )
);
