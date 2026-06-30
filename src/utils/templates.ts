import type { RosterLineItem } from '@/types';

export interface RosterTemplate {
  id: string;
  name: string;
  departmentId: string;
  // dayOffset = number of days from the roster's startDate this shift falls on
  shifts: {
    dayOffset: number;
    startTime: string;
    endTime: string;
    mealBreakMinutes?: number | null;
    employeeId?: string | null;
    positionId?: string | null;
    shiftType?: string | null;
    comment?: string | null;
    isEmptyShift: boolean;
    isOpenShift: boolean;
    openShiftRequiresApproval: boolean;
  }[];
}

const STORAGE_KEY = 'roster_templates_v1';

export function loadTemplates(departmentId: string): RosterTemplate[] {
  const all: RosterTemplate[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  return all.filter((t) => t.departmentId === departmentId);
}

export function saveTemplate(name: string, departmentId: string, startDate: string, lineItems: RosterLineItem[]) {
  const all: RosterTemplate[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const start = new Date(startDate).getTime();
  const template: RosterTemplate = {
    id: crypto.randomUUID(),
    name,
    departmentId,
    shifts: lineItems.map((li) => ({
      dayOffset: Math.round((new Date(li.date).getTime() - start) / 86400000),
      startTime: li.startTime,
      endTime: li.endTime,
      mealBreakMinutes: li.mealBreakMinutes,
      employeeId: li.employeeId,
      positionId: li.positionId,
      shiftType: li.shiftType,
      comment: li.comment,
      isEmptyShift: li.isEmptyShift,
      isOpenShift: li.isOpenShift,
      openShiftRequiresApproval: li.openShiftRequiresApproval,
    })),
  };
  all.push(template);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return template;
}

export function deleteTemplate(id: string) {
  const all: RosterTemplate[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all.filter((t) => t.id !== id)));
}
