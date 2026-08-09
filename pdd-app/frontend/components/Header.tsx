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
  ShieldCheck,
  ChevronRight,
  User,
  BookOpen
} from "lucide-react";
import { socketService } from "../lib/api/socket";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { api } from "../lib/api/client";

export default function Header() {
  const router = useRouter();
  const { networkStatus, user } = useStore();
  const { theme, toggleTheme } = useTheme();
  const [alert, setAlert] = useState<string | null>(null);

  // Search State
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    socketService.connect();
    socketService.onMessage((data) => {
      if (data.channel === 'RED_ALERT' || data.channel === 'clinical_alert') {
        setAlert(data.text || "Diagnostic Integrity Failure");
      }
    });
  }, []);

  useEffect(() => {
      if (query.length < 2) {
          setResults([]);
          return;
      }
      const search = async () => {
          setSearching(true);
          try {
              // Simulated Global Search across MRNs and Protocols
              const pRes = await api.patients.getAll(user?.hospitalId || 'HOSP-DEFAULT');
              const matches = pRes.data.filter((p: any) =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.patientId.includes(query)
              ).map((p: any) => ({ ...p, type: 'patient' }));

              if ("protocols".includes(query.toLowerCase())) {
                  matches.push({ name: "12-Lead Standard", type: 'protocol', id: 'protocols' });
              }
              setResults(matches.slice(0, 5));
          } catch (e) { console.error(e); }
          finally { setSearching(false); }
      };
      const timer = setTimeout(search, 300);
      return () => clearTimeout(timer);
  }, [query, user]);

  return (
    <header className="flex flex-col z-50 sticky top-0">
      <AnimatePresence>
        {alert && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-red-600 text-white overflow-hidden shadow-2xl">
            <div className="px-8 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-4 w-4 animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">EMERGENCY BROADCAST: {alert}</span>
              </div>
              <button onClick={() => setAlert(null)} className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"><X className="h-4 w-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-20 border-b border-border/50 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl px-8 flex items-center justify-between">
        <div className="hidden md:flex items-center flex-1 max-w-xl relative group">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Instant Command (MRN, Staff, Protocol)..."
              className="w-full h-12 bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary/10 rounded-2xl pl-12 pr-4 text-xs font-bold transition-all outline-none"
            />
          </div>

          <AnimatePresence>
            {results.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-border shadow-2xl rounded-2xl overflow-hidden z-[60]">
                    {results.map((res, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setQuery("");
                                router.push(res.type === 'patient' ? '/dashboard/patients' : `/dashboard/${res.id}`);
                            }}
                            className="w-full px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between border-b border-border/50 last:border-0"
                        >
                            <div className="flex items-center gap-4">
                                {res.type === 'patient' ? <User className="h-4 w-4 text-primary" /> : <BookOpen className="h-4 w-4 text-secondary" />}
                                <div>
                                    <p className="text-sm font-bold text-foreground">{res.name}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{res.type} • {res.patientId || 'Ref'}</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                        </button>
                    ))}
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex items-center space-x-3 px-4 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
              <div className="relative">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
                  <div className="h-2 w-2 bg-emerald-500 rounded-full relative" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Hub Online</span>
          </div>

          <div className="h-8 w-px bg-border/50" />

          <div className="flex items-center space-x-3">
            <button onClick={toggleTheme} className="h-11 w-11 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary transition-all shadow-sm">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
                onClick={() => router.push("/dashboard/notifications")}
                className="h-11 w-11 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary transition-all shadow-sm relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-primary border-2 border-white dark:border-[#0F172A] rounded-full animate-pulse" />
            </button>

            <div onClick={() => router.push("/dashboard/profile")} className="h-11 w-11 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary/20 cursor-pointer hover:scale-105 transition-all">
               {user?.name?.[0] || 'D'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
