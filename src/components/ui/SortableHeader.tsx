import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortDir = 'asc' | 'desc';

interface Props<K extends string> {
  label: string;
  sortKey: K;
  activeKey: K | null;
  dir: SortDir;
  onSort: (key: K) => void;
  className?: string;
}

export default function SortableHeader<K extends string>({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  className,
}: Props<K>) {
  const active = activeKey === sortKey;
  const Icon = active ? (dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        'inline-flex items-center gap-1 text-left hover:text-gray-700',
        active ? 'text-gray-700' : 'text-gray-500',
        className
      )}
    >
      {label}
      <Icon className={cn('h-3 w-3', active ? 'opacity-100' : 'opacity-40')} />
    </button>
  );
}
