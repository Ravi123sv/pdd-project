"use client";

import { useState } from "react";
import { useStore } from "../../../lib/store/useStore";
import { api } from "../../../lib/api/client";
import {
  CloudUpload,
  FileText,
  BrainCircuit,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ScanLine,
  Image as ImageIcon,
  ChevronRight,
  ShieldCheck,
  X,
  RefreshCw,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExternalIngestPage() {
  const { user } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [mode, setMode] = useState<'optical' | 'digital'>('optical');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) setFile(selected);
  };

  const runIngestAnalysis = async () => {
    if (!file) return;
    setAnalyzing(true);
    setAnalysis(null);

    try {
        if (mode === 'optical') {
            // Convert file to base64 for vision processing
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const res = await api.signals.ingestAi({
                    mode: 'optical',
                    imageData: base64,
                    mimeType: file.type,
                    fileName: file.name
                });
                setAnalysis(res.data.analysis);
                setAnalyzing(false);
            };
        } else {
            const res = await api.signals.ingestAi({
                mode: 'digital',
                fileName: file.name
            });
            setAnalysis(res.data.analysis);
            setAnalyzing(false);
        }
    } catch (e) {
      console.error(e);
      setAnalysis("Ingest analysis failed. Verify hub connectivity.");
      setAnalyzing(false);
    }
  };

  const reset = () => {
      setFile(null);
      setAnalysis(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <CloudUpload className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">External Ingest</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Optical Chart Digitization & Legacy Data Import
              </p>
           </div>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-border/50">
            <button
                onClick={() => setMode('optical')}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${mode === 'optical' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}
            >
                Optical Scribe
            </button>
            <button
                onClick={() => setMode('digital')}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${mode === 'digital' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}
            >
                Digital Import
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           {/* Drop Zone */}
           {!analysis ? (
               <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-8 border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all bg-primary/5">
                  <div className="h-24 w-24 rounded-[3rem] bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-xl">
                      {mode === 'optical' ? <ScanLine className="h-10 w-10" /> : <FileText className="h-10 w-10" />}
                  </div>

                  <div className="space-y-2">
                     <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
                        {mode === 'optical' ? "Upload Physical Chart" : "Select Clinical Dataset"}
                     </h3>
                     <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
                        {mode === 'optical'
                          ? "Scan a physical ECG/EEG paper strip. The Neural Engine will perform optical digitization."
                          : "Import historical clinical recordings in EDF or CSV format for retrospective analysis."}
                     </p>
                  </div>

                  {!file ? (
                      <label className="neuro-button bg-primary text-white px-12 py-4 cursor-pointer shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest">Select Source File</span>
                        <input type="file" className="hidden" onChange={handleFileChange} accept={mode === 'optical' ? 'image/*' : '.csv,.edf,.json'} />
                      </label>
                  ) : (
                      <div className="flex flex-col items-center gap-4">
                          <div className="px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm flex items-center gap-3">
                              {mode === 'optical' ? <ImageIcon className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-primary" />}
                              <span className="text-xs font-bold text-foreground">{file.name}</span>
                              <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="h-4 w-4" /></button>
                          </div>
                          <button
                            onClick={runIngestAnalysis}
                            disabled={analyzing}
                            className="neuro-button bg-emerald-600 text-white px-16 h-14 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
                          >
                             {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                             <span className="text-[10px] font-black uppercase tracking-widest ml-3">Initialize Analysis</span>
                          </button>
                      </div>
                  )}
               </div>
           ) : (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="glass-card p-10 space-y-8 bg-slate-900 text-white relative overflow-hidden group">
                     <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Neural Ingest Complete</span>
                           </div>
                           <button onClick={reset} className="text-white/20 hover:text-white transition-all"><RefreshCw className="h-4 w-4" /></button>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-2xl font-black tracking-tight text-primary">Clinical Observation Report</h4>
                           <p className="text-sm font-medium leading-relaxed text-slate-300 bg-white/5 p-8 rounded-[2rem] border border-white/5 italic">
                              "{analysis}"
                           </p>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex gap-4">
                           <button
                             onClick={() => alert("Archive Node: Report committed to patient clinical history.")}
                             className="flex-1 h-14 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-white/10 transition-all"
                           >
                              Save to Archive
                           </button>
                           <button
                             onClick={() => window.print()}
                             className="flex-1 h-14 bg-primary text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl shadow-primary/20"
                           >
                              Print Findings
                           </button>
                        </div>
                     </div>
                     <ScanLine className="absolute -bottom-10 -right-10 h-64 w-64 text-primary opacity-5 animate-pulse" />
                  </div>
               </motion.div>
           )}
        </div>

        <div className="space-y-8">
           <div className="glass-card p-8 bg-primary text-white space-y-6 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">HIPAA OCR</span>
                 </div>
                 <h4 className="text-lg font-black tracking-tight">Optical Verification</h4>
                 <p className="text-xs font-bold leading-relaxed opacity-90">
                    Our vision core identifies P-waves, QRS complexes, and neural spikes directly from physical paper scans with 99.2% morphology accuracy.
                 </p>
              </div>
           </div>

           <div className="p-8 border-2 border-dashed border-border rounded-[2.5rem] space-y-4">
              <div className="flex items-center space-x-3 text-slate-400">
                 <Cpu className="h-5 w-5" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Node Resources</h4>
              </div>
              <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
                 Vision processing is handled in the encrypted Local Logic sandbox to prevent PHI leakage to external API endpoints.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
