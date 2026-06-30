import { type ReactNode } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const Tabs = TabsPrimitive.Root;

export function TabsList({ children }: { children: ReactNode }) {
  return (
    <TabsPrimitive.List className="flex shrink-0 items-center gap-1 border-b border-gray-200">
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'rounded-sm px-3 py-2 text-sm font-medium text-gray-500 transition-colors',
        'hover:text-gray-700',
        'data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary'
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ value, children }: { value: string; children: ReactNode }) {
  return (
    <TabsPrimitive.Content value={value} className="pt-4 focus:outline-none">
      {children}
    </TabsPrimitive.Content>
  );
}
