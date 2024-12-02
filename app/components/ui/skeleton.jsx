import { cn } from "~/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
