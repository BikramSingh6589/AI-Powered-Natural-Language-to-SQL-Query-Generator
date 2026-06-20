import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, helperText, style, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1">
        <textarea
          ref={ref}
          className={`w-full px-4 py-3 text-sm rounded-xl border outline-none transition-all min-h-[120px] resize-none ${className}`}
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
Textarea.displayName = 'Textarea';
