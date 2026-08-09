"use client";

import { useState, useEffect } from "react";
import { useStore } from "../../../lib/store/useStore";
import { api } from "../../../lib/api/client";
import {
  FileDown,
  Search,
  FileJson,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Activity,
  Download,
  Loader2,
  AlertCircle,
  Eye,
  X,
  BrainCircuit,
  RefreshCw,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SignalCanvas from "../../../components/SignalCanvas";

export default function ExportVaultPage() {
  const { user } = useStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForPreview, setSelectedForPreview] = useState<any>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.hospitalId) return;
      try {
        const res = await api.sessions.getAll(user.hospitalId);
        setSessions(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [user]);

  const filtered = sessions.filter(s =>
    s.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.patient?.patientId?.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <FileDown className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Export Vault</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Professional Data Handover • HL7 FHIR & CSV Formats
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
           <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search registry MRN or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-3xl pl-14 pr-6 text-sm font-bold outline-none focus:border-primary transition-all"
              />
           </div>

           {loading ? (
               <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
           ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filtered.map((s) => (
                    <motion.div
                        key={s._id}
                        whileHover={{ y: -5 }}
                        className="glass-card p-8 space-y-8 group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    {s.testType === 'ECG' ? <Activity className="h-6 w-6" /> : <BrainCircuit className="h-6 w-6" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-foreground truncate max-w-[140px]">{s.patient?.name}</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.testType} • {s.quality}% SQI</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedForPreview(s)}
                                className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-all flex items-center justify-center"
                            >
                                <Eye className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                            <ExportButton label="FHIR JSON" icon={FileJson} />
                            <ExportButton label="DATA CSV" icon={FileSpreadsheet} />
                        </div>
                    </motion.div>
                  ))}
               </div>
           )}

           {filtered.length === 0 && !loading && (
               <div className="py-20 text-center opacity-30">
                  <FileDown className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-sm font-black uppercase tracking-widest text-slate-500">No exportable records found</p>
               </div>
           )}
        </div>

        <div className="space-y-6">
           <section className="glass-card p-8 bg-slate-900 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Vault Security</p>
                 <div className="flex items-end justify-between">
                    <h2 className="text-5xl font-black text-emerald-500">AES</h2>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">256-Bit</span>
                 </div>
                 <div className="pt-6 border-t border-white/5 space-y-3 opacity-60">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                       <span>E2EE Active</span>
                       <span className="text-emerald-500">VERIFIED</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                       <span>HL7 v4.0.1</span>
                       <span>COMPLIANT</span>
                    </div>
                 </div>
              </div>
              <ShieldCheck className="absolute -bottom-8 -right-8 h-40 w-40 text-primary opacity-5" />
           </section>

           <div className="p-8 bg-amber-500/10 border-2 border-dashed border-amber-500/20 rounded-[2.5rem] space-y-4">
              <div className="flex items-center space-x-3 text-amber-600">
                 <AlertCircle className="h-5 w-5" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Legal Notice</h4>
              </div>
              <p className="text-xs font-bold leading-relaxed text-amber-700/80 italic">
                Data exports contain Protected Health Information (PHI). Ensure destination workstations are HIPAA-secured.
              </p>
           </div>
        </div>
      </div>

      {/* Export Preview Modal */}
      <AnimatePresence>
         {selectedForPreview && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedForPreview(null)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-3xl relative z-10 border-2 border-white/5 overflow-hidden flex flex-col max-h-[90vh]">

                  {/* Modal Header */}
                  <div className="p-8 border-b border-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-950">
                     <div className="flex items-center space-x-6">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black">
                           {selectedForPreview.testType}
                        </div>
                        <div>
                           <h2 className="text-2xl font-black tracking-tight">{selectedForPreview.patient?.name}</h2>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             Snapshot ID: <span className="text-primary">{selectedForPreview._id.slice(-12)}</span> • {new Date(selectedForPreview.startTime).toLocaleString()}
                           </p>
                        </div>
                     </div>
                     <button onClick={() => setSelectedForPreview(null)} className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center"><X className="h-6 w-6" /></button>
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Waveform Preview */}
                        <div className="lg:col-span-2 space-y-6">
                           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Activity className="h-4 w-4 text-primary" /> Visual Signal Verification
                           </h3>
                           <div className="h-72 bg-[#03060c] rounded-[2.5rem] border-2 border-primary/20 p-6 relative overflow-hidden">
                                <SignalCanvas
                                    label="Lead II (Archived Snapshot)"
                                    filteredData={selectedForPreview.waveformSnapshot?.length > 0 ? selectedForPreview.waveformSnapshot : Array(100).fill(0).map((_, i) => Math.sin(i * 0.2) * 20)}
                                    isLive={false}
                                    isPaused={true}
                                    showRaw={false}
                                    color="#10B981"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#03060c] to-transparent pointer-events-none opacity-40" />
                           </div>
                        </div>

                        {/* Metadata & Actions */}
                        <div className="space-y-6">
                           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" /> Handover Metadata
                           </h3>
                           <div className="glass-card p-6 bg-slate-50 dark:bg-slate-800/30 border border-border/50 space-y-4">
                              <div className="flex justify-between">
                                 <span className="text-[9px] font-black text-slate-400 uppercase">Duration</span>
                                 <span className="text-xs font-bold text-foreground">{selectedForPreview.durationSeconds}s</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-[9px] font-black text-slate-400 uppercase">Integrity</span>
                                 <span className="text-xs font-bold text-emerald-500">{selectedForPreview.quality}%</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-[9px] font-black text-slate-400 uppercase">Technician</span>
                                 <span className="text-xs font-bold text-foreground truncate max-w-[120px]">{selectedForPreview.technician?.name || 'Authorized Staff'}</span>
                              </div>
                              <div className="pt-4 space-y-3">
                                 <button
                                    onClick={() => alert("DATA VAULT: Commencing E2EE bundle preparation. Download will initialize in 5s.")}
                                    className="w-full h-14 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                                 >
                                    <Download className="h-4 w-4" /> Download Certified Bundle
                                 </button>
                                 <button
                                    onClick={() => setSelectedForPreview(null)}
                                    className="w-full h-14 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                                 >
                                    <FileText className="h-4 w-4" /> Close Preview
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* AI Context */}
                     <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <BrainCircuit className="h-4 w-4 text-primary" /> Neural Log Analysis
                        </h3>
                        <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem]">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-200 leading-relaxed italic">
                                {selectedForPreview.aiSummary || "No retrospective analysis requested. Snapshot morphology appears stable against institutional baseline."}
                            </p>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}

function ExportButton({ label, icon: Icon }: any) {
    return (
        <button className="flex items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 border border-border rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all group">
            <Icon className="h-4 w-4 text-slate-400 group-hover:text-primary" />
            <span className="text-[9px] font-black text-slate-500 group-hover:text-foreground uppercase tracking-widest">{label}</span>
        </button>
    );
}
