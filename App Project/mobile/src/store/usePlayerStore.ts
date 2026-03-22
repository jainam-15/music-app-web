import { create } from 'zustand';
import { getRecommendedSongs, MappedSong, UserAPI } from '../lib/api';
import { Audio } from 'expo-av';

interface PlayerState {
  currentSong: MappedSong | null;
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
  playbackQueue: MappedSong[];
  queueIndex: number;
  isShuffle: boolean;
  repeatMode: 'none' | 'one' | 'all';
  sound: Audio.Sound | null;

  setCurrentSong: (song: MappedSong, newQueue?: MappedSong[]) => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seekTo: (percent: number) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  updateProgress: (status: any) => void;
  setSound: (sound: Audio.Sound | null) => void;
  hydrateQueue: (song: MappedSong) => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  progressMs: 0,
  durationMs: 0,
  playbackQueue: [],
  queueIndex: 0,
  isShuffle: false,
  repeatMode: 'none',
  sound: null,

  setSound: (sound) => set({ sound }),

  hydrateQueue: async (song: MappedSong) => {
    const { playbackQueue } = get();
    try {
      const recommendations = await getRecommendedSongs(song.id, 12, song);
      const existingIds = new Set(playbackQueue.map(s => s.id));
      const filtered = recommendations.filter(r => !existingIds.has(r.id));
      if (filtered.length > 0) {
        set({ playbackQueue: [...playbackQueue, ...filtered] });
      }
    } catch (e) {
      console.error("Hydrate failed:", e);
    }
  },

  setCurrentSong: async (song, newQueue) => {
    const { sound, playbackQueue, hydrateQueue } = get();
    
    if (sound) {
      await sound.unloadAsync();
    }

    let currentQueue = newQueue || [...playbackQueue];
    let idx = currentQueue.findIndex(s => s.id === song.id);
    if (idx === -1) {
      currentQueue = [song];
      idx = 0;
    }

    set({
      currentSong: song,
      isPlaying: true,
      progressMs: 0,
      durationMs: song.duration * 1000,
      playbackQueue: currentQueue,
      queueIndex: idx,
    });

    hydrateQueue(song);
    
    // Track recent play with real user ID
    const { userId } = require('./useUserStore').useUserStore.getState();
    UserAPI.addRecentPlay(userId, song);

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.url },
        { shouldPlay: true }
      );
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        get().updateProgress(status);
      });

      set({ sound: newSound });
    } catch (e) {
      console.error("Error playing song:", e);
    }
  },

  togglePlay: async () => {
    const { sound, isPlaying } = get();
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    set({ isPlaying: !isPlaying });
  },

  updateProgress: (status) => {
    if (status.isLoaded) {
      set({
        progressMs: status.positionMillis,
        durationMs: status.durationMillis || get().durationMs,
      });

      if (status.didJustFinish) {
        get().next();
      }
    }
  },

  next: async () => {
    const { playbackQueue, queueIndex, isShuffle, repeatMode, currentSong, setCurrentSong } = get();
    
    if (repeatMode === 'one' && currentSong) {
      setCurrentSong(currentSong);
      return;
    }

    let nextIdx = isShuffle 
      ? Math.floor(Math.random() * playbackQueue.length) 
      : queueIndex + 1;

    if (nextIdx < playbackQueue.length) {
      setCurrentSong(playbackQueue[nextIdx]);
    } else if (repeatMode === 'all' && playbackQueue.length > 0) {
      setCurrentSong(playbackQueue[0]);
    } else if (currentSong) {
      const recs = await getRecommendedSongs(currentSong.id, 5, currentSong);
      if (recs.length > 0) {
        const newQueue = [...playbackQueue, ...recs];
        setCurrentSong(recs[0], newQueue);
      } else {
        set({ isPlaying: false });
      }
    }
  },

  prev: async () => {
    const { sound, progressMs, queueIndex, playbackQueue, setCurrentSong } = get();
    if (progressMs > 3000 && sound) {
      await sound.setPositionAsync(0);
      return;
    }

    if (queueIndex > 0) {
      setCurrentSong(playbackQueue[queueIndex - 1]);
    }
  },

  seekTo: async (percent) => {
    const { sound, durationMs } = get();
    if (sound && durationMs > 0) {
      const targetMs = (percent / 100) * durationMs;
      await sound.setPositionAsync(targetMs);
      set({ progressMs: targetMs });
    }
  },

  toggleShuffle: () => set(state => ({ isShuffle: !state.isShuffle })),
  
  toggleRepeat: () => set(state => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one'];
    const nextMode = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length];
    return { repeatMode: nextMode };
  }),
}));
