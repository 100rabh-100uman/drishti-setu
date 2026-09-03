import { AgeingData } from "@/types/scroll2";
import Image from "next/image";
import { Wrench, Settings, HardDrive, AlertTriangle } from "lucide-react";

export function AgeingInfrastructure({ data }: { data: AgeingData }) {
  const icons: Record<string, React.ReactNode> = {
    'Infrastructure Assets': <Wrench className="w-4 h-4" />,
    'End of Life Cameras': <AlertTriangle className="w-4 h-4" />,
    'Firmware Outdated': <Settings className="w-4 h-4" />,
    'Storage Nearing Limit': <HardDrive className="w-4 h-4" />,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-bold text-slate-800">Ageing Infrastructure</h2>
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">View Details</button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        {/* We can use an icon or standard image for the camera illustration. Let's use a stylish icon box. */}
        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 relative">
           <Image src="/drishti_setu_logo.svg" alt="Camera" width={40} height={40} className="opacity-20 grayscale" />
           <div className="absolute inset-0 flex items-center justify-center">
             <AlertTriangle className="w-6 h-6 text-slate-400" />
           </div>
        </div>
        <div className="flex flex-col">
           <span className="text-3xl font-black text-slate-800 leading-none">{data.camerasOver5Years}</span>
           <span className="text-[11px] font-bold text-slate-600 mt-1">Cameras &gt; 5 Years</span>
           <span className="text-[9px] text-slate-400 mt-0.5">{data.camerasOver5Years} / 12,842 ({data.percentageOfTotal}%)</span>
        </div>
      </div>
      
      <div className="w-full bg-slate-100 h-1.5 rounded-full mb-6 overflow-hidden">
        <div className="bg-green-500 h-full w-[80%] rounded-full"></div>
      </div>

      <div className="flex flex-col gap-3 mt-auto">
        {data.items.map((item, idx) => (
           <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
             <div className="flex items-center gap-2.5">
               <div className="text-orange-500 bg-orange-50 p-1.5 rounded">
                 {icons[item.label] || <Wrench className="w-4 h-4" />}
               </div>
               <span className="text-[11px] font-semibold text-slate-700">{item.label}</span>
             </div>
             <div className="flex items-center gap-3">
               <span className="text-sm font-bold text-slate-800">{item.count}</span>
               <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${item.statusColorClass}`}>
                 {item.status === 'Critical' && <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>}
                 {item.status}
               </span>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
}
