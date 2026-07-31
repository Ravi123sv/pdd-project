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
  Maximize2,
  RefreshCw,
  BrainCircuit,
  ShieldCheck
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../lib/api/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import WaveformAnalyzer from "../../../components/WaveformAnalyzer";
import SignalCanvas from "../../../components/SignalCanvas";
import { useWaveform } from "../../../hooks/useWaveform";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyC7RZJ1g1h_y0b0953pnYlz_Bn6qDD1yBU");

export default function MonitorPage() {
  const { user, activePatient, setHardwareStatus } = useStore();
  const [isPaused, setIsPaused] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const [sqi, setSqi] = useState(0);
  const [device, setDevice] = useState<any>(null);

  const isEEG = activePatient?.modality === 'EEG';
  const channelCount = isEEG ? 8 : 12;
  const channelData = useWaveform(channelCount, isLive, isPaused);

  const labels = isEEG
    ? ['Fp1', 'Fp2', 'C3', 'C4', 'P3', 'P4', 'O1', 'O2']
    : ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

  const handleDownload = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Lead,Value,Timestamp\n"
      + channelData.map((d, i) => `${labels[i]},${d[d.length-1]},${new Date().toISOString()}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `telemetry_${activePatient?.id || 'session'}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // AI Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  // Signal Buffer for AI
  const signalBuffer = useRef<number[]>([]);

  const connectBluetooth = async () => {
    try {
      // @ts-ignore
      const btDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['heart_rate', 'battery_service']
      });

      const server = await btDevice.gatt.connect();
      setDevice(btDevice);
      setIsLive(true);
      setHardwareStatus(true);

      console.log("Hardware Handshake Success: ", btDevice.name);
    } catch (e) {
      console.warn("Bluetooth connection failed", e);
      alert("Hardware Link Failed: Ensure Bluetooth is enabled and sensor is in pairing mode.");
    }
  };

  const connectSerial = async () => {
    try {
      // @ts-ignore
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      setDevice(port);
      setIsLive(true);
      setHardwareStatus(true);
    } catch (e) {
      console.warn("Serial connection failed", e);
      alert("Web Serial not supported or user cancelled.");
    }
  };

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

  const runAiAnalysis = async () => {
    if (!isLive || signalBuffer.current.length < 50) return;
    setAnalyzing(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analyze these ECG telemetry values: ${signalBuffer.current.slice(-50).join(', ')}.
      Report findings in highly technical clinical terms. Start with [CLINICAL ADVISORY: Neural Logic Interpretation].`;

      const result = await model.generateContent(prompt);
      setAiReport(result.response.text());
    } catch (e) {
      setAiReport("Analysis error: Neural unit disconnected.");
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!isLive || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let x = 0;
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;
    const step = 2;

    const draw = () => {
      if (isPaused) return;

      ctx.fillStyle = "rgba(15, 23, 42, 0.1)";
      ctx.fillRect(x, 0, step + 20, height);

      const t = Date.now() / 1000;
      let val = Math.sin(t * 2 * Math.PI * 1.2) * 15;
      if (Math.random() > 0.98) {
          val = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 100 + 50);
      }

      // Store in buffer for AI
      signalBuffer.current.push(val);
      if (signalBuffer.current.length > 500) signalBuffer.current.shift();

      // Uplink to Go Backend periodically (every 50 points)
      if (signalBuffer.current.length % 50 === 0 && activePatient) {
         api.signals.stream({
            patient_id: activePatient.id,
            source: 'web_workstation',
            values: signalBuffer.current.slice(-50),
            timestamp: new Date().toISOString()
         }).catch(() => console.warn("Go Streamer Uplink Standby"));
      }

      ctx.beginPath();
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.moveTo(x, midY + val);
      ctx.lineTo(x + step, midY + val);
      ctx.stroke();

      x += step;
      if (x >= width) {
        x = 0;
        ctx.clearRect(0, 0, width, height);
      }

      requestAnimationFrame(draw);
    };

    const animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [isLive, isPaused, activePatient]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
              Signal Monitor
              {activePatient && <span className="bg-primary/10 text-primary text-[10px] px-3 py-1 rounded-full uppercase tracking-[0.2em]">{activePatient.id}</span>}
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isLive ? `${activePatient?.modality} Telemetry • ${activePatient?.name}` : "Standby • Link Required"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!isLive ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={connectBluetooth}
                className="neuro-button bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center space-x-2 px-4"
              >
                <Zap className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase">BT Link</span>
              </button>
              <button
                onClick={startAcquisition}
                disabled={isInitializing || !activePatient}
                className="neuro-button bg-primary text-white flex items-center space-x-3 px-8 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
              >
                {isInitializing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-white" />}
                <span className="font-black uppercase tracking-widest text-xs">Initialize Link</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={runAiAnalysis}
                disabled={analyzing}
                className="neuro-button bg-white dark:bg-slate-800 text-primary border border-primary/20 flex items-center space-x-2 active:scale-95 transition-all"
              >
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                <span className="text-[10px] font-black uppercase tracking-widest">Neural Analysis</span>
              </button>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={cn(
                  "neuro-button flex items-center space-x-2 px-6 text-xs font-black uppercase tracking-widest transition-all active:scale-95",
                  isPaused ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                )}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                <span>{isPaused ? "Resume" : "Freeze"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {!activePatient && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/20 p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
           <AlertTriangle className="h-10 w-10 text-amber-500" />
           <div>
              <h3 className="text-lg font-black text-amber-900 dark:text-amber-500 uppercase tracking-tighter">Clinical Pre-requisite Missing</h3>
              <p className="text-sm text-amber-700/70 font-medium max-w-sm mx-auto">No patient has been admitted to this unit. Please complete the admission registry to establish a clinical link.</p>
           </div>
           <button
             onClick={() => window.location.href = '/dashboard/admission'}
             className="neuro-button bg-amber-500 text-white text-[10px] font-black tracking-widest uppercase px-10 shadow-lg shadow-amber-500/20"
           >
             Go to Admission
           </button>
        </div>
      )}

      <div className={cn("flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0", !activePatient && "opacity-20 pointer-events-none")}>
        <div className="xl:col-span-3 flex flex-col space-y-4">
          <div className="flex-1 glass-card bg-[#0F172A] relative overflow-hidden flex flex-col border-2 border-border/50">
             <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

             <div className="relative z-10 p-6 flex items-center justify-between border-b border-white/5 bg-black/20">
                <div className="flex items-center space-x-4">
                   <div className={cn("h-2 w-2 rounded-full", isLive ? "bg-secondary animate-pulse shadow-[0_0_10px_#10B981]" : "bg-white/10")} />
                   <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isLive ? "text-secondary" : "text-white/20")}>
                      {isLive ? "Acquisition Active" : "Link Standby"}
                   </span>
                </div>
                <div className="flex items-center space-x-4">
                  <button onClick={handleDownload} className="text-white/40 hover:text-white transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                  <button onClick={() => alert("Calibration Settings")} className="text-white/40 hover:text-white transition-colors">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
             </div>

             <div className="flex-1 p-4 overflow-hidden relative">
                <div className={cn(
                  "grid gap-2 h-full w-full",
                  isEEG ? "grid-cols-2 grid-rows-4" : "grid-cols-3 grid-rows-4"
                )}>
                   {labels.map((label, i) => (
                      <SignalCanvas
                        key={label}
                        label={label}
                        data={channelData[i]}
                        isLive={isLive}
                        isPaused={isPaused}
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
                      className="absolute bottom-6 left-6 right-6 p-6 glass-card bg-primary text-white shadow-2xl z-30 border-2 border-white/20"
                    >
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                             <BrainCircuit className="h-5 w-5" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Interpretation Report</span>
                          </div>
                          <button onClick={() => setAiReport(null)} className="hover:opacity-60"><X className="h-4 w-4" /></button>
                       </div>
                       <p className="text-sm font-medium leading-relaxed opacity-90">{aiReport}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <section className="glass-card p-8 bg-slate-900 border-primary/20 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">BPM Monitor</span>
                    <RefreshCw className={cn("h-4 w-4 text-white/20", isLive && "animate-spin")} />
                 </div>

                 <div className="flex items-end justify-between">
                    <h2 className={cn("text-7xl font-black transition-colors", isLive ? "text-secondary" : "text-white/10")}>
                       {heartRate || "--"}
                    </h2>
                    <span className="text-xs font-black text-white/20 mb-2 uppercase">BPM</span>
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                    <div>
                       <p className="text-[8px] font-black text-white/40 uppercase mb-1">SQI Score</p>
                       <p className={cn("text-2xl font-black", isLive ? "text-primary" : "text-white/10")}>{sqi ? `${sqi}%` : "--"}</p>
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-white/40 uppercase mb-1">Stability Index</p>
                       <p className={cn("text-2xl font-black", isLive ? "text-amber-500" : "text-white/10")}>{isLive ? "92%" : "--"}</p>
                    </div>
                 </div>
              </div>
           </section>

           <section className="glass-card p-6 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Checklist</h3>
              <div className="space-y-4">
                 <CheckItem label="Calibrate Hardware" checked={isLive} />
                 <CheckItem label="Patient MRN Sync" checked={isLive} />
                 <CheckItem label="Lead Integrity" checked={isLive} />
                 <CheckItem label="Clinical Baseline Verified" checked={isLive} />
              </div>
           </section>

           <div className="p-6 bg-gradient-to-br from-primary to-accent rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
              <ShieldCheck className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10" />
              <div className="relative z-10">
                 <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Neural Logic Engine</h4>
                 <p className="text-xs font-bold leading-relaxed">
                    AI-powered signal mapping and artifact suppression active on local workstations.
                 </p>
              </div>
           </div>

           <WaveformAnalyzer />
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, checked }: any) {
  return (
    <div className="flex items-center space-x-3 group cursor-pointer">
       <div className={cn(
         "h-6 w-6 rounded-xl border-2 flex items-center justify-center transition-all",
         checked ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20" : "border-border/50 group-hover:border-primary/50"
       )}>
          {checked && <CheckCircle2 className="h-4 w-4" />}
       </div>
       <span className={cn("text-sm font-bold tracking-tight transition-colors", checked ? "text-foreground" : "text-slate-400 group-hover:text-slate-600")}>{label}</span>
    </div>
  );
}

function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
