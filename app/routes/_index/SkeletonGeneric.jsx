import { cn } from "~/lib/utils";

export default function SkeletonGeneric({ className }) {
  return (
    <div
      className={cn(
        "bg-gray-200 animate-pulse) ${className} w-full h-full animate-pulse",
        className,
      )}
    />
  );
}
