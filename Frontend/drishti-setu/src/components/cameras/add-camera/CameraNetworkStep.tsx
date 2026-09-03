"use client";

import { UseFormReturn } from "react-hook-form";
import { CameraFormData, CAMERA_TYPE_OPTIONS } from "@/types/camera";
import { Network, Wifi, Radio, Globe, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraNetworkStepProps {
  form: UseFormReturn<CameraFormData>;
}

export function CameraNetworkStep({ form }: CameraNetworkStepProps) {
  const { register, formState: { errors }, watch, setValue } = form;
  const selectedType = watch("camera_type");

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Network className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#0a1b3f]">Camera & Network Details</h3>
          <p className="text-xs text-slate-500">Specify camera type and network configuration</p>
        </div>
      </div>

      {/* Camera Type - card selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-[#0a1b3f]">
          Camera Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {CAMERA_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { setValue("camera_type", option.value); form.trigger("camera_type"); }}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                selectedType === option.value
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                selectedType === option.value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
              )}>
                {option.value === 'IP' ? <Wifi className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
              </div>
              <div>
                <span className={cn(
                  "text-sm font-bold",
                  selectedType === option.value ? "text-blue-700" : "text-slate-700"
                )}>
                  {option.label}
                </span>
              </div>
            </button>
          ))}
        </div>
        {errors.camera_type && <p className="text-xs text-red-500 font-medium">{errors.camera_type.message}</p>}
      </div>

      {/* MAC Address */}
      <div className="space-y-1.5">
        <label htmlFor="mac_address" className="flex items-center gap-2 text-sm font-semibold text-[#0a1b3f]">
          <Hash className="w-3.5 h-3.5 text-slate-400" />
          MAC Address <span className="text-red-500">*</span>
        </label>
        <input
          id="mac_address"
          type="text"
          placeholder="00:1A:2B:3C:4D:5E"
          {...register("mac_address")}
          className={`block w-full px-4 py-3 text-sm rounded-lg border ${errors.mac_address ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'} focus:ring-2 outline-none transition-all bg-white font-mono`}
        />
        {errors.mac_address ? (
          <p className="text-xs text-red-500 font-medium">{errors.mac_address.message}</p>
        ) : (
          <p className="text-xs text-slate-400">Format: XX:XX:XX:XX:XX:XX</p>
        )}
      </div>

      {/* IP Address */}
      <div className="space-y-1.5">
        <label htmlFor="ip_address" className="flex items-center gap-2 text-sm font-semibold text-[#0a1b3f]">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          IP Address <span className="text-red-500">*</span>
        </label>
        <input
          id="ip_address"
          type="text"
          placeholder="192.168.1.10"
          {...register("ip_address")}
          className={`block w-full px-4 py-3 text-sm rounded-lg border ${errors.ip_address ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'} focus:ring-2 outline-none transition-all bg-white font-mono`}
        />
        {errors.ip_address ? (
          <p className="text-xs text-red-500 font-medium">{errors.ip_address.message}</p>
        ) : (
          <p className="text-xs text-slate-400">IPv4 format</p>
        )}
      </div>
    </div>
  );
}
