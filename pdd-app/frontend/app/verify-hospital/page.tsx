"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hospital, ShieldCheck, Mail, Loader2, ArrowRight, CheckCircle2, Lock, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { api } from "../../lib/api/client";

export default function VerifyHospitalPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [hospitalName, setHospitalName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleSendOTP = async () => {
    if (!email || !hospitalName) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.otp.send(email, hospitalName);
      // Dual-Mode Support: If SMTP fails but backend returns code for tester, show it.
      if (res.data.code) {
          setError(`[SECURITY FALLBACK] YOUR CODE IS: ${res.data.code}`);
      }
      setStep(2);
    } catch (err: any) {
      setError("SYSTEM: FAILED TO DISPATCH VERIFICATION CODE.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) return;

    setLoading(true);
    setError(null);
    try {
      await api.otp.verify(email, fullOtp);
      setStep(3);
    } catch (err: any) {
      setError("INVALID OR EXPIRED VERIFICATION CODE.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = () => {
     setLoading(true);
     // Simulate real key generation based on hospital name
     setTimeout(() => {
        setGeneratedKey(`NS-${Math.floor(100000 + Math.random() * 900000)}`);
        setLoading(false);
        setStep(4);
     }, 2000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center p-8">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-2xl border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1.5 bg-slate-100 dark:bg-slate-800 w-full">
           <motion.div className="h-full bg-primary" initial={{ width: "0%" }} animate={{ width: `${(step / 4) * 100}%` }} />
        </div>

        <div className="space-y-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                   <Hospital className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-3xl font-black tracking-tight">Institutional Onboarding</h2>
                   <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Step 1: Admin Identification</p>
                </div>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Hospital Name</label>
                      <input type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} placeholder="e.g. St. Jude General" className="w-full h-16 bg-slate-50 dark:bg-slate-800/50 border-2 border-border/50 rounded-2xl px-6 font-bold focus:border-primary outline-none transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Official Email Address</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@hospital.org" className="w-full h-16 bg-slate-50 dark:bg-slate-800/50 border-2 border-border/50 rounded-2xl px-6 font-bold focus:border-primary outline-none transition-all" />
                   </div>
                </div>
                {error && <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 text-[10px] font-black uppercase"><AlertTriangle className="h-4 w-4" /> {error}</div>}
                <button onClick={handleSendOTP} disabled={!email || !hospitalName || loading} className="w-full h-16 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50">
                   {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send Verification Code <ArrowRight className="h-4 w-4" /></>}
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                   <ShieldCheck className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-3xl font-black tracking-tight">Identity Verification</h2>
                   <p className="text-sm font-medium text-slate-500 px-6">Enter the 6-digit clinical code dispatched to <span className="text-primary font-bold">{email}</span></p>
                </div>
                <div className="flex gap-3 justify-center">
                   {otp.map((d, i) => (
                     <input key={i} id={`otp-input-${i}`} type="text" maxLength={1} value={d} onChange={(e) => handleOtpChange(i, e.target.value)} className="w-12 h-16 bg-slate-50 dark:bg-slate-800 border-2 border-border/50 rounded-xl text-center text-xl font-black focus:border-primary outline-none transition-all" />
                   ))}
                </div>
                {error && <p className="text-red-500 text-[10px] font-black uppercase">{error}</p>}
                <button onClick={handleVerifyOTP} disabled={otp.some(d => !d) || loading} className="w-full h-16 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50">
                   {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Verify Credentials <ShieldCheck className="h-4 w-4" /></>}
                </button>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Didn't receive code? <button onClick={handleSendOTP} className="text-primary hover:underline">Resend</button></p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                   <FileText className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-3xl font-black tracking-tight">Access Agreement</h2>
                   <p className="text-sm font-medium text-slate-500 uppercase tracking-widest font-black">Authorized Admin: {hospitalName}</p>
                </div>
                <div className="h-48 bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 overflow-y-auto text-xs font-medium text-slate-500 leading-relaxed space-y-4 border border-border/50">
                   <p>1. Data Privacy: All diagnostic signals remain institutional property.</p>
                   <p>2. Liability: AI findings are decision-support only and must be physician-verified.</p>
                   <p>3. Security: Master keys must be stored in secure offline environments.</p>
                </div>
                <button onClick={handleFinalize} disabled={loading} className="w-full h-16 bg-[#10B981] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all">
                   {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Generate Master Clinical Key <Lock className="h-4 w-4" /></>}
                </button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-10 text-center py-6">
                <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                   <CheckCircle2 className="h-12 w-12" />
                </div>
                <div className="space-y-4">
                   <h2 className="text-4xl font-black tracking-tight">Onboarding Successful</h2>
                   <p className="text-sm font-medium text-slate-500">Your institution is now registered in the Clinical Hub.</p>
                </div>
                <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-emerald-500/30 space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Master Institutional Key</p>
                   <p className="text-4xl font-mono font-black text-primary tracking-widest">{generatedKey}</p>
                   <p className="text-[9px] font-bold text-slate-400">Store this securely. Share ONLY with authorized staff.</p>
                </div>
                <Link href="/auth/login" className="w-full h-16 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-xl">Return to Login</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
