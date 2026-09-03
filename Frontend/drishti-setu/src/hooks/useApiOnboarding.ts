// ============================================================
// DRISHTI SETU — useApiOnboarding Hook
// ============================================================

'use client';

import { useState, useCallback, useEffect } from 'react';
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
import { DEFAULT_FIELD_MAPPINGS } from '@/mock/api-onboarding';
import { apiOnboardingService } from '@/services/api-onboarding.service';
import { cameraService } from '@/services/camera.service';
import { Department } from '@/types/camera';

export const API_ONBOARDING_STEPS = [
  { id: 1, label: 'Connection', description: 'API Connection' },
  { id: 2, label: 'Authentication', description: 'Auth & Security' },
  { id: 3, label: 'Field Mapping', description: 'Field Mapping' },
  { id: 4, label: 'Test & Preview', description: 'Test & Preview' },
  { id: 5, label: 'Sync', description: 'Review & Sync' },
] as const;

const DEFAULT_CONNECTION: ApiConnectionConfig = {
  integration_name: 'Ahmedabad Traffic CCTV',
  department: 'Gujarat Police',
  base_url: 'https://example.gov/api',
  api_version: 'v1',
  endpoint: 'cameras',
};

const DEFAULT_AUTH: ApiAuthConfig = {
  auth_method: 'API_KEY',
  api_key_header: 'X-API-KEY',
  api_key_value: 'demo_gujarat_police_key_8492048',
  bearer_token: '',
  username: '',
  password: '',
};

export function useApiOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Departments for dropdown
  const [departments, setDepartments] = useState<Department[]>([]);

  // Step 1: Connection Form
  const [connectionConfig, setConnectionConfig] = useState<ApiConnectionConfig>(DEFAULT_CONNECTION);
  const [connectionErrors, setConnectionErrors] = useState<Record<string, string>>({});

  // Step 2: Auth Form
  const [authConfig, setAuthConfig] = useState<ApiAuthConfig>(DEFAULT_AUTH);
  const [authErrors, setAuthErrors] = useState<Record<string, string>>({});

  // Step 3: Field Mappings
  const [fieldMappings, setFieldMappings] = useState<FieldMappingItem[]>(DEFAULT_FIELD_MAPPINGS);

  // Step 4: Test & Preview
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);
  const [previewRecords, setPreviewRecords] = useState<PreviewCameraRecord[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);

  // Step 5: Sync
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStepText, setSyncStepText] = useState('');
  const [syncResult, setSyncResult] = useState<ApiSyncResultData | null>(null);

  // Load departments on mount
  useEffect(() => {
    cameraService.getDepartments().then(setDepartments);
  }, []);

  // Update field mapping
  const updateMapping = useCallback((externalField: string, drishtiField: DrishtiCameraField | '') => {
    setFieldMappings((prev) =>
      prev.map((item) => (item.external_field === externalField ? { ...item, drishti_field: drishtiField } : item))
    );
  }, []);

  // Auto-map obvious matches
  const autoMapFields = useCallback(() => {
    setFieldMappings(DEFAULT_FIELD_MAPPINGS);
  }, []);

  // Validate Step 1
  const validateStep1 = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!connectionConfig.integration_name.trim()) errors.integration_name = 'Integration Name is required';
    if (!connectionConfig.department.trim()) errors.department = 'Department is required';
    if (!connectionConfig.base_url.trim()) errors.base_url = 'Base URL is required';
    if (!connectionConfig.api_version.trim()) errors.api_version = 'Version is required';
    if (!connectionConfig.endpoint.trim()) errors.endpoint = 'Endpoint is required';

    setConnectionErrors(errors);
    return Object.keys(errors).length === 0;
  }, [connectionConfig]);

  // Validate Step 2
  const validateStep2 = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (authConfig.auth_method === 'API_KEY' && !authConfig.api_key_value?.trim()) {
      errors.api_key_value = 'API Key is required';
    }
    if (authConfig.auth_method === 'BEARER_TOKEN' && !authConfig.bearer_token?.trim()) {
      errors.bearer_token = 'Bearer Token is required';
    }
    if (authConfig.auth_method === 'BASIC_AUTH') {
      if (!authConfig.username?.trim()) errors.username = 'Username is required';
      if (!authConfig.password?.trim()) errors.password = 'Password is required';
    }

    setAuthErrors(errors);
    return Object.keys(errors).length === 0;
  }, [authConfig]);

  // Validate Step 3
  const validateStep3 = useCallback((): boolean => {
    const { valid } = apiOnboardingService.validateMapping(fieldMappings);
    return valid;
  }, [fieldMappings]);

  // Test Connection in Step 4
  const runTestConnection = useCallback(async () => {
    setIsTesting(true);
    try {
      const result = await apiOnboardingService.testConnection(connectionConfig, authConfig);
      setTestResult(result);
      if (result.success) {
        const records = await apiOnboardingService.fetchPreview(connectionConfig);
        setPreviewRecords(records);
      }
    } finally {
      setIsTesting(false);
    }
  }, [connectionConfig, authConfig]);

  // Run Preview Validation in Step 4
  const runValidateData = useCallback(async () => {
    if (previewRecords.length === 0) return;
    setIsValidating(true);
    try {
      const summary = await apiOnboardingService.validateData(previewRecords);
      setValidationSummary(summary);
    } finally {
      setIsValidating(false);
    }
  }, [previewRecords]);

  // Step 5: Execute Sync
  const runStartSync = useCallback(async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    try {
      const result = await apiOnboardingService.startSync(
        connectionConfig,
        fieldMappings,
        (stepText, progress) => {
          setSyncStepText(stepText);
          setSyncProgress(progress);
        }
      );
      setSyncResult(result);
      setCompletedSteps((prev) => new Set([...prev, 5]));
    } finally {
      setIsSyncing(false);
    }
  }, [connectionConfig, fieldMappings]);

  // Next step navigation
  const nextStep = useCallback(async () => {
    let isValid = true;
    if (currentStep === 1) isValid = validateStep1();
    if (currentStep === 2) isValid = validateStep2();
    if (currentStep === 3) isValid = validateStep3();

    if (!isValid) return;

    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < 5) {
      const target = currentStep + 1;
      setCurrentStep(target);
      // If entering Step 4, trigger connection test automatically if not run
      if (target === 4 && !testResult) {
        runTestConnection();
      }
    }
  }, [currentStep, validateStep1, validateStep2, validateStep3, testResult, runTestConnection]);

  // Prev step navigation
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Direct step jump
  const goToStep = useCallback(
    (step: number) => {
      if (step <= currentStep || completedSteps.has(step)) {
        setCurrentStep(step);
      }
    },
    [currentStep, completedSteps]
  );

  // Reset wizard
  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setConnectionConfig(DEFAULT_CONNECTION);
    setAuthConfig(DEFAULT_AUTH);
    setFieldMappings(DEFAULT_FIELD_MAPPINGS);
    setTestResult(null);
    setPreviewRecords([]);
    setValidationSummary(null);
    setSyncResult(null);
    setSyncProgress(0);
  }, []);

  return {
    currentStep,
    completedSteps,
    departments,
    connectionConfig,
    setConnectionConfig,
    connectionErrors,
    authConfig,
    setAuthConfig,
    authErrors,
    fieldMappings,
    updateMapping,
    autoMapFields,
    isTesting,
    testResult,
    runTestConnection,
    previewRecords,
    isValidating,
    validationSummary,
    runValidateData,
    isSyncing,
    syncProgress,
    syncStepText,
    syncResult,
    runStartSync,
    nextStep,
    prevStep,
    goToStep,
    resetWizard,
  };
}
