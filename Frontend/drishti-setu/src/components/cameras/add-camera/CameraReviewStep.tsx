"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import { CameraFormData } from "@/types/camera";
import { Camera, MapPin, Network, Activity, Pencil } from "lucide-react";

interface CameraReviewStepProps {
  form: UseFormReturn<CameraFormData>;
  onEditStep: (step: number) => void;
}

function ReviewItem({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">{label}</span>
      {value ? (
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 break-all">{value}</span>
      ) : (
        <span className="text-sm italic text-slate-400 dark:text-slate-500">Not set</span>
      )}
    </div>
  );
}

export function CameraReviewStep({ form, onEditStep }: CameraReviewStepProps) {
  // Use watch to get the latest form values
  const values = useWatch({ control: form.control });

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="mb-2">
        <h3 className="text-base font-bold text-[#0a1b3f] dark:text-white">Review & Confirm</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Verify the camera details before creating the record</p>
      </div>

      <div className="space-y-4">
        {/* 1. Camera Identity */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Camera Identity</h4>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ReviewItem label="Camera ID" value={values.camera_id} />
            <ReviewItem label="Serial Number" value={values.serial_number} />
            <ReviewItem label="Device UUID" value={values.device_uuid} />
          </div>
        </div>

        {/* 2. Department & Location */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Department & Location</h4>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ReviewItem label="Department" value={values.department} />
            <ReviewItem label="Zone" value={values.zone} />
            <div className="col-span-2">
              <ReviewItem label="Address" value={values.address} />
            </div>
            <ReviewItem label="Coordinates" value={values.latitude && values.longitude ? `${values.latitude}, ${values.longitude}` : undefined} />
          </div>
        </div>

        {/* 3. Camera & Network */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Camera & Network</h4>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ReviewItem label="Camera Type" value={values.camera_type === 'IP' ? 'IP-based Camera' : values.camera_type === 'Analog' ? 'Analog-based Camera' : undefined} />
            <ReviewItem label="MAC Address" value={values.mac_address} />
            <ReviewItem label="IP Address" value={values.ip_address} />
          </div>
        </div>

        {/* 4. Operational Status */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Operational Status</h4>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Status</span>
              {values.status ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <div className={`w-2 h-2 rounded-full ${
                    values.status === 'Active' ? 'bg-green-500' :
                    values.status === 'Maintenance' ? 'bg-amber-500' :
                    values.status === 'Offline' ? 'bg-red-500' : 'bg-slate-400'
                  }`} />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{values.status}</span>
                </div>
              ) : (
                <span className="text-sm italic text-slate-400 dark:text-slate-500">Not set</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Needs Review</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{values.needs_review ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
