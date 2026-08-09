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
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PatientDirectoryPage() {
  const router = useRouter();
  const { user, setActivePatient } = useStore();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user?.hospitalId) return;
      try {
        const res = await api.patients.getAll(user.hospitalId);
        setPatients(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
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

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patientId.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Users className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Patient Registry</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Institutional Master Index • {user?.hospitalName}
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
        {/* Search & Filters */}
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
                  {filteredPatients.map((p) => (
                    <motion.div
                        key={p._id}
                        whileHover={{ y: -5 }}
                        className="glass-card p-8 space-y-8 group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                <Users className="h-7 w-7" />
                            </div>
                            <span className="text-[10px] font-black px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 uppercase tracking-widest border border-border/50">
                                {p.patientId}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-foreground tracking-tight">{p.name}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.department || 'General Care'} • {p.age} Years</p>
                        </div>

                        <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Added: {new Date(p.createdAt).toLocaleDateString()}</span>
                            </div>
                            <button
                                onClick={() => handleAdmit(p)}
                                className="h-10 px-4 bg-primary/10 text-primary rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95"
                            >
                                Start Monitoring
                            </button>
                        </div>
                    </motion.div>
                  ))}
               </div>
           )}

           {filteredPatients.length === 0 && !loading && (
               <div className="py-20 text-center opacity-30">
                  <Users className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-sm font-black uppercase tracking-widest text-slate-500">No matching patient records</p>
               </div>
           )}
        </div>

        {/* Sidebar Context */}
        <div className="space-y-6">
           <section className="glass-card p-8 bg-slate-900 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Directory Stats</p>
                 <div className="flex items-end justify-between">
                    <h2 className="text-5xl font-black text-primary">{patients.length}</h2>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Registered</span>
                 </div>
                 <div className="pt-6 border-t border-white/5 space-y-3 opacity-60">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                       <span>Total MRN Records</span>
                       <span>{patients.length}</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                       <span>Encrypted Local Vault</span>
                       <span className="text-emerald-500">Verified</span>
                    </div>
                 </div>
              </div>
              <Activity className="absolute -bottom-8 -right-8 h-40 w-40 text-primary opacity-5 group-hover:scale-110 transition-transform duration-1000" />
           </section>

           <div className="p-8 bg-primary text-white rounded-[2.5rem] shadow-2xl shadow-primary/30 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sovereign Data</span>
                 </div>
                 <p className="text-xs font-bold leading-relaxed opacity-90">
                    Patient records are indexed locally. Identity information is decoupled from biometric streams during transmission.
                 </p>
              </div>
              <Users className="absolute -bottom-6 -right-6 h-32 w-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
           </div>
        </div>
      </div>
    </div>
  );
}
