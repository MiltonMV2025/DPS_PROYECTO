import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/frontend/lib/utils";
const alertVariants = cva(
  "rounded-lg border p-4 text-sm [&>svg]:mb-2 [&>svg]:h-5 [&>svg]:w-5",
  {
    variants: {
      variant: {
        info: "border-blue-200 bg-blue-50 text-blue-900",
        success: "border-emerald-200 bg-emerald-50 text-emerald-900",
        error: "border-red-200 bg-red-50 text-red-900",
      },
    },
    defaultVariants: { variant: "info" },
  },
);
type AlertProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants>;
export function Alert({ className, variant = "info", ...props }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-atomic="true"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}
export function AlertTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("mb-1 font-semibold leading-none", className)}
      {...props}
    />
  );
}
export function AlertDescription({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("leading-relaxed", className)} {...props} />;
}
