"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { 
  ShieldAlert, 
  Clock, 
  MapPin, 
  UserCheck, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  Filter, 
  ChevronRight, 
  Radio, 
  Building2,
  ExternalLink,
  Flame,
  Shield
} from "lucide-react";
import { incidentService, Incident } from "@/services/incident.service";

interface IncidentCornerProps {
  className?: string;
  maxHeight?: string;
}

export default function IncidentCorner({ className = "", maxHeight = "h-[620px]" }: IncidentCornerProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");

  const fetchIncidents = useCallback(async () => {
    try {
      setError(false);
      const data = await incidentService.getIncidents(100);
      if (Array.isArray(data)) {
        // Ensure sorted chronologically with newest first
        const sorted = [...data].sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        setIncidents(sorted);
      } else {
        setIncidents([]);
      }
    } catch (err) {
      console.error("Failed to load incidents:", err);
      setError(true);
      setIncidents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    // Auto refresh every 45 seconds for active incident feed
    const interval = setInterval(fetchIncidents, 45000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchIncidents();
  };

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchQuery = !filterQuery || 
        inc.crime_type?.toLowerCase().includes(filterQuery.toLowerCase()) ||
        inc.description?.toLowerCase().includes(filterQuery.toLowerCase()) ||
        inc.location_name?.toLowerCase().includes(filterQuery.toLowerCase()) ||
        inc.person?.name?.toLowerCase().includes(filterQuery.toLowerCase());

      const matchSeverity = selectedSeverity === "ALL" || 
        inc.severity?.toUpperCase() === selectedSeverity.toUpperCase();

      return matchQuery && matchSeverity;
    });
  }, [incidents, filterQuery, selectedSeverity]);

  // Group incidents by Date string (e.g., Today, Yesterday, or DD MMM YYYY)
  const groupedIncidents = useMemo(() => {
    const groups: { [dateStr: string]: Incident[] } = {};
    
    filteredIncidents.forEach((inc) => {
      const dateObj = new Date(inc.timestamp);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let groupKey = dateObj.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      if (dateObj.toDateString() === today.toDateString()) {
        groupKey = "Today";
      } else if (dateObj.toDateString() === yesterday.toDateString()) {
        groupKey = "Yesterday";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(inc);
    });

    return groups;
  }, [filteredIncidents]);

  return (
    <aside 
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden ${maxHeight} ${className}`}
      aria-label="Incident Activity Need Corner"
    >
      {/* Header Section */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-white uppercase">
                  Need Corner
                </h2>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  <Radio className="w-2.5 h-2.5 animate-ping" />
                  LIVE FEED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Chronological Incident Activity & Bureau Matches</p>
            </div>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            title="Refresh Incident Feed"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>

        {/* Search & Severity Filter Strip */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search crime, location, suspect..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1 text-xs bg-slate-800/80 border border-slate-700/80 rounded-md text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2 py-1 text-xs bg-slate-800/80 border border-slate-700/80 rounded-md text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Severity</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>
      </div>

      {/* Feed Body — Scrollable Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 divide-y divide-slate-100/80">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mb-2" />
            <p className="text-xs font-semibold text-slate-600">Retrieving operational incidents...</p>
            <p className="text-[11px] text-slate-400">Connecting to Gujarat Police Sentinel Grid</p>
          </div>
        ) : error || filteredIncidents.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <AlertTriangle className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs font-bold text-slate-700">No incidents available.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {filterQuery ? "Try clearing search filters to see older records." : "All operational corridors report normal status."}
            </p>
          </div>
        ) : (
          Object.entries(groupedIncidents).map(([dateLabel, items]) => (
            <div key={dateLabel} className="pt-3 first:pt-0 space-y-3">
              {/* Timeline Date Header */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm py-1 flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {dateLabel}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-medium text-slate-600">
                  {items.length} {items.length === 1 ? "event" : "events"}
                </span>
              </div>

              {/* Timeline Items */}
              <div className="space-y-3 border-l-2 border-slate-200 ml-1.5 pl-3.5">
                {items.map((incident) => {
                  const timeString = new Date(incident.timestamp).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                  });

                  const isCritical = incident.severity === "Critical";
                  const isHigh = incident.severity === "High";

                  return (
                    <article
                      key={incident.id}
                      className="group relative bg-slate-50/80 hover:bg-white p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                    >
                      {/* Timeline Bullet Node */}
                      <span 
                        className={`absolute -left-[21px] top-3.5 w-2.5 h-2.5 rounded-full border-2 border-white ring-1 ring-slate-300 ${
                          isCritical ? "bg-red-600" : isHigh ? "bg-amber-500" : "bg-blue-600"
                        }`} 
                      />

                      {/* Top Row: Timestamp + Crime Tag */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-slate-600">
                            {timeString}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isCritical
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : isHigh
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {incident.crime_type}
                          </span>
                        </div>

                        {incident.severity && (
                          <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                            {incident.severity}
                          </span>
                        )}
                      </div>

                      {/* Incident Description */}
                      <p className="text-xs text-slate-700 leading-relaxed font-normal mb-2">
                        {incident.description}
                      </p>

                      {/* Location & Department Metadata */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                        <div className="flex items-center gap-1 text-slate-600 font-medium">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          <span className="truncate max-w-[200px]" title={incident.location_name || incident.location_id}>
                            {incident.location_name || incident.location_id}
                          </span>
                        </div>

                        {incident.department_name && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[140px]" title={incident.department_name}>
                              {incident.department_name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Crime Bureau Suspect Dossier Card (if matched in dataset) */}
                      {incident.person && (
                        <div className="mt-2.5 p-2 rounded-lg bg-red-50/70 border border-red-200/90 flex items-start gap-2.5">
                          <div className="relative w-10 h-10 rounded-md overflow-hidden bg-slate-200 border border-red-300 shrink-0">
                            {incident.person.photo ? (
                              <img
                                src={incident.person.photo}
                                alt={incident.person.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-red-700 font-bold text-xs bg-red-100">
                                {incident.person.name?.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-red-900 truncate">
                                {incident.person.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-600 text-white tracking-wider uppercase shrink-0">
                                MATCHED
                              </span>
                            </div>

                            <p className="text-[11px] text-red-800/90 leading-tight line-clamp-2 mt-0.5">
                              {incident.person.record_summary || incident.person.crime_type || "Crime Bureau Record"}
                            </p>

                            <div className="flex items-center gap-2 mt-1 text-[10px] text-red-700/80">
                              <span>ID: {incident.person.id || incident.person.person_id}</span>
                              <span>•</span>
                              <span>Status: {incident.person.status || "WANTED"}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <span>Total Logged: <strong>{incidents.length}</strong></span>
        <span className="text-blue-600 font-semibold hover:underline cursor-pointer" onClick={handleManualRefresh}>
          Live Sync Active
        </span>
      </div>
    </aside>
  );
}
