"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Building2, User2, Info, Moon, Sun, ShieldCheck, Network, CheckSquare } from "lucide-react";
import Image from "next/image";
import { authService } from "@/services/mock/auth.service";
import { Department, User } from "@/types/auth";
import { SecureLoginOverlay } from "@/components/auth/SecureLoginOverlay";

export function LoginForm() {
  const router = useRouter();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [showSecureTransition, setShowSecureTransition] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    let mounted = true;
    authService.getDepartments().then((data) => {
      if (mounted) setDepartments(data);
    }).catch(console.error);
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (selectedDeptId) {
      authService.getUsersByDepartment(selectedDeptId).then((data) => {
        if (mounted) {
          setUsers(data);
          setSelectedUserId("");
          setEmployeeId("");
        }
      });
    } else {
      setTimeout(() => {
        if (mounted) {
           setUsers([]);
           setSelectedUserId("");
           setEmployeeId("");
        }
      }, 0);
    }
    return () => { mounted = false; };
  }, [selectedDeptId]);

  const handleUserSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    const user = users.find(u => u.id === userId);
    setEmployeeId(user ? user.employeeId : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedDeptId) return setError("Please select a department.");
    if (!selectedUserId) return setError("Please select your user profile.");
    if (!employeeId) return setError("Please enter your Employee ID.");
    if (!password) return setError("Please enter your password.");

    setIsLoading(true);
    setLoadingStep("Authenticating...");

    try {
      await authService.login(employeeId, password);
      setIsLoading(false);
      setShowSecureTransition(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to connect to DRISHTI SETU services.");
      }
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full lg:w-[42%] lg:ml-auto relative h-screen z-20">
      
      {/* The Slanted & Glowing White Background Layer (Exact Demo Match) */}
      <div 
        className="absolute inset-y-[-5%] right-0 w-[130%] bg-white rounded-l-[7rem] border-l-[8px] border-blue-400 shadow-[-25px_0_80px_rgba(37,99,235,0.5)] origin-bottom-left"
        style={{ transform: "skewX(-10.5deg)" }}
      >
        {/* Intense Top-Left Edge Glow (The "Glow Up") */}
        <div className="absolute top-0 left-[-20px] w-20 h-[70%] bg-gradient-to-b from-blue-300 via-blue-600 to-transparent filter blur-[25px] opacity-80"></div>
        
        {/* Inner flare for premium light effect */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full filter blur-[70px] opacity-70 transform -translate-x-1/4 -translate-y-1/4"></div>
        
        {/* Dot pattern background */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.12] pointer-events-none rounded-l-[4 rem]" 
          style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        ></div>
      </div>

      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
         <button className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 bg-white shadow-sm transition-all">
           <Sun className="w-4 h-4" />
         </button>
         <button className="h-9 px-3 rounded-full flex items-center justify-center gap-1.5 text-blue-700 bg-[#e8f0fe] font-semibold text-xs shadow-sm transition-all">
           <Moon className="w-3.5 h-3.5" />
           EN
         </button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[400px] mx-auto px-6 py-4 relative z-10 flex flex-col justify-center h-full pb-20">
        
        {/* Headings*/}
<div className="flex flex-col items-center text-center mb-5 mt-2">
  <h2 className="text-[32px] font-extrabold text-[#0a1b3f] tracking-wide mb-1.5">DRISHTI SETU</h2>
          <div className="flex items-center justify-center gap-3 w-full mb-3">
            <div className="h-0.5 w-6 bg-[#d97706] rounded-full"></div>
            <span className="text-[#2563eb] font-bold tracking-widest text-[11px] uppercase">SECURE COMMAND ACCESS</span>
            <div className="h-0.5 w-6 bg-[#d97706] rounded-full"></div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Access the DRISHTI SETU operational platform</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 flex items-start">
             <div className="font-medium">{error}</div>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-1 p-1 rounded-xl bg-[#eef4ff] border border-blue-100 flex items-start gap-3 text-[13px] text-blue-800 shadow-sm">
          <div className="mt-0.5 w-5 h-5 rounded-full border border-blue-400 text-blue-500 flex items-center justify-center shrink-0">
            <Info className="w-3 h-3" />
          </div>
          <div className="leading-relaxed">
            <span className="font-bold">Demo Mode:</span> Select a department and user.<br/>
            The Employee ID will auto-fill.<br/>
            Password is <span className="font-bold">password123</span>.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          <div className="space-y-1.5">
            <label htmlFor="department" className="block text-xs font-bold text-[#0a1b3f] ml-1">
              Department
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Building2 className="h-4 w-4 text-[#8b98b4]" />
              </div>
              <div className="absolute inset-y-0 left-10 w-px bg-slate-200 my-2"></div>
              <select
                id="department"
                className="block w-full pl-14 pr-10 py-2.5 text-[13px] rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white text-[#0a1b3f] font-semibold appearance-none shadow-sm"
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                disabled={isLoading}
              >
                <option value="" disabled className="text-slate-400">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="user" className="block text-xs font-bold text-[#0a1b3f] ml-1">
              User / Officer
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User2 className="h-4 w-4 text-[#8b98b4]" />
              </div>
              <div className="absolute inset-y-0 left-10 w-px bg-slate-200 my-2"></div>
              <select
                id="user"
                className="block w-full pl-14 pr-10 py-2.5 text-[13px] rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white text-[#0a1b3f] font-semibold disabled:bg-slate-50 disabled:text-slate-400 appearance-none shadow-sm"
                value={selectedUserId}
                onChange={handleUserSelection}
                disabled={!selectedDeptId || isLoading}
              >
                <option value="" disabled className="text-slate-400">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="employeeId" className="block text-xs font-bold text-[#0a1b3f] ml-1">
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
                readOnly
                className="block w-full pl-14 pr-3 py-2.5 text-[13px] rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-[#f8fafc] text-[#8b98b4] font-medium shadow-sm"
                value={employeeId}
                placeholder="Auto-filled on user selection"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-bold text-[#0a1b3f] ml-1">
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
                className="block w-full pl-14 pr-10 py-2.5 text-[13px] rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white font-mono text-[#0a1b3f] shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b98b4] hover:text-[#0a1b3f] focus:outline-none p-1 rounded-md hover:bg-slate-100"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 pb-3">
            <label className="flex items-center gap-2 cursor-pointer group">
               <div className="relative flex items-center justify-center">
                 <input 
                    type="checkbox" 
                    className="peer sr-only" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                 />
                 <div className="w-4 h-4 rounded-sm border border-slate-300 bg-white peer-checked:bg-[#2563eb] peer-checked:border-[#2563eb] transition-colors"></div>
                 <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
               </div>
               <span className="text-[13px] font-semibold text-[#0a1b3f]">Remember me</span>
            </label>
            <button type="button" className="text-[13px] font-bold text-[#2563eb] hover:text-blue-800 transition-colors">
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
        </form>

      </div>
      
      {/* Bottom Features Container */}
      <div className="absolute bottom-1 w-full px-5 flex justify-center z-10 hidden sm:flex">
        <div className="flex flex-wrap items-center justify-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100">
          <div className="flex items-center gap-2">
             <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
               <User2 className="w-3 h-3 text-[#2563eb]" />
             </div>
             <span className="text-[11px] font-bold text-[#0a1b3f]">Role Based Access</span>
          </div>
          <div className="h-4 w-px bg-slate-200 mx-2"></div>
          <div className="flex items-center gap-2">
             <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
               <Network className="w-3 h-3 text-[#2563eb]" />
             </div>
             <span className="text-[11px] font-bold text-[#0a1b3f]">Multi-Department Access</span>
          </div>
          <div className="h-4 w-px bg-slate-200 mx-2"></div>
          <div className="flex items-center gap-2">
             <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
               <ShieldCheck className="w-3 h-3 text-[#2563eb]" />
             </div>
             <span className="text-[11px] font-bold text-[#0a1b3f]">End-to-End Security</span>
          </div>
        </div>
      </div>

      {/* Secure Login Transition Overlay */}
      <SecureLoginOverlay
        isVisible={showSecureTransition}
        officerName={users.find((u) => u.id === selectedUserId)?.name}
        departmentName={departments.find((d) => d.id === selectedDeptId)?.name}
        onComplete={() => router.push("/dashboard")}
      />

    </div>
  );
}
