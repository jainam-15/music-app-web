import { create } from 'zustand';

export interface PlayerSong {
  id: string;
  title: string;
  artist: string;
  album?: string;
  cover: string;
  url: string;
  duration?: number;
}

interface PlayerState {
  currentSong: PlayerSong | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: PlayerSong[];
  currentIndex: number;

  setCurrentSong: (song: PlayerSong) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setQueue: (queue: PlayerSong[]) => void;
  next: () => void;
  prev: () => void;
  
  // --- New Logic ---
  isShuffle: boolean;
  repeatMode: 'none' | 'one' | 'all';
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  volume: 0.5,
  progress: 0,
  duration: 0,
  queue: [],
  currentIndex: -1,

  isShuffle: false,
  repeatMode: 'none',

  setCurrentSong: (song: PlayerSong) => {
    const { queue } = get();
    const idx = queue.findIndex((s) => s.id === song.id);
    set({
      currentSong: song,
      isPlaying: true,
      progress: 0,
      currentIndex: idx >= 0 ? idx : 0,
    });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume: number) => set({ volume }),
  setProgress: (progress: number) => set({ progress }),
  setDuration: (duration: number) => set({ duration }),
  setQueue: (queue: PlayerSong[]) => set({ queue }),

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleRepeat: () => set((state) => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one'];
    const current = modes.indexOf(state.repeatMode);
    return { repeatMode: modes[(current + 1) % modes.length] };
  }),

  next: () => {
    const { queue, currentIndex, isShuffle, repeatMode } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      set({ progress: 0, isPlaying: true });
      return;
    }

    let nextIndex = currentIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    }

    if (nextIndex < queue.length) {
      set({
        currentSong: queue[nextIndex],
        currentIndex: nextIndex,
        isPlaying: true,
        progress: 0,
      });
    } else {
      if (repeatMode === 'all') {
        set({
          currentSong: queue[0],
          currentIndex: 0,
          isPlaying: true,
          progress: 0,
        });
      } else {
        set({ isPlaying: false });
      }
    }
  },

  prev: () => {
    const { queue, currentIndex, progress } = get();
    if (progress > 3) {
      set({ progress: 0 });
      return;
    }
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      set({
        currentSong: queue[prevIndex],
        currentIndex: prevIndex,
        isPlaying: true,
        progress: 0,
      });
    } else if (queue.length > 0) {
      // If at start, restart first song
      set({ progress: 0 });
    }
  },
}));
