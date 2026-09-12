"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Shield,
  ShieldCheck,
  Building2,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Copy,
  Check,
  Clock,
  KeyRound,
  Eye,
  ShieldAlert,
  Sun,
  Moon,
  Database,
} from "lucide-react";

import { accessRequestSchema, AccessRequestFormData } from "@/schemas/access-request.schema";
import { accessRequestService, DepartmentOption } from "@/services/access-request.service";
import { AccessRequestSubmitResponse, PlatformRole } from "@/types/access-request";
import { ApiError } from "@/services/api";

const ROLE_DESCRIPTIONS: Record<
  PlatformRole,
  { title: string; desc: string; icon: typeof Eye; badge: string }
> = {
  Viewer: {
    title: "Operational Viewer",
    desc: "Read-only access to GIS surveillance feeds, camera registry, and situational status maps.",
    icon: Eye,
    badge: "Standard",
  },
  Inspector: {
    title: "Field Inspector",
    desc: "Operational access: camera metadata inspection, health validation, maintenance logging & alerts.",
    icon: ShieldCheck,
    badge: "Operational",
  },
  Admin: {
    title: "Command Administrator",
    desc: "Full infrastructure governance: CCTV camera onboarding, user approvals, zone management & audit logs.",
    icon: ShieldAlert,
    badge: "Restricted",
  },
};

export default function RequestAccessPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [exitTarget, setExitTarget] = useState<string | null>(null);

  const handleReturnToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isExiting) return;
    setIsExiting(true);
    setExitTarget("login");
    setTimeout(() => {
      router.push("/login");
    }, 250);
  };

  // Theme state: default is LIGHT per design specifications
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<AccessRequestSubmitResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("drishti_theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
      } else {
        setTheme("light");
      }
    } catch {
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      localStorage.setItem("drishti_theme", nextTheme);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccessRequestFormData>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: {
      full_name: "",
      employee_id: "",
      official_email: "",
      mobile_number: "",
      department_id: undefined,
      designation: "",
      office_unit: "",
      district: "",
      requested_role: "Viewer",
      reason: "",
    },
  });

  const selectedRole = watch("requested_role");

  // Load real departments from the backend API (Supabase departments table)
  useEffect(() => {
    let isMounted = true;
    async function loadDepartments() {
      setIsLoadingDepts(true);
      try {
        const data = await accessRequestService.getDepartments();
        if (isMounted) {
          setDepartments(data);
          if (data.length > 0) {
            setValue("department_id", data[0].id);
          }
        }
      } catch {
        if (isMounted) {
          setDepartments([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingDepts(false);
        }
      }
    }
    loadDepartments();
    return () => {
      isMounted = false;
    };
  }, [setValue]);

  const onSubmit = async (data: AccessRequestFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await accessRequestService.submitRequest({
        full_name: data.full_name,
        employee_id: data.employee_id,
        official_email: data.official_email,
        mobile_number: data.mobile_number,
        department_id: Number(data.department_id),
        designation: data.designation,
        office_unit: data.office_unit,
        district: data.district,
        requested_role: data.requested_role,
        reason: data.reason,
      });
      setSuccessData(response);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Failed to connect to the server. Please check your network or try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRequestId = () => {
    if (successData?.request_id) {
      navigator.clipboard.writeText(successData.request_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isDark = theme === "dark";

  // Check if error is due to unapplied database migration (HTTP 503)
  const isTableMissingError =
    serverError &&
    (serverError.includes("access_requests") ||
      serverError.includes("001_create_access_requests.sql") ||
      serverError.includes("not been created") ||
      serverError.includes("schema cache") ||
      serverError.includes("503"));

  return (
    <div
      data-page-container
      className={`min-h-screen flex flex-col justify-between transition-all duration-260 ease-out ${
        isExiting
          ? "opacity-0 -translate-y-3 scale-[0.99] blur-[0.5px] pointer-events-none"
          : "animate-page-enter"
      } ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* Top Header & Navigation */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors duration-200 ${
          isDark
            ? "border-slate-800/80 bg-slate-950/85 text-slate-100"
            : "border-slate-200 bg-white/95 text-slate-800 shadow-sm"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReturnToLogin}
            disabled={isExiting}
            className={`flex items-center gap-2 text-xs font-semibold transition-colors group cursor-pointer disabled:opacity-60 ${
              isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-[#0a1b3f]"
            }`}
          >
            {isExiting && exitTarget === "login" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span>Returning to Login...</span>
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Return to Login</span>
              </>
            )}
          </button>

          {/* Branding */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/drishti_setu_logo.svg"
              alt="Logo"
              width={26}
              height={26}
              className="drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]"
            />
            <div className="flex flex-col">
              <span
                className={`text-sm font-extrabold tracking-wider uppercase leading-none ${
                  isDark ? "text-white" : "text-[#0a1b3f]"
                }`}
              >
                DRISHTI SETU
              </span>
              <span className="text-[9px] font-semibold tracking-widest text-amber-600 uppercase mt-0.5">
                Government of Gujarat
              </span>
            </div>
          </div>

          {/* Right Controls: Official Portal Badge & Theme Toggle */}
          <div className="flex items-center gap-3">
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isDark
                  ? "bg-blue-950/60 border-blue-800/60 text-blue-300"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              <Shield className="w-3 h-3 text-blue-600" />
              <span>Official Portal</span>
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline text-slate-300 text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600" />
                  <span className="hidden md:inline text-slate-600 text-[11px]">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Success Confirmation Card */}
        {successData ? (
          <div
            className={`border rounded-2xl p-6 sm:p-10 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 ${
              isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2
                className={`text-2xl font-extrabold tracking-tight mb-2 ${
                  isDark ? "text-white" : "text-[#0a1b3f]"
                }`}
              >
                Access Request Submitted
              </h2>
              <p className={`text-sm max-w-md ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Your official request has been logged into the secure audit register and forwarded
                for administrative verification.
              </p>
            </div>

            {/* Reference Tracking Box */}
            <div
              className={`border rounded-xl p-5 mb-6 max-w-xl mx-auto ${
                isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-widest mb-1.5 flex items-center justify-between text-slate-500">
                <span>Unique Application Reference ID</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/30 text-[10px] font-bold">
                  PENDING REVIEW
                </span>
              </div>
              <div
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-300 shadow-sm"
                }`}
              >
                <code className="text-base sm:text-lg font-mono font-bold text-blue-600 tracking-wider">
                  {successData.request_id}
                </code>
                <button
                  type="button"
                  onClick={copyRequestId}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Application Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-8 text-xs">
              <div
                className={`border rounded-lg p-3.5 ${
                  isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <span className="text-slate-500 block mb-0.5 font-medium">Employee ID</span>
                <span className={`font-semibold ${isDark ? "text-slate-200" : "text-[#0a1b3f]"}`}>
                  {successData.employee_id}
                </span>
              </div>
              <div
                className={`border rounded-lg p-3.5 ${
                  isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <span className="text-slate-500 block mb-0.5 font-medium">Department</span>
                <span className={`font-semibold ${isDark ? "text-slate-200" : "text-[#0a1b3f]"}`}>
                  {successData.department_name}
                </span>
              </div>
              <div
                className={`border rounded-lg p-3.5 ${
                  isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <span className="text-slate-500 block mb-0.5 font-medium">Requested Role</span>
                <span className="font-bold text-blue-600">{successData.requested_role}</span>
              </div>
              <div
                className={`border rounded-lg p-3.5 ${
                  isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <span className="text-slate-500 block mb-0.5 font-medium">Submission Timestamp</span>
                <span className={`font-semibold ${isDark ? "text-slate-200" : "text-[#0a1b3f]"}`}>
                  {new Date(successData.created_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>

            {/* Protocol Notice */}
            <div
              className={`border rounded-xl p-4 max-w-xl mx-auto mb-8 flex items-start gap-3 text-xs leading-relaxed ${
                isDark
                  ? "bg-blue-950/30 border-blue-900/50 text-blue-200/90"
                  : "bg-blue-50 border-blue-200 text-blue-900"
              }`}
            >
              <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Verification Procedure:</strong> Command center administrators routinely
                review pending onboarding submissions. Once your credentials and official unit
                assignment are verified, your user account will be provisioned.
              </div>
            </div>

            {/* Return Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleReturnToLogin}
                disabled={isExiting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-70"
              >
                {isExiting && exitTarget === "login" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Returning to Login...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Return to Secure Login</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Request Form */
          <div
            className={`border rounded-2xl p-6 sm:p-10 shadow-xl backdrop-blur-xl ${
              isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            {/* Page Header */}
            <div
              className={`mb-8 border-b pb-6 ${
                isDark ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-6 bg-amber-500 rounded-full"></div>
                <span className="text-xs font-bold tracking-widest text-amber-600 uppercase">
                  GOVERNMENT OF GUJARAT • STATE SURVEILLANCE GRID
                </span>
              </div>
              <h1
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isDark ? "text-white" : "text-[#0a1b3f]"
                }`}
              >
                Request Official Platform Access
              </h1>
              <p
                className={`text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Submit your official departmental credentials to request authorized access to the
                DRISHTI SETU surveillance registry and GIS command intelligence foundation.
              </p>
            </div>

            {/* Dignified Administrative Setup Notice (HTTP 503 missing table) */}
            {isTableMissingError && (
              <div
                className={`mb-8 rounded-xl p-5 border text-xs shadow-md ${
                  isDark
                    ? "bg-slate-950 border-amber-500/30 text-slate-200"
                    : "bg-amber-50/70 border-amber-200 text-slate-800"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 shrink-0 mt-0.5">
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-bold text-sm tracking-tight text-amber-700 dark:text-amber-400">
                        Database Migration Required
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400">
                        HTTP 503 • SCHEMA PENDING
                      </span>
                    </div>
                    <p className="leading-relaxed">
                      The <code className="font-mono font-bold text-blue-600">access_requests</code>{" "}
                      table has not been created yet in the database. DRISHTI SETU enforces strict
                      database-level persistence and does not substitute client-side storage.
                    </p>
                    <div
                      className={`p-3 rounded-lg border font-mono text-[11px] flex items-center justify-between ${
                        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-amber-200"
                      }`}
                    >
                      <span className="text-slate-600 dark:text-slate-400">
                        Migration File:{" "}
                        <strong className="text-slate-900 dark:text-slate-100">
                          backend/backend/migrations/001_create_access_requests.sql
                        </strong>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Please apply migration{" "}
                      <code className="font-mono">001_create_access_requests.sql</code> in the
                      Supabase SQL editor to enable the live access request workflow.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Standard Error Alert (for non-503 errors) */}
            {serverError && !isTableMissingError && (
              <div
                className={`mb-6 p-4 rounded-xl border text-xs flex items-start gap-3 shadow-md ${
                  isDark
                    ? "bg-red-950/50 border-red-800 text-red-200"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 leading-snug font-medium">{serverError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* SECTION 1: Officer Identification */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      isDark
                        ? "bg-blue-900/60 border border-blue-700/60 text-blue-300"
                        : "bg-blue-100 border border-blue-200 text-blue-700"
                    }`}
                  >
                    1
                  </div>
                  <h2
                    className={`text-sm font-bold uppercase tracking-wider ${
                      isDark ? "text-white" : "text-[#0a1b3f]"
                    }`}
                  >
                    Officer Identification
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label
                      className={`block text-xs font-semibold ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Full Name (with Rank) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        {...register("full_name")}
                        placeholder="e.g. Vikram Jadeja"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg text-xs transition-all focus:outline-none focus:ring-2 ${
                          isDark
                            ? "bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                            : "bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-blue-600/20"
                        }`}
                      />
                    </div>
                    {errors.full_name && (
                      <p className="text-[11px] text-red-500 font-medium">
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

                  {/* Employee ID */}
                  <div className="space-y-1.5">
                    <label
                      className={`block text-xs font-semibold ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Employee / Badge ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Shield className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        {...register("employee_id")}
                        placeholder="e.g. EMP010 or POL-4512"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg text-xs uppercase font-mono transition-all focus:outline-none focus:ring-2 ${
                          isDark
                            ? "bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                            : "bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-blue-600/20"
                        }`}
                      />
                    </div>
                    {errors.employee_id && (
                      <p className="text-[11px] text-red-500 font-medium">
                        {errors.employee_id.message}
                      </p>
                    )}
                  </div>

                  {/* Official Email */}
                  <div className="space-y-1.5">
                    <label
                      className={`block text-xs font-semibold ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Official Government Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        {...register("official_email")}
                        placeholder="e.g. v.jadeja@police.gujarat.gov.in"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg text-xs transition-all focus:outline-none focus:ring-2 ${
                          isDark
                            ? "bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                            : "bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-blue-600/20"
                        }`}
                      />
                    </div>
                    {errors.official_email && (
                      <p className="text-[11px] text-red-500 font-medium">
                        {errors.official_email.message}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label
                      className={`block text-xs font-semibold ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        {...register("mobile_number")}
                        placeholder="e.g. 9876543210"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg text-xs transition-all focus:outline-none focus:ring-2 ${
                          isDark
                            ? "bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                            : "bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-blue-600/20"
                        }`}
                      />
                    </div>
                    {errors.mobile_number && (
                      <p className="text-[11px] text-red-500 font-medium">
                        {errors.mobile_number.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: Department & Posting Details */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      isDark
                        ? "bg-blue-900/60 border border-blue-700/60 text-blue-300"
                        : "bg-blue-100 border border-blue-200 text-blue-700"
                    }`}
                  >
                    2
                  </div>
                  <h2
                    className={`text-sm font-bold uppercase tracking-wider ${
                      isDark ? "text-white" : "text-[#0a1b3f]"
                    }`}
                  >
                    Department & Posting Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Department Dropdown (Connected to real backend GET /departments/) */}
                  <div className="space-y-1.5">
                    <label
                      className={`block text-xs font-semibold ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Assigned Department <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <select
                        {...register("department_id", { valueAsNumber: true })}
                        disabled={isLoadingDepts}
                        className={`w-full pl-10 pr-8 py-2.5 rounded-lg text-xs appearance-none cursor-pointer disabled:opacity-60 transition-all focus:outline-none focus:ring-2 ${
                          isDark
                            ? "bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:ring-blue-500/20"
                            : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-blue-600/20"
                        }`}
                      >
                        {isLoadingDepts ? (
                          <option value="">Loading official departments...</option>
                        ) : departments.length === 0 ? (
                          <option value="">No departments available</option>
                        ) : (
                          departments.map((dept) => (
                            <option
                              key={dept.id}
                              value={dept.id}
                              className={isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900"}
                            >
                              {dept.name} (Dept #{dept.id})
                            </option>
                          ))
                        )}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        {isLoadingDepts ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span className="text-[10px]">▼</span>
                        )}
                      </div>
                    </div>
                    {errors.department_id && (
                      <p className="text-[11px] text-red-500 font-medium">
                        {errors.department_id.message}
                      </p>
                    )}
                  </div>

                  {/* Designation */}
                  <div className="space-y-1.5">
                    <label
                      className={`block text-xs font-semibold ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Designation / Rank <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        {...register("designation")}
                        placeholder="e.g. Police Sub-Inspector / Surveillance Officer"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg text-xs transition-all focus:outline-none focus:ring-2 ${
                          isDark
                            ? "bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                            : "bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-blue-600/20"
                        }`}
                      />
                    </div>
                    {errors.designation && (
                      <p className="text-[11px] text-red-500 font-medium">
                        {errors.designation.message}
                      </p>
                    )}
                  </div>

                  {/* Office Unit / Police Station */}
                  <div className="space-y-1.5">
                    <label
                      className={`block text-xs font-semibold ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Office Unit / Police Station <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        {...register("office_unit")}
                        placeholder="e.g. Navrangpura Police Station"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg text-xs transition-all focus:outline-none focus:ring-2 ${
                          isDark
                            ? "bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                            : "bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-blue-600/20"
                        }`}
                      />
                    </div>
                    {errors.office_unit && (
                      <p className="text-[11px] text-red-500 font-medium">
                        {errors.office_unit.message}
                      </p>
                    )}
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <label
                      className={`block text-xs font-semibold ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Administrative District <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        {...register("district")}
                        placeholder="e.g. Ahmedabad City / Surat"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg text-xs transition-all focus:outline-none focus:ring-2 ${
                          isDark
                            ? "bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                            : "bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-blue-600/20"
                        }`}
                      />
                    </div>
                    {errors.district && (
                      <p className="text-[11px] text-red-500 font-medium">
                        {errors.district.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Requested Platform Role & Justification */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      isDark
                        ? "bg-blue-900/60 border border-blue-700/60 text-blue-300"
                        : "bg-blue-100 border border-blue-200 text-blue-700"
                    }`}
                  >
                    3
                  </div>
                  <h2
                    className={`text-sm font-bold uppercase tracking-wider ${
                      isDark ? "text-white" : "text-[#0a1b3f]"
                    }`}
                  >
                    Role & Operational Justification
                  </h2>
                </div>

                {/* Role Cards Selection */}
                <div className="space-y-2 mb-4">
                  <label
                    className={`block text-xs font-semibold ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Requested Platform Role <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(ROLE_DESCRIPTIONS) as PlatformRole[]).map((role) => {
                      const info = ROLE_DESCRIPTIONS[role];
                      const Icon = info.icon;
                      const isSelected = selectedRole === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setValue("requested_role", role, { shouldValidate: true })}
                          className={`flex flex-col text-left p-4 rounded-xl border transition-all relative ${
                            isSelected
                              ? isDark
                                ? "border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/30"
                                : "border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20 shadow-sm"
                              : isDark
                              ? "border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-2">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : isDark
                                  ? "bg-slate-800 text-slate-400"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? isDark
                                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                    : "bg-blue-100 text-blue-800 border border-blue-200"
                                  : isDark
                                  ? "bg-slate-800 text-slate-400"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {info.badge}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-bold mb-1 ${
                              isSelected
                                ? isDark
                                  ? "text-white"
                                  : "text-[#0a1b3f]"
                                : isDark
                                ? "text-slate-200"
                                : "text-slate-900"
                            }`}
                          >
                            {info.title}
                          </span>
                          <p
                            className={`text-[11px] leading-snug ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {info.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {errors.requested_role && (
                    <p className="text-[11px] text-red-500 font-medium">
                      {errors.requested_role.message}
                    </p>
                  )}
                </div>

                {/* Reason / Justification */}
                <div className="space-y-1.5">
                  <label
                    className={`block text-xs font-semibold ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Official Justification & Duty Purpose <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      rows={4}
                      {...register("reason")}
                      placeholder="State the official duties, investigation, or surveillance unit responsibility requiring DRISHTI SETU access..."
                      className={`w-full p-3.5 rounded-lg text-xs transition-all resize-none leading-relaxed focus:outline-none focus:ring-2 ${
                        isDark
                          ? "bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                          : "bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-blue-600/20"
                      }`}
                    />
                  </div>
                  {errors.reason && (
                    <p className="text-[11px] text-red-500 font-medium">{errors.reason.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div
                className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isDark ? "border-slate-800" : "border-slate-200"
                }`}
              >
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Submissions are audited under the Gujarat Police Cyber Security Framework.</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleReturnToLogin}
                    disabled={isExiting || isSubmitting}
                    className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-lg border text-xs font-semibold transition-all text-center cursor-pointer disabled:opacity-50 ${
                      isDark
                        ? "border-slate-800 hover:bg-slate-800 text-slate-300"
                        : "border-slate-300 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    {isExiting && exitTarget === "login" ? "Returning..." : "Cancel"}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || isLoadingDepts}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>Submit Access Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-4 text-center text-[11px] transition-colors duration-200 ${
          isDark
            ? "border-slate-800/80 bg-slate-950 text-slate-500"
            : "border-slate-200 bg-white text-slate-600"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4">
          DRISHTI SETU • Government of Gujarat • Unified Departmental Intelligence Grid
        </div>
      </footer>
    </div>
  );
}
