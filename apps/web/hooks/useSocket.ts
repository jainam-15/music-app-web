import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/usePlayerStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export const useSocket = () => {
  const { user } = useAuthStore();
  const { setCurrentSong, togglePlay, setQueue } = usePlayerStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit('join-room', user.uid);

    socket.on('playback-update', (state: any) => {
      // Logic to sync state from other devices
      console.log('Sync from other device:', state);
      // We only update if it's a different song or significant diff
      const current = usePlayerStore.getState().currentSong;
      if (!current || current.id !== state.currentSong.id) {
        setCurrentSong(state.currentSong);
      }
      // If playing status changed
      if (usePlayerStore.getState().isPlaying !== state.isPlaying) {
        togglePlay();
      }
    });

    socket.on('queue-synced', (queue: any[]) => {
      setQueue(queue);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const emitPlaybackState = (state: any) => {
    if (socketRef.current && user) {
      socketRef.current.emit('playback-state', { userId: user.uid, state });
    }
  };

  const emitQueueUpdate = (queue: any[]) => {
    if (socketRef.current && user) {
      socketRef.current.emit('queue-update', { userId: user.uid, queue });
    }
  };

  return { emitPlaybackState, emitQueueUpdate };
};
