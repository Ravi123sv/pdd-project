"use client";

import { useStore } from "../../../lib/store/useStore";
import {
  User,
  Mail,
  Shield,
  Hospital,
  Key,
  Camera,
  BadgeCheck,
  Edit2,
  Calendar,
  Activity
} from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const { user } = useStore();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="relative">
        {/* Cover Element */}
        <div className="h-48 w-full bg-primary rounded-[2.5rem] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
          <div className="absolute top-0 right-0 p-8">
             <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em]">
               Practitioner Verified
             </div>
          </div>
        </div>

        {/* Profile Info Header */}
        <div className="px-8 -mt-20 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="h-32 w-32 rounded-[2rem] bg-white dark:bg-slate-900 p-2 shadow-2xl relative group">
              <div className="h-full w-full rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl font-black text-primary">
                {user?.name?.[0].toUpperCase()}
              </div>
              <button className="absolute inset-0 bg-black/40 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-2">
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-black text-foreground tracking-tight">{user?.name}</h1>
                <BadgeCheck className="h-6 w-6 text-primary fill-primary/10" />
              </div>
              <p className="text-sm font-medium text-slate-500 flex items-center space-x-2">
                <Shield className="h-3.5 w-3.5" />
                <span className="uppercase tracking-widest text-[10px] font-black text-slate-400">{user?.role}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="neuro-button bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-border shadow-sm flex items-center space-x-2 text-sm mb-2"
          >
            <Edit2 className="h-4 w-4" />
            <span>EDIT PROFILE</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact & Professional Info */}
        <div className="md:col-span-2 space-y-6">
          <section className="glass-card p-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Professional Identity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Work Email</span>
                </div>
                <p className="font-bold text-foreground">{user?.email}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Hospital className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Affiliation</span>
                </div>
                <p className="font-bold text-foreground">{user?.hospitalName}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Key className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Access Protocol</span>
                </div>
                <p className="font-bold text-foreground">{user?.userType === 'hospital' ? 'Institutional Hub' : 'Standalone'}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Member Since</span>
                </div>
                <p className="font-bold text-foreground">July 2026</p>
              </div>
            </div>
          </section>

          <section className="glass-card p-8">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Recent Activity</h3>
             <div className="space-y-6">
               {[
                 { action: "Signal Acquisition Complete", patient: "MRN-7701", time: "2 hours ago" },
                 { action: "Clinical Report Exported", patient: "MRN-8812", time: "Yesterday" },
                 { action: "Security Protocol Updated", patient: "System", time: "3 days ago" },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center space-x-4">
                     <div className="h-2 w-2 rounded-full bg-primary" />
                     <div>
                       <p className="text-sm font-bold text-foreground">{item.action}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">{item.patient}</p>
                     </div>
                   </div>
                   <span className="text-xs font-medium text-slate-400">{item.time}</span>
                 </div>
               ))}
             </div>
          </section>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <section className="glass-card p-6 bg-slate-900 text-white">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-white/40">Clinical Metrics</h3>
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black">128</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Total Sessions</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black">100%</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase">SLA Compliance</p>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-border">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clinical Key</h4>
            <div className="flex items-center justify-between">
              <code className="text-xs font-mono font-bold text-foreground">NS-HOSP-••••••</code>
              <button className="text-primary text-[10px] font-black uppercase">Reveal</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
