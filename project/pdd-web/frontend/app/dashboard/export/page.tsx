"use client";

import { useState } from "react";
import {
  FileDown,
  Search,
  FileText,
  FileSpreadsheet,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function ExportVaultPage() {
  const [exports] = useState([
    { id: "EXP-8821", name: "MRN-7701_Full_Report.pdf", type: "PDF", date: "2026-07-24 10:45", status: "Available", size: "1.2 MB" },
    { id: "EXP-8819", name: "Clinical_Batch_Q2.csv", type: "CSV", date: "2026-07-23 16:20", status: "Expired", size: "450 KB" },
    { id: "EXP-8750", name: "Telemetry_Dump_V2.json", type: "JSON", date: "2026-07-20 09:15", status: "Available", size: "8.4 MB" },
  ]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Export Vault</h1>
          <p className="text-sm font-medium text-slate-500">Secure repository for generated clinical documentation and data dumps</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-black text-primary bg-primary/10 px-4 py-2 rounded-xl">
          <ShieldCheck className="h-4 w-4" />
          <span>E2E ENCRYPTED STORAGE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left - List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center bg-slate-50/50 dark:bg-slate-800/20">
              <Search className="h-4 w-4 text-slate-400 ml-2" />
              <input
                type="text"
                placeholder="Search vault..."
                className="flex-1 bg-transparent border-none px-4 text-sm font-medium outline-none"
              />
            </div>

            <div className="divide-y divide-border">
              {exports.map((exp) => (
                <div key={exp.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                  <div className="flex items-center space-x-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                      exp.type === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                    }`}>
                      {exp.type === 'PDF' ? <FileText className="h-6 w-6" /> : <FileSpreadsheet className="h-6 w-6" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{exp.name}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{exp.id}</span>
                        <span className="text-[10px] font-bold text-slate-300">•</span>
                        <span className="text-[10px] font-bold text-slate-400">{exp.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="hidden md:flex flex-col items-end">
                      <div className="flex items-center space-x-1.5 mb-1">
                        {exp.status === 'Available' ? (
                          <CheckCircle2 className="h-3 w-3 text-secondary" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-red-400" />
                        )}
                        <span className={`text-[10px] font-black uppercase ${
                          exp.status === 'Available' ? 'text-secondary' : 'text-red-400'
                        }`}>
                          {exp.status}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 flex items-center space-x-1">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{exp.date}</span>
                      </p>
                    </div>

                    <button
                      disabled={exp.status === 'Expired'}
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary hover:bg-primary/10 disabled:opacity-30 transition-all"
                    >
                      <FileDown className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Guidelines */}
        <div className="space-y-6">
          <section className="glass-card p-6 bg-slate-900 text-white">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-white/40">Vault Protocols</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-xs font-medium text-white/70">Files are automatically purged after 30 days for HIPAA compliance.</p>
              </li>
              <li className="flex items-start space-x-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-xs font-medium text-white/70">All exports are logged in the master clinical audit trail.</p>
              </li>
              <li className="flex items-start space-x-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-xs font-medium text-white/70">Use secure VPN when downloading telemetry dumps.</p>
              </li>
            </ul>
          </section>

          <button className="w-full neuro-button bg-slate-100 dark:bg-slate-800 text-slate-600 text-xs font-black flex items-center justify-center space-x-2">
            <ExternalLink className="h-4 w-4" />
            <span>CLOUD STORAGE LINK</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
