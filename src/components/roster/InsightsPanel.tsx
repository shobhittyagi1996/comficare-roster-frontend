import type { Roster } from '@/types';

export default function InsightsPanel({ roster }: { roster: Roster | null }) {
  const items = roster?.lineItems ?? [];
  const published = roster?.rosterStatus === 'PUBLISHED' ? items.length : 0;
  const unpublished = roster?.rosterStatus !== 'PUBLISHED' ? items.length : 0;
  const open = items.filter((i) => i.isOpenShift && !i.openShiftRequiresApproval).length;
  const openApproval = items.filter((i) => i.isOpenShift && i.openShiftRequiresApproval).length;
  const empty = items.filter((i) => i.isEmptyShift).length;
  const assigned = items.filter((i) => !i.isEmptyShift && !i.isOpenShift && i.employeeId).length;

  const rows: { label: string; value: number; dot: string }[] = [
    { label: 'Total shifts', value: items.length, dot: 'bg-gray-400' },
    { label: 'Assigned', value: assigned, dot: 'bg-success' },
    { label: 'Published', value: published, dot: 'bg-primary' },
    { label: 'Unpublished (Draft)', value: unpublished, dot: 'bg-warning' },
    { label: 'Open', value: open, dot: 'bg-info' },
    { label: 'Open (Approval)', value: openApproval, dot: 'bg-warning' },
    { label: 'Empty', value: empty, dot: 'bg-gray-300' },
  ];

  return (
    <div className="px-3 py-2">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Roster Insights</div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between py-1 text-sm">
          <span className="flex items-center gap-2 text-gray-600">
            <span className={`h-2 w-2 rounded-full ${r.dot}`} />
            {r.label}
          </span>
          <span className="font-semibold text-gray-800">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
