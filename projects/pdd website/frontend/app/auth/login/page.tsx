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
  FileText,
  Stethoscope,
  Building2,
  Check
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
  const { setAuth, checkSession, isAuthenticated } = useStore();

  const [loginMode, setLoginMode] = useState<"hospital" | "individual">("hospital");
  const [step, setStep] = useState(1); // 1: Google Login, 2: Key/OTP Entry
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clinicalKey, setClinicalKey] = useState("");
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const logoPath = "https://ravi123sv.github.io/pdd-project/assets/icon/app_icon.svg";

  // 1. Initial Session Check
  useEffect(() => {
    checkSession();
    if (isAuthenticated) {
        console.log("[LOGIN] Already authenticated, redirecting...");
        router.push("/dashboard");
    }
  }, [isAuthenticated, router, checkSession]);

  const handleGoogleLogin = async () => {
    console.log("[LOGIN] Initializing Google Flow...");
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("[LOGIN] Google Identity Confirmed:", result.user.email);
      setGoogleUser(result.user);

      if (loginMode === 'individual') {
          console.log("[LOGIN] Requesting OTP for Practitioner...");
          try {
              await api.otp.send(result.user.email!, result.user.displayName || 'Practitioner');
              setStep(2);
          } catch (otpErr: any) {
              console.error("[LOGIN] OTP Error:", otpErr);
              setError("SYSTEM: UNABLE TO DELIVER OTP. Ensure Resend API Key is active.");
          }
      } else {
          // Hospital mode - proceed to key entry
          setStep(2);
      }
    } catch (err: any) {
      console.error("[LOGIN] Firebase Error:", err);
      setError("Google Authentication Failed. Ensure domain is authorized in Firebase Console.");
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
    console.log("[LOGIN] Validating Clinical Key...");
    if (!clinicalKey || !clinicalKey.startsWith('NS-')) {
       setError("CRITICAL: INVALID CLINICAL KEY FORMAT. Must start with 'NS-'.");
       return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.auth.loginWithKey(clinicalKey, googleUser?.email!);
      const { user, token } = response.data;

      console.log("[LOGIN] Institutional Link Established:", user.hospitalName);

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
      console.error("[LOGIN] Backend Error:", err.response?.data);
      setError(err.response?.data?.message || "ACCESS DENIED: KEY NOT RECOGNIZED BY CLINICAL HUB.");
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
      console.log("[LOGIN] Verifying OTP...");
      await api.otp.verify(googleUser?.email!, fullOtp);

      const userData = {
        uid: googleUser?.uid || 'ind-demo',
        email: googleUser?.email!,
        name: googleUser?.displayName || 'Practitioner',
        role: 'doctor',
        userType: 'individual' as const,
      };

      localStorage.setItem("user_session", JSON.stringify({ user: userData, token: await googleUser?.getIdToken() }));
      setAuth(true, userData);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("[LOGIN] OTP Verification Failed:", err);
      setError("VERIFICATION FAILED: CODE EXPIRED OR INVALID.");
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
      setStep(1);
      setGoogleUser(null);
      setError(null);
      setOtp(["", "", "", "", "", ""]);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden">
      {/* Left side UI - Clinical Branding */}
      <div className={cn(
        "hidden lg:flex lg:w-1/2 flex-col justify-between p-16 transition-colors duration-700 relative overflow-hidden text-white",
        loginMode === 'hospital' ? 'bg-[#2563EB]' : 'bg-[#059669]'
      )}>
        <div className="relative z-10">
          <div className="flex items-center space-x-5">
             <div className="h-16 w-16 bg-white rounded-[2rem] p-4 shadow-2xl flex items-center justify-center">
                <img src={logoPath} className="h-full w-full object-contain" alt="Logo" />
             </div>
             <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase">NeuroSignal</h1>
                <p className="text-[10px] font-black opacity-60 tracking-[0.4em] mt-1 uppercase">
                    {loginMode === 'hospital' ? 'Institutional Node v2.5' : 'Private Node v2.5'}
                </p>
             </div>
          </div>
        </div>

        <div className="relative z-10">
           <AnimatePresence mode="wait">
             {loginMode === 'hospital' ? (
                <motion.div key="h-text" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                   <h2 className="text-7xl font-black mb-10 leading-[0.95] tracking-tight">Enterprise <br />Clinical <br />Gateway.</h2>
                   <p className="text-xl text-white/70 font-medium leading-relaxed max-w-lg">
                     Centralized multi-unit workstation with shared diagnostic databases and institutional security protocols.
                   </p>
                </motion.div>
             ) : (
                <motion.div key="i-text" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                   <h2 className="text-7xl font-black mb-10 leading-[0.95] tracking-tight">Specialist <br />Session <br />Access.</h2>
                   <p className="text-xl text-white/70 font-medium leading-relaxed max-w-lg">
                     Direct practitioner link for secure individual telemetry, private cloud vault, and independent AI analysis.
                   </p>
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }}
        />
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px]" />
      </div>

      {/* Right side form - Access Gateway */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-16 bg-[#F8FAFC] dark:bg-[#0F172A] relative">
        <div className="w-full max-w-[440px] flex flex-col space-y-12">
          <div className="space-y-4 text-center lg:text-left">
            <div className="flex items-center justify-between">
               <h3 className="text-4xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight">Login</h3>
               <Link href="/" className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center lg:hidden overflow-hidden p-2">
                  <img src={logoPath} className="h-full w-full object-contain" alt="L" />
               </Link>
            </div>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Clinical Access Protocol</p>
          </div>

          <div className="space-y-8">
             {/* Toggle */}
             <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] relative">
                <div
                  className={cn(
                    "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-[2rem] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-lg",
                    loginMode === 'hospital' ? "left-1.5 bg-[#2563EB]" : "left-[calc(50%+4.5px)] bg-[#059669]"
                  )}
                />
                <button
                  onClick={() => {setLoginMode('hospital'); resetFlow();}}
                  className={cn(
                    "flex-1 py-4 rounded-[2rem] text-[10px] font-black transition-colors duration-300 relative z-10 flex items-center justify-center gap-2",
                    loginMode === 'hospital' ? "text-white" : "text-slate-500"
                  )}
                >
                  <Building2 className="h-3.5 w-3.5" /> INSTITUTION
                </button>
                <button
                  onClick={() => {setLoginMode('individual'); resetFlow();}}
                  className={cn(
                    "flex-1 py-4 rounded-[2rem] text-[10px] font-black transition-colors duration-300 relative z-10 flex items-center justify-center gap-2",
                    loginMode === 'individual' ? "text-white" : "text-slate-500"
                  )}
                >
                  <Stethoscope className="h-3.5 w-3.5" /> PRACTITIONER
                </button>
             </div>

             <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                     <div className="space-y-2 text-center">
                        <p className={cn("text-xs font-black uppercase tracking-widest", loginMode === 'hospital' ? 'text-primary' : 'text-emerald-600')}>
                            Step 1: ID Verification
                        </p>
                        <p className="text-[10px] font-medium text-slate-400">Please verify your clinical Google identity to proceed.</p>
                     </div>

                     <button
                       onClick={handleGoogleLogin}
                       disabled={loading}
                       className="w-full h-16 md:h-20 bg-white dark:bg-slate-800 border-2 border-border/50 rounded-3xl flex items-center justify-center gap-4 hover:border-primary/40 transition-all font-bold group disabled:opacity-50"
                     >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : (
                           <>
                             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-6 w-6 group-hover:scale-110 transition-transform" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Verify with Google ID</span>
                           </>
                        )}
                     </button>

                     <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50"></div></div>
                        <div className="relative flex justify-center text-[9px] uppercase font-black text-slate-400 bg-[#F8FAFC] dark:bg-[#0F172A] px-4 tracking-widest">Secure Handshake Required</div>
                     </div>

                     <div className="flex flex-col items-center gap-4 pt-4">
                        <Link href="/subscriptions" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2">
                           <Globe className="h-3 w-3" /> View Clinical Licenses
                        </Link>
                        {loginMode === 'hospital' && (
                            <Link href="/verify-hospital" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-foreground flex items-center gap-2">
                               <Hospital className="h-3 w-3" /> Institutional Onboarding Hub
                            </Link>
                        )}
                     </div>
                  </motion.div>
                ) : (
                  <motion.div key="step2" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                     <div className={cn(
                        "p-4 border rounded-2xl flex items-center gap-4",
                        loginMode === 'hospital' ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50" : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50"
                     )}>
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg", loginMode === 'hospital' ? 'bg-[#2563EB]' : 'bg-[#059669]')}>
                           <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                           <p className={cn("text-[8px] font-black uppercase tracking-widest opacity-60", loginMode === 'hospital' ? 'text-blue-600' : 'text-emerald-600')}>Google Identity Verified</p>
                           <p className="text-xs font-bold text-slate-700 dark:text-white truncate">{googleUser?.email}</p>
                        </div>
                        <button onClick={resetFlow} className="ml-auto p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-all">
                            <ArrowRight className="h-4 w-4 rotate-180" />
                        </button>
                     </div>

                     {loginMode === 'hospital' ? (
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Step 2: Authorized Clinical Key</label>
                              <div className="relative group">
                                 <Key className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                 <input
                                   type="text"
                                   value={clinicalKey}
                                   onChange={(e) => {setClinicalKey(e.target.value.toUpperCase()); setError(null);}}
                                   placeholder="NS-884920"
                                   className="w-full h-16 md:h-20 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-[2rem] pl-16 pr-8 text-lg font-mono font-black focus:border-primary outline-none transition-all placeholder:opacity-20"
                                 />
                                 {clinicalKey.startsWith('NS-') && clinicalKey.length > 5 && (
                                     <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500"><CheckCircle2 className="h-5 w-5" /></div>
                                 )}
                              </div>
                           </div>
                           <button onClick={handleHospitalLogin} disabled={loading || !clinicalKey} className="w-full h-16 md:h-20 bg-primary text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-30">
                              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Link Node Workstation <ArrowRight className="h-5 w-5" /></>}
                           </button>
                        </div>
                     ) : (
                        <div className="space-y-8">
                           <div className="space-y-6 text-center">
                              <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                                 <Mail className="h-7 w-7" />
                              </div>
                              <div className="space-y-2">
                                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Verification Code Dispatched</p>
                                 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 px-4 leading-relaxed">Enter the 6-digit code sent to your Google mail to establish a secure clinical link.</p>
                              </div>
                              <div className="flex gap-2.5 justify-center">
                                 {otp.map((digit, i) => (
                                   <input
                                     key={i}
                                     id={`otp-${i}`}
                                     type="text"
                                     maxLength={1}
                                     value={digit}
                                     onChange={(e) => handleOtpChange(i, e.target.value)}
                                     className="h-14 w-11 md:h-16 md:w-12 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-xl flex items-center justify-center font-black text-xl text-center focus:border-emerald-500 outline-none transition-all"
                                   />
                                 ))}
                              </div>
                           </div>
                           <button onClick={handleIndividualVerify} disabled={loading || otp.some(d => !d)} className="w-full h-16 md:h-20 bg-[#059669] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-30">
                              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Finalize Secure Link <ArrowRight className="h-5 w-5" /></>}
                           </button>
                        </div>
                     )}
                  </motion.div>
                )}
             </AnimatePresence>

             {error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-200 dark:border-red-900 flex items-start gap-4 mt-6">
                   <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                   <p className="text-[9px] font-black text-red-600 uppercase leading-relaxed tracking-wider">{error}</p>
                </motion.div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
