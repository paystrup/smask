import { cn } from "~/lib/utils";

/* eslint-disable react/prop-types */
export default function Avatar({ name, className }) {
  return (
    <div
      className={cn(
        "h-8 w-8 font-semibold text-md rounded-full flex items-center justify-center bg-black text-white leading-none",
        className,
      )}
    >
      <p>{name ? name?.charAt(0).toUpperCase() : "?"}</p>
    </div>
  );
}
