"use client";

import { useState } from "react";
import {
  CloudUpload,
  File,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  BrainCircuit,
  FileCode,
  FileJson
} from "lucide-react";

export default function IngestPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        status: 'pending',
        progress: 0,
        id: Math.random().toString(36).substr(2, 9)
      }));
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const simulateUpload = () => {
    setUploading(true);
    // Simulate upload process
    setTimeout(() => {
       setFiles(files.map(f => ({ ...f, status: 'complete', progress: 100 })));
       setUploading(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">External Ingest</h1>
        <p className="text-sm font-medium text-slate-500">Import clinical telemetry and waveform data for AI analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-12 border-2 border-dashed border-border flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-colors relative">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <CloudUpload className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-black text-foreground mb-2">Drop clinical files here</h3>
            <p className="text-xs text-slate-400 font-medium max-w-[240px]">
              Supports .EDF, .CSV, .JSON and NeuroSignal Native fragments
            </p>
          </div>

          {files.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-border flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Queue ({files.length})</span>
                <button onClick={() => setFiles([])} className="text-[10px] font-black text-red-500 uppercase">Clear All</button>
              </div>
              <div className="divide-y divide-border">
                {files.map((f) => (
                  <div key={f.id} className="p-4 flex items-center justify-between bg-white dark:bg-slate-900">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        {f.file.name.endsWith('.json') ? <FileJson className="h-5 w-5" /> : <FileCode className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground truncate max-w-[200px]">{f.file.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{(f.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {f.status === 'complete' ? (
                        <CheckCircle2 className="h-5 w-5 text-secondary" />
                      ) : uploading ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      ) : (
                        <button onClick={() => removeFile(f.id)} className="text-slate-300 hover:text-red-500">
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
                <button
                  onClick={simulateUpload}
                  disabled={uploading || files.every(f => f.status === 'complete')}
                  className="w-full neuro-button bg-primary text-white flex items-center justify-center space-x-2"
                >
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>INITIALIZE UPLINK</span>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="space-y-6">
          <section className="glass-card p-6 bg-slate-900 text-white border-primary/20">
            <div className="flex items-center space-x-3 mb-6">
              <BrainCircuit className="h-6 w-6 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-widest leading-none">Auto-Analysis</h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-medium mb-6">
              The Neural Engine will automatically scan uploaded fragments for artifacts and physiological anomalies.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-[10px] font-black text-white/40 uppercase">
                <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                <span>Format Validation</span>
              </div>
              <div className="flex items-center space-x-3 text-[10px] font-black text-white/40 uppercase">
                <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                <span>Identity Scrubbing</span>
              </div>
              <div className="flex items-center space-x-3 text-[10px] font-black text-white/40 uppercase">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Neural Mapping</span>
              </div>
            </div>
          </section>

          <div className="p-6 rounded-[2rem] border-2 border-amber-500/20 bg-amber-500/5 flex items-start space-x-4">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-xs font-bold text-amber-600 leading-relaxed">
              Ensure all data is anonymized before clinical ingest. PHI violations are logged automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
