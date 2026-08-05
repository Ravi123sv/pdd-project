"use client";

import { motion } from "framer-motion";
import { Check, Hospital, Shield, Zap, Globe, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../lib/api/client";

export default function SubscriptionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleFreeStart = () => {
    router.push("/auth/login");
  };

  const handleContactSales = () => {
    router.push("/contact-sales");
  };

  const handleUpgrade = async () => {
    setLoading('research');
    try {
        // In a real app, you'd get the user email from state
        const res = await api.payments.createCheckoutSession('price_research_hub', 'practitioner@example.com');
        if (res.data.url) {
            window.location.href = res.data.url;
        }
    } catch (e) {
        console.error("Payment Error", e);
        alert("Payment gateway connection failed. Please try again.");
    } finally {
        setLoading(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: "Clinical Free",
      price: "$0",
      description: "Ideal for solo practitioners and individual clinics during evaluation.",
      features: ["Single User Access", "Basic Signal Processing", "5 Patients Capacity", "Community Support"],
      button: "Get Started",
      onClick: handleFreeStart
    },
    {
      id: 'hospital',
      name: "Hospital Enterprise",
      price: "Custom",
      description: "Full-scale solution for hospitals with multi-unit management.",
      features: ["Unlimited Staff", "Advanced Gemini AI Analysis", "Infinite Patient Archive", "Priority Support", "Admin Analytics"],
      button: "Contact Sales",
      highlight: true,
      onClick: handleContactSales
    },
    {
      id: 'research',
      name: "Research Hub",
      price: "$299/mo",
      description: "Dedicated tools for neuro-research and academic institutions.",
      features: ["Data Export (EDF/CSV)", "Custom Algorithm Hub", "Collaborative Workspaces", "API Access"],
      button: "Upgrade Now",
      onClick: handleUpgrade
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-8 lg:p-20">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex items-center justify-between">
           <Link href="/auth/login" className="flex items-center space-x-3 text-slate-500 hover:text-primary transition-colors group">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Back to Gateway</span>
           </Link>
           <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Clinical Network</span>
           </div>
        </div>

        <div className="text-center space-y-6">
           <h1 className="text-6xl font-black tracking-tight text-[#0F172A] dark:text-white">Clinical Access Plans</h1>
           <p className="text-slate-500 font-medium max-w-2xl mx-auto">
             Select the workstation tier that fits your clinical environment. All plans include HIPAA-compliant end-to-end encryption.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {plans.map((plan, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className={`relative p-10 rounded-[3rem] border-2 flex flex-col justify-between ${
                 plan.highlight
                  ? 'bg-primary border-primary shadow-2xl text-white'
                  : 'bg-white dark:bg-slate-900 border-border/50 text-slate-900 dark:text-white'
               }`}
             >
               <div className="space-y-8">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${plan.highlight ? 'text-white/60' : 'text-primary'}`}>{plan.name}</h3>
                        <p className={`text-4xl font-black tracking-tighter`}>{plan.price}</p>
                     </div>
                     {plan.highlight && <Zap className="h-6 w-6 text-white" />}
                  </div>

                  <p className={`text-sm font-medium leading-relaxed ${plan.highlight ? 'text-white/80' : 'text-slate-500'}`}>
                    {plan.description}
                  </p>

                  <div className="space-y-4">
                     {plan.features.map((f, j) => (
                        <div key={j} className="flex items-center space-x-3">
                           <div className={`p-1 rounded-full ${plan.highlight ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                              <Check className={`h-3 w-3 ${plan.highlight ? 'text-white' : 'text-primary'}`} />
                           </div>
                           <span className="text-xs font-bold uppercase tracking-widest">{f}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <button
                 onClick={plan.onClick}
                 disabled={loading === plan.id}
                 className={`mt-10 w-full py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 ${
                 plan.highlight
                  ? 'bg-white text-primary hover:shadow-xl'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
               }`}>
                  {loading === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : plan.button}
               </button>
             </motion.div>
           ))}
        </div>

        <div className="text-center pt-10">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
             Institutional Licenses require domain verification. <Link href="/verify-hospital" className="text-primary hover:underline ml-2">Generate Hospital Key</Link>
           </p>
        </div>
      </div>
    </div>
  );
}
