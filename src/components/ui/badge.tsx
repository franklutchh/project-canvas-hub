import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/90 text-primary-foreground shadow-glow-sm hover:bg-primary hover:shadow-glow",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/90 text-destructive-foreground hover:bg-destructive",
        outline:
          "text-foreground border-white/[0.1] bg-white/[0.03] backdrop-blur-sm",
        glass:
          "border-white/[0.1] bg-white/[0.05] backdrop-blur-xl text-foreground hover:bg-white/[0.1]",
        success:
          "border-transparent bg-success/90 text-success-foreground shadow-sm",
        warning:
          "border-transparent bg-warning/90 text-warning-foreground shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
