"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Professional Delay: Show after 4 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 4000);

      // Auto-disappear after 10 more seconds
      setTimeout(() => {
        setShowPrompt(false);
      }, 14000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed top-24 right-6 z-[100] max-w-[280px] w-full"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-primary/20 p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
                <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 10, ease: "linear" }}
                    className="h-full bg-primary"
                />
            </div>

            <button
              onClick={() => setShowPrompt(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-black uppercase tracking-tight leading-tight">Install Clinical Workstation</h4>
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                  Add to your home screen for high-performance signal monitoring.
                </p>
              </div>
            </div>

            <button
              onClick={handleInstall}
              className="mt-6 w-full py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <Download className="h-3 w-3" />
              <span>Install Now</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
