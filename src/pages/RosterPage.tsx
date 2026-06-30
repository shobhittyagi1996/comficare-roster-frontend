import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { departmentsApi } from '@/api/departments';
import { positionsApi } from '@/api/positions';
import { employeesApi } from '@/api/employees';
import { rostersApi, type RosterLineItemInput } from '@/api/rosters';
import type { Department, Employee, Position, Roster, RosterLineItem } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Select } from '@/components/ui/Field';
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown';
import EmployeeSidebar from '@/components/roster/EmployeeSidebar';
import DayStrip from '@/components/roster/DayStrip';
import ShiftCard from '@/components/roster/ShiftCard';
import ShiftModal from '@/components/roster/ShiftModal';
import InsightsPanel from '@/components/roster/InsightsPanel';
import { TIMELINE_DAYS, addDays, generateDays, startOfWeek, toISODate } from '@/utils/date';
import { exportRostersToExcel } from '@/utils/exportExcel';
import { deleteTemplate, loadTemplates, saveTemplate, type RosterTemplate } from '@/utils/templates';
import { avatarColor, initials, positionColor } from '@/utils/colors';

type TimelineMode = '1week' | '2week' | '1month';
type GroupByMode = 'position' | 'employee';

const ALL_LOCATIONS = '';

export default function RosterPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptId, setDeptId] = useState<string>(ALL_LOCATIONS);
  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timelineMode, setTimelineMode] = useState<TimelineMode>('1week');
  const [groupBy, setGroupBy] = useState<GroupByMode>('position');
  const [anchorStart, setAnchorStart] = useState(() => startOfWeek(new Date()));
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [openShiftsSelected, setOpenShiftsSelected] = useState(false);

  const [modalState, setModalState] = useState<{
    open: boolean;
    date: string;
    positionId: string;
    presetEmployeeId: string | null;
    item: RosterLineItem | null;
  }>({ open: false, date: '', positionId: '', presetEmployeeId: null, item: null });

  const [swapSource, setSwapSource] = useState<RosterLineItem | null>(null);
  const [templates, setTemplates] = useState<RosterTemplate[]>([]);

  const isAllLocations = deptId === ALL_LOCATIONS;
  const days = useMemo(() => generateDays(anchorStart, TIMELINE_DAYS[timelineMode]), [anchorStart, timelineMode]);
  const endDate = useMemo(() => addDays(anchorStart, TIMELINE_DAYS[timelineMode] - 1), [anchorStart, timelineMode]);

  useEffect(() => {
    departmentsApi.list({ pageSize: 100 }).then((res) => {
      setDepartments(res.items.filter((d) => !d.isRootDepartment));
    });
  }, []);

  useEffect(() => {
    positionsApi.list({ departmentId: deptId || undefined, pageSize: 500 }).then((res) => setPositions(res.items));
    employeesApi.list({ departmentId: deptId || undefined, pageSize: 1000 }).then((res) => setEmployees(res.items));
    setTemplates(deptId ? loadTemplates(deptId) : []);
    setSelectedEmployeeId(null);
    setOpenShiftsSelected(false);
  }, [deptId]);

  const loadRosters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rostersApi.list({
        departmentId: deptId || undefined,
        startDate: toISODate(anchorStart),
        endDate: toISODate(endDate),
      });
      const matches = res.items.filter(
        (r) => r.startDate.slice(0, 10) === toISODate(anchorStart) && r.endDate.slice(0, 10) === toISODate(endDate)
      );
      setRosters(matches);
    } finally {
      setLoading(false);
    }
  }, [deptId, anchorStart, endDate]);

  useEffect(() => {
    loadRosters();
  }, [loadRosters]);

  const departmentsToShow = isAllLocations ? departments : departments.filter((d) => d.id === deptId);
  const positionsByDept = useMemo(() => {
    const map = new Map<string, Position[]>();
    for (const p of positions) {
      if (!map.has(p.departmentId)) map.set(p.departmentId, []);
      map.get(p.departmentId)!.push(p);
    }
    return map;
  }, [positions]);
  const employeesByDept = useMemo(() => {
    const map = new Map<string, Employee[]>();
    for (const e of employees) {
      if (!map.has(e.deptId)) map.set(e.deptId, []);
      map.get(e.deptId)!.push(e);
    }
    return map;
  }, [employees]);
  const rosterByDept = useMemo(() => new Map(rosters.map((r) => [r.departmentId, r])), [rosters]);

  async function handleCreateRoster(forDeptId: string) {
    const created = await rostersApi.create({
      departmentId: forDeptId,
      startDate: toISODate(anchorStart),
      endDate: toISODate(endDate),
    });
    setRosters((prev) => [...prev, created]);
    toast.success('Draft roster created');
  }

  function shiftPeriod(direction: 1 | -1) {
    setAnchorStart((d) => addDays(d, direction * TIMELINE_DAYS[timelineMode]));
  }

  function openCell(
    date: string,
    positionId: string | null,
    presetEmployeeId: string | null,
    item: RosterLineItem | null
  ) {
    setModalState({ open: true, date, positionId: positionId ?? '', presetEmployeeId, item });
  }

  function openAddShift() {
    const firstPosition = positions[0];
    if (!firstPosition) {
      toast.error('No areas available to schedule');
      return;
    }
    openCell(toISODate(days[0]), firstPosition.id, null, null);
  }

  async function handleSaveShift(data: RosterLineItemInput) {
    try {
      if (modalState.item) {
        await rostersApi.updateLineItem(modalState.item.rosterId, modalState.item.id, data);
        toast.success('Shift updated');
      } else {
        const position = positions.find((p) => p.id === data.positionId);
        if (!position) {
          toast.error('Select an area for this shift');
          return;
        }
        let targetRoster = rosters.find((r) => r.departmentId === position.departmentId);
        if (!targetRoster) {
          targetRoster = await rostersApi.create({
            departmentId: position.departmentId,
            startDate: toISODate(anchorStart),
            endDate: toISODate(endDate),
          });
          setRosters((prev) => [...prev, targetRoster!]);
        }
        await rostersApi.addLineItem(targetRoster.id, data);
        toast.success('Shift added');
      }
      loadRosters();
    } catch {
      // toast shown by interceptor
    }
  }

  async function handleDeleteShift() {
    if (!modalState.item) return;
    try {
      await rostersApi.removeLineItem(modalState.item.rosterId, modalState.item.id);
      toast.success('Shift deleted');
      setModalState((s) => ({ ...s, open: false }));
      loadRosters();
    } catch {
      // toast shown
    }
  }

  async function handleQuickDelete(item: RosterLineItem) {
    if (!confirm('Delete this shift?')) return;
    try {
      await rostersApi.removeLineItem(item.rosterId, item.id);
      toast.success('Shift deleted');
      loadRosters();
    } catch {
      // toast shown
    }
  }

  async function handlePublishAll() {
    const drafts = rosters.filter((r) => r.rosterStatus === 'DRAFT');
    if (drafts.length === 0) {
      toast.error('No draft rosters to publish');
      return;
    }
    try {
      await Promise.all(drafts.map((r) => rostersApi.publish(r.id)));
      toast.success(`Published ${drafts.length} roster${drafts.length > 1 ? 's' : ''}`);
      loadRosters();
    } catch {
      // toast shown
    }
  }

  async function handleCopyToNextPeriod() {
    if (rosters.length === 0) {
      toast.error('Nothing to copy');
      return;
    }
    const targetStart = toISODate(addDays(anchorStart, TIMELINE_DAYS[timelineMode]));
    try {
      await Promise.all(rosters.map((r) => rostersApi.copy(r.id, targetStart)));
      toast.success(`Copied ${rosters.length} roster${rosters.length > 1 ? 's' : ''} to week starting ${targetStart}`);
      shiftPeriod(1);
    } catch {
      // toast shown
    }
  }

  async function handleMassMarkEmpty() {
    const allItems = rosters.flatMap((r) => r.lineItems.map((li) => ({ ...li, rosterId: r.id })));
    if (allItems.length === 0) return;
    if (!confirm(`Mark all ${allItems.length} shifts as empty?`)) return;
    await Promise.all(
      allItems.map((li) => rostersApi.updateLineItem(li.rosterId, li.id, { isEmptyShift: true, employeeId: null }))
    );
    toast.success('All shifts marked empty');
    loadRosters();
  }

  async function handleMassDeleteAll() {
    const allItems = rosters.flatMap((r) => r.lineItems.map((li) => ({ ...li, rosterId: r.id })));
    if (allItems.length === 0) return;
    if (!confirm(`Delete all ${allItems.length} shifts? This cannot be undone.`)) return;
    await Promise.all(allItems.map((li) => rostersApi.removeLineItem(li.rosterId, li.id)));
    toast.success('All shifts deleted');
    loadRosters();
  }

  function handleExport() {
    if (rosters.length === 0 || rosters.every((r) => r.lineItems.length === 0)) {
      toast.error('Nothing to export');
      return;
    }
    exportRostersToExcel(rosters, toISODate(anchorStart));
  }

  async function handleSaveTemplate() {
    if (isAllLocations) {
      toast.error('Select a single location to save a template');
      return;
    }
    const roster = rosters[0];
    if (!roster || roster.lineItems.length === 0) {
      toast.error('Add shifts before saving a template');
      return;
    }
    const name = prompt('Template name?');
    if (!name) return;
    saveTemplate(name, deptId, roster.startDate, roster.lineItems);
    setTemplates(loadTemplates(deptId));
    toast.success('Template saved');
  }

  async function handleLoadTemplate(templateId: string) {
    if (isAllLocations) return;
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    let activeRoster = rosters[0];
    if (!activeRoster) {
      activeRoster = await rostersApi.create({
        departmentId: deptId,
        startDate: toISODate(anchorStart),
        endDate: toISODate(endDate),
      });
      setRosters((prev) => [...prev, activeRoster]);
    }

    await Promise.all(
      template.shifts.map((s) =>
        rostersApi.addLineItem(activeRoster!.id, {
          date: toISODate(addDays(anchorStart, s.dayOffset)),
          startTime: s.startTime,
          endTime: s.endTime,
          mealBreakMinutes: s.mealBreakMinutes,
          employeeId: s.employeeId,
          positionId: s.positionId,
          shiftType: s.shiftType,
          comment: s.comment,
          isEmptyShift: s.isEmptyShift,
          isOpenShift: s.isOpenShift,
          openShiftRequiresApproval: s.openShiftRequiresApproval,
        })
      )
    );
    toast.success(`Template "${template.name}" applied`);
    loadRosters();
  }

  function handleDeleteTemplate(id: string) {
    if (!confirm('Delete this template?')) return;
    deleteTemplate(id);
    setTemplates(loadTemplates(deptId));
  }

  function handleSwapClick(item: RosterLineItem) {
    if (item.isEmptyShift || item.isOpenShift) {
      toast.error('Can only swap assigned shifts');
      return;
    }
    if (!swapSource) {
      setSwapSource(item);
      toast('Select the second shift to swap with', { icon: '🔄' });
      return;
    }
    if (swapSource.id === item.id) {
      setSwapSource(null);
      return;
    }
    performSwap(swapSource, item);
  }

  async function performSwap(a: RosterLineItem, b: RosterLineItem) {
    try {
      await Promise.all([
        rostersApi.updateLineItem(a.rosterId, a.id, { employeeId: b.employeeId }),
        rostersApi.updateLineItem(b.rosterId, b.id, { employeeId: a.employeeId }),
      ]);
      toast.success('Shifts swapped');
      setSwapSource(null);
      loadRosters();
    } catch {
      setSwapSource(null);
    }
  }

  const allLineItems = useMemo(() => rosters.flatMap((r) => r.lineItems), [rosters]);

  const visibleLineItems = useMemo(() => {
    let items = allLineItems;
    if (openShiftsSelected) items = items.filter((i) => i.isOpenShift);
    else if (selectedEmployeeId) items = items.filter((i) => i.employeeId === selectedEmployeeId);
    return items;
  }, [allLineItems, openShiftsSelected, selectedEmployeeId]);

  const itemsByCell = useMemo(() => {
    const map = new Map<string, RosterLineItem[]>();
    for (const li of visibleLineItems) {
      const key = `${li.positionId}__${li.date.slice(0, 10)}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(li);
    }
    return map;
  }, [visibleLineItems]);

  const itemsByEmployeeCell = useMemo(() => {
    const map = new Map<string, RosterLineItem[]>();
    for (const li of visibleLineItems) {
      const key = `${li.employeeId ?? 'unassigned'}__${li.date.slice(0, 10)}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(li);
    }
    return map;
  }, [visibleLineItems]);

  const totalShifts = allLineItems.length;
  const allPublished = rosters.length > 0 && rosters.every((r) => r.rosterStatus === 'PUBLISHED');
  const unpublishedCount = rosters.filter((r) => r.rosterStatus !== 'PUBLISHED').reduce((n, r) => n + r.lineItems.length, 0);
  const kpiLabel = totalShifts === 0 ? 'No shifts yet' : allPublished ? 'All shifts published' : `${unpublishedCount} shifts unpublished`;

  const insightsRoster: Roster | null =
    rosters.length > 0
      ? {
          id: 'aggregate',
          departmentId: deptId,
          startDate: toISODate(anchorStart),
          endDate: toISODate(endDate),
          rosterStatus: allPublished ? 'PUBLISHED' : 'DRAFT',
          lineItems: allLineItems,
        }
      : null;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface-white">
      {/* Toolbar */}
      <div className="z-[200] flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-surface-white px-4 py-2.5">
        <div className="flex shrink-0 items-center gap-2 overflow-x-auto">
          <Select value={deptId} onChange={(e) => setDeptId(e.target.value)} className="w-56 shrink-0">
            <option value={ALL_LOCATIONS}>All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.deptName}
              </option>
            ))}
          </Select>

          <div className="flex h-9 shrink-0 items-center gap-1 rounded-lg border border-gray-300 bg-surface-white px-1">
            <button onClick={() => shiftPeriod(-1)} className="rounded-sm px-1.5 py-0.5 text-gray-500 hover:bg-surface-offwhite">
              ‹
            </button>
            <span className="whitespace-nowrap px-1 text-xs font-medium text-gray-700">
              {anchorStart.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' })} –{' '}
              {endDate.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <button onClick={() => shiftPeriod(1)} className="rounded-sm px-1.5 py-0.5 text-gray-500 hover:bg-surface-offwhite">
              ›
            </button>
          </div>

          <Select
            value={timelineMode}
            onChange={(e) => setTimelineMode(e.target.value as TimelineMode)}
            className="w-32 shrink-0"
          >
            <option value="1week">Week</option>
            <option value="2week">Fortnight</option>
            <option value="1month">Month</option>
          </Select>

          <Select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupByMode)}
            className="w-44 shrink-0"
          >
            <option value="position">by Position</option>
            <option value="employee">by Employee</option>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleCopyToNextPeriod}>
            Copy
          </Button>

          <Dropdown label="Insights">
            <InsightsPanel roster={insightsRoster} />
          </Dropdown>

          <Dropdown label="⋯ More">
            <DropdownItem onClick={handleExport}>📤 Export to Excel</DropdownItem>
            {!isAllLocations && <DropdownItem onClick={handleSaveTemplate}>💾 Save as Template</DropdownItem>}
            {templates.map((t) => (
              <DropdownItem key={t.id} onClick={() => handleLoadTemplate(t.id)}>
                📋 Load "{t.name}"
              </DropdownItem>
            ))}
            <DropdownItem onClick={handleMassMarkEmpty}>🗂 Mark All Shifts Empty</DropdownItem>
            <DropdownItem onClick={handleMassDeleteAll} danger>
              🗑 Delete All Shifts
            </DropdownItem>
            {templates.map((t) => (
              <DropdownItem key={`del-${t.id}`} onClick={() => handleDeleteTemplate(t.id)} danger>
                ✕ Delete Template "{t.name}"
              </DropdownItem>
            ))}
          </Dropdown>

          <Button variant="success" size="sm" onClick={handlePublishAll}>
            Publish All
          </Button>

          <Badge variant={allPublished ? 'success' : 'warning'} className="text-xs">
            {kpiLabel}
          </Badge>

          <Button size="sm" variant="success" onClick={openAddShift}>
            + Add Shift
          </Button>
        </div>
      </div>

      {swapSource && (
        <div className="bg-warning-tint px-4 py-1.5 text-xs text-warning">
          Swap mode: select another shift to swap with{' '}
          <button className="ml-2 underline" onClick={() => setSwapSource(null)}>
            cancel
          </button>
        </div>
      )}

      {/* Body: sidebar + matrix */}
      <div className="flex flex-1 overflow-hidden">
        <EmployeeSidebar
          employees={employees}
          lineItems={allLineItems}
          search={search}
          onSearchChange={setSearch}
          selectedEmployeeId={selectedEmployeeId}
          onSelectEmployee={(id) => {
            setSelectedEmployeeId(id);
            setOpenShiftsSelected(false);
          }}
          openShiftsSelected={openShiftsSelected}
          onSelectOpenShifts={() => {
            setOpenShiftsSelected((s) => !s);
            setSelectedEmployeeId(null);
          }}
          showDepartment={isAllLocations}
        />

        <div className="roster-scroll flex-1 overflow-auto bg-surface-white">
          <DayStrip days={days} />

          {loading && <div className="py-10 text-center text-gray-400">Loading roster...</div>}

          {!loading && departmentsToShow.length === 0 && (
            <div className="py-10 text-center text-gray-400">No locations found.</div>
          )}

          {!loading &&
            departmentsToShow.map((dept) => {
              const deptPositions = positionsByDept.get(dept.id) ?? [];
              const deptRoster = rosterByDept.get(dept.id);

              return (
                <div key={dept.id} className="border-b-4 border-gray-100">
                  <div
                    className={clsx(
                      'flex items-center justify-between px-3 py-1.5',
                      isAllLocations ? 'bg-gray-800' : 'border-b border-gray-200 bg-surface-offwhite'
                    )}
                  >
                    <span className={clsx('text-sm font-semibold', isAllLocations ? 'text-white' : 'text-gray-700')}>
                      {dept.deptName}
                    </span>
                    {!deptRoster && (
                      <Button size="sm" variant="secondary" onClick={() => handleCreateRoster(dept.id)}>
                        + Create Draft Roster
                      </Button>
                    )}
                  </div>

                  {groupBy === 'position' && deptPositions.length === 0 && (
                    <div className="py-6 text-center text-gray-400">No areas defined for this location yet.</div>
                  )}

                  {groupBy === 'position' &&
                    deptPositions.map((pos) => {
                      const color = positionColor(pos.id);
                      const isPublished = deptRoster?.rosterStatus === 'PUBLISHED';
                      return (
                        <div key={pos.id} className="border-b border-gray-200">
                          <div className={`flex items-center gap-2 border-b border-gray-100 px-3 py-1.5 ${color.bg}`}>
                            <span className={`text-sm font-semibold ${color.text}`}>{pos.name}</span>
                            <span className="text-xs text-gray-400">{dept.deptName}</span>
                          </div>
                          <div className="flex">
                            <div className="w-44 shrink-0 border-r border-gray-100" />
                            {days.map((d) => {
                              const key = `${pos.id}__${toISODate(d)}`;
                              const cellItems = itemsByCell.get(key) ?? [];
                              return (
                                <div
                                  key={key}
                                  className="min-w-[160px] flex-1 border-r border-gray-100 px-1.5 py-1.5 align-top"
                                >
                                  {cellItems.map((item) => (
                                    <ShiftCard
                                      key={item.id}
                                      item={item}
                                      color={color}
                                      locked={isPublished}
                                      groupBy="position"
                                      swapSelected={swapSource?.id === item.id}
                                      onClick={() => openCell(toISODate(d), pos.id, null, item)}
                                      onSwapClick={() => handleSwapClick(item)}
                                      onQuickDelete={() => handleQuickDelete(item)}
                                    />
                                  ))}
                                  <button
                                    onClick={() => openCell(toISODate(d), pos.id, null, null)}
                                    className="w-full rounded-lg border border-dashed border-gray-300 py-1 text-xs text-gray-400 hover:border-primary hover:text-primary"
                                  >
                                    + Add
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                  {groupBy === 'employee' && (employeesByDept.get(dept.id) ?? []).length === 0 && (
                    <div className="py-6 text-center text-gray-400">No employees in this location yet.</div>
                  )}

                  {groupBy === 'employee' &&
                    (employeesByDept.get(dept.id) ?? []).map((emp) => {
                      const color = avatarColor(emp.id);
                      const isPublished = deptRoster?.rosterStatus === 'PUBLISHED';
                      return (
                        <div key={emp.id} className="border-b border-gray-200">
                          <div className="flex items-center gap-2 border-b border-gray-100 bg-surface-offwhite px-3 py-1.5">
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${color.bg} ${color.text}`}
                            >
                              {initials(emp.firstName, emp.lastName)}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                              {emp.firstName} {emp.lastName}
                            </span>
                            <span className="text-xs text-gray-400">{emp.position?.name}</span>
                          </div>
                          <div className="flex">
                            <div className="w-44 shrink-0 border-r border-gray-100" />
                            {days.map((d) => {
                              const key = `${emp.id}__${toISODate(d)}`;
                              const cellItems = itemsByEmployeeCell.get(key) ?? [];
                              return (
                                <div
                                  key={key}
                                  className="min-w-[160px] flex-1 border-r border-gray-100 px-1.5 py-1.5 align-top"
                                >
                                  {cellItems.map((item) => (
                                    <ShiftCard
                                      key={item.id}
                                      item={item}
                                      color={positionColor(item.positionId ?? emp.positionId)}
                                      locked={isPublished}
                                      groupBy="employee"
                                      swapSelected={swapSource?.id === item.id}
                                      onClick={() => openCell(toISODate(d), item.positionId ?? null, emp.id, item)}
                                      onSwapClick={() => handleSwapClick(item)}
                                      onQuickDelete={() => handleQuickDelete(item)}
                                    />
                                  ))}
                                  <button
                                    onClick={() => openCell(toISODate(d), emp.positionId, emp.id, null)}
                                    className="w-full rounded-lg border border-dashed border-gray-300 py-1 text-xs text-gray-400 hover:border-primary hover:text-primary"
                                  >
                                    + Add
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              );
            })}
        </div>
      </div>

      <ShiftModal
        open={modalState.open}
        onClose={() => setModalState((s) => ({ ...s, open: false }))}
        onSave={handleSaveShift}
        onDelete={modalState.item ? handleDeleteShift : undefined}
        date={modalState.date}
        positionId={modalState.positionId}
        presetEmployeeId={modalState.presetEmployeeId}
        employees={employees}
        positions={positions}
        days={days}
        existing={modalState.item}
      />
    </div>
  );
}
