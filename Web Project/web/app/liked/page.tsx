"use client";

import { useState } from "react";
import { Heart, Play, Music, Download, Clock, ArrowLeft, Share2, MoreHorizontal } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useLikedStore } from "@/store/useLikedStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LikedSongsPage() {
  const { setCurrentSong, setQueue, currentSong, isPlaying } = usePlayerStore();
  const { likedSongs, toggleLike } = useLikedStore();

  const formatDuration = (s: number) => {
    if (!s) return "--:--";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const playAll = () => {
    if (likedSongs.length > 0) {
      setQueue(likedSongs);
      setCurrentSong(likedSongs[0]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32 relative min-h-screen"
    >
      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 pointer-events-none -z-10 h-[500px] bg-gradient-to-b from-indigo-950/40 via-purple-950/20 to-black" />
      
      {/* Header */}
      <div className="p-8 pt-20 flex flex-col md:flex-row items-end gap-10 relative z-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-56 h-56 md:w-64 md:h-64 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] flex items-center justify-center relative group overflow-hidden"
        >
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-white/10 blur-[60px] opacity-40" 
          />
          <Heart className="w-24 h-24 text-white fill-white shadow-2xl relative z-10 drop-shadow-2xl" />
        </motion.div>
        
        <div className="flex flex-col gap-3 pb-2 flex-1">
          <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/5 w-fit">
            Playlist
          </span>
          <h1 className="text-5xl md:text-8xl font-black text-white leading-none tracking-tighter py-2">
            Liked Songs
          </h1>
          <div className="flex items-center flex-wrap gap-2 text-sm text-zinc-300 font-bold mt-2">
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden ring-1 ring-white/10">
                  <img src="https://ui-avatars.com/api/?name=Me&background=27272a&color=fff" alt="User" />
               </div>
               <span>Your Library</span>
            </div>
            <span className="opacity-50 text-xs">•</span>
            <span className="text-zinc-100">{likedSongs.length} songs saved</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="relative z-10 px-8 py-8 flex items-center gap-8 bg-gradient-to-b from-black/40 to-black/0 backdrop-blur-sm -mt-2 border-t border-white/5">
        <button
          onClick={playAll}
          disabled={likedSongs.length === 0}
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-green-500/20 group disabled:opacity-50 disabled:grayscale transition-all"
        >
          <Play className="w-8 h-8 text-black fill-black ml-1 group-hover:scale-110 transition-transform" />
        </button>
        <div className="flex items-center gap-4">
          <button className="p-2 text-zinc-400 hover:text-white transition-colors hover:scale-110 active:scale-90">
            <Download className="w-8 h-8" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-white transition-colors hover:scale-110 active:scale-90">
            <Share2 className="w-6 h-6" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-white transition-colors hover:scale-110 active:scale-90">
            <MoreHorizontal className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Tracklist section */}
      <div className="px-8 relative z-10">
        {likedSongs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 mb-6">
               <Music className="w-8 h-8 text-zinc-700" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Songs you like will appear here</h2>
            <p className="text-zinc-500 text-sm font-medium mb-8">Save songs by tapping the heart icon.</p>
            <Link href="/search">
               <button className="px-8 py-3 bg-white text-black rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-transform">
                 Find Songs
               </button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-4 px-6 pb-4 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-800/30 mb-4">
              <span className="w-8 text-center">#</span>
              <span className="flex-1">Title</span>
              <span className="w-48 hidden md:block">Album</span>
              <span className="w-20 text-right font-bold"><Clock className="w-4 h-4 ml-auto" /></span>
            </div>

            <div className="flex flex-col space-y-1">
              {likedSongs.map((song, idx) => {
                const isActive = currentSong?.id === song.id;
                return (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * idx }}
                    onClick={() => {
                      setQueue(likedSongs);
                      setCurrentSong(song);
                    }}
                    className={`group flex items-center gap-4 px-6 py-4 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5 ${isActive ? 'bg-white/10' : ''}`}
                  >
                    <div className="w-8 flex items-center justify-center">
                      {isActive && isPlaying ? (
                        <div className="flex items-end gap-0.5 h-3">
                           <div className="w-0.5 h-full bg-green-500 animate-[bounce_1s_infinite]" />
                           <div className="w-0.5 h-[60%] bg-green-500 animate-[bounce_1.2s_infinite]" />
                           <div className="w-0.5 h-[80%] bg-green-500 animate-[bounce_0.8s_infinite]" />
                        </div>
                      ) : (
                        <span className={`text-sm font-bold ${isActive ? 'text-green-500' : 'text-zinc-500 group-hover:hidden'}`}>{idx + 1}</span>
                      )}
                      {!isActive && <Play className="w-3 h-3 text-white hidden group-hover:block fill-white" />}
                    </div>

                    <div className="flex-1 flex items-center gap-4 min-w-0">
                      <div className="relative aspect-square w-10">
                        <img src={song.cover} alt="" className="w-full h-full rounded shadow-lg object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${isActive ? 'text-green-500' : 'text-white'}`}>{song.title}</p>
                        <p className="text-zinc-500 text-xs truncate font-medium group-hover:text-zinc-300 transition-colors">{song.artist}</p>
                      </div>
                    </div>

                    <div className="w-48 hidden md:block text-zinc-500 text-xs font-bold truncate group-hover:text-zinc-400 capitalize">{song.album}</div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                      className="p-2 text-green-500 hover:text-red-500 transition-colors group-hover:opacity-100"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                    
                    <span className="text-zinc-500 text-xs font-bold tabular-nums w-12 text-right">{formatDuration(song.duration || 0)}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
