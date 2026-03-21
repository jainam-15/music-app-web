import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { usePlayerStore } from '../store/usePlayerStore';
import { useUserStore } from '../store/useUserStore';

const SOCKET_URL = "http://localhost:3001";

export const useSocketSync = () => {
  const { currentSong, isPlaying, setCurrentSong, togglePlay, playbackQueue } = usePlayerStore();
  const { userId } = useUserStore();

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL);
    socket.emit('join-room', userId);

    socket.on('playback-update', (state) => {
      const songChanged = currentSong?.id !== state.currentSong.id;
      const playStateChanged = isPlaying !== state.isPlaying;

      if (songChanged) {
        setCurrentSong(state.currentSong);
      } else if (playStateChanged) {
        togglePlay();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);
};
