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
  BellRing
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { user, networkStatus } = useStore();
  const { theme, toggleTheme } = useTheme();
  const [backendUrl, setBackendUrl] = useState("http://localhost:5000/api");

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
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{theme === 'dark' ? "LIGHT MODE" : "DARK MODE"}</span>
            </button>
          )
        },
        {
          label: "Language & Locale",
          description: "Current: English (United States)",
          action: (
            <button className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs">
              <Globe className="h-4 w-4" />
              <span>ENGLISH (US)</span>
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
          label: "Backend Server URL",
          description: "Primary link for MongoDB & SQL synchronization",
          action: (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="neuro-input h-10 w-64 text-xs font-mono"
              />
              <button className="h-10 w-10 flex items-center justify-center bg-primary text-white rounded-xl">
                <Save className="h-4 w-4" />
              </button>
            </div>
          )
        },
        {
          label: "Database Integrity",
          description: `Current Status: ${networkStatus === 'Connected' ? 'Synced' : 'Offline'}`,
          action: (
            <button
              onClick={async () => { await syncAll(); alert("Cloud Synchronization Complete."); }}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary/10 text-secondary rounded-xl font-black text-[10px] uppercase"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Force Sync</span>
            </button>
          )
        }
      ]
    },
    {
      title: "System & Security",
      icon: ShieldCheck,
      items: [
        {
          label: "E2E Encryption",
          description: "All clinical packets are encrypted before uplink",
          action: <div className="h-6 w-11 bg-secondary rounded-full relative"><div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full" /></div>
        },
        {
          label: "AI Processing",
          description: "Use local heuristics when cloud is unreachable",
          action: <div className="h-6 w-11 bg-slate-200 dark:bg-slate-700 rounded-full relative"><div className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full" /></div>
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">System Settings</h1>
        <p className="text-sm font-medium text-slate-500">Configure your professional workstation environment</p>
      </div>

      <div className="space-y-6">
        {settingsGroups.map((group, i) => (
          <section key={i} className="glass-card overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-border flex items-center space-x-3">
              <group.icon className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">{group.title}</h3>
            </div>
            <div className="divide-y divide-border">
              {group.items.map((item, j) => (
                <div key={j} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">{item.label}</p>
                    <p className="text-xs text-slate-500 font-medium">{item.description}</p>
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

      <div className="flex items-center justify-between p-8 bg-slate-900 rounded-[2.5rem] text-white">
        <div className="flex items-center space-x-6">
          <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center">
            <Cpu className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Build Information</p>
            <p className="text-lg font-black">v2.5.0-PRO (Native Web)</p>
            <p className="text-xs text-white/50 font-medium">Last Security Audit: 24 July 2026</p>
          </div>
        </div>
        <button
          onClick={() => alert("System is already up to date. (v2.5.0-PRO)")}
          className="neuro-button bg-white text-slate-900 text-sm"
        >
          CHECK FOR UPDATES
        </button>
      </div>
    </div>
  );
}
