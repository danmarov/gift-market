import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, suffix, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <>
        <div className="input-wrapper">
          {label && (
            <label htmlFor={inputId} className="input-label">
              {label}
            </label>
          )}

          <div className="input-container">
            {icon && <div className="input-icon">{icon}</div>}

            <input
              ref={ref}
              id={inputId}
              className={cn(
                "input-field",
                hasError ? "has-error" : "",
                icon ? "has-icon" : "",
                suffix ? "has-suffix" : "",
                className
              )}
              {...props}
            />

            {suffix && <div className="input-suffix">{suffix}</div>}
          </div>

          {error && <div className="input-error">{error}</div>}
        </div>
      </>
    );
  }
);

Input.displayName = "Input";

export default Input;
