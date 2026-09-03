"use client";

import { PageHeaderSkeleton, CardSkeleton, TableSkeleton } from "./Skeleton";

interface PageLoadingStateProps {
  type?: "table" | "cards" | "dashboard";
}

export function PageLoadingState({ type = "table" }: PageLoadingStateProps) {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in duration-200">
        <PageHeaderSkeleton />
        <CardSkeleton count={4} />
        {type === "table" && <TableSkeleton rows={6} cols={5} />}
      </div>
    </div>
  );
}
