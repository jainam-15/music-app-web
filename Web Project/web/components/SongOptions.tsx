"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, Heart, Share2, ListMusic, ChevronRight, Ban, Check, SkipForward, ListPlus } from "lucide-react";
import { usePlaylistStore } from "@/store/usePlaylistStore";
import { useLikedStore } from "@/store/useLikedStore";
import { usePlayerStore, PlayerSong } from "@/store/usePlayerStore";
import { motion, AnimatePresence } from "framer-motion";

export const SongOptions = ({ song }: { song: PlayerSong }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);
  const { playlists, addToPlaylist } = usePlaylistStore();
  const { toggleLike, isLiked } = useLikedStore();
  const { addToQueue, playNext } = usePlayerStore();

  const handleAdd = async (id: string, name: string) => {
    await addToPlaylist(id, song);
    setAddedFeedback(name);
    setTimeout(() => {
      setAddedFeedback(null);
      setIsOpen(false);
    }, 1500);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(song);
    // Keep menu open for better UX? Or close? Let's close for now as it's a primary action.
    setIsOpen(false);
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all shadow-sm"
      >
        <MoreHorizontal className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => {
                setIsOpen(false);
                setIsSubOpen(false);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 bottom-full mb-3 w-64 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] z-50 overflow-hidden py-2"
            >
              {addedFeedback ? (
                <div className="px-4 py-8 flex flex-col items-center justify-center gap-3 text-center">
                   <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                      <Check className="w-6 h-6 text-black" />
                   </div>
                   <p className="text-sm font-black text-white">Added to {addedFeedback}</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleToggleLike}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all group"
                  >
                    <Heart className={`w-4 h-4 transition-transform group-hover:scale-110 ${isLiked(song.id) ? "text-green-500 fill-current" : ""}`} />
                    {isLiked(song.id) ? "Remove from Liked" : "Save to Liked"}
                  </button>

                  <div
                    onMouseEnter={() => setIsSubOpen(true)}
                    onMouseLeave={() => setIsSubOpen(false)}
                    className="relative"
                  >
                    <button className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-all ${isSubOpen ? 'text-white bg-white/5' : 'text-zinc-300 hover:text-white hover:bg-white/5'}`}>
                      <div className="flex items-center gap-3 group">
                        <ListMusic className="w-4 h-4 transition-transform group-hover:rotate-6" />
                        Add to Playlist
                      </div>
                      <ChevronRight className={`w-3.3 h-3.3 transition-transform ${isSubOpen ? 'rotate-90 sm:rotate-0 translate-x-1' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isSubOpen && (
                        <motion.div
                          initial={{ opacity: 0, x: 10, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 10, scale: 0.95 }}
                          className="absolute right-full top-0 mr-2 w-56 bg-zinc-900/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                        >
                          <div className="px-4 py-2 mb-1 border-b border-white/5">
                             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Your Playlists</span>
                          </div>
                          {playlists.length > 0 ? (
                            <div className="max-h-[250px] overflow-y-auto scrollbar-hide">
                               {playlists.map((p) => (
                                 <button
                                   key={p.id}
                                   onClick={() => handleAdd(p.id, p.name)}
                                   className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 truncate transition-all"
                                 >
                                   {p.name}
                                 </button>
                               ))}
                            </div>
                          ) : (
                            <div className="px-4 py-6 text-center space-y-2">
                               <Plus className="w-5 h-5 text-zinc-700 mx-auto" />
                               <p className="text-[10px] font-bold text-zinc-500">No playlists found</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="my-1 border-t border-white/5" />

                  <button 
                    onClick={() => { playNext(song); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all group"
                  >
                    <SkipForward className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    Play Next
                  </button>

                  <button 
                    onClick={() => { addToQueue(song); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all group"
                  >
                    <ListPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
                    Add to Queue
                  </button>

                  <div className="my-1 border-t border-white/5" />

                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all group">
                    <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                    Share
                  </button>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all group">
                    <Ban className="w-4 h-4 transition-transform group-hover:rotate-12" />
                    Not Interested
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
