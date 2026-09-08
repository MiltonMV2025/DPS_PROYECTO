import type { HTMLAttributes } from "react";
import { cn } from "@/frontend/lib/utils";
export function Progress({
  value,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { value: number }) {
  const normalized = Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalized}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-primary-light",
        className,
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}
