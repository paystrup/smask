import { cn } from "~/lib/utils";

export default function Avatar({ name, className }) {
  return (
    <div
      className={cn(
        ",in-h-8 min-w-8 h-8 w-8 font-semibold text-sm rounded-full flex items-center justify-center bg-black text-white leading-none",
        className,
      )}
    >
      <p>{name ? name?.charAt(0).toUpperCase() : "?"}</p>
    </div>
  );
}
