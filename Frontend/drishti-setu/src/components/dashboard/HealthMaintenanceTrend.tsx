import { HealthTrendPoint } from "@/types/scroll2";

export function HealthMaintenanceTrend({ data }: { data: HealthTrendPoint[] }) {
  // This is a CSS-based mock line chart matching the visual aesthetic.
  // In a real implementation, you'd use a charting library like Recharts or Chart.js here.
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[12px] font-bold text-slate-800">Health & Maintenance Trend <span className="text-[10px] text-slate-400 font-normal ml-1">(Last 7 Days)</span></h2>
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">View Details</button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-[10px] font-medium text-slate-600">Online</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-[10px] font-medium text-slate-600">Offline</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-[10px] font-medium text-slate-600">Maintenance</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-[10px] font-medium text-slate-600">Degraded</span></div>
      </div>

      <div className="flex-1 relative border-b border-l border-slate-200 mt-2 min-h-[140px]">
        {/* Y-axis Labels */}
        <div className="absolute -left-6 bottom-0 top-0 flex flex-col justify-between text-[8px] text-slate-400 py-2">
          <span>16K</span>
          <span>12K</span>
          <span>8K</span>
          <span>4K</span>
          <span>0</span>
        </div>
        
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pt-3 pb-3">
          <div className="w-full h-px bg-slate-50"></div>
          <div className="w-full h-px bg-slate-50"></div>
          <div className="w-full h-px bg-slate-50"></div>
          <div className="w-full h-px bg-slate-50"></div>
        </div>

        {/* SVG Chart lines (Mocked paths based on reference visual) */}
        <div className="absolute inset-0 pt-3 pb-3">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            
            {/* Green Line (Online) */}
            <path d="M0 25 L16 22 L33 26 L50 15 L66 18 L83 20 L100 10" fill="none" stroke="#22c55e" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="0" cy="25" r="2" fill="#fff" stroke="#22c55e" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="16" cy="22" r="2" fill="#fff" stroke="#22c55e" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="33" cy="26" r="2" fill="#fff" stroke="#22c55e" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="50" cy="15" r="2" fill="#fff" stroke="#22c55e" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="66" cy="18" r="2" fill="#fff" stroke="#22c55e" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="83" cy="20" r="2" fill="#fff" stroke="#22c55e" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="100" cy="10" r="2" fill="#fff" stroke="#22c55e" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>

            {/* Red Line (Offline) */}
            <path d="M0 65 L16 68 L33 65 L50 72 L66 60 L83 62 L100 58" fill="none" stroke="#ef4444" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="0" cy="65" r="2" fill="#fff" stroke="#ef4444" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="16" cy="68" r="2" fill="#fff" stroke="#ef4444" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="33" cy="65" r="2" fill="#fff" stroke="#ef4444" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="50" cy="72" r="2" fill="#fff" stroke="#ef4444" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="66" cy="60" r="2" fill="#fff" stroke="#ef4444" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="83" cy="62" r="2" fill="#fff" stroke="#ef4444" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="100" cy="58" r="2" fill="#fff" stroke="#ef4444" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>

            {/* Amber Line (Maintenance) */}
            <path d="M0 80 L16 78 L33 82 L50 80 L66 85 L83 83 L100 75" fill="none" stroke="#f59e0b" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="0" cy="80" r="2" fill="#fff" stroke="#f59e0b" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="16" cy="78" r="2" fill="#fff" stroke="#f59e0b" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="33" cy="82" r="2" fill="#fff" stroke="#f59e0b" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="50" cy="80" r="2" fill="#fff" stroke="#f59e0b" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="66" cy="85" r="2" fill="#fff" stroke="#f59e0b" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="83" cy="83" r="2" fill="#fff" stroke="#f59e0b" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="100" cy="75" r="2" fill="#fff" stroke="#f59e0b" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>

            {/* Blue Line (Degraded) */}
            <path d="M0 90 L16 92 L33 90 L50 95 L66 92 L83 94 L100 90" fill="none" stroke="#3b82f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="0" cy="90" r="2" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="16" cy="92" r="2" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="33" cy="90" r="2" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="50" cy="95" r="2" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="66" cy="92" r="2" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="83" cy="94" r="2" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
            <circle cx="100" cy="90" r="2" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>

          </svg>
        </div>
      </div>

      {/* X-axis Labels */}
      <div className="flex justify-between mt-2 pl-1 pr-1 text-[8px] font-medium text-slate-500">
        {data.map((point, idx) => (
          <span key={idx}>{point.date}</span>
        ))}
      </div>
      
    </div>
  );
}
