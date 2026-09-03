import { ActivityItem } from "@/types/scroll2";
import { Camera, UploadCloud, MapPin, Wrench, Shield, ChevronRight } from "lucide-react";

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  const getIcon = (name: string) => {
    switch (name) {
      case 'camera': return <Camera className="w-4 h-4" />;
      case 'upload': return <UploadCloud className="w-4 h-4" />;
      case 'map-pin': return <MapPin className="w-4 h-4" />;
      case 'wrench': return <Wrench className="w-4 h-4" />;
      case 'shield': return <Shield className="w-4 h-4" />;
      default: return <Camera className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-bold text-slate-800">Recent Activity</h2>
          <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Live Feed</span>
        </div>
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">View All</button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 group">
            <div className={`mt-0.5 p-2 rounded-lg flex-shrink-0 ${item.iconBgClass} ${item.iconColorClass}`}>
              {getIcon(item.icon)}
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-xs font-bold text-slate-800 leading-tight">{item.title}</span>
              <span className="text-[10px] text-slate-500 mt-0.5 font-medium">{item.subtitle}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
