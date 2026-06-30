import { type ReactNode } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Z-Index sheet: --z-dropdown (200) for "Timeline Toolbar, contextual action menus".
 * Radius sheet: --radius-md (6px) for "Dropdown menus, Select popup options".
 */
export default function Dropdown({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button className="inline-flex h-9 items-center gap-1 rounded-sm border border-gray-300 bg-surface-white px-3 text-sm font-medium text-gray-700 hover:bg-surface-offwhite focus:outline-none">
          {label} <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={4}
          className="z-[200] w-56 rounded-md border border-gray-200 bg-surface-white py-1 shadow-md"
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

export function DropdownItem({
  onClick,
  children,
  danger,
}: {
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Item
      onSelect={onClick}
      className={cn(
        'block cursor-pointer px-3 py-2 text-sm outline-none hover:bg-surface-offwhite focus:bg-surface-offwhite',
        danger ? 'text-error' : 'text-gray-700'
      )}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
}
