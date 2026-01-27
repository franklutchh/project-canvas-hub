import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  style?: React.CSSProperties;
}

export function SkeletonCard({ className, style }: SkeletonCardProps) {
  return (
    <div
      style={style}
      className={cn(
        "rounded-2xl border bg-card/80 backdrop-blur-xl border-white/[0.08]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]",
        "p-6 space-y-4",
        className
      )}
    >
      {/* Header with color bar and title */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-1.5 rounded-full skeleton-shimmer" />
          <div className="space-y-2">
            <div className="h-5 w-32 rounded-md skeleton-shimmer" />
            <div className="h-3 w-24 rounded-md skeleton-shimmer" />
          </div>
        </div>
        <div className="h-6 w-20 rounded-full skeleton-shimmer" />
      </div>

      {/* Client info */}
      <div className="flex items-center gap-2 pt-2">
        <div className="h-4 w-4 rounded-full skeleton-shimmer" />
        <div className="h-4 w-28 rounded-md skeleton-shimmer" />
      </div>

      {/* Tags */}
      <div className="flex gap-2 pt-1">
        <div className="h-5 w-16 rounded-full skeleton-shimmer" />
        <div className="h-5 w-20 rounded-full skeleton-shimmer" />
      </div>

      {/* Footer with date and actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <div className="h-3 w-24 rounded-md skeleton-shimmer" />
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-lg skeleton-shimmer" />
          <div className="h-8 w-8 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard 
          key={i} 
          className="animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
