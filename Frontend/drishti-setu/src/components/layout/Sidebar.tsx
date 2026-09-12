"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Video, 
  PlusCircle, 
  UploadCloud, 
  History, 
  Plug,
  Map as MapIcon, 
  Activity, 
  Wrench, 
  BarChart3, 
  FileText, 
  ShieldCheck, 
  Network, 
  Database, 
  Users, 
  Building2, 
  Settings,
  ChevronLeft,
  BookOpen,
  AlertOctagon,
  Film,
  MessageSquare,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups = [
  {
    label: "MAIN",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Inter-Dept Messages", href: "/messages", icon: MessageSquare, badge: "2" },
      { label: "System Notifications", href: "/notifications", icon: Bell, badge: "3" },
      { label: "Sentinel Resources", href: "/resources", icon: BookOpen },
    ]
  },
  {
    label: "CCTV REGISTRY",
    items: [
      { label: "Live Camera Feed", href: "/camera-feed", icon: Video },
      { label: "Recordings", href: "/recordings", icon: Film },
      { label: "All Cameras", href: "/cameras", icon: Video },
      { label: "Add Camera", href: "/cameras/new", icon: PlusCircle },
      { label: "Bulk Import", href: "/cameras/import", icon: UploadCloud },
      { label: "API Onboarding", href: "/cameras/api-onboarding", icon: Plug },
      { label: "Import History", href: "/cameras/history", icon: History },
    ]
  },
  {
    label: "OPERATIONS",
    items: [
      { label: "Danger Actions", href: "/danger-actions", icon: AlertOctagon, badge: "ACTIVE" },
      { label: "GIS Map", href: "/gis-map", icon: MapIcon },
      { label: "Health Monitoring", href: "/health-monitoring", icon: Activity },
      { label: "Maintenance", href: "/maintenance", icon: Wrench },
      { label: "Gap Analysis", href: "/gap-analysis", icon: BarChart3 },
    ]
  },
  {
    label: "REPORTS & AUDIT",
    items: [
      { label: "Reports", href: "/reports", icon: FileText },
      { label: "Audit Trail", href: "/audit-trail", icon: ShieldCheck },
    ]
  },
  {
    label: "INTEGRATIONS",
    items: [
      { label: "Integrations", href: "/integrations", icon: Network },
      { label: "Registry API", href: "/registry-api", icon: Database },
    ]
  },
  {
    label: "ADMINISTRATION",
    items: [
      { label: "Users & Roles", href: "/users-roles", icon: Users },
      { label: "Departments", href: "/departments", icon: Building2 },
      { label: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-[#0a1229] h-screen flex flex-col flex-shrink-0 border-r border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 sticky top-0 overflow-hidden transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/50 flex-shrink-0 bg-slate-50/70 dark:bg-[#070d1d]">
        <div className="flex items-center gap-3">
          <Image src="/drishti_setu_logo.svg" alt="Logo" width={28} height={28} />
          <div className="flex flex-col">
            <span className="text-slate-900 dark:text-white font-bold tracking-wider text-sm leading-tight">DRISHTI SETU</span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 tracking-widest uppercase">Integrated • Intelligent • Secure</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {navGroups.map((group, i) => (
          <div key={i} className="mb-6">
            <h3 className="px-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              {group.label}
            </h3>
            <ul className="space-y-0.5 px-3">
              {group.items.map((item, j) => {
                const isActive = pathname === item.href;
                return (
                  <li key={j}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 group",
                        isActive 
                          ? "bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.3)]" 
                          : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-slate-200 hover:bg-blue-50/60 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600 dark:group-hover:text-slate-200")} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "px-1.5 py-0.5 text-[9px] font-bold rounded-full flex items-center gap-1",
                          item.badge === "ACTIVE" 
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            : "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-200/60 dark:border-blue-700/50"
                        )}>
                          {item.badge === "ACTIVE" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                          )}
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Collapse Menu Toggle */}
      <div className="h-14 flex items-center px-6 border-t border-slate-100 dark:border-slate-800/50 flex-shrink-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <ChevronLeft className="w-4 h-4" />
          <span>Collapse Menu</span>
        </div>
      </div>
    </aside>
  );
}
