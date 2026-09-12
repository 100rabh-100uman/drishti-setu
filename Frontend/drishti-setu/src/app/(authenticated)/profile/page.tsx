"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Clock,
  KeyRound,
  Copy,
  Check,
  CheckCircle2,
  ArrowLeft,
  FileText,
  LogOut,
  RefreshCw,
  Award,
  Fingerprint,
  Radio,
  Lock,
  ChevronRight,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { AuthSession } from "@/types/auth";
import { format } from "date-fns";

export default function OfficerProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const loadProfile = async (refresh: boolean = false) => {
    if (refresh) setIsRefreshing(true);
    try {
      const current = authService.getCurrentSession();
      if (current) setSession(current);

      const live = await authService.validateSession();
      if (live) setSession(live);
    } catch {
      // Keep existing session if validation fails
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleCopy = (text: string, fieldName: string) => {
    if (!text || text === "N/A") return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogout = () => {
    authService.logout();
    router.replace("/login");
  };

  const user = session?.user as any;
  const profile = (session as any)?.profile || user?.profile;
  const departmentName = (session as any)?.department?.name || user?.department_name || "Gujarat Police";
  const officerName = profile?.full_name || user?.name || user?.username || "Authorized Officer";
  const employeeId = user?.employee_id || user?.employeeId || "N/A";
  const userRole = user?.role || "Viewer";
  const designation = profile?.designation || user?.designation || userRole;
  const officeUnit = profile?.office_unit || user?.office_unit || "Command Operations Unit";
  const district = profile?.district || user?.district || "Gujarat";
  const officialEmail = profile?.official_email || user?.official_email || "N/A";
  const mobileNumber = profile?.mobile_number || user?.mobile_number || "N/A";
  const requestId = profile?.request_id || user?.request_id || "N/A";
  const createdAt = user?.created_at
    ? format(new Date(user.created_at), "dd MMMM yyyy, hh:mm a")
    : "System Provisioned";

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "Admin":
        return {
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          pill: "bg-emerald-600 text-white",
          clearance: "Level-1 Command Clearance (Full Access)",
        };
      case "Inspector":
        return {
          badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          pill: "bg-blue-600 text-white",
          clearance: "Level-2 Operational Clearance (Investigative)",
        };
      default:
        return {
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          pill: "bg-slate-700 text-white",
          clearance: "Level-3 Situational Clearance (Read Only)",
        };
    }
  };

  const roleStyle = getRoleBadgeStyle(userRole);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Retrieving official officer dossier...</p>
        <span className="text-xs text-slate-400 mt-1 font-mono">DRISHTI SETU Secure Directory</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 pb-24">
      {/* Top Breadcrumbs & Page Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Link
              href="/dashboard"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
            <span className="text-slate-700 dark:text-slate-200 font-bold">Officer Profile</span>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
            <span className="text-blue-600 dark:text-blue-400 font-mono">{employeeId}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Officer Profile & Credentials Dossier
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Official government service record, departmental posting, and system security credentials.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadProfile(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all cursor-pointer disabled:opacity-60"
            title="Refresh Live Credentials"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100/80 dark:hover:bg-red-900/60 transition-all cursor-pointer shadow-xs"
            title="Sign Out of Portal"
          >
            <LogOut className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* HERO IDENTITY CARD — Digital Command Centre Officer Dossier */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#070e20] via-[#0a1b3f] to-[#102a6b] text-white shadow-2xl border border-slate-800/80 p-6 md:p-8">
        {/* Subtle decorative security watermarks */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-6 bottom-4 opacity-5 pointer-events-none select-none">
          <Shield className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Officer Avatar & Primary Credentials */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 md:gap-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-slate-900/80 relative flex items-center justify-center p-1">
                <Image
                  src="/avatar.png"
                  alt={officerName}
                  width={112}
                  height={112}
                  className="rounded-xl object-cover"
                />
              </div>
              <div
                className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-[#0a1b3f] shadow-md"
                title="Active Duty Verified"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold font-mono tracking-wider px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {employeeId}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${roleStyle.badge}`}>
                  {userRole}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Officer Account
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white capitalize">
                {officerName}
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  <span className="capitalize">{designation}</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{departmentName}</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{district}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Department Seal & Fast Copy ID Action */}
          <div className="flex sm:flex-col items-start sm:items-end justify-between border-t lg:border-t-0 sm:border-l border-white/10 pt-4 lg:pt-0 sm:pl-6 gap-3">
            <div className="flex items-center gap-3">
              <Image
                src="/gpolicelogo.png"
                alt="Gujarat Police Seal"
                width={40}
                height={40}
                className="object-contain drop-shadow-md"
              />
              <div className="text-right hidden sm:block">
                <span className="block text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  State Jurisdiction
                </span>
                <span className="text-xs font-bold text-white">Government of Gujarat</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(employeeId, "empId")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors cursor-pointer"
                title="Copy Employee ID"
              >
                {copiedField === "empId" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span>Copy Emp ID</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCopy(requestId, "reqId")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors cursor-pointer"
                title="Copy Request ID"
              >
                {copiedField === "reqId" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-slate-300" />
                    <span>Copy Req ID</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Clearance Level Sub-banner */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">Security Authorization:</span>
            <span className="text-slate-300">{roleStyle.clearance}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span>Request Reference:</span>
            <span className="text-blue-300 font-semibold">{requestId}</span>
          </div>
        </div>
      </div>

      {/* DETAILED INFORMATION CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CARD 1: Departmental & Posting Details */}
        <div className="bg-white dark:bg-[#0c162d] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Department & Posting</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Official police assignment</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Station Info
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block mb-0.5">
                Department / Directorate
              </span>
              <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{departmentName}</div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block mb-0.5">
                Official Designation / Rank
              </span>
              <div className="font-bold text-slate-800 dark:text-slate-200 capitalize">{designation}</div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block mb-0.5">
                Current Office Unit / Police Station
              </span>
              <div className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-700/60">
                {officeUnit}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block">District / Range</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{district}</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block">State Division</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Gujarat</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Contact & Official Verification */}
        <div className="bg-white dark:bg-[#0c162d] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Contact & Identity</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Government communication credentials</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Verified
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block mb-0.5">
                Official Government Email
              </span>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={officialEmail}>
                    {officialEmail}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(officialEmail, "email")}
                  className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded transition-colors cursor-pointer"
                  title="Copy Email"
                >
                  {copiedField === "email" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block mb-0.5">
                Registered Mobile Number
              </span>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    +91 {mobileNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(mobileNumber, "mobile")}
                  className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded transition-colors cursor-pointer"
                  title="Copy Mobile"
                >
                  {copiedField === "mobile" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block">Two-Factor OTP</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Enforced
                </span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block">Account Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Security & Session Audit */}
        <div className="bg-white dark:bg-[#0c162d] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security & Session</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Access authorization controls</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
              JWT Bearer
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block mb-0.5">
                Account Provisioning Date
              </span>
              <div className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{createdAt}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block mb-0.5">
                Request Tracking Reference
              </span>
              <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60 truncate">
                {requestId}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 dark:bg-black/60 border border-slate-800 text-white space-y-1.5 mt-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Encryption:</span>
                <span className="font-mono text-emerald-400 font-bold">TLS 1.3 / AES-256</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Auth Token:</span>
                <span className="font-mono text-blue-400 font-bold">HS256 Signed JWT</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Database Role:</span>
                <span className="font-mono text-white font-bold">{userRole}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SYSTEM CLEARANCE & PRIVILEGES MATRIX */}
      <div className="bg-white dark:bg-[#0c162d] rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0a1b3f] text-white flex items-center justify-center font-bold shadow-md">
              <Award className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Authorized Operational Permissions Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Privileges granted by Gujarat Police Command Administration for role:{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">{userRole}</span>
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 self-start sm:self-center">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            Live Surveillance Authorized
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">CCTV Registry</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Full Access
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Camera onboarding, stream diagnostics, maintenance logs, and bulk CSV ingestion.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">GIS Surveillance</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Real-Time
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Live interactive geo-spatial map coverage, blind-spot gap analysis, and station clusters.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">AI Analytic Feeds</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                Monitored
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Crowd density estimation, optical character vehicle recognition, and operational alerts.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Audit & Reports</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${userRole === "Admin" ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}`}>
                {userRole === "Admin" ? "Export & Sign" : "Read-Only"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Cryptographic integrity records, tamper alerts, and departmental compliance reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
