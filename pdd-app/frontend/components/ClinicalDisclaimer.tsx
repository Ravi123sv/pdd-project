"use client";

import { AlertCircle, ShieldAlert } from "lucide-react";

/**
 * ClinicalDisclaimer Component
 * A professional, low-profile medical disclaimer for the bottom of workstation pages.
 */
export default function ClinicalDisclaimer() {
  return (
    <div className="w-full py-10 px-6 border-t border-border/40 mt-auto bg-slate-50/30 dark:bg-transparent">
      <div className="max-w-4xl mx-auto flex items-start space-x-4 opacity-50 hover:opacity-100 transition-opacity duration-500">
        <ShieldAlert className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Professional Clinical Advisory
          </p>
          <p className="text-[10px] font-medium leading-relaxed text-slate-400 italic">
            [NOTICE: NeuroSignal AI modules serve exclusively as clinical decision-support tools. All autonomous waveform interpretations and neural summaries are supplementary and must be verified by a licensed medical specialist. Final diagnostic authority remains with the attending physician. System v2.5.0-PRO]
          </p>
        </div>
      </div>
    </div>
  );
}
