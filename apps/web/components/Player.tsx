"use client";

import { useRef, useEffect, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Repeat, Shuffle, Heart, Maximize2, ListMusic } from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useLikedStore } from "../store/useLikedStore";
import { useSocket } from "@/hooks/useSocket";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const Player = () => {
  const {
    currentSong, isPlaying, volume, togglePlay, setVolume,
    progress, setProgress, duration, setDuration,
    next, prev, queue,
    isShuffle, repeatMode, toggleShuffle, toggleRepeat
  } = usePlayerStore();
  const { toggleLike, isLiked } = useLikedStore();
  const { emitPlaybackState, emitQueueUpdate } = useSocket();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (currentSong) {
      emitPlaybackState({ currentSong, isPlaying, progress });
    }
  }, [currentSong, isPlaying]);

  useEffect(() => {
    if (queue.length > 0) {
      emitQueueUpdate(queue);
    }
  }, [queue]);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  const liked = isLiked(currentSong.id);

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 h-24 bg-black/60 backdrop-blur-3xl border-t border-white/5 px-6 flex items-center justify-between z-[60] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => next()}
      />

      {/* Info Section */}
      <div className="flex items-center gap-4 min-w-0 w-1/3 group">
        <Link href="/now-playing" className="relative flex-shrink-0">
          <img
            src={currentSong.cover}
            className="w-14 h-14 rounded-lg shadow-2xl group-hover:scale-105 transition-transform cursor-pointer object-cover"
            alt="Cover"
          />
          <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </Link>
        <div className="flex flex-col truncate">
          <Link href="/now-playing">
            <span className="text-white text-sm font-bold truncate hover:underline cursor-pointer">
              {currentSong.title}
            </span>
          </Link>
          <span className="text-zinc-500 text-xs font-bold truncate hover:text-zinc-300 transition-colors cursor-pointer">
            {currentSong.artist}
          </span>
        </div>
        <button 
          onClick={() => toggleLike(currentSong)} 
          className="flex-shrink-0 ml-4 hover:scale-110 active:scale-90 transition-transform"
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              liked ? "text-green-500 fill-green-500" : "text-zinc-600 hover:text-white"
            }`}
          />
        </button>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col items-center gap-2 w-1/3">
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleShuffle}
            className={`transition-colors ${isShuffle ? 'text-green-500' : 'text-zinc-500 hover:text-white'}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button onClick={prev} className="text-zinc-300 hover:text-white transition-colors active:scale-90"><SkipBack className="w-5 h-5 fill-current" /></button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl shadow-white/10"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-black fill-black" />
            ) : (
              <Play className="w-5 h-5 text-black fill-black ml-0.5" />
            )}
          </button>
          <button onClick={next} className="text-zinc-300 hover:text-white transition-colors active:scale-90"><SkipForward className="w-5 h-5 fill-current" /></button>
          <button 
            onClick={toggleRepeat}
            className={`transition-colors relative ${repeatMode !== 'none' ? 'text-green-500' : 'text-zinc-500 hover:text-white'}`}
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-2.5 h-2.5 bg-green-500 rounded-full text-[5px] font-black text-black">1</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 w-full max-w-lg group/progress">
          <span className="text-[10px] font-bold text-zinc-500 w-8 text-right tabular-nums">{formatTime(progress)}</span>
          <div className="relative flex-1 flex items-center h-4">
             <input
               type="range"
               min={0}
               max={duration || 0}
               value={progress}
               onChange={handleSeek}
               className="absolute z-10 w-full h-1 bg-transparent appearance-none cursor-pointer accent-white opacity-0 focus:opacity-100 group-hover/progress:opacity-100 transition-opacity"
             />
             <div className="absolute w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-white rounded-full relative"
                  style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                >
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-xl opacity-0 group-hover/progress:opacity-100 transition-opacity translate-x-1/2" />
                </motion.div>
             </div>
          </div>
          <span className="text-[10px] font-bold text-zinc-500 w-8 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume & Extras Section */}
      <div className="flex items-center justify-end gap-4 w-1/3 pr-2 group/vol">
        <Link href="/queue" className="p-2 text-zinc-400 hover:text-white transition-all hover:bg-white/5 rounded-lg active:scale-90">
          <ListMusic className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
           <button onClick={() => setVolume(volume === 0 ? 0.5 : 0)} className="text-zinc-400 hover:text-white transition-colors">
             {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
           </button>
           <div className="relative w-24 h-4 flex items-center">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="absolute z-10 w-full h-1 bg-transparent appearance-none cursor-pointer accent-white opacity-0 focus:opacity-100 group-hover/vol:opacity-100 transition-opacity"
              />
              <div className="absolute w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                 <div className="h-full bg-zinc-400 group-hover/vol:bg-green-500 transition-colors" style={{ width: `${volume * 100}%` }} />
              </div>
           </div>
        </div>
        <Link href="/now-playing" className="p-2 text-zinc-400 hover:text-white transition-all hover:bg-white/5 rounded-lg active:scale-90">
          <Maximize2 className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default Player;
