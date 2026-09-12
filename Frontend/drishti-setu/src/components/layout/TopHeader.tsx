"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Bell, 
  MessageSquare, 
  ChevronDown, 
  LogOut, 
  Sun, 
  Moon, 
  ShieldAlert, 
  Radio, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { AuthSession } from "@/types/auth";
import { useTheme } from "@/context/ThemeContext";

const AVAILABLE_DEPARTMENTS = [
  {
    id: 1,
    name: "Department of Home Affairs",
    subtext: "Govt. of Gujarat • Apex State Command",
    logo: "/gov_of_guj_logo.svg",
  },
  {
    id: 2,
    name: "Gujarat Police Department",
    subtext: "Law Enforcement & Public Safety",
    logo: "/gpolicelogo.png",
  },
  {
    id: 3,
    name: "Traffic Management Department",
    subtext: "Traffic & Transit Monitoring",
    logo: "/gpolicelogo.png",
  },
  {
    id: 4,
    name: "Health & Family Welfare",
    subtext: "Hospital & Emergency Feeds",
    logo: "/gov_of_guj_logo.svg",
  },
  {
    id: 5,
    name: "Roads & Buildings Department",
    subtext: "Highways & Toll Infrastructure",
    logo: "/gov_of_guj_logo.svg",
  },
  {
    id: 6,
    name: "Disaster Management Authority",
    subtext: "State Emergency Response",
    logo: "/gov_of_guj_logo.svg",
  },
];

export function TopHeader() {
  const router = useRouter();
  const { theme, isBright, toggleTheme } = useTheme();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDeptMenu, setShowDeptMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSession(authService.getCurrentSession());

    // Listen for department changes across app
    const handleDeptChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSession(customEvent.detail);
      } else {
        setSession(authService.getCurrentSession());
      }
    };
    window.addEventListener('drishti:department_changed', handleDeptChange);

    // Close popups on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) {
        setShowDeptMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('drishti:department_changed', handleDeptChange);
    };
  }, []);

  const departmentName = session?.department?.name || session?.user?.department_name || (session?.user?.role === 'Admin' ? 'Department of Home Affairs' : 'Gujarat Police Department');
  const userName = session?.user?.username || session?.user?.name || "Officer";
  const userRole = session?.user?.role || "Authorized User";
  const isAdmin = userRole === 'Admin' || session?.user?.role === 'Admin' || departmentName.toLowerCase().includes('home') || session?.user?.employee_id === 'EMP001';

  // Determine logo and subtitle dynamically
  const isPolice = departmentName.toLowerCase().includes('police');
  const departmentLogo = (isAdmin || !isPolice) ? "/gov_of_guj_logo.svg" : "/gpolicelogo.png";
  const departmentSubtitle = isAdmin 
    ? "Govt. of Gujarat • State Command Portal" 
    : isPolice 
      ? "Law Enforcement Command"
      : "Multi-Department Portal";

  const handleLogout = () => {
    authService.logout();
    router.replace("/login");
  };

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <header className="h-16 bg-white dark:bg-[#091124] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-200">
      {/* Context Selection with Dropdown */}
      <div className="relative" ref={deptRef}>
        <button
          type="button"
          onClick={() => setShowDeptMenu((prev) => !prev)}
          className="flex items-center gap-3 p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors text-left group cursor-pointer"
          title="Switch Department Context"
        >
          <div className="relative w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800/80 p-1 flex items-center justify-center border border-slate-200/80 dark:border-slate-700/80 flex-shrink-0 group-hover:border-blue-400 transition-colors">
            <Image 
              src={departmentLogo} 
              alt={`${departmentName} Logo`} 
              width={30} 
              height={30} 
              className="object-contain" 
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {departmentName}
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-transform duration-200", showDeptMenu && "rotate-180")} />
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              {departmentSubtitle}
            </span>
          </div>
        </button>

        {/* Department Switcher Dropdown Menu */}
        {showDeptMenu && (
          <div className="absolute left-0 mt-2 w-76 bg-white dark:bg-[#0c162d] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Select Department View
              </span>
              {isAdmin && (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 px-2 py-0.5 rounded-full">
                  Admin Mode
                </span>
              )}
            </div>

            <div className="p-1 space-y-0.5 max-h-72 overflow-y-auto">
              {AVAILABLE_DEPARTMENTS.map((dept) => {
                const isSelected = dept.name === departmentName;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => {
                      authService.switchDepartment(dept.name, dept.id);
                      setSession(authService.getCurrentSession());
                      setShowDeptMenu(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer",
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200"
                    )}
                  >
                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={dept.logo}
                        alt={dept.name}
                        width={22}
                        height={22}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">
                        {dept.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {dept.subtext}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Global Search */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-16 py-2 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800/80 placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 sm:text-sm transition-all"
            placeholder="Search cameras, locations, departments..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 bg-white dark:bg-slate-800">
              Ctrl + K
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center gap-4">
        
        {/* Dark / Bright Toggle Switch */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isBright ? "Switch to Dark Mode" : "Switch to Bright Mode"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all text-xs font-semibold cursor-pointer shadow-xs"
        >
          {isBright ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-[11px] font-medium text-slate-700 hidden sm:inline">Bright</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
              <span className="text-[11px] font-medium text-slate-200 hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-4">
          
          {/* Notifications Bell with Popover */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-84 bg-white dark:bg-[#0c162d] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Live Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-80 overflow-y-auto">
                  {/* Alert 1: Inter-dept request */}
                  <div 
                    onClick={() => { setShowNotifications(false); router.push("/messages"); }}
                    className="p-3 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center flex-shrink-0 text-blue-600 mt-0.5">
                        <Radio className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                          Gujarat Police: Camera Access Request
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          Requested 48h stream access for CAM001 & CAM003 (Civil Hospital Gate) for VIP Convoy.
                        </p>
                        <span className="text-[9px] font-medium text-blue-600 dark:text-blue-400 mt-1 inline-block">
                          Just now • Click to Review
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Alert 2: Camera Health */}
                  <div 
                    onClick={() => { setShowNotifications(false); router.push("/cameras"); }}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center flex-shrink-0 text-amber-600 mt-0.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                          CAM004 Health Warning
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          Packet loss detected (3.2%) in Sector 7 Traffic Junction.
                        </p>
                        <span className="text-[9px] text-slate-400 mt-1 inline-block">
                          12 mins ago
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Alert 3: Bulk Import */}
                  <div 
                    onClick={() => { setShowNotifications(false); router.push("/cameras/history"); }}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center flex-shrink-0 text-emerald-600 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                          Batch Import Completed
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          50 cameras verified and synchronized with Gujarat GIS grid.
                        </p>
                        <span className="text-[9px] text-slate-400 mt-1 inline-block">
                          1 hour ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer link to separate page */}
                <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
                  <Link
                    href="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View All Notifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Messages Button -> Navigates to /messages */}
          <Link
            href="/messages"
            aria-label="Messages"
            title="Inter-Department Messages"
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900"></span>
          </Link>
        </div>

        {/* User Profile & Logout */}
        <div className="relative" ref={profileRef}>
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setShowProfileMenu((prev) => !prev)}
          >
            <Image
              src="/avatar.png"
              alt="User Avatar"
              width={36}
              height={36}
              className="rounded-full border border-slate-200 dark:border-slate-700 group-hover:border-blue-300 transition-colors"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{userName}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{userRole}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform" />
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#0c162d] rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in">
              <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{userName}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{departmentName}</div>
                <div className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                  {userRole}
                </div>
              </div>

              <Link
                href="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
              >
                <span>Officer Profile</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 transition-colors border-t border-slate-100 dark:border-slate-800"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
