"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Play, Clock, Heart, Shuffle, MoreHorizontal, Share2 } from "lucide-react";
import { getAlbumById, MappedAlbum } from "@/lib/api";
import { usePlayerStore } from "@/store/usePlayerStore";
import { SongOptions } from "@/components/SongOptions";
import { useLikedStore } from "@/store/useLikedStore";
import { motion, AnimatePresence } from "framer-motion";

export default function AlbumPage() {
  const params = useParams();
  const id = params.id as string;
  const [album, setAlbum] = useState<MappedAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentSong, setQueue, currentSong, isPlaying, togglePlay } = usePlayerStore();
  const { toggleLike, isLiked } = useLikedStore();

  useEffect(() => {
    if (id) {
      setLoading(true);
      getAlbumById(id).then((data) => {
        setAlbum(data);
        setLoading(false);
      });
    }
  }, [id]);

  const playAll = () => {
    if (album && album.songs.length > 0) {
      if (isCurrentAlbum) {
        togglePlay();
      } else {
        setQueue(album.songs);
        setCurrentSong(album.songs[0]);
      }
    }
  };

  const playSong = (song: any) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else if (album) {
      setQueue(album.songs);
      setCurrentSong(song);
    }
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-end">
          <div className="w-56 h-56 bg-zinc-800/50 rounded-2xl animate-pulse shadow-2xl" />
          <div className="flex flex-col gap-4 pb-4">
            <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
            <div className="h-12 w-64 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-40 bg-zinc-800 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 bg-zinc-900/40 rounded-xl animate-pulse border border-zinc-800/30" />
          ))}
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-400 space-y-4">
        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
           <Heart className="w-8 h-8 opacity-20" />
        </div>
        <p className="text-lg font-bold">Album not found</p>
        <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform">
          Go Back Home
        </button>
      </div>
    );
  }

  const isCurrentAlbum = currentSong && album.songs.some(s => s.id === currentSong.id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="pb-32 relative min-h-full"
    >
      {/* Background Gradient Layer */}
      <div 
        className="absolute inset-0 pointer-events-none -z-10 h-[600px] overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-gradient-to-b from-zinc-800/40 to-black h-full"
          style={{ 
            backgroundColor: 'currentColor',
            color: 'rgb(24 24 27 / 0.4)' 
          }}
        />
        <div 
          className="absolute inset-x-0 top-0 h-full opacity-60 blur-[100px] saturate-150 scale-125 transition-all duration-1000"
          style={{
            backgroundImage: `url(${album.cover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>

      {/* Album Header */}
      <div className="flex flex-col md:flex-row items-end gap-10 p-8 pt-20 relative z-20">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="relative group cursor-pointer"
          onClick={playAll}
        >
          <img
            src={album.cover}
            alt={album.name}
            className="w-56 h-56 md:w-64 md:h-64 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
          <div className="absolute inset-0 rounded-xl bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Play className="w-16 h-16 text-white fill-white shadow-2xl" />
          </div>
        </motion.div>

        <div className="flex flex-col gap-3 pb-2 flex-1 min-w-0">
          <div className="flex items-center gap-2">
             <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/5">
                Album
             </span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white leading-none tracking-tighter truncate py-2">
            {album.name}
          </h1>
          <div className="flex items-center flex-wrap gap-2 text-sm text-zinc-300 font-bold mt-2">
            <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
               <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden ring-1 ring-white/10">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(album.artist)}&background=27272a&color=fff`} alt={album.artist} />
               </div>
               <span>{album.artist}</span>
            </div>
            <span className="opacity-50 text-xs">•</span>
            <span className="text-zinc-400">{album.year}</span>
            <span className="opacity-50 text-xs">•</span>
            <span className="text-zinc-100">{album.songCount} tracks</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="relative z-20 px-8 py-8 flex items-center gap-8 bg-gradient-to-b from-black/40 to-black/0 backdrop-blur-sm -mt-2 border-t border-white/5">
        <button
          onClick={playAll}
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-green-500/20 group"
        >
          {isCurrentAlbum && isPlaying ? (
            <div className="flex items-center gap-1">
               <div className="w-1.5 h-6 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <div className="w-1.5 h-8 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <div className="w-1.5 h-6 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <Play className="w-8 h-8 text-black fill-black ml-1 group-hover:scale-110 transition-transform" />
          )}
        </button>
        <div className="flex items-center gap-4">
          <button className="p-2 text-zinc-400 hover:text-white transition-colors hover:scale-110 active:scale-90">
            <Heart className="w-8 h-8" />
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
      <div className="px-8 relative z-20">
        <div className="flex items-center gap-4 px-6 pb-4 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-800/30">
          <span className="w-8 text-center">#</span>
          <span className="flex-1">Title</span>
          <span className="w-32 hidden md:block">Album</span>
          <span className="w-20 text-right"><Clock className="w-4 h-4 ml-auto" /></span>
        </div>

        <div className="mt-4 space-y-1">
          {album.songs.map((song, idx) => {
            const isActive = currentSong?.id === song.id;
            return (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * idx, duration: 0.3 }}
                onClick={() => playSong(song)}
                className={`group flex items-center gap-4 px-6 py-4 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5 ${isActive ? 'bg-white/10 shadow-xl' : ''}`}
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
                  <div className="relative">
                    <img src={song.cover} alt="" className="w-10 h-10 rounded shadow-lg object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate ${isActive ? 'text-green-500' : 'text-white group-hover:text-white'}`}>{song.title}</p>
                    <p className="text-zinc-500 text-xs truncate font-medium group-hover:text-zinc-300 transition-colors">{song.artist}</p>
                  </div>
                </div>

                <div className="w-32 hidden md:block text-zinc-500 text-xs font-bold truncate group-hover:text-zinc-400 capitalize">{song.album}</div>

                <div className="flex items-center gap-6 w-20 justify-end ml-auto">
                   <button 
                     onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                     className={`opacity-0 group-hover:opacity-100 transition-opacity ${isLiked(song.id) ? 'text-green-500 opacity-100' : 'text-zinc-400 hover:text-white'}`}
                   >
                     <Heart className={`w-4 h-4 ${isLiked(song.id) ? 'fill-current' : ''}`} />
                   </button>
                   <SongOptions song={song} />
                   <span className="text-zinc-500 text-xs font-bold tabular-nums w-10 text-right">{formatDuration(song.duration)}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
