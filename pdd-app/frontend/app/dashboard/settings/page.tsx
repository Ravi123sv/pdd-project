"use client";

import { useState } from "react";
import { useStore } from "../../../lib/store/useStore";
import {
  Settings,
  Shield,
  Zap,
  Globe,
  Monitor,
  Bell,
  Database,
  Lock,
  Eye,
  Smartphone,
  Save,
  Loader2,
  RefreshCw,
  HardDrive
} from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { settings, setSettings, user } = useStore();
  const [loading, setLoading] = useState(false);
  const [backendUrl, setBackendUrl] = useState(settings.backendUrl);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSettings({ backendUrl });
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    alert("System settings synchronized.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-12">
      <div className="flex items-center space-x-4">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <Settings className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">System Settings</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workstation Configuration & Network Backbone</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Network Configuration */}
          <form onSubmit={handleSave} className="glass-card p-10 space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" /> Hub Connectivity
                </h3>
                <button
                    onClick={() => alert("Handshake Node: Institutional Hub connection verified at 42ms latency.")}
                    type="button"
                    className="text-[9px] font-black text-primary uppercase hover:underline flex items-center gap-2"
                >
                    <RefreshCw className="h-3 w-3" /> Test Handshake
                </button>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Clinical Hub URL</label>
                   <input
                      type="text"
                      value={backendUrl}
                      onChange={(e) => setBackendUrl(e.target.value)}
                      className="neuro-input font-mono text-[11px]"
                   />
                   <p className="text-[9px] font-medium text-slate-400 mt-1 italic">Internal endpoint for medical telemetry synchronization.</p>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border/50">
                    <div>
                        <p className="text-xs font-bold text-foreground">AI Offline Mode</p>
                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">Force Local Logic Engine</p>
                    </div>
                    <Toggle active={!settings.aiEnabled} onClick={() => setSettings({ aiEnabled: !settings.aiEnabled })} />
                </div>
             </div>

             <div className="pt-6">
                <button
                   disabled={loading}
                   type="submit"
                   className="neuro-button bg-primary text-white flex items-center space-x-3 px-10 shadow-xl shadow-primary/20"
                >
                   {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                   <span className="text-[10px] font-black uppercase tracking-widest">Update Network Node</span>
                </button>
             </div>
          </form>

          {/* Privacy & Security */}
          <div className="glass-card p-10 space-y-8">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" /> Data Sovereignty
             </h3>

             <div className="space-y-6">
                <div className="flex items-center justify-between group">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-foreground">End-to-End Encryption</p>
                        <p className="text-[9px] font-medium text-slate-400 uppercase">AES-256 Signal Packet Guard</p>
                    </div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase px-3 py-1 bg-emerald-500/10 rounded-full">Always Active</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-foreground">Local Cache Persistence</p>
                        <p className="text-[9px] font-medium text-slate-400 uppercase">Buffer telemetry for offline units</p>
                    </div>
                    <Toggle active={settings.encryptionEnabled} onClick={() => setSettings({ encryptionEnabled: !settings.encryptionEnabled })} />
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
           <div className="glass-card p-8 bg-slate-900 text-white space-y-8 relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center space-x-3 text-primary">
                    <HardDrive className="h-6 w-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Unit Resource Stats</span>
                 </div>
                 <div className="space-y-4">
                    <StatItem label="Cache Size" value="2.4 MB" />
                    <StatItem label="Sync Status" value="100% Correct" />
                    <StatItem label="Hub Latency" value="42ms" />
                 </div>
              </div>
           </div>

           <div className="p-8 border-2 border-dashed border-border rounded-[2.5rem] space-y-4">
              <div className="flex items-center space-x-3 text-slate-400">
                 <Lock className="h-5 w-5" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Admin Control</h4>
              </div>
              <p className="text-xs font-medium leading-relaxed text-slate-500">
                Some system-wide parameters are locked by the Institutional Administrator.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: any) {
    return (
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
            <span className="text-white/40">{label}</span>
            <span className="text-primary">{value}</span>
        </div>
    );
}

function Toggle({ active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
            <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1'}`} />
        </button>
    );
}
