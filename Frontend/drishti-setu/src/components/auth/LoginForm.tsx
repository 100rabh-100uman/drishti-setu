"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Lock, Moon, Sun, Network, User2, AlertTriangle, KeyRound, Sparkles } from "lucide-react";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/services/api";
import { SecureLoginOverlay } from "@/components/auth/SecureLoginOverlay";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const redirectParam = searchParams.get("redirect") || "/dashboard";

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [activeDemoCard, setActiveDemoCard] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [showSecureTransition, setShowSecureTransition] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<{
    username: string;
    departmentName: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isNavigatingToRequestAccess, setIsNavigatingToRequestAccess] = useState(false);

  const handleNavigateToRequestAccess = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isNavigatingToRequestAccess || isLoading) return;
    setIsNavigatingToRequestAccess(true);
    setTimeout(() => {
      router.push("/request-access");
    }, 280);
  };

  const handleAuth = async (id: string, pass: string) => {
    setError("");
    const trimmedId = id.trim();
    if (!trimmedId) {
      setError("Please enter your Employee ID.");
      return;
    }
    if (!pass) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    setLoadingStep("Authenticating credentials...");

    try {
      const session = await authService.login(trimmedId, pass);
      setAuthenticatedUser({
        username: session.user.username || session.user.name || "Officer",
        departmentName: session.user.department_name || session.department?.name || "Gujarat Police",
      });
      setIsLoading(false);
      setShowSecureTransition(true);
    } catch (err: unknown) {
      setIsLoading(false);
      setLoadingStep("");
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to connect to DRISHTI SETU services.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAuth(employeeId, password);
  };

  const handleQuickLogin = async (id: string, pass: string) => {
    if (isLoading) return;
    setError("");
    setActiveDemoCard(id);
    setEmployeeId(id);
    setPassword(pass);

    // Allow evaluator to visibly see credentials populating the form
    await new Promise((resolve) => setTimeout(resolve, 450));

    try {
      await handleAuth(id, pass);
    } finally {
      setActiveDemoCard(null);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full lg:w-[42%] lg:ml-auto relative h-screen z-20">
      {/* The Slanted & Glowing White Background Layer */}
      <div
        className="absolute inset-y-[-5%] right-0 w-[130%] bg-white rounded-l-[7rem] border-l-[8px] border-blue-400 shadow-[-25px_0_80px_rgba(37,99,235,0.5)] origin-bottom-left"
        style={{ transform: "skewX(-10.5deg)" }}
      >
        {/* Intense Top-Left Edge Glow */}
        <div className="absolute top-0 left-[-20px] w-20 h-[70%] bg-gradient-to-b from-blue-300 via-blue-600 to-transparent filter blur-[25px] opacity-80"></div>

        {/* Inner flare for premium light effect */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full filter blur-[70px] opacity-70 transform -translate-x-1/4 -translate-y-1/4"></div>

        {/* Dot pattern background */}
        <div
          className="absolute inset-0 z-0 opacity-[0.12] pointer-events-none rounded-l-[4rem]"
          style={{
            backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
      </div>

      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
        <button
          type="button"
          aria-label="Toggle light theme"
          className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 bg-white shadow-sm transition-all"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label="Language selection"
          className="h-9 px-3 rounded-full flex items-center justify-center gap-1.5 text-blue-700 bg-[#e8f0fe] font-semibold text-xs shadow-sm transition-all"
        >
          <Moon className="w-3.5 h-3.5" />
          EN
        </button>
      </div>

      {/* Main Content */}
      <div
        className={`w-full max-w-[400px] mx-auto px-6 py-4 relative z-10 flex flex-col justify-center h-full pb-20 transition-all duration-300 ease-out ${
          isNavigatingToRequestAccess
            ? "opacity-0 -translate-y-3 scale-[0.985] blur-[0.5px] pointer-events-none"
            : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {/* Headings */}
        <div className="flex flex-col items-center text-center mb-5 mt-1">
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-[30px] font-extrabold text-[#0a1b3f] tracking-wide">
              DRISHTI SETU
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              Demo Mode
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 w-full mb-2">
            <div className="h-0.5 w-6 bg-[#d97706] rounded-full"></div>
            <span className="text-[#2563eb] font-bold tracking-widest text-[11px] uppercase">
              SECURE COMMAND ACCESS
            </span>
            <div className="h-0.5 w-6 bg-[#d97706] rounded-full"></div>
          </div>
          <p className="text-slate-500 text-xs font-medium">
            Access the DRISHTI SETU operational platform
          </p>
        </div>

        {/* Hackathon Evaluator Guidance Box */}
        <div className="mb-4 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/90 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-blue-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-extrabold uppercase tracking-wider text-blue-950 mb-0.5">
                Hackathon Evaluator Notice
              </div>
              <p className="text-xs text-slate-600 leading-normal">
                Click <strong className="text-blue-900 font-bold">Admin</strong> or <strong className="text-indigo-900 font-bold">Inspector</strong> in the demo cards below to auto-fill credentials and log in directly.
              </p>
            </div>
          </div>
        </div>

        {errorParam === "session_expired" && !error && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium flex items-start gap-2 shadow-sm animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">
              Session expired. Please log in again or click a quick demo account below.
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2 shadow-sm animate-in fade-in">
            <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">
              !
            </div>
            <div className="flex-1 leading-snug">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="employeeId"
              className="block text-xs font-bold text-[#0a1b3f] ml-1"
            >
              Employee ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <div className="w-4 h-4 border border-[#8b98b4] rounded-sm flex items-center justify-center">
                  <span className="text-[8px] font-bold text-[#8b98b4]">ID</span>
                </div>
              </div>
              <div className="absolute inset-y-0 left-10 w-px bg-slate-200 my-2"></div>
              <input
                id="employeeId"
                type="text"
                autoComplete="username"
                className={`block w-full pl-14 pr-3 py-2.5 text-[13px] rounded-lg border transition-all bg-white text-[#0a1b3f] font-semibold placeholder:font-normal placeholder:text-slate-400 shadow-sm outline-none ${
                  activeDemoCard
                    ? "border-blue-500 ring-4 ring-blue-500/10"
                    : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                }`}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter Employee ID (e.g. EMP001)"
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold text-[#0a1b3f] ml-1"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-[#8b98b4]" />
              </div>
              <div className="absolute inset-y-0 left-10 w-px bg-slate-200 my-2"></div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className={`block w-full pl-14 pr-10 py-2.5 text-[13px] rounded-lg border transition-all bg-white font-mono text-[#0a1b3f] placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 shadow-sm outline-none ${
                  activeDemoCard
                    ? "border-blue-500 ring-4 ring-blue-500/10"
                    : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b98b4] hover:text-[#0a1b3f] focus:outline-none p-1 rounded-md hover:bg-slate-100 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 pb-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <div className="w-4 h-4 rounded-sm border border-slate-300 bg-white peer-checked:bg-[#2563eb] peer-checked:border-[#2563eb] transition-colors"></div>
                <svg
                  className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-[13px] font-semibold text-[#0a1b3f]">
                Remember me
              </span>
            </label>
            <button
              type="button"
              className="text-[13px] font-bold text-[#2563eb] hover:text-blue-800 transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#1e3a8a] px-4 py-3.5 text-[13px] font-bold text-white shadow-lg shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all disabled:opacity-80 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {loadingStep}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                SECURE LOGIN
              </>
            )}
          </button>

          {/* Quick Demo Login Helper with Enhanced High-Visibility Cards */}
          <div className="pt-2.5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-extrabold text-[#0a1b3f] uppercase tracking-wider">
                  Quick Demo Access
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse shadow-xs">
                <span>⚡</span>
                <span>Click to Auto-Fill & Login</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin("EMP001", "admin123")}
                disabled={isLoading}
                className={`group relative flex flex-col items-start p-2.5 rounded-xl border-2 text-left transition-all duration-200 shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60 ${
                  activeDemoCard === "EMP001"
                    ? "bg-blue-100/90 border-blue-600 ring-2 ring-blue-500/30"
                    : "bg-gradient-to-br from-blue-50/90 via-blue-50/50 to-blue-100/60 hover:from-blue-100 hover:to-blue-200/80 border-blue-200/90 hover:border-blue-500"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">👑</span>
                    <span className="font-bold text-xs text-blue-950 group-hover:text-blue-700">Admin</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-200/80 text-blue-800">
                    EMP001
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate w-full flex items-center justify-between mt-0.5">
                  <span>Home Affairs</span>
                  {activeDemoCard === "EMP001" ? (
                    <span className="text-[9px] font-bold text-blue-700 animate-pulse">Auto-filling...</span>
                  ) : (
                    <span className="text-[9px] font-semibold text-blue-600 group-hover:underline">Click to Login →</span>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("EMP002", "admin123")}
                disabled={isLoading}
                className={`group relative flex flex-col items-start p-2.5 rounded-xl border-2 text-left transition-all duration-200 shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60 ${
                  activeDemoCard === "EMP002"
                    ? "bg-indigo-100/90 border-indigo-600 ring-2 ring-indigo-500/30"
                    : "bg-gradient-to-br from-indigo-50/90 via-indigo-50/50 to-indigo-100/60 hover:from-indigo-100 hover:to-indigo-200/80 border-indigo-200/90 hover:border-indigo-500"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">👮</span>
                    <span className="font-bold text-xs text-indigo-950 group-hover:text-indigo-700">Inspector</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-200/80 text-indigo-800">
                    EMP002
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate w-full flex items-center justify-between mt-0.5">
                  <span>Gujarat Police</span>
                  {activeDemoCard === "EMP002" ? (
                    <span className="text-[9px] font-bold text-indigo-700 animate-pulse">Auto-filling...</span>
                  ) : (
                    <span className="text-[9px] font-semibold text-indigo-600 group-hover:underline">Click to Login →</span>
                  )}
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2 text-center">
            <span className="text-xs text-slate-500 font-medium">Need platform credentials? </span>
            <button
              type="button"
              onClick={handleNavigateToRequestAccess}
              disabled={isNavigatingToRequestAccess || isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563eb] hover:text-blue-800 hover:underline transition-colors cursor-pointer group disabled:opacity-60"
            >
              {isNavigatingToRequestAccess ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Opening Portal...</span>
                </>
              ) : (
                <>
                  <span>Request Access</span>
                  <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Features Container */}
      <div className="absolute bottom-3 w-full px-4 flex justify-center z-10 hidden sm:flex">
        <div className="flex items-center justify-center gap-4 bg-white/95 px-5 py-2.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
              <User2 className="w-3 h-3 text-[#2563eb]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#0a1b3f] whitespace-nowrap">
                Role-Based Access
              </span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap border border-slate-200/60">
                Admin / Inspector / Viewer
              </span>
            </div>
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
              <Network className="w-3 h-3 text-[#2563eb]" />
            </div>
            <span className="text-[11px] font-bold text-[#0a1b3f] whitespace-nowrap">
              Multi-Department Architecture
            </span>
          </div>
        </div>
      </div>

      {/* Secure Login Transition Overlay */}
      <SecureLoginOverlay
        isVisible={showSecureTransition}
        officerName={authenticatedUser?.username}
        departmentName={authenticatedUser?.departmentName}
        onComplete={() => router.push(redirectParam)}
      />
    </div>
  );
}
