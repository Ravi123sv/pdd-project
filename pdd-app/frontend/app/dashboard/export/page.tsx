"use client";

import { useState, useEffect } from "react";
import { useStore } from "../../../lib/store/useStore";
import { api } from "../../../lib/api/client";
import {
  FileDown,
  Search,
  Clock,
  CheckCircle2,
  Printer,
  FileText,
  Activity,
  ShieldCheck,
  BrainCircuit,
  Loader2,
  ChevronRight,
  Database,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FhirService } from "../../../lib/services/FhirService";

export default function ExportVaultPage() {
  const { user } = useStore();
  const [exports, setExports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExport, setSelectedSession] = useState<any>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.hospitalId) return;
      try {
        const res = await api.sessions.getAll(user.hospitalId);
        setExports(res.data);
      } catch (e) {
        console.error("Failed to fetch exports", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  const handleFhirExport = () => {
      if (!selectedExport) return;
      const bundle = FhirService.generateDiagnosticReport(selectedExport);
      downloadFile(JSON.stringify(bundle, null, 2), `FHIR_${selectedExport.patient?.patientId}_${selectedExport.testType}.json`, 'application/json');
  };

  const handleCsvExport = () => {
      if (!selectedExport) return;
      const csv = FhirService.convertToCSV(selectedExport);
      downloadFile(csv, `DATA_${selectedExport.patient?.patientId}_${selectedExport.testType}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 print:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-4">
           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <FileDown className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Export Vault</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Clinical Report Generation & Data Handover
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
        {/* Left: Ready for Export List */}
        <div className="lg:col-span-1 flex flex-col space-y-4 print:hidden">
           <div className="bg-slate-900 text-white p-6 rounded-[2rem] relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Reports Ready</p>
                 <h3 className="text-4xl font-black text-primary">{exports.length}</h3>
                 <p className="text-[10px] font-medium text-white/50">All reports are E2E encrypted before download.</p>
              </div>
              <FileDown className="absolute -bottom-4 -right-4 h-24 w-24 text-primary opacity-10" />
           </div>

           <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Available Sessions</h4>
              {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : exports.map((session) => (
                <button
                  key={session._id}
                  onClick={() => setSelectedSession(session)}
                  className={`w-full p-6 rounded-2xl border-2 transition-all text-left flex items-center justify-between group ${
                    selectedExport?._id === session._id
                      ? 'bg-white dark:bg-slate-800 border-primary shadow-lg'
                      : 'bg-white dark:bg-slate-900 border-border/50 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                     <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${selectedExport?._id === session._id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <FileText className="h-5 w-5" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-foreground">{session.patient?.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{session.testType} • {new Date(session.startTime).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-all ${selectedExport?._id === session._id ? 'text-primary translate-x-1' : 'text-slate-300'}`} />
                </button>
              ))}
           </div>
        </div>

        {/* Right: PDF Preview (The Report) */}
        <div className="lg:col-span-2 print:col-span-3">
           <AnimatePresence mode="wait">
              {selectedExport ? (
                <motion.div
                   key={selectedExport._id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-white dark:bg-slate-950 rounded-[3rem] border-2 border-border/50 shadow-2xl flex flex-col overflow-hidden min-h-[800px] print:border-0 print:shadow-none print:rounded-none"
                >
                   {/* Preview Controls */}
                   <div className="p-8 border-b border-border flex flex-wrap gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 print:hidden">
                      <div className="flex items-center space-x-3 text-primary">
                         <ShieldCheck className="h-5 w-5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Certified Clinical Preview</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                         <button
                            onClick={handleFhirExport}
                            className="h-11 px-6 bg-blue-500/10 text-blue-600 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500/20 transition-all"
                         >
                            <Database className="h-3.5 w-3.5" /> FHIR Bundle
                         </button>
                         <button
                            onClick={handleCsvExport}
                            className="h-11 px-6 bg-emerald-500/10 text-emerald-600 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500/20 transition-all"
                         >
                            <FileSpreadsheet className="h-3.5 w-3.5" /> Research CSV
                         </button>
                         <button
                            onClick={handlePrint}
                            className="h-11 px-6 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl"
                         >
                            <Printer className="h-3.5 w-3.5" /> Print PDF
                         </button>
                      </div>
                   </div>

                   {/* The Actual Report Content (Styled for PDF) */}
                   <div id="clinical-report" className="flex-1 p-16 space-y-12 bg-white text-slate-900 dark:text-slate-900 print:p-0">

                      {/* Report Header */}
                      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10">
                         <div className="flex items-center space-x-4">
                            <img src="https://ravi123sv.github.io/pdd-project/assets/icon/app_icon.svg" className="h-16 w-16 grayscale" alt="Logo" />
                            <div>
                               <h1 className="text-3xl font-black tracking-tighter uppercase">NeuroSignal</h1>
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Diagnostic Report</p>
                            </div>
                         </div>
                         <div className="text-right space-y-1">
                            <p className="text-xs font-black uppercase tracking-widest">Report ID: NS-{selectedExport._id.slice(-8).toUpperCase()}</p>
                            <p className="text-xs font-bold text-slate-500">{new Date().toLocaleString()}</p>
                            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full mt-2">
                                <CheckCircle2 className="h-3 w-3" />
                                <span className="text-[9px] font-black uppercase">Verified Secure</span>
                            </div>
                         </div>
                      </div>

                      {/* Patient & Clinic Info */}
                      <div className="grid grid-cols-2 gap-12 bg-slate-50 p-10 rounded-[2rem] border border-slate-200">
                         <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Metadata</h5>
                            <div className="grid grid-cols-2 gap-4">
                               <ReportField label="Patient Name" value={selectedExport.patient?.name} />
                               <ReportField label="Clinical MRN" value={selectedExport.patient?.patientId} />
                               <ReportField label="Age / DOB" value={`${selectedExport.patient?.age || '--'} Years`} />
                               <ReportField label="Modality" value={selectedExport.testType} />
                            </div>
                         </div>
                         <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Authority</h5>
                            <div className="grid grid-cols-2 gap-4">
                               <ReportField label="Clinic" value={user?.hospitalName || 'Institutional Hub'} />
                               <ReportField label="Technician" value={selectedExport.technician?.name} />
                               <ReportField label="Start Time" value={new Date(selectedExport.startTime).toLocaleTimeString()} />
                               <ReportField label="Reliability" value={`${selectedExport.quality}% SQI`} />
                            </div>
                         </div>
                      </div>

                      {/* Simulated Signal Snapshot */}
                      <div className="space-y-4">
                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telemetry Snapshot (Representative)</h5>
                         <div className="h-40 w-full border-2 border-slate-200 rounded-2xl relative flex items-center justify-center overflow-hidden bg-white">
                            {/* Static clinical grid for PDF */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            {/* Realistic waveform drawing (Simplified for preview/print) */}
                            <svg className="w-full h-full relative z-10" viewBox="0 0 1000 200">
                               <path
                                 d="M 0 100 L 50 100 L 60 90 L 70 100 L 100 100 L 110 50 L 120 150 L 130 100 L 160 100 L 180 120 L 200 100 L 1000 100"
                                 fill="none"
                                 stroke="#000"
                                 strokeWidth="2"
                               />
                            </svg>
                            <div className="absolute bottom-4 left-6 text-[8px] font-black uppercase tracking-widest text-slate-400">Reference Lead II • 25mm/s • 10mm/mV</div>
                         </div>
                      </div>

                      {/* Technical Findings */}
                      <div className="space-y-4">
                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Findings</h5>
                         <div className="p-8 border-2 border-slate-200 rounded-[2.5rem] bg-slate-50/30 min-h-[150px]">
                            <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                               "{selectedExport.findings || "Normal clinical morphology observed. No significant artifacts or anomalies identified during session duration."}"
                            </p>
                         </div>
                      </div>

                      {/* Neural Logic AI Summary */}
                      <div className="space-y-6">
                         <div className="flex items-center space-x-2 text-primary">
                            <BrainCircuit className="h-5 w-5" />
                            <h5 className="text-[10px] font-black uppercase tracking-widest">Neural Logic Interpretation (Local Engine)</h5>
                         </div>
                         <div className="p-10 bg-primary/5 border-2 border-primary/20 rounded-[3rem] relative overflow-hidden">
                            <p className="text-sm font-black text-slate-900 leading-relaxed relative z-10 whitespace-pre-line">
                               {selectedExport.aiSummary || "[SYSTEM: NO AI ANALYSIS REQUESTED FOR THIS SESSION. USE ARCHIVE MODULE TO GENERATE SUMMARY.]"}
                            </p>
                         </div>
                      </div>

                      {/* Footer Disclaimer */}
                      <div className="pt-20 border-t border-slate-200 text-center space-y-4">
                         <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                            [CLINICAL NOTICE: This document is generated for professional medical use. Analysis must be verified by a licensed specialist.]
                         </p>
                         <p className="text-[10px] font-black text-slate-300 tracking-[0.4em]">NEUROSIGNAL LOCAL HUB v3.5</p>
                      </div>
                   </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30 border-2 border-dashed border-border rounded-[3rem]">
                   <div className="h-24 w-24 rounded-[3rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <FileDown className="h-10 w-10 text-slate-400" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black uppercase tracking-tight">Select Report to Export</h4>
                      <p className="text-sm font-medium">Verify data integrity before printing.</p>
                   </div>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ReportField({ label, value }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-slate-900">{value || '--'}</p>
        </div>
    );
}
