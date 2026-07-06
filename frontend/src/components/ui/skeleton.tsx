import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  rows?: number;
  block?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, rows = 1, block = false }) => {
  if (block) {
    return <div className={cn('skeleton', className)} />;
  }

  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'skeleton h-4',
            i === rows - 1 && rows > 1 ? 'w-3/4' : 'w-full',
            className,
          )}
        />
      ))}
    </div>
  );
};

/** Card-sized skeleton placeholder */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('rounded-2xl border border-white/[0.05] bg-[#151C28]/60 p-6 space-y-4 backdrop-blur-xl', className)}>
    <div className="flex items-center gap-3">
      <div className="skeleton h-10 w-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-3.5 w-1/2" />
      </div>
    </div>
    <div className="space-y-2 pt-2">
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-5/6" />
      <div className="skeleton h-3 w-4/6" />
    </div>
  </div>
);

/** Table row skeleton */
export const SkeletonRow: React.FC = () => (
  <tr className="border-b border-white/[0.04]">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <td key={i} className="px-4 py-4">
        <div className="skeleton h-3 w-full" />
      </td>
    ))}
  </tr>
);
