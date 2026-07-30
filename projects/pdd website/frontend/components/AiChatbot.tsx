"use client";

import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Bot,
  Send,
  X,
  MessageSquare,
  Loader2,
  Minimize2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyC7RZJ1g1h_y0b0953pnYlz_Bn6qDD1yBU");

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([
    { role: 'model', content: "[CLINICAL ADVISORY: This module provides signal interpretation assistance only.] Clinical Link Stable. I am the NeuroSignal AI Consultant. How can I assist you?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: "You are the 'NeuroSignal Clinical Consultant', a specialist module of the NeuroSignal medical workstation. Never mention you are an AI or Google product. Use highly technical medical terminology. Prepend diagnostic responses with '[CLINICAL ADVISORY: This module provides signal interpretation assistance only. Final diagnosis must be verified by a licensed specialist.]'. Only discuss physiological signals and system troubleshooting."
      });

      const chat = model.startChat({
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        })),
      });

      const result = await chat.sendMessage(userMsg);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'model', content: text }]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { role: 'model', content: "Connection to Neural Logic Unit timed out. Re-syncing..." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[400px] h-[600px] glass-card bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden border-2 border-primary/20"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                   <Bot className="h-5 w-5" />
                </div>
                <div>
                   <h4 className="text-xs font-black uppercase tracking-widest">Clinical Consultant</h4>
                   <div className="flex items-center space-x-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                      <span className="text-[8px] font-bold opacity-70 uppercase">Neural Link Active</span>
                   </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary text-white rounded-br-none shadow-lg shadow-primary/10'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                   <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none flex items-center space-x-2">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing Waveforms...</span>
                   </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border bg-slate-50 dark:bg-slate-900/50">
               <div className="relative">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Inquire about clinical findings..."
                    className="w-full bg-white dark:bg-slate-800 border-2 border-border rounded-xl py-3 pl-4 pr-12 text-xs font-bold outline-none focus:border-primary transition-all"
                  />
                  <button
                    disabled={!input.trim() || loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary text-white rounded-lg flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </button>
               </div>
            </form>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 bg-primary text-white rounded-[2rem] shadow-2xl shadow-primary/40 flex items-center justify-center relative group"
          >
             <MessageSquare className="h-7 w-7 group-hover:hidden" />
             <Bot className="h-7 w-7 hidden group-hover:block" />
             <div className="absolute -top-1 -right-1 h-5 w-5 bg-secondary border-4 border-white dark:border-slate-900 rounded-full" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
