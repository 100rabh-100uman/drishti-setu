"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  ShieldAlert, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  ExternalLink, 
  Building2, 
  CheckCheck,
  Video,
  Clock,
  ChevronRight
} from "lucide-react";

interface NotificationItem {
  id: string;
  type: "critical" | "warning" | "request" | "info";
  title: string;
  description: string;
  department: string;
  targetResource?: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    type: "request",
    title: "Cross-Department CCTV Stream Access Requested",
    description: "Gujarat Police (West Zone HQ) has requested 48-hour live RTSP access for CAM001 & CAM003 (Civil Hospital Gate) for VIP Security Escort Movement.",
    department: "Gujarat Police",
    targetResource: "CAM001, CAM003",
    timestamp: "Just now",
    isRead: false,
    actionUrl: "/messages",
    actionLabel: "Review in Messages"
  },
  {
    id: "notif-2",
    type: "critical",
    title: "Perimeter Intrusion Detected — Restricted Zone B",
    description: "AI Video Analytics triggered high-confidence perimeter violation alert at Ahmedabad Municipal Water Reservoir Gate 2.",
    department: "AMC Surveillance",
    targetResource: "CAM024",
    timestamp: "14 mins ago",
    isRead: false,
    actionUrl: "/camera-feed",
    actionLabel: "Inspect Live Feed"
  },
  {
    id: "notif-3",
    type: "warning",
    title: "Camera Health Alert: High Packet Loss",
    description: "Camera CAM004 in Sector 7 Traffic Junction reported 3.8% packet drop over the last 15 minutes. Uptime reduced to 96.2%.",
    department: "Traffic Police",
    targetResource: "CAM004",
    timestamp: "45 mins ago",
    isRead: false,
    actionUrl: "/cameras",
    actionLabel: "Check Camera Health"
  },
  {
    id: "notif-4",
    type: "request",
    title: "AMC Smart City GIS Layer Ingestion Request",
    description: "Ahmedabad Municipal Corporation requested synchronization of 34 newly installed optical traffic sensors along Ashram Road.",
    department: "AMC Smart City",
    targetResource: "GIS Grid 08",
    timestamp: "2 hours ago",
    isRead: false,
    actionUrl: "/messages",
    actionLabel: "Open Conversation"
  },
  {
    id: "notif-5",
    type: "info",
    title: "Bulk CSV Onboarding Batch #117 Completed",
    description: "50 newly provisioned cameras successfully indexed into DRISHTI SETU with automatic ONVIF Profile S schema verification.",
    department: "System Registry",
    targetResource: "Batch-117",
    timestamp: "3 hours ago",
    isRead: true,
    actionUrl: "/cameras/history",
    actionLabel: "View Import Log"
  },
  {
    id: "notif-6",
    type: "info",
    title: "Audit Trail Integrity Verification Passed",
    description: "Cryptographic SHA-256 state chain validated. All 1,420 user access logs across Gujarat Police and Health Department are sealed.",
    department: "Audit & Compliance",
    timestamp: "Yesterday",
    isRead: true,
    actionUrl: "/audit-trail",
    actionLabel: "View Audit Log"
  },
  {
    id: "notif-7",
    type: "warning",
    title: "Maintenance Window Scheduled for GSDMA Sensors",
    description: "Monsoon flood sensor telemetry feed will undergo brief firmware upgrade on 14 Sept 2026, 02:00 - 04:00 AM.",
    department: "Disaster Management (GSDMA)",
    timestamp: "Yesterday",
    isRead: true,
    actionUrl: "/maintenance",
    actionLabel: "Maintenance Schedule"
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const filteredNotifications = notifications.filter((item) => {
    if (selectedFilter === "unread" && item.isRead) return false;
    if (selectedFilter === "critical" && item.type !== "critical") return false;
    if (selectedFilter === "request" && item.type !== "request") return false;
    if (selectedFilter === "warning" && item.type !== "warning") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        (item.targetResource && item.targetResource.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const criticalCount = notifications.filter((n) => n.type === "critical").length;
  const requestCount = notifications.filter((n) => n.type === "request").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0c162d] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                System Notifications & Alerts
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time security incidents, camera health anomalies, and inter-department access requests
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read</span>
            </button>
          )}
          <Link
            href="/messages"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs shadow-blue-500/20 transition-colors"
          >
            <span>Inter-Dept Messages</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0c162d] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Alerts</span>
            <Bell className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {notifications.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Logged across all jurisdictions</div>
        </div>

        <div className="bg-white dark:bg-[#0c162d] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Unread</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {unreadCount}
          </div>
          <div className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-1">Require officer attention</div>
        </div>

        <div className="bg-white dark:bg-[#0c162d] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Critical Incidents</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {criticalCount}
          </div>
          <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">Perimeter & AI security alerts</div>
        </div>

        <div className="bg-white dark:bg-[#0c162d] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Access Requests</span>
            <Radio className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {requestCount}
          </div>
          <div className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 mt-1">Cross-agency stream relays</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-[#0c162d] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All", count: notifications.length },
            { id: "unread", label: "Unread", count: unreadCount },
            { id: "critical", label: "Critical", count: criticalCount },
            { id: "request", label: "Access Requests", count: requestCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedFilter === tab.id
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, department, or camera ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-[#0c162d] p-12 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-80" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Notifications Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              There are no alerts matching your current filter criteria.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const isCritical = item.type === "critical";
            const isRequest = item.type === "request";
            const isWarning = item.type === "warning";

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  !item.isRead
                    ? "bg-white dark:bg-[#0c162d] border-blue-200/80 dark:border-blue-900/50 shadow-sm shadow-blue-500/5"
                    : "bg-white/70 dark:bg-[#091124]/70 border-slate-200/70 dark:border-slate-800/80 opacity-90"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCritical
                          ? "bg-rose-50 dark:bg-rose-950/70 text-rose-600 border border-rose-200 dark:border-rose-900/40"
                          : isRequest
                          ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 border border-blue-200 dark:border-blue-900/40"
                          : isWarning
                          ? "bg-amber-50 dark:bg-amber-950/70 text-amber-600 border border-amber-200 dark:border-amber-900/40"
                          : "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 border border-emerald-200 dark:border-emerald-900/40"
                      }`}
                    >
                      {isCritical ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : isRequest ? (
                        <Radio className="w-4 h-4" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCritical
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                              : isRequest
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                              : isWarning
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          }`}
                        >
                          {item.type}
                        </span>

                        {/* Department Chip */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {item.department}
                        </span>

                        {/* Target Resource */}
                        {item.targetResource && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-900/40">
                            <Video className="w-3 h-3" />
                            {item.targetResource}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.timestamp}
                        </span>
                        <span>•</span>
                        <button
                          onClick={() => toggleRead(item.id)}
                          className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer font-medium"
                        >
                          {item.isRead ? "Mark as Unread" : "Mark as Read"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {item.actionUrl && (
                    <div className="sm:self-center flex-shrink-0">
                      <Link
                        href={item.actionUrl}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                          isRequest
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : isCritical
                            ? "bg-rose-600 text-white hover:bg-rose-700"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        <span>{item.actionLabel || "View Details"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
