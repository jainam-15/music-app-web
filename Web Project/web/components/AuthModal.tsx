"use client";

import { useState, useEffect } from "react";
import { X, Chrome, Sparkles, User, Calendar, ArrowRight, Mail, Lock, LogIn } from "lucide-react";
import { auth } from "@/lib/firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  updatePassword
} from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { UserAPI } from "@/lib/backend";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";
type RegStep = "google" | "password" | "details";

export const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const [mode, setMode] = useState<AuthMode>("login");
  const [regStep, setRegStep] = useState<RegStep>("google");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");

  // Sync with store user when it changes
  useEffect(() => {
    if (user?.displayName && !name) setName(user.displayName);
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
      router.push("/");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("User doesn't exist. Please register first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Invalid password. Please try again.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError(err.message.replace("Firebase: ", ""));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Check backend for existing profile
      try {
        const profile = await UserAPI.sync({ 
          uid: result.user.uid, 
          email: result.user.email,
          displayName: result.user.displayName 
        });
        
        if (profile && profile.dob) {
          onClose(); // Already has full profile
        } else {
          setRegStep("password");
        }
      } catch (e) {
        setRegStep("password");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 2) {
      setError("Password must be at least 2 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, password);
        setRegStep("details");
      } else {
        setError("No active session found.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ displayName: name, dob });
      onClose();
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Only show special steps IF we are in REGISTER mode
  const showSpecialStep = mode === "register" && regStep !== "google";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={!showSpecialStep ? onClose : undefined}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-zinc-900 border border-white/5 rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] p-10 overflow-hidden"
          >
            {!showSpecialStep && (
              <button 
                onClick={onClose} 
                className="absolute right-6 top-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all z-20"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <AnimatePresence mode="wait">
              {mode === "login" && (
                <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="text-center mb-10 relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/20 rotate-3">
                      <Sparkles className="w-10 h-10 text-black" />
                    </div>
                    <h2 className="text-4xl font-black text-white leading-tight tracking-tighter mb-3">
                      Welcome Back
                    </h2>
                    <p className="text-zinc-500 text-sm font-bold px-6">
                      Sign in to your account
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-wider p-4 rounded-2xl mb-8 text-center italic">
                       {error}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-green-500 transition-colors" />
                       <input 
                         type="email" 
                         required
                         placeholder="Email address" 
                         className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white/10 transition-all font-bold"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                       />
                    </div>
                    <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-green-500 transition-colors" />
                       <input 
                         type="password" 
                         required
                         placeholder="Password" 
                         className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white/10 transition-all font-bold"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                       />
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className="w-full bg-green-500 text-black font-black py-4 rounded-2xl shadow-xl shadow-green-500/10 hover:bg-green-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                       {loading ? <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" /> : <LogIn className="w-5 h-5" />}
                       Login
                    </motion.button>
                  </form>

                  <div className="mt-8 text-center text-xs font-bold">
                    <span className="text-zinc-500">Don't have an account?</span>
                    <button onClick={() => setMode("register")} className="ml-2 text-green-500 hover:underline">Register</button>
                  </div>
                </motion.div>
              )}

              {mode === "register" && regStep === "google" && (
                <motion.div key="register-google" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-10 relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/20 rotate-3">
                      <Sparkles className="w-10 h-10 text-black" />
                    </div>
                    <h2 className="text-4xl font-black text-white leading-tight tracking-tighter mb-3">
                      Create Account
                    </h2>
                    <p className="text-zinc-500 text-sm font-bold px-6">
                      Quick start with Google
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-wider p-4 rounded-2xl mb-8 text-center italic">
                       {error}
                    </div>
                  )}

                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    onClick={handleGoogleRegister}
                    className="w-full flex items-center justify-center gap-4 bg-white text-black font-black py-5 rounded-[1.5rem] hover:bg-zinc-100 transition-all shadow-2xl shadow-white/5 group relative overflow-hidden"
                  >
                     {loading ? (
                       <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                     ) : (
                       <>
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                         <Chrome className="w-6 h-6" />
                         <span className="text-sm">Continue with Google</span>
                       </>
                     )}
                  </motion.button>

                  <div className="mt-8 text-center text-xs font-bold">
                    <span className="text-zinc-500">Already have an account?</span>
                    <button onClick={() => setMode("login")} className="ml-2 text-green-500 hover:underline">Login</button>
                  </div>
                </motion.div>
              )}

              {showSpecialStep && (
                <motion.div key="special-steps" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  {regStep === "password" ? (
                    <div key="step-password">
                       <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                           <Lock className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white leading-tight tracking-tighter">
                          Set Password
                        </h2>
                        <p className="text-zinc-500 text-xs font-bold mt-2 text-center px-4">
                          Secure your Spotify-clone experience.
                        </p>
                      </div>

                      {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-wider p-4 rounded-2xl mb-6 text-center italic">
                           {error}
                        </div>
                      )}

                      <form onSubmit={handleSetPassword} className="space-y-4">
                        <div className="relative group">
                           <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-green-500 transition-colors" />
                           <input 
                             type="password" 
                             required
                             placeholder="New password (min 2 chars)" 
                             className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white/10 transition-all font-bold"
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                           />
                        </div>

                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={loading}
                          className="w-full bg-green-500 text-black font-black py-4 rounded-2xl shadow-xl shadow-green-500/10 hover:bg-green-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                        >
                           {loading ? <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" /> : "Continue"}
                           <ArrowRight className="w-5 h-5" />
                        </motion.button>
                      </form>
                    </div>
                  ) : (
                    <div key="step-details">
                       <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                           <User className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white leading-tight tracking-tighter">
                          Basic Details
                        </h2>
                        <p className="text-zinc-500 text-xs font-bold mt-2">
                          Almost there! Let us know you.
                        </p>
                      </div>

                      <form onSubmit={handleOnboarding} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-zinc-500 uppercase ml-4 tracking-widest">Full Name</label>
                          <div className="relative group">
                             <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-green-500 transition-colors" />
                             <input 
                               type="text" 
                               required
                               placeholder="Your name" 
                               className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white/10 transition-all font-bold"
                               value={name}
                               onChange={(e) => setName(e.target.value)}
                             />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-zinc-500 uppercase ml-4 tracking-widest">Date of Birth</label>
                          <div className="relative group">
                             <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-green-500 transition-colors" />
                             <input 
                               type="date" 
                               required
                               className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white/10 transition-all font-bold [color-scheme:dark]"
                               value={dob}
                               onChange={(e) => setDob(e.target.value)}
                             />
                          </div>
                        </div>

                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={loading}
                          className="w-full bg-green-500 text-black font-black py-4 rounded-2xl shadow-xl shadow-green-500/10 hover:bg-green-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                        >
                           {loading ? <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" /> : "Finish"}
                           <ArrowRight className="w-5 h-5" />
                        </motion.button>
                      </form>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
