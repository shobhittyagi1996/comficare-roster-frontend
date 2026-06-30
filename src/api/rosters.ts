import { apiDelete, apiGet, apiPost, apiPut } from './client';
import type { Roster, RosterLineItem, RosterStatus } from '@/types';

export interface RosterLineItemInput {
  date: string;
  startTime: string;
  endTime: string;
  mealBreakMinutes?: number | null;
  employeeId?: string | null;
  positionId?: string | null;
  shiftType?: string | null;
  comment?: string | null;
  isEmptyShift?: boolean;
  isOpenShift?: boolean;
  openShiftRequiresApproval?: boolean;
}

export const rostersApi = {
  list: (params?: { departmentId?: string; startDate?: string; endDate?: string }) =>
    apiGet<{ items: Roster[] }>('/rosters', params),
  get: (id: string) => apiGet<Roster>(`/rosters/${id}`),
  create: (data: { departmentId: string; startDate: string; endDate: string }) =>
    apiPost<Roster>('/rosters', data),
  updateStatus: (id: string, rosterStatus: RosterStatus) =>
    apiPut<Roster>(`/rosters/${id}`, { rosterStatus }),
  remove: (id: string) => apiDelete(`/rosters/${id}`),
  publish: (id: string) => apiPost<Roster>(`/rosters/${id}/publish`),
  copy: (id: string, targetStartDate: string) =>
    apiPost<Roster>(`/rosters/${id}/copy`, { targetStartDate }),

  addLineItem: (rosterId: string, data: RosterLineItemInput) =>
    apiPost<RosterLineItem>(`/rosters/${rosterId}/line-items`, data),
  updateLineItem: (rosterId: string, lineItemId: string, data: Partial<RosterLineItemInput>) =>
    apiPut<RosterLineItem>(`/rosters/${rosterId}/line-items/${lineItemId}`, data),
  removeLineItem: (rosterId: string, lineItemId: string) =>
    apiDelete(`/rosters/${rosterId}/line-items/${lineItemId}`),
};
