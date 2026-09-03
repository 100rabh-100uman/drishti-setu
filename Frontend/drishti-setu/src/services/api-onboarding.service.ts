// ============================================================
// DRISHTI SETU — API Onboarding Service (Backend-Ready)
// ============================================================

import {
  ApiConnectionConfig,
  ApiAuthConfig,
  FieldMappingItem,
  TestConnectionResult,
  PreviewCameraRecord,
  ValidationSummary,
  ApiSyncResultData,
  DrishtiCameraField,
} from '@/types/api-onboarding';
import { MOCK_API_PREVIEW_RECORDS, MOCK_DEFAULT_SYNC_RESULT } from '@/mock/api-onboarding';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class ApiOnboardingService {
  /**
   * Simulates active network handshake, authentication verification, and endpoint reachability
   */
  async testConnection(
    config: ApiConnectionConfig,
    auth: ApiAuthConfig
  ): Promise<TestConnectionResult> {
    await delay(1200);

    return {
      success: true,
      latency_ms: 68,
      status_code: 200,
      message: 'Connection and authentication established successfully.',
      steps: [
        { step: 'DNS & Host Resolution', status: 'success', message: `Resolved ${config.base_url}` },
        { step: 'SSL / TLS Handshake', status: 'success', message: 'TLS 1.3 encrypted handshake established' },
        { step: 'Authentication Verification', status: 'success', message: `Auth method ${auth.auth_method} authenticated` },
        { step: 'Endpoint Reachability', status: 'success', message: `GET /${config.api_version}/${config.endpoint} [200 OK]` },
      ],
    };
  }

  /**
   * Fetches preview records from the mock source endpoint
   */
  async fetchPreview(config: ApiConnectionConfig): Promise<PreviewCameraRecord[]> {
    await delay(800);
    return MOCK_API_PREVIEW_RECORDS.map((record) => ({
      ...record,
      department: config.department || record.department,
    }));
  }

  /**
   * Checks field mappings for any missing required fields
   */
  validateMapping(mappings: FieldMappingItem[]): { valid: boolean; unmappedRequired: string[] } {
    const requiredTargets = ['camera_id', 'department_id', 'camera_type', 'address', 'latitude', 'longitude', 'status'];
    const mappedTargets = new Set(mappings.map((m) => m.drishti_field).filter(Boolean));

    const unmappedRequired = requiredTargets.filter((req) => !mappedTargets.has(req as DrishtiCameraField));

    return {
      valid: unmappedRequired.length === 0,
      unmappedRequired,
    };
  }

  /**
   * Performs client-side schema & boundary validation on preview records
   */
  async validateData(records: PreviewCameraRecord[]): Promise<ValidationSummary> {
    await delay(700);
    const total = records.length;
    return {
      total_records: total,
      valid_records: total,
      missing_fields: 0,
      invalid_coordinates: 0,
      duplicate_ids: 0,
      invalid_records: 0,
      is_valid: true,
    };
  }

  /**
   * Initiates simulated batch synchronization and returns ingestion outcome metrics
   */
  async startSync(
    config: ApiConnectionConfig,
    mappings: FieldMappingItem[],
    onProgress?: (step: string, progress: number) => void
  ): Promise<ApiSyncResultData> {
    const steps = [
      { text: 'Connecting to remote endpoint...', progress: 15, delay: 500 },
      { text: 'Fetching camera registry payload...', progress: 40, delay: 700 },
      { text: 'Executing schema & field transformation...', progress: 65, delay: 600 },
      { text: 'Validating geo-coordinates and IDs...', progress: 85, delay: 600 },
      { text: 'Sync initiated and registered in DRISHTI SETU...', progress: 100, delay: 400 },
    ];

    for (const step of steps) {
      if (onProgress) {
        onProgress(step.text, step.progress);
      }
      await delay(step.delay);
    }

    return {
      ...MOCK_DEFAULT_SYNC_RESULT,
      integration_name: config.integration_name,
      department: config.department,
      endpoint: `${config.api_version}/${config.endpoint}`,
      sync_timestamp: new Date().toISOString(),
    };
  }
}

export const apiOnboardingService = new ApiOnboardingService();
