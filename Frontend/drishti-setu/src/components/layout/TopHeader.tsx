"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Bell, MessageSquare, ChevronDown } from "lucide-react";
import { authService } from "@/services/mock/auth.service";
import { AuthSession } from "@/types/auth";

export function TopHeader() {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession(authService.getCurrentSession());
  }, []);

  const departmentName = session?.department?.name || "Gujarat Police";
  const userName = session?.user?.name || "Inspector Rajveer Singh";
  const userRole = session?.user?.role || "Department Operator";

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
          <span className="text-xs text-blue-600 font-medium">Ahmedabad City</span>
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
            <span className="text-[10px] font-medium text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-white">Ctrl + K</span>
          </div>
        </div>
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center gap-5">
        
        <div className="flex items-center gap-3 border-r border-slate-200 pr-5">
          <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
        </div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <Image 
            src="/avatar.png" 
            alt="User Avatar" 
            width={36} 
            height={36} 
            className="rounded-full border border-slate-200 group-hover:border-blue-300 transition-colors"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800">{userName}</span>
            <span className="text-[11px] text-slate-500">{userRole}</span>
          </div>
        </div>

      </div>

    </header>
  );
}
