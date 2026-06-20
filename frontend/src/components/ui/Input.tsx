import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, helperText, style, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1">
        <input
          ref={ref}
          className={`w-full h-10 px-4 text-sm rounded-xl border outline-none transition-all ${className}`}
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: error ? '#EF4444' : 'var(--border)',
            color: 'var(--text-primary)',
            ...style,
          }}
          {...props}
        />
        {helperText && (
          <span className="text-xs" style={{ color: error ? '#EF4444' : 'var(--text-secondary)' }}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
