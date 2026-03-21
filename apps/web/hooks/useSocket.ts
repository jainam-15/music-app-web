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
      const player = usePlayerStore.getState();
      
      // Only update if it's a different song
      if (!player.currentSong || player.currentSong.id !== state.currentSong.id) {
        // Skip hydration on synced song update: only the initiating device should hydrate
        setCurrentSong(state.currentSong, undefined, true);
      }
      
      // If playing status changed
      if (player.isPlaying !== state.isPlaying) {
        togglePlay();
      }
    });

    socket.on('queue-synced', (incomingQueue: any[]) => {
      const currentQueue = usePlayerStore.getState().queue;
      // Basic length and first item check for perf, then stringify for deep check
      if (currentQueue.length !== incomingQueue.length || 
          (incomingQueue.length > 0 && currentQueue[0]?.id !== incomingQueue[0]?.id) ||
          JSON.stringify(currentQueue) !== JSON.stringify(incomingQueue)) {
        setQueue(incomingQueue);
      }
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
