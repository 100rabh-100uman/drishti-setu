"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
 AlertOctagon, 
 ShieldAlert, 
 Search, 
 Filter, 
 RefreshCw, 
 Send, 
 CheckCircle2, 
 Clock, 
 MapPin, 
 Radio, 
 Eye, 
 Sparkles,
 ExternalLink,
 Shield,
 Layers,
 AlertTriangle,
 Zap,
 Activity,
 Bell
} from 'lucide-react';
import { dangerActionService } from '@/services/danger-action.service';
import { authService } from '@/services/auth.service';

const DEPARTMENTS = [
 { id: 1, name: 'Gujarat Police Department' },
 { id: 2, name: 'Gujarat Traffic Branch' },
 { id: 3, name: 'Disaster Management Authority (GSDMA)' },
 { id: 4, name: 'Ahmedabad Municipal Corporation (AMC)' },
 { id: 5, name: 'Gandhinagar Municipal Corporation (GMC)' },
];

/**
 * DRISHTI SETU — Danger Actions Component
 * High-priority alert table for detections of crime-listed persons.
 * Conforms to Gujarat Sentinel surveillance and threat escalation guidelines.
 */
export default function DangerActions({ onLocateOnMap, onSelectCamera }) {
 const [alerts, setAlerts] = useState([]);
 const [loading, setLoading] = useState(true);
 const [refreshing, setRefreshing] = useState(false);
 const [simulating, setSimulating] = useState(false);
 const [currentUser, setCurrentUser] = useState(null);

 // Filters
 const [selectedDept, setSelectedDept] = useState('ALL');
 const [selectedStatus, setSelectedStatus] = useState('ALL');
 const [selectedZone, setSelectedZone] = useState('ALL');
 const [searchQuery, setSearchQuery] = useState('');
 const [recentNotification, setRecentNotification] = useState(null);

 // Fetch current officer profile for role-based views
 useEffect(() => {
 const session = authService.getCurrentSession();
 if (session && session.user) {
 setCurrentUser(session.user);
 // If Department user (non-admin), default to their department
 if (session.user.role !== 'Admin' && session.user.department_id) {
 setSelectedDept(String(session.user.department_id));
 }
 }
 }, []);

 // Fetch alerts from backend
 const fetchAlerts = useCallback(async () => {
 try {
 setRefreshing(true);
 const data = await dangerActionService.getDangerActions({ limit: 100 });
 setAlerts(data);
 } catch (err) {
 console.error('Failed to load danger actions:', err);
 } finally {
 setLoading(false);
 setRefreshing(false);
 }
 }, []);

 useEffect(() => {
 fetchAlerts();
 const timer = setInterval(fetchAlerts, 10000);
 return () => clearInterval(timer);
 }, [fetchAlerts]);

 // WebSocket Live Push Integration
 useEffect(() => {
 let ws = null;
 try {
 const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
 const host = window.location.hostname || '127.0.0.1';
 ws = new WebSocket(${protocol}//System.Management.Automation.Internal.Host.InternalHost:8000/ws/danger-alerts);

 ws.onmessage = (event) => {
 try {
 const payload = JSON.parse(event.data);
 if (payload.type === 'NEW_DANGER_ALERT' && payload.data) {
 setAlerts((prev) => [payload.data, ...prev.filter(a => a.id !== payload.data.id)]);
 setRecentNotification({
 title: 'CRITICAL THREAT INTERCEPTED',
 message: ${payload.data.person_name} identified at ,
 time: new Date().toLocaleTimeString()
 });
 setTimeout(() => setRecentNotification(null), 8000);
 }
 } catch {
 // Non-JSON ping message
 }
 };
 } catch (e) {
 console.warn('Danger WebSocket unavailable:', e);
 }

 return () => {
 if (ws) ws.close();
 };
 }, []);

 // Status transition handler
 const handleUpdateStatus = async (alertId, newStatus) => {
 try {
 await dangerActionService.updateAlertStatus(alertId, newStatus);
 setAlerts((prev) => 
 prev.map((a) => a.id === alertId ? { ...a, alert_status: newStatus } : a)
 );
 } catch (err) {
 console.error('Failed to update alert status:', err);
 }
 };

 // Simulate Threat Match
 const handleSimulateDetection = async (cameraId = 'CAM002') => {
 try {
 setSimulating(true);
 const res = await dangerActionService.simulateDetection(cameraId);
 if (res && res.data) {
 setAlerts((prev) => [res.data, ...prev.filter(a => a.id !== res.data.id)]);
 setRecentNotification({
 title: 'SIMULATED MATCH TRIGGERED',
 message: ${res.data.person_name} matched at ,
 time: new Date().toLocaleTimeString()
 });
 setTimeout(() => setRecentNotification(null), 6000);
 }
 } catch (err) {
 console.error('Simulation error:', err);
 } finally {
 setSimulating(false);
 }
 };

 // Filtered alerts
 const filteredAlerts = useMemo(() => {
 return alerts.filter((alert) => {
 if (selectedDept !== 'ALL' && String(alert.department_id) !== selectedDept) {
 return false;
 }
 if (selectedStatus !== 'ALL' && alert.alert_status !== selectedStatus) {
 return false;
 }
 if (selectedZone !== 'ALL') {
 const zone = alert.metadata?.zone;
 if (zone !== selectedZone) return false;
 }
 if (searchQuery.trim()) {
 const q = searchQuery.toLowerCase();
 const matchName = alert.person_name?.toLowerCase().includes(q);
 const matchCrime = alert.crime_type?.toLowerCase().includes(q);
 const matchCam = alert.camera_id?.toLowerCase().includes(q);
 const matchLoc = alert.camera_address?.toLowerCase().includes(q);
 if (!matchName && !matchCrime && !matchCam && !matchLoc) {
 return false;
 }
 }
 return true;
 });
 }, [alerts, selectedDept, selectedStatus, selectedZone, searchQuery]);

 const activeCount = alerts.filter(a => a.alert_status === 'ACTIVE').length;
 const dispatchedCount = alerts.filter(a => a.alert_status === 'DISPATCHED').length;
 const resolvedCount = alerts.filter(a => a.alert_status === 'RESOLVED').length;

 return (
 <div className=\space-y-5\>
 {/* Real-time Toast Banner */}
 {recentNotification && (
 <div className=\p-4 rounded-xl bg-gradient-to-r from-rose-950/90 via-red-900/80 to-slate-900 border border-rose-500 shadow-2xl flex items-center justify-between animate-in slide-in-from-top duration-300\>
 <div className=\flex items-center gap-3\>
 <div className=\w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white animate-ping\>
 <AlertOctagon className=\w-5 h-5\ />
 </div>
 <div>
 <div className=\text-xs font-extrabold text-rose-300 uppercase tracking-wider flex items-center gap-2\>
 <span>{recentNotification.title}</span>
 <span className=\text-[10px] text-slate-400 font-normal\>({recentNotification.time})</span>
 </div>
 <div className=\text-sm font-bold text-white\>
 {recentNotification.message}
 </div>
 </div>
 </div>
 <button 
 onClick={() => setRecentNotification(null)}
 className=\text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800/60\
 >
 Dismiss
 </button>
 </div>
 )}

 {/* KPI Counters */}
 <div className=\grid grid-cols-2 sm:grid-cols-4 gap-4\>
 <div className=\bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center gap-3.5 shadow-sm\>
 <div className=\w-11 h-11 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500\>
 <ShieldAlert className=\w-6 h-6\ />
 </div>
 <div>
 <div className=\text-xs text-slate-400 font-medium\>Active Alerts</div>
 <div className=\text-2xl font-black text-rose-400 tracking-tight\>{activeCount}</div>
 </div>
 </div>

 <div className=\bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center gap-3.5 shadow-sm\>
 <div className=\w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400\>
 <Send className=\w-5 h-5\ />
 </div>
 <div>
 <div className=\text-xs text-slate-400 font-medium\>QRU Dispatched</div>
 <div className=\text-2xl font-black text-amber-300 tracking-tight\>{dispatchedCount}</div>
 </div>
 </div>

 <div className=\bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center gap-3.5 shadow-sm\>
 <div className=\w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400\>
 <CheckCircle2 className=\w-5 h-5\ />
 </div>
 <div>
 <div className=\text-xs text-slate-400 font-medium\>Resolved</div>
 <div className=\text-2xl font-black text-emerald-400 tracking-tight\>{resolvedCount}</div>
 </div>
 </div>

 <div className=\bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center gap-3.5 shadow-sm\>
 <div className=\w-11 h-11 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400\>
 <Radio className=\w-5 h-5 animate-pulse\ />
 </div>
 <div>
 <div className=\text-xs text-slate-400 font-medium\>Total Logged</div>
 <div className=\text-2xl font-black text-white tracking-tight\>{alerts.length}</div>
 </div>
 </div>
 </div>

 {/* Filter and Search Bar */}
 <div className=\bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm\>
 <div className=\flex flex-col lg:flex-row lg:items-center justify-between gap-3\>
 {/* Search box */}
 <div className=\relative flex-1\>
 <Search className=\absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400\ />
 <input
 type=\text\
 placeholder=\Search suspect name crime type or camera location...\
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className=\w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors\
 />
 </div>

 {/* Filter Dropdowns */}
 <div className=\flex flex-wrap items-center gap-2\>
 {/* Department Filter */}
 <select
 value={selectedDept}
 onChange={(e) => setSelectedDept(e.target.value)}
 className=\bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500\
 >
 <option value=\ALL\>All Departments</option>
 {DEPARTMENTS.map((d) => (
 <option key={d.id} value={String(d.id)}>{d.name}</option>
 ))}
 </select>

 {/* Zone Filter */}
 <select
 value={selectedZone}
 onChange={(e) => setSelectedZone(e.target.value)}
 className=\bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500\
 >
 <option value=\ALL\>All Zones</option>
 <option value=\Z01\>Zone 01 (West)</option>
 <option value=\Z02\>Zone 02 (East)</option>
 <option value=\Z03\>Zone 03 (North)</option>
 <option value=\Z04\>Zone 04 (South)</option>
 <option value=\Z05\>Zone 05 (Central)</option>
 </select>

 {/* Status Filter */}
 <select
 value={selectedStatus}
 onChange={(e) => setSelectedStatus(e.target.value)}
 className=\bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500\
 >
 <option value=\ALL\>All Statuses</option>
 <option value=\ACTIVE\>Active Only</option>
 <option value=\DISPATCHED\>Dispatched</option>
 <option value=\RESOLVED\>Resolved</option>
 </select>

 {/* Simulate Detection Button */}
 <button
 onClick={() => handleSimulateDetection('CAM002')}
 disabled={simulating}
 className=\bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-md shadow-rose-900/30 disabled:opacity-50 transition-all\
 title=\Simulate OpenCV face match on CAM002\
 >
 <Zap className=\w-3.5 h-3.5\ />
 <span>{simulating ? 'Simulating...' : 'Simulate Match'}</span>
 </button>

 {/* Refresh Button */}
 <button
 onClick={fetchAlerts}
 disabled={refreshing}
 className=\p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors disabled:opacity-50\
 title=\Refresh alerts list\
 >
 <RefreshCw className={w-3.5 h-3.5 } />
 </button>
 </div>
 </div>
 </div>

 {/* Main Alert Table */}
 <div className=\bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl\>
 <div className=\overflow-x-auto\>
 <table className=\w-full text-left text-xs text-slate-300\>
 <thead className=\bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider\>
 <tr>
 <th className=\py-3.5 px-4\>Suspect Details</th>
 <th className=\py-3.5 px-4\>Crime Classification</th>
 <th className=\py-3.5 px-4\>Camera & Location</th>
 <th className=\py-3.5 px-4\>Timestamp</th>
 <th className=\py-3.5 px-4\>Department</th>
 <th className=\py-3.5 px-4\>Alert Status</th>
 <th className=\py-3.5 px-4 text-right\>Operational Action</th>
 </tr>
 </thead>
 <tbody className=\divide-y divide-slate-800/60\>
 {loading ? (
 <tr>
 <td colSpan={7} className=\py-12 text-center text-slate-400\>
 <div className=\flex flex-col items-center justify-center gap-2\>
 <RefreshCw className=\w-6 h-6 animate-spin text-rose-500\ />
 <span>Loading real-time danger actions...</span>
 </div>
 </td>
 </tr>
 ) : filteredAlerts.length === 0 ? (
 <tr>
 <td colSpan={7} className=\py-12 text-center text-slate-400\>
 <div className=\flex flex-col items-center justify-center gap-2\>
 <CheckCircle2 className=\w-8 h-8 text-emerald-400\ />
 <span className=\font-semibold text-slate-200\>No Active Danger Alerts Found</span>
 <span className=\text-xs text-slate-500\>All corridors clear under current filter parameters.</span>
 </div>
 </td>
 </tr>
 ) : (
 filteredAlerts.map((alert) => (
 <tr 
 key={alert.id}
 className={ ransition-colors }
 >
 {/* Suspect Photo & Name */}
 <td className=\py-3.5 px-4\>
 <div className=\flex items-center gap-3\>
 <div className=\relative w-11 h-11 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0 bg-slate-950\>
 {alert.person_photo ? (
 <img 
 src={alert.person_photo} 
 alt={alert.person_name} 
 className=\w-full h-full object-cover\ 
 />
 ) : (
 <div className=\w-full h-full flex items-center justify-center text-slate-600 font-bold\>
 ?
 </div>
 )}
 {alert.alert_status === 'ACTIVE' && (
 <span className=\absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping\></span>
 )}
 </div>
 <div>
 <div className=\font-bold text-white text-sm flex items-center gap-1.5\>
 {alert.person_name}
 </div>
 <div className=\text-[10px] font-mono text-slate-400\>
 {alert.person_id} • Match {alert.metadata?.confidence ? Math.round(alert.metadata.confidence * 100) : 92}%
 </div>
 </div>
 </div>
 </td>

 {/* Crime Type */}
 <td className=\py-3.5 px-4\>
 <span className=\inline-block font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded text-[11px]\>
 {alert.crime_type}
 </span>
 </td>

 {/* Camera & Location */}
 <td className=\py-3.5 px-4\>
 <div className=\font-semibold text-slate-200 flex items-center gap-1.5\>
 <Radio className=\w-3 h-3 text-cyan-400\ />
 <span>{alert.camera_id}</span>
 </div>
 <div className=\text-[11px] text-slate-400 truncate max-w-[220px]\ title={alert.camera_address}>
 {alert.camera_address}
 </div>
 </td>

 {/* Timestamp */}
 <td className=\py-3.5 px-4 text-slate-300\>
 <div className=\flex items-center gap-1\>
 <Clock className=\w-3.5 h-3.5 text-slate-400\ />
 <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
 </div>
 <span className=\text-[10px] text-slate-500 block\>
 {new Date(alert.timestamp).toLocaleDateString()}
 </span>
 </td>

 {/* Department */}
 <td className=\py-3.5 px-4\>
 <span className=\text-slate-300 font-medium\>
 {DEPARTMENTS.find(d => d.id === alert.department_id)?.name || 'Gujarat Police'}
 </span>
 {alert.metadata?.zone && (
 <span className=\text-[10px] text-slate-400 block\>
 Zone: {alert.metadata.zone}
 </span>
 )}
 </td>

 {/* Alert Status */}
 <td className=\py-3.5 px-4\>
 {alert.alert_status === 'ACTIVE' && (
 <span className=\px-2.5 py-1 text-[11px] font-bold rounded-md bg-rose-950 text-rose-300 border border-rose-600 flex items-center gap-1.5 w-max\>
 <span className=\w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse\></span>
 ACTIVE ALERT
 </span>
 )}
 {alert.alert_status === 'DISPATCHED' && (
 <span className=\px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-950 text-amber-300 border border-amber-600 flex items-center gap-1.5 w-max\>
 <Send className=\w-3 h-3\ />
 DISPATCHED
 </span>
 )}
 {alert.alert_status === 'RESOLVED' && (
 <span className=\px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1.5 w-max\>
 <CheckCircle2 className=\w-3 h-3\ />
 RESOLVED
 </span>
 )}
 </td>

 {/* Operational Actions */}
 <td className=\py-3.5 px-4 text-right\>
 <div className=\flex items-center justify-end gap-1.5\>
 {alert.alert_status === 'ACTIVE' && (
 <button
 onClick={() => handleUpdateStatus(alert.id, 'DISPATCHED')}
 className=\bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 px-2.5 rounded text-[11px] flex items-center gap-1 shadow transition-colors\
 title=\Dispatch Quick Response Unit\
 >
 <Send className=\w-3 h-3\ />
 Dispatch QRU
 </button>
 )}

 {alert.alert_status === 'DISPATCHED' && (
 <button
 onClick={() => handleUpdateStatus(alert.id, 'RESOLVED')}
 className=\bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-2.5 rounded text-[11px] flex items-center gap-1 shadow transition-colors\
 title=\Mark alert resolved\
 >
 <CheckCircle2 className=\w-3 h-3\ />
 Resolve
 </button>
 )}

 <Link
 href=\/dashboard\
 className=\p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded border border-slate-700 transition-colors\
 title=\Locate on GIS Map\
 >
 <MapPin className=\w-3.5 h-3.5\ />
 </Link>

 <Link
 href={/cameras?id=}
 className=\p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors\
 title=\View Live Camera Feed\
 >
 <Eye className=\w-3.5 h-3.5\ />
 </Link>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}
