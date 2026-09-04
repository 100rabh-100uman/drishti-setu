"use client";

import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Send, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Video, 
  ShieldAlert, 
  Sparkles,
  Copy,
  Check,
  Activity,
  Calendar
} from 'lucide-react';
import { Incident, IncidentGroup } from '@/services/danger-action.service';

interface IncidentTimelineProps {
  groups: IncidentGroup[];
  loading?: boolean;
  onUpdateStatus: (incidentId: string, newStatus: string, notes?: string) => Promise<void>;
  onOpenFeed?: (cameraId: string) => void;
  onResetFilters?: () => void;
}

function formatTimestamp(ts: string) {
  try {
    const date = new Date(ts);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return { timeStr, relative: date.toLocaleDateString([], { month: 'short', day: 'numeric' }) };
  } catch {
    return { timeStr: ts, relative: '' };
  }
}

export function IncidentTimeline({
  groups,
  loading = false,
  onUpdateStatus,
  onOpenFeed,
  onResetFilters
}: IncidentTimelineProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleStatusChange = async (incidentId: string, status: string) => {
    try {
      setUpdatingId(incidentId);
      await onUpdateStatus(incidentId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyIntel = (inc: Incident) => {
    const brief = `[DRISHTI SETU POLICE INTEL BRIEF]
Incident ID: ${inc.incident_number || inc.id}
Severity: ${inc.severity} | Status: ${inc.status}
Suspect: ${inc.person_name || 'Unidentified'} (${inc.person_id || 'N/A'})
Crime Type: ${inc.crime_type}
Camera: ${inc.camera_id} (${inc.location_name || 'Corridor'})
Zone: ${inc.zone_id || 'Z01'}
Timestamp: ${inc.timestamp}
Telemetry: Confidence ${inc.metadata?.confidence ? Math.round(Number(inc.metadata.confidence) * 100) : 95}%`;

    navigator.clipboard.writeText(brief);
    setCopiedId(inc.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-sm shadow-rose-900/40 animate-pulse';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-900/30';
      case 'MEDIUM':
        return 'bg-blue-950/80 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'DISPATCHED':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'INVESTIGATING':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'RESOLVED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4 text-slate-400">
        <Activity className="w-8 h-8 text-rose-500 animate-spin" />
        <p className="text-xs font-mono tracking-wider">Syncing Incident Timeline Telemetry...</p>
      </div>
    );
  }

  const totalIncidents = groups.reduce((acc, g) => acc + g.incidents.length, 0);

  if (totalIncidents === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 text-slate-500">
          <AlertOctagon className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">No Incidents Found</h3>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          No active or historical incidents match your current filter criteria.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-lg border border-slate-700 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative space-y-8">
      {groups.map((group, groupIdx) => {
        if (!group.incidents || group.incidents.length === 0) return null;

        return (
          <div key={group.date_label || groupIdx} className="space-y-4">
            {/* Sticky Date Group Header */}
            <div className="sticky top-0 z-20 backdrop-blur-md bg-[#070e1f]/90 py-2.5 px-4 rounded-xl border border-slate-800 flex items-center justify-between shadow-lg shadow-black/40">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                  {group.date_label}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {group.incidents.length} {group.incidents.length === 1 ? 'event' : 'events'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Corridor Chronology
              </span>
            </div>

            {/* Timeline Stream with Vertical Connector */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-rose-500 before:via-amber-500/50 before:to-slate-800">
              {group.incidents.map((inc) => {
                const { timeStr, relative } = formatTimestamp(inc.timestamp);
                const isUrgent = inc.status === 'ACTIVE' || inc.severity === 'CRITICAL';
                const isDispatched = inc.status === 'DISPATCHED';
                const isResolved = inc.status === 'RESOLVED';

                return (
                  <div key={inc.id} className="relative group">
                    {/* Timeline Node Beacon */}
                    <div className="absolute -left-6 sm:-left-8 top-5 -translate-x-1/2 flex items-center justify-center">
                      <div className={`relative flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 ${
                        isUrgent 
                          ? 'border-rose-500 bg-rose-950' 
                          : isDispatched 
                          ? 'border-amber-400 bg-amber-950' 
                          : isResolved 
                          ? 'border-emerald-400 bg-emerald-950' 
                          : 'border-slate-600 bg-slate-900'
                      }`}>
                        {isUrgent && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        )}
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          isUrgent ? 'bg-rose-400' : isDispatched ? 'bg-amber-400' : isResolved ? 'bg-emerald-400' : 'bg-slate-500'
                        }`} />
                      </div>
                    </div>

                    {/* Main Incident Card */}
                    <div className={`bg-slate-900/80 backdrop-blur-md rounded-2xl border transition-all duration-300 overflow-hidden shadow-xl ${
                      isUrgent 
                        ? 'border-rose-500/40 hover:border-rose-500/70 shadow-rose-950/20' 
                        : 'border-slate-800 hover:border-slate-700 shadow-black/40'
                    }`}>
                      {/* Top Banner Stripe */}
                      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/40">
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Severity Badge */}
                          <span className={`text-[10px] font-mono font-extrabold uppercase px-2.5 py-1 rounded-md border tracking-wider ${getSeverityBadge(inc.severity)}`}>
                            {inc.severity} THREAT
                          </span>

                          {/* Status Badge */}
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border tracking-wider ${getStatusBadge(inc.status)}`}>
                            {inc.status}
                          </span>

                          {/* Incident Number */}
                          <span className="text-xs font-mono text-slate-400 font-semibold">
                            {inc.incident_number || inc.id}
                          </span>
                        </div>

                        {/* Timestamp & Relative Chip */}
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{timeStr}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-rose-400 font-semibold">{relative}</span>
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-4 sm:p-5 space-y-4">
                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-rose-300 transition-colors flex items-center gap-2">
                            {inc.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Crime Category: <span className="text-slate-200 font-semibold">{inc.crime_type}</span>
                          </p>
                        </div>

                        {/* Split Grid: Suspect Intel + Location Telemetry */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {/* Suspect Intel Pill */}
                          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800 border border-slate-700">
                              {inc.person_photo ? (
                                <img
                                  src={inc.person_photo}
                                  alt={inc.person_name || 'Suspect'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold text-xs">
                                  N/A
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                                  Target Intel
                                </span>
                                {inc.person_id && (
                                  <span className="text-[9px] font-mono text-rose-400 bg-rose-950/60 border border-rose-800 px-1.5 py-0.2 rounded font-bold">
                                    {inc.person_id}
                                  </span>
                                )}
                              </div>
                              <div className="font-bold text-xs sm:text-sm text-white truncate mt-0.5">
                                {inc.person_name || 'Subject Unidentified'}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {inc.person_id ? 'Wanted Bureau Target' : 'Sensor Telemetry Trigger'}
                              </div>
                            </div>
                          </div>

                          {/* Location & Camera Pill */}
                          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-950/40 text-blue-400 border border-blue-900/50 flex-shrink-0 mt-0.5">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                                  Camera Junction & Zone
                                </span>
                                <span className="text-[10px] font-mono text-cyan-400 font-bold">
                                  {inc.zone_id || 'Z01'}
                                </span>
                              </div>
                              <div className="font-bold text-xs text-slate-200 truncate mt-0.5">
                                {inc.camera_id} • {inc.department_name || `Dept ${inc.department_id}`}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate mt-0.5" title={inc.location_name}>
                                {inc.location_name || 'Corridor Junction'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Metadata Tags (Confidence, Telemetry, Notes) */}
                        {inc.metadata && (
                          <div className="flex items-center gap-2 flex-wrap text-[11px]">
                            {inc.metadata.confidence && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800 font-mono font-bold flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                {Math.round(inc.metadata.confidence * 100)}% Neural Match
                              </span>
                            )}
                            {inc.metadata.speed_kmh && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                                Velocity: {inc.metadata.speed_kmh} km/h
                              </span>
                            )}
                            {inc.metadata.vehicle_plate && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-950/50 text-amber-300 border border-amber-800 font-mono font-bold">
                                Plate: {inc.metadata.vehicle_plate}
                              </span>
                            )}
                            {inc.metadata.notes && (
                              <span className="text-slate-400 text-[11px] italic truncate max-w-md">
                                &ldquo;{inc.metadata.notes}&rdquo;
                              </span>
                            )}
                            {inc.metadata.resolution && (
                              <span className="text-emerald-400 text-[11px] font-semibold truncate max-w-md">
                                Resolution: {inc.metadata.resolution}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions Bar */}
                      <div className="px-4 py-3 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          {/* Dispatch QRU Action */}
                          {inc.status !== 'RESOLVED' && inc.status !== 'CLOSED' && (
                            <button
                              onClick={() => handleStatusChange(inc.id, inc.status === 'ACTIVE' ? 'DISPATCHED' : 'RESOLVED')}
                              disabled={updatingId === inc.id}
                              className={`text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow transition-all active:scale-95 disabled:opacity-50 ${
                                inc.status === 'ACTIVE'
                                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              }`}
                            >
                              {inc.status === 'ACTIVE' ? (
                                <>
                                  <Send className="w-3.5 h-3.5" />
                                  Dispatch QRU Unit
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Mark as Resolved
                                </>
                              )}
                            </button>
                          )}

                          {/* Inspect Camera Feed Button */}
                          {onOpenFeed && (
                            <button
                              onClick={() => onOpenFeed(inc.camera_id)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
                            >
                              <Video className="w-3.5 h-3.5 text-cyan-400" />
                              Inspect Feed
                            </button>
                          )}
                        </div>

                        {/* Copy Police Intel Brief */}
                        <button
                          onClick={() => handleCopyIntel(inc)}
                          className="text-[11px] text-slate-400 hover:text-slate-200 py-1.5 px-2.5 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700 flex items-center gap-1.5 transition-colors font-mono"
                          title="Copy Intel Brief for Field Units"
                        >
                          {copiedId === inc.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied Brief</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Brief</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default IncidentTimeline;
