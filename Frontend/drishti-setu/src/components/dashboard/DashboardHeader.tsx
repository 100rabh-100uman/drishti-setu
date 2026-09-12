"use client";

import Image from "next/image";
import { Calendar, Clock, RotateCw, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import { AuthSession } from "@/types/auth";

export function DashboardHeader() {
  const [time, setTime] = useState<Date | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setTime(new Date());
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

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000); // update every second so the clock feels alive
    return () => {
      clearInterval(interval);
      window.removeEventListener('drishti:department_changed', handleDeptChange);
    };
  }, []);

  const hour = time?.getHours() || 9;
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const userName = session?.user?.username || session?.user?.name || "Officer";
  const departmentName = session?.department?.name || session?.user?.department_name || (session?.user?.role === 'Admin' ? 'Department of Home Affairs' : 'Gujarat Police Department');
  const isAdmin = session?.user?.role === 'Admin' || departmentName.toLowerCase().includes('home') || session?.user?.employee_id === 'EMP001';
  const isPolice = departmentName.toLowerCase().includes('police');
  const emblemSrc = (isAdmin || !isPolice) ? "/gov_of_guj_logo.svg" : "/gpolicelogo.png";

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
      <div>
        {/* Dynamic Department Emblem & Scope Badge */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative w-6 h-6 flex-shrink-0">
            <Image
              src={emblemSrc}
              alt="Department Emblem"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{departmentName}</span>
            {isAdmin ? (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold pl-1 border-l border-blue-200 dark:border-blue-800">
                Govt. of Gujarat • Apex Command
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal pl-1 border-l border-blue-200 dark:border-blue-800">
                State Grid
              </span>
            )}
          </div>
        </div>

        <h1 className="text-2xl md:text-[28px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          {greeting}, {userName} <span className="text-2xl">👋</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Statewide Unified Surveillance & Video Feed Matrix</p>
      </div>
      
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-4 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0c162d] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm min-w-[300px] justify-center">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span>{time ? format(time, "dd MMM yyyy, eeee") : "Loading date..."}</span>
          </div>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="min-w-[65px] text-right">{time ? format(time, "hh:mm a") : "--:--"}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium mr-1">
          <span>Last updated: just now</span>
          <RotateCw className="w-3 h-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors" />
        </div>
      </div>
    </div>
  );
}
