"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Send, 
  ShieldCheck, 
  Building2, 
  Radio, 
  Search, 
  Check, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  Video, 
  Lock, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Paperclip,
  CheckCircle2,
  XCircle,
  FileCheck
} from "lucide-react";

interface MessageItem {
  id: string;
  sender: "user" | "other" | "system";
  senderName: string;
  senderRole?: string;
  senderDepartment?: string;
  text: string;
  timestamp: string;
  isOfficialNotice?: boolean;
}

interface AccessRequest {
  id: string;
  requestCode: string;
  requestingDept: string;
  officerName: string;
  officerBadge: string;
  targetCameras: { id: string; name: string; location: string }[];
  duration: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  token?: string;
}

interface Channel {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  avatarBg: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  hasAccessRequest: boolean;
  officerInCharge: string;
  officerTitle: string;
  accessRequest?: AccessRequest;
  messages: MessageItem[];
}

const initialChannels: Channel[] = [
  {
    id: "police",
    name: "Gujarat Police — West Zone HQ",
    shortName: "Police Command",
    badge: "Active Access Request",
    avatarBg: "bg-blue-600",
    unreadCount: 1,
    lastMessage: "Official Request #REQ-8821: Need 48-hr access to CAM001 & CAM003",
    lastMessageTime: "Just now",
    hasAccessRequest: true,
    officerInCharge: "SP Vijay Varma, IPS",
    officerTitle: "Zonal Surveillance Commander",
    accessRequest: {
      id: "req-1",
      requestCode: "REQ-8821",
      requestingDept: "Gujarat Police (Ahmedabad West)",
      officerName: "SP Vijay Varma, IPS",
      officerBadge: "GP-9421",
      targetCameras: [
        { id: "CAM001", name: "Civil Hospital Main Gate", location: "Asarwa, Sector 1" },
        { id: "CAM003", name: "Emergency Trauma Care Bay", location: "Asarwa, Sector 2" }
      ],
      duration: "48 Hours (Until 14 Sept 2026, 10:00 AM)",
      reason: "High-priority VIP security escort convoy & public security cordon scheduled on 13 Sept. Direct live stream relay into Police Control Room required.",
      status: "pending"
    },
    messages: [
      {
        id: "m-1",
        sender: "system",
        senderName: "DRISHTI SETU Core",
        text: "Official Inter-Department Communication Channel initiated between Gujarat Police and Health & Family Welfare Department. All exchanges are cryptographically signed under Gujarat e-Governance Act.",
        timestamp: "10:10 AM",
        isOfficialNotice: true
      },
      {
        id: "m-2",
        sender: "other",
        senderName: "SP Vijay Varma, IPS",
        senderRole: "Zonal Surveillance Commander",
        senderDepartment: "Gujarat Police (West Zone)",
        text: "Greetings Officer. We have initiated emergency cross-department request #REQ-8821 for live stream access to CAM001 and CAM003 near the Civil Hospital perimeter. This is required for VIP escort convoy monitoring. Kindly review and authorize.",
        timestamp: "10:12 AM"
      }
    ]
  },
  {
    id: "health",
    name: "Health & Family Welfare Dept",
    shortName: "Health Dept",
    badge: "Verified Partner",
    avatarBg: "bg-emerald-600",
    unreadCount: 0,
    lastMessage: "Civil Hospital trauma center CCTV parameters verified.",
    lastMessageTime: "09:40 AM",
    hasAccessRequest: false,
    officerInCharge: "Dr. K. Mehta",
    officerTitle: "Director of Hospital Infrastructure",
    messages: [
      {
        id: "m-h1",
        sender: "other",
        senderName: "Dr. K. Mehta",
        senderRole: "Director of Hospital Infrastructure",
        senderDepartment: "Health Dept",
        text: "Confirming that all internal hospital network bandwidth parameters have been optimized for external agency relay. Hospital operations will remain unhindered.",
        timestamp: "09:40 AM"
      }
    ]
  },
  {
    id: "amc",
    name: "Ahmedabad Municipal Corp (AMC)",
    shortName: "AMC Smart City",
    badge: "Integration Request",
    avatarBg: "bg-indigo-600",
    unreadCount: 1,
    lastMessage: "Traffic Junction 14 integration request pending review",
    lastMessageTime: "Yesterday",
    hasAccessRequest: true,
    officerInCharge: "Er. Ramesh Prajapati",
    officerTitle: "Chief Smart City Systems Engineer",
    accessRequest: {
      id: "req-2",
      requestCode: "REQ-7740",
      requestingDept: "AMC Smart City Division",
      officerName: "Er. Ramesh Prajapati",
      officerBadge: "AMC-ENG-441",
      targetCameras: [
        { id: "CAM014", name: "Ashram Road Junction 14", location: "Navrangpura" }
      ],
      duration: "Permanent Integration (Shared Telemetry)",
      reason: "Smart Traffic adaptive light control sensor synchronization.",
      status: "pending"
    },
    messages: [
      {
        id: "m-a1",
        sender: "other",
        senderName: "Er. Ramesh Prajapati",
        senderRole: "Chief Smart City Systems Engineer",
        senderDepartment: "AMC",
        text: "Requesting synchronization of Ashram Road Junction 14 optical telemetry with AMC centralized adaptive traffic signal controller.",
        timestamp: "Yesterday, 04:30 PM"
      }
    ]
  },
  {
    id: "gsdma",
    name: "Disaster Management (GSDMA)",
    shortName: "Disaster Mgmt",
    badge: "Verified Partner",
    avatarBg: "bg-amber-600",
    unreadCount: 0,
    lastMessage: "Monsoon flood sensor stream telemetry active.",
    lastMessageTime: "10 Sept",
    hasAccessRequest: false,
    officerInCharge: "Anil Trivedi, IAS",
    officerTitle: "Relief Commissioner & State Coordinator",
    messages: [
      {
        id: "m-g1",
        sender: "other",
        senderName: "Anil Trivedi, IAS",
        senderRole: "Relief Commissioner",
        senderDepartment: "GSDMA",
        text: "Sabarmati riverfront high-water level surveillance telemetry successfully synchronized with state disaster dashboard.",
        timestamp: "10 Sept, 11:20 AM"
      }
    ]
  }
];

const quickReplies = [
  "Access has been authorized for 48 hours under Section 144 surveillance protocol.",
  "Please confirm that Police Command Center RTSP receiver IP 10.24.1.80 is listening.",
  "Request approved. Audit logging enabled for all connected operators.",
  "Please furnish official departmental FIR / Convoy protocol order reference."
];

export default function MessagesPage() {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [activeChannelId, setActiveChannelId] = useState<string>("police");
  const [messageInput, setMessageInput] = useState<string>("");
  const [priorityTag, setPriorityTag] = useState<"routine" | "urgent">("routine");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  const handleApproveAccess = (channelId: string) => {
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id === channelId && c.accessRequest) {
          const updatedRequest: AccessRequest = {
            ...c.accessRequest,
            status: "approved",
            token: "DS-AUTH-" + Math.floor(100000 + Math.random() * 900000)
          };
          const systemMsg: MessageItem = {
            id: "m-" + Date.now(),
            sender: "system",
            senderName: "DRISHTI SETU Protocol",
            text: `✅ ACCESS GRANTED: 48-Hour Live RTSP stream token generated (${updatedRequest.token}). Assigned to ${c.accessRequest.requestingDept} with continuous cryptographic audit logging.`,
            timestamp: "Just now",
            isOfficialNotice: true
          };
          return {
            ...c,
            accessRequest: updatedRequest,
            messages: [...c.messages, systemMsg]
          };
        }
        return c;
      })
    );
  };

  const handleRejectAccess = (channelId: string) => {
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id === channelId && c.accessRequest) {
          const updatedRequest: AccessRequest = {
            ...c.accessRequest,
            status: "rejected"
          };
          const systemMsg: MessageItem = {
            id: "m-" + Date.now(),
            sender: "system",
            senderName: "DRISHTI SETU Protocol",
            text: `❌ ACCESS DECLINED: Request ${c.accessRequest.requestCode} was declined by the commanding officer. Reason: Requires additional jurisdictional clearance.`,
            timestamp: "Just now",
            isOfficialNotice: true
          };
          return {
            ...c,
            accessRequest: updatedRequest,
            messages: [...c.messages, systemMsg]
          };
        }
        return c;
      })
    );
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMsg: MessageItem = {
      id: "m-" + Date.now(),
      sender: "user",
      senderName: "Admin Officer (You)",
      senderRole: "Command Center Administrator",
      text: (priorityTag === "urgent" ? "[URGENT DIRECTIVE] " : "") + messageInput.trim(),
      timestamp: "Just now"
    };

    const targetChannelId = activeChannel.id;

    setChannels((prev) =>
      prev.map((c) => {
        if (c.id === targetChannelId) {
          return {
            ...c,
            lastMessage: newMsg.text,
            lastMessageTime: "Just now",
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      })
    );

    setMessageInput("");

    // Simulate realistic response from the department after 1.8s
    setTimeout(() => {
      setChannels((prev) =>
        prev.map((c) => {
          if (c.id === targetChannelId) {
            const replyMsg: MessageItem = {
              id: "m-reply-" + Date.now(),
              sender: "other",
              senderName: c.officerInCharge,
              senderRole: c.officerTitle,
              senderDepartment: c.name,
              text: `Acknowledged Officer. Message received and recorded in our zonal command log. Thank you for the coordination.`,
              timestamp: "Just now"
            };
            return {
              ...c,
              lastMessage: replyMsg.text,
              lastMessageTime: "Just now",
              messages: [...c.messages, replyMsg]
            };
          }
          return c;
        })
      );
    }, 1800);
  };

  const filteredChannels = channels.filter((ch) =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.officerInCharge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0c162d] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Inter-Department Communications Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                GovNet Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Secure inter-agency collaboration, cross-department CCTV stream requests, and official directives
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>End-to-End Encrypted Relay</span>
          </span>
        </div>
      </div>

      {/* Main Dual-Panel Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Panel: Department Channel List (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0c162d] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
          
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Department Channels
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                {channels.length} Agencies
              </span>
            </div>
            
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search departments or officers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Channels List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto max-h-[600px]">
            {filteredChannels.map((channel) => {
              const isSelected = channel.id === activeChannelId;

              return (
                <div
                  key={channel.id}
                  onClick={() => setActiveChannelId(channel.id)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${channel.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0`}>
                      {channel.shortName.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {channel.name}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {channel.lastMessageTime}
                        </span>
                      </div>

                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {channel.officerInCharge}
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-1 font-mono">
                        {channel.lastMessage}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        {channel.hasAccessRequest && channel.accessRequest?.status === "pending" && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
                            <Radio className="w-2.5 h-2.5" />
                            Request Pending
                          </span>
                        )}
                        {channel.accessRequest?.status === "approved" && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            <Check className="w-2.5 h-2.5" />
                            Stream Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Panel: Active Conversation & Request Approvals (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0c162d] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col min-h-[600px]">
          
          {/* Active Thread Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${activeChannel.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0`}>
                {activeChannel.shortName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {activeChannel.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Officer In-Charge: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeChannel.officerInCharge}</span> ({activeChannel.officerTitle})
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Audit Logged</span>
            </div>
          </div>

          {/* Thread Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-[#091124]/40 max-h-[480px]">
            
            {/* CROSS-DEPARTMENT ACCESS REQUEST CARD (if present) */}
            {activeChannel.accessRequest && (
              <div className="bg-white dark:bg-[#0c162d] rounded-2xl border-2 border-blue-500/30 dark:border-blue-500/40 p-5 shadow-md shadow-blue-500/5 space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                          Official CCTV Access Request
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {activeChannel.accessRequest.requestCode}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Initiated by {activeChannel.accessRequest.officerName} ({activeChannel.accessRequest.requestingDept})
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {activeChannel.accessRequest.status === "pending" && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Approval
                      </span>
                    )}
                    {activeChannel.accessRequest.status === "approved" && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Access Granted
                      </span>
                    )}
                    {activeChannel.accessRequest.status === "rejected" && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Requested Cameras */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Requested Live Streams:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeChannel.accessRequest.targetCameras.map((cam) => (
                      <div
                        key={cam.id}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <Video className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {cam.id} — {cam.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{cam.location}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operational Reason & Duration */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/50 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Surveillance Scope & Purpose:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">Duration: {activeChannel.accessRequest.duration}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeChannel.accessRequest.reason}
                  </p>
                </div>

                {/* Interactive Action Buttons */}
                {activeChannel.accessRequest.status === "pending" ? (
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => handleApproveAccess(activeChannel.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Grant Stream Access</span>
                    </button>
                    <button
                      onClick={() => handleRejectAccess(activeChannel.id)}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-all cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                ) : activeChannel.accessRequest.status === "approved" ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-semibold">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>Stream relay authorized. Temporary Token: <code className="font-mono font-bold">{activeChannel.accessRequest.token}</code></span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Valid for 48 Hours</span>
                  </div>
                ) : null}

              </div>
            )}

            {/* Conversation Messages */}
            {activeChannel.messages.map((msg) => {
              if (msg.sender === "system") {
                return (
                  <div key={msg.id} className="text-center my-3">
                    <span className="inline-block max-w-xl text-[11px] text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-[#0c162d]/80 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-xs">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isUser = msg.sender === "user";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}
                >
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {msg.senderName}
                    </span>
                    {msg.senderRole && <span>• {msg.senderRole}</span>}
                    <span>• {msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? "bg-blue-600 text-white rounded-tr-xs shadow-sm shadow-blue-500/20 font-medium"
                        : "bg-white dark:bg-[#0c162d] text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-tl-xs shadow-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Pre-Set Directives */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1">
              Quick Protocol:
            </span>
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMessageInput(reply)}
                className="text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Custom Message Composer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-white dark:bg-[#0c162d]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority:</span>
                <button
                  type="button"
                  onClick={() => setPriorityTag("routine")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                    priorityTag === "routine"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Routine Message
                </button>
                <button
                  type="button"
                  onClick={() => setPriorityTag("urgent")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                    priorityTag === "urgent"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border border-rose-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  ⚡ Urgent Directive
                </button>
              </div>

              <span className="text-[10px] text-slate-400">
                Press Enter or click Send to dispatch
              </span>
            </div>

            <div className="flex items-end gap-2">
              <textarea
                rows={2}
                placeholder={`Type official message to ${activeChannel.name}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="h-14 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
