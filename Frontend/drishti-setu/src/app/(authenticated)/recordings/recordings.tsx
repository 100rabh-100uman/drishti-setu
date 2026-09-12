"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Film, 
  Video, 
  Play, 
  Pause, 
  FastForward, 
  Clock, 
  Calendar, 
  HardDrive, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  RefreshCw, 
  Download, 
  Maximize2, 
  Car, 
  Users, 
  Radio, 
  Layers, 
  Activity, 
  ChevronRight,
  Info
} from "lucide-react";

interface RetentionStatus {
  allowed_days: number;
  days_remaining: number;
  is_near_expiry: boolean;
  auto_cleanup_active: boolean;
}

interface DetectionsSummary {
  vehicles: number;
  persons: number;
  crowd_clusters: number;
  anpr_plates?: string[];
}

interface RecordingItem {
  recording_id: string;
  camera_id: string;
  camera_location: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: string;
  duration_seconds: number;
  file_size_mb: number;
  playback_url: string;
  playback_16x_url: string;
  retention_status: RetentionStatus;
  detections_summary: DetectionsSummary;
}

interface RetentionMetrics {
  global_default_retention_days: number;
  total_active_recordings: number;
  total_storage_used_mb: number;
  auto_cleanup_policy: string;
  speed_modes_supported: number[];
}

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [metrics, setMetrics] = useState<RetentionMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCamera, setSelectedCamera] = useState<string>("ALL");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("ALL");

  // Playback Player State
  const [activeRecording, setActiveRecording] = useState<RecordingItem | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1 for Normal, 16 for 16x
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playerKey, setPlayerKey] = useState<number>(0);
  const [masterCameras, setMasterCameras] = useState<string[]>([]);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // Fetch all registered cameras to populate unified camera filter
  useEffect(() => {
    fetch(`${apiBaseUrl}/cameras/get_cameras/`)
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.cameras)) {
          const ids = data.cameras.map((c: any) => c.camera_id).filter(Boolean);
          setMasterCameras(ids);
        }
      })
      .catch((e) => console.warn("Could not load master cameras for recordings filter:", e));
  }, [apiBaseUrl]);

  // Fetch recordings list and storage retention stats
  const fetchData = async (camFilter?: string) => {
    setLoading(true);
    setError(null);
    try {
      const activeCam = camFilter !== undefined ? camFilter : selectedCamera;
      const recUrl = activeCam && activeCam !== "ALL"
        ? `${apiBaseUrl}/recordings/?camera_id=${encodeURIComponent(activeCam)}`
        : `${apiBaseUrl}/recordings/`;

      const [recRes, statsRes] = await Promise.all([
        fetch(recUrl).then((r) => r.json()),
        fetch(`${apiBaseUrl}/recordings/retention-status`).then((r) => r.json())
      ]);

      if (recRes && recRes.recordings) {
        setRecordings(recRes.recordings);
        if (recRes.recordings.length > 0) {
          setActiveRecording(recRes.recordings[0]);
        }
      }
      if (statsRes) {
        setMetrics(statsRes);
      }
    } catch (err: any) {
      console.error("Failed to load recordings from backend:", err);
      setError("Unable to connect to CCTV storage service. Falling back to local offline index.");
      // Graceful offline fallback index
      const fallbackList: RecordingItem[] = [
        {
          recording_id: "REC_CAM001_2026-09-11_120000",
          camera_id: "CAM001",
          camera_location: "Ashram Road Junction, Ahmedabad",
          date: "2026-09-11",
          start_time: "2026-09-11T12:00:00Z",
          end_time: "2026-09-11T12:15:00Z",
          duration: "15m 00s",
          duration_seconds: 900,
          file_size_mb: 14.5,
          playback_url: "/playback/2026-09-11?camera_id=CAM001&speed=1",
          playback_16x_url: "/playback/2026-09-11?camera_id=CAM001&speed=16",
          retention_status: { allowed_days: 15, days_remaining: 15, is_near_expiry: false, auto_cleanup_active: true },
          detections_summary: { vehicles: 52, persons: 98, crowd_clusters: 2, anpr_plates: ["GJ-01-BK-5821", "GJ-18-AM-9920"] }
        },
        {
          recording_id: "REC_CAM002_2026-09-10_120000",
          camera_id: "CAM002",
          camera_location: "SG Highway Near Iscon, Ahmedabad",
          date: "2026-09-10",
          start_time: "2026-09-10T12:00:00Z",
          end_time: "2026-09-10T12:15:00Z",
          duration: "15m 00s",
          duration_seconds: 900,
          file_size_mb: 15.2,
          playback_url: "/playback/2026-09-10?camera_id=CAM002&speed=1",
          playback_16x_url: "/playback/2026-09-10?camera_id=CAM002&speed=16",
          retention_status: { allowed_days: 15, days_remaining: 14, is_near_expiry: false, auto_cleanup_active: true },
          detections_summary: { vehicles: 64, persons: 110, crowd_clusters: 3, anpr_plates: ["GJ-01-BK-5821"] }
        }
      ];
      setRecordings(fallbackList);
      if (!activeRecording) {
        setActiveRecording(fallbackList[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter recordings by search and dropdowns
  const filteredRecordings = useMemo(() => {
    return recordings.filter((item) => {
      const matchesSearch = 
        item.camera_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.camera_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.recording_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.includes(searchTerm);

      const matchesCamera = selectedCamera === "ALL" || item.camera_id === selectedCamera;
      
      let matchesDate = true;
      if (selectedDateFilter === "TODAY") {
        const todayStr = new Date().toISOString().split("T")[0];
        matchesDate = item.date === todayStr;
      } else if (selectedDateFilter === "7DAYS") {
        matchesDate = item.retention_status.days_remaining >= 8;
      } else if (selectedDateFilter === "EXPIRING") {
        matchesDate = item.retention_status.days_remaining <= 3;
      }

      return matchesSearch && matchesCamera && matchesDate;
    });
  }, [recordings, searchTerm, selectedCamera, selectedDateFilter]);

  // Unique camera list for selector
  const cameraList = useMemo(() => {
    const ids = Array.from(new Set(recordings.map((r) => r.camera_id)));
    return ids.sort();
  }, [recordings]);

  // Compute stream URL for the active player
  const activeStreamUrl = useMemo(() => {
    if (!activeRecording) return "";
    return `${apiBaseUrl}/playback/${activeRecording.date}?camera_id=${activeRecording.camera_id}&speed=${playbackSpeed}&t=${playerKey}`;
  }, [activeRecording, playbackSpeed, playerKey, apiBaseUrl]);

  // Handle Playback Selection
  const handleSelectRecording = (item: RecordingItem, speed: number = 1) => {
    setActiveRecording(item);
    setPlaybackSpeed(speed);
    setIsPlaying(true);
    setPlayerKey((prev) => prev + 1);
  };

  // Toggle speed between 1x and 16x
  const handleToggleSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    setPlayerKey((prev) => prev + 1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-gradient-to-br dark:from-indigo-500/20 dark:to-blue-600/20 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-xs">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                CCTV Surveillance Archives & Playback
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                  Sentinel Engine
                </span>
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Automated 15-day footage recording, adaptive hardware retention, and 16× fast-forward scanner
              </p>
            </div>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/camera-feed"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition"
          >
            <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Live Camera Feed</span>
          </Link>
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Archives</span>
          </button>
        </div>
      </div>

      {/* ── Key Metrics & Storage Retention Overview ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Retention Policy Card */}
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Retention Policy</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {metrics?.global_default_retention_days || 15} Days
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Standard</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Auto-prunes footage &gt; 15 days or when camera capacity threshold is reached.
          </p>
        </div>

        {/* Storage Capacity Card */}
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Storage Utilized</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
              <HardDrive className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {metrics ? `${metrics.total_storage_used_mb} MB` : "594 MB"}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/ 5000 MB</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: "12%" }}></div>
          </div>
        </div>

        {/* 16x Fast Playback Engine */}
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Playback Modes</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">1× / 16×</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Decimated Fast View</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Supports instant 16× accelerated scanning with monotonic timestamp HUD.
          </p>
        </div>

        {/* Active Archive Count */}
        <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Recorded Dates</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{recordings.length}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Segments available</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Historical index preserved with ANPR &amp; crowd detection metadata.
          </p>
        </div>
      </div>

      {/* ── Active Playback Viewport with 1x & 16x Controls ─────────── */}
      {activeRecording && (
        <div className="bg-white dark:bg-[#0b142c] border border-blue-500/30 rounded-2xl overflow-hidden shadow-xl">
          {/* Player Header */}
          <div className="bg-slate-50/90 dark:bg-[#070d1d] px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{activeRecording.camera_id}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-normal">| {activeRecording.camera_location}</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>Recorded Date: {activeRecording.date}</span>
                  <span>•</span>
                  <span>Duration: {activeRecording.duration}</span>
                  <span>•</span>
                  <span>Segment: {activeRecording.recording_id}</span>
                </p>
              </div>
            </div>

            {/* Playback Controls & Speed Toggle */}
            <div className="flex items-center gap-3">
              {/* Speed Buttons */}
              <div className="flex items-center bg-slate-100 dark:bg-[#050a16] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => handleToggleSpeed(1)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    playbackSpeed === 1
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  1× Normal
                </button>
                <button
                  onClick={() => handleToggleSpeed(16)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    playbackSpeed === 16
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 animate-pulse"
                      : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"
                  }`}
                >
                  <FastForward className="w-3.5 h-3.5" />
                  16× Fast View
                </button>
              </div>

              {/* Pause/Play Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition cursor-pointer"
                title={isPlaying ? "Pause Stream" : "Resume Stream"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              </button>

              {/* Refresh Stream */}
              <button
                onClick={() => setPlayerKey((prev) => prev + 1)}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition cursor-pointer"
                title="Restart Segment"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video Stream Frame Canvas */}
          <div className="relative bg-black flex items-center justify-center aspect-video max-h-[520px] w-full overflow-hidden">
            {isPlaying ? (
              <img
                key={playerKey}
                src={activeStreamUrl}
                alt="CCTV Stored Footage Playback Stream"
                className="w-full h-full object-contain"
                onError={() => {
                  console.error("Playback stream error, retrying...");
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                <Pause className="w-12 h-12 text-slate-600" />
                <p className="text-sm font-medium">Playback Paused</p>
                <button
                  onClick={() => setIsPlaying(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                >
                  Resume Playback
                </button>
              </div>
            )}

            {/* Active Floating Speed Indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-none">
              {playbackSpeed === 16 ? (
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/90 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 backdrop-blur-md">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>16× FAST FORWARD</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-lg bg-blue-600/90 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/20 backdrop-blur-md">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>1× NORMAL SPEED</span>
                </div>
              )}
            </div>

            {/* Bottom Stream Telemetry Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-cyan-400 font-mono">
                  <Car className="w-3.5 h-3.5" />
                  Vehicles: {activeRecording.detections_summary.vehicles}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                  <Users className="w-3.5 h-3.5" />
                  Persons: {activeRecording.detections_summary.persons}
                </span>
                <span className="flex items-center gap-1.5 text-purple-400 font-mono">
                  <Layers className="w-3.5 h-3.5" />
                  Crowds: {activeRecording.detections_summary.crowd_clusters}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>FPS: 25</span>
                <span>•</span>
                <span>Codec: MJPEG</span>
                <span>•</span>
                <span className="text-amber-400 font-medium">
                  Retention: {activeRecording.retention_status.days_remaining}d remaining
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Search & Filter Controls ────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search recordings by Camera ID, location, date, or segment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#050a16] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Camera Filter */}
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#050a16] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 transition cursor-pointer"
          >
            <option value="ALL">All Cameras ({cameraList.length})</option>
            {cameraList.map((cam) => (
              <option key={cam} value={cam}>{cam}</option>
            ))}
          </select>

          {/* Retention Date Filter */}
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#050a16] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 transition cursor-pointer"
          >
            <option value="ALL">All Available Dates (Up to 15 Days)</option>
            <option value="TODAY">Today's Footage</option>
            <option value="7DAYS">Recent (Past 7 Days)</option>
            <option value="EXPIRING">Near Expiry (&le; 3 Days Remaining)</option>
          </select>
        </div>
      </div>

      {/* ── Recordings Table / Grid ─────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0c162d] border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Film className="w-4 h-4 text-blue-500" />
            Available Recordings ({filteredRecordings.length})
          </h2>
          <span className="text-[11px] text-slate-500">
            Sorted by date descending (Newest first)
          </span>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-xs font-medium">Loading CCTV storage index from backend...</p>
          </div>
        ) : filteredRecordings.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500 gap-2">
            <AlertCircle className="w-8 h-8 text-slate-400" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No recordings match your search filter</p>
            <button
              onClick={() => { setSearchTerm(""); setSelectedCamera("ALL"); setSelectedDateFilter("ALL"); }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 cursor-pointer font-medium"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredRecordings.map((rec) => {
              const isSelected = activeRecording?.recording_id === rec.recording_id;
              return (
                <div
                  key={rec.recording_id}
                  className={`p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition ${
                    isSelected ? "bg-blue-50/80 dark:bg-blue-950/20 border-l-4 border-blue-600" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  }`}
                >
                  {/* Left: Camera & Segment Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center min-w-[50px]">
                      <Video className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
                      <span className="text-[10px] font-bold font-mono text-slate-600 dark:text-slate-400">{rec.camera_id}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {rec.camera_location}
                        </h4>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {rec.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {rec.duration}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                          {rec.file_size_mb} MB
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-slate-400">
                          ID: {rec.recording_id}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Middle: Detection Summary Tags */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800/40 dark:text-cyan-300 text-[11px] font-mono">
                      <Car className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                      <span>{rec.detections_summary.vehicles} Vehicles</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-300 text-[11px] font-mono">
                      <Users className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{rec.detections_summary.persons} Persons</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/30 dark:border-purple-800/40 dark:text-purple-300 text-[11px] font-mono">
                      <Layers className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      <span>{rec.detections_summary.crowd_clusters} Crowds</span>
                    </div>

                    {/* Retention Pill */}
                    <div className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border ${
                      rec.retention_status.is_near_expiry
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400"
                        : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300"
                    }`}>
                      {rec.retention_status.days_remaining}d remaining
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    {/* Normal 1x Button */}
                    <button
                      onClick={() => handleSelectRecording(rec, 1)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs ${
                        isSelected && playbackSpeed === 1
                          ? "bg-blue-600 text-white shadow"
                          : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Play (1×)
                    </button>

                    {/* 16x Fast Button */}
                    <button
                      onClick={() => handleSelectRecording(rec, 16)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs ${
                        isSelected && playbackSpeed === 16
                          ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                          : "bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                      }`}
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      16× Fast View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
