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
  LayoutDashboard as Hub
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../../lib/api/client";
import { socketService } from "../../lib/api/socket";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { user, setNavIndex, networkStatus, activePatient } = useStore();
  const [stats, setStats] = useState({
    sessions: 0,
    team: 0,
    assets: 0
  });
  const [liveUnits, setLiveUnits] = useState<any[]>([
    { name: "Emergency Unit", status: "Active", active: true },
    { name: "Neurology Lab", status: "Active", active: true },
    { name: "ICU West Wing", status: "Idle", active: false }
  ]);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isHospital = user?.userType === 'hospital';

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const hospitalId = user.hospitalId || 'HOSP-DEFAULT';

        // Parallel requests
        const [patientsRes, assetsRes, teamRes] = await Promise.all([
          api.patients.getAll(hospitalId),
          api.assets.getAll(hospitalId),
          isHospital ? api.auth.getTeam(hospitalId) : Promise.resolve({ data: [] })
        ]);

        setStats({
          sessions: patientsRes.data.length,
          assets: assetsRes.data.length,
          team: teamRes.data.length
        });

        setFeed([
          { title: "PROTOCOL UPDATE", body: "New artifact suppression algorithm v2.5 deployed.", category: "SYSTEM" },
          { title: "ASSET ALERT", body: "ECG Patch inventory below critical threshold (20% remaining).", category: "LOGISTICS" },
          { title: "SECURITY AUDIT", body: "Zero anomalies detected in last 24h integrity scan.", category: "SEC" }
        ]);

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup Real-time updates
    socketService.connect();
    socketService.onMessage((data) => {
       if (data.type === 'UNIT_UPDATE') {
          // Update live unit status in real-time
       }
    });

  }, [user, isHospital]);

  const handleQuickStart = () => {
    if (activePatient) {
        router.push("/dashboard/monitor");
    } else {
        router.push("/dashboard/admission");
    }
  };

  const triggerEmergency = () => {
     socketService.triggerRedAlert("Emergency Unit", user?.name || "System", "CRITICAL: MANUAL TRIGGER FROM DASHBOARD");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 lg:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden ${
          isHospital ? 'bg-[#2563EB]' : 'bg-[#3B82F6]'
        }`}
      >
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
              {isHospital ? "INSTITUTIONAL HUB" : "CLINICAL WORKSTATION"}
            </span>
          </div>

          <h1 className="text-3xl lg:text-5xl font-black text-white mb-4 tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-white/70 font-medium max-w-lg leading-relaxed">
            {isHospital
              ? `Managing ${user?.hospitalName} • Active Clinical Environment`
              : "Standalone Session Mode • Encrypted Local Processing"}
          </p>
        </div>

        <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden md:block">
           <button
             onClick={handleQuickStart}
             className="bg-white text-primary px-10 py-5 rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-4 group"
           >
             <Play className="h-5 w-5 fill-primary group-hover:animate-pulse" />
             <span className="text-sm uppercase tracking-widest">Initialize Acquisition</span>
           </button>
        </div>

        <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="SESSIONS" value={loading ? "..." : stats.sessions.toString()} icon={Activity} color="text-accent" onClick={() => router.push('/dashboard/archive')} />
        {isHospital && <StatCard label="TEAM" value={loading ? "..." : stats.team.toString()} icon={Users} color="text-primary" onClick={() => router.push('/dashboard/team')} />}
        <StatCard label="ASSETS" value={loading ? "..." : stats.assets.toString()} icon={Package} color="text-secondary" />
        <StatCard label="NETWORK" value={networkStatus || "Clinical-Net"} icon={Wifi} color="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card h-[380px] p-8 flex flex-col items-center justify-center text-center group">
            <div className="w-full flex items-center justify-between mb-auto">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Performance</span>
               <div className="flex items-center space-x-2 text-secondary">
                  <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                  <span className="text-[10px] font-black uppercase">Optimal</span>
               </div>
            </div>

            <div className="space-y-6">
              <div className="h-24 w-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto border-2 border-border/50 group-hover:scale-110 transition-transform">
                <MonitorHeart className="h-10 w-10 text-slate-200 dark:text-slate-700" />
              </div>
              <div className="space-y-2">
                 <p className="text-sm font-black text-foreground uppercase tracking-widest">Workstation Ready</p>
                 <p className="text-xs font-medium text-slate-400">No active clinical acquisition in progress</p>
              </div>
              <button
                onClick={handleQuickStart}
                className="neuro-button bg-primary text-white text-[10px] px-12 tracking-widest uppercase shadow-lg shadow-primary/20"
              >
                Start New Session
              </button>
            </div>
            <div className="mt-auto" />
          </div>

          {isHospital && (
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Multi-Unit Status</h3>
                 <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">View Map</button>
              </div>
              <div className="space-y-6">
                 {liveUnits.map((unit, i) => (
                    <UnitRow key={i} name={unit.name} status={unit.status} active={unit.active} />
                 ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          <div className="glass-card p-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">Clinical Feed</h3>
            <div className="space-y-8">
              {feed.map((item, i) => (
                <FeedItem key={i} title={item.title} body={item.body} category={item.category} />
              ))}
            </div>
          </div>

          {isHospital && (
            <div className="glass-card p-8 bg-slate-50/30 dark:bg-slate-800/20 border-2 border-primary/10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">Management Connect</h3>
              <div className="space-y-4">
                 <QuickAction icon={TrendingUp} label="Open Workstack" onClick={() => router.push('/dashboard/diagnostics')} />
                 <QuickAction icon={Users} label="Manage Staff" onClick={() => router.push('/dashboard/team')} />
                 <QuickAction icon={AlertCircle} label="Audit Protocols" onClick={() => router.push('/dashboard/security')} />
                 <div className="pt-6">
                    <button
                      onClick={triggerEmergency}
                      className="w-full py-5 bg-error text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-red-200 dark:shadow-none flex items-center justify-center space-x-3 active:scale-95 transition-all"
                    >
                       <AlertCircle className="h-4 w-4 animate-bounce" />
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

function StatCard({ label, value, icon: Icon, color, onClick }: any) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className={cn(
        "glass-card p-8 flex flex-col justify-between cursor-pointer transition-all",
        onClick && "hover:border-primary/50"
      )}
    >
      <div className="flex items-center space-x-4 mb-6">
        <div className={cn("h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-border/50", color)}>
           <Icon className="h-5 w-5" />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <h4 className="text-3xl font-black text-foreground tracking-tight">{value}</h4>
    </motion.div>
  );
}

function UnitRow({ name, status, active }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-border/50 transition-all cursor-pointer">
      <div className="flex items-center space-x-4">
        <div className={`h-2 w-2 rounded-full ${active ? 'bg-secondary animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
        <span className="text-sm font-bold text-foreground">{name}</span>
      </div>
      <span className={cn("text-[9px] font-black uppercase px-3 py-1 rounded-full", active ? "bg-secondary/10 text-secondary" : "bg-slate-100 text-slate-400")}>
         {status}
      </span>
    </div>
  );
}

function FeedItem({ title, body, category }: any) {
  return (
    <div className="space-y-2 group cursor-pointer">
      <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] group-hover:text-accent transition-colors">{category} • {title}</span>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{body}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group active:scale-[0.98]"
    >
      <div className="flex items-center space-x-4">
        <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-all" />
    </button>
  );
}
