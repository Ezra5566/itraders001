'use client';

import { cn } from '@/lib/utils';
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-metallic-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 bg-white border rounded-lg text-dark-900 placeholder-metallic-400',
            'transition-all duration-200 focus:outline-none focus:ring-2',
            'disabled:bg-metallic-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-metallic-200 focus:border-primary-500 focus:ring-primary-500/20 hover:border-metallic-300',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-sm text-metallic-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
