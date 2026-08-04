"use client";

import { ShieldCheck, ArrowLeft, Lock, Eye, FileText } from "lucide-react";
import Link from "next/link";
import ClinicalDisclaimer from "../../components/ClinicalDisclaimer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-8 lg:p-20">
      <div className="max-w-4xl mx-auto space-y-12">
        <Link href="/" className="inline-flex items-center space-x-2 text-primary font-black uppercase text-[10px] tracking-widest hover:underline">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter">Privacy Protocol</h1>
          <p className="text-slate-500 font-medium">Standard operating procedure for clinical data handling v2.5</p>
        </div>

        <div className="grid gap-8">
          <PrivacySection
            icon={Lock}
            title="E2E Encryption"
            content="All neural and cardiac waveform data is encrypted at the edge using AES-256 bit protocols before any institutional synchronization occurs."
          />
          <PrivacySection
            icon={Eye}
            title="Identity Scrubbing"
            content="Patient PII (Personally Identifiable Information) is decoupled from signal telemetry. Internal MRNs are used exclusively within the local workstation node."
          />
          <PrivacySection
            icon={FileText}
            title="Data Sovereignty"
            content="NeuroSignal does not store clinical data on public clouds. All data remains within the verified institutional hub or the practitioner's private vault."
          />
        </div>

        <div className="pt-12">
          <ClinicalDisclaimer />
        </div>
      </div>
    </div>
  );
}

function PrivacySection({ icon: Icon, title, content }: any) {
  return (
    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-border/50 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4">
      <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-black uppercase tracking-tight">{title}</h3>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{content}</p>
    </div>
  );
}
