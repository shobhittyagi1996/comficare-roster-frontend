import { type ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

const widthClasses = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };

/**
 * Slide-in side panel used for the Department detail/edit view.
 * Z-Index sheet: --z-modal (300) for "Dark backdrop overlay, Create/Edit Form Dialog wrappers".
 * Shadow sheet: --shadow-xl for "Modals and Dialog overlays" equivalents.
 */
export default function Sheet({ open, onClose, title, subtitle, children, footer, width = 'lg' }: Props) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[300] bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed right-0 top-0 z-[300] flex h-full w-full flex-col bg-surface-white shadow-xl focus:outline-none',
            'data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right',
            widthClasses[width]
          )}
        >
          <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-6 py-4">
            <div className="min-w-0">
              <DialogPrimitive.Title className="truncate text-h6 font-semibold text-gray-800">
                {title}
              </DialogPrimitive.Title>
              {subtitle && <div className="mt-0.5 text-xs text-gray-400">{subtitle}</div>}
            </div>
            <DialogPrimitive.Close
              className="ml-3 shrink-0 rounded-sm p-1 text-gray-400 hover:bg-surface-offwhite hover:text-gray-600 focus:outline-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

          {footer && <div className="shrink-0 border-t border-gray-200 bg-surface-offwhite px-6 py-3">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
