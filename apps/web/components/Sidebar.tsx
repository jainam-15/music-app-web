"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Search, Library, Heart, ListMusic, User, Settings, LogIn, Plus, Disc, TrendingUp, Radio } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLikedStore } from "@/store/useLikedStore";
import { useAuthStore } from "@/store/useAuthStore";
import { usePlaylistStore } from "@/store/usePlaylistStore";
import { motion } from "framer-motion";

const Sidebar = () => {
  const pathname = usePathname();
  const { likedSongs } = useLikedStore();
  const { user, loginAsGuest, loading } = useAuthStore();
  const { playlists, createPlaylist } = usePlaylistStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName);
    setNewPlaylistName("");
    setIsCreating(false);
  };

  const navItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Search", icon: Search, href: "/search" },
    { name: "Library", icon: Library, href: "/library" },
  ];

  const exploreItems = [
    { name: "Trending", icon: TrendingUp, href: "/trending" },
    { name: "New Releases", icon: Disc, href: "/new" },
    { name: "Radio", icon: Radio, href: "/radio" },
  ];

  return (
    <div className="w-64 bg-black flex-shrink-0 flex flex-col h-full border-r border-white/5">
      {/* Premium Logo */}
      <div className="p-8 pb-6">
        <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:rotate-6 transition-transform">
            <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
          <span className="text-xl font-black tracking-tighter text-white">MusicApp</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-hide py-2">
        {/* Main Nav */}
        <section>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${
                    active ? "text-white" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-white/5 rounded-xl border border-white/5 shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 relative z-10 ${active ? "text-green-500" : "group-hover:text-white"}`} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Explore */}
        <section>
          <h3 className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3">Explore</h3>
          <div className="flex flex-col gap-1">
             {exploreItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all"
                >
                  <item.icon className="w-4 h-4 group-hover:text-white" />
                  {item.name}
                </Link>
             ))}
          </div>
        </section>

        {/* Your Collection */}
        <section>
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Your Collection</h3>
            <button 
              onClick={() => setIsCreating(true)}
              className="p-1 rounded-md hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <Link
              href="/liked"
              className={`group flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                pathname === "/liked" ? "text-white bg-white/5" : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <Heart className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span>Liked Songs</span>
              {likedSongs.length > 0 && (
                <span className="ml-auto text-[10px] py-0.5 px-2 bg-zinc-800 rounded-full text-zinc-400">
                  {likedSongs.length}
                </span>
              )}
            </Link>

            {playlists.map((p) => (
              <Link
                key={p.id}
                href={`/playlist2/${p.id}`}
                className="group flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all truncate"
              >
                <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                  <ListMusic className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{p.name}</span>
              </Link>
            ))}

            {isCreating && (
              <form onSubmit={handleCreate} className="px-4 py-2">
                <input
                  autoFocus
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onBlur={() => !newPlaylistName && setIsCreating(false)}
                  className="w-full bg-zinc-900 border border-white/10 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-green-500/50"
                  placeholder="New Playlist"
                />
              </form>
            )}
          </div>
        </section>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-white/5">
        {!user ? (
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-4">
            <div className="space-y-1">
              <p className="text-white font-black text-xs">Unlock your world.</p>
              <p className="text-zinc-500 text-[10px] leading-tight">Sync your music across all devices.</p>
            </div>
            <button
              onClick={() => loginAsGuest()}
              disabled={loading}
              className="w-full bg-white text-black font-black py-2.5 rounded-xl text-[11px] hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </div>
        ) : (
          <Link href="/profile" className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors group">
            <div className="relative">
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-xl border border-white/10 group-hover:scale-105 transition-transform" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white text-xs font-black truncate">{user.displayName}</span>
              <span className="text-zinc-500 text-[10px] font-bold">Premium Plan</span>
            </div>
            <div className="ml-auto p-2 text-zinc-500 hover:text-white transition-colors">
               <Settings className="w-4 h-4" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
