import Link from "next/link";
import Image from "next/image";

export function DashboardFooter() {
  return (
    <footer className="mt-12 py-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-[11px] font-medium text-slate-500 gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Image src="/drishti_setu_logo.svg" alt="Drishti Setu" width={16} height={16} />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-slate-700 tracking-wider">DRISHTI SETU</span>
            <span className="text-[8px] uppercase tracking-widest text-slate-400">Secure • Reliable • Future Ready</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-slate-400">
        <span>© 2025 DRISHTI SETU - Government of Gujarat</span>
        <span>|</span>
        <span className="text-blue-600">Gujarat Police</span>
      </div>

      <div className="flex items-center gap-6">
        <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Use</Link>
        <Link href="/support" className="hover:text-blue-600 transition-colors">Support</Link>
        <Link href="/feedback" className="hover:text-blue-600 transition-colors">Feedback</Link>
      </div>
    </footer>
  );
}
