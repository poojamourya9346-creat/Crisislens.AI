import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'default' | 'outline' | 'ghost' | 'link' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'default' | string;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  loading = false,
  className = '',
  disabled,
  children,
  ...rest
}) => {
  const base =
    'relative inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F17] disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer overflow-hidden';

  const variants: Record<string, string> = {
    default:
      'bg-[#F8FAFC] text-[#0B0F17] shadow-[0_1px_2px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.05)_inset] hover:bg-white hover:shadow-[0_4px_16px_rgba(248,250,252,0.2)] active:bg-[#CBD5E1] rounded-xl',
    primary:
      'bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white shadow-[0_4px_16px_rgba(59,130,246,0.35),0_1px_0_rgba(255,255,255,0.15)_inset] hover:from-[#60A5FA] hover:to-[#3B82F6] hover:shadow-[0_8px_24px_rgba(59,130,246,0.4)] active:from-[#2563EB] active:to-[#1D4ED8] border border-[#3B82F6]/30 rounded-xl',
    secondary:
      'bg-[#1B2433] text-[#CBD5E1] border border-white/[0.07] shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:bg-[#1F2D40] hover:text-white hover:border-white/[0.12] rounded-xl',
    success:
      'bg-gradient-to-b from-[#10B981] to-[#059669] text-white shadow-[0_4px_16px_rgba(16,185,129,0.3),0_1px_0_rgba(255,255,255,0.15)_inset] hover:from-[#34D399] hover:to-[#10B981] border border-[#10B981]/30 rounded-xl',
    danger:
      'bg-gradient-to-b from-[#EF4444] to-[#DC2626] text-white shadow-[0_4px_16px_rgba(239,68,68,0.3),0_1px_0_rgba(255,255,255,0.15)_inset] hover:from-[#F87171] hover:to-[#EF4444] border border-[#EF4444]/30 rounded-xl',
    outline:
      'border border-white/[0.08] bg-white/[0.03] text-[#94A3B8] shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:bg-white/[0.06] hover:text-white hover:border-white/[0.14] hover:shadow-[0_4px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(59,130,246,0.1)] rounded-xl',
    ghost:
      'text-[#94A3B8] hover:bg-white/[0.05] hover:text-white rounded-xl',
    link:
      'text-[#60A5FA] underline-offset-4 hover:underline hover:text-[#93C5FD] p-0 h-auto shadow-none rounded-none',
  };

  const sizes: Record<string, string> = {
    xs:      'h-7 px-3 text-[10px] rounded-lg',
    sm:      'h-8 px-3.5 text-xs rounded-lg',
    default: 'h-10 px-5 text-sm',
    md:      'h-10 px-5 text-sm',
    lg:      'h-12 px-7 text-[15px] rounded-2xl',
  };

  const variantClass = variants[variant] ?? variants.default;
  const sizeClass    = sizes[size] ?? sizes.default;

  return (
    <button
      className={cn(base, variantClass, sizeClass, className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
};
