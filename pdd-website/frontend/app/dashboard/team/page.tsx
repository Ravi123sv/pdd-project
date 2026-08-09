"use client";

import { useState, useEffect } from "react";
import { useStore } from "../../../lib/store/useStore";
import { api } from "../../../lib/api/client";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  AlertCircle,
  X,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TeamPage() {
  const { user } = useStore();
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("doctor");
  const [inviting, setInviting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = user?.role === 'admin';

  const fetchTeam = async () => {
    if (!user?.hospitalId) return;
    setLoading(true);
    try {
      const res = await api.auth.getTeam(user.hospitalId);
      setTeam(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [user]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !isAdmin) return;
    setInviting(true);
    try {
      await api.auth.authorizeStaff(user!.hospitalId!, inviteEmail, inviteRole);
      setShowInvite(false);
      setInviteEmail("");
      fetchTeam();
    } catch (e) {
      alert("Invitation failed. Practitioner may already be authorized.");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (email: string) => {
      if (!isAdmin || !confirm(`Revoke access for ${email}?`)) return;
      try {
          await api.auth.removeStaff(user!.hospitalId!, email);
          setTeam(prev => prev.filter(m => m.email !== email));
      } catch (e) {
          alert("Revoke operation failed.");
      }
  };

  const filteredTeam = team.filter(m =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Users className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Team Management</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Unit Access Control & Personnel Directory
              </p>
           </div>
        </div>

        {isAdmin && (
            <button
                onClick={() => setShowInvite(true)}
                className="neuro-button bg-primary text-white flex items-center space-x-2 px-8 shadow-xl shadow-primary/20"
            >
                <UserPlus className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Authorize Staff</span>
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search team by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-2xl pl-12 pr-4 text-xs font-bold outline-none focus:border-primary transition-all"
              />
           </div>

           {loading ? (
               <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
           ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTeam.map((member) => (
                    <motion.div
                        key={member._id}
                        whileHover={{ y: -5 }}
                        className="glass-card p-8 flex flex-col justify-between group"
                    >
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 font-black uppercase">
                                    {member.name?.[0] || member.email[0]}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                        member.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-border/50'
                                    }`}>
                                        {member.status}
                                    </span>
                                    {isAdmin && member.email !== user?.email && (
                                        <button
                                            onClick={() => handleRemove(member.email)}
                                            className="h-8 w-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-lg font-black tracking-tight text-foreground truncate">{member.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Mail className="h-3 w-3" /> {member.email}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="h-3 w-3 text-primary" />
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest">{member.role}</span>
                            </div>
                            {member.status === 'active' ? (
                                <div className="flex items-center gap-1.5 text-emerald-500">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span className="text-[8px] font-black uppercase">Verified</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span className="text-[8px] font-black uppercase">Awaiting Login</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                  ))}
               </div>
           )}
        </div>

        <div className="space-y-6">
           <section className="glass-card p-8 bg-slate-900 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Admin Dashboard</p>
                 <div className="flex items-end justify-between">
                    <h2 className="text-5xl font-black text-primary">{team.length}</h2>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Total Staff</span>
                 </div>
              </div>
              <ShieldCheck className="absolute -bottom-8 -right-8 h-40 w-40 text-primary opacity-5" />
           </section>

           <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] space-y-4">
              <div className="flex items-center space-x-3 text-primary">
                 <AlertCircle className="h-4 w-4" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Access Protocol</h4>
              </div>
              <p className="text-xs font-medium leading-relaxed text-slate-500">
                Unit admins have full authority to revoke access or update staff roles in real-time.
              </p>
           </div>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInvite(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
               <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-3xl relative z-10 border-2 border-white/5">
                  <div className="space-y-8">
                     <div className="text-center space-y-2">
                        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary mb-4">
                            <UserPlus className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-foreground uppercase">Authorize Staff</h3>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Add professional practitioner access</p>
                     </div>

                     <form onSubmit={handleInvite} className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Google Email Address</label>
                           <input required type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="practitioner@hospital.org" className="neuro-input" />
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Clinical Role</label>
                           <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="neuro-input">
                              <option value="doctor">Medical Doctor</option>
                              <option value="technician">Clinical Technician</option>
                              <option value="admin">Unit Administrator</option>
                           </select>
                        </div>

                        <div className="flex gap-4 pt-4">
                           <button type="button" onClick={() => setShowInvite(false)} className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
                           <button type="submit" disabled={inviting} className="flex-1 h-14 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Grant Access"}
                           </button>
                        </div>
                     </form>
                  </div>
               </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
