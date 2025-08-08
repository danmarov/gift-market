import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "sm",
      loading = false,
      disabled,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <>
        <button
          className={cn("btn-base", `btn-${variant}`, `btn-${size}`, className)}
          ref={ref}
          disabled={isDisabled}
          {...props}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <span className={cn("flex items-center", loading && "opacity-0")}>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
          </span>
        </button>
      </>
    );
  }
);

Button.displayName = "Button";

export default Button;
