export interface ActivityItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  iconColorClass: string;
  iconBgClass: string;
}

export interface PriorityZone {
  name: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface CoverageData {
  coveragePercentage: number;
  gapPercentage: number;
  priorityGaps: number;
  mediumPriority: number;
  lowPriority: number;
  priorityZones: PriorityZone[];
}

export interface AgeingItem {
  label: string;
  count: number;
  status: string;
  statusColorClass: string;
}

export interface AgeingData {
  camerasOver5Years: number;
  percentageOfTotal: number;
  items: AgeingItem[];
}

export interface OnboardingData {
  percentageOnboarded: number;
  manualRequests: number;
  bulkImports: number;
  apiSystemSync: number;
  needsReview: number;
  failedRecords: number;
  completed: number;
}

export interface IntegrationSystem {
  id: string;
  name: string;
  status: 'Connected' | 'Configured' | 'Active' | 'Ready';
  lastSync: string;
  icon: string;
  colorClass: string;
  bgClass: string;
}

export interface RegistryQuality {
  overallScore: number;
  validRecords: number;
  duplicateRecords: number;
  incompleteRecords: number;
  invalidRecords: number;
}

export interface DepartmentDistribution {
  name: string;
  count: number;
}

export interface HealthTrendPoint {
  date: string;
  online: number;
  offline: number;
  maintenance: number;
  degraded: number;
}

export interface MaintenanceSummary {
  underMaintenance: number;
  trendPercentage: number;
  openRequests: number;
  inProgress: number;
  resolved: number;
}

export interface Scroll2Data {
  activities: ActivityItem[];
  coverage: CoverageData;
  ageing: AgeingData;
  onboarding: OnboardingData;
  integrations: IntegrationSystem[];
  registryQuality: RegistryQuality;
  departments: DepartmentDistribution[];
  healthTrend: HealthTrendPoint[];
  maintenance: MaintenanceSummary;
}
