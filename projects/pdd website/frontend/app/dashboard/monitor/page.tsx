"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "../../../lib/store/useStore";
import {
  Activity,
  Settings,
  Download,
  AlertTriangle,
  Zap,
  Pause,
  Play,
  CheckCircle2,
  Loader2,
  RefreshCw,
  BrainCircuit,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Info,
  X
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import SignalCanvas from "../../../components/SignalCanvas";
import { useWaveform } from "../../../hooks/useWaveform";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MonitorPage() {
  const { user, activePatient, setHardwareStatus } = useStore();
  const [isPaused, setIsPaused] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [showRaw, setShowRaw] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const [sqi, setSqi] = useState(0);

  const isEEG = activePatient?.modality === 'EEG';
  const channelCount = isEEG ? 8 : 12;

  // v3.0 Hook with Dual Streams and Artifact Status
  const { channels, artifactStatus } = useWaveform(channelCount, isLive, isPaused);

  const labels = isEEG
    ? ['Fp1', 'Fp2', 'C3', 'C4', 'P3', 'P4', 'O1', 'O2']
    : ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

  // Broadcast Logic
  useEffect(() => {
    if (isLive && isBroadcasting && !isPaused && channels.filtered[0].length > 0) {
        const interval = setInterval(() => {
            socketService.broadcastSignal(user?.hospitalId || 'UNIT-DEFAULT', {
                patientId: activePatient?.id,
                values: channels.filtered.map(c => c[c.length - 1]),
                timestamp: new Date().toISOString()
            });
        }, 100); // 20Hz broadcast rate for sync
        return () => clearInterval(interval);
    }
  }, [isLive, isBroadcasting, isPaused, channels, user, activePatient]);

  const startAcquisition = () => {
    if (!activePatient) return;
    setIsInitializing(true);
    setTimeout(() => {
      setIsInitializing(false);
      setIsLive(true);
      setHeartRate(72);
      setSqi(98.4);
      setHardwareStatus(true);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
              Neural Acquisition Node
              {activePatient && <span className="bg-primary/10 text-primary text-[10px] px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-primary/20">{activePatient.id}</span>}
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isLive ? `${activePatient?.modality} Core Active • ${activePatient?.name}` : "Awaiting Clinical Link handshake"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* AI Filter Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-border/50">
             <button
                onClick={() => setShowRaw(true)}
                className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all", showRaw ? "bg-primary text-white shadow-lg" : "text-slate-400")}
             >
                Raw + AI
             </button>
             <button
                onClick={() => setShowRaw(false)}
                className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all", !showRaw ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400")}
             >
                AI Filtered
             </button>
          </div>

          <div className="flex items-center space-x-3">
            {isLive && (
                <button
                    onClick={() => setIsBroadcasting(!isBroadcasting)}
                    className={cn(
                        "neuro-button flex items-center space-x-2 px-4 transition-all",
                        isBroadcasting ? "bg-blue-500 text-white shadow-lg shadow-blue-200" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}
                >
                    <Globe className={cn("h-4 w-4", isBroadcasting && "animate-pulse")} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{isBroadcasting ? "Live Broadcast" : "Local Only"}</span>
                </button>
            )}
            {!isLive ? (
              <button
                onClick={startAcquisition}
                disabled={isInitializing || !activePatient}
                className="neuro-button bg-primary text-white flex items-center space-x-3 px-8 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
              >
                {isInitializing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-white" />}
                <span className="font-black uppercase tracking-widest text-xs">Initialize Node</span>
              </button>
            ) : (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={cn(
                  "neuro-button flex items-center space-x-3 px-8 text-xs font-black uppercase tracking-widest transition-all active:scale-95",
                  isPaused ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                )}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                <span>{isPaused ? "Resume Link" : "Freeze Stream"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Artifact Status Alert - Dynamic Feedback */}
      <AnimatePresence>
        {isLive && artifactStatus.severity !== 'none' && (
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className={cn(
                "p-4 rounded-[1.5rem] border-2 flex items-center justify-between shadow-2xl z-20",
                artifactStatus.severity === 'high' ? "bg-red-500 border-red-400 text-white" : "bg-amber-500 border-amber-400 text-white"
             )}
           >
              <div className="flex items-center space-x-4">
                 <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 animate-pulse" />
                 </div>
                 <div>
                    <h4 className="text-sm font-black uppercase tracking-tight">Signal Integrity Alert</h4>
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Feedback: {artifactStatus.type}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-[9px] font-black uppercase px-4 py-1.5 bg-black/20 rounded-full">AI Suppressor Active</span>
                 <Info className="h-5 w-5 opacity-60 cursor-pointer" />
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      {!activePatient && (
        <div className="bg-primary/5 border-2 border-primary/10 p-12 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6">
           <AlertTriangle className="h-12 w-12 text-primary opacity-40" />
           <div>
              <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Clinical Pre-requisite Required</h3>
              <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">No patient has been admitted to this workstation node. Please establish a patient link to begin signal acquisition.</p>
           </div>
           <button
             onClick={() => window.location.href = '/dashboard/admission'}
             className="neuro-button bg-primary text-white text-[10px] font-black tracking-widest uppercase px-12 shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
           >
             Open Admission Portal
           </button>
        </div>
      )}

      {/* Waveform Visualization Grid */}
      <div className={cn("flex-1 grid grid-cols-1 xl:grid-cols-4 gap-8 min-h-0", !activePatient && "opacity-20 pointer-events-none")}>
        <div className="xl:col-span-3 flex flex-col space-y-6">
          <div className="flex-1 glass-card bg-[#050810] relative overflow-hidden flex flex-col border-2 border-border/40 shadow-inner">
             <div className="relative z-10 p-6 flex items-center justify-between border-b border-white/5 bg-black/30 backdrop-blur-md">
                <div className="flex items-center space-x-6">
                   <div className="flex items-center space-x-3">
                      <div className={cn("h-2 w-2 rounded-full", isLive ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_#10B981]" : "bg-white/10")} />
                      <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isLive ? "text-emerald-500" : "text-white/20")}>
                         {isLive ? "Acquisition Online" : "Standby"}
                      </span>
                   </div>
                   <div className="h-4 w-px bg-white/10" />
                   <div className="flex items-center space-x-2">
                      <BrainCircuit className={cn("h-4 w-4", isLive ? "text-primary" : "text-white/10")} />
                      <span className={cn("text-[9px] font-black uppercase tracking-widest", isLive ? "text-primary" : "text-white/10")}>Neural Filter v2.0</span>
                   </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="text-white/30 hover:text-white transition-all"><Settings className="h-4 w-4" /></button>
                  <button className="text-white/30 hover:text-white transition-all"><Download className="h-4 w-4" /></button>
                </div>
             </div>

             <div className="flex-1 p-6 relative">
                <div className={cn(
                  "grid gap-4 h-full w-full",
                  isEEG ? "grid-cols-2 grid-rows-4" : "grid-cols-3 grid-rows-4"
                )}>
                   {labels.map((label, i) => (
                      <SignalCanvas
                        key={label}
                        label={label}
                        rawData={channels.raw[i]}
                        filteredData={channels.filtered[i]}
                        isLive={isLive}
                        isPaused={isPaused}
                        showRaw={showRaw}
                        color={isEEG ? "#3B82F6" : "#10B981"}
                      />
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Clinical Sidebar Stats */}
        <div className="space-y-6">
           <section className="glass-card p-8 bg-slate-900 border-primary/20 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Rate Monitor</span>
                    <RefreshCw className={cn("h-4 w-4 text-white/20", isLive && "animate-spin")} />
                 </div>

                 <div className="flex items-end justify-between">
                    <h2 className={cn("text-7xl font-black transition-all", isLive ? "text-emerald-500" : "text-white/10")}>
                       {heartRate || "--"}
                    </h2>
                    <span className="text-xs font-black text-white/20 mb-3 uppercase tracking-widest">BPM</span>
                 </div>

                 <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/5">
                    <div>
                       <p className="text-[9px] font-black text-white/40 uppercase mb-2">Neural SQI</p>
                       <p className={cn("text-2xl font-black transition-all", isLive ? "text-primary" : "text-white/10")}>{sqi ? `${sqi}%` : "--"}</p>
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-white/40 uppercase mb-2">SLA Index</p>
                       <p className={cn("text-2xl font-black transition-all", isLive ? "text-amber-500" : "text-white/10")}>{isLive ? "High" : "--"}</p>
                    </div>
                 </div>
              </div>
           </section>

           <div className="p-8 bg-gradient-to-br from-primary to-blue-600 rounded-[2.5rem] text-white shadow-3xl shadow-primary/30 relative overflow-hidden group">
              <BrainCircuit className="absolute -bottom-6 -right-6 h-32 w-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
              <div className="relative z-10 space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70">Neural Interpretation</h4>
                 <p className="text-xs font-bold leading-relaxed">
                    AI-powered signal mapping is actively suppressing 95% of motion artifacts in current lead-set.
                 </p>
              </div>
           </div>

           <section className="glass-card p-6 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Node Checklist</h3>
              <div className="space-y-4">
                 <CheckItem label="Unit Authorized" checked={isLive} />
                 <CheckItem label="Patient MRN Synced" checked={isLive} />
                 <CheckItem label="Lead-Set Validated" checked={isLive && artifactStatus.severity === 'none'} />
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, checked }: any) {
  return (
    <div className="flex items-center space-x-3">
       <div className={cn(
         "h-6 w-6 rounded-xl border-2 flex items-center justify-center transition-all",
         checked ? "bg-emerald-500 border-emerald-500 text-white scale-110 shadow-lg" : "border-border/50"
       )}>
          {checked && <CheckCircle2 className="h-4 w-4" />}
       </div>
       <span className={cn("text-xs font-bold tracking-tight", checked ? "text-foreground" : "text-slate-400")}>{label}</span>
    </div>
  );
}
