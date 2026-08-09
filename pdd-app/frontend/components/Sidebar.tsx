"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "../lib/store/useStore";
import {
  LayoutDashboard,
  Activity,
  Users,
  Shield,
  LogOut,
  User,
  FolderArchive,
  CloudUpload,
  FileDown,
  BrainCircuit,
  Settings2,
  Zap
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isCollapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: any;
  section: string;
  roles?: string[];
  userTypes?: ('hospital' | 'individual')[];
}

export default function Sidebar({ isCollapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useStore();

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "WORKSTATION" },
    { href: "/dashboard/notifications", label: "Notification Center", icon: Bell, section: "WORKSTATION" },
    { href: "/dashboard/patients", label: "Patient Registry", icon: Users, section: "WORKSTATION" },
    { href: "/dashboard/assets", label: "Asset Inventory", icon: Package, section: "WORKSTATION" },
    { href: "/dashboard/monitor", label: "Signal Monitor", icon: Activity, section: "DIAGNOSTICS" },
    { href: "/dashboard/diagnostics", label: "Stability Analysis", icon: BrainCircuit, section: "DIAGNOSTICS" },
    { href: "/dashboard/protocols", label: "Protocol Library", icon: BookOpen, section: "DIAGNOSTICS" },
    { href: "/dashboard/archive", label: "Clinical Archive", icon: FolderArchive, section: "DATA MANAGEMENT" },
    { href: "/dashboard/ingest", label: "External Ingest", icon: CloudUpload, section: "DATA MANAGEMENT", userTypes: ['hospital'] },
    { href: "/dashboard/export", label: "Export Vault", icon: FileDown, section: "DATA MANAGEMENT" },
    { href: "/dashboard/team", label: "Team Management", icon: Users, section: "ADMINISTRATION", userTypes: ['hospital'], roles: ['admin'] },
    { href: "/dashboard/profile", label: "My Profile", icon: User, section: "SYSTEM" },
    { href: "/subscriptions", label: "Subscriptions", icon: Zap, section: "SYSTEM" },
    { href: "/dashboard/security", label: "Security Center", icon: Shield, section: "SYSTEM" },
    { href: "/dashboard/settings", label: "System Settings", icon: Settings2, section: "SYSTEM" },
  ];

  const sections = [...new Set(navItems.map(i => i.section))];

  return (
    <aside className={cn(
      "bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden",
      isCollapsed ? "items-center" : ""
    )}>
      {/* Header */}
      <div className="h-20 flex items-center px-6 border-b border-border/50 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <img src="https://ravi123sv.github.io/pdd-project/assets/icon/app_icon.svg" alt="NeuroSignal Logo" className="h-8 w-8" />
            <div className="min-w-0">
              <p className="text-[10px] font-black tracking-tighter text-foreground leading-none">NEUROSIGNAL</p>
              <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase truncate">
                {user?.userType === 'hospital' ? 'ENTERPRISE 2.5' : 'PROFESSIONAL'}
              </p>
            </div>
          </div>
        ) : (
          <img src="/assets/icon/app_icon.svg" alt="Logo" className="h-8 w-8" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-hide">
        {sections.map(section => {
          const sectionItems = navItems.filter(item => item.section === section)
            .filter(item => !item.roles || item.roles.includes(user?.role || ''))
            .filter(item => !item.userTypes || item.userTypes.includes(user?.userType as any));

          if (sectionItems.length === 0) return null;

          return (
            <div key={section} className="space-y-1">
              {!isCollapsed && (
                <p className="text-[10px] font-black text-slate-400 px-3 pb-2 uppercase tracking-widest">
                  {section}
                </p>
              )}

              {sectionItems.map(item => {
                const isActive = pathname === item.href;
                const isExternal = item.href.startsWith('http');

                const content = (
                  <>
                    <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
                    {!isCollapsed && <span className="text-sm truncate">{item.label}</span>}
                  </>
                );

                const className = cn(
                    "w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all group",
                    isActive
                      ? "bg-primary/10 text-primary font-bold shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200",
                    isCollapsed && "justify-center px-0"
                );

                if (isExternal) {
                    return (
                        <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                            {content}
                        </a>
                    );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : ""}
                    className={className}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 shrink-0">
        {!isCollapsed && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase shrink-0">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{user?.userType}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-bold",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="text-sm">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
