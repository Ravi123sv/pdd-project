"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hospital, ShieldCheck, Mail, Loader2, ArrowRight, CheckCircle2, Lock, FileText, Globe } from "lucide-react";
import Link from "next/link";

export default function VerifyHospitalPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [hospitalName, setHospitalName] = useState("");

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(step + 1);
    }, 1500);
  };

  const handleFinalize = () => {
     setLoading(true);
     setTimeout(() => {
        setLoading(false);
        setStep(4);
     }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center p-8">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-2xl border border-border/50 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1.5 bg-slate-100 dark:bg-slate-800 w-full">
           <motion.div
             className="h-full bg-primary"
             initial={{ width: "0%" }}
             animate={{ width: `${(step / 4) * 100}%` }}
           />
        </div>

        <div className="space-y-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                   <Hospital className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-3xl font-black tracking-tight">Institutional Onboarding</h2>
                   <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Step 1: Admin Identification</p>
                </div>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Hospital Name</label>
                      <input
                        type="text"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        placeholder="e.g. St. Jude General"
                        className="w-full h-16 bg-slate-50 dark:bg-slate-800/50 border-2 border-border/50 rounded-2xl px-6 font-bold"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Official Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@hospital.org"
                        className="w-full h-16 bg-slate-50 dark:bg-slate-800/50 border-2 border-border/50 rounded-2xl px-6 font-bold"
                      />
                   </div>
                </div>
                <button
                  onClick={handleNext}
                  disabled={!email || !hospitalName || loading}
                  className="w-full h-16 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-4 active:scale-95 transition-all"
                >
                   {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send Verification Code <ArrowRight className="h-4 w-4" /></>}
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                   <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-3xl font-black tracking-tight">Identity Verification</h2>
                   <p className="text-sm font-medium text-slate-500">We've sent a 6-digit clinical OTP to <span className="text-primary font-bold">{email}</span></p>
                </div>
                <div className="flex gap-4">
                   {[1,2,3,4,5,6].map(i => (
                     <input key={i} type="text" maxLength={1} className="w-full h-16 bg-slate-50 dark:bg-slate-800 border-2 border-border/50 rounded-xl text-center text-xl font-black" />
                   ))}
                </div>
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="w-full h-16 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-4 active:scale-95 transition-all"
                >
                   {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Verify Credentials <ShieldCheck className="h-4 w-4" /></>}
                </button>
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Didn't receive code? <button className="text-primary hover:underline">Resend Code</button></p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                   <FileText className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-3xl font-black tracking-tight">Access Agreement</h2>
                   <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Review License Terms</p>
                </div>
                <div className="h-48 bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 overflow-y-auto text-xs font-medium text-slate-500 leading-relaxed space-y-4">
                   <p>By generating this Clinical Key, you represent that you are an authorized administrator of {hospitalName}.</p>
                   <p>1. Data Privacy: All neuro-signal data remains the property of the institution.</p>
                   <p>2. Staff Management: You are responsible for ensuring all staff added have valid professional credentials.</p>
                   <p>3. Subscription: Currently on Trial Tier. Upgrade required for > 5 units.</p>
                </div>
                <button
                  onClick={handleFinalize}
                  disabled={loading}
                  className="w-full h-16 bg-[#10B981] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 flex items-center justify-center gap-4 active:scale-95 transition-all"
                >
                   {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Generate Clinical Key <Lock className="h-4 w-4" /></>}
                </button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-10 text-center py-6">
                <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                   <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </div>
                <div className="space-y-4">
                   <h2 className="text-4xl font-black tracking-tight">Onboarding Successful</h2>
                   <p className="text-sm font-medium text-slate-500">Your institution is now registered in the Clinical Hub.</p>
                </div>
                <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-emerald-500/30 space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Your Master Clinical Key</p>
                   <p className="text-4xl font-mono font-black text-primary tracking-widest">NS-884920</p>
                   <p className="text-[9px] font-bold text-slate-400">Store this securely. Share only with authorized staff.</p>
                </div>
                <Link
                  href="/auth/login"
                  className="w-full h-16 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-xl shadow-primary/20"
                >
                   Return to Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
