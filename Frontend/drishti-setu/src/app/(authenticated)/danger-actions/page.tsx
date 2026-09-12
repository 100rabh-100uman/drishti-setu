"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  AlertOctagon, 
  ShieldAlert, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Radio, 
  Eye, 
  Trash2, 
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { dangerActionService, DangerAction, CrimePerson } from '@/services/danger-action.service';

const SAMPLE_PHOTO_PRESETS = [
  { label: 'Suspect 1 (Male 30s)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' },
  { label: 'Suspect 2 (Male 40s)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face' },
  { label: 'Suspect 3 (Male 20s)', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&crop=face' },
  { label: 'Suspect 4 (Male 50s)', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face' },
  { label: 'Suspect 5 (Female 30s)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face' },
];

const DEPARTMENTS = [
  { id: 1, name: 'Gujarat Police Department' },
  { id: 2, name: 'Gujarat Traffic Branch' },
  { id: 3, name: 'Disaster Management Authority (GSDMA)' },
  { id: 4, name: 'Ahmedabad Municipal Corporation (AMC)' },
  { id: 5, name: 'Gandhinagar Municipal Corporation (GMC)' },
];

export default function DangerActionsPage() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'alerts' | 'bureau'>('alerts');

  // Data states
  const [alerts, setAlerts] = useState<DangerAction[]>([]);
  const [crimePeople, setCrimePeople] = useState<CrimePerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Filter states
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    crime_type: '',
    department_id: 1,
    status: 'WANTED',
    photo: SAMPLE_PHOTO_PRESETS[0].url,
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [alertsData, peopleData] = await Promise.all([
        dangerActionService.getDangerActions({ limit: 100 }),
        dangerActionService.getCrimePeople(),
      ]);
      setAlerts(alertsData);
      setCrimePeople(peopleData);
    } catch (err) {
      console.error('Failed to fetch danger action data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh every 12 seconds
    const interval = setInterval(fetchData, 12000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Status transition handler
  const handleUpdateStatus = async (alertId: string, newStatus: string) => {
    try {
      await dangerActionService.updateAlertStatus(alertId, newStatus);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, alert_status: newStatus } : a));
    } catch (err) {
      console.error('Failed to update alert status:', err);
    }
  };

  // Simulate CCTV detection match
  const handleSimulateDetection = async (cameraId: string = 'CAM001') => {
    try {
      setSimulating(true);
      await dangerActionService.simulateDetection(cameraId);
      await fetchData();
    } catch (err) {
      console.error('Failed to simulate detection:', err);
    } finally {
      setSimulating(false);
    }
  };

  // Add suspect handler
  const handleAddSuspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.crime_type) return;

    try {
      await dangerActionService.addCrimePerson({
        name: formData.name,
        crime_type: formData.crime_type,
        department_id: Number(formData.department_id),
        status: formData.status,
        photo: formData.photo,
      });
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        crime_type: '',
        department_id: 1,
        status: 'WANTED',
        photo: SAMPLE_PHOTO_PRESETS[0].url,
      });
      fetchData();
    } catch (err) {
      console.error('Failed to add suspect:', err);
    }
  };

  // Delete suspect
  const handleDeleteSuspect = async (personId: string) => {
    if (!confirm(`Are you sure you want to remove suspect ${personId} from the active watchlist?`)) return;
    try {
      await dangerActionService.deleteCrimePerson(personId);
      setCrimePeople(prev => prev.filter(p => p.person_id !== personId));
    } catch (err) {
      console.error('Failed to delete suspect:', err);
    }
  };

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchDept = selectedDept === 'ALL' || a.department_id === Number(selectedDept);
      const matchStatus = selectedStatus === 'ALL' || a.alert_status?.toUpperCase() === selectedStatus.toUpperCase();
      const matchZone = selectedZone === 'ALL' || (a.metadata?.zone && a.metadata.zone === selectedZone);
      const matchQuery = !searchQuery || 
        a.person_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.camera_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.crime_type?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchStatus && matchZone && matchQuery;
    });
  }, [alerts, selectedDept, selectedStatus, selectedZone, searchQuery]);

  // Filtered crime bureau
  const filteredCrimePeople = useMemo(() => {
    return crimePeople.filter(p => {
      const matchDept = selectedDept === 'ALL' || p.department_id === Number(selectedDept);
      const matchStatus = selectedStatus === 'ALL' || p.status?.toUpperCase() === selectedStatus.toUpperCase();
      const matchQuery = !searchQuery || 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.person_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.crime_type?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchStatus && matchQuery;
    });
  }, [crimePeople, selectedDept, selectedStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const active = alerts.filter(a => a.alert_status === 'ACTIVE').length;
    const dispatched = alerts.filter(a => a.alert_status === 'DISPATCHED').length;
    const resolved = alerts.filter(a => a.alert_status === 'RESOLVED').length;
    const watchlistCount = crimePeople.length;
    return { active, dispatched, resolved, watchlistCount };
  }, [alerts, crimePeople]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#070e1f] text-slate-800 dark:text-slate-100 p-6 space-y-6">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-500 tracking-wider uppercase mb-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            Real-Time Threat Detection Grid
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <AlertOctagon className="w-8 h-8 text-rose-500" />
            Danger Actions & Crime Bureau
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Automated OpenCV neural face recognition matched against Gujarat Police State Wanted Registry.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleSimulateDetection('CAM001')}
            disabled={simulating}
            className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 shadow-md shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            {simulating ? 'Simulating...' : 'Simulate CCTV Match'}
          </button>

          <Link
            href="/dashboard"
            className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold py-2.5 px-3.5 rounded-lg flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
          >
            <MapPin className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            GIS Threat Map
          </Link>

          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/90 border border-rose-200 dark:border-rose-500/40 rounded-xl p-4 shadow-xs dark:shadow-lg dark:shadow-rose-950/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>ACTIVE INCIDENTS</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">
            {stats.active}
          </div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">Requires immediate response unit</p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 shadow-xs dark:shadow-lg dark:shadow-amber-950/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>QRU DISPATCHED</span>
            <Send className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">
            {stats.dispatched}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">Units en route to junction</p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 shadow-xs dark:shadow-lg dark:shadow-emerald-950/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>RESOLVED TODAY</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">
            {stats.resolved}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Suspects apprehended / cleared</p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4 shadow-xs dark:shadow-lg dark:shadow-blue-950/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>BUREAU WATCHLIST</span>
            <Users className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">
            {stats.watchlistCount}
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">High-priority targets indexed</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'alerts'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            Live Danger Actions
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700 font-bold">
              {alerts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('bureau')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'bureau'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Crime People Bureau
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 font-bold">
              {crimePeople.length}
            </span>
          </button>
        </div>

        {activeTab === 'bureau' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mb-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3.5 rounded-lg flex items-center gap-1.5 shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            Register Suspect
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'alerts' ? "Search suspect, camera ID, crime..." : "Search name, ID, crime type..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            {activeTab === 'alerts' ? (
              <>
                <option value="ACTIVE">ACTIVE</option>
                <option value="DISPATCHED">DISPATCHED</option>
                <option value="RESOLVED">RESOLVED</option>
              </>
            ) : (
              <>
                <option value="WANTED">WANTED</option>
                <option value="HIGH_ALERT">HIGH_ALERT</option>
                <option value="UNDER_SURVEILLANCE">UNDER_SURVEILLANCE</option>
                <option value="APPREHENDED">APPREHENDED</option>
              </>
            )}
          </select>

          {/* Zone Filter (Alerts Tab only) */}
          {activeTab === 'alerts' && (
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Zones</option>
              <option value="Z01">Z01 - SG Highway & West</option>
              <option value="Z02">Z02 - Walled City & Kalupur</option>
              <option value="Z03">Z03 - Gandhinagar Capital</option>
              <option value="Z04">Z04 - Ring Road Corridor</option>
            </select>
          )}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="text-slate-900 dark:text-white font-bold">{activeTab === 'alerts' ? filteredAlerts.length : filteredCrimePeople.length}</span> records
        </div>
      </div>

      {/* TAB 1: Live Danger Actions Feed */}
      {activeTab === 'alerts' && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs dark:shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4">Suspect</th>
                  <th className="py-3 px-4">Crime Category</th>
                  <th className="py-3 px-4">Camera & Location</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Alert Status</th>
                  <th className="py-3 px-4 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No danger action alerts match current filters.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert) => {
                    const isUrgent = alert.alert_status === 'ACTIVE';
                    return (
                      <tr 
                        key={alert.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                          isUrgent ? 'bg-rose-50/70 dark:bg-rose-950/20 border-l-4 border-l-rose-500' : ''
                        }`}
                      >
                        {/* Suspect Photo & Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex-shrink-0 relative">
                              {alert.person_photo ? (
                                <img 
                                  src={alert.person_photo} 
                                  alt={alert.person_name || 'Suspect'} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-rose-500">
                                  <ShieldAlert className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-sm leading-tight flex items-center gap-1.5">
                                {alert.person_name || 'Unidentified Suspect'}
                                {isUrgent && (
                                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                )}
                              </div>
                              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                {alert.person_id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Crime Category */}
                        <td className="py-3.5 px-4">
                          <span className="text-slate-800 dark:text-slate-300 font-medium block">
                            {alert.crime_type || 'Dangerous Person Identified'}
                          </span>
                          {alert.metadata?.confidence && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                              {Math.round(alert.metadata.confidence * 100)}% Match
                            </span>
                          )}
                        </td>

                        {/* Camera & Location */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-blue-600 dark:text-cyan-400 font-bold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-500 flex-shrink-0" />
                            {alert.camera_id}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block max-w-xs truncate">
                            {alert.camera_address || (alert.metadata?.junction || 'Surveillance Junction')}
                          </span>
                        </td>

                        {/* Timestamp */}
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                            {new Date(alert.timestamp).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Department */}
                        <td className="py-3.5 px-4">
                          <span className="text-slate-800 dark:text-slate-300 font-medium">
                            {DEPARTMENTS.find(d => d.id === alert.department_id)?.name || 'Gujarat Police'}
                          </span>
                          {alert.metadata?.zone && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              Zone: {alert.metadata.zone}
                            </span>
                          )}
                        </td>

                        {/* Alert Status */}
                        <td className="py-3.5 px-4">
                          {alert.alert_status === 'ACTIVE' && (
                            <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-600 flex items-center gap-1.5 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                              ACTIVE ALERT
                            </span>
                          )}
                          {alert.alert_status === 'DISPATCHED' && (
                            <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-600 flex items-center gap-1.5 w-max">
                              <Send className="w-3 h-3" />
                              DISPATCHED
                            </span>
                          )}
                          {alert.alert_status === 'RESOLVED' && (
                            <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-600 flex items-center gap-1.5 w-max">
                              <CheckCircle2 className="w-3 h-3" />
                              RESOLVED
                            </span>
                          )}
                        </td>

                        {/* Operational Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {alert.alert_status === 'ACTIVE' && (
                              <button
                                onClick={() => handleUpdateStatus(alert.id, 'DISPATCHED')}
                                className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 px-2.5 rounded text-[11px] flex items-center gap-1 shadow transition-colors"
                              >
                                <Send className="w-3 h-3" />
                                Dispatch QRU
                              </button>
                            )}

                            {alert.alert_status === 'DISPATCHED' && (
                              <button
                                onClick={() => handleUpdateStatus(alert.id, 'RESOLVED')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-2.5 rounded text-[11px] flex items-center gap-1 shadow transition-colors"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Resolve
                              </button>
                            )}

                            <Link
                              href="/dashboard"
                              className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-cyan-400 rounded border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
                              title="Locate on GIS Map"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </Link>

                            <Link
                              href={`/cameras?id=${alert.camera_id}`}
                              className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
                              title="View Camera Stream"
                            >
                              <Eye className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* TAB 2: Crime People Bureau Registry */}
      {activeTab === 'bureau' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCrimePeople.map((person) => (
            <div 
              key={person.person_id}
              className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl overflow-hidden shadow-xs dark:shadow-lg transition-all"
            >
              <div className="p-4 flex items-start gap-3.5">
                {/* Photo with status badge */}
                <div className="relative w-20 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 flex-shrink-0">
                  <img 
                    src={person.photo} 
                    alt={person.name} 
                    className="w-full h-full object-cover" 
                  />
                  <div className={`absolute bottom-0 inset-x-0 text-[8px] font-bold text-center text-white uppercase py-0.5 ${
                    person.status === 'WANTED' ? 'bg-rose-600' :
                    person.status === 'HIGH_ALERT' ? 'bg-amber-600' :
                    person.status === 'UNDER_SURVEILLANCE' ? 'bg-blue-600' : 'bg-slate-600'
                  }`}>
                    {person.status}
                  </div>
                </div>

                {/* Suspect details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight truncate">
                      {person.name}
                    </h3>
                    <button
                      onClick={() => handleDeleteSuspect(person.person_id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      title="Delete suspect"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5">
                    {person.person_id}
                  </span>

                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-2 line-clamp-2">
                    {person.crime_type}
                  </p>

                  <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <span>
                      {DEPARTMENTS.find(d => d.id === person.department_id)?.name.replace('Department', '') || 'Police'}
                    </span>
                    <button
                      onClick={() => handleSimulateDetection('CAM001')}
                      className="text-blue-600 dark:text-cyan-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      Test Match <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Register Suspect */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                Add Wanted Suspect to Bureau
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSuspect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name of Suspect *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Jagdish Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Crime Classification *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Organized Extortion, Armed Robbery"
                  value={formData.crime_type}
                  onChange={(e) => setFormData({ ...formData, crime_type: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alert Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="WANTED">WANTED</option>
                    <option value="HIGH_ALERT">HIGH_ALERT</option>
                    <option value="UNDER_SURVEILLANCE">UNDER_SURVEILLANCE</option>
                    <option value="APPREHENDED">APPREHENDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Suspect Photo (Preset or Direct URL)
                </label>
                <select
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 mb-2"
                >
                  {SAMPLE_PHOTO_PRESETS.map((p, i) => (
                    <option key={i} value={p.url}>{p.label}</option>
                  ))}
                </select>

                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <img 
                    src={formData.photo} 
                    alt="Preview" 
                    className="w-12 h-12 object-cover rounded border border-slate-200 dark:border-slate-700" 
                  />
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Neural embeddings will be generated automatically for facial matching.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                >
                  Register in Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
