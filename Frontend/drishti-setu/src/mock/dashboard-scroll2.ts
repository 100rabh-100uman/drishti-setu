import { Scroll2Data } from '../types/scroll2';

export const mockScroll2Data: Scroll2Data = {
  activities: [
    { id: '1', icon: 'camera', title: 'Camera CAM-GJ-AHM-000421 added', subtitle: 'Gujarat Police • Navrangpura Zone', time: '10 min ago', iconColorClass: 'text-blue-600', iconBgClass: 'bg-blue-50' },
    { id: '2', icon: 'camera', title: 'Camera CAM-GJ-AHM-000188 status changed', subtitle: 'Online → Maintenance', time: '25 min ago', iconColorClass: 'text-green-600', iconBgClass: 'bg-green-50' },
    { id: '3', icon: 'upload', title: 'Bulk import completed successfully', subtitle: '482 cameras imported', time: '1 hr ago', iconColorClass: 'text-blue-600', iconBgClass: 'bg-blue-50' },
    { id: '4', icon: 'map-pin', title: 'Coverage assessment updated', subtitle: 'Ahmedabad West Zone', time: '2 hr ago', iconColorClass: 'text-blue-600', iconBgClass: 'bg-blue-50' },
    { id: '5', icon: 'wrench', title: 'Maintenance request resolved', subtitle: 'CAM-GJ-AHM-000256', time: '3 hr ago', iconColorClass: 'text-amber-600', iconBgClass: 'bg-amber-50' },
    { id: '6', icon: 'shield', title: 'New department access granted', subtitle: 'Traffic Management Unit', time: '6 hr ago', iconColorClass: 'text-green-600', iconBgClass: 'bg-green-50' },
  ],
  coverage: {
    coveragePercentage: 82,
    gapPercentage: 18,
    priorityGaps: 245,
    mediumPriority: 312,
    lowPriority: 97,
    priorityZones: [
      { name: 'West Zone', priority: 'High' },
      { name: 'East Zone', priority: 'Medium' },
      { name: 'North Zone', priority: 'Medium' },
      { name: 'Rural Zone', priority: 'Low' },
    ]
  },
  ageing: {
    camerasOver5Years: 24,
    percentageOfTotal: 0.19,
    items: [
      { label: 'Infrastructure Assets', count: 8, status: 'Need Attention', statusColorClass: 'text-amber-600 bg-amber-50' },
      { label: 'End of Life Cameras', count: 3, status: 'Critical', statusColorClass: 'text-red-600 bg-red-50' },
      { label: 'Firmware Outdated', count: 12, status: 'Update Required', statusColorClass: 'text-orange-600 bg-orange-50' },
      { label: 'Storage Nearing Limit', count: 6, status: 'Review', statusColorClass: 'text-blue-600 bg-blue-50' },
    ]
  },
  onboarding: {
    percentageOnboarded: 86,
    manualRequests: 8,
    bulkImports: 3,
    apiSystemSync: 5,
    needsReview: 17,
    failedRecords: 4,
    completed: 12,
  },
  integrations: [
    { id: 'police', name: 'Police Network', status: 'Connected', lastSync: '2 min ago', icon: 'wifi', colorClass: 'text-blue-600', bgClass: 'bg-blue-50' },
    { id: 'nic', name: 'NIC / State DC', status: 'Connected', lastSync: '5 min ago', icon: 'server', colorClass: 'text-blue-600', bgClass: 'bg-blue-50' },
    { id: 'dept', name: 'Department Systems', status: 'Configured', lastSync: '1 hr ago', icon: 'box', colorClass: 'text-blue-600', bgClass: 'bg-blue-50' },
    { id: 'gis', name: 'GIS Services', status: 'Active', lastSync: '30 sec ago', icon: 'map', colorClass: 'text-green-600', bgClass: 'bg-green-50' },
    { id: 'api', name: 'Registry API', status: 'Ready', lastSync: '10 sec ago', icon: 'database', colorClass: 'text-green-600', bgClass: 'bg-green-50' },
  ],
  registryQuality: {
    overallScore: 96.7,
    validRecords: 96.7,
    duplicateRecords: 1.2,
    incompleteRecords: 2.1,
    invalidRecords: 0.4,
  },
  departments: [
    { name: 'Surat City Police', count: 2842 },
    { name: 'Ahmedabad City Police', count: 2156 },
    { name: 'Vadodara City Police', count: 1842 },
    { name: 'Rajkot City Police', count: 1324 },
    { name: 'Gandhinagar Police', count: 956 },
  ],
  healthTrend: [
    { date: '20 May', online: 11000, offline: 1000, maintenance: 300, degraded: 200 },
    { date: '21 May', online: 11200, offline: 800, maintenance: 310, degraded: 210 },
    { date: '22 May', online: 11100, offline: 900, maintenance: 320, degraded: 220 },
    { date: '23 May', online: 11500, offline: 600, maintenance: 290, degraded: 200 },
    { date: '24 May', online: 11600, offline: 500, maintenance: 280, degraded: 190 },
    { date: '25 May', online: 11800, offline: 400, maintenance: 270, degraded: 180 },
    { date: '26 May', online: 11930, offline: 632, maintenance: 280, degraded: 193 },
  ],
  maintenance: {
    underMaintenance: 280,
    trendPercentage: 1.8,
    openRequests: 48,
    inProgress: 122,
    resolved: 110,
  }
};
