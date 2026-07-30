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
  CheckCircle2,
  ShieldCheck,
  Globe,
  Settings
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../lib/api/client";

import { auth, googleProvider } from "../../../lib/firebase";
import { signInWithPopup, User as FirebaseUser } from "firebase/auth";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useStore();

  const [loginMode, setLoginMode] = useState<"hospital" | "individual">("hospital");
  const [step, setStep] = useState(1); // 1: Initial, 2: Key Entry (for Hospital)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clinicalKey, setClinicalKey] = useState("");
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setGoogleUser(result.user);

      if (loginMode === 'individual') {
          // Individual goes straight through after OTP (mocked for now)
          setStep(2); // In individual mode, step 2 would be OTP
      } else {
          // Hospital mode requires key after Google
          setStep(2);
      }
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError("Google Authentication Failed: [AUTH/UNAUTHORIZED-DOMAIN]. Please add this domain in Firebase Console.");
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalLogin = async () => {
    if (!clinicalKey || !clinicalKey.startsWith('NS-')) {
       setError("System Alert: Invalid Access Key Mapping.");
       return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.auth.loginWithKey(clinicalKey);
      const { user, token } = response.data;

      const userData = {
        uid: user._id,
        email: googleUser?.email || user.email,
        name: user.name,
        role: user.role,
        userType: 'hospital' as const,
        hospitalId: user.hospitalId,
        hospitalName: user.hospitalName,
      };

      localStorage.setItem("user_session", JSON.stringify({ user: userData, token }));
      setAuth(true, userData);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Clinical Key not recognized. Ensure your hospital admin has authorized your Google ID.");
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualVerify = () => {
      setLoading(true);
      setTimeout(() => {
          const userData = {
            uid: googleUser?.uid || 'ind-mock',
            email: googleUser?.email || 'user@example.com',
            name: googleUser?.displayName || 'Practitioner',
            role: 'doctor',
            userType: 'individual' as const,
          };
          localStorage.setItem("user_session", JSON.stringify({ user: userData, token: "mock-token" }));
          setAuth(true, userData);
          router.push("/dashboard");
      }, 1500);
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
           <h2 className="text-7xl font-black mb-10 leading-[0.95] tracking-tight text-white">Clinical <br />Intelligence <br />at Scale.</h2>
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
                <button onClick={() => {setLoginMode('hospital'); setStep(1); setGoogleUser(null);}} className={cn("flex-1 py-4 rounded-[1.5rem] text-[11px] font-black transition-all", loginMode === 'hospital' ? "bg-white dark:bg-slate-800 text-primary shadow-xl" : "text-slate-500")}>HOSPITAL KEY</button>
                <button onClick={() => {setLoginMode('individual'); setStep(1); setGoogleUser(null);}} className={cn("flex-1 py-4 rounded-[1.5rem] text-[11px] font-black transition-all", loginMode === 'individual' ? "bg-white dark:bg-slate-800 text-primary shadow-xl" : "text-slate-500")}>PROFESSIONAL ID</button>
             </div>

             <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                     <button onClick={handleGoogleLogin} className="w-full h-20 bg-white dark:bg-slate-800 border-2 border-border/50 rounded-3xl flex items-center justify-center gap-4 hover:bg-slate-50 transition-all font-bold group">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Sign in with Google</span>
                     </button>
                     <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-400 bg-[#F8FAFC] dark:bg-[#0F172A] px-4 tracking-widest">Secure Verification Required</div>
                     </div>
                     {error && <p className="text-red-500 text-[10px] font-black uppercase ml-2 flex items-center gap-2 leading-relaxed bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-200 dark:border-red-800"><AlertTriangle className="h-4 w-4 shrink-0" /> {error}</p>}

                     <div className="pt-4 text-center">
                        <Link href="/subscriptions" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center justify-center gap-2">
                           <Globe className="h-3 w-3" /> View Institutional Licenses & Subscriptions
                        </Link>
                     </div>
                  </motion.div>
                ) : (
                  <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                     <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-[2rem] flex items-center gap-4">
                        <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                           <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Google Verified</p>
                           <p className="text-xs font-bold text-slate-700 dark:text-white truncate max-w-[200px]">{googleUser?.email}</p>
                        </div>
                        <button onClick={() => setStep(1)} className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary">Change</button>
                     </div>

                     {loginMode === 'hospital' ? (
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Authorized Clinical Key</label>
                              <div className="relative">
                                 <Key className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                 <input
                                   type="text"
                                   value={clinicalKey}
                                   onChange={(e) => {setClinicalKey(e.target.value.toUpperCase()); setError(null);}}
                                   placeholder="NS-XXXXXX"
                                   className="w-full h-20 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-[2rem] pl-16 pr-8 text-lg font-mono font-black"
                                 />
                              </div>
                           </div>
                           <button onClick={handleHospitalLogin} disabled={loading} className="w-full h-20 bg-primary text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-95 transition-all">
                              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Finalize Link <ArrowRight className="h-5 w-5" /></>}
                           </button>
                        </div>
                     ) : (
                        <div className="space-y-6">
                           <div className="space-y-4">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Identity confirmation sent to your mail</p>
                              <div className="flex gap-4 justify-center">
                                 {[1,2,3,4].map(i => <div key={i} className="h-16 w-16 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-2xl flex items-center justify-center font-black text-xl">-</div>)}
                              </div>
                           </div>
                           <button onClick={handleIndividualVerify} disabled={loading} className="w-full h-20 bg-primary text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-95 transition-all">
                              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Enter Workstation <ArrowRight className="h-5 w-5" /></>}
                           </button>
                        </div>
                     )}
                     {error && <p className="text-red-500 text-[10px] font-black uppercase ml-2 flex items-center gap-2"><AlertTriangle className="h-3 w-3" /> {error}</p>}
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
