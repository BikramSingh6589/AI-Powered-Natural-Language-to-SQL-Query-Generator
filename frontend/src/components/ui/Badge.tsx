import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantMap: Record<BadgeVariant, { bg: string; color: string }> = {
  default: { bg: 'rgba(100,116,139,0.15)', color: '#64748B' },
  success: { bg: 'rgba(34,197,94,0.15)', color: '#16a34a' },
  warning: { bg: 'rgba(245,158,11,0.15)', color: '#d97706' },
  destructive: { bg: 'rgba(239,68,68,0.15)', color: '#dc2626' },
  info: { bg: 'rgba(6,182,212,0.15)', color: '#0891b2' },
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className = '', style, children, ...props }) => {
  const { bg, color } = variantMap[variant];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: bg, color, ...style }}
      {...props}
    >
      {children}
    </span>
  );
};
