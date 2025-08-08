import React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  resize?: "none" | "vertical" | "horizontal" | "both";
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, resize = "vertical", id, ...props }, ref) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <>
        <style jsx>{`
          .textarea-wrapper {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .textarea-label {
            color: white;
            font-size: 14px;
            font-weight: 500;
          }

          .textarea-field {
            width: 100%;
            min-height: 80px;
            padding: 10px 14px;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            color: white;
            font-size: 14px;
            font-family: inherit;
            backdrop-filter: blur(4px);
            transition: all 0.2s ease;
            resize: ${resize};
          }

          .textarea-field::placeholder {
            color: rgba(255, 255, 255, 0.6);
          }

          .textarea-field:focus {
            outline: none;
            border-color: white;
            background: rgba(255, 255, 255, 0.25);
          }

          .textarea-field:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            resize: none;
          }

          .textarea-field.has-error {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
          }

          .textarea-field.has-error:focus {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.15);
          }

          .textarea-error {
            color: #ef4444;
            font-size: 12px;
            font-weight: 400;
            margin-top: 0px;
          }
        `}</style>

        <div className="textarea-wrapper">
          {label && (
            <label htmlFor={textareaId} className="textarea-label">
              {label}
            </label>
          )}

          <textarea
            ref={ref}
            id={textareaId}
            className={cn(
              "textarea-field",
              hasError ? "has-error" : "",
              className
            )}
            {...props}
          />

          {error && <div className="textarea-error">{error}</div>}
        </div>
      </>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
