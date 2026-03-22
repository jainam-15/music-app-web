"use client";

import { User, ListMusic, Heart, Clock, Settings, Share2, MoreHorizontal, ArrowLeft, Camera, Sparkles } from "lucide-react";
import { useLikedStore } from "@/store/useLikedStore";
import { usePlaylistStore } from "@/store/usePlaylistStore";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProfilePage() {
  const { likedSongs } = useLikedStore();
  const { playlists } = usePlaylistStore();
  const { user } = useAuthStore();

  const stats = [
    { label: "Liked Songs", value: likedSongs.length, icon: Heart, href: "/liked", color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Playlists", value: playlists.length, icon: ListMusic, href: "/library", color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Hours Listened", value: "124", icon: Clock, href: "#", color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32 min-h-screen relative"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none -z-10 h-[500px] bg-gradient-to-b from-zinc-800/30 via-zinc-950/20 to-black" />

      {/* Profile Header */}
      <div className="p-8 pt-20 flex flex-col md:flex-row items-center md:items-end gap-10 relative z-10 text-center md:text-left">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative group cursor-pointer"
        >
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-zinc-900 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex items-center justify-center relative overflow-hidden ring-4 ring-white/5 group-hover:ring-white/10 transition-all duration-500">
            <img
              src={`https://ui-avatars.com/api/?name=${user?.displayName || 'Music+User'}&size=400&background=22c55e&color=000&bold=true`}
              alt="User"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
               <Camera className="w-8 h-8 text-white" />
               <span className="text-[10px] font-black uppercase tracking-widest text-white">Change Picture</span>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-full border-4 border-black flex items-center justify-center shadow-xl">
             <Sparkles className="w-5 h-5 text-black" />
          </div>
        </motion.div>

        <div className="flex flex-col gap-3 pb-2 flex-1">
          <span className="px-3 py-1 rounded-md bg-white/10 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/5 w-fit mx-auto md:mx-0">
            Profile
          </span>
          <h1 className="text-5xl md:text-8xl font-black text-white leading-none tracking-tighter py-2">
            {user?.displayName || "Music User"}
          </h1>
          <div className="flex items-center justify-center md:justify-start flex-wrap gap-4 text-sm text-zinc-400 font-bold mt-2">
            <span className="text-zinc-200">{likedSongs.length} Liked Songs</span>
            <span className="opacity-30">•</span>
            <span className="text-zinc-200">{playlists.length} Public Playlists</span>
            <span className="opacity-30">•</span>
            <span className="text-zinc-200">12 Following</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-8 py-8 flex items-center justify-center md:justify-start gap-6 relative z-10 border-t border-white/5 mt-8 bg-black/20 backdrop-blur-sm">
        <button className="px-8 py-3.5 bg-white text-black rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5">
          Edit Profile
        </button>
        <div className="flex items-center gap-2">
          <button className="p-3 text-zinc-400 hover:text-white transition-all hover:bg-white/5 rounded-full">
            <Share2 className="w-6 h-6" />
          </button>
          <button className="p-3 text-zinc-400 hover:text-white transition-all hover:bg-white/5 rounded-full">
            <MoreHorizontal className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-12 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, idx) => (
            <Link key={stat.label} href={stat.href}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="relative group bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] hover:bg-zinc-900/60 transition-all cursor-pointer overflow-hidden shadow-2xl"
              >
                <div className={`absolute -right-4 -top-4 w-32 h-32 ${stat.bg.replace('/10', '/5')} blur-[40px] rounded-full pointer-events-none`} />
                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 border border-white/5`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-5xl font-black text-white tracking-tighter mb-2 group-hover:scale-110 transition-transform origin-left duration-500">{stat.value}</p>
                <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Recently Liked */}
        {likedSongs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Recently Liked</h2>
              <Link href="/liked" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-green-500 transition-colors">View All</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {likedSongs.slice(0, 6).map((song, idx) => (
                <motion.div 
                  key={song.id}
                  whileHover={{ y: -8 }}
                  className="group bg-zinc-900/20 hover:bg-zinc-900/60 p-4 rounded-3xl transition-all border border-transparent hover:border-white/5"
                >
                  <div className="relative aspect-square mb-4 shadow-2xl">
                    <img src={song.cover} alt={song.title} className="w-full h-full object-cover rounded-2xl ring-1 ring-white/10" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl backdrop-blur-sm">
                       <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/20 scale-75 group-hover:scale-100 transition-transform duration-300">
                          <Heart className="w-5 h-5 text-black fill-black" />
                       </div>
                    </div>
                  </div>
                  <p className="text-white text-sm font-black truncate tracking-tight">{song.title}</p>
                  <p className="text-zinc-500 text-[10px] font-bold truncate uppercase tracking-widest mt-1">{song.artist}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
