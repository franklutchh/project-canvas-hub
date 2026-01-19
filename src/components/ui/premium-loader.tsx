import { cn } from '@/lib/utils';

interface PremiumLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PremiumLoader({ className, size = 'md' }: PremiumLoaderProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  };

  const logoSizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const ringSizes = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-6', className)}>
      <div className="relative">
        {/* Outer rotating ring */}
        <div
          className={cn(
            'absolute inset-0 rounded-full animate-spin-slow',
            ringSizes[size]
          )}
          style={{
            background: 'conic-gradient(from 0deg, transparent, hsl(265 85% 60%), transparent)',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
          }}
        />
        
        {/* Pulsing glow ring */}
        <div
          className={cn(
            'absolute rounded-full animate-pulse-ring opacity-50',
            ringSizes[size]
          )}
          style={{
            background: 'radial-gradient(circle, hsl(265 85% 60% / 0.3) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
          }}
        />

        {/* Logo container */}
        <div
          className={cn(
            'relative flex items-center justify-center rounded-2xl',
            'bg-gradient-to-br from-primary to-purple-600',
            'shadow-glow animate-pulse-glow',
            sizeClasses[size]
          )}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/20" />
          
          {/* Logo text */}
          <span
            className={cn(
              'font-bold text-white relative z-10',
              logoSizes[size]
            )}
            style={{
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            DC
          </span>
        </div>
      </div>

      {/* Loading text with shimmer */}
      <div className="text-muted-foreground text-sm font-medium overflow-hidden">
        <span className="shimmer inline-block">Carregando...</span>
      </div>
    </div>
  );
}
