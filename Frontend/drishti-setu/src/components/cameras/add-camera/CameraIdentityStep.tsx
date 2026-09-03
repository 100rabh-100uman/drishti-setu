"use client";

import { UseFormReturn } from "react-hook-form";
import { CameraFormData } from "@/types/camera";
import { Camera, Hash, Fingerprint } from "lucide-react";

interface CameraIdentityStepProps {
  form: UseFormReturn<CameraFormData>;
}

export function CameraIdentityStep({ form }: CameraIdentityStepProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Camera className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#0a1b3f]">Camera Identity</h3>
          <p className="text-xs text-slate-500">Enter the unique identifiers for this CCTV asset</p>
        </div>
      </div>

      {/* Camera ID */}
      <div className="space-y-1.5">
        <label htmlFor="camera_id" className="flex items-center gap-2 text-sm font-semibold text-[#0a1b3f]">
          <Camera className="w-3.5 h-3.5 text-slate-400" />
          Camera ID <span className="text-red-500">*</span>
        </label>
        <input
          id="camera_id"
          type="text"
          placeholder="CAM-GJ-AHM-000001"
          {...register("camera_id")}
          className={`block w-full px-4 py-3 text-sm rounded-lg border ${errors.camera_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'} focus:ring-2 outline-none transition-all bg-white`}
        />
        {errors.camera_id ? (
          <p className="text-xs text-red-500 font-medium">{errors.camera_id.message}</p>
        ) : (
          <p className="text-xs text-slate-400">Must be unique across the registry</p>
        )}
      </div>

      {/* Serial Number */}
      <div className="space-y-1.5">
        <label htmlFor="serial_number" className="flex items-center gap-2 text-sm font-semibold text-[#0a1b3f]">
          <Hash className="w-3.5 h-3.5 text-slate-400" />
          Serial Number <span className="text-red-500">*</span>
        </label>
        <input
          id="serial_number"
          type="text"
          placeholder="SN-2024-00001"
          {...register("serial_number")}
          className={`block w-full px-4 py-3 text-sm rounded-lg border ${errors.serial_number ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'} focus:ring-2 outline-none transition-all bg-white`}
        />
        {errors.serial_number && (
          <p className="text-xs text-red-500 font-medium">{errors.serial_number.message}</p>
        )}
      </div>

      {/* Device UUID */}
      <div className="space-y-1.5">
        <label htmlFor="device_uuid" className="flex items-center gap-2 text-sm font-semibold text-[#0a1b3f]">
          <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
          Device UUID <span className="text-red-500">*</span>
        </label>
        <input
          id="device_uuid"
          type="text"
          placeholder="550e8400-e29b-41d4-a716-446655440000"
          {...register("device_uuid")}
          className={`block w-full px-4 py-3 text-sm rounded-lg border ${errors.device_uuid ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'} focus:ring-2 outline-none transition-all bg-white`}
        />
        {errors.device_uuid ? (
          <p className="text-xs text-red-500 font-medium">{errors.device_uuid.message}</p>
        ) : (
          <p className="text-xs text-slate-400">UUID v4 format</p>
        )}
      </div>
    </div>
  );
}
