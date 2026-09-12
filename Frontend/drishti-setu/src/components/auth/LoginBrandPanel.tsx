import Image from "next/image";
import { Shield, Camera, MapPin, Network, ShieldCheck } from "lucide-react";

export function LoginBrandPanel() {
  return (
    <div className="hidden lg:flex w-full absolute left-0 top-0 bottom-0 bg-[#050b14] overflow-hidden flex-col justify-center p-6 lg:px-12">
      
      <div className="absolute inset-0 z-0">
        <Image
          src="/login_background.webp"
          alt="Command Center Background"
          fill
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-cover object-center opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/70 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 flex flex-col items-start w-full max-w-xl">
        
        <div className="flex items-center gap-2 mb-6">
           <Image src="/drishti_setu_logo.svg" alt="Logo" width={28} height={28} className="drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
           <span className="text-lg font-bold tracking-widest text-white uppercase">DRISHTI SETU</span>
        </div>

        <div className="mb-3">
          <h2 className="text-[1rem] text-slate-100 font-medium mb-1">
            Building a Safer Gujarat with
          </h2>
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight text-white uppercase drop-shadow-lg">
            INTELLIGENCE.<br />
            INTEGRATION.<br />
            <span className="text-[#3b82f6] drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]">IMPACT.</span>
          </h1>
        </div>
        
        <div className="h-1 w-10 bg-orange-500 mb-4 rounded-full"></div>
        
        <p className="text-[13px] text-slate-300 max-w-[380px] leading-relaxed font-medium mb-6">
          DRISHTI SETU is a unified platform that integrates CCTV infrastructure, geospatial intelligence and data-driven insights to enable smarter operations and safer communities.
        </p>

        <div className="grid grid-cols-4 gap-25 w-full mb-6 max-w-[380px]">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#0a1229] border border-blue-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <Camera className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-[10px] font-semibold text-slate-300">Unified CCTV<br/>Registry</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#0a1229] border border-blue-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <MapPin className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-[10px] font-semibold text-slate-300">Geospatial<br/>Intelligence</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#0a1229] border border-blue-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <Network className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-[10px] font-semibold text-slate-300">Seamless<br/>Integration</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#0a1229] border border-blue-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-[10px] font-semibold text-slate-300">Secure &<br/>Scalable</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#0a152d]/40 border border-blue-500/20 backdrop-blur-md rounded-xl p-3 w-full max-w-[480px] shadow-[0_0_30px_rgba(37,99,235,0.1)]">
           <div className="flex-shrink-0 w-10 h-10 bg-[#050b14]/60 border border-blue-500/30 rounded-lg flex items-center justify-center shadow-inner">
             <ShieldCheck className="w-5 h-5 text-blue-400" />
           </div>
           <div>
             <h3 className="text-[12px] font-bold text-slate-200">Authorized Access Only</h3>
             <p className="text-[10px] text-slate-300 mt-0.5 leading-snug whitespace-nowrap">
               All activities are monitored and recorded for security and operational excellence.
             </p>
           </div>
        </div>

      </div>

      <div className="relative z-10 w-full lg:w-[48%] xl:w-[50%] mt-5 bg-[#050b14]/70 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl pr-4">
        <div className="flex items-center justify-between gap-2">
           
           {/* Govt Logo */}
           <div className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                <Image 
                  src="/gov_of_guj_logo.svg" 
                  alt="Government of Gujarat" 
                  fill 
                  sizes="40px"
                  className="object-contain filter brightness-0 invert opacity-90" 
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Government of Gujarat</div>
                <div className="text-[10px] text-slate-400">ગુજરાત સરકાર</div>
              </div>
            </div>
            
             <div className="h-6 w-px bg-slate-600/60"></div>

             {/* Drishti Setu Logo */}
            <div className="flex items-center gap-2">
               <div className="relative h-7 w-7">
                 <Image 
                    src="/drishti_setu_logo.svg" 
                    alt="Drishti Setu" 
                    fill 
                    sizes="28px"
                    className="object-contain drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" 
                 />
               </div>
               <div>
                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">DRISHTI SETU</div>
                  <div className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">Secure • Reliable • Future Ready</div>
               </div>
            </div>

        </div>
      </div>

    </div>
  );
}
