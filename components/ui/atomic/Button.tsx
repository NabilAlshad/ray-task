import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/helpers";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          {
            "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm":
              variant === "primary",
            "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500":
              variant === "secondary",
            "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm":
              variant === "danger",

            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 py-2 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
