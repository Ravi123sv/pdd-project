"use client";

import { useStore } from "../../lib/store/useStore";
import {
  Zap,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  BrainCircuit,
  Activity,
  Globe,
  Lock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { api } from "../../lib/api/client";
import { motion } from "framer-motion";

export default function SubscriptionsPage() {
  const { user } = useStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await api.payments.createCheckoutSession(planId, user?.email || "");
      if (res.data.url) window.location.href = res.data.url;
    } catch (e) {
      console.error(e);
      alert("Payment hub connection timeout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] py-24 px-8 selection:bg-primary/30">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase">Clinical Scale AI</h1>
          <p className="text-lg font-medium text-slate-500 leading-relaxed">
            Choose the neural logic tier that matches your unit's diagnostic requirements and data sovereignty needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PlanCard
            name="Neural Logic"
            price="0"
            desc="Sovereign local diagnostics for private clinics."
            features={[
              "100% Private Local Engine",
              "12-Lead GPU Rendering",
              "Patient Registry (100 MRNs)",
              "Local PDF Reports",
              "Standard Signal History"
            ]}
            icon={Cpu}
            loading={loading === 'free'}
            onSelect={() => handleSubscribe('free')}
            active={!user?.subscriptionTier || user?.subscriptionTier === 'free'}
          />

          <PlanCard
            name="Enterprise 2.5"
            price="149"
            desc="Full institutional hub with cloud redundancy."
            features={[
              "Unlimited Patient Vault",
              "Hybrid Stealth AI Core",
              "Multi-Unit Red Alerts",
              "Optical Scribe Digitization",
              "90-Day Clinical Audit Log"
            ]}
            icon={BrainCircuit}
            highlight
            loading={loading === 'enterprise'}
            onSelect={() => handleSubscribe('price_enterprise')}
            active={user?.subscriptionTier === 'enterprise'}
          />

          <PlanCard
            name="Research Node"
            price="499"
            desc="Advanced signal processing for study teams."
            features={[
              "RAW Signal Data Export",
              "Custom Neural Training",
              "Priority API Handshake",
              "Bio-Feedback Audio Suite",
              "24/7 Technical Response"
            ]}
            icon={Zap}
            loading={loading === 'research'}
            onSelect={() => handleSubscribe('price_research')}
            active={user?.subscriptionTier === 'research'}
          />
        </div>

        {/* Comparison Footnote */}
        <div className="max-w-3xl mx-auto p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-border/50 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
           <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="h-8 w-8" />
           </div>
           <div className="space-y-1 flex-1">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Compliance Certified</h4>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                 All subscription tiers include **E2E Signal Encryption** and **AES-256 local vault storage** as standard. We prioritize medical data sovereignty above all else.
              </p>
           </div>
           <button
             onClick={() => alert("Legal Matrix Node: HIPAA and GDPR compliance documents are available for institutional review.")}
             className="text-[10px] font-black text-primary uppercase tracking-[0.2em] whitespace-nowrap hover:underline flex items-center gap-2"
           >
              View Legal Matrix <ArrowRight className="h-4 w-4" />
           </button>
           <Sparkles className="absolute -top-10 -right-10 h-32 w-32 text-primary opacity-5" />
        </div>
      </div>
    </div>
  );
}

function PlanCard({ name, price, desc, features, icon: Icon, highlight, onSelect, loading, active }: any) {
  return (
    <motion.div
        whileHover={{ y: -10 }}
        className={`relative p-10 rounded-[3.5rem] border-2 transition-all flex flex-col h-full ${
        highlight
            ? 'bg-primary text-white border-primary shadow-3xl shadow-primary/30'
            : 'bg-white dark:bg-slate-900 border-border/50 shadow-xl'
        }`}
    >
      {active && (
          <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-lg ${
              highlight ? 'bg-white text-primary border-primary' : 'bg-primary text-white border-white'
          }`}>
              Active Plan
          </div>
      )}

      <div className="space-y-8 flex-1">
        <div className="flex items-center justify-between">
           <div className={`h-16 w-16 rounded-[1.8rem] flex items-center justify-center ${highlight ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <Icon className={`h-8 w-8 ${highlight ? 'text-white' : 'text-primary'}`} />
           </div>
           <div className="text-right">
              <p className={`text-4xl font-black tracking-tighter ${highlight ? 'text-white' : 'text-foreground'}`}>
                 ${price}
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${highlight ? 'text-white' : 'text-slate-400'}`}>Per Unit / Mo</p>
           </div>
        </div>

        <div className="space-y-2">
           <h3 className="text-2xl font-black tracking-tight uppercase">{name}</h3>
           <p className={`text-xs font-medium leading-relaxed ${highlight ? 'text-white/70' : 'text-slate-500'}`}>{desc}</p>
        </div>

        <div className={`h-px w-full ${highlight ? 'bg-white/10' : 'bg-border/50'}`} />

        <ul className="space-y-4">
          {features.map((f: string, i: number) => (
            <li key={i} className="flex items-center space-x-3">
              <CheckCircle2 className={`h-4 w-4 shrink-0 ${highlight ? 'text-emerald-300' : 'text-emerald-500'}`} />
              <span className={`text-[11px] font-bold tracking-tight ${highlight ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'}`}>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onSelect}
        disabled={loading || active}
        className={`mt-10 w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
          highlight
            ? 'bg-white text-primary hover:scale-105 active:scale-95 shadow-2xl'
            : 'bg-primary text-white hover:opacity-90 active:scale-95 shadow-xl'
        } disabled:opacity-50 disabled:scale-100`}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (active ? "Selected Node" : "Initialize Upgrade")}
        {!loading && !active && <ArrowRight className="h-4 w-4" />}
      </button>
    </motion.div>
  );
}
