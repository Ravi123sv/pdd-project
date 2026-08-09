"use client";

import { useEffect, useState } from "react";
import { useStore } from "../lib/store/useStore";
import { useTheme } from "./ThemeProvider";
import {
  Bell,
  Search,
  Moon,
  Sun,
  Activity,
  AlertCircle,
  X,
  Wifi,
  Globe,
  ShieldCheck
} from "lucide-react";
import { socketService } from "../lib/api/socket";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { networkStatus, isHardwareConnected } = useStore();
  const { theme, toggleTheme } = useTheme();
  const [alert, setAlert] = useState<string | null>(null);

  useEffect(() => {
    socketService.connect();
    socketService.onMessage((data) => {
      if (data.channel === 'RED_ALERT' || data.channel === 'clinical_alert') {
        setAlert(data.text || "Diagnostic Integrity Failure");
      }
    });
  }, []);

  return (
    <header className="flex flex-col z-40 sticky top-0">
      {/* Real-time Alert Banner */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="bg-red-600 text-white overflow-hidden shadow-2xl"
          >
            <div className="px-8 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-4 w-4 animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">EMERGENCY BROADCAST: {alert}</span>
              </div>
              <button onClick={() => setAlert(null)} className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-20 border-b border-border/50 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl px-8 flex items-center justify-between">
        <div className="hidden md:flex items-center flex-1 max-w-xl">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Instant Clinical Search (MRN, Staff, Assets)..."
              className="w-full h-12 bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary/10 rounded-2xl pl-12 pr-4 text-xs font-bold transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Hub Connectivity Pulse */}
          <div className="hidden lg:flex items-center space-x-3 px-4 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
              <div className="relative">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
                  <div className="h-2 w-2 bg-emerald-500 rounded-full relative" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Hub Online</span>
          </div>

          <div className="h-8 w-px bg-border/50" />

          <div className="flex items-center space-x-3">
            <button
                onClick={toggleTheme}
                className="h-11 w-11 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary transition-all shadow-sm"
                title="Toggle Interface Mode"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
                className="h-11 w-11 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary transition-all shadow-sm relative"
                title="System Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-primary border-2 border-white dark:border-[#0F172A] rounded-full animate-pulse" />
            </button>

            <div className="h-11 w-11 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary/20">
               {useStore.getState().user?.name?.[0]}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
