"use client";

import { Play, Pause } from "lucide-react";
import { usePlayerStore, PlayerSong } from "../store/usePlayerStore";
import { getRecommendedSongs } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface MusicCardProps {
  song: PlayerSong;
  queue?: PlayerSong[];
}

const MusicCard = ({ song, queue }: MusicCardProps) => {
  const { currentSong, isPlaying, setCurrentSong, setQueue } = usePlayerStore();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSong(song, queue);
  };

  const isActive = currentSong?.id === song.id;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={handlePlay}
      className="group relative bg-zinc-900/40 p-4 rounded-2xl hover:bg-zinc-800/60 transition-all duration-300 border border-white/5 hover:border-white/10 shadow-xl cursor-pointer"
    >
      <div className="relative aspect-square mb-4 overflow-hidden rounded-xl shadow-2xl">
        <img
          src={song.cover}
          alt={song.title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40"
          >
            {isActive && isPlaying ? (
              <div className="flex items-end gap-1 h-5">
                <div className="w-1 bg-black rounded-full animate-bounce h-full" style={{ animationDelay: '0ms' }} />
                <div className="w-1 bg-black rounded-full animate-bounce h-[70%]" style={{ animationDelay: '100ms' }} />
                <div className="w-1 bg-black rounded-full animate-bounce h-[90%]" style={{ animationDelay: '200ms' }} />
              </div>
            ) : (
              <Play className="w-7 h-7 text-black fill-black ml-1" />
            )}
          </motion.button>
        </div>

        {isActive && (
          <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse" />
        )}
      </div>

      <div className="space-y-1">
        <h3 className={`font-black text-sm truncate tracking-tight transition-colors ${isActive ? 'text-green-500' : 'text-white'}`}>
          {song.title}
        </h3>
        <p className="text-zinc-500 text-xs font-bold truncate group-hover:text-zinc-300 transition-colors">
          {song.artist}
        </p>
      </div>
    </motion.div>
  );
};

export default MusicCard;
