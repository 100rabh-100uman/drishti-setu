// ============================================================
// DRISHTI SETU — Access Request Service
// ============================================================

import { apiClient, API_ENDPOINTS } from '@/services/api';
import {
  AccessRequest,
  AccessRequestApprovePayload,
  AccessRequestApproveResponse,
  AccessRequestListResponse,
  AccessRequestRejectPayload,
  AccessRequestSubmitPayload,
  AccessRequestSubmitResponse,
  ActivateAccountPayload,
  ActivateAccountResponse,
  PlatformRole,
  TokenVerifyResponse,
} from '@/types/access-request';

export interface DepartmentOption {
  id: number;
  name: string;
}

interface DepartmentsApiResponse {
  departments?: DepartmentOption[];
  error?: string;
}

class AccessRequestService {
  /**
   * Submits a formal access request to the backend.
   * Public endpoint.
   */
  async submitRequest(payload: AccessRequestSubmitPayload): Promise<AccessRequestSubmitResponse> {
    return apiClient.post<AccessRequestSubmitResponse>(
      API_ENDPOINTS.ACCESS_REQUESTS.SUBMIT,
      payload
    );
  }

  /**
   * Fetches official departments from the real FastAPI /departments/ endpoint.
   */
  async getDepartments(): Promise<DepartmentOption[]> {
    try {
      const res = await apiClient.get<DepartmentsApiResponse>(API_ENDPOINTS.DEPARTMENTS.LIST);
      if (res.departments && Array.isArray(res.departments)) {
        return res.departments;
      }
      return [];
    } catch {
      // Fallback to alias if needed
      try {
        const fallbackRes = await apiClient.get<DepartmentsApiResponse>(API_ENDPOINTS.DEPARTMENTS.ALIAS_LIST);
        return fallbackRes.departments || [];
      } catch {
        return [];
      }
    }
  }

  /**
   * Admin only: List submitted access requests.
   */
  async listRequests(status?: string, departmentId?: number): Promise<AccessRequestListResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (departmentId) params.append('department_id', String(departmentId));

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ACCESS_REQUESTS.LIST}?${queryString}`
      : API_ENDPOINTS.ACCESS_REQUESTS.LIST;

    return apiClient.get<AccessRequestListResponse>(endpoint);
  }

  /**
   * Admin only: Get detail of an access request.
   */
  async getRequestDetail(requestId: string): Promise<AccessRequest> {
    return apiClient.get<AccessRequest>(API_ENDPOINTS.ACCESS_REQUESTS.DETAIL(requestId));
  }

  /**
   * Admin only: Approve an access request.
   */
  async approveRequest(requestId: string, role?: PlatformRole): Promise<AccessRequestApproveResponse> {
    const payload: AccessRequestApprovePayload = role ? { role } : {};
    return apiClient.post<AccessRequestApproveResponse>(
      API_ENDPOINTS.ACCESS_REQUESTS.APPROVE(requestId),
      payload
    );
  }

  /**
   * Admin only: Reject an access request with official reason.
   */
  async rejectRequest(requestId: string, rejectionReason: string): Promise<{ message: string; request_id: string; status: string }> {
    const payload: AccessRequestRejectPayload = { rejection_reason: rejectionReason };
    return apiClient.post<{ message: string; request_id: string; status: string }>(
      API_ENDPOINTS.ACCESS_REQUESTS.REJECT(requestId),
      payload
    );
  }

  /**
   * Public: Verifies an activation token and returns officer confirmation profile.
   */
  async verifyToken(token: string): Promise<TokenVerifyResponse> {
    return apiClient.get<TokenVerifyResponse>(
      `${API_ENDPOINTS.ACCESS_REQUESTS.VERIFY_TOKEN}?token=${encodeURIComponent(token)}`
    );
  }

  /**
   * Public: Sets user-chosen password and activates account.
   */
  async activateAccount(payload: ActivateAccountPayload): Promise<ActivateAccountResponse> {
    return apiClient.post<ActivateAccountResponse>(
      API_ENDPOINTS.ACCESS_REQUESTS.ACTIVATE,
      payload
    );
  }
}

export const accessRequestService = new AccessRequestService();
export default accessRequestService;
