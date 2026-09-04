"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Bell, MessageSquare, ChevronDown, LogOut } from "lucide-react";
import { authService } from "@/services/auth.service";
import { AuthSession } from "@/types/auth";

export function TopHeader() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    setSession(authService.getCurrentSession());
  }, []);

  const departmentName = session?.department?.name || session?.user?.department_name || "Department";
  const userName = session?.user?.username || session?.user?.name || "Officer";
  const userRole = session?.user?.role || "Authorized User";

  const handleLogout = () => {
    authService.logout();
    router.replace("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Context Selection */}
      <div className="flex items-center gap-3">
        <Image src="/gpolicelogo.png" alt="Department Logo" width={32} height={32} className="object-contain" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="text-sm font-semibold text-slate-800">{departmentName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <span className="text-xs text-blue-600 font-medium">Command Portal</span>
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
            className="block w-full pl-10 pr-16 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white sm:text-sm transition-all"
            placeholder="Search cameras, locations, departments..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] font-medium text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-white">
              Ctrl + K
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3 border-r border-slate-200 pr-5">
          <button
            type="button"
            aria-label="Notifications"
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          <button
            type="button"
            aria-label="Messages"
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
        </div>

        {/* User Profile & Logout */}
        <div className="relative">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setShowProfileMenu((prev) => !prev)}
          >
            <Image
              src="/avatar.png"
              alt="User Avatar"
              width={36}
              height={36}
              className="rounded-full border border-slate-200 group-hover:border-blue-300 transition-colors"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">{userName}</span>
              <span className="text-[11px] text-slate-500 font-semibold">{userRole}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-800 truncate">{userName}</div>
                <div className="text-[11px] text-slate-500 truncate">{departmentName}</div>
                <div className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  {userRole}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
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
