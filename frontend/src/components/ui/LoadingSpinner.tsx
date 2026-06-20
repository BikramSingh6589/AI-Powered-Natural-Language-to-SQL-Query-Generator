import React from 'react';
import { Loader2 } from 'lucide-react';
import { tv, type VariantProps } from 'tailwind-variants';

const spinnerVariants = tv({
  base: 'animate-spin text-primary',
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size, className, fullScreen }) => {
  const spinner = <Loader2 className={spinnerVariants({ size, className })} />;
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};
