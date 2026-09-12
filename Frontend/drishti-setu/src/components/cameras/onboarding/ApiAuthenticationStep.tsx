"use client";

import { useState } from "react";
import { ApiAuthConfig, AuthMethod } from "@/types/api-onboarding";
import { Key, Lock, Eye, EyeOff, User, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiAuthenticationStepProps {
  config: ApiAuthConfig;
  onChange: (updated: Partial<ApiAuthConfig>) => void;
  errors: Record<string, string>;
}

export function ApiAuthenticationStep({ config, onChange, errors }: ApiAuthenticationStepProps) {
  const [showSecret, setShowSecret] = useState(false);

  const authMethods: { id: AuthMethod; label: string; description: string }[] = [
    { id: "API_KEY", label: "API Key", description: "Header or query token" },
    { id: "BEARER_TOKEN", label: "Bearer Token", description: "OAuth 2.0 / JWT token" },
    { id: "BASIC_AUTH", label: "Basic Auth", description: "HTTP username & password" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#0a1b3f] dark:text-white">Authentication & Security</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Configure handshake authorization credentials</p>
        </div>
      </div>

      {/* Security Disclaimer Notice */}
      <div className="flex items-start gap-3 p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-xl text-xs text-amber-800 dark:text-amber-300">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="leading-relaxed">
          <span className="font-bold">Credential Privacy Notice: </span>
          Secrets are encrypted in transmission and will never be echoed in plain text. For this prototype, values establish the frontend schema contract.
        </div>
      </div>

      {/* Select Auth Method Cards */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#0a1b3f] dark:text-white uppercase tracking-wider block">
          Authentication Method <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {authMethods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange({ auth_method: m.id })}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all cursor-pointer",
                config.auth_method === m.id
                  ? "border-blue-600 bg-blue-50/30 dark:bg-blue-950/40 shadow-sm"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/80"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn("text-xs font-bold", config.auth_method === m.id ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-slate-200")}>
                  {m.label}
                </span>
                <span
                  className={cn(
                    "w-3.5 h-3.5 rounded-full border flex items-center justify-center",
                    config.auth_method === m.id ? "border-blue-600 bg-blue-600" : "border-slate-300 dark:border-slate-600"
                  )}
                >
                  {config.auth_method === m.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{m.description}</p>
            </button>
          ))}
        </div>
        {errors.auth_method && <p className="text-[11px] text-red-500">{errors.auth_method}</p>}
      </div>

      {/* Dynamic Fields Depending on Method */}
      <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        
        {/* Method 1: API Key */}
        {config.auth_method === "API_KEY" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Header Key Name
              </label>
              <input
                type="text"
                placeholder="X-API-KEY"
                value={config.api_key_header || "X-API-KEY"}
                onChange={(e) => onChange({ api_key_header: e.target.value })}
                className="w-full px-4 py-2.5 text-xs font-mono bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                API Key Secret <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  placeholder="Paste API Secret Key..."
                  value={config.api_key_value || ""}
                  onChange={(e) => onChange({ api_key_value: e.target.value })}
                  className={`w-full px-4 py-2.5 pr-10 text-xs font-mono bg-white dark:bg-slate-900/90 border ${
                    errors.api_key_value ? "border-red-300 dark:border-red-700 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                  } rounded-xl outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.api_key_value && <p className="text-[11px] text-red-500">{errors.api_key_value}</p>}
            </div>
          </div>
        )}

        {/* Method 2: Bearer Token */}
        {config.auth_method === "BEARER_TOKEN" && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Bearer Token (JWT / OAuth) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                rows={3}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={config.bearer_token || ""}
                onChange={(e) => onChange({ bearer_token: e.target.value })}
                className={`w-full p-3 font-mono text-xs bg-white dark:bg-slate-900/90 border ${
                  errors.bearer_token ? "border-red-300 dark:border-red-700 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                } rounded-xl outline-none resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
              />
            </div>
            {errors.bearer_token && <p className="text-[11px] text-red-500">{errors.bearer_token}</p>}
          </div>
        )}

        {/* Method 3: Basic Auth */}
        {config.auth_method === "BASIC_AUTH" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="api_operator"
                  value={config.username || ""}
                  onChange={(e) => onChange({ username: e.target.value })}
                  className={`w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900/90 border ${
                    errors.username ? "border-red-300 dark:border-red-700 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                  } rounded-xl outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                />
              </div>
              {errors.username && <p className="text-[11px] text-red-500">{errors.username}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showSecret ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={config.password || ""}
                  onChange={(e) => onChange({ password: e.target.value })}
                  className={`w-full pl-9 pr-10 py-2.5 text-xs bg-white dark:bg-slate-900/90 border ${
                    errors.password ? "border-red-300 dark:border-red-700 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                  } rounded-xl outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-500">{errors.password}</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
