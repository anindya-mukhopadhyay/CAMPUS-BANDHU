import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-xs font-medium text-slate">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm !text-white placeholder:text-subtle transition-colors focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30",
              icon && "pl-10",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";

