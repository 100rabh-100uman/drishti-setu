import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-8">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 md:h-12 md:w-12">
                <Image 
                  src="/gov_of_guj_logo.svg" 
                  alt="Government of Gujarat Logo" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-800">Government of Gujarat</div>
                <div className="text-[10px] text-slate-500">ગુજરાત સરકાર</div>
              </div>
            </div>
            
            <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
            
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 md:h-12 md:w-12">
                <Image 
                  src="/gpolicelogo.png" 
                  alt="Gujarat Police Logo" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-slate-800">GUJARAT POLICE</div>
                <div className="text-[10px] font-medium text-slate-500">સેવા • સુરક્ષા • શાંતિ</div>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-sm font-bold text-blue-700 border-b-2 border-blue-700 py-7">
              Home
            </Link>
            <Link href="/platform" className="text-sm font-medium text-slate-600 hover:text-blue-700 py-7 transition-colors">
              DRISHTI SETU
            </Link>
            <Link href="/integration" className="text-sm font-medium text-slate-600 hover:text-blue-700 py-7 transition-colors">
              Integration Models
            </Link>
            <Link href="/resources" className="text-sm font-medium text-slate-600 hover:text-blue-700 py-7 transition-colors">
              Resources
            </Link>
            <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-blue-700 py-7 transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Lock className="h-4 w-4" />
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
