"use client";

import { UseFormReturn } from "react-hook-form";
import { CameraFormData, Department, Zone } from "@/types/camera";
import { MapPin, Building2, Navigation, Globe } from "lucide-react";
import { CameraLocationMap } from "./CameraLocationMap";

interface DepartmentLocationStepProps {
  form: UseFormReturn<CameraFormData>;
  departments: Department[];
  zones: Zone[];
  loadingZones: boolean;
  onDepartmentChange: (deptName: string) => Promise<void>;
}

export function DepartmentLocationStep({ form, departments, zones, loadingZones, onDepartmentChange }: DepartmentLocationStepProps) {
  const { register, formState: { errors }, setValue, watch, trigger } = form;
  const selectedDept = watch("department");

  const handleDepartmentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setValue("department", name);
    setValue("zone", "");
    await onDepartmentChange(name);
    trigger("department");
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setValue("latitude", lat.toFixed(6));
    setValue("longitude", lng.toFixed(6));
    trigger(["latitude", "longitude"]);
  };

  const inputClass = (field: keyof CameraFormData) =>
    `block w-full px-4 py-3 text-sm rounded-lg border ${errors[field] ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'} focus:ring-2 outline-none transition-all bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500`;

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#0a1b3f] dark:text-white">Department & Location</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Assign department, zone, and physical location</p>
        </div>
      </div>

      {/* Department */}
      <div className="space-y-1.5">
        <label htmlFor="department" className="flex items-center gap-2 text-sm font-semibold text-[#0a1b3f] dark:text-slate-200">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          Department <span className="text-red-500">*</span>
        </label>
        <select
          id="department"
          value={selectedDept}
          onChange={handleDepartmentChange}
          className={inputClass("department") + " appearance-none cursor-pointer"}
        >
          <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.name} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{dept.name}</option>
          ))}
        </select>
        {errors.department && <p className="text-xs text-red-500 font-medium">{errors.department.message}</p>}
      </div>

      {/* Zone */}
      <div className="space-y-1.5">
        <label htmlFor="zone" className="flex items-center gap-2 text-sm font-semibold text-[#0a1b3f] dark:text-slate-200">
          <Navigation className="w-3.5 h-3.5 text-slate-400" />
          Zone <span className="text-red-500">*</span>
        </label>
        <select
          id="zone"
          {...register("zone")}
          disabled={!selectedDept || loadingZones}
          className={inputClass("zone") + " appearance-none cursor-pointer disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:text-slate-400"}
        >
          <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{loadingZones ? "Loading zones..." : !selectedDept ? "Select department first" : "Select Zone"}</option>
          {zones.map((z) => (
            <option key={z.id} value={z.name} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{z.name}</option>
          ))}
        </select>
        {errors.zone && <p className="text-xs text-red-500 font-medium">{errors.zone.message}</p>}
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <label htmlFor="address" className="flex items-center gap-2 text-sm font-semibold text-[#0a1b3f] dark:text-slate-200">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          id="address"
          rows={3}
          placeholder="Police HQ, 2nd Floor, Sector 17, Gandhinagar, Gujarat"
          {...register("address")}
          className={inputClass("address") + " resize-none"}
        />
        {errors.address && <p className="text-xs text-red-500 font-medium">{errors.address.message}</p>}
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="latitude" className="flex items-center gap-2 text-sm font-semibold text-[#0a1b3f] dark:text-slate-200">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            Latitude <span className="text-red-500">*</span>
          </label>
          <input
            id="latitude"
            type="text"
            placeholder="23.0225"
            {...register("latitude")}
            className={inputClass("latitude")}
          />
          {errors.latitude && <p className="text-xs text-red-500 font-medium">{errors.latitude.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="longitude" className="flex items-center gap-2 text-sm font-semibold text-[#0a1b3f] dark:text-slate-200">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            Longitude <span className="text-red-500">*</span>
          </label>
          <input
            id="longitude"
            type="text"
            placeholder="72.5714"
            {...register("longitude")}
            className={inputClass("longitude")}
          />
          {errors.longitude && <p className="text-xs text-red-500 font-medium">{errors.longitude.message}</p>}
        </div>
      </div>

      {/* Map */}
      <CameraLocationMap
        latitude={watch("latitude")}
        longitude={watch("longitude")}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
}
