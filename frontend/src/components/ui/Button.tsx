import React, { useRef } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

/* ─── Per-variant colour tokens ─────────────────────────────────────── */
const variantTokens: Record<
  ButtonVariant,
  { base: string; ripple1: string; ripple2: string; text: string; border?: string }
> = {
  default: {
    base: '#4F46E5',
    ripple1: '#5D55EE',
    ripple2: '#6B63F3',
    text: '#ffffff',
  },
  secondary: {
    base: '#06B6D4',
    ripple1: '#14C4E2',
    ripple2: '#22D3EE',
    text: '#ffffff',
  },
  outline: {
    base: 'transparent',
    ripple1: 'rgba(79,70,229,0.12)',
    ripple2: 'rgba(79,70,229,0.20)',
    text: '#4F46E5',
    border: '#4F46E5',
  },
  ghost: {
    base: 'transparent',
    ripple1: 'rgba(79,70,229,0.08)',
    ripple2: 'rgba(79,70,229,0.14)',
    text: 'var(--text-primary)',
  },
  danger: {
    base: '#EF4444',
    ripple1: '#F05252',
    ripple2: '#F26060',
    text: '#ffffff',
  },
};

/* ─── Size classes ───────────────────────────────────────────────────── */
const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-10 px-5 text-sm',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-12 px-7 text-base',
  icon: 'h-10 w-10 p-0',
};

/* ─── Global keyframes injected once ────────────────────────────────── */
const STYLE_ID = '__btn-ripple-keyframes__';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes btn-ripple-in {
      from { transform: translateX(-101%); }
      to   { transform: translateX(0%);   }
    }
    @keyframes btn-ripple-out {
      from { transform: translateX(0%);   }
      to   { transform: translateX(101%); }
    }
    @keyframes btn-scale-in {
      0%   { transform: scaleX(1)    scaleY(1);    }
      30%  { transform: scaleX(1.04) scaleY(0.97); }
      60%  { transform: scaleX(0.98) scaleY(1.01); }
      100% { transform: scaleX(1)    scaleY(1);    }
    }
    @keyframes btn-scale-out {
      0%   { transform: scaleX(1.03) scaleY(0.98); }
      40%  { transform: scaleX(0.98) scaleY(1.01); }
      100% { transform: scaleX(1)    scaleY(1);    }
    }
  `;
  document.head.appendChild(s);
}

/* ─── Component ─────────────────────────────────────────────────────── */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'default',
      size = 'default',
      isLoading,
      children,
      style,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const tokens = variantTokens[variant];
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const ripple1Ref = useRef<HTMLSpanElement>(null);
    const ripple2Ref = useRef<HTMLSpanElement>(null);
    const animatingRef = useRef(false);

    /* Combine forwarded ref + internal ref */
    const setRef = (el: HTMLButtonElement | null) => {
      btnRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
    };

    const startAnimation = (node: HTMLSpanElement | null, direction: 'in' | 'out', delay = 0) => {
      if (!node) return;
      node.style.animation = 'none';
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      node.offsetHeight; // force reflow
      const name = direction === 'in' ? 'btn-ripple-in' : 'btn-ripple-out';
      node.style.animation = `${name} 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`;
    };

    const scaleButton = (dir: 'in' | 'out') => {
      const el = btnRef.current;
      if (!el) return;
      el.style.animation = 'none';
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetHeight;
      el.style.animation = `${dir === 'in' ? 'btn-scale-in' : 'btn-scale-out'} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both`;
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (animatingRef.current) return;
      animatingRef.current = true;
      scaleButton('in');
      startAnimation(ripple1Ref.current, 'in', 0);
      startAnimation(ripple2Ref.current, 'in', 0.12);
      setTimeout(() => { animatingRef.current = false; }, 800);
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      scaleButton('out');
      startAnimation(ripple1Ref.current, 'out', 0.08);
      startAnimation(ripple2Ref.current, 'out', 0);
      onMouseLeave?.(e);
    };

    const isIconSize = size === 'icon';

    return (
      <button
        ref={setRef}
        className={`
          relative inline-flex items-center justify-center font-semibold
          overflow-hidden cursor-pointer select-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4F46E5]
          disabled:pointer-events-none disabled:opacity-50
          active:scale-[0.96] transition-[box-shadow,opacity] duration-150
          ${isIconSize ? 'rounded-xl' : 'rounded-2xl'}
          ${sizeClasses[size]}
          ${className}
        `}
        style={{
          backgroundColor: tokens.base,
          color: tokens.text,
          border: tokens.border ? `1.5px solid ${tokens.border}` : undefined,
          boxShadow:
            variant === 'default' || variant === 'secondary' || variant === 'danger'
              ? `0 4px 18px -4px ${tokens.base}88`
              : undefined,
          willChange: 'transform',
          ...style,
        }}
        disabled={isLoading || props.disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Ripple layer 1 */}
        <span
          ref={ripple1Ref}
          aria-hidden
          style={{
            position: 'absolute',
            inset: '-1px',
            borderRadius: 'inherit',
            backgroundColor: tokens.ripple1,
            transform: 'translateX(-101%)',
            pointerEvents: 'none',
          }}
        />
        {/* Ripple layer 2 */}
        <span
          ref={ripple2Ref}
          aria-hidden
          style={{
            position: 'absolute',
            inset: '-1px',
            borderRadius: 'inherit',
            backgroundColor: tokens.ripple2,
            transform: 'translateX(-101%)',
            pointerEvents: 'none',
          }}
        />

        {/* Actual content sits above ripples */}
        <span
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
