import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/helpers";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={error || undefined}
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
