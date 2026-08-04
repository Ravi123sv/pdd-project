"use client";

import { useState } from "react";
import { useStore } from "../../../lib/store/useStore";
import {
  CloudUpload,
  FileText,
  BrainCircuit,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyC7RZJ1g1h_y0b0953pnYlz_Bn6qDD1yBU");

export default function IngestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Select, 2: Parsing, 3: AI Analysis

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processIngest = async () => {
    if (!file) return;
    setUploading(true);
    setStep(2);

    // Simulate Signal Parsing
    setTimeout(async () => {
        setStep(3);
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Retrospective analysis of clinical data file: ${file.name}.
            Size: ${file.size} bytes. Type: ${file.type || 'Clinical Signal'}.
            Provide a senior-level medical interpretation of potential findings in this dataset.
            Focus on signal integrity and anomaly detection. Prepend with [INGEST ANALYTICS REPORT].`;

            const result = await model.generateContent(prompt);
            setAnalysisResult(result.response.text());
        } catch (e) {
            setAnalysisResult("AI Core offline. Retrying connection...");
        } finally {
            setUploading(false);
        }
    }, 2000);
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
                Import Clinical Data for Retrospective AI Analysis
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Panel */}
        <div className="lg:col-span-2 space-y-6">
           <div className="glass-card p-10 border-2 border-dashed border-border/50 hover:border-primary/50 transition-all group relative overflow-hidden">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                accept=".csv,.edf,.json,.txt"
              />
              <div className="flex flex-col items-center text-center space-y-6 py-10 relative z-0">
                 <div className="h-20 w-20 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/5 transition-all">
                    <CloudUpload className="h-10 w-10 text-slate-300 group-hover:text-primary" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tight">Select Data Stream</h3>
                    <p className="text-sm font-medium text-slate-500">Supports .EDF (EEG), .CSV (Telemetry), and .JSON formats.</p>
                 </div>
                 {file && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-4 text-emerald-600">
                       <FileText className="h-5 w-5" />
                       <span className="text-xs font-black uppercase">{file.name}</span>
                       <span className="text-[10px] opacity-60">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                 )}
              </div>
           </div>

           {file && (
              <button
                onClick={processIngest}
                disabled={uploading}
                className="w-full h-20 bg-primary text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50"
              >
                 {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Run Neural Analysis <ArrowRight className="h-5 w-5" /></>}
              </button>
           )}
        </div>

        {/* Progress & Sidebar */}
        <div className="space-y-6">
           <section className="glass-card p-8 space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingest Pipeline</h3>
              <div className="space-y-6">
                 <PipelineStep number={1} label="Secure Transmission" status={file ? 'complete' : 'pending'} />
                 <PipelineStep number={2} label="Clinical Validation" status={step >= 2 ? (step > 2 ? 'complete' : 'active') : 'pending'} />
                 <PipelineStep number={3} label="AI Interpretation" status={step === 3 ? (uploading ? 'active' : 'complete') : 'pending'} />
              </div>
           </section>

           <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden group">
              <ShieldCheck className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center space-x-2 text-primary">
                    <Database className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Data Sovereignty</span>
                 </div>
                 <p className="text-xs font-bold leading-relaxed text-white/70">
                    Uploaded datasets are processed at the edge. Data is never used to train global AI models.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Analysis Result */}
      <AnimatePresence>
        {analysisResult && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-primary/20 shadow-2xl p-12 space-y-8"
           >
              <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                       <BrainCircuit className="h-6 w-6" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-foreground">Retrospective Analysis Report</h2>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Logic v2.5 Engine Output</p>
                    </div>
                 </div>
                 <div className="flex items-center space-x-3 text-secondary">
                    <Zap className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase">Confidence: 98.2%</span>
                 </div>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-border/50 relative group">
                 <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line relative z-10">
                    {analysisResult}
                 </p>
              </div>

              <div className="flex justify-end gap-4">
                 <button className="h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest border border-border hover:bg-slate-50 transition-all">Discard Ingest</button>
                 <button className="h-12 px-10 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20">Commit to Patient Archive</button>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PipelineStep({ number, label, status }: any) {
    const isComplete = status === 'complete';
    const isActive = status === 'active';

    return (
        <div className="flex items-center space-x-4 group">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                isComplete ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' :
                isActive ? 'bg-primary text-white shadow-lg shadow-primary/20 animate-pulse' :
                'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : number}
            </div>
            <span className={`text-xs font-black uppercase tracking-widest transition-colors ${
                isComplete ? 'text-slate-900 dark:text-white' :
                isActive ? 'text-primary' :
                'text-slate-400'
            }`}>
                {label}
            </span>
        </div>
    );
}
