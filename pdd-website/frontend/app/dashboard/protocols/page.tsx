"use client";

import { useState } from "react";
import {
  BookOpen,
  Activity,
  BrainCircuit,
  Zap,
  ChevronRight,
  Search,
  FileText,
  ShieldCheck,
  Stethoscope,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProtocolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProtocol, setSelectedProtocol] = useState<any>(null);

  const protocols = [
    {
        id: 'ecg-12',
        title: "Standard 12-Lead ECG",
        category: "CARDIOLOGY",
        desc: "Limb and Precordial lead placement for baseline diagnostics.",
        icon: Activity,
        content: "Place V1 at the 4th intercostal space (right). V2 at the 4th intercostal space (left). V4 at the 5th intercostal space, mid-clavicular line. Ensure skin impedance is minimized using professional conductive gel."
    },
    {
        id: 'eeg-1020',
        title: "10-20 EEG System",
        category: "NEUROLOGY",
        desc: "International standard for electrode positioning in routine EEG.",
        icon: BrainCircuit,
        content: "Measure distance between Nasion and Inion. Frontal (Fp), Central (C), Parietal (P), Occipital (O), and Temporal (T) nodes must follow exact 10% or 20% intervals. Symmetrical placement is critical for lateralization analysis."
    },
    {
        id: 'emg-dyn',
        title: "Dynamic EMG Recruitment",
        category: "DIAGNOSTICS",
        desc: "Surface EMG protocol for motor unit recruitment evaluation.",
        icon: Zap,
        content: "Clean surface area with isopropyl alcohol. Place bipolar electrodes over the muscle belly, parallel to muscle fibers. Reference electrode should be placed on a bony prominence (e.g. elbow or patella)."
    }
  ];

  const filtered = protocols.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <BookOpen className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">Protocol Library</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Clinical Standards & Procedural Knowledge Base
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
           <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search protocols (e.g. '12-lead', 'EEG')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-3xl pl-14 pr-6 text-sm font-bold outline-none focus:border-primary transition-all"
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((p) => (
                <motion.div
                    key={p.id}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedProtocol(p)}
                    className="glass-card p-8 space-y-6 group cursor-pointer border-2 border-transparent hover:border-primary/20 transition-all"
                >
                    <div className="flex justify-between items-start">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <p.icon className="h-7 w-7" />
                        </div>
                        <span className="text-[9px] font-black px-3 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-widest">
                            {p.category}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-foreground tracking-tight uppercase">{p.title}</h3>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-2">{p.desc}</p>
                    </div>

                    <div className="pt-6 border-t border-border/50 flex items-center justify-between text-primary">
                        <span className="text-[10px] font-black uppercase tracking-widest">Read Protocol</span>
                        <ChevronRight className="h-4 w-4" />
                    </div>
                </motion.div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           <div className="glass-card p-8 bg-[#0F172A] text-white space-y-6 relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center space-x-2 text-secondary">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Verified Standard</span>
                 </div>
                 <h4 className="text-lg font-black tracking-tight uppercase">Quality Assurance</h4>
                 <p className="text-xs font-bold leading-relaxed opacity-60">
                    All protocols are verified against the International Federation of Clinical Neurophysiology (IFCN) standards.
                 </p>
              </div>
           </div>

           <div className="p-8 border-2 border-dashed border-border rounded-[2.5rem] space-y-4">
              <div className="flex items-center space-x-3 text-slate-400">
                 <Info className="h-5 w-5" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Junior Access</h4>
              </div>
              <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
                 Provide these guides to incoming clinical technicians to ensure 100% data integrity across all diagnostic sessions.
              </p>
           </div>
        </div>
      </div>

      {/* Protocol Detail Modal */}
      <AnimatePresence>
         {selectedProtocol && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProtocol(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
               <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-3xl relative z-10 border-2 border-white/5">
                  <div className="space-y-8">
                     <div className="flex items-center space-x-6">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                           <selectedProtocol.icon className="h-8 w-8" />
                        </div>
                        <div>
                           <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">{selectedProtocol.title}</h2>
                           <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{selectedProtocol.category} STANDARD</p>
                        </div>
                     </div>

                     <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-border/50">
                        <p className="text-base font-medium text-slate-600 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                           {selectedProtocol.content}
                        </p>
                     </div>

                     <div className="flex gap-4 pt-4">
                        <button onClick={() => setSelectedProtocol(null)} className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Close Guide</button>
                        <button className="flex-1 h-14 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                           <FileText className="h-4 w-4" /> Download PDF Guide
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
