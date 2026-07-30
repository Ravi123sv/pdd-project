"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../../../lib/store/useStore";
import {
  Key,
  Mail,
  Lock,
  Loader2,
  Hospital,
  User,
  ArrowRight,
  AlertTriangle,
  Plus,
  Globe
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../lib/api/client";

import { auth, googleProvider } from "../../../lib/firebase.ts";
import { signInWithPopup } from "firebase/auth";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useStore();

  const [loginMode, setLoginMode] = useState<"key" | "email">("key");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clinicalKey, setClinicalKey] = useState("");

  // Only redirect if explicitly authenticated during this session
  // Removed the useEffect that auto-redirects on mount if isAuthenticated is true
  // to ensure user can see the login options if they navigate here.

  const handleGoogleLogin = async () => {
    console.log("Initializing Google Login...");
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google Auth Success:", result.user.email);
      const user = result.user;

      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        role: 'doctor', // Default role for social login
        userType: 'individual' as const,
      };

      localStorage.setItem("user_session", JSON.stringify({ user: userData, token: await user.getIdToken() }));
      setAuth(true, userData);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError("Google Authentication Failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (type: 'hospital' | 'individual') => {
    if (type === 'hospital' && (!clinicalKey || !clinicalKey.startsWith('NS-'))) {
       setError("System Alert: Invalid Access Key Mapping.");
       return;
    }

    setLoading(true);
    setError(null);

    try {
      if (type === 'hospital') {
        const response = await api.auth.loginWithKey(clinicalKey);
        const { user, token } = response.data;

        const userData = {
          uid: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          userType: 'hospital' as const,
          hospitalId: user.hospitalId,
          hospitalName: user.hospitalName,
        };

        localStorage.setItem("user_session", JSON.stringify({ user: userData, token }));
        setAuth(true, userData);
        router.push("/dashboard");
      } else {
        // Fallback for manual email/pass if needed, but primarily using Google now
        setError("Please use Google Sign-in for Professional ID.");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || "Clinical Backend Connection Timeout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0F172A]">
      {/* Left side UI matching app */}
      <div className="hidden lg:flex lg:w-3/5 flex-col justify-between p-16 bg-[#2563EB] relative overflow-hidden text-white">
        <div className="relative z-10">
          <div className="flex items-center space-x-5">
             <div className="h-14 w-14 bg-white rounded-3xl p-3 shadow-2xl flex items-center justify-center">
                <img src="/assets/icon/app_icon.svg" className="h-full w-full" alt="NeuroSignal" />
             </div>
             <div>
                <h1 className="text-3xl font-black tracking-tighter">NEUROSIGNAL</h1>
                <p className="text-[11px] font-bold opacity-60 tracking-[0.4em] mt-1">ENTERPRISE v2.5</p>
             </div>
          </div>
        </div>

        <div className="relative z-10">
           <h2 className="text-7xl font-black mb-10 leading-[0.95] tracking-tight">Clinical <br />Intelligence <br />at Scale.</h2>
           <p className="text-xl text-white/70 font-medium leading-relaxed max-w-lg">
             Access your unified workstation with multi-tenant security. Monitor, analyze, and diagnose with AI-driven precision.
           </p>
        </div>

        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px]" />
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-12 relative bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="w-full max-w-[440px] space-y-12">
          <div className="space-y-4">
            <h3 className="text-5xl font-black text-[#0F172A] dark:text-white tracking-tight">Login</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Clinical Access Gateway</p>
          </div>

          <div className="space-y-8">
             <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-[2rem]">
                <button onClick={() => setLoginMode('key')} className={cn("flex-1 py-4 rounded-[1.5rem] text-[11px] font-black", loginMode === 'key' ? "bg-white dark:bg-slate-800 text-primary shadow-xl" : "text-slate-500")}>HOSPITAL KEY</button>
                <button onClick={() => setLoginMode('email')} className={cn("flex-1 py-4 rounded-[1.5rem] text-[11px] font-black", loginMode === 'email' ? "bg-white dark:bg-slate-800 text-primary shadow-xl" : "text-slate-500")}>PROFESSIONAL ID</button>
             </div>

             <button onClick={handleGoogleLogin} className="w-full h-16 bg-white dark:bg-slate-800 border-2 border-border/50 rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-50 transition-all font-bold">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-6 w-6" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Sign in with Google</span>
             </button>

             <AnimatePresence mode="wait">
                {loginMode === 'key' ? (
                  <motion.form key="key" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={(e) => { e.preventDefault(); handleLogin('hospital'); }} className="space-y-8">
                     <div className="space-y-2">
                        <div className="relative">
                           <Key className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                           <input type="text" value={clinicalKey} onChange={(e) => setClinicalKey(e.target.value.toUpperCase())} placeholder="NS-XXXXXX" className="w-full h-20 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-3xl pl-16 pr-8 text-lg font-mono font-black" required />
                        </div>
                        {error && <p className="text-red-500 text-[10px] font-black uppercase ml-2 flex items-center gap-2"><AlertTriangle className="h-3 w-3" /> {error}</p>}
                     </div>
                     <button type="submit" disabled={loading} className="w-full h-20 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4">
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Initialize Link <ArrowRight className="h-5 w-5" /></>}
                     </button>
                  </motion.form>
                ) : (
                  <div className="space-y-4">
                    <input type="email" placeholder="practitioner@hospital.org" className="w-full h-16 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-2xl px-6 text-sm font-bold" />
                    <input type="password" placeholder="••••••••••••" className="w-full h-16 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-2xl px-6 text-sm font-bold" />
                    <button onClick={() => handleLogin('individual')} className="w-full h-16 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest">Verify Identity</button>
                  </div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
