import * as XLSX from 'xlsx';
import type { Roster } from '@/types';

function toRow(roster: Roster, li: Roster['lineItems'][number]) {
  return {
    Department: roster.department?.deptName ?? roster.departmentId,
    Date: li.date.slice(0, 10),
    Position: li.position?.name ?? '',
    Employee: li.employee
      ? `${li.employee.firstName} ${li.employee.lastName}`
      : li.isOpenShift
      ? 'OPEN'
      : li.isEmptyShift
      ? 'EMPTY'
      : 'UNASSIGNED',
    'Start Time': li.startTime,
    'End Time': li.endTime,
    'Meal Break (min)': li.mealBreakMinutes ?? 0,
    'Shift Type': li.shiftType ?? '',
    'Open Shift': li.isOpenShift ? 'Yes' : 'No',
    'Requires Approval': li.openShiftRequiresApproval ? 'Yes' : 'No',
    Status: roster.rosterStatus,
    Comment: li.comment ?? '',
  };
}

export function exportRosterToExcel(roster: Roster) {
  const rows = roster.lineItems.map((li) => toRow(roster, li));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Roster');
  const fileName = `roster_${roster.department?.deptName ?? roster.departmentId}_${roster.startDate.slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportRostersToExcel(rosters: Roster[], rangeLabel: string) {
  const rows = rosters.flatMap((r) => r.lineItems.map((li) => toRow(r, li)));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Roster');
  XLSX.writeFile(workbook, `roster_all_locations_${rangeLabel}.xlsx`);
}
