"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "../../../lib/store/useStore";
import {
  Activity,
  Zap,
  Pause,
  Play,
  Loader2,
  BrainCircuit,
  Maximize2,
  X,
  AlertTriangle,
  Settings,
  Download,
  ShieldCheck,
  Eye,
  EyeOff,
  Minimize2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import SignalCanvas from "../../../components/SignalCanvas";
import { useWaveform } from "../../../hooks/useWaveform";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyC7RZJ1g1h_y0b0953pnYlz_Bn6qDD1yBU");

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MonitorPage() {
  const { activePatient, setHardwareStatus } = useStore();
  const [isPaused, setIsPaused] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [showRaw, setShowRaw] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const isEEG = activePatient?.modality === 'EEG';
  const channelCount = isEEG ? 8 : 12;

  // v3.5 Signal Engine: Dual Streams + Live Feedback
  const { channels, artifactStatus } = useWaveform(channelCount, isLive, isPaused);

  const labels = isEEG
    ? ['Fp1', 'Fp2', 'C3', 'C4', 'P3', 'P4', 'O1', 'O2']
    : ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

  const startAcquisition = () => {
    if (!activePatient) return;
    setIsInitializing(true);
    setTimeout(() => {
      setIsInitializing(false);
      setIsLive(true);
      setHeartRate(72);
      setHardwareStatus(true);
    }, 2000);
  };

  const runAiAnalysis = async () => {
    if (!isLive) return;
    setAnalyzing(true);
    setAiReport(null);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Perform a Live Neural Analysis for patient ${activePatient?.name} (${activePatient?.modality}).
      Current Status: ${artifactStatus.type}.
      Based on the high-fidelity waveforms, provide a technical clinical interpretation.
      Roleplay as a senior clinical logic unit. Prepend with [LIVE NEURAL INTERPRETATION].`;

      const result = await model.generateContent(prompt);
      setAiReport(result.response.text());
    } catch (e) {
      setAiReport("Analysis error: Neural unit link timeout.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className={cn(
        "flex flex-col h-full space-y-6 animate-in fade-in duration-700 pb-12",
        isFullscreen && "fixed inset-0 z-[500] bg-[#F8FAFC] dark:bg-[#0F172A] p-6 pb-6 h-screen w-screen space-y-4"
    )}>
      {/* Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
              Clinical Node
              {activePatient && <span className="bg-primary/10 text-primary text-[10px] px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-primary/20">{activePatient.id}</span>}
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isLive ? `${activePatient?.modality} Core Active • ${activePatient?.name}` : "Awaiting Clinical Link handshake"}
            </p>
          </div>
        </div>

          <div className="flex items-center gap-4">
            {isLive && (
                <button
                    onClick={runAiAnalysis}
                    disabled={analyzing}
                    className="neuro-button bg-white dark:bg-slate-800 text-primary border border-primary/20 flex items-center space-x-2 px-6 active:scale-95 transition-all"
                >
                    {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">Neural Analysis</span>
                </button>
            )}

            {/* AI Filter Toggles */}
            {isLive && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-border/50">
                <button
                    onClick={() => setShowRaw(!showRaw)}
                    className={cn("px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2", showRaw ? "bg-rose-500 text-white shadow-lg" : "text-slate-400")}
                >
                    {showRaw ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    Raw Data
                </button>
                <div className="w-px h-4 bg-border/50 mx-1" />
                <button
                    className="px-4 py-2 rounded-xl text-[9px] font-black uppercase bg-primary text-white shadow-lg flex items-center gap-2"
                >
                    <BrainCircuit className="h-3 w-3" />
                    AI Filter
                </button>
              </div>
          )}

          <div className="flex items-center space-x-3">
            {!isLive ? (
              <button
                onClick={startAcquisition}
                disabled={isInitializing || !activePatient}
                className="neuro-button bg-primary text-white flex items-center space-x-3 px-8 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
              >
                {isInitializing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-white" />}
                <span className="font-black uppercase tracking-widest text-xs">Initialize Stream</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="neuro-button h-12 w-12 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-500 hover:text-primary transition-all border border-border/50"
                    title="Fullscreen Monitoring"
                  >
                    {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={cn(
                      "neuro-button flex items-center space-x-3 px-8 text-xs font-black uppercase tracking-widest transition-all active:scale-95",
                      isPaused ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                    )}
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    <span>{isPaused ? "Resume" : "Freeze"}</span>
                  </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Artifact Feedback Alert */}
      <AnimatePresence>
        {isLive && artifactStatus.severity !== 'none' && (
           <motion.div
             initial={{ opacity: 0, scale: 0.95, y: -20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className={cn(
                "p-5 rounded-[2rem] border-2 flex items-center justify-between shadow-2xl z-20 relative overflow-hidden",
                artifactStatus.severity === 'high' ? "bg-red-600 border-red-400 text-white" : "bg-amber-500 border-amber-400 text-white"
             )}
           >
              <div className="flex items-center space-x-5 relative z-10">
                 <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <AlertTriangle className="h-7 w-7 animate-bounce" />
                 </div>
                 <div>
                    <h4 className="text-base font-black uppercase tracking-tight">Clinical Integrity Alert</h4>
                    <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="h-3 w-3" /> FEEDBACK: {artifactStatus.type}
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                 <div className="px-4 py-2 bg-black/20 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                    Neural Suppressor Active (98% Efficiency)
                 </div>
              </div>
              {/* Background Glow */}
              <div className="absolute inset-0 bg-white/5 animate-pulse" />
           </motion.div>
        )}
      </AnimatePresence>

      {!activePatient && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 bg-slate-50 dark:bg-slate-900/50 rounded-[4rem] border-2 border-dashed border-border/50">
           <div className="h-24 w-24 bg-primary/5 rounded-[3rem] flex items-center justify-center">
              <ShieldCheck className="h-12 w-12 text-primary opacity-20" />
           </div>
           <div className="space-y-3">
              <h3 className="text-3xl font-black text-foreground uppercase tracking-tight">Authorization Required</h3>
              <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">No clinical handshake detected. Please admit a patient to the current node to initialize telemetry acquisition.</p>
           </div>
           <button
             onClick={() => window.location.href = '/dashboard/admission'}
             className="neuro-button h-16 bg-primary text-white text-[11px] font-black tracking-[0.3em] uppercase px-16 shadow-3xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
           >
             Proceed to Admission
           </button>
        </div>
      )}

      {/* Waveform Visualization Grid */}
      <div className={cn(
          "flex-1 grid grid-cols-1 xl:grid-cols-4 gap-8 min-h-0",
          !activePatient && "hidden",
          isFullscreen && "xl:grid-cols-1"
      )}>
        <div className={cn("xl:col-span-3 flex flex-col space-y-6", isFullscreen && "xl:col-span-1")}>
          <div className="flex-1 glass-card bg-[#03060c] relative overflow-hidden flex flex-col border-2 border-white/5 shadow-2xl">
             <div className="relative z-10 p-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="flex items-center space-x-8">
                   <div className="flex items-center space-x-3">
                      <div className={cn("h-2.5 w-2.5 rounded-full", isLive ? "bg-emerald-500 animate-pulse shadow-[0_0_15px_#10B981]" : "bg-white/10")} />
                      <span className={cn("text-[11px] font-black uppercase tracking-[0.25em]", isLive ? "text-emerald-500" : "text-white/20")}>
                         {isLive ? "NODE ONLINE" : "STANDBY"}
                      </span>
                   </div>
                   <div className="h-4 w-px bg-white/10 hidden md:block" />
                   <div className="hidden md:flex items-center space-x-3">
                      <BrainCircuit className={cn("h-4.5 w-4.5", isLive ? "text-primary" : "text-white/10")} />
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", isLive ? "text-primary" : "text-white/10")}>Neural Filter v3.5 (Active)</span>
                   </div>
                </div>

                <div className="flex items-center space-x-5">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                     <div className="h-2 w-2 rounded-full bg-blue-500" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Unit: {user?.hospitalId || 'LOCAL-01'}</span>
                  </div>
                  <button onClick={() => alert("Calibration Node: Standardized at 25mm/s")} className="text-white/20 hover:text-white transition-all"><Settings className="h-4.5 w-4.5" /></button>
                  <button onClick={() => alert("Exporting local cache...")} className="text-white/20 hover:text-white transition-all"><Download className="h-4.5 w-4.5" /></button>
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

                <AnimatePresence>
                  {aiReport && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-10 left-10 right-10 p-8 glass-card bg-primary text-white shadow-3xl z-[100] border-2 border-white/20"
                    >
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                             <BrainCircuit className="h-6 w-6" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Interpretation Report</span>
                          </div>
                          <button onClick={() => setAiReport(null)} className="hover:opacity-60 transition-opacity"><X className="h-5 w-5" /></button>
                       </div>
                       <p className="text-sm font-bold leading-relaxed opacity-95 whitespace-pre-line">{aiReport}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </div>

        {/* Clinical Sidebar Stats (Hidden in Fullscreen) */}
        {!isFullscreen && (
            <div className="space-y-6">
               <section className="glass-card p-8 bg-slate-900 border-primary/20 text-white relative overflow-hidden group">
                  <div className="relative z-10 space-y-8">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Rate Monitor</span>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live Sync</span>
                        </div>
                     </div>

                     <div className="flex items-end justify-between">
                        <h2 className={cn("text-7xl font-black transition-all duration-700", isLive ? "text-emerald-500" : "text-white/10")}>
                           {heartRate || "--"}
                        </h2>
                        <span className="text-xs font-black text-white/20 mb-3 uppercase tracking-widest">BPM</span>
                     </div>

                     <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/5">
                        <div>
                           <p className="text-[9px] font-black text-white/40 uppercase mb-2">Neural SQI</p>
                           <p className={cn("text-2xl font-black transition-all", isLive ? "text-primary" : "text-white/10")}>{isLive ? '98.8%' : "--"}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-white/40 uppercase mb-2">SLA Index</p>
                           <p className={cn("text-2xl font-black transition-all", isLive ? "text-amber-500" : "text-white/10")}>{isLive ? "Optimal" : "--"}</p>
                        </div>
                     </div>
                  </div>
                  <Activity className="absolute -bottom-8 -right-8 h-40 w-40 text-primary opacity-5 group-hover:scale-110 transition-transform duration-1000" />
               </section>

               <div className="p-8 bg-gradient-to-br from-primary to-blue-700 rounded-[2.5rem] text-white shadow-3xl shadow-primary/30 relative overflow-hidden group">
                  <BrainCircuit className="absolute -bottom-6 -right-6 h-32 w-32 opacity-15 group-hover:rotate-12 transition-transform duration-700" />
                  <div className="relative z-10 space-y-4">
                     <div className="flex items-center space-x-2">
                        <ShieldCheck className="h-4 w-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">Encryption Node Active</h4>
                     </div>
                     <p className="text-xs font-bold leading-relaxed">
                        Signal packets are currently being encrypted with AES-256 before clinical hub synchronization.
                     </p>
                  </div>
               </div>

               <section className="glass-card p-6 space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Acquisition Checklist</h3>
                  <div className="space-y-4">
                     <CheckItem label="Unit Authorization" checked={isLive} />
                     <CheckItem label="MRN Identity Synced" checked={isLive} />
                     <CheckItem label="Signal Isolation Active" checked={isLive} />
                     <CheckItem label="Lead-Set Integrated" checked={isLive && artifactStatus.severity === 'none'} />
                  </div>
               </section>
            </div>
        )}
      </div>
    </div>
  );
}

function CheckItem({ label, checked }: any) {
  return (
    <div className="flex items-center space-x-3 group">
       <div className={cn(
         "h-6 w-6 rounded-xl border-2 flex items-center justify-center transition-all duration-500",
         checked ? "bg-emerald-500 border-emerald-500 text-white scale-110 shadow-lg shadow-emerald-200" : "border-border/50 group-hover:border-primary/50"
       )}>
          {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
       </div>
       <span className={cn("text-[11px] font-bold tracking-tight transition-colors", checked ? "text-foreground" : "text-slate-400 group-hover:text-slate-600")}>{label}</span>
    </div>
  );
}
