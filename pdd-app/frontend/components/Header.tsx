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
  X
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
      if (data.channel === 'RED_ALERT') {
        setAlert(data.text);
      }
    });
  }, []);

  return (
    <header className="flex flex-col z-40">
      {/* Real-time Alert Banner */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="bg-error text-white overflow-hidden"
          >
            <div className="px-8 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-4 w-4 animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-widest">RED ALERT: {alert}</span>
              </div>
              <button onClick={() => setAlert(null)} className="hover:opacity-70"><X className="h-4 w-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-20 border-b border-border bg-white dark:bg-[#0F172A] px-8 flex items-center justify-between">
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search workstation..." className="w-full h-11 bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-12 pr-4 text-sm font-medium outline-none" />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex flex-col items-end">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Link</span>
              <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Active (42ms)</p>
          </div>

          <div className="h-8 w-px bg-border/50" />

          <div className="flex items-center space-x-2">
            <button onClick={toggleTheme} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 border-2 border-white dark:border-[#0F172A] rounded-full" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
