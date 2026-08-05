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
  Settings,
  Building2,
  Check,
  Stethoscope
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../lib/api/client";

import { auth, googleProvider, sendSignInLinkToEmail, actionCodeSettings } from "../../../lib/firebase";
import { signInWithPopup, User as FirebaseUser } from "firebase/auth";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, checkSession, isAuthenticated } = useStore();

  const [loginMode, setLoginMode] = useState<"hospital" | "individual">("hospital");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clinicalKey, setClinicalKey] = useState("");
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const logoPath = "https://ravi123sv.github.io/pdd-project/assets/icon/app_icon.svg";

  useEffect(() => {
    checkSession();
    if (isAuthenticated) {
        router.push("/dashboard");
    }
  }, [isAuthenticated, router, checkSession]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (!result.user) throw new Error("Verification failed.");

      setGoogleUser(result.user);

      if (loginMode === 'individual') {
          // STRICT REAL-TIME MODE: No fallback code displayed
          await sendSignInLinkToEmail(auth, result.user.email!, actionCodeSettings);
          window.localStorage.setItem('emailForSignIn', result.user.email!);
          setStep(2);
      } else {
          setStep(2);
      }
    } catch (err: any) {
      setError("Handshake Error: Check Google ID authorization.");
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalLogin = async () => {
    if (!clinicalKey || !clinicalKey.startsWith('NS-')) {
       setError("INVALID PROTOCOL: Code mismatch.");
       return;
    }

    setLoading(true);
    setError(null);

    try {
      // STRICT REAL-TIME MODE: Requires real backend validation
      const response = await api.auth.loginWithKey(clinicalKey, googleUser?.email!);
      const { user, token } = response.data;

      setShowSuccess(true);
      setTimeout(() => {
          localStorage.setItem("user_session", JSON.stringify({ user, token }));
          setAuth(true, user);
          router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError("ACCESS DENIED: Credentials not verified by Clinical Hub.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden">
      {/* Branding Panel */}
      <div className={cn(
        "hidden lg:flex lg:w-1/2 flex-col justify-between p-16 transition-colors duration-1000 relative overflow-hidden text-white",
        loginMode === 'hospital' ? 'bg-[#2563EB]' : 'bg-[#059669]'
      )}>
        <div className="relative z-10">
          <div className="flex items-center space-x-5">
             <div className="h-16 w-16 bg-white rounded-[2rem] p-4 shadow-2xl flex items-center justify-center">
                <img src={logoPath} className="h-full w-full object-contain" alt="Logo" />
             </div>
             <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">NeuroSignal</h1>
                <p className="text-[10px] font-black opacity-60 mt-2 uppercase">Clinical Workstation Node</p>
             </div>
          </div>
        </div>

        <div className="relative z-10">
           <AnimatePresence mode="wait">
             <motion.div key={loginMode} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-7xl font-black mb-10 leading-[0.95] tracking-tight">
                    {loginMode === 'hospital' ? "Institutional Gateway." : "Specialist Access."}
                </h2>
                <p className="text-xl text-white/70 font-medium max-w-lg leading-relaxed">
                    Access high-fidelity signal telemetry via secure real-time authentication protocols.
                </p>
             </motion.div>
           </AnimatePresence>
        </div>

        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px]" />
      </div>

      {/* Gateway Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-[#F8FAFC] dark:bg-[#0F172A] relative">
        <div className="w-full max-w-[440px] space-y-12">
          <div className="space-y-4">
            <h3 className="text-5xl font-black text-[#0F172A] dark:text-white tracking-tight">Login</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Clinical Handshake Protocol</p>
          </div>

          <div className="space-y-8">
             <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] relative">
                <div
                  className={cn(
                    "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-[2rem] transition-all duration-500 ease-spring shadow-lg",
                    loginMode === 'hospital' ? "left-1.5 bg-[#2563EB]" : "left-[calc(50%+4.5px)] bg-[#059669]"
                  )}
                />
                <button onClick={() => {setLoginMode('hospital'); setStep(1); setError(null);}} className={cn("flex-1 py-4 rounded-[2rem] text-[10px] font-black transition-colors relative z-10 flex items-center justify-center gap-2", loginMode === 'hospital' ? "text-white" : "text-slate-500")}>
                    <Building2 className="h-4 w-4" /> INSTITUTION
                </button>
                <button onClick={() => {setLoginMode('individual'); setStep(1); setError(null);}} className={cn("flex-1 py-4 rounded-[2rem] text-[10px] font-black transition-colors relative z-10 flex items-center justify-center gap-2", loginMode === 'individual' ? "text-white" : "text-slate-500")}>
                    <Stethoscope className="h-4 w-4" /> PRACTITIONER
                </button>
             </div>

             <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                     <button onClick={handleGoogleLogin} disabled={loading} className="w-full h-20 bg-white dark:bg-slate-800 border-2 border-border/50 rounded-3xl flex items-center justify-center gap-4 hover:border-primary/50 transition-all font-bold group disabled:opacity-50">
                        {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : (
                           <>
                             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-6 w-6 group-hover:scale-110 transition-transform" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Verify Identity via Google</span>
                           </>
                        )}
                     </button>
                     <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-400 bg-[#F8FAFC] dark:bg-[#0F172A] px-4 tracking-widest text-center">Real-Time Validation Required</div>
                     </div>
                  </motion.div>
                ) : (
                  <motion.div key="step2" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                     <div className={cn(
                        "p-5 border rounded-[2rem] flex items-center gap-4",
                        loginMode === 'hospital' ? "bg-blue-50 border-blue-200" : "bg-emerald-50 border-emerald-200"
                     )}>
                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg", loginMode === 'hospital' ? 'bg-[#2563EB]' : 'bg-[#059669]')}>
                           <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                           <p className={cn("text-[9px] font-black uppercase tracking-widest", loginMode === 'hospital' ? 'text-blue-600' : 'text-emerald-600')}>Identity Linked</p>
                           <p className="text-xs font-bold text-slate-700 truncate">{googleUser?.email}</p>
                        </div>
                        <button onClick={() => setStep(1)} className="ml-auto text-[10px] font-black text-slate-400 hover:text-primary">Change</button>
                     </div>

                     {loginMode === 'hospital' ? (
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Master Clinical Key (NS-XXXXXX)</label>
                              <div className="relative group">
                                 <Key className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                 <input type="text" value={clinicalKey} onChange={(e) => {setClinicalKey(e.target.value.toUpperCase()); setError(null);}} placeholder="NS-XXXXXX" className="w-full h-20 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-[2rem] pl-16 pr-8 text-lg font-mono font-black focus:border-primary outline-none transition-all" />
                              </div>
                           </div>
                           <button onClick={handleHospitalLogin} disabled={loading} className="w-full h-20 bg-primary text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all">
                              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Access Clinical Node <ArrowRight className="h-5 w-5" /></>}
                           </button>
                        </div>
                     ) : (
                        <div className="space-y-10 text-center">
                           <div className="space-y-6">
                              <div className="h-16 w-16 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                                 <Mail className="h-8 w-8" />
                              </div>
                              <div className="space-y-2">
                                 <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">Verification Link Dispatched</p>
                                 <p className="text-sm font-medium text-slate-500 px-6 leading-relaxed">A secure real-time link was sent to <strong>{googleUser?.email}</strong>. Please verify to establish your session.</p>
                              </div>
                           </div>
                           <button onClick={() => window.open('https://mail.google.com', '_blank')} className="w-full h-16 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                               Open Mail Client <Globe className="h-4 w-4" />
                           </button>
                        </div>
                     )}
                  </motion.div>
                )}
             </AnimatePresence>

             {error && <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-2xl flex items-start gap-3 text-red-600 text-[10px] font-black uppercase leading-relaxed animate-in fade-in slide-in-from-top-2"><AlertTriangle className="h-4 w-4 shrink-0" /> {error}</div>}
          </div>
        </div>
      </div>

      <AnimatePresence>
          {showSuccess && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-primary flex flex-col items-center justify-center text-white">
                  <div className="h-24 w-24 bg-white/20 rounded-[3rem] flex items-center justify-center mb-8 shadow-2xl animate-pulse">
                      <ShieldCheck className="h-12 w-12" />
                  </div>
                  <h2 className="text-4xl font-black tracking-tight uppercase">Handshake Successful</h2>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-2">Opening Clinical Workstation...</p>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
