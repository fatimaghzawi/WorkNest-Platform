import '../../../css/DesignSystem.css';

type SkeletonVariant = 'text' | 'title' | 'avatar' | 'card' | 'block';

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
}: {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}) {
  const variantClass =
    variant === 'block' ? '' : `wn-skeleton--${variant}`;

  return (
    <span
      className={`wn-skeleton ${variantClass} ${className}`.trim()}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="wn-stat-card">
      <Skeleton variant="avatar" width={40} height={40} />
      <Skeleton variant="text" width="55%" />
      <Skeleton variant="title" width="40%" />
    </div>
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="wn-stat-grid">
      {Array.from({ length: count }).map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  );
}
