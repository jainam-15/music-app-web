import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PlayerSong } from "./usePlayerStore";
import { UserAPI } from "@/lib/backend";
import { useAuthStore } from "./useAuthStore";

interface LikedState {
  likedSongs: PlayerSong[];
  toggleLike: (song: PlayerSong) => Promise<void>;
  isLiked: (id: string) => boolean;
  setLikedSongs: (songs: PlayerSong[]) => void;
  fetchLikedSongs: () => Promise<void>;
}

export const useLikedStore = create<LikedState>()(
  persist(
    (set, get) => ({
      likedSongs: [],
      setLikedSongs: (songs) => set({ likedSongs: songs }),
      toggleLike: async (song: PlayerSong) => {
        const { likedSongs } = get();
        const user = useAuthStore.getState().user;
        const exists = likedSongs.find((s) => s.id === song.id);
        
        let newLiked;
        if (exists) {
          newLiked = likedSongs.filter((s) => s.id !== song.id);
        } else {
          newLiked = [song, ...likedSongs];
        }
        
        set({ likedSongs: newLiked });

        // If user is logged in, sync with backend
        if (user) {
          try {
            await UserAPI.likeSong(user.uid, song);
          } catch (e) {
            console.error("Failed to sync like with backend:", e);
          }
        }
      },
      isLiked: (id: string) => {
        return get().likedSongs.some((s) => s.id === id);
      },
      fetchLikedSongs: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        try {
          const songs = await UserAPI.getLikedSongs(user.uid);
          if (songs) set({ likedSongs: songs });
        } catch (e) {
          console.error("Failed to fetch liked songs:", e);
        }
      },
    }),
    {
      name: "music-app-liked-songs",
    }
  )
);
