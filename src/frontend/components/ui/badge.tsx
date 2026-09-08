import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/frontend/lib/utils";
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        success: "border-emerald-200 bg-emerald-50 text-emerald-800",
        info: "border-blue-200 bg-blue-50 text-blue-800",
        error: "border-red-200 bg-red-50 text-red-800",
      },
    },
    defaultVariants: { variant: "info" },
  },
);
export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;
export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
