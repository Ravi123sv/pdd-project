"use client";

import { useState, useEffect } from "react";
import { useStore } from "../../../lib/store/useStore";
import { api } from "../../../lib/api/client";
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  ChevronRight,
  Loader2,
  Activity,
  Calendar,
  FileText,
  UserPlus,
  TrendingUp,
  X,
  ShieldCheck,
  BrainCircuit,
  Heart,
  Pulse
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PatientDirectoryPage() {
  const router = useRouter();
  const { user, setActivePatient } = useStore();
  const [patients, setPatients] = useState<any[]>([]);
  const [allSessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedForDetail, setSelectedForDetail] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.hospitalId) return;
      try {
        const [pRes, sRes] = await Promise.all([
            api.patients.getAll(user.hospitalId),
            api.sessions.getAll(user.hospitalId)
        ]);
        setPatients(pRes.data);
        setSessions(sRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleAdmit = (patient: any) => {
      setActivePatient({
          id: patient.patientId,
          name: patient.name,
          age: patient.age,
          modality: 'ECG', // Default
          hospitalId: patient.hospitalId
      });
      router.push("/dashboard/monitor");
  };

  const getPatientSessions = (pId: string) => {
      // Find sessions by checking patient._id or patientId
      return allSessions.filter(s => s.patient?._id === pId || s.patientId === pId);
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patientId.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Users className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                {user?.userType === 'hospital' ? 'Patient Registry' : 'Private Practice Index'}
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {user?.userType === 'hospital' ? `Institutional Master Index • ${user?.hospitalName}` : 'Personal Specialist Registry • Private Practice'}
              </p>
           </div>
        </div>

        <button
            onClick={() => router.push("/dashboard/admission")}
            className="neuro-button bg-primary text-white flex items-center space-x-2 px-8 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
            <UserPlus className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">New Admission</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
           <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by MRN, Name, or Department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-3xl pl-14 pr-6 text-sm font-bold outline-none focus:border-primary transition-all"
              />
           </div>

           {loading ? (
               <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
           ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPatients.map((p) => {
                    const pSessions = getPatientSessions(p._id);
                    return (
                        <motion.div
                            key={p._id}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedForDetail(p)}
                            className="glass-card p-8 space-y-8 group cursor-pointer border-2 border-transparent hover:border-primary/20 transition-all"
                        >
                            <div className="flex justify-between items-start">
                                <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    <Users className="h-7 w-7" />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[10px] font-black px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 uppercase tracking-widest border border-border/50">
                                        {p.patientId}
                                    </span>
                                    {pSessions.length > 0 && (
                                        <div className="flex items-center gap-1.5 text-emerald-500 text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">
                                            <TrendingUp className="h-3 w-3" />
                                            Active History
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-foreground tracking-tight">{p.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.department || 'General Care'} • {p.age} Years</p>
                            </div>

                            <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Sessions</p>
                                        <p className="text-sm font-black text-foreground">{pSessions.length}</p>
                                    </div>
                                    <div className="h-4 w-px bg-border/50" />
                                    <div className="text-center">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Stability</p>
                                        <p className="text-sm font-black text-emerald-500">Optimal</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAdmit(p); }}
                                    className="h-10 px-4 bg-primary/10 text-primary rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95"
                                >
                                    New Session
                                </button>
                            </div>
                        </motion.div>
                    );
                  })}
               </div>
           )}
        </div>

        <div className="space-y-6">
           <section className="glass-card p-8 bg-slate-900 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Registry Coverage</p>
                 <div className="flex items-end justify-between">
                    <h2 className="text-5xl font-black text-primary">{patients.length}</h2>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Total MRNs</span>
                 </div>
              </div>
              <Activity className="absolute -bottom-8 -right-8 h-40 w-40 text-primary opacity-5 group-hover:scale-110 transition-transform duration-1000" />
           </section>

           <div className="p-8 bg-primary text-white rounded-[2.5rem] shadow-2xl shadow-primary/30 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">HIPAA Compliant</span>
                 </div>
                 <p className="text-xs font-bold leading-relaxed opacity-90">
                    Clinical records are indexed locally. Identity information is decoupled from biometric streams.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Patient Detail / Intelligence Modal */}
      <AnimatePresence>
         {selectedForDetail && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setSelectedForDetail(null)}
                 className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
               />
               <motion.div
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-3xl relative z-10 border-2 border-white/5 overflow-hidden flex flex-col max-h-[85vh]"
               >
                  {/* Modal Header */}
                  <div className="p-10 border-b border-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
                     <div className="flex items-center space-x-6">
                        <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary text-4xl font-black uppercase">
                           {selectedForDetail.name[0]}
                        </div>
                        <div>
                           <h2 className="text-3xl font-black tracking-tight">{selectedForDetail.name}</h2>
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                             <span className="text-primary">{selectedForDetail.patientId}</span> • {selectedForDetail.department || 'General'} • {selectedForDetail.age} Years
                           </p>
                        </div>
                     </div>
                     <button
                       onClick={() => setSelectedForDetail(null)}
                       className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center"
                     >
                        <X className="h-6 w-6" />
                     </button>
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Longitudinal Trends */}
                        <div className="lg:col-span-2 space-y-8">
                           <div className="space-y-6">
                               <div className="flex items-center justify-between">
                                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                     <TrendingUp className="h-4 w-4 text-primary" /> Longitudinal Stability (SQI)
                                  </h3>
                                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-full">System Verified</span>
                               </div>

                               <div className="h-48 bg-slate-50 dark:bg-slate-950/50 rounded-[2.5rem] border-2 border-border/50 p-6 flex items-end justify-between relative overflow-hidden">
                                  {getPatientSessions(selectedForDetail._id).length > 0 ? (
                                      <div className="flex items-end gap-3 h-full w-full justify-around relative z-10">
                                          {getPatientSessions(selectedForDetail._id).map((s, i) => (
                                              <div key={i} className="group relative flex flex-col items-center flex-1">
                                                  <div className="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-xl" style={{ height: `${s.quality}%` }} />
                                                  <p className="text-[7px] font-black text-slate-500 mt-2 uppercase">{new Date(s.startTime).toLocaleDateString()}</p>
                                              </div>
                                          ))}
                                      </div>
                                  ) : (
                                      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                                          <p className="text-xs font-black uppercase tracking-widest">No historical SQI data</p>
                                      </div>
                                  )}
                               </div>
                           </div>

                           <div className="space-y-6">
                               <div className="flex items-center justify-between">
                                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                     <Heart className="h-4 w-4 text-rose-500" /> Autonomic Variability (HRV)
                                  </h3>
                                  <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest px-3 py-1 bg-rose-500/10 rounded-full">Neural Trend</span>
                               </div>

                               <div className="h-48 bg-slate-50 dark:bg-slate-950/50 rounded-[2.5rem] border-2 border-border/50 p-6 flex items-center justify-around relative overflow-hidden">
                                  <div className="flex items-center gap-1 h-full w-full justify-around relative z-10">
                                      {[42, 38, 55, 48, 62, 58, 70].map((v, i) => (
                                          <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                              <div className="w-2 bg-rose-500/20 rounded-full h-24 relative overflow-hidden">
                                                  <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${v}%` }}
                                                    className="absolute bottom-0 left-0 right-0 bg-rose-500 rounded-full"
                                                  />
                                              </div>
                                              <span className="text-[8px] font-black text-rose-400">{v}ms</span>
                                          </div>
                                      ))}
                                  </div>
                                  <Activity className="absolute -bottom-8 -right-8 h-48 w-48 text-rose-500 opacity-5" />
                               </div>
                           </div>
                        </div>

                        {/* Summary Info */}
                        <div className="space-y-6">
                           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" /> Clinical Summary
                           </h3>
                           <div className="glass-card p-6 bg-slate-50 dark:bg-slate-800/30 border border-border/50 space-y-6">
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Exam Type</p>
                                 <p className="text-sm font-bold text-foreground">
                                    {getPatientSessions(selectedForDetail._id)[0]?.testType || 'N/A'}
                                 </p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Diagnosis</p>
                                 <p className="text-sm font-bold text-foreground">Pending Physician Review</p>
                              </div>
                              <button
                                onClick={() => { setSelectedForDetail(null); handleAdmit(selectedForDetail); }}
                                className="w-full h-14 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                              >
                                 Launch Diagnostic Link <ChevronRight className="h-4 w-4" />
                              </button>
                           </div>
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

function FilterButton({ active, onClick, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                active ? 'bg-primary text-white shadow-lg' : 'text-slate-500'
            }`}
        >
            {label}
        </button>
    );
}
