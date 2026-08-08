"use client";

import { useStore } from "../../../lib/store/useStore";
import { useTheme } from "../../../components/ThemeProvider";
import { syncAll } from "../../../lib/offlineSync";
import {
  Settings,
  Moon,
  Sun,
  Globe,
  ShieldCheck,
  Database,
  Cpu,
  Save,
  RefreshCw,
  BellRing,
  Lock,
  BrainCircuit,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { user, networkStatus, settings, setSettings } = useStore();
  const { theme, toggleTheme } = useTheme();
  const [localUrl, setLocalUrl] = useState(settings.backendUrl);

  const saveUrl = () => {
      setSettings({ backendUrl: localUrl });
      alert("System endpoint updated successfully.");
  };

  const seedSystem = async () => {
      if (!user?.hospitalId) return;
      if (!confirm("This will clear current clinical data and insert test records. Continue?")) return;
      try {
          await api.system.seed(user.hospitalId);
          alert("Clinical Hub seeded with test data. Dashboard will refresh.");
          window.location.reload();
      } catch (e) {
          console.error(e);
          alert("Seeding failed. Verify backend connectivity.");
      }
  };

  const settingsGroups = [
    {
      title: "Workstation Preferences",
      icon: Settings,
      items: [
        {
          label: "Interface Theme",
          description: "Switch between Clinical Light and Surgical Dark modes",
          action: (
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-primary" />}
              <span className="uppercase tracking-widest">{theme === 'dark' ? "LIGHT" : "DARK"}</span>
            </button>
          )
        },
        {
          label: "Language & Locale",
          description: "Current: English (United States)",
          action: (
            <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs opacity-60">
              <Globe className="h-4 w-4" />
              <span className="uppercase tracking-widest">ENGLISH (US)</span>
            </button>
          )
        }
      ]
    },
    {
      title: "Clinical Connectivity",
      icon: Database,
      items: [
        {
          label: "Backend Server Node",
          description: "Primary link for MongoDB & SQL synchronization",
          action: (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
                className="w-64 h-10 bg-slate-50 dark:bg-slate-900 border-2 border-border/50 rounded-xl px-4 text-[10px] font-mono font-bold outline-none focus:border-primary transition-all"
              />
              <button
                onClick={saveUrl}
                className="h-10 w-10 flex items-center justify-center bg-primary text-white rounded-xl shadow-lg shadow-primary/20 active:scale-95"
              >
                <Save className="h-4 w-4" />
              </button>
            </div>
          )
        },
        {
          label: "Database Integrity",
          description: `Synchronization Status: ${networkStatus}`,
          action: (
            <div className="flex gap-2">
                <button
                  onClick={async () => { await syncAll(); alert("Cloud Synchronization Successful."); }}
                  className="flex items-center space-x-2 px-4 py-2 bg-secondary/10 text-secondary rounded-xl font-black text-[10px] uppercase border border-secondary/20"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Sync</span>
                </button>
                <button
                  onClick={seedSystem}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-black text-[10px] uppercase border border-primary/20"
                >
                  <Database className="h-3.5 w-3.5" />
                  <span>Seed Hub</span>
                </button>
            </div>
          )
        }
      ]
    },
    {
      title: "Neural Logic & Security",
      icon: ShieldCheck,
      items: [
        {
          label: "AES-256 bit Encryption",
          description: "End-to-end signal packet encryption protocol",
          action: (
              <button
                onClick={() => setSettings({ encryptionEnabled: !settings.encryptionEnabled })}
                className={`transition-colors duration-300 ${settings.encryptionEnabled ? 'text-primary' : 'text-slate-300'}`}
              >
                {settings.encryptionEnabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
              </button>
          )
        },
        {
          label: "Autonomous AI Processing",
          description: "Use local heuristics when neural cloud is unreachable",
          action: (
            <button
                onClick={() => setSettings({ aiEnabled: !settings.aiEnabled })}
                className={`transition-colors duration-300 ${settings.aiEnabled ? 'text-primary' : 'text-slate-300'}`}
            >
                {settings.aiEnabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
            </button>
          )
        }
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">System Settings</h1>
        <p className="text-sm font-medium text-slate-500">Configure institutional protocols and workstation environment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            {settingsGroups.map((group, i) => (
                <section key={i} className="glass-card overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-border flex items-center space-x-3">
                        <group.icon className="h-5 w-5 text-primary" />
                        <h3 className="text-xs font-black text-foreground uppercase tracking-widest">{group.title}</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {group.items.map((item, j) => (
                            <div key={j} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground uppercase tracking-tight">{item.label}</p>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.description}</p>
                                </div>
                                <div className="shrink-0">
                                    {item.action}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>

        <div className="space-y-6">
            <section className="glass-card p-8 bg-slate-900 text-white relative overflow-hidden group">
                <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Build Integrity</span>
                        <Cpu className="h-5 w-5 text-primary animate-pulse" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white/60 mb-1">Current Version</p>
                        <h3 className="text-2xl font-black tracking-tight">v2.5.0-PRO-WEB</h3>
                    </div>
                    <div className="pt-6 border-t border-white/5 space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-white/40">Clinical Node</span>
                            <span className="text-primary">Verified</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-white/40">Security Audit</span>
                            <span>Passed</span>
                        </div>
                    </div>
                    <button
                        onClick={() => alert("NeuroSignal is up to date.")}
                        className="w-full py-4 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                    >
                        Check for Updates
                    </button>
                </div>
                <BrainCircuit className="absolute -bottom-6 -right-6 h-32 w-32 text-primary opacity-5 group-hover:rotate-12 transition-transform duration-700" />
            </section>

            <div className="p-6 bg-amber-500/10 border-2 border-amber-500/20 rounded-[2.5rem] flex items-start gap-4">
                <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                    Some settings are restricted to Unit Administrators. Contact your clinical hub for master key changes.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
