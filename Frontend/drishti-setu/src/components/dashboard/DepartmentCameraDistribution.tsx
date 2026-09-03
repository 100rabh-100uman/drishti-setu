import { DepartmentDistribution } from "@/types/scroll2";

export function DepartmentCameraDistribution({ data }: { data: DepartmentDistribution[] }) {
  // Find max for scaling the bars
  const max = Math.max(...data.map(d => d.count));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-bold text-slate-800">Departments by Registered Cameras</h2>
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">View All</button>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {data.map((dept, idx) => (
          <div key={idx} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end">
              <span className="text-xs font-semibold text-slate-700 truncate pr-4">{dept.name}</span>
              <span className="text-xs font-bold text-slate-900">{dept.count.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${(dept.count / max) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
