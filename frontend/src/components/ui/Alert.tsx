import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

type AlertVariant = 'default' | 'error' | 'success' | 'warning' | 'info';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
}

const variantMap: Record<AlertVariant, { bg: string; color: string; border: string; Icon: React.ElementType }> = {
  default: { bg: 'var(--bg)', color: 'var(--text-primary)', border: 'var(--border)', Icon: Info },
  error: { bg: 'rgba(239,68,68,0.08)', color: '#dc2626', border: 'rgba(239,68,68,0.25)', Icon: XCircle },
  success: { bg: 'rgba(34,197,94,0.08)', color: '#16a34a', border: 'rgba(34,197,94,0.25)', Icon: CheckCircle2 },
  warning: { bg: 'rgba(245,158,11,0.08)', color: '#d97706', border: 'rgba(245,158,11,0.25)', Icon: AlertCircle },
  info: { bg: 'rgba(6,182,212,0.08)', color: '#0891b2', border: 'rgba(6,182,212,0.25)', Icon: Info },
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = '', variant = 'default', title, children, style, ...props }, ref) => {
    const { bg, color, border, Icon } = variantMap[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-xl border p-4 flex gap-3 ${className}`}
        style={{ backgroundColor: bg, borderColor: border, color, ...style }}
        {...props}
      >
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          {title && <h5 className="font-semibold text-sm">{title}</h5>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';
