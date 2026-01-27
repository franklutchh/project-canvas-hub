import { cn } from "@/lib/utils";

interface SkeletonStatCardProps {
  className?: string;
  delay?: number;
}

function SkeletonStatCard({ className, delay = 0 }: SkeletonStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card/80 backdrop-blur-xl border-white/[0.08]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]",
        "p-6 animate-fade-in",
        className
      )}
      style={{ animationDelay: `${delay}ms` } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded-md skeleton-shimmer" />
          <div className="h-8 w-16 rounded-md skeleton-shimmer" />
        </div>
        <div className="h-12 w-12 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SkeletonStatCard delay={0} />
      <SkeletonStatCard delay={50} />
      <SkeletonStatCard delay={100} />
      <SkeletonStatCard delay={150} />
    </div>
  );
}
