"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  AlertOctagon, 
  ShieldAlert,
  Users, 
  Search, 
  Plus, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  MapPin, 
  Trash2, 
  Sparkles,
  LayoutList,
  GitCommit,
  X,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { 
  dangerActionService, 
  CrimePerson, 
  Incident, 
  IncidentGroup 
} from '@/services/danger-action.service';
import { IncidentTimeline } from '@/components/alerts/IncidentTimeline';

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

const ZONES = [
  { id: 'Z01', name: 'Z01 - SG Highway & West Ahmedabad' },
  { id: 'Z02', name: 'Z02 - Walled City & Kalupur Railway' },
  { id: 'Z03', name: 'Z03 - Gandhinagar Capital & InfoCity' },
  { id: 'Z04', name: 'Z04 - Ring Road & Thaltej Corridor' },
  { id: 'Z05', name: 'Z05 - Sanand Industrial Toll Corridor' },
];

const CRIME_TYPES = [
  'Armed Extortion & Gang Violence',
  'Inter-State Vehicle Theft Ring',
  'Financial Syndicate Fraud',
  'Narcotics Distribution & Contraband',
  'Aggravated Robbery & Assault',
  'Security Perimeter Breach',
  'Industrial Checkpost Alert'
];

export default function DangerActionsPage() {
  const router = useRouter();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'incidents' | 'bureau'>('incidents');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  // Data states
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [timelineGroups, setTimelineGroups] = useState<IncidentGroup[]>([]);
  const [crimePeople, setCrimePeople] = useState<CrimePerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Multi-Filter states
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedCrimeType, setSelectedCrimeType] = useState<string>('ALL');
  const [selectedPerson, setSelectedPerson] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
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
      const [incidentsData, timelineData, peopleData] = await Promise.all([
        dangerActionService.getIncidents({ limit: 100 }),
        dangerActionService.getIncidentTimeline({ limit: 100 }),
        dangerActionService.getCrimePeople(),
      ]);

      setIncidents(incidentsData);
      setTimelineGroups(timelineData);
      setCrimePeople(peopleData);
    } catch (err) {
      console.error('Failed to fetch surveillance data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);
    const interval = setInterval(() => {
      void fetchData();
    }, 12000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchData]);

  // Status transition handler
  const handleUpdateStatus = async (id: string, newStatus: string, notes?: string) => {
    try {
      await dangerActionService.updateIncidentStatus(id, newStatus, notes);
      // Update local incidents
      setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
      // Update local timeline groups
      setTimelineGroups(prev => prev.map(group => ({
        ...group,
        incidents: group.incidents.map(i => i.id === id ? { ...i, status: newStatus } : i)
      })));
      // Also update alerts backend state for compatibility
      await dangerActionService.updateAlertStatus(id, newStatus, notes).catch(() => {});
    } catch (err) {
      console.error('Failed to update status:', err);
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

  const handleResetFilters = () => {
    setSelectedZone('ALL');
    setSelectedCrimeType('ALL');
    setSelectedPerson('ALL');
    setSelectedDept('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
  };

  const hasActiveFilters = 
    selectedZone !== 'ALL' || 
    selectedCrimeType !== 'ALL' || 
    selectedPerson !== 'ALL' || 
    selectedDept !== 'ALL' || 
    selectedStatus !== 'ALL' || 
    searchQuery.trim() !== '';

  // Filtered Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchZone = selectedZone === 'ALL' || inc.zone_id === selectedZone;
      const matchCrime = selectedCrimeType === 'ALL' || inc.crime_type === selectedCrimeType;
      const matchPerson = selectedPerson === 'ALL' || inc.person_id === selectedPerson;
      const matchDept = selectedDept === 'ALL' || inc.department_id === Number(selectedDept);
      const matchStatus = selectedStatus === 'ALL' || inc.status?.toUpperCase() === selectedStatus.toUpperCase();
      const matchQuery = !searchQuery || 
        inc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.person_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.camera_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.crime_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchZone && matchCrime && matchPerson && matchDept && matchStatus && matchQuery;
    });
  }, [incidents, selectedZone, selectedCrimeType, selectedPerson, selectedDept, selectedStatus, searchQuery]);

  // Filtered Timeline Groups
  const filteredTimelineGroups = useMemo(() => {
    return timelineGroups
      .map(group => ({
        ...group,
        incidents: group.incidents.filter(inc => {
          const matchZone = selectedZone === 'ALL' || inc.zone_id === selectedZone;
          const matchCrime = selectedCrimeType === 'ALL' || inc.crime_type === selectedCrimeType;
          const matchPerson = selectedPerson === 'ALL' || inc.person_id === selectedPerson;
          const matchDept = selectedDept === 'ALL' || inc.department_id === Number(selectedDept);
          const matchStatus = selectedStatus === 'ALL' || inc.status?.toUpperCase() === selectedStatus.toUpperCase();
          const matchQuery = !searchQuery || 
            inc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.person_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.camera_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.crime_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inc.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
          return matchZone && matchCrime && matchPerson && matchDept && matchStatus && matchQuery;
        })
      }))
      .filter(group => group.incidents.length > 0);
  }, [timelineGroups, selectedZone, selectedCrimeType, selectedPerson, selectedDept, selectedStatus, searchQuery]);

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
    const active = incidents.filter(i => i.status === 'ACTIVE').length;
    const dispatched = incidents.filter(i => i.status === 'DISPATCHED').length;
    const resolved = incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
    const watchlistCount = crimePeople.length;
    return { active, dispatched, resolved, watchlistCount };
  }, [incidents, crimePeople]);

  return (
    <div className="min-h-screen bg-[#070e1f] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-500 tracking-wider uppercase mb-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            Real-Time Threat Detection & Response Grid
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <AlertOctagon className="w-8 h-8 text-rose-500 flex-shrink-0" />
            Incident Corner & Crime Bureau
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Live chronological intelligence stream of CCTV detections, ANPR telemetry, and face recognitions across Gujarat corridors.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleSimulateDetection('CAM001')}
            disabled={simulating}
            className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold py-2 px-3.5 rounded-lg flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            {simulating ? 'Simulating Detection...' : 'Simulate CCTV Match'}
          </button>

          <Link
            href="/dashboard"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            GIS Threat Map
          </Link>

          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Refresh Incidents"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-rose-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-rose-500/40 rounded-xl p-4 shadow-lg shadow-rose-950/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ACTIVE INCIDENTS</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">
            {stats.active}
          </div>
          <p className="text-[11px] text-rose-400 mt-1">Requires emergency QRU dispatch</p>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 shadow-lg shadow-amber-950/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>QRU DISPATCHED</span>
            <Send className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">
            {stats.dispatched}
          </div>
          <p className="text-[11px] text-amber-400 mt-1">Units intercepting corridor junction</p>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4 shadow-lg shadow-emerald-950/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>RESOLVED INCIDENTS</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">
            {stats.resolved}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Suspects apprehended & verified</p>
        </div>

        <div className="bg-slate-900/90 border border-blue-500/30 rounded-xl p-4 shadow-lg shadow-blue-950/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>BUREAU WATCHLIST</span>
            <Users className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-mono">
            {stats.watchlistCount}
          </div>
          <p className="text-[11px] text-blue-400 mt-1">Wanted offenders indexed in Sentinel</p>
        </div>
      </div>

      {/* Main Navigation Tabs & View Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'incidents'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            Incident Corner
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-950 text-rose-300 border border-rose-700 font-mono">
              {incidents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('bureau')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'bureau'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Crime Bureau Registry
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-blue-950 text-blue-300 border border-blue-700 font-mono">
              {crimePeople.length}
            </span>
          </button>
        </div>

        {/* Right Toolbar: View Mode Toggle or Register Suspect */}
        <div className="flex items-center gap-2 pb-2">
          {activeTab === 'incidents' ? (
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GitCommit className="w-3.5 h-3.5" />
                Timeline View
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'table'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                Table View
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              Register Wanted Suspect
            </button>
          )}
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          {/* Text Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'incidents' ? "Search suspect, camera, junction, notes..." : "Search suspect name, CRM ID, crime..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {activeTab === 'incidents' && (
            <>
              {/* Zone Filter */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400 font-semibold hidden xl:inline">Zone:</span>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
                >
                  <option value="ALL">All Zones</option>
                  {ZONES.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>

              {/* Crime Type Filter */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400 font-semibold hidden xl:inline">Crime:</span>
                <select
                  value={selectedCrimeType}
                  onChange={(e) => setSelectedCrimeType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500 max-w-[180px] truncate"
                >
                  <option value="ALL">All Crime Types</option>
                  {CRIME_TYPES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Suspect Person Filter */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400 font-semibold hidden xl:inline">Suspect:</span>
                <select
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500 max-w-[180px] truncate"
                >
                  <option value="ALL">All Suspects</option>
                  {crimePeople.map(p => (
                    <option key={p.person_id} value={p.person_id}>
                      {p.name} ({p.person_id})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Department Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 font-semibold hidden xl:inline">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 font-semibold hidden xl:inline">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Statuses</option>
              {activeTab === 'incidents' ? (
                <>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DISPATCHED">DISPATCHED</option>
                  <option value="INVESTIGATING">INVESTIGATING</option>
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
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Reset
            </button>
          )}
        </div>

        {/* Active Filters Pill Bar */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-500 font-semibold">Active:</span>
            {selectedZone !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                Zone: {selectedZone}
                <button onClick={() => setSelectedZone('ALL')} className="hover:text-rose-400"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedCrimeType !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                Crime: {selectedCrimeType}
                <button onClick={() => setSelectedCrimeType('ALL')} className="hover:text-rose-400"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedPerson !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                Suspect: {crimePeople.find(p => p.person_id === selectedPerson)?.name || selectedPerson}
                <button onClick={() => setSelectedPerson('ALL')} className="hover:text-rose-400"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedStatus !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                Status: {selectedStatus}
                <button onClick={() => setSelectedStatus('ALL')} className="hover:text-rose-400"><X className="w-3 h-3" /></button>
              </span>
            )}
            <span className="text-slate-400 ml-auto font-mono">
              Showing <strong className="text-white">{activeTab === 'incidents' ? filteredIncidents.length : filteredCrimePeople.length}</strong> results
            </span>
          </div>
        )}
      </div>

      {/* TAB 1: INCIDENT CORNER */}
      {activeTab === 'incidents' && (
        <>
          {viewMode === 'timeline' ? (
            /* TIMELINE VIEW (SCROLLABLE & DATE-GROUPED) */
            <IncidentTimeline
              groups={filteredTimelineGroups}
              loading={loading}
              onUpdateStatus={handleUpdateStatus}
              onOpenFeed={(camId) => router.push(`/cameras?id=${camId}`)}
              onResetFilters={handleResetFilters}
            />
          ) : (
            /* TABLE VIEW */
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                      <th className="py-3 px-4">Suspect / Target</th>
                      <th className="py-3 px-4">Crime Category</th>
                      <th className="py-3 px-4">Camera & Location</th>
                      <th className="py-3 px-4">Zone</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Alert Status</th>
                      <th className="py-3 px-4 text-right">Quick Response Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredIncidents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-500">
                          No incidents match the active filters.
                        </td>
                      </tr>
                    ) : (
                      filteredIncidents.map((inc) => {
                        const isUrgent = inc.status === 'ACTIVE';
                        return (
                          <tr 
                            key={inc.id}
                            className={`hover:bg-slate-800/40 transition-colors ${
                              isUrgent ? 'bg-rose-950/20 border-l-4 border-l-rose-500' : ''
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0">
                                  {inc.person_photo ? (
                                    <img 
                                      src={inc.person_photo} 
                                      alt={inc.person_name || 'Suspect'} 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-rose-400">
                                      <ShieldAlert className="w-5 h-5" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-sm">
                                    {inc.person_name || 'Subject Sighted'}
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {inc.person_id || inc.incident_number}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-200 block">{inc.crime_type}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{inc.severity} Severity</span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-bold text-cyan-400 font-mono flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {inc.camera_id}
                              </span>
                              <span className="text-[11px] text-slate-400 block max-w-xs truncate">
                                {inc.location_name}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                {inc.zone_id || 'Z01'}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-slate-300">
                              <div>{new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              <div className="text-[10px] text-slate-500">{new Date(inc.timestamp).toLocaleDateString()}</div>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase border ${
                                inc.status === 'ACTIVE' 
                                  ? 'bg-rose-950 text-rose-300 border-rose-600' 
                                  : inc.status === 'DISPATCHED'
                                  ? 'bg-amber-950 text-amber-300 border-amber-600'
                                  : 'bg-emerald-950 text-emerald-300 border-emerald-600'
                              }`}>
                                {inc.status}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              {inc.status === 'ACTIVE' && (
                                <button
                                  onClick={() => handleUpdateStatus(inc.id, 'DISPATCHED')}
                                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 px-3 rounded text-xs inline-flex items-center gap-1 shadow"
                                >
                                  <Send className="w-3 h-3" />
                                  Dispatch QRU
                                </button>
                              )}
                              {inc.status === 'DISPATCHED' && (
                                <button
                                  onClick={() => handleUpdateStatus(inc.id, 'RESOLVED')}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded text-xs inline-flex items-center gap-1 shadow"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Resolve
                                </button>
                              )}
                              {inc.status === 'RESOLVED' && (
                                <span className="text-emerald-400 text-xs font-semibold flex items-center justify-end gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                                </span>
                              )}
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
        </>
      )}

      {/* TAB 2: CRIME PEOPLE BUREAU */}
      {activeTab === 'bureau' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCrimePeople.map((person) => (
            <div 
              key={person.person_id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-lg transition-all"
            >
              <div className="p-4 flex items-start gap-3.5">
                {/* Photo with status badge */}
                <div className="relative w-20 h-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex-shrink-0">
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
                    <h3 className="font-bold text-white text-base leading-tight truncate">
                      {person.name}
                    </h3>
                    <button
                      onClick={() => handleDeleteSuspect(person.person_id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete suspect"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                    {person.person_id}
                  </span>

                  <p className="text-xs text-rose-400 font-medium mt-2 line-clamp-2">
                    {person.crime_type}
                  </p>

                  <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span>
                      {DEPARTMENTS.find(d => d.id === person.department_id)?.name.replace('Department', '') || 'Police'}
                    </span>
                    <button
                      onClick={() => handleSimulateDetection('CAM001')}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Add Wanted Suspect to Bureau
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSuspect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name of Suspect *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Jagdish Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Crime Classification *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Organized Extortion, Armed Robbery"
                  value={formData.crime_type}
                  onChange={(e) => setFormData({ ...formData, crime_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alert Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="WANTED">WANTED</option>
                    <option value="HIGH_ALERT">HIGH_ALERT</option>
                    <option value="UNDER_SURVEILLANCE">UNDER_SURVEILLANCE</option>
                    <option value="APPREHENDED">APPREHENDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Suspect Photo (Preset or Direct URL)
                </label>
                <select
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 mb-2"
                >
                  {SAMPLE_PHOTO_PRESETS.map((p, i) => (
                    <option key={i} value={p.url}>{p.label}</option>
                  ))}
                </select>

                <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <img 
                    src={formData.photo} 
                    alt="Preview" 
                    className="w-12 h-12 object-cover rounded border border-slate-700" 
                  />
                  <div className="text-[11px] text-slate-400">
                    Neural embeddings will be generated automatically for facial matching.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
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
