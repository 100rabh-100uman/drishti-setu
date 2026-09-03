"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={cn("shimmer-effect rounded-lg", className)}
    />
  );
}

/**
 * Reusable Page Header Skeleton
 */
export function PageHeaderSkeleton() {
  return (
    <div className="mb-6 space-y-4">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-3 h-3 rounded-full" />
        <Skeleton className="w-28 h-4" />
      </div>

      {/* Title banner skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-80 h-3.5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-28 h-9 rounded-xl" />
          <Skeleton className="w-24 h-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable Card Skeleton (for metrics, stats, overview)
 */
export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-4 mb-6`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3.5"
        >
          <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-28 h-5" />
            <Skeleton className="w-16 h-2.5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Reusable Table Skeleton
 */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 space-y-4">
      {/* Top search & filter bar skeleton */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <Skeleton className="w-64 h-9 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-7 rounded-lg" />
          <Skeleton className="w-16 h-7 rounded-lg" />
          <Skeleton className="w-16 h-7 rounded-lg" />
        </div>
      </div>

      {/* Table rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100">
          {Array.from({ length: cols }).map((_, idx) => (
            <Skeleton key={idx} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center justify-between gap-4 py-3">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton key={cIdx} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Reusable Map Skeleton
 */
export function MapSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="w-36 h-4" />
        <Skeleton className="w-24 h-4" />
      </div>
      <div className="h-64 sm:h-80 rounded-xl relative overflow-hidden bg-slate-100 flex items-center justify-center">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-4 right-4 space-y-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable Chart Skeleton
 */
export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-48 h-3" />
        </div>
        <Skeleton className="w-20 h-6 rounded-lg" />
      </div>

      <div className="h-48 flex items-end gap-3 pt-6 px-2">
        {Array.from({ length: 12 }).map((_, idx) => {
          const heights = ["40%", "70%", "55%", "90%", "65%", "80%", "45%", "85%", "60%", "75%", "95%", "50%"];
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton className="w-full rounded-t-md" style={{ height: heights[idx] }} />
              <Skeleton className="w-4 h-2.5" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
