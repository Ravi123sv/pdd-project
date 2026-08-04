"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "./landing/page";
import { motion, AnimatePresence } from "framer-motion";

export default function RootPage() {
  const router = useRouter();
  const [isAppMode, setIsAppMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In the App version, we skip landing page detection and always show splash -> onboarding
    const timer = setTimeout(() => {
      setIsLoading(false);
      router.push("/onboarding");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[1000] bg-[#0F172A] flex flex-col items-center justify-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "backOut" }}
              className="relative"
            >
              <div className="h-24 w-24 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)]">
                <img
                  src="/assets/icon/app_icon.svg"
                  className="h-12 w-12"
                  alt="Logo"
                />
              </div>
              {/* Spinner Ring */}
              <div className="absolute inset-[-10px] border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </motion.div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-black text-white tracking-[0.3em] uppercase">NeuroSignal</h2>
              <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden mx-auto">
                 <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="h-full w-full bg-primary"
                 />
              </div>
            </div>
          </motion.div>
        ) : !isAppMode ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <LandingPage />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
