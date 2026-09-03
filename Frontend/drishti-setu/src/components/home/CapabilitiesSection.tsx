import { Shield, MapPin, Network, LineChart, Lock, Users } from "lucide-react";

interface CapabilityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgColor: string;
  iconColor: string;
}

function CapabilityCard({ icon, title, description, iconBgColor, iconColor }: CapabilityCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 border-r border-slate-100 last:border-r-0 md:border-b-0 border-b">
      <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 ${iconBgColor} ${iconColor}`}>
        {icon}
      </div>
      <h3 className="text-sm font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
        {description}
      </p>
    </div>
  );
}

export function CapabilitiesSection() {
  const capabilities = [
    {
      title: "Unified CCTV Registry",
      description: "A structured foundation for maintaining accurate CCTV asset information.",
      icon: <Shield className="h-5 w-5" />,
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Geospatial Intelligence",
      description: "Visualize cameras and infrastructure through GIS-based spatial context.",
      icon: <MapPin className="h-5 w-5" />,
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Seamless Integration",
      description: "Prepare the platform to connect heterogeneous CCTV systems, vendors and VMS.",
      icon: <Network className="h-5 w-5" />,
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      title: "Data-driven Insights",
      description: "Transform operational data into actionable insights for better decision making.",
      icon: <LineChart className="h-5 w-5" />,
      iconBgColor: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      title: "Secure & Scalable",
      description: "Role-based access, secure by design and built to scale with future needs.",
      icon: <Lock className="h-5 w-5" />,
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-700"
    },
    {
      title: "Collaborative Operations",
      description: "Empower departments to collaborate on a common intelligence platform.",
      icon: <Users className="h-5 w-5" />,
      iconBgColor: "bg-indigo-100",
      iconColor: "text-indigo-600"
    }
  ];

  return (
    <section className="pb-24 pt-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-10 border-b border-slate-100 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">What is DRISHTI SETU?</h2>
            <p className="text-slate-600 max-w-3xl mx-auto text-sm">
              DRISHTI SETU is a future-ready digital foundation for creating a unified view of CCTV infrastructure across departments, locations and heterogeneous systems.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {capabilities.map((cap, index) => (
              <CapabilityCard 
                key={index}
                title={cap.title}
                description={cap.description}
                icon={cap.icon}
                iconBgColor={cap.iconBgColor}
                iconColor={cap.iconColor}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-6 py-4 flex items-center gap-3 w-full max-w-4xl justify-center text-center">
            <Shield className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-slate-700">
              DRISHTI SETU is the digital foundation for integrated, intelligent and future-ready policing in Gujarat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
