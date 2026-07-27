"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../../lib/store/useStore";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import AiChatbot from "../../components/AiChatbot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedSession = localStorage.getItem("user_session");
    if (!savedSession && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!isMounted) return <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]" />;

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden">
      <Sidebar isCollapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
      <AiChatbot />
    </div>
  );
}
