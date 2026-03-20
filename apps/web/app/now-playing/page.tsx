"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Heart, Share2, ListMusic, Mic2, Shuffle, Repeat } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { getLyrics } from "@/lib/api";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function NowPlayingPage() {
  const { 
    currentSong, isPlaying, togglePlay, progress, duration, next, prev,
    isShuffle, repeatMode, toggleShuffle, toggleRepeat 
  } = usePlayerStore();
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  useEffect(() => {
    if (currentSong && showLyrics) {
      setLoadingLyrics(true);
      getLyrics(currentSong.id).then((data) => {
        setLyrics(data);
        setLoadingLyrics(false);
      });
    }
  }, [currentSong, showLyrics]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <ListMusic className="w-16 h-16 text-zinc-600 mb-4" />
        <p className="text-zinc-400">No song is currently playing</p>
        <Link href="/" className="text-green-500 hover:underline mt-2 text-sm">Browse music</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-8 py-12 pb-32 relative">
      {/* Background blur */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${currentSong.cover})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(120px) brightness(0.25) saturate(1.5)",
        }}
      />

      {/* Back and actions */}
      <div className="w-full max-w-lg flex items-center justify-between mb-8">
        <Link href="/">
          <ChevronDown className="w-7 h-7 text-zinc-300 hover:text-white cursor-pointer" />
        </Link>
        <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Now Playing</span>
        <button onClick={() => setShowLyrics(!showLyrics)}>
          <Mic2 className={`w-5 h-5 cursor-pointer transition-colors ${showLyrics ? "text-green-500" : "text-zinc-400 hover:text-white"}`} />
        </button>
      </div>

      {!showLyrics ? (
        <>
          {/* Cover art */}
          <div className="w-full max-w-sm mb-10">
            <img
              src={currentSong.cover}
              alt={currentSong.title}
              className="w-full aspect-square object-cover rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
            />
          </div>

          {/* Song info */}
          <div className="w-full max-w-lg flex items-center justify-between mb-6">
            <div className="flex flex-col min-w-0 flex-1">
              <h2 className="text-2xl font-black text-white truncate">{currentSong.title}</h2>
              <p className="text-zinc-400 text-sm truncate">{currentSong.artist}</p>
            </div>
            <Heart className="w-6 h-6 text-zinc-400 hover:text-green-500 cursor-pointer flex-shrink-0 ml-4 transition-colors" />
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-lg mb-4">
            <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500 tabular-nums">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-10 mb-12">
            <Shuffle 
              onClick={toggleShuffle}
              className={`w-5 h-5 cursor-pointer transition-all ${isShuffle ? 'text-green-400 stroke-[3]' : 'text-zinc-500 hover:text-white'}`} 
            />
            <button onClick={prev} className="p-2 group">
              <svg className="w-8 h-8 text-zinc-300 group-hover:text-white group-active:scale-90 transition-all" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-white/5 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isPlaying ? (
                <svg className="w-10 h-10 text-black relative z-10" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg className="w-10 h-10 text-black ml-1 relative z-10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              )}
            </motion.button>
            <button onClick={next} className="p-2 group">
              <svg className="w-8 h-8 text-zinc-300 group-hover:text-white group-active:scale-90 transition-all" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
            </button>
            <div className="relative group" onClick={toggleRepeat}>
               <Repeat 
                 className={`w-5 h-5 cursor-pointer transition-all ${repeatMode !== 'none' ? 'text-green-400 stroke-[3]' : 'text-zinc-500 hover:text-white'}`} 
               />
               {repeatMode === 'one' && (
                 <span className="absolute -top-1 -right-1 flex items-center justify-center w-3 h-3 bg-green-500 rounded-full text-[6px] font-black text-black">1</span>
               )}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="flex items-center gap-8">
            <Share2 className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer transition-colors" />
            <Link href="/queue">
              <ListMusic className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer transition-colors" />
            </Link>
          </div>
        </>
      ) : (
        /* Lyrics view */
        <div className="w-full max-w-lg overflow-y-auto max-h-[60vh] mb-8">
          <div className="flex items-center gap-4 mb-6">
            <img src={currentSong.cover} alt="" className="w-12 h-12 rounded-lg" />
            <div>
              <p className="text-white font-bold text-sm">{currentSong.title}</p>
              <p className="text-zinc-400 text-xs">{currentSong.artist}</p>
            </div>
          </div>
          {loadingLyrics ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-6 bg-zinc-800 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
              ))}
            </div>
          ) : lyrics ? (
            <div
              className="text-2xl font-bold text-zinc-300 leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: lyrics }}
            />
          ) : (
            <div className="text-center py-12">
              <Mic2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500">Lyrics not available for this song</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
