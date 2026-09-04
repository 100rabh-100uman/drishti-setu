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
}

const iconMap: Record<string, React.ReactNode> = {
  'offline': <AlertCircle className="w-4 h-4 text-red-600" />,
  'maintenance': <Wrench className="w-4 h-4 text-amber-600" />,
  'review': <FileWarning className="w-4 h-4 text-orange-600" />,
  'onboarding': <Clock className="w-4 h-4 text-blue-600" />,
};

const bgMap: Record<string, string> = {
  'red': 'bg-red-50 border-red-100 hover:border-red-200',
  'orange': 'bg-orange-50 border-orange-100 hover:border-orange-200',
  'amber': 'bg-amber-50 border-amber-100 hover:border-amber-200',
  'blue': 'bg-blue-50 border-blue-100 hover:border-blue-200',
};

const textMap: Record<string, string> = {
  'red': 'text-red-700',
  'orange': 'text-orange-700',
  'amber': 'text-amber-700',
  'blue': 'text-blue-700',
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

export function AttentionRequired({ items, actions }: AttentionRequiredProps) {
  return (
    <div className="flex flex-col gap-6 col-span-1 lg:col-span-2 h-[520px]">
      
      {/* Attention Required Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-slate-800">Attention Required</h2>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">View All</button>
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
                <div className="mt-0.5 bg-white p-1.5 rounded-md shadow-sm border border-slate-100">
                  {iconMap[item.type]}
                </div>
                <div className="flex flex-col">
                  <span className={cn("text-xs font-bold leading-tight", textMap[item.priority])}>
                    {item.count} {item.title}
                  </span>
                  <span className="text-[10px] text-slate-600 font-medium mt-0.5">{item.subtitle}</span>
                </div>
              </div>
              <ChevronRight className={cn("w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1", textMap[item.priority])} />
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-slate-800">Quick Actions</h2>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">Customize</button>
        </div>

        <div className="grid grid-cols-3 gap-2 flex-1">
          {actions.map((action) => (
            <Link
              key={action.id}
              href={action.link}
              className="flex flex-col items-center justify-center gap-2 p-2 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all text-center group"
            >
              <div className={cn("p-2 rounded-lg bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform", action.color)}>
                {actionIconMap[action.icon] || <Activity className="w-6 h-6" />}
              </div>
              <span className="text-[9px] font-bold text-slate-600 leading-tight group-hover:text-blue-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
