import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90",
        destructive:
          "bg-red-400 text-neutral-50 hover:bg-red-500/90",
        outline:
          "border border-neutral-200 bg-white hover:bg-neutral-100 hover:text-neutral-900",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80",
        ghost:
          "bg-neutral-100 text-neutral-900 hover:opacity-70 transition-opacity duration-300 ease-in-out",
        link: "text-neutral-900 underline-offset-4 hover:underline",
        primary: "bg-primary-blue text-white hover:bg-primary-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
