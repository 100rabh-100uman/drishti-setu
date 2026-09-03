// ============================================================
// DRISHTI SETU — useAddCameraForm Hook
// ============================================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CameraFormData, CameraCreateResponse, Department, Zone } from '@/types/camera';
import { cameraFormSchema, STEP_SCHEMAS } from '@/schemas/camera.schema';
import { cameraService } from '@/services/camera.service';

export const FORM_STEPS = [
  { id: 1, label: 'Identity', description: 'Camera Identity' },
  { id: 2, label: 'Location', description: 'Department & Location' },
  { id: 3, label: 'Connectivity', description: 'Camera & Network' },
  { id: 4, label: 'Status', description: 'Status & Review' },
  { id: 5, label: 'Review', description: 'Confirm & Create' },
] as const;

const DEFAULT_VALUES: CameraFormData = {
  camera_id: '',
  serial_number: '',
  device_uuid: '',
  department: '',
  zone: '',
  address: '',
  latitude: '',
  longitude: '',
  camera_type: '',
  mac_address: '',
  ip_address: '',
  status: '',
  needs_review: false,
};

// Fields belonging to each step (for per-step validation)
const STEP_FIELDS: (keyof CameraFormData)[][] = [
  ['camera_id', 'serial_number', 'device_uuid'],
  ['department', 'zone', 'address', 'latitude', 'longitude'],
  ['camera_type', 'mac_address', 'ip_address'],
  ['status', 'needs_review'],
  [], // Review step — no fields
];

export interface UseAddCameraFormReturn {
  form: UseFormReturn<CameraFormData>;
  currentStep: number;
  completedSteps: Set<number>;
  isSubmitting: boolean;
  submitResult: CameraCreateResponse | null;
  departments: Department[];
  zones: Zone[];
  loadingZones: boolean;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  goToStep: (step: number) => void;
  handleSubmit: () => Promise<void>;
  saveDraft: () => void;
  resetForm: () => void;
  loadDepartmentZones: (departmentName: string) => Promise<void>;
}

export function useAddCameraForm(): UseAddCameraFormReturn {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<CameraCreateResponse | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);

  const form = useForm<CameraFormData>({
    resolver: zodResolver(cameraFormSchema) as any,
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
  });

  // Load departments on mount
  useEffect(() => {
    cameraService.getDepartments().then(setDepartments);
  }, []);

  // Load draft on mount
  useEffect(() => {
    const draft = cameraService.getDraft();
    if (draft?.data) {
      const merged = { ...DEFAULT_VALUES, ...draft.data };
      form.reset(merged);
      // If department was saved, load its zones
      if (merged.department) {
        const dept = departments.find(d => d.name === merged.department);
        if (dept) {
          cameraService.getZonesByDepartment(dept.id).then(setZones);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departments]);

  // Load zones when department changes
  const loadDepartmentZones = useCallback(async (departmentName: string) => {
    const dept = departments.find(d => d.name === departmentName);
    if (!dept) {
      setZones([]);
      return;
    }
    setLoadingZones(true);
    try {
      const fetchedZones = await cameraService.getZonesByDepartment(dept.id);
      setZones(fetchedZones);
    } finally {
      setLoadingZones(false);
    }
  }, [departments]);

  // Validate current step fields
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const fields = STEP_FIELDS[currentStep - 1];
    if (fields.length === 0) return true;

    const result = await form.trigger(fields);
    return result;
  }, [currentStep, form]);

  const nextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    // Can go to any completed step, or the next uncompleted step
    if (step <= currentStep || completedSteps.has(step) || step === Math.min(...Array.from({ length: 5 }, (_, i) => i + 1).filter(s => !completedSteps.has(s)))) {
      setCurrentStep(step);
    }
  }, [currentStep, completedSteps]);

  const handleSubmit = useCallback(async () => {
    // Validate all fields before submission
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const data = form.getValues();
      const result = await cameraService.createCamera(data);
      setSubmitResult(result);
      setCompletedSteps(prev => new Set([...prev, 5]));
    } catch (error) {
      console.error('Failed to create camera:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [form]);

  const saveDraft = useCallback(() => {
    const data = form.getValues();
    cameraService.saveDraft(data);
  }, [form]);

  const resetForm = useCallback(() => {
    form.reset(DEFAULT_VALUES);
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setSubmitResult(null);
    setZones([]);
    cameraService.clearDraft();
  }, [form]);

  return {
    form,
    currentStep,
    completedSteps,
    isSubmitting,
    submitResult,
    departments,
    zones,
    loadingZones,
    nextStep,
    prevStep,
    goToStep,
    handleSubmit,
    saveDraft,
    resetForm,
    loadDepartmentZones,
  };
}
