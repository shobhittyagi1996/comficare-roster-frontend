import { cn } from '@/lib/utils';
import type { Employee, RosterLineItem } from '@/types';
import { TextInput } from '@/components/ui/Field';
import { avatarColor, initials } from '@/utils/colors';
import { formatMinutes, shiftDurationMinutes } from '@/utils/time';

interface Props {
  employees: Employee[];
  lineItems: RosterLineItem[];
  search: string;
  onSearchChange: (v: string) => void;
  selectedEmployeeId: string | null;
  onSelectEmployee: (id: string | null) => void;
  openShiftsSelected: boolean;
  onSelectOpenShifts: () => void;
  showDepartment?: boolean;
}

export default function EmployeeSidebar({
  employees,
  lineItems,
  search,
  onSearchChange,
  selectedEmployeeId,
  onSelectEmployee,
  openShiftsSelected,
  onSelectOpenShifts,
  showDepartment = false,
}: Props) {
  const openShiftsCount = lineItems.filter((li) => li.isOpenShift).length;

  const minutesByEmployee = new Map<string, number>();
  for (const li of lineItems) {
    if (!li.employeeId || li.isEmptyShift) continue;
    const mins = shiftDurationMinutes(li.startTime, li.endTime, li.mealBreakMinutes ?? 0);
    minutesByEmployee.set(li.employeeId, (minutesByEmployee.get(li.employeeId) ?? 0) + mins);
  }

  const filtered = employees.filter((e) =>
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="flex w-56 shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-surface-white">
      <div className="border-b border-gray-200 p-2">
        <TextInput
          placeholder="Search employee..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="text-xs"
        />
      </div>

      <button
        onClick={() => onSelectEmployee(null)}
        className={cn(
          'border-b border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide',
          !selectedEmployeeId && !openShiftsSelected ? 'bg-primary-tint text-primary' : 'text-gray-400 hover:bg-surface-offwhite'
        )}
      >
        All Employees
      </button>

      <div className="flex-1 overflow-y-auto">
        <button
          onClick={onSelectOpenShifts}
          className={cn(
            'flex w-full items-center gap-2 border-b border-gray-100 px-3 py-2.5 text-left',
            openShiftsSelected ? 'bg-info-tint' : 'hover:bg-surface-offwhite'
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-info-tint text-xs font-bold text-info">
            OS
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-gray-700">Open Shifts</div>
            <div className="text-xs text-gray-400">{openShiftsCount} shifts</div>
          </div>
        </button>

        {filtered.map((emp) => {
          const color = avatarColor(emp.id);
          const mins = minutesByEmployee.get(emp.id) ?? 0;
          const selected = selectedEmployeeId === emp.id;
          return (
            <button
              key={emp.id}
              onClick={() => onSelectEmployee(selected ? null : emp.id)}
              className={cn(
                'flex w-full items-center gap-2 border-b border-gray-100 px-3 py-2.5 text-left',
                selected ? 'bg-primary-tint' : 'hover:bg-surface-offwhite'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  color.bg,
                  color.text
                )}
              >
                {initials(emp.firstName, emp.lastName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-700">
                  {emp.firstName} {emp.lastName}
                </div>
                <div className="truncate text-xs text-gray-400">
                  {mins > 0 ? formatMinutes(mins) : '—'}
                  {showDepartment && emp.department ? ` · ${emp.department.deptName}` : ''}
                </div>
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-gray-400">No employees found</div>
        )}
      </div>
    </aside>
  );
}
