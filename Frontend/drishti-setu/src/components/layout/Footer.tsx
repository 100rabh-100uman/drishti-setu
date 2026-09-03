import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-xl font-bold text-slate-800 mb-2">DRISHTI SETU</div>
            <p className="text-sm text-slate-500 text-center md:text-left max-w-sm">
              Building the digital foundation for integrated, intelligent and future-ready policing.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-700">Home</Link>
            <Link href="/platform" className="text-sm font-medium text-slate-600 hover:text-blue-700">Platform</Link>
            <Link href="/resources" className="text-sm font-medium text-slate-600 hover:text-blue-700">Resources</Link>
            <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-blue-700">Contact</Link>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Government of Gujarat / Gujarat Police. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-slate-800">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-800">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
