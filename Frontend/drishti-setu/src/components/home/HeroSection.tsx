import Image from "next/image";
import Link from "next/link";
import { Lock, PlayCircle, Shield } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden min-h-[600px] flex items-center">
      {/* Background Image and Gradient */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/herobackground.png"
          alt="DRISHTI SETU Command Center"
          fill
          sizes="100vw"
          className="object-cover object-right"
          priority
        />
        {/* Gradient to ensure text readability on the left, clear on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 via-40% to-transparent to-60%"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 backdrop-blur-sm px-3 py-1.5 text-sm font-bold tracking-wide text-blue-700 mb-6 shadow-sm">
            <Image 
              src="/drishti_setu_logo.svg" 
              alt="Drishti Setu Logo" 
              width={38} 
              height={38} 
              className="drop-shadow-sm"
            />
            DRISHTI SETU
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15] mb-6 drop-shadow-sm">
            Smart CCTV Intelligence <br className="hidden sm:block" />
            For a <span className="text-blue-700">Safer Gujarat</span>
          </h1>
          
          <div className="h-1 w-16 bg-orange-500 mb-6 rounded-full"></div>
          
          <p className="text-lg text-slate-700 mb-8 max-w-xl leading-relaxed drop-shadow-sm font-medium">
            DRISHTI SETU is a unified platform that integrates CCTV infrastructure, geospatial intelligence and data-driven insights to enable smarter operations and safer communities.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              href="/login" 
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-blue-700 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-blue-800 transition-colors"
            >
              <Lock className="h-4 w-4" />
              Login to Dashboard
              <span className="ml-1">→</span>
            </Link>
            
            <button 
              type="button"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-slate-200 bg-white/90 backdrop-blur-sm px-6 py-3 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <PlayCircle className="h-5 w-5" />
              Watch Platform Overview
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
