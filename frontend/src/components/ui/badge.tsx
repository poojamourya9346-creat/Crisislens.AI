import React from 'react';
import { cn } from '@/lib/utils';

type BadgeTone =
  | 'default'
  | 'submitted'
  | 'reviewing'
  | 'resolved'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const toneMap: Record<BadgeTone, string> = {
  default:   'bg-[#1B2433] text-[#94A3B8] border-white/[0.06]',
  submitted: 'bg-[#3B82F6]/10 text-[#60A5FA] border-[#3B82F6]/20',
  reviewing: 'bg-[#F59E0B]/10 text-[#FBBF24] border-[#F59E0B]/20',
  resolved:  'bg-[#10B981]/10 text-[#34D399] border-[#10B981]/20',
  critical:  'bg-[#DC2626]/10 text-[#F87171] border-[#DC2626]/20',
  high:      'bg-[#EF4444]/8 text-[#FB923C] border-[#EF4444]/15',
  medium:    'bg-[#F59E0B]/8 text-[#FCD34D] border-[#F59E0B]/15',
  low:       'bg-[#1B2433] text-[#94A3B8] border-white/[0.06]',
  success:   'bg-[#10B981]/10 text-[#34D399] border-[#10B981]/20',
  warning:   'bg-[#F59E0B]/10 text-[#FBBF24] border-[#F59E0B]/20',
  danger:    'bg-[#EF4444]/10 text-[#F87171] border-[#EF4444]/20',
  info:      'bg-[#3B82F6]/10 text-[#60A5FA] border-[#3B82F6]/20',
};

const dotColorMap: Record<BadgeTone, string> = {
  default:   'bg-[#94A3B8]',
  submitted: 'bg-[#3B82F6] shadow-[0_0_6px_rgba(59,130,246,0.6)]',
  reviewing: 'bg-[#F59E0B] shadow-[0_0_6px_rgba(245,158,11,0.6)]',
  resolved:  'bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.6)]',
  critical:  'bg-[#DC2626] shadow-[0_0_6px_rgba(220,38,38,0.7)] badge-critical',
  high:      'bg-[#EF4444] shadow-[0_0_6px_rgba(239,68,68,0.5)]',
  medium:    'bg-[#F59E0B] shadow-[0_0_6px_rgba(245,158,11,0.5)]',
  low:       'bg-[#94A3B8]',
  success:   'bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.6)]',
  warning:   'bg-[#F59E0B] shadow-[0_0_6px_rgba(245,158,11,0.6)]',
  danger:    'bg-[#EF4444] shadow-[0_0_6px_rgba(239,68,68,0.6)] badge-critical',
  info:      'bg-[#3B82F6] shadow-[0_0_6px_rgba(59,130,246,0.6)]',
};

export const Badge: React.FC<BadgeProps> = ({
  tone = 'default',
  children,
  className,
  dot = false,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-sm',
        toneMap[tone],
        className,
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColorMap[tone])} />
      )}
      {children}
    </span>
  );
};

export function statusTone(status: string): BadgeTone {
  if (status === 'resolved') return 'resolved';
  if (status === 'reviewing') return 'reviewing';
  return 'submitted';
}

export function riskTone(score: number): BadgeTone {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function severityTone(severity: string): BadgeTone {
  const s = severity.toLowerCase();
  if (s === 'critical') return 'critical';
  if (s === 'high') return 'high';
  if (s === 'medium') return 'medium';
  return 'low';
}
