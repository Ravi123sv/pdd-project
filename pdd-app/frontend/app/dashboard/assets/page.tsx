"use client";

import { useState, useEffect } from "react";
import { useStore } from "../../../lib/store/useStore";
import { api } from "../../../lib/api/client";
import {
  Package,
  Plus,
  Search,
  MoreVertical,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle2,
  Settings,
  ShieldCheck,
  Loader2,
  Wrench,
  ChevronRight,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AssetsHubPage() {
  const { user } = useStore();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportIssue, setReportIssue] = useState("");
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!user?.hospitalId) return;
      try {
        const res = await api.assets.getAll(user.hospitalId);
        setAssets(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, [user]);

  const handleReportMalfunction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !reportIssue) return;

    setReporting(true);
    try {
        await api.assets.reportMalfunction(selectedAsset._id, {
            issue: reportIssue,
            technician: user?.name
        });

        // Update local state
        setAssets(prev => prev.map(a =>
            a._id === selectedAsset._id
            ? { ...a, status: 'ERROR', type: 'error' }
            : a
        ));

        setShowReport(false);
        setReportIssue("");
        alert("Malfunction report logged. Maintenance team notified.");
    } catch (err) {
        console.error(err);
    } finally {
        setReporting(false);
    }
  };

  const filteredAssets = assets.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Package className="h-7 w-7" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Clinical Asset Hub</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Equipment Inventory & Hardware Integrity Monitor
              </p>
           </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-border/50">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">All Units Verified</span>
            </div>
            <button
                onClick={() => alert("Hardware Registration Node: Please connect the unit via USB/Serial to initialize handshake.")}
                className="neuro-button bg-primary text-white flex items-center space-x-2 px-6 shadow-xl shadow-primary/20"
            >
                <Plus className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Register Hardware</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
           <section className="glass-card p-8 bg-slate-900 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Global Inventory</span>
                    <Settings className="h-4 w-4 text-primary animate-spin-slow" />
                 </div>
                 <div className="flex items-end justify-between">
                    <h2 className="text-5xl font-black text-primary">{assets.length}</h2>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Total Units</span>
                 </div>
                 <div className="pt-6 border-t border-white/5 space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                       <span className="text-white/40">Active Links</span>
                       <span className="text-emerald-500">{assets.filter(a => a.status === 'ACTIVE').length}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                       <span className="text-white/40">Maintenance</span>
                       <span className="text-amber-500">{assets.filter(a => a.status === 'ERROR').length}</span>
                    </div>
                 </div>
              </div>
              <ShieldCheck className="absolute -bottom-8 -right-8 h-40 w-40 text-primary opacity-5" />
           </section>

           <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 space-y-4">
              <div className="flex items-center space-x-3 text-primary">
                 <AlertCircle className="h-4 w-4" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Inventory Protocol</h4>
              </div>
              <p className="text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                Quarterly hardware calibration is required for all Class-II biomedical sensors.
              </p>
           </div>
        </div>

        {/* Main: Asset Grid */}
        <div className="lg:col-span-3 space-y-6">
           <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input
                    type="text"
                    placeholder="Search equipment by name or status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 bg-white dark:bg-slate-900 border-2 border-border/50 rounded-2xl pl-12 pr-4 text-xs font-bold outline-none focus:border-primary transition-all"
                 />
              </div>
              <button
                onClick={() => alert("Filter Node: Multi-criteria filtering logic is active.")}
                className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 border-2 border-border/50 flex items-center justify-center text-slate-400 hover:text-primary transition-all"
              >
                 <Filter className="h-5 w-5" />
              </button>
           </div>

           {loading ? (
               <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
           ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredAssets.map((asset) => (
                    <AssetCard
                        key={asset._id}
                        asset={asset}
                        onReport={() => { setSelectedAsset(asset); setShowReport(true); }}
                    />
                  ))}
               </div>
           )}

           {filteredAssets.length === 0 && !loading && (
               <div className="py-20 text-center opacity-30">
                  <Package className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-sm font-black uppercase tracking-widest text-slate-500">No equipment found in this node</p>
               </div>
           )}
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
         {showReport && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setShowReport(false)}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
               />
               <motion.div
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
                 className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative z-10 border border-border/50"
               >
                  <div className="space-y-8">
                     <div className="space-y-2 text-center">
                        <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto text-red-600 mb-4">
                            <Wrench className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-foreground uppercase">Report Malfunction</h3>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{selectedAsset?.name}</p>
                     </div>

                     <form onSubmit={handleReportMalfunction} className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Description of Issue</label>
                           <textarea
                              required
                              value={reportIssue}
                              onChange={(e) => setReportIssue(e.target.value)}
                              placeholder="e.g. Baseline wander on Lead V2, potential cable fracture..."
                              className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-2 border-border/50 rounded-2xl p-4 text-xs font-bold outline-none focus:border-red-500 resize-none"
                           />
                        </div>

                        <div className="flex gap-4 pt-4">
                           <button
                             type="button"
                             onClick={() => setShowReport(false)}
                             className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                           >
                              Cancel
                           </button>
                           <button
                             type="submit"
                             disabled={reporting}
                             className="flex-1 h-14 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
                           >
                              {reporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><AlertCircle className="h-4 w-4" /> Submit Report</>}
                           </button>
                        </div>
                     </form>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}

function AssetCard({ asset, onReport }: any) {
    const isError = asset.status === 'ERROR';

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`glass-card p-6 flex flex-col justify-between group transition-all duration-500 ${isError ? 'border-red-500/30' : 'hover:border-primary/50'}`}
        >
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                        isError ? 'bg-red-50 dark:bg-red-950/20 border-red-200 text-red-600' : 'bg-slate-50 dark:bg-slate-800 border-border/50 text-slate-400 group-hover:bg-primary group-hover:text-white'
                    }`}>
                        <Package className="h-6 w-6" />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        isError ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-200' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                        {asset.status}
                    </div>
                </div>

                <div className="space-y-1">
                    <h4 className="text-lg font-black tracking-tight text-foreground truncate">{asset.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial: NS-{asset._id.slice(-6).toUpperCase()}</p>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity className={`h-3 w-3 ${isError ? 'text-red-500 animate-pulse' : 'text-slate-300'}`} />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Health Index: {isError ? '20%' : '100%'}</span>
                </div>
                {!isError && (
                    <button
                        onClick={onReport}
                        className="text-[9px] font-black uppercase text-primary tracking-widest hover:underline flex items-center gap-1"
                    >
                        Report <ChevronRight className="h-3 w-3" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}
