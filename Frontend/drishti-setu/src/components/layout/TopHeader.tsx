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
import { authService } from "@/services/auth.service";
import { AuthSession } from "@/types/auth";
import { useTheme } from "@/context/ThemeContext";

export function TopHeader() {
  const router = useRouter();
  const { theme, isBright, toggleTheme } = useTheme();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSession(authService.getCurrentSession());

    // Close popups on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const departmentName = session?.department?.name || session?.user?.department_name || "Department";
  const userName = session?.user?.username || session?.user?.name || "Officer";
  const userRole = session?.user?.role || "Authorized User";

  const handleLogout = () => {
    authService.logout();
    router.replace("/login");
  };

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <header className="h-16 bg-white dark:bg-[#091124] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-200">
      {/* Context Selection */}
      <div className="flex items-center gap-3">
        <Image src="/gpolicelogo.png" alt="Department Logo" width={32} height={32} className="object-contain" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{departmentName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Command Portal</span>
        </div>
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
