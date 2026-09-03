"use client";

import { useState } from "react";
import { HealthData } from "@/types/dashboard";

interface CameraHealthCardProps {
  data: HealthData;
}

export function CameraHealthCard({ data }: CameraHealthCardProps) {
  const [activeCategory, setActiveCategory] = useState<'Online' | 'Offline' | 'Degraded' | 'Maintenance' | 'Unknown' | null>(null);

  // Calculate total for percentages
  const total = data.online + data.offline + data.degraded + data.maintenance + data.unknown;

  const getPercentage = (value: number) => ((value / total) * 100).toFixed(1);

  const categories = {
    'Online': { value: data.online, label: 'Online', percentColor: 'text-green-600', bgDot: 'bg-green-500' },
    'Offline': { value: data.offline, label: 'Offline', percentColor: 'text-red-600', bgDot: 'bg-red-500' },
    'Degraded': { value: data.degraded, label: 'Degraded', percentColor: 'text-amber-600', bgDot: 'bg-amber-500' },
    'Maintenance': { value: data.maintenance, label: 'Maintenance', percentColor: 'text-blue-600', bgDot: 'bg-blue-500' },
    'Unknown': { value: data.unknown, label: 'Unknown', percentColor: 'text-slate-500', bgDot: 'bg-slate-400' },
  };

  const activeData = activeCategory ? categories[activeCategory] : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2 flex flex-col h-[520px] col-span-1 lg:col-span-1">
      <h2 className="text-[13px] font-bold text-slate-800 mb-1">Camera Health Overview</h2>
      
      {/* Donut Chart and Legend */}
      <div className="flex flex-col items-center justify-center gap-1 mb-1 px-0">
        
      {/* SVG Donut */}
        <div className="relative w-42 h-32 mb-5 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            {/* Online (Green) */}
            <path 
              onMouseEnter={() => setActiveCategory('Online')}
              onMouseLeave={() => setActiveCategory(null)}
              className="text-green-500 hover:opacity-80 transition-opacity cursor-pointer" 
              strokeDasharray="92.9, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
            />
            {/* Offline (Red) */}
            <path 
              onMouseEnter={() => setActiveCategory('Offline')}
              onMouseLeave={() => setActiveCategory(null)}
              className="text-red-500 hover:opacity-80 transition-opacity cursor-pointer" 
              strokeDasharray="4.9, 100" strokeDashoffset="-92.9" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
            />
            {/* Degraded (Amber) */}
            <path 
              onMouseEnter={() => setActiveCategory('Degraded')}
              onMouseLeave={() => setActiveCategory(null)}
              className="text-amber-500 hover:opacity-80 transition-opacity cursor-pointer" 
              strokeDasharray="1.5, 100" strokeDashoffset="-97.8" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
            />
            {/* Maintenance (Blue) */}
            <path 
              onMouseEnter={() => setActiveCategory('Maintenance')}
              onMouseLeave={() => setActiveCategory(null)}
              className="text-blue-500 hover:opacity-80 transition-opacity cursor-pointer" 
              strokeDasharray="2.2, 100" strokeDashoffset="-99.3" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
            />
            {/* Unknown (Gray) */}
            <path 
              onMouseEnter={() => setActiveCategory('Unknown')}
              onMouseLeave={() => setActiveCategory(null)}
              className="text-slate-400 hover:opacity-80 transition-opacity cursor-pointer" 
              strokeDasharray="0.5, 100" strokeDashoffset="-101.5" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {activeData ? (
              <>
                <span className="text-[25px] font-black text-slate-800 leading-none">{activeData.value.toLocaleString()}</span>
                <span className="text-[10px] font-semibold text-slate-500 mt-0.5">{activeData.label}</span>
                <span className={`text-[10px] font-bold mt-0.5 ${activeData.percentColor}`}>{getPercentage(activeData.value)}%</span>
              </>
            ) : (
              <>
                <span className="text-[25px] font-black text-slate-800 leading-none">{total.toLocaleString()}</span>
                <span className="text-[10px] font-semibold text-slate-500 mt-1">Total Cameras</span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Trend Graph Mock */}
      <div className="mt-6 flex flex-col flex-1">
         <h3 className="text-[11px] font-bold text-slate-700 mb-4">Health Trend (Last 7 Days)</h3>
         
         <div className="relative flex-1 min-h-[140px] ml-7 w-[calc(100%-28px)] border-b border-l border-slate-200">
           
           {/* Y Axis labels */}
           <div className="absolute -left-7 bottom-0 top-0 flex flex-col justify-between text-[8px] text-slate-400 py-1 w-6 text-right pr-1">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
           </div>
           
           {/* Grid lines */}
           <div className="absolute inset-0 flex flex-col justify-between">
             <div className="w-full h-px bg-slate-100"></div>
             <div className="w-full h-px bg-slate-100"></div>
             <div className="w-full h-px bg-slate-100"></div>
             <div className="w-full h-px bg-slate-100"></div>
           </div>

           {/* Trend Line (SVG) */}
           <div className="absolute inset-0 pt-2 pb-0">
             <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {/* Area fill */}
                <path 
                  d="M0 60 L16 55 L33 50 L50 40 L66 30 L83 20 L100 15 L100 100 L0 100 Z" 
                  fill="rgba(34,197,94,0.1)"
                />
                {/* Line */}
                <path 
                  d="M0 60 L16 55 L33 50 L50 40 L66 30 L83 20 L100 15" 
                  fill="none" 
                  stroke="#22c55e" 
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Points */}
                <circle cx="0" cy="60" r="3" fill="#fff" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
                <circle cx="16" cy="55" r="3" fill="#fff" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
                <circle cx="33" cy="50" r="3" fill="#fff" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
                <circle cx="50" cy="40" r="3" fill="#fff" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
                <circle cx="66" cy="30" r="3" fill="#fff" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
                <circle cx="83" cy="20" r="3" fill="#fff" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
                
                {/* Highlight Point */}
                <circle cx="100" cy="15" r="4" fill="#22c55e" stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
                
             </svg>
             {/* Tooltip on last point */}
             <div className="absolute right-0 top-1 text-[9px] font-bold text-green-600 bg-white border border-green-200 px-1 rounded transform -translate-y-full translate-x-2">
                92.9%
             </div>
           </div>

         </div>

         {/* X Axis labels */}
         <div className="flex justify-between text-[9px] text-slate-400 mt-2 px-1 ml-7 w-[calc(100%-28px)]">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
         </div>

      </div>

    </div>
  );
}
