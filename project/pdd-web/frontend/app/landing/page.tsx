"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  BrainCircuit,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  Database,
  Lock
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <img src="/assets/icon/app_icon.svg" className="h-6 w-6" alt="Logo" />
            </div>
            <span className="text-lg font-black tracking-tighter">NEUROSIGNAL</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/auth/login")}
              className="text-sm font-black uppercase tracking-widest hover:text-primary transition-colors"
            >
              Access Portal
            </button>
            <button
              onClick={() => router.push("/auth/login")}
              className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 relative z-10"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Zap className="h-3 w-3" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Enterprise v2.5 Active</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
              The Future of <br />
              <span className="text-primary">Clinical AI</span> <br />
              Monitoring.
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
              NeuroSignal provides high-fidelity neural waveform analysis, AI-driven diagnostics, and multi-tenant clinical synchronization for the modern healthcare enterprise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => router.push("/auth/login")}
                className="h-16 px-10 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 flex items-center justify-center space-x-3 hover:scale-105 active:scale-95 transition-all"
              >
                <span>Launch Workstation</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button className="h-16 px-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                View Documentation
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-primary/20 to-secondary/20 p-8 border border-white/10 overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="h-full w-full rounded-2xl bg-slate-900 shadow-2xl overflow-hidden border border-white/5 p-6 flex flex-col space-y-4">
                   <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div className="flex items-center space-x-2">
                         <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                         <span className="text-[10px] font-black text-secondary uppercase">Live Acquisition</span>
                      </div>
                      <div className="h-2 w-12 bg-white/5 rounded-full" />
                   </div>
                   <div className="flex-1 flex flex-col space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex-1 bg-white/5 rounded-lg relative overflow-hidden">
                           <div className="absolute inset-0 bg-primary/10 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                        </div>
                      ))}
                   </div>
                </div>
            </div>
            {/* Floating stats */}
            <div className="absolute -top-4 -right-4 glass-card p-4 shadow-2xl border border-white/10">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Processing Latency</p>
              <p className="text-xl font-black text-secondary">42ms</p>
            </div>
          </motion.div>
        </div>

        {/* Background Gradients */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]" />
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Enterprise Clinical Backbone.</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">
              NeuroSignal bridges the gap between raw physiological signals and actionable clinical intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={BrainCircuit}
              title="Neural Logic AI"
              desc="Real-time waveform interpretation using Gemini 1.5 Pro architecture."
            />
            <FeatureCard
              icon={Database}
              title="Multi-Tenant Sync"
              desc="Automatic synchronization between local workstations and hospital SQL hubs."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Clinical Integrity"
              desc="E2E encrypted telemetry with HIPAA-compliant identity scrubbing at the edge."
            />
            <FeatureCard
              icon={Globe}
              title="Web Handshake"
              desc="Direct clinical sensor link via Web Bluetooth and Serial protocols."
            />
          </div>
        </div>
      </section>

      {/* Two Login Modes Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tight">Tailored to Your Practice.</h2>
            <p className="text-slate-500 font-medium">Choose your workstation profile to begin acquisition.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
             <div className="glass-card p-10 space-y-8 hover:border-primary/50 transition-colors">
                <div className="h-14 w-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                   <Database className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black uppercase tracking-tight">Hospital / Enterprise</h3>
                   <p className="text-sm text-slate-500 leading-relaxed font-medium">
                     For medical institutions requiring shared databases, team management, and multi-unit synchronization.
                   </p>
                </div>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="flex items-center space-x-2 text-xs font-black text-primary uppercase tracking-[0.2em]"
                >
                  <span>Link Hospital Key</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
             </div>

             <div className="glass-card p-10 space-y-8 hover:border-secondary/50 transition-colors">
                <div className="h-14 w-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                   <Lock className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black uppercase tracking-tight">Private Practitioner</h3>
                   <p className="text-sm text-slate-500 leading-relaxed font-medium">
                     For individual specialists focusing on private session history and independent signal analysis.
                   </p>
                </div>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="flex items-center space-x-2 text-xs font-black text-secondary uppercase tracking-[0.2em]"
                >
                  <span>Sign in with Google</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center space-x-3 grayscale opacity-50">
              <img src="/assets/icon/app_icon.svg" className="h-8 w-8" alt="Logo" />
              <span className="text-sm font-black tracking-tighter">NEUROSIGNAL</span>
           </div>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
             © 2026 NeuroSignal Enterprise AI • Surgical Precision in Web Monitoring
           </p>
           <div className="flex space-x-6">
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Terms</a>
           </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-border shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6 hover:-translate-y-2 transition-transform duration-300">
      <div className="h-12 w-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h4 className="text-lg font-black tracking-tight">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}
