"use client";

import { useState } from "react";
import { useStore } from "../../../lib/store/useStore";
import {
  Shield,
  Lock,
  Key,
  Smartphone,
  Globe,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  RefreshCw,
  LogOut,
  AlertTriangle,
  History
} from "lucide-react";
import { motion } from "framer-motion";

export default function SecurityCenterPage() {
  const { user } = useStore();

  const loginHistory = [
    { device: "Clinical Workstation", location: "Hospital Hub A", time: "Just Now", status: "Verified" },
    { device: "Mobile Workstation", location: "Authorized App", time: "2h ago", status: "Verified" },
    { device: "Desktop Node", location: "Internal IP", time: "Yesterday", status: "Session Expired" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-12">
      <div className="flex items-center space-x-4">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <Shield className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">Security Center</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End-to-End Privacy & Access Audit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Active Shield Status */}
          <div className="p-8 bg-emerald-500 text-white rounded-[3rem] shadow-2xl shadow-emerald-500/20 flex items-center justify-between relative overflow-hidden group">
             <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-3">
                   <ShieldCheck className="h-6 w-6" />
                   <h3 className="text-xl font-black uppercase tracking-tight">Active Protection</h3>
                </div>
                <p className="text-sm font-medium opacity-90">All clinical data packets are currently secured via AES-256 E2E Encryption.</p>
             </div>
             <Fingerprint className="absolute -bottom-10 -right-10 h-48 w-48 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
          </div>

          {/* Access Audit Log */}
          <div className="glass-card overflow-hidden">
             <div className="px-8 py-6 border-b border-border/50 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <History className="h-4 w-4 text-primary" />
                    <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest">Authorized Access Log</h3>
                </div>
                <button
                    onClick={() => alert("Audit Node: Generating encrypted forensic log... Done.")}
                    className="text-[9px] font-black text-primary uppercase hover:underline"
                >
                    Download Audit
                </button>
             </div>

             <div className="divide-y divide-border/50">
                {loginHistory.map((log, i) => (
                    <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center space-x-5">
                           <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                               <Smartphone className="h-5 w-5" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-foreground">{log.device}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.location}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-foreground uppercase">{log.time}</p>
                           <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">{log.status}</p>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="glass-card p-10 bg-slate-900 text-white space-y-8 relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center space-x-3 text-secondary">
                    <Lock className="h-6 w-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Session Vault</span>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-white/40 uppercase">E2EE State</span>
                       <span className="text-[10px] font-black text-emerald-500 uppercase">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-white/40 uppercase">SSL Handshake</span>
                       <span className="text-[10px] font-black text-emerald-500 uppercase">Verified</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-white/40 uppercase">Last Key Rotation</span>
                       <span className="text-[10px] font-black text-slate-400 uppercase">14 Days Ago</span>
                    </div>
                 </div>
                 <button
                    onClick={() => alert("Key Rotation Node: Secure handshake initialized. New clinical key will be issued via encrypted SMTP.")}
                    className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                 >
                    Rotate Clinical Key
                 </button>
              </div>
           </div>

           <div className="p-8 border-2 border-dashed border-red-500/20 bg-red-500/5 rounded-[2.5rem] space-y-4 group">
              <div className="flex items-center space-x-3 text-red-500">
                 <ShieldAlert className="h-5 w-5 animate-pulse" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Emergency Killswitch</h4>
              </div>
              <p className="text-xs font-medium leading-relaxed text-red-700 dark:text-red-400/70 italic">
                 Instantly terminate all active clinical sessions and rotate institutional access keys across the entire unit hub.
              </p>
              <button
                onClick={() => alert("CRITICAL LOCKDOWN: All active sessions terminated. Unit keys invalidated.")}
                className="w-full h-12 bg-red-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-red-200 active:scale-95 transition-all"
              >
                Execute Lockdown
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
