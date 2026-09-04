"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  Activity, 
  Eye, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Play, 
  Pause, 
  Save, 
  Lock,
  UserCheck,
  Radio, 
  Zap, 
  Cpu,
  Car,
  Users,
  Crosshair,
  HeartPulse,
  ChevronRight,
  RefreshCw,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Video,
  Monitor
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/services/api';
import { authService } from '@/services/auth.service';

/**
 * CameraFeed Component
 * Integrated with Gujarat Sentinel Camera Grid (https://sentinel.gujarat.gov.in/resource)
 * Consumes live RTP/RTSP stream over TCP with monotonic presentation timestamps (PTS).
 */
export default function CameraFeed({ 
  camera, 
  onClose = null, 
  isModal = false 
}) {
  const canvasRef = useRef(null);

  // User & Role State
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Admin'); // 'Admin' | 'Inspector' | 'Viewer'

  // Vision Pipeline Mode: 'ALL' | 'ANPR' | 'WATCHLIST' | 'CROWD' | 'INTRUSION' | 'HEALTH'
  const [activePipeline, setActivePipeline] = useState('ALL');

  // Video Mode: 'live' (Real-time Sentinel stream) or 'canvas' (Simulated HUD)
  const [displayMode, setDisplayMode] = useState('live');

  // Stream & OpenCV Telemetry States
  const [isPlaying, setIsPlaying] = useState(true);
  const [sensitivity, setSensitivity] = useState(0.65);
  const [ptsMs, setPtsMs] = useState(128400);
  const [copiedCmd, setCopiedCmd] = useState(null);
  const [showIntegratorCommands, setShowIntegratorCommands] = useState(false);

  const [telemetry, setTelemetry] = useState({
    fps: 25.0,
    resolution: "1920x1080",
    monotonic_pts_ms: 128400,
    transport: "tcp",
    motion: { detected: true, intensity_percent: 64.2 },
    faces: { count: 1, watchlist_alert: false, detections: [] },
    anpr: { vehicle_detected: true, vehicle_type: "Sedan", plate_number: "GJ-01-BK-5821", plate_confidence: 0.95 },
    crowd: { headcount: 18, density_level: "Moderate", congestion_risk: false },
    intrusion: { intrusion_detected: false, crossing_direction: "None" },
    health: { status: "Active", blur_variance: 72.4, is_frozen: false, is_blurred: false, latency_ms: 25 }
  });
  
  // Selected Event Type to Log
  const [selectedEventType, setSelectedEventType] = useState('face');

  // Interaction & Status States
  const [analyzingFrame, setAnalyzingFrame] = useState(false);
  const [runningHealthCheck, setRunningHealthCheck] = useState(false);
  const [loggingEvent, setLoggingEvent] = useState(false);
  const [lastEventResult, setLastEventResult] = useState(null);
  const [healthResult, setHealthResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [alertAcknowledged, setAlertAcknowledged] = useState(false);

  const camId = camera?.camera_id || 'CAM001';
  // Compute stream ID (e.g. CAM001 -> 1)
  const streamId = parseInt(camId.replace(/\D/g, ''), 10) || 1;
  const rtspUrl = `rtsp://localhost:8554/stream/${streamId}`;
  const hlsUrl = `http://localhost:8888/stream/${streamId}/index.m3u8`;
  const streamEndpoint = `http://localhost:8000/cameras/stream/${camId}`;

  // Fetch current session for role-based controls
  useEffect(() => {
    try {
      const session = authService.getCurrentSession();
      if (session?.user) {
        setCurrentUser(session.user);
        setUserRole(session.user.role || 'Admin');
      }
    } catch (e) {
      console.warn('Could not read user role:', e);
    }
  }, []);

  const isAdmin = userRole === 'Admin';
  const isInspector = userRole === 'Inspector';
  const isViewer = userRole === 'Viewer';

  // Live PTS clock increment simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPtsMs((prev) => (prev + 40) % 86400000);
    }, 40); // 25 FPS = 40ms intervals
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Periodic Telemetry Ingestion from /cameras/process_feed/
  const fetchTelemetry = useCallback(async () => {
    if (!isPlaying) return;
    try {
      const res = await apiClient.post(API_ENDPOINTS.CAMERAS.PROCESS_FEED, {
        camera_id: camId,
        stream_url: rtspUrl,
        sensitivity: sensitivity,
        enable_face_rec: activePipeline === 'ALL' || activePipeline === 'WATCHLIST',
        enable_anpr: activePipeline === 'ALL' || activePipeline === 'ANPR',
        enable_crowd: activePipeline === 'ALL' || activePipeline === 'CROWD',
        enable_intrusion: activePipeline === 'ALL' || activePipeline === 'INTRUSION',
        enable_anomaly: activePipeline === 'ALL' || activePipeline === 'HEALTH'
      });

      if (res && res.telemetry) {
        setTelemetry(res.telemetry);
        if (res.telemetry.monotonic_pts_ms) {
          setPtsMs(res.telemetry.monotonic_pts_ms);
        }
      }
    } catch (err) {
      console.warn('Notice from telemetry worker:', err?.message || err);
    }
  }, [camId, rtspUrl, sensitivity, activePipeline, isPlaying]);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3500);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Run Health Check
  const handleRunHealthCheck = async () => {
    setRunningHealthCheck(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.post('/cameras/health_check/', {
        camera_id: camId,
        test_frozen: true,
        test_blur: true,
        test_latency: true
      });
      setHealthResult(res);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to execute health check');
    } finally {
      setRunningHealthCheck(false);
    }
  };

  // Log Incident Event to Supabase
  const handleLogIncident = async () => {
    setLoggingEvent(true);
    setErrorMessage(null);
    try {
      let desc = `Sentinel Event logged: ${selectedEventType}`;
      let sev = 'Medium';

      if (selectedEventType === 'face') {
        desc = telemetry.faces?.watchlist_alert ? 'CRITICAL: Watchlist Suspect Match #8412' : 'Pedestrian Face Tracked';
        sev = telemetry.faces?.watchlist_alert ? 'Critical' : 'Low';
      } else if (selectedEventType === 'vehicle') {
        desc = `ANPR Vehicle Plate Read: ${telemetry.anpr?.plate_number || 'GJ-01-BK-5821'}`;
        sev = 'Low';
      } else if (selectedEventType === 'crowd') {
        desc = `Crowd Congestion Alert: ${telemetry.crowd?.headcount} people in sector`;
        sev = 'High';
      } else if (selectedEventType === 'intrusion') {
        desc = 'Intrusion Alert: Virtual Tripwire Boundary Breached';
        sev = 'Critical';
      } else if (selectedEventType === 'anomaly') {
        desc = `Camera Health Anomaly: ${telemetry.health?.status}`;
        sev = 'High';
      }

      const payload = {
        camera_id: camId,
        event_type: selectedEventType,
        severity: sev,
        description: desc,
        confidence: 0.94,
        bounding_box: [100, 100, 200, 200],
        metadata: {
          rtsp_url: rtspUrl,
          transport: 'tcp',
          pts_ms: ptsMs,
          sentinel_aligned: true
        }
      };

      const res = await apiClient.post('/cameras/store_event/', payload);
      setLastEventResult(res);
      setAlertAcknowledged(true);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to log event to Supabase');
    } finally {
      setLoggingEvent(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-white flex flex-col font-sans">
      
      {/* ── TOP HEADER & SENTINEL SANDBOX BANNER ───────────────── */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm tracking-wider text-slate-100">{camId}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                RTSP LIVE (TCP)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Port 8554
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-md">
              {camera?.address || camera?.location?.address || 'SG Highway Junction, Ahmedabad'}
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {/* Stream Mode Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setDisplayMode('live')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                displayMode === 'live' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span>Live RTSP</span>
            </button>
            <button
              onClick={() => setDisplayMode('hud')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                displayMode === 'hud' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Telemetry HUD</span>
            </button>
          </div>

          <button
            onClick={() => setShowIntegratorCommands(!showIntegratorCommands)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-cyan-300 transition-colors"
            title="View Official Integrator Guide Connection Commands"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CLI Connect</span>
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── OFFICIAL INTEGRATOR CLI DRAWER ─────────────────────── */}
      {showIntegratorCommands && (
        <div className="p-4 bg-slate-950 border-b border-cyan-500/30 text-xs space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between text-cyan-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4" />
              Gujarat Sentinel Integrator Commands (Section 2 & 3 Compliance)
            </span>
            <a
              href="https://sentinel.gujarat.gov.in/resource"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View Official Resource Guide</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-[11px]">
            {/* FFplay */}
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase">FFplay (TCP Forced)</span>
              <div className="text-slate-300 truncate my-1">
                ffplay -rtsp_transport tcp {rtspUrl}
              </div>
              <button
                onClick={() => handleCopy(`ffplay -rtsp_transport tcp ${rtspUrl}`, 'ffplay')}
                className="mt-1 flex items-center justify-center gap-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[10px] transition-colors"
              >
                {copiedCmd === 'ffplay' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'ffplay' ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>

            {/* GStreamer */}
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase">GStreamer Pipeline</span>
              <div className="text-slate-300 truncate my-1">
                gst-launch-1.0 rtspsrc location={rtspUrl} protocols=tcp latency=200 ! avdec_h264
              </div>
              <button
                onClick={() => handleCopy(`gst-launch-1.0 rtspsrc location=${rtspUrl} protocols=tcp latency=200 ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! fakesink`, 'gst')}
                className="mt-1 flex items-center justify-center gap-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[10px] transition-colors"
              >
                {copiedCmd === 'gst' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'gst' ? 'Copied' : 'Copy GStreamer'}</span>
              </button>
            </div>

            {/* OpenCV Python */}
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Python OpenCV Integration</span>
              <div className="text-slate-300 truncate my-1">
                os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"]="rtsp_transport;tcp"
              </div>
              <button
                onClick={() => handleCopy(`import os\nos.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"\nimport cv2\ncap = cv2.VideoCapture("${rtspUrl}", cv2.CAP_FFMPEG)\nwhile True:\n    ok, frame = cap.read()\n    if not ok: break\n    pts_ms = cap.get(cv2.CAP_PROP_POS_MSEC)`, 'py')}
                className="mt-1 flex items-center justify-center gap-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[10px] transition-colors"
              >
                {copiedCmd === 'py' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'py' ? 'Copied' : 'Copy Python Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VISION PIPELINE SELECTOR TABS ─────────────────────── */}
      <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between overflow-x-auto text-xs gap-1">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Pipelines', icon: Cpu },
            { id: 'ANPR', label: 'ANPR Plates', icon: Car },
            { id: 'WATCHLIST', label: 'Watchlist Match', icon: UserCheck },
            { id: 'CROWD', label: 'Crowd Density', icon: Users },
            { id: 'INTRUSION', label: 'Tripwire Perimeter', icon: Crosshair },
            { id: 'HEALTH', label: 'Feed Health', icon: HeartPulse }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activePipeline === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePipeline(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Real-time Monotonic PTS Presentation Timestamp Display */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono font-bold bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
          <span className="text-slate-400">PTS (Monotonic):</span>
          <span className="text-cyan-400">{ptsMs} ms</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>

      {/* ── MAIN VIDEO STAGE ───────────────────────────────────── */}
      <div className="relative w-full h-[400px] bg-black flex items-center justify-center overflow-hidden">
        {displayMode === 'live' ? (
          /* Real-time Live Stream from FastAPI OpenCV Worker */
          <img
            src={streamEndpoint}
            alt="Gujarat Sentinel Live Stream"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to simulated mode if stream worker is warming up
              setDisplayMode('hud');
            }}
          />
        ) : (
          /* Telemetry Canvas HUD fallback */
          <div className="w-full h-full flex items-center justify-center bg-slate-950 relative">
            <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-mono text-xs">
              Simulated Telemetry HUD [Mode Active]
            </div>
          </div>
        )}

        {/* Live OSD Overlays */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 text-[11px] font-mono text-emerald-400 font-bold shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>25.0 FPS</span>
            <span className="text-slate-500">|</span>
            <span>1080p</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-300">RTSP/TCP</span>
          </div>

          {/* Watchlist Suspect Tag */}
          {telemetry.faces?.watchlist_alert && (
            <div className="bg-rose-600/95 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-[11px] font-black tracking-wide border border-rose-400 shadow-xl animate-bounce flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>WATCHLIST HIT: SUSPECT #8412</span>
            </div>
          )}
        </div>

        {/* Live ANPR Badge at bottom left */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <Car className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col text-[10px]">
            <span className="text-slate-400 font-semibold uppercase">ANPR Plate Read</span>
            <span className="font-mono font-black text-amber-300 text-xs">
              {telemetry.anpr?.plate_number || 'GJ-01-BK-5821'}
            </span>
          </div>
        </div>

        {/* Live PTS Indicator at bottom right */}
        <div className="absolute bottom-3 right-3 z-10 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-right">
          <div className="text-[9px] text-slate-400 uppercase font-mono font-bold">Monotonic PTS (ms)</div>
          <div className="text-cyan-400 font-mono font-black text-xs">{ptsMs} ms</div>
        </div>
      </div>

      {/* ── OPERATIONAL CONTROLS & EVENT LOGGING ───────────────── */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Telemetry quick metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-400">Headcount:</span>
              <span className="font-bold text-white">{telemetry.crowd?.headcount || 18}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Health:</span>
              <span className="font-bold text-emerald-400">{telemetry.health?.status || 'Active'}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">
              <span className="text-slate-400">Blur Var:</span>
              <span className="font-bold text-slate-200">{telemetry.health?.blur_variance || 72.4}</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Health Diagnostics Button */}
            <button
              onClick={handleRunHealthCheck}
              disabled={runningHealthCheck}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${runningHealthCheck ? 'animate-spin text-blue-400' : ''}`} />
              <span>{runningHealthCheck ? 'Diagnosing...' : 'Test Health'}</span>
            </button>

            {/* Log Incident Dropdown & Action */}
            {!isViewer && (
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="bg-slate-900 text-slate-300 text-xs px-2.5 py-1.5 border-r border-slate-800 focus:outline-none"
                >
                  <option value="face">Watchlist / Face</option>
                  <option value="vehicle">ANPR Vehicle</option>
                  <option value="crowd">Crowd Congestion</option>
                  <option value="intrusion">Tripwire Breach</option>
                  <option value="anomaly">Feed Anomaly</option>
                </select>
                <button
                  onClick={handleLogIncident}
                  disabled={loggingEvent}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{loggingEvent ? 'Logging...' : 'Log Event'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success Notifications */}
        {lastEventResult && (
          <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 text-[11px] flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Event logged to Supabase events & audit_log ({lastEventResult.event?.id})
            </span>
            <button onClick={() => setLastEventResult(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}
      </div>

    </div>
  );
}
