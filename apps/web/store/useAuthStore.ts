import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserAPI } from "@/lib/backend";

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: any) => void;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      setUser: (user) => set({ user }),
      loginAsGuest: async () => {
        set({ loading: true });
        // Mocked guest user for demo persistence
        const guest = {
          uid: "guest-123",
          email: "guest@musicapp.com",
          displayName: "Guest Listener",
          photoURL: "https://ui-avatars.com/api/?name=Guest+Listener&background=1DB954&color=fff",
        };
        try {
          // Sync with our backend
          await UserAPI.sync(guest);
          set({ user: guest, loading: false });
          
          // Trigger data refresh from other stores
          const { fetchLikedSongs } = (await import("./useLikedStore")).useLikedStore.getState();
          const { fetchPlaylists } = (await import("./usePlaylistStore")).usePlaylistStore.getState();
          fetchLikedSongs();
          fetchPlaylists();
        } catch (e) {
          console.error("Backend sync failed:", e);
          set({ user: guest, loading: false }); // Fallback to local
        }
      },
      logout: () => set({ user: null }),
    }),
    {
      name: "music-app-auth",
    }
  )
);
