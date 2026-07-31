"use client";

import { useState, useEffect } from "react";
import { useStore } from "../../../lib/store/useStore";
import { api } from "../../../lib/api/client";
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  ShieldCheck,
  Activity,
  Search,
  MoreVertical,
  Key,
  Globe,
  Settings,
  Lock,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TeamManagementPage() {
  const { user } = useStore();
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("technician");

  const isHospitalAdmin = user?.userType === 'hospital' && user?.role === 'admin';

  useEffect(() => {
    const fetchTeam = async () => {
      if (!user?.hospitalId) return;
      try {
        const res = await api.auth.getTeam(user.hospitalId);
        setTeam(res.data);
      } catch (e) {
        console.error("Failed to fetch team", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [user]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // In a real app, this would call an API to send an invite email
    setTimeout(() => {
        setTeam(prev => [...prev, {
            _id: Math.random().toString(),
            name: "Pending Invite",
            email: inviteEmail,
            role: inviteRole,
            status: 'invited'
        }]);
        setInviteEmail("");
        setShowInvite(false);
        setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Users className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Staff Privilege Hub</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Manage {user?.hospitalName} • Authorized Clinical IDs
              </p>
           </div>
        </div>

        {isHospitalAdmin && (
          <button
            onClick={() => setShowInvite(true)}
            className="neuro-button bg-primary text-white flex items-center space-x-2 px-8 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Authorize Staff</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Stats/Quick Info */}
        <div className="lg:col-span-1 space-y-6">
           <section className="glass-card p-6 bg-slate-900 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                 <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Global Master Key</p>
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-mono font-black text-primary tracking-widest">NS-884920</h3>
                    <Lock className="h-4 w-4 text-white/20" />
                 </div>
                 <p className="text-[9px] font-medium text-white/50 leading-relaxed">
                   Share this key ONLY with staff verified via hospital domain.
                 </p>
              </div>
              <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-primary/10 rounded-full blur-2xl" />
           </section>

           <section className="glass-card p-6 space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorization Rules</h4>
              <div className="space-y-4">
                 <RuleItem icon={ShieldCheck} label="Google Auth Required" active={true} />
                 <RuleItem icon={Globe} label="IP Restricted" active={false} />
                 <RuleItem icon={Settings} label="2FA Protocol" active={true} />
              </div>
           </section>
        </div>

        {/* Main Team Table */}
        <div className="lg:col-span-3">
           <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-border bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" placeholder="Search staff..." className="w-full h-10 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-xl pl-10 pr-4 text-xs font-medium outline-none" />
                 </div>
                 <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Seats:</span>
                    <span className="text-xs font-bold text-primary">{team.length + 1}/50</span>
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead className="bg-slate-50/30 dark:bg-slate-800/10 border-b border-border">
                       <tr>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Privilege Level</th>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</th>
                          <th className="px-8 py-4"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                       {/* Admin (You) */}
                       <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-8 py-6">
                             <div className="flex items-center space-x-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase">{user?.name?.[0]}</div>
                                <div>
                                   <p className="text-sm font-bold text-foreground">{user?.name} (You)</p>
                                   <p className="text-[10px] font-medium text-slate-500">{user?.email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-[9px] font-black uppercase px-3 py-1 bg-primary/10 text-primary rounded-full tracking-widest border border-primary/20">Master Admin</span>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center space-x-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                                <span className="text-[10px] font-black uppercase text-secondary">Online</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-xs font-medium text-slate-500">Just Now</td>
                          <td className="px-8 py-6 text-right">
                             <button className="text-slate-300 hover:text-slate-600 transition-colors"><MoreVertical className="h-5 w-5" /></button>
                          </td>
                       </tr>

                       {/* Mock Team Members */}
                       <TeamRow name="Dr. Elena Rossi" email="rossi@hospital.org" role="Cardiologist" status="online" activity="14m ago" />
                       <TeamRow name="Marcus Chen" email="chen.m@hospital.org" role="Technician" status="offline" activity="2h ago" />
                       <TeamRow name="Sarah Miller" email="sarah.m@hospital.org" role="ICU Staff" status="away" activity="45m ago" />

                       {team.map((member: any) => (
                         <TeamRow
                            key={member._id}
                            name={member.name}
                            email={member.email}
                            role={member.role}
                            status={member.status || 'offline'}
                            activity="Never"
                         />
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
         {showInvite && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setShowInvite(false)}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
               />
               <motion.div
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
                 className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl relative z-10 border border-border/50"
               >
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <h3 className="text-2xl font-black tracking-tight text-foreground">Authorize Staff Member</h3>
                        <p className="text-xs font-medium text-slate-500">Enter their institutional Google ID for direct workstation access.</p>
                     </div>

                     <form onSubmit={handleInvite} className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
                           <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <input
                                 type="email"
                                 required
                                 value={inviteEmail}
                                 onChange={(e) => setInviteEmail(e.target.value)}
                                 placeholder="colleague@hospital.org"
                                 className="w-full h-14 bg-slate-50 dark:bg-slate-800 border-2 border-border/50 rounded-xl pl-12 pr-4 text-xs font-bold outline-none focus:border-primary"
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Clinical Role</label>
                           <select
                             value={inviteRole}
                             onChange={(e) => setInviteRole(e.target.value)}
                             className="w-full h-14 bg-slate-50 dark:bg-slate-800 border-2 border-border/50 rounded-xl px-4 text-xs font-bold outline-none focus:border-primary appearance-none"
                           >
                              <option value="technician">Clinical Technician</option>
                              <option value="doctor">Specialist Doctor</option>
                              <option value="admin">Unit Administrator</option>
                           </select>
                        </div>

                        <div className="flex gap-4 pt-4">
                           <button
                             type="button"
                             onClick={() => setShowInvite(false)}
                             className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200"
                           >
                              Cancel
                           </button>
                           <button
                             type="submit"
                             disabled={loading}
                             className="flex-1 h-14 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                           >
                              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShieldCheck className="h-4 w-4" /> Grant Access</>}
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

function TeamRow({ name, email, role, status, activity }: any) {
   const statusColor = {
      online: 'bg-secondary',
      offline: 'bg-slate-300',
      away: 'bg-amber-400'
   }[status as 'online' | 'offline' | 'away'] || 'bg-slate-300';

   return (
      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
         <td className="px-8 py-6">
            <div className="flex items-center space-x-4">
               <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold uppercase">{name[0]}</div>
               <div>
                  <p className="text-sm font-bold text-foreground">{name}</p>
                  <p className="text-[10px] font-medium text-slate-500">{email}</p>
               </div>
            </div>
         </td>
         <td className="px-8 py-6">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{role}</span>
         </td>
         <td className="px-8 py-6">
            <div className="flex items-center space-x-2">
               <div className={`h-1.5 w-1.5 rounded-full ${statusColor}`} />
               <span className="text-[10px] font-black uppercase text-slate-400">{status}</span>
            </div>
         </td>
         <td className="px-8 py-6 text-xs font-medium text-slate-500">{activity}</td>
         <td className="px-8 py-6 text-right">
            <button className="text-slate-300 hover:text-slate-600 transition-colors"><MoreVertical className="h-5 w-5" /></button>
         </td>
      </tr>
   );
}

function RuleItem({ icon: Icon, label, active }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-white dark:bg-slate-900">
       <div className="flex items-center space-x-3">
          <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-slate-300")} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
       </div>
       <div className={cn("h-4 w-8 rounded-full relative transition-colors", active ? "bg-primary" : "bg-slate-200")}>
          <div className={cn("absolute top-0.5 h-3 w-3 bg-white rounded-full transition-all", active ? "right-0.5" : "left-0.5")} />
       </div>
    </div>
  );
}
