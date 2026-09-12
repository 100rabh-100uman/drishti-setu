"use client";

import { useState } from "react";
import Link from "next/link";
import { AttentionItem, QuickAction } from "@/types/dashboard";
import {
  AlertCircle,
  Wrench,
  FileWarning,
  Clock,
  ChevronRight,
  PlusCircle,
  UploadCloud,
  Plug,
  Activity,
  FileText,
  MapPin,
  Video
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AttentionRequiredProps {
  items: AttentionItem[];
  actions: QuickAction[];
  className?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  'offline': <AlertCircle className="w-4 h-4 text-red-600" />,
  'maintenance': <Wrench className="w-4 h-4 text-amber-600" />,
  'review': <FileWarning className="w-4 h-4 text-orange-600" />,
  'onboarding': <Clock className="w-4 h-4 text-blue-600" />,
};

const bgMap: Record<string, string> = {
  'red': 'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/50 hover:border-red-200 dark:hover:border-red-800',
  'orange': 'bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900/50 hover:border-orange-200 dark:hover:border-orange-800',
  'amber': 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50 hover:border-amber-200 dark:hover:border-amber-800',
  'blue': 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50 hover:border-blue-200 dark:hover:border-blue-800',
};

const textMap: Record<string, string> = {
  'red': 'text-red-700 dark:text-red-300',
  'orange': 'text-orange-700 dark:text-orange-300',
  'amber': 'text-amber-700 dark:text-amber-300',
  'blue': 'text-blue-700 dark:text-blue-300',
};

const actionIconMap: Record<string, React.ReactNode> = {
  'camera-plus': <PlusCircle className="w-6 h-6" />,
  'video': <Video className="w-6 h-6" />,
  'upload': <UploadCloud className="w-6 h-6" />,
  'api-onboarding': <Plug className="w-6 h-6" />,
  'activity': <Activity className="w-6 h-6" />,
  'wrench': <Wrench className="w-6 h-6" />,
  'file-text': <FileText className="w-6 h-6" />,
  'map': <MapPin className="w-6 h-6" />,
};

export function AttentionRequired({ items, actions, className }: AttentionRequiredProps) {
  return (
    <div className={cn("flex flex-col gap-6 col-span-1 lg:col-span-2 h-[520px]", className)}>
      
      {/* Attention Required Panel */}
      <div className="bg-white dark:bg-[#0c162d] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Attention Required</h2>
          <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">View All</button>
        </div>
        
        <div className="flex flex-col gap-2.5 overflow-y-auto">
          {items.map((item) => (
            <Link 
              href={item.link} 
              key={item.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-sm group",
                bgMap[item.priority]
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-white dark:bg-slate-900 p-1.5 rounded-md shadow-sm border border-slate-100 dark:border-slate-800">
                  {iconMap[item.type]}
                </div>
                <div className="flex flex-col">
                  <span className={cn("text-xs font-bold leading-tight", textMap[item.priority])}>
                    {item.count} {item.title}
                  </span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">{item.subtitle}</span>
                </div>
              </div>
              <ChevronRight className={cn("w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1", textMap[item.priority])} />
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white dark:bg-[#0c162d] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Quick Actions</h2>
          <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Customize</button>
        </div>

        <div className="grid grid-cols-3 gap-2 flex-1">
          {actions.map((action) => (
            <Link
              key={action.id}
              href={action.link}
              className="flex flex-col items-center justify-center gap-2 p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-sm transition-all text-center group"
            >
              <div className={cn("p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform", action.color)}>
                {actionIconMap[action.icon] || <Activity className="w-6 h-6" />}
              </div>
              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 leading-tight group-hover:text-blue-700 dark:group-hover:text-blue-400">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
