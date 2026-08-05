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
  Stethoscope,
  Hospital,
  Microscope,
  Lock,
  ChevronRight,
  Smartphone,
  Monitor
} from "lucide-react";
import Link from "next/link";
import ClinicalDisclaimer from "../../components/ClinicalDisclaimer";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-white selection:bg-primary/30 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-border/50 safe-header">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <img src="https://ravi123sv.github.io/pdd-project/assets/icon/app_icon.svg" className="h-6 w-6" alt="Logo" />
            </div>
            <span className="text-lg font-black tracking-tighter">NEUROSIGNAL</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/auth/login")}
              className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors hidden sm:block"
            >
              Access Portal
            </button>
            <button
              onClick={() => router.push("/auth/login")}
              className="bg-primary text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Enter Workstation
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - The "Value" Section */}
      <section className="pt-48 pb-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10 relative z-10"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Activity className="h-3 w-3 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Clinical-Grade Precision</span>
            </div>

            <div className="space-y-6">
                <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900 dark:text-white">
                  Monitor <br />
                  <span className="text-primary">Vital Signals</span> <br />
                  in Real-Time.
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
                  The unified workstation for neurologists and cardiologists. Capture, analyze, and store high-fidelity waveforms with AI-assisted diagnostics.
                </p>
            </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button
                onClick={() => router.push("/auth/login")}
                className="h-16 px-10 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 flex items-center justify-center space-x-4 hover:scale-105 active:scale-95 transition-all"
              >
                <span>Launch Workstation</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <div className="flex gap-2">
                  <a
                    href="/pdd-project/downloads/neurosignal.apk"
                    className="h-16 w-16 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white border-2 border-border/50 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all"
                    title="Download Android APK"
                  >
                    <Smartphone className="h-6 w-6" />
                  </a>
                  <a
                    href="/pdd-project/downloads/neurosignal.exe"
                    className="h-16 w-16 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white border-2 border-border/50 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all"
                    title="Download Windows EXE"
                  >
                    <Monitor className="h-6 w-6" />
                  </a>
              </div>
            </div>

            <div className="flex items-center space-x-8 pt-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-black">99.9%</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest">Uptime</span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-black">42ms</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest">Latency</span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-black">12-Lead</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest">Capability</span>
                </div>
            </div>
          </motion.div>

          {/* Visual Evidence of Utility */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-[3rem] bg-slate-900 shadow-2xl border-4 border-slate-800 p-2 overflow-hidden">
                <div className="h-full w-full rounded-[2.5rem] bg-slate-950 overflow-hidden flex flex-col">
                   <div className="p-6 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                         <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Patient: MRN-1002</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-4 w-12 bg-white/5 rounded" />
                        <div className="h-4 w-12 bg-white/5 rounded" />
                      </div>
                   </div>
                   <div className="flex-1 p-6 space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 w-full bg-white/5 rounded-xl relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]" />
                           <div className="absolute top-2 left-3 text-[8px] font-black text-white/20 uppercase tracking-widest">Lead {i+1}</div>
                        </div>
                      ))}
                      <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                         <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">AI Recommendation</p>
                         <p className="text-[11px] font-medium text-white/70">Potential early-onset arrhythmia detected. Lead V2 suggests immediate physical lead contact verification.</p>
                      </div>
                   </div>
                </div>
            </div>
            {/* Context Badge */}
            <div className="absolute -bottom-6 -right-6 bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-2xl border border-border/50 max-w-[240px]">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">HIPAA SECURE</span>
                </div>
                <p className="text-xs font-bold leading-relaxed text-slate-500">
                    Encrypted at source. Patient identity never leaves your workstation.
                </p>
            </div>
          </motion.div>
        </div>

        {/* Backdrop elements */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      </section>

      {/* Core Use Cases - The "Who is it for?" Section */}
      <section className="py-32 px-6 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black tracking-tighter">Engineered for Medical Specialists.</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">
              NeuroSignal replaces outdated monitoring systems with a cloud-connected, AI-driven intelligent workstation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <UseCaseCard
              icon={Stethoscope}
              title="Individual Doctors"
              desc="Perfect for private clinics. Securely track patient histories and use AI to analyze ECG/EEG signals during routine checkups."
            />
            <UseCaseCard
              icon={Hospital}
              title="Hospital Networks"
              desc="Deploy to multiple units (ICU, ER, Labs). Sync all patient data to a central database and manage staff access in one hub."
            />
            <UseCaseCard
              icon={Microscope}
              title="Research Teams"
              desc="Export high-fidelity physiological data in clinical formats (EDF/CSV) for advanced signal processing and academic study."
            />
          </div>
        </div>
      </section>

      {/* Primary Features - The "How it helps" Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <div className="order-2 lg:order-1 relative">
              <div className="space-y-4">
                 <FeatureRow
                    title="Live Clinical Streaming"
                    text="Connect wireless medical sensors via Web Bluetooth or use our direct Serial link for zero-latency monitoring."
                 />
                 <FeatureRow
                    title="Neural Logic Interpretation"
                    text="Identify anomalies instantly. Our Gemini-powered AI detects spikes and rhythmic shifts the human eye might miss."
                    active
                 />
                 <FeatureRow
                    title="Seamless Patient Admission"
                    text="Register patients in seconds. Automatically link clinical telemetry to their medical record number (MRN)."
                 />
              </div>
           </div>

           <div className="order-1 lg:order-2 space-y-8">
              <h2 className="text-5xl font-black tracking-tighter leading-tight">Eliminate Clinical <br /> Blind-spots.</h2>
              <p className="text-lg font-medium text-slate-500 leading-relaxed">
                Raw data is overwhelming. NeuroSignal converts noisy signals into clear clinical recommendations, allowing you to focus on the patient, not the equipment.
              </p>
              <ul className="space-y-4">
                 {["12-Lead Real-time Rendering", "Automated PDF Report Generation", "Multi-Unit Alert Broadcasting"].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3 text-sm font-black uppercase tracking-widest text-primary">
                       <Zap className="h-4 w-4" />
                       <span>{item}</span>
                    </li>
                 ))}
              </ul>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6">
        <div className="max-w-4xl mx-auto bg-primary rounded-[4rem] p-16 lg:p-24 text-center space-y-10 shadow-3xl shadow-primary/30 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '32px 32px' }} />
           <div className="relative z-10 space-y-6">
              <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter">Ready to Begin?</h2>
              <p className="text-white/70 text-lg font-medium max-w-lg mx-auto leading-relaxed">
                Join the network of medical professionals using NeuroSignal for next-generation clinical monitoring.
              </p>
           </div>
           <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-6">
              <button
                onClick={() => router.push("/auth/login")}
                className="h-20 px-12 bg-white text-primary rounded-3xl font-black text-sm uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl"
              >
                Launch Workstation
              </button>
              <button
                onClick={() => router.push("/verify-hospital")}
                className="h-20 px-12 bg-primary-dark/20 text-white border-2 border-white/20 rounded-3xl font-black text-sm uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
              >
                Register Hospital
              </button>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-border/50 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
             <div className="space-y-6 md:col-span-2">
                <div className="flex items-center space-x-3">
                   <img src="https://ravi123sv.github.io/pdd-project/assets/icon/app_icon.svg" className="h-8 w-8" alt="Logo" />
                   <span className="text-xl font-black tracking-tighter">NEUROSIGNAL</span>
                </div>
                <p className="text-sm font-medium text-slate-500 max-w-sm leading-relaxed">
                   Advancing clinical care through high-fidelity signal analysis and neural logic. Professional tools for the modern practitioner.
                </p>
                <div className="pt-4 border-t border-border/50 w-64">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Legal Compliance</p>
                   <p className="text-[9px] font-medium text-slate-400 italic">HIPAA • GDPR • E2EE SECURED</p>
                </div>
             </div>
             <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-6">Workstation</h4>
                <ul className="space-y-4">
                   <li><Link href="/auth/login" className="text-xs font-bold text-slate-400 hover:text-primary">Clinical Gateway</Link></li>
                   <li><Link href="/dashboard/monitor" className="text-xs font-bold text-slate-400 hover:text-primary">Live Monitor</Link></li>
                   <li><Link href="/verify-hospital" className="text-xs font-bold text-slate-400 hover:text-primary">Institutional Hub</Link></li>
                </ul>
             </div>
             <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-6">Legal</h4>
                <ul className="space-y-4">
                   <li><Link href="/privacy" className="text-xs font-bold text-slate-400 hover:text-primary">Privacy Protocol</Link></li>
                   <li><Link href="/privacy" className="text-xs font-bold text-slate-400 hover:text-primary">License Terms</Link></li>
                   <li><Link href="/privacy" className="text-xs font-bold text-slate-400 hover:text-primary">HIPAA Compliance</Link></li>
                </ul>
             </div>
          </div>

          <div className="mb-10">
             <ClinicalDisclaimer />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-border/50">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               © 2026 NeuroSignal Enterprise AI • Surgical Precision in Web Monitoring
             </p>
             <div className="flex space-x-6">
                <Globe className="h-4 w-4 text-slate-300" />
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Global Clinical Network</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function UseCaseCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="space-y-6 group cursor-pointer">
      <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
        <Icon className="h-8 w-8" />
      </div>
      <div className="space-y-4">
        <h4 className="text-2xl font-black tracking-tight">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
        <div className="flex items-center space-x-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-black uppercase tracking-widest">Learn More</span>
            <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ title, text, active }: any) {
    return (
        <div className={`p-8 rounded-[2rem] border-2 transition-all ${active ? 'bg-white dark:bg-slate-800 border-primary shadow-2xl' : 'border-transparent opacity-60 hover:opacity-100'}`}>
            <h4 className="text-xl font-black mb-2 tracking-tight">{title}</h4>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">{text}</p>
        </div>
    );
}
