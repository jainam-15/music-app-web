"use client";

import { useState } from "react";
import { Volume2, Headphones, Bell, Shield, Smartphone, Globe, ChevronRight, Moon, Sun, Lock, CreditCard, HelpCircle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function SettingsPage() {
  const [audioQuality, setAudioQuality] = useState("320kbps");
  const [crossfade, setCrossfade] = useState(false);
  const [normalize, setNormalize] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-14 h-7 rounded-full transition-all relative ${enabled ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "bg-zinc-800"}`}
    >
      <motion.div 
        animate={{ x: enabled ? 28 : 4 }}
        className="w-5 h-5 bg-white rounded-full absolute top-1 shadow-xl" 
      />
    </button>
  );

  const Section = ({ title, icon: Icon, children, delay }: { title: string; icon: any; children: React.ReactNode; delay: number }) => (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mb-12"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
           <Icon className="w-5 h-5 text-green-500" />
        </div>
        <h2 className="text-xl font-black text-white tracking-tight">{title}</h2>
      </div>
      <div className="space-y-1 bg-white/[0.02] border border-white/5 rounded-3xl p-2">
        {children}
      </div>
    </motion.section>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 pb-32 max-w-2xl mx-auto min-h-screen"
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
          <h1 className="text-4xl font-black text-white tracking-tighter">Settings</h1>
          <p className="text-zinc-500 text-sm font-bold mt-1">Personalize your music experience</p>
        </div>
      </header>

      {/* Playback Section */}
      <Section title="Playback" icon={Headphones} delay={0.1}>
        <div className="flex items-center justify-between p-5 rounded-2xl hover:bg-white/5 transition-all">
          <div>
            <p className="text-white text-sm font-black">Audio Quality</p>
            <p className="text-zinc-500 text-xs font-bold mt-0.5">Stream at your preferred bitrate</p>
          </div>
          <select
            value={audioQuality}
            onChange={(e) => setAudioQuality(e.target.value)}
            className="bg-zinc-900 border border-white/10 text-white text-xs font-black rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
          >
            <option value="48kbps">Low (48kbps)</option>
            <option value="96kbps">Normal (96kbps)</option>
            <option value="160kbps">High (160kbps)</option>
            <option value="320kbps">Ultra (320kbps)</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-5 rounded-2xl hover:bg-white/5 transition-all">
          <div>
            <p className="text-white text-sm font-black">Crossfade</p>
            <p className="text-zinc-500 text-xs font-bold mt-0.5">Smooth mix between tracks</p>
          </div>
          <Toggle enabled={crossfade} onChange={() => setCrossfade(!crossfade)} />
        </div>

        <div className="flex items-center justify-between p-5 rounded-2xl hover:bg-white/5 transition-all">
          <div>
            <p className="text-white text-sm font-black">Normalize Volume</p>
            <p className="text-zinc-500 text-xs font-bold mt-0.5">Keep a consistent listening level</p>
          </div>
          <Toggle enabled={normalize} onChange={() => setNormalize(!normalize)} />
        </div>
      </Section>

      {/* Security Section */}
      <Section title="Account & Security" icon={Shield} delay={0.2}>
        {[
          { label: "Email Address", value: "user@musicapp.ai", icon: Globe },
          { label: "Password", value: "Updated 2 months ago", icon: Lock },
          { label: "Premium Plan", value: "Active", icon: CreditCard },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between p-5 rounded-2xl hover:bg-white/5 cursor-pointer transition-all group">
            <div className="flex items-center gap-4">
               <item.icon className="w-4 h-4 text-zinc-500 group-hover:text-green-500 transition-colors" />
               <div>
                 <p className="text-white text-sm font-black">{item.label}</p>
                 <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-0.5 group-hover:text-zinc-500">{item.value}</p>
               </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-all group-hover:translate-x-1" />
          </div>
        ))}
      </Section>

      {/* Appearance Section */}
      <Section title="Appearance" icon={Sun} delay={0.3}>
         <div className="flex items-center justify-between p-5 rounded-2xl hover:bg-white/5 transition-all">
          <div className="flex items-center gap-4">
             <Moon className="w-4 h-4 text-zinc-500" />
             <div>
               <p className="text-white text-sm font-black">Dark Mode</p>
               <p className="text-zinc-500 text-xs font-bold mt-0.5">Optimized for night listening</p>
             </div>
          </div>
          <Toggle enabled={darkMode} onChange={() => setDarkMode(!darkMode)} />
        </div>
      </Section>

      {/* Support Section */}
      <Section title="Info & Support" icon={HelpCircle} delay={0.4}>
        <div className="p-5">
           <p className="text-white text-sm font-black">MusicApp v1.0.0</p>
           <p className="text-zinc-500 text-xs font-bold mt-1">Built with passion using Next.js & Framer Motion.</p>
           <button className="mt-6 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors">
              Log Out of Session
           </button>
        </div>
      </Section>
    </motion.div>
  );
}
