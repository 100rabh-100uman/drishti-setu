import { PageHeaderSkeleton, CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      <PageHeaderSkeleton />
      <CardSkeleton count={4} />
      <TableSkeleton rows={4} cols={4} />
    </div>
  );
}
