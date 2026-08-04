"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BrainCircuit,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Clinical Fidelity",
      desc: "Monitor high-throughput neural and cardiac signals with zero-latency streaming on any device.",
      icon: Activity,
      color: "bg-emerald-500"
    },
    {
      title: "Neural Logic AI",
      desc: "Real-time artifact suppression and clinical anomaly detection powered by Gemini 1.5 Pro.",
      icon: BrainCircuit,
      color: "bg-blue-500"
    },
    {
      title: "Secure & Compliant",
      desc: "HIPAA-grade end-to-end encryption. Patient identity data never leaves your local workstation environment.",
      icon: ShieldCheck,
      color: "bg-primary"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F172A] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="max-w-md w-full space-y-12 relative z-10">

        {/* Step Visual */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <div className={`h-24 w-24 rounded-[2.5rem] ${steps[step].color} shadow-2xl flex items-center justify-center text-white`}>
              <steps[step].icon className="h-10 w-10" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{steps[step].title}</h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed px-4">
                {steps[step].desc}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Indicators */}
        <div className="flex justify-center space-x-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-slate-200 dark:bg-slate-800'}`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleNext}
            className="h-16 w-full bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary/20 flex items-center justify-center space-x-3 active:scale-95 transition-all"
          >
            <span>{step === steps.length - 1 ? "Get Started" : "Next Step"}</span>
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => router.push("/auth/login")}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
          >
            Skip Instructions
          </button>
        </div>
      </div>

      {/* Background Polish */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
