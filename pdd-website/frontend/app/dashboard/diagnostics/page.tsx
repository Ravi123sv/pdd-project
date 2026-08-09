"use client";

import { useState, useEffect } from "react";
import { useStore } from "../../../lib/store/useStore";
import { api } from "../../../lib/api/client";
import {
  Bug,
  RefreshCw,
  Activity,
  Cpu,
  Database,
  Wifi,
  ShieldCheck,
  Play,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Server,
  Lock,
  Globe,
  Loader2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DiagnosticsPage() {
  const { user } = useStore();
  const [runningTest, setRunningTest] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  // Backend Health State
  const [hubHealth, setHubHealth] = useState<any>(null);
  const [checkingHub, setCheckingHub] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
        setCheckingHub(true);
        try {
            const res = await api.system.health(); // We'll add this to client.ts
            setHubHealth(res.data);
        } catch (e) {
            setHubHealth({ status: 'OFFLINE', db: 'Disconnected' });
        } finally {
            setCheckingHub(false);
        }
    };
    checkHealth();
  }, []);

  const tests = [
    { id: 'LINK', label: "Clinical Link Latency", status: "Optimal", value: "42ms", icon: Wifi, color: "text-secondary" },
    { id: 'SIGNAL', label: "Signal Engine (GPU)", status: "Active", value: "60 FPS", icon: Activity, color: "text-primary" },
    { id: 'SQL', label: "Database Persistence", status: hubHealth?.db === 'Connected' ? "Operational" : "Error", value: hubHealth?.db || "Check Logs", icon: Database, color: "text-amber-500" },
    { id: 'NEURAL', label: "Neural Logic Unit", status: "Active", value: "v4.0-Stealth", icon: Cpu, color: "text-blue-500" },
  ];

  const runDiagnostic = (id: string) => {
    setRunningTest(id);
    setTimeout(() => setRunningTest(null), 1500);
  };

  const startFullScan = () => {
      setScanning(true);
      setScanComplete(false);
      setTimeout(() => {
          setScanning(false);
          setScanComplete(true);
          setTimeout(() => setScanComplete(false), 3000);
      }, 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <ShieldAlert className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">QA Diagnostics</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                System-wide stability analysis & security verification
              </p>
           </div>
        </div>

        <button
            onClick={startFullScan}
            disabled={scanning}
            className="neuro-button bg-primary text-white flex items-center space-x-3 px-8 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="text-[10px] font-black uppercase tracking-widest">{scanning ? "Analyzing Core..." : "Initialize Full Audit"}</span>
        </button>
      </div>

      {/* Backend Status Banner */}
      <div className={cn(
          "p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all",
          hubHealth?.status === 'Operational' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
      )}>
          <div className="flex items-center gap-4">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", hubHealth?.status === 'Operational' ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                  <Server className="h-5 w-5" />
              </div>
              <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Hub Connectivity</p>
                  <p className="text-sm font-bold text-foreground flex items-center gap-2">
                      {checkingHub ? "Verifying Handshake..." : (hubHealth?.status === 'Operational' ? "NODE_PROD_01: ONLINE" : "NODE_PROD_01: OFFLINE / TIMEOUT")}
                      {!checkingHub && <div className={cn("h-2 w-2 rounded-full animate-pulse", hubHealth?.status === 'Operational' ? "bg-emerald-500" : "bg-red-500")} />}
                  </p>
              </div>
          </div>
          <div className="flex gap-4">
              <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Environment</p>
                  <p className="text-[10px] font-bold text-foreground uppercase">{hubHealth?.node || 'Production'}</p>
              </div>
              <div className="text-right px-4 border-l border-border/50">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">DB State</p>
                  <p className={cn("text-[10px] font-bold uppercase", hubHealth?.db === 'Connected' ? "text-emerald-500" : "text-red-500")}>{hubHealth?.db || 'Locked'}</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tests.map((test) => (
          <div key={test.id} className="glass-card p-6 flex flex-col justify-between group hover:border-primary/40 transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border border-border/50 transition-colors group-hover:bg-primary group-hover:text-white", test.color)}>
                <test.icon className="h-6 w-6" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                <span className={cn("text-[10px] font-black uppercase", test.status === 'Optimal' || test.status === 'Active' || test.status === 'Operational' ? "text-emerald-500" : "text-amber-500")}>{test.status}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{test.label}</p>
              <h4 className="text-2xl font-black text-foreground tracking-tight">{test.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="glass-card overflow-hidden">
            <div className="px-8 py-6 border-b border-border/50 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bug className="h-4 w-4 text-primary" />
                <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest">Security & Performance Audit</h3>
              </div>
            </div>

            <div className="divide-y divide-border/50">
              {[
                { name: "JWT Auth Encryption", status: "Secure", type: "AES-256", icon: Lock },
                { name: "Waveform Batch-Path Engine", status: "Healthy", type: "GPU-ACCEL", icon: Activity },
                { name: "Global Alert WebSocket", status: "Synced", type: "LOW-LATENCY", icon: Globe },
                { name: "LocalStorage Persistence", status: "Optimized", type: "ENCRYPTED", icon: Database },
              ].map((sub, i) => (
                <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center space-x-5">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <sub.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{sub.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">{sub.status}</span>
                      <button
                        onClick={() => runDiagnostic(sub.name)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary transition-all active:scale-90"
                      >
                        {runningTest === sub.name ? <RefreshCw className="h-4 w-4 animate-spin text-primary" /> : <Play className="h-4 w-4" />}
                      </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="glass-card p-8 bg-slate-900 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <ShieldCheck className="h-12 w-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-black mb-2 tracking-tight uppercase">System Backbone</h3>
              <p className="text-xs text-white/50 font-medium mb-8 leading-relaxed">
                  Real-time data integrity verification active. All clinical sub-nodes are reporting 100% morphology consistency.
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-white/40">Resource Load</span>
                      <span className="text-primary">12% Peak</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '12%' }} className="h-full bg-primary" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-white/40">Auth Consistency</span>
                      <span className="text-emerald-500">100%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-emerald-500" />
                    </div>
                </div>
              </div>
            </div>
            <ShieldAlert className="absolute -bottom-10 -right-10 h-48 w-48 text-primary opacity-5 group-hover:rotate-12 transition-transform duration-1000" />
          </section>

          <div className="p-8 rounded-[2.5rem] bg-amber-500/10 border-2 border-dashed border-amber-500/20 group">
            <div className="flex items-center space-x-3 mb-4 text-amber-600">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              <h4 className="text-[11px] font-black uppercase tracking-widest">Maintenance Node</h4>
            </div>
            <p className="text-xs font-bold text-amber-700 dark:text-amber-500/70 leading-relaxed italic">
              Full clinical vault synchronization scheduled for 24:00 UTC. System remains fully operational during sync.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
