"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../../lib/store/useStore";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import AiChatbot from "../../components/AiChatbot";
import InstallPrompt from "../../components/InstallPrompt";
import { Menu, X, LayoutDashboard, Activity, Users, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useStore();
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isResizing = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    const savedSession = localStorage.getItem("user_session");
    if (!savedSession && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  // Handle Resize Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.min(Math.max(e.clientX, 80), 400);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]" />;

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden relative">

      {/* Desktop Resizable Sidebar - Notch Safe */}
      <div
        style={{ width: sidebarWidth }}
        className="hidden md:flex flex-col relative shrink-0 transition-[width] duration-75 safe-sidebar border-r border-border"
      >
        <Sidebar isCollapsed={sidebarWidth < 120} setCollapsed={() => {}} />

        {/* Resize Handle */}
        <div
          onMouseDown={() => { isResizing.current = true; document.body.style.cursor = 'col-resize'; }}
          className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/30 transition-colors z-50 group"
        >
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-1 bg-border rounded-full opacity-0 group-hover:opacity-100" />
        </div>
      </div>

      {/* Mobile Header Overlay - Notch Safe */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-border z-[60] flex items-center justify-between px-6 safe-header">
         <div className="flex items-center space-x-3">
            <img src="/assets/icon/app_icon.svg" className="h-8 w-8" alt="Logo" />
            <span className="text-xs font-black tracking-widest uppercase">NeuroSignal</span>
         </div>
         <button
           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
           className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"
         >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
         </button>
      </div>

      {/* Mobile Side Drawer - Notch Safe Content */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-[85%] bg-white dark:bg-slate-900 z-[80] shadow-2xl p-8 safe-sidebar"
            >
               <Sidebar isCollapsed={false} setCollapsed={() => {}} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {children}
        </main>

        {/* Mobile Quick Action Bar (Bottom) */}
        <div className="md:hidden h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-border flex items-center justify-around px-4">
           <MobileNavLink href="/dashboard" icon={LayoutDashboard} active={pathname === '/dashboard'} />
           <MobileNavLink href="/dashboard/monitor" icon={Activity} active={pathname === '/dashboard/monitor'} />
           <MobileNavLink href="/dashboard/team" icon={Users} active={pathname === '/dashboard/team'} />
           <MobileNavLink href="/dashboard/settings" icon={Settings2} active={pathname === '/dashboard/settings'} />
        </div>
      </div>

      <AiChatbot />
      <InstallPrompt />
    </div>
  );
}

function MobileNavLink({ href, icon: Icon, active }: any) {
    return (
        <Link href={href} className={`p-3 rounded-2xl transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'text-slate-400'}`}>
            <Icon className="h-5 w-5" />
        </Link>
    );
}
