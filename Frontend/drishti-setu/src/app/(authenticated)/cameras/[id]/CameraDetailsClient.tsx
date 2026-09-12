"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera as CameraIcon,
  MapPin,
  Building2,
  Network,
  Activity,
  ArrowLeft,
  LayoutDashboard,
  PlusCircle,
  Pencil,
  Copy,
  Check,
  Globe,
  Hash,
  Fingerprint,
  Wifi,
  Radio,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Video,
  Clock,
  ChevronRight,
  Maximize2,
  CircleDot,
  Layers,
  HardDrive,
  Database,
  Server,
  Cloud,
  Calendar,
  Archive
} from "lucide-react";
import { Camera, Department, Zone } from "@/types/camera";
import { cameraService } from "@/services/camera.service";
import { CameraDetailMap } from "@/components/cameras/details/CameraDetailMap";

interface CameraDetailsClientProps {
  id: string;
}

export default function CameraDetailsClient({ id }: CameraDetailsClientProps) {
  const router = useRouter();
  const [camera, setCamera] = useState<Camera | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [zone, setZone] = useState<Zone | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Update live simulated CCTV clock
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-GB", { hour12: false }) + "." + String(now.getMilliseconds()).padStart(3, "0").slice(0, 2));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const fetchCameraData = async () => {
    try {
      setLoading(true);
      const cam = await cameraService.getCameraById(id);
      if (cam) {
        setCamera(cam);
        const dept = cameraService.getDepartmentById(cam.department_id);
        if (dept) setDepartment(dept);
        const z = cameraService.getZoneById(cam.zone_id);
        if (z) setZone(z);
      }
    } catch (err) {
      console.error("Failed to load camera details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameraData();
  }, [id]);

  const copyToClipboard = (text: string | undefined | null, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCameraData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-transparent flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
            <CameraIcon className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Loading Camera Details...</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Querying DRISHTI SETU Registry</p>
        </div>
      </div>
    );
  }

  if (!camera) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-transparent p-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-[#0c162d] rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Camera Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">No camera record was found matching identifier: {id}</p>
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="py-2.5 px-4 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/cameras/new"
              className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Register New Camera
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const deptName = department?.name || "Gujarat Police";
  const zoneName = zone?.name || "Ahmedabad West";
  const storageType = camera.storage_type || (camera.camera_type === "Analog" ? "Local" : "Cloud");
  const storageDays = camera.storage_days || (camera.camera_type === "Analog" ? 30 : 60);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent pb-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Navigation & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium flex items-center gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <Link href="/cameras" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              CCTV Registry
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="text-blue-600 dark:text-blue-400 font-semibold truncate max-w-[200px]">{camera.camera_id}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-600"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Back to Dashboard</span>
            </Link>
            <Link
              href="/cameras/new"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Camera</span>
            </Link>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs transition-all disabled:opacity-50"
              title="Refresh Camera Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Top Header Card */}
        <div className="bg-white/80 dark:bg-[#0c162d] backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 flex-shrink-0">
                <CameraIcon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{camera.camera_id}</h1>
                  <button
                    onClick={() => copyToClipboard(camera.camera_id, "camera_id")}
                    className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded transition-colors"
                    title="Copy Camera ID"
                  >
                    {copiedField === "camera_id" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      camera.status === "Active"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800"
                        : camera.status === "Maintenance"
                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800"
                        : camera.status === "Offline"
                        ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        camera.status === "Active"
                          ? "bg-emerald-500 animate-pulse"
                          : camera.status === "Maintenance"
                          ? "bg-amber-500"
                          : camera.status === "Offline"
                          ? "bg-rose-500"
                          : "bg-slate-400"
                      }`}
                    />
                    {camera.status}
                  </span>

                  {/* Needs Review Badge */}
                  {camera.needs_review ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100/70 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-3 h-3" /> Requires Manual Review
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      <ShieldCheck className="w-3 h-3" /> Verified Asset
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span>Registered: {camera.created_at ? new Date(camera.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent"}</span>
                  <span>•</span>
                  <span>System Asset ID: <code className="font-mono text-slate-700">{camera.id}</code></span>
                </p>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/cameras"
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <Video className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                All Cameras
              </Link>
            </div>
          </div>
        </div>

        {/* 5 Stat Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {/* Card 1: Status & Health */}
          <div className="bg-white dark:bg-[#0c162d] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">Surveillance Status</div>
              <div className="text-sm font-bold text-slate-800 dark:text-white">{camera.status}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">99.8% 30-Day Uptime</div>
            </div>
          </div>

          {/* Card 2: Department */}
          <div className="bg-white dark:bg-[#0c162d] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">Department</div>
              <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{deptName}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{zoneName}</div>
            </div>
          </div>

          {/* Card 3: Camera Architecture */}
          <div className="bg-white dark:bg-[#0c162d] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              {camera.camera_type === "IP" ? <Wifi className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">Camera Architecture</div>
              <div className="text-sm font-bold text-slate-800 dark:text-white">{camera.camera_type}-based Camera</div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">H.264 / ONVIF Profile S</div>
            </div>
          </div>

          {/* Card 4: Network IP */}
          <div className="bg-white dark:bg-[#0c162d] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">Network Host</div>
              <div className="text-sm font-bold font-mono text-slate-800 dark:text-white truncate">{camera.ip_address}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{camera.mac_address}</div>
            </div>
          </div>

          {/* Card 5: Data Storage & Retention */}
          <div className="bg-white dark:bg-[#0c162d] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">Data Storage</div>
              <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{storageType} Storage</div>
              <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">{storageDays} Days Retention</div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Columns: Video Feed + Camera Specs + Network */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Command Center Simulated Live Feed Screen */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
              <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  <span className="text-red-500 font-bold uppercase tracking-wider">LIVE STREAM</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">{camera.camera_id}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-bold">1080P @ 30FPS</span>
                  <span>{currentTime || "LIVE"}</span>
                </div>
              </div>

              {/* Simulated Surveillance Monitor */}
              <div className="relative h-64 sm:h-80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                {/* Surveillance crosshair grid lines */}
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-700/20 pointer-events-none" />
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-700/20 pointer-events-none" />
                
                {/* On-screen Watermarks */}
                <div className="absolute top-4 left-4 text-left font-mono text-[10px] text-emerald-400/80 drop-shadow">
                  <div>SEC: GUJARAT POLICE SURVEILLANCE</div>
                  <div>CAM: {camera.camera_id}</div>
                  <div>LOC: {deptName.toUpperCase()}</div>
                </div>

                <div className="absolute top-4 right-4 text-right font-mono text-[10px] text-emerald-400/80 drop-shadow">
                  <div>LAT: {camera.latitude.toFixed(5)}</div>
                  <div>LNG: {camera.longitude.toFixed(5)}</div>
                  <div>REC: NORMAL</div>
                </div>

                {/* Center Video Placeholder Graphic */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-blue-400 shadow-2xl mb-3 backdrop-blur-sm group hover:scale-105 transition-transform cursor-pointer">
                    <Video className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-sm font-bold text-slate-200">Surveillance Stream Active</div>
                  <div className="text-xs text-slate-400 mt-1 max-w-sm">
                    Live RTSP stream available at <code className="font-mono text-blue-400">rtsp://{camera.ip_address}:554/live/ch0</code>
                  </div>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between font-mono text-[10px] text-slate-500">
                  <span>BITRATE: 4096 kbps (VBR)</span>
                  <span>DRISHTI SETU SECURE ENCRYPTION (TLS 1.3)</span>
                </div>
              </div>
            </div>

            {/* Section 1: Camera Identity Full Details */}
            <div className="bg-white dark:bg-[#0c162d] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CameraIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Camera Identity & Hardware</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Unique device identifiers as entered in registration</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold block mb-1">Camera ID</span>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">{camera.camera_id}</span>
                    <button
                      onClick={() => copyToClipboard(camera.camera_id, "id")}
                      className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Copy"
                    >
                      {copiedField === "id" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold block mb-1">Serial Number</span>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">{camera.serial_number}</span>
                    <button
                      onClick={() => copyToClipboard(camera.serial_number, "sn")}
                      className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Copy"
                    >
                      {copiedField === "sn" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold block mb-1">Device UUID</span>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono break-all">{camera.device_uuid}</span>
                    <button
                      onClick={() => copyToClipboard(camera.device_uuid, "uuid")}
                      className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Copy"
                    >
                      {copiedField === "uuid" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Camera & Network Connectivity */}
            <div className="bg-white dark:bg-[#0c162d] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Network & Streaming Protocol</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Physical and network layer connectivity details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold block mb-1">Camera Type</span>
                  <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                    {camera.camera_type === "IP" ? <Wifi className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Radio className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{camera.camera_type}-based Camera</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold block mb-1">IPv4 Address</span>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">{camera.ip_address}</span>
                    <button
                      onClick={() => copyToClipboard(camera.ip_address, "ip")}
                      className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Copy"
                    >
                      {copiedField === "ip" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold block mb-1">MAC Address</span>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">{camera.mac_address}</span>
                    <button
                      onClick={() => copyToClipboard(camera.mac_address, "mac")}
                      className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Copy"
                    >
                      {copiedField === "mac" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold block mb-1">Streaming Endpoint</span>
                  <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700 truncate font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                    rtsp://{camera.ip_address}:554/ch0
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Data Storage & Video Retention */}
            <div className="bg-white dark:bg-[#0c162d] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Data Storage & Video Retention</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Recording storage architecture, retention window, and automated purge policy</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800 w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  SOP Compliant Storage
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {/* Storage Type Block */}
                <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-xl border border-slate-100 dark:border-slate-700/80 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {storageType.toLowerCase().includes("cloud") ? (
                      <Cloud className="w-5 h-5" />
                    ) : (
                      <Server className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">Data Storage Type</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                      <span>{storageType} Storage</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                        {storageType.toLowerCase().includes("cloud") ? "Central Cloud S3" : "Edge NVR / Local DVR"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {storageType.toLowerCase().includes("cloud")
                        ? "Secure State Surveillance Video Repository with AES-256 cloud encryption and multi-zone backup."
                        : "On-premise Station Edge Server with Local Encrypted RAID Array and direct LAN streaming."}
                    </p>
                  </div>
                </div>

                {/* Storage Days Block */}
                <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-xl border border-slate-100 dark:border-slate-700/80 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">Storage Retention Period</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                      <span>{storageDays} Days Retention</span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                        Auto-Purge Window
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      Camera footage is securely preserved for <strong className="text-slate-800 dark:text-slate-200">{storageDays} continuous days</strong> before automated FIFO rolling purge or cold audit export.
                    </p>
                  </div>
                </div>
              </div>

              {/* Rolling Retention Buffer Status */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-700/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Rolling Ring-Buffer Retention Cycle
                  </span>
                  <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                    Active Retention Window: <strong>Day 1 to Day {storageDays}</strong>
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 h-full rounded-full transition-all"
                    style={{ width: "76%" }}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-mono gap-2">
                  <span>Policy Standard: Gujarat Public Safety Act CCTV SOP</span>
                  <span>Auto-Prune: Ring-buffer FIFO Rotation Active</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Department, GIS Location & Map, Audit Status */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Department & Jurisdiction Card */}
            <div className="bg-white dark:bg-[#0c162d] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Department & Zone</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Jurisdiction assignment</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold block mb-1">Department</span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    {deptName}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold block mb-1">Assigned Zone</span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    {zoneName}
                  </div>
                </div>
              </div>
            </div>

            {/* GIS Location & Interactive Map Card */}
            <div className="bg-white dark:bg-[#0c162d] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">GIS & Physical Location</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Geo-coordinates & map pin</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold block mb-1">Physical Address</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-100 dark:border-slate-700 leading-relaxed">
                    {camera.address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold block mb-1">Latitude</span>
                    <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                      {camera.latitude.toFixed(6)}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold block mb-1">Longitude</span>
                    <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                      {camera.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>

                {/* Interactive Map */}
                <CameraDetailMap
                  latitude={camera.latitude}
                  longitude={camera.longitude}
                  cameraId={camera.camera_id}
                  address={camera.address}
                />
              </div>
            </div>

            {/* Operational Status & Audit Flag */}
            <div className="bg-white dark:bg-[#0c162d] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Audit & Operational Status</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Registry compliance record</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Operational State</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{camera.status}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Manual Review Flag</span>
                  <span className={`font-bold ${camera.needs_review ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"}`}>
                    {camera.needs_review ? "Requires Manual Review" : "No Review Required"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Heartbeat Health</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Healthy (24ms latency)</span>
                </div>

                <div className="flex items-center justify-between py-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Database Key</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400 font-semibold">{camera.id}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
