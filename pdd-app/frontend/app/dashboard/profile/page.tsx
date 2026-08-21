"use client";

import { useState } from "react";
import { useStore } from "../../../lib/store/useStore";
import {
  User,
  ShieldCheck,
  Mail,
  Camera,
  CheckCircle2,
  Lock,
  Hospital,
  Smartphone,
  Save,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user } = useStore();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <div className="relative group">
            <div className="h-24 w-24 rounded-[2rem] bg-primary flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary/20">
               {user?.name?.[0]}
            </div>
            <button
                onClick={() => alert("Optical Scribe: Camera interface is preparing for biometric verification.")}
                className="absolute -bottom-2 -right-2 h-10 w-10 bg-white dark:bg-slate-800 border-2 border-border rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-lg"
            >
                <Camera className="h-5 w-5" />
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">{user?.name}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Authorized Clinical Practitioner
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleUpdateProfile} className="glass-card p-10 space-y-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User className="h-4 w-4" /> Identity Credentials
            </h3>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Full Legal Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="neuro-input"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Institutional Email (Locked)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="neuro-input pl-12 opacity-50 cursor-not-allowed"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Role</label>
                     <input type="text" value={user?.role || "Doctor"} disabled className="neuro-input opacity-50 uppercase text-[10px] font-black" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Unit ID</label>
                     <input type="text" value={user?.hospitalId || "N/A"} disabled className="neuro-input opacity-50 uppercase text-[10px] font-black" />
                  </div>
               </div>
            </div>

            <div className="pt-6 flex items-center justify-between">
                <button
                    disabled={loading}
                    type="submit"
                    className="neuro-button bg-primary text-white flex items-center space-x-3 px-10 shadow-xl shadow-primary/20"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">Commit Changes</span>
                </button>
                {success && <p className="text-emerald-500 text-[10px] font-black uppercase flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Profile Updated</p>}
            </div>
          </form>

          <div className="glass-card p-10 space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Lock className="h-4 w-4 text-red-500" /> Security Protocol
            </h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
               Credential rotation is managed by your Institutional Hub administrator. To request a role change or clinical key reset, please contact the unit head.
            </p>
            <button
                onClick={() => alert("Security Protocol: Verification request sent to Institutional Hub.")}
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
            >
                Request Identity Reset
            </button>
          </div>

          {/* Admin Security Vault */}
          {user?.role === 'admin' && (
              <div className="glass-card p-10 border-2 border-primary/20 bg-primary/5 space-y-8 relative overflow-hidden group">
                  <div className="relative z-10 space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Institutional Security Vault
                        </h3>
                        <span className="text-[8px] font-black text-primary uppercase px-2 py-1 bg-white rounded-md border border-primary/10 shadow-sm">Admin Access</span>
                     </div>

                     <div className="space-y-4">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Master Clinical Key (Recovery)</p>
                        <div className="h-16 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-2xl flex items-center justify-between px-6">
                           <p className="font-mono font-black text-xl tracking-[0.3em] text-primary">
                              {user?.clinicalKey ? user.clinicalKey : 'NS-884920'}
                           </p>
                           <button
                                onClick={() => {
                                    navigator.clipboard.writeText(user?.clinicalKey || 'NS-884920');
                                    alert("Clinical Key copied to secure clipboard.");
                                }}
                                className="h-10 px-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all"
                           >
                                Copy Key
                           </button>
                        </div>
                        <p className="text-[9px] font-medium text-slate-400 italic">This key grants root access to the {user?.hospitalName} clinical hub. Store with extreme caution.</p>
                     </div>
                  </div>
                  <Lock className="absolute -bottom-8 -right-8 h-40 w-40 text-primary opacity-5 group-hover:scale-110 transition-transform duration-1000" />
              </div>
          )}
        </div>

        <div className="space-y-8">
           <div className="glass-card p-8 bg-[#0F172A] text-white space-y-8 relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center space-x-3 text-secondary">
                    <Hospital className="h-6 w-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Active Node</span>
                 </div>
                 <div>
                    <h4 className="text-xl font-black">{user?.hospitalName || "Private Clinic"}</h4>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Institutional Hub Link</p>
                 </div>
                 <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase">
                        <span className="text-white/40">Status</span>
                        <span className="text-emerald-500">Verified</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase">
                        <span className="text-white/40">Security Level</span>
                        <span>Level III</span>
                    </div>
                 </div>
              </div>
              <ShieldCheck className="absolute -bottom-10 -right-10 h-40 w-40 text-primary opacity-5 group-hover:scale-110 transition-transform duration-1000" />
           </div>

           <div className="p-8 bg-amber-500/10 border-2 border-dashed border-amber-500/20 rounded-[2.5rem] space-y-4">
              <div className="flex items-center space-x-3 text-amber-600">
                 <AlertCircle className="h-5 w-5" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Compliance Notice</h4>
              </div>
              <p className="text-xs font-bold leading-relaxed text-amber-700/80 italic">
                Authorized practitioners must re-verify identity credentials every 180 days to maintain active clinical handshakes.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
