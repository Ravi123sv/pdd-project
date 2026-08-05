"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Mail, Users, ArrowRight, CheckCircle2, Loader2, Globe, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ContactSalesPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center p-8">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-2xl border border-border/50 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
              <div className="space-y-4">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Building2 className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Enterprise Solutions</h1>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Connect with our clinical logistics team to architect a multi-unit deployment plan for your institution.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Hospital Name</label>
                    <input required type="text" placeholder="General Medical Center" className="w-full h-16 bg-slate-50 dark:bg-slate-800 border-2 border-border/50 rounded-2xl px-6 font-bold focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Official Domain</label>
                    <input required type="email" placeholder="admin@hospital.org" className="w-full h-16 bg-slate-50 dark:bg-slate-800 border-2 border-border/50 rounded-2xl px-6 font-bold focus:border-primary outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Unit Capacity Requirements</label>
                  <select className="w-full h-16 bg-slate-50 dark:bg-slate-800 border-2 border-border/50 rounded-2xl px-6 font-bold focus:border-primary outline-none transition-all appearance-none">
                    <option>5-10 Nodes (Standard)</option>
                    <option>10-50 Nodes (Intermediate)</option>
                    <option>50+ Nodes (Global Campus)</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} className="w-full h-20 bg-primary text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-95 transition-all">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Request Institutional Review <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-10 py-10">
              <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-lg">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black tracking-tight uppercase">Inquiry Received</h2>
                <p className="text-slate-500 font-medium px-8 leading-relaxed">
                  Our clinical representatives will reach out to your institutional domain within 24 business hours to finalize your custom workstation configuration.
                </p>
              </div>
              <Link href="/subscriptions" className="inline-flex items-center space-x-2 text-primary font-black uppercase text-[10px] tracking-widest hover:underline">
                Return to Plans
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
