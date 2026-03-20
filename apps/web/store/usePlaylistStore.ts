import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserAPI } from "@/lib/backend";
import { useAuthStore } from "./useAuthStore";
import { PlayerSong } from "./usePlayerStore";

interface Playlist {
  id: string;
  name: string;
  songs: PlayerSong[];
  createdAt: string;
}

interface PlaylistState {
  playlists: Playlist[];
  loading: boolean;
  createPlaylist: (name: string) => Promise<void>;
  addToPlaylist: (playlistId: string, song: PlayerSong) => Promise<void>;
  removeFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  fetchPlaylists: () => Promise<void>;
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: [],
      loading: false,

      fetchPlaylists: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        set({ loading: true });
        try {
          const res = await UserAPI.getPlaylists(user.uid);
          set({ playlists: res, loading: false });
        } catch (e) {
          console.error("Fetch playlists failed:", e);
          set({ loading: false });
        }
      },

      createPlaylist: async (name) => {
        const user = useAuthStore.getState().user;
        const newPlaylist: Playlist = {
          id: Math.random().toString(36).substring(2, 9),
          name,
          songs: [],
          createdAt: new Date().toISOString(),
        };

        if (user) {
          try {
            const res = await UserAPI.createPlaylist(user.uid, name);
            set({ playlists: [...get().playlists, res] });
            return;
          } catch (e) {
            console.error("Failed to create playlist on backend:", e);
          }
        }

        // Always update local state for guest or if backend fails
        set({ playlists: [...get().playlists, newPlaylist] });
      },

      addToPlaylist: async (playlistId, song) => {
        const user = useAuthStore.getState().user;
        if (user) {
          try {
            await UserAPI.addToPlaylist(user.uid, playlistId, song);
          } catch (e) {
            console.error("Failed to add to playlist on backend:", e);
          }
        }

        // Update local state
        const playlists = get().playlists.map(p => {
          if (p.id === playlistId) {
            const songExists = p.songs.some(s => s.id === song.id);
            if (songExists) return p;
            return { ...p, songs: [...p.songs, song] };
          }
          return p;
        });
        set({ playlists });
      },

      removeFromPlaylist: async (playlistId, songId) => {
        const user = useAuthStore.getState().user;
        if (user) {
          try {
            await UserAPI.removeFromPlaylist(user.uid, playlistId, songId);
          } catch (e) {
            console.error("Failed to remove from playlist on backend:", e);
          }
        }

        // Update local state
        const playlists = get().playlists.map(p => {
          if (p.id === playlistId) {
            return { ...p, songs: p.songs.filter(s => s.id !== songId) };
          }
          return p;
        });
        set({ playlists });
      },
    }),
    { name: "music-app-playlists" }
  )
);
