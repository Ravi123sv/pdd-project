"use client";

import { useState, useEffect } from "react";
import { useStore } from "../../../lib/store/useStore";
import { api } from "../../../lib/api/client";
import {
  Bell,
  AlertCircle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Trash2,
  Filter,
  Activity,
  Zap,
  Loader2,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const iconMap: any = {
    'critical': ShieldAlert,
    'system': Zap,
    'warning': AlertCircle,
    'CLINICAL': Activity
};

export default function NotificationsPage() {
  const { user } = useStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'system' | 'warning'>('all');

  const fetchAlerts = async () => {
    if (!user?.hospitalId) return;
    setLoading(true);
    try {
        const res = await api.alerts.getAll(user.hospitalId);
        setNotifications(res.data);
    } catch (e) {
        console.error("Alert Fetch Error", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  const handleReadAll = async () => {
      if (!user?.hospitalId) return;
      try {
          await api.alerts.readAll(user.hospitalId);
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (e) { console.error(e); }
  };

  const handleClear = async () => {
      if (!user?.hospitalId) return;
      if (!confirm("Confirm clinical log purge? This action is irreversible.")) return;
      try {
          await api.alerts.clear(user.hospitalId);
          setNotifications([]);
      } catch (e) { console.error(e); }
  };

  const filtered = notifications.filter(n => {
      if (filter === 'all') return true;
      return n.type === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Bell className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Clinical Notification Center</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Real-time Alerts & Persistent Audit Log
              </p>
           </div>
        </div>

        <div className="flex items-center gap-3">
            <button onClick={handleReadAll} className="text-[10px] font-black uppercase text-primary hover:underline px-4">Mark All Read</button>
            <button onClick={handleClear} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
      </div>

      <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-border/50 w-fit">
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="All" />
            <FilterButton active={filter === 'critical'} onClick={() => setFilter('critical')} label="Critical" />
            <FilterButton active={filter === 'warning'} onClick={() => setFilter('warning')} label="Hardware" />
            <FilterButton active={filter === 'system'} onClick={() => setFilter('system')} label="System" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
           {loading ? (
               <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
           ) : (
               <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((n) => {
                      const Icon = iconMap[n.type] || iconMap[n.category] || Bell;
                      return (
                        <motion.div
                          key={n._id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`p-6 rounded-[2rem] border-2 flex items-start gap-6 transition-all relative ${
                              !n.isRead ? 'border-primary/20 bg-primary/5' : 'bg-white dark:bg-slate-900 border-border/50'
                          } ${n.type === 'critical' ? 'bg-red-50/50 dark:bg-red-950/10' : ''}`}
                        >
                           <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                               n.type === 'critical' ? 'bg-red-500 text-white shadow-lg' :
                               (n.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400')
                           }`}>
                              <Icon className="h-6 w-6" />
                           </div>
                           <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                 <h4 className={`text-base font-black uppercase tracking-tight ${n.type === 'critical' ? 'text-red-600' : 'text-foreground'}`}>
                                   {n.title}
                                 </h4>
                                 <span className="text-[10px] font-bold text-slate-400">{new Date(n.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{n.body}</p>
                           </div>
                           {!n.isRead && <div className="absolute top-6 left-6 h-3 w-3 bg-primary rounded-full border-2 border-white dark:border-slate-950 -translate-x-1/2 -translate-y-1/2" />}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
               </div>
           )}

           {filtered.length === 0 && !loading && (
               <div className="py-20 text-center opacity-30">
                  <Bell className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-sm font-black uppercase tracking-widest text-slate-500">No active alerts in this queue</p>
               </div>
           )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <section className="glass-card p-8 bg-slate-900 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Alert Authority</span>
                    <ShieldAlert className="h-4 w-4 text-red-500 animate-pulse" />
                 </div>
                 <h3 className="text-2xl font-black tracking-tight uppercase">Hub Integrity</h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                       <span className="text-white/40">Unread Alerts</span>
                       <span className="text-primary">{notifications.filter(n => !n.isRead).length}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-full" />
                    </div>
                 </div>
              </div>
              <Bell className="absolute -bottom-8 -right-8 h-40 w-40 text-primary opacity-5" />
           </section>

           <div className="p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 space-y-4">
              <div className="flex items-center space-x-3 text-amber-600">
                 <Clock className="h-4 w-4" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Retention Policy</h4>
              </div>
              <p className="text-xs font-medium leading-relaxed text-amber-700/80">
                Critical clinical logs are preserved for 90 days as per institutional data sovereignty requirements.
              </p>
           </div>
        </div>
      </div>
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
