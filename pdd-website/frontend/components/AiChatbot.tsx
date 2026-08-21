"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  BrainCircuit,
  Bot,
  User,
  Sparkles,
  History,
  Trash2
} from "lucide-react";
import { useStore } from "../lib/store/useStore";
import { api } from "../lib/api/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChatbot() {
  const { user, activePatient } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Greetings Dr. ${user?.name || 'Practitioner'}. I am the NeuroSignal Neural Assistant. How can I assist with your clinical workflow today?` }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Inject Clinical Context into the latest message
      const contextPrompt = activePatient
        ? `[CONTEXT: Currently monitoring ${activePatient.name}, MRN ${activePatient.id}, Modality ${activePatient.modality}] `
        : "[CONTEXT: No active patient session] ";

      // Send FULL history to the backend for contextual AI logic
      const messageWithContext: Message = { role: 'user', content: contextPrompt + input };
      const apiPayload = [...messages, messageWithContext];

      const res = await api.signals.chatbot(apiPayload);

      setMessages([...newMessages, { role: 'assistant', content: res.data.content }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: "Neural link interrupted. Please verify hub connectivity." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
      setMessages([{ role: 'assistant', content: "Neural buffer cleared. Assistant ready." }]);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-6 w-[400px] h-[600px] bg-white dark:bg-slate-900 rounded-[3rem] shadow-3xl border-2 border-primary/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-primary text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                   <BrainCircuit className="h-6 w-6" />
                </div>
                <div>
                   <h3 className="text-sm font-black uppercase tracking-widest">Neural Assistant</h3>
                   <div className="flex items-center gap-1.5 text-[8px] font-bold text-white/60">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LOCAL LOGIC ACTIVE
                   </div>
                </div>
              </div>
              <div className="flex gap-2">
                  <button onClick={clearChat} className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                    <X className="h-5 w-5" />
                  </button>
              </div>
            </div>

            {/* Chat area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-50/50 dark:bg-slate-900">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] p-5 rounded-[2rem] text-xs font-medium leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-foreground rounded-tl-none border border-border/50'
                   }`}>
                      {m.content}
                   </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                   <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] rounded-tl-none border border-border/50 flex items-center space-x-3">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Processing...</span>
                   </div>
                </div>
              )}
            </div>

            {/* Active Context Badge */}
            {activePatient && (
                <div className="px-6 py-2 bg-emerald-500/10 border-t border-border/50 flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-emerald-500" />
                    <span className="text-[8px] font-black text-emerald-600 uppercase">Context: {activePatient.name}</span>
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 bg-white dark:bg-slate-900 border-t border-border/50 flex items-center space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Query clinical protocols..."
                className="flex-1 h-12 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button type="submit" className="h-12 w-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <Send className="h-5 w-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 w-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 hover:scale-110 active:scale-90 transition-all group relative"
      >
        <MessageSquare className="h-7 w-7 group-hover:hidden" />
        <BrainCircuit className="h-7 w-7 hidden group-hover:block animate-pulse" />
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full" />
      </button>
    </div>
  );
}
