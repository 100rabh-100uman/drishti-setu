import { IntegrationSystem } from "@/types/scroll2";
import { ArrowRight, Wifi, Server, Box, Map, Database } from "lucide-react";
import Link from "next/link";

export function IntegrationReadiness({ data }: { data: IntegrationSystem[] }) {
  const icons: Record<string, React.ReactNode> = {
    'wifi': <Wifi className="w-6 h-6" />,
    'server': <Server className="w-6 h-6" />,
    'box': <Box className="w-6 h-6" />,
    'map': <Map className="w-6 h-6" />,
    'database': <Database className="w-6 h-6" />,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 col-span-1 lg:col-span-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-bold text-slate-800">Integration Readiness</h2>
          <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            All Systems Operational
          </span>
        </div>
        <Link href="/integrations" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5">
          View All Integrations <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {data.map((system) => (
           <div key={system.id} className="border border-slate-100 bg-slate-50 rounded-xl p-4 flex flex-col justify-center items-center text-center gap-3 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
             <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm border border-slate-100/50 ${system.bgClass} ${system.colorClass}`}>
               {icons[system.icon] || <Box className="w-6 h-6" />}
             </div>
             <div className="flex flex-col">
               <span className="text-xs font-bold text-slate-800">{system.name}</span>
               <span className={`text-[10px] font-bold mt-1 ${system.status === 'Active' || system.status === 'Ready' ? 'text-green-600' : 'text-blue-600'}`}>
                 {system.status}
               </span>
               <span className="text-[9px] text-slate-400 font-medium mt-0.5">Last sync: {system.lastSync}</span>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
}
