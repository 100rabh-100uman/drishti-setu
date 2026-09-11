"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Video, AlertTriangle, RefreshCw, Shield, Play, CheckCircle, Cpu, Radio } from "lucide-react";

export default function CameraFeedPage() {
  const [useDemo, setUseDemo] = useState<boolean>(false);
  const [customSource, setCustomSource] = useState<string>("");
  const [feedError, setFeedError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("Camera feed not available");
  const [key, setKey] = useState<number>(0);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  
  let feedUrl = `${baseUrl}/camera_feed/`;
  if (useDemo) {
    feedUrl += "?demo=true";
  } else if (customSource.trim()) {
    feedUrl += `?source=${encodeURIComponent(customSource.trim())}`;
  }

  const handleRetry = () => {
    setFeedError(false);
    setKey((prev) => prev + 1);
  };

  const handleToggleDemo = () => {
    setFeedError(false);
    setUseDemo((prev) => !prev);
    setKey((prev) => prev + 1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 tracking-wider uppercase mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Gujarat Police Surveillance Command Grid</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <Video className="w-7 h-7 text-blue-500" />
            Live CCTV Camera Feed with Model
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time video inference pipeline powered by YOLOv5 / CNN detection engine with live bounding box annotations.
          </p>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Model:</span>
            <span className="font-semibold text-emerald-400">YOLOv5 / CNN Active</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Radio className={`w-3.5 h-3.5 ${!feedError ? "text-emerald-400 animate-pulse" : "text-rose-400"}`} />
            <span className={!feedError ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
              {!feedError ? "LIVE STREAMING" : "FEED OFFLINE"}
            </span>
          </div>
        </div>
      </div>

      {/* Stream Controls */}
      <div className="bg-[#0d152a] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleDemo}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              useDemo
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            {useDemo ? "Using Live Traffic Demo Feed" : "Switch to Live Traffic Demo Feed"}
          </button>

          <button
            onClick={handleRetry}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reconnect
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Custom RTSP / HTTP stream URL..."
            value={customSource}
            onChange={(e) => setCustomSource(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRetry()}
            className="bg-slate-900 border border-slate-700 text-xs px-3 py-1.5 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-80"
          />
          <button
            onClick={handleRetry}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            Load
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative bg-black rounded-2xl border border-slate-800 overflow-hidden shadow-2xl min-h-[420px] flex items-center justify-center">
        {!feedError ? (
          <div className="relative w-full flex items-center justify-center bg-black">
            <img
              key={key}
              src={feedUrl}
              alt="Camera Feed"
              onError={() => {
                setFeedError(true);
                setErrorMessage("Camera feed not available");
              }}
              onLoad={() => setFeedError(false)}
              className="max-h-[640px] w-auto mx-auto object-contain rounded-lg"
            />
            {/* Live Watermark Overlay */}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded border border-white/10 text-[11px] font-mono flex items-center gap-2 text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>GUJARAT SENTINEL AI FEED</span>
            </div>
          </div>
        ) : (
          /* Error State Display (Feed is down) */
          <div className="p-8 text-center max-w-md space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Camera feed not available</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The external RTSP/HTTP camera source is currently offline or unreachable over the network.
              The backend returned JSON: <code className="text-rose-300 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/50">{`{ "error": "${errorMessage}" }`}</code>.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={handleToggleDemo}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Launch Live Traffic Demo Feed
              </button>
              <button
                onClick={handleRetry}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Feed
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Model Detection Specs Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0d152a] border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs font-medium">Model Architecture</div>
          <div className="text-base font-bold text-white mt-1">YOLOv5 / Custom CNN</div>
          <div className="text-[11px] text-slate-500 mt-1">Single-stage deep convolutional neural network for real-time edge CCTV inference.</div>
        </div>

        <div className="bg-[#0d152a] border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs font-medium">Annotation Stream</div>
          <div className="text-base font-bold text-emerald-400 mt-1">MJPEG (multipart/x-mixed-replace)</div>
          <div className="text-[11px] text-slate-500 mt-1">In-memory OpenCV hardware JPEG compression yielding zero-latency video rendering.</div>
        </div>

        <div className="bg-[#0d152a] border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs font-medium">Gujarat Sentinel Guard</div>
          <div className="text-base font-bold text-blue-400 mt-1">Watchlist & Vehicle ANPR</div>
          <div className="text-[11px] text-slate-500 mt-1">Real-time matching against Gujarat Police crime bureau and danger-action watchlist.</div>
        </div>
      </div>
    </div>
  );
}
