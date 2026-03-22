"use client";

import { use, useState, useEffect } from "react";
import { Play, Clock, Music, Trash2, Heart, Share2, MoreHorizontal, ArrowLeft, Ban } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { usePlaylistStore } from "@/store/usePlaylistStore";
import { SongOptions } from "@/components/SongOptions";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { setCurrentSong, setQueue, currentSong, isPlaying } = usePlayerStore();
  const { playlists, removeFromPlaylist, deletePlaylist } = usePlaylistStore();

  const playlist = playlists.find(p => p.id === id);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      await deletePlaylist(id);
      router.push("/library");
    }
  };

  const formatDuration = (s: number) => {
    if (!s) return "--:--";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const playPlaylist = () => {
    if (playlist && playlist.songs.length > 0) {
      setQueue(playlist.songs);
      setCurrentSong(playlist.songs[0]);
    }
  };

  if (!playlist) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
      <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
         <Ban className="w-8 h-8 text-zinc-700" />
      </div>
      <h2 className="text-2xl font-black text-white">Playlist not found</h2>
      <Link href="/library">
         <button className="px-8 py-3 bg-white text-black rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-transform">
           Go to Library
         </button>
      </Link>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32 relative min-h-screen"
    >
      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 pointer-events-none -z-10 h-[500px] bg-gradient-to-b from-blue-950/40 via-zinc-950/20 to-black" />
      
      {/* Header */}
      <div className="p-8 pt-20 flex flex-col md:flex-row items-end gap-10 relative z-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-56 h-56 md:w-64 md:h-64 bg-zinc-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] flex items-center justify-center relative group overflow-hidden border border-white/5"
        >
          {playlist.songs.length > 0 ? (
            <div className="grid grid-cols-2 w-full h-full p-1 gap-1">
              {playlist.songs.slice(0, 4).map((s, i) => (
                <img key={i} src={s.cover} className="w-full h-full object-cover rounded-lg" alt="" />
              ))}
              {playlist.songs.length < 4 && Array(4 - playlist.songs.length).fill(0).map((_, i) => (
                 <div key={i} className="w-full h-full bg-zinc-800/50 rounded-lg flex items-center justify-center">
                    <Music className="w-6 h-6 text-zinc-700" />
                 </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
               <Music className="w-20 h-20 text-zinc-800" />
               <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Empty Playlist</p>
            </div>
          )}
        </motion.div>
        
        <div className="flex flex-col gap-3 pb-2 flex-1">
          <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/5 w-fit">
            Playlist
          </span>
          <h1 className="text-5xl md:text-8xl font-black text-white leading-none tracking-tighter py-2 truncate">
            {playlist.name}
          </h1>
          <div className="flex items-center flex-wrap gap-2 text-sm text-zinc-300 font-bold mt-2">
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden ring-1 ring-white/10">
                  <img src="https://ui-avatars.com/api/?name=User&background=27272a&color=fff" alt="User" />
               </div>
               <span>Your Music</span>
            </div>
            <span className="opacity-50 text-xs">•</span>
            <span className="text-zinc-100">{playlist.songs.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="relative z-10 px-8 py-8 flex items-center gap-8 bg-gradient-to-b from-black/40 to-black/0 backdrop-blur-sm -mt-2 border-t border-white/5">
        <button
          onClick={playPlaylist}
          disabled={playlist.songs.length === 0}
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-green-500/20 group disabled:opacity-50 disabled:grayscale transition-all"
        >
          <Play className="w-8 h-8 text-black fill-black ml-1 group-hover:scale-110 transition-transform" />
        </button>
        <div className="flex items-center gap-4">
          <button className="p-2 text-zinc-400 hover:text-white transition-colors hover:scale-110 active:scale-90">
            <Share2 className="w-6 h-6" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 text-zinc-400 hover:text-red-500 transition-colors hover:scale-110 active:scale-90"
            title="Delete Playlist"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Tracklist section */}
      <div className="px-8 relative z-10">
        {playlist.songs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-zinc-800 rounded-3xl"
          >
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 mb-6">
               <Music className="w-8 h-8 text-zinc-700" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Your playlist is empty</h2>
            <p className="text-zinc-500 text-sm font-medium mb-8">Add songs by tapping the "..." menu on any track.</p>
            <Link href="/search">
               <button className="px-8 py-3 bg-white text-black rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-transform">
                 Browse Songs
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
              {playlist.songs.map((song, idx) => {
                const isActive = currentSong?.id === song.id;
                return (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * idx }}
                    onClick={() => {
                      setQueue(playlist.songs);
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
                      {!isActive && <Play className="w-4 h-4 text-white hidden group-hover:block fill-white" />}
                    </div>

                    <div className="flex-1 flex items-center gap-4 min-w-0">
                      <div className="relative aspect-square w-10">
                        <img src={song.cover} alt="" className="w-full h-full rounded shadow-lg object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${isActive ? 'text-green-500' : 'text-white'}`}>{song.title}</p>
                        <p className="text-zinc-500 text-xs truncate font-medium group-hover:text-zinc-300 transition-colors uppercase tracking-widest">{song.artist}</p>
                      </div>
                    </div>

                    <div className="w-48 hidden md:block text-zinc-500 text-xs font-bold truncate group-hover:text-zinc-400 capitalize">{song.album}</div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFromPlaylist(playlist.id, song.id); }}
                        className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <SongOptions song={song} />
                    </div>
                    
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
