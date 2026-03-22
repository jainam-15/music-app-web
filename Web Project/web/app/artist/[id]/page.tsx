"use client";

import { useState, useEffect, use } from "react";
import { useParams } from "next/navigation";
import { Play, Shuffle, Heart, MoreHorizontal, UserCheck, CheckCircle, Share2, ArrowLeft } from "lucide-react";
import { getArtistById, MappedArtist } from "@/lib/api";
import { usePlayerStore } from "@/store/usePlayerStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { SongOptions } from "@/components/SongOptions";

export default function ArtistPage() {
  const params = useParams();
  const id = params.id as string;
  const [artist, setArtist] = useState<MappedArtist | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const { setCurrentSong, setQueue, currentSong, isPlaying } = usePlayerStore();

  useEffect(() => {
    if (id) {
      getArtistById(id).then((data) => {
        setArtist(data);
        setLoading(false);
      });
    }
  }, [id]);

  const playAll = () => {
    if (artist && artist.topSongs.length > 0) {
      setQueue(artist.topSongs);
      setCurrentSong(artist.topSongs[0]);
    }
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const formatFollowers = (count: string) => {
    const num = parseInt(count);
    if (!num) return count;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return count;
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse pt-20">
        <div className="flex items-end gap-10">
          <div className="w-56 h-56 md:w-64 md:h-64 rounded-full bg-zinc-800" />
          <div className="flex-1 space-y-4 pb-4">
            <div className="h-4 w-32 bg-zinc-800 rounded-full" />
            <div className="h-16 w-3/4 bg-zinc-800 rounded-2xl" />
            <div className="h-4 w-48 bg-zinc-800 rounded-full" />
          </div>
        </div>
        <div className="flex gap-4">
           <div className="w-16 h-16 rounded-full bg-zinc-800" />
           <div className="w-32 h-12 rounded-full bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 text-zinc-700">
             <UserCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Artist not found</h2>
          <Link href="/">
             <button className="px-8 py-3 bg-white text-black rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-transform">
               Back to Home
             </button>
          </Link>
       </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32 relative min-h-screen"
    >
      {/* Artist Hero with Blurred Background */}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: artist.image ? `url(${artist.image})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center 20%",
            transform: "scale(1.1)",
          }}
        >
           <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black backdrop-blur-[2px]" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col md:flex-row items-center md:items-end gap-10 z-10 text-center md:text-left translate-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-56 h-56 md:w-64 md:h-64 rounded-full shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] overflow-hidden border-4 border-white/5 relative group"
          >
            <img
              src={artist.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&size=500&background=1DB954&color=fff`}
              alt={artist.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </motion.div>
          
          <div className="flex flex-col gap-4 pb-4">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-md tracking-widest flex items-center gap-1.5 shadow-xl shadow-blue-500/20 uppercase">
                <CheckCircle className="w-3 h-3" /> Verified Artist
              </span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black text-white leading-none tracking-tighter truncate max-w-[800px] py-1">
              {artist.name}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
               <span className="text-zinc-200 font-black tracking-tight text-lg">{formatFollowers(artist.followerCount)}</span>
               <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Monthly Listeners</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="relative z-20 px-8 py-10 flex flex-wrap items-center justify-center md:justify-start gap-8 bg-gradient-to-b from-black/60 to-black/0 backdrop-blur-md -mt-1 border-t border-white/5">
        <button
          onClick={playAll}
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-green-500/20 group"
        >
          <Play className="w-8 h-8 text-black fill-black ml-1 group-hover:scale-110 transition-transform" />
        </button>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFollowing(!following)}
            className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
              following
                ? "bg-green-500 border-green-500 text-black shadow-lg shadow-green-500/10"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            }`}
          >
            {following ? "Following" : "Follow"}
          </button>
          
          <button className="p-3.5 text-zinc-400 hover:text-white transition-all bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10">
            <Share2 className="w-5 h-5" />
          </button>
          
          <button className="p-3.5 text-zinc-400 hover:text-white transition-all bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content Layout */}
      <div className="relative z-10 px-8 py-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        
        {/* Top Tracks (Left Column) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Popular Tracks</h2>
            <button className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-green-500 transition-colors">See all</button>
          </div>
          
          <div className="space-y-1">
            {artist.topSongs.slice(0, 10).map((song, idx) => {
              const isActive = currentSong?.id === song.id;
              return (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * idx }}
                  onClick={() => {
                    setQueue(artist.topSongs);
                    setCurrentSong(song);
                  }}
                  className={`group flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5 ${isActive ? 'bg-white/10' : ''}`}
                >
                  <div className="w-8 flex items-center justify-center">
                    {isActive && isPlaying ? (
                       <div className="flex items-end gap-0.5 h-3">
                          <div className="w-0.5 h-full bg-green-500 animate-[bounce_1s_infinite]" />
                          <div className="w-0.5 h-[60%] bg-green-500 animate-[bounce_1.2s_infinite]" />
                          <div className="w-0.5 h-[80%] bg-green-500 animate-[bounce_0.8s_infinite]" />
                       </div>
                    ) : (
                      <span className={`text-sm font-black ${isActive ? 'text-green-500' : 'text-zinc-500 group-hover:hidden'}`}>{idx + 1}</span>
                    )}
                    {!isActive && <Play className="w-4 h-4 text-white hidden group-hover:block fill-white" />}
                  </div>

                  <div className="flex-1 flex items-center gap-4 min-w-0">
                    <div className="relative aspect-square w-12">
                      <img src={song.cover} alt="" className="w-full h-full rounded shadow-lg object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-black truncate tracking-tight ${isActive ? 'text-green-500' : 'text-white'}`}>{song.title}</p>
                      <p className="text-zinc-500 text-[10px] font-bold truncate group-hover:text-zinc-400 transition-colors uppercase tracking-[0.1em] mt-0.5">{song.album}</p>
                    </div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <SongOptions song={song} />
                  </div>
                  
                  <span className="text-zinc-500 text-xs font-black tabular-nums w-12 text-right">{formatDuration(song.duration)}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Albums/About (Right Column) */}
        <div className="lg:w-[400px] shrink-0 space-y-16">
          {/* Top Albums */}
          {artist.topAlbums.length > 0 && (
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight mb-8 px-2">Discography</h2>
              <div className="grid grid-cols-2 gap-4">
                {artist.topAlbums.slice(0, 4).map((alb, idx) => (
                  <Link key={alb.id} href={`/album/${alb.id}`}>
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="group bg-white/5 border border-white/5 p-4 rounded-3xl hover:bg-white/10 transition-all cursor-pointer shadow-xl"
                    >
                      <div className="relative aspect-square mb-4 shadow-2xl overflow-hidden rounded-2xl">
                        <img
                          src={alb.cover}
                          alt={alb.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <h3 className="text-white font-black truncate text-xs tracking-tight">{alb.name}</h3>
                      <p className="text-zinc-500 font-bold text-[10px] mt-1">{alb.year}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Artist Bio/About */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 overflow-hidden relative shadow-2xl group cursor-pointer hover:bg-zinc-900/60 transition-all">
             <div className="absolute inset-0 -z-10 group-hover:scale-110 transition-transform duration-1000">
                <img src={artist.image} alt="" className="w-full h-full object-cover opacity-10 blur-xl" />
             </div>
             <h2 className="text-xl font-black text-white tracking-tight mb-4">About the Artist</h2>
             <div className="space-y-4">
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                  Official profile for {artist.name}. Follow for latest updates and top releases.
                </p>
                <div className="flex flex-col gap-3 pt-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/10">
                         <UserCheck className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-black tracking-tight">{formatFollowers(artist.followerCount)} Followers</p>
                        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Global Ranking #24</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
