"use client";

import { useState, useEffect } from "react";
import MusicCard from "@/components/MusicCard";
import { MappedSong, searchSongs } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { UserAPI } from "@/lib/backend";
import { AuthModal } from "@/components/AuthModal";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Flame, History } from "lucide-react";

const SECTIONS = [
  { title: "Trending Now", query: "trending hindi songs", icon: Flame, color: "text-orange-500" },
  { title: "Arijit Singh Essentials", query: "arijit singh hits", icon: Sparkles, color: "text-blue-500" },
  { title: "Punjabi Beats", query: "punjabi hits", icon: Zap, color: "text-yellow-500" },
  { title: "Romantic Mood", query: "romantic hindi songs", icon: Sparkles, color: "text-pink-500" },
];

export default function Home() {
  const [greeting, setGreeting] = useState("Good evening");
  const [recentPlays, setRecentPlays] = useState<MappedSong[]>([]);
  const [sections, setSections] = useState<{ title: string; songs: MappedSong[]; icon: any; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, setIsAuthOpen } = useAuthStore();

  useEffect(() => {
    if (user) {
      UserAPI.getRecentPlays(user.uid).then(setRecentPlays);
    }
  }, [user]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const results = await Promise.all(
          SECTIONS.map(async (s) => ({
            title: s.title,
            icon: s.icon,
            color: s.color,
            songs: await searchSongs(s.query, 12),
          }))
        );
        setSections(results.filter((s) => s.songs.length > 0));
      } catch (err) {
        console.error("Failed to load songs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const handleClearRecent = async () => {
    if (!user) return;
    try {
      await UserAPI.clearRecentPlays(user.uid);
      setRecentPlays([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 pb-32"
    >

      <header className="mb-14 flex items-end justify-between relative">
        <div className="space-y-2 relative z-10">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none capitalize"
          >
            {user ? `Welcome back, ${user.displayName.split(' ')[0]}` : greeting}
          </motion.h1>
          <div className="text-zinc-500 text-sm font-bold ml-1 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Ready for your favorite beats?
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => !user && setIsAuthOpen(true)}
          className="group relative w-16 h-16 rounded-3xl bg-white/5 border border-white/5 p-1 cursor-pointer transition-all shadow-2xl overflow-hidden"
        >
          <img
            src={user?.photoURL || "https://ui-avatars.com/api/?name=Guest&background=27272a&color=fff"}
            alt="User"
            className="w-full h-full object-cover rounded-2xl group-hover:opacity-80 transition-opacity"
          />
        </motion.div>

        {/* Subtle background glow for header */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-green-500/5 blur-[120px] pointer-events-none rounded-full" />
      </header>

      {loading ? (
        <div className="flex flex-col gap-10">
          <div className="h-40 w-full bg-zinc-900/40 rounded-3xl animate-pulse border border-white/5" />
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="h-8 w-64 bg-zinc-900/50 rounded-xl animate-pulse mb-8 border border-white/5" />
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="bg-zinc-900/40 p-5 rounded-2xl border border-white/5">
                    <div className="aspect-square bg-zinc-800/50 rounded-xl animate-pulse mb-4" />
                    <div className="h-4 w-3/4 bg-zinc-800/50 rounded animate-pulse mb-2" />
                    <div className="h-3 w-1/2 bg-zinc-800/50 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-16">
          {recentPlays.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-zinc-100 flex items-center gap-4 tracking-tight">
                  <div className="w-1.5 h-8 rounded-full bg-green-500 opacity-80" />
                  Recently Played
                  <History className="w-6 h-6 text-green-500 ml-1" />
                </h2>
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(153, 27, 27, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearRecent}
                  className="group flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-red-500 uppercase tracking-widest transition-all bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-red-500/20"
                >
                  Clear History
                </motion.button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-7">
                {recentPlays.slice(0, 6).map((song) => (
                  <MusicCard key={song.id} song={song} queue={recentPlays} />
                ))}
              </div>
            </motion.section>
          )}

          {sections.map((section, sIdx) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: sIdx * 0.1, duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-zinc-100 flex items-center gap-4 tracking-tight">
                  <div className={`w-1.5 h-8 rounded-full ${section.color.replace('text-', 'bg-')} opacity-80`} />
                  {section.title}
                  <section.icon className={`w-6 h-6 ${section.color} ml-1`} />
                </h2>
                <button className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-[0.2em] transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:bg-white/10 active:scale-95">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-7">
                {section.songs.slice(0, 12).map((song) => (
                  <MusicCard key={song.id} song={song} queue={section.songs} />
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      )}
    </motion.div>
  );
}
