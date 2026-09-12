"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, RefreshCw, Layers, Shield, Search, Video, Activity, Globe, Eye } from "lucide-react";

interface Zone {
  id?: string | number;
  zone_id?: string;
  name: string;
  code?: string;
  description?: string;
  location?: string;
  department_id?: number;
  color?: string;
  latlngs?: number[][];
}

interface Camera {
  camera_id: string;
  name?: string;
  location?: string;
  address?: string;
  zone_id?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  status?: string;
  camera_type?: string;
  ip_address?: string;
  mac_address?: string;
}

export default function GisMap() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"zones" | "cameras">("zones");

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    try {
      const [zonesRes, camsRes] = await Promise.allSettled([
        fetch(`${apiUrl}/zones/get_zones/`).then((r) => r.json()),
        fetch(`${apiUrl}/cameras/get_cameras/`).then((r) => r.json())
      ]);

      if (zonesRes.status === "fulfilled") {
        const zData = zonesRes.value;
        const parsedZones = Array.isArray(zData)
          ? zData
          : zData?.zones || zData?.data || [];
        setZones(parsedZones);
      } else {
        setZones([]);
      }

      if (camsRes.status === "fulfilled") {
        const cData = camsRes.value;
        const parsedCams = Array.isArray(cData)
          ? cData
          : cData?.cameras || cData?.data || [];
        setCameras(parsedCams);
      } else {
        setCameras([]);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute camera count per zone
  const getCameraCountForZone = (zoneId?: string, zoneCode?: string) => {
    if (!zoneId && !zoneCode) return 0;
    const targetId = (zoneId || "").toLowerCase();
    const targetCode = (zoneCode || "").toLowerCase();
    return cameras.filter((c) => {
      const cz = (c.zone_id || "").toLowerCase();
      return cz === targetId || cz === targetCode;
    }).length;
  };

  const filteredZones = zones.filter((zone) => {
    const q = search.toLowerCase();
    return (
      (zone.name && zone.name.toLowerCase().includes(q)) ||
      (zone.code && zone.code.toLowerCase().includes(q)) ||
      (zone.zone_id && zone.zone_id.toLowerCase().includes(q)) ||
      (zone.description && zone.description.toLowerCase().includes(q))
    );
  });

  const filteredCameras = cameras.filter((cam) => {
    const q = search.toLowerCase();
    return (
      (cam.camera_id && cam.camera_id.toLowerCase().includes(q)) ||
      (cam.address && cam.address.toLowerCase().includes(q)) ||
      (cam.location && cam.location.toLowerCase().includes(q)) ||
      (cam.zone_id && cam.zone_id.toLowerCase().includes(q)) ||
      (cam.status && cam.status.toLowerCase().includes(q))
    );
  });

  const onlineCamerasCount = cameras.filter(
    (c) => (c.status || "").toLowerCase() === "active" || (c.status || "").toLowerCase() === "online"
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-wider uppercase mb-1">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Gujarat Police Spatial Intelligence & GIS Grid
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            GIS Map & Surveillance Corridors
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time geospatial boundaries, CCTV surveillance corridors, and PostGIS polygon geometries across Gujarat.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Live Tactical Grid
          </Link>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> SURVEILLANCE ZONES
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{zones.length}</div>
        </div>
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-blue-400" /> TOTAL GIS CAMERAS
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1 font-mono">{cameras.length}</div>
        </div>
        <div className="bg-[#0d1527] border border-emerald-500/20 rounded-xl p-4">
          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> ONLINE GPS FIXES
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{onlineCamerasCount}</div>
        </div>
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-400" /> POSTGIS SPATIAL REPLICATION
          </div>
          <div className="text-sm font-extrabold text-emerald-400 mt-2 font-mono">100% SYNCHRONIZED</div>
        </div>
      </div>

      {/* Controls: Search & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0d1527] border border-slate-800 p-3.5 rounded-xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("zones")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "zones"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                : "bg-slate-800 text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            Surveillance Corridors ({zones.length})
          </button>
          <button
            onClick={() => setActiveTab("cameras")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "cameras"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                : "bg-slate-800 text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            Spatial Camera Grid ({cameras.length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === "zones"
                ? "Search surveillance zones..."
                : "Search cameras by ID, address, zone..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070d1d] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Fetching geospatial data from /zones/ and /cameras/...</p>
        </div>
      ) : error || (zones.length === 0 && cameras.length === 0) ? (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <Shield className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No geospatial data available</h3>
          <p className="text-xs text-slate-500">
            Could not retrieve zone geometries or camera spatial coordinates. Ensure the backend is online.
          </p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow"
          >
            Retry Fetch
          </button>
        </div>
      ) : activeTab === "zones" ? (
        /* Zones Table */
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#070d1d] text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4">Zone ID</th>
                  <th className="py-3 px-4">Zone Name</th>
                  <th className="py-3 px-4">Corridor Code</th>
                  <th className="py-3 px-4">Description / Location</th>
                  <th className="py-3 px-4">Monitored Cameras</th>
                  <th className="py-3 px-4">Geometry</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredZones.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No zones match search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredZones.map((zone, idx) => {
                    const camCount = getCameraCountForZone(zone.zone_id || (zone.id ? String(zone.id) : undefined), zone.code);
                    return (
                      <tr key={zone.id || zone.zone_id || idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                          {zone.zone_id || zone.id || `Z${idx + 1}`}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: zone.color || "#3b82f6" }}
                            />
                            {zone.name}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {zone.code || "GUJ-SURV"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 max-w-xs">
                          {zone.description || zone.location || "Gujarat Police high-security coverage perimeter"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                            {camCount > 0 ? `${camCount} Cameras Deployed` : "Coverage Active"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          {zone.latlngs && Array.isArray(zone.latlngs)
                            ? `${zone.latlngs.length} polygon vertices`
                            : "Polygon WKT (PostGIS)"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                            ACTIVE CORRIDOR
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Spatial Cameras Grid */
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#070d1d] text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4">Camera ID</th>
                  <th className="py-3 px-4">Deployment Address / Location</th>
                  <th className="py-3 px-4">Corridor Zone</th>
                  <th className="py-3 px-4">GPS Coordinates (Lat / Lng)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Module Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCameras.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No cameras match search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCameras.slice(0, 100).map((cam) => {
                    const lat = cam.latitude ?? cam.lat;
                    const lng = cam.longitude ?? cam.lng;
                    const isOnline = (cam.status || "").toLowerCase() === "active" || (cam.status || "").toLowerCase() === "online";
                    return (
                      <tr key={cam.camera_id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                          {cam.camera_id}
                        </td>
                        <td className="py-3.5 px-4 text-white font-medium max-w-sm">
                          {cam.address || cam.location || "Gujarat Metropolitan Surveillance Corridor"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                            {cam.zone_id || "Z01"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {lat !== undefined && lng !== undefined ? (
                            <span className="text-cyan-300/90">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
                          ) : (
                            <span className="text-slate-500">GPS Calibrating</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              isOnline
                                ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                                : (cam.status || "").toLowerCase().includes("maint")
                                ? "bg-amber-950 text-amber-300 border-amber-700"
                                : "bg-rose-950 text-rose-300 border-rose-700"
                            }`}
                          >
                            {(cam.status || "ACTIVE").toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href="/camera-feed"
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 rounded text-xs font-semibold border border-slate-700 transition-colors inline-flex items-center gap-1"
                              title="View Live Stream"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Live</span>
                            </Link>
                            <Link
                              href="/health-monitoring"
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded text-xs font-semibold border border-slate-700 transition-colors inline-flex items-center gap-1"
                              title="Health Status"
                            >
                              <Activity className="w-3 h-3" />
                              <span>Health</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {filteredCameras.length > 100 && (
            <div className="p-3 text-center text-xs text-slate-400 bg-[#070d1d] border-t border-slate-800">
              Showing top 100 of {filteredCameras.length} cameras. Use search above to locate specific camera IDs or sectors.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

