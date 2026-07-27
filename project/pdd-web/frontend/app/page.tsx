"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../lib/store/useStore";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function EntryPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Just check if session exists, but don't auto-login here if we want to force login interaction
    // Or, keep it but the user says it's "not working" and "goes direct login".
    // If "it not working" means clicking login does nothing, it might be because they are already authed.

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
        // Use a small delay for branding effect
        const timer = setTimeout(() => {
            // Check if user is already authenticated
            const savedSession = localStorage.getItem("user_session");
            if (savedSession) {
                try {
                    const { user } = JSON.parse(savedSession);
                    if (user) {
                        setAuth(true, user);
                        router.replace("/dashboard");
                        return;
                    }
                } catch (e) {
                    console.error("Session recovery failed", e);
                }
            }
            // Otherwise go to Landing Page
            router.replace("/landing");
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [loading, router, setAuth]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-[#0F172A]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center space-y-8"
      >
        <div className="h-24 w-24 relative">
            <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] animate-ping" />
            <div className="relative h-24 w-24 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/30">
                <img src="/assets/icon/app_icon.svg" className="h-12 w-12" alt="Logo" />
            </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tighter text-[#0F172A] dark:text-white">NEUROSIGNAL</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Enterprise AI</p>
        </div>

        <div className="flex items-center space-x-3 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest">Securing Clinical Link...</span>
        </div>
      </motion.div>
    </div>
  );
}
