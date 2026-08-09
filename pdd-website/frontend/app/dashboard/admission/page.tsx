"use client";

import { useState, useEffect } from "react";
import { useStore } from "../../../lib/store/useStore";
import { api } from "../../../lib/api/client";
import {
  UserPlus,
  Search,
  Activity,
  Smartphone,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { queueForSync } from "../../../lib/offlineSync";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdmissionPage() {
  const router = useRouter();
  const { user, setHardwareStatus, setActivePatient } = useStore();
  const [mrn, setMrn] = useState("MRN-");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [modality, setModality] = useState("ECG");
  const [isHospitalConnected, setIsHospitalConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const searchPatients = async () => {
        try {
          const res = await api.patients.getAll(user?.hospitalId || 'HOSP-DEFAULT');
          const filtered = res.data.filter((p: any) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.patientId.includes(searchQuery)
          );
          setSearchResults(filtered);
        } catch (e) {
          console.error(e);
        }
      };
      searchPatients();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, user]);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 2) {
        setError("VALIDATION ERROR: Patient name is too short.");
        return;
    }
    if (mrn.length < 5) {
        setError("VALIDATION ERROR: Clinical MRN must be at least 5 characters.");
        return;
    }
    if (!age || parseInt(age) < 0 || parseInt(age) > 150) {
        setError("VALIDATION ERROR: Invalid physiological age range (0-150).");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const patientData = {
        id: mrn,
        name,
        age: parseInt(age),
        hospitalId: user?.hospitalId || 'HOSP-DEFAULT'
      };

      // 1. Sync Patient to Clinical Registry (with offline support)
      if (navigator.onLine) {
        await api.patients.syncSQL(patientData);
      } else {
        await queueForSync('PATIENT_ADMISSION', patientData);
      }

      // 2. Set Global Clinical State
      setActivePatient({ id: mrn, name, age, modality });
      setHardwareStatus(true);

      // 3. Secure Link and Navigate
      router.push("/dashboard/monitor");
    } catch (err: any) {
      console.error("Admission error:", err);
      setError(err.response?.data?.message || "ADMISSION FAILED: Clinical Hub Handshake Timeout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Patient Admission</h1>
        <p className="text-sm font-medium text-slate-500">Required clinical metadata for session synchronization.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleLaunch} className="glass-card p-8 space-y-8">
            <div className="space-y-6">
               <div className="flex items-center space-x-3 mb-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admission Registry</span>
               </div>

               <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Patient Name</label>
                        <div className="relative">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                           <input
                             type="text"
                             value={name}
                             onChange={(e) => setName(e.target.value)}
                             onFocus={() => setSearchQuery(name)}
                             placeholder="Search or enter new..."
                             className="neuro-input pl-11"
                             required
                           />
                           {searchResults.length > 0 && (
                             <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-2xl z-30 overflow-hidden">
                                {searchResults.map((p) => (
                                  <button
                                    key={p.patientId}
                                    type="button"
                                    onClick={() => { setName(p.name); setMrn(p.patientId); setSearchResults([]); }}
                                    className="w-full px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-border last:border-0"
                                  >
                                    <p className="text-sm font-bold text-foreground">{p.name}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">{p.patientId}</p>
                                  </button>
                                ))}
                             </div>
                           )}
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Clinical MRN</label>
                        <input
                          type="text"
                          value={mrn}
                          onChange={(e) => setMrn(e.target.value.startsWith('MRN-') ? e.target.value : 'MRN-')}
                          className="neuro-input font-mono font-black"
                          required
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Age / DOB</label>
                        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Years" className="neuro-input" required />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Diagnostic Modality</label>
                        <select
                          value={modality}
                          onChange={(e) => setModality(e.target.value)}
                          className="neuro-input appearance-none bg-no-repeat bg-right pr-10"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1.5em' }}
                        >
                           <option>ECG</option>
                           <option>EEG</option>
                           <option>EMG</option>
                        </select>
                     </div>
                  </div>
               </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-[10px] font-black uppercase">
                    <AlertTriangle className="h-4 w-4" />
                    {error}
                </div>
            )}

            <button
              disabled={loading}
              className="w-full h-16 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 flex items-center justify-center space-x-3 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Initialize Acquisition</span> <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>

        {/* Interface Info */}
        <div className="space-y-6">
           <section className="glass-card p-6 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Interfaces</h3>
              <div className="space-y-3">
                 <InterfaceTile
                   title="Clinical Sensors"
                   sub="Link wireless units (WebBT)."
                   icon={Smartphone}
                   active={false}
                 />
                 <InterfaceTile
                   title="Simulator"
                   sub="Internal mock telemetry link."
                   icon={Cpu}
                   active={true}
                 />
              </div>
           </section>

           <div className="p-6 bg-[#0F172A] rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center space-x-2 text-secondary">
                 <ShieldCheck className="h-4 w-4" />
                 <span className="text-[10px] font-black uppercase">E2E Secured</span>
              </div>
              <p className="text-xs text-white/50 font-medium leading-relaxed">
                Telemetry is currently being routed through the clinical sandbox environment. Identity data is scrubbed at the edge.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function InterfaceTile({ title, sub, icon: Icon, active }: any) {
  return (
    <div className={cn(
      "p-4 rounded-2xl border-2 transition-all flex items-center space-x-4",
      active ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" : "border-border/50 opacity-60"
    )}>
       <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", active ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
          <Icon className="h-5 w-5" />
       </div>
       <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-[10px] font-medium text-slate-500">{sub}</p>
       </div>
       {active && <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />}
    </div>
  );
}
