import { create } from 'zustand';
import { getRecommendedSongs, searchSongs } from '@/lib/api';

export interface PlayerSong {
  id: string;
  title: string;
  artist: string;
  album: string; // Made string instead of optional string to match MappedSong
  cover: string;
  url: string;
  duration: number;
  language: string;
}

interface PlayerState {
  currentSong: PlayerSong | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: PlayerSong[];
  currentIndex: number;

  setCurrentSong: (song: PlayerSong, newQueue?: PlayerSong[], skipHydration?: boolean) => Promise<void>;
  hydrateQueue: (song: PlayerSong) => Promise<void>;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setQueue: (queue: PlayerSong[]) => void;
  addToQueue: (song: PlayerSong) => void;
  playNext: (song: PlayerSong) => void;
  next: () => void;
  prev: () => void;
  
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

  hydrateQueue: async (song: PlayerSong) => {
    const { queue } = get();
    try {
      const recommendations = await getRecommendedSongs(song.id, 20, song);
      const filtered = recommendations.filter(r => 
        !queue.find(q => q.id === r.id)
      );
      
      if (filtered.length > 0) {
        set({ queue: [...queue, ...filtered] });
      }
    } catch (e) {
      const fallbackQuery = song.language ? `trending ${song.language}` : "trending hindi";
      const trending = await searchSongs(fallbackQuery, 10);
      set({ queue: [...queue, ...trending.filter((t: any) => !queue.find(q => q.id === t.id))] });
    }
  },

  setCurrentSong: async (song: PlayerSong, newQueue?: PlayerSong[], skipHydration = false) => {
    const { queue, hydrateQueue } = get();
    
    let currentQueue = newQueue || [...queue];
    let idx = currentQueue.findIndex((s) => s.id === song.id);
    
    if (idx === -1) {
      // If we don't have it, we must reset
      currentQueue = [song];
      idx = 0;
    }

    set({
      currentSong: song,
      isPlaying: true,
      progress: 0,
      queue: currentQueue,
      currentIndex: idx,
    });

    if (!skipHydration) {
      hydrateQueue(song);
    }
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume: number) => set({ volume }),
  setProgress: (progress: number) => set({ progress }),
  setDuration: (duration: number) => set({ duration }),
  setQueue: (queue: PlayerSong[]) => set((state) => {
    const idx = state.currentSong ? queue.findIndex(s => s.id === state.currentSong!.id) : -1;
    return { 
      queue,
      currentIndex: idx !== -1 ? idx : state.currentIndex 
    };
  }),
  
  addToQueue: (song: PlayerSong) => {
    const { queue } = get();
    if (!queue.find(s => s.id === song.id)) {
      set({ queue: [...queue, song] });
    }
  },

  playNext: (song: PlayerSong) => {
    const { queue, currentIndex } = get();
    const filtered = queue.filter(s => s.id !== song.id);
    const newQueue = [
      ...filtered.slice(0, currentIndex + 1),
      song,
      ...filtered.slice(currentIndex + 1)
    ];
    set({ queue: newQueue });
  },

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleRepeat: () => set((state) => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one'];
    const current = modes.indexOf(state.repeatMode);
    return { repeatMode: modes[(current + 1) % modes.length] };
  }),

  next: async () => {
    const { queue, currentIndex, isShuffle, repeatMode, currentSong } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      set({ progress: 0, isPlaying: true });
      return;
    }

    let nextIndex = currentIndex + 1;
    
    if (isShuffle && currentSong) {
      try {
        const recommendations = await getRecommendedSongs(currentSong.id, 10, currentSong);
        const uniqueRecs = recommendations.filter(r => 
          r.title.toLowerCase() !== currentSong.title.toLowerCase() && 
          !queue.find(q => q.id === r.id)
        );
        
        if (uniqueRecs.length > 0) {
           const newQueue = [...queue];
           newQueue.splice(currentIndex + 1, 0, ...uniqueRecs);
           set({ queue: newQueue });
        }
      } catch (e) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }
    } else if (isShuffle) {
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
      } else if (currentSong) {
        const recommendations = await getRecommendedSongs(currentSong.id, 10, currentSong);
        const filtered = recommendations.filter(r => 
          r.title.toLowerCase() !== currentSong.title.toLowerCase()
        );
        
        if (filtered.length > 0) {
          const newQueue = [...queue, ...filtered];
          set({
            queue: newQueue,
            currentSong: filtered[0],
            currentIndex: nextIndex,
            isPlaying: true,
            progress: 0,
          });
        } else {
          set({ isPlaying: false });
        }
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
      set({ progress: 0 });
    }
  },
}));
