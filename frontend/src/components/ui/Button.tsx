import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'default' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  default: { backgroundColor: '#4F46E5', color: '#fff' },
  secondary: { backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)' },
  ghost: { backgroundColor: 'transparent', color: 'var(--text-primary)' },
  danger: { backgroundColor: '#EF4444', color: '#fff' },
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-10 px-5 py-2 text-sm',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-12 px-7 text-base',
  icon: 'h-10 w-10 p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', isLoading, children, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${sizeClasses[size]} ${className}`}
        style={{ ...variantStyles[variant], ...style }}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
