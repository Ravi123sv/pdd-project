"use client";

import { useStore } from "../../lib/store/useStore";
import { useEffect, useState } from "react";
import {
  Activity,
  Users,
  Package,
  Wifi,
  Activity as MonitorHeart,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Play,
  LayoutDashboard as Hub,
  Loader2,
  Globe,
  ShieldCheck,
  Maximize2,
  Bell,
  Zap,
  Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api/client";
import SignalCanvas from "../../components/SignalCanvas";
import { useWaveform } from "../../hooks/useWaveform";
import { cn } from "../../lib/utils";

import { useRouter } from "next/navigation";
import { socketService } from "../../lib/api/socket";
import { useTranslation } from "../../lib/i18n";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, networkStatus, activePatient } = useStore();
  const [stats, setStats] = useState({
    sessions: 0,
    team: 0,
    assets: 0
  });
  const [feed, setFeed] = useState<any[]>([]);
  const [activeUnits, setActiveUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isHospital = user?.userType === 'hospital';

  const triggerRedAlert = () => {
    Haptics.vibrate();
    Haptics.impact({ style: ImpactStyle.Heavy });

    socketService.emit('trigger_red_alert', {
      sender: user?.name,
      channel: 'Global-ER',
      text: `EMERGENCY: Protocol failure reported by ${user?.name}`
    });
    alert("CRITICAL: Red Alert Broadcasted to All Units.");
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const hospitalId = user.hospitalId || 'HOSP-DEFAULT';

        // Parallel requests
        const [patientsRes, assetsRes, sessionsRes, activeRes, alertsRes, teamRes] = await Promise.all([
          api.patients.getAll(hospitalId),
          api.assets.getAll(hospitalId),
          api.sessions.getAll(hospitalId),
          api.sessions.getActive(hospitalId),
          api.alerts.getAll(hospitalId),
          isHospital ? api.auth.getTeam(hospitalId) : Promise.resolve({ data: [] })
        ]);

        setStats({
          sessions: sessionsRes.data.length,
          assets: assetsRes.data.length,
          team: teamRes.data.length
        });

        setActiveUnits(activeRes.data);

        // Generate dynamic feed from real session data + Backend Alerts
        const alertFeed = alertsRes.data.slice(0, 3).map((a: any) => ({
          title: a.title,
          body: a.body,
          category: a.category,
          type: a.type
        }));

        setFeed(alertFeed.length > 0 ? alertFeed : [
          { title: "SYSTEM READY", body: "NeuroSignal Hub v4.2 Platinum Bootstrapped.", category: "SYSTEM" },
        ]);

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh active units every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user, isHospital]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 lg:p-12 rounded-3xl shadow-2xl relative overflow-hidden ${
          isHospital ? 'bg-[#2563EB]' : 'bg-[#3B82F6]'
        }`}
      >
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
              {isHospital ? "INSTITUTIONAL HUB" : "CLINICAL WORKSTATION"}
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-white mb-3">
            Welcome, {user?.name}
          </h1>
          <p className="text-white/70 font-medium max-w-lg">
            {isHospital
              ? `Managing ${user?.hospitalName} � Active Clinical Environment`
              : "Standalone Session Mode � Encrypted Local Processing"}
          </p>
        </div>

        <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden md:block">
           <button
             onClick={() => router.push("/dashboard/admission")}
             className="bg-white text-primary px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-3"
           >
             <Play className="h-5 w-5 fill-primary" />
             <span>INITIALIZE ACQUISITION</span>
           </button>
        </div>

        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="SESSIONS" value={loading ? "..." : stats.sessions.toString()} icon={Activity} color="text-accent" />
        {isHospital ? (
            <StatCard label="TEAM" value={loading ? "..." : stats.team.toString()} icon={Users} color="text-primary" />
        ) : (
            <StatCard label="PRACTICE SQI" value="98.2%" icon={ShieldCheck} color="text-emerald-500" />
        )}
        <StatCard label="ASSETS" value={loading ? "..." : stats.assets.toString()} icon={Package} color="text-secondary" />
        <StatCard label="NETWORK" value={networkStatus || "Clinical-Net"} icon={Wifi} color="text-amber-500" />
      </div>

      {/* Cloud Connectivity Status (Production Bridge) */}
      <div className="flex items-center gap-4 px-8 py-4 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cloud Backbone:</span>
          </div>
          <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-border/50 shadow-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-foreground">RENDER HUB</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-border/50 shadow-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[8px] font-black text-foreground">PAGES FRONTEND</span>
              </div>
          </div>
          <p className="ml-auto text-[8px] font-bold text-slate-400 uppercase italic">
              Distributed Cloud Architecture v4.3.8 (Titanium Separated)
          </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card h-[350px] p-8 flex flex-col items-center justify-center text-center">
            <div className="w-full flex items-center justify-between mb-auto">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Performance</span>
               <div className="flex items-center space-x-2 text-secondary">
                  <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                  <span className="text-[10px] font-black uppercase">Optimal</span>
               </div>
            </div>

            <div className="space-y-4">
              <MonitorHeart className={cn("h-16 w-16 mx-auto", activePatient ? "text-primary animate-pulse" : "text-slate-200 dark:text-slate-800")} />
              <p className="text-sm font-bold text-slate-400">
                {activePatient ? `Monitoring ${activePatient.name}...` : "No active clinical acquisition"}
              </p>
              <button
                onClick={() => router.push(activePatient ? "/dashboard/monitor" : "/dashboard/admission")}
                className="neuro-button bg-primary text-white text-xs px-12"
              >
                {activePatient ? "OPEN LIVE MONITOR" : "INITIALIZE LINK"}
              </button>
            </div>
            <div className="mt-auto" />
          </div>

          {!isHospital && (
            <div className="glass-card p-8 bg-primary text-white space-y-6 relative overflow-hidden group">
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center space-x-3 text-secondary">
                     <ShieldCheck className="h-6 w-6" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Private Vault Active</span>
                  </div>
                  <h4 className="text-xl font-black">Practice Integrity Mode</h4>
                  <p className="text-xs font-medium leading-relaxed opacity-80 max-w-sm">
                    Your sessions are secured within your private specialist node. Patient data is encrypted with your personal clinical signature.
                  </p>
                  <button onClick={() => router.push("/dashboard/archive")} className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-6 py-3 rounded-xl hover:bg-white/30 transition-all">Review Private Archive</button>
               </div>
               <Activity className="absolute -bottom-10 -right-10 h-48 w-48 text-white opacity-10 group-hover:scale-110 transition-transform duration-1000" />
            </div>
          )}

          {isHospital && (
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('unit_status')}</h3>
                   <p className="text-sm font-black text-foreground">Unit-Wide Command Center</p>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <div className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase">Hub Sync Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {activeUnits.length > 0 ? activeUnits.map((unit, i) => (
                    <CommandCenterTile
                        key={unit._id}
                        unit={unit}
                        onMirror={() => router.push(`/dashboard/monitor?mode=mirror&patient=${unit.patient?.patientId}`)}
                    />
                 )) : (
                    <div className="md:col-span-2 py-20 text-center opacity-30 border-2 border-dashed border-border rounded-[2rem]">
                        <Activity className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                        <p className="text-xs font-black uppercase tracking-widest">All units awaiting admission handshake</p>
                    </div>
                 )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          <div className="glass-card p-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">{t('clinical_feed')}</h3>
            <div className="space-y-6">
              {feed.map((item, i) => (
                <FeedItem key={i} title={item.title} body={item.body} category={item.category} />
              ))}
            </div>
          </div>

          {!isHospital && (
            <div className="glass-card p-8 bg-primary text-white space-y-6 relative overflow-hidden group">
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center space-x-3 text-secondary">
                     <ShieldCheck className="h-6 w-6" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Private Vault Active</span>
                  </div>
                  <h4 className="text-xl font-black">Practice Integrity Mode</h4>
                  <p className="text-xs font-medium leading-relaxed opacity-80 max-w-sm">
                    Your sessions are secured within your private specialist node. Patient data is encrypted with your personal clinical signature.
                  </p>
                  <button onClick={() => router.push("/dashboard/archive")} className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-6 py-3 rounded-xl hover:bg-white/30 transition-all">Review Private Archive</button>
               </div>
               <Activity className="absolute -bottom-10 -right-10 h-48 w-48 text-white opacity-10 group-hover:scale-110 transition-transform duration-1000" />
            </div>
          )}

          {isHospital && (
            <div className="glass-card p-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Management Connect</h3>
              <div className="space-y-3">
                 <QuickAction icon={TrendingUp} label="Open Workstack" onClick={() => router.push("/dashboard/monitor")} />
                 <QuickAction icon={Users} label="Manage Staff" onClick={() => router.push("/dashboard/team")} />
                 <QuickAction icon={AlertCircle} label="Audit Protocols" onClick={() => router.push("/dashboard/diagnostics")} />
                 <div className="pt-4">
                    <button
                      onClick={triggerRedAlert}
                      className="w-full py-4 bg-error text-white rounded-2xl font-black text-xs shadow-lg shadow-red-200 flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                    >
                       <AlertCircle className="h-4 w-4" />
                       <span>RED ALERT</span>
                    </button>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommandCenterTile({ unit, onMirror }: any) {
  const isECG = unit.testType === 'ECG';
  // Reduced data for mini view
  const { channels } = useWaveform(1, true, false, undefined, 25);
  const [alert, setAlert] = useState(false);

  // Simulated Alert Bus logic for multi-room demonstration
  useEffect(() => {
    if (Math.random() > 0.98) setAlert(true);
    const timer = setTimeout(() => setAlert(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn(
        "p-6 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col space-y-4 group",
        alert ? "bg-red-500/5 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]" : "bg-slate-50 dark:bg-slate-900/50 border-border/50 hover:border-primary/30"
    )}>
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center", isECG ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500")}>
               <MonitorHeart className="h-4 w-4" />
            </div>
            <div>
               <p className="text-xs font-black text-foreground truncate max-w-[100px]">{unit.patient?.name}</p>
               <p className="text-[8px] font-black text-slate-400 uppercase">MRN: {unit.patient?.patientId}</p>
            </div>
         </div>
         {alert && <AlertCircle className="h-4 w-4 text-red-500 animate-bounce" />}
         {!alert && <button onClick={onMirror} className="text-slate-300 hover:text-primary transition-all opacity-0 group-hover:opacity-100"><Maximize2 className="h-4 w-4" /></button>}
      </div>

      <div className="h-24 bg-black rounded-2xl border border-white/5 overflow-hidden relative">
         <SignalCanvas
            label=""
            filteredData={channels.filtered[0]}
            isLive={true}
            isPaused={false}
            showRaw={false}
            color={alert ? "#EF4444" : (isECG ? "#10B981" : "#3B82F6")}
         />
         {alert && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/30">
         <div className="flex items-center gap-1.5">
            <div className={cn("h-1.5 w-1.5 rounded-full", alert ? "bg-red-500" : "bg-emerald-500 animate-pulse")} />
            <span className={cn("text-[8px] font-black uppercase", alert ? "text-red-500" : "text-slate-400")}>
                {alert ? "CRITICAL ALERT" : `${unit.testType} ACTIVE`}
            </span>
         </div>
         {isECG && <span className="text-[9px] font-black text-emerald-500">72 BPM</span>}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card p-6 flex flex-col justify-between"
    >
      <div className="flex items-center space-x-3 mb-4">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <h4 className="text-2xl font-black text-foreground">{value}</h4>
    </motion.div>
  );
}

function UnitRow({ name, status, active, onMirror, bpm }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center space-x-3">
        <div className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-secondary animate-pulse' : 'bg-slate-300'}`} />
        <div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground block">{name}</span>
                {bpm && <span className="text-[9px] font-black text-emerald-500 animate-pulse">{bpm} BPM</span>}
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase">{status}</span>
        </div>
      </div>
      {active && onMirror && (
          <button
            onClick={onMirror}
            className="h-8 px-4 bg-primary text-white rounded-lg font-black text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-primary/20"
          >
            Mirror Stream
          </button>
      )}
    </div>
  );
}

function FeedItem({ title, body, category }: any) {
  return (
    <div className="space-y-1">
      <span className="text-[8px] font-black text-primary uppercase tracking-widest">{category} � {title}</span>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed truncate">{body}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-xs font-bold">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300" />
    </button>
  );
}
