"use client";

import { useState } from "react";
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
  ChevronRight
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DiagnosticsPage() {
  const [runningTest, setRunningTest] = useState<string | null>(null);

  const tests = [
    { id: 'LINK', label: "Clinical Link Latency", status: "Optimal", value: "42ms", icon: Wifi, color: "text-secondary" },
    { id: 'SIGNAL', label: "Signal Engine (Go)", status: "Active", value: "2.4 GHz", icon: Activity, color: "text-primary" },
    { id: 'SQL', label: "Database Persistence", status: "Operational", value: "99.9% Sync", icon: Database, color: "text-amber-500" },
    { id: 'NEURAL', label: "Neural Logic Unit", status: "Active", value: "v2.0-Pro", icon: Cpu, color: "text-blue-500" },
  ];

  const runDiagnostic = (id: string) => {
    setRunningTest(id);
    setTimeout(() => setRunningTest(null), 1500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">QA Diagnostics</h1>
          <p className="text-sm font-medium text-slate-500">System-wide stability analysis and hardware link verification</p>
        </div>
        <button className="neuro-button bg-primary text-white flex items-center space-x-2 text-sm">
          <RefreshCw className="h-4 w-4" />
          <span>FULL SYSTEM SCAN</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tests.map((test) => (
          <div key={test.id} className="glass-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center", test.color)}>
                <test.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black text-secondary uppercase tracking-tighter">{test.status}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{test.label}</p>
              <h4 className="text-xl font-black text-foreground">{test.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Diagnostic Logs */}
        <div className="lg:col-span-2 space-y-6">
          <section className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bug className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Subsystem Health</h3>
              </div>
            </div>

            <div className="divide-y divide-border">
              {[
                { name: "Artifact Suppressor", status: "Healthy", type: "system" },
                { name: "Go Binary Streamer", status: "Active", type: "system" },
                { name: "Firestore Clinical Hub", status: "Synced", type: "cloud" },
                { name: "Local SQLite Cache", status: "Optimized", type: "local" },
              ].map((sub, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="h-2 w-2 rounded-full bg-secondary" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{sub.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => runDiagnostic(sub.name)}
                    className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary transition-all"
                  >
                    {runningTest === sub.name ? <RefreshCw className="h-4 w-4 animate-spin text-primary" /> : <Play className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* System integrity summary */}
        <div className="space-y-6">
          <section className="glass-card p-8 bg-slate-900 text-white relative overflow-hidden">
            <div className="relative z-10">
              <ShieldCheck className="h-10 w-10 text-primary mb-6" />
              <h3 className="text-xl font-black mb-2">Backbone Integrity</h3>
              <p className="text-sm text-white/50 font-medium mb-8">Clinical data integrity is currently verified across all available backends.</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white/40 uppercase">Memory Footprint</span>
                  <span>142 MB / 2 GB</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[15%]" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />
          </section>

          <div className="p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center space-x-3 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Maintenance Alert</h4>
            </div>
            <p className="text-xs font-bold text-amber-700 leading-relaxed">
              Full SQL vacuum scheduled for 24:00 UTC. Potential 10ms latency increase during sync.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
