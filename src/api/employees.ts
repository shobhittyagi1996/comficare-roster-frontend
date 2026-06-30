import { apiDelete, apiGet, apiPost, apiPut } from './client';
import type { Employee, EmployeeRole, Paginated } from '@/types';

export interface EmployeeInput {
  firstName: string;
  lastName: string;
  deptId: string;
  positionId: string;
  preferredName?: string | null;
  phoneNo?: string | null;
  gender?: string | null;
  role?: EmployeeRole;
  dateFrom: string;
  user?: {
    userName: string;
    email: string;
    password: string;
  };
}

export const employeesApi = {
  list: (params?: {
    departmentId?: string;
    positionId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) => apiGet<Paginated<Employee>>('/employees', params),
  get: (id: string) => apiGet<Employee>(`/employees/${id}`),
  create: (data: EmployeeInput) => apiPost<Employee>('/employees', data),
  update: (id: string, data: Partial<EmployeeInput>) => apiPut<Employee>(`/employees/${id}`, data),
  remove: (id: string) => apiDelete(`/employees/${id}`),
};
