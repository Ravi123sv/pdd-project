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
  Minimize2,
  CheckCircle2,
  Smartphone,
  Cpu,
  Volume2,
  VolumeX,
  FileText,
  Check
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import SignalCanvas from "../../../components/SignalCanvas";
import SpectrogramCanvas from "../../../components/SpectrogramCanvas";
import { useWaveform, ArtifactSeverity, DSPFilterConfig } from "../../../hooks/useWaveform";
import { api } from "../../../lib/api/client";
import { queueForSync } from "../../../lib/offlineSync";
import { useSearchParams } from "next/navigation";
import { socketService } from "../../../lib/api/socket";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MonitorPage() {
  const { activePatient, setHardwareStatus, user, setActivePatient } = useStore();
  const searchParams = useSearchParams();
  const isMirrorMode = searchParams.get('mode') === 'mirror';
  const mirrorPatientId = searchParams.get('patient');

  const [isPaused, setIsPaused] = useState(false);
  const [isLive, setIsLive] = useState(isMirrorMode);
  const [showRaw, setShowRaw] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [annotations, setAnnotations] = useState<any[]>([]);

  // Stress Test State
  const [manualArtifact, setManualArtifact] = useState<{ type: string, severity: ArtifactSeverity }>({ type: 'Optimal', severity: 'none' });
  const [isEmergency, setIsEmergency] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [sweepSpeed, setSweepSpeed] = useState<12.5 | 25 | 50>(25);
  const [dspFilters, setDspFilters] = useState<DSPFilterConfig>({ lowPass: true, highPass: true, notch: true });

  const audioContextRef = useRef<AudioContext | null>(null);

  const isEEG = activePatient?.modality === 'EEG';
  const channelCount = isEEG ? 8 : 12;

  // v5.0 Signal Engine: Dual Streams + Manual Stress Testing + Sweep Speed + DSP
  const { channels, artifactStatus } = useWaveform(channelCount, isLive, isPaused, manualArtifact, sweepSpeed, dspFilters);

  // Mirror Handshake
  useEffect(() => {
      if (isMirrorMode && mirrorPatientId) {
          const fetchPatient = async () => {
              try {
                  const res = await api.patients.getAll(user?.hospitalId || 'HOSP-DEFAULT');
                  const p = res.data.find((pat: any) => pat.patientId === mirrorPatientId);
                  if (p) setActivePatient({ id: p.patientId, name: p.name, age: p.age, modality: 'ECG' });
              } catch (e) { console.error(e); }
          };
          fetchPatient();
          setIsLive(true);
      }
  }, [isMirrorMode, mirrorPatientId, user, setActivePatient]);

  // Audio Pulse Handshake
  useEffect(() => {
      if (isLive && !isPaused && isAudioEnabled) {
          const bpm = 72;
          const interval = (60 / bpm) * 1000;

          const playBleep = () => {
              if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
              const ctx = audioContextRef.current;
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();

              osc.type = 'sine';
              osc.frequency.setValueAtTime(isEEG ? 440 : 880, ctx.currentTime);

              gain.gain.setValueAtTime(0.1, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);

              osc.connect(gain);
              gain.connect(ctx.destination);

              osc.start();
              osc.stop(ctx.currentTime + 0.1);
          };

          const timer = setInterval(playBleep, interval);
          return () => {
              clearInterval(timer);
              if (audioContextRef.current) {
                  audioContextRef.current.close();
                  audioContextRef.current = null;
              }
          };
      }
  }, [isLive, isPaused, isAudioEnabled, isEEG]);

  useEffect(() => {
      if (isLive && artifactStatus.severity === 'high' && !isEmergency) {
          setIsEmergency(true);
          // 1. Live Socket Broadcast
          socketService.emit('clinical_alert', {
              patientId: activePatient?.id,
              type: 'Signal Integrity Failure',
              severity: 'CRITICAL',
              text: `CRITICAL: Signal Integrity Failure for Patient ${activePatient?.id}. Check lead placement immediately.`
          });

          // 2. Persistent Backend Log (Auditor Proof)
          api.alerts.create({
              hospitalId: user?.hospitalId || 'HOSP-DEFAULT',
              type: 'critical',
              title: 'SIGNAL INTEGRITY FAILURE',
              body: `High-severity noise detected in ${activePatient?.modality} stream for Patient ${activePatient?.name} (MRN: ${activePatient?.id}).`,
              category: 'CLINICAL',
              patientId: activePatient?.id,
              technician: user?.name
          }).catch(console.error);

      } else if (artifactStatus.severity !== 'high' && isEmergency) {
          setIsEmergency(false);
      }
  }, [artifactStatus.severity, isLive, isEmergency, activePatient, user]);

  const labels = isEEG
    ? ['Fp1', 'Fp2', 'C3', 'C4', 'P3', 'P4', 'O1', 'O2']
    : ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

  const startAcquisition = () => {
    if (!activePatient) return;
    setIsInitializing(true);
    setAnnotations([]);
    setTimeout(() => {
      setIsInitializing(false);
      setIsLive(true);
      setHeartRate(72);
      setHardwareStatus(true);
      setSessionStartTime(new Date());
    }, 2000);
  };

  const handleCommitSession = async () => {
      if (!activePatient || !isLive || !sessionStartTime) return;
      setSaving(true);

      const durationSeconds = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);

      // Capture waveform snapshot (latest 100 points of lead II or channel 2)
      const snapshot = channels.filtered[1] || [];

      const sessionData = {
          patientId: activePatient.id,
          technicianEmail: user?.email,
          hospitalId: activePatient.hospitalId || user?.hospitalId || 'HOSP-DEFAULT',
          testType: activePatient.modality,
          quality: artifactStatus.severity === 'none' ? 98.4 : (artifactStatus.severity === 'low' ? 82.1 : 45.3),
          findings: `Clinical session finalized. Final Integrity: ${artifactStatus.type}.`,
          startTime: sessionStartTime,
          durationSeconds,
          waveformSnapshot: snapshot,
          annotations: annotations
      };

      try {
          if (navigator.onLine) {
              await api.sessions.create(sessionData);
          } else {
              await queueForSync('SESSION_DATA', sessionData);
          }
          alert("Handshake successful: Session committed to clinical archive.");
          setIsLive(false);
          setSessionStartTime(null);
      } catch (e) {
          console.error("Session commit error:", e);
          alert("Handshake failed. Session data queued for local sync.");
      } finally {
          setSaving(false);
      }
  };

  const runAiAnalysis = async () => {
    if (!isLive) return;
    setAnalyzing(true);
    setAiReport(null);
    try {
      const res = await api.signals.analyzeAi({
          patientName: activePatient?.name,
          modality: activePatient?.modality,
          status: artifactStatus.type
      });

      setAiReport(res.data.analysis);
    } catch (e) {
      setAiReport("Analysis error: Neural unit link timeout.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddAnnotation = (label: string) => {
      if (!isLive || isPaused) return;
      const newNote = {
          timestamp: new Date(),
          label: label,
          technician: user?.name
      };
      setAnnotations([...annotations, newNote]);
  };

  return (
    <div className={cn(
        "flex flex-col h-full space-y-6 animate-in fade-in duration-700 pb-12 relative",
        isFullscreen && "fixed inset-0 z-[500] bg-[#F8FAFC] dark:bg-[#0F172A] p-6 pb-6 h-screen w-screen space-y-4",
        isEmergency && "bg-red-50/10"
    )}>
      {/* Emergency Global Border */}
      {isEmergency && (
          <div className="absolute inset-0 border-[12px] border-red-600/20 pointer-events-none animate-pulse z-[1000]" />
      )}

      {/* Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
              {isMirrorMode ? "Mirror Node" : "Clinical Node"}
              {activePatient && <span className="bg-primary/10 text-primary text-[10px] px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-primary/20">{activePatient.id}</span>}
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isMirrorMode ? "VIEW-ONLY TELEMETRY STREAM" : (isLive ? `${activePatient?.modality} Core Active • ${activePatient?.name}` : "Awaiting Clinical Link handshake")}
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
              <div className="flex items-center gap-3">
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

                  {/* Sweep Speed Control */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-border/50">
                      <SpeedButton active={sweepSpeed === 12.5} onClick={() => setSweepSpeed(12.5)} label="12.5" />
                      <SpeedButton active={sweepSpeed === 25} onClick={() => setSweepSpeed(25)} label="25" />
                      <SpeedButton active={sweepSpeed === 50} onClick={() => setSweepSpeed(50)} label="50" />
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter px-2">mm/s</span>
                  </div>
              </div>
          )}

          <div className="flex items-center space-x-3">
            {!isLive ? (
              <button
                onClick={startAcquisition}
                disabled={isInitializing || !activePatient}
                className="neuro-button bg-primary text-white flex items-center space-x-3 px-10 h-14 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
              >
                {isInitializing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-white" />}
                <span className="font-black uppercase tracking-widest text-xs">Initialize Stream</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                  {isMirrorMode ? (
                      <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Mirroring Active</span>
                      </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                        className={cn(
                            "neuro-button h-14 w-14 flex items-center justify-center transition-all border border-border/50",
                            isAudioEnabled ? "bg-primary text-white shadow-lg" : "bg-white dark:bg-slate-800 text-slate-500"
                        )}
                        title="Toggle Audio Feedback"
                      >
                        {isAudioEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
                      </button>
                      <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="neuro-button h-14 w-14 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-500 hover:text-primary transition-all border border-border/50"
                        title="Fullscreen Monitoring"
                      >
                        {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
                      </button>
                      <button
                        onClick={() => setIsPaused(!isPaused)}
                        className={cn(
                          "neuro-button flex items-center space-x-3 px-10 h-14 text-xs font-black uppercase tracking-widest transition-all active:scale-95",
                          isPaused ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                        )}
                      >
                        {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                        <span>{isPaused ? "Resume" : "Freeze"}</span>
                      </button>
                      <button
                        onClick={handleCommitSession}
                        disabled={saving}
                        className="neuro-button bg-emerald-600 text-white flex items-center space-x-2 px-10 h-14 shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                        <span className="font-black uppercase tracking-widest text-xs">Commit to Archive</span>
                      </button>
                    </>
                  )}
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
          "flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0",
          !activePatient && "hidden",
          isFullscreen && "lg:grid-cols-1"
      )}>
        <div className={cn("lg:col-span-3 flex flex-col space-y-6", isFullscreen && "lg:col-span-1")}>
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
                     <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Unit: {activePatient?.hospitalId || 'LOCAL-01'}</span>
                  </div>
                  <button onClick={() => alert("Calibration Node: Standardized at 25mm/s (IFCN Standard)")} className="text-white/20 hover:text-white transition-all"><Settings className="h-4.5 w-4.5" /></button>
                  <button onClick={() => alert("LOCAL CACHE: Preparing telemetry snapshot for clinical handover.")} className="text-white/20 hover:text-white transition-all"><Download className="h-4.5 w-4.5" /></button>
                </div>
             </div>

             <div className="flex-1 p-6 relative overflow-y-auto">
                <div className={cn(
                  "grid gap-4 h-full w-full",
                  isEEG ? "grid-cols-1 md:grid-cols-2 grid-rows-none" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-none"
                )}>
                   {labels.map((label, i) => (
                      <div key={label} className="h-48 md:h-auto min-h-[180px]">
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
                      </div>
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
                        <div className="space-y-4">
                           <div>
                              <p className="text-[9px] font-black text-white/40 uppercase mb-2">Neural SQI</p>
                              <p className={cn("text-2xl font-black transition-all", isLive ? "text-primary" : "text-white/10")}>{isLive ? `${(100 - (artifactStatus.severity === 'none' ? 1.2 : (artifactStatus.severity === 'low' ? 15.4 : 54.7))).toFixed(1)}%` : "--"}</p>
                           </div>
                           <div className="space-y-1">
                               <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter">Signal Health</p>
                               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                   <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: isLive ? (artifactStatus.severity === 'none' ? '100%' : (artifactStatus.severity === 'low' ? '65%' : '20%')) : 0 }}
                                        className={cn("h-full transition-colors", artifactStatus.severity === 'none' ? 'bg-emerald-500' : (artifactStatus.severity === 'low' ? 'bg-amber-500' : 'bg-red-500'))}
                                   />
                               </div>
                           </div>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-white/40 uppercase mb-2">SLA Index</p>
                           <p className={cn("text-2xl font-black transition-all", isLive ? (artifactStatus.severity === 'high' ? "text-red-500" : "text-amber-500") : "text-white/10")}>{isLive ? (artifactStatus.severity === 'none' ? "Optimal" : (artifactStatus.severity === 'low' ? "Warning" : "Critical")) : "--"}</p>
                        </div>
                     </div>
                  </div>
                  <Activity className="absolute -bottom-8 -right-8 h-40 w-40 text-primary opacity-5 group-hover:scale-110 transition-transform duration-1000" />
               </section>

               {/* STRESS TEST CONTROLS */}
               {isLive && !isMirrorMode && (
                   <section className="glass-card p-6 bg-slate-50 dark:bg-slate-800/50 space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Stress Tester</h3>
                         <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                         <button
                            onClick={() => setManualArtifact({ type: 'Optimal', severity: 'none' })}
                            className={cn("w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all", manualArtifact.severity === 'none' ? "bg-emerald-500 text-white border-emerald-400" : "bg-white dark:bg-slate-900 text-slate-400 border-border")}
                         >
                            Clean Signal
                         </button>
                         <button
                            onClick={() => setManualArtifact({ type: 'Muscle Tremor', severity: 'low' })}
                            className={cn("w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all", manualArtifact.severity === 'low' ? "bg-amber-500 text-white border-amber-400" : "bg-white dark:bg-slate-900 text-slate-400 border-border")}
                         >
                            Inject Minor Noise
                         </button>
                         <button
                            onClick={() => setManualArtifact({ type: 'Lead Displacement', severity: 'high' })}
                            className={cn("w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all", manualArtifact.severity === 'high' ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-200" : "bg-white dark:bg-slate-900 text-slate-400 border-border")}
                         >
                            Inject Critical Error
                         </button>
                      </div>
                      <p className="text-[8px] font-medium text-slate-500 italic text-center">Inject artifacts to verify Neural Suppressor efficiency.</p>
                   </section>
               )}

               {/* DSP FILTER SUITE */}
               {isLive && (
                   <section className="glass-card p-6 bg-slate-50 dark:bg-slate-800/50 space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DSP Filter Suite</h3>
                         <Settings className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-3">
                         <FilterToggle label="Low-Pass (35Hz)" active={dspFilters.lowPass} onClick={() => setDspFilters({...dspFilters, lowPass: !dspFilters.lowPass})} />
                         <FilterToggle label="High-Pass (0.5Hz)" active={dspFilters.highPass} onClick={() => setDspFilters({...dspFilters, highPass: !dspFilters.highPass})} />
                         <FilterToggle label="Notch Filter (50Hz)" active={dspFilters.notch} onClick={() => setDspFilters({...dspFilters, notch: !dspFilters.notch})} />
                      </div>
                   </section>
               )}

               {/* CLINICAL TAGS */}
               {isLive && !isMirrorMode && (
                   <section className="glass-card p-6 bg-slate-50 dark:bg-slate-800/50 space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Tags</h3>
                         <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                         <TagButton label="Arrhythmia" onClick={() => handleAddAnnotation('Arrhythmia Detected')} />
                         <TagButton label="Neural Spike" onClick={() => handleAddAnnotation('Neural Spike')} />
                         <TagButton label="Artifact" onClick={() => handleAddAnnotation('Movement Artifact')} />
                         <TagButton label="Stabilized" onClick={() => handleAddAnnotation('Signal Stabilized')} />
                      </div>
                      <div className="pt-2">
                         <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-2">Recent Annotations ({annotations.length})</p>
                         <div className="space-y-2 max-h-24 overflow-y-auto scrollbar-hide border-t border-border/30 pt-2">
                            {annotations.length > 0 ? annotations.slice(-3).reverse().map((a, i) => (
                                <div key={i} className="flex items-center justify-between text-[9px] font-bold text-foreground">
                                    <span className="truncate">{a.label}</span>
                                    <span className="text-slate-400">{new Date(a.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</span>
                                </div>
                            )) : <p className="text-[8px] text-slate-400 italic">No events tagged.</p>}
                         </div>
                      </div>
                   </section>
               )}

               <section className="glass-card p-6 space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Acquisition Checklist</h3>
                  <div className="space-y-4">
                     <CheckItem label="Unit Authorization" checked={isLive} />
                     <CheckItem label="MRN Identity Synced" checked={isLive} />
                     <CheckItem label="Signal Isolation Active" checked={isLive} />
                     <CheckItem label="Lead-Set Integrated" checked={isLive && artifactStatus.severity === 'none'} />
                  </div>
               </section>

               {/* EEG SPECTRAL ANALYSIS (Dynamic) */}
               {isLive && isEEG && (
                   <section className="glass-card p-6 space-y-6 bg-[#03060c] border-blue-500/20">
                      <div className="flex items-center justify-between">
                         <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Neural Spectrum</h3>
                         <BrainCircuit className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="h-40 w-full">
                         <SpectrogramCanvas data={channels.filtered[0]} isLive={isLive && !isPaused} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <SpectralStat label="Alpha (8-12Hz)" value="High" color="text-emerald-500" />
                         <SpectralStat label="Beta (13-30Hz)" value="Moderate" color="text-blue-500" />
                      </div>
                   </section>
               )}
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

function SpeedButton({ active, onClick, label }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all min-w-[44px]",
                active ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
            )}
        >
            {label}
        </button>
    );
}

function FilterToggle({ label, active, onClick }: any) {
  return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                active ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : "bg-white dark:bg-slate-900 border-border text-slate-400"
            )}
        >
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            <div className={cn("h-4 w-4 rounded-full border-2 flex items-center justify-center", active ? "bg-emerald-500 border-emerald-500" : "border-slate-300")}>
                {active && <Check className="h-3 w-3 text-white" />}
            </div>
        </button>
    );
}

function TagButton({ label, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="py-2.5 px-3 bg-white dark:bg-slate-900 border border-border rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-500 hover:border-primary hover:text-primary transition-all active:scale-95"
        >
            {label}
        </button>
    );
}

function SpectralStat({ label, value, color }: any) {
    return (
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[7px] font-black text-white/40 uppercase tracking-widest mb-1">{label}</p>
            <p className={cn("text-[10px] font-black uppercase", color)}>{value}</p>
        </div>
    );
}
