import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
};

export const SkeletonStats = () => {
  return (
    <div className="glass-card p-6 space-y-3">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
    </div>
  );
};
