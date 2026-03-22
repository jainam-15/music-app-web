"use client";

import { Play, GripVertical, X, ListMusic, Music, Trash2, ArrowLeft } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function QueuePage() {
  const { currentSong, queue, currentIndex, setCurrentSong, isPlaying } = usePlayerStore();

  const formatDuration = (s: number) => {
    if (!s) return "--:--";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const nextUp = queue.slice(currentIndex + 1);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 pb-32 max-w-4xl mx-auto min-h-screen"
    >
      <header className="flex items-center gap-6 mb-12">
        <Link href="/">
           <motion.button 
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
           >
              <ArrowLeft className="w-6 h-6" />
           </motion.button>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Queue</h1>
          <p className="text-zinc-500 text-sm font-bold mt-1">Manage your upcoming music</p>
        </div>
      </header>

      {/* Now Playing Section */}
      {currentSong && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-14"
        >
          <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 ml-1">Current Track</h2>
          <div className="relative group p-6 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[100px] pointer-events-none rounded-full" />
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="relative w-20 h-20 shadow-2xl">
                 <img src={currentSong.cover} alt="" className="w-full h-full rounded-2xl object-cover ring-1 ring-white/10" />
                 {isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl backdrop-blur-[2px]">
                       <div className="flex items-end gap-1 h-6">
                         <div className="w-1 bg-green-500 animate-[bounce_1s_infinite]" />
                         <div className="w-1 h-[60%] bg-green-500 animate-[bounce_1.2s_infinite]" />
                         <div className="w-1 h-[80%] bg-green-500 animate-[bounce_0.8s_infinite]" />
                       </div>
                    </div>
                 )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-green-500 text-lg font-black truncate tracking-tight">{currentSong.title}</p>
                <p className="text-zinc-400 font-bold truncate uppercase tracking-widest text-[10px] mt-1">{currentSong.artist}</p>
              </div>
              <div className="text-right">
                 <p className="text-zinc-500 font-black text-xs tabular-nums">{formatDuration(currentSong.duration || 0)}</p>
                 <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-1">Playing Now</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Next Up Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 ml-1">Next Up</h2>
        
        <AnimatePresence mode="popLayout">
          {nextUp.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-24 flex flex-col items-center justify-center text-center gap-6 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2.5rem]"
            >
              <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                <ListMusic className="w-8 h-8 text-zinc-800" />
              </div>
              <div className="space-y-2">
                <p className="text-white font-black text-xl">Queue is empty</p>
                <p className="text-zinc-500 font-bold text-sm max-w-xs px-8">Add songs from the home page or search to fill your queue.</p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {nextUp.map((song, idx) => (
                <motion.div
                  key={`${song.id}-${idx}`}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, scale: 0.95 }}
                  transition={{ delay: 0.03 * idx }}
                  className="group flex items-center gap-5 p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer transition-all active:scale-[0.99]"
                  onClick={() => setCurrentSong(song)}
                >
                  <GripVertical className="w-4 h-4 text-zinc-800 group-hover:text-zinc-600 transition-colors" />
                  <div className="w-12 h-12 relative flex-shrink-0">
                    <img src={song.cover} alt="" className="w-full h-full rounded-xl object-cover ring-1 ring-white/10 shadow-lg group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-black truncate tracking-tight">{song.title}</p>
                    <p className="text-zinc-500 font-bold truncate uppercase tracking-[0.1em] text-[10px] group-hover:text-zinc-400 transition-colors mt-0.5">{song.artist}</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-zinc-500 text-xs font-black tabular-nums">{formatDuration(song.duration || 0)}</span>
                     <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Logic for removing from queue could be added here
                        }}
                     >
                        <Trash2 className="w-4 h-4" />
                     </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
