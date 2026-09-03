"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, Loader2, Lock, Shield } from "lucide-react";

interface SecureLoginOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  officerName?: string;
  departmentName?: string;
}

export function SecureLoginOverlay({
  isVisible,
  onComplete,
  officerName = "Authorized Officer",
  departmentName = "Gujarat Police",
}: SecureLoginOverlayProps) {
  const [phase, setPhase] = useState<"authenticating" | "verified" | "launching">("authenticating");

  useEffect(() => {
    if (!isVisible) {
      setPhase("authenticating");
      return;
    }

    // Step 1: Authenticating (250ms)
    const t1 = setTimeout(() => {
      setPhase("verified");
    }, 280);

    // Step 2: Access Verified (350ms)
    const t2 = setTimeout(() => {
      setPhase("launching");
    }, 620);

    // Step 3: Complete and redirect (200ms)
    const t3 = setTimeout(() => {
      onComplete();
    }, 850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a1b3f]/95 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
    >
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-white/20 transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Phase 1: Authenticating */}
        {phase === "authenticating" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-blue-600">SECURE LOGIN</div>
              <h3 className="text-base font-bold text-[#0a1b3f] mt-1">Authenticating Credentials...</h3>
              <p className="text-xs text-slate-500 mt-1">Verifying departmental security token</p>
            </div>
          </div>
        )}

        {/* Phase 2: Access Verified */}
        {phase === "verified" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/60 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-emerald-600 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">ACCESS VERIFIED</div>
              <h3 className="text-base font-bold text-[#0a1b3f] mt-1">{officerName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{departmentName}</p>
            </div>
          </div>
        )}

        {/* Phase 3: Launching Command Dashboard */}
        {phase === "launching" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
              <Shield className="w-8 h-8 text-white fill-white/20" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-blue-600">DRISHTI SETU</div>
              <h3 className="text-base font-bold text-[#0a1b3f] mt-1">Launching Command Center...</h3>
              <p className="text-xs text-slate-500 mt-0.5">Initializing operational platform</p>
            </div>
          </div>
        )}

        {/* Bottom subtle progress bar */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: phase === "authenticating" ? "35%" : phase === "verified" ? "75%" : "100%",
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
