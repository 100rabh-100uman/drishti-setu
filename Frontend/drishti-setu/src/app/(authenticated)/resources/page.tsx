"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  Camera, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  BookOpen, 
  Building2, 
  Layers, 
  Radio, 
  Info,
  ChevronRight,
  Shield,
  UserCheck,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  Video,
  Play,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { apiClient } from "@/services/api";

export default function ResourcesPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [ingestCatalog, setIngestCatalog] = useState<any[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [checklist, setChecklist] = useState({
    c1: true,
    c2: true,
    c3: true,
    c4: true,
    c5: true,
    c6: true,
    c7: true,
    c8: true
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Fetch /api/ingest catalogue
  const fetchCatalogue = async () => {
    setLoadingCatalog(true);
    try {
      const res = await apiClient.get<{ cameras?: any[] }>('/api/ingest');
      if (res && Array.isArray(res.cameras)) {
        setIngestCatalog(res.cameras);
      }
    } catch (e) {
      console.warn('Notice loading catalogue:', e);
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    fetchCatalogue();
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto pb-24 space-y-8 font-sans">
      
      {/* ── TOP HERO BANNER ───────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0a1b3f] to-blue-950 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-600/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Gujarat Police Innovation Challenge 2026
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Consuming the Sentinel Camera Grid — Integrator&apos;s Guide
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Official technical instructions for connecting to the Gujarat Sentinel CCTV sandbox. Learn how to open live RTP/RTSP streams, handle monotonic presentation timestamps (PTS), and configure high-performance OpenCV pipelines.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <a
              href="https://sentinel.gujarat.gov.in/resource"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Official Gujarat Sentinel Portal</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: WHAT YOU ARE CONNECTING TO & LIVE CATALOGUE ── */}
      <div className="bg-white dark:bg-[#0c162d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold font-mono">
              §1
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">What You Are Connecting To</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live RTP/RTSP Streams & Dynamic Catalogue Contract</p>
            </div>
          </div>
          
          <button
            onClick={fetchCatalogue}
            disabled={loadingCatalog}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingCatalog ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh Catalogue</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-sm">Real-Time Cadence</span>
            <p className="leading-relaxed">Every camera is published as a live RTP/RTSP stream. One second of video takes one second to arrive. Frames carry monotonic presentation timestamps (PTS).</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-sm">No Seeking / No Local File</span>
            <p className="leading-relaxed">There is no seeking, no byte-range fetching, and no running ahead of real time. Build against live stream capture from the start rather than local file copies.</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-sm">Catalogue Contract</span>
            <p className="leading-relaxed">Always start from the catalogue endpoint <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-slate-800 dark:text-slate-200">/api/ingest</code> rather than hard-coding URLs. Camera IDs and sets can change dynamically.</p>
          </div>
        </div>

        {/* Live /api/ingest Response Viewer */}
        <div className="p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>curl -s http://localhost:8000/api/ingest</span>
            </span>
            <span className="text-[11px] text-slate-400">{ingestCatalog.length} Sentinel Cameras Ingested</span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {ingestCatalog.map((c) => (
              <div key={c.id || c.camera_id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-white">{c.camera_id}</span>
                  <span className="text-slate-400">({c.codec})</span>
                  <span className="text-slate-300 truncate max-w-xs">{c.name || c.location?.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400">{c.urls?.rtsp}</span>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] rounded font-bold">{c.live_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 2: CONNECTING CODE SNIPPETS ────────────────── */}
      <div className="bg-white dark:bg-[#0c162d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold font-mono">
            §2
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Connecting to the Live Grid</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Official Python OpenCV, GStreamer, and FFplay implementations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Python OpenCV */}
          <div className="p-4 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-mono text-xs font-bold text-cyan-400">Python 3 + OpenCV (Mandatory TCP Transport)</span>
              <button
                onClick={() => handleCopy(`import os\nos.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"\nimport cv2\n\ncap = cv2.VideoCapture("rtsp://localhost:8554/stream/1", cv2.CAP_FFMPEG)\nwhile True:\n    ok, frame = cap.read()\n    if not ok:\n        break  # reconnect with exponential backoff\n    pts_ms = cap.get(cv2.CAP_PROP_POS_MSEC)\n    # process frame with OpenCV...`, 'pycode')}
                className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 font-mono transition-colors"
              >
                {copiedKey === 'pycode' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'pycode' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto p-2 bg-slate-900/60 rounded-lg">
{`import os
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"
import cv2

cap = cv2.VideoCapture("rtsp://localhost:8554/stream/1", cv2.CAP_FFMPEG)
while True:
    ok, frame = cap.read()
    if not ok:
        break  # reconnect with backoff
    pts_ms = cap.get(cv2.CAP_PROP_POS_MSEC)
    # process frame...`}
            </pre>
            <div className="mt-3 text-[10px] text-slate-400">
              * Note: CAP_PROP_POS_MSEC extracts exact RTP presentation timestamps.
            </div>
          </div>

          {/* GStreamer & FFplay */}
          <div className="p-4 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="font-mono text-xs font-bold text-amber-400">GStreamer Pipeline & FFplay</span>
              <button
                onClick={() => handleCopy(`gst-launch-1.0 rtspsrc location=rtsp://localhost:8554/stream/1 protocols=tcp latency=200 ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! fakesink`, 'gstcode')}
                className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 font-mono transition-colors"
              >
                {copiedKey === 'gstcode' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'gstcode' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto p-2 bg-slate-900/60 rounded-lg">
{`# GStreamer (H.264 over TCP)
gst-launch-1.0 rtspsrc location=rtsp://localhost:8554/stream/1 \
  protocols=tcp latency=200 ! rtph264depay ! h264parse ! \
  avdec_h264 ! videoconvert ! fakesink

# FFplay Command
ffplay -rtsp_transport tcp rtsp://localhost:8554/stream/1`}
            </pre>
            <div className="mt-3 text-[10px] text-slate-400">
              * For H.265 streams, use rtph265depay and h265parse.
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: DO'S AND DON'TS ─────────────────────────── */}
      <div className="bg-white dark:bg-[#0c162d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold font-mono">
            §3
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Do&apos;s and Don&apos;ts (Protocol Best Practices)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Avoiding common integration errors causing client-side pipeline crashes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 space-y-2">
            <span className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Do NOT Rely on UDP Transport
            </span>
            <p className="text-rose-800 dark:text-rose-200 leading-relaxed">
              UDP fails across NAT and firewalls, producing corrupted frames that look like model bugs. Set <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-mono">rtsp_transport=tcp</code> in every client.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
            <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Use Monotonic PTS (CAP_PROP_POS_MSEC)
            </span>
            <p className="text-emerald-800 dark:text-emerald-200 leading-relaxed">
              OpenCV&apos;s <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-mono">CAP_PROP_FPS</code> often does not match delivery rate. Do not use wall-clock time at frame read; use buffer PTS or monotonic timestamps.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-2">
            <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Reconnect with Exponential Backoff
            </span>
            <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
              Feeds are supervised and may restart. Reconnect with exponential backoff (start at ~2 s, cap at ~30 s). Do not reconnect in a tight loop.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-2">
            <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Handle Mixed H.264 / H.265 & Looping Cuts
            </span>
            <p className="text-purple-800 dark:text-purple-200 leading-relaxed">
              Decoder warnings on join (e.g. Error constructing frame RPS) are normal and self-correct when the first IDR frame arrives. Handle scene cuts smoothly at loop points.
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: PRE-SUBMISSION CHECKLIST ─────────────────── */}
      <div className="bg-white dark:bg-[#0c162d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold font-mono">
            §4
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pre-Submission Checklist</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Official 8-point verification matrix for hackathon evaluation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            { id: 'c1', text: 'Every client forces RTSP over TCP (rtsp_transport;tcp)' },
            { id: 'c2', text: 'No timing logic depends on CAP_PROP_FPS or frame arrival time' },
            { id: 'c3', text: 'Inter-frame gaps do not crash or stall the vision pipeline' },
            { id: 'c4', text: 'Reconnect with backoff is implemented and tested by restarting a feed' },
            { id: 'c5', text: 'Decoder warnings on join are logged, not fatal' },
            { id: 'c6', text: 'Camera list and per-camera properties are read from /api/ingest' },
            { id: 'c7', text: 'Pipeline handles mixed H.264 / H.265 and mixed resolutions' },
            { id: 'c8', text: 'Behaviour is sane across a scene discontinuity / loop point' }
          ].map((item) => {
            const isChecked = checklist[item.id as keyof typeof checklist];
            return (
              <div 
                key={item.id}
                onClick={() => toggleCheck(item.id as keyof typeof checklist)}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  isChecked 
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200' 
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                }`}>
                  {isChecked && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className="font-semibold">{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 5: SUPPORT & SCRB CONTACT ──────────────────── */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <Shield className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-base font-bold">State Crime Record Bureau (SCRB) • Gujarat Police</h3>
            <p className="text-xs text-slate-400">Next to Police Bhawan, Sector - 18, Gandhinagar, Gujarat - 382009</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Phone className="w-4 h-4 text-emerald-400" />
            <a href="tel:+919537089982" className="hover:underline">+91 95370 89982</a>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-4 h-4 text-cyan-400" />
            <a href="mailto:sentinel.hackathon@gujarat.gov.in" className="hover:underline">sentinel.hackathon@gujarat.gov.in</a>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <a href="https://gujhome.gujarat.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">gujhome.gujarat.gov.in</a>
          </div>
        </div>
      </div>

    </div>
  );
}
