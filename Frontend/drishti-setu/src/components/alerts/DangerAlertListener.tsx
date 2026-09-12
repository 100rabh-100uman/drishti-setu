"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  AlertOctagon, 
  ShieldAlert, 
  Radio, 
  X, 
  ChevronRight, 
  Eye, 
  Send, 
  Volume2, 
  VolumeX,
  MapPin,
  Clock
} from 'lucide-react';
import { DangerAction, dangerActionService } from '@/services/danger-action.service';

/**
 * Synthesizes a high-urgency police alert chime via browser Web Audio API.
 * Eliminates need for external audio asset files.
 */
function playEmergencyChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    
    // Two-tone warning siren (880Hz -> 660Hz -> 880Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(587.33, now + 0.15);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.3);

    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.45);
  } catch (err) {
    // Ignore audio autoplay restrictions if user hasn't interacted yet
  }
}

export function DangerAlertListener() {
  const router = useRouter();
  const [activeAlert, setActiveAlert] = useState<DangerAction | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const lastAlertIdRef = useRef<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Retrieve current user details for role/department filtering
  const getUserContext = useCallback(() => {
    try {
      const sessionStr = typeof window !== 'undefined' ? localStorage.getItem('drishti_auth_session') : null;
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        return {
          role: session?.user?.role || 'Admin',
          department_id: session?.user?.department_id ?? null,
        };
      }
    } catch {
      // Fallback
    }
    return { role: 'Admin', department_id: null };
  }, []);

  const handleIncomingAlert = useCallback((alert: DangerAction) => {
    if (!alert || alert.id === lastAlertIdRef.current) return;
    lastAlertIdRef.current = alert.id;

    // Filter by role/department
    const { role, department_id } = getUserContext();
    if (role !== 'Admin' && role !== 'Head' && department_id && alert.department_id && department_id !== alert.department_id) {
      // Alert belongs to another department; suppress popup
      return;
    }

    setActiveAlert(alert);
    if (!isMuted) {
      playEmergencyChime();
    }
  }, [getUserContext, isMuted]);

  // 1. WebSocket Connection Lifecycle
  useEffect(() => {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const wsUrl = rawApiUrl.replace(/^http/, 'ws') + '/ws/alerts';

    function connectWs() {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'DANGER_ACTION_ALERT' && data.alert) {
              handleIncomingAlert(data.alert);
            }
          } catch {
            // Ignore parse err
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          // Try reconnecting in 5s
          setTimeout(connectWs, 5000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        setWsConnected(false);
      }
    }

    connectWs();

    // 2. Resilient Polling Fallback (ensures alerts are never missed)
    const pollInterval = setInterval(async () => {
      try {
        const alerts = await dangerActionService.getDangerActions({ limit: 1, alert_status: 'ACTIVE' });
        if (alerts.length > 0) {
          const newest = alerts[0];
          // If alert is within last 90 seconds and not seen yet
          const alertTime = new Date(newest.timestamp).getTime();
          if (Date.now() - alertTime < 90000 && newest.id !== lastAlertIdRef.current) {
            handleIncomingAlert(newest);
          }
        }
      } catch {
        // Suppress polling err
      }
    }, 10000);
    pollTimerRef.current = pollInterval;

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [handleIncomingAlert]);

  const handleDismiss = () => {
    setActiveAlert(null);
  };

  const handleDispatch = async () => {
    if (!activeAlert) return;
    try {
      await dangerActionService.updateAlertStatus(activeAlert.id, 'DISPATCHED', 'Quick Response Unit mobilized from command notification banner');
      setActiveAlert(null);
      router.push('/danger-actions');
    } catch {
      setActiveAlert(null);
    }
  };

  if (!activeAlert) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-lg w-full bg-slate-900/95 backdrop-blur-md border-2 border-rose-500 rounded-xl shadow-[0_0_40px_rgba(225,29,72,0.6)] overflow-hidden animate-in slide-in-from-top duration-300">
      {/* Red Alert Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 px-4 py-2.5 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <span className="font-bold tracking-wider text-xs uppercase flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4" />
            Dangerous Person Identified
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 hover:bg-rose-700/50 rounded text-rose-100 transition-colors"
            title={isMuted ? "Unmute alert chimes" : "Mute alert chimes"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleDismiss}
            className="p-1 hover:bg-rose-700/50 rounded text-rose-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body with Suspect Details */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3.5">
          {/* Suspect Photo */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-rose-500 flex-shrink-0 bg-slate-800">
            {activeAlert.person_photo ? (
              <img 
                src={activeAlert.person_photo} 
                alt={activeAlert.person_name || 'Suspect'} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-rose-950 text-rose-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-rose-600 text-[8px] font-bold text-center text-white uppercase py-0.5">
              WANTED
            </div>
          </div>

          {/* Suspect & Location Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-base leading-tight truncate">
              {activeAlert.person_name || 'Unknown Suspect'}
            </h4>
            <p className="text-rose-400 text-xs font-semibold tracking-wide truncate">
              {activeAlert.crime_type || 'Dangerous Offender'}
            </p>

            <div className="mt-2 space-y-1 text-slate-300 text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span className="text-slate-400">Camera:</span>
                <span className="font-mono text-white font-medium">{activeAlert.camera_id}</span>
                {activeAlert.camera_address && (
                  <span className="truncate text-slate-400">({activeAlert.camera_address})</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-400">Time:</span>
                <span className="text-slate-200">{new Date(activeAlert.timestamp).toLocaleTimeString()}</span>
                {activeAlert.metadata?.confidence && (
                  <span className="ml-auto text-[10px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-700">
                    {Math.round(activeAlert.metadata.confidence * 100)}% Match
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2 border-t border-slate-800">
          <button
            onClick={handleDispatch}
            className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            Dispatch QRU
          </button>
          
          <Link
            href={`/dashboard`}
            onClick={handleDismiss}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1 border border-slate-700 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            GIS Map
          </Link>

          <Link
            href={`/danger-actions`}
            onClick={handleDismiss}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1 border border-slate-700 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            Action Log
          </Link>
        </div>
      </div>
    </div>
  );
}
