"use client";

import { useState } from "react";
import { X, Mail, Github, Chrome, LogIn, Sparkles, Check } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";

export const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { loginAsGuest, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleGuestLogin = async () => {
    await loginAsGuest();
    setSuccess(true);
    setTimeout(() => {
      onClose();
      setSuccess(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] p-8 md:p-10 overflow-hidden"
          >
            <button 
              onClick={onClose} 
              className="absolute right-6 top-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/20">
                     <Check className="w-10 h-10 text-black stroke-[3]" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white tracking-tight">Welcome Back!</h2>
                    <p className="text-zinc-400 font-bold">Successfully logged in as guest.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form" exit={{ opacity: 0, scale: 0.95 }}>
                  <div className="text-center mb-10 relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-10 -left-10 w-32 h-32 bg-green-500/10 blur-[50px] rounded-full pointer-events-none"
                    />
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/20 rotate-3">
                      <Sparkles className="w-8 h-8 text-black" />
                    </div>
                    <h2 className="text-3xl font-black text-white leading-tight tracking-tighter">Millions of songs.</h2>
                    <h2 className="text-3xl font-black text-white leading-tight tracking-tighter opacity-80">Free on MusicApp.</h2>
                  </div>

                  <div className="space-y-3">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      onClick={handleGuestLogin}
                      className="w-full flex items-center justify-center gap-4 bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-100 transition-all shadow-xl shadow-white/5 group"
                    >
                       {loading ? <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" /> : <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
                       Continue as Guest
                    </motion.button>

                    <div className="grid grid-cols-2 gap-3">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-3 bg-white/5 border border-white/5 text-white font-bold py-3.5 rounded-2xl hover:bg-white/10 transition-all"
                      >
                         <Chrome className="w-5 h-5 text-zinc-400" />
                         <span className="text-xs">Google</span>
                      </motion.button>

                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-3 bg-white/5 border border-white/5 text-white font-bold py-3.5 rounded-2xl hover:bg-white/10 transition-all"
                      >
                         <Github className="w-5 h-5 text-zinc-400" />
                         <span className="text-xs">GitHub</span>
                      </motion.button>
                    </div>
                  </div>

                  <div className="my-8 flex items-center gap-4 text-zinc-700">
                    <div className="h-px bg-white/5 flex-1" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] leading-none">OR</span>
                    <div className="h-px bg-white/5 flex-1" />
                  </div>

                  <div className="space-y-4">
                    <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-green-500 transition-colors" />
                       <input 
                         type="email" 
                         placeholder="Email address" 
                         className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white/10 transition-all placeholder:text-zinc-600 font-bold"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                       />
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-green-500 text-black font-black py-4 rounded-2xl shadow-xl shadow-green-500/10 hover:bg-green-400 transition-colors"
                    >
                       Get Started
                    </motion.button>
                  </div>

                  <p className="text-center text-zinc-500 text-[10px] font-bold mt-10 px-8 leading-relaxed uppercase tracking-wider opacity-60">
                    By continuing, you agree to MusicApp's Terms of Service and Privacy Policy.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
