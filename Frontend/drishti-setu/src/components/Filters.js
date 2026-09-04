"use client";

import React from 'react';
import { 
  Filter, 
  Search, 
  X, 
  RotateCcw, 
  Building2, 
  MapPin, 
  Video, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function Filters({
  departments = [],
  zones = [],
  selectedDepartment = '',
  onDepartmentChange,
  selectedZone = '',
  onZoneChange,
  selectedType = 'ALL',
  onTypeChange,
  selectedStatus = 'ALL',
  onStatusChange,
  searchQuery = '',
  onSearchChange,
  onReset,
  totalCount = 0,
  filteredCount = 0
}) {
  const isFiltered = 
    selectedDepartment !== '' || 
    selectedZone !== '' || 
    selectedType !== 'ALL' || 
    selectedStatus !== 'ALL' || 
    Boolean(searchQuery.trim());

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { value: 'Active', label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-300', dot: 'bg-emerald-500' },
    { value: 'Inactive', label: 'Inactive / Offline', color: 'bg-rose-50 text-rose-700 border-rose-300', dot: 'bg-rose-500' },
    { value: 'Maintenance', label: 'Maintenance', color: 'bg-amber-50 text-amber-700 border-amber-300', dot: 'bg-amber-500' },
    { value: 'Needs Review', label: 'Needs Review', color: 'bg-blue-50 text-blue-700 border-blue-300', dot: 'bg-blue-500' }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl p-4 shadow-sm space-y-4">
      {/* Top Header with search and reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              GIS Filter Controls
            </h3>
            <p className="text-[11px] text-slate-500">
              Showing <span className="font-semibold text-blue-600">{filteredCount}</span> of {totalCount} deployed cameras
            </p>
          </div>
        </div>

        {/* Quick Search */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial sm:min-w-[260px]">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Camera ID, address, IP..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {isFiltered && (
            <button
              onClick={onReset}
              title="Reset all filters"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex-shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Department Dropdown */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <Building2 className="w-3 h-3 text-slate-400" />
            Department
          </label>
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="w-full text-xs bg-slate-50/80 hover:bg-slate-50 text-slate-700 font-medium py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">All 26 Predefined Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name || `Department ${dept.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Zone Dropdown */}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <MapPin className="w-3 h-3 text-slate-400" />
            Surveillance Zone
          </label>
          <div className="relative">
            <select
              value={selectedZone}
              onChange={(e) => onZoneChange(e.target.value)}
              className="w-full text-xs bg-slate-50/80 hover:bg-slate-50 text-slate-700 font-medium py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">All Gujarat CCTV Zones</option>
              {zones.map((zone) => (
                <option key={zone.zone_id || zone.id} value={zone.zone_id || zone.id}>
                  {zone.zone_id ? `[${zone.zone_id}] ` : ''}{zone.name || `Zone ${zone.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Camera Type Filter */}
        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <Video className="w-3 h-3 text-slate-400" />
            Camera Architecture
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'IP', label: 'IP Cameras' },
              { id: 'Analog', label: 'Analog' }
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => onTypeChange(type.id)}
                className={`py-1 text-center text-xs font-semibold rounded-md transition-all ${
                  selectedType === type.id
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
          Operational Status Filter
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {statusOptions.map((status) => {
            const isSelected = selectedStatus === status.value;
            return (
              <button
                key={status.value}
                type="button"
                onClick={() => onStatusChange(status.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isSelected
                    ? `${status.color} ring-2 ring-blue-500/20 shadow-sm`
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {status.dot && (
                  <span className={`w-2 h-2 rounded-full ${status.dot} ${isSelected ? 'animate-pulse' : ''}`}></span>
                )}
                {status.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
