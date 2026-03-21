"use client";

import { useState, useEffect } from "react";
import { Search as SearchIcon, X, Play, ArrowLeft } from "lucide-react";
import { searchSongs, searchAlbums, searchArtists, MappedSong, getRecommendedSongs } from "@/lib/api";
import { usePlayerStore } from "@/store/usePlayerStore";
import { SongOptions } from "@/components/SongOptions";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const CATEGORIES = [
  { name: "Bollywood", query: "bollywood hits", color: "#e91e63" },
  { name: "Punjabi", query: "punjabi hits", color: "#673ab7" },
  { name: "Pop", query: "pop hits", color: "#2196f3" },
  { name: "Romantic", query: "romantic songs", color: "#f44336" },
  { name: "Hip-Hop", query: "hip hop songs", color: "#00bcd4" },
  { name: "Devotional", query: "devotional songs", color: "#ff9800" },
  { name: "Ghazals", query: "ghazal songs", color: "#9c27b0" },
  { name: "Lo-Fi", query: "lofi songs", color: "#3f51b5" },
  { name: "Indie", query: "indie india", color: "#4caf50" },
  { name: "90s Hits", query: "90s bollywood", color: "#ffc107" },
  { name: "Sufi", query: "sufi songs", color: "#795548" },
  { name: "EDM", query: "edm party", color: "#009688" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MappedSong[]>([]);
  const [albumResults, setAlbumResults] = useState<any[]>([]);
  const [artistResults, setArtistResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryResults, setCategoryResults] = useState<MappedSong[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { setCurrentSong, setQueue, currentSong, isPlaying } = usePlayerStore();

  useEffect(() => {
    if (!query.trim()) { 
      setResults([]); 
      setAlbumResults([]);
      setArtistResults([]);
      return; 
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const [songs, albums, artists] = await Promise.all([
        searchSongs(query, 20),
        searchAlbums(query, 5),
        searchArtists(query, 5)
      ]);
      setResults(songs);
      setAlbumResults(albums);
      setArtistResults(artists);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleCategoryClick = async (cat: typeof CATEGORIES[0]) => {
    setActiveCategory(cat.name);
    setLoading(true);
    const songs = await searchSongs(cat.query, 30);
    setCategoryResults(songs);
    setLoading(false);
  };

  const playSong = async (song: MappedSong, list: MappedSong[]) => {
    setCurrentSong(song);
    // Add musically similar tracks to the queue instead of just search results
    const recommendations = await getRecommendedSongs(song.id, 20);
    if (recommendations.length > 0) {
      setQueue([song, ...recommendations]);
    } else {
      setQueue(list);
    }
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const showResults = query.trim() ? results : activeCategory ? categoryResults : [];
  const topResult = results[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 pb-32"
    >
      <div className="max-w-3xl mb-12 relative flex items-center group">
        <SearchIcon className="absolute left-6 w-6 h-6 text-zinc-500 group-focus-within:text-white transition-colors" />
        <input
          type="text"
          placeholder="What do you want to listen to?"
          className="w-full bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl py-5 px-16 text-lg text-white focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:bg-zinc-800/80 transition-all placeholder:text-zinc-500 font-bold"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveCategory(null); }}
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-6 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white bg-white/5 rounded-full"
              onClick={() => { setQuery(""); setResults([]); }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
             {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-16 w-full bg-zinc-900/40 rounded-xl animate-pulse border border-white/5" />
             ))}
          </motion.div>
        ) : showResults.length > 0 ? (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Top Results Section */}
            {query.trim() && (topResult || artistResults.length > 0 || albumResults.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Top Result Card */}
                {topResult && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-white px-1">Top Result</h3>
                    <div 
                      onClick={() => playSong(topResult, results)}
                      className="group p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 hover:bg-zinc-800/60 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute inset-x-0 -bottom-10 h-32 bg-green-500 opacity-0 group-hover:opacity-10 blur-[100px] transition-all duration-1000" />
                      <div className="w-24 h-24 mb-6 rounded-3xl shadow-2xl relative z-10 overflow-hidden">
                        <img src={topResult.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className="relative z-10">
                        <h2 className="text-3xl font-black text-white truncate mb-2">{topResult.title}</h2>
                        <span className="px-3 py-1 rounded-full bg-black/40 text-[10px] font-black text-white uppercase tracking-widest border border-white/5">Song • {topResult.artist}</span>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        className="absolute right-8 bottom-8 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/20 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500"
                      >
                         <Play className="w-7 h-7 text-black fill-black ml-1" />
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Artists and Albums brief */}
                <div className="space-y-10">
                   {artistResults.length > 0 && (
                     <div className="space-y-4">
                        <h3 className="text-xl font-black text-white px-1">Artists</h3>
                        <div className="flex flex-wrap gap-4">
                           {artistResults.slice(0, 3).map((artist: any) => (
                             <Link key={artist.id} href={`/artist/${artist.id}`} className="flex items-center gap-3 p-2 pr-4 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/5">
                               <img src={artist.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                               <span className="text-sm font-bold text-white pr-2 truncate max-w-[120px]">{artist.name}</span>
                             </Link>
                           ))}
                        </div>
                     </div>
                   )}
                   {albumResults.length > 0 && (
                     <div className="space-y-4">
                        <h3 className="text-xl font-black text-white px-1">Albums</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {albumResults.slice(0, 4).map((album: any) => (
                             <Link key={album.id} href={`/album/${album.id}`} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 group">
                                <img src={album.cover} alt="" className="w-12 h-12 rounded-lg shadow-lg" />
                                <div className="min-w-0">
                                   <p className="text-sm font-bold text-white truncate">{album.name}</p>
                                   <p className="text-xs text-zinc-500 font-bold truncate">{album.artist}</p>
                                </div>
                             </Link>
                           ))}
                        </div>
                     </div>
                   )}
                </div>
              </div>
            )}

            {/* Main Result List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em] px-1">
                   {query.trim() ? "Songs" : activeCategory}
                 </h2>
                 {activeCategory && !query.trim() && (
                   <button 
                     onClick={() => { setActiveCategory(null); setCategoryResults([]); }}
                     className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-2 transition-colors"
                   >
                     <ArrowLeft className="w-3 h-3" /> Back to Categories
                   </button>
                 )}
              </div>
              <div className="flex flex-col space-y-1">
                {showResults.map((song, idx) => {
                  const isActive = currentSong?.id === song.id;
                  return (
                    <motion.div
                      key={song.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.01 * idx }}
                      onClick={() => playSong(song, showResults)}
                      className={`group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5 ${isActive ? 'bg-white/5' : ''}`}
                    >
                      <div className="w-12 relative aspect-square overflow-hidden rounded-lg shadow-lg">
                        <img src={song.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className={`w-4 h-4 text-white fill-white ${isActive ? 'animate-pulse' : ''}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-black truncate ${isActive ? 'text-green-500' : 'text-white'}`}>{song.title}</p>
                        <p className="text-zinc-500 text-[10px] uppercase font-black truncate group-hover:text-zinc-300 transition-colors tracking-widest mt-1 opacity-60">{song.artist}</p>
                      </div>
                      <div className="hidden md:block w-48 text-zinc-500 text-xs font-bold truncate group-hover:text-zinc-400 capitalize">{song.album}</div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <SongOptions song={song} />
                      </div>
                      <span className="text-zinc-500 text-xs font-bold tabular-nums w-12 text-right">{formatDuration(song.duration)}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : !query.trim() && (
          <motion.div 
            key="categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-2xl font-black mb-8 text-white tracking-tight">Browse All</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {CATEGORIES.map((category, idx) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * idx }}
                  onClick={() => handleCategoryClick(category)}
                  className="aspect-square p-5 rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group border border-white/5"
                  style={{ backgroundColor: category.color }}
                >
                  <span className="text-lg font-black text-white tracking-tight leading-tight group-hover:scale-105 transition-transform block">{category.name}</span>
                  <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/20 rotate-[25deg] rounded-3xl group-hover:rotate-[35deg] transition-transform duration-500" />
                  {/* Subtle Glow Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
