"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useLikedStore } from "@/store/useLikedStore";
import { usePlaylistStore } from "@/store/usePlaylistStore";
import { UserAPI } from "@/lib/backend";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  const { setLikedSongs } = useLikedStore();
  const { fetchPlaylists } = usePlaylistStore();

  useEffect(() => {
    if (user) {
      // Sync Library from backend when logging in
      Promise.all([
        UserAPI.getLikedSongs(user.uid),
        fetchPlaylists()
      ]).then(([backendLiked]) => {
        if (backendLiked && backendLiked.length > 0) {
          setLikedSongs(backendLiked);
        }
      }).catch(err => console.error("Failed to fetch library from backend:", err));
    }
  }, [user]);

  return <>{children}</>;
};
