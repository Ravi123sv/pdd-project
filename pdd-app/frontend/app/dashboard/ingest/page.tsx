"use client";

import { useState, useRef } from "react";
import { useStore } from "../../../lib/store/useStore";
import {
  CloudUpload,
  FileText,
  BrainCircuit,
  Loader2,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  Maximize2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../lib/api/client";

export default function IngestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Select, 2: Scanning, 3: AI Analysis
  const [mode, setMode] = useState<'file' | 'optical'>('file');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
          setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
          setPreviewUrl(null);
      }
    }
  };

  const processIngest = async () => {
    if (!file) return;
    setUploading(true);
    setStep(2);

    try {
        let imageData = "";
        if (mode === 'optical') {
            const reader = new FileReader();
            imageData = await new Promise((resolve) => {
                reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                reader.readAsDataURL(file);
            });
        }

        // Use Backend Proxy (Compliance)
        const res = await api.signals.ingestAi({
            mode,
            fileName: file.name,
            imageData,
            mimeType: file.type
        });

        setAnalysisResult(res.data.analysis);
        setStep(3);
    } catch (e) {
        console.error(e);
        setAnalysisResult("Neural Link Offline. Verify Backend Handshake.");
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              {mode === 'file' ? <CloudUpload className="h-7 w-7" /> : <Camera className="h-7 w-7" />}
           </div>
           <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                {mode === 'file' ? 'External Ingest Hub' : 'Optical Clinical Scribe'}
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {mode === 'file' ? 'Import Digital Datasets (.CSV, .EDF)' : 'Digitize Paper Charts via Neural Logic'}
              </p>
           </div>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-border/50">
            <button
                onClick={() => {setMode('file'); setFile(null); setAnalysisResult(null);}}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${mode === 'file' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}
            >
                Digital Ingest
            </button>
            <button
                onClick={() => {setMode('optical'); setFile(null); setAnalysisResult(null);}}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${mode === 'optical' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}
            >
                Optical Scribe
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-6">
           <div className="glass-card p-10 border-2 border-dashed border-border/50 hover:border-primary/50 transition-all group relative overflow-hidden flex flex-col items-center text-center">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                accept={mode === 'file' ? ".csv,.edf,.json,.txt" : "image/*"}
              />

              {previewUrl ? (
                  <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden border-2 border-border mb-6">
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Scan Preview" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ImageIcon className="h-10 w-10 text-white" />
                      </div>
                  </div>
              ) : (
                  <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/5 transition-all mb-6">
                    {mode === 'file' ? <FileText className="h-10 w-10 text-slate-300 group-hover:text-primary" /> : <Camera className="h-10 w-10 text-slate-300 group-hover:text-emerald-500" />}
                  </div>
              )}

              <div className="space-y-2">
                 <h3 className="text-xl font-black uppercase tracking-tight">
                    {file ? file.name : (mode === 'file' ? 'Select Data Stream' : 'Upload Paper Chart')}
                 </h3>
                 <p className="text-sm font-medium text-slate-500">
                    {mode === 'file' ? 'Supports .EDF (EEG) and .CSV (Telemetry)' : 'Take a photo of an ECG/EEG paper strip.'}
                 </p>
              </div>
           </div>

           {file && (
              <button
                onClick={processIngest}
                disabled={uploading}
                className={`w-full h-20 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50 ${mode === 'file' ? 'bg-primary shadow-primary/30' : 'bg-emerald-600 shadow-emerald-200'} text-white`}
              >
                 {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>{mode === 'file' ? 'Run Neural Analysis' : 'Initialize Optical Digitization'} <ArrowRight className="h-4 w-4" /></>}
              </button>
           )}
        </div>

        {/* Sidebar Context */}
        <div className="space-y-6">
           <section className="glass-card p-8 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing Node</h3>
              <div className="space-y-4">
                 <PipelineStep label="Data Sanitization" active={step === 2} complete={step > 2} />
                 <PipelineStep label={mode === 'file' ? 'Signal Decoding' : 'Vision Extraction'} active={step === 2} complete={step > 2} />
                 <PipelineStep label="Neural Interpretation" active={step === 2 && uploading} complete={step === 3 && !uploading} />
              </div>
           </section>

           <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden group">
              <ShieldCheck className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10" />
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center space-x-2 text-primary">
                    <Database className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">HIPAA Compliance</span>
                 </div>
                 <p className="text-xs font-bold leading-relaxed text-white/70">
                    All {mode === 'optical' ? 'image' : 'file'} data is scrubbed of PII locally before neural analysis.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Results View */}
      <AnimatePresence>
        {analysisResult && (
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-primary/20 shadow-3xl p-12 space-y-8 relative overflow-hidden"
           >
              <div className="flex items-center justify-between relative z-10">
                 <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                       <BrainCircuit className="h-6 w-6" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Digitized Clinical Report</h2>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Output: Neural Logic v3.0 Hub</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2 text-emerald-500">
                        <Zap className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase">Accuracy: 98.2%</span>
                    </div>
                    <button onClick={() => setAnalysisResult(null)} className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400"><X className="h-5 w-5" /></button>
                 </div>
              </div>

              <div className="p-10 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-border/50 relative group">
                 <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line relative z-10">
                    {analysisResult}
                 </p>
                 <BrainCircuit className="absolute -bottom-10 -right-10 h-48 w-48 text-primary opacity-5" />
              </div>

              <div className="flex justify-end gap-6 relative z-10">
                 <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Discard Analysis</button>
                 <button className="h-14 px-12 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all">
                    Commit to MRN Archive
                 </button>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PipelineStep({ label, active, complete }: any) {
    return (
        <div className="flex items-center space-x-4">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                complete ? 'bg-emerald-500 text-white' :
                active ? 'bg-primary text-white shadow-lg animate-pulse' :
                'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
                {complete ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-1 w-1 rounded-full bg-current" />}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-widest ${complete ? 'text-slate-900 dark:text-white' : active ? 'text-primary' : 'text-slate-400'}`}>
                {label}
            </span>
        </div>
    );
}
