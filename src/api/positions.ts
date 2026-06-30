import { apiDelete, apiGet, apiPost, apiPut } from './client';
import type { Paginated, Position } from '@/types';

export interface PositionInput {
  departmentId: string;
  name: string;
  description?: string | null;
  status?: string;
  reportToId?: string | null;
  isHead?: boolean;
  dateFrom: string;
}

export const positionsApi = {
  list: (params?: { departmentId?: string; search?: string; page?: number; pageSize?: number }) =>
    apiGet<Paginated<Position>>('/positions', params),
  get: (id: string) => apiGet<Position>(`/positions/${id}`),
  create: (data: PositionInput) => apiPost<Position>('/positions', data),
  update: (id: string, data: Partial<PositionInput>) => apiPut<Position>(`/positions/${id}`, data),
  remove: (id: string) => apiDelete(`/positions/${id}`),
};
