import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Status color sheet (Colors): success/warning/error/info, each with a
 * solid variant (text/border) and a tint variant (background).
 * Radius sheet: --radius-pill (9999px) for "Fully rounded pill badges".
 */
const badgeVariants = cva('inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-semibold', {
  variants: {
    variant: {
      success: 'bg-success-tint text-success',
      warning: 'bg-warning-tint text-warning',
      error: 'bg-error-tint text-error',
      info: 'bg-info-tint text-info',
      primary: 'bg-primary-tint text-primary',
      neutral: 'bg-surface-offwhite text-gray-500',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export default function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
