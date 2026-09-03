export interface KpiSummary {
  totalCameras: number;
  totalCamerasTrend: number;
  onlineCameras: number;
  onlineCamerasPercentage: number;
  onlineCamerasTrend: number;
  offlineCameras: number;
  offlineCamerasPercentage: number;
  offlineCamerasTrend: number;
  underMaintenance: number;
  underMaintenancePercentage: number;
  underMaintenanceTrend: number;
  needsReview: number;
  needsReviewPercentage: number;
  needsReviewTrend: number;
}

export interface HealthData {
  online: number;
  offline: number;
  degraded: number;
  maintenance: number;
  unknown: number;
  history: { day: string; percentage: number }[];
}

export interface AttentionItem {
  id: string;
  type: 'offline' | 'maintenance' | 'review' | 'onboarding';
  count: number;
  title: string;
  subtitle: string;
  priority: 'red' | 'orange' | 'amber' | 'blue';
  link: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  link: string;
  color: string;
}

export interface DashboardData {
  kpi: KpiSummary;
  health: HealthData;
  attentionItems: AttentionItem[];
  quickActions: QuickAction[];
}
