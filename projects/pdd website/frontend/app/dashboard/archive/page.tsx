"use client";

import { useState, useEffect } from "react";
import { useStore } from "../../../lib/store/useStore";
import { api } from "../../../lib/api/client";
import {
  FolderArchive,
  Search,
  Filter,
  Calendar,
  FileText,
  BrainCircuit,
  Download,
  ChevronRight,
  Loader2,
  Clock,
  Activity,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyC7RZJ1g1h_y0b0953pnYlz_Bn6qDD1yBU");

export default function ArchivePage() {
  const { user } = useStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [summarizing, setSummarizing] = useState(false);

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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Generate a professional clinical summary for this ${session.testType} session.
      Patient: ${session.patient?.name}, Quality: ${session.quality}%, Duration: ${session.durationSeconds}s.
      Technical Findings: ${session.findings || "Normal morphology"}.
      Roleplay as a senior clinical analyst. Use highly technical terms. Prepend with [NEURAL LOGIC SUMMARY].`;

      const result = await model.generateContent(prompt);
      const summary = result.response.text();

      // Update in backend
      await api.sessions.update(session._id, { aiSummary: summary });

      // Update local state
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

  const filteredSessions = sessions.filter(s =>
    s.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.patient?.patientId?.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <FolderArchive className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Clinical Archive</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Historical Session Management & Neural Logic Reports
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-280px)]">
        {/* Left: Session List */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
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
                  onClick={() => setSelectedSession(session)}
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

        {/* Right: Session Detail & AI Summary */}
        <div className="lg:col-span-2">
           <AnimatePresence mode="wait">
              {selectedSession ? (
                <motion.div
                   key={selectedSession._id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="h-full bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-border/50 shadow-2xl flex flex-col overflow-hidden"
                >
                   {/* Detail Header */}
                   <div className="p-8 border-b border-border flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                         <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <Activity className="h-6 w-6" />
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-foreground">{selectedSession.patient?.name}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnostic Session Detailed Report</p>
                         </div>
                      </div>
                      <div className="flex gap-3">
                         <button className="h-12 w-12 rounded-xl border border-border flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                            <Download className="h-5 w-5" />
                         </button>
                         <button className="h-12 px-6 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                            Print Report
                         </button>
                      </div>
                   </div>

                   {/* Detail Content */}
                   <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
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
                         <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border/50">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                               {selectedSession.findings || "No manual findings recorded for this session. Use the Neural Logic Unit to generate an automated clinical summary."}
                            </p>
                         </div>
                      </div>

                      {/* AI Summary */}
                      <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                               <BrainCircuit className="h-4 w-4" /> Neural Logic Summary
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

                         {selectedSession.aiSummary ? (
                            <div className="p-8 bg-primary/5 border-2 border-primary/20 rounded-[2.5rem] relative overflow-hidden group">
                               <BrainCircuit className="absolute -bottom-8 -right-8 h-40 w-40 text-primary opacity-5 group-hover:rotate-12 transition-transform duration-700" />
                               <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed relative z-10 whitespace-pre-line">
                                  {selectedSession.aiSummary}
                                </p>
                            </div>
                         ) : (
                            <div className="h-40 border-2 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                               <AlertCircle className="h-8 w-8 text-slate-400" />
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No AI analysis requested yet.</p>
                            </div>
                         )}
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
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border/50">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Icon className="h-3 w-3" /> {label}
            </p>
            <p className="text-lg font-black text-foreground">{value}</p>
        </div>
    );
}

function RefreshCw(props: any) {
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
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
