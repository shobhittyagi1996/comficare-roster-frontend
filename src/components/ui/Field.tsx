import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-3 block">
      <span className="text-xs mb-1 block font-medium text-gray-600">
        {label} {required && <span className="text-error">*</span>}
      </span>
      {children}
    </label>
  );
}

/**
 * Radius sheet: --radius-lg (8px) for "Roster cards, input fields, badges".
 */
const baseInputClass =
  'w-full rounded-lg border border-gray-300 bg-surface-white px-3 py-1.5 text-sm text-gray-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-surface-offwhite disabled:text-gray-400';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(baseInputClass, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(baseInputClass, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(baseInputClass, props.className)} />;
}
