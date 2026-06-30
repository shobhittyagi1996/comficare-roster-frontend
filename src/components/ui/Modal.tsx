import { type ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

/**
 * Z-Index sheet: --z-modal (300) for "Dark backdrop overlay, Create/Edit Form Dialog wrappers".
 * Radius sheet: --radius-xl (12px) for "Dialog cards, modals". Shadow: --shadow-xl.
 */
export default function Modal({ open, onClose, title, children, size = 'md' }: Props) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[300] bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-[300] w-full -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto rounded-xl bg-surface-white shadow-xl focus:outline-none',
            sizeClasses[size]
          )}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
            <DialogPrimitive.Title className="text-h6 font-semibold text-gray-800">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="rounded-sm p-1 text-gray-400 hover:bg-surface-offwhite hover:text-gray-600 focus:outline-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="p-5">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
