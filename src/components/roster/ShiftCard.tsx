import { cn } from '@/lib/utils';
import type { RosterLineItem } from '@/types';
import { formatTimeRange } from '@/utils/time';

interface Props {
  item: RosterLineItem;
  color: { bg: string; border: string; text: string };
  locked: boolean;
  onClick: () => void;
  onSwapClick: () => void;
  onQuickDelete: () => void;
  swapSelected: boolean;
  /** 'position' (default) shows the employee name as the main label; 'employee' shows the area/position name instead, since the row already identifies the employee. */
  groupBy?: 'position' | 'employee';
}

/**
 * Radius sheet: --radius-lg (8px) for "Roster cards, input fields, badges".
 * Shadow sheet: --shadow-sm for "subtle lift for cards"; --shadow-md when active (swap-selected).
 * Status colors: Open -> info, Open+Approval -> warning, Empty -> neutral, Locked -> success.
 */
export default function ShiftCard({
  item,
  color,
  locked,
  onClick,
  onSwapClick,
  onQuickDelete,
  swapSelected,
  groupBy = 'position',
}: Props) {
  const isOpen = item.isOpenShift;
  const isEmpty = item.isEmptyShift;
  const needsApproval = isOpen && item.openShiftRequiresApproval;

  return (
    <div
      className={cn(
        'group relative mb-1.5 w-full rounded-lg border px-2 py-1.5 text-left text-xs shadow-sm transition-shadow hover:shadow-md',
        swapSelected && 'ring-2 ring-warning',
        isEmpty && 'border-gray-300 bg-surface-offwhite text-gray-500',
        isOpen && needsApproval && 'border-dashed border-warning bg-warning-tint text-warning',
        isOpen && !needsApproval && 'border-dashed border-info bg-info-tint text-info',
        !isOpen && !isEmpty && `${color.border} ${color.bg} ${color.text}`
      )}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onQuickDelete();
        }}
        className="absolute right-1 top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full text-xs text-error hover:bg-error-tint group-hover:flex"
        title="Delete shift"
      >
        ✕
      </button>

      <button onClick={onClick} className="block w-full text-left">
        <div className="flex items-center justify-between gap-1 pr-4">
          <span className="font-semibold">{formatTimeRange(item.startTime, item.endTime)}</span>
          {!isEmpty && !isOpen && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onSwapClick();
              }}
              className="hidden opacity-70 hover:opacity-100 group-hover:inline"
              title="Swap with another shift"
            >
              🔄
            </span>
          )}
        </div>

        <div className="mt-0.5 truncate">
          {isEmpty
            ? 'Empty'
            : isOpen
            ? needsApproval
              ? 'Open · Approval'
              : 'Open'
            : groupBy === 'employee'
            ? item.position?.name ?? 'Unassigned area'
            : item.employee
            ? `${item.employee.firstName} ${item.employee.lastName}`
            : 'Unassigned'}
        </div>

        <div className="mt-1 flex items-center gap-1">
          {locked && (
            <span className="rounded-pill bg-success-tint px-1.5 py-0.5 text-xs font-medium text-success">
              🔒 Locked
            </span>
          )}
          {isOpen && (
            <span
              className={cn(
                'rounded-pill px-1.5 py-0.5 text-xs font-medium',
                needsApproval ? 'bg-warning-tint text-warning' : 'bg-info-tint text-info'
              )}
            >
              {needsApproval ? 'Open (Approval)' : 'Open'}
            </span>
          )}
          {item.comment && <span title={item.comment}>📝</span>}
        </div>
      </button>
    </div>
  );
}
