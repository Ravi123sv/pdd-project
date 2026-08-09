"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center p-8">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-2xl border border-border/50 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-500" />

        <div className="space-y-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-24 w-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-inner"
          >
             <AlertCircle className="h-12 w-12" />
          </motion.div>

          <div className="space-y-4">
             <h1 className="text-4xl font-black text-foreground tracking-tight uppercase">Upgrade Deferred</h1>
             <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
                The institutional upgrade handshake was interrupted. No charges were made to your account.
             </p>
          </div>

          <div className="pt-6 space-y-4">
              <Link
                href="/subscriptions"
                className="w-full h-16 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all"
              >
                 Retry Handshake <RefreshCw className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full h-16 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-slate-200 transition-all"
              >
                 <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
