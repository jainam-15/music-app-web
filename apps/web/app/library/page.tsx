"use client";

import { useState, useEffect } from "react";
import { Heart, Play, Clock, Music, Plus, ListMusic, Disc, Search } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useLikedStore } from "@/store/useLikedStore";
import { usePlaylistStore } from "@/store/usePlaylistStore";
import { searchAlbums } from "@/lib/api";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { key: "playlists", label: "Playlists", icon: ListMusic },
  { key: "albums", label: "Albums", icon: Disc },
  { key: "artists", label: "Artists", icon: Music },
];

export default function LibraryPage() {
  const { setCurrentSong, setQueue, currentSong, isPlaying } = usePlayerStore();
  const { likedSongs } = useLikedStore();
  const { playlists, createPlaylist } = usePlaylistStore();
  const [activeTab, setActiveTab] = useState<string>("playlists");
  const [popularAlbums, setPopularAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreatePlaylist = async () => {
    const name = prompt("Enter playlist name:");
    if (name) await createPlaylist(name);
  };

  useEffect(() => {
    if (activeTab === "albums" && popularAlbums.length === 0) {
      setLoading(true);
      searchAlbums("trending music", 18).then(data => {
        setPopularAlbums(data);
        setLoading(false);
      });
    }
  }, [activeTab]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 pb-32"
    >
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Your Library</h1>
          <p className="text-zinc-500 text-sm font-bold mt-1">Manage your music collection</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreatePlaylist}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 flex items-center justify-center transition-all group shadow-xl"
        >
          <Plus className="w-6 h-6 text-zinc-400 group-hover:text-white group-hover:rotate-90 transition-all" />
        </motion.button>
      </header>

      {/* Premium Tabs */}
      <div className="flex gap-2 mb-10 p-1 bg-white/5 rounded-2xl w-fit backdrop-blur-xl border border-white/5">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
                active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="library-tab"
                  className="absolute inset-0 bg-white/10 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/5"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className={`w-4 h-4 relative z-10 ${active ? 'text-green-500' : ''}`} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Playlists tab */}
        {activeTab === "playlists" && (
          <motion.div 
            key="playlists"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Liked Songs card */}
            <Link href="/liked" className="group p-6 rounded-3xl bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-white/5 hover:border-white/10 transition-all relative overflow-hidden flex flex-col justify-between aspect-[16/9]">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-1000" />
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Heart className="w-7 h-7 text-white fill-white shadow-xl" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                   <div>
                     <h3 className="text-2xl font-black text-white tracking-tight">Liked Songs</h3>
                     <p className="text-zinc-400 text-sm font-bold">{likedSongs.length} songs saved</p>
                   </div>
                   <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault();
                        if (likedSongs.length > 0) {
                          setQueue(likedSongs);
                          setCurrentSong(likedSongs[0]);
                        }
                      }}
                      className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="w-7 h-7 text-black fill-black ml-1" />
                    </motion.button>
                </div>
            </Link>

            {/* Real Playlists */}
            {playlists.map((playlist: any) => (
              <Link key={playlist.id} href={`/playlist2/${playlist.id}`} className="group p-6 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all relative overflow-hidden flex flex-col justify-between aspect-[16/9]">
                <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500 text-zinc-500 group-hover:text-green-500">
                  <ListMusic className="w-7 h-7" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                   <div>
                     <h3 className="text-2xl font-black text-white tracking-tight">{playlist.name}</h3>
                     <p className="text-zinc-400 text-sm font-bold">{playlist.songs.length} songs</p>
                   </div>
                   <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault();
                        if (playlist.songs.length > 0) {
                          setQueue(playlist.songs);
                          setCurrentSong(playlist.songs[0]);
                        }
                      }}
                      className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="w-7 h-7 text-white fill-white ml-1" />
                    </motion.button>
                </div>
              </Link>
            ))}

            {/* Create card */}
            <div 
              onClick={handleCreatePlaylist}
              className="group p-8 rounded-3xl bg-zinc-900/20 border border-dashed border-zinc-800 hover:border-zinc-700 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer text-center aspect-[16/9]"
            >
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center group-hover:bg-zinc-800 transition-colors">
                <Plus className="w-6 h-6 text-zinc-500 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-white font-black text-sm">Create New Playlist</h3>
                <p className="text-zinc-500 text-xs font-medium mt-1">Start your own collection</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Albums tab */}
        {activeTab === "albums" && (
           <motion.div 
             key="albums"
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 10 }}
           >
             {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                   {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="h-64 bg-zinc-900/40 rounded-2xl animate-pulse border border-white/5" />
                   ))}
                </div>
             ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {popularAlbums.map((album: any, idx: number) => (
                    <motion.div 
                      key={album.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * idx }}
                    >
                      <Link href={`/album/${album.id}`}>
                        <div className="group relative bg-zinc-900/40 p-4 rounded-2xl hover:bg-zinc-800/60 transition-all duration-300 border border-white/5 hover:border-white/10 shadow-xl cursor-pointer">
                          <div className="relative aspect-square mb-4 overflow-hidden rounded-xl shadow-2xl">
                            <img
                              src={album.cover}
                              alt={album.name}
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                <Play className="w-10 h-10 text-white fill-white" />
                            </div>
                          </div>
                          <h3 className="text-white font-black text-sm truncate tracking-tight">{album.name}</h3>
                          <p className="text-zinc-500 text-xs font-bold truncate group-hover:text-zinc-300 transition-colors uppercase tracking-widest mt-1">Album • {album.year}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
             )}
           </motion.div>
        )}

        {/* Artists tab */}
        {activeTab === "artists" && (
          <motion.div 
            key="artists"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center space-y-6"
          >
            <div className="w-32 h-32 rounded-full bg-zinc-900 flex items-center justify-center border-4 border-white/5 shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 pointer-events-none rounded-full" />
              <Music className="w-12 h-12 text-zinc-700" />
            </div>
            <div className="max-w-xs space-y-2">
              <h3 className="text-white font-black text-xl tracking-tight">Follow your first artist</h3>
              <p className="text-zinc-500 text-sm font-medium">Follow artists to stay updated on their new releases and tours.</p>
            </div>
            <Link href="/search">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-black font-black text-sm px-8 py-3 rounded-2xl shadow-xl shadow-white/5 flex items-center gap-2 group"
              >
                <Search className="w-4 h-4" /> Find Artists
              </motion.button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
