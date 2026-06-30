import { cn } from '@/lib/utils';
import { toISODate } from '@/utils/date';

interface Props {
  days: Date[];
  sidebarWidth?: number;
}

const WEEKDAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Z-Index sheet: --z-sticky (100) — "Grid Date Header row (scrolls vertically but sits above lanes)". */
export default function DayStrip({ days }: Props) {
  const today = toISODate(new Date());

  return (
    <div className="sticky top-0 z-[100] flex border-b border-gray-200 bg-surface-white">
      <div className="w-44 shrink-0 border-r border-gray-200" />
      <div className="flex flex-1">
        {days.map((d) => {
          const iso = toISODate(d);
          const isToday = iso === today;
          return (
            <div
              key={iso}
              className="flex min-w-[160px] flex-1 flex-col items-center border-r border-gray-100 py-2"
            >
              <div className="text-xs font-semibold tracking-wide text-gray-400">{WEEKDAY[d.getDay()]}</div>
              <div
                className={cn(
                  'mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold',
                  isToday ? 'bg-primary text-white' : 'text-gray-700'
                )}
              >
                {d.getDate()}
              </div>
              <div className="text-xs text-gray-400">{MONTH[d.getMonth()]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
