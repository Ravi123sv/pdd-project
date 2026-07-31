"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Eye,
  History,
  Smartphone,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Fingerprint,
  RefreshCw,
  Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../../lib/store/useStore";

export default function SecurityCenterPage() {
  const { user } = useStore();
  const [isScanning, setIsScanning] = useState(false);

  const logs = [
    { action: "Node Handshake Successful", device: "Desktop Workstation", location: "Local IP", time: "Just Now", status: "success" },
    { action: "Session Key Rotation", device: "System Core", location: "Global Hub", time: "14m ago", status: "success" },
    { action: "Authorization Grant", device: "Admin Console", location: "Local IP", time: "2h ago", status: "success" },
    { action: "Encrypted Data Export", device: "Vault Utility", location: "Local IP", time: "Yesterday", status: "warning" },
  ];

  const runIntegrityScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <ShieldCheck className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Security Center</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Clinical Data Protection & Access Integrity
              </p>
           </div>
        </div>
        <button
          onClick={runIntegrityScan}
          disabled={isScanning}
          className="neuro-button bg-primary text-white flex items-center space-x-2 px-8 shadow-xl shadow-primary/20"
        >
          {isScanning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
          <span className="text-[10px] font-black uppercase tracking-widest">Verify Core Integrity</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Cards */}
        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SecurityCard
                title="E2E Encryption"
                status="Active"
                desc="AES-256 bit encryption active for all signal telemetry."
                icon={Lock}
                color="text-emerald-500"
              />
              <SecurityCard
                title="Identity Scrubber"
                status="Active"
                desc="PII is removed from signals before cloud synchronization."
                icon={Eye}
                color="text-primary"
              />
           </div>

           {/* Access Logs */}
           <section className="glass-card overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                 <div className="flex items-center space-x-3">
                    <History className="h-4 w-4 text-slate-400" />
                    <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Recent Security Events</h3>
                 </div>
              </div>
              <div className="divide-y divide-border">
                 {logs.map((log, i) => (
                    <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                       <div className="flex items-center space-x-4">
                          <div className={`h-2 w-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <div>
                             <p className="text-sm font-bold text-foreground">{log.action}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.device} • {log.location}</p>
                          </div>
                       </div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{log.time}</span>
                    </div>
                 ))}
              </div>
           </section>
        </div>

        {/* Right Sidebar: Active Node info */}
        <div className="space-y-6">
           <div className="glass-card p-8 bg-slate-900 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Node Authority</span>
                    <Globe className="h-4 w-4 text-primary animate-pulse" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-xl font-black truncate">{user?.hospitalName || 'Individual Station'}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{user?.email}</p>
                 </div>
                 <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                       <Key className="h-3 w-3 text-primary" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Node Key Verified</span>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                 </div>
              </div>
              <ShieldCheck className="absolute -bottom-6 -right-6 h-32 w-32 text-primary opacity-5 group-hover:scale-110 transition-transform duration-700" />
           </div>

           <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 space-y-4">
              <div className="flex items-center space-x-3 text-primary">
                 <AlertTriangle className="h-4 w-4" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Protocol Reminder</h4>
              </div>
              <p className="text-xs font-bold leading-relaxed text-slate-500 dark:text-slate-400">
                Authorized staff must only access the workstation via institutional VPN when outside the clinic premises.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function SecurityCard({ title, status, desc, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-8 space-y-6 group hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between">
                <div className={`h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${color} border border-border/50 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{status}</span>
            </div>
            <div className="space-y-2">
                <h4 className="text-lg font-black tracking-tight">{title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
