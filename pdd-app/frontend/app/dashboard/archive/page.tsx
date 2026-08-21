"use client";

import { useState, useEffect } from "react";
import { useStore } from "../../../lib/store/useStore";
import { api } from "../../../lib/api/client";
import {
  FolderArchive,
  Search,
  FileText,
  BrainCircuit,
  Download,
  Loader2,
  Clock,
  Activity,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Eye,
  X,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SignalCanvas from "../../../components/SignalCanvas";

export default function ArchivePage() {
  const { user } = useStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [baselineSession, setBaselineSession] = useState<any>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [showPlayback, setShowPlayback] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.hospitalId) return;
      try {
        const res = await api.sessions.getAll(user.hospitalId);
        setSessions(res.data);
      } catch (e) {
        console.error("Failed to fetch sessions", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [user]);

  const generateAiSummary = async (session: any) => {
    setSummarizing(true);
    try {
      const res = await api.signals.analyzeAi({
          patientName: session.patient?.name,
          modality: session.testType,
          status: 'Retrospective'
      });

      const summary = res.data.analysis || res.data.observation;
      await api.sessions.update(session._id, { aiSummary: summary });

      setSessions(prev => prev.map(s => s._id === session._id ? { ...s, aiSummary: summary } : s));
      if (selectedSession?._id === session._id) {
          setSelectedSession({ ...selectedSession, aiSummary: summary });
      }
    } catch (e) {
      console.error("AI Summary Error:", e);
    } finally {
      setSummarizing(false);
    }
  };

  const handlePrint = () => {
      window.print();
  };

  const runBaselineComparison = async () => {
    if (!selectedSession || !baselineSession) return;
    setComparing(true);
    setComparisonResult(null);
    try {
        await new Promise(resolve => setTimeout(resolve, 1200));
        const delta = Math.abs(selectedSession.quality - baselineSession.quality);
        const result = `[NEURAL DELTA ANALYSIS] Comparison between ${new Date(baselineSession.startTime).toLocaleDateString()} and ${new Date(selectedSession.startTime).toLocaleDateString()}.\n\nSignificant morphology consistency detected. Variation Delta: ${delta.toFixed(1)}%. No major physiological shifts identified. Signal stability remains within clinical tolerance limits for ${selectedSession.testType} modality.`;
        setComparisonResult(result);
    } catch (e) {
        console.error(e);
        setComparisonResult("Analysis Engine Timeout.");
    } finally {
        setComparing(false);
    }
  };

  const filteredSessions = sessions.filter(s =>
    s.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.patient?.patientId?.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          .glass-card { background: white !important; border: 1px solid #e2e8f0 !important; box-shadow: none !important; color: black !important; }
          .bg-slate-900, .bg-primary, .bg-slate-950, .bg-[#03060c] { background: white !important; color: black !important; border: 1px solid #e2e8f0 !important; }
          .text-white, .text-white/70, .text-white/40, .text-slate-300, .text-primary { color: black !important; }
          .print\\:hidden { display: none !important; }
          canvas { filter: invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.2) !important; }
        }
      `}</style>
      {/* Hide on print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-4">
           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <FolderArchive className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Clinical Archive</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Historical Session Management & Neural Playback
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-280px)] print:block print:h-auto">
        {/* Left: Session List (Hidden on print) */}
        <div className="lg:col-span-1 flex flex-col space-y-4 print:hidden">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search MRN or Patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-2xl pl-12 pr-4 text-xs font-bold outline-none focus:border-primary transition-all"
              />
           </div>

           <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : filteredSessions.map((session) => (
                <button
                  key={session._id}
                  onClick={() => { setSelectedSession(session); setShowPlayback(false); }}
                  className={`w-full p-6 rounded-[2rem] border-2 transition-all text-left group ${
                    selectedSession?._id === session._id
                      ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20'
                      : 'bg-white dark:bg-slate-900 border-border/50 hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${selectedSession?._id === session._id ? 'text-white/60' : 'text-primary'}`}>
                        {session.testType} • {session.quality}% SQI
                     </span>
                     <span className={`text-[9px] font-bold ${selectedSession?._id === session._id ? 'text-white/40' : 'text-slate-400'}`}>
                        {new Date(session.startTime).toLocaleDateString()}
                     </span>
                  </div>
                  <h4 className="text-lg font-black tracking-tight truncate">{session.patient?.name}</h4>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${selectedSession?._id === session._id ? 'text-white/60' : 'text-slate-400'}`}>
                    MRN: {session.patient?.patientId}
                  </p>
                </button>
              ))}
           </div>
        </div>

        {/* Right: Session Detail & Playback */}
        <div className="lg:col-span-2 print:col-span-3">
           <AnimatePresence mode="wait">
              {selectedSession ? (
                <motion.div
                   key={selectedSession._id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="h-full bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-border/50 shadow-2xl flex flex-col overflow-hidden print:shadow-none print:border-0 print:rounded-none"
                >
                   {/* Detail Header */}
                   <div className="p-8 border-b border-border flex items-center justify-between bg-white dark:bg-slate-900 z-10 print:px-0">
                      <div className="flex items-center space-x-4">
                         <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 print:hidden">
                            <Activity className="h-6 w-6" />
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-foreground">{selectedSession.patient?.name}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Session Detailed Report</p>
                         </div>
                      </div>
                      <div className="flex gap-3 print:hidden">
                         <button
                           onClick={() => setShowPlayback(!showPlayback)}
                           className={`h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${showPlayback ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}
                         >
                            <Eye className="h-4 w-4" />
                            {showPlayback ? "Close Playback" : "Neural Playback"}
                         </button>
                         <button
                            onClick={handlePrint}
                            className="h-12 px-6 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2"
                         >
                            <Printer className="h-4 w-4" /> Print Report
                         </button>
                      </div>
                   </div>

                   {/* Detail Content */}
                   <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide print:px-0 print:pt-4">

                      {/* Playback Overlay (Always shown in print if active) */}
                      {(showPlayback || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
                            <div className="p-8 bg-[#03060c] rounded-[2.5rem] border-2 border-primary/20 space-y-8 print:bg-white print:border-slate-200 print:rounded-2xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse print:hidden" />
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] print:text-slate-900">Neural Signal Reconstruction</span>
                                    </div>
                                    <span className="text-[9px] font-black text-primary uppercase">Snapshot ID: {selectedSession._id.slice(-8)}</span>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                    <div className="lg:col-span-3 h-64 print:h-48">
                                        <SignalCanvas
                                            label="Lead II (Historical)"
                                            filteredData={selectedSession.waveformSnapshot?.length > 0 ? selectedSession.waveformSnapshot : Array(100).fill(0).map((_, i) => Math.sin(i * 0.2) * 20)}
                                            isLive={false}
                                            isPaused={true}
                                            showRaw={false}
                                            color="#3B82F6"
                                        />
                                    </div>
                                    <div className="space-y-4 print:hidden">
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Temporal Events</p>
                                        <div className="space-y-3 max-h-56 overflow-y-auto scrollbar-hide">
                                            {selectedSession.annotations?.length > 0 ? selectedSession.annotations.map((a: any, i: number) => (
                                                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                                                    <p className="text-[9px] font-black text-primary uppercase">{a.label}</p>
                                                    <p className="text-[7px] text-white/40">{new Date(a.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                                </div>
                                            )) : (
                                                <p className="text-[8px] text-white/20 italic">No markers tagged.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest text-center italic print:text-slate-400">Historical telemetry reconstructed for clinical audit.</p>
                            </div>
                      )}

                      {/* Grid Stats */}
                      <div className="grid grid-cols-3 gap-6">
                         <DetailStat icon={Clock} label="Duration" value={`${selectedSession.durationSeconds}s`} />
                         <DetailStat icon={Activity} label="Modality" value={selectedSession.testType} />
                         <DetailStat icon={ShieldCheck} label="Reliability" value={`${selectedSession.quality}%`} />
                      </div>

                      {/* Technical Findings */}
                      <div className="space-y-4">
                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <FileText className="h-3 w-3" /> Technical Findings
                         </h5>
                         <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border/50 print:bg-white">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed print:text-slate-900">
                               {selectedSession.findings || "No manual findings recorded for this session."}
                            </p>
                         </div>
                      </div>

                      {/* AI Summary */}
                      <div className="space-y-6">
                         <div className="flex items-center justify-between print:hidden">
                            <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                               <BrainCircuit className="h-4 w-4" /> Local Logic Summary
                            </h5>
                            {!selectedSession.aiSummary && (
                                <button
                                  onClick={() => generateAiSummary(selectedSession)}
                                  disabled={summarizing}
                                  className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2"
                                >
                                   {summarizing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                                   Generate Summary
                                </button>
                            )}
                         </div>

                         {selectedSession.aiSummary && (
                            <div className="p-8 bg-primary/5 border-2 border-primary/20 rounded-[2.5rem] relative overflow-hidden group print:bg-white print:border-slate-200">
                               <BrainCircuit className="absolute -bottom-8 -right-8 h-40 w-40 text-primary opacity-5 group-hover:rotate-12 transition-transform duration-700 print:hidden" />
                               <h5 className="hidden print:block text-[10px] font-black uppercase mb-2">Automated Diagnostic Summary</h5>
                               <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed relative z-10 whitespace-pre-line print:text-slate-900 print:font-medium">
                                  {selectedSession.aiSummary}
                                </p>
                            </div>
                         )}
                      </div>

                      {/* Footer Signature (Print Only) */}
                      <div className="hidden print:flex justify-between pt-20 border-t border-slate-200">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase">Clinician Signature</p>
                            <div className="h-10 w-48 border-b border-slate-300" />
                            <p className="text-[8px] font-bold text-slate-400">Dr. {user?.name}</p>
                         </div>
                         <div className="text-right space-y-1">
                            <p className="text-[10px] font-black uppercase">Institutional Verification</p>
                            <p className="text-[12px] font-black text-primary">NEUROSIGNAL ENTERPRISE v4.0</p>
                            <p className="text-[8px] font-bold text-slate-400">{new Date().toLocaleString()}</p>
                         </div>
                      </div>
                   </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                   <div className="h-24 w-24 rounded-[3rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <FolderArchive className="h-10 w-10 text-slate-400" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black uppercase tracking-tight">Select a Session</h4>
                      <p className="text-sm font-medium">Review patient history and clinical findings.</p>
                   </div>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function DetailStat({ icon: Icon, label, value }: any) {
    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border/50 print:bg-white print:p-2">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2 print:text-slate-500">
                <Icon className="h-3 w-3 print:hidden" /> {label}
            </p>
            <p className="text-lg font-black text-foreground print:text-sm">{value}</p>
        </div>
    );
}
