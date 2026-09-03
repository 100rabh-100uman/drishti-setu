"use client";

import { Calendar, Clock, RotateCw } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { authService } from "@/services/mock/auth.service";
import { AuthSession } from "@/types/auth";

export function DashboardHeader() {
  const [time, setTime] = useState<Date | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setTime(new Date());
    setSession(authService.getCurrentSession());
    
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000); // update every second so the clock feels alive
    return () => clearInterval(interval);
  }, []);

  const hour = time?.getHours() || 9;
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const userName = session?.user?.name || "Inspector Rajveer Singh";

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-[28px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          {greeting}, {userName} <span className="text-2xl">👋</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">CCTV Infrastructure Overview</p>
      </div>
      
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-4 text-sm font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm min-w-[300px] justify-center">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{time ? format(time, "dd MMM yyyy, eeee") : "Loading date..."}</span>
          </div>
          <div className="w-px h-4 bg-slate-300"></div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="min-w-[65px] text-right">{time ? format(time, "hh:mm a") : "--:--"}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mr-1">
          <span>Last updated: just now</span>
          <RotateCw className="w-3 h-3 cursor-pointer hover:text-slate-800 transition-colors" />
        </div>
      </div>
    </div>
  );
}
