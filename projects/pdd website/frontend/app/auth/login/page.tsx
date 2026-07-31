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
  FileText
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
  const [step, setStep] = useState(1); // 1: Initial, 2: OTP/Key Entry
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clinicalKey, setClinicalKey] = useState("");
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Fix Logo Path globally
  const logoPath = "https://ravi123sv.github.io/pdd-project/assets/icon/app_icon.svg";

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setGoogleUser(result.user);

      if (loginMode === 'individual') {
          try {
              // Call Backend to send OTP via Resend
              await api.otp.send(result.user.email!, result.user.displayName || 'Practitioner');
              setStep(2);
          } catch (otpErr: any) {
              console.error("OTP Send Error:", otpErr);
              setError("SYSTEM: UNABLE TO DELIVER OTP. Ensure Resend API Key is active.");
          }
      } else {
          // Hospital path - goes to Clinical Key entry
          setStep(2);
      }
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError("Google Authentication Failed. Ensure domain is authorized in Firebase.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleHospitalLogin = async () => {
    if (!clinicalKey || !clinicalKey.startsWith('NS-')) {
       setError("CRITICAL: INVALID CLINICAL KEY MAPPING.");
       return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.auth.loginWithKey(clinicalKey, googleUser?.email!);
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
      setError("ACCESS DENIED: KEY NOT RECOGNIZED BY CLINICAL HUB.");
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualVerify = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
        setError("REQUIRED: 6-DIGIT CLINICAL CODE.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.otp.verify(googleUser?.email!, fullOtp);

      const userData = {
        uid: googleUser?.uid || 'ind-7702',
        email: googleUser?.email!,
        name: googleUser?.displayName || 'Dr. Practitioner',
        role: 'doctor',
        userType: 'individual' as const,
      };
      localStorage.setItem("user_session", JSON.stringify({ user: userData, token: await googleUser?.getIdToken() }));
      setAuth(true, userData);
      router.push("/dashboard");
    } catch (err: any) {
      setError("VERIFICATION FAILED: CODE EXPIRED OR INVALID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden">
      {/* Left side UI - Clinical Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-[#2563EB] relative overflow-hidden text-white">
        <div className="relative z-10">
          <div className="flex items-center space-x-5">
             <div className="h-16 w-16 bg-white rounded-[2rem] p-4 shadow-2xl flex items-center justify-center">
                <img src={logoPath} className="h-full w-full object-contain" alt="Logo" />
             </div>
             <div>
                <h1 className="text-3xl font-black tracking-tighter">NEUROSIGNAL</h1>
                <p className="text-[11px] font-bold opacity-60 tracking-[0.4em] mt-1 uppercase">Enterprise v2.5</p>
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

      {/* Right side form - Access Gateway */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-[#F8FAFC] dark:bg-[#0F172A] relative">
        <div className="w-full max-w-[480px] space-y-12">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="text-5xl font-black text-[#0F172A] dark:text-white tracking-tight">Login</h3>
               <Link href="/" className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-primary transition-colors lg:hidden">
                  <img src={logoPath} className="h-5 w-5 opacity-40" alt="L" />
               </Link>
            </div>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Clinical Access Gateway</p>
          </div>

          <div className="space-y-8">
             {/* Toggle between Hospital and Individual */}
             <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-[2rem]">
                <button
                  onClick={() => {setLoginMode('hospital'); setStep(1); setGoogleUser(null); setError(null);}}
                  className={cn("flex-1 py-4 rounded-[1.5rem] text-[11px] font-black transition-all", loginMode === 'hospital' ? "bg-white dark:bg-slate-800 text-primary shadow-xl" : "text-slate-500")}
                >
                  HOSPITAL KEY
                </button>
                <button
                  onClick={() => {setLoginMode('individual'); setStep(1); setGoogleUser(null); setError(null);}}
                  className={cn("flex-1 py-4 rounded-[1.5rem] text-[11px] font-black transition-all", loginMode === 'individual' ? "bg-white dark:bg-slate-800 text-primary shadow-xl" : "text-slate-500")}
                >
                  PROFESSIONAL ID
                </button>
             </div>

             <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                     <button onClick={handleGoogleLogin} disabled={loading} className="w-full h-20 bg-white dark:bg-slate-800 border-2 border-border/50 rounded-3xl flex items-center justify-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold group disabled:opacity-50">
                        {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : (
                           <>
                             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-6 w-6 group-hover:scale-110 transition-transform" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Verify via Google ID</span>
                           </>
                        )}
                     </button>

                     <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-400 bg-[#F8FAFC] dark:bg-[#0F172A] px-4 tracking-widest">
                           Identity Validation Required
                        </div>
                     </div>

                     {error && (
                        <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-200 dark:border-red-900 flex items-start gap-4">
                           <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                           <p className="text-[10px] font-black text-red-600 uppercase leading-relaxed tracking-wider">{error}</p>
                        </div>
                     )}

                     <div className="pt-4 flex flex-col items-center gap-4">
                        <Link href="/subscriptions" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2">
                           <Globe className="h-3 w-3" /> Explore Clinical Licenses
                        </Link>
                        <Link href="/verify-hospital" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-foreground flex items-center gap-2">
                           <Hospital className="h-3 w-3" /> Institutional Onboarding Hub
                        </Link>
                     </div>
                  </motion.div>
                ) : (
                  <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                     {/* Google ID Badge */}
                     <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-[2rem] flex items-center gap-4">
                        <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                           <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">ID Verified</p>
                           <p className="text-xs font-bold text-slate-700 dark:text-white truncate">{googleUser?.email}</p>
                        </div>
                        <button onClick={() => setStep(1)} className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Reset</button>
                     </div>

                     {loginMode === 'hospital' ? (
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Clinical Key (NS-XXXXXX)</label>
                              <div className="relative">
                                 <Key className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                 <input
                                   type="text"
                                   value={clinicalKey}
                                   onChange={(e) => {setClinicalKey(e.target.value.toUpperCase()); setError(null);}}
                                   placeholder="NS-884920"
                                   className="w-full h-20 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-[2rem] pl-16 pr-8 text-lg font-mono font-black focus:border-primary outline-none transition-all"
                                 />
                              </div>
                           </div>
                           <button onClick={handleHospitalLogin} disabled={loading} className="w-full h-20 bg-primary text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-95 transition-all">
                              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Finalize Neural Link <ArrowRight className="h-5 w-5" /></>}
                           </button>
                        </div>
                     ) : (
                        <div className="space-y-8 text-center">
                           <div className="space-y-6">
                              <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                                 <Mail className="h-7 w-7" />
                              </div>
                              <div className="space-y-2">
                                 <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Clinical Verification Required</p>
                                 <p className="text-xs font-medium text-slate-400 px-8">We've dispatched a unique 6-digit access code to your verified practitioner mail.</p>
                              </div>
                              <div className="flex gap-3 justify-center">
                                 {otp.map((digit, i) => (
                                   <input
                                     key={i}
                                     id={`otp-${i}`}
                                     type="text"
                                     maxLength={1}
                                     value={digit}
                                     onChange={(e) => handleOtpChange(i, e.target.value)}
                                     className="h-16 w-12 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-2xl flex items-center justify-center font-black text-xl text-center focus:border-primary outline-none transition-colors"
                                   />
                                 ))}
                              </div>
                           </div>
                           <button onClick={handleIndividualVerify} disabled={loading} className="w-full h-20 bg-primary text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-95 transition-all">
                              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Enter Private Workstation <ArrowRight className="h-5 w-5" /></>}
                           </button>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resend code in 45s</p>
                        </div>
                     )}
                     {error && (
                        <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-200 dark:border-red-900 flex items-start gap-4 mt-4">
                           <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                           <p className="text-[10px] font-black text-red-600 uppercase leading-relaxed tracking-wider">{error}</p>
                        </div>
                     )}
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
