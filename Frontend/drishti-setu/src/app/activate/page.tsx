"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Building2,
  User,
  ArrowRight,
  Check,
} from "lucide-react";

import { accessRequestService } from "@/services/access-request.service";
import { TokenVerifyResponse } from "@/types/access-request";
import { ApiError } from "@/services/api";

function ActivateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [profile, setProfile] = useState<TokenVerifyResponse | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. Verify token on load
  useEffect(() => {
    let isMounted = true;

    async function verify() {
      if (!token) {
        setTokenError("Missing activation token. Please use the complete activation link provided in your official notification.");
        setIsVerifyingToken(false);
        return;
      }

      try {
        const data = await accessRequestService.verifyToken(token);
        if (isMounted) {
          setProfile(data);
          setTokenError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          if (err instanceof ApiError) {
            setTokenError(err.message);
          } else if (err instanceof Error) {
            setTokenError(err.message);
          } else {
            setTokenError("Unable to verify activation token. Please check your network or contact administration.");
          }
        }
      } finally {
        if (isMounted) {
          setIsVerifyingToken(false);
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // 2. Submit password setup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!password) {
      setFormError("Please enter a new password.");
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);

    try {
      await accessRequestService.activateAccount({
        token,
        password,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Failed to activate account. Please try again or contact administration.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Banner & Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/drishti_setu_logo.svg"
              alt="Logo"
              width={24}
              height={24}
              className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            />
            <span className="text-sm font-extrabold tracking-wider text-white uppercase">
              DRISHTI SETU
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-[11px] font-semibold text-blue-300">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>Account Activation</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 py-10 flex flex-col justify-center">
        {/* State 1: Verifying Token */}
        {isVerifyingToken ? (
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-1">Verifying Activation Credentials</h2>
            <p className="text-xs text-slate-400">Authenticating one-time activation token with state command server...</p>
          </div>
        ) : tokenError ? (
          /* State 2: Invalid or Expired Token */
          <div className="bg-slate-950/70 border border-red-900/50 rounded-2xl p-8 shadow-2xl backdrop-blur-xl animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white text-center mb-2">Activation Link Invalid</h2>
            <p className="text-xs text-slate-400 text-center leading-relaxed mb-6">
              {tokenError}
            </p>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/login"
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center transition-colors"
              >
                Go to Login Page
              </Link>
              <Link
                href="/request-access"
                className="w-full py-2.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-semibold text-center transition-colors"
              >
                Submit New Access Request
              </Link>
            </div>
          </div>
        ) : isSuccess ? (
          /* State 3: Successfully Activated */
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              Account Successfully Activated
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
              Your official credentials have been verified and your custom password is active. You may now sign in to the operational command grid.
            </p>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>Proceed to Secure Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* State 4: Set Password Form */
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in">
            {/* Header */}
            <div className="mb-6 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-0.5 w-5 bg-amber-500 rounded-full"></div>
                <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase">
                  CREDENTIAL INITIALIZATION
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Set Your Account Password
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Configure your official password to finalize onboarding and activate your command access.
              </p>
            </div>

            {/* Confirmed Officer Badge */}
            {profile && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-6">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Confirmed Application Details
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      Officer Name:
                    </span>
                    <span className="font-bold text-white">{profile.full_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-slate-500" />
                      Employee ID:
                    </span>
                    <span className="font-mono font-bold text-blue-400">{profile.employee_id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      Department:
                    </span>
                    <span className="font-semibold text-slate-300">{profile.department_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      Assigned Role:
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      {profile.requested_role}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error banner */}
            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-start gap-2 shadow-sm">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">{formError}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  New Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter at least 8 characters"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password checks */}
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 space-y-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center ${password.length >= 8 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-600"}`}>
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>Minimum 8 characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center ${password && password === confirmPassword ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-600"}`}>
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>Passwords match</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Activating Account...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Set Password & Activate Account</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-slate-500 text-[11px]">
        DRISHTI SETU • Government of Gujarat • State Police Hackathon Intelligence Grid
      </footer>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400 mr-2" />
          <span>Loading activation portal...</span>
        </div>
      }
    >
      <ActivateContent />
    </Suspense>
  );
}
