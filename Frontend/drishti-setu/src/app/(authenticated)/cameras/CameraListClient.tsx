"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Video,
  PlusCircle,
  LayoutDashboard,
  Search,
  Filter,
  Eye,
  Camera as CameraIcon,
  Building2,
  MapPin,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { Camera } from "@/types/camera";
import { cameraService } from "@/services/camera.service";

export default function CameraListClient() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cameraService.getAllCameras().then((data) => {
      setCameras(data);
      setLoading(false);
    });
  }, []);

  const filteredCameras = cameras.filter((cam) => {
    const matchesSearch =
      cam.camera_id.toLowerCase().includes(search.toLowerCase()) ||
      cam.address.toLowerCase().includes(search.toLowerCase()) ||
      cam.ip_address.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === "ALL" || cam.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent pb-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium flex items-center gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="text-blue-600 dark:text-blue-400 font-semibold">CCTV Registry</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Back to Dashboard
            </Link>
            <Link
              href="/cameras/new"
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Camera
            </Link>
          </div>
        </div>

        {/* Page Banner */}
        <div className="bg-white/80 dark:bg-[#0c162d] backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CCTV Camera Registry</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage, monitor, and inspect all state-wide surveillance assets
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span>Total Registered: <strong className="text-slate-900 dark:text-white font-bold">{cameras.length}</strong></span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-[#0c162d] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Camera ID, address, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {["ALL", "Active", "Maintenance", "Offline"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedStatus === st
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Camera Grid/Table */}
        {loading ? (
          <div className="bg-white dark:bg-[#0c162d] rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Loading Registry Assets...</p>
          </div>
        ) : filteredCameras.length === 0 ? (
          <div className="bg-white dark:bg-[#0c162d] rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
            <CameraIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No cameras found</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-4">Try adjusting search or filter</p>
            <Link
              href="/cameras/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Register Camera
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCameras.map((cam) => (
              <div
                key={cam.id || cam.camera_id}
                className="bg-white dark:bg-[#0c162d] rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {cam.camera_id}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">SN: {cam.serial_number}</div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cam.status === "Active"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : cam.status === "Maintenance"
                          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          cam.status === "Active" ? "bg-emerald-500" : cam.status === "Maintenance" ? "bg-amber-500" : "bg-rose-500"
                        }`}
                      />
                      {cam.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span className="truncate">{cameraService.getDepartmentById(cam.department_id)?.name || "Gujarat Police"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2 text-slate-500 dark:text-slate-400 text-[11px]">{cam.address}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 font-semibold">
                    <span>{cam.camera_type} • {cam.ip_address}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-sans font-bold">
                      {cam.storage_type || (cam.camera_type === "Analog" ? "Local" : "Cloud")} ({cam.storage_days || (cam.camera_type === "Analog" ? 30 : 60)}d)
                    </span>
                  </div>

                  <Link
                    href={`/cameras/${encodeURIComponent(cam.camera_id)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 dark:hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white dark:hover:text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
