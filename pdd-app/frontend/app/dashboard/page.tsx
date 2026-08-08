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

import { useRouter } from "next/navigation";
import { socketService } from "../../lib/api/socket";

export default function DashboardPage() {
  const router = useRouter();
  const { user, networkStatus } = useStore();
  const [stats, setStats] = useState({
    sessions: 0,
    team: 0,
    assets: 0
  });
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isHospital = user?.userType === 'hospital';

  const triggerRedAlert = () => {
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
        const [patientsRes, assetsRes, sessionsRes, teamRes] = await Promise.all([
          api.patients.getAll(hospitalId),
          api.assets.getAll(hospitalId),
          api.sessions.getAll(hospitalId),
          isHospital ? api.auth.getTeam(hospitalId) : Promise.resolve({ data: [] })
        ]);

        setStats({
          sessions: sessionsRes.data.length,
          assets: assetsRes.data.length,
          team: teamRes.data.length
        });

        // Generate dynamic feed from real session data
        const sessionFeed = sessionsRes.data.slice(0, 3).map((s: any) => ({
          title: "SESSION FINALIZED",
          body: `Analysis complete for ${s.patient?.name} (${s.testType}). Quality: ${s.quality}%.`,
          category: "CLINICAL"
        }));

        setFeed([
          ...sessionFeed,
          { title: "PROTOCOL UPDATE", body: "New artifact suppression algorithm v2.5 deployed.", category: "SYSTEM" },
        ]);

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
              ? `Managing ${user?.hospitalName} • Active Clinical Environment`
              : "Standalone Session Mode • Encrypted Local Processing"}
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
        {isHospital && <StatCard label="TEAM" value={loading ? "..." : stats.team.toString()} icon={Users} color="text-primary" />}
        <StatCard label="ASSETS" value={loading ? "..." : stats.assets.toString()} icon={Package} color="text-secondary" />
        <StatCard label="NETWORK" value={networkStatus || "Clinical-Net"} icon={Wifi} color="text-amber-500" />
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
              <MonitorHeart className="h-16 w-16 text-slate-200 dark:text-slate-800 mx-auto" />
              <p className="text-sm font-bold text-slate-400">No active clinical acquisition</p>
              <button
                onClick={() => router.push("/dashboard/admission")}
                className="neuro-button bg-primary text-white text-xs px-12"
              >
                INITIALIZE LINK
              </button>
            </div>
            <div className="mt-auto" />
          </div>

          {isHospital && (
            <div className="glass-card p-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Multi-Unit Status</h3>
              <div className="space-y-6">
                 <UnitRow name="Emergency Unit" status="3 Active Sessions" active />
                 <UnitRow name="Neurology Lab" status="1 Active Session" active />
                 <UnitRow name="ICU West Wing" status="No Activity" />
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          <div className="glass-card p-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Clinical Feed</h3>
            <div className="space-y-6">
              {feed.map((item, i) => (
                <FeedItem key={i} title={item.title} body={item.body} category={item.category} />
              ))}
            </div>
          </div>

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

function UnitRow({ name, status, active }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-secondary' : 'bg-slate-300'}`} />
        <span className="text-sm font-bold text-foreground">{name}</span>
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase">{status}</span>
    </div>
  );
}

function FeedItem({ title, body, category }: any) {
  return (
    <div className="space-y-1">
      <span className="text-[8px] font-black text-primary uppercase tracking-widest">{category} • {title}</span>
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
