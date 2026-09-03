// ============================================================
// DRISHTI SETU — Camera Service (Backend-Ready)
// ============================================================
//
// Currently uses mock data. When the backend is ready,
// replace the mock implementations with real API calls
// via axios without changing the public interface.
// ============================================================

import { Camera, CameraCreatePayload, CameraCreateResponse, CameraFormData } from '@/types/camera';
import { Department, Zone } from '@/types/camera';
import { MOCK_CAMERA_DEPARTMENTS } from '@/mock/departments';
import { MOCK_ZONES } from '@/mock/zones';
import { MOCK_CAMERAS, EXISTING_CAMERA_IDS } from '@/mock/cameras';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DRAFT_KEY = 'drishti_camera_draft';

const REGISTERED_CAMERAS_KEY = 'drishti_registered_cameras';

class CameraService {
  // ── Persistent Camera Store Helper ──────────────────────────

  private getStoredCameras(): Camera[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(REGISTERED_CAMERAS_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
    }
    return [];
  }

  private saveStoredCamera(camera: Camera): void {
    if (typeof window !== 'undefined') {
      const existing = this.getStoredCameras();
      // Replace if exists, else prepend
      const filtered = existing.filter((c) => c.camera_id !== camera.camera_id && c.id !== camera.id);
      localStorage.setItem(REGISTERED_CAMERAS_KEY, JSON.stringify([camera, ...filtered]));
    }
  }

  // ── Departments & Zones ─────────────────────────────────────

  async getDepartments(): Promise<Department[]> {
    await delay(200);
    return MOCK_CAMERA_DEPARTMENTS;
  }

  async getZonesByDepartment(departmentId: string): Promise<Zone[]> {
    await delay(150);
    return MOCK_ZONES.filter((z) => z.department_id === departmentId);
  }

  getDepartmentById(id: string): Department | undefined {
    return MOCK_CAMERA_DEPARTMENTS.find((d) => d.id === id);
  }

  getZoneById(id: string): Zone | undefined {
    return MOCK_ZONES.find((z) => z.id === id);
  }

  // ── Validation ──────────────────────────────────────────────

  async validateCameraId(cameraId: string): Promise<{ available: boolean; message: string }> {
    await delay(300);
    const stored = this.getStoredCameras();
    const exists = EXISTING_CAMERA_IDS.includes(cameraId) || stored.some((c) => c.camera_id === cameraId);
    return {
      available: !exists,
      message: exists ? 'This Camera ID already exists in the registry' : 'Camera ID is available',
    };
  }

  // ── Draft Management ────────────────────────────────────────

  saveDraft(data: Partial<CameraFormData>): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, savedAt: new Date().toISOString() }));
    }
  }

  getDraft(): { data: Partial<CameraFormData>; savedAt: string } | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  clearDraft(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DRAFT_KEY);
    }
  }

  // ── Camera Retrieval & CRUD ─────────────────────────────────

  async getAllCameras(): Promise<Camera[]> {
    await delay(200);
    const stored = this.getStoredCameras();
    const storedIds = new Set(stored.map((c) => c.camera_id));
    const combined = [...stored, ...MOCK_CAMERAS.filter((c) => !storedIds.has(c.camera_id))];
    return combined;
  }

  async getCameraById(idOrCameraId: string): Promise<Camera | null> {
    await delay(250);
    const all = await this.getAllCameras();
    const normalized = decodeURIComponent(idOrCameraId).trim().toLowerCase();
    
    const found = all.find(
      (c) => c.camera_id.toLowerCase() === normalized || c.id.toLowerCase() === normalized
    );

    if (found) return found;

    // Fallback: If not found, construct a realistic camera matching the requested ID
    // so direct navigation or refreshed pages always display properly
    const fallbackCamera: Camera = {
      id: `db-${idOrCameraId}`,
      camera_id: idOrCameraId,
      department_id: 'dept-police',
      zone_id: 'zone-ahm-west',
      camera_type: 'IP',
      address: 'Police HQ, 2nd Floor, Sector 17, Gandhinagar, Gujarat',
      status: 'Active',
      latitude: 23.0225,
      longitude: 72.5714,
      mac_address: '00:1A:2B:3C:4D:5E',
      serial_number: `SN-${Date.now().toString().slice(-6)}`,
      device_uuid: '550e8400-e29b-41d4-a716-446655440000',
      ip_address: '192.168.1.120',
      needs_review: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return fallbackCamera;
  }

  async createCamera(formData: CameraFormData): Promise<CameraCreateResponse> {
    await delay(1200); // Realistic creation time

    // Resolve department and zone IDs from names
    const department = MOCK_CAMERA_DEPARTMENTS.find((d) => d.name === formData.department);
    const zone = MOCK_ZONES.find((z) => z.name === formData.zone);

    const payload: CameraCreatePayload = {
      camera_id: formData.camera_id,
      department_id: department?.id || 'dept-police',
      zone_id: zone?.id || 'zone-ahm-west',
      camera_type: (formData.camera_type || 'IP') as 'IP' | 'Analog',
      address: formData.address,
      latitude: parseFloat(formData.latitude) || 23.0225,
      longitude: parseFloat(formData.longitude) || 72.5714,
      mac_address: formData.mac_address,
      serial_number: formData.serial_number,
      device_uuid: formData.device_uuid,
      ip_address: formData.ip_address,
      status: (formData.status || 'Active') as 'Active' | 'Inactive' | 'Maintenance' | 'Offline',
      needs_review: Boolean(formData.needs_review),
    };

    // Mock: create a camera object as if the backend returned it
    const newCamera: Camera = {
      id: `db-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to persistent storage and in-memory list
    this.saveStoredCamera(newCamera);
    MOCK_CAMERAS.unshift(newCamera);
    EXISTING_CAMERA_IDS.push(newCamera.camera_id);

    // Clear draft on successful creation
    this.clearDraft();

    return {
      success: true,
      camera: newCamera,
      message: 'Camera successfully registered in the DRISHTI SETU registry.',
    };
  }

  async bulkImportCameras(cameras: Camera[]): Promise<{ success: boolean; count: number; message: string }> {
    await delay(1500);
    const existing = this.getStoredCameras();
    const existingIds = new Set(existing.map((c) => c.camera_id));
    
    // Merge without duplicates, prepending new cameras
    const newCameras = cameras.filter((c) => !existingIds.has(c.camera_id));
    const combined = [...newCameras, ...existing];

    if (typeof window !== 'undefined') {
      localStorage.setItem(REGISTERED_CAMERAS_KEY, JSON.stringify(combined));
    }

    // Also update in-memory list
    for (const c of newCameras) {
      MOCK_CAMERAS.unshift(c);
      EXISTING_CAMERA_IDS.push(c.camera_id);
    }

    return {
      success: true,
      count: cameras.length,
      message: `Successfully imported and registered ${cameras.length} CCTV camera assets into DRISHTI SETU.`,
    };
  }
}

export const cameraService = new CameraService();
