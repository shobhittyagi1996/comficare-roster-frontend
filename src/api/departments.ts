import { apiDelete, apiGet, apiPost, apiPut } from './client';
import type { Department, Paginated } from '@/types';

export interface DepartmentInput {
  deptName: string;
  description?: string | null;
  startDate: string;
  parentDeptId?: string | null;
  isRootDepartment?: boolean;
  status?: string;
  timezone?: string | null;
  address?: {
    addressLine1: string;
    addressLine2?: string;
    district?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
}

export const departmentsApi = {
  list: (params?: { search?: string; page?: number; pageSize?: number }) =>
    apiGet<Paginated<Department>>('/departments', params),
  get: (id: string) => apiGet<Department>(`/departments/${id}`),
  create: (data: DepartmentInput) => apiPost<Department>('/departments', data),
  update: (id: string, data: Partial<DepartmentInput>) =>
    apiPut<Department>(`/departments/${id}`, data),
  remove: (id: string) => apiDelete(`/departments/${id}`),
};
