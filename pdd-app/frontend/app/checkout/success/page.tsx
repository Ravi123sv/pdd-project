"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center p-8">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-2xl border border-border/50 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />

        <div className="space-y-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner"
          >
             <ShieldCheck className="h-12 w-12" />
          </motion.div>

          <div className="space-y-4">
             <h1 className="text-4xl font-black text-foreground tracking-tight uppercase">License Verified</h1>
             <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your institutional upgrade is now active. All clinical nodes have been synchronized with the new entitlement tier.
             </p>
          </div>

          <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-emerald-500/20 space-y-4">
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Transaction Status</span>
                <span className="text-emerald-500">Completed</span>
             </div>
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Hub Handshake</span>
                <span className="text-emerald-500">Verified</span>
             </div>
          </div>

          <Link
            href="/dashboard"
            className="w-full h-16 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all"
          >
             Return to Workstation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Activity className="absolute -bottom-10 -right-10 h-40 w-40 text-primary opacity-5 animate-pulse" />
      </div>
    </div>
  );
}
