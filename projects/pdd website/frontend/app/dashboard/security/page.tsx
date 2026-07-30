"use client";

import {
  ShieldCheck,
  Lock,
  Key,
  Smartphone,
  Eye,
  Globe,
  Activity,
  AlertTriangle,
  RefreshCw,
  Server,
  Fingerprint
} from "lucide-react";
import { useState } from "react";

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState("protocols");

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Security Center</h1>
          <p className="text-sm font-medium text-slate-500">Monitor clinical data integrity and access control</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">System Hardened</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Security Console */}
        <div className="md:col-span-2 space-y-6">
          <section className="glass-card overflow-hidden">
            <div className="p-6 border-b border-border bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
               <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Access Integrity</h3>
               <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                  {["sessions", "audit"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${
                        activeTab === tab ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-400"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
               </div>
            </div>

            <div className="divide-y divide-border">
              {[
                { event: "Login Attempt", user: "Dr. Sterling", location: "Hospital Unit A", status: "Success", time: "10m ago", icon: Key },
                { event: "Clinical Export", user: "Tech Admin", location: "Remote Workstation", status: "Verified", time: "1h ago", icon: Lock },
                { event: "Sync Interrupted", user: "System", location: "Cloud Hub", status: "Retrying", time: "2h ago", icon: RefreshCw },
                { event: "New Device Link", user: "Dr. Sterling", location: "Mobile Portal", status: "Success", time: "5h ago", icon: Smartphone },
              ].map((log, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <log.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{log.event}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.user} • {log.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      log.status === 'Success' || log.status === 'Verified' ? 'text-secondary' : 'text-amber-500'
                    }`}>
                      {log.status}
                    </span>
                    <p className="text-[10px] font-bold text-slate-400">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="glass-card p-6 bg-slate-900 text-white border-primary/20 relative overflow-hidden">
                <ShieldCheck className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10" />
                <h4 className="text-xs font-black uppercase tracking-widest mb-4">Encryption Status</h4>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white/50">Waveform Packets</span>
                      <span className="text-xs font-bold text-primary">AES-256</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white/50">Patient Identity</span>
                      <span className="text-xs font-bold text-primary">RSA-4096</span>
                   </div>
                </div>
             </div>
             <div className="glass-card p-6 border-amber-500/20 bg-amber-500/5">
                <AlertTriangle className="h-6 w-6 text-amber-500 mb-4" />
                <h4 className="text-xs font-black uppercase tracking-widest mb-2 text-amber-600">Pending Audits</h4>
                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                  3 clinical sessions from Unit B require manual signature verification for SQL sync.
                </p>
             </div>
          </div>
        </div>

        {/* Security Controls */}
        <div className="space-y-6">
          <section className="glass-card p-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Security Actions</h3>
            <div className="space-y-3">
              <SecurityAction icon={RefreshCw} label="Rotate Access Keys" />
              <SecurityAction icon={Eye} label="Review Privacy Logs" />
              <SecurityAction icon={Globe} label="Geo-Fencing Config" />
              <SecurityAction icon={Fingerprint} label="Biometric Setup" />
            </div>
          </section>

          <section className="glass-card p-6 bg-slate-50 dark:bg-slate-800/50">
             <div className="flex items-center space-x-3 mb-4">
                <Server className="h-5 w-5 text-primary" />
                <h4 className="text-xs font-black uppercase tracking-tight">Backend Shield</h4>
             </div>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-400 uppercase">Firewall</span>
                   <span className="text-[10px] font-black text-secondary uppercase">Active</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-400 uppercase">DDoS Protection</span>
                   <span className="text-[10px] font-black text-secondary uppercase">Active</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-400 uppercase">Threat Level</span>
                   <span className="text-[10px] font-black text-slate-500 uppercase">Low</span>
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SecurityAction({ icon: Icon, label }: any) {
  return (
    <button className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
      <div className="flex items-center space-x-3">
        <Icon className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
        <span className="text-xs font-bold">{label}</span>
      </div>
    </button>
  );
}
